/* AOG-EXPORT-PRO-V1 (2026-10-23) — the Mixing Desk's Send it out in three file types, and the tags inside (aog-export.js).
   A known song (three takes: a chord, a sawtooth bass, bursts of noise; "Rainy day", 100 BPM in A minor, loud enough that its
   loudest moment, not its loudness, sets its level) is sent out as each file type, and each file is read back here:
   · nothing of aog-export.js loads before the first Send it out;
   · WAV (best), the default: the very bytes of the old export, then one LIST INFO chunk (INAM IART IPRD ICRD ICMT ISFT),
     the RIFF size right; any .wav reader opens it;
   · MP3: decoded by ffmpeg and by the browser it is as long as the song (to the sample, through the LAME-style Info frame;
     within a frame at most), it sounds like the song, its decoded true peak is under −1 dBTP, and the ID3v2.3 tag reads back
     (title, artist, album, year, BPM, key, comment, and Apple's iTunSMPB) with our own small reader;
   · M4A: this test browser's WebCodecs has no AAC, so a stand-in AudioEncoder and AudioDecoder hand the PCM to ffmpeg's AAC
     encoder and decoder (as Safari's and Chrome's own would): decoded by ffmpeg it is as long as the song within a frame, its
     true peak under −1 dBTP, the iTunes tags read back with our own reader (©nam ©ART ©alb ©day ©cmt tmpo initialkey iTunSMPB),
     the edit list trims the encoder's priming;
   · a browser with no AAC at all: M4A becomes an MP3 and says so in plain words;
   · a cover goes in as APIC and covr; Send to a friend's small file (AAC 128 kb/s) carries the tags and the ceiling;
   · the File type menu: an iPhone (390×844) and an iPad, English and Spanish: its words, 44 px tall, 16 px text, it fits,
     reads and is calm; the choice is kept on this device; no page errors. Port 9671. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const PORT = 9671, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const OUTD = process.env.AOG_SHOTS || fs.mkdtempSync(path.join(os.tmpdir(), "export-"));
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
async function routes(ctx) { await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort()); }

/* ── our own small readers ── */
function readId3(b) {
  if (b.toString("latin1", 0, 3) !== "ID3") return null;
  const n = (b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9], o = { _ver: b[3], _size: n + 10 }; let p = 10;
  const txt = (e, u) => e === 1 ? (u[0] === 0xFF && u[1] === 0xFE ? u.subarray(2) : u).toString("utf16le") : u.toString("latin1");
  while (p + 10 <= 10 + n) {
    const id = b.toString("latin1", p, p + 4), sz = b.readUInt32BE(p + 4); if (!/^[A-Z0-9]{4}$/.test(id) || !sz) break;
    const body = b.subarray(p + 10, p + 10 + sz), e = body[0];
    if (id[0] === "T") o[id] = txt(e, body.subarray(1)).replace(/\0+$/, "");
    else if (id === "COMM") { const r = body.subarray(4), z = e === 1 ? (() => { for (let i = 0; i + 1 < r.length; i += 2) if (!r[i] && !r[i + 1]) return i; return -1; })() : r.indexOf(0);
      const d = txt(e, r.subarray(0, z)), v = txt(e, r.subarray(z + (e === 1 ? 2 : 1))); o["COMM:" + d] = v; }
    else if (id === "APIC") { const z = body.indexOf(0, 1); o.APIC = { mime: body.toString("latin1", 1, z), type: body[z + 1], bytes: body.length - z - 3 }; }
    p += 10 + sz;
  }
  return o;
}
function boxes(b, a, z, cb) { let p = a; while (p + 8 <= z) { let sz = b.readUInt32BE(p); const t = b.toString("latin1", p + 4, p + 8); if (sz < 8 || p + sz > z) break; cb(t, p + 8, p + sz); p += sz; } }
function readMp4(b) {
  const o = { tags: {}, elst: null, mdhd: 0 };
  (function walk(a, z, path) {
    boxes(b, a, z, (t, s, e) => {
      const here = path + "/" + t;
      if (t === "meta") walk(s + 4, e, here);
      else if (/^(moov|trak|mdia|minf|stbl|edts|udta|ilst)$/.test(t)) walk(s, e, here);
      else if (t === "elst") o.elst = { n: b.readUInt32BE(s + 4), dur: b.readUInt32BE(s + 8), mediaTime: b.readInt32BE(s + 12) };
      else if (t === "mdhd") { o.mdhd = b.readUInt32BE(s + 12); o.total = b.readUInt32BE(s + 16); }
      else if (path.endsWith("/ilst")) {
        let name = t, data = null, type = 0;
        boxes(b, s, e, (t2, s2, e2) => { if (t2 === "name") name = b.toString("latin1", s2 + 4, e2); if (t2 === "data") { type = b.readUInt32BE(s2); data = b.subarray(s2 + 8, e2); } });
        if (data) o.tags[name] = type === 1 ? data.toString("utf8") : type === 21 ? (data.length === 2 ? data.readUInt16BE(0) : data[0]) : { type, bytes: data.length };
      }
    });
  })(0, b.length, "");
  return o;
}
function readWav(b) {
  const o = { riff: b.toString("latin1", 0, 4), riffLen: b.readUInt32LE(4), wave: b.toString("latin1", 8, 12), chunks: [], info: {} };
  let p = 12;
  while (p + 8 <= b.length) { const id = b.toString("latin1", p, p + 4), sz = b.readUInt32LE(p + 4); o.chunks.push([id, p, sz]);
    if (id === "LIST" && b.toString("latin1", p + 8, p + 12) === "INFO") { let q = p + 12; while (q + 8 <= p + 8 + sz) { const k = b.toString("latin1", q, q + 4), l = b.readUInt32LE(q + 4); o.info[k] = b.toString("utf8", q + 8, q + 8 + l).replace(/\0+$/, ""); q += 8 + l + (l & 1); } }
    p += 8 + sz + (sz & 1); }
  return o;
}
const decodeFF = file => { const pcm = cp.execFileSync("ffmpeg", ["-v", "error", "-i", file, "-f", "f32le", "-ac", "2", "-ar", "44100", "-"], { maxBuffer: 1 << 28 }); return new Float32Array(pcm.buffer, pcm.byteOffset, pcm.length / 4); };

