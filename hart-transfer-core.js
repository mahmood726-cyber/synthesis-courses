/* Source-linked historical Hart 1999 classroom activity.
   Aggregate trial counts only. Not a comprehensive review or clinical advice. */
(function(root){
'use strict';
const SOURCE='https://wviechtb.github.io/metadat/reference/dat.hart1999.html';
const rows=Object.freeze([
 ['AFASAK',1989,9,335,413,19,336,398,'placebo','primary'],
 ['SPAF',1991,8,210,263,19,211,245,'placebo','primary'],
 ['BAATAF',1990,3,212,487,13,208,435,'control','primary'],
 ['CAFA',1991,6,187,237,9,191,241,'placebo','primary'],
 ['SPINAF',1992,7,281,489,23,290,483,'placebo','primary'],
 ['EAFT',1993,20,225,507,50,214,405,'placebo','secondary']
].map(([study,year,x1,n1,t1,x2,n2,t2,comp,prevention])=>
 Object.freeze({study,year,x1,n1,t1,x2,n2,t2,comp,prevention})));
function commonEffectIRR(subset){
 if(!Array.isArray(subset)||subset.length===0||subset.some(r=>![r.x1,r.x2,r.t1,r.t2].every(x=>Number.isFinite(x)&&x>0)))
  throw Error('Positive events and person-time required for log-IRR');
 const effects=subset.map(r=>({yi:Math.log((r.x1/r.t1)/(r.x2/r.t2)),vi:1/r.x1+1/r.x2}));
 const sumWeight=effects.reduce((a,r)=>a+1/r.vi,0);
 const estimate=effects.reduce((a,r)=>a+r.yi/r.vi,0)/sumWeight;
 const se=Math.sqrt(1/sumWeight),z=1.959963984540054;
 const q=effects.reduce((a,r)=>a+(r.yi-estimate)**2/r.vi,0);
 return Object.freeze({k:subset.length,logIRR:estimate,se,IRR:Math.exp(estimate),lower:Math.exp(estimate-z*se),upper:Math.exp(estimate+z*se),Q:q});
}
const firstFive=commonEffectIRR(rows.slice(0,5));
const allSix=commonEffectIRR(rows);
const tasks=Object.freeze([
 {id:'scope',domain:'Provenance',kind:'choice',question:'What can be established from six historical aggregate trial records?',
  options:['They prove every eligible trial was retrieved.','They provide sourced aggregate counts, but eligibility, completeness and bias require original-source checks.','Every trial has low risk of bias.'],answer:1,
  reason:'Archive records are not a comprehensive search, trial-eligibility verification or risk-of-bias assessment.'},
 {id:'rate',domain:'Effect measure',kind:'choice',question:'Which formula represents the AFASAK warfarin-versus-control incidence rate ratio?',
  options:['(9/335) / (19/336)','(9/413) / (19/398)','(9/413) - (19/398)'],answer:1,
  reason:'Stroke incidence rates use the person-year denominators, 413 and 398. Participants yield cumulative risks; subtraction yields an incidence rate difference.'},
 {id:'calculation',domain:'Numerical reproduction',kind:'number',question:'Calculate (9/413) / (19/398). Enter the incidence rate ratio to 2 decimal places.',
  answer:(9/413)/(19/398),tolerance:0.0051,
  reason:'From the source counts, AFASAK has an incidence rate ratio of '+((9/413)/(19/398)).toFixed(4)+' (about 0.46).'},
 {id:'population',domain:'Clinical population',kind:'choice',question:'The first five records are primary prevention; EAFT is secondary prevention. What is the defensible analysis/reporting response?',
  options:['Assume the populations are identical because all trials involve atrial fibrillation.','Prespecify subgroup/applicability considerations and acknowledge differences in baseline risk.','Exclude EAFT solely because it changes the pooled estimate.'],answer:1,
  reason:'Primary versus secondary prevention may change applicability. Excluding a study post hoc for its result is unjustified.'},
 {id:'influence',domain:'Evidence-set sensitivity',kind:'choice',question:'Predict the common-effect inverse-variance incidence rate ratio when EAFT is added to the first five primary-prevention studies.',
  options:['It moves from about 0.391 to 0.362.','It moves from about 0.391 to 0.600.','Adding a sixth trial cannot change the estimate.'],answer:0,
  reason:'The transparent teaching subset yields '+firstFive.IRR.toFixed(4)+' with five and '+allSix.IRR.toFixed(4)+' with all six; the selection order is retrospective teaching, not a prospective search.'},
 {id:'heterogeneity',domain:'Effect-scale heterogeneity',kind:'choice',question:'The source reports I² = 0% for log incidence rate ratios but 50.75% for incidence rate differences. What follows?',
  options:['The software must be wrong: I² is always scale-invariant.','Different effect measures and variance structures can yield different I² estimates; neither proves clinical homogeneity.','I² = 0% proves no study has risk of bias.'],answer:1,
  reason:'The official R example fits two distinct estimands. A small-k I² estimate does not establish equivalence of clinical populations or unbiased evidence.'},
 {id:'interpret',domain:'Cautious interpretation',kind:'choice',question:'The published example reports pooled incidence rate ratio 0.3617 (95% CI 0.2626–0.4984). What is a defensible description?',
  options:['Historical pooled stroke incidence rate is lower in the treated arms; this is not a modern treatment recommendation or a fixed-time cumulative risk ratio.','Every current patient has exactly 63.83% lower probability of stroke.','A point estimate alone proves which anticoagulant should be prescribed today.'],answer:0,
  reason:'Incidence rate ratios are based on stroke counts over person-time, not necessarily cumulative risks. Clinical decisions require current evidence, indications and contraindications.'}
]);
function grade(answers){
 if(!answers||typeof answers!=='object')throw Error('Answers required');
 const marked=tasks.map(t=>{
  const value=answers[t.id];
  if(value===undefined||value===null||String(value).trim()==='')throw Error('Complete all seven decisions before submitting');
  let correct;
  if(t.kind==='number'){
   const n=Number(value);if(!Number.isFinite(n))throw Error('Numerical input must be finite');
   correct=Math.abs(n-t.answer)<=t.tolerance;
  }else{
   const n=Number(value);if(!Number.isInteger(n)||n<0||n>=t.options.length)throw Error('Choose a listed option');
   correct=n===t.answer;
  }
  return Object.freeze({id:t.id,domain:t.domain,input:String(value),correct,explanation:t.reason});
 });
 return Object.freeze({score:marked.filter(x=>x.correct).length,total:marked.length,marked});
}
function report(answers){
 const result=grade(answers);
 const lines=['# Synthesis: Hart 1999 new-data transfer challenge','','Unvalidated self-check, NOT a blinded, independently graded competence test or clinical advice.',
 'Source: '+SOURCE,'Source model: inverse-variance common-effect log-IRR; the published six-trial REML example estimates tau²=0.','',
 'Five primary-prevention rows IRR: '+firstFive.IRR.toFixed(6),
 'All six rows IRR: '+allSix.IRR.toFixed(6)+' (95% CI '+allSix.lower.toFixed(6)+' to '+allSix.upper.toFixed(6)+')',
 'Seven-decision self-check score (not credential): '+result.score+'/'+result.total,''];
 for(const [i,t] of tasks.entries()){
  const r=result.marked[i];
  lines.push('## '+t.domain,'Question: '+t.question,
  'First submitted answer: '+(t.kind==='number'?r.input:t.options[Number(r.input)]),
  'Correct: '+String(r.correct),'Explanation: '+r.explanation,'');
 }
 lines.push('Eligibility, primary-study appraisal, source completeness and contemporary applicability remain unverified.','');
 return lines.join('\n');
}
const api=Object.freeze({SOURCE,rows,tasks,firstFive,allSix,commonEffectIRR,grade,report});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root)root.SynthesisHartTransfer=api;
})(typeof window!=='undefined'?window:globalThis);
