/* Numerical source records transcribed from official R metafor/metadat examples.
 * NOT new clinical research. See REAL_DATA_PROVENANCE.md for verification.
 * Sample sizes and effect directions must never be changed silently.
 */
(function (global) {
  'use strict';
  const HINE = Object.freeze({
    id:'hine1989',
    title:'Hine et al. (1989): prophylactic lidocaine after myocardial infarction',
    rPackage:'metadat',rObject:'dat.hine1989',k:6,
    comparison:'Lidocaine minus control',outcome:'Death during assigned treatment period',
    measure:'Risk difference (RD), treatment minus control',
    sourceUrl:'https://wviechtb.github.io/metadat/reference/dat.hine1989.html',
    analysisUrl:'https://www.metafor-project.org/doku.php/analyses:normand1999',
    citation:'Hine et al. (1989); data transcribed from Normand (1999), Table I; R metadat::dat.hine1989.',
    direction:'Positive RD means greater mortality in lidocaine group.',
    rReference:{k:6,estimate:0.0294,se:0.0131,lower:0.0038,upper:0.0551,Q:0.8597,I2:0,
      method:'metafor::escalc(measure="RD") + metafor::rma(yi,vi), REML tau^2=0 for this dataset'},
    studies:[
      {id:1,study:'Chopra et al.',n1i:39,n2i:43,ai:2,ci:1},
      {id:2,study:'Mogensen',n1i:44,n2i:44,ai:4,ci:4},
      {id:3,study:'Pitt et al.',n1i:107,n2i:110,ai:6,ci:4},
      {id:4,study:'Darby et al.',n1i:103,n2i:100,ai:7,ci:5},
      {id:5,study:'Bennett et al.',n1i:110,n2i:106,ai:7,ci:3},
      {id:6,study:"O'Brien et al.",n1i:154,n2i:146,ai:11,ci:4}
    ]
  });
  const BERKEY = Object.freeze({
    id:'berkey1998',title:'Berkey et al. (1998): periodontal surgery versus non-surgical treatment',
    rPackage:'metadat',rObject:'dat.berkey1998',k:5,effectRows:10,
    comparison:'Surgical minus non-surgical treatment',
    sourceUrl:'https://wviechtb.github.io/metadat/reference/dat.berkey1998.html',
    analysisUrl:'https://www.metafor-project.org/doku.php/analyses:berkey1998',
    citation:'Berkey et al. (1998), Table I; R metadat::dat.berkey1998.',
    note:'Two correlated one-year outcomes per trial. Values below are the observed mean differences and within-study variance/covariance entries; not 10 independent trials.',
    studies:[
      {id:1,study:'Pihlstrom et al.',year:1983,ni:14,PD:{yi:0.47,vi:0.0075},AL:{yi:-0.32,vi:0.0077},cov:0.0030},
      {id:2,study:'Lindhe et al.',year:1982,ni:15,PD:{yi:0.20,vi:0.0057},AL:{yi:-0.60,vi:0.0008},cov:0.0009},
      {id:3,study:'Knowles et al.',year:1979,ni:78,PD:{yi:0.40,vi:0.0021},AL:{yi:-0.12,vi:0.0014},cov:0.0007},
      {id:4,study:'Ramfjord et al.',year:1987,ni:89,PD:{yi:0.26,vi:0.0029},AL:{yi:-0.31,vi:0.0015},cov:0.0009},
      {id:5,study:'Becker et al.',year:1988,ni:16,PD:{yi:0.56,vi:0.0148},AL:{yi:-0.39,vi:0.0304},cov:0.0072}
    ]
  });
  function rd(s){
    const p1=s.ai/s.n1i,p0=s.ci/s.n2i;
    const variance=p1*(1-p1)/s.n1i+p0*(1-p0)/s.n2i;
    if(!(variance>0))throw Error('Cannot apply uncorrected inverse variance to zero variance');
    return {study:s.study,rd:p1-p0,variance:variance,se:Math.sqrt(variance),weight:1/variance,p1:p1,p0:p0};
  }
  function metaRD(ids){
    const selected = ids==null ? HINE.studies : HINE.studies.filter(s=>ids.includes(s.id));
    if(selected.length<2) return null;
    const effects=selected.map(rd);
    const sw=effects.reduce((a,s)=>a+s.weight,0);
    const pooled=effects.reduce((a,s)=>a+s.rd*s.weight,0)/sw;
    const se=Math.sqrt(1/sw);
    const Q=effects.reduce((a,s)=>a+s.weight*Math.pow(s.rd-pooled,2),0);
    return {k:effects.length,estimate:pooled,se:se,lower:pooled-1.959963984540054*se,upper:pooled+1.959963984540054*se,
      Q:Q,I2:Q>0?100*Math.max(0,(Q-(effects.length-1))/Q):0,effects:effects};
  }
  function berkeyPooled(outcome){
    if(!['PD','AL'].includes(outcome))throw Error('Unsupported outcome');
    // Marginal equal-effect inverse-variance demonstration ONLY, ignores joint covariance.
    const selected=BERKEY.studies.map(s=>s[outcome]),total=selected.reduce((z,s)=>z+1/s.vi,0);
    const mean=selected.reduce((z,s)=>z+s.yi/s.vi,0)/total;
    return {k:5,estimate:mean,se:Math.sqrt(1/total),method:'univariate inverse variance, not the bivariate REML R reference'};
  }
  function verify(){
    const x=metaRD(),r=HINE.rReference;
    if(x.k!==6||Math.abs(x.estimate-r.estimate)>.00005||Math.abs(x.se-r.se)>.00005 ||
      Math.abs(x.lower-r.lower)>.00006||Math.abs(x.upper-r.upper)>.00006||Math.abs(x.Q-r.Q)>.00006 ||
      x.I2!==r.I2||BERKEY.studies.length!==5||BERKEY.studies.some(s=>!s.cov)) throw Error('Small meta-analysis source/reference regression');
    for(const s of HINE.studies)if(!Number.isInteger(s.ai)||!Number.isInteger(s.ci)||s.ai<0||s.ci<0||s.ai>s.n1i||s.ci>s.n2i)throw Error('Invalid trial counts');
    for(const s of BERKEY.studies)if(s.cov*s.cov>=s.PD.vi*s.AL.vi)throw Error('Invalid within-study covariance');
    return true;
  }
  global.SYNTHESIS_REAL_DATA=Object.freeze({version:1,hine:HINE,berkey:BERKEY,rd:rd,metaRD:metaRD,berkeyPooled:berkeyPooled,verify:verify});
})(typeof window!=='undefined'?window:globalThis);
