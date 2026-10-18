const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.join(__dirname,'..');
const langs=['en','ar','de','es','fr','hi','it','ja','ko','pt','ru','zh'];
function actual(source,name){
 const match=source.match(new RegExp('    function '+name+'\\([^]*?\\n    }'));
 assert.ok(match,name); return match[0];
}
for(const lang of langs)test(`${lang}: visible labels and dynamically generated form names`,async()=>{
 const file=lang==='en'?'synthesis-course.html':`synthesis-course-${lang}.html`;
 const source=fs.readFileSync(path.join(root,file),'utf8');
 const dom=new JSDOM(source,{runScripts:'outside-only',url:'http://127.0.0.1:8000/'+file});
 const w=dom.window,d=w.document;
 try{
  w.eval(fs.readFileSync(path.join(root,'flagship-form-labels.js'),'utf8'));
  for(const input of d.querySelectorAll('input,select,textarea')){
   if([...input.labels].some(label=>label.htmlFor===input.id && input.id))assert.equal(input.hasAttribute('aria-label'),false,input.id);
  }
  for(const suffix of ['Tx','Ctrl'])for(const prefix of ['events','n']){
   const input=d.getElementById(prefix+suffix);
   assert.ok(input.getAttribute('aria-label').includes(input.closest('.form-group').querySelector('label').textContent));
  }
  for(const name of ['addStudyRow','removeStudyRow','loadStoryIntoCalculator','initCERQualTool','addConfidenceToPredict'])w.eval(actual(source,name));
  w.eval(`var currentModule=0,currentStoryView='before';
   var storyData={0:{before:{studies:[{name:'Synthetic UI row',effect:1,lo:0.8,hi:1.2}]}}};
   function runMetaAnalysis(){}; function updateCERQual(){}`);
  const body=d.getElementById('studyTableBody');
  const flush=()=>Promise.resolve();
  async function checkRows(expected){
   await flush(); assert.equal(body.rows.length,expected);
   const names=[...body.querySelectorAll('input')].map(i=>i.getAttribute('aria-label'));
   assert.ok(names.every(Boolean)); assert.equal(new Set(names).size,names.length);
  }
  await checkRows(3);
  w.addStudyRow(); await checkRows(4);
  w.removeStudyRow(body.rows[0].querySelector('button')); await checkRows(3);
  w.loadStoryIntoCalculator(); await checkRows(1);
  assert.equal(body.rows[0].querySelector('input').value,'Synthetic UI row');
  // The legacy CERQual renderer is currently dormant; exercise its real template
  // in an explicit UI fixture without presenting this as a live lesson tool.
  const cerqual=d.createElement('div');cerqual.id='cerqualTool';d.body.append(cerqual);
  w.initCERQualTool();
  for(const select of d.querySelectorAll('#cerqualTool select')){
   assert.equal(select.labels.length,1);
   assert.ok(select.labels[0].textContent.trim());
   assert.ok(d.getElementById(select.getAttribute('aria-describedby')).textContent.trim());
  }
  assert.equal(d.querySelectorAll('#cerqualTool select').length,4);
  for(const id of ['confidence-fixture-a','confidence-fixture-b']){
   const host=d.createElement('div');host.id=id;d.body.append(host);
   w.addConfidenceToPredict(id);w.addConfidenceToPredict(id);
   const slider=host.querySelector('input');
   assert.equal(host.querySelectorAll('input').length,1);
   assert.equal(slider.labels.length,1);assert.ok(slider.labels[0].textContent.trim());
  }
  const ids=[...d.querySelectorAll('[id]')].map(e=>e.id);
  assert.equal(new Set(ids).size,ids.length);
 }finally{w.close();}
});
