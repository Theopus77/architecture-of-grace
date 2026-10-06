/* ══ AOG-DJ-V1 (2026-10-04) — THE TURNTABLES' OWN RECORDS AND THEIR MIXER EQ ══
   Jimmy listed the DJs the turntables should take their sound from: a house DJ
   who turned disco edits and drum machines into a new music in a Chicago
   warehouse; a sampling DJ who built a whole album out of other records; a
   techno DJ who mixes three decks at once for hours.

   1. THE CRATE MADE ON THE PAGE. Four records in their spirit, named by style:
      Chicago house, driving techno, a dusty trip-hop break and a disco edit.
      Nothing is downloaded and nothing is sampled: every drum, bass note,
      piano chord and string is made here with math — sine waves, noise and
      filters, the way the drum machine makes its kits. Each record keeps an
      exact tempo, starts on beat one, moves in 8-bar phrases and opens and
      closes with drums alone, so a DJ has room to mix in and out. Inside a part,
      every bar is the same sound to the sample, so a loop comes round clean.
      It runs in a Worker (the page keeps moving while a record is made) and,
      where a browser has no Worker, on the page itself.
   2. THE ISOLATOR EQ. A club mixer's three bands, split by Linkwitz-Riley
      crossovers (24 dB per octave) so the three add back up flat, and a KILL
      takes a band all the way out. That is what makes a bass swap clean: the
      incoming record's low end is truly gone until you hand it over.
   3. THE PICTURES OF A RECORD. The waveform overview and the close-up groove,
      drawn off the page in a Worker so three spinning decks stay smooth.
   ═══════════════════════════════════════════════════════════════════════════ */
