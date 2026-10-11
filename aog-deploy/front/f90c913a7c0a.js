
/* ===== Calm Down / Regulation Station Mode ===== */
(function(){
  "use strict";
  function isES(){ return (typeof lang !== "undefined" && lang === "es"); }

  /* Tiles reuse the site's existing regulation tools via window.toolOpen(). */
  var STATION_TILES = [
    { key:"breathing", ic:"🫁", en:"Breathing",     es:"Respiración" },
    { key:"rainbow",   ic:"🌈", en:"Rainbow Breath", es:"Respiración arcoíris" },
    { key:"take5",     ic:"🖐️", en:"Take 5",        es:"Toma 5" },
    { key:"grounding", ic:"🌿", en:"5-4-3-2-1",      es:"5-4-3-2-1" },
    { key:"movement",  ic:"🏃", en:"Move & Shake",   es:"Muévete" },
    { key:"animalyoga",ic:"🦁", en:"Animal Yoga",    es:"Yoga animal" },
    { key:"calmjar",   ic:"🫙", en:"Calm Jar",       es:"Frasco de calma" },
    { key:"bilateral", ic:"🦋", en:"Butterfly Hug",  es:"Abrazo mariposa" },
    { key:"tappad",    ic:"👆", en:"Tap Pad",        es:"Toca el ritmo" },
    { key:"feelwheel", ic:"🎡", en:"Feelings Wheel", es:"Rueda de emociones" }
  ];

  var ST_COPY = {
    back:    { en:"Back", es:"Volver" },
    brand:   { en:"Quiet Space", es:"Espacio tranquilo" },
    title:   { en:"Take a moment", es:"Tómate un momento" },
    sub:     { en:"Let's see what's happening right now. Four quick taps, then one thing to try.",
               es:"Veamos qué está pasando ahora mismo. Cuatro toques rápidos y una cosa para probar." },
    or:      { en:"More ways to settle — pick any that helps", es:"Más maneras de calmarte — elige la que ayude" },
    foot:    { en:"Take your time, and tap Back when you're ready to return.",
               es:"Tómate tu tiempo y toca Volver cuando estés listo/a para regresar." },
    shared:  { en:"This is a shared calm-down device. It starts fresh for the next person and remembers nothing about you.",
               es:"Este es un dispositivo compartido para calmarse. Empieza de nuevo para la siguiente persona y no recuerda nada de ti." }
  };
  var _rnHome = null;  /* remembers where #rightNowWrap lives on the page */

  function renderTiles(){
    var grid = document.getElementById("aog-st-grid");
    if (!grid) return;
    var L = isES() ? "es" : "en";
    grid.innerHTML = STATION_TILES.map(function(t){
      return '<button type="button" class="aog-st-tile" role="listitem" '
        + 'onclick="if(window.toolOpen){window.toolOpen(\'' + t.key + '\');}">'
        + '<span class="ic" aria-hidden="true">' + t.ic + '</span>'
        + '<span class="lbl">' + (t[L] || t.en) + '</span>'
        + '</button>';
    }).join("");
  }

  function applyCopy(){
    var L = isES() ? "es" : "en";
    document.querySelectorAll('#aog-station [data-aog-st]').forEach(function(el){
      var k = el.getAttribute('data-aog-st');
      if (ST_COPY[k] && ST_COPY[k][L]) el.textContent = ST_COPY[k][L];
    });
  }

  window.showStationMode = function(){
    var el = document.getElementById("aog-station");
    if (!el) return;
    /* Relocate the real Right Now self-reflection into the kiosk as its centerpiece.
       Event listeners stay attached to the node when it's moved. */
    try {
      var rnWrap = document.getElementById("rightNowWrap");
      var host = document.getElementById("aog-st-rn-host");
      if (rnWrap && host && rnWrap.parentNode !== host) {
        _rnHome = { parent: rnWrap.parentNode, next: rnWrap.nextSibling };
        host.appendChild(rnWrap);
      }
      if (rnWrap) rnWrap.classList.add("in");            /* defeat fade-in-on-scroll while embedded */
      if (typeof window.aogRnReset === "function") window.aogRnReset(false);   /* fresh for each student */
      if (typeof window.aogRenderRightNow === "function") window.aogRenderRightNow();
    } catch(e){}
    renderTiles(); applyCopy();
    el.hidden = false;
    el.classList.add("open");
    el.classList.remove("options-open");   /* round 2 (full activity wall) starts hidden */
    /* Re-root to <body> so position:fixed is viewport-relative even if an ancestor
       has a transform/filter (an iOS Safari quirk that let the site bar peek above). */
    try { if (el.parentNode !== document.body) document.body.appendChild(el); } catch(e){}
    /* Hide the site top bar while the calm kiosk is open (belt-and-suspenders vs. peek). */
    try { document.documentElement.classList.add("aog-station-open"); } catch(e){}
    try { document.documentElement.style.overflow = "hidden"; document.body.style.overflow = "hidden"; } catch(e){}
    el.setAttribute("tabindex","-1");
    try { el.scrollTop = 0; } catch(e){}
    try { el.focus(); } catch(e){}
    /* Deep-linkable + browser-Back closes it: push a #quiet-space history entry. */
    try { if ((location.hash || "").replace(/^#/, "").toLowerCase() !== "quiet-space") history.pushState({ aogStation: 1 }, "", "#quiet-space"); } catch(e){}
  };

  /* Round 2: once the first reset has produced a suggestion, open the full
     activity wall. Called from the Right Now result renderer. */
  window.aogStationRevealOptions = function(){
    var el = document.getElementById("aog-station");
    if (el && el.classList.contains("open")) el.classList.add("options-open");
  };

  window.closeStationMode = function(){
    var el = document.getElementById("aog-station");
    if (!el) return;
    /* Put the Right Now self-reflection back where it lives on the page */
    try {
      var rnWrap = document.getElementById("rightNowWrap");
      if (_rnHome && rnWrap) { _rnHome.parent.insertBefore(rnWrap, _rnHome.next); _rnHome = null; }
      if (typeof window.aogRnReset === "function") window.aogRnReset(false);
    } catch(e){}
    el.classList.remove("open");
    el.classList.remove("options-open");
    el.hidden = true;
    try { document.documentElement.classList.remove("aog-station-open"); } catch(e){}
    try { document.documentElement.style.overflow = ""; document.body.style.overflow = ""; } catch(e){}
    /* Clear the #quiet-space hash if we left it open (no extra history noise). */
    try { if ((location.hash || "").replace(/^#/, "").toLowerCase() === "quiet-space") history.replaceState(null, "", location.pathname + location.search); } catch(e){}
  };

  /* "Do a quick self-reflection" — close kiosk and open the existing Right Now flow */
  window.aogStationCheckIn = function(){
    window.closeStationMode();
    if (typeof window.openRightNow === "function") {
      setTimeout(function(){ try { window.openRightNow(); } catch(e){} }, 60);
    }
  };

  /* Esc exits station mode */
  document.addEventListener("keydown", function(e){
    if (e.key === "Escape") {
      var el = document.getElementById("aog-station");
      if (el && el.classList.contains("open")) window.closeStationMode();
    }
  });

  /* Auto-open via URL: ?station=true or ?mode=station */
  window.addEventListener("load", function(){
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get("station") === "true" || params.get("mode") === "station") {
        setTimeout(window.showStationMode, 350);
      }
    } catch(e){}
  });

  /* Teacher: generate a QR code that opens this page straight into Station Mode */
  window.generateStationQR = function(){
    var base = window.location.origin + window.location.pathname;
    var stationUrl = base + "?station=true";
    var es = isES();
    var c = document.getElementById("aog-qr-container");
    if (!c) return;
    c.classList.remove("hidden");
    c.innerHTML =
      '<div style="font-weight:800;margin-bottom:10px;">' + (es ? "Escanea para abrir el rincón de calma" : "Scan to open the Calming Corner") + '</div>'
      + '<img src="https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=' + encodeURIComponent(stationUrl) + '" '
      + 'style="width:190px;height:190px;border:1px solid var(--rule,#E4DAC5);border-radius:14px;" '
      + 'alt="' + (es ? "Código QR de la estación de calma" : "QR code for the Calm Down Station") + '">'
      + '<div class="qr-url">' + stationUrl + '</div>';
  };
})();
