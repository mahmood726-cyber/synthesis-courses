const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const load=x=>fs.readFileSync(path.join(root,x),'utf8');
const workshop=load('lesson-workshops.js'),story=load('lesson-story-checkpoints.js');
function fixture(lang){
 const modules=Array.from({length:25},(_,i)=>'<section class="module-slides '+(i===0?'active':'')+'" data-module="'+i+'"><div class="slide active">Intro</div><div class="slide"><div class="learning-objectives">Learning objectives</div></div></section>').join('');
 const suffix=lang==='en'?'':'-'+lang;
 const dom=new JSDOM('<html><head></head><body>'+modules+'</body></html>',{url:'https://example.test/synthesis-course'+suffix+'.html',runScripts:'outside-only'});
 dom.window.updateSlideDisplay=()=>{};
 dom.window.eval(workshop);dom.window.eval(story);
 dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
 return dom;
}
test('story moments are inside every existing course language route',()=>{
 for(const lang of ['en','ar','zh','fr','de','hi','it','ja','ko','pt','ru','es']){
  const dom=fixture(lang),doc=dom.window.document;
  assert.equal(doc.querySelectorAll('.lesson-workshop-slide').length,25);
  const slides=doc.querySelectorAll('.lesson-story-slide');
  assert.equal(slides.length,4);
  for(const slide of slides)assert.doesNotMatch(slide.textContent,/quran\.com|Qur.an|\bverse\b/i);
  assert.deepEqual(Array.from(slides,s=>Number(s.dataset.storyModule)),[3,7,9,22]);
  assert.equal(slides[1].previousElementSibling.classList.contains('lesson-workshop-slide'),true);
  assert.match(slides[0].textContent,lang==='en'?/English-only pilot/:/untranslated and unreviewed/);
  dom.window.close();
 }
});
test('story choice feedback reports numerical evidence without scoring belief',()=>{
 const dom=fixture('en'),doc=dom.window.document,slide=doc.querySelector('[data-story-module="7"]');
 const choices=slide.querySelectorAll('button[data-answer]');
 choices[1].click();assert.equal(slide.querySelector('.story-feedback').dataset.correct,'false');
 choices[0].click();
 const box=slide.querySelector('.story-feedback');
 assert.equal(box.dataset.correct,'true');
 assert.match(box.textContent,/0\.405/);assert.match(box.textContent,/0\.659/);
 assert.ok(slide.querySelector('a[href="https://wviechtb.github.io/metafor/reference/escalc.html"]'));
 assert.ok(slide.querySelector('a[href="evidence-story-lab.html"]'));
 assert.match(slide.textContent,/narrative turning point/i);
 assert.doesNotMatch(slide.textContent,/Qur.an|\bverse\b|quran\.com/i);
 dom.window.close();
});
