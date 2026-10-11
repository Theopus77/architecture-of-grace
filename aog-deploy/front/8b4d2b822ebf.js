
/* ===== QUICK START (Dashboard) · strings + button helpers =============
   Mirrors the file's existing late-binding i18n pattern. EN text is already
   inline in the markup, so if anything here fails the card still reads in
   English — nothing breaks. ES is added to DASH_I18N for the dashboard
   language toggle. =================================================== */
(function(){
  try{
    if (typeof DASH_I18N !== "undefined"){
      DASH_I18N.qs_eyebrow = {en:"In 4 steps", es:"En 4 pasos"};
      DASH_I18N.qs_title   = {en:"How the dashboard works", es:"Cómo funciona el panel"};
      DASH_I18N.qs_glossary = {en:"📖 Shared Language", es:"📖 Lenguaje compartido"};
      DASH_I18N.qs_lede    = {en:"This is your teacher view — class trends and each student’s report. When someone finishes a self-reflection, they see their own personal report right away, and it comes to you here when it’s on a class computer or your shared link. Here’s the whole flow at a glance — a self-reflection, not an exam.", es:"Esta es tu vista de docente — tendencias de la clase y el informe de cada estudiante. Cuando alguien termina una autorreflexión, ve su propio informe personal de inmediato, y te llega aquí cuando es en una computadora de la clase o tu enlace compartido. Aquí está todo el recorrido de un vistazo — una autorreflexión, no un examen."};
      DASH_I18N.qs_s1_t    = {en:"Hand it out", es:"Repártelo"};
      DASH_I18N.qs_s1_s    = {en:"Open <strong>Distribute</strong> to create a link or QR code for your class. Students open it on their own device — no logins to set up.", es:"Abre <strong>Distribuir</strong> para crear un enlace o código QR para tu clase. Los estudiantes lo abren en su propio dispositivo — sin inicios de sesión que configurar."};
      DASH_I18N.qs_s1_b    = {en:"Go to Distribute →", es:"Ir a Distribuir →"};
      DASH_I18N.qs_s2_t    = {en:"They check in privately", es:"Hacen la autorreflexión en privado"};
      DASH_I18N.qs_s2_s    = {en:"Each student answers their own self-reflection. Their results sync back only through the link or QR code you shared — nothing else travels with it.", es:"Cada estudiante responde su propia autorreflexión. Sus resultados se sincronizan solo a través del enlace o código QR que compartiste — nada más viaja con él."};
      DASH_I18N.qs_s3_t    = {en:"Read the group", es:"Lee al grupo"};
      DASH_I18N.qs_s3_s    = {en:"<strong>Overview</strong> sums up the whole group; <strong>Class trends</strong> shows which areas to focus on next. Use these to plan your teaching, not to grade.", es:"<strong>Resumen</strong> resume al grupo entero; <strong>Tendencias de la clase</strong> muestra en qué áreas enfocarse. Úsalas para planificar tu enseñanza, no para calificar."};
      DASH_I18N.qs_s3_b    = {en:"Go to Class trends →", es:"Ir a Tendencias de la clase →"};
      DASH_I18N.qs_s4_t    = {en:"Open the conversation", es:"Abre la conversación"};
      DASH_I18N.qs_s4_s    = {en:"Go to <strong>Student view</strong> to read any student’s full self-reflection — their answers, their words, and conversation starters. Use <strong>Open report</strong> or <strong>Export PDF</strong> for one student at a time.", es:"Ve a <strong>Vista del estudiante</strong> para leer la autorreflexión completo de cualquier estudiante — sus respuestas, sus palabras y los iniciadores de conversación. Usa <strong>Abrir informe</strong> o <strong>Exportar PDF</strong> para un estudiante a la vez."};
      DASH_I18N.qs_s4_b    = {en:"Go to Student view →", es:"Ir a Vista del estudiante →"};
      DASH_I18N.qs_replay  = {en:"Replay the guided tour", es:"Repetir el recorrido guiado"};
      DASH_I18N.qs_demo    = {en:"Explore with demo data", es:"Explorar con datos de ejemplo"};
      DASH_I18N.qs_print   = {en:"Download the one-pager (PDF) ↗", es:"Descargar la guía de una página (PDF) ↗"};
      DASH_I18N.qs_note    = {en:"<strong>No code needed.</strong> Privacy lives in the link — results sync only when someone opens a private link you share, never just by opening this dashboard.", es:"<strong>No se necesita código.</strong> La privacidad vive en el enlace: los resultados se sincronizan solo cuando alguien abre un enlace privado que compartes, nunca con solo abrir este panel."};
    }
  }catch(e){}

  /* jump to a dashboard tab by clicking its real tab button (no internal-name coupling),
     then scroll the tab row into view so the switch is visible (otherwise it looks like
     nothing happened — the panel changes far below the fold). */
  window.aogQsTab = function(name){
    try{
      /* Land in the door that owns the tab first, so the door row and the
         panel agree — the modes layer ignores synthetic tab clicks on
         purpose (2026-08-27), so a bare .click() left the row on the old
         door with the target tab hidden. 2026-08-28. */
      try{
        var dm = window.__aogDashModes, modes = dm && dm.modes;
        if (modes && window.aogSetDashMode){
          for (var mk in modes){
            if (modes[mk].indexOf(name) !== -1){ if (dm.get() !== mk) window.aogSetDashMode(mk); break; }
          }
        }
      }catch(_m){}
      var t = document.querySelector('.tab[data-tab="' + name + '"]');
      if (t){
        t.click();
        var row = t.closest('.tabs') || t;
        setTimeout(function(){
          try{ window.scrollTo({ top: 0, behavior: "instant" }); }catch(_e){ try{ window.scrollTo(0,0); }catch(__e){} }
        }, 60);
      }
    }catch(e){}
  };
  /* .30gz · the dashboard tab trail — Back walks the tabs you actually visited
     before it ever leaves the dashboard (Jimmy 2026-09-05: "hit back and it
     brings you back to the home screen not the prior page"). Records on every
     user or synthetic .tab click, capture phase so the outgoing tab is still
     .active; goBack() pops it. __aogTabNav guards the pop from re-recording. */
  window.__aogTabTrail = window.__aogTabTrail || [];
  document.addEventListener("click", function(ev){
    try{
      if (window.__aogTabNav) return;
      var t = ev.target && ev.target.closest ? ev.target.closest("#screen-admin .tab[data-tab], #tabMoreMenu .tab[data-tab]") : null;
      if (!t) return;
      var cur = document.querySelector("#screen-admin .tabs .tab.active, #tabMoreMenu .tab.active");
      var curName = cur ? cur.getAttribute("data-tab") : "";
      var nextName = t.getAttribute("data-tab") || "";
      if (!curName || curName === nextName) return;
      var tr = window.__aogTabTrail;
      if (tr[tr.length-1] !== curName) tr.push(curName);
      if (tr.length > 30) tr.shift();
    }catch(e){}
  }, true);
  window.aogQsTour = function(){
    try{ if (typeof startTour === "function") startTour("dash"); }catch(e){}
  };
  /* Jump straight to the dashboard's Alignment & Crosswalks tab from anywhere
     (Explore menu, or a shareable #alignment / #crosswalks link). Forces the
     Teacher role so the tab is visible regardless of the current view. */
  window.aogOpenAlignment = function(){
    try{ if (typeof aogCloseExplore === "function") aogCloseExplore(); }catch(e){}
    try{ if (typeof openAdmin === "function") openAdmin(); }catch(e){}
    try{ if (typeof aogSetDashRole === "function") aogSetDashRole("teacher"); }catch(e){}
    setTimeout(function(){ try{ if (typeof aogQsTab === "function") aogQsTab("align"); }catch(e){} }, 260);
    /* AOG-XWALK-SOLO-V1 (2026-09-25) — Jimmy: "Can the dashboard be removed on top of
       the CROSS WALK?" Opened from a door, Explore or a link, the Crosswalk stands
       alone: the dashboard's header, greeting and tab rows step aside. Opening the
       dashboard itself, or any other screen, brings them back. */
    /* the old aogCloseExplore() toggles the new bar's menu OPEN; shut every bar menu outright */
    function shut(){ try{ document.querySelectorAll('.aogtop-menu').forEach(function(m){ m.hidden = true; });
      document.querySelectorAll('.aogtop [aria-expanded="true"]').forEach(function(b){ b.setAttribute('aria-expanded','false'); }); }catch(e){} }
    shut(); setTimeout(shut, 60); setTimeout(shut, 400);
    try { window.__xsAt = Date.now(); document.body.classList.add("aog-xwalk-solo"); window.scrollTo(0,0);
          setTimeout(function(){ document.body.classList.add("aog-xwalk-solo"); window.scrollTo(0,0); }, 320); } catch(e){}
  };
  (function(){
    function off(){ try{ if (Date.now() - (window.__xsAt||0) < 1200) return; document.body.classList.remove("aog-xwalk-solo"); }catch(e){} }
    var wrapT = setInterval(function(){
      if (typeof window.showScreen !== "function" || window.showScreen.__xs) return;
      /* AOG-BAR-SHUT-V1 — moving to a screen always leaves the Explore menu shut. Old
         screen code "closes" the retired menu by clicking its button, and the new bar
         (which adopted that button) read the click as "open". */
      function shutBar(){ try{ document.querySelectorAll('.aogtop-menu').forEach(function(m){ m.hidden = true; });
        document.querySelectorAll('.aogtop [aria-expanded="true"]').forEach(function(b){ b.setAttribute('aria-expanded','false'); }); }catch(e){} }
      var o = window.showScreen; window.showScreen = function(){ off(); var r = o.apply(this, arguments); shutBar(); setTimeout(shutBar, 60); setTimeout(shutBar, 450); return r; }; window.showScreen.__xs = 1;
      var oa = window.openAdmin; if (typeof oa === "function" && !oa.__xs){ window.openAdmin = function(){ off(); return oa.apply(this, arguments); }; window.openAdmin.__xs = 1; }
      clearInterval(wrapT);
    }, 300);
    window.addEventListener("hashchange", function(){ var h=(location.hash||"").toLowerCase(); if(h!=="#alignment"&&h!=="#crosswalks"&&h!=="#align") off(); });
    /* Back and Forward: leave solo, and bring the screen back to life */
    function leave(){ var h=(location.hash||"").toLowerCase(); if(h==="#alignment"||h==="#crosswalks"||h==="#align") return;
      window.__xsAt = 0; document.body.classList.remove("aog-xwalk-solo"); }
    /* Back from the Crosswalk used to land on its own #crosswalks entry, which opened
       it again, so Back looked dead. Back on that entry now steps once more. */
    window.addEventListener("popstate", function(e){
      var h=(location.hash||"").toLowerCase();
      if ((h==="#alignment"||h==="#crosswalks"||h==="#align") && document.body.classList.contains("aog-xwalk-solo")){
        try{ if (e && e.stopImmediatePropagation) e.stopImmediatePropagation(); }catch(x){}
        window.__xsAt = 0; document.body.classList.remove("aog-xwalk-solo"); window.__xsBack = 1; setTimeout(function(){ window.__xsBack = 0; }, 700); history.back(); return; }
      setTimeout(leave, 0); setTimeout(leave, 300); }, true);
    window.addEventListener("hashchange", function(){ setTimeout(leave, 0); });
    window.addEventListener("pageshow", function(e){ if (e.persisted){ window.__xsAt = 0; off(); } });
  })();
  (function(){
    function routeAlign(){ var h=(location.hash||"").toLowerCase(); if(window.__xsBack) return; if(h==="#alignment"||h==="#crosswalks"||h==="#align"){ setTimeout(function(){ if(window.aogOpenAlignment) window.aogOpenAlignment(); }, 140); } }
    window.addEventListener("hashchange", routeAlign);
    if(document.readyState!=="loading") routeAlign(); else document.addEventListener("DOMContentLoaded", routeAlign);
  })();
  window.aogQsDemo = function(){
    try{ if (typeof toggleDemoData === "function") toggleDemoData(); }catch(e){}
    try{
      var on=false; try{ on = localStorage.getItem(DEMO_FLAG)==="1"; }catch(_e){}
      var es=(typeof dashLang!=="undefined" && dashLang==="es");
      setTimeout(function(){ document.querySelectorAll('[data-dl="qs_demo"]').forEach(function(b){ b.textContent = on ? (es?"Borrar datos de demostraci\u00f3n":"Clear demo data") : (es?"Explorar con datos de demostraci\u00f3n":"Explore with demo data"); }); },60);
      var tgt=document.querySelector('#screen-admin .tabs');
      if(tgt){ if(tgt.scrollIntoView) tgt.scrollIntoView({behavior:"smooth",block:"start"}); tgt.classList.remove('aog-demo-flash'); void tgt.offsetWidth; tgt.classList.add('aog-demo-flash'); setTimeout(function(){ tgt.classList.remove('aog-demo-flash'); },1700); }
    }catch(_e2){}
  };
  /* Dashboard-side printable: matches the DASHBOARD language toggle (dashLang). */
  window.aogQsPrintable = function(a){
    try{
      var es = (typeof dashLang !== "undefined" && dashLang === "es");
      if (a) a.href = es ? "AoG-Guia-Rapida-Docentes.pdf" : "AoG-Teacher-QuickStart.pdf";
    }catch(e){}
    return true;
  };
  /* Open the printable one-pager that matches the SITE language (public side).
     Falls back to the English PDF (the href) if anything here fails. */
  window.aogOpenQuickStart = function(a){
    try{
      var es = (typeof lang !== "undefined" && lang === "es");
      if (a) a.href = es ? "AoG-Guia-Rapida-Docentes.pdf" : "AoG-Teacher-QuickStart.pdf";
    }catch(e){}
    return true;
  };
  /* Deep link target for #quickstart : open the Guide's docs and bring the
     teacher printable CTA into view with a brief highlight. Used by the hash
     router so a coordinator can email architectureofgrace.com/#quickstart. */
  window.aogGoQuickStart = function(){
    try{ if (typeof openGuide === "function") openGuide("docs"); }catch(e){}
    /* the printable CTA now lives inside the "How it works" (dm-flow) pane, so
       make sure that pane is active before scrolling to it. */
    try{ if (typeof aogShowDocPane === "function") aogShowDocPane("dm-flow"); }catch(e){}
    var tries = 0;
    (function find(){
      var el = document.querySelector(".doc-print-cta");
      if (el && el.offsetParent !== null){
        try{ el.scrollIntoView({behavior:"smooth", block:"center"}); }
        catch(e){ try{ el.scrollIntoView(); }catch(_){} }
        el.classList.add("dpc-flash");
        setTimeout(function(){ try{ el.classList.remove("dpc-flash"); }catch(e){} }, 2200);
      } else if (tries++ < 25){
        setTimeout(find, 120);
      }
    })();
  };
})();
