/* AOG-VOCAL-V1 (2026-10-23) — 🎙 The Vocal Booth: the Recording Studio's ninth room, before the Mixing Desk.
   Jimmy: "I think we need a vocal studio to record our voice with various effects and eq etc… better than the SING OR RAP
   icon door", for "my teenager children and my 60 year plus parents and everyone in between".

   It grew out of the Sing or rap booth (aog-micbooth.js, AOG-MICBOOTH-V1) and records the same way: on this room's own sound
   engine (AOGVU.own), My Track from the Mixing Desk out of sight (the Studio's AOGStudioShell.desk(): voiceBacking), the
   desk's own capture (an AudioWorklet that hands over the microphone's samples with the time they were heard; a
   ScriptProcessor on older browsers), lined up by the Timing check's round trip (aog.latency.v1), else what the browser says.
     ● Record   asks for the microphone (only now, never before); My Track plays from the From bar and you sing or rap.
                The level meter moves only while recording. Hear myself (off unless chosen, for headphones) sends your voice
                to your ears as you sing, with a little room.
     takes      every take is kept while the booth is open (Take 1, Take 2 …); the one picked is the one you shape and add.
                ✕ lets one go, and Bring it back returns it until the next one goes.
     a sound   nine ready-made sounds (Clean, Warm, Radio, Rap, Echo, Big hall, Tuned, Robot, Phone), each a set of the controls
                below; moving a control makes it your own (Custom).
     shape it   Low cut, Body, Presence, Air (EQ), Squeeze (a compressor), Soft S (a de-esser), Tune (the desk's pitch
                correction, dmTune), Double, Echo (on the dotted eighth of the song's tempo), Room (small or big), Volume.
                While ▶ Hear it plays, EQ, Squeeze, Double, Echo, Room and Volume change as you move them; Soft S and Tune are
                worked out from the take (a moment) and the take carries on from where it was.
     + Add to My Track  the take in its sound, made offline with the very same chain, on the desk's track 8 at its bar,
                called Voice 1, Voice 2 … (the dry take kept beside it on the desk).
   Calm and silent: nothing runs before a tap; no timer or frame while idle; meters move only while recording or playing;
   the microphone is let go at Stop; the engine rests (suspends) when nothing plays; hidden, everything stops. */
