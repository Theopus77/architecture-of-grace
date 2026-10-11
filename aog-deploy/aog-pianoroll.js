/* AOG-PIANOROLL-V1 (2026-10-11) — Jimmy, a musician, picked this as the ceiling-breaker: "Record notes, not just sound. The
   Piano, Guitar, Bass and Band would also keep which notes you played. At the desk you could then fix a wrong note, change
   an instrument after recording, or tighten the timing (quantize) on a piano-roll. Real studios do it."

   A take from the Piano, the Guitar, the Bass or the Band carries its notes (aog-recorder.js, AOG-NOTES-V1). At the Mixing
   Desk such a clip shows "Edit the notes", which opens this editor over the desk:
   · a grid in bars and beats at the take's tempo (the song's), one row a note, the notes as bars, lighter when stronger;
   · tap a note to pick it (Shift or ⌘/Ctrl adds), drag it to move it, drag its right end to make it longer; tap an empty
     spot to add a note; drag a box on an empty spot (a mouse or a pen, or a finger with "Select an area" on) or Select all;
   · moves land on the beat, 1/8 or 1/16 (or anywhere), starting from the desk's Snap setting;
   · Delete, Strength (velocity) for the picked notes, Tighten the timing (quantize to 1/4, 1/8, 1/16 or 1/8 triplets, all
     the way or halfway), the pitch a half step or an octave up or down, Change the instrument (the room's own sounds),
     Undo and Redo inside the editor;
   · Play it with the changes: the room the take came from plays the notes again, offline, through its own chain
     (AOGStudioShell.renderNotes → AOGRoomRender), then Hear the new one / Hear the old one / Keep the new one / Keep the
     old one. Keeping replaces the clip's sound and keeps its place on the timeline; the notes are saved with the clip.
   · keys: the arrows move the picked notes (Shift: a bar or an octave), Delete removes them, ⌘/Ctrl+Z and ⌘/Ctrl+Y (or
     ⌘/Ctrl+Shift+Z) undo and redo, ⌘/Ctrl+A picks all, Escape lets go of the pick (then closes).
   Touch first: 44 px rows and buttons on a touch screen; the grid scrolls inside itself, never the page; nothing moves by
   itself. The notes' times are the take's (seconds from its first sample); the grid lines up each note's sound, so a note
   on the beat is heard on the beat (lag: the chain's own delay, measured when the take was made).

   AOGPianoRoll.open(host)   host: {lang(), clip(), name(), beatSec(clip), snap(), buffer(), render(room, payload),
                                    sounds(room), keep(out, notes), done()}
   AOGPianoRoll.clean(notes) → the notes, checked (a song file is read with it), or null
   AOGPianoRoll.renderHere(room, payload) → the room opened out of sight in this page, when there is no Studio around it */
