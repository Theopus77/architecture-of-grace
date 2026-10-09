/* ══ AOG-ROOM-VU-V1 (2026-10-09) — Jimmy, of the Mixing Desk's VU meters: "Can the VU meters work in the instruments page as
   well, but much smaller." Every music room gets a small pair, left and right.

   How it hears: a room's sound reaches the speakers through its AudioContext's destination. This file, loaded before the
   room makes any sound, also sends whatever is connected to the destination to a quiet listening branch (two analysers that
   lead to a gain of 0), so the meters read exactly what you hear, after the room's Volume. Nothing about the sound changes.
   It is a plain <script src="/aog-vu.js"></script> in the page's head (the Studio shell loads it too, for the drawing).

   Where they sit: on a room's own page, beside its Record button. Inside the Recording Studio the room's Record button is
   tucked away under "Lessons and more", so the shell shows the pair in its bottom bar for the room you are in (the Mixing
   Desk has its own large ones).

   How they move (the same rule as the desk's meters): on a computer the needles swing with the sound; on a touch screen or
   with "reduce motion" set they step to the loudest point of what you are playing now and stay there, and rest again a few
   seconds after the sound stops. A room plays near full strength, so here 0 VU is 3 dB under the top (the desk's is 8).
   Nothing moves while it is quiet.

   AOGVU.levels()            → [left dB, right dB] of this page's sound right now (or null before any sound)
   AOGVU.mount(el, {source}) → a small pair inside el; source() gives the levels to show (default: this page's)
   AOGVU.draw(canvas, dB, "L")  draws one meter (dB null = at rest) ══ */
