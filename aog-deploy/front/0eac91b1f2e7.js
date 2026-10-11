
/* ===== AoG: view-last-results re-entry + results chart -> free previews ===== */
(function(){
  'use strict';
  var SNAP_KEY = 'aogMyResultsSnapshot';
  var liveResult = false;

  /* localized labels for the new hero entries (educator rename + Library card) */
  try{
    if(typeof I18N_UI !== 'undefined' && I18N_UI){
      I18N_UI.aog_edu_t = {en:'For educators', es:'Para educadores'};
      I18N_UI.aog_edu_s = {en:'The framework, the ecosystem map, and the full resource index.', es:'El marco, el mapa del ecosistema y el \u00edndice completo de recursos.'};
      I18N_UI.doc_print_t = {en:'For teachers: a one-page quick start', es:'Para docentes: una gu\u00eda r\u00e1pida de una p\u00e1gina'};
      I18N_UI.doc_print_s = {en:'The whole flow on one sheet \u2014 print it, email it, or post it by the classroom door. No code needed.', es:'Todo el recorrido en una hoja \u2014 impr\u00edmela, env\u00edala por correo o col\u00f3cala junto a la puerta del sal\u00f3n. Sin c\u00f3digo.'};
      I18N_UI.doc_print_b = {en:'Download the PDF \u2197', es:'Descargar el PDF \u2197'};
      I18N_UI.aog_lib_t = {en:'Library', es:'Biblioteca'};
      I18N_UI.aog_lib_s = {en:'Every chapter preview, sample lesson, and downloadable \u2014 no sign-up, no code.', es:'Vistas previas de cap\u00edtulos, lecciones de muestra y descargables \u2014 sin registro.'};
      I18N_UI.aog_dn_flow = {en:'How it works', es:'C\u00f3mo funciona'};
      I18N_UI.aog_dn_system = {en:'The whole system', es:'El sistema completo'};
      I18N_UI.aog_dn_schools = {en:'For schools & districts', es:'Para escuelas y distritos'};
      I18N_UI.aog_dn_manual = {en:'The manual', es:'El manual'};
      /* For schools & districts pane + differentiators strip (es; en falls back to inline markup) */
      I18N_UI.dm_ad_ey   = {es:'Para administradores'};
      I18N_UI.dm_ad_h    = {es:'\u00bfQu\u00e9 problema resuelve esto?'};
      I18N_UI.dm_ad_sub  = {es:'Si diriges una escuela o un distrito, este es el panorama operativo \u2014 detecci\u00f3n, niveles y seguimiento en una sola herramienta que t\u00fa mismo alojas.'};
      I18N_UI.dm_ad_p1t  = {es:'Detecci\u00f3n universal'};
      I18N_UI.dm_ad_p1s  = {es:'Cada estudiante, tres per\u00edodos al a\u00f1o, en unos cuatro minutos cada uno.'};
      I18N_UI.dm_ad_p2t  = {es:'Identificaci\u00f3n por niveles'};
      I18N_UI.dm_ad_p2s  = {es:'Puntos de corte normalizados de 0\u2013100 clasifican las respuestas en apoyo universal, dirigido e intensivo.'};
      I18N_UI.dm_ad_p3t  = {es:'Participaci\u00f3n de las familias'};
      I18N_UI.dm_ad_p3s  = {es:'El Modo familiar y los iniciadores de conversaci\u00f3n imprimibles integran a los cuidadores en el proceso.'};
      I18N_UI.dm_ad_p4t  = {es:'Monitoreo del progreso'};
      I18N_UI.dm_ad_p4s  = {es:'Crecimiento de un per\u00edodo a otro durante el a\u00f1o, por estudiante y por \u00e1rea.'};
      I18N_UI.dm_ad_p5t  = {es:'Apoyo MTSS'};
      I18N_UI.dm_ad_p5s  = {es:'Cada se\u00f1al apunta a la lecci\u00f3n exacta del curr\u00edculo que la atiende \u2014 se\u00f1al \u2192 la lecci\u00f3n correcta.'};
      I18N_UI.dm_ad_p6t  = {es:'Tendencias del sal\u00f3n'};
      I18N_UI.dm_ad_p6s  = {es:'Los resultados por clase y los promedios por \u00e1rea muestran d\u00f3nde necesita apoyo todo un grupo.'};
      I18N_UI.dm_ad_flag = {es:'Cada puntuaci\u00f3n es una <em>se\u00f1al para conversar, nunca un diagn\u00f3stico.</em> El n\u00famero te dice por d\u00f3nde empezar; el curr\u00edculo es la intervenci\u00f3n.'};
      I18N_UI.dm_ad_cta1 = {en:'Request a pilot or district licensing discussion \u2192', es:'Solicitar una prueba piloto o conversaci\u00f3n sobre licencias para distritos \u2192'};
      I18N_UI.dm_ad_cta2 = {es:'Acceso del educador \u00b7 resultados'};
      I18N_UI.dm_diff_ey = {es:'Por qu\u00e9 esto, en concreto'};
      I18N_UI.dm_diff_1t = {es:'Los adultos primero'};
      I18N_UI.dm_diff_1s = {es:'Una autorreflexión privado para adultos y herramientas de bienestar para el personal, para que quienes sostienen a los dem\u00e1s tengan apoyo antes de acompa\u00f1ar a los estudiantes.'};
      I18N_UI.dm_diff_2t = {es:'Privacidad por dise\u00f1o'};
      I18N_UI.dm_diff_2s = {es:'Las respuestas se quedan en el dispositivo; la escuela solo ve tendencias por clase, sin identificar a nadie. Nada se vende, nada se rastrea.'};
      I18N_UI.dm_diff_3t = {es:'Una biblioteca verdaderamente abierta'};
      I18N_UI.dm_diff_3s = {es:'Vistas previas de cap\u00edtulos, lecciones de muestra y descargables \u2014 sin registro, sin c\u00f3digo.'};
      I18N_UI.dm_diff_4t = {es:'\u00abEnse\u00f1a esto a continuaci\u00f3n\u00bb'};
      I18N_UI.dm_diff_4s = {es:'El panel convierte las se\u00f1ales de una clase en la pr\u00f3xima lecci\u00f3n que ense\u00f1ar \u2014 no en un n\u00famero para juzgar a un ni\u00f1o.'};
      I18N_UI.dm_diff_5t = {es:'Coherencia de cuatro pilares'};
      I18N_UI.dm_diff_5s = {es:'Identidad, autocompasi\u00f3n, perd\u00f3n y gracia \u2014 un mismo hilo de K a 12.\u00ba, sostenido por las novelas y el curr\u00edculo.'};
      I18N_UI.aog_about_tab = {en:'About', es:'Acerca de'};
      I18N_UI.aog_about_t = {en:'What it is', es:'Qu\u00e9 es'};
      I18N_UI.aog_about_s = {en:'What Architecture of Grace is \u2014 and how it\u2019s different.', es:'Qu\u00e9 es Architecture of Grace \u2014 y en qu\u00e9 se diferencia.'};
      I18N_UI.aog_about_diff_ey = {en:'The difference', es:'La diferencia'};
      I18N_UI.aog_about_diff_t = {en:'How Architecture of Grace is different', es:'En qu\u00e9 se diferencia Architecture of Grace'};
      I18N_UI.aog_about_diff_s = {en:'Where this stands apart from most SEL programs.', es:'En qu\u00e9 se distingue de la mayor\u00eda de los programas de SEL.'};
      I18N_UI.aog_about_found_s = {en:'The framework, in plain terms.', es:'El marco, en t\u00e9rminos sencillos.'};
      I18N_UI.aog_about_story_s = {en:'Who built this, and why it isn\u2019t abstract.', es:'Qui\u00e9n lo cre\u00f3 y por qu\u00e9 no es algo abstracto.'};
      I18N_UI.aog_back_about = {en:'Back to About', es:'Volver a Acerca de'};
      /* ===== School & district readiness micro-copy (added 2026-06-14) ===== */
      I18N_UI.hyb_classline    = {en:'Built for classrooms. Share via link or QR in seconds. No student accounts or logins needed.', es:'Hecho para el aula. Compártelo por enlace o código QR en segundos. Sin cuentas ni inicios de sesión para el estudiante.'};
      I18N_UI.hp_bridge        = {en:'These four pillars run through the self-reflection, lessons, novels, and conversations — so a flagged need maps directly to the <strong>exact</strong> support a student needs.', es:'Estos cuatro pilares recorren la autorreflexión, las lecciones, las novelas y las conversaciones — de modo que una necesidad señalada apunta directamente al apoyo <strong>exacto</strong> que un estudiante necesita.'};
      I18N_UI.dm_rollout       = {en:'<strong style="color:#ffffff;">Low-effort rollout:</strong> Start with one class or grade band. Scale across buildings using shared links and your own Google Sheets.', es:'<strong style="color:#ffffff;">Implementación de bajo esfuerzo:</strong> Empieza con una sola clase o nivel. Crece entre edificios con enlaces compartidos y tus propias Hojas de cálculo de Google.'};
      I18N_UI.dm_ad_aggregate  = {en:'Leadership sees only aggregate trends — never individual student responses.', es:'El liderazgo ve solo tendencias agregadas — nunca las respuestas individuales de los estudiantes.'};
      I18N_UI.w_reassure_sync  = {en:'(School-controlled sync to your Google Sheet is optional and off by default.)', es:'(La sincronización controlada por la escuela con tu Hoja de cálculo de Google es opcional y está desactivada de forma predeterminada.)'};
      I18N_UI.wp_staff_note    = {en:'Voluntary adult self-reflections available for staff wellness — no evaluation or surveillance.', es:'Autorreflexiones voluntarias para adultos, disponibles para el bienestar del personal — sin evaluación ni vigilancia.'};
      I18N_UI.dm_ad_notes_ey   = {en:'Easy to start, ready to scale', es:'Fácil de empezar, listo para crecer'};
      I18N_UI.dm_ad_scale      = {en:'<strong style="color:#ffffff;">District scale:</strong> License available via purchase order for multi-building use.', es:'<strong style="color:#ffffff;">Escala de distrito:</strong> Licencia disponible mediante orden de compra para uso en varios edificios.'};
      I18N_UI.dm_ad_train      = {en:'SEL coordinators can use demo data to train staff quickly before going live with real students.', es:'Los coordinadores de SEL pueden usar datos de demostración para capacitar al personal rápidamente antes de empezar con estudiantes reales.'};
      I18N_UI.aog_schools_nav  = {en:'For Schools', es:'Para escuelas'};
      I18N_UI.aog_schools_foot = {en:'For Schools & Districts', es:'Para escuelas y distritos'};
      I18N_UI.foot_readiness   = {en:'Updated for school readiness — June 2026', es:'Actualizado para uso escolar — junio de 2026'};
      I18N_UI.dl_path_s_btn    = {en:'Request a pilot or district licensing discussion →', es:'Solicitar una prueba piloto o conversación sobre licencias para distritos →'};
    }
  }catch(e){}

  function isES(){ try{ return typeof lang !== 'undefined' && lang === 'es'; }catch(e){ return false; } }
  function hasSnapshot(){ try{ return !!localStorage.getItem(SNAP_KEY); }catch(e){ return false; } }

  function decorateChart(rep){
    /* P0 FIX (2026-06-05): no longer mark the score/domain region as a tappable
       control. It used to add cursor:pointer + a "tap to browse previews"
       tooltip, which (combined with the click handler above) made the chart a
       hidden button that ejected users from their results. Left as a no-op so
       all existing callers keep working without re-introducing the footgun. */
    return;
  }

  function snapshotReport(){
    var rep = document.getElementById('myResultsReport');
    if(rep && rep.innerHTML && rep.innerHTML.trim().length > 40){
      try{ localStorage.setItem(SNAP_KEY, rep.innerHTML); }catch(e){}
      liveResult = true;
      decorateChart(rep);
    }
  }

  function openFreePreviews(){
    try{ if(typeof aogGoLibrary === 'function'){ aogGoLibrary(); return; } }catch(e){}
    var fs = document.getElementById('freeShelfHome');
    if(fs && fs.scrollIntoView) fs.scrollIntoView({behavior:'smooth'});
  }

  function viewLastResults(){
    if(liveResult && typeof showMyResults === 'function'){
      try{ showMyResults(); return; }catch(e){}
    }
    var rep = document.getElementById('myResultsReport');
    var snap; try{ snap = localStorage.getItem(SNAP_KEY); }catch(e){}
    if(rep && snap){ rep.innerHTML = snap; decorateChart(rep); }
    if(typeof showScreen === 'function'){ try{ showScreen('screen-myresults'); return; }catch(e){} }
    var scr = document.getElementById('screen-myresults');
    if(scr){
      document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
      scr.classList.add('active');
      try{ window.scrollTo({top:0, behavior:'smooth'}); }catch(e){}
    }
  }

  function syncLink(){
    var bar = document.getElementById('lastResultsBar');
    if(!bar) return;
    var welcome = document.getElementById('screen-welcome');
    var onWelcome = welcome && welcome.classList.contains('active');
    var show = onWelcome && (liveResult || hasSnapshot());
    bar.style.display = show ? '' : 'none';
    if(show){
      var txt = document.getElementById('lastResultsTxt');
      var btn = document.getElementById('aogLastResults');
      if(txt) txt.textContent = isES() ? 'Tu \u00faltima Vista Personal est\u00e1 guardada en este dispositivo' : 'Your last results are saved on this device';
      if(btn) btn.textContent = isES() ? 'Ver mis resultados' : 'View my results';
    }
  }

  function init(){
    // keep the sticky guide tabs offset in sync with the top bar height
    var topbar = document.querySelector('.topbar');
    function setTopbarH(){ if(topbar) document.documentElement.style.setProperty('--aog-topbar-h', topbar.offsetHeight + 'px'); }
    if(topbar){ setTopbarH(); window.addEventListener('resize', setTopbarH); }

    // About tab: drill-down between the topic index and each detail view
    window.aogAboutOpen = function(key){
      document.querySelectorAll('.about-view').forEach(function(v){ v.hidden = true; });
      var idx = document.getElementById('about-index');
      if(idx) idx.hidden = true;
      var v = document.getElementById('about-view-' + key);
      if(v){ v.hidden = false; v.scrollIntoView({ behavior:'smooth', block:'start' }); }
    };
    window.aogAboutBack = function(){
      document.querySelectorAll('.about-view').forEach(function(v){ v.hidden = true; });
      var idx = document.getElementById('about-index');
      if(idx){ idx.hidden = false; idx.scrollIntoView({ behavior:'smooth', block:'start' }); }
    };
    // whenever the About tab is (re)opened, return to the topic index
    var aboutSec = document.getElementById('screen-about');
    if(aboutSec){
      new MutationObserver(function(){
        if(aboutSec.classList.contains('active')){
          var idx = document.getElementById('about-index');
          if(idx && idx.hidden){
            document.querySelectorAll('.about-view').forEach(function(v){ v.hidden = true; });
            idx.hidden = false;
          }
        }
      }).observe(aboutSec, { attributes:true, attributeFilter:['class'] });
    }

    var btn = document.getElementById('aogLastResults');
    if(btn) btn.addEventListener('click', function(e){ e.preventDefault(); viewLastResults(); });

    var rep = document.getElementById('myResultsReport');
    if(rep){
      rep.addEventListener('click', function(e){
        /* P0 FIX (2026-06-05): Previously, a tap anywhere on the score/domain
           region called openFreePreviews() -> openGuide('library'), which
           navigated the user OFF their own results screen into the Library
           with no clear return path. To the user this looked like their
           results vanished and "could not be recovered." Genuine links/cards
           inside the report keep working; the chart region itself is no longer
           a hidden navigation button, so the session view can never be lost by
           an accidental tap. */
        return;
      });
      try{ new MutationObserver(snapshotReport).observe(rep, {childList:true, subtree:true}); }catch(e){}
      snapshotReport();
    }

    var welcome = document.getElementById('screen-welcome');
    if(welcome){
      try{ new MutationObserver(syncLink).observe(welcome, {attributes:true, attributeFilter:['class']}); }catch(e){}
    }

    /* survey back-guard: keep the browser Back button from dropping out of a self-reflection mid-way.
       Normal back behavior is unchanged on every other screen; the user leaves the survey via
       the in-page "Back to start" button or by completing it. */
    var survey = document.getElementById('screen-survey');
    function surveyActive(){ return !!(survey && survey.classList.contains('active')); }
    if(survey){
      var surveyWasActive = false;
      try{
        new MutationObserver(function(){
          var now = surveyActive();
          if(now && !surveyWasActive){ try{ history.pushState(null, '', location.href); }catch(e){} }
          surveyWasActive = now;
        }).observe(survey, {attributes:true, attributeFilter:['class']});
      }catch(e){}
      window.addEventListener('popstate', function(){
        if(surveyActive()){
          var leave = true;
          try{ leave = window.confirm(isES() ? '\u00bfSalir de la autorreflexión? Tu progreso se guarda \u2014 puedes retomarlo m\u00e1s tarde.' : 'Leave the self-reflection? Your progress is saved \u2014 you can resume it later.'); }catch(e){ leave = true; }
          if(leave){
            if(typeof resetToStart === 'function'){ try{ resetToStart(); }catch(e){} }
            return;
          }
          try{ history.pushState(null, '', location.href); }catch(e){}
        }
      });
    }

    // documentation: section buttons (show one pane at a time)
    var docNav = document.getElementById('docNav');
    if(docNav){
      var docPanes = ['dm-flow','dm-platform','dm-admin','doc-manual'];
      var showDocPane = function(key){
        docPanes.forEach(function(id){
          var el = document.getElementById(id);
          if(el) el.hidden = (id !== key);
        });
        Array.prototype.forEach.call(docNav.querySelectorAll('.docnav-btn'), function(b){
          b.classList.toggle('active', b.getAttribute('data-pane') === key);
        });
      };
      var scrollToDocNav = function(){
        try{
          var tb = document.querySelector('.topbar');
          var sub = document.querySelector('.guide-subnav');
          var off = (tb ? tb.offsetHeight : 70) + (sub ? sub.offsetHeight : 0) + 14;
          var y = docNav.getBoundingClientRect().top + window.pageYOffset - off;
          window.scrollTo({ top: Math.max(0, y), behavior:'smooth' });
        }catch(e){}
      };
      Array.prototype.forEach.call(docNav.querySelectorAll('.docnav-btn'), function(b){
        b.addEventListener('click', function(){
          showDocPane(b.getAttribute('data-pane'));
          scrollToDocNav();
        });
      });
      showDocPane('dm-flow');
      /* expose for deep links (e.g., the homepage "For schools & districts" door):
         switch to a pane and land on its content, clear of both sticky bars. */
      var scrollToEl = function(el){
        try{
          var tb = document.querySelector('.topbar');
          var sub = document.querySelector('.guide-subnav');
          var off = (tb ? tb.offsetHeight : 70) + (sub ? sub.offsetHeight : 0) + 14;
          var y = el.getBoundingClientRect().top + window.pageYOffset - off;
          window.scrollTo({ top: Math.max(0, y), behavior:'smooth' });
        }catch(e){}
      };
      try{
        window.aogShowDocPane = showDocPane;
        window.aogGoDoc = function(key){
          showDocPane(key);
          var target = document.getElementById(key) || docNav;
          requestAnimationFrame(function(){ scrollToEl(target); });
        };
      }catch(e){}
    }

    syncLink();
    try{ if(typeof applyLang === 'function') applyLang(); }catch(e){}
  }

  if(document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
