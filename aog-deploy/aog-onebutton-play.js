/* AOG-ONEBUTTON-V1 (2026-10-12) — One-button and big-switch play: the big button, the switches and the timing.
   Jimmy picked: "Any instrument can be played with one large button, a switch or the space bar, and the Studio keeps it
   in key and in time. Every learner can make real music." For learners for whom a touch screen or an instrument is
   hard: big targets, any switch, no time pressure. Fetched by aog-onebutton.js the first time "One button" is opened.

   In each instrument room one closed "One button" block. Turned on, it shows one very large button and hides nothing
   else. What one press plays is a menu: the next chord (a pattern in the song's key, the room's own pattern, or the
   chords of the song open in Learn a song), the next note of a tune, a note that fits (the five-note scale of the key,
   walking gently up and down), the bass's next low note or walking notes, the Drum Machine's next beat or its pattern
   started and stopped, the Drum Kit's kick and snare in turn or the next hit of its beat. Holding the button holds the
   sound where an instrument can (the piano, the band); the room's own pedal still works.
   Help with timing (on at first): a press lands on the next beat (or half beat) of the song's tempo, or of the room's
   own pattern while it plays. The first press of a phrase plays at once and sets the beat; nothing ever waits for the
   learner or says they were late. Off: a press plays at once. A soft click on the beat can be heard while playing
   (straight to the speakers, never in a take), only from the first press until two bars after the last one.
   Any switch: the big button (a finger, a pen, a mouse; it never zooms), Space and Enter (Bluetooth and USB switches
   send these), any key at all (with Any key plays on, also any key of a MIDI keyboard), a game controller's buttons
   (polled every 50 ms only while one is connected, one button is on and the room is in sight), and the screen
   reader's or Switch Control's own tap. Wait before a press counts (0 to 0.5 s) leaves out very quick taps; Ignore
   repeat presses leaves out a second press that comes too soon. Two switches: switch 1 (Space, the big button, game
   controller button A) plays; switch 2 (Enter, the second button, game controller button B) moves to the next one or
   stops the sound. Every press goes through the room's own play path (its sound, its pedals, its chain), so a take
   hears it like any played note (AOGRecorder.note), and the keys and the neck light as they do.
   The choices are kept per room on this device (localStorage aog.onebutton.<room>.v1). Silent at rest: no timer runs
   while nothing is pressed or sounding; "aog-hush" and a hidden page let go of everything.

   A room says what it can do (before this file runs):
     window.AOGOneRoom = { room, lang:()=>"en"|"es", ctx:()=>AudioContext (made in the tap), key:()=>{key, minor},
       bpm:()=>tempo, grid:()=>{t0, beat}|null (the room's pattern playing), prog:()=>[{off,q}] (its own pattern),
       qs:[chord kinds it knows], name:(c)=>chord name, pc:(m)=>note name, range:[lo, hi] or ()=>[lo, hi],
       root:(c)=>midi (a chord's low note), chord:(c, v, when)=>handle, note:(m, v, when)=>handle (handle.off() lets go),
       beats:()=>n, beat:(i, when, beatSec)=>hits, groove:()=>[{ids, acc}], hit:(ids, acc, when)=>bool,
       playing:()=>bool, start(), stop(), quiet() }
   window.AOGOne: { mount, midi(cmd, note, vel), _t (for the tests) }. ═══════════════════════════════════════════════ */
