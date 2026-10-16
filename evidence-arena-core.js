/* Evidence Decision Arena: deterministic case analysis over previously source-verified
   R/metadat/metafor teaching records. No synthetic patient outcomes or API calls.
   These teaching subsets are not prospective reviews or clinical recommendations. */
(function(root){
'use strict';
const DEFINITIONS=Object.freeze([
 {id:'magnesium',module:7,title:'The Trial That Changed the Argument',
  subtitle:'Magnesium after suspected myocardial infarction',
  source:'metadat::dat.egger2001',sourceUrl:'https://wviechtb.github.io/metadat/reference/dat.egger2001.html',
  archiveCount:16,model:'Peto equal-effects odds ratio',unit:'OR',nullValue:1,decimals:3,
  baseline:[1,2,3,6,14],added:16,prediction:'toward',
  episode:'Five retrospectively chosen earlier magnesium-trial records suggest benefit. Add ISIS-4 (1995), which studied substantially more people. The five/six-row ordering is an instructional comparison, not the complete historical review.',
  why:'The subset OR changes from 0.622 to 1.028. Do not confuse this cherry-picked teaching example with the official full fifteen/sixteen-trial meta-analysis, or prove publication bias from the contrast alone.',
  limitation:'Trial selection, different follow-up, treatment timing and clinical context require independent assessment. Neither reproducibility nor the largest sample can establish universal clinical applicability.',
  reference:'scripts/verify_magnesium_reversal.R'},
 {id:'bcg',module:3,title:'The Six Rows That Changed the Answer',
  subtitle:'Historical BCG tuberculosis trials',
  source:'metafor::dat.bcg',sourceUrl:'https://wviechtb.github.io/metafor/reference/escalc.html',
  archiveCount:13,model:'Inverse-variance fixed-effect log risk ratio',unit:'RR',nullValue:1,decimals:3,
  baseline:[1,2,4,5,6],added:8,prediction:'toward',
  episode:'The original archive contains thirteen historical BCG studies; the simulator deliberately shows six. First calculate five selected rows, then include the large TPT Madras record. This is teaching order, not a report of how the evidence historically arrived.',
  why:'The selected fixed-effect RR changes from about 0.405 to 0.659. The six-record calculation has very high heterogeneity and includes alternate allocation; it is not a vaccine-effectiveness estimate.',
  limitation:'Non-exhaustive retrieval, differences in design, latitude, allocation and heterogeneity prevent clinical interpretation of this selected teaching subset.',
  reference:'scripts/verify_bcg_story.R'},
 {id:'lidocaine',module:22,title:'The Small Trial That Changes the Interval',
  subtitle:'Prophylactic lidocaine after myocardial infarction',
  source:'metadat::dat.hine1989',sourceUrl:'https://wviechtb.github.io/metadat/reference/dat.hine1989.html',
  archiveCount:6,model:'Common-effect inverse-variance risk difference',unit:'RD',nullValue:0,decimals:4,
  baseline:[1,2,3,4,5],added:6,prediction:'away',
  episode:'The six records of the published Hine data example concern deaths during the assigned treatment period. Calculate five records, then include O’Brien et al. as the sixth. The original archive already includes all six; this is an influence exercise, not a newly discovered trial.',
  why:'The five-record classroom RD is about 0.0238; the full six-record example is approximately 0.02944, with 95% CI 0.00383 to 0.05506. Positive RD means greater mortality among patients allocated lidocaine; this does not by itself validate practice guidance.',
  limitation:'Single dataset, sparse events, conditional common-effect assumptions and clinical context need assessment before making recommendations.',
  reference:'scripts/verify_small_meta.R'}
]);
const copy=caseDef=>({...caseDef,baseline:[...caseDef.baseline]});
function build(deps){
 const D=deps||root;
 const configs=DEFINITIONS.map(copy);
 const byId=id=>{const c=configs.find(x=>x.id===id);if(!c)throw Error('Unknown case');return c;};
 function rows(id){
   byId(id);
   if(id==='magnesium')return D.MagnesiumReversal.trials.map(t=>({id:t.id,name:t.study+' '+t.year}));
   if(id==='bcg')return D.EvidenceStoryMath.TRIALS.map(t=>({id:t.id,name:t.name}));
   return D.SYNTHESIS_REAL_DATA.hine.studies.map(t=>({id:t.id,name:t.study}));
 }
 function analyse(id, chosen){
   const c=byId(id);
   if(!Array.isArray(chosen)||new Set(chosen).size!==chosen.length)throw Error('Choose distinct trial IDs');
   const allowed=new Set(rows(id).map(t=>t.id));
   if(chosen.some(x=>!allowed.has(x))||chosen.length<2)throw Error('Choose two or more valid studies');
   if(id==='magnesium'){
     const a=D.MagnesiumReversal.peto(D.MagnesiumReversal.trials.filter(t=>chosen.includes(t.id)));
     return {estimate:a.OR,low:a.low,high:a.high,k:a.k,metric:'OR',information:a.information};
   }
   if(id==='bcg'){
     const a=D.EvidenceStoryMath.analyse(D.EvidenceStoryMath.TRIALS.filter(t=>chosen.includes(t.id)));
     return {estimate:a.fixed.rr,low:a.fixed.lo,high:a.fixed.hi,k:a.rows.length,metric:'RR',I2:a.I2,randomEffect:a.dl.rr};
   }
   const a=D.SYNTHESIS_REAL_DATA.metaRD(chosen);
   if(!a)throw Error('Too few studies');
   return {estimate:a.estimate,low:a.lower,high:a.upper,k:a.k,metric:'RD',I2:a.I2};
 }
 function describe(id){
   const c=byId(id),before=analyse(id,c.baseline),after=analyse(id,[...c.baseline,c.added]);
   const dist=x=>c.nullValue===1?Math.abs(Math.log(x.estimate)):Math.abs(x.estimate);
   return {caseDef:c,before,after,move:dist(after)<dist(before)?'toward':dist(after)>dist(before)?'away':'same'};
 }
 function verdict(id,choice){
   byId(id);
   if(choice==='transparent')return {correct:true,
     feedback:'Good: report the stated selection, full selected-set calculation, appropriate sensitivity checks and remaining limitations. Audit eligibility and source completeness before clinical interpretation.'};
   if(choice==='exclude')return {correct:false,
     feedback:'Post hoc exclusion to obtain a preferred result is not justified. A sensitivity toggle is an investigation, not an eligibility decision.'};
   if(choice==='certify')return {correct:false,
     feedback:'Arithmetic reproduction cannot certify completeness, causal identification or clinical applicability. Return to the source set and risk-of-bias assessment.'};
   throw Error('Unknown verdict');
 }
 function format(id,n){const c=byId(id);return Number(n).toFixed(c.decimals);}
 function exportText(id,state){
   const c=byId(id),desc=describe(id);
   const chosen=state.chosen||c.baseline;
   const now=analyse(id,chosen);
   const note=String(state.note||'').replace(/\r/g,'').trim();
   const reviewed=Array.isArray(state.checks)?state.checks.filter(x=>['selection','metric','uncertainty','limits','next'].includes(x)):[];
   return [
     '# Synthesis | Evidence Decision Dossier (learner-authored, not certified)',
     '', 'Case: '+c.title,'Source: '+c.source+' — '+c.sourceUrl,
     'Archive: '+c.archiveCount+' records; classroom subset: '+rows(id).length+' records.',
     'Model: '+c.model,'','## Prespecified classroom decisions',
     'Inclusion intention: '+(state.scope==='report'?'Report all shown records with transparent sensitivity diagnostics':'Not yet appropriately specified'),
     'Prediction recorded before reveal: '+(state.prediction||'not submitted'),
     '## Re-analysis (selected subset, NOT clinical advice)',
     'Selected archive IDs: '+chosen.join(', '),
     'Selected effect: '+c.unit+' '+format(id,now.estimate)+' [95% CI '+format(id,now.low)+' to '+format(id,now.high)+'], k='+now.k,
     'Five/few-row baseline: '+c.unit+' '+format(id,desc.before.estimate),
     'Baseline plus candidate: '+c.unit+' '+format(id,desc.after.estimate),
     '## Editorial check',
     'Verdict: '+(state.verdict||'not submitted'),
     'Checklist reviewed by learner: '+reviewed.join(', '),
     '## Interpretation (ungraded)',
     note||'[No narrative entered]',
     '## Provenance and caveats',c.why,c.limitation,
     'Reproduction script: '+c.reference,
     'Learner self-assessment only: not an independent scientific or competency verification.',''
   ].join('\n');
 }
 return Object.freeze({cases:configs,rows,analyse,describe,verdict,format,exportText});
}
const api={build,definitions:DEFINITIONS.map(copy)};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root)root.SynthesisArenaCore=api;
})(typeof window!=='undefined'?window:globalThis);
