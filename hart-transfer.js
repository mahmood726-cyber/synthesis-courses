/* Native DOM controls, first-submission feedback, no networking or learner telemetry. */
(function(){
'use strict';
const core=window.SynthesisHartTransfer;if(!core)return;
const $=id=>document.getElementById(id);
const make=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=String(text);return el;};
for(const row of core.rows){
 const tr=make('tr');
 for(const cell of [row.study,row.year,row.x1+' / '+row.n1+' / '+row.t1,row.x2+' / '+row.n2+' / '+row.t2,row.comp,row.prevention])tr.append(make('td',cell));
 $('sourceRows').append(tr);
}
for(const [i,q] of core.tasks.entries()){
 const fs=make('fieldset');fs.append(make('legend',(i+1)+'. '+q.domain+': '+q.question));
 if(q.kind==='number'){
  const label=make('label','Your calculated IRR (decimal, two places): ');
  const input=make('input');input.type='number';input.id='response-'+q.id;input.name=q.id;input.step='0.01';input.inputMode='decimal';
  label.htmlFor=input.id;label.append(input);fs.append(label);
 }else{
  for(const [j,option] of q.options.entries()){
   const label=make('label');const input=make('input');input.type='radio';input.name=q.id;input.value=String(j);
   label.append(input,document.createTextNode(option));fs.append(label);
  }
 }
 $('tasks').append(fs);
}
let committed=null;
$('transferForm').addEventListener('submit',event=>{
 event.preventDefault();if(committed)return;
 const answers={};
 for(const q of core.tasks){
  const control=q.kind==='number'?$('response-'+q.id):document.querySelector('input[name="'+q.id+'"]:checked');
  answers[q.id]=control?.value;
 }
 try{
  const result=core.grade(answers);
  committed=Object.freeze({...answers});
  $('formStatus').textContent='First submissions committed locally. The worked key is now visible.';
  $('score').textContent='Source-based self-check: '+result.score+' of '+result.total+' decisions correct. This is not a validated competence grade.';
  for(const [i,marked] of result.marked.entries()){
   const q=core.tasks[i],panel=make('section');panel.className=marked.correct?'correct':'incorrect';
   panel.append(make('h3',q.domain+' — '+(marked.correct?'correct':'review this concept')),make('p','Your response: '+(q.kind==='number'?marked.input:q.options[Number(marked.input)])),make('p',marked.explanation));
   $('feedbackItems').append(panel);
  }
  $('feedback').hidden=false;for(const input of $('transferForm').querySelectorAll('input'))input.disabled=true;
  $('submitAnswers').disabled=true;$('feedbackTitle').focus();
 }catch(err){$('formStatus').textContent=err.message;}
});
$('exportReport').addEventListener('click',()=>{
 if(!committed)return;
 const blob=new Blob([core.report(committed)],{type:'text/markdown;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=make('a');a.href=url;a.download='hart1999-source-transfer-self-check.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$('restart').addEventListener('click',()=>location.reload());
})();
