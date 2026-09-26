/* ══ AOG-EQ-V1 (2026-09-23) ═══════════════════════════════════════════════════
   One equalizer, shared by the two benches. Jimmy asked for an EQ system that
   belongs with the turntables and the SP-1200 — so it is built the way the desks
   of that era were, and it tells the truth about itself.

   · THE DECKS get a DJ mixer's strip: three bands in series — a low shelf at
     250 Hz, a bell at 1 kHz, a high shelf at 4 kHz — each ±26 dB, each with a
     KILL that takes the band out completely. That is what a Pioneer or a Rane
     does, and it is what a hand reaches for mid-mix.
   · THE DRUM MACHINE gets a console strip: four bands, and the two middle ones
     SWEEP — you hunt for the frequency, then cut or lift it. That is how a
     record was EQ'd onto tape in 1987, one drum at a time.
   · THE CURVE IS NOT A DRAWING. What the display shows is the filters' own
     answer, asked with getFrequencyResponse at 240 points across the audible
     range, with the live spectrum behind it. If the curve says -12 dB at 90 Hz,
     the audio is -12 dB at 90 Hz.
   Nothing here is a preset pretending to be an EQ: every control is a real
   biquad in the path. ════════════════════════════════════════════════════════ */
(function (root) {
  "use strict";

  var KILL_DB = -40;          /* far enough down to be gone, and click-free */

  function biquad(ac, type, hz, q, gain) {
    var f = ac.createBiquadFilter();
    f.type = type;
    f.frequency.value = hz;
    if (q != null) f.Q.value = q;
    if (gain != null) f.gain.value = gain;
    return f;
  }
  function chain(nodes) {
    for (var i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
    return { first: nodes[0], last: nodes[nodes.length - 1] };
  }

  /* ── the DJ strip: three bands and three kills ───────────────────────────── */
  function djStrip(ac) {
    var low  = biquad(ac, "lowshelf", 250, null, 0);
    var mid  = biquad(ac, "peaking", 1000, 0.9, 0);
    var high = biquad(ac, "highshelf", 4000, null, 0);
    var trim = ac.createGain(); trim.gain.value = 1;
    var c = chain([low, mid, high, trim]);
    var state = { low: 0, mid: 0, high: 0, kill: { low: false, mid: false, high: false } };

    function apply(which) {
      var f = which === "low" ? low : which === "mid" ? mid : high;
      var db = state.kill[which] ? KILL_DB : state[which];
      f.gain.setTargetAtTime(db, ac.currentTime, 0.012);   /* no zip, no click */
    }
    return {
      input: c.first, output: c.last, filters: [low, mid, high],
      set: function (which, db) { state[which] = db; apply(which); },
      kill: function (which, on) { state.kill[which] = !!on; apply(which); return state.kill[which]; },
      killed: function (which) { return state.kill[which]; },
      gain: function (which) { return state[which]; },
      trim: function (v) { trim.gain.setTargetAtTime(v, ac.currentTime, 0.02); },
      flat: function () {
        state.low = state.mid = state.high = 0;
        state.kill = { low: false, mid: false, high: false };
        apply("low"); apply("mid"); apply("high");
      }
    };
  }

  /* ── the console strip: four bands, the middle two sweep ─────────────────── */
  function deskStrip(ac) {
    var hp   = biquad(ac, "highpass", 20, 0.707, null);
    var low  = biquad(ac, "lowshelf", 120, null, 0);
    var lmid = biquad(ac, "peaking", 400, 1.1, 0);
    var hmid = biquad(ac, "peaking", 2500, 1.1, 0);
    var high = biquad(ac, "highshelf", 7000, null, 0);
    var trim = ac.createGain(); trim.gain.value = 1;
    var c = chain([hp, low, lmid, hmid, high, trim]);
    var map = { low: low, lmid: lmid, hmid: hmid, high: high };
    return {
      input: c.first, output: c.last, filters: [hp, low, lmid, hmid, high],
      set: function (which, db) { map[which].gain.setTargetAtTime(db, ac.currentTime, 0.015); },
      freq: function (which, hz) { map[which].frequency.setTargetAtTime(hz, ac.currentTime, 0.015); },
      hpf: function (hz) { hp.frequency.setTargetAtTime(hz, ac.currentTime, 0.02); },
      trim: function (v) { trim.gain.setTargetAtTime(v, ac.currentTime, 0.02); },
      flat: function () {
        ["low","lmid","hmid","high"].forEach(function (k) { map[k].gain.setTargetAtTime(0, ac.currentTime, 0.015); });
        hp.frequency.setTargetAtTime(20, ac.currentTime, 0.02);
      }
    };
  }

  /* ── the display: the filters' own answer, over the live spectrum ────────── */
  function makeFreqs(n, lo, hi) {
    var f = new Float32Array(n);
    for (var i = 0; i < n; i++) f[i] = lo * Math.pow(hi / lo, i / (n - 1));
    return f;
  }
  function response(filters, freqs) {
    var n = freqs.length, mag = new Float32Array(n), m = new Float32Array(n), p = new Float32Array(n), i, k;
    for (i = 0; i < n; i++) mag[i] = 1;
    for (k = 0; k < filters.length; k++) {
      filters[k].getFrequencyResponse(freqs, m, p);
      for (i = 0; i < n; i++) mag[i] *= m[i];
    }
    return mag;
  }
  function draw(canvas, opts) {
    var ctx2 = canvas.getContext("2d");
    var dpr = Math.min(2, root.devicePixelRatio || 1);
    var cssW = canvas.clientWidth || 600, cssH = canvas.clientHeight || 90;
    if (canvas.width !== Math.floor(cssW * dpr)) { canvas.width = Math.floor(cssW * dpr); canvas.height = Math.floor(cssH * dpr); }
    var w = canvas.width, h = canvas.height;
    var lo = opts.lo || 30, hi = opts.hi || 18000, range = opts.range || 26;
    ctx2.clearRect(0, 0, w, h);
    ctx2.fillStyle = opts.bg || "#06110c"; ctx2.fillRect(0, 0, w, h);

    var freqs = opts._freqs || (opts._freqs = makeFreqs(240, lo, hi));
    var xOf = function (f) { return Math.log(f / lo) / Math.log(hi / lo) * w; };
    var yOf = function (db) { return h / 2 - (db / range) * (h / 2 - 4 * dpr); };

    /* the marks a pair of ears knows: 100, 1k, 10k, and zero */
    ctx2.strokeStyle = opts.grid || "rgba(120,180,130,.18)"; ctx2.lineWidth = 1;
    [50, 100, 200, 500, 1000, 2000, 5000, 10000].forEach(function (f) {
      var x = xOf(f); ctx2.beginPath(); ctx2.moveTo(x, 0); ctx2.lineTo(x, h); ctx2.stroke();
    });
    [-range/2, 0, range/2].forEach(function (db) {
      var y = yOf(db); ctx2.beginPath(); ctx2.moveTo(0, y); ctx2.lineTo(w, y); ctx2.stroke();
    });

    /* the live sound behind the curve */
    if (opts.analyser) {
      var a = opts.analyser, bins = a.frequencyBinCount, data = opts._bins || (opts._bins = new Uint8Array(bins));
      a.getByteFrequencyData(data);
      var sr = (opts.sampleRate || 44100) / 2;
      ctx2.fillStyle = opts.spectrum || "rgba(127,199,245,.20)";
      ctx2.beginPath(); ctx2.moveTo(0, h);
      for (var i = 1; i < bins; i++) {
        var f = i / bins * sr; if (f < lo || f > hi) continue;
        ctx2.lineTo(xOf(f), h - (data[i] / 255) * h * 0.92);
      }
      ctx2.lineTo(w, h); ctx2.closePath(); ctx2.fill();
    }

    /* and the curve itself */
    (opts.curves || []).forEach(function (cv) {
      var mag = response(cv.filters, freqs);
      ctx2.strokeStyle = cv.color || "#c6f7b0";
      ctx2.lineWidth = Math.max(2, 2 * dpr);
      ctx2.beginPath();
      for (var i = 0; i < freqs.length; i++) {
        var db = 20 * Math.log10(Math.max(1e-6, mag[i]));
        var y = Math.max(2, Math.min(h - 2, yOf(db)));
        i ? ctx2.lineTo(xOf(freqs[i]), y) : ctx2.moveTo(xOf(freqs[i]), y);
      }
      ctx2.stroke();
      if (cv.label) {
        ctx2.fillStyle = cv.color || "#c6f7b0";
        ctx2.font = (10 * dpr) + "px ui-monospace, monospace";
        ctx2.fillText(cv.label, 6 * dpr, (cv.labelY || 12) * dpr);
      }
    });
  }

  root.AOGEq = { dj: djStrip, desk: deskStrip, draw: draw, KILL_DB: KILL_DB };
})(typeof globalThis !== "undefined" ? globalThis : this);
