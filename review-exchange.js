/* Review Exchange browser UI. No network calls, no identities authenticated.
 * Sharing completed packs is under human control, on separate devices ideally.
 */
(function(){
'use strict';
const core=window.SynthesisReviewExchange;
const $=id=>document.getElementById(id);
if(!core||!$('reviewCards'))return;
let compared=null,audit=null,resetPending=false;
function element(tag,value,className){
 const e=document.createElement(tag);
 if(value!==undefined&&value!==null)e.textContent=String(value);
 if(className)e.className=className;
 return e;
}
function output(content,name,type){
 const blob=new Blob([content],{type:type||'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
 if(typeof setTimeout==='function')setTimeout(()=>URL.revokeObjectURL(url),0);
}
function choices(select){
 select.replaceChildren();
 const blank=element('option','Choose a disposition…');blank.value='';select.append(blank);
 for(const value of core.CHOICES){
  const option=element('option',value==='unclear'?'Unclear; retrieve primary report':value);
  option.value=value;select.append(option);
 }
}
function renderReviewer(){
 const box=$('reviewCards');box.replaceChildren();
 for(const row of core.ROWS){
  const card=element('section',null,'card');card.dataset.studyId=String(row.id);
  const heading=element('h3',row.label);
  const details=element('p','Archival deaths: magnesium '+row.a+'/'+row.n1+
   '; control '+row.c+'/'+row.n0+' — not sufficient for full-text eligibility.');
  const decisionLabel=element('label','Your independent disposition');
  const select=element('select');select.className='review-choice';
  select.setAttribute('aria-label','Independent choice for '+row.label);choices(select);
  const reasonLabel=element('label','Reason based on a prespecified rule and source checks');
  const reason=element('textarea');reason.rows=2;reason.className='review-reason';
  reason.placeholder='Explain the basis; counts alone do not establish eligibility.';
  reason.setAttribute('aria-label','Reason for '+row.label);
  const checked=element('label');const checkbox=element('input');
  checkbox.type='checkbox';checkbox.className='fulltext-checked';
  checked.append(checkbox,element('span','I independently examined the primary full text for this record (self-declaration; leave unchecked if not done)'));
  card.append(heading,details,decisionLabel,select,reasonLabel,reason,checked);
  box.append(card);
 }
}
function submittedEntries(){
 return [...$('reviewCards').querySelectorAll('[data-study-id]')].map(card=>({
  id:Number(card.dataset.studyId),
  decision:card.querySelector('select').value,
  reason:card.querySelector('textarea').value,
  fullTextChecked:card.querySelector('input[type=checkbox]').checked
 }));
}
$('exportReview').addEventListener('click',()=>{
 try{
  const p=core.makePack($('reviewerLabel').value,submittedEntries(),
   new Date().toISOString(),$('eligibilityRule').value);
  const filename='synthesis-independent-review-'+p.authorLabel.toLowerCase().replace(/[^a-z0-9_-]+/g,'-').slice(0,35)+'.json';
  output(JSON.stringify(p,null,2)+'\n',filename);
  $('reviewStatus').textContent='Independent decision pack exported locally. Keep it private until all reviewers finish; the label does not authenticate a different person.';
 }catch(e){$('reviewStatus').textContent='Cannot export yet: '+e.message;}
});
$('resetReview').addEventListener('click',()=>{
 if(!resetPending){resetPending=true;$('resetReview').textContent='Confirm reset of this reviewer draft';$('reviewStatus').textContent='Select reset again to clear this browser form. Download first if you want to retain the decisions.';return;}
 resetPending=false;$('reviewerLabel').value='';$('eligibilityRule').value='';renderReviewer();
 $('resetReview').textContent='Reset reviewer draft';
 $('reviewStatus').textContent='Independent reviewer form cleared. No other reviewer packs were deleted.';
});
function clearAudit(){
 audit=null;$('downloadAuditJson').disabled=true;$('downloadAuditMd').disabled=true;
}
function present(a,b){
 compared=core.compare(a,b);
 clearAudit();$('compareResults').hidden=false;
 const score=compared.kappa===null?'not estimable':compared.kappa.toFixed(3);
 $('agreementSummary').textContent=compared.agreed+'/6 agreements; '+compared.disagreements+
  ' disagreements. Raw agreement '+(100*compared.observed).toFixed(1)+'%, Cohen’s κ '+score+'.';
 $('compareStatus').textContent='Both files validated against the same six-row source archive; reviewer labels differ (self-reported, not authenticated). Adjudicate every record.';
 const box=$('adjudicationRows');box.replaceChildren();
 for(const row of compared.rows){
  const card=element('section',null,'adjudication-card');
  card.dataset.id=String(row.id);card.dataset.disagreement=String(row.disagree);
  card.append(element('h3',row.label),element('p',row.disagree?'Reviewer decisions disagree':'Reviewer decisions agree'));
  const pair=element('div',null,'reviewer-pair');
  const colA=element('div');
  colA.append(element('strong','A: '+row.A),element('p','Reason: '+row.reasonA),
    element('small','Primary text checked: '+(row.fullTextA?'Self-declared yes':'No / not declared'),'review-source'));
  const colB=element('div');
  colB.append(element('strong','B: '+row.B),element('p','Reason: '+row.reasonB),
    element('small','Primary text checked: '+(row.fullTextB?'Self-declared yes':'No / not declared'),'review-source'));
  pair.append(colA,colB);card.append(pair);
  const selectLabel=element('label','Final adjudicated disposition');
  const select=element('select');select.className='final-choice';
  select.setAttribute('aria-label','Final disposition for '+row.label);choices(select);
  const reasonLabel=element('label','Final adjudication rationale (required even when the reviewers agree)');
  const reason=element('textarea');reason.className='final-reason';reason.rows=2;
  reason.setAttribute('aria-label','Final reason for '+row.label);
  const checkedLabel=element('label');const flag=element('input');flag.type='checkbox';flag.className='adjudicator-fulltext';
  checkedLabel.append(flag,element('span','Adjudicator inspected the full text (self-declaration)'));
  card.append(selectLabel,select,reasonLabel,reason,checkedLabel);box.append(card);
 }
 $('auditStatus').textContent='Give a final disposition and substantive written reason for all six rows. Completion is not a clinical eligibility certification.';
}
async function readFile(input){
 const file=input.files?.[0];if(!file)throw Error('Choose both reviewer JSON files');
 if(file.size>100000)throw Error('Review file exceeds 100 KB');
 if(typeof file.text==='function')return JSON.parse(await file.text());
 // Older browsers: use FileReader without uploading anything.
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onerror=()=>reject(Error('Could not read review file'));
  reader.onload=()=>{
   try{resolve(JSON.parse(String(reader.result)));}catch(e){reject(Error('Invalid review JSON'));}
  };
  reader.readAsText(file);
 });
}
$('comparePacks').addEventListener('click',async()=>{
 clearAudit();compared=null;$('compareResults').hidden=true;
 try{
  const [a,b]=await Promise.all([readFile($('reviewFileA')),readFile($('reviewFileB'))]);
  present(a,b);
 }catch(e){$('compareStatus').textContent='Cannot compare: '+e.message+'. No reviewer file was accepted or uploaded.';}
});
$('adjudicationRows').addEventListener('input',clearAudit);
$('adjudicationRows').addEventListener('change',clearAudit);
$('buildAudit').addEventListener('click',()=>{
 if(!compared){$('auditStatus').textContent='Import two valid completed independent packs first.';return;}
 try{
  const rows=[...$('adjudicationRows').querySelectorAll('[data-id]')].map(card=>({
   id:Number(card.dataset.id),
   decision:card.querySelector('.final-choice').value,
   reason:card.querySelector('.final-reason').value,
   fullTextChecked:card.querySelector('.adjudicator-fulltext').checked
  }));
  audit=core.finalise(compared,rows,$('adjudicatorLabel').value);
  $('auditStatus').textContent='Adjudication ledger validated for all six selected archival rows. Export does not authenticate identities or establish clinical eligibility.';
  $('downloadAuditJson').disabled=false;$('downloadAuditMd').disabled=false;
 }catch(e){clearAudit();$('auditStatus').textContent='Adjudication incomplete: '+e.message;}
});
$('downloadAuditJson').addEventListener('click',()=>{
 if(!audit)return;
 try{output(JSON.stringify(audit,null,2)+'\n','synthesis-human-adjudication.json');}
 catch(e){$('auditStatus').textContent='JSON export failed: '+e.message;}
});
$('downloadAuditMd').addEventListener('click',()=>{
 if(!audit)return;
 try{output(core.markdown(audit),'synthesis-human-adjudication.md','text/markdown;charset=utf-8');}
 catch(e){$('auditStatus').textContent='Markdown export failed: '+e.message;}
});
renderReviewer();
window.SynthesisReviewExchangeUI={present}; // Enables deterministic DOM regression tests; not an authentication interface.
})();
