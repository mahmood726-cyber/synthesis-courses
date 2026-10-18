const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.join(__dirname,'..');
const languages=['en','ar','de','es','fr','hi','it','ja','ko','pt','ru','zh'];
const read=lang=>fs.readFileSync(path.join(root,lang==='en'?'synthesis-course.html':`synthesis-course-${lang}.html`),'utf8');

test('all twelve real course glossaries have unique identifiers and populated definitions',()=>{
 for(const lang of languages){
  const page=new JSDOM(read(lang));
  try {
   const rows=[...page.window.document.querySelectorAll('.glossary-term')];
   const ids=rows.map(row=>row.dataset.term);
   assert.equal(rows.length,lang==='fr'?73:77,lang);
   assert.equal(new Set(ids).size,ids.length,lang);
   for(const row of rows){
    assert.ok(row.querySelector('dt')?.textContent.trim(),`${lang}: term`);
    assert.ok(row.querySelector('dd')?.textContent.trim(),`${lang}: definition`);
   }
  } finally {page.window.close();}
 }
});

test('French canonical definitions preserve useful detail, source and provisional status',()=>{
 const page=new JSDOM(read('fr'));
 try {
  const d=page.window.document;
  for(const term of ['nnt','nma','sucra','ipd']){
   const rows=d.querySelectorAll(`.glossary-term[data-term="${term}"]`);
   assert.equal(rows.length,1,term);
   assert.match(rows[0].textContent,/Traduction provisoire/,term);
  }
  assert.match(d.querySelector('[data-term="nnt"]').textContent,/risque de base/);
  assert.match(d.querySelector('[data-term="nma"]').textContent,/directes et indirectes/);
  assert.match(d.querySelector('[data-term="sucra"]').textContent,/probabiliste/);
  const ipd=d.querySelector('[data-term="ipd"]');
  assert.match(ipd.textContent,/résultats agrégés publiés/);
  assert.match(ipd.textContent,/interactions traitement-covariate/);
  assert.equal(ipd.querySelector('a').href,'https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-26');
  assert.doesNotMatch(ipd.textContent,/curriculum vitae|Norme de référence/);
  assert.equal(d.querySelector('[data-term="iceman"] dt').textContent,'ICEMAN');
  assert.doesNotMatch(read('fr'),/HOMME DES GLACES/);
 } finally {page.window.close();}
});

test('actual French glossary search finds one canonical result for each former duplicate',()=>{
 const source=read('fr'),page=new JSDOM(source,{runScripts:'outside-only'});
 try {
  const start=source.indexOf('    function filterGlossary()');
  const end=source.indexOf('    function toggleKeyboardHelp()',start);
  assert.ok(start>0&&end>start);
  page.window.eval(source.slice(start,end));
  for(const term of ['NNT','NMA','SUCRA','IPD']){
   page.window.document.getElementById('glossarySearch').value=term;
   page.window.filterGlossary();
   const matching=[...page.window.document.querySelectorAll(`.glossary-term[data-term="${term.toLowerCase()}"]`)];
   assert.equal(matching.length,1);
   assert.equal(matching[0].style.display,'block');
  }
  page.window.document.getElementById('glossarySearch').value='no-such-glossary-term';
  page.window.filterGlossary();
  assert.ok([...page.window.document.querySelectorAll('.glossary-term')].every(row=>row.style.display==='none'));
 } finally {page.window.close();}
});
