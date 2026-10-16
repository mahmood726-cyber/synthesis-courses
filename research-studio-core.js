/* Synthesis Research Studio — offline-first teaching workflow.
 * Source data: metadat::dat.egger2001 and metadat::dat.hine1989.
 * Handoffs use AllMeta's documented ma-studies-v1 schema. No patient data.
 * This is NOT an independently registered clinical review, certification, or live search.
 */
(function(root){
'use strict';
const MAG_URL='https://wviechtb.github.io/metadat/reference/dat.egger2001.html';
const HINE_URL='https://wviechtb.github.io/metadat/reference/dat.hine1989.html';
const BUS_KEY='ma-studies-v1';
const ORIGIN='https://mahmood726-cyber.github.io';
const APPS=Object.freeze([
  {id:'protocol',name:'Protocol builder',path:'/allmeta/protocols/',stage:'protocol',mode:'manual'},
  {id:'screen',name:'Screen (independent screening)',path:'/allmeta/screen/index.html',stage:'screen',mode:'manual'},
  {id:'workbench',name:'MA Workbench',path:'/allmeta/workbench/index.html',stage:'stats',mode:'bus'},
  {id:'forest',name:'Forest Plot Viewer',path:'/allmeta/forest-plot/index.html',stage:'stats',mode:'bus'},
  {id:'heterogeneity',name:'Heterogeneity Explorer',path:'/allmeta/heterogeneity/index.html',stage:'stats',mode:'bus'},
  {id:'influence',name:'Influence Diagnostics',path:'/allmeta/influence/index.html',stage:'stats',mode:'bus'},
  {id:'webr',name:'WebR Studio',path:'/allmeta/webr-studio/index.html',stage:'stats',mode:'manual'},
  {id:'rob',name:'RoB 2',path:'/allmeta/rob2/index.html',stage:'review',mode:'manual'},
  {id:'grade',name:'GRADE Summary of Findings',path:'/allmeta/grade-sof/index.html',stage:'review',mode:'manual'},
  {id:'prisma',name:'PRISMA Flow',path:'/allmeta/prisma-flow/index.html',stage:'capstone',mode:'manual'},
  {id:'cumulative',name:'Cumulative + Subgroup',path:'/allmeta/cumulative-subgroup/index.html',stage:'living',mode:'bus'},
  {id:'evidenceos',name:'EvidenceOS (surveillance)',path:'/allmeta/evidenceos/',stage:'living',mode:'manual'}
]);
const STAGES=Object.freeze(['protocol','screen','living','stats','review','capstone']);
const SKILLS=Object.freeze(['protocol','screening','analysis','appraisal','reporting']);
const SCREEN_CHOICES=Object.freeze(['include','exclude','unclear']);
const CHALLENGES=Object.freeze([
 {id:'s1',skill:'screening',q:'Only an event-count row is available. Can it alone confirm that the original trial meets every prespecified eligibility requirement?',
  choices:['Yes; any archived row proves eligibility','No; retrieve and critically assess the original publication','Yes, if its reported death count is non-zero'],answer:1,
  explain:'Counts permit arithmetic but do not independently establish design, outcome definitions, follow-up or eligibility. An archive-row exercise is not a full-text systematic review.'},
 {id:'a1',skill:'analysis',q:'Hine mortality data are supplied as treatment-minus-control risk differences. Which null and scale should the AllMeta Workbench use?',
  choices:['Log odds ratio, null 1','Risk difference on the identity scale, null 0','Risk ratio, null 0'],answer:1,
  explain:'RD is a linear absolute risk contrast with null 0. AllMeta receives each verified study effect and standard error on that same identity scale; do not label it logOR.'},
 {id:'p1',skill:'protocol',q:'A new large historical trial changes the pooled estimate. Which eligibility policy is defensible?',
  choices:['Exclude the large trial if it weakens a favourite claim','Use a documented eligibility rule and show all justified sensitivity analyses','Keep only trials that are statistically significant'],answer:1,
  explain:'A protocol and transparent inclusion ledger precede interpretation. Large-trial influence itself is not proof of bias or ineligibility.'},
 {id:'r1',skill:'appraisal',q:'Six selected magnesium rows change substantially when ISIS-4 is added. What has been established?',
  choices:['Publication bias has been proved','The selected effect changed under this Peto classroom calculation, not why','The treatment must now be given to every patient'],answer:1,
  explain:'A selected teaching subset demonstrates numerical influence. Causes of disagreement, risk of bias, eligibility and applicability need separate evidence.'},
 {id:'g1',skill:'appraisal',q:'Can a forest plot alone complete a GRADE certainty judgement?',
  choices:['Yes; a narrow CI guarantees high certainty','No; assess bias, inconsistency, indirectness, imprecision and reporting','Yes; the biggest trial determines certainty'],answer:1,
  explain:'Certainty involves explicit body-of-evidence judgements, not just graphical precision or statistical significance.'},
 {id:'c1',skill:'reporting',q:'What should a reproducible student capstone identify?',
  choices:['Only the preferred pooled point estimate','Source version, exact inputs, estimand, analysis script, unresolved limitations and deviations','A certificate based on quiz score'],answer:1,
  explain:'A defensible report includes provenance, analysis, decision ledger and uncertainty. The learner report is self-assessed, not expert-certified.'}
]);
function ensure(deps){
 if(!deps||!deps.MagnesiumReversal||!deps.SYNTHESIS_REAL_DATA)throw Error('Source-verified calculators missing');
 const m=deps.MagnesiumReversal.trials,d=deps.SYNTHESIS_REAL_DATA.hine;
 if(m.length!==6||d.studies.length!==6)throw Error('Unexpected teaching source set');
 return {mag:m,hine:d.studies,real:deps.SYNTHESIS_REAL_DATA,magApi:deps.MagnesiumReversal};
}
function fresh(){
 return {version:1,protocol:{pico:'',inclusion:'',outcome:'',locked:false},
  screening:{A:{},B:{},final:{}},living:{predictions:{},revealed:[]},
  stats:{selected:[1,2,3,4,5,6],inspected:false},review:{answers:{},misses:{}},
  capstone:{interpretation:'',limitations:'',nextSteps:'',saved:false}};
}
function validText(v,max=2400){return String(v==null?'':v).replace(/[\u0000-\u001f]/g,' ').slice(0,max).trim();}
function protocolValid(p){return !!p&&['pico','inclusion','outcome'].every(k=>validText(p[k]).length>=18);}
function records(deps){
 const x=ensure(deps);
 return x.mag.map(t=>({id:t.id,year:t.year,label:t.study+' ('+t.year+')',
  numerator:t.a,denominator:t.n1,controlEvents:t.c,controlN:t.n2,source:MAG_URL,
  prompt:'Archival mortality counts only. Assess primary publication before real review inclusion.'}));
}
function screenPassComplete(pass,recs){return recs.every(r=>pass&&pass[r.id]&&SCREEN_CHOICES.includes(pass[r.id].decision)&&validText(pass[r.id].reason).length>=8);}
function reconcile(screen,recs){
 const list=recs.map(r=>{const a=screen.A[r.id],b=screen.B[r.id],final=screen.final[r.id];
 return {id:r.id,A:a?.decision||'',B:b?.decision||'',disagreement:!!a&&!!b&&a.decision!==b.decision,
  resolved:!!final&&SCREEN_CHOICES.includes(final.decision)&&validText(final.reason).length>=8,
  final:final?.decision||''};});
 return {rows:list,disagreements:list.filter(x=>x.disagreement).length,complete:list.every(x=>x.resolved)};
}
const YEARS=Object.freeze([1986,1989,1992,1995]);
function snapshots(deps){
 const x=ensure(deps);
 return YEARS.map(year=>{
  const chosen=x.mag.filter(t=>t.year<=year),p=x.magApi.peto(chosen);
  return {year,k:chosen.length,ids:chosen.map(t=>t.id),or:p.OR,lower:p.low,upper:p.high,
   note:'Retrospective classroom selection of the six archival records; not a published year-specific systematic review.'};
 });
}
function hines(deps,ids){
 const x=ensure(deps);
 if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.length<2||ids.some(id=>!x.hine.some(s=>s.id===id)))throw Error('Choose at least two distinct archived Hine IDs');
 const a=x.real.metaRD(ids);
 if(!a||!Number.isFinite(a.estimate))throw Error('Cannot calculate source-referenced risk difference');
 return {k:a.k,rd:a.estimate,lower:a.lower,upper:a.upper,Q:a.Q,I2:a.I2};
}
function hinesRows(deps){
 const x=ensure(deps);
 return x.hine.map(t=>{
  const a=x.real.rd(t);
  if(!Number.isFinite(a.rd)||!(a.se>0))throw Error('Invalid Hine effect');
  return {id:t.id,label:t.study,events:t.ai,n:t.n1i,controlEvents:t.ci,controlN:t.n2i,est:a.rd,se:a.se};
 });
}
function csvQuote(s){return '"'+String(s).replace(/"/g,'""')+'"';}
function handoffCsv(deps,ids){
 const rows=hinesRows(deps).filter(r=>ids.includes(r.id));
 if(rows.length<2)throw Error('Select two or more Hine trials before export');
 return 'label,est,se\n'+rows.map(r=>[csvQuote(r.label),r.est.toPrecision(17),r.se.toPrecision(17)].join(',')).join('\n')+'\n';
}
function busPayload(deps,ids,now){
 if(ids.length<2)throw Error('At least two selected studies required');
 const selected=hinesRows(deps).filter(r=>ids.includes(r.id));
 if(selected.length!==ids.length)throw Error('Unknown study ID');
 return {_schema:'ma-studies-v1',_savedAt:now||new Date().toISOString(),
  studies:selected.map(r=>({label:r.label,est:r.est,se:r.se,moderator:null,group:null,year:null}))};
}
function sameOrigin(hostname,pathname){return hostname==='mahmood726-cyber.github.io'&&/^\/synthesis-courses(?:\/|$)/.test(pathname);}
function stageBus(storage,hostname,pathname,approvedReplace,payload){
 if(!sameOrigin(hostname,pathname))return {ok:false,code:'different-origin'};
 if(!payload||payload._schema!=='ma-studies-v1'||!Array.isArray(payload.studies)||payload.studies.length<2||payload.studies.some(s=>!Number.isFinite(s.est)||!(s.se>0)))return {ok:false,code:'invalid'};
 let prev;
 try{prev=storage.getItem(BUS_KEY);}catch(e){return {ok:false,code:'storage-unavailable'};}
 if(prev&&!approvedReplace)return {ok:false,code:'occupied'};
 try{storage.setItem(BUS_KEY,JSON.stringify(payload));return {ok:true,code:'staged',count:payload.studies.length,replaced:Boolean(prev)};}
 catch(e){return {ok:false,code:'storage-unavailable'};}
}
function challenge(id,choice){
 const q=CHALLENGES.find(x=>x.id===id);
 if(!q||!Number.isInteger(choice)||choice<0||choice>=q.choices.length)throw Error('Invalid challenge response');
 return {correct:choice===q.answer,skill:q.skill,explain:q.explain};
}
const PRACTICE={
 protocol:{title:'Prespecification',url:'https://mahmood726-cyber.github.io/allmeta/protocols/'},
 screening:{title:'Independent screening',url:'https://mahmood726-cyber.github.io/allmeta/screen/index.html'},
 analysis:{title:'Rebuild effect estimates',url:'https://mahmood726-cyber.github.io/allmeta/forest-plot/index.html'},
 appraisal:{title:'Risk of bias and GRADE',url:'https://mahmood726-cyber.github.io/allmeta/rob2/index.html'},
 reporting:{title:'PRISMA and transparent reporting',url:'https://mahmood726-cyber.github.io/allmeta/prisma-flow/index.html'}
};
function recommend(misses){
 return SKILLS.slice().sort((a,b)=>(misses?.[b]||0)-(misses?.[a]||0)).map(k=>({skill:k,misses:misses?.[k]||0,...PRACTICE[k]}));
}
function completion(st,deps){
 const recs=records(deps);
 return {
  protocol:!!st.protocol.locked&&protocolValid(st.protocol),
  screen:screenPassComplete(st.screening.A,recs)&&screenPassComplete(st.screening.B,recs)&&reconcile(st.screening,recs).complete,
  living:YEARS.every(y=>st.living.revealed.includes(y)&&!!st.living.predictions[y]),
  stats:!!st.stats.inspected&&Array.isArray(st.stats.selected)&&st.stats.selected.length>=2,
  review:CHALLENGES.every(c=>st.review.answers[c.id]===c.answer),
  capstone:!!st.capstone.saved&&['interpretation','limitations','nextSteps'].every(k=>validText(st.capstone[k]).length>=60)
 };
}
function dossier(st,deps){
 const x=ensure(deps),s=snapshots(deps),c=completion(st,deps);
 let results=null;
 try{results=hines(deps,st.stats.selected);}catch(e){/* Valid draft: effect not yet calculable. */}
 const lines=['# Synthesis Research Studio — learner-authored capstone (not certified)','',
   'AllMeta links source: https://github.com/mahmood726-cyber/allmeta/blob/main/hub/projects.js',
   'Training data: '+MAG_URL,'Statistical data: '+HINE_URL,
   'Archive-row screening is not a completed systematic review; snapshots are retrospective teaching selections.',
   '','## Prespecified protocol',...['pico','inclusion','outcome'].map(k=>k+': '+validText(st.protocol[k])),
   'Frozen before analysis: '+String(Boolean(st.protocol.locked)),'',
   '## Two blinded practice passes (same-device exercise; not authenticated independent reviewers)',
   'Both passes complete: '+String(c.screen),'Disagreements: '+reconcile(st.screening,records(deps)).disagreements];
 for(const r of reconcile(st.screening,records(deps)).rows){
  lines.push('- '+r.id+' A='+r.A+', B='+r.B+', reconciled='+r.final);
 }
 lines.push('','## Historical magnesium evidence updates (selected six rows, Peto classroom calculation)');
 for(const r of s){if(st.living.revealed.includes(r.year))lines.push('- '+r.year+': k='+r.k+', OR='+r.or.toFixed(3)+', 95% CI '+r.lower.toFixed(3)+'–'+r.upper.toFixed(3)+', prior prediction='+validText(st.living.predictions[r.year]));}
 lines.push('','## Separate real Hine risk-difference analysis',
  'Selected Hine IDs: '+st.stats.selected.join(','),
  'Risk difference: '+(results?results.rd.toFixed(6)+', 95% CI '+results.lower.toFixed(6)+'–'+results.upper.toFixed(6):'not yet calculable (fewer than two selected studies)'),
  'R package source: metadat::dat.hine1989. Hine RD is NOT the magnesium Peto OR.',
  'AllMeta handoff: study RD and standard errors on identity scale; null 0; outputs need separate inspection.','',
  '## Peer review and adaptive practice');
 for(const q of CHALLENGES)lines.push('- '+q.id+' ('+q.skill+'): learner response='+String(st.review.answers[q.id]??'not given')+'; correct='+String(st.review.answers[q.id]===q.answer));
 for(const item of recommend(st.review.misses))lines.push('- '+item.skill+': '+item.misses+' misconceptions; '+item.url);
 lines.push('','## Learner interpretation',validText(st.capstone.interpretation),'',
   '## Limitations',validText(st.capstone.limitations),'',
   '## Verifiable next actions',validText(st.capstone.nextSteps),'',
   '## Completion dashboard',...STAGES.map(k=>k+': '+String(c[k])),
   '','This dossier is a self-assessed learning artifact, not a registered review, clinical advice, source adjudication, or a competency certificate.','');
 return lines.join('\n');
}
const api=Object.freeze({MAG_URL,HINE_URL,BUS_KEY,ORIGIN,APPS,STAGES,YEARS,CHALLENGES,SKILLS,SCREEN_CHOICES,fresh,validText,
 protocolValid,records,screenPassComplete,reconcile,snapshots,hines,hinesRows,handoffCsv,busPayload,sameOrigin,stageBus,challenge,recommend,completion,dossier});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root)root.SynthesisResearchCore=api;
})(typeof window!=='undefined'?window:globalThis);