/* ── the stand-in AAC encoder and decoder: ffmpeg's, behind WebCodecs' own shape ── */
function adtsFrames(buf) {
  const frames = []; let p = 0, asc = null;
  while (p + 7 <= buf.length) { const prot = buf[p + 1] & 1, len = ((buf[p + 3] & 3) << 11) | (buf[p + 4] << 3) | (buf[p + 5] >> 5), hl = prot ? 7 : 9;
    if (!asc) { const prof = (buf[p + 2] >> 6) + 1, fi = (buf[p + 2] >> 2) & 15, ch = ((buf[p + 2] & 1) << 2) | (buf[p + 3] >> 6); asc = Buffer.from([(prof << 3) | (fi >> 1), ((fi & 1) << 7) | (ch << 3)]); }
    if (len < hl) break; frames.push(buf.subarray(p + hl, p + len)); p += len; }
  return { frames, asc };
}
async function aacShim(ctx, encToo = true) {
  let calls = { enc: 0, dec: 0 };
  await ctx.exposeBinding("__aacEnc", (src, b64, sr, br) => {
    calls.enc++;
    const out = cp.execFileSync("ffmpeg", ["-v", "error", "-f", "f32le", "-ar", String(sr), "-ac", "2", "-i", "-", "-c:a", "aac", "-b:a", String(br), "-f", "adts", "-"], { input: Buffer.from(b64, "base64"), maxBuffer: 1 << 28 });
    const r = adtsFrames(out); return { asc: r.asc.toString("base64"), frames: r.frames.map(f => f.toString("base64")) };
  });
  await ctx.exposeBinding("__aacDec", (src, ascB64, framesB64) => {
    calls.dec++;
    const asc = Buffer.from(ascB64, "base64"), prof = (asc[0] >> 3) - 1, fi = ((asc[0] & 7) << 1) | (asc[1] >> 7), ch = (asc[1] >> 3) & 15;
    const parts = framesB64.map(f => { const d = Buffer.from(f, "base64"), len = d.length + 7, h = Buffer.from([0xFF, 0xF1, (prof << 6) | (fi << 2) | (ch >> 2), ((ch & 3) << 6) | (len >> 11), (len >> 3) & 255, ((len & 7) << 5) | 0x1F, 0xFC]); return Buffer.concat([h, d]); });
    const pcm = cp.execFileSync("ffmpeg", ["-v", "error", "-f", "aac", "-i", "-", "-f", "f32le", "-ac", "2", "-"], { input: Buffer.concat(parts), maxBuffer: 1 << 28 });
    return pcm.toString("base64");
  });
  await ctx.addInitScript(encToo => {
    const RealE = window.AudioEncoder, RealD = window.AudioDecoder, isAac = c => c && /^mp4a/.test(c.codec);
    const b64 = u => { let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
    const unb64 = s => { const b = atob(s), o = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) o[i] = b.charCodeAt(i); return o; };
    class E {
      static async isConfigSupported(c) { if (isAac(c)) return { supported: c.numberOfChannels === 2 && (c.sampleRate === 44100 || c.sampleRate === 48000), config: c }; return RealE ? RealE.isConfigSupported(c) : { supported: false }; }
      constructor(init) { this.init = init; this.pcm = []; this.encodeQueueSize = 0; }
      configure(c) { this.cfg = c; if (!isAac(c)) { this.real = new RealE(this.init); this.real.configure(c); } }
      encode(ad) { if (this.real) return this.real.encode(ad); const n = ad.numberOfFrames, L = new Float32Array(n), R = new Float32Array(n); ad.copyTo(L, { planeIndex: 0 }); ad.copyTo(R, { planeIndex: 1 }); this.pcm.push([L, R]); }
      get encodeQueueSizeReal() { return 0; }
      async flush() {
        if (this.real) return this.real.flush();
        let n = 0; this.pcm.forEach(p => n += p[0].length); const it = new Float32Array(n * 2); let at = 0;
        this.pcm.forEach(([L, R]) => { for (let i = 0; i < L.length; i++) { it[2 * (at + i)] = L[i]; it[2 * (at + i) + 1] = R[i]; } at += L.length; });
        const r = await window.__aacEnc(b64(new Uint8Array(it.buffer)), this.cfg.sampleRate, this.cfg.bitrate || 128000), asc = unb64(r.asc), sr = this.cfg.sampleRate;
        r.frames.forEach((f, i) => { const d = unb64(f); this.init.output({ byteLength: d.length, copyTo: x => x.set(d), duration: Math.round(1024 / sr * 1e6), timestamp: Math.round(i * 1024 / sr * 1e6), type: "key" },
          i === 0 ? { decoderConfig: { codec: "mp4a.40.2", sampleRate: sr, numberOfChannels: 2, description: asc } } : undefined); });
      }
      close() { if (this.real) this.real.close(); }
    }
    class Dd {
      static async isConfigSupported(c) { if (isAac(c)) return { supported: true, config: c }; return RealD ? RealD.isConfigSupported(c) : { supported: false }; }
      constructor(init) { this.init = init; this.fr = []; }
      configure(c) { this.cfg = c; if (!isAac(c)) { this.real = new RealD(this.init); this.real.configure(c); } }
      decode(ch) { if (this.real) return this.real.decode(ch); const u = new Uint8Array(ch.byteLength); ch.copyTo(u); this.fr.push(u); }
      async flush() {
        if (this.real) return this.real.flush();
        const asc = this.cfg.description instanceof Uint8Array ? this.cfg.description : new Uint8Array(this.cfg.description);
        const pcm = unb64(await window.__aacDec(b64(asc), this.fr.map(b64))), it = new Float32Array(pcm.buffer), n = it.length / 2, B = 1024;
        for (let a = 0; a < n; a += B) { const m = Math.min(B, n - a), L = new Float32Array(m), R = new Float32Array(m); for (let i = 0; i < m; i++) { L[i] = it[2 * (a + i)]; R[i] = it[2 * (a + i) + 1]; }
          this.init.output({ numberOfFrames: m, numberOfChannels: 2, format: "f32-planar", copyTo: (x, o) => x.set(o.planeIndex ? R : L), close() {} }); }
      }
      close() { if (this.real) this.real.close(); }
    }
    if (encToo) window.AudioEncoder = E; window.AudioDecoder = Dd; window.__shim = true;
  }, encToo);
  return calls;
}
/* a stand-in MediaRecorder that makes AAC in an .m4a in fragments, as Safari's does: it listens to the stream in real time
   (a ScriptProcessor), then ffmpeg makes the file */
