/* AOG-VOCAL-PRO-V1 (2026-10-24) — the Vocal Booth's pro vocal chain (aog-vocal.js, music-vocal.html). Jimmy: "Pro-grade
   everything in vocals right now!" Port 9496. Measured on pretend voices:
   · the capture, lossless under load: with the page's main thread kept busy (180 ms of every 185) and the machine's cores
     kept busy too, every frame the worklet counted reaches the take (none lost, none twice), the take is as long as the
     frames counted, the dry take has no step larger than its own band-limited voice ever makes, and its highs above
     4.6 kHz stay where a quiet machine leaves them, take after take; the dropout mender fills pretend 10 ms holes and
     dropped moments from both sides, and leaves a clean voice exactly as it was;
   · Clean-up (in the Worker): steady hiss 10 dB or more lower in the gaps at Quiet the hiss 50 with the voice band within
     1 dB and the hiss that is left steady (no warble); a 60 Hz hum (and 50 Hz) with its 120 and 180 Hz harmonics down
     20 dB or more, the voice within 1 dB; Breath control lowers breaths by about the chosen amount, the singing untouched;
   · Level rider: the spread of four phrases' loudness falls to under half; the opto compressor's gain reduction on steady
     notes matches its soft-knee curve (threshold, ratio, knee it reports) within 0.5 dB, with no ripple on a low note and
     no sudden steps (no pumping); the peak catcher only touches peaks; the de-esser finds the s range, cuts the highs in
     the s and leaves the vowel's highs alone; the resonance tamer finds a narrow ring and dips it, and leaves a voice
     without one alone;
   · Space: the Echo lands one beat, ¾ of a beat or half a beat after the voice at the song's tempo, and ducks (6 dB or
     more less echo while the voice sings with Keep words clear at 100, about the same in the gaps); the Room's tone
     follows Room tone;
   · Count me in: four ticks are heard before the beat, and with a silent microphone the take is exact silence: neither
     the count-in nor Click in my headphones is ever in it (the click plays while recording);
   · Your level: green for a normal voice; amber, and the plain line "That take was too loud in places…", for a take that
     clipped;
   · Sing a part again: with My Track, bars 2–3 of a take are sung again: outside them the new take is the old one sample
     for sample, inside it is the new singing, the joins crossfaded with no click, the length the same;
   · Best take: with two takes, three lines are found; line 2 from take 2 and lines 1 and 3 from take 1 make a new take
     that has exactly that, its length the same;
   · Pro tools is one fold, closed at first; on an iPhone upright and sideways, and an iPad, every key in it is 44 px or
     more, nothing runs off the side, it reads and is calm, in English and Spanish; no page errors. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const ROOT = path.resolve(__dirname, "../../../aog-deploy"), PORT = 9496, U = "http://localhost:" + PORT + "/", srv = require("../srv.js")(PORT);
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const W = ms => new Promise(r => setTimeout(r, ms));
const DIR = fs.mkdtempSync(path.join(os.tmpdir(), "vocalpro-"));
/* pretend microphones: tone bursts (226 Hz, 17 harmonics, 0.4 s in every 1.5 s); the same with a soft s after each burst;
   silence; and a voice so loud it clips */
function wav(name, fn) { const sr = 48000, n = sr * 15, b = Buffer.alloc(44 + n * 2); b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(fn(i / sr, i) * 32767))), 44 + i * 2);
  const f = path.join(DIR, name + ".wav"); fs.writeFileSync(f, b); return f; }
