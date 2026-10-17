/* AOG-LEARN-V1 (2026-10-11) — the listening engine behind "learn this song" in the Guitar, the Bass and the Piano.
   Jimmy: "Can the guitar, bass and piano teach how to play songs if I upload them?" — chords along with the song, exact
   MIDI files, "Did I get it?", the bass line and the melody. This file is the engine only; the rooms draw the lessons.

   window.AOGLearn
     .analyze(input, {onProgress(p 0..1, wordKey), worker:true, name, signal}) → Promise<Lesson>
         input: an AudioBuffer, or an ArrayBuffer / Blob / File of an audio file (a MIDI file is read by fromMidi).
         The heavy listening runs in a Web Worker (aog-learn-worker.js), so the page stays calm; without Workers it runs
         here in small slices (about 6 ms, never past 12) between frames. Nothing leaves the device. The worker ends when the lesson is
         done. signal (an AbortSignal) stops it: the promise rejects with an error named "AbortError".
     .fromMidi(ArrayBuffer, {name}) → Lesson     (Standard MIDI File, types 0 and 1; exact notes)
     .sections(lesson) → [{t,d,kind,letter}]     the parts from a lesson's chords and bars alone (older lessons, MIDI)
     .hearChord(samples Float32Array, sr, key?, minor?) → {root, q, name, conf} | null   a strum heard now (0.15-0.5 s)
     .simplify(chord, key, minor) → a copy as a plain major or minor chord · .capo(lesson) → {fret, shapes, open}
     .words.en / .words.es                       the words for each step (wordKey → "Finding the beat…"; intro, part, end)
     .chordName(root, q, key, minor) · .keyName(key, minor) · .isMidi(arrayBuffer)

   Lesson = { v:1, src:"audio"|"midi", name, sec, sr:22050, bpm, beats:[t], downbeats:[t], meter:{num,den},
              key:{key 0-11, minor, conf, name}, chords:[{t,d,root,q,name,conf}], bass:[{t,d,m,conf}],
              melody:[{t,d,m,conf}], tracks:[{name, ch 1-16, program, programName, drums, notes:[{t,d,m,v}]}],
              notes:[{t,d,m,v}], tuning (cents),
              sections:[{t, d, kind:"intro"|"part"|"end", letter:"A"… ("" for intro and end)}] }   (AOG-LEARN-V2)
                                                        Times are seconds of the original song.

   How it listens (all of it plain JavaScript on Float32Arrays, streamed frame by frame):
     beat    spectral-flux onset strength (log magnitude, max-filtered) → tempo by autocorrelation with a comb over
             2-4x the period and a prior around 70-160 bpm → dynamic-programming beat tracker (Ellis) → beats; then the
             drums (the kick on 1 and 3, the snare on 2 and 4, from the percussive part of the spectrum) say whether the
             tracker followed the off-beats, and if so it tracks again with them in the onsets.
     key     a 4096-point STFT; harmonic/percussive separation by median filtering (Fitzgerald); spectral peaks with
             parabolic interpolation; tuning offset from the peaks (circular mean); tuning-corrected beat-synchronous
             chroma (treble and bass apart); Krumhansl-Kessler profiles plus how long the tonic chord sounds.
     chords  templates for maj min 7 maj7 m7 sus2 sus4 dim aug 5 and "N" for no chord, on chroma that also counts what
             rises above each beat's floor (a short stab over a held bass), a bass bonus for the root, Viterbi smoothing
             with a key-aware and bar-aware change cost, then the 7ths chord by chord (the 7th against the third and the
             notes outside the chord); a bass playing alone is a power chord on its note ("5"), the drums alone no chord;
             downbeats from where the harmony and the bass change and where the low drums hit.
     parts   bar-by-bar likeness (chroma and chords) → a dynamic programme cuts the bars, on a four-bar grid, into parts
             that come back whole; alike parts share a letter; quiet edges and parts heard once at the ends are the intro
             and the ending.
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
    FIRSTW = 0.25,   /* key: a song that starts on a chord often calls it home */
    STABW = 1,       /* chords: frames count by their loudness to this power (short stabs) */
    STABX = 1,       /* chords: how much the notes struck in a beat (above its floor) add to its colour */
    STABK = 1,       /* … counting a note's rise only when it holds for this many frames */
    PRES = 0.5, PMIN = 0.15;  /* chords: a beat with less than PRES of its neighbours' chord sound has a weaker say */

