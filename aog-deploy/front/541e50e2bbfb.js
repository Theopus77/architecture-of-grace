
(function(){
 var sec=document.getElementById('one-framework'); if(!sec) return;
 function L(){return (document.documentElement.getAttribute('lang')||'en').slice(0,2)==='es'?'es':'en';}
 function apply(){var l=L();
  [].forEach.call(sec.querySelectorAll('[data-en]'),function(el){var v=el.getAttribute('data-'+l);if(v!=null)el.textContent=v;});
  [].forEach.call(sec.querySelectorAll('[data-en-html]'),function(el){var v=el.getAttribute('data-'+l+'-html');if(v!=null)el.innerHTML=v;});
 }
 try{new MutationObserver(apply).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});}catch(e){}
 apply();
})();
