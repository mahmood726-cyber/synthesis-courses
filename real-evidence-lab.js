/* Embedded small-meta-analysis teaching activities.
   Numerical records come from R metadat objects, not fabricated studies. */
(function () {
  'use strict';
  const $=id=>document.getElementById(id);
  const D=window.SYNTHESIS_REAL_DATA,I=window.SYNTHESIS_REAL_I18N;
  const params=new URLSearchParams(window.location.search);
  const val=params.get('module');
  const mod=val!==null && /^\d{1,2}$/.test(val)&&Number(val)<25?Number(val):0;
  const requested=(params.get('lang')||document.documentElement.lang||'en').toLowerCase();
  const loc=I.get(requested),lang=loc.lang,T=loc.common;
  const embedded=params.get('embed')==='1';
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  if(embedded)document.documentElement.classList.add('embedded');
  const isBerkey=mod===21||mod===23;
  const dataset=isBerkey?D.berkey:D.hine;
  let num='',selected=null,modified=false,allIds=new Set(D.hine.studies.map(x=>x.id)),hadOmission=false,priorSD=0.012;
  const numericTasks={
    0:{value:6,tol:0,focus:'count'},1:{value:D.rd(D.hine.studies[0]).rd,tol:.0005,focus:'rd'},
    5:{value:D.rd(D.hine.studies[5]).rd,tol:.0005,focus:'rd'},7:{value:D.metaRD().estimate,tol:.0005,focus:'pooled'},
    8:{value:0,tol:.09,focus:'i2'},21:{value:5,tol:0,focus:'trials'},23:{value:D.berkeyPooled('PD').estimate,tol:.003,focus:'pd'}
  };
  const truth={2:false,3:true,4:true,6:false,9:true,10:false,11:true,12:false,14:false,15:true,
    16:false,18:false,19:false,20:false,22:false,24:true};
  const scientific={
    2:'An archived dataset does not establish when a protocol was fixed or whether results were switched. Retrieve the dated protocol.',
    3:'A teaching dataset is not an exhaustive contemporary search. Search bibliographic databases, registries and relevant regulatory sources with dates and reproducible methods.',
    4:'A PRISMA diagram and eligibility log require source records, deduplication and inclusion/exclusion reasons, none of which are supplied by aggregate event totals.',
    6:'Event counts do not disclose random-sequence generation, concealment, deviations, missing outcome data or selective reporting. The trial documents are needed.',
    9:'With only six studies, funnel-plot asymmetry tests have limited power and may be misleading. Do not claim the small dataset establishes absence or presence of publication bias.',
    10:'GRADE requires judgments across risk of bias, inconsistency, indirectness, imprecision and publication bias. A statistically non-zero point estimate is insufficient.',
    11:'The published R example is historical and static. A living review requires dated surveillance, source verification and versioned updates.',
    12:'Trial-arm deaths are not disease-test positive/negative counts; there is no index test versus reference standard in these records.',
    14:'These trials compare lidocaine against control. There is no multi-treatment network and no supported SUCRA ranking.',
    15:'Counts aggregated by trial arm do not identify within-trial individual-level effect modification. That requires IPD or suitable prespecified subgroup data.',
    16:'No exposure-dose categories are recorded in these tables. Dose-response curves cannot be inferred from treatment-arm event counts alone.',
    18:'The dataset lacks patient-level covariates and subgroup results; effect modification or equity by age, sex or deprivation is not identified.',
    19:'A published data object does not demonstrate the recall, screening provenance or validation of an AI-assisted search.',
    20:'Quantitative counts are not qualitative interview transcripts, themes or researcher interpretations required for meta-ethnography.',
    22:'Executable R code can reproduce a calculation while the inputs or eligibility may still be biased, incompletely searched or misclassified.',
    24:'A numerical replication is important but insufficient for a present-day clinical recommendation. Retrieve source trials, assess quality, applicability and updated evidence.'
  };
  const rHine=[
    '# Actual R metadat data and metafor analysis',
    'library(metadat)',
    'library(metafor)',
    'dat <- dat.hine1989',
    'stopifnot(nrow(dat) == 6)',
    'dat <- escalc(measure="RD", ai=ai, n1i=n1i,',
    '             ci=ci, n2i=n2i, data=dat)',
    'print(dat[,c("source","yi","vi")])',
    'res <- rma(yi, vi, data=dat, method="REML")',
    'print(res)  # estimate ~ 0.0294, CI ~ [0.0038, 0.0551]',
    '# This particular example gives tau2 = 0.',
    '# Do not generalise that result to other datasets.'
  ].join('\n');
  const rBerkey=[
    '# Five real trials, each reporting two correlated outcomes',
    'library(metadat)',
    'library(metafor)',
    'dat <- dat.berkey1998',
    'stopifnot(length(unique(dat$trial)) == 5, nrow(dat) == 10)',
    '# Match the embedded PD-only marginal inverse-variance exercise:',
    'pd <- subset(dat, outcome == "PD")',
    'print(rma(yi, vi, data=pd, method="FE"))',
    '# Different question: a model accounting for correlated outcomes:',
    'V <- vcalc(vi=1, cluster=author, rvars=c(v1i,v2i), data=dat)',
    'res <- rma.mv(yi, V, mods=~0+outcome,',
    '              random=~outcome|trial, struct="UN", data=dat)',
    'print(res)',
    '# Do not equate PD-only FE with the bivariate REML result.'
  ].join('\n');
  function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function miniNotes(){
    if(mod===13)return 'Normal likelihood uses the published Hine pooled RD and SE. The prior is Normal(0, SD²); this is a learning sensitivity analysis, not a full Bayesian meta-analysis.';
    if(mod===17)return 'An excluded trial is a temporary diagnostic scenario. Never remove an eligible trial simply because its effect is inconvenient.';
    if(isBerkey)return 'Two within-study outcomes are correlated. PD-only common-effect pooling is deliberately not a multivariate REML fit.';
    return D.hine.direction;
  }
  function complete(){
    try {
      const k='synthesis_small_real_labs_v1',history=JSON.parse(localStorage.getItem(k)||'{}');
      history[mod]={done:true,at:new Date().toISOString(),dataset:dataset.rObject};
      localStorage.setItem(k,JSON.stringify(history));
    } catch(_) {/* localStorage optional */}
    try{
      if(window.parent&&window.parent!==window && location.protocol==='https:') window.parent.postMessage({type:'SYNTHESIS_REAL_LAB_DONE',module:mod},location.origin);
    }catch(_){}
  }
  function restored(){return allIds.size===6;}
  function textResult(ok,message){
    const el=$('result');
    el.hidden=false;el.className=ok?'':'bad';
    el.innerHTML='<strong>'+escapeHTML(ok?T.correct:T.retry)+'</strong><p>'+escapeHTML(message)+'</p>'+
      (ok?'<p>'+escapeHTML(T.uncertainty)+'</p><p>'+escapeHTML(T.done)+'</p>':'');
    if(ok)complete();
  }
  function drawHine(){
    const result=D.metaRD(Array.from(allIds));
    if(!result){$('livePlot').innerHTML='<p class="field-note">'+escapeHTML(T.tryOne)+'</p>';return;}
    const min=-.09,max=.15,x=y=>112+(Math.max(min,Math.min(max,y))-min)/(max-min)*375;
    const height=95+(result.effects.length+1)*30;
    let svg='<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 540 '+height+'"><title>Hine 1989 real risk differences and a live inverse-variance teaching estimate</title>';
    [-.05,0,.05,.10,.15].forEach(v=>{
      const X=x(v);
      svg+='<line x1="'+X+'" x2="'+X+'" y1="11" y2="'+(height-28)+'" class="'+(v===0?'zero':'')+'"/>'+
        '<text x="'+X+'" y="'+(height-8)+'" text-anchor="middle">'+(v*100).toFixed(0)+'%</text>';
    });
    result.effects.forEach((r,i)=>{
      const Y=25+i*30;
      svg+='<text x="3" y="'+(Y+4)+'">'+escapeHTML(r.study.replace(' et al.',''))+'</text>'+
        '<line class="bar" x1="'+x(r.rd-1.96*r.se)+'" y1="'+Y+'" x2="'+x(r.rd+1.96*r.se)+'" y2="'+Y+'"/>'+
        '<circle class="dot" cx="'+x(r.rd)+'" cy="'+Y+'" r="4.3"/>';
    });
    const y=25+result.effects.length*30,p=result.estimate;
    svg+='<text x="3" y="'+(y+4)+'">Pooled</text><polygon class="diamond" points="'+x(result.lower)+','+y+' '+x(p)+','+(y-8)+' '+x(result.upper)+','+y+' '+x(p)+','+(y+8)+'"/></svg>';
    $('livePlot').innerHTML='<div class="figure">'+svg+'</div><div class="live-values">'+
      '<div><strong>'+(100*result.estimate).toFixed(2)+' pp</strong><span>RD (percentage points)</span></div>'+
      '<div><strong>'+(100*result.lower).toFixed(2)+' to '+(100*result.upper).toFixed(2)+' pp</strong><span>95% CI</span></div>'+
      '<div><strong>'+result.k+' / 6</strong><span>Trials included</span></div></div>';
  }
  function drawBayes(){
    const l=D.metaRD(),v=priorSD*priorSD,liv=l.se*l.se;
    const postVar=1/(1/v+1/liv),mu=postVar*l.estimate/liv,sd=Math.sqrt(postVar);
    const lower=mu-1.959963984540054*sd,upper=mu+1.959963984540054*sd;
    $('livePlot').innerHTML='<div class="live-values">'+
      '<div><strong>'+mu.toFixed(4)+'</strong><span>'+escapeHTML(T.posterior)+'</span></div>'+
      '<div><strong>'+lower.toFixed(4)+' to '+upper.toFixed(4)+'</strong><span>'+escapeHTML(T.interval)+'</span></div>'+
      '<div><strong>'+(lower>0?'RD > 0':'Crosses 0')+'</strong><span>'+escapeHTML(T.prior)+'</span></div></div>';
    return {mu,lower,upper};
  }
  function buildTable(){
    $('rowCount').textContent=isBerkey?'5 independent trials':'6 independent trials';
    if(isBerkey){
      $('dataTable').innerHTML='<table><thead><tr><th>'+escapeHTML(T.study)+'</th><th>'+escapeHTML(T.pd)+'</th><th>'+escapeHTML(T.al)+'</th><th>'+escapeHTML(T.cov)+'</th></tr></thead><tbody>'+
        D.berkey.studies.map(s=>'<tr><td>'+escapeHTML(s.study)+'</td><td>'+s.PD.yi.toFixed(2)+' ('+s.PD.vi.toFixed(4)+')</td><td>'+s.AL.yi.toFixed(2)+' ('+s.AL.vi.toFixed(4)+')</td><td>'+s.cov.toFixed(4)+'</td></tr>').join('')+'</tbody></table>';
    } else {
      $('dataTable').innerHTML='<table><thead><tr><th>'+escapeHTML(T.study)+'</th><th>'+escapeHTML(T.treatment)+'</th><th>'+escapeHTML(T.control)+'</th><th>'+escapeHTML(T.difference)+'</th></tr></thead><tbody>'+
        D.hine.studies.map(s=>'<tr><td>'+escapeHTML(s.study)+'</td><td>'+s.ai+'/'+s.n1i+'</td><td>'+s.ci+'/'+s.n2i+'</td><td>'+(100*D.rd(s).rd).toFixed(2)+'</td></tr>').join('')+'</tbody></table>';
    }
  }
  function createControls(){
    $('livePlot').innerHTML='';
    if(Object.prototype.hasOwnProperty.call(numericTasks,mod)){
      $('taskControls').innerHTML='<label for="numericAnswer">'+escapeHTML(T.enter)+'</label><input id="numericAnswer" type="number" step="any" inputmode="decimal" autocomplete="off" aria-label="'+escapeHTML(T.enter)+'">';
      $('numericAnswer').addEventListener('input',e=>{num=e.target.value;});
      if(mod===7||mod===8)drawHine();
    } else if(mod===13){
      $('taskControls').innerHTML='<label for="priorSlider">'+escapeHTML(T.prior)+': <output id="priorOut">0.012</output></label>'+
        '<input id="priorSlider" type="range" min="0.005" max="0.100" step="0.001" value="0.012"/>'+
        '<p class="field-note">N(0, SD²) prior; normal likelihood from Hine pooled RD and SE.</p>';
      $('priorSlider').addEventListener('input',e=>{
        priorSD=Number(e.target.value);modified=true;$('priorOut').textContent=priorSD.toFixed(3);drawBayes();
      });drawBayes();
    } else if(mod===17){
      $('taskControls').innerHTML='<p class="field-note">'+escapeHTML(T.tryOne)+'</p>'+
        D.hine.studies.map(s=>'<label class="selectable"><input data-id="'+s.id+'" type="checkbox" checked/> '+
          escapeHTML(s.study)+' — '+s.ai+'/'+s.n1i+' vs '+s.ci+'/'+s.n2i+'</label>').join('');
      $('taskControls').addEventListener('change',e=>{
        const input=e.target.closest('input[data-id]');if(!input)return;
        const id=Number(input.dataset.id);if(input.checked)allIds.add(id);else{allIds.delete(id);hadOmission=true;}
        drawHine();
      });drawHine();
    } else {
      $('taskControls').innerHTML='<div role="group" aria-label="Choose whether the assertion is supported">'+
        '<button type="button" class="option" data-choice="1" aria-pressed="false"><span class="letter">A</span>'+escapeHTML(T.yes)+'</button>'+
        '<button type="button" class="option" data-choice="0" aria-pressed="false"><span class="letter">B</span>'+escapeHTML(T.no)+'</button></div>';
      $('taskControls').addEventListener('click',e=>{
        const b=e.target.closest('button[data-choice]');if(!b)return;selected=b.dataset.choice==='1';
        $('taskControls').querySelectorAll('[data-choice]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
      });
    }
  }
  function explainNumeric(m) {
    switch(m){
      case 0:return 'Six distinct trial rows. Replication still requires study-source and eligibility verification.';
      case 1:return 'Chopra RD = (2/39) − (1/43) = 0.02803, or 2.80 percentage points; sampling uncertainty is substantial.';
      case 5:return "O'Brien RD = (11/154) − (4/146) = 0.04403, or 4.40 percentage points.";
      case 7:return 'Pooled RD = 0.02944 (95% CI 0.00383 to 0.05506); matches the R metafor REML example because estimated tau² = 0 for these data.';
      case 8:return 'With k = 6, Q = 0.8597 < 5 degrees of freedom, so I² truncates to 0%. This does NOT prove identical true treatment effects.';
      case 21:return 'The Berkey data have five independent trials and ten effect-size rows because each trial reports two correlated outcomes.';
      case 23:return 'PD-only equal-effects inverse-variance mean difference = 0.34720. This is not the same as the multivariate REML fit; inspect the within-trial covariance.';
      default:return T.verified;
    }
  }
  function validate(){
    if(Object.prototype.hasOwnProperty.call(numericTasks,mod)){
      const data=numericTasks[mod],v=Number(num);
      if(num.trim()!==''&&Number.isFinite(v)&&Math.abs(v-data.value)<=data.tol)textResult(true,explainNumeric(mod));
      else textResult(false,(data.focus==='rd'?T.hintRD:data.focus==='pooled'||data.focus==='pd'?T.hintPool:T.hintCount)+' '+T.uncertainty);
    } else if(mod===17) {
      if(hadOmission&&restored())textResult(true,T.change+' '+T.uncertainty);else textResult(false,T.wrongToggle);
    } else if(mod===13){
      const p=drawBayes();
      if(modified&&p.lower>0)textResult(true,'The posterior credible interval depends on the disclosed prior width. This conditions on a normal-likelihood teaching model; no clinical decision follows.');
      else textResult(false,T.hintPrior);
    } else {
      if(selected===null){textResult(false,T.hintBinary);return;}
      if(selected===truth[mod])textResult(true,scientific[mod]||T.uncertainty);
      else textResult(false,scientific[mod]||T.hintBinary);
    }
  }
  function start(){
    try{D.verify();}catch(e){$('realLab').textContent='Source data integrity check failed: '+e.message;return;}
    $('miniBadge').textContent=T.badge;$('miniTitle').textContent=T.title;$('miniSub').textContent=T.subtitle;
    $('dataTitle').textContent=T.data;$('taskTitle').textContent=T.task;
    $('moduleTag').textContent=T.module+' '+mod;$('question').textContent=loc.prompts[mod];
    $('measureNote').textContent=miniNotes();
    $('sourceLink').textContent=T.source+' ↗';$('sourceLink').href=dataset.sourceUrl;
    $('verify').textContent=T.check;$('hint').textContent=T.hint;$('reset').textContent=T.reset;
    $('reproLabel').textContent=T.model;$('rCode').textContent=isBerkey?rBerkey:rHine;
    $('disclaimer').textContent=T.notClinical+(loc.promptTranslated?'':' '+T.pending);
    $('courseBack').href='synthesis-course'+(lang==='en'?'':'-'+lang)+'.html?module='+mod;
    $('miniFull').href='real-evidence-lab.html?module='+mod+'&lang='+lang;
    if(!loc.promptTranslated){
      const p=document.createElement('p');p.className='field-note';p.textContent=T.pending;$('question').after(p);
    }
    buildTable();createControls();
    $('verify').addEventListener('click',validate);
    $('hint').addEventListener('click',()=>{
      const msg=mod===13?T.hintPrior:mod===17?T.hintToggle:
        Object.prototype.hasOwnProperty.call(numericTasks,mod)?
          ((mod===1||mod===5)?T.hintRD:(mod===21||mod===0)?T.hintCount:T.hintPool):T.hintBinary;
      textResult(false,msg);
    });
    $('reset').addEventListener('click',()=>{
      num='';selected=null;modified=false;hadOmission=false;allIds=new Set(D.hine.studies.map(x=>x.id));priorSD=.012;
      createControls();$('result').hidden=true;
    });
  }
  start();
})();
