/* Synthesis Research Studio UI. Client-side educational casework.
 * AllMeta is a separately deployed project. Only approved ma-studies-v1
 * write operations are performed when both projects share an origin.
 */
(function(){
'use strict';
const core=window.SynthesisResearchCore;
const deps={MagnesiumReversal:window.MagnesiumReversal,SYNTHESIS_REAL_DATA:window.SYNTHESIS_REAL_DATA};
const $=id=>document.getElementById(id);
if(!core||!deps.MagnesiumReversal||!deps.SYNTHESIS_REAL_DATA||!$('studioMain')){
 if($('studioMain'))$('studioMain').textContent='Research Studio source datasets did not load. Reopen the published module or inspect the browser console.';
 return;
}
const STORAGE='synthesis_research_studio_v1';
const seed=core.fresh();
let st=seed;
try {
 const prev=JSON.parse(localStorage.getItem(STORAGE)||'null');
 if(prev&&prev.version===1&&prev.protocol&&prev.screening&&prev.living&&prev.stats&&prev.review&&prev.capstone)st=prev;
}catch(_){/* absent or blocked local storage; keep in-memory draft */ }
const recs=core.records(deps);
let resetPending=false;
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify(st));}catch(_){}}
function node(tag,text,className){
 const x=document.createElement(tag);
 if(text!==undefined&&text!==null)x.textContent=String(text);
 if(className)x.className=className;
 return x;
}
function status(id,text){$(id).textContent=text;}
function download(content,name,type){
 const blob=new Blob([content],{type:type||'text/markdown;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
 if(typeof setTimeout==='function')setTimeout(()=>URL.revokeObjectURL(url),0);
}
function lang(){
 const v=new URL(location.href).searchParams.get('lang');
 return /^(en|ar|de|es|fr|hi|it|ja|ko|pt|ru|zh)$/.test(v||'')?v:'en';
}
$('languageStatus').textContent=lang()==='en'?
 'This new Research Studio is an English-language pilot. The twelve established Synthesis language courses are unaffected.':
 'English-only teaching pilot opened from the '+lang()+' course route. These prompts have not been translated or reviewed by native-speaking methods experts; they are provisional. The original twelve-language course remains accessible.';
function progress(){
 const flags=core.completion(st,deps),count=core.STAGES.filter(s=>flags[s]).length;
 $('overallStatus').textContent=count+'/6 learner-practice stages completed. This measures engagement and reporting completeness, not competence or scientific validity.';
 $('progressMeter').setAttribute('aria-valuenow',String(count));
 $('meterFill').style.width=(count/6*100)+'%';
 document.querySelectorAll('[data-nav]').forEach(x=>x.classList.toggle('completed',!!flags[x.dataset.nav]));
}
function renderProtocol(){
 for(const field of ['pico','inclusion','outcome']){
  $(field).value=st.protocol[field]||'';
  $(field).disabled=!!st.protocol.locked;
 }
 $('lockProtocol').disabled=!!st.protocol.locked;
 status('protocolFeedback',st.protocol.locked?
  'Frozen locally for this exercise. Treat subsequent changes as deviations; reset the studio to start a different protocol.':
  'Complete all three protocol fields (at least 18 characters each), then freeze before starting the practice screening.');
}
$('lockProtocol').addEventListener('click',()=>{
 if(st.protocol.locked)return;
 const p={pico:core.validText($('pico').value),inclusion:core.validText($('inclusion').value),
  outcome:core.validText($('outcome').value),locked:false};
 if(!core.protocolValid(p)){status('protocolFeedback','Your PICO, eligibility/retrieval rule and outcome must each contain at least 18 characters. A dated real protocol would require further source and governance checks.');return;}
 st.protocol={...p,locked:true};persist();renderProtocol();progress();
});
function phase(){
 if(!core.screenPassComplete(st.screening.A,recs))return 'A';
 if(!core.screenPassComplete(st.screening.B,recs))return 'B';
 return 'final';
}
function renderScreen(){
 const which=phase(),panel=$('screenPanel'),box=$('screenCase'),finalBox=$('adjudication');
 finalBox.replaceChildren();
 if(which==='A'||which==='B'){
  $('recordScreen').hidden=false;$('screenChoice').hidden=false;$('screenReason').hidden=false;
  panel.querySelector('label[for=screenChoice]').hidden=false;
  panel.querySelector('label[for=screenReason]').hidden=false;
  finalBox.hidden=true;
  const progressN=Object.keys(st.screening[which]).filter(k=>core.screenPassComplete({[k]:st.screening[which][k]},recs.filter(r=>String(r.id)===k))).length;
  const next=recs.find(r=>!st.screening[which][r.id]||st.screening[which][r.id].reason.length<8);
  status('screenPhase','Reviewer '+which+' — private teaching pass · '+progressN+'/6 recorded'+(which==='B'?'. Reviewer A decisions are deliberately hidden.':''));
  if(!next)return;
  box.replaceChildren(node('strong',next.label),node('p','Published archive counts: magnesium '+next.numerator+'/'+next.denominator+', control '+next.controlEvents+'/'+next.controlN+'. Counts alone cannot adjudicate design or eligibility.'));
  $('screenChoice').value='';$('screenReason').value='';
  status('screenFeedback','Select a teaching disposition and record a source-aware reason. For genuine inclusion, consult the primary report.');
  return;
 }
 $('recordScreen').hidden=true;$('screenChoice').hidden=true;$('screenReason').hidden=true;
 panel.querySelector('label[for=screenChoice]').hidden=true;
 panel.querySelector('label[for=screenReason]').hidden=true;
 box.replaceChildren();
 finalBox.hidden=false;
 const rec=core.reconcile(st.screening,recs);
 status('screenPhase','Adjudication — both private passes are recorded; '+rec.disagreements+' disagreements. Decisions require full-publication verification outside this exercise.');
 for(const row of rec.rows){
  const wrapper=node('div',null,'adjudication-card');wrapper.dataset.id=String(row.id);
  wrapper.append(node('strong',recs.find(r=>r.id===row.id).label),
   node('p','Reviewer A: '+row.A+' · Reviewer B: '+row.B+(row.disagreement?' · disagreement':' · agreement')));
  const select=node('select');select.setAttribute('aria-label','Final archive-row decision '+row.id);
  const empty=node('option','Choose final disposition');empty.value='';select.append(empty);
  for(const choice of core.SCREEN_CHOICES){const opt=node('option',choice);opt.value=choice;select.append(opt);}
  select.value=st.screening.final[row.id]?.decision||'';
  const reason=node('textarea');reason.rows=2;reason.placeholder='Explain your final disposition after checking the evidence';reason.setAttribute('aria-label','Adjudication reason '+row.id);
  reason.value=st.screening.final[row.id]?.reason||'';
  const button=node('button','Save final disposition');button.type='button';button.dataset.final=String(row.id);
  const flag=node('span',row.resolved?' Recorded':' Not yet resolved','feedback');
  wrapper.append(select,reason,button,flag);finalBox.append(wrapper);
 }
 status('screenFeedback',rec.complete?
  'Archive-row adjudication ledger complete. This is still not a verified systematic review eligibility assessment.':
  'Document a final disposition and rationale for every archive row; unresolved disagreements are not silently discarded.');
 progress();
}
$('recordScreen').addEventListener('click',()=>{
 const which=phase();if(which==='final')return;
 const next=recs.find(r=>!st.screening[which][r.id]||st.screening[which][r.id].reason.length<8);
 if(!next)return;
 const decision=$('screenChoice').value,reason=core.validText($('screenReason').value,700);
 if(!core.SCREEN_CHOICES.includes(decision)||reason.length<8){status('screenFeedback','Choose a disposition and explain your reasoning in at least 8 characters.');return;}
 st.screening[which][next.id]={decision,reason};persist();renderScreen();
});
$('adjudication').addEventListener('click',e=>{
 const b=e.target.closest('button[data-final]');if(!b)return;
 const id=Number(b.dataset.final),card=b.closest('[data-id]'),
  choice=card.querySelector('select').value,reason=core.validText(card.querySelector('textarea').value,700);
 if(!core.SCREEN_CHOICES.includes(choice)||reason.length<8){status('screenFeedback','Adjudication requires a choice and a clear reason (at least 8 characters).');return;}
 st.screening.final[id]={decision:choice,reason};persist();renderScreen();
});
function renderLiving(){
 const table=$('livingTable');table.replaceChildren();
 for(const snap of core.snapshots(deps)){
  if(!st.living.revealed.includes(snap.year))continue;
  const tr=node('tr');
  for(const v of [snap.year,snap.k,snap.or.toFixed(3),snap.lower.toFixed(3)+'–'+snap.upper.toFixed(3),st.living.predictions[snap.year]||'']){
    tr.append(node('td',v));
  }
  table.append(tr);
 }
 const val=Number($('livingYear').value);
 $('livingPrediction').value=st.living.predictions[val]||'';
 $('livingPrediction').disabled=st.living.revealed.includes(val);
 $('revealLiving').disabled=st.living.revealed.includes(val);
 if(st.living.revealed.includes(val)){
  const snap=core.snapshots(deps).find(x=>x.year===val);
  status('livingFeedback','This retrospective selected subset through '+val+' includes k='+snap.k+' and gives Peto OR '+snap.or.toFixed(3)+' (95% CI '+snap.lower.toFixed(3)+'–'+snap.upper.toFixed(3)+'). Your prediction was '+st.living.predictions[val]+'. This was not a registered year-specific review.');
 }else status('livingFeedback','Record a prediction before unlocking the result for '+val+'. You may choose “uncertain”; methodological caution is a valid response.');
}
$('livingYear').addEventListener('change',renderLiving);
$('revealLiving').addEventListener('click',()=>{
 const year=Number($('livingYear').value),prediction=$('livingPrediction').value;
 if(!core.YEARS.includes(year)||!['below','near','above','uncertain'].includes(prediction)){status('livingFeedback','Choose a year and pre-reveal prediction.');return;}
 if(st.living.revealed.includes(year))return;
 st.living.predictions[year]=prediction;st.living.revealed.push(year);persist();renderLiving();progress();
});
function ids(){return st.stats.selected;}
function renderStats(){
 const div=$('hinePicks');div.replaceChildren();
 for(const row of core.hinesRows(deps)){
  const label=node('label'),input=node('input');input.type='checkbox';input.value=String(row.id);
  input.checked=ids().includes(row.id);input.dataset.hine=String(row.id);
  const span=node('span',row.label),small=node('small','Lidocaine deaths '+row.events+'/'+row.n+' vs control '+row.controlEvents+'/'+row.controlN);
  span.append(small);label.append(input,span);div.append(label);
 }
 if(!st.stats.inspected){$('hineResult').textContent='Choose at least two records, then run the common-effect risk-difference calculation.';return;}
 try{
 const a=core.hines(deps,ids());
 $('hineResult').textContent='Source-linked teaching estimator: RD '+a.rd.toFixed(6)+' (95% CI '+a.lower.toFixed(6)+' to '+a.upper.toFixed(6)+'), k='+a.k+', Q='+a.Q.toFixed(4)+', I²='+a.I2.toFixed(1)+'%. Positive RD denotes higher death risk in the lidocaine arm. This is not clinical advice.';
 }catch(e){$('hineResult').textContent='At least two source records are needed before pooling.';}
}
$('hinePicks').addEventListener('change',e=>{
 if(!e.target.matches('input[data-hine]'))return;
 st.stats.selected=Array.from($('hinePicks').querySelectorAll('input:checked')).map(x=>Number(x.value));
 st.stats.inspected=false;persist();renderStats();progress();
});
$('calculateHine').addEventListener('click',()=>{
 try{core.hines(deps,ids());st.stats.inspected=true;persist();renderStats();progress();}
 catch(e){$('hineResult').textContent='Choose at least two valid study rows before calculating.';}
});
function renderApps(){
 const links=core.APPS.filter(a=>a.stage==='stats');
 const box=$('appLinks');box.replaceChildren();
 for(const app of links){const link=node('a',app.name+' ↗','app-link');link.href=core.ORIGIN+app.path;link.target='_blank';link.rel='noopener noreferrer';box.append(link);}
}
$('stageAllMeta').addEventListener('click',()=>{
 try{
  const payload=core.busPayload(deps,ids());
  const result=core.stageBus(localStorage,location.hostname,location.pathname,false,payload);
  if(result.code==='different-origin'){status('handoffFeedback','These pages do not currently share the expected GitHub Pages origin. Nothing was written. Download the CSV and import it manually into AllMeta.');return;}
  let done=result;
  if(result.code==='occupied'){
   let count='an existing project';
   try{const prior=JSON.parse(localStorage.getItem(core.BUS_KEY));if(Array.isArray(prior.studies))count=prior.studies.length+' existing rows';}catch(_){}
   const allow=window.confirm('AllMeta shared study bus already contains '+count+'. REPLACE ONLY that AllMeta bus dataset with '+payload.studies.length+' source-verified Hine risk-difference rows? Other local projects may depend on it. Cancel to preserve all existing data.');
   if(!allow){status('handoffFeedback','Nothing changed in AllMeta. You can download the CSV instead.');return;}
   done=core.stageBus(localStorage,location.hostname,location.pathname,true,payload);
  }
  status('handoffFeedback',done.ok?
   'Staged '+done.count+' Hine RD rows using AllMeta’s documented ma-studies-v1 format on the shared origin. In AllMeta, choose “Load from bus”, set effect label “Risk difference” and null 0, then separately verify the model and output.':
   'Unable to stage studies ('+done.code+'). Nothing was claimed transferred; use the downloadable CSV.');
 }catch(e){status('handoffFeedback','Unable to stage effects: '+e.message+'. The AllMeta bus was not intentionally overwritten; download CSV instead.');}
});
$('downloadCSV').addEventListener('click',()=>{
 try{download(core.handoffCsv(deps,ids()),'synthesis-hine-risk-difference-study-effects.csv','text/csv;charset=utf-8');
  status('handoffFeedback','Study-level CSV export requested: label, RD estimate, and standard error. For AllMeta use identity effect scale and null 0.');}
 catch(e){status('handoffFeedback','Choose at least two valid studies. Browser download failed or CSV data unavailable.');}
});
function renderReview(){
 const panel=$('challengePanel');panel.replaceChildren();
 for(const q of core.CHALLENGES){
  const section=node('section',null,'challenge');section.dataset.challenge=q.id;
  section.append(node('h3',q.q),node('p','Domain: '+q.skill));
  const choices=node('div',null,'choices');
  q.choices.forEach((choice,i)=>{
   const b=node('button',String.fromCharCode(65+i)+'. '+choice);
   b.type='button';b.dataset.question=q.id;b.dataset.answer=String(i);
   b.setAttribute('aria-pressed',String(st.review.answers[q.id]===i));choices.append(b);
  });
  section.append(choices);
  if(Number.isInteger(st.review.answers[q.id])){
   const answer=core.challenge(q.id,st.review.answers[q.id]);
   section.append(node('p',(answer.correct?'Supported. ':'Revisit this decision. ')+answer.explain,'feedback'));
  }
  panel.append(section);
 }
 const suggestions=core.recommend(st.review.misses).slice(0,3);
 const mastery=$('masteryPanel');mastery.replaceChildren(node('h3','Adaptive practice suggestions'));
 mastery.append(node('p','Recommendations reflect your recorded misconceptions. They are not a diagnosis of competence or an automated review of your written answers.'));
 const ul=node('ul');
 for(const r of suggestions){const li=node('li');li.append(node('span',r.skill+': '+r.misses+' recorded first-attempt misconceptions · '));const a=node('a','Practise with '+r.title+' ↗');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);ul.append(li);}
 mastery.append(ul);
}
$('challengePanel').addEventListener('click',e=>{
 const b=e.target.closest('button[data-question]');if(!b)return;
 const id=b.dataset.question,index=Number(b.dataset.answer),answer=core.challenge(id,index);
 if(!answer.correct&&!st.review.wrongFirst?.[id]){
  st.review.wrongFirst=st.review.wrongFirst||{};
  st.review.wrongFirst[id]=true;
  st.review.misses[answer.skill]=(st.review.misses[answer.skill]||0)+1;
 }
 st.review.answers[id]=index;persist();renderReview();progress();
});
function renderCapstone(){
 for(const [id,key] of [['capInterpretation','interpretation'],['capLimitations','limitations'],['capNext','nextSteps']]){
  $(id).value=st.capstone[key]||'';
 }
 status('capstoneFeedback',st.capstone.saved?
 'The draft has been saved locally. Its text was checked for presence, NOT clinical or methodological correctness. External methods review is still needed.':
 'Complete the earlier tasks and draft at least 60 characters in each capstone field before saving. Draft export is available at any time.');
}
for(const [id,key] of [['capInterpretation','interpretation'],['capLimitations','limitations'],['capNext','nextSteps']]){
 $(id).addEventListener('input',()=>{
  st.capstone[key]=core.validText($(id).value,3500);st.capstone.saved=false;persist();progress();
 });
}
$('saveCapstone').addEventListener('click',()=>{
 for(const [id,key] of [['capInterpretation','interpretation'],['capLimitations','limitations'],['capNext','nextSteps']])st.capstone[key]=core.validText($(id).value,3500);
 const flags=core.completion(st,deps),missing=core.STAGES.slice(0,5).filter(k=>!flags[k]);
 if(missing.length){status('capstoneFeedback','To save a complete practicum, first finish: '+missing.join(', ')+'. Your writing remains saved as a draft.');persist();return;}
 if(['interpretation','limitations','nextSteps'].some(k=>st.capstone[k].length<60)){
  status('capstoneFeedback','Provide substantive interpretation, limitations and next steps (at least 60 characters each). This is a completeness check, not expert adjudication.');persist();return;
 }
 st.capstone.saved=true;persist();renderCapstone();progress();
 status('capstoneFeedback','Your capstone draft was saved as a self-assessed learning record, not a verified systematic review or accredited competency.');
 if(window.parent!==window)window.parent.postMessage({type:'SYNTHESIS_RESEARCH_STUDIO_DONE',stage:'capstone'},location.origin);
});
$('exportDossier').addEventListener('click',()=>{
 try{download(core.dossier(st,deps),'synthesis-research-studio-capstone.md');status('capstoneFeedback','Markdown dossier export requested. Verify the underlying source documents and calculations before sharing any scientific claims.');}
 catch(e){status('capstoneFeedback','Unable to export dossier: '+e.message);}
});
$('resetStudio').addEventListener('click',()=>{
 if(!resetPending){resetPending=true;$('resetStudio').textContent='Confirm reset — lose THIS studio draft';status('resetFeedback','Select again to clear only the Research Studio draft. AllMeta study bus and other course progress will not be cleared.');return;}
 st=core.fresh();resetPending=false;persist();$('resetStudio').textContent='Reset Research Studio draft (two-click confirmation)';
 status('resetFeedback','Research Studio practice draft reset. The AllMeta bus and other course progress were not changed.');
 renderAll();
});
function renderAll(){renderProtocol();renderScreen();renderLiving();renderStats();renderApps();renderReview();renderCapstone();progress();}
renderAll();
const start=new URL(location.href).searchParams.get('station');
if(core.STAGES.includes(start)){
 const dest=$(start+'Station');
 if(dest&&typeof dest.scrollIntoView==='function')dest.scrollIntoView({block:'start',behavior:'auto'});
}
})();
