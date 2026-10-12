/* AOG-HUM-V1 (2026-10-12) — the listening half of "Hum it, and the Studio plays it" (aog-hum.js is the rest).
   Jimmy picked: "Hum it, and the Studio plays it. Sing or hum a tune and it becomes notes, played on any instrument."

   Nothing here runs on page load. aog-hum.js starts this file as a Worker on the first press of Record (a browser
   without Workers loads it as a script and runs it in slices of 10 ms). It hears only the sound it is handed and
   sends nothing anywhere.

   tune(x, sr)  → { notes:[{t, d, m, v, c}], hop }   t, d in seconds of x; m a MIDI number with its fraction (as sung);
                  v 0..1 how strongly; c 0..1 how sure.
     1 · a low-pass and a step down to about 11 kHz (a voice needs no more);
     2 · every 10 ms: how loud (dB), and YIN (de Cheveigné & Kawahara 2002: the period that differs least from itself,
         its cumulative-mean normalised difference, first dip under 0.2, parabolic fit). Breath and hiss have no period,
         so they read as "no pitch"; a frame is voiced when it is loud enough over this recording's own quiet and has a
         clear period (a softer frame next to a voiced one counts too);
     3 · octave slips fixed against the frames around them (median of five);
     4 · notes: a stretch of voice is one note until (a) the sound dips at least 6 dB and comes back ("la la", a new
         breath) or (b) the pitch settles somewhere else at least 0.65 of a semitone away for 50 ms (legato humming).
         Vibrato swings around one note and never settles away, so it stays one note; a glide is split where it
         crosses the middle between the two notes. A note shorter than 70 ms joins its neighbour.
     5 · each note's pitch is the median of its middle (the scoop in and the fall away left out).
   beats(x, sr) → { hits:[{t, v, c, lo, hi, sh}] }   for "Beatbox it": onsets by spectral flux (log magnitude, 1024-point
                  FFT, 5.3 ms hops, a moving median threshold, 60 ms apart at least); each with the next 40 ms's
                  spectral centroid c (Hz), its share of power under 250 Hz (lo) and over 5 kHz (hi), and how fast it
                  dies away (sh, dB). aog-hum.js names the sound (kick, snare, hi-hat) from these. */
