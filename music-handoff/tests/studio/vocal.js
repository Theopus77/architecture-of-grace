/* AOG-VOCAL-V1 (2026-10-23) — 🎙 The Vocal Booth, the Studio's ninth room (music-vocal.html, aog-vocal.js), in the place of
   🎤 Sing or rap (AOG-MICBOOTH-V1, whose test this replaces). With a pretend microphone (Chromium's fake device, fed short
   bursts of a voice-like 226 Hz tone, a little sharp of A3):
   · the Vocal Booth is a door, the eighth of nine, just before the Mixing Desk; the room fetches nothing and asks for no
     microphone until ● Record; it fits an iPhone upright and on its side, and an iPad; every key is 44 px or more;
   · with a Drum Machine loop on My Track, ● Record asks once, plays My Track and records; the meter moves only while
     recording; ■ Stop makes a take of the right length; the microphone stays ready, so a second take (kept beside the first)
     asks for nothing again; the Studio's hush or a hidden tab lets it go (AOG-VOCAL-MIC-V3);
     ✕ lets one go and Bring it back returns it;
   · the sounds, measured: Phone has little energy below 250 Hz; Echo has delayed copies in the gaps; Tuned pulls the
     226 Hz voice toward A (220 Hz); Robot pulls it harder; Air adds highs; Low cut takes lows away; Double spreads the voice
     left and right; Big hall rings on after the voice; nothing past −1 dB;
   · AOG-VOCAL-FX-V2, the More sounds, measured the same way: Deep and High move the fundamental 5 semitones down and up (and
     Pitch +3 three), steady, the same length and timing; Harmony adds power a third up in the song's key (C, not C♯, over the
     voice's A) or a fifth; Megaphone narrows the band and adds harmonics the voice did not have (so does Grit on Clean);
     Slapback adds one echo about 108 ms late and no second; Chop is shut between the song's sixteenths from the take's bar;
     Ghost swells before each line; Old record is band-limited with a soft wow and a quiet crackle; Wide is wider than Double;
     the fold (closed on a phone), each new sound tapped as it plays, 44 px keys; take 2 goes to My Track with its new name;
   · AOG-VOCAL-TUNE-V2, the booth's own Tune: on the recorded voice, Key picks the notes (A♭ major: B♭; A minor: A) and Pop
     polish tunes; on pretend singers made here (iPad pass): notes sung 25–40 cents off with a ±30-cent vibrato land within 5
     cents with the vibrato kept (Tuned) or within 3 cents and flat (Hard); a note held near halfway never flips; a slide is a
     clean step (Hard) or a smooth glide (natural); an s and a breath keep their spectrum; same length and onsets; no clicks;
     a low bass and a soprano; less warble than the desk's old dmTune on a held note; a minute in under 3 s. Shape your voice
     has Key (one select, EN and ES, 44 px), Tune speed and Keep my vibrato; ▶ Hear it says Making the sound… while it works;
   · ▶ Hear it plays with the beat; a control moved while it plays changes the sound (the sound becomes Custom) and it plays on;
   · + Add to My Track puts it on the desk's track 8 at the right bar (From bar 1; bar 3 on the iPad), called Voz 1 / Voice 1,
     its sound named, its dry take kept, and My Track marks Voice; a take longer than the loop makes the beat repeat to fit;
   · a refused microphone shows the friendly line about Settings; reads and is calm in Spanish and English, light and dark;
     rests when idle (the engine paused, no frames); no page errors. Port 9494. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), os = require("os");
const ROOT = path.resolve(__dirname, "../../../aog-deploy"), PORT = 9494, U = "http://localhost:" + PORT + "/", srv = require("../srv.js")(PORT);
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const W = ms => new Promise(r => setTimeout(r, ms));
/* the pretend voice: 0.4 s of a band-limited 226 Hz tone, then a soft "s" (60 ms of bright noise), then quiet, over and over */
const VOICE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "vocal-")), "voice.wav");
(() => { const sr = 48000, n = sr * 15, b = Buffer.alloc(44 + n * 2); b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  let seed = 12345, prev = 0; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
  for (let i = 0; i < n; i++) { const t = i / sr, ph = t % 1.5; let x = 0;
    if (ph < 0.4) { const env = Math.min(1, ph / 0.01, (0.4 - ph) / 0.01); for (let k = 1; k <= 17; k++) x += Math.sin(2 * Math.PI * 226 * k * t) / k; x *= env * 0.42; }
    else if (ph >= 0.42 && ph < 0.48) { const v = rnd(), hi = v - prev; prev = v; x = hi * 0.16 * Math.min(1, (ph - 0.42) / 0.005, (0.48 - ph) / 0.005); }   /* the s: noise, its lows taken away */
    b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(x * 20000))), 44 + i * 2); }
  fs.writeFileSync(VOICE, b); })();
const COUNT = () => { window.__gum = 0; window.__streams = []; const md = navigator.mediaDevices; if (!md || !md.getUserMedia) return; const g = md.getUserMedia.bind(md);
  md.getUserMedia = async c => { window.__gum++; const s = await g(c); window.__streams.push(s); return s; }; };
