/* AOG-REAL-ROOMS-V1 (2026-10-11) — Jimmy's 5: "Real rooms. Today every reverb is a made-up decay. Free (CC0) recordings of
   real halls, plates and churches would make the reverb sound like real spaces."

   Six recordings of real spaces answering one sharp sound (impulse responses), all Creative Commons 0 (public domain), from
   Freesound; where each comes from and what was done to it: /audio/rooms/CREDITS.txt (made by
   music-handoff/tools/rooms/rooms.py). 16-bit WAV, 44.1 kHz; nothing is fetched until a room asks for it.

   AOGRooms.list                → {id: {file, rt (RT60, s), en, es}}
   AOGRooms.load(ctx, id)       → Promise<AudioBuffer|null>, decoded at that context's sample rate (kept per rate, so the
                                  speakers and a mix made at the same rate share one buffer); null when it fails
   AOGRooms.get(ctx, id)        → that buffer at once, or null while it is still on its way
   AOGRooms.fit(ctx, id, opts)  → a copy made to take the place of a made-up reverb, kept (by opts.key) and marked
                                  buf.__aogReal = id; null while the recording is on its way. opts:
                                    match  the made-up reverb's buffer: the copy gets its loudness for music
                                           (pinkEnergy), so a song is as wet as before
                                    scale  the level that reverb is played at (normScale, when its convolver normalises)
                                    pre    a pause (s) before the room answers, as the made-up one has, so its first
                                           echoes do not land on the music itself and make it louder
                                    rt     an extra decay so it dies away in that time (shorter, or up to half as long again)
   AOGRooms.energy(buf), .pinkEnergy(buf), .normScale(buf): the measures below.
   The pages that use it (aog-vu.js, aog-amp.js, the Mixing Desk) load this file themselves when a real room is wanted
   (window.__aogRoomsLib) and keep their own made-up reverb as the instant fallback. */
