/* Shared insertion for the same 12 existing course-language routes.
   Adds an English-only, provisional, real-data decision arena AFTER prior lessons;
   does not alter or translate the original lessons. */
(function(){
'use strict';
const cases={3:['bcg','BCG trial selection'],7:['magnesium','The magnesium reversal'],22:['lidocaine','Lidocaine uncertainty']};
const langMatch=location.pathname.match(/synthesis-course-([a-z]{2})\.html$/);
const lang=langMatch?langMatch[1]:'en';
function init(){
 if(document.querySelector('.lesson-arena-slide'))return;
 for(const [number,[id,title]] of Object.entries(cases)){
  const mod=document.querySelector('.module-slides[data-module="'+number+'"]');
  if(!mod)continue;
  const anchor=mod.querySelector('.lesson-story-slide')||
    mod.querySelector('.lesson-magnesium-slide')||mod.querySelector('.lesson-workshop-slide')||mod.querySelector('.slide');
  if(!anchor)continue;
  const slide=document.createElement('div');
  slide.className='slide light lesson-arena-slide';
  slide.dataset.arenaCase=id;
  slide.dataset.arenaLanguage=lang;
  slide.innerHTML='<div style="max-width:1020px;width:100%;height:100%;margin:auto;padding:1rem;background:#eaf3f6;color:#15374a;border:1px solid #8aafb8;border-radius:12px;overflow:auto">'+
   '<p style="letter-spacing:.1em;font-size:.8rem;font-weight:900">SOURCE-BASED INTERACTIVE EVIDENCE DECISION ARENA</p>'+
   '<h2 style="color:#173f51">Take the evidence into your own hands</h2>'+
   '<p>Investigate '+title+'. Register a defensible inclusion decision before seeing the result, predict its direction, toggle archived trial records, face a peer-review challenge and export an evidence dossier.</p>'+
   '<p style="font-size:.85rem">English-language pilot'+(lang==='en'?'.':' — not translated or methodologically reviewed for '+lang+'; provisional.')+' Original course languages and learning material remain accessible. Real archived R data, but deliberate teaching subsets; not clinical guidance or certification.</p>'+
   '<iframe title="Evidence Decision Arena: '+title+' (English pilot)" loading="lazy" data-arena-src="evidence-arena.html?case='+id+'&lang='+lang+'&embed=1" style="width:100%;min-height:630px;border:1px solid #819daa;border-radius:8px;background:#fff"></iframe>'+
   '<p><a href="evidence-arena.html?case='+id+'&lang='+lang+'" target="_blank" rel="noopener">Open the whole investigation in a new tab ↗</a></p></div>';
  anchor.after(slide);
  function load(){
   if(!slide.classList.contains('active'))return;
   const frame=slide.querySelector('iframe[data-arena-src]');
   if(frame&&!frame.getAttribute('src'))frame.setAttribute('src',frame.dataset.arenaSrc);
  }
  const obs=new MutationObserver(load);
  obs.observe(slide,{attributes:true,attributeFilter:['class']});load();
 }
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||!event.data||event.data.type!=='SYNTHESIS_ARENA_DONE')return;
  const id=event.data.caseId;
  if(!['magnesium','bcg','lidocaine'].includes(id))return;
  const slide=document.querySelector('.lesson-arena-slide[data-arena-case="'+id+'"]');
  if(!slide)return;
  const frame=slide.querySelector('iframe');
  if(event.source!==frame.contentWindow)return;
  const label=slide.querySelector('h2');
  if(label&&!label.textContent.includes(' ✓'))label.textContent+=' ✓';
 });
 if(typeof window.updateSlideDisplay==='function'){
  const current=document.querySelector('.module-slides.active');
  if(current)window.updateSlideDisplay(current);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();