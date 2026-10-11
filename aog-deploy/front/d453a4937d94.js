
/* =====================================================================
   ARCHITECTURE OF GRACE · polish.js
   Behavior for the pilot-feedback fixes. ES5, defensive, additive.
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

  /* ================= RESTORE FROM A BACKUP (.29x) =========================
     The other half of privacyExportJSON. Until now the app could WRITE
     ArchitectureOfGrace_my-data.json and nothing on earth could read it back —
     so the line "your copy to keep" was true and useless. A teacher who cleared
     a browser, changed laptops, or wanted a corrected copy of their own data
     had no way in but a console.

     Rules this follows:
       · It says what is in the file BEFORE it touches anything.
       · It downloads a backup of what is here now, first, every time.
       · It replaces store by store. A store in the file replaces the one on
         this device; a store not in the file is left alone. It says that too.
       · It does NOT restore the dashboard passcode — a device credential, not
         data, and restoring an old one is how a person locks themselves out.
     ====================================================================== */
  function rstT(en, es) {
    try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es" ? es : en; }
    catch (e) { return en; }
  }
  function rstEsc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  var RST_SKIP = /^aog\.dash\.lock/;   /* the code on this computer stays */
  var rstPending = null;

  /* A backup can be the full export ({exportedAt, device:{…}}) or the bare
     store map the name-scrub tool wrote. Accept both; reject anything else. */
  function rstStores(obj) {
    if (!obj || typeof obj !== "object") return null;
    var src = (obj.device && typeof obj.device === "object") ? obj.device : obj;
    var keys = Object.keys(src).filter(function (k) { return /^(aog|grace)/i.test(k); });
    return keys.length ? { src: src, keys: keys } : null;
  }
  function rstCount(o) { try { return Object.keys(o || {}).length; } catch (e) { return 0; } }
  function rstDays(store) {
    var n = 0; try {
      var logs = (store || {}).logs || {};
      Object.keys(logs).forEach(function (s) { n += rstCount(logs[s]); });
    } catch (e) {}
    return n;
  }
  function rstSummary(src) {
    var out = [], iep = src["aog.iep.v1"], pts = 0;
    if (iep && iep.goals) {
      try { Object.keys(iep.data || {}).forEach(function (g) { pts += (iep.data[g] || []).length; }); } catch (e) {}
      out.push(rstCount(iep.goals) + rstT(" IEP goals", " metas del IEP") + " · " + pts + rstT(" data points", " datos"));
    }
    if (src["aog.iepdocs.v1"]) out.push(rstT("IEP paperwork", "Papeleo del IEP"));
    var ci = rstDays(src["aog.checkin.student.v1"]);
    if (ci) out.push(ci + rstT(" days of student check-ins", " días de registros de estudiantes"));
    var ex = rstDays(src["aog.exit.v1"]);
    if (ex) out.push(ex + rstT(" days of exit slips", " días de boletas de salida"));
    if (src["aog.daily.v1"]) out.push(rstT("the daily log", "el registro diario"));
    return out;
  }

  window.aogDashRestore = function () {
    var f = document.getElementById("aogDashRestoreFile");
    if (!f) return;
    f.value = "";
    f.click();
  };
  window.aogDashRestoreCancel = function () {
    rstPending = null;
    var p = document.getElementById("aogDashRestorePanel");
    if (p) { p.hidden = true; p.innerHTML = ""; }
  };
  window.aogDashRestoreGo = function () {
    if (!rstPending) return;
    var src = rstPending.src, keys = rstPending.keys, wrote = 0;
    /* Always a safety copy of what is here now, before anything changes. */
    try { if (window.privacyExportJSON) window.privacyExportJSON(); } catch (e) {}
    setTimeout(function () {
      keys.forEach(function (k) {
        if (RST_SKIP.test(k)) return;
        try {
          var v = src[k];
          localStorage.setItem(k, (typeof v === "string") ? v : JSON.stringify(v));
          wrote++;
        } catch (e) {}
      });
      var p = document.getElementById("aogDashRestorePanel");
      if (p) {
        p.innerHTML = "<h4>" + rstEsc(rstT("Restored.", "Restaurado.")) + "</h4><p>"
          + rstEsc(wrote + rstT(" stores were replaced. Reloading…", " almacenes fueron reemplazados. Recargando…")) + "</p>";
      }
      rstPending = null;
      setTimeout(function () { try { location.reload(); } catch (e) {} }, 900);
    }, 400);
  };

  (function wireRestore() {
    var f = document.getElementById("aogDashRestoreFile");
    if (!f || f.__aogWired) return;
    f.__aogWired = 1;
    f.addEventListener("change", function () {
      var p = document.getElementById("aogDashRestorePanel");
      var file = f.files && f.files[0];
      if (!p || !file) return;
      var rd = new FileReader();
      rd.onerror = function () {
        p.hidden = false;
        p.innerHTML = "<h4 class='rst-bad'>" + rstEsc(rstT("That file could not be read.", "No se pudo leer ese archivo.")) + "</h4>";
      };
      rd.onload = function () {
        var obj = null;
        try { obj = JSON.parse(String(rd.result)); } catch (e) {}
        var got = rstStores(obj);
        p.hidden = false;
        if (!got) {
          p.innerHTML = "<h4 class='rst-bad'>" + rstEsc(rstT("That does not look like an Architecture of Grace backup.", "Eso no parece un respaldo de Architecture of Grace.")) + "</h4>"
            + "<p>" + rstEsc(rstT("Look for a file named ArchitectureOfGrace_my-data.json, or one you downloaded from this page.",
                                  "Busca un archivo llamado ArchitectureOfGrace_my-data.json, o uno que descargaste desde esta página.")) + "</p>"
            + "<div class='rst-acts'><button class='btn btn-secondary' type='button' onclick='aogDashRestoreCancel()'>" + rstEsc(rstT("Close", "Cerrar")) + "</button></div>";
          return;
        }
        rstPending = got;
        var bits = rstSummary(got.src);
        var when = "";
        try { if (obj && obj.exportedAt) when = new Date(obj.exportedAt).toLocaleString(); } catch (e) {}
        p.innerHTML =
          "<h4>" + rstEsc(rstT("This backup holds:", "Este respaldo contiene:")) + "</h4>"
          + (bits.length ? ("<ul><li>" + bits.map(rstEsc).join("</li><li>") + "</li></ul>")
                         : ("<p>" + rstEsc(got.keys.length + rstT(" stores.", " almacenes.")) + "</p>"))
          + (when ? ("<p>" + rstEsc(rstT("Saved ", "Guardado ") + when) + "</p>") : "")
          + "<p>" + rstEsc(rstT("Each of these replaces what is on this device. Anything not in the file is left alone, and your dashboard code here is kept. A backup of what is on this device right now will download first.",
                                "Cada uno de estos reemplaza lo que hay en este dispositivo. Lo que no esté en el archivo se deja igual, y tu código del panel aquí se conserva. Primero se descargará un respaldo de lo que hay ahora en este dispositivo.")) + "</p>"
          + "<div class='rst-acts'>"
          + "<button class='btn' type='button' onclick='aogDashRestoreGo()'>" + rstEsc(rstT("Replace my data with this", "Reemplazar mis datos con esto")) + "</button>"
          + "<button class='btn btn-secondary' type='button' onclick='aogDashRestoreCancel()'>" + rstEsc(rstT("Cancel", "Cancelar")) + "</button>"
          + "</div>";
      };
      rd.readAsText(file);
    });
  })();
  /* The Data tab is built once with the screen, but wire again on show in case
     this block ran before the markup existed. */
  try { document.addEventListener("DOMContentLoaded", wireRestore); } catch (e) {}
  try { window.addEventListener("load", wireRestore); } catch (e) {}
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
      window.refreshAdmin = function () { var r = orig.apply(this, arguments); try { window.aogDashRefreshData(); } catch (e) {} try { wireRoster(); aogRenderRoster(); } catch (e) {} return r; };
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
  /* Retired 2026-08-25 with the first-visit bar: this was the SECOND "New here?"
     prompt on the same screen, and it offered the self-reflection a third time.
     Behind a switch, not deleted. Note the tour FAB was stood down while this
     was up (body.aog-nudge-up #tourFab) — with the nudge retired the FAB simply
     stays visible, which is the intended resting state. */
  window.AOG_FIRSTRUN_NUDGE = false;
  function maybeNudge() {
    if (!window.AOG_FIRSTRUN_NUDGE) return;
    if (lsGet("aog.seenNudge", "") === "1") return;
    if (checkinCount() > 0 || draftCount() > 0) { lsSet("aog.seenNudge", "1"); return; }
    var welcome = document.getElementById("screen-welcome");
    if (!welcome || !welcome.classList.contains("active")) return;
    if (document.getElementById("aogNudge")) return;
    var n = document.createElement("div");
    n.id = "aogNudge"; n.className = "aog-nudge"; n.setAttribute("role", "status");
    n.innerHTML =
      '<span class="aog-nudge-tx">' + t("New here? ", "¿Primera vez? ") + '<a class="aog-nudge-link" href="#" onclick="event.preventDefault(); if(typeof openStartHere===\'function\'){openStartHere();}">' + t("See what this is", "Mira de qué se trata") + '</a>' + t(", or jump to a quick ", ", o haz un breve ") + '<b>' + t("self-reflection", "autorreflexión") + '</b>.</span>'
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
  /* Exported so OTHER completion screens can make the same once-ever offer.
     The teacher letter promises "after your first check-in you'll be asked to
     add it to your home screen" - and until 2026-08-29 that was only true of
     the student reflection's thank-you screen. A promise in the letter is a
     spec. */
  window.aogOfferA2HS = function () { try { showA2HS(); } catch (e) {} };
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
     INDIVIDUAL RESPONSES ROSTER (Class trends tab)
     Each self-reflection is stored with an assigned code, grade, window, scores,
     and (in Thorough mode) written reflections. Surface them as a readable
     per-person table with an expandable detail view.
     ===================================================================== */
  function escH(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function rosterRecords() {
    try { if (typeof window.getAllRecords === "function") { var a = window.getAllRecords(); if (Array.isArray(a)) return a; } } catch (e) {}
    try { var raw = localStorage.getItem(K_RESULTS); var p = raw ? JSON.parse(raw) : []; if (Array.isArray(p)) return p; if (p && Array.isArray(p.records)) return p.records; } catch (e) {}
    return [];
  }
  function rVal(id) { var el = document.getElementById(id); return el ? el.value : ""; }
  function rosterFilter(recs) {
    var w = rVal("studentFilterWindow"), g = rVal("studentFilterGrade"), tr = rVal("studentFilterTier");
    return recs.filter(function (r) {
      if (w && r.window !== w) return false;
      if (g && String(r.grade) !== String(g)) return false;
      if (tr === "flagged") { if (!r.trustedAdultFlag) return false; }
      else if (tr === "unsafe") { if (!r.unsafeFlag) return false; }
      else if (tr) { if (r.tier !== tr) return false; }
      return true;
    });
  }
  function rBand(r) {
    var v = r.normComposite != null ? r.normComposite : 0;
    if (v >= 75) return { c: "var(--green)", bg: "var(--green-bg)", lbl: aogBandLabel(v) };
    if (v >= 50) return { c: "var(--amber)", bg: "var(--amber-bg)", lbl: aogBandLabel(v) };
    return { c: "var(--red)", bg: "var(--red-bg)", lbl: aogBandLabel(v) };
  }
  function rWin(w) { if (!w) return "—"; var m = { Fall: t("Fall", "Otoño"), Winter: t("Winter", "Invierno"), Spring: t("Spring", "Primavera"), Summer: t("Summer", "Verano") }; return m[w] || w; }
  function rBar(lbl, v) {
    v = Math.max(0, Math.min(100, Math.round(v || 0)));
    var c = v >= 75 ? "var(--green)" : v >= 50 ? "var(--amber)" : "var(--red)";
    return '<div class="rost-dbar"><span class="rost-dlbl">' + lbl + '</span><span class="rost-dtrack"><span class="rost-dfill" style="width:' + v + '%;background:' + c + '"></span></span><span class="rost-dval">' + v + '</span></div>';
  }
  function rDetail(r) {
    var h = '<div class="rost-det"><div class="rost-det-doms">'
      + rBar("A · " + t("Emotional Regulation", "Regulación emocional"), r.normA)
      + rBar("B · " + t("Self-Compassion", "Autocompasión"), r.normB)
      + rBar("C · " + t("Social Competency", "Competencia social"), r.normC)
      + '</div>';
    var refl = (r.reflections || []).filter(function (x) { return x && String(x).trim(); });
    if (refl.length) {
      h += '<div class="rost-det-refl"><div class="rost-det-h">' + t("Written reflections", "Reflexiones escritas") + '</div>';
      refl.forEach(function (x) { h += '<p class="rost-refl">“' + escH(x) + '”</p>'; });
      h += '</div>';
    } else {
      h += '<div class="rost-det-refl rost-muted">' + t("Quick self-reflection — no written reflections.", "Autorreflexión rápido — sin reflexiones escritas.") + '</div>';
    }
    if (r.trustedAdultFlag) h += '<div class="rost-det-flag">⚑ ' + t("This person named no trusted adult — a good place to start a conversation.", "Esta persona no nombró a un adulto de confianza — un buen punto de partida.") + '</div>';
    if (r.unsafeFlag) h += '<div class="rost-det-flag">⚑ ' + t("This person indicated they may not protect themselves from someone unsafe — worth a gentle, direct self-reflection.", "Esta persona indicó que tal vez no se protege de alguien que no es seguro — vale la pena un acercamiento amable y directo.") + '</div>';
    return h + '</div>';
  }
  function aogRenderRoster() {
    var host = document.getElementById("rosterTable");
    if (!host) return;
    var noteTxt = document.getElementById("rosterNoteTxt");
    if (noteTxt) noteTxt.textContent = t(
      "This shows self-reflections saved on this device, plus anyone who used a sync link you shared. Others stay on the devices they were taken on.",
      "Esto muestra las autorreflexiones guardadas en este dispositivo, y las de quien usó un enlace de sincronización que compartiste. Las demás se quedan en los dispositivos donde se hicieron.");
    var recs = rosterFilter(rosterRecords().slice()).sort(function (a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
    var cnt = document.getElementById("rosterCount");
    if (cnt) cnt.textContent = recs.length + " " + (recs.length === 1 ? t("response", "respuesta") : t("responses", "respuestas"));
    if (!recs.length) { host.innerHTML = '<div class="empty-state"><div class="small">' + t("No individual responses for this filter yet.", "Aún no hay respuestas individuales para este filtro.") + '</div></div>'; return; }
    var rows = "";
    recs.forEach(function (r, i) {
      var b = rBand(r), code = (r.studentId && String(r.studentId).trim()) || t("(no code)", "(sin código)");
      var dt = "—"; try { dt = new Date(r.timestamp).toLocaleDateString(L() === "es" ? "es" : "en", { month: "short", day: "numeric", year: "numeric" }); } catch (e) {}
      var sc = r.normComposite != null ? Math.round(r.normComposite) : "—";
      var _flags = [];
      if (r.trustedAdultFlag) _flags.push('<span class="rost-flag">⚑ ' + t("No trusted adult", "Sin adulto") + '</span>');
      if (r.unsafeFlag) _flags.push('<span class="rost-flag">⚑ ' + t("May not self-protect", "Puede no protegerse") + '</span>');
      var trust = _flags.length ? _flags.join('<br>') : '<span class="rost-ok">—</span>';
      rows += '<tr class="rost-row" data-i="' + i + '">'
        + '<td class="rost-code">' + escH(code) + '</td>'
        + '<td>' + escH(r.grade || "—") + '</td>'
        + '<td>' + escH(rWin(r.window)) + '</td>'
        + '<td class="rost-date">' + escH(dt) + '</td>'
        + '<td><span class="rost-score" style="color:' + b.c + '">' + sc + '</span></td>'
        + '<td><span class="rost-band" style="background:' + b.bg + ';color:' + b.c + '">' + b.lbl + '</span></td>'
        + '<td>' + trust + '</td>'
        + '<td class="rost-act"><button class="rost-read" type="button" data-i="' + i + '">' + t("Read", "Leer") + ' ▾</button></td>'
        + '</tr>'
        + '<tr class="rost-detrow" id="rostd' + i + '" style="display:none"><td colspan="8">' + rDetail(r) + '</td></tr>';
    });
    host.innerHTML = '<table class="rost-table"><thead><tr>'
      + '<th>' + t("Code", "Código") + '</th><th>' + t("Grade", "Grado") + '</th><th>' + t("Window", "Período") + '</th><th>' + t("Date", "Fecha") + '</th><th>' + t("Score", "Puntaje") + '</th><th>' + t("Band", "Banda") + '</th><th>' + t("Trusted adult", "Adulto de confianza") + '</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';
    host.querySelectorAll(".rost-row").forEach(function (tr) {
      tr.addEventListener("click", function () {
        var i = tr.getAttribute("data-i"), d = document.getElementById("rostd" + i); if (!d) return;
        var open = d.style.display !== "none"; d.style.display = open ? "none" : "";
        tr.classList.toggle("open", !open);
        var btn = host.querySelector('.rost-read[data-i="' + i + '"]'); if (btn) btn.innerHTML = (open ? t("Read", "Leer") + " ▾" : t("Hide", "Ocultar") + " ▴");
      });
    });
  }
  window.aogRenderRoster = aogRenderRoster;
  function wireRoster() {
    ["studentFilterWindow", "studentFilterGrade", "studentFilterTier"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && !el.__rostWire) { el.__rostWire = 1; el.addEventListener("change", function () { setTimeout(aogRenderRoster, 0); }); }
    });
    var tab = document.querySelector('.tab[data-tab="students"]');
    if (tab && !tab.__rostWire) { tab.__rostWire = 1; tab.addEventListener("click", function () { setTimeout(aogRenderRoster, 40); }); }
  }

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
    try { wireRoster(); aogRenderRoster(); } catch (e) {}
    var active = document.querySelector(".screen.active");
    if (active && active.id) onScreen(active.id);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.addEventListener("load", function () { try { hookShowScreen(); wrapRefreshAdmin(); watchResponses(); applyFocusable(); } catch (e) {} });
})();

