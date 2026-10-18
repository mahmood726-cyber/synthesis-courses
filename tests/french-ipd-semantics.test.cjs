// Source-aligned French IPD corrections. Provisional language content, not professional translation approval.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.join(__dirname,'..');
const fr=fs.readFileSync(path.join(root,'synthesis-course-fr.html'),'utf8');
const en=fs.readFileSync(path.join(root,'synthesis-course.html'),'utf8');
test('English source explicitly contrasts individual participant data with published summaries',()=>{
 assert.match(en,/published summaries\. Not patients\./);
 assert.match(en,/rather than published summaries/);
});
test('French IPD glossary and evidence story never confuse aggregate data with CVs',()=>{
 assert.doesNotMatch(fr,/curriculum vitae/i);
 assert.match(fr,/les résultats agrégés publiés/);
 assert.match(fr,/publiaient des résultats agrégés\. Pas les données individuelles\./);
});
test('French IPD explanations are explicitly provisional and remain source-linked',()=>{
 const page=new JSDOM(fr,{runScripts:'outside-only'}),d=page.window.document;
 const rows=[...d.querySelectorAll('.glossary-term[data-term="ipd"] dd')];
 assert.equal(rows.length,1,'one canonical IPD definition');
 assert.match(rows[0].textContent,/résultats agrégés publiés/);
 assert.match(rows[0].textContent,/Traduction provisoire/);
 assert.match(rows[0].textContent,/interactions traitement-covariate/);
 const paragraphs=[...d.querySelectorAll('p')].filter(p=>p.textContent.includes('publiaient des résultats agrégés'));
 assert.equal(paragraphs.length,1,'one corrected breast-cancer narrative slide');
 assert.match(paragraphs[0].nextElementSibling?.textContent||'',/Traduction provisoire/);
 assert.equal(d.documentElement.lang,'fr');
 page.window.close();
});
