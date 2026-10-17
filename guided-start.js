/* Guided Start: six evidence decisions, progressive feedback and learning-path suggestions.
   Based on source-linked metadat R examples; local, optional draft storage only.
   This is not a validated readiness test or competence certificate.
*/
(function(){
'use strict';
const $=id=>document.getElementById(id);
let engine;
try{engine=window.SynthesisGuidedStart.build({
 SYNTHESIS_REAL_DATA:window.SYNTHESIS_REAL_DATA,
 MagnesiumReversal:window.MagnesiumReversal
});}catch(e){$('taskQuestion').textContent='Historical source datasets unavailable: '+e.message;return;}
const KEY='synthesis_guided_start_v1';
const empty=()=>({version:1,index:0,responses:{},chosen:{}});
let data=empty();
try{
 const saved=JSON.parse(localStorage.getItem(KEY)||'null');
 if(saved&&saved.version===1&&saved.responses&&saved.chosen&&
   Number.isInteger(saved.index)&&saved.index>=0&&saved.index<=engine.tasks.length)
    data=saved;
}catch(_){}
let resetPending=false;
const tasks=engine.tasks;
const lang=(new URL(location.href)).searchParams.get('lang');
if(lang&&lang!=='en'){
 $('languageNotice').textContent='English-only beginner diagnostic opened from the '+lang+
   ' course route. This new activity has not been professionally translated or reviewed in '+lang+
   ' and is provisional; the original translated Synthesis lessons remain accessible.';
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(data));}catch(_){}}
function e(tag,text){
 const node=document.createElement(tag);
 if(text!==undefined)node.textContent=String(text);
 return node;
}
function progress(){
 const n=tasks.filter(t=>Object.prototype.hasOwnProperty.call(data.responses,t.id)).length;
 $('progressLabel').textContent=n+' of '+tasks.length+' source-based decisions attempted';
 $('progressMeter').setAttribute('aria-valuenow',String(n));
 $('meterFill').style.width=(100*n/tasks.length)+'%';
}
function svgEl(svg,tag,attrs,content){
 const node=document.createElementNS('http://www.w3.org/2000/svg',tag);
 for(const [key,value] of Object.entries(attrs||{}))node.setAttribute(key,String(value));
 if(content!==undefined)node.textContent=String(content);
 svg.append(node);return node;
}
function showInfluence(){
 const wrap=$('impactPlot');wrap.replaceChildren();wrap.hidden=false;
 const real=window.SYNTHESIS_REAL_DATA;
 const a=real.metaRD([1,2,3,4,5]),b=real.metaRD();
 if(!a||!b)return;
 const range=[a.lower,a.upper,b.lower,b.upper,0],low=Math.min(...range),high=Math.max(...range);
 const span=high-low||.01,min=low-span*.12,max=high+span*.12,coord=x=>180+((x-min)/(max-min))*470;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('role','img');
 svg.setAttribute('viewBox','0 0 720 175');
 svg.setAttribute('aria-label','Historical Hine risk difference: selected first five studies compared with all six, with 95 percent confidence intervals and the zero-effect line');
 svgEl(svg,'title',{},'Hine 1989 teaching sensitivity: risk differences');
 svgEl(svg,'line',{x1:coord(0),x2:coord(0),y1:15,y2:120,stroke:'#a77b34','stroke-width':2,'stroke-dasharray':'5 4'});
 [[a,'Five selected rows',48],[b,'All six source rows',100]].forEach(([r,name,y])=>{
  svgEl(svg,'text',{x:4,y:y+5,fill:'#164356','font-size':14},name);
  svgEl(svg,'line',{x1:coord(r.lower),x2:coord(r.upper),y1:y,y2:y,stroke:'#186b72','stroke-width':3});
  svgEl(svg,'circle',{cx:coord(r.estimate),cy:y,r:6,fill:'#165d50'});
  svgEl(svg,'text',{x:668,y:y+5,'font-size':13,fill:'#173e52'},r.estimate.toFixed(3));
 });
 svgEl(svg,'text',{x:coord(0),y:151,'text-anchor':'middle',fill:'#654c21','font-size':13},'No difference (RD = 0)');
 wrap.append(svg);
 wrap.append(e('p','CIs are normal-approximation common-effect inverse-variance teaching intervals. The study subset is retrospective; selecting five versus six does not establish eligibility or clinical effects.'));
}
function render(){
 progress();const allDone=tasks.every(t=>data.responses[t.id]);
 if(data.index>=tasks.length){
  $('exercise').hidden=true;$('summary').hidden=false;
  const n=tasks.filter(t=>data.responses[t.id]?.firstCorrect).length;
  $('summaryStatus').textContent='Your first attempts matched the source-grounded answers on '+n+
   ' of '+tasks.length+' questions. This is practice feedback, not a validated assessment of your research competence.';
  const recommendations=engine.guidance(data.responses);
  const box=$('recommendations');box.replaceChildren();
  if(!recommendations.length){
   box.append(e('p','No first-attempt misconceptions recorded. Try the full Research Studio, peer-review decisions and unseen exercises next.'));
  }else{
   box.append(e('h3','Practise these skills next'));
   for(const r of recommendations){
    const link=e('a',r.title+' → a source-linked practice exercise');
    link.href=r.url;box.append(link);
   }
  }
  return;
 }
 $('exercise').hidden=false;$('summary').hidden=true;
 const t=tasks[data.index],record=data.responses[t.id],selected=data.chosen[t.id];
 $('stepLabel').textContent='Decision '+(data.index+1)+' of '+tasks.length;
 $('scene').textContent=t.scene;
 $('taskTitle').textContent=t.title;
 $('taskQuestion').textContent=t.text;
 $('sourceLink').href=t.source;
 const panel=$('choiceOptions');panel.replaceChildren();
 $('numericBlock').hidden=t.kind!=='numeric';
 if(t.kind==='choice'){
  t.choices.forEach((option,i)=>{
   const button=e('button',String.fromCharCode(65+i)+'. '+option);
   button.type='button';button.dataset.choice=String(i);
   button.setAttribute('aria-pressed',String(String(i)===String(selected)));
   panel.append(button);
  });
 }else $('numericValue').value=selected===undefined?'':String(selected);
 $('previousTask').disabled=data.index===0;
 $('nextTask').disabled=!record;
 $('nextTask').textContent=data.index===tasks.length-1?'See my practice pathway →':'Next decision →';
 const feedback=$('answerFeedback');
 feedback.textContent=record?(record.lastCorrect?'Source-grounded answer supported. ':'Reconsider this interpretation. ')+
      t.explanation+
      (!record.firstCorrect&&record.lastCorrect?' You corrected your answer; the first-attempt misconception is retained only for practice suggestions.':''):
   'Make your own decision first, then check the documented evidence.';
 feedback.dataset.result=record?(record.lastCorrect?'correct':'retry'):'unanswered';
 const graph=$('impactPlot');
 if(t.id==='influence'&&record)showInfluence();else{graph.hidden=true;graph.replaceChildren();}
}
$('choiceOptions').addEventListener('click',event=>{
 const button=event.target.closest('button[data-choice]');
 if(!button)return;
 const t=tasks[data.index];
 data.chosen[t.id]=Number(button.dataset.choice);save();render();
});
$('numericValue').addEventListener('input',()=>{
 const t=tasks[data.index];if(t.kind!=='numeric')return;
 data.chosen[t.id]=$('numericValue').value;save();
});
$('checkAnswer').addEventListener('click',()=>{
 const t=tasks[data.index],value=t.kind==='numeric' ? $('numericValue').value : data.chosen[t.id];
 if(value===undefined||value===''||value===null){
  $('answerFeedback').textContent='Choose an option or enter a numerical risk difference before checking.';
  $('answerFeedback').dataset.result='retry';return;
 }
 const result=engine.assess(t.id,value),old=data.responses[t.id];
 data.responses[t.id]={firstCorrect:old?old.firstCorrect:result.correct,
    lastCorrect:result.correct,response:String(value),attempts:old?old.attempts+1:1};
 save();render();
});
$('previousTask').addEventListener('click',()=>{
 if(data.index===0)return;data.index--;save();render();$('taskTitle').focus?.();
});
$('nextTask').addEventListener('click',()=>{
 if(!data.responses[tasks[data.index].id])return;
 data.index=Math.min(tasks.length,data.index+1);save();render();
 if(data.index<tasks.length){$('exercise').focus();}else $('summaryTitle').setAttribute('tabindex','-1'),$('summaryTitle').focus();
});
$('reviewTasks').addEventListener('click',()=>{data.index=0;save();render();$('exercise').focus();});
$('exportNotes').addEventListener('click',()=>{
 try{
 const content=engine.report(data.responses),blob=new Blob([content],{type:'text/markdown;charset=utf-8'});
 const url=URL.createObjectURL(blob),link=e('a');link.href=url;link.download='synthesis-guided-start-learning-notes.md';
 document.body.append(link);link.click();link.remove();
 if(typeof setTimeout==='function')setTimeout(()=>URL.revokeObjectURL(url),0);
 $('exportFeedback').textContent='Your ungraded Markdown learning notes were prepared for local download. They are not a clinical report or certificate.';
 }catch(e){$('exportFeedback').textContent='Download unavailable here; review the on-screen explanations instead.';}
});
$('resetStarter').addEventListener('click',()=>{
 if(!resetPending){resetPending=true;$('resetStarter').textContent='Confirm deletion of only these six answers';$('resetFeedback').textContent='Click again to clear this diagnostic; other course progress and AllMeta data stay unchanged.';return;}
 data=empty();save();resetPending=false;$('resetStarter').textContent='Reset these six practice answers (two-click confirmation)';
 $('resetFeedback').textContent='Guided-start answers reset. Other Synthesis and AllMeta data remain unchanged.';
 render();
});
render();
})();
