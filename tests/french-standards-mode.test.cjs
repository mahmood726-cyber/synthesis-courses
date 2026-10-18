// Standards-mode regression for the published French flagship course.
// Source and DOM checks; not a live browser, translation or WCAG assessment.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const languages=['en','ar','de','es','fr','hi','it','ja','ko','pt','ru','zh'];
const filename=lang=>path.join(root,lang==='en'?'synthesis-course.html':`synthesis-course-${lang}.html`);

test('all 12 flagship routes have a doctype before the HTML element',()=>{
 for(const lang of languages){
  const html=fs.readFileSync(filename(lang),'utf8');
  assert.match(html,/^<!doctype html>\s*<html\b/i,`${lang}: no HTML5 doctype or stray prefix`);
  assert.equal((html.match(/<!doctype html>/gi)||[]).length,1,`${lang}: unexpected doctype count`);
 }
});
test('French source has correct root language and no visible stray HTML prefix',()=>{
 const html=fs.readFileSync(filename('fr'),'utf8');
 assert.match(html,/^<!doctype html>\n<html lang="fr">/i);
 assert.doesNotMatch(html,/^HTML\s*\n/i);
});
test('real French source parses in standards mode with an HTML doctype',()=>{
 const html=fs.readFileSync(filename('fr'),'utf8');
 const dom=new JSDOM(html,{runScripts:'outside-only'});
 const d=dom.window.document;
 assert.equal(d.compatMode,'CSS1Compat');
 assert.equal(d.doctype?.name.toLowerCase(),'html');
 assert.equal(d.documentElement.lang,'fr');
 assert.ok(d.querySelector('body'), 'French lesson must have body content');
 dom.window.close();
});
