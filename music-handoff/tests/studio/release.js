/* AOG-DESK-LUFS-V1, AOG-DESK-BITS-V1, AOG-DESK-CHOPS-OUT-V1 — Jimmy, 2026-10-11: "Release-ready output. Add a loudness
   meter and the loudness streaming services use (−14 LUFS). Add a 24-bit choice. Put your chops into Send it out."
   - The meter measures as ITU-R BS.1770-4 does: the K-weighting's numbers at 48 kHz are the standard's own; a 997 Hz
     sine at −20 dBFS in both channels reads −20.0 LUFS (EBU Tech 3341 case 1/2: in both channels the K-weighting's
     +0.69 dB at 1 kHz and the −0.691 of the formula cancel, so a stereo sine at −20 dBFS is −20.0 LUFS; −3.01 LU less,
     −23.0, when it is in one channel only). Offline, and live through the meter's own filters, Now and Last 3 s.
   - Integrated loudness and its two gates on synthetic songs (EBU Tech 3341 cases 3, 4, 5: each −23.0 LUFS), and the
     true peak of a sine at a quarter of the sample rate whose samples miss its top by 3 dB.
   - On the desk: the readout moves only while the song plays, at most twice a second, and rests when it stops; the whole
     song is measured by Make the mix.
   - Send it out lands at −14.0 ± 0.3 LUFS with its true peak at or under −1 dBTP; a song that would pass the ceiling
     stops at it and says so; a very quiet one goes up 12 dB, no more.
   - 16-bit (the default, dithered) and 24-bit files: the header is right (PCM, 24 bits, 6 bytes a frame), they decode
     back to the desk's own sound within one step, 16-bit has its dither and 24-bit none; the stems and the mix follow
     the choice; the choice is kept after a reload.
   - Your chops: the Drum Machine's chops bank, cut from your own take, comes out as a .zip of its own, one .wav a chop,
     named after the record, in the pads' order, beat by beat; a crate record is not yours and is not sent out.
   - Spanish; an iPhone and an iPad, light and dark: nothing sideways, readable and calm; no page errors. Port 9268. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const PORT = 9268, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const OUTD = process.env.AOG_SHOTS || fs.mkdtempSync(path.join(os.tmpdir(), "release-"));
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
/* AOG-DESK-QUIET-V1: under the console, Save, Open and Share open their own sheets (one at a time); the Mixer and Song settings
   are folds, and the rarer things in a sheet or fold wait under its More. A test opens them as a person would. */
const qSheet = async (p, k) => { const id = { save: "qSave", open: "qOpen", share: "qShare" }[k]; if ((await p.getAttribute("#" + id, "aria-expanded")) !== "true") await p.click("#" + id); };
const qFold = async (p, id) => { if (!(await p.evaluate(i => document.getElementById(i).open, id))) await p.click("#" + id + " > summary"); };
const qSong = async p => { await qFold(p, "foldSong"); await qFold(p, "mMore"); };
const qSaveMore = async p => { await qSheet(p, "save"); await qFold(p, "lkMore"); };
const qShareMore = async p => { await qSheet(p, "share"); await qFold(p, "outMore"); };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
async function routes(ctx) { await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort()); }

/* a take, made in the page and sent to the desk: "tones" (a steady tone a bar, as in studio/sendout), "bursts" (short
   loud 1 kHz hits, mostly silence: a song whose peaks are far above its loudness), "beats" (16 beats at 100 a minute,
   each its own tone, then 20 ms more, the way the Turntables send chops) */
const TAKE = `(async (o) => { const sr = 44100, head = o.kind === "beats" ? 0 : 0.05, sec = o.kind === "beats" ? 16 * 0.6 + 0.02 : head + 2.4 * 4, len = Math.round(sec * sr);
  const ab = new ArrayBuffer(44 + len * 4), v = new DataView(ab), s = (q, t) => { for (let i = 0; i < t.length; i++) v.setUint8(q + i, t.charCodeAt(i)); };
  s(0, "RIFF"); v.setUint32(4, 36 + len * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, len * 4, true);
  let ph = 0;
  for (let i = 0; i < len; i++) { const t = i / sr - head; let x = 0;
    if (t >= 0) {
      if (o.kind === "tones") { const k = Math.min(o.freqs.length - 1, Math.floor(t / 2.4)); ph += 2 * Math.PI * o.freqs[k] / sr; x = 7000 * Math.sin(ph); }
      else if (o.kind === "bursts") { const u = t % 0.2; x = 29000 * Math.exp(-u / 0.006) * Math.sin(2 * Math.PI * 1000 * u); }
      else { const k = Math.min(15, Math.floor(t / 0.6)); ph += 2 * Math.PI * (300 + 50 * k) / sr; x = 9000 * Math.sin(ph); } }
    v.setInt16(44 + i * 4, Math.round(x), true); v.setInt16(46 + i * 4, Math.round(x), true); }
  const r = await AOGHandoff.add(AOGHandoff.INBOX, { from: o.from || "guitar", n: o.n, name: o.name || { en: "Guitar take " + o.n, es: "Toma de guitarra " + o.n }, sec, bpm: 100, at: Date.now() + o.n, take: true,
    chops: o.kind === "beats" || undefined, wav: new Blob([ab], { type: "audio/wav" }) }, { key: "rel|" + o.n });
  return r && r.id; })`;
