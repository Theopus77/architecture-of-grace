/* AOG-MUSIC-REC-V1 (2026-10-03) — one Record button for every music tool.
   Jimmy, at the piano: "There is no record button on the keyboard"; then: "Make sure these engines have record options …
   There is no record button on guitar perhaps everything else too". The piano's recorder (AOG-PIANO-REC-V1) moved here, and
   the piano, the guitar, the bass, the band and the drum machine all use it (the turntables keep their own).

   ● Record keeps everything the tool plays as a take, the way the turntables' recorder does:
   - only the tool's own sound, never a microphone;
   - it listens just before the Volume, so a take is full strength whatever the Volume says;
   - up to five minutes, then it stops by itself and says why;
   - the quiet moment before the first sound is left out, and half a second after Stop is kept so the last note rings out;
   - a take with nothing in it is not kept;
   - the last three takes stay, each to hear, save as .wav, or send to the turntables or the Studio; nothing leaves the device;
   - switching away from the page ends the take and keeps it.
   A take is kept small while it records: 16 bits, left and right side by side, just as it will sit in the .wav; the rare
   peak past full scale is rounded off rather than cut flat.

   A page attaches it once:
     const REC = AOGRecorder.attach({
       context: () => theLiveAudioContext,          // made on the first tap if need be
       tap: () => theNodeJustBeforeTheVolume,       // the limiter
       lang: () => "en" or "es",
       what: {en:"the piano", es:"el piano"},       // "Recording the piano, never a microphone."
       prefix: {en:"Piano", es:"Piano"},            // the take's name on the turntables
       file: {en:"piano-take", es:"piano-toma"},    // piano-take-1.wav
       shelf: "keysbench",                          // where the turntables look (aog-handoff.js)
       bpm: () => tempo,
       label: {en:"● Record a take", es:"● Grabar una toma"},   // optional: another name for the button
       ids: {btn:"recBtn", time:"recTime", line:"recLine", list:"takes"}
     });
   then calls REC.toggle() from its button and REC.paint() whenever it paints its words.

   AOG-TAKE-TO-PADS-V1 (2026-10-03) — Jimmy: "Can we send the sounds from the instruments to the drum machine as samples? Not just
   for the pads". On the piano, the guitar, the bass and the band a take has one more action, Send to the drum machine. The tool is
   known by its shelf (keysbench, guitarbench, bassbench, bandbench), so no page has to say more; the drum machine's own takes do
   not get it. The take goes on the shelf "drumsample" the way the drum machine keeps a sample: one channel, 26,040 samples a
   second, from its first sound, and no longer than 2.5 s. To get there it is low-passed and resampled in one step (each new sample
   is a windowed-sinc sum of the old ones around it), so nothing above the new rate's limit folds back as a whistle. Its peak is set
   to 0.8, as the chord pads are, and its last 20 ms fade so a sound cut at 2.5 s does not click. The shelf holds
   {from:"piano"|"guitar"|"bass"|"band", name:{en:"Guitar take 2", es:"Toma de guitarra 2"}, seconds, at, rate:26040, pcm:Float32Array};
   the drum machine shows it and puts it on the pad you pick.

   AOG-STUDIO-SEND-V1 (2026-10-04) — Jimmy: "All the instruments should be able to record and send their tracks over to the
   STUDIO." Every take, on every tool (the drum machine's too), has one more action: Send to the Studio. The take joins the
   Studio's inbox (aog-handoff.js, the list "studioinbox"), which keeps many takes, not just the newest: two guitar takes, a bass
   take and a drum take can all wait there together. Each carries the tool, its number, its length, its tempo (the tool's tempo
   when Record was pressed) and when it was made; the inbox keeps the newest 16. Sending the same take twice keeps it once. The
   line then says "Sent to the Studio. Open the Studio", and keeps saying it when the page repaints, until the next thing
   happens. The tool is known by its shelf (or the page's address, or o.tool), so no page has to change. Send to the turntables
   and Send to the drum machine work exactly as before.

   AOG-REC-KEEP-V1 (2026-10-11) — Jimmy: "Do the fixes first." A take used to live only in the page's memory, so it was gone
   when the page closed, and when the Studio closed a room it had kept open out of sight to make space. Now each room's last
   three takes are also kept in this browser's own storage (aog-handoff.js, the list "roomtakes/<shelf>"), so they come back
   when the room opens again: after the Studio closed it, after a reload, after the iPad put the tab to sleep. Still only on
   this device; Delete takes one out. Whether a take was added to My Track is kept with it. If the browser has no room to
   keep it (or no storage at all), the take stays in memory as before and the room says so to the Studio (kept() is false),
   so the Studio does not close that room.

   AOG-OVERDUB-V1 (2026-10-11) — Jimmy's "1": "Record over your song. In any room, press Record and hear My Track playing
   while you play. The new take lands on the right bar." Inside the Studio, with ♫ With My Track on (the Studio's bar) and
   something on My Track, ● Record first asks the Studio for My Track (the Mixing Desk bounces it), then plays one bar of
   four clicks and My Track from the bar picked in From, straight to the speakers: My Track is heard, never recorded, so the
   take is only what you play. A beat or a chord pattern already playing in the room starts again on that bar line
   (window.AOGRoomClock.align, where the room has one). The take's place is worked out from the audio clock: the frame its
   first sample was heard at (the listening ear reports it), less the time the sound takes to reach your ears (the device's
   output delay, or half the round trip the Timing check measured, AOG-LATENCY-V1), counted from the bar My Track started
   on. The take is then cut to begin on the bar line of the bar its first note is in, and carries place {bar, bpm} to the
   Mixing Desk, which puts it exactly there. The song's tempo is its tempo.

   AOG-NOTES-V1 (2026-10-11) — Jimmy's ceiling-breaker: "Record notes, not just sound … fix a wrong note, change an
   instrument after recording, or tighten the timing." A room that says how (o.notes: () => {room, sound, set}) also keeps
   which notes it played. Its voice maker tells this recorder about every voice that sounds on the live engine
   (AOGRecorder.note(ctx, voice, {m, v, when, …})), whoever played it: a key, a chord pad, a pattern, MIDI, Solo, a strum.
   The recorder watches that voice's stop, kill and glide, so a note's length is how long it really sounded (the pedal
   is already in it; pedal moves are kept too, AOGRecorder.pedal). When the take is made, every note that starts inside
   it is given in the take's own time: t = seconds from the take's first sample, the same cut the sound got (the quiet
   start left out, or the bar line of a take over My Track). The take then carries
     notes: {v:1, room, sound, set, sr, lag, ev:[{t, m, v, d, …}], ped:[{t, on}]}
   (lag: how long after a note's time its sound begins, measured on this take; used to line notes up with the beat).
   Kept with the take, sent with it to the Mixing Desk. Takes from a room that does not say how carry nothing new. */
