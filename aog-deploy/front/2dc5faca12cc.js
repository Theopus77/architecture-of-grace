
(function(){
 var f=document.getElementById('aogPilotForm'); if(!f) return;
 function L(){return (document.documentElement.getAttribute('lang')||'en').slice(0,2)==='es'?'es':'en';}
 function applyLang(){var l=L();var sec=document.getElementById('aog-pilot-form');if(!sec)return;
  [].forEach.call(sec.querySelectorAll('[data-en]'),function(e){var v=e.getAttribute('data-'+l);if(v!=null)e.innerHTML=v;});
  [].forEach.call(sec.querySelectorAll('[data-ph-en]'),function(e){var v=e.getAttribute('data-ph-'+l);if(v!=null)e.setAttribute('placeholder',v);});
 }
 try{new MutationObserver(function(){applyLang();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});}catch(e){}
 applyLang();
 f.addEventListener('submit',function(e){
   e.preventDefault();
   var body=new URLSearchParams(new FormData(f)).toString();
   var done=function(){f.style.display='none';var t=document.getElementById('aogPilotThanks');if(t)t.style.display='block';};
   fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body}).then(done).catch(done);
 });
})();
