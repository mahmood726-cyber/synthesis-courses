/* Evidence Decision Arena interaction layer. Browser-only; local draft data only.
   Real records are from source-linked R packages. Scores never certify competence. */
(function(){
'use strict';
const api=window.SynthesisArenaCore;
const host={MagnesiumReversal:window.MagnesiumReversal,EvidenceStoryMath:window.EvidenceStoryMath,
  SYNTHESIS_REAL_DATA:window.SYNTHESIS_REAL_DATA};
const $=id=>document.getElementById(id);
if(!api||!host.MagnesiumReversal||!host.EvidenceStoryMath||!host.SYNTHESIS_REAL_DATA||!$('caseButtons'))return;
const engine=api.build(host),KEY='synthesis_evidence_arena_v1';
let active, pendingReset=false;
let store;
try{
  const data=JSON.parse(localStorage.getItem(KEY)||'{}');
  store=data&&typeof data==='object'&&!Array.isArray(data)?data:{};
}catch(e){store={};}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){/* Keep usable in privacy modes. */}}
function state(){return store[active]||{};}
function save(st){store[active]=st;persist();}
const q=new URL(location.href).searchParams;
const lang=q.get('lang')||'en',start=q.get('case')||'magnesium';
$('languageState').textContent=lang==='en'?
  'English pilot; no independent assessment of language, accessibility or learning outcomes. The established 12 course routes remain available.':
  'English-only pilot shown from the '+lang+' course route. This activity has not been professionally translated or reviewed. The existing 12 language routes remain accessible.';