(function () {
  "use strict";
  var W = {
    rec: { en: "● Record", es: "● Grabar" },
    recStop: { en: "■ Stop recording", es: "■ Parar grabación" },
    recOn: { en: "Recording {what}, never a microphone. Play anything, then press Stop recording.", es: "Grabando {what}, nunca un micrófono. Toca lo que quieras y luego pulsa Parar grabación." },
    recKeep: { en: "Your last three takes stay on this device, even when you leave. To use one, add it to My Track or save it.", es: "Tus tres últimas tomas se quedan en este dispositivo, aunque salgas. Para usar una, añádela a mi pista o guárdala." },
    recFull: { en: "Five minutes is the limit, so recording stopped.", es: "Cinco minutos es el límite, así que la grabación se detuvo." },
    recNone: { en: "Nothing was played, so there is no take.", es: "No se tocó nada, así que no hay toma." },
    take: { en: "Take", es: "Toma" },
    save: { en: "Save as .wav", es: "Guardar como .wav" },
    mine: { en: "my playing", es: "lo que toqué" },
    send: { en: "Send to the turntables", es: "Enviar a los platos" },
    sent: { en: "Sent. Open the turntables to play it.", es: "Enviado. Abre los platos para tocarlo." },
    decks: { en: "The turntables", es: "Los tocadiscos" },
    /* AOG-TAKE-TO-PADS-V1 */
    drum: { en: "Send to the Drum Machine", es: "Enviar a la caja de ritmos" },
    drumSent: { en: "Sent. It is on bank D of the Drum Machine, cut across the pads.", es: "Enviada. Está en el banco D de la caja de ritmos, cortada en los pads." },
    drums: { en: "Open the Drum Machine", es: "Abrir la caja de ritmos" },
    fail: { en: "That did not work. Try again.", es: "No funcionó. Inténtalo otra vez." },
    /* AOG-STUDIO-SEND-V1 */
    studio: { en: "Send to the Mixing Desk", es: "Enviar a la mesa de mezclas" },
    studioSent: { en: "Sent to the Mixing Desk.", es: "Enviada a la mesa de mezclas." },
    studioGo: { en: "Open the Mixing Desk", es: "Abrir la mesa de mezclas" },
    /* AOG-MYTRACK-V1 (STUDIO-HANDOFF §06, §11) — inside the Studio the same send is "Add to My Track" */
    layer: { en: "+ Add to My Track", es: "+ Añadir a mi pista" },
    layerSent: { en: "Added to My Track.", es: "Añadida a mi pista." },
    /* AOG-REC-DELETE-V1 — Jimmy: "There should be a delete button for the musical recording. I accidentally hit the record
       button when I was playing." Every take can be deleted; for a moment it can be brought back. */
    del: { en: "Delete", es: "Borrar" },
    delAria: { en: "Delete take {n}", es: "Borrar la toma {n}" },
    deleted: { en: "Take {n} is deleted.", es: "La toma {n} está borrada." },
    undo: { en: "Bring it back", es: "Recuperarla" },
    /* AOG-OVERDUB-V1 */
    overPrep: { en: "Getting My Track ready…", es: "Preparando mi pista…" },
    overOn: { en: "Four clicks, then My Track plays. Play along, then press Stop recording.", es: "Cuatro clics y luego suena mi pista. Toca con ella y luego pulsa Parar grabación." },
    overDone: { en: "Take {n} comes in at bar {b}. Add it to My Track and it goes right there.", es: "La toma {n} entra en el compás {b}. Añádela a mi pista y irá justo ahí." },
    noRoom: { en: "This device has no room left for takes. At the Mixing Desk, remove a take you do not need, then try again.", es: "Este dispositivo no tiene más espacio para tomas. En la mesa de mezclas, quita una toma que no necesites y vuelve a intentarlo." }
  };
  /* AOG-TAKE-TO-PADS-V1 — the tools whose takes can go to the drum machine, and what a take is called there */
  var TOOL = { keysbench: "piano", guitarbench: "guitar", bassbench: "bass", bandbench: "band" };
  var TAKE_NAME = {
    piano: { en: "Piano take ", es: "Toma de piano " },
    guitar: { en: "Guitar take ", es: "Toma de guitarra " },
    bass: { en: "Bass take ", es: "Toma de bajo " },
    band: { en: "Band take ", es: "Toma de la banda " }
  };
  function toolOf(o) {
    if (TOOL[o.shelf]) return TOOL[o.shelf];
    var m = /music-(piano|guitar|bass|band)\b/.exec(location.pathname || "");
    return m ? m[1] : "";
  }
  /* AOG-STUDIO-SEND-V1 — every tool's takes go to the Studio, the drum machine's too; its take is a "Drum take" */
  var STUDIO_TOOL = { keysbench: "piano", guitarbench: "guitar", bassbench: "bass", bandbench: "band", drumtake: "drums" };
  var DRUM_TAKE = { en: "Drum take ", es: "Toma de ritmos " };
  function studioTool(o) {
    if (o.tool) return String(o.tool);
    if (STUDIO_TOOL[o.shelf]) return STUDIO_TOOL[o.shelf];
    var m = /music-(piano|guitar|bass|band|drums)\b/.exec(location.pathname || "");
    return m ? m[1] : "";
  }
  function studioName(o, tool, n) {
    var nm = tool === "drums" ? DRUM_TAKE : TAKE_NAME[tool];
    if (!nm) nm = { en: o.prefix.en + " take ", es: "Toma de " + String(o.prefix.es).toLowerCase() + " " };
    return { en: nm.en + n, es: nm.es + n };
  }
  var PAD_RATE = 26040, PAD_MAX = 2.5;
  /* a band-limited change of rate: a windowed-sinc low-pass (Blackman, 16 zero crossings a side, cut at 45% of the lower rate)
     and the resampling in one sum, read from a table of the kernel */
  function resample(x, from, to) {
    if (from === to) return x.slice();
    var fc = 0.45 * Math.min(1, to / from), half = 16 / (2 * fc), OS = 512, nt = Math.ceil(half * OS) + 2, tab = new Float32Array(nt), i;
    for (i = 0; i < nt; i++) {
      var d = i / OS; if (d >= half) break;
      var a = 2 * fc * d, s = a ? Math.sin(Math.PI * a) / (Math.PI * a) : 1, u = d / half;
      tab[i] = 2 * fc * s * (0.42 + 0.5 * Math.cos(Math.PI * u) + 0.08 * Math.cos(2 * Math.PI * u));
    }
    var step = from / to, n = Math.max(1, Math.floor((x.length - 1) / step) + 1), y = new Float32Array(n), last = x.length - 1;
    for (var j = 0; j < n; j++) {
      var t = j * step, k0 = Math.max(0, Math.ceil(t - half)), k1 = Math.min(last, Math.floor(t + half)), acc = 0;
      for (var k = k0; k <= k1; k++) {
        var p = (t > k ? t - k : k - t) * OS, q = p | 0;
        if (q + 1 < nt) acc += x[k] * (tab[q] + (tab[q + 1] - tab[q]) * (p - q));
      }
      y[j] = acc;
    }
    return y;
  }
  /* a take (the 16-bit stereo .wav this recorder writes), made ready for a drum pad */
  async function toPad(blob) {
    var head = new DataView(await blob.slice(0, 44).arrayBuffer()), sr = head.getUint32(24, true) || 44100;
    /* the take starts about 50 ms before its first sound, so its first three seconds hold everything a pad can use */
    var bytes = await blob.slice(44, 44 + Math.ceil(3 * sr) * 4).arrayBuffer();
    var x = new Int16Array(bytes, 0, (bytes.byteLength >> 2) * 2), n = x.length >> 1, quiet = 66, on = 0;
    while (on < n && x[2 * on] <= quiet && x[2 * on] >= -quiet && x[2 * on + 1] <= quiet && x[2 * on + 1] >= -quiet) on++;
    if (on >= n) return null;
    on = Math.max(0, on - Math.round(0.001 * sr));                    /* 1 ms before the first sound, so its attack is whole */
    var len = Math.min(n - on, Math.ceil(PAD_MAX * sr) + 64), mono = new Float32Array(len), i;
    for (i = 0; i < len; i++) mono[i] = (x[2 * (on + i)] + x[2 * (on + i) + 1]) / 65536;
    var y = resample(mono, sr, PAD_RATE), end = Math.min(y.length, Math.floor(PAD_MAX * PAD_RATE));
    while (end > 64 && y[end - 1] < 0.002 && y[end - 1] > -0.002) end--;   /* no quiet tail to take up the sampler's memory */
    y = y.slice(0, end);
    var pk = 0; for (i = 0; i < y.length; i++) { var a = y[i] < 0 ? -y[i] : y[i]; if (a > pk) pk = a; }
    var g = pk > 0 ? Math.min(8, 0.8 / pk) : 1, f = Math.min(y.length >> 2, Math.round(0.02 * PAD_RATE));
    for (i = 0; i < y.length; i++) y[i] *= g;
    for (i = 0; i < f; i++) y[y.length - 1 - i] *= i / f;
    return y;
  }
  /* the listening ear: it collects what passes through it in pieces of 4096 frames, only while it is armed */
  /* AOG-NOTES-V1: a second input carries the room's note marks (noteOf: a tiny steady source made right after each voice,
     each its own power of two): the frame where a mark begins is the frame where the sound engine took up that voice, so
     a note played "now" gets the moment it really began, not the moment the page asked for it (the engine works ahead of
     the page's clock, and a busy page can make a new voice wait a turn or two) */
  var SRC = [
    "class AogRec extends AudioWorkletProcessor{",
    "  constructor(){ super(); this.on=false; this.n=0; this.f0=-1; this.cv=NaN; this.L=new Float32Array(4096); this.R=new Float32Array(4096);",
    "    this.port.onmessage=(e)=>{ if(e.data && e.data.t==='arm'){ if(!e.data.on) this.flush(); else { this.f0=-1; this.cv=NaN; } this.on=!!e.data.on; } }; }",
    "  flush(){ if(this.n){ this.port.postMessage({t:'chunk', L:this.L.slice(0,this.n), R:this.R.slice(0,this.n)}); this.n=0; } }",
    "  process(inputs){",
    "    const i=inputs[0], q=inputs[1]; if(!this.on || !i || !i.length) return true;",
    "    if(this.f0<0){ this.f0=currentFrame; this.port.postMessage({t:'start', frame:currentFrame}); }",
    "    if(q && q[0]){ const b=q[0]; if(!(b[0]===this.cv && b[b.length-1]===this.cv)){ let k=0; while(k<b.length && b[k]===this.cv) k++; this.cv=b[b.length-1]; this.port.postMessage({t:'cv', frame:currentFrame+k, v:this.cv}); } }",
    "    const a=i[0], b=i[1]||i[0];",
    "    for(let k=0;k<a.length;k++){",
    "      this.L[this.n]=a[k]; this.R[this.n]=b[k]; this.n++;",
    "      if(this.n===4096){ this.port.postMessage({t:'chunk', L:this.L, R:this.R}, [this.L.buffer, this.R.buffer]); this.L=new Float32Array(4096); this.R=new Float32Array(4096); this.n=0; }",
    "    }",
    "    return true;",
    "  }",
    "}",
    "registerProcessor('aog-rec', AogRec);"
  ].join("\n");
  var CSS = [
    ".aogrec-btn{border-color:#c4452a!important;color:#ffb1a4!important}",
    ".aogrec-btn[aria-pressed=\"true\"]{background:linear-gradient(#ffb1a4,#c4452a)!important;color:#2a0c08!important}",
    ".aogrec-time{font:800 1rem/1 -apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif;color:#ffb1a4;min-width:3rem;font-variant-numeric:tabular-nums}",
    ".aogrec-list{display:grid;gap:.6rem;margin-top:.6rem}",
    ".aogrec-list:empty{display:none}",
    ".aogrec-take{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem .8rem;padding:.6rem .7rem;border:1px solid #2f3339;border-radius:12px;background:#181a1e;color:#d7cbb8}",
    ".aogrec-take b{color:#f1ebdf;font-weight:800}",
    ".aogrec-take .aogrec-len{color:#d7cbb8;font-variant-numeric:tabular-nums}",
    ".aogrec-take audio{height:40px;max-width:100%;flex:1 1 14rem}",
    ".aogrec-b{min-height:44px;border-radius:12px;border:1px solid #0a0b0d;background:linear-gradient(#3a3e44,#1c1f23);color:#f3efe6;font:800 .95rem/1.2 -apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif;padding:0 1rem;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;cursor:pointer;touch-action:manipulation}",
    ".aogrec-b.send{border-color:#5b8fd6;color:#cfe2ff}",
    ".aogrec-b:disabled{opacity:.6;cursor:default}",
    ".aogrec-b.del{border-color:#c4452a;color:#ffb1a4}",
    /* a page whose recorder sits outside its dark instrument gets a dark panel of its own */
    ".aogrec-box{background:linear-gradient(180deg,#2a2d31 0%,#17191c 16%,#101114 100%);border:1px solid #07080a;border-radius:18px;padding:14px;margin:1rem 0;color:#d7cbb8}",
    ".aogrec-box .aogrec-row{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem .8rem}",
    ".aogrec-box .aogrec-line{color:#d7cbb8;font-size:.95rem;line-height:1.45;margin:.55rem 0 0}",
    ".aogrec-box .aogrec-line a,.aogrec-take a:not(.aogrec-b){color:#cfe2ff}"
  ].join("\n");
  var url = null, styled = false;
  /* AOG-NOTES-V1: the one recorder on this page that keeps notes (a page attaches one) */
  var CAP = null;
  function r4(x) { return Math.round(x * 10000) / 10000; }
  function r3(x) { return Math.round(x * 1000) / 1000; }
  function style() { if (styled) return; styled = true; var s = document.createElement("style"); s.id = "aog-rec-css"; s.textContent = CSS; document.head.appendChild(s); }
  function clock(sec) { var s = Math.max(0, Math.floor(sec)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

  function attach(o) {
    var R = { on: false, closing: false, chunks: [], frames: 0, t0: 0, timer: 0, takes: [], n: 0, max: 300, msg: "", node: null, sink: null, sr: 44100,
      bpm0: 0, studioLine: false, kept: true, cnt: null, cntV: 0, cvs: [], cvT: [] };
    /* AOG-REC-KEEP-V1: this room's takes, kept on the device */
    var KEPT = "roomtakes/" + (o.shelf || studioTool(o) || location.pathname);
    function A() { return window.AOGHandoff && AOGHandoff.add ? AOGHandoff : null; }
    function store(k) {
      var H = A(); if (!H) { R.kept = false; return Promise.resolve(); }
      var it = { n: k.n, sec: k.sec, at: k.at, bpm: k.bpm, added: !!k.added, place: k.place || null, wav: k.blob };
      if (k.notes) it.notes = k.notes;   /* AOG-NOTES-V1 */
      return H.add(KEPT, it, { max: 3, key: "take|" + k.at + "|" + k.n })
        .then(function (r) { k.hid = r.id; if (R.takes.indexOf(k) < 0) { unstore(k); return; }   /* deleted while it was being kept */
          R.kept = R.takes.every(function (x) { return !!x.hid; }); }, function () { R.kept = false; });
    }
    function unstore(k) { var H = A(); if (H && k.hid) { var id = k.hid; k.hid = ""; H.remove(KEPT, id).catch(function () {}); } }
    async function restore() {
      var H = A(); if (!H) { R.kept = false; return; }
      try {
        var ix = await H.list(KEPT), got = [];
        for (var i = 0; i < ix.items.length && got.length < 3; i++) {
          var m = ix.items[i], it = await H.item(KEPT, m.id);
          if (!it || !(it.wav instanceof Blob) || it.wav.size <= 44) continue;
          if (R.takes.some(function (x) { return x.at === it.at && x.n === it.n; })) continue;
          got.push({ n: it.n, sec: it.sec, blob: it.wav, url: URL.createObjectURL(it.wav), at: it.at, bpm: it.bpm || 0, added: !!it.added, place: it.place || null, notes: it.notes || null, hid: m.id });
        }
        if (!got.length) return;
        R.takes = R.takes.concat(got).sort(function (a, c) { return (c.at || 0) - (a.at || 0) || c.n - a.n; });
        while (R.takes.length > 3) { var old = R.takes.pop(); URL.revokeObjectURL(old.url); }
        R.n = Math.max(R.n, Math.max.apply(null, R.takes.map(function (x) { return x.n; })));
        R.paint();
      } catch (e) {}
    }
    function L() { return o.lang() === "es" ? "es" : "en"; }
    function w(k) { var src = (k === "rec" && o.label) ? o.label : W[k]; return src[L()].split("{what}").join(o.what[L()]); }
    function el(k) { return document.getElementById(o.ids[k]); }
    function fillIn(x) { var f = R.fill || {}; for (var k in f) x = x.split("{" + k + "}").join(f[k]); return x; }
    /* the tools' limiters let the very start of a hit poke a little past full scale; in a take that would be cut flat, so
       anything above 90% is rounded gently toward 100% instead */
    function ceil(v) { var a = v < 0 ? -v : v; if (a <= 0.9) return v; var y = 0.9 + 0.1 * Math.tanh((a - 0.9) / 0.1); return v < 0 ? -y : y; }
    function keep(Lc, Rc) {
      if (!R.on && !R.closing) return;
      var n = Lc.length, x = new Int16Array(n * 2);
      for (var i = 0; i < n; i++) {
        var l = ceil(Lc[i]), r = ceil(Rc[i]);
        x[2 * i] = l < 0 ? l * 0x8000 : l * 0x7fff; x[2 * i + 1] = r < 0 ? r * 0x8000 : r * 0x7fff;
      }
      R.chunks.push(x); R.frames += n;
    }
    async function build() {
      var c = o.context(); R.sr = c.sampleRate;
      if (R.node && R.node.context === c) return;
      try {
        if (!c.audioWorklet) throw new Error("no worklet");
        if (!url) url = URL.createObjectURL(new Blob([SRC], { type: "application/javascript" }));
        await c.audioWorklet.addModule(url);
        var n = new AudioWorkletNode(c, "aog-rec", { numberOfInputs: 2, numberOfOutputs: 1, outputChannelCount: [2] });
        n.port.onmessage = function (e) { if (!e.data) return; if (e.data.t === "chunk") keep(e.data.L, e.data.R); else if (e.data.t === "start") R.f0 = e.data.frame;
          else if (e.data.t === "cv" && (R.on || R.closing)) R.cvs.push([e.data.v, e.data.frame]); };
        R.node = n;
        /* AOG-NOTES-V1: the note count, into the second input */
        R.cnt = typeof c.createConstantSource === "function" ? n : null;   /* the marks go into its second input (bump, below) */
      } catch (e) {                                   /* an older browser: the same, the old way */
        var sp = c.createScriptProcessor(4096, 2, 2);
        sp.onaudioprocess = function (ev) { if (!R.on && !R.closing) return; var ib = ev.inputBuffer;
          if (R.f0 < 0 && R.on) R.f0 = Math.round((ev.playbackTime || c.currentTime) * c.sampleRate);
          keep(Float32Array.from(ib.getChannelData(0)), Float32Array.from(ib.getChannelData(ib.numberOfChannels > 1 ? 1 : 0))); };
        R.node = sp;
      }
      /* it ends in silence: a node only runs when it reaches the speakers, and the take is not played twice */
      R.sink = c.createGain(); R.sink.gain.value = 0;
      o.tap().connect(R.node); R.node.connect(R.sink); R.sink.connect(c.destination);
      try { if (window.AOGRoom) AOGRoom.rec(c, o.tap(), R.node); } catch (e) {}   /* AOG-STUDIO-ROOM-SOUND-V1: a take carries the room */
    }
    /* ── AOG-OVERDUB-V1: My Track under the take ── */
    function shell() { try { return document.documentElement.classList.contains("in-studio") && window.parent !== window && window.parent.AOGStudioShell || null; } catch (e) { return null; } }
    /* the time the sound takes to reach your ears: what the browser says, else half the round trip the Timing check measured */
    function outDelay(c) {
      var v = (+c.outputLatency || 0) + (+c.baseLatency || 0); if (v > 0 && v < 0.5 && c.outputLatency > 0) return v;
      var m = null; try { m = JSON.parse(localStorage.getItem("aog.latency.v1") || "null"); } catch (e) {}
      if (m && m.rt > 0 && m.rt < 1) return m.rt / 2;
      return v > 0 && v < 0.5 ? v : 0;
    }
    function click(c, when, top) {
      var os = c.createOscillator(), g = c.createGain(); os.frequency.value = top ? 1568 : 1046;
      g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(top ? 0.5 : 0.32, when + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
      os.connect(g); g.connect(c.destination); os.start(when); os.stop(when + 0.06);
    }
    function overStart(bk, from) {
      var c = o.context(), buf = c.createBuffer(2, bk.L.length, bk.sr);
      buf.copyToChannel(bk.L, 0); buf.copyToChannel(bk.R, 1);
      var src = c.createBufferSource(), g = c.createGain(); src.buffer = buf; src.connect(g); g.connect(c.destination);   /* to the speakers, not into the take */
      var beat = bk.barSec / 4, t0 = c.currentTime + 0.3, S0 = t0 + bk.barSec, from1 = Math.max(1, from | 0), offs = (from1 - 1) * bk.barSec;
      for (var k = 0; k < 4; k++) click(c, t0 + k * beat, k === 0);
      if (offs < buf.duration - 0.01) src.start(S0, offs);
      R.over = { S0: S0, from: from1, barSec: bk.barSec, bpm: bk.bpm, src: src, g: g, lat: outDelay(c) };
      try { if (window.AOGRoomClock && AOGRoomClock.align) AOGRoomClock.align(S0, bk.barSec); } catch (e) {}
    }
    function overStop() {
      var O = R.over; if (!O || !O.src) return;
      try { var c = O.g.context, now = c.currentTime; O.g.gain.setValueAtTime(O.g.gain.value, now); O.g.gain.linearRampToValueAtTime(0, now + 0.06); O.src.stop(now + 0.08); } catch (e) {}
      O.src = null;
    }
    function arm(on) { if (on) { R.f0 = -1; R.cvs = []; noteTrim(true); } R.on = on; if (R.node && R.node.port) R.node.port.postMessage({ t: "arm", on: on }); }
    /* ── AOG-NOTES-V1: every voice the room makes on its live engine, and how long it really sounded ── */
    R.nl = []; R.pl = [];
    function isOff(c) { return !!(window.OfflineAudioContext && c instanceof OfflineAudioContext) || !!(window.webkitOfflineAudioContext && c instanceof window.webkitOfflineAudioContext); }
    function noteTrim(arming) {
      if (R.on || R.closing) { if (R.nl.length > 6000) R.nl.splice(0, R.nl.length - 6000); return; }
      var c = R.node ? R.node.context : R.nctx, now = c ? c.currentTime : Infinity;
      if (!c) { R.nl = R.nl.slice(-64); R.pl = R.pl.slice(-16); return; }
      R.nl = R.nl.filter(function (x) { return x.w >= now - (arming ? 1 : 2); });
      R.pl = R.pl.filter(function (x) { return x.w >= now - 2; });
    }
    function noteOf(c, vc, e) {
      if (!o.notes || !vc || vc.__aogN || !e || !(e.m >= 0) || typeof e.when !== "number" || isOff(c)) return vc;
      R.nctx = c;
      /* the sound engine works a little ahead of the page's clock: a note asked for "now", or for a moment it has already
         passed, starts when the engine next takes it up; the note count marks that moment (a note for later starts then) */
      /* the mark: a tiny steady source made right after the voice, so the engine takes both up together; each mark is its own
         power of two (23 in turn), so the sum the listening ear hears says which marks have begun */
      var bump = function (t) {
        if (!R.cnt || R.cnt.context !== c || !(t <= c.currentTime + 0.1)) return 0;
        if (R.cntV > 1e7) R.cntV = 0; R.cntV++;
        try { var cs = c.createConstantSource(); cs.offset.value = Math.pow(2, R.cntV % 23); cs.connect(R.cnt, 0, 1); cs.start(); cs.stop(c.currentTime + 0.15);
          cs.onended = function () { try { cs.disconnect(); } catch (err) {} }; } catch (err) { return 0; }
        R.cvT[R.cntV % 4096] = c.currentTime;
        return R.cntV; };
      var x = { w: Math.max(e.when, c.currentTime), e: e, vc: vc, off: null, r: null, k: null, g: null, cv: bump(e.when), ocv: 0 };
      try { Object.defineProperty(vc, "__aogN", { value: x, enumerable: false, configurable: true }); } catch (err) { vc.__aogN = x; }
      var st = vc.stop, kl = vc.kill, gl = vc.glide;
      if (typeof st === "function") vc.stop = function (t, tau) {
        if (!this.stopped && x.off == null) { x.off = Math.max(+t || 0, c.currentTime); x.r = +tau || 0; x.ocv = bump(+t || 0); if (arguments[2] && arguments[2].rel) x.rl = 1; }   /* rel: the hand's sound on the string */
        return st.apply(this, arguments); };
      if (typeof kl === "function") vc.kill = function (t) {
        var T = Math.max(+t || 0, c.currentTime);
        if (x.off == null || T < x.off) { x.off = T; x.r = -1; x.ocv = bump(+t || 0); } else if (x.r !== -1 && (x.k == null || T < x.k)) x.k = T;
        return kl.apply(this, arguments); };
      if (typeof gl === "function") vc.glide = function (m2, at) {
        var T = Math.max(+at || 0, c.currentTime), g = x.g || (x.g = []), last = g[g.length - 1];
        if (g.length < 600 && (!last || Math.abs(last[1] - m2) > 0.004)) g.push([T, +m2, (+at || 0) <= c.currentTime + 0.003 ? bump(+at || 0) : 0]);   /* a bend "now": its moment marked too */
        return gl.apply(this, arguments); };
      noteTrim(false);
      R.nl.push(x);
      return vc;
    }
    /* the notes that start inside the take, in its own time (T0: the take's first sample on the audio clock; first: when
       its first sound is, in the take) */
    function notesOf(T0, sec, first) {
      if (!o.notes || !(T0 >= 0) || !R.nl.length) return null;
      var info = {}; try { info = o.notes() || {}; } catch (err) { info = {}; }
      var end = T0 + sec, ev = [], minT = Infinity, sr = R.sr;
      /* the frame the sound engine took up note count v (the first change at or past it) */
      var at = function (v, fall) {
        if (!v) return fall;
        var b = Math.pow(2, v % 23), from = ((R.cvT[v % 4096] || 0) - 0.05) * sr, to = from + 0.6 * sr, was = false;
        for (var i = 0; i < R.cvs.length; i++) { var on = Math.floor(R.cvs[i][0] / b) % 2 === 1;
          if (on && !was && R.cvs[i][1] >= from && R.cvs[i][1] <= to) return R.cvs[i][1] / sr; was = on; }
        return fall; };
      R.nl.forEach(function (x) {
        var w = Math.max(x.e.when, at(x.cv, x.w));   /* asked for now: when it really began; asked for later: then, exactly */
        var t = w - T0; if (t < -0.002 || t >= sec) return;
        var nat = x.vc && x.vc.natural > w && isFinite(x.vc.natural) ? x.vc.natural : Infinity;
        var off = x.off != null ? Math.max(x.off, at(x.ocv, x.off)) : Math.min(end, nat);
        var e = { t: r4(Math.max(0, t)), m: r3(x.e.m), v: r3(Math.max(0, Math.min(1, +x.e.v || 0))), d: r4(Math.max(0.005, off - w)) };
        if (x.off != null) e.r = x.r === -1 ? -1 : r4(x.r);
        if (x.k != null && x.k > off) e.k = r4(x.k - w);
        if (x.rl) e.rl = 1;
        ["s", "o", "p", "a", "to", "sd", "kit", "kd", "z", "ck", "sl"].forEach(function (k) { if (x.e[k] != null) e[k] = x.e[k]; });
        if (x.e.snd != null && x.e.snd !== info.sound) e.snd = x.e.snd;
        if (x.g && x.g.length) e.g = x.g.map(function (q) { return [r4(Math.max(0, Math.max(q[0], at(q[2], q[0])) - w)), r3(q[1])]; });
        if (t < minT) minT = t;
        ev.push(e);
      });
      if (!ev.length) return null;
      ev.sort(function (a, b) { return a.t - b.t || a.m - b.m; });
      if (ev.length > 5000) ev.length = 5000;
      var lag = first - Math.max(0, minT); lag = lag > 0 && lag < 0.05 ? r4(lag) : 0;
      var ped = R.pl.filter(function (p) { return p.w - T0 >= -0.002 && p.w - T0 < sec; }).map(function (p) { return { t: r4(Math.max(0, p.w - T0)), on: p.on ? 1 : 0 }; });
      var space = 0; try { space = window.AOGRoom ? AOGRoom.get() : 0; } catch (err) { space = 0; }   /* the room knob, which a take carries */
      return { v: 1, room: String(info.room || studioTool(o) || ""), sound: String(info.sound || ""), set: info.set || {}, space: space, sr: R.sr, lag: lag, ev: ev, ped: ped };
    }
    if (o.notes) CAP = { note: noteOf, pedal: function (c, on) { if (isOff(c)) return; R.pl.push({ w: c.currentTime, on: !!on }); noteTrim(false); } };
    function finish() {
      var sr = R.sr, quiet = 66;                        /* about -54 dB: anything softer before the first sound is left out */
      var ci = 0, off = 0, found = false;
      for (ci = 0; ci < R.chunks.length; ci++) { var x = R.chunks[ci]; for (var i = 0; i < x.length; i++) { if (x[i] > quiet || x[i] < -quiet) { off = i; found = true; break; } } if (found) break; }
      if (!found) { R.chunks = []; R.frames = 0; R.msg = "recNone"; R.over = null; R.nl = []; R.pl = []; R.paint(); return; }
      var place = null, startF = 0, preOf = function (k) { var s = 0; for (var q = 0; q < k; q++) s += R.chunks[q].length; return s; };
      var firstF = (preOf(ci) + off) / 2;   /* the first sound's frame, from the first frame heard (AOG-NOTES-V1 measures lag by it) */
      if (R.over && R.f0 >= 0) {
        /* AOG-OVERDUB-V1: on the song's bars. The first note's moment in the song, then the bar line it follows */
        var O = R.over, Ts = (R.f0 + firstF) / sr - O.S0 - O.lat + (O.from - 1) * O.barSec;
        /* the bar line just before the first note (3 ms to spare, so its attack is whole: a note a little early starts the
           take on the bar before, with nothing cut off), and the bar the note belongs to (up to 60 ms early counts) */
        var Bs = Math.max(1, Math.floor((Ts - 0.003) / O.barSec) + 1), nb = Math.max(1, Math.floor((Ts + 0.06) / O.barSec) + 1);
        var cut = Math.round(sr * ((Bs - O.from) * O.barSec + O.S0 + O.lat)) - R.f0;   /* the frame bar Bs begins on */
        var total = 0; R.chunks.forEach(function (x) { total += x.length; }); total /= 2;
        /* played during the four clicks, before My Track began: an ordinary take, kept as it was played, with no place */
        if (Ts >= (O.from - 1) * O.barSec - 0.003 && cut < total - 1) place = { bar: Bs, bpm: O.bpm, note: nb };
      }
      if (place) {
        var lead = []; startF = cut;
        if (cut < 0) { lead.push(new Int16Array(-cut * 2)); ci = 0; off = 0; }
        else { var at = cut * 2; ci = 0; while (ci < R.chunks.length - 1 && at >= R.chunks[ci].length) { at -= R.chunks[ci].length; ci++; } off = Math.min(at, R.chunks[ci].length); }
        R.overLead = lead;
      }
      var back = place ? 0 : Math.floor(0.05 * sr) * 2;   /* keep 50 ms before the first sound (a take over the song starts on its bar line) */
      while (back > 0 && (off > 0 || ci > 0)) {
        if (off >= back) { off -= back; back = 0; }
        else { back -= off; if (ci > 0) { ci--; off = R.chunks[ci].length; } else { off = 0; back = 0; } }
      }
      off -= off % 2;
      if (!place) startF = (preOf(ci) + off) / 2;
      var parts = (place ? R.overLead : []).concat([R.chunks[ci].subarray(off)]); for (var j = ci + 1; j < R.chunks.length; j++) parts.push(R.chunks[j]);
      R.overLead = null; R.over = null;
      var bytes = 0; parts.forEach(function (p) { bytes += p.length * 2; });
      /* AOG-NOTES-V1: the notes, in the take's own time: its first sample is frame startF of what was heard */
      var notes = null;
      try { notes = R.f0 >= 0 ? notesOf((R.f0 + startF) / sr, bytes / 4 / sr, (firstF - startF) / sr) : null; } catch (e) { notes = null; }
      R.nl = []; R.pl = [];
      var h = new ArrayBuffer(44), v = new DataView(h), str = function (q, s) { for (var k = 0; k < s.length; k++) v.setUint8(q + k, s.charCodeAt(k)); };
      str(0, "RIFF"); v.setUint32(4, 36 + bytes, true); str(8, "WAVE"); str(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
      v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); str(36, "data"); v.setUint32(40, bytes, true);
      var blob = new Blob([h].concat(parts), { type: "audio/wav" });
      R.chunks = []; R.frames = 0;
      var take = { n: ++R.n, sec: bytes / 4 / sr, blob: blob, url: URL.createObjectURL(blob), at: Date.now(), bpm: place ? place.bpm : R.bpm0, added: false, hid: "", place: place };
      if (notes) take.notes = notes;
      if (place) { R.msg = "overDone"; R.fill = { n: take.n, b: place.note }; }
      R.takes.unshift(take);
      R.studioLine = false;
      while (R.takes.length > 3) { var old = R.takes.pop(); URL.revokeObjectURL(old.url); unstore(old); }
      R.kept = false; store(take);   /* AOG-REC-KEEP-V1 */
      try { if (window.AOGSong) AOGSong.seedFromRoom(); } catch (e) {}   /* AOG-SONG-V1: a new song takes its first take's tempo and key */
      if (!R.msg || R.msg === "overOn") R.msg = "recKeep";
      R.paint();
    }
    R.toggle = async function () {
      var btn = el("btn");
      if (!R.on) {
        if (R.closing || R.prepping) return;
        /* AOG-OVERDUB-V1: inside the Studio, with ♫ With My Track on, My Track first */
        var bk = null, sh = shell();
        if (sh && sh.over && sh.over().on && sh.backing) {
          R.prepping = true; R.msg = "overPrep"; R.studioLine = false; R.paint();
          try { bk = await sh.backing(); } catch (e) { bk = null; }
          R.prepping = false;
        }
        await build();
        R.chunks = []; R.frames = 0; R.t0 = performance.now(); R.msg = "recOn"; R.studioLine = false; R.over = null;
        try { R.bpm0 = o.bpm ? +o.bpm() || 0 : 0; } catch (e) { R.bpm0 = 0; }
        if (bk && bk.L && bk.L.length) { try { overStart(bk, sh.over().from); R.msg = "overOn"; } catch (e) { R.over = null; } }
        arm(true);
        R.timer = setInterval(function () {
          var sec = (performance.now() - R.t0) / 1000, t = el("time"); if (t) t.textContent = clock(sec);
          if (sec >= R.max) { R.msg = "recFull"; R.toggle(); }
        }, 250);
        R.paint();
        return;
      }
      /* Stop: half a second more, so the last note rings out, then the take */
      clearInterval(R.timer); R.timer = 0; R.closing = true;
      overStop();
      if (R.msg === "recOn") R.msg = "";
      if (btn) btn.disabled = true;
      setTimeout(function () { arm(false); setTimeout(function () { R.closing = false; var b = el("btn"); if (b) b.disabled = false; finish(); }, 160); }, 500);
    };
    R.send = async function (n) {
      var k = R.takes.find(function (x) { return x.n === n; }); if (!k) return;
      var name = o.prefix[L()] + " · " + w("mine") + " · " + w("take") + " " + k.n + " · " + clock(k.sec), line = el("line");
      R.studioLine = false;
      try {
        await AOGHandoff.put(o.shelf, { name: name, bpm: Math.round(o.bpm ? o.bpm() : 120), bars: 0, at: Date.now(), wav: k.blob, take: true });
        if (line) line.innerHTML = w("sent") + ' <a href="music-decks.html">' + w("decks") + "</a>";
      } catch (e) { if (line) line.textContent = w("fail"); }
    };
    /* AOG-TAKE-TO-PADS-V1 — Send to the drum machine: the take, ready for a pad, on the shelf the drum machine reads */
    R.toDrums = async function (n, btn) {
      var k = R.takes.find(function (x) { return x.n === n; }), from = toolOf(o), line = el("line");
      if (!k || !from) return;
      R.studioLine = false;
      if (btn) btn.disabled = true;
      /* AOG-SEND-TO-PADS-V1 (2026-10-07) — Jimmy: "I want them to be sent to the new drum machine!" The take joins the
         Studio's inbox (where the Drum Machine finds takes to chop) and a note on the shelf "padstake" tells the Drum
         Machine to put it on its chops bank. */
      try {
        if (!window.AOGHandoff || !AOGHandoff.add) throw new Error("no inbox");
        var tool = studioTool(o), bpm = k.bpm > 0 ? k.bpm : 0;
        if (!(bpm > 0)) { try { bpm = o.bpm ? +o.bpm() || 0 : 0; } catch (e) { bpm = 0; } }
        var r = await AOGHandoff.add(AOGHandoff.INBOX, { from: tool, n: k.n, name: studioName(o, tool, k.n), sec: Math.round(k.sec * 1000) / 1000,
          bpm: Math.round(bpm * 100) / 100, at: k.at || Date.now(), take: true, wav: k.blob }, { key: tool + "|" + (k.at || 0) + "|" + k.n });
        await AOGHandoff.put("padstake", { id: r.id, from: from, at: Date.now() });
        if (line) line.innerHTML = w("drumSent") + ' <a href="music-pads.html">' + w("drums") + "</a>";
      } catch (e) { if (line) line.textContent = w(e && e.name === "QuotaExceededError" ? "noRoom" : "fail"); }
      if (btn) btn.disabled = false;
    };
    /* AOG-STUDIO-SEND-V1 — Send to the Studio: the take joins the Studio's inbox, beside the others */
    function inStudio() { return document.documentElement.classList.contains("in-studio"); }   /* aog-labdoors.js, AOG-STUDIO-SHELL-V1 */
    function studioHtml() { return w(inStudio() ? "layerSent" : "studioSent") + ' <a href="/studio">' + w("studioGo") + "</a>"; }
    R.toStudio = async function (n, btn) {
      var k = R.takes.find(function (x) { return x.n === n; }), line = el("line");
      if (!k) return;
      if (btn) btn.disabled = true;
      try {
        if (!window.AOGHandoff || !AOGHandoff.add) throw new Error("no inbox");
        var tool = studioTool(o), bpm = k.bpm > 0 ? k.bpm : 0;
        if (!(bpm > 0)) { try { bpm = o.bpm ? +o.bpm() || 0 : 0; } catch (e) { bpm = 0; } }
        var item = { from: tool, n: k.n, name: studioName(o, tool, k.n), sec: Math.round(k.sec * 1000) / 1000,
          bpm: Math.round(bpm * 100) / 100, at: k.at || Date.now(), take: true, wav: k.blob };
        if (k.place) item.place = k.place;   /* AOG-OVERDUB-V1: it goes on its bar */
        if (k.notes) item.notes = k.notes;   /* AOG-NOTES-V1: the notes it was played with go along */
        await AOGHandoff.add(AOGHandoff.INBOX, item, { key: tool + "|" + (k.at || 0) + "|" + k.n });
        R.studioLine = true;
        if (!k.added) { k.added = true; store(k); }   /* AOG-REC-KEEP-V1: it stays known as added, after a reload too */
        if (line) line.innerHTML = studioHtml();
      } catch (e) {
        R.studioLine = false;
        if (line) line.textContent = w(e && e.name === "QuotaExceededError" ? "noRoom" : "fail");
      }
      if (btn) btn.disabled = false;
    };
    R.paint = function () {
      var btn = el("btn"); if (!btn) return;
      btn.textContent = R.on ? w("recStop") : w("rec"); btn.setAttribute("aria-pressed", R.on ? "true" : "false"); btn.classList.add("aogrec-btn");
      if (!btn._aogrec) { btn._aogrec = true; btn.addEventListener("click", function () { R.toggle(); }); }
      var tm = el("time"); if (tm) { tm.hidden = !R.on; tm.classList.add("aogrec-time"); if (!R.on) tm.textContent = "0:00"; }
      var line = el("line"); if (line) { if (R.studioLine) line.innerHTML = studioHtml(); else line.textContent = R.msg ? fillIn(w(R.msg)) : ""; }
      var list = el("list"); if (!list) return;
      list.classList.add("aogrec-list");
      /* only when the takes or the words change: a take being listened to keeps playing while the page repaints */
      var sig = L() + "|" + R.takes.map(function (k) { return k.n; }).join(",");
      if (list._aogrecSig === sig) return;
      list._aogrecSig = sig;
      var drums = !!toolOf(o);                         /* AOG-TAKE-TO-PADS-V1: every tool but the drum machine itself */
      list.innerHTML = R.takes.map(function (k) {
        return '<div class="aogrec-take"><b>' + w("take") + " " + k.n + '</b> <span class="aogrec-len">' + clock(k.sec) + "</span>" +
          '<audio controls preload="metadata" src="' + k.url + '"></audio>' +
          '<a class="aogrec-b" href="' + k.url + '" download="' + o.file[L()] + "-" + k.n + '.wav">' + w("save") + "</a>" +
          '<button type="button" class="aogrec-b send" data-aogrec-send="' + k.n + '">' + w("send") + "</button>" +
          (drums ? '<button type="button" class="aogrec-b send" data-aogrec-drum="' + k.n + '">' + w("drum") + "</button>" : "") +
          '<button type="button" class="aogrec-b send" data-aogrec-studio="' + k.n + '">' + w(inStudio() ? "layer" : "studio") + "</button>" +
          '<button type="button" class="aogrec-b del" data-aogrec-del="' + k.n + '" aria-label="' + w("delAria").split("{n}").join(k.n) + '">' + w("del") + "</button></div>";
      }).join("");
      Array.prototype.forEach.call(list.querySelectorAll("[data-aogrec-send]"), function (b) { b.onclick = function () { R.send(+b.getAttribute("data-aogrec-send")); }; });
      Array.prototype.forEach.call(list.querySelectorAll("[data-aogrec-drum]"), function (b) { b.onclick = function () { R.toDrums(+b.getAttribute("data-aogrec-drum"), b); }; });
      Array.prototype.forEach.call(list.querySelectorAll("[data-aogrec-studio]"), function (b) { b.onclick = function () { R.toStudio(+b.getAttribute("data-aogrec-studio"), b); }; });
      Array.prototype.forEach.call(list.querySelectorAll("[data-aogrec-del]"), function (b) { b.onclick = function () { R.del(+b.getAttribute("data-aogrec-del")); }; });
    };
    /* AOG-REC-DELETE-V1: a deleted take waits, so the next tap can bring it back; the one after that lets it go */
    R.del = function (n) {
      var i = R.takes.findIndex(function (x) { return x.n === n; }); if (i < 0) return;
      if (R.bin) URL.revokeObjectURL(R.bin.k.url);
      R.bin = { k: R.takes[i], i: i }; R.takes.splice(i, 1); R.studioLine = false; R.msg = "";
      unstore(R.bin.k);   /* AOG-REC-KEEP-V1: out of the device's storage too (Bring it back puts it back) */
      R.paint();
      var line = el("line"); if (line) { line.textContent = w("deleted").split("{n}").join(n) + " ";
        var u = document.createElement("button"); u.type = "button"; u.className = "aogrec-b"; u.textContent = w("undo");
        u.onclick = function () { R.undo(); }; line.appendChild(u); }
    };
    R.undo = function () {
      if (!R.bin) return; var b = R.bin; R.bin = null;
      R.takes.splice(Math.min(b.i, R.takes.length), 0, b.k); R.takes.sort(function (a, c) { return c.n - a.n; });
      while (R.takes.length > 3) { var old = R.takes.pop(); URL.revokeObjectURL(old.url); unstore(old); }
      if (R.takes.indexOf(b.k) >= 0) store(b.k);
      R.msg = ""; R.paint();
    };
    document.addEventListener("visibilitychange", function () { if (document.hidden && R.on) R.toggle(); });
    /* AOG-STUDIO-TRANSPORT-V1 (2026-10-09) — the Recording Studio's transport (/the-studio) drives this room's recorder:
       ● Record presses this room's own Record button, + Add to My Track sends the newest take the usual way */
    window.AOGStudioRec = {
      on: function () { return !!R.on; }, busy: function () { return !!R.closing || !!R.prepping; },
      toggle: function () { var b = el("btn"); if (b && !b.disabled) b.click(); else R.toggle(); },
      last: function () { var k = R.takes[0]; return k ? { n: k.n, sec: k.sec, notes: k.notes ? k.notes.ev.length : 0 } : null; },
      sent: function () { return !!(R.takes[0] && R.takes[0].added) || !!R.studioLine; },
      add: function () { var k = R.takes[0]; return k ? R.toStudio(k.n) : Promise.resolve(); },
      /* AOG-REC-KEEP-V1: true when every take here is safe in the device's storage, so the Studio may close this room */
      kept: function () { return !R.on && !R.closing && !!R.kept; }
    };
    style();
    restore();
    return R;
  }
  /* ── AOG-NOTES-V1: what every room's re-render of its notes shares (AOGRoomRender in the piano, strings and band) ── */
  function ceilV(v) { var a = v < 0 ? -v : v; if (a <= 0.9) return v; var y = 0.9 + 0.1 * Math.tanh((a - 0.9) / 0.1); return v < 0 ? -y : y; }
  var NOTES_KIT = {
    /* the notes asked for, made safe to play: inside the room's reach, a time and a length that are numbers, a strength 0..1 */
    events: function (list, lo, hi) {
      return (Array.isArray(list) ? list : []).filter(function (e) { return e && isFinite(e.t) && e.t >= 0 && isFinite(e.m) && e.m >= lo && e.m <= hi; }).map(function (e) {
        var x = {}; for (var k in e) x[k] = e[k];
        x.v = isFinite(e.v) ? Math.max(0, Math.min(1, +e.v)) : 0.7; x.d = isFinite(e.d) && e.d > 0 ? +e.d : 0.25;
        if (!(isFinite(e.r) && (e.r === -1 || e.r > 0))) delete x.r; if (!(isFinite(e.k) && e.k > 0)) delete x.k;
        return x; });
    },
    /* how long a render of these notes needs: the take's length, or past the last note with room for it to ring */
    sec: function (events, sec, tail) { var e = +sec || 0; (events || []).forEach(function (x) { e = Math.max(e, x.t + x.d + 0.05); }); return e + Math.max(0, +tail || 0); },
    /* one captured note, played on the voice the room just made at its time: its glides, then its stop (or its cut) */
    play: function (vc, e, T) {
      if (!vc) return; T = T || 0;
      if (e.g && typeof vc.glide === "function") e.g.forEach(function (q) { try { vc.glide(q[1], T + e.t + q[0]); } catch (x) {} });
      var off = T + e.t + Math.max(0.005, e.d);
      try { if (e.r === -1 && vc.kill) vc.kill(off); else if (vc.stop) vc.stop(off, e.r > 0 ? e.r : (vc.tau || 0.05), e.rl ? { rel: true } : undefined); } catch (x) {}
      if (e.k > 0 && vc.kill) { try { vc.kill(T + e.t + e.k); } catch (x) {} }
    },
    /* the room knob's sound, as a take carries it (AOGRoom in aog-vu.js): from → the room → to */
    space: function (oc, from, to, i) {
      var G = window.AOGRoom; if (!G || !G.ir || !(i > 0) || !G.presets[i] || !G.presets[i].sec) return;
      var cv = oc.createConvolver(); cv.normalize = false; cv.buffer = G.ir(oc, i);
      var g = oc.createGain(); g.gain.value = G.presets[i].wet; from.connect(cv); cv.connect(g); g.connect(to);
    },
    /* the take's own last step: the rare peak past 90 % rounded gently, as keep() does */
    out: function (buf) {
      var L = Float32Array.from(buf.getChannelData(0)), Rr = Float32Array.from(buf.getChannelData(buf.numberOfChannels > 1 ? 1 : 0));
      for (var i = 0; i < L.length; i++) { L[i] = ceilV(L[i]); Rr[i] = ceilV(Rr[i]); }
      return { L: L, R: Rr, sr: buf.sampleRate };
    },
    context: function (sec, sr) { var OC = window.OfflineAudioContext || window.webkitOfflineAudioContext; return new OC(2, Math.max(1, Math.ceil(sec * sr)), sr); }
  };
  window.AOGRecorder = { attach: attach, clock: clock, toPad: toPad,
    /* AOG-NOTES-V1: a room's voice maker says what it just made (live only); its pedal too */
    note: function (c, vc, e) { if (CAP && vc) { try { CAP.note(c, vc, e); } catch (x) {} } return vc; },
    pedal: function (c, on) { if (CAP && c) { try { CAP.pedal(c, on); } catch (x) {} } },
    notes: NOTES_KIT };
})();
