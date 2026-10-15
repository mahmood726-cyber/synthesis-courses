/* Interactive presentation for evidence-story-lab.html; no storage, network or tracking. */
(function(){
  'use strict';
  const api=window.EvidenceStoryMath;
  const picks=document.getElementById('trial-picks');
  const results=document.getElementById('numerical-results');
  if(!api||!picks||!results)return;
  const selected=new Set(api.TRIALS.map(function(t){return t.id;}));
  const fmt=function(x,n){return x.toFixed(n);};
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
    results.append(grid,caution);
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