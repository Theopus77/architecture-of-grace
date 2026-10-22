/* AOG-MICBOOTH-V1 (2026-10-22) — 🎤 Sing or rap: the Recording Studio's vocal booth.
   Jimmy wants the Studio to be a showstopper for his 13-year-old: hearing themselves on their own beat.

   The Studio's top line has 🎤 Sing or rap (make_studio_page.py). The first tap fetches this file; nothing here runs before.
   The booth opens over the room you are in (the room goes quiet while it is open: AOGStudioShell.quiet):
     ● Record   asks for the microphone (only now, never before), then My Track plays from the From bar of ♫ With My Track
                and you sing or rap over it. A level meter moves while you record, and only then. ■ Stop ends the take.
                My Track goes round while you record when the desk can repeat it to match (every track that plays is one
                recording from bar 1 to the end: a Drum Machine loop); else it plays once and the take ends with it.
     the sounds Clean, Echo, Tuned, Phone: each made from the take, offline, in a moment; a tap plays it with the beat.
                Clean: light compression and a little room. Echo: an echo on the dotted eighth of the song's tempo, and room.
                Tuned: the desk's own pitch correction (AOG-DESK-TUNE-V1, dmTune) pulling the voice to the song's key, then
                Clean. Phone: 300–3400 Hz with a little drive, an old phone or radio.
     ▶ Hear it  the take with the beat, as it will sound on My Track.   Try again  lets the take go.
     + Add to My Track  the take, in its sound, on the Mixing Desk's track 8 at the right bar, called Voice 1, Voice 2 … (the
                dry take is kept beside it on the desk). ▶ Listen, ♫ Play along and Listen back hear it.
   How it records: on its own sound engine in the Studio page (registered with AOGVU.own), as ♫ Play along plays: the desk is
   out of sight and hushed, so it only puts My Track together (voiceBacking, offline) and takes the finished take (voicePut).
   The capture is the desk's own (an AudioWorklet that hands over the microphone's samples with the time they were heard;
   a ScriptProcessor on older browsers), and the take is lined up as the desk lines up its own: the bar's time plus the
   Timing check's round trip (aog.latency.v1), else what the browser reports.
   Calm and silent: no timers while idle; the meter's frames run only while recording; the microphone is let go at Stop;
   the sound engine rests (suspends) when nothing plays; hidden or closed, everything stops. */
