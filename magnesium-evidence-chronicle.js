/* Secular, source-attributed, three-act evidence history.
   Published events are real; learners' choices and the small selected subset
   are retrospective educational activities, not reconstructed historical decisions.
   No religious passages or fictional patient records.
*/
(function(){
 'use strict';
 const d=document, $=id=>d.getElementById(id);
 const act2=$('act-two'),act3=$('act-three'),act4=$('act-four'),status=$('chapter-progress');
 if(!act2||!act3||!act4||!status)return;
 const chapters=[act2,act3,act4];
 function reveal(chapter,message){
   chapter.hidden=false;
   chapter.classList.add('revealed');
   chapter.setAttribute('tabindex','-1');
   status.textContent=message;
   status.dataset.chapter=String(chapters.filter(x=>!x.hidden).length+1);
 }
 const predictionButtons=['predict-toward','predict-away'];
 predictionButtons.forEach(id=>{
   const button=$(id);
   if(button)button.addEventListener('click',()=>{
     if(act2.hidden)reveal(act2,'Act II unlocked: compare the larger ISIS-4 result with the earlier evidence and reproduce the selected trial calculation.');
   });
 });
 function afterStudyChoice(){
   if(act2.hidden||!act3.hidden)return;
   reveal(act3,'Act III unlocked: evaluate what the observed disagreement does and does not establish.');
 }
 ['preset-five','preset-six'].forEach(id=>{
   const button=$(id);
   if(button)button.addEventListener('click',afterStudyChoice);
 });
 const trials=$('trials');
 if(trials)trials.addEventListener('change',event=>{
   if(event.target && event.target.matches('input[type="checkbox"]'))afterStudyChoice();
 });
 ['decision-no','decision-yes'].forEach(id=>{
   const button=$(id);
   if(button)button.addEventListener('click',()=>{
     if(act3.hidden)return;
     if(act4.hidden)reveal(act4,'Final sources unlocked: compare the official full 15- and 16-trial analyses with the selected classroom estimates.');
   });
 });
 const skip=$('show-all-chapters');
 if(skip)skip.addEventListener('click',()=>{
   chapters.forEach(x=>{x.hidden=false;x.classList.add('revealed');x.setAttribute('tabindex','-1')});
   status.textContent='All three acts and the full source comparison are open. You can still change your study selections and choices.';
   status.dataset.chapter='4';
 });
 status.dataset.chapter='1';
})();
