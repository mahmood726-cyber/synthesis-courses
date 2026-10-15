/* Six published archival records from metadat::dat.egger2001, not a complete review.
   https://wviechtb.github.io/metadat/reference/dat.egger2001.html
   Columns a/n1 = magnesium deaths / allocated, c/n2 = control deaths / allocated.
   A teaching subset; not clinical recommendations.
*/
(function (root) {
  'use strict';
  const trials = Object.freeze([
    {id:1, study:'Morton', year:1984, a:1, n1:40, c:2, n2:36},
    {id:2, study:'Rasmussen', year:1986, a:9, n1:135, c:23, n2:135},
    {id:3, study:'Smith', year:1986, a:2, n1:200, c:7, n2:200},
    {id:6, study:'Shechter', year:1989, a:1, n1:59, c:9, n2:56},
    {id:14,study:'LIMIT-2', year:1992, a:90, n1:1159, c:118, n2:1157},
    {id:16,study:'ISIS-4', year:1995, a:2216, n1:29011, c:2103, n2:29039}
  ]);
  function peto(selected) {
    if (!Array.isArray(selected) || !selected.length) throw new Error('Select at least one study.');
    let sumOE = 0, sumV = 0;
    const included = selected.map(t => {
      const {a,n1,c,n2} = t;
      if (![a,n1,c,n2].every(Number.isInteger) || a<0 || c<0 || n1<1 || n2<1 || a>n1 || c>n2) throw new Error('Invalid counts.');
      const N=n1+n2, D=a+c;
      const oe=a-(n1*D/N), variance=n1*n2*D*(N-D)/(N*N*(N-1));
      if (!(variance>0)) throw new Error('Peto variance is undefined.');
      sumOE+=oe; sumV+=variance;
      return {id:t.id, study:t.study, oe, variance};
    });
    const logOR=sumOE/sumV, se=Math.sqrt(1/sumV), z=1.959963984540054;
    return {k:selected.length, logOR, se, OR:Math.exp(logOR), low:Math.exp(logOR-z*se),
      high:Math.exp(logOR+z*se), information:sumV,
      contributions:included.map(x=>({ ...x, informationShare:x.variance/sumV }))};
  }
  const api={trials,peto,source:'https://wviechtb.github.io/metadat/reference/dat.egger2001.html'};
  if (typeof module !== 'undefined' && module.exports) module.exports=api;
  if(root) root.MagnesiumReversal=api;
})(typeof window !== 'undefined' ? window : globalThis);