const add = (p, o) => p.evaluate(`(${TAKE})(${JSON.stringify(o)})`);
async function put(p, take, track) {
  await p.selectOption("#trackSel", String(track));
  const v = await p.evaluate(nm => [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === nm).value, take);
  await p.selectOption("#srcSel", v); await p.click("#putBtn");
  await p.waitForFunction(t => __aogStudio.SONG.tracks[t].clip && !__aogStudio.S.busy, track, { timeout: 15000 });
}
async function song(p) {
  await add(p, { n: 1, kind: "tones", freqs: [220, 330, 440, 550] }); await add(p, { n: 2, kind: "tones", freqs: [660, 550, 440, 330] });
  await p.waitForFunction(() => __aogStudio.INBOX.items.length >= 2, null, { timeout: 8000 });
  await put(p, "Guitar take 1", 0); await put(p, "Guitar take 2", 1);
  await qSheet(p, "share"); await p.fill("#songName", "Rainy day");
}
const line = (p, id) => p.evaluate(i => document.getElementById(i).textContent.trim(), id);
async function sendOut(p) {
  await p.evaluate(() => { __aogStudio.OUT.song = null; document.getElementById("outBox").innerHTML = ""; });
  await qSheet(p, "share"); await p.click("#outBtn");
  await p.waitForFunction(() => !__aogStudio.OUT.busy && (__aogStudio.OUT.song || document.getElementById("outLine").textContent), null, { timeout: 60000 });
}
/* the file Send it out made: its header, read byte by byte; decoded, its loudness and true peak (the page's own meter,
   checked against the standard above); and how far it is from the desk's own sound at the file's level */
