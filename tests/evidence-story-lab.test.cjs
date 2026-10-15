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
test('sources, reflective framing and boundaries are explicit',()=>{
 for(const link of ['https://quran.com/27/27','https://quran.com/12/87','https://quran.com/49/6'])assert.ok(page.includes(link));
 assert.match(page,/paraphrases.*not translations quoted/s);
 assert.match(page,/not.*source of effect estimates/i);
 assert.match(page,/not an exhaustive search/i);
 assert.match(page,/metafor/);
});