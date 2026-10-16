const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),load=x=>fs.readFileSync(path.join(root,x),'utf8');
const core=require('../research-studio-core.js');
const mag=require('../magnesium-reversal-data.js');
const shared={window:{}};vm.runInNewContext(load('small-meta-data.js'),shared);
const deps={MagnesiumReversal:mag,SYNTHESIS_REAL_DATA:shared.window.SYNTHESIS_REAL_DATA};
const HINE_SOURCE='https://wviechtb.github.io/metadat/reference/dat.hine1989.html';

test('source trial rows and small chronological snapshots remain accurate and explicit',()=>{
 const rows=core.records(deps);
 assert.deepEqual(rows.map(x=>x.id),[1,2,3,6,14,16]);
 assert.deepEqual(rows.map(x=>x.year),[1984,1986,1986,1989,1992,1995]);
 assert.deepEqual(rows.map(x=>x.numerator),[1,9,2,1,90,2216]);
 assert.deepEqual(rows.map(x=>x.controlEvents),[2,23,7,9,118,2103]);
 const snaps=core.snapshots(deps);
 assert.deepEqual(snaps.map(x=>x.year),[1986,1989,1992,1995]);
 assert.deepEqual(snaps.map(x=>x.k),[3,4,5,6]);
 assert.ok(snaps.every(x=>x.lower>0&&x.lower<x.or&&x.or<x.upper));
 assert.ok(Math.abs(snaps[3].or-1.0279954951)<1e-8);
 assert.match(snaps[0].note,/Retrospective classroom selection/);
 assert.equal(core.MAG_URL,'https://wviechtb.github.io/metadat/reference/dat.egger2001.html');
});
test('Hine real trial-arm data transfer reproduces published six-study risk difference',()=>{
 const studies=core.hinesRows(deps);
 assert.equal(studies.length,6);
 assert.deepEqual(Array.from(studies,s=>s.events),[2,4,6,7,7,11]);
 assert.deepEqual(Array.from(studies,s=>s.controlEvents),[1,4,4,5,3,4]);
 assert.deepEqual(Array.from(studies,s=>s.n),[39,44,107,103,110,154]);
 assert.deepEqual(Array.from(studies,s=>s.controlN),[43,44,110,100,106,146]);
 const pooled=core.hines(deps,[1,2,3,4,5,6]);
 assert.ok(Math.abs(pooled.rd-0.029444320344763953)<1e-12);
 assert.ok(Math.abs(pooled.lower-0.003830889)<1e-7);
 assert.ok(Math.abs(pooled.upper-0.05505775)<1e-7);
 const csv=core.handoffCsv(deps,[1,2,3,4,5,6]);
 assert.equal(csv.split('\n').length,8); // header, six rows, terminal newline
 assert.match(csv,/^label,est,se\n/);
 assert.match(csv,/"O'Brien et al\."/);
 assert.equal(core.HINE_URL,HINE_SOURCE);
});
test('ma-studies-v1 handoff checks scale, same origin, pre-existing data and browser refusal',()=>{
 const ids=[1,2,3,4,5,6],p=core.busPayload(deps,ids,'2026-10-16T00:00:00.000Z');
 assert.equal(p._schema,'ma-studies-v1');assert.equal(p.studies.length,6);
 assert.equal(p.studies[0].est,core.hinesRows(deps)[0].est);
 assert.equal(p.studies[0].se,core.hinesRows(deps)[0].se);
 assert.ok(p.studies.every(x=>Number.isFinite(x.est)&&x.se>0&&x.year===null));
 const data=new Map();
 const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>{data.set(k,v);}};
 assert.equal(core.stageBus(storage,'localhost','/synthesis-courses/research-studio.html',false,p).code,'different-origin');
 assert.equal(data.size,0);
 assert.equal(core.stageBus(storage,'mahmood726-cyber.github.io','/other-project/',false,p).code,'different-origin');
 const first=core.stageBus(storage,'mahmood726-cyber.github.io','/synthesis-courses/research-studio.html',false,p);
 assert.equal(first.ok,true);assert.equal(first.replaced,false);
 const before=data.get(core.BUS_KEY);
 const other=core.busPayload(deps,[1,2],'2026-10-17T00:00:00.000Z');
 assert.equal(core.stageBus(storage,'mahmood726-cyber.github.io','/synthesis-courses/',false,other).code,'occupied');
 assert.equal(data.get(core.BUS_KEY),before,'must not silently overwrite');
 assert.equal(core.stageBus(storage,'mahmood726-cyber.github.io','/synthesis-courses/',true,other).ok,true);
 assert.equal(JSON.parse(data.get(core.BUS_KEY)).studies.length,2);
 assert.equal(core.stageBus({getItem(){throw Error('denied')},setItem(){}},'mahmood726-cyber.github.io','/synthesis-courses/',false,p).code,'storage-unavailable');
 assert.equal(core.stageBus(storage,'mahmood726-cyber.github.io','/synthesis-courses/',false,{_schema:'wrong',studies:[]}).code,'invalid');
 assert.throws(()=>core.hines(deps,[1]));assert.throws(()=>core.busPayload(deps,[1,999]));
 assert.throws(()=>core.handoffCsv(deps,[1]));
});
test('AllMeta catalog routes are repository-grounded; no silent fabricated destination URL',()=>{
 const expected={
  protocol:'/allmeta/protocols/',screen:'/allmeta/screen/index.html',forest:'/allmeta/forest-plot/index.html',
  workbench:'/allmeta/workbench/index.html',heterogeneity:'/allmeta/heterogeneity/index.html',
  influence:'/allmeta/influence/index.html',webr:'/allmeta/webr-studio/index.html',
  rob:'/allmeta/rob2/index.html',grade:'/allmeta/grade-sof/index.html',prisma:'/allmeta/prisma-flow/index.html',
  cumulative:'/allmeta/cumulative-subgroup/index.html',evidenceos:'/allmeta/evidenceos/'
 };
 assert.deepEqual(Object.fromEntries(core.APPS.map(x=>[x.id,x.path])),expected);
 assert.equal(core.APPS.filter(x=>x.mode==='bus').length,5);
 assert.ok(core.APPS.every(x=>x.path.startsWith('/allmeta/')));
 assert.match(load('ALLMETA_COURSE_INTEGRATION.md'),/effect label .Risk difference. and null 0/);
});
test('screening pass B is structurally separate from pass A and adjudication cannot be skipped',()=>{
 const s=core.fresh(),r=core.records(deps);
 assert.equal(core.screenPassComplete(s.screening.A,r),false);
 r.forEach((t,i)=>{
  s.screening.A[t.id]={decision:'unclear',reason:'Need original methods and follow-up'};
  s.screening.B[t.id]={decision:i===0?'include':'unclear',reason:'Source abstract alone is insufficient'};
 });
 assert.equal(core.screenPassComplete(s.screening.A,r),true);
 assert.equal(core.screenPassComplete(s.screening.B,r),true);
 let rec=core.reconcile(s.screening,r);
 assert.equal(rec.disagreements,1);assert.equal(rec.complete,false);
 for(const row of rec.rows)s.screening.final[row.id]={decision:'unclear',reason:'Final review requires original publication'};
 rec=core.reconcile(s.screening,r);assert.equal(rec.complete,true);
 assert.equal(core.completion(s,deps).screen,true);
 assert.equal(core.screenPassComplete({1:{decision:'include',reason:'brief'}},r),false);
});
test('peer review gives domain-specific feedback and requires corrected answers before stage mastery',()=>{
 const s=core.fresh();
 const wrong=core.challenge('a1',0),right=core.challenge('a1',1);
 assert.equal(wrong.correct,false);assert.equal(wrong.skill,'analysis');
 assert.equal(right.correct,true);assert.match(right.explain,/null 0/);
 for(const q of core.CHALLENGES)s.review.answers[q.id]=q.answer;
 assert.equal(core.completion(s,deps).review,true);
 s.review.answers.r1=0;
 assert.equal(core.completion(s,deps).review,false);
 const recommendations=core.recommend({analysis:3,screening:1,reporting:0});
 assert.equal(recommendations[0].skill,'analysis');
 assert.ok(recommendations[0].url.includes('/allmeta/'));
 assert.throws(()=>core.challenge('a1',99));assert.throws(()=>core.challenge('unknown',1));
});
test('research dossier retains audit trail, distinctions and honest limitations even while incomplete',()=>{
 const s=core.fresh();s.protocol={pico:'Adults suspected acute MI compare intravenous magnesium with no magnesium treatment',inclusion:'Check original publications and keep the prespecified mortality follow-up',outcome:'Deaths at prespecified follow up with appropriately chosen effect measure',locked:true};
 s.living.revealed.push(1995);s.living.predictions[1995]='uncertain';
 s.stats.inspected=true;
 s.capstone.interpretation='This is a teaching subset; it is not the published full 16-record clinical review. Sources need independent inspection.';
 let d=core.dossier(s,deps);
 for(const str of ['metadat::dat.hine1989','Learner interpretation','selected six rows','Peto','not certified','Risk difference','1995','Risk difference:'])assert.match(d,new RegExp(str,'i'));
 s.stats.selected=[1];assert.match(core.dossier(s,deps),/not yet calculable/i,'draft export should work with incomplete analysis');
 assert.match(d,/AllMeta handoff: study RD/);
});
function make(url='https://mahmood726-cyber.github.io/synthesis-courses/research-studio.html?lang=fr'){
 const dom=new JSDOM(load('research-studio.html'),{url,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;
 for(const file of ['small-meta-data.js','magnesium-reversal-data.js','research-studio-core.js','research-studio.js'])w.eval(load(file));
 return dom;
}
test('full DOM workflow: freeze protocol, independent A/B passes, reconcile, predict, run RD, challenge and save a capstone',()=>{
 const dom=make(),w=dom.window,d=w.document;
 assert.match(d.getElementById('languageStatus').textContent,/not been translated or reviewed/);
 assert.match(d.getElementById('protocolFeedback').textContent,/before starting/);
 const p={
  pico:'Adults after suspected acute MI assigned magnesium versus usual control for death',
  inclusion:'Randomised controlled trials after searching original publications and following protocol',
  outcome:'All-cause deaths at a prespecified timepoint using an appropriate effect measure'
 };
 for(const [id,v] of Object.entries(p))d.getElementById(id).value=v;
 d.getElementById('lockProtocol').click();
 assert.equal(d.getElementById('pico').disabled,true);
 for(const pass of ['A','B']){
  for(let i=0;i<6;i++){
   assert.match(d.getElementById('screenPhase').textContent,new RegExp('Reviewer '+pass));
   d.getElementById('screenChoice').value=pass==='B'&&i===0?'include':'unclear';
   d.getElementById('screenReason').value='Original full text required before eligibility verdict';
   d.getElementById('recordScreen').click();
   if(pass==='B')assert.doesNotMatch(d.getElementById('screenPhase').textContent,/Reviewer A decisions/);
  }
 }
 assert.match(d.getElementById('screenPhase').textContent,/Adjudication/);
 assert.match(d.getElementById('screenPhase').textContent,/1 disagreements/);
 for(const record of core.records(deps)){
  const card=d.querySelector('#adjudication [data-id="'+record.id+'"]');
  card.querySelector('select').value='unclear';
  card.querySelector('textarea').value='Check original paper before deciding clinical eligibility';
  card.querySelector('button').click();
 }
 assert.match(d.getElementById('screenFeedback').textContent,/ledger complete/);
 for(const year of [1986,1989,1992,1995]){
  d.getElementById('livingYear').value=String(year);
  d.getElementById('livingYear').dispatchEvent(new w.Event('change',{bubbles:true}));
  d.getElementById('livingPrediction').value='uncertain';
  d.getElementById('revealLiving').click();
 }
 assert.equal(d.querySelectorAll('#livingTable tr').length,4);
 assert.match(d.getElementById('livingTable').textContent,/1995/);
 d.getElementById('calculateHine').click();
 assert.match(d.getElementById('hineResult').textContent,/RD 0\.029444/);
 assert.equal(d.querySelectorAll('#hinePicks input:checked').length,6);
 const first=d.querySelector('#hinePicks input');
 first.checked=false;first.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.match(d.getElementById('hineResult').textContent,/Choose at least two/);
 first.checked=true;first.dispatchEvent(new w.Event('change',{bubbles:true}));
 d.getElementById('calculateHine').click();
 for(const q of core.CHALLENGES){
  const choice=q.answer;
  d.querySelector('button[data-question="'+q.id+'"][data-answer="'+choice+'"]').click();
 }
 for(const [id,v] of [['capInterpretation','The six selected magnesium records illustrate an odds ratio model while the separate Hine rows yield an absolute risk difference. They must not be pooled together.'],
 ['capLimitations','Eligibility still depends on original trials, risk of bias, heterogeneity, clinical generalisability, follow-up timing, searching and unreported outcomes.'],
 ['capNext','Retrieve original publications, reproduce the statistical script against pinning of R package versions, then compare honest model settings within AllMeta.']]){
  d.getElementById(id).value=v;
  d.getElementById(id).dispatchEvent(new w.Event('input',{bubbles:true}));
 }
 d.getElementById('saveCapstone').click();
 const saved=JSON.parse(w.localStorage.getItem('synthesis_research_studio_v1'));
 assert.equal(saved.capstone.saved,true);
 assert.equal(d.getElementById('progressMeter').getAttribute('aria-valuenow'),'6');
 assert.match(d.getElementById('capstoneFeedback').textContent,/self-assessed/);
 const state=JSON.parse(w.localStorage.getItem('synthesis_research_studio_v1'));
 assert.equal(core.completion(state,deps).capstone,true);
 w.close();
});
test('AllMeta handoff in browser requires explicit overwrite and does not touch unrelated progress',()=>{
 const dom=make('https://mahmood726-cyber.github.io/synthesis-courses/research-studio.html'),w=dom.window,d=w.document;
 w.localStorage.setItem('synthesis_mission_lab_v1','{"untouched":true}');
 d.getElementById('stageAllMeta').click();
 let bus=JSON.parse(w.localStorage.getItem('ma-studies-v1'));
 assert.equal(bus._schema,'ma-studies-v1');assert.equal(bus.studies.length,6);
 assert.match(d.getElementById('handoffFeedback').textContent,/Staged 6 Hine RD rows/);
 const original=JSON.stringify(bus);w.confirm=()=>false;
 d.querySelector('#hinePicks input[value="1"]').checked=false;
 d.querySelector('#hinePicks input[value="1"]').dispatchEvent(new w.Event('change',{bubbles:true}));
 d.getElementById('stageAllMeta').click();
 assert.equal(w.localStorage.getItem('ma-studies-v1'),original,'cancel must preserve AllMeta data');
 w.confirm=()=>true;
 d.getElementById('stageAllMeta').click();
 bus=JSON.parse(w.localStorage.getItem('ma-studies-v1'));
 assert.equal(bus.studies.length,5);
 d.getElementById('resetStudio').click();d.getElementById('resetStudio').click();
 assert.equal(JSON.parse(w.localStorage.getItem('ma-studies-v1')).studies.length,5,'reset must not erase AllMeta bus');
 assert.equal(w.localStorage.getItem('synthesis_mission_lab_v1'),'{"untouched":true}');
 w.close();
});
test('English Studio station is embedded from six modules across all existing 12 language routes',async()=>{
 const code=load('research-studio-integration.js');
 assert.match(load('lesson-workshops.js'),/research-studio-integration\.js/);
 const languages=['en','ar','de','es','fr','hi','it','ja','ko','pt','ru','zh'];
 for(const lang of languages){
  const suffix=lang==='en'?'':'-'+lang;
  const modules=[1,4,7,8,9,24].map(id=>'<div class="module-slides" data-module="'+id+'"><div class="slide lesson-workshop-slide">Original practice slide</div><div class="slide">Original lesson</div></div>').join('');
  const dom=new JSDOM('<html><head></head><body>'+modules+'</body></html>',{
   url:'https://example.test/synthesis-course'+suffix+'.html',runScripts:'outside-only',pretendToBeVisual:true});
  dom.window.updateSlideDisplay=()=>{};
  dom.window.eval(code);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  const slides=dom.window.document.querySelectorAll('.lesson-research-studio-slide');
  assert.equal(slides.length,6,lang);
  assert.deepEqual(Array.from(slides,x=>x.dataset.researchStation),['protocol','screen','living','stats','review','capstone']);
  assert.equal(dom.window.document.querySelectorAll('.lesson-workshop-slide').length,6);
  if(lang!=='en')assert.match(slides[0].textContent,/not translated or professionally method-reviewed/i);
  const frame=slides[2].querySelector('iframe');
  assert.equal(frame.getAttribute('src'),null);
  slides[2].classList.add('active');
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(frame.getAttribute('src'),new RegExp('station=living&lang='+lang));
  dom.window.close();
 }
});
test('discoverability, honest research claims and source documentation are present',()=>{
 assert.match(load('index.html'),/href="research-studio.html"/);
 assert.match(load('mission-lab.html'),/href="research-studio.html"/);
 assert.match(load('ALLMETA_COURSE_INTEGRATION.md'),/checked against the GitHub default-branch catalog/);
 assert.match(load('research-studio.html'),/not a registered or complete living systematic review/i);
 assert.match(load('research-studio.html'),/not scientifically adjudicated|not accredited/i);
 assert.doesNotMatch(load('research-studio.html'),/quran\.com|Qur.anic|scripture/i);
});
