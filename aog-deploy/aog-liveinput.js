/* ══ AOG-LIVEINPUT-V1 (2026-10-09) — your real guitar or bass, and a free tuner ═══════════════════════════════════════
   STUDIO-HANDOFF §10b, §10c (Jimmy: "hook my real guitar into this studio"; "a free guitar tuner"). The on-screen guitar
   stays; this is the other one, the one in your hands, through a cable.
   - A browser cannot see a quarter-inch cable: the guitar reaches it as an audio input, through a USB interface, a USB
     guitar cable, or a microphone in front of an amp. The page says so once.
   - Nothing opens the input on load. Turn on the input (or Tune) asks for it, with the call-processing switched off
     (echoCancellation, noiseSuppression, autoGainControl: they are for phone calls and they wreck a guitar). With more
     than one input there is a menu; the choice is remembered on this device.
   - You hear it through the page's own amp, cabinet and pedals (aog-amp.js): a second rig with the same settings as the
     on-screen guitar's, kept in step by setRig. The delay through the page is shown; direct monitoring on the interface
     has none, and the page says so.
   - ● Record my guitar: a count-in of four clicks at the page's tempo, then the clean (dry) input and the toned sound are
     both kept. The toned take goes where every take goes (the Mixing Desk's list, "studioinbox", marked live) and so onto
     My Track; the clean take rides with it (its "dry"), to save and re-amp later. Delete, and Bring it back.
   - Tune: the note, how sharp or flat in cents, a calm needle, green when it is in. Standard first; drop D, half a step
     down and the bass behind one menu; A = 440 unless you set another (remembered). Tune never records; leaving it
     keeps the input as it was.
   - A missing interface or a refused input leaves the panel with a plain line and Try again; the on-screen guitar plays on.
   Nothing is uploaded.
   A page loads it with <script src="/aog-liveinput.js"></script> and calls
     AOGLive.attach({ mount, kind:"guitar"|"bass", context:()=>AudioContext, out:()=>node the toned sound joins,
                      rig:()=>amp state, lang:()=>"en"|"es", bpm:()=>tempo, tool:"guitar"|"bass" })
   and AOGLive.setRig(state) whenever the amp changes. ════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var D = document;
  var W = {
    h: { guitar: { en: "Plug in your guitar", es: "Conecta tu guitarra" }, bass: { en: "Plug in your bass", es: "Conecta tu bajo" } },
    how: { en: "A browser can't see a guitar cable. Your instrument reaches it through a USB interface, a USB guitar cable, or a microphone in front of your amp.",
      es: "Un navegador no ve un cable de guitarra. Tu instrumento le llega por una interfaz USB, un cable USB de guitarra o un micrófono frente a tu amplificador." },
    ask: { guitar: { en: "To record your guitar, this page needs the input. The recording stays on this device.", es: "Para grabar tu guitarra, esta página necesita la entrada. La grabación se queda en este aparato." },
      bass: { en: "To record your bass, this page needs the input. The recording stays on this device.", es: "Para grabar tu bajo, esta página necesita la entrada. La grabación se queda en este aparato." } },
    on: { en: "Turn on the input", es: "Encender la entrada" },
    off: { en: "Turn off the input", es: "Apagar la entrada" },
    opening: { en: "Opening the input…", es: "Abriendo la entrada…" },
    ready: { guitar: { en: "Your guitar is in. Play: you hear it through the amp above.", es: "Tu guitarra está conectada. Toca: la oyes por el amplificador de arriba." },
      bass: { en: "Your bass is in. Play: you hear it through the amp above.", es: "Tu bajo está conectado. Toca: lo oyes por el amplificador de arriba." } },
    input: { en: "Input", es: "Entrada" },
    hear: { en: "Hear it through the amp", es: "Oírlo por el amplificador" },
    lat: { en: "Delay through the page: about {n} ms. For no delay, listen on your interface (direct monitoring). With a microphone, use headphones.",
      es: "Retraso por la página: unos {n} ms. Para que no haya retraso, escucha en tu interfaz (monitoreo directo). Con un micrófono, usa auriculares." },
    rec: { guitar: { en: "● Record my guitar", es: "● Grabar mi guitarra" }, bass: { en: "● Record my bass", es: "● Grabar mi bajo" } },
    stop: { en: "■ Stop", es: "■ Parar" },
    count: { en: "Get ready… {n}", es: "Prepárate… {n}" },
    recording: { en: "Recording. Press Stop when you are done.", es: "Grabando. Pulsa Parar cuando termines." },
    added: { en: "Added to My Track. The clean take is kept with it.", es: "Añadida a mi pista. La toma limpia se guarda con ella." },
    takeN: { guitar: { en: "Live guitar take {n}", es: "Toma de guitarra en vivo {n}" }, bass: { en: "Live bass take {n}", es: "Toma de bajo en vivo {n}" } },
    saveTone: { en: "Save with the amp (.wav)", es: "Guardar con el amplificador (.wav)" },
    saveDry: { en: "Save the clean take (.wav)", es: "Guardar la toma limpia (.wav)" },
    del: { en: "Delete", es: "Borrar" }, back: { en: "Bring it back", es: "Recuperarla" },
    deleted: { en: "The take is deleted.", es: "La toma está borrada." },
    short: { en: "That was very short. Try again.", es: "Fue muy corto. Inténtalo otra vez." },
    denied: { en: "The input is not allowed on this page. Allow the microphone or input in your browser's settings, then try again. The guitar on the screen still plays.",
      es: "La entrada no está permitida en esta página. Permite el micrófono o la entrada en la configuración del navegador y vuelve a intentarlo. La guitarra de la pantalla sigue sonando." },
    none: { en: "No input was found. Plug in your interface or cable, then try again. The guitar on the screen still plays.",
      es: "No se encontró ninguna entrada. Conecta tu interfaz o tu cable y vuelve a intentarlo. La guitarra de la pantalla sigue sonando." },
    again: { en: "Try again", es: "Intentar otra vez" },
    fail: { en: "That did not work. Try again.", es: "No funcionó. Inténtalo otra vez." },
    tune: { en: "Tune", es: "Afinar" }, tuneDone: { en: "Done tuning", es: "Terminar de afinar" },
    tuneH: { en: "Tuner", es: "Afinador" },
    tuneHint: { en: "Play one string at a time and let it ring.", es: "Toca una cuerda a la vez y déjala sonar." },
    tuning: { en: "Tuning", es: "Afinación" }, refA: { en: "A =", es: "La =" },
    inTune: { en: "In tune", es: "Afinada" }, sharp: { en: "{n} cents sharp: loosen it a little", es: "{n} cents alta: aflójala un poco" },
    flat: { en: "{n} cents flat: tighten it a little", es: "{n} cents baja: apriétala un poco" },
    listen: { en: "Listening…", es: "Escuchando…" },
    needle: { en: "How far from the note", es: "Qué tan lejos de la nota" }
  };
  var TUNINGS = {
    std: { name: { en: "Standard (E A D G B E)", es: "Estándar (Mi La Re Sol Si Mi)" }, notes: [40, 45, 50, 55, 59, 64] },
    dropd: { name: { en: "Drop D (D A D G B E)", es: "Drop D (Re La Re Sol Si Mi)" }, notes: [38, 45, 50, 55, 59, 64] },
    half: { name: { en: "Half a step down (E♭ A♭ D♭ G♭ B♭ E♭)", es: "Medio tono abajo (Mi♭ La♭ Re♭ Sol♭ Si♭ Mi♭)" }, notes: [39, 44, 49, 54, 58, 63] },
    bass: { name: { en: "Bass (E A D G)", es: "Bajo (Mi La Re Sol)" }, notes: [28, 33, 38, 43] }
  };
  var NAMES = { en: ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"], es: ["Do", "Do♯", "Re", "Mi♭", "Mi", "Fa", "Fa♯", "Sol", "La♭", "La", "Si♭", "Si"] };
  var CAP = "class AogLiveCap extends AudioWorkletProcessor{constructor(){super();this.on=true;this.b=[[],[]];this.n=0;this.t=-1;" +
    "this.port.onmessage=e=>{if(e.data==='stop'){this.flush();this.on=false;this.port.postMessage({end:true});}};}" +
    "flush(){if(!this.n)return;const o=[0,1].map(c=>{const a=new Float32Array(this.n);let k=0;for(const x of this.b[c]){a.set(x,k);k+=x.length;}return a;});this.port.postMessage({t:this.t,d:o},[o[0].buffer,o[1].buffer]);this.b=[[],[]];this.n=0;this.t=-1;}" +
    "process(ins){if(!this.on)return false;const i=ins[0];if(i&&i[0]&&i[0].length){if(this.t<0)this.t=currentTime;const l=i[0],r=i[1]||i[0];this.b[0].push(l.slice(0));this.b[1].push(r.slice(0));this.n+=l.length;if(this.n>=sampleRate/4)this.flush();}return true;}}" +
    "registerProcessor('aog-live-cap',AogLiveCap);";
  var A = null;   /* the one attached page */

  function el(id) { return D.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function L() { try { return A.o.lang() === "es" ? "es" : "en"; } catch (e) { return "en"; } }
  function w(k, vars) { var x = W[k]; if (x && x[A.o.kind]) x = x[A.o.kind]; var s = x ? (x[L()] || x.en) : k; if (vars) Object.keys(vars).forEach(function (v) { s = s.split("{" + v + "}").join(vars[v]); }); return s; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function wavOf(Lc, Rc, sr) {
    var n = Lc.length, ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab), i, o;
    function s(off, t) { for (var j = 0; j < t.length; j++) v.setUint8(off + j, t.charCodeAt(j)); }
    s(0, "RIFF"); v.setUint32(4, 36 + n * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, n * 4, true);
    for (i = 0, o = 44; i < n; i++, o += 4) { var l = Math.max(-1, Math.min(1, Lc[i])), r = Math.max(-1, Math.min(1, Rc[i]));
      v.setInt16(o, l < 0 ? l * 0x8000 : l * 0x7fff, true); v.setInt16(o + 2, r < 0 ? r * 0x8000 : r * 0x7fff, true); }
    return new Blob([ab], { type: "audio/wav" });
  }

  /* ── the input ── */
  async function open(devId) {
    var c = A.o.context(), md = navigator.mediaDevices;
    if (!md || !md.getUserMedia) throw Object.assign(new Error("none"), { name: "NotFoundError" });
    var au = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };
    if (devId) au.deviceId = { exact: devId };
    var st;
    try { st = await md.getUserMedia({ audio: au }); }
    catch (e) { if (devId && e && e.name === "OverconstrainedError") { store(A.KEY_IN, ""); return open(""); } throw e; }
    close(true);
    A.stream = st; A.src = c.createMediaStreamSource(st);
    A.inGain = c.createGain(); A.src.connect(A.inGain);
    /* the second rig: the same amp as the on-screen guitar, for the real one */
    if (!A.rig) { A.rig = window.AOGAmp.create(c, { kind: A.o.kind, state: A.o.rig() }); A.mon = c.createGain(); A.rig.output.connect(A.mon); A.mon.connect(A.o.out()); }
    A.inGain.connect(A.rig.input);
    A.mon.gain.value = A.hear ? 1 : 0;
    try { var s0 = st.getAudioTracks()[0].getSettings(); A.dev = s0.deviceId || ""; A.inLat = s0.latency > 0 ? s0.latency : 0; } catch (e) { A.inLat = 0; }
    A.lat = (c.baseLatency > 0 ? c.baseLatency : 0) + (c.outputLatency > 0 ? c.outputLatency : 0) + A.inLat;
    try { var all = await md.enumerateDevices(); A.devs = all.filter(function (d) { return d.kind === "audioinput"; }); } catch (e) { A.devs = []; }
    if (A.dev) store(A.KEY_IN, A.dev);
    A.state = "ready";
  }
  function close(keepRig) {
    if (A.tuneOn) tuneStop(true);
    try { if (A.src) A.src.disconnect(); } catch (e) {} try { if (A.inGain) A.inGain.disconnect(); } catch (e) {}
    if (A.stream) A.stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} });
    A.stream = A.src = A.inGain = null;
    if (!keepRig) A.state = "";
  }
  async function turnOn(devId) {
    if (A.busy) return;
    A.busy = true; A.state = "opening"; paint();
    try { await open(devId != null ? devId : (store(A.KEY_IN) || "")); }
    catch (e) { A.state = (e && (e.name === "NotFoundError" || e.name === "OverconstrainedError")) ? "none" : "denied"; }
    A.busy = false; paint();
  }

  /* ── recording: four clicks, then the clean and the toned sound together ── */
  async function capNode(c) {
    if (!(c.audioWorklet && window.AudioWorkletNode)) return null;
    if (!A.wk) A.wk = c.audioWorklet.addModule(URL.createObjectURL(new Blob([CAP], { type: "text/javascript" })));
    await A.wk;
    return new AudioWorkletNode(c, "aog-live-cap", { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1] });
  }
  function capture(node, into) {
    var R = { t0: -1, L: [], R: [], node: node };
    node.port.onmessage = function (e) { var m = e.data; if (m && m.d) { if (R.t0 < 0) R.t0 = m.t; R.L.push(m.d[0]); R.R.push(m.d[1]); } if (m && m.end && R.done) R.done(); };
    return R;
  }
  function joined(parts) { var n = 0, i, o = 0; for (i = 0; i < parts.length; i++) n += parts[i].length; var out = new Float32Array(n); for (i = 0; i < parts.length; i++) { out.set(parts[i], o); o += parts[i].length; } return out; }
  async function recStart() {
    if (A.rec || A.busy || !A.stream) return;
    var c = A.o.context();
    A.busy = true;
    try {
      var dn = await capNode(c), tn = await capNode(c);
      if (!dn || !tn) throw new Error("no worklet");
      A.sink = c.createGain(); A.sink.gain.value = 0; A.sink.connect(c.destination);
      A.inGain.connect(dn); A.rig.output.connect(tn); dn.connect(A.sink); tn.connect(A.sink);
      A.capD = capture(dn); A.capT = capture(tn);
      var bpm = 0; try { bpm = +A.o.bpm() || 0; } catch (e) {} if (!(bpm >= 40 && bpm <= 240)) bpm = 90;
      var beat = 60 / bpm, T = c.currentTime + 0.12;
      for (var k = 0; k < 4; k++) clickAt(c, T + k * beat, k === 0);
      A.down = T + 4 * beat; A.bpm = bpm; A.rec = true; A.state = "count";
      A.countT = setInterval(function () { var left = Math.ceil((A.down - c.currentTime) / beat); if (left <= 0) { clearInterval(A.countT); A.state = "rec"; } paintLine(left); }, 60);
    } catch (e) { A.state = "fail"; }
    A.busy = false; paint();
  }
  function clickAt(c, when, first) {
    var o = c.createOscillator(), g = c.createGain();
    o.frequency.value = first ? 1760 : 1320; g.gain.value = 0;
    g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(0.22, when + 0.002); g.gain.exponentialRampToValueAtTime(0.001, when + 0.05);
    o.connect(g); g.connect(c.destination); o.start(when); o.stop(when + 0.06);
  }
  async function recStop() {
    if (!A.rec || A.busy) return;
    A.busy = true; A.rec = false; clearInterval(A.countT);
    var c = A.o.context(), caps = [A.capD, A.capT];
    await Promise.all(caps.map(function (R) { return new Promise(function (ok) { R.done = ok; try { R.node.port.postMessage("stop"); } catch (e) { ok(); } setTimeout(ok, 600); }); }));
    caps.forEach(function (R) { try { R.node.disconnect(); } catch (e) {} });
    try { A.inGain.disconnect(A.capD.node); } catch (e) {} try { A.rig.output.disconnect(A.capT.node); } catch (e) {}
    try { A.sink.disconnect(); } catch (e) {}
    try {
      var sr = c.sampleRate;
      /* the take starts 0.05 s before beat one, as every take does, allowing for the time to the ear and back in */
      var keep = function (R) { var Lc = joined(R.L), Rc = joined(R.R), from = Math.max(0, Math.round((A.down + A.lat - 0.05 - R.t0) * sr)); return { L: Lc.subarray(from), R: Rc.subarray(from) }; };
      var dry = keep(A.capD), ton = keep(A.capT), n = Math.min(dry.L.length, ton.L.length);
      if (n < sr * 0.4) { A.state = "short"; A.busy = false; paint(); return; }
      var dryB = wavOf(dry.L.subarray(0, n), dry.R.subarray(0, n), sr), tonB = wavOf(ton.L.subarray(0, n), ton.R.subarray(0, n), sr);
      var num = (+store(A.KEY_N) || 0) + 1; store(A.KEY_N, String(num));
      var nm = { en: W.takeN[A.o.kind].en.replace("{n}", num), es: W.takeN[A.o.kind].es.replace("{n}", num) };
      var item = { from: A.o.tool, live: true, name: nm, sec: Math.round(n / sr * 1000) / 1000, bpm: A.bpm, at: Date.now(), take: true, wav: tonB, dry: dryB };
      var r = await window.AOGHandoff.add(window.AOGHandoff.INBOX, item, { key: "live|" + A.o.tool + "|" + item.at });
      setTake({ id: r.id, item: item, num: num });
      A.gone = null; A.state = "added";
    } catch (e) { A.state = (e && e.name === "QuotaExceededError") ? "fail" : "fail"; }
    A.capD = A.capT = null; A.busy = false; paint();
  }
  function setTake(tk) {
    if (A.take) { URL.revokeObjectURL(A.take.urlT); URL.revokeObjectURL(A.take.urlD); }
    A.take = tk ? Object.assign(tk, { urlT: URL.createObjectURL(tk.item.wav), urlD: URL.createObjectURL(tk.item.dry) }) : null;
  }
  async function delTake() {
    var tk = A.take; if (!tk || A.busy) return;
    A.busy = true;
    try { await window.AOGHandoff.remove(window.AOGHandoff.INBOX, tk.id); A.gone = tk.item; A.goneNum = tk.num; setTake(null); A.state = "deleted"; } catch (e) { A.state = "fail"; }
    A.busy = false; paint();
  }
  async function backTake() {
    var it = A.gone; if (!it || A.busy) return;
    A.busy = true;
    try { var r = await window.AOGHandoff.add(window.AOGHandoff.INBOX, it, { key: "live|" + A.o.tool + "|" + it.at }); setTake({ id: r.id, item: it, num: A.goneNum }); A.gone = null; A.state = "added"; } catch (e) { A.state = "fail"; }
    A.busy = false; paint();
  }

  /* ── the tuner: one string at a time; it holds its string while the note rings ── */
  function noteName(m) { return NAMES[L()][((m % 12) + 12) % 12]; }
  function refA() { var a = +store("aog.tuner.a.v1"); return a >= 430 && a <= 450 ? a : 440; }
  function tuningId() { var t = store(A.KEY_TUNE); return TUNINGS[t] && (A.o.kind === "bass" ? t === "bass" : t !== "bass") ? t : (A.o.kind === "bass" ? "bass" : "std"); }
  async function tuneStart() {
    if (A.busy) return;
    if (!A.stream) { await turnOn(); if (!A.stream) return; }
    var c = A.o.context();
    A.an = c.createAnalyser(); A.an.fftSize = A.o.kind === "bass" ? 8192 : 4096; A.inGain.connect(A.an);
    A.buf = new Float32Array(A.an.fftSize); A.tuneOn = true; A.hold = null; A.cand = null; A.cands = 0; A.read = null;
    A.tuneT = setInterval(tuneTick, 100);
    paint();
  }
  function tuneStop(quiet) {
    clearInterval(A.tuneT); A.tuneT = 0; A.tuneOn = false;
    try { if (A.an && A.inGain) A.inGain.disconnect(A.an); } catch (e) {}
    A.an = null; if (!quiet) paint();
  }
  /* YIN, a little: the period with the least difference from itself; a soft sound is ignored (the room's hiss) */
  function pitchOf(x, sr, lo, hi) {
    var n = x.length, i, rms = 0; for (i = 0; i < n; i++) rms += x[i] * x[i]; rms = Math.sqrt(rms / n);
    if (rms < 0.01) return 0;
    var tmin = Math.floor(sr / hi), tmax = Math.min(Math.floor(sr / lo), Math.floor(n / 2) - 1), W2 = n - tmax, d = new Float32Array(tmax + 2), run = 0, best = -1;
    for (var tau = 1; tau <= tmax + 1; tau++) { var s = 0; for (i = 0; i < W2; i++) { var df = x[i] - x[i + tau]; s += df * df; } run += s; d[tau] = run > 0 ? s * tau / run : 1; }
    for (tau = tmin; tau <= tmax; tau++) { if (d[tau] < 0.15) { while (tau + 1 <= tmax && d[tau + 1] < d[tau]) tau++; best = tau; break; } }
    if (best < 0) return 0;
    var a = d[best - 1], b = d[best], cc = d[best + 1], den = a - 2 * b + cc, sh = den ? (a - cc) / (2 * den) : 0;
    return sr / (best + sh);
  }
  function tuneTick() {
    if (!A.an) return;
    A.an.getFloatTimeDomainData(A.buf);
    var T = TUNINGS[tuningId()], lo = A.o.kind === "bass" ? 35 : 65, hi = A.o.kind === "bass" ? 450 : 1000;
    var f = pitchOf(A.buf, A.o.context().sampleRate, lo, hi);
    if (f > 0) {
      var a = refA(), m = 69 + 12 * Math.log2(f / a);
      /* the nearest string; a new string must be heard three times running before the needle moves to it */
      var near = T.notes.reduce(function (p, q) { return Math.abs(q - m) < Math.abs(p - m) ? q : p; }, T.notes[0]);
      if (A.hold == null) A.hold = near;
      else if (near !== A.hold) { if (A.cand === near) A.cands++; else { A.cand = near; A.cands = 1; } if (A.cands >= 3) { A.hold = near; A.cand = null; A.cands = 0; } }
      else { A.cand = null; A.cands = 0; }
      var cents = Math.round(100 * (m - A.hold));
      if (Math.abs(cents) <= 300) A.read = { note: A.hold, cents: cents, hz: f };
    }
    paintTune();
  }
  function paintTune() {
    var box = el("aoglTune"); if (!box) return;
    var r = A.read, inT = r && Math.abs(r.cents) <= 5, x = r ? Math.max(-50, Math.min(50, r.cents)) : 0;
    box.querySelector(".al-note").textContent = r ? noteName(r.note) : "–";
    box.querySelector(".al-cents").textContent = !r ? w("listen") : inT ? w("inTune") : r.cents > 0 ? w("sharp", { n: r.cents }) : w("flat", { n: -r.cents });
    var nd = box.querySelector(".al-needle"); nd.style.left = (50 + x) + "%"; nd.classList.toggle("in", !!inT);
    box.classList.toggle("in", !!inT);
    var mtr = box.querySelector(".al-meter"); mtr.setAttribute("aria-valuenow", String(r ? r.cents : 0)); mtr.setAttribute("aria-valuetext", box.querySelector(".al-cents").textContent);
  }

  /* ── the panel ── */
  var CSS = "#aoglH{font:800 .74rem/1.2 var(--sans,system-ui)!important;letter-spacing:.16em!important;text-transform:uppercase;color:#e3dac9;margin:0}" +
    ".aoglive{display:grid;gap:.6rem;max-width:46rem}.aoglive .al-row{display:flex;flex-wrap:wrap;gap:.55rem;align-items:center}" +
    ".aoglive .pbtn{flex:0 1 auto;padding:0 1rem}.aoglive a.pbtn{display:inline-flex;align-items:center;text-decoration:none}" +
    ".aoglive label.al-chk{display:inline-flex;align-items:center;gap:.5rem;min-height:44px;color:#e3dac9;font-weight:700}" +
    ".aoglive label.al-chk input{width:22px;height:22px;accent-color:#f0c26e}" +
    ".aoglive .al-field{display:grid;min-width:0;flex:1 1 12rem}" +
    ".aoglive .al-rec{background:linear-gradient(#ffb1a4,#c4452a)!important;color:#2a0c08!important}" +
    "#aoglTune h3{font:800 .72rem/1.2 var(--sans,system-ui)!important;letter-spacing:.14em!important;text-transform:uppercase;color:#d8cfbf;margin:0}" +
    ".al-tune{border:1px solid #2f3339;border-radius:12px;background:#181a1e;padding:.75rem;display:grid;gap:.45rem}" +
    ".al-tune.in{border-color:#6fbf8b}.al-top{display:flex;align-items:baseline;gap:.8rem;flex-wrap:wrap}" +
    ".al-note{font:800 2.2rem/1 var(--sans,system-ui);color:#f1ebdf;min-width:3.2ch}.al-tune.in .al-note{color:#9fe0b0}" +
    ".al-cents{color:#e3dac9;font-weight:700}.al-tune.in .al-cents{color:#9fe0b0}" +
    ".al-meter{position:relative;height:30px;border-radius:8px;background:#0f1114;border:1px solid #2f3339}" +
    ".al-meter::before{content:'';position:absolute;left:45%;width:10%;top:0;bottom:0;background:rgba(111,191,139,.18)}" +
    ".al-meter::after{content:'';position:absolute;left:50%;top:3px;bottom:3px;width:2px;background:#8a8f96}" +
    ".al-needle{position:absolute;top:2px;bottom:2px;width:6px;margin-left:-3px;border-radius:3px;background:#f0c26e;left:50%}" +
    ".al-needle.in{background:#6fbf8b}@media print{.aoglive{display:none}}";
  function paintLine(left) {
    var ln = el("aoglLine"); if (!ln) return;
    ln.textContent = A.state === "count" && left > 0 ? w("count", { n: left }) : lineText();
  }
  function lineText() {
    var s = A.state;
    return s === "opening" ? w("opening") : s === "ready" ? w("ready") : s === "rec" ? w("recording") : s === "added" ? w("added") : s === "short" ? w("short") :
      s === "deleted" ? w("deleted") : s === "denied" ? w("denied") : s === "none" ? w("none") : s === "fail" ? w("fail") : "";
  }
  function paint() {
    var box = el(A.o.mount); if (!box) return;
    var on = !!A.stream, k = A.o.kind, tid = tuningId();
    var devs = (A.devs || []).length > 1 ? '<label class="al-field"><span class="plab">' + esc(w("input")) + '</span><select id="aoglDev">' +
      A.devs.map(function (d, i) { return '<option value="' + esc(d.deviceId) + '"' + (d.deviceId === A.dev ? " selected" : "") + ">" + esc(d.label || (w("input") + " " + (i + 1))) + "</option>"; }).join("") + "</select></label>" : "";
    var tk = A.take;
    box.innerHTML = '<div class="aoglive">' +
      '<h2 id="aoglH">' + esc(w("h")) + "</h2>" +
      '<p class="line" style="margin:0">' + esc(w("how")) + "</p>" +
      '<p class="line" style="margin:0">' + esc(w("ask")) + "</p>" +
      '<div class="al-row">' + (on ? '<button type="button" class="pbtn" id="aoglOff">' + esc(w("off")) + "</button>"
        : '<button type="button" class="pbtn play" id="aoglOn"' + (A.busy ? " disabled" : "") + ">" + esc(A.state === "denied" || A.state === "none" ? w("again") : w("on")) + "</button>") +
        '<button type="button" class="pbtn" id="aoglTuneBtn" aria-pressed="' + (A.tuneOn ? "true" : "false") + '"' + (A.busy ? " disabled" : "") + ">" + esc(A.tuneOn ? w("tuneDone") : w("tune")) + "</button></div>" +
      (on ? '<div class="al-row">' + devs + '<label class="al-chk"><input type="checkbox" id="aoglHear"' + (A.hear ? " checked" : "") + ">" + esc(w("hear")) + "</label></div>" +
        '<p class="line" style="margin:0">' + esc(w("lat", { n: Math.max(1, Math.round(A.lat * 1000)) })) + "</p>" +
        '<div class="al-row">' + (A.rec ? '<button type="button" class="pbtn al-rec" id="aoglStop">' + esc(w("stop")) + "</button>"
          : '<button type="button" class="pbtn play" id="aoglRec"' + (A.busy || A.tuneOn ? " disabled" : "") + ">" + esc(w("rec")) + "</button>") + "</div>" : "") +
      (A.tuneOn ? '<div class="al-tune" id="aoglTune"><h3 class="plab" style="margin:0">' + esc(w("tuneH")) + "</h3>" +
        '<div class="al-row"><label class="al-field"><span class="plab">' + esc(w("tuning")) + '</span><select id="aoglTuning">' +
        Object.keys(TUNINGS).filter(function (id) { return k === "bass" ? id === "bass" : id !== "bass"; }).map(function (id) { return '<option value="' + id + '"' + (id === tid ? " selected" : "") + ">" + esc(TUNINGS[id].name[L()]) + "</option>"; }).join("") +
        '</select></label><label class="al-field" style="flex:0 1 9rem"><span class="plab">' + esc(w("refA")) + '</span><select id="aoglA">' +
        [430, 432, 435, 438, 440, 442, 444, 446, 450].map(function (a) { return '<option value="' + a + '"' + (a === refA() ? " selected" : "") + ">" + a + " Hz</option>"; }).join("") + "</select></label></div>" +
        '<div class="al-top"><span class="al-note" aria-live="off">–</span><span class="al-cents" aria-live="polite"></span></div>' +
        '<div class="al-meter" role="meter" aria-valuemin="-50" aria-valuemax="50" aria-valuenow="0" aria-label="' + esc(w("needle")) + '"><span class="al-needle" aria-hidden="true"></span></div>' +
        '<p class="line" style="margin:0">' + esc(w("tuneHint")) + "</p></div>" : "") +
      (tk ? '<div class="al-row"><b style="color:#f1ebdf">' + esc(tk.item.name[L()]) + '</b><a class="pbtn" href="' + tk.urlT + '" download="' + esc(fileName(tk, "")) + '">' + esc(w("saveTone")) + "</a>" +
        '<a class="pbtn" href="' + tk.urlD + '" download="' + esc(fileName(tk, "-clean")) + '">' + esc(w("saveDry")) + "</a>" +
        '<button type="button" class="pbtn clear" id="aoglDel">' + esc(w("del")) + "</button></div>" : "") +
      (A.gone ? '<div class="al-row"><button type="button" class="pbtn" id="aoglBack">' + esc(w("back")) + "</button></div>" : "") +
      '<p class="line" id="aoglLine" aria-live="polite" style="margin:0">' + esc(lineText()) + "</p></div>";
    var b;
    if ((b = el("aoglOn"))) b.onclick = function () { turnOn(); };
    if ((b = el("aoglOff"))) b.onclick = function () { if (A.rec) return; close(false); paint(); };
    if ((b = el("aoglTuneBtn"))) b.onclick = function () { if (A.tuneOn) tuneStop(); else tuneStart(); };
    if ((b = el("aoglRec"))) b.onclick = recStart;
    if ((b = el("aoglStop"))) b.onclick = recStop;
    if ((b = el("aoglDel"))) b.onclick = delTake;
    if ((b = el("aoglBack"))) b.onclick = backTake;
    if ((b = el("aoglHear"))) b.onchange = function () { A.hear = this.checked; store(A.KEY_HEAR, A.hear ? "1" : "0"); if (A.mon) A.mon.gain.value = A.hear ? 1 : 0; };
    if ((b = el("aoglDev"))) b.onchange = function () { var v = this.value; store(A.KEY_IN, v); var t = A.tuneOn; turnOn(v).then(function () { if (t) tuneStart(); }); };
    if ((b = el("aoglTuning"))) b.onchange = function () { store(A.KEY_TUNE, this.value); A.hold = null; };
    if ((b = el("aoglA"))) b.onchange = function () { store("aog.tuner.a.v1", this.value); };
    if (A.tuneOn) paintTune();
  }
  function fileName(tk, suf) { return (A.o.kind === "bass" ? (L() === "es" ? "bajo-en-vivo-" : "live-bass-") : (L() === "es" ? "guitarra-en-vivo-" : "live-guitar-")) + tk.num + suf + ".wav"; }

  window.AOGLive = {
    attach: function (o) {
      A = { o: o, hear: true, state: "", busy: false, KEY_IN: "aog." + o.kind + ".live.input.v1", KEY_HEAR: "aog." + o.kind + ".live.hear.v1", KEY_N: "aog." + o.kind + ".live.n.v1", KEY_TUNE: "aog." + o.kind + ".tuning.v1" };
      A.hear = store(A.KEY_HEAR) !== "0";
      if (!el("aogl-css")) { var st = D.createElement("style"); st.id = "aogl-css"; st.textContent = CSS; D.head.appendChild(st); }
      paint();
      return { paint: paint, get state() { return A; } };
    },
    setRig: function (state) { if (A && A.rig) { try { A.rig.set(state); } catch (e) {} } },
    paint: function () { if (A) paint(); },
    _pitch: pitchOf
  };
})();
