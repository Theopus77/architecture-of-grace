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
  r.peak = Math.max(...peaks);
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
    ok(s.snd === "chop" && s.hear && words.length === 9 && words.every(w => w.length > 8), `${nm}: each of the nine More sounds can be tapped as it plays; Chop picked, still playing: ${words.join(" | ")}`);
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
    await f.click("#vbRec"); await f.waitForFunction(() => AOGVocal.state().state === "rec", null, { timeout: 15000 }); await W(2500);
    await f.click("#vbRec"); await f.waitForFunction(() => AOGVocal.state().takes === 2, null, { timeout: 15000 }).catch(() => {});
    s = await ST(f);
    ok(s.takes === 2 && s.cur === 1 && !s.take.added && (await gums(p)) === 1, `${nm}: a second take is kept beside the first and picked, the microphone kept ready, not asked for again (AOG-VOCAL-MIC-V3): ${JSON.stringify({ takes: s.takes, cur: s.cur, asks: await gums(p) })}`);
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
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