(function () {
  "use strict";
  if (window.AOGMicBooth) return;
  var D = document;
  function SH() { return window.AOGStudioShell || null; }
  function es() { return (D.documentElement.getAttribute("lang") || "en").indexOf("es") === 0; }
  var WORDS = {
    title: ["Sing or rap", "Canta o rapea"], close: ["Close", "Cerrar"],
    help: ["Headphones help: then the mic hears only you.", "Los audífonos ayudan: así el micrófono solo te oye a ti."],
    prep: ["Getting My Track ready…", "Preparando mi pista…"],
    ready: ["Press Record. My Track plays, and you sing or rap over it.", "Pulsa Grabar. Suena mi pista y tú cantas o rapeas encima."],
    readyFrom: ["Press Record. My Track plays from bar {n}, and you sing or rap over it.", "Pulsa Grabar. Mi pista suena desde el compás {n} y tú cantas o rapeas encima."],
    alone: ["My Track has no beat yet. Make one in the Drum Machine, or press Record to go with no beat.", "Mi pista aún no tiene ritmo. Haz uno en la caja de ritmos, o pulsa Grabar para ir sin ritmo."],
    asking: ["Allow the microphone to start.", "Permite el micrófono para empezar."],
    rec: ["● Record", "● Grabar"], recAgain: ["● Record again", "● Grabar otra vez"], recMore: ["● Record another", "● Grabar otra"],
    stop: ["■ Stop", "■ Parar"],
    recOn: ["Recording. Press Stop when you are done.", "Grabando. Pulsa Parar cuando termines."],
    ended: ["My Track ended, so the take did too.", "Mi pista terminó, y la toma también."],
    short: ["That take was very short. Try again.", "Esa toma fue muy corta. Inténtalo otra vez."],
    took: ["Got it! Pick a sound, then press ▶ Hear it.", "¡Listo! Elige un sonido y pulsa ▶ Escúchala."],
    sndH: ["Pick a sound", "Elige un sonido"],
    clean: ["Clean", "Limpia"], cleanS: ["Your voice, clear", "Tu voz, clara"],
    echo: ["Echo", "Eco"], echoS: ["Repeats in time", "Se repite a tiempo"],
    tuned: ["Tuned", "Afinada"], tunedS: ["In the song's key", "En la tonalidad"],
    phone: ["Phone", "Teléfono"], phoneS: ["Like an old radio", "Como una radio vieja"],
    making: ["Making the sound…", "Haciendo el sonido…"],
    tunedKey: ["Tuned to {key}.", "Afinada en {key}."],
    tunedNoKey: ["The song has no key yet, so it tunes to the nearest note.", "La canción aún no tiene tonalidad, así que afina a la nota más cercana."],
    hear: ["▶ Hear it", "▶ Escúchala"], hearStop: ["■ Stop", "■ Parar"], playing: ["Playing your take with the beat.", "Suena tu toma con el ritmo."],
    again: ["Try again", "Probar otra vez"], gone: ["Ready when you are. Press Record.", "Cuando quieras. Pulsa Grabar."],
    add: ["+ Add to My Track", "+ Añadir a mi pista"], adding: ["Adding…", "Añadiendo…"],
    added: ["{name} is on My Track, on track 8.", "{name} está en mi pista, en la pista 8."],
    fit: ["The beat repeats to fit your voice.", "El ritmo se repite para que quepa tu voz."],
    denied: ["The microphone is off for this site. To turn it on:", "El micrófono está apagado para este sitio. Para encenderlo:"],
    allowI: ["iPhone or iPad: open Settings, then Safari, then Microphone, and choose Allow.", "iPhone o iPad: abre Ajustes, luego Safari, luego Micrófono, y elige Permitir."],
    allowC: ["Computer: click the icon to the left of the web address, and allow the microphone.", "Computadora: haz clic en el icono a la izquierda de la dirección web y permite el micrófono."],
    allowThen: ["Then press Record again.", "Luego pulsa Grabar otra vez."],
    nomic: ["No microphone was found. Plug one in, or try another device.", "No se encontró un micrófono. Conecta uno o prueba otro aparato."],
    fail: ["That did not work. Try again.", "No funcionó. Inténtalo otra vez."],
    meter: ["Your level", "Tu volumen"]
  };
  function tw(k, f) { var x = WORDS[k][es() ? 1 : 0]; if (f) for (var n in f) x = x.split("{" + n + "}").join(f[n]); return x; }
  var SOUNDS = ["clean", "echo", "tuned", "phone"];
  var HELP_KEY = "aog.micbooth.v1";
  var MAX_SEC = 240;
  /* the desk's capture (music-studio.html, VOICE_WK): the microphone's samples, a quarter second at a time, with the time the first was heard */
  var CAP_WK = 'class AogBoothCap extends AudioWorkletProcessor{constructor(){super();this.on=true;this.b=[];this.n=0;this.t=-1;' +
    'this.port.onmessage=e=>{if(e.data==="stop"){this.flush();this.on=false;this.port.postMessage({end:true});}};}' +
    'flush(){if(!this.n)return;const o=new Float32Array(this.n);let k=0;for(const x of this.b){o.set(x,k);k+=x.length;}this.port.postMessage({t:this.t,d:o},[o.buffer]);this.b=[];this.n=0;this.t=-1;}' +
    'process(ins){if(!this.on)return false;const c=ins[0]&&ins[0][0];if(c&&c.length){if(this.t<0)this.t=currentTime;this.b.push(c.slice(0));this.n+=c.length;if(this.n>=sampleRate/4)this.flush();}return true;}}' +
    'registerProcessor("aog-booth-cap",AogBoothCap);';

  var B = {
    el: null, opener: null, open: false,
    ac: null, wk: null,
    bk: null, bkP: null, bkBuf: null, bkFor: null,   /* My Track (the desk's voiceBacking), and as a buffer on this sound */
    state: "idle",   /* idle · asking · rec · stopping · take */
    line: "", lineF: null, allow: false,
    stream: null, src: null, node: null, sink: null, an: null, chunks: [], t0: -1, Tb: 0, lat: 0, from: 1, loop: false, play: null, raf: 0, recAt: 0, shownSec: -1,
    take: null,      /* {dry, sr, head, body, from, loop, bpm} */
    snd: "clean", made: {}, making: "",
    hear: null,      /* {v, b, g} while ▶ Hear it plays */
    fit: false, busy: false
  };

  /* ── the look: the Studio's control room (dark in both themes); the sounds on paper inserts ── */
  var CSS = '' +
    '.mb{position:fixed;inset:0;z-index:70;display:flex;justify-content:center;align-items:flex-start;overflow:auto;overscroll-behavior:contain;' +
    'padding:max(12px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));' +
    'background:#17110c;background-image:linear-gradient(180deg,#211a13 0,#17110c 220px);color:#f4ead6;-webkit-text-size-adjust:100%}' +
    '.mb[hidden]{display:none}' +
    '.mb-in{width:100%;max-width:34rem;display:grid;gap:12px;align-content:start}' +
    '.mb-top{display:flex;align-items:center;gap:10px}' +
    '#mbH{flex:1 1 auto;margin:0;font:600 1.5rem/1.15 "Fraunces",var(--display,Georgia,serif)!important;letter-spacing:0!important;color:#f4ead6!important}' +
    '.mb-b{min-height:48px;min-width:48px;display:inline-flex;align-items:center;justify-content:center;gap:.4rem;padding:0 1rem;border-radius:10px;border:1px solid #050403;' +
    'background:linear-gradient(#36302a,#2a251f 45%,#1d1915);color:#f4ead6;font:700 1rem/1.15 Inter,var(--sans,system-ui,sans-serif);cursor:pointer;touch-action:manipulation;' +
    '-webkit-tap-highlight-color:transparent;box-shadow:inset 0 1px 0 rgba(255,240,215,.13),0 2px 0 #050403;text-align:center}' +
    '.mb-b:active{transform:translateY(1px)}.mb-b:disabled{opacity:.6;cursor:default}' +
    '.mb-b:focus-visible,.mb-snd:focus-visible{outline:3px solid #e2b55c;outline-offset:2px}' +
    '.mb-help{margin:0;padding:.55rem .8rem;border-radius:4px;background:#f4ecdb;color:#1f1a12;font:italic 500 1rem/1.35 "Fraunces",var(--serif,Georgia,serif)}' +
    '.mb-help[hidden]{display:none}' +
    '.mb-rec{min-height:76px;width:100%;font-size:1.35rem;border-radius:16px;color:#fff6f2;border-color:#3b0d05;background:linear-gradient(#b4472d,#8e321f)}' +
    '.mb-rec[aria-pressed="true"]{background:linear-gradient(#f6e2a8,#e6c06a 50%,#d2a548);color:#231704;border-color:#5e4512}' +
    '.mb-meter{position:relative;height:14px;border-radius:7px;background:#0b0907;box-shadow:inset 0 1px 3px rgba(0,0,0,.8),0 1px 0 rgba(255,236,200,.07);overflow:hidden}' +
    '.mb-meter span{position:absolute;left:0;top:0;bottom:0;width:100%;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#2f9e5c,#2f9e5c 72%,#e2b55c 86%,#c4452a)}' +
    '.mb-line{margin:0;min-height:1.4em;font:500 1.05rem/1.4 Inter,var(--sans,system-ui,sans-serif);color:#f4ead6}' +
    '.mb-allow{margin:0;padding:.7rem .9rem;border-radius:4px;background:#f4ecdb;color:#1f1a12;display:grid;gap:.35rem;font:500 1rem/1.4 Inter,var(--sans,system-ui,sans-serif)}' +
    '.mb-allow[hidden]{display:none}.mb-allow p{margin:0;color:#1f1a12}' +
    '.mb-take{display:grid;gap:12px}.mb-take[hidden]{display:none}' +
    '#mbSndH{margin:4px 0 0;font:800 .8rem/1.2 Inter,var(--sans,system-ui,sans-serif)!important;letter-spacing:.12em!important;text-transform:uppercase;color:#cdbfa3!important}' +
    '.mb-snds{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}' +
    '.mb-snd{min-height:64px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:2px;padding:.45rem .8rem;border-radius:8px;border:1px solid #b9a988;' +
    'background:#f4ecdb;color:#1f1a12;text-align:left;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;box-shadow:0 2px 0 #050403}' +
    '.mb-snd b{font:800 1.12rem/1.15 Inter,var(--sans,system-ui,sans-serif);color:#1f1a12}' +
    '.mb-snd span{font:italic 500 .95rem/1.2 "Fraunces",var(--serif,Georgia,serif);color:#463c2c}' +
    '.mb-snd[aria-pressed="true"]{background:#fbf1d8;border-color:#7a5a1c;box-shadow:0 0 0 3px #e2b55c,0 2px 0 #050403}' +
    '.mb-snd[aria-pressed="true"] b::before{content:"✓ ";color:#1d6b3f}' +
    '.mb-acts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}' +
    '.mb-add{width:100%;min-height:56px;font-size:1.1rem;background:linear-gradient(#f6e2a8,#e6c06a 50%,#d2a548);color:#231704;border-color:#5e4512}' +
    '.mb-add[hidden]{display:none}' +
    '@media (min-width:700px){.mb{align-items:center}.mb-in{gap:14px}}' +
    /* a phone on its side: Record and the meter on the left, the take on the right */
    '@media (orientation:landscape) and (max-height:500px){.mb-in{max-width:52rem;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:18px;row-gap:10px}' +
    '.mb-top{grid-column:1/-1}.mb-help,.mb-rec,.mb-meter,.mb-line,.mb-allow{grid-column:1}.mb-take{grid-column:2;grid-row:2/span 6;gap:8px}' +
    '#mbSndH{margin:0}.mb-rec{min-height:60px}.mb-snd{min-height:50px}.mb-add{min-height:48px}}' +
    '@media print{.mb{display:none!important}}';

  function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function build() {
    if (B.el) return;
    var st = D.createElement("style"); st.id = "aogMicBoothCss"; st.textContent = CSS; D.head.appendChild(st);
    var m = el("div", "mb"); m.id = "aogMicBooth"; m.hidden = true;
    m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "mbH");
    m.innerHTML = '<div class="mb-in">' +
      '<div class="mb-top"><h2 id="mbH" tabindex="-1"></h2><button type="button" class="mb-b" id="mbClose"></button></div>' +
      '<p class="mb-help" id="mbHelp" hidden></p>' +
      '<button type="button" class="mb-b mb-rec" id="mbRec" aria-pressed="false"></button>' +
      '<div class="mb-meter" id="mbMeter" role="img"><span id="mbLvl"></span></div>' +
      '<p class="mb-line" id="mbLine" aria-live="polite"></p>' +
      '<div class="mb-allow" id="mbAllow" hidden><p id="mbAllow0"></p><p id="mbAllowI"></p><p id="mbAllowC"></p><p id="mbAllowT"></p></div>' +
      '<div class="mb-take" id="mbTake" hidden><h3 id="mbSndH"></h3><div class="mb-snds" role="group" aria-labelledby="mbSndH">' +
      SOUNDS.map(function (k) { return '<button type="button" class="mb-snd" data-snd="' + k + '" aria-pressed="false"><b></b><span></span></button>'; }).join("") +
      '</div><div class="mb-acts"><button type="button" class="mb-b" id="mbHear"></button><button type="button" class="mb-b" id="mbAgain"></button></div>' +
      '<button type="button" class="mb-b mb-add" id="mbAdd"></button></div></div>';
    D.body.appendChild(m); B.el = m;
    $("mbClose").addEventListener("click", close);
    $("mbRec").addEventListener("click", recPress);
    $("mbHear").addEventListener("click", hearPress);
    $("mbAgain").addEventListener("click", again);
    $("mbAdd").addEventListener("click", addPress);
    [].forEach.call(m.querySelectorAll(".mb-snd"), function (b) { b.addEventListener("click", function () { pick(b.getAttribute("data-snd")); }); });
    /* the keys stay in the booth: the Studio would hand them on to the room behind it (AOG-STUDIO-KEYS-V1) */
    ["keydown", "keyup"].forEach(function (k) { window.addEventListener(k, function (e) {
      if (!B.open) return;
      if (k === "keydown" && e.key === "Escape") { e.preventDefault(); close(); }
      else if (k === "keydown" && e.key === "Tab") trap(e);
      e.stopPropagation(); }, true); });
    try { new MutationObserver(function () { if (B.open) paint(); }).observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
    D.addEventListener("visibilitychange", function () { if (D.hidden && B.open) rest(); });
    window.addEventListener("pagehide", function () { if (B.open) rest(); });
  }
  function $(id) { return D.getElementById(id); }
  function trap(e) {
    var f = [].filter.call(B.el.querySelectorAll("button"), function (b) { return !b.disabled && b.offsetParent; });
    if (!f.length) return; var a = f[0], z = f[f.length - 1];
    if (!B.el.contains(D.activeElement)) { e.preventDefault(); (e.shiftKey ? z : a).focus(); return; }
    if (e.shiftKey && D.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && D.activeElement === z) { e.preventDefault(); a.focus(); }
  }
  function txt(id, t) { var e = $(id); if (e && e.textContent !== t) e.textContent = t; }
  function att(e, k, v) { if (e.getAttribute(k) !== v) e.setAttribute(k, v); }
  function say(k, f) { B.line = k; B.lineF = f || null; if (k !== "added") B.fit = false; paint(); }
  function helpSeen() { try { return !!(JSON.parse(localStorage.getItem(HELP_KEY) || "null") || {}).seen; } catch (e) { return false; } }
  function helpDone() { try { localStorage.setItem(HELP_KEY, JSON.stringify({ seen: true })); } catch (e) {} }
  function clock(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

  function paint() {
    if (!B.el) return;
    txt("mbH", "🎤 " + tw("title")); txt("mbClose", tw("close"));
    var h = $("mbHelp"), showHelp = !helpSeen(); if (h.hidden !== !showHelp) h.hidden = !showHelp; txt("mbHelp", tw("help"));
    var r = $("mbRec"), rec = B.state === "rec";
    var rt = rec ? tw("stop") + " " + clock(B.ac ? B.ac.currentTime - B.recAt : 0) : B.take && B.take.added ? tw("recMore") : B.take ? tw("recAgain") : tw("rec");
    if (r.textContent !== rt) r.textContent = rt;
    att(r, "aria-pressed", rec ? "true" : "false");
    var rd = B.state === "asking" || B.state === "stopping" || B.busy; if (r.disabled !== rd) r.disabled = rd;
    att($("mbMeter"), "aria-label", tw("meter"));
    txt("mbLine", B.line ? tw(B.line, B.lineF) + (B.line === "added" && B.fit ? " " + tw("fit") : "") : "");
    var al = $("mbAllow"); if (al.hidden !== !B.allow) al.hidden = !B.allow;
    if (B.allow) { txt("mbAllow0", tw("denied")); txt("mbAllowI", tw("allowI")); txt("mbAllowC", tw("allowC")); txt("mbAllowT", tw("allowThen")); }
    var tk = $("mbTake"), showTake = !!B.take && !rec && B.state !== "stopping"; if (tk.hidden !== !showTake) tk.hidden = !showTake;
    txt("mbSndH", tw("sndH"));
    [].forEach.call(B.el.querySelectorAll(".mb-snd"), function (b) { var k = b.getAttribute("data-snd");
      if (b.firstChild.textContent !== tw(k)) b.firstChild.textContent = tw(k); if (b.lastChild.textContent !== tw(k + "S")) b.lastChild.textContent = tw(k + "S");
      att(b, "aria-pressed", B.snd === k ? "true" : "false"); var d = !!B.making || B.busy; if (b.disabled !== d) b.disabled = d; });
    var hb = $("mbHear"), ht = B.hear ? tw("hearStop") : tw("hear"); if (hb.textContent !== ht) hb.textContent = ht;
    att(hb, "aria-pressed", B.hear ? "true" : "false"); var hd = !!B.making || B.busy; if (hb.disabled !== hd) hb.disabled = hd;
    txt("mbAgain", tw("again")); var ad = !!B.making || B.busy; if ($("mbAgain").disabled !== ad) $("mbAgain").disabled = ad;
    var ab = $("mbAdd"), at = B.busy ? tw("adding") : tw("add"); if (ab.textContent !== at) ab.textContent = at;
    var showAdd = !(B.take && B.take.added); if (ab.hidden !== !showAdd) ab.hidden = !showAdd; if (ab.disabled !== (!!B.making || B.busy)) ab.disabled = !!B.making || B.busy;
  }

  /* ── open and close ── */
  function open(opener) {
    build(); B.opener = opener || null;
    if (B.open) return;
    B.open = true; B.el.hidden = false;
    try { D.documentElement.style.overflow = "hidden"; } catch (e) {}
    try { SH() && SH().quiet && SH().quiet(true); } catch (e) {}
    if (!B.take) { B.state = "idle"; B.allow = false; }
    paint();
    try { $("mbH").focus({ preventScroll: true }); } catch (e) { $("mbH").focus(); }
    getBacking(true);
  }
  function close() {
    if (!B.open) return;
    rest();
    B.open = false; B.el.hidden = true;
    try { D.documentElement.style.overflow = ""; } catch (e) {}
    try { SH() && SH().quiet && SH().quiet(false); } catch (e) {}
    if (B.opener && B.opener.focus) try { B.opener.focus(); } catch (e) {}
  }
  /* everything stops: a take being recorded is kept; the sound engine rests */
  function rest() {
    if (B.state === "rec") stopRec();
    hearStop();
    if (B.state === "asking") B.cancel = true;
    sleepSoon();
  }
  function sleepSoon() {
    setTimeout(function () { try { if (B.ac && B.ac.state === "running" && B.state !== "rec" && !B.hear) B.ac.suspend(); } catch (e) {} }, 250);
  }

  /* ── My Track, from the desk (out of sight): voiceBacking ── */
  function getBacking(say0) {
    var S = SH();
    if (!S || !S.desk) { B.bk = null; if (say0 && B.state === "idle" && !B.take) say("alone"); return Promise.resolve(null); }
    if (say0 && B.state === "idle" && !B.take) say("prep");
    var p = B.bkP = S.desk().then(function (w) { return w.__aogStudio.voiceBacking(); }).then(function (bk) {
      if (B.bkP === p) B.bk = bk || null;
      return bk || null;
    }, function () { if (B.bkP === p) B.bk = null; return null; });
    p.then(function (bk) { if (B.bkP !== p || B.state !== "idle" || B.take) return; readyLine(bk); });
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
  /* My Track from the From bar: round and round (loopEnd: where its music ends) when the desk can repeat it to match */
  function bkSource(bk, at, offs) {
    var c = B.ac, buf = bkBuffer(bk), s = c.createBufferSource(), g = c.createGain();
    s.buffer = buf; s.connect(g); g.connect(c.destination);
    var loop = !!bk.loop && bk.sec > 0.5 && bk.sec <= buf.duration + 0.01;
    if (loop) { s.loop = true; s.loopStart = 0; s.loopEnd = Math.min(buf.duration, bk.sec); if (offs >= s.loopEnd - 0.05) offs = 0; }
    else if (offs >= buf.duration - 0.05) offs = 0;
    s.start(at, offs);
    return { s: s, g: g, loop: loop, offs: offs };
  }
  function fade(p) { if (!p) return; try { var now = B.ac.currentTime; p.g.gain.setValueAtTime(p.g.gain.value, now); p.g.gain.linearRampToValueAtTime(0, now + 0.06); p.s.stop(now + 0.08); } catch (e) {} }

  /* ── the sound engine: made inside a tap, as an iPhone wants ── */
  function wake() {
    try {
      if (!B.ac) { var AC = window.AudioContext || window.webkitAudioContext; try { B.ac = new AC({ latencyHint: "interactive" }); } catch (e) { B.ac = new AC(); } if (window.AOGVU && AOGVU.own) AOGVU.own(B.ac); }
      if (B.ac.state !== "running") B.ac.resume();
    } catch (e) {}
    return B.ac;
  }

  /* ── ● Record / ■ Stop ── */
  function recPress() {
    if (B.state === "rec") { stopRec(); return; }
    if (B.state === "asking" || B.state === "stopping" || B.busy) return;
    hearStop();
    var c = wake(); if (!c) { say("fail"); return; }
    try { SH() && SH().quiet && SH().quiet(true); } catch (e) {}
    B.allow = false; B.cancel = false; B.state = "asking"; say("asking");
    var md = navigator.mediaDevices;
    var ask = md && md.getUserMedia ? md.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } })
      : Promise.reject(Object.assign(new Error("none"), { name: "NotFoundError" }));
    ask.then(function (stream) {
      if (B.cancel || !B.open) { stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} }); B.state = B.take ? "take" : "idle"; paint(); return; }
      return (B.bkP || getBacking(false)).then(function (bk) { return startRec(stream, bk); });
    }, function (e) {
      B.state = B.take ? "take" : "idle";
      var n = e && e.name;
      if (n === "NotFoundError" || n === "OverconstrainedError" || n === "NotReadableError") { B.allow = false; say("nomic"); }
      else { B.allow = true; say(""); }
      sleepSoon();
    }).catch(function () { release(); B.state = B.take ? "take" : "idle"; say("fail"); sleepSoon(); });
  }
  function startRec(stream, bk) {
    var c = B.ac;
    B.stream = stream; B.chunks = []; B.t0 = -1;
    B.src = c.createMediaStreamSource(stream);
    B.sink = c.createGain(); B.sink.gain.value = 0; B.sink.connect(c.destination);
    B.an = c.createAnalyser(); B.an.fftSize = 1024; B.src.connect(B.an); B.an.connect(B.sink);   /* (pulled through the silent sink, or Chrome leaves it empty) */
    var ready;
    if (c.audioWorklet && window.AudioWorkletNode) {
      if (!B.wk) B.wk = c.audioWorklet.addModule(URL.createObjectURL(new Blob([CAP_WK], { type: "text/javascript" })));
      ready = B.wk.then(function () {
        B.node = new AudioWorkletNode(c, "aog-booth-cap", { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1] });
        B.node.port.onmessage = function (e) { var m = e.data; if (m && m.d) { if (B.t0 < 0) B.t0 = m.t; B.chunks.push(m.d); } if (m && m.end && B.onEnd) B.onEnd(); };
      });
    } else {
      /* an older browser: the same, a block at a time */
      var N = 4096, sp = c.createScriptProcessor(N, 1, 1);
      sp.onaudioprocess = function (e) { if (B.state !== "rec") return; if (B.t0 < 0) B.t0 = e.playbackTime - N / c.sampleRate; B.chunks.push(new Float32Array(e.inputBuffer.getChannelData(0))); };
      B.node = sp; ready = Promise.resolve();
    }
    return ready.then(function () {
      if (B.cancel || !B.open) { release(); B.state = B.take ? "take" : "idle"; paint(); return; }
      B.src.connect(B.node); B.node.connect(B.sink);
      var inLat = 0; try { var st = stream.getAudioTracks()[0].getSettings(); inLat = st && st.latency > 0 ? st.latency : 0; } catch (e) {}
      /* AOG-LATENCY-V1: the round trip the Studio's Timing check measured on this device; else what the browser says */
      var trip = 0; try { var m = JSON.parse(localStorage.getItem("aog.latency.v1") || "null"); trip = m && m.rt > 0 && m.rt < 1 ? +m.rt : 0; } catch (e) {}
      B.lat = trip > 0 ? trip : (c.outputLatency > 0 ? c.outputLatency : 0) + (c.baseLatency > 0 ? c.baseLatency : 0) + inLat;
      B.from = fromBar(); B.bkUsed = bk || null; B.loop = false;
      B.recAt = c.currentTime;
      if (bk) {
        B.Tb = c.currentTime + 0.3;
        var offs = (B.from - 1) * bk.barSec;
        B.play = bkSource(bk, B.Tb, offs); B.loop = B.play.loop;
        if (B.play.offs !== offs) B.from = 1;
        if (!B.loop) B.play.s.onended = function () { if (B.state === "rec") stopRec("ended"); };
      } else { B.Tb = 0; B.play = null; }
      B.state = "rec"; B.shownSec = -1; say("recOn");
      helpDone();
      meter();
    });
  }
  function meter() {
    cancelAnimationFrame(B.raf);
    var an = B.an, lv = $("mbLvl"), buf = new Float32Array(an ? an.fftSize : 1024), shown = 0, last = 0;
    var step = function () {
      if (B.state !== "rec" || !B.an) { lv.style.transform = "scaleX(0)"; B.raf = 0; return; }
      B.an.getFloatTimeDomainData(buf); var pk = 0; for (var i = 0; i < buf.length; i++) { var a = buf[i] < 0 ? -buf[i] : buf[i]; if (a > pk) pk = a; }
      var db = pk > 0 ? 20 * Math.log10(pk) : -90, w = Math.max(0, Math.min(1, (db + 54) / 54)), now = performance.now();
      /* up at once, down gently (as a real meter falls), so a word can be read on it */
      shown = w >= shown ? w : Math.max(w, shown - (now - (last || now)) / 1400); last = now;
      lv.style.transform = "scaleX(" + shown.toFixed(3) + ")";
      var s = Math.floor(B.ac.currentTime - B.recAt); if (s !== B.shownSec) { B.shownSec = s; paint(); }
      if (B.ac.currentTime - B.recAt > MAX_SEC) { stopRec(); return; }
      B.raf = requestAnimationFrame(step);
    };
    B.raf = requestAnimationFrame(step);
  }
  function release() {
    try { if (B.src) B.src.disconnect(); } catch (e) {} try { if (B.node) B.node.disconnect(); } catch (e) {} try { if (B.sink) B.sink.disconnect(); } catch (e) {}
    try { if (B.an) B.an.disconnect(); } catch (e) {}
    if (B.stream) B.stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });   /* the microphone is let go at once */
    B.src = B.node = B.sink = B.an = B.stream = null;
  }
  function stopRec(why) {
    if (B.state !== "rec") return;
    B.state = "stopping"; cancelAnimationFrame(B.raf); B.raf = 0; $("mbLvl").style.transform = "scaleX(0)"; paint();
    var node = B.node, c = B.ac;
    var flushed = node && node.port ? new Promise(function (ok) { B.onEnd = ok; try { node.port.postMessage("stop"); } catch (e) { ok(); } setTimeout(ok, 600); }) : Promise.resolve();
    flushed.then(function () {
      B.onEnd = null;
      fade(B.play); B.play = null;
      release();
      var sr = c.sampleRate, n = 0; B.chunks.forEach(function (x) { n += x.length; });
      var L = new Float32Array(n), o = 0; B.chunks.forEach(function (x) { L.set(x, o); o += x.length; }); B.chunks = [];
      var sec = n / sr, bk = B.bkUsed;
      /* where the bar line falls in the take: when My Track played it, plus the time to the ear and back through the microphone */
      var head = bk ? (B.Tb + B.lat) - B.t0 : Math.min(0.05, sec / 4);
      if (!(head >= 0)) head = 0;
      /* keep a breath before the bar (a quarter second), no more */
      var cut = Math.max(0, head - 0.25), k0 = Math.round(cut * sr);
      var dry = L.slice(k0); head -= k0 / sr;
      var body = dry.length / sr - head;
      sleepSoon();
      if (body < 0.3) { B.state = B.take ? "take" : "idle"; say("short"); return; }
      var bpm = 0; try { var g = window.AOGSong && AOGSong.get(); bpm = g && g.hasBpm ? g.bpm : 0; } catch (e) {}
      B.take = { dry: dry, sr: sr, head: head, body: body, from: B.from, loop: B.loop, bpm: bpm || (bk ? bk.bpm : 0) || 90, bk: bk };
      B.made = {}; B.snd = "clean"; B.state = "take";
      say(why === "ended" ? "ended" : "took");
      make("clean").then(function () { paint(); }, function () {});
    });
  }

  /* ── the four sounds, made from the take (offline, a moment) ── */
  function rnd(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 * 2 - 1; }; }
  function roomIR(oc, sec) {
    var sr = oc.sampleRate, n = Math.round(sec * sr), b = oc.createBuffer(2, n, sr);
    for (var ch = 0; ch < 2; ch++) { var d = b.getChannelData(ch), r = rnd(7 + ch * 31), lp = 0;
      var e = 0; for (var i = 0; i < n; i++) { var t = i / sr; lp += 0.55 * (r() - lp); d[i] = lp * Math.exp(-t * 6.5) * (t < 0.008 ? t / 0.008 : 1); e += d[i] * d[i]; }
      var g = e > 0 ? 1 / Math.sqrt(e) : 0; for (var j = 0; j < n; j++) d[j] *= g; }   /* as loud as the voice itself: the wet level says how much room */
    return b;
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
  /* Tuned: the desk's own pitch correction (AOG-DESK-TUNE-V1), strong but natural */
  function tuneDry(x, sr) {
    var S = SH(); if (!S || !S.desk) return Promise.reject(new Error("no desk"));
    return S.desk().then(function (w) {
      var tune = w.__aogStudio.dmTune; if (!tune) throw new Error("no tune");
      var ab = new w.AudioBuffer({ numberOfChannels: 1, length: x.length, sampleRate: sr }); ab.copyToChannel(new w.Float32Array(x), 0);
      var k = songKey();
      return tune(ab, { amt: 85, spd: 65, key: k ? k.key : -1, minor: !!(k && k.minor) }, function () { return false; });
    }).then(function (out) { return new Float32Array(out.getChannelData(0)); });
  }
  function render(kind, x, sr, bpm) {
    var OC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    var tail = kind === "echo" ? 2.6 : kind === "phone" ? 0.25 : 1.3, n = x.length + Math.round(tail * sr);
    var oc = new OC(2, n, sr), src = oc.createBufferSource(), b = oc.createBuffer(1, x.length, sr);
    b.copyToChannel(x, 0); src.buffer = b;
    var out = oc.createGain(); out.connect(oc.destination);
    function bq(type, f, q, gain) { var z = oc.createBiquadFilter(); z.type = type; z.frequency.value = f; if (q != null) z.Q.value = q; if (gain != null) z.gain.value = gain; return z; }
    function chain(a) { for (var i = 0; i < a.length - 1; i++) a[i].connect(a[i + 1]); return a[a.length - 1]; }
    function comp(thr, ratio) { var d = oc.createDynamicsCompressor(); d.threshold.value = thr; d.ratio.value = ratio; d.knee.value = 6; d.attack.value = 0.004; d.release.value = 0.16; return d; }
    function gain(db) { var g = oc.createGain(); g.gain.value = Math.pow(10, db / 20); return g; }
    function room(from, wet) { var cv = oc.createConvolver(); cv.normalize = false; cv.buffer = roomIR(oc, 1.1); var g = gain(wet); from.connect(g); g.connect(cv); cv.connect(out); }
    if (kind === "phone") {
      var sh = oc.createWaveShaper(), cu = new Float32Array(2049); for (var i = 0; i < cu.length; i++) { var v = i / 1024 - 1; cu[i] = Math.tanh(2.6 * v) / Math.tanh(2.6); }
      sh.curve = cu; sh.oversample = "2x";
      var end = chain([src, bq("highpass", 300, 0), bq("highpass", 300, 0), bq("highpass", 300, 0), bq("highpass", 300, 0), bq("peaking", 1700, 1, 6), comp(-24, 4), gain(4), sh,
        bq("lowpass", 3400, 0), bq("lowpass", 3400, 0), bq("lowpass", 3400, 0), gain(-2)]);
      end.connect(out);
    } else {
      var v0 = chain([src, bq("highpass", 90, 0), comp(-24, 3), gain(5)]);
      v0.connect(out);
      if (kind === "echo") {
        var beat = 60 / (bpm > 0 ? bpm : 90), dt = Math.min(1.9, 0.75 * beat);   /* a dotted eighth of the song's tempo */
        var dl = oc.createDelay(2), fb = gain(-8.5), wet = gain(-6), tone = bq("lowpass", 3600, 0), lo = bq("highpass", 220, 0);
        dl.delayTime.value = dt;
        v0.connect(dl); dl.connect(tone); tone.connect(lo); lo.connect(fb); fb.connect(dl); lo.connect(wet); wet.connect(out);
        room(v0, -16);
      } else room(v0, -15);
    }
    src.start(0);
    var p = oc.startRendering(); if (!p || !p.then) p = new Promise(function (ok) { oc.oncomplete = function (e) { ok(e.renderedBuffer); }; });
    return p.then(function (buf) {
      var L = buf.getChannelData(0), R = buf.getChannelData(1), pk = 0;
      for (var i = 0; i < L.length; i++) { var a = Math.max(L[i] < 0 ? -L[i] : L[i], R[i] < 0 ? -R[i] : R[i]); if (a > pk) pk = a; }
      if (pk > 0.89) { var g = 0.89 / pk; for (var j = 0; j < L.length; j++) { L[j] *= g; R[j] *= g; } }   /* never past −1 dB */
      /* the quiet end of the ring: its last 10 ms fade, so it ends without a click */
      var f = Math.min(L.length, Math.round(0.01 * sr)); for (var q = 0; q < f; q++) { var w = q / f, z = L.length - 1 - q; L[z] *= w; R[z] *= w; }
      return { L: new Float32Array(L), R: new Float32Array(R), sr: sr, tail: tail };
    });
  }
  function make(kind) {
    var tk = B.take; if (!tk) return Promise.reject(new Error("no take"));
    if (tk === B.take && B.made[kind]) return Promise.resolve(B.made[kind]);
    if (B.making === kind && B.makeP) return B.makeP;
    B.making = kind; paint();
    if (!tk.norm) tk.norm = norm(tk.dry);
    var src = kind === "tuned" ? tuneDry(tk.norm, tk.sr).catch(function () { return tk.norm; }) : Promise.resolve(tk.norm);
    var p = B.makeP = src.then(function (x) { return render(kind, x, tk.sr, tk.bpm); }).then(function (r) {
      if (B.take === tk) B.made[kind] = r;
      if (B.making === kind) { B.making = ""; B.makeP = null; }
      paint(); return r;
    }, function (e) { if (B.making === kind) { B.making = ""; B.makeP = null; } paint(); throw e; });
    return p;
  }
  function pick(kind) {
    if (!B.take || SOUNDS.indexOf(kind) < 0) return;
    var c = wake();   /* inside the tap: the sound is ready to play the moment it is made */
    B.snd = kind; hearStop();
    var k = kind === "tuned" ? (keyName() ? ["tunedKey", { key: keyName() }] : ["tunedNoKey", null]) : null;
    if (!B.made[kind]) say("making");
    make(kind).then(function (r) {
      if (B.snd !== kind || !B.open) return;
      if (k) say(k[0], k[1]); else say("playing");
      hear(r);
    }, function () { say("fail"); sleepSoon(); });
    paint(); return c;
  }

  /* ── ▶ Hear it: the take in its sound, with the beat, as it will be on My Track ── */
  function hearPress() {
    if (B.hear) { hearStop(); say(""); sleepSoon(); return; }
    if (!B.take) return;
    wake();
    var kind = B.snd;
    if (!B.made[kind]) say("making");
    make(kind).then(function (r) { if (B.snd === kind && B.open) { say("playing"); hear(r); } }, function () { say("fail"); });
  }
  function hear(r) {
    hearStop();
    var c = wake(), tk = B.take; if (!c || !tk) return;
    var vb = c.createBuffer(2, r.L.length, r.sr); vb.copyToChannel(r.L, 0); vb.copyToChannel(r.R, 1);
    var v = c.createBufferSource(), g = c.createGain(); v.buffer = vb; v.connect(g); g.connect(c.destination);
    var T = c.currentTime + 0.12, bk = tk.bk, b = null;
    v.start(T);
    if (bk) { var offs = (tk.from - 1) * bk.barSec; b = bkSource(bk, T + tk.head, offs);
    }
    var H = { v: v, g: g, b: b };
    v.onended = function () { if (B.hear === H) { fade(H.b); B.hear = null; if (B.line === "playing") say(""); else paint(); sleepSoon(); } };
    B.hear = H; paint();
  }
  function hearStop() {
    var H = B.hear; if (!H) return; B.hear = null;
    fade({ s: H.v, g: H.g }); fade(H.b); paint();
  }
  function again() {
    hearStop(); B.take = null; B.made = {}; B.state = "idle"; B.allow = false; sleepSoon();
    say("gone");
    try { $("mbRec").focus(); } catch (e) {}
  }

  /* ── + Add to My Track: the take in its sound on the desk's track 8, at its bar ── */
  function addPress() {
    var tk = B.take, S = SH(); if (!tk || tk.added || B.busy || !S || !S.desk) return;
    hearStop(); B.busy = true; paint();
    var kind = B.snd;
    make(kind).then(function (r) {
      return S.desk().then(function (w) {
        return w.__aogStudio.voicePut({ L: r.L, R: r.R, dry: tk.dry, sr: r.sr, head: tk.head, body: tk.body, startBar: tk.from, snd: kind, loop: tk.loop });
      });
    }).then(function (res) {
      B.busy = false; tk.added = true; B.fit = !!(res && res.fit);
      say("added", { name: res && res.name || "" });
      try { S.refresh && S.refresh(); } catch (e) {}
      try { $("mbRec").focus(); } catch (e) {}   /* + Add is put away: the keyboard goes to Record another */
    }, function () { B.busy = false; say("fail"); });
  }

  window.AOGMicBooth = {
    open: open, close: close,
    /* for the Studio's own tests (music-handoff/tests/studio/micbooth.js), read only */
    state: function () { return { open: B.open, state: B.state, snd: B.snd, making: B.making, hear: !!B.hear, take: B.take ? { sec: B.take.dry.length / B.take.sr, head: B.take.head, body: B.take.body, from: B.take.from, loop: B.take.loop, sr: B.take.sr } : null,
      ac: B.ac && B.ac.state, mic: !!B.stream, raf: !!B.raf, line: $("mbLine") ? $("mbLine").textContent : "", allow: B.allow, bk: B.bk ? { sec: B.bk.sec, loop: B.bk.loop, bpm: B.bk.bpm } : null }; },
    made: function (k) { return B.made[k] || null; },
    make: make, dry: function () { return B.take ? B.take.norm || norm(B.take.dry) : null; }
  };
})();