(function () {
  "use strict";
  if (window.AOGVU) return;
  var AN = window.AudioNode, DEST = window.AudioDestinationNode, OFF = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  var OWN = typeof WeakSet === "function" ? new WeakSet() : null, BUSES = [], orig = AN && AN.prototype.connect, origDis = AN && AN.prototype.disconnect;
  var BUSMAP = typeof WeakMap === "function" ? new WeakMap() : null;
  function own(n) { if (OWN) OWN.add(n); return n; }
  function bus(ctx) {
    if (!ctx || (OFF && ctx instanceof OFF) || !BUSMAP) return null;
    var b = BUSMAP.get(ctx); if (b) return b;
    try {
      var g = own(ctx.createGain()), sp = own(ctx.createChannelSplitter(2)), a0 = own(ctx.createAnalyser()), a1 = own(ctx.createAnalyser()), z = own(ctx.createGain());
      z.gain.value = 0; a0.fftSize = 2048; a1.fftSize = 2048;
      orig.call(g, sp); orig.call(sp, a0, 0); orig.call(sp, a1, 1); orig.call(a0, z); orig.call(a1, z); orig.call(z, ctx.destination);
      b = { ctx: ctx, g: g, a: [a0, a1], d: new Float32Array(2048) };
      BUSMAP.set(ctx, b); BUSES.push(b);
    } catch (e) { return null; }
    return b;
  }
  if (AN && orig && DEST) {
    AN.prototype.connect = function (dest, output) {
      var r = orig.apply(this, arguments);
      try { if (dest instanceof DEST && !(OWN && OWN.has(this))) { var b = bus(this.context); if (b) orig.call(this, b.g, output || 0); } } catch (e) {}
      return r;
    };
    AN.prototype.disconnect = function (dest) {
      var r = origDis.apply(this, arguments);
      try { if (dest instanceof DEST && BUSMAP) { var b = BUSMAP.get(this.context); if (b) origDis.call(this, b.g); } } catch (e) {}
      return r;
    };
  }
  function levels() {
    var best = null;
    for (var i = 0; i < BUSES.length; i++) {
      var b = BUSES[i]; if (!b.ctx || b.ctx.state !== "running") continue;
      var lv = [0, 1].map(function (ch) { var a = b.a[ch]; a.getFloatTimeDomainData(b.d); var pk = 0; for (var k = 0; k < b.d.length; k++) { var v = b.d[k] < 0 ? -b.d[k] : b.d[k]; if (v > pk) pk = v; } return pk > 0 ? 20 * Math.log10(pk) : -90; });
      if (!best || Math.max(lv[0], lv[1]) > Math.max(best[0], best[1])) best = lv;
    }
    return best;
  }
  /* one meter: the bezel, a cream face lit from below, the scale in VU steps with its red zone, the needle, the hood, glass */
  var MARKS = [-20, -10, -7, -5, -3, -2, -1, 0, 1, 2, 3];
  function pos(vu) { var lo = Math.pow(10, -20 / 20), hi = Math.pow(10, 3 / 20); return Math.max(-0.03, Math.min(1.04, (Math.pow(10, Math.max(-40, Math.min(4, vu)) / 20) - lo) / (hi - lo))); }
  function draw(cv, db, side, cal) {
    if (!cv || !cv.getContext) return;
    var r = cv.getBoundingClientRect(); if (!(r.width > 0 && r.height > 0)) return;
    var dpr = Math.min(3, window.devicePixelRatio || 1), W = Math.round(r.width), H = Math.round(r.height);
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    var g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    var small = W < 110, inset = small ? 2.5 : 4;
    function rr(x, y, w, h, k) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, k); else g.rect(x, y, w, h); }
    rr(0, 0, W, H, small ? 4 : 7); g.fillStyle = "#08090a"; g.fill();
    var fx = inset, fy = inset, fw = W - 2 * inset, fh = H - 2 * inset;
    var face = g.createRadialGradient(W / 2, fy + fh * 1.05, fh * 0.1, W / 2, fy + fh * 0.9, fw * 0.75);
    face.addColorStop(0, "#fff4d2"); face.addColorStop(0.55, "#f3e2b4"); face.addColorStop(1, "#d9c08a");
    rr(fx, fy, fw, fh, small ? 2.5 : 4); g.fillStyle = face; g.fill();
    var cx = W / 2, cy = fy + fh * 1.08, R = fh * 0.76, A = 0.86;
    function ang(p) { return -Math.PI / 2 - A + p * 2 * A; }
    function at(p, rad) { return [cx + Math.cos(ang(p)) * rad, cy + Math.sin(ang(p)) * rad]; }
    g.lineCap = "round";
    g.strokeStyle = "#2a2116"; g.lineWidth = small ? 0.8 : 1.1; g.beginPath(); g.arc(cx, cy, R, ang(0), ang(pos(0))); g.stroke();
    g.strokeStyle = "#b8321e"; g.lineWidth = small ? 2 : 3; g.beginPath(); g.arc(cx, cy, R + (small ? 1 : 1.5), ang(pos(0)), ang(1)); g.stroke();
    var fs = Math.max(8, Math.min(11, fh * 0.14));
    g.font = "500 " + fs + "px Fraunces, Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle";
    MARKS.forEach(function (m) {
      var p = pos(m), red = m > 0, a1 = at(p, R), a2 = at(p, R + (small ? (m === 0 ? 4 : 2.5) : (m === 0 || m === -20 || m === 3 ? 7 : 5))), t = at(p, R + fs * 1.25);
      g.strokeStyle = red ? "#b8321e" : "#2a2116"; g.lineWidth = m === 0 ? (small ? 1.1 : 1.6) : (small ? 0.7 : 1);
      g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(a2[0], a2[1]); g.stroke();
      if (!small && (m === -20 || m === -10 || m === -5 || m === 0 || m === 3 || (W > 200 && (m === -7 || m === -3 || m === -1)))) {
        g.fillStyle = red ? "#a52a17" : "#2a2116"; g.fillText(m === -20 ? "−20" : m === 3 ? "+3" : String(Math.abs(m)), t[0], t[1]);
      }
    });
    g.fillStyle = "#2a2116"; g.font = "400 " + Math.round(small ? fh * 0.3 : fs * 1.7) + "px Fraunces, Georgia, serif"; g.fillText("VU", cx, fy + fh * (small ? 0.6 : 0.64));
    if (!small) { g.font = "700 " + Math.round(fs * 0.85) + "px system-ui, sans-serif"; g.fillStyle = "#6b5a3a"; g.textAlign = "left"; g.fillText(side, fx + 7, fy + fh - 9); g.textAlign = "center"; }
    var p = db == null ? -0.03 : pos(db + (cal == null ? 8 : cal)), n = at(p, R + (small ? 3 : 6)), b0 = at(p, fh * 0.32);
    g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = small ? 1.4 : 2; g.beginPath(); g.moveTo(b0[0] + 1, b0[1] + 1.5); g.lineTo(n[0] + 1, n[1] + 1.5); g.stroke();
    g.strokeStyle = "#16110a"; g.lineWidth = small ? 1 : 1.3; g.beginPath(); g.moveTo(b0[0], b0[1]); g.lineTo(n[0], n[1]); g.stroke();
    var hood = g.createLinearGradient(0, fy + fh * 0.78, 0, fy + fh); hood.addColorStop(0, "#2b2d31"); hood.addColorStop(1, "#141518");
    g.save(); rr(fx, fy, fw, fh, small ? 2.5 : 4); g.clip();
    g.fillStyle = hood; g.beginPath(); g.ellipse(cx, fy + fh + fh * 0.1, fw * 0.3, fh * 0.3, 0, Math.PI, 2 * Math.PI); g.fill();
    var gl = g.createLinearGradient(fx, fy, fx + fw * 0.6, fy + fh);
    gl.addColorStop(0, "rgba(255,255,255,.38)"); gl.addColorStop(0.35, "rgba(255,255,255,.06)"); gl.addColorStop(0.36, "rgba(255,255,255,0)");
    g.fillStyle = gl; g.fillRect(fx, fy, fw, fh);
    g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = small ? 1 : 2; rr(fx + 1, fy + 1, fw - 2, fh - 2, small ? 2.5 : 4); g.stroke();
    g.restore();
  }
  function still() { try { return matchMedia("(hover: none)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }
  function es() { return (document.documentElement.getAttribute("lang") || "en").indexOf("es") === 0; }
  var CSS = ".aogvu{display:inline-flex;gap:4px;align-items:center;vertical-align:middle;padding:3px;border-radius:7px;background:#121316;" +
    "box-shadow:inset 0 1px 3px rgba(0,0,0,.8),0 1px 0 rgba(255,255,255,.08)}.aogvu[hidden]{display:none}" +
    ".aogvu canvas{display:block;width:58px;height:32px;border-radius:4px}";
  function mount(el, opts) {
    if (!el) return null; opts = opts || {};
    if (!document.getElementById("aogvu-css")) { var st = document.createElement("style"); st.id = "aogvu-css"; st.textContent = CSS; (document.head || document.documentElement).appendChild(st); }
    var box = document.createElement("span"); box.className = "aogvu"; box.setAttribute("role", "img");
    box.innerHTML = '<canvas aria-hidden="true"></canvas><canvas aria-hidden="true"></canvas>';
    if (opts.before) el.insertBefore(box, opts.before); else el.appendChild(box);
    var cv = box.querySelectorAll("canvas"), src = opts.source || levels, cal = opts.cal == null ? 3 : opts.cal;
    var M = { box: box, n: [null, null], peak: null, quietAt: 0, raf: 0, last: 0, shown: "" };
    function label() { var t = es() ? "Qué tan fuerte suena, izquierda y derecha" : "How loud it is, left and right"; if (box.getAttribute("aria-label") !== t) box.setAttribute("aria-label", t); }
    function show(v) { var k = v ? v[0].toFixed(1) + "," + v[1].toFixed(1) : "rest"; if (k === M.shown) return; M.shown = k; draw(cv[0], v ? v[0] : null, "L", cal); draw(cv[1], v ? v[1] : null, "R", cal); }
    function read() { var v = null; try { v = src(); } catch (e) {} return v; }
    /* every frame, so a short drum hit is caught; it draws only when a needle moves */
    function frame(t) {
      M.raf = requestAnimationFrame(frame);
      if (document.hidden || box.hidden) return;
      var v = read(), now = Date.now(), loud = v && Math.max(v[0], v[1]) > -50;
      if (still()) {
        if (loud) { M.quietAt = now; if (!M.peak || v[0] > M.peak[0] + 0.5 || v[1] > M.peak[1] + 0.5) M.peak = [Math.max(v[0], M.peak ? M.peak[0] : -90), Math.max(v[1], M.peak ? M.peak[1] : -90)]; }
        else if (M.peak && now - M.quietAt > 3000) M.peak = null;
        M.last = 0; show(M.peak); return;
      }
      var dt = M.last ? Math.min(0.1, (t - M.last) / 1000) : 0.016; M.last = t;
      var k = 1 - Math.exp(-dt / 0.09);
      if (!loud && M.n[0] == null) { show(null); return; }
      M.n = [0, 1].map(function (ch) { var tgt = v ? v[ch] : -90, o = M.n[ch] == null ? -60 : M.n[ch]; return tgt > o ? o + (tgt - o) * Math.min(1, k * 2.2) : o + (tgt - o) * k; });
      if (!loud && Math.max(M.n[0], M.n[1]) < -36) { M.n = [null, null]; show(null); return; }
      show(M.n);
    }
    function tick() { if (!document.hidden && !box.hidden) label(); }
    show(null); M.shown = ""; label();
    setTimeout(function () { M.shown = ""; show(null); }, 300);
    try { new ResizeObserver(function () { M.shown = ""; show(still() ? M.peak : (M.n[0] == null ? null : M.n)); }).observe(box); } catch (e) {}
    try { document.fonts && document.fonts.ready.then(function () { M.shown = ""; show(still() ? M.peak : null); }); } catch (e) {}
    M.timer = setInterval(tick, 1000); M.raf = requestAnimationFrame(frame);
    M.stop = function () { clearInterval(M.timer); if (M.raf) cancelAnimationFrame(M.raf); };
    return M;
  }
  window.AOGVU = { levels: levels, mount: mount, draw: draw };
  /* a room's own page: the pair beside its Record button (not inside the Recording Studio, where the shell shows them) */
  function inStudio() { try { return !!(window.frameElement && window.frameElement.id === "room") || (window.top !== window && /\/the-studio/.test(window.top.location.pathname)); } catch (e) { return false; } }
  function placeRoom() {
    if (inStudio()) return;
    /* the Record button: recBtn on the piano, the strings, the band and the turntables; takeBtn on the drum machine and the kit */
    var rb = document.getElementById("recBtn") || document.getElementById("takeBtn"); if (!rb || !rb.parentNode || document.querySelector(".aogvu")) return;
    var t = document.getElementById("recTime") || document.getElementById("takeTime"), at = t && t.parentNode === rb.parentNode ? t.nextSibling : rb.nextSibling;
    mount(rb.parentNode, { before: at });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(placeRoom, 0); }); else setTimeout(placeRoom, 0);
})();
