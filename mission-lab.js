/* Synthesis Mission Lab v1 — dependency-free client-side learning engine.
   Fictional datasets are not clinical evidence. No analytics, accounts or network calls.
   All mission content is in mission-lab-data.js; the course itself remains unchanged. */
(function () {
  'use strict';
  const missions = window.SYNTHESIS_MISSIONS || [];
  const KEY = 'synthesis_mission_lab_v1';
  const $ = function (id) { return document.getElementById(id); };
  const stage = $('missionStage');
  const grid = $('missionGrid');
  const search = $('missionSearch');
  if (!stage || !grid || missions.length !== 25) {
    if (stage) stage.textContent = 'Mission data unavailable. Reload the page and check that mission-lab-data.js loaded.';
    return;
  }
  const labels = {multi:'Spot the evidence',match:'Match the clues',order:'Arrange the workflow',triage:'Two-reviewer game',number:'Calculate the answer',pool:'Live forest-plot lab',bayes:'Prior experiment',dossier:'Portfolio builder',decision:'Editorial choices'};
  const poolTrials = [
    {id:'A',name:'Trial A',a:20,n1:200,c:35,n0:200},
    {id:'B',name:'Trial B',a:18,n1:180,c:30,n0:180},
    {id:'C',name:'Trial C',a:300,n1:1000,c:150,n0:1000},
    {id:'D',name:'Trial D',a:12,n1:100,c:20,n0:100}
  ];
  const valid = ['Include','Exclude','Unclear'];
  let current = 0;
  let work;
  let toastTimer;
  let teamIndex = -1;
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g,function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (!raw || typeof raw !== 'object') return {records:{},notes:{}};
      return {records:raw.records && typeof raw.records==='object' ? raw.records:{},
        notes:raw.notes && typeof raw.notes==='object' ? raw.notes:{}};
    } catch (_) { return {records:{},notes:{}}; }
  }
  let saved = load();
  function persist() {
    try { localStorage.setItem(KEY,JSON.stringify(saved)); } catch (_) {
      // The lab remains usable when private browsing blocks localStorage.
    }
  }
  function mkWork(t) {
    return {selected:new Set(),answer:-1,order:(t.items || []).map(function (row) {return row[0];}),
      matches:{},numbers:{},triage:[{},{},{}],triagePhase:0,
      pool:{A:true,B:true,C:true,D:true},poolTouched:false,prior:0.1,priorMoved:false,
      decisionStep:0,failures:0,hint:false,checks:{},notes:Object.assign({},saved.notes[t.id] || {})};
  }
  function recordFor(id) {return saved.records[String(id)] || {};}
  function badgeFor(t) {return recordFor(t.id).done ? '<span class="check" aria-label="Complete">✓</span>' : '<span class="check" aria-hidden="true">○</span>';}
  function refreshBoard() {
    const q = search.value.trim().toLowerCase();
    const filtered = missions.filter(function(t) {return (t.title+' '+t.tag+' '+labels[t.kind]).toLowerCase().includes(q);});
    $('railCounter').textContent = filtered.length + ' shown';
    grid.innerHTML = filtered.map(function (t) {
      return '<button type="button" class="mission-tile '+(t.id===current?'current':'')+'" data-id="'+t.id+'" aria-current="'+(t.id===current?'true':'false')+'">'+
        '<span class="n">'+String(t.id).padStart(2,'0')+'</span><span><span class="title">'+esc(t.title)+'</span><span class="mode">'+esc(labels[t.kind])+' · '+t.minutes+' min</span></span>'+badgeFor(t)+'</button>';
    }).join('') || '<p class="mission-empty">No matching missions. Try a method or topic.</p>';
  }
  function refreshStats() {
    const done = missions.filter(function(t) {return recordFor(t.id).done;});
    const xp = done.reduce(function(s,t) {return s + (Number(recordFor(t.id).best)||0);},0);
    $('doneCount').textContent = done.length;
    $('xpCount').textContent = xp.toLocaleString();
    $('skillRank').textContent = done.length>=20?'Lead Investigator':done.length>=12?'Method Detective':done.length>=5?'Case Solver':'Explorer';
    $('meterFill').style.width = (100*done.length/missions.length)+'%';
    $('missionMeter').setAttribute('aria-valuenow',String(done.length));
  }
  function chooseMission(id, scrollToExercise) {
    if (!Number.isInteger(id) || id<0 || id>=missions.length) return;
    current=id;work=mkWork(missions[id]);
    try {
      const url = new URL(location.href);url.searchParams.set('module',String(id));
      history.replaceState(null,'',url);
    } catch (_) {}
    render();
    refreshBoard();
    const title = $('challengeTitle');
    if (title) title.focus({preventScroll:true});
    // Keep mobile and keyboard users oriented after selecting a challenge.
    // Do not auto-scroll on initial page load.
    if (scrollToExercise !== false) {
      const target = $('challenge');
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (target && typeof target.scrollIntoView === 'function') target.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
    }
  }
  function score(t) {
    return t.kind === 'dossier' ? 50 : Math.max(50,100 - 15*work.failures - (work.hint?10:0));
  }
  function complete(t, message) {
    const was = recordFor(t.id), points = score(t);
    saved.records[String(t.id)] = {done:true,best:Math.max(Number(was.best)||0,points),completedAt:new Date().toISOString(),selfAssessed:t.kind==='dossier'};
    persist();refreshBoard();refreshStats();
    showFeedback(true,message || t.explain,true);
  }
  function showFeedback(ok,message,finished) {
    let el = $('feedback');
    if (!el) return;
    el.className = 'feedback '+(ok?'good':'try');
    el.innerHTML = '<h3>'+(finished ? '✅ Mission logged' : ok ? 'Good judgement' : 'Investigate again')+'</h3><p>'+esc(message)+'</p>'+
      (finished?'<p><strong>'+(missions[current].kind==='dossier'?'Draft saved — not scientifically graded':('Best score: '+recordFor(current).best+' points'))+'</strong></p><button class="primary" type="button" data-action="next">Next mission ↗</button>':'');
    el.hidden = false;
    el.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function tryAgain(message) {work.failures++;showFeedback(false,message || 'Not quite. Recheck the criteria, use the hint if necessary, and try again.',false);}
  function feedbackSlot() {return '<div id="feedback" role="status" aria-live="polite" hidden></div>';}
  function selectedButton(i,which) {return (which==='choose' ? work.selected.has(i) : work.answer===i);}
  function choiceButtons(options,which) {
    return '<div class="choices">'+options.map(function(text,i){
      const on=selectedButton(i,which);
      return '<button type="button" class="choice" data-action="'+which+'" data-index="'+i+'" aria-pressed="'+on+'">'+
        '<span class="choice-icon" aria-hidden="true">'+(on?'✓':String.fromCharCode(65+i))+'</span><span>'+esc(text)+'</span></button>';
    }).join('')+'</div>';
  }
  function activities(t) {
    if (t.kind==='multi') return '<h3 class="task-header">'+esc(t.prompt)+'</h3><p class="task-intro">Select all that apply; the number of right answers is not displayed.</p>'+
      choiceButtons(t.options,'choose')+checkAction();
    if (t.kind==='match') {
      return '<h3 class="task-header">'+esc(t.prompt)+'</h3><div class="match-grid">'+t.rows.map(function(row,i){
        return '<div class="match-row"><label class="field-title" for="match'+i+'">'+esc(row[0])+'</label>'+
          '<select id="match'+i+'" data-match="'+i+'"><option value="">Choose a domain…</option>'+
          t.categories.map(function(c){return '<option value="'+esc(c)+'"'+(work.matches[i]===c?' selected':'')+'>'+esc(c)+'</option>';}).join('')+'</select></div>';
      }).join('')+'</div>'+checkAction();
    }
    if (t.kind==='order') {
      const lookup=Object.fromEntries(t.items.map(function(row){return [row[0],row[1]];}));
      return '<h3 class="task-header">'+esc(t.prompt)+'</h3><p class="task-intro">Use ↑ and ↓ to reorder (or drag with a pointer). Keyboard users have identical controls.</p>'+
        '<ol class="work-list" id="sortable">'+work.order.map(function(id,i){
          return '<li class="work-row" draggable="true" data-order="'+i+'"><span class="index">'+(i+1)+'.</span><span class="work-text">'+esc(lookup[id])+'</span>'+
          '<span class="sort-controls"><button class="icon-btn" type="button" data-action="move" data-index="'+i+'" data-dir="-1" aria-label="Move '+(i+1)+' up" '+(i===0?'disabled':'')+'>↑</button>'+
          '<button class="icon-btn" type="button" data-action="move" data-index="'+i+'" data-dir="1" aria-label="Move '+(i+1)+' down" '+(i===work.order.length-1?'disabled':'')+'>↓</button></span></li>';
        }).join('')+'</ol>'+checkAction();
    }
    if (t.kind==='number') {
      return '<h3 class="task-header">'+esc(t.prompt)+'</h3><div class="numbers-grid">'+t.fields.map(function(f){
        return '<div class="number-row"><label class="field-title" for="number-'+f[0]+'">'+esc(f[1])+'</label>'+
          '<input type="number" step="any" id="number-'+f[0]+'" data-number="'+f[0]+'" value="'+esc(work.numbers[f[0]]||'')+'" inputmode="decimal" placeholder="Your calculation"></div>';
      }).join('')+'</div><p class="formula">Show your working. A small numerical rounding tolerance is accepted; the explanation shows the exact calculation after checking.</p>'+checkAction();
    }
    if (t.kind==='triage') return triageActivity(t);
    if (t.kind==='pool') return poolActivity(t);
    if (t.kind==='bayes') return bayesActivity(t);
    if (t.kind==='dossier') return dossierActivity(t);
    if (t.kind==='decision') return decisionActivity(t);
    return '<p>Unknown mission format.</p>';
  }
  function checkAction(label) {
    return '<div class="lab-actions"><button class="primary" type="button" data-action="check">'+(label||'Check my reasoning')+'</button><button class="secondary" type="button" data-action="hint">Reveal a clue</button></div>';
  }
  function triageActivity(t) {
    const phase=work.triagePhase,roundName=['Reviewer A — private pass','Reviewer B — independent pass','Adjudication — final agreement'][phase];
    const responses=work.triage[phase];
    const agreement=t.records.filter(function(r){return work.triage[0][r[0]]===work.triage[1][r[0]];}).length;
    let html='<h3 class="task-header">'+esc(t.prompt)+'</h3><div class="triage-head"><span class="round-tag">'+roundName+'</span>'+
      '<span class="field-detail">'+(phase===0?'Classify before seeing another reviewer.':phase===1?'Have Reviewer B decide without consulting A.':'Review disagreements and agree a final decision.')+'</span></div>';
    if (phase===2) html+='<p class="correct-note">Initial reviewer agreement: '+agreement+'/'+t.records.length+
      '. A disagreement is a question for adjudication, not proof one reviewer was wrong.</p>';
    html+='<div class="triage-cards">'+t.records.map(function(r){
      return '<div class="triage-row"><div><h4>Record '+esc(r[0])+'</h4><p>'+esc(r[1])+'</p>'+
        (phase===2?'<div class="triage-decisions"><span>A: '+esc(work.triage[0][r[0]])+'</span><span>B: '+esc(work.triage[1][r[0]])+'</span></div>':'')+
        '</div><label class="field-detail" for="triage-'+esc(r[0])+'">'+(phase===2?'Consensus':'Your decision')+
        '<select id="triage-'+esc(r[0])+'" data-triage="'+esc(r[0])+'"><option value="">Choose…</option>'+
          valid.map(function(v){return '<option value="'+v+'"'+(responses[r[0]]===v?' selected':'')+'>'+v+'</option>';}).join('')+'</select></label></div>';
    }).join('')+'</div><div class="lab-actions"><button type="button" class="primary" data-action="triage-next">'+
      (phase===0?'Save A and pass to B':phase===1?'Compare independent verdicts':'Check reconciled verdicts')+
      '</button><button class="secondary" type="button" data-action="hint">Reveal a clue</button></div>';
    return html;
  }
  function poolActivity(t) {
    return '<h3 class="task-header">'+esc(t.prompt)+'</h3><p class="task-intro">Check the studies you want included in an illustrative sensitivity calculation. Unchecking does not remove anything from the original evidence.</p>'+
      '<div class="pool-studies">'+poolTrials.map(function(s){
        return '<div class="pool-item"><label><input type="checkbox" data-pool="'+s.id+'" '+(work.pool[s.id]?'checked':'')+'><strong>'+s.name+'</strong> — '+s.a+'/'+s.n1+' events vs '+s.c+'/'+s.n0+'</label></div>';
      }).join('')+'</div><div id="poolViz" aria-live="polite">'+poolDisplay()+'</div><p class="formula">Teaching method: fixed-effect inverse-variance pooling of log risk ratios with normal 95% confidence intervals. All counts positive; not a clinical meta-analysis. Different-study effects may invalidate this summary.</p>'+
      '<h3 class="task-header">Editorial judgement</h3>'+choiceButtons(t.options,'answer')+checkAction();
  }
  function computePool() {
    const included=poolTrials.filter(function(s){return work.pool[s.id];}).map(function(s){
      const log=Math.log((s.a/s.n1)/(s.c/s.n0));
      const variance=1/s.a - 1/s.n1 + 1/s.c - 1/s.n0;
      return Object.assign({},s,{log:log,se:Math.sqrt(variance),weight:1/variance});
    });
    if (!included.length) return {included:[],pooled:null};
    const sumW=included.reduce(function(a,s){return a+s.weight;},0);
    const mean=included.reduce(function(a,s){return a+s.weight*s.log;},0)/sumW;
    const se=Math.sqrt(1/sumW);
    const Q=included.reduce(function(a,s){return a+s.weight*Math.pow(s.log-mean,2);},0);
    const df=included.length-1;
    const I2=Q>0?Math.max(0,(Q-df)/Q*100):0;
    return {included:included,pooled:{log:mean,se:se,rr:Math.exp(mean),lower:Math.exp(mean-1.96*se),upper:Math.exp(mean+1.96*se),I2:I2}};
  }
  function poolDisplay() {
    const c=computePool();
    if (!c.pooled) return '<p class="feedback try">Select at least one trial to calculate a result.</p>';
    const p=c.pooled, pretty=function(n){return n.toFixed(2);};
    const min=-1.6,max=1.5,x=function(v){return 170+(Math.max(min,Math.min(max,v))-min)/(max-min)*500;};
    const ticks=[0.25,0.5,1,2,4];
    const height=90+(c.included.length+1)*38;
    let svg='<svg role="img" viewBox="0 0 710 '+height+'" xmlns="http://www.w3.org/2000/svg"><title>Study risk ratios with 95% confidence intervals</title>'+
      '<desc>Horizontal logarithmic risk-ratio axis; the gold diamond is the teaching fixed-effect pooled estimate. Read numerical results below.</desc>';
    ticks.forEach(function(t){const xx=x(Math.log(t));svg+='<line x1="'+xx+'" y1="18" x2="'+xx+'" y2="'+(height-35)+'" class="'+(t===1?'reference':'')+'" opacity="'+(t===1?1:.35)+'"></line><text x="'+xx+'" y="'+(height-12)+'" text-anchor="middle">'+t+'</text>';});
    c.included.forEach(function(s,i){
      const y=36+i*38,lo=x(s.log-1.96*s.se),hi=x(s.log+1.96*s.se),dot=x(s.log);
      svg+='<text x="8" y="'+(y+4)+'">'+esc(s.name)+'</text><line x1="'+lo+'" x2="'+hi+'" y1="'+y+'" y2="'+y+'" stroke="#5ce0d0" stroke-width="3"></line>'+
        '<line x1="'+lo+'" x2="'+lo+'" y1="'+(y-6)+'" y2="'+(y+6)+'" stroke="#5ce0d0"></line>'+
        '<line x1="'+hi+'" x2="'+hi+'" y1="'+(y-6)+'" y2="'+(y+6)+'" stroke="#5ce0d0"></line>'+
        '<rect x="'+(dot-5)+'" y="'+(y-5)+'" width="10" height="10" class="point"></rect>';
    });
    const y=36+c.included.length*38;
    svg+='<text x="8" y="'+(y+4)+'">Pooled</text><polygon class="diamond" points="'+x(Math.log(p.lower))+','+y+' '+x(p.log)+','+(y-9)+' '+x(Math.log(p.upper))+','+y+' '+x(p.log)+','+(y+9)+'"></polygon>';
    svg+='</svg>';
    return '<div class="figure">'+svg+'</div><div class="pool-result"><div><strong>'+pretty(p.rr)+'</strong><span>Pooled RR</span></div>'+
      '<div><strong>'+pretty(p.lower)+'–'+pretty(p.upper)+'</strong><span>95% CI</span></div>'+
      '<div><strong>'+Math.round(p.I2)+'%</strong><span>Descriptive I²</span></div></div>';
  }
  function bayesMath() {
    const priorVar=work.prior*work.prior,likelihoodVar=0.15*0.15,postVar=1/(1/priorVar+1/likelihoodVar);
    const mean=postVar*(-0.50/likelihoodVar);
    const se=Math.sqrt(postVar);
    return {mean:mean,se:se,lo:mean-1.96*se,hi:mean+1.96*se};
  }
  function bayesDisplay() {
    const p=bayesMath();
    return '<div class="bayes-result"><div><span>Posterior log RR</span><strong>'+p.mean.toFixed(3)+'</strong></div>'+
      '<div><span>Posterior RR</span><strong>'+Math.exp(p.mean).toFixed(3)+'</strong></div>'+
      '<div><span>95% posterior credible interval (RR)</span><strong>'+Math.exp(p.lo).toFixed(2)+'–'+Math.exp(p.hi).toFixed(2)+'</strong></div>'+
      '<div><span>Interval below RR = 1?</span><strong>'+(p.hi<0?'Yes':'No')+'</strong></div></div>';
  }
  function bayesActivity(t) {
    return '<h3 class="task-header">'+esc(t.prompt)+'</h3><div class="range-wrap"><label for="priorSlider">Prior standard deviation: <strong id="priorValue">'+work.prior.toFixed(2)+'</strong></label>'+
      '<input id="priorSlider" data-prior="true" type="range" min="0.10" max="1.00" step="0.05" value="'+work.prior+'" aria-label="Prior standard deviation">'+
      '<div class="range-labels"><span>Strongly sceptical</span><span>Weakly informative</span></div></div><div id="bayesViz">'+bayesDisplay()+'</div>'+
      '<h3 class="task-header">Which interpretation is defensible?</h3>'+choiceButtons(t.options,'answer')+checkAction();
  }
  function dossierActivity(t) {
    return '<h3 class="task-header">'+esc(t.prompt)+'</h3><div class="dossier-fields">'+t.fields.map(function(f){
      return '<div><label for="dossier-'+f[0]+'">'+esc(f[1])+'</label><p>'+esc(f[2])+'</p>'+
        '<textarea id="dossier-'+f[0]+'" class="dossier-input" data-note="'+f[0]+'" placeholder="Write a transparent decision or unresolved question…" rows="3">'+esc(work.notes[f[0]]||'')+'</textarea></div>';
    }).join('')+'</div><div class="checklist"><strong>Self-check before saving (not an automated scientific assessment)</strong>'+
      ['I have defined patient-important outcomes','I have distinguished registered decisions from future choices','I have named at least one possible source of bias or uncertainty','I will request independent peer critique'].map(function(x,i){
        return '<label><input type="checkbox" data-dossier-check="'+i+'" '+(work.checks[i]?'checked':'')+'>'+esc(x)+'</label>';
      }).join('')+'</div><div class="lab-actions"><button class="primary" data-action="save-dossier" type="button">Save my unreviewed draft</button>'+
      '<button class="secondary" data-action="export" type="button">Download portfolio</button><button class="secondary" data-action="hint" type="button">Reveal a clue</button></div>';
  }
  function decisionActivity(t) {
    const ix=Math.min(work.decisionStep,t.steps.length-1),step=t.steps[ix];
    return '<h3 class="task-header">Decision '+(ix+1)+' of '+t.steps.length+'</h3><div class="brief"><p>'+esc(step.question)+'</p></div>'+
      '<div class="choices">'+step.options.map(function(o,i){
        return '<button class="choice" type="button" data-action="decision" data-index="'+i+'"><span class="choice-icon">'+String.fromCharCode(65+i)+'</span><span>'+esc(o)+'</span></button>';
      }).join('')+'</div><p class="formula">After each correct decision you will see why it matters. You may retry without a timer.</p>';
  }
  function render() {
    const t=missions[current],done=recordFor(t.id).done;
    stage.innerHTML='<div class="mission-kicker"><span class="pill">MISSION '+String(t.id).padStart(2,'0')+' / 24</span>'+
      '<span class="pill">'+esc(labels[t.kind])+'</span></div>'+
      '<h2 id="challengeTitle" class="mission-title" tabindex="-1">'+esc(t.title)+'</h2>'+
      '<p class="mission-subtitle">'+esc(t.intro)+'</p>'+
      '<div class="mission-meta"><strong>'+esc(t.tag)+'</strong> &nbsp;·&nbsp; Difficulty '+t.level+'/3 &nbsp;·&nbsp; ~'+t.minutes+' minutes'+(done?' &nbsp;·&nbsp; ✓ Previously completed':'')+'</div>'+
      '<div class="brief"><strong>CASE FILE</strong><p>'+esc(t.brief)+'</p></div>'+activities(t)+
      '<div id="hintBox" class="hint" '+(work.hint?'':'hidden')+'><strong>Clue:</strong> '+esc(t.hint)+'</div>'+feedbackSlot()+
      '<p class="module-back"><a href="synthesis-course.html?module='+t.id+'">← Return to this course module</a> · '+
      '<button class="text-link" type="button" data-action="restart">Restart this mission</button></p>';
    if (t.kind==='dossier') saved.notes[String(t.id)]=Object.assign({},work.notes);
  }
  function same(a,b) {return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every(function(x,i){return x===b[i];});}
  function verify() {
    const t=missions[current];
    if (t.kind==='multi') {
      const selected=Array.from(work.selected).sort(function(a,b){return a-b;});
      if (same(selected,t.correct)) complete(t,t.explain);
      else tryAgain('This combination is not supported by the case file. Revisit what is evidence, what is an assumption and what must be checked.');
    } else if (t.kind==='match') {
      if (t.rows.every(function(r,i){return work.matches[i]===r[1];})) complete(t,t.explain);
      else tryAgain('One or more pairings need revision. Consider which concept the statement illustrates most directly.');
    } else if (t.kind==='order') {
      if (same(work.order,t.correct)) complete(t,t.explain);
      else tryAgain('This sequence risks making research decisions after the evidence has been seen. Reorder the steps.');
    } else if (t.kind==='number') {
      const right=t.fields.every(function(f){
        const x=Number(work.numbers[f[0]]);
        return work.numbers[f[0]]!==undefined && String(work.numbers[f[0]]).trim()!=='' && Number.isFinite(x) && Math.abs(x-f[2])<=f[3];
      });
      if (right) complete(t,t.explain);
      else tryAgain('At least one calculation is out of range or missing. Tip: '+t.fields.map(function(f){return f[1]+' = '+f[4];}).join('; ')+'.');
    } else if (t.kind==='pool') {
      if (!work.poolTouched) return tryAgain('Change at least one study selection first, so you can see how the summary reacts.');
      const goals=t.goal==='excludeC'? !work.pool.C && work.pool.A && work.pool.B && work.pool.D :
        poolTrials.every(function(s){return work.pool[s.id];});
      if (goals && work.answer===t.correct) complete(t,t.explain);
      else tryAgain(t.goal==='excludeC'?'Exclude only Trial C for the demonstration, then select the transparent reporting decision.':'After exploring a removal, restore all studies and select the transparent reporting decision.');
    } else if (t.kind==='bayes') {
      if (!work.priorMoved) return tryAgain('Move the prior slider and watch the posterior respond.');
      if (bayesMath().hi<0 && work.answer===t.correct) complete(t,t.explain);
      else tryAgain('Adjust the prior until the posterior credible interval excludes RR = 1, then choose the interpretation that acknowledges prior sensitivity.');
    }
  }
  function triageNext() {
    const t=missions[current];
    const phase=work.triagePhase;
    if (!t.records.every(function(r){return valid.includes(work.triage[phase][r[0]]);})) {
      tryAgain('Give a decision for all five records, using Unclear when the record is insufficient.');
      return;
    }
    if (phase<2) {
      work.triagePhase++;
      if (phase===1) work.triage[2]=Object.assign({},work.triage[0]);
      render();
      if (phase===0) $('challengeTitle').focus({preventScroll:true});
      return;
    }
    const wrong=t.records.filter(function(r){return work.triage[2][r[0]]!==r[2];});
    if (wrong.length) {
      const details=wrong.map(function(r){return r[0]+': '+r[2]+' — '+r[3];}).join(' ');
      tryAgain('Revisit the final consensus on '+wrong.length+' record(s). '+details);
      return;
    }
    const disagreements=t.records.filter(function(r){return work.triage[0][r[0]]!==work.triage[1][r[0]];}).length;
    complete(t,'Reconciled '+t.records.length+' records; '+disagreements+' initial disagreement(s). '+t.explain);
  }
  function saveDossier() {
    const t=missions[current];
    const short=t.fields.filter(function(f){return String(work.notes[f[0]]||'').trim().length<20;});
    const checks=[0,1,2,3].every(function(i){return work.checks[i];});
    if (short.length || !checks) {
      tryAgain('Complete each section with at least 20 characters and reflect on all four self-checks. This checks completeness, not scientific correctness.');
      return;
    }
    saved.notes[String(t.id)]=Object.assign({},work.notes);
    persist();complete(t,t.explain);
  }
  function deliverFile(filename,textContent,mime) {
    const blob = new Blob([textContent],{type:mime||'text/markdown;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  function dossierText() {
    const lines=['# Synthesis Mission Lab — learning dossier','','Generated: '+new Date().toISOString(),
      'All quantitative examples are fictional; not clinical advice. Course practice scores are not an accredited qualification.','','## Completed exercises',''];
    missions.forEach(function(t){
      const result=recordFor(t.id);
      lines.push('- Module '+t.id+' — '+t.title+': '+(result.done?('completed, best '+result.best+' points'+(result.selfAssessed?' (ungraded self-assessed draft)':'')):'not yet completed'));
    });
    lines.push('','## My mini-review blueprint','');
    const draft=saved.notes['23']||{};
    const portfolio=missions[23];
    portfolio.fields.forEach(function(f){lines.push('### '+f[1],String(draft[f[0]]||'_Not yet written_'),'');});
    lines.push('## Peer review','- What assumptions need independent verification?','- How might the result reverse if a missing study is retrieved?','- Which decisions changed from the protocol?','','_A completed mission is not evidence that the underlying clinical result is correct._');
    return lines.join('\n');
  }
  function exportDossier() {
    if (current===23) {
      saved.notes['23']=Object.assign({},work.notes);
      persist();
    }
    deliverFile('synthesis-learning-dossier.md',dossierText());
    notify('Dossier exported. Review it critically with a colleague.');
  }
  function notify(message) {
    const toast=$('toast');toast.textContent=message;toast.classList.add('visible');
    clearTimeout(toastTimer);toastTimer=setTimeout(function(){toast.classList.remove('visible');},3300);
  }
  const debates=[
    {title:'The invisible study',clue:'A completed trial is missing, and the pooled effect is impressive.',question:'What evidence would change your conclusion?'},
    {title:'The dramatic subgroup',clue:'A trial-level meta-regression finds a strong association with baseline disease severity.',question:'Can you infer an individual patient treatment interaction?'},
    {title:'The elegant ranking',clue:'An NMA ranks one drug first although its direct comparison is uncertain.',question:'What must be tested before ranking influences a guideline?'},
    {title:'The outlier',clue:'Removing one large study reverses the pooled effect.',question:'When is study exclusion defensible, and what must be reported?'},
    {title:'The AI screener',clue:'A machine rejects 20% of abstracts and the review finishes early.',question:'How do you audit false negatives and preserve reproducibility?'},
    {title:'The certainty gap',clue:'A relative-effect estimate is fairly precise but the outcome was a surrogate.',question:'How should certainty and clinical relevance be communicated?'}
  ];
  function renderTeam() {
    teamIndex=(teamIndex+1)%debates.length;
    const d=debates[teamIndex];
    $('teamPrompt').innerHTML='<strong>'+esc(d.title)+'</strong><p>'+esc(d.clue)+'</p><p><strong>🕵️ Skeptic:</strong> Identify the most important missing assumption.</p>'+
      '<p><strong>🧮 Methodologist:</strong> Propose an analysis or record check.</p><p><strong>🩺 Clinician:</strong> Explain how the limitation affects a patient-facing claim.</p>'+
      '<p><strong>Debate:</strong> '+esc(d.question)+'</p>';
  }
  function openTeam() {
    renderTeam();const dialog=$('teamDialog');
    if (typeof dialog.showModal==='function') dialog.showModal();else dialog.setAttribute('open','');
  }
  function closeTeam() {
    const dialog=$('teamDialog');if (typeof dialog.close==='function') dialog.close();else dialog.removeAttribute('open');
  }
  function decide(i) {
    const t=missions[current],step=t.steps[work.decisionStep];
    if (!step) return;
    if (i!==step.correct) return tryAgain('That decision could distort the evidence. '+step.why);
    if (work.decisionStep===t.steps.length-1) return complete(t,'All four editorial decisions passed. '+t.explain);
    work.decisionStep++;render();
    showFeedback(true,step.why,false);
  }
  stage.addEventListener('click',function(e){
    const b=e.target.closest('button[data-action]');
    if (!b || b.disabled) return;
    const t=missions[current],action=b.dataset.action,i=Number(b.dataset.index);
    if (action==='choose') {
      if (work.selected.has(i)) work.selected.delete(i);else work.selected.add(i);
      const on=work.selected.has(i);b.setAttribute('aria-pressed',String(on));b.querySelector('.choice-icon').textContent=on?'✓':String.fromCharCode(65+i);
    } else if (action==='answer') {
      work.answer=i;stage.querySelectorAll('button[data-action="answer"]').forEach(function(el){
        const on=Number(el.dataset.index)===i;el.setAttribute('aria-pressed',String(on));
        el.querySelector('.choice-icon').textContent=on?'✓':String.fromCharCode(65+Number(el.dataset.index));
      });
    } else if (action==='move') {
      const dir=Number(b.dataset.dir),j=i+dir;
      if (j>=0&&j<work.order.length){const temp=work.order[i];work.order[i]=work.order[j];work.order[j]=temp;render();
        const selector='button[data-action="move"][data-index="'+j+'"][data-dir="'+dir+'"]',newButton=stage.querySelector(selector);
        if(newButton&&!newButton.disabled)newButton.focus({preventScroll:true});
      }
    } else if(action==='hint') {
      work.hint=true;$('hintBox').hidden=false;$('hintBox').scrollIntoView({behavior:'smooth',block:'nearest'});
    } else if(action==='check') verify();
    else if(action==='triage-next') triageNext();
    else if(action==='save-dossier') saveDossier();
    else if(action==='export') exportDossier();
    else if(action==='decision') decide(i);
    else if(action==='restart') {work=mkWork(t);render();notify('Mission restarted. Saved best scores are preserved.');}
    else if(action==='next') chooseMission((current+1)%missions.length);
  });
  // Store short-lived exercise working state in memory. Portfolio text persists locally.
  stage.addEventListener('input',function(e){
    const el=e.target;
    if(el.hasAttribute('data-number')) work.numbers[el.dataset.number]=el.value;
    if(el.hasAttribute('data-note')) {
      work.notes[el.dataset.note]=el.value;
      saved.notes['23']=Object.assign({},work.notes);persist();
    }
    if(el.hasAttribute('data-prior')) {
      work.prior=Number(el.value);work.priorMoved=true;
      $('priorValue').textContent=work.prior.toFixed(2);
      $('bayesViz').innerHTML=bayesDisplay();
    }
  });
  stage.addEventListener('change',function(e){
    const el=e.target;
    if(el.hasAttribute('data-match'))work.matches[el.dataset.match]=el.value;
    if(el.hasAttribute('data-triage'))work.triage[work.triagePhase][el.dataset.triage]=el.value;
    if(el.hasAttribute('data-pool')) {
      work.pool[el.dataset.pool]=el.checked;work.poolTouched=true;
      $('poolViz').innerHTML=poolDisplay();
    }
    if(el.hasAttribute('data-dossier-check'))work.checks[Number(el.dataset.dossierCheck)]=el.checked;
  });
  let dragStart=-1;
  stage.addEventListener('dragstart',function(e){
    const row=e.target.closest('li[data-order]');
    if (!row) return;
    dragStart=Number(row.dataset.order);row.classList.add('dragging');
    if(e.dataTransfer){e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',String(dragStart));}
  });
  stage.addEventListener('dragover',function(e){if(e.target.closest('li[data-order]'))e.preventDefault();});
  stage.addEventListener('drop',function(e){
    const row=e.target.closest('li[data-order]');
    if (!row||dragStart<0)return;
    e.preventDefault();const end=Number(row.dataset.order);
    if(end!==dragStart){const moved=work.order.splice(dragStart,1)[0];work.order.splice(end,0,moved);render();}
    dragStart=-1;
  });
  stage.addEventListener('dragend',function(e){dragStart=-1;stage.querySelectorAll('.dragging').forEach(function(x){x.classList.remove('dragging');});});
  grid.addEventListener('click',function(e){
    const btn=e.target.closest('button[data-id]');
    if(btn)chooseMission(Number(btn.dataset.id));
  });
  search.addEventListener('input',refreshBoard);
  $('nextIncomplete').addEventListener('click',function(){
    const next=missions.find(function(t){return !recordFor(t.id).done;});
    chooseMission(next?next.id:0);
  });
  $('dailyCase').addEventListener('click',function(){
    const start=(new Date().getDate()+new Date().getMonth()*31+new Date().getFullYear())%missions.length;
    chooseMission(start===current?(start+1)%missions.length:start);
    notify('Mystery mission unlocked. Try it before opening its clue!');
  });
  $('teamCase').addEventListener('click',openTeam);
  $('anotherTeam').addEventListener('click',renderTeam);
  $('closeTeam').addEventListener('click',closeTeam);
  $('copyTeam').addEventListener('click',function(){
    const textContent=$('teamPrompt').innerText;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textContent).then(function(){notify('Group case copied.');}).catch(function(){notify('Copy unavailable; select the case text in the dialog.');});
    } else notify('Select the case text in the dialog to copy it.');
  });
  $('exportDossier').addEventListener('click',exportDossier);
  $('resetMissions').addEventListener('click',function(){
    if (!confirm('Remove mission scores AND your locally saved dossier text from this browser? This cannot be undone.')) return;
    saved={records:{},notes:{}};persist();chooseMission(0);refreshStats();notify('Local mission results reset.');
  });
  // Validate the core worked examples before showing them. Throw a visible error on regression.
  const sanity = (function(){
    const counts=(18/200)/(30/200);
    const i2=(12-3)/12*100;
    const diag=72/(72+18)*100;
    const testPool=computePoolForAll();
    return Math.abs(counts-0.6)<1e-12 && i2===75 && diag===80 &&
      testPool && testPool.rr>1 && testPool.rr<2;
  })();
  function computePoolForAll(){
    const p=work;
    work={pool:{A:true,B:true,C:true,D:true}};
    const rr=computePool().pooled.rr;
    work=p;
    return {rr:rr};
  }
  if(!sanity) {
    stage.innerHTML='<p role="alert">A numerical regression check failed. Exercises are temporarily unavailable; please report a bug.</p>';
  } else {
    const initial=Number(new URLSearchParams(location.search).get('module'));
    chooseMission(Number.isInteger(initial)&&initial>=0&&initial<25?initial:0, false);
    refreshStats();
  }
})();
