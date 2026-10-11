
(function(){
  function cEs(){ try{ if(typeof dashLang!=="undefined") return dashLang==="es"; }catch(e){} return (typeof lang!=="undefined" && lang==="es"); }
  function cEsc(t){ return String(t==null?"":t).replace(/[<>&"]/g,function(c){return {"<":"&lt;",">":"&gt;","&":"&amp;","\"":"&quot;"}[c];}); }
  function cQ(s){ return String(s==null?"":s).replace(/\\/g,"\\\\").replace(/'/g,"\\'"); }
  function cStore(){ try{ var o=JSON.parse(localStorage.getItem("aog.curriculum.v1")||"{}"); if(!o.done)o.done={}; if(!o.lessons)o.lessons={}; return o; }catch(e){ return {done:{},lessons:{}}; } }
  function cSave(o){ try{ localStorage.setItem("aog.curriculum.v1", JSON.stringify(o)); }catch(e){} }
  var BAND_ORDER=["K-2","3-5","6-8","9-10","11-12"];
  function gradeToBand(g){
    g=String(g==null?"":g).trim().toUpperCase();
    if(g==="K"||g==="TK"||g==="PK") return "K-2";
    var n=parseInt(g,10); if(isNaN(n)) return null;
    if(n<=2) return "K-2"; if(n<=5) return "3-5"; if(n<=8) return "6-8"; if(n<=10) return "9-10"; return "11-12";
  }
  /* The 4-unit × 7-lesson structure per band. Prefers the full Teacher-Deck
     roster (AOG_LESSONS); falls back to the crosswalk subset for any band the
     roster doesn't cover. Lesson keys are canonical "U#·L#" so they're stable. */
  function bandUnits(band){
    var R=(window.AOG_LESSONS||{})[band];
    if(R && R.length){
      return R.map(function(u){
        return { n:u.u, theme:u.th, count:u.ls.length,
          lessons:u.ls.map(function(L){ return { key:"U"+u.u+"·L"+L[0], label:"L"+L[0]+" · "+L[1], risk:(L[2]||0) }; }) };
      }).sort(function(a,b){return a.n-b.n;});
    }
    var rows=(window.AOG_CROSSWALK||[]).filter(function(r){ return r && r.b===band; });
    var byU={}; var seen={};
    rows.forEach(function(r){
      var ls=String(r.lesson||"").trim(); var m=/^U(\d+)(?:·L(\d+))?/.exec(ls); if(!m) return;
      var u=parseInt(m[1],10); if(!byU[u]) byU[u]={n:u,count:0,theme:"",lessons:[]};
      var key=m[2]?("U"+u+"·L"+m[2]):ls;
      if(!seen[u+"|"+key]){ seen[u+"|"+key]=1; byU[u].lessons.push({ key:key, label:ls, risk:0 }); byU[u].count++; }
      if(!byU[u].theme && r.theme){ byU[u].theme=String(r.theme).split("·")[0].trim(); }
    });
    return Object.keys(byU).map(function(k){return byU[k];}).sort(function(a,b){return a.n-b.n;});
  }
  /* Per-unit progress derived from per-lesson checks. */
  function unitProgress(o, band, u){
    var lc=(o.lessons&&o.lessons[band])||{}; var t=u.lessons.length, c=0;
    u.lessons.forEach(function(L){ if(lc[L.key]) c++; });
    return { c:c, t:t, done:(t>0 && c===t) };
  }
  /* One-time store migration (stamps o._v=2). Handles both earlier formats:
     (a) legacy whole-unit "done" flags → expand to all lesson keys of the unit;
     (b) old crosswalk full-string lesson keys → canonical "U#·L#". */
  function cMigrateAll(o){
    if(o._v===2) return false;
    o.lessons=o.lessons||{};
    if(o.done){
      for(var band in o.done){
        var units=bandUnits(band); o.lessons[band]=o.lessons[band]||{};
        units.forEach(function(u){ if(o.done[band] && o.done[band][u.n]){ u.lessons.forEach(function(L){ o.lessons[band][L.key]=true; }); } });
      }
      o.done={};
    }
    for(var b in o.lessons){
      var map=o.lessons[b], nm={};
      for(var k in map){ var mm=/U(\d+)\D*?L(\d+)/.exec(k); var nk=mm?("U"+parseInt(mm[1],10)+"·L"+parseInt(mm[2],10)):k; nm[nk]=true; }
      o.lessons[b]=nm;
    }
    o._v=2; return true;
  }
  function bandsPresent(){
    var set={};
    var R=(window.AOG_LESSONS||{}); for(var b in R){ set[b]=1; }
    (window.AOG_CROSSWALK||[]).forEach(function(r){ if(r&&r.b) set[r.b]=1; });
    return BAND_ORDER.filter(function(b){ return set[b]; });
  }
  function bandLabel(b,es){ return es?("Grados "+b):("Grades "+b); }
  function defaultBand(){
    // Prefer the class's modal grade band from records; fall back to first band.
    try{
      var recs=(typeof getAllRecords==="function"?getAllRecords():[])||[];
      var tally={};
      recs.forEach(function(r){ var b=gradeToBand(r&&r.grade); if(b) tally[b]=(tally[b]||0)+1; });
      var best=null,bestN=0; for(var k in tally){ if(tally[k]>bestN){bestN=tally[k];best=k;} }
      if(best) return best;
    }catch(e){}
    var bp=bandsPresent(); return bp[0]||"K-2";
  }
  window.aogCurricSetBand=function(b){ var o=cStore(); o.band=b; window.__aogCurricOpenUnit=null; cSave(o); window.aogRenderCurriculumStrip(); };
  window.aogCurricToggleExpand=function(u){ window.__aogCurricOpenUnit=(window.__aogCurricOpenUnit===u?null:u); window.aogRenderCurriculumStrip(); };
  function cUnit(band,u){ var units=bandUnits(band); for(var i=0;i<units.length;i++){ if(units[i].n===u) return units[i]; } return null; }
  window.aogCurricToggleLesson=function(band,u,li){
    var o=cStore(); var unit=cUnit(band,u); if(!unit) return; var L=unit.lessons[li]; if(!L) return;
    o.lessons[band]=o.lessons[band]||{};
    if(o.lessons[band][L.key]) delete o.lessons[band][L.key]; else o.lessons[band][L.key]=true;
    cSave(o); window.aogRenderCurriculumStrip();
  };
  window.aogCurricMarkUnit=function(band,u,val){
    var o=cStore(); var unit=cUnit(band,u); if(!unit) return;
    o.lessons[band]=o.lessons[band]||{};
    unit.lessons.forEach(function(L){ if(val) o.lessons[band][L.key]=true; else delete o.lessons[band][L.key]; });
    cSave(o); window.aogRenderCurriculumStrip();
  };
  window.aogRenderCurriculumStrip=function(){
    var host=document.getElementById("aogCurriculumStrip"); if(!host) return;
    var scr=document.getElementById("screen-admin"); var role=(scr&&scr.getAttribute("data-role"))||"teacher";
    if(role!=="teacher"){ host.innerHTML=""; return; }   // teacher Overview only
    var es=cEs(); var o=cStore();
    var bands=bandsPresent(); if(!bands.length){ host.innerHTML=""; return; }
    var band=o.band&&bands.indexOf(o.band)>=0 ? o.band : defaultBand();
    if(bands.indexOf(band)<0) band=bands[0];
    if(cMigrateAll(o)){ cSave(o); }   // upgrade older stores → canonical lesson keys (one-time)
    var units=bandUnits(band);
    var prog={}; units.forEach(function(u){ prog[u.n]=unitProgress(o,band,u); });
    // The "in progress" unit is the lowest not-fully-taught unit in sequence.
    var curN=null; for(var i=0;i<units.length;i++){ if(!prog[units[i].n].done){ curN=units[i].n; break; } }
    var openU=window.__aogCurricOpenUnit;
    var bandChips=bands.map(function(b){
      return '<button type="button" class="cps-band'+(b===band?" active":"")+'" onclick="aogCurricSetBand(\''+cQ(b)+'\')">'+cEsc(bandLabel(b,es))+'</button>';
    }).join("");
    var nodes=units.map(function(u){
      var p=prog[u.n]; var isDone=p.done; var isCur=(u.n===curN); var partial=(p.c>0 && !isDone);
      var cls=isDone?"done":((isCur||partial)?"cur":"");
      var stat=isDone?(es?"Enseñada":"Taught"):((isCur||partial)?(es?(p.c+" de "+p.t):(p.c+" of "+p.t)):(es?"Próxima":"Ahead"));
      var mark=isDone?"✓":String(u.n);
      var lessons=p.t+" "+(es?(p.t===1?"lección":"lecciones"):(p.t===1?"lesson":"lessons"));
      var aria=(es?"Unidad ":"Unit ")+u.n+(u.theme?(" — "+u.theme):"")+", "+stat+". "+(es?"Toca para ver y marcar sus lecciones.":"Tap to open and check off its lessons.");
      return '<button type="button" class="cps-unit'+(cls?" "+cls:"")+(u.n===openU?" open":"")+'" aria-expanded="'+(u.n===openU?"true":"false")+'" title="'+cEsc(aria)+'" onclick="aogCurricToggleExpand('+u.n+')">'+
        '<span class="cps-line"></span>'+
        '<span class="cps-dot">'+mark+'</span>'+
        '<span class="cps-ul">'+(es?"Unidad ":"Unit ")+u.n+'</span>'+
        (u.theme?'<span class="cps-uth">'+cEsc(u.theme)+'</span>':'')+
        '<span class="cps-uth">'+cEsc(lessons)+'</span>'+
        '<span class="cps-ustat">'+cEsc(stat)+'</span>'+
      '</button>';
    }).join("");
    // Expanded lesson checklist for the open unit.
    var panel="";
    if(openU!=null){
      var uobj=null; for(var k=0;k<units.length;k++){ if(units[k].n===openU){ uobj=units[k]; break; } }
      if(uobj){
        var p2=prog[openU]; var lc=(o.lessons&&o.lessons[band])||{};
        var lrows=uobj.lessons.map(function(L,li){
          var on=!!lc[L.key];
          var stars=L.risk?(' <span class="cps-star">'+(L.risk>=2?"★★":"★")+'</span>'):"";
          return '<button type="button" class="cps-les'+(on?" on":"")+'" role="checkbox" aria-checked="'+(on?"true":"false")+'" onclick="aogCurricToggleLesson(\''+cQ(band)+'\','+openU+','+li+')">'+
            '<span class="cps-box">'+(on?"✓":"")+'</span><span class="cps-les-t">'+cEsc(L.label)+stars+'</span></button>';
        }).join("");
        panel='<div class="cps-panel"><div class="cps-panel-h"><span>'+(es?"Unidad ":"Unit ")+openU+(uobj.theme?(" — "+cEsc(uobj.theme)):"")+' · '+p2.c+"/"+p2.t+'</span>'+
          '<button type="button" class="cps-allbtn" onclick="aogCurricMarkUnit(\''+cQ(band)+'\','+openU+','+(p2.done?"false":"true")+')">'+(p2.done?(es?"Borrar unidad":"Clear unit"):(es?"Marcar todas":"Mark all taught"))+'</button></div>'+
          '<div class="cps-les-list">'+lrows+'</div>'+
          '<div class="cps-panel-note">'+(es?"Secuencia completa de lecciones del Teacher Deck. ★ = lección con apoyo de consejería.":"Full lesson sequence from the Teacher Deck. ★ = counselor-supported lesson.")+'</div></div>';
      }
    }
    var doneCount=units.filter(function(u){return prog[u.n].done;}).length;
    var summary;
    if(doneCount===units.length){ summary=(es?"Las "+units.length+" unidades están enseñadas — secuencia completa 🎉":"All "+units.length+" units taught — sequence complete 🎉"); }
    else {
      var aheadNs=units.filter(function(u){return u.n!==curN && !prog[u.n].done;}).map(function(u){return u.n;});
      var aheadTxt = aheadNs.length ? (es?(" · Unidad"+(aheadNs.length>1?"es ":" ")+aheadNs.join("–")+" por delante"):(" · Unit"+(aheadNs.length>1?"s ":" ")+aheadNs.join("–")+" ahead")) : "";
      summary=(es?("Unidad "+curN+" en curso"):("Unit "+curN+" in progress"))+aheadTxt;
    }
    host.innerHTML='<div class="cps"><div class="cps-h"><div class="cps-t">'+(es?"Progreso del currículo":"Curriculum progress")+'</div></div>'+
      '<div class="cps-sub">'+(es?"La posición de tu clase en la secuencia de "+units.length+" unidades de esta banda. Toca una unidad para marcar sus lecciones — se guarda solo en este dispositivo.":"Your class’s place in this band’s "+units.length+"-unit sequence. Tap a unit to check off its lessons — saved on this device only.")+'</div>'+
      '<div class="cps-bands">'+bandChips+'</div>'+
      '<div class="cps-track">'+nodes+'</div>'+
      panel+
      '<div class="cps-foot"><div class="cps-summary">'+summary+'</div><div class="cps-hint">'+(es?"Toca una unidad para ver sus lecciones":"Tap a unit to open its lessons")+'</div></div>'+
    '</div>';
  };
  function cboot(){ try{ if(typeof window.aogRenderCurriculumStrip==="function") window.aogRenderCurriculumStrip(); }catch(e){} }
  if(document.readyState!=='loading') cboot(); else document.addEventListener('DOMContentLoaded',cboot);
})();
