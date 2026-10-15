const {test}=require('node:test');
const assert=require('node:assert/strict');
const {TRIALS,analyse}=require('../evidence-story-lab.js');
test('six archival rows yield the expected pooled demonstration',()=>{
  assert.equal(TRIALS.length,6);
  const result=analyse(TRIALS);
  assert.ok(Math.abs(result.fixed.rr-0.659110)<0.00001);
  assert.ok(Math.abs(result.dl.rr-0.461700)<0.00001);
  assert.ok(Math.abs(result.I2-96.066480)<0.0001);
});
