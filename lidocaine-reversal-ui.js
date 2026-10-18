/* Source-linked lidocaine evidence-reversal exercise.
 * Archived six-study RD uses the existing SYNTHESIS_REAL_DATA calculator,
 * not a reanalysis of the 14-trial Hine review or 2015 Cochrane review.
 */
(function () {
  'use strict';
  const D=window.SYNTHESIS_REAL_DATA;
  const $=id=>document.getElementById(id);
  if(!D || !D.verify()){
    $('progress').textContent='The archive data failed integrity checks. Do not interpret results.';
    return;
  }
  const all=D.hine.studies.map(s=>s.id);
  const choices={surrogate:null,mortality:null,later:null};
  const first={surrogate:null,mortality:null,later:null};
  const selected=new Set(all);
  let shownAll=false;

  function pressed(group,attribute,value){
    for(const button of $(group).querySelectorAll('button')){
      button.setAttribute('aria-pressed',String(button.getAttribute(attribute)===value));
    }
  }
  function updateProgress(message){$('progress').textContent=message;}
  function open(id){$(id).hidden=false;}
  function close(id){$(id).hidden=true;}
  function answer(type,value){
    if(first[type]===null)first[type]=value;
    choices[type]=value;
    pressed(type==='surrogate'?'surrogate-options':type==='mortality'?'mortality-options':'later-options',
      'data-'+type,value);
    if(type==='surrogate'){
      $('surrogate-feedback').textContent=value==='separate'
        ?'Supported: fewer ventricular-fibrillation events are not themselves proof of survival benefit. Ask for mortality counts and uncertainty.'
        :value==='benefit'
          ?'Surrogate-endpoint trap: an improved rhythm outcome cannot establish improved survival. Test deaths directly.'
          :'Unsupported inference: reduced arrhythmia alone also cannot establish excess mortality. The mortality endpoint needs its own evidence.';
      open('act-2');
      updateProgress('Act II open. Predict the sign of the six real archived mortality studies.');
    }
    if(type==='mortality'){
      $('mortality-feedback').textContent=value==='positive'
        ?'Supported prediction: on the risk-difference scale, higher mortality on lidocaine has a positive sign. Check the six source counts.'
        :value==='negative'
          ?'Effect-direction misconception: the six archived rows give a positive, not negative, pooled mortality risk difference. Inspect both groups and the confidence interval.'
          :'A null-effect prediction is plausible before checking, but these six rows pool to a positive risk difference. A zero effect is not the observed point estimate.';
      open('archive-results');
      open('act-3');
      render();
      updateProgress('Act III open. Compare populations and effect measures before deciding what the later review means.');
    }
    if(type==='later'){
      $('later-feedback').textContent=value==='qualified'
        ?'Supported: compare trial selection, population, follow-up and RD versus RR before interpreting a changed estimate. Neither result proves universal benefit or harm.'
        :value==='proven-safe'
          ?'Absence-of-evidence misconception: a confidence interval spanning both benefit and harm does not prove that an intervention is harmless.'
          :'Scale misconception: the 1989 subgroup reports a risk difference, while the 2015 broader synthesis reports a risk ratio. Their subtraction has no meaningful effect-size interpretation.';
      open('commit');
      updateProgress('All three acts are available. Make your own source-grounded first-commit analysis below.');
    }
  }

  function render(){
    const table=$('trial-rows');
    const holder=$('trials');
    table.replaceChildren();holder.replaceChildren();
    D.hine.studies.forEach(s=>{
      const active=selected.has(s.id);
      const label=document.createElement('label');
      label.className='trial';
      const check=document.createElement('input');
      check.type='checkbox';
      check.checked=active;
      check.dataset.id=String(s.id);
      check.addEventListener('change',()=>{
        if(check.checked)selected.add(s.id);else selected.delete(s.id);
        render();
      });
      const caption=document.createElement('span');
      caption.textContent=s.study+' — '+s.ai+'/'+s.n1i+' vs '+s.ci+'/'+s.n2i;
      label.append(check,caption);holder.append(label);
      const row=document.createElement('tr');
      const study=D.rd(s);
      for(const value of [s.study+(active?'':' (omitted for sensitivity)'),s.ai+'/'+s.n1i,s.ci+'/'+s.n2i,(100*study.rd).toFixed(2)+' percentage points']){
        const cell=document.createElement('td');cell.textContent=value;row.append(cell);
      }
      table.append(row);
    });
    const subset=D.metaRD([...selected]);
    if(!subset){
      $('estimate').textContent='Select at least two studies to calculate a pooled RD. No estimate has been produced.';
      $('subset-warning').textContent='Refusal: this classroom meta-analysis requires two or more original studies.';
      return;
    }
    const fmt=x=>(x>=0?'+':'')+(100*x).toFixed(3);
    $('estimate').textContent='Selected '+subset.k+' of 6 archived trials: common-effect mortality RD '+fmt(subset.estimate)+
      ' percentage points (95% CI '+fmt(subset.lower)+' to '+fmt(subset.upper)+'); Q='+
      subset.Q.toFixed(3)+', I²='+subset.I2.toFixed(1)+'%.';
    $('subset-warning').textContent=subset.k===6
      ?'All six genuine archive records: this common-effect estimate agrees numerically with the package REML fit because estimated τ² = 0 here.'
      :'You have removed original study records for a retrospective sensitivity exercise. This is not evidence that those trials are ineligible.';
  }

  for(const b of $('surrogate-options').querySelectorAll('button')){
    b.setAttribute('aria-pressed','false');
    b.addEventListener('click',()=>answer('surrogate',b.dataset.surrogate));
  }
  for(const b of $('mortality-options').querySelectorAll('button')){
    b.setAttribute('aria-pressed','false');
    b.addEventListener('click',()=>answer('mortality',b.dataset.mortality));
  }
  for(const b of $('later-options').querySelectorAll('button')){
    b.setAttribute('aria-pressed','false');
    b.addEventListener('click',()=>answer('later',b.dataset.later));
  }
  $('show-all').addEventListener('click',()=>{
    shownAll=true;
    open('act-2');open('archive-results');open('act-3');open('commit');
    render();
    updateProgress('Open-book route: all acts, datasets and original references are visible. Unanswered predictions remain unanswered.');
  });
  $('restart').addEventListener('click',()=>{
    shownAll=false;
    for(const k of Object.keys(choices)){choices[k]=null;first[k]=null;}
    selected.clear();all.forEach(x=>selected.add(x));
    for(const [group,attribute] of [
      ['surrogate-options','data-surrogate'],
      ['mortality-options','data-mortality'],
      ['later-options','data-later']
    ]){for(const b of $(group).querySelectorAll('button'))b.setAttribute('aria-pressed','false');}
    close('act-2');close('archive-results');close('act-3');close('commit');
    $('surrogate-feedback').textContent='Commit a prediction to open the 1989 evidence.';
    $('mortality-feedback').textContent='Choose before unveiling the original counts. You can change your prediction.';
    $('later-feedback').textContent='Make a decision to unlock your evidence dossier.';
    $('commit-feedback').textContent='Write both fields (at least 30 characters each) to create your locally reproducible analysis record.';
    $('rule').value='';$('reason').value='';$('dossier').value='';
    updateProgress('Act I open. Choose a hypothesis, then inspect the evidence.');
  });
  $('make-commit').addEventListener('click',()=>{
    const rule=$('rule').value.trim(),reason=$('reason').value.trim();
    if(rule.length<30 || reason.length<30){
      $('commit-feedback').textContent='Add at least 30 characters to EACH written field. No dossier was created.';
      return;
    }
    const numeric=D.metaRD([...selected]);
    if(!numeric){
      $('commit-feedback').textContent='Restore at least two archived trials for a reproducible pooled estimate.';
      return;
    }
    const mark=type=>'first: '+(first[type]||'not answered')+'; current: '+(choices[type]||'not answered');
    const ids=D.hine.studies.filter(s=>selected.has(s.id)).map(s=>s.id);
    const results='# Lidocaine history: first evidence-analysis commit\n\n'+
      '- Source: metadat::dat.hine1989, originally tabulated in Normand (1999), Table I\n'+
      '- Original 1989 review: https://doi.org/10.1001/archinte.1989.00390120056011\n'+
      '- Published archival records: https://wviechtb.github.io/metadat/reference/dat.hine1989.html\n'+
      '- Broader 2015 Cochrane review: https://pmc.ncbi.nlm.nih.gov/articles/PMC8454263/\n'+
      '- Classroom effect: treatment minus control RD, not OR or RR\n'+
      '- Included archive IDs: '+ids.join(', ')+' (k='+numeric.k+'; deliberate subset if k < 6)\n'+
      '- Equal-effect inverse-variance pooled RD: '+numeric.estimate.toPrecision(9)+
      ', 95% CI ['+numeric.lower.toPrecision(9)+', '+numeric.upper.toPrecision(9)+']\n'+
      '- Reproduce FULL archive in R: Rscript scripts/verify_small_meta.R\n'+
      '- Decisions: surrogate '+mark('surrogate')+'; archive mortality '+mark('mortality')+
      '; later review '+mark('later')+'\n\n'+
      '## My rule and endpoint\n'+rule+'\n\n'+
      '## My interpretation, uncertainty and missing evidence\n'+reason+'\n\n'+
      '## Methodological restrictions\n'+
      'Retrospective classroom selection; not the full 1989 review or 2015 review. '+ 
      'Older RD and later RR are not directly subtractable. The full six-row normal-model common-effect '+ 
      'fit agrees with the published REML example because tau^2 = 0 for that archive only. '+ 
      'Reproduction alone is not clinical guidance, original-trial re-extraction or independent expert review.\n';
    $('dossier').value=results;
    $('commit-feedback').textContent='Your first-commit-ready Markdown was generated LOCALLY. Copy it and create a Git commit yourself; no commit or upload occurred.';
  });
  $('copy-dossier').addEventListener('click',()=>{
    const value=$('dossier').value;
    if(!value){$('commit-feedback').textContent='Generate a dossier first.';return;}
    if(!navigator.clipboard || !navigator.clipboard.writeText){
      $('commit-feedback').textContent='Clipboard API unavailable. Select and copy the Markdown manually.';
      return;
    }
    navigator.clipboard.writeText(value)
      .then(()=>$('commit-feedback').textContent='Markdown copied locally. No remote Git commit was created.')
      .catch(()=>$('commit-feedback').textContent='Clipboard was blocked. Select and copy the Markdown manually.');
  });
  render();
})();