var WORDS = {
  en: { open: "Opening the song…", beat: "Finding the beat…", key: "Finding the key…", chords: "Finding the chords…",
        bass: "Finding the bass line…", melody: "Finding the melody…", done: "The song is ready.",
        error: "This file would not open. Try another song.", midi: "Reading the notes…",
        intro: "Intro", part: "Part", end: "Ending" },
  es: { open: "Abriendo la canción…", beat: "Buscando el pulso…", key: "Buscando la tonalidad…", chords: "Buscando los acordes…",
        bass: "Buscando la línea del bajo…", melody: "Buscando la melodía…", done: "La canción está lista.",
        error: "Este archivo no se abrió. Prueba otra canción.", midi: "Leyendo las notas…",
        intro: "Intro", part: "Parte", end: "Final" }
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

/* a slice timer: on the page it gives the browser a moment every SLICE ms, and every loop asks it often enough that no slice
   runs much past that, even before the code is warm (the silent treatment: slices of 12 ms or less); in the worker it never
   waits. The moment is a message to itself (the browser draws and answers taps in between, without the 4 ms a timer waits
   once timers nest), and a timer at least every 50 ms, so the page's own timers surely get their turn too. */
var SLICE = 6, MC = null, MQ = [], lastTimer = 0;
function getYield() { return function (f) { var t = now();
  if (typeof MessageChannel === "function" && t - lastTimer < 50) {
    if (!MC) { MC = new MessageChannel(); MC.port1.onmessage = function () { var g = MQ.shift(); if (g) g(); }; }
    MQ.push(f); MC.port2.postMessage(0); }
  else { lastTimer = t; setTimeout(f, 0); } }; }
function Ticker(budget, signal) { this.b = budget || 0; this.t0 = now(); this.sig = signal || null; }
Ticker.prototype.due = function () { return this.b > 0 && now() - this.t0 > this.b; };
/* before a step that runs whole (a few ms when the code is cold): a fresh slice once half of this one is used */
Ticker.prototype.soon = function () { return this.b > 0 && now() - this.t0 > 0.5 * this.b; };
Ticker.prototype.yield = function () { var s = this, y = getYield();
  return new Promise(function (r, j) { y(function () { s.t0 = now(); if (s.sig && s.sig.aborted) j(abortError()); else r(); }); }); };
/* stopped when asked (AbortSignal): an error named "AbortError", as fetch() gives */
function abortError() { var m = "The listening was stopped.";
  try { if (typeof DOMException === "function") return new DOMException(m, "AbortError"); } catch (e) {}
  var x = new Error(m); x.name = "AbortError"; return x; }

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
    if ((f & 127) === 0) prog(f / nF);
    if (T.due()) await T.yield();
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

async function estimatePeriod(O, fps, T) {
  var n = O.length, mean = 0, i, l;
  for (i = 0; i < n; i++) mean += O[i]; mean /= Math.max(1, n);
  var z = new Float32Array(n); for (i = 0; i < n; i++) z[i] = O[i] - mean;
  var minL = Math.floor(fps * 60 / 220), maxL = Math.ceil(fps * 60 / 45), top = Math.min(n - 2, 4 * maxL + 2);
  if (top <= minL + 2) return fps * 60 / 120;
  var ac = new Float64Array(top + 1);
  for (l = 1; l <= top; l++) { var s = 0, m = n - l; for (i = 0; i < m; i++) s += z[i] * z[i + l]; ac[l] = s / m; if (T && T.due()) await T.yield(); }
  function A(x) { if (x >= top) return 0; var a = Math.floor(x), f = x - a; return ac[a] * (1 - f) + ac[a + 1] * f; }
  var best = -Infinity, bestL = fps * 60 / 120;
  for (var L = minL; L <= maxL; L += 0.125) {
    var S = A(L) + 0.5 * A(2 * L) + 0.33 * A(3 * L) + 0.25 * A(4 * L) + SUBW * Math.max(A(L / 2), A(L / 3)), bpm = 60 * fps / L;
    var w = Math.exp(-0.5 * Math.pow(log2(bpm / 112) / 0.85, 2)), sc = Math.max(0, S) * w;
    if (sc > best) { best = sc; bestL = L; }
  }
  return bestL;
}

async function trackBeats(O, R, fps, period, T) {
  var n = O.length, i, std = 0, mean = 0;
  for (i = 0; i < n; i++) mean += O[i]; mean /= Math.max(1, n);
  for (i = 0; i < n; i++) std += (O[i] - mean) * (O[i] - mean); std = Math.sqrt(std / Math.max(1, n)) || 1;
  /* local score: the onset strength over its spread, smoothed by a narrow Gaussian (σ = period/32) */
  var Lw = Math.max(1, Math.round(period / 4)), g = new Float32Array(2 * Lw + 1), Lc = new Float32Array(n);
  for (i = -Lw; i <= Lw; i++) g[i + Lw] = Math.exp(-0.5 * Math.pow(i * 32 / period, 2));
  for (i = 0; i < n; i++) { var s = 0; for (var j = -Lw; j <= Lw; j++) { var q = i + j; if (q >= 0 && q < n) s += O[q] * g[j + Lw]; } Lc[i] = s / std; if ((i & 255) === 0) if (T && T.due()) await T.yield(); }
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
    if ((i & 127) === 0) if (T && T.due()) await T.yield();
  }
  if (T && T.soon()) await T.yield();
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

/* is the beat on the drums' beat, or half a beat off? Where open hats and the bass play off the beat they can be louder
   than the kick, and the tracker follows them. The kick drum (the low percussive band) on 1 and 3 and the snare on 2 and 4
   say where the beat is: their pattern over a bar of eighths, tried at every eighth; the best whole-beat placing against
   the best half-beat one. Returns the beats to use (and flipped: true when they moved). */
var KICK_T = [1, 0, 0, 0, 0.5, 0, 0, 0], SNARE_T = [0, 0, 1, 0, 0, 0, 1, 0];
function drumProfile(P, beats) {
  var nB = beats.length, pl = new Float64Array(8), ps = new Float64Array(8), c = new Float64Array(8), i, h;
  function at(A, t) { var g = Math.round(t * P.fps), m = 0; for (var z = g - 1; z <= g + 1; z++) if (z >= 0 && z < P.nF && A[z] > m) m = A[z]; return m; }
  for (i = 0; i < nB - 1; i++) for (h = 0; h < 2; h++) { var t = beats[i] + h * 0.5 * (beats[i + 1] - beats[i]), k = (i % 4) * 2 + h;
    pl[k] += at(P.PL, t); ps[k] += at(P.PS, t); c[k]++; }
  var ml = 0, ms = 0; for (k = 0; k < 8; k++) { if (c[k]) { pl[k] /= c[k]; ps[k] /= c[k]; } if (pl[k] > ml) ml = pl[k]; if (ps[k] > ms) ms = ps[k]; }
  for (var k = 0; k < 8; k++) { pl[k] = ml > 0 ? pl[k] / ml : 0; ps[k] = ms > 0 ? ps[k] / ms : 0; }
  var sc = [];
  for (var r = 0; r < 8; r++) { var s = 0; for (k = 0; k < 8; k++) { var q = (k + r) % 8; s += KICK_T[k] * pl[q] + SNARE_T[k] * ps[q]; } sc.push(s); }
  return sc;
}
function drumOnsets(ON, P) {
  var n = ON.O.length, O2 = new Float32Array(n), oP = percentile(ON.O, 0.95) || 1, lP = percentile(P.PL, 0.95) || 1, sP = percentile(P.PS, 0.95) || 1;
  for (var f = 0; f < n; f++) { var u = f / ON.fps * P.fps, a = Math.floor(u), w = u - a, b = Math.min(P.nF - 1, a + 1); a = Math.min(P.nF - 1, a);
    var pl = P.PL[a] * (1 - w) + P.PL[b] * w, ps = P.PS[a] * (1 - w) + P.PS[b] * w;
    O2[f] = ON.O[f] / oP + Math.min(1.5, pl / lP) + Math.min(1.5, ps / sP); }
  return O2;
}
function fixBeatPhase(P, beats, sec) {
  var nB = beats.length; if (nB < 8) return { beats: beats };
  var sc = drumProfile(P, beats), be = -1, bo = -1;
  for (var r = 0; r < 8; r++) { if (r % 2 === 0) { if (sc[r] > be) be = sc[r]; } else if (sc[r] > bo) bo = sc[r]; }
  if (!(bo > 1.25 * be && bo > 0.8)) return { beats: beats };
  /* half a beat later: each beat moves to the middle of its gap; one more at the start when the song is already playing there */
  var out = [], i;
  if (beats[0] - 0.5 * (beats[1] - beats[0]) >= 0) out.push(beats[0] - 0.5 * (beats[1] - beats[0]));
  for (i = 0; i < nB - 1; i++) out.push(0.5 * (beats[i] + beats[i + 1]));
  var lastT = beats[nB - 1] + 0.5 * (beats[nB - 1] - beats[nB - 2]); if (lastT < sec - 0.05) out.push(lastT);
  return { beats: out, flipped: true };
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
  /* the percussive part too, in two bands: the kick drum (30-120 Hz) and the snare, claps and rims (300-4200 Hz) */
  var PL = new Float32Array(nF), PS = new Float32Array(nF), kL0 = Math.round(30 * N / SR), kL1 = Math.round(120 * N / SR), kS0 = Math.round(300 * N / SR);
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
      var p = selectK(vb, c, c >> 1), h2 = h * h, p2 = p * p, v = cur[k] * h2 / (h2 + p2 + 1e-12);
      Y[k] = v; if (v > mx) mx = v;
      if (k >= kS0) PS[g] += cur[k] * p2 / (h2 + p2 + 1e-12); else if (k >= kL0 && k <= kL1) PL[g] += cur[k] * p2 / (h2 + p2 + 1e-12);
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
    if ((g & 63) === 0) prog(g / nF);
    if (T.due()) await T.yield();
  }
  return { pF: pF, pA: pA, pN: pN, nF: nF, MAXP: MAXP, H: H, fps: SR / H, PL: PL, PS: PS };
}

async function estimateTuning(P, T) {
  var sc = 0, ss = 0;
  for (var g = 0; g < P.nF; g++) { var o = g * P.MAXP;
    for (var i = 0; i < P.pN[g]; i++) { var f = P.pF[o + i]; if (f < 80 || f > 2000) continue;
      var p = hzToMidi(f), d = p - Math.round(p), a = P.pA[o + i], th = 2 * Math.PI * d; sc += a * Math.cos(th); ss += a * Math.sin(th); }
    if ((g & 31) === 0) if (T && T.due()) await T.yield(); }
  if (!sc && !ss) return 0;
  return Math.atan2(ss, sc) / (2 * Math.PI);    /* semitones, −0.5..0.5 */
}

/* beat-synchronous chroma (treble and bass) from the peaks */
async function beatChroma(P, tune, beats, sec, T) {
  var nB = beats.length, Ct = new Float32Array(nB * 12), Cb = new Float32Array(nB * 12), Et = new Float32Array(nB), Eb = new Float32Array(nB);
  var ibi = nB > 1 ? (beats[nB - 1] - beats[0]) / (nB - 1) : 0.5, bi = 0, k, g;
  var GAM = STABW, BETA = STABX, HIK = STABK;
  var FC = new Float32Array(P.nF * 12), FB = new Int32Array(P.nF).fill(-1), HIEDGE = 0.04;
  var W = new Float64Array(nB), Wn = new Float64Array(nB), Eu = new Float32Array(nB), Ux = new Float32Array(nB), lo = new Float32Array(nB * 12).fill(Infinity);
  for (g = 0; g < P.nF; g++) {
    var t = g / P.fps - 0.05; /* lean a little late: the long window still hears the chord before */
    while (bi < nB - 1 && t >= beats[bi + 1]) bi++;
    if (t < beats[0] || bi >= nB) continue;
    var end = bi < nB - 1 ? beats[bi + 1] : Math.min(sec, beats[bi] + ibi); if (t >= end) continue;
    var o = g * P.MAXP, fe = 0, fo = g * 12, f0 = 0, a0 = 0;
    /* the strongest low note, and how much of what sounds above it is not its own overtones (the harmony, not the bass) */
    for (var i = 0; i < P.pN[g]; i++) { var fq = P.pF[o + i]; if (fq >= 35 && fq <= 260 && P.pA[o + i] > a0) { a0 = P.pA[o + i]; f0 = fq; } }
    for (i = 0; i < P.pN[g]; i++) { var fu = P.pF[o + i]; if (fu < 250 || fu > 2600) continue; var hr = f0 ? fu / f0 : 0.5, hn = Math.round(hr);
      if (!(f0 && hn >= 2 && hn <= 10 && Math.abs(hr - hn) < 0.03 * hn)) Ux[bi] += Math.sqrt(P.pA[o + i]); }
    for (i = 0; i < P.pN[g]; i++) {
      var f = P.pF[o + i]; if (f < 35 || f > 2600) continue;
      var p = hzToMidi(f) - tune, n = Math.round(p), d = p - n, w = Math.sqrt(P.pA[o + i]) * Math.pow(Math.cos(Math.PI * d), 2), pc = ((n % 12) + 12) % 12;
      if (f >= 90) { var wt = f < TLO ? (f - 90) / (TLO - 90) : f > 1800 ? (2600 - f) / 800 : 1; FC[fo + pc] += w * wt; fe += w * wt; if (f >= 250) Eu[bi] += w * wt; }
      if (f <= 280) { var wb = f < 45 ? (f - 35) / 10 : f > 200 ? (280 - f) / 80 : 1; Cb[bi * 12 + pc] += w * wb; Eb[bi] += w * wb; }
    }
    /* a frame counts by how loud the chord is in it, so a short stab is heard over the bass that rings on after it */
    var fw = GAM ? Math.pow(fe + 1e-9, GAM) : 1;
    FB[g] = t + 0.05 + HIEDGE < end ? bi : -1;   /* the struck part listens only where the window does not reach the next beat */
    for (k = 0; k < 12; k++) { var v = FC[fo + k]; Ct[bi * 12 + k] += v * fw; if (v < lo[bi * 12 + k]) lo[bi * 12 + k] = v; }
    Et[bi] += fe; W[bi] += fw; Wn[bi]++;
    if ((g & 7) === 0) if (T && T.due()) await T.yield();
  }
  if (GAM) for (bi = 0; bi < nB; bi++) if (W[bi] > 0) { var sc = Wn[bi] / W[bi]; for (k = 0; k < 12; k++) Ct[bi * 12 + k] *= sc; }
  /* and what rises above the beat's own floor (a stab over a held bass note): the notes that were struck, not the ones ringing on */
  if (BETA) {
    /* the HIK-th highest rise, so a note must hold a few frames (a stab does; a click of noise does not) */
    var top = new Float32Array(nB * 12 * HIK);
    for (g = 0; g < P.nF; g++) { bi = FB[g]; if (bi < 0) continue;
      for (k = 0; k < 12; k++) { var x = FC[g * 12 + k] - lo[bi * 12 + k], o2 = (bi * 12 + k) * HIK;
        if (x > top[o2 + HIK - 1]) { var z = HIK - 1; while (z > 0 && top[o2 + z - 1] < x) { top[o2 + z] = top[o2 + z - 1]; z--; } top[o2 + z] = x; } }
      if ((g & 63) === 0) if (T && T.due()) await T.yield(); }
    for (bi = 0; bi < nB; bi++) for (k = 0; k < 12; k++) Ct[bi * 12 + k] += BETA * Wn[bi] * top[(bi * 12 + k) * HIK + HIK - 1];
  }
  return { Ct: Ct, Cb: Cb, Et: Et, Eb: Eb, nB: nB, Eu: Eu, Ux: Ux };
}

