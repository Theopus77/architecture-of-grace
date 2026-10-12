/* ══ AOG-HUM-V1 (2026-10-12) — Hum it, and the Studio plays it ═══════════════════════════════════════════════════════
   Jimmy picked: "Hum it, and the Studio plays it. Sing or hum a tune and it becomes notes, played on any instrument."

   One closed block in the Piano, the Guitar, the Bass and the Band ("Hum it" / "Tararéalo"), and in the Drum Machine
   ("Beatbox it" / "Hazlo con la boca"). The microphone opens only when Record is pressed, and closes at Stop. Nothing is
   uploaded; nothing plays on its own.

   Hum it:   ● Record (with "Count me in": one bar of clicks at the song's tempo first) → Listening… → ■ Stop → the notes,
             on a small still strip. Tidy it up: Snap to the beat (1/8, 1/16, Off; the song's tempo) and Keep in the key
             (the song's key, or the key heard in the tune when the song has none), both on. Lower / Higher move the
             whole tune an octave. Tap a note: Up a step, Down a step, Take it out. ▶ Hear it plays the notes through the
             room's own instrument (window.AOGRoomRender, AOG-NOTES-V1). Keep it makes a take with notes in the room,
             exactly like a played take (AOGRecorder.adopt in aog-recorder.js), so it can go to My Track or the Mixing
             Desk and be played again on another sound there.
             The octave: the Piano plays it as sung; the Bass an octave or two down, into its range; the Guitar and the
             Band as sung when it fits their reach (the Band: the instrument chosen now), else the octave that fits best.
             With Count me in, the clicks reach you late by the sound-out half of the trip and your voice reaches the page
             late by the sound-in half, so a note is moved back by the whole trip (AOGLatency.rt(), the Timing check;
             without one, what the browser reports). Without it, the first note is beat one and the trip does not matter.
   Beatbox it: the same Record, then each mouth sound is named: boom = kick, ka (or pf) = snare, tss = hi-hat (by its
             spectral centroid and its low and high energy; "Teach it my sounds" keeps the learner's own boom, tss and ka
             on this device, aog.hum.beatbox.v1, and names sounds by the nearest of them). Snapped to 1/16, 1/8 or Off
             (the Drum Machine's own 96 ticks a beat), on bank A's Kick, Snare and Hi-hat pads (1, 2, 3), over 1, 2 or 4
             bars. Keep it puts it in the beat (the old beat comes back with Undo).
             Not in the Drum Kit: its beats are a fixed list of grooves with no pattern to write into, and its takes keep
             no notes, so there is nothing a beatbox could become there that the Kit could play again.
   Not here: playing along with My Track while you hum. With no echo cancelling (it would smear the tune), the
             microphone would hear My Track from the speakers too.

   A room joins before this file runs (it loads with defer):
     window.AOGHumRoom = { room:"piano"|"guitar"|"bass"|"band"|"pads", lang:()=>"en"|"es", bpm:()=>tempo,
       range:()=>[lo, hi] (the notes the instrument reaches now),
       the Drum Machine also: ctx:()=>AudioContext, ready:()=>Promise, hit:(pad, v, when)=>{}, write:(ev, bars)=>{} }
   The listening (aog-hum-engine.js) is fetched on the first press of Record and runs in a Worker.
   The Studio hushes a room out of sight ("aog-hush" event, AOGVU.own): the microphone stops (what was heard is kept),
   playing stops, the sound sleeps. Idle, nothing here runs: no timers, no frames. ══════════════════════════════════════ */
