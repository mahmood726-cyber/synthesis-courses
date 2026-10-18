// Flagship course-library return navigation: no source/data or translation claims.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const langs=['en','ar','de','es','fr','hi','it','ja','ko','pt','ru','zh'];
const sourceFile=lang=>path.join(root,lang==='en'?'synthesis-course.html':`synthesis-course-${lang}.html`);
const homeFile=lang=>lang==='en'?'index.html':`index-${lang}.html`;

test('each of 12 flagship routes links its Course Library control to its own published language library',()=>{
 for(const lang of langs){
  const html=fs.readFileSync(sourceFile(lang),'utf8');
  const dom=new JSDOM(html,{url:'https://example.test/synthesis-courses/',runScripts:'outside-only'});
  const links=dom.window.document.querySelectorAll('.sidebar-header a[href]');
  assert.equal(links.length,1,`${lang}: exactly one course-library link`);
  assert.equal(links[0].getAttribute('href'),homeFile(lang),`${lang}: expected localized library return`);
  assert.ok(fs.existsSync(path.join(root,homeFile(lang))),`${lang}: missing linked library`);
  assert.match(dom.window.document.querySelector('.sidebar-header').textContent,/Course Library|cours|مكتبة|Bibliot|库|ライブラリ|कोर्स|курс/i);
  dom.window.close();
 }
});
test('all existing 12 flagship pages retain their correct route identity and major lesson structure',()=>{
 for(const lang of langs){
  const html=fs.readFileSync(sourceFile(lang),'utf8');
  assert.ok(html.length>500000,`${lang}: source is truncated`);
  assert.match(html,/<div class="course-container">/,`${lang}: main course shell missing`);
 }
});