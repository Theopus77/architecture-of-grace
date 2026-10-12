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
     .clean(input, {quick, kind, signal, onProgress, noX}) → Promise<Parts quality:"model", model:"scnet">: Best quality,
         a trained model on the device, after the quick split (AOG-STEMS-AI-V1, below); .rekind(modelParts, quickParts)
     .quality() → "quick"|"best" · .setQuality(q) · .canBest()   (Split quality, kept on this device)

   Since then (AOG-STEMS-AI-V1, the same day): SCNet does run here, at Best quality (below); this listening split is
   the Quick one, and it still comes first. The first notes, kept for the record:
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
        memory: "This song is too long to split on this device. Try a shorter song.",
        noVoice: "No voice found in this piece.", guitars: "Loud guitars can leave a little of the voice in The rest.",
        hard: "This music is hard to split. Much of it stays in The rest.", classical: "No drum kit here. Drums keeps only real hits, like timpani.",
        backing: "Some ad-libs and backing voices may stay in The rest.", kindLab: "Kind of music", again: "Split again",
        clean: "Making the parts cleaner… %n%", cleanDone: "The parts are cleaner now.", cleanKept: "This device kept the quick split.",
        cleanStopped: "Stopped. The quick parts stay.", cleanGo: "Make the parts cleaner", qLab: "Split quality", qQuick: "Quick", qBest: "Best (slower)",
        growl: "A screamed or growled voice can stay in The rest.", unusual: "Unusual sounds can land in another part." },
  es: { open: "Abriendo la canción…", listen: "Escuchando la canción…", split: "Separando la canción…", done: "La canción está en cuatro partes.",
        stopped: "Detenido. La canción quedó como estaba.", failed: "La canción no se separó. Prueba una canción más corta, o cierra otras apps e inténtalo otra vez.",
        memory: "Esta canción es muy larga para separarla en este aparato. Prueba una canción más corta.",
        noVoice: "No se encontró voz en esta pieza.", guitars: "Las guitarras fuertes pueden dejar un poco de la voz en El resto.",
        hard: "Esta música es difícil de separar. Mucho se queda en El resto.", classical: "Aquí no hay batería. Batería guarda solo golpes, como los timbales.",
        backing: "Algunas voces de fondo pueden quedarse en El resto.", kindLab: "Tipo de música", again: "Separar otra vez",
        clean: "Limpiando las partes… %n %", cleanDone: "Las partes ya están más limpias.", cleanKept: "Este aparato se quedó con la separación rápida.",
        cleanStopped: "Detenido. Se quedan las partes rápidas.", cleanGo: "Limpiar las partes", qLab: "Calidad", qQuick: "Rápida", qBest: "La mejor (más lenta)",
        growl: "Una voz gritada o gutural puede quedarse en El resto.", unusual: "Los sonidos poco comunes pueden caer en otra parte." }
};
var KINDW = { en: { auto: "Auto", pop: "Pop", hiphop: "Hip hop and rap", rock: "Rock and metal", classical: "Classical", experimental: "Experimental" },
  es: { auto: "Automático", pop: "Pop", hiphop: "Hip hop y rap", rock: "Rock y metal", classical: "Clásica", experimental: "Experimental" } };
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
var TUNE = { HR: 8, VR: 8, HL: 21, LMAX: 260, KV: 10, WU: 1, WC: 0.8, CG: 0.3, BETA: 1, KAPPA: 3, FLOOR_V: 1.0, FLOOR_B: 0.5, SIG_V: 0.02, SIG_B: 0.01, VMAX: 8000, BMAX: 2000, BLOW: 130, WMIN: 0.15, C0: 0.3, C1: 0.4,
  STAT: 0, PD: 0, NZ: 1, KB: 1.5, MODK: 1, VG: 0.5, VMINW: 0.5, GF0: 0.45, GF1: 0.75, VOICEW: 1, GRID: 1, CONS: 1, VIB: 0, OWN: 0, OWNV: 0.3, WN: 0, BT: 0, WNP: 1 };
/* the kinds of music (Jimmy plays rap and hip hop, classic rock and metal, pop, classical and experimental music):
   what each changes. Auto picks one from the song itself (kindOf, below); a learner can choose another. */
