/* ══ AOG-JAM-V1 (2026-10-12) — A band that follows you: the band (window.AOGJamBand) ═════════════════════════════════
   Fetched by aog-jam.js the first time "Jam with me" is opened. Nothing sounds, loads or ticks until Start the band.

   What it hears. Every note the room plays passes through AOGRecorder.note (the keys, a strum, a chord button, a MIDI
   keyboard: AOG-NOTES-V1); this wraps it, and while the band is off the wrap costs one test. A real guitar or bass comes
   through AOGLive.listen (aog-liveinput.js, single notes, while its input is on), and through AOGLive.frames with
   AOGLearn.hearChord where those exist (they are feature-detected: a frame with a 12-long chroma, or a heard chord
   {root, q}). The room's own pattern (busy) and its drum strokes (e.kit) are not the learner's. The band's own notes
   never pass through AOGRecorder.note, so it never hears itself.

   The chord. The notes of a short window (about three beats, the older ones fading) are matched against chord shapes
   (major, minor, 7, m7, maj7, sus2, sus4, dim, 5): the shape's notes count for it, other notes against it, the lowest
   note favours its own root, a chord that belongs to the song's key a little. A strum or a held chord (three notes or
   more at once) is judged on its own at once; single notes must agree twice and win clearly (hysteresis), so a passing
   note does not move the band. Names follow the song's key (sharps or flats; Do Re Mi in Spanish).

   The bass (or, in the Bass room, the keys) plays the chord's root and fifth in the feel. A new chord takes over from the
   next note of the pattern; played on the beat, the note already sounding is changed at once.

   The tempo. Each onset is placed on the band's half-beat grid; a straight line through the last six beats of onsets
   gives the learner's beat length and where their beat falls. Each beat the band moves a part of the way there: never
   more than 2.5 % a beat (so never more than about 10 % a bar). Keep steady holds it. The learner hears the band later
   than it is scheduled (the output delay: the browser's own figure, or half the Timing check's round trip, AOGLatency /
   aog.latency.v1), and plays to what they hear, so that delay is taken off each onset; a real instrument also arrives
   late by the input half and the listener's own time.

   Timing. Everything is laid on the AudioContext clock 0.12 s ahead (a 25 ms timer, only while the band plays).
   Where it goes. The band joins the room's Volume (heard, never in a take) or, with Record the band too, the room's
   limiter, which the recorder listens to. Band level is its own gain. The room's pedals stay the learner's.
   Sounds. The Drum Machine's recorded kits (aog-drumkit.js, loaded on Start: kit P for rock, V brush ballad, W funk,
   U jazz club, Y hip-hop break, M reggae), the recorded electric bass (audio/bass/growly, eleven notes), a soft
   electric piano made here; until they are in, or if they cannot load, simple sounds made here.
   When you stop. With no note for a bar and a half, the band plays to the next bar line, then fades over one bar and
   ends, unless Keep playing when I stop is on; a note during the fade brings it back. Out of sight (the Studio's
   aog-hush, the page hidden, the room's frame hidden) it pauses; back in sight it carries on at the next bar.
   AOGJamBand.test: a list of everything it scheduled, its beats, its state, made sounds only, a fed note. ══════════ */
