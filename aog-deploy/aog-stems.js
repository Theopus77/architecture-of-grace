/* ══ AOG-STEMS-V1 (2026-10-12) — Split a song into its parts, right on the device ══════════════════════════════════════
   Jimmy: "Split a song into its parts. Drums, bass, voice and the rest come apart right on the device."

   window.AOGStems
     .split(input, {onProgress(p 0..1, wordKey), signal, lesson}) → Promise<Parts>
         input: an AudioBuffer, or an ArrayBuffer / Blob / File of a song. lesson: an AOGLearn Lesson (its bass and melody
         notes guide the split); without one, AOGLearn (aog-learn.js, loaded only now) listens to the song first.
     Parts = { sr, length, numberOfChannels, quality:"listen", drums, bass, voice, other, pack }
         each part is AudioBuffer-like: {numberOfChannels, length, sampleRate, duration, getChannelData(ch), free()}.
         The four always add back to the song (other is what is left), to the last bit of a 16-bit file.
     .mixInto(parts, {drums, bass, voice, other: 0..1}, [Float32Array per channel]) → Promise (in slices of ≤ 12 ms)
     .wav(part) → Blob (16-bit stereo .wav, straight from the kept samples)
     .keep(id, parts) · .kept(id, input) → Parts|null · .has(id) → meta|null · .drop(id)   (IndexedDB "aog-stems")
     .words.en / .words.es · .word(key, lang) · .names.en / .names.es (Drums, Bass, Voice, The rest)

   How (decided by evidence, 2026-10-12): an on-device model was the first choice, but none could be used here. The
   only weights that could be downloaded (the npm "demucs" package: Hybrid Transformer Demucs v4) are 174 MB, three times
   the 60 MB budget, need about 3 GB at their peak and run at 0.7× real time even on a 14-core desktop's browser
   (so many minutes on a phone); the smaller permissively licensed models (Open-Unmix umxhq 4 × 17.8 MB MIT, SCNet
   13 MB MIT) are hosted only on Hugging Face, Zenodo and GitHub releases, which this build machine cannot reach, and
   SCNet runs at 1.7× real time in a desktop browser. So the split is "listen": plain JavaScript, in a Worker (this same
   file runs as the Worker), streamed frame by frame so memory stays small:
     · a 4096-point STFT (hop 1024) of the middle (L+R)/2 and the sides (L−R)/2, both from one complex FFT;
     · drums: harmonic/percussive separation by median filtering (Fitzgerald): a median along time (17 frames) and
       along frequency (17 bins), a soft mask;
     · bass: the bass notes AOGLearn heard (each pitch found again, frame by frame, within ±60 cents), their harmonics
       up to 2 kHz, plus the low band under 90 Hz; only in the middle;
     · voice: the melody notes' harmonics up to 8 kHz, only in the middle, only what is centred (a stereo song), and only
       what stands above the floor of the other sounds there (the floor: the median along frequency);
     · soft (Wiener-like) masks that add to one; "the rest" is the song minus the three, so the four add back exactly.
   The parts are kept as 16-bit samples (drums in stereo, bass and voice in the middle), the rest is worked out from the
   song when needed. Nothing leaves the device. ═══════════════════════════════════════════════════════════════════ */