const tone = t => { const ph = t % 1.5; if (ph >= 0.4) return 0; const env = Math.min(1, ph / 0.01, (0.4 - ph) / 0.01); let x = 0; for (let k = 1; k <= 17; k++) x += Math.sin(2 * Math.PI * 226 * k * t) / k; return x * env * 0.42 * 0.61; };
let sd = 12345, pv = 0; const rn = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296 * 2 - 1; };
const TONE = wav("tone", t => tone(t));
const VOICE = wav("voice", t => { const ph = t % 1.5; if (ph >= 0.42 && ph < 0.48) { const v = rn(), hi = v - pv; pv = v; return hi * 0.16 * 0.61 * Math.min(1, (ph - 0.42) / 0.005, (0.48 - ph) / 0.005); } return tone(t); });
const SILENT = wav("silent", () => 0);
const LOUD = wav("loud", t => Math.max(-1, Math.min(1, 4 * tone(t))));
const launch = file => pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--use-file-for-fake-audio-capture=" + file] });
async function routes(ctx, lang) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  await ctx.addInitScript(l => { try { if (!sessionStorage.getItem("t")) { localStorage.clear(); sessionStorage.setItem("t", "1"); } localStorage.setItem("aog.lang", l); } catch (e) {} }, lang);
}
const ST = f => f.evaluate(() => AOGVocal.state());
async function standalone(b, lang, vp) {
  const ctx = await b.newContext({ viewport: vp || { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block" }), errs = [];
  ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
  await routes(ctx, lang); const p = await ctx.newPage(); await p.goto(U + "music-vocal.html"); await p.waitForFunction(() => window.AOGVocal && document.getElementById("vbRec"));
  return { ctx, p, errs };
}
async function record(p, ms, busy) {
  await p.click("#vbRec"); await p.waitForFunction(() => AOGVocal.state().state === "rec", null, { timeout: 15000 });
  if (busy) await p.evaluate(() => { window.__busy = true; (function go() { if (!window.__busy) return; const t = performance.now(); while (performance.now() - t < 180) {} setTimeout(go, 5); })(); });
  const hogs = busy ? Array.from({ length: os.cpus().length + 2 }, () => cp.spawn(process.execPath, ["-e", `const t=Date.now();while(Date.now()-t<${ms + 800}){}`])) : [];
  const lv = new Set(); const t0 = Date.now(); while (Date.now() - t0 < ms) { await W(400); lv.add((await p.evaluate(() => AOGVocal.state().lvl).catch(() => "")) || ""); }
  if (busy) await p.evaluate(() => { window.__busy = false; });
  const n = (await ST(p)).takes;
  await p.click("#vbRec"); await p.waitForFunction(k => AOGVocal.state().takes === k + 1 && AOGVocal.state().state === "idle", n, { timeout: 20000 });
  hogs.forEach(h => { try { h.kill(); } catch (e) {} });
  return [...lv].filter(Boolean);
}
/* the dry take, looked at: steps against its own voice, the highs inside the tone bursts, its length */
const DRY = async () => {
  const V = AOGVocal, s = V.state(), x = V.takeDry(), sr = s.take.sr, F = Math.round(0.01 * sr);
  const oc = new OfflineAudioContext(1, x.length, sr), b = oc.createBuffer(1, x.length, sr); b.copyToChannel(x, 0); const so = oc.createBufferSource(); so.buffer = b;
  let nd = so; for (let i = 0; i < 4; i++) { const z = oc.createBiquadFilter(); z.type = "highpass"; z.frequency.value = 4600; z.Q.value = -3.01; nd.connect(z); nd = z; } nd.connect(oc.destination); so.start(0);
  const y = (await oc.startRendering()).getChannelData(0);
  const fr = []; let em = 0; for (let i = 0; i + F <= x.length; i += F) { let e = 0, h = 0; for (let j = 0; j < F; j++) { e += x[i + j] * x[i + j]; h += y[i + j] * y[i + j]; } fr.push([i, e, h]); if (e > em) em = e; }
  const tone = fr.filter(f => f[1] > 0.3 * em); let te = 0, th = 0; tone.forEach(f => { te += f[1]; th += f[2]; });
  const d2 = []; tone.forEach(f => { for (let i = Math.max(2, f[0]); i < f[0] + F; i++) d2.push(Math.abs(x[i] - 2 * x[i - 1] + x[i - 2])); });
  const so2 = d2.slice().sort((a, b) => a - b), p99 = so2[Math.floor(so2.length * 0.99)], mx = so2[so2.length - 1];
  return { len: x.length, sec: s.take.sec, head: s.take.head, cap: s.cap, hf: th / te * 100, step: mx / p99, line: s.line, sr };
};
/* the pro stages on pretend voices (in the page, through the booth's own Worker: AOGVocal.pro) */
const DSP = async () => {
  const V = AOGVocal, sr = 48000;
  let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
  const gauss = () => { let s = 0; for (let k = 0; k < 6; k++) s += rnd(); return s / Math.sqrt(2); };
  const vowel = (n, f0, amp, F = [700, 1200, 2600], vib = 0, hf = 5000) => { const x = new Float64Array(n); let ph = 0;
    for (let i = 0; i < n; i++) { const t = i / sr, f = f0 * (1 + vib * Math.sin(2 * Math.PI * 5.5 * t)); ph += 2 * Math.PI * f / sr; let v = 0;
      for (let k = 1; k * f0 < hf; k++) { const fk = k * f0; let g = 0.15 / k; F.forEach((fc, q) => { g += (q ? 0.5 : 1) / (1 + ((fk - fc) / (80 + fc * 0.08)) ** 2); }); v += g * Math.sin(k * ph); }
      x[i] = v * amp; } return x; };
  const ramp = (x, r) => { const R = Math.round(r * sr); for (let i = 0; i < R && i < x.length; i++) { const w = i / R; x[i] *= w; x[x.length - 1 - i] *= w; } return x; };
  const cat = ps => { const n = ps.reduce((a, p) => a + p.length, 0), o = new Float64Array(n); let k = 0; ps.forEach(p => { o.set(p, k); k += p.length; }); return o; };
  const sil = s => new Float64Array(Math.round(s * sr)), S = s => Math.round(s * sr);
  const rms = (x, a = 0, b = x.length) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, b - a)); };
  const dB = v => 20 * Math.log10(v);
  const biq = (x, type, f, q = 0.7071) => { const w = 2 * Math.PI * f / sr, cw = Math.cos(w), al = Math.sin(w) / (2 * q); let b0, b1, b2; const a0 = 1 + al, a1 = -2 * cw, a2 = 1 - al;
    if (type === "hp") { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; } else if (type === "lp") { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0; } else { b0 = al; b1 = 0; b2 = -al; }
    const y = new Float64Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = x[i], o = (b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o; } return y; };
  const band = (x, lo, hi) => { let y = x; for (let k = 0; k < 3; k++) { y = biq(y, "hp", lo); y = biq(y, "lp", hi); } return y; };
  const gz = (x, f, a, b) => { const w = 2 * Math.cos(2 * Math.PI * f / sr); let s1 = 0, s2 = 0; const N = b - a; for (let i = 0; i < N; i++) { const s = x[a + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)) + w * s1 - s2; s2 = s1; s1 = s; } return s1 * s1 + s2 * s2 - w * s1 * s2; };
  const run = (kind, x, o) => V.pro(kind, x, sr, o);
  const R = {};
  /* noise reduction */
  { const ph = () => ramp(vowel(S(1.2), 196, 0.25), 0.02), x = cat([sil(0.8), ph(), sil(0.6), ph(), sil(0.7), ph(), sil(0.8)]), y = x.map(v => v + 0.003 * gauss());
    const r = await run("clean", y, { nr: 50, hum: 0, br: 0 }), z = r.x || new Float32Array(y), gaps = [[0.1, 0.7], [2.1, 2.5], [3.9, 4.4]].map(g => [S(g[0]), S(g[1])]);
    const gi = Math.sqrt(gaps.reduce((a, g) => a + rms(y, g[0], g[1]) ** 2, 0) / 3), go = Math.sqrt(gaps.reduce((a, g) => a + rms(z, g[0], g[1]) ** 2, 0) / 3);
    const cv = q => { const F = S(0.01), e = []; gaps.forEach(g => { for (let i = g[0]; i + F <= g[1]; i += F) e.push(rms(q, i, i + F)); }); const m = e.reduce((a, b) => a + b, 0) / e.length; return Math.sqrt(e.reduce((a, b) => a + (b - m) ** 2, 0) / e.length) / m; };
    const bi = band(y, 200, 4000), bo = band(z, 200, 4000), vs = [[0.9, 1.9], [2.7, 3.7], [4.6, 5.6]].map(g => dB(rms(bo, S(g[0]), S(g[1]))) - dB(rms(bi, S(g[0]), S(g[1]))));
    R.nr = { info: r.info, gaps: dB(go) - dB(gi), voice: vs, cvIn: cv(y), cvOut: cv(z) }; }
  /* hum */
  R.hum = [];
  for (const base of [60, 50]) { const ph = () => ramp(vowel(S(1.2), 220, 0.25), 0.02), x = cat([sil(0.5), ph(), sil(0.5), ph(), sil(0.5)]);
    const y = x.map((v, i) => v + 0.01 * Math.sin(2 * Math.PI * base * i / sr) + 0.006 * Math.sin(2 * Math.PI * 2 * base * i / sr + 1) + 0.004 * Math.sin(2 * Math.PI * 3 * base * i / sr + 2));
    const r = await run("clean", y, { nr: 0, hum: 1, br: 0 }), z = r.x || new Float32Array(y), a = S(0.6), b = y.length - S(0.6);
    const bi = band(y, 300, 4000), bo = band(z, 300, 4000);
    R.hum.push({ base, info: r.info, d: [1, 2, 3].map(k => 10 * Math.log10(gz(z, k * base, a, b) / gz(y, k * base, a, b))), voice: dB(rms(bo, S(0.6), S(1.6))) - dB(rms(bi, S(0.6), S(1.6))) }); }
  /* breaths */
  { const ph = () => ramp(vowel(S(1.0), 196, 0.25), 0.02), br = () => { let y = new Float64Array(S(0.4)).map(() => gauss()); y = biq(biq(y, "lp", 2500), "hp", 300); const g = 0.02 / rms(y); return ramp(y.map(v => v * g), 0.06); };
    const x = cat([sil(0.3), ph(), sil(0.15), br(), sil(0.15), ph(), sil(0.15), br(), sil(0.15), ph(), sil(0.3)]).map(v => v + 0.0003 * gauss());
    R.br = [];
    for (const cut of [6, 12, 18]) { const r = await run("clean", x, { nr: 0, hum: 0, br: cut }), z = r.x || new Float32Array(x);
      R.br.push({ cut, info: r.info, b: [1.45, 3.1].map(s => dB(rms(z, S(s + 0.03), S(s + 0.37))) - dB(rms(x, S(s + 0.03), S(s + 0.37)))), p: dB(rms(z, S(0.4), S(1.2))) - dB(rms(x, S(0.4), S(1.2))) }); } }
  /* the level rider */
  { const lv = [-6, -18, -10, -22], ps = [sil(0.4)]; lv.forEach(l => { ps.push(ramp(vowel(S(1.5), 196, 0.25 * 10 ** (l / 20)), 0.02)); ps.push(sil(0.4)); });
    const x = cat(ps), r = await run("dyn", x, { ride: 100, sq: 0, ss: 0, tame: 0 }), z = r.x, at = lv.map((_, k) => [S(0.4 + k * 1.9 + 0.3), S(0.4 + k * 1.9 + 1.2)]);
    const sd = a => { const m = a.reduce((p, q) => p + q, 0) / a.length; return Math.sqrt(a.reduce((p, q) => p + (q - m) ** 2, 0) / a.length); };
    const inner = at.map(p => { let mn = 1e9, mx = -1e9; const g = r.info.ride.g, F = S(0.01); for (let f = Math.ceil(p[0] / F) + 10; f < Math.floor(p[1] / F) - 10; f++) { mn = Math.min(mn, g[f]); mx = Math.max(mx, g[f]); } return mx - mn; });
    R.ride = { before: sd(at.map(p => dB(rms(x, p[0], p[1])))), after: sd(at.map(p => dB(rms(z, p[0], p[1])))), inner: Math.max(...inner) }; }
  /* the compressor: a soft then a loud steady note, low (110 Hz, the hardest for ripple) */
  { const x = cat([ramp(vowel(S(2), 110, 0.05), 0.02), ramp(vowel(S(2), 110, 0.2), 0.02)]), r = await run("dyn", x, { ride: 0, sq: 100, ss: 0, tame: 0 }), c = r.info.comp, g = c.g;
    const hp = biq(biq(x, "hp", 90), "hp", 90), L = (a, b) => 10 * Math.log10(rms(hp, S(a), S(b)) ** 2), curve = l => { const d = l - c.T; return 2 * d < -c.K ? 0 : 2 * Math.abs(d) <= c.K ? (1 / c.R - 1) * (d + c.K / 2) ** 2 / (2 * c.K) : (1 / c.R - 1) * d; };
    const at = s => g[Math.round(s * sr / c.S)];
    let mn = 1e9, mx = -1e9; for (let s = 3.0; s < 3.9; s += 0.0005) { const v = at(s); mn = Math.min(mn, v); mx = Math.max(mx, v); }
    let step = 0; for (let k = 1; k < g.length; k++) step = Math.max(step, Math.abs(g[k] - g[k - 1]));
    let osc = 0; for (let k = Math.round(2.3 * sr / c.S); k < Math.round(3.9 * sr / c.S) - 1; k++) if ((g[k] - g[k - 1]) * (g[k + 1] - g[k]) < 0 && Math.abs(g[k + 1] - g[k]) > 0.02) osc++;
    R.comp = { T: c.T, R: c.R, K: c.K, mk: c.mk, soft: { got: at(1.5), want: curve(L(1.0, 1.9)) }, loud: { got: at(3.5), want: curve(L(3.0, 3.9)) }, ripple: mx - mn, step, osc, perStep: c.S / sr * 1000, peak: r.info.peak }; }
  /* the de-esser */
  { const ph = () => ramp(vowel(S(0.5), 220, 0.25, [700, 1200, 2600], 0, 9000), 0.01), s = () => { let y = new Float64Array(S(0.15)).map(() => gauss()); y = band(y, 5000, 10000); const g = 0.06 / rms(y); return ramp(y.map(v => v * g), 0.01); };
    const x = cat([sil(0.2), ph(), s(), ph(), sil(0.1), s(), ph(), sil(0.2)]); R.ess = [];
    for (const ss of [20, 100]) { const r = await run("dyn", x, { ride: 0, sq: 0, ss, tame: 0 }), z = r.x, hx = band(x, 5000, 12000), hz = band(z, 5000, 12000);
      R.ess.push({ ss, info: r.info.ess, s: dB(rms(hz, S(0.72), S(0.83))) - dB(rms(hx, S(0.72), S(0.83))), s2: dB(rms(hz, S(1.42), S(1.53))) - dB(rms(hx, S(1.42), S(1.53))), v: dB(rms(hz, S(0.3), S(0.6))) - dB(rms(hx, S(0.3), S(0.6))), v2: dB(rms(hz, S(0.9), S(1.2))) - dB(rms(hx, S(0.9), S(1.2))) }); } }
  /* the resonance tamer */
  R.tame = [];
  for (const res of [true, false]) { const ps = []; [196, 220, 247, 262].forEach(f => { ps.push(ramp(vowel(S(0.8), f, 0.2, [300, 870], 0.01, 8000), 0.02)); ps.push(sil(0.1)); });
    let x = cat(ps); if (res) { const pk = biq(x, "bp", 3150, 8); x = x.map((v, i) => v + 3 * pk[i]); }
    const r = await run("dyn", x, { ride: 0, sq: 0, ss: 0, tame: 100 }), z = r.x, lev = (y, f) => dB(rms(band(y, f / 1.03, f * 1.03)));
    R.tame.push({ res, info: r.info.res, at: lev(z, 3150) - lev(x, 3150), k1: lev(z, 1000) - lev(x, 1000), k5: lev(z, 6000) - lev(x, 6000) }); }
  return R;
};
(async () => {
  /* 1 · the capture under load (tone bursts: steps and highs are easy to see) */
  { const b = await launch(TONE), { ctx, p, errs } = await standalone(b, "en");
    const D = [], lvs = [];
    for (let k = 0; k < 3; k++) { lvs.push(await record(p, 5000, true)); D.push(await p.evaluate(DRY)); }
    lvs.push(await record(p, 3000, false)); const quiet = await p.evaluate(DRY);
    const hfs = D.map(d => d.hf);
    ok(D.every(d => d.cap && d.cap.ended && d.cap.lost === 0 && d.cap.dup === 0 && d.cap.gap === 0 && d.cap.frames === d.cap.got),
      `under a busy page and busy cores, every frame the worklet counted reached the take, none lost or doubled: ${D.map(d => JSON.stringify({ frames: d.cap.frames, got: d.cap.got, buffers: d.cap.posts, lost: d.cap.lost, twice: d.cap.dup })).join(" ")}`);
    ok(D.every(d => d.len <= d.cap.frames && d.cap.frames - d.len < 0.4 * d.sr && Math.abs(d.len / d.sr - d.sec) < 1e-9 && d.sec > 4.5),
      `each take is as long as the frames counted, less the start before the beat: ${D.map(d => `${d.len} of ${d.cap.frames} samples (${d.sec.toFixed(3)} s)`).join("; ")}`);
    ok(D.every(d => d.step < 1.6) && quiet.step < 1.6, `no clicks: the largest step in each dry take is at most ${Math.max(...D.map(d => d.step), quiet.step).toFixed(2)}× its voice's own (busy ${D.map(d => d.step.toFixed(2)).join(" / ")}, quiet ${quiet.step.toFixed(2)}); dropouts the browser made were found and mended: ${D.map(d => `${d.cap.holes} seen, ${d.cap.mended} filled, ${d.cap.faded} faded`).join("; ")}`);
    ok(hfs.every(h => h < 0.02 && h < 3 * quiet.hf + 0.002), `the highs above 4.6 kHz stay steady take after take (busy ${hfs.map(h => h.toFixed(4)).join(" / ")} %, quiet ${quiet.hf.toFixed(4)} %; a click shows as 0.1 % or more)`);
    ok(lvs.every(l => l.includes("ok") && !l.includes("hi")), `Your level shows green for a normal voice while recording: ${JSON.stringify(lvs)}`);
    /* the mender itself, on pretend holes and dropped moments */
    const M = await p.evaluate(() => { const sr = 48000, n = sr * 3, x = new Float32Array(n);
      for (let i = 0; i < n; i++) { const t = i / sr; let v = 0; for (let k = 1; k <= 12; k++) v += Math.sin(2 * Math.PI * 180 * k * t) / k; x[i] = 0.3 * v * Math.min(1, t / 0.02, (3 - t) / 0.02) + 0.0004 * Math.sin(i * 1.7); }
      const step = y => { let m = 0, all = []; for (let i = 2; i < y.length; i++) { const d = Math.abs(y[i] - 2 * y[i - 1] + y[i - 2]); all.push(d); if (d > m) m = d; } all.sort((a, b) => a - b); return m / all[Math.floor(all.length * 0.99)]; };
      const holes = new Float32Array(x); [0.5, 1.21, 1.9].forEach(s => holes.fill(0, Math.round(s * sr), Math.round(s * sr) + 480));
      const drop = new Float32Array(n); let o = 0; for (let i = 0; i < n; i++) { if (i === Math.round(0.8 * sr) || i === Math.round(2.2 * sr)) o += 480; drop[i] = x[Math.min(n - 1, i + o)]; }
      /* as a busy browser makes them in a row: two holes 10 ms apart, and a hole with a moment dropped just after it */
      const row = new Float32Array(x); row.fill(0, Math.round(0.6 * sr), Math.round(0.6 * sr) + 480); row.fill(0, Math.round(0.6 * sr) + 960, Math.round(0.6 * sr) + 1440);
      row.fill(0, Math.round(2.0 * sr), Math.round(2.0 * sr) + 480); { const p0 = Math.round(2.0 * sr) + 540; for (let i = p0; i < n; i++) row[i] = x[Math.min(n - 1, i + 480)]; }
      const a = AOGVocal.mend(holes, sr), b = AOGVocal.mend(drop, sr), c = AOGVocal.mend(x, sr), d = AOGVocal.mend(row, sr);
      let same = true; for (let i = 0; i < n; i++) if (c.x[i] !== x[i]) { same = false; break; }
      return { holes: { found: a.fixed, before: step(holes), after: step(a.x) }, drop: { found: b.fixed, before: step(drop), after: step(b.x) }, clean: { found: c.fixed + c.faded, same }, row: { found: d.fixed, before: step(row), after: step(d.x) } }; });
    ok(M.holes.found === 3 && M.holes.after < 1.6 && M.drop.found === 2 && M.drop.after < 1.6 && M.row.found >= 2 && M.row.after < 1.6 && M.clean.found === 0 && M.clean.same,
      `the mender fills three 10 ms holes (steps ${M.holes.before.toFixed(1)}× → ${M.holes.after.toFixed(2)}×), two dropped moments (${M.drop.before.toFixed(1)}× → ${M.drop.after.toFixed(2)}×), and dropouts in a row (two holes 10 ms apart, a hole with a moment dropped just after: ${M.row.before.toFixed(1)}× → ${M.row.after.toFixed(2)}×), and leaves a clean voice exactly as it was`);
    ok(!errs.length, `no page errors while recording under load: ${errs.slice(0, 2).join(" | ")}`);
    await ctx.close(); await b.close(); }
  /* 2 · Count me in and Click in my headphones, with a silent microphone */
  { const b = await launch(SILENT), { ctx, p, errs } = await standalone(b, "en");
    await p.click("#vbProH"); await W(200); await p.check("#vbCin"); await p.check("#vbClk"); await W(100);
    const kept = await p.evaluate(() => JSON.parse(localStorage.getItem("aog.vocal.v1") || "{}"));
    await p.click("#vbRec"); await p.waitForFunction(() => AOGVocal.state().state === "rec", null, { timeout: 15000 });
    const line0 = (await ST(p)).line; let pk = 0, during = 0, after = 0; const t0 = Date.now(), cue0 = await p.evaluate(() => AOGVocal.cue());
    while (Date.now() - t0 < 4500) { const c = await p.evaluate(() => AOGVocal.cue()); if (c.at && c.now < c.at[1]) during = Math.max(during, c.peak); else if (c.clk) after = Math.max(after, c.peak); pk = Math.max(pk, c.peak); await W(30); }
    const line1 = (await ST(p)).line;
    await p.click("#vbRec"); await p.waitForFunction(() => AOGVocal.state().takes === 1 && AOGVocal.state().state === "idle", null, { timeout: 15000 });
    const T = await p.evaluate(async () => { const x = AOGVocal.takeDry(); let m = 0; for (let i = 0; i < x.length; i++) m = Math.max(m, Math.abs(x[i])); const r = await AOGVocal.make("clean"); let mr = 0; for (let i = 0; i < r.L.length; i++) mr = Math.max(mr, Math.abs(r.L[i]), Math.abs(r.R[i])); const s = AOGVocal.state(); return { max: m, made: mr, take: s.take, cue: AOGVocal.cue() }; });
    const beat = cue0.at ? (cue0.at[1] - cue0.at[0]) / 4 : 0;
    ok(kept.cin === true && kept.clk === true && cue0.at && Math.abs(beat - 60 / 90) < 0.01 && /Get ready/.test(line0) && /Recording/.test(line1),
      `Count me in and Click in my headphones are kept on the device; one bar at the song's tempo (${(beat * 1000).toFixed(0)} ms a beat at 90 bpm) says "${line0}", then "${line1}"`);
    ok(during > 0.1 && after > 0.05, `the count-in is heard before the beat (its ticks peak at ${during.toFixed(2)}) and the click while recording (${after.toFixed(2)})`);
    ok(T.max === 0 && T.made === 0 && T.take.head > 0.2 && T.take.head < 0.3, `with a silent microphone the take is exact silence (loudest sample ${T.max}) and so is the sound made from it (${T.made}): neither the count-in nor the click is ever recorded; the take starts a quarter second before the beat (${T.take.head.toFixed(3)} s), after the count-in`);
    ok(!T.cue.clk, `the click stops with the take`);
    ok(!errs.length, `no page errors with the count-in: ${errs.slice(0, 2).join(" | ")}`);
    await ctx.close(); await b.close(); }
  /* 3 · a take too loud */
  { const b = await launch(LOUD), { ctx, p, errs } = await standalone(b, "es");
    const lv = await record(p, 3500, false), s = await ST(p);
    await p.evaluate(() => document.documentElement.setAttribute("lang", "en")); await W(150); const en = (await ST(p)).line;
    ok(s.cap && s.cap.clip > 0 && /Esa toma sonó demasiado fuerte en partes\. Aléjate un poco o canta más suave\./.test(s.line) && /That take was too loud in places\. Move back a little, or sing softer\./.test(en) && lv.includes("hi"),
      `a take that clipped (${s.cap && s.cap.clip} samples at full scale) says, in Spanish and English: "${s.line}" / "${en}"; Your level showed amber while it was too loud (${JSON.stringify(lv)})`);
    ok(!errs.length, `no page errors for a loud take: ${errs.slice(0, 2).join(" | ")}`);
    await ctx.close(); await b.close(); }
  /* 4 · the pro stages, measured */
  { const b = await launch(VOICE), { ctx, p, errs } = await standalone(b, "en");
    const R = await p.evaluate(DSP), f1 = v => v.toFixed(1), f2 = v => v.toFixed(2);
    ok(R.nr.gaps <= -10 && R.nr.voice.every(v => Math.abs(v) <= 1) && R.nr.cvOut < 0.15, `Quiet the hiss (50): the hiss in the gaps ${f1(R.nr.gaps)} dB, the voice band ${R.nr.voice.map(f2).join(" / ")} dB, what is left stays a steady hiss (its level varies ${(R.nr.cvOut * 100).toFixed(1)} % from one 10 ms to the next, against ${(R.nr.cvIn * 100).toFixed(1)} % before): ${JSON.stringify(R.nr.info)}`);
    ok(R.hum.every(h => h.info.hum && Math.abs(h.info.hum - h.base) < 0.2 && h.d.every(d => d <= -20) && Math.abs(h.voice) <= 1), `Remove hum: ` + R.hum.map(h => `${h.base} Hz found at ${h.info.hum} Hz; ${h.base}/${2 * h.base}/${3 * h.base} Hz ${h.d.map(f1).join(" / ")} dB, the voice ${f2(h.voice)} dB`).join("; "));
    ok(R.br.every(r => r.info.breaths === 2 && r.b.every(v => Math.abs(v + r.cut) <= 2) && Math.abs(r.p) <= 0.3), `Breath control lowers each breath by about its amount, the singing untouched: ` + R.br.map(r => `−${r.cut} dB: breaths ${r.b.map(f1).join(" / ")} dB, singing ${f2(r.p)} dB`).join("; "));
    ok(R.ride.after < 0.5 * R.ride.before && R.ride.inner < 1, `Level rider: four phrases' loudness spread ${f2(R.ride.before)} → ${f2(R.ride.after)} dB, the gain inside a phrase moves at most ${f2(R.ride.inner)} dB (smooth, no pumping)`);
    ok(Math.abs(R.comp.soft.got - R.comp.soft.want) <= 0.5 && Math.abs(R.comp.loud.got - R.comp.loud.want) <= 0.5 && R.comp.loud.got < -4,
      `Squeeze (the opto compressor, at 100): threshold ${f1(R.comp.T)} dB, ratio ${f2(R.comp.R)}, knee ${R.comp.K} dB; a soft note ${f2(R.comp.soft.got)} dB (its curve says ${f2(R.comp.soft.want)}), a loud one ${f2(R.comp.loud.got)} dB (${f2(R.comp.loud.want)}); made up ${f1(R.comp.mk)} dB`);
    ok(R.comp.ripple < 0.2 && R.comp.step < 0.5 && R.comp.osc === 0, `no pumping: on a held 110 Hz note the gain ripples ${R.comp.ripple.toFixed(3)} dB, its largest step is ${R.comp.step.toFixed(3)} dB in ${R.comp.perStep.toFixed(2)} ms, and it never swings back and forth (${R.comp.osc})`);
    ok(R.comp.peak && R.comp.peak.max < -0.5 && R.comp.peak.mean > -0.5, `the peak catcher catches the loud note's first peaks (${R.comp.peak.max} dB at most) and otherwise leaves it (${R.comp.peak.mean} dB on average)`);
    const e20 = R.ess[0], e100 = R.ess[1];
    ok(e100.info.fc > 5000 && e100.info.fc < 10000 && e100.s <= -5 && e100.s2 <= -5 && Math.abs(e100.v) <= 0.5 && Math.abs(e100.v2) <= 0.5 && e20.s < -0.5 && e20.s > e100.s && Math.abs(e20.v) <= 0.5,
      `Soft S finds the s range (${e100.info.fc} Hz, cutting above ${e100.info.lo} Hz) and lowers the highs only in the s: at 100 ${f1(e100.s)} / ${f1(e100.s2)} dB in the s, ${f2(e100.v)} / ${f2(e100.v2)} dB in the vowels; at 20 (the sounds' usual) ${f1(e20.s)} dB, the vowels ${f2(e20.v)} dB`);
    const tw = R.tame[0], tn = R.tame[1];
    ok(tw.info && Math.abs(tw.info.f - 3150) < 160 && tw.info.cut < -1 && tw.at <= -1 && Math.abs(tw.k1) <= 0.2 && tn.info && tn.info.cut === 0 && Math.abs(tn.at) <= 0.1,
      `Smooth harsh spots finds a narrow ring at ${tw.info && tw.info.f} Hz (${tw.info && tw.info.dev} dB above the voice's shape) and dips it ${tw.info && tw.info.cut} dB (around it ${f2(tw.at)} dB, at 1 kHz ${f2(tw.k1)} dB); a voice with no ring is left alone (${f2(tn.at)} dB)`);
    ok(!errs.length, `no page errors in the pro stages: ${errs.slice(0, 2).join(" | ")}`);
    await ctx.close(); await b.close(); }
  /* 5 · in the Studio, with My Track: Echo, ducking, punch-in, best take, the fold on three screens */
  { const b = await launch(VOICE);
    for (const [nm, vp, lang] of [["iPhone", { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, "es"], ["iPad", { width: 1180, height: 820, hasTouch: true }, "en"]]) {
      const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: true, deviceScaleFactor: vp.deviceScaleFactor || 1, serviceWorkers: "block" }), errs = [];
      ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
      await routes(ctx, lang);
      const p = await ctx.newPage(); await p.goto(U + "the-studio#piano"); await W(4000);
      await p.evaluate(() => AOGStudioShell.go("pads")); await W(3500);
      const pads = p.frames().find(x => /music-pads/.test(x.url()));
      await pads.waitForFunction(() => document.querySelectorAll("#grpSel option").length > 3, null, { timeout: 30000 });
      await pads.evaluate(async () => { startBeat("boombap"); document.getElementById("bounceBtn").click(); for (let i = 0; i < 120 && document.getElementById("bounceAct").hidden; i++) await new Promise(r => setTimeout(r, 250)); document.getElementById("bStudio").click(); });
      await W(2500);
      await p.evaluate(() => AOGStudioShell.go("vocal"));
      let f = null; for (let i = 0; i < 80 && !f; i++) { const fr = p.frames().find(x => /music-vocal/.test(x.url())); if (fr && await fr.evaluate(() => !!window.AOGVocal && !!document.getElementById("vbRec")).catch(() => false)) f = fr; else await W(250); }
      ok(!!f, `${nm}: the booth opens in the Studio`); if (!f) { await ctx.close(); continue; }
      await f.waitForFunction(() => AOGVocal.state().bk, null, { timeout: 40000 }).catch(() => {});
      const fold0 = await f.evaluate(() => ({ open: document.getElementById("vbPro").open, h: document.getElementById("vbProH").getBoundingClientRect().height }));
      ok(!fold0.open && fold0.h >= 44, `${nm}: Pro tools is one fold, closed at first (${fold0.h.toFixed(0)} px)`);
      /* a first take, so the booth has its engine; then the takes the checks use, made here */
      await f.click("#vbRec"); await f.waitForFunction(() => AOGVocal.state().state === "rec", null, { timeout: 15000 }); await W(2500);
      await f.click("#vbRec"); await f.waitForFunction(() => AOGVocal.state().takes === 1 && AOGVocal.state().state === "idle", null, { timeout: 15000 });
      const s0 = await ST(f), sr = s0.take.sr, bk = s0.bk, bpm = bk.bpm, barSec = bk.barSec || 240 / bpm;
      /* Echo and its ducking on a pretend take at the song's tempo: phrases of 0.6 s with 1.4 s gaps */
      const E = await f.evaluate(async ([sr, bpm]) => { const n = Math.round(9 * sr), x = new Float32Array(n), on = t => (t % 2) > 0.3 && (t % 2) < 0.9;
        /* a breathy voice (noise in the voice's band), so the echo's lag shows as one sharp peak, never a period off */
        let sd = 9, lp = 0, hp = 0; const rn = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296 * 2 - 1; };
        for (let i = 0; i < n; i++) { const t = i / sr, w = rn(); lp += 0.35 * (w - lp); hp += 0.03 * (lp - hp); if (!on(t)) continue; x[i] = 0.5 * (lp - hp) * Math.min(1, ((t % 2) - 0.3) / 0.01, (0.9 - (t % 2)) / 0.01); }
        AOGVocal._take(x, sr, { head: 0.3, bpm });
        const base = { echo: 70, room: 0, dbl: 0, sq: 0, ss: 0, ride: 0, nr: 0, tame: 0, lc: 0 }, mk = o => AOGVocal.make("clean", Object.assign({}, base, o));
        /* the echo's lag against the take itself (a render carries the Plate's short tail, AOG-VOCAL-ENGINE-V1) */
        const dry = await mk({ echo: 0 }), lag = async et => { const w = await mk({ et, duck: 0 }), r = w.L.map((v, i) => v - (dry.L[i] || 0)), d = x; let best = -1, bl = 0;
          for (let L = Math.round(0.05 * sr); L < Math.round(1.6 * sr); L += 8) { let s = 0; for (let i = 0; i < Math.round(4 * sr); i += 4) s += r[i + L] * d[i]; if (s > best) { best = s; bl = L; } }
          for (let L = bl - 8; L <= bl + 8; L++) { let s = 0; for (let i = 0; i < Math.round(4 * sr); i += 2) s += r[i + L] * d[i]; if (s > best) { best = s; bl = L; } } return bl / sr; };
        const lags = { 100: await lag(100), 75: await lag(75), 50: await lag(50) };
        const e0 = await mk({ et: 75, duck: 0 }), e1 = await mk({ et: 75, duck: 100 }), res = m => m.L.map((v, i) => v - (dry.L[i] || 0));
        const r0 = res(e0), r1 = res(e1), seg = (r, inV) => { let s = 0, c = 0; for (let i = 0; i < Math.round(8 * sr); i++) { const t = i / sr, ph = t % 2; if (inV ? ph > 0.4 && ph < 0.85 : ph > 1.45 && ph < 1.95) { s += r[i] * r[i]; c++; } } return 10 * Math.log10(s / c); };
        /* the Room's tone, on a bright pretend voice (harmonics up to 10 kHz): its share above 5 kHz */
        const y = new Float32Array(Math.round(4 * sr)); for (let i = 0; i < y.length; i++) { const t = i / sr; if (!on(t)) continue; let v = 0; for (let k = 1; k * 200 < 10000; k++) v += Math.sin(2 * Math.PI * 200 * k * t) / Math.sqrt(k); y[i] = 0.1 * v * Math.min(1, ((t % 2) - 0.3) / 0.01, (0.9 - (t % 2)) / 0.01); }
        AOGVocal._take(y, sr, { head: 0.3, bpm });
        const dryB = await mk({ echo: 0 }), hiShare = async rhc => { const w = await mk({ echo: 0, room: 60, rhc }), r = w.L.map((v, i) => v - (dryB.L[i] || 0));
          const oc = new OfflineAudioContext(1, r.length, sr), b = oc.createBuffer(1, r.length, sr); b.copyToChannel(r, 0); const so = oc.createBufferSource(); so.buffer = b; let nd = so;
          for (let k = 0; k < 4; k++) { const z = oc.createBiquadFilter(); z.type = "highpass"; z.frequency.value = 5000; nd.connect(z); nd = z; } nd.connect(oc.destination); so.start(0);
          const h = (await oc.startRendering()).getChannelData(0); let a = 0, t = 0; for (let i = 0; i < r.length; i++) { a += h[i] * h[i]; t += r[i] * r[i]; } return a / t; };
        return { lags, inV: seg(r1, true) - seg(r0, true), gap: seg(r1, false) - seg(r0, false), dark: await hiShare(4000), bright: await hiShare(12000) }; }, [sr, bpm]);
      const beat = 60 / bpm;
      ok(Math.abs(E.lags[100] - beat) < 0.002 && Math.abs(E.lags[75] - 0.75 * beat) < 0.002 && Math.abs(E.lags[50] - 0.5 * beat) < 0.002,
        `${nm}: the Echo is locked to the song's tempo (${bpm} bpm): 1/4 lands ${(E.lags[100] * 1000).toFixed(1)} ms after the voice (a beat is ${(beat * 1000).toFixed(1)}), dotted 1/8 ${(E.lags[75] * 1000).toFixed(1)} ms, 1/8 ${(E.lags[50] * 1000).toFixed(1)} ms`);
      ok(E.inV <= -6 && Math.abs(E.gap) <= 2.5, `${nm}: Keep words clear ducks the echo while the voice sings (${E.inV.toFixed(1)} dB at 100) and lets it back in the gaps (${E.gap.toFixed(1)} dB)`);
      ok(E.dark < 0.3 * E.bright, `${nm}: Room tone darkens the room (above 5 kHz the room has ${(E.dark * 100).toFixed(2)} % of its sound at Darker, ${(E.bright * 100).toFixed(2)} % at Bright)`);
      /* Sing a part again: a pretend take of 330 Hz over bars 1-4, then bars 2-3 sung again */
      const base = await f.evaluate(([sr, barSec]) => { const n = Math.round((0.25 + 4 * barSec + 0.4) * sr), x = new Float32Array(n);
        for (let i = 0; i < n; i++) { const t = i / sr; x[i] = 0.25 * Math.sin(2 * Math.PI * 330 * t) * Math.min(1, t / 0.02); }
        AOGVocal._take(x, sr, { head: 0.25, bk: "now", from: 1 }); return AOGVocal.state().takes; }, [sr, barSec]);
      if (!(await f.evaluate(() => document.getElementById("vbPro").open))) { await f.click("#vbProH"); await W(250); }
      await f.selectOption("#vbPa", "2"); await f.selectOption("#vbPb", "3"); await W(150);
      await f.click("#vbPgo"); await f.waitForFunction(() => AOGVocal.state().state === "rec", null, { timeout: 15000 });
      const pline = (await ST(f)).line;
      await f.waitForFunction(k => AOGVocal.state().takes === k + 1 && AOGVocal.state().state === "idle", base, { timeout: 60000 }).catch(() => {});
      const P = await f.evaluate(([sr, barSec]) => { const s = AOGVocal.state(), n = s.takes, a = AOGVocal.takeDry(n - 2), b = AOGVocal.takeDry(n - 1), i0 = Math.round((0.25 + barSec) * sr), i1 = Math.round((0.25 + 3 * barSec) * sr), h = Math.round(0.0075 * sr);
        let outside = 0; for (let i = 0; i < a.length; i++) if ((i < i0 - h || i >= i1 + h) && a[i] !== b[i]) outside++;
        const gz = (x, f, p, q) => { const w = 2 * Math.cos(2 * Math.PI * f / sr); let s1 = 0, s2 = 0; for (let i = p; i < q; i++) { const v = x[i] + w * s1 - s2; s2 = s1; s1 = v; } return s1 * s1 + s2 * s2 - w * s1 * s2; };
        const m0 = i0 + Math.round(0.2 * sr), m1 = i1 - Math.round(0.2 * sr), kept = 10 * Math.log10(gz(b, 330, m0, m1) / gz(a, 330, m0, m1));
        let e = 0, eb = 0; for (let i = m0; i < m1; i++) { e += b[i] * b[i]; eb += a[i] * a[i]; }
        const step = (x, c) => { let m = 0; for (let i = Math.max(2, c - Math.round(0.02 * sr)); i < c + Math.round(0.02 * sr); i++) m = Math.max(m, Math.abs(x[i] - 2 * x[i - 1] + x[i - 2])); return m; };
        let nat = 0; for (let i = 2; i < a.length; i++) nat = Math.max(nat, Math.abs(a[i] - 2 * a[i - 1] + a[i - 2]), i > i0 && i < i1 ? Math.abs(b[i] - 2 * b[i - 1] + b[i - 2]) : 0);
        return { n, len: [a.length, b.length], outside, kept, energy: e / eb, joins: [step(b, i0), step(b, i1)], nat, line: s.line, take: s.take }; }, [sr, barSec]);
      ok(/Canta los compases 2 a 3|Sing bars 2 to 3/.test(pline) && P.n === base + 1 && P.len[0] === P.len[1] && P.outside === 0 && P.kept < -12 && P.energy > 0.02,
        `${nm}: Sing a part again (bars 2–3, "${pline}") makes take ${P.n}: the same length (${P.len[1]} samples), outside the bars the old take sample for sample (${P.outside} differ), inside the new singing (the old 330 Hz tone ${P.kept.toFixed(1)} dB); "${P.line}"`);
      ok(P.joins.every(j => j <= 1.05 * P.nat), `${nm}: the joins are crossfaded, no click (the largest step at each join ${P.joins.map(j => j.toFixed(3)).join(" / ")}, against ${P.nat.toFixed(3)} anywhere in the two takes)`);
      /* Best take: two pretend takes, 220 Hz and 330 Hz, three lines at the same times */
      const C0 = await f.evaluate(sr => { const mk = hz => { const n = Math.round(5 * sr), x = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / sr, ph = [[0.5, 1.5], [2.0, 3.0], [3.5, 4.5]].find(q => t >= q[0] && t < q[1]); if (ph) x[i] = 0.3 * Math.sin(2 * Math.PI * hz * t) * Math.min(1, (t - ph[0]) / 0.01, (ph[1] - t) / 0.01); } return x; };
        const a = AOGVocal._take(mk(220), sr, { head: 0.25 }), b = AOGVocal._take(mk(330), sr, { head: 0.25 }); return { a, b, takes: AOGVocal.state().takes }; }, sr);
      await f.click(`.vb-tk[data-i="${C0.takes - 2}"]`); await W(300);
      await f.waitForFunction(() => { const c = AOGVocal.state().comp; return c && c.lines && c.lines.length; }, null, { timeout: 10000 }).catch(() => {});
      const lines = (await ST(f)).comp;
      await f.click(`.vb-tc[data-l="1"][data-t="${C0.b}"]`); await W(200);
      const ui = await f.evaluate(() => { const r = e => e.getBoundingClientRect(), bs = [...document.querySelectorAll("#vbComp button")]; return { n: bs.length, small: bs.filter(x => r(x).height < 44 || r(x).width < 44).length, pressed: bs.filter(x => x.getAttribute("aria-pressed") === "true").map(x => x.getAttribute("aria-label")) }; });
      await f.click("#vbCgo"); await W(400);
      const CB = await f.evaluate(sr => { const s = AOGVocal.state(), x = AOGVocal.takeDry(), a = AOGVocal.takeDry(s.takes - 3);
        const gz = (f, p, q) => { const w = 2 * Math.cos(2 * Math.PI * f / sr); let s1 = 0, s2 = 0; for (let i = Math.round(p * sr); i < Math.round(q * sr); i++) { const v = x[i] + w * s1 - s2; s2 = s1; s1 = v; } return s1 * s1 + s2 * s2 - w * s1 * s2; };
        return { takes: s.takes, len: [a.length, x.length], line: s.line, which: [[0.7, 1.3], [2.2, 2.8], [3.7, 4.3]].map(q => gz(330, q[0], q[1]) > gz(220, q[0], q[1]) ? 330 : 220) }; }, sr);
      ok(lines && lines.lines && lines.lines.length === 3 && lines.lines.every((l, i) => Math.abs(l[0] - [0.5, 2.0, 3.5][i]) < 0.05 && Math.abs(l[1] - [1.5, 3.0, 4.5][i]) < 0.05) && ui.small === 0 && ui.pressed.length === 3,
        `${nm}: Best take finds the three lines (${lines && lines.lines && lines.lines.map(l => l.map(v => v.toFixed(2)).join("–")).join(", ")} s), each with the takes as choices of 44 px or more (${ui.n} keys): ${ui.pressed.join("; ")}`);
      ok(CB.takes === C0.takes + 1 && CB.which.join() === "220,330,220" && CB.len[0] === CB.len[1] && /made from your best lines|hecha con tus mejores frases/.test(CB.line),
        `${nm}: Make the best take builds a new take with line 1 and 3 from take 1 and line 2 from take 2 (${CB.which.join(" / ")} Hz), the same length (${CB.len[1]} samples): "${CB.line}"`);
      /* the fold on this screen (and sideways on the iPhone), in both languages, on a take with My Track's bars (so Sing a part
         again shows too) */
      await f.click('.vb-tk[data-i="3"]'); await W(300);
      const look = async () => f.evaluate(() => { const r = e => e.getBoundingClientRect(), fold = document.getElementById("vbPro"), bs = [...fold.querySelectorAll("button,select,summary,label.vb-c")].filter(x => x.offsetParent);
        return { sw: document.scrollingElement.scrollWidth, iw: innerWidth, small: bs.filter(x => r(x).height < 44).map(x => x.id || x.className), out: bs.filter(x => r(x).right > innerWidth + 1).map(x => x.id || x.className), text: fold.innerText }; });
      const words = { en: ["Pro tools", "Count me in", "Click in my headphones", "Quiet the hiss", "Remove hum", "Breath control", "Level rider", "Smooth harsh spots", "Echo time", "Keep words clear", "Room delay", "Room tone", "Sing a part again", "Best take", "Make the best take"],
        es: ["Herramientas pro", "Cuenta antes de empezar", "Clic en mis audífonos", "Quitar el siseo", "Quitar el zumbido", "Respiraciones", "Nivel parejo", "Suavizar lo áspero", "Tiempo del eco", "Palabras claras", "Retardo de la sala", "Tono de la sala", "Volver a cantar una parte", "La mejor toma", "Hacer la mejor toma"] };
      const shots = [];
      for (const lg of ["en", "es"]) { await f.evaluate(l => document.documentElement.setAttribute("lang", l), lg); await W(200); const L = await look(); shots.push([lg, L, words[lg].filter(w => !L.text.toLowerCase().includes(w.toLowerCase()))]); }
      if (nm === "iPhone") { await p.setViewportSize({ width: 844, height: 390 }); await W(700); const L = await look(); shots.push(["sideways", L, []]); await p.setViewportSize({ width: 390, height: 844 }); await W(400); }
      ok(shots.every(s => s[1].sw <= s[1].iw && !s[1].small.length && !s[1].out.length && !s[2].length),
        `${nm}: Pro tools fits (upright${nm === "iPhone" ? ", sideways" : ""}), every key 44 px or more, every word there in English and Spanish: ${JSON.stringify(shots.map(s => ({ at: s[0], sw: s[1].sw, iw: s[1].iw, small: s[1].small, out: s[1].out, missing: s[2] })))}`);
      const pc = await f.evaluate(`(${PROBE})()`), pk = await f.evaluate(`(${CALM})()`);
      ok(!pc.length && !pk.length, `${nm}: with Pro tools open the booth reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
      ok(!errs.length, `${nm}: no page errors: ${errs.slice(0, 3).join(" | ")}`);
      await ctx.close();
    }
    await b.close(); }
  srv.close();
  console.log(fails ? fails + " FAILED" : "ALL PASS");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + (e && e.stack || e)); process.exit(1); });
