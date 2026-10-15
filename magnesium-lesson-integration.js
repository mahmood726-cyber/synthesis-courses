/* Add a distinctly non-religious magnesium evidence-reversal case inside module 7.
   This supplements, rather than changes, existing 12 translated course routes.
   All new explanatory material is English-only / provisional outside 'en'.
*/
(function(){
 'use strict';
 function init(){
   if(document.querySelector('.lesson-magnesium-slide'))return;
   const module=document.querySelector('.module-slides[data-module="7"]');
   if(!module)return;
   const anchor=module.querySelector('.lesson-workshop-slide') || module.querySelector('.slide');
   if(!anchor)return;
   const language=(location.pathname.match(/synthesis-course-([a-z]{2})\.html$/)||[])[1]||'en';
   const slide=document.createElement('div');
   slide.className='slide light lesson-magnesium-slide';
   slide.dataset.magnesiumEnglishPilot='true';
   slide.setAttribute('data-magnesium-language',language);
   slide.innerHTML='<div style="max-width:1020px;width:100%;margin:auto;padding:1rem;background:#f2fafb;color:#183540;border:1px solid #7eabb3;border-radius:14px">'+
     '<p style="font-weight:800">NON-RELIGIOUS CLINICAL EVIDENCE REVERSAL · ARCHIVAL DATA</p>'+
     '<h2 style="color:#173e50">The Trial That Changed the Argument</h2>'+
     '<p>Investigate mortality results from selected historical intravenous-magnesium trials after myocardial infarction. Predict the effect of adding ISIS-4, then recompute the <strong>Peto odds ratio</strong> yourself.</p>'+
     '<p style="font-size:.9rem">A deliberately selected <strong>six-of-sixteen</strong> classroom exercise, not a systematic review or current treatment recommendation. The editor scenario is fictional. No Qur’anic analogy is presented as empirical evidence.</p>'+
     '<p style="font-size:.85rem">English-only exercise'+(language==='en'?'; translation not applicable.':'; not translated or professionally reviewed for '+language+' — provisional.')+'</p>'+
     '<iframe title="Interactive magnesium evidence-reversal case study, English-language pilot" data-magnesium-src="magnesium-reversal-lab.html" loading="lazy" style="width:100%;min-height:600px;border:1px solid #74909b;border-radius:9px;background:white"></iframe>'+
     '<p><a href="magnesium-reversal-lab.html" target="_blank" rel="noopener">Open the interactive case in a separate tab ↗</a> · <a href="https://wviechtb.github.io/metadat/reference/dat.egger2001.html" target="_blank" rel="noopener">Original archive and all sixteen study records ↗</a></p>'+
     '</div>';
   anchor.after(slide);
   function load(){
     if(!slide.classList.contains('active'))return;
     const frame=slide.querySelector('iframe[data-magnesium-src]');
     if(frame&&!frame.getAttribute('src'))frame.setAttribute('src',frame.dataset.magnesiumSrc);
   }
   const observer=new MutationObserver(load);
   observer.observe(slide,{attributes:true,attributeFilter:['class']});
   load();
   if(typeof window.updateSlideDisplay==='function'){
     const active=document.querySelector('.module-slides.active');
     if(active)window.updateSlideDisplay(active);
   }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
 else init();
})();
