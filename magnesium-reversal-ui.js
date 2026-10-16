/* Standalone magnesium evidence-reversal investigation, with no tracking. */
(function(){
 'use strict';
 const A=window.MagnesiumReversal, doc=document;
 if(!A)return;
 const id=x=>doc.getElementById(x);
 const selected=new Set(A.trials.filter(t=>t.id!==16).map(t=>t.id));
 function draw(){
   const trials=A.trials.filter(t=>selected.has(t.id));
   id('trials').replaceChildren();
   for(const t of A.trials){
     const label=doc.createElement('label');label.className='trial';
     const checkbox=doc.createElement('input');checkbox.type='checkbox';checkbox.checked=selected.has(t.id);
     checkbox.addEventListener('change',()=>{if(checkbox.checked)selected.add(t.id);else selected.delete(t.id);draw();});
     const span=doc.createElement('span');span.textContent=t.study+' ('+t.year+') — magnesium '+t.a+'/'+t.n1+', control '+t.c+'/'+t.n2;
     label.append(checkbox,span);id('trials').append(label);
   }
   id('weights').replaceChildren();
   const influenceRows=id('influence-rows'),influenceInsight=id('influence-insight');
   if(influenceRows)influenceRows.replaceChildren();
   if(!trials.length){id('result').textContent='Select at least one trial.';id('info').textContent='';if(influenceInsight)influenceInsight.textContent='Choose at least two studies to compare leave-one-out results.';return;}
   const r=A.peto(trials);
   id('result').textContent='Peto equal-effects odds ratio: '+r.OR.toFixed(3)+' (95% CI '+r.low.toFixed(3)+'–'+r.high.toFixed(3)+'), k='+r.k+'.';
   const share=r.contributions.find(x=>x.id===16);
   id('info').textContent=share?'ISIS-4 accounts for '+(100*share.informationShare).toFixed(1)+'% of Peto information in this selected subset. Information is not study quality.':'ISIS-4 is not included in this classroom subset.';
   if(influenceRows && influenceInsight){
     if(trials.length<2){
       influenceInsight.textContent='Choose at least two studies for the leave-one-out comparison.';
     } else {
       // Compare omitted-study results on the log(OR) scale, not percentage
       // points or information weights. Influential does not mean biased.
       const diagnostics=trials.map(t=>{
         const omitted=A.peto(trials.filter(x=>x.id!==t.id));
         return {name:t.study,id:t.id,OR:omitted.OR,
           delta:Math.abs(Math.log(omitted.OR)-r.logOR)};
       }).sort((a,b)=>b.delta-a.delta || a.id-b.id);
       for(const x of diagnostics){
         const tr=doc.createElement('tr');
         for(const text of [x.name,x.OR.toFixed(3),x.delta.toFixed(3)]){
           const cell=doc.createElement('td');cell.textContent=text;tr.append(cell);
         }
         influenceRows.append(tr);
       }
       influenceInsight.textContent='Largest absolute change in log(OR) within this selected set: '+diagnostics[0].name+'. This identifies influence under the chosen Peto model, not study quality or eligibility.';
     }
   }
   for(const x of r.contributions){
     const tr=doc.createElement('tr');
     for(const value of [x.study,x.oe.toFixed(3),x.variance.toFixed(3),(100*x.informationShare).toFixed(1)+'%']){
       const cell=doc.createElement('td');cell.textContent=value;tr.append(cell);
     }
     id('weights').append(tr);
   }
 }
 function preset(includeISIS){selected.clear();for(const t of A.trials){if(includeISIS||t.id!==16)selected.add(t.id);}draw();}
 id('preset-five').addEventListener('click',()=>preset(false));
 id('preset-six').addEventListener('click',()=>preset(true));
 id('predict-toward').addEventListener('click',()=>{id('prediction').textContent='Supported prediction: adding the large trial moves this selected pooled OR from 0.622 toward 1, to 1.028. Now verify by including it below.';});
 id('predict-away').addEventListener('click',()=>{id('prediction').textContent='Check the arithmetic: adding ISIS-4 moves the selected Peto OR from 0.622 up to 1.028, closer to the null, not farther below 1.';});
 id('decision-no').addEventListener('click',()=>{id('decision').textContent='Supported: a changed pooled result alone does not identify the cause. Assess eligibility, reporting, timing, co-treatments, study design, inconsistency, and applicability.';});
 id('decision-yes').addEventListener('click',()=>{id('decision').textContent='Not established: this example cannot prove publication bias caused the earlier results. Check original publications and alternative explanations.';});
 draw();
})();
