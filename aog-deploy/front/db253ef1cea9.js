
(function(){var ids=['aog-evidence','aog-pilot-look'];
 function L(){return (document.documentElement.getAttribute('lang')||'en').slice(0,2)==='es'?'es':'en';}
 function apply(){var l=L();ids.forEach(function(id){var sec=document.getElementById(id);if(!sec)return;[].forEach.call(sec.querySelectorAll('[data-en]'),function(e){var v=e.getAttribute('data-'+l);if(v!=null)e.innerHTML=v;});});}
 try{new MutationObserver(apply).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});}catch(e){}
 apply();})();