(function () {
  "use strict";
  var D = document, H = null, ENGINE = "/aog-hum-engine.js", MAXSEC = 30, LEAD = 0.05;
  var W = {
    sum: { en: "Hum it", es: "Tararéalo" }, bsum: { en: "Beatbox it", es: "Hazlo con la boca" },
    intro: { en: "Hum or sing the tune. Any voice works.", es: "Tararea o canta la melodía. Cualquier voz sirve." },
    bintro: { en: "Make the drum sounds with your mouth: boom for the kick, ka for the snare, tss for the hi-hat.", es: "Haz la batería con la boca: bum para el bombo, ka para la caja, tss para el charles." },
    mic: { en: "The microphone turns on only when you press Record. Nothing leaves this device.", es: "El micrófono se enciende solo cuando pulsas Grabar. Nada sale de este aparato." },
    count: { en: "Count me in", es: "Cuéntame antes" },
    rec: { en: "● Record", es: "● Grabar" }, stop: { en: "■ Stop", es: "■ Parar" },
    opening: { en: "Turning on the microphone…", es: "Encendiendo el micrófono…" },
    ready: { en: "Get ready… {n}", es: "Prepárate… {n}" },
    listen: { en: "● Listening… {s}. Press Stop when you finish.", es: "● Escuchando… {s}. Pulsa Parar cuando termines." },
    work: { en: "Turning your tune into notes…", es: "Convirtiendo tu melodía en notas…" },
    workB: { en: "Finding your drum sounds…", es: "Buscando tus sonidos de batería…" },
    got: { en: "{n} notes. Tap a note to change it.", es: "{n} notas. Toca una nota para cambiarla." },
    got1: { en: "1 note. Tap it to change it.", es: "1 nota. Tócala para cambiarla." },
    gotB: { en: "{n} hits. Tap a hit to change it.", es: "{n} golpes. Toca un golpe para cambiarlo." },
    none: { en: "No tune came through. Try again a little closer to the microphone.", es: "No llegó ninguna melodía. Inténtalo otra vez un poco más cerca del micrófono." },
    noneB: { en: "No drum sounds came through. Try again a little closer to the microphone.", es: "No llegaron sonidos de batería. Inténtalo otra vez un poco más cerca del micrófono." },
    noMic: { en: "The microphone is not on for this page. Let this page use it, then try again.", es: "El micrófono no está encendido para esta página. Deja que la página lo use y vuelve a intentarlo." },
    full: { en: "30 seconds is the longest, so it stopped there.", es: "30 segundos es lo más largo, así que se detuvo ahí." },
    away: { en: "It stopped when the room went out of sight. Here is what it heard.", es: "Se detuvo cuando la sala dejó de verse. Esto es lo que oyó." },
    fail: { en: "That did not work. Try again.", es: "No funcionó. Inténtalo otra vez." },
    tidy: { en: "Tidy it up", es: "Ordénalo un poco" },
    snap: { en: "Snap to the beat", es: "Ajustar al pulso" },
    s8: { en: "1/8 notes", es: "Corcheas (1/8)" }, s16: { en: "1/16 notes", es: "Semicorcheas (1/16)" }, soff: { en: "Off", es: "No" },
    keyOn: { en: "Keep in the key", es: "Mantener en la tonalidad" },
    keySong: { en: "In {k}, the song's key.", es: "En {k}, la tonalidad de la canción." },
    keyHum: { en: "In {k}, the key your tune is in.", es: "En {k}, la tonalidad de tu melodía." },
    major: { en: "major", es: "mayor" }, minor: { en: "minor", es: "menor" },
    lower: { en: "Lower", es: "Más grave" }, higher: { en: "Higher", es: "Más agudo" },
    hear: { en: "▶ Hear it", es: "▶ Escuchar" }, hearStop: { en: "■ Stop", es: "■ Parar" },
    making: { en: "Getting the sound ready…", es: "Preparando el sonido…" },
    again: { en: "Try again", es: "Otra vez" },
    keep: { en: "Keep it", es: "Guardar" },
    kept: { en: "Kept as take {n}, with your takes. Add it to My Track to use it in your song.", es: "Guardada como toma {n}, con tus tomas. Añádela a mi pista para usarla en tu canción." },
    keptOwn: { en: "Kept as take {n}, with your takes. Send it to the Mixing Desk to use it in your song.", es: "Guardada como toma {n}, con tus tomas. Envíala a la mesa de mezclas para usarla en tu canción." },
    keptB: { en: "Your beat is on bank A, over {bars}. Press Play. Undo brings back the beat you had.", es: "Tu ritmo está en el banco A, en {bars}. Pulsa Tocar. Deshacer trae el ritmo que tenías." },
    bars1: { en: "1 bar", es: "1 compás" }, barsN: { en: "{n} bars", es: "{n} compases" },
    longB: { en: " Only the first 4 bars fit.", es: " Solo caben los primeros 4 compases." },
    up: { en: "Up a step", es: "Subir un paso" }, down: { en: "Down a step", es: "Bajar un paso" }, out: { en: "Take it out", es: "Quitar" },
    noteIs: { en: "This note: {n}", es: "Esta nota: {n}" }, hitIs: { en: "This hit:", es: "Este golpe:" },
    at: { en: "bar {b}, beat {c}", es: "compás {b}, pulso {c}" },
    kick: { en: "Kick", es: "Bombo" }, snare: { en: "Snare", es: "Caja" }, hat: { en: "Hi-hat", es: "Charles" },
    roll: { en: "Your tune as notes", es: "Tu melodía en notas" }, rollB: { en: "Your beat", es: "Tu ritmo" },
    teach: { en: "Teach it my sounds", es: "Enséñale mis sonidos" },
    teachSay: { en: "Say boom, then tss, then ka, with a little space between them. Then press Stop.", es: "Di bum, luego tss, luego ka, con un poco de espacio entre ellos. Luego pulsa Parar." },
    taught: { en: "Got it. Your boom, tss and ka are kept on this device.", es: "Listo. Tu bum, tss y ka se guardan en este aparato." },
    teachShort: { en: "I heard {n} of the three sounds. Try again, a little louder.", es: "Oí {n} de los tres sonidos. Inténtalo otra vez, un poco más fuerte." },
    mine: { en: "It knows your own boom, tss and ka.", es: "Conoce tu propio bum, tss y ka." },
    forget: { en: "Forget my sounds", es: "Olvidar mis sonidos" },
    forgot: { en: "Back to the usual sounds.", es: "De vuelta a los sonidos de siempre." },
    noRange: { en: "This instrument has no notes for a tune. Pick another one, then try again.", es: "Este instrumento no tiene notas para una melodía. Elige otro y vuelve a intentarlo." }
  };
  var NM = { en: ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"], es: ["Do", "Do♯", "Re", "Mi♭", "Mi", "Fa", "Fa♯", "Sol", "La♭", "La", "Si♭", "Si"] };
  var RANGE = { piano: [21, 108], guitar: [40, 86], bass: [28, 67], band: [36, 96] };
  function L() { try { if (H && H.lang) return H.lang() === "es" ? "es" : "en"; } catch (e) {} return (D.documentElement.getAttribute("lang") || "en").indexOf("es") === 0 ? "es" : "en"; }
  function w(k, v) { var x = W[k], s = x ? (x[L()] || x.en) : k; if (v) Object.keys(v).forEach(function (n) { s = s.split("{" + n + "}").join(v[n]); }); return s; }
  function $(id) { return D.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function noteName(m) { m = Math.round(m); return NM[L()][((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); }
  function beatRoom() { return !!(H && H.room === "pads"); }
  function inStudio() { return D.documentElement.classList.contains("in-studio"); }
  var PREF = { count: false, snap: 2, snapB: 24, key: true };
  try { var pr = JSON.parse(localStorage.getItem("aog.hum.v1") || "null"); if (pr) Object.keys(PREF).forEach(function (k) { if (pr[k] != null) PREF[k] = pr[k]; }); } catch (e) {}
  function savePref() { try { localStorage.setItem("aog.hum.v1", JSON.stringify(PREF)); } catch (e) {} }

  /* ── the room's tempo and the song's key ── */
  function tempo() { var s = null; try { s = window.AOGSong && AOGSong.get(); } catch (e) {} if (s && s.hasBpm) return s.bpm; var b = 0; try { b = +H.bpm() || 0; } catch (e) {} return b > 0 ? b : 100; }
  function songKey() { var s = null; try { s = window.AOGSong && AOGSong.get(); } catch (e) {} return s && s.hasKey ? { key: s.key, minor: !!s.minor } : null; }
  function range() {
    var r = null; try { r = H.range && H.range(); } catch (e) { r = null; }
    if (!(r && r[0] > 0 && r[1] > r[0])) r = RANGE[H && H.room] || RANGE.piano;
    return r;
  }
  /* the whole trip, sound out and back in (the Timing check), or what the browser says */
  function trip(c, st) {
    var v = 0; try { v = window.AOGLatency && AOGLatency.rt ? +AOGLatency.rt() || 0 : 0; } catch (e) {}
    if (!(v > 0)) { try { var m = JSON.parse(localStorage.getItem("aog.latency.v1") || "null"); v = m && m.rt > 0 && m.rt < 1 ? +m.rt : 0; } catch (e) {} }
    if (v > 0) return v;
    var inL = 0; try { var s0 = st.getAudioTracks()[0].getSettings(); inL = s0.latency > 0 ? s0.latency : 0; } catch (e) {}
    return (c.outputLatency > 0 ? c.outputLatency : 0) + (c.baseLatency > 0 ? c.baseLatency : 0) + inL;
  }

  /* ══ tidy it up: a tune ══ */
  var MAJ = [0, 2, 4, 5, 7, 9, 11], MINS = [0, 2, 3, 5, 7, 8, 10, 11];   /* minor: the raised 7th is welcome too */
  var KKM = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88], KKm = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  function tuning(notes) {   /* how sharp or flat the whole tune is (a circular mean of each note's fraction, by length) */
    var x = 0, y = 0; notes.forEach(function (n) { var a = 2 * Math.PI * n.m, wt = Math.max(0.05, n.d); x += wt * Math.cos(a); y += wt * Math.sin(a); });
    return x || y ? Math.atan2(y, x) / (2 * Math.PI) : 0;
  }
  function detectKey(notes, off) {
    var h = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; notes.forEach(function (n) { h[((Math.round(n.m - off) % 12) + 12) % 12] += Math.max(0.05, n.d); });
    var best = { key: 0, minor: false, r: -2 };
    function corr(p, k) { var mx = 0, mp = 0, i; for (i = 0; i < 12; i++) { mx += h[i]; mp += p[i]; } mx /= 12; mp /= 12; var a = 0, b = 0, c = 0;
      for (i = 0; i < 12; i++) { var u = h[(i + k) % 12] - mx, v = p[i] - mp; a += u * v; b += u * u; c += v * v; } return b && c ? a / Math.sqrt(b * c) : 0; }
    for (var k = 0; k < 12; k++) { var r1 = corr(KKM, k), r2 = corr(KKm, k); if (r1 > best.r + 1e-9) best = { key: k, minor: false, r: r1 }; if (r2 > best.r + 1e-9) best = { key: k, minor: true, r: r2 }; }
    return best;
  }
  function scaleSet(k) { return (k.minor ? MINS : MAJ).map(function (i) { return (i + k.key) % 12; }); }
  function inSet(set, m) { return set.indexOf(((m % 12) + 12) % 12) >= 0; }
  function snapKey(m, set, prev) {
    var r = Math.round(m), best = null, bd = 9;
    for (var c = r - 2; c <= r + 2; c++) { if (!inSet(set, c)) continue; var d = Math.abs(c - m) + (prev != null ? 0.001 * Math.abs(c - prev) : 0); if (d < bd) { bd = d; best = c; } }
    return best == null ? r : best;
  }
  function stepIn(m, n, set) { var x = m, s = n > 0 ? 1 : -1; for (var k = 0; k < Math.abs(n); k++) { x += s; if (set) while (!inSet(set, x)) x += s; } return x; }
  /* the grid's beat one: given (Count me in), else near the first note where every note lands best */
  function phase(ts, g, origin) {
    if (origin != null) return origin;
    var t0 = ts[0]; if (!g) return t0;
    var best = t0, bc = Infinity, use = ts.slice(0, 24);
    for (var j = -12; j <= 12; j++) {
      var ph = t0 + j * g / 24, c = 0;
      use.forEach(function (t) { var u = (t - ph) / g, e = u - Math.round(u); c += e * e; });
      c += 1e-4 * Math.abs(j);
      if (c < bc) { bc = c; best = ph; }
    }
    return best;
  }
  function autoOct(ms, room, r) {
    if (!ms.length) return 0;
    var md = ms.slice().sort(function (a, b) { return a - b; })[ms.length >> 1], ks = room === "bass" ? [-1, -2, -3] : room === "piano" ? [0, -1, 1] : [0, -1, 1, -2, 2];
    var out = function (k) { return ms.filter(function (m) { return m + 12 * k < r[0] || m + 12 * k > r[1]; }).length; };
    var center = room === "bass" ? 43 : (r[0] + r[1]) / 2, best = ks[0], bc = Infinity;
    ks.forEach(function (k, i) {
      var o = out(k), c = o * 1000 + (room === "bass" ? Math.abs(md + 12 * k - center) : i);   /* the piano, guitar and band: as sung when it fits */
      if (c < bc) { bc = c; best = k; }
    });
    return best;
  }
  function tidyTune(raw, o) {
    var notes = raw.filter(function (n) { return n.d > 0; });
    if (!notes.length) return { notes: [], key: null };
    var off = tuning(notes), key = null, from = "";
    if (o.keyOn) { key = o.key; from = "song"; if (!key) { var dk = detectKey(notes, off); key = { key: dk.key, minor: dk.minor }; from = "hum"; } }
    var set = key ? scaleSet(key) : null, prev = null;
    var ps = notes.map(function (n) { var m = n.m - off, p = set ? snapKey(m, set, prev) : Math.round(m); prev = p; return p; });
    var r = o.range, oc = autoOct(ps, o.room, r) + (o.oct || 0);
    /* time */
    var beat = 60 / o.bpm, g = o.grid ? beat / o.grid : 0, ts = notes.map(function (n) { return n.t; }), ph = phase(ts, g, o.origin), out = [];
    var ks = notes.map(function (n) { return g ? Math.round((n.t - ph) / g) : (n.t - ph); });
    var es = notes.map(function (n) { return g ? Math.round((n.t + n.d - ph) / g) : (n.t + n.d - ph); });
    var lastK = -Infinity, keep = [];
    notes.forEach(function (n, i) {
      var k = ks[i];
      if (o.origin != null && k < (g ? -o.grid / 2 : -beat / 2)) return;   /* sung during the clicks */
      if (k < 0) k = 0;
      if (g && k <= lastK) k = lastK + 1;
      keep.push({ i: n.i != null ? n.i : i, k: k, e: Math.max(g ? k + 1 : k + 0.05, es[i]), m: ps[i] + 12 * oc, v: n.v });
      lastK = k;
    });
    keep.forEach(function (q, j) { var nx = keep[j + 1]; if (nx && q.e > nx.k) q.e = Math.max(g ? q.k + 1 : q.k + 0.03, nx.k); });
    keep.forEach(function (q) {
      var ed = (o.edits || {})[q.i] || {}; if (ed.out) return;
      var m = ed.st ? stepIn(q.m, ed.st, set) : q.m;
      while (m < r[0]) m += 12; while (m > r[1]) m -= 12;
      out.push({ i: q.i, t: g ? q.k * g : q.k, d: g ? (q.e - q.k) * g : q.e - q.k, m: m, v: q.v });
    });
    return { notes: out, key: key, from: from, oct: oc, beat: beat, g: g };
  }
  /* ══ tidy it up: a beat ══ */
  var CAL = null; try { CAL = JSON.parse(localStorage.getItem("aog.hum.beatbox.v1") || "null"); if (!(CAL && CAL.k && CAL.s && CAL.h)) CAL = null; } catch (e) { CAL = null; }
  function feat(h) { return [Math.log(Math.max(60, h.c)) / Math.LN2, h.lo * 4, h.hi * 4]; }
  function kindOf(h) {
    if (CAL) { var f = feat(h), best = "s", bd = Infinity; ["k", "s", "h"].forEach(function (k) { var c = CAL[k], d = 0; for (var i = 0; i < 3; i++) d += (f[i] - c[i]) * (f[i] - c[i]); if (d < bd) { bd = d; best = k; } }); return best; }
    if (h.lo > 0.4 || h.c < 700) return "k";
    if (h.c > 5000 && h.hi > 0.4) return "h";
    return "s";
  }
  var PAD = { k: 0, s: 1, h: 2 };
  function tidyBeat(hits, o) {
    var beat = 60 / o.bpm, tick = beat / 96, step = o.grid || 1, g = step * tick, ts = hits.map(function (h) { return h.t; }), ph = phase(ts, o.grid ? g : 0, o.origin);
    var seen = {}, ev = [], dropped = 0;
    hits.forEach(function (h, i) {
      var ed = (o.edits || {})[i] || {}; if (ed.out) return;
      var k = ed.k || kindOf(h), t = Math.round((h.t - ph) / g) * step;
      if (o.origin != null && t < -48) return;
      if (t < 0) t = 0;
      if (t >= 4 * 384) { dropped++; return; }
      var key = PAD[k] + ":" + t, v = Math.round(Math.max(0.3, Math.min(1, h.v)) * 100) / 100;
      if (seen[key]) { if (seen[key].v < v) seen[key].v = v; return; }
      var e = { i: i, k: k, p: PAD[k], t: t, v: v }; seen[key] = e; ev.push(e);
    });
    var last = ev.reduce(function (a, e) { return Math.max(a, e.t); }, 0), need = Math.floor(last / 384) + 1, bars = need <= 1 ? 1 : need <= 2 ? 2 : 4;
    return { ev: ev, bars: bars, dropped: dropped, beat: beat };
  }

  /* ══ the microphone ══ */
  var CAP = "class AogHumCap extends AudioWorkletProcessor{constructor(){super();this.on=true;this.b=new Float32Array(4096);this.n=0;this.f=-1;" +
    "this.port.onmessage=(e)=>{if(e.data==='stop'){if(this.n)this.port.postMessage({t:'d',d:this.b.slice(0,this.n)});this.n=0;this.on=false;this.port.postMessage({t:'end'});}};}" +
    "process(i){if(!this.on)return false;const a=i[0]&&i[0][0];if(!a)return true;if(this.f<0){this.f=currentFrame;this.port.postMessage({t:'f',f:currentFrame});}" +
    "for(let k=0;k<a.length;k++){this.b[this.n++]=a[k];if(this.n===4096){this.port.postMessage({t:'d',d:this.b},[this.b.buffer]);this.b=new Float32Array(4096);this.n=0;}}return true;}}" +
    "registerProcessor('aog-hum-cap',AogHumCap);";
  var C = null, capURL = null, REC = null, ST = { phase: "idle", msg: "", res: null, sel: null, edits: {}, oct: 0, kind: "", playing: false, busy: false, kept: "" };
  function ctxOf() {
    if (C && C.state !== "closed") return C;
    var AC = window.AudioContext || window.webkitAudioContext; C = new AC({ latencyHint: "interactive" });
    try { if (window.AOGVU && AOGVU.own) AOGVU.own(C); } catch (e) {}   /* the Studio's hush puts it to sleep too */
    return C;
  }
  function click(c, when, top) {
    var os = c.createOscillator(), g = c.createGain(); os.frequency.value = top ? 2093 : 1568;   /* above any voice, so it never reads as a note */
    g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(top ? 0.4 : 0.26, when + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
    os.connect(g); g.connect(c.destination); os.start(when); os.stop(when + 0.06);
  }
  async function record(kind) {
    if (REC || ST.busy) return;
    stopPlay();
    var c = ctxOf(); try { c.resume(); } catch (e) {}
    warm();
    ST.phase = "opening"; ST.kind = kind; ST.msg = ""; ST.kept = ""; paint();
    var md = navigator.mediaDevices, st = null, sess = null;
    try { if (navigator.audioSession) { sess = navigator.audioSession.type; navigator.audioSession.type = "play-and-record"; } } catch (e) {}
    try {
      if (!md || !md.getUserMedia) throw new Error("none");
      st = await md.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (e) { restoreSession(sess); ST.phase = ST.res ? "result" : "idle"; ST.msg = "noMic"; paint(); return; }
    if (ST.phase !== "opening") { st.getTracks().forEach(function (t) { t.stop(); }); restoreSession(sess); return; }   /* hushed meanwhile */
    var R = REC = { st: st, sess: sess, chunks: [], f0: -1, D: null, lat: trip(c, st), t0: 0, timer: 0, tos: [], kind: kind, ended: null };
    try {
      R.src = c.createMediaStreamSource(st); R.sink = c.createGain(); R.sink.gain.value = 0; R.sink.connect(c.destination);
      try {
        if (!c.audioWorklet) throw new Error("no worklet");
        if (!capURL) capURL = URL.createObjectURL(new Blob([CAP], { type: "application/javascript" }));
        await c.audioWorklet.addModule(capURL);
        R.node = new AudioWorkletNode(c, "aog-hum-cap", { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1] });
        R.node.port.onmessage = function (e) { var m = e.data; if (!m) return; if (m.t === "f") R.f0 = m.f; else if (m.t === "d") R.chunks.push(m.d); else if (m.t === "end" && R.ended) R.ended(); };
      } catch (e) {
        R.node = c.createScriptProcessor(4096, 1, 1);
        R.node.onaudioprocess = function (ev) { if (R.f0 < 0) R.f0 = Math.round((ev.playbackTime || c.currentTime) * c.sampleRate); R.chunks.push(new Float32Array(ev.inputBuffer.getChannelData(0))); };
      }
      R.src.connect(R.node); R.node.connect(R.sink);
    } catch (e) { endMic(R); REC = null; ST.phase = ST.res ? "result" : "idle"; ST.msg = "fail"; paint(); return; }
    var go = function () { ST.phase = "listen"; R.t0 = performance.now(); paint();
      R.timer = setInterval(function () { var s = (performance.now() - R.t0) / 1000; if (s >= MAXSEC) { stopRec("full"); return; } paintSay(); }, 500); };
    if (kind !== "teach" && PREF.count) {
      var beat = 60 / tempo(), T0 = c.currentTime + 0.35;
      for (var k = 0; k < 4; k++) click(c, T0 + k * beat, k === 0);
      R.D = T0 + 4 * beat; ST.phase = "count"; ST.n = 4; paint();
      for (k = 0; k < 4; k++) (function (k) { R.tos.push(setTimeout(function () { if (REC !== R) return; ST.n = 4 - k; paintSay(); }, Math.max(0, (T0 + k * beat - c.currentTime) * 1000))); })(k);
      R.tos.push(setTimeout(function () { if (REC === R) go(); }, Math.max(0, (R.D - c.currentTime) * 1000)));
    } else go();
  }
  function restoreSession(s) { try { if (s != null && navigator.audioSession) navigator.audioSession.type = s; } catch (e) {} }
  function endMic(R) {
    clearInterval(R.timer); R.timer = 0; R.tos.forEach(clearTimeout); R.tos = [];
    try { R.st.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
    try { if (R.src) R.src.disconnect(); } catch (e) {} try { if (R.node) R.node.disconnect(); } catch (e) {} try { if (R.sink) R.sink.disconnect(); } catch (e) {}
    restoreSession(R.sess);
  }
  async function stopRec(why) {
    var R = REC; if (!R || R.stopping) return; R.stopping = true;
    var wasCount = ST.phase === "count";
    clearInterval(R.timer); R.timer = 0; R.tos.forEach(clearTimeout); R.tos = [];
    if (R.node && R.node.port) await new Promise(function (ok) { R.ended = ok; try { R.node.port.postMessage("stop"); } catch (e) { ok(); } setTimeout(ok, 400); });
    endMic(R); REC = null;
    if (wasCount) { ST.phase = ST.res ? "result" : "idle"; ST.msg = ""; paint(); return; }
    var c = C, sr = c.sampleRate, n = 0; R.chunks.forEach(function (x) { n += x.length; });
    var x = new Float32Array(n), o = 0; R.chunks.forEach(function (q) { x.set(q, o); o += q.length; });
    var origin = R.D != null && R.f0 >= 0 ? (R.D + R.lat) - R.f0 / sr : null;
    return heard(R.kind, x, sr, origin, why === "full" ? "full" : why === "away" ? "away" : "");
  }
  /* what was heard, turned into notes or hits (the tests hand their sound straight here too) */
  async function heard(kind, x, sr, origin, note) {
    ST.phase = "work"; ST.kind = kind; ST.msg = ""; ST.busy = true; paint();
    var out = null;
    try { out = await analyse(kind === "tune" ? "tune" : "beats", x, sr); } catch (e) { out = null; }
    ST.busy = false;
    if (!out) { ST.phase = ST.res ? "result" : "idle"; ST.msg = "fail"; paint(); return; }
    if (kind === "teach") {
      var hs = out.hits.slice().sort(function (a, b) { return b.e - a.e; }).slice(0, 3).sort(function (a, b) { return a.t - b.t; });
      if (hs.length < 3) { ST.phase = ST.res ? "result" : "idle"; ST.msg = "teachShort"; ST.fill = { n: hs.length }; paint(); return; }
      CAL = { k: feat(hs[0]), h: feat(hs[1]), s: feat(hs[2]) };
      try { localStorage.setItem("aog.hum.beatbox.v1", JSON.stringify(CAL)); } catch (e) {}
      ST.phase = ST.res ? "result" : "idle"; ST.msg = "taught"; paint(); return;
    }
    var list = kind === "tune" ? out.notes : out.hits;
    list.forEach(function (q, i) { q.i = i; });
    if (!list.length) { ST.res = null; ST.phase = "idle"; ST.msg = kind === "tune" ? "none" : "noneB"; paint(); return; }
    ST.res = { kind: kind, raw: list, origin: origin, sr: sr }; ST.sel = null; ST.edits = {}; ST.oct = 0; ST.phase = "result"; ST.msg = note || ""; ST.cache = null;
    paint();
  }

  /* ══ the listening engine: a Worker, fetched on the first Record ══ */
  var WK = null, WKBAD = false, SEQ = 0, WAIT = {}, ENG = null;
  function warm() {
    if (WK || WKBAD) return;
    try {
      WK = new Worker(ENGINE);
      WK.onmessage = function (e) { var m = e.data || {}, f = WAIT[m.id]; if (f) { delete WAIT[m.id]; f(m); } };
      WK.onerror = function () { WKBAD = true; try { WK.terminate(); } catch (e) {} WK = null; Object.keys(WAIT).forEach(function (id) { var f = WAIT[id]; delete WAIT[id]; f({ fall: 1 }); }); };
    } catch (e) { WKBAD = true; WK = null; }
  }
  function analyse(kind, x, sr) {
    warm();
    if (!WK) return slices(kind, x, sr);
    return new Promise(function (ok, no) {
      var id = ++SEQ;
      WAIT[id] = function (m) { if (m.fall) slices(kind, x, sr).then(ok, no); else if (m.err) no(new Error(m.err)); else ok(m.out); };
      WK.postMessage({ id: id, kind: kind, x: x, sr: sr });
    });
  }
  /* no Worker: the same engine on the page, in pieces of 10 ms */
  function slices(kind, x, sr) {
    var load = ENG || (ENG = new Promise(function (ok, no) { if (window.AOGHumEngine) return ok(); var s = D.createElement("script"); s.src = ENGINE; s.onload = ok; s.onerror = function () { ENG = null; no(new Error("engine")); }; D.head.appendChild(s); }));
    return load.then(function () { return new Promise(function (ok) { var j = window.AOGHumEngine.job(kind, x, sr); (function go() { if (j.step(10)) ok(j.result()); else setTimeout(go, 0); })(); }); });
  }

  /* ══ what the learner hears and keeps ══ */
  function tidied() {
    var r = ST.res; if (!r) return null;
    if (r.kind === "tune") return tidyTune(r.raw, { bpm: tempo(), grid: +PREF.snap || 0, keyOn: !!PREF.key, key: songKey(), origin: r.origin, room: H.room, range: range(), oct: ST.oct, edits: ST.edits });
    return tidyBeat(r.raw, { bpm: tempo(), grid: +PREF.snapB || 0, origin: r.origin, edits: ST.edits });
  }
  /* the notes as a take has them: from LEAD seconds before beat one of the first bar a note is in */
  function takeEvents(td) {
    var bar = td.beat * 4, first = td.notes.length ? td.notes[0].t : 0, skip = Math.max(0, Math.floor((first + 1e-6) / bar)) * bar;
    return td.notes.map(function (n) { return { t: Math.round((LEAD + n.t - skip) * 10000) / 10000, m: n.m, v: Math.round(n.v * 1000) / 1000, d: Math.round(Math.max(0.05, n.d) * 10000) / 10000 }; });
  }
  async function renderTune(td) {
    var ev = takeEvents(td), sig = JSON.stringify(ev) + "|" + (H.sound ? H.sound() : "");
    if (ST.cache && ST.cache.sig === sig) return ST.cache;
    var out = null;
    if (window.AOGRoomRender && AOGRoomRender.render) out = await AOGRoomRender.render({ events: ev, sec: 0, tail: 1 });
    else out = await plainRender(ev);
    ST.cache = { sig: sig, ev: ev, out: out };
    return ST.cache;
  }
  async function plainRender(ev) {   /* a room without its own render (should not happen): a soft tone */
    var sec = ev.reduce(function (a, e) { return Math.max(a, e.t + e.d); }, 0) + 1, sr = 44100, OC = window.OfflineAudioContext || window.webkitOfflineAudioContext, oc = new OC(2, Math.ceil(sec * sr), sr);
    ev.forEach(function (e) { var o = oc.createOscillator(), g = oc.createGain(); o.type = "triangle"; o.frequency.value = 440 * Math.pow(2, (e.m - 69) / 12);
      g.gain.setValueAtTime(0, e.t); g.gain.linearRampToValueAtTime(0.3 * e.v, e.t + 0.01); g.gain.setTargetAtTime(0, e.t + e.d, 0.05); o.connect(g); g.connect(oc.destination); o.start(e.t); o.stop(e.t + e.d + 0.4); });
    var b = await oc.startRendering(); return { L: b.getChannelData(0), R: b.getChannelData(1), sr: sr };
  }
  var PLAY = null;
  async function hear() {
    if (ST.playing) { stopPlay(); paint(); return; }
    var td = tidied(); if (!td || !td.notes && !td.ev) return;
    ST.playing = true; ST.msg = ""; paint();
    if (ST.res.kind === "tune") {
      if (!td.notes.length) { ST.playing = false; paint(); return; }
      ST.msg = "making"; paintSay();
      var r; try { r = await renderTune(td); } catch (e) { r = null; }
      if (!ST.playing) return;
      ST.msg = "";
      if (!r) { ST.playing = false; ST.msg = "fail"; paint(); return; }
      var c = ctxOf(); try { await c.resume(); } catch (e) {}
      var buf = c.createBuffer(2, r.out.L.length, r.out.sr); buf.copyToChannel(r.out.L, 0); buf.copyToChannel(r.out.R, 1);
      var src = c.createBufferSource(), g = c.createGain(); g.gain.value = 0.9; src.buffer = buf; src.connect(g); g.connect(c.destination);
      PLAY = { src: src }; src.onended = function () { if (PLAY && PLAY.src === src) { PLAY = null; ST.playing = false; paint(); } };
      src.start(c.currentTime + 0.05); paint();
      return;
    }
    /* a beat: the Drum Machine's own pads, scheduled a little ahead while it plays */
    try { if (H.ready) await H.ready(); } catch (e) {}
    if (!ST.playing) return;
    var hc = H.ctx(), t0 = hc.currentTime + 0.12, tk = td.beat / 96, list = td.ev.slice().sort(function (a, b) { return a.t - b.t; }), at = 0;
    var P = PLAY = { timer: 0 };
    var pump = function () {
      if (PLAY !== P) return;
      var now = hc.currentTime;
      while (at < list.length && t0 + list[at].t * tk < now + 0.15) { var e = list[at++]; try { H.hit(e.p, e.v, t0 + e.t * tk); } catch (x) {} }
      if (at >= list.length && now > t0 + (list.length ? list[list.length - 1].t * tk : 0) + 0.4) { clearInterval(P.timer); PLAY = null; ST.playing = false; paint(); }
    };
    P.timer = setInterval(pump, 40); pump(); paint();
  }
  function stopPlay() {
    var P = PLAY; PLAY = null; ST.playing = false;
    if (!P) return;
    if (P.timer) clearInterval(P.timer);
    if (P.src) { try { P.src.onended = null; P.src.stop(); } catch (e) {} }
  }
  async function keep() {
    var td = tidied(); if (!td || ST.busy) return;
    stopPlay(); ST.busy = true; ST.msg = ""; paint();
    try {
      if (ST.res.kind === "tune") {
        if (!td.notes.length) throw new Error("empty");
        ST.msg = "making"; paintSay();
        var r = await renderTune(td);
        var n = window.AOGRecorder && AOGRecorder.adopt ? await AOGRecorder.adopt(r.out, r.ev, { bpm: tempo() }) : 0;
        if (!n) throw new Error("no recorder");
        ST.msg = inStudio() ? "kept" : "keptOwn"; ST.fill = { n: n }; ST.kept = "t" + n;
      } else {
        H.write(td.ev.map(function (e) { return { p: e.p, t: e.t, v: e.v }; }), td.bars);
        ST.msg = "keptB"; ST.fill = { bars: td.bars === 1 ? w("bars1") : w("barsN", { n: td.bars }) }; ST.long = td.dropped > 0; ST.kept = "b";
      }
    } catch (e) { ST.msg = "fail"; }
    ST.busy = false; paint();
  }

  /* ══ the Studio's hush, and a hidden page ══ */
  function hush(on) {
    if (!on) return;   /* awake again: nothing restarts by itself */
    if (REC) { if (ST.phase === "count" || ST.phase === "opening") stopRec("cancel"); else stopRec("away"); }
    else if (ST.phase === "opening") { ST.phase = ST.res ? "result" : "idle"; paint(); }
    if (PLAY || ST.playing) { stopPlay(); paint(); }
    try { if (C && C.state === "running") C.suspend(); } catch (e) {}
  }
  window.addEventListener("aog-hush", function (e) { hush(!!(e && e.detail && e.detail.on)); });
  D.addEventListener("visibilitychange", function () { if (D.hidden) hush(true); });
  window.addEventListener("pagehide", function () { hush(true); });

  /* ══ drawing it ══ */
  var CSS = [
    ".hm [hidden]{display:none!important}",
    ".hm{margin:0;border:1px solid #3a3e44;border-radius:14px;background:#141619;color:#ece6da}",
    ".hm>summary{min-height:52px;display:flex;align-items:center;gap:.55rem;padding:0 16px;cursor:pointer;list-style:none;font:800 1.02rem/1.2 var(--sans,system-ui,sans-serif);color:#f3efe6}",
    ".hm>summary::-webkit-details-marker{display:none}.hm>summary::before{content:'\\25B8';color:#f0c26e}.hm[open]>summary::before{content:'\\25BE'}",
    ".hm>summary:focus-visible{outline:3px solid #f0c26e;outline-offset:2px;border-radius:12px}",
    ".hm-in{padding:0 14px 16px;display:grid;gap:.7rem}",
    ".hm-line{margin:0;color:#e3dac9;line-height:1.45}.hm-quiet{color:#cfc6b6;font-size:.95rem}",
    ".hm-row{display:flex;flex-wrap:wrap;align-items:center;gap:.55rem}",
    ".hm-b{min-height:44px;border-radius:12px;border:1px solid #4a4f57;background:#24272c;color:#f3efe6;font:800 1rem/1.2 var(--sans,system-ui,sans-serif);padding:0 1rem;cursor:pointer;touch-action:manipulation}",
    ".hm-b:focus-visible{outline:3px solid #f0c26e;outline-offset:2px}.hm-b:disabled{opacity:.6;cursor:default}",
    ".hm-b.rec{border-color:#c4452a;color:#ffc2b8}.hm-b.rec[aria-pressed=true]{background:#5a1d14;color:#fff1ee}",
    ".hm-b.keep{border-color:#c99a3e;color:#ffe7b0}",
    ".hm-chk{display:inline-flex;align-items:center;gap:.5rem;min-height:44px;color:#e3dac9;font-weight:700}",
    ".hm-chk input{width:22px;height:22px;accent-color:#f0c26e}",
    ".hm-f{display:inline-flex;flex-wrap:wrap;align-items:center;gap:.5rem;color:#e3dac9;font-weight:700}",
    ".hm-f select{font-size:16px;min-height:44px;border-radius:10px;border:1px solid #4a4f57;background:#1c1f23;color:#f3efe6;padding:0 .6rem}",
    ".hm-say{margin:0;font-weight:700;color:#f1ebdf;line-height:1.4}.hm-say:empty{display:none}",
    ".hm-tidy{display:grid;gap:.4rem;padding:.6rem .8rem;border:1px solid #3a3e44;border-radius:12px;background:#17191c}",
    ".hm-h{margin:0;font:800 .95rem/1.2 var(--sans,system-ui,sans-serif);color:#f3efe6}",
    ".hm-roll{position:relative;height:150px;border:1px solid #3a3e44;border-radius:12px;background:#0f1012;overflow:hidden}",
    ".hm-roll.beat{height:132px}",
    ".hm-bl{position:absolute;top:0;bottom:0;border-left:1px dashed #3d4249}.hm-bl.bar{border-left:1px solid #6a707a}",
    ".hm-lane{position:absolute;left:0;right:0;border-top:1px solid #23262b}",
    ".hm-lab{position:absolute;left:4px;font:700 .72rem/1 var(--sans,system-ui,sans-serif);color:#d8cfbf;pointer-events:none}",
    ".hm-n{position:absolute;min-width:14px;border-radius:5px;border:1px solid #0c0d10;background:#e9dfc6;color:#1f1a10;font:800 .7rem/1 var(--sans,system-ui,sans-serif);padding:0 3px;overflow:hidden;white-space:nowrap;text-align:left;cursor:pointer}",
    ".hm-n.k{background:#f0c26e;color:#24180a}.hm-n.s{background:#9fd3e6;color:#0b1f27}.hm-n.h{background:#d9c8f2;color:#1d1430}",
    ".hm-n[aria-pressed=true]{outline:3px solid #f0c26e;outline-offset:1px}",
    ".hm-n:focus-visible{outline:3px solid #fff3d1;outline-offset:1px}",
    ".hm-fix{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;padding:.6rem .8rem;border:1px solid #3a3e44;border-radius:12px;background:#17191c;color:#f1ebdf;font-weight:700}",
    "@media print{.hm{display:none}}"
  ].join("\n");
  var BOX = null, BUILT = false;
  function mount() {
    var host = $("humBlk"); if (!host || BOX || !H) return;
    if (!$("hm-css")) { var st = D.createElement("style"); st.id = "hm-css"; st.textContent = CSS; D.head.appendChild(st); }
    host.innerHTML = '<details class="hm no-print" id="hmBox"><summary id="hmSum"></summary><div class="hm-in" id="hmIn"></div></details>';
    BOX = $("hmBox");
    BOX.addEventListener("toggle", function () { if (BOX.open) { build(); paint(); } else { if (REC) stopRec(ST.phase === "count" ? "cancel" : ""); stopPlay(); } });
    $("hmSum").textContent = w(beatRoom() ? "bsum" : "sum");
    var last = L();
    try { new MutationObserver(function () { if (L() !== last) { last = L(); $("hmSum").textContent = w(beatRoom() ? "bsum" : "sum"); if (BUILT) { BUILT = false; build(); paint(); } } }).observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
  }
  /* the inside is made the first time it is opened */
  function build() {
    if (BUILT) return; BUILT = true;
    var b = beatRoom(), inn = $("hmIn");
    var snapOpts = b ? [[24, "s16"], [48, "s8"], [0, "soff"]] : [[2, "s8"], [4, "s16"], [0, "soff"]];
    inn.innerHTML =
      '<p class="hm-line">' + esc(w(b ? "bintro" : "intro")) + '</p>' +
      '<p class="hm-line hm-quiet">' + esc(w("mic")) + '</p>' +
      '<div class="hm-row"><label class="hm-chk"><input type="checkbox" id="hmCount"> <span>' + esc(w("count")) + '</span></label></div>' +
      '<div class="hm-row"><button type="button" class="hm-b rec" id="hmRec" aria-pressed="false"></button>' +
      (b ? '<button type="button" class="hm-b" id="hmTeach"></button><button type="button" class="hm-b" id="hmForget"></button>' : "") + '</div>' +
      '<p class="hm-say" id="hmSay" aria-live="polite"></p>' +
      '<div id="hmRes" hidden>' +
        '<div class="hm-roll' + (b ? " beat" : "") + '" id="hmRoll" role="group" aria-label="' + esc(w(b ? "rollB" : "roll")) + '"></div>' +
        '<div class="hm-fix" id="hmFix" hidden></div>' +
        '<div class="hm-tidy"><p class="hm-h">' + esc(w("tidy")) + '</p>' +
          '<div class="hm-row"><label class="hm-f"><span>' + esc(w("snap")) + '</span><select id="hmSnap">' +
            snapOpts.map(function (o) { return '<option value="' + o[0] + '">' + esc(w(o[1])) + "</option>"; }).join("") + '</select></label></div>' +
          (b ? "" : '<div class="hm-row"><label class="hm-chk"><input type="checkbox" id="hmKey"> <span>' + esc(w("keyOn")) + '</span></label></div>' +
            '<p class="hm-line hm-quiet" id="hmKeyLine"></p>' +
            '<div class="hm-row"><button type="button" class="hm-b" id="hmLower">' + esc(w("lower")) + '</button><button type="button" class="hm-b" id="hmHigher">' + esc(w("higher")) + '</button></div>') +
        '</div>' +
        '<div class="hm-row"><button type="button" class="hm-b" id="hmHear"></button><button type="button" class="hm-b" id="hmAgain">' + esc(w("again")) + '</button>' +
          '<button type="button" class="hm-b keep" id="hmKeep">' + esc(w("keep")) + '</button></div>' +
      '</div>';
    $("hmCount").checked = !!PREF.count;
    $("hmCount").onchange = function () { PREF.count = $("hmCount").checked; savePref(); };
    $("hmRec").onclick = function () { if (REC) stopRec(""); else record(b ? "beat" : "tune"); };
    if (b) {
      $("hmTeach").onclick = function () { if (REC) stopRec(""); else record("teach"); };
      $("hmForget").onclick = function () { CAL = null; try { localStorage.removeItem("aog.hum.beatbox.v1"); } catch (e) {} ST.msg = "forgot"; ST.cache = null; paint(); };
    }
    var sn = $("hmSnap"); sn.value = String(b ? PREF.snapB : PREF.snap); if (sn.selectedIndex < 0) sn.selectedIndex = 0;
    sn.onchange = function () { if (b) PREF.snapB = +sn.value; else PREF.snap = +sn.value; savePref(); ST.cache = null; ST.kept = ""; ST.msg = ""; paint(); };
    if (!b) {
      $("hmKey").checked = !!PREF.key;
      $("hmKey").onchange = function () { PREF.key = $("hmKey").checked; savePref(); ST.cache = null; ST.kept = ""; ST.msg = ""; paint(); };
      $("hmLower").onclick = function () { ST.oct--; ST.cache = null; ST.kept = ""; ST.msg = ""; paint(); };
      $("hmHigher").onclick = function () { ST.oct++; ST.cache = null; ST.kept = ""; ST.msg = ""; paint(); };
    }
    $("hmHear").onclick = function () { hear(); };
    $("hmAgain").onclick = function () { stopPlay(); record(b ? "beat" : "tune"); };
    $("hmKeep").onclick = function () { keep(); };
    $("hmRoll").addEventListener("click", function (e) {
      var nb = e.target.closest && e.target.closest(".hm-n"); if (!nb) return;
      var i = +nb.getAttribute("data-i"); ST.sel = ST.sel === i ? null : i; paintRes();
    });
    $("hmFix").addEventListener("click", function (e) {
      var fb = e.target.closest && e.target.closest("[data-do]"); if (!fb || ST.sel == null) return;
      var d = fb.getAttribute("data-do"), ed = ST.edits[ST.sel] || (ST.edits[ST.sel] = {});
      if (d === "up") ed.st = (ed.st || 0) + 1; else if (d === "down") ed.st = (ed.st || 0) - 1; else if (d === "out") { ed.out = true; ST.sel = null; } else ed.k = d;
      ST.cache = null; ST.kept = ""; ST.msg = ""; paint();
    });
  }
  function sayText() {
    var p = ST.phase, b = beatRoom();
    if (p === "opening") return w("opening");
    if (p === "count") return w("ready", { n: ST.n || 4 });
    if (p === "listen") { var s = REC ? Math.floor((performance.now() - REC.t0) / 1000) : 0; return (REC && REC.kind === "teach" ? w("teachSay") + " " : "") + w("listen", { s: Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0") }); }
    if (p === "work") return w(ST.kind === "tune" ? "work" : "workB");
    var m = ST.msg ? w(ST.msg, ST.fill) + (ST.msg === "keptB" && ST.long ? w("longB") : "") : "";
    if (m) return m;
    if (p === "result" && ST.res) {
      var td = tidied(), n = td ? (td.notes || td.ev).length : 0;
      return ST.res.kind === "tune" ? (n === 1 ? w("got1") : w("got", { n: n })) : w("gotB", { n: n });
    }
    if (b && CAL) return w("mine");
    return "";
  }
  function paintSay() { var s = $("hmSay"); if (!s) return; var t = sayText(); if (s.textContent !== t) s.textContent = t; }
  function paint() {
    if (!BUILT) return;
    var rec = $("hmRec"), on = !!REC && REC.kind !== "teach", tb = $("hmTeach");
    rec.textContent = on ? w("stop") : w("rec"); rec.setAttribute("aria-pressed", on ? "true" : "false");
    rec.disabled = ST.busy || (!!REC && REC.kind === "teach") || ST.phase === "opening" && !REC;
    if (tb) { var tOn = !!REC && REC.kind === "teach"; tb.textContent = tOn ? w("stop") : w("teach"); tb.setAttribute("aria-pressed", tOn ? "true" : "false"); tb.disabled = ST.busy || (!!REC && !tOn); }
    var fg = $("hmForget"); if (fg) { fg.textContent = w("forget"); fg.hidden = !CAL || !!REC; }
    paintSay(); paintRes();
  }
  function paintRes() {
    var box = $("hmRes"); if (!box) return;
    var show = !!ST.res && !REC && ST.phase !== "work" && ST.phase !== "opening";
    box.hidden = !show; if (!show) return;
    var td = tidied(), b = ST.res.kind !== "tune", roll = $("hmRoll"), fix = $("hmFix");
    $("hmHear").textContent = ST.playing ? w("hearStop") : w("hear");
    $("hmHear").disabled = ST.busy; $("hmKeep").disabled = ST.busy || ST.playing; $("hmAgain").disabled = ST.busy;
    var beat = td.beat, list = b ? td.ev : td.notes, h = "";
    if (b) {
      var bars = td.bars, steps = bars * 16, lab = [w("kick"), w("snare"), w("hat")];
      for (var s = 0; s <= steps; s += 4) h += '<i class="hm-bl' + (s % 16 === 0 ? " bar" : "") + '" style="left:' + (s / steps * 100).toFixed(3) + '%"></i>';
      for (var r = 0; r < 3; r++) h += '<i class="hm-lane" style="top:' + (r * 44) + 'px"></i><span class="hm-lab" style="top:' + (r * 44 + 3) + 'px">' + esc(lab[r]) + "</span>";
      list.forEach(function (e) {
        var x = e.t / 24 / steps * 100;
        h += '<button type="button" class="hm-n ' + e.k + '" data-i="' + e.i + '" aria-pressed="' + (ST.sel === e.i) + '" aria-label="' + esc(lab[e.p] + ", " + where(e.t / 96, beat, true)) + '" style="left:calc(' + x.toFixed(3) + '% - 7px);top:' + (e.p * 44 + 16) + 'px;height:24px;width:14px"></button>';
      });
    } else {
      var end = list.reduce(function (a, n) { return Math.max(a, n.t + n.d); }, 0), barS = beat * 4, total = Math.max(barS, Math.ceil((end + 0.001) / barS) * barS);
      var lo = Infinity, hi = -Infinity; list.forEach(function (n) { lo = Math.min(lo, n.m); hi = Math.max(hi, n.m); });
      if (!isFinite(lo)) { lo = 60; hi = 72; } lo -= 1; hi += 1; var rows = hi - lo + 1, rh = Math.max(6, Math.min(22, 146 / rows));
      for (var bt = 0; bt * beat <= total + 1e-6; bt++) h += '<i class="hm-bl' + (bt % 4 === 0 ? " bar" : "") + '" style="left:' + (bt * beat / total * 100).toFixed(3) + '%"></i>';
      list.forEach(function (n) {
        var x = n.t / total * 100, wd = n.d / total * 100, top = (hi - n.m) * rh + (150 - rows * rh) / 2;
        h += '<button type="button" class="hm-n" data-i="' + n.i + '" aria-pressed="' + (ST.sel === n.i) + '" aria-label="' + esc(noteName(n.m) + ", " + where(n.t / beat, beat)) + '" style="left:' + x.toFixed(3) + '%;width:' + wd.toFixed(3) + '%;top:' + top.toFixed(1) + 'px;height:' + Math.max(14, rh).toFixed(1) + 'px">' + esc(noteName(n.m)) + "</button>";
      });
      var kl = $("hmKeyLine");
      if (kl) kl.textContent = td.key ? w(td.from === "song" ? "keySong" : "keyHum", { k: NM[L()][td.key.key] + " " + w(td.key.minor ? "minor" : "major") }) : "";
      var r0 = range(), mn = Infinity, mx = -Infinity; list.forEach(function (n) { mn = Math.min(mn, n.m); mx = Math.max(mx, n.m); });
      $("hmLower").disabled = !list.length || mn - 12 < r0[0]; $("hmHigher").disabled = !list.length || mx + 12 > r0[1];
    }
    if (roll.innerHTML !== h) roll.innerHTML = h;
    var sel = ST.sel != null ? list.filter(function (n) { return n.i === ST.sel; })[0] : null;
    if (!sel) { ST.sel = null; fix.hidden = true; fix.innerHTML = ""; return; }
    fix.hidden = false;
    fix.innerHTML = b
      ? '<span>' + esc(w("hitIs")) + '</span>' + ["k", "s", "h"].map(function (k) { return '<button type="button" class="hm-b" data-do="' + k + '" aria-pressed="' + (sel.k === k) + '">' + esc(w(k === "k" ? "kick" : k === "s" ? "snare" : "hat")) + "</button>"; }).join("") +
        '<button type="button" class="hm-b" data-do="out">' + esc(w("out")) + "</button>"
      : '<span>' + esc(w("noteIs", { n: noteName(sel.m) })) + '</span><button type="button" class="hm-b" data-do="up">' + esc(w("up")) + '</button><button type="button" class="hm-b" data-do="down">' + esc(w("down")) + '</button><button type="button" class="hm-b" data-do="out">' + esc(w("out")) + "</button>";
  }
  function where(beats, beat, fine) { var b = Math.floor(beats / 4) + 1, c = beats - (b - 1) * 4 + 1; return w("at", { b: b, c: fine ? (Math.round(c * 4) / 4) : Math.round(c * 100) / 100 }); }

  /* ── start ── */
  function attach(h) { H = h || null; if (!H) return; if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", mount); else mount(); }
  window.AOGHum = {
    attach: attach,
    /* the tests: their own sound in place of the microphone, the state, the tidied result, no Worker */
    test: {
      feed: function (kind, x, sr, origin) { if (!BUILT) { if (BOX) BOX.open = true; build(); } return heard(kind, x, sr, origin == null ? null : origin, ""); },
      state: function () { var td = tidied(); return { phase: ST.phase, msg: ST.msg, rec: !!REC, playing: ST.playing, busy: ST.busy, kept: ST.kept, sel: ST.sel, oct: ST.oct, cal: !!CAL,
        raw: ST.res ? ST.res.raw : null, origin: ST.res ? ST.res.origin : null, tidy: td, say: $("hmSay") ? $("hmSay").textContent : "", worker: !!WK, workerBad: WKBAD, ctx: C ? C.state + "@" + C.currentTime.toFixed(2) : "", tos: REC ? REC.tos.length : -1, D: REC ? REC.D : null }; },
      noWorker: function () { WKBAD = true; if (WK) { try { WK.terminate(); } catch (e) {} } WK = null; },
      tidyTune: tidyTune, tidyBeat: tidyBeat, kindOf: kindOf, detectKey: detectKey
    }
  };
  if (window.AOGHumRoom) attach(window.AOGHumRoom);
})();
