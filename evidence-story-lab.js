/* Historical study exercise: partial archival source, not treatment guidance. */
(function(root){
  'use strict';
  const TRIALS = [
    {id:1,name:'Aronson 1948',tp:4,tn:119,cp:11,cn:128,alloc:'random',lat:44},
    {id:2,name:'Ferguson and Simes 1949',tp:6,tn:300,cp:29,cn:274,alloc:'random',lat:55},
    {id:4,name:'Hart and Sutherland 1977',tp:62,tn:13536,cp:248,cn:12619,alloc:'random',lat:52},
    {id:5,name:'Frimodt-Moller et al. 1973',tp:33,tn:5036,cp:47,cn:5761,alloc:'alternate',lat:13},
    {id:6,name:'Stein and Aronson 1953',tp:180,tn:1361,cp:372,cn:1079,alloc:'alternate',lat:44},
    {id:8,name:'TPT Madras 1980',tp:505,tn:87886,cp:499,cn:87892,alloc:'random',lat:13}
  ];
  function analyse(rows){
    if (!Array.isArray(rows) || rows.length<2) throw Error('Select two or more studies');
    const z=1.959963984540054;
    const es=rows.map(function(t){
      const cs=[t.tp,t.tn,t.cp,t.cn];
      if(cs.some(function(v){return !Number.isFinite(v)||v<=0;})) throw Error('Positive cells are required');
      const yi=Math.log((t.tp/(t.tp+t.tn))/(t.cp/(t.cp+t.cn)));
      const vi=1/t.tp-1/(t.tp+t.tn)+1/t.cp-1/(t.cp+t.cn);
      return {id:t.id,yi:yi,vi:vi,rr:Math.exp(yi)};
    });
    function fit(tau2){
      const w=es.map(function(e){return 1/(e.vi+tau2);});
      const sum=w.reduce(function(a,b){return a+b;},0);
      const mu=es.reduce(function(a,e,i){return a+w[i]*e.yi;},0)/sum;
      const se=Math.sqrt(1/sum);
      return {rr:Math.exp(mu),lo:Math.exp(mu-z*se),hi:Math.exp(mu+z*se),mu:mu,w:w};
    }
    const fixed=fit(0),ws=fixed.w, sum=ws.reduce(function(a,b){return a+b;},0);
    const Q=es.reduce(function(a,e,i){return a+ws[i]*(e.yi-fixed.mu)**2;},0);
    const C=sum-ws.reduce(function(a,w){return a+w*w;},0)/sum;
    const tau2=Math.max(0,(Q-(es.length-1))/C);
    return {rows:es,fixed:fixed,dl:fit(tau2),tau2:tau2,Q:Q,I2:Q?Math.max(0,(Q-es.length+1)/Q)*100:0};
  }
  const api={TRIALS:TRIALS,analyse:analyse};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.EvidenceStoryMath=api;
})(typeof window!=='undefined'?window:globalThis);