/* ───────── 3. chords ───────── */
/* emission scores per beat for the 120 chords and "no chord" */
function chordScores(BC, templ, isNotes, T) {   /* with a ticker: a promise, in slices */
  var pres = PRES, pmin = PMIN;
  var nB = BC.nB, S = new Float32Array(nB * (NSTATE + 1)), act = [], i, k;
  for (i = 0; i < nB; i++) if (BC.Et[i] > 0) act.push(BC.Et[i]);
  var mxE = act.length ? Math.max.apply(null, act) : 0, Eref = act.length ? medianOf(act.filter(function (e) { return e > 0.1 * mxE; })) : 1;
  var actB = []; for (i = 0; i < nB; i++) if (BC.Eb[i] > 0) actB.push(BC.Eb[i]);
  var mxB = actB.length ? Math.max.apply(null, actB) : 0, EbRef = actB.length ? medianOf(actB.filter(function (e) { return e > 0.1 * mxB; })) : 1;
  var c = new Float32Array(12), b = new Float32Array(12);
  function one(i) {
    var n = 0, o = i * 12, bm = 0, gm = 0, am = 0, k;
    for (k = 0; k < 12; k++) { c[k] = BC.Ct[o + k]; n += c[k] * c[k]; b[k] = BC.Cb[o + k]; if (b[k] > bm) bm = b[k]; }
    n = Math.sqrt(n);
    var r = Eref > 0 ? BC.Et[i] / Eref : 0, rb = EbRef > 0 ? BC.Eb[i] / EbRef : 0;
    if (n > 0) for (k = 0; k < 12; k++) c[k] /= n;
    for (k = 0; k < 12; k++) { gm += Math.log(c[k] + 0.02); am += c[k] + 0.02; }
    var flat = Math.exp(gm / 12) / (am / 12);       /* 1 = noise-like, small = a few clear notes */
    var bw = bm > 0 ? 0.12 * Math.min(1, rb / 0.3) : 0;
    var so = i * (NSTATE + 1);
    var bestC = -Infinity;
    for (var s = 0; s < NSTATE; s++) { var to = s * 12, dot = 0; for (k = 0; k < 12; k++) dot += c[k] * templ[to + k];
      var root = (s / 10) | 0; S[so + s] = dot - QPEN[QUALS[s % 10]] + (bw ? bw * (b[root] / bm - 0.5) : 0); if (S[so + s] > bestC) bestC = S[so + s]; }
    /* a beat where the chord hardly sounds (only the bass rings on between two stabs) has a weaker say in which chord it is:
       its best chord keeps its score, the others come closer to it */
    if (BC.Eu) { var lm = 0; for (k = Math.max(0, i - 2); k <= Math.min(nB - 1, i + 2); k++) if (BC.Eu[k] > lm) lm = BC.Eu[k];
      var cw = lm > 0 ? clamp(BC.Eu[i] / (pres * lm), pmin, 1) : 1;
      if (cw < 1) for (s = 0; s < NSTATE; s++) S[so + s] = bestC - cw * (bestC - S[so + s]); }
    S[so + NSTATE] = (n > 0 ? 0.55 : 2) + 0.6 * Math.max(0, 1 - r / (isNotes ? 0.05 : 0.15)) + (isNotes ? 0 : 0.5 * Math.max(0, flat - 0.55));
  }
  if (!T) { for (i = 0; i < nB; i++) one(i); return S; }
  return (async function () { for (var q = 0; q < nB; q++) { one(q); if ((q & 7) === 0 && T.due()) await T.yield(); } return S; })();
}

/* the 7ths, heard chord by chord: the 7th against the chord's third, and against the notes that are not in the chord. Root and
   fifth are left out of it, because the bass's overtones fill them in. A clear 7th is added, a 7th that is hardly there is
   taken away; in between, the smoothing's choice stays. */
var Q_UP = 1.0, Q_DOWN = { maj7: 0.75, "7": 0.4, m7: 0.5 };
function qualityPass(path, BC) {
  var nB = path.length, out = Int16Array.from(path), X = new Float64Array(12), i, j, k;
  for (i = 0; i < nB;) {
    var s = path[i]; j = i; while (j < nB && path[j] === s) j++;
    if (s !== NSTATE) {
      var r = (s / 10) | 0, q = QUALS[s % 10], fam = q === "maj" || q === "7" || q === "maj7" ? "maj" : q === "min" || q === "m7" ? "min" : "";
      if (fam) {
        X.fill(0);
        for (var b = i; b < j; b++) { var n = 0; for (k = 0; k < 12; k++) n += BC.Ct[b * 12 + k] * BC.Ct[b * 12 + k]; n = Math.sqrt(n);
          if (n > 0) for (k = 0; k < 12; k++) X[k] += BC.Ct[b * 12 + k] / n; }
        var x = function (iv) { return X[(r + iv) % 12]; }, third = x(fam === "maj" ? 4 : 3), oth = 1e-9;
        [1, 2, 5, 6, 8, 9].forEach(function (iv) { if (x(iv) > oth) oth = x(iv); });
        if (fam === "maj") oth = Math.max(oth, x(3)); else oth = Math.max(oth, x(4), x(11));
        var ev = function (iv) { return third > 0 ? (x(iv) / third) * (x(iv) / oth) : 0; };
        var nq = q;
        if (fam === "maj") { var e7 = ev(10), eM = ev(11);
          if (q === "maj") { if (Math.max(e7, eM) >= Q_UP) nq = eM >= e7 ? "maj7" : "7"; }
          else if (q === "maj7" && eM <= Q_DOWN.maj7) nq = e7 >= Q_UP ? "7" : "maj";
          else if (q === "7" && e7 <= Q_DOWN["7"]) nq = eM >= Q_UP ? "maj7" : "maj"; }
        else { var em = ev(10);
          if (q === "min" && em >= Q_UP) nq = "m7"; else if (q === "m7" && em <= Q_DOWN.m7) nq = "min"; }
        if (nq !== q) { var ns = r * 10 + QUALS.indexOf(nq); for (b = i; b < j; b++) out[b] = ns; }
      }
    }
    i = j;
  }
  return out;
}

/* bars where only the bass plays (it often comes in before the band): what sounds above it is its own overtones and the
   drums, so the chord it seems to make is not one. A stretch of one chord whose treble (against the song's) is under ALONE
   of its bass (against the song's) is a power chord on the bass note ("5"); with no clear bass note in it, no chord. And a
   stretch with hardly any treble or bass at all (the drums alone) is no chord. Eu and Eb grow as the square root of the
   sound, so ALONE is about 13 dB, and "hardly any" (a quarter) about 24 dB, under the song. */
