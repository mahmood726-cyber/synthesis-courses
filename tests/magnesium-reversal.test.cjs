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
 for(const word of ['English','selected','not a systematic','odds ratio','Peto','metadat::dat.egger2001','No patient outcomes are invented'])
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
  // In this synthetic page the DOM is still loading; in production this script
  // is injected after the workshop DOMContentLoaded event.
  d.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
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

test('published chronological evidence acts are documented and explicitly separate from selected classroom data',()=>{
 const page=load('magnesium-reversal-lab.html');
 for(const fact of ['Act I','Act II','Act III','2,316','7.8%','10.3%','58,050','2,216','2,103','7.64%','7.24%','0.45','0.55','1.01']){
   assert.ok(page.includes(fact),'Missing historical report '+fact);
 }
 for(const src of ['pubmed.ncbi.nlm.nih.gov/1351547','pubmed.ncbi.nlm.nih.gov/7661937','wviechtb.github.io/metadat/reference/dat.egger2001.html']){
   assert.ok(page.includes(src),'Missing direct source link '+src);
 }
 assert.doesNotMatch(page,/fictional journal-club|quran\.com|Qur.anic verse/i);
 assert.match(page,/not the complete body of evidence/);
 assert.match(page,/English only/);
});
test('three-act investigation reveals new historical evidence only after decisions; all-source bypass works',()=>{
 const dom=new JSDOM(load('magnesium-reversal-lab.html'),{
   url:'https://example.test/magnesium-reversal-lab.html',
   runScripts:'outside-only'
 });
 const w=dom.window,d=w.document;
 w.eval(load('magnesium-reversal-data.js'));
 w.eval(load('magnesium-reversal-ui.js'));
 w.eval(load('magnesium-evidence-chronicle.js'));
 const a2=d.getElementById('act-two'),a3=d.getElementById('act-three'),a4=d.getElementById('act-four');
 assert.equal(a2.hidden,true);
 assert.equal(a3.hidden,true);
 assert.equal(a4.hidden,true);
 assert.equal(d.getElementById('chapter-progress').dataset.chapter,'1');
 d.getElementById('predict-toward').click();
 assert.equal(a2.hidden,false);
 assert.equal(a3.hidden,true);
 d.getElementById('preset-six').click();
 assert.equal(a3.hidden,false);
 assert.equal(a4.hidden,true);
 const influence=Array.from(d.querySelectorAll('#influence-rows tr'));
 assert.equal(influence.length,6);
 assert.equal(influence[0].querySelector('td').textContent,'ISIS-4');
 assert.match(influence[0].textContent,/0\.622/);
 assert.match(d.getElementById('influence-insight').textContent,/not study quality or eligibility/);
 d.getElementById('decision-no').click();
 assert.equal(a4.hidden,false);
 assert.equal(d.getElementById('chapter-progress').dataset.chapter,'4');
 w.close();
 const skip=new JSDOM(load('magnesium-reversal-lab.html'),{url:'https://example.test/magnesium-reversal-lab.html',runScripts:'outside-only'});
 skip.window.eval(load('magnesium-reversal-data.js'));
 skip.window.eval(load('magnesium-reversal-ui.js'));
 skip.window.eval(load('magnesium-evidence-chronicle.js'));
 skip.window.document.getElementById('show-all-chapters').click();
 for(const id of ['act-two','act-three','act-four'])assert.equal(skip.window.document.getElementById(id).hidden,false);
 skip.window.close();
});
test('leave-one-out calculations are finite across every possible 2–6-study selected set',()=>{
 for(let mask=1;mask<64;mask++){
   const selected=api.trials.filter((_,i)=>Boolean(mask&(1<<i)));
   if(selected.length<2)continue;
   const all=api.peto(selected);
   const ranking=selected.map(t=>{
     const omitted=api.peto(selected.filter(x=>x.id!==t.id));
     return Math.abs(Math.log(omitted.OR)-all.logOR);
   });
   assert.equal(ranking.length,selected.length);
   assert.ok(ranking.every(x=>Number.isFinite(x)&&x>=0));
 }
});
