
(function(){
 window.AOG_FIRSTVISIT_HINT = false;   /* the "New here?" bar on the welcome screen */
 function es(){return (document.documentElement.getAttribute('lang')||'en').slice(0,2)==='es';}
 function bandHTML(){
  var e=es();
  return '<div class="aog-nextband" role="region" aria-label="'+(e?'Siguiente paso':'Next step')+'">'
   +'<h3>'+(e?'\u00bfListo para probarlo?':'Ready to try it?')+'</h3>'
   +'<p>'+(e?'Cinco minutos, sin cuentas, privado por dise\u00f1o.':'Five minutes, no accounts, private by design.')+'</p>'
   +'<div class="row">'
   +'<a class="g" role="button" tabindex="0" onclick="if(typeof startCheckin===\'function\')startCheckin();">'+(e?'Hacer un check-in \u2192':'Start a check-in \u2192')+'</a>'
   +'<a class="h" role="button" tabindex="0" onclick="if(typeof openFamily===\'function\')openFamily();">'+(e?'Modo Familia \u2192':'Family Mode \u2192')+'</a>'
   +'<a class="h" role="button" tabindex="0" onclick="if(typeof aogGoPilot===\'function\')aogGoPilot();">'+(e?'Piloto para escuelas \u2192':'Pilot for schools \u2192')+'</a>'
   +'</div></div>';
 }
 function renderBands(){
  ['screen-framework','screen-ecosystem'].forEach(function(id){
   var sec=document.getElementById(id); if(!sec) return;
   var old=sec.querySelector('.aog-nextband'); if(old) old.parentNode.removeChild(old);
   var d=document.createElement('div'); d.innerHTML=bandHTML(); sec.appendChild(d.firstChild);
  });
 }
 function renderHint(){
  /* Retired 2026-08-25 at Jimmy's request: the welcome screen already carries a
     Start Here button in the topbar and a Start Here link under the hero, and a
     third prompt for the same door was noise. Behind a switch, not deleted. */
  if(!window.AOG_FIRSTVISIT_HINT) return;
  try{ if(localStorage.getItem('aog.fv.hint')==='off') return; }catch(e){}
  var w=document.getElementById('screen-welcome'); if(!w||document.getElementById('aogFvHint')) return;
  var e=es();
  var d=document.createElement('div'); d.className='aog-fv'; d.id='aogFvHint';
  d.innerHTML='<span>'+(e?'\u00bfPrimera vez aqu\u00ed?':'New here?')+'</span> <a id="aogFvGo" role="button" tabindex="0">'+(e?'\u201cEmpieza aqu\u00ed\u201d te orienta en 30 segundos \u2192':'\u201cStart Here\u201d sorts you out in 30 seconds \u2192')+'</a> <button id="aogFvX" type="button" aria-label="'+(e?'Cerrar':'Dismiss')+'">\u00d7</button>';
  w.insertBefore(d,w.firstChild);
  function off(){ try{localStorage.setItem('aog.fv.hint','off');}catch(e){} if(d.parentNode)d.parentNode.removeChild(d); }
  d.querySelector('#aogFvGo').addEventListener('click',function(){ if(typeof openStartHere==='function')openStartHere(); off(); });
  d.querySelector('#aogFvX').addEventListener('click',off);
 }
 function refreshHintLang(){ var d=document.getElementById('aogFvHint'); if(d){ d.parentNode.removeChild(d); renderHint(); } }
 function init(){ renderBands(); renderHint(); }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
 try{ new MutationObserver(function(){ renderBands(); refreshHintLang(); }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']}); }catch(e){}
})();
