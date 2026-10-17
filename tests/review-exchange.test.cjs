const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const base=path.resolve(__dirname,'..');
const load=f=>fs.readFileSync(path.join(base,f),'utf8');
const X=require('../review-exchange-core.js');
const reason='The archived event counts alone do not confirm clinical eligibility; inspect full methods.';
const rows=()=>X.ROWS.map(x=>({id:x.id,decision:'unclear',reason,fullTextChecked:false}));
const rule='Eligible randomised trial publications with suspect acute MI, magnesium arm, mortality outcome and verified full-text follow-up.';
const date='2026-10-17T09:00:00.000Z';
const make=(name,entries=rows())=>X.makePack(name,entries,date,rule);
const distinct=()=>{
 const A=make('Reviewer A');
 const b=rows();b[0].decision='include';b[0].reason='This archive row looks relevant, subject to a complete original full-text check.';
 b[1].decision='include';b[1].reason='Independent inclusion pending review of primary source and design details.';
 return [A,make('Reviewer B',b)];
};

test('exact source-bound six historical records, no invented patient-level outcomes',()=>{
 assert.equal(X.DATASET,'metadat.dat.egger2001.selected-1-2-3-6-14-16');
 assert.equal(X.SOURCE,'https://wviechtb.github.io/metadat/reference/dat.egger2001.html');
 assert.deepEqual(X.ROWS.map(r=>r.id),[1,2,3,6,14,16]);
 assert.deepEqual(X.ROWS.map(r=>r.a),[1,9,2,1,90,2216]);
 assert.deepEqual(X.ROWS.map(r=>r.c),[2,23,7,9,118,2103]);
 assert.deepEqual(X.ROWS.map(r=>r.n1),[40,135,200,59,1159,29011]);
 assert.deepEqual(X.ROWS.map(r=>r.n0),[36,135,200,56,1157,29039]);
 assert.deepEqual([...X.CHOICES],['include','exclude','unclear']);
});