var KINDS = ["auto", "pop", "hiphop", "rock", "classical", "experimental"];
var PROF = {
  pop: {},
  hiphop: { PD: 0.15 },                                   /* drums inside a sampled loop go to Drums only when clearly hits */
  rock: { VG: 1, VMINW: 0.15, OWN: 1, WN: 0.8 },                           /* a lead guitar is not taken for the voice */
  classical: { PD: 0.6, WU: 0.2, WC: 0, VOICEW: 1, VG: 1, VMINW: 0.15, VIB: 1 },   /* a sung note has vibrato; a piano's has none */   /* no kit: only real hits are Drums; piano and strings stay */
  experimental: { PD: 0.35, GRID: 0, WC: 0.3, WU: 0.6, CONS: 0.8 }         /* when unsure, it stays in The rest */
};
function stemsJob(X, n, sr, notes, tune) {
  var kind = PROF[notes.kind] ? notes.kind : "pop";
  var P0 = {}, key0; for (key0 in TUNE) P0[key0] = TUNE[key0]; for (key0 in PROF[kind]) P0[key0] = PROF[kind][key0]; if (tune) for (key0 in tune) P0[key0] = tune[key0];
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
  var kL = Math.min(K, Math.ceil(P0.LMAX / df) + 1), Hl = new Float32Array(kL), modL = new Float32Array(kL), tmpL = new Float64Array(2 * HL + 1);
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
  /* cymbals ringing for seconds: flat, sustained noise high up is Drums (a guitar's dense harmonics stop near 5 kHz) */
  var hiW = new Float32Array(K), kS3 = Math.round(3000 / df), kB3 = Math.round(300 / df); for (k = 0; k < K; k++) { var fh0 = k * df; hiW[k] = fh0 < 3000 ? 0 : fh0 < 5500 ? (fh0 - 3000) / 2500 : 1; }
  var ePart = [0, 0, 0, 0], eVp = 0, eVu = 0, gSum = 0, gN = 0, hfS = 0, hfW = 0, k400 = Math.round(400 / df), k4k = Math.round(4000 / df);
  var kO = Math.min(K - 2, Math.ceil(4200 / df)), Cc = new Float32Array(K), FC = [], HW = [0], prevF = 0, ownH = [];
  for (var fc0 = 100; fc0 <= 900; fc0 *= Math.pow(2, 1 / 48)) FC.push(fc0);
  var NC = FC.length; for (var hw = 1; hw <= 10; hw++) HW.push(1 / Math.sqrt(hw));
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
    var og = P0.GRID ? offGrid(t) : 0.5, cgw = P0.CG + (1 - P0.CG) * og;
    /* a fast double kick: the low band rising and falling many times a second is hits, not a held note */
    var a3 = Math.max(0, j - 3), b3 = Math.min(J - 1, j + 3);
    for (k = 0; k < kL; k++) { var mn = 1e30, mx = 0; for (jj = a3; jj <= b3; jj++) { var pv = ring[jj % R].P[k]; if (pv < mn) mn = pv; if (pv > mx) mx = pv; }
      var md0 = (mx - mn) / (mx + mn + 1e-20); modL[k] = md0 < 0.6 ? 0 : md0 > 0.9 ? P0.MODK : P0.MODK * (md0 - 0.6) / 0.3; }
    /* the notes sounding now: their harmonics */
    Tb.fill(0); Tv.fill(0);
    while (bi < BN.length && BN[bi].e < t - 0.05) bi++;
    while (mi < MN.length && MN[mi].e < t - 0.05) mi++;
    for (jj = bi; jj < BN.length && BN[jj].t <= t + 0.03; jj++) if (BN[jj].e >= t - 0.03) comb(Tb, refine(BN[jj].f, PM, P0.BMAX, true), BN[jj].w, P0.BMAX, P0.SIG_B, 800);
    var gateV = 1;
    for (jj = mi; jj < MN.length && MN[jj].t <= t + 0.03; jj++) if (MN[jj].e >= t - 0.03) { var fv = refine(MN[jj].f, PM, P0.VMAX);
      /* a voice or a lead guitar? a voice's harmonics rise and fall with its vowels; distortion's are flat and dense */
      if (P0.VG > 0) { var la = 0, ln = 0, sa = 0; for (var hh = Math.max(1, Math.ceil(300 / fv)); hh * fv < 4000; hh++) { var bb = hh * fv / df, b0 = Math.floor(bb), fr = bb - b0, am = Math.sqrt(PM[b0] * (1 - fr) + PM[b0 + 1] * fr) + 1e-12; la += Math.log(am); sa += am; ln++; }
        if (ln >= 5) { var fl0 = Math.exp(la / ln) / (sa / ln), gv = fl0 <= P0.GF0 ? 1 : fl0 >= P0.GF1 ? P0.VMINW : 1 - (1 - P0.VMINW) * (fl0 - P0.GF0) / (P0.GF1 - P0.GF0); gv = 1 - P0.VG * (1 - gv); if (gv < gateV) gateV = gv; gSum += fl0; gN++; } }
      if (P0.VIB) { var hs = MN[jj].hs || (MN[jj].hs = []); hs.push(1200 * Math.log(fv / MN[jj].f) / Math.LN2); if (hs.length > 14) hs.shift();
        var gvb = P0.VMINW; if (hs.length >= 5) { var mu = 0, vq = 0, zq; for (zq = 0; zq < hs.length; zq++) mu += hs[zq]; mu /= hs.length; for (zq = 0; zq < hs.length; zq++) vq += (hs[zq] - mu) * (hs[zq] - mu);
          var sdv = Math.sqrt(vq / hs.length); gvb = sdv <= 8 ? P0.VMINW : sdv >= 20 ? 1 : P0.VMINW + (1 - P0.VMINW) * (sdv - 8) / 12; }
        if (gvb < gateV) gateV = gvb; }
      comb(Tv, fv, MN[jj].w, P0.VMAX, P0.SIG_V, 0); }
    /* the voice's own pitch, heard in the middle alone (a stereo song): guitars double-tracked left and right, strings
       across the stage, a wide pad all fall away, and what is left that is pitched and not a hit is most often the voice */
    if (stereo && P0.OWN > 0) {
      for (k = 0; k < kO; k++) { var pmo = PM[k], po = P[k] + 1e-20, ho = Hm[k], vo = Vm[k], c1o = pmo / (pmo + P0.KV * (po - pmo) + 1e-20); c1o *= c1o; Cc[k] = Math.sqrt((ho / (ho + vo + 1e-20)) * pmo * c1o * c1o); }
      var bestF = 0, bestS = 0, tot0 = 0;
      for (k = Math.round(100 / df); k < kO; k++) tot0 += Cc[k];
      for (var cq = 0; cq < NC; cq++) { var f0 = FC[cq], sS = 0, nh = 0;
        for (var hq = 1; hq <= 10 && hq * f0 < 4000; hq++) { var bq = hq * f0 / df, bq0 = Math.floor(bq), frq = bq - bq0; sS += (Cc[bq0] * (1 - frq) + Cc[bq0 + 1] * frq) * HW[hq]; nh++; }
        if (prevF && Math.abs(Math.log(f0 / prevF)) < 0.06) sS *= 1.1;
        if (sS > bestS) { bestS = sS; bestF = f0; } }
      var half = bestF / 2, sH = 0;
      if (half >= 90) { for (var hq2 = 1; hq2 <= 10 && hq2 * half < 4000; hq2++) { var bq2 = hq2 * half / df, b2q = Math.floor(bq2), f2q = bq2 - b2q; sH += (Cc[b2q] * (1 - f2q) + Cc[b2q + 1] * f2q) * HW[hq2]; } if (sH > bestS * 1.25) bestF = half; }
      /* voiced when its harmonics hold a good share of the middle's pitched sound */
      var on = 0; if (bestF) { for (var hq3 = 1; hq3 <= 10 && hq3 * bestF < 4000; hq3++) { var kc = Math.round(hq3 * bestF / df); on += Cc[kc] + (Cc[kc - 1] || 0) + (Cc[kc + 1] || 0); } }
      if (bestF && tot0 > 0 && on / tot0 > P0.OWNV) { var fo = refine(bestF, PM, P0.VMAX), wO = P0.OWN, gO = 1;
        if (P0.VG > 0) { var la2 = 0, ln2 = 0, sa2 = 0; for (var h4 = Math.max(1, Math.ceil(300 / fo)); h4 * fo < 4000; h4++) { var b4 = h4 * fo / df, b40 = Math.floor(b4), f4 = b4 - b40, am2 = Math.sqrt(PM[b40] * (1 - f4) + PM[b40 + 1] * f4) + 1e-12; la2 += Math.log(am2); sa2 += am2; ln2++; }
          if (ln2 >= 5) { var fl2 = Math.exp(la2 / ln2) / (sa2 / ln2), gv2 = fl2 <= P0.GF0 ? 1 : fl2 >= P0.GF1 ? P0.VMINW : 1 - (1 - P0.VMINW) * (fl2 - P0.GF0) / (P0.GF1 - P0.GF0); gO = 1 - P0.VG * (1 - gv2); } }
        if (P0.VIB) { ownH.push(1200 * Math.log(fo) / Math.LN2); if (ownH.length > 14) ownH.shift(); var gvo = P0.VMINW;
          if (ownH.length >= 5) { var mo = 0, vo2 = 0, zo; for (zo = 0; zo < ownH.length; zo++) mo += ownH[zo]; mo /= ownH.length; for (zo = 0; zo < ownH.length; zo++) vo2 += (ownH[zo] - mo) * (ownH[zo] - mo); var sdo = Math.sqrt(vo2 / ownH.length);
            gvo = sdo <= 8 || sdo > 300 ? P0.VMINW : sdo >= 20 ? 1 : P0.VMINW + (1 - P0.VMINW) * (sdo - 8) / 12; }
          gO = Math.min(gO, gvo); }
        comb(Tv, fo, wO * gO, P0.VMAX, P0.SIG_V, 0); prevF = fo; }
      else { prevF = 0; if (P0.VIB) ownH.length = 0; }
    }
    /* the masks, added to one, on the middle; the sides keep only their drums */
    var beta = P0.BETA, hla = 0, hsa = 0;
    for (k = 0; k < K; k++) {
      var pm = PM[k], p = P[k] + 1e-20, h = Hm[k], v = Vm[k];
      var wp0 = beta === 1 ? v / (h + v + 1e-20) : Math.pow(v, beta) / (Math.pow(h, beta) + Math.pow(v, beta) + 1e-30);
      if (P0.PD > 0) wp0 = wp0 <= P0.PD ? 0 : (wp0 - P0.PD) / (1 - P0.PD);
      /* a voice that is spoken more than sung (rap): what neither median explains (it moves: neither a held line nor a
         hit), strictly in the middle, in the voice's band; its consonants: short noise in the middle, off the drums' grid */
      var er = 1 - (h + v) / p; if (er < 0) er = 0;
      var c1 = stereo ? pm / (pm + P0.KV * (p - pm) + 1e-20) : 1, c4 = c1 * c1; c4 *= c4;
      var gn0 = P0.WN && stereo ? P0.WN * c4 * bandV[k] * (1 - (P0.WNP === 2 ? wp0 * wp0 : wp0)) * (v / p <= 0.35 ? 0 : v / p >= 0.75 ? 1 : (v / p - 0.35) / 0.4) : 0;
      var fu = P0.VOICEW * (P0.WU * er + gn0) * c4 * bandV[k] * (P0.VIB ? gateV : 1), fcn = P0.VOICEW * P0.WC * wp0 * (1 - er) * c4 * bandC[k] * cgw;
      var rest = 1 - fu - fcn; if (rest < 0) { var sc0 = 1 / (fu + fcn); fu *= sc0; fcn *= sc0; rest = 0; }
      var gk = Gp[gid[k]] + 1e-20, fz2 = v / gk, fnz = hiW[k] ? P0.NZ * hiW[k] * (fz2 <= 0.55 ? 0 : fz2 >= 0.9 ? 1 : (fz2 - 0.55) / 0.35) * (1 - er) : 0;
      var wq = wp0 > fnz ? wp0 : fnz;
      var wp = wq * rest, hp = (1 - wq) * rest * pm, fl = v * pm / p * rest;
      var cc = stereo ? pm / (pm + P0.KAPPA * (p - pm) + 1e-20) : 1, cb = stereo ? pm / (pm + P0.KB * (p - pm) + 1e-20) : 1;
      /* the low band that no bass note explains: what is sustained is Bass (an 808's body), what is short is Drums (a kick);
         only what is in the middle (guitars double-tracked left and right stay in The rest) */
      var tb = Tb[k] * cb, tv = Tv[k] * cc * gateV, el = k < kL ? hp * lowW[k] * (1 - tb) * cb : 0, sus = k < kL ? Math.min(1, Hl[k] / p) * (1 - modL[k]) : 0;
      var eb = tb * Math.max(0, hp - P0.FLOOR_B * fl), ev = tv * Math.max(0, hp - P0.FLOOR_V * fl);
      /* a short, plucked bass note is a hit to the medians; under 300 Hz its tones are still the bass */
      if (P0.BT && k < kB3 && tb > 0.05 && wp > 0) { var tone0 = tb * wp * pm * (1 - v / p > 0 ? 1 - v / p : 0); if (tone0 > 0) { eb += tone0; wp -= tone0 / (pm + 1e-20); if (wp < 0) wp = 0; } }
      if (eb + ev + el > hp) { var sc = hp / (eb + ev + el); eb *= sc; ev *= sc; el *= sc; }
      var md = wp + (pm > 0 ? el * (1 - sus) / (pm + 1e-20) : 0), mb = pm > 0 ? (eb + el * sus) / (pm + 1e-20) : 0, mv = (pm > 0 ? ev / (pm + 1e-20) : 0) + fu + fcn;
      if (P0.CONS !== 1) { md *= P0.CONS; mb *= P0.CONS; mv *= P0.CONS; }
      /* the sides: their drums are cymbals and hats up high, or clear hits; a chugging guitar out there stays in The rest */
      var ws = k >= kS3 ? wq : wq * (wp0 <= 0.5 ? 0 : wp0 >= 0.8 ? 1 : (wp0 - 0.5) / 0.3);
      if (P0.CONS !== 1) ws *= P0.CONS;
      ePart[0] += md * md * pm + ws * ws * (p - pm); ePart[1] += mb * mb * pm; ePart[2] += mv * mv * pm; ePart[3] += p;
      var vpz = pm > 0 ? ev / pm : 0, vuz = fu + fcn; eVp += vpz * vpz * pm; eVu += vuz * vuz * pm;
      if (P0.STAT && k >= k400 && k < k4k) { var hpp = (1 - wq) * p + 1e-18; hla += Math.log(hpp); hsa += hpp; }
      var Mr = sl.Mr[k], Mi = sl.Mi[k], Sr = sl.Sr[k], Si = sl.Si[k];
      /* drums: middle + i·sides; bass + i·voice */
      var dr = md * Mr, di = md * Mi, er2 = ws * Sr, ei = ws * Si, br = mb * Mr, bim = mb * Mi, vr = mv * Mr, vi = mv * Mi;
      re[k] = dr - ei; im[k] = di + er2; re2[k] = br - vi; im2[k] = bim + vr;
      if (k > 0 && k < N / 2) { var nk = N - k; re[nk] = dr + ei; im[nk] = er2 - di; re2[nk] = br + vi; im2[nk] = vr - bim; }
    }
    if (P0.STAT && hsa > 0) { var nb = k4k - k400, hfl = Math.exp(hla / nb) / (hsa / nb); hfS += hfl * hsa; hfW += hsa; }   /* how flat and dense the held sound is (distortion) */
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
    out: function () { var tot = ePart[3] || 1;
      return { sr: sr, len: n, nch: nch, x: X16, d: D1 ? [D0, D1] : [D0], b: B, v: V, kind: kind,
        stats: { drums: ePart[0] / tot, bass: ePart[1] / tot, voice: ePart[2] / tot, vp: eVp / tot, vu: eVu / tot, flat: gN ? gSum / gN : 0, hflat: hfW ? hfS / hfW : 0, grid: P0.GRID && grid.length >= 8 ? grid.length : 0 } }; } };
}