var ALONE = 0.48;
function bassAlone(path, BC) {
  var nB = path.length, out = Int16Array.from(path), X = new Float64Array(12), i, j, k, b;
  function q75(a) { var v = []; for (var z = 0; z < a.length; z++) if (a[z] > 0) v.push(a[z]); return v.length ? percentile(v, 0.75) : 0; }
  var rU = q75(BC.Eu), rB = q75(BC.Eb);
  if (!(rU > 0 && rB > 0)) return out;
  for (i = 0; i < nB;) {
    var s = path[i]; j = i; while (j < nB && path[j] === s) j++;
    if (s !== NSTATE) {
      var eu = 0, eb = 0; X.fill(0);
      for (b = i; b < j; b++) { eu += BC.Eu[b]; eb += BC.Eb[b]; var n = 0;
        for (k = 0; k < 12; k++) n += BC.Cb[b * 12 + k] * BC.Cb[b * 12 + k]; n = Math.sqrt(n);
        if (n > 0) for (k = 0; k < 12; k++) X[k] += BC.Cb[b * 12 + k] / n; }
      eu /= (j - i) * rU; eb /= (j - i) * rB;
      if (eb < 0.4 && eu < 0.25) for (b = i; b < j; b++) out[b] = NSTATE;
      else if (eb >= 0.4 && eu < ALONE * eb) {
        var r = 0, tot = 0; for (k = 0; k < 12; k++) { tot += X[k]; if (X[k] > X[r]) r = k; }
        var ns = tot > 0 && X[r] >= 0.25 * tot ? r * 10 + QUALS.indexOf("5") : NSTATE;
        for (b = i; b < j; b++) out[b] = ns;
      }
    }
    i = j;
  }
  return out;
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
      return r === t && (q === "5" || (m ? (q === "min" || q === "m7") : (q === "maj" || q === "7" || q === "maj7"))); };   /* a power chord fits either */
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

/* ───────── 3b. the song's parts: intro, Part A, Part B …, ending ───────── */
/* How alike two chords are: the same chord 1, the same root 0.8 (same family) or 0.5, else the notes they share, by half */
var FAMILY = { maj: "M", "7": "M", maj7: "M", aug: "M", min: "m", m7: "m", dim: "m", sus2: "s", sus4: "s", "5": "5" };
function chordSim(r1, q1, r2, q2) {
  if (r1 < 0 || r2 < 0) return r1 < 0 && r2 < 0 ? 1 : 0;
  if (r1 === r2) return q1 === q2 ? 1 : FAMILY[q1] === FAMILY[q2] ? 0.8 : 0.5;
  var a = IVS[q1] || IVS.maj, b = IVS[q2] || IVS.maj, sh = 0;
  for (var i = 0; i < a.length; i++) for (var j = 0; j < b.length; j++) if ((r1 + a[i]) % 12 === (r2 + b[j]) % 12) sh++;
  return 0.5 * sh / Math.max(a.length, b.length);
}
/* The parts, from repetition. bars[i] = {t}; sim(i, j) 0..1 says how alike bars i and j sound; pres[i] how much harmony
   sounds in bar i. A dynamic programme cuts the bars into parts of 2-16 bars (4 and 8 preferred) so that each part, as a
   whole, comes back somewhere else in the song (a part that half repeats scores less than two clean ones); parts that
   sound alike share a letter; quiet bars at the start and the end, and a short part heard once before (or after) the
   repeating ones, are the intro and the ending. */
var SEC_LEN = { 4: 0.2, 8: 0.5, 12: 0, 16: 0 },   /* a little more for parts of 4 and 8 bars */
    SEC_SAME = 0.8,  /* two parts this alike share a letter */
    SEC_COST = 0.8,  /* each part costs this much (so the parts are not cut too small) */
    SEC_REPX = 6,    /* how a part's return is scored: (how alike)^6 per bar, so only a clean return counts much */
    SEC_SKIP = 0.8;  /* a bar left to the intro is worth this much, the less it sounds like what follows */