(function (G) {
"use strict";
var IS_WORKER = typeof document === "undefined" && typeof importScripts === "function";
var SR0 = 44100;
var PARTS = ["drums", "bass", "voice", "other"];
var WORDS = {
  en: { open: "Opening the song…", listen: "Listening to the song…", split: "Splitting the song…", done: "The song is in four parts.",
        stopped: "Stopped. The song is as it was.", failed: "The song did not split. Try a shorter song, or close other apps and try again.",
        memory: "This song is too long to split on this device. Try a shorter song." },
  es: { open: "Abriendo la canción…", listen: "Escuchando la canción…", split: "Separando la canción…", done: "La canción está en cuatro partes.",
        stopped: "Detenido. La canción quedó como estaba.", failed: "La canción no se separó. Prueba una canción más corta, o cierra otras apps e inténtalo otra vez.",
        memory: "Esta canción es muy larga para separarla en este aparato. Prueba una canción más corta." }
};
var NAMES = { en: { drums: "Drums", bass: "Bass", voice: "Voice", other: "The rest" }, es: { drums: "Batería", bass: "Bajo", voice: "Voz", other: "El resto" } };
var MAX_SEC = 15 * 60;   /* a longer file is not split (memory) */

/* ── the FFT: radix 2, in place, on Float64Arrays ── */
function makeFFT(N) {
  var rev = new Uint32Array(N), cs = new Float64Array(N / 2), sn = new Float64Array(N / 2), lg = Math.round(Math.log(N) / Math.LN2), i;
  for (i = 0; i < N; i++) { var r = 0, x = i; for (var b = 0; b < lg; b++) { r = (r << 1) | (x & 1); x >>= 1; } rev[i] = r; }
  for (i = 0; i < N / 2; i++) { cs[i] = Math.cos(2 * Math.PI * i / N); sn[i] = -Math.sin(2 * Math.PI * i / N); }
  return function (re, im, inv) {
    var i, j, t;
    for (i = 0; i < N; i++) { j = rev[i]; if (j > i) { t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (var size = 2; size <= N; size <<= 1) {
      var half = size >> 1, step = N / size;
      for (j = 0; j < half; j++) {
        var wr = cs[j * step], wi = inv ? -sn[j * step] : sn[j * step];
        for (i = j; i < N; i += size) {
          var b2 = i + half, tr = re[b2] * wr - im[b2] * wi, ti = re[b2] * wi + im[b2] * wr;
          re[b2] = re[i] - tr; im[b2] = im[i] - ti; re[i] += tr; im[i] += ti;
        }
      }
    }
  };
}
/* the k-th smallest of a[0..n) (reorders a) */
function selectK(a, n, k) {
  var l = 0, r = n - 1;
  while (l < r) { var x = a[k], i = l, j = r;
    do { while (a[i] < x) i++; while (x < a[j]) j--; if (i <= j) { var t = a[i]; a[i] = a[j]; a[j] = t; i++; j--; } } while (i <= j);
    if (j < k) l = i; if (k < i) r = j; }
  return a[k];
}

/* ══ the split itself: one self-contained job (it uses only what is in this file), run in a Worker or in slices.
   X: one or two Float32Arrays (the song's channels); notes: {bass:[{t,d,m,conf}], melody:[…], tune: cents}.
   run(ms) works for about that long and says whether it is done; out() gives the parts as Int16Arrays. ══ */
var TUNE = { HR: 8, VR: 8, HL: 21, LMAX: 260, KV: 10, WU: 1, WC: 0.8, CG: 0.3, BETA: 1, KAPPA: 3, FLOOR_V: 1.0, FLOOR_B: 0.5, SIG_V: 0.02, SIG_B: 0.01, VMAX: 8000, BMAX: 2000, BLOW: 130, WMIN: 0.15, C0: 0.3, C1: 0.4 };
function stemsJob(X, n, sr, notes, tune) {
  var P0 = tune || TUNE;
  var nch = X.length > 1 ? 2 : 1, X0 = X[0], X1 = nch > 1 ? X[1] : null;
  var N = sr > 60000 ? 8192 : 4096, hop = N / 4, K = N / 2 + 1, df = sr / N, fft = makeFFT(N);
  var win = new Float64Array(N), i, k;
  for (i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
  var HR = P0.HR, VR = P0.VR, HL = Math.max(HR, P0.HL), R = 2 * HL + 1, J = Math.max(1, Math.ceil((n + N - hop) / hop)), off = N - hop;
  /* the medians are taken on bands: one bin each under 2 kHz, two up to 8 kHz, four above (a third of the work, the
     same masks to the ear); the frames in view keep their band powers side by side (RP), read in order */
  var gid = new Int32Array(K), NG = 0, kA = Math.round(2000 / df), kB = Math.round(8000 / df);
  for (k = 0; k < K; ) { var wdt = k < kA ? 1 : k < kB ? 2 : 4; for (var q0 = 0; q0 < wdt && k < K; q0++, k++) gid[k] = NG; NG++; }
  var gn = new Float32Array(NG); for (k = 0; k < K; k++) gn[gid[k]]++;
  var RP = new Float32Array(R * NG), ring = []; for (i = 0; i < R; i++) ring.push({ j: -1, Mr: new Float32Array(K), Mi: new Float32Array(K), Sr: new Float32Array(K), Si: new Float32Array(K), PM: new Float32Array(K), P: new Float32Array(K), G: RP.subarray(i * NG, (i + 1) * NG) });
  var offs = new Int32Array(R), Hg = new Float32Array(NG), Vg = new Float32Array(NG);
  /* AOG-STEMS-V1 for rap: the low band's long median (±0.5 s): what is sustained there (a held bass, an 808's body) is
     Bass, what is short (a kick) is Drums; the bands a voice lives in, and where its consonants sit */
  var kL = Math.min(K, Math.ceil(P0.LMAX / df) + 1), Hl = new Float32Array(kL), tmpL = new Float64Array(2 * HL + 1);
  var bandV = new Float32Array(K), bandC = new Float32Array(K);
  for (k = 0; k < K; k++) { var fz = k * df;
    bandV[k] = fz < 180 ? 0 : fz < 350 ? (fz - 180) / 170 : fz < 4500 ? 1 : fz < 8000 ? (8000 - fz) / 3500 : 0;
    bandC[k] = fz < 1500 ? 0 : fz < 3000 ? (fz - 1500) / 1500 : fz < 9000 ? 1 : fz < 12000 ? (12000 - fz) / 3000 : 0; }
  var grid = [];   /* the sixteenths, from the beats the listener heard */
  (function () { var bt = (notes.beats || []).filter(isFinite).slice().sort(function (a, b) { return a - b; });
    for (var q = 0; q + 1 < bt.length; q++) { var st = (bt[q + 1] - bt[q]) / 4; if (!(st > 0.03 && st < 0.5)) continue; for (var z = 0; z < 4; z++) grid.push(bt[q] + z * st); }
    if (bt.length) grid.push(bt[bt.length - 1]); })();
  var gi = 0;
  function offGrid(t) { if (grid.length < 8) return 0.5; while (gi + 1 < grid.length && grid[gi + 1] <= t) gi++;
    var dd = Math.min(Math.abs(t - grid[gi]), gi + 1 < grid.length ? Math.abs(grid[gi + 1] - t) : 1); return dd < 0.015 ? 0 : dd > 0.04 ? 1 : (dd - 0.015) / 0.025; }
  var re = new Float64Array(N), im = new Float64Array(N), re2 = new Float64Array(N), im2 = new Float64Array(N);
  var accL = new Float64Array(N), accR = new Float64Array(N), accB = new Float64Array(N), accV = new Float64Array(N);
  var D0 = new Int16Array(n), D1 = nch > 1 ? new Int16Array(n) : null, B = new Int16Array(n), V = new Int16Array(n), X16 = [new Int16Array(n)];
  if (nch > 1) X16.push(new Int16Array(n));
  var xi = 0;   /* the song as 16-bit samples, made a block at a time in run() */
  var Hm = new Float32Array(K), Vm = new Float32Array(K), Tb = new Float32Array(K), Tv = new Float32Array(K), tmp = new Float64Array(Math.max(R, 2 * VR + 1));
  var tuneC = typeof notes.tune === "number" && isFinite(notes.tune) ? notes.tune : 0;
  /* the listener's bass notes are trusted whole (their pitch is found again here); a tune note it was less sure of counts less */
  function prep(list, mel) { return (list || []).filter(function (x) { return x && isFinite(x.t) && isFinite(x.d) && isFinite(x.m) && x.m > 0; })
    .map(function (x) { var c = x.conf == null ? 1 : +x.conf; return { t: +x.t, e: +x.t + Math.max(0.03, +x.d), f: 440 * Math.pow(2, (x.m - 69 + tuneC / 100) / 12),
      w: mel ? Math.max(P0.WMIN, Math.min(1, (c - P0.C0) / P0.C1)) : 1 }; })
    .sort(function (a, b) { return a.t - b.t; }); }
  var BN = prep(notes.bass, false), MN = prep(notes.melody, true), bi = 0, mi = 0, hasB = BN.length > 0;
  var lowW = new Float32Array(K); for (k = 0; k < K; k++) { var fq = k * df; lowW[k] = 1 / (1 + Math.pow(fq / P0.BLOW, 6)); }
  var ja = 0, jf = 0, G = 1 / (1.5 * N), stereo = nch > 1;
  function q16(v) { v = Math.round(v * 32767); return v > 32767 ? 32767 : v < -32768 ? -32768 : v; }
  function analyze(j) {
    var s = j * hop - off, sl = ring[j % R], idx, l, r;
    for (i = 0; i < N; i++) { idx = s + i;
      if (idx >= 0 && idx < n) { l = X0[idx]; r = X1 ? X1[idx] : l; re[i] = win[i] * 0.5 * (l + r); im[i] = win[i] * 0.5 * (l - r); }
      else { re[i] = 0; im[i] = 0; } }
    fft(re, im, false);
    for (k = 0; k < K; k++) { var nk = k === 0 ? 0 : N - k, zr = re[k], zi = im[k], yr = re[nk], yi = im[nk];
      var mr = 0.5 * (zr + yr), mm = 0.5 * (zi - yi), sr2 = 0.5 * (zi + yi), si = -0.5 * (zr - yr);
      sl.Mr[k] = mr; sl.Mi[k] = mm; sl.Sr[k] = sr2; sl.Si[k] = si;
      var pm = mr * mr + mm * mm; sl.PM[k] = pm; sl.P[k] = pm + sr2 * sr2 + si * si; }
    var Gp = sl.G; Gp.fill(0); for (k = 0; k < K; k++) Gp[gid[k]] += sl.P[k];
    for (k = 0; k < NG; k++) Gp[k] /= gn[k];
    sl.j = j;
  }
  /* the strongest pitch near f (±60 cents; ±250 for the bass, so an 808's glide is followed), by the sum of its first harmonics */
  function refine(f, PM, fmax, wide) {
    var best = f, bs = -1, span = wide ? 250 : 60, stp = wide ? 12.5 : 10;
    for (var c = -span; c <= span; c += stp) { var g = f * Math.pow(2, c / 1200), s = 0;
      for (var h = 1; h <= 8; h++) { var b = h * g / df; if (h * g > fmax || b >= K - 1) break; var b0 = Math.floor(b), fr = b - b0; s += Math.sqrt(PM[b0] * (1 - fr) + PM[b0 + 1] * fr) / Math.sqrt(h); }
      if (s > bs) { bs = s; best = g; } }
    return best;
  }
  function comb(T, f, w, fmax, rel, fade) {
    for (var h = 1; ; h++) { var fh = h * f; if (fh > fmax) break;
      var sg = Math.max(0.9 * df, rel * fh), a = Math.max(0, Math.floor((fh - 3 * sg) / df)), b = Math.min(K - 1, Math.ceil((fh + 3 * sg) / df));
      var wt = w * (fade && fh > fade ? Math.max(0, 1 - (fh - fade) / (fmax - fade)) : 1);
      for (var kk = a; kk <= b; kk++) { var d = kk * df - fh, v = wt * Math.exp(-d * d / (2 * sg * sg)); if (v > T[kk]) T[kk] = v; } }
  }
  function finalize(j) {
    var sl = ring[j % R], s = j * hop - off, t = (s + N / 2) / sr, a = Math.max(0, j - HR), b = Math.min(J - 1, j + HR), m = b - a + 1, jj, kk;
    var PM = sl.PM, P = sl.P;
    /* the medians along time and along frequency */
    for (jj = 0; jj < m; jj++) offs[jj] = ((a + jj) % R) * NG;
    var mh = m >> 1, Gp = sl.G;
    for (k = 0; k < NG; k++) { for (jj = 0; jj < m; jj++) tmp[jj] = RP[offs[jj] + k]; Hg[k] = selectK(tmp, m, mh); }
    for (k = 0; k < NG; k++) { var lo = Math.max(0, k - VR), hi = Math.min(NG - 1, k + VR), mm = hi - lo + 1; for (kk = 0; kk < mm; kk++) tmp[kk] = Gp[lo + kk]; Vg[k] = selectK(tmp, mm, mm >> 1); }
    for (k = 0; k < K; k++) { Hm[k] = Hg[gid[k]]; Vm[k] = Vg[gid[k]]; }
    var a2 = Math.max(0, j - HL), b2 = Math.min(J - 1, j + HL), m2 = b2 - a2 + 1;
    for (k = 0; k < kL; k++) { for (jj = 0; jj < m2; jj++) tmpL[jj] = ring[(a2 + jj) % R].P[k]; Hl[k] = selectK(tmpL, m2, m2 >> 1); }
    var og = offGrid(t), cgw = P0.CG + (1 - P0.CG) * og;
    /* the notes sounding now: their harmonics */
    Tb.fill(0); Tv.fill(0);
    while (bi < BN.length && BN[bi].e < t - 0.05) bi++;
    while (mi < MN.length && MN[mi].e < t - 0.05) mi++;
    for (jj = bi; jj < BN.length && BN[jj].t <= t + 0.03; jj++) if (BN[jj].e >= t - 0.03) comb(Tb, refine(BN[jj].f, PM, P0.BMAX, true), BN[jj].w, P0.BMAX, P0.SIG_B, 800);
    for (jj = mi; jj < MN.length && MN[jj].t <= t + 0.03; jj++) if (MN[jj].e >= t - 0.03) comb(Tv, refine(MN[jj].f, PM, P0.VMAX), MN[jj].w, P0.VMAX, P0.SIG_V, 0);
    /* the masks, added to one, on the middle; the sides keep only their drums */
    var beta = P0.BETA;
    for (k = 0; k < K; k++) {
      var pm = PM[k], p = P[k] + 1e-20, h = Hm[k], v = Vm[k];
      var wp0 = beta === 1 ? v / (h + v + 1e-20) : Math.pow(v, beta) / (Math.pow(h, beta) + Math.pow(v, beta) + 1e-30);
      /* a voice that is spoken more than sung (rap): what neither median explains (it moves: neither a held line nor a
         hit), strictly in the middle, in the voice's band; its consonants: short noise in the middle, off the drums' grid */
      var er = 1 - (h + v) / p; if (er < 0) er = 0;
      var c1 = stereo ? pm / (pm + P0.KV * (p - pm) + 1e-20) : 1, c4 = c1 * c1; c4 *= c4;
      var fu = P0.WU * er * c4 * bandV[k], fcn = P0.WC * wp0 * (1 - er) * c4 * bandC[k] * cgw;
      var rest = 1 - fu - fcn; if (rest < 0) { var sc0 = 1 / (fu + fcn); fu *= sc0; fcn *= sc0; rest = 0; }
      var wp = wp0 * rest, hp = (1 - wp0) * rest * pm, fl = v * pm / p * rest;
      var cc = stereo ? pm / (pm + P0.KAPPA * (p - pm) + 1e-20) : 1;
      /* the low band that no bass note explains: what is sustained is Bass (an 808's body), what is short is Drums (a kick) */
      var tb = Tb[k], tv = Tv[k] * cc, el = k < kL ? hp * lowW[k] * (1 - tb) : 0, sus = k < kL ? Math.min(1, Hl[k] / p) : 0;
      var eb = tb * Math.max(0, hp - P0.FLOOR_B * fl), ev = tv * Math.max(0, hp - P0.FLOOR_V * fl);
      if (eb + ev + el > hp) { var sc = hp / (eb + ev + el); eb *= sc; ev *= sc; el *= sc; }
      var md = wp + (pm > 0 ? el * (1 - sus) / (pm + 1e-20) : 0), mb = pm > 0 ? (eb + el * sus) / (pm + 1e-20) : 0, mv = (pm > 0 ? ev / (pm + 1e-20) : 0) + fu + fcn;
      var Mr = sl.Mr[k], Mi = sl.Mi[k], Sr = sl.Sr[k], Si = sl.Si[k];
      /* drums: middle + i·sides; bass + i·voice */
      var dr = md * Mr, di = md * Mi, er2 = wp0 * Sr, ei = wp0 * Si, br = mb * Mr, bim = mb * Mi, vr = mv * Mr, vi = mv * Mi;
      re[k] = dr - ei; im[k] = di + er2; re2[k] = br - vi; im2[k] = bim + vr;
      if (k > 0 && k < N / 2) { var nk = N - k; re[nk] = dr + ei; im[nk] = er2 - di; re2[nk] = br + vi; im2[nk] = vr - bim; }
    }
    fft(re, im, true); fft(re2, im2, true);
    for (i = 0; i < N; i++) { var q = (s + i + N * 4) % N, w = win[i] * G, dm = re[i] * w, ds = im[i] * w;
      accL[q] += dm + ds; accR[q] += dm - ds; accB[q] += re2[i] * w; accV[q] += im2[i] * w; }
    /* the first hop of this frame is finished: into the parts */
    for (i = 0; i < hop; i++) { var ix = s + i, q2 = (ix + N * 4) % N;
      if (ix >= 0 && ix < n) { D0[ix] = q16(accL[q2]); if (D1) D1[ix] = q16(accR[q2]); B[ix] = q16(accB[q2]); V[ix] = q16(accV[q2]); }
      accL[q2] = 0; accR[q2] = 0; accB[q2] = 0; accV[q2] = 0; }
  }
  function run(ms) {
    var until = Date.now() + ms, c = 0;
    while (xi < n) { var x1 = Math.min(n, xi + 65536); for (; xi < x1; xi++) { X16[0][xi] = q16(X0[xi]); if (X1) X16[1][xi] = q16(X1[xi]); } if (Date.now() > until) return false; }
    while (jf < J) {
      if (ja < J && ja <= jf + HL) analyze(ja++); else finalize(jf++);
      if ((++c & 7) === 0 && Date.now() > until) return false;
    }
    return true;
  }
  return { run: run, progress: function () { return jf / J; },
    out: function () { return { sr: sr, len: n, nch: nch, x: X16, d: D1 ? [D0, D1] : [D0], b: B, v: V }; } };
}

/* ══ in the Worker: one split, then the parts back (moved, not copied) ══ */
/* the song as AOGLearn hears it: one channel at 22050 Hz (a windowed-sinc low-pass, then every r-th sample) */
function mono22k(X, n, sr) {
  var SR = 22050, r = sr / SR, m = Math.max(1, Math.floor(n / r)), out = new Float32Array(m), A = X[0], B = X[1] || X[0], T = 12;
  var fc = Math.min(1, 1 / r) * 0.92, j, k, PH = 64, W2 = 2 * T + 1, tab = new Float64Array(PH * W2);
  if (r <= 1.0001) { for (j = 0; j < m; j++) out[j] = 0.5 * (A[j] + B[j]); return out; }
  for (var ph = 0; ph < PH; ph++) { var fr0 = ph / PH, ws = 0;   /* 64 phases of the filter, each summing to one */
    for (k = -T; k <= T; k++) { var x = k - fr0, wv = (Math.abs(x) < 1e-9 ? fc : Math.sin(Math.PI * fc * x) / (Math.PI * x)) * (0.5 + 0.5 * Math.cos(Math.PI * x / (T + 1))); tab[ph * W2 + k + T] = wv; ws += wv; }
    for (k = 0; k < W2; k++) tab[ph * W2 + k] /= ws; }
  for (j = 0; j < m; j++) {
    var c = j * r, i0 = Math.floor(c), o = Math.min(PH - 1, Math.round((c - i0) * PH)) * W2, sum = 0;
    if (i0 - T >= 0 && i0 + T < n) for (k = 0; k < W2; k++) { var ix = i0 - T + k; sum += tab[o + k] * (A[ix] + B[ix]); }
    else for (k = 0; k < W2; k++) { var iy = i0 - T + k; if (iy >= 0 && iy < n) sum += tab[o + k] * (A[iy] + B[iy]); }
    out[j] = 0.5 * sum;
  }
  return out;
}
if (IS_WORKER) {
  var post = function (m, tr) { self.postMessage(m, tr || []); };
  self.onmessage = function (e) {
    var d = e.data || {}; if (d.type !== "split") return;
    var t0 = Date.now(), timing = {};
    var listen = function () {
      if (!d.listen) return Promise.resolve(d.notes || {});
      /* the beat, the bass line and the tune, heard here too (aog-learn.js, as its own worker does), so Stop ends it all */
      try { if (!self.AOGLearn) importScripts(d.listen); } catch (er) { return Promise.resolve({}); }
      if (!self.AOGLearn || !self.AOGLearn._analyzePCM) return Promise.resolve({});
      post({ type: "progress", key: "listen", p: 0 });
      return self.AOGLearn._analyzePCM(mono22k(d.X, d.n, d.sr), { onProgress: function (p) { post({ type: "progress", key: "listen", p: +p || 0 }); } })
        .then(function (L) { return { bass: L.bass || [], melody: L.melody || [], tune: typeof L.tuning === "number" ? L.tuning : 0, beats: L.beats || [] }; }, function () { return {}; });
    };
    listen().then(function (notes) {
      timing.listen = Date.now() - t0;
      var job = stemsJob(d.X, d.n, d.sr, notes, d.tune || null), last = -1, t1 = Date.now();
      while (!job.run(150)) { var p = Math.round(job.progress() * 100); if (p !== last) { last = p; post({ type: "progress", key: "split", p: job.progress() }); } }
      timing.split = Date.now() - t1;
      var o = job.out(), tr = [];
      o.x.concat(o.d, [o.b, o.v]).forEach(function (a) { tr.push(a.buffer); });
      o.timing = timing; o.notes = { bass: (notes.bass || []).length, melody: (notes.melody || []).length };
      post({ type: "done", pack: o }, tr);
    }).catch(function (err) { post({ type: "error", message: String((err && err.message) || err), memory: /memory|allocation|Array buffer/i.test(String(err && err.message)) }); });
  };
  self.postMessage({ type: "ready" });
  return;
}

/* ══ on the page ══ */
var scriptURL = (function () { try { var s = G.document && G.document.currentScript; return s && s.src ? s.src : ""; } catch (e) { return ""; } })();
var TEST = { noWorker: false, tune: null, last: null };
function word(key, lang) { var w = WORDS[lang === "es" ? "es" : "en"]; return w[key] || WORDS.en[key] || ""; }
function abortErr() { var e = new Error("stopped"); e.name = "AbortError"; return e; }
function OAC() { return G.OfflineAudioContext || G.webkitOfflineAudioContext; }
function readBlob(b) { return b.arrayBuffer ? b.arrayBuffer() : new Response(b).arrayBuffer(); }
/* a song file is opened at 44.1 kHz (the same samples every time on this device, so a kept split fits it again) */
function decode(input) {
  if (input && typeof input.getChannelData === "function" && input.sampleRate > 0) return Promise.resolve(input);
  var get = (G.Blob && input instanceof G.Blob) ? readBlob(input) : Promise.resolve(input instanceof ArrayBuffer ? input : (input && input.buffer instanceof ArrayBuffer ? input.buffer : null));
  return get.then(function (ab) {
    if (!ab) throw new Error("no song");
    var C = OAC(); if (!C) throw new Error("no audio decoder");
    var ctx = new C(2, 1, SR0);
    return new Promise(function (ok, no) { var done = false;
      var p = ctx.decodeAudioData(ab.slice(0), function (b) { if (!done) { done = true; ok(b); } }, function (er) { if (!done) { done = true; no(er || new Error("decode")); } });
      if (p && p.then) p.then(function (b) { if (!done) { done = true; ok(b); } }, function (er) { if (!done) { done = true; no(er || new Error("decode")); } }); });
  });
}
function chans(buf) {
  var n = buf.length, c = buf.numberOfChannels;
  if (c <= 2) { var out = [buf.getChannelData(0).slice()]; if (c === 2) out.push(buf.getChannelData(1).slice()); return out; }
  /* more than two: the front left and right */
  return [buf.getChannelData(0).slice(), buf.getChannelData(1).slice()].map(function (a) { return a.subarray(0, n); });
}
var learnP = null;
function learner() {
  if (G.AOGLearn) return Promise.resolve(G.AOGLearn);
  if (learnP) return learnP;
  learnP = new Promise(function (ok, no) {
    var s = G.document.createElement("script"); s.src = "/aog-learn.js"; s.async = true;
    s.onload = function () { if (G.AOGLearn) ok(G.AOGLearn); else { learnP = null; no(new Error("no listener")); } };
    s.onerror = function () { learnP = null; no(new Error("no listener")); };
    G.document.head.appendChild(s);
  });
  return learnP;
}
function notesOf(L) { return L ? { bass: L.bass || [], melody: L.melody || [], beats: L.beats || [], tune: typeof L.tuning === "number" ? L.tuning : 0 } : { bass: [], melody: [], beats: [], tune: 0 }; }

function runWorker(X, n, sr, notes, say, signal, listenURL) {
  return new Promise(function (ok, no) {
    var w; try { if (!scriptURL || typeof Worker === "undefined") throw new Error("no worker"); w = new Worker(scriptURL); } catch (e) { no(Object.assign(new Error("no worker"), { noWorker: true })); return; }
    var started = false, fin = false;
    var end = function (f, v) { if (fin) return; fin = true; try { w.terminate(); } catch (e) {} if (signal) signal.removeEventListener("abort", onAbort); f(v); };
    var onAbort = function () { end(no, abortErr()); };
    if (signal) { if (signal.aborted) { onAbort(); return; } signal.addEventListener("abort", onAbort); }
    var timer = setTimeout(function () { if (!started) end(no, Object.assign(new Error("no worker"), { noWorker: true })); }, 8000);
    w.onmessage = function (e) { var d = e.data || {};
      if (d.type === "ready" && !started) { started = true; clearTimeout(timer);
        try { w.postMessage({ type: "split", X: X, n: n, sr: sr, notes: notes, tune: TEST.tune, listen: listenURL || "" }, X.map(function (a) { return a.buffer; })); }
        catch (er) { end(no, Object.assign(new Error("no worker"), { noWorker: true })); } }
      else if (d.type === "progress") say(d.p, d.key);
      else if (d.type === "done") end(ok, d.pack);
      else if (d.type === "error") { var er2 = new Error(d.message); er2.memory = !!d.memory; end(no, er2); } };
    w.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); clearTimeout(timer);
      end(no, started ? Object.assign(new Error("worker failed"), { memory: true }) : Object.assign(new Error("no worker"), { noWorker: true })); };
  });
}
/* where no Worker can start: the same job here, 12 ms at a time */
function runSlices(X, n, sr, notes, say, signal) {
  var job;
  try { job = stemsJob(X, n, sr, notes, TEST.tune); } catch (e) { return Promise.reject(Object.assign(new Error("memory"), { memory: true })); }
  return new Promise(function (ok, no) {
    (function step() {
      if (signal && signal.aborted) { no(abortErr()); return; }
      var done; try { done = job.run(12); } catch (e) { no(e); return; }
      say(job.progress(), "split");
      if (done) { var o = job.out(); o.slices = true; ok(o); } else setTimeout(step, 0);
    })();
  });
}

function split(input, opts) {
  opts = opts || {};
  var signal = opts.signal || null, last = -1;
  var say = function (p, key) { var r = Math.round(p * 100); if (r === last && key === "split") return; last = r; if (opts.onProgress) try { opts.onProgress(Math.max(0, Math.min(1, p)), key); } catch (e) {} };
  var chk = function (v) { if (signal && signal.aborted) throw abortErr(); return v; };
  say(0, "open");
  var t0 = Date.now(), timing = {};
  return decode(input).then(chk).then(function (buf) {
    if (buf.duration > MAX_SEC) throw Object.assign(new Error("too long"), { memory: true });
    timing.decode = Date.now() - t0;
    /* the usual way: one Worker listens (the beat, the bass line, the tune) and then splits */
    var lu = learnURL(), base0 = opts.lesson ? 0.02 : 0.25;
    if (!opts.lesson && opts.listen !== false && lu && !TEST.noWorker) {
      var sayW = function (p, key) { if (signal && signal.aborted) return; if (key === "listen") say(0.02 + 0.23 * Math.max(0, Math.min(1, p)), "listen"); else say(base0 + (1 - base0) * p * 0.98, "split"); };
      return runWorker(chans(buf), buf.length, buf.sampleRate, {}, sayW, signal, lu).then(function (pack) {
        timing.listen = pack.timing ? pack.timing.listen : 0; timing.split = pack.timing ? pack.timing.split : 0;
        TEST.last = { timing: timing, how: "worker", notes: pack.notes || {} };
        pack.quality = "listen"; say(1, "done"); return fromPack(pack);
      }, function (e) { if (e && e.noWorker) return mainWay(buf); throw e; });
    }
    return mainWay(buf);
  });
  function mainWay(buf) {
    var lp = opts.lesson ? Promise.resolve(opts.lesson) : (opts.listen === false ? Promise.resolve(null) : learner().then(function (A) {
      say(0.02, "listen");
      return A.analyze(buf, { onProgress: function (p) { if (!(signal && signal.aborted)) say(0.02 + 0.23 * Math.max(0, Math.min(1, +p || 0)), "listen"); } });
    }).catch(function (e) { if (e && e.name === "AbortError") throw e; return null; }));
    return lp.then(chk).then(function (L) {
      timing.listen = Date.now() - t0 - timing.decode;
      var base = opts.lesson ? 0.02 : 0.25, X = chans(buf), n = buf.length, sr = buf.sampleRate, notes = notesOf(L);
      say(base, "split");
      var sayS = function (p) { if (!(signal && signal.aborted)) say(base + (1 - base) * p * 0.98, "split"); };
      var t1 = Date.now();
      var run = TEST.noWorker ? runSlices(X, n, sr, notes, sayS, signal) : runWorker(X, n, sr, notes, sayS, signal).catch(function (e) {
        if (e && e.noWorker) { X = chans(buf); return runSlices(X, n, sr, notes, sayS, signal); } throw e; });
      return run.then(function (pack) {
        timing.split = Date.now() - t1; TEST.last = { timing: timing, how: TEST.noWorker || pack.slices ? "slices" : "worker", notes: { bass: notes.bass.length, melody: notes.melody.length } };
        pack.quality = "listen"; say(1, "done");
        return fromPack(pack);
      });
    });
  }
}
/* aog-learn.js beside this file (for the Worker to load) */
function learnURL() { if (!scriptURL) return ""; try { return new URL("aog-learn.js", scriptURL).href; } catch (e) { return ""; } }

/* ── the parts, read from the kept 16-bit samples ── */
var S = 1 / 32767;
function partArr(pack, which, ch) {
  if (which === "drums") return pack.d[Math.min(ch, pack.d.length - 1)];
  if (which === "bass") return pack.b;
  if (which === "voice") return pack.v;
  return null;
}
function partObj(pack, which) {
  var cache = [], nch = pack.nch;
  return { numberOfChannels: nch, length: pack.len, sampleRate: pack.sr, duration: pack.len / pack.sr, name: which,
    getChannelData: function (ch) {
      ch = Math.max(0, Math.min(nch - 1, ch | 0)); if (cache[ch]) return cache[ch];
      var n = pack.len, out = new Float32Array(n), a = partArr(pack, which, ch), i;
      if (a) for (i = 0; i < n; i++) out[i] = a[i] * S;
      else { var x = pack.x[Math.min(ch, pack.x.length - 1)], d = pack.d[Math.min(ch, pack.d.length - 1)], b = pack.b, v = pack.v;
        for (i = 0; i < n; i++) out[i] = (x[i] - d[i] - b[i] - v[i]) * S; }
      cache[ch] = out; return out; },
    free: function () { cache = []; } };
}
function fromPack(pack) {
  var o = { sr: pack.sr, sampleRate: pack.sr, length: pack.len, numberOfChannels: pack.nch, quality: pack.quality || "listen", pack: pack };
  PARTS.forEach(function (k) { o[k] = partObj(pack, k); });
  o.free = function () { PARTS.forEach(function (k) { o[k].free(); }); };
  return o;
}
/* the song with each part at its own level, written into out (one Float32Array per channel), in slices */
function mixInto(parts, g, out, signal) {
  var P = parts.pack || parts, n = P.len, gd = lv(g.drums), gb = lv(g.bass), gv = lv(g.voice), go = lv(g.other), i0 = 0;
  function lv(x) { x = +x; return isFinite(x) ? Math.max(0, Math.min(2, x)) : 1; }
  var cd = (gd - go) * S, cb = (gb - go) * S, cv = (gv - go) * S, cx = go * S;
  return new Promise(function (ok, no) {
    (function step() {
      if (signal && signal.aborted) { no(abortErr()); return; }
      var until = Date.now() + 10;
      while (i0 < n) {
        var i1 = Math.min(n, i0 + 65536);
        for (var ch = 0; ch < out.length; ch++) {
          var y = out[ch], x = P.x[Math.min(ch, P.x.length - 1)], d = P.d[Math.min(ch, P.d.length - 1)], b = P.b, v = P.v;
          for (var i = i0; i < i1; i++) y[i] = cx * x[i] + cd * d[i] + cb * b[i] + cv * v[i];
        }
        i0 = i1;
        if (Date.now() > until) { setTimeout(step, 0); return; }
      }
      ok(out);
    })();
  });
}
/* a part as a 16-bit stereo .wav (the desk's tracks), straight from the kept samples */
function wav(part) {
  var n = part.length, sr = part.sampleRate, ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab), i;
  var str = function (o, s) { for (var j = 0; j < s.length; j++) v.setUint8(o + j, s.charCodeAt(j)); };
  str(0, "RIFF"); v.setUint32(4, 36 + n * 4, true); str(8, "WAVE"); str(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); str(36, "data"); v.setUint32(40, n * 4, true);
  var a = new Int16Array(ab, 44, n * 2);
  var L = part.getChannelData(0), R = part.numberOfChannels > 1 ? part.getChannelData(1) : L;
  for (i = 0; i < n; i++) { var l = Math.round(L[i] * 32767), r = Math.round(R[i] * 32767);
    a[2 * i] = l > 32767 ? 32767 : l < -32768 ? -32768 : l; a[2 * i + 1] = r > 32767 ? 32767 : r < -32768 ? -32768 : r; }
  part.free();
  return new Blob([ab], { type: "audio/wav" });
}

/* ── kept on the device (IndexedDB "aog-stems": "meta" small, "data" the samples). The song itself is not kept here:
   the rest is worked out again from the song (opened at 44.1 kHz, the same samples every time). Six songs at most. ── */
var DBN = "aog-stems", MAXK = 6;
function db() {
  return new Promise(function (ok, no) {
    if (!G.indexedDB) { no(new Error("no indexedDB")); return; }
    var r; try { r = indexedDB.open(DBN, 1); } catch (e) { no(e); return; }
    r.onupgradeneeded = function () { var d = r.result; if (!d.objectStoreNames.contains("meta")) d.createObjectStore("meta", { keyPath: "id" }); if (!d.objectStoreNames.contains("data")) d.createObjectStore("data", { keyPath: "id" }); };
    r.onsuccess = function () { ok(r.result); }; r.onerror = function () { no(r.error); }; r.onblocked = function () { no(new Error("blocked")); };
  });
}
function tx(stores, mode, fn) {
  return db().then(function (d) { return new Promise(function (ok, no) {
    var t; try { t = d.transaction(stores, mode); } catch (e) { d.close(); no(e); return; }
    var res = fn(t), out = null; if (res && "onsuccess" in res) res.onsuccess = function () { out = res.result; };
    t.oncomplete = function () { d.close(); ok(out); }; t.onerror = t.onabort = function () { d.close(); no(t.error || new Error("idb")); };
  }); });
}
function has(id) { return tx(["meta"], "readonly", function (t) { return t.objectStore("meta").get(id); }).catch(function () { return null; }); }
function keep(id, parts) {
  var P = parts.pack || parts, meta = { id: id, at: Date.now(), sr: P.sr, len: P.len, nch: P.nch, quality: P.quality || "listen" };
  return tx(["meta", "data"], "readwrite", function (t) { t.objectStore("meta").put(meta); t.objectStore("data").put({ id: id, d: P.d, b: P.b, v: P.v }); return null; })
    .then(function () { return tx(["meta"], "readonly", function (t) { return t.objectStore("meta").getAll(); }); })
    .then(function (all) { var old = (all || []).sort(function (a, b) { return (b.at || 0) - (a.at || 0); }).slice(MAXK);
      if (old.length) return tx(["meta", "data"], "readwrite", function (t) { old.forEach(function (m) { t.objectStore("meta").delete(m.id); t.objectStore("data").delete(m.id); }); return null; }); })
    .then(function () { return meta; });
}
function drop(id) { return tx(["meta", "data"], "readwrite", function (t) { t.objectStore("meta").delete(id); t.objectStore("data").delete(id); return null; }).catch(function () {}); }
function toX16(buf) {
  var c = Math.min(2, buf.numberOfChannels), n = buf.length, src = [], out = [], i = 0, ch;
  for (ch = 0; ch < c; ch++) { src.push(buf.getChannelData(ch)); out.push(new Int16Array(n)); }
  return new Promise(function (ok) { (function step() { var until = Date.now() + 10;
    while (i < n) { var i1 = Math.min(n, i + 65536); for (ch = 0; ch < c; ch++) { var a = src[ch], o = out[ch];
        for (var k = i; k < i1; k++) { var v = Math.round(a[k] * 32767); o[k] = v > 32767 ? 32767 : v < -32768 ? -32768 : v; } }
      i = i1; if (Date.now() > until) { setTimeout(step, 0); return; } }
    ok(out); })(); });
}
/* a kept split, with the song it came from (the same file, or its AudioBuffer at the same rate) */
function kept(id, input) {
  return has(id).then(function (m) {
    if (!m) return null;
    return Promise.all([tx(["data"], "readonly", function (t) { return t.objectStore("data").get(id); }), decode(input)]).then(function (r) {
      var d = r[0], buf = r[1];
      if (!d || !buf || buf.sampleRate !== m.sr || buf.length !== m.len || Math.min(2, buf.numberOfChannels) !== m.nch) return null;
      tx(["meta"], "readwrite", function (t) { m.at = Date.now(); t.objectStore("meta").put(m); return null; }).catch(function () {});
      return toX16(buf).then(function (x) { return fromPack({ sr: m.sr, len: m.len, nch: m.nch, quality: m.quality, x: x, d: d.d, b: d.b, v: d.v }); });
    });
  }).catch(function () { return null; });
}

/* only the three parts (for a player that already has the song itself, as the Turntables do), if they fit it */
function keptParts(id, want) {
  return has(id).then(function (m) {
    if (!m || (want && ((want.sr && m.sr !== want.sr) || (want.len && m.len !== want.len)))) return null;
    return tx(["data"], "readonly", function (t) { return t.objectStore("data").get(id); }).then(function (d) {
      if (!d || !d.d || !d.b || !d.v) return null;
      tx(["meta"], "readwrite", function (t) { m.at = Date.now(); t.objectStore("meta").put(m); return null; }).catch(function () {});
      return { sr: m.sr, len: m.len, nch: m.nch, quality: m.quality, d: d.d, b: d.b, v: d.v };
    });
  }).catch(function () { return null; });
}

var API = {
  version: 1, words: WORDS, names: NAMES, parts: PARTS.slice(), word: word,
  split: split, mixInto: mixInto, wav: wav, keep: keep, kept: kept, keptParts: keptParts, has: has, drop: drop,
  /* for the tests: the job itself (to measure on known parts), the settings, the last split's timing */
  test: { job: stemsJob, tune: function (t) { TEST.tune = t || null; }, defaults: TUNE, noWorker: function (b) { TEST.noWorker = !!b; }, last: function () { return TEST.last; }, fromPack: fromPack }
};
G.AOGStems = API;
})(typeof self !== "undefined" ? self : this);
