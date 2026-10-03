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
   - the last three takes stay, each to hear, save as .wav, or send to the turntables; nothing leaves the device;
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
   then calls REC.toggle() from its button and REC.paint() whenever it paints its words. */
(function () {
  "use strict";
  var W = {
    rec: { en: "● Record", es: "● Grabar" },
    recStop: { en: "■ Stop recording", es: "■ Parar grabación" },
    recOn: { en: "Recording {what}, never a microphone. Play anything, then press Stop recording.", es: "Grabando {what}, nunca un micrófono. Toca lo que quieras y luego pulsa Parar grabación." },
    recKeep: { en: "Takes stay on this device until you leave the page. To keep one, save it or send it to the turntables.", es: "Las tomas se quedan en este dispositivo hasta que salgas de la página. Para guardar una, guárdala o envíala a los platos." },
    recFull: { en: "Five minutes is the limit, so recording stopped.", es: "Cinco minutos es el límite, así que la grabación se detuvo." },
    recNone: { en: "Nothing was played, so there is no take.", es: "No se tocó nada, así que no hay toma." },
    take: { en: "Take", es: "Toma" },
    save: { en: "Save as .wav", es: "Guardar como .wav" },
    mine: { en: "my playing", es: "lo que toqué" },
    send: { en: "Send to the turntables", es: "Enviar a los platos" },
    sent: { en: "Sent. Open the turntables to play it.", es: "Enviado. Abre los platos para tocarlo." },
    decks: { en: "The turntables", es: "Los tocadiscos" },
    fail: { en: "That did not work. Try again.", es: "No funcionó. Inténtalo otra vez." }
  };
  /* the listening ear: it collects what passes through it in pieces of 4096 frames, only while it is armed */
  var SRC = [
    "class AogRec extends AudioWorkletProcessor{",
    "  constructor(){ super(); this.on=false; this.n=0; this.L=new Float32Array(4096); this.R=new Float32Array(4096);",
    "    this.port.onmessage=(e)=>{ if(e.data && e.data.t==='arm'){ if(!e.data.on) this.flush(); this.on=!!e.data.on; } }; }",
    "  flush(){ if(this.n){ this.port.postMessage({t:'chunk', L:this.L.slice(0,this.n), R:this.R.slice(0,this.n)}); this.n=0; } }",
    "  process(inputs){",
    "    const i=inputs[0]; if(!this.on || !i || !i.length) return true;",
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
    /* a page whose recorder sits outside its dark instrument gets a dark panel of its own */
    ".aogrec-box{background:linear-gradient(180deg,#2a2d31 0%,#17191c 16%,#101114 100%);border:1px solid #07080a;border-radius:18px;padding:14px;margin:1rem 0;color:#d7cbb8}",
    ".aogrec-box .aogrec-row{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem .8rem}",
    ".aogrec-box .aogrec-line{color:#d7cbb8;font-size:.95rem;line-height:1.45;margin:.55rem 0 0}",
    ".aogrec-box .aogrec-line a,.aogrec-take a:not(.aogrec-b){color:#cfe2ff}"
  ].join("\n");
  var url = null, styled = false;
  function style() { if (styled) return; styled = true; var s = document.createElement("style"); s.id = "aog-rec-css"; s.textContent = CSS; document.head.appendChild(s); }
  function clock(sec) { var s = Math.max(0, Math.floor(sec)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

  function attach(o) {
    var R = { on: false, closing: false, chunks: [], frames: 0, t0: 0, timer: 0, takes: [], n: 0, max: 300, msg: "", node: null, sink: null, sr: 44100 };
    function L() { return o.lang() === "es" ? "es" : "en"; }
    function w(k) { var src = (k === "rec" && o.label) ? o.label : W[k]; return src[L()].split("{what}").join(o.what[L()]); }
    function el(k) { return document.getElementById(o.ids[k]); }
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
        var n = new AudioWorkletNode(c, "aog-rec", { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2] });
        n.port.onmessage = function (e) { if (e.data && e.data.t === "chunk") keep(e.data.L, e.data.R); };
        R.node = n;
      } catch (e) {                                   /* an older browser: the same, the old way */
        var sp = c.createScriptProcessor(4096, 2, 2);
        sp.onaudioprocess = function (ev) { if (!R.on && !R.closing) return; var ib = ev.inputBuffer;
          keep(Float32Array.from(ib.getChannelData(0)), Float32Array.from(ib.getChannelData(ib.numberOfChannels > 1 ? 1 : 0))); };
        R.node = sp;
      }
      /* it ends in silence: a node only runs when it reaches the speakers, and the take is not played twice */
      R.sink = c.createGain(); R.sink.gain.value = 0;
      o.tap().connect(R.node); R.node.connect(R.sink); R.sink.connect(c.destination);
    }
    function arm(on) { R.on = on; if (R.node && R.node.port) R.node.port.postMessage({ t: "arm", on: on }); }
    function finish() {
      var sr = R.sr, quiet = 66;                        /* about -54 dB: anything softer before the first sound is left out */
      var ci = 0, off = 0, found = false;
      for (ci = 0; ci < R.chunks.length; ci++) { var x = R.chunks[ci]; for (var i = 0; i < x.length; i++) { if (x[i] > quiet || x[i] < -quiet) { off = i; found = true; break; } } if (found) break; }
      if (!found) { R.chunks = []; R.frames = 0; R.msg = "recNone"; R.paint(); return; }
      var back = Math.floor(0.05 * sr) * 2;             /* keep 50 ms before the first sound */
      while (back > 0 && (off > 0 || ci > 0)) {
        if (off >= back) { off -= back; back = 0; }
        else { back -= off; if (ci > 0) { ci--; off = R.chunks[ci].length; } else { off = 0; back = 0; } }
      }
      off -= off % 2;
      var parts = [R.chunks[ci].subarray(off)]; for (var j = ci + 1; j < R.chunks.length; j++) parts.push(R.chunks[j]);
      var bytes = 0; parts.forEach(function (p) { bytes += p.length * 2; });
      var h = new ArrayBuffer(44), v = new DataView(h), str = function (q, s) { for (var k = 0; k < s.length; k++) v.setUint8(q + k, s.charCodeAt(k)); };
      str(0, "RIFF"); v.setUint32(4, 36 + bytes, true); str(8, "WAVE"); str(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
      v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); str(36, "data"); v.setUint32(40, bytes, true);
      var blob = new Blob([h].concat(parts), { type: "audio/wav" });
      R.chunks = []; R.frames = 0;
      R.takes.unshift({ n: ++R.n, sec: bytes / 4 / sr, blob: blob, url: URL.createObjectURL(blob) });
      while (R.takes.length > 3) { var old = R.takes.pop(); URL.revokeObjectURL(old.url); }
      if (!R.msg) R.msg = "recKeep";
      R.paint();
    }
    R.toggle = async function () {
      var btn = el("btn");
      if (!R.on) {
        if (R.closing) return;
        await build();
        R.chunks = []; R.frames = 0; R.t0 = performance.now(); R.msg = "recOn";
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
      if (R.msg === "recOn") R.msg = "";
      if (btn) btn.disabled = true;
      setTimeout(function () { arm(false); setTimeout(function () { R.closing = false; var b = el("btn"); if (b) b.disabled = false; finish(); }, 160); }, 500);
    };
    R.send = async function (n) {
      var k = R.takes.find(function (x) { return x.n === n; }); if (!k) return;
      var name = o.prefix[L()] + " · " + w("mine") + " · " + w("take") + " " + k.n + " · " + clock(k.sec), line = el("line");
      try {
        await AOGHandoff.put(o.shelf, { name: name, bpm: Math.round(o.bpm ? o.bpm() : 120), bars: 0, at: Date.now(), wav: k.blob, take: true });
        if (line) line.innerHTML = w("sent") + ' <a href="music-decks.html">' + w("decks") + "</a>";
      } catch (e) { if (line) line.textContent = w("fail"); }
    };
    R.paint = function () {
      var btn = el("btn"); if (!btn) return;
      btn.textContent = R.on ? w("recStop") : w("rec"); btn.setAttribute("aria-pressed", R.on ? "true" : "false"); btn.classList.add("aogrec-btn");
      if (!btn._aogrec) { btn._aogrec = true; btn.addEventListener("click", function () { R.toggle(); }); }
      var tm = el("time"); if (tm) { tm.hidden = !R.on; tm.classList.add("aogrec-time"); if (!R.on) tm.textContent = "0:00"; }
      var line = el("line"); if (line) line.textContent = R.msg ? w(R.msg) : "";
      var list = el("list"); if (!list) return;
      list.classList.add("aogrec-list");
      /* only when the takes or the words change: a take being listened to keeps playing while the page repaints */
      var sig = L() + "|" + R.takes.map(function (k) { return k.n; }).join(",");
      if (list._aogrecSig === sig) return;
      list._aogrecSig = sig;
      list.innerHTML = R.takes.map(function (k) {
        return '<div class="aogrec-take"><b>' + w("take") + " " + k.n + '</b> <span class="aogrec-len">' + clock(k.sec) + "</span>" +
          '<audio controls preload="metadata" src="' + k.url + '"></audio>' +
          '<a class="aogrec-b" href="' + k.url + '" download="' + o.file[L()] + "-" + k.n + '.wav">' + w("save") + "</a>" +
          '<button type="button" class="aogrec-b send" data-aogrec-send="' + k.n + '">' + w("send") + "</button></div>";
      }).join("");
      Array.prototype.forEach.call(list.querySelectorAll("[data-aogrec-send]"), function (b) { b.onclick = function () { R.send(+b.getAttribute("data-aogrec-send")); }; });
    };
    document.addEventListener("visibilitychange", function () { if (document.hidden && R.on) R.toggle(); });
    style();
    return R;
  }
  window.AOGRecorder = { attach: attach, clock: clock };
})();