const REFUSE = () => { const md = navigator.mediaDevices; if (!md) return; md.getUserMedia = async () => { window.__gum = (window.__gum || 0) + 1; throw new DOMException("refused", "NotAllowedError"); }; };
/* the sounds, measured in the booth */
const MEASURE = async () => {
  const OC = window.OfflineAudioContext, V = AOGVocal, dry = V.dry(), sr = V.state().take.sr;
  const filt = async (x, type, f) => { const oc = new OC(1, x.length, sr), b = oc.createBuffer(1, x.length, sr); b.copyToChannel(x, 0); const s = oc.createBufferSource(); s.buffer = b;
    let n = s; for (let i = 0; i < 4; i++) { const z = oc.createBiquadFilter(); z.type = type; z.frequency.value = f; z.Q.value = -3.01; n.connect(z); n = z; } n.connect(oc.destination); s.start(0);
    return (await oc.startRendering()).getChannelData(0); };
  const band = async (x, type, f) => { const y = await filt(x, type, f); let a = 0, t = 0; for (let i = 0; i < x.length; i++) { a += y[i] * y[i]; t += x[i] * x[i]; } return t > 0 ? a / t : 0; };
  const F = Math.round(0.02 * sr), fr = x => { const o = []; for (let i = 0; i + F <= x.length; i += F) { let e = 0; for (let j = 0; j < F; j++) e += x[i + j] * x[i + j]; o.push(e); } return o; };
  const dF = fr(dry); let mx = 0; dF.forEach(e => { if (e > mx) mx = e; });
  const gap = x => { const f = fr(x); let g = 0, t = 0; f.forEach((e, i) => { t += e; if (i < dF.length && dF[i] < mx * 1e-4) g += e; }); return t > 0 ? g / t : 0; };
  /* after the voice: the share of the sound that rings on past the take's end */
  const after = x => { let a = 0, t = 0; for (let i = 0; i < x.length; i++) { const e = x[i] * x[i]; t += e; if (i >= dry.length) a += e; } return t > 0 ? a / t : 0; };
  const side = m => { let d = 0, t = 0; for (let i = 0; i < m.L.length; i++) { const s = m.L[i] - m.R[i], q = m.L[i] + m.R[i]; d += s * s; t += q * q; } return t > 0 ? d / t : 0; };
  const pitches = x => { const N = Math.round(0.04 * sr), H = Math.round(0.02 * sr), lo = Math.floor(sr / 400), hi = Math.ceil(sr / 150), out = [];
    const ef = []; for (let i = 0; i + N <= x.length; i += H) { let e = 0; for (let j = 0; j < N; j++) e += x[i + j] * x[i + j]; ef.push(e); } let em = 0; ef.forEach(e => { if (e > em) em = e; });
    ef.forEach((e, k) => { if (e < em * 0.4) return; const i = k * H; let best = -1, bl = 0; const r = [];
      for (let L = lo - 1; L <= hi + 1; L++) { let s = 0; for (let j = 0; j < N; j++) s += x[i + j] * x[i + j + L]; r[L] = s; if (L >= lo && L <= hi && s > best) { best = s; bl = L; } }
      for (let L = lo; L < bl; L++) if (r[L] >= 0.9 * best && r[L] >= r[L - 1] && r[L] >= r[L + 1]) { bl = L; break; }   /* the shortest period that fits as well: not an octave low */
      const a = r[bl - 1], b = r[bl], c = r[bl + 1], d = a - 2 * b + c, p = bl + (d < 0 ? 0.5 * (a - c) / d : 0); out.push(sr / p); });
    return out.sort((a, b) => a - b); };
  const pitch = x => { const o = pitches(x); return o.length ? o[Math.floor(o.length / 2)] : 0; };
  /* how far the pitch wanders, in cents (from a tenth of the way up the frames to nine tenths) */
  const spread = x => { const o = pitches(x); return o.length > 4 ? 1200 * Math.log2(o[Math.floor(o.length * 0.9)] / o[Math.floor(o.length * 0.1)]) : 0; };
  const pk = m => { let p = 0; for (let i = 0; i < m.L.length; i++) { const a = Math.max(Math.abs(m.L[i]), Math.abs(m.R[i])); if (a > p) p = a; } return p; };
  const r = { dryHz: pitch(dry) }, peaks = [];
  const one = async (name, k, ch) => { const m = await V.make(k, ch); peaks.push(pk(m)); return m; };
  const clean = await one("clean", "clean"); r.clean = { low: await band(clean.L, "lowpass", 250), high: await band(clean.L, "highpass", 6000), gap: gap(clean.L), after: after(clean.L), hz: pitch(clean.L) };
  const dry0 = await one("dry0", "clean", { room: 0 }); r.clean.side = side(dry0);   /* Double is heard against no room: the room's own stereo is not Double's */
  const phone = await one("phone", "phone"); r.phone = { low: await band(phone.L, "lowpass", 250) };
  const echo = await one("echo", "echo"); r.echo = { gap: gap(echo.L) };
  const tuned = await one("tuned", "tuned"); r.tuned = { hz: pitch(tuned.L) };
  const robot = await one("robot", "robot"); r.robot = { hz: pitch(robot.L) };
  const hall = await one("hall", "hall"); r.hall = { after: after(hall.L) };
  const air = await one("air", "clean", { air: 9 }); r.air = { high: await band(air.L, "highpass", 6000) };
  const s0 = await one("s0", "clean", { ss: 0 }), s1 = await one("s1", "clean", { ss: 100 }); r.ss = { off: await band(s0.L, "highpass", 5000), on: await band(s1.L, "highpass", 5000) };
  const lc = await one("lc", "clean", { lc: 300 }); r.lc = { low: await band(lc.L, "lowpass", 250) };
  const dbl = await one("dbl", "clean", { dbl: 80, room: 0 }); r.dbl = { side: side(dbl) };
  /* AOG-VOCAL-FX-V2: the More sounds. The dry take's bursts start at on0 (the tone starts there, its s 0.42 s later) */
  const F5 = Math.round(0.005 * sr), onsets = x => { const e = []; for (let i = 0; i + F5 <= x.length; i += F5) { let s = 0; for (let j = 0; j < F5; j++) s += x[i + j] * x[i + j]; e.push(s); }
    let m = 0; e.forEach(v => { if (v > m) m = v; }); const o = []; for (let i = 1; i < e.length; i++) if (e[i] > 0.3 * m && e[i - 1] <= 0.3 * m && (!o.length || i * F5 - o[o.length - 1] > 0.8 * sr)) o.push(i * F5); return o; };
  const on0 = onsets(dry), win = (x, a, b) => { let s = 0; for (let i = Math.max(0, Math.round(a)); i < Math.min(x.length, Math.round(b)); i++) s += x[i] * x[i]; return s; };
  /* the power at one frequency, in 0.2 s inside each burst (Goertzel, Hann window) */
  const gz = (x, f, a, N) => { const w = 2 * Math.cos(2 * Math.PI * f / sr); let s1 = 0, s2 = 0; for (let i = 0; i < N; i++) { const s = x[a + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)) + w * s1 - s2; s2 = s1; s1 = s; } return s1 * s1 + s2 * s2 - w * s1 * s2; };
  const tonal = (x, f) => { let p = 0; const N = Math.round(0.2 * sr); on0.forEach(o => { const a = o + Math.round(0.08 * sr); if (a + N < x.length) p += gz(x, f, a, N); }); return p; };
  /* the share of the tone's sound above f (the pretend voice has nothing above 3.84 kHz: anything there is new) */
  const toneShare = async (x, f) => { const y = await filt(x, "highpass", f); let a = 0, t = 0; on0.forEach(o => { a += win(y, o + 0.06 * sr, o + 0.34 * sr); t += win(x, o + 0.06 * sr, o + 0.34 * sr); }); return t > 0 ? a / t : 0; };
  r.on0 = on0.length; r.clean.len = clean.L.length; r.clean.on = onsets(clean.L).map(o => o / sr);
  const deep = await one("deep", "deep"), high = await one("high", "high"), p3 = await one("p3", "clean", { pitch: 3 });
  r.deep = { hz: pitch(deep.L), wob: spread(deep.L), len: deep.L.length, on: onsets(deep.L).map(o => o / sr) };
  r.high = { hz: pitch(high.L), wob: spread(high.L), len: high.L.length, on: onsets(high.L).map(o => o / sr) };
  r.p3 = { hz: pitch(p3.L) };
  const harm = await one("harmony", "harmony"), harm5 = await one("harm5", "harmony", { hiv: 5 }), f0 = r.dryHz;
  r.harm = { third: tonal(harm.L, f0 * 2 ** (3 / 12)) / tonal(harm.L, f0), major: tonal(harm.L, f0 * 2 ** (4 / 12)) / tonal(harm.L, f0),
    fifth: tonal(harm5.L, f0 * 2 ** (7 / 12)) / tonal(harm5.L, f0), clean: tonal(clean.L, f0 * 2 ** (3 / 12)) / tonal(clean.L, f0) };
  const mega = await one("mega", "mega"), mega0 = await one("mega0", "mega", { grit: 0 }), grit = await one("grit", "clean", { grit: 80 });
  r.mega = { low: await band(mega.L, "lowpass", 250), high: await band(mega.L, "highpass", 6000), adds: await toneShare(mega.L, 4600), adds0: await toneShare(mega0.L, 4600) };
  r.grit = { adds: await toneShare(grit.L, 4600), clean: await toneShare(clean.L, 4600) };
  /* Slapback: what it adds (the same sound with and without it, quiet enough that neither is turned down), lined up with the voice */
  const sl0 = await one("sl0", "clean", { vol: -12 }), sl1 = await one("sl1", "clean", { slap: 60, vol: -12 }), res = sl1.L.map((v, i) => v - sl0.L[i]);
  /* how late: where each burst of what it adds starts, against where the voice's own burst starts */
  const oR = onsets(res), oD = onsets(sl0.L), lags = oR.map(t => { const d = oD.filter(u => u <= t + F5); return d.length ? (t - d[d.length - 1]) / sr : 1; }).filter(x => x > 0.03 && x < 0.5).sort((x, y) => x - y);
  const lag = lags.length ? lags[lags.length >> 1] : 0; let one1 = 0, two = 0; on0.forEach(o => { one1 += win(res, o + (lag + 0.05) * sr, o + (lag + 0.35) * sr); two += win(res, o + (lag + 0.5) * sr, o + (lag + 0.6) * sr); });
  r.slap = { lag: lag, after: one1 > 0 ? two / one1 : 1, share: win(res, 0, res.length) / win(sl0.L, 0, sl0.L.length) };
  /* Chop: inside each burst, the sound where the gate is open and where it is shut, on the song's sixteenths from the take's bar */
  const chop = await one("chop", "chop"), tk = V.state().take, step = 60 / tk.bpm / 4;
  const gate = st => { let a = 0, b = 0; on0.forEach(o => { const t0 = o / sr + 0.03, t1 = o / sr + 0.37;
    for (let k = Math.ceil((t0 - tk.head) / st); tk.head + (k + 1) * st <= t1; k++) { const s = tk.head + k * st; a += win(chop.L, (s + 0.12 * st) * sr, (s + 0.45 * st) * sr); b += win(chop.L, (s + 0.64 * st) * sr, (s + 0.95 * st) * sr); } });
    return a > 0 ? b / a : 1; };
  r.chop = { shut: gate(step), other: gate(60 / (tk.bpm + 12) / 4), step: step, bpm: tk.bpm };   /* the same look at a tempo 12 bpm faster finds no such pattern */
  /* Ghost: the sound in the 0.3 s before each line, against the line itself */
  const gh = await one("ghost", "ghost"), pre = x => { let a = 0, b = 0; on0.forEach(o => { if (o < 0.6 * sr) return; a += win(x, o - 0.3 * sr, o - 0.02 * sr); b += win(x, o + 0.05 * sr, o + 0.35 * sr); }); return b > 0 ? a / b : 0; };
  r.ghost = { pre: pre(gh.L), clean: pre(clean.L) };
  const old = await one("old", "old");
  r.old = { high: await band(old.L, "highpass", 6000), low: await band(old.L, "lowpass", 120), cleanLow: await band(clean.L, "lowpass", 120), gap: gap(old.L), wow: spread(old.L), cleanWow: spread(clean.L) };
  const wide = await one("wide", "wide", { room: 0 }); r.wide = { side: side(wide) };
  /* AOG-VOCAL-TUNE-V2: the Key choice on the recorded voice (A, 46 cents sharp): A♭ major has no A, so it goes to B♭; A minor keeps A */
  r.tunedAb = pitch((await one("tunedAb", "tuned", { tk: 8 })).L); r.tunedAm = pitch((await one("tunedAm", "tuned", { tk: 21 })).L);
  r.pop = pitch((await one("pop", "pop")).L);
  r.peak = Math.max(...peaks);
  return r;
};
/* AOG-VOCAL-TUNE-V2: Tune measured on pretend singers (made here, 48 kHz: a voice's harmonics shaped by a vowel, a little
   jitter), through the booth's own engine (AOGVocal.tune, the Worker) and the desk's old dmTune for the same voice */
