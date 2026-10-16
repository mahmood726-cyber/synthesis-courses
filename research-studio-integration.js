/* Place six source-linked Research Studio exercises directly in flagship modules
 * while retaining every original slide and all twelve language routes.
 * New English text stays explicitly provisional in other routes.
 */
(function(){
'use strict';
const slots=Object.freeze({1:'protocol',4:'screen',7:'living',8:'stats',9:'review',24:'capstone'});
const labels={protocol:'Protocol before results',screen:'Two independent practice passes',
 living:'Historical evidence update',stats:'Reproduce effects using AllMeta',
 review:'Peer-review courtroom',capstone:'Research capstone'};
const m=location.pathname.match(/synthesis-course-([a-z]{2})\.html$/);
const language=m?m[1]:'en';
function init(){
 if(!document.querySelector('.module-slides[data-module]')||document.querySelector('.lesson-research-studio-slide'))return;
 for(const [raw,stage] of Object.entries(slots)){
  const mod=document.querySelector('.module-slides[data-module="'+raw+'"]');
  if(!mod)continue;
  const anchor=mod.querySelector('.lesson-arena-slide')||mod.querySelector('.lesson-magnesium-slide')||
    mod.querySelector('.lesson-story-slide')||mod.querySelector('.lesson-workshop-slide')||mod.querySelector('.slide');
  if(!anchor)continue;
  const slide=document.createElement('div');
  slide.className='slide light lesson-research-studio-slide';
  slide.dataset.researchStation=stage;
  slide.dataset.researchLanguage=language;
  const url='research-studio.html?station='+stage+'&lang='+language+'&embed=1';
  const wrap=document.createElement('div');
  wrap.style.cssText='max-width:1100px;width:100%;height:100%;margin:auto;padding:1rem;background:#f1f8f9;color:#183b4c;border:1px solid #97b7c0;border-radius:12px;overflow:auto';
  const eyebrow=document.createElement('p');
  eyebrow.textContent='RESEARCH STUDIO · REAL ARCHIVAL DATA · METHOD DECISIONS';eyebrow.style.fontWeight='900';
  const heading=document.createElement('h2');heading.textContent=labels[stage];heading.style.color='#124b59';
  const description=document.createElement('p');
  description.textContent='Perform this stage of a real-data evidence-synthesis practicum. Record decisions, inspect original trial records, open the real AllMeta apps where appropriate, and build a source-linked capstone. Teaching snapshots are not a complete systematic review.';
  const caveat=document.createElement('p');caveat.style.fontSize='.88rem';
  caveat.textContent=language==='en'?'English-language pilot; not clinical guidance or accredited assessment.':
    'English-only pilot. Not translated or professionally method-reviewed for '+language+'; provisional. The original translated lessons remain available.';
  const frame=document.createElement('iframe');frame.setAttribute('title','Synthesis Research Studio — '+labels[stage]+' (English pilot)');
  frame.loading='lazy';frame.dataset.researchSrc=url;
  frame.style.cssText='width:100%;height:600px;border:1px solid #7298a4;border-radius:8px;background:#fff';
  const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener';link.textContent='Open this stage full-screen ↗';
  wrap.append(eyebrow,heading,description,caveat,frame,link);slide.append(wrap);anchor.after(slide);
  function lazy(){
   if(!slide.classList.contains('active'))return;
   if(!frame.getAttribute('src'))frame.setAttribute('src',frame.dataset.researchSrc);
  }
  const observer=new MutationObserver(lazy);
  observer.observe(slide,{attributes:true,attributeFilter:['class']});lazy();
 }
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.data?.type!=='SYNTHESIS_RESEARCH_STUDIO_DONE'||event.data.stage!=='capstone')return;
  const slide=document.querySelector('.lesson-research-studio-slide[data-research-station="capstone"]');
  const frame=slide?.querySelector('iframe');if(!frame||event.source!==frame.contentWindow)return;
  const title=slide.querySelector('h2');if(title&&!title.textContent.includes(' ✓'))title.textContent+=' ✓';
 });
 if(typeof window.updateSlideDisplay==='function'){
  const current=document.querySelector('.module-slides.active');if(current)window.updateSlideDisplay(current);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
