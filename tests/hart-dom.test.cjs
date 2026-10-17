const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const base=path.resolve(__dirname,'..');
const source=file=>fs.readFileSync(path.join(base,file),'utf8');
const values={scope:'1',rate:'1',calculation:'0.46',population:'1',influence:'0',heterogeneity:'1',interpret:'0'};

function openLesson(){
 const page=new JSDOM(source('hart-transfer.html'),{
  url:'https://example.test/hart-transfer.html',runScripts:'outside-only',pretendToBeVisual:true
 });
 page.window.eval(source('hart-transfer-core.js'));
 page.window.eval(source('hart-transfer.js'));
 return page;
}
function complete(w,answers=values){
 const doc=w.document;
 for(const [id,value] of Object.entries(answers)){
  if(id==='calculation')doc.getElementById('response-calculation').value=value;
  else {
   const option=doc.querySelector('input[name="'+id+'"][value="'+value+'"]');
   assert.ok(option,'Missing response '+id);
   option.checked=true;
  }
 }
}
function submit(w){
 const form=w.document.getElementById('transferForm');
 form.dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));
}
test('Hart lesson renders six cited trials, all seven source-linked decisions and bilingual-claim boundaries',()=>{
 const page=openLesson(),d=page.window.document;
 assert.equal(d.querySelectorAll('#sourceRows tr').length,6);
 assert.equal(d.querySelectorAll('#tasks fieldset').length,7);
 assert.equal(d.querySelectorAll('input[type=number]').length,1);
 assert.equal(d.getElementById('feedback').hidden,true,'Answer key hidden before submission');
 assert.match(d.body.textContent,/English-only provisional/i);
 assert.match(d.body.textContent,/not an independently blinded/i);
 assert.ok([...d.querySelectorAll('a[href]')].some(a=>a.href==='https://mahmood726-cyber.github.io/allmeta/'));
 assert.match(d.getElementById('sourceRows').textContent,/AFASAK/);
 assert.match(d.getElementById('sourceRows').textContent,/EAFT/);
 page.window.close();
});
test('incomplete submissions fail closed; a first complete attempt reveals and locks source-based feedback',()=>{
 const page=openLesson(),w=page.window,d=w.document;
 submit(w);
 assert.equal(d.getElementById('feedback').hidden,true);
 assert.match(d.getElementById('formStatus').textContent,/Complete all seven/);
 complete(w);
 submit(w);
 assert.equal(d.getElementById('feedback').hidden,false);
 assert.match(d.getElementById('score').textContent,/7 of 7/);
 assert.equal(d.querySelectorAll('#feedbackItems section').length,7);
 assert.equal(d.querySelectorAll('#transferForm input:not(:disabled)').length,0);
 assert.equal(d.getElementById('submitAnswers').disabled,true);
 assert.equal(d.activeElement.id,'feedbackTitle','Move keyboard focus to worked explanation');
 const previous=d.getElementById('score').textContent;
 d.getElementById('response-calculation').value='0.95';
 submit(w);
 assert.equal(d.getElementById('score').textContent,previous,'An attempted resubmission must not alter first-attempt score');
 page.window.close();
});
test('incorrect method selection receives specific explanation without claiming a validated exam',()=>{
 const page=openLesson(),w=page.window,d=w.document;
 complete(w,{...values,rate:'0'});
 submit(w);
 assert.match(d.getElementById('score').textContent,/6 of 7/);
 assert.equal(d.querySelectorAll('#feedbackItems .incorrect').length,1);
 assert.match(d.querySelector('#feedbackItems .incorrect').textContent,/person.year denominators/i);
 assert.match(d.getElementById('score').textContent,/not a validated competence grade/i);
 page.window.close();
});
