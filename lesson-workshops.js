/* Adds a real-data, small-k exercise INSIDE each flagship lesson.
   Never rewrites the translated narrative. Loads an iframe only when the new
   exercise slide becomes active, keeping 25 modules fast to navigate.
 */
(function(){
  'use strict';
  const messages={
    en:['Real-data practical','A short, hands-on calculation or methods decision, using a sourced R meta-analysis with only five or six trials.','Verified study-level data','Open the exercise in a separate tab','Dataset and analysis methods are sourced; statistical replication is not a clinical recommendation.'],
    es:['Práctica con datos reales','Ejercicio breve con datos de un metaanálisis de R de solo cinco o seis ensayos.','Datos por estudio verificados','Abrir en otra pestaña','Los datos y métodos están documentados; reproducir un cálculo no equivale a recomendar un tratamiento.'],
    fr:['Exercice sur données réelles','Court exercice fondé sur une méta-analyse R comportant seulement cinq ou six essais.','Données vérifiées par étude','Ouvrir dans un autre onglet','Sources et méthodes documentées ; reproduire un calcul ne constitue pas une recommandation clinique.'],
    de:['Übung mit echten Daten','Kurze Übung mit einer R-Metaanalyse aus nur fünf oder sechs Studien.','Geprüfte Studiendaten','In neuem Tab öffnen','Quellen und Verfahren sind dokumentiert; statistische Replikation ist keine klinische Empfehlung.'],
    it:['Esercizio con dati reali','Breve esercizio basato su una meta-analisi R con solo cinque o sei studi.','Dati originali verificati','Apri in una nuova scheda','Dati e metodi sono documentati; la riproduzione non equivale a una raccomandazione clinica.'],
    pt:['Exercício com dados reais','Exercício breve com uma meta-análise em R de apenas cinco ou seis estudos.','Dados por estudo verificados','Abrir em novo separador','Fontes e métodos documentados; replicar cálculos não constitui orientação clínica.'],
    ru:['Практика с реальными данными','Короткое упражнение на основе метаанализа из R, включающего всего пять или шесть исследований.','Проверенные данные исследований','Открыть в новой вкладке','Данные и методы документированы; повторение расчёта не является клинической рекомендацией.'],
    ar:['تدريب باستخدام بيانات حقيقية','تمرين قصير من تحليل تلوي منشور ضمن R يضم خمس أو ست دراسات فقط.','بيانات الدراسات الموثقة','فتح التمرين في تبويب جديد','البيانات وطرائق التحليل موثقة؛ إعادة الحساب لا تُعد توصية سريرية.'],
    hi:['वास्तविक डेटा अभ्यास','R के केवल पाँच या छह अध्ययनों वाले मेटा-विश्लेषण पर आधारित छोटा अभ्यास।','सत्यापित अध्ययन डेटा','नए टैब में खोलें','डेटा और विधियाँ प्रलेखित हैं; गणना की पुनरावृत्ति चिकित्सकीय सलाह नहीं है।'],
    zh:['真实数据练习','基于 R 中仅含五至六项试验的荟萃分析，完成一个简短的实践问题。','来源核实的研究数据','在新标签页打开','数据来源与分析方法已注明；复现计算不等于临床建议。'],
    ja:['実データ演習','R に収録された5～6試験の小規模メタ解析を用いた短い演習です。','出典を確認した試験データ','新しいタブで開く','出典と方法は明示していますが、計算の再現は臨床推奨を意味しません。'],
    ko:['실제 자료 실습','R의 5~6개 연구로 구성된 작은 메타분석을 활용한 짧은 연습입니다.','출처가 확인된 연구 자료','새 탭에서 열기','출처와 방법을 명시했으며 계산 재현은 임상 권고를 뜻하지 않습니다.']
  };
  function init(){
    if(!document.querySelector('.module-slides[data-module]')||document.querySelector('.lesson-workshop-slide'))return;
    const match=location.pathname.match(/synthesis-course-([a-z]{2})\.html$/);
    const lang=match&&messages[match[1]]?match[1]:'en';
    const L=messages[lang];
    const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='lesson-workshops.css';
    document.head.appendChild(sheet);
    document.querySelectorAll('.module-slides[data-module]').forEach(module=>{
      const id=Number(module.getAttribute('data-module'));
      if(!Number.isInteger(id)||id<0||id>=25)return;
      const source=id===21||id===23?
        'https://wviechtb.github.io/metadat/reference/dat.berkey1998.html':
        'https://wviechtb.github.io/metadat/reference/dat.hine1989.html';
      const url='real-evidence-lab.html?module='+id+'&lang='+encodeURIComponent(lang)+'&embed=1';
      const slide=document.createElement('div');
      slide.className='slide light lesson-workshop-slide';
      slide.setAttribute('data-workshop-module',String(id));
      slide.innerHTML='<div class="lesson-workshop-wrap">'+
        '<span class="lesson-workshop-label">🧪 '+L[0]+' · '+(id===21||id===23?'k = 5':'k = 6')+'</span>'+
        '<h2>'+L[0]+'</h2><p>'+L[1]+'</p>'+
        '<div class="lesson-frame-wrap"><iframe loading="lazy" title="'+L[0]+' '+id+
        '" data-lesson-src="'+url+'" allow="clipboard-write"></iframe></div>'+
        '<div class="lesson-workshop-foot"><a href="'+url+'" target="_blank" rel="noopener">'+L[3]+' ↗</a>'+
        '<a href="'+source+'" target="_blank" rel="noopener">'+L[2]+' ↗</a></div><p class="lesson-workshop-note">'+L[4]+'</p></div>';
      const objectives=module.querySelector('.learning-objectives');
      const target=objectives&&objectives.closest('.slide')||module.querySelector('.slide');
      if(target)target.after(slide);else module.prepend(slide);
    });
    const check=slide=>{
      if(slide.classList.contains('active')){
        const frame=slide.querySelector('iframe[data-lesson-src]');
        if(frame && !frame.src){frame.src=frame.dataset.lessonSrc;}
      }
    };
    const obs=new MutationObserver(records=>{
      records.forEach(record=>{
        if(record.target.matches&&record.target.matches('.lesson-workshop-slide'))check(record.target);
      });
    });
    document.querySelectorAll('.lesson-workshop-slide').forEach(slide=>{
      obs.observe(slide,{attributes:true,attributeFilter:['class']});
      check(slide);
    });
    if(typeof window.updateSlideDisplay==='function'){
      const current=document.querySelector('.module-slides.active');
      if(current)window.updateSlideDisplay(current);
    }
    window.addEventListener('message',event=>{
      if(event.origin!==location.origin||!event.data||event.data.type!=='SYNTHESIS_REAL_LAB_DONE')return;
      const id=Number(event.data.module);
      if(!Number.isInteger(id)||id<0||id>=25)return;
      const slide=document.querySelector('.lesson-workshop-slide[data-workshop-module="'+id+'"]');
      if(!slide)return;
      const frame=slide.querySelector('iframe');
      if(event.source!==frame.contentWindow)return;
      const label=slide.querySelector('.lesson-workshop-label');
      if(label&&!label.textContent.includes(' ✓'))label.textContent+=' ✓';
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
