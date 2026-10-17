/* AOG-DESK-NOTES-V1 (2026-10-17) — the piano-roll's deluxe note tools (aog-pianoroll.js fetches this file the first time
   "Edit the notes" opens; Jimmy: "DAW to the max"). They work on the picked notes, or on all of them when none is
   picked, through the editor's own door (AOGPianoRoll.api), so Undo, Redo and Play it with the changes take them in.
   · Line up (quantize): on 1/4, 1/8, 1/16, 1/32 or triplets, with swing (0 % straight … 100 % the triplet shuffle) and
     how much (0 to 100 %); notes are moved by where they sound;
   · Feel (humanize): each note's timing and strength loosened a little, the same way each time for the same notes;
   · Lengths: legato (each note held to the next one) or one length for all;
   · Move in the key: up or down by steps of the song's key (♩ Song; C major when none is set), not by half steps;
   · Copy and paste notes, to any bar;
   · the Strength lane under the notes (drag a bar up or down, or across several), and Show the key (its notes' rows
     lit). Nothing moves by itself. */
(function () {
  "use strict";
  var W = {
    more: { en: "More note tools", es: "Más herramientas de notas" },
    tool: { en: "Tool", es: "Herramienta" },
    t_q: { en: "Line up", es: "Alinear" }, t_h: { en: "Feel", es: "Sensación" }, t_l: { en: "Lengths", es: "Duraciones" }, t_k: { en: "Move in the key", es: "Mover en la tonalidad" }, t_c: { en: "Copy and paste", es: "Copiar y pegar" },
    on: { en: "the picked notes", es: "las notas elegidas" }, all: { en: "every note", es: "todas las notas" },
    worksOn: { en: "Works on {w}.", es: "Funciona con {w}." },
    grid: { en: "Line up on", es: "Alinear a" }, g4: { en: "1/4 (the beat)", es: "1/4 (el pulso)" }, g8t: { en: "1/8 triplet", es: "tresillo de 1/8" }, g16t: { en: "1/16 triplet", es: "tresillo de 1/16" },
    swing: { en: "Swing", es: "Swing" }, strength: { en: "How much", es: "Cuánto" }, qBtn: { en: "Line them up", es: "Alinearlas" },
    qDone: { en: "{n} notes lined up on {g}.", es: "{n} notas alineadas a {g}." },
    hTime: { en: "Timing", es: "Tiempo" }, hVel: { en: "Strength", es: "Fuerza" },
    hT5: { en: "A little (5 ms)", es: "Un poco (5 ms)" }, hT10: { en: "Some (10 ms)", es: "Algo (10 ms)" }, hT20: { en: "More (20 ms)", es: "Más (20 ms)" },
    hV5: { en: "A little (5 %)", es: "Un poco (5 %)" }, hV10: { en: "Some (10 %)", es: "Algo (10 %)" }, hV20: { en: "More (20 %)", es: "Más (20 %)" },
    hBtn: { en: "Make it feel played", es: "Que suene tocado" }, hDone: { en: "{n} notes feel played now.", es: "{n} notas suenan tocadas ahora." },
    hLine: { en: "Each note moves a little, so it feels played by hand.", es: "Cada nota se mueve un poco, así suena tocada a mano." },
    leg: { en: "Hold each note to the next", es: "Sostener cada nota hasta la siguiente" }, legDone: { en: "{n} notes now hold to the next one.", es: "{n} notas se sostienen ahora hasta la siguiente." },
    fix: { en: "Length", es: "Duración" }, fixBtn: { en: "Make them this long", es: "Darles esta duración" }, fixDone: { en: "{n} notes are {w} long now.", es: "{n} notas duran {w} ahora." },
    l16: { en: "1/16", es: "1/16" }, l8: { en: "1/8", es: "1/8" }, l4: { en: "1/4 (a beat)", es: "1/4 (un pulso)" }, l2: { en: "1/2 (two beats)", es: "1/2 (dos pulsos)" }, l1: { en: "A whole bar", es: "Un compás entero" },
    kDn: { en: "Down in the key", es: "Bajar en la tonalidad" }, kUp: { en: "Up in the key", es: "Subir en la tonalidad" }, kBy: { en: "How far", es: "Cuánto" },
    k1: { en: "1 step", es: "1 grado" }, k2: { en: "2 steps (a third)", es: "2 grados (una tercera)" }, k4: { en: "4 steps (a fifth)", es: "4 grados (una quinta)" }, k7: { en: "7 steps (an octave)", es: "7 grados (una octava)" },
    kKey: { en: "In {k}.", es: "En {k}." }, kNone: { en: "In C major. Set the song's key in ♩ Song.", es: "En Do mayor. Elige la tonalidad en ♩ Canción." },
    kMaj: { en: "{n} major", es: "{n} mayor" }, kMin: { en: "{n} minor", es: "{n} menor" },
    kDone: { en: "{n} notes moved in the key.", es: "{n} notas movidas en la tonalidad." }, kFar: { en: "That would go past the instrument's notes.", es: "Eso pasaría las notas del instrumento." },
    cCopy: { en: "Copy", es: "Copiar" }, cPaste: { en: "Paste", es: "Pegar" }, cAt: { en: "Paste at", es: "Pegar en" }, cBar: { en: "Bar {n}", es: "Compás {n}" },
    cHave: { en: "{n} notes copied.", es: "{n} notas copiadas." }, cNone: { en: "Copy some notes first.", es: "Primero copia algunas notas." },
    cDone: { en: "{n} notes pasted at bar {b}.", es: "{n} notas pegadas en el compás {b}." },
    vlOn: { en: "Strength lane: On", es: "Carril de fuerza: encendido" }, vlOff: { en: "Strength lane: Off", es: "Carril de fuerza: apagado" },
    scOn: { en: "Show the key: On", es: "Mostrar la tonalidad: encendido" }, scOff: { en: "Show the key: Off", es: "Mostrar la tonalidad: apagado" },
    vlLab: { en: "Strength", es: "Fuerza" }, vlAria: { en: "Each note's strength. Drag a bar up or down.", es: "La fuerza de cada nota. Arrastra una barra arriba o abajo." },
    vlDone: { en: "Strength changed.", es: "Fuerza cambiada." }
  };
  var NOTE = { en: ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"], es: ["Do", "Do♯", "Re", "Mi♭", "Mi", "Fa", "Fa♯", "Sol", "La♭", "La", "Si♭", "Si"] };
  var QG = { "4": 1, "8": 0.5, "16": 0.25, "32": 0.125, "8t": 1 / 3, "16t": 1 / 6 };
  var LENS = { "16": 0.25, "8": 0.5, "4": 1, "2": 2, "1": 4 };
  var CSS = [
    ".apr-more{flex:1 1 100%;display:block;padding:4px 8px}",
    ".apr-more>summary{min-height:44px;display:flex;align-items:center;gap:.5rem;cursor:pointer;font-weight:800;color:#efe5cf;list-style:none}",
    ".apr-more>summary::-webkit-details-marker{display:none}",
    ".apr-more>summary::before{content:\"\\25B8\";color:#e0b25a}.apr-more[open]>summary::before{content:\"\\25BE\"}",
    ".apr-mi{display:grid;gap:8px;padding:4px 0 6px}",
    ".apr-mr{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px}",
    ".apr-ms{margin:0;color:#d9cdb5;font-size:.95rem}",
    ".apr-mi [hidden]{display:none!important}",
    ".apr-vl{position:relative;height:104px;border:1px solid #2e3035;border-radius:12px;background:#0d0e10;overflow:hidden;touch-action:none}",
    ".apr-vl[hidden]{display:none}",
    ".apr-vlk{position:absolute;left:0;top:0;bottom:0;width:56px;z-index:2;display:flex;align-items:center;justify-content:center;background:#17181b;border-right:1px solid #33353b;font:800 .72rem/1.1 inherit;color:#e9dfca;text-align:center}",
    ".apr-vlw{position:absolute;left:56px;right:0;top:0;bottom:0;overflow:hidden}",
    ".apr-vlin{position:absolute;left:0;top:6px;bottom:6px}",
    ".apr-vb{position:absolute;bottom:0;border-radius:3px 3px 0 0;background:#c99a3e;pointer-events:none}",
    ".apr-vb.sel{background:#f0c26e;box-shadow:0 0 0 1px #f6efe2}",
    ".apr-sc{position:absolute;inset:0;pointer-events:none;z-index:0}",
    ".apr-lane .apr-n{z-index:1}",
    ".apr-keys div.sc{color:#ffe2a8;font-weight:900}"
  ].join("\n");
  var A = null, D = document, S = { tool: "q", grid: "16", swing: 0, amt: 100, ht: 10, hv: 10, len: "8", kby: 1, vl: false, sc: true, at: 1, n: 0, clip: null };
  try { var sv = JSON.parse(localStorage.getItem("aog.studio.notes.v1") || "null"); if (sv && typeof sv === "object") { if (QG[sv.grid]) S.grid = sv.grid; S.vl = !!sv.vl; S.sc = sv.sc !== false; if (/^[qhlkc]$/.test(sv.tool)) S.tool = sv.tool; } } catch (e) {}
  function keep() { try { localStorage.setItem("aog.studio.notes.v1", JSON.stringify({ grid: S.grid, vl: S.vl, sc: S.sc, tool: S.tool })); } catch (e) {} }
  function L() { return A ? A.lang() : "en"; }
  function w(k, v) { var s = (W[k] || {})[L()] || k; if (v) Object.keys(v).forEach(function (q) { s = s.split("{" + q + "}").join(v[q]); }); return s; }
  function esc(s) { return A.esc(s); }
  function opt(v, label, cur) { return '<option value="' + v + '"' + (String(v) === String(cur) ? " selected" : "") + ">" + esc(label) + "</option>"; }
  function list() { return A.targets(); }
  function st() { return A.st(); }
  /* the song's key: {key 0-11, minor}; C major when none is set */
  function key() { try { var g = window.AOGSong && AOGSong.get(); if (g && g.hasKey) return { key: g.key, minor: !!g.minor, set: true }; } catch (e) {} return { key: 0, minor: false, set: false }; }
  function scale(k) { var I = k.minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11]; return I.map(function (i) { return (i + k.key) % 12; }); }
  function inKey(m, k) { return scale(k).indexOf(((Math.round(m) % 12) + 12) % 12) >= 0; }
  function keyWords() { var k = key(); if (!k.set) return w("kNone"); return w("kKey", { k: w(k.minor ? "kMin" : "kMaj", { n: NOTE[L()][k.key] }) }); }
  /* a seeded random number in −1 … 1, the same for the same notes */
  function rng(seed) { var x = seed >>> 0 || 0x9e3779b9; return function () { x = (x + 0x6D2B79F5) >>> 0; var z = x; z = Math.imul(z ^ (z >>> 15), z | 1); z ^= z + Math.imul(z ^ (z >>> 7), z | 61); return (((z ^ (z >>> 14)) >>> 0) / 4294967296) * 2 - 1; }; }

  /* ── the tools ── */
  function quantize(gk, swing, amt) {
    var T = st(), g = QG[gk] || 0.25, L0 = list(); if (!L0.length) return 0;
    A.remember();
    L0.forEach(function (e) { var b = A.bOf(e), k = Math.round(b / g), q = k * g;
      if (k % 2 !== 0 && !/t$/.test(gk)) q += (swing / 100) * g / 3;   /* the offbeats move later: 100 % is the triplet shuffle */
      var nb = b + (q - b) * (amt / 100); e.t = A.r4(Math.max(0, A.tOf(nb))); delete e.z; });
    var gname = gk === "4" ? w("g4") : gk === "8t" ? w("g8t") : gk === "16t" ? w("g16t") : "1/" + gk;
    A.changed(w("qDone", { n: L0.length, g: gname })); return L0.length;
  }
  function humanize(ms, pct) {
    var T = st(), L0 = list(); if (!L0.length) return 0;
    A.remember(); S.n++;
    var seed = L0.reduce(function (a, e) { return (Math.imul(a, 31) + Math.round(e.t * 1e4) + e.m * 131) >>> 0; }, 0x2545f491 + S.n * 977), r = rng(seed);
    L0.forEach(function (e) { e.t = A.r4(Math.max(0, e.t + r() * ms / 1000)); e.v = Math.round(A.cl(e.v * (1 + r() * pct / 100), 0.05, 1) * 1000) / 1000; delete e.z; });
    A.changed(w("hDone", { n: L0.length })); return L0.length;
  }
  function legato() {
    var T = st(), L0 = list(); if (!L0.length) return 0;
    var starts = L0.map(function (e) { return e.t; }).sort(function (a, b) { return a - b; });
    A.remember(); var n = 0;
    L0.forEach(function (e) { var nx = null; for (var i = 0; i < starts.length; i++) if (starts[i] > e.t + 0.005) { nx = starts[i]; break; }
      if (nx != null) { e.d = A.r4(Math.max(0.03, nx - e.t)); n++; } });
    A.changed(w("legDone", { n: n || L0.length })); return n;
  }
  function fixed(lk) {
    var T = st(), L0 = list(), b = LENS[lk] || 0.5; if (!L0.length) return 0;
    A.remember(); L0.forEach(function (e) { e.d = A.r4(Math.max(0.03, b * T.B)); });
    A.changed(w("fixDone", { n: L0.length, w: w("l" + lk) })); return L0.length;
  }
  function stepKey(m, d, k) {
    var sc = scale(k), all = []; for (var x = 0; x <= 127; x++) if (sc.indexOf(x % 12) >= 0) all.push(x);
    var r = Math.round(m), i = -1; for (var j = 0; j < all.length; j++) if (all[j] <= r) i = j;
    if (i < 0) return null;
    var on = all[i] === r, to = d > 0 ? i + d : i + d + (on ? 0 : 1);
    return to >= 0 && to < all.length ? all[to] : null;
  }
  function inKeyMove(d) {
    var T = st(), R = A.range(), k = key(), L0 = list().filter(function (e) { return !e.kit; }); if (!L0.length) return 0;
    var to = L0.map(function (e) { return stepKey(e.m, d, k); });
    if (to.some(function (m) { return m == null || m < R[0] || m > R[1]; })) { T.msg = w("kFar"); A.paint(); return -1; }
    A.remember();
    L0.forEach(function (e, i) { var dm = to[i] - Math.round(e.m); e.m = to[i]; delete e.z; if (e.g) e.g = e.g.map(function (q) { return [q[0], q[1] + dm]; }); });
    A.changed(w("kDone", { n: L0.length })); return L0.length;
  }
  function copy() {
    var T = st(), L0 = A.ids().length ? A.ids() : T.ev; if (!L0.length) return 0;
    var b0 = Math.min.apply(null, L0.map(A.bOf)), b1 = Math.max.apply(null, L0.map(function (e) { return A.bOf(e) + e.d / T.B; }));
    S.clip = { ev: L0.map(function (e) { var o = Object.assign({}, e); delete o.id; o.rb = A.bOf(e) - b0; o.db = e.d / T.B; return o; }), len: b1 - b0, end: b1 };
    var first = T.host.firstBar ? T.host.firstBar() : 1;
    S.at = Math.max(first, Math.ceil(b1 / T.bpb - 1e-6) + first);
    T.msg = w("cHave", { n: L0.length }); A.paint(); return L0.length;
  }
  function paste(bar) {
    var T = st(), C = S.clip; if (!C) { T.msg = w("cNone"); A.paint(); return 0; }
    var first = T.host.firstBar ? T.host.firstBar() : 1, b = (bar - first) * T.bpb, R = A.range();
    A.remember(); var sel = new Set();
    C.ev.forEach(function (o) { var e = Object.assign({}, o); delete e.rb; delete e.db; delete e.z; e.id = A.newId(); e.t = A.r4(Math.max(0, A.tOf(b + o.rb))); e.d = A.r4(Math.max(0.03, o.db * T.B)); if (!e.kit) e.m = A.cl(e.m, R[0], R[1]); T.ev.push(e); sel.add(e.id); });
    T.sel = sel;
    A.changed(w("cDone", { n: C.ev.length, b: bar })); return C.ev.length;
  }

  /* ── the panel, the Strength lane and the key's rows ── */
  function pane() {
    var T = st(), h = "";
    if (S.tool === "q") h = '<div class="apr-mr"><label class="apr-lab" for="apxGrid">' + esc(w("grid")) + '</label><select id="apxGrid">' + ["4", "8", "16", "32", "8t", "16t"].map(function (g) { return opt(g, g === "4" ? w("g4") : g === "8t" ? w("g8t") : g === "16t" ? w("g16t") : "1/" + g, S.grid); }).join("") + "</select>" +
      '<label class="apr-lab" for="apxSw">' + esc(w("swing")) + '</label><input type="range" id="apxSw" min="0" max="100" step="5" value="' + S.swing + '"><output id="apxSwO">' + S.swing + " %</output>" +
      '<label class="apr-lab" for="apxAmt">' + esc(w("strength")) + '</label><input type="range" id="apxAmt" min="0" max="100" step="5" value="' + S.amt + '"><output id="apxAmtO">' + S.amt + " %</output>" +
      '<button type="button" class="apr-b go" id="apxQ">' + esc(w("qBtn")) + "</button></div>";
    else if (S.tool === "h") h = '<p class="apr-ms">' + esc(w("hLine")) + '</p><div class="apr-mr"><label class="apr-lab" for="apxHt">' + esc(w("hTime")) + '</label><select id="apxHt">' + [5, 10, 20].map(function (v) { return opt(v, w("hT" + v), S.ht); }).join("") + "</select>" +
      '<label class="apr-lab" for="apxHv">' + esc(w("hVel")) + '</label><select id="apxHv">' + [5, 10, 20].map(function (v) { return opt(v, w("hV" + v), S.hv); }).join("") + "</select>" +
      '<button type="button" class="apr-b go" id="apxH">' + esc(w("hBtn")) + "</button></div>";
    else if (S.tool === "l") h = '<div class="apr-mr"><button type="button" class="apr-b" id="apxLeg">' + esc(w("leg")) + '</button></div><div class="apr-mr"><label class="apr-lab" for="apxLen">' + esc(w("fix")) + '</label><select id="apxLen">' +
      ["16", "8", "4", "2", "1"].map(function (k) { return opt(k, w("l" + k), S.len); }).join("") + '</select><button type="button" class="apr-b go" id="apxFix">' + esc(w("fixBtn")) + "</button></div>";
    else if (S.tool === "k") h = '<p class="apr-ms" id="apxKeyW">' + esc(keyWords()) + '</p><div class="apr-mr"><label class="apr-lab" for="apxBy">' + esc(w("kBy")) + '</label><select id="apxBy">' + [1, 2, 4, 7].map(function (v) { return opt(v, w("k" + v), S.kby); }).join("") + "</select>" +
      '<button type="button" class="apr-b" id="apxKd">' + esc(w("kDn")) + '</button><button type="button" class="apr-b" id="apxKu">' + esc(w("kUp")) + "</button></div>";
    else { var first = T.host.firstBar ? T.host.firstBar() : 1, nb = Math.max(4, Math.ceil(T.b1 / T.bpb) + 8), o = "";
      for (var b = first; b < first + nb; b++) o += opt(b, w("cBar", { n: b }), S.at);
      h = '<div class="apr-mr"><button type="button" class="apr-b" id="apxCopy">' + esc(w("cCopy")) + '</button><label class="apr-lab" for="apxAt">' + esc(w("cAt")) + '</label><select id="apxAt">' + o + '</select><button type="button" class="apr-b go" id="apxPaste"' + (S.clip ? "" : " disabled") + ">" + esc(w("cPaste")) + "</button></div>"; }
    return h;
  }
  function panel() {
    var box = D.getElementById("apxIn"); if (!box || !A || !st()) return;
    var T = st();
    var h = '<div class="apr-mr"><button type="button" class="apr-b" id="apxVl" aria-pressed="' + S.vl + '">' + esc(w(S.vl ? "vlOn" : "vlOff")) + '</button><button type="button" class="apr-b" id="apxSc" aria-pressed="' + S.sc + '">' + esc(w(S.sc ? "scOn" : "scOff")) + "</button></div>" +
      '<div class="apr-mr"><label class="apr-lab" for="apxTool">' + esc(w("tool")) + '</label><select id="apxTool">' + ["q", "h", "l", "k", "c"].map(function (k) { return opt(k, w("t_" + k), S.tool); }).join("") + "</select>" +
      '<span class="apr-ms" id="apxOn">' + esc(w("worksOn", { w: w(T.sel.size ? "on" : "all") })) + "</span></div>" + pane();
    var fa = D.activeElement, keepId = fa && box.contains(fa) ? fa.id : "";
    if (box._h === h) return; box._h = h; box.innerHTML = h;
    if (keepId) { var el = D.getElementById(keepId); if (el) try { el.focus({ preventScroll: true }); } catch (e) {} }
  }
  function lane() {
    var T = st(), vl = D.getElementById("apxVL"); if (!vl || !T) return;
    vl.hidden = !S.vl; if (!S.vl) return;
    var inn = D.getElementById("apxVLin"), H = vl.clientHeight - 12, h = "";
    inn.style.width = ((T.b1 - T.b0) * T.ppb) + "px";
    T.ev.forEach(function (e) { var x = (A.bOf(e) - T.b0) * T.ppb, ww = Math.max(6, Math.min(14, e.d / T.B * T.ppb));
      h += '<i class="apr-vb' + (T.sel.has(e.id) ? " sel" : "") + '" data-id="' + e.id + '" style="left:' + x.toFixed(1) + "px;width:" + ww.toFixed(1) + "px;height:" + Math.round(A.cl(e.v, 0, 1) * H) + 'px"></i>'; });
    inn.innerHTML = h; sync();
  }
  function sync() { var sc = D.getElementById("aprScroll"), inn = D.getElementById("apxVLin"); if (sc && inn) inn.style.transform = "translateX(" + (-sc.scrollLeft) + "px)"; }
  function shade() {
    var T = st(), ov = D.getElementById("apxSc"), keys = D.getElementById("aprKeys"); if (!ov || !T) return;
    var k = key(), sc = scale(k);
    if (!S.sc) { ov.style.backgroundImage = "none"; if (keys) Array.prototype.forEach.call(keys.children, function (el) { el.classList.remove("sc"); }); return; }
    var stops = [];
    for (var r = 0; r < 12; r++) { var m = T.hi - r, pc = ((m % 12) + 12) % 12, c = pc === k.key ? "rgba(240,194,110,.17)" : sc.indexOf(pc) >= 0 ? "rgba(240,194,110,.08)" : "transparent";
      stops.push(c + " " + (r * T.row) + "px", c + " " + ((r + 1) * T.row) + "px"); }
    ov.style.backgroundImage = "linear-gradient(to bottom," + stops.join(",") + ")"; ov.style.backgroundSize = "100% " + (12 * T.row) + "px";
    if (keys) Array.prototype.forEach.call(keys.children, function (el, i) { el.classList.toggle("sc", sc.indexOf((((T.hi - i) % 12) + 12) % 12) >= 0); });
  }
  function paint() { if (!A || !st()) return; panel(); lane(); shade(); }

  function mount(api) {
    A = api; var T = st(); if (!T) return;
    if (!D.getElementById("aog-desk-notes-css")) { var s = D.createElement("style"); s.id = "aog-desk-notes-css"; s.textContent = CSS; D.head.appendChild(s); }
    var tools = D.getElementById("aprTools"), roll = D.querySelector("#apr .apr-roll"), ln = D.getElementById("aprLane");
    if (!tools || !roll || !ln) return;
    if (!D.getElementById("apxMore")) tools.insertAdjacentHTML("beforeend", '<details class="apr-grp apr-more" id="apxMore"><summary id="apxSum"></summary><div class="apr-mi" id="apxIn"></div></details>');
    if (!D.getElementById("apxVL")) roll.insertAdjacentHTML("afterend", '<div class="apr-vl" id="apxVL" role="group" hidden><div class="apr-vlk" id="apxVLk"></div><div class="apr-vlw"><div class="apr-vlin" id="apxVLin"></div></div></div>');
    if (!D.getElementById("apxSc")) ln.insertAdjacentHTML("afterbegin", '<div class="apr-sc" id="apxSc" aria-hidden="true"></div>');
    D.getElementById("apxSum").textContent = w("more"); D.getElementById("apxVLk").textContent = w("vlLab"); D.getElementById("apxVL").setAttribute("aria-label", w("vlAria"));
    bind(); api_.on = true; paint();
  }
  function unmount() { api_.on = false; A = null; }
  function bind() {
    var more = D.getElementById("apxMore"); if (more._b) return; more._b = 1;
    more.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("button"); if (!b || b.disabled || !st()) return;
      var id = b.id;
      if (id === "apxVl") { S.vl = !S.vl; keep(); paint(); }
      else if (id === "apxSc") { S.sc = !S.sc; keep(); paint(); }
      else if (id === "apxQ") quantize(S.grid, S.swing, S.amt);
      else if (id === "apxH") humanize(S.ht, S.hv);
      else if (id === "apxLeg") legato();
      else if (id === "apxFix") fixed(S.len);
      else if (id === "apxKd" || id === "apxKu") inKeyMove(id === "apxKu" ? S.kby : -S.kby);
      else if (id === "apxCopy") copy();
      else if (id === "apxPaste") paste(S.at);
      var n = D.getElementById(id); if (n) try { n.focus({ preventScroll: true }); } catch (er) {}
    });
    more.addEventListener("change", function (e) { var el = e.target, v = el.value;
      if (el.id === "apxTool") { S.tool = v; keep(); paint(); }
      else if (el.id === "apxGrid") { if (QG[v]) S.grid = v; keep(); }
      else if (el.id === "apxHt") S.ht = +v; else if (el.id === "apxHv") S.hv = +v;
      else if (el.id === "apxLen") S.len = v; else if (el.id === "apxBy") S.kby = +v; else if (el.id === "apxAt") S.at = +v; });
    more.addEventListener("input", function (e) { var el = e.target;
      if (el.id === "apxSw") { S.swing = +el.value; D.getElementById("apxSwO").textContent = S.swing + " %"; }
      else if (el.id === "apxAmt") { S.amt = +el.value; D.getElementById("apxAmtO").textContent = S.amt + " %"; } });
    var sc = D.getElementById("aprScroll"); if (sc) sc.addEventListener("scroll", sync, { passive: true });
    /* the Strength lane: a finger, a pen or the mouse sets the strength of the note under it, and of the notes it crosses */
    var vl = D.getElementById("apxVL"), G = null;
    function hit(ev) { var T = st(), inn = D.getElementById("apxVLin"), r = inn.getBoundingClientRect(), x = ev.clientX - r.left, H = inn.clientHeight;
      var v = A.cl(1 - (ev.clientY - r.top) / Math.max(1, H), 0.05, 1), best = null, bd = 1e9;
      T.ev.forEach(function (e) { var ex = (A.bOf(e) - T.b0) * T.ppb, d = Math.abs(x - ex - 4); if (d < bd) { bd = d; best = e; } });
      if (!best || bd > 18) return null;
      return { list: T.ev.filter(function (e) { return Math.abs(A.bOf(e) - A.bOf(best)) * T.ppb < 2; }), v: Math.round(v * 100) / 100 };
    }
    vl.addEventListener("pointerdown", function (ev) { if (!st() || (ev.pointerType === "mouse" && ev.button !== 0)) return; var h = hit(ev); if (!h) return;
      ev.preventDefault(); try { vl.setPointerCapture(ev.pointerId); } catch (er) {}
      A.remember(); G = { pid: ev.pointerId };
      h.list.forEach(function (e) { e.v = h.v; }); A.paintNotes(); lane(); });
    vl.addEventListener("pointermove", function (ev) { if (!G || ev.pointerId !== G.pid) return; ev.preventDefault(); var h = hit(ev); if (!h) return; h.list.forEach(function (e) { e.v = h.v; }); A.paintNotes(); lane(); });
    function up(ev) { if (!G || ev.pointerId !== G.pid) return; G = null; A.changed(w("vlDone")); }
    vl.addEventListener("pointerup", up); vl.addEventListener("pointercancel", up);
    /* ⌘/Ctrl + C and V copy and paste the picked notes while the editor is open */
    D.addEventListener("keydown", function (e) { if (!api_.on || !st()) return; var t = e.target, tg = t && t.tagName; if (tg === "INPUT" || tg === "SELECT" || tg === "TEXTAREA") return;
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      if (e.code === "KeyC") { e.preventDefault(); e.stopPropagation(); copy(); } else if (e.code === "KeyV") { e.preventDefault(); e.stopPropagation(); paste(S.at); } }, true);
  }
  var api_ = { on: false, mount: mount, unmount: unmount, paint: paint, S: S, quantize: quantize, humanize: humanize, legato: legato, fixed: fixed, inKeyMove: inKeyMove, copy: copy, paste: paste, stepKey: stepKey, key: key, scale: scale };
  window.AOGNotesPro = api_;
})();
