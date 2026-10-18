// Source-specific document language test, not a WCAG or native-language quality audit.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const repo=path.join(__dirname,'..');
const locales=['en','ar','de','es','fr','hi','it','ja','ko','pt','ru','zh'];
const file=lang=>path.join(repo,lang==='en'?'synthesis-course.html':`synthesis-course-${lang}.html`);
const read=lang=>fs.readFileSync(file(lang),'utf8');
const rootTag=markup=>{
 const tag=markup.match(/<html\b[^>]*>/i);
 assert.ok(tag,'missing HTML root');
 const lang=tag[0].match(/\blang\s*=\s*["']([^"']+)["']/i);
 assert.ok(lang,'missing declared page language');
 return {markup:tag[0],lang:lang[1]};
};
test('all 12 flagship courses declare their actual route language',()=>{
 assert.equal(locales.length,12);
 for(const lang of locales){
  const html=read(lang);
  assert.ok(html.length>10000,`${lang}: truncated route`);
  assert.equal(rootTag(html).lang,lang,`${lang}: wrong default document language`);
 }
});
test('all 12 document titles and the Arabic right-to-left direction remain intact',()=>{
 for(const lang of locales){
  const html=read(lang),tag=rootTag(html).markup;
  assert.match(html,/<title\b[^>]*>\s*[^<\s]/i,`${lang}: missing document title`);
  if(lang==='ar')assert.match(tag,/\bdir\s*=\s*["']rtl["']/i);
  else assert.doesNotMatch(tag,/\bdir\s*=\s*["']rtl["']/i);
 }
});
test('JSDOM exposes correct root languages for diverse writing systems',()=>{
 for(const lang of ['en','ar','fr','de','hi','ja','zh']){
  const d=new JSDOM(read(lang),{runScripts:'outside-only'});
  assert.equal(d.window.document.documentElement.lang,lang);
  if(lang==='ar')assert.equal(d.window.document.documentElement.dir,'rtl');
  d.window.close();
 }
});
test('new English-only historical exercise remains clearly provisional',()=>{
 const html=fs.readFileSync(path.join(repo,'hart-transfer.html'),'utf8');
 assert.equal(rootTag(html).lang,'en');
 assert.match(html,/English-only provisional/);
});