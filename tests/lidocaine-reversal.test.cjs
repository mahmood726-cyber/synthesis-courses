// New lidocaine investigation: source rows, reversible choices, actual DOM,
// selected-subset arithmetic, epistemic limits and all 12 route insertions.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const load=f=>fs.readFileSync(path.join(root,f),'utf8');
const html=load('lidocaine-reversal-lab.html');
const source=load('small-meta-data.js');
const ui=load('lidocaine-reversal-ui.js');
const embed=load('lidocaine-lesson-integration.js');
function init(){
 const dom=new JSDOM(html,{url:'https://mahmood726-cyber.github.io/synthesis-courses/lidocaine-reversal-lab.html',runScripts:'outside-only'});
 dom.window.eval(source);
 dom.window.eval(ui);
 return dom;
}
function click(d,selector){const node=d.querySelector(selector);assert.ok(node,selector);node.click();}

test('source-grounded six real Hine records match archived R inputs and published result',()=>{
 for(const script of [source,ui,embed])new vm.Script(script);
 const ctx={window:{}};vm.runInNewContext(source,ctx);
 const D=ctx.window.SYNTHESIS_REAL_DATA;
 assert.equal(D.verify(),true);
 assert.equal(D.hine.studies.length,6);
 assert.deepEqual(Array.from(D.hine.studies,s=>[s.ai,s.n1i,s.ci,s.n2i]),[
  [2,39,1,43],[4,44,4,44],[6,107,4,110],
  [7,103,5,100],[7,110,3,106],[11,154,4,146]
 ]);
 const r=D.metaRD();
 assert.ok(Math.abs(r.estimate-0.029444320344763953)<1e-10);
 assert.ok(Math.abs(r.se-0.013068316969818292)<1e-10);
 assert.ok(Math.abs(r.Q-0.8596926775315366)<1e-9);
 assert.equal(r.I2,0);
 assert.equal(D.hine.studies.reduce((z,s)=>z+s.ai,0),37);
 assert.equal(D.hine.studies.reduce((z,s)=>z+s.ci,0),21);
});
test('1989 primary source, 1999 archive and 2015 review are not falsely equated',()=>{
 for(const needle of [
  'December 1989','Normand (1999)','2015','metadat::dat.hine1989',
  '14-trial Hine 1989 review','18 studies, 11,727 participants',
  '1.02 (95% CI 0.82–1.27)','https://pubmed.ncbi.nlm.nih.gov/2688587/',
  'doi.org/10.1001/archinte.1989.00390120056011',
  'pmc.ncbi.nlm.nih.gov/articles/PMC8454263/',
  'risk difference','risk ratio','English-language pilot'
 ]) assert.ok(html.includes(needle),'missing historical/provenance boundary '+needle);
 assert.doesNotMatch(html,/clinically validated|independent human review completed|most interactive in the world/i);
 assert.match(html,/Never use these archival classroom subsets for a modern clinical decision/i);
});
test('surrogate misconception receives feedback before mortality counts are exposed',()=>{
 const dom=init(),d=dom.window.document;
 assert.equal(d.getElementById('act-2').hidden,true);
 assert.equal(d.getElementById('archive-results').hidden,true);
 click(d,'button[data-surrogate="benefit"]');
 assert.match(d.getElementById('surrogate-feedback').textContent,/Surrogate-endpoint trap/);
 assert.equal(d.getElementById('act-2').hidden,false);
 assert.equal(d.getElementById('archive-results').hidden,true);
 click(d,'button[data-surrogate="separate"]');
 assert.match(d.getElementById('surrogate-feedback').textContent,/Supported/);
 assert.equal(d.querySelector('[data-surrogate="separate"]').getAttribute('aria-pressed'),'true');
 assert.equal(d.querySelector('[data-surrogate="benefit"]').getAttribute('aria-pressed'),'false');
 dom.window.close();
});
test('wrong sign reveals real counts, exact pooled RD and meaningful reversible choices',()=>{
 const dom=init(),w=dom.window,d=w.document;
 click(d,'button[data-surrogate="separate"]');
 click(d,'button[data-mortality="negative"]');
 assert.match(d.getElementById('mortality-feedback').textContent,/Effect-direction misconception/);
 assert.equal(d.getElementById('archive-results').hidden,false);
 assert.equal(d.getElementById('act-3').hidden,false);
 assert.match(d.getElementById('estimate').textContent,/Selected 6 of 6/);
 assert.match(d.getElementById('estimate').textContent,/\+2\.944 percentage points/);
 assert.match(d.getElementById('estimate').textContent,/\+0\.383 to \+5\.506/);
 assert.equal(d.querySelectorAll('#trials input[type="checkbox"]').length,6);
 assert.equal(d.querySelectorAll('#trial-rows tr').length,6);
 click(d,'button[data-mortality="positive"]');
 assert.match(d.getElementById('mortality-feedback').textContent,/Supported prediction/);
 const checks=Array.from(d.querySelectorAll('#trials input'));
 checks.slice(1).forEach(x=>{x.checked=false;x.dispatchEvent(new w.Event('change',{bubbles:true}));});
 assert.match(d.getElementById('estimate').textContent,/at least two studies/);
 assert.match(d.getElementById('subset-warning').textContent,/Refusal/);
 const remaining=Array.from(d.querySelectorAll('#trials input'));
 remaining[1].checked=true;
 remaining[1].dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.match(d.getElementById('estimate').textContent,/Selected 2 of 6/);
 assert.match(d.getElementById('subset-warning').textContent,/sensitivity exercise/);
 dom.window.close();
});
test('later review misconceptions distinguish RD, RR, population and non-equivalence',()=>{
 const dom=init(),d=dom.window.document;
 click(d,'button[data-surrogate="separate"]');
 click(d,'button[data-mortality="positive"]');
 click(d,'button[data-later="proven-safe"]');
 assert.match(d.getElementById('later-feedback').textContent,/Absence-of-evidence misconception/);
 click(d,'button[data-later="identical"]');
 assert.match(d.getElementById('later-feedback').textContent,/Scale misconception/);
 click(d,'button[data-later="qualified"]');
 assert.match(d.getElementById('later-feedback').textContent,/Supported/);
 assert.equal(d.getElementById('commit').hidden,false);
 dom.window.close();
});
test('first-commit dossier requires learner reasoning and preserves both original and revised predictions',()=>{
 const dom=init(),d=dom.window.document;
 click(d,'button[data-surrogate="benefit"]');
 click(d,'button[data-surrogate="separate"]');
 click(d,'button[data-mortality="negative"]');
 click(d,'button[data-mortality="positive"]');
 click(d,'button[data-later="identical"]');
 click(d,'button[data-later="qualified"]');
 click(d,'#make-commit');
 assert.equal(d.getElementById('dossier').value,'');
 assert.match(d.getElementById('commit-feedback').textContent,/at least 30 characters/);
 d.getElementById('rule').value='Include all six published archived rows for treatment-period mortality RD.';
 d.getElementById('reason').value='The surrogate is not mortality. The later RR pools a broader population and cannot be directly subtracted.';
 click(d,'#make-commit');
 const out=d.getElementById('dossier').value;
 assert.match(out,/metadat::dat.hine1989/);
 assert.match(out,/first: benefit; current: separate/);
 assert.match(out,/first: negative; current: positive/);
 assert.match(out,/first: identical; current: qualified/);
 assert.match(out,/k=6/);
 assert.match(out,/Rscript scripts\/verify_small_meta.R/);
 assert.match(d.getElementById('commit-feedback').textContent,/no commit or upload occurred/i);
 dom.window.close();
});
test('open-book skip gives access without inventing decisions; reset restores encounter',()=>{
 const dom=init(),d=dom.window.document;
 click(d,'#show-all');
 for(const id of ['act-2','archive-results','act-3','commit'])assert.equal(d.getElementById(id).hidden,false);
 assert.equal(d.querySelectorAll('#trials input').length,6);
 d.getElementById('rule').value='Some text';
 click(d,'#restart');
 for(const id of ['act-2','archive-results','act-3','commit'])assert.equal(d.getElementById(id).hidden,true);
 assert.equal(d.getElementById('rule').value,'');
 assert.match(d.getElementById('progress').textContent,/Act I open/);
 dom.window.close();
});
test('all 12 intact flagship routes can lazily embed second English-pilot story',async()=>{
 assert.match(load('lesson-workshops.js'),/lidocaine-lesson-integration\.js/);
 for(const lang of ['en','ar','de','es','fr','hi','it','ja','ko','pt','ru','zh']){
   const pathName='synthesis-course'+(lang==='en'?'':'-'+lang)+'.html';
   const flagship=load(pathName);
   assert.match(flagship,/lesson-workshops\.js/,'lost existing lesson workshop '+lang);
   const stub='<html><head></head><body><section class="module-slides active" data-module="5"><div class="slide lesson-workshop-slide"></div><div class="slide">Existing translated content</div></section></body></html>';
   const dom=new JSDOM(stub,{url:'https://example.test/'+pathName,runScripts:'outside-only'});
   const w=dom.window,d=w.document;
   w.eval(embed);d.dispatchEvent(new w.Event('DOMContentLoaded'));
   const slide=d.querySelector('.lesson-lidocaine-slide');
   assert.ok(slide,'insertion missing '+lang);
   assert.equal(slide.dataset.lidocaineLanguage,lang);
   assert.equal(d.querySelectorAll('.lesson-workshop-slide').length,1);
   assert.ok(slide.textContent.includes(lang==='en'?'not independently reviewed':'not translated or professionally reviewed'));
   const frame=slide.querySelector('iframe[data-lidocaine-src]');
   assert.ok(frame&&!frame.getAttribute('src'));
   slide.classList.add('active');
   await new Promise(resolve=>setImmediate(resolve));
   assert.ok(frame.src.endsWith('/lidocaine-reversal-lab.html'),'lazy frame '+lang);
   dom.window.close();
 }
});