(function (W) {
  "use strict";
  if (W.AOGRooms) return;
  var BASE = "/audio/rooms/";
  var LIST = {
    small:  { file: "small.wav",  rt: 0.43, en: "Small room", es: "Sala pequeña" },
    studio: { file: "studio.wav", rt: 0.59, en: "Studio",     es: "Estudio" },
    hall:   { file: "hall.wav",   rt: 1.36, en: "Hall",       es: "Sala grande" },
    church: { file: "church.wav", rt: 3.74, en: "Church",     es: "Iglesia" },
    plate:  { file: "plate.wav",  rt: 1.94, en: "Plate",      es: "Placa" },
    spring: { file: "spring.wav", rt: 1.30, en: "Spring",     es: "Muelle" }
  };
  var BYTES = {}, BYRATE = {}, FITS = {};
  function bytes(id) {
    if (!BYTES[id]) BYTES[id] = fetch(BASE + LIST[id].file).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); });
    return BYTES[id];
  }
  function decode(ctx, ab) {
    return new Promise(function (ok, no) { var p = ctx.decodeAudioData(ab, ok, no); if (p && p.then) p.then(ok, no); });
  }
  function load(ctx, id) {
    if (!ctx || !LIST[id]) return Promise.resolve(null);
    var per = BYRATE[ctx.sampleRate] || (BYRATE[ctx.sampleRate] = {});
    if (!per[id]) {
      per[id] = { buf: null, p: null };
      per[id].p = bytes(id).then(function (ab) { return decode(ctx, ab.slice(0)); })
        .then(function (b) { per[id].buf = b; return b; }, function () { delete per[id]; delete BYTES[id]; return null; });
    }
    return per[id].p;
  }
  function get(ctx, id) { var per = ctx && BYRATE[ctx.sampleRate]; return per && per[id] ? per[id].buf : null; }
  function chans(b) { var a = []; for (var c = 0; c < b.numberOfChannels; c++) a.push(b.getChannelData(c)); return a; }
  function energy(b) { var s = 0; chans(b).forEach(function (d) { for (var i = 0; i < d.length; i++) s += d[i] * d[i]; }); return s / b.numberOfChannels; }
  /* a cascade of biquads [b0, b1, b2, a1, a2] run over a channel */
  function run(d, F, extra, to) {
    var n = d.length + (extra || 0), o = to || new Float32Array(n), z = F.map(function () { return [0, 0, 0, 0]; });
    for (var i = 0; i < n; i++) { var y = i < d.length ? d[i] : 0;
      for (var f = 0; f < F.length; f++) { var q = F[f], m = z[f], v = q[0] * y + q[1] * m[0] + q[2] * m[1] - q[3] * m[2] - q[4] * m[3]; m[1] = m[0]; m[0] = y; m[3] = m[2]; m[2] = v; y = v; }
      if (i < o.length) o[i] = y; }
    return o;
  }
  /* how loud a reverb makes music: pink noise (Paul Kellet's filter) through it, heard as a loudness meter hears it (the
     K-weighting of ITU-R BS.1770, at the buffer's own rate): the energy that comes out, per channel */
  function kw(sr) {
    var K = Math.tan(Math.PI * 1681.974450955533 / sr), Q = 0.7071752369554196, Vh = Math.pow(10, 3.999843853973347 / 20), Vb = Math.pow(Vh, 0.4996667741545416), a0 = 1 + K / Q + K * K;
    var K2 = Math.tan(Math.PI * 38.13547087602444 / sr), Q2 = 0.5003270373238773, a2 = 1 + K2 / Q2 + K2 * K2;
    return [[(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0],
      [1, -2, 1, 2 * (K2 * K2 - 1) / a2, (1 - K2 / Q2 + K2 * K2) / a2]];
  }
  function pinkEnergy(b) {
    var s = 0, F = kw(b.sampleRate), tail = Math.round(b.sampleRate * 0.1);
    chans(b).forEach(function (d) { var b0 = 0, b1 = 0, b2 = 0, p = new Float32Array(d.length + tail);
      for (var i = 0; i < p.length; i++) { var w = i < d.length ? d[i] : 0; b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; p[i] = b0 + b1 + b2 + w * 0.1848; }
      var y = run(p, F); for (var k = 0; k < y.length; k++) s += y[k] * y[k]; });
    return s / b.numberOfChannels;
  }
  /* the scale a ConvolverNode with normalize = true gives a buffer (the Web Audio API's own calculateNormalizationScale),
     so a real room set with normalize = false can be as loud as a made-up one that was normalised */
  function normScale(b) {
    var p = 0; chans(b).forEach(function (d) { for (var i = 0; i < d.length; i++) p += d[i] * d[i]; });
    p = Math.sqrt(p / (b.numberOfChannels * b.length)); if (!isFinite(p) || p < 0.000125) p = 0.000125;
    var s = 0.00125 / p; if (b.sampleRate) s *= 44100 / b.sampleRate; if (b.numberOfChannels === 4) s *= 0.5; return s;
  }
  function fit(ctx, id, o) {
    o = o || {}; var src = get(ctx, id); if (!src) return null;
    var key = ctx.sampleRate + ":" + id + ":" + (o.key != null ? o.key : (o.rt || 0));
    if (FITS[key]) return FITS[key];
    var sr = src.sampleRate, rt0 = LIST[id].rt, rt = o.rt ? Math.min(o.rt, rt0 * 1.5) : 0, n = src.length;
    if (rt && Math.abs(rt - rt0) < 0.01) rt = 0;
    if (rt && rt < rt0) n = Math.min(n, Math.ceil(sr * rt * 1.25));   /* 75 dB down by then */
    var p0 = Math.round((o.pre || 0) * sr), out = ctx.createBuffer(src.numberOfChannels, n + p0, sr), k = rt ? 6.9 * (1 / rt - 1 / rt0) / sr : 0, fo = Math.min(n >> 2, Math.round(sr * 0.05));
    for (var c = 0; c < src.numberOfChannels; c++) {
      var a = src.getChannelData(c), b = out.getChannelData(c);
      for (var i = 0; i < n; i++) b[p0 + i] = a[i] * (k ? Math.exp(-k * i) : 1);
      if (n < src.length) for (var j = 0; j < fo; j++) b[p0 + n - 1 - j] *= j / fo;
    }
    var g = 1;
    if (o.match) { g = (o.scale || 1) * Math.sqrt(pinkEnergy(o.match) / (pinkEnergy(out) || 1)); }
    chans(out).forEach(function (d) { for (var q = 0; q < d.length; q++) d[q] *= g; });
    out.__aogReal = id; FITS[key] = out; return out;
  }
  W.AOGRooms = { list: LIST, load: load, get: get, fit: fit, energy: energy, pinkEnergy: pinkEnergy, normScale: normScale, base: BASE };
})(typeof window !== "undefined" ? window : globalThis);
