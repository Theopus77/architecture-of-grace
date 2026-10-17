/* AOG-ONEBUTTON-V1 (2026-10-12) — One-button and big-switch play. Jimmy picked: "Any instrument can be played with one
   large button, a switch or the space bar, and the Studio keeps it in key and in time. Every learner can make real music."

   This small file only draws the closed "One button" block in a room (#oneBlk) and remembers whether it was on. The
   rest (the big button, the switches, the timing) is aog-onebutton-play.js, fetched the first time the block is opened
   (or after the page has loaded, when one button was left on in this room). Nothing sounds or moves until a press.

   A room joins with window.AOGOneRoom (see aog-onebutton-play.js for what it gives) and <div id="oneBlk"></div>.
   aog-midi.js asks AOGOne.midi(cmd, note, vel) before a room plays a MIDI key: true means one button took it. */
(function () {
  "use strict";
  var D = document;
  if (window.AOGOne && window.AOGOne.stub) return;
  var SUM = { en: "One button", es: "Un botón" };
  function lang() { var R = window.AOGOneRoom; try { if (R && R.lang) return R.lang() === "es" ? "es" : "en"; } catch (e) {} return D.documentElement.lang === "es" ? "es" : "en"; }
  function saved() { var R = window.AOGOneRoom; try { var c = JSON.parse(localStorage.getItem("aog.onebutton." + R.room + ".v1") || "null"); return !!(c && c.on); } catch (e) { return false; } }
  var CSS = ".ob [hidden]{display:none!important}" +
    ".ob{margin:0;border:1px solid #3d5247;border-radius:14px;background:#15201b;color:#eef3ee}" +
    ".ob>summary{min-height:52px;display:flex;align-items:center;gap:.55rem;padding:0 16px;cursor:pointer;list-style:none;font:800 1.02rem/1.2 var(--sans,system-ui,sans-serif);color:#f2f6f1}" +
    ".ob>summary::-webkit-details-marker{display:none}.ob>summary::before{content:'\\25B8';color:#a9d3bd}.ob[open]>summary::before{content:'\\25BE'}" +
    ".ob>summary:focus-visible{outline:3px solid #f0c26e;outline-offset:2px;border-radius:12px}" +
    "@media print{.ob{display:none}}";
  var P = null;
  function load() {
    if (P) return P;
    P = new Promise(function (ok) {
      if (window.AOGOne && window.AOGOne.ready) { ok(); return; }
      var s = D.createElement("script"); s.src = "/aog-onebutton-play.js"; s.async = true;
      s.onload = function () { ok(); }; s.onerror = function () { P = null; ok(); };
      D.head.appendChild(s);
    }).then(function () { if (window.AOGOne && window.AOGOne.mount) window.AOGOne.mount(); });
    return P;
  }
  function mount() {
    var host = D.getElementById("oneBlk"), R = window.AOGOneRoom;
    if (!host || !R || D.getElementById("obBox")) return;
    if (!D.getElementById("ob-css")) { var st = D.createElement("style"); st.id = "ob-css"; st.textContent = CSS; D.head.appendChild(st); }
    host.innerHTML = '<details class="ob no-print" id="obBox"><summary id="obSum"></summary><div class="ob-in" id="obIn"></div></details>';
    var box = D.getElementById("obBox"), sum = D.getElementById("obSum");
    var paint = function () { sum.textContent = SUM[lang()]; };
    paint();
    try { new MutationObserver(paint).observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
    var auto = false;
    box.addEventListener("toggle", function () { if (box.open && !auto) load(); });
    /* left on in this room: open, and ready once the page has loaded (never before the first paint) */
    if (saved()) {
      auto = true; box.open = true;
      var later = function () { auto = false; load(); };
      if (D.readyState === "complete") setTimeout(later, 0); else window.addEventListener("load", later, { once: true });
    }
  }
  window.AOGOne = { stub: true, load: load, midi: function () { return false; } };
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", mount); else mount();
})();
