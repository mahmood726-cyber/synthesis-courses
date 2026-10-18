// Real Chromium interactions against the exact checked-out source, with no CDN dependency.
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
let browser,server;
before(async()=>{
 server=spawn(process.env.PYTHON || 'python3',['-m','http.server','8000','--bind','127.0.0.1'],{stdio:'ignore'});
 for(let i=0;i<40;i++){
  try{if((await fetch('http://127.0.0.1:8000/synthesis-course.html')).ok)break;}catch{}
  if(i===39)throw new Error('Local test server did not start');
  await new Promise(r=>setTimeout(r,100));
 }
 browser=await chromium.launch();
});
after(async()=>{if(browser)await browser.close();if(server)server.kill();});
for(const lang of ['en','ar','de','es','fr','hi','it','ja','ko','pt','ru','zh']){
 test(`${lang}: browser study-row interaction and names`,{timeout:60000},async()=>{
  const context=await browser.newContext();
  try{
   const page=await context.newPage();
   await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:8000/')?route.continue():route.abort());
   const file=lang==='en'?'synthesis-course.html':`synthesis-course-${lang}.html`;
   await page.goto('http://127.0.0.1:8000/'+file);
   await page.locator('#moduleList .module-item').first().waitFor();
   await page.locator('[onclick="toggleToolsPanel()"]').first().click();
   const table=page.locator('#studyTable');
   if(!await table.isVisible())await page.locator('.tool-section').filter({has:table}).locator('.tool-section-header').click();
   const before=await table.locator('tbody tr').count();
   await page.locator('[onclick="addStudyRow()"]').click();
   assert.equal(await table.locator('tbody tr').count(),before+1);
   const inputs=table.locator('tbody input');
   const names=await inputs.evaluateAll(elements=>elements.map(e=>e.getAttribute('aria-label')));
   assert.ok(names.every(Boolean)); assert.equal(new Set(names).size,names.length);
   const added=table.locator('tbody tr').last();
   await added.locator('input').first().fill('Synthetic browser UI row');
   await added.locator('button').click();
   assert.equal(await table.locator('tbody tr').count(),before);
   // The PICO visible label, not an example population, must name the input.
   const pico=page.locator('#picoP');
   assert.equal(await pico.getAttribute('aria-label'),null);
   assert.ok(await pico.evaluate(e=>e.labels[0].textContent.trim()));
  }finally{await context.close();}
 });
}
for(const lang of ['en','ar','de','es','fr','hi','it','ja','ko','pt','ru','zh']){
 test(`${lang}: keyboard, focus, mobile menu and axe checks`,{timeout:120000},async()=>{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  try{
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',error=>{errors.push(error.message);console.log('runtime-error',lang,error.message);});
   await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:8000/')?route.continue():route.abort());
   const file=lang==='en'?'synthesis-course.html':`synthesis-course-${lang}.html`;
   await page.goto('http://127.0.0.1:8000/'+file);
   await page.locator('#moduleList .module-item').first().waitFor();
   const findings=[];
   const interactionFailures=[];
   async function focused(locator,description){
    if(!await locator.evaluate(e=>e===document.activeElement))interactionFailures.push({description,active:await page.evaluate(()=>document.activeElement.outerHTML.slice(0,600)),target:await locator.evaluate(e=>({html:e.outerHTML.slice(0,500),inert:!!e.closest('[inert]'),display:getComputedStyle(e).display,visibility:getComputedStyle(e).visibility}))});
   }
   async function audit(state){
    // Keep scanner instrumentation out of the keyboard/focus interaction page.
    const scanContext=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    let results;
    try{
     const scan=await scanContext.newPage();
     await scan.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:8000/')?route.continue():route.abort());
     await scan.goto('http://127.0.0.1:8000/'+file);
     await scan.locator('.module-item').first().waitFor();
     if(state==='tools'){
      await scan.locator('.module-item[data-module="1"]').click();
      await scan.locator('[onclick="toggleToolsPanel()"]').first().click();
      await scan.locator('.tool-section').filter({has:scan.locator('#picoP')}).locator('.tool-section-header').click();
     }else if(state==='glossary'){
      await scan.locator('.glossary-btn').click();await scan.locator('#glossarySearch').fill('meta');
     }else{
      await scan.locator('.tier-btn[data-tier="methodologist"]').click();
      const quiz=await scan.locator('.module-slides').evaluateAll(modules=>{for(const module of modules){const index=[...module.querySelectorAll('.slide')].findIndex(s=>s.querySelector('.quiz-option'));if(index>=0)return {module:module.dataset.module,index};}});
      await scan.locator(`.module-item[data-module="${quiz.module}"]`).click();
      await scan.locator('#progress .progress-dot').nth(quiz.index).click();
      await scan.locator('.module-slides.active .slide.active .quiz-option').first().click();
      if(state==='mobile')await scan.setViewportSize({width:390,height:844});
     }
     await scan.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
     results=await scan.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
    }finally{await scanContext.close();}
    findings.push({state,violations:results.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
    fs.mkdirSync('browser-a11y-results',{recursive:true});
    fs.writeFileSync(path.join('browser-a11y-results',`${lang}.json`),JSON.stringify({lang,findings,errors,interactionFailures},null,2));
    console.log('axe-summary',lang,state,JSON.stringify(findings.at(-1)));
   }
   const activeSlide=()=>page.locator('#progress .progress-dot').evaluateAll(items=>items.findIndex(e=>e.classList.contains('active')));
   await page.locator('[data-module="0"].module-item').press('Enter');
   assert.equal(await activeSlide(),0);
   await page.locator('#nextBtn').press('Space');assert.equal(await activeSlide(),1);
   await page.locator('#prevBtn').press('Space');assert.equal(await activeSlide(),0);
   await page.locator('#progress .progress-dot').nth(1).press('Enter');assert.equal(await activeSlide(),1);
   assert.equal(await page.locator('#progress .progress-dot.active').evaluate(e=>e===document.activeElement),true);
   await page.locator('.module-item[data-module="1"]').press('Space');
   assert.equal(await page.locator('.module-item[aria-current="step"]').getAttribute('data-module'),'1');
   await page.locator('.tier-btn[data-tier="foundation"]').press('ArrowRight');
   assert.equal(await page.locator('.tier-btn[aria-checked="true"]').getAttribute('data-tier'),'researcher');
   assert.equal(await page.locator('.tier-btn[tabindex="0"]').count(),1);
   await page.locator('[onclick="toggleToolsPanel()"]').first().click();
   const picoSection=page.locator('.tool-section').filter({has:page.locator('#picoP')});
   if(!await page.locator('#picoP').isVisible())await picoSection.locator('.tool-section-header').press('Enter');
   const slideBeforeTyping=await activeSlide();
   await page.locator('#picoP').fill('Synthetic population');
   await page.locator('#picoP').press('End');await page.locator('#picoP').press('Space');
   await page.locator('#picoP').press('ArrowLeft');
   assert.equal(await page.locator('#picoP').inputValue(),'Synthetic population ');
   assert.equal(await activeSlide(),slideBeforeTyping);
   const check=page.locator('#useHKSJ');
   if(await check.isVisible()){
    const checked=await check.isChecked();await check.press('Space');assert.equal(await check.isChecked(),!checked);
   }
   await audit('tools');
   await page.locator('#picoP').press('Escape');
   assert.equal(await page.locator('#toolsPanel').isVisible(),false);
   const glossary=page.locator('.glossary-btn');
   await page.evaluate(()=>{
    window.a11yTrace=[];
    document.addEventListener('keydown',e=>window.a11yTrace.push({key:e.key,phase:'capture',target:e.target.id||e.target.className,prevented:e.defaultPrevented,composing:e.isComposing,ctrl:e.ctrlKey,alt:e.altKey,meta:e.metaKey}),true);
    for(const name of ['toggleGlossary','checkQuizAnswer']){
     const original=window[name];window[name]=function(...args){window.a11yTrace.push({call:name,args});const result=original.apply(this,args);window.a11yTrace.push({after:name,glossary:document.getElementById('glossaryPanel').className});return result;};
    }
   });
   await glossary.click();
   assert.equal(await page.evaluate(()=>document.activeElement.id),'glossarySearch');
   await page.locator('#glossarySearch').fill('meta');
   const glossaryStops=page.locator('#glossaryPanel').locator('button,input,a[href],[tabindex="0"]').filter({visible:true});
   await glossaryStops.last().press('Tab');
   await focused(glossaryStops.first(),'forward glossary focus cycle');
   await glossaryStops.first().press('Shift+Tab');
   await focused(glossaryStops.last(),'backward glossary focus cycle');
   await audit('glossary');
   await page.locator('#glossarySearch').press('Escape');
   await focused(glossary,'glossary focus return');
   console.log('escape-trace',lang,JSON.stringify(await page.evaluate(()=>({trace:window.a11yTrace,active:document.activeElement.outerHTML.slice(0,300),inert:[...document.querySelectorAll('[inert]')].map(e=>e.id||e.className)}))));
   if(await page.locator('#glossaryPanel').isVisible()){
    interactionFailures.push({description:'Escape did not dismiss glossary'});
    // Continue collecting other states while retaining this failure in the final assertion.
    await page.locator('.glossary-close').click();
   }
   await page.locator('.keyboard-help-trigger').click();
   await page.locator('#keyboardHelp').press('Escape');
   assert.equal(await page.locator('.keyboard-help-trigger').evaluate(e=>e===document.activeElement),true);
   const dashboard=page.locator('[onclick="openDashboard()"]');
   await dashboard.click();await page.locator('.dashboard-close').press('Escape');
   assert.equal(await dashboard.evaluate(e=>e===document.activeElement),true);
   await page.locator('.tier-btn[data-tier="methodologist"]').click();
   const quiz=await page.locator('.module-slides').evaluateAll(modules=>{
    for(const module of modules){const slides=[...module.querySelectorAll('.slide')];const index=slides.findIndex(s=>s.querySelector('.quiz-option'));
     if(index>=0)return {module:module.dataset.module,index};}
   });
   assert.ok(quiz);
   await page.locator(`.module-item[data-module="${quiz.module}"]`).click();
   await page.locator('#progress .progress-dot').nth(quiz.index).press('Enter');
   const option=page.locator('.module-slides.active .slide.active .quiz-option').first();
   await option.press('Enter');
   console.log('quiz-trace',lang,JSON.stringify(await option.evaluate(e=>({trace:window.a11yTrace,active:document.activeElement.outerHTML.slice(0,300),inert:!!e.closest('[inert]'),option:e.outerHTML.slice(0,700)}))));
   if(await option.getAttribute('aria-disabled')!=='true')interactionFailures.push({description:'Keyboard quiz activation did not mark options disabled'});
   await audit('quiz');
   await page.setViewportSize({width:390,height:844});
   await page.waitForFunction(()=>document.querySelector('.sidebar').hasAttribute('inert'));
   assert.equal(await page.locator('.sidebar').getAttribute('inert'),'');
   await page.locator('.mobile-menu-btn').press('Enter');
   assert.equal(await page.locator('.mobile-menu-btn').getAttribute('aria-expanded'),'true');
   await page.locator('.sidebar a').first().press('Escape');
   assert.equal(await page.locator('.mobile-menu-btn').evaluate(e=>e===document.activeElement),true);
   assert.equal(await page.locator('.mobile-menu-btn').getAttribute('aria-expanded'),'false');
   await audit('mobile');
   fs.mkdirSync('browser-a11y-results',{recursive:true});
   fs.writeFileSync(path.join('browser-a11y-results',`${lang}.json`),JSON.stringify({lang,findings,errors,interactionFailures},null,2));
   const violations=findings.flatMap(f=>f.violations.map(v=>({state:f.state,...v,nodes:v.nodes.slice(0,8)})));
   assert.deepEqual({errors,interactionFailures,violations},{errors:[],interactionFailures:[],violations:[]},JSON.stringify({errors,interactionFailures,violations}));
  }finally{await context.close();}
 });
}