(function (root) {
  "use strict";
  var SR = 44100, TAU = Math.PI * 2;

  /* ── a small kit of parts ─────────────────────────────────────────────────── */
  function rand(seed) {                       /* the same "random" every time: a record never changes */
    var s = (seed >>> 0) || 1;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0; var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function sat(x) { if (x > 3) return 1; if (x < -3) return -1; var x2 = x * x; return x * (27 + x2) / (27 + 9 * x2); }
  function biquad(type, f, q, db) {
    var w = TAU * Math.min(f, SR * 0.45) / SR, cw = Math.cos(w), sw = Math.sin(w), a = sw / (2 * q), A = Math.pow(10, (db || 0) / 40);
    var b0, b1, b2, a0, a1, a2;
    if (type === "lp") { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0; a0 = 1 + a; a1 = -2 * cw; a2 = 1 - a; }
    else if (type === "hp") { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; a0 = 1 + a; a1 = -2 * cw; a2 = 1 - a; }
    else if (type === "bp") { b0 = a; b1 = 0; b2 = -a; a0 = 1 + a; a1 = -2 * cw; a2 = 1 - a; }
    else { b0 = 1 + a * A; b1 = -2 * cw; b2 = 1 - a * A; a0 = 1 + a / A; a1 = -2 * cw; a2 = 1 - a / A; }
    return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0, x1: 0, x2: 0, y1: 0, y2: 0 };
  }
  function bq(f, x) { var y = f.b0 * x + f.b1 * f.x1 + f.b2 * f.x2 - f.a1 * f.y1 - f.a2 * f.y2; f.x2 = f.x1; f.x1 = x; f.y2 = f.y1; f.y1 = y; return y; }
  function filt(buf, type, f, q, db) { var F = biquad(type, f, q, db); for (var i = 0; i < buf.length; i++) buf[i] = bq(F, buf[i]); return buf; }
  /* a state-variable filter whose cutoff can move every few samples */
  function SVF() { this.c1 = 0; this.c2 = 0; this.a1 = 1; this.a2 = 0; this.a3 = 0; this.k = 1.4; }
  SVF.prototype.set = function (f, res) {
    var g = Math.tan(Math.PI * Math.max(20, Math.min(f, SR * 0.45)) / SR), k = 2 - 1.96 * (res || 0);
    this.k = k; this.a1 = 1 / (1 + g * (g + k)); this.a2 = g * this.a1; this.a3 = g * this.a2;
  };
  SVF.prototype.run = function (v0) {
    var v3 = v0 - this.c2, v1 = this.a1 * this.c1 + this.a2 * v3, v2 = this.c2 + this.a2 * this.c1 + this.a3 * v3;
    this.c1 = 2 * v1 - this.c1; this.c2 = 2 * v2 - this.c2; this.bp = v1; return v2;
  };
  function blep(t, dt) {                      /* polyBLEP: a saw without the fizz of aliasing */
    if (t < dt) { t /= dt; return t + t - t * t - 1; }
    if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; }
    return 0;
  }
  function fadeOut(b, sec) { var n = Math.min(b.length, Math.round(sec * SR)); for (var i = 0; i < n; i++) b[b.length - 1 - i] *= i / n; return b; }
  function peakOf(b) { var m = 0; for (var i = 0; i < b.length; i++) { var v = b[i] < 0 ? -b[i] : b[i]; if (v > m) m = v; } return m; }
  function norm(b, p) { var m = peakOf(b); if (m > 0) { var g = p / m; for (var i = 0; i < b.length; i++) b[i] *= g; } return b; }
  function St(n) { return { L: new Float32Array(n), R: new Float32Array(n) }; }
  /* LOUDNESS the way broadcasters measure it (ITU-R BS.1770): the ear's weighting (a lift above
     1.7 kHz, a cut below 40 Hz), 400 ms blocks, the silent ones and the quiet ones gated out.
     The answer is in LUFS. The page uses it too, to level-match every record it loads. */
  function kw(sr) {
    function make(type, f, q, db) {
      var w = TAU * f / sr, cw = Math.cos(w), sw = Math.sin(w), a = sw / (2 * q), A = Math.pow(10, (db || 0) / 40), b0, b1, b2, a0, a1, a2;
      if (type === "shelf") {
        var s2 = 2 * Math.sqrt(A) * a;
        b0 = A * ((A + 1) + (A - 1) * cw + s2); b1 = -2 * A * ((A - 1) + (A + 1) * cw); b2 = A * ((A + 1) + (A - 1) * cw - s2);
        a0 = (A + 1) - (A - 1) * cw + s2; a1 = 2 * ((A - 1) - (A + 1) * cw); a2 = (A + 1) - (A - 1) * cw - s2;
      } else { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; a0 = 1 + a; a1 = -2 * cw; a2 = 1 - a; }
      return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0, x1: 0, x2: 0, y1: 0, y2: 0 };
    }
    return [make("shelf", 1681.97, 0.7072, 3.9998), make("hp", 38.135, 0.5003)];
  }
  function loudness(L, R, sr) {
    sr = sr || SR; R = R || L;
    var kl = kw(sr), kr = kw(sr), hop = Math.round(0.1 * sr), acc = 0, sub = [], i;
    for (i = 0; i < L.length; i++) {
      var a = bq(kl[1], bq(kl[0], L[i])), b = bq(kr[1], bq(kr[0], R[i]));
      acc += a * a + b * b;
      if ((i + 1) % hop === 0) { sub.push(acc / hop); acc = 0; }
    }
    var blocks = [];
    for (i = 3; i < sub.length; i++) blocks.push((sub[i] + sub[i - 1] + sub[i - 2] + sub[i - 3]) / 4);
    function lufs(ms) { return -0.691 + 10 * Math.log10(ms + 1e-20); }
    function mean(list) { var s = 0; for (var k = 0; k < list.length; k++) s += list[k]; return list.length ? s / list.length : 0; }
    var abs = blocks.filter(function (z) { return lufs(z) > -70; });
    if (!abs.length) return -70;
    var rel = lufs(mean(abs)) - 10;
    var gated = abs.filter(function (z) { return lufs(z) > rel; });
    return lufs(mean(gated.length ? gated : abs));
  }

  /* a little room or hall, baked into a sound (eight delay lines feeding each other) */
  function room(src, rt, wet, opt) {
    opt = opt || {};
    var mono = !src.L, inL = mono ? src : src.L, inR = mono ? src : src.R;
    var n = inL.length + Math.round(rt * 1.1 * SR), out = St(n);
    var lens = [23.1, 29.3, 33.7, 37.9, 41.3, 47.9, 53.1, 59.9].map(function (ms) { return Math.round(ms * (opt.size || 1) * SR / 1000); });
    var lines = lens.map(function (l) { return { b: new Float32Array(l), w: 0, n: l, lp: 0, g: Math.pow(10, -3 * l / (rt * SR)) }; });
    var damp = 1 - Math.exp(-TAU * (opt.damp || 6000) / SR), hp = 0, cHp = 1 - Math.exp(-TAU * (opt.hp || 180) / SR);
    var o = new Float32Array(8);
    for (var i = 0; i < n; i++) {
      var xl = i < inL.length ? inL[i] : 0, xr = i < inR.length ? inR[i] : 0, x = (xl + xr) * 0.5;
      hp += cHp * (x - hp); x -= hp;
      var s = 0;
      for (var j = 0; j < 8; j++) { var L = lines[j], v = L.b[L.w]; L.lp += damp * (v - L.lp); o[j] = L.lp; s += L.lp; }
      s *= 0.25;
      for (var q = 0; q < 8; q++) { var M = lines[q]; M.b[M.w] = (o[q] - s) * M.g + x * 0.3; M.w++; if (M.w >= M.n) M.w = 0; }
      out.L[i] = xl * (1 - wet * 0.3) + (o[0] - o[2] + o[4] - o[6]) * wet;
      out.R[i] = xr * (1 - wet * 0.3) + (o[1] - o[3] + o[5] - o[7]) * wet;
    }
    fadeOut(out.L, 0.05); fadeOut(out.R, 0.05);
    return out;
  }
  /* the sound of an old sampler: 12 bits and 26 kHz, then its output filter */
  function crunch(src, bits, hz, lp, every) {    /* `every`: start the sampler's clock afresh each bar */
    var q = Math.pow(2, bits - 1), step = SR / hz;
    [src.L || src, src.R].forEach(function (b) {
      if (!b) return;
      var ph = 0, hold = 0;
      for (var i = 0; i < b.length; i++) {
        ph += 1;
        if (ph >= step || i === 0 || (every && i % every === 0)) { ph = (every && i % every === 0) || i === 0 ? 0 : ph - step; hold = Math.round(b[i] * q) / q; }
        b[i] = hold;
      }
      filt(b, "lp", lp || 9000, 0.7); filt(b, "lp", lp || 9000, 0.7);
    });
    return src;
  }

  /* ── drums ───────────────────────────────────────────────────────────────── */
  function kick(o) {
    var n = Math.round((o.len || 0.55) * SR), out = new Float32Array(n), r = rand(o.seed || 7), ph = 0, nz = 0, hp = 0;
    var drive = o.drive || 1.5, norm0 = sat(drive);
    for (var i = 0; i < n; i++) {
      var t = i / SR, f = o.f1 + (o.f0 - o.f1) * Math.exp(-t / o.pt);
      ph += TAU * f / SR;
      var env = (t < 0.0012 ? t / 0.0012 : 1) * (t < (o.hold || 0.012) ? 1 : Math.exp(-(t - (o.hold || 0.012)) / o.dec));
      var w = r() * 2 - 1; hp = w - nz; nz = w;
      var ce = Math.exp(-t / 0.0016);
      out[i] = sat(Math.sin(ph) * env * drive) / norm0 + (Math.sin(TAU * (o.cf || 2600) * t) * 0.55 + hp * 0.45) * ce * (o.click || 0.3);
    }
    if (o.lp) filt(out, "lp", o.lp, 0.7);
    return fadeOut(out, 0.01);
  }
  function clap(o) {
    var n = Math.round((o.len || 0.42) * SR), out = new Float32Array(n), r = rand(o.seed || 11);
    var bpf = biquad("bp", o.f || 1150, o.q || 1.4), hpf = biquad("hp", 650, 0.7), burst = [0, 0.0102, 0.0208, 0.0305];
    for (var i = 0; i < n; i++) {
      var t = i / SR, e = 0;
      for (var b = 0; b < 3; b++) { var tb = t - burst[b]; if (tb >= 0 && tb < 0.013) e = Math.max(e, Math.exp(-tb / 0.0034)); }
      var tt = t - burst[3]; if (tt >= 0) e = Math.max(e, Math.exp(-tt / (o.dec || 0.11)));
      out[i] = bq(hpf, bq(bpf, (r() * 2 - 1) * e));
    }
    return fadeOut(norm(out, o.peak || 0.8), 0.01);
  }
  function metal(o) {                         /* six square waves at a cymbal's odd ratios, plus air */
    var n = Math.round((o.len || o.dec * 6 + 0.03) * SR), out = new Float32Array(n), r = rand(o.seed || 3);
    var fr = [205.3, 304.4, 369.6, 522.7, 540.0, 800.0].map(function (f) { return f * (o.tune || 1.6) / SR; }), ph = [0, 0.13, 0.31, 0.47, 0.62, 0.81];
    var b1 = biquad("bp", o.bp || 9500, 0.8), h1 = biquad("hp", o.hp || 7000, 0.7), h2 = biquad("hp", o.hp || 7000, 0.7), nzAmt = o.noise == null ? 0.35 : o.noise;
    for (var i = 0; i < n; i++) {
      var t = i / SR, s = 0;
      for (var k = 0; k < 6; k++) { ph[k] += fr[k]; if (ph[k] >= 1) ph[k] -= 1; s += ph[k] < 0.5 ? 1 : -1; }
      s = s / 6 * (1 - nzAmt) + (r() * 2 - 1) * nzAmt;
      var env = (t < 0.0006 ? t / 0.0006 : 1) * Math.exp(-t / o.dec);
      if (o.dec2) env = Math.max(env, (o.mix2 || 0.25) * Math.exp(-t / o.dec2));
      out[i] = bq(h2, bq(h1, bq(b1, s))) * env;
    }
    return fadeOut(norm(out, o.peak || 0.5), 0.006);
  }
  function noiseHit(o) {                      /* shakers, tambourine air, the riser's grain */
    var n = Math.round((o.len || 0.2) * SR), out = new Float32Array(n), r = rand(o.seed || 19);
    var f1 = biquad(o.type || "hp", o.f || 6000, o.q || 0.7), f2 = biquad(o.type || "hp", o.f || 6000, o.q || 0.7);
    for (var i = 0; i < n; i++) {
      var t = i / SR, env = (t < (o.att || 0.004) ? t / (o.att || 0.004) : Math.exp(-(t - (o.att || 0.004)) / (o.dec || 0.04)));
      out[i] = bq(f2, bq(f1, r() * 2 - 1)) * env;
    }
    return fadeOut(norm(out, o.peak || 0.4), 0.005);
  }
  function snare(o) {
    var n = Math.round((o.len || 0.5) * SR), out = new Float32Array(n), r = rand(o.seed || 23), p1 = 0, p2 = 0;
    var bpf = biquad("bp", o.nf || 2400, 0.6), hpf = biquad("hp", 1200, 0.7);
    for (var i = 0; i < n; i++) {
      var t = i / SR, f = (o.body || 190) * (1 + 0.25 * Math.exp(-t / 0.012));
      p1 += TAU * f / SR; p2 += TAU * f * 1.72 / SR;
      var body = (Math.sin(p1) * 0.75 + Math.sin(p2) * 0.35) * Math.exp(-t / (o.bdec || 0.09));
      var wire = bq(hpf, bq(bpf, r() * 2 - 1)) * (t < 0.001 ? t / 0.001 : Math.exp(-t / (o.dec || 0.17)));
      out[i] = sat((body * (o.bodyAmt || 0.8) + wire * (o.wire || 1.4)) * 1.3);
    }
    return fadeOut(norm(out, o.peak || 0.85), 0.01);
  }
  function rim(o) {
    var n = Math.round(0.09 * SR), out = new Float32Array(n), r = rand(o.seed || 29);
    var bpf = biquad("bp", o.f || 1750, 4);
    for (var i = 0; i < n; i++) { var t = i / SR; out[i] = (Math.sin(TAU * (o.f || 1750) * t) * 0.7 + bq(bpf, r() * 2 - 1) * 0.8) * Math.exp(-t / 0.011); }
    return fadeOut(norm(out, o.peak || 0.5), 0.004);
  }
  function conga(o) {
    var n = Math.round(0.35 * SR), out = new Float32Array(n), r = rand(o.seed || 31), ph = 0, bpf = biquad("bp", 2200, 1.2);
    for (var i = 0; i < n; i++) {
      var t = i / SR, f = o.f * (1 + 0.22 * Math.exp(-t / 0.018)); ph += TAU * f / SR;
      out[i] = Math.sin(ph) * Math.exp(-t / (o.dec || 0.16)) + bq(bpf, r() * 2 - 1) * Math.exp(-t / 0.006) * (o.slap || 0.5);
    }
    return fadeOut(norm(out, o.peak || 0.6), 0.008);
  }
  function tambourine(o) {
    var n = Math.round(0.3 * SR), out = new Float32Array(n), r = rand(o.seed || 37);
    var jf = [5230, 6170, 7020, 7930, 8840], jp = [0, 0, 0, 0, 0], bpf = biquad("bp", 7200, 1.1), hpf = biquad("hp", 4500, 0.7);
    for (var i = 0; i < n; i++) {
      var t = i / SR, s = 0;
      for (var k = 0; k < 5; k++) { jp[k] += jf[k] / SR; s += Math.sin(TAU * jp[k]) * Math.exp(-t / (0.035 + k * 0.006)); }
      var e2 = t > 0.012 ? Math.exp(-(t - 0.012) / 0.05) * 0.6 : 0;
      out[i] = bq(hpf, s * 0.25 + bq(bpf, r() * 2 - 1) * (Math.exp(-t / 0.03) + e2));
    }
    return fadeOut(norm(out, o.peak || 0.4), 0.006);
  }

  /* ── pitched voices ──────────────────────────────────────────────────────── */
  /* bass: a saw and a square through a low-pass that snaps shut, then a touch of drive */
  function bassNote(midi, len, o) {
    var f = mtof(midi), n = Math.round((len + (o.rel || 0.012)) * SR), out = new Float32Array(n), dt = f / SR, ph = 0.25, ph2 = 0, sub = 0;
    var svf = new SVF(), cut = o.cut || 220, env = o.env || 900, edec = o.edec || 0.07, res = o.res || 0.25;
    var att = o.att || 0.003, dec = o.dec || 0.25, sus = o.sus == null ? 0.7 : o.sus, rel = o.rel || 0.012, drive = o.drive || 1.4;
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      if ((i & 15) === 0) svf.set(cut + env * Math.exp(-t / edec), res);
      var saw = 2 * ph - 1 - blep(ph, dt);
      var sq = (ph < 0.5 ? 1 : -1) + blep(ph, dt) - blep((ph + 0.5) % 1, dt);
      ph += dt; if (ph >= 1) ph -= 1;
      ph2 += dt * 0.5; if (ph2 >= 1) ph2 -= 1;
      var osc = saw * (o.saw == null ? 0.6 : o.saw) + sq * (o.sq == null ? 0.4 : o.sq);
      var y = svf.run(osc) + Math.sin(TAU * (o.subOct ? ph2 : ph)) * (o.sub || 0);
      var a = t < att ? t / att : (t < len ? sus + (1 - sus) * Math.exp(-(t - att) / dec) : 0);
      if (t >= len) a = (sus + (1 - sus) * Math.exp(-(len - att) / dec)) * Math.exp(-(t - len) / (rel / 3));
      out[i] = sat(y * drive) * a;
    }
    return fadeOut(out, 0.003);
  }
  /* an electric-piano-like house piano: bright partials that fade fast, a hammer, two voices a hair apart */
  function piano(notes, gate, o) {
    o = o || {};
    var rel = 0.09, n = Math.round((gate + rel * 4) * SR), out = St(n), r = rand(o.seed || 41);
    var bright = o.bright || 1, B = 0.00028, dec = o.dec || 0.85;
    notes.forEach(function (m, ni) {
      [-3.5, 3.5].forEach(function (cents, vi) {
        var f = mtof(m) * Math.pow(2, cents / 1200), pan = (vi ? 0.32 : -0.32) + (ni - notes.length / 2) * 0.04;
        var gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
        for (var k = 1; k <= 11; k++) {
          var fk = k * f * Math.sqrt(1 + B * k * k); if (fk > 15000) break;
          var amp = (k === 1 ? 0.9 : 0.75 / Math.pow(k, 0.85)) * Math.pow(bright, k - 1) * 0.12;
          var tk = dec / (1 + 0.42 * (k - 1)), w = TAU * fk / SR, c = Math.cos(w), s = Math.sin(w);
          var ph0 = r() * TAU, x = Math.cos(ph0), y = Math.sin(ph0), kd = Math.exp(-1 / (tk * SR)), e = 1;
          var kr = Math.exp(-1 / (rel * SR));
          for (var i = 0; i < n; i++) {
            var nx = x * c - y * s; y = x * s + y * c; x = nx;
            e *= i < gate * SR ? kd : kr * kd;
            var v = y * amp * e * (i < 40 ? i / 40 : 1);
            out.L[i] += v * gl; out.R[i] += v * gr;
          }
        }
      });
    });
    var hm = biquad("bp", 2800, 1.2), hm2 = biquad("bp", 2800, 1.2);
    for (var i = 0; i < 400; i++) { var hv = bq(hm, r() * 2 - 1) * Math.exp(-i / 90) * 0.05; out.L[i] += hv; out.R[i] += bq(hm2, hv); }
    filt(out.L, "lp", o.lp || 7500, 0.6); filt(out.R, "lp", o.lp || 7500, 0.6);
    return out;
  }
  /* strings: five saws a note, spread across the room, slow to swell and slow to go */
  function strings(notes, len, o) {
    o = o || {};
    var att = o.att || 0.35, rel = o.rel || 0.6, n = Math.round((len + rel * 2.5) * SR), out = St(n), r = rand(o.seed || 43);
    var det = [-13, -6, 0, 6, 13], svL = new SVF(), svR = new SVF();
    svL.set(o.cut || 2800, 0.1); svR.set(o.cut || 2800, 0.1);
    var accL = new Float32Array(n), accR = new Float32Array(n);
    notes.forEach(function (m) {
      det.forEach(function (c, vi) {
        var f = mtof(m) * Math.pow(2, c / 1200), dt = f / SR, ph = r(), pan = (vi - 2) * 0.35;
        var gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
        for (var i = 0; i < n; i++) {
          var s = 2 * ph - 1 - blep(ph, dt); ph += dt; if (ph >= 1) ph -= 1;
          accL[i] += s * gl; accR[i] += s * gr;
        }
      });
    });
    var g = 0.07 / Math.sqrt(notes.length);
    for (var i = 0; i < n; i++) {
      var t = i / SR, a = t < att ? Math.pow(t / att, 1.5) : 1;
      if (t > len) a *= Math.exp(-(t - len) / rel);
      out.L[i] = svL.run(accL[i]) * a * g; out.R[i] = svR.run(accR[i]) * a * g;
    }
    return out;
  }
  /* a 1970s electric piano by frequency modulation: a soft bell on the attack, a warm body after */
  function epiano(notes, len, o) {
    o = o || {};
    var rel = 0.25, n = Math.round((len + rel * 3) * SR), out = St(n);
    notes.forEach(function (m, ni) {
      var f = mtof(m), pan = (ni - (notes.length - 1) / 2) * 0.25, gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
      for (var i = 0; i < n; i++) {
        var t = i / SR, idx = 1.6 * Math.exp(-t / 0.22) + 0.25;
        var e = Math.exp(-t / 1.4) * (t < 0.002 ? t / 0.002 : 1) * (t > len ? Math.exp(-(t - len) / rel) : 1);
        var trem = 1 + 0.12 * Math.sin(TAU * 4.6 * t + ni);
        var v = (Math.sin(TAU * f * t + idx * Math.sin(TAU * f * t)) + 0.18 * Math.sin(TAU * f * 6.98 * t) * Math.exp(-t / 0.045)) * e * 0.11;
        out.L[i] += v * gl * trem; out.R[i] += v * gr * (2 - trem);
      }
    });
    return out;
  }
  /* a voice saying "ahh": a buzz through the three resonances of an open mouth */
  function vox(midi, len, o) {
    o = o || {};
    var n = Math.round((len + 0.3) * SR), out = new Float32Array(n), f = mtof(midi), ph = 0, dt0 = f / SR;
    var F = [[730, 9, 1], [1090, 10, 0.5], [2440, 12, 0.3]].map(function (x) { return { f: biquad("bp", x[0], x[1]), g: x[2] }; });
    var glot = biquad("lp", 1800, 0.7);
    for (var i = 0; i < n; i++) {
      var t = i / SR, vib = 1 + 0.006 * Math.sin(TAU * 5.2 * t) * Math.min(1, t / 0.3), dt = dt0 * vib;
      var s = 2 * ph - 1 - blep(ph, dt); ph += dt; if (ph >= 1) ph -= 1;
      s = bq(glot, s);
      var y = 0; for (var k = 0; k < 3; k++) y += bq(F[k].f, s) * F[k].g;
      var e = (t < 0.06 ? t / 0.06 : 1) * (t > len ? Math.exp(-(t - len) / 0.08) : 1);
      out[i] = y * e;
    }
    return fadeOut(norm(out, o.peak || 0.5), 0.02);
  }
  /* a muted funk guitar: a plucked string (Karplus-Strong), damped by the palm */
  function scratchGuitar(notes, o) {
    o = o || {};
    var n = Math.round(0.16 * SR), out = St(n), r = rand(o.seed || 47);
    notes.forEach(function (m, si) {
      var N = Math.max(4, Math.round(SR / mtof(m))), buf = new Float32Array(N), w = 0, lp = 0, off = Math.round(si * 0.005 * SR);
      for (var k = 0; k < N; k++) { lp += 0.5 * ((r() * 2 - 1) - lp); buf[k] = lp; }
      var damp = o.damp || 0.986, pan = (si - 1.5) * 0.2, gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
      for (var i = off; i < n; i++) {
        var a = buf[w], b = buf[(w + 1) % N], v = (a + b) * 0.5 * damp;
        buf[w] = v; w = (w + 1) % N;
        out.L[i] += a * gl; out.R[i] += a * gr;
      }
    });
    var wl = biquad("bp", o.wah || 1250, 1.6), wr = biquad("bp", o.wah || 1250, 1.6);
    for (var i = 0; i < n; i++) { var e = Math.exp(-i / (0.045 * SR)); out.L[i] = bq(wl, out.L[i]) * e; out.R[i] = bq(wr, out.R[i]) * e; }
    norm(out.L, 0.5); norm(out.R, 0.5);
    return out;
  }
  /* a synth chord stab: detuned saws through a quick filter, with a dub echo and a room */
  function synthStab(notes, o) {
    o = o || {};
    var len = o.len || 0.16, n = Math.round((len + 0.08) * SR), dry = new Float32Array(n), r = rand(o.seed || 53), sv = new SVF();
    notes.forEach(function (m) {
      [-9, 0, 9].forEach(function (c) {
        var f = mtof(m) * Math.pow(2, c / 1200), dt = f / SR, ph = r();
        for (var i = 0; i < n; i++) { dry[i] += 2 * ph - 1 - blep(ph, dt); ph += dt; if (ph >= 1) ph -= 1; }
      });
    });
    for (var i = 0; i < n; i++) {
      var t = i / SR; if ((i & 15) === 0) sv.set(500 + 3800 * Math.exp(-t / 0.05), 0.35);
      dry[i] = sv.run(dry[i]) * (t < 0.002 ? t / 0.002 : 1) * (t > len ? Math.exp(-(t - len) / 0.02) : 1);
    }
    norm(dry, 0.6);
    /* the dub echo: three repeats a dotted eighth apart, each darker, bouncing left and right */
    var d = Math.round((o.echo || 0.34) * SR), reps = o.reps || 3, out = St(n + d * reps + 1);
    for (var k = 0; k <= reps; k++) {
      var g = Math.pow(0.45, k), src = k ? filt(Float32Array.from(dry), "lp", 3000 / k, 0.7) : dry, pan = k === 0 ? 0 : (k % 2 ? -0.6 : 0.6);
      var gl = g * Math.cos((pan + 1) * Math.PI / 4) * Math.SQRT2, gr = g * Math.sin((pan + 1) * Math.PI / 4) * Math.SQRT2;
      for (var j = 0; j < n; j++) { out.L[j + k * d] += src[j] * gl; out.R[j + k * d] += src[j] * gr; }
    }
    return room(out, o.rt || 1.2, o.wet || 0.35, { hp: 300 });
  }

  /* ── putting a record together ───────────────────────────────────────────── */
  /* ⚠ every tempo here makes a bar a WHOLE number of samples (125, 135, 90 and 120 BPM at 44.1 kHz:
     84672, 78400, 117600 and 88200), and every hit is placed from the start of its bar. So bar 9 is
     bar 10 to the sample, and a loop over a steady part has nothing to hide at its seam. */
  function Track(bpm, bars, tail) {
    this.bpm = bpm; this.beat = 60 / bpm; this.step = this.beat / 4; this.bar = this.beat * 4; this.bars = bars;
    this.barN = Math.round(this.bar * SR); this.stepN = this.barN / 16;
    this.n = bars * this.barN + Math.ceil((tail || 0.8) * SR);
    this.L = new Float32Array(this.n); this.R = new Float32Array(this.n);
  }
  /* the sample a sixteenth starts on; odd sixteenths lean late by the swing */
  Track.prototype.t = function (bar, step, swing) {
    var s = step; if (swing && (Math.floor(step) % 2 === 1)) s += (swing - 0.5) * 2;
    return bar * this.barN + Math.round(s * this.stepN);
  };
  Track.prototype.add = function (src, i0, gain, pan, dst) {
    var L = dst ? dst.L : this.L, R = dst ? dst.R : this.R, N = L.length;
    if (i0 >= N || gain === 0) return;
    pan = pan || 0;
    var gl = gain * Math.cos((pan + 1) * Math.PI / 4) * Math.SQRT2, gr = gain * Math.sin((pan + 1) * Math.PI / 4) * Math.SQRT2;
    var i, m;
    if (src.L) { m = Math.min(src.L.length, N - i0); for (i = 0; i < m; i++) { L[i0 + i] += src.L[i] * gl; R[i0 + i] += src.R[i] * gr; } }
    else { m = Math.min(src.length, N - i0); for (i = 0; i < m; i++) { var v = src[i]; L[i0 + i] += v * gl; R[i0 + i] += v * gr; } }
  };
  Track.prototype.bus = function () { return St(this.n); };
  Track.prototype.mixIn = function (b, gain) { for (var i = 0; i < this.n; i++) { this.L[i] += b.L[i] * gain; this.R[i] += b.R[i] * gain; } };
  /* a low-pass that opens over a span of bars (the techno build) */
  Track.prototype.sweep = function (b, fromBar, toBar, f0, f1, res) {
    var a = fromBar * this.barN, z = Math.min(this.n, toBar * this.barN), sl = new SVF(), sr = new SVF();
    for (var i = a; i < z; i++) {
      if (((i - a) & 31) === 0) { var x = (i - a) / (z - a), f = f0 * Math.pow(f1 / f0, x); sl.set(f, res || 0.3); sr.set(f, res || 0.3); }
      b.L[i] = sl.run(b.L[i]); b.R[i] = sr.run(b.R[i]);
    }
  };
  /* a noise that rises over the last bars of a breakdown */
  Track.prototype.riser = function (fromBar, bars, gain) {
    var a = fromBar * this.barN, z = Math.min(this.n, a + bars * this.barN), r = rand(61), sl = new SVF(), sr = new SVF();
    for (var i = a; i < z; i++) {
      var x = (i - a) / (z - a);
      if (((i - a) & 31) === 0) { var f = 300 * Math.pow(30, x); sl.set(f, 0.55); sr.set(f * 1.07, 0.55); }
      var g = gain * x * x;
      sl.run(r() * 2 - 1); sr.run(r() * 2 - 1);
      this.L[i] += sl.bp * g; this.R[i] += sr.bp * g;
    }
  };
  /* the master: a rumble filter, a level set by loudness, and a look-ahead limiter that keeps every peak under -1 dB */
  Track.prototype.finish = function (target) {
    var L = this.L, R = this.R, n = this.n, i;
    var h1 = biquad("hp", 24, 0.7), h2 = biquad("hp", 24, 0.7);
    for (i = 0; i < n; i++) { L[i] = bq(h1, L[i]); R[i] = bq(h2, R[i]); }
    var g = Math.pow(10, ((target || -14) - loudness(L, R, SR)) / 20);
    /* the limiter: the gain each sample needs, held over the 3 ms ahead of it, averaged over
       those same 3 ms (so it bends down smoothly BEFORE a peak and is under it AT the peak),
       and never allowed to come back faster than 150 ms. */
    var ceil = 0.89, W = Math.round(0.003 * SR), need = new Float32Array(n);
    for (i = 0; i < n; i++) { var p = Math.max(Math.abs(L[i]), Math.abs(R[i])) * g; need[i] = p > ceil ? ceil / p : 1; }
    var hold = new Float32Array(n), dq = [];
    for (i = n - 1; i >= 0; i--) {
      while (dq.length && need[dq[dq.length - 1]] >= need[i]) dq.pop();
      dq.push(i); while (dq[0] > i + W) dq.shift();
      hold[i] = need[dq[0]];
    }
    var relk = 1 - Math.exp(-1 / (0.15 * SR)), run = 0, gr = 1;
    for (i = 0; i < n; i++) {
      run += hold[i] - (i >= W ? hold[i - W] : 1);
      var avg = 1 + run / W;                                  /* the mean of the last W held gains */
      gr = Math.min(avg, gr + relk * (1 - gr));
      var gg = g * gr;
      L[i] *= gg; R[i] *= gg;
      if (L[i] > ceil) L[i] = ceil; else if (L[i] < -ceil) L[i] = -ceil;   /* never reached; a guard */
      if (R[i] > ceil) R[i] = ceil; else if (R[i] < -ceil) R[i] = -ceil;
    }
    fadeOut(L, 0.3); fadeOut(R, 0.3);
    return { L: L, R: R, sr: SR, bpm: this.bpm, beat0: 0, bars: this.bars };
  };

  /* ══ THE FOUR RECORDS ══════════════════════════════════════════════════════ */

  /* CHICAGO HOUSE · 125 BPM · A minor. A warehouse drum machine (a punchy kick, a
     clap on two and four, the open hat on every "and"), a bass that answers the
     kick off the beat, and piano chords stabbed in a 3-3-4-3-3 rhythm.
     Bars 1-16 drums · 17-24 + bass · 25-40 + piano · 41-48 the breakdown
     (strings and piano, no kick) · 49-64 everything · 65-72 drums. */
  function chicago() {
    var T = new Track(125, 72, 0.9);
    var K = kick({ f0: 168, f1: 49, pt: 0.03, dec: 0.3, hold: 0.016, drive: 1.6, click: 0.32 });
    var CL = room(clap({ f: 1180, q: 1.3, dec: 0.12 }), 0.7, 0.22);
    var CH = metal({ dec: 0.032, tune: 1.6, bp: 9000, hp: 7200, noise: 0.35, peak: 0.5 });
    var OH = metal({ dec: 0.2, tune: 1.55, bp: 8500, hp: 6500, noise: 0.4, peak: 0.5, seed: 5 });
    var SH = noiseHit({ f: 6200, att: 0.007, dec: 0.035, peak: 0.45 });
    var CR = metal({ dec: 0.25, dec2: 1.6, mix2: 0.5, tune: 1.1, bp: 6000, hp: 4000, noise: 0.6, peak: 0.6, len: 2.2, seed: 9 });
    var prog = [{ r: 33, c: [60, 64, 67, 71] }, { r: 33, c: [60, 64, 67, 71] }, { r: 38, c: [60, 64, 65, 69] }, { r: 40, c: [59, 62, 64, 67] }];
    var riff = [[2, 0, 2, 1], [5, 0, 1, 0.75], [6, 12, 1, 0.85], [10, 0, 2, 1], [13, 10, 1, 0.7], [14, 12, 2, 0.85]];
    var stab = [[0, 2, 0.95], [3, 2, 0.8], [6, 3, 0.9], [10, 2, 0.85], [13, 3, 0.8]];
    var bc = {}, pc = {}, sc = {};
    function bn(m, steps) { var k = m + ":" + steps; return bc[k] || (bc[k] = bassNote(m, steps * T.step * 0.92, { cut: 180, env: 1300, edec: 0.06, res: 0.3, dec: 0.18, sus: 0.6, sub: 0.35, drive: 1.5 })); }
    function pn(ci, steps) { var k = ci + ":" + steps; return pc[k] || (pc[k] = room(piano(prog[ci].c, steps * T.step * 0.9, { dec: 0.7, bright: 0.93 }), 1.1, 0.25, { hp: 250 })); }
    function sn(ci) { return sc[ci] || (sc[ci] = strings(prog[ci].c.map(function (m) { return m - 12; }).concat([prog[ci].c[3]]), T.bar * 0.97, { att: 0.5, rel: 0.7, cut: 2400 })); }
    for (var b = 0; b < 72; b++) {
      var ci = b % 4, brk = b >= 40 && b < 48, drumsOnly = b < 16 || b >= 64;
      var hasBass = !drumsOnly && !brk, hasPiano = (b >= 24 && b < 40) || (b >= 48 && b < 64) || brk;
      for (var q = 0; q < 4; q++) {
        if (!brk) T.add(K, T.t(b, q * 4), 0.68);
        T.add(CH, T.t(b, q * 4, 0.54), 0.52, 0.25);
        T.add(CH, T.t(b, q * 4 + 1, 0.54), 0.26, 0.25);
        T.add(CH, T.t(b, q * 4 + 3, 0.54), 0.34, 0.25);
        if (b >= 8 && !brk) T.add(OH, T.t(b, q * 4 + 2), 0.6, -0.15);
        if (b >= 16 && !brk) for (var s = 0; s < 4; s++) T.add(SH, T.t(b, q * 4 + s, 0.56), [0.5, 0.22, 0.7, 0.3][s] * 0.55, -0.35);
      }
      if (b >= 8) { T.add(CL, T.t(b, 4), brk ? 0.55 : 0.75); T.add(CL, T.t(b, 12), brk ? 0.55 : 0.75); }
      if (b === 47) for (var rr = 0; rr < 16; rr++) T.add(CL, T.t(b, rr), 0.12 + rr * 0.025);
      if (b === 24 || b === 48) T.add(CR, T.t(b, 0), 0.4, 0.1);
      if (hasBass) riff.forEach(function (x) { T.add(bn(prog[ci].r + x[1], x[2]), T.t(b, x[0]), 0.5 * x[3]); });
      if (hasPiano) stab.forEach(function (x) { T.add(pn(ci, x[1]), T.t(b, x[0]), (brk ? 0.72 : 1.0) * x[2]); });
      if (brk || (b >= 56 && b < 64)) T.add(sn(ci), T.t(b, 0), brk ? 0.85 : 0.42);
    }
    T.riser(46, 2, 0.12);
    return T.finish(-14);
  }

  /* DRIVING TECHNO · 135 BPM · G minor. A hard, saturated kick on every beat, a
     bass that rolls on the three sixteenths after it, a ride on the beat, and a
     minor chord stab with a dub echo whose filter opens over sixteen bars.
     Bars 1-16 drums · 17-32 + bass, ride · 33-48 the stab opening up · 49-56
     the breakdown and a rising noise · 57-72 everything · 73-80 drums. */
  function techno() {
    var T = new Track(135, 80, 1.2);
    var K = kick({ f0: 150, f1: 44, pt: 0.04, dec: 0.34, hold: 0.022, drive: 2.6, click: 0.42, cf: 3000 });
    var CH = metal({ dec: 0.026, tune: 1.75, bp: 10000, hp: 8000, noise: 0.5, peak: 0.45 });
    var OH = metal({ dec: 0.15, tune: 1.7, bp: 9000, hp: 7000, noise: 0.5, peak: 0.45, seed: 13 });
    var RD = metal({ dec: 0.08, dec2: 0.9, mix2: 0.35, tune: 2.3, bp: 7000, hp: 5200, noise: 0.25, peak: 0.42, len: 1.2, seed: 17 });
    var CL = room(clap({ f: 1320, q: 1.6, dec: 0.1, seed: 12 }), 1.7, 0.4, { size: 1.6 });
    var RM = rim({ f: 1650 });
    var CR = metal({ dec: 0.25, dec2: 1.8, mix2: 0.5, tune: 1.05, bp: 6000, hp: 4000, noise: 0.6, peak: 0.6, len: 2.4, seed: 21 });
    var roots = [31, 31, 31, 34, 31, 31, 29, 34];
    var bc = {};
    function bn(m) { return bc[m] || (bc[m] = bassNote(m, T.step * 0.8, { cut: 160, env: 1100, edec: 0.045, res: 0.42, att: 0.002, dec: 0.08, sus: 0.45, saw: 0.85, sq: 0.15, drive: 2.0 })); }
    var STAB = synthStab([55, 58, 62, 65], { len: 0.15, echo: T.step * 3, reps: 3, rt: 1.3, wet: 0.35 });
    var BIGSTAB = synthStab([55, 58, 62, 65], { len: 0.22, echo: T.step * 3, reps: 5, rt: 3.2, wet: 0.6, seed: 57 });
    var stabBus = T.bus();
    for (var b = 0; b < 80; b++) {
      var brk = b >= 48 && b < 56, outro = b >= 72, root = roots[b % 8];
      for (var q = 0; q < 4; q++) {
        if (!brk) T.add(K, T.t(b, q * 4), 0.7);
        for (var s = 0; s < 4; s++) if (s !== 2 || b < 8 || brk) T.add(CH, T.t(b, q * 4 + s), [0.48, 0.26, 0.38, 0.32][s], 0.3);
        if (b >= 8 && !brk) T.add(OH, T.t(b, q * 4 + 2), 0.6, -0.2);
        if (b >= 16 && !brk) T.add(RD, T.t(b, q * 4), 0.42, 0.4);
        if (b >= 16 && !brk && !outro) for (var r = 1; r < 4; r++) {
          var m = (b % 4 === 3 && q === 3 && r === 3) ? root + 12 : root;
          T.add(bn(m), T.t(b, q * 4 + r), [0, 0.75, 1, 0.8][r] * 0.48);
        }
      }
      if (b >= 8 && !outro && !brk) { T.add(CL, T.t(b, 4), 0.62); T.add(CL, T.t(b, 12), 0.62); }
      if (b >= 16 && !brk && !outro) [3, 11, 14].forEach(function (st) { T.add(RM, T.t(b, st), 0.45, -0.45); });
      if ((b >= 32 && b < 48) || (b >= 56 && b < 72)) { T.add(STAB, T.t(b, 3), 1.0, 0, stabBus); T.add(STAB, T.t(b, 10), 0.75, 0, stabBus); if (b % 2) T.add(STAB, T.t(b, 14), 0.6, 0, stabBus); }
      if (brk && b % 2 === 0) T.add(BIGSTAB, T.t(b, 0), 0.9, 0, stabBus);
      if (b === 32 || b === 56) T.add(CR, T.t(b, 0), 0.4);
    }
    T.sweep(stabBus, 32, 48, 380, 5200, 0.35);
    T.mixIn(stabBus, 1);
    T.riser(52, 4, 0.14);
    return T.finish(-14);
  }

  /* DUSTY TRIP-HOP BREAK · 90 BPM · D minor. A heavy, roomy drum break played as
     if from an old record through an old sampler (12 bits, 26 kHz, and the
     crackle of the vinyl it came off), a deep sub bass, an electric piano that
     wavers like a worn tape, and a sung "ahh" to scratch with.
     Bars 1-8 the break · 9-16 + bass · 17-32 + keys and the voice · 33-36 the
     drums drop out · 37-44 everything · 45-48 the break. */
  function triphop() {
    var T = new Track(90, 48, 1.6);
    var K = crunch(room(kick({ f0: 118, f1: 52, pt: 0.028, dec: 0.2, hold: 0.012, drive: 1.35, click: 0.22, cf: 1800, len: 0.45 }), 0.5, 0.12), 12, 26040, 9000);
    var SN = crunch(room(snare({ body: 182, bdec: 0.1, dec: 0.2, wire: 1.5, peak: 0.9 }), 1.0, 0.38, { size: 1.2 }), 12, 26040, 9000);
    var GH = crunch(room(snare({ body: 190, bdec: 0.05, dec: 0.08, wire: 1.0, peak: 0.5, seed: 25 }), 0.6, 0.2), 12, 26040, 8000);
    var HH = crunch(room(metal({ dec: 0.04, tune: 1.35, bp: 7500, hp: 5500, noise: 0.55, peak: 0.45 }), 0.4, 0.15), 12, 26040, 9000);
    var HO = crunch(room(metal({ dec: 0.24, tune: 1.3, bp: 7000, hp: 5000, noise: 0.55, peak: 0.45, seed: 33 }), 0.6, 0.2), 12, 26040, 9000);
    var kicks = [[[0, 1], [6, 0.7], [10, 0.85]], [[0, 1], [3, 0.55], [10, 0.8], [11, 0.5]]];
    var ghosts = [[[7, 0.22], [15, 0.28]], [[9, 0.2], [14, 0.3]]];
    var roots = [38, 34, 31, 33];
    var chords = [[53, 57, 60, 64], [57, 60, 62, 65], [53, 57, 58, 62], [55, 58, 61, 64]];
    var bc = {}, kc = {};
    function bn(m, steps) { var k = m + ":" + steps; return bc[k] || (bc[k] = bassNote(m, steps * T.step, { cut: 120, env: 240, edec: 0.2, res: 0.1, att: 0.01, dec: 0.6, sus: 0.75, saw: 0.25, sq: 0.1, sub: 0.75, drive: 1.2, rel: 0.05 })); }
    function kn(ci, steps) { var k = ci + ":" + steps; return kc[k] || (kc[k] = epiano(chords[ci], steps * T.step)); }
    var keys = T.bus(), VX = room(vox(62, T.beat * 1.5), 2.2, 0.45, { hp: 300, size: 1.3 });
    for (var b = 0; b < 48; b++) {
      var drop = b >= 32 && b < 36, ci = b % 4, two = b % 2;
      var full = (b >= 16 && b < 32) || (b >= 36 && b < 44), hasBass = b >= 8 && b < 44;
      if (!drop) {
        kicks[two].forEach(function (x) { T.add(K, T.t(b, x[0], 0.58), 0.9 * x[1]); });
        T.add(SN, T.t(b, 4), 0.8); T.add(SN, T.t(b, 12), 0.8);
        ghosts[two].forEach(function (x) { T.add(GH, T.t(b, x[0], 0.58), x[1] * 1.4); });
        for (var s = 0; s < 16; s += 2) T.add(s === 14 && two ? HO : HH, T.t(b, s, 0.58), (s % 4 ? 0.22 : 0.34), 0.2);
        T.add(HH, T.t(b, 7, 0.58), 0.12, 0.2); T.add(HH, T.t(b, 15, 0.58), 0.14, 0.2);
      }
      if (hasBass) {
        if (drop) T.add(bn(roots[ci], 16), T.t(b, 0), 0.7);
        else { T.add(bn(roots[ci], 10), T.t(b, 0), 0.75); T.add(bn(roots[ci] + 12, 3), T.t(b, 10, 0.58), 0.45); T.add(bn(roots[ci] + 7, 2), T.t(b, 14, 0.58), 0.4); }
      }
      if (full || drop) { T.add(kn(ci, 7), T.t(b, 0), 1.0, 0, keys); T.add(kn(ci, 3), T.t(b, 10, 0.58), 0.7, 0, keys); }
      if ((full || drop) && b % 4 === 0) T.add(VX, T.t(b, 0), 0.55, -0.1);
    }
    /* the keys were "sampled" off a worn record: a slow waver (once a bar, so every bar wavers
       the same way), a darker top, the sampler's crunch */
    var wl = Float32Array.from(keys.L), wr = Float32Array.from(keys.R);
    for (var i = 0; i < T.n; i++) {
      var ph = (i % T.barN) / T.barN, d = (0.0021 + 0.0016 * Math.sin(TAU * ph) + 0.0005 * Math.sin(TAU * 8 * ph)) * SR, p = i - d;
      if (p < 1) { keys.L[i] = keys.R[i] = 0; continue; }
      var j = p | 0, f = p - j;
      keys.L[i] = wl[j] + (wl[j + 1] - wl[j]) * f; keys.R[i] = wr[j] + (wr[j + 1] - wr[j]) * f;
    }
    filt(keys.L, "lp", 5200, 0.7); filt(keys.R, "lp", 5200, 0.7);
    crunch(keys, 12, 26040, 7000, T.barN);
    T.mixIn(keys, 1);
    /* the record's own crackle: two bars of it, looped the way a sampled break loops its dust */
    var cr = rand(71), hl = 0, hr = 0, dust = St(2 * T.barN);
    for (var c = 0; c < dust.L.length; c++) {
      hl += 0.1 * ((cr() * 2 - 1) - hl); hr += 0.1 * ((cr() * 2 - 1) - hr);
      dust.L[c] += hl * 0.006; dust.R[c] += hr * 0.006;
      if (cr() < 0.00012) { var a = (cr() * 2 - 1) * 0.07; for (var z = 0; z < 24; z++) { var v = a * Math.exp(-z / 4), cz = (c + z) % dust.L.length; dust.L[cz] += v; dust.R[cz] += v * 0.8; } }
    }
    for (var db = 0; db < 48; db += 2) T.add(dust, T.t(db, 0), 1);
    return T.finish(-14);
  }

  /* DISCO EDIT · 120 BPM · E minor (E minor 7 to A 7, the dorian vamp). A live
     disco kit (four on the floor, the open hat on the "and", tambourine, congas),
     an octave-jumping bass, a muted funk guitar on the sixteenths, and a string
     section that swells and runs up the scale at the end of each phrase. Cut
     like a DJ's edit: a long drum intro, a breakdown, a long drum outro.
     Bars 1-16 drums · 17-24 + bass · 25-40 + guitar and strings · 41-48 the
     break (no kick) · 49-64 everything · 65-72 drums. */
  function disco() {
    var T = new Track(120, 72, 1.4);
    var K = kick({ f0: 122, f1: 50, pt: 0.024, dec: 0.22, hold: 0.008, drive: 1.25, click: 0.18, cf: 2000, lp: 6000, len: 0.45 });
    var SN = room(snare({ body: 196, bdec: 0.08, dec: 0.16, wire: 1.2, peak: 0.85, seed: 27 }), 0.9, 0.3);
    var CL = room(clap({ f: 1250, q: 1.2, dec: 0.09, seed: 15 }), 0.9, 0.3);
    var OH = metal({ dec: 0.19, tune: 1.45, bp: 8000, hp: 6000, noise: 0.45, peak: 0.45, seed: 7 });
    var CH = metal({ dec: 0.03, tune: 1.5, bp: 8800, hp: 7000, noise: 0.4, peak: 0.45, seed: 8 });
    var TB = tambourine({});
    var CGL = conga({ f: 196, dec: 0.2, slap: 0.35 }), CGH = conga({ f: 294, dec: 0.15, slap: 0.6, seed: 35 });
    var CR = metal({ dec: 0.25, dec2: 1.6, mix2: 0.5, tune: 1.15, bp: 6000, hp: 4000, noise: 0.6, peak: 0.6, len: 2.2, seed: 39 });
    var prog = [{ r: 40, g: [64, 67, 71, 74], s: [52, 59, 62, 67, 71] }, { r: 33, g: [64, 67, 69, 73], s: [52, 57, 61, 64, 67] }];
    var bc = {}, gc = {}, sc = {};
    function bn(m) { return bc[m] || (bc[m] = bassNote(m, T.step * 1.6, { cut: 260, env: 1500, edec: 0.05, res: 0.2, att: 0.002, dec: 0.12, sus: 0.35, saw: 0.5, sq: 0.5, sub: 0.25, drive: 1.6 })); }
    function gn(ci, acc) { var k = ci + ":" + acc; return gc[k] || (gc[k] = scratchGuitar(prog[ci].g, { damp: acc ? 0.988 : 0.982, wah: acc ? 1400 : 1100, seed: 47 + ci })); }
    function sn(ci) { return sc[ci] || (sc[ci] = room(strings(prog[ci].s, T.bar * 0.98, { att: 0.25, rel: 0.5, cut: 4200, seed: 43 + ci }), 1.6, 0.3, { hp: 250 })); }
    var RUN = [64, 66, 67, 69, 71, 73, 74, 76].map(function (m) { return strings([m, m + 12], T.step * 0.9, { att: 0.02, rel: 0.12, cut: 5500, seed: 51 }); });
    var cong = [[0, 0, 0.7], [3, 1, 0.5], [6, 1, 0.6], [8, 0, 0.6], [10, 1, 0.5], [11, 1, 0.45], [14, 0, 0.55]];
    var gtr = [[1, 0.5, 0], [3, 0.7, 1], [6, 0.55, 0], [9, 0.5, 0], [11, 0.75, 1], [14, 0.55, 0]];
    for (var b = 0; b < 72; b++) {
      var ci = b % 2, brk = b >= 40 && b < 48, drumsOnly = b < 16 || b >= 64;
      var full = (b >= 24 && b < 40) || (b >= 48 && b < 64);
      for (var q = 0; q < 4; q++) {
        if (!brk) T.add(K, T.t(b, q * 4), 0.68);
        T.add(OH, T.t(b, q * 4 + 2), 0.4, -0.2);
        T.add(CH, T.t(b, q * 4 + 1, 0.53), 0.14, 0.25); T.add(CH, T.t(b, q * 4 + 3, 0.53), 0.18, 0.25);
        if (b >= 8) for (var s = 0; s < 4; s += 1) T.add(TB, T.t(b, q * 4 + s, 0.53), [0.45, 0.2, 0.32, 0.2][s] * 0.55, 0.45);
      }
      if (b >= 8 && !(b >= 64)) { T.add(SN, T.t(b, 4), brk ? 0.5 : 0.65); T.add(SN, T.t(b, 12), brk ? 0.5 : 0.65); T.add(CL, T.t(b, 4), 0.32, 0.1); T.add(CL, T.t(b, 12), 0.32, -0.1); }
      if (b >= 8 && b < 64) cong.forEach(function (x) { T.add(x[1] ? CGH : CGL, T.t(b, x[0], 0.53), x[2] * 0.5, x[1] ? 0.35 : -0.3); });
      if (!drumsOnly && b >= 16) for (var e = 0; e < 8; e++) T.add(bn(prog[ci].r + (e % 2 ? 12 : 0)), T.t(b, e * 2), (e % 2 ? 0.4 : 0.46));
      if (full) gtr.forEach(function (x) { T.add(gn(ci, x[2]), T.t(b, x[0], 0.53), x[1] * 0.62, 0.3); });
      if (full || brk) T.add(sn(ci), T.t(b, 0), brk ? 0.8 : 0.6);
      if ((full || brk) && b % 8 === 7) for (var k = 0; k < 8; k++) T.add(RUN[k], T.t(b, 8 + k), 0.5 + k * 0.03);
      if (b === 24 || b === 48) T.add(CR, T.t(b, 0), 0.4);
    }
    return T.finish(-14);
  }

  /* ══ AOG-DJ-DUSTY-V1 (2026-10-06) — Jimmy: "I want more and more DIRTY TRIP HOP BEATS and BOOM BAP records."
     Six more, made by one recipe with each record's own drums, swing, grit, chords and "sample". The sample
     (keys, strings or horn stabs) is played as if lifted off a worn record: a waver once a bar, a dark top and an
     old sampler's crunch; the drums go through the same sampler; the record's dust loops every two bars.
     Bars 1-8 drums · 9-16 + bass · 17-32 the sample · 33-36 the drop (no drums) · 37-44 everything · 45-48 drums.
     Inside a part the first eight bars repeat every two, so a loop over the intro comes round clean. ══ */
  function dusty(c) {
    var BARS = 48, T = new Track(c.bpm, BARS, 1.6), sw = c.swing, bits = c.bits, hz = c.hz;
    function grit(x, lp) { return crunch(x, bits, hz, lp || c.lp || 8500); }
    var K = grit(room(kick(c.kick), 0.45, 0.1));
    var SN = grit(room(snare(c.snare), c.snRoom || 0.9, c.snWet || 0.32, { size: 1.15 }));
    var GH = grit(room(snare({ body: c.snare.body, bdec: 0.05, dec: 0.07, wire: 0.9, peak: 0.45, seed: 26 }), 0.5, 0.18), 7500);
    var HH = grit(room(metal({ dec: c.hatDec || 0.035, tune: c.hatTune || 1.3, bp: 7200, hp: 5200, noise: 0.6, peak: 0.42 }), 0.35, 0.12));
    var HO = grit(room(metal({ dec: 0.22, tune: c.hatTune || 1.3, bp: 6800, hp: 4800, noise: 0.6, peak: 0.42, seed: 34 }), 0.5, 0.18));
    var RM = c.rim ? grit(room(rim({ f: c.rim, peak: 0.45 }), 0.6, 0.25)) : null;
    var SH = c.shaker ? grit(noiseHit({ f: 7000, dec: 0.03, peak: 0.25, seed: 77 })) : null;
    var bc = {}, kc = {};
    function bn(m, st) { var k = m + ":" + st; return bc[k] || (bc[k] = bassNote(m, st * T.step, c.bass)); }
    function keyOf(ci, st) {
      var k = ci + ":" + st; if (kc[k]) return kc[k];
      var ch = c.chords[ci], len = st * T.step, x;
      if (c.keys === "ep") x = epiano(ch, len);
      else if (c.keys === "piano") x = room(piano(ch, len * 0.9, { dec: c.keyDec || 0.6, bright: 0.85, seed: 41 + ci }), 1.0, 0.22, { hp: 200 });
      else if (c.keys === "strings") x = strings(ch, len, { att: 0.3, rel: 0.5, cut: c.keyCut || 2200, seed: 43 + ci });
      else x = synthStab(ch, { len: Math.min(len, 0.24), reps: 0, rt: 0.9, wet: 0.25, seed: 53 + ci });
      return (kc[k] = x);
    }
    var keys = T.bus(), pad = c.pad ? T.bus() : null, VX = c.vox ? room(vox(c.vox, T.beat * 1.5), 2.2, 0.45, { hp: 300, size: 1.3 }) : null;
    for (var b = 0; b < BARS; b++) {
      var drop = b >= 32 && b < 36, ci = b % c.chords.length, two = b % 2;
      var full = (b >= 16 && b < 32) || (b >= 36 && b < 44), hasBass = b >= 8 && b < 44;
      if (!drop) {
        c.kicks[two].forEach(function (x) { T.add(K, T.t(b, x[0], sw), 0.9 * x[1]); });
        c.snares.forEach(function (st) { T.add(SN, T.t(b, st, sw), 0.82); });
        c.ghosts[two].forEach(function (x) { T.add(GH, T.t(b, x[0], sw), x[1] * 1.4); });
        for (var s = 0; s < 16; s += c.hat16 ? 1 : 2) {
          var open = s === 14 && two && c.openHat !== false;
          T.add(open ? HO : HH, T.t(b, s, sw), open ? 0.26 : (s % 4 === 0 ? 0.32 : s % 2 ? 0.12 : 0.2), 0.2);
        }
        if (RM) c.rims[two].forEach(function (st) { T.add(RM, T.t(b, st, sw), 0.5, -0.25); });
        if (SH) for (var q = 1; q < 16; q += 2) T.add(SH, T.t(b, q, sw), 0.16, -0.35);
      }
      if (hasBass) {
        var root = c.roots[ci];
        if (drop) T.add(bn(root, 16), T.t(b, 0), 0.7);
        else c.bassLine.forEach(function (x) { T.add(bn(root + x[2], x[1]), T.t(b, x[0], sw), x[3]); });
      }
      if (full || drop) {
        c.keyHits.forEach(function (x) { T.add(keyOf(ci, x[1]), T.t(b, x[0], c.keySwing ? sw : 0), x[2], 0, keys); });
        if (pad) T.add(strings(c.chords[ci].map(function (m) { return m - 12; }), T.bar * 0.97, { att: 0.6, rel: 0.8, cut: 1500, seed: 90 + ci }), T.t(b, 0), c.pad, 0, pad);
        if (VX && b % 8 === 0) T.add(VX, T.t(b, 0), 0.5, -0.1);
      }
    }
    /* the sample, off a worn record: the waver (once a bar), a dark top, the sampler */
    var wl = Float32Array.from(keys.L), wr = Float32Array.from(keys.R), wob = c.wobble || 0.0016;
    for (var i = 0; i < T.n; i++) {
      var ph = (i % T.barN) / T.barN, d = (wob * 1.3 + wob * Math.sin(TAU * ph) + wob * 0.3 * Math.sin(TAU * 8 * ph)) * SR, p = i - d;
      if (p < 1) { keys.L[i] = keys.R[i] = 0; continue; }
      var j = p | 0, f = p - j;
      keys.L[i] = wl[j] + (wl[j + 1] - wl[j]) * f; keys.R[i] = wr[j] + (wr[j + 1] - wr[j]) * f;
    }
    filt(keys.L, "lp", c.keyLp || 5000, 0.7); filt(keys.R, "lp", c.keyLp || 5000, 0.7);
    crunch(keys, bits, hz, c.keyLp ? c.keyLp + 1500 : 6800, T.barN);
    T.mixIn(keys, c.keyGain || 1);
    if (pad) { crunch(pad, bits, hz, 5000, T.barN); T.mixIn(pad, 1); }
    /* the dust: two bars of hiss and pops, looped */
    var cr = rand(c.seed || 71), hl = 0, hr = 0, dust = St(2 * T.barN), lvl = c.dust || 0.008;
    for (var z0 = 0; z0 < dust.L.length; z0++) {
      hl += 0.1 * ((cr() * 2 - 1) - hl); hr += 0.1 * ((cr() * 2 - 1) - hr);
      dust.L[z0] += hl * lvl; dust.R[z0] += hr * lvl;
      if (cr() < (c.pops || 0.00016)) { var a = (cr() * 2 - 1) * lvl * 11; for (var z = 0; z < 24; z++) { var v = a * Math.exp(-z / 4), cz = (z0 + z) % dust.L.length; dust.L[cz] += v; dust.R[cz] += v * 0.8; } }
    }
    for (var db = 0; db < BARS; db += 2) T.add(dust, T.t(db, 0), 1);
    return T.finish(-14);
  }
  /* SMOKY TRIP-HOP · 80 BPM · C minor. A slow, heavy break, a sub that sits under it, a worn electric piano. */
  function smoky() { return dusty({ bpm: 80, swing: 0.6, bits: 10, hz: 22050, lp: 7500, seed: 81,
    kick: { f0: 105, f1: 46, pt: 0.03, dec: 0.26, hold: 0.014, drive: 1.5, click: 0.18, cf: 1500, len: 0.55 },
    snare: { body: 170, bdec: 0.11, dec: 0.22, wire: 1.5, peak: 0.9 }, snRoom: 1.3, snWet: 0.42,
    kicks: [[[0, 1], [7, 0.6], [10, 0.85]], [[0, 1], [3, 0.5], [10, 0.8], [13, 0.45]]], snares: [4, 12],
    ghosts: [[[6, 0.2], [15, 0.26]], [[9, 0.2], [14, 0.28]]], rim: 1600, rims: [[11], [7]], shaker: true,
    roots: [36, 32, 39, 34], chords: [[51, 55, 58, 62], [56, 60, 63, 67], [51, 55, 58, 63], [53, 58, 62, 65]],
    bass: { cut: 110, env: 200, edec: 0.2, res: 0.1, att: 0.012, dec: 0.7, sus: 0.8, saw: 0.2, sq: 0.1, sub: 0.85, drive: 1.25, rel: 0.06 },
    bassLine: [[0, 11, 0, 0.78], [11, 3, 12, 0.4], [14, 2, 7, 0.38]],
    keys: "ep", keyHits: [[0, 8, 1.0], [10, 5, 0.75]], keyLp: 4200, wobble: 0.0021, dust: 0.011, pops: 0.00022, vox: 60 }); }
  /* MIDNIGHT TRIP-HOP · 75 BPM · F minor. Darker: a lazy half-time break, dusty strings, a voice in the distance. */
  function midnight() { return dusty({ bpm: 75, swing: 0.56, bits: 9, hz: 18900, lp: 7000, seed: 83,
    kick: { f0: 98, f1: 43, pt: 0.035, dec: 0.3, hold: 0.016, drive: 1.6, click: 0.15, cf: 1300, len: 0.6 },
    snare: { body: 160, bdec: 0.12, dec: 0.26, wire: 1.4, peak: 0.88 }, snRoom: 1.6, snWet: 0.48,
    kicks: [[[0, 1], [10, 0.8]], [[0, 1], [6, 0.55], [11, 0.75]]], snares: [8],
    ghosts: [[[5, 0.18], [13, 0.22]], [[3, 0.16], [14, 0.24]]], rim: 1450, rims: [[4, 12], [4, 12, 15]], openHat: false,
    roots: [29, 25, 32, 27], chords: [[56, 60, 63, 67], [53, 56, 60, 63], [55, 60, 63, 67], [51, 55, 58, 62]],
    bass: { cut: 95, env: 160, edec: 0.25, res: 0.08, att: 0.015, dec: 0.9, sus: 0.85, saw: 0.15, sq: 0.05, sub: 0.95, drive: 1.3, rel: 0.08 },
    bassLine: [[0, 14, 0, 0.82], [14, 2, -2, 0.35]],
    keys: "strings", keyCut: 1900, keyHits: [[0, 16, 1.1]], keyLp: 3600, keyGain: 1.15, wobble: 0.0028, dust: 0.013, pops: 0.00026, vox: 65, pad: 0 }); }
  /* RAINY WINDOW TRIP-HOP · 72 BPM · A minor. A soft, swaying break, piano chords and strings under them. */
  function rainy() { return dusty({ bpm: 72, swing: 0.62, bits: 11, hz: 24000, lp: 8000, seed: 85,
    kick: { f0: 110, f1: 48, pt: 0.028, dec: 0.22, hold: 0.012, drive: 1.35, click: 0.2, cf: 1700, len: 0.5 },
    snare: { body: 185, bdec: 0.09, dec: 0.19, wire: 1.3, peak: 0.85 }, snRoom: 1.2, snWet: 0.4,
    kicks: [[[0, 1], [7, 0.55], [9, 0.8]], [[0, 1], [10, 0.85], [15, 0.4]]], snares: [4, 12],
    ghosts: [[[11, 0.22]], [[6, 0.2], [13, 0.24]]], shaker: true,
    roots: [33, 29, 36, 31], chords: [[57, 60, 64, 67], [53, 57, 60, 64], [55, 60, 64, 67], [55, 59, 62, 65]],
    bass: { cut: 120, env: 220, edec: 0.2, res: 0.1, att: 0.01, dec: 0.6, sus: 0.75, saw: 0.25, sq: 0.1, sub: 0.75, drive: 1.2, rel: 0.05 },
    bassLine: [[0, 10, 0, 0.75], [10, 4, 7, 0.42], [14, 2, 12, 0.36]],
    keys: "piano", keyDec: 0.9, keyHits: [[0, 6, 0.9], [6, 4, 0.6], [12, 4, 0.7]], keyLp: 4800, keySwing: true, wobble: 0.0018, dust: 0.01, pad: 0.55 }); }
  /* BASEMENT BOOM BAP · 96 BPM · G minor. A hard kick, a cracking snare, swung hats and a chopped piano. */
  function basement() { return dusty({ bpm: 96, swing: 0.62, bits: 12, hz: 26040, lp: 9000, seed: 87,
    kick: { f0: 150, f1: 52, pt: 0.025, dec: 0.22, hold: 0.014, drive: 2.0, click: 0.35, cf: 2400, len: 0.45 },
    snare: { body: 200, bdec: 0.08, dec: 0.17, wire: 1.8, peak: 0.95, bodyAmt: 1.0 }, snRoom: 0.8, snWet: 0.3,
    kicks: [[[0, 1], [7, 0.65], [10, 0.95]], [[0, 1], [2, 0.7], [10, 0.9], [13, 0.5]]], snares: [4, 12],
    ghosts: [[[15, 0.22]], [[9, 0.2], [15, 0.24]]],
    roots: [31, 27, 34, 26], chords: [[58, 62, 65, 69], [55, 58, 63, 67], [58, 62, 65, 70], [54, 57, 62, 66]],
    bass: { cut: 140, env: 380, edec: 0.12, res: 0.15, att: 0.006, dec: 0.35, sus: 0.6, saw: 0.35, sq: 0.15, sub: 0.7, drive: 1.5, rel: 0.04 },
    bassLine: [[0, 3, 0, 0.8], [7, 2, 0, 0.6], [10, 3, 0, 0.75], [13, 2, -2, 0.5]],
    keys: "piano", keyDec: 0.45, keyHits: [[0, 3, 1.0], [3, 3, 0.85], [6, 2, 0.7], [10, 4, 0.9]], keyLp: 5600, keySwing: true, wobble: 0.0012, dust: 0.007 }); }
  /* GOLDEN ERA BOOM BAP · 90 BPM · E minor. A dusty break with a heavy swing and horn stabs off an old soul record. */
  function golden() { return dusty({ bpm: 90, swing: 0.64, bits: 12, hz: 26040, lp: 8500, seed: 89,
    kick: { f0: 140, f1: 50, pt: 0.027, dec: 0.24, hold: 0.014, drive: 1.9, click: 0.3, cf: 2200, len: 0.48 },
    snare: { body: 195, bdec: 0.09, dec: 0.19, wire: 1.7, peak: 0.95 }, snRoom: 0.9, snWet: 0.34,
    kicks: [[[0, 1], [3, 0.55], [10, 0.9]], [[0, 1], [8, 0.7], [11, 0.85]]], snares: [4, 12],
    ghosts: [[[7, 0.24], [14, 0.2]], [[6, 0.2], [15, 0.26]]], hat16: true,
    roots: [28, 24, 31, 26], chords: [[64, 67, 71, 74], [60, 64, 67, 71], [62, 67, 71, 74], [62, 66, 69, 72]],
    bass: { cut: 150, env: 420, edec: 0.1, res: 0.18, att: 0.005, dec: 0.3, sus: 0.55, saw: 0.4, sq: 0.2, sub: 0.6, drive: 1.6, rel: 0.04 },
    bassLine: [[0, 4, 0, 0.8], [6, 2, 7, 0.5], [10, 4, 0, 0.75], [14, 2, 10, 0.45]],
    keys: "horn", keyHits: [[0, 2, 0.9], [3, 2, 0.75], [10, 2, 0.85]], keyLp: 5200, keySwing: true, wobble: 0.0014, dust: 0.009, pops: 0.0002 }); }
  /* CYPHER BOOM BAP · 84 BPM · D minor. Laid back for rhyming over: a fat kick, a rim on the off beats, jazzy keys. */
  function cypher() { return dusty({ bpm: 84, swing: 0.6, bits: 12, hz: 26040, lp: 8800, seed: 91,
    kick: { f0: 135, f1: 48, pt: 0.03, dec: 0.27, hold: 0.016, drive: 1.8, click: 0.28, cf: 2000, len: 0.5 },
    snare: { body: 190, bdec: 0.1, dec: 0.2, wire: 1.6, peak: 0.92 }, snRoom: 1.0, snWet: 0.36,
    kicks: [[[0, 1], [8, 0.6], [10, 0.9]], [[0, 1], [3, 0.6], [7, 0.5], [10, 0.85]]], snares: [4, 12],
    ghosts: [[[13, 0.22]], [[7, 0.2], [15, 0.22]]], rim: 1750, rims: [[6], [14]],
    roots: [38, 31, 34, 33], chords: [[60, 65, 69, 72], [59, 62, 65, 69], [58, 62, 65, 69], [57, 61, 64, 67]],
    bass: { cut: 130, env: 300, edec: 0.14, res: 0.12, att: 0.008, dec: 0.45, sus: 0.65, saw: 0.3, sq: 0.1, sub: 0.75, drive: 1.4, rel: 0.05 },
    bassLine: [[0, 6, 0, 0.8], [6, 2, 7, 0.5], [8, 2, 12, 0.45], [10, 4, 0, 0.7], [14, 2, 5, 0.45]],
    keys: "ep", keyHits: [[0, 4, 0.9], [6, 3, 0.7], [11, 4, 0.8]], keyLp: 5000, keySwing: true, wobble: 0.0015, dust: 0.008 }); }

  var LIST = [
    { id: "house", make: chicago, bpm: 125, bars: 72, key: "A minor", hue: 28,
      en: "Chicago House", es: "House de Chicago", what_en: "Warehouse drums, piano stabs and a bassline", what_es: "Batería de bodega, acordes de piano y un bajo" },
    { id: "techno", make: techno, bpm: 135, bars: 80, key: "G minor", hue: 210,
      en: "Driving Techno", es: "Techno con empuje", what_en: "A hard kick, a rolling bass, a stab that opens up", what_es: "Un bombo duro, un bajo que rueda, un acorde que se abre" },
    { id: "triphop", make: triphop, bpm: 90, bars: 48, key: "D minor", hue: 150,
      en: "Dusty Trip-Hop Break", es: "Break trip-hop polvoriento", what_en: "A heavy break off an old record, keys and a voice", what_es: "Un break pesado de un disco viejo, teclado y una voz" },
    { id: "disco", make: disco, bpm: 120, bars: 72, key: "E minor", hue: 320,
      en: "Disco Edit", es: "Edit de disco", what_en: "Four on the floor, octave bass, funk guitar, strings", what_es: "Bombo en cada pulso, bajo en octavas, guitarra funk, cuerdas" },
    { id: "smoky", make: smoky, bpm: 80, bars: 48, key: "C minor", hue: 168,
      en: "Smoky Trip-Hop", es: "Trip-hop ahumado", what_en: "A slow heavy break, deep sub, a worn electric piano", what_es: "Un break lento y pesado, bajo profundo, un piano eléctrico gastado" },
    { id: "midnight", make: midnight, bpm: 75, bars: 48, key: "F minor", hue: 250,
      en: "Midnight Trip-Hop", es: "Trip-hop de medianoche", what_en: "A lazy half-time break, dusty strings, a far-off voice", what_es: "Un break lento a medio tiempo, cuerdas polvorientas, una voz lejana" },
    { id: "rainy", make: rainy, bpm: 72, bars: 48, key: "A minor", hue: 195,
      en: "Rainy Window Trip-Hop", es: "Trip-hop de ventana con lluvia", what_en: "A swaying break, piano chords, strings underneath", what_es: "Un break que se mece, acordes de piano, cuerdas debajo" },
    { id: "basement", make: basement, bpm: 96, bars: 48, key: "G minor", hue: 12,
      en: "Basement Boom Bap", es: "Boom bap del sótano", what_en: "A hard kick, a cracking snare, a chopped piano", what_es: "Un bombo duro, una caja que truena, un piano cortado" },
    { id: "golden", make: golden, bpm: 90, bars: 48, key: "E minor", hue: 45,
      en: "Golden Era Boom Bap", es: "Boom bap de la era dorada", what_en: "A swung dusty break and horn stabs off an old soul record", what_es: "Un break polvoriento con swing y golpes de metales de un disco soul viejo" },
    { id: "cypher", make: cypher, bpm: 84, bars: 48, key: "D minor", hue: 290,
      en: "Cypher Boom Bap", es: "Boom bap de cypher", what_en: "Laid back for rhyming: a fat kick, a rim, jazzy keys", what_es: "Relajado para rimar: un bombo gordo, un aro, teclados de jazz" }
  ];
  function render(id) {
    var x = LIST.filter(function (r) { return r.id === id; })[0];
    if (!x) throw new Error("no record " + id);
    var out = x.make();
    out.id = id; out.phrase = 8;
    return out;
  }

  /* ── the isolator EQ (needs an AudioContext, so only on the page) ────────── */
  var XO_LO = 220, XO_HI = 2600, BW_DB = 20 * Math.log10(Math.SQRT1_2);   /* ⚠ a low/high-pass Q is in dB in Web Audio */
  function isolator(ac) {
    function f(type, hz) {
      var b = ac.createBiquadFilter(); b.type = type; b.frequency.value = hz;
      b.Q.value = type === "allpass" ? Math.SQRT1_2 : BW_DB; return b;
    }
    var input = ac.createGain(), out = ac.createGain();
    var lp1 = f("lowpass", XO_LO), lp1b = f("lowpass", XO_LO), ap2 = f("allpass", XO_HI);
    var hp1 = f("highpass", XO_LO), hp1b = f("highpass", XO_LO);
    var lp2 = f("lowpass", XO_HI), lp2b = f("lowpass", XO_HI), hp2 = f("highpass", XO_HI), hp2b = f("highpass", XO_HI);
    var gL = ac.createGain(), gM = ac.createGain(), gH = ac.createGain();
    input.connect(lp1); lp1.connect(lp1b); lp1b.connect(ap2); ap2.connect(gL); gL.connect(out);
    input.connect(hp1); hp1.connect(hp1b);
    hp1b.connect(lp2); lp2.connect(lp2b); lp2b.connect(gM); gM.connect(out);
    hp1b.connect(hp2); hp2.connect(hp2b); hp2b.connect(gH); gH.connect(out);
    var paths = { low: [lp1, lp1b, ap2], mid: [hp1, hp1b, lp2, lp2b], high: [hp1, hp1b, hp2, hp2b] };
    var gains = { low: gL, mid: gM, high: gH };
    var state = { low: 0, mid: 0, high: 0, kill: { low: false, mid: false, high: false } };
    function lin(b) { return state.kill[b] ? 0 : Math.pow(10, state[b] / 20); }
    function apply(b) { var p = gains[b].gain, t = ac.currentTime; p.cancelScheduledValues(t); p.setTargetAtTime(lin(b), t, 0.004); }
    /* the curve on screen is the three paths' own complex answers, summed with their gains */
    var cache = null;
    var shape = {
      getFrequencyResponse: function (freqs, mag, ph) {
        if (!cache || cache.f !== freqs) {
          cache = { f: freqs };
          ["low", "mid", "high"].forEach(function (b) {
            var re = new Float32Array(freqs.length).fill(1), im = new Float32Array(freqs.length);
            var m = new Float32Array(freqs.length), p = new Float32Array(freqs.length);
            paths[b].forEach(function (flt) {
              flt.getFrequencyResponse(freqs, m, p);
              for (var i = 0; i < freqs.length; i++) {
                var cr = m[i] * Math.cos(p[i]), ci = m[i] * Math.sin(p[i]), r0 = re[i];
                re[i] = r0 * cr - im[i] * ci; im[i] = r0 * ci + im[i] * cr;
              }
            });
            cache[b] = { re: re, im: im };
          });
        }
        var a = lin("low"), b2 = lin("mid"), c = lin("high");
        for (var i = 0; i < freqs.length; i++) {
          var re2 = cache.low.re[i] * a + cache.mid.re[i] * b2 + cache.high.re[i] * c;
          var im2 = cache.low.im[i] * a + cache.mid.im[i] * b2 + cache.high.im[i] * c;
          mag[i] = Math.sqrt(re2 * re2 + im2 * im2); if (ph) ph[i] = Math.atan2(im2, re2);
        }
      }
    };
    return {
      input: input, output: out, filters: [shape],
      set: function (b, db) { state[b] = Math.max(-40, Math.min(12, +db || 0)); apply(b); },
      kill: function (b, on) { state.kill[b] = !!on; apply(b); return state.kill[b]; },
      killed: function (b) { return state.kill[b]; },
      gain: function (b) { return state[b]; },
      level: lin,
      flat: function () { state.low = state.mid = state.high = 0; state.kill = { low: false, mid: false, high: false }; apply("low"); apply("mid"); apply("high"); }
    };
  }

  /* ── 3. THE PICTURES OF A RECORD ─────────────────────────────────────────────
     The overview (the whole record, bass, middle and top in three colours, a mark
     every bar and the pads' numbers) and the close-up groove (every beat, the loop
     lit). They are drawn in a Worker where the browser allows it, so the platters
     keep turning while a picture is made, and on the page where it does not. */
  var PADC = ["#f4a3b0", "#f0c26e", "#9fd4a0", "#7fc7f5", "#c9a7f5", "#f5b97f", "#8fe0d0", "#f5e07f"];
  function paintWave(g, o) {        /* o: w, h, peaks, bands {lo, mid, hi} or null, len, sr, bpm, beat0, cues */
    var w = o.w, h = o.h, dur = o.len, sr = o.sr, B = o.bands;
    g.fillStyle = "#06110c"; g.fillRect(0, 0, w, h);
    var layers = B ? [[B.lo, 1, "#f0a35e"], [B.mid, 1.5, "#c6f7b0"], [B.hi, 2.2, "#7fc7f5"]] : [[o.peaks, 1, "#c6f7b0"]];
    layers.forEach(function (L) {
      var arr = L[0], k = L[1]; if (!arr || !arr.length) return;
      g.fillStyle = L[2]; g.beginPath();
      for (var x = 0; x < w; x++) {
        var m = Math.min(1, arr[Math.floor(x / w * arr.length)] * k); if (!(m > 0.002)) continue;
        g.rect(x, h / 2 - m * h * 0.5, 1, Math.max(1, m * h));
      }
      g.fill();
    });
    if (o.bpm > 0 && dur > 0) {               /* a mark every four beats */
      var barSec = 4 * 60 / o.bpm, sec = dur / sr;
      g.fillStyle = "rgba(244,226,176,.32)";
      for (var t = o.beat0; t < sec; t += barSec) { var bx = (t * sr / dur) * w; g.fillRect(bx, 0, 1, h * 0.14); g.fillRect(bx, h * 0.86, 1, h * 0.14); }
    }
    (o.cues || []).forEach(function (cu, i) {   /* the pads' marks */
      if (cu == null || !(dur > 0)) return;
      var cx = (cu / dur) * w;
      g.fillStyle = PADC[i]; g.fillRect(cx - 1, 0, 3, h * 0.22);
      try { g.font = "bold 16px sans-serif"; g.fillText(String(i + 1), cx + 4, h * 0.2); } catch (e) {}
    });
  }
  function paintZoom(g, o) {        /* o: n, h, s0, per, zpk (the loudest of every 32 samples), sr, bpm, beat0, loop [a, b] or null */
    var n = o.n, h = o.h, Z = 32, zp = o.zpk, s0 = o.s0, per = o.per, sr = o.sr;
    g.fillStyle = "#0a1410"; g.fillRect(0, 0, n, h);
    g.fillStyle = "#7fd6a3"; g.beginPath();
    for (var x = 0; x < n; x++) {
      var a = Math.floor((s0 + x * per) / Z), b = Math.floor((s0 + (x + 1) * per) / Z), m = 0;
      for (var k = Math.max(0, a); k <= b && k < zp.length; k++) if (zp[k] > m) m = zp[k];
      if (m > 0.002) g.rect(x, h / 2 - m * h * 0.48, 1, Math.max(1, m * h * 0.96));
    }
    g.fill();
    if (o.bpm > 0) {                          /* every beat, the downbeat brighter */
      var beat = 60 / o.bpm * sr;
      for (var j = Math.ceil((s0 - o.beat0 * sr) / beat); ; j++) {
        var bx = (o.beat0 * sr + j * beat - s0) / per;
        if (bx > n) break;
        if (bx < 0) continue;
        g.fillStyle = (j % 4 === 0) ? "rgba(244,226,176,.55)" : "rgba(244,226,176,.22)";
        g.fillRect(bx, 0, 1.5, h);
      }
    }
    if (o.loop) {
      var x1 = (o.loop[0] - s0) / per, x2 = (o.loop[1] - s0) / per;
      g.fillStyle = "rgba(127,199,245,.18)"; g.fillRect(x1, 0, Math.max(2, x2 - x1), h);
    }
  }

  var API = { SR: SR, loudness: loudness, list: LIST.map(function (x) { var o = {}; for (var k in x) if (k !== "make") o[k] = x[k]; return o; }), render: render, isolator: isolator,
              paintWave: paintWave, paintZoom: paintZoom };
  root.AOGDJ = API;
  if (typeof module === "object" && module && module.exports) module.exports = API;

  /* in a Worker: make the record asked for and hand it back without copying; or draw
     a record's picture and hand it back as a finished image */
  if (typeof WorkerGlobalScope !== "undefined" && root instanceof WorkerGlobalScope) {
    var PIC = {};
    root.onmessage = function (e) {
      var m = e.data || {};
      if (m.t === "picdata") { PIC[m.deck] = { zpk: m.zpk, peaks: m.peaks, bands: m.bands }; return; }
      if (m.t === "pic") {
        var no = function () { root.postMessage({ t: "picfail", req: m.req }); };
        try {
          var D = PIC[m.deck], o = m.o; if (!D) return no();
          var c = new OffscreenCanvas(m.kind === "zoom" ? o.n : o.w, o.h), g = c.getContext("2d");
          if (m.kind === "zoom") { o.zpk = D.zpk; paintZoom(g, o); } else { o.peaks = D.peaks; o.bands = D.bands; paintWave(g, o); }
          c.convertToBlob({ type: "image/png" }).then(function (blob) { root.postMessage({ t: "pic", req: m.req, blob: blob }); }, no);
        } catch (err) { no(); }
        return;
      }
      if (m.t !== "render") return;
      try {
        var t0 = Date.now(), r = render(m.id);
        root.postMessage({ t: "done", id: m.id, L: r.L, R: r.R, sr: r.sr, bpm: r.bpm, beat0: r.beat0, bars: r.bars, phrase: r.phrase, ms: Date.now() - t0 }, [r.L.buffer, r.R.buffer]);
      } catch (err) { root.postMessage({ t: "fail", id: m.id, msg: String(err && err.message || err) }); }
    };
  }
})(typeof globalThis !== "undefined" ? globalThis : (typeof self !== "undefined" ? self : this));
