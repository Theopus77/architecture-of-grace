/* AOG-LEARN-V1 (2026-10-11) — the listening engine behind "learn this song" in the Guitar, the Bass and the Piano.
   Jimmy: "Can the guitar, bass and piano teach how to play songs if I upload them?" — chords along with the song, exact
   MIDI files, "Did I get it?", the bass line and the melody. This file is the engine only; the rooms draw the lessons.

   window.AOGLearn
     .analyze(input, {onProgress(p 0..1, wordKey), worker:true, name}) → Promise<Lesson>
         input: an AudioBuffer, or an ArrayBuffer / Blob / File of an audio file (a MIDI file is read by fromMidi).
         The heavy listening runs in a Web Worker (aog-learn-worker.js), so the page stays calm; without Workers it runs
         here in small slices between frames. Nothing leaves the device.
     .fromMidi(ArrayBuffer, {name}) → Lesson     (Standard MIDI File, types 0 and 1; exact notes)
     .words.en / .words.es                       the words for each step (wordKey → "Finding the beat…")
     .chordName(root, q, key, minor) · .keyName(key, minor) · .isMidi(arrayBuffer)

   Lesson = { v:1, src:"audio"|"midi", name, sec, sr:22050, bpm, beats:[t], downbeats:[t], meter:{num,den},
              key:{key 0-11, minor, conf, name}, chords:[{t,d,root,q,name,conf}], bass:[{t,d,m,conf}],
              melody:[{t,d,m,conf}], tracks:[{name, ch 1-16, program, programName, drums, notes:[{t,d,m,v}]}],
              notes:[{t,d,m,v}], tuning (cents) }      Times are seconds of the original song.

   How it listens (all of it plain JavaScript on Float32Arrays, streamed frame by frame):
     beat    spectral-flux onset strength (log magnitude, max-filtered) → tempo by autocorrelation with a comb over
             2-4x the period and a prior around 70-160 bpm → dynamic-programming beat tracker (Ellis) → beats.
     key     a 4096-point STFT; harmonic/percussive separation by median filtering (Fitzgerald); spectral peaks with
             parabolic interpolation; tuning offset from the peaks (circular mean); tuning-corrected beat-synchronous
             chroma (treble and bass apart); Krumhansl-Kessler profiles plus how long the tonic chord sounds.
     chords  templates for maj min 7 maj7 m7 sus2 sus4 dim aug 5 (with their overtones) and "N" for no chord, a bass
             bonus for the root, Viterbi smoothing with a key-aware and bar-aware change cost; downbeats from where
             the harmony and the bass change and where the low drums hit; the meter (3 or 4) from the same.
     bass    harmonic-sum salience on semitones in 40-300 Hz → Viterbi over sixteenth-note slots (with rests) →
             notes, a new note where the pitch changes or the low energy rises again.
     melody  predominant-melody salience (harmonic summation, Salamon-style, simplified) in 110-1600 Hz on a 10-cent
             grid → Viterbi with voicing → notes, split at dips, snapped to a 1/12-beat grid. */