function segmentBars(nBar, sim, pres, tail) {
  tail = tail || 0;     /* how long the song rings on after its last bar, in bars */
  var M = new Float32Array(nBar * nBar), i, j, k;
  for (i = 0; i < nBar; i++) for (j = i; j < nBar; j++) M[i * nBar + j] = M[j * nBar + i] = i === j ? 1 : clamp(sim(i, j), 0, 1);
  function m(a, b) { return M[a * nBar + b]; }
  if (nBar < 2) return [{ s: 0, e: nBar, kind: "part", letter: "A" }];
  /* quiet bars at the edges */
  var pm = 0; for (i = 0; i < nBar; i++) if (pres[i] > pm) pm = pres[i];
  var act = []; for (i = 0; i < nBar; i++) if (pres[i] > 0.1 * pm) act.push(pres[i]);
  var pref = act.length ? medianOf(act) : 0, low = function (b) { return !(pres[b] >= 0.3 * pref) || pm <= 0; };
  var a = 0, b = nBar; while (a < nBar && low(a)) a++; while (b > a && low(b - 1)) b--;
  /* and the half-quiet bars next to them (a bass alone before the band comes in) */
  if (a > 0) while (a < b - 2 && pres[a] < 0.5 * pref) a++;
  if (b < nBar) while (b > a + 2 && pres[b - 1] < 0.5 * pref) b--;
  if (a < 2) a = 0; if (nBar - b < 2) b = nBar; if (b - a < 2) { a = 0; b = nBar; }
  /* how well a stretch of bars comes back, whole, somewhere else (diagonal sums make each look-up quick) */
  var diag = new Float64Array(2 * nBar * (nBar + 1));   /* prefix sums of m(s+k, s+off+k) along each diagonal */
  function dIdx(off, s) { return (off + nBar) * (nBar + 1) + s; }
  for (var off = -nBar + 1; off < nBar; off++) { var acc = 0, base = dIdx(off, 0); diag[base] = 0;
    for (var s0 = 0; s0 < nBar; s0++) { var t0 = s0 + off; acc += (t0 >= 0 && t0 < nBar) ? m(s0, t0) : 0; diag[base + s0 + 1] = acc; } }
  function alike(s, o, L) { var off = o - s; return (diag[dIdx(off, s + L)] - diag[dIdx(off, s)]) / L; }
  var repC = new Float64Array(nBar * 17).fill(-1);
  function rep(s, L) { var ci = s * 17 + L; if (repC[ci] >= 0) return repC[ci];
    var best = 0; for (var o = 0; o + L <= nBar; o++) { if (o + L > s && o < s + L) continue; var v = alike(s, o, L); if (v > best) best = v; } return (repC[ci] = best); }
  /* parts start on a grid of four bars, counted from where the first part starts (tried a bar or three late, too: a short
     intro of the band's own); each part's bars score by how well the part comes back, whole, elsewhere */
  var best = new Float64Array(nBar + 1), from = new Int32Array(nBar + 1), SEGC = SEC_COST, REPX = SEC_REPX, SKIPV = SEC_SKIP;
  var top = -Infinity, cuts = [a, b], lens = [4, 8, 12, 16];
  for (k = 0; k <= 7; k++) { var A0 = a + k; if (k && A0 > b - 4) break;
    best.fill(-Infinity); from.fill(-1); best[A0] = -0.3 * k;
    /* bars left before the first part are worth the more, the less they sound like anything that comes after */
    for (i = a; i < A0; i++) { var rb = 0; for (j = A0; j < nBar; j++) if (m(i, j) > rb) rb = m(i, j); best[A0] += SKIPV * (1 - Math.pow(rb, REPX)); }
    for (var e = A0 + 1; e <= b; e++) { if (e !== b && (e - A0) % 4) continue;
      for (var L = 1; L <= 16 && e - L >= A0; L++) { var s = e - L; if (best[s] === -Infinity || (s - A0) % 4) continue;
        if (lens.indexOf(L) < 0 && e !== b) continue;
        var g = L * Math.pow(rep(s, L), REPX) + (SEC_LEN[L] || 0) - (e === b && L < 4 ? 0 : SEGC);   /* a short last piece costs nothing */
        if (best[s] + g > best[e]) { best[e] = best[s] + g; from[e] = s; } } }
    if (best[b] > top) { top = best[b]; var cc = []; for (e = b; e > A0 && from[e] >= 0; e = from[e]) cc.push(from[e]); cc.reverse(); cc.push(b); if (cc[0] === A0) cuts = cc; } }
  if (cuts[0] - a === 1 && a === 0) cuts[0] = a;      /* a bar's pickup joins the first part (after a quiet intro, the intro) */
  a = cuts[0];
  var segs = [];
  if (a > 0) segs.push({ s: 0, e: a, kind: "intro" });
  for (i = 0; i < cuts.length - 1; i++) segs.push({ s: cuts[i], e: cuts[i + 1], kind: "part" });
  if (b < nBar) segs.push({ s: b, e: nBar, kind: "end" });
  /* letters: a part like an earlier one takes its letter (the shorter laid along the longer, at its best place) */
  function segAlike(x, y) { var lx = x.e - x.s, ly = y.e - y.s, L = Math.min(lx, ly), bst = 0;
    var lo = lx <= ly ? x : y, hi = lx <= ly ? y : x;
    for (var o = hi.s; o + L <= hi.e; o++) { var v = alike(lo.s, o, L); if (v > bst) bst = v; }
    return L / Math.max(lx, ly) >= 0.5 ? bst : 0; }
  var reps = [];
  segs.forEach(function (sg) { if (sg.kind !== "part") return; var bi = -1, bv = SEC_SAME;
    for (var q = 0; q < reps.length; q++) { var v = segAlike(sg, reps[q]); if (v >= bv) { bv = v; bi = q; } }
    if (bi < 0) { reps.push(sg); sg.lab = reps.length - 1; } else sg.lab = reps[bi].lab; });
  var count = {}; segs.forEach(function (sg) { if (sg.kind === "part") count[sg.lab] = (count[sg.lab] || 0) + 1; });
  var parts = segs.filter(function (sg) { return sg.kind === "part"; });
  /* parts heard once before the first part that comes back (8 bars at most, and not most of the song) are the intro; parts
     heard once after the last part that comes back are the ending */
  var fr = -1, lr = -1;
  for (i = 0; i < parts.length; i++) if (count[parts[i].lab] > 1) { if (fr < 0) fr = i; lr = i; }
  if (fr > 0 && parts[fr - 1].e - parts[0].s <= 8 && parts[fr - 1].e - parts[0].s < 0.4 * (b - a)) for (i = 0; i < fr; i++) parts[i].kind = "intro";
  if (lr >= 0 && lr < parts.length - 1 && parts[parts.length - 1].e - parts[lr + 1].s <= 8 && parts[parts.length - 1].e - parts[lr + 1].s < 0.4 * (b - a))
    for (i = lr + 1; i < parts.length; i++) parts[i].kind = "end";
  /* neighbours of the same kind (intro, ending) join; the letters go A, B, C … in the order the parts are first heard */
  var out = [], seen = {}, nl = 0;
  /* an intro or an ending of less than two bars belongs to the part beside it */
  segs.forEach(function (sg, q) { if (sg.kind !== "part" && sg.e - sg.s + (sg.e === nBar ? tail : 0) < 2 && segs.length > 1) sg.join = q === 0 ? 1 : -1; });
  for (i = 0; i < segs.length; i++) if (segs[i].join) { var nb2 = segs[i + segs[i].join]; if (nb2 && !nb2.join) { if (segs[i].join > 0) nb2.s = segs[i].s; else nb2.e = segs[i].e; segs[i].gone = 1; } }
  segs = segs.filter(function (sg) { return !sg.gone; });
  segs.forEach(function (sg) { var L2 = out[out.length - 1];
    if (L2 && sg.kind !== "part" && L2.kind === sg.kind) { L2.e = sg.e; return; }
    if (sg.kind === "part") { if (seen[sg.lab] == null) seen[sg.lab] = nl++; sg.letter = letterOf(seen[sg.lab]); }
    out.push(sg); });
  return out;
}
function letterOf(n) { var s = ""; n++; while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }
/* the bars of a lesson: from its downbeats (or its beats, counted in the meter); the first bar starts at the first beat */
function barsOf(beats, downbeats, num, endT) {
  var bars = [], nB = beats.length, i;
  if (!nB) return bars;
  var db = (downbeats && downbeats.length) ? downbeats : null, idx = [];
  if (db) { var j = 0; for (i = 0; i < db.length; i++) { while (j < nB - 1 && beats[j] < db[i] - 1e-3) j++; if (Math.abs(beats[j] - db[i]) < 0.06 && (!idx.length || j > idx[idx.length - 1])) idx.push(j); } }
  if (!idx.length) for (i = 0; i < nB; i += (num || 4)) idx.push(i);
  if (idx[0] !== 0) { if (idx[0] < 2 && idx.length > 1) idx[0] = 0; else idx.unshift(0); }   /* a pickup of a beat joins bar one */
  for (i = 0; i < idx.length; i++) bars.push({ s: idx[i], e: i + 1 < idx.length ? idx[i + 1] : nB, t: beats[idx[i]] });
  /* a last bar of less than half a bar (the song's final beat or two) joins the bar before */
  var full = bars.length > 1 ? bars[bars.length - 2].e - bars[bars.length - 2].s : num || 4;
  if (bars.length > 1 && (bars[bars.length - 1].e - bars[bars.length - 1].s) * 2 < full) { bars.tailT = bars[bars.length - 1].t; bars[bars.length - 2].e = nB; bars.pop(); }
  return bars;
}
function sectionsOut(bars, segs, endT) {
  return segs.map(function (sg, i) { var t0 = bars[sg.s].t, t1 = sg.e < bars.length ? bars[sg.e].t : endT;
    return { t: r4(t0), d: r4(Math.max(0.01, r4(t1) - r4(t0))), kind: sg.kind, letter: sg.kind === "part" ? sg.letter : "" }; });
}
/* the chord at each beat (state per beat) for the lesson-only way */
function chordAtBeats(chords, beats) {
  var out = [], ci = 0, nC = chords.length;
  for (var i = 0; i < beats.length; i++) { var t = beats[i] + 0.02;
    while (ci < nC - 1 && chords[ci + 1].t <= t) ci++;
    var c = nC && chords[ci].t <= t && t < chords[ci].t + chords[ci].d + 0.05 ? chords[ci] : null;
    out.push(c ? { r: c.root, q: c.q } : { r: -1, q: "N" }); }
  return out;
}
function barChordSim(bars, cb) {
  return function (i, j) { var A = bars[i], B = bars[j], n = Math.min(A.e - A.s, B.e - B.s), s = 0;
    if (n <= 0) return 0;
    for (var k = 0; k < n; k++) { var x = cb[A.s + k], y = cb[B.s + k]; s += chordSim(x.r, x.q, y.r, y.q); }
    return s / n * (n / Math.max(A.e - A.s, B.e - B.s) >= 0.75 ? 1 : 0.8); };
}
/* AOGLearn.sections(lesson): the parts from a lesson's chords and bars alone (lessons kept before parts were heard, MIDI) */
function sectionsOfLesson(L) {
  if (!L || !L.beats || !L.beats.length) return [];
  var beats = L.beats, endT = Math.max(L.sec || 0, beats[beats.length - 1]), num = (L.meter && L.meter.num) || 4;
  var bars = barsOf(beats, L.downbeats, num, endT), cb = chordAtBeats(L.chords || [], beats);
  var pres = bars.map(function (b) { var c = 0; for (var k = b.s; k < b.e; k++) if (cb[k].r >= 0) c++; return c / Math.max(1, b.e - b.s); });
  return finishSections(bars, beats, num, endT, barChordSim(bars, cb), pres);
}
/* from the audio: the bars' treble and bass colour (beat-synchronous chroma) and the chords */
async function sectionsOfAudio(BC, path, beats, downbeats, num, endT, TK) {
  var bars = barsOf(beats, downbeats, num, endT), nb = bars.length, T = new Float32Array(nb * 12), B = new Float32Array(nb * 12), pres = [], i, k;
  var cb = []; for (i = 0; i < path.length; i++) { var st = path[i]; cb.push(st === NSTATE ? { r: -1, q: "N" } : { r: (st / 10) | 0, q: QUALS[st % 10] }); }
  bars.forEach(function (bar, bi) { var e = 0;
    for (var q = bar.s; q < bar.e; q++) { var nt = 0, nbb = 0; for (k = 0; k < 12; k++) { nt += BC.Ct[q * 12 + k] * BC.Ct[q * 12 + k]; nbb += BC.Cb[q * 12 + k] * BC.Cb[q * 12 + k]; }
      nt = Math.sqrt(nt); nbb = Math.sqrt(nbb);
      for (k = 0; k < 12; k++) { if (nt) T[bi * 12 + k] += BC.Ct[q * 12 + k] / nt; if (nbb) B[bi * 12 + k] += BC.Cb[q * 12 + k] / nbb; }
      e += BC.Ux[q] * (cb[q].r >= 0 ? 1 : 0.3); }
    /* how many notes the harmony has: a bass alone (its root and fifth) is not yet the song's harmony */
    var s1 = 0, s2 = 0; for (k = 0; k < 12; k++) { var v = T[bi * 12 + k]; s1 += v; s2 += v * v; }
    var neff = s2 > 0 ? s1 * s1 / s2 : 0;
    pres.push(e / Math.max(1, bar.e - bar.s) * clamp((neff - 1.8) / 1.2, 0.05, 1)); });
  if (TK && TK.due()) await TK.yield();
  function cos(A, x, y) { var d = 0, nx = 0, ny = 0; for (var z = 0; z < 12; z++) { d += A[x * 12 + z] * A[y * 12 + z]; nx += A[x * 12 + z] * A[x * 12 + z]; ny += A[y * 12 + z] * A[y * 12 + z]; }
    return nx > 0 && ny > 0 ? d / Math.sqrt(nx * ny) : (nx === ny ? 1 : 0); }
  var cs = barChordSim(bars, cb);
  var pmax = 0; pres.forEach(function (p) { if (p > pmax) pmax = p; });
  var sim = function (x, y) { var px = pres[x] / (pmax || 1), py = pres[y] / (pmax || 1), lv = Math.min(px, py) / Math.max(px, py, 1e-9);
    return 0.35 * cos(T, x, y) + 0.15 * cos(B, x, y) + 0.4 * cs(x, y) + 0.1 * lv; };
  /* every pair of bars, a row at a time, so a long song's parts are cut in slices too */
  var SM = new Float64Array(nb * nb);
  for (i = 0; i < nb; i++) { for (k = i + 1; k < nb; k++) SM[i * nb + k] = sim(i, k); if (TK && TK.due()) await TK.yield(); }
  if (TK && TK.soon()) await TK.yield();
  return finishSections(bars, beats, num, endT, function (x, y) { return SM[x * nb + y]; }, pres);
}
/* cut the bars into parts; the song may ring on after its last beat (a held last chord): that is (part of) the ending */
function finishSections(bars, beats, num, endT, sim, pres) {
  var nB = beats.length, ibi = nB > 1 ? (beats[nB - 1] - beats[0]) / (nB - 1) : 0.5, barLen = ibi * (num || 4);
  var lastEnd = bars.tailT != null ? bars.tailT : beats[nB - 1] + ibi, tail = Math.max(0, (endT - lastEnd) / barLen);
  var out = sectionsOut(bars, segmentBars(bars.length, sim, pres, tail), endT);
  if (out.length && tail >= 1.5) { var Ls = out[out.length - 1];
    if (Ls.kind !== "end" && lastEnd - Ls.t >= barLen) { Ls.d = r4(r4(lastEnd) - Ls.t); out.push({ t: r4(lastEnd), d: r4(r4(endT) - r4(lastEnd)), kind: "end", letter: "" }); } }
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
    if ((g & 7) === 0 && T.due()) await T.yield(); }
  return { sal: sal, low: low, en: en };
}
function slotsOf(beats, endT, per) {
  var s = [], nB = beats.length;
  for (var i = 0; i < nB; i++) { var t0 = beats[i], t1 = i < nB - 1 ? beats[i + 1] : Math.min(endT, t0 + (nB > 1 ? beats[i] - beats[i - 1] : 0.5));
    for (var j = 0; j < per; j++) s.push(t0 + (t1 - t0) * j / per); }
  if (nB) s.push(nB > 1 ? Math.min(endT, beats[nB - 1] + (beats[nB - 1] - beats[nB - 2])) : beats[0] + 0.5);
  return s;
}
async function bassLine(P, BS, beats, endT, ON, tune, T) {
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
    if ((i & 15) === 0) if (T && T.due()) await T.yield();
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
    var t = prev; prev = cur; cur = t; if ((i & 63) === 0) if (T && T.due()) await T.yield(); }
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
    i = j; if (T && T.due()) await T.yield(); }
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
    if ((g & 127) === 0) prog(g / nF);
    if ((g & 3) === 0 && T.due()) await T.yield();
  }
  return { cP: cP, cV: cV, cN: cN, top: top };
}
async function melodyLine(P, MS, beats, endT, ON, tune, T) {
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
    var t = prev; prev = cur; cur = t; if ((g & 127) === 0) if (T && T.due()) await T.yield(); }
  var st = 0, bv = -Infinity; for (i = 0; i < NS; i++) if (prev[i] > bv) { bv = prev[i]; st = i; }
  var pitch = new Float32Array(nF), val = new Float32Array(nF);
  for (g = nF - 1; g >= 0; g--) { if (st < MK) { pitch[g] = MS.cP[g * MK + st]; val[g] = MS.cV[g * MK + st]; } if (g > 0) st = bp[g * NS + st]; if ((g & 1023) === 0 && T && T.due()) await T.yield(); }
  /* semitones, smoothed by a median of five frames */
  var q = new Int16Array(nF), win = new Float64Array(5);
  for (g = 0; g < nF; g++) { if (!pitch[g]) { q[g] = 0; continue; } var c = 0;
    for (j = g - 2; j <= g + 2; j++) if (j >= 0 && j < nF && pitch[j]) win[c++] = pitch[j];
    q[g] = Math.round(selectK(win, c, c >> 1)); if ((g & 511) === 0 && T && T.due()) await T.yield(); }
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
    g = e; if (T && T.due()) await T.yield(); }
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
  var T = opts.ticker || new Ticker(opts.budget || 0, opts.signal), cb = opts.onProgress, lastP = -1;
  function report(p, key) { if (T.sig && T.sig.aborted) throw abortError();
    p = clamp(p, 0, 1); if (p < lastP) p = lastP; lastP = p; if (cb) try { cb(r4(p), key); } catch (e) {} }
  function stage(a, b, key) { report(a, key); return function (f) { report(a + (b - a) * f, key); }; }
  var sec = x.length / SR, i, peak = 0;
  for (i = 0; i < x.length; i++) { var av = x[i] < 0 ? -x[i] : x[i]; if (av > peak) peak = av; if ((i & 32767) === 0 && T.due()) await T.yield(); }
  if (peak > 0) { var gn = 0.9 / peak; for (i = 0; i < x.length; i++) { x[i] *= gn; if ((i & 32767) === 0 && T.due()) await T.yield(); } }

  /* beat */
  var ON = await onsetEnvelope(x, T, stage(0.05, 0.17, "beat"));
  var period = await estimatePeriod(ON.O, ON.fps, T);
  if (T.soon()) await T.yield();
  var beats = await trackBeats(ON.O, ON.R, ON.fps, period, T);
  if (T.soon()) await T.yield();
  if (beats.length < 4) { var p0 = 60 / (60 * ON.fps / period || 120); beats = []; for (var bt0 = 0; bt0 < sec; bt0 += p0) beats.push(bt0); }
  report(0.2, "beat");

  /* key (and the harmonic spectrum everything else hears); the drums in it settle where the beat falls */
  var P = await harmonicPeaks(x, T, stage(0.2, 0.55, "key")); if (T.soon()) await T.yield();
  var PH = fixBeatPhase(P, beats, sec);
  if (PH.flipped) { if (T.soon()) await T.yield();
    /* the tracker followed the off-beats: track again with the drums' own beat in the onsets, so it holds the whole song */
    var O2 = drumOnsets(ON, P); if (T.soon()) await T.yield();
    var b2 = await trackBeats(O2, ON.R, ON.fps, period, T); if (T.soon()) await T.yield();
    if (b2.length >= 8) { var PH2 = fixBeatPhase(P, b2, sec); PH = PH2.flipped ? PH2 : { beats: b2 }; }
  }
  beats = PH.beats; if (T.soon()) await T.yield();
  var bpm = tempoOf(beats) || 60 * ON.fps / period;
  var nB = beats.length, ibi = nB > 1 ? (beats[nB - 1] - beats[0]) / (nB - 1) : 0.5, endT = Math.min(sec, beats[nB - 1] + ibi);
  var lowAcc = new Float64Array(nB);
  for (i = 0; i < nB; i++) { var fr = Math.round(beats[i] * ON.fps), m = 0; for (var z = fr - 2; z <= fr + 2; z++) if (z >= 0 && z < ON.Ol.length && ON.Ol[z] > m) m = ON.Ol[z]; lowAcc[i] = m; }
  var tune = await estimateTuning(P, T); if (T.soon()) await T.yield();
  var BC = await beatChroma(P, tune, beats, sec, T); if (T.soon()) await T.yield();
  var beatDur = new Float64Array(nB); for (i = 0; i < nB; i++) beatDur[i] = (i < nB - 1 ? beats[i + 1] : endT) - beats[i];
  var S = await chordScores(BC, TEMPL_AUDIO, false, T), kappa = 20;
  if (T.soon()) await T.yield();
  var path1 = viterbi(S, nB, chordChangeCost(nB, 1, 0, 2.4), keyPenalty(null), kappa); if (T.soon()) await T.yield();
  var key = estimateKey(BC, bassAlone(path1, BC), beatDur); if (T.soon()) await T.yield();
  report(0.6, "key"); if (T.soon()) await T.yield();

  /* chords, with bar one */
  report(0.62, "chords");
  var DB = findDownbeats(BC, path1, lowAcc); if (T.soon()) await T.yield();
  var path = viterbi(S, nB, chordChangeCost(nB, DB.num, DB.phase, 2.4), keyPenalty(key), kappa); if (T.soon()) await T.yield();
  var key2 = estimateKey(BC, bassAlone(path, BC), beatDur, key); if (key2.key !== key.key || key2.minor !== key.minor) { key = key2; path = viterbi(S, nB, chordChangeCost(nB, DB.num, DB.phase, 2.4), keyPenalty(key), kappa); if (T.soon()) await T.yield(); }
  path = qualityPass(path, BC); if (T.soon()) await T.yield();
  path = bassAlone(path, BC); if (T.soon()) await T.yield();
  var chords = chordSegments(path, S, beats, endT, key); if (T.soon()) await T.yield();
  var downbeats = []; for (i = DB.phase; i < nB; i += DB.num) downbeats.push(r4(beats[i]));
  if (T.soon()) await T.yield();
  var sections = await sectionsOfAudio(BC, path, beats, downbeats, DB.num, sec, T);
  report(0.7, "chords"); if (T.soon()) await T.yield();

  /* bass */
  report(0.72, "bass");
  var BS = await bassSalience(P, tune, T); if (T.soon()) await T.yield();
  var bass = await bassLine(P, BS, beats, endT, ON, tune, T); BS = null; if (T.soon()) await T.yield();
  report(0.78, "bass"); if (T.soon()) await T.yield();

  /* melody */
  var MS = await melodySalience(P, tune, T, stage(0.8, 0.97, "melody"));
  var melody = await melodyLine(P, MS, beats, endT, ON, tune, T); MS = null;
  report(1, "done");
  return {
    v: 1, src: "audio", name: opts.name || "", sec: r4(sec), sr: SR, bpm: Math.round(bpm * 10) / 10,
    beats: beats.map(r4), downbeats: downbeats, meter: { num: DB.num, den: 4 }, key: key, tuning: Math.round(tune * 100),
    chords: chords, bass: bass, melody: melody, tracks: [], sections: sections,
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
  var lesson = {
    v: 1, src: "midi", name: opts.name || names[0] || "", sec: r4(sec), sr: SR, bpm: Math.round(bpm * 100) / 100,
    beats: beats, downbeats: downbeats, meter: meter, key: key, tuning: 0, chords: chords,
    bass: bass.map(function (n) { return { t: n.t, d: n.d, m: n.m, conf: 1 }; }), melody: melody.map(function (n) { return { t: n.t, d: n.d, m: n.m, conf: 1 }; }),
    tracks: tracks, notes: allNotes.map(function (n) { return { t: n.t, d: n.d, m: n.m, v: n.v }; })
  };
  lesson.sections = sectionsOfLesson(lesson);
  return lesson;
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

/* ───────── a chord played now: AOGLearn.hearChord(samples, sr, key, minor) ───────── */
/* For the rooms' "play along": a strum on a guitar (or a chord over a bass) in about 0.15-0.5 s of sound, named in well under
   3 ms, so it can be asked ten times a second on a phone. It brings the sound down to about 11 kHz, takes one long window
   (up to 4096 samples, 0.37 s, the newest sound), finds the spectral peaks, keeps each string's own note (a peak on an
   overtone of a lower note hardly counts again), needs at least two different notes struck, and matches what it heard
   against the chord templates, with the lowest note leaning toward the root. Silence, noise and a single note give null. */
var HC = null, HC_TOL = 0.02,   /* an overtone: within 2% of a whole multiple of a lower note */
    HC_OV = 0.1,                /* … and then it counts this much */
    HC_N0 = 0.2,                /* a note struck: at least this share of the loudest one */
    HC_LOWA = 0.25, HC_LOW = 0.06,   /* the lowest clear note leans toward the root */
    HC_PEN = { maj: 0, min: 0, "7": 0.006, maj7: 0.006, m7: 0.006, sus2: 0.045, sus4: 0.045, dim: 0.05, aug: 0.06, "5": 0.08 };
function hcSetup() { if (HC) return HC; var N = 4096;
  HC = { N: N, mag: makeRealMag(N, 1200), frame: new Float32Array(N), sp: new Float32Array(N / 2 + 1), own: new Float32Array(256), C: new Float64Array(12), C0: new Float64Array(12), sc: new Float64Array(NSTATE),
    pf: new Float64Array(256), pa: new Float64Array(256), fund: new Int16Array(256), tmp: new Float64Array(N / 2 + 1) };   /* made once, used by every call */
  return HC; }
function hearChord(x, sr, key, minor) {
  if (!x || !x.length || !(sr > 0)) return null;
  var H = hcSetup(), N = H.N, f = Math.max(1, Math.round(sr / 11025)), fs = sr / f, n = Math.min(N, Math.floor(x.length / f)), i, j, k;
  if (n < 0.1 * fs) return null;
  /* the newest n samples, averaged down by f, with a Hann window over just those */
  var st = x.length - n * f, e = 0, mean = 0;
  for (i = 0; i < n; i++) { var s = 0, b = st + i * f; for (k = 0; k < f; k++) s += x[b + k]; H.frame[i] = s / f; mean += H.frame[i]; }
  mean /= n;
  for (i = 0; i < n; i++) { var v = H.frame[i] - mean; e += v * v; H.frame[i] = v * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / n)); }
  for (i = n; i < N; i++) H.frame[i] = 0;
  if (Math.sqrt(e / n) < 0.002) return null;                 /* silence (below about -54 dB) */
  var sp = H.sp, kLo = Math.max(2, Math.floor(36 * N / fs)), kHi = Math.min(N / 2 - 2, Math.ceil(2400 * N / fs));
  H.mag(H.frame, sp);
  /* peaks: local maxima well above the floor */
  var mx = 0; for (k = kLo; k <= kHi; k++) if (sp[k] > mx) mx = sp[k];
  if (mx <= 0) return null;
  var nk = kHi - kLo + 1; for (k = 0; k < nk; k++) H.tmp[k] = sp[kLo + k];
  var med = selectK(H.tmp, nk, nk >> 1), thr = Math.max(0.03 * mx, 2 * med), pf = H.pf, pa = H.pa, np = 0;
  for (k = kLo + 1; k < kHi && np < 256; k++) { var y = sp[k]; if (y > thr && y > sp[k - 1] && y >= sp[k + 1]) {
      var la = Math.log(sp[k - 1] + 1e-12), lb = Math.log(y + 1e-12), lc = Math.log(sp[k + 1] + 1e-12), den = la - 2 * lb + lc, dl = den < 0 ? clamp(0.5 * (la - lc) / den, -0.5, 0.5) : 0;
      pf[np] = (k + dl) * fs / N; pa[np] = Math.sqrt(Math.exp(lb - 0.25 * (la - lc) * dl)); np++; } }
  if (np < 2) return null;
  /* noise: a sound with no clear peaks */
  var lg = 0, am = 0, fn = 0; for (k = kLo; k <= kHi; k += 2) { lg += Math.log(sp[k] + 1e-9); am += sp[k]; fn++; }
  if (Math.exp(lg / fn) / (am / fn) > 0.35) return null;
  /* each string's own note: a peak on an overtone (2×, 3× …) of a lower note hardly counts again */
  var own = H.own, fund = H.fund, nf = 0;
  for (i = 0; i < np; i++) { own[i] = pa[i]; var harm = false;
    for (j = 0; j < nf && !harm; j++) { var r = pf[i] / pf[fund[j]], h = Math.round(r); if (h >= 2 && Math.abs(r - h) < HC_TOL * h) harm = true; }
    if (harm) own[i] *= HC_OV; else fund[nf++] = i; }
  /* how many different notes were struck (the strings' own notes only: one note's overtones look like a chord) */
  var C0 = H.C0, c0m = 0, n0 = 0; C0.fill(0);
  for (i = 0; i < nf; i++) { var mf = Math.round(hzToMidi(pf[fund[i]])); C0[((mf % 12) + 12) % 12] += pa[fund[i]]; }
  for (k = 0; k < 12; k++) if (C0[k] > c0m) c0m = C0[k];
  for (k = 0; k < 12; k++) if (C0[k] >= HC_N0 * c0m) n0++;
  if (n0 < 2) return null;
  /* the tuning (the circular mean of the peaks), then the colour */
  var ts = 0, tc = 0; for (i = 0; i < np; i++) { var p = hzToMidi(pf[i]), th = 2 * Math.PI * (p - Math.round(p)); ts += own[i] * Math.sin(th); tc += own[i] * Math.cos(th); }
  var tune = (ts || tc) ? Math.atan2(ts, tc) / (2 * Math.PI) : 0, C = H.C, low = -1, lowM = 1e9, om = 0;
  C.fill(0);
  for (i = 0; i < np; i++) if (own[i] > om) om = own[i];
  for (i = 0; i < np; i++) { var q = hzToMidi(pf[i]) - tune, m = Math.round(q), dd = q - m;
    C[((m % 12) + 12) % 12] += own[i] * Math.pow(Math.cos(Math.PI * dd), 2); if (own[i] >= HC_LOWA * om && m < lowM) { lowM = m; low = ((m % 12) + 12) % 12; } }
  var cmax = 0, strong = 0, ct = 0, nn = 0; for (k = 0; k < 12; k++) { if (C[k] > cmax) cmax = C[k]; ct += C[k]; nn += C[k] * C[k]; }
  for (k = 0; k < 12; k++) if (C[k] >= 0.2 * cmax) strong++;
  nn = Math.sqrt(nn); if (strong < 2 || !nn) return null;
  /* the chord templates (the same ones the song listening uses) */
  var SC = H.sc, best = -Infinity, bs = 0, second = -Infinity, s2;
  for (s2 = 0; s2 < NSTATE; s2++) { var to = s2 * 12, dot = 0; for (k = 0; k < 12; k++) dot += C[k] * TEMPL_AUDIO[to + k];
    SC[s2] = dot / nn - HC_PEN[QUALS[s2 % 10]] + (((s2 / 10) | 0) === low ? HC_LOW : 0);
    if (SC[s2] > best) { best = SC[s2]; bs = s2; } }
  var R = (bs / 10) | 0, Q = QUALS[bs % 10];
  for (s2 = 0; s2 < NSTATE; s2++) if (((s2 / 10) | 0) !== R && SC[s2] > second) second = SC[s2];
  var iv = IVS[Q], inC = 0; for (k = 0; k < iv.length; k++) inC += C[(R + iv[k]) % 12];
  var conf = clamp((best - second) / 0.15, 0, 1) * clamp((inC / (ct || 1) - 0.5) / 0.4, 0, 1) * clamp((strong - 1) / 2, 0.3, 1);
  if (strong < 3 && Q !== "5") conf *= 0.5;
  if (conf < 0.05) return null;
  return { root: R, q: Q, name: chordName(R, Q, key == null ? null : key, !!minor), conf: r2(conf) };
}

