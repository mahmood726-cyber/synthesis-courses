// Source-grounded real R datasets and the embedded 25-lesson experience.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const load=name=>fs.readFileSync(path.join(root,name),'utf8');
const fixture=load('small-meta-data.js'),i18n=load('real-evidence-i18n.js');
const engine=load('real-evidence-lab.js'),embedder=load('lesson-workshops.js');
const page=load('real-evidence-lab.html');
const scripts=[fixture,i18n,engine,embedder];
const truth={2:false,3:true,4:true,6:false,9:true,10:false,11:true,12:false,14:false,15:true,16:false,18:false,19:false,20:false,22:false,24:true};
const answers={0:6,1:2/39-1/43,5:11/154-4/146,7:0.029444320344763953,8:0,21:5,23:0.3472008701943795};
function make(url){
  const dom=new JSDOM(page,{url,runScripts:'outside-only',pretendToBeVisual:true});
  dom.window.eval(fixture);dom.window.eval(i18n);dom.window.eval(engine);
  return dom;
}
function choose(dom,x){
  const d=dom.window.document, b=d.querySelector('[data-choice="'+(x?1:0)+'"]');
  assert.ok(b);b.click();
}
function writeValue(dom,v){
  const w=dom.window,d=w.document, input=d.getElementById('numericAnswer');
  assert.ok(input);input.value=String(v);input.dispatchEvent(new w.Event('input',{bubbles:true}));
}
test('all real datasets are small, have exact event counts and reproduce R benchmark',()=>{
  scripts.forEach(s=>new vm.Script(s));
  const scope={window:{}};vm.runInNewContext(fixture,scope);
  const D=scope.window.SYNTHESIS_REAL_DATA;
  assert.equal(D.verify(),true);
  assert.equal(D.hine.studies.length,6);assert.equal(D.berkey.studies.length,5);
  assert.equal(D.berkey.studies.reduce((s)=>s+2,0),10);
  const pooled=D.metaRD();
  assert.ok(Math.abs(pooled.estimate-0.0294)<0.00005);
  assert.ok(Math.abs(pooled.lower-0.0038)<0.00006);
  assert.ok(Math.abs(pooled.upper-0.0551)<0.00006);
  assert.ok(Math.abs(pooled.Q-0.8597)<0.00006);
  assert.equal(pooled.I2,0);
  assert.ok(Math.abs(D.berkeyPooled('PD').estimate-0.3472008701943795)<1e-10);
  assert.ok(Math.abs(D.berkeyPooled('AL').estimate+0.39258387448645665)<1e-10);
  assert.equal(D.hine.studies[0].ai,2);assert.equal(D.hine.studies[0].n1i,39);
  assert.equal(D.hine.studies[5].ci,4);assert.equal(D.hine.studies[5].n2i,146);
});
test('25 meaningful numeric and conceptual challenges can all be completed',()=>{
  let completed=0;
  for(let mod=0;mod<25;mod++){
    const dom=make('https://example.test/real-evidence-lab.html?module='+mod);
    const w=dom.window,d=w.document;
    assert.match(d.getElementById('sourceLink').href,/metadat\/reference\/dat\./);
    assert.equal(d.querySelectorAll('#dataTable tbody tr').length,mod===21||mod===23?5:6);
    if(Object.hasOwn(answers,mod)){
      writeValue(dom,answers[mod]);
    }else if(mod===13){
      const slider=d.getElementById('priorSlider');
      slider.value='0.080';slider.dispatchEvent(new w.Event('input',{bubbles:true}));
      assert.match(d.getElementById('livePlot').textContent,/Posterior/);
    }else if(mod===17){
      const input=d.querySelector('input[data-id="1"]');const before=d.getElementById('livePlot').textContent;
      input.checked=false;input.dispatchEvent(new w.Event('change',{bubbles:true}));
      assert.notEqual(before,d.getElementById('livePlot').textContent);
      input.checked=true;input.dispatchEvent(new w.Event('change',{bubbles:true}));
    }else choose(dom,truth[mod]);
    d.getElementById('verify').click();
    const response=d.getElementById('result');
    assert.equal(response.hidden,false,'No result for module '+mod);
    assert.notEqual(response.className,'bad','Module '+mod+' was rejected: '+response.textContent);
    const saved=JSON.parse(w.localStorage.getItem('synthesis_small_real_labs_v1'));
    assert.equal(saved[mod].done,true);
    completed++;dom.window.close();
  }
  assert.equal(completed,25);
});
test('wrong responses do not award completion and reset enables replay',()=>{
  const dom=make('https://example.test/real-evidence-lab.html?module=7');
  const d=dom.window.document;
  writeValue(dom,0.50);
  d.getElementById('verify').click();assert.equal(d.getElementById('result').className,'bad');
  assert.equal(dom.window.localStorage.length,0);
  d.getElementById('reset').click();assert.equal(d.getElementById('result').hidden,true);
  writeValue(dom,0.02944);d.getElementById('verify').click();
  assert.notEqual(d.getElementById('result').className,'bad');
  dom.window.close();
});
test('12 languages preserve evidence and scientific invariants; full lesson translations in selected languages',()=>{
  const scope={window:{}};vm.runInNewContext(i18n,scope);
  const I=scope.window.SYNTHESIS_REAL_I18N;
  assert.equal(I.available.length,12);
  for(const lang of I.available){
    const x=I.get(lang);
    assert.equal(x.prompts.length,25);
    assert.ok(x.common.check&&x.common.source&&x.common.pending);
    const dom=make('https://example.test/real-evidence-lab.html?module=7&lang='+lang+'&embed=1');
    const d=dom.window.document;
    assert.equal(d.documentElement.lang,lang);
    assert.equal(d.documentElement.dir,lang==='ar'?'rtl':'ltr');
    assert.equal(d.querySelectorAll('#dataTable tbody tr').length,6);
    assert.equal(d.getElementById('miniFull').getAttribute('href').includes('lang='+lang),true);
    assert.ok(d.querySelector('#rCode').textContent.includes('dat.hine1989'));
    if(x.promptTranslated)assert.ok(!d.getElementById('disclaimer').textContent.includes('pending'));
    dom.window.close();
  }
  for(const lang of ['en','es','fr','de'])assert.equal(I.get(lang).promptTranslated,true);
  for(const lang of ['ar','hi','it','ja','ko','pt','ru','zh'])assert.equal(I.get(lang).promptTranslated,false);
});
test('embedded 25-slide insertion is lazy and keeps published course content untouched',async()=>{
  const skeleton=['<!doctype html><html><head></head><body><main>'];
  for(let id=0;id<25;id++)skeleton.push('<section class="module-slides '+(id===0?'active':'')+'" data-module="'+id+'">'+
    '<div class="slide dark active">Intro</div><div class="slide light"><div class="learning-objectives">Objectives</div></div>'+
    '<div class="slide dark">Story</div></section>');
  skeleton.push('</main></body></html>');
  const dom=new JSDOM(skeleton.join(''),{url:'https://example.test/synthesis-course-fr.html',
    runScripts:'outside-only',pretendToBeVisual:true});
  dom.window.updateSlideDisplay=()=>{};
  dom.window.eval(embedder);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  const d=dom.window.document;
  assert.equal(d.querySelectorAll('.lesson-workshop-slide').length,25);
  assert.equal(d.querySelectorAll('.module-slides').length,25);
  assert.equal(d.querySelectorAll('.learning-objectives').length,25);
  assert.ok(d.querySelector('.module-slides[data-module="21"] iframe').dataset.lessonSrc.includes('module=21&lang=fr'));
  const frame=d.querySelector('.module-slides[data-module="7"] iframe');
  assert.ok(!frame.getAttribute('src'),'Hidden iframe must not load');
  const slide=frame.closest('.slide');slide.classList.add('active');
  await new Promise(resolve=>setImmediate(resolve));
  assert.match(frame.getAttribute('src'),/real-evidence-lab.html\?module=7&lang=fr&embed=1/);
  dom.window.close();
});
test('all flagship language pages load embedded real-data exercises',()=>{
  const languages=['','ar','de','es','fr','hi','it','ja','ko','pt','ru','zh'];
  for(const language of languages){
    const name='synthesis-course'+(language?'-'+language:'')+'.html';
    const html=load(name);
    assert.ok(html.includes('<script src="lesson-workshops.js"></script>'),name);
    assert.equal((html.match(/class="module-slides/g)||[]).length,25);
  }
});