test('review exports preserve all independent reasons, schema and source identity',()=>{
 const p=make('Reviewer A');
 assert.equal(p.type,X.TYPE);assert.equal(p.source,X.SOURCE);
 assert.equal(p.declaredIndependent,true);
 assert.deepEqual(p.decisions.map(x=>x.id),[1,2,3,6,14,16]);
 assert.equal(X.validatePack(JSON.stringify(p)).authorLabel,'Reviewer A');
 assert.equal(X.validatePack(p).rule,rule);
 assert.equal(p.decisions.every(x=>x.fullTextChecked===false),true);
 const reordered=make('Reviewer A',rows().reverse());
 assert.deepEqual(reordered.decisions.map(x=>x.id),[1,2,3,6,14,16]);
});
test('malformed files, duplicate or missing decisions, false independence and mismatched data fail closed',()=>{
 const p=make('Reviewer A');
 assert.throws(()=>X.makePack('A',rows(),date,rule),/reviewer label/);
 assert.throws(()=>X.makePack('Reviewer A',rows(),date,'short'),/eligibility question/);
 assert.throws(()=>X.makePack('Reviewer A',rows().slice(0,5),date,rule),/Exactly six/);
 assert.throws(()=>X.makePack('Reviewer A',rows().map((x,i)=>({...x,id:i===5?1:x.id})),date,rule),/duplicate/);
 assert.throws(()=>X.makePack('Reviewer A',rows().map((x,i)=>({...x,decision:i===2?'positive':x.decision})),date,rule),/Decision/);
 assert.throws(()=>X.makePack('Reviewer A',rows().map((x,i)=>({...x,fullTextChecked:i===3?null:false})),date,rule),/full-text/);
 assert.throws(()=>X.makePack('Reviewer A',rows().map((x,i)=>({...x,reason:i===0?'guess':x.reason})),date,rule),/substantive/);
 assert.throws(()=>X.validatePack({...p,dataset:'wrong'}),/Wrong schema/);
 assert.throws(()=>X.validatePack({...p,source:'other'}),/Wrong schema/);
 assert.throws(()=>X.validatePack({...p,declaredIndependent:false}),/independent/);
 assert.throws(()=>X.validatePack('broken JSON'),/Invalid JSON/);
 assert.throws(()=>X.compare(p,{...p,authorLabel:'REVIEWER A'}),/labels must differ/);
});
test('two independent packs report disagreements, confusion matrix, and descriptive kappa correctly',()=>{
 const [a,b]=distinct(),result=X.compare(a,b);
 assert.equal(result.rows.length,6);
 assert.equal(result.agreed,4);
 assert.equal(result.disagreements,2);
 assert.equal(result.observed,4/6);
 assert.ok(Math.abs(result.expected-4/6)<1e-12);
 assert.ok(Math.abs(result.kappa)<1e-12);
 assert.equal(result.matrix[2][0],2);
 assert.equal(result.matrix[2][2],4);
 assert.equal(result.rows.filter(x=>x.disagree).length,2);
 const allAgree=X.compare(a,make('Reviewer C'));
 assert.equal(allAgree.kappa,null,'Undefined when all choices are identical and expected agreement is one');
 assert.equal(allAgree.disagreements,0);
});
test('adjudication never silently resolves a disagreement and creates source-linked safe Markdown',()=>{
 const comparison=X.compare(...distinct());
 const items=rows().map((row,i)=>({...row,decision:i===0?'include':'unclear',
  reason:i===0?'Source review pending <external>, comparison must not be labelled verified | probable.':reason}));
 assert.throws(()=>X.finalise(comparison,items.slice(0,5),'Human editor'),/Exactly six/);
 assert.throws(()=>X.finalise(comparison,items,'X'),/adjudicator/);
 const audit=X.finalise(comparison,items,'Adjudicator Test');
 assert.equal(audit.type,'SYNTHESIS_ADJUDICATION_V1');
 assert.equal(audit.rows[0].final,'include');
 assert.equal(audit.rows[0].disagree,true);
 assert.equal(audit.rows[0].reasonB.length>12,true);
 assert.equal(audit.rows.every(x=>x.finalReason.length>=12),true);
 const md=X.markdown(audit);
 for(const phrase of ['Two','Cohen','Six selected','Reviewer A','Adjudicator Test']){
   if(phrase!=='Two')assert.ok(md.includes(phrase),phrase);
 }
 assert.match(md,/&lt;external&gt;/);
 assert.match(md,/\\\| probable/);
 assert.match(md,/not authenticate identities/i);
 assert.match(md,/not a prospectively registered review/i);
});
function dom(){
 const d=new JSDOM(load('review-exchange.html'),{url:'https://example.test/review-exchange.html',runScripts:'outside-only',pretendToBeVisual:true});
 d.window.eval(load('review-exchange-core.js'));d.window.eval(load('review-exchange.js'));return d;
}
test('reviewer UI renders six records and refuses premature export',()=>{
 const d=dom(),w=d.window,doc=w.document;
 assert.equal(doc.querySelectorAll('#reviewCards [data-study-id]').length,6);
 assert.equal(doc.getElementById('compareResults').hidden,true);
 doc.getElementById('exportReview').click();
 assert.match(doc.getElementById('reviewStatus').textContent,/Cannot export yet/);
 assert.match(doc.body.textContent,/not authenticate/i);
 const cards=doc.querySelectorAll('#reviewCards [data-study-id]');
 for(const card of cards){
  card.querySelector('select').value='unclear';
  card.querySelector('textarea').value=reason;
 }
 doc.getElementById('reviewerLabel').value='Reviewer Test';
 doc.getElementById('eligibilityRule').value=rule;
 let fileCount=0;
 w.URL.createObjectURL=()=>{fileCount++;return 'blob:review';};
 w.URL.revokeObjectURL=()=>{};
 w.HTMLAnchorElement.prototype.click=function(){};
 doc.getElementById('exportReview').click();
 assert.equal(fileCount,1);
 assert.match(doc.getElementById('reviewStatus').textContent,/exported locally/);
 w.close();
});
test('two-file import, adjudication, exports and edit invalidation work with no server',async()=>{
 const d=dom(),w=d.window,doc=w.document;
 const [a,b]=distinct();
 const inputs=[doc.getElementById('reviewFileA'),doc.getElementById('reviewFileB')];
 const packs=[a,b];
 for(let i=0;i<2;i++){
  const contents=JSON.stringify(packs[i]);
  const fake={size:contents.length,text:async()=>contents};
  Object.defineProperty(inputs[i],'files',{configurable:true,value:[fake]});
 }
 doc.getElementById('comparePacks').click();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(doc.getElementById('compareResults').hidden,false);
 assert.match(doc.getElementById('agreementSummary').textContent,/4\/6 agreements; 2 disagreements/);
 assert.equal(doc.querySelectorAll('#adjudicationRows .adjudication-card').length,6);
 assert.equal(doc.querySelectorAll('#adjudicationRows [data-disagreement=true]').length,2);
 doc.getElementById('buildAudit').click();
 assert.match(doc.getElementById('auditStatus').textContent,/incomplete/i);
 doc.getElementById('adjudicatorLabel').value='Adjudicator Jane';
 for(const card of doc.querySelectorAll('#adjudicationRows .adjudication-card')){
  card.querySelector('select').value='unclear';
  card.querySelector('textarea').value='Review primary publication before any true inclusion judgement';
 }
 doc.getElementById('buildAudit').click();
 assert.equal(doc.getElementById('downloadAuditJson').disabled,false);
 assert.equal(doc.getElementById('downloadAuditMd').disabled,false);
 doc.querySelector('#adjudicationRows .final-reason').value='Edited after audit';
 doc.querySelector('#adjudicationRows .final-reason').dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.equal(doc.getElementById('downloadAuditMd').disabled,true);
 doc.getElementById('buildAudit').click();
 assert.equal(doc.getElementById('downloadAuditMd').disabled,false);
 w.close();
});
test('course entrypoints and the comparative evidence report label limits transparently',()=>{
 const page=load('review-exchange.html');
 assert.match(load('research-studio.html'),/href="review-exchange.html"/);
 assert.match(load('index.html'),/href="review-exchange.html"/);
 assert.match(page,/two distinct people/i);
 assert.match(page,/English pilot/i);
 assert.match(page,/not authenticate/i);
 const benchmark=load('COURSE_BENCHMARK_MULTIPERSONA_REVIEW_2026.md');
 for(const provider of ['Cochrane Interactive Learning','Campbell Collaboration','JBI Comprehensive','Covidence Academy','Oxford Centre']){
  assert.ok(benchmark.includes(provider));
 }
 assert.match(benchmark,/No real external methodologist/i);
 assert.match(benchmark,/no cross-provider total score/i);
});
