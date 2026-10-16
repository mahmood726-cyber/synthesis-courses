const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const load=x=>fs.readFileSync(path.join(root,x),'utf8');
const core=require('../evidence-arena-core.js');
const page=load('evidence-arena.html');
function make(caseId='magnesium',lang='en'){
 const dom=new JSDOM(page,{url:'https://example.test/evidence-arena.html?case='+caseId+'&lang='+lang,
   runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;
 for(const file of ['small-meta-data.js','evidence-story-lab.js','magnesium-reversal-data.js',
  'evidence-arena-core.js','evidence-arena.js'])w.eval(load(file));
 return dom;
}
test('all three cases are existing source-grounded, small-k demonstrations, not fabricated clinical cases',()=>{
 const dom=make(),d=dom.window.document,api=dom.window.SynthesisArenaCore.build(dom.window);
 assert.deepEqual(Array.from(api.cases,x=>x.id),['magnesium','bcg','lidocaine']);
 assert.deepEqual(Array.from(api.cases,x=>x.archiveCount),[16,13,6]);
 assert.deepEqual(Array.from(api.cases,x=>x.unit),['OR','RR','RD']);
 assert.match(api.rows('magnesium')[0].counts,/1\/40 magnesium vs 2\/36 control/);
 assert.match(api.rows('bcg')[0].counts,/TB cases: 4\/123 vaccinated vs 11\/139 control/);
 assert.match(api.rows('lidocaine')[0].counts,/2\/39 lidocaine vs 1\/43 control/);
 for(const c of api.cases){
   assert.ok(api.rows(c.id).length===6);
   assert.ok(c.sourceUrl.startsWith('https://wviechtb.github.io/'));
   assert.ok(c.reference.startsWith('scripts/verify_'));
   assert.ok(c.episode.includes('teaching')||c.episode.includes('instructional')||c.episode.includes('influence'));
 }
 for(const script of ['evidence-arena.html','evidence-arena.js','evidence-arena-core.js']){
   assert.doesNotMatch(load(script),/quran\.com|Qur.an verse|religious teaching/i);
 }
 assert.match(d.body.textContent,/not.*clinical/i);
 dom.window.close();
});
test('numerical references and directional changes agree with previously verified R cases',()=>{
 const dom=make(),A=dom.window.SynthesisArenaCore.build(dom.window);
 const checks=[
  ['magnesium',.6223062354,1.0279954951,'toward',.96791136,1.09180942],
  ['bcg',.4052281051,.6591100685,'toward'],
  ['lidocaine',.02381354547248,.02944432034476,'away',.003830889,.05505775]
 ];
 for(const [name,before,after,direction,lo,hi] of checks){
   const desc=A.describe(name);
   assert.equal(desc.move,direction);
   assert.ok(Math.abs(desc.before.estimate-before)<1e-7,name+' baseline');
   assert.ok(Math.abs(desc.after.estimate-after)<1e-7,name+' final');
   if(lo!==undefined)assert.ok(Math.abs(desc.after.low-lo)<.0000002,name+' interval lo');
   if(hi!==undefined)assert.ok(Math.abs(desc.after.high-hi)<.0000002,name+' interval hi');
 }
 dom.window.close();
});
test('study toggles and all 57 two-to-six subsets per real dataset are numeric and guarded',()=>{
 const dom=make(),A=dom.window.SynthesisArenaCore.build(dom.window);
 for(const c of A.cases){
   const rows=A.rows(c.id);
   let n=0;
   for(let mask=0;mask<(1<<rows.length);mask++){
     const ids=rows.filter((_,i)=>(mask&(1<<i))!==0).map(x=>x.id);
     if(ids.length<2)continue;
     const r=A.analyse(c.id,ids);n++;
     assert.equal(r.k,ids.length);
     assert.ok(Number.isFinite(r.estimate)&&Number.isFinite(r.low)&&Number.isFinite(r.high));
     assert.ok(r.low<r.estimate&&r.estimate<r.high);
     assert.ok(c.nullValue===0||r.low>0);
   }
   assert.equal(n,57);
   assert.throws(()=>A.analyse(c.id,[rows[0].id]));
   assert.throws(()=>A.analyse(c.id,[rows[0].id,rows[0].id]));
   assert.throws(()=>A.analyse(c.id,[1,9999]));
 }
 dom.window.close();
});
test('prediction is precommitted, incorrect peer claim triggers remediation, writing is not auto-certified',()=>{
 const dom=make('magnesium'),w=dom.window,d=w.document;
 assert.equal(d.getElementById('analysisStage').hidden,true);
 assert.equal(d.getElementById('reviewStage').hidden,true);
 d.getElementById('commitButton').click();
 assert.match(d.getElementById('commitFeedback').textContent,/Select both/);
 d.querySelector('input[name=scope][value=report]').click();
 d.querySelector('input[name=prediction][value=toward]').click();
 d.getElementById('commitButton').click();
 assert.equal(d.getElementById('analysisStage').hidden,false);
 assert.equal(d.querySelector('input[name=prediction][value=toward]').disabled,true);
 assert.match(d.getElementById('numericResult').textContent,/0\.622/);
 d.getElementById('showCandidate').click();
 assert.equal(d.getElementById('reviewStage').hidden,false);
 assert.match(d.getElementById('numericResult').textContent,/1\.028/);
 assert.ok(d.querySelector('#comparisonPlot svg[role=img]'));
 d.querySelector('button[data-verdict=certify]').click();
 assert.equal(d.getElementById('reportStage').hidden,true);
 assert.match(d.getElementById('reviewFeedback').textContent,/cannot certify/);
 d.querySelector('button[data-verdict=transparent]').click();
 assert.equal(d.getElementById('reportStage').hidden,false);
 d.getElementById('saveReport').click();
 assert.match(d.getElementById('reportFeedback').textContent,/Continue drafting/);
 const note='In the selected six-row Peto example the estimate crosses the no-effect value. '+
  'The archived data are incomplete for clinical recommendation and we must audit eligibility, timings and bias.';
 d.getElementById('editorialNote').value=note;
 d.getElementById('editorialNote').dispatchEvent(new w.Event('input',{bubbles:true}));
 for(const input of d.querySelectorAll('.audit input')){
   input.checked=true;input.dispatchEvent(new w.Event('change',{bubbles:true}));
 }
 d.getElementById('saveReport').click();
 const saved=JSON.parse(w.localStorage.getItem('synthesis_evidence_arena_v1'));
 assert.equal(saved.magnesium.completed,true);
 assert.equal(saved.magnesium.checks.length,5);
 assert.match(d.getElementById('reportFeedback').textContent,/not.*expert|needs expert assessment/i);
 assert.match(d.getElementById('progressText').textContent,/1\/3/);
 const dossier=w.SynthesisArenaCore.build(w).exportText('magnesium',saved.magnesium);
 assert.match(dossier,/not certified/i);
 assert.match(dossier,/0\.622/);
 assert.match(dossier,/1\.028/);
 assert.match(dossier,/Source:/);
 assert.ok(dossier.includes(note));
 w.close();
});
test('each case saves independently and supports a two-click non-destructive reset',()=>{
 const dom=make('bcg','fr'),w=dom.window,d=w.document;
 assert.match(d.getElementById('languageState').textContent,/not.*professionally translated or reviewed/i);
 d.querySelector('input[name=scope][value=exclude]').click();
 d.querySelector('input[name=prediction][value=away]').click();
 d.getElementById('commitButton').click();
 assert.match(d.getElementById('commitFeedback').textContent,/not a defensible eligibility rule/);
 d.getElementById('showCandidate').click();
 assert.match(d.getElementById('numericResult').textContent,/0\.659/);
 d.querySelector('button[data-case=lidocaine]').click();
 assert.equal(d.getElementById('analysisStage').hidden,true);
 d.querySelector('button[data-case=bcg]').click();
 assert.equal(d.getElementById('analysisStage').hidden,false);
 d.getElementById('resetCase').click();
 assert.equal(d.getElementById('analysisStage').hidden,false);
 assert.match(d.getElementById('resetCase').textContent,/Confirm reset/);
 d.getElementById('resetCase').click();
 assert.equal(d.getElementById('analysisStage').hidden,true);
 assert.equal(JSON.parse(w.localStorage.getItem('synthesis_evidence_arena_v1')).bcg,undefined);
 w.close();
});
test('shared lesson script inserts source-specific English pilot investigations across all 12 routes',async()=>{
 const script=load('evidence-arena-integration.js');
 assert.match(load('lesson-workshops.js'),/evidence-arena-integration\.js/);
 for(const lang of ['en','ar','de','es','fr','hi','it','ja','ko','pt','ru','zh']){
  const suffix=lang==='en'?'':'-'+lang;
  const html='<html><head></head><body>'+[3,7,22].map(id=>
    '<section class="module-slides" data-module="'+id+'"><div class="slide lesson-workshop-slide">Existing source-linked exercise</div>'+
    '<div class="slide">Existing lesson content</div></section>').join('')+'</body></html>';
  const dom=new JSDOM(html,{url:'https://example.test/synthesis-course'+suffix+'.html',
    runScripts:'outside-only',pretendToBeVisual:true});
  dom.window.updateSlideDisplay=()=>{};
  dom.window.eval(script);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  const d=dom.window.document;
  assert.equal(d.querySelectorAll('.lesson-arena-slide').length,3,lang);
  assert.equal(d.querySelectorAll('.lesson-workshop-slide').length,3);
  assert.equal(d.querySelectorAll('.module-slides').length,3);
  if(lang!=='en')assert.match(d.querySelector('.lesson-arena-slide').textContent,/not translated or methodologically reviewed/);
  const slides=d.querySelectorAll('.lesson-arena-slide');
  assert.deepEqual(Array.from(slides,x=>x.dataset.arenaCase),['bcg','magnesium','lidocaine']);
  const frame=slides[1].querySelector('iframe');
  assert.equal(frame.getAttribute('src'),null);
  slides[1].classList.add('active');
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(frame.getAttribute('src'),new RegExp('case=magnesium&lang='+lang));
  dom.window.close();
 }
});
