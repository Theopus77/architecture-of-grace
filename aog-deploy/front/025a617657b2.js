
/* Global net: translate ANY [data-en]/[data-es] pair on lang change (covers strings outside the scoped observers). */
(function(){
 function apply(){
  var l=(document.documentElement.getAttribute('lang')||'en').slice(0,2)==='es'?'es':'en';
  [].forEach.call(document.querySelectorAll('[data-en]'),function(el){var v=el.getAttribute('data-'+l);if(v!=null)el.innerHTML=v;});
 }
 try{new MutationObserver(apply).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});}catch(e){}
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply); else apply();
 window.aogApplyDataEn=apply;
})();
