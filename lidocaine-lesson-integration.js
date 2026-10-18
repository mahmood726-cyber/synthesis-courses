/* Embed the English-only, historically sourced lidocaine investigation in
 * flagship module 5 without changing any existing translated lesson body.
 */
(function(){
 'use strict';
 function init(){
   if(document.querySelector('.lesson-lidocaine-slide'))return;
   const module=document.querySelector('.module-slides[data-module="5"]');
   if(!module)return;
   const anchor=module.querySelector('.lesson-workshop-slide')||module.querySelector('.slide');
   if(!anchor)return;
   const lang=(location.pathname.match(/synthesis-course-([a-z]{2})\.html$/)||[])[1]||'en';
   const slide=document.createElement('div');
   slide.className='slide light lesson-lidocaine-slide';
   slide.dataset.lidocaineEnglishPilot='true';
   slide.dataset.lidocaineLanguage=lang;
   slide.innerHTML='<div style="max-width:1020px;width:100%;margin:auto;padding:1rem;background:#eef8f5;color:#163e50;border:1px solid #7b9eaa;border-radius:14px">'+
     '<p style="font-weight:800">SECULAR, SOURCE-LED EVIDENCE REVERSAL · SIX REAL R TRIAL TABLES</p>'+
     '<h2 style="color:#153c4e">The Rhythm and the Outcome</h2>'+
     '<p>Investigate why a plausible arrhythmia surrogate did not settle mortality; predict before revealing the 1989 synthesis, recalculate the six-record risk difference, then critically assess the broader 2015 Cochrane result.</p>'+
     '<p style="font-size:.9rem">The six archived R records are <strong>not</strong> the full fourteen-trial 1989 review. Do not treat historical results as current medical guidance.</p>'+
     '<p style="font-size:.85rem">'+(lang==='en'?
       'English-language pilot; not independently reviewed.':
       'English-only pilot, not translated or professionally reviewed for '+lang+' — provisional.')+'</p>'+
     '<iframe title="Interactive lidocaine source investigation, English only and provisional" data-lidocaine-src="lidocaine-reversal-lab.html" loading="lazy" style="width:100%;min-height:620px;border:1px solid #799aa4;border-radius:9px;background:white"></iframe>'+
     '<p><a href="lidocaine-reversal-lab.html" target="_blank" rel="noopener">Open the original interactive investigation ↗</a> · <a href="https://wviechtb.github.io/metadat/reference/dat.hine1989.html" target="_blank" rel="noopener">View the six published R archive records ↗</a></p>'+
     '</div>';
   anchor.after(slide);
   function load(){
     if(!slide.classList.contains('active'))return;
     const frame=slide.querySelector('iframe[data-lidocaine-src]');
     if(frame&&!frame.getAttribute('src'))frame.setAttribute('src',frame.dataset.lidocaineSrc);
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