(function (G) {
"use strict";
var SR = 22050;
/* the settings the listening was tuned with (synthetic songs and the starter crate, music-handoff/tests/learn) */
var SUBW = 0.5,      /* tempo: how much a beat that splits in two or three counts */
    TIGHT = 300,     /* beats: how strongly the beat keeps its spacing */
    Q7 = 0.006,      /* chords: a 7th must be heard a little more clearly than the plain chord */
    TLO = 300,       /* chords: below this (Hz) the chord colour fades out, so the bass's overtones do not colour it */
    TONW = 0.25,     /* key: how much the time spent on the home chord counts */
    FIRSTW = 0.25;   /* key: a song that starts on a chord often calls it home */

var WORDS = {
  en: { open: "Opening the song…", beat: "Finding the beat…", key: "Finding the key…", chords: "Finding the chords…",
        bass: "Finding the bass line…", melody: "Finding the melody…", done: "The song is ready.",
        error: "This file would not open. Try another song.", midi: "Reading the notes…" },
  es: { open: "Abriendo la canción…", beat: "Buscando el pulso…", key: "Buscando la tonalidad…", chords: "Buscando los acordes…",
        bass: "Buscando la línea del bajo…", melody: "Buscando la melodía…", done: "La canción está lista.",
        error: "Este archivo no se abrió. Prueba otra canción.", midi: "Leyendo las notas…" }
};

/* ───────── small helpers ───────── */
function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function r4(x) { return Math.round(x * 10000) / 10000; }
function r2(x) { return Math.round(x * 100) / 100; }
function now() { return (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now(); }
function hann(n) { var w = new Float32Array(n); for (var i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / n); return w; }
function selectK(a, n, k) {           /* k-th smallest of a[0..n) (Wirth), reorders a */
  var l = 0, r = n - 1;
  while (l < r) { var x = a[k], i = l, j = r;
    do { while (a[i] < x) i++; while (x < a[j]) j--; if (i <= j) { var t = a[i]; a[i] = a[j]; a[j] = t; i++; j--; } } while (i <= j);
    if (j < k) l = i; if (k < i) r = j; }
  return a[k];
}
function medianOf(arr) { var n = arr.length; if (!n) return 0; var c = Float64Array.from(arr); return selectK(c, n, n >> 1); }
function percentile(arr, q) { var n = arr.length; if (!n) return 0; var c = Float64Array.from(arr); return selectK(c, n, Math.min(n - 1, Math.floor(q * n))); }
function log2(x) { return Math.log(x) / Math.LN2; }
function hzToMidi(f) { return 69 + 12 * log2(f / 440); }

/* a slice timer: on the page it gives the browser a moment every ~12 ms (a timer, so the page's own timers and drawing get
   their turn); in the worker it never waits */
function getYield() { return function (f) { setTimeout(f, 0); }; }
function Ticker(budget) { this.b = budget || 0; this.t0 = now(); }
Ticker.prototype.due = function () { return this.b > 0 && now() - this.t0 > this.b; };
Ticker.prototype.yield = function () { var s = this, y = getYield(); return new Promise(function (r) { y(function () { s.t0 = now(); r(); }); }); };

/* ───────── FFT: complex radix-2, and a real-input magnitude spectrum by packing ───────── */
function makeFFT(n) {
  var rev = new Uint32Array(n), cs = new Float64Array(n / 2), sn = new Float64Array(n / 2), bits = Math.round(log2(n)), i;
  for (i = 0; i < n; i++) { var r = 0, x = i; for (var b = 0; b < bits; b++) { r = (r << 1) | (x & 1); x >>= 1; } rev[i] = r; }
  for (i = 0; i < n / 2; i++) { cs[i] = Math.cos(2 * Math.PI * i / n); sn[i] = -Math.sin(2 * Math.PI * i / n); }
  return function (re, im) {
    var i, j, t;
    for (i = 0; i < n; i++) { j = rev[i]; if (j > i) { t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (var size = 2; size <= n; size <<= 1) { var half = size >> 1, step = n / size;
      for (var i0 = 0; i0 < n; i0 += size) for (j = 0; j < half; j++) { var a = i0 + j, b2 = a + half, k = j * step, wr = cs[k], wi = sn[k];
        var xr = re[b2] * wr - im[b2] * wi, xi = re[b2] * wi + im[b2] * wr; re[b2] = re[a] - xr; im[b2] = im[a] - xi; re[a] += xr; im[a] += xi; } }
  };
}
function makeRealMag(N, kMax) {     /* fills mag[0..kMax] with |X[k]| of a real frame of length N */
  var M = N / 2, fft = makeFFT(M), re = new Float64Array(M), im = new Float64Array(M), c = new Float64Array(M + 1), s = new Float64Array(M + 1);
  kMax = Math.min(M, kMax == null ? M : kMax);
  for (var k = 0; k <= M; k++) { c[k] = Math.cos(2 * Math.PI * k / N); s[k] = Math.sin(2 * Math.PI * k / N); }
  return function (x, mag) {
    for (var n = 0; n < M; n++) { re[n] = x[2 * n]; im[n] = x[2 * n + 1]; }
    fft(re, im);
    for (var k = 0; k <= kMax; k++) { var a = k === M ? 0 : k, b = k === 0 ? 0 : M - k;
      var zr = re[a], zi = im[a], mr = re[b], mi = im[b];
      var er = 0.5 * (zr + mr), ei = 0.5 * (zi - mi), or = 0.5 * (zi + mi), oi = -0.5 * (zr - mr);
      var xr = er + or * c[k] + oi * s[k], xi = ei + oi * c[k] - or * s[k];
      mag[k] = Math.sqrt(xr * xr + xi * xi); }
  };
}

/* ───────── music words: chords, keys, spelling ───────── */
var QUALS = ["maj", "min", "7", "maj7", "m7", "sus2", "sus4", "dim", "aug", "5"];
var IVS = { maj: [0, 4, 7], min: [0, 3, 7], "7": [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], sus2: [0, 2, 7], sus4: [0, 5, 7],
            dim: [0, 3, 6], aug: [0, 4, 8], "5": [0, 7] };
var QPEN = { maj: 0, min: 0, "7": Q7, maj7: Q7, m7: Q7, sus2: 0.045, sus4: 0.045, dim: 0.05, aug: 0.06, "5": 0.05 };
var SUFFIX = { maj: "", min: "m", "7": "7", maj7: "maj7", m7: "m7", sus2: "sus2", sus4: "sus4", dim: "dim", aug: "aug", "5": "5" };
var NSTATE = 120;                   /* states 0..119 = root*10 + quality index; 120 = no chord */
var MAJOR_TONIC = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
var MINOR_TONIC = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
var LETTERS = "CDEFGAB", LETTER_PC = [0, 2, 4, 5, 7, 9, 11], STEP_LETTERS = [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6];
var SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
function keyName(key, minor) { return (minor ? MINOR_TONIC : MAJOR_TONIC)[((key % 12) + 12) % 12] + (minor ? "m" : ""); }
function spell(pc, key, minor) {     /* the note name that fits the key: its letter counted from the tonic's letter */
  pc = ((pc % 12) + 12) % 12;
  if (key == null || key < 0) return FLAT[pc] === "Gb" ? "F#" : FLAT[pc];
  var tn = (minor ? MINOR_TONIC : MAJOR_TONIC)[key], li = LETTERS.indexOf(tn[0]);
  var L = (li + STEP_LETTERS[(pc - key + 12) % 12]) % 7, acc = ((pc - LETTER_PC[L]) % 12 + 18) % 12 - 6;
  if (acc === 0) return LETTERS[L]; if (acc === 1) return LETTERS[L] + "#"; if (acc === -1) return LETTERS[L] + "b";
  var flatKey = minor ? [0, 2, 3, 5, 7, 10].indexOf(key) >= 0 : [1, 3, 5, 8, 10].indexOf(key) >= 0;
  return (flatKey ? FLAT : SHARP)[pc];
}
function chordName(root, q, key, minor) { if (root < 0 || q === "N") return "N.C."; return spell(root, key, minor) + SUFFIX[q]; }

/* templates: the chord's notes, L2-normalised (plain templates did better than ones with overtones, on every test song) */
function buildTemplates() {
  var T = new Float32Array(NSTATE * 12);
  for (var r = 0; r < 12; r++) for (var qi = 0; qi < QUALS.length; qi++) {
    var iv = IVS[QUALS[qi]], o = (r * 10 + qi) * 12, i;
    for (i = 0; i < iv.length; i++) { var pc = (r + iv[i]) % 12; T[o + pc] += 1; }
    var n = 0; for (i = 0; i < 12; i++) n += T[o + i] * T[o + i]; n = Math.sqrt(n); for (i = 0; i < 12; i++) T[o + i] /= n;
  }
  return T;
}
var TEMPL_AUDIO = buildTemplates(), TEMPL_NOTES = TEMPL_AUDIO;
function scaleSet(key, minor) { var s = new Uint8Array(12), iv = minor ? [0, 2, 3, 5, 7, 8, 10, 11] : [0, 2, 4, 5, 7, 9, 11];
  for (var i = 0; i < iv.length; i++) s[(key + iv[i]) % 12] = 1; return s; }
function diatonic(state, key, minor) { if (state === NSTATE) return true; var sc = scaleSet(key, minor), r = (state / 10) | 0, iv = IVS[QUALS[state % 10]];
  for (var i = 0; i < iv.length; i++) if (!sc[(r + iv[i]) % 12]) return false; return true; }

/* ───────── 1. the beat ───────── */
async function onsetEnvelope(x, T, prog) {
  var N = 1024, H = 256, half = N / 2, nb = N / 2 + 1, nF = Math.floor(x.length / H) + 1;
  var win = hann(N), frame = new Float32Array(N), mag = new Float32Array(nb), prev, cur;
  var O = new Float32Array(nF), Ol = new Float32Array(nF), R = new Float32Array(nF), rmag = makeRealMag(N);
  var NLB = 96, LB = new Float32Array(nF * NLB);    /* the low bins (to 2 kHz) kept at this finer time step: re-struck notes */
  /* log-spaced bands (a semitone wide where the bins allow), so every octave counts the same: the kick as much as the hats */
  var band = new Int16Array(nb), nBand = 0, lastB = -1, bw = [], i, k;
  for (k = 1; k < nb; k++) { var fk = k * SR / N, bi = Math.max(0, Math.floor(12 * log2(Math.max(fk, 30) / 30)));
    if (bi > lastB) { nBand++; lastB = bi; bw.push(0); } band[k] = nBand - 1; bw[nBand - 1]++; }
  var kLowB = band[Math.round(300 * N / SR)];
  prev = new Float32Array(nBand); cur = new Float32Array(nBand);
  for (var f = 0; f < nF; f++) {
    var st = f * H - half, e = 0;
    for (i = 0; i < N; i++) { var j = st + i, v = (j >= 0 && j < x.length) ? x[j] : 0; frame[i] = v * win[i]; e += v * v; }
    R[f] = Math.sqrt(e / N);
    rmag(frame, mag);
    cur.fill(0); for (k = 1; k < nb; k++) cur[band[k]] += mag[k];
    for (k = 0; k < nBand; k++) cur[k] = Math.log(1 + 30 * cur[k] / bw[k]);
    var s = 0, sl = 0;
    if (f > 0) for (k = 0; k < nBand; k++) { var m = prev[k]; if (k > 0 && prev[k - 1] > m) m = prev[k - 1]; if (k < nBand - 1 && prev[k + 1] > m) m = prev[k + 1];
      var d = cur[k] - m; if (d > 0) { s += d; if (k <= kLowB) sl += d; } }
    O[f] = s; Ol[f] = sl; var t = prev; prev = cur; cur = t;
    LB.set(mag.subarray(0, NLB), f * NLB);
    if ((f & 127) === 0) { prog(f / nF); if (T.due()) await T.yield(); }
  }
  return { O: O, Ol: Ol, R: R, fps: SR / H, H: H, LB: LB, NLB: NLB, N: N };
}

/* the strength of one note (its first harmonics) at time t, from the fine low bins */
function noteEnergy(ON, t, m, tune, H) {
  var f = t * ON.fps, a = Math.floor(f), w = f - a, n = ON.LB.length / ON.NLB, f0 = 440 * Math.pow(2, (m + tune - 69) / 12), e = 0;
  if (a < 0) { a = 0; w = 0; } if (a >= n - 1) { a = n - 2; w = 1; } if (a < 0) return 0;
  for (var h = 1; h <= H; h++) { var kb = f0 * h * ON.N / SR; if (kb >= ON.NLB - 1) break; var k = Math.floor(kb), u = kb - k;
    var A = ON.LB[a * ON.NLB + k] * (1 - u) + ON.LB[a * ON.NLB + k + 1] * u, B = ON.LB[(a + 1) * ON.NLB + k] * (1 - u) + ON.LB[(a + 1) * ON.NLB + k + 1] * u;
    e += (A * (1 - w) + B * w) / h; }
  return e;
}
function spanStat(ON, t0, t1, m, tune, H, mode) { var st = 1 / ON.fps, v = mode === "min" ? Infinity : mode === "max" ? 0 : 0, c = 0;
  for (var t = t0; t <= t1 + 1e-9; t += st) { var e = noteEnergy(ON, t, m, tune, H); if (mode === "min") v = Math.min(v, e); else if (mode === "max") v = Math.max(v, e); else { v += e; c++; } }
  return mode === "mean" ? (c ? v / c : 0) : (v === Infinity ? 0 : v); }

function estimatePeriod(O, fps) {
  var n = O.length, mean = 0, i, l;
  for (i = 0; i < n; i++) mean += O[i]; mean /= Math.max(1, n);
  var z = new Float32Array(n); for (i = 0; i < n; i++) z[i] = O[i] - mean;
  var minL = Math.floor(fps * 60 / 220), maxL = Math.ceil(fps * 60 / 45), top = Math.min(n - 2, 4 * maxL + 2);
  if (top <= minL + 2) return fps * 60 / 120;
  var ac = new Float64Array(top + 1);
  for (l = 1; l <= top; l++) { var s = 0, m = n - l; for (i = 0; i < m; i++) s += z[i] * z[i + l]; ac[l] = s / m; }
  function A(x) { if (x >= top) return 0; var a = Math.floor(x), f = x - a; return ac[a] * (1 - f) + ac[a + 1] * f; }
  var best = -Infinity, bestL = fps * 60 / 120;
  for (var L = minL; L <= maxL; L += 0.125) {
    var S = A(L) + 0.5 * A(2 * L) + 0.33 * A(3 * L) + 0.25 * A(4 * L) + SUBW * Math.max(A(L / 2), A(L / 3)), bpm = 60 * fps / L;
    var w = Math.exp(-0.5 * Math.pow(log2(bpm / 112) / 0.85, 2)), sc = Math.max(0, S) * w;
    if (sc > best) { best = sc; bestL = L; }
  }
  return bestL;
}

function trackBeats(O, R, fps, period) {
  var n = O.length, i, std = 0, mean = 0;
  for (i = 0; i < n; i++) mean += O[i]; mean /= Math.max(1, n);
  for (i = 0; i < n; i++) std += (O[i] - mean) * (O[i] - mean); std = Math.sqrt(std / Math.max(1, n)) || 1;
  /* local score: the onset strength over its spread, smoothed by a narrow Gaussian (σ = period/32) */
  var Lw = Math.max(1, Math.round(period / 4)), g = new Float32Array(2 * Lw + 1), Lc = new Float32Array(n);
  for (i = -Lw; i <= Lw; i++) g[i + Lw] = Math.exp(-0.5 * Math.pow(i * 32 / period, 2));
  for (i = 0; i < n; i++) { var s = 0; for (var j = -Lw; j <= Lw; j++) { var q = i + j; if (q >= 0 && q < n) s += O[q] * g[j + Lw]; } Lc[i] = s / std; }
  var lo = Math.max(1, Math.round(period / 2)), hi = Math.round(2 * period), pen = new Float32Array(hi + 1);
  for (var d = lo; d <= hi; d++) pen[d] = -TIGHT * Math.pow(Math.log(d / period), 2);
  var C = new Float32Array(n), back = new Int32Array(n), maxL = 0;
  for (i = 0; i < n; i++) if (Lc[i] > maxL) maxL = Lc[i];
  var started = false;
  for (i = 0; i < n; i++) {
    var best = -Infinity, arg = -1;
    for (d = lo; d <= hi && i - d >= 0; d++) { var v = C[i - d] + pen[d]; if (v > best) { best = v; arg = i - d; } }
    if (!started && Lc[i] < 0.01 * maxL) { C[i] = Lc[i]; back[i] = -1; }
    else { started = true; if (arg >= 0) { C[i] = Lc[i] + best; back[i] = arg; } else { C[i] = Lc[i]; back[i] = -1; } }
  }
  /* the last beat: the last local peak of the running score that is at least half the typical peak */
  var peaks = [];
  for (i = 1; i < n - 1; i++) if (C[i] > C[i - 1] && C[i] >= C[i + 1]) peaks.push(C[i]);
  if (!peaks.length) return [];
  var med = medianOf(peaks), last = -1;
  for (i = n - 2; i >= 1; i--) if (C[i] > C[i - 1] && C[i] >= C[i + 1] && C[i] * 2 > med) { last = i; break; }
  var beats = [];
  for (i = last; i >= 0; i = back[i]) { beats.push(i); if (back[i] < 0) break; }
  beats.reverse();
  /* trim weak beats at the edges (quiet intros and endings) */
  if (beats.length > 4) {
    var sm = beats.map(function (b, k) { var s = 0, w = 0; for (var j = -2; j <= 2; j++) { var q = k + j; if (q >= 0 && q < beats.length) { var ww = 1 - Math.abs(j) / 3; s += Lc[beats[q]] * ww; w += ww; } } return s / w; });
    var rms = Math.sqrt(sm.reduce(function (a, b) { return a + b * b; }, 0) / sm.length), thr = 0.5 * rms;
    var rmsAll = percentile(R, 0.5), a = 0, b = beats.length - 1;
    while (a < b && (sm[a] < thr || R[beats[a]] < 0.02 * rmsAll)) a++;
    while (b > a && (sm[b] < thr || R[beats[b]] < 0.02 * rmsAll)) b--;
    beats = beats.slice(a, b + 1);
  }
  /* sub-frame placement by a parabola through the local score */
  return beats.map(function (f) { var a = f > 0 ? Lc[f - 1] : Lc[f], b = Lc[f], c = f < n - 1 ? Lc[f + 1] : Lc[f], den = a - 2 * b + c, dd = 0;
    if (den < 0) dd = clamp(0.5 * (a - c) / den, -0.5, 0.5); return (f + dd) / fps; });
}

function tempoOf(beats) {
  if (beats.length < 3) return 0;
  var ibi = []; for (var i = 1; i < beats.length; i++) ibi.push(beats[i] - beats[i - 1]);
  var m = medianOf(ibi), ok = ibi.filter(function (x) { return Math.abs(x - m) < 0.08 * m; }).length / ibi.length;
  if (ok > 0.9) { /* a steady song: the slope of beat time against beat number */
    var n = beats.length, sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (i = 0; i < n; i++) { sx += i; sy += beats[i]; sxx += i * i; sxy += i * beats[i]; }
    var slope = (n * sxy - sx * sy) / (n * sxx - sx * sx); if (slope > 0) return 60 / slope;
  }
  return 60 / m;
}

/* ───────── 2. the harmonic spectrum: HPSS and spectral peaks ───────── */
async function harmonicPeaks(x, T, prog) {
  var N = 4096, H = 512, half = N / 2, K = Math.round(4200 * N / SR), nF = Math.floor(x.length / H) + 1;
  var hw = 5, W = 2 * hw + 1, VW = 5, MAXP = 60;      /* median over 11 frames (a quarter second) and 11 bins */
  var win = hann(N), frame = new Float32Array(N), rmag = makeRealMag(N, K + VW + 1), ring = [], i, k;
  for (i = 0; i < W; i++) ring.push(new Float32Array(N / 2 + 1));
  var pF = new Float32Array(nF * MAXP), pA = new Float32Array(nF * MAXP), pN = new Uint8Array(nF);
  var med = new Float32Array(W), vb = new Float32Array(2 * VW + 1), Y = new Float32Array(K + 2);
  var cK = new Int32Array(K), cA = new Float32Array(K), sel = new Float32Array(K);
  for (var f = 0; f < nF + hw; f++) {
    if (f < nF) { var st = f * H - half, buf = ring[f % W];
      for (i = 0; i < N; i++) { var j = st + i; frame[i] = (j >= 0 && j < x.length) ? x[j] * win[i] : 0; }
      rmag(frame, buf); }
    var g = f - hw; if (g < 0 || g >= nF) continue;
    var cur = ring[g % W], a0 = Math.max(0, g - hw), a1 = Math.min(nF - 1, g + hw), cnt = a1 - a0 + 1, mx = 0;
    for (k = 1; k <= K; k++) {
      var c = 0; for (var q = a0; q <= a1; q++) med[c++] = ring[q % W][k];
      var h = selectK(med, cnt, cnt >> 1);
      c = 0; for (q = k - VW; q <= k + VW; q++) vb[c++] = q > 0 ? cur[q] : 0;
      var p = selectK(vb, c, c >> 1), h2 = h * h, v = cur[k] * h2 / (h2 + p * p + 1e-12);
      Y[k] = v; if (v > mx) mx = v;
    }
    Y[0] = 0; Y[K + 1] = 0;
    var thr = Math.max(mx * 0.003, 0.05), np = 0;
    for (k = 2; k < K; k++) { var y = Y[k]; if (y > thr && y > Y[k - 1] && y >= Y[k + 1]) { cK[np] = k; cA[np] = y; np++; } }
    var cut = 0;
    if (np > MAXP) { for (i = 0; i < np; i++) sel[i] = cA[i]; cut = selectK(sel, np, np - MAXP); }
    var o = g * MAXP, n2 = 0;
    for (i = 0; i < np && n2 < MAXP; i++) { if (cA[i] < cut) continue; k = cK[i];
      var la = Math.log(Y[k - 1] + 1e-9), lb = Math.log(Y[k] + 1e-9), lc = Math.log(Y[k + 1] + 1e-9), den = la - 2 * lb + lc, dl = 0;
      if (den < 0) dl = clamp(0.5 * (la - lc) / den, -0.5, 0.5);
      pF[o + n2] = (k + dl) * SR / N; pA[o + n2] = Math.exp(lb - 0.25 * (la - lc) * dl); n2++; }
    pN[g] = n2;
    if ((g & 15) === 0) { if ((g & 63) === 0) prog(g / nF); if (T.due()) await T.yield(); }
  }
  return { pF: pF, pA: pA, pN: pN, nF: nF, MAXP: MAXP, H: H, fps: SR / H };
}

function estimateTuning(P) {
  var sc = 0, ss = 0;
  for (var g = 0; g < P.nF; g++) { var o = g * P.MAXP;
    for (var i = 0; i < P.pN[g]; i++) { var f = P.pF[o + i]; if (f < 80 || f > 2000) continue;
      var p = hzToMidi(f), d = p - Math.round(p), a = P.pA[o + i], th = 2 * Math.PI * d; sc += a * Math.cos(th); ss += a * Math.sin(th); } }
  if (!sc && !ss) return 0;
  return Math.atan2(ss, sc) / (2 * Math.PI);    /* semitones, −0.5..0.5 */
}

/* beat-synchronous chroma (treble and bass) from the peaks */
function beatChroma(P, tune, beats, sec) {
  var nB = beats.length, Ct = new Float32Array(nB * 12), Cb = new Float32Array(nB * 12), Et = new Float32Array(nB), Eb = new Float32Array(nB);
  var ibi = nB > 1 ? (beats[nB - 1] - beats[0]) / (nB - 1) : 0.5, bi = 0;
  for (var g = 0; g < P.nF; g++) {
    var t = g / P.fps - 0.05; /* lean a little late: the long window still hears the chord before */
    while (bi < nB - 1 && t >= beats[bi + 1]) bi++;
    if (t < beats[0] || bi >= nB) continue;
    var end = bi < nB - 1 ? beats[bi + 1] : Math.min(sec, beats[bi] + ibi); if (t >= end) continue;
    var o = g * P.MAXP;
    for (var i = 0; i < P.pN[g]; i++) {
      var f = P.pF[o + i]; if (f < 35 || f > 2600) continue;
      var p = hzToMidi(f) - tune, n = Math.round(p), d = p - n, w = Math.sqrt(P.pA[o + i]) * Math.pow(Math.cos(Math.PI * d), 2), pc = ((n % 12) + 12) % 12;
      if (f >= 90) { var wt = f < TLO ? (f - 90) / (TLO - 90) : f > 1800 ? (2600 - f) / 800 : 1; Ct[bi * 12 + pc] += w * wt; Et[bi] += w * wt; }
      if (f <= 280) { var wb = f < 45 ? (f - 35) / 10 : f > 200 ? (280 - f) / 80 : 1; Cb[bi * 12 + pc] += w * wb; Eb[bi] += w * wb; }
    }
  }
  return { Ct: Ct, Cb: Cb, Et: Et, Eb: Eb, nB: nB };
}

/* ───────── 3. chords ───────── */
/* emission scores per beat for the 120 chords and "no chord" */
function chordScores(BC, templ, isNotes) {
  var nB = BC.nB, S = new Float32Array(nB * (NSTATE + 1)), act = [], i, k;
  for (i = 0; i < nB; i++) if (BC.Et[i] > 0) act.push(BC.Et[i]);
  var mxE = act.length ? Math.max.apply(null, act) : 0, Eref = act.length ? medianOf(act.filter(function (e) { return e > 0.1 * mxE; })) : 1;
  var actB = []; for (i = 0; i < nB; i++) if (BC.Eb[i] > 0) actB.push(BC.Eb[i]);
  var mxB = actB.length ? Math.max.apply(null, actB) : 0, EbRef = actB.length ? medianOf(actB.filter(function (e) { return e > 0.1 * mxB; })) : 1;
  var c = new Float32Array(12), b = new Float32Array(12);
  for (i = 0; i < nB; i++) {
    var n = 0, o = i * 12, bm = 0, gm = 0, am = 0;
    for (k = 0; k < 12; k++) { c[k] = BC.Ct[o + k]; n += c[k] * c[k]; b[k] = BC.Cb[o + k]; if (b[k] > bm) bm = b[k]; }
    n = Math.sqrt(n);
    var r = Eref > 0 ? BC.Et[i] / Eref : 0, rb = EbRef > 0 ? BC.Eb[i] / EbRef : 0;
    if (n > 0) for (k = 0; k < 12; k++) c[k] /= n;
    for (k = 0; k < 12; k++) { gm += Math.log(c[k] + 0.02); am += c[k] + 0.02; }
    var flat = Math.exp(gm / 12) / (am / 12);       /* 1 = noise-like, small = a few clear notes */
    var bw = bm > 0 ? 0.12 * Math.min(1, rb / 0.3) : 0;
    var so = i * (NSTATE + 1);
    for (var s = 0; s < NSTATE; s++) { var to = s * 12, dot = 0; for (k = 0; k < 12; k++) dot += c[k] * templ[to + k];
      var root = (s / 10) | 0; S[so + s] = dot - QPEN[QUALS[s % 10]] + (bw ? bw * (b[root] / bm - 0.5) : 0); }
    S[so + NSTATE] = (n > 0 ? 0.55 : 2) + 0.6 * Math.max(0, 1 - r / (isNotes ? 0.05 : 0.15)) + (isNotes ? 0 : 0.5 * Math.max(0, flat - 0.55));
  }
  return S;
}

/* Viterbi: staying is free, a change costs `chg[i]` (bar-aware) plus a key cost for the chord changed to */
function viterbi(S, nB, chg, kpen, kappa) {
  var NS = NSTATE + 1, prev = new Float64Array(NS), cur = new Float64Array(NS), bp = new Int16Array(nB * NS), s;
  for (s = 0; s < NS; s++) prev[s] = kappa * S[s] - kpen[s];
  for (var i = 1; i < nB; i++) {
    var best = -Infinity, arg = 0; for (s = 0; s < NS; s++) if (prev[s] > best) { best = prev[s]; arg = s; }
    var so = i * NS;
    for (s = 0; s < NS; s++) { var stay = prev[s], move = best - chg[i] - kpen[s];
      if (stay >= move) { cur[s] = stay; bp[so + s] = s; } else { cur[s] = move; bp[so + s] = arg; }
      cur[s] += kappa * S[so + s]; }
    var t = prev; prev = cur; cur = t;
  }
  var path = new Int16Array(nB), bs = 0, bv = -Infinity; for (s = 0; s < NS; s++) if (prev[s] > bv) { bv = prev[s]; bs = s; }
  for (i = nB - 1; i >= 0; i--) { path[i] = bs; if (i > 0) bs = bp[i * NS + bs]; }
  return path;
}

var KK_MAJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
var KK_MIN = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
function pearson(a, b, rot) { var ma = 0, mb = 0, i; for (i = 0; i < 12; i++) { ma += a[i]; mb += b[i]; } ma /= 12; mb /= 12;
  var sab = 0, saa = 0, sbb = 0; for (i = 0; i < 12; i++) { var x = a[(i + rot) % 12] - ma, y = b[i] - mb; sab += x * y; saa += x * x; sbb += y * y; }
  return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : 0; }
function estimateKey(BC, path, beatDur, hint) {
  var Gc = new Float64Array(12), nB = BC.nB, i, k, mx = 0;
  for (i = 0; i < nB; i++) mx = Math.max(mx, BC.Et[i]);
  for (i = 0; i < nB; i++) { var o = i * 12, n = 0, nb = 0;
    for (k = 0; k < 12; k++) { n += BC.Ct[o + k] * BC.Ct[o + k]; nb += BC.Cb[o + k] * BC.Cb[o + k]; }
    n = Math.sqrt(n); nb = Math.sqrt(nb); var w = mx > 0 ? Math.min(1, 4 * BC.Et[i] / mx) : 0;
    for (k = 0; k < 12; k++) Gc[k] += w * beatDur[i] * ((n ? BC.Ct[o + k] / n : 0) + 0.5 * (nb ? BC.Cb[o + k] / nb : 0)); }
  var tot = 0, first = -1, last = -1; for (i = 0; i < nB; i++) if (path[i] !== NSTATE) { tot += beatDur[i]; if (first < 0) first = path[i]; last = path[i]; }
  var scores = [];
  for (var m = 0; m < 2; m++) for (var t = 0; t < 12; t++) {
    var corr = pearson(Gc, m ? KK_MIN : KK_MAJ, t), ton = 0, dom = 0;
    var isTonic = function (s) { if (s === NSTATE) return false; var r = (s / 10) | 0, q = QUALS[s % 10];
      return r === t && (m ? (q === "min" || q === "m7") : (q === "maj" || q === "7" || q === "maj7")); };
    for (i = 0; i < nB; i++) { var s = path[i]; if (s === NSTATE) continue; if (isTonic(s)) ton += beatDur[i];
      var r = (s / 10) | 0, q = QUALS[s % 10], maj = q === "maj" || q === "7";
      if ((r === (t + 7) % 12 && (maj || (m && (q === "min" || q === "m7")))) || (m && r === (t + 10) % 12 && maj)) dom += beatDur[i]; }
    ton = tot ? ton / tot : 0; dom = tot ? dom / tot : 0;
    var sc = corr + TONW * ton + 0.2 * dom + (first >= 0 && isTonic(first) ? FIRSTW : 0) + (last >= 0 && isTonic(last) ? 0.1 : 0);
    if (hint && hint.key === t && !!hint.minor === !!m) sc += 0.15;
    scores.push({ key: t, minor: !!m, s: sc });
  }
  scores.sort(function (a, b) { return b.s - a.s; });
  var b0 = scores[0], b1 = scores[1];
  return { key: b0.key, minor: b0.minor, conf: r2(clamp(0.35 + (b0.s - b1.s) * 2.5, 0, 1)), name: keyName(b0.key, b0.minor) };
}

/* the meter and where bar one falls: harmony changes, bass changes and low drums */
function findDownbeats(BC, path, lowAcc, forceNum) {
  var nB = BC.nB, feat = new Float64Array(nB), i, k;
  function cosWin(C, a0, a1, b0, b1) { var x = new Float64Array(12), y = new Float64Array(12), j;
    for (j = a0; j < a1; j++) for (k = 0; k < 12; k++) x[k] += C[j * 12 + k];
    for (j = b0; j < b1; j++) for (k = 0; k < 12; k++) y[k] += C[j * 12 + k];
    var d = 0, nx = 0, ny = 0; for (k = 0; k < 12; k++) { d += x[k] * y[k]; nx += x[k] * x[k]; ny += y[k] * y[k]; }
    return nx > 0 && ny > 0 ? d / Math.sqrt(nx * ny) : 1; }
  var la = 0; for (i = 0; i < nB; i++) la += lowAcc[i]; la = la / Math.max(1, nB) || 1;
  for (i = 1; i < nB - 1; i++) {
    var a0 = Math.max(0, i - 2), b1 = Math.min(nB, i + 2);
    feat[i] = (1 - cosWin(BC.Ct, a0, i, i, b1)) + 0.5 * (1 - cosWin(BC.Cb, a0, i, i, b1)) + 0.4 * (path[i] !== path[i - 1] ? 1 : 0) + 0.15 * lowAcc[i] / la;
  }
  var mean = 0; for (i = 0; i < nB; i++) mean += feat[i]; mean /= Math.max(1, nB);
  var res = {};
  [3, 4].forEach(function (M) { var best = -Infinity, ph = 0;
    for (var p = 0; p < M; p++) { var s = 0, c = 0; for (i = p; i < nB; i += M) { s += feat[i]; c++; } s = c ? s / c : 0; if (s > best) { best = s; ph = p; } }
    res[M] = { s: best - mean, ph: ph }; });
  var num = forceNum || (res[3].s > 1.35 * res[4].s && res[3].s > 0.05 ? 3 : 4);
  return { num: num, phase: res[num].ph };
}

function chordChangeCost(nB, num, phase, base) {
  var c = new Float64Array(nB);
  for (var i = 0; i < nB; i++) { var pos = ((i - phase) % num + num) % num;
    c[i] = base * (pos === 0 ? 0.55 : (num === 4 && pos === 2) ? 1.0 : 1.5); }
  return c;
}
function keyPenalty(key) {
  var k = new Float64Array(NSTATE + 1);
  for (var s = 0; s <= NSTATE; s++) k[s] = !key ? (s === NSTATE ? 0.3 : 0) : s === NSTATE ? 0.3 : (diatonic(s, key.key, key.minor) ? 0 : 0.9);
  return k;
}
function chordSegments(path, S, beats, endT, key) {
  var out = [], nB = beats.length, NS = NSTATE + 1;
  for (var i = 0; i < nB;) {
    var s = path[i], j = i, cs = 0;
    while (j < nB && path[j] === s) {
      var so = j * NS, mine = S[so + s], other = -Infinity, root = s === NSTATE ? -1 : (s / 10) | 0;
      for (var z = 0; z < NS; z++) { if (z === s) continue; var zr = z === NSTATE ? -1 : (z / 10) | 0;
        if (zr === root && z !== NSTATE && s !== NSTATE) continue; if (S[so + z] > other) other = S[so + z]; }
      cs += clamp((mine - other) / 0.12 + 0.5, 0, 1); j++; }
    var t0 = beats[i], t1 = j < nB ? beats[j] : endT, root = s === NSTATE ? -1 : (s / 10) | 0, q = s === NSTATE ? "N" : QUALS[s % 10];
    out.push({ t: r4(t0), d: r4(Math.max(0.01, t1 - t0)), root: root, q: q, name: chordName(root, q, key.key, key.minor), conf: r2(cs / (j - i)) });
    i = j;
  }
  return out;
}

/* ───────── 4. the bass line ───────── */
var BLO = 28, BHI = 64, NBP = BHI - BLO + 1;
async function bassSalience(P, tune, T) {
  var nF = P.nF, sal = new Float32Array(nF * NBP), low = new Float32Array(nF * NBP), en = new Float32Array(nF), up = new Float32Array(NBP), k;
  for (var g = 0; g < nF; g++) { var o = g * P.MAXP, so = g * NBP; up.fill(0);
    for (var i = 0; i < P.pN[g]; i++) { var f = P.pF[o + i]; if (f > 1300 || f < 30) continue;
      var a = Math.sqrt(P.pA[o + i]); if (f <= 300) en[g] += a;
      for (var h = 1; h <= 6; h++) { var p = hzToMidi(f / h) - tune; if (p < BLO - 1) break; if (p > BHI + 1) continue;
        var w = a * Math.pow(0.8, h - 1), n0 = Math.floor(p);
        for (var n = n0; n <= n0 + 1; n++) { if (n < BLO || n > BHI) continue; var d = Math.abs(p - n);
          if (d < 1) { var v = w * Math.pow(Math.cos(Math.PI * d / 2), 2); sal[so + n - BLO] += v; if (h > 1) up[n - BLO] += v; if (h === 1) low[so + n - BLO] += v; } } } }
    /* a very low note with no overtones at all is the kick drum's tail, not a bass: it barely counts */
    for (k = 0; k < NBP && BLO + k <= 35; k++) { var tot = sal[so + k]; if (tot > 0 && up[k] < 0.12 * tot) { sal[so + k] *= 0.25; low[so + k] *= 0.25; } }
    if ((g & 255) === 0 && T.due()) await T.yield(); }
  return { sal: sal, low: low, en: en };
}
function slotsOf(beats, endT, per) {
  var s = [], nB = beats.length;
  for (var i = 0; i < nB; i++) { var t0 = beats[i], t1 = i < nB - 1 ? beats[i + 1] : Math.min(endT, t0 + (nB > 1 ? beats[i] - beats[i - 1] : 0.5));
    for (var j = 0; j < per; j++) s.push(t0 + (t1 - t0) * j / per); }
  if (nB) s.push(nB > 1 ? Math.min(endT, beats[nB - 1] + (beats[nB - 1] - beats[nB - 2])) : beats[0] + 0.5);
  return s;
}
function bassLine(P, BS, beats, endT, ON, tune) {
  var slots = slotsOf(beats, endT, 4), nS = slots.length - 1; if (nS < 1) return [];
  var fps = P.fps, agg = new Float32Array(nS * NBP), fun = new Float32Array(NBP), E = new Float32Array(nS), Ein = new Float32Array(nS), Eout = new Float32Array(nS), i, k;
  function frameAt(t) { return Math.round(t * fps); }
  function enAt(t) { var f = t * fps, a = Math.floor(f), b = a + 1, w = f - a; a = clamp(a, 0, P.nF - 1); b = clamp(b, 0, P.nF - 1); return BS.en[a] * (1 - w) + BS.en[b] * w; }
  for (i = 0; i < nS; i++) {
    var a0 = frameAt(slots[i] + 0.08), a1 = Math.max(a0 + 1, frameAt(slots[i + 1] + 0.08)), c = 0;
    fun.fill(0);
    for (var g = a0; g < a1; g++) { if (g < 0 || g >= P.nF) continue; c++; E[i] += BS.en[g]; for (k = 0; k < NBP; k++) { agg[i * NBP + k] += BS.sal[g * NBP + k]; fun[k] += BS.low[g * NBP + k]; } }
    if (c) { E[i] /= c; for (k = 0; k < NBP; k++) agg[i * NBP + k] /= c; }
    /* the bass is the lowest note that is really there: if a clear fundamental an octave (or more) below the strongest
       candidate holds up, it wins (a guitar's low string an octave above the bass does not take the bass's place) */
    var am = 0, ak = -1, fm = 0; for (k = 0; k < NBP; k++) { if (agg[i * NBP + k] > am) { am = agg[i * NBP + k]; ak = k; } if (fun[k] > fm) fm = fun[k]; }
    for (k = 0; ak >= 0 && k < ak - 6; k++) if (fun[k] >= 0.2 * fm && agg[i * NBP + k] >= 0.35 * am && (ak - k) % 12 === 0) { agg[i * NBP + k] = am * 1.05; break; }
    Ein[i] = enAt(slots[i] + 0.1); Eout[i] = enAt(slots[i] - 0.07);
    var sm = 0; for (k = 0; k < NBP; k++) if (agg[i * NBP + k] > sm) sm = agg[i * NBP + k]; E[i] = sm;   /* how clearly a bass note sounds */
  }
  var act = []; for (i = 0; i < nS; i++) if (E[i] > 0) act.push(E[i]);
  if (!act.length) return [];
  var mx = Math.max.apply(null, act), Eref = medianOf(act.filter(function (e) { return e > 0.2 * mx; })) || 1;
  /* Viterbi over slots: state 0 = rest, 1.. = pitches */
  var NS = NBP + 1, prev = new Float64Array(NS), cur = new Float64Array(NS), bp = new Int16Array(nS * NS), em = new Float64Array(NS);
  function emis(i) { var v = E[i] / Eref, pv = 1 / (1 + Math.exp(-4 * (Math.log(v + 1e-6) + 1.5))), o = i * NBP, m = 0;
    for (k = 0; k < NBP; k++) if (agg[o + k] > m) m = agg[o + k];
    em[0] = Math.log(1 - pv + 1e-6);
    for (k = 0; k < NBP; k++) em[k + 1] = Math.log(pv + 1e-6) + (m > 0 ? 3 * Math.log((agg[o + k] + 1e-9) / m) : -10); }
  emis(0); for (k = 0; k < NS; k++) prev[k] = em[k];
  for (i = 1; i < nS; i++) { emis(i);
    var best = -Infinity, arg = 0; for (k = 1; k < NS; k++) if (prev[k] > best) { best = prev[k]; arg = k; }
    for (k = 0; k < NS; k++) { var stay = prev[k], v, b;
      if (k === 0) { v = Math.max(stay, best - 0.7); b = stay >= best - 0.7 ? 0 : arg; }
      else { var fromRest = prev[0] - 0.7, move = best - 1.6; v = stay; b = k;
        if (fromRest > v) { v = fromRest; b = 0; } if (arg !== k && move > v) { v = move; b = arg; } }
      cur[k] = v + em[k]; bp[i * NS + k] = b; }
    var t = prev; prev = cur; cur = t; }
  var path = new Int16Array(nS), bs = 0, bv = -Infinity; for (k = 0; k < NS; k++) if (prev[k] > bv) { bv = prev[k]; bs = k; }
  for (i = nS - 1; i >= 0; i--) { path[i] = bs; if (i > 0) bs = bp[i * NS + bs]; }
  /* notes: a new note where the pitch changes, or where the low energy rises again (a re-struck string) */
  /* this very note (its own first harmonics, at the fine time step): how much it grows at a slot's start, and whether it
     dipped just before (a re-struck string), so a kick drum on a held note does not split it */
  function att(j, m) { var s0 = slots[j], lo = spanStat(ON, s0 - 0.05, s0 + 0.02, m, tune, 3, "min"), hi = spanStat(ON, s0, s0 + 0.09, m, tune, 3, "max");
    return { lo: lo, hi: hi, pre: spanStat(ON, s0 - 0.14, s0 - 0.07, m, tune, 3, "mean") }; }
  var notes = [];
  for (i = 0; i < nS;) { var p = path[i]; if (!p) { i++; continue; }
    var mm = BLO + p - 1;
    /* the long window hears a note a little early: start it where it really grows */
    if (i + 1 < nS && path[i + 1] === p) { var A0 = att(i, mm), A1 = att(i + 1, mm); if (A1.hi - A1.lo > 1.3 * (A0.hi - A0.lo)) i++; }
    var j = i + 1; while (j < nS && path[j] === p) { var A = att(j, mm); if (A.hi > 1.5 * A.lo && A.lo < 0.8 * A.pre) break; j++; }
    var conf = 0; for (var z = i; z < j; z++) { var o = z * NBP, s1 = agg[o + p - 1], s2 = 0;
      for (k = 0; k < NBP; k++) if (Math.abs(k - (p - 1)) > 1 && agg[o + k] > s2) s2 = agg[o + k];
      var vv = E[z] / Eref; conf += clamp(2 * (s1 / (s1 + s2 + 1e-9)) - 1, 0, 1) * clamp(vv * 1.5, 0, 1); }
    notes.push({ t: r4(slots[i]), d: r4(slots[j] - slots[i]), m: BLO + p - 1, conf: r2(conf / (j - i)) });
    i = j; }
  return notes;
}

/* ───────── 5. the melody ───────── */
var MLO = 45, MBINS = 470, MK = 4;     /* 10-cent bins from MIDI 45 (110 Hz) up to MIDI 92 (1661 Hz) */
async function melodySalience(P, tune, T, prog) {
  var nF = P.nF, cP = new Float32Array(nF * MK), cV = new Float32Array(nF * MK), cN = new Uint8Array(nF), sal = new Float32Array(MBINS), top = new Float32Array(nF);
  var ker = new Float32Array(21); for (var d = -10; d <= 10; d++) ker[d + 10] = Math.pow(Math.cos(Math.PI / 2 * d / 10), 2);
  var hw = new Float32Array(9); for (var h = 1; h <= 8; h++) hw[h] = Math.pow(0.8, h - 1);
  for (var g = 0; g < nF; g++) {
    sal.fill(0); var o = g * P.MAXP, mx = 0, i;
    for (i = 0; i < P.pN[g]; i++) if (P.pA[o + i] > mx) mx = P.pA[o + i];
    for (i = 0; i < P.pN[g]; i++) { var f = P.pF[o + i], a = P.pA[o + i]; if (f < 110 || f > 4200 || a < mx * 0.01) continue;
      var base = (hzToMidi(f) - tune - MLO) * 10;
      for (h = 1; h <= 8; h++) { var c = base - 120 * log2(h); if (c < -10) break; if (c > MBINS + 10) continue;
        var ci = Math.round(c), w = a * hw[h];
        for (d = -10; d <= 10; d++) { var b = ci + d; if (b >= 0 && b < MBINS) sal[b] += w * ker[d + 10]; } } }
    var n = 0;   /* the strongest few peaks */
    for (i = 1; i < MBINS - 1; i++) { var v = sal[i]; if (v > 0 && v > sal[i - 1] && v >= sal[i + 1]) {
        var den = sal[i - 1] - 2 * v + sal[i + 1], dl = den < 0 ? clamp(0.5 * (sal[i - 1] - sal[i + 1]) / den, -0.5, 0.5) : 0;
        var pm = MLO + (i + dl) / 10, pos = n < MK ? n : -1;
        if (pos < 0) { var mi = 0; for (var z = 1; z < MK; z++) if (cV[g * MK + z] < cV[g * MK + mi]) mi = z; if (cV[g * MK + mi] < v) pos = mi; }
        if (pos >= 0) { cP[g * MK + pos] = pm; cV[g * MK + pos] = v; if (n < MK) n++; } } }
    cN[g] = n; for (i = 0; i < n; i++) if (cV[g * MK + i] > top[g]) top[g] = cV[g * MK + i];
    if ((g & 127) === 0) { prog(g / nF); if (T.due()) await T.yield(); }
  }
  return { cP: cP, cV: cV, cN: cN, top: top };
}
function melodyLine(P, MS, beats, endT, ON, tune) {
  var nF = P.nF, fps = P.fps, act = [], g, i, j;
  for (g = 0; g < nF; g++) if (MS.top[g] > 0) act.push(MS.top[g]);
  if (act.length < 10) return [];
  var ref = percentile(act, 0.9), theta = 0.22;
  var NS = MK + 1, prev = new Float64Array(NS), cur = new Float64Array(NS), bp = new Uint8Array(nF * NS), em = new Float64Array(NS);
  function emis(g) { em[MK] = Math.log(theta); for (var k = 0; k < MK; k++) { var v = k < MS.cN[g] ? MS.cV[g * MK + k] : 0;
      em[k] = v > 0 ? Math.log(v / ref) + 0.25 * (MS.cP[g * MK + k] - 66) / 12 : -30; } }
  emis(0); for (i = 0; i < NS; i++) prev[i] = em[i];
  for (g = 1; g < nF; g++) { emis(g);
    for (j = 0; j < NS; j++) { var best = -Infinity, arg = 0;
      for (i = 0; i < NS; i++) { var tr;
        if (i === MK && j === MK) tr = 0; else if (i === MK || j === MK) tr = -2;
        else { var dp = Math.abs(MS.cP[g * MK + j] - MS.cP[(g - 1) * MK + i]); tr = dp > 12.5 ? -12 : -0.45 * Math.max(0, dp - 0.3); }
        var v = prev[i] + tr; if (v > best) { best = v; arg = i; } }
      cur[j] = best + em[j]; bp[g * NS + j] = arg; }
    var t = prev; prev = cur; cur = t; }
  var st = 0, bv = -Infinity; for (i = 0; i < NS; i++) if (prev[i] > bv) { bv = prev[i]; st = i; }
  var pitch = new Float32Array(nF), val = new Float32Array(nF);
  for (g = nF - 1; g >= 0; g--) { if (st < MK) { pitch[g] = MS.cP[g * MK + st]; val[g] = MS.cV[g * MK + st]; } if (g > 0) st = bp[g * NS + st]; }
  /* semitones, smoothed by a median of five frames */
  var q = new Int16Array(nF), win = new Float64Array(5);
  for (g = 0; g < nF; g++) { if (!pitch[g]) { q[g] = 0; continue; } var c = 0;
    for (j = g - 2; j <= g + 2; j++) if (j >= 0 && j < nF && pitch[j]) win[c++] = pitch[j];
    q[g] = Math.round(selectK(win, c, c >> 1)); }
  var notes = [];
  for (g = 0; g < nF;) { if (!q[g]) { g++; continue; } var m = q[g], e = g; while (e < nF && q[e] === m) e++;
    /* split a held run where the note dips and rises again (the same note played twice), heard at the fine time step */
    var T0 = g / fps, T1 = e / fps, cuts = [T0], fst = 1 / ON.fps, cf = 0;
    for (j = g; j < e; j++) cf += Math.min(1, val[j] / ref); cf /= (e - g);
    if (T1 - T0 > 0.16) { var prevE = noteEnergy(ON, T0, m, tune, 2), curE = noteEnergy(ON, T0 + fst, m, tune, 2);
      for (var u = T0 + fst; u < T1 - 0.07; u += fst) { var nxt = noteEnergy(ON, u + fst, m, tune, 2);
        if (curE <= prevE && curE < nxt && u - cuts[cuts.length - 1] >= 0.07) {
          var bef = spanStat(ON, Math.max(cuts[cuts.length - 1], u - 0.1), u, m, tune, 2, "max"), aft = spanStat(ON, u, Math.min(T1, u + 0.1), m, tune, 2, "max");
          if (curE < 0.6 * bef && aft > 1.6 * curE) cuts.push(u + 0.012); }
        prevE = curE; curE = nxt; } }
    cuts.push(T1);
    for (i = 0; i < cuts.length - 1; i++) { if (cuts[i + 1] - cuts[i] < 0.06) continue; notes.push({ t: cuts[i], e: cuts[i + 1], m: m, conf: cf }); }
    g = e; }
  /* snap to a twelfth of a beat; join neighbours that land on the same note */
  var bt = beats, nB = bt.length;
  function toBeat(t) { if (nB < 2) return t * 2; var i = 0; if (t <= bt[0]) return (t - bt[0]) / (bt[1] - bt[0]);
    if (t >= bt[nB - 1]) return nB - 1 + (t - bt[nB - 1]) / (bt[nB - 1] - bt[nB - 2]);
    var lo = 0, hi = nB - 1; while (hi - lo > 1) { i = (lo + hi) >> 1; if (bt[i] <= t) lo = i; else hi = i; } return lo + (t - bt[lo]) / (bt[lo + 1] - bt[lo]); }
  function fromBeat(b) { if (nB < 2) return b / 2; if (b <= 0) return bt[0] + b * (bt[1] - bt[0]); if (b >= nB - 1) return bt[nB - 1] + (b - nB + 1) * (bt[nB - 1] - bt[nB - 2]);
    var i = Math.floor(b); return bt[i] + (b - i) * (bt[i + 1] - bt[i]); }
  var out = [];
  notes.forEach(function (n) { var b0 = Math.round(toBeat(n.t) * 12) / 12, b1 = Math.round(toBeat(n.e) * 12) / 12; if (b1 <= b0) b1 = b0 + 1 / 12;
    var t0 = Math.max(0, fromBeat(b0)), t1 = Math.min(endT, fromBeat(b1)); if (t1 - t0 < 0.03) return;
    var L = out[out.length - 1];
    if (L && t0 < L.t + L.d - 0.001) { if (L.m === n.m) { L.d = r4(Math.max(L.t + L.d, t1) - L.t); return; } L.d = r4(Math.max(0.03, t0 - L.t)); }
    out.push({ t: r4(t0), d: r4(t1 - t0), m: n.m, conf: r2(n.conf) }); });
  return out;
}

/* ───────── the whole listening, on 22050 Hz mono samples ───────── */
async function analyzePCM(x, opts) {
  opts = opts || {};
  var T = new Ticker(opts.budget || 0), cb = opts.onProgress, lastP = -1;
  function report(p, key) { p = clamp(p, 0, 1); if (p < lastP) p = lastP; lastP = p; if (cb) try { cb(r4(p), key); } catch (e) {} }
  function stage(a, b, key) { report(a, key); return function (f) { report(a + (b - a) * f, key); }; }
  var sec = x.length / SR, i, peak = 0;
  for (i = 0; i < x.length; i++) { var av = x[i] < 0 ? -x[i] : x[i]; if (av > peak) peak = av; }
  if (peak > 0) { var gn = 0.9 / peak; for (i = 0; i < x.length; i++) x[i] *= gn; }

  /* beat */
  var ON = await onsetEnvelope(x, T, stage(0.05, 0.17, "beat"));
  var period = estimatePeriod(ON.O, ON.fps);
  if (T.due()) await T.yield();
  var beats = trackBeats(ON.O, ON.R, ON.fps, period);
  if (T.due()) await T.yield();
  if (beats.length < 4) { var p0 = 60 / (60 * ON.fps / period || 120); beats = []; for (var bt0 = 0; bt0 < sec; bt0 += p0) beats.push(bt0); }
  var bpm = tempoOf(beats) || 60 * ON.fps / period;
  var nB = beats.length, ibi = nB > 1 ? (beats[nB - 1] - beats[0]) / (nB - 1) : 0.5, endT = Math.min(sec, beats[nB - 1] + ibi);
  var lowAcc = new Float64Array(nB);
  for (i = 0; i < nB; i++) { var fr = Math.round(beats[i] * ON.fps), m = 0; for (var z = fr - 2; z <= fr + 2; z++) if (z >= 0 && z < ON.Ol.length && ON.Ol[z] > m) m = ON.Ol[z]; lowAcc[i] = m; }
  report(0.2, "beat");

  /* key (and the harmonic spectrum everything else hears) */
  var P = await harmonicPeaks(x, T, stage(0.2, 0.55, "key"));
  var tune = estimateTuning(P); if (T.due()) await T.yield();
  var BC = beatChroma(P, tune, beats, sec); if (T.due()) await T.yield();
  var beatDur = new Float64Array(nB); for (i = 0; i < nB; i++) beatDur[i] = (i < nB - 1 ? beats[i + 1] : endT) - beats[i];
  var S = chordScores(BC, TEMPL_AUDIO, false), kappa = 20;
  if (T.due()) await T.yield();
  var path1 = viterbi(S, nB, chordChangeCost(nB, 1, 0, 2.4), keyPenalty(null), kappa);
  var key = estimateKey(BC, path1, beatDur);
  report(0.6, "key"); if (T.due()) await T.yield();

  /* chords, with bar one */
  report(0.62, "chords");
  var DB = findDownbeats(BC, path1, lowAcc);
  var path = viterbi(S, nB, chordChangeCost(nB, DB.num, DB.phase, 2.4), keyPenalty(key), kappa);
  var key2 = estimateKey(BC, path, beatDur, key); if (key2.key !== key.key || key2.minor !== key.minor) { key = key2; path = viterbi(S, nB, chordChangeCost(nB, DB.num, DB.phase, 2.4), keyPenalty(key), kappa); }
  var chords = chordSegments(path, S, beats, endT, key);
  var downbeats = []; for (i = DB.phase; i < nB; i += DB.num) downbeats.push(r4(beats[i]));
  report(0.7, "chords"); if (T.due()) await T.yield();

  /* bass */
  report(0.72, "bass");
  var BS = await bassSalience(P, tune, T); if (T.due()) await T.yield();
  var bass = bassLine(P, BS, beats, endT, ON, tune); BS = null; if (T.due()) await T.yield();
  report(0.78, "bass"); if (T.due()) await T.yield();

  /* melody */
  var MS = await melodySalience(P, tune, T, stage(0.8, 0.97, "melody"));
  var melody = melodyLine(P, MS, beats, endT, ON, tune); MS = null;
  report(1, "done");
  return {
    v: 1, src: "audio", name: opts.name || "", sec: r4(sec), sr: SR, bpm: Math.round(bpm * 10) / 10,
    beats: beats.map(r4), downbeats: downbeats, meter: { num: DB.num, den: 4 }, key: key, tuning: Math.round(tune * 100),
    chords: chords, bass: bass, melody: melody, tracks: [],
    notes: melody.map(function (n) { return { t: n.t, d: n.d, m: n.m, v: Math.round(40 + 87 * n.conf) }; })
  };
}

/* ───────── MIDI files ───────── */
var GM = ("Acoustic Grand Piano|Bright Acoustic Piano|Electric Grand Piano|Honky-tonk Piano|Electric Piano 1|Electric Piano 2|Harpsichord|Clavinet|" +
  "Celesta|Glockenspiel|Music Box|Vibraphone|Marimba|Xylophone|Tubular Bells|Dulcimer|Drawbar Organ|Percussive Organ|Rock Organ|Church Organ|" +
  "Reed Organ|Accordion|Harmonica|Tango Accordion|Acoustic Guitar (nylon)|Acoustic Guitar (steel)|Electric Guitar (jazz)|Electric Guitar (clean)|" +
  "Electric Guitar (muted)|Overdriven Guitar|Distortion Guitar|Guitar Harmonics|Acoustic Bass|Electric Bass (finger)|Electric Bass (pick)|" +
  "Fretless Bass|Slap Bass 1|Slap Bass 2|Synth Bass 1|Synth Bass 2|Violin|Viola|Cello|Contrabass|Tremolo Strings|Pizzicato Strings|" +
  "Orchestral Harp|Timpani|String Ensemble 1|String Ensemble 2|Synth Strings 1|Synth Strings 2|Choir Aahs|Voice Oohs|Synth Choir|Orchestra Hit|" +
  "Trumpet|Trombone|Tuba|Muted Trumpet|French Horn|Brass Section|Synth Brass 1|Synth Brass 2|Soprano Sax|Alto Sax|Tenor Sax|Baritone Sax|" +
  "Oboe|English Horn|Bassoon|Clarinet|Piccolo|Flute|Recorder|Pan Flute|Blown Bottle|Shakuhachi|Whistle|Ocarina|Lead 1 (square)|" +
  "Lead 2 (sawtooth)|Lead 3 (calliope)|Lead 4 (chiff)|Lead 5 (charang)|Lead 6 (voice)|Lead 7 (fifths)|Lead 8 (bass + lead)|Pad 1 (new age)|" +
  "Pad 2 (warm)|Pad 3 (polysynth)|Pad 4 (choir)|Pad 5 (bowed)|Pad 6 (metallic)|Pad 7 (halo)|Pad 8 (sweep)|FX 1 (rain)|FX 2 (soundtrack)|" +
  "FX 3 (crystal)|FX 4 (atmosphere)|FX 5 (brightness)|FX 6 (goblins)|FX 7 (echoes)|FX 8 (sci-fi)|Sitar|Banjo|Shamisen|Koto|Kalimba|Bagpipe|" +
  "Fiddle|Shanai|Tinkle Bell|Agogo|Steel Drums|Woodblock|Taiko Drum|Melodic Tom|Synth Drum|Reverse Cymbal|Guitar Fret Noise|Breath Noise|" +
  "Seashore|Bird Tweet|Telephone Ring|Helicopter|Applause|Gunshot").split("|");

function u8Of(ab) { if (ab instanceof Uint8Array) return ab; if (ab && ab.buffer instanceof ArrayBuffer && ab.byteLength != null && !(ab instanceof ArrayBuffer)) return new Uint8Array(ab.buffer, ab.byteOffset, ab.byteLength); return new Uint8Array(ab); }
function findMThd(u) { for (var i = 0; i + 4 <= Math.min(u.length, 4096); i++) if (u[i] === 0x4D && u[i + 1] === 0x54 && u[i + 2] === 0x68 && u[i + 3] === 0x64) return i; return -1; }
function isMidi(ab) { try { var u = u8Of(ab); var i = findMThd(u); return i === 0 || (i > 0 && u[0] === 0x52 && u[1] === 0x49 && u[2] === 0x46 && u[3] === 0x46); } catch (e) { return false; } }

function parseSMF(ab) {
  var u = u8Of(ab), p = findMThd(u); if (p < 0) throw new Error("not a MIDI file");
  function u32(i) { return ((u[i] << 24) >>> 0) + (u[i + 1] << 16) + (u[i + 2] << 8) + u[i + 3]; }
  function u16(i) { return (u[i] << 8) | u[i + 1]; }
  var hl = u32(p + 4), fmt = u16(p + 8), ntr = u16(p + 10), div = u16(p + 12), pos = p + 8 + hl, tracks = [], seq = 0;
  while (pos + 8 <= u.length && tracks.length < Math.max(ntr, 1) + 64) {
    var id = String.fromCharCode(u[pos], u[pos + 1], u[pos + 2], u[pos + 3]), len = u32(pos + 4), q = pos + 8, end = Math.min(u.length, q + len);
    pos = q + len; if (id !== "MTrk") continue;
    var ev = [], tick = 0, run = 0, ti = tracks.length;
    while (q < end) {
      var d = 0, b; do { b = u[q++]; d = (d << 7) | (b & 0x7f); } while (b & 0x80 && q < end); tick += d;
      var st = u[q]; if (st >= 0x80) q++; else st = run;
      if (st === 0xFF) { var ty = u[q++], L = 0; do { b = u[q++]; L = (L << 7) | (b & 0x7f); } while (b & 0x80 && q < end);
        ev.push({ tick: tick, tr: ti, seq: seq++, meta: ty, data: u.subarray(q, Math.min(end, q + L)) }); q += L; if (ty === 0x2F) break; continue; }
      if (st === 0xF0 || st === 0xF7) { var L2 = 0; do { b = u[q++]; L2 = (L2 << 7) | (b & 0x7f); } while (b & 0x80 && q < end); q += L2; continue; }
      if (st < 0x80) { q++; continue; }     /* a stray data byte with nothing to run on */
      run = st; var hi = st & 0xF0, ch = st & 0x0F, a1 = u[q++], a2 = (hi === 0xC0 || hi === 0xD0) ? 0 : u[q++];
      ev.push({ tick: tick, tr: ti, seq: seq++, type: hi, ch: ch, a: a1 & 0x7f, b: a2 & 0x7f });
    }
    tracks.push(ev);
  }
  return { fmt: fmt, ntr: ntr, div: div, tracks: tracks };
}

function fromMidi(ab, opts) {
  opts = opts || {};
  var smf = parseSMF(ab), all = [], i;
  smf.tracks.forEach(function (t) { for (var j = 0; j < t.length; j++) all.push(t[j]); });
  all.sort(function (a, b) { return a.tick - b.tick || a.seq - b.seq; });
  var smpte = smf.div & 0x8000, tpq = smpte ? 0 : smf.div || 480, tickSec;
  /* the tempo map */
  var tempos = [{ tick: 0, us: 500000 }];
  all.forEach(function (e) { if (e.meta === 0x51 && e.data.length >= 3) { var us = (e.data[0] << 16) | (e.data[1] << 8) | e.data[2];
    if (e.tick === tempos[tempos.length - 1].tick) tempos[tempos.length - 1].us = us; else tempos.push({ tick: e.tick, us: us }); } });
  var tsec = [0]; for (i = 1; i < tempos.length; i++) tsec.push(tsec[i - 1] + (tempos[i].tick - tempos[i - 1].tick) * tempos[i - 1].us / 1e6 / tpq);
  if (smpte) { var fps = 256 - (smf.div >> 8), tpf = smf.div & 0xFF; if (fps === 29) fps = 29.97; tickSec = function (t) { return t / (fps * tpf); }; }
  else tickSec = function (t) { var k = tempos.length - 1; while (k > 0 && tempos[k].tick > t) k--; return tsec[k] + (t - tempos[k].tick) * tempos[k].us / 1e6 / tpq; };
  /* names, meter, key signature */
  var names = {}, inst = {}, sigs = [], ksig = null, lastTick = 0;
  all.forEach(function (e) { if (e.tick > lastTick) lastTick = e.tick;
    if (e.meta === 0x03 && !names[e.tr]) names[e.tr] = textOf(e.data);
    if (e.meta === 0x04 && !inst[e.tr]) inst[e.tr] = textOf(e.data);
    if (e.meta === 0x58 && e.data.length >= 2) sigs.push({ tick: e.tick, num: e.data[0] || 4, den: Math.pow(2, e.data[1]) || 4 });
    if (e.meta === 0x59 && e.data.length >= 2 && !ksig) { var sf = e.data[0] > 127 ? e.data[0] - 256 : e.data[0]; ksig = { key: (((sf * 7) % 12 + 12) % 12 + (e.data[1] ? 9 : 0)) % 12, minor: !!e.data[1] }; } });
  /* notes: on/off by track, channel and pitch; a held pedal (CC64) keeps them sounding until it lifts */
  var open = {}, held = {}, pedal = new Uint8Array(16), prog = new Int16Array(16).fill(-1), groups = {}, order = [];
  function grp(tr, ch) { var k = tr * 16 + ch; if (!groups[k]) { groups[k] = { tr: tr, ch: ch, program: -1, notes: [] }; order.push(k); } return groups[k]; }
  function close(n, tick) { n.end = tick; }
  all.forEach(function (e) {
    if (e.type == null) return;
    var ch = e.ch;
    if (e.type === 0xC0) { prog[ch] = e.a; return; }
    if (e.type === 0xB0 && e.a === 64) { var down = e.b >= 64;
      if (!down && pedal[ch]) { (held[ch] || []).forEach(function (n) { close(n, e.tick); }); held[ch] = []; }
      pedal[ch] = down ? 1 : 0; return; }
    if (e.type === 0x90 && e.b > 0) {
      var hl = held[ch] || []; for (var j = hl.length - 1; j >= 0; j--) if (hl[j].m === e.a) { close(hl[j], e.tick); hl.splice(j, 1); }
      var g = grp(e.tr, ch); if (g.program < 0) g.program = prog[ch];
      var n = { tick: e.tick, m: e.a, v: e.b, end: -1 }; g.notes.push(n);
      var k = e.tr * 2048 + ch * 128 + e.a; (open[k] = open[k] || []).push(n); return; }
    if (e.type === 0x80 || (e.type === 0x90 && e.b === 0)) {
      var k2 = e.tr * 2048 + ch * 128 + e.a, q = open[k2]; if (!q || !q.length) return;
      var nn = q.shift(); if (pedal[ch]) (held[ch] = held[ch] || []).push(nn); else close(nn, e.tick); }
  });
  order.forEach(function (k) { groups[k].notes.forEach(function (n) { if (n.end < 0) n.end = Math.max(n.tick, lastTick); }); });
  var tracks = [], sec = 0;
  order.forEach(function (k) { var g = groups[k]; if (!g.notes.length) return; var drums = g.ch === 9;
    var nm = names[g.tr] && !(smf.tracks.length === 1 && order.length > 1) ? names[g.tr] : "";
    var pn = drums ? "Drums" : g.program >= 0 ? GM[g.program] : GM[0];
    var notes = g.notes.map(function (n) { var t0 = tickSec(n.tick), t1 = tickSec(n.end); if (t1 > sec) sec = t1; return { t: r4(t0), d: r4(Math.max(0, t1 - t0)), m: n.m, v: n.v }; });
    notes.sort(function (a, b) { return a.t - b.t || a.m - b.m; });
    tracks.push({ name: nm || inst[g.tr] || pn, ch: g.ch + 1, program: g.program, programName: pn, drums: drums, notes: notes }); });
  sec = Math.max(sec, tickSec(lastTick));
  /* beats and bars from the ticks (a beat is the time signature's note value) */
  var bpm = smpte ? 120 : 60e6 / (tempos.find(function (t) { return t.tick === 0; }) || tempos[0]).us;
  var beats = [], downbeats = [], sig0 = sigs.length ? sigs.filter(function (s) { return s.tick === 0; })[0] || sigs[0] : { num: 4, den: 4 };
  if (!smpte) { var tick = 0, si = 0, sigsS = sigs.slice().sort(function (a, b) { return a.tick - b.tick; }), cur = { num: 4, den: 4 };
    while (tickSec(tick) < sec - 1e-6 || beats.length < 1) {
      while (si < sigsS.length && sigsS[si].tick <= tick) cur = sigsS[si++];
      var bt = tpq * 4 / cur.den; downbeats.push(r4(tickSec(tick)));
      for (var b = 0; b < cur.num; b++) { var tt = tick + b * bt; if (tickSec(tt) < sec - 1e-6 || !beats.length) beats.push(r4(tickSec(tt))); }
      tick += bt * cur.num; if (beats.length > 200000) break; }
  } else { var bp = 60 / bpm; for (var tb = 0, c2 = 0; tb < sec || !beats.length; tb += bp, c2++) { beats.push(r4(tb)); if (c2 % 4 === 0) downbeats.push(r4(tb)); } }
  /* the notes everyone plays, the bass line and the melody */
  var pitched = tracks.filter(function (t) { return !t.drums; }), allNotes = [];
  pitched.forEach(function (t) { t.notes.forEach(function (n) { allNotes.push(n); }); });
  allNotes.sort(function (a, b) { return a.t - b.t || a.m - b.m; });
  function stats(t) { var s = 0, ov = 0; t.notes.forEach(function (n, j) { s += n.m; var nx = t.notes[j + 1]; if (nx && nx.t < n.t + n.d * 0.7 && nx.t - n.t > 0.02) ov++;
      if (nx && Math.abs(nx.t - n.t) <= 0.02) ov++; }); return { mean: s / t.notes.length, poly: ov / t.notes.length }; }
  pitched.forEach(function (t) { var s = stats(t); t._mean = s.mean; t._poly = s.poly; });
  var bassT = pitched.filter(function (t) { return (t.program >= 32 && t.program <= 39) || /bass|bajo/i.test(t.name); }).sort(function (a, b) { return b.notes.length - a.notes.length; })[0];
  if (!bassT) bassT = pitched.filter(function (t) { return t._mean < 52 && t.notes.length >= 4; }).sort(function (a, b) { return a._mean - b._mean; })[0];
  var bass = mono(bassT ? bassT.notes : allNotes.filter(function (n) { return n.m < 55; }), false);
  var rest = pitched.filter(function (t) { return t !== bassT; });
  var melT = rest.filter(function (t) { return /melod|lead|vocal|voice|voz|canto|solo|tune|tema/i.test(t.name); }).sort(function (a, b) { return b.notes.length - a.notes.length; })[0];
  if (!melT) melT = rest.filter(function (t) { return t._poly <= 0.35 && t.notes.length >= 8; }).sort(function (a, b) { return b._mean - a._mean; })[0];
  var melSrc = melT ? melT.notes : []; if (!melT) rest.forEach(function (t) { t.notes.forEach(function (n) { melSrc.push(n); }); });
  var melody = mono(melSrc, true);
  pitched.forEach(function (t) { delete t._mean; delete t._poly; });
  /* chords from the notes, beat by beat, with the same chord vocabulary and smoothing as for audio */
  var nB = beats.length, endT = sec, BC = { nB: nB, Ct: new Float32Array(nB * 12), Cb: new Float32Array(nB * 12), Et: new Float32Array(nB), Eb: new Float32Array(nB) };
  function beatIdx(t) { var lo = 0, hi = nB - 1; if (t < beats[0]) return 0; while (hi > lo) { var mid = (lo + hi + 1) >> 1; if (beats[mid] <= t) lo = mid; else hi = mid - 1; } return lo; }
  function addNotes(list, C, E) { list.forEach(function (n) { var t1 = n.t + n.d, bi = beatIdx(n.t);
    for (var j = bi; j < nB && beats[j] < t1; j++) { var b0 = beats[j], b1 = j < nB - 1 ? beats[j + 1] : endT, ov = Math.min(t1, b1) - Math.max(n.t, b0);
      if (ov > 0) { var w = ov * Math.sqrt((n.v || 100) / 127); C[j * 12 + n.m % 12] += w; E[j] += w; } } }); }
  addNotes(allNotes, BC.Ct, BC.Et); addNotes(bass.map(function (n) { return { t: n.t, d: n.d, m: n.m, v: 100 }; }), BC.Cb, BC.Eb);
  var beatDur = new Float64Array(nB); for (i = 0; i < nB; i++) beatDur[i] = (i < nB - 1 ? beats[i + 1] : endT) - beats[i];
  var meter = { num: sig0.num, den: sig0.den }, S = chordScores(BC, TEMPL_NOTES, true), kappa = 20;
  var path1 = viterbi(S, nB, chordChangeCost(nB, 1, 0, 2.4), keyPenalty(null), kappa);
  var key = estimateKey(BC, path1, beatDur, ksig);
  var path = viterbi(S, nB, chordChangeCost(nB, meter.num, 0, 2.4), keyPenalty(key), kappa);
  var chords = chordSegments(path, S, beats, Math.max(endT, beats[nB - 1] || 0), key).map(function (c) { c.conf = c.root < 0 ? 1 : Math.max(c.conf, 0.9); return c; });
  return {
    v: 1, src: "midi", name: opts.name || names[0] || "", sec: r4(sec), sr: SR, bpm: Math.round(bpm * 100) / 100,
    beats: beats, downbeats: downbeats, meter: meter, key: key, tuning: 0, chords: chords,
    bass: bass.map(function (n) { return { t: n.t, d: n.d, m: n.m, conf: 1 }; }), melody: melody.map(function (n) { return { t: n.t, d: n.d, m: n.m, conf: 1 }; }),
    tracks: tracks, notes: allNotes.map(function (n) { return { t: n.t, d: n.d, m: n.m, v: n.v }; })
  };
}
function textOf(d) { var s = ""; for (var i = 0; i < d.length; i++) s += String.fromCharCode(d[i]); try { s = decodeURIComponent(escape(s)); } catch (e) {} return s.replace(/\0/g, "").trim(); }
/* one note at a time: the highest (melody) or the lowest (bass) of notes struck together; each ends where the next begins */
function mono(list, high) {
  var s = list.slice().sort(function (a, b) { return a.t - b.t || (high ? b.m - a.m : a.m - b.m); }), out = [];
  for (var i = 0; i < s.length; i++) { var n = s[i], L = out[out.length - 1];
    if (L && n.t - L.t < 0.02) continue;
    if (L && L.t + L.d > n.t) L.d = r4(n.t - L.t);
    out.push({ t: n.t, d: n.d, m: n.m, v: n.v }); }
  return out;
}

/* ───────── on the page: open the file, then listen in a worker ───────── */
var scriptURL = (function () { try { var c = G.document && G.document.currentScript; if (c && c.src) return c.src; } catch (e) {}
  try { if (G.location && G.WorkerGlobalScope) return G.location.href; } catch (e) {} return ""; })();
function workerURL() { if (AOGLearn.workerURL) return AOGLearn.workerURL; if (!scriptURL) return "aog-learn-worker.js";
  var u = scriptURL.split("#")[0], q = u.indexOf("?"), base = q >= 0 ? u.slice(0, q) : u, qs = q >= 0 ? u.slice(q) : "";
  return base.replace(/aog-learn(\.min)?\.js$/, "aog-learn-worker.js") + qs; }

function OAC() { return G.OfflineAudioContext || G.webkitOfflineAudioContext; }
function decode(ab) {
  var C = OAC(); if (!C) return Promise.reject(new Error("no audio decoder"));
  var ctx = new C(1, 1, SR);
  return new Promise(function (res, rej) { var done = false;
    var p = ctx.decodeAudioData(ab.slice(0), function (b) { if (!done) { done = true; res(b); } }, function (e) { if (!done) { done = true; rej(e || new Error("decode")); } });
    if (p && p.then) p.then(function (b) { if (!done) { done = true; res(b); } }, function (e) { if (!done) { done = true; rej(e || new Error("decode")); } }); });
}
function toMono22k(buf) {
  if (buf.sampleRate === SR) { var n = buf.length, out = new Float32Array(n), ch = buf.numberOfChannels;
    for (var c = 0; c < ch; c++) { var d = buf.getChannelData(c); for (var i = 0; i < n; i++) out[i] += d[i] / ch; } return Promise.resolve(out); }
  var C = OAC(), len = Math.max(1, Math.ceil(buf.length * SR / buf.sampleRate)), ctx = new C(1, len, SR), src = ctx.createBufferSource();
  src.buffer = buf; src.connect(ctx.destination); src.start(0);
  return new Promise(function (res, rej) { var done = false;
    ctx.oncomplete = function (e) { if (!done) { done = true; res(Float32Array.from(e.renderedBuffer.getChannelData(0))); } };
    var p = ctx.startRendering(); if (p && p.then) p.then(function (b) { if (!done) { done = true; res(Float32Array.from(b.getChannelData(0))); } }, rej); });
}
function readBlob(b) { if (b.arrayBuffer) return b.arrayBuffer(); return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; r.readAsArrayBuffer(b); }); }

function inWorker(pcm, opts) {
  return new Promise(function (res, rej) {
    var w; try { w = new Worker(workerURL()); } catch (e) { return rej(e); }
    var started = false, timer = setTimeout(function () { if (!started) { try { w.terminate(); } catch (e) {} rej(new Error("worker did not start")); } }, 8000);
    w.onmessage = function (e) { var d = e.data || {};
      if (d.type === "ready" && !started) { started = true; clearTimeout(timer); w.postMessage({ type: "analyze", pcm: pcm, name: opts.name || "" }, [pcm.buffer]); }
      else if (d.type === "progress") { if (opts.onProgress) try { opts.onProgress(d.p, d.key); } catch (er) {} }
      else if (d.type === "done") { w.terminate(); res(d.lesson); }
      else if (d.type === "error") { w.terminate(); var er2 = new Error(d.message); er2.fromWorker = true; rej(er2); } };
    w.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); clearTimeout(timer); try { w.terminate(); } catch (er) {} if (!started) rej(new Error("worker failed")); else { var x = new Error("worker failed"); x.fromWorker = true; rej(x); } };
  });
}

function analyze(input, opts) {
  opts = opts || {};
  var name = opts.name || (input && typeof input.name === "string" ? input.name.replace(/\.[a-z0-9]{1,5}$/i, "") : "");
  var say = function (p, k) { if (opts.onProgress) try { opts.onProgress(p, k); } catch (e) {} };
  say(0, "open");
  var get = (G.AudioBuffer && input instanceof G.AudioBuffer) || (input && input.getChannelData && input.sampleRate) ? Promise.resolve({ buf: input })
    : (G.Blob && input instanceof G.Blob) ? readBlob(input).then(function (ab) { return { ab: ab }; })
    : Promise.resolve({ ab: input instanceof ArrayBuffer ? input : u8Of(input).slice().buffer });
  return get.then(function (r) {
    if (r.ab && isMidi(r.ab)) { say(0.5, "midi"); var L = fromMidi(r.ab, { name: name }); say(1, "done"); return L; }
    return (r.buf ? Promise.resolve(r.buf) : decode(r.ab)).then(toMono22k).then(function (pcm) {
      say(0.04, "open");
      var o = { name: name, onProgress: opts.onProgress };
      var main = function () { return analyzePCM(pcm, { name: name, onProgress: opts.onProgress, budget: 12 }); };
      if (opts.worker === false || typeof G.Worker === "undefined") return main();
      /* the samples move to the worker only once it says it is ready, so if it cannot start the page still listens */
      return inWorker(pcm, o).catch(function (e) { if (e && e.fromWorker) throw e; return main(); });
    });
  });
}

var AOGLearn = {
  version: 1, sr: SR, words: WORDS, analyze: analyze, fromMidi: fromMidi, isMidi: isMidi,
  chordName: chordName, keyName: keyName, spell: spell, gmName: function (p) { return GM[p] || ""; },
  word: function (key, lang) { var w = WORDS[lang === "es" ? "es" : "en"]; return w[key] || ""; },
  workerURL: null, _analyzePCM: analyzePCM
};
G.AOGLearn = AOGLearn;
if (typeof module !== "undefined" && module.exports) module.exports = AOGLearn;
})(typeof self !== "undefined" ? self : typeof globalThis !== "undefined" ? globalThis : this);