/* ───────── easier chords, and the capo ───────── */
var SIMPLE = { maj: "maj", min: "min", "7": "maj", maj7: "maj", m7: "min", sus2: "maj", sus4: "maj", dim: "min", aug: "maj", "5": "maj", N: "N" };
/* AOGLearn.simplify(chord, key, minor): the same chord as three notes everyone learns first (7 maj7 sus2 sus4 aug 5 → major;
   m7 dim → minor); a copy, with its name spelled again in the key */
function simplify(c, key, minor) {
  if (!c) return c; var o = {}; for (var p in c) if (Object.prototype.hasOwnProperty.call(c, p)) o[p] = c[p];
  var q = SIMPLE[c.q] || c.q; o.q = q;
  o.name = c.root < 0 || q === "N" ? "N.C." : chordName(c.root, q, key == null ? null : key, !!minor);
  return o;
}
/* the open shapes a beginner plays: C A G E D, Am Em Dm, and their 7ths */
var OPEN_SHAPES = { "0maj": 1, "9maj": 1, "7maj": 1, "4maj": 1, "2maj": 1, "9min": 1, "4min": 1, "2min": 1,
  "07": 1, "97": 1, "77": 1, "47": 1, "27": 1, "0maj7": 1, "9maj7": 1, "7maj7": 1, "4maj7": 1, "2maj7": 1, "9m7": 1, "4m7": 1, "2m7": 1 };