(function () {
  "use strict";
  if (window.AOGVocal) return;
  var D = document, H = D.documentElement;
  function SH() { try { if (window.parent !== window && window.parent.AOGStudioShell) return window.parent.AOGStudioShell; } catch (e) {} return window.AOGStudioShell || null; }
  function es() { return (H.getAttribute("lang") || "en").indexOf("es") === 0; }
  var W = {
    title: ["The Vocal Booth", "La cabina de voz"], mic: ["The mic", "El micrófono"],
    lead: ["Record your voice over My Track. Then give it a sound.", "Graba tu voz sobre mi pista. Luego dale un sonido."],
    help: ["Headphones help: then the mic hears only you.", "Los audífonos ayudan: así el micrófono solo te oye a ti."],
    prep: ["Getting My Track ready…", "Preparando mi pista…"],
    ready: ["Press Record. My Track plays, and you sing or rap over it.", "Pulsa Grabar. Suena mi pista y tú cantas o rapeas encima."],
    readyFrom: ["Press Record. My Track plays from bar {n}, and you sing or rap over it.", "Pulsa Grabar. Mi pista suena desde el compás {n} y tú cantas o rapeas encima."],
    alone: ["My Track has no beat yet. Make one in the Drum Machine, or press Record to go with no beat.", "Mi pista aún no tiene ritmo. Haz uno en la caja de ritmos, o pulsa Grabar para ir sin ritmo."],
    solo: ["Press Record to sing or rap. Open the booth in the Studio to sing over My Track.", "Pulsa Grabar para cantar o rapear. Abre la cabina en el estudio para cantar sobre mi pista."],
    asking: ["Allow the microphone to start.", "Permite el micrófono para empezar."],
    rec: ["● Record", "● Grabar"], recMore: ["● Record another", "● Grabar otra"], stop: ["■ Stop", "■ Parar"],
    recOn: ["Recording. Press Stop when you are done.", "Grabando. Pulsa Parar cuando termines."],
    ended: ["My Track ended, so the take did too.", "Mi pista terminó, y la toma también."],
    short: ["That take was very short. Try again.", "Esa toma fue muy corta. Inténtalo otra vez."],
    took: ["Got it! Press ▶ Hear it, then pick a sound.", "¡Listo! Pulsa ▶ Escúchala y elige un sonido."],
    mon: ["Hear myself (with headphones)", "Oírme (con audífonos)"],
    monWarn: ["Only with headphones on, or the speakers feed back.", "Solo con audífonos puestos, o los altavoces se acoplan."],
    takesH: ["Your takes", "Tus tomas"], take: ["Take {n}", "Toma {n}"], pickTake: ["Use take {n}", "Usar la toma {n}"], drop: ["Let take {n} go", "Quitar la toma {n}"],
    gone: ["Take {n} is gone.", "La toma {n} se fue."], back: ["Bring it back", "Recuperarla"],
    sndH: ["Pick a sound", "Elige un sonido"], custom: ["Custom", "A tu medida"], customS: ["Your own settings", "Tus propios ajustes"],
    shapeH: ["Shape your voice", "Dale forma a tu voz"],
    making: ["Making the sound…", "Haciendo el sonido…"],
    tunedKey: ["Tuned to {key}.", "Afinada en {key}."],
    tunedNoKey: ["The song has no key yet, so it tunes to the nearest note.", "La canción aún no tiene tonalidad, así que afina a la nota más cercana."],
    hear: ["▶ Hear it", "▶ Escúchala"], hearStop: ["■ Stop", "■ Parar"], playing: ["Playing your take with the beat.", "Suena tu toma con el ritmo."],
    add: ["+ Add to My Track", "+ Añadir a mi pista"], adding: ["Adding…", "Añadiendo…"],
    added: ["{name} is on My Track, on track 8.", "{name} está en mi pista, en la pista 8."],
    fit: ["The beat repeats to fit your voice.", "El ritmo se repite para que quepa tu voz."],
    noDesk: ["Open the booth in the Studio to add it to My Track.", "Abre la cabina en el estudio para añadirla a mi pista."],
    denied: ["The microphone is off for this site. To turn it on:", "El micrófono está apagado para este sitio. Para encenderlo:"],
    allowI: ["iPhone or iPad: open Settings, then Safari, then Microphone, and choose Allow.", "iPhone o iPad: abre Ajustes, luego Safari, luego Micrófono, y elige Permitir."],
    allowC: ["Computer: click the icon to the left of the web address, and allow the microphone.", "Computadora: haz clic en el icono a la izquierda de la dirección web y permite el micrófono."],
    allowThen: ["Then press Record again.", "Luego pulsa Grabar otra vez."],
    nomic: ["No microphone was found. Plug one in, or use a phone or tablet.", "No se encontró un micrófono. Conecta uno, o usa un teléfono o una tableta."],
    fail: ["That did not work. Please try again.", "Eso no funcionó. Inténtalo otra vez."],
    inLvl: ["Your level", "Tu nivel"], outLvl: ["What you hear", "Lo que oyes"],
    off: ["Off", "No"], small: ["Small room", "Sala pequeña"], big: ["Big hall", "Sala grande"], size: ["Room size", "Tamaño de la sala"]
  };
  /* the controls: plain words; each one says what it does to the voice */
  var CTRL = [
    { k: "lc", t: ["Low cut", "Cortar graves"], s: ["Takes away rumble and breath", "Quita retumbo y respiración"], opts: [0, 80, 120, 180, 300],
      ow: { 0: ["Off", "No"], 80: ["A little", "Un poco"], 120: ["Some", "Algo"], 180: ["More", "Más"], 300: ["Lots", "Mucho"] } },
    { k: "body", t: ["Body", "Cuerpo"], s: ["Warmth, low down", "Calidez, en lo grave"], min: -6, max: 6, unit: "dB" },
    { k: "pres", t: ["Presence", "Presencia"], s: ["Words come forward", "Las palabras se oyen al frente"], min: -6, max: 6, unit: "dB" },
    { k: "air", t: ["Air", "Aire"], s: ["Sparkle on top", "Brillo arriba"], min: -6, max: 9, unit: "dB" },
    { k: "sq", t: ["Squeeze", "Apretar"], s: ["Evens out loud and soft", "Iguala lo fuerte y lo suave"], min: 0, max: 100 },
    { k: "ss", t: ["Soft S", "S suave"], s: ["Calms sharp s and t sounds", "Calma las s y t agudas"], min: 0, max: 100, slow: 1 },
    { k: "tune", t: ["Tune", "Afinar"], s: ["Pulls notes into the song's key", "Lleva las notas a la tonalidad"], min: 0, max: 100, slow: 1 },
    { k: "dbl", t: ["Double", "Doblar"], s: ["Sounds like two of you", "Suena como si fueran dos"], min: 0, max: 100 },
    { k: "echo", t: ["Echo", "Eco"], s: ["Repeats in time with the song", "Se repite a tiempo con la canción"], min: 0, max: 100 },
    { k: "room", t: ["Room", "Sala"], s: ["Space around the voice", "Espacio alrededor de la voz"], min: 0, max: 100 },
    { k: "vol", t: ["Volume", "Volumen"], s: ["How loud the take is", "Qué tan fuerte suena la toma"], min: -12, max: 6, unit: "dB" }
  ];
  var BASE = { lc: 80, body: 0, pres: 0, air: 0, sq: 50, ss: 20, tune: 0, spd: 65, dbl: 0, echo: 0, room: 18, big: 0, phone: 0, vol: 0 };
  function P_(o) { var p = {}; for (var k in BASE) p[k] = BASE[k]; for (var j in o) p[j] = o[j]; return p; }
  var PRESETS = {
    clean: { t: ["Clean", "Limpia"], s: ["Your voice, clear", "Tu voz, clara"], p: P_({}) },
    warm: { t: ["Warm", "Cálida"], s: ["Soft and close", "Suave y cercana"], p: P_({ lc: 80, body: 3, pres: -1, air: 1, sq: 45, room: 22 }) },
    radio: { t: ["Radio", "Radio"], s: ["Bright and ready to play", "Brillante y lista para sonar"], p: P_({ lc: 120, body: -2, pres: 4, air: 5, sq: 72, ss: 45, room: 14, echo: 10 }) },
    rap: { t: ["Rap", "Rap"], s: ["Tight, punchy, doubled", "Firme, con golpe y doblada"], p: P_({ lc: 120, pres: 3, air: 2, sq: 80, ss: 35, dbl: 35, room: 8 }) },
    echo: { t: ["Echo", "Eco"], s: ["Repeats in time", "Se repite a tiempo"], p: P_({ echo: 55, room: 20 }) },
    hall: { t: ["Big hall", "Sala grande"], s: ["A voice in a great room", "Una voz en una sala enorme"], p: P_({ sq: 45, ss: 25, air: 2, room: 55, big: 1 }) },
    tuned: { t: ["Tuned", "Afinada"], s: ["In the song's key", "En la tonalidad"], p: P_({ tune: 85, spd: 65 }) },
    robot: { t: ["Robot", "Robot"], s: ["Hard tuned, like the radio hits", "Afinada al máximo, como en la radio"], p: P_({ lc: 120, pres: 2, sq: 60, tune: 100, spd: 100, dbl: 20, room: 12 }) },
    phone: { t: ["Phone", "Teléfono"], s: ["Like an old radio", "Como una radio vieja"], p: P_({ lc: 300, sq: 65, ss: 0, room: 6, phone: 1 }) }
  };
  var ORDER = ["clean", "warm", "radio", "rap", "echo", "hall", "tuned", "robot", "phone"];
  var KEY = "aog.vocal.v1", MAX_SEC = 240, MAX_TAKES = 8;
  var CAP_WK = 'class AogVocalCap extends AudioWorkletProcessor{constructor(){super();this.on=true;this.b=[];this.n=0;this.t=-1;' +
    'this.port.onmessage=e=>{if(e.data==="stop"){this.flush();this.on=false;this.port.postMessage({end:true});}};}' +
    'flush(){if(!this.n)return;const o=new Float32Array(this.n);let k=0;for(const x of this.b){o.set(x,k);k+=x.length;}this.port.postMessage({t:this.t,d:o},[o.buffer]);this.b=[];this.n=0;this.t=-1;}' +
    'process(ins){if(!this.on)return false;const c=ins[0]&&ins[0][0];if(c&&c.length){if(this.t<0)this.t=currentTime;this.b.push(c.slice(0));this.n+=c.length;if(this.n>=sampleRate/4)this.flush();}return true;}}' +
    'registerProcessor("aog-vocal-cap",AogVocalCap);';

  var B = {
    ac: null, wk: null, root: null,
    bk: null, bkP: null, bkBuf: null, bkFor: null,
    state: "idle",   /* idle · asking · rec · stopping */
    line: "", lineF: null, allow: false,
    stream: null, src: null, node: null, sink: null, an: null, monG: null, chunks: [], t0: -1, Tb: 0, lat: 0, from: 1, loop: false, play: null, raf: 0, recAt: 0, shownSec: -1,
    takes: [], cur: -1, seq: 0, gone: null,
    snd: "clean", P: P_({}), pre: null, preP: null, making: false,
    hear: null, oraf: 0, busy: false, fit: false, slowT: 0
  };
  function store() { try { return JSON.parse(localStorage.getItem(KEY) || "null") || {}; } catch (e) { return {}; } }
  function keep(o) { try { var s = store(); for (var k in o) s[k] = o[k]; localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function tw(k, f) { var x = W[k] ? W[k][es() ? 1 : 0] : k; if (f) for (var n in f) x = x.split("{" + n + "}").join(f[n]); return x; }
  function L(a) { return a[es() ? 1 : 0]; }
  function $(id) { return D.getElementById(id); }
  function txt(e, t) { if (e && e.textContent !== t) e.textContent = t; }
  function att(e, k, v) { if (e && e.getAttribute(k) !== v) e.setAttribute(k, v); }
  function clock(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
  function cur() { return B.cur >= 0 ? B.takes[B.cur] || null : null; }

  /* ── the room ── */
  function build(root) {
    B.root = root;
    root.innerHTML =
      '<p class="vb-help" id="vbHelp" hidden></p>' +
      '<div class="vb-cols"><div class="vb-col">' +
      '<section class="vb-panel vb-booth" aria-labelledby="vbRecH"><h2 class="vb-h" id="vbRecH"></h2>' +
      '<button type="button" class="vb-b vb-rec" id="vbRec" aria-pressed="false"></button>' +
      '<div class="vb-mrow"><span class="vb-ml" id="vbInL"></span><div class="vb-meter" aria-hidden="true"><span id="vbIn"></span></div></div>' +
      '<p class="vb-line" id="vbLine" role="status" aria-live="polite"></p>' +
      '<div class="vb-allow" id="vbAllow" hidden></div>' +
      '<label class="vb-mon"><input type="checkbox" id="vbMon"> <span id="vbMonT"></span></label><p class="vb-small" id="vbMonW" hidden></p>' +
      '</section>' +
      '<section class="vb-panel" id="vbTakesBox" hidden aria-labelledby="vbTakesH"><h2 class="vb-h" id="vbTakesH"></h2><ul class="vb-takes" id="vbTakes"></ul>' +
      '<button type="button" class="vb-b vb-back" id="vbBack" hidden></button></section>' +
      '</div><div class="vb-col" id="vbRight" hidden>' +
      '<section class="vb-panel" aria-labelledby="vbSndH"><h2 class="vb-h" id="vbSndH"></h2><div class="vb-snds" id="vbSnds">' +
      ORDER.concat("custom").map(function (k) { return '<button type="button" class="vb-snd" data-snd="' + k + '" aria-pressed="false"' + (k === "custom" ? ' hidden' : '') + '><b></b><span></span></button>'; }).join("") +
      '</div></section>' +
      '<details class="vb-panel vb-shape" id="vbShape"><summary id="vbShapeH"></summary><div class="vb-ctrls" id="vbCtrls">' +
      CTRL.map(function (c) {
        if (c.opts) return '<label class="vb-c"><span class="vb-ct"><b data-t="' + c.k + '"></b><i data-v="' + c.k + '"></i></span><small data-s="' + c.k + '"></small>' +
          '<select class="vb-sel" data-k="' + c.k + '">' + c.opts.map(function (o) { return '<option value="' + o + '"></option>'; }).join("") + '</select></label>';
        return '<label class="vb-c"><span class="vb-ct"><b data-t="' + c.k + '"></b><i data-v="' + c.k + '"></i></span><small data-s="' + c.k + '"></small>' +
          '<input type="range" class="vb-r" data-k="' + c.k + '" min="' + c.min + '" max="' + c.max + '" step="1"></label>';
      }).join("") +
      '<label class="vb-c"><span class="vb-ct"><b id="vbBigT"></b></span><select class="vb-sel" id="vbBig"><option value="0"></option><option value="1"></option></select></label>' +
      '</div></details>' +
      '<div class="vb-acts"><button type="button" class="vb-b vb-hear" id="vbHear"></button>' +
      '<div class="vb-mrow"><span class="vb-ml" id="vbOutL"></span><div class="vb-meter" aria-hidden="true"><span id="vbOut"></span></div></div>' +
      '<button type="button" class="vb-b vb-add" id="vbAdd"></button></div>' +
      '</div></div>';
    $("vbRec").addEventListener("click", recPress);
    $("vbHear").addEventListener("click", hearPress);
    $("vbAdd").addEventListener("click", addPress);
    $("vbBack").addEventListener("click", bringBack);
    $("vbMon").checked = !!store().mon;
    $("vbMon").addEventListener("change", function () { keep({ mon: $("vbMon").checked }); paint(); });
    [].forEach.call(root.querySelectorAll(".vb-snd"), function (b) { b.addEventListener("click", function () { var k = b.getAttribute("data-snd"); if (k !== "custom") pick(k); }); });
    [].forEach.call(root.querySelectorAll(".vb-r,.vb-sel[data-k]"), function (r) {
      r.addEventListener("input", function () { setCtrl(r.getAttribute("data-k"), +r.value); });
    });
    $("vbBig").addEventListener("input", function () { setCtrl("big", +$("vbBig").value); });
    $("vbTakes").addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("button"); if (!b) return;
      var i = +b.getAttribute("data-i"); if (b.classList.contains("vb-tx")) dropTake(i); else useTake(i);
    });
    if (matchMedia("(min-width: 700px)").matches) $("vbShape").open = true;   /* a phone keeps it closed: the sounds first */
    try { new MutationObserver(function () { paint(); }).observe(H, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
    D.addEventListener("visibilitychange", function () { if (D.hidden) rest(); });
    window.addEventListener("pagehide", rest);
    window.addEventListener("aog-hush", function (e) { if (e.detail && e.detail.on) rest(); });   /* AOG-SILENT-V1: the Studio's hush */
    paint();
    getBacking(true);
  }
  function say(k, f) { B.line = k; B.lineF = f || null; if (k !== "added") B.fit = false; paint(); }
  function paint() {
    if (!B.root) return;
    var e = es(), tk = cur(), rec = B.state === "rec";
    var help = $("vbHelp"); txt(help, tw("help")); help.hidden = !!store().seen;
    txt($("vbRecH"), tw("mic"));
    var rb = $("vbRec"); txt(rb, rec ? tw("stop") + "  " + clock(B.ac ? B.ac.currentTime - B.recAt : 0) : B.takes.length ? tw("recMore") : tw("rec"));
    att(rb, "aria-pressed", rec ? "true" : "false"); rb.disabled = B.state === "asking" || B.state === "stopping";
    txt($("vbInL"), tw("inLvl")); txt($("vbOutL"), tw("outLvl"));
    var ln = B.line ? tw(B.line, B.lineF) : ""; if (B.line === "added" && B.fit) ln += " " + tw("fit"); txt($("vbLine"), ln);
    var al = $("vbAllow"); al.hidden = !B.allow;
    if (B.allow) { var h = '<p>' + tw("denied") + '</p><p>' + tw("allowI") + '</p><p>' + tw("allowC") + '</p><p>' + tw("allowThen") + '</p>' + (B.err ? '<p class="vb-code">(' + B.err.replace(/[^A-Za-z]/g, "") + ')</p>' : ''); if (al.__h !== h) { al.innerHTML = h; al.__h = h; } }
    txt($("vbMonT"), tw("mon")); $("vbMonW").hidden = !$("vbMon").checked; txt($("vbMonW"), tw("monWarn")); $("vbMon").disabled = rec;
    /* the takes */
    $("vbTakesBox").hidden = !B.takes.length && !B.gone; txt($("vbTakesH"), tw("takesH"));
    var lh = B.takes.map(function (t, i) { var on = i === B.cur;
      return '<li><button type="button" class="vb-tk" data-i="' + i + '" aria-pressed="' + on + '" aria-label="' + tw("pickTake", { n: t.n }) + '"><b>' + tw("take", { n: t.n }) + '</b><span>' + clock(t.body) + (t.added ? " · ✓" : "") + '</span></button>' +
        '<button type="button" class="vb-b vb-tx" data-i="' + i + '" aria-label="' + tw("drop", { n: t.n }) + '">✕</button></li>'; }).join("");
    var ul = $("vbTakes"); if (ul.__h !== lh) { ul.innerHTML = lh; ul.__h = lh; }
    var bb = $("vbBack"); bb.hidden = !B.gone; txt(bb, tw("back"));
    /* the sound and its controls, once there is a take */
    $("vbRight").hidden = !tk;
    txt($("vbSndH"), tw("sndH")); txt($("vbShapeH"), tw("shapeH"));
    [].forEach.call(B.root.querySelectorAll(".vb-snd"), function (b) { var k = b.getAttribute("data-snd"), pr = k === "custom" ? { t: W.custom, s: W.customS } : PRESETS[k];
      txt(b.querySelector("b"), L(pr.t)); txt(b.querySelector("span"), L(pr.s)); att(b, "aria-pressed", B.snd === k ? "true" : "false");
      if (k === "custom") b.hidden = B.snd !== "custom"; });
    CTRL.forEach(function (c) {
      txt(B.root.querySelector('[data-t="' + c.k + '"]'), L(c.t)); txt(B.root.querySelector('[data-s="' + c.k + '"]'), L(c.s));
      var v = B.P[c.k], inp = B.root.querySelector('[data-k="' + c.k + '"]');
      if (String(inp.value) !== String(v)) inp.value = v;
      if (c.opts) { [].forEach.call(inp.options, function (o) { txt(o, L(c.ow[o.value])); }); txt(B.root.querySelector('[data-v="' + c.k + '"]'), L(c.ow[v] || c.ow[0])); }
      else txt(B.root.querySelector('[data-v="' + c.k + '"]'), c.unit ? (v > 0 ? "+" : "") + v : String(v));
    });
    txt($("vbBigT"), tw("size")); var bg = $("vbBig"); txt(bg.options[0], tw("small")); txt(bg.options[1], tw("big")); if (bg.value !== String(B.P.big)) bg.value = String(B.P.big);
    var hb = $("vbHear"); txt(hb, B.hear ? tw("hearStop") : tw("hear")); att(hb, "aria-pressed", B.hear ? "true" : "false"); hb.disabled = !tk || B.making;
    var ab = $("vbAdd"); txt(ab, B.busy ? tw("adding") : tw("add")); ab.disabled = !tk || B.busy || !!(tk && tk.added); ab.hidden = !tk;
  }

  /* ── My Track, from the desk (out of sight) ── */
  function getBacking(say0) {
    var S = SH();
    if (!S || !S.desk) { B.bk = null; if (say0 && B.state === "idle") say(S ? "alone" : "solo"); return Promise.resolve(null); }
    if (say0 && B.state === "idle" && !B.takes.length) say("prep");
    var p = B.bkP = S.desk().then(function (w) { return w.__aogStudio.voiceBacking(); }).then(function (bk) { if (B.bkP === p) B.bk = bk || null; return bk || null; },
      function () { if (B.bkP === p) B.bk = null; return null; });
    p.then(function (bk) { if (B.bkP !== p || B.state !== "idle" || B.takes.length) return; readyLine(bk); });
    return p;
  }
  function fromBar() { var o = null; try { o = SH() && SH().over ? SH().over() : null; } catch (e) {} return o && o.from >= 1 ? o.from | 0 : 1; }
  function readyLine(bk) { var f = fromBar(); if (!bk) say("alone"); else if (f > 1) say("readyFrom", { n: f }); else say("ready"); }
  function bkBuffer(bk) {
    if (!bk) return null;
    if (B.bkFor === bk && B.bkBuf) return B.bkBuf;
    var c = B.ac, buf = c.createBuffer(2, bk.L.length, bk.sr);
    buf.copyToChannel(bk.L instanceof Float32Array ? bk.L : new Float32Array(bk.L), 0);
    buf.copyToChannel(bk.R instanceof Float32Array ? bk.R : new Float32Array(bk.R || bk.L), 1);
    B.bkFor = bk; B.bkBuf = buf; return buf;
  }
  function bkSource(bk, at, offs) {
    var c = B.ac, buf = bkBuffer(bk), s = c.createBufferSource(), g = c.createGain();
    s.buffer = buf; s.connect(g); g.connect(c.destination);
    var loop = !!bk.loop && bk.sec > 0.5 && bk.sec <= buf.duration + 0.01;
    if (loop) { s.loop = true; s.loopStart = 0; s.loopEnd = Math.min(buf.duration, bk.sec); if (offs >= s.loopEnd - 0.05) offs = offs % s.loopEnd; }
    else if (offs >= buf.duration - 0.05) offs = 0;
    s.start(at, offs);
    return { s: s, g: g, loop: loop, offs: offs };
  }
  function fade(p) { if (!p) return; try { var now = B.ac.currentTime; p.g.gain.setValueAtTime(p.g.gain.value, now); p.g.gain.linearRampToValueAtTime(0, now + 0.06); p.s.stop(now + 0.08); } catch (e) {} }

  /* ── the sound engine: made inside a tap ── */
  function wake() {
    try {
      if (!B.ac) { var AC = window.AudioContext || window.webkitAudioContext; try { B.ac = new AC({ latencyHint: "interactive" }); } catch (e) { B.ac = new AC(); } if (window.AOGVU && AOGVU.own) AOGVU.own(B.ac); }
      if (B.ac.state !== "running") B.ac.resume();
    } catch (e) {}
    return B.ac;
  }
  function sleepSoon() { setTimeout(function () { try { if (B.ac && B.ac.state === "running" && B.state !== "rec" && !B.hear) B.ac.suspend(); } catch (e) {} }, 250); }
  function rest() { if (B.state === "rec") stopRec(); hearStop(); sleepSoon(); }

  /* ── ● Record / ■ Stop ── */
  function recPress() {
    if (B.state === "rec") { stopRec(); return; }
    if (B.state === "asking" || B.state === "stopping" || B.busy) return;
    hearStop();
    var c = wake(); if (!c) { say("fail"); return; }
    B.allow = false; B.state = "asking"; say("asking");
    var mon = $("vbMon").checked, md = navigator.mediaDevices;
    /* with headphones and Hear myself, the browser's echo cancelling would fight your own voice in your ears */
    var ask = getMic({ audio: { echoCancellation: !mon, noiseSuppression: false, autoGainControl: false } });
    ask.then(function (stream) { return (B.bkP || getBacking(false)).then(function (bk) { return startRec(stream, bk, mon); }); },
      function (e) {
        B.state = "idle"; var n = e && e.name;
        B.err = n || "";
        if (n === "NotFoundError" || n === "OverconstrainedError" || n === "NotReadableError") { B.allow = false; say("nomic"); } else { B.allow = true; say(""); }
        sleepSoon();
      }).catch(function () { release(); B.state = "idle"; say("fail"); sleepSoon(); });
  }
  /* AOG-VOCAL-MIC-V2 (Jimmy, 2026-10-23, iPad: "I HAVE Allowed the microphone but it still says I can't"): Safari can refuse
     the microphone to the room's frame even when the site is allowed. So ask the room first (with the booth's settings, then
     plain), then the Studio around it (same site, the way the old Sing or rap key asked); "off" only when every way says no. */
  function getMic(want) {
    var ways = [], own = navigator.mediaDevices, top = null;
    try { if (window.parent !== window && window.parent.navigator.mediaDevices) top = window.parent.navigator.mediaDevices; } catch (e) {}
    [own, top].forEach(function (md) { if (md && md.getUserMedia) { ways.push(function () { return md.getUserMedia(want); }); ways.push(function () { return md.getUserMedia({ audio: true }); }); } });
    if (!ways.length) return Promise.reject(Object.assign(new Error("none"), { name: "NotFoundError" }));
    var first = null;
    return ways.reduce(function (p, w) { return p.catch(function (e) { if (!first) first = e; return w(); }); }, Promise.reject(null))
      .catch(function (e) { throw first || e; });
  }
  function startRec(stream, bk, mon) {
    var c = B.ac;
    B.stream = stream; B.chunks = []; B.t0 = -1;
    B.src = c.createMediaStreamSource(stream);
    B.sink = c.createGain(); B.sink.gain.value = 0; B.sink.connect(c.destination);
    B.an = c.createAnalyser(); B.an.fftSize = 1024; B.src.connect(B.an); B.an.connect(B.sink);
    if (mon) { var lc = c.createBiquadFilter(); lc.type = "highpass"; lc.frequency.value = 90; var cp = c.createDynamicsCompressor(); cp.threshold.value = -22; cp.ratio.value = 3;
      var g = c.createGain(); g.gain.value = 0.9; var rv = c.createConvolver(); rv.normalize = false; rv.buffer = roomIR(c, 1.1, 7); var rg = c.createGain(); rg.gain.value = 0.16;
      B.src.connect(lc); lc.connect(cp); cp.connect(g); g.connect(c.destination); cp.connect(rg); rg.connect(rv); rv.connect(c.destination); B.monG = [lc, cp, g, rv, rg]; }
    var ready;
    if (c.audioWorklet && window.AudioWorkletNode) {
      if (!B.wk) B.wk = c.audioWorklet.addModule(URL.createObjectURL(new Blob([CAP_WK], { type: "text/javascript" })));
      ready = B.wk.then(function () {
        B.node = new AudioWorkletNode(c, "aog-vocal-cap", { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1] });
        B.node.port.onmessage = function (e) { var m = e.data; if (m && m.d) { if (B.t0 < 0) B.t0 = m.t; B.chunks.push(m.d); } if (m && m.end && B.onEnd) B.onEnd(); };
      });
    } else {
      var N = 4096, sp = c.createScriptProcessor(N, 1, 1);
      sp.onaudioprocess = function (e) { if (B.state !== "rec") return; if (B.t0 < 0) B.t0 = e.playbackTime - N / c.sampleRate; B.chunks.push(new Float32Array(e.inputBuffer.getChannelData(0))); };
      B.node = sp; ready = Promise.resolve();
    }
    return ready.then(function () {
      B.src.connect(B.node); B.node.connect(B.sink);
      var inLat = 0; try { var st = stream.getAudioTracks()[0].getSettings(); inLat = st && st.latency > 0 ? st.latency : 0; } catch (e) {}
      var trip = 0; try { var m = JSON.parse(localStorage.getItem("aog.latency.v1") || "null"); trip = m && m.rt > 0 && m.rt < 1 ? +m.rt : 0; } catch (e) {}
      B.lat = trip > 0 ? trip : (c.outputLatency > 0 ? c.outputLatency : 0) + (c.baseLatency > 0 ? c.baseLatency : 0) + inLat;
      B.from = fromBar(); B.bkUsed = bk || null; B.loop = false; B.recAt = c.currentTime;
      if (bk) {
        B.Tb = c.currentTime + 0.3;
        var offs = (B.from - 1) * bk.barSec;
        B.play = bkSource(bk, B.Tb, offs); B.loop = B.play.loop;
        if (B.play.offs !== offs) B.from = 1;
        if (!B.loop) B.play.s.onended = function () { if (B.state === "rec") stopRec("ended"); };
      } else { B.Tb = 0; B.play = null; }
      B.state = "rec"; B.shownSec = -1; say("recOn"); keep({ seen: true });
      meterIn();
    });
  }
  function meterIn() {
    cancelAnimationFrame(B.raf);
    var an = B.an, lv = $("vbIn"), buf = new Float32Array(an ? an.fftSize : 1024), shown = 0, last = 0;
    var step = function () {
      if (B.state !== "rec" || !B.an) { lv.style.transform = "scaleX(0)"; B.raf = 0; return; }
      B.an.getFloatTimeDomainData(buf); var pk = 0; for (var i = 0; i < buf.length; i++) { var a = buf[i] < 0 ? -buf[i] : buf[i]; if (a > pk) pk = a; }
      var db = pk > 0 ? 20 * Math.log10(pk) : -90, w = Math.max(0, Math.min(1, (db + 54) / 54)), now = performance.now();
      shown = w >= shown ? w : Math.max(w, shown - (now - (last || now)) / 1400); last = now;
      lv.style.transform = "scaleX(" + shown.toFixed(3) + ")";
      var s = Math.floor(B.ac.currentTime - B.recAt); if (s !== B.shownSec) { B.shownSec = s; paint(); }
      if (B.ac.currentTime - B.recAt > MAX_SEC) { stopRec(); return; }
      B.raf = requestAnimationFrame(step);
    };
    B.raf = requestAnimationFrame(step);
  }
  function release() {
    [B.src, B.node, B.sink, B.an].concat(B.monG || []).forEach(function (n) { try { if (n) n.disconnect(); } catch (e) {} });
    if (B.stream) B.stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });   /* the microphone is let go at once */
    B.src = B.node = B.sink = B.an = B.stream = B.monG = null;
  }
  function stopRec(why) {
    if (B.state !== "rec") return;
    B.state = "stopping"; cancelAnimationFrame(B.raf); B.raf = 0; $("vbIn").style.transform = "scaleX(0)"; paint();
    var node = B.node, c = B.ac;
    var flushed = node && node.port ? new Promise(function (ok) { B.onEnd = ok; try { node.port.postMessage("stop"); } catch (e) { ok(); } setTimeout(ok, 600); }) : Promise.resolve();
    flushed.then(function () {
      B.onEnd = null; fade(B.play); B.play = null; release();
      var sr = c.sampleRate, n = 0; B.chunks.forEach(function (x) { n += x.length; });
      var X = new Float32Array(n), o = 0; B.chunks.forEach(function (x) { X.set(x, o); o += x.length; }); B.chunks = [];
      var sec = n / sr, bk = B.bkUsed;
      var head = bk ? (B.Tb + B.lat) - B.t0 : Math.min(0.05, sec / 4); if (!(head >= 0)) head = 0;
      var cut = Math.max(0, head - 0.25), k0 = Math.round(cut * sr), dry = X.slice(k0); head -= k0 / sr;
      var body = dry.length / sr - head;
      B.state = "idle"; sleepSoon();
      if (body < 0.3) { say("short"); return; }
      var bpm = 0; try { var g = window.AOGSong && AOGSong.get(); bpm = g && g.hasBpm ? g.bpm : 0; } catch (e) {}
      var tk = { id: ++B.seq, n: B.seq, dry: dry, sr: sr, head: head, body: body, from: B.from, loop: B.loop, bpm: bpm || (bk ? bk.bpm : 0) || 90, bk: bk };
      B.takes.push(tk); if (B.takes.length > MAX_TAKES) B.takes.shift();
      B.cur = B.takes.length - 1; B.pre = null;
      say(why === "ended" ? "ended" : "took");
      try { (window.parent || window).dispatchEvent(new CustomEvent("aog-studio-did", { detail: { what: "sang" } })); } catch (e) {}   /* AOG-MISSIONS-V1 */
    });
  }
  /* ── the takes ── */
  function useTake(i) { if (i === B.cur || !B.takes[i]) return; hearStop(); B.cur = i; B.pre = null; say(""); }
  function dropTake(i) {
    var t = B.takes[i]; if (!t) return; hearStop();
    B.gone = { t: t, i: i }; B.takes.splice(i, 1);
    if (B.cur >= B.takes.length) B.cur = B.takes.length - 1; else if (i < B.cur) B.cur--; else if (i === B.cur) B.cur = Math.min(i, B.takes.length - 1);
    B.pre = null; say("gone", { n: t.n }); sleepSoon();
  }
  function bringBack() { var g = B.gone; if (!g) return; B.gone = null; B.takes.splice(Math.min(g.i, B.takes.length), 0, g.t); B.cur = B.takes.indexOf(g.t); B.pre = null; say(""); }

  /* ── the sound: one chain, the same for ▶ Hear it (live) and + Add (offline) ── */
  function rnd(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 * 2 - 1; }; }
  function roomIR(ctx, sec, decay) {
    var sr = ctx.sampleRate, n = Math.round(sec * sr), b = ctx.createBuffer(2, n, sr);
    for (var ch = 0; ch < 2; ch++) { var d = b.getChannelData(ch), r = rnd(7 + ch * 31), lp = 0, e = 0;
      for (var i = 0; i < n; i++) { var t = i / sr; lp += 0.55 * (r() - lp); d[i] = lp * Math.exp(-t * decay) * (t < 0.008 ? t / 0.008 : 1); e += d[i] * d[i]; }
      var g = e > 0 ? 1 / Math.sqrt(e) : 0; for (var j = 0; j < n; j++) d[j] *= g; }   /* as loud as the voice itself: the wet level says how much room */
    return b;
  }
  var IR = {};
  function irOf(ctx, big) { var k = (big ? "b" : "s") + ctx.sampleRate; if (ctx instanceof (window.OfflineAudioContext || window.webkitOfflineAudioContext || function () {})) return big ? roomIR(ctx, 2.8, 2.4) : roomIR(ctx, 1.1, 6.5);
    return IR[k] || (IR[k] = big ? roomIR(ctx, 2.8, 2.4) : roomIR(ctx, 1.1, 6.5)); }
  function dbg(db) { return Math.pow(10, db / 20); }
  function chain(ctx, src, P, bpm) {
    var out = ctx.createGain(), T = {}, lfos = [];
    function bq(type, f, q, gain) { var z = ctx.createBiquadFilter(); z.type = type; z.frequency.value = f; if (q != null) z.Q.value = q; if (gain != null) z.gain.value = gain; return z; }
    var a = src;
    if (P.phone) {   /* the old phone or radio: a narrow band and a little drive */
      var sh = ctx.createWaveShaper(), cu = new Float32Array(2049); for (var i = 0; i < cu.length; i++) { var v = i / 1024 - 1; cu[i] = Math.tanh(2.6 * v) / Math.tanh(2.6); }
      sh.curve = cu; sh.oversample = "2x";
      [bq("highpass", 300, 0.7), bq("highpass", 300, 0.7), bq("peaking", 1700, 1, 6), ctx.createGain(), sh, bq("lowpass", 3400, 0.7), bq("lowpass", 3400, 0.7)].forEach(function (n, k) { if (k === 3) n.gain.value = dbg(4); a.connect(n); a = n; });
    }
    T.lc1 = bq("highpass", P.lc || 10, 0.7); T.lc2 = bq("highpass", P.lc || 10, 0.7);
    T.body = bq("lowshelf", 220, null, P.body); T.pres = bq("peaking", 3200, 0.9, P.pres); T.air = bq("highshelf", 10000, null, P.air);
    T.cp = ctx.createDynamicsCompressor(); T.cp.knee.value = 8; T.cp.attack.value = 0.004; T.cp.release.value = 0.16;
    T.mk = ctx.createGain(); T.vol = ctx.createGain();
    [T.lc1, T.lc2, T.body, T.pres, T.air, T.cp, T.mk, T.vol].forEach(function (n) { a.connect(n); a = n; });
    var dry = a; dry.connect(out);
    /* Double: two copies a few milliseconds late, each drifting slowly, one left and one right */
    T.dblG = ctx.createGain(); dry.connect(T.dblG);
    [[0.017, 0.31, -0.75], [0.026, 0.43, 0.75]].forEach(function (z) {
      var dl = ctx.createDelay(0.1), lfo = ctx.createOscillator(), dep = ctx.createGain(), pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
      dl.delayTime.value = z[0]; lfo.frequency.value = z[1]; dep.gain.value = 0.0016; lfo.connect(dep); dep.connect(dl.delayTime); lfo.start(0); lfos.push(lfo);
      if (pan.pan) pan.pan.value = z[2]; T.dblG.connect(dl); dl.connect(pan); pan.connect(out);
    });
    /* Echo: on the dotted eighth of the song's tempo, darker each time round */
    var beat = 60 / (bpm > 0 ? bpm : 90), dt = Math.min(1.9, 0.75 * beat);
    T.echoG = ctx.createGain(); var ed = ctx.createDelay(2), efb = ctx.createGain(), etone = bq("lowpass", 3600, 0.7), elo = bq("highpass", 220, 0.7);
    ed.delayTime.value = dt; efb.gain.value = dbg(-8.5);
    dry.connect(ed); ed.connect(etone); etone.connect(elo); elo.connect(efb); efb.connect(ed); elo.connect(T.echoG); T.echoG.connect(out);
    /* Room */
    T.roomG = ctx.createGain(); var cv = ctx.createConvolver(); cv.normalize = false; cv.buffer = irOf(ctx, P.big);
    dry.connect(T.roomG); T.roomG.connect(cv); cv.connect(out);
    T.dt = dt;
    function set(P, now) {
      var t = now == null ? 0 : now, st = function (p, v) { if (now == null) p.value = v; else p.setTargetAtTime(v, t, 0.03); };
      st(T.lc1.frequency, P.lc || 10); st(T.lc2.frequency, P.lc || 10);
      st(T.body.gain, P.body); st(T.pres.gain, P.pres); st(T.air.gain, P.air);
      st(T.cp.threshold, -6 - 0.3 * P.sq); st(T.cp.ratio, 1.5 + 0.045 * P.sq); st(T.mk.gain, dbg(0.09 * P.sq));
      st(T.vol.gain, dbg(P.vol)); st(T.dblG.gain, 0.5 * P.dbl / 100);
      st(T.echoG.gain, 0.6 * P.echo / 100); st(T.roomG.gain, P.room / 100);
    }
    set(P, null);
    function stop(at) { lfos.forEach(function (o) { try { o.stop(at); } catch (e) {} }); setTimeout(function () { try { out.disconnect(); } catch (e) {} }, 400); }
    return { out: out, set: set, stop: stop, big: P.big, phone: P.phone };
  }
  /* Soft S: the sharp highs (above 5 kHz) are pulled down when they jump above the rest of the voice */
  function deEss(x, sr, amt) {
    if (!(amt > 0)) return x;
    var f = 5200, w = Math.tan(Math.PI * f / sr), q = Math.SQRT1_2, k = 1 + w / q + w * w,
      b0 = 1 / k, b1 = -2 / k, b2 = 1 / k, a1 = 2 * (w * w - 1) / k, a2 = (1 - w / q + w * w) / k;
    var n = x.length, hi = new Float32Array(n), x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (var i = 0; i < n; i++) { var y = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = y; hi[i] = y; }
    var at = Math.exp(-1 / (0.001 * sr)), rl = Math.exp(-1 / (0.04 * sr)), eh = 0, ef = 0, out = new Float32Array(n), depth = amt / 100;
    for (var j = 0; j < n; j++) {
      var ah = hi[j] < 0 ? -hi[j] : hi[j], af = x[j] < 0 ? -x[j] : x[j];
      eh = ah > eh ? at * eh + (1 - at) * ah : rl * eh + (1 - rl) * ah;
      ef = af > ef ? at * ef + (1 - at) * af : rl * ef + (1 - rl) * af;
      var r = ef > 1e-5 ? eh / ef : 0, g = r > 0.35 ? Math.pow(0.35 / r, 1.6 * depth) : 1;
      out[j] = (x[j] - hi[j]) + hi[j] * g;
    }
    return out;
  }
  function norm(x) {
    var pk = 0; for (var i = 0; i < x.length; i++) { var a = x[i] < 0 ? -x[i] : x[i]; if (a > pk) pk = a; }
    var g = pk > 0 ? Math.min(Math.pow(10, 24 / 20), 0.5 / pk) : 1, y = new Float32Array(x.length);
    for (var j = 0; j < x.length; j++) y[j] = x[j] * g;
    return y;
  }
  function songKey() { try { var g = window.AOGSong && AOGSong.get(); return g && g.hasKey ? { key: g.key, minor: !!g.minor } : null; } catch (e) { return null; } }
  function keyName() { var k = songKey(); if (!k || !window.AOGSong) return ""; var e = es();
    return AOGSong.NOTES[e ? "es" : "en"][k.key] + " " + (e ? (k.minor ? "menor" : "mayor") : (k.minor ? "minor" : "major")); }
  function tune(x, sr, amt, spd) {
    if (!(amt > 0)) return Promise.resolve(x);
    var S = SH(); if (!S || !S.desk) return Promise.resolve(x);
    return S.desk().then(function (w) {
      var t = w.__aogStudio.dmTune; if (!t) return x;
      var ab = new w.AudioBuffer({ numberOfChannels: 1, length: x.length, sampleRate: sr }); ab.copyToChannel(new w.Float32Array(x), 0);
      var k = songKey();
      return t(ab, { amt: amt, spd: spd, key: k ? k.key : -1, minor: !!(k && k.minor) }, function () { return false; }).then(function (o) { return new Float32Array(o.getChannelData(0)); });
    }).catch(function () { return x; });
  }
  /* the take, ready for the chain: levelled, Soft S, then Tune (kept until the take, Soft S or Tune change) */
  function prepared(P0) {
    var tk = cur(), P = P0 || B.P; if (!tk) return Promise.reject(new Error("no take"));
    var sig = [tk.id, P.ss, P.tune, P.spd].join("|");
    if (B.pre && B.pre.sig === sig) return B.pre.p;
    if (!tk.norm) tk.norm = norm(tk.dry);
    var p = tune(deEss(tk.norm, tk.sr, P.ss), tk.sr, P.tune, P.spd);
    if (!P0) {   /* the one on screen is kept; a test's look at another sound is not */
      B.pre = { sig: sig, p: p };
      if (P.tune > 0) { B.making = true; paint(); p.then(function () { B.making = false; paint(); }, function () { B.making = false; paint(); }); }
    }
    return p;
  }
  function render(x, tk, P) {
    var OC = window.OfflineAudioContext || window.webkitOfflineAudioContext, sr = tk.sr;
    var tail = Math.max(1.3, P.echo > 0 ? 2.8 : 0, P.big ? 3.2 : 0), n = x.length + Math.round(tail * sr);
    var oc = new OC(2, n, sr), src = oc.createBufferSource(), b = oc.createBuffer(1, x.length, sr);
    b.copyToChannel(x, 0); src.buffer = b;
    var ch = chain(oc, src, P, tk.bpm); ch.out.connect(oc.destination); src.start(0);
    var p = oc.startRendering(); if (!p || !p.then) p = new Promise(function (ok) { oc.oncomplete = function (e) { ok(e.renderedBuffer); }; });
    return p.then(function (buf) {
      var Lc = buf.getChannelData(0), Rc = buf.getChannelData(1), pk = 0;
      for (var i = 0; i < Lc.length; i++) { var a = Math.max(Lc[i] < 0 ? -Lc[i] : Lc[i], Rc[i] < 0 ? -Rc[i] : Rc[i]); if (a > pk) pk = a; }
      if (pk > 0.89) { var g = 0.89 / pk; for (var j = 0; j < Lc.length; j++) { Lc[j] *= g; Rc[j] *= g; } }   /* never past −1 dB */
      var f = Math.min(Lc.length, Math.round(0.01 * sr)); for (var q = 0; q < f; q++) { var w = q / f, z = Lc.length - 1 - q; Lc[z] *= w; Rc[z] *= w; }
      return { L: new Float32Array(Lc), R: new Float32Array(Rc), sr: sr, tail: tail };
    });
  }
  function pick(k) {
    if (!PRESETS[k]) return;
    B.snd = k; var was = B.P; B.P = P_(PRESETS[k].p);
    if (k === "tuned" || k === "robot") say(keyName() ? "tunedKey" : "tunedNoKey", keyName() ? { key: keyName() } : null);
    applied(was);
  }
  function setCtrl(k, v) {
    var was = B.P, P = {}; for (var x in B.P) P[x] = B.P[x]; P[k] = v; B.P = P;
    if (B.snd !== "custom") B.snd = "custom";
    applied(was);
  }
  /* a change: live while it plays; Soft S and Tune, a moment later (the take carries on from where it was) */
  function applied(was) {
    paint();
    var H0 = B.hear; if (!H0) return;
    var slow = was.ss !== B.P.ss || was.tune !== B.P.tune || was.spd !== B.P.spd, again = was.big !== B.P.big || was.phone !== B.P.phone;
    if (slow || again) { clearTimeout(B.slowT); B.slowT = setTimeout(function () { if (B.hear) hear(B.ac.currentTime - B.hear.T); }, slow ? 350 : 0); return; }
    H0.ch.set(B.P, B.ac.currentTime);
  }

  /* ── ▶ Hear it: the take in its sound with the beat; the controls change it as it plays ── */
  function hearPress() { if (B.hear) { hearStop(); say(""); sleepSoon(); return; } hear(0); }
  function hear(at) {
    var tk = cur(); if (!tk) return;
    var c = wake(); hearStop();
    var want = tk;
    prepared().then(function (x) {
      if (cur() !== want) return;
      var dur = x.length / tk.sr; if (!(at >= 0) || at >= dur - 0.05) at = 0;
      var vb = c.createBuffer(1, x.length, tk.sr); vb.copyToChannel(x, 0);
      var v = c.createBufferSource(); v.buffer = vb;
      var ch = chain(c, v, B.P, tk.bpm), g = c.createGain(), an = c.createAnalyser(); an.fftSize = 1024;
      ch.out.connect(g); g.connect(c.destination); g.connect(an);
      var T = c.currentTime + 0.08, bk = tk.bk, b = null;
      v.start(T, at);
      if (bk) { var offs = (tk.from - 1) * bk.barSec + Math.max(0, at - tk.head); b = bkSource(bk, T + Math.max(0, tk.head - at), offs); }
      var Hh = { v: v, g: g, b: b, ch: ch, an: an, T: T - at, dur: dur + 1.5 };
      v.onended = function () { if (B.hear === Hh) { setTimeout(function () { if (B.hear === Hh) { hearStop(); if (B.line === "playing") say(""); sleepSoon(); } }, 1200); } };
      B.hear = Hh; if (!B.line || B.line === "took" || B.line === "added") say("playing"); else paint();
      meterOut();
    }, function () { say("fail"); });
  }
  function hearStop() {
    var Hh = B.hear; if (!Hh) return; B.hear = null; cancelAnimationFrame(B.oraf); B.oraf = 0;
    try { var o = $("vbOut"); if (o) o.style.transform = "scaleX(0)"; } catch (e) {}
    fade({ s: Hh.v, g: Hh.g }); fade(Hh.b);
    try { Hh.ch.stop(B.ac.currentTime + 0.1); } catch (e) {}   /* the Double's slow drift stops with the sound */
    paint();
  }
  function meterOut() {
    cancelAnimationFrame(B.oraf);
    var lv = $("vbOut"), buf = new Float32Array(1024), shown = 0, last = 0;
    var step = function () {
      var Hh = B.hear; if (!Hh) { lv.style.transform = "scaleX(0)"; B.oraf = 0; return; }
      Hh.an.getFloatTimeDomainData(buf); var pk = 0; for (var i = 0; i < buf.length; i++) { var a = buf[i] < 0 ? -buf[i] : buf[i]; if (a > pk) pk = a; }
      var db = pk > 0 ? 20 * Math.log10(pk) : -90, w = Math.max(0, Math.min(1, (db + 54) / 54)), now = performance.now();
      shown = w >= shown ? w : Math.max(w, shown - (now - (last || now)) / 1400); last = now;
      lv.style.transform = "scaleX(" + shown.toFixed(3) + ")";
      B.oraf = requestAnimationFrame(step);
    };
    B.oraf = requestAnimationFrame(step);
  }

  /* ── + Add to My Track: made offline with the same chain, onto the desk's track 8 at its bar ── */
  function addPress() {
    var tk = cur(), S = SH(); if (!tk || tk.added || B.busy) return;
    if (!S || !S.desk) { say("noDesk"); return; }
    hearStop(); B.busy = true; paint();
    var P = B.P, snd = B.snd;
    prepared().then(function (x) { return render(x, tk, P); }).then(function (r) {
      return S.desk().then(function (w) {
        return w.__aogStudio.voicePut({ L: r.L, R: r.R, dry: tk.dry, sr: r.sr, head: tk.head, body: tk.body, startBar: tk.from, snd: snd, loop: tk.loop });
      });
    }).then(function (res) {
      B.busy = false; tk.added = true; B.fit = !!(res && res.fit);
      say("added", { name: res && res.name || "" });
      try { S.refresh && S.refresh(); } catch (e) {}
      try { $("vbRec").focus(); } catch (e) {}
      sleepSoon();
    }, function () { B.busy = false; say("fail"); sleepSoon(); });
  }

  function start() { var r = $("vocal"); if (r && !B.root) build(r); }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();

  window.AOGVocal = {
    /* for the Studio's own tests (music-handoff/tests/studio/vocal.js), read only */
    state: function () { var t = cur(); return { state: B.state, snd: B.snd, P: B.P, takes: B.takes.length, cur: B.cur, hear: !!B.hear, busy: B.busy, making: B.making,
      take: t ? { n: t.n, sec: t.dry.length / t.sr, head: t.head, body: t.body, from: t.from, loop: t.loop, sr: t.sr, added: !!t.added } : null,
      ac: B.ac && B.ac.state, mic: !!B.stream, raf: !!(B.raf || B.oraf), line: $("vbLine") ? $("vbLine").textContent : "", allow: B.allow, gone: !!B.gone,
      bk: B.bk ? { sec: B.bk.sec, loop: B.bk.loop, bpm: B.bk.bpm } : null }; },
    render: function () { var t = cur(); return t ? prepared().then(function (x) { return render(x, t, B.P); }) : Promise.reject(new Error("no take")); },
    /* a sound as it would be added, without changing the screen: a ready-made one by name, or its settings with changes */
    make: function (k, ch) { var t = cur(); if (!t) return Promise.reject(new Error("no take")); var P = P_(PRESETS[k] ? PRESETS[k].p : B.P); if (ch) for (var x in ch) P[x] = ch[x];
      return prepared(P).then(function (x) { return render(x, t, P); }); },
    dry: function () { var t = cur(); return t ? t.norm || (t.norm = norm(t.dry)) : null; },
    presets: ORDER.slice()
  };
})();
