const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const c=require('../hart-transfer-core.js');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
test('source rows reproduce exact historical events participants and person-years',()=>{
 assert.deepEqual(c.rows.map(r=>[r.study,r.x1,r.n1,r.t1,r.x2,r.n2,r.t2,r.prevention]),[
 ['AFASAK',9,335,413,19,336,398,'primary'],
 ['SPAF',8,210,263,19,211,245,'primary'],
 ['BAATAF',3,212,487,13,208,435,'primary'],
 ['CAFA',6,187,237,9,191,241,'primary'],
 ['SPINAF',7,281,489,23,290,483,'primary'],
 ['EAFT',20,225,507,50,214,405,'secondary']]);
 assert.match(c.SOURCE,/dat\.hart1999/);
});
test('inverse variance calculations agree with source-printed REML zero-tau output',()=>{
 assert.equal(c.firstFive.k,5);assert.equal(c.allSix.k,6);
 assert.ok(Math.abs(c.firstFive.IRR-0.390547736228663)<1e-10);
 assert.ok(Math.abs(c.allSix.logIRR+1.0168)<0.0001);
 assert.ok(Math.abs(c.allSix.IRR-0.3617)<0.0001);
 assert.ok(Math.abs(c.allSix.lower-0.2626)<0.0001);
 assert.ok(Math.abs(c.allSix.upper-0.4984)<0.0001);
 assert.ok(Math.abs(c.allSix.Q-2.9625)<0.0001);
});
test('person-time cannot be replaced by number of treated patients',()=>{
 const r=c.rows[0];
 assert.notEqual((r.x1/r.n1)/(r.x2/r.n2),(r.x1/r.t1)/(r.x2/r.t2));
 assert.throws(()=>c.commonEffectIRR([{x1:0,x2:2,t1:1,t2:1}]),/Positive events/);
});
test('all seven questions must be answered before source-based feedback',()=>{
 assert.equal(c.tasks.length,7);
 const correct={scope:'1',rate:'1',calculation:'0.46',population:'1',influence:'0',heterogeneity:'1',interpret:'0'};
 assert.equal(c.grade(correct).score,7);
 assert.throws(()=>c.grade({...correct,rate:''}),/Complete all seven/);
 assert.throws(()=>c.grade({...correct,calculation:'Infinity'}),/finite/);
 assert.throws(()=>c.grade({...correct,rate:'20'}),/listed option/);
 assert.equal(c.grade({...correct,calculation:'0.50'}).score,6);
 const md=c.report(correct);
 for(const marker of ['NOT a blinded','dat.hart1999','person-time','0.361745','not credential'])assert.match(md,new RegExp(marker,'i'));
});
test('provisional English-first HTML uses source citations, accessible form and safe export',()=>{
 const html=read('hart-transfer.html'),js=read('hart-transfer.js');
 for(const marker of ['<html lang="en">','<form id="transferForm"','role="status"','sourceRows','hart-transfer-core.js','English-only provisional','not an independently blinded','allmeta/'])assert.ok(html.includes(marker),marker);
 assert.match(js,/event.preventDefault\(\)/);assert.match(js,/core.grade\(answers\)/);
 assert.match(js,/querySelectorAll\('input'\)/);assert.match(js,/URL.revokeObjectURL/);
 assert.doesNotMatch(html+js,/quran\.com|google-analytics|gtag\(/i);
});
