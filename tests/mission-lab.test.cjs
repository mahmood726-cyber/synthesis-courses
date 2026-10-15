/* Run with: npm install --no-save jsdom@26.1.0 && node --test tests/mission-lab.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const {test} = require('node:test');
const {JSDOM} = require('jsdom');
const root=path.join(__dirname,'..');
const read=(f)=>fs.readFileSync(path.join(root,f),'utf8');
const html=read('mission-lab.html'),data=read('mission-lab-data.js'),engine=read('mission-lab.js');

function mount() {
  const dom=new JSDOM(html,{runScripts:'outside-only',url:'https://example.test/mission-lab.html',pretendToBeVisual:true});
  dom.window.Element.prototype.scrollIntoView=function(){};
  dom.window.confirm=()=>true;
  dom.window.eval(data);
  dom.window.eval(engine);
  return dom;
}
function action(doc,what){const button=doc.querySelector('[data-action="'+what+'"]');assert.ok(button,'No '+what+' button');button.click();}
function go(doc,id){const button=doc.querySelector('.mission-tile[data-id="'+id+'"]');assert.ok(button);button.click();}
function pick(doc,indices,which='choose') {
  for(const i of indices){const b=doc.querySelector('button[data-action="'+which+'"][data-index="'+i+'"]');assert.ok(b,'Missing option '+i);b.click();}
}
function change(window,el,value,type='change'){
  el.value=value;el.dispatchEvent(new window.Event(type,{bubbles:true}));
}

test('course data and scripts parse with 25 well-formed independent missions',()=>{
  new vm.Script(data);new vm.Script(engine);
  const c={window:{}};vm.runInNewContext(data,c);
  const tasks=c.window.SYNTHESIS_MISSIONS;
  assert.equal(tasks.length,25);
  assert.deepEqual(Array.from(tasks,x=>x.id),Array.from({length:25},(_,i)=>i));
  assert.equal(new Set(tasks.map(x=>x.title)).size,25);
  assert.ok(new Set(tasks.map(x=>x.kind)).size>=8);
  for(const task of tasks){
    assert.ok(task.title&&task.prompt&&task.hint&&task.explain);
    assert.ok(task.minutes>0 && task.level>=1 && task.level<=3);
    if(task.kind==='multi'){assert.ok(task.correct.every(i=>i>=0&&i<task.options.length));}
    if(task.kind==='match'){assert.ok(task.rows.every(x=>task.categories.includes(x[1])));}
    if(task.kind==='order'){assert.deepEqual(new Set(task.items.map(x=>x[0])),new Set(task.correct));}
    if(task.kind==='number'){assert.ok(task.fields.every(x=>x[3]>0));}
    if(task.kind==='decision'){assert.ok(task.steps.every(s=>s.correct>=0 && s.correct<s.options.length));}
  }
  assert.ok(html.indexOf('mission-lab-data.js')<html.indexOf('mission-lab.js'));
  assert.ok(read('index.html').includes('href="mission-lab.html"'));
  assert.ok(read('synthesis-course.html').includes('id="missionLabLink"'));
});

test('navigation, selection and feedback affect actual progress',()=>{
  const dom=mount(),w=dom.window,d=w.document;
  assert.equal(d.querySelectorAll('.mission-tile').length,25);
  assert.equal(d.getElementById('doneCount').textContent,'0');
  pick(d,[1,2,4]);action(d,'check');
  assert.equal(d.getElementById('doneCount').textContent,'1');
  assert.match(d.getElementById('feedback').textContent,/Mission logged/);
  go(d,5);
  for(const [name,value] of [['rr','.60'],['arr','.06'],['nnt','17']]){
    change(w,d.getElementById('number-'+name),value,'input');
  }
  action(d,'check');assert.equal(d.getElementById('doneCount').textContent,'2');
  assert.ok(w.localStorage.getItem('synthesis_mission_lab_v1').includes('"done":true'));
  go(d,0);assert.match(d.getElementById('missionStage').textContent,/Previously completed/);
  dom.window.close();
});

test('live forest plot and Bayesian slider recalculate on interaction',()=>{
  const dom=mount(),w=dom.window,d=w.document;
  go(d,7);
  const before=d.getElementById('poolViz').textContent;
  const checkbox=d.querySelector('[data-pool="C"]');
  checkbox.checked=false;checkbox.dispatchEvent(new w.Event('change',{bubbles:true}));
  const after=d.getElementById('poolViz').textContent;
  assert.notEqual(after,before);
  pick(d,[1],'answer');action(d,'check');
  assert.match(d.getElementById('feedback').textContent,/Mission logged/);
  go(d,13);
  const slider=d.getElementById('priorSlider');
  change(w,slider,'0.30','input');
  assert.match(d.getElementById('bayesViz').textContent,/Yes/);
  pick(d,[1],'answer');action(d,'check');
  assert.match(d.getElementById('feedback').textContent,/Mission logged/);
  dom.window.close();
});

test('two-reviewer flow requires independent passes and a defensible adjudication',()=>{
  const dom=mount(),w=dom.window,d=w.document;
  go(d,4);
  const gold=['Include','Exclude','Exclude','Include','Unclear'];
  const setRound=()=>['A','B','C','D','E'].forEach((id,i)=>change(w,d.getElementById('triage-'+id),gold[i]));
  setRound();action(d,'triage-next');
  assert.match(d.getElementById('missionStage').textContent,/Reviewer B/);
  setRound();action(d,'triage-next');
  assert.match(d.getElementById('missionStage').textContent,/Adjudication/);
  action(d,'triage-next');
  assert.match(d.getElementById('feedback').textContent,/Mission logged/);
  dom.window.close();
});

test('dossier marks self-assessment, exports notes locally and final decisions are gated',()=>{
  const dom=mount(),w=dom.window,d=w.document;
  go(d,23);
  d.querySelectorAll('[data-note]').forEach((el,i)=>change(w,el,'My explicit prespecified decision and limitation number '+i,'input'));
  d.querySelectorAll('[data-dossier-check]').forEach(el=>{el.checked=true;el.dispatchEvent(new w.Event('change',{bubbles:true}));});
  action(d,'save-dossier');
  assert.match(d.getElementById('feedback').textContent,/Draft saved/);
  const saved=JSON.parse(w.localStorage.getItem('synthesis_mission_lab_v1'));
  assert.equal(saved.records['23'].selfAssessed,true);
  go(d,24);
  for(const i of [1,1,1,0]){
    pick(d,[i],'decision');
  }
  assert.match(d.getElementById('feedback').textContent,/Mission logged/);
  assert.equal(d.getElementById('doneCount').textContent,'2');
  dom.window.close();
});

test('return links preserve exact module and progress is not lost by page navigation',()=>{
  const dom=mount(),w=dom.window,d=w.document;
  go(d,12);
  const link=d.querySelector('.module-back a');
  assert.ok(link.getAttribute('href').endsWith('?module=12'));
  const progressBefore=w.localStorage.length;
  go(d,2);
  assert.ok(w.localStorage.length>=progressBefore);
  dom.window.close();
});