/* AOGLearn.capo(lesson): the capo fret (0-7) that lets the most of the song's chord time be played with open shapes;
   shapes: what each chord is played as; open: the share of the chord time that is open shapes then */
function capoOf(L) {
  var ch = (L && L.chords) || [], tot = 0, i, key = L && L.key ? L.key.key : null, minor = L && L.key ? !!L.key.minor : false;
  ch.forEach(function (c) { if (c.root >= 0 && c.q !== "N") tot += c.d; });
  function shapeQ(q) { return q === "7" || q === "maj7" || q === "m7" || q === "maj" || q === "min" ? q : SIMPLE[q]; }
  var best = { fret: 0, open: -1 };
  for (var fr = 0; fr <= 7; fr++) { var op = 0;
    ch.forEach(function (c) { if (c.root < 0 || c.q === "N") return; var r = ((c.root - fr) % 12 + 12) % 12, q = shapeQ(c.q);
      if (OPEN_SHAPES[r + q] || OPEN_SHAPES[r + SIMPLE[q]]) op += c.d; });
    var frac = tot ? op / tot : 0; if (frac > best.open + 1e-9) best = { fret: fr, open: frac }; }
  if (best.open < 0) best.open = 0;
  var seen = {}, shapes = [];
  ch.forEach(function (c) { if (c.root < 0 || c.q === "N") return; var nm = chordName(c.root, c.q, key, minor); if (seen[nm]) return; seen[nm] = 1;
    var r = ((c.root - best.fret) % 12 + 12) % 12, q = shapeQ(c.q), qs = OPEN_SHAPES[r + q] ? q : OPEN_SHAPES[r + SIMPLE[q]] ? SIMPLE[q] : q;
    shapes.push({ from: nm, shape: chordName(r, qs, null, false) }); });
  return { fret: best.fret, shapes: shapes, open: r2(best.open) };
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
function toMono22k(buf, T) {     /* T: on the page, a slice timer (a long song is not copied all at once) */
  if (buf.sampleRate === SR) { var n = buf.length, out = new Float32Array(n), ch = buf.numberOfChannels;
    return (async function () { for (var c = 0; c < ch; c++) { var d = buf.getChannelData(c);
      for (var i = 0; i < n; i++) { out[i] += d[i] / ch; if ((i & 32767) === 0 && T && T.due()) { await T.yield(); d = buf.getChannelData(c); } } } return out; })(); }
  var C = OAC(), len = Math.max(1, Math.ceil(buf.length * SR / buf.sampleRate)), ctx = new C(1, len, SR), src = ctx.createBufferSource();
  src.buffer = buf; src.connect(ctx.destination); src.start(0);
  return new Promise(function (res, rej) { var done = false;
    ctx.oncomplete = function (e) { if (!done) { done = true; res(e.renderedBuffer.getChannelData(0).slice()); } };
    var p = ctx.startRendering(); if (p && p.then) p.then(function (b) { if (!done) { done = true; res(b.getChannelData(0).slice()); } }, rej); });
}
function readBlob(b) { if (b.arrayBuffer) return b.arrayBuffer(); return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; r.readAsArrayBuffer(b); }); }