const fileInfo = (p, k) => p.evaluate(async k => {
  const st = __aogStudio, o = st.OUT[k || "song"]; if (!o) return null;
  const ab = await o.file.arrayBuffer(), v = new DataView(ab), s4 = q => String.fromCharCode(v.getUint8(q), v.getUint8(q + 1), v.getUint8(q + 2), v.getUint8(q + 3));
  const hd = { riff: s4(0), wave: s4(8), fmt: s4(12), fmtLen: v.getUint32(16, true), format: v.getUint16(20, true), ch: v.getUint16(22, true), sr: v.getUint32(24, true),
    byteRate: v.getUint32(28, true), align: v.getUint16(32, true), bits: v.getUint16(34, true), data: s4(36), dataLen: v.getUint32(40, true), riffLen: v.getUint32(4, true), size: ab.byteLength };
  /* AOG-EXPORT-PRO-V1: after the sound, exactly one LIST INFO chunk (the song's name, artist, tempo and key), and nothing else */
  const at = 44 + hd.dataLen; hd.list = at + 12 <= ab.byteLength && s4(at) === "LIST" && s4(at + 8) === "INFO" && at + 8 + v.getUint32(at + 4, true) === ab.byteLength ? 8 + v.getUint32(at + 4, true) : -1;
  const buf = await new OfflineAudioContext(2, 1, 44100).decodeAudioData(ab.slice(0));
  const L = buf.getChannelData(0), R = buf.getChannelData(1), ld = st.loudOf(L, R, 44100);
  const out = { name: o.file.name, hd, frames: buf.length, lufs: +ld.lufs.toFixed(2), tpDb: +ld.tpDb.toFixed(3), g: o.g, why: o.why, bits: o.bits };
  if (k === "song" || !k) {
    const r = await st.renderSong(null), g = o.g; let err = 0, tailF = 0, tailQ = 0, nz = 0, n = 0;
    for (let i = 0; i < Math.min(L.length, r.Lc.length); i++) { const e = Math.abs(L[i] - Math.max(-1, Math.min(1, r.Lc[i] * g))); if (e > err) err = e; }
    const t0 = L.length - Math.round(0.4 * 44100);
    for (let i = t0; i < L.length; i++) { tailF = Math.max(tailF, Math.abs(r.Lc[i] * g)); tailQ = Math.max(tailQ, Math.abs(L[i])); if (L[i] !== 0) nz++; n++; }
    Object.assign(out, { errLsb16: +(err * 32768).toFixed(3), errLsb24: +(err * 8388608).toFixed(3), tailF, tailQ16: +(tailQ * 32768).toFixed(2), tailNonZero: +(nz / n).toFixed(3) });
  }
  return out;
}, k);
const py = (zipPath) => JSON.parse(cp.execFileSync("python3", ["-I", "-c", `import zipfile,sys,json,wave,io,struct
z=zipfile.ZipFile(sys.argv[1]); bad=z.testzip(); out=[]
for n in z.namelist():
    w=wave.open(io.BytesIO(z.read(n))); f=w.readframes(w.getnframes()); sw=w.getsampwidth(); fr=w.getnframes()
    # the zero crossings of the left channel in its middle half: how high its tone is
    if sw==2: xs=[struct.unpack_from('<h',f,i*4)[0] for i in range(fr)]
    else: xs=[int.from_bytes(f[i*6:i*6+3],'little',signed=True) for i in range(fr)]
    a,b=fr//4,3*fr//4; zc=sum(1 for i in range(a+1,b) if (xs[i-1]<0)!=(xs[i]<0))
    out.append([n,fr,w.getnchannels(),w.getframerate(),sw,round(zc/2/((b-a)/w.getframerate()))])
print(json.dumps({"bad":bad,"files":out}))`, zipPath]).toString());
async function grab(p, sel, name) { const [d] = await Promise.all([p.waitForEvent("download"), p.click(sel)]); const f = path.join(OUTD, name || d.suggestedFilename()); await d.saveAs(f); return { f, name: d.suggestedFilename() }; }

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* 1 · the meter measures as the standard does */
  const c = await b.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true }); watch(c); await routes(c);
  const p = await c.newPage(); await p.goto(U + "music-studio.html"); await p.waitForTimeout(700);
  const sentUp = []; p.on("request", r => { if (r.method() !== "GET" || r.postData()) sentUp.push(r.method() + " " + r.url()); });
  const k48 = await p.evaluate(() => __aogStudio.kCoef(48000));
  const REF = [1.53512485958697, -2.69169618940638, 1.19839281085285, -1.69065929318241, 0.73248077421585, -1.99004745483398, 0.99007225036621];
  const got = [k48[0].b[0], k48[0].b[1], k48[0].b[2], k48[0].a[1], k48[0].a[2], k48[1].a[1], k48[1].a[2]];
  ok(got.every((x, i) => Math.abs(x - REF[i]) < 1e-8) && k48[1].b.join() === "1,-2,1", "the K-weighting at 48 kHz is BS.1770-4's own: " + got.map(x => x.toFixed(8)).join(", "));
  const sines = await p.evaluate(() => { const st = __aogStudio, out = {};
    for (const sr of [48000, 44100]) { const n = sr * 5, L = new Float32Array(n), Z = new Float32Array(n); for (let i = 0; i < n; i++) L[i] = 0.1 * Math.sin(2 * Math.PI * 997 * i / sr);
      out[sr] = { both: +st.loudOf(L, L, sr).lufs.toFixed(3), left: +st.loudOf(L, Z, sr).lufs.toFixed(3) }; }
    return out; });
  ok(Math.abs(sines[48000].both + 20) < 0.05 && Math.abs(sines[44100].both + 20) < 0.05 && Math.abs(sines[48000].left + 23.01) < 0.05 && Math.abs(sines[44100].left + 23.01) < 0.05,
    "a 997 Hz sine at −20 dBFS reads −20.0 LUFS in both channels and −23.0 in one (EBU Tech 3341), at 48 and 44.1 kHz: " + JSON.stringify(sines));
  /* EBU Tech 3341 cases 3, 4 and 5: steps of a 1 kHz stereo sine; each is −23.0 LUFS, which only the two gates give */
  const gates = await p.evaluate(() => { const st = __aogStudio, sr = 48000;
    const mk = parts => { const n = Math.round(parts.reduce((a, q) => a + q[1], 0) * sr), L = new Float32Array(n); let i = 0;
      parts.forEach(([db, s]) => { const a = Math.pow(10, db / 20), e = i + Math.round(s * sr); for (; i < e; i++) L[i] = a * Math.sin(2 * Math.PI * 1000 * i / sr); }); return L; };
    const plain = L => { const P = []; let s = 0; for (let i = 0; i < L.length; i++) s += L[i] * L[i]; return -0.691 + 10 * Math.log10(2 * s / L.length) + 0.691; };
    const cases = { c3: [[-36, 10], [-23, 60], [-36, 10]], c4: [[-72, 10], [-36, 10], [-23, 60], [-36, 10], [-72, 10]], c5: [[-26, 20], [-20, 20.1], [-26, 20]] }, out = {};
    for (const k in cases) { const L = mk(cases[k]); out[k] = { lufs: +st.loudOf(L, L, sr).lufs.toFixed(2), ungated: +plain(L).toFixed(2) }; }
    return out; });
  ok(Object.values(gates).every(x => Math.abs(x.lufs + 23) <= 0.1) && Math.abs(gates.c3.ungated + 23) > 0.5 && Math.abs(gates.c4.ungated + 23) > 0.5,
    "integrated loudness with its gates: EBU 3341 cases 3, 4, 5 all read −23.0 LUFS (3 and 4 only because of the gates): " + JSON.stringify(gates));
  const tp = await p.evaluate(() => { const n = 44100, x = new Float32Array(n), r = 2000;
    for (let i = 0; i < n; i++) { const w = i < r ? 0.5 - 0.5 * Math.cos(Math.PI * i / r) : i > n - r ? 0.5 - 0.5 * Math.cos(Math.PI * (n - i) / r) : 1; x[i] = w * 0.5 * Math.sin(Math.PI / 2 * i + Math.PI / 4); }
    let sp = 0; for (const v of x) sp = Math.max(sp, Math.abs(v)); return { sample: +(20 * Math.log10(sp)).toFixed(2), tp: +(20 * Math.log10(__aogStudio.truePeak([x]))).toFixed(3) }; });
  ok(Math.abs(tp.sample + 9.03) < 0.02 && Math.abs(tp.tp + 6.02) < 0.05, `true peak, 4× oversampled: a sine at a quarter of the sample rate, its samples at ${tp.sample} dB, its top found at ${tp.tp} dBTP (−6.02)`);
  /* live, through the meter's own filters (IIRFilterNode with these numbers), as the desk listens */
  const liveM = await p.evaluate(async () => { const st = __aogStudio, out = {};
    for (const both of [true, false]) {
      const c = new AudioContext(); await c.resume(); const o = c.createOscillator(), g = c.createGain(), m = c.createChannelMerger(2);
      o.frequency.value = 997; g.gain.value = 0.1; o.connect(g); g.connect(m, 0, 0); if (both) g.connect(m, 0, 1);
      const T = st.lufsTap(c, m); o.start(); st.lufsStart(T);
      await new Promise(res => { const iv = setInterval(() => { st.lufsStep(T); if (T.played >= 3.6 * T.sr) { clearInterval(iv); res(); } }, 100); });
      out[both ? "both" : "left"] = { now: +T.mom.toFixed(2), last3: +T.st.toFixed(2), sr: T.sr }; o.stop(); await c.close(); }
    return out; });
  ok(Math.abs(liveM.both.now + 20) < 0.3 && Math.abs(liveM.both.last3 + 20) < 0.3 && Math.abs(liveM.left.now + 23) < 0.3 && Math.abs(liveM.left.last3 + 23) < 0.3,
    "live: Now and Last 3 s read −20.0 for the stereo sine and −23.0 for it in one channel: " + JSON.stringify(liveM));

  /* 2 · on the desk: the readout while the song plays, then the whole song */
  const ui = await p.evaluate(() => ({ t: document.getElementById("lufsBox").innerText.replace(/\s+/g, " ").trim(), sel: document.getElementById("bitsSel").value,
    opts: [...document.querySelectorAll("#bitsSel option")].map(o => o.textContent), lab: document.querySelector(".st-bits .st-lab").textContent }));
  ok(/^Loudness · LUFS Now — Last 3 s — Whole song — Song peak — LUFS is how loud music sounds to the ear\. Streaming services play songs at −14\. The whole song is measured when you make the mix or send it out\.$/i.test(ui.t),
    "the loudness meter waits, with one line on what LUFS is: " + ui.t);
  ok(ui.sel === "16" && ui.opts.join(" | ") === "16-bit · smaller file | 24-bit · studio quality" && ui.lab === "File quality", "the file's quality: 16-bit to start: " + JSON.stringify(ui));
  await song(p);
  const run = await p.evaluate(async () => { const st = __aogStudio, el = document.getElementById("luSt"), seen = [];
    let n = 0; const mo = new MutationObserver(() => { n++; seen.push(el.textContent); }); mo.observe(document.getElementById("lufsBox"), { subtree: true, childList: true, characterData: true });
    st.play(); await new Promise(r => setTimeout(r, 5200)); const during = { now: document.getElementById("luNow").textContent, last3: el.textContent, T: st.LU.tap && +st.LU.tap.st.toFixed(2) };
    st.stop(); await new Promise(r => setTimeout(r, 200)); mo.disconnect();
    return { during, after: [document.getElementById("luNow").textContent, el.textContent], changes: n, seen: seen.slice(-4) }; });
  ok(/^−\d+\.\d$/.test(run.during.now) && /^−\d+\.\d$/.test(run.during.last3) && run.changes >= 4 && run.changes <= 24 && run.after.join() === "—,—",
    `while the song plays it reads Now ${run.during.now} and Last 3 s ${run.during.last3}, a few changes a second at most (${run.changes} in 5 s, both numbers), and rests when it stops`);
  await qSheet(p, "share"); await p.click("#mixBtn"); await p.waitForFunction(() => /ready|did not/.test(document.getElementById("mixLine").textContent), null, { timeout: 60000 });
  const whole = await p.evaluate(async () => { const st = __aogStudio, buf = await new OfflineAudioContext(2, 1, 44100).decodeAudioData(await st.MIX.wav.arrayBuffer()), ld = st.loudOf(buf.getChannelData(0), buf.getChannelData(1), 44100);
    return { shown: document.getElementById("luSong").textContent, pk: document.getElementById("luPk").textContent, lufs: +ld.lufs.toFixed(2), tp: +ld.tpDb.toFixed(2), line: document.getElementById("mixLine").textContent }; });
  ok(whole.line === "Your mix is ready." && Math.abs(parseFloat(whole.shown.replace("−", "-")) - whole.lufs) < 0.06 && Math.abs(parseFloat(whole.pk.replace("−", "-")) - whole.tp) < 0.06 && Math.abs(whole.lufs - run.during.T) < 1.0,
    `Make the mix measures the whole song: ${whole.shown} LUFS, peak ${whole.pk} (the file: ${whole.lufs}, ${whole.tp}; the last 3 s while it played: ${run.during.T})`);

  /* 3 · Send it out, 16-bit: −14 LUFS, true peak at or under −1, dithered */
  await sendOut(p);
  let f16 = await fileInfo(p);
  ok(f16 && f16.name === "rainy-day.wav" && Math.abs(f16.lufs + 14) <= 0.3 && f16.tpDb <= -1 && f16.why === "aim", `Send it out: ${f16.lufs} LUFS, true peak ${f16.tpDb} dBTP (gain ${f16 && (20 * Math.log10(f16.g)).toFixed(2)} dB)`);
  const loud = await line(p, "outLoud");
  ok(/^Loudness −14\.0 LUFS · peak −\d+\.\d dB$/.test(loud) && (await line(p, "outBox")).includes("Your file is ready · 16-bit ·"), "it says so in plain words: " + loud);
  ok(f16.hd.riff === "RIFF" && f16.hd.wave === "WAVE" && f16.hd.format === 1 && f16.hd.ch === 2 && f16.hd.sr === 44100 && f16.hd.bits === 16 && f16.hd.align === 4 && f16.hd.byteRate === 44100 * 4 &&
    f16.hd.dataLen === f16.frames * 4 && f16.hd.riffLen === f16.hd.size - 8 && f16.hd.list > 12 && f16.hd.size === 44 + f16.frames * 4 + f16.hd.list, "16-bit header: PCM, stereo, 44.1 kHz, 16 bits, 4 bytes a frame: " + JSON.stringify(f16.hd));
  /* TPDF dither on silence: a step of ±1 about a quarter of the time (the two random steps add to more than half a step) */
  /* within two steps: the dither's one, the rounding's half, and the browser's own decoding (it reads a step above
     the middle as 1/32767, below as 1/32768) */
  ok(f16.errLsb16 <= 2 && f16.tailF < 1e-6 && f16.tailNonZero > 0.15 && f16.tailNonZero < 0.35 && f16.tailQ16 <= 1,
    `it decodes back to the desk's sound within ${f16.errLsb16} of a 16-bit step; where the song is silent the dither is there (${f16.tailNonZero * 100}% of samples, at most ${f16.tailQ16} steps)`);
  const bytes = () => p.evaluate(async () => { const u = new Uint8Array(await __aogStudio.OUT.song.file.arrayBuffer()); let h = 0; for (let i = 0; i < u.length; i++) h = (Math.imul(h, 31) + u[i]) | 0; return u.length + ":" + h; });
  const h1 = await bytes(); await sendOut(p); const h2 = await bytes();
  ok(h1 === h2, "the same song makes the very same file, dither and all (" + h1 + ")");
  const [d16] = await Promise.all([p.waitForEvent("download"), p.click('[data-outdl="song"]')]); const w16 = path.join(OUTD, "rainy-day-16.wav"); await d16.saveAs(w16);
  const pyw = cp.execFileSync("python3", ["-I", "-c", "import wave,sys; w=wave.open(sys.argv[1]); print(w.getsampwidth(), w.getnchannels(), w.getframerate(), w.getnframes())", w16]).toString().trim();
  ok(pyw === `2 2 44100 ${f16.frames}`, "any .wav reader opens the download: " + pyw);

  /* 4 · 24-bit: chosen, kept, and right */
  await qShareMore(p); await p.selectOption("#bitsSel", "24");
  ok(await p.evaluate(() => localStorage.getItem("aog.studio.bits.v1")) === "24" && await p.evaluate(() => __aogStudio.bits()) === 24, "24-bit is chosen and kept on this device");
  await sendOut(p);
  const f24 = await fileInfo(p);
  ok(f24.hd.format === 1 && f24.hd.ch === 2 && f24.hd.bits === 24 && f24.hd.align === 6 && f24.hd.byteRate === 44100 * 6 && f24.hd.dataLen === f24.frames * 6 && f24.hd.riffLen === f24.hd.size - 8 &&
    f24.frames === f16.frames && f24.hd.list > 12 && f24.hd.size === 44 + f16.frames * 6 + f24.hd.list, "24-bit header: PCM (format 1), 24 bits, 6 bytes a frame, as long as the 16-bit file: " + JSON.stringify(f24.hd));
  ok(f24.errLsb24 <= 0.51 && Math.abs(f24.lufs + 14) <= 0.3 && f24.tpDb <= -1 && f24.tailQ16 < 0.05 && (await line(p, "outBox")).includes("Your file is ready · 24-bit ·"),
    `it decodes back within ${f24.errLsb24} of a 24-bit step, at ${f24.lufs} LUFS and ${f24.tpDb} dBTP, with no dither (its silent end: ${f24.tailQ16} of a 16-bit step)`);
  await p.click("#stemBtn"); await p.waitForFunction(() => __aogStudio.OUT.stems && !__aogStudio.OUT.busy, null, { timeout: 90000 });
  const z24 = py((await grab(p, '[data-outdl="stems"]')).f);
  ok(z24.bad === null && z24.files.length === 2 && z24.files.every(x => x[4] === 3 && x[1] === f24.frames && x[2] === 2), "the tracks follow the choice: 24-bit, as long as the song: " + JSON.stringify(z24.files.map(x => x.slice(0, 5))));
  await qSheet(p, "share"); await p.click("#mixBtn"); await p.waitForFunction(() => /ready|did not/.test(document.getElementById("mixLine").textContent), null, { timeout: 60000 });
  ok(await p.evaluate(async () => new DataView(await __aogStudio.MIX.wav.arrayBuffer()).getUint16(34, true)) === 24, "Make the mix follows it too: 24-bit");
  await p.reload(); await p.waitForTimeout(900);
  ok(await p.evaluate(() => document.getElementById("bitsSel").value) === "24" && await p.evaluate(() => __aogStudio.bits()) === 24, "after a reload the choice is still 24-bit");
  await qShareMore(p); await p.selectOption("#bitsSel", "16"); await p.reload(); await p.waitForTimeout(900);
  ok(await p.evaluate(() => document.getElementById("bitsSel").value) === "16", "and back to 16-bit, kept as well");

  /* 5 · a very quiet song goes up 12 dB, no more, and says so */
  await p.waitForFunction(() => __aogStudio.BUF.size >= 2 && !__aogStudio.S.decoding, null, { timeout: 20000 });
  await p.evaluate(() => { const r = document.getElementById("m-vol") || document.querySelector('#master input[data-k="vol"]'); r.value = "20"; r.dispatchEvent(new Event("input", { bubbles: true })); });
  await sendOut(p); const fq = await fileInfo(p);
  ok(Math.abs(fq.g - Math.pow(10, 12 / 20)) < 1e-6 && fq.why === "quiet" && fq.lufs < -14.3 &&
    /^Loudness −\d+\.\d LUFS · peak −\d+\.\d dB\. Your song is very quiet, so it went up 12 dB, no more\. To make it louder, turn your tracks up\.$/.test(await line(p, "outLoud")),
    `a very quiet song goes up 12 dB, no more (${fq.lufs} LUFS): ${await line(p, "outLoud")}`);
  await p.evaluate(() => { const r = document.getElementById("m-vol") || document.querySelector('#master input[data-k="vol"]'); r.value = "80"; r.dispatchEvent(new Event("input", { bubbles: true })); });

  /* 6 · your chops: the Drum Machine's chops bank, cut from your own take */
  await sendOut(p);
  ok(!(await p.$("#chopsOutBtn")), "with no chops of your own (the Drum Machine starts on a crate record), Send it out offers none");
  const rid = await add(p, { n: 9, kind: "beats", from: "decks", name: { en: "My record · chops", es: "Mi disco · cortes" } });
  await p.evaluate(async id => { await AOGHandoff.put("padstake", { id, from: "decks", name: "My record", at: Date.now() }); }, rid);
  await p.waitForFunction(id => __aogStudio.INBOX.items.some(x => x.id === id), rid, { timeout: 8000 });
  await sendOut(p);
  ok(await p.textContent("#chopsOutBtn") === "Your chops (.zip)", "chops sent to the Drum Machine (not yet opened there): Send it out offers Your chops (.zip)");
  await p.click("#chopsOutBtn"); await p.waitForFunction(() => __aogStudio.OUT.chops && !__aogStudio.OUT.busy, null, { timeout: 30000 });
  let dz = await grab(p, '[data-outdl="chops"]'), z = py(dz.f);
  const want = Array.from({ length: 16 }, (_, i) => "my-record-chop-" + String(i + 1).padStart(2, "0") + ".wav");
  ok(dz.name === "rainy-day-chops.zip" && z.bad === null && z.files.map(x => x[0]).join() === want.join() && (await line(p, "outBox")).includes("Your chops: 16 files in one .zip"),
    "a .zip of their own, one .wav a chop, named after the record, in the pads' order: " + dz.name + " " + z.files.map(x => x[0]).slice(0, 3).join(", ") + " … (" + z.files.length + ")");
  ok(z.files.every((x, i) => Math.abs(x[1] - 26460) <= 1 && x[2] === 2 && x[3] === 44100 && x[4] === 2 && Math.abs(x[5] - (300 + 50 * i)) <= 3),
    "each is one beat (0.6 s), stereo, 16-bit like the song, and holds its own beat of the record: " + z.files.map(x => x[5]).join(" "));
  ok(sentUp.length === 0, "nothing is uploaded: no request carried anything out of the page " + sentUp.join(" "));
  /* the Drum Machine's own save: bank D from bar 2 of the take; 24-bit */
  await p.evaluate(id => localStorage.setItem("aog.pads.v1", JSON.stringify({ v: 1, bank: 3, inAt: Date.now() + 1000, banks: [{ type: "drums" }, { type: "chords" }, { type: "notes" }, { type: "chops", rec: "t:" + id, bar: 2 }] })), rid);
  await qShareMore(p); await p.selectOption("#bitsSel", "24"); await sendOut(p);
  await p.click("#chopsOutBtn"); await p.waitForFunction(() => __aogStudio.OUT.chops && !__aogStudio.OUT.busy, null, { timeout: 30000 });
  z = py((await grab(p, '[data-outdl="chops"]', "chops-bar2.zip")).f);
  ok(z.files.length === 12 && z.files.every((x, i) => x[4] === 3 && Math.abs(x[5] - (300 + 50 * (i + 4))) <= 3), "from the Drum Machine's own save, bar 2: 12 chops, beats 5 to 16, at 24-bit: " + z.files.map(x => x[5]).join(" "));
  await p.evaluate(() => localStorage.setItem("aog.pads.v1", JSON.stringify({ v: 1, bank: 3, inAt: Date.now() + 1000, banks: [{ type: "drums" }, { type: "chords" }, { type: "notes" }, { type: "chops", rec: "c:01-paper-kites.mp3", bar: 1 }] })));
  await sendOut(p);
  ok(!(await p.$("#chopsOutBtn")), "a crate record on the chops bank is not yours, so it is not sent out");

  /* 7 · Spanish */
  await p.evaluate(id => localStorage.setItem("aog.pads.v1", JSON.stringify({ v: 1, bank: 3, inAt: Date.now() + 1000, banks: [{ type: "drums" }, { type: "chords" }, { type: "notes" }, { type: "chops", rec: "t:" + id, bar: 1 }] })), rid);
  await qShareMore(p); await p.selectOption("#bitsSel", "16");
  await p.evaluate(() => document.getElementById("langBtn").click());
  await sendOut(p);
  const es = await p.evaluate(() => ({ t: document.getElementById("lufsBox").innerText.replace(/\s+/g, " ").trim(), opts: [...document.querySelectorAll("#bitsSel option")].map(o => o.textContent).join(" | "),
    lab: document.querySelector(".st-bits .st-lab").textContent, loud: document.getElementById("outLoud").textContent, box: document.getElementById("outBox").textContent, chops: (document.getElementById("chopsOutBtn") || {}).textContent }));
  ok(/^Volumen percibido · LUFS Ahora — Últimos 3 s — Toda la canción −\d+\.\d Pico de la canción −\d+\.\d dB LUFS mide qué tan fuerte suena la música al oído\. Los servicios de streaming ponen las canciones a −14\. Toda la canción se mide cuando haces la mezcla o la compartes\.$/i.test(es.t),
    "Spanish, the meter: " + es.t);
  ok(es.lab === "Calidad del archivo" && es.opts === "16 bits · archivo más pequeño | 24 bits · calidad de estudio" && /^Volumen percibido −14\.0 LUFS · pico −\d+\.\d dB$/.test(es.loud) && es.box.includes("Tu archivo está listo · 16 bits ·") && es.chops === "Tus cortes (.zip)",
    `Spanish, the file: ${es.lab} · ${es.opts} · ${es.loud} · ${es.chops}`);
  await p.click("#chopsOutBtn"); await p.waitForFunction(() => __aogStudio.OUT.chops && !__aogStudio.OUT.busy, null, { timeout: 30000 });
  dz = await grab(p, '[data-outdl="chops"]', "cortes.zip"); z = py(dz.f);
  ok(dz.name === "rainy-day-cortes.zip" && z.files[0][0] === "mi-disco-corte-01.wav" && z.files.length === 16 && (await line(p, "outBox")).includes("Tus cortes: 16 archivos en un .zip"),
    "Spanish, the chops: " + dz.name + " · " + z.files[0][0]);
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();

  /* 8 · a song whose peaks are far above its loudness: it stops at the ceiling and says how loud it came out */
  const pk = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(pk); await routes(pk);
  const q = await pk.newPage(); await q.goto(U + "music-studio.html"); await q.waitForTimeout(700);
  await add(q, { n: 1, kind: "bursts" }); await q.waitForFunction(() => __aogStudio.INBOX.items.length >= 1, null, { timeout: 8000 });
  await put(q, "Guitar take 1", 0); await qSheet(q, "share"); await q.fill("#songName", "Hits");
  await sendOut(q); const fp = await fileInfo(q);
  const pl = await line(q, "outLoud");
  ok(fp.why === "peak" && fp.tpDb <= -1 && fp.tpDb > -1.1 && fp.lufs < -14.3 &&
    /^Loudness −\d+\.\d LUFS · peak −1\.0 dB\. That is under −14, so its loudest moment stays under −1 dB\.$/.test(pl),
    `the peak ceiling wins: ${fp.lufs} LUFS, true peak ${fp.tpDb} dBTP: ${pl}`);
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await pk.close();

  /* 9 · an iPhone and an iPad, light and dark: the meter fits, reads and is calm; on a touch screen it changes once a second */
  for (const [dev, theme] of [["iPhone 13", "light"], ["iPhone 13", "dark"], ["iPad (gen 7)", "light"], ["iPad (gen 7)", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {}
      navigator.canShare = d => !!(d && d.files); navigator.share = async () => {}; }, theme);
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(700);
    await song(m);
    const slow = await m.evaluate(async () => { const st = __aogStudio, el = document.getElementById("luSt"); let n = 0;
      const mo = new MutationObserver(() => n++); mo.observe(el, { subtree: true, childList: true, characterData: true });
      st.play(); await new Promise(r => setTimeout(r, 4600)); const v = el.textContent; st.stop(); mo.disconnect(); return { n, v }; });
    await sendOut(m);
    await m.locator("#lufsBox").scrollIntoViewIfNeeded(); await m.waitForTimeout(200);
    const fit = await m.evaluate(() => { const r = el => el.getBoundingClientRect(), box = r(document.getElementById("lufsBox")), cons = r(document.getElementById("console")), cells = [...document.querySelectorAll(".st-luc")].map(r);
      const sel = document.getElementById("bitsSel"); return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, inside: cells.every(q => q.left >= cons.left - 1 && q.right <= cons.right + 1 && q.width >= 60), boxIn: box.right <= cons.right + 1,
        selFont: parseFloat(getComputedStyle(sel).fontSize), selH: Math.round(r(sel).height) }; });
    const pc = await m.evaluate(`(${PROBE})()`), pk2 = await m.evaluate(`(${CALM})()`);
    ok(fit.sw <= fit.iw && fit.inside && fit.boxIn && fit.selFont >= 16 && fit.selH >= 44 && !pc.length && !pk2.length && slow.n <= 3 && /^−\d+\.\d$/.test(slow.v),
      `${dev}, ${theme}: fits (${JSON.stringify(fit)}), reads (${pc.length} unreadable ${JSON.stringify(pc.slice(0, 2))}), calm (${pk2.join("; ") || "ok"}), the meter changed ${slow.n} times in 4.6 s`);
    await m.locator("#console").screenshot({ path: path.join(OUTD, `release-console-${dev.split(" ")[0].toLowerCase()}-${theme}.png`) });
    await m.locator("#outBox").screenshot({ path: path.join(OUTD, `release-out-${dev.split(" ")[0].toLowerCase()}-${theme}.png`) });
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the phone or the iPad " + errs.join(" | "));
  console.log("files: " + OUTD);
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
