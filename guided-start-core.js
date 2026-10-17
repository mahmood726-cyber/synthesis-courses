/* Synthesis Guided Start: source-verified, secular evidence-synthesis entry experience.
   Authentic teaching records from metadat::dat.hine1989, metadat::dat.berkey1998
   and metadat::dat.egger2001. No invented clinical outcomes, no clinical advice.
   One learner's answers are feedback signals, not validated competency testing.
*/
(function(root){
'use strict';
const HINE='https://wviechtb.github.io/metadat/reference/dat.hine1989.html';
const BERKEY='https://wviechtb.github.io/metadat/reference/dat.berkey1998.html';
const MAG='https://wviechtb.github.io/metadat/reference/dat.egger2001.html';
const PATHS=Object.freeze({
 provenance:'research-studio.html?station=screen',
 calculation:'real-evidence-lab.html?module=7',
 sensitivity:'evidence-arena.html?case=lidocaine',
 interpretation:'research-studio.html?station=review',
 estimand:'research-studio.html?station=stats',
 dependence:'real-evidence-lab.html?module=21'
});
const NAMES=Object.freeze({
 provenance:'Source and eligibility decisions',
 calculation:'Calculate a real trial effect',
 sensitivity:'Sensitivity without cherry-picking',
 interpretation:'Heterogeneity and uncertainty',
 estimand:'Choose a compatible effect measure',
 dependence:'Dependent outcomes and trial units'
});
function build(deps){
 const r=deps&&deps.SYNTHESIS_REAL_DATA,mag=deps&&deps.MagnesiumReversal;
 if(!r||!mag||!r.hine||!r.berkey||r.hine.studies.length!==6||
    r.berkey.studies.length!==5||mag.trials.length!==6||r.verify()!==true)
   throw Error('Verified source tables are unavailable');
 const h=r.hine.studies,first=r.rd(h[0]),without=r.metaRD([1,2,3,4,5]),all=r.metaRD();
 if(!without||!all||!Number.isFinite(first.rd)||!Number.isFinite(all.estimate))
   throw Error('Numerical teaching oracle is unavailable');
 const fmt=n=>Number(n).toFixed(3);
 const tasks=[
  {id:'source',skill:'provenance',source:HINE,kind:'choice',scene:'THE OPENING TABLE',
   title:'A first observation is not yet a verdict',
   text:'A historical Hine lidocaine trial record contains '+h[0].ai+' deaths among '+h[0].n1i+
        ' in the treatment arm and '+h[0].ci+' among '+h[0].n2i+' in control. What can you establish from that row alone?',
   choices:['That the intervention prevents deaths','Only the observed event counts; eligibility, design and reporting require original source checks',
            'That all other eligible trials have been retrieved'],
   answer:1,explanation:'The row accurately records events and denominators, but it cannot verify retrieval completeness, risk of bias, outcome definitions or clinical eligibility.'},
  {id:'riskdifference',skill:'calculation',source:HINE,kind:'numeric',scene:'A NUMBER APPEARS',
   title:'Compute a real absolute risk difference',
   text:'From the same source row, calculate treatment mortality minus control mortality: '+
        h[0].ai+'/'+h[0].n1i+' − '+h[0].ci+'/'+h[0].n2i+
        '. Enter the risk difference as a decimal, to three decimal places (not percentage points).',
   expected:first.rd,tolerance:0.00055,
   explanation:'The source-based absolute risk difference is '+first.rd.toFixed(6)+
     ' (about '+(first.rd*100).toFixed(2)+' percentage points). RD is an identity-scale effect with null 0, not a risk ratio.'},
  {id:'influence',skill:'sensitivity',source:HINE,kind:'choice',scene:'THE SIXTH RECORD',
   title:'Predict before revealing a larger source set',
   text:'Five deliberately selected Hine records yield a common-effect RD of '+fmt(without.estimate)+
       '. When the already-published O’Brien et al. record is included as the sixth, what direction will the pooled RD move?',
   choices:['More positive (toward greater risk on treatment)','More negative (toward greater risk on control)','A sixth record never changes a pooled effect'],
   answer:all.estimate>without.estimate?0:1,
   explanation:'The teaching estimate changes from '+without.estimate.toFixed(6)+' (five rows) to '+
     all.estimate.toFixed(6)+' (six rows). This inclusion order is instructional, not a discovered missing trial; deleting studies to force a result is unacceptable.'},
  {id:'heterogeneity',skill:'interpretation',source:HINE,kind:'choice',scene:'THE APPARENTLY REASSURING DIAGNOSTIC',
   title:'What does I² of zero actually tell us?',
   text:'The six Hine records have Q approximately '+all.Q.toFixed(3)+' and I² = '+all.I2.toFixed(0)+
        '%. Which interpretation is defensible?',
   choices:['The true effects, clinical contexts and bias risks are proven identical',
            'This estimate of statistical heterogeneity is zero in this small dataset, but does not establish clinical equivalence',
            'All eligible clinical trials must have been found'],
   answer:1,explanation:'Observed Q below its degrees of freedom yields conventionally truncated I²=0%. With six trials, uncertainty, study design and applicability still matter.'},
  {id:'estimand',skill:'estimand',source:MAG,kind:'choice',scene:'A SECOND CLINICAL STORY',
   title:'Do not combine unlike effects',
   text:'The archived magnesium-after-MI exercise reports Peto odds ratios. The Hine lidocaine calculation reports risk differences. Which step is valid?',
   choices:['Combine both numeric estimates in one inverse-variance pool unchanged',
            'Keep populations, clinical questions and effect families separate; choose and declare an appropriate model for each',
            'Exponentiate the Hine risk difference and label it a risk ratio'],
   answer:1,explanation:'Magnesium Peto OR and lidocaine RD concern different treatment questions and incompatible effect scales. They cannot be directly pooled.'},
  {id:'dependence',skill:'dependence',source:BERKEY,kind:'choice',scene:'THE FINAL TWIST',
   title:'Ten measurements are not ten independent trials',
   text:'The authentic Berkey R example reports ten outcome measurements across five trials, with two correlated outcomes per trial. What is the correct trial count?',
   choices:['Ten independent randomized trials','Five trials with correlated outcomes requiring a model that respects dependence',
            'One study because the data are in a single R object'],
   answer:1,explanation:'The metadat Berkey example contains five trials, with ten outcome rows and within-study covariance. Counting outcome rows as independent studies misstates precision.'}
 ];
 function task(id){const t=tasks.find(x=>x.id===id);if(!t)throw Error('Unknown guided-start task');return t;}
 function assess(id,value){
  const t=task(id);let correct=false;
  if(t.kind==='numeric'){
   if(typeof value==='string'&&value.trim()!==''){
    const number=Number(value);correct=Number.isFinite(number)&&Math.abs(number-t.expected)<=t.tolerance;
   } else if(typeof value==='number')correct=Number.isFinite(value)&&Math.abs(value-t.expected)<=t.tolerance;
  }else correct=Number.isInteger(Number(value))&&String(Number(value))===String(t.answer);
  return {correct,skill:t.skill,explanation:t.explanation,source:t.source};
 }
 function guidance(attempts){
  return tasks.filter(t=>attempts&&attempts[t.id]&&attempts[t.id].firstCorrect===false).map(t=>({
    id:t.id,skill:t.skill,title:NAMES[t.skill],url:PATHS[t.skill]
  }));
 }
 function report(attempts){
  const lines=['# Synthesis Guided Start — learning notes (NOT a competence certificate)','',
    'Source-linked educational tasks, not a registered systematic review or clinical recommendation.',
    'Learner self-reports and numerical exercise outcomes are not externally adjudicated.',''];
  for(const t of tasks){
    const a=attempts?.[t.id];
    lines.push('## '+t.title,'Published data: '+t.source,'Question: '+t.text,
      'First attempt correct: '+(a?String(a.firstCorrect):'not attempted'),
      'Most recent response: '+(a?String(a.response):'not attempted'),
      'Last response correct: '+(a?String(a.lastCorrect):'not attempted'),
      'Worked explanation: '+t.explanation,'');
  }
  lines.push('## Suggested next exercises');
  const recommendations=guidance(attempts);
  if(!recommendations.length)lines.push('No first-attempt misconceptions logged; continue with real-data Research Studio or AllMeta.');
  for(const x of recommendations)lines.push('- '+x.title+': '+x.url);
  lines.push('','No grading of actual methodological competence has occurred. Source completeness, trial eligibility and reproducibility require separate human and R assessment.','');
  return lines.join('\n');
 }
 return Object.freeze({tasks,task,assess,guidance,report,benchmarks:{singleRD:first.rd,
      fiveRD:without.estimate,sixRD:all.estimate,sixI2:all.I2,berkeyTrials:r.berkey.studies.length},
      sources:{HINE,BERKEY,MAG}});
}
const exported={build,PATHS};
if(typeof module!=='undefined'&&module.exports)module.exports=exported;
if(root)root.SynthesisGuidedStart=exported;
})(typeof window!=='undefined'?window:globalThis);
