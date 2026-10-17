const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const scope={window:{}};vm.runInNewContext(read('small-meta-data.js'),scope);
const mag=require('../magnesium-reversal-data.js');
const real=scope.window.SYNTHESIS_REAL_DATA;
const engine=require('../guided-start-core.js').build({SYNTHESIS_REAL_DATA:real,MagnesiumReversal:mag});
function dom(lang='en'){
 const d=new JSDOM(read('guided-start.html'),{
  url:'https://example.test/guided-start.html?lang='+lang,runScripts:'outside-only',pretendToBeVisual:true
 });
 for(const src of ['small-meta-data.js','magnesium-reversal-data.js','guided-start-core.js','guided-start.js'])
   d.window.eval(read(src));
 return d;
}
test('six documented source-linked tasks use genuine R package data and explicit boundaries',()=>{
 assert.equal(engine.tasks.length,6);
 assert.deepEqual(engine.tasks.map(x=>x.skill),[
  'provenance','calculation','sensitivity','interpretation','estimand','dependence']);
 assert.deepEqual(engine.tasks.map(x=>x.id),[
  'source','riskdifference','influence','heterogeneity','estimand','dependence']);
 assert.ok(engine.tasks.every(t=>t.source.startsWith('https://wviechtb.github.io/metadat/reference/dat.')));
 assert.match(engine.task('source').text,/2 deaths among 39/);
 assert.match(engine.task('source').text,/1 among 43/);
 assert.match(engine.task('dependence').text,/five trials/i);
 assert.match(engine.task('dependence').text,/ten outcome measurements/i);
 assert.match(engine.task('influence').text,/five deliberately selected Hine records/i);
 assert.match(read('guided-start.html'),/No clinical recommendations/);
 assert.doesNotMatch(read('guided-start.html'),/quran.com|scripture|religious verse/i);
});
test('single-trial RD, pooled Hine RD and heterogeneity reproduce pinned source values',()=>{
 assert.ok(Math.abs(engine.benchmarks.singleRD-(2/39-1/43))<1e-12);
 assert.ok(Math.abs(engine.benchmarks.sixRD-0.029444320344763953)<1e-11);
 assert.ok(engine.benchmarks.fiveRD<engine.benchmarks.sixRD);
 assert.equal(engine.benchmarks.sixI2,0);
 assert.equal(engine.benchmarks.berkeyTrials,5);
 assert.equal(engine.assess('riskdifference','0.028').correct,true);
 assert.equal(engine.assess('riskdifference','2.8').correct,false,'percentage point not decimal');
 assert.equal(engine.assess('riskdifference','').correct,false);
 assert.equal(engine.assess('riskdifference','NaN').correct,false);
 assert.equal(engine.assess('riskdifference','Infinity').correct,false);
 assert.equal(engine.assess('influence',0).correct,true);
 assert.equal(engine.assess('heterogeneity',1).correct,true);
 assert.equal(engine.assess('estimand',1).correct,true);
 assert.equal(engine.assess('dependence',1).correct,true);
 assert.throws(()=>engine.assess('unknown',0));
});
test('first-attempt misconceptions determine documented exercises and are not competence certificates',()=>{
 const responses={
  source:{firstCorrect:false,lastCorrect:true,response:'1',attempts:2},
  riskdifference:{firstCorrect:true,lastCorrect:true,response:'0.028',attempts:1},
  dependence:{firstCorrect:false,lastCorrect:false,response:'0',attempts:1}
 };
 const recommended=engine.guidance(responses);
 assert.deepEqual(recommended.map(x=>x.skill),['provenance','dependence']);
 assert.deepEqual(recommended.map(x=>x.url),[
  'research-studio.html?station=screen','real-evidence-lab.html?module=21']);
 const markdown=engine.report(responses);
 for(const phrase of ['NOT a competence certificate','Source-linked','first','metadat','not attempted']){
  assert.ok(markdown.toLowerCase().includes(phrase.toLowerCase()),'Missing '+phrase);
 }
 assert.match(markdown,/First attempt correct: false/);
 assert.match(markdown,/Source and eligibility decisions/);
});
test('novice can finish six stages with correct choices and see source-based visual reveal',()=>{
 const page=dom(),w=page.window,d=w.document;
 const values=[1,'0.028',0,1,1,1];
 assert.equal(d.getElementById('progressMeter').getAttribute('aria-valuenow'),'0');
 assert.match(d.getElementById('taskTitle').textContent,/first observation/i);
 d.getElementById('checkAnswer').click();
 assert.match(d.getElementById('answerFeedback').textContent,/Choose an option/);
 for(let i=0;i<6;i++){
  const t=engine.tasks[i];
  if(t.kind==='choice'){
   const option=d.querySelector('#choiceOptions button[data-choice="'+values[i]+'"]');
   assert.ok(option,'choice missing: '+t.id);
   option.click();
  }else{
   const input=d.getElementById('numericValue');
   input.value=String(values[i]);
   input.dispatchEvent(new w.Event('input',{bubbles:true}));
  }
  assert.equal(d.getElementById('sourceLink').href,t.source);
  d.getElementById('checkAnswer').click();
  assert.equal(d.getElementById('answerFeedback').dataset.result,'correct',t.id);
  assert.equal(d.getElementById('progressMeter').getAttribute('aria-valuenow'),String(i+1));
  if(t.id==='influence'){
   const plot=d.querySelector('#impactPlot svg[role=img]');
   assert.ok(plot,'sensitivity visualization appears after prediction');
   assert.match(plot.getAttribute('aria-label'),/95 percent confidence intervals/i);
   assert.match(d.getElementById('impactPlot').textContent,/retrospective/i);
  }
  d.getElementById('nextTask').click();
 }
 assert.equal(d.getElementById('summary').hidden,false);
 assert.match(d.getElementById('summaryStatus').textContent,/6 of 6/);
 assert.match(d.getElementById('summaryStatus').textContent,/not a validated assessment/i);
 const stored=JSON.parse(w.localStorage.getItem('synthesis_guided_start_v1'));
 assert.equal(Object.keys(stored.responses).length,6);
 assert.ok(engine.tasks.every(t=>stored.responses[t.id].firstCorrect));
 page.window.close();
});
test('wrong then corrected response stays a first-attempt weakness and gets targeted route',()=>{
 const page=dom('fr'),w=page.window,d=w.document;
 assert.match(d.getElementById('languageNotice').textContent,/not been professionally translated or reviewed/i);
 d.querySelector('[data-choice="0"]').click();
 d.getElementById('checkAnswer').click();
 assert.equal(d.getElementById('answerFeedback').dataset.result,'retry');
 d.querySelector('[data-choice="1"]').click();
 d.getElementById('checkAnswer').click();
 assert.equal(d.getElementById('answerFeedback').dataset.result,'correct');
 const stored=JSON.parse(w.localStorage.getItem('synthesis_guided_start_v1'));
 assert.equal(stored.responses.source.firstCorrect,false);
 assert.equal(stored.responses.source.lastCorrect,true);
 assert.equal(stored.responses.source.attempts,2);
 assert.match(engine.report(stored.responses),/Source and eligibility decisions/);
 page.window.close();
});
test('reset requires confirmation and never deletes AllMeta or other course data',()=>{
 const page=dom(),w=page.window,d=w.document;
 w.localStorage.setItem('ma-studies-v1','{"unchanged":true}');
 w.localStorage.setItem('synthesis_research_studio_v1','{"persist":true}');
 d.querySelector('[data-choice="1"]').click();
 d.getElementById('checkAnswer').click();
 d.getElementById('resetStarter').click();
 assert.ok(w.localStorage.getItem('synthesis_guided_start_v1'));
 assert.match(d.getElementById('resetStarter').textContent,/Confirm/);
 d.getElementById('resetStarter').click();
 assert.equal(Object.keys(JSON.parse(w.localStorage.getItem('synthesis_guided_start_v1')).responses).length,0);
 assert.equal(w.localStorage.getItem('ma-studies-v1'),'{"unchanged":true}');
 assert.equal(w.localStorage.getItem('synthesis_research_studio_v1'),'{"persist":true}');
 page.window.close();
});
test('guided-start links are visible in main hub and Mission Lab',()=>{
 assert.match(read('index.html'),/href="guided-start.html"/);
 assert.match(read('mission-lab.html'),/href="guided-start.html"/);
 assert.match(read('lesson-workshops.js'),/guided-start\.html\?lang=/);
});
test('all twelve existing translated lesson routes retain 25 workshops and gain one novice link',()=>{
 const loader=read('lesson-workshops.js');
 for(const lang of ['en','ar','de','es','fr','hi','it','ja','ko','pt','ru','zh']){
  const suffix=lang==='en'?'':'-'+lang;
  const page='<html><head></head><body>'+
   Array.from({length:25},(_,i)=>'<section class="module-slides" data-module="'+i+'"><div class="slide light"><div class="learning-objectives">Objectives</div></div><div class="slide">Original lesson</div></section>').join('')+
   '</body></html>';
  const d=new JSDOM(page,{url:'https://example.test/synthesis-course'+suffix+'.html',runScripts:'outside-only'});
  d.window.updateSlideDisplay=()=>{};
  d.window.eval(loader);
  d.window.document.dispatchEvent(new d.window.Event('DOMContentLoaded'));
  const doc=d.window.document;
  assert.equal(doc.querySelectorAll('.lesson-workshop-slide').length,25,lang);
  assert.equal(doc.querySelectorAll('.learning-objectives').length,25,lang);
  assert.equal(doc.querySelectorAll('a.guided-start-entry').length,1,lang);
  const link=doc.querySelector('a.guided-start-entry');
  assert.ok(link.href.endsWith('guided-start.html?lang='+lang),lang);
  assert.match(link.textContent,/English pilot/);
  d.window.close();
 }
});