(function () {
  "use strict";
  var W = {
    title: { en: "Edit the notes", es: "Editar las notas" },
    done: { en: "Done", es: "Listo" },
    say: { en: "Tap a note to pick it. Drag it to move it. Drag its right end to make it longer. Tap an empty spot to add a note.",
      es: "Toca una nota para elegirla. Arrástrala para moverla. Arrastra su extremo derecho para alargarla. Toca un espacio vacío para añadir una nota." },
    pick: { en: "Pick", es: "Elegir" },
    all: { en: "Select all", es: "Elegir todas" },
    box: { en: "Select an area", es: "Elegir una zona" },
    del: { en: "Delete", es: "Borrar" },
    undo: { en: "↶ Undo", es: "↶ Deshacer" },
    redo: { en: "↷ Redo", es: "↷ Rehacer" },
    vel: { en: "Strength", es: "Fuerza" },
    velAria: { en: "Strength of the picked notes", es: "Fuerza de las notas elegidas" },
    snap: { en: "Notes land on", es: "Las notas caen en" },
    snapBeat: { en: "the beat", es: "el pulso" },
    snapOff: { en: "anywhere", es: "cualquier sitio" },
    tight: { en: "Tighten the timing", es: "Ajustar el tiempo" },
    tightTo: { en: "Line up on", es: "Alinear a" },
    tightHow: { en: "How much", es: "Cuánto" },
    g4: { en: "1/4 (the beat)", es: "1/4 (el pulso)" },
    g3: { en: "1/8 triplet", es: "tresillo de 1/8" },
    full: { en: "All the way", es: "Del todo" },
    half: { en: "Halfway", es: "A medias" },
    pitch: { en: "Pitch", es: "Altura" },
    semiDn: { en: "Half step down", es: "Medio tono abajo" },
    semiUp: { en: "Half step up", es: "Medio tono arriba" },
    octDn: { en: "Octave down", es: "Octava abajo" },
    octUp: { en: "Octave up", es: "Octava arriba" },
    inst: { en: "Change the instrument", es: "Cambiar el instrumento" },
    zoomOut: { en: "Zoom out", es: "Alejar" },
    zoomIn: { en: "Zoom in", es: "Acercar" },
    play: { en: "Play it with the changes", es: "Tocarlo con los cambios" },
    making: { en: "Playing your notes on {room}…", es: "Tocando tus notas en {room}…" },
    ready: { en: "Ready. Hear it, then pick one.", es: "Listo. Escúchalo y elige uno." },
    hearNew: { en: "▶ Hear the new one", es: "▶ Escuchar la nueva" },
    hearOld: { en: "▶ Hear the old one", es: "▶ Escuchar la anterior" },
    stop: { en: "■ Stop", es: "■ Parar" },
    keepNew: { en: "Keep the new one", es: "Quedarme con la nueva" },
    keepOld: { en: "Keep the old one", es: "Quedarme con la anterior" },
    kept: { en: "The new one is on the track, in the same place.", es: "La nueva está en la pista, en el mismo sitio." },
    keptOld: { en: "The old one stays.", es: "La anterior se queda." },
    fail: { en: "That did not work. Try again.", es: "No funcionó. Inténtalo otra vez." },
    tightDone: { en: "{n} notes line up on {g} now.", es: "{n} notas se alinean a {g} ahora." },
    tightOne: { en: "1 note lines up on {g} now.", es: "1 nota se alinea a {g} ahora." },
    changed: { en: "Now {name}. Press Play it with the changes to hear it.", es: "Ahora {name}. Pulsa Tocarlo con los cambios para oírlo." },
    added: { en: "Note added.", es: "Nota añadida." },
    deleted: { en: "{n} notes deleted.", es: "{n} notas borradas." },
    deleted1: { en: "1 note deleted.", es: "1 nota borrada." },
    picked: { en: "{n} picked", es: "{n} elegidas" },
    picked1: { en: "1 picked", es: "1 elegida" },
    none: { en: "Nothing picked", es: "Nada elegido" },
    still: { en: "Your changes are still here.", es: "Tus cambios siguen aquí." },
    gridAria: { en: "The notes. The arrow keys move the picked notes; with Shift, a bar or an octave. Delete removes them.",
      es: "Las notas. Las flechas mueven las notas elegidas; con Mayúsculas, un compás o una octava. Suprimir las borra." },
    bar: { en: "Bar", es: "Compás" }
  };
  var ROOMW = { piano: { en: "the piano", es: "el piano" }, guitar: { en: "the guitar", es: "la guitarra" }, bass: { en: "the bass", es: "el bajo" }, band: { en: "the band", es: "la banda" } };
  var RANGE = { piano: [21, 108], guitar: [16, 100], bass: [16, 100], band: [20, 108] };
  var FILE = { piano: "/music-piano.html", guitar: "/music-guitar.html", bass: "/music-bass.html", band: "/music-band.html" };
  var NAMES = { en: ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"], es: ["Do", "Do♯", "Re", "Mi♭", "Mi", "Fa", "Fa♯", "Sol", "La♭", "La", "Si♭", "Si"] };
  var SNAPS = { beat: 1, "8": 0.5, "16": 0.25, off: 0 };
  var GRIDS = { "4": 1, "8": 0.5, "16": 0.25, "8t": 1 / 3 };
  var ZOOMS = [24, 36, 48, 64, 80, 96, 128, 160, 224];
  var KITS = ["bd", "sn", "roll", "tamb", "cy", "tri"];
  function r4(x) { return Math.round(x * 10000) / 10000; }
  function cl(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function num(x, a, b, d) { x = +x; return isFinite(x) ? cl(x, a, b) : d; }

  /* ── the notes, checked: what a song file or a saved song may hold ── */
  function cleanEv(e) {
    if (!e || typeof e !== "object") return null;
    var t = +e.t, m = +e.m, d = +e.d;
    if (!(t >= 0 && t < 3600) || !(m >= 0 && m <= 127) || !(d > 0 && d < 3600)) return null;
    var x = { t: r4(t), m: Math.round(m * 1000) / 1000, v: Math.round(num(e.v, 0, 1, 0.7) * 1000) / 1000, d: r4(d) };
    if (e.r === -1) x.r = -1; else if (+e.r > 0 && +e.r < 10) x.r = r4(+e.r);
    if (+e.k > 0 && +e.k < 3600) x.k = r4(+e.k);
    if (Number.isInteger(e.s) && e.s >= 0 && e.s < 12) x.s = e.s;
    if (e.o && typeof e.o === "object") { var o = {}; if (typeof e.o.art === "string" && /^[a-z]{1,12}$/.test(e.o.art)) o.art = e.o.art; if (e.o.soft) o.soft = true; if (e.o.pop) o.pop = true; if (Object.keys(o).length) x.o = o; }
    if (typeof e.p === "string" && /^[a-z_]{2,30}$/.test(e.p)) x.p = e.p;
    if (e.a === "stac") x.a = "stac";
    if (e.to != null && isFinite(+e.to)) { x.to = cl(+e.to, 0, 1); x.sd = num(e.sd, 0, 60, 0); }
    if (typeof e.kit === "string" && KITS.indexOf(e.kit) >= 0) { x.kit = e.kit; x.kd = num(e.kd, 0, 30, 0); }
    if ((typeof e.z === "string" && /^[\w.-]{1,80}$/.test(e.z)) || (Number.isInteger(e.z) && e.z >= 0)) x.z = e.z;
    if (typeof e.snd === "string" && /^[A-Za-z0-9_:.-]{1,40}$/.test(e.snd)) x.snd = e.snd;
    if (Number.isInteger(e.ck) && e.ck >= 0 && e.ck < 64) x.ck = e.ck;
    if (Number.isInteger(e.sl) && e.sl >= 0 && e.sl < 64) x.sl = e.sl;
    if (e.rl) x.rl = 1;
    if (Array.isArray(e.g)) { var g = []; e.g.slice(0, 600).forEach(function (q) { if (Array.isArray(q) && +q[0] >= 0 && +q[0] < 3600 && +q[1] >= 0 && +q[1] <= 140) g.push([r4(+q[0]), Math.round(+q[1] * 1000) / 1000]); }); if (g.length) x.g = g; }
    return x;
  }
  function cleanSet(s) {
    var o = {}; if (!s || typeof s !== "object") return o;
    if (typeof s.era === "number" && isFinite(s.era)) o.era = cl(s.era, 0, 1);
    if (typeof s.rigOf === "string" && /^[A-Za-z0-9_:.-]{1,40}$/.test(s.rigOf)) o.rigOf = s.rigOf;
    if (s.rig && typeof s.rig === "object") { try { var j = JSON.stringify(s.rig); if (j.length < 8000) o.rig = JSON.parse(j); } catch (e) {} }
    return o;
  }
  function clean(n) {
    if (!n || typeof n !== "object" || !Array.isArray(n.ev) || !RANGE[n.room]) return null;
    var ev = []; n.ev.slice(0, 5000).forEach(function (e) { var x = cleanEv(e); if (x) ev.push(x); });
    if (!ev.length) return null;
    ev.sort(function (a, b) { return a.t - b.t || a.m - b.m; });
    var ped = Array.isArray(n.ped) ? n.ped.slice(0, 2000).filter(function (p) { return p && +p.t >= 0 && +p.t < 3600; }).map(function (p) { return { t: r4(+p.t), on: p.on ? 1 : 0 }; }) : [];
    return { v: 1, room: n.room, sound: typeof n.sound === "string" && /^[A-Za-z0-9_:.-]{1,40}$/.test(n.sound) ? n.sound : "", set: cleanSet(n.set),
      space: Math.round(num(n.space, 0, 3, 0)), sr: Math.round(num(n.sr, 8000, 192000, 44100)), lag: r4(num(n.lag, 0, 0.05, 0)), ev: ev, ped: ped };
  }

  /* ── a room opened out of sight in this page (a desk on its own, with no Studio around it) ── */
  var HERE = {};
  function renderHere(room, payload, sounds) {
    var f = HERE[room];
    if (!f) { f = document.createElement("iframe"); f.hidden = true; f.setAttribute("aria-hidden", "true"); f.tabIndex = -1; f.src = FILE[room]; document.body.appendChild(f); HERE[room] = f; }
    return new Promise(function (ok, no) {
      var t0 = Date.now(), k = setInterval(function () {
        var w = null; try { w = f.contentWindow; } catch (e) {}
        if (w && w.AOGRoomRender && w.document.readyState === "complete") { clearInterval(k); Promise.resolve().then(function () { return sounds ? w.AOGRoomRender.sounds() : w.AOGRoomRender.render(payload); }).then(ok, no); }
        else if (Date.now() - t0 > 30000) { clearInterval(k); no(new Error("no room")); }
      }, 120);
    });
  }

  /* ── the editor ── */
  var CSS = [
    "html.apr-open,html.apr-open body{overflow:hidden!important}",
    ".apr{position:fixed;inset:0;z-index:9000;background:#121315;color:#efe5cf;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;font:500 1rem/1.4 -apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif}",
    ".apr[hidden]{display:none}",
    ".apr-in{max-width:1400px;margin:0 auto;padding:max(10px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(14px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));display:flex;flex-direction:column;gap:8px}",
    ".apr-top{display:flex;align-items:center;justify-content:space-between;gap:10px}",
    ".apr h2{margin:0;font:700 1.2rem/1.2 Georgia,\"Times New Roman\",serif;color:#f6eedb}",
    ".apr-say{margin:0;color:#d9cdb5;font-size:.95rem}",
    ".apr-line{margin:0;min-height:1.4em;color:#f0d9a6;font-weight:700}",
    ".apr-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px}",
    ".apr-grp{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:4px 8px 4px 4px;border:1px solid #2e3035;border-radius:14px;background:#1b1c20}",
    ".apr-lab{font-size:.8rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#cbbd9f;padding:0 4px}",
    ".apr-b{min-height:44px;min-width:44px;padding:0 .9rem;border-radius:12px;border:1px solid #07080a;background:linear-gradient(#3a3e44,#1f2226);color:#f6efe2;font:800 .95rem/1.15 inherit;cursor:pointer;touch-action:manipulation}",
    ".apr-b:disabled{opacity:.55;cursor:default}",
    ".apr-b[aria-pressed=\"true\"]{background:linear-gradient(#f0c26e,#c99a3e);color:#1d1608;border-color:#7a5a1e}",
    ".apr-b.go{background:linear-gradient(#f0c26e,#c99a3e);color:#1d1608;border-color:#7a5a1e}",
    ".apr-b:focus-visible,.apr select:focus-visible,.apr input:focus-visible,.apr-scroll:focus-visible{outline:3px solid #f0c26e;outline-offset:2px}",
    ".apr select{min-height:44px;font:700 16px/1.2 inherit;color:#f6efe2;background:#26282d;border:1px solid #4a4d55;border-radius:10px;padding:0 .5rem;max-width:100%}",
    ".apr input[type=range]{width:9rem;min-height:44px;accent-color:#f0c26e}",
    ".apr output{min-width:2.2rem;font-weight:800;color:#f6efe2;font-variant-numeric:tabular-nums}",
    ".apr-roll{position:relative;border:1px solid #2e3035;border-radius:14px;background:#0d0e10;height:clamp(240px,56vh,680px);overflow:hidden}",
    ".apr-scroll{position:absolute;inset:0;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y}",
    ".apr-scroll.boxing{touch-action:none}",
    ".apr-cv{position:relative;display:grid;grid-template-columns:56px auto;grid-template-rows:30px auto}",
    ".apr-keys{position:sticky;left:0;z-index:3;grid-column:1;grid-row:2;width:56px;background:#17181b;border-right:1px solid #33353b}",
    ".apr-keys div{box-sizing:border-box;height:var(--row);display:flex;align-items:center;padding-left:6px;font:700 .8rem/1 inherit;color:#e9dfca;border-bottom:1px solid #222327}",
    ".apr-keys div.blk{background:#0f1012;color:#d4c8ae}",
    ".apr-head{position:sticky;top:0;z-index:4;grid-column:2;grid-row:1;height:30px;background:#17181b;border-bottom:1px solid #33353b}",
    ".apr-head span{position:absolute;top:0;height:30px;display:flex;align-items:center;padding-left:5px;font:800 .8rem/1 inherit;color:#e9dfca;border-left:1px solid #5d5240}",
    ".apr-corner{position:sticky;left:0;top:0;z-index:5;grid-column:1;grid-row:1;width:56px;height:30px;background:#17181b;border-right:1px solid #33353b;border-bottom:1px solid #33353b}",
    ".apr-lane{position:relative;grid-column:2;grid-row:2}",
    ".apr-n{position:absolute;box-sizing:border-box;border-radius:6px;border:1px solid #2a1d06;touch-action:none;cursor:grab}",
    ".apr-n::after{content:\"\";position:absolute;right:0;top:15%;bottom:15%;width:4px;border-radius:2px;background:rgba(29,22,8,.55)}",
    ".apr-n.sel{border:2px solid #f6efe2;box-shadow:0 0 0 2px #1d6fb8}",
    ".apr-n.kit{border-radius:50%/40%}",
    ".apr-box{position:absolute;border:2px dashed #f0c26e;background:rgba(240,194,110,.12);pointer-events:none}",
    ".apr-box[hidden]{display:none}",
    "@media (max-width:699px){.apr-grp{padding:3px}.apr-b{padding:0 .65rem}.apr input[type=range]{width:7rem}}"
  ].join("\n");
  var D = document, ST = null, DRAFT = {}, styled = false, UID = 1;
  function L() { return ST && ST.host.lang() === "es" ? "es" : "en"; }
  function w(k, vars) { var s = (W[k] || {})[L()] || k; if (vars) Object.keys(vars).forEach(function (v) { s = s.split("{" + v + "}").join(vars[v]); }); return s; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function coarse() { try { return matchMedia("(pointer: coarse)").matches; } catch (e) { return false; } }
  function noteName(m) { var k = Math.round(m); return NAMES[L()][((k % 12) + 12) % 12] + (Math.floor(k / 12) - 1); }
  function style() { if (styled) return; styled = true; var s = D.createElement("style"); s.id = "aog-pianoroll-css"; s.textContent = CSS; D.head.appendChild(s); }

  /* time: a note's sound on the take's own beats (the clip's music starts at head; lag is the chain's delay) */
  function bOf(e) { return (e.t + ST.lag - ST.head) / ST.B; }
  function tOf(b) { return ST.head + b * ST.B - ST.lag; }
  function step() { return SNAPS[ST.snap] || 0; }
  function snapB(b) { var g = step(); return g ? Math.round(b / g) * g : b; }
  function ids() { return ST.ev.filter(function (e) { return ST.sel.has(e.id); }); }
  function snapshot() { return JSON.stringify({ ev: ST.ev, sound: ST.sound }); }
  function remember() { ST.undo.push(snapshot()); if (ST.undo.length > 100) ST.undo.shift(); ST.redo.length = 0; ST.fresh = null; }
  function restore(j) { var o = JSON.parse(j); ST.ev = o.ev; ST.sound = o.sound; ST.sel = new Set(Array.from(ST.sel).filter(function (id) { return ST.ev.some(function (e) { return e.id === id; }); })); }
  function undo() { if (!ST.undo.length) return; ST.redo.push(snapshot()); restore(ST.undo.pop()); ST.fresh = null; changed(); }
  function redo() { if (!ST.redo.length) return; ST.undo.push(snapshot()); restore(ST.redo.pop()); ST.fresh = null; changed(); }
  function changed(msg) { ST.dirty = true; saveDraft(); if (msg != null) ST.msg = msg; paint(); }
  /* changes not kept yet wait here (in this page's memory) for the next time the editor opens on this clip */
  function saveDraft() { var c = ST.host.clip(); if (!c) return; if (ST.dirty) DRAFT[c.id] = { ev: ST.ev, sound: ST.sound, undo: ST.undo, redo: ST.redo }; else delete DRAFT[c.id]; }

  function open(host) {
    var c = host.clip(); if (!c || !c.notes) return false;
    var N = clean(c.notes); if (!N) return false;
    style();
    var d = DRAFT[c.id], snapOn = !!host.snap();
    ST = { host: host, N: N, room: N.room, B: host.beatSec(c), head: +c.head || 0, lag: N.lag || 0, bpb: c.bpb || 4,
      ev: d ? d.ev : N.ev.map(function (e) { return Object.assign({ id: UID++ }, e); }), sound: d ? d.sound : N.sound,
      undo: d ? d.undo : [], redo: d ? d.redo : [], sel: new Set(), snap: snapOn ? "16" : "off", grid: "8", amt: 1,
      ppb: coarse() ? 96 : 80, row: coarse() ? 44 : 30, msg: "", fresh: null, hearing: "", sounds: null, boxMode: false, lo: 0, hi: 0, b0: 0, b1: 0, dirty: !!d };
    if (d) ST.msg = w("still");
    if (!(ST.B > 0)) ST.B = 0.5;
    build();
    range(true); paint();
    host.sounds(ST.room).then(function (list) { if (ST && Array.isArray(list)) { ST.sounds = list; paintInst(); } }, function () {});
    var sc = D.getElementById("aprScroll");
    /* the first note in view */
    var first = ST.ev[0]; if (first) sc.scrollLeft = Math.max(0, (bOf(first) - ST.b0) * ST.ppb - 40);
    if (first) { var lo = Math.min.apply(null, ST.ev.map(function (e) { return e.m; })), hi = Math.max.apply(null, ST.ev.map(function (e) { return e.m; })); sc.scrollTop = Math.max(0, ((ST.hi - (lo + hi) / 2)) * ST.row - sc.clientHeight / 2); }
    D.documentElement.classList.add("apr-open");
    /* the desk behind waits: nothing there takes a tap or the keyboard until Done */
    ST.inert = Array.prototype.filter.call(D.body.children, function (el) { return el.id !== "apr" && !el.inert && el.tagName !== "SCRIPT"; });
    ST.inert.forEach(function (el) { el.inert = true; });
    try { D.getElementById("aprDone").focus(); } catch (e) {}
    return true;
  }
  function close() {
    if (!ST) return;
    hearStop(); saveDraft();
    var host = ST.host, box = D.getElementById("apr"); if (box) box.parentNode.removeChild(box);
    (ST.inert || []).forEach(function (el) { el.inert = false; });
    D.documentElement.classList.remove("apr-open");
    D.removeEventListener("keydown", docKey, true);
    ST = null;
    try { host.done(); } catch (e) {}
  }
  /* the pitch rows and the bars on show: everything played, two octaves at least, never shrinking while open */
  function range(first) {
    var R = RANGE[ST.room] || [0, 127], ms = ST.ev.filter(function (e) { return !e.kit; }).map(function (e) { return e.m; }).concat(ST.ev.filter(function (e) { return e.kit; }).map(function (e) { return e.m; }));
    var lo = ms.length ? Math.min.apply(null, ms) - 3 : 55, hi = ms.length ? Math.max.apply(null, ms) + 3 : 79;
    if (hi - lo < 24) { var mid = (hi + lo) / 2; lo = Math.round(mid - 12); hi = lo + 24; }
    lo = Math.max(Math.min(R[0], 20), Math.floor(lo)); hi = Math.min(Math.max(R[1], 108), Math.ceil(hi));
    if (!first) { lo = Math.min(lo, ST.lo); hi = Math.max(hi, ST.hi); }
    var bs = ST.ev.map(bOf), ends = ST.ev.map(function (e) { return bOf(e) + e.d / ST.B; }), c = ST.host.clip();
    var b0 = Math.min(0, Math.floor(bs.length ? Math.min.apply(null, bs) : 0)), b1 = Math.max(ends.length ? Math.max.apply(null, ends) : 4, (c ? c.sec - ST.head : 0) / ST.B) + ST.bpb;
    b0 = Math.min(-1, Math.floor(b0)); b1 = Math.ceil(b1 / ST.bpb) * ST.bpb;   /* a beat of room before the first, to start a box or add a note */
    if (!first) { b0 = Math.min(b0, ST.b0); b1 = Math.max(b1, ST.b1); }
    ST.lo = lo; ST.hi = hi; ST.b0 = b0; ST.b1 = b1;
  }
  function opt(v, label, cur) { return '<option value="' + v + '"' + (String(v) === String(cur) ? " selected" : "") + ">" + esc(label) + "</option>"; }
  function build() {
    var old = D.getElementById("apr"); if (old) old.parentNode.removeChild(old);
    var box = D.createElement("div"); box.id = "apr"; box.className = "apr"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-labelledby", "aprH");
    box.innerHTML =
      '<div class="apr-in">' +
      '<div class="apr-top"><h2 id="aprH"></h2><button type="button" class="apr-b" id="aprDone" data-a="done"></button></div>' +
      '<p class="apr-say" id="aprSay"></p>' +
      '<div class="apr-bar">' +
        '<div class="apr-grp" role="group" id="aprPickG"><span class="apr-lab" id="aprPickL"></span><button type="button" class="apr-b" data-a="all" id="aprAll"></button><button type="button" class="apr-b" data-a="box" id="aprBox" aria-pressed="false"></button><button type="button" class="apr-b" data-a="del" id="aprDel"></button><button type="button" class="apr-b" data-a="undo" id="aprUndo"></button><button type="button" class="apr-b" data-a="redo" id="aprRedo"></button><output id="aprCount"></output></div>' +
        '<div class="apr-grp"><label class="apr-lab" for="aprVel" id="aprVelL"></label><input type="range" id="aprVel" min="5" max="100" step="1" value="70"><output id="aprVelO" for="aprVel"></output></div>' +
        '<div class="apr-grp"><label class="apr-lab" for="aprSnap" id="aprSnapL"></label><select id="aprSnap"></select></div>' +
        '<div class="apr-grp"><span class="apr-lab" id="aprTightL"></span><label class="apr-lab" for="aprGrid" id="aprGridL"></label><select id="aprGrid"></select><label class="apr-lab" for="aprAmt" id="aprAmtL"></label><select id="aprAmt"></select><button type="button" class="apr-b" data-a="tight" id="aprTight"></button></div>' +
        '<div class="apr-grp" role="group" id="aprPitchG"><span class="apr-lab" id="aprPitchL"></span><button type="button" class="apr-b" data-a="p-1" id="aprP1"></button><button type="button" class="apr-b" data-a="p+1" id="aprP2"></button><button type="button" class="apr-b" data-a="p-12" id="aprP3"></button><button type="button" class="apr-b" data-a="p+12" id="aprP4"></button></div>' +
        '<div class="apr-grp"><label class="apr-lab" for="aprInst" id="aprInstL"></label><select id="aprInst"></select></div>' +
        '<div class="apr-grp" role="group" id="aprZoomG"><button type="button" class="apr-b" data-a="z-" id="aprZo"></button><button type="button" class="apr-b" data-a="z+" id="aprZi"></button></div>' +
      '</div>' +
      "</div>";
    /* the notes come first (the creative surface), then what to do with them, then the tools */
    var inner = box.firstChild, tools = inner.querySelector(".apr-bar"), say = inner.querySelector("#aprSay");
    say.insertAdjacentHTML("afterend",
      '<div class="apr-roll"><div class="apr-scroll" id="aprScroll" tabindex="0" role="application"><div class="apr-cv" id="aprCv"><div class="apr-corner"></div><div class="apr-head" id="aprHead"></div><div class="apr-keys" id="aprKeys"></div><div class="apr-lane" id="aprLane"><div class="apr-box" id="aprBoxR" hidden></div></div></div></div></div>' +
      '<div class="apr-bar" id="aprOut"><button type="button" class="apr-b go" data-a="play" id="aprPlay"></button><button type="button" class="apr-b" data-a="hearNew" id="aprHearNew" hidden></button><button type="button" class="apr-b" data-a="hearOld" id="aprHearOld"></button><button type="button" class="apr-b go" data-a="keepNew" id="aprKeepNew" hidden></button><button type="button" class="apr-b" data-a="keepOld" id="aprKeepOld" hidden></button></div>' +
      '<p class="apr-line" id="aprLine" aria-live="polite"></p>');
    inner.appendChild(tools);
    D.body.appendChild(box);
    box.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-a]"); if (!b || b.disabled || !ST) return; act(b.getAttribute("data-a")); });
    box.addEventListener("keydown", key);
    D.addEventListener("keydown", docKey, true);
    var vel = D.getElementById("aprVel");
    vel.addEventListener("input", function () { D.getElementById("aprVelO").textContent = vel.value; if (!ST.velT) { remember(); ST.velT = 1; } ids().forEach(function (e) { e.v = +vel.value / 100; }); paintNotes(); });
    vel.addEventListener("change", function () { ST.velT = 0; changed(); });
    D.getElementById("aprSnap").addEventListener("change", function () { ST.snap = this.value; });
    D.getElementById("aprGrid").addEventListener("change", function () { ST.grid = this.value; });
    D.getElementById("aprAmt").addEventListener("change", function () { ST.amt = +this.value || 1; });
    D.getElementById("aprInst").addEventListener("change", function () { setSound(this.value); });
    bindLane();
  }
  function words() {
    var c = ST.host.clip();
    D.getElementById("aprH").textContent = w("title") + (c ? " · " + ST.host.name() : "");
    var set = function (id, k) { var el = D.getElementById(id); if (el && el.textContent !== w(k)) el.textContent = w(k); };
    set("aprDone", "done"); set("aprSay", "say"); set("aprPickL", "pick"); set("aprAll", "all"); set("aprBox", "box"); set("aprDel", "del"); set("aprUndo", "undo"); set("aprRedo", "redo");
    set("aprVelL", "vel"); set("aprSnapL", "snap"); set("aprTightL", "tight"); set("aprGridL", "tightTo"); set("aprAmtL", "tightHow"); set("aprTight", "tight");
    set("aprPitchL", "pitch"); set("aprP1", "semiDn"); set("aprP2", "semiUp"); set("aprP3", "octDn"); set("aprP4", "octUp"); set("aprInstL", "inst");
    set("aprZo", "zoomOut"); set("aprZi", "zoomIn"); set("aprPlay", "play"); set("aprHearNew", ST.hearing === "new" ? "stop" : "hearNew"); set("aprHearOld", ST.hearing === "old" ? "stop" : "hearOld");
    set("aprKeepNew", "keepNew"); set("aprKeepOld", "keepOld");
    D.getElementById("aprVel").setAttribute("aria-label", w("velAria"));
    D.getElementById("aprPickG").setAttribute("aria-label", w("pick")); D.getElementById("aprPitchG").setAttribute("aria-label", w("pitch"));
    D.getElementById("aprZoomG").setAttribute("aria-label", w("zoomIn") + " / " + w("zoomOut"));
    D.getElementById("aprScroll").setAttribute("aria-label", w("gridAria"));
    var sn = D.getElementById("aprSnap"), sg = L() + ST.snap;
    if (sn.getAttribute("data-k") !== sg) { sn.innerHTML = opt("beat", w("snapBeat"), ST.snap) + opt("8", "1/8", ST.snap) + opt("16", "1/16", ST.snap) + opt("off", w("snapOff"), ST.snap); sn.setAttribute("data-k", sg); }
    var gr = D.getElementById("aprGrid"), gg = L() + ST.grid;
    if (gr.getAttribute("data-k") !== gg) { gr.innerHTML = opt("4", w("g4"), ST.grid) + opt("8", "1/8", ST.grid) + opt("16", "1/16", ST.grid) + opt("8t", w("g3"), ST.grid); gr.setAttribute("data-k", gg); }
    var am = D.getElementById("aprAmt"), ag = L() + ST.amt;
    if (am.getAttribute("data-k") !== ag) { am.innerHTML = opt(1, w("full"), ST.amt) + opt(0.5, w("half"), ST.amt); am.setAttribute("data-k", ag); }
    paintInst();
  }
  function soundName(id) { var s = (ST.sounds || []).find(function (x) { return x.id === id; }); return s ? (s.name[L()] || s.name.en || id) : id; }
  function paintInst() {
    if (!ST) return;
    var el = D.getElementById("aprInst"); if (!el) return;
    var list = ST.sounds || [{ id: ST.sound, name: { en: ST.sound, es: ST.sound } }], k = L() + ST.sound + list.length;
    if (el.getAttribute("data-k") === k) return;
    el.innerHTML = list.map(function (s) { return opt(s.id, s.name[L()] || s.name.en || s.id, ST.sound); }).join(""); el.setAttribute("data-k", k);
  }
  function paint() {
    if (!ST) return;
    range(false); words();
    var cv = D.getElementById("aprCv"), lane = D.getElementById("aprLane"), keys = D.getElementById("aprKeys"), head = D.getElementById("aprHead");
    var scr = D.getElementById("aprScroll"), fill = Math.max(0, (scr ? scr.clientWidth : 0) - 56);
    if ((ST.b1 - ST.b0) * ST.ppb < fill) ST.b1 = ST.b0 + Math.ceil(fill / ST.ppb / ST.bpb) * ST.bpb;   /* the bars fill the view */
    var rows = ST.hi - ST.lo + 1, W0 = (ST.b1 - ST.b0) * ST.ppb, H = rows * ST.row;
    cv.style.setProperty("--row", ST.row + "px");
    cv.style.width = (W0 + 56) + "px";
    lane.style.width = W0 + "px"; lane.style.height = H + "px";
    head.style.width = W0 + "px";
    /* the rows (the black keys darker) and the beats (the bar lines brighter), drawn by the lane's own background */
    var stops = [], blk = [1, 3, 6, 8, 10];
    for (var r = 0; r < 12; r++) { var m = ST.hi - r, isB = blk.indexOf(((m % 12) + 12) % 12) >= 0, c1 = isB ? "#141518" : "#1c1d21";
      stops.push(c1 + " " + (r * ST.row) + "px", c1 + " " + ((r + 1) * ST.row - 1) + "px", "#26272b " + ((r + 1) * ST.row - 1) + "px", "#26272b " + ((r + 1) * ST.row) + "px"); }
    var bar = ST.bpb * ST.ppb, off = ((-ST.b0 * ST.ppb) % bar + bar) % bar;
    lane.style.backgroundImage = "linear-gradient(to right, #6d5f45 0, #6d5f45 2px, transparent 2px), linear-gradient(to right, #34363c 0, #34363c 1px, transparent 1px), linear-gradient(to bottom," + stops.join(",") + ")";
    lane.style.backgroundSize = bar + "px 100%, " + ST.ppb + "px 100%, 100% " + (12 * ST.row) + "px";
    lane.style.backgroundPosition = off + "px 0, 0 0, 0 0";
    var kh = ""; for (var mm = ST.hi; mm >= ST.lo; mm--) kh += '<div class="' + (blk.indexOf(((mm % 12) + 12) % 12) >= 0 ? "blk" : "") + '">' + esc(noteName(mm)) + "</div>";
    keys.innerHTML = kh;
    var first = ST.host.firstBar ? ST.host.firstBar() : 1, hh = "";
    for (var b = Math.ceil(ST.b0 / ST.bpb) * ST.bpb; b < ST.b1; b += ST.bpb) { var n = Math.round(b / ST.bpb) + first; hh += '<span style="left:' + ((b - ST.b0) * ST.ppb) + "px;width:" + bar + 'px" aria-label="' + esc(w("bar") + " " + n) + '">' + n + "</span>"; }
    head.innerHTML = hh;
    paintNotes(); paintTools();
  }
  function noteColor(e) {
    if (e.kit) return "rgb(" + Math.round(120 + 70 * e.v) + "," + Math.round(160 + 50 * e.v) + "," + Math.round(120 + 40 * e.v) + ")";
    var v = cl(e.v, 0, 1); return "rgb(" + Math.round(150 + 100 * v) + "," + Math.round(105 + 90 * v) + "," + Math.round(40 + 70 * v) + ")";
  }
  function place(el, e) {
    el.style.left = ((bOf(e) - ST.b0) * ST.ppb) + "px"; el.style.top = ((ST.hi - Math.round(e.m)) * ST.row + 2) + "px";
    el.style.width = Math.max(8, e.d / ST.B * ST.ppb) + "px"; el.style.height = (ST.row - 4) + "px"; el.style.background = noteColor(e);
  }
  function paintNotes() {
    var lane = D.getElementById("aprLane"); if (!lane) return;
    var have = {}; Array.prototype.forEach.call(lane.querySelectorAll(".apr-n"), function (el) { have[el.getAttribute("data-id")] = el; });
    ST.ev.forEach(function (e) {
      var el = have[e.id]; delete have[e.id];
      if (!el) { el = D.createElement("div"); el.className = "apr-n"; el.setAttribute("data-id", e.id); lane.appendChild(el); }
      el.classList.toggle("sel", ST.sel.has(e.id)); el.classList.toggle("kit", !!e.kit);
      place(el, e);
    });
    Object.keys(have).forEach(function (k) { have[k].parentNode.removeChild(have[k]); });
  }
  function paintTools() {
    var n = ST.sel.size, any = ST.ev.length > 0;
    D.getElementById("aprDel").disabled = !n;
    D.getElementById("aprUndo").disabled = !ST.undo.length; D.getElementById("aprRedo").disabled = !ST.redo.length;
    D.getElementById("aprAll").disabled = !any;
    D.getElementById("aprCount").textContent = n === 0 ? w("none") : n === 1 ? w("picked1") : w("picked", { n: n });
    var vel = D.getElementById("aprVel"), s = ids();
    vel.disabled = !n;
    if (n && !ST.velT) { var avg = s.reduce(function (a, e) { return a + e.v; }, 0) / n; vel.value = String(Math.round(avg * 100)); }
    D.getElementById("aprVelO").textContent = n ? vel.value : "—";
    D.getElementById("aprBox").setAttribute("aria-pressed", ST.boxMode ? "true" : "false");
    D.getElementById("aprScroll").classList.toggle("boxing", ST.boxMode);
    ["aprP1", "aprP2", "aprP3", "aprP4", "aprTight"].forEach(function (id) { D.getElementById(id).disabled = !any; });
    var fresh = !!ST.fresh;
    D.getElementById("aprHearNew").hidden = !fresh; D.getElementById("aprKeepNew").hidden = !fresh; D.getElementById("aprKeepOld").hidden = !fresh;
    D.getElementById("aprPlay").disabled = !!ST.busy || !any;
    var line = D.getElementById("aprLine"); if (line.textContent !== (ST.msg || "")) line.textContent = ST.msg || "";
  }

  /* ── what the buttons do ── */
  function act(a) {
    if (a === "done") { close(); return; }
    if (a === "all") { ST.sel = new Set(ST.ev.map(function (e) { return e.id; })); ST.msg = ""; paint(); return; }
    if (a === "box") { ST.boxMode = !ST.boxMode; paintTools(); return; }
    if (a === "del") { del(); return; }
    if (a === "undo") { undo(); return; }
    if (a === "redo") { redo(); return; }
    if (a === "tight") { tighten(); return; }
    if (/^p[+-]\d+$/.test(a)) { transpose(+a.slice(1)); return; }
    if (a === "z-" || a === "z+") { zoom(a === "z+" ? 1 : -1); return; }
    if (a === "play") { playChanges(); return; }
    if (a === "hearNew" || a === "hearOld") { hear(a === "hearNew" ? "new" : "old"); return; }
    if (a === "keepNew") { keepNew(); return; }
    if (a === "keepOld") { hearStop(); ST.fresh = null; ST.msg = w("keptOld"); paint(); return; }
  }
  function targets() { var s = ids(); return s.length ? s : ST.ev; }
  function del() {
    var n = ST.sel.size; if (!n) return;
    remember(); ST.ev = ST.ev.filter(function (e) { return !ST.sel.has(e.id); }); ST.sel.clear();
    changed(n === 1 ? w("deleted1") : w("deleted", { n: n }));
  }
  /* Tighten the timing: each note's sound moved toward the nearest line of the grid (all the way, or halfway) */
  function tighten() {
    var g = GRIDS[ST.grid] || 0.5, list = targets(); if (!list.length) return;
    remember();
    list.forEach(function (e) { var b = bOf(e), q = Math.round(b / g) * g, nb = b + (q - b) * ST.amt; e.t = r4(Math.max(0, tOf(nb))); delete e.z; });
    var gname = ST.grid === "4" ? w("g4") : ST.grid === "8t" ? w("g3") : "1/" + ST.grid;
    changed(list.length === 1 ? w("tightOne", { g: gname }) : w("tightDone", { n: list.length, g: gname }));
  }
  function transpose(d) {
    var R = RANGE[ST.room] || [0, 127], list = targets().filter(function (e) { return !e.kit; }); if (!list.length) return;
    if (list.some(function (e) { return e.m + d < R[0] || e.m + d > R[1]; })) return;
    remember();
    list.forEach(function (e) { e.m = e.m + d; delete e.z; if (e.g) e.g = e.g.map(function (q) { return [q[0], q[1] + d]; }); });
    changed("");
  }
  function setSound(id) {
    if (!id || id === ST.sound) return;
    remember(); ST.sound = id; ST.ev.forEach(function (e) { delete e.snd; delete e.z; });
    changed(w("changed", { name: soundName(id) }));
  }
  function zoom(d) {
    var sc = D.getElementById("aprScroll"), k = ZOOMS.indexOf(ST.ppb); if (k < 0) k = 4;
    var nk = cl(k + d, 0, ZOOMS.length - 1); if (nk === k) return;
    var mid = (sc.scrollLeft + sc.clientWidth / 2 - 56) / ST.ppb; ST.ppb = ZOOMS[nk]; paint();
    sc.scrollLeft = Math.max(0, mid * ST.ppb - sc.clientWidth / 2 + 56);
  }
  /* move the picked notes (by keys): db beats, dm semitones */
  function nudge(db, dm) {
    var list = ids(); if (!list.length) return;
    var R = RANGE[ST.room] || [0, 127];
    if (dm && list.some(function (e) { return !e.kit && (e.m + dm < R[0] || e.m + dm > R[1]); })) return;
    remember();
    list.forEach(function (e) { if (db) { e.t = r4(Math.max(0, tOf(bOf(e) + db))); } if (dm && !e.kit) { e.m += dm; delete e.z; if (e.g) e.g = e.g.map(function (q) { return [q[0], q[1] + dm]; }); } });
    changed("");
  }
  function exportEv() {
    return ST.ev.slice().sort(function (a, b) { return a.t - b.t || a.m - b.m; }).map(function (e) { var o = Object.assign({}, e); delete o.id; return o; });
  }
  function payload() {
    var c = ST.host.clip(), ev = exportEv(), end = 0;
    ev.forEach(function (e) { end = Math.max(end, e.t + e.d); });
    return { sound: ST.sound, was: ST.N.sound, events: ev, sec: Math.max(c ? c.sec : 0, end + 1), tail: 0, set: ST.N.set, space: ST.N.space, sr: ST.N.sr };
  }
  function playChanges() {
    if (ST.busy) return;
    hearStop();
    var my = ST, p = payload();
    ST.busy = true; ST.msg = w("making", { room: (ROOMW[ST.room] || ROOMW.piano)[L()] }); paintTools();
    Promise.resolve().then(function () { return my.host.render(my.room, p); }).then(function (out) {
      if (ST !== my) return;
      ST.busy = false;
      if (!out || !out.L || !out.L.length) throw new Error("silent");
      ST.fresh = { out: out, ev: p.events, sound: p.sound };
      ST.msg = w("ready"); paint();
      try { D.getElementById("aprHearNew").focus(); } catch (e) {}
    }).catch(function (e) { if (ST !== my) return; ST.busy = false; ST.err = String(e && e.message || e); ST.msg = w("fail"); paintTools(); });
  }
  function keepNew() {
    var f = ST.fresh; if (!f) return;
    hearStop();
    var my = ST, notes = Object.assign({}, ST.N, { sound: f.sound, ev: f.ev });
    ST.busy = true; paintTools();
    Promise.resolve().then(function () { return my.host.keep(f.out, notes); }).then(function () {
      if (ST !== my) return;
      ST.busy = false; ST.fresh = null; ST.N = clean(notes) || ST.N;
      var c = ST.host.clip(); if (c) delete DRAFT[c.id];
      ST.dirty = false; ST.msg = w("kept"); paint(); saveDraft();
    }).catch(function () { if (ST !== my) return; ST.busy = false; ST.msg = w("fail"); paintTools(); });
  }
  /* hearing the old and the new one: a player of the editor's own, started by a tap, stopped by the next */
  var PC = null, SRC = null;
  function hearStop() { if (SRC) { try { SRC.stop(); } catch (e) {} SRC = null; } if (ST) { ST.hearing = ""; words(); } }
  function hear(which) {
    if (ST.hearing === which) { hearStop(); return; }
    hearStop();
    var buf = null;
    try {
      if (!PC) { var AC = window.AudioContext || window.webkitAudioContext; PC = new AC(); }
      if (PC.state === "suspended") PC.resume();
      if (which === "old") buf = ST.host.buffer();
      else if (ST.fresh) { var o = ST.fresh.out; buf = PC.createBuffer(2, o.L.length, o.sr); buf.copyToChannel(Float32Array.from(o.L), 0); buf.copyToChannel(Float32Array.from(o.R || o.L), 1); }
    } catch (e) { buf = null; }
    if (!buf) return;
    var s = PC.createBufferSource(); s.buffer = buf; s.connect(PC.destination); s.start();
    s.onended = function () { if (SRC === s) { SRC = null; if (ST) { ST.hearing = ""; words(); } } };
    SRC = s; ST.hearing = which; words();
  }

  /* ── fingers, a pen and the mouse on the grid ── */
  function laneXY(ev) { var r = D.getElementById("aprLane").getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }
  function atXY(p) { return { b: p.x / ST.ppb + ST.b0, m: ST.hi - Math.floor(p.y / ST.row) }; }
  function bindLane() {
    var lane = D.getElementById("aprLane"), G = null;
    lane.addEventListener("pointerdown", function (ev) {
      if (!ST || ev.button > 0) return;
      var nEl = ev.target.closest && ev.target.closest(".apr-n"), p = laneXY(ev);
      try { D.getElementById("aprScroll").focus({ preventScroll: true }); } catch (err) {}   /* the keys then work on what was tapped */
      if (nEl) {
        ev.preventDefault();
        var id = +nEl.getAttribute("data-id"), e = ST.ev.find(function (x) { return x.id === id; }); if (!e) return;
        var add = ev.shiftKey || ev.metaKey || ev.ctrlKey, was = ST.sel.has(id);
        if (add) { if (was) ST.sel.delete(id); else ST.sel.add(id); } else if (!was) ST.sel = new Set([id]);
        var r = nEl.getBoundingClientRect(), edge = Math.min(coarse() ? 22 : 14, r.width / 2);
        G = { kind: ev.clientX > r.right - edge ? "len" : "move", id: id, x0: p.x, y0: p.y, moved: false, was: was && !add, before: snapshot(),
          orig: ids().map(function (x) { return { id: x.id, t: x.t, m: x.m, d: x.d, g: x.g ? x.g.map(function (q) { return q.slice(); }) : null }; }), anchor: { b: bOf(e), end: bOf(e) + e.d / ST.B } };
        try { lane.setPointerCapture(ev.pointerId); } catch (err) {}
        ST.msg = ""; paintNotes(); paintTools();
        return;
      }
      var boxing = ST.boxMode || ev.pointerType === "mouse" || ev.pointerType === "pen";
      G = { kind: boxing ? "box" : "tap", x0: p.x, y0: p.y, moved: false, add: ev.shiftKey || ev.metaKey || ev.ctrlKey, t0: Date.now() };
      if (boxing) { ev.preventDefault(); try { lane.setPointerCapture(ev.pointerId); } catch (err) {} }
    });
    lane.addEventListener("pointermove", function (ev) {
      if (!G || !ST) return;
      var p = laneXY(ev), dx = p.x - G.x0, dy = p.y - G.y0;
      if (!G.moved && Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      G.moved = true;
      if (G.kind === "move" || G.kind === "len") {
        ev.preventDefault();
        var R = RANGE[ST.room] || [0, 127];
        if (G.kind === "move") {
          /* a move goes in whole steps of the grid, so a note played a little early or late keeps its feel (and a drag
             straight up or down keeps its time) */
          var db = snapB(dx / ST.ppb), dm = -Math.round(dy / ST.row);
          if (G.orig.some(function (o) { var e = ST.ev.find(function (x) { return x.id === o.id; }); return e && !e.kit && (o.m + dm < R[0] || o.m + dm > R[1]); })) dm = G.dm || 0;
          G.dm = dm;
          G.orig.forEach(function (o) { var e = ST.ev.find(function (x) { return x.id === o.id; }); if (!e) return;
            e.t = r4(Math.max(0, tOf((o.t + ST.lag - ST.head) / ST.B + db)));
            if (!e.kit) { e.m = o.m + dm; if (o.g) e.g = o.g.map(function (q) { return [q[0], q[1] + dm]; }); } });
        } else {
          var dd = snapB(dx / ST.ppb) * ST.B;
          G.orig.forEach(function (o) { var e = ST.ev.find(function (x) { return x.id === o.id; }); if (e) e.d = r4(Math.max(0.03, o.d + dd)); });
        }
        paintNotes();
      } else if (G.kind === "box") {
        ev.preventDefault();
        var bx = D.getElementById("aprBoxR"); bx.hidden = false;
        bx.style.left = Math.min(p.x, G.x0) + "px"; bx.style.top = Math.min(p.y, G.y0) + "px"; bx.style.width = Math.abs(dx) + "px"; bx.style.height = Math.abs(dy) + "px";
        G.x1 = p.x; G.y1 = p.y;
      }
    });
    function end(ev, cancel) {
      if (!G || !ST) { G = null; return; }
      var g = G; G = null;
      if (g.kind === "move" || g.kind === "len") {
        if (g.moved && !cancel) {
          var f = g.orig.map(function (o) { var e = ST.ev.find(function (x) { return x.id === o.id; }); return e ? e.t + "," + e.m + "," + e.d : ""; }).join("|"), was = g.orig.map(function (o) { return o.t + "," + o.m + "," + o.d; }).join("|");
          if (f !== was) {
            ST.undo.push(g.before); if (ST.undo.length > 100) ST.undo.shift(); ST.redo.length = 0; ST.fresh = null;
            ST.ev.forEach(function (e) { if (g.orig.some(function (o) { return o.id === e.id && o.m !== e.m; })) delete e.z; });
            changed(""); return;
          }
        } else if (g.was && !cancel) { ST.sel = new Set([g.id]); }
        paint(); return;
      }
      if (g.kind === "box") {
        D.getElementById("aprBoxR").hidden = true;
        if (!g.moved || cancel) { if (!cancel) addAt(g.x0, g.y0); return; }
        var x0 = Math.min(g.x0, g.x1), x1 = Math.max(g.x0, g.x1), y0 = Math.min(g.y0, g.y1), y1 = Math.max(g.y0, g.y1);
        var hit = ST.ev.filter(function (e) { var ex = (bOf(e) - ST.b0) * ST.ppb, ew = Math.max(8, e.d / ST.B * ST.ppb), ey = (ST.hi - Math.round(e.m)) * ST.row;
          return ex < x1 && ex + ew > x0 && ey < y1 && ey + ST.row > y0; }).map(function (e) { return e.id; });
        ST.sel = new Set(g.add ? Array.from(ST.sel).concat(hit) : hit); ST.msg = ""; paint(); return;
      }
      if (g.kind === "tap" && !g.moved && !cancel && Date.now() - g.t0 < 900) addAt(g.x0, g.y0);
    }
    lane.addEventListener("pointerup", function (ev) { end(ev, false); });
    lane.addEventListener("pointercancel", function (ev) { end(ev, true); });
  }
  /* a tap on an empty spot: a note there, on the grid, as long as one step (half a beat when it lands anywhere) */
  function addAt(x, y) {
    var R = RANGE[ST.room] || [0, 127], a = atXY({ x: x, y: y }), g = step() || 0.25;
    var b = g ? Math.floor(a.b / g) * g : a.b, m = cl(a.m, R[0], R[1]);
    var last = ids()[0], v = last ? last.v : 0.7;
    remember();
    var e = { id: UID++, t: r4(Math.max(0, tOf(b))), m: m, v: v, d: r4(Math.max(0.05, (step() || 0.5) * ST.B)) };
    ST.ev.push(e); ST.sel = new Set([e.id]);
    changed(w("added"));
  }

  /* ── the keyboard ── */
  function key(e) {
    if (!ST) return;
    var t = e.target, tg = t && t.tagName, mod = e.ctrlKey || e.metaKey;
    if (mod && !e.altKey && (e.code === "KeyZ" || e.code === "KeyY")) { e.preventDefault(); e.stopPropagation(); if (e.code === "KeyY" || e.shiftKey) redo(); else undo(); return; }
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); if (ST.sel.size) { ST.sel.clear(); paint(); } else close(); return; }
    if (tg === "INPUT" || tg === "SELECT" || tg === "TEXTAREA") { e.stopPropagation(); return; }
    if (mod && e.code === "KeyA") { e.preventDefault(); e.stopPropagation(); act("all"); return; }
    var onGrid = t && t.id === "aprScroll";
    if (onGrid && (e.key === "Delete" || e.key === "Backspace")) { e.preventDefault(); e.stopPropagation(); del(); return; }
    if (onGrid && /^Arrow(Left|Right|Up|Down)$/.test(e.key) && !mod && !e.altKey) {
      e.preventDefault(); e.stopPropagation();
      var s = step() || 0.25, bar = ST.bpb;
      if (e.key === "ArrowLeft") nudge(-(e.shiftKey ? bar : s), 0); else if (e.key === "ArrowRight") nudge(e.shiftKey ? bar : s, 0);
      else if (e.key === "ArrowUp") nudge(0, e.shiftKey ? 12 : 1); else nudge(0, e.shiftKey ? -12 : -1);
      return;
    }
    /* the desk's own keys (Space, 1 to 8, M, S …) stay with the desk's page, not here */
    e.stopPropagation();
  }
  /* a key while the editor is open but nothing in it has the keyboard: it is the editor's */
  function docKey(e) {
    if (!ST) return;
    var box = D.getElementById("apr"); if (!box || box.contains(e.target)) return;
    if (e.key === "Tab") { e.preventDefault(); try { D.getElementById("aprDone").focus(); } catch (x) {} return; }
    var sc = D.getElementById("aprScroll");
    e.stopPropagation();
    if (/^Arrow|^Delete$|^Backspace$/.test(e.key)) { try { sc.focus(); } catch (x) {} }
    key({ target: sc, key: e.key, code: e.code, shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, preventDefault: function () { e.preventDefault(); }, stopPropagation: function () {} });
  }

  window.AOGPianoRoll = { open: open, close: close, clean: clean, renderHere: renderHere, isOpen: function () { return !!ST; },
    /* for the tests (music-handoff/tests/studio/notes.js) */
    _t: { get ST() { return ST; }, act: act, nudge: nudge, addAt: addAt, bOf: function (e) { return bOf(e); }, tOf: function (b) { return tOf(b); }, payload: function () { return payload(); }, setSound: function (id) { setSound(id); } } };
})();