(function () {
  "use strict";
  var D = document, H = null, UI = null;
  var W = {
    intro: { en: "Play, and the band follows your chords and your tempo.", es: "Toca, y la banda sigue tus acordes y tu tempo." },
    feel: { en: "The feel", es: "El estilo" },
    who: { en: "Who plays", es: "Quién toca" },
    tempo: { en: "Tempo", es: "Tempo" },
    follow: { en: "Follow my tempo", es: "Seguir mi tempo" },
    steady: { en: "Keep steady", es: "Tempo fijo" },
    count: { en: "Count me in", es: "Cuenta antes de empezar" },
    keep: { en: "Keep playing when I stop", es: "Seguir tocando cuando pare" },
    rec: { en: "Record the band too", es: "Grabar también la banda" },
    level: { en: "Band level", es: "Volumen de la banda" },
    start: { en: "Start the band", es: "Empezar la banda" },
    stop: { en: "Stop the band", es: "Parar la banda" },
    hears: { en: "The band hears", es: "La banda oye" },
    none: { en: "Play a chord", es: "Toca un acorde" },
    bpm: { en: "{n} beats a minute", es: "{n} pulsos por minuto" },
    getting: { en: "Getting the band ready…", es: "Preparando la banda…" },
    counting: { en: "Four clicks, then the band comes in.", es: "Cuatro clics y luego entra la banda." },
    playing: { en: "The band is playing. Play along, and it follows you.", es: "La banda está tocando. Toca con ella y te sigue." },
    steadyOn: { en: "The band is playing at a steady tempo.", es: "La banda está tocando con un tempo fijo." },
    ending: { en: "You stopped, so the band is ending softly.", es: "Paraste, así que la banda termina suave." },
    ended: { en: "The band ended softly. Press Start the band to play again.", es: "La banda terminó suave. Pulsa Empezar la banda para tocar otra vez." },
    stopped: { en: "The band stopped.", es: "La banda paró." },
    simple: { en: "The recorded band did not load, so it plays simpler sounds.", es: "La banda grabada no se cargó, así que toca con sonidos más sencillos." },
    feels: {
      rock: { en: "Steady rock", es: "Rock firme" }, ballad: { en: "Slow ballad", es: "Balada lenta" }, funk: { en: "Funk", es: "Funk" },
      swing: { en: "Swing", es: "Swing" }, hiphop: { en: "Hip-hop", es: "Hip-hop" }, reggae: { en: "Reggae", es: "Reggae" } },
    whos: {
      db: { en: "Drums and bass", es: "Batería y bajo" }, d: { en: "Drums only", es: "Solo batería" }, b: { en: "Bass only", es: "Solo bajo" },
      dk: { en: "Drums and keys", es: "Batería y teclado" }, k: { en: "Keys only", es: "Solo teclado" } }
  };
  function L() { try { if (H && H.lang) return H.lang() === "es" ? "es" : "en"; } catch (e) {} return (D.documentElement.getAttribute("lang") || "en").indexOf("es") === 0 ? "es" : "en"; }
  function pick(o) { return o ? (o[L()] || o.en) : ""; }
  function w(k, v) { var s = pick(W[k]); if (v) for (var n in v) s = s.split("{" + n + "}").join(v[n]); return s; }
  function $(id) { return D.getElementById(id); }

  /* ── music words ── */
  var Q = { maj: [0, 4, 7], min: [0, 3, 7], "7": [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], sus4: [0, 5, 7], sus2: [0, 2, 7], dim: [0, 3, 6], "5": [0, 7] };
  var QS = Object.keys(Q);
  var QPEN = { maj: 0, min: 0, "7": 0.04, m7: 0.04, maj7: 0.05, sus4: 0.07, sus2: 0.07, dim: 0.08, "5": 0.05 };
  var SUF = { maj: "", min: "m", "7": "7", m7: "m7", maj7: "maj7", sus4: "sus4", sus2: "sus2", dim: "dim", "5": "5" };
  var NM = { en: { s: ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"], f: ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"] },
    es: { s: ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"], f: ["Do", "Re♭", "Re", "Mi♭", "Mi", "Fa", "Sol♭", "Sol", "La♭", "La", "Si♭", "Si"] } };
  function pc(m) { return ((Math.round(m) % 12) + 12) % 12; }
  function songKey() {
    try { var s = window.AOGSong && AOGSong.get(); if (s && s.hasKey) return { key: s.key | 0, minor: !!s.minor }; } catch (e) {}
    try { var r = H && H.song && H.song(); if (r && r.key >= 0) return { key: r.key % 12, minor: !!r.minor }; } catch (e) {}
    return { key: 0, minor: false };
  }
  function songBpm() {
    var b = 0;
    try { var s = window.AOGSong && AOGSong.get(); if (s && s.hasBpm) b = +s.bpm; } catch (e) {}
    if (!(b > 0)) { try { b = +(H && H.song && H.song().bpm) || 0; } catch (e) { b = 0; } }
    return Math.max(40, Math.min(240, b > 0 ? b : 100));
  }
  function flats(k) { var maj = k.minor ? (k.key + 3) % 12 : k.key; return [5, 10, 3, 8, 1].indexOf(maj) >= 0; }
  function nameOf(c, lang) {
    if (!c) return "";
    var lg = lang || L(), s = SUF[c.q] || "";
    return NM[lg][flats(songKey()) ? "f" : "s"][c.root] + (lg === "es" && /^[a-z]/i.test(s) ? " " + s : s);
  }
  /* the chord the key has on this root, if any (and the major V of a minor key) */
  function diatonic(r, k) {
    var sc = k.minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11], d = (r - k.key + 12) % 12, i = sc.indexOf(d);
    if (i < 0) return null;
    var third = (sc[(i + 2) % 7] - d + 12) % 12, fifth = (sc[(i + 4) % 7] - d + 12) % 12;
    return third === 4 ? "maj" : fifth === 6 ? "dim" : "min";
  }
  function scoreOf(wt, bass, r, q, k, tot, mx, win) {
    var iv = Q[q], inS = 0, cov = 0;
    for (var i = 0; i < iv.length; i++) { var x = wt[(r + iv[i]) % 12]; inS += x; if (x > 0.3 * mx) cov++; }
    var dq = diatonic(r, k), dia = dq === q || (q === "7" && dq === "maj") || (q === "m7" && dq === "min") || (q === "maj7" && dq === "maj")
      || (k.minor && (r - k.key + 12) % 12 === 7 && (q === "maj" || q === "7"));
    /* win: single notes over a few beats, where a passing note is not yet a 7th or a sus */
    return (inS - 0.8 * (tot - inS)) / tot + 0.25 * cov / iv.length - QPEN[q] * (win ? 2 : 1) + (bass === r ? 0.15 : 0) + (dia ? 0.05 : 0);
  }
  function judgeW(wt, bass, cur, win) {
    var tot = 0, mx = 0, i; for (i = 0; i < 12; i++) { tot += wt[i]; if (wt[i] > mx) mx = wt[i]; }
    if (!(tot > 0)) return null;
    var k = songKey(), top = null;
    for (var r = 0; r < 12; r++) { if (wt[r] <= 0) continue;   /* a chord whose root is not played is not guessed */
      for (i = 0; i < QS.length; i++) { var s = scoreOf(wt, bass, r, QS[i], k, tot, mx, win); if (!top || s > top.s) top = { root: r, q: QS[i], s: s }; } }
    if (top) top.cur = cur ? scoreOf(wt, bass, cur.root, cur.q, k, tot, mx, win) : -9;
    return top;
  }

  /* ── the feels: drums by step (16 a bar: . rest, 1 normal, 2 accent, 3 soft), the bass [step, degree, steps],
     the keys [step, "C", steps]. Degrees: R root, 5 fifth, 8 octave, 3 the chord's third, A the step up to the next
     bar (sixth, or flat seventh on a minor or seventh chord). pads: each drum's pad in the kit ── */
  var FEELS = {
    rock: { kit: "P", pads: { kick: "kick", snare: "snare", hat: "ch", open: "oh", stick: "clap" },
      d: { kick: "2.......2.1.....", snare: "....2.......2...", hat: "1.1.1.1.1.1.1.1." },
      b: [[0, "R", 2], [2, "R", 2], [4, "R", 2], [6, "R", 2], [8, "R", 2], [10, "R", 2], [12, "5", 2], [14, "8", 2]], k: [[0, "C", 7], [8, "C", 7]] },
    ballad: { kit: "V", sw8: 0.62, pads: { kick: "kick", snare: "snare", hat: "ch", brush: "clap", ride: "rim" },
      d: { brush: "1.......1.......", snare: "....2.......2...", hat: "....3.......3...", kick: "3.......3......." },
      b: [[0, "R", 7], [8, "5", 7]], k: [[0, "C", 15]] },
    funk: { kit: "W", sw16: 0.54, pads: { kick: "kick", snare: "snare", hat: "ch", open: "oh", stick: "clap" },
      d: { hat: "1313131313131303", open: "..............1.", kick: "2.....1..1......", snare: "..3.2..3..3.2..3" },
      b: [[0, "R", 2], [3, "8", 1], [6, "R", 1], [7, "5", 1], [10, "R", 2], [12, "8", 1], [14, "5", 1]], k: [[2, "C", 1], [6, "C", 1], [11, "C", 1], [14, "C", 1]] },
    swing: { kit: "U", sw8: 0.66, pads: { kick: "kick", snare: "snare", ride: "rim", foot: "clap", hat: "ch" },
      d: { ride: "1...2.1.1...2.1.", foot: "....1.......1...", kick: "3...3...3...3...", snare: "......3...3....." },
      b: [[0, "R", 4], [4, "3", 4], [8, "5", 4], [12, "A", 4]], k: [[6, "C", 2], [12, "C", 3]] },
    hiphop: { kit: "Y", sw16: 0.58, pads: { kick: "kick", snare: "snare", hat: "ch", open: "oh" },
      d: { kick: "2.....1..1......", snare: "....2......32...", hat: "1.1.1.1.1.1.1...", open: "..............1." },
      b: [[0, "R", 5], [7, "R", 2], [9, "5", 3], [14, "8", 2]], k: [[0, "C", 8], [8, "C", 7]] },
    reggae: { kit: "M", pads: { kick: "kick", stick: "rim", hat: "ch", open: "oh" },
      d: { kick: "........2.......", stick: "........2.......", hat: "3.3.3.3.3.3.3.3." },
      b: [[0, "R", 3], [4, "R", 1], [6, "5", 2], [10, "8", 2], [12, "5", 2]], k: [[4, "C", 1], [12, "C", 1]] }
  };
  var FEEL_IDS = ["rock", "ballad", "funk", "swing", "hiphop", "reggae"];
  var DLEV = { kick: 0.55, snare: 0.5, hat: 0.3, open: 0.28, stick: 0.4, brush: 0.4, ride: 0.32, foot: 0.32 };

  /* ── what is chosen (kept on this device; Record the band too is chosen each time) ── */
  var KEY = "aog.jam.v1";
  var O = { feel: "rock", who: "db", follow: true, count: true, keep: false, level: 70, rec: false };
  try { var kept = JSON.parse(localStorage.getItem(KEY) || "null"); if (kept && typeof kept === "object") {
    if (FEELS[kept.feel]) O.feel = kept.feel; if (/^(db|d|b)$/.test(kept.who)) O.who = kept.who;
    if (typeof kept.follow === "boolean") O.follow = kept.follow; if (typeof kept.count === "boolean") O.count = kept.count;
    if (typeof kept.keep === "boolean") O.keep = kept.keep; if (kept.level >= 0 && kept.level <= 100) O.level = +kept.level; } } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ feel: O.feel, who: O.who, follow: O.follow, count: O.count, keep: O.keep, level: O.level })); } catch (e) {} }
  function bassRoom() { return !!(H && H.room === "bass"); }
  function drumsOn() { return O.who !== "b"; }
  function tonalOn() { return O.who !== "d"; }

  /* ── the band's state ── */
  var LOOK = 0.12, TICK = 25, MAXSTEP = 0.025, SUB = 4;
  var AC = null, J = { on: false };
  var TEST = { made: false };
  var LOG = [], BEATS = [];
  /* what the learner played: a ring of notes (corrected time, note, strength), and the onsets on the band's grid */
  var RC = 96, RT = new Float64Array(RC), RM = new Int16Array(RC), RV = new Float32Array(RC), RI = 0, RN = 0;
  var OC = 64, OT = new Float64Array(OC), OQ = new Float64Array(OC), OI = 0, ON = 0;
  var WT = new Float64Array(12), WC = new Float64Array(12);
  var EV = [];   /* everything scheduled that can still be cancelled: {t, end, nodes, tonal, kind, deg, steps, log} */

  /* ── sounds ── */
  var KIT = { want: "", ready: "" }, BASS = { state: "", zones: [] }, NOISE = null;
  function loadScript(src) {
    return new Promise(function (ok, no) { var s = D.createElement("script"); s.src = src; s.async = true; s.onload = ok; s.onerror = no; D.head.appendChild(s); });
  }
  function loadKit(b) {
    KIT.want = b;
    var go = window.AOGDrumKit ? Promise.resolve() : loadScript("/aog-drumkit.js");
    return go.then(function () {
      if (!window.AOGDrumKit) return;
      if (AOGDrumKit.ready(b)) { KIT.ready = b; return; }
      return AOGDrumKit.load(b, {}, {}, function (x) { return x; }, null, { hiOnly: true }).then(function () { if (AOGDrumKit.ready(b) && KIT.want === b) KIT.ready = b; });
    }).catch(function () {});
  }
  function decode(c, ab) { return new Promise(function (ok, no) { var r = c.decodeAudioData(ab, ok, no); if (r && r.then) r.then(ok, no); }); }
  function loadBass(c) {
    if (BASS.state === "ready" || BASS.job) return BASS.job || Promise.resolve();
    var base = "/audio/bass/growly/";
    BASS.state = "loading";
    BASS.job = fetch(base + "set.json?v=2").then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (meta) {
      var zs = (meta.zones || []).filter(function (z) { return (z.k || "sus") === "sus" && (z.v || 1) === 2 && (z.r || 1) === 1; });
      return Promise.all(zs.map(function (z) {
        return fetch(base + z.f + "?v=2").then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then(function (ab) { return decode(c, ab); }).then(function (b) {
          var d = b.getChannelData(0), sr = b.sampleRate, n = Math.min(d.length, Math.floor(0.25 * sr)), pk = 0, i;
          for (i = 0; i < n; i++) { var a = d[i] < 0 ? -d[i] : d[i]; if (a > pk) pk = a; }
          i = 0; while (i < n && Math.abs(d[i]) < pk * 0.05) i++;
          var a0 = Math.floor(0.01 * sr) + i, a1 = Math.min(d.length, a0 + Math.floor(0.3 * sr)), s = 0;
          for (var j = a0; j < a1; j++) s += d[j] * d[j];
          var rms = Math.sqrt(s / Math.max(1, a1 - a0)) || 0.1;
          return { m: z.m, c: z.c || 0, buf: b, lead: Math.max(0, i - Math.floor(0.0005 * sr)) / sr, g: Math.min(6, 0.16 / rms) };
        });
      }));
    }).then(function (zs) { BASS.zones = zs.sort(function (a, b) { return a.m - b.m; }); BASS.state = zs.length ? "ready" : "failed"; BASS.job = null; },
      function () { BASS.state = "failed"; BASS.job = null; });
    return BASS.job;
  }
  function noise(c) {
    if (NOISE && NOISE.context === c) return NOISE.buf;
    var b = c.createBuffer(1, Math.floor(c.sampleRate * 1.2), c.sampleRate), d = b.getChannelData(0), x = 0x2f6b1a3d;
    for (var i = 0; i < d.length; i++) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; d[i] = ((x >>> 0) / 4294967296) * 2 - 1; }
    NOISE = { context: c, buf: b }; return b;
  }
  function env(c, g, t, peak, a, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  /* a drum made here: when the recorded kit is not in yet, or did not load */
  function madeDrum(name, t, lev) {
    var c = AC, out = J.drumBus, g = c.createGain(), nodes = [g], end = t + 0.1;
    g.connect(out);
    var nz = function (type, f, q, peak, dec) { var s = c.createBufferSource(), fl = c.createBiquadFilter(); s.buffer = noise(c); fl.type = type; fl.frequency.value = f; fl.Q.value = q || 0.7;
      var e = c.createGain(); env(c, e, t, peak, 0.002, dec); s.connect(fl); fl.connect(e); e.connect(g); s.start(t); s.stop(t + dec + 0.05); nodes.push(s); end = Math.max(end, t + dec + 0.05); };
    var tone = function (type, f0, f1, peak, dec) { var o = c.createOscillator(), e = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + 0.12);
      env(c, e, t, peak, 0.002, dec); o.connect(e); e.connect(g); o.start(t); o.stop(t + dec + 0.05); nodes.push(o); end = Math.max(end, t + dec + 0.05); };
    g.gain.value = lev * 1.6;
    if (name === "kick") tone("sine", 150, 46, 0.9, 0.34);
    else if (name === "snare") { nz("highpass", 1300, 0.7, 0.45, 0.16); tone("triangle", 190, 0, 0.25, 0.08); }
    else if (name === "hat" || name === "foot") nz("highpass", 7200, 0.7, 0.22, 0.045);
    else if (name === "open") nz("highpass", 6500, 0.7, 0.2, 0.3);
    else if (name === "ride") { nz("bandpass", 5200, 1.2, 0.16, 0.45); tone("square", 3100, 0, 0.02, 0.3); }
    else if (name === "brush") nz("bandpass", 2600, 0.8, 0.12, 0.24);
    else tone("square", 1800, 0, 0.16, 0.03);   /* stick */
    return { nodes: nodes, end: end };
  }
  function drum(name, t, acc, beat, step) {
    var lev = (DLEV[name] || 0.35) * (acc === 2 ? 1.15 : acc === 3 ? 0.55 : 1), f = FEELS[J.feel], pad = f.pads[name] || (name === "hat" ? "ch" : ""), r = null;
    if (!TEST.made && KIT.ready && window.AOGDrumKit && pad) { try { var p = AOGDrumKit.playDirect(AC, J.drumBus, KIT.ready, pad, t, acc === 2 ? 2 : acc === 3 ? 3 : 1, lev); if (p) r = { nodes: [p.src, p.gain], end: t + (p.src.buffer ? p.src.buffer.duration : 1) }; } catch (e) { r = null; } }
    if (!r) r = madeDrum(name, t, lev);
    var lg = log({ t: t, k: name, beat: beat, s: step, a: acc });
    EV.push({ t: t, end: r.end, nodes: r.nodes, log: lg });
  }
  function bassNote(m, t, len, v) {
    var c = AC, g = c.createGain(), nodes = [g], z = null, src;
    g.connect(J.tonalBus);
    if (!TEST.made && BASS.state === "ready") {
      var d = 99; BASS.zones.forEach(function (x) { var e = Math.abs(x.m - m) + (x.m > m ? 0.1 : 0); if (e < d) { d = e; z = x; } });
      if (z && Math.abs(z.m - m) > 4) z = null;
    }
    var peak = 0.5 * v;
    if (z) {
      src = c.createBufferSource(); src.buffer = z.buf; src.playbackRate.value = Math.pow(2, (m - z.m) / 12 - z.c / 1200);
      src.connect(g); peak *= z.g; src.start(t, z.lead); nodes.push(src);
    } else {
      var o = c.createOscillator(), o2 = c.createOscillator(), lp = c.createBiquadFilter(), f = 440 * Math.pow(2, (m - 69) / 12);
      o.type = "sawtooth"; o.frequency.value = f; o2.type = "sine"; o2.frequency.value = f; lp.type = "lowpass"; lp.frequency.value = 520; lp.Q.value = 0.9;
      var g2 = c.createGain(); g2.gain.value = 0.25; o.connect(g2); g2.connect(lp); o2.connect(lp); lp.connect(g);
      o.start(t); o2.start(t); nodes.push(o, o2); src = o; peak *= 0.9;
    }
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.006); g.gain.setTargetAtTime(peak * 0.7, t + 0.02, 0.25);
    g.gain.setTargetAtTime(0, t + len, 0.02);
    nodes.forEach(function (n) { if (n.stop) n.stop(t + len + 0.15); });
    return { nodes: nodes, end: t + len + 0.15, g: g };
  }
  function keysNote(ms, t, len, v) {
    var c = AC, g = c.createGain(), lp = c.createBiquadFilter(), nodes = [g, lp];
    lp.type = "lowpass"; lp.frequency.value = 2400; lp.connect(J.tonalBus); g.connect(lp);
    ms.forEach(function (m) { var f = 440 * Math.pow(2, (m - 69) / 12), o = c.createOscillator(), o2 = c.createOscillator(), h = c.createGain();
      o.type = "triangle"; o.frequency.value = f; o2.type = "sine"; o2.frequency.value = f * 2; h.gain.value = 0.25;
      o.connect(g); o2.connect(h); h.connect(g); o.start(t); o2.start(t); nodes.push(o, o2); });
    var peak = 0.075 * v;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.008); g.gain.setTargetAtTime(peak * 0.55, t + 0.02, 0.35);
    g.gain.setTargetAtTime(0, t + len, 0.06);
    nodes.forEach(function (n) { if (n.stop) n.stop(t + len + 0.4); });
    return { nodes: nodes, end: t + len + 0.4, g: g };
  }
  /* a degree of the chord, as a note: the bass low (G1 to F♯2 for the root), the keys around middle C */
  function bassM(c, deg) {
    var r = 31 + ((c.root - 31 % 12) + 12) % 12, iv = Q[c.q];
    if (deg === "5") return r + (iv.indexOf(6) >= 0 ? 6 : 7);
    if (deg === "8") return r + 12;
    if (deg === "3") return r + (iv.indexOf(3) >= 0 ? 3 : iv.indexOf(4) >= 0 ? 4 : iv[1]);
    if (deg === "A") return r + (/^(min|m7|7|dim)$/.test(c.q) ? 10 : 9);
    return r;
  }
  function keysMs(c) {
    return Q[c.q].map(function (i) { var p = (c.root + i) % 12, m = 53 + ((p - 53 % 12) + 12) % 12; return m; }).sort(function (a, b) { return a - b; });
  }
  function tonal(ev, t, beat, step) {
    var c = J.chord, len = Math.max(0.06, ev[2] * J.curIv / SUB * 0.94), r, lg;
    if (!c) { J.skip = { ev: ev, t: t, len: len, beat: beat, step: step }; return; }   /* no chord heard yet: the bass waits */
    if (bassRoom()) { var ms = keysMs(c); r = keysNote(ms, t, len, 0.9); lg = log({ t: t, k: "keys", m: ms, beat: beat, s: step, ch: nameOf(c, "en") }); }
    else { var m = bassM(c, ev[1]); r = bassNote(m, t, len, 0.9); lg = log({ t: t, k: "bass", m: m, deg: ev[1], beat: beat, s: step, ch: nameOf(c, "en") }); }
    EV.push({ t: t, end: r.end, nodes: r.nodes, g: r.g, tonal: true, ev: ev, beat: beat, step: step, len: len, log: lg });
  }
  function kill(e, at) {
    var c = AC, now = c.currentTime;
    if (e.t > now + 0.004) { e.nodes.forEach(function (n) { try { if (n.stop) n.stop(0); n.disconnect(); } catch (x) {} }); if (e.log) e.log.x = 1; e.dead = true; return; }
    if (e.g) { try { e.g.gain.cancelScheduledValues(at); e.g.gain.setTargetAtTime(0, at, 0.012); } catch (x) {} }
    e.nodes.forEach(function (n) { try { if (n.stop) n.stop(at + 0.08); } catch (x) {} });
    if (e.log) e.log.cut = Math.round((at - e.t) * 1000) / 1000;
    e.dead = true;
  }
  /* a new chord: what is laid ahead plays it, and a note it was played on is changed at once */
  function retune(tOn) {
    var c = AC, now = c.currentTime, again = [], nowEv = null;
    EV.forEach(function (e) {
      if (!e.tonal || e.dead) return;
      if (e.t > now + 0.004) { kill(e); again.push(e); }
      else if (Math.abs(tOn - e.t) < 0.16 * J.curIv && e.end > now + 0.05 && !nowEv) nowEv = e;
    });
    var sk = J.skip; J.skip = null;   /* the first chord, played on a note the bass was waiting on: it comes in at once */
    if (!nowEv && sk && Math.abs(tOn - sk.t) < 0.16 * J.curIv && sk.t + sk.len > now + 0.05) nowEv = { t: sk.t, len: sk.len, ev: sk.ev, beat: sk.beat, step: sk.step, nodes: [], fresh: 1 };
    if (nowEv) {
      if (!nowEv.fresh) kill(nowEv, now);
      var rest = Math.max(0.06, nowEv.t + nowEv.len - now), ev = [nowEv.ev[0], nowEv.ev[1], rest / (J.curIv / SUB) / 0.94];
      tonal(ev, now + 0.003, nowEv.beat, nowEv.step); var last = EV[EV.length - 1]; if (last && last.log) last.log.now = 1;
    }
    again.forEach(function (e) { tonal(e.ev, e.t, e.beat, e.step); });
    EV = EV.filter(function (e) { return !e.dead || e.end > now; });
  }
  function log(o) { if (LOG.length > 6000) LOG.splice(0, 1000); o.t = Math.round(o.t * 10000) / 10000; LOG.push(o); return o; }

  /* ── the clock ── */
  function stepPos(j) {   /* where step j (0-3) of a beat falls, in beats, with the feel's swing */
    var f = FEELS[J.feel], u = j / SUB;
    if (f.sw16 && (j & 1)) u = (j - 1) / SUB + f.sw16 * 0.5;
    if (f.sw8) u = u < 0.5 ? u * 2 * f.sw8 : f.sw8 + (u - 0.5) * 2 * (1 - f.sw8);
    return u;
  }
  function outLag(c) {
    var o = +c.outputLatency || 0, b = +c.baseLatency || 0;
    if (o > 0 && o + b < 0.5) return o + b;
    var rt = 0; try { rt = window.AOGLatency && AOGLatency.rt ? +AOGLatency.rt() : 0; } catch (e) { rt = 0; }
    if (!(rt > 0)) { try { var m = JSON.parse(localStorage.getItem("aog.latency.v1") || "null"); rt = m && m.rt > 0 && m.rt < 1 ? +m.rt : 0; } catch (e) { rt = 0; } }
    if (rt > 0) return rt / 2;
    return b > 0 && b < 0.5 ? b : 0;
  }
  function liveLag(c) {
    var rt = 0; try { var m = JSON.parse(localStorage.getItem("aog.latency.v1") || "null"); rt = m && m.rt > 0 && m.rt < 1 ? +m.rt : 0; } catch (e) {}
    var det = 0.07;   /* the listener's own time: about a window and a half of its pitch finder */
    return (rt > 0 ? rt - J.lag : (+c.baseLatency || 0.01)) + det;
  }
  /* the learner's beat, from the onsets of the last six beats: a straight line through (grid place, time) */
  function fit(k) {
    var n = 0, sq = 0, st = 0, sqq = 0, sqt = 0, lo = 1e9, hi = -1e9;
    for (var i = 0; i < ON; i++) { var q = OQ[i]; if (q < k - 6 || q > k + 0.5) continue; var t = OT[i];
      n++; sq += q; st += t; sqq += q * q; sqt += q * t; if (q < lo) lo = q; if (q > hi) hi = q; }
    if (n < 3 || hi - lo < 1.5) return null;
    var den = n * sqq - sq * sq; if (!(den > 0)) return null;
    var b = (n * sqt - sq * st) / den, a = (st - b * sq) / n;
    return { a: a, b: b, n: n };
  }
  function decide(k, T) {
    var iv = J.curIv;
    if (!O.follow || k <= J.k0) return iv;
    var F = fit(k); if (!F || !(F.b > 0.6 * iv && F.b < 1.6 * iv)) return iv;
    var e = (F.a + F.b * k) - T; e = Math.max(-0.12 * F.b, Math.min(0.12 * F.b, e));
    var target = F.b + 0.25 * e, nv = iv + 0.5 * (target - iv);
    nv = Math.max(iv * (1 - MAXSTEP), Math.min(iv * (1 + MAXSTEP), nv));
    return Math.max(60 / 240, Math.min(60 / 40, nv));
  }
  function newBeat() {
    var k = J.nextK, T = J.nextT, iv = decide(k, T);
    J.curK = k; J.curT = T; J.curIv = iv; J.nextK = k + 1; J.nextT = T + iv; J.j = 0;
    BEATS.push([k, Math.round(T * 100000) / 100000, Math.round(iv * 100000) / 100000]); if (BEATS.length > 4000) BEATS.splice(0, 500);
    if (k === J.k0) { J.grooveT = T; if (J.phase === "count") { J.phase = "groove"; say(O.follow ? "playing" : "steadyOn"); } }
    var bar = k >= J.k0 && (k - J.k0) % 4 === 0;
    if (bar) {
      if (J.feelNext) { J.feel = J.feelNext; J.feelNext = null; }
      paintBpm();
      if (J.phase === "ending" && k >= J.endK) { finish(T); return false; }
      if (J.phase === "groove" && !O.keep) {
        var ref = J.played ? J.lastOn : J.grooveT, lim = J.played ? 6 : 16;
        if ((T - ref) / iv >= lim - 0.01) { J.phase = "ending"; J.endK = k + 4;
          var g = J.fade.gain; g.cancelScheduledValues(T); g.setValueAtTime(1, T); g.linearRampToValueAtTime(0.0001, T + 4 * iv); say("ending"); }
      }
      if (!J.liveOff) listenLive();
    }
    return true;
  }
  function playStep(k, j, t) {
    if (k < J.k0) { if (j === 0 && drumsOn()) drum("hat", t, k === 0 ? 2 : 1, k, 0); else if (j === 0) drum("stick", t, k === 0 ? 2 : 1, k, 0); return; }
    var f = FEELS[J.feel], s = ((k - J.k0) % 4) * SUB + j;
    if (drumsOn()) for (var nm in f.d) { var ch = f.d[nm].charAt(s); if (ch !== ".") drum(nm, t, +ch, k, s); }
    if (tonalOn()) { var list = bassRoom() ? f.k : f.b; for (var i = 0; i < list.length; i++) if (list[i][0] === s) tonal(list[i], t, k, s); }
  }
  function tick() {
    if (!J.on || J.paused) return;
    var now = AC.currentTime, until = now + LOOK;
    if (away()) { pause("away"); return; }
    for (var guard = 0; guard < 64; guard++) {
      if (J.j >= SUB) { if (!newBeat()) return; }
      var t = J.curT + stepPos(J.j) * J.curIv;
      if (t > until) break;
      if (t >= now - 0.01) playStep(J.curK, J.j, Math.max(t, now));
      J.j++;
    }
    if (EV.length > 200 || (EV.length && EV[0].end < now - 1)) EV = EV.filter(function (e) { return e.end > now - 0.2; });
  }
  function away() { try { var f = window.frameElement; return !!f && (f.hidden || f.style.display === "none" || !f.getClientRects().length); } catch (e) { return false; } }

  /* ── what the learner plays ── */
  var PEND = 0;
  function heard(m, v, tc) {
    if (!J.on || J.paused || !(m >= 0)) return;
    RT[RI] = tc; RM[RI] = m; RV[RI] = v >= 0 && v <= 1 ? v : 0.7; RI = (RI + 1) % RC; if (RN < RC) RN++;
    J.lastNote = tc;
    if (tc - J.lastOn > 0.05 || J.lastOn < 0) {   /* a new onset (notes within 50 ms are one strum) */
      J.lastOn = tc; J.clStart = tc; J.played = true;
      onset(tc); log({ t: tc, k: "on", q: J.lastQ });
      if (J.phase === "ending") revive();
    }
    if (!PEND) PEND = setTimeout(judge, 35);
  }
  function onset(tc) {
    var k = -1, T = 0, iv = J.curIv;
    for (var i = BEATS.length - 1; i >= 0 && i > BEATS.length - 40; i--) { if (BEATS[i][1] <= tc) { k = BEATS[i][0]; T = BEATS[i][1]; iv = BEATS[i][2]; break; } }
    if (k < 0) return;
    var pos = k + (tc - T) / iv, q = Math.round(pos * 2) / 2;
    if (Math.abs(pos - q) > 0.2) return;
    OT[OI] = tc; OQ[OI] = q; OI = (OI + 1) % OC; if (ON < OC) ON++;
    J.lastQ = q; J.lastDev = pos - q;
  }
  function weights(out, from, ref, tau) {
    for (var p = 0; p < 12; p++) out[p] = 0;
    var low = 999, n = RN;
    for (var i = 0; i < n; i++) {
      var x = (RI - 1 - i + RC) % RC, t = RT[x]; if (t < from - 0.3) break; if (t < from) continue;
      var age = ref - t; if (age < 0) age = 0;
      var g = (0.4 + 0.6 * RV[x]) * (tau > 0 ? Math.exp(-age / tau) : 1); out[RM[x] % 12] += g;
      if (g > 0.35 && RM[x] < low) low = RM[x];
    }
    return low < 999 ? low % 12 : -1;
  }
  function same(a, b) { return !!a && !!b && a.root === b.root && a.q === b.q; }
  function judge() {
    PEND = 0; if (!J.on || J.paused) return;
    var iv = J.curIv, ref = J.lastNote, cur = J.chord;
    var bc = weights(WC, J.clStart - 0.001, ref, 0), nd = 0; for (var p = 0; p < 12; p++) if (WC[p] > 0) nd++;
    var bw = weights(WT, ref - 3 * iv, ref, 1.2 * iv), b;
    if (nd >= 3) {
      for (p = 0; p < 12; p++) WC[p] += 0.25 * WT[p];
      b = judgeW(WC, bc, cur);
      if (b && !same(b, cur) && b.s >= b.cur + 0.05) change(b, J.clStart);
      J.cand = null; return;
    }
    /* one note at a time (a bass line, a real guitar's single notes): a new note on a bar line is the new root at once,
       as the key's own chord on it; the notes after it can make it another kind of chord on the same root */
    var nl = RM[(RI - 1 + RC) % RC], bar = J.lastQ != null && Math.abs(J.lastDev) < 0.15 && J.lastQ >= J.k0 && ((J.lastQ - J.k0) % 4 + 4) % 4 === 0 && J.lastOn === J.clStart;
    if (nd === 1 && bar && J.clStart >= ref - 0.06 && (!cur || pc(nl) !== cur.root) && (bassRoom() || J.liveOn || !cur)) {
      var r1 = pc(nl); change({ root: r1, q: diatonic(r1, songKey()) || "maj" }, J.clStart); return; }
    b = judgeW(WT, bw, cur, true); if (!b) return;
    if (!cur) { if (b.s > 0.6) change(b, J.clStart); return; }
    if (same(b, cur)) { J.cand = null; return; }
    if (J.cand && same(J.cand, b)) J.candN++; else { J.cand = b; J.candN = 1; }
    if (b.s >= b.cur + 0.12 && (J.candN >= 2 || (b.root === cur.root && b.s >= b.cur + 0.15))) change(b, J.clStart);   /* the same root: only its kind */
  }
  function change(c, tOn) {
    J.chord = { root: c.root, q: c.q }; J.cand = null;
    log({ t: tOn, k: "chord", ch: nameOf(J.chord, "en"), heard: Math.round(AC.currentTime * 10000) / 10000 });
    paintChord();
    retune(tOn);
  }
  function onNote(c, e) {
    if (!J.on || J.paused || c !== AC || !e || !(e.m >= 0) || e.kit != null) return;
    try { if (H.busy && H.busy()) return; } catch (x) {}
    heard(e.m, +e.v, (typeof e.when === "number" ? Math.max(e.when, 0) : c.currentTime) - J.lag);
  }
  function wrapNote() {
    var R = window.AOGRecorder; if (!R || !R.note || R.note.__jam) return;
    var orig = R.note, wr = function (c, vc, e) { if (J.on) { try { onNote(c, e); } catch (x) {} } return orig.apply(this, arguments); };
    wr.__jam = 1; R.note = wr;
  }
  /* a real guitar or bass: single notes (AOGLive.listen), and chords where the listener can hear them */
  function listenLive() {
    var A = window.AOGLive; if (!A || J.liveOff) return;
    try {
      if (A.listen) { var off = A.listen(function (m) { if (!J.on || J.paused) return; heard(m, 0.75, AC.currentTime - J.lag - liveLag(AC)); });
        if (off) { J.liveOff = off; J.liveOn = true; } }
      if (J.liveOff && typeof A.frames === "function" && !J.framesOff) {
        J.framesOff = A.frames(function (fr) {
          if (!J.on || J.paused || !fr) return;
          var r = null, Lr = window.AOGLearn;
          try { if (Lr && typeof Lr.hearChord === "function") r = Lr.hearChord(fr); } catch (x) { r = null; }
          if (!(r && r.root >= 0 && Q[r.q]) && fr.chroma && fr.chroma.length === 12) { for (var p = 0; p < 12; p++) WT[p] = +fr.chroma[p] || 0; r = judgeW(WT, -1, J.chord); if (r && r.s < 0.7) r = null; }
          if (!r || !(r.root >= 0) || !Q[r.q] || (r.conf != null && r.conf < 0.5)) return;
          if (same(r, J.chord)) { J.fcand = null; return; }
          if (J.fcand && same(J.fcand, r)) { J.fcand = null; change(r, AC.currentTime - J.lag - liveLag(AC)); } else J.fcand = r;
        }) || null;
      }
    } catch (x) {}
  }
  function unlisten() { try { if (J.liveOff) J.liveOff(); } catch (x) {} try { if (typeof J.framesOff === "function") J.framesOff(); } catch (x) {} J.liveOff = null; J.framesOff = null; J.liveOn = false; }

  /* ── start, stop, pause ── */
  function route() {
    if (!J.fade) return;
    try { J.fade.disconnect(); } catch (e) {}
    var to = null; try { to = H.into ? H.into(!!O.rec) : null; } catch (e) { to = null; }
    J.fade.connect(to || AC.destination); J.to = O.rec ? "take" : "out";
  }
  function level() { return 0.9 * Math.pow(O.level / 100, 1.5); }
  async function start() {
    if (J.on || J.busy) return;
    J.busy = true; paintGo();
    var c; try { c = H.ctx(); } catch (e) { c = null; }
    if (!c) { J.busy = false; paintGo(); return; }
    AC = c; try { if (c.state === "suspended") c.resume(); } catch (e) {}
    try { if (window.AOGVU && AOGVU.own && !c.__aogJamOwn) { AOGVU.own(c); c.__aogJamOwn = 1; } } catch (e) {}
    wrapNote();
    var f = FEELS[O.feel], jobs = [];
    if (!TEST.made) {
      if (drumsOn() && KIT.ready !== f.kit) jobs.push(loadKit(f.kit));
      if (tonalOn() && !bassRoom()) jobs.push(loadBass(c));
    }
    if (jobs.length) { say("getting"); await Promise.race([Promise.all(jobs), new Promise(function (ok) { setTimeout(ok, 6000); })]); }
    var simple = !TEST.made && ((drumsOn() && KIT.ready !== f.kit) || (tonalOn() && !bassRoom() && BASS.state !== "ready"));
    var mix = c.createGain(), comp = c.createDynamicsCompressor(), fade = c.createGain(), db = c.createGain(), tb = c.createGain();
    comp.threshold.value = -14; comp.knee.value = 8; comp.ratio.value = 3; comp.attack.value = 0.005; comp.release.value = 0.2;
    db.connect(mix); tb.connect(mix); mix.connect(comp); comp.connect(fade); mix.gain.value = level();
    var now = c.currentTime, T0 = now + 0.15;
    J = { on: true, paused: false, busy: false, feel: O.feel, feelNext: null, mix: mix, fade: fade, drumBus: db, tonalBus: tb, lag: outLag(c),
      k0: O.count ? 4 : 0, nextK: 0, nextT: T0, curK: -1, curT: T0, curIv: 60 / songBpm(), j: SUB, phase: O.count ? "count" : "groove",
      grooveT: T0, lastOn: -1, lastNote: -1, played: false, chord: null, cand: null, candN: 0, clStart: 0, lastQ: null, lastDev: 0, liveOff: null, liveOn: false };
    fade.gain.setValueAtTime(1, now);
    route();
    LOG.length = 0; BEATS.length = 0; EV = []; RN = 0; RI = 0; ON = 0; OI = 0;
    listenLive();
    J.timer = setInterval(tick, TICK);
    tick();
    if (simple) say("simple"); else say(O.count ? "counting" : (O.follow ? "playing" : "steadyOn"));
    paintChord(); paintBpm(); paintGo();
  }
  function hush(at) {   /* everything laid ahead is taken back; what sounds fades */
    var c = AC, now = c.currentTime;
    EV.forEach(function (e) { if (e.t > now + 0.004) kill(e); });
    EV = EV.filter(function (e) { return !e.dead; });
    try { var g = J.fade.gain; g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(0.0001, now + (at || 0.25)); } catch (e) {}
  }
  function cleanup(nodes) {
    var c = AC, wait = Math.max(0.4, (J.endT || 0) - c.currentTime + 0.4) * 1000, fade = J.fade, mix = J.mix;
    setTimeout(function () { try { fade.disconnect(); mix.disconnect(); } catch (e) {} EV = []; }, wait);
  }
  function stop(word) {
    if (!J.on) return;
    clearInterval(J.timer); J.timer = 0; if (PEND) { clearTimeout(PEND); PEND = 0; }
    hush(0.25); unlisten();
    J.on = false; J.paused = false; J.endT = AC.currentTime + 0.3;
    cleanup();
    say(word || "stopped"); paintGo(); paintChord();
  }
  function finish(T) {   /* the fade has run its bar: the band ends at this bar line */
    clearInterval(J.timer); J.timer = 0; if (PEND) { clearTimeout(PEND); PEND = 0; }
    unlisten(); J.on = false; J.endT = T; cleanup();
    log({ t: T, k: "end" });
    say("ended"); paintGo(); paintChord();
  }
  function revive() {
    var c = AC, now = c.currentTime, g = J.fade.gain;
    J.phase = "groove"; J.endK = 0;
    g.cancelScheduledValues(now); g.setValueAtTime(Math.max(0.0001, g.value), now); g.linearRampToValueAtTime(1, now + 0.3);
    say(O.follow ? "playing" : "steadyOn");
  }
  function pause(why) {
    if (!J.on || J.paused) return;
    J.paused = why || true; clearInterval(J.timer); J.timer = 0; if (PEND) { clearTimeout(PEND); PEND = 0; }
    hush(0.12); unlisten();
  }
  function resume() {
    if (!J.on || !J.paused) return;
    var c = AC; try { if (c.state === "suspended") c.resume(); } catch (e) {}
    var now = c.currentTime, k = Math.max(J.k0, J.curK + 1);
    if ((k - J.k0) % 4) k += 4 - (k - J.k0) % 4;   /* on at the next bar line */
    J.paused = false; J.nextK = k; J.nextT = now + 0.2; J.j = SUB; J.lastOn = now; J.played = true;
    if (J.phase === "count") J.phase = "groove";
    if (J.phase === "ending") J.phase = "groove";
    var g = J.fade.gain; g.cancelScheduledValues(now); g.setValueAtTime(0.0001, now); g.linearRampToValueAtTime(1, now + 0.35);
    listenLive();
    J.timer = setInterval(tick, TICK); tick();
  }
  window.addEventListener("aog-hush", function (e) { if (e && e.detail && e.detail.on) pause("hush"); else if (J.paused === "hush") resume(); });
  D.addEventListener("visibilitychange", function () { if (D.hidden) pause("hidden"); else if (J.paused === "hidden") resume(); });
  window.addEventListener("focus", function () { if (J.paused === "away" && !away()) resume(); });
  window.addEventListener("pagehide", function () { stop(); });

  /* ── the block ── */
  function chk(id) { return '<label class="jm-chk"><input type="checkbox" id="' + id + '"><span id="' + id + 'L"></span></label>'; }
  function build(inner) {
    inner.innerHTML =
      '<p class="line" id="jmIntro"></p>' +
      '<div class="row">' +
        '<label class="field"><span class="plab" id="jmFeelL"></span><select id="jmFeel"></select></label>' +
        '<label class="field"><span class="plab" id="jmWhoL"></span><select id="jmWho"></select></label>' +
        '<label class="field"><span class="plab" id="jmTempoL"></span><select id="jmTempo"></select></label>' +
      "</div>" +
      '<div class="jm-chks">' + chk("jmCount") + chk("jmKeep") + chk("jmRec") + "</div>" +
      '<div class="jm-level"><span class="plab" id="jmLevelL"></span><input type="range" id="jmLevel" min="0" max="100" step="1" aria-labelledby="jmLevelL"><b id="jmLevelOut"></b></div>' +
      '<div class="row"><button type="button" class="pbtn play" id="jmGo"></button></div>' +
      '<div class="jm-now" id="jmNow" hidden><span class="plab" id="jmHearsL"></span><b class="jm-big" id="jmChord"></b><span class="jm-bpm" id="jmBpm"></span></div>' +
      '<p class="line" id="jmSay" aria-live="polite"></p>';
    $("jmFeel").onchange = function () { O.feel = this.value; save(); if (J.on) { J.feelNext = O.feel; if (!TEST.made) loadKit(FEELS[O.feel].kit); } };
    $("jmWho").onchange = function () { O.who = this.value; save(); };
    $("jmTempo").onchange = function () { O.follow = this.value === "follow"; save(); };
    $("jmCount").onchange = function () { O.count = this.checked; save(); };
    $("jmKeep").onchange = function () { O.keep = this.checked; save(); if (O.keep && J.on && J.phase === "ending") revive(); };
    $("jmRec").onchange = function () { O.rec = this.checked; if (J.on) route(); };
    $("jmLevel").oninput = function () { O.level = +this.value; $("jmLevelOut").textContent = String(O.level); if (J.on) { try { J.mix.gain.setTargetAtTime(level(), AC.currentTime, 0.03); } catch (e) {} } };
    $("jmLevel").onchange = save;
    $("jmGo").onclick = function () { if (J.on) stop(); else start(); };
  }
  function opts(sel, list, val) {
    var html = list.map(function (x) { return '<option value="' + x[0] + '">' + x[1] + "</option>"; }).join("");
    if (sel._h !== html) { sel.innerHTML = html; sel._h = html; }
    sel.value = val;
  }
  function paint() {
    if (!UI || !$("jmGo")) return;
    var t = function (id, k) { var e = $(id); if (e && e.textContent !== w(k)) e.textContent = w(k); };
    t("jmIntro", "intro"); t("jmFeelL", "feel"); t("jmWhoL", "who"); t("jmTempoL", "tempo"); t("jmCountL", "count"); t("jmKeepL", "keep");
    t("jmRecL", "rec"); t("jmLevelL", "level"); t("jmHearsL", "hears");
    opts($("jmFeel"), FEEL_IDS.map(function (id) { return [id, pick(W.feels[id])]; }), O.feel);
    var wh = bassRoom() ? [["db", "dk"], ["d", "d"], ["b", "k"]] : [["db", "db"], ["d", "d"], ["b", "b"]];
    opts($("jmWho"), wh.map(function (x) { return [x[0], pick(W.whos[x[1]])]; }), O.who);
    opts($("jmTempo"), [["follow", w("follow")], ["steady", w("steady")]], O.follow ? "follow" : "steady");
    $("jmCount").checked = O.count; $("jmKeep").checked = O.keep; $("jmRec").checked = O.rec;
    $("jmLevel").value = String(O.level); $("jmLevelOut").textContent = String(O.level);
    paintGo(); paintChord(); paintBpm();
    if (J.say) { var s = $("jmSay"); if (s && s.textContent !== w(J.say)) s.textContent = w(J.say); }
  }
  function paintGo() { var b = $("jmGo"); if (!b) return; var x = w(J.on ? "stop" : "start"); if (b.textContent !== x) b.textContent = x; b.classList.toggle("go", !!J.on); b.disabled = !!J.busy; }
  function paintChord() {
    var n = $("jmNow"); if (!n) return;
    if (n.hidden !== !J.on) n.hidden = !J.on;
    var x = J.chord ? nameOf(J.chord) : w("none"), e = $("jmChord"); if (e && e.textContent !== x) e.textContent = x;
  }
  function paintBpm() { var e = $("jmBpm"); if (!e) return; var x = J.on ? w("bpm", { n: Math.round(60 / J.curIv) }) : ""; if (e.textContent !== x) e.textContent = x; }
  var SAY = { last: "" };
  function say(k) { J.say = k; var s = $("jmSay"); if (s) s.textContent = k ? w(k) : ""; SAY.last = k; }

  window.AOGJamBand = {
    attach: function (h, ui) { H = h || window.AOGJamRoom || null; UI = ui || null; if (UI && UI.inner && !$("jmGo")) build(UI.inner); paint(); },
    shown: function (on) { if (on) paint(); else if (J.on) stop(); },
    paint: paint,
    start: start, stop: function () { stop(); }, pause: pause, resume: resume,
    test: {
      made: function (on) { TEST.made = on !== false; },
      events: function () { return LOG.slice(); },
      beats: function () { return BEATS.slice(); },
      clear: function () { LOG.length = 0; },
      feed: function (m, v, when) { if (AC) heard(m, v == null ? 0.8 : v, (when == null ? AC.currentTime : when) - J.lag); },
      state: function () { return { on: !!J.on, paused: J.paused || false, phase: J.phase || "", bpm: J.on || J.curIv ? Math.round(6000 / (J.curIv || 0.6)) / 100 : 0,
        chord: J.chord ? nameOf(J.chord) : "", chordEn: J.chord ? nameOf(J.chord, "en") : "", feel: J.feel || O.feel, who: O.who, follow: O.follow, rec: O.rec, to: J.to || "",
        lag: J.lag || 0, k0: J.k0, kit: KIT.ready, bass: BASS.state, live: !!J.liveOn, timer: !!J.timer, pend: !!PEND, say: J.say || "", ev: EV.length,
        now: AC ? AC.currentTime : 0, ctx: !!AC }; },
      opts: function () { return JSON.parse(JSON.stringify(O)); },
      name: nameOf, judge: function (notes, bass) { var x = new Float64Array(12); notes.forEach(function (m) { x[pc(m)] += 1; }); var r = judgeW(x, bass == null ? -1 : bass, null); return r ? nameOf(r, "en") : ""; }
    }
  };
})();