async function liveShim(ctx) {
  const calls = { n: 0 };
  await ctx.exposeBinding("__liveM4a", (src, b64, sr) => {
    calls.n++;
    const f = path.join(OUTD, "live-" + calls.n + ".m4a");
    cp.execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "f32le", "-ar", String(sr), "-ac", "2", "-i", "-", "-c:a", "aac", "-b:a", "256k", "-movflags", "frag_keyframe+empty_moov+default_base_moof", "-frag_duration", "500000", f], { input: Buffer.from(b64, "base64") });
    return fs.readFileSync(f).toString("base64");
  });
  await ctx.addInitScript(() => {
    const b64 = u => { let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
    class MR {
      static isTypeSupported(t) { return /^audio\/mp4/.test(t); }
      constructor(stream, o) { this.stream = stream; this.mimeType = o && o.mimeType; this.state = "inactive"; }
      start() {
        const ac = this.ac = new AudioContext({ sampleRate: 44100 }), src = ac.createMediaStreamSource(this.stream), sp = ac.createScriptProcessor(4096, 2, 2), z = ac.createGain();
        this.pcm = []; z.gain.value = 0; sp.onaudioprocess = e => this.pcm.push([new Float32Array(e.inputBuffer.getChannelData(0)), new Float32Array(e.inputBuffer.getChannelData(1))]);
        src.connect(sp); sp.connect(z); z.connect(ac.destination); this.sp = sp; this.state = "recording"; window.__liveUsed = (window.__liveUsed || 0) + 1;
      }
      async stop() {
        this.sp.disconnect(); await this.ac.close();
        let n = 0; this.pcm.forEach(p => n += p[0].length); const it = new Float32Array(n * 2); let at = 0;
        this.pcm.forEach(([L, R]) => { for (let i = 0; i < L.length; i++) { it[2 * (at + i)] = L[i]; it[2 * (at + i) + 1] = R[i]; } at += L.length; });
        const s = atob(await window.__liveM4a(b64(new Uint8Array(it.buffer)), 44100)), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
        this.state = "inactive"; if (this.ondataavailable) this.ondataavailable({ data: new Blob([u], { type: "audio/mp4" }) }); if (this.onstop) this.onstop();
      }
    }
    window.MediaRecorder = MR;
  });
  return calls;
}

