// Source-specific French learner-tier persistence regressions.
// Synthetic storage fixtures are not live browser, clinical or WCAG validation.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const root=path.join(__dirname,'..');
const langs=['en','ar','de','es','fr','hi','it','ja','ko','pt','ru','zh'];
const read=l=>fs.readFileSync(path.join(root,l==='en'?'synthesis-course.html':'synthesis-course-'+l+'.html'),'utf8');
test('all 12 courses store tier under the shared origin key without changing progress storage',()=>{
 for(const lang of langs){
  const s=read(lang);
  assert.match(s,/localStorage\.setItem\('synthesis_course_tier', tier\)/,lang);
  assert.match(s,/localStorage\.getItem\('synthesis_course_tier'\)/,lang);
  assert.match(s,/const STORAGE_KEY = 'evidence_reversal_course_progress';/,lang);
 }
});
test('French still recognises existing legacy tier, while validating supported difficulty names',()=>{
 const s=read('fr');
 assert.match(s,/localStorage\.getItem\('synthCourseTier'\)/);
 assert.match(s,/\['foundation', 'researcher', 'methodologist'\]/);
 assert.equal(s.includes("localStorage.setItem('synthCourseTier', tier);"),false);
});
function originalIife(){
 const s=read('fr');
 const idx=s.indexOf('// Restore tier from localStorage on load');
 assert.ok(idx>0);
 const start=s.indexOf('(function()',idx),end=s.indexOf('})();',start);
 assert.ok(start>idx&&end>start);
 return s.slice(start,end+5);
}
function runRestore(values,deny=false){
 const used=[],ctx={continued:false};
 ctx.localStorage={getItem(key){if(deny)throw Error('SecurityError');return values[key]??null;}};
 ctx.document={
  body:{classList:{add(x){used.push(x)}}},
  addEventListener(_type,fn){},
  querySelectorAll(){return []}
 };
 vm.runInNewContext(originalIife()+';continued=true;',ctx);
 return {used,continued:ctx.continued};
}
test('real French restore IIFE tolerates denied storage and preserves subsequent script evaluation',()=>{
 const r=runRestore({},true);
 assert.equal(r.continued,true);
 assert.deepEqual(r.used,[]);
});
test('shared tier overrides legacy; previous French-only choice still restores',()=>{
 assert.deepEqual(runRestore({synthesis_course_tier:'researcher',synthCourseTier:'methodologist'}).used,['tier-researcher']);
 assert.deepEqual(runRestore({synthCourseTier:'methodologist'}).used,['tier-methodologist']);
 assert.deepEqual(runRestore({synthCourseTier:'unexpected-value'}).used,[]);
});
test('actual French setTier storage call is guarded against denied quota or permissions',()=>{
 const s=read('fr'),start=s.indexOf('function setTier(tier)'),end=s.indexOf('// Restore tier from localStorage on load',start);
 assert.ok(start>0&&end>start);
 const fn=s.slice(start,end);
 const statement=fn.match(/try\s*\{\s*localStorage\.setItem\('synthesis_course_tier', tier\);\s*\}\s*catch\s*\(e\)\s*\{\s*\}/);
 assert.ok(statement,'guarded shared-key write missing');
 const ctx={continued:false,localStorage:{setItem(){throw Error('QuotaExceededError')}}};
 vm.runInNewContext("const tier='researcher';"+statement[0]+";continued=true;",ctx);
 assert.equal(ctx.continued,true);
});
test('French document and learning-level buttons remain present',()=>{
 const d=new JSDOM(read('fr'),{runScripts:'outside-only'});
 assert.equal(d.window.document.documentElement.lang,'fr');
 for(const tier of ['foundation','researcher','methodologist'])
  assert.ok(d.window.document.querySelector('.tier-btn[data-tier="'+tier+'"]'),'missing '+tier);
 d.window.close();
});