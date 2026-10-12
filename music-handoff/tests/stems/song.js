/* synthetic songs with known parts (drums, bass, lead voice, pad), stereo, 44.1 kHz; used in the page */
window.makeSong = function (opt) {
  opt = opt || {};
  var sr = 44100, bpm = opt.bpm || 100, beat = 60 / bpm, bars = opt.bars || 8, sec = bars * 4 * beat + 1, n = Math.round(sec * sr);
  var seed = opt.seed || 7; function rnd() { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return ((seed >>> 0) / 4294967296) * 2 - 1; }
  function arr() { return [new Float32Array(n), new Float32Array(n)]; }
  var D = arr(), Bs = arr(), V = arr(), O = arr();
  function add(T, at, x, panL, panR) { var a = Math.round(at * sr); for (var i = 0; i < x.length && a + i < n; i++) { if (a + i < 0) continue; T[0][a + i] += x[i] * panL; T[1][a + i] += x[i] * panR; } }
  function kick() { var m = Math.round(0.4 * sr), x = new Float32Array(m), ph = 0; for (var i = 0; i < m; i++) { var t = i / sr, f = 45 + 75 * Math.exp(-t / 0.04); ph += 2 * Math.PI * f / sr; x[i] = 0.9 * Math.sin(ph) * Math.exp(-t / 0.15) + 0.2 * rnd() * Math.exp(-t / 0.004); } return x; }
  function snare() { var m = Math.round(0.3 * sr), x = new Float32Array(m), lp = 0; for (var i = 0; i < m; i++) { var t = i / sr, nz = rnd(); lp += 0.5 * (nz - lp); x[i] = 0.45 * (nz - lp) * Math.exp(-t / 0.07) + 0.35 * Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t / 0.05); } return x; }
  function hat() { var m = Math.round(0.08 * sr), x = new Float32Array(m), p = 0; for (var i = 0; i < m; i++) { var t = i / sr, nz = rnd(); x[i] = 0.18 * (nz - p) * Math.exp(-t / 0.02); p = nz; } return x; }
  var K = kick(), Sn = snare(), Ht = hat();
  var prog = opt.prog || [[0, 0], [9, 1], [5, 0], [7, 0]];   /* C Am F G */
  var key = opt.key || 0, bass = [], melody = [];
  var mel = opt.mel || [64, 67, 69, 67, 64, 62, 60, 62, 64, 67, 72, 71, 69, 67, 65, 64];
  function tone(f, dur, harm, env, vib) { var m = Math.round((dur + 0.3) * sr), x = new Float32Array(m), ph = 0;
    for (var i = 0; i < m; i++) { var t = i / sr, ff = f * (vib ? Math.pow(2, vib * Math.sin(2 * Math.PI * 5.5 * t) / 1200) : 1); ph += 2 * Math.PI * ff / sr;
      var s = 0; for (var h = 0; h < harm.length; h++) s += harm[h] * Math.sin((h + 1) * ph); x[i] = s * env(t, dur); } return x; }
  var hz = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
  for (var bar = 0; bar < bars; bar++) {
    var t0 = 0.5 + bar * 4 * beat, ch = prog[bar % prog.length], root = key + ch[0];
    for (var b = 0; b < 4; b++) { var tb = t0 + b * beat;
      if (b === 0 || b === 2) add(D, tb, K, 0.7, 0.7);
      if (b === 1 || b === 3) add(D, tb, Sn, 0.65, 0.6);
      add(D, tb, Ht, 0.35, 0.6); add(D, tb + beat / 2, Ht, 0.35, 0.6); }
    /* bass: root on 1, fifth on 3 */
    [[0, 0, 1.8], [2, 7, 1.8]].forEach(function (q) { var m = 36 + ((root + q[1]) % 12), d = q[2] * beat;
      var x = tone(hz(m), d, [1, 0.5, 0.3, 0.2, 0.12, 0.08], function (t, d) { return 0.35 * Math.min(1, t / 0.005) * Math.exp(-t / 0.6) * (t < d ? 1 : Math.exp(-(t - d) / 0.03)); });
      add(Bs, t0 + q[0] * beat, x, 0.7, 0.7); bass.push({ t: t0 + q[0] * beat, d: d, m: m, conf: 1 }); });
    /* pad: the chord, wide */
    var iv = ch[1] ? [0, 3, 7, 12] : [0, 4, 7, 12];
    iv.forEach(function (k, j) { var m = 55 + ((root + k) % 12) + (k === 12 ? 12 : 0), d = 4 * beat;
      var env = function (t, d) { return 0.07 * Math.min(1, t / 0.3) * (t < d ? 1 : Math.exp(-(t - d) / 0.1)); };
      var xl = tone(hz(m) * 1.002, d, [1, 0.4, 0.2, 0.1], env), xr = tone(hz(m) * 0.998, d, [1, 0.4, 0.2, 0.1], env);
      add(O, t0, xl, j % 2 ? 0.9 : 0.3, 0); add(O, t0, xr, 0, j % 2 ? 0.3 : 0.9); });
    /* the lead voice: two notes a bar, with vibrato and a voice-like set of harmonics, centred */
    if (!opt.noVoice) for (var q2 = 0; q2 < 2; q2++) { var mm = mel[(bar * 2 + q2) % mel.length] + (opt.voiceShift || 0), dd = 1.6 * beat, tt = t0 + q2 * 2 * beat + 0.05;
      var hv = []; for (var h = 1; h <= 24; h++) { var fh = h * hz(mm); hv.push((1 / h) * (1 + 2.5 * Math.exp(-Math.pow((fh - 700) / 300, 2)) + 1.5 * Math.exp(-Math.pow((fh - 1200) / 400, 2)) + 0.8 * Math.exp(-Math.pow((fh - 2600) / 500, 2)))); }
      var x2 = tone(hz(mm), dd, hv, function (t, d) { return 0.06 * Math.min(1, t / 0.04) * (t < d ? 1 : Math.exp(-(t - d) / 0.06)); }, 30);
      add(V, tt, x2, 0.7, 0.7); melody.push({ t: tt, d: dd, m: mm, conf: 1 }); }
  }
  var mix = [new Float32Array(n), new Float32Array(n)], pk = 0;
  for (var c = 0; c < 2; c++) for (var i = 0; i < n; i++) { var v = D[c][i] + Bs[c][i] + V[c][i] + O[c][i]; mix[c][i] = v; if (Math.abs(v) > pk) pk = Math.abs(v); }
  var g = 0.9 / pk; [mix, D, Bs, V, O].forEach(function (T) { for (var c = 0; c < 2; c++) for (var i = 0; i < n; i++) T[c][i] *= g; });
  if (opt.mono) [mix, D, Bs, V, O].forEach(function (T) { for (var i = 0; i < n; i++) { var m = 0.5 * (T[0][i] + T[1][i]); T[0][i] = m; T[1][i] = m; } });
  return { sr: sr, n: n, mix: mix, parts: { drums: D, bass: Bs, voice: V, other: O }, lesson: { bass: bass, melody: melody, tuning: 0, bpm: bpm } };
};
window.sdr = function (ref, est) { var s = 0, e = 0; for (var c = 0; c < ref.length; c++) { var r = ref[c], x = est[c]; for (var i = 0; i < r.length; i++) { s += r[i] * r[i]; var d = r[i] - x[i]; e += d * d; } } return 10 * Math.log10((s + 1e-12) / (e + 1e-12)); };
window.bufOf = function (ch, sr) { var b = new AudioBuffer({ numberOfChannels: ch.length, length: ch[0].length, sampleRate: sr }); ch.forEach(function (a, i) { b.getChannelData(i).set(a); }); return b; };
window.measure = async function (song, opts) {
  opts = opts || {};
  var buf = bufOf(song.mix, song.sr), t0 = performance.now();
  var lesson = opts.lesson === "exact" ? song.lesson : opts.lesson === "none" ? { bass: [], melody: [] } : null;
  if (opts.tune) AOGStems.test.tune(opts.tune);
  var R = await AOGStems.split(buf, { lesson: lesson });
  var ms = performance.now() - t0, out = { ms: Math.round(ms) };
  ["drums", "bass", "voice", "other"].forEach(function (k) { var est = [R[k].getChannelData(0), R[k].getChannelData(1)];
    out[k] = +sdr(song.parts[k], est).toFixed(2); out[k + "0"] = +sdr(song.parts[k], song.mix).toFixed(2); });
  var e = 0, s = 0; for (var c = 0; c < 2; c++) { var a = song.mix[c]; for (var i = 0; i < a.length; i++) { var y = R.drums.getChannelData(c)[i] + R.bass.getChannelData(c)[i] + R.voice.getChannelData(c)[i] + R.other.getChannelData(c)[i]; e = Math.max(e, Math.abs(y - a[i])); } }
  out.sumErr = e; out.last = AOGStems.test.last();
  AOGStems.test.tune(null);
  return out;
};
/* the song as a 16-bit stereo .wav File */
window.songFile = function (song, name) {
  var n = song.n, sr = song.sr, ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab), i;
  var w = function (o, s) { for (var j = 0; j < s.length; j++) v.setUint8(o + j, s.charCodeAt(j)); };
  w(0, "RIFF"); v.setUint32(4, 36 + n * 4, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 4, true);
  for (i = 0; i < n; i++) { v.setInt16(44 + i * 4, Math.round(song.mix[0][i] * 32767), true); v.setInt16(46 + i * 4, Math.round(song.mix[1][i] * 32767), true); }
  return new File([ab], name || "song.wav", { type: "audio/wav" });
};
/* a layered rap production from known parts (Jimmy: "What if it is a rap song with multiple layers in production…"):
   a trap beat at 140 (kick, clap on 3, hats in eighths with rolls, an open hat), an 808 that glides (its body is Bass,
   its click is Drums), a rapped voice (a pulse and breath through moving formants, an unsteady pitch, consonant bursts,
   about four syllables a second, centred) and a centred double (both Voice), two ad-libs panned wide, a pad and a
   pitched sample loop (all three The rest). opt.boom: a boom-bap beat at 90 instead. opt.mono: one channel. */
window.makeRap = function (opt) {
  opt = opt || {};
  var sr = 44100, bpm = opt.boom ? 90 : 140, beat = 60 / bpm, bars = opt.bars || 8, sec = bars * 4 * beat + 1, n = Math.round(sec * sr);
  var seed = opt.seed || 21; function rnd() { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return ((seed >>> 0) / 4294967296) * 2 - 1; }
  function arr() { return [new Float32Array(n), new Float32Array(n)]; }
  var D = arr(), Bs = arr(), V = arr(), O = arr(), bass = [], beats = [];
  function add(T, at, x, gl, gr) { var a = Math.round(at * sr); for (var i = 0; i < x.length && a + i < n; i++) { if (a + i < 0) continue; T[0][a + i] += x[i] * gl; T[1][a + i] += x[i] * gr; } }
  function noiseHit(len, dec, hpK, gain) { var m = Math.round(len * sr), x = new Float32Array(m), p = 0, q = 0; for (var i = 0; i < m; i++) { var t = i / sr, z = rnd(); q = z - p * hpK; p = z; x[i] = gain * q * Math.exp(-t / dec); } return x; }
  var kick = (function () { var m = Math.round(0.35 * sr), x = new Float32Array(m), ph = 0; for (var i = 0; i < m; i++) { var t = i / sr, f = 50 + 90 * Math.exp(-t / 0.03); ph += 2 * Math.PI * f / sr; x[i] = 0.85 * Math.sin(ph) * Math.exp(-t / 0.09) + 0.25 * rnd() * Math.exp(-t / 0.003); } return x; })();
  var clap = (function () { var x = noiseHit(0.25, 0.06, 0.6, 0.5); for (var k = 1; k < 3; k++) { var o = Math.round(k * 0.011 * sr); for (var i = 0; i < 400 && o + i < x.length; i++) x[o + i] += 0.3 * rnd(); } return x; })();
  var snare = (function () { var m = Math.round(0.25 * sr), x = noiseHit(0.25, 0.08, 0.5, 0.45); for (var i = 0; i < m; i++) x[i] += 0.3 * Math.sin(2 * Math.PI * 200 * i / sr) * Math.exp(-i / sr / 0.04); return x; })();
  var hat = noiseHit(0.06, 0.012, 1, 0.16), ohat = noiseHit(0.3, 0.09, 1, 0.12), click = noiseHit(0.006, 0.0015, 0.2, 0.5);
  var hz = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
  var key = opt.key || 1, prog = [[0, 1], [8, 0], [3, 0], [10, 0]];
  /* the beat */
  for (var bar = 0; bar < bars; bar++) {
    var t0 = 0.5 + bar * 4 * beat;
    for (var b = 0; b < 4; b++) beats.push(t0 + b * beat);
    var kp = opt.boom ? [0, 1.75, 2.5] : [0, 0.75, 2.25, 3.5], sp = opt.boom ? [1, 3] : [2];
    kp.forEach(function (q) { add(D, t0 + q * beat, kick, 0.7, 0.7); });
    sp.forEach(function (q) { add(D, t0 + q * beat, opt.boom ? snare : clap, 0.62, 0.66); });
    for (var e = 0; e < 8; e++) { var th = t0 + e * beat / 2;
      if (!opt.boom && (e === 3 || e === 7) && bar % 2 === 1) { for (var r = 0; r < 4; r++) add(D, th + r * beat / 8, hat, 0.45 - r * 0.05, 0.55); }   /* a roll */
      else add(D, th, hat, 0.4, 0.6); }
    if (!opt.boom) add(D, t0 + 3.5 * beat, ohat, 0.5, 0.45);
    /* the 808: on the kicks, ringing to the next, gliding into the second note of each bar */
    var ch = prog[bar % 4], notes808 = opt.boom ? [[0, 0, 1.6], [2.5, 7, 1.4]] : [[0, 0, 2.2], [2.25, 3, 1.2], [3.5, 7, 0.5]];
    notes808.forEach(function (q, qi) {
      var m = 29 + ((key + ch[0] + q[1]) % 12), d = q[2] * beat, glide = !opt.boom && qi === 1, from = glide ? 29 + ((key + ch[0]) % 12) : m;
      var len = Math.round((d + 0.25) * sr), x = new Float32Array(len), ph = 0;
      for (var i = 0; i < len; i++) { var t = i / sr, mm = glide ? m + (from - m) * Math.exp(-t / 0.06) : m; ph += 2 * Math.PI * hz(mm) / sr;
        var env = Math.min(1, t / 0.004) * Math.exp(-t / 1.1) * (t < d ? 1 : Math.exp(-(t - d) / 0.04)); x[i] = 0.55 * Math.tanh(1.6 * Math.sin(ph)) * env; }
      add(Bs, t0 + q[0] * beat, x, 0.7, 0.7); add(D, t0 + q[0] * beat, click, 0.6, 0.6);
      bass.push({ t: t0 + q[0] * beat, d: d, m: m, conf: 1 }); });
    /* the pad and the sample loop (a pitched pluck arpeggio) */
    var iv = ch[1] ? [0, 3, 7] : [0, 4, 7];
    iv.forEach(function (k, j) { var m = 60 + ((key + ch[0] + k) % 12), d = 4 * beat, len = Math.round((d + 0.2) * sr), xl = new Float32Array(len), xr = new Float32Array(len);
      for (var i = 0; i < len; i++) { var t = i / sr, env = 0.035 * Math.min(1, t / 0.4) * (t < d ? 1 : Math.exp(-(t - d) / 0.1)), f = hz(m);
        xl[i] = env * (Math.sin(2 * Math.PI * f * 1.003 * t) + 0.3 * Math.sin(4 * Math.PI * f * t)); xr[i] = env * (Math.sin(2 * Math.PI * f * 0.997 * t) + 0.3 * Math.sin(4 * Math.PI * f * 1.001 * t)); }
      add(O, t0, xl, 0.9, 0.1); add(O, t0, xr, 0.1, 0.9); });
    for (var a8 = 0; a8 < 8; a8++) { var m2 = 72 + ((key + ch[0] + [0, 7, 12, 7, 3, 7, 12, 15][a8]) % 24), len2 = Math.round(0.5 * sr), x2 = new Float32Array(len2);
      for (var i2 = 0; i2 < len2; i2++) { var t2 = i2 / sr; x2[i2] = 0.05 * Math.exp(-t2 / 0.18) * (Math.sin(2 * Math.PI * hz(m2) * t2) + 0.4 * Math.sin(4 * Math.PI * hz(m2) * t2) * Math.exp(-t2 / 0.05)); }
      add(O, t0 + a8 * beat / 2, x2, 0.6, 0.45); }
  }
  /* a rapped phrase: syllables on sixteenths, a little early or late, a pulse through moving formants, consonants */
  var VOW = [[730, 1090, 2440], [270, 2290, 3010], [300, 870, 2240], [530, 1840, 2480], [570, 840, 2410]];
  function rap(T, from, to, base, gain, gl, gr, extra) {
    var sx = beat / 4, t = from;
    while (t < to) {
      var dur = sx * (rnd() > 0.6 ? 2 : 1) * 0.85, f0 = base * Math.pow(2, (rnd() * 2.5) / 12), v1 = VOW[Math.floor((rnd() + 1) * 2.5) % 5], v2 = VOW[Math.floor((rnd() + 1) * 2.5) % 5];
      var on = t + rnd() * 0.02, len = Math.round((dur + 0.03) * sr), x = new Float32Array(len), ph = 0;
      if (rnd() > -0.2) { var cs = rnd() > 0 ? noiseHit(0.05, 0.02, 1, 0.09) : noiseHit(0.03, 0.008, 0.3, 0.12); add(T, on - 0.02, cs, gl, gr); }   /* s, or t / k */
      for (var i = 0; i < len; i++) { var tt = i / sr, u = Math.min(1, tt / dur), F = [0, 1, 2].map(function (j) { return v1[j] + (v2[j] - v1[j]) * u; });
        var f = f0 * Math.pow(2, (-1.2 * u + 0.15 * rnd()) / 12), s = 0; ph += 2 * Math.PI * f / sr;
        for (var h = 1; h * f < 5500; h++) { var fh = h * f, g = 0.25 * Math.exp(-Math.pow((fh - F[0]) / 120, 2)) + 0.18 * Math.exp(-Math.pow((fh - F[1]) / 160, 2)) + 0.08 * Math.exp(-Math.pow((fh - F[2]) / 220, 2)) + 0.02 / h; s += g * Math.sin(h * ph); }
        var env = Math.min(1, tt / 0.015) * Math.min(1, (dur + 0.03 - tt) / 0.03); x[i] = gain * (s + 0.02 * rnd()) * env; }
      add(T, on, x, gl, gr); if (extra) add(extra[0], on + 0.018, x.map(function (v) { return v * 0.5; }), 0.7, 0.7);
      t += dur / 0.85 + (rnd() > 0.85 ? sx : 0);
    }
  }
  for (var bb = 0; bb < bars; bb++) { var s0 = 0.5 + bb * 4 * beat;
    rap(V, s0, s0 + 3.3 * beat, 120, 0.5, 0.7, 0.7, opt.noDouble ? null : [V]);   /* the verse, and its double (centred) */
    if (bb % 2 === 1) { rap(O, s0 + 3.4 * beat, s0 + 3.95 * beat, 160, 0.35, 0.85, 0.12); }   /* an ad-lib on the left */
    if (bb % 4 === 2) { rap(O, s0 + 3.4 * beat, s0 + 3.95 * beat, 180, 0.35, 0.12, 0.85); } }   /* and one on the right */
  var mix = [new Float32Array(n), new Float32Array(n)], pk = 0;
  for (var c = 0; c < 2; c++) for (var j = 0; j < n; j++) { var v = D[c][j] + Bs[c][j] + V[c][j] + O[c][j]; mix[c][j] = v; if (Math.abs(v) > pk) pk = Math.abs(v); }
  var gg = 0.9 / pk; [mix, D, Bs, V, O].forEach(function (T) { for (var c = 0; c < 2; c++) for (var j = 0; j < n; j++) T[c][j] *= gg; });
  if (opt.mono) [mix, D, Bs, V, O].forEach(function (T) { for (var j = 0; j < n; j++) { var m = 0.5 * (T[0][j] + T[1][j]); T[0][j] = m; T[1][j] = m; } });
  return { sr: sr, n: n, mix: mix, parts: { drums: D, bass: Bs, voice: V, other: O }, lesson: { bass: bass, melody: [], beats: beats, tuning: 0, bpm: bpm } };
};
