
(function(){var sec=document.getElementById('aog-faq');if(!sec)return;
 function L(){return (document.documentElement.getAttribute('lang')||'en').slice(0,2)==='es'?'es':'en';}
 function apply(){var l=L();[].forEach.call(sec.querySelectorAll('[data-en]'),function(e){var v=e.getAttribute('data-'+l);if(v!=null)e.innerHTML=v;});}
 try{new MutationObserver(apply).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});}catch(e){}
 apply();})();
