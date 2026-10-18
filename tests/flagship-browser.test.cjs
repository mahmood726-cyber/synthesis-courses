// Real Chromium interactions against the exact checked-out source, with no CDN dependency.
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
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
