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
      if (window.AOGRecorder) setTimeout(function () { try { ROOM.live(ctx, g); } catch (e) {} }, 0);   /* AOG-STUDIO-ROOM-SOUND-V1: an instrument room plays in the room */
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
  /* AOG-VU-SLEEP-V1 (2026-10-10) — Jimmy: the Studio was "lagging … a horrific experience". The meters used to look at
     the sound on every frame, forever, even in silence, and kept the phone busy. Now they sleep while it is quiet and
     wake the moment any sound starts (a note, a hit, a take: they all start a sound source) or anything is heard on the
     slow check below (a microphone or a cable has no start). The page they sit in is told too, so the Studio's pair
     wakes for the room's sound. */
  var WAKE = [];
  function wake() {
    for (var i = 0; i < WAKE.length; i++) try { WAKE[i](); } catch (e) {}
    try { if (window.parent !== window && window.parent.AOGVU && window.parent.AOGVU.wake) window.parent.AOGVU.wake(); } catch (e) {}
  }
  try {
    /* a recording (AudioBufferSourceNode) has a start of its own, so each kind of source is told */
    ["AudioScheduledSourceNode", "AudioBufferSourceNode", "OscillatorNode", "ConstantSourceNode"].forEach(function (k) {
      var P = window[k] && window[k].prototype;
      if (!P || !Object.prototype.hasOwnProperty.call(P, "start")) return;
      var o = P.start;
      P.start = function () { if (!(OWN && OWN.has(this))) wake(); return o.apply(this, arguments); };
    });
    var MED = window.HTMLMediaElement && window.HTMLMediaElement.prototype, origPlay = MED && MED.play;
    if (origPlay) MED.play = function () { wake(); return origPlay.apply(this, arguments); };
  } catch (e) {}
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
  var MQ = null;
  function still() {
    try { if (!MQ) MQ = [matchMedia("(hover: none)"), matchMedia("(prefers-reduced-motion: reduce)")]; return MQ[0].matches || MQ[1].matches; } catch (e) { return false; }
  }
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
    var M = { box: box, n: [null, null], peak: null, quietAt: 0, raf: 0, last: 0, shown: "", until: 0 };
    function label() { var t = es() ? "Qué tan fuerte suena, izquierda y derecha" : "How loud it is, left and right"; if (box.getAttribute("aria-label") !== t) box.setAttribute("aria-label", t); }
    function show(v) { var k = v ? v[0].toFixed(1) + "," + v[1].toFixed(1) : "rest"; if (k === M.shown) return; M.shown = k; draw(cv[0], v ? v[0] : null, "L", cal); draw(cv[1], v ? v[1] : null, "R", cal); }
    function read() { var v = null; try { v = src(); } catch (e) {} return v; }
    /* every frame while there is sound, so a short drum hit is caught; it draws only when a needle moves.
       AOG-VU-SLEEP-V1: once the needles rest and nothing has started for a moment, the frames stop until wake() */
    function seen() { return !document.hidden && !box.hidden && box.isConnected && box.getClientRects().length > 0; }
    function frame(t) {
      M.raf = 0;
      if (!seen()) return;
      var v = read(), now = Date.now(), loud = v && Math.max(v[0], v[1]) > -50, rest;
      if (loud) M.until = now + 1500;
      if (still()) {
        if (loud) { M.quietAt = now; if (!M.peak || v[0] > M.peak[0] + 0.5 || v[1] > M.peak[1] + 0.5) M.peak = [Math.max(v[0], M.peak ? M.peak[0] : -90), Math.max(v[1], M.peak ? M.peak[1] : -90)]; }
        else if (M.peak && now - M.quietAt > 3000) M.peak = null;
        M.last = 0; show(M.peak); rest = !M.peak;
      } else {
        var dt = M.last ? Math.min(0.1, (t - M.last) / 1000) : 0.016; M.last = t;
        var k = 1 - Math.exp(-dt / 0.09);
        if (!loud && M.n[0] == null) { show(null); rest = true; }
        else {
          M.n = [0, 1].map(function (ch) { var tgt = v ? v[ch] : -90, o = M.n[ch] == null ? -60 : M.n[ch]; return tgt > o ? o + (tgt - o) * Math.min(1, k * 2.2) : o + (tgt - o) * k; });
          if (!loud && Math.max(M.n[0], M.n[1]) < -36) { M.n = [null, null]; show(null); rest = true; } else show(M.n);
        }
      }
      if (rest && now > M.until) { M.last = 0; return; }   /* asleep */
      M.raf = requestAnimationFrame(frame);
    }
    function rouse() { M.until = Date.now() + 1500; if (!M.raf) M.raf = requestAnimationFrame(frame); }
    WAKE.push(rouse);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) { M.shown = ""; rouse(); } });
    /* the slow check: twice a second, look once; any sound wakes the frames */
    function tick() {
      if (!seen()) return;
      label();
      if (!M.raf) { var v = read(); if (v && Math.max(v[0], v[1]) > -50) rouse(); }
    }
    show(null); M.shown = ""; label();
    setTimeout(function () { M.shown = ""; show(null); }, 300);
    try { new ResizeObserver(function () { M.shown = ""; show(still() ? M.peak : (M.n[0] == null ? null : M.n)); }).observe(box); } catch (e) {}
    try { document.fonts && document.fonts.ready.then(function () { M.shown = ""; show(still() ? M.peak : null); }); } catch (e) {}
    M.timer = setInterval(tick, 500); rouse();
    M.stop = function () { clearInterval(M.timer); if (M.raf) cancelAnimationFrame(M.raf); M.raf = 0; var i = WAKE.indexOf(rouse); if (i >= 0) WAKE.splice(i, 1); };
    return M;
  }
  window.AOGVU = { levels: levels, mount: mount, draw: draw, wake: wake };

  /* ══ AOG-STUDIO-ROOM-SOUND-V1 (Jimmy, 2026-10-09: "1, 3, 2, 4" — 3: make it sound like a real room). One knob, shared by
     every instrument room: Dry, Small room, Studio, Hall. The room is a reverb made here (a stereo tail that dies away and
     darkens, with a few early reflections), added to the room's sound after its Volume, and to its takes (the recorder
     feeds the same room into what it keeps), so a take carries the room to the turntables, the Drum Machine and the
     Mixing Desk. It starts Dry, so nothing changes until the knob is turned; the choice is kept on this device
     ("aog.room.v1") and every room and the Studio follow it at once. The turntables and the desk stay as they are. ══ */
  var PRE = [{ id: "dry", en: "Dry", es: "Seco" }, { id: "small", en: "Small room", es: "Sala pequeña", sec: 0.7, wet: 0.38, pre: 0.006, dark: 0.35 },
    { id: "studio", en: "Studio", es: "Estudio", sec: 1.4, wet: 0.55, pre: 0.014, dark: 0.5 }, { id: "hall", en: "Hall", es: "Sala grande", sec: 2.8, wet: 0.6, pre: 0.026, dark: 0.62 }];
  var KEY = "aog.room.v1", CH = [], IRS = typeof WeakMap === "function" ? new WeakMap() : null, KNOBS = [];
  function cur() { var v = 0; try { v = +localStorage.getItem(KEY) || 0; } catch (e) {} return Math.max(0, Math.min(PRE.length - 1, v | 0)); }
  function ir(ctx, i) {
    var per = IRS && IRS.get(ctx); if (!per) { per = {}; if (IRS) IRS.set(ctx, per); }
    if (per[i]) return per[i];
    var P = PRE[i], sr = ctx.sampleRate, n = Math.round(sr * (P.sec + P.pre)), buf = ctx.createBuffer(2, n, sr), seed = 1234567 + i;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647 * 2 - 1; }
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch), y = 0, e2 = 0, p0 = Math.round(P.pre * sr);
      for (var k = p0; k < n; k++) {
        var t = (k - p0) / sr, env = Math.exp(-6.9 * t / P.sec), a = Math.max(0.04, 1 - P.dark * Math.min(1, t / P.sec * 1.6));
        y += a * (rnd() - y); d[k] = y * env; e2 += d[k] * d[k];
      }
      /* a few early reflections, a little different left and right */
      for (var r = 0; r < 6; r++) { var at = p0 + Math.round(sr * (0.004 + r * 0.011 + (ch ? 0.003 : 0)) * (1 + P.sec * 0.3)); if (at < n) d[at] += (0.5 - r * 0.07) * (r % 2 ? -1 : 1); }
      var g = 1 / Math.sqrt(e2 + 1e-9); for (var q = 0; q < n; q++) d[q] *= g;
    }
    per[i] = buf; return buf;
  }
  /* one chain: what goes in, a convolver, a wet gain, where it goes; nothing runs while the room is Dry */
  function chain(ctx, from, to) {
    var c = { ctx: ctx, from: from, to: to, conv: own(ctx.createConvolver()), wet: own(ctx.createGain()), on: false, at: -1 };
    c.conv.normalize = false; orig.call(c.conv, c.wet); orig.call(c.wet, to);
    CH.push(c); apply(c); return c;
  }
  function apply(c) {
    var i = cur(), P = PRE[i];
    if (!P.sec) { if (c.on) { try { origDis.call(c.from, c.conv); } catch (e) {} c.on = false; } c.wet.gain.value = 0; return; }
    if (c.at !== i) { c.conv.buffer = ir(c.ctx, i); c.at = i; }
    c.wet.gain.setTargetAtTime(P.wet, c.ctx.currentTime, 0.05);
    if (!c.on) { orig.call(c.from, c.conv); c.on = true; }
  }
  function set(i) {
    i = Math.max(0, Math.min(PRE.length - 1, i | 0));
    try { localStorage.setItem(KEY, String(i)); } catch (e) {}
    CH.forEach(apply); KNOBS.forEach(function (k) { k.paint(); });
  }
  window.addEventListener("storage", function (e) { if (e.key === KEY) { CH.forEach(apply); KNOBS.forEach(function (k) { k.paint(); }); } });
  var ROOM = {
    presets: PRE, get: cur, set: set, chains: CH,
    live: function (ctx, g) { if (!ctx.__aogRoomLive) { ctx.__aogRoomLive = chain(ctx, g, ctx.destination); } return ctx.__aogRoomLive; },
    rec: function (ctx, tap, node) { if (tap && node && !node.__aogRoom) node.__aogRoom = chain(ctx, tap, node); },
    /* the knob: a small black knob with a gold line; a tap turns it one step (Dry → Small room → Studio → Hall → Dry);
       ← → and ↑ ↓ turn it too. Its name shows beside it. */
    knob: function (el, opts) {
      if (!el) return null; opts = opts || {};
      if (!document.getElementById("aogroom-css")) { var st = document.createElement("style"); st.id = "aogroom-css";
        st.textContent = ".aogroom{display:inline-flex;align-items:center;gap:7px;min-height:44px;padding:0 10px 0 4px;border:1px solid #050506;border-radius:22px;cursor:pointer;" +
          "background-color:#1f2024;background-image:linear-gradient(#2c2e33,#1b1c20);color:#efe5cf;font:600 .86rem/1.1 var(--sans,system-ui,sans-serif);vertical-align:middle;" +
          "box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 2px 0 #08090a}.aogroom[hidden]{display:none}" +
          ".aogroom i{position:relative;display:block;width:34px;height:34px;border-radius:50%;flex:0 0 auto;background:radial-gradient(circle at 38% 30%,#4a4c52 0,#1b1c20 58%,#0d0e10 100%);" +
          "box-shadow:0 2px 4px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.18),0 0 0 2px #0a0a0b,0 0 0 3px #3a3326}" +
          ".aogroom i::after{content:'';position:absolute;left:50%;top:4px;width:2px;height:11px;margin-left:-1px;border-radius:1px;background:#e9bf62;box-shadow:0 0 4px rgba(233,191,98,.6);" +
          "transform-origin:50% 13px;transform:rotate(var(--r,-120deg))}.aogroom b{font-weight:600;white-space:nowrap}.aogroom small{display:block;font:700 .56rem/1 var(--sans,system-ui,sans-serif);" +
          "letter-spacing:.16em;text-transform:uppercase;color:#b9ad95;margin-bottom:2px}.aogroom:focus-visible{outline:3px solid #c9a24b;outline-offset:2px}";
        (document.head || document.documentElement).appendChild(st); }
      var b = document.createElement("button"); b.type = "button"; b.className = "aogroom";
      b.innerHTML = '<i aria-hidden="true"></i><span><small></small><b></b></span>';
      if (opts.before) el.insertBefore(b, opts.before); else el.appendChild(b);
      var K = { b: b, paint: function () {
        var i = cur(), e = es() ? "es" : "en", P = PRE[i];
        b.querySelector("i").style.setProperty("--r", (-120 + i * 80) + "deg");
        b.querySelector("small").textContent = e === "es" ? "Sala" : "Room"; b.querySelector("b").textContent = P[e];
        b.setAttribute("aria-label", (e === "es" ? "Sonido de sala: " : "Room sound: ") + P[e] + (e === "es" ? ". Toca para cambiarlo." : ". Tap to change it."));
      } };
      b.addEventListener("click", function () { set((cur() + 1) % PRE.length); });
      b.addEventListener("keydown", function (e) {
        var k = e.key; if (k === "ArrowRight" || k === "ArrowUp") { set(Math.min(PRE.length - 1, cur() + 1)); e.preventDefault(); e.stopPropagation(); }
        else if (k === "ArrowLeft" || k === "ArrowDown") { set(Math.max(0, cur() - 1)); e.preventDefault(); e.stopPropagation(); } });
      try { new MutationObserver(K.paint).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
      KNOBS.push(K); K.paint(); return K;
    }
  };
  window.AOGRoom = ROOM;
  /* a room's own page: the pair beside its Record button (not inside the Recording Studio, where the shell shows them) */
  function inStudio() { try { return !!(window.frameElement && window.frameElement.id === "room") || (window.top !== window && /\/the-studio/.test(window.top.location.pathname)); } catch (e) { return false; } }
  function placeRoom() {
    if (inStudio()) return;
    /* the Record button: recBtn on the piano, the strings, the band and the turntables; takeBtn on the drum machine and the kit */
    var rb = document.getElementById("recBtn") || document.getElementById("takeBtn"); if (!rb || !rb.parentNode || document.querySelector(".aogvu")) return;
    var t = document.getElementById("recTime") || document.getElementById("takeTime"), at = t && t.parentNode === rb.parentNode ? t.nextSibling : rb.nextSibling;
    mount(rb.parentNode, { before: at });
    if (window.AOGRecorder) ROOM.knob(rb.parentNode, { before: at });   /* AOG-STUDIO-ROOM-SOUND-V1 */
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(placeRoom, 0); }); else setTimeout(placeRoom, 0);
})();