/* ── the known song ── */
const TAKE = `(async (n, kind) => { const sr = 44100, sec = 6.0, len = Math.round(sec * sr);
  const ab = new ArrayBuffer(44 + len * 4), v = new DataView(ab), s = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  s(0, "RIFF"); v.setUint32(4, 36 + len * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, len * 4, true);
  let sd = 7 + n; const rnd = () => { sd = (sd * 1103515245 + 12345) >>> 0; return sd / 4294967296 - 0.5; };
  for (let i = 0; i < len; i++) { const t = i / sr; let l = 0, r = 0;
    if (kind === "chord") { for (const f of [220, 261.63, 329.63]) { l += 0.03 * Math.sin(2 * Math.PI * f * t); r += 0.03 * Math.sin(2 * Math.PI * f * 1.002 * t); } }
    else if (kind === "saw") { const ph = (t * 55) % 1; l = r = 0.08 * (2 * ph - 1); }
    else { const on = (t * 4) % 1 < 0.08, k = (t % 0.6) * 1000; l = (on ? 0.7 * rnd() : 0) + 0.93 * Math.exp(-k) * (k < 0.05 ? 1 : -1); r = (on ? 0.7 * rnd() : 0) + 0.9 * Math.exp(-k * 1.3); }   /* noise bursts and a sharp click on each beat */
    v.setInt16(44 + i * 4, Math.round(l * 32767), true); v.setInt16(46 + i * 4, Math.round(r * 32767), true); }
  await AOGHandoff.add(AOGHandoff.INBOX, { from: "guitar", n, name: { en: "Guitar take " + n, es: "Toma de guitarra " + n }, sec, bpm: 100, at: Date.now() + n, take: true,
    wav: new Blob([ab], { type: "audio/wav" }) }, { key: "exp|" + n });
})`;
async function put(p, take, track) {
  await p.selectOption("#trackSel", String(track));
  const v = await p.evaluate(nm => [...document.querySelectorAll("#srcSel option")].find(o => [nm, nm.replace("Guitar take", "Toma de guitarra")].includes(o.textContent.split(" · ")[0])).value, take);
  await p.selectOption("#srcSel", v); await p.click("#putBtn");
  await p.waitForFunction(t => __aogStudio.SONG.tracks[t].clip && !__aogStudio.S.busy, track, { timeout: 15000 });
}
async function song(p) {
  await p.evaluate(() => AOGSong.set({ bpm: 100, key: 9, minor: true }));
  await p.evaluate(`(async()=>{ const add=${TAKE}; await add(1, "chord"); await add(2, "saw"); await add(3, "noise"); })()`);
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 3, null, { timeout: 8000 });
  await put(p, "Guitar take 1", 0); await put(p, "Guitar take 2", 1); await put(p, "Guitar take 3", 2);
  await p.fill("#songName", "Rainy day");
}
const line = (p, id) => p.evaluate(i => document.getElementById(i).textContent.trim(), id);
async function sendOut(p, type) {
  if (type) await p.selectOption("#outType", type);
  await p.evaluate(() => { __aogStudio.OUT.song = null; document.getElementById("outBox").innerHTML = ""; });
  await p.click("#outBtn");
  await p.waitForFunction(() => !__aogStudio.OUT.busy && (__aogStudio.OUT.song || document.getElementById("outLine").textContent), null, { timeout: 180000 });
}
async function grab(p, name) {
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click('[data-outdl="song"]')]);
  const f = path.join(OUTD, name || dl.suggestedFilename()); await dl.saveAs(f); return { f, name: dl.suggestedFilename(), b: fs.readFileSync(f) };
}
/* the page's own meter (__aogStudio.truePeak, checked against BS.1770 by studio/release.js) on a decoded file */
const tpOf = (p, dec) => p.evaluate(async b64 => { const u = Uint8Array.from(atob(b64), c => c.charCodeAt(0)), it = new Float32Array(u.buffer), n = it.length / 2, L = new Float32Array(n), R = new Float32Array(n);
  for (let i = 0; i < n; i++) { L[i] = it[2 * i]; R[i] = it[2 * i + 1]; } return 20 * Math.log10(__aogStudio.truePeak([L, R])); }, Buffer.from(dec.buffer, dec.byteOffset, dec.byteLength).toString("base64"));