const TUNETEST = async () => {
  const sr = 48000, V = AOGVocal, hz = m => 440 * 2 ** ((m - 69) / 12), C = 0;
  const voice = (dur, fn, F = [700, 1200, 2600], weak = false, seed = 3) => { let s = seed; const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 * 2 - 1; };
    const n = Math.round(dur * sr), x = new Float32Array(n); let ph = 0, jit = 0, on = 0;
    for (let i = 0; i < n; i++) { const t = i / sr, m = fn(t); if (m == null) { on = 0; continue; } on = Math.min(1, on + 1 / (0.01 * sr)); jit += 0.002 * (rnd() - jit * 0.05);
      const f = hz(m) * (1 + 0.002 * jit); ph += 2 * Math.PI * f / sr; let v = 0;
      for (let k = 1; k * f < 5000; k++) { const fk = k * f; let g = 0.15 / k; F.forEach((fc, q) => { g += (q ? 0.5 : 1) / (1 + ((fk - fc) / (80 + fc * 0.08)) ** 2); }); if (weak && k === 1) g *= 0.1; v += g * Math.sin(k * ph); }
      x[i] = 0.12 * v * on; }
    return x; };
  /* the pitch every few ms (YIN, 20 ms) in midi, null where there is no note; lo–hi Hz is where to look */
  const track = (x, hop = 0.005, lo = 120, hi = 500) => { const N = Math.round(0.02 * sr), H = Math.round(hop * sr), tmin = Math.floor(sr / hi), tmax = Math.ceil(sr / lo), out = [], d = new Float64Array(tmax + 2), raw = new Float64Array(tmax + 2);
    let em = 0; for (let i = 0; i + N < x.length; i += H) { let e = 0; for (let j = 0; j < N; j++) e += x[i + j] * x[i + j]; if (e > em) em = e; }
    for (let i = 0; i + N + tmax + 2 < x.length; i += H) { let e = 0; for (let j = 0; j < N; j++) e += x[i + j] * x[i + j]; if (e < 0.05 * em) { out.push(null); continue; }
      let run = 0; d[0] = 1; for (let t = 1; t <= tmax + 1; t++) { let s = 0; for (let j = 0; j < N; j++) { const v = x[i + j] - x[i + j + t]; s += v * v; } raw[t] = s; run += s; d[t] = s * t / run; }
      let tau = -1; for (let t = tmin; t <= tmax; t++) if (d[t] < 0.15) { while (t + 1 <= tmax && d[t + 1] < d[t]) t++; tau = t; break; }
      if (tau < 0) { out.push(null); continue; }
      const y0 = raw[tau - 1], y1 = raw[tau], y2 = raw[tau + 1], den = y0 - 2 * y1 + y2; out.push(69 + 12 * Math.log2(sr / (tau + (den > 0 ? 0.5 * (y0 - y2) / den : 0)) / 440)); }
    return out; };
  const at = (tr, a, b, hop = 0.005) => tr.slice(Math.round(a / hop), Math.round(b / hop)).filter(v => v != null);
  const mean = v => v.reduce((p, q) => p + q, 0) / v.length, sd = v => { const m = mean(v); return Math.sqrt(mean(v.map(q => (q - m) ** 2))); };
  const jump = x => { let m = 0; for (let i = 1; i < x.length; i++) m = Math.max(m, Math.abs(x[i] - x[i - 1])); return m; };
  /* where each note starts: the level over 10 ms (read every 1 ms) first passing a tenth of the loudest, at least 0.5 s apart */
  const onsets = x => { const S = Math.round(0.001 * sr), Wn = Math.round(0.01 * sr), e = []; for (let i = 0; i + Wn <= x.length; i += S) { let s = 0; for (let j = 0; j < Wn; j++) s += x[i + j] * x[i + j]; e.push(s); }
    const m = Math.max(...e), o = []; for (let i = 1; i < e.length; i++) if (e[i] > 0.1 * m && e[i - 1] <= 0.1 * m && (!o.length || i * S - o[o.length - 1] > 0.5 * sr)) o.push(i * S); return o; };
  const NAT = {}, HARD = { spd: 100, vib: 0 }, r = {};
  /* 1 · four notes sung a little off (flat and sharp), each with a 5.5 Hz vibrato of ±30 cents, in C major */
  const NOTES = [[57, -0.30], [60, 0.35], [52, -0.40], [67, 0.25]], L = 1.2, G = 0.25;
  const L0 = 0.15, x1 = voice(L0 + NOTES.length * (L + G) + 0.2, t => { if (t < L0) return null; const k = Math.floor((t - L0) / (L + G)), u = t - L0 - k * (L + G); if (k >= NOTES.length || u >= L) return null; return NOTES[k][0] + NOTES[k][1] + 0.3 * Math.sin(2 * Math.PI * 5.5 * t); });
  const n1 = await V.tune(x1, sr, NAT), h1 = await V.tune(x1, sr, HARD);
  const per = (y, lo, hi) => { const tr = track(y, 0.005, lo, hi); return NOTES.map((nt, k) => { const a = L0 + k * (L + G) + 0.25, v = at(tr, a, a + L - 0.4); return { dev: (mean(v) - nt[0]) * 100, sd: sd(v) * 100 }; }); };
  const dT = per(x1, 120, 450), nT = per(n1.x, 120, 450), hT = per(h1.x, 120, 450);
  r.offkey = NOTES.map((nt, k) => ({ note: nt[0], sung: Math.round(nt[1] * 100), dry: dT[k], nat: nT[k], hard: hT[k] }));
  r.offkeyLen = [n1.x.length, h1.x.length, x1.length];
  const oD = onsets(x1), oN = onsets(n1.x), oH = onsets(h1.x);
  r.timing = { dry: oD.length, n: oN.length, h: oH.length, worst: Math.max(...oD.map((o, i) => Math.max(Math.abs(o - (oN[i] || 0)), Math.abs(o - (oH[i] || 0))))) / sr * 1000 };
  r.jumps = { dry: jump(x1), nat: jump(n1.x), hard: jump(h1.x) };
  /* 2 · held near the halfway point: between A and B♭ with All notes (48 cents up), and between A and B in C major (97 cents up), a slow drift of a few cents and vibrato */
  const mid1 = voice(3, t => 57.48 + 0.08 * Math.sin(2 * Math.PI * 0.3 * t) + 0.3 * Math.sin(2 * Math.PI * 5.5 * t));
  const mid2 = voice(3, t => 57.97 + 0.06 * Math.sin(2 * Math.PI * 0.3 * t + 1) + 0.3 * Math.sin(2 * Math.PI * 5.5 * t));
  const m1n = await V.tune(mid1, sr, { tk: -2, plan: 1 }), m1h = await V.tune(mid1, sr, { tk: -2, spd: 100, vib: 0, plan: 1 }), m2n = await V.tune(mid2, sr, { plan: 1 }), m2h = await V.tune(mid2, sr, { spd: 100, vib: 0, plan: 1 });
  const flips = t => { let c = 0; const v = t.tg.filter((g, i) => t.v[i]); for (let i = 1; i < v.length; i++) if (v[i] !== v[i - 1]) c++; return c; };
  const hm = at(track(m1h.x), 0.1, 2.8);
  r.mid = { all: [m1n.t.changes, m1h.t.changes, flips(m1n.t), flips(m1h.t)], major: [m2n.t.changes, m2h.t.changes, flips(m2n.t), flips(m2h.t)], hardSpan: (Math.max(...hm) - Math.min(...hm)) * 100 };
  /* 3 · a slide: A3 held, 150 ms up to B3, held (both 20 cents flat) */
  const sl = voice(1.6, t => t < 0.6 ? 56.8 : t < 0.75 ? 56.8 + 2 * (t - 0.6) / 0.15 : 58.8);
  const sN = await V.tune(sl, sr, NAT), sH = await V.tune(sl, sr, HARD), slide = y => { const tr = track(y, 0.0025); let between = 0, over = 0, back = 0, top = -1e9;
    tr.forEach((v, i) => { if (v == null) return; const ti = i * 0.0025; if (ti > 0.4 && ti < 1.0 && v > 57.25 && v < 58.6) between++; if (v > 59.15) over++; if (ti > 0.55 && ti < 1.0) { if (v < top - 0.05) back++; top = Math.max(top, v); } });
    return { ms: between * 2.5, over, back, a: (mean(at(tr, 0.15, 0.5, 0.0025)) - 57) * 100, b: (mean(at(tr, 1.05, 1.45, 0.0025)) - 59) * 100 }; };
  r.slide = { nat: slide(sN.x), hard: slide(sH.x), dry: slide(sl), changes: [sN.t.changes, sH.t.changes] };
  /* 4 · an s and a breath between two notes: their sound (a spectrum of 1024-point frames) against the dry */
  const xs = voice(2.4, t => (t < 0.5 || (t > 1.2 && t < 1.7)) ? 56.7 + 0.3 * Math.sin(2 * Math.PI * 5.5 * t) : null);
  { let seed = 7, prev = 0, lp = 0; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
    for (let i = 0; i < xs.length; i++) { const t = i / sr; if (t > 0.52 && t < 0.64) { const q = rnd(), hi = q - prev; prev = q; xs[i] += 0.12 * hi * Math.min(1, (t - 0.52) / 0.005, (0.64 - t) / 0.005); }
      if (t > 0.75 && t < 1.1) { lp += 0.15 * (rnd() - lp); xs[i] += 0.05 * lp * Math.sin(Math.PI * (t - 0.75) / 0.35); } } }
  const fft = (re, im) => { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len; for (let i = 0; i < n; i += len) for (let k = 0; k < len / 2; k++) { const c = Math.cos(a * k), s = Math.sin(a * k), ur = re[i + k], ui = im[i + k], vr = re[i + k + len / 2] * c - im[i + k + len / 2] * s, vi = re[i + k + len / 2] * s + im[i + k + len / 2] * c; re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi; } } };
  const spec = (y, a, b) => { const N = 1024, acc = new Float64Array(N / 2); for (let s = Math.round(a * sr); s + N <= Math.round(b * sr); s += N / 2) { const re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < N; i++) re[i] = y[s + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)); fft(re, im); for (let k = 0; k < N / 2; k++) acc[k] += re[k] * re[k] + im[k] * im[k]; } return acc; };
  const bandsDiff = (y, a, b) => { const A = spec(xs, a, b), Bs = spec(y, a, b); let worst = 0; for (let f = 250; f < 16000; f *= 2 ** (1 / 3)) { const k0 = Math.round(f / sr * 1024), k1 = Math.max(k0 + 1, Math.round(f * 2 ** (1 / 3) / sr * 1024)); let ea = 0, eb = 0; for (let k = k0; k < k1; k++) { ea += A[k]; eb += Bs[k]; } if (ea > 1e-12) worst = Math.max(worst, Math.abs(10 * Math.log10((eb + 1e-20) / ea))); } return worst; };
  const xsN = await V.tune(xs, sr, NAT), xsH = await V.tune(xs, sr, HARD);
  r.unvoiced = { s: [bandsDiff(xsN.x, 0.53, 0.63), bandsDiff(xsH.x, 0.53, 0.63)], breath: [bandsDiff(xsN.x, 0.78, 1.08), bandsDiff(xsH.x, 0.78, 1.08)], len: xsN.x.length === xs.length && xsH.x.length === xs.length };
  r.jumps.s = [jump(xs), jump(xsN.x), jump(xsH.x)];
  /* 5 · voices low and high: a bass with a weak fundamental (G2), and a soprano (C6), each 32 cents flat, Hard */
  r.range = [];
  for (const [nm, base, lo, hi, F, weak] of [["bass G2", 43, 70, 200, [400, 900, 2400], true], ["soprano C6", 84, 800, 1300, [1000, 1400, 3000], false]]) {
    const x = voice(1.6, t => base - 0.32 + 0.3 * Math.sin(2 * Math.PI * 5.5 * t), F, weak), y = (await V.tune(x, sr, HARD)).x, v = at(track(y, 0.005, lo, hi), 0.2, 1.4);
    r.range.push({ nm, dev: (mean(v) - base) * 100, sd: sd(v) * 100 }); }
  /* 6 · warble: a held note, 42 cents flat of A3, as a person holds it (a slow wander of a few cents, a little breath), plain
     and with a 25-cent vibrato, in C major and with All notes; the frame-to-frame jitter of the pitch (cents, 5 ms frames):
     Robot's output should be flat, so all its jitter is warble; Tuned keeps the singer's own movement, so its warble is the
     jitter it adds (its pitch minus the singer's). New against the desk's old dmTune, as the booth used it (Tuned 85/65, Robot 100/100) */
  const w = await window.parent.AOGStudioShell.desk(), old = async (x, amt, spd, key) => { const ab = new w.AudioBuffer({ numberOfChannels: 1, length: x.length, sampleRate: sr }); ab.copyToChannel(new w.Float32Array(x), 0);
    return new Float32Array((await w.__aogStudio.dmTune(ab, { amt, spd, key, minor: false }, () => false)).getChannelData(0)); };
  const trk = y => track(y).slice(60, 380), jitOf = v => { let s = 0, k = 0; for (let i = 1; i < v.length; i++) if (v[i] != null && v[i - 1] != null) { s += ((v[i] - v[i - 1]) * 100) ** 2; k++; } return Math.sqrt(s / k); };
  let wd = 0, ws = 11; const wr = () => { ws = (ws * 1664525 + 1013904223) >>> 0; return ws / 4294967296 * 2 - 1; }, wander = new Float32Array(2300); for (let i = 0; i < 2300; i++) { wd += 0.02 * wr() - 0.01 * wd; wander[i] = wd; }
  r.warble = [];
  for (const vd of [0, 0.25]) {
    const held = voice(2.2, t => 57 - 0.42 + 0.5 * wander[Math.min(2299, Math.floor(t * 1000))] + vd * Math.sin(2 * Math.PI * 5.5 * t));
    { let s = 5, lp = 0; for (let i = 0; i < held.length; i++) { s = (s * 1664525 + 1013904223) >>> 0; lp += 0.3 * (s / 4294967296 * 2 - 1 - lp); held[i] += 0.02 * lp; } }   /* breath */
    const d = trk(held), added = y => { const a = trk(y); return jitOf(a.map((v, i) => v != null && d[i] != null ? v - d[i] : null)); };
    for (const [kn, key, tk] of [["C major", 0, -1], ["All notes", -1, -2]]) {
      const oT = await old(held, 85, 65, key), oR = await old(held, 100, 100, key), nT = (await V.tune(held, sr, { tk })).x, nR = (await V.tune(held, sr, { tk, spd: 100, vib: 0 })).x;
      r.warble.push({ what: (vd ? "vibrato" : "plain") + ", " + kn, dry: jitOf(d), tunedOld: added(oT), tunedNew: added(nT), robotOld: jitOf(trk(oR)), robotNew: jitOf(trk(nR)) }); } }
  /* and a perfectly steady pretend tone (no person holds a note this still), for the report */
  { const pure = voice(2.2, t => 57 - 0.35); r.pure = { dry: jitOf(trk(pure)), robotOld: jitOf(trk(await old(pure, 100, 100, 0))), robotNew: jitOf(trk((await V.tune(pure, sr, HARD)).x)) }; }
  /* the old path on the off-key voices too, for the report */
  { const ab = new w.AudioBuffer({ numberOfChannels: 1, length: x1.length, sampleRate: sr }); ab.copyToChannel(new w.Float32Array(x1), 0);
    const o = new Float32Array((await w.__aogStudio.dmTune(ab, { amt: 100, spd: 100, key: C, minor: false }, () => false)).getChannelData(0)); r.offkeyOld = per(o, 120, 450); }
  /* 7 · speed: one minute of singing (eight notes over and over) */
  const ns = [57, 59, 60, 62, 64, 62, 60, 59], x4 = voice(4, t => { const k = Math.floor(t / 0.5), u = t % 0.5; return u > 0.42 ? null : ns[k % 8] + 0.25 * Math.sin(k) + 0.3 * Math.sin(2 * Math.PI * 5.5 * t); });
  const x60 = new Float32Array(15 * x4.length); for (let k = 0; k < 15; k++) x60.set(x4, k * x4.length);   /* 4 s, 15 times over */
  const t0 = performance.now(); const y60 = await V.tune(x60, sr, NAT); r.minute = { ms: performance.now() - t0, same: y60.x.length === x60.length, notes: y60.t.notes };
  return r;
};
async function routes(ctx, lang) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  await ctx.addInitScript(l => { try { if (!sessionStorage.getItem("t")) { localStorage.clear(); sessionStorage.setItem("t", "1"); } localStorage.setItem("aog.lang", l); } catch (e) {} }, lang);
}
async function loopOnMyTrack(p) {
  await p.evaluate(() => AOGStudioShell.go("pads")); await W(3500);
  const f = p.frames().find(x => /music-pads/.test(x.url()));
  await f.waitForFunction(() => document.querySelectorAll("#grpSel option").length > 3, null, { timeout: 30000 });
  await f.evaluate(async () => { startBeat("boombap"); document.getElementById("bounceBtn").click(); for (let i = 0; i < 120 && document.getElementById("bounceAct").hidden; i++) await new Promise(r => setTimeout(r, 250)); document.getElementById("bStudio").click(); });
  await W(2500);
}
const gums = p => Promise.all(p.frames().map(f => f.evaluate(() => window.__gum || 0).catch(() => 0))).then(a => a.reduce((x, y) => x + y, 0));
const desk = p => p.frames().find(x => /music-studio/.test(x.url()));
async function booth(p) { for (let i = 0; i < 80; i++) { const f = p.frames().find(x => /music-vocal/.test(x.url())); if (f && await f.evaluate(() => !!window.AOGVocal && !!document.getElementById("vbRec")).catch(() => false)) return f; await W(250); } return null; }
const ST = f => f.evaluate(() => AOGVocal.state());
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--use-file-for-fake-audio-capture=" + VOICE] });
  for (const [nm, o, lang, from, recMs] of [
    ["iPhone", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, "es", 1, 6500],
    ["iPad", { viewport: { width: 1180, height: 820 }, hasTouch: true }, "en", 3, 14000]]) {
    const ctx = await b.newContext({ ...o, serviceWorkers: "block" }); const errs = [];
    ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
    await routes(ctx, lang); await ctx.addInitScript(COUNT);
    if (from > 1) await ctx.addInitScript(f => { try { localStorage.setItem("aog.overdub.v1", JSON.stringify({ on: true, from: f })); } catch (e) {} }, from);
    const p = await ctx.newPage(); await p.goto(U + "the-studio#piano"); await W(4000);
    /* 1 · the door, eighth of nine; no booth code and no 🎤 key */
    const doors = await p.evaluate(() => { const ds = [...document.querySelectorAll(".sh-doors [data-room], .sh-doors a")].map(e => e.getAttribute("data-room") || (e.getAttribute("href") || "").replace(/^.*#/, ""));
      return { ds: ds.filter((x, i) => x && ds.indexOf(x) === i), key: !!document.getElementById("shMic"), loaded: !!document.querySelector('script[src*="aog-micbooth"],script[src*="aog-vocal"]') }; });
    ok(doors.ds.join(" ") === "pads kit piano guitar bass band decks vocal studio" && !doors.key && !doors.loaded, `${nm}: the Vocal Booth is the eighth door of nine, before the Mixing Desk; no 🎤 key; nothing fetched for it: ${JSON.stringify(doors)}`);
    await loopOnMyTrack(p);
    await p.evaluate(() => AOGSong.set({ key: 0, minor: false }));   /* C major: A is a note of the key */
    await p.evaluate(() => AOGStudioShell.go("vocal"));
    const f = await booth(p);
    ok(!!f, `${nm}: the Vocal Booth opens`);
    if (!f) { await ctx.close(); continue; }
    await f.waitForFunction(() => AOGVocal.state().bk, null, { timeout: 40000 }).catch(() => {});
    let s = await ST(f);
    const lay = await f.evaluate(() => { const r = e => e.getBoundingClientRect(), bs = [...document.querySelectorAll("button,select,summary,label.vb-mon")].filter(x => x.offsetParent);
      return { sw: document.scrollingElement.scrollWidth, iw: innerWidth, small: bs.filter(x => r(x).height < 44).map(x => x.id || x.className || x.textContent), out: bs.filter(x => r(x).right > innerWidth + 1).map(x => x.id || x.className),
        help: document.getElementById("vbHelp").textContent, helpShown: !document.getElementById("vbHelp").hidden, rec: document.getElementById("vbRec").textContent.trim(), right: !document.getElementById("vbRight").hidden }; });
    ok(lay.sw <= lay.iw && !lay.small.length && !lay.out.length && lay.helpShown && /Headphones help|Los audífonos ayudan/.test(lay.help) && (lang === "es" ? /Grabar/ : /Record/).test(lay.rec) && !lay.right,
      `${nm}: the booth fits, every key 44px+, the headphones line shows, Record first and nothing else until there is a take: ${JSON.stringify(lay)}`);
    ok(s.bk && s.bk.loop && (await gums(p)) === 0 && !s.mic && !s.raf && s.ac == null, `${nm}: My Track is ready (${JSON.stringify(s.bk)}); no microphone asked for, no sound engine made, the meter still; "${s.line}"`);
    let pc = await f.evaluate(`(${PROBE})()`), pk = await f.evaluate(`(${CALM})()`);
    ok(!pc.length && !pk.length, `${nm}: the booth reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    /* 2 · Record, Stop */
    await f.click("#vbRec");
    await f.waitForFunction(() => AOGVocal.state().state === "rec", null, { timeout: 15000 });
    const t0 = Date.now();
    const seen = new Set(); for (let i = 0; i < 12; i++) { await W(150); seen.add(await f.evaluate(() => document.getElementById("vbIn").style.transform)); }
    s = await ST(f);
    ok(s.mic && s.raf && s.ac === "running" && (await gums(p)) === 1 && seen.size >= 3, `${nm}: ● Record asked once and records; the meter moves while recording (${seen.size} levels); "${s.line}"`);
    await W(Math.max(0, recMs - (Date.now() - t0)));
    const wall = (Date.now() - t0) / 1000;
    await f.click("#vbRec");
    await f.waitForFunction(() => AOGVocal.state().takes === 1 && AOGVocal.state().state === "idle", null, { timeout: 15000 });
    s = await ST(f);
    const ended = await p.evaluate(() => [window].concat([...document.querySelectorAll("iframe")].map(x => x.contentWindow)).every(w => { try { return (w.__streams || []).every(x => x.getTracks().every(t => t.readyState === "ended")); } catch (e) { return true; } }));   /* the Studio asks (AOG-VOCAL-MIC-V4), so its stream may live in the Studio's window */
    const still = await f.evaluate(() => document.getElementById("vbIn").style.transform);
    ok(s.take && Math.abs(s.take.body - wall) < 1.3 && s.take.head >= 0 && s.take.head <= 0.26 && s.take.from === from && !s.mic && !ended && s.armed && !s.raf && /scaleX\(0\)/.test(still),
      `${nm}: ■ Stop ends the recording (the microphone stays ready for the next take) and makes a take of the right length (${wall.toFixed(2)} s recorded): ${JSON.stringify(s.take)}`);
    const stopAt = Date.now();   /* when the microphone began its 2 minutes of staying ready */
    /* 3 · the sounds, measured */
    const R = await f.evaluate(MEASURE);
    ok(R.peak > 0.05 && R.peak <= 0.892, `${nm}: every sound renders, none past −1 dB (loudest peak ${R.peak.toFixed(3)})`);
    ok(R.phone.low < 0.12 && R.phone.low < R.clean.low / 3, `${nm}: Phone has little energy below 250 Hz (${(R.phone.low * 100).toFixed(1)}% against Clean's ${(R.clean.low * 100).toFixed(1)}%)`);
    ok(R.echo.gap > 3 * R.clean.gap && R.echo.gap > 0.02, `${nm}: Echo has delayed copies in the gaps (${(R.echo.gap * 100).toFixed(1)}% against Clean's ${(R.clean.gap * 100).toFixed(1)}%)`);
    ok(R.dryHz > 222 && Math.abs(R.tuned.hz - 220) < 0.5 * Math.abs(R.dryHz - 220), `${nm}: Tuned pulls the voice toward A (220 Hz): ${R.dryHz.toFixed(1)} Hz → ${R.tuned.hz.toFixed(1)} Hz`);
    ok(Math.abs(R.robot.hz - 220) <= Math.abs(R.tuned.hz - 220) + 0.3, `${nm}: Robot pulls it at least as hard: ${R.robot.hz.toFixed(1)} Hz`);
    ok(R.air.high > 1.5 * R.clean.high && R.clean.high > 0.0005, `${nm}: Air adds highs above 6 kHz (${(R.air.high * 100).toFixed(2)}% against ${(R.clean.high * 100).toFixed(2)}%)`);
    ok(R.ss.on < 0.7 * R.ss.off, `${nm}: Soft S calms the sharp s (above 5 kHz: ${(R.ss.on * 100).toFixed(2)}% at full against ${(R.ss.off * 100).toFixed(2)}% off)`);
    ok(R.lc.low < R.clean.low / 2, `${nm}: Low cut takes lows away (${(R.lc.low * 100).toFixed(1)}% below 250 Hz against ${(R.clean.low * 100).toFixed(1)}%)`);
    ok(R.dbl.side > 4 * R.clean.side + 0.005, `${nm}: Double spreads the voice left and right (side ${(R.dbl.side * 100).toFixed(2)}% against ${(R.clean.side * 100).toFixed(2)}%)`);
    ok(R.hall.after > 2 * R.clean.after, `${nm}: Big hall rings on after the voice (${(R.hall.after * 100).toFixed(2)}% against ${(R.clean.after * 100).toFixed(2)}%)`);
    /* AOG-VOCAL-FX-V2: the More sounds, measured on the same pretend voice */
    const semi = hz => 12 * Math.log2(hz / R.dryHz), sameOn = (a, b) => { a = a.filter(t => t > 0.1); b = b.filter(t => t > 0.1); return a.length === b.length && a.length >= 2 && a.every((t, i) => Math.abs(t - b[i]) < 0.02); };   /* a line cut by the take's start is left out */
    ok(Math.abs(semi(R.deep.hz) + 5) < 0.15 && R.deep.wob < 5 && R.deep.len === R.clean.len && sameOn(R.deep.on, R.clean.on),
      `${nm}: Deep moves the voice 5 notes down (${R.dryHz.toFixed(1)} Hz → ${R.deep.hz.toFixed(1)} Hz, ${semi(R.deep.hz).toFixed(2)} semitones, steady: ${R.deep.wob.toFixed(1)} cents) and keeps its length and timing (${R.deep.len} samples, lines at ${R.deep.on.map(t => t.toFixed(2)).join(" ")} s)`);
    ok(Math.abs(semi(R.high.hz) - 5) < 0.15 && R.high.wob < 5 && R.high.len === R.clean.len && sameOn(R.high.on, R.clean.on),
      `${nm}: High moves it 5 notes up (${R.high.hz.toFixed(1)} Hz, ${semi(R.high.hz).toFixed(2)} semitones, steady: ${R.high.wob.toFixed(1)} cents), the same length and timing`);
    ok(Math.abs(semi(R.p3.hz) - 3) < 0.15, `${nm}: the Pitch control at +3 moves it 3 notes up (${R.p3.hz.toFixed(1)} Hz, ${semi(R.p3.hz).toFixed(2)} semitones)`);
    ok(R.harm.third > 0.05 && R.harm.third > 20 * R.harm.clean && R.harm.third > 4 * R.harm.major && R.harm.fifth > 0.05,
      `${nm}: Harmony adds a voice a third up in C major (A → C: ${(R.harm.third * 100).toFixed(1)}% of the lead at ${(R.dryHz * 2 ** 0.25).toFixed(1)} Hz, the major third ${(R.harm.major * 100).toFixed(2)}%, Clean ${(R.harm.clean * 100).toFixed(3)}%); a fifth up when chosen (${(R.harm.fifth * 100).toFixed(1)}%)`);
    ok(R.mega.low < R.clean.low / 3 && R.mega.high < R.clean.high / 3 && R.mega.adds > 10 * R.mega.adds0 && R.mega.adds > 0.0005,
      `${nm}: Megaphone limits the band (below 250 Hz ${(R.mega.low * 100).toFixed(2)}%, above 6 kHz ${(R.mega.high * 100).toFixed(2)}%) and adds harmonics the voice did not have (above 4.6 kHz ${(R.mega.adds * 100).toFixed(3)}% against ${(R.mega.adds0 * 100).toFixed(4)}% without Grit)`);
    ok(R.grit.adds > 10 * R.grit.clean && R.grit.adds > 0.0005, `${nm}: Grit adds harmonics on any sound (Clean with Grit 80: ${(R.grit.adds * 100).toFixed(3)}% above 4.6 kHz against ${(R.grit.clean * 100).toFixed(4)}%)`);
    ok(R.slap.lag >= 0.09 && R.slap.lag <= 0.12 && R.slap.after < 0.02 && R.slap.share > 0.05,
      `${nm}: Slapback adds one echo ${(R.slap.lag * 1000).toFixed(0)} ms late (${(R.slap.share * 100).toFixed(1)}% as loud as the voice) and no second one (${(R.slap.after * 100).toFixed(2)}% after it)`);
    ok(R.chop.shut < 0.03 && R.chop.other > 0.2, `${nm}: Chop opens and shuts on the song's sixteenths (${R.chop.bpm} bpm, every ${(R.chop.step * 1000).toFixed(0)} ms from the take's bar): the shut parts ${(R.chop.shut * 100).toFixed(2)}% of the open ones; on a grid 12 bpm faster, ${(R.chop.other * 100).toFixed(0)}%`);
    ok(R.ghost.pre > 0.02 && R.ghost.pre > 8 * R.ghost.clean, `${nm}: Ghost swells in before each line (the 0.3 s before: ${(R.ghost.pre * 100).toFixed(1)}% of the line, against Clean's ${(R.ghost.clean * 100).toFixed(2)}%)`);
    ok(R.old.high < R.clean.high / 4 && R.old.low < R.clean.low / 2 + 1e-4 && R.old.wow > 3 && R.old.wow < 40 && R.old.wow > 3 * R.old.cleanWow + 1 && R.old.gap < 0.03,
      `${nm}: Old record is band-limited (above 6 kHz ${(R.old.high * 100).toFixed(2)}% against ${(R.clean.high * 100).toFixed(2)}%), with a soft wow (${R.old.wow.toFixed(1)} cents against ${R.old.cleanWow.toFixed(1)}) and a quiet crackle (${(R.old.gap * 100).toFixed(2)}% in the gaps)`);
    ok(R.wide.side > 1.5 * R.dbl.side, `${nm}: Wide spreads the voice wider than Double (side ${(R.wide.side * 100).toFixed(1)}% against ${(R.dbl.side * 100).toFixed(1)}%)`);
    /* AOG-VOCAL-TUNE-V2: the Key choice and Pop polish on the recorded voice */
    ok(Math.abs(R.tunedAb - 440 * 2 ** (-11 / 12)) < 1.2 && Math.abs(R.tunedAm - 220) < 1, `${nm}: Key picks the notes: in A♭ major (no A) the voice goes up to B♭ (${R.tunedAb.toFixed(1)} Hz; B♭ is 233.1), in A minor to A (${R.tunedAm.toFixed(1)} Hz)`);
    ok(Math.abs(R.pop - 220) < 1.5, `${nm}: Pop polish tunes it to A as well (${R.pop.toFixed(1)} Hz)`);
    if (nm === "iPad") {   /* the pretend singers, measured once */
      const TT = await f.evaluate(TUNETEST), c1 = v => v.toFixed(1), sg = v => (v > 0 ? "+" : "") + c1(v);
      ok(TT.offkey.every(o => Math.abs(o.nat.dev) <= 5 && o.nat.sd >= 0.7 * o.dry.sd && o.nat.sd <= 1.3 * o.dry.sd),
        `Tuned (natural) puts each note's centre on the scale note and keeps the vibrato: ` + TT.offkey.map(o => `${o.note}${o.sung > 0 ? "+" : ""}${o.sung}c → ${sg(o.nat.dev)}c, vibrato ${c1(o.nat.sd)} of ${c1(o.dry.sd)}c`).join("; "));
      ok(TT.offkey.every(o => Math.abs(o.hard.dev) <= 3 && o.hard.sd < 5 && o.hard.sd < 0.25 * o.dry.sd),
        `Hard (Robot's speed) lands within 3 cents with no vibrato left: ` + TT.offkey.map(o => `${sg(o.hard.dev)}c, wobble ${c1(o.hard.sd)}c`).join("; ") + ` (the old dmTune at full: ` + TT.offkeyOld.map(o => `${sg(o.dev)}c, wobble ${c1(o.sd)}c`).join("; ") + `)`);
      ok(TT.offkeyLen[0] === TT.offkeyLen[2] && TT.offkeyLen[1] === TT.offkeyLen[2] && TT.timing.dry === 4 && TT.timing.n === 4 && TT.timing.h === 4 && TT.timing.worst <= 3 && TT.unvoiced.len && TT.minute.same,
        `Tune keeps the take's length to the sample and each note starts where it did (worst ${TT.timing.worst.toFixed(1)} ms): ${JSON.stringify(TT.timing)}`);
      ok(TT.jumps.nat <= 1.15 * TT.jumps.dry && TT.jumps.hard <= 1.15 * TT.jumps.dry && TT.jumps.s[1] <= 1.15 * TT.jumps.s[0] && TT.jumps.s[2] <= 1.15 * TT.jumps.s[0],
        `no clicks: the largest step from one sample to the next ${TT.jumps.nat.toFixed(4)} (natural) and ${TT.jumps.hard.toFixed(4)} (hard) against the dry's ${TT.jumps.dry.toFixed(4)}; with an s and a breath ${TT.jumps.s.map(v => v.toFixed(4)).join(" / ")}`);
      ok(TT.mid.all.every(v => v === 0) && TT.mid.major.every(v => v === 0) && TT.mid.hardSpan < 20,
        `held near halfway between two notes, the target never flips (All notes, 48 cents up: ${TT.mid.all.join(" ")}; C major, 97 cents up: ${TT.mid.major.join(" ")}; changes and flips, natural and hard); hard stays on one note (span ${c1(TT.mid.hardSpan)} cents)`);
      ok(TT.slide.hard.ms <= 25 && Math.abs(TT.slide.hard.a) <= 3 && Math.abs(TT.slide.hard.b) <= 3 && TT.slide.changes[1] === 1,
        `a slide from A to B: Hard makes one clean step (${TT.slide.hard.ms} ms between the notes, A ${sg(TT.slide.hard.a)}c, B ${sg(TT.slide.hard.b)}c; the singer's slide took ${TT.slide.dry.ms} ms)`);
      ok(TT.slide.nat.ms >= 60 && TT.slide.nat.over === 0 && TT.slide.nat.back === 0 && Math.abs(TT.slide.nat.a) <= 5 && Math.abs(TT.slide.nat.b) <= 5 && TT.slide.changes[0] === 1,
        `the same slide, natural: a smooth glide (${TT.slide.nat.ms} ms between the notes, never past B, never back down; A ${sg(TT.slide.nat.a)}c, B ${sg(TT.slide.nat.b)}c)`);
      ok(TT.unvoiced.s.every(v => v < 0.5) && TT.unvoiced.breath.every(v => v < 0.5),
        `an s and a breath are left as they were (their spectrum against the dry, worst third-octave band: s ${TT.unvoiced.s.map(v => v.toFixed(2)).join(" / ")} dB, breath ${TT.unvoiced.breath.map(v => v.toFixed(2)).join(" / ")} dB)`);
      ok(TT.range.every(o => Math.abs(o.dev) <= 3 && o.sd < 6), `low and high voices are found and tuned: ` + TT.range.map(o => `${o.nm} ${sg(o.dev)}c, wobble ${c1(o.sd)}c`).join("; "));
      ok(TT.warble.length === 4 && TT.warble.every(o => o.tunedNew < o.tunedOld && o.robotNew < o.robotOld),
        `less warble than the old dmTune on a held note (pitch jitter frame to frame, cents; new against old): ` + TT.warble.map(o => `${o.what}: Tuned adds ${o.tunedNew.toFixed(2)} against ${o.tunedOld.toFixed(2)}, Robot ${o.robotNew.toFixed(2)} against ${o.robotOld.toFixed(2)} (the singer ${o.dry.toFixed(2)})`).join("; ") +
        `; a perfectly steady pretend tone: Robot ${TT.pure.robotNew.toFixed(2)} against ${TT.pure.robotOld.toFixed(2)} (dry ${TT.pure.dry.toFixed(2)}), both far below hearing`);
      ok(TT.minute.ms <= 3000, `a minute of singing is tuned in ${(TT.minute.ms / 1000).toFixed(2)} s, in the Worker (${TT.minute.notes} notes)`);
    }
    /* AOG-VOCAL-TUNE-V2: Key, Tune speed and Keep my vibrato in Shape your voice; their words in both languages; Making the sound… */
    await f.evaluate(() => { document.getElementById("vbShape").open = true; });
    await f.click('.vb-snd[data-snd="tuned"]'); await W(300);
    const tunedLine = (await ST(f)).line;
    const kk = await f.evaluate(() => { const r = e => e.getBoundingClientRect(), k = document.getElementById("vbKey"), ck = document.querySelector('.vb-chk input[data-k="vib"]'), sp = document.querySelector('.vb-r[data-k="spd"]');
      const words = () => ({ t: document.querySelector('[data-t="tk"]').textContent, o: [...k.options].map(o => o.textContent), g: [...k.querySelectorAll("optgroup")].map(g => g.label), v: document.querySelector('[data-t="vib"]').textContent, s: document.querySelector('[data-t="spd"]').textContent });
      const here = words(), lang = document.documentElement.getAttribute("lang") || "en";
      document.documentElement.setAttribute("lang", lang.indexOf("es") === 0 ? "en" : "es");
      return new Promise(done => setTimeout(() => { const other = words(); document.documentElement.setAttribute("lang", lang);
        setTimeout(() => done({ here, other, lang, h: r(k).height, ck: r(ck.closest(".vb-ck")).height, vib: ck.checked, spd: +sp.value, val: k.value, sw: document.scrollingElement.scrollWidth, iw: innerWidth, right: r(k).right }), 60); }, 60)); });
    const EN = { t: "Key", o0: "Song's key: C major", o1: "All notes", o2: "C major", o10: "A♭ major", o14: "C minor", g: "Major keys,Minor keys", v: "Keep my vibrato", s: "Tune speed" },
      ES = { t: "Tonalidad", o0: "Tonalidad de la canción: Do mayor", o1: "Todas las notas", o2: "Do mayor", o10: "La♭ mayor", o14: "Do menor", g: "Tonalidades mayores,Tonalidades menores", v: "Mantener mi vibrato", s: "Velocidad de afinado" };
    const wordsOk = (w, X) => w.t === X.t && w.o.length === 26 && w.o[0] === X.o0 && w.o[1] === X.o1 && w.o[2] === X.o2 && w.o[10] === X.o10 && w.o[14] === X.o14 && w.g.join() === X.g && w.v === X.v && w.s === X.s;
    const mine = lang === "es" ? ES : EN, theirs = lang === "es" ? EN : ES;
    ok(wordsOk(kk.here, mine) && wordsOk(kk.other, theirs) && kk.h >= 44 && kk.ck >= 44 && kk.right <= kk.iw + 1 && kk.sw <= kk.iw && kk.vib && kk.spd === 60 && kk.val === "-1" && (lang === "es" ? /Afinada en Do mayor/ : /Tuned to C major/).test(tunedLine),
      `${nm}: Shape your voice has one Key choice (${kk.h.toFixed(0)} px tall: "${kk.here.o[0]}", "${kk.here.o[1]}", 12 major and 12 minor keys), Tune speed and Keep my vibrato (${kk.ck.toFixed(0)} px, on for Tuned), in ${lang === "es" ? "Spanish and English" : "English and Spanish"} ("${kk.other.t}", "${kk.other.o[0]}", "${kk.other.v}"); "${tunedLine}"`);
    await f.selectOption("#vbKey", "8"); await W(300); s = await ST(f);
    ok(s.P.tk === 8 && s.snd === "custom" && (lang === "es" ? /Afinada en La♭ mayor/ : /Tuned to A♭ major/).test(s.line), `${nm}: choosing A♭ major tunes to it, now Custom: "${s.line}"`);
    await f.click('.vb-snd[data-snd="robot"]'); await W(300);
    const rob = await f.evaluate(() => ({ vib: document.querySelector('.vb-chk input[data-k="vib"]').checked, spd: +document.querySelector('.vb-r[data-k="spd"]').value, key: document.getElementById("vbKey").value }));
    ok(!rob.vib && rob.spd === 100 && rob.key === "-1", `${nm}: Robot is the hard sound: Keep my vibrato off, Tune speed 100, back to the song's key: ${JSON.stringify(rob)}`);
    const mk = await f.evaluate(() => { const r = document.querySelector('.vb-r[data-k="spd"]'); r.value = 37; r.dispatchEvent(new Event("input", { bubbles: true }));
      const hb = document.getElementById("vbHear"); hb.click(); return { t: hb.textContent, busy: hb.getAttribute("aria-busy"), dis: hb.disabled }; });
    await f.waitForFunction(() => !AOGVocal.state().making && AOGVocal.state().hear, null, { timeout: 30000 }).catch(() => {});
    const mk2 = await f.evaluate(() => document.getElementById("vbHear").textContent);
    ok((lang === "es" ? /Haciendo el sonido/ : /Making the sound/).test(mk.t) && mk.dis && mk.busy === "true" && /Stop|Parar/.test(mk2), `${nm}: while Tune works, ▶ Hear it says "${mk.t}", then plays ("${mk2}")`);
    await f.click("#vbHear"); await W(400);
    /* 4 · Hear it; a control moved while it plays; every ready-made sound tapped */
    await f.click("#vbHear"); await W(900); s = await ST(f);
    ok(s.hear && s.ac === "running" && s.raf, `${nm}: ▶ Hear it plays the take with the beat, and its meter moves`);
    await f.evaluate(() => { document.getElementById("vbShape").open = true; const r = document.querySelector('.vb-r[data-k="echo"]'); r.value = 60; r.dispatchEvent(new Event("input", { bubbles: true })); });
    await W(400); s = await ST(f);
    ok(s.hear && s.snd === "custom" && s.P.echo === 60, `${nm}: Echo moved while it plays: it plays on, now Custom: ${JSON.stringify({ hear: s.hear, snd: s.snd, echo: s.P.echo })}`);
    for (const k of await f.evaluate(() => AOGVocal.presets)) { await f.click(`.vb-snd[data-snd="${k}"]`); await W(300); }
    await f.waitForFunction(() => !AOGVocal.state().making, null, { timeout: 30000 }).catch(() => {});
    await f.click('.vb-snd[data-snd="radio"]'); await W(600); s = await ST(f);
    ok(s.snd === "radio" && s.hear, `${nm}: each of the nine sounds can be tapped as it plays; Radio picked, still playing`);
    /* AOG-VOCAL-FX-V2: More sounds, a fold (closed on a phone, open on an iPad); each one tapped as it plays */
    const fold = await f.evaluate(() => ({ open: document.getElementById("vbMore").open, h: document.getElementById("vbMoreH").textContent }));
    ok(fold.open === (nm !== "iPhone") && (lang === "es" ? /Más sonidos/ : /More sounds/).test(fold.h), `${nm}: the newer sounds wait in a fold, "${fold.h}", ${fold.open ? "open on a wide screen" : "closed on a phone"}`);
    if (!fold.open) { await f.click("#vbMoreH"); await W(300); }
    const more = await f.evaluate(() => AOGVocal.more);
    for (const k of more) { await f.click(`.vb-snd[data-snd="${k}"]`); await W(300); }
    await f.waitForFunction(() => !AOGVocal.state().making, null, { timeout: 30000 }).catch(() => {});
    await W(700); s = await ST(f);
    const words = await f.evaluate(() => [...document.querySelectorAll("#vbMore .vb-snd")].map(b => b.querySelector("b").textContent + " · " + b.querySelector("span").textContent));
    ok(s.snd === "chop" && s.hear && words.length === 10 && more.length === 10 && words.every(w => w.length > 8), `${nm}: each of the ten More sounds (Pop polish first, AOG-VOCAL-TUNE-V2) can be tapped as it plays; Chop picked, still playing: ${words.join(" | ")}`);
    const lay2 = await f.evaluate(() => { const r = e => e.getBoundingClientRect(), bs = [...document.querySelectorAll("button,select,summary,input[type=range]")].filter(x => x.offsetParent);
      return { sw: document.scrollingElement.scrollWidth, iw: innerWidth, small: bs.filter(x => r(x).height < 44).map(x => x.getAttribute("data-snd") || x.getAttribute("data-k") || x.id || x.className), out: bs.filter(x => r(x).right > innerWidth + 1).map(x => x.id || x.className) }; });
    ok(lay2.sw <= lay2.iw && !lay2.small.length && !lay2.out.length, `${nm}: with More sounds open, the booth still fits and every key is 44px+: ${JSON.stringify(lay2)}`);
    await f.click('.vb-snd[data-snd="radio"]'); await W(600); s = await ST(f);
    pc = await f.evaluate(`(${PROBE})()`); pk = await f.evaluate(`(${CALM})()`);
    ok(!pc.length && !pk.length, `${nm}: with a take, its sounds and controls, the booth reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await f.click("#vbHear"); await W(500); s = await ST(f);
    ok(!s.hear && !s.raf, `${nm}: ■ Stop stops it, the meter rests`);
    /* 5 · + Add to My Track */
    await f.click("#vbAdd");
    await f.waitForFunction(() => /on My Track|en mi pista/.test(AOGVocal.state().line), null, { timeout: 30000 }).catch(() => {});
    s = await ST(f); await W(800);
    const dk = await desk(p).evaluate(async () => { const S = __aogStudio, c = S.SONG.tracks[7].clip, b = S.SONG.tracks[0].clip; const d = c && c.dry ? await S.sget(c.dry) : null;
      return c ? { voice: c.voice, name: c.name, startBar: c.startBar, head: c.head, body: c.body, snd: c.snd, dry: !!(d && d.wav && d.wav.size > 1000), beatLoops: b ? b.loops : 0, beatPieces: b && b.pieces ? b.pieces.map(q => q.n) : null } : null; });
    const mt = await p.evaluate(() => { const l = document.querySelector('.lay[data-layer="voice"]'); return !!(l && l.classList.contains("on")); });
    ok(dk && dk.voice && dk.startBar === from && dk.name === (lang === "es" ? "Voz 1" : "Voice 1") && Math.abs(dk.head - s.take.head) < 0.01 && dk.snd === "radio" && dk.dry && mt && s.take.added,
      `${nm}: + Add to My Track puts ${dk && dk.name} on track 8 at bar ${dk && dk.startBar}, called Radio, its dry take kept, My Track marks Voice: ${JSON.stringify(dk)} "${s.line}"`);
    if (nm === "iPad") ok(/repeats to fit/.test(s.line) && dk && (dk.beatLoops >= 2 || (dk.beatPieces && dk.beatPieces[0] >= 2)), `${nm}: a take longer than the loop makes the beat repeat to fit it: ${JSON.stringify({ loops: dk && dk.beatLoops, pieces: dk && dk.beatPieces, line: s.line })}`);
    /* 6 · a second take; ✕ and Bring it back (the mission slip, if it shows, is tapped away first, as a person would) */
    if (await p.evaluate(() => { const s = document.getElementById("msDone"); return !!(s && !s.hidden); })) { await p.click("#msDone"); await W(200); }
    /* the microphone stays ready for 2 minutes after a take (MIC_KEEP); on a slow machine the sounds above can take longer, and
       then a second ask is the booth working as meant. Still ready: no second ask. */
    const ready = (await ST(f)).armed, wantAsks = ready ? 1 : 2, held = (Date.now() - stopAt) / 1000;
    ok(ready || held >= 115, `${nm}: the microphone stayed ready until its 2 minutes were up (${held.toFixed(0)} s since the take, ready: ${ready})`);
    await f.click("#vbRec"); await f.waitForFunction(() => AOGVocal.state().state === "rec", null, { timeout: 15000 }); await W(2500);
    await f.click("#vbRec"); await f.waitForFunction(() => AOGVocal.state().takes === 2, null, { timeout: 15000 }).catch(() => {});
    s = await ST(f);
    ok(s.takes === 2 && s.cur === 1 && !s.take.added && (await gums(p)) === wantAsks, `${nm}: a second take is kept beside the first and picked; ${ready ? "the microphone still ready, not asked for again" : "the 2 minutes had passed, so asked once more"} (AOG-VOCAL-MIC-V3): ${JSON.stringify({ takes: s.takes, cur: s.cur, ready, asks: await gums(p) })}`);
    await f.click('.vb-tx[data-i="1"]'); await W(300); s = await ST(f);
    const goneLine = s.line;
    await f.click("#vbBack"); await W(300); const s2 = await ST(f);
    ok(s.takes === 1 && s.gone && s2.takes === 2 && !s2.gone, `${nm}: ✕ lets a take go ("${goneLine}"); Bring it back returns it`);
    /* AOG-VOCAL-FX-V2: the second take in one of the More sounds, onto My Track with its name; the desk keeps every new name */
    const nk = nm === "iPhone" ? "harmony" : "ghost";
    if (!(await f.evaluate(() => document.getElementById("vbMore").open))) { await f.click("#vbMoreH"); await W(300); }
    await f.click(`.vb-snd[data-snd="${nk}"]`); await W(300); const pickLine = (await ST(f)).line;
    await f.click("#vbAdd");
    await f.waitForFunction(() => /Voice 2|Voz 2/.test(AOGVocal.state().line), null, { timeout: 40000 }).catch(() => {});
    s = await ST(f); await W(800);
    const dk2 = await desk(p).evaluate(names => { const c = __aogStudio.SONG.tracks[7].clip; return c ? { name: c.name, snd: c.snd, kept: typeof cleanClip === "function" ? names.filter(k => (cleanClip(Object.assign({}, c, { snd: k })) || {}).snd === k) : null } : null; }, more);
    ok(dk2 && dk2.snd === nk && dk2.name === (lang === "es" ? "Voz 2" : "Voice 2") && dk2.kept && dk2.kept.length === more.length && s.take.added,
      `${nm}: take 2 in ${nk} goes to My Track as ${dk2 && dk2.name}, its sound named "${dk2 && dk2.snd}"; the desk keeps every new sound's name (${dk2 && dk2.kept && dk2.kept.length} of ${more.length}); "${pickLine}"`);
    /* 7 · a phone on its side */
    if (nm === "iPhone") {
      await p.setViewportSize({ width: 844, height: 390 }); await W(800);
      const side = await f.evaluate(() => { const r = e => e.getBoundingClientRect(), bs = [...document.querySelectorAll("button,select,summary")].filter(x => x.offsetParent);
        return { sw: document.scrollingElement.scrollWidth, iw: innerWidth, out: bs.filter(x => r(x).right > innerWidth + 1).map(x => x.id || x.className), small: bs.filter(x => r(x).height < 44).map(x => x.id || x.className) }; });
      ok(side.sw <= side.iw && !side.out.length && !side.small.length, `${nm} on its side: the booth fits: ${JSON.stringify(side)}`);
      await p.setViewportSize({ width: 390, height: 844 }); await W(300);
    }
    /* 8 · rests */
    await W(1500); s = await ST(f);
    ok(!s.hear && !s.mic && !s.raf && s.ac === "suspended", `${nm}: at rest: no sound, nothing recording, no frames, the engine paused: ${JSON.stringify({ ac: s.ac })}`);
    await f.evaluate(() => window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: true } }))); await W(1200); s = await ST(f);
    const live = await p.evaluate(() => [...document.querySelectorAll("iframe")].concat([window]).reduce((n, w) => { try { const ww = w.contentWindow || w; return n + (ww.__streams || []).filter(x => x.getTracks().some(t => t.readyState === "live")).length; } catch (e) { return n; } }, 0));
    ok(!s.armed && live === 0, `${nm}: the Studio's hush lets the microphone go: ${JSON.stringify({ armed: s.armed, live })}`);
    await f.evaluate(() => window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: false } })));
    ok(errs.length === 0, `${nm}: no page errors ` + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  /* 9 · a refused microphone, iPhone, dark */
  { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block", colorScheme: "dark" }); const errs = [];
    ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
    await routes(ctx, "en"); await ctx.addInitScript(REFUSE);
    await ctx.addInitScript(() => { try { localStorage.setItem("aog.theme", "dark"); } catch (e) {} });
    const p = await ctx.newPage(); await p.goto(U + "the-studio#vocal"); await W(3500);
    const f = await booth(p);
    await f.click("#vbRec"); await W(1200);
    const s = await ST(f), al = await f.evaluate(() => { const a = document.getElementById("vbAllow"); return { shown: !a.hidden, t: a.textContent }; });
    ok(s.allow && al.shown && /Settings, then Safari, then Microphone/.test(al.t) && /icon to the left of the web address/.test(al.t) && s.state === "idle" && !s.mic,
      `a refused microphone shows how to allow it (iPhone, iPad, computer): "${al.t.slice(0, 120)}…"`);
    const pc = await f.evaluate(`(${PROBE})()`);
    ok(!pc.length, `the refused line reads in the dark theme (${pc.length} ${JSON.stringify(pc.slice(0, 2))})`);
    ok(errs.length === 0, "refused: no page errors " + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  /* 10 · AOG-VOCAL-MIC-V2: Safari on an iPad refused the room's frame though the site was allowed; the booth asks the Studio */
  { const ctx = await b.newContext({ viewport: { width: 1180, height: 820 }, isMobile: true, hasTouch: true, serviceWorkers: "block" }); const errs = [];
    ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
    await routes(ctx, "en"); await ctx.addInitScript(COUNT);
    await ctx.addInitScript(() => { if (window.parent === window) return; const md = navigator.mediaDevices; if (!md) return;
      md.getUserMedia = async () => { window.__frameAsked = (window.__frameAsked || 0) + 1; throw new DOMException("refused", "NotAllowedError"); }; });
    const p = await ctx.newPage(); await p.goto(U + "the-studio#vocal"); await W(3500);
    const f = await booth(p);
    await f.click("#vbRec"); await f.waitForFunction(() => AOGVocal.state().state === "rec", null, { timeout: 15000 }).catch(() => {}); await W(2000);
    let s = await ST(f); const rec = s.state === "rec", asked = await f.evaluate(() => window.__frameAsked || 0);
    await f.click("#vbRec"); await f.waitForFunction(() => AOGVocal.state().takes === 1, null, { timeout: 15000 }).catch(() => {});
    s = await ST(f);
    ok(rec && asked === 0 && (await gums(p)) === 1 && s.takes === 1 && !s.allow, `inside the Studio the booth asks through the Studio first, so a frame Safari would refuse is never asked (AOG-VOCAL-MIC-V4): ${JSON.stringify({ rec, asked, studio: await gums(p), takes: s.takes, allow: s.allow })}`);
    await W(1500); s = await ST(f);
    await f.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); }); await W(1200); s = await ST(f);
    ok(!s.mic && !s.armed, "the Studio's microphone is let go when the tab is hidden");
    ok(errs.length === 0, "frame refused: no page errors " + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  /* 11 · AOG-VOCAL-MIC-V4: the other way round: the Studio is refused, the room's frame records */
  { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block" }); const errs = [];
    ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
    await routes(ctx, "en"); await ctx.addInitScript(COUNT);
    await ctx.addInitScript(() => { if (window.parent !== window) return; const md = navigator.mediaDevices; if (!md) return;
      md.getUserMedia = async () => { window.__topAsked = (window.__topAsked || 0) + 1; throw new DOMException("refused", "NotAllowedError"); }; });
    const p = await ctx.newPage(); await p.goto(U + "the-studio#vocal"); await W(3500);
    const f = await booth(p);
    await f.click("#vbRec"); await f.waitForFunction(() => AOGVocal.state().state === "rec", null, { timeout: 15000 }).catch(() => {}); await W(2000);
    let s = await ST(f); const rec = s.state === "rec", top = await p.evaluate(() => window.__topAsked || 0), own = await f.evaluate(() => window.__gum || 0);
    await f.click("#vbRec"); await f.waitForFunction(() => AOGVocal.state().takes === 1, null, { timeout: 15000 }).catch(() => {});
    s = await ST(f);
    ok(rec && top >= 1 && own >= 1 && s.takes === 1 && !s.allow, `the Studio refused, the room's own microphone records instead: ${JSON.stringify({ rec, top, own, takes: s.takes })}`);
    ok(errs.length === 0, "Studio refused: no page errors " + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  /* 12 · AOG-VOCAL-MIC-V5: another room set the page's sound to "playback" (navigator.audioSession, as on an iPhone), and Safari
     then refuses any microphone with InvalidStateError until every frame says "play-and-record" */
  { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block" }); const errs = [];
    ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
    await routes(ctx, "en"); await ctx.addInitScript(COUNT);
    await ctx.addInitScript(() => {
      const sess = { type: "auto" }; Object.defineProperty(navigator, "audioSession", { configurable: true, get: () => sess });
      const md = navigator.mediaDevices; if (!md) return; const g = md.getUserMedia.bind(md);
      md.getUserMedia = c => { let top = window; try { while (top.parent !== top) top = top.parent; } catch (e) {}
        const all = [top]; for (let i = 0; i < top.frames.length; i++) all.push(top.frames[i]); const bad = all.some(w => { try { return w.navigator.audioSession.type === "playback"; } catch (e) { return false; } });
        return bad ? Promise.reject(new DOMException("AudioSession category is not compatible with audio capture.", "InvalidStateError")) : g(c); };
    });
    const p = await ctx.newPage(); await p.goto(U + "the-studio#vocal"); await W(3500);
    const f = await booth(p);
    /* a room got its sound ready, as the Studio's rooms do: the page's sound is now "playback" */
    await p.evaluate(() => { const x = document.createElement("iframe"); x.id = "pbRoom"; x.style.display = "none"; document.body.appendChild(x); x.contentWindow.navigator.audioSession.type = "playback"; }).catch(() => {});
    const before = await p.evaluate(() => { const x = document.getElementById("pbRoom"); return x && x.contentWindow.navigator.audioSession ? x.contentWindow.navigator.audioSession.type : "none"; });
    await f.click("#vbRec"); await f.waitForFunction(() => AOGVocal.state().state === "rec", null, { timeout: 15000 }).catch(() => {}); await W(2000);
    let s = await ST(f); const rec = s.state === "rec";
    const during = await p.evaluate(() => document.getElementById("pbRoom").contentWindow.navigator.audioSession.type);
    await f.click("#vbRec"); await f.waitForFunction(() => AOGVocal.state().takes === 1, null, { timeout: 15000 }).catch(() => {});
    s = await ST(f);
    ok(rec && s.takes === 1 && !s.allow && during === "play-and-record", `with another room's sound set to playback, the booth sets play-and-record and records: ${JSON.stringify({ before, during, rec, takes: s.takes, allow: s.allow, err: await f.evaluate(() => AOGVocal.state().line) })}`);
    await f.evaluate(() => window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: true } }))); await W(1200);
    const after = await p.evaluate(() => document.getElementById("pbRoom").contentWindow.navigator.audioSession.type);
    ok(after === "playback", `when the microphone is let go, that room gets its playback back: ${after}`);
    ok(errs.length === 0, "playback session: no page errors " + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
