
/* Personal Wisdom Memory — students mark what helps them regulate.
   PRIVACY: stored ONLY in localStorage under "aog_preferred_support".
   It is never written into STORAGE_KEY records, never passed to syncRecord(),
   and therefore never included in MTSS reporting or Google Sheets sync.
   clearLocalData() also removes it. No dashboard, no export. */
(function () {
  "use strict";
  var KEY = "aog_preferred_support";
  var MAX = 6;
  var OPTS = [
    { v: "quiet",      ic: "🤫", en: "Quiet",              es: "Silencio" },
    { v: "movement",   ic: "🏃", en: "Movement",           es: "Movimiento" },
    { v: "music",      ic: "🎵", en: "Music",              es: "Música" },
    { v: "drawing",    ic: "🎨", en: "Drawing",            es: "Dibujar" },
    { v: "reading",    ic: "📖", en: "Reading",            es: "Leer" },
    { v: "breathing",  ic: "🫁", en: "Deep Breathing",     es: "Respiración profunda" },
    { v: "talking",    ic: "💬", en: "Talking to Someone", es: "Hablar con alguien" },
    { v: "water",      ic: "💧", en: "Water Break",        es: "Pausa de agua" },
    { v: "nature",     ic: "🌿", en: "Nature",             es: "Naturaleza" },
    { v: "stretching", ic: "🤸", en: "Stretching",         es: "Estiramiento" },
    { v: "else",       ic: "✨",       en: "Something Else",     es: "Algo más" }
  ];
  function curLang() {
    var es = (typeof surveyLang !== "undefined" && surveyLang === "es") ||
             (typeof lang !== "undefined" && lang === "es");
    return es ? "es" : "en";
  }
  function esc(s) {
    if (typeof escapeHtml === "function") { try { return escapeHtml(s); } catch (e) {} }
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[c];
    });
  }
  function read() {
    try { var a = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function write(a) {
    try { localStorage.setItem(KEY, JSON.stringify(a.slice(0, MAX))); } catch (e) {}
  }
  function optFor(v) { for (var i = 0; i < OPTS.length; i++) { if (OPTS[i].v === v) return OPTS[i]; } return null; }
  function labelOf(entry, l) {
    l = l || curLang();
    if (entry.v === "else" && entry.text) return entry.text;
    var o = optFor(entry.v);
    return o ? (l === "es" ? o.es : o.en) : (entry.text || entry.v);
  }
  function sameEntry(e, v, text) {
    if (e.v !== v) return false;
    if (v === "else") return (e.text || "") === (text || "");
    return true;
  }

  // ---- public data API ----
  window.aogWisdomGet = read;
  window.aogWisdomAdd = function (v, text) {
    var a = read().filter(function (e) { return !sameEntry(e, v, text); });
    var entry = { v: v, ts: Date.now() };
    if (v === "else" && text) entry.text = text;
    a.unshift(entry);
    write(a);
    return a;
  };
  window.aogWisdomRemove = function (v, text) {
    var a = read().filter(function (e) { return !sameEntry(e, v, text); });
    write(a);
    return a;
  };

  // ---- rendering ----
  function pickerHtml(l, prefs) {
    var prompt = l === "es" ? "¿Qué suele ayudarte cuando te sientes así?" : "What usually helps when you’re feeling this way?";
    var sub = l === "es" ? "Toca lo que te funcione. Se guarda solo en este dispositivo." : "Tap what works for you — saved only on this device.";
    var savedSet = {};
    prefs.forEach(function (e) { if (e.v !== "else") savedSet[e.v] = 1; });
    var chips = OPTS.map(function (o) {
      var on = savedSet[o.v] ? " on" : "";
      var labtxt = l === "es" ? o.es : o.en;
      return "<button type=\"button\" class=\"choice-chip aog-wisdom-chip" + on + "\" data-v=\"" + o.v +
        "\" onclick=\"aogWisdomToggle(this)\"><span class=\"wic\" aria-hidden=\"true\">" + o.ic + "</span>" + esc(labtxt) + "</button>";
    }).join("");
    var elseRow = "<div class=\"aog-wisdom-else\" hidden>" +
        "<input type=\"text\" maxlength=\"40\" placeholder=\"" +
        (l === "es" ? "Escribe lo que te ayuda…" : "Type what helps…") +
        "\" onkeydown=\"if(event.key==='Enter'){event.preventDefault();aogWisdomSaveElse(this);}\">" +
        "<button type=\"button\" class=\"btn\" onclick=\"aogWisdomSaveElse(this)\">" + (l === "es" ? "Guardar" : "Save") + "</button>" +
      "</div>";
    return "<div class=\"aog-wisdom-picker\">" +
        "<div class=\"aog-wisdom-q\">" + prompt + "</div>" +
        "<div class=\"aog-wisdom-sub\">" + sub + "</div>" +
        "<div class=\"aog-wisdom-chips\">" + chips + "</div>" +
        elseRow +
        "<div class=\"aog-wisdom-saved\" hidden></div>" +
      "</div>";
  }
  function recallHtml(l, prefs, mode) {
    if (!prefs.length) return "";
    var top = esc(labelOf(prefs[0], l));
    var line = (mode === "farewell")
      ? (l === "es" ? "La última vez, “" + top + "” te ayudó. ¿Quieres intentarlo otra vez?"
                    : "Last time, “" + top + "” helped. Would you like to try that again?")
      : (l === "es" ? "La última vez elegiste “" + top + "” como algo que te ayuda. Llévalo contigo hoy."
                    : "You previously chose “" + top + "” as a helpful strategy. Keep it close today.");
    var others = prefs.slice(1, 4).map(function (e) { return esc(labelOf(e, l)); });
    var othersLine = others.length
      ? "<div class=\"aog-wisdom-others\">" + (l === "es" ? "También guardaste: " : "You’ve also saved: ") + others.join(" · ") + "</div>"
      : "";
    return "<div class=\"aog-wisdom-recall\">" +
        "<div class=\"aog-wisdom-recall-ic\" aria-hidden=\"true\">🌱</div>" +
        "<div><div class=\"aog-wisdom-recall-line\">" + line + "</div>" + othersLine + "</div>" +
      "</div>";
  }

  function resetLinkHtml(l) {
    var t = l === "es" ? "Borrar mis estrategias guardadas" : "Reset my saved strategies";
    return "<div class=\"aog-wisdom-reset\"><button type=\"button\" class=\"aog-wisdom-reset-link\" aria-label=\"" + t + "\" onclick=\"aogWisdomReset()\">" + t + "</button></div>";
  }
  window.aogWisdomReset = function () {
    var l = curLang();
    var msg = l === "es"
      ? "Esto borrará con cuidado las estrategias que guardaste en este dispositivo, para empezar de nuevo cuando quieras. Tus reflexiones no se ven afectadas. ¿Continuar?"
      : "This gently clears the strategies you've saved on this device, so you can start fresh whenever you like. Your reflections aren't affected. Continue?";
    if (!window.confirm(msg)) return;
    try { localStorage.removeItem(KEY); } catch (e) {}
    try { window.aogWisdomMount("aogWisdomFarewell", "farewell"); } catch (e) {}
    try { window.aogWisdomMount("aogWisdomResults", "farewell"); } catch (e) {}
    try { window.aogWisdomMount("aogWisdomIntro", "intro"); } catch (e) {}
  };

  window.aogWisdomMount = function (id, mode) {
    var box = document.getElementById(id);
    if (!box) return;
    var l = curLang();
    var prefs = read();
    var html = recallHtml(l, prefs, mode);
    if (mode === "farewell") { html += pickerHtml(l, prefs); if (prefs.length) html += resetLinkHtml(l); }
    box.innerHTML = html;
    box.style.display = html ? "" : "none";
  };

  function pickerOf(elFrom) { return (elFrom && elFrom.closest) ? elFrom.closest(".aog-wisdom-picker") : null; }
  window.aogWisdomToggle = function (btn) {
    var picker = pickerOf(btn);
    var v = btn.getAttribute("data-v");
    if (v === "else") {
      var row = picker ? picker.querySelector(".aog-wisdom-else") : null;
      if (row) {
        row.hidden = !row.hidden;
        if (!row.hidden) { var inp = row.querySelector("input"); if (inp) inp.focus(); }
      }
      return;
    }
    var on = btn.classList.toggle("on");
    if (on) window.aogWisdomAdd(v); else window.aogWisdomRemove(v);
    flashSaved(on, picker);
  };
  window.aogWisdomSaveElse = function (elFrom) {
    var picker = pickerOf(elFrom);
    var row = picker ? picker.querySelector(".aog-wisdom-else") : null;
    var inp = row ? row.querySelector("input") : null;
    if (!inp) return;
    var t = (inp.value || "").trim();
    if (!t) return;
    window.aogWisdomAdd("else", t);
    inp.value = "";
    if (row) row.hidden = true;
    flashSaved(true, picker);
  };
  function flashSaved(saved, picker) {
    var n = picker ? picker.querySelector(".aog-wisdom-saved") : null;
    if (!n) return;
    var l = curLang();
    n.textContent = saved
      ? (l === "es" ? "Guardado en este dispositivo ✓" : "Saved on this device ✓")
      : (l === "es" ? "Quitado" : "Removed");
    n.hidden = false;
  }

  // mount on the right screens, via showScreen
  window.aogWisdomOnScreen = function (screenId) {
    if (screenId === "screen-choose") window.aogWisdomMount("aogWisdomIntro", "intro");
    else if (screenId === "screen-farewell") window.aogWisdomMount("aogWisdomFarewell", "farewell");
    else if (screenId === "screen-myresults") window.aogWisdomMount("aogWisdomResults", "farewell");
  };

  // initial load: if the choose screen is already active, show the welcome-back recall
  document.addEventListener("DOMContentLoaded", function () {
    var active = document.querySelector(".screen.active");
    if (active && active.id === "screen-choose") window.aogWisdomMount("aogWisdomIntro", "intro");
  });
})();
