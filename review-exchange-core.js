/* Synthesis Review Exchange — human-controlled two-file screening practice.
 * Six actual archived magnesium trial rows (metadat::dat.egger2001).
 * Independent passes take place on separate devices if distinct people use it.
 * Authors are self-declared; this does not authenticate identities or verify
 * primary-publication eligibility. No server, tracker, or patient data.
 */
(function(root){
'use strict';
const TYPE='SYNTHESIS_INDEPENDENT_REVIEW_V1';
const DATASET='metadat.dat.egger2001.selected-1-2-3-6-14-16';
const SOURCE='https://wviechtb.github.io/metadat/reference/dat.egger2001.html';
const ROWS=Object.freeze([
 {id:1,label:'Morton (1984)',a:1,n1:40,c:2,n0:36},
 {id:2,label:'Rasmussen (1986)',a:9,n1:135,c:23,n0:135},
 {id:3,label:'Smith (1986)',a:2,n1:200,c:7,n0:200},
 {id:6,label:'Shechter (1989)',a:1,n1:59,c:9,n0:56},
 {id:14,label:'LIMIT-2 (1992)',a:90,n1:1159,c:118,n0:1157},
 {id:16,label:'ISIS-4 (1995)',a:2216,n1:29011,c:2103,n0:29039}
]);
const CHOICES=Object.freeze(['include','exclude','unclear']);
function text(v,max=800){return String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max);}
function assert(ok,message){if(!ok)throw Error(message);}
function sameId(v){return Number.isInteger(v)&&ROWS.some(row=>row.id===v);}
function validate(entries){
 assert(Array.isArray(entries)&&entries.length===ROWS.length,'Exactly six archive-row decisions are required');
 const seen=new Set();
 const ordered=entries.map(entry=>{
   assert(entry&&typeof entry==='object'&&!Array.isArray(entry),'Invalid decision row');
   assert(sameId(entry.id)&&!seen.has(entry.id),'Invalid or duplicate study ID');seen.add(entry.id);
   assert(CHOICES.includes(entry.decision),'Decision must be include, exclude or unclear');
   const reason=text(entry.reason,1000);
   assert(reason.length>=12,'Each study needs a substantive reason (12+ characters)');
   assert(typeof entry.fullTextChecked==='boolean','Explicit full-text-check declaration required');
   return {id:entry.id,decision:entry.decision,reason,fullTextChecked:entry.fullTextChecked};
 });
 assert(ROWS.every(row=>seen.has(row.id)),'Missing source row');
 return ROWS.map(row=>ordered.find(x=>x.id===row.id));
}
function makePack(reviewer,entries,finishedAt,protocol){
 const label=text(reviewer,80),rule=text(protocol,1200);
 assert(label.length>=3&&label.length<=80,'Enter a reviewer label or pseudonym (3–80 characters)');
 assert(rule.length>=20,'Document an eligibility question/rule (20+ characters)');
 const decisions=validate(entries);
 const date=String(finishedAt||new Date().toISOString());
 assert(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(date)&&Number.isFinite(Date.parse(date)),'Invalid completion timestamp');
 return {type:TYPE,dataset:DATASET,source:SOURCE,authorLabel:label,
   rule,finishedAt:date,declaredIndependent:true,decisions};
}
function validatePack(input){
 let p=input;
 if(typeof input==='string'){
   assert(input.length<=100000,'Review JSON too large');
   try{p=JSON.parse(input);}catch(e){throw Error('Invalid JSON review file');}
 }
 assert(p&&typeof p==='object'&&!Array.isArray(p),'Invalid review file');
 assert(p.type===TYPE&&p.dataset===DATASET&&p.source===SOURCE,'Wrong schema or source archive');
 assert(p.declaredIndependent===true,'Independent-pass declaration missing');
 return makePack(p.authorLabel,p.decisions,p.finishedAt,p.rule);
}
function compare(first,second){
 const a=validatePack(first),b=validatePack(second);
 assert(a.authorLabel.toLocaleLowerCase()!==b.authorLabel.toLocaleLowerCase(),
   'Reviewer labels must differ; distinct labels do not authenticate identity');
 const matrix=CHOICES.map(()=>CHOICES.map(()=>0));
 const details=ROWS.map(row=>{
   const da=a.decisions.find(x=>x.id===row.id),db=b.decisions.find(x=>x.id===row.id);
   matrix[CHOICES.indexOf(da.decision)][CHOICES.indexOf(db.decision)]++;
   return {id:row.id,label:row.label,A:da.decision,B:db.decision,
     reasonA:da.reason,reasonB:db.reason,fullTextA:da.fullTextChecked,
     fullTextB:db.fullTextChecked,disagree:da.decision!==db.decision};
 });
 const n=details.length,agreed=details.filter(x=>!x.disagree).length;
 const observed=agreed/n;
 const expected=CHOICES.reduce((sum,_,i)=>{
   const row=matrix[i].reduce((s,v)=>s+v,0);
   const col=matrix.reduce((s,r)=>s+r[i],0);
   return sum+(row/n)*(col/n);
 },0);
 const kappa=Math.abs(1-expected)<1e-12?null:(observed-expected)/(1-expected);
 return {a,b,rows:details,agreed,disagreements:n-agreed,observed,kappa,expected,matrix};
}
function finalise(comparison,entries,adjudicator,completedAt){
 assert(comparison&&comparison.rows&&comparison.rows.length===6,'Two verified review files required');
 const finalRows=validate(entries);
 const name=text(adjudicator,80);
 assert(name.length>=3,'Provide adjudicator label or pseudonym');
 const date=completedAt||new Date().toISOString();
 const audit={
   type:'SYNTHESIS_ADJUDICATION_V1',dataset:DATASET,source:SOURCE,
   exportedAt:date,reviewers:[comparison.a.authorLabel,comparison.b.authorLabel],adjudicator:name,
   ruleA:comparison.a.rule,ruleB:comparison.b.rule,
   observedAgreement:comparison.observed,kappa:comparison.kappa,
   matrix:comparison.matrix,
   sourceStatus:'SIX ARCHIVAL ROWS ONLY — NOT VERIFIED FULL-TEXT ELIGIBILITY',
   rows:comparison.rows.map(row=>{
     const final=finalRows.find(x=>x.id===row.id);
     return {...row,final:final.decision,finalReason:final.reason,adjudicatorFullTextChecked:final.fullTextChecked};
   })
 };
 return audit;
}
function markdown(audit){
 assert(audit&&audit.type==='SYNTHESIS_ADJUDICATION_V1'&&Array.isArray(audit.rows)&&audit.rows.length===6,
  'Validated adjudication file required');
 const clean=value=>text(value,1300).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/\|/g,'\\|').replace(/\r?\n/g,' ');
 const lines=[
  '# Synthesis — independent screening exercise / adjudication dossier',
  '',
  '**Archive:** '+SOURCE,'',
  '**Scope:** Six selected historical trial *event-count* rows. This is not a prospectively registered review or full-text inclusion check.',
  '**Reviewer labels (self-declared):** '+audit.reviewers.map(clean).join(' and '),
  '**Adjudicator label:** '+clean(audit.adjudicator),
  '**Original protocol rule A:** '+clean(audit.ruleA),
  '**Original protocol rule B:** '+clean(audit.ruleB),
  '**Agreement:** '+(100*audit.observedAgreement).toFixed(1)+'%; Cohen’s κ: '+(audit.kappa===null?'undefined (degenerate marginals)':audit.kappa.toFixed(3)),
  '',
  '| Study | A | B | Disagreement | Final (practice) | Adjudication rationale |',
  '|---|---|---|---|---|---|'
 ];
 for(const row of audit.rows){
  lines.push('| '+[clean(row.label),row.A,row.B,row.disagree?'Yes':'No',row.final,clean(row.finalReason)].join(' | ')+' |');
 }
 lines.push('','## Limitations',
  '- Labels do not authenticate identities. The exported JSON files do not cryptographically certify independence, authorisation or integrity.',
  '- The exercise is only based on archived trial counts; clinical eligibility depends on original publications and dated inclusion criteria.',
  '- κ on six practice records is unstable and not an indicator of reviewer competence.',
  '- No patient-level data, external upload, verified source retrieval or research-team sign-off is provided.',
  '- All final decisions and rationales are learner-/adjudicator-authored and are not independently validated.','');
 return lines.join('\n');
}
const api=Object.freeze({TYPE,DATASET,SOURCE,ROWS,CHOICES,text,validate,makePack,validatePack,compare,finalise,markdown});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root)root.SynthesisReviewExchange=api;
})(typeof window!=='undefined'?window:globalThis);
