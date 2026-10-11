/* ══ AOG-LEARN-V1 (2026-10-11) — Learn a song: the player and the teacher, in the Piano, the Guitar and the Bass ═════════
   Jimmy: "Can the guitar, bass and piano teach how to play songs if I upload them?" … "do them all": the chords along
   with the song, exact MIDI files, "Did I get it?", the bass line and the melody.

   The listening is aog-learn.js (window.AOGLearn, another engineer's): analyze(audio) and fromMidi(bytes) give a Lesson
     { v:1, src:"audio"|"midi", name, sec, sr, bpm, beats[], downbeats[], meter{num,den}, key{key,minor,conf},
       chords[{t,d,root,q,name,conf}], bass[{t,d,m,conf}], melody[{t,d,m,conf}], tracks[{name,ch,program,drums,notes[{t,d,m,v}]}] }
   in seconds of the original song. It is loaded only when a song is chosen.

   This file is the rest, the same in each room: choose a song (this device, or the Turntables' crate, IndexedDB
   "aog-crate"), keep it with its lesson on the device (IndexedDB "aog-learn": the Lesson, the learner's fixes, the last
   speed, loop and part), play it on its own AudioContext (heard, never in a take), the bars with their chords, the chord
   now and the next one with a count ("Next: G in 3"), Speed 50–100 % keeping the pitch (WSOLA, as the Mixing Desk's,
   made once per speed), a loop of bars, count-in clicks, Fix this chord / Fix this note, the notes of a part coming
   (a MIDI track, the bass line, the tune), Wait for me, and after a pass a kind word on how it went.
   Learning sits beside the playing (STUDIO-HANDOFF §13–14): one closed "Learn a song" after the instrument.

   A room says what it can do, before this file runs (it is loaded with defer):
     window.AOGLearnRoom = { room:"piano"|"guitar"|"bass", lang:()=>"en"|"es", busy:()=>bool (the room's own pattern
       is playing, so its notes are not the learner's), show:(what)=>{} }
   what = null, or { chord:{root, q, id (aog-chords.js id), pcs[]} } or { notes:[midi…] }: the room lights that shape
   (keys, frets near the hand) in its own way. What the learner plays comes from the notes every room already reports
   (AOGRecorder.note, AOG-NOTES-V1: keys, chord pads, strums, a MIDI keyboard) and, on the guitar and bass, from a real
   instrument through aog-liveinput.js (AOGLive.listen, its pitch detector), while its input is on.
   Nothing leaves the device. ══════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var D = document, H = null;
  var IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  /* AOG-DJ-AUDIO-ONLY-V2: on an iPhone or iPad each kind of music file by its type (no wildcard, nothing that is also a video) */
  var ACCEPT = IOS ? "audio/mpeg,audio/mp3,audio/x-m4a,audio/m4a,audio/aac,audio/wav,audio/x-wav,audio/aiff,audio/x-aiff,audio/flac,audio/x-caf,audio/midi,audio/x-midi,audio/mid"
    : "audio/*,.mp3,.m4a,.aac,.wav,.aif,.aiff,.ogg,.opus,.flac,.caf,.mid,.midi,audio/midi";
  var W = {
    sum: { en: "Learn a song", es: "Aprende una canción" },
    intro: { en: "Play along with a song you choose. It stays on this device.", es: "Toca junto con una canción que elijas. Se queda en este aparato." },
    file: { en: "Choose a song from this device", es: "Elige una canción de este aparato" },
    kinds: { en: "A song file, or a MIDI file (.mid).", es: "Un archivo de canción o un archivo MIDI (.mid)." },
    pickFile: { en: "On an iPad or iPhone, pick Choose File, then your song.", es: "En un iPad o iPhone, elige Elegir archivo y luego tu canción." },
    list: { en: "Or a song you already have", es: "O una canción que ya tienes" },
    listHere: { en: "Learned here", es: "Aprendidas aquí" }, listCrate: { en: "From the Turntables", es: "De los tocadiscos" },
    listPick: { en: "Pick a song", es: "Elige una canción" }, listNone: { en: "No songs yet", es: "Todavía no hay canciones" },
    open: { en: "Open this song", es: "Abrir esta canción" },
    other: { en: "Choose another song", es: "Elegir otra canción" },
    stopWork: { en: "Stop", es: "Parar" },
    stopped: { en: "Stopped. Choose a song when you are ready.", es: "Detenido. Elige una canción cuando quieras." },
    noEngine: { en: "The song listener is not ready on this device yet. Try again later.", es: "El oyente de canciones aún no está listo en este aparato. Inténtalo más tarde." },
    failed: { en: "That song did not open. Try another file.", es: "Esa canción no se abrió. Prueba otro archivo." },
    gone: { en: "That song is no longer on this device. Choose it again.", es: "Esa canción ya no está en este aparato. Elígela otra vez." },
    kept: { en: "Kept on this device. It opens at once next time.", es: "Guardada en este aparato. La próxima vez se abre al instante." },
    pg: { start: { en: "Getting the song…", es: "Preparando la canción…" }, listen: { en: "Listening to the song…", es: "Escuchando la canción…" },
      beats: { en: "Finding the beat…", es: "Buscando el pulso…" }, key: { en: "Finding the key…", es: "Buscando la tonalidad…" },
      chords: { en: "Finding the chords…", es: "Buscando los acordes…" }, bass: { en: "Finding the bass line…", es: "Buscando la línea de bajo…" },
      melody: { en: "Finding the tune…", es: "Buscando la melodía…" }, done: { en: "Ready.", es: "Lista." } },
    songLine: { en: "{key} · {bpm} beats a minute · {bars} bars", es: "{key} · {bpm} pulsos por minuto · {bars} compases" },
    major: { en: "major", es: "mayor" }, minor: { en: "minor", es: "menor" },
    follow: { en: "Follow", es: "Seguir" },
    fChords: { en: "The chords", es: "Los acordes" }, fBass: { en: "The bass line", es: "La línea de bajo" }, fTune: { en: "The tune", es: "La melodía" },
    fAll: { en: "All the parts (no drums)", es: "Todas las partes (sin batería)" }, fTrack: { en: "Part: {n}", es: "Parte: {n}" },
    speed: { en: "Speed", es: "Velocidad" },
    making: { en: "Making a slower copy. The notes stay the same…", es: "Haciendo una copia más lenta. Las notas no cambian…" },
    readying: { en: "Getting the song ready…", es: "Preparando la canción…" },
    play: { en: "▶ Play", es: "▶ Tocar" }, pause: { en: "❚❚ Pause", es: "❚❚ Pausa" },
    toStart: { en: "To the start", es: "Al principio" },
    loop: { en: "Loop a part", es: "Repetir una parte" }, loopOff: { en: "Stop the loop", es: "Quitar la repetición" },
    loop1: { en: "Tap the first bar of the part.", es: "Toca el primer compás de la parte." },
    loop2: { en: "Now tap the last bar.", es: "Ahora toca el último compás." },
    loopOn: { en: "Bars {a}–{b} play again and again.", es: "Los compases {a}–{b} se repiten." },
    loopOne: { en: "Bar {a} plays again and again.", es: "El compás {a} se repite." },
    wait: { en: "Wait for me", es: "Espérame" },
    waitLine: { en: "The song waits until you play the lit notes.", es: "La canción espera hasta que toques las notas iluminadas." },
    yourTurn: { en: "Your turn: {n}", es: "Te toca: {n}" },
    count: { en: "Count me in", es: "Cuéntame antes" },
    ready: { en: "Get ready… {n}", es: "Prepárate… {n}" },
    now: { en: "Now", es: "Ahora" },
    next: { en: "Next: {c} in {n}", es: "Después: {c} en {n}" }, nextFar: { en: "Next: {c}", es: "Después: {c}" },
    end: { en: "That's the end of the song.", es: "Ese es el final de la canción." },
    noChord: { en: "No chord", es: "Sin acorde" },
    bar: { en: "Bar {n}", es: "Compás {n}" },
    barsLab: { en: "The bars. Tap one to go there.", es: "Los compases. Toca uno para ir ahí." },
    fix: { en: "Fix this chord", es: "Corregir este acorde" },
    fixRoot: { en: "Note", es: "Nota" }, fixKind: { en: "Kind", es: "Tipo" },
    save: { en: "Save", es: "Guardar" }, cancel: { en: "Cancel", es: "Cancelar" },
    fixed: { en: "Saved. This chord is now {c}.", es: "Guardado. Este acorde ahora es {c}." },
    noteTap: { en: "Tap a note to fix it.", es: "Toca una nota para corregirla." },
    noteFix: { en: "Fix this note: {n}", es: "Corregir esta nota: {n}" },
    up: { en: "Up a step", es: "Subir un paso" }, down: { en: "Down a step", es: "Bajar un paso" }, out: { en: "Take it out", es: "Quitarla" },
    noteSaved: { en: "Saved. The note is now {n}.", es: "Guardado. La nota ahora es {n}." },
    noteOut: { en: "Saved. That note is out.", es: "Guardado. Esa nota ya no está." },
    guide: { en: "This is a guide; some notes may be off.", es: "Es una guía; algunas notas pueden no ser exactas." },
    noNotes: { en: "No notes here yet.", es: "Aquí todavía no hay notas." },
    useKey: { en: "Play in the song's key ({k})", es: "Tocar en la tonalidad de la canción ({k})" },
    keyDone: { en: "The room is in {k} now.", es: "La sala ahora está en {k}." },
    resAllC: { en: "You played all {n} chords on time.", es: "Tocaste los {n} acordes a tiempo." },
    resC: { en: "You played {k} of {n} chords on time.", es: "Tocaste {k} de {n} acordes a tiempo." },
    resAllN: { en: "You played all {n} notes on time.", es: "Tocaste las {n} notas a tiempo." },
    resN: { en: "You played {k} of {n} notes on time.", es: "Tocaste {k} de {n} notas a tiempo." },
    cLate: { en: "The change to {c} came a little late", es: "El cambio a {c} llegó un poco tarde" },
    cEarly: { en: "The change to {c} came a little early", es: "El cambio a {c} llegó un poco antes" },
    cOther: { en: "At the change to {c}, other notes sounded", es: "En el cambio a {c} sonaron otras notas" },
    cMissed: { en: "The change to {c} went by quietly", es: "El cambio a {c} pasó en silencio" },
    nLate: { en: "The {c} in bar {b} came a little late", es: "El {c} del compás {b} llegó un poco tarde" },
    nEarly: { en: "The {c} in bar {b} came a little early", es: "El {c} del compás {b} llegó un poco antes" },
    nOther: { en: "In bar {b}, another note sounded for {c}", es: "En el compás {b} sonó otra nota en lugar de {c}" },
    nMissed: { en: "The {c} in bar {b} went by quietly", es: "El {c} del compás {b} pasó en silencio" },
    tryAt: { en: " — try the loop at {n}%.", es: ": prueba la repetición al {n} %." },
    tryBar: { en: " — try a loop on bar {b}.", es: ": prueba a repetir el compás {b}." },
    faster: { en: " Want to try it a little faster?", es: " ¿Probamos un poco más rápido?" },
    same: { en: " It sounds like the song.", es: " Suena como la canción." },
    mOk: { en: "on time", es: "a tiempo" }, mTry: { en: "worth another go", es: "para probar otra vez" }
  };
  var QM = { maj: { id: "maj", iv: [0, 4, 7], s: "" }, min: { id: "min", iv: [0, 3, 7], s: "m" }, "7": { id: "dom7", iv: [0, 4, 7, 10], s: "7" },
    maj7: { id: "maj7", iv: [0, 4, 7, 11], s: "maj7" }, m7: { id: "m7", iv: [0, 3, 7, 10], s: "m7" }, sus2: { id: "sus2", iv: [0, 2, 7], s: "sus2" },
    sus4: { id: "sus4", iv: [0, 5, 7], s: "sus4" }, dim: { id: "dim", iv: [0, 3, 6], s: "dim" }, aug: { id: "aug", iv: [0, 4, 8], s: "aug" }, "5": { id: "five", iv: [0, 7], s: "5" } };
  var QN = { maj: { en: "Major", es: "Mayor" }, min: { en: "Minor", es: "Menor" }, "7": { en: "Seventh (7)", es: "Séptima (7)" }, maj7: { en: "Major seventh (maj7)", es: "Séptima mayor (maj7)" },
    m7: { en: "Minor seventh (m7)", es: "Menor séptima (m7)" }, sus2: { en: "Sus2", es: "Sus2" }, sus4: { en: "Sus4", es: "Sus4" }, dim: { en: "Diminished (dim)", es: "Disminuido (dim)" },
    aug: { en: "Augmented (aug)", es: "Aumentado (aug)" }, "5": { en: "Power chord (5)", es: "Power chord (5)" }, N: { en: "No chord", es: "Sin acorde" } };
  var NM = { en: { s: ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"], f: ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"] },
    es: { s: ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"], f: ["Do", "Re♭", "Re", "Mi♭", "Mi", "Fa", "Sol♭", "Sol", "La♭", "La", "Si♭", "Si"] } };
  var SPEEDS = [50, 60, 70, 75, 80, 90, 100];
  function L() { try { if (H && H.lang) return H.lang() === "es" ? "es" : "en"; } catch (e) {} return (D.documentElement.getAttribute("lang") || "en").indexOf("es") === 0 ? "es" : "en"; }
  function w(k, v) { var x = W[k]; var s = x ? (x[L()] || x.en) : k; if (v) Object.keys(v).forEach(function (n) { s = s.split("{" + n + "}").join(v[n]); }); return s; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function $(id) { return D.getElementById(id); }
  function pcOf(m) { return ((Math.round(m) % 12) + 12) % 12; }
  var touchy = function () { try { return matchMedia("(pointer: coarse)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };

  /* ── the song now open: its record (kept on the device) and what is worked out from it ── */
  var CUR = null;   /* {rec, L, bars, beats, ev (what to play, in order), notes (the part's notes), follow} */
  function flats() { var k = CUR && CUR.L.key || {}, maj = k.minor ? ((k.key | 0) + 3) % 12 : (k.key | 0); return [5, 10, 3, 8, 1].indexOf(maj) >= 0; }
  function pcName(pc) { return NM[L()][flats() ? "f" : "s"][pcOf(pc)]; }
  function noteName(m) { return pcName(m) + (Math.floor(Math.round(m) / 12) - 1); }
  function chordName(c) {
    if (!c || c.root < 0 || c.q === "N" || !QM[c.q]) return w("noChord");
    var s = QM[c.q].s; return pcName(c.root) + (L() === "es" && /^[a-z]/i.test(s) ? " " + s : s);
  }
  function keyName() { var k = CUR.L.key || { key: 0 }; return pcName(k.key | 0) + " " + w(k.minor ? "minor" : "major"); }
  function chordPcs(c) { return QM[c.q] ? QM[c.q].iv.map(function (i) { return (c.root + i) % 12; }) : []; }
  function num(x, d) { return typeof x === "number" && isFinite(x) ? x : d; }
  function build() {
    var Ls = CUR.L, sec = num(Ls.sec, 0), bpm = num(Ls.bpm, 0) > 0 ? Ls.bpm : 120, n = (Ls.meter && Ls.meter.num) || 4;
    var beats = (Ls.beats || []).filter(isFinite).slice().sort(function (a, b) { return a - b; });
    if (beats.length < 2) { beats = []; for (var t = 0; t < sec + 1e-6; t += 60 / bpm) beats.push(t); }
    var db = (Ls.downbeats || []).filter(isFinite).slice().sort(function (a, b) { return a - b; });
    if (db.length < 1) db = beats.filter(function (_, i) { return i % n === 0; });
    if (db.length && db[0] > 0.3) db.unshift(0);   /* the notes before the first bar line: a short bar of their own */
    var barLen = 60 / bpm * n;
    var bars = db.map(function (t, i) { return { i: i, t: t, e: i + 1 < db.length ? db[i + 1] : Math.max(t + 0.05, Math.min(sec || t + barLen, t + (i ? t - db[i - 1] : barLen))) }; });
    while (bars.length && sec && bars[bars.length - 1].e < sec - 0.05) { var lb = bars[bars.length - 1]; bars.push({ i: bars.length, t: lb.e, e: Math.min(sec, lb.e + barLen) }); }
    CUR.bars = bars; CUR.beats = beats; CUR.sec = sec || (bars.length ? bars[bars.length - 1].e : 0);
    rebuildPart();
  }
  function barOf(t) { var b = CUR.bars, lo = 0, hi = b.length - 1; if (!b.length) return -1; if (t < b[0].t) return 0;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (b[mid].t <= t + 1e-6) lo = mid; else hi = mid - 1; } return lo; }
  function fixes() { var f = CUR.rec.fixes || (CUR.rec.fixes = {}); f.chords = f.chords || {}; f.notes = f.notes || {}; return f; }
  function chordsFixed() {
    var fx = fixes().chords;
    return (CUR.L.chords || []).map(function (c, i) { var f = fx[i]; return { t: num(c.t, 0), d: num(c.d, 0), root: f ? f.root : (c.root == null ? -1 : c.root), q: f ? f.q : (c.q || "N"), conf: f ? 1 : num(c.conf, 1), i: i, fixed: !!f }; });
  }
  function rawNotes(f) {
    var Ls = CUR.L, tr = Ls.tracks || [];
    if (f === "bass") return (Ls.bass || []).map(function (n) { return { t: n.t, d: n.d, m: n.m, conf: num(n.conf, 1) }; });
    if (f === "melody") return (Ls.melody || []).map(function (n) { return { t: n.t, d: n.d, m: n.m, conf: num(n.conf, 1) }; });
    if (f === "all") { var a = []; tr.forEach(function (T) { if (!T.drums) (T.notes || []).forEach(function (n) { a.push({ t: n.t, d: n.d, m: n.m, conf: 1 }); }); }); return a.sort(function (x, y) { return x.t - y.t || x.m - y.m; }); }
    var k = /^t:(\d+)$/.exec(f || ""); if (k && tr[+k[1]]) return (tr[+k[1]].notes || []).map(function (n) { return { t: n.t, d: n.d, m: n.m, conf: 1 }; }).sort(function (x, y) { return x.t - y.t || x.m - y.m; });
    return [];
  }
  function rebuildPart() {
    var f = CUR.follow;
    if (f === "chords") {
      var cs = chordsFixed(), ev = [];
      cs.forEach(function (c) { var last = ev[ev.length - 1];
        if (c.root < 0 || !QM[c.q]) return;
        if (last && last.root === c.root && last.q === c.q && Math.abs(last.end - c.t) < 0.05) { last.end = c.t + c.d; return; }
        ev.push({ t: c.t, end: c.t + c.d, root: c.root, q: c.q, pcs: chordPcs(c), ci: c.i }); });
      CUR.ev = ev; CUR.notes = null; CUR.chords = cs; return;
    }
    var fx = fixes().notes[f] || {}, out = [];
    rawNotes(f).forEach(function (n, i) { var x = fx[i]; if (x && x.del) return; out.push({ t: num(n.t, 0), d: Math.max(0.03, num(n.d, 0.2)), m: x ? x.m : n.m, conf: x ? 1 : n.conf, i: i, fixed: !!x }); });
    CUR.notes = out; CUR.chords = chordsFixed();
    var g = [];
    out.forEach(function (n) { var last = g[g.length - 1];
      if (last && n.t - last.t < 0.04) { if (last.ms.indexOf(n.m) < 0) last.ms.push(n.m); return; }
      g.push({ t: n.t, ms: [n.m] }); });
    g.forEach(function (e) { e.pcs = e.ms.map(pcOf).filter(function (p, i, a) { return a.indexOf(p) === i; }); });
    CUR.ev = g;
  }
  function chordAt(T) {
    var cs = CUR.chords || [], hit = null;
    for (var i = 0; i < cs.length; i++) { if (cs[i].t <= T + 0.03) { if (T < cs[i].t + cs[i].d + 0.03) hit = cs[i]; } else break; }
    return hit && hit.root >= 0 && QM[hit.q] ? hit : null;
  }
  function nextChord(T, cur) {
    var cs = CUR.chords || [];
    for (var i = 0; i < cs.length; i++) { var c = cs[i]; if (c.t <= T + 0.03 || c.root < 0 || !QM[c.q]) continue;
      if (cur && c.root === cur.root && c.q === cur.q) continue; return c; }
    return null;
  }
  function beatsTo(T, t) { var n = 0; CUR.beats.forEach(function (b) { if (b > T + 0.03 && b <= t + 0.03) n++; }); return n; }
  function notesAt(T) { var out = []; (CUR.notes || []).forEach(function (n) { if (n.t <= T + 0.02 && T < n.t + n.d - 0.01) out.push(n.m); }); return out; }
  function nextGroup(T) { var ev = CUR.ev || []; for (var i = 0; i < ev.length; i++) if (ev[i].t > T + 0.02) return ev[i]; return null; }

  /* ── keeping songs on the device ── */
  var DBN = "aog-learn", ST = "songs", MAXKEEP = 12;
  function idb(name, store, key) {
    return new Promise(function (ok, no) {
      if (!window.indexedDB) { no(new Error("no indexedDB")); return; }
      var r; try { r = name === DBN ? indexedDB.open(name, 1) : indexedDB.open(name); } catch (e) { no(e); return; }
      r.onupgradeneeded = function () { if (!r.result.objectStoreNames.contains(store)) r.result.createObjectStore(store, key ? { keyPath: key } : undefined); };
      r.onsuccess = function () { ok(r.result); }; r.onerror = function () { no(r.error); }; r.onblocked = function () { no(new Error("blocked")); };
    });
  }
  function req(db, store, mode, fn) {
    return new Promise(function (ok) {
      var tx; try { tx = db.transaction(store, mode); } catch (e) { db.close(); ok(null); return; }
      var q = fn(tx.objectStore(store)), res = null;
      if (q) q.onsuccess = function () { res = q.result; };
      tx.oncomplete = function () { db.close(); ok(res); }; tx.onerror = tx.onabort = function () { db.close(); ok(null); };
    });
  }
  function keptAll() { return idb(DBN, ST, "id").then(function (db) { return req(db, ST, "readonly", function (s) { return s.getAll(); }); }).catch(function () { return []; }).then(function (a) { return (a || []).sort(function (x, y) { return (y.at || 0) - (x.at || 0); }); }); }
  function keptGet(id) { return idb(DBN, ST, "id").then(function (db) { return req(db, ST, "readonly", function (s) { return s.get(id); }); }).catch(function () { return null; }); }
  function keptPut(rec) {
    return idb(DBN, ST, "id").then(function (db) { return req(db, ST, "readwrite", function (s) { s.put(rec); return null; }); })
      .then(function () { return keptAll(); })
      .then(function (all) { var old = all.slice(MAXKEEP); if (!old.length) return; return idb(DBN, ST, "id").then(function (db) { return req(db, ST, "readwrite", function (s) { old.forEach(function (r) { s.delete(r.id); }); return null; }); }); })
      .catch(function () {});
  }
  var saveT = 0;
  function keepSoon() { if (!CUR) return; clearTimeout(saveT); var rec = CUR.rec; saveT = setTimeout(function () { keptPut(rec); }, 250); }
  /* the Turntables' crate (music-decks.html CRATE: "aog-crate", store "crate", key "lib" = every song added there) */
  function crateAll() {
    return idb("aog-crate", "crate").then(function (db) {
      if (!db.objectStoreNames.contains("crate")) { db.close(); return []; }
      return new Promise(function (ok) {
        var got = {}, tx; try { tx = db.transaction("crate", "readonly"); } catch (e) { db.close(); ok([]); return; }
        ["lib", "prev", "next"].forEach(function (k) { var q = tx.objectStore("crate").get(k); q.onsuccess = function () { got[k] = q.result; }; });
        tx.oncomplete = function () { db.close(); var out = [];
          ["lib", "prev", "next"].forEach(function (k) { (got[k] || []).forEach(function (r) { if (r && r.blob && r.id && !out.some(function (x) { return x.id === r.id; })) out.push(r); }); });
          ok(out); };
        tx.onerror = tx.onabort = function () { db.close(); ok([]); };
      });
    }).catch(function () { return []; });
  }

  /* ── the listening engine, loaded only when a song is chosen ── */
  var engineP = null;
  function engine() {
    if (window.AOGLearn) return Promise.resolve(window.AOGLearn);
    if (engineP) return engineP;
    engineP = new Promise(function (ok, no) {
      var s = D.createElement("script"); s.src = "/aog-learn.js"; s.async = true;
      s.onload = function () { if (window.AOGLearn) ok(window.AOGLearn); else { engineP = null; no(new Error("no engine")); } };
      s.onerror = function () { engineP = null; no(new Error("no engine")); };
      D.head.appendChild(s);
    });
    return engineP;
  }
  function stepWord(key) {
    var A = window.AOGLearn, x = A && A.words, lang = L(), s = "";
    try { if (x && x[key]) s = typeof x[key] === "string" ? x[key] : (x[key][lang] || x[key].en || ""); else if (x && x[lang] && x[lang][key]) s = x[lang][key]; } catch (e) { s = ""; }
    if (!s && W.pg[key]) s = W.pg[key][lang];
    return s || W.pg.listen[lang];
  }

  /* ── choosing a song ── */
  var WORK = { job: 0, busy: false };
  function isMidi(name, type) { return /\.(mid|midi|kar)$/i.test(name || "") || /midi|audio\/mid/i.test(type || ""); }
  function say(text) { var s = $("lgSay"); if (s && s.textContent !== text) s.textContent = text; }
  function chooseFile(file) {
    if (!file) return;
    var id = (file.name || "?") + "·" + (file.size || 0);
    file.arrayBuffer().then(function (ab) { return learnFrom({ id: id, name: file.name || "song", blob: new Blob([ab.slice(0)], { type: file.type || "" }), type: file.type || "", ab: ab }); });
  }
  function learnFrom(o) {
    return keptGet(o.id).then(function (rec) {
      if (rec && rec.lesson) { rec.at = Date.now(); if (!rec.blob && o.blob) rec.blob = o.blob; keptPut(rec); return openRec(rec); }
      var job = ++WORK.job; WORK.busy = true; paintWork(true); say(stepWord("start"));
      var midi = isMidi(o.name, o.type);
      return engine().then(function (A) {
        if (job !== WORK.job) return null;
        if (midi) return (o.ab ? Promise.resolve(o.ab) : o.blob.arrayBuffer()).then(function (ab) { return A.fromMidi(ab); });
        var ctl = window.AbortController ? new AbortController() : null; WORK.ctl = ctl;
        return A.analyze(o.blob, { signal: ctl ? ctl.signal : undefined, onProgress: function (p, key) {
          if (job !== WORK.job) return; var pc = Math.round(Math.max(0, Math.min(1, +p || 0)) * 100);
          say(stepWord(key) + (pc > 0 && pc < 100 ? " " + pc + "%" : "")); } });
      }).then(function (lesson) {
        if (job !== WORK.job || !lesson) return;
        WORK.busy = false; paintWork(false);
        var rec = { id: o.id, name: o.name, src: lesson.src || (midi ? "midi" : "audio"), lesson: lesson, blob: o.blob, fixes: {}, speed: 100, loop: null, follow: null, at: Date.now() };
        return keptPut(rec).then(function () { return openRec(rec, true); });
      }, function (e) {
        if (job !== WORK.job) return;
        WORK.busy = false; paintWork(false); say(/engine/.test(String(e && e.message)) ? w("noEngine") : w("failed"));
      });
    });
  }
  function paintWork(on) { var b = $("lgStopWork"); if (b) b.hidden = !on; ["lgFileLab", "lgOpen", "lgList"].forEach(function (id) { var e = $(id); if (e) { if (e.tagName === "LABEL") e.classList.toggle("off", on); else e.disabled = on; } }); }
  function stopWork() { WORK.job++; WORK.busy = false; try { if (WORK.ctl) WORK.ctl.abort(); } catch (e) {} paintWork(false); say(w("stopped")); }
  var LIST = { kept: [], crate: [] };
  function refreshList() {
    return Promise.all([keptAll(), crateAll()]).then(function (r) {
      LIST.kept = r[0]; LIST.crate = r[1].filter(function (c) { return !LIST.kept.some(function (k) { return k.id === c.id; }); });
      paintList();
    });
  }
  function paintList() {
    var s = $("lgList"); if (!s) return;
    var html = '<option value="">' + esc(LIST.kept.length || LIST.crate.length ? w("listPick") : w("listNone")) + "</option>";
    if (LIST.kept.length) html += '<optgroup label="' + esc(w("listHere")) + '">' + LIST.kept.map(function (r) { return '<option value="k|' + esc(r.id) + '">' + esc(r.name) + "</option>"; }).join("") + "</optgroup>";
    if (LIST.crate.length) html += '<optgroup label="' + esc(w("listCrate")) + '">' + LIST.crate.map(function (r) { return '<option value="c|' + esc(r.id) + '">' + esc(r.name) + "</option>"; }).join("") + "</optgroup>";
    s.innerHTML = html; $("lgOpen").disabled = !s.value;
  }
  function openPicked() {
    var v = $("lgList").value; if (!v) return;
    var kind = v.slice(0, 1), id = v.slice(2);
    if (kind === "k") { var r = LIST.kept.filter(function (x) { return x.id === id; })[0]; if (r) { r.at = Date.now(); keptPut(r); openRec(r); } return; }
    var c = LIST.crate.filter(function (x) { return x.id === id; })[0];
    if (c) learnFrom({ id: c.id, name: c.name, blob: c.blob, type: c.blob.type || "" });
  }

  /* ── the player: the song on its own AudioContext, straight to the speakers (never into a take) ── */
  var PL = { ac: null, src: null, out: null, base: null, cache: {}, playing: false, counting: false, pos: 0, t0: 0, start: 0, speed: 1, tick: 0, clicks: [], making: 0, lastT: 0, ended: false };
  var TEST = { clock: null };
  function acx() {
    if (!PL.ac) { var C = window.AudioContext || window.webkitAudioContext; PL.ac = new C(); PL.out = PL.ac.createGain(); PL.out.gain.value = 0.9; PL.out.connect(PL.ac.destination); }
    try { if (PL.ac.state !== "running") PL.ac.resume(); } catch (e) {}
    return PL.ac;
  }
  function decode(ab) { var c = acx(); return new Promise(function (ok, no) { var r = c.decodeAudioData(ab.slice(0), ok, no); if (r && r.then) r.then(ok, no); }); }
  function newBuf(nch, len, sr) { try { return new AudioBuffer({ numberOfChannels: nch, length: len, sampleRate: sr }); } catch (e) { return acx().createBuffer(nch, len, sr); } }
  /* WSOLA, as the Mixing Desk makes a slower copy that keeps the pitch (music-studio.html AOG-STUDIO-EDIT-V1, wsola) */
  function wsola(buf, sp, cancelled) {
    var sr = buf.sampleRate, nch = buf.numberOfChannels, n = buf.length;
    var Hh = Math.max(64, Math.round(0.02 * sr)), N = 2 * Hh, tol = Math.round(0.012 * sr), Ha = Hh * sp, outN = Math.max(1, Math.round(n / sp));
    var X = [], Y = [], ch, j; for (ch = 0; ch < nch; ch++) { X.push(buf.getChannelData(ch)); Y.push(new Float32Array(outN + N)); }
    var Wn = new Float32Array(N); for (j = 0; j < N; j++) Wn[j] = 0.5 - 0.5 * Math.cos(2 * Math.PI * j / N);
    var Q = 4, m = Math.floor(n / Q), Dq = new Float32Array(m + 1);
    for (var i = 0; i < m; i++) { var v = 0, o = i * Q; for (ch = 0; ch < nch; ch++) { var x = X[ch]; v += x[o] + x[o + 1] + x[o + 2] + x[o + 3]; } Dq[i] = v; }
    var Hq = Math.floor(Hh / Q), tq = Math.floor(tol / Q), prev = 0, k = 0, op = 0;
    return new Promise(function (ok) {
      function step() {
        var until = Date.now() + 12;
        for (; op < outN; op += Hh, k++) {
          var nom = Math.round(k * Ha), pos;
          if (k === 0) pos = 0;
          else {
            var tgt = prev + Hh;
            if (tgt + N >= n || nom + tol + N >= n) pos = Math.max(0, Math.min(nom, n - N));
            else {
              var tg = Math.floor(tgt / Q), lo = Math.max(0, Math.floor(nom / Q) - tq), hi = Math.min(m - Hq - 1, Math.floor(nom / Q) + tq), best = -Infinity, bq = Math.floor(nom / Q), q;
              for (q = lo; q <= hi; q++) { var s = 0; for (j = 0; j < Hq; j++) s += Dq[tg + j] * Dq[q + j]; if (s > best) { best = s; bq = q; } }
              var fb = -Infinity, fp = Math.max(0, Math.min(n - N - 1, bq * Q));
              for (q = Math.max(0, bq * Q - Q); q <= Math.min(n - N - 1, bq * Q + Q); q++) {
                var s2 = 0; for (j = 0; j < Hh; j += 2) { var a = 0, b = 0; for (ch = 0; ch < nch; ch++) { a += X[ch][tgt + j]; b += X[ch][q + j]; } s2 += a * b; }
                if (s2 > fb) { fb = s2; fp = q; } }
              pos = fp;
            }
          }
          for (ch = 0; ch < nch; ch++) { var xx = X[ch], y = Y[ch], Ln = Math.min(N, n - pos);
            if (k === 0) { for (j = 0; j < Ln; j++) y[op + j] += xx[pos + j] * (j < Hh ? 1 : Wn[j]); }
            else for (j = 0; j < Ln; j++) y[op + j] += xx[pos + j] * Wn[j]; }
          prev = pos;
          if ((k & 15) === 15 && Date.now() > until) { op += Hh; k++; if (cancelled()) { ok(null); return; } setTimeout(step, 0); return; }
        }
        var out = newBuf(nch, outN, sr); for (ch = 0; ch < nch; ch++) out.getChannelData(ch).set(Y[ch].subarray(0, outN));
        ok(out);
      }
      step();
    });
  }
  /* a MIDI song is played from its notes: soft tones for the parts, short taps for the drums, at the speed asked (so the
     pitch never moves) */
  function renderMidi(sp) {
    var Ls = CUR.L, sr = 44100, sec = CUR.sec / sp + 1.5, OC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    var oc = new OC(2, Math.ceil(sec * sr), sr), out = oc.createGain(), n = 0;
    (Ls.tracks || []).forEach(function (T) { n += (T.notes || []).length; });
    out.gain.value = 0.22; out.connect(oc.destination);
    var noise = oc.createBuffer(1, Math.round(sr * 0.25), sr), nd = noise.getChannelData(0), x = 0x2f6b1a3d;
    for (var i = 0; i < nd.length; i++) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; nd[i] = ((x >>> 0) / 4294967296) * 2 - 1; }
    (Ls.tracks || []).forEach(function (T) {
      (T.notes || []).forEach(function (nn) {
        var t = num(nn.t, 0) / sp, d = Math.max(0.05, num(nn.d, 0.2) / sp), v = Math.max(0.1, Math.min(1, num(nn.v, 0.8))), g = oc.createGain();
        g.connect(out);
        if (T.drums) {
          var b = oc.createBufferSource(); b.buffer = noise; var f = oc.createBiquadFilter(), low = nn.m <= 36;
          f.type = low ? "lowpass" : nn.m <= 40 ? "bandpass" : "highpass"; f.frequency.value = low ? 180 : nn.m <= 40 ? 1800 : 7000;
          b.connect(f); f.connect(g); var len = low ? 0.18 : nn.m <= 40 ? 0.14 : 0.06;
          g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * (low ? 2.2 : 0.9), t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
          b.start(t); b.stop(t + len + 0.02); return;
        }
        var o = oc.createOscillator(); o.type = "triangle"; o.frequency.value = 440 * Math.pow(2, (nn.m - 69) / 12); o.connect(g);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.008); g.gain.setTargetAtTime(v * 0.55, t + 0.01, 0.25);
        g.gain.setTargetAtTime(0.0001, t + d, 0.05); o.start(t); o.stop(t + d + 0.4);
      });
    });
    return oc.startRendering ? new Promise(function (ok, no) { oc.oncomplete = function (e) { ok(e.renderedBuffer); }; var r = oc.startRendering(); if (r && r.then) r.then(ok, no); }) : Promise.reject(new Error("no render"));
  }
  function baseBuf() {
    if (PL.base) return Promise.resolve(PL.base);
    if (CUR.L.src === "midi" || CUR.rec.src === "midi") return renderMidi(1).then(function (b) { PL.base = b; return b; });
    if (!CUR.rec.blob) return Promise.reject(new Error("gone"));
    return CUR.rec.blob.arrayBuffer().then(decode).then(function (b) { PL.base = b; return b; });
  }
  function bufFor(sp) {
    var key = String(Math.round(sp * 100));
    if (PL.cache[key]) return Promise.resolve(PL.cache[key]);
    var id = CUR.rec.id;
    return baseBuf().then(function (b) {
      if (Math.abs(sp - 1) < 1e-3) return b;
      PL.making++; paintStatus();
      var p = (CUR.L.src === "midi" || CUR.rec.src === "midi") ? renderMidi(sp) : wsola(b, sp, function () { return !CUR || CUR.rec.id !== id; });
      return p.then(function (o) { PL.making--; paintStatus(); return o; }, function (e) { PL.making--; paintStatus(); throw e; });
    }).then(function (o) {
      if (!o || !CUR || CUR.rec.id !== id) return null;
      Object.keys(PL.cache).forEach(function (k) { if (k !== "100") delete PL.cache[k]; });   /* a phone keeps one slower copy, the one in use */
      PL.cache[key] = o; return o;
    });
  }
  function songNow() {
    if (TEST.clock) return TEST.clock();
    if (!PL.playing || !PL.ac) return PL.pos;
    var el = PL.ac.currentTime - PL.t0; if (el < 0) return PL.start;
    var T = PL.start + el * PL.speed, lp = loopTimes();
    if (lp && T >= lp[1]) T = lp[0] + ((T - lp[0]) % (lp[1] - lp[0]));
    return Math.min(T, CUR.sec);
  }
  function lat() { if (TEST.clock || !PL.ac) return 0; var l = num(PL.ac.outputLatency, 0) || num(PL.ac.baseLatency, 0); return l > 0 && l < 0.5 ? l : 0; }
  function loopTimes() { var lp = CUR && CUR.rec.loop; if (!lp || !CUR.bars[lp[0]] || !CUR.bars[lp[1]]) return null; return [CUR.bars[lp[0]].t, CUR.bars[lp[1]].e]; }
  function click(t, hi) { var c = PL.ac, o = c.createOscillator(), g = c.createGain(); o.frequency.value = hi ? 1500 : 1000; o.connect(g); g.connect(PL.out);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.5, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); o.start(t); o.stop(t + 0.06); PL.clicks.push(o); }
  function play(opts) {
    opts = opts || {};
    if (!CUR || PL.playing) return Promise.resolve();
    acx();
    var sp = (CUR.rec.speed || 100) / 100, id = CUR.rec.id, want = ++PL.want;
    if (!PL.cache[String(Math.round(sp * 100))]) say2(w(sp < 1 ? "making" : "readying"));
    return bufFor(sp).then(function (b) {
      if (!b || !CUR || CUR.rec.id !== id || want !== PL.want) return;
      var c = acx(), lp = loopTimes(), from = PL.pos;
      if (from >= CUR.sec - 0.05) from = 0;
      if (lp && (from < lp[0] - 0.01 || from >= lp[1])) from = lp[0];
      var s = c.createBufferSource(); s.buffer = b; s.connect(PL.out);
      if (lp) { s.loop = true; s.loopStart = lp[0] / sp; s.loopEnd = Math.min(b.duration, lp[1] / sp); }
      var now = c.currentTime + 0.06, nb = (CUR.L.meter && CUR.L.meter.num) || 4, per = 60 / (num(CUR.L.bpm, 0) > 0 ? CUR.L.bpm : 120) / sp;
      var count = !opts.noCount && CUR.rec.count !== false && !PL.resumeWait;
      if (count) { for (var k = 0; k < nb; k++) click(now + k * per, k === 0); now += nb * per; }
      PL.counting = count; PL.countAt = now; PL.countPer = per; PL.countN = nb;
      s.start(now, Math.max(0, from / sp));
      s.onended = function () { if (PL.src !== s) return; PL.src = null; if (PL.playing) { PL.playing = false; PL.pos = CUR ? CUR.sec : 0; PL.ended = true; endPass(); stopTick(); paintLive(); } };
      PL.src = s; PL.t0 = now; PL.start = from; PL.speed = sp; PL.playing = true; PL.ended = false; PL.lastT = from;
      PL.resumeWait = false;
      if (!PL.inPass) startPass(from);
      listenLive(true);
      startTick(); paintLive();
    }, function (e) { say2(/gone/.test(String(e && e.message)) ? w("gone") : w("failed")); });
  }
  PL.want = 0;
  function pause(keepPass) {
    PL.want++;
    if (!PL.playing) { PL.counting = false; return; }
    PL.pos = songNow(); PL.playing = false; PL.counting = false;
    var s = PL.src; PL.src = null; if (s) { try { s.onended = null; s.stop(); } catch (e) {} }
    PL.clicks.forEach(function (o) { try { o.stop(); } catch (e) {} }); PL.clicks = [];
    if (!keepPass) endPass();
    listenLive(false);
    stopTick(); paintLive();
  }
  function paintLive() { if (!CUR || !$("lgNow")) return; paintStatus(); paintNow(songNow(), true); }
  function seek(T) { var was = PL.playing; if (was) pause(); PL.pos = Math.max(0, Math.min(CUR.sec, T)); PL.waiting = null; PL.waitDone = PL.pos - 0.001; paintLive(); if (was) play({ noCount: false }); }
  function startTick() { stopTick(); PL.tick = setInterval(tick, 30); }
  function stopTick() { clearInterval(PL.tick); PL.tick = 0; }
  function away() { try { var f = window.frameElement; return D.hidden || (!!f && (f.hidden || f.style.display === "none" || !f.getClientRects().length)); } catch (e) { return D.hidden; } }
  function tick() {
    if (!CUR) return;
    if (away()) { pause(); return; }
    var T = songNow();
    if (PL.counting && PL.ac && PL.ac.currentTime >= PL.countAt) PL.counting = false;
    var lp = loopTimes();
    if (lp && PL.playing && !PL.counting && T < PL.lastT - 0.2) { endPass(PL.lastT); startPass(lp[0]); PL.waitDone = lp[0] - 0.001; }   /* each time round the loop is a pass */
    PL.lastT = T;
    if (CUR.rec.wait && PL.playing && !PL.counting) {
      var g = nextWait(PL.waitDone);
      if (g && T >= g.t - 0.005) { pause(true); PL.pos = g.t; PL.waiting = g; PL.got = []; paintLive(); return; }
    }
    paintNow(T);
  }
  function nextWait(after) { var ev = CUR.ev || []; for (var i = 0; i < ev.length; i++) if (ev[i].t > after + 0.001) return ev[i]; return null; }

  /* ── what the learner plays: the room's notes (AOG-NOTES-V1), a MIDI keyboard through the room, a real instrument ── */
  var PASS = null, RESULT = null;
  function startPass(from) { PASS = { from: from, played: [] }; PL.inPass = true; clearMarks(); }
  function heard(m, ahead) {
    if (!CUR) return;
    if (PL.waiting) {
      var g = PL.waiting; PL.got.push(pcOf(m));
      var need = needOf(g), have = g.pcs.filter(function (p) { return PL.got.indexOf(p) >= 0; }).length;
      if (have >= need) { PL.waiting = null; PL.waitDone = g.t; PL.resumeWait = true; play({ noCount: true }); }
      else paintNow(PL.pos);
      return;
    }
    if (!PASS || !(PL.playing || TEST.clock)) return;
    var T = songNow() - lat() + (ahead > 0 && ahead < 1 ? ahead * PL.speed : 0);
    PASS.played.push({ t: T, m: m });
  }
  function needOf(e) { if (CUR.follow !== "chords") return Math.min(3, e.pcs.length); return (H && H.room === "bass") || LIVE.on ? 1 : Math.min(2, e.pcs.length); }
  function wrapNote() {
    var R = window.AOGRecorder; if (!R || !R.note || R.note.__lg) return;
    var orig = R.note, wr = function (c, vc, e) {
      try { if (e && e.m >= 0 && !(H && H.busy && H.busy())) heard(e.m, c && typeof e.when === "number" ? e.when - c.currentTime : 0); } catch (x) {}
      return orig.apply(this, arguments); };
    wr.__lg = 1; R.note = wr;
  }
  var LIVE = { off: null, on: false };
  function listenLive(on) {
    if (LIVE.off) { try { LIVE.off(); } catch (e) {} LIVE.off = null; LIVE.on = false; }
    if (!on || !window.AOGLive || !AOGLive.listen) return;
    try { LIVE.off = AOGLive.listen(function (m) { heard(m, 0); }); LIVE.on = !!LIVE.off; } catch (e) { LIVE.off = null; }
  }
  /* how a pass went: each chord change (or note) due, against what was played near it (±120 ms on time) */
  var WIN = 0.12, NEAR = 0.45;
  function judge(due, played, follow) {
    return due.map(function (e) {
      var need = needOf(e), near = played.filter(function (p) { return Math.abs(p.t - e.t) <= NEAR; });
      var inW = near.filter(function (p) { return Math.abs(p.t - e.t) <= WIN; });
      var okPcs = function (list) { var s = []; list.forEach(function (p) { var pc = pcOf(p.m); if (e.pcs.indexOf(pc) >= 0 && s.indexOf(pc) < 0) s.push(pc); }); return s.length; };
      var bad = inW.filter(function (p) { return e.pcs.indexOf(pcOf(p.m)) < 0; }).length, good = inW.length - bad;
      var how;
      if (okPcs(inW) >= need && bad <= good) how = "on";
      else if (okPcs(near.filter(function (p) { return p.t - e.t > WIN; })) >= need) how = "late";
      else if (okPcs(near.filter(function (p) { return e.t - p.t > WIN; })) >= need) how = "early";
      else if (near.length) how = "other";
      else how = "missed";
      return { t: e.t, how: how, e: e, bar: barOf(e.t) };
    });
  }
  function endPass(to) {
    PL.inPass = false;
    var P = PASS; PASS = null;
    if (!P || !CUR || CUR.rec.wait) return null;
    var end = to != null ? to : songNow();
    var due = (CUR.ev || []).filter(function (e) { return e.t >= P.from - 0.05 && e.t <= end + 0.01; });
    if (due.length < 2 || !P.played.length) return null;   /* just listening: nothing to say */
    var res = judge(due, P.played, CUR.follow), k = res.filter(function (r) { return r.how === "on"; }).length, chords = CUR.follow === "chords";
    var msg = k === res.length ? w(chords ? "resAllC" : "resAllN", { n: res.length }) : w(chords ? "resC" : "resN", { k: k, n: res.length });
    var sp = CUR.rec.speed || 100, first = res.filter(function (r) { return r.how !== "on"; })[0];
    if (first) {
      var nm = chords ? chordName(first.e) : first.e.ms.map(noteName).join(" + "), key = (chords ? "c" : "n") + { late: "Late", early: "Early", other: "Other", missed: "Missed" }[first.how];
      msg += " " + w(key, { c: nm, b: first.bar + 1 }) + (sp > 75 ? w("tryAt", { n: 75 }) : sp > 50 ? w("tryAt", { n: 50 }) : w("tryBar", { b: first.bar + 1 }));
    } else msg += sp < 100 ? w("faster") : w("same");
    var marks = {};
    res.forEach(function (r) { if (r.bar < 0) return; marks[r.bar] = marks[r.bar] === "try" || r.how !== "on" ? "try" : "ok"; });
    RESULT = { k: k, n: res.length, res: res.map(function (r) { return { t: r.t, how: r.how, bar: r.bar }; }), msg: msg, marks: marks };
    var s = $("lgSaid"); if (s) s.textContent = msg;
    paintMarks();
    return RESULT;
  }
  function clearMarks() { RESULT = RESULT ? Object.assign({}, RESULT, { marks: {} }) : null; paintMarks(); var s = $("lgSaid"); if (s && PL.playing) s.textContent = ""; }

  /* ── drawing it ── */
  var CSS = [
    ".lg [hidden]{display:none!important}",
    ".lg{margin:0;border:1px solid #3a3e44;border-radius:14px;background:#141619;color:#ece6da}",
    ".lg>summary{min-height:52px;display:flex;align-items:center;gap:.55rem;padding:0 16px;cursor:pointer;list-style:none;font:800 1.02rem/1.2 var(--sans,system-ui,sans-serif);color:#f3efe6}",
    ".lg>summary::-webkit-details-marker{display:none}.lg>summary::before{content:'\\25B8';color:#f0c26e}.lg[open]>summary::before{content:'\\25BE'}",
    ".lg>summary:focus-visible{outline:3px solid #f0c26e;outline-offset:2px;border-radius:12px}",
    ".lg-in{padding:0 14px 16px;display:grid;gap:.75rem}",
    ".lg .line{margin:0}.lg .row{align-items:flex-end}",
    ".lg-file{position:relative;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}",
    ".lg-file input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;font-size:16px}",
    ".lg-file.off{opacity:.6;pointer-events:none}",
    ".lg-file:focus-within{outline:3px solid #f0c26e;outline-offset:2px}",
    ".lg-song{display:grid;gap:.75rem}",
    ".lg-name{margin:0;font:800 1.1rem/1.25 var(--sans,system-ui,sans-serif);color:#f3efe6;word-break:break-word}",
    ".lg-now{display:flex;flex-wrap:wrap;align-items:baseline;gap:.3rem 1rem;padding:.7rem .9rem;border:1px solid #3a3e44;border-radius:12px;background:#0f1012}",
    ".lg-now .plab{margin:0;flex:0 0 100%}",
    ".lg-big{font:800 2.6rem/1.05 var(--sans,system-ui,sans-serif);color:#fff3d1;min-width:3ch}",
    ".lg-next{font:700 1.15rem/1.3 var(--sans,system-ui,sans-serif);color:#e3dac9}",
    ".lg-turn{flex:0 0 100%;font:700 1.05rem/1.3 var(--sans,system-ui,sans-serif);color:#9fe0d6}",
    ".lg-ctl{display:flex;flex-wrap:wrap;gap:.55rem}.lg-ctl .pbtn{flex:0 1 auto}",
    ".lg .pbtn.play{min-width:9rem}",
    ".lg-chk{display:inline-flex;align-items:center;gap:.5rem;min-height:44px;color:#e3dac9;font-weight:700}",
    ".lg-chk input{width:22px;height:22px;accent-color:#f0c26e}",
    ".lg-bars{display:grid;grid-template-columns:repeat(auto-fill,minmax(4.6rem,1fr));gap:6px;max-height:14.5rem;overflow-y:auto;overscroll-behavior:contain;padding:2px}",
    ".lg-bar{min-height:52px;border-radius:10px;border:1px solid #3a3e44;background:#1c1f23;color:#f3efe6;font:800 .98rem/1.15 var(--sans,system-ui,sans-serif);padding:4px 6px;text-align:left;display:flex;flex-direction:column;justify-content:center;gap:2px;cursor:pointer}",
    ".lg-bar small{font:700 .72rem/1 var(--sans,system-ui,sans-serif);color:#d8cfbf}",
    ".lg-bar.in{background:#173230;border-color:#4fa59a;color:#eafaf6}.lg-bar.in small{color:#cdeee8}",
    ".lg-bar[aria-current=true]{border:2px solid #f0c26e;background:#2b2416;color:#fff3d1}",
    ".lg-bar .mk{font-size:.8rem;line-height:1}.lg-bar .mk.ok{color:#9fe0b0}.lg-bar .mk.try{color:#f0c26e}",
    ".lg-bar:focus-visible{outline:3px solid #f0c26e;outline-offset:1px}",
    ".lg-roll{position:relative;height:170px;border:1px solid #3a3e44;border-radius:12px;background:#0f1012;overflow:hidden}",
    ".lg-roll .lg-bl{position:absolute;top:0;bottom:0;border-left:1px dashed #4a4f57}",
    ".lg-roll .lg-bn{position:absolute;top:3px;font:700 .72rem/1 var(--sans,system-ui,sans-serif);color:#d8cfbf;padding-left:4px}",
    ".lg-n{position:absolute;min-width:10px;border-radius:5px;border:1px solid #0c0d10;background:#e9dfc6;color:#1f1a10;font:800 .7rem/1 var(--sans,system-ui,sans-serif);padding:0 3px;overflow:hidden;white-space:nowrap;text-align:left;cursor:pointer}",
    ".lg-n.low{border:2px dashed #6b5a35}.lg-n.fx{border:2px solid #4fa59a}",
    ".lg-n.now{background:#ef9a4a;color:#1f1206}.lg-n.past{background:#9c9480;color:#111}",
    ".lg-n.sel{outline:3px solid #f0c26e;outline-offset:1px}",
    ".lg-ph{position:absolute;top:0;bottom:0;width:2px;background:#f0c26e;pointer-events:none}",
    ".lg-fix{display:grid;gap:.6rem;padding:.7rem .8rem;border:1px solid #3a3e44;border-radius:12px;background:#17191c}",
    ".lg-said{font-weight:700;color:#f1ebdf}.lg-said:empty{display:none}",
    "@media print{.lg{display:none}}"
  ].join("\n");
  var BOX = null;
  function mount() {
    var host = $("learnBlk"); if (!host || BOX) return;
    if (!$("lg-css")) { var st = D.createElement("style"); st.id = "lg-css"; st.textContent = CSS; D.head.appendChild(st); }
    host.innerHTML = '<details class="lg no-print" id="lgBox"><summary id="lgSum"></summary><div class="lg-in" id="lgIn"></div></details>';
    BOX = $("lgBox");
    BOX.addEventListener("toggle", function () {
      if (BOX.open) { refreshList(); if (!CUR) reopenLast(); show(); }
      else { pause(); if (H && H.show) H.show(null); }
    });
    paintAll();
    try { new MutationObserver(function () { if (paintAll.lang !== L()) paintAll(); }).observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
  }
  var LASTKEY = function () { return "aog.learn.last." + ((H && H.room) || "room") + ".v1"; };
  function reopenLast() { var id = null; try { id = localStorage.getItem(LASTKEY()); } catch (e) {} if (!id) return; keptGet(id).then(function (r) { if (r && r.lesson && !CUR) openRec(r); }); }
  function defaultFollow(Ls) {
    var tr = Ls.tracks || [], room = H && H.room;
    if (tr.length) {
      var pick = -1;
      tr.forEach(function (T, i) { if (pick >= 0 || T.drums || !(T.notes || []).length) return; var p = T.program | 0, n = T.name || "";
        if (room === "bass" && ((p >= 32 && p <= 39) || /bass|bajo/i.test(n))) pick = i;
        if (room === "guitar" && ((p >= 24 && p <= 31) || /guitar|guitarra/i.test(n))) pick = i;
        if (room === "piano" && ((p >= 0 && p <= 7) || /piano|keys/i.test(n))) pick = i; });
      if (pick < 0 && room === "bass") { var lowest = 1e9; tr.forEach(function (T, i) { if (T.drums || !(T.notes || []).length) return; var a = T.notes.reduce(function (s, n) { return s + n.m; }, 0) / T.notes.length; if (a < lowest) { lowest = a; pick = i; } }); }
      return pick >= 0 ? "t:" + pick : "all";
    }
    return (Ls.chords || []).length ? "chords" : (room === "bass" && (Ls.bass || []).length ? "bass" : ((Ls.melody || []).length ? "melody" : "chords"));
  }
  function follows() {
    var Ls = CUR.L, room = H && H.room, out = [];
    if ((Ls.chords || []).some(function (c) { return c.root >= 0 && c.q !== "N"; })) out.push(["chords", w("fChords")]);
    if (room === "bass" && (Ls.bass || []).length) out.push(["bass", w("fBass")]);
    if (room !== "bass" && (Ls.melody || []).length) out.push(["melody", w("fTune")]);
    var tr = (Ls.tracks || []).map(function (T, i) { return [T, i]; }).filter(function (x) { return !x[0].drums && (x[0].notes || []).length; });
    if (tr.length > 1) out.push(["all", w("fAll")]);
    tr.forEach(function (x) { out.push(["t:" + x[1], w("fTrack", { n: x[0].name || String(x[1] + 1) })]); });
    if (!out.length) out.push(["chords", w("fChords")]);
    return out;
  }
  function openRec(rec, fresh) {
    pause(); PL.base = null; PL.cache = {}; PL.pos = 0; PL.waiting = null; PL.waitDone = -1; RESULT = null; FIXN = null;
    CUR = { rec: rec, L: rec.lesson };
    var fl = follows().map(function (f) { return f[0]; });
    CUR.follow = rec.follow && fl.indexOf(rec.follow) >= 0 ? rec.follow : (fl.indexOf(defaultFollow(rec.lesson)) >= 0 ? defaultFollow(rec.lesson) : fl[0]);
    if (SPEEDS.indexOf(rec.speed) < 0) rec.speed = 100;
    build();
    try { localStorage.setItem(LASTKEY(), rec.id); } catch (e) {}
    paintAll();
    say(fresh ? w("kept") : "");
    if (BOX && !BOX.open) BOX.open = true;
    show();
    return rec;
  }
  function paintAll() {
    if (!BOX) return;
    paintAll.lang = L();
    $("lgSum").textContent = w("sum");
    var inn = $("lgIn"), keepSay = $("lgSay") ? $("lgSay").textContent : "";
    var pick = '<div class="lg-pick" id="lgPick"' + (CUR ? " hidden" : "") + ">" +
      '<p class="line">' + esc(w("intro")) + "</p>" +
      '<div class="lg-ctl"><label class="pbtn play lg-file" id="lgFileLab"><span>' + esc(w("file")) + '</span><input type="file" id="lgFile" accept="' + ACCEPT + '" aria-label="' + esc(w("file")) + '"></label>' +
      '<button type="button" class="pbtn clear" id="lgStopWork"' + (WORK.busy ? "" : " hidden") + ">" + esc(w("stopWork")) + "</button></div>" +
      '<p class="line">' + esc(w("kinds")) + (IOS ? " " + esc(w("pickFile")) : "") + "</p>" +
      '<div class="row"><label class="field"><span class="plab">' + esc(w("list")) + '</span><select id="lgList"></select></label>' +
      '<button type="button" class="pbtn" id="lgOpen" disabled>' + esc(w("open")) + "</button></div></div>" +
      '<p class="line" id="lgSay" aria-live="polite"></p>';
    var song = "";
    if (CUR) {
      var Ls = CUR.L, sp = CUR.rec.speed || 100, notesView = CUR.follow !== "chords", lowConf = notesView && (CUR.notes || []).length && (CUR.notes.reduce(function (s, n) { return s + n.conf; }, 0) / CUR.notes.length) < 0.6;
      song = '<div class="lg-song" id="lgSong">' +
        '<h3 class="lg-name" id="lgName">' + esc(CUR.rec.name) + "</h3>" +
        '<p class="line" id="lgMeta">' + esc(w("songLine", { key: keyName(), bpm: Math.round(num(Ls.bpm, 120)), bars: CUR.bars.length })) + "</p>" +
        '<div class="row"><label class="field"><span class="plab">' + esc(w("follow")) + '</span><select id="lgFollow">' +
        follows().map(function (f) { return '<option value="' + esc(f[0]) + '"' + (f[0] === CUR.follow ? " selected" : "") + ">" + esc(f[1]) + "</option>"; }).join("") + "</select></label>" +
        '<label class="field small"><span class="plab">' + esc(w("speed")) + '</span><select id="lgSpeed">' +
        SPEEDS.map(function (s) { return '<option value="' + s + '"' + (s === sp ? " selected" : "") + ">" + s + "%</option>"; }).join("") + "</select></label></div>" +
        '<div class="lg-now" id="lgNowBox" aria-live="off"><span class="plab">' + esc(w("now")) + '</span><b class="lg-big" id="lgNow"></b><span class="lg-next" id="lgNext"></span><span class="lg-turn" id="lgTurn" aria-live="polite"></span></div>' +
        '<div class="lg-ctl"><button type="button" class="pbtn play" id="lgPlay"></button>' +
        '<button type="button" class="pbtn" id="lgStart">' + esc(w("toStart")) + "</button>" +
        '<button type="button" class="pbtn" id="lgLoop" aria-pressed="' + (CUR.rec.loop || LOOPPICK.on ? "true" : "false") + '">' + esc(CUR.rec.loop ? w("loopOff") : w("loop")) + "</button>" +
        '<button type="button" class="pbtn" id="lgWait" aria-pressed="' + (CUR.rec.wait ? "true" : "false") + '">' + esc(w("wait")) + "</button></div>" +
        '<label class="lg-chk"><input type="checkbox" id="lgCount"' + (CUR.rec.count !== false ? " checked" : "") + ">" + esc(w("count")) + "</label>" +
        '<p class="line" id="lgStatus" aria-live="polite"></p>' +
        (lowConf ? '<p class="line note" id="lgGuide">' + esc(w("guide")) + "</p>" : "") +
        (notesView ? '<div class="lg-roll" id="lgRoll" role="group" aria-label="' + esc(w("noteTap")) + '"></div><p class="line" id="lgRollLine">' + esc((CUR.notes || []).length ? w("noteTap") : w("noNotes")) + "</p>" : "") +
        '<span class="plab" id="lgBarsLab">' + esc(w("barsLab")) + "</span>" +
        '<div class="lg-bars" id="lgBars" role="group" aria-labelledby="lgBarsLab">' + CUR.bars.map(function (b, i) { return '<button type="button" class="lg-bar" data-b="' + i + '"></button>'; }).join("") + "</div>" +
        '<p class="line lg-said" id="lgSaid" aria-live="polite">' + esc(RESULT ? RESULT.msg : "") + "</p>" +
        '<div class="lg-ctl">' + (notesView ? "" : '<button type="button" class="pbtn" id="lgFix">' + esc(w("fix")) + "</button>") +
        '<button type="button" class="pbtn" id="lgKey">' + esc(w("useKey", { k: keyName() })) + "</button>" +
        '<button type="button" class="pbtn" id="lgOther">' + esc(w("other")) + "</button></div>" +
        '<div class="lg-fix" id="lgFixBox" hidden></div>' +
        "</div>";
    }
    inn.innerHTML = pick + song;
    $("lgSay").textContent = keepSay;
    bindAll();
    paintList();
    if (CUR) { paintBars(); paintStatus(); paintRoll(true); paintNow(songNow(), true); if (FIXN != null) openNoteFix(FIXN); }
  }
  function bindAll() {
    var f = $("lgFile"); if (f) f.onchange = function () { var x = f.files && f.files[0]; if (x) chooseFile(x); f.value = ""; };
    var s = $("lgList"); if (s) s.onchange = function () { $("lgOpen").disabled = !s.value; };
    var b = $("lgOpen"); if (b) b.onclick = openPicked;
    if ((b = $("lgStopWork"))) b.onclick = stopWork;
    if (!CUR) return;
    $("lgFollow").onchange = function () { pause(); CUR.follow = this.value; CUR.rec.follow = CUR.follow; PL.waiting = null; PL.waitDone = PL.pos - 0.001; RESULT = null; FIXN = null; rebuildPart(); keepSoon(); paintAll(); show(); };
    $("lgSpeed").onchange = function () { var was = PL.playing; pause(); CUR.rec.speed = +this.value; keepSoon(); paintStatus(); if (was) play(); else bufFor(CUR.rec.speed / 100).then(paintStatus, paintStatus); };
    $("lgPlay").onclick = function () { if (PL.playing || PL.counting) pause(); else { if (PL.waiting) { PL.waitDone = PL.waiting.t; PL.waiting = null; } play(); } paintPlay(); };
    $("lgStart").onclick = function () { var lp = loopTimes(); seek(lp ? lp[0] : 0); };
    $("lgLoop").onclick = function () {
      if (CUR.rec.loop) { CUR.rec.loop = null; LOOPPICK.on = false; keepSoon(); var was = PL.playing; if (was) { pause(); play({ noCount: true }); } paintBars(); paintStatus(); this.textContent = w("loop"); this.setAttribute("aria-pressed", "false"); return; }
      LOOPPICK.on = !LOOPPICK.on; LOOPPICK.a = null; this.setAttribute("aria-pressed", LOOPPICK.on ? "true" : "false"); paintStatus(); };
    $("lgWait").onclick = function () { CUR.rec.wait = !CUR.rec.wait; keepSoon(); this.setAttribute("aria-pressed", CUR.rec.wait ? "true" : "false");
      if (!CUR.rec.wait && PL.waiting) { PL.waitDone = PL.waiting.t; PL.waiting = null; play({ noCount: true }); }
      PL.waitDone = Math.min(PL.waitDone == null ? -1 : PL.waitDone, songNow() - 0.001); paintStatus(); };
    $("lgCount").onchange = function () { CUR.rec.count = this.checked; keepSoon(); };
    $("lgBars").onclick = function (e) { var t = e.target.closest && e.target.closest(".lg-bar"); if (t) barTap(+t.getAttribute("data-b")); };
    if ((b = $("lgFix"))) b.onclick = openChordFix;
    $("lgKey").onclick = function () { var k = CUR.L.key || {}; if (window.AOGSong) AOGSong.set({ bpm: Math.round(num(CUR.L.bpm, 0)) || undefined, key: k.key | 0, minor: !!k.minor }); $("lgStatus").textContent = w("keyDone", { k: keyName() }); };
    $("lgOther").onclick = function () { pause(); CUR = null; FIXN = null; if (H && H.show) H.show(null); try { localStorage.removeItem(LASTKEY()); } catch (e) {} paintAll(); refreshList(); };
    var r = $("lgRoll"); if (r) r.onclick = function (e) { var n = e.target.closest && e.target.closest(".lg-n"); if (n) openNoteFix(+n.getAttribute("data-i")); };
  }
  var LOOPPICK = { on: false, a: null };
  function barTap(i) {
    if (LOOPPICK.on) {
      if (LOOPPICK.a == null) { LOOPPICK.a = i; paintBars(); paintStatus(); return; }
      var a = Math.min(LOOPPICK.a, i), b = Math.max(LOOPPICK.a, i); LOOPPICK.on = false; LOOPPICK.a = null;
      CUR.rec.loop = [a, b]; keepSoon();
      var lb = $("lgLoop"); lb.textContent = w("loopOff"); lb.setAttribute("aria-pressed", "true");
      var was = PL.playing; if (was) pause(); PL.pos = CUR.bars[a].t; PL.waitDone = PL.pos - 0.001; if (was) play(); else paintNow(PL.pos);
      paintBars(); paintStatus(); return;
    }
    seek(CUR.bars[i].t);
  }
  function paintPlay() { var b = $("lgPlay"); if (!b) return; var t = PL.playing || PL.counting ? w("pause") : w("play"); if (b.textContent !== t) b.textContent = t; b.classList.toggle("go", PL.playing); }
  function paintStatus() {
    var s = $("lgStatus"); if (!s || !CUR) return;
    var lp = CUR.rec.loop, t = PL.making ? w("making") : LOOPPICK.on ? (LOOPPICK.a == null ? w("loop1") : w("loop2")) :
      CUR.rec.wait && !PL.waiting ? w("waitLine") : lp ? (lp[0] === lp[1] ? w("loopOne", { a: lp[0] + 1 }) : w("loopOn", { a: lp[0] + 1, b: lp[1] + 1 })) : "";
    if (s.textContent !== t) s.textContent = t;
  }
  function say2(t) { var s = $("lgStatus"); if (s) s.textContent = t; }
  function paintBars() {
    var box = $("lgBars"); if (!box || !CUR) return;
    var cs = CUR.chords || [], lp = CUR.rec.loop, cur = barOf(songNow());
    [].forEach.call(box.children, function (el, i) {
      var b = CUR.bars[i], names = [];
      cs.forEach(function (c) { if (c.t >= b.t - 0.03 && c.t < b.e - 0.03 && c.root >= 0) names.push(chordName(c)); });
      if (!names.length) { var at = chordAt(b.t + 0.01); if (at) names.push(chordName(at)); }
      var shown = names.filter(function (n, k) { return k === 0 || n !== names[k - 1]; }).slice(0, 3).join(" ");
      var mk = RESULT && RESULT.marks && RESULT.marks[i], html = "<small>" + (i + 1) + (mk ? ' <span class="mk ' + mk + '" aria-hidden="true">' + (mk === "ok" ? "●" : "○") + "</span>" : "") + "</small>" + esc(shown || "·");
      if (el.__h !== html) { el.innerHTML = html; el.__h = html; }
      var inl = lp ? i >= lp[0] && i <= lp[1] : LOOPPICK.on && LOOPPICK.a === i;
      el.classList.toggle("in", !!inl);
      var lab = w("bar", { n: i + 1 }) + (shown ? ", " + shown : "") + (mk ? ", " + w(mk === "ok" ? "mOk" : "mTry") : "");
      if (el.getAttribute("aria-label") !== lab) el.setAttribute("aria-label", lab);
      var on = i === cur; if ((el.getAttribute("aria-current") === "true") !== on) { if (on) el.setAttribute("aria-current", "true"); else el.removeAttribute("aria-current"); }
    });
    paintBars.cur = cur;
    var el = box.children[cur];
    if (el && box.scrollHeight > box.clientHeight) { var top = el.offsetTop - box.offsetTop; if (top < box.scrollTop || top + el.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = Math.max(0, top - 6); }
  }
  function paintMarks() { if (CUR && BOX) paintBars(); }
  /* the notes of the part: this bar and the next, stepped a bar at a time; on a computer (no reduce-motion) a thin line
     follows the music while it plays */
  var ROLL = { bar: -1, sig: "" };
  function paintRoll(force, T) {
    var box = $("lgRoll"); if (!box || !CUR || !CUR.notes) return;
    if (T == null) T = songNow();
    var bi = Math.max(0, barOf(T)), b0 = CUR.bars[bi], b1 = CUR.bars[Math.min(CUR.bars.length - 1, bi + 1)];
    if (!b0) return;
    var t0 = b0.t, t1 = Math.max(b1.e, t0 + 0.5), len = t1 - t0;
    if (force || ROLL.bar !== bi || ROLL.t0 !== t0) {
      ROLL.bar = bi; ROLL.t0 = t0; ROLL.len = len;
      var ns = CUR.notes.filter(function (n) { return n.t < t1 && n.t + n.d > t0; }), lo = 127, hi = 0;
      ns.forEach(function (n) { lo = Math.min(lo, n.m); hi = Math.max(hi, n.m); });
      if (!ns.length) { lo = 55; hi = 67; }
      lo -= 1; hi += 1; if (hi - lo < 11) { var mid = (hi + lo) / 2; lo = Math.floor(mid - 5.5); hi = lo + 11; }
      var rows = hi - lo + 1, rh = 100 / rows, html = "";
      [b0, b1 !== b0 ? b1 : null].forEach(function (b) { if (!b) return; var x = (b.t - t0) / len * 100; html += '<span class="lg-bl" style="left:' + x.toFixed(2) + '%"></span><span class="lg-bn" style="left:' + x.toFixed(2) + '%">' + esc(w("bar", { n: b.i + 1 })) + "</span>"; });
      ns.forEach(function (n) {
        var x = Math.max(0, (n.t - t0) / len * 100), wd = Math.max(1.6, Math.min(100 - x, (Math.min(n.t + n.d, t1) - Math.max(n.t, t0)) / len * 100)), y = (hi - n.m) * rh;
        html += '<button type="button" class="lg-n' + (n.conf < 0.5 ? " low" : "") + (n.fixed ? " fx" : "") + (FIXN === n.i ? " sel" : "") + '" data-i="' + n.i + '" data-m="' + n.m + '" data-t="' + n.t.toFixed(3) + '" data-e="' + (n.t + n.d).toFixed(3) + '" style="left:' + x.toFixed(2) + "%;width:" + wd.toFixed(2) + "%;top:calc(" + y.toFixed(2) + "% + 16px);height:calc(" + rh.toFixed(2) + '% - 3px)" aria-label="' + esc(w("noteFix", { n: noteName(n.m) })) + '">' + (wd > 5 ? esc(noteName(n.m)) : "") + "</button>";
      });
      if (!touchy()) html += '<span class="lg-ph" id="lgPh"></span>';
      box.innerHTML = html; ROLL.sig = "";
    }
    var sig = "";
    [].forEach.call(box.querySelectorAll(".lg-n"), function (el) {
      var a = +el.getAttribute("data-t"), e = +el.getAttribute("data-e"), now = a <= T + 0.02 && T < e - 0.01, past = !now && e <= T, k = now ? "n" : past ? "p" : "";
      sig += k; if (el.__k !== k) { el.__k = k; el.classList.toggle("now", now); el.classList.toggle("past", past); }
    });
    var ph = $("lgPh"); if (ph) { var x = Math.max(0, Math.min(100, (T - ROLL.t0) / ROLL.len * 100)); ph.style.left = x.toFixed(2) + "%"; ph.hidden = !PL.playing; }
  }
  var NOW = { k: "" };
  function paintNow(T, force) {
    if (!CUR || !$("lgNow")) return;
    var bigT = "", nextT = "", turnT = "";
    if (PL.counting && PL.ac) { var nb0 = PL.countN || 4, left = Math.max(1, Math.min(nb0, nb0 - Math.floor((PL.ac.currentTime - (PL.countAt - nb0 * PL.countPer)) / PL.countPer))); bigT = String(left); nextT = w("ready", { n: left }); }
    else if (CUR.follow === "chords") {
      var c = chordAt(T), nx = nextChord(T, c);
      bigT = c ? chordName(c) : (T >= CUR.sec - 0.05 ? "·" : w("noChord"));
      if (nx) { var n = beatsTo(T, nx.t); nextT = n > 0 && n <= 4 ? w("next", { c: chordName(nx), n: n }) : w("nextFar", { c: chordName(nx) }); }
      else if (T >= CUR.sec - 0.05 || PL.ended) nextT = w("end");
    } else {
      var ms = notesAt(T), g = nextGroup(T);
      bigT = ms.length ? ms.slice(0, 3).map(noteName).join(" ") : "·";
      if (g) { var nb = beatsTo(T, g.t), nm = g.ms.slice(0, 3).map(noteName).join(" "); nextT = nb > 0 && nb <= 4 ? w("next", { c: nm, n: nb }) : w("nextFar", { c: nm }); }
      else if (T >= CUR.sec - 0.05 || PL.ended) nextT = w("end");
    }
    if (PL.waiting) {
      var gw = PL.waiting; turnT = w("yourTurn", { n: CUR.follow === "chords" ? chordName(gw) : gw.ms.map(noteName).join(" + ") });
      if (CUR.follow === "chords") bigT = chordName(gw);
    }
    var key = bigT + "|" + nextT + "|" + turnT;
    if (force || NOW.k !== key) { NOW.k = key; $("lgNow").textContent = bigT; $("lgNext").textContent = nextT; $("lgTurn").textContent = turnT; }
    if (force || barOf(T) !== paintBars.cur) paintBars();
    paintRoll(false, T);
    paintPlay();
    show(T);
  }
  /* what the room lights: the chord's shape, or the notes to play now (the ones waited for, or the next ones while stopped) */
  var SHOWN = "";
  function show(T) {
    if (!H || !H.show) return;
    if (!CUR || !BOX || !BOX.open) { if (SHOWN !== "-") { SHOWN = "-"; H.show(null); } return; }
    if (T == null) T = songNow();
    var what = null, sig;
    if (CUR.follow === "chords") {
      var c = PL.waiting || chordAt(T) || (!PL.playing ? nextChord(T, null) : null);
      if (c && c.root >= 0 && QM[c.q]) what = { chord: { root: c.root, q: c.q, id: QM[c.q].id, pcs: chordPcs(c) } };
      sig = what ? "c" + c.root + c.q : "";
    } else {
      var ms = PL.waiting ? PL.waiting.ms : notesAt(T);
      if (!ms.length && !PL.playing) { var g = nextGroup(T - 0.03); if (g) ms = g.ms; }
      if (ms.length) what = { notes: ms.slice() };
      sig = ms.join(",");
    }
    if (sig !== SHOWN) { SHOWN = sig; try { H.show(what); } catch (e) {} }
  }
  /* ── Fix this chord / Fix this note ── */
  var FIXN = null;
  function fixTarget() { var T = songNow(); return chordAt(T) || nextChord(T, null) || (CUR.chords || []).filter(function (c) { return c.t <= T; }).pop() || (CUR.chords || [])[0]; }
  function openChordFix() {
    var c = fixTarget(), box = $("lgFixBox"); if (!c || !box) return;
    var root = c.root >= 0 ? c.root : 0, q = QM[c.q] ? c.q : "N";
    box.innerHTML = '<span class="plab">' + esc(w("fix")) + " · " + esc(w("bar", { n: barOf(c.t) + 1 })) + "</span>" +
      '<div class="row"><label class="field small"><span class="plab">' + esc(w("fixRoot")) + '</span><select id="lgFixRoot">' +
      NM[L()][flats() ? "f" : "s"].map(function (n, i) { return '<option value="' + i + '"' + (i === root ? " selected" : "") + ">" + esc(n) + "</option>"; }).join("") + "</select></label>" +
      '<label class="field"><span class="plab">' + esc(w("fixKind")) + '</span><select id="lgFixQ">' +
      Object.keys(QN).map(function (k) { return '<option value="' + k + '"' + (k === q ? " selected" : "") + ">" + esc(QN[k][L()]) + "</option>"; }).join("") + "</select></label></div>" +
      '<div class="lg-ctl"><button type="button" class="pbtn play" id="lgFixSave">' + esc(w("save")) + '</button><button type="button" class="pbtn" id="lgFixNo">' + esc(w("cancel")) + "</button></div>";
    box.hidden = false;
    $("lgFixNo").onclick = function () { box.hidden = true; };
    $("lgFixSave").onclick = function () {
      var r = +$("lgFixRoot").value, k = $("lgFixQ").value;
      fixes().chords[c.i] = { root: k === "N" ? -1 : r, q: k };
      keepSoon(); rebuildPart(); box.hidden = true; SHOWN = "?";
      paintBars(); paintNow(songNow(), true);
      say2(w("fixed", { c: chordName({ root: k === "N" ? -1 : r, q: k }) }));
    };
  }
  function openNoteFix(i) {
    var n = (CUR.notes || []).filter(function (x) { return x.i === i; })[0], box = $("lgFixBox"); if (!n || !box) return;
    FIXN = i; [].forEach.call(D.querySelectorAll(".lg-n"), function (el) { el.classList.toggle("sel", +el.getAttribute("data-i") === i); });
    var m = n.m;
    var draw = function () {
      box.innerHTML = '<span class="plab">' + esc(w("noteFix", { n: noteName(m) })) + " · " + esc(w("bar", { n: barOf(n.t) + 1 })) + "</span>" +
        '<div class="lg-ctl"><button type="button" class="pbtn" id="lgNDown">' + esc(w("down")) + '</button><button type="button" class="pbtn" id="lgNUp">' + esc(w("up")) + "</button>" +
        '<button type="button" class="pbtn clear" id="lgNOut">' + esc(w("out")) + "</button></div>" +
        '<div class="lg-ctl"><button type="button" class="pbtn play" id="lgNSave">' + esc(w("save")) + '</button><button type="button" class="pbtn" id="lgNNo">' + esc(w("cancel")) + "</button></div>";
      $("lgNDown").onclick = function () { m = Math.max(0, m - 1); draw(); if (H && H.show) { SHOWN = "?"; H.show({ notes: [m] }); } };
      $("lgNUp").onclick = function () { m = Math.min(127, m + 1); draw(); if (H && H.show) { SHOWN = "?"; H.show({ notes: [m] }); } };
      $("lgNNo").onclick = function () { box.hidden = true; FIXN = null; SHOWN = "?"; paintRoll(true); show(); };
      $("lgNOut").onclick = function () { save({ del: 1 }); };
      $("lgNSave").onclick = function () { save({ m: m }); };
    };
    var save = function (fx) {
      var all = fixes().notes, f = all[CUR.follow] || (all[CUR.follow] = {}); f[i] = fx;
      keepSoon(); rebuildPart(); box.hidden = true; FIXN = null; SHOWN = "?";
      paintRoll(true); paintNow(songNow(), true);
      say2(fx.del ? w("noteOut") : w("noteSaved", { n: noteName(fx.m) }));
    };
    draw(); box.hidden = false;
  }

  /* ── start ── */
  function attach(h) { H = h || null; wrapNote(); if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", mount); else mount(); }
  D.addEventListener("visibilitychange", function () { if (D.hidden) pause(); });
  window.addEventListener("pagehide", function () { pause(); });
  window.AOGLearnUI = {
    attach: attach,
    /* for the tests: an offline clock, a pass, the state, a slower copy */
    test: {
      clock: function (fn) { TEST.clock = fn || null; },
      at: function (T) { pause(); PL.pos = T; PL.waitDone = T - 0.001; paintNow(T, true); return api().state(); },
      pass: function (from) { startPass(from || 0); },
      endPass: function (to) { return endPass(to); },
      judge: function (due, played, follow) { return judge(due, played, follow || "chords"); },
      buffer: function (speed) { return bufFor(speed / 100).then(function (b) { return b ? { len: b.length, sr: b.sampleRate, ch0: b.getChannelData(0) } : null; }); },
      base: function () { return baseBuf().then(function (b) { return { len: b.length, sr: b.sampleRate }; }); },
      source: function () { var s = PL.src; return s ? { loop: s.loop, a: s.loopStart, b: s.loopEnd, rate: s.playbackRate.value } : null; },
      state: function () { return api().state(); }
    }
  };
  function api() { return { state: function () { return {
    open: !!CUR, id: CUR && CUR.rec.id, name: CUR && CUR.rec.name, follow: CUR && CUR.follow, speed: CUR && CUR.rec.speed, loop: CUR && CUR.rec.loop, wait: !!(CUR && CUR.rec.wait),
    playing: PL.playing, counting: PL.counting, waiting: PL.waiting ? { t: PL.waiting.t, ms: PL.waiting.ms || null, pcs: PL.waiting.pcs } : null, T: CUR ? songNow() : 0,
    now: $("lgNow") ? $("lgNow").textContent : "", next: $("lgNext") ? $("lgNext").textContent : "", bars: CUR ? CUR.bars.length : 0,
    fixes: CUR ? JSON.parse(JSON.stringify(CUR.rec.fixes || {})) : null, result: RESULT, ev: CUR ? (CUR.ev || []).length : 0 }; } }; }
  /* a room that set its hooks before this file ran */
  if (window.AOGLearnRoom) attach(window.AOGLearnRoom);
})();
