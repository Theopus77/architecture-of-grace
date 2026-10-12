/* ══ AOG-JAM-V1 (2026-10-12) — A band that follows you ═══════════════════════════════════════════════════════════════
   Jimmy picked: "A band that follows you. Play the piano or a real guitar, and the drums and bass follow your tempo and
   your chords as you go. It's like a jam partner who never gets tired."

   In the Piano, the Guitar, the Bass and the Band: one closed "Jam with me" / "Toca conmigo", in the instrument's own
   panel, under the takes. This file is only the door: it draws the closed block and nothing else. The band itself
   (aog-jam-band.js, window.AOGJamBand) is fetched the first time the block is opened, and it makes no sound and runs no
   timer until Start the band is pressed (the silent treatment: nothing loads, plays or ticks before it is needed).

   A room says what it can do before this file runs (it is loaded with defer):
     window.AOGJamRoom = { room:"piano"|"guitar"|"bass"|"band", lang:()=>"en"|"es",
       ctx:()=>the room's live AudioContext (made on the press if need be),
       into:(rec)=>the node the band joins: rec true = the room's limiter (so it is in a take, aog-recorder.js listens
             right after it), rec false = the room's Volume (heard, never in a take),
       busy:()=>true while the room's own pattern plays (its notes are not the learner's),
       song:()=>({bpm, key, minor}) the room's own tempo and key }
   and puts <div id="jamBox"></div> where the block goes.
     AOGJam.load()  Promise of the band (AOGJamBand), for the tests. ══════════════════════════════════════════════════ */
(function () {
  "use strict";
  var D = document, H = null, BOX = null, P = null;
  var SUM = { en: "Jam with me", es: "Toca conmigo" };
  function L() { try { if (H && H.lang) return H.lang() === "es" ? "es" : "en"; } catch (e) {} return (D.documentElement.getAttribute("lang") || "en").indexOf("es") === 0 ? "es" : "en"; }
  var CSS = [
    ".jm [hidden]{display:none!important}",
    ".jm{margin:.9rem 0 0;border:1px solid #3a3e44;border-radius:14px;background:#141619;color:#ece6da}",
    ".jm>summary{min-height:52px;display:flex;align-items:center;gap:.55rem;padding:0 16px;cursor:pointer;list-style:none;font:800 1.02rem/1.2 var(--sans,system-ui,sans-serif);color:#f3efe6}",
    ".jm>summary::-webkit-details-marker{display:none}.jm>summary::before{content:'\\25B8';color:#f0c26e}.jm[open]>summary::before{content:'\\25BE'}",
    ".jm>summary:focus-visible{outline:3px solid #f0c26e;outline-offset:2px;border-radius:12px}",
    ".jm-in{padding:0 14px 16px;display:grid;gap:.75rem}",
    ".jm .line{margin:0;color:#e3dac9}",
    ".jm-chks{display:flex;flex-wrap:wrap;gap:.2rem 1.2rem}",
    ".jm-chk{display:inline-flex;align-items:center;gap:.5rem;min-height:44px;color:#e3dac9;font-weight:700;cursor:pointer}",
    ".jm-chk input{width:22px;height:22px;accent-color:#f0c26e;margin:0}",
    ".jm-level{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap}.jm-level .plab{margin:0}",
    ".jm-level input{flex:1 1 10rem;min-width:8rem;accent-color:#f0c26e;min-height:44px}",
    ".jm-level b{min-width:3ch;color:#f3efe6;font-variant-numeric:tabular-nums}",
    ".jm-now{display:flex;flex-wrap:wrap;align-items:baseline;gap:.3rem 1rem;padding:.7rem .9rem;border:1px solid #3a3e44;border-radius:12px;background:#0f1012}",
    ".jm-now .plab{margin:0;flex:0 0 100%;color:#d8cfbf}",
    ".jm-big{font:800 2.4rem/1.05 var(--sans,system-ui,sans-serif);color:#fff3d1;min-width:3ch}",
    ".jm-bpm{font:700 1.05rem/1.3 var(--sans,system-ui,sans-serif);color:#e3dac9;font-variant-numeric:tabular-nums}",
    "@media print{.jm{display:none}}"
  ].join("\n");
  function paintSum() { var s = D.getElementById("jmSum"); if (s && s.textContent !== SUM[L()]) s.textContent = SUM[L()]; }
  function load() {
    if (!P) P = new Promise(function (ok, no) {
      if (window.AOGJamBand) return ok(window.AOGJamBand);
      var s = D.createElement("script"); s.src = "/aog-jam-band.js"; s.async = true;
      s.onload = function () { window.AOGJamBand ? ok(window.AOGJamBand) : no(new Error("no band")); };
      s.onerror = function () { P = null; no(new Error("no band")); };
      D.head.appendChild(s);
    }).then(function (B) { B.attach(H, { box: BOX, inner: D.getElementById("jmIn"), lang: L }); return B; });
    return P;
  }
  function mount() {
    var host = D.getElementById("jamBox"); if (!host || BOX) return;
    if (!D.getElementById("jm-css")) { var st = D.createElement("style"); st.id = "jm-css"; st.textContent = CSS; D.head.appendChild(st); }
    host.innerHTML = '<details class="jm no-print" id="jmBox"><summary id="jmSum"></summary><div class="jm-in" id="jmIn"></div></details>';
    BOX = D.getElementById("jmBox"); paintSum();
    BOX.addEventListener("toggle", function () {
      if (BOX.open) load().then(function (B) { B.shown(true); }, function () {
        var i = D.getElementById("jmIn"); if (i) i.innerHTML = '<p class="line">' + (L() === "es" ? "La banda no se cargó. Revisa el internet y vuelve a abrir esto." : "The band did not load. Check the internet, then open this again.") + "</p>"; });
      else if (window.AOGJamBand) AOGJamBand.shown(false);   /* closed: the band ends softly, so Stop is never out of sight */
    });
    try { new MutationObserver(function () { paintSum(); if (window.AOGJamBand) AOGJamBand.paint(); }).observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
  }
  function attach(h) { H = h || null; if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", mount); else mount(); }
  window.AOGJam = { attach: attach, load: load, room: function () { return H; } };
  if (window.AOGJamRoom) attach(window.AOGJamRoom);
})();
