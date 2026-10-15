/* Optional three-part evidence story. English pilot available from all 12 course routes.
   Clinical numbers are archival subset demonstrations, not current recommendations.
   Qur'anic narratives are optional ethical reflections, not empirical estimators. */
(function(){
'use strict';
const scenes={
  3:{
    title:'The missing report',scene:'In this fictional BCG evidence desk, an editor discovers another plausible historical study. The full published R example has 13 studies; a six-row subset is only a learning exercise.',
    ask:'What should the editor do before announcing an omission?',
    good:'Retrieve the trial, check eligibility and search dates, and document the decision.',
    bad:'Accuse the authors of suppressing evidence without checking the record.',
    why:'A new citation is not proof of an eligible missed trial. Audit its design, population, outcomes and sources.',
    verse:'Yusuf 12:87',url:'https://quran.com/12/87',
    lens:'Ya‘qub calls for further inquiry about Yusuf and his brother. A possible analogy is perseverance; the verse cannot tell us whether a clinical trial exists.'
  },
  7:{
    title:'The study that moved the number',scene:'Five selected archival BCG rows yield a fixed-effect RR near 0.405. In a fictional editorial sequence, the large TPT Madras row is added as the sixth of those selected rows.',
    ask:'Which description of the recalculated RR is supported?',
    good:'It moves toward 1, to about 0.659.',
    bad:'It moves farther below 1 and proves greater protection.',
    why:'A common-effect inverse-variance model gives approximately 0.405 without Madras and 0.659 with it. This cherry-picked six-row scenario has substantial heterogeneity and is not a clinical-effectiveness synthesis.',
    verse:'An-Naml 27:27',url:'https://quran.com/27/27',
    lens:'Sulayman indicates he will check a report from the hoopoe. This can inspire verification, but cannot supply a risk ratio or determine vaccine effectiveness.'
  },
  22:{
    title:'When a compelling account is not proof',scene:'The R arithmetic reproduces a number from six selected BCG rows. A colleague argues that reproducibility and a religious analogy together settle the clinical question.',
    ask:'Which response keeps clinical evidence and ethical reflection distinct?',
    good:'Check completeness, allocation, bias and applicability independently.',
    bad:'Treat a script or verse as proof of the clinical conclusion.',
    why:'Reproducibility cannot substitute for complete retrieval and critical appraisal. Scriptures are not trial records or statistical tests.',
    verse:'Al-Hujurat 49:6',url:'https://quran.com/49/6',
    lens:'The verse advises verification of reports to avoid harm. Its relevance here is an optional ethical reflection, not an empirical causal conclusion.'
  }
};
function slideFor(id,lang){
 const c=scenes[id],slide=document.createElement('div');
 slide.className='slide light lesson-story-slide';slide.dataset.storyModule=String(id);
 slide.innerHTML='<div class="lesson-story-content"><p class="story-kicker">EVIDENCE STORY · ARCHIVAL DATA / FICTIONAL EDITOR</p>'+
 '<h2>'+c.title+'</h2><p>'+c.scene+'</p><h3>'+c.ask+'</h3>'+
 '<div class="story-answers" role="group" aria-label="Evidence reasoning choice">'+
 '<button type="button" data-answer="0" aria-pressed="false">'+c.good+'</button>'+
 '<button type="button" data-answer="1" aria-pressed="false">'+c.bad+'</button></div>'+
 '<p class="story-feedback" role="status" aria-live="polite" hidden></p>'+
 '<details class="story-lens"><summary>Optional Qur’anic analogy — not an analysis result</summary>'+
 '<p>'+c.lens+' <a href="'+c.url+'" target="_blank" rel="noopener">'+c.verse+' ↗</a></p>'+
 '<p>No verse is quoted as a scientific method; religious agreement is not graded.</p></details>'+
 '<p class="story-links"><a href="evidence-story-lab.html" target="_blank" rel="noopener">Explore the real six-row BCG case ↗</a> · '+
 '<a href="https://www.metafor-project.org/doku.php/analyses:berkey1995" target="_blank" rel="noopener">Verify all 13 original data rows ↗</a></p>'+
 '<p class="story-caveat">Not clinical guidance. English-only pilot '+(lang==='en'?'':'(untranslated and unreviewed in '+lang+')')+'; all 12 original course languages remain accessible.</p></div>';
 slide.querySelector('.story-answers').addEventListener('click',e=>{
  const b=e.target.closest('button[data-answer]');if(!b)return;
  const group=b.parentElement;
  group.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  const ok=b.dataset.answer==='0',out=slide.querySelector('.story-feedback');
  out.textContent=(ok?'Supported methodological decision. ':'Check the evidence chain. ')+c.why;
  out.dataset.correct=String(ok);out.hidden=false;
 });
 return slide;
}
function init(){
 if(!document.querySelector('.module-slides[data-module]')||document.querySelector('.lesson-story-slide'))return;
 const m=location.pathname.match(/synthesis-course-([a-z]{2})\.html$/),lang=m?m[1]:'en';
 const css=document.createElement('link');css.rel='stylesheet';css.href='lesson-story-checkpoints.css';document.head.append(css);
 [3,7,22].forEach(id=>{
  const mod=document.querySelector('.module-slides[data-module="'+id+'"]');
  const after=mod&&mod.querySelector('.lesson-workshop-slide');
  if(after)after.after(slideFor(id,lang));
 });
 if(typeof window.updateSlideDisplay==='function'){
  const active=document.querySelector('.module-slides.active');if(active)window.updateSlideDisplay(active);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();