/* =====================================================================
   ARCHITECTURE OF GRACE · polish.js
   Behaviour for the pilot-feedback fixes. ES5, defensive, additive.
     1) Intensity space-reserve (kills the mobile nav jump)
     2) (hero mobile rhythm is CSS-only; scroll-fade was removed)
     3) Dashboard "Your data on this device" wiring (counts + actions)
     4) First-run nudge
     5) Save-to-homescreen after first completion (PWA)
     6) Keyboard nav for card pickers (mode / choose / PECS)
   ===================================================================== */
(function () {
  'use strict';

  function L() { try { if (typeof lang !== "undefined" && lang) return lang; } catch (e) {} return "en"; }
  function t(en, es) { return L() === "es" ? es : en; }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function reduceMotion() { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }

  var K_RESULTS = "aogScreener.v2.results";
  var K_FAMILY = "aog.family.v1";
  var K_DRAFT = "aog.draft.v1";

  /* =====================================================================
     1) INTENSITY SPACE-RESERVE
     Depth mode renders a 6-point scale; rapid renders 4. When 6 options
     are present, reserve room for the intensity block so the nav never jumps.
     ===================================================================== */
  function syncIntensityReserve() {
    var ra = document.getElementById("responseArea");
    var ia = document.getElementById("intensityArea");
    if (!ra || !ia) return;
    var n = ra.querySelectorAll(".response-option").length;
    if (n >= 6) ia.classList.add("aog-reserve");
    else ia.classList.remove("aog-reserve");
  }
  function watchResponses() {
    var ra = document.getElementById("responseArea");
    if (!ra || ra.__aogWatch) return; ra.__aogWatch = 1;
    try {
      var obs = new MutationObserver(syncIntensityReserve);
      obs.observe(ra, { childList: true });
    } catch (e) {}
    syncIntensityReserve();
  }

  /* (2) Hero scroll-fade was removed — fading a dark hero's opacity revealed
     the bright page behind it and read as a white-out. Mobile rhythm stays in CSS. */

  /* =====================================================================
     3) DASHBOARD · "Your data on this device"
     ===================================================================== */
  function familyCount() {
    try {
      var raw = localStorage.getItem(K_FAMILY); if (!raw) return 0;
      var f = JSON.parse(raw); if (!f) return 0;
      if (Array.isArray(f)) return f.length;
      if (f.children && f.children.length != null) return f.children.length;
      if (f.roster && f.roster.length != null) return f.roster.length;
      if (typeof f === "object") return Object.keys(f).length;
    } catch (e) {}
    return 0;
  }
  function checkinCount() {
    try { if (typeof getLocalRecords === "function") return (getLocalRecords() || []).length; } catch (e) {}
    try { var a = JSON.parse(localStorage.getItem(K_RESULTS) || "[]"); return a.length || 0; } catch (e) {}
    return 0;
  }
  function draftCount() { var d = lsGet(K_DRAFT, ""); return (d && d !== "null" && d !== "{}") ? 1 : 0; }

  window.aogDashRefreshData = function () {
    var a = document.getElementById("aogDashCheckins");
    var b = document.getElementById("aogDashFamily");
    var c = document.getElementById("aogDashDraft");
    if (a) a.textContent = checkinCount();
    if (b) b.textContent = familyCount();
    if (c) c.textContent = draftCount();
  };
  window.aogDashBackup = function () { try { if (window.privacyExportJSON) window.privacyExportJSON(); } catch (e) {} };
  window.aogDashCsv = function () { try { if (window.privacyExportCSV) window.privacyExportCSV(); } catch (e) {} };
  window.aogDashDelete = function () {
    var before = checkinCount() + familyCount() + draftCount();
    try { if (window.privacyDeleteAll) window.privacyDeleteAll(); } catch (e) {}
    window.aogDashRefreshData();
    var after = checkinCount() + familyCount() + draftCount();
    var done = document.getElementById("aogDashDone");
    if (done && before > 0 && after === 0) { done.classList.add("show"); }
    else if (done) { done.classList.remove("show"); }
  };

  // keep dash counts fresh whenever the app refreshes admin/data
  function wrapRefreshAdmin() {
    if (typeof window.refreshAdmin === "function" && !window.refreshAdmin.__aogWrap) {
      var orig = window.refreshAdmin;
      window.refreshAdmin = function () { var r = orig.apply(this, arguments); try { window.aogDashRefreshData(); } catch (e) {} return r; };
      window.refreshAdmin.__aogWrap = 1;
    }
  }

  /* =====================================================================
     4) FIRST-RUN NUDGE  (once, only for genuinely new users)
     ===================================================================== */
  function dismissNudge(go) {
    lsSet("aog.seenNudge", "1");
    var n = document.getElementById("aogNudge");
    if (n && n.parentNode) n.parentNode.removeChild(n);
    if (go) { try { if (typeof startChoose === "function") startChoose(); } catch (e) {} }
  }
  function maybeNudge() {
    if (lsGet("aog.seenNudge", "") === "1") return;
    if (checkinCount() > 0 || draftCount() > 0) { lsSet("aog.seenNudge", "1"); return; }
    var welcome = document.getElementById("screen-welcome");
    if (!welcome || !welcome.classList.contains("active")) return;
    if (document.getElementById("aogNudge")) return;
    var n = document.createElement("div");
    n.id = "aogNudge"; n.className = "aog-nudge"; n.setAttribute("role", "status");
    n.innerHTML =
      '<span class="aog-nudge-tx">' + t("New here? Start with a quick ", "¿Primera vez? Empieza con un breve ") + '<b>' + t("check-in", "chequeo") + '</b>.</span>'
      + '<button type="button" class="aog-nudge-go">' + t("Start", "Empezar") + '</button>'
      + '<button type="button" class="aog-nudge-x" aria-label="' + t("Dismiss", "Cerrar") + '">×</button>';
    document.body.appendChild(n);
    n.querySelector(".aog-nudge-go").addEventListener("click", function () { dismissNudge(true); });
    n.querySelector(".aog-nudge-x").addEventListener("click", function () { dismissNudge(false); });
  }

  /* =====================================================================
     5) SAVE-TO-HOMESCREEN after first completion (PWA)
     ===================================================================== */
  var deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    try { e.preventDefault(); } catch (er) {}
    deferredPrompt = e;
  });
  function isStandalone() {
    try {
      if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
      if (window.navigator && window.navigator.standalone) return true;
    } catch (e) {}
    return false;
  }
  function isIOS() { try { return /iphone|ipad|ipod/i.test(window.navigator.userAgent || ""); } catch (e) { return false; } }
  function closeBanner() { var b = document.getElementById("aogA2hs"); if (b && b.parentNode) b.parentNode.removeChild(b); }
  function showA2HS() {
    if (lsGet("aog.a2hsDone", "") === "1" || isStandalone()) return;
    if (!deferredPrompt && !isIOS()) return;            // nothing to offer on this platform
    if (document.getElementById("aogA2hs")) return;
    lsSet("aog.a2hsDone", "1");
    var b = document.createElement("div");
    b.id = "aogA2hs"; b.className = "aog-nudge"; b.setAttribute("role", "status");
    if (deferredPrompt) {
      b.innerHTML =
        '<span class="aog-nudge-tx">' + t("Use this again? ", "¿Lo usarás otra vez? ") + '<b>' + t("Add it to your Home Screen", "Agrégalo a tu pantalla de inicio") + '</b>.</span>'
        + '<button type="button" class="aog-nudge-go">' + t("Add", "Agregar") + '</button>'
        + '<button type="button" class="aog-nudge-x" aria-label="' + t("Dismiss", "Cerrar") + '">×</button>';
      document.body.appendChild(b);
      b.querySelector(".aog-nudge-go").addEventListener("click", function () {
        closeBanner();
        try { deferredPrompt.prompt(); } catch (e) {}
        deferredPrompt = null;
      });
    } else { // iOS hint (no install event available)
      b.innerHTML =
        '<span class="aog-nudge-tx">' + t("Use this again? Tap ", "¿Lo usarás otra vez? Toca ") + '<b>' + t("Share", "Compartir") + '</b>' + t(", then ", ", luego ") + '<b>' + t("Add to Home Screen", "Agregar a pantalla de inicio") + '</b>.</span>'
        + '<button type="button" class="aog-nudge-x" aria-label="' + t("Dismiss", "Cerrar") + '">×</button>';
      document.body.appendChild(b);
    }
    b.querySelector(".aog-nudge-x").addEventListener("click", closeBanner);
    setTimeout(closeBanner, 12000);
  }

  /* =====================================================================
     6) KEYBOARD NAV for card pickers
     ===================================================================== */
  function makeFocusable(sel, role) {
    var nodes = document.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
      if (role && !el.hasAttribute("role")) el.setAttribute("role", role);
    }
  }
  function applyFocusable() {
    makeFocusable(".pecs-card", "button");
    makeFocusable(".pecs-strip-card", "button");
    makeFocusable(".choose-card", "button");
    // .mode-card already has role=radio + tabindex in markup
  }
  function rovingMove(el, dir) {
    var grid = el.closest ? el.closest(".mode-grid, .pecs-strip, .about-tiles") : null;
    if (!grid) return;
    var sel = el.classList.contains("mode-card") ? ".mode-card" : (el.classList.contains("pecs-strip-card") ? ".pecs-strip-card" : "[tabindex]");
    var items = Array.prototype.slice.call(grid.querySelectorAll(sel));
    var idx = items.indexOf(el); if (idx < 0) return;
    var next = items[(idx + dir + items.length) % items.length];
    if (next) next.focus();
  }
  document.addEventListener("keydown", function (e) {
    var el = e.target;
    if (!el || !el.classList) return;
    var isCard = el.classList.contains("mode-card") || el.classList.contains("choose-card")
      || el.classList.contains("pecs-card") || el.classList.contains("pecs-strip-card");
    if (!isCard) return;
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault(); try { el.click(); } catch (er) {}
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); rovingMove(el, 1); }
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); rovingMove(el, -1); }
  });

  /* =====================================================================
     hooks
     ===================================================================== */
  function onScreen(id) {
    try {
      if (id === "screen-survey") { watchResponses(); syncIntensityReserve(); }
      if (id === "screen-welcome") { setTimeout(maybeNudge, 1100); }
      if (id === "screen-thanks") { setTimeout(showA2HS, 900); }
      applyFocusable();
    } catch (e) {}
  }
  function hookShowScreen() {
    if (typeof window.showScreen === "function" && !window.showScreen.__polishWrap) {
      var orig = window.showScreen;
      window.showScreen = function (id) { var r = orig.apply(this, arguments); onScreen(id); return r; };
      window.showScreen.__polishWrap = 1;
    }
  }

  function init() {
    hookShowScreen();
    wrapRefreshAdmin();
    watchResponses();
    applyFocusable();
    try { window.aogDashRefreshData(); } catch (e) {}
    var active = document.querySelector(".screen.active");
    if (active && active.id) onScreen(active.id);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.addEventListener("load", function () { try { hookShowScreen(); wrapRefreshAdmin(); watchResponses(); applyFocusable(); } catch (e) {} });
})();
