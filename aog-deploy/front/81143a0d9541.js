
(function(){
  "use strict";
  var DEMO_FLAG="aogScreener.demoActive";
  var SES_DISMISS="aogDemoBannerDismissed";
  function L(en,es){ try{ return (window.lang==='es')?es:en; }catch(e){ return en; } }
  function demoOn(){ try{ return localStorage.getItem(DEMO_FLAG)==='1'; }catch(e){ return false; } }
  function onDash(){ var s=document.getElementById('screen-admin'); return !!(s && s.classList.contains('active')); }
  function dismissed(){ try{ return sessionStorage.getItem(SES_DISMISS)==='1'; }catch(e){ return false; } }
  function ensure(){
    var b=document.getElementById('aogDemoBanner'); if(b) return b;
    b=document.createElement('div'); b.id='aogDemoBanner'; b.setAttribute('hidden','');
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'+
      '<span class="adb-txt"></span>'+
      '<button type="button" class="adb-clear"></button>'+
      '<button type="button" class="adb-x" aria-label="Dismiss">&times;</button>';
    document.body.appendChild(b);
    b.querySelector('.adb-clear').addEventListener('click', function(){
      try{ if(demoOn() && typeof window.toggleDemoData==='function') window.toggleDemoData(); }catch(e){}
      sync();
    });
    b.querySelector('.adb-x').addEventListener('click', function(){
      try{ sessionStorage.setItem(SES_DISMISS,'1'); }catch(e){}
      b.setAttribute('hidden','');
    });
    return b;
  }
  function sync(){
    var b=ensure();
    if(!demoOn()){ try{ sessionStorage.removeItem(SES_DISMISS); }catch(e){} }
    if(demoOn() && onDash() && !dismissed()){
      b.querySelector('.adb-txt').textContent=L("You’re viewing sample data — not real students.","Estás viendo datos de ejemplo — no estudiantes reales.");
      b.querySelector('.adb-clear').textContent=L("Clear","Borrar");
      try{ clearTimeout(b.__hideT); }catch(e){}
      b.classList.remove('adb-out');
      b.removeAttribute('hidden');
      b.__hideT=setTimeout(function(){ b.classList.add('adb-out'); setTimeout(function(){ b.setAttribute('hidden',''); b.classList.remove('adb-out'); }, 440); }, 5000);
    } else {
      try{ clearTimeout(b.__hideT); }catch(e){}
      b.setAttribute('hidden','');
    }
  }
  window.aogDemoBannerSync=sync;
  function wrap(name){
    try{
      var o=window[name];
      if(typeof o==='function' && !o.__demoWrapped){
        var w=function(){ var r=o.apply(this,arguments); try{ sync(); }catch(e){} return r; };
        w.__demoWrapped=true; window[name]=w;
      }
    }catch(e){}
  }
  function boot(){ wrap('toggleDemoData'); wrap('aogMTSSLoadDemo'); wrap('showScreen'); sync(); }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
  try{ window.addEventListener('load', sync); }catch(e){}
})();
