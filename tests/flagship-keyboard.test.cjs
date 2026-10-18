const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.join(__dirname,'..');
for(const lang of ['en','ar','de','es','fr','hi','it','ja','ko','pt','ru','zh'])test(`${lang}: keyboard, panels and focus contracts`,()=>{
 const source=fs.readFileSync(path.join(root,lang==='en'?'synthesis-course.html':`synthesis-course-${lang}.html`),'utf8');
 assert.doesNotMatch(source,/document.addEventListener\('keydown'/);
 const page=new JSDOM(source,{runScripts:'outside-only',url:'http://127.0.0.1:8000/'});
 const w=page.window,d=w.document;
 try{
  w.matchMedia=()=>({matches:false,addEventListener(){}});
  for(const name of ['toggleGlossary','toggleKeyboardHelp','toggleToolsPanel','toggleSection','toggleSidebar','closeDashboard','closeDailyReview']){
   const match=source.match(new RegExp('    function '+name+'\\([^]*?\\n    }'));
   assert.ok(match,name);w.eval(match[0]);
  }
  // Navigation counters isolate event routing, not scientific computations.
  w.eval(`var nextCalls=0,previousCalls=0,currentModule=0,modules=[{id:0},{id:7}];
   function nextSlide(){nextCalls++;} function prevSlide(){previousCalls++;}
   function goToModule(index){currentModule=index;}
   function setTier(tier){document.querySelectorAll('.tier-btn').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.tier===tier)));}`);
  for(const b of d.querySelectorAll('.tier-btn'))b.addEventListener('click',()=>w.setTier(b.dataset.tier));
  w.eval(fs.readFileSync(path.join(root,'flagship-accessibility.js'),'utf8'));
  // Translation must not turn source comments into anonymous flex items or speech.
  for(const shell of d.querySelectorAll('body,.course-container,.main-content,.content-body,.slides-container,.sidebar,.content-header')){
   assert.equal([...shell.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()),false,'Unwrapped source comment in '+shell.className);
  }
  for(const dl of d.querySelectorAll('#glossaryContent dl'))assert.equal([...dl.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()),false);
  assert.equal(d.getElementById('glossaryContent').tabIndex,0);
  const key=(target,value,extra={})=>target.dispatchEvent(new w.KeyboardEvent('keydown',{key:value,bubbles:true,cancelable:true,...extra}));
  const main=d.getElementById('main-content');
  key(d.getElementById('picoP'),' ');key(d.getElementById('picoP'),'ArrowRight');key(d.getElementById('nextBtn'),' ');
  assert.equal(w.nextCalls,0);
  main.focus();key(main,'ArrowRight');assert.equal(w.nextCalls,1);
  key(main,'ArrowRight',{ctrlKey:true});assert.equal(w.nextCalls,1);
  key(main,'n');assert.equal(w.currentModule,7);key(main,'p');assert.equal(w.currentModule,0);
  key(d.body,'g');assert.equal(d.getElementById('glossaryPanel').hidden,true);
  const header=d.querySelector('.tool-section-header');let activated=0;
  header.addEventListener('click',()=>activated++);header.focus();key(header,'Enter');key(header,' ');
  assert.equal(activated,2);assert.equal(header.getAttribute('role'),'button');
  assert.ok(d.getElementById(header.getAttribute('aria-controls')));
  const radio=d.querySelector('.tier-btn');radio.focus();key(radio,'ArrowRight');
  assert.equal(d.activeElement.dataset.tier,'researcher');
  assert.equal(d.querySelectorAll('.tier-btn[tabindex="0"]').length,1);
  const trigger=d.querySelector('.glossary-btn');trigger.focus();w.toggleGlossary();
  assert.equal(d.getElementById('glossaryPanel').hidden,false);
  assert.equal(d.activeElement.id,'glossarySearch');
  assert.equal(trigger.closest('[inert]')!==null || trigger.inert,true);
  key(d.activeElement,'Escape');
  assert.equal(d.getElementById('glossaryPanel').hidden,true);assert.equal(d.activeElement,trigger);
  assert.equal(trigger.getAttribute('aria-expanded'),'false');
  assert.equal(d.querySelectorAll('.quiz-option[role="button"][tabindex="0"]').length,260);
 }finally{w.close();}
});
