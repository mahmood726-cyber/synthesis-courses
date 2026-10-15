/* Interactive presentation for evidence-story-lab.html; no storage, network or tracking. */
(function(){
  'use strict';
  const api=window.EvidenceStoryMath;
  const picks=document.getElementById('trial-picks');
  const results=document.getElementById('numerical-results');
  const plotStyle=document.createElement('style');
  plotStyle.textContent='.forest-figure{margin:1rem 0;padding:1rem;background:#12263d;border:1px solid #6b8099;border-radius:.75rem;overflow-x:auto}'+
    '.forest-figure figcaption,.forest-summary-label,.forest-axis-label{color:#f5cf70;fill:#f5cf70;font-weight:700}'+
    '.forest-figure svg{display:block;width:100%;min-width:650px;height:auto;font:13px system-ui}'+
    '.forest-figure text{fill:#edf3ff}.forest-figure .forest-grid{stroke:#51677d;stroke-dasharray:3 6}'+
    '.forest-figure .forest-null{stroke:#f5cf70;stroke-width:2;stroke-dasharray:5 4}'+
    '.forest-study-ci{stroke:#94f0e0;stroke-width:2}.forest-summary-ci{stroke:#f5cf70;stroke-width:2}'+
    '.forest-point{fill:#94f0e0;stroke:#0d182a}.forest-diamond{fill:#f5cf70;stroke:#0d182a}';
  document.head.append(plotStyle);
  if(!api||!picks||!results)return;
  const selected=new Set(api.TRIALS.map(function(t){return t.id;}));
  const fmt=function(x,n){return x.toFixed(n);};

  // The forest plot uses the same study-level log RRs and sampling variances as
  // the numerical cards; all comparisons share a log-scale axis across presets.
  function forestFigure(trials,analysis){
    const ns='http://www.w3.org/2000/svg';
    const figure=document.createElement('figure');
    figure.className='forest-figure';
    const heading=document.createElement('figcaption');
    heading.textContent='Forest plot · archival, selected teaching rows';
    figure.append(heading);
    const svg=document.createElementNS(ns,'svg');
    const first=174,last=625,top=42,step=35;
    const pooledY=top+trials.length*step+13,randomY=pooledY+37;
    const height=randomY+74;
    svg.setAttribute('viewBox','0 0 720 '+height);
    svg.setAttribute('role','img');
    svg.setAttribute('aria-label','Log-scale forest plot showing selected study risk ratios and 95% confidence intervals, plus fixed-effect and DerSimonian-Laird pooled estimates');
    const low=Math.log(.05),high=Math.log(2.5);
    const pos=rr=>first+(Math.log(rr)-low)/(high-low)*(last-first);
    function el(tag,attrs,body){
      const node=document.createElementNS(ns,tag);
      Object.keys(attrs||{}).forEach(k=>node.setAttribute(k,String(attrs[k])));
      if(body!==undefined)node.textContent=String(body);
      svg.append(node);
      return node;
    }
    el('title',{},'Selected historical BCG trials: risk ratio forest plot');
    el('desc',{},'The solid reference line is risk ratio one. Round markers are trial estimates; diamonds are pooled estimates. All intervals are normal-approximation 95% intervals from the displayed illustrative model. Refer to the adjacent table for exact values.');
    [0.05,.1,.25,.5,1,2.5].forEach(rr=>{
      const xx=pos(rr);
      el('line',{x1:xx,x2:xx,y1:18,y2:randomY+16,class:rr===1?'forest-null':'forest-grid'});
      el('text',{x:xx,y:height-26,'text-anchor':'middle',class:'forest-tick'},rr);
    });
    function interval(label,rr,lo,hi,y,pooled){
      el('text',{x:6,y:y+4,class:pooled?'forest-summary-label':'forest-study-label'},label);
      el('line',{x1:pos(lo),x2:pos(hi),y1:y,y2:y,class:pooled?'forest-summary-ci':'forest-study-ci'});
      [lo,hi].forEach(v=>el('line',{x1:pos(v),x2:pos(v),y1:y-5,y2:y+5,class:pooled?'forest-summary-ci':'forest-study-ci'}));
      if(pooled){
        const x=pos(rr);
        el('polygon',{points:[pos(lo)+','+y,x+','+(y-9),pos(hi)+','+y,x+','+(y+9)].join(' '),class:'forest-diamond'});
      }else{
        el('circle',{cx:pos(rr),cy:y,r:5,class:'forest-point'});
      }
      el('text',{x:635,y:y+4,class:'forest-value'},rr.toFixed(3));
    }
    trials.forEach((t,i)=>{
      const e=analysis.rows.find(row=>row.id===t.id);
      const z=1.959963984540054,sd=Math.sqrt(e.vi);
      const name=t.name.replace(' and ',' & ').replace(' et al.','');
      interval(name,e.rr,Math.exp(e.yi-z*sd),Math.exp(e.yi+z*sd),top+i*step,false);
    });
    interval('Fixed effect',analysis.fixed.rr,analysis.fixed.lo,analysis.fixed.hi,pooledY,true);
    interval('DL random',analysis.dl.rr,analysis.dl.lo,analysis.dl.hi,randomY,true);
    el('text',{x:(first+last)/2,y:height-5,'text-anchor':'middle',class:'forest-axis-label'},'Risk ratio (logarithmic axis; 1 = no difference)');
    figure.append(svg);
    const note=document.createElement('p');
    note.className='muted';
    note.textContent='Circles denote individual study RRs with 95% CIs. Diamonds denote illustrative pooled RRs. Axis is logarithmic and held constant across selections. No study is declared ineligible by toggling it.';
    figure.append(note);
    return figure;
  }
  function render(){
    const trials=api.TRIALS.filter(function(t){return selected.has(t.id);});
    document.getElementById('chosen-count').textContent=String(trials.length);
    picks.replaceChildren();
    api.TRIALS.forEach(function(t){
      const label=document.createElement('label');
      label.className='trial';
      const check=document.createElement('input');
      check.type='checkbox';check.dataset.id=String(t.id);check.checked=selected.has(t.id);
      const wrap=document.createElement('span'),title=document.createElement('strong'),detail=document.createElement('small');
      title.textContent=t.name;
      detail.textContent=t.alloc+' assignment · |latitude| '+t.lat+'° · TB cases '+t.tp+'/'+(t.tp+t.tn)+' vs '+t.cp+'/'+(t.cp+t.cn);
      wrap.append(title,detail);label.append(check,wrap);picks.append(label);
    });
    results.replaceChildren();
    if(trials.length<2){
      const p=document.createElement('p');p.textContent='Select at least two studies for this illustrative calculation.';results.append(p);return;
    }
    const a=api.analyse(trials);
    const grid=document.createElement('div');grid.className='stat-grid';
    const metrics=[
      ['Fixed-effect inverse-variance RR',a.fixed.rr,'95% CI '+fmt(a.fixed.lo,3)+' to '+fmt(a.fixed.hi,3)],
      ['DerSimonian–Laird random-effects RR',a.dl.rr,'95% CI '+fmt(a.dl.lo,3)+' to '+fmt(a.dl.hi,3)],
      ['Heterogeneity I²',a.I2,'Q = '+fmt(a.Q,2)+'; DL tau² = '+fmt(a.tau2,3)]
    ];
    metrics.forEach(function(m,i){
      const box=document.createElement('div');box.className='stat';
      const heading=document.createElement('span');heading.textContent=m[0];
      const value=document.createElement('strong');value.textContent=fmt(m[1],i===2?1:3)+(i===2?'%':'');
      const detail=document.createElement('small');detail.textContent=m[2];box.append(heading,value,detail);grid.append(box);
    });
    const caution=document.createElement('p');caution.className='warning';
    caution.textContent='Interpretation guardrail: this subset is selected for teaching, not by review eligibility. Heterogeneity is substantial, and two rows are not randomly allocated. Neither pooled summary is a clinical treatment-effect estimate.';
    results.append(forestFigure(trials,a),grid,caution);
    const detail=document.createElement('details'),summary=document.createElement('summary');
    summary.textContent='See individual historical risk ratios';
    const table=document.createElement('table'),head=document.createElement('thead'),body=document.createElement('tbody');
    const tr=document.createElement('tr');
    ['Trial','Observed risk ratio','Allocation method'].forEach(function(v){const th=document.createElement('th');th.textContent=v;tr.append(th);});
    head.append(tr);
    trials.forEach(function(t){
      const r=a.rows.find(function(v){return v.id===t.id;});
      const row=document.createElement('tr');
      [t.name,fmt(r.rr,3),t.alloc].forEach(function(v){const cell=document.createElement('td');cell.textContent=v;row.append(cell);});
      body.append(row);
    });
    table.append(head,body);detail.append(summary,table);results.append(detail);
  }
  picks.addEventListener('change',function(e){
    if(!e.target.matches('input[data-id]'))return;
    const id=Number(e.target.dataset.id);
    if(e.target.checked)selected.add(id);else selected.delete(id);
    render();
  });
  document.getElementById('presets').addEventListener('click',function(e){
    const btn=e.target.closest('button[data-preset]');if(!btn)return;
    selected.clear();
    api.TRIALS.forEach(function(t){
      if(btn.dataset.preset==='all'||(btn.dataset.preset==='madras-out'&&t.id!==8)||(btn.dataset.preset==='random-only'&&t.alloc==='random'))selected.add(t.id);
    });
    render();
  });
  document.getElementById('prediction').addEventListener('click',function(e){
    const btn=e.target.closest('button[data-guess]');if(!btn)return;
    const before=api.analyse(api.TRIALS.filter(function(t){return t.id!==8;})).fixed.rr;
    const after=api.analyse(api.TRIALS).fixed.rr;
    const p=document.getElementById('prediction-feedback');p.hidden=false;
    p.textContent=(btn.dataset.guess==='toward-null'?'Correct. ':'Try again. ')+
      'Including TPT Madras moves the fixed-effect demonstration from RR '+fmt(before,3)+' to '+fmt(after,3)+
      ', closer to 1. This does not make excluding it a valid analysis. Other missing studies and heterogeneity still matter.';
    this.querySelectorAll('button[data-guess]').forEach(function(b){b.setAttribute('aria-pressed',String(b===btn));});
  });
  document.getElementById('provenance-quiz').addEventListener('click',function(e){
    const btn=e.target.closest('button[data-source]');if(!btn)return;
    const p=document.getElementById('provenance-feedback');p.hidden=false;
    p.textContent=btn.dataset.source==='trial'?
      'Correct: numerical estimates derive from reported trial counts, after verification of provenance, design, endpoint and analysis assumptions.':
      'A narrative offers ethical reflection; it cannot generate or validate a numerical treatment effect. Check empirical data and methods.';
  });
  render();
})();