(function () {
  "use strict";
  if (window.AOGOne && window.AOGOne.ready) return;
  var D = document, R = window.AOGOneRoom;
  if (!R) return;
  var W = {
    intro: { en: "Play this instrument with one big button, a switch or the space bar. The Studio keeps it in key and in time.", es: "Toca este instrumento con un botón grande, un pulsador o la barra espaciadora. El estudio lo mantiene en el tono y a tiempo." },
    on: { en: "Turn on one button", es: "Activar un botón" }, off: { en: "Turn off one button", es: "Desactivar un botón" },
    what: { en: "One press plays", es: "Cada pulsación toca" },
    k_chord: { en: "The next chord", es: "El siguiente acorde" },
    k_tune: { en: "The next note of a tune", es: "La siguiente nota de una melodía" },
    k_fit: { en: "A note that fits", es: "Una nota que encaja" },
    k_root: { en: "The next low note of each chord", es: "La siguiente nota grave de cada acorde" },
    k_walk: { en: "Walking notes", es: "Notas que caminan" },
    k_beat: { en: "The next beat", es: "El siguiente pulso" },
    k_startstop: { en: "Start and stop the beat", es: "Empezar y parar el ritmo" },
    k_alt: { en: "Kick and snare, in turn", es: "Bombo y caja, por turnos" },
    k_groove: { en: "The next hit of the beat", es: "El siguiente golpe del ritmo" },
    chords: { en: "Chords", es: "Acordes" }, tune: { en: "Tune", es: "Melodía" },
    p_room: { en: "Your pattern in this room", es: "Tu patrón de esta sala" },
    p_strip: { en: "All 12 chords, one after another", es: "Los 12 acordes, uno tras otro" },
    p_song: { en: "The song you are learning", es: "La canción que estás aprendiendo" },
    t_twinkle: { en: "Twinkle, Twinkle, Little Star", es: "Estrellita, ¿dónde estás?" },
    t_ode: { en: "Ode to Joy", es: "Himno de la alegría" },
    t_scale: { en: "Up and down the scale", es: "Sube y baja la escala" },
    t_song: { en: "The tune of the song you are learning", es: "La melodía de la canción que estás aprendiendo" },
    t_songBass: { en: "The bass line of the song you are learning", es: "La línea de bajo de la canción que estás aprendiendo" },
    press: { en: "Press to play", es: "Pulsa para tocar" },
    big: { en: "One button. Next: {x}", es: "Un botón. Siguiente: {x}" },
    time: { en: "Help with timing", es: "Ayuda con el ritmo" },
    timeLine: { en: "Each press lands on the beat. Take your time. Nothing is waiting for you.", es: "Cada pulsación cae en el pulso. Tómate tu tiempo. Nada te está esperando." },
    grid: { en: "Land on", es: "Cae en" }, g1: { en: "Each beat", es: "Cada pulso" }, g2: { en: "Each half beat", es: "Cada medio pulso" },
    click: { en: "A soft click on the beat while I play", es: "Un clic suave en el pulso mientras toco" },
    more: { en: "Switches and keys", es: "Pulsadores y teclas" },
    any: { en: "Any key plays", es: "Cualquier tecla toca" },
    anyLine: { en: "Space and Enter always play. With this on, any key, a switch or a MIDI keyboard plays too.", es: "Espacio y Enter siempre tocan. Con esto activado, también toca cualquier tecla, un pulsador o un teclado MIDI." },
    two: { en: "Two switches", es: "Dos pulsadores" },
    two2: { en: "Switch 2 (Enter)", es: "Pulsador 2 (Enter)" },
    twoLine: { en: "Switch 1 (Space, the big button) plays.", es: "El pulsador 1 (Espacio, el botón grande) toca." },
    s_next: { en: "Moves to the next one", es: "Pasa al siguiente" }, s_stop: { en: "Stops the sound", es: "Para el sonido" },
    b_next: { en: "Next one ▸", es: "Siguiente ▸" }, b_stop: { en: "■ Stop", es: "■ Parar" },
    hold: { en: "Wait before a press counts", es: "Espera antes de que cuente" },
    holdLine: { en: "Very quick taps are left out.", es: "Los toques muy rápidos no cuentan." },
    noWait: { en: "No wait", es: "Sin espera" },
    guard: { en: "Ignore repeat presses", es: "Ignorar pulsaciones repetidas" },
    gOff: { en: "No", es: "No" }, gFor: { en: "For {n} s", es: "Durante {n} s" },
    midi: { en: "Use a MIDI keyboard", es: "Usar un teclado MIDI" },
    pad: { en: "A game controller works too. Press any of its buttons.", es: "Un mando de juego también sirve. Pulsa cualquiera de sus botones." },
    padOn: { en: "Game controller ready: {name}.", es: "Mando listo: {name}." },
    empty: { en: "This beat is empty. Choose a beat first, then press.", es: "Este ritmo está vacío. Elige un ritmo primero y luego pulsa." },
    wait: { en: "The sound is still getting ready. Press again in a moment.", es: "El sonido aún se está preparando. Pulsa otra vez en un momento." },
    startB: { en: "Start the beat", es: "Empezar el ritmo" }, stopB: { en: "Stop the beat", es: "Parar el ritmo" },
    beatN: { en: "Beat {n} of {m}", es: "Pulso {n} de {m}" }, hitN: { en: "Hit {n} of {m}", es: "Golpe {n} de {m}" },
    kick: { en: "Kick", es: "Bombo" }, snare: { en: "Snare", es: "Caja" }
  };
  var KINDS = { piano: ["chord", "tune", "fit"], guitar: ["chord", "tune", "fit"], band: ["chord", "tune", "fit"],
    bass: ["root", "walk", "fit"], pads: ["beat", "startstop"], kit: ["alt", "groove", "startstop"] };
  var kinds = KINDS[R.room] || ["chord", "tune", "fit"];
  var SKEY = "aog.onebutton." + R.room + ".v1";
  var C = { on: false, what: kinds[0], prog: "a", tune: "twinkle", time: true, grid: 1, click: false, any: false, two: false, two2: "next", hold: 0, guard: 0 };
  try { var sv = JSON.parse(localStorage.getItem(SKEY) || "null"); if (sv && typeof sv === "object") Object.keys(C).forEach(function (k) { if (sv[k] != null && typeof sv[k] === typeof C[k]) C[k] = sv[k]; }); } catch (e) {}
  if (kinds.indexOf(C.what) < 0) C.what = kinds[0];
  function save() { try { localStorage.setItem(SKEY, JSON.stringify(C)); } catch (e) {} }
  function L() { try { return R.lang && R.lang() === "es" ? "es" : "en"; } catch (e) { return "en"; } }
  function w(k, v) { var s = (W[k] || {})[L()] || ""; if (v) Object.keys(v).forEach(function (x) { s = s.split("{" + x + "}").join(v[x]); }); return s; }
  function $(id) { return D.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

  /* ── music: the key, chords, tunes ── */
  var MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10], PMAJ = [0, 2, 4, 7, 9], PMIN = [0, 3, 5, 7, 10];
  var PROGS = {
    maj: { a: [[0, "maj"], [7, "maj"], [9, "min"], [5, "maj"]], b: [[0, "maj"], [9, "min"], [5, "maj"], [7, "maj"]], c: [[0, "maj"], [5, "maj"], [7, "maj"], [5, "maj"]], d: [[9, "min"], [5, "maj"], [0, "maj"], [7, "maj"]] },
    min: { a: [[0, "min"], [8, "maj"], [3, "maj"], [10, "maj"]], b: [[0, "min"], [5, "min"], [7, "min"], [0, "min"]], c: [[0, "min"], [10, "maj"], [8, "maj"], [10, "maj"]], d: [[0, "min"], [8, "maj"], [10, "maj"], [0, "min"]] }
  };
  /* AOG-ONEBUTTON-12-V1 (2026-10-17): patterns that use the strip's six newer chords too (AOG-CHORDS-12-V1: in a major key
     vii°, V7, ♭VII, iv, II, ♭VI; in a minor key V, V7, ii°, IV, ♭II, vii°), and "strip": all 12, as the room shows them */
  PROGS.maj.e = [[0, "maj"], [10, "maj"], [5, "maj"], [0, "maj"]]; PROGS.maj.f = [[0, "maj"], [5, "maj"], [5, "min"], [0, "maj"]];
  PROGS.maj.g = [[2, "min"], [7, "dom7"], [0, "maj"], [0, "maj"]]; PROGS.maj.h = [[0, "maj"], [8, "maj"], [10, "maj"], [0, "maj"]];
  PROGS.min.e = [[0, "min"], [5, "min"], [7, "dom7"], [0, "min"]]; PROGS.min.f = [[0, "min"], [10, "maj"], [8, "maj"], [7, "maj"]];
  PROGS.min.g = [[2, "dim"], [7, "dom7"], [0, "min"], [0, "min"]]; PROGS.min.h = [[0, "min"], [5, "maj"], [0, "min"], [5, "maj"]];
  var PIDS = ["a", "b", "c", "d", "e", "f", "g", "h"];
  var ROMAN = { maj: { a: "I–V–vi–IV", b: "I–vi–IV–V", c: "I–IV–V–IV", d: "vi–IV–I–V", e: "I–♭VII–IV–I", f: "I–IV–iv–I", g: "ii–V7–I", h: "I–♭VI–♭VII–I" },
    min: { a: "i–VI–III–VII", b: "i–iv–v–i", c: "i–VII–VI–VII", d: "i–VI–VII–i", e: "i–iv–V7–i", f: "i–VII–VI–V", g: "ii°–V7–i", h: "i–IV–i–IV" } };
  /* tunes as steps of the key's scale (0 = the home note); both are old folk tunes, free for anyone */
  var TUNES = {
    twinkle: [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0, 4, 4, 3, 3, 2, 2, 1, 4, 4, 3, 3, 2, 2, 1, 0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0],
    ode: [2, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 2, 1, 1, 2, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 1, 0, 0],
    scale: [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1]
  };
  var WALK = [1, 1, 1, -1, 1, 1, -1, -1, -1, 1, -1, -1, -1, 1, 1, 1];
  function K() { var k = { key: 0, minor: false }; try { k = R.key() || k; } catch (e) {} return { key: ((k.key | 0) % 12 + 12) % 12, minor: !!k.minor }; }
  function scale() { return K().minor ? MIN : MAJ; }
  function degree(d) { var sc = scale(), o = Math.floor(d / 7), i = ((d % 7) + 7) % 7; return sc[i] + 12 * o; }
  function range() { var r = typeof R.range === "function" ? R.range() : R.range; return r && r.length === 2 ? r : [55, 79]; }
  /* the home note placed so that offsets lo..hi fit the instrument, as near its middle as can be */
  function base(lo, hi) {
    var r = range(), k = K().key, best = null, bd = 1e9, mid = (r[0] + r[1]) / 2;
    for (var t = k; t < 128; t += 12) {
      if (t + lo < r[0] || t + hi > r[1]) continue;
      var d = Math.abs(t + (lo + hi) / 2 - mid); if (d < bd) { bd = d; best = t; }
    }
    if (best == null) { best = k; while (best + lo < r[0]) best += 12; }
    return best;
  }
  function qFor(q) {
    var qs = R.qs || ["maj", "min"]; if (qs.indexOf(q) >= 0) return q;
    return (q === "min" || q === "m7" || q === "dim") ? "min" : "maj";
  }
  var LQ = { min: "min", m7: "m7", "7": "dom7", maj7: "maj7", dim: "dim" };
  function chordName(c) {
    try { if (R.name) return R.name(c); } catch (e) {}
    var N = (window.AOGSong && AOGSong.NOTES) || { en: ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"] };
    return (N[L()] || N.en)[((K().key + c.off) % 12 + 12) % 12] + (c.q === "min" ? "m" : c.q === "dom7" ? "7" : c.q === "maj7" ? "maj7" : c.q === "m7" ? "m7" : c.q === "dim" ? "dim" : "");
  }
  function noteName(m) {
    try { if (R.pc) return R.pc(m); } catch (e) {}
    var N = (window.AOGSong && AOGSong.NOTES) || { en: ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"] };
    return (N[L()] || N.en)[((m % 12) + 12) % 12];
  }
  function progChords(id) {
    var k = K();
    if (id === "room") { var p = []; try { p = (R.prog && R.prog()) || []; } catch (e) {} return p.map(function (c) { return { off: c.off, q: qFor(c.q) }; }); }
    if (id === "strip") { var sp = []; try { sp = (R.strip && R.strip()) || []; } catch (e) {} return sp.map(function (c) { return { off: ((c.off % 12) + 12) % 12, q: qFor(c.q) }; }); }
    if (id === "song") { var s = song(); return s && s.chords.length ? s.chords.map(function (c) { return { off: ((c.root - k.key) % 12 + 12) % 12, q: qFor(LQ[c.q] || "maj") }; }) : []; }
    return (PROGS[k.minor ? "min" : "maj"][id] || PROGS.maj.a).map(function (x) { return { off: x[0], q: qFor(x[1]) }; });
  }
  function rootOf(c) {
    try { if (R.root) return R.root(c); } catch (e) {}
    return base(0, 12) + c.off;
  }
  function inScale(m) { var k = K(), sc = scale(), pc = ((m - k.key) % 12 + 12) % 12; return sc.indexOf(pc) >= 0; }
  /* the walking bass: the root, the third, the fifth, then the note of the key just under the next root */
  function walkNotes(ch) {
    var out = [];
    ch.forEach(function (c, i) {
      var r = rootOf(c), nx = rootOf(ch[(i + 1) % ch.length]), third = c.q === "min" || c.q === "m7" || c.q === "dim" ? 3 : 4, fifth = c.q === "dim" ? 6 : 7;
      var ap = nx - 1; while (!inScale(ap) && ap > nx - 3) ap--;
      if (Math.abs(ap - (r + fifth)) > 9) ap = nx + (inScale(nx + 2) ? 2 : 1);
      out.push(r, r + third, r + fifth, ap);
    });
    return out;
  }
  function fitNotes() {
    var pent = K().minor ? PMIN : PMAJ, t = base(0, 16), out = [], i = 0;
    for (var n = 0; n < 32; n++) {
      out.push(t + pent[i % 5] + 12 * Math.floor(i / 5));
      var mv = WALK[n % WALK.length]; if (i + mv < 0 || i + mv > 7) mv = -mv; i += mv;
    }
    return out;
  }
  /* what the presses go through, in order */
  function items() {
    var k = C.what, s, list;
    if (k === "chord" || k === "root") {
      list = progChords(C.prog);
      if (!list.length) list = progChords("a");
      return list.map(function (c) { return k === "chord" ? { t: "chord", c: c } : { t: "note", m: rootOf(c), c: c }; });
    }
    if (k === "walk") {
      if (C.prog === "song" && (s = song()) && s.bass.length) return s.bass.map(function (n) { return { t: "note", m: fit1(n.m), at: n.t }; });
      list = progChords(C.prog); if (!list.length) list = progChords("a");
      return walkNotes(list).map(function (m) { return { t: "note", m: m }; });
    }
    if (k === "tune") {
      if (C.tune === "song" && (s = song()) && s.melody.length) return s.melody.map(function (n) { return { t: "note", m: fit1(n.m), at: n.t }; });
      var tn = TUNES[C.tune] || TUNES.twinkle, lo = Math.min.apply(null, tn.map(degree)), hi = Math.max.apply(null, tn.map(degree)), b = base(lo, hi);
      return tn.map(function (d) { return { t: "note", m: b + degree(d) }; });
    }
    if (k === "fit") return fitNotes().map(function (m) { return { t: "note", m: m }; });
    if (k === "beat") { var n = 0; try { n = R.beats(); } catch (e) {} var a = []; for (var i = 0; i < n; i++) a.push({ t: "beat", i: i, n: n }); return a; }
    if (k === "alt") return [{ t: "hit", ids: ["kick"], acc: [0], w: "kick" }, { t: "hit", ids: ["snare"], acc: [0], w: "snare" }];
    if (k === "groove") { var g = []; try { g = R.groove() || []; } catch (e) {} return g.map(function (x, i) { return { t: "hit", ids: x.ids, acc: x.acc, i: i, n: g.length }; }); }
    if (k === "startstop") return [{ t: "toggle" }];
    return [];
  }
  function fit1(m) { var r = range(); while (m < r[0]) m += 12; while (m > r[1]) m -= 12; return m; }
  var POS = {};
  function sig() { return C.what + "|" + (C.what === "tune" ? C.tune : C.prog); }
  /* the next one: in order, or, while the song in Learn a song plays, the one the song is at */
  function pick(advance) {
    var list = items(); if (!list.length) return null;
    var st = learnState(), s = st && st.playing ? song() : null, key = sig();
    if (s && (C.prog === "song" && (C.what === "chord" || C.what === "root" || C.what === "walk") || C.tune === "song" && C.what === "tune")) {
      var T = st.T, idx = -1;
      if (C.what === "chord" || C.what === "root") { s.chords.forEach(function (c, i) { if (c.t <= T + 0.05) idx = i; }); if (idx < 0) idx = 0; }
      else { for (var i = 0; i < list.length; i++) if ((list[i].at || 0) >= T - 0.08) { idx = i; break; } if (idx < 0) idx = list.length - 1; }
      if (advance) POS[key] = idx + 1;
      return list[idx];
    }
    var p = (POS[key] || 0) % list.length;
    if (advance) POS[key] = p + 1;
    return list[p];
  }
  function label(it) {
    if (!it) return "—";
    if (it.t === "chord") return chordName(it.c);
    if (it.t === "note") return noteName(it.m);
    if (it.t === "beat") return w("beatN", { n: it.i + 1, m: it.n });
    if (it.t === "hit") return it.w ? w(it.w) : w("hitN", { n: it.i + 1, m: it.n });
    if (it.t === "toggle") { var on = false; try { on = R.playing(); } catch (e) {} return w(on ? "stopB" : "startB"); }
    return "";
  }

  /* ── the song open in Learn a song (aog-learn-ui.js, another engineer's): read, never changed ── */
  var SONG = { id: null, data: null, busy: false };
  function learnState() {
    var U = window.AOGLearnUI; if (!U) return null;
    try { if (typeof U.now === "function") return U.now(); } catch (e) {}
    try { return U.test && U.test.state ? U.test.state() : null; } catch (e) { return null; }
  }
  function song() {
    var U = window.AOGLearnUI, st = learnState();
    if (!st || !st.open || !st.id) return null;
    try { if (typeof U.lesson === "function") { var Ls = U.lesson(); if (Ls) return fromLesson(Ls, st.fixes); } } catch (e) {}
    if (SONG.id !== st.id) { SONG.id = st.id; SONG.data = null; readSong(st.id); }
    return SONG.data;
  }
  function fromLesson(Ls, fx) {
    fx = fx || {}; var fc = fx.chords || {}, fm = (fx.notes || {}).melody || {}, fb = (fx.notes || {}).bass || {}, out = { chords: [], melody: [], bass: [] };
    (Ls.chords || []).forEach(function (c, i) { var f = fc[i], root = f ? f.root : c.root, q = f ? f.q : c.q;
      if (root == null || root < 0 || q === "N") return; var last = out.chords[out.chords.length - 1];
      if (last && last.root === root && last.q === q) return; out.chords.push({ t: +c.t || 0, root: root, q: q }); });
    var notes = function (arr, f) { var o = []; (arr || []).forEach(function (n, i) { var x = f[i]; if (x && x.del) return; o.push({ t: +n.t || 0, m: x && x.m != null ? x.m : n.m }); }); return o.sort(function (a, b) { return a.t - b.t; }); };
    out.melody = notes(Ls.melody, fm); out.bass = notes(Ls.bass, fb);
    return out;
  }
  function readSong(id) {
    if (!window.indexedDB) return;
    try {
      var r = indexedDB.open("aog-learn");
      r.onupgradeneeded = function () { try { r.transaction.abort(); } catch (e) {} };   /* never make the store: it is Learn a song's */
      r.onsuccess = function () {
        var db = r.result;
        if (!db.objectStoreNames.contains("songs")) { db.close(); return; }
        var q = db.transaction("songs", "readonly").objectStore("songs").get(id);
        q.onsuccess = function () { var rec = q.result; db.close(); if (rec && rec.lesson && SONG.id === id) { SONG.data = fromLesson(rec.lesson, rec.fixes); paintMenus(); paintBig(); } };
        q.onerror = function () { db.close(); };
      };
    } catch (e) {}
  }

  /* ── the clock: the song's tempo, or the room's pattern while it plays ── */
  function beatLen() { var b = 0; try { var s = window.AOGSong && AOGSong.get(); if (s && s.hasBpm) b = s.bpm; } catch (e) {} if (!(b > 0)) { try { b = +R.bpm(); } catch (e) {} } return 60 / (b > 0 ? b : 90); }
  var AN = null;   /* the beat the presses keep to: {t0, fixed (My Track's bar line), last} */
  function recording() { var b = $("recBtn") || $("takeBtn"); return !!(b && b.getAttribute("aria-pressed") === "true"); }
  function gridNow() { var g = null; try { g = R.grid && R.grid(); } catch (e) {} return g && g.beat > 0 ? g : null; }
  function landAt(now) {
    if (!C.time) return now;
    var g = gridNow(), st, t0, bl = beatLen();
    if (g) { st = g.beat / C.grid; t0 = g.t0; }
    else {
      st = bl / C.grid;
      var gap = AN ? now - AN.last : 1e9;
      if (!AN || (!AN.fixed && gap > Math.max(8 * bl, 2.5)) || (AN.fixed && !recording() && gap > 8 * bl)) { AN = { t0: now, fixed: false, last: now }; LASTAT = now; return now; }
      t0 = AN.t0;
    }
    var k = Math.ceil((now - t0 - 0.01) / st), at = Math.max(now, t0 + k * st);
    /* two quick presses: the second takes the next beat, never more than two beats ahead (nothing piles up) */
    if (LASTAT != null && at < LASTAT + st * 0.5 && LASTAT + st - now <= 2 * st + 0.001) at = LASTAT + st;
    LASTAT = at;
    return at;
  }
  var LASTAT = null;
  /* recording over My Track: the room's beat starts again on My Track's bar line (aog-recorder.js) and so do the presses */
  function wrapClock() {
    var A = window.AOGRoomClock; if (!A || !A.align || A.align._one) return;
    var o = A.align; A.align = function (t0) { AN = { t0: +t0 || 0, fixed: true, last: +t0 || 0 }; return o.apply(this, arguments); }; A.align._one = true;
  }
  /* the soft click: only from a press until two bars after the last one; straight to the speakers, never in a take */
  var CK = { timer: 0, next: 0, until: 0 };
  function clickFrom(at) {
    if (!C.click || !C.time) return;
    var c = R.ctx(), bl = (gridNow() || { beat: beatLen() }).beat, t0 = (gridNow() || AN || { t0: at }).t0;
    CK.until = at + 8 * bl;
    if (!CK.timer) { CK.next = t0 + Math.ceil((at - t0 - 0.005) / bl) * bl; CK.bl = bl; CK.t0 = t0; CK.timer = setInterval(clickPump, 100); clickPump(); }
  }
  function clickPump() {
    var c; try { c = R.ctx(); } catch (e) {}
    if (!c || PAUSED || c.currentTime > CK.until) { clickStop(); return; }
    while (CK.next < c.currentTime + 0.25 && CK.next <= CK.until) {
      if (CK.next >= c.currentTime - 0.01) {
        var bar = Math.round((CK.next - CK.t0) / CK.bl) % 4 === 0, o = c.createOscillator(), g = c.createGain(), t = CK.next;
        o.frequency.value = bar ? 1046.5 : 784; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(bar ? 0.05 : 0.035, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0005, t + 0.06);
        o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.08);
      }
      CK.next += CK.bl;
    }
  }
  function clickStop() { if (CK.timer) clearInterval(CK.timer); CK.timer = 0; }

  /* ── presses: from any switch to the room's own sound ── */
  var ON = false, PAUSED = false, HELD = {}, LASTOK = -1e9, LIVE = [], MSG = "";
  var T = { ticks: 0 };   /* the tests count the timers this file runs */
  function later(fn, ms) { return setTimeout(function () { T.ticks++; fn(); }, ms); }
  function away() { try { var f = window.frameElement; return !!f && (f.hidden || f.style.display === "none" || !f.getClientRects().length); } catch (e) { return false; } }
  function down(id, role) {
    if (!ON || PAUSED || HELD[id]) return false;
    var p = { id: id, role: role || "play" }; HELD[id] = p;
    if (C.hold > 0) p.ht = later(function () { p.ht = 0; if (HELD[id] === p) count(p); }, C.hold * 1000);
    else count(p);
    paintDown(); return true;
  }
  function up(id) {
    var p = HELD[id]; if (!p) return false; delete HELD[id];
    if (p.ht) { clearTimeout(p.ht); p.ht = 0; p.dropped = true; }
    else if (p.counted && !p.dropped) letGo(p);
    paintDown(); return true;
  }
  function count(p) {
    var ms = performance.now();
    if (C.guard > 0 && ms - LASTOK < C.guard * 1000) { p.dropped = true; return; }
    LASTOK = ms; p.counted = true; T.counted = (T.counted || 0) + 1;
    if (p.role === "two") { second(); return; }
    var c; try { c = R.ctx(); } catch (e) {}
    if (!c) return;
    try { if (c.state !== "running") c.resume(); } catch (e) {}
    var now = c.currentTime, it = pick(true), at = it && it.t === "toggle" ? now : landAt(now);
    if (AN && it && it.t !== "toggle") AN.last = at;
    p.item = it; p.at = at; T.last = { at: at, now: now };
    var lead = at - now;
    if (lead > 0.03) p.ft = later(function () { p.ft = 0; fire(p); }, (lead - 0.025) * 1000); else fire(p);
    if (it && it.t !== "toggle") clickFrom(at);
    paintBig();
  }
  function fire(p) {
    p.fired = true; MSG = "";
    var it = p.item, h = null, v = 0.74;
    if (!it) { MSG = w("empty"); paintMsg(); return; }
    try {
      if (it.t === "chord") h = R.chord(it.c, v, p.at);
      else if (it.t === "note") h = R.note(it.m, v, p.at);
      else if (it.t === "beat") { if (!R.beat(it.i, p.at, beatLen())) MSG = R.beats() ? "" : w("empty"); }
      else if (it.t === "hit") { if (R.hit(it.ids, it.acc, p.at) === false) MSG = w("wait"); }
      else if (it.t === "toggle") { if (R.playing()) R.stop(); else R.start(); }
    } catch (e) {}
    if (h === false) MSG = w("wait");
    p.h = h && h.off ? h : null; if (p.h) LIVE.push(p);
    paintMsg(); paintBig();
    if (p.released) letGo(p);
  }
  function letGo(p) {
    if (p.ft || !p.fired) { p.released = true; return; }
    if (!p.h) return;
    var c = null; try { c = R.ctx(); } catch (e) {}
    var end = function () { var h = p.h; p.h = null; var i = LIVE.indexOf(p); if (i >= 0) LIVE.splice(i, 1); try { if (h) h.off(); } catch (e) {} };
    var left = c ? p.at + 0.15 - c.currentTime : 0;   /* a quick tap still sounds as a note */
    if (left > 0.005) later(end, left * 1000); else end();
  }
  /* let go of everything: off, hushed, out of sight */
  function release(all) {
    Object.keys(HELD).forEach(function (id) { var p = HELD[id]; if (p.ht) clearTimeout(p.ht); if (p.ft) clearTimeout(p.ft); delete HELD[id]; });
    LIVE.slice().forEach(function (p) { try { p.h.off(); } catch (e) {} }); LIVE = [];
    clickStop(); gpLetGo();
    if (all) { try { if (R.quiet) R.quiet(); } catch (e) {} }
    paintDown();
  }
  function second() {
    if (C.two2 === "stop") { release(true); try { if (R.playing && R.playing()) R.stop(); } catch (e) {} paintBig(); return; }
    pick(true); paintBig();
  }

  /* keys: Space and Enter (switches send these), any key with Any key plays; never while typing or on another control */
  var KEYS = {}, LASTKEY = 0;
  function control(t) { return t && t.closest && t.closest("button,a,summary,select,input,textarea,[contenteditable],[role=button],[tabindex]:not(#obBig)"); }
  function keyRole(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return null;
    var k = e.key, t = e.target, tg = t && t.tagName;
    if (tg === "INPUT" || tg === "TEXTAREA" || tg === "SELECT" || (t && t.isContentEditable)) return null;
    var big = t && t.id === "obBig", nx = t && t.id === "obNext";
    if (k === " " || k === "Enter" || k === "Spacebar") {
      if (!big && !nx && control(t)) return null;   /* the page's own buttons work as always */
      if (nx) return "two";
      return C.two && k === "Enter" ? "two" : "play";
    }
    if (!C.any) return null;
    if (/^(Tab|Escape|Shift|Control|Alt|Meta|CapsLock|OS|Fn|Unidentified|Dead)$/.test(k)) return null;
    return "play";
  }
  function onKey(e) {
    if (!ON || PAUSED) return;
    if (e.type === "keydown") {
      var id = "k:" + (e.code || e.key);
      if (KEYS[id]) { e.preventDefault(); e.stopImmediatePropagation(); return; }   /* held: a key repeats on its own */
      if (away()) return;
      var role = keyRole(e); if (!role) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.repeat) return;
      KEYS[id] = 1; LASTKEY = Date.now(); down(id, role);
    } else {
      var id2 = "k:" + (e.code || e.key); if (!KEYS[id2]) return;
      delete KEYS[id2]; e.preventDefault(); e.stopImmediatePropagation(); up(id2);
    }
  }
  window.addEventListener("keydown", onKey, true);
  window.addEventListener("keyup", onKey, true);
  window.addEventListener("blur", function () { Object.keys(KEYS).forEach(function (id) { delete KEYS[id]; up(id); }); });

  /* a game controller: looked at every 50 ms, only while one is connected, one button is on and the room is in sight */
  var GP = { timer: 0, prev: {}, name: "" };
  function pads() { try { return [].filter.call(navigator.getGamepads ? navigator.getGamepads() : [], function (g) { return !!g; }); } catch (e) { return []; } }
  function gpSync() {
    var want = ON && !PAUSED && !D.hidden && !away() && pads().length > 0;
    if (want && !GP.timer) GP.timer = setInterval(gpPoll, 50);
    else if (!want && GP.timer) { clearInterval(GP.timer); GP.timer = 0; gpLetGo(); }
  }
  function gpPoll() {
    T.ticks++;
    var list = pads(); if (!list.length) { gpSync(); return; }
    list.forEach(function (g) {
      var pv = GP.prev[g.index] || (GP.prev[g.index] = []);
      (g.buttons || []).forEach(function (b, i) {
        var on = !!(b && (b.pressed || b.value > 0.5)), id = "gp" + g.index + ":" + i;
        if (on && !pv[i]) down(id, C.two && i === 1 ? "two" : "play");
        else if (!on && pv[i]) up(id);
        pv[i] = on;
      });
    });
  }
  function gpLetGo() { Object.keys(HELD).forEach(function (id) { if (id.indexOf("gp") === 0) up(id); }); GP.prev = {}; }
  window.addEventListener("gamepadconnected", function (e) { GP.name = (e.gamepad && e.gamepad.id) || ""; gpSync(); paintMsg(); });
  window.addEventListener("gamepaddisconnected", function () { gpSync(); paintMsg(); });

  /* hushed by the Studio (a room out of sight) or a hidden page: let go, stop looking; back in sight: look again */
  function hush(on) { PAUSED = !!on; if (on) release(false); gpSync(); }
  window.addEventListener("aog-hush", function (e) { hush(!!(e && e.detail && e.detail.on)); });
  D.addEventListener("visibilitychange", function () { if (D.hidden) release(false); gpSync(); });

  /* a MIDI keyboard, with Any key plays on (aog-midi.js asks before the room plays the key) */
  function midi(cmd, n) {
    if (cmd === 0x90) { if (!ON || PAUSED || !C.any) return false; down("midi" + n, "play"); return true; }
    if (cmd === 0x80) return up("midi" + n);
    return false;
  }

  /* ── drawing it ── */
  var CSS = [
    ".ob-in{padding:0 14px 16px;display:grid;gap:.8rem}",
    ".ob .ob-line{margin:0;font:600 1rem/1.4 var(--sans,system-ui,sans-serif);color:#dfe8e1}",
    ".ob .ob-msg:empty{display:none}.ob .ob-msg{font-weight:700;color:#f5efd9}",
    ".ob-b{min-height:48px;padding:.55rem 1.1rem;border-radius:12px;border:2px solid #6f9c86;background:#21332b;color:#f2f6f1;font:800 1rem/1.2 var(--sans,system-ui,sans-serif);cursor:pointer;touch-action:manipulation}",
    ".ob-b[aria-pressed=true]{background:#a9d3bd;color:#10241a;border-color:#a9d3bd}",
    ".ob-b:focus-visible,.ob-big:focus-visible{outline:4px solid #f0c26e;outline-offset:3px}",
    ".ob-big{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;width:100%;min-height:clamp(180px,46vh,420px);padding:1rem;border-radius:26px;border:3px solid #2f5e48;background:#a9d3bd;color:#10241a;cursor:pointer;",
    "touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}",
    ".ob-big b{font:800 clamp(2.6rem,11vw,5rem)/1.05 var(--sans,system-ui,sans-serif);color:#0c1d14;max-width:100%;overflow-wrap:anywhere}",
    ".ob-big small{font:700 1.15rem/1.2 var(--sans,system-ui,sans-serif);color:#173326}",
    ".ob-big.down{background:#7fb89b;border-color:#1f4434}.ob-big.down small{color:#0c1d14}",
    ".ob-next{width:100%;min-height:72px;font-size:1.2rem}",
    ".ob-row{display:flex;flex-wrap:wrap;gap:.6rem .9rem;align-items:flex-end}",
    ".ob-f{display:grid;gap:.3rem;min-width:min(100%,15rem);flex:1 1 15rem}",
    ".ob-f span{font:700 .95rem/1.2 var(--sans,system-ui,sans-serif);color:#dfe8e1}",
    ".ob select{font-size:16px;min-height:46px;padding:.35rem .6rem;border-radius:10px;border:1px solid #6f9c86;background:#0f1713;color:#f2f6f1;max-width:100%}",
    ".ob select:focus-visible,.ob input:focus-visible{outline:3px solid #f0c26e;outline-offset:2px}",
    ".ob-chk{display:flex;align-items:center;gap:.6rem;min-height:44px;color:#eef3ee;font:700 1rem/1.25 var(--sans,system-ui,sans-serif);cursor:pointer}",
    ".ob-chk input{width:24px;height:24px;flex:0 0 auto;accent-color:#a9d3bd}",
    ".ob-more{border:1px solid #3d5247;border-radius:12px;background:#111a16}",
    ".ob-more>summary{min-height:48px;display:flex;align-items:center;padding:0 14px;cursor:pointer;list-style:none;font:800 1rem/1.2 var(--sans,system-ui,sans-serif);color:#f2f6f1}",
    ".ob-more>summary::-webkit-details-marker{display:none}.ob-more>summary::before{content:'\\25B8';margin-right:.5rem;color:#a9d3bd}.ob-more[open]>summary::before{content:'\\25BE'}",
    ".ob-more>summary:focus-visible{outline:3px solid #f0c26e;outline-offset:2px}",
    ".ob-more>div{padding:0 14px 14px;display:grid;gap:.7rem}"
  ].join("\n");
  function opt(v, t, cur) { return '<option value="' + esc(v) + '"' + (String(v) === String(cur) ? " selected" : "") + ">" + esc(t) + "</option>"; }
  function chk(id, k) { return '<label class="ob-chk"><input type="checkbox" id="' + id + '"><span data-w="' + k + '"></span></label>'; }
  function field(id, k) { return '<label class="ob-f"><span data-w="' + k + '"></span><select id="' + id + '"></select></label>'; }
  var BUILT = false;
  function build() {
    var host = $("obIn"); if (!host || BUILT) return;
    BUILT = true;
    if (!$("ob-play-css")) { var st = D.createElement("style"); st.id = "ob-play-css"; st.textContent = CSS; D.head.appendChild(st); }
    host.innerHTML =
      '<p class="ob-line" data-w="intro"></p>' +
      '<div class="ob-row"><button type="button" class="ob-b" id="obOn" aria-pressed="false"></button></div>' +
      '<button type="button" class="ob-big" id="obBig" hidden><b id="obName"></b><small id="obSay"></small></button>' +
      '<button type="button" class="ob-b ob-next" id="obNext" hidden></button>' +
      '<p class="ob-line ob-msg" id="obMsg" aria-live="polite"></p>' +
      '<div class="ob-row">' + field("obWhat", "what") + '<label class="ob-f" id="obProgF"><span data-w="chords"></span><select id="obProg"></select></label>' +
        '<label class="ob-f" id="obTuneF"><span data-w="tune"></span><select id="obTune"></select></label></div>' +
      '<div id="obTimeBox">' + chk("obTime", "time") + '<p class="ob-line" data-w="timeLine"></p>' +
        '<div class="ob-row" id="obTimeMore">' + field("obGrid", "grid") + '</div>' + chk("obClick", "click") + '</div>' +
      '<details class="ob-more" id="obMore"><summary data-w="more"></summary><div>' +
        chk("obAny", "any") + '<p class="ob-line" data-w="anyLine"></p>' +
        chk("obTwo", "two") + '<div class="ob-row" id="obTwoRow">' + field("obTwo2", "two2") + '</div><p class="ob-line" id="obTwoLine" data-w="twoLine"></p>' +
        '<div class="ob-row">' + field("obHold", "hold") + field("obGuard", "guard") + '</div><p class="ob-line" data-w="holdLine"></p>' +
        '<div class="ob-row" id="obMidiRow" hidden><button type="button" class="ob-b" id="obMidi"></button></div><p class="ob-line" id="obMidiLine" aria-live="polite"></p>' +
        '<p class="ob-line" id="obPad"></p>' +
      '</div></details>';
    bind(); paint();
    try { new MutationObserver(function () { if (paint.lang !== L()) paint(); }).observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
    if (window.AOGSong && AOGSong.on) AOGSong.on(function () { paintMenus(); paintBig(); });
    if (C.on) setOn(true, true);
  }
  function paint() {
    paint.lang = L();
    D.querySelectorAll("#obBox [data-w]").forEach(function (el) { el.textContent = w(el.getAttribute("data-w")); });
    paintMenus(); paintOn(); paintBig(); paintMsg();
  }
  function paintMenus() {
    if (!BUILT) return;
    var k = K(), mode = k.minor ? "min" : "maj";
    $("obWhat").innerHTML = kinds.map(function (x) { return opt(x, w("k_" + x), C.what); }).join("");
    var po = PIDS.map(function (id) { return opt(id, progChords(id).map(chordName).join(" – ") + "  (" + ROMAN[mode][id] + ")", C.prog); });
    if (progChords("strip").length) po.push(opt("strip", w("p_strip"), C.prog));
    var rp = []; try { rp = (R.prog && R.prog()) || []; } catch (e) {}
    if (rp.length) po.push(opt("room", w("p_room"), C.prog));
    var s = song(); if (s && (s.chords.length || (R.room === "bass" && s.bass.length))) po.push(opt("song", w("p_song"), C.prog));
    $("obProg").innerHTML = po.join("");
    if ($("obProg").value !== C.prog) $("obProg").value = "a";
    var to = ["twinkle", "ode", "scale"].map(function (id) { return opt(id, w("t_" + id), C.tune); });
    if (s && s.melody.length) to.push(opt("song", w("t_song"), C.tune));
    $("obTune").innerHTML = to.join("");
    if ($("obTune").value !== C.tune) $("obTune").value = "twinkle";
    $("obProgF").hidden = !(C.what === "chord" || C.what === "root" || C.what === "walk");
    $("obTuneF").hidden = C.what !== "tune";
    $("obTimeBox").hidden = C.what === "startstop";
    $("obGrid").innerHTML = opt(1, w("g1"), C.grid) + opt(2, w("g2"), C.grid);
    $("obTwo2").innerHTML = opt("next", w("s_next"), C.two2) + opt("stop", w("s_stop"), C.two2);
    var sec = function (n) { return L() === "es" ? String(n).replace(".", ",") : String(n); };
    $("obHold").innerHTML = [0, 0.1, 0.2, 0.3, 0.5].map(function (n) { return opt(n, n ? sec(n) + " s" : w("noWait"), C.hold); }).join("");
    $("obGuard").innerHTML = [0, 0.25, 0.5, 1].map(function (n) { return opt(n, n ? w("gFor", { n: sec(n) }) : w("gOff"), C.guard); }).join("");
    $("obTime").checked = !!C.time; $("obClick").checked = !!C.click; $("obAny").checked = !!C.any; $("obTwo").checked = !!C.two;
    $("obTimeMore").hidden = !C.time; $("obClick").closest("label").hidden = !C.time;
    $("obTwoRow").hidden = !C.two; $("obTwoLine").hidden = !C.two;
    var rb = $("midiBtn"), can = !!navigator.requestMIDIAccess && (rb ? !rb.hidden : true);
    $("obMidiRow").hidden = !can; $("obMidi").textContent = rb && rb.textContent ? rb.textContent : w("midi");
  }
  function paintOn() { if (!BUILT) return; var b = $("obOn"); b.textContent = w(ON ? "off" : "on"); b.setAttribute("aria-pressed", ON ? "true" : "false"); $("obBig").hidden = !ON; $("obNext").hidden = !(ON && C.two); $("obNext").textContent = w(C.two2 === "stop" ? "b_stop" : "b_next"); }
  function paintBig() {
    if (!BUILT || !ON) return;
    var it = pick(false), x = label(it);
    if ($("obName").textContent !== x) $("obName").textContent = x;
    var say = w("press"); if ($("obSay").textContent !== say) $("obSay").textContent = say;
    $("obBig").setAttribute("aria-label", w("big", { x: x }));
  }
  function paintDown() { if (!BUILT) return; var d = Object.keys(HELD).some(function (id) { return HELD[id].role !== "two"; }); $("obBig").classList.toggle("down", d); }
  function paintMsg() { if (!BUILT) return; $("obMsg").textContent = MSG; var pl = pads(); $("obPad").textContent = pl.length ? w("padOn", { name: (pl[0].id || GP.name || "").replace(/\s*\(.*$/, "") }) : w("pad"); }
  function setOn(on, quiet) {
    ON = !!on; C.on = ON; save();
    if (ON) { try { R.ctx(); } catch (e) {} wrapClock(); }   /* the sound starts inside this tap (an iPad starts it only so); nothing plays */
    else { release(true); AN = null; LASTAT = null; }
    paintOn(); paintBig(); gpSync();
    if (ON && !quiet) {
      var b = $("obBig");
      try { b.focus({ preventScroll: true }); } catch (e) {}
      try { var r = b.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) b.scrollIntoView({ block: r.height > innerHeight * 0.8 ? "start" : "center" }); } catch (e) {}
    }
  }
  function bind() {
    $("obOn").onclick = function () { setOn(!ON); };
    var big = $("obBig"), nx = $("obNext"), LASTPTR = 0;
    [[big, "play", "p"], [nx, "two", "n"]].forEach(function (a) {
      var el = a[0];
      el.addEventListener("pointerdown", function (e) {
        if (e.button > 0) return; e.preventDefault(); LASTPTR = Date.now();
        try { el.setPointerCapture(e.pointerId); } catch (x) {}
        try { el.focus({ preventScroll: true }); } catch (x) {}
        if (!away()) down(a[2] + e.pointerId, a[1]);
      });
      var lift = function (e) { up(a[2] + e.pointerId); };
      el.addEventListener("pointerup", lift); el.addEventListener("pointercancel", lift); el.addEventListener("lostpointercapture", lift);
      el.addEventListener("contextmenu", function (e) { e.preventDefault(); });
      el.addEventListener("touchstart", function (e) { if (e.cancelable) e.preventDefault(); }, { passive: false });   /* no magnifier, no zoom */
      /* a screen reader's or Switch Control's tap arrives as a click alone */
      el.addEventListener("click", function (e) { e.preventDefault(); if (Date.now() - LASTPTR < 1200 || Date.now() - LASTKEY < 1200) return; if (down("tap" + a[2], a[1])) later(function () { up("tap" + a[2]); }, 160); });
    });
    var sel = function (id, k, num) { $(id).onchange = function () { C[k] = num ? +this.value : this.value; save(); paintMenus(); paintOn(); paintBig(); }; };
    sel("obWhat", "what"); sel("obProg", "prog"); sel("obTune", "tune"); sel("obGrid", "grid", 1); sel("obTwo2", "two2"); sel("obHold", "hold", 1); sel("obGuard", "guard", 1);
    var box = function (id, k) { $(id).onchange = function () { C[k] = this.checked; save(); if (k === "time" || k === "click") clickStop(); paintMenus(); paintOn(); paintBig(); }; };
    box("obTime", "time"); box("obClick", "click"); box("obAny", "any"); box("obTwo", "two");
    $("obWhat").addEventListener("focus", function () { paintMenus(); });
    $("obMidi").onclick = function () {
      var rb = $("midiBtn"), line = $("obMidiLine");
      if (rb) {
        var ml = $("midiLine");
        if (ml && !ml._ob) { ml._ob = 1; try { new MutationObserver(function () { line.textContent = ml.textContent; }).observe(ml, { childList: true, characterData: true, subtree: true }); } catch (e) {} }
        rb.click(); return;
      }
      var go = function () { if (!window.AOGMidi) return; if (!GP.midi) GP.midi = AOGMidi.attach({ btn: null, line: line, lang: L, start: function () { try { R.ctx(); } catch (e) {} },
        on: function (n) { down("midi" + n, "play"); }, off: function (n) { up("midi" + n); } }); GP.midi.use(); };
      if (window.AOGMidi) go(); else { var s = D.createElement("script"); s.src = "/aog-midi.js"; s.onload = go; D.head.appendChild(s); }
    };
    $("obBox").addEventListener("toggle", function () { if ($("obBox").open) { paintMenus(); paintBig(); } });
  }
  function mount() { build(); }
  window.AOGOne = {
    ready: true, mount: mount, midi: midi, load: function () { return Promise.resolve(); },
    /* for the tests */
    _t: { cfg: function () { return JSON.parse(JSON.stringify(C)); }, set: function (o) { Object.keys(o || {}).forEach(function (k) { C[k] = o[k]; }); save(); if (BUILT) { paintMenus(); paintOn(); paintBig(); } },
      on: function (v) { if (v == null) return ON; setOn(!!v, true); return ON; }, down: down, up: up, items: items, next: function () { return label(pick(false)); },
      reset: function () { POS = {}; AN = null; LASTAT = null; LASTOK = -1e9; }, ticks: function () { return T.ticks; }, last: function () { return T.last; }, counted: function () { return T.counted || 0; },
      timers: function () { return { gp: !!GP.timer, click: !!CK.timer, held: Object.keys(HELD).length, live: LIVE.length }; }, song: song, hush: hush }
  };
  mount();
})();