(function (G) {
  "use strict";

  /* ── a low-pass (windowed sinc) and keeping every q-th sample ── */
  function* decimate(x, sr, out) {
    var q = Math.max(1, Math.floor(sr / 11000)), sr2 = sr / q;
    if (q === 1) { out.y = x; out.sr = sr; return; }
    var fc = 0.45 / q, half = 6 * q, h = new Float32Array(2 * half + 1), s = 0, i, k;
    for (k = -half; k <= half; k++) {
      var a = 2 * Math.PI * fc * k, sinc = k ? Math.sin(a) / (Math.PI * k) : 2 * fc, w = 0.42 + 0.5 * Math.cos(Math.PI * k / half) + 0.08 * Math.cos(2 * Math.PI * k / half);
      h[k + half] = sinc * w; s += sinc * w;
    }
    for (k = 0; k < h.length; k++) h[k] /= s;
    var n2 = Math.floor(x.length / q), y = new Float32Array(n2), N = x.length;
    for (i = 0; i < n2; i++) {
      var c = i * q, acc = 0, a0 = c - half, k0 = a0 < 0 ? -a0 : 0, k1 = Math.min(h.length, N - a0);
      for (k = k0; k < k1; k++) acc += x[a0 + k] * h[k];
      y[i] = acc;
      if ((i & 8191) === 0) yield;
    }
    out.y = y; out.sr = sr2;
  }

  function median(a) { if (!a.length) return 0; var b = a.slice().sort(function (p, q) { return p - q; }), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
  function db(v) { return v > 1e-10 ? 10 * Math.log(v) / Math.LN10 : -100; }

  /* ── the tune ── */
  function* tuneGen(x, sr, res) {
    var D = {}; yield* decimate(x, sr, D);
    var y = D.y, s2 = D.sr, hop = Math.round(0.01 * s2), Wi = Math.round(0.025 * s2), tmax = Math.floor(s2 / 60), tmin = Math.max(2, Math.floor(s2 / 1050));
    var nF = Math.max(0, Math.floor((y.length - Wi - tmax - 2) / hop)), E = new Float32Array(nF), F = new Float32Array(nF), AP = new Float32Array(nF);
    var i, j, tau, d = new Float64Array(tmax + 2);
    /* how loud, every frame */
    for (i = 0; i < nF; i++) { var s0 = i * hop, e = 0; for (j = 0; j < Wi; j++) e += y[s0 + j] * y[s0 + j]; E[i] = db(e / Wi); }
    var sorted = Array.prototype.slice.call(E).sort(function (a, b) { return a - b; }), floor = sorted.length ? sorted[Math.floor(sorted.length * 0.1)] : -100,
      top = sorted.length ? sorted[sorted.length - 1] : -100, gate = Math.max(floor + 12, -62, top - 42);
    /* YIN on the frames loud enough to be a voice */
    for (i = 0; i < nF; i++) {
      F[i] = 0; AP[i] = 1;
      if (E[i] < gate) continue;
      var st = i * hop, run = 0, best = -1;
      for (tau = 1; tau <= tmax + 1; tau++) { var sum = 0; for (j = 0; j < Wi; j++) { var df = y[st + j] - y[st + j + tau]; sum += df * df; } run += sum; d[tau] = run > 0 ? sum * tau / run : 1; }
      for (tau = tmin; tau <= tmax; tau++) if (d[tau] < 0.2) { while (tau + 1 <= tmax && d[tau + 1] < d[tau]) tau++; best = tau; break; }
      if (best < 0) { var mv = 9; for (tau = tmin; tau <= tmax; tau++) if (d[tau] < mv) { mv = d[tau]; best = tau; } }
      if (best <= 1 || best >= tmax) continue;
      var a = d[best - 1], b = d[best], cc = d[best + 1], den = a - 2 * b + cc, sh = den ? (a - cc) / (2 * den) : 0;
      if (sh > 1 || sh < -1) sh = 0;
      F[i] = s2 / (best + sh); AP[i] = b;
      if ((i & 63) === 0) yield;
    }
    /* voiced: loud enough and a clear period; a frame a little less clear next to a voiced one counts too */
    var V = new Uint8Array(nF), k;
    for (i = 0; i < nF; i++) V[i] = F[i] > 0 && AP[i] < 0.35 ? 1 : 0;
    for (k = 0; k < 2; k++) for (i = 0; i < nF; i++) if (!V[i] && F[i] > 0 && AP[i] < 0.55 && ((i > 0 && V[i - 1]) || (i + 1 < nF && V[i + 1]))) V[i] = 2;
    var P = new Float32Array(nF);
    for (i = 0; i < nF; i++) P[i] = V[i] ? 69 + 12 * Math.log(F[i] / 440) / Math.LN2 : NaN;
    /* stretches of voice (a gap of up to 30 ms is bridged, unless the sound dips there) */
    var runs = [], a0 = -1, gap = 0;
    for (i = 0; i <= nF; i++) {
      var on = i < nF && V[i];
      if (on) { if (a0 < 0) a0 = i; gap = 0; }
      else if (a0 >= 0) { gap++; if (gap > 3 || i === nF) { runs.push([a0, i - gap]); a0 = -1; gap = 0; } }
    }
    /* octave slips, against the median of five */
    runs.forEach(function (r) {
      for (var q = r[0]; q <= r[1]; q++) { if (isNaN(P[q])) continue; var w = []; for (var z = Math.max(r[0], q - 2); z <= Math.min(r[1], q + 2); z++) if (!isNaN(P[z])) w.push(P[z]);
        var md = median(w); if (Math.abs(P[q] - md) > 6) P[q] += 12 * Math.round((md - P[q]) / 12); }
      /* the bridged gaps take the pitch around them */
      for (q = r[0]; q <= r[1]; q++) if (isNaN(P[q])) { var lft = q - 1; while (lft >= r[0] && isNaN(P[lft])) lft--; var rt = q + 1; while (rt <= r[1] && isNaN(P[rt])) rt++;
        P[q] = lft >= r[0] ? P[lft] : P[rt]; }
    });
    yield;
    /* smoothed loudness (30 ms) and pitch (median of seven, 70 ms) */
    var ES = new Float32Array(nF);
    for (i = 0; i < nF; i++) { var sE = 0, nE = 0; for (j = Math.max(0, i - 1); j <= Math.min(nF - 1, i + 1); j++) { sE += E[j]; nE++; } ES[i] = sE / nE; }
    var segs = [];
    runs.forEach(function (r) {
      if (r[1] - r[0] + 1 < 6) return;
      /* (a) the sound dips and comes back */
      var cuts = [r[0]];
      for (var q = r[0] + 4; q <= r[1] - 4; q++) {
        if (!(ES[q] <= ES[q - 1] && ES[q] < ES[q + 1])) continue;
        var lp = -200, rp = -200, z;
        for (z = Math.max(r[0], q - 15); z < q; z++) if (ES[z] > lp) lp = ES[z];
        for (z = q + 1; z <= Math.min(r[1], q + 15); z++) if (ES[z] > rp) rp = ES[z];
        var depth = Math.min(lp, rp) - ES[q];
        if (depth >= 6 && q - cuts[cuts.length - 1] >= 5) {
          /* the note before ends at the bottom of the dip; the next begins right after it (the "l" of "la" is its start) */
          cuts.push(-q - 1, q + 1);   /* -(end of the note before)-1, then the start of the next */
        }
      }
      var parts = [], cur = cuts[0];
      for (var c2 = 1; c2 < cuts.length; c2 += 2) { parts.push([cur, -cuts[c2] - 1]); cur = cuts[c2 + 1]; }
      parts.push([cur, r[1]]);
      /* (b) the pitch settles somewhere else */
      parts.forEach(function (pr) {
        var s = pr[0], e = pr[1]; if (e - s + 1 < 4) { segs.push([s, e, r[0] === s]); return; }
        var PS = [], z;
        for (z = s; z <= e; z++) { var w = []; for (var u = Math.max(s, z - 3); u <= Math.min(e, z + 3); u++) w.push(P[u]); PS.push(median(w)); }
        var st0 = s, ref = median(PS.slice(0, Math.min(5, PS.length))), K = 5, idx = 1, first = true;
        while (idx < PS.length) {
          if (Math.abs(PS[idx] - ref) > 0.65) {
            var found = -1, m2 = 0;
            for (var jj = idx; jj <= Math.min(PS.length - K, idx + 30); jj++) {
              var win = PS.slice(jj, jj + K), mn = Math.min.apply(null, win), mx = Math.max.apply(null, win), mm = median(win);
              if (mx - mn <= 0.6 && Math.abs(mm - ref) >= 0.65) { found = jj; m2 = mm; break; }
            }
            if (found >= 0) {
              var mid = (ref + m2) / 2, cut = found;
              for (var cx = idx; cx <= found; cx++) if ((PS[cx] - mid) * (ref - mid) <= 0) { cut = cx; break; }
              if (cut - (st0 - s) >= 1) { segs.push([st0, s + cut - 1, first && r[0] === st0]); first = false; st0 = s + cut; }
              ref = m2; idx = found + K; continue;
            }
          } else if (idx - (st0 - s) > 10) {
            /* a slow drift is followed (the last 200 ms) */
            ref = median(PS.slice(Math.max(st0 - s, idx - 20), idx + 1));
          }
          idx++;
        }
        segs.push([st0, e, first && r[0] === st0]);
      });
    });
    yield;
    /* short pieces join their neighbour */
    var minF = 7;
    for (var pass = 0; pass < 3; pass++) {
      for (i = 0; i < segs.length; i++) {
        var g = segs[i]; if (g[1] - g[0] + 1 >= minF) continue;
        var prev = segs[i - 1], next = segs[i + 1], pm = med(g);
        var jp = prev && prev[1] + 1 === g[0], jn = next && g[1] + 1 === next[0];
        if (jp && (!jn || Math.abs(med(prev) - pm) <= Math.abs(med(next) - pm))) { prev[1] = g[1]; segs.splice(i, 1); i--; }
        else if (jn) { next[0] = g[0]; next[2] = next[2] || g[2]; segs.splice(i, 1); i--; }
        else if (g[1] - g[0] + 1 < 5) { segs.splice(i, 1); i--; }
      }
    }
    function med(g) { var w = []; for (var z = g[0]; z <= g[1]; z++) if (!isNaN(P[z])) w.push(P[z]); return median(w); }
    var tf = function (f) { return (f * hop + Wi / 2) / s2; };
    var emax = -200; segs.forEach(function (g) { for (var z = g[0]; z <= g[1]; z++) if (ES[z] > emax) emax = ES[z]; });
    var notes = segs.map(function (g) {
      var n = g[1] - g[0] + 1, a1 = g[0] + Math.floor(n * 0.2), b1 = g[1] - Math.floor(n * 0.15), w = [], ap = 0, pk = -200, z;
      if (b1 - a1 < 2) { a1 = g[0]; b1 = g[1]; }
      for (z = a1; z <= b1; z++) if (!isNaN(P[z])) w.push(P[z]);
      for (z = g[0]; z <= g[1]; z++) { ap += Math.min(1, AP[z]); if (ES[z] > pk) pk = ES[z]; }
      var v = 0.45 + 0.5 * Math.max(0, Math.min(1, (pk - (emax - 24)) / 24));
      return { t: r4(tf(g[0]) - hop / s2 / 2), d: r4((n) * hop / s2), m: Math.round(median(w) * 1000) / 1000, v: Math.round(v * 100) / 100, c: Math.round((1 - ap / n) * 100) / 100 };
    }).filter(function (q) { return isFinite(q.m) && q.m > 20 && q.m < 110; });
    res.out = { notes: notes, hop: hop / s2, frames: nF, gate: gate };
  }
  function r4(v) { return Math.round(v * 10000) / 10000; }

  /* ── a radix-2 FFT, in place ── */
  function fft(re, im) {
    var n = re.length, i, j = 0, k, len;
    for (i = 1; i < n; i++) { var bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { var t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (len = 2; len <= n; len <<= 1) {
      var ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (i = 0; i < n; i += len) {
        var cr = 1, ci = 0;
        for (k = 0; k < len / 2; k++) {
          var a = i + k, b = a + len / 2, xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
          var nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
        }
      }
    }
  }

  /* ── mouth drums ── */
  function* beatGen(x, sr, res) {
    var N = sr >= 32000 ? 1024 : 512, hop = N / 4, nF = Math.max(0, Math.floor((x.length - N) / hop)), bin = sr / N, half = N / 2;
    var win = new Float32Array(N), i, k;
    for (i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
    var re = new Float64Array(N), im = new Float64Array(N), Lp = new Float32Array(half), Lc = new Float32Array(half);
    var FL = new Float32Array(nF), PT = new Float32Array(nF), PL = new Float32Array(nF), PH = new Float32Array(nF), CN = new Float32Array(nF), E = new Float32Array(nF);
    var kLo = Math.ceil(250 / bin), kHi = Math.floor(5000 / bin);
    for (i = 0; i < nF; i++) {
      var s0 = i * hop;
      for (k = 0; k < N; k++) { re[k] = x[s0 + k] * win[k]; im[k] = 0; }
      fft(re, im);
      var pt = 0, pl = 0, ph = 0, cn = 0, fl = 0;
      for (k = 1; k < half; k++) {
        var p = re[k] * re[k] + im[k] * im[k], mg = Math.sqrt(p);
        Lc[k] = Math.log(1 + 1000 * mg);
        var df = Lc[k] - Lp[k]; if (df > 0) fl += df;
        pt += p; cn += p * k * bin; if (k < kLo) pl += p; else if (k > kHi) ph += p;
      }
      FL[i] = i ? fl : 0; PT[i] = pt; PL[i] = pl; PH[i] = ph; CN[i] = cn; E[i] = db(pt / N);
      var sw = Lp; Lp = Lc; Lc = sw;
      if ((i & 127) === 0) yield;
    }
    var sorted = Array.prototype.slice.call(E).sort(function (a, b) { return a - b; }), floor = sorted.length ? sorted[Math.floor(sorted.length * 0.1)] : -100,
      top = sorted.length ? sorted[sorted.length - 1] : -100, gate = Math.max(floor + 15, top - 35);
    var fmax = 0; for (i = 0; i < nF; i++) if (FL[i] > fmax) fmax = FL[i];
    var hits = [], minGap = Math.round(0.06 * sr / hop), lastI = -1e9;
    for (i = 2; i < nF - 2; i++) {
      var f = FL[i] / (fmax || 1); if (f < 0.1) continue;
      var isMax = true; for (k = Math.max(0, i - 3); k <= Math.min(nF - 1, i + 3); k++) if (FL[k] > FL[i]) { isMax = false; break; }
      if (!isMax) continue;
      var loc = []; for (k = Math.max(0, i - 10); k <= Math.min(nF - 1, i + 10); k++) loc.push(FL[k] / (fmax || 1));
      if (f < median(loc) + 0.08) continue;
      var eMax = -200; for (k = i; k <= Math.min(nF - 1, i + 3); k++) if (E[k] > eMax) eMax = E[k];
      if (eMax < gate) continue;
      if (i - lastI < minGap) { var h0 = hits[hits.length - 1]; if (h0 && FL[i] > h0._f) { hits.pop(); } else continue; }
      /* the ring of the sound before (far softer, soon after it) is not a new sound */
      var hp = hits[hits.length - 1];
      if (hp && i - hp._i < Math.round(0.25 * sr / hop) && eMax < hp._e - 15) continue;
      hits.push({ _i: i, _f: FL[i], _e: eMax }); lastI = i;
    }
    yield;
    hits = hits.map(function (h, n) {
      var a = h._i, nxt = hits[n + 1] ? hits[n + 1]._i : nF, b = Math.min(nF - 1, a + 7, nxt - 1), pt = 0, pl = 0, ph = 0, cn = 0, z, e0 = -200, e1 = -200;
      for (z = a; z <= b; z++) { pt += PT[z]; pl += PL[z]; ph += PH[z]; cn += CN[z]; }
      for (z = a; z <= Math.min(nF - 1, a + 2); z++) e0 = Math.max(e0, E[z]);
      var tl = Math.min(nF - 1, a + 10, Math.max(a + 3, nxt - 1)); e1 = E[tl];
      return { t: r4((a * hop + N / 2) / sr), v: Math.round(Math.min(1, 0.4 + 0.6 * h._f / (fmax || 1)) * 100) / 100, c: Math.round(pt ? cn / pt : 0),
        lo: Math.round((pt ? pl / pt : 0) * 1000) / 1000, hi: Math.round((pt ? ph / pt : 0) * 1000) / 1000, sh: Math.round((e0 - e1) * 10) / 10, e: Math.round(e0 * 10) / 10 };
    });
    res.out = { hits: hits, frames: nF, gate: gate };
  }

  var KINDS = { tune: tuneGen, beats: beatGen };
  /* a job that runs in pieces: step(ms) works for about that long and says whether it is done */
  function job(kind, x, sr) {
    var res = {}, gen = KINDS[kind](x, sr, res), done = false;
    return { step: function (ms) { var t0 = Date.now(); while (!done) { if (gen.next().done) done = true; else if (Date.now() - t0 >= ms) break; } return done; },
      result: function () { return res.out; } };
  }
  function run(kind, x, sr) { var j = job(kind, x, sr); j.step(Infinity); return j.result(); }
  var API = { job: job, run: run, tune: function (x, sr) { return run("tune", x, sr); }, beats: function (x, sr) { return run("beats", x, sr); } };
  G.AOGHumEngine = API;
  /* as a Worker: one message in ({id, kind, x, sr}), one out ({id, out} or {id, err}) */
  if (typeof document === "undefined" && typeof G.postMessage === "function" && typeof G.addEventListener === "function") {
    G.addEventListener("message", function (e) {
      var m = e.data || {};
      try { G.postMessage({ id: m.id, out: run(m.kind, m.x, m.sr) }); } catch (err) { G.postMessage({ id: m.id, err: String(err && err.message || err) }); }
    });
  }
})(typeof self !== "undefined" ? self : this);
