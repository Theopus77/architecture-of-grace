/* =====================================================================
   ARCHITECTURE OF GRACE · bling that a 6th–8th grader respects — and works
   for every age. Earned, owned, real. No childish sparkle.

   - A daily word of grace, TONE-PICKED: Calm (real-talk) / Hype / Off
   - Universal ownership: accent color, on-device streak, opt-in sound
   - Earned completion on calm tools: a clean check + "time back" + streak
   - Reactive hero on the landing (pointer/tap accent light)
   - Personalize popover in the header (tone · accent · sound)
   Sound is OFF by default (honors the no-sound default). Reduced-motion respected.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- tiny helpers ---------- */
  function L() {
    try { if (typeof lang !== "undefined" && lang) return lang; } catch (e) {}
    try { if (typeof dashLang !== "undefined" && dashLang) return dashLang; } catch (e) {}
    return "en";
  }
  function t(en, es) { return L() === "es" ? es : en; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function $(s, r) { return (r || document).querySelector(s); }

  /* ---------- preferences (all on-device, universal) ---------- */
  var K_TONE = "aog.grace.tone";    // calm | hype | off   (default calm)
  var K_ACCENT = "aog.accent";      // gold | teal | violet | rose | sky | green
  var K_SOUND = "aog.sound";        // "1" | "0"           (default "0" = off)
  var K_STREAK = "aog.calm.streak"; // integer
  var K_LAST = "aog.calm.last";     // YYYY-MM-DD

  function tone() { var v = lsGet(K_TONE, "calm"); return (v === "hype" || v === "off") ? v : "calm"; }
  function accent() { return lsGet(K_ACCENT, "gold"); }
  function soundOn() { return lsGet(K_SOUND, "0") === "1"; }

  var ACCENTS = ["gold", "teal", "violet", "rose", "sky", "green"];
  var ACCENT_LABEL = {
    gold: ["Gold", "Dorado"], teal: ["Teal", "Verde azulado"], violet: ["Violet", "Violeta"],
    rose: ["Rose", "Rosa"], sky: ["Sky", "Cielo"], green: ["Green", "Verde"]
  };

  function applyAccent() {
    var a = accent();
    try {
      if (a && a !== "gold" && ACCENTS.indexOf(a) >= 0) document.documentElement.setAttribute("data-accent", a);
      else document.documentElement.removeAttribute("data-accent");
    } catch (e) {}
  }

  /* =====================================================================
     WORDS OF GRACE — three tones, EN/ES. Date-seeded within the set.
     Calm = real-talk (less poster-voice). Hype = motivating, higher energy.
     ===================================================================== */
  var WORDS = {
    calm: [
      ["You don't have to have it all together right now.", "No tienes que tenerlo todo resuelto ahora mismo."],
      ["A bad moment isn't a bad person.", "Un mal momento no es una mala persona."],
      ["You're allowed to start over today.", "Tienes permiso de empezar de nuevo hoy."],
      ["Talk to yourself like someone you actually like.", "Háblate como a alguien que de verdad aprecias."],
      ["One hard day is not the whole story.", "Un día difícil no es toda la historia."],
      ["Resting isn't falling behind.", "Descansar no es quedarse atrás."],
      ["Messing up means you're trying. Keep going.", "Equivocarte significa que lo intentas. Sigue."],
      ["You're more than your worst grade.", "Eres más que tu peor calificación."],
      ["Small steps still move you forward.", "Los pasos pequeños también te hacen avanzar."],
      ["Your feelings make sense. You're not broken.", "Tus emociones tienen sentido. No estás roto."],
      ["You don't have to earn the right to rest.", "No tienes que ganarte el derecho a descansar."],
      ["Progress is usually quiet.", "El progreso casi siempre es silencioso."],
      ["Be a little patient with yourself today.", "Ten un poco de paciencia contigo hoy."],
      ["Showing up counts, even when it's hard.", "Presentarte cuenta, incluso cuando es difícil."]
    ],
    hype: [
      ["You've done hard things before. Today's no different.", "Ya has hecho cosas difíciles. Hoy no es distinto."],
      ["Show up. That's already a win.", "Preséntate. Eso ya es una victoria."],
      ["You're built for more than you think.", "Eres capaz de más de lo que crees."],
      ["Bad start? Run it back. You've got this.", "¿Mal comienzo? Inténtalo otra vez. Tú puedes."],
      ["Effort beats perfect every time.", "El esfuerzo le gana a lo perfecto siempre."],
      ["Future you is counting on right now.", "El tú del futuro cuenta con este momento."],
      ["Keep going. Quitting is the only way to lose.", "Sigue. Rendirte es la única forma de perder."],
      ["You set the pace. Own today.", "Tú marcas el ritmo. Apodérate del día."],
      ["Progress, not perfect. Let's move.", "Progreso, no perfección. Vamos."],
      ["You're tougher than the hard part.", "Eres más fuerte que la parte difícil."],
      ["One more rep. One more try. That's how it's done.", "Un intento más. Así se logra."],
      ["Stand tall. You earned your spot here.", "Mantente firme. Te ganaste tu lugar aquí."],
      ["Hard now means strong later.", "Difícil ahora significa fuerte después."],
      ["Today's a clean slate. Go write something good.", "Hoy es página en blanco. Escribe algo bueno."]
    ]
  };
  function dayIndex(len) {
    var d = new Date();
    var n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
    return ((n % len) + len) % len;
  }
  function todaysWord(setName) {
    var set = WORDS[setName] || WORDS.calm;
    return esc(set[dayIndex(set.length)][L() === "es" ? 1 : 0]);
  }

  /* ---- daily word of grace on the Tools page (tone-aware) ---- */
  function placeGraceWord() {
    var scr = document.getElementById("screen-teacher-tools"); if (!scr) return;
    var cont = scr.querySelector(".container") || scr;
    var existing = document.getElementById("aogGraceWord");

    if (tone() === "off") { if (existing && existing.parentNode) existing.parentNode.removeChild(existing); return; }

    var el = existing;
    if (!el) {
      el = document.createElement("div"); el.id = "aogGraceWord"; el.className = "aog-grace-word";
      var h = cont.querySelector("h1");
      var headBlock = h ? h.parentNode : null;
      if (headBlock && headBlock.parentNode) headBlock.parentNode.insertBefore(el, headBlock.nextSibling);
      else cont.insertBefore(el, cont.firstChild);
    }
    var isHype = tone() === "hype";
    el.className = "aog-grace-word" + (isHype ? " tone-hype" : "");
    el.innerHTML =
      '<button class="agw-cog" type="button" aria-label="' + t("Personalize", "Personalizar") + '" title="' + t("Personalize", "Personalizar") + '" data-aog-open-pz="1">'
        + '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="8" x2="20" y2="8"/><circle cx="9" cy="8" r="2.4"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="15" cy="16" r="2.4"/></svg>'
      + '</button>'
      + '<span class="agw-dot" aria-hidden="true"></span>'
      + '<span class="agw-eyebrow">' + (isHype ? t("Today's push", "El impulso de hoy") : t("A word of grace today", "Una palabra de gracia hoy")) + '</span>'
      + '<span class="agw-text">' + todaysWord(tone()) + '</span>';
    var cog = el.querySelector(".agw-cog");
    if (cog) cog.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); openPz(true); });
  }

  /* =====================================================================
     SOUND GATE — make the existing GraceAudio engine respect the opt-in
     preference. Wraps every play* method; default off keeps it silent.
     ===================================================================== */
  function gateAudio() {
    var GA = window.GraceAudio;
    if (!GA || GA.__aogGated) return;
    GA.__aogGated = 1;
    for (var k in GA) {
      try {
        if (typeof GA[k] === "function" && k.indexOf("play") === 0) {
          (function (name, orig) {
            GA[name] = function () { if (!soundOn()) return; try { return orig.apply(this, arguments); } catch (e) {} };
          })(k, GA[k]);
        }
      } catch (e) {}
    }
  }
  function chime() { try { gateAudio(); if (soundOn() && window.GraceAudio && window.GraceAudio.playSuccess) window.GraceAudio.playSuccess(); } catch (e) {} }

  /* =====================================================================
     EARNED COMPLETION — clean check + "time back" + on-device streak.
     Replaces the old sticker-bloom. No gushing praise.
     ===================================================================== */
  var toolStart = 0;
  function markToolStart() { if (!toolStart) toolStart = Date.now(); }
  function clearToolStart() { toolStart = 0; }

  function dstr(d) { function p(n) { return (n < 10 ? "0" : "") + n; } return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()); }
  function bumpStreak() {
    var today = dstr(new Date());
    var last = lsGet(K_LAST, "");
    var count = parseInt(lsGet(K_STREAK, "0"), 10) || 0;
    if (last !== today) {
      var y = new Date(); y.setDate(y.getDate() - 1);
      count = (last === dstr(y)) ? count + 1 : 1;
      lsSet(K_STREAK, String(count));
      lsSet(K_LAST, today);
    }
    return count;
  }
  function timeBackLine() {
    var secs = toolStart ? Math.round((Date.now() - toolStart) / 1000) : 0;
    var mins = Math.max(1, Math.round(secs / 60));
    if (mins <= 1) return t("That's a minute back for you.", "Eso es un minuto para ti.");
    return t("That's about " + mins + " minutes back for you.", "Son unos " + mins + " minutos para ti.");
  }

  function bloom() {
    var modal = document.querySelector("#toolModal .tool-modal") || document.getElementById("toolModalBody");
    if (!modal) return;
    if (modal.querySelector(".aog-bloom")) return;

    var count = bumpStreak();
    var streakHtml = (count >= 2)
      ? '<div class="aog-bloom-streak"><span class="agw-dot" aria-hidden="true"></span>' + esc(count + t("-day streak", " días seguidos")) + '</div>'
      : '';

    var b = document.createElement("div"); b.className = "aog-bloom";
    b.innerHTML =
      '<div class="aog-bloom-ring"></div><div class="aog-bloom-ring d2"></div><div class="aog-bloom-ring d3"></div>'
      + '<div class="aog-bloom-card">'
        + '<div class="aog-bloom-check"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg></div>'
        + '<div class="aog-bloom-stat">' + timeBackLine() + '</div>'
        + streakHtml
      + '</div>';
    modal.appendChild(b);
    chime();
    clearToolStart();
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 3200);
  }
  function isDone(node) {
    if (node.nodeType !== 1) return false;
    if (node.id === "gbxAgain" || node.id === "t5Again") return true;
    return !!(node.querySelector && (node.querySelector("#gbxAgain") || node.querySelector("#t5Again")));
  }
  function watch() {
    var body = document.getElementById("toolModalBody");
    if (!body || body.__bloomWatch) return; body.__bloomWatch = 1;
    var obs = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var add = muts[i].addedNodes; if (!add) continue;
        if (add.length) markToolStart();
        for (var j = 0; j < add.length; j++) { if (isDone(add[j])) { bloom(); return; } }
      }
    });
    obs.observe(body, { childList: true, subtree: true });
  }

  /* =====================================================================
     REACTIVE HERO — accent light follows pointer / tap on the landing
     ===================================================================== */
  function hookHero() {
    var hero = document.querySelector(".hyb-hero");
    if (!hero || hero.__aogHero) return; hero.__aogHero = 1;
    var reduce = false;
    try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
    function setXY(clientX, clientY) {
      var r = hero.getBoundingClientRect();
      var x = ((clientX - r.left) / Math.max(1, r.width)) * 100;
      var y = ((clientY - r.top) / Math.max(1, r.height)) * 100;
      hero.style.setProperty("--aog-mx", x.toFixed(1) + "%");
      hero.style.setProperty("--aog-my", y.toFixed(1) + "%");
    }
    if (!reduce) {
      hero.addEventListener("pointermove", function (e) { hero.classList.add("aog-live"); setXY(e.clientX, e.clientY); });
      hero.addEventListener("pointerleave", function () { hero.classList.remove("aog-live"); });
    }
    hero.addEventListener("pointerdown", function (e) {
      setXY(e.clientX, e.clientY); hero.classList.add("aog-live", "aog-tap");
      setTimeout(function () { hero.classList.remove("aog-tap"); }, 620);
    });
  }

  /* =====================================================================
     PERSONALIZE POPOVER (header) — tone · accent · sound
     ===================================================================== */
  function pzMenuHtml() {
    var a = accent(), tn = tone(), snd = soundOn();
    var sw = "";
    for (var i = 0; i < ACCENTS.length; i++) {
      var name = ACCENTS[i];
      sw += '<button type="button" class="aog-sw aog-sw-' + name + '" data-accent="' + name + '" aria-pressed="' + (a === name ? "true" : "false") + '" aria-label="' + esc(ACCENT_LABEL[name][L() === "es" ? 1 : 0]) + '" title="' + esc(ACCENT_LABEL[name][L() === "es" ? 1 : 0]) + '"></button>';
    }
    return ''
      + '<div class="aog-pz-h">' + t("Make it yours", "Hazlo tuyo") + '</div>'
      + '<div class="aog-pz-sub">' + t("Saved on this device only.", "Se guarda solo en este dispositivo.") + '</div>'
      + '<div class="aog-pz-sec">'
        + '<div class="aog-pz-row-t" style="padding:0 4px 8px;">' + t("A word of grace", "Una palabra de gracia") + '</div>'
        + '<div class="aog-seg" role="group" aria-label="' + t("Tone", "Tono") + '">'
          + '<button type="button" data-tone="calm" aria-pressed="' + (tn === "calm" ? "true" : "false") + '">' + t("Calm", "Calma") + '</button>'
          + '<button type="button" data-tone="hype" aria-pressed="' + (tn === "hype" ? "true" : "false") + '">' + t("Hype", "Ánimo") + '</button>'
          + '<button type="button" data-tone="off" aria-pressed="' + (tn === "off" ? "true" : "false") + '">' + t("Off", "Apagado") + '</button>'
        + '</div>'
      + '</div>'
      + '<div class="aog-pz-sec">'
        + '<div class="aog-pz-row-t" style="padding:0 4px 8px;">' + t("Accent color", "Color de acento") + '</div>'
        + '<div class="aog-swatches">' + sw + '</div>'
      + '</div>'
      + '<div class="aog-pz-sec">'
        + '<button type="button" class="aog-pz-row" id="aogSoundRow" role="menuitemcheckbox" aria-checked="' + (snd ? "true" : "false") + '">'
          + '<span class="aog-pz-row-tx"><span class="aog-pz-row-t">' + t("Sound", "Sonido") + '</span>'
          + '<span class="aog-pz-row-s">' + t("Gentle tones on actions (off by default)", "Tonos suaves en las acciones (apagado por defecto)") + '</span></span>'
          + '<span class="aog-pz-switch" aria-hidden="true"></span>'
        + '</button>'
      + '</div>';
  }
  function buildPz() {
    if (document.getElementById("aogPzWrap")) return;
    var anchor = document.getElementById("themeToggle");
    if (!anchor || !anchor.parentNode) return;
    var wrap = document.createElement("div"); wrap.className = "aog-pz-wrap"; wrap.id = "aogPzWrap";
    wrap.innerHTML =
      '<button id="aogPzBtn" class="theme-toggle aog-pz-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="' + t("Personalize", "Personalizar") + '" title="' + t("Personalize", "Personalizar") + '">'
        + '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"/><circle cx="9" cy="7" r="2.3"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="15" cy="17" r="2.3"/></svg>'
      + '</button>'
      + '<div id="aogPzMenu" class="aog-pz-menu" role="menu" aria-label="' + t("Personalize", "Personalizar") + '" hidden></div>';
    anchor.parentNode.insertBefore(wrap, anchor);

    $("#aogPzBtn", wrap).addEventListener("click", function (e) { e.stopPropagation(); togglePz(); });

    var menu = $("#aogPzMenu", wrap);
    menu.addEventListener("click", function (e) {
      var tb = e.target.closest ? e.target.closest("[data-tone]") : null;
      var ab = e.target.closest ? e.target.closest("[data-accent]") : null;
      var sr = e.target.closest ? e.target.closest("#aogSoundRow") : null;
      if (tb) { lsSet(K_TONE, tb.getAttribute("data-tone")); placeGraceWord(); refreshPz(); }
      else if (ab) { lsSet(K_ACCENT, ab.getAttribute("data-accent")); applyAccent(); refreshPz(); }
      else if (sr) {
        var on = !soundOn(); lsSet(K_SOUND, on ? "1" : "0");
        if (on) { try { gateAudio(); if (window.GraceAudio) { if (window.GraceAudio.init) window.GraceAudio.init(); if (window.GraceAudio.playPop) window.GraceAudio.playPop(); } } catch (e2) {} }
        refreshPz();
      }
    });
  }
  function refreshPz() { var m = document.getElementById("aogPzMenu"); if (m && !m.hidden) m.innerHTML = pzMenuHtml(); }
  function setPzOpen(open) {
    var m = document.getElementById("aogPzMenu"), b = document.getElementById("aogPzBtn");
    if (!m || !b) return;
    if (open) { m.innerHTML = pzMenuHtml(); m.hidden = false; b.setAttribute("aria-expanded", "true"); b.classList.add("active"); }
    else { m.hidden = true; b.setAttribute("aria-expanded", "false"); b.classList.remove("active"); }
  }
  function togglePz() { var m = document.getElementById("aogPzMenu"); setPzOpen(!m || m.hidden); }
  function openPz(force) { buildPz(); setPzOpen(force !== false); }
  document.addEventListener("click", function (e) {
    var wrap = document.getElementById("aogPzWrap");
    if (wrap && !wrap.contains(e.target)) setPzOpen(false);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setPzOpen(false); });

  /* =====================================================================
     hooks into the host app
     ===================================================================== */
  function hookShowScreen() {
    if (typeof window.showScreen === "function" && !window.showScreen.__blingWrap) {
      var orig = window.showScreen;
      window.showScreen = function (id) {
        var r = orig.apply(this, arguments);
        try { if (id === "screen-teacher-tools") placeGraceWord(); if (id === "screen-welcome") hookHero(); } catch (e) {}
        return r;
      };
      window.showScreen.__blingWrap = 1;
    }
  }
  function hookApplyLang() {
    if (typeof window.applyLang === "function" && !window.applyLang.__blingWrap) {
      var orig = window.applyLang;
      window.applyLang = function () {
        var r = orig.apply(this, arguments);
        try { if (document.getElementById("aogGraceWord") || tone() !== "off") placeGraceWord(); refreshPz(); } catch (e) {}
        return r;
      };
      window.applyLang.__blingWrap = 1;
    }
  }

  function init() {
    applyAccent();
    gateAudio();
    buildPz();
    hookShowScreen(); hookApplyLang(); watch(); hookHero();
    try { var s = document.getElementById("screen-teacher-tools"); if (s && s.classList.contains("active")) placeGraceWord(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.addEventListener("load", function () { try { applyAccent(); gateAudio(); buildPz(); watch(); hookShowScreen(); hookHero(); } catch (e) {} });
})();
