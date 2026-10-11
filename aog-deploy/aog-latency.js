/* AOG-LATENCY-V1 (2026-10-11) — Jimmy's "3": "A one-tap timing check. The site makes a click and the mic listens for it.
   That measures your iPad's real delay, so overdubs and your voice line up exactly. Today it trusts the browser's guess."

   Check plays six short clicks through the speakers and listens for them with the microphone. The time from each click
   leaving to its coming back is this device's round trip: the sound out (to the speakers) plus the sound in (from the
   microphone). Its middle value is kept on this device ("aog.latency.v1"); nothing is recorded or sent. It is used by:
   - your voice at the Mixing Desk and a real guitar or bass (aog-liveinput.js): what you sing or play along to reaches
     you late by the sound-out half, and reaches the page late by the sound-in half, so a take is moved by the whole trip;
   - a take played on screen over My Track (aog-recorder.js): you hear My Track late by the sound-out half; where the
     browser does not say that half itself, half the trip is used.
   A check that hears fewer than four clicks, or clicks that do not agree, keeps nothing and says what to try.
     AOGLatency.get()        {rt (seconds), at} or null
     AOGLatency.rt()         the trip in seconds, or 0
     AOGLatency.measure()    Promise of {rt} (rejects with .code "nomic" or "unclear")
     AOGLatency.clear() */
(function () {
  "use strict";
  var KEY = "aog.latency.v1", N = 6, GAP = 0.42, WIN = 0.35;
  function get() { try { var m = JSON.parse(localStorage.getItem(KEY) || "null"); return m && m.rt > 0 && m.rt < 1 ? m : null; } catch (e) { return null; } }
  function rt() { var m = get(); return m ? m.rt : 0; }
  function keep(v) { try { localStorage.setItem(KEY, JSON.stringify({ rt: Math.round(v * 10000) / 10000, at: Date.now() })); } catch (e) {} }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) {} }
  var CAP = "class AogLatCap extends AudioWorkletProcessor{ constructor(){ super(); this.b=new Float32Array(2048); this.n=0; this.f=0; }" +
    " process(inp){ const i=inp[0]; if(!i||!i[0]) return true; const a=i[0]; if(this.n===0) this.f=currentFrame;" +
    " for(let k=0;k<a.length;k++){ this.b[this.n++]=a[k]; if(this.n===2048){ this.port.postMessage({f:this.f, d:this.b}); this.b=new Float32Array(2048); this.n=0; this.f=currentFrame+k+1; } } return true; } }" +
    " registerProcessor('aog-lat-cap', AogLatCap);";
  function fail(code) { var e = new Error(code); e.code = code; return e; }
  async function measure() {
    var AC = window.AudioContext || window.webkitAudioContext, c = new AC({ latencyHint: "interactive" }), st = null, parts = [];
    try {
      try { await c.resume(); } catch (e) {}
      var out = c.createGain(); out.connect(c.destination);
      if (AOGLatency._loop) st = AOGLatency._loop(c, out);   /* the tests: a known delay in place of a speaker and a microphone */
      else {
        try { st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); }
        catch (e) { throw fail("nomic"); }
      }
      var src = c.createMediaStreamSource(st), sink = c.createGain(); sink.gain.value = 0; sink.connect(c.destination);
      var sr = c.sampleRate, node;
      try {
        var url = URL.createObjectURL(new Blob([CAP], { type: "application/javascript" }));
        await c.audioWorklet.addModule(url);
        node = new AudioWorkletNode(c, "aog-lat-cap", { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1] });
        node.port.onmessage = function (e) { parts.push({ f: e.data.f, d: e.data.d }); };
      } catch (e) {
        node = c.createScriptProcessor(2048, 1, 1);
        node.onaudioprocess = function (ev) { parts.push({ f: Math.round((ev.playbackTime || c.currentTime) * sr), d: new Float32Array(ev.inputBuffer.getChannelData(0)) }); };
      }
      src.connect(node); node.connect(sink);
      /* the click: 2 ms of a 3 kHz tone, shaped so it starts and stops cleanly */
      var len = Math.round(0.002 * sr), cb = c.createBuffer(1, len, sr), cd = cb.getChannelData(0);
      for (var i = 0; i < len; i++) cd[i] = 0.9 * Math.sin(2 * Math.PI * 3000 * i / sr) * Math.sin(Math.PI * i / len);
      var T0 = c.currentTime + 0.6, at = [];
      for (var k = 0; k < N; k++) { var s = c.createBufferSource(); s.buffer = cb; s.connect(out); s.start(T0 + k * GAP); at.push(T0 + k * GAP); }
      await new Promise(function (ok) { var t = setInterval(function () { if (c.currentTime > T0 + N * GAP + 0.25) { clearInterval(t); ok(); } }, 50); });
      /* what came in, as one line of sound with its start frame */
      parts.sort(function (a, b) { return a.f - b.f; });
      if (!parts.length) throw fail("unclear");
      var f0 = parts[0].f, total = parts[parts.length - 1].f + parts[parts.length - 1].d.length - f0, x = new Float32Array(Math.max(0, total));
      parts.forEach(function (p) { x.set(p.d.subarray(0, Math.max(0, Math.min(p.d.length, x.length - (p.f - f0)))), Math.max(0, p.f - f0)); });
      /* the quiet before the first click sets how loud a click must be */
      var q0 = Math.max(0, Math.round((T0 - 0.05) * sr) - f0), floor = 0;
      for (var j = Math.max(0, q0 - Math.round(0.4 * sr)); j < q0; j++) { var a0 = Math.abs(x[j]); if (a0 > floor) floor = a0; }
      var trips = [];
      at.forEach(function (t) {
        var a = Math.round(t * sr) - f0, b = Math.min(x.length, a + Math.round(WIN * sr)), pk = 0, ii;
        if (a < 0 || a >= x.length) return;
        for (ii = a; ii < b; ii++) { var v = Math.abs(x[ii]); if (v > pk) pk = v; }
        var th = Math.max(floor * 4, pk * 0.4, 0.002); if (pk < th) return;
        for (ii = a; ii < b; ii++) if (Math.abs(x[ii]) >= th) { trips.push((ii - a) / sr); break; }
      });
      if (trips.length < 4) throw fail("unclear");
      trips.sort(function (a, b) { return a - b; });
      var mid = trips[trips.length >> 1], near = trips.filter(function (v) { return Math.abs(v - mid) < 0.004; });
      if (near.length < 4 || mid <= 0) throw fail("unclear");
      var v1 = near.reduce(function (s1, v) { return s1 + v; }, 0) / near.length;
      keep(v1);
      return { rt: v1, heard: trips.length };
    } finally {
      try { if (st && st.getTracks) st.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
      try { c.close(); } catch (e) {}
    }
  }
  window.AOGLatency = { get: get, rt: rt, measure: measure, clear: clear, _loop: null };
})();
