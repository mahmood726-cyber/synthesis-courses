const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {TRIALS,analyse}=require('../evidence-story-lab.js');
const page=fs.readFileSync(path.join(__dirname,'../evidence-story-lab.html'),'utf8');
test('six real BCG rows remain a disclosed subset of 13',()=>{
 assert.deepEqual(TRIALS.map(x=>x.id),[1,2,4,5,6,8]);
 assert.deepEqual(TRIALS.map(x=>x.tp),[4,6,62,33,180,505]);
 assert.deepEqual(TRIALS.map(x=>x.cp),[11,29,248,47,372,499]);
 assert.equal(TRIALS.filter(x=>x.alloc==='alternate').length,2);
 assert.match(page,/original 13 studies/);
 assert.match(page,/deliberately nonrepresentative selection/);
});
test('fixed and DL analyses reproduce pinned reference values',()=>{
 const full=analyse(TRIALS);
 const without=analyse(TRIALS.filter(x=>x.id!==8));
 const random=analyse(TRIALS.filter(x=>x.alloc==='random'));
 assert.equal(full.rows.length,6);
 assert.ok(Math.abs(full.fixed.rr-0.659110)<0.00001);
 assert.ok(Math.abs(full.dl.rr-0.461700)<0.00001);
 assert.ok(Math.abs(full.I2-96.066480)<0.0001);
 assert.ok(Math.abs(without.fixed.rr-0.405)<0.001);
 assert.ok(full.fixed.rr>without.fixed.rr);
 assert.equal(random.rows.length,4);
 assert.ok(full.fixed.lo>0&&full.fixed.hi>full.fixed.lo);
});
test('invalid selection and numeric inputs fail closed',()=>{
 assert.throws(()=>analyse([]),/two or more/);
 assert.throws(()=>analyse([TRIALS[0]]),/two or more/);
 assert.throws(()=>analyse([TRIALS[0],{...TRIALS[1],tp:0}]),/Positive cells/);
});
test('sources, nonreligious real-data narrative and selection boundaries are explicit',()=>{
 for(const link of ['https://wviechtb.github.io/metafor/reference/escalc.html','magnesium-reversal-lab.html'])assert.ok(page.includes(link));
 assert.match(page,/thirteen historical BCG study records/i);
 assert.match(page,/not.*historical/i);
 assert.match(page,/not an exhaustive search/i);
 assert.match(page,/metafor/);
 assert.match(page,/two trials used alternate allocation/i);
 assert.doesNotMatch(page,/quran\.com|Qur.an|scripture/i);
});
test('interactive log-RR forest plot stays in sync with study inclusion',()=>{
 const {JSDOM}=require('jsdom');
 const dom=new JSDOM(page,{url:'https://example.test/evidence-story-lab.html',runScripts:'outside-only'});
 const math=fs.readFileSync(path.join(__dirname,'../evidence-story-lab.js'),'utf8');
 const ui=fs.readFileSync(path.join(__dirname,'../evidence-story-ui.js'),'utf8');
 dom.window.eval(math);dom.window.eval(ui);
 const d=dom.window.document;
 const chart=()=>d.querySelector('.forest-figure svg');
 assert.ok(chart(),'Accessible plot is rendered next to the result cards');
 assert.equal(d.querySelectorAll('.forest-point').length,6);
 assert.equal(d.querySelectorAll('.forest-diamond').length,2);
 assert.match(chart().getAttribute('aria-label'),/log-scale forest plot/i);
 assert.equal(d.getElementById('chosen-count').textContent,'6');
 const before=d.querySelector('.stat-grid .stat strong').textContent;
 assert.equal(before,'0.659');
 d.querySelector('button[data-preset="madras-out"]').click();
 assert.equal(d.querySelectorAll('.forest-point').length,5);
 assert.equal(d.getElementById('chosen-count').textContent,'5');
 assert.equal(d.querySelector('.stat-grid .stat strong').textContent,'0.405');
 d.querySelector('button[data-preset="all"]').click();
 assert.equal(d.querySelectorAll('.forest-point').length,6);
 assert.equal(d.querySelector('.stat-grid .stat strong').textContent,'0.659');
 assert.ok(d.head.querySelector('style').textContent.includes('forest-figure'));
 dom.window.close();
});
test('axis covers the 95% intervals for every possible two-to-six-study subset',()=>{
 for(let mask=1;mask<(1<<TRIALS.length);mask++){
  const subset=TRIALS.filter((_,i)=>(mask&(1<<i))!==0);
  if(subset.length<2)continue;
  const a=analyse(subset);
  for(const value of [a.fixed.lo,a.fixed.hi,a.dl.lo,a.dl.hi]){
   assert.ok(value>0.05 && value<2.5,'interval must be visible: '+value);
  }
 }
});