/* ══ the kind of music, from the song itself: a quick look (a 2048-point STFT every 1024 samples, a sixteenth of the
   split's work) at how much of the top end comes as hits (drums), how dense and flat the middle is (distorted guitars),
   how wide it is, and whether the listener's beats are steady. ══ */
function kindJob(X, n, sr, beats, notes) {
  var N = 2048, hop = 1024, K = N / 2 + 1, df = sr / N, fft = makeFFT(N), re = new Float64Array(N), im = new Float64Array(N), w = new Float64Array(N), i, k;
  for (i = 0; i < N; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
  var A = X[0], B = X[1] || X[0], k5 = Math.round(5000 / df), k12 = Math.min(K - 1, Math.round(12000 / df)), k4 = Math.round(400 / df), k40 = Math.round(4000 / df), k15 = Math.round(150 / df);
  var prev = new Float64Array(K), P = new Float64Array(K), eHi = 0, fHi = 0, side = 0, mid = 0, fr = [], tot = 0, lpv = new Float64Array(K), onset = [];
  var s = 0, f = null, pj = null, res = null;
  function scan(until) {
  for (var c = 0; s + N <= n; s += hop) {
    if ((++c & 31) === 0 && Date.now() > until) return false;
    for (i = 0; i < N; i++) { var l = A[s + i], r = B[s + i]; re[i] = w[i] * 0.5 * (l + r); im[i] = w[i] * 0.5 * (l - r); }
    fft(re, im, false);
    var e = 0, la = 0, sa = 0, cnt = 0, of = 0;
    for (k = 1; k <= k12; k++) { var nk = N - k, zr = re[k], zi = im[k], yr = re[nk], yi = im[nk], mr = 0.5 * (zr + yr), mi = 0.5 * (zi - yi), sr2 = 0.5 * (zi + yi), si = -0.5 * (zr - yr);
      var pm = mr * mr + mi * mi, ps = sr2 * sr2 + si * si; P[k] = pm + ps; e += P[k];
      if (k >= k15 && k <= k40) { mid += pm; side += ps; }
      if (k >= k4 && k <= k40) { la += Math.log(P[k] + 1e-18); sa += P[k]; cnt++; }
      if (k >= k5) { eHi += P[k]; var dlt = P[k] - prev[k]; if (dlt > 0) fHi += dlt; }
      if (k >= k5) { var lg = Math.log(P[k] + 1e-9), dl2 = lg - lpv[k]; if (dl2 > 0) of += dl2; lpv[k] = lg; }
      prev[k] = P[k]; }
    onset.push(of);
    tot += e; fr.push([e, cnt ? Math.exp(la / cnt) / (sa / cnt + 1e-30) : 0]);
  }
  return true;
  }
  function feats() {
  fr.sort(function (a, b) { return b[0] - a[0]; });
  var top = fr.slice(0, Math.max(1, Math.round(fr.length / 2))), flat = 0, wsum = 0;
  top.forEach(function (x) { flat += x[1] * x[0]; wsum += x[0]; }); flat = wsum ? flat / wsum : 0;
  var bt = (beats || []).filter(isFinite).slice().sort(function (a, b) { return a - b; }), ibi = [];
  for (i = 1; i < bt.length; i++) ibi.push(bt[i] - bt[i - 1]);
  var mean = ibi.reduce(function (a, b) { return a + b; }, 0) / (ibi.length || 1), sd = Math.sqrt(ibi.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / (ibi.length || 1));
  /* how clearly the music pulses at its beat: the onsets' own echo one beat (or half a beat) later */
  var pulse = 0;
  if (onset.length > 64) {
    var fps = sr / hop, mo = 0, o2 = onset.slice(), q;
    for (q = 0; q < o2.length; q++) mo += o2[q]; mo /= o2.length;
    for (q = 0; q < o2.length; q++) o2[q] -= mo;
    var b0 = 0; for (q = 0; q < o2.length; q++) b0 += o2[q] * o2[q];
    for (var L = Math.round(0.18 * fps); L <= Math.round(1.2 * fps) && L < o2.length / 2; L++) { var a = 0; for (var z = 0; z + L < o2.length; z++) a += o2[z] * o2[z + L]; if (b0 > 0 && a / b0 > pulse) pulse = a / b0; }
  }
  f = { hits: eHi > 0 ? fHi / eHi : 0, top: tot > 0 ? eHi / tot : 0, flat: flat, width: mid + side > 0 ? side / (mid + side) : 0, steady: ibi.length >= 8 ? sd / mean : 1, pulse: pulse };
  /* a short look at the split itself (up to 24 s, from a quarter of the way in): how much comes out as drums, and
     whether the voice is sung (its notes) or spoken (rap) */
  var a0 = n > 40 * sr ? Math.round(n * 0.25) : 0, m0 = Math.min(n - a0, Math.round(24 * sr)), t0 = a0 / sr, nt = notes || {};
  var sh = function (l) { return (l || []).map(function (x) { return { t: x.t - t0, d: x.d, m: x.m, conf: x.conf }; }); };
  pj = stemsJob(X.map(function (a) { return a.subarray(a0, a0 + m0); }), m0, sr, { bass: sh(nt.bass), melody: sh(nt.melody), beats: (nt.beats || []).map(function (b) { return b - t0; }), tune: nt.tune, kind: "pop" }, { STAT: 1 });
  }
  function decide() {
  var st = pj.out().stats;
  f.drums = st.drums; f.sung = st.vp; f.spoken = st.vu; f.hflat = st.hflat;
  var kind = f.hflat > KT.dist || (f.hflat > KT.dist2 && f.width > KT.wide) ? "rock" : f.drums < KT.kit ? "classical" : f.pulse < KT.pulse ? "experimental" : f.spoken > 2 * f.sung ? "hiphop" : "pop";
  res = { kind: kind, f: f };
  }
  /* run(ms): about that long, then whether it is done (a Worker runs it whole; the page in slices) */
  return { run: function (ms) { var until = Date.now() + ms; if (!f) { if (!scan(until)) return false; feats(); } if (!res) { if (!pj.run(Math.max(1, until - Date.now()))) return false; decide(); } return true; },
    progress: function () { return f ? 0.3 + 0.7 * (pj ? 0 : 0) : 0.3 * s / Math.max(1, n); }, result: function () { return res; } };
}
function kindOf(X, n, sr, beats, notes) { var j = kindJob(X, n, sr, beats, notes); j.run(1e12); return j.result(); }
var KT = { dist: 0.12, dist2: 0.02, wide: 0.2, kit: 0.06, pulse: 0.17 };

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
      var kd = d.kind && PROF[d.kind] ? { kind: d.kind, f: null } : kindOf(d.X, d.n, d.sr, notes.beats, notes);
      notes.kind = kd.kind; if (kd.kind === "experimental" || kd.kind === "classical") notes.beats = [];   /* no steady beat: no drum grid */
      var job = stemsJob(d.X, d.n, d.sr, notes, d.tune || null), last = -1, t1 = Date.now();
      while (!job.run(150)) { var p = Math.round(job.progress() * 100); if (p !== last) { last = p; post({ type: "progress", key: "split", p: job.progress() }); } }
      timing.split = Date.now() - t1;
      var o = job.out(), tr = [];
      o.x.concat(o.d, [o.b, o.v]).forEach(function (a) { tr.push(a.buffer); });
      o.timing = timing; o.notes = { bass: (notes.bass || []).length, melody: (notes.melody || []).length }; o.auto = !(d.kind && PROF[d.kind]); o.feat = kd.f;
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

function runWorker(X, n, sr, notes, say, signal, listenURL, kind) {
  return new Promise(function (ok, no) {
    var w; try { if (!scriptURL || typeof Worker === "undefined") throw new Error("no worker"); w = new Worker(scriptURL); } catch (e) { no(Object.assign(new Error("no worker"), { noWorker: true })); return; }
    var started = false, fin = false;
    var end = function (f, v) { if (fin) return; fin = true; try { w.terminate(); } catch (e) {} if (signal) signal.removeEventListener("abort", onAbort); f(v); };
    var onAbort = function () { end(no, abortErr()); };
    if (signal) { if (signal.aborted) { onAbort(); return; } signal.addEventListener("abort", onAbort); }
    var timer = setTimeout(function () { if (!started) end(no, Object.assign(new Error("no worker"), { noWorker: true })); }, 8000);
    w.onmessage = function (e) { var d = e.data || {};
      if (d.type === "ready" && !started) { started = true; clearTimeout(timer);
        try { w.postMessage({ type: "split", X: X, n: n, sr: sr, notes: notes, tune: TEST.tune, listen: listenURL || "", kind: kind || "" }, X.map(function (a) { return a.buffer; })); }
        catch (er) { end(no, Object.assign(new Error("no worker"), { noWorker: true })); } }
      else if (d.type === "progress") say(d.p, d.key);
      else if (d.type === "done") end(ok, d.pack);
      else if (d.type === "error") { var er2 = new Error(d.message); er2.memory = !!d.memory; end(no, er2); } };
    w.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); clearTimeout(timer);
      end(no, started ? Object.assign(new Error("worker failed"), { memory: true }) : Object.assign(new Error("no worker"), { noWorker: true })); };
  });
}
/* where no Worker can start: the same job here, 12 ms at a time */
function runSlices(X, n, sr, notes, say, signal, kind) {
  var job = null, kd = kind && PROF[kind] ? { kind: kind, f: null } : null, kj = kd ? null : kindJob(X, n, sr, notes.beats, notes);
  return new Promise(function (ok, no) {
    (function step() {
      if (signal && signal.aborted) { no(abortErr()); return; }
      /* first the kind of music (in slices too), then the split */
      if (!job) { try { if (kj && !kj.run(10)) { setTimeout(step, 0); return; } if (kj) kd = kj.result();
          notes.kind = kd.kind; if (kd.kind === "experimental" || kd.kind === "classical") notes.beats = [];
          job = stemsJob(X, n, sr, notes, TEST.tune); } catch (e) { no(Object.assign(new Error("memory"), { memory: true })); return; }
        setTimeout(step, 0); return; }
      var done; try { done = job.run(12); } catch (e) { no(e); return; }
      say(job.progress(), "split");
      if (done) { var o = job.out(); o.slices = true; o.auto = !(kind && PROF[kind]); o.feat = kd.f; ok(o); } else setTimeout(step, 0);
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
      return runWorker(chans(buf), buf.length, buf.sampleRate, {}, sayW, signal, lu, opts.kind).then(function (pack) {
        timing.listen = pack.timing ? pack.timing.listen : 0; timing.split = pack.timing ? pack.timing.split : 0;
        TEST.last = { timing: timing, how: "worker", notes: pack.notes || {}, kind: pack.kind, feat: pack.feat, stats: pack.stats };
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
      var run = TEST.noWorker ? runSlices(X, n, sr, notes, sayS, signal, opts.kind) : runWorker(X, n, sr, notes, sayS, signal, "", opts.kind).catch(function (e) {
        if (e && e.noWorker) { X = chans(buf); return runSlices(X, n, sr, notes, sayS, signal, opts.kind); } throw e; });
      return run.then(function (pack) {
        timing.split = Date.now() - t1; TEST.last = { timing: timing, how: TEST.noWorker || pack.slices ? "slices" : "worker", notes: { bass: notes.bass.length, melody: notes.melody.length }, kind: pack.kind, feat: pack.feat, stats: pack.stats };
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
/* a part's samples for one channel: the listening split keeps bass and voice in the middle (one Int16Array for both
   channels), the model keeps every part in stereo ([left, right]); drums are always a list ([one] or [left, right]) */
function pc(a, ch) { return a && a.length != null && !(a instanceof Int16Array) ? a[Math.min(ch, a.length - 1)] : a; }
function partArr(pack, which, ch) {
  if (which === "drums") return pc(pack.d, ch);
  if (which === "bass") return pc(pack.b, ch);
  if (which === "voice") return pc(pack.v, ch);
  return null;
}
function partObj(pack, which) {
  var cache = [], nch = pack.nch;
  return { numberOfChannels: nch, length: pack.len, sampleRate: pack.sr, duration: pack.len / pack.sr, name: which,
    getChannelData: function (ch) {
      ch = Math.max(0, Math.min(nch - 1, ch | 0)); if (cache[ch]) return cache[ch];
      var n = pack.len, out = new Float32Array(n), a = partArr(pack, which, ch), i;
      if (a) for (i = 0; i < n; i++) out[i] = a[i] * S;
      else { var x = pack.x[Math.min(ch, pack.x.length - 1)], d = pc(pack.d, ch), b = pc(pack.b, ch), v = pc(pack.v, ch);
        for (i = 0; i < n; i++) out[i] = (x[i] - d[i] - b[i] - v[i]) * S; }
      cache[ch] = out; return out; },
    free: function () { cache = []; } };
}
/* the one plain line said after a split, where a part is hard */
function noteOf(pack) {
  var st = pack.stats || {};
  if (pack.quality === "model") {   /* AOG-STEMS-AI-V1: what is still hard for the model */
    if (pack.kind === "rock") return "growl";
    if (st.voice != null && st.voice < 0.003) return "noVoice";
    return pack.kind === "classical" ? "classical" : pack.kind === "experimental" ? "unusual" : "";
  }
  if (st.voice != null && st.voice < 0.01) return "noVoice";
  return pack.kind === "rock" ? "guitars" : pack.kind === "experimental" ? "hard" : pack.kind === "classical" ? "classical" : "backing";
}
function fromPack(pack) {
  var o = { sr: pack.sr, sampleRate: pack.sr, length: pack.len, numberOfChannels: pack.nch, quality: pack.quality || "listen", pack: pack,
    kind: pack.kind || "pop", auto: pack.auto !== false, stats: pack.stats || null, note: noteOf(pack) };
  if (pack.model) o.model = pack.model;
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
          var y = out[ch], x = P.x[Math.min(ch, P.x.length - 1)], d = pc(P.d, ch), b = pc(P.b, ch), v = pc(P.v, ch);
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
  var P = parts.pack || parts, meta = { id: id, at: Date.now(), sr: P.sr, len: P.len, nch: P.nch, quality: P.quality || "listen", kind: P.kind || "pop", auto: P.auto !== false, stats: P.stats || null };
  if (P.model) meta.model = P.model;
  var rec = { id: id, d: P.d, b: P.b, v: P.v }; if (P.md) { rec.md = P.md; rec.mb = P.mb; }
  return tx(["meta", "data"], "readwrite", function (t) { t.objectStore("meta").put(meta); t.objectStore("data").put(rec); return null; })
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
      return toX16(buf).then(function (x) { return fromPack({ sr: m.sr, len: m.len, nch: m.nch, quality: m.quality, model: m.model, kind: m.kind, auto: m.auto, stats: m.stats, x: x, d: d.d, b: d.b, v: d.v, md: d.md, mb: d.mb }); });
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
      return { sr: m.sr, len: m.len, nch: m.nch, quality: m.quality, model: m.model, kind: m.kind || "pop", auto: m.auto !== false, stats: m.stats || null, note: noteOf(m), d: d.d, b: d.b, v: d.v, md: d.md, mb: d.mb };
    });
  }).catch(function () { return null; });
}

/* ══ AOG-STEMS-AI-V1 (2026-10-12) — Best quality: a trained model, on the device ══════════════════════════════════════
   Jimmy: "It needs to be improved. Quantum this meaning it needs a big leap in its abilities."
   The quick split above arrives first (seconds), so the parts work at once. Then, at Best, clean() runs SCNet (a trained
   separation model, MIT; aog-stems-ai.js, a Worker, loaded only now) over the song in 11 s segments that overlap by 1.1 s
   and fade into each other, and the parts it makes replace the quick ones. Everything it needs is on this site: the
   model in models/stems/scnet-v1 (11.9 MB), onnxruntime-web in vendor/onnxruntime-web-1.30.0 (WebGPU where the device
   has it, else WebAssembly). "The rest" is still the song less the other three, so the four add back exactly.
     · the kind of music still counts: Classical keeps the quick split's Drums and Bass (only real hits, like timpani, are
       Drums; the model, which learned pop and rock, hears timpani and low strings as bass) and takes the model's Voice;
       the model's own drums and bass are kept beside them (md, mb), so choosing another kind needs no new run (rekind);
     · while the page is out of sight (hidden, or the Studio's hush) no new segment starts; it goes on when you are back;
     · WebGPU that fails falls back to WebAssembly; a device that cannot run it at all keeps the quick split, and says so.
   Split quality (Quick · Best (slower)) is kept on this device ("aog.stems.quality.v1"). Best is the default where the
   device can carry it: WebGPU, or at least 4 GB of memory, or (memory unknown) an iPad or a computer, not a phone. ══ */
var QKEY = "aog.stems.quality.v1";
var AI = { noGPU: false, failInit: "", failSeg: 0, last: null, segPause: 0 };   /* for the tests */
function canBest() {
  var n = G.navigator || {};
  if (n.gpu && !AI.noGPU) return true;
  if (typeof n.deviceMemory === "number") return n.deviceMemory >= 4;
  return !/iPhone|iPod|Android.+Mobile|Mobile.+Firefox|Windows Phone/i.test(n.userAgent || "");
}
function quality() { try { var q = G.localStorage.getItem(QKEY); if (q === "quick" || q === "best") return q; } catch (e) {} return canBest() ? "best" : "quick"; }
function setQuality(q) { try { G.localStorage.setItem(QKEY, q === "best" ? "best" : "quick"); } catch (e) {} }
function aiURL(f) { try { return new URL(f, scriptURL || G.location.href).href; } catch (e) { return "/" + f; } }
function later(ms) { return new Promise(function (ok) { setTimeout(ok, ms || 0); }); }
/* work over n samples, about 10 ms at a time */
function sliced(n, fn) {
  var i = 0;
  return new Promise(function (ok) { (function step() { var until = Date.now() + 10;
    while (i < n) { var i1 = Math.min(n, i + 32768); fn(i, i1); i = i1; if (Date.now() > until) { setTimeout(step, 0); return; } }
    ok(); })(); });
}
function resampleTo(buf, sr, len) {
  var C = OAC(); if (!C) return Promise.reject(new Error("no audio"));
  var n = len || Math.round(buf.length * sr / buf.sampleRate), ctx = new C(Math.min(2, buf.numberOfChannels), n, sr), s = ctx.createBufferSource();
  s.buffer = buf; s.connect(ctx.destination); s.start(0);
  return ctx.startRendering ? new Promise(function (ok, no) { var p = ctx.startRendering(); if (p && p.then) p.then(ok, no); else ctx.oncomplete = function (e) { ok(e.renderedBuffer); }; }) : Promise.reject(new Error("no audio"));
}
/* the model's Worker: one at a time, started on the first segment, let go at the end */
function aiWorker(ep, onLoad, signal) {
  return new Promise(function (ok, no) {
    var w, cur = null, ready = false, done = false;
    try { w = new Worker(aiURL("aog-stems-ai.js"), { type: "module" }); } catch (e) { no(e); return; }
    var hello = setTimeout(function () { if (!ready) fail(new Error("no worker")); }, 20000);
    if (signal) { if (signal.aborted) { setTimeout(function () { fail(abortErr()); }, 0); } else signal.addEventListener("abort", function () { if (!ready) fail(abortErr()); }); }
    function fail(e) { if (done) return; done = true; clearTimeout(hello); try { w.terminate(); } catch (x) {} if (!ready) no(e); else if (cur) { var c = cur; cur = null; c.no(e); } }
    var api = { ep: ep,
      run: function (id, L, R, tick) { return new Promise(function (ok2, no2) { if (done) { no2(new Error("ended")); return; } cur = { id: id, ok: ok2, no: no2, tick: tick }; w.postMessage({ type: "seg", id: id, L: L, R: R }, [L.buffer, R.buffer]); }); },
      end: function () { done = true; clearTimeout(hello); try { w.terminate(); } catch (e) {} if (cur) { var c = cur; cur = null; c.no(abortErr()); } } };
    w.onmessage = function (e) { var d = e.data || {};
      if (d.type === "hello") { clearTimeout(hello); w.postMessage({ type: "init", ep: AI.failInit === ep ? "fail" : ep }); }
      else if (d.type === "load") { if (onLoad) onLoad(d.k / d.of); }
      else if (d.type === "ready") { ready = true; ok(api); }
      else if (d.type === "tick") { if (cur && cur.id === d.id && cur.tick) cur.tick(d.k); }
      else if (d.type === "seg") { if (cur && cur.id === d.id) { var c = cur; cur = null; c.ok(d); } }
      else if (d.type === "error") { var er = new Error(d.message || "model"); er.memory = !!d.memory; if (!ready) { fail(er); } else if (cur) { var c2 = cur; cur = null; c2.no(er); } } };
    w.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); var er = new Error("worker failed"); er.memory = ready; fail(er); };
  });
}
/* out of sight (a hidden page, or the Studio's hush): no new segment starts until it is back */
var hushOn = false;
if (G.addEventListener && !IS_WORKER) G.addEventListener("aog-hush", function (e) { hushOn = !!(e && e.detail && e.detail.on); });
function away() { return hushOn || !!(G.document && G.document.hidden); }
function whenHere(signal) {
  if (!away()) return Promise.resolve();
  return new Promise(function (ok) { var t = null;
    function chk() { if (!away() || (signal && signal.aborted)) { G.removeEventListener("aog-hush", on2); G.document.removeEventListener("visibilitychange", chk); ok(); } }
    function on2() { setTimeout(chk, 0); }
    G.addEventListener("aog-hush", on2); G.document.addEventListener("visibilitychange", chk);
    if (signal) signal.addEventListener("abort", chk); });
}
/* SCNet over the song (44.1 kHz): the parts as 16-bit samples, d, b, v each [left, right] ([one] for a one-channel song) */
async function runModel(buf, say, signal) {
  var n = buf.length, two = buf.numberOfChannels > 1, A = buf.getChannelData(0), B = two ? buf.getChannelData(1) : A, i;
  var chk = function () { if (signal && signal.aborted) throw abortErr(); };
  /* the song's mean and deviation (of its middle), as the model was trained to hear it */
  var mean = 0, sq = 0;
  await sliced(n, function (a, b) { for (var j = a; j < b; j++) mean += 0.5 * (A[j] + B[j]); }); mean /= n;
  await sliced(n, function (a, b) { for (var j = a; j < b; j++) { var m = 0.5 * (A[j] + B[j]) - mean; sq += m * m; } });
  var std = Math.sqrt(sq / Math.max(1, n - 1)) + 1e-8, inv = 1 / std; chk();
  var man = await (await fetch(aiURL("models/stems/scnet-v1/manifest.json"))).json(); chk();
  var L = man.segment, fade = Math.floor(L / 10), hop = L - fade, border = fade, wide = n > 2 * border, M = wide ? n + 2 * border : n, starts = [];
  for (var s0 = 0; ; s0 += hop) { starts.push(s0); if (s0 + L >= M) break; }
  var K = starts.length, nc = two ? 2 : 1, OUT = [0, 1, 2].map(function () { var o = []; for (var c = 0; c < nc; c++) o.push(new Int16Array(n)); return o; });
  var tail = null, t0 = Date.now();
  var refl = function (j, len) { var p = 2 * (len - 1); if (p <= 0) return 0; j = ((j % p) + p) % p; return j < len ? j : p - j; };
  /* the song at padded place j (reflected out by `border` at each end) */
  var at = function (X, j) { var q = wide ? j - border : j; if (q < 0) q = -q; else if (q >= n) q = 2 * (n - 1) - q; if (q < 0 || q >= n) q = 0; return (X[q] - mean) * inv; };
  var ep = "wasm", W = null, tries = 0;
  /* WebGPU only where the device really gives an adapter (a browser can have navigator.gpu and no GPU to give) */
  if (G.navigator && G.navigator.gpu && !AI.noGPU) { try { if (await G.navigator.gpu.requestAdapter()) ep = "webgpu"; } catch (e) {} }
  var start = async function () {
    for (;;) {
      try { W = await aiWorker(ep, function (f) { say(0.02 * f); }, signal); AI.ep = ep; return; }
      catch (e) { if (e && e.name === "AbortError") throw e; if (ep === "webgpu") { ep = "wasm"; continue; } var er = new Error("kept quick"); er.kept = true; er.memory = !!(e && e.memory); throw er; }
    }
  };
  var abortW = function () { if (W) W.end(); };
  if (signal) signal.addEventListener("abort", abortW);
  try {
    await start(); chk();
    for (var k = 0; k < K; k++) {
      await whenHere(signal); chk();
      if (AI.segPause) await later(AI.segPause);
      var s = starts[k], len = Math.min(L, M - s), reflect = len > L / 2, SL = new Float32Array(L), SR = new Float32Array(L);
      for (i = 0; i < L; i++) { var j = i < len ? s + i : reflect ? s + refl(i, len) : -1; if (j >= 0) { SL[i] = at(A, j); SR[i] = two ? at(B, j) : SL[i]; } }
      var res;
      for (;;) {
        try {
          if (AI.failSeg && k === AI.failSeg - 1) { AI.failSeg = 0; throw Object.assign(new Error("test"), { memory: true }); }
          res = await W.run(k, SL.slice(), SR.slice(), function (t) { say(0.02 + 0.96 * (k + t / 10) / K); });
          break;
        } catch (e) {
          chk();
          if (ep === "webgpu" && tries++ < 1) { W.end(); ep = "wasm"; await start(); continue; }
          var er2 = new Error("kept quick"); er2.kept = true; er2.memory = !!(e && e.memory); throw er2;
        }
      }
      /* into the parts: the first `fade` samples fade in over the last segment's tail; the last `fade` wait for the next */
      var a0 = k > 0 ? Math.min(fade, len) : 0, a1 = k < K - 1 ? L - fade : len, P3 = [res.d, res.b, res.v], ntail = k < K - 1 ? [] : null, sc = std * 32767;
      var off = s - (wide ? border : 0), q0 = Math.max(0, -off), q1 = Math.min(a1, n - off);   /* the segment's places that are in the song */
      for (var pi = 0; pi < 3; pi++) {
        var Y = P3[pi], O = OUT[pi], yl = Y[0], yr = Y[1], tl = tail && tail[pi], O0 = O[0], O1 = nc === 2 ? O[1] : null, ws = 1 / (fade - 1), vl, vr;
        for (i = q0; i < q1; i++) {
          if (i < a0) { var wq = i * ws; vl = tl[0][i] * (1 - wq) + yl[i] * wq; vr = tl[1][i] * (1 - wq) + yr[i] * wq; } else { vl = yl[i]; vr = yr[i]; }
          if (O1) { O0[off + i] = q16s(vl * sc); O1[off + i] = q16s(vr * sc); } else O0[off + i] = q16s(0.5 * (vl + vr) * sc);
        }
        if (ntail) ntail.push([yl.slice(L - fade), yr.slice(L - fade)]);
        await later(0);   /* a part at a time, so the page never waits long */
      }
      tail = ntail;
    }
    var segMs = Date.now() - t0;
    AI.last = { ep: ep, segments: K, ms: segMs, sec: n / buf.sampleRate };
    return { d: OUT[0], b: OUT[1], v: OUT[2], ep: ep, ms: segMs };
  } finally {
    if (signal) signal.removeEventListener("abort", abortW);
    if (W) W.end();
  }
}
function q16s(v) { v = Math.round(v); return v > 32767 ? 32767 : v < -32768 ? -32768 : v; }
/* parts made at 44.1 kHz, back to the song's own rate and length */
async function backTo(out, buf) {
  if (buf.sampleRate === SR0) return out;
  var C = OAC(), n44 = out.d[0].length, res = {};
  for (var key of ["d", "b", "v"]) {
    var P = out[key], nc = P.length, b44 = new AudioBuffer({ numberOfChannels: nc, length: n44, sampleRate: SR0 });
    for (var c = 0; c < nc; c++) { var dst = b44.getChannelData(c), src = P[c]; for (var i = 0; i < n44; i++) dst[i] = src[i] * S; }
    out[key] = null;
    var r = await resampleTo(b44, buf.sampleRate, buf.length), o = [];
    for (c = 0; c < nc; c++) { var y = r.getChannelData(c), q = new Int16Array(buf.length); for (i = 0; i < q.length; i++) q[i] = q16s(y[i] * 32767); o.push(q); }
    res[key] = o;
  }
  res.ep = out.ep; res.ms = out.ms;
  return res;
}
/* each part's share of the song (every third sample) */
async function shares(pk, e0) {
  var nch = pk.nch || 1, n = pk.len, E = { d: 0, b: 0, v: 0 };
  for (var key of ["d", "b", "v"]) { for (var c = 0; c < nch; c++) { var a = pc(pk[key], c), sum = 0; await sliced(n, function (i0, i1) { for (var i = i0 - (i0 % 3); i < i1; i += 3) { var z = a[i] * S; sum += z * z; } }); E[key] += sum; } }
  var tot = e0 > 0 ? e0 : 1;
  return { drums: E.d / tot, bass: E.b / tot, voice: E.v / tot, e: e0 };
}
async function songEnergy(buf) {
  var e = 0, nch = Math.min(2, buf.numberOfChannels);
  for (var c = 0; c < nch; c++) { var a = buf.getChannelData(c); await sliced(a.length, function (i0, i1) { for (var i = i0 - (i0 % 3); i < i1; i += 3) e += a[i] * a[i]; }); }
  return e;
}
/* the kind of music, on the model's parts: Classical keeps the quick split's Drums and Bass (see above) */
function kindParts(pk, qp) {
  var md = pk.md || pk.d, mb = pk.mb || pk.b;
  pk.kind = qp.kind || "pop"; pk.auto = qp.auto !== false;
  if (pk.kind === "classical" && qp.d && qp.b) { pk.md = md; pk.mb = mb; pk.d = qp.d; pk.b = qp.b; }
  else { pk.d = md; pk.b = mb; delete pk.md; delete pk.mb; }
  return pk;
}
/* clean(input, {quick, kind, signal, onProgress(p, "clean"), noX}) → Promise<Parts quality:"model">.
   quick: the quick split's Parts (or a function giving them, when its samples have been moved elsewhere): its kind of
   music, and for Classical its Drums and Bass. A failure that is not a Stop comes with .kept = true: keep the quick split. */
async function clean(input, opts) {
  opts = opts || {};
  var signal = opts.signal || null, last = -1, t0 = Date.now();
  var say = function (p) { var r = Math.round(p * 100); if (r === last) return; last = r; if (opts.onProgress) try { opts.onProgress(Math.max(0, Math.min(1, p)), "clean"); } catch (e) {} };
  say(0);
  var buf = await decode(input);
  if (signal && signal.aborted) throw abortErr();
  if (buf.duration > MAX_SEC) throw Object.assign(new Error("too long"), { memory: true, kept: true });
  var b44 = buf.sampleRate === SR0 ? buf : await resampleTo(buf, SR0);
  var out = await runModel(b44, say, signal);
  b44 = null;
  out = await backTo(out, buf);
  var q = typeof opts.quick === "function" ? await opts.quick() : opts.quick, qp = q ? (q.pack || q) : {};
  if (opts.kind && PROF[opts.kind]) qp = { kind: opts.kind, auto: false, d: qp.kind === opts.kind ? qp.d : null, b: qp.kind === opts.kind ? qp.b : null };
  var nch = Math.min(2, buf.numberOfChannels);
  var pk = { sr: buf.sampleRate, len: buf.length, nch: nch, quality: "model", model: "scnet", d: out.d, b: out.b, v: out.v };
  pk.x = opts.noX ? null : (qp.x && qp.x[0] && qp.x[0].length === buf.length ? qp.x : await toX16(buf));
  kindParts(pk, qp);
  pk.stats = await shares(pk, await songEnergy(buf));
  pk.stats.ep = out.ep; pk.stats.ms = Date.now() - t0;
  say(1);
  return fromPack(pk);
}
/* the model's parts with another kind of music (the quick split's, just made with that kind): no new model run */
async function rekind(model, quick) {
  var mp = model.pack || model, qp = quick.pack || quick, o = {}, k;
  for (k in mp) if (Object.prototype.hasOwnProperty.call(mp, k)) o[k] = mp[k];
  kindParts(o, qp);
  var e0 = mp.stats && mp.stats.e;
  if (e0 > 0) { var st = await shares(o, e0); for (k in mp.stats) if (!(k in st)) st[k] = mp.stats[k]; o.stats = st; }
  if (model.pack) return fromPack(o);
  o.note = noteOf(o); return o;
}


var API = {
  version: 1, words: WORDS, names: NAMES, parts: PARTS.slice(), word: word, kinds: KINDS.slice(), kindWords: KINDW,
  split: split, mixInto: mixInto, wav: wav, keep: keep, kept: kept, keptParts: keptParts, has: has, drop: drop,
  clean: clean, rekind: rekind, quality: quality, setQuality: setQuality, canBest: canBest, model: "scnet",
  /* for the tests: the job itself (to measure on known parts), the settings, the last split's timing */
  test: { job: stemsJob, kindOf: kindOf, KT: KT, PROF: PROF, tune: function (t) { TEST.tune = t || null; }, defaults: TUNE, noWorker: function (b) { TEST.noWorker = !!b; }, last: function () { return TEST.last; }, fromPack: fromPack, ai: AI }
};
G.AOGStems = API;
})(typeof self !== "undefined" ? self : this);