const source=e=>e.caseDef||engine.describe(active).caseDef;
function moveDirection(st){
  const d=engine.describe(active);
  return st.prediction===d.move?
    'Prediction matched the computed direction. This is a numerical check, not evidence that the selected sample represents the full review.':
    'Your prediction differed from the calculated direction ('+d.move+' the no-effect value). Explore the assumptions rather than changing eligibility to force the prediction.';
}
function renderPicker(st){
  const target=$('studyPicks');target.replaceChildren();
  const c=engine.describe(active).caseDef;
  const selected=new Set(st.chosen||c.baseline);
  for(const study of engine.rows(active)){
    const label=document.createElement('label');
    const input=document.createElement('input');input.type='checkbox';input.value=String(study.id);
    input.checked=selected.has(study.id);input.dataset.study=String(study.id);
    const span=document.createElement('span');
    span.textContent=study.name+(study.id===c.added?' (contrasting sixth record)':'');
    label.append(input,span);target.append(label);
  }
}
function elem(svg,tag,attrs,text){
  const node=document.createElementNS('http://www.w3.org/2000/svg',tag);
  for(const [k,v] of Object.entries(attrs||{}))node.setAttribute(k,String(v));
  if(text!==undefined)node.textContent=String(text);
  svg.append(node);
  return node;
}
function plot(before,after,now,c){
  const el=$('comparisonPlot');el.replaceChildren();
  const fig=document.createElement('figure');fig.style.margin='0';
  const label=document.createElement('figcaption');
  label.textContent='Effect and normal-approximation 95% intervals. Baseline and added-study estimates are retrospective teaching selections; not full clinical reviews.';
  fig.append(label);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 760 230');
  svg.setAttribute('role','img');
  svg.setAttribute('aria-label','Comparison of baseline, with candidate added, and your selection for '+c.unit+', including 95% confidence intervals.');
  const trans=v=>c.nullValue===1?Math.log(v):v;
  const vals=[before,after,now],finite=vals.flatMap(v=>[v.low,v.high]).map(trans);
  finite.push(trans(c.nullValue));
  let minimum=Math.min(...finite),maximum=Math.max(...finite),width=maximum-minimum;
  if(!(width>0))width=1;
  minimum-=width*.12;maximum+=width*.12;
  const pos=v=>195+(trans(v)-minimum)/(maximum-minimum)*490;
  const zero=pos(c.nullValue);
  elem(svg,'line',{x1:zero,x2:zero,y1:20,y2:178,stroke:'#cb8130','stroke-width':2,'stroke-dasharray':'5 6'});
  [['Five-row baseline',before],['With sixth record',after],['Your selection',now]].forEach(([title,r],i)=>{
    const y=44+i*58;
    elem(svg,'text',{x:4,y:y+4,'font-size':14,fill:'#23485a'},title);
    elem(svg,'line',{x1:pos(r.low),x2:pos(r.high),y1:y,y2:y,stroke:'#155e79','stroke-width':3});
    [r.low,r.high].forEach(v=>elem(svg,'line',{x1:pos(v),x2:pos(v),y1:y-6,y2:y+6,stroke:'#155e79'}));
    elem(svg,'circle',{cx:pos(r.estimate),cy:y,r:6,fill:i===2?'#14654e':'#275fa5'});
    elem(svg,'text',{x:696,y:y+4,'font-size':13,fill:'#23485a'},engine.format(active,r.estimate));
  });
  elem(svg,'text',{x:zero,y:208,'text-anchor':'middle','font-size':13,fill:'#725322'},'No effect ('+c.nullValue+')');
  fig.append(svg);el.append(fig);
}
function stageStatus(st){
  const steps=[!!st.locked,!!st.locked,!!st.experimented,st.verdict==='transparent',!!st.completed];
  steps.forEach((ok,i)=>{
    const cell=$('p'+(i+1));
    cell.classList.toggle('done',ok);
    cell.classList.toggle('active',!ok&&(i===0||steps[i-1]));
  });
  const completed=engine.cases.filter(c=>store[c.id]?.completed).length;
  $('progressText').textContent='Locally completed practice cases: '+completed+'/3. A completed case means the learner saved a self-reviewed narrative, not that an expert certified its accuracy.';
}
function render(){
  const d=engine.describe(active),c=d.caseDef,st=state();
  pendingReset=false;$('resetCase').textContent='Reset current case';
  $('caseButtons').replaceChildren();
  for(const caseDef of engine.cases){
    const btn=document.createElement('button');btn.type='button';btn.className='case-pick';
    btn.dataset.case=caseDef.id;btn.setAttribute('aria-current',String(caseDef.id===active));
    const strong=document.createElement('strong');strong.textContent=caseDef.title;
    const span=document.createElement('span');span.textContent=caseDef.source+' · '+caseDef.unit+' · '+(store[caseDef.id]?.completed?'Self-reviewed':'Open case');
    btn.append(strong,span);$('caseButtons').append(btn);
  }
  $('caseTitle').textContent=c.title;
  $('caseModel').textContent=c.model;
  $('caseIntro').textContent=c.episode;
  $('caseDisclosure').textContent='Original archive: '+c.archiveCount+' records. This is a source-linked teaching selection with six or fewer records, not a systematic review. '+c.limitation;
  $('caseSource').href=c.sourceUrl;
  document.querySelectorAll('input[name=scope],input[name=prediction]').forEach(input=>{
    input.checked=st[input.name]===input.value;input.disabled=!!st.locked;
  });
  $('commitButton').disabled=!!st.locked;
  $('commitFeedback').textContent=st.locked?
    (st.scope==='report'?'Methodologically defensible scope. ':'Omitting an inconvenient study is not a defensible eligibility rule. ')+moveDirection(st):
    'Record a selection policy and prediction before the sixth-row calculation is revealed.';
  $('analysisStage').hidden=!st.locked;
  $('reviewStage').hidden=!st.experimented;
  $('reportStage').hidden=st.verdict!=='transparent';
  $('precommitRecord').textContent='Your recorded prediction: '+(st.prediction||'none')+' the no-effect value. Expected numerical direction after adding the sixth row: '+d.move+'.';
  $('studyStory').textContent=c.why;
  $('methodWarning').textContent='Clinical interpretation remains unresolved: '+c.limitation+' The chosen calculation is a teaching diagnostic, not proof that one treatment should or should not be used.';
  $('peerPrompt').textContent='A peer reviewer challenges your conclusion: the source contains '+c.archiveCount+
    ' records, but this display offers six. Which statement can you defend after checking the actual source and the method?';
  $('editorialNote').value=String(st.note||'');
  $('reportFeedback').textContent=st.completed?'Saved locally as a learner-authored, ungraded and unverified decision record.':'A complete narrative must be checked by a human if used for formal assessment.';
  document.querySelectorAll('.audit input').forEach(x=>x.checked=(st.checks||[]).includes(x.value));
  if(st.locked){
    renderPicker(st);
    const included=st.chosen||c.baseline;
    if(included.length>=2){
      const now=engine.analyse(active,included);
      $('numericResult').textContent=c.unit+' '+engine.format(active,now.estimate)+
        ' (95% CI '+engine.format(active,now.low)+'–'+engine.format(active,now.high)+'), k='+now.k+'.';
      plot(d.before,d.after,now,c);
    }else{
      $('numericResult').textContent='Select at least two records for this estimator.';
      $('comparisonPlot').replaceChildren();
    }
    $('analysisFeedback').textContent=st.experimented?
      'Your inclusion changes are saved as post hoc sensitivity explorations. You must defend study eligibility separately.':
      'Change the selection or use a preset to compare the effect before proceeding to peer review.';
  }
  $('reviewFeedback').textContent=st.verdict?engine.verdict(active,st.verdict).feedback:'Choose the claim you could defend in a methods review.';
  stageStatus(st);
}
function selectCase(id){
  if(!engine.cases.some(c=>c.id===id))return;
  active=id;
  try{const url=new URL(location.href);url.searchParams.set('case',id);history.replaceState(null,'',url);}catch(_){}
  render();
}
$('caseButtons').addEventListener('click',e=>{
 const button=e.target.closest('[data-case]');if(button)selectCase(button.dataset.case);
});
$('commitButton').addEventListener('click',()=>{
 const scope=document.querySelector('input[name=scope]:checked'),prediction=document.querySelector('input[name=prediction]:checked');
 if(!scope||!prediction){$('commitFeedback').textContent='Select both a policy and a prediction before opening the numerical investigation.';return;}
 const s=state();if(s.locked)return;
 s.scope=scope.value;s.prediction=prediction.value;s.locked=true;s.chosen=[...engine.describe(active).caseDef.baseline];s.experimented=false;s.checks=[];
 save(s);render();
});
function selectIds(ids,reason){
 const s=state();if(!s.locked)return;
 s.chosen=[...ids];s.experimented=true;s.completed=false;save(s);render();
 $('analysisFeedback').textContent=reason;
}
$('showBaseline').addEventListener('click',()=>selectIds(engine.describe(active).caseDef.baseline,'Baseline restored. Compare its estimate with the six-row result before drawing any clinical conclusion.'));
$('showCandidate').addEventListener('click',()=>{
 const c=engine.describe(active).caseDef;
 selectIds([...c.baseline,c.added],'Sixth record added. Inspect how much the pooled estimate changed; the selection remains a classroom construction.');
});
$('studyPicks').addEventListener('change',e=>{
 if(!e.target.matches('input[data-study]'))return;
 const ids=Array.from($('studyPicks').querySelectorAll('input:checked')).map(x=>Number(x.value));
 selectIds(ids,'Post hoc selection changed. A numerical effect is not an eligibility verdict.');
});
$('reviewStage').addEventListener('click',e=>{
 const b=e.target.closest('button[data-verdict]');if(!b||!state().experimented)return;
 const s=state();s.verdict=b.dataset.verdict;
 if(s.verdict!=='transparent')s.completed=false;
 save(s);render();
});
$('editorialNote').addEventListener('input',()=>{const s=state();s.note=$('editorialNote').value; s.completed=false;save(s);});
$('reportStage').addEventListener('change',e=>{
 if(!e.target.matches('.audit input'))return;
 const s=state();s.checks=Array.from(document.querySelectorAll('.audit input:checked')).map(x=>x.value);s.completed=false;save(s);
});
$('saveReport').addEventListener('click',()=>{
 const s=state();s.note=$('editorialNote').value.trim();
 s.checks=Array.from(document.querySelectorAll('.audit input:checked')).map(x=>x.value);
 if(s.note.length<60||s.checks.length<5){
   $('reportFeedback').textContent='Continue drafting (at least 60 characters) and review all five method-reporting prompts. Checking a box is your own acknowledgement, not expert validation.';save(s);return;
 }
 s.completed=true;save(s);render();
 $('reportFeedback').textContent='Your draft is saved locally. It is self-reviewed and needs expert assessment before use as a formal competency claim.';
 if(window.parent!==window)window.parent.postMessage({type:'SYNTHESIS_ARENA_DONE',caseId:active},location.origin);
});
$('exportReport').addEventListener('click',()=>{
 const s=state();const content=engine.exportText(active,s);
 try{
   const blob=new Blob([content],{type:'text/markdown;charset=utf-8'});
   const href=URL.createObjectURL(blob),link=document.createElement('a');
   link.href=href;link.download='synthesis-evidence-dossier-'+active+'.md';document.body.append(link);link.click();link.remove();
   setTimeout(()=>URL.revokeObjectURL(href),0);
   $('reportFeedback').textContent='Local Markdown export requested. This is a learner dossier, not a verified systematic review.';
 }catch(e){$('reportFeedback').textContent='Export could not be started here. Your work remains saved locally in this browser.';}
});
$('resetCase').addEventListener('click',()=>{
 if(!pendingReset){pendingReset=true;$('resetCase').textContent='Confirm reset (current case only)';return;}
 delete store[active];persist();render();
});
selectCase(engine.cases.some(x=>x.id===start)?start:'magnesium');
})();