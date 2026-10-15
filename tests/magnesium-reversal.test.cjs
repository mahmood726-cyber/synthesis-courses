const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const load=name=>fs.readFileSync(path.join(root,name),'utf8');
const api=require('../magnesium-reversal-data.js');
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol, String(a)+' differs from '+String(b));

test('six selected archival R rows match metadat::dat.egger2001 exactly',()=>{
 const t=api.trials;
 assert.deepEqual(t.map(x=>x.id),[1,2,3,6,14,16]);
 assert.deepEqual(t.map(x=>x.a),[1,9,2,1,90,2216]);
 assert.deepEqual(t.map(x=>x.n1),[40,135,200,59,1159,29011]);
 assert.deepEqual(t.map(x=>x.c),[2,23,7,9,118,2103]);
 assert.deepEqual(t.map(x=>x.n2),[36,135,200,56,1157,29039]);
});
test('selected Peto ORs and intervals agree with independently calculated values',()=>{
 const five=api.peto(api.trials.filter(x=>x.id!==16));
 near(five.OR,.6223062354030257);
 near(five.low,.4828407689070734);
 near(five.high,.8020554094843185);
 const six=api.peto(api.trials);
 near(six.OR,1.0279954951496255);
 near(six.low,.9679113631111979);
 near(six.high,1.0918094138817511);
 near(six.information,1059.0943814057632,1e-6);
 near(six.contributions.at(-1).informationShare,.9436666965159436,1e-10);
});
test('all 63 nonempty study subsets have finite ordered intervals and sum of information shares 1',()=>{
 for(let mask=1;mask<64;mask++){
  const subset=api.trials.filter((_,i)=>Boolean(mask&(1<<i)));
  const r=api.peto(subset);
  assert.equal(r.k,subset.length);
  assert.ok(r.low<r.OR&&r.OR<r.high);
  assert.ok(Number.isFinite(r.se)&&r.se>0);
  near(r.contributions.reduce((s,c)=>s+c.informationShare,0),1,1e-12);
 }
 assert.throws(()=>api.peto([]));
 assert.throws(()=>api.peto([{a:5,n1:4,c:0,n2:5}]));
});
test('English evidence reversal interface updates estimate, information and methodological feedback',()=>{
 const page=load('magnesium-reversal-lab.html');
 for(const word of ['English','selected','not a systematic','odds ratio','Peto','metadat::dat.egger2001','No spiritual analogy'])
   assert.ok(page.toLowerCase().includes(word.toLowerCase()),'Missing disclosure '+word);
 const dom=new JSDOM(page,{url:'https://example.test/magnesium-reversal-lab.html',runScripts:'outside-only'});
 const w=dom.window,d=w.document;
 w.eval(load('magnesium-reversal-data.js'));w.eval(load('magnesium-reversal-ui.js'));
 assert.match(d.getElementById('result').textContent,/0\.622/);
 assert.equal(d.querySelectorAll('#weights tr').length,5);
 d.getElementById('preset-six').click();
 assert.match(d.getElementById('result').textContent,/1\.028/);
 assert.match(d.getElementById('info').textContent,/94\.4%/);
 assert.equal(d.querySelectorAll('#weights tr').length,6);
 const input=Array.from(d.querySelectorAll('#trials input')).at(-1);
 input.checked=false; input.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.match(d.getElementById('result').textContent,/0\.622/);
 d.getElementById('predict-away').click();
 assert.match(d.getElementById('prediction').textContent,/closer to the null/);
 d.getElementById('decision-yes').click();
 assert.match(d.getElementById('decision').textContent,/cannot prove publication bias/);
 w.close();
});
test('new English pilot case embeds directly in all 12 language routes without replacing existing lessons',async()=>{
 assert.match(load('lesson-workshops.js'),/magnesium-lesson-integration\.js/);
 const script=load('magnesium-lesson-integration.js');
 const languages=['en','es','fr','de','it','pt','ru','ar','hi','zh','ja','ko'];
 for(const lang of languages){
  const html='<html><head></head><body><section class="module-slides active" data-module="7"><div class="slide lesson-workshop-slide"></div><div class="slide">Existing lesson</div></section></body></html>';
  const url='https://example.test/'+(lang==='en'?'synthesis-course.html':'synthesis-course-'+lang+'.html');
  const dom=new JSDOM(html,{url,runScripts:'outside-only'});
  const d=dom.window.document;
  dom.window.eval(script);
  const slide=d.querySelector('.lesson-magnesium-slide');
  assert.ok(slide,'missing slide '+lang);
  assert.equal(d.querySelectorAll('.lesson-workshop-slide').length,1);
  assert.equal(slide.dataset.magnesiumEnglishPilot,'true');
  assert.equal(slide.dataset.magnesiumLanguage,lang);
  if(lang!=='en')assert.match(slide.textContent,/not translated or professionally reviewed/);
  const frame=slide.querySelector('iframe[data-magnesium-src]');
  assert.ok(frame&&!frame.getAttribute('src'));
  slide.classList.add('active');
  await new Promise(resolve=>setImmediate(resolve));
  assert.ok(frame.src.endsWith('/magnesium-reversal-lab.html'),lang);
  dom.window.close();
 }
});
