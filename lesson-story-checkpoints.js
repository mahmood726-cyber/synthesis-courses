/* Four source-based narrative decision checkpoints, English pilot across 12 language routes.
   Narrative order is instructional, not a fictional historical account.
   All numbers are computed from an explicitly selected archive subset.
   The storytelling uses suspense and verification without religious content. */
(function(){
'use strict';
const scenes={
  3:{
    title:'Six were shown. Thirteen existed.',
    scene:'The established R BCG dataset contains thirteen historical study records. Our practical displays only six of them. The other seven were not newly discovered: they were always in the source dataset. You are deciding how a partial selection should be reported.',
    ask:'What is the most defensible next step before presenting a clinical conclusion?',
    good:'Open all thirteen original records, establish the selection rule, and document eligibility.',
    bad:'Call the seven unshown records suppressed trials without checking the archive.',
    why:'A retrospective six-of-thirteen subset is a sensitivity exercise, not proof that an eligible study was withheld or that an exhaustive review was performed.',
    turn:'The turning point is the source table, not a dramatic allegation. Six records can be reproduced faithfully and still fail to represent the full evidence base.'
  },
  7:{
    title:'The row that moves the answer.',
    scene:'With five deliberately selected archival BCG study records the inverse-variance fixed-effect RR is approximately 0.405. Add the TPT Madras 1980 record as the sixth row. This is retrospective teaching order, not publication chronology.',
    ask:'How does the six-record pooled RR change when Madras is added?',
    good:'It moves towards 1, to approximately 0.659.',
    bad:'It moves farther below 1, showing stronger protection.',
    why:'The five-record fixed-effect RR is approximately 0.405; adding Madras yields approximately 0.659. Neither subset is an exhaustive or prespecified clinical synthesis.',
    turn:'The surprise comes from unequal contributions, not from a fictional late-breaking discovery. Source verification and the choice of eligible records must precede a clinical claim.'
  },
  9:{
    title:'The funnel plot cannot testify.',
    scene:'Six selected archival BCG rows show substantial heterogeneity (I² about 96%). A visually appealing funnel plot would be tempting, but a six-point, non-exhaustive selection is an exceptionally weak basis for judging selective publication.',
    ask:'What can the shape of this chosen six-record plot establish?',
    good:'No definitive verdict; investigate missing evidence, selection, heterogeneity and reporting.',
    bad:'A symmetric six-study shape would prove that every trial was published.',
    why:'A small selected subset cannot verify search completeness or rule out publication bias. Allocation and clinical heterogeneity also complicate any small-study-effect interpretation.',
    turn:'A confident-looking shape is not a witness. The reproducible observations are six recorded points; completeness and causes require additional evidence.'
  },
  22:{
    title:'The reproducible number meets its limit.',
    scene:'The six archived BCG records reproduce a precise calculation. Yet the official dataset has thirteen records, including different allocation methods and study settings. Reproducing a calculation is not the same as validating the research question.',
    ask:'What must happen before interpreting the pooled number clinically?',
    good:'Audit retrieval, allocation, bias, heterogeneity and applicability of the full source set.',
    bad:'Declare the clinical question settled because the six-row arithmetic is reproducible.',
    why:'Exact numerical reproduction checks one part of the chain. Completeness, appropriate synthesis methods and external applicability still need independent assessment.',
    turn:'The final lesson is a distinction: numerical fidelity describes how a result was produced; scientific validity asks whether the result answers the right question.'
  }
};
function slideFor(id,lang){
 const c=scenes[id],slide=document.createElement('div');
 slide.className='slide light lesson-story-slide';slide.dataset.storyModule=String(id);
 slide.innerHTML='<div class="lesson-story-content"><p class="story-kicker">EVIDENCE STORY · ARCHIVAL STUDY DATA / LEARNER DECISION</p>'+
 '<h2>'+c.title+'</h2><p>'+c.scene+'</p><h3>'+c.ask+'</h3>'+
 '<div class="story-answers" role="group" aria-label="Evidence reasoning choice">'+
 '<button type="button" data-answer="0" aria-pressed="false">'+c.good+'</button>'+
 '<button type="button" data-answer="1" aria-pressed="false">'+c.bad+'</button></div>'+
 '<p class="story-feedback" role="status" aria-live="polite" hidden></p>'+
 '<details class="story-lens"><summary>Reveal the narrative turning point</summary>'+
 '<p>'+c.turn+'</p>'+
 '<p>Every empirical inference requires original records, a transparent selection rule and explicit modelling assumptions. <a href="https://wviechtb.github.io/metafor/reference/escalc.html" target="_blank" rel="noopener">Verify the thirteen source records ↗</a></p></details>'+
 '<p class="story-links"><a href="evidence-story-lab.html" target="_blank" rel="noopener">Explore the real six-row BCG case ↗</a> · '+
 '<a href="https://www.metafor-project.org/doku.php/analyses:berkey1995" target="_blank" rel="noopener">Verify all 13 original data rows ↗</a></p>'+
 '<p class="story-caveat">Source-based narrative, not a reconstructed historical conversation or clinical guidance. English-only pilot '+(lang==='en'?'':'(untranslated and unreviewed in '+lang+')')+'; all 12 original course languages remain accessible.</p></div>';
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
 [3,7,9,22].forEach(id=>{
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