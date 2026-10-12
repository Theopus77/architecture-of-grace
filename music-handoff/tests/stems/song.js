/* synthetic songs with known parts (drums, bass, lead voice, pad), stereo, 44.1 kHz; used in the page */
window.makeSong = function (opt) {
  opt = opt || {};
  var sr = opt.sr || 44100, bpm = opt.bpm || 100, beat = 60 / bpm, bars = opt.bars || 8, sec = bars * 4 * beat + 1, n = Math.round(sec * sr);
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
      var x = tone(hz(m), d, opt.pop ? [1, 0.5, 0.33, 0.25, 0.2, 0.17, 0.14, 0.12, 0.11, 0.1] : [1, 0.5, 0.3, 0.2, 0.12, 0.08], function (t, d) { return 0.35 * Math.min(1, t / 0.005) * Math.exp(-t / (opt.pop ? 1.5 : 0.6)) * (t < d ? 1 : Math.exp(-(t - d) / 0.03)); });
      add(Bs, t0 + q[0] * beat, x, 0.7, 0.7); bass.push({ t: t0 + q[0] * beat, d: d, m: m, conf: 1 }); });
    /* pad: the chord, wide */
    var iv = ch[1] ? [0, 3, 7, 12] : [0, 4, 7, 12];
    iv.forEach(function (k, j) { var m = 55 + ((root + k) % 12) + (k === 12 ? 12 : 0), d = 4 * beat;
      var env = function (t, d) { return 0.07 * Math.min(1, t / 0.3) * (t < d ? 1 : Math.exp(-(t - d) / 0.1)); };
      var xl = tone(hz(m) * 1.002, d, [1, 0.4, 0.2, 0.1], env), xr = tone(hz(m) * 0.998, d, [1, 0.4, 0.2, 0.1], env);
      add(O, t0, xl, j % 2 ? 0.9 : 0.3, 0); add(O, t0, xr, 0, j % 2 ? 0.3 : 0.9); });
    /* pop: a synth arpeggio in sixteenths (The rest) */
    if (opt.pop) for (var a16 = 0; a16 < 16; a16++) { var ma = 67 + ((root + [0, 7, 12, 16][a16 % 4]) % 24), xa = tone(hz(ma), beat / 4 * 0.8, [1, 0.6, 0.4, 0.3, 0.2], function (t, d) { return 0.025 * Math.min(1, t / 0.003) * Math.exp(-t / 0.08); });
      add(O, t0 + a16 * beat / 4, xa, 0.35, 0.65); }
    /* the lead voice: two notes a bar, with vibrato and a voice-like set of harmonics, centred */
    if (!opt.noVoice) for (var q2 = 0; q2 < 2; q2++) { var mm = mel[(bar * 2 + q2) % mel.length] + (opt.voiceShift || 0), dd = 1.6 * beat, tt = t0 + q2 * 2 * beat + 0.05;
      var hv = []; for (var h = 1; h <= 24; h++) { var fh = h * hz(mm); hv.push((1 / h) * (1 + 2.5 * Math.exp(-Math.pow((fh - 700) / 300, 2)) + 1.5 * Math.exp(-Math.pow((fh - 1200) / 400, 2)) + 0.8 * Math.exp(-Math.pow((fh - 2600) / 500, 2)))); }
      var venv = function (t, d) { return 0.06 * Math.min(1, t / 0.04) * (t < d ? 1 : Math.exp(-(t - d) / 0.06)); };
      var x2 = tone(hz(mm), dd, hv, venv, opt.pop ? 0 : 30);   /* pop: tuned flat, a stepped pitch */
      add(V, tt, x2, 0.7, 0.7); melody.push({ t: tt, d: dd, m: mm, conf: 1 });
      if (opt.pop) [[-5, 0.62, 0.48], [3, 0.48, 0.62]].forEach(function (hm) { var hv2 = []; for (var h2 = 1; h2 <= 24; h2++) hv2.push(hv[h2 - 1] || 0);   /* stacked harmonies */
        add(V, tt + 0.01, tone(hz(mm + hm[0]), dd, hv2, function (t, d) { return 0.45 * venv(t, d); }, 0), hm[1], hm[2]); }); }
  }
  /* pop: the pad, the arpeggio and the bass pump under the kick (sidechain) */
  if (opt.pop) { var pump = new Float32Array(n).fill(1); for (var bb = 0; bb < bars; bb++) for (var kb = 0; kb < 4; kb += 2) { var a0 = Math.round((0.5 + (bb * 4 + kb) * beat) * sr); for (var ii = 0; ii < Math.round(beat * 2 * sr) && a0 + ii < n; ii++) pump[a0 + ii] = Math.min(pump[a0 + ii], 1 - 0.7 * Math.exp(-ii / sr / 0.12)); }
    [O, Bs].forEach(function (T) { for (var c = 0; c < 2; c++) for (var i = 0; i < n; i++) T[c][i] *= pump[i]; }); }
  var mix = [new Float32Array(n), new Float32Array(n)], pk = 0;
  for (var c = 0; c < 2; c++) for (var i = 0; i < n; i++) { var v = D[c][i] + Bs[c][i] + V[c][i] + O[c][i]; mix[c][i] = v; if (Math.abs(v) > pk) pk = Math.abs(v); }
  var g = 0.9 / pk; [mix, D, Bs, V, O].forEach(function (T) { for (var c = 0; c < 2; c++) for (var i = 0; i < n; i++) T[c][i] *= g; });
  if (opt.mono) [mix, D, Bs, V, O].forEach(function (T) { for (var i = 0; i < n; i++) { var m = 0.5 * (T[0][i] + T[1][i]); T[0][i] = m; T[1][i] = m; } });
  var beats = []; for (var bq = 0; bq < bars * 4; bq++) beats.push(0.5 + bq * beat);
  return { sr: sr, n: n, mix: mix, parts: { drums: D, bass: Bs, voice: V, other: O }, lesson: { bass: bass, melody: melody, beats: beats, tuning: 0, bpm: bpm } };
};
window.sdr = function (ref, est) { var s = 0, e = 0; for (var c = 0; c < ref.length; c++) { var r = ref[c], x = est[c]; for (var i = 0; i < r.length; i++) { s += r[i] * r[i]; var d = r[i] - x[i]; e += d * d; } } return 10 * Math.log10((s + 1e-12) / (e + 1e-12)); };
window.bufOf = function (ch, sr) { var b = new AudioBuffer({ numberOfChannels: ch.length, length: ch[0].length, sampleRate: sr }); ch.forEach(function (a, i) { b.getChannelData(i).set(a); }); return b; };
window.measure = async function (song, opts) {
  opts = opts || {};
  var buf = bufOf(song.mix, song.sr), t0 = performance.now();
  var lesson = opts.lesson === "exact" ? song.lesson : opts.lesson === "none" ? { bass: [], melody: [] } : null;
  if (opts.tune) AOGStems.test.tune(opts.tune);
  var R = await AOGStems.split(buf, { lesson: lesson, kind: opts.kind });
  var ms = performance.now() - t0, out = { ms: Math.round(ms) };
  ["drums", "bass", "voice", "other"].forEach(function (k) { if (!song.parts) { out[k] = null; out[k + "0"] = null; return; } var est = [R[k].getChannelData(0), R[k].getChannelData(1)];
    out[k] = +sdr(song.parts[k], est).toFixed(2); out[k + "0"] = +sdr(song.parts[k], song.mix).toFixed(2); });
  var e = 0, s = 0; for (var c = 0; c < 2; c++) { var a = song.mix[c]; for (var i = 0; i < a.length; i++) { var y = R.drums.getChannelData(c)[i] + R.bass.getChannelData(c)[i] + R.voice.getChannelData(c)[i] + R.other.getChannelData(c)[i]; e = Math.max(e, Math.abs(y - a[i])); } }
  out.sumErr = e; out.last = AOGStems.test.last(); out.kind = R.kind; out.note = R.note;
  /* each part's share of the song's energy (for the songs whose parts are not all there: classical, experimental) */
  var en = function (T) { var s = 0; for (var c = 0; c < 2; c++) { var a = T.getChannelData ? T.getChannelData(c) : T[c]; for (var i = 0; i < a.length; i += 3) s += a[i] * a[i]; } return s; }, all = en(song.mix);
  out.share = ["drums", "bass", "voice", "other"].map(function (k) { return +(en(R[k]) / all).toFixed(3); });
  /* where each true part went: its projection on each estimate (rows: true drums, bass, voice, the rest) */
  if (song.parts && opts.leak) out.leak = ["drums", "bass", "voice", "other"].map(function (t) { var T = song.parts[t], tt = 0; for (var c = 0; c < 2; c++) for (var i = 0; i < T[c].length; i += 2) tt += T[c][i] * T[c][i];
    return ["drums", "bass", "voice", "other"].map(function (k) { var x = 0; for (var c = 0; c < 2; c++) { var a = R[k].getChannelData(c); for (var i = 0; i < a.length; i += 2) x += T[c][i] * a[i]; } return +(x / (tt + 1e-12)).toFixed(2); }).join("/"); }).join(" ");
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
    /* hip hop: a sampled loop with its own soft drums inside, low-passed like an old record (all of it The rest) */
    if (opt.sample) { var sl0 = Math.round(4 * beat * sr), sx = new Float32Array(sl0), lp1 = 0, lp2 = 0;
      for (var si = 0; si < sl0; si++) { var st0 = si / sr, sb = st0 / beat, ph0 = sb % 1, v0 = 0;
        if (Math.floor(sb) % 2 === 0) v0 += 0.25 * Math.sin(2 * Math.PI * (60 + 40 * Math.exp(-ph0 * beat / 0.03)) * ph0 * beat) * Math.exp(-ph0 * beat / 0.12);
        else v0 += 0.12 * rnd() * Math.exp(-ph0 * beat / 0.06);
        [0, 4, 7, 11].forEach(function (k) { v0 += 0.02 * Math.sin(2 * Math.PI * hz(57 + ((key + ch[0] + k) % 12)) * st0) * Math.exp(-ph0 * beat / 0.9); });
        lp1 += 0.25 * (v0 - lp1); lp2 += 0.25 * (lp1 - lp2); sx[si] = lp2; }
      add(O, t0, sx, 0.55, 0.5); }
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
/* classic rock and metal from known parts (Jimmy listens to "a lot of classic rock and heavy metal"):
   rock (120): two distorted rhythm guitars double-tracked hard left and right, a centred sung voice with vibrato and
   breath, a bass on the guitars' root an octave down, drums with a ride, crashes and some room; in bars 5–6 the voice
   rests and a centred lead guitar solos (The rest). opt.metal (190): a fast double kick in sixteenths, a blast bar,
   palm-muted chugs left and right, the bass doubling them, a growled voice (noisy, little pitch, centred). */
window.makeRock = function (opt) {
  opt = opt || {};
  var metal = !!opt.metal, sr = 44100, bpm = metal ? 190 : 120, beat = 60 / bpm, bars = opt.bars || (metal ? 12 : 8), sec = bars * 4 * beat + 1.5, n = Math.round(sec * sr);
  var seed = opt.seed || 41; function rnd() { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return ((seed >>> 0) / 4294967296) * 2 - 1; }
  function arr() { return [new Float32Array(n), new Float32Array(n)]; }
  var D = arr(), Bs = arr(), V = arr(), O = arr(), bass = [], melody = [], beats = [];
  function add(T, at, x, gl, gr) { var a = Math.round(at * sr); for (var i = 0; i < x.length && a + i < n; i++) { if (a + i < 0) continue; T[0][a + i] += x[i] * gl; T[1][a + i] += x[i] * gr; } }
  var hz = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
  function noise(len, dec, hpK, gain, att) { var m = Math.round(len * sr), x = new Float32Array(m), p = 0; for (var i = 0; i < m; i++) { var t = i / sr, z = rnd(); x[i] = gain * (z - p * hpK) * Math.exp(-t / dec) * (att ? Math.min(1, t / att) : 1); p = z; } return x; }
  var kick = (function () { var m = Math.round(0.3 * sr), x = new Float32Array(m), ph = 0; for (var i = 0; i < m; i++) { var t = i / sr, f = 55 + 80 * Math.exp(-t / 0.025); ph += 2 * Math.PI * f / sr; x[i] = 0.8 * Math.sin(ph) * Math.exp(-t / (metal ? 0.05 : 0.12)) + 0.35 * rnd() * Math.exp(-t / 0.002); } return x; })();
  var snare = (function () { var x = noise(0.3, 0.09, 0.5, 0.5); for (var i = 0; i < x.length; i++) x[i] += 0.35 * Math.sin(2 * Math.PI * 190 * i / sr) * Math.exp(-i / sr / 0.05); return x; })();
  var ride = (function () { var x = noise(1.6, 0.6, 1, 0.07); for (var i = 0; i < x.length; i++) { var t = i / sr; x[i] += 0.03 * Math.exp(-t / 0.4) * (Math.sin(2 * Math.PI * 3150 * t) + Math.sin(2 * Math.PI * 4720 * t)); } return x; })();
  var crash = noise(3.0, 1.1, 1, 0.16, 0.002);
  /* a little room on the drums: a few early reflections */
  function room(x) { var y = new Float32Array(x.length + Math.round(0.08 * sr)); [[0, 1], [0.011, 0.25], [0.023, 0.18], [0.037, 0.12], [0.061, 0.08]].forEach(function (r) { var o = Math.round(r[0] * sr); for (var i = 0; i < x.length; i++) y[i + o] += x[i] * r[1]; }); return y; }
  kick = room(kick); snare = room(snare);
  /* a distorted guitar: a power chord into a hard clip, a cabinet's low-pass */
  function dist(m, dur, mute, drive) { var len = Math.round((dur + 0.05) * sr), x = new Float32Array(len), ph1 = rnd() * 3, ph2 = rnd() * 3, ph3 = rnd() * 3, l1 = 0, l2 = 0, h = 0, cut = 1 - Math.exp(-2 * Math.PI * 4500 / sr);
    for (var i = 0; i < len; i++) { var t = i / sr; ph1 += 2 * Math.PI * hz(m) * (1 + 0.0007 * rnd()) / sr; ph2 += 2 * Math.PI * hz(m + 7) / sr; ph3 += 2 * Math.PI * hz(m + 12) / sr;
      var saw = (ph1 / Math.PI % 2) - 1 + 0.8 * ((ph2 / Math.PI % 2) - 1) + 0.5 * ((ph3 / Math.PI % 2) - 1);
      var env = Math.min(1, t / 0.004) * (mute ? Math.exp(-t / 0.06) : (t < dur ? 1 : Math.exp(-(t - dur) / 0.03)));
      var y = Math.tanh((drive || 6) * saw * env); l1 += cut * (y - l1); l2 += cut * (l1 - l2); h = 0.995 * h + l2 - (x[i - 1] || 0) * 0; x[i] = 0.12 * l2; }
    return x; }
  /* a sung voice (vibrato, formants, a little breath) or, for metal, a growl (noise through formants, little pitch) */
  function voice(m, dur, growl) { var len = Math.round((dur + 0.08) * sr), x = new Float32Array(len), ph = 0, F = [[650, 1100, 2600], [400, 1900, 2550], [550, 900, 2400]][Math.floor((rnd() + 1) * 1.5) % 3];
    for (var i = 0; i < len; i++) { var t = i / sr, f = hz(m) * Math.pow(2, (growl ? 0.8 * rnd() : 0.35 * Math.sin(2 * Math.PI * 5.5 * t) * Math.min(1, t / 0.3)) / 12); ph += 2 * Math.PI * f / sr; var s = 0;
      for (var h = 1; h * f < 6000; h++) { var fh = h * f; s += (0.3 * Math.exp(-Math.pow((fh - F[0]) / 130, 2)) + 0.2 * Math.exp(-Math.pow((fh - F[1]) / 170, 2)) + 0.09 * Math.exp(-Math.pow((fh - F[2]) / 240, 2)) + 0.02 / h) * Math.sin(h * ph + (growl ? rnd() * 0.9 : 0)); }
      var env = Math.min(1, t / 0.03) * (t < dur ? 1 : Math.exp(-(t - dur) / 0.05));
      x[i] = (growl ? 0.4 : 0.32) * (s * (growl ? 0.55 : 1) + (growl ? 0.25 : 0.015) * rnd()) * env; }
    return x; }
  var key = metal ? 4 : 9, prog = metal ? [0, 0, 1, 3] : [0, 5, 7, 5], mel = [76, 74, 72, 74, 76, 79, 76, 74];
  for (var bar = 0; bar < bars; bar++) {
    var t0 = 0.5 + bar * 4 * beat, root = key + prog[bar % 4], solo = !metal && (bar === 4 || bar === 5), blast = metal && bar % 4 === 3;
    for (var b = 0; b < 4; b++) beats.push(t0 + b * beat);
    /* drums */
    if (metal) { for (var s16 = 0; s16 < 16; s16++) { add(D, t0 + s16 * beat / 4, kick, 0.7, 0.7); if (blast ? s16 % 2 === 1 : s16 % 8 === 4) add(D, t0 + s16 * beat / 4, snare, 0.62, 0.66); } }
    else { [0, 2.5].forEach(function (q) { add(D, t0 + q * beat, kick, 0.7, 0.7); }); [1, 3].forEach(function (q) { add(D, t0 + q * beat, snare, 0.62, 0.66); });
      for (var e = 0; e < 8; e++) add(D, t0 + e * beat / 2, ride, 0.35, 0.75); }
    if (bar % 4 === 0) add(D, t0, crash, 0.8, 0.4);
    /* guitars, left and right, and the bass on their root an octave down */
    var gm = 40 + (root % 12), steps = metal ? [0, 0.25, 0.5, 1, 1.25, 1.5, 2, 2.25, 2.5, 3, 3.25, 3.5] : [0, 1.5, 2, 3];
    steps.forEach(function (q, qi) { var d = metal ? beat / 4 : (qi === steps.length - 1 ? 1 : (steps[qi + 1] - q)) * beat;
      add(O, t0 + q * beat + 0.004 * rnd(), dist(gm, d, metal, 7), 0.95, 0.05); add(O, t0 + q * beat + 0.008 + 0.004 * rnd(), dist(gm, d, metal, 6.5), 0.05, 0.95);
      var bl = Math.round((d + 0.05) * sr), bx = new Float32Array(bl), ph = 0; for (var i = 0; i < bl; i++) { var t = i / sr; ph += 2 * Math.PI * hz(gm - 12) / sr;
        bx[i] = 0.28 * (Math.sin(ph) + 0.4 * Math.sin(2 * ph) + 0.2 * Math.sin(3 * ph) + 0.08 * Math.sin(5 * ph)) * Math.min(1, t / 0.005) * (metal ? Math.exp(-t / 0.09) : Math.exp(-t / 0.8)) * (t < d ? 1 : Math.exp(-(t - d) / 0.02)); }
      add(Bs, t0 + q * beat, bx, 0.7, 0.7); bass.push({ t: t0 + q * beat, d: d, m: gm - 12, conf: 1 }); });
    /* the voice, or the solo */
    if (solo) { for (var sn = 0; sn < 8; sn++) { var sm = 64 + [12, 15, 17, 19, 17, 15, 12, 10][sn] + (root % 12) - 9; add(O, t0 + sn * beat / 2, dist(sm, beat / 2 * 0.95, false, 4).map(function (v) { return v * 0.9; }), 0.7, 0.7); } }
    else for (var vn = 0; vn < 2; vn++) { var vm = metal ? 45 + (root % 12) : mel[(bar * 2 + vn) % mel.length] - 12, vd = (metal ? 1.4 : 1.7) * beat, vt = t0 + vn * 2 * beat + 0.06;
      add(V, vt, voice(vm, vd, metal), 0.7, 0.7); if (!metal) melody.push({ t: vt, d: vd, m: vm, conf: 1 }); }
  }
  var mix = [new Float32Array(n), new Float32Array(n)], pk = 0;
  for (var c = 0; c < 2; c++) for (var j = 0; j < n; j++) { var v = D[c][j] + Bs[c][j] + V[c][j] + O[c][j]; mix[c][j] = v; if (Math.abs(v) > pk) pk = Math.abs(v); }
  var gg = 0.9 / pk; [mix, D, Bs, V, O].forEach(function (T) { for (var c = 0; c < 2; c++) for (var j = 0; j < n; j++) T[c][j] *= gg; });
  return { sr: sr, n: n, mix: mix, parts: { drums: D, bass: Bs, voice: V, other: O }, lesson: { bass: bass, melody: melody, beats: beats, tuning: 0, bpm: bpm } };
};

/* a concert hall: a few long, decorrelated echoes and a diffuse tail (RT about 2 s), added to each part on its own */
function hallOf(T, sr, wet, seed) {
  var n = T[0].length, out = [new Float32Array(n), new Float32Array(n)], dl = [0.0297, 0.0371, 0.0411, 0.0437, 0.0533, 0.0593], g = Math.pow(10, -3 * 0.05 / 2.0);
  for (var c = 0; c < 2; c++) { var x = T[c], y = out[c];
    dl.forEach(function (d, j) { var D = Math.round((d + c * 0.0031 + j * 0.0007) * sr), buf = new Float32Array(D), w = 0, lp = 0, fb = Math.pow(10, -3 * d / 2.0);
      for (var i = 0; i < n; i++) { var o = buf[w]; lp += 0.35 * (o - lp); buf[w] = 0.5 * (x[i] + T[1 - c][i]) * 0.5 + lp * fb; w = (w + 1) % D; y[i] += o * wet / dl.length; } }); }
  for (var c2 = 0; c2 < 2; c2++) for (var i2 = 0; i2 < n; i2++) T[c2][i2] += out[c2][i2];
}
/* classical (Jimmy's list: "Classical music"): opt.piano, a solo piano piece (left hand and right, rubato, hall);
   otherwise an orchestra: strings wide with vibrato, pizzicato, the low line on cellos and basses (Bass), timpani
   (Drums), and with opt.soprano a soloist (Voice); all in a hall. With no drum kit, Drums must stay nearly silent. */
window.makeClassical = function (opt) {
  opt = opt || {};
  var sr = 44100, bpm = 72, beat = 60 / bpm, bars = opt.bars || 6, sec = bars * 4 * beat + 3, n = Math.round(sec * sr);
  var seed = opt.seed || 61; function rnd() { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return ((seed >>> 0) / 4294967296) * 2 - 1; }
  function arr() { return [new Float32Array(n), new Float32Array(n)]; }
  var D = arr(), Bs = arr(), V = arr(), O = arr(), bass = [], melody = [], beats = [];
  function add(T, at, x, gl, gr) { var a = Math.round(at * sr); for (var i = 0; i < x.length && a + i < n; i++) { if (a + i < 0) continue; T[0][a + i] += x[i] * gl; T[1][a + i] += x[i] * gr; } }
  var hz = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
  function piano(m, vel) { var f = hz(m), len = Math.round(2.5 * sr), x = new Float32Array(len), lp = 0;
    for (var h = 1; h <= 14 && h * f < 9000; h++) { var fh = h * f * Math.sqrt(1 + 0.0004 * h * h), a = vel * 0.08 / Math.pow(h, 1.1), tau = 2.2 / Math.sqrt(h) * (m < 50 ? 1.6 : 1);
      for (var i = 0; i < len; i++) x[i] += a * Math.sin(2 * Math.PI * fh * i / sr) * Math.exp(-i / sr / tau) * Math.min(1, i / 40); }
    for (var k = 0; k < Math.round(0.006 * sr); k++) { lp += 0.3 * (rnd() - lp); x[k] += vel * 0.05 * lp * (1 - k / (0.006 * sr)); }   /* the hammer */
    return x; }
  function bowed(m, dur, vib, gain, att) { var len = Math.round((dur + 0.3) * sr), x = new Float32Array(len), ph = 0, vp = rnd() * 6, f0 = hz(m);
    for (var i = 0; i < len; i++) { var t = i / sr, f = f0 * Math.pow(2, vib * Math.sin(2 * Math.PI * 5.2 * t + vp) / 1200); ph += 2 * Math.PI * f / sr; var s = 0;
      for (var h = 1; h <= 12 && h * f0 < 8000; h++) s += Math.sin(h * ph) / h; x[i] = gain * s * Math.min(1, t / att) * (t < dur ? 1 : Math.exp(-(t - dur) / 0.12)); }
    return x; }
  var prog = [[0, 0], [5, 0], [7, 0], [9, 1], [5, 0], [7, 0]], key = 2, t = 0.5;
  for (var bar = 0; bar < bars; bar++) {
    var ch = prog[bar % prog.length], root = key + ch[0], bl = 4 * beat * (1 + 0.08 * rnd()), t0 = t;
    for (var b = 0; b < 4; b++) beats.push(t0 + b * bl / 4);
    var iv = ch[1] ? [0, 3, 7] : [0, 4, 7];
    if (opt.piano) {
      for (var q = 0; q < 4; q++) { var lm = 38 + ((root + [0, 7, 12, 7][q]) % 12) + (q === 2 ? 12 : 0); add(O, t0 + q * bl / 4, piano(lm, 0.9), 0.6, 0.5); }
      for (var e = 0; e < 8; e++) { var rm = 67 + ((root + [0, 4, 7, 12, 7, 4, 2, 0][e] + (ch[1] && e % 4 === 1 ? -1 : 0)) % 12) + (e === 3 ? 12 : 0); add(O, t0 + e * bl / 8 + 0.01 * rnd(), piano(rm, 0.7 + 0.2 * rnd()), 0.45, 0.6); }
    } else {
      iv.concat([12]).forEach(function (k, j) { add(O, t0, bowed(60 + ((root + k) % 12) + (k === 12 ? 12 : 0), bl, 14, 0.018, 0.25), j % 2 ? 0.85 : 0.2, j % 2 ? 0.2 : 0.85); });
      for (var pz = 1; pz < 8; pz += 2) { var pm = 55 + ((root + iv[(pz >> 1) % 3]) % 12), px = new Float32Array(Math.round(0.4 * sr));
        for (var i = 0; i < px.length; i++) { var tt = i / sr; px[i] = 0.05 * (Math.sin(2 * Math.PI * hz(pm) * tt) + 0.3 * Math.sin(4 * Math.PI * hz(pm) * tt)) * Math.exp(-tt / 0.15) * Math.min(1, i / 30); }
        add(O, t0 + pz * bl / 8, px, 0.75, 0.35); }
      [0, 2].forEach(function (q) { var bm = 38 + ((root + (q ? 7 : 0)) % 12); add(Bs, t0 + q * bl / 4, bowed(bm, bl / 2 * 0.95, 10, 0.06, 0.06), 0.62, 0.42); bass.push({ t: t0 + q * bl / 4, d: bl / 2 * 0.95, m: bm, conf: 1 }); });
      if (bar % 2 === 0) { var tx = new Float32Array(Math.round(1.2 * sr)); for (var i2 = 0; i2 < tx.length; i2++) { var t2 = i2 / sr; tx[i2] = (0.3 * Math.sin(2 * Math.PI * hz(38 + (root % 12)) * t2) + 0.12 * Math.sin(2 * Math.PI * hz(38 + (root % 12)) * 1.5 * t2)) * Math.exp(-t2 / 0.5) + 0.2 * rnd() * Math.exp(-t2 / 0.01); }
        add(D, t0, tx, 0.5, 0.6); }
      if (opt.soprano) [0, 2].forEach(function (q) { var sm = 72 + ((root + [4, 7][q / 2]) % 12), sd = bl / 2 * 0.9, sx = new Float32Array(Math.round((sd + 0.2) * sr)), ph = 0;
        for (var i3 = 0; i3 < sx.length; i3++) { var t3 = i3 / sr, f = hz(sm) * Math.pow(2, 55 * Math.sin(2 * Math.PI * 5.8 * t3) * Math.min(1, t3 / 0.4) / 1200); ph += 2 * Math.PI * f / sr; var s = 0;
          for (var h = 1; h * f < 7000; h++) { var fh = h * f; s += (0.3 * Math.exp(-Math.pow((fh - 800) / 250, 2)) + 0.25 * Math.exp(-Math.pow((fh - 3000) / 400, 2)) + 0.05 / h) * Math.sin(h * ph); }
          sx[i3] = 0.08 * s * Math.min(1, t3 / 0.08) * (t3 < sd ? 1 : Math.exp(-(t3 - sd) / 0.08)); }
        add(V, t0 + q * bl / 4 + 0.05, sx, 0.68, 0.72); melody.push({ t: t0 + q * bl / 4 + 0.05, d: sd, m: sm, conf: 1 }); });
    }
    t += bl;
  }
  [D, Bs, V, O].forEach(function (T, j) { hallOf(T, sr, 0.5, j); });
  var mix = [new Float32Array(n), new Float32Array(n)], pk = 0;
  for (var c = 0; c < 2; c++) for (var j = 0; j < n; j++) { var v = D[c][j] + Bs[c][j] + V[c][j] + O[c][j]; mix[c][j] = v; if (Math.abs(v) > pk) pk = Math.abs(v); }
  var gg = 0.9 / pk; [mix, D, Bs, V, O].forEach(function (T) { for (var c = 0; c < 2; c++) for (var j = 0; j < n; j++) T[c][j] *= gg; });
  return { sr: sr, n: n, mix: mix, parts: { drums: D, bass: Bs, voice: V, other: O }, lesson: { bass: bass, melody: melody, beats: beats, tuning: 0, bpm: bpm } };
};
/* experimental (Jimmy's list: "Experimental music"): a drone, noise bursts at odd times, glitches, metallic hits with
   no steady beat, a pulse in 7 that drifts. There is no right answer for its parts: it must split without trouble, add
   back exactly, and keep what it cannot tell in The rest. */
window.makeExperimental = function (opt) {
  opt = opt || {};
  var sr = 44100, sec = opt.sec || 16, n = Math.round(sec * sr), seed = opt.seed || 77;
  function rnd() { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return ((seed >>> 0) / 4294967296) * 2 - 1; }
  var mix = [new Float32Array(n), new Float32Array(n)], i, j;
  for (i = 0; i < n; i++) { var t = i / sr, dr = 0.12 * Math.sin(2 * Math.PI * 55 * t) + 0.06 * Math.sin(2 * Math.PI * 82.5 * t + Math.sin(0.3 * t)) + 0.03 * Math.sin(2 * Math.PI * 440 * (1 + 0.01 * Math.sin(0.7 * t)) * t);
    mix[0][i] += dr * (0.6 + 0.4 * Math.sin(0.2 * t)); mix[1][i] += dr * (0.6 - 0.4 * Math.sin(0.2 * t)); }
  var at = 0.3; while (at < sec - 1) { var len = Math.round((0.05 + 0.4 * Math.abs(rnd())) * sr), a = Math.round(at * sr), pan = 0.5 + 0.5 * rnd(), kind = Math.abs(rnd());
    for (j = 0; j < len && a + j < n; j++) { var tt = j / sr, v;
      if (kind < 0.33) v = 0.25 * rnd() * Math.exp(-tt / 0.08);
      else if (kind < 0.66) v = 0.2 * (Math.sin(2 * Math.PI * 523 * tt) * Math.sin(2 * Math.PI * 1377 * tt) + 0.5 * Math.sin(2 * Math.PI * 2950 * tt)) * Math.exp(-tt / 0.3);
      else v = 0.15 * Math.round(8 * Math.sin(2 * Math.PI * 220 * tt * (1 + 3 * tt))) / 8;   /* a glitch, crushed */
      mix[0][a + j] += v * pan; mix[1][a + j] += v * (1 - pan); }
    at += 0.15 + 1.1 * Math.abs(rnd()); }
  var pulse = 0.4; while (pulse < sec - 0.5) { var a2 = Math.round(pulse * sr); for (j = 0; j < 600 && a2 + j < n; j++) { var v2 = 0.3 * Math.sin(2 * Math.PI * 70 * j / sr) * Math.exp(-j / 300); mix[0][a2 + j] += v2; mix[1][a2 + j] += v2; } pulse += 0.21 * (1 + 0.3 * Math.sin(pulse)) * ((Math.round(pulse / 0.21) % 7) < 3 ? 1 : 1.5); }
  var pk = 0; for (var c = 0; c < 2; c++) for (i = 0; i < n; i++) pk = Math.max(pk, Math.abs(mix[c][i]));
  for (var c2 = 0; c2 < 2; c2++) for (i = 0; i < n; i++) mix[c2][i] *= 0.9 / pk;
  return { sr: sr, n: n, mix: mix, parts: null, lesson: { bass: [], melody: [], beats: [], tuning: 0, bpm: 0 } };
};
