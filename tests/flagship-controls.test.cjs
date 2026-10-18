// DOM interaction tests with actual course functions. The two-row story fixture
// exercises UI creation/removal only; it is synthetic, not clinical evidence.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const labels=require('./fixtures/control-labels.json');
const root=path.join(__dirname,'..');
const actions=['toggleGlossary()','closeDashboard()','closeDailyReview()','toggleToolsPanel()','removeStudyRow(this)'];
function actualFunction(source,name){
 const match=source.match(new RegExp('    function '+name+'\\([^]*?\\n    }'));
 assert.ok(match,'missing source function '+name);
 return match[0];
}
for(const [lang,text] of Object.entries(labels)){
 test(`${lang}: named controls, localized navigation, dynamic rows and close actions`,()=>{
  const file=lang==='en'?'synthesis-course.html':`synthesis-course-${lang}.html`;
  const source=fs.readFileSync(path.join(root,file),'utf8');
  const page=new JSDOM(source,{runScripts:'outside-only',url:'http://127.0.0.1:8000/'+file});
  try {
   const w=page.window,d=w.document;
   assert.equal(d.documentElement.lang,lang);
   if(lang==='ar')assert.equal(d.documentElement.dir,'rtl');
   const icons=[...d.querySelectorAll('button')].filter(b=>b.textContent.trim()==='×');
   assert.equal(icons.length,7);
   for(const button of icons){
    const index=actions.indexOf(button.getAttribute('onclick'));
    assert.ok(index>=0);
    assert.equal(button.getAttribute('aria-label'),text[index]);
   }
   for(const [i,id] of ['prevBtn','nextBtn'].entries()){
    const button=d.getElementById(id);
    assert.equal(button.getAttribute('aria-label'),text[5+i]);
    assert.equal(button.title,`${text[5+i]} (${i===0?'←':'→'})`);
    assert.equal(button.getAttribute('onclick'),i===0?'prevSlide()':'nextSlide()');
    if(lang!=='en')assert.doesNotMatch(button.title,/Previous|Next/);
   }
   // Compile every real inline script, including the two edited template literals.
   for(const script of d.querySelectorAll('script:not([src])'))new vm.Script(script.textContent,{filename:file});
   for(const name of ['addStudyRow','removeStudyRow','loadStoryIntoCalculator','closeDashboard','closeDailyReview','toggleToolsPanel','toggleGlossary']){
    w.eval(actualFunction(source,name));
   }
   function activate(button){
    // Outside-only mode intentionally disables automatic inline handlers.
    button.addEventListener('click',()=>w.Function(button.getAttribute('onclick')).call(button),{once:true});
    button.click();
   }
   const tbody=d.getElementById('studyTableBody');
   const originalFirst=tbody.rows[0];
   w.addStudyRow();
   assert.equal(tbody.rows.length,4);
   const added=tbody.rows[3].querySelector('button');
   assert.equal(added.getAttribute('aria-label'),text[4]);
   activate(added);
   assert.equal(tbody.rows.length,3);
   assert.equal(tbody.rows[0],originalFirst);
   w.eval(`var currentModule=0,currentStoryView='before',analysisCalls=0;
    var syntheticUIRows=[{name:'UI fixture A (synthetic)',effect:1,lo:0.8,hi:1.2},{name:'UI fixture B (synthetic)',effect:1,lo:0.8,hi:1.2}];
    var storyData={0:{before:{studies:syntheticUIRows},after:{studies:syntheticUIRows}}};
    function runMetaAnalysis(){analysisCalls++;}
    var reviewState={active:true,timerInterval:null};`);
   for(const mode of ['before','after']){
    w.currentStoryView=mode;
    w.loadStoryIntoCalculator();
    assert.equal(tbody.rows.length,2);
    for(const b of tbody.querySelectorAll('button'))assert.equal(b.getAttribute('aria-label'),text[4]);
    activate(tbody.rows[0].querySelector('button'));
    assert.equal(tbody.rows.length,1);
    assert.equal(tbody.rows[0].querySelector('input').value,'UI fixture B (synthetic)');
   }
   assert.equal(w.analysisCalls,2);
   for(const [selector,id,cls] of [['.dashboard-close','progressDashboard','open'],['.daily-review-close','dailyReviewModal','open'],['.glossary-close','glossaryPanel','open']]){
    d.getElementById(id).classList.add(cls);
    activate(d.querySelector(selector));
    assert.equal(d.getElementById(id).classList.contains(cls),false);
   }
   assert.equal(w.reviewState.active,false);
   d.getElementById('toolsPanel').classList.add('visible');
   d.querySelector('.content-body').classList.add('tools-open');
   activate(d.querySelector('.tools-header button'));
   assert.equal(d.getElementById('toolsPanel').classList.contains('visible'),false);
   assert.equal(d.querySelector('.content-body').classList.contains('tools-open'),false);
  } finally {page.window.close();}
 });
}