/* how alike a decoded file is to the song's .wav (the best lag within 3000 samples): the error's level under the sound, in dB */
function likeness(dec, ref) {
  const n = Math.min(ref.length, dec.length) / 2, w0 = Math.floor(n / 3), N = 8192; let bl = 0, best = -Infinity;
  for (let l = -3000; l <= 3000; l++) { let s = 0; for (let i = 0; i < N; i++) { const a = w0 + i; s += ref[2 * a] * (dec[2 * (a + l)] || 0); } if (s > best) { best = s; bl = l; } }
  let e = 0, sg = 0; for (let i = 3000; i < n - 3000; i++) for (let c = 0; c < 2; c++) { const d = (dec[2 * (i + bl) + c] || 0) - ref[2 * i + c]; e += d * d; sg += ref[2 * i + c] * ref[2 * i + c]; }
  /* and the loudness of each 4096-sample block (93 ms): alike to a fraction of a dB (a lossy coder may swap noise for noise) */
  const bx = []; for (let a = 3000; a + 4096 < n - 3000; a += 4096) { let x = 0, y = 0; for (let i = a; i < a + 4096; i++) for (let c = 0; c < 2; c++) { const r = ref[2 * i + c], d = dec[2 * (i + bl) + c] || 0; x += r * r; y += d * d; } bx.push([x, y]); }
  const top = Math.max(...bx.map(v => v[0])), dbs = bx.filter(v => v[0] > top * 1e-3).map(([x, y]) => 10 * Math.log10((y + 1e-12) / x));   /* the blocks within 30 dB of the loudest */
  const mean = dbs.reduce((a, v) => a + v, 0) / dbs.length, sd = Math.sqrt(dbs.reduce((a, v) => a + (v - mean) ** 2, 0) / dbs.length);
  return { lag: bl, snr: +(10 * Math.log10(sg / e)).toFixed(1), env: +sd.toFixed(2), level: +mean.toFixed(2) };
}

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* ═══ 1 · a computer: WAV, MP3 and M4A ═══ */
  const c = await b.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true }); watch(c); await routes(c);
  const asked = []; c.on("request", r => { if (/aog-export\.js/.test(r.url())) asked.push(r.url()); });
  const calls = await aacShim(c);
  const p = await c.newPage(); await p.goto(U + "music-studio.html"); await p.waitForTimeout(700);
  await song(p);
  const sel = await p.evaluate(() => { const s = document.getElementById("outType"); return { v: s.value, opts: [...s.options].map(o => o.value + "=" + o.textContent), lab: s.closest("label").textContent.replace(s.textContent, "").trim() }; });
  ok(sel.v === "wav" && sel.opts.join(" | ") === "wav=WAV (best) | m4a=M4A (small, plays everywhere) | mp3=MP3" && sel.lab === "File type", "File type sits beside File quality: " + JSON.stringify(sel));
  await p.waitForTimeout(500);
  ok(!asked.length && !(await p.evaluate(() => !!window.AOGExport)), "nothing of aog-export.js has loaded before the first Send it out: " + asked.length + " requests");

  /* WAV: the old export's bytes, then the LIST chunk */
  await sendOut(p);
  ok(asked.length === 1 && await p.evaluate(() => !!window.AOGExport), "the first Send it out fetches aog-export.js, once");
  /* the desk's own .wav, as it hands it over (its render path is not ours to change), against the file that comes out */
  await p.evaluate(() => { const d = AOGExport.desk; AOGExport.desk = async (o, x) => { window.__orig = { bytes: new Uint8Array(await o.file.arrayBuffer()), Lc: x.Lc, Rc: x.Rc, g: o.g }; return d(o, x); }; });
  await sendOut(p);
  const wv = await p.evaluate(async () => { const st = __aogStudio, o = st.OUT.song, w = window.__orig, old = w.bytes, now = new Uint8Array(await o.file.arrayBuffer());
    const again = new Uint8Array(await st.wavBufW(w.Lc, w.Rc, 44100, w.g, st.bits())); let desk = again.length === old.length; for (let i = 0; desk && i < old.length; i++) if (again[i] !== old[i]) desk = false;
    let same = old.length <= now.length, at = -1; for (let i = 0; same && i < old.length; i++) if (i < 4 || i > 7 ? old[i] !== now[i] : false) { same = false; at = i; }
    const dv = new DataView(now.buffer), ov = new DataView(old.buffer);
    return { name: o.file.name, type: o.file.type, oldLen: old.length, len: now.length, same: same && desk, desk, at, riff: dv.getUint32(4, true), oldRiff: ov.getUint32(4, true), box: document.getElementById("outBox").textContent, frames: (old.length - 44) / 4, g: o.g, tpDb: o.tpDb, lufs: o.lufs, why: o.why }; });
  const W1 = await grab(p, "rainy-day.wav"), wr = readWav(W1.b), list = wr.chunks.find(x => x[0] === "LIST");
  ok(wv.name === "rainy-day.wav" && wv.same && W1.b.length === wv.len && list && list[1] === wv.oldLen && wv.len === wv.oldLen + 8 + list[2] && wv.riff === wv.len - 8 && wv.riff === wv.oldRiff + 8 + list[2] && wr.chunks.map(x => x[0]).join(",") === "fmt ,data,LIST",
    `WAV: the old export byte for byte (${wv.oldLen} bytes${wv.same ? "" : "; first difference at byte " + wv.at}) but the RIFF size, then one LIST chunk (${list && list[2] + 8} bytes): RIFF ${wv.riff} = ${wv.len} − 8; chunks ${wr.chunks.map(x => x[0]).join(",")}`);
  ok(wr.info.INAM === "Rainy day" && wr.info.IART === "Me" && wr.info.IPRD === "Architecture of Grace Studio" && wr.info.ICRD === String(new Date().getFullYear()) && /^100 BPM · A minor · Made in the Recording Studio at architectureofgrace\.com$/.test(wr.info.ICMT) && wr.info.ISFT === "Architecture of Grace Studio",
    "WAV: the INFO reads back: " + JSON.stringify(wr.info));
  const pyw = cp.execFileSync("python3", ["-I", "-c", "import wave,sys; w=wave.open(sys.argv[1]); print(w.getsampwidth(), w.getnchannels(), w.getframerate(), w.getnframes())", W1.f]).toString().trim();
  ok(pyw === `2 2 44100 ${wv.frames}` && /Your file is ready · 16-bit ·/.test(wv.box), "any .wav reader opens it, and the box says 16-bit: " + pyw);
  ok(wv.why === "peak" && wv.tpDb <= -1 && wv.tpDb > -1.1, `the song is set by its loudest moment (why ${wv.why}, ${wv.lufs.toFixed(2)} LUFS, true peak ${wv.tpDb.toFixed(2)} dBTP): the lossy ceiling has work to do`);
  const ref = decodeFF(W1.f);

  /* MP3, with an artist name from Listen back */
  await p.evaluate(() => localStorage.setItem("aog.studio.artist.v1", "DJ Theo"));
  const t0 = Date.now(); await sendOut(p, "mp3"); const mp3ms = Date.now() - t0;
  const m1 = await p.evaluate(async () => { const o = __aogStudio.OUT.song, buf = await new OfflineAudioContext(2, 1, 44100).decodeAudioData(await o.file.arrayBuffer());
    return { name: o.file.name, type: o.file.type, size: o.file.size, box: document.getElementById("outBox").textContent, line: document.getElementById("outLine").textContent, browserFrames: buf.length, last: AOGExport._t.last(), tpDb: o.tpDb, loud: document.getElementById("outLoud").textContent }; });
  const M1 = await grab(p, "rainy-day.mp3"), id = readId3(M1.b), dm = decodeFF(M1.f), lk = likeness(dm, ref), tpm = await tpOf(p, dm);
  ok(m1.name === "rainy-day.mp3" && m1.type === "audio/mpeg" && M1.b.length === m1.size && /Your file is ready · MP3 · 320 kb\/s ·/.test(m1.box) && m1.line === "",
    `MP3: rainy-day.mp3 (${Math.round(m1.size / 1024)} KB against ${Math.round(W1.b.length / 1024)} KB as a .wav, made in ${(mp3ms / 1000).toFixed(1)} s), the box says MP3 · 320 kb/s`);
  ok(dm.length / 2 === wv.frames && Math.abs(m1.browserFrames - wv.frames) < 1152,
    `MP3: as long as the song: ffmpeg decodes ${dm.length / 2} frames, the browser ${m1.browserFrames}, the song ${wv.frames} (within a frame: ${Math.abs(m1.browserFrames - wv.frames)} apart)`);
  ok(lk.lag === 0 && lk.snr >= 15 && lk.env <= 0.3 && Math.abs(lk.level - 20 * Math.log10(m1.last.gain / m1.last.g)) < 0.1,
    `MP3: it is the song, lined up to the sample (lag ${lk.lag}), the coding noise ${lk.snr} dB under it; each block ${lk.level} dB from the .wav (the ceiling's ${(20 * Math.log10(m1.last.gain / m1.last.g)).toFixed(2)}), give or take ${lk.env} dB`);
  ok(tpm <= -1.0 && Math.abs(tpm - m1.tpDb) < 0.15 && /peak −1\.\d dB/.test(m1.loud), `MP3: decoded, its true peak is ${tpm.toFixed(2)} dBTP (under −1; the page measured ${m1.tpDb.toFixed(2)}; lowered ${(20 * Math.log10(m1.last.g / m1.last.gain)).toFixed(2)} dB in ${m1.last.passes} pass(es)); it says: ${m1.loud}`);
  ok(id && id._ver === 3 && id.TIT2 === "Rainy day" && id.TPE1 === "DJ Theo" && id.TALB === "Architecture of Grace Studio" && id.TYER === String(new Date().getFullYear()) && id.TBPM === "100" && id.TKEY === "Am" &&
    id["COMM:"] === "100 BPM · A minor · Made in the Recording Studio at architectureofgrace.com" && /^ 00000000 00000421 [0-9A-F]{8} [0-9A-F]{16}/.test(id["COMM:iTunSMPB"] || "") && parseInt(id["COMM:iTunSMPB"].split(" ")[4], 16) === wv.frames,
    "MP3: the ID3v2.3 tag reads back: " + JSON.stringify(id));
  const probe = JSON.parse(cp.execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_name,sample_rate,bit_rate,channels:format_tags", "-of", "json", M1.f]).toString());
  ok(probe.streams[0].codec_name === "mp3" && probe.streams[0].bit_rate === "320000" && probe.streams[0].sample_rate === "44100" && probe.streams[0].channels === 2 && probe.format.tags.title === "Rainy day",
    "MP3: ffprobe sees MPEG-1 Layer III, 320 kb/s, 44.1 kHz stereo: " + JSON.stringify(probe.streams[0]));

  /* M4A, through the stand-in AAC encoder */
  await sendOut(p, "m4a");
  const a1 = await p.evaluate(() => { const o = __aogStudio.OUT.song; return { name: o.file.name, type: o.file.type, size: o.file.size, box: document.getElementById("outBox").textContent, line: document.getElementById("outLine").textContent, last: AOGExport._t.last(), tpDb: o.tpDb }; });
  const A1 = await grab(p, "rainy-day.m4a"), mp = readMp4(A1.b), da = decodeFF(A1.f), la = likeness(da, ref), tpa = await tpOf(p, da);
  ok(a1.name === "rainy-day.m4a" && a1.type === "audio/mp4" && /Your file is ready · M4A · 256 kb\/s ·/.test(a1.box) && a1.line === "" && a1.last.codec === "aac" && calls.enc >= 1 && calls.dec >= 1,
    `M4A: rainy-day.m4a (${Math.round(a1.size / 1024)} KB), AAC through WebCodecs (the stand-in: ${calls.enc} encode, ${calls.dec} decode), the box says M4A · 256 kb/s`);
  ok(Math.abs(da.length / 2 - wv.frames) < 1024 && mp.elst && mp.elst.mediaTime === a1.last.prime && a1.last.prime === 1024 && mp.elst.dur === wv.frames,
    `M4A: as long as the song within a frame (ffmpeg decodes ${da.length / 2}, the song ${wv.frames}); the edit list skips the encoder's ${a1.last.prime} samples of priming (found by lining up the decoded frames) and keeps ${mp.elst && mp.elst.dur}`);
  ok(Math.abs(la.lag) <= 1 && la.env <= 0.3 && Math.abs(la.level - 20 * Math.log10(a1.last.gain / a1.last.g)) < 0.1,
    `M4A: it is the song, lined up (lag ${la.lag}); each block ${la.level} dB from the .wav (the ceiling's ${(20 * Math.log10(a1.last.gain / a1.last.g)).toFixed(2)}), give or take ${la.env} dB (the waveform ${la.snr} dB: AAC swaps noise for noise)`);
  ok(tpa <= -1.0, `M4A: decoded, its true peak is ${tpa.toFixed(2)} dBTP (under −1; the page measured ${a1.tpDb.toFixed(2)}; lowered ${(20 * Math.log10(a1.last.g / a1.last.gain)).toFixed(2)} dB in ${a1.last.passes} pass(es))`);
  const T = mp.tags;
  ok(T["©nam"] === "Rainy day" && T["©ART"] === "DJ Theo" && T["©alb"] === "Architecture of Grace Studio" && T["©day"] === String(new Date().getFullYear()) && T.tmpo === 100 && T.initialkey === "Am" &&
    T["©cmt"] === "100 BPM · A minor · Made in the Recording Studio at architectureofgrace.com" && /^ 00000000 00000400 /.test(T.iTunSMPB || "") && T["©too"] === "Architecture of Grace Studio",
    "M4A: the iTunes tags read back: " + JSON.stringify(T));
  const pa = JSON.parse(cp.execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_name,profile,sample_rate,channels:format_tags", "-of", "json", A1.f]).toString());
  ok(pa.streams[0].codec_name === "aac" && pa.streams[0].profile === "LC" && pa.format.tags.title === "Rainy day" && pa.format.tags.artist === "DJ Theo", "M4A: ffprobe sees AAC-LC and the tags: " + JSON.stringify({ s: pa.streams[0], t: pa.format.tags }));

  /* a cover, and Send to a friend's small file */
  const cov = await p.evaluate(async () => {
    const png = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="), c => c.charCodeAt(0));
    const st = __aogStudio, r = await st.renderSong(null), o = { file: new File([await st.wavBufW(r.Lc, r.Rc, 44100, 0.5, 16)], "cover-test.wav", { type: "audio/wav" }), g: 0.5, tpDb: -9, lufs: -20, why: "aim" };
    const m = await AOGExport.desk(o, { Lc: r.Lc, Rc: r.Rc, sr: 44100, type: "mp3", title: "Cover test", lang: "en", cover: { mime: "image/png", bytes: png } });
    const g9 = Math.pow(10, -0.3 / 20) / st.truePeak([r.Lc, r.Rc]), s = await AOGExport.small(r.Lc, r.Rc, 44100, g9, { title: "Night Drive", artist: "DJ Theo", tpDb: -0.3 });
    const b64 = async blob => { const u = new Uint8Array(await blob.arrayBuffer()); let x = ""; for (let i = 0; i < u.length; i += 0x8000) x += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(x); };
    return { mp3: await b64(m.file), small: await b64(s.blob), kind: s.kind, tp: s.tpDb, g: s.gain, g9 };
  });
  const cid = readId3(Buffer.from(cov.mp3, "base64")), sm = Buffer.from(cov.small, "base64"), smt = readMp4(sm).tags;
  fs.writeFileSync(path.join(OUTD, "small.m4a"), sm); const ds = decodeFF(path.join(OUTD, "small.m4a")), tps = await tpOf(p, ds);
  ok(cid && cid.APIC && cid.APIC.mime === "image/png" && cid.APIC.type === 3 && cid.APIC.bytes === 70 && cid.TIT2 === "Cover test", "a cover goes in as APIC (front cover): " + JSON.stringify(cid && cid.APIC));
  ok(cov.kind === "aac" && smt["©nam"] === "Night Drive" && smt["©ART"] === "DJ Theo" && smt.tmpo === 100 && tps <= -1.0 && cov.g < cov.g9,
    `Send to a friend's small file: AAC 128 kb/s with the tags (${smt["©nam"]} by ${smt["©ART"]}), set to a true peak of −0.3 dBTP, brought down ${(20 * Math.log10(cov.g9 / cov.g)).toFixed(2)} dB to ${tps.toFixed(2)} dBTP decoded`);
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();

  /* ═══ 2 · an iPhone before iOS 26: no AAC in WebCodecs, but MediaRecorder makes AAC in real time ═══ */
  const lc = await b.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true }); watch(lc); await routes(lc);
  await aacShim(lc, false); const live = await liveShim(lc);
  const lp = await lc.newPage(); await lp.goto(U + "music-studio.html"); await lp.waitForTimeout(700);
  await song(lp);
  const lines = []; await lp.exposeFunction("__line", s => lines.push(s));
  await lp.evaluate(() => new MutationObserver(() => window.__line(document.getElementById("outLine").textContent)).observe(document.getElementById("outLine"), { childList: true, characterData: true, subtree: true }));
  const lt0 = Date.now(); await sendOut(lp, "m4a"); const livems = Date.now() - lt0;
  const l1 = await lp.evaluate(() => { const o = __aogStudio.OUT.song; return { name: o.file.name, box: document.getElementById("outBox").textContent, line: document.getElementById("outLine").textContent, last: AOGExport._t.last(), used: window.__liveUsed, wc: !!(window.AudioEncoder && 0) }; });
  const LV = await grab(lp, "rainy-day-live.m4a"), lm = readMp4(LV.b), dl = decodeFF(LV.f), ll = likeness(dl, ref), tpl = await tpOf(lp, dl);
  ok(l1.name === "rainy-day.m4a" && l1.used >= 1 && live.n >= 1 && /M4A · 256 kb\/s/.test(l1.box) && lines.some(s => /^Making your M4A file\. It takes as long as the song\./.test(s)) && l1.line === "",
    `real time: rainy-day.m4a made through MediaRecorder in ${(livems / 1000).toFixed(1)} s (the song is ${(wv.frames / 44100).toFixed(1)} s; ${l1.last.passes} pass), the line said "${lines.find(s => /M4A/.test(s))}"`);
  ok(Math.abs(dl.length / 2 - wv.frames) < 1024 && Math.abs(ll.lag) <= 1 && ll.env <= 0.3 && lm.elst && lm.elst.mediaTime === l1.last.prime && l1.last.prime > 1024,
    `real time: read back and written again with an edit list that skips ${l1.last.prime} samples (the priming and the recorder's late start, found by lining up); as long as the song within a frame (${dl.length / 2} for ${wv.frames}), lined up (lag ${ll.lag}), give or take ${ll.env} dB`);
  ok(tpl <= -1.0 && lm.tags["©nam"] === "Rainy day" && lm.tags.tmpo === 100 && lm.tags.initialkey === "Am", `real time: decoded true peak ${tpl.toFixed(2)} dBTP, the tags inside: ${JSON.stringify(lm.tags).slice(0, 120)}`);
  await lc.close();

  /* ═══ 2b · a browser with no AAC at all: M4A becomes an MP3, said plainly ═══ */
  const nc = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(nc); await routes(nc);
  const q = await nc.newPage(); await q.goto(U + "music-studio.html"); await q.waitForTimeout(700);
  await song(q); await sendOut(q, "m4a");
  const f2 = await q.evaluate(() => ({ name: __aogStudio.OUT.song && __aogStudio.OUT.song.file.name, line: document.getElementById("outLine").textContent, box: document.getElementById("outBox").textContent }));
  ok(f2.name === "rainy-day.mp3" && f2.line === "This device can't make M4A files, so here is an MP3. It plays everywhere too." && /MP3 · 320 kb\/s/.test(f2.box), "no AAC here: " + JSON.stringify(f2));
  ok(await q.evaluate(() => localStorage.getItem("aog.studio.filetype.v1")) === "m4a", "the choice is kept on this device");
  await q.reload(); await q.waitForTimeout(700);
  ok(await q.evaluate(() => document.getElementById("outType").value) === "m4a", "after a reload File type still says M4A");
  await nc.close();

  /* ═══ 3 · an iPhone and an iPad, English and Spanish ═══ */
  for (const [dev, lang, theme] of [["iPhone 13", "en", "light"], ["iPhone 13", "es", "dark"], ["iPad (gen 7)", "en", "dark"], ["iPad (gen 7)", "es", "light"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], ...(dev === "iPhone 13" ? { viewport: { width: 390, height: 844 } } : {}), colorScheme: theme }); watch(cx); await routes(cx);   /* the iPhone at 390×844 */
    await cx.addInitScript(([th, lg]) => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); localStorage.setItem("aog.lang", lg); } catch (e) {} }, [theme, lang]);
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(700);
    if (lang === "es" && await m.evaluate(() => document.documentElement.lang !== "es")) await m.evaluate(() => document.getElementById("langBtn").click());
    await m.locator("#outType").scrollIntoViewIfNeeded(); await m.waitForTimeout(200);
    const v = await m.evaluate(() => { const s = document.getElementById("outType"), r = s.getBoundingClientRect(), lab = s.closest("label");
      return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, h: Math.round(r.height), w: Math.round(r.width), right: Math.round(r.right), left: Math.round(r.left), fs: parseFloat(getComputedStyle(s).fontSize),
        lab: lab.textContent.replace(s.textContent, "").trim(), opts: [...s.options].map(o => o.textContent) }; });
    const words = lang === "es" ? ["Tipo de archivo", "WAV (la mejor) | M4A (pequeño, se oye en todas partes) | MP3"] : ["File type", "WAV (best) | M4A (small, plays everywhere) | MP3"];
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    ok(v.lab === words[0] && v.opts.join(" | ") === words[1] && v.h >= 44 && v.fs >= 16 && v.left >= 0 && v.right <= v.iw && v.sw <= v.iw && !pc.length && !pk.length,
      `${dev}, ${lang}, ${theme}: "${v.lab}": ${v.opts.join(" | ")}; ${v.w}×${v.h} px, ${v.fs}px text, fits (${v.left}–${v.right} of ${v.iw}), reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}), calm (${pk.join("; ") || "ok"})`);
    await m.selectOption("#outType", "mp3");
    ok(await m.evaluate(() => localStorage.getItem("aog.studio.filetype.v1")) === "mp3", `${dev}, ${lang}: the menu works with a finger's choice, and keeps it`);
    if (dev === "iPhone 13" && lang === "es") {
      await song(m); await sendOut(m, "mp3");
      const r = await m.evaluate(() => ({ name: __aogStudio.OUT.song && __aogStudio.OUT.song.file.name, box: document.getElementById("outBox").textContent }));
      ok(r.name === "rainy-day.mp3" && /Tu archivo está listo · MP3 · 320 kb\/s ·/.test(r.box), "iPhone, Spanish: Compártela makes the MP3 and says so: " + r.box.slice(0, 80));
    }
    await m.locator("#outType").screenshot({ path: path.join(OUTD, `export-${dev.split(" ")[0].toLowerCase()}-${lang}.png`) }).catch(() => {});
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the phone or the iPad " + errs.join(" | "));
  console.log("files: " + OUTD);
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
