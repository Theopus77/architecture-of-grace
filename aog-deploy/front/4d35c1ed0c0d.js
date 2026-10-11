
(function(){
  function L(en,es){ return (typeof lang!=="undefined"&&lang==="es")?es:en; }
  var DOMS={ A:{c:"#E08A6B",en:"regulation & well-being",es:"regulación y bienestar"},
             B:{c:"#7FBE8C",en:"self-compassion",es:"autocompasión"},
             C:{c:"#8FB4E6",en:"social & repair",es:"relación y reparación"} };
  var pool=null, idx=0, srOpen=false;
  function buildPool(){
    var D=window.AOG_CS_DATA; if(!D||!D.adult) return null;
    var out=[]; ["A","B","C"].forEach(function(d){ (D.adult[d]||[]).forEach(function(p){ out.push({d:d,en:p.en,es:p.es}); }); });
    return out.length?out:null;
  }
  function render(){
    var host=document.getElementById("staffReset"); if(!host) return;
    if(!pool) pool=buildPool();
    if(!pool){ host.hidden=true; return; }
    host.hidden=false;
    host.classList.toggle("sr-collapsed", !srOpen);
    var p=pool[((idx%pool.length)+pool.length)%pool.length];
    host.innerHTML =
      '<div class="sr-head"><button type="button" class="sr-toggle" onclick="aogStaffResetToggle()" aria-expanded="'+(srOpen?"true":"false")+'"><span class="sr-ey">'+L("Staff reset","Pausa del equipo")+'</span><span class="sr-chev" aria-hidden="true">'+(srOpen?"▾":"▸")+'</span></button>'+
        '<div class="sr-ctl">'+
          (srOpen?('<button type="button" class="sr-btn" onclick="aogStaffResetStep(-1)" aria-label="'+L("Previous","Anterior")+'">‹</button>'+
          '<button type="button" class="sr-btn" onclick="aogStaffResetStep(1)">'+L("Next","Siguiente")+' ›</button>'+
          '<button type="button" class="sr-btn" onclick="aogStaffResetShuffle()" aria-label="'+L("Shuffle","Otra")+'">↻</button>'):'')+
        '</div></div>'+
      (srOpen?('<div class="sr-q">'+ L(p.en,p.es) +'</div>'+
      '<div class="sr-foot">'+L("A question to open your meeting with — pass it around the room.","Una pregunta para abrir la reunión — pásala por la sala.")+
        ' <span class="sr-dom" style="color:'+DOMS[p.d].c+'">· '+L(DOMS[p.d].en,DOMS[p.d].es)+'</span></div>'):'');
  }
  window.aogStaffResetToggle=function(){ srOpen=!srOpen; render(); };
  window.aogStaffResetStep=function(n){ if(!pool)pool=buildPool(); if(pool){ idx+=n; } render(); };
  window.aogStaffResetShuffle=function(){ if(!pool)pool=buildPool(); if(pool){ idx=Math.floor(Math.random()*pool.length); } render(); };
  window.aogStaffResetRender=render;
  function init(){
    pool=buildPool();
    if(pool){ var d=new Date(); idx=(d.getFullYear()*366 + d.getMonth()*31 + d.getDate()) % pool.length; }
    render();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
  document.addEventListener("click",function(e){
    if(!e.target.closest) return;
    if(e.target.closest('.tab[data-tab="overview"]')) setTimeout(render,0);
    if(e.target.closest('[onclick*="setLang"],[data-lang],.lang-btn,#langEN,#langES')) setTimeout(render,40);
  });
})();