function inWorker(pcm, opts) {
  return new Promise(function (res, rej) {
    var w; try { w = new Worker(workerURL()); } catch (e) { return rej(e); }
    /* asked to stop: the worker ends at once; done or not, nothing is left running or listening */
    var onAbort = function () { end(); rej(abortError()); };
    function end() { clearTimeout(timer); try { w.terminate(); } catch (e) {} if (opts.signal) opts.signal.removeEventListener("abort", onAbort); w.onmessage = w.onerror = null; }
    if (opts.signal) opts.signal.addEventListener("abort", onAbort);
    var started = false, timer = setTimeout(function () { if (!started) { end(); rej(new Error("worker did not start")); } }, 8000);
    w.onmessage = function (e) { var d = e.data || {};
      if (d.type === "ready" && !started) { started = true; clearTimeout(timer); w.postMessage({ type: "analyze", pcm: pcm, name: opts.name || "" }, [pcm.buffer]); }
      else if (d.type === "progress") { if (opts.onProgress) try { opts.onProgress(d.p, d.key); } catch (er) {} }
      else if (d.type === "done") { end(); res(d.lesson); }
      else if (d.type === "error") { end(); var er2 = new Error(d.message); er2.fromWorker = true; rej(er2); } };
    w.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); var was = started; end(); if (!was) rej(new Error("worker failed")); else { var x = new Error("worker failed"); x.fromWorker = true; rej(x); } };
  });
}

function analyze(input, opts) {
  opts = opts || {};
  var sig = opts.signal || null;
  if (sig && sig.aborted) return Promise.reject(abortError());
  if (!sig) return analyzeNow(input, opts, null);
  var onAbort, stopped = new Promise(function (r, j) { onAbort = function () { j(abortError()); }; sig.addEventListener("abort", onAbort); });
  stopped.catch(function () {});
  var work = analyzeNow(input, opts, sig), off = function () { sig.removeEventListener("abort", onAbort); };
  work.then(off, off);
  return Promise.race([work, stopped]);
}
function analyzeNow(input, opts, sig) {
  function check(x) { if (sig && sig.aborted) throw abortError(); return x; }
  var name = opts.name || (input && typeof input.name === "string" ? input.name.replace(/\.[a-z0-9]{1,5}$/i, "") : "");
  var say = function (p, k) { if (opts.onProgress) try { opts.onProgress(p, k); } catch (e) {} };
  say(0, "open");
  var get = (G.AudioBuffer && input instanceof G.AudioBuffer) || (input && input.getChannelData && input.sampleRate) ? Promise.resolve({ buf: input })
    : (G.Blob && input instanceof G.Blob) ? readBlob(input).then(function (ab) { return { ab: ab }; })
    : Promise.resolve({ ab: input instanceof ArrayBuffer ? input : u8Of(input).slice().buffer });
  return get.then(check).then(function (r) {
    if (r.ab && isMidi(r.ab)) { say(0.5, "midi"); var L = fromMidi(r.ab, { name: name }); say(1, "done"); return L; }
    /* on the page, one slice timer from here to the lesson, so no slice runs longer than SLICE ms (and a little); the work
       starts in a task of its own, not in the caller's */
    var TK = new Ticker(SLICE, sig);
    return (r.buf ? Promise.resolve(r.buf) : decode(r.ab)).then(check).then(function (b) { return TK.yield().then(function () { return toMono22k(b, TK); }); }).then(check).then(function (pcm) {
      say(0.04, "open");
      var o = { name: name, onProgress: opts.onProgress, signal: sig };
      var main = function () { return analyzePCM(pcm, { name: name, onProgress: opts.onProgress, ticker: TK, signal: sig }); };
      if (opts.worker === false || typeof G.Worker === "undefined") return main();
      /* the samples move to the worker only once it says it is ready, so if it cannot start the page still listens */
      return inWorker(pcm, o).catch(function (e) { if (e && (e.fromWorker || e.name === "AbortError")) throw e; return main(); });
    });
  });
}

var AOGLearn = {
  version: 1, sr: SR, words: WORDS, analyze: analyze, fromMidi: fromMidi, isMidi: isMidi,
  chordName: chordName, keyName: keyName, spell: spell, gmName: function (p) { return GM[p] || ""; },
  word: function (key, lang) { var w = WORDS[lang === "es" ? "es" : "en"]; return w[key] || ""; },
  sections: sectionsOfLesson, hearChord: hearChord, simplify: simplify, capo: capoOf,
  workerURL: null, _analyzePCM: analyzePCM
};
G.AOGLearn = AOGLearn;
if (typeof module !== "undefined" && module.exports) module.exports = AOGLearn;
})(typeof self !== "undefined" ? self : typeof globalThis !== "undefined" ? globalThis : this);
