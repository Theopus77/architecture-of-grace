
/* On-device, offline read-aloud + picture-level answers for the student self-reflection.
   Uses the browser's built-in speechSynthesis (no network, nothing leaves the device).
   Decoupled: observes the question screen and enhances it; toggled from the a11y menu. */
(function () {
  function de(){ return document.documentElement; }
  function curLang(){ try { if (typeof surveyLang !== "undefined" && surveyLang) return surveyLang; if (typeof lang !== "undefined" && lang) return lang; } catch (e) {} return "en"; }
  function voiceLang(){ return curLang() === "es" ? "es-ES" : "en-US"; }
  /* Pick the most natural-sounding installed voice for the current language, so the
     reader sounds like a calm person, not a robot. Prefers neural/premium voices. */
  function aogStoredVoiceName(){ try { return localStorage.getItem("aog.a11y.voice") || ""; } catch (e) { return ""; } }
  function aogPickVoice(){
    try {
      var vs = window.speechSynthesis.getVoices() || [];
      if (!vs.length) return null;
      /* 1) a voice the user explicitly chose in the menu wins (any language) */
      var pref = aogStoredVoiceName();
      if (pref){ for (var p = 0; p < vs.length; p++){ if (vs[p].name === pref) return vs[p]; } }
      /* 2) otherwise auto-pick the most natural female voice for the current language */
      var es = curLang() === "es";
      var want = es ? /^es/i : /^en/i;
      var langVs = vs.filter(function (v){ return want.test(v.lang || ""); });
      if (!langVs.length) langVs = vs;
      var prefer = es
        ? [/google.*espa/i, /natural/i, /m[oó]nica/i, /paulina/i, /helena/i, /sabina/i]
        : [/natural/i, /google us english/i, /samantha/i, /\bava\b/i, /allison/i, /\bjenny\b/i, /\baria\b/i, /google uk english female/i];
      for (var i = 0; i < prefer.length; i++){
        for (var j = 0; j < langVs.length; j++){ if (prefer[i].test(langVs[j].name || "")) return langVs[j]; }
      }
      var nice = langVs.find(function (v){ return /natural|neural|premium|enhanced|google/i.test(v.name || ""); });
      return nice || langVs[0] || null;
    } catch (e) { return null; }
  }
  window.aogSpeak = function (text){
    try {
      if (!("speechSynthesis" in window) || !text) return;
      var synth = window.speechSynthesis;
      synth.cancel();
      var v = aogPickVoice();
      function mk(t){
        var u = new window.SpeechSynthesisUtterance(t);
        /* if the user chose a specific voice, speak in that voice's own language so it
           pronounces correctly; otherwise use the page language */
        u.lang = (v && v.lang) ? v.lang : voiceLang(); if (v) u.voice = v;
        /* relaxed, human cadence: a little slow, a touch lower than default */
        u.rate = 0.87; u.pitch = 0.96; u.volume = 1;
        return u;
      }
      /* Speak sentence by sentence so the voice breathes between thoughts
         (queued utterances get a natural pause) instead of rushing one long line. */
      var chunks = String(text).replace(/\s+/g, " ").trim().match(/[^.!?…]+[.!?…]+|\S[^.!?…]*$/g);
      if (!chunks || !chunks.length) chunks = [String(text)];
      chunks.forEach(function (c){ c = c.trim(); if (c) synth.speak(mk(c)); });
    } catch (e) {}
  };
  /* ---- voice picker (uses only voices installed on this device) ---- */
  window.aogSetVoice = function (name){
    try { if (name) localStorage.setItem("aog.a11y.voice", name); else localStorage.removeItem("aog.a11y.voice"); } catch (e) {}
    window.aogVoiceSample();
  };
  window.aogVoiceSample = function (){
    window.aogSpeak(curLang() === "es" ? "Hola, soy tu voz de lectura." : "Hi — I'm your reading voice.");
  };
  window.aogPopulateVoices = function (){
    var sel = document.getElementById("a11yVoiceSel"); if (!sel) return;
    var vs = (window.speechSynthesis && window.speechSynthesis.getVoices()) || [];
    if (!vs.length) return;
    var es = curLang() === "es", pref = aogStoredVoiceName();
    var cur = es ? /^es/i : /^en/i;
    var inLang = vs.filter(function (v){ return cur.test(v.lang || ""); });
    var others = vs.filter(function (v){ return !cur.test(v.lang || ""); });
    function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"); }
    function opt(v){ return '<option value="' + esc(v.name) + '"' + (v.name === pref ? ' selected' : '') + '>' + esc(v.name + " · " + (v.lang || "")) + '</option>'; }
    var html = '<option value="">' + (es ? "Automática (recomendada)" : "Auto (recommended)") + '</option>';
    html += inLang.map(opt).join("");
    if (others.length){ html += '<optgroup label="' + (es ? "Otros idiomas" : "Other languages") + '">' + others.map(opt).join("") + '</optgroup>'; }
    sel.innerHTML = html;
  };
  /* warm up the voice list early (some browsers load it async) and fill the picker */
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = function(){ window.speechSynthesis.getVoices(); if (window.aogPopulateVoices) window.aogPopulateVoices(); };
      setTimeout(function(){ if (window.aogPopulateVoices) window.aogPopulateVoices(); }, 400);
    }
  } catch (e) {}
  function readOn(){ return de().classList.contains("a11y-read"); }
  function picOn(){ return de().classList.contains("a11y-pictures"); }
  /* Quiet Space "right now" choices are states, not a 1-4 amount — so each gets a
     meaningful picture keyed by its (audience-independent) data-state. */
  var RN_STATE_ICONS = {
    hyper: "⚡", window: "🌿", hypo: "🪨",
    quiet: "🙂", nag: "💭", loud: "📢", rail: "🌀",
    clear: "☀️", scattered: "🍃", loop: "🔁", fog: "🌫️",
    small: "🔹", wave: "🌊", big: "🔺", over: "🌪️"
  };

  window.aogA11yEnhance = function () {
    var item = document.getElementById("itemText");
    var area = document.getElementById("responseArea");
    /* read-aloud button beneath the question */
    if (item && item.parentNode) {
      var host = item.parentNode;
      var btn = host.querySelector(".a11y-readbtn");
      if (readOn()) {
        if (!btn) { btn = document.createElement("button"); btn.type = "button"; btn.className = "a11y-readbtn"; host.insertBefore(btn, item.nextSibling); }
        btn.innerHTML = '<span aria-hidden="true">🔊</span> <span>' + (curLang() === "es" ? "Escuchar" : "Hear this") + '</span>';
        btn.setAttribute("aria-label", curLang() === "es" ? "Escuchar la pregunta y las respuestas" : "Hear the question and answers");
        btn.onclick = function () {
          var parts = [(item.textContent || "").trim()];
          if (area) { area.querySelectorAll(".freq-label").forEach(function (l) { var t = (l.textContent || "").trim(); if (t) parts.push(t); }); }
          window.aogSpeak(parts.join(". "));
        };
        btn.style.display = "";
      } else if (btn) { btn.style.display = "none"; }
    }
    /* picture/level dots on each answer choice (valence-neutral "how often" amount) */
    if (area) {
      var opts = area.querySelectorAll(".response-option");
      var n = opts.length;
      opts.forEach(function (o, i) {
        var dots = o.querySelector(".a11y-dots");
        if (picOn()) {
          if (!dots) { dots = document.createElement("div"); dots.className = "a11y-dots"; dots.setAttribute("aria-hidden", "true"); o.insertBefore(dots, o.firstChild); }
          var s = ""; for (var k = 0; k < n; k++) { s += '<span class="a11y-dot' + (k <= i ? " on" : "") + '"></span>'; }
          dots.innerHTML = s; dots.style.display = "";
        } else if (dots) { dots.style.display = "none"; }
      });
    }
    /* read-aloud on the open-ended reflection screen (title + prompt + word choices) */
    var rTitle = document.getElementById("reflectionTitle");
    if (rTitle && rTitle.parentNode) {
      var rHost = rTitle.parentNode;
      var rBtn = rHost.querySelector(".a11y-readbtn");
      if (readOn()) {
        if (!rBtn) { rBtn = document.createElement("button"); rBtn.type = "button"; rBtn.className = "a11y-readbtn"; var rp0 = document.getElementById("reflectionPrompt"); rHost.insertBefore(rBtn, (rp0 && rp0.nextSibling) || null); }
        rBtn.innerHTML = '<span aria-hidden="true">🔊</span> <span>' + (curLang() === "es" ? "Escuchar" : "Hear this") + '</span>';
        rBtn.setAttribute("aria-label", curLang() === "es" ? "Escuchar la pregunta y las opciones" : "Hear the question and choices");
        rBtn.onclick = function () {
          var parts = [(rTitle.textContent || "").trim()];
          var rp = document.getElementById("reflectionPrompt"); if (rp && rp.textContent) parts.push(rp.textContent.trim());
          var opts = document.getElementById("reflectionOptions");
          if (opts) { opts.querySelectorAll("button, .choice-chip, .chip").forEach(function (c) { var t = (c.textContent || "").trim(); if (t) parts.push(t); }); }
          window.aogSpeak(parts.join(". "));
        };
        rBtn.style.display = "";
      } else if (rBtn) { rBtn.style.display = "none"; }
    }
    /* read-aloud on the quick check-ins (Right Now / Quiet Space, burnout tank): .tk-q + .tk-opts */
    var tkqs = document.querySelectorAll(".tk-q");
    for (var ti = 0; ti < tkqs.length; ti++) {
      (function (q) {
        if (!q.getAttribute("data-qtext")) q.setAttribute("data-qtext", (q.textContent || "").trim());
        var mb = q.querySelector(".a11y-readbtn-mini");
        if (readOn()) {
          if (!mb) { mb = document.createElement("button"); mb.type = "button"; mb.className = "a11y-readbtn-mini"; mb.innerHTML = '<span aria-hidden="true">🔊</span>'; q.appendChild(mb); }
          mb.setAttribute("aria-label", curLang() === "es" ? "Escuchar la pregunta y las opciones" : "Hear the question and choices");
          mb.onclick = function (ev) {
            if (ev) ev.stopPropagation();
            var parts = [q.getAttribute("data-qtext") || ""];
            var o = (q.nextElementSibling && q.nextElementSibling.classList && q.nextElementSibling.classList.contains("tk-opts")) ? q.nextElementSibling : (q.parentNode ? q.parentNode.querySelector(".tk-opts") : null);
            if (o) { o.querySelectorAll("button, [role='radio']").forEach(function (b) { var t = (b.textContent || "").trim(); if (t) parts.push(t); }); }
            window.aogSpeak(parts.join(". "));
          };
          mb.style.display = "";
        } else if (mb) { mb.style.display = "none"; }
      })(tkqs[ti]);
    }
    /* picture answers on the burnout-tank frequency pills — ascending dots (an amount, 0-3) */
    var freqPills = document.querySelectorAll(".tk-pill[data-v]");
    for (var fj = 0; fj < freqPills.length; fj++) {
      (function (pill) {
        var v = parseInt(pill.getAttribute("data-v"), 10); if (isNaN(v)) return;
        var dots = pill.querySelector(".a11y-dots");
        if (picOn()) {
          if (!dots) { dots = document.createElement("span"); dots.className = "a11y-dots"; dots.setAttribute("aria-hidden", "true"); pill.insertBefore(dots, pill.firstChild); }
          var s = ""; for (var k = 0; k < 4; k++) { s += '<span class="a11y-dot' + (k <= v ? " on" : "") + '"></span>'; }
          dots.innerHTML = s; dots.style.display = "";
        } else if (dots) { dots.style.display = "none"; }
      })(freqPills[fj]);
    }
    /* picture answers on the Quiet Space state pills — an icon per state (not a 1-4 scale) */
    var pills = document.querySelectorAll(".tk-pill[data-state]");
    for (var pj = 0; pj < pills.length; pj++) {
      (function (pill) {
        var ico = pill.querySelector(".a11y-pic-ico");
        if (picOn()) {
          var em = RN_STATE_ICONS[pill.getAttribute("data-state")];
          if (em) {
            if (!ico) { ico = document.createElement("span"); ico.className = "a11y-pic-ico"; ico.setAttribute("aria-hidden", "true"); pill.insertBefore(ico, pill.firstChild); }
            ico.textContent = em + " "; ico.style.display = "";
          }
        } else if (ico) { ico.style.display = "none"; }
      })(pills[pj]);
    }
    /* keep any in-card "Read aloud" toggle (Quiet Space) in sync with the state */
    var rnRd = document.querySelectorAll(".rn-read-toggle");
    for (var ri = 0; ri < rnRd.length; ri++) rnRd[ri].setAttribute("aria-pressed", readOn() ? "true" : "false");
  };

  function watch(){
    /* the Quiet Space rebuilds its pills on audience switch — re-enhance afterward so icons/speakers persist */
    if (typeof window.aogRenderRightNow === "function" && !window.aogRenderRightNow.__a11yWrapped) {
      var _origRN = window.aogRenderRightNow;
      window.aogRenderRightNow = function () { var r = _origRN.apply(this, arguments); try { window.aogA11yEnhance(); } catch (e) {} return r; };
      window.aogRenderRightNow.__a11yWrapped = true;
    }
    /* the burnout tank re-renders its question text/options on audience switch — re-enhance afterward */
    if (typeof window.aogRenderTankCopy === "function" && !window.aogRenderTankCopy.__a11yWrapped) {
      var _origTank = window.aogRenderTankCopy;
      window.aogRenderTankCopy = function () { var r = _origTank.apply(this, arguments); try { window.aogA11yEnhance(); } catch (e) {} return r; };
      window.aogRenderTankCopy.__a11yWrapped = true;
    }
    var area = document.getElementById("responseArea");
    var item = document.getElementById("itemText");
    var rTitleEl = document.getElementById("reflectionTitle");
    if (rTitleEl) { try { new MutationObserver(function () { window.aogA11yEnhance(); }).observe(rTitleEl, { childList: true, characterData: true, subtree: true }); } catch (e) {} }
    /* responseArea: only direct childList (renderResponseOptions replaces innerHTML on a new scale) */
    if (area) { try { new MutationObserver(function () { window.aogA11yEnhance(); }).observe(area, { childList: true }); } catch (e) {} }
    /* itemText changes on every question — the reliable per-item trigger; enhance never edits it, so no loop */
    if (item) { try { new MutationObserver(function () { window.aogA11yEnhance(); }).observe(item, { childList: true, characterData: true, subtree: true }); } catch (e) {} }
    window.aogA11yEnhance();
  }
  if (document.readyState !== "loading") watch(); else document.addEventListener("DOMContentLoaded", watch);
})();
