/* AOG-DESK-MORE-V1 (part 1 of 2) — Jimmy's 2, 3, 4, 6 and 12 at the Mixing Desk:
   · Duck under another track (AOG-DESK-DUCK-V1): a steady pad dips by the Depth under each kick, comes back over the
     release, also as its own file; no track picked is no effect, to the bit; the speakers duck as the bounce does;
   · Tune the voice (AOG-DESK-TUNE-V1): a voice-like tone 40 cents sharp of A is pulled to 440 Hz at 100 % and fast, left
     alone (to the bit) at 0 %, starts when it did and lasts as long; "Tuning your voice…" while it works;
   · effect slots on every track (AOG-DESK-FX-V1): empty slots, or a slot turned Off, give the very same file as the desk
     did before (the page as it was, git origin/claude/desk-auto, renders the same song to the same bits); a real compressor
     (its gain reduction measured on a steady tone against the static curve, its make-up, its 6 ms made up for on every
     other track, its calm number while it plays), the Sweep EQ (+12 dB at 1 kHz, nothing at 6 kHz), Tape warmth (a third
     harmonic, and no aliasing of a 9 kHz tone: oversampled), the Chorus (left and right move apart, the same live and in a
     bounce), the Filter (low-pass and high-pass), the Doubler (left and right no longer the same), the De-esser (7 kHz down,
     1 kHz kept); the order of the slots; Undo and Redo; a reload and a song file keep them;
   · the Echo in beats (AOG-DESK-ECHO-SYNC-V1): the echo of a click comes exactly one 1/4, 1/8, dotted 1/8, 1/8 triplet
     or 1/16 later at the song's tempo, and follows a change of tempo, also on the speakers;
   · Undo and Redo for mixer moves (AOG-DESK-MIXUNDO-V1): a run of slider moves is one step; mute, pan, EQ, a send, the
     whole song's knobs and the Echo's time;
   · a name and a colour for a track (AOG-DESK-LOOK-V1): on the lane, the channel strip, the fader's tape; kept; readable;
   · versions (AOG-DESK-VERSIONS-V1): saved on this device without copying any recording again, opened, and A/B while the
     song plays from the same spot;
   · Spanish; an iPhone and an iPad, light and dark, and inside the Recording Studio: readable, calm, nothing sideways.
   Ports 9278 and 9279. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), cp = require("child_process");
const PORT = 9278, PORT2 = 9279, U = "http://localhost:" + PORT + "/", U2 = "http://localhost:" + PORT2 + "/";
const srv = require("../srv.js")(PORT), srv2 = require("../srv.js")(PORT2);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let OLD = null; try { OLD = cp.execSync("git -C " + JSON.stringify(ROOT) + " show origin/claude/desk-auto:aog-deploy/music-studio.html", { maxBuffer: 64 << 20 }).toString(); } catch (e) { OLD = null; }
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
async function routes(ctx) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  if (OLD) await ctx.route(/music-studio-before\.html/, r => r.fulfill({ body: OLD, contentType: "text/html" }));
}
/* a take made in the page, o.bars bars at 100 a minute: tones (o.f, a list of Hz), noise, or clicks (o.clicks, seconds) */
const TAKE = `(async (o) => { const sr = 44100, head = 0.05, sec = head + 2.4 * o.bars, len = Math.round(sec * sr);
  const ab = new ArrayBuffer(44 + len * 4), v = new DataView(ab), s = (q, t) => { for (let i = 0; i < t.length; i++) v.setUint8(q + i, t.charCodeAt(i)); };
  s(0, "RIFF"); v.setUint32(4, 36 + len * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, len * 4, true);
  let z = 0x2545f491; const cl = (o.clicks || []).map(t => Math.round((head + t) * sr)), amp = o.amp || 9000;
  for (let i = 0; i < len; i++) { const t = i / sr - head; let x = 0;
    if (o.kind === "click") x = cl.indexOf(i) >= 0 ? 20000 : 0;
    else if (o.kind === "kick") { const tb = t < 0 ? 1 : t % 0.6; x = tb < 0.08 ? 20000 * Math.sin(2 * Math.PI * 60 * tb) * Math.exp(-tb / 0.025) : 0; }
    else if (t >= 0) { const env = Math.min(1, t / 0.01, Math.max(0, (sec - head - t) / 0.01));
      if (o.kind === "noise") { z ^= z << 13; z ^= z >>> 17; z ^= z << 5; x = env * amp * (((z >>> 0) / 4294967296) * 2 - 1); }
      else { o.f.forEach((f, j) => { x += env * amp * (o.amps ? o.amps[j] : 1 / o.f.length) * Math.sin(2 * Math.PI * f * t); }); } }
    v.setInt16(44 + i * 4, o.ch === "R" ? 0 : Math.round(x), true); v.setInt16(46 + i * 4, o.ch === "L" ? 0 : Math.round(x), true); }
  await AOGHandoff.add(AOGHandoff.INBOX, { from: o.from || "guitar", n: o.n, name: { en: "Take " + o.n, es: "Toma " + o.n }, sec, bpm: 100, at: Date.now() + o.n, take: true,
    wav: new Blob([ab], { type: "audio/wav" }) }, { key: "more|" + o.n });
})`;
const NAMES = { guitar: "Guitar take", piano: "Piano take", bass: "Bass take" };
const add = (p, o) => p.evaluate(`(${TAKE})(${JSON.stringify(o)})`);
async function put(p, name, track) {
  name = name.replace(/^Take /, "Guitar take ");
  await p.selectOption("#trackSel", String(track));
  const v = await p.evaluate(nm => [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === nm).value, name);
  await p.selectOption("#srcSel", v); await p.click("#putBtn");
  await p.waitForFunction(t => __aogStudio.SONG.tracks[t].clip && !__aogStudio.S.busy, track, { timeout: 15000 });
}
/* in the page: bounces kept by name; levels; a hash of every bit; Goertzel; a band's power; the live recorder (as studio/auto) */
const HELP = `window.__T = (() => {
  const st = __aogStudio, sr = 44100, T = { B: {} };
  T.render = async (name, only) => { const r = await st.renderSong(only == null ? null : only); T.B[name || "cur"] = { L: Float32Array.from(r.Lc), R: Float32Array.from(r.Rc) }; return r.frames; };
  const rms = (d, a, z) => { let s = 0, n = 0; for (let i = Math.max(0, Math.round(a)); i < Math.min(d.length, Math.round(z)); i++) { s += d[i] * d[i]; n++; } return n ? s / n : 0; };
  const dB = x => 10 * Math.log10(x + 1e-30);
  T.db = (name, t, w) => { const b = T.B[name]; return dB((rms(b.L, t * sr, (t + w) * sr) + rms(b.R, t * sr, (t + w) * sr)) / 2); };
  T.lr = (name, t, w) => { const b = T.B[name]; return dB(rms(b.L, t * sr, (t + w) * sr)) - dB(rms(b.R, t * sr, (t + w) * sr)); };
  T.hash = name => { const b = T.B[name], u = [new Uint32Array(b.L.buffer), new Uint32Array(b.R.buffer)]; let h = 0x811c9dc5; for (const a of u) for (let i = 0; i < a.length; i++) { h ^= a[i]; h = Math.imul(h, 16777619) >>> 0; } return b.L.length + ":" + h.toString(16); };
  T.diff = (a, b, from) => { const A = T.B[a], Bb = T.B[b], n = Math.min(A.L.length, Bb.L.length); let m = 0; for (let i = Math.round((from || 0) * sr); i < n; i++) { m = Math.max(m, Math.abs(A.L[i] - Bb.L[i]), Math.abs(A.R[i] - Bb.R[i])); } return m; };
  /* the level of one frequency (Goertzel, Hann window), in dB */
  T.tone = (name, f, t, w, ch) => { const b = T.B[name], d = ch === "R" ? b.R : b.L, a = Math.round(t * sr), N = Math.round(w * sr), k = 2 * Math.cos(2 * Math.PI * f / sr); let s1 = 0, s2 = 0;
    for (let i = 0; i < N; i++) { const x = d[a + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)), s0 = x + k * s1 - s2; s2 = s1; s1 = s0; } return dB((s1 * s1 + s2 * s2 - k * s1 * s2) / (N * N)); };
  /* the power of a band, from averaged spectra (4096-point FFTs, Hann) over t to t+w */
  T.band = (name, f0, f1, t, w) => { const b = T.B[name], N = 4096, re = new Float64Array(N), im = new Float64Array(N); let pw = 0, cnt = 0;
    for (let a = Math.round(t * sr); a + N <= Math.round((t + w) * sr); a += N / 2) { for (let i = 0; i < N; i++) { re[i] = (b.L[a + i] + b.R[a + i]) / 2 * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)); im[i] = 0; }
      for (let i = 1, j = 0; i < N; i++) { let bit = N >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
      for (let len = 2; len <= N; len <<= 1) { const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
        for (let i = 0; i < N; i += len) { let cr = 1, ci = 0; for (let j = 0; j < len / 2; j++) { const ur = re[i + j], ui = im[i + j], vr = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci, vi = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr;
          re[i + j] = ur + vr; im[i + j] = ui + vi; re[i + j + len / 2] = ur - vr; im[i + j + len / 2] = ui - vi; const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr; } } }
      for (let k = Math.ceil(f0 * N / sr); k <= Math.floor(f1 * N / sr); k++) pw += re[k] * re[k] + im[k] * im[k]; cnt++; }
    return dB(pw / cnt); };
  T.peakHz = (name, f0, f1, t, w) => { let best = -Infinity, bf = f0; for (let f = f0; f <= f1; f += 0.1) { const v = T.tone(name, f, t, w); if (v > best) { best = v; bf = f; } } return bf; };
  T.firstLoud = (name, thr) => { const d = T.B[name].L; for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > thr) return i / sr; return -1; };
  T.lastLoud = (name, thr) => { const d = T.B[name].L; for (let i = d.length - 1; i >= 0; i--) if (Math.abs(d[i]) > thr) return i / sr; return -1; };
  T.corr = (name, t, w) => { const b = T.B[name]; let xy = 0, xx = 0, yy = 0; for (let i = Math.round(t * sr); i < Math.round((t + w) * sr); i++) { xy += b.L[i] * b.R[i]; xx += b.L[i] * b.L[i]; yy += b.R[i] * b.R[i]; } return xy / Math.sqrt(xx * yy); };
  /* the first loud moment of (a − b) after t, in seconds */
  T.first = (a, b, t, thr) => { const A = T.B[a], Bb = T.B[b]; let m = 0; for (let i = Math.round(t * sr); i < A.L.length; i++) m = Math.max(m, Math.abs(A.L[i] - Bb.L[i]));
    for (let i = Math.round(t * sr); i < A.L.length; i++) if (Math.abs(A.L[i] - Bb.L[i]) > m * (thr || 0.5)) return i / sr; return -1; };
  T.peakAt = (name, t0, t1) => { const b = T.B[name]; let m = 0, at = 0; for (let i = Math.round(t0 * sr); i < Math.round(t1 * sr); i++) { const a = Math.abs(b.L[i]); if (a > m) { m = a; at = i; } } return at / sr; };
  T.recOn = async () => { const c = st.live();
    if (!T.node) { const code = 'class R extends AudioWorkletProcessor{constructor(){super();this.b=[];this.n=0;this.f0=-1;}process(i){const x=i[0];if(x&&x.length){if(this.f0<0)this.f0=currentFrame;this.b.push(x[0].slice(),(x[1]||x[0]).slice());this.n+=x[0].length;if(this.n>=2048){this.port.postMessage({f:this.f0,b:this.b});this.b=[];this.n=0;this.f0=-1;}}return true;}}registerProcessor("aogmorerec",R);';
      await c.audioWorklet.addModule(URL.createObjectURL(new Blob([code], { type: "text/javascript" })));
      T.node = new AudioWorkletNode(c, "aogmorerec", { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1], channelCount: 2, channelCountMode: "explicit" });
      const z = c.createGain(); z.gain.value = 0; st.LIVE.out.connect(T.node); T.node.connect(z); z.connect(c.destination);
      T.node.port.onmessage = e => { if (T.rec) T.rec.push(e.data); }; }
    T.rec = []; T.lsr = c.sampleRate; };
  T.recOff = () => { const ch = T.rec; T.rec = null; const f0 = ch[0].f, last = ch[ch.length - 1], f1 = last.f + last.b.length / 2 * 128;
    const L = new Float32Array(f1 - f0), R = new Float32Array(f1 - f0);
    ch.forEach(c => { for (let k = 0; k < c.b.length / 2; k++) { const o = c.f - f0 + k * 128; L.set(c.b[2 * k], o); R.set(c.b[2 * k + 1], o); } });
    T.live = { f0, L, R }; return (f1 - f0) / T.lsr; };
  T.ldb = (ct, w) => { const r = T.live, a = ct * T.lsr - r.f0, z = (ct + w) * T.lsr - r.f0; return dB((rms(r.L, a, z) + rms(r.R, a, z)) / 2); };
  T.llr = (ct, w) => { const r = T.live, a = ct * T.lsr - r.f0, z = (ct + w) * T.lsr - r.f0; return dB(rms(r.L, a, z)) - dB(rms(r.R, a, z)); };
  /* one track alone, at its knob's level as recorded, nothing else on it */
  T.plain = (i) => { const x = st.SONG.tracks[i]; Object.assign(x, { vol: 80, pan: 0, mute: false, solo: false, low: 0, mid: 0, high: 0, punch: 0, room: 0, echo: 0 }); delete x.fx; delete x.lines; };
  T.only = (i) => st.SONG.tracks.forEach((x, j) => { x.mute = j !== i; });
  T.fx = (i, list) => { const x = st.SONG.tracks[i]; const F = list.map(s => s ? { t: s.t, on: s.on !== false, p: Object.assign(__aogDeskMore.dmDefaults(s.t), s.p || {}) } : null); const c = __aogDeskMore.dmCleanFx(F); if (c) x.fx = c; else delete x.fx; st.songChanged(); };
  return T; })();`;
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const W = 20 / 330;
const setRange = (p, sel, v) => p.evaluate(([sel, v]) => { const r = document.querySelector(sel); r.value = String(v); r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true })); }, [sel, v]);

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage();
  await p.goto(U + "music-studio.html"); await p.waitForTimeout(700);
  await add(p, { n: 1, f: [330], bars: 6 }); await add(p, { n: 2, kind: "noise", bars: 4 }); await add(p, { n: 3, f: [1000, 7000], bars: 3 });
  await add(p, { n: 4, kind: "click", clicks: [0.5], bars: 4 }); await add(p, { n: 5, f: [9000], bars: 2 });
  await add(p, { n: 6, kind: "kick", bars: 3, from: "drums" }); await add(p, { n: 7, f: [220], bars: 3, from: "piano" });
  await add(p, { n: 8, f: [440 * Math.pow(2, 40 / 1200), 880 * Math.pow(2, 40 / 1200), 1320 * Math.pow(2, 40 / 1200)], amps: [0.6, 0.3, 0.15], bars: 3 });   /* a voice-like tone, 40 cents sharp of A */
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 8, null, { timeout: 8000 });
  await put(p, "Take 1", 0); await put(p, "Take 2", 1);
  await p.evaluate(HELP);
  ok(await p.evaluate(() => __aogStudio.songBpm()) === 100, "the song is at 100 beats a minute");

  /* 0 · empty slots, or a slot Off, are the desk as it was, to the last bit (the page before this change renders the same) */
  await p.evaluate(() => { const st = __aogStudio, x = st.SONG.tracks; Object.assign(x[0], { vol: 70, pan: -30, low: 3, punch: 30 });   /* (Room and Echo are left at 0: the browser's reverb and echo loop do not repeat to the bit, before or after) */ Object.assign(x[1], { vol: 60, high: -4 });
    st.SONG.master.glue = 40; st.selectTrack(0); st.clipAct("copy"); x[0].clip.xf = "10ms"; st.songChanged(); });
  await p.evaluate(() => __T.render("now"));
  const h0 = await p.evaluate(() => __T.hash("now"));
  await p.evaluate(() => { __aogStudio.SONG.tracks[0].fx = [null, null, null]; __aogStudio.SONG.tracks[1].fx = [null, null, null]; });
  await p.evaluate(() => __T.render("empty"));
  await p.evaluate(() => __T.fx(0, [{ t: "comp", on: false }, null, { t: "tape", on: false }]));
  await p.evaluate(() => __T.render("off"));
  const hs = await p.evaluate(() => [__T.hash("empty"), __T.hash("off"), __aogStudio.SONG.tracks[0].fx && __aogStudio.SONG.tracks[0].fx[0].t]);
  let hOld = "no old page";
  if (OLD) {
    await p.evaluate(() => { const x = __aogStudio.SONG.tracks[0]; delete x.fx; localStorage.setItem("aog.studio.v1", JSON.stringify(__aogStudio.SONG)); });
    const q = await c.newPage(); await q.goto(U + "music-studio-before.html"); await q.waitForFunction(() => window.__aogStudio && __aogStudio.BUF.size >= 2 && !__aogStudio.S.decoding, null, { timeout: 20000 });
    await q.waitForTimeout(300); await q.evaluate(HELP.replace(/__aogDeskMore\.[a-zA-Z]+/g, "(()=>{})")); await q.evaluate(() => __T.render("old"));
    hOld = await q.evaluate(() => __T.hash("old")); await q.close();
  }
  ok(hs[0] === h0 && hs[1] === h0 && hs[2] === "comp" && hOld === h0, `empty slots and slots turned Off render the very same bits as the page before this change (${h0}; empty ${hs[0]}, off ${hs[1]}, before ${hOld})`);

  /* 1 · the Compressor, through the panel: More for track 1 → Effects → Slot 1 → Compressor */
  await p.evaluate(() => { const st = __aogStudio; st.SONG.master.glue = 0; st.SONG.tracks[0].clip.pieces = null; delete st.SONG.tracks[0].clip.xf; [0, 1, 2, 3].forEach(i => __T.plain(i)); __T.only(0); st.songChanged(); });
  await p.selectOption("#trackSel", "0");
  await p.selectOption("#mtSel", "fx"); await p.waitForTimeout(60);
  const m0 = await p.evaluate(() => ({ lab: document.querySelector("#mtSel").closest("label").querySelector(".st-lab").textContent, opts: [...document.querySelectorAll("#mtSel option")].map(o => o.textContent).join(" | "),
    slot: [...document.querySelectorAll("#fxt0 option")].map(o => o.textContent).join(" | "), fs: parseFloat(getComputedStyle(document.getElementById("fxt0")).fontSize), hint: document.querySelector("#moreBox .st-line").textContent }));
  ok(m0.lab === "More for track 1" && m0.opts === "Closed | Effects | Takes · 1 | Name and colour" && m0.slot === "Empty | Compressor | Sweep EQ | Tape warmth | Chorus | Filter | Doubler | De-esser (for a voice) | Duck under another track | Tune the voice" && m0.fs >= 16
    && /^The sound goes through the slots from top to bottom/.test(m0.hint), "the track's menu and an effect slot's menu, in plain words: " + JSON.stringify(m0));
  await p.evaluate(() => __T.render("ref"));
  const u0 = await p.evaluate(() => __aogStudio.UNDO.length);
  await p.selectOption("#fxt0", "comp"); await p.waitForTimeout(60);
  const k1 = await p.evaluate(() => ({ knobs: [...document.querySelectorAll('#moreBox [data-slot="0"][data-fxk]')].map(r => r.closest("label").querySelector(".st-lab").textContent + " " + document.getElementById(r.id + "-o").textContent).join(" | "),
    btns: [...document.querySelectorAll('#moreBox [data-fxslot="0"] button')].map(x => x.textContent + (x.disabled ? " (rests)" : "")).join(" | "), gr: document.getElementById("gr0").textContent, u: __aogStudio.UNDO.length,
    fx: JSON.stringify(__aogStudio.SONG.tracks[0].fx), opt: document.querySelector('#mtSel option[value="fx"]').textContent }));
  ok(k1.knobs === "Starts at −24 dB | Strength 4:1 | Grabs in 10 ms | Lets go in 200 ms | Turn up after 0 dB" && k1.btns === "On | Move up (rests) | Move down" && k1.gr === "Holding back now: —" && k1.opt === "Effects · 1 on",
    "a Compressor in slot 1, its knobs in plain words, On, its order, its calm number at rest: " + JSON.stringify(k1));
  await setRange(p, "#fx0-thr", -30);
  await p.evaluate(() => __T.render("comp"));
  const pk = -20 * Math.log10(32768 / 9000), want = (-30 + (pk + 30) / 4) - pk;
  const gr = await p.evaluate(() => [3.0, 4.5, 6.0, 9.0, 12.0].map(t => +(__T.db("comp", t, 0.3) - __T.db("ref", t, 0.3)).toFixed(2)));
  ok(gr.every(g => near(g, want, 1.0)), `a steady tone at ${pk.toFixed(1)} dB through Starts at −30 dB, Strength 4:1: the level comes down ${(-want).toFixed(1)} dB as the curve says (measured ${gr.join(", ")} dB)`);
  await setRange(p, "#fx0-mk", 6); await p.evaluate(() => __T.render("comp6"));
  const mk = await p.evaluate(() => +(__T.db("comp6", 6, 0.5) - __T.db("comp", 6, 0.5)).toFixed(2));
  ok(near(mk, 6, 0.1), "Turn up after +6 dB: exactly 6 dB louder (" + mk + ")");
  /* Undo and Redo for a slot */
  const u1 = await p.evaluate(() => __aogStudio.UNDO.length), before = await p.evaluate(() => JSON.stringify(__aogStudio.SONG.tracks[0].fx));
  await p.mouse.click(4, 300);
  await p.keyboard.press("Control+z"); await p.waitForTimeout(80);
  const un = await p.evaluate(() => JSON.stringify(__aogStudio.SONG.tracks[0].fx));
  await p.keyboard.press("Control+Shift+z"); await p.waitForTimeout(80);
  const re = await p.evaluate(() => JSON.stringify(__aogStudio.SONG.tracks[0].fx));
  ok(u1 >= u0 + 3 && un !== before && re === before, `choosing the Compressor and moving two of its knobs are Undo steps (${u0} → ${u1}); Ctrl+Z takes the last back, Ctrl+Shift+Z does it again`);

  /* with nothing to squeeze it is the sound itself, 6 ms late; the desk makes that up, so it lines up with the other tracks */
  await p.evaluate(() => { const st = __aogStudio; st.SONG.tracks[0].fx[0].p.thr = 0; st.SONG.tracks[0].fx[0].p.ratio = 1; st.SONG.tracks[0].fx[0].p.mk = 0; st.SONG.tracks.forEach((x, j) => { x.mute = j > 1; }); st.songChanged(); });
  const lag0 = await p.evaluate(async () => { await __T.render("comp0"); return __aogDeskMore.dmLagFrames(44100); });
  await p.evaluate(() => { const x = __aogStudio.SONG.tracks[0]; x.fx[0].on = false; __aogStudio.songChanged(); }); await p.evaluate(() => __T.render("both"));
  const al = await p.evaluate(async () => ({ d: __T.diff("comp0", "both", 0.5), lag: __aogDeskMore.dmLagFrames(44100), lat: await __aogStudio.chainLatency(), fr: __aogDeskMore.dmCompFr(44100) }));
  ok(al.d < 2e-4 && lag0 === al.fr && al.lag === 0 && al.fr > 200 && al.fr < 300, `a compressor with nothing to do, on track 1 with the noise on track 2: the mix is the mix without it within ${al.d.toExponential(1)} after the first half second, where the browser's compressors settle (its ${al.fr} frames are made up for on track 2; the desk's own chain is ${al.lat} frames)`);
  await p.evaluate(() => { const x = __aogStudio.SONG.tracks[0]; x.fx[0].on = true; x.fx[0].p.thr = -30; x.fx[0].p.ratio = 4; __T.only(0); __aogStudio.songChanged(); });
  await p.click("#playBtn"); await p.waitForTimeout(2200);
  const live = await p.evaluate(() => document.getElementById("gr0").textContent);
  await p.click("#playBtn"); await p.waitForTimeout(150);
  const rest = await p.evaluate(() => document.getElementById("gr0").textContent);
  const lv = +((live.match(/([\d.]+) dB/) || [])[1]);
  ok(near(lv, -want, 2.5) && rest === "Holding back now: —", `while it plays the slot says how much it holds back, a calm number (${live}); stopped it rests (${rest})`);

  await p.evaluate(() => { __aogStudio.SONG.tracks[0].fx = null; delete __aogStudio.SONG.tracks[0].fx; __aogStudio.songChanged(); });

  /* 3 · the Sweep EQ: +12 dB at 1 kHz, an octave wide, on the noise */
  await p.evaluate(() => { __T.only(1); __aogStudio.songChanged(); }); await p.evaluate(() => __T.render("nref"));
  await p.evaluate(() => __T.fx(1, [{ t: "eq", p: { f1: 1000, g1: 12, w1: 1, g2: 0 } }])); await p.evaluate(() => __T.render("eq"));
  const eq = await p.evaluate(() => [[950, 1050], [5800, 6200], [180, 220]].map(([a, z]) => +(__T.band("eq", a, z, 1, 6) - __T.band("nref", a, z, 1, 6)).toFixed(2)));
  ok(near(eq[0], 12, 1) && Math.abs(eq[1]) < 0.6 && Math.abs(eq[2]) < 0.6, `the Sweep EQ: +12 dB at 1 kHz (${eq[0]}), nothing at 6 kHz (${eq[1]}) or 200 Hz (${eq[2]})`);
  /* the Filter: low-pass, then high-pass, at 1 kHz */
  await p.evaluate(() => __T.fx(1, [{ t: "filter", p: { typ: "lp", f: 1000, res: 0 } }])); await p.evaluate(() => __T.render("lp"));
  await p.evaluate(() => __T.fx(1, [{ t: "filter", p: { typ: "hp", f: 1000, res: 0 } }])); await p.evaluate(() => __T.render("hp"));
  const fl = await p.evaluate(() => ({ lpHi: +(__T.band("lp", 3800, 4200, 1, 6) - __T.band("nref", 3800, 4200, 1, 6)).toFixed(1), lpLo: +(__T.band("lp", 180, 220, 1, 6) - __T.band("nref", 180, 220, 1, 6)).toFixed(2),
    hpLo: +(__T.band("hp", 180, 220, 1, 6) - __T.band("nref", 180, 220, 1, 6)).toFixed(1), hpHi: +(__T.band("hp", 3800, 4200, 1, 6) - __T.band("nref", 3800, 4200, 1, 6)).toFixed(2) }));
  ok(fl.lpHi < -18 && Math.abs(fl.lpLo) < 0.5 && fl.hpLo < -18 && Math.abs(fl.hpHi) < 0.5, "the Filter at 1 kHz: low-pass cuts 4 kHz, keeps 200 Hz; high-pass the other way: " + JSON.stringify(fl));
  /* the Doubler: the same noise left and right becomes two sounds */
  await p.evaluate(() => __T.fx(1, [{ t: "dbl" }])); await p.evaluate(() => __T.render("dbl"));
  const dc = await p.evaluate(() => [+__T.corr("nref", 1, 4).toFixed(3), +__T.corr("dbl", 1, 4).toFixed(3)]);
  ok(dc[0] > 0.999 && dc[1] < 0.9, `the Doubler: left and right were one sound (correlation ${dc[0]}), now two (${dc[1]})`);
  /* the order of the slots: Tape then Filter is not Filter then Tape; put back, the same bits again */
  await p.evaluate(() => __T.fx(1, [{ t: "tape", p: { drive: 100 } }, { t: "filter", p: { typ: "lp", f: 600 } }])); await p.evaluate(() => __T.render("o1"));
  await p.selectOption("#trackSel", "1"); await p.waitForTimeout(60);
  await p.click('#moreBox [data-fxa="down"][data-slot="0"]'); await p.waitForTimeout(80);
  const ord = await p.evaluate(() => __aogStudio.SONG.tracks[1].fx.filter(Boolean).map(s => s.t).join(","));
  await p.evaluate(() => __T.render("o2"));
  await p.click('#moreBox [data-fxa="up"][data-slot="1"]'); await p.waitForTimeout(80);
  await p.evaluate(() => __T.render("o3"));
  const oh = await p.evaluate(() => [__T.hash("o1"), __T.hash("o2"), __T.hash("o3")]);
  ok(ord === "filter,tape" && oh[0] !== oh[1] && oh[0] === oh[2], "Move down and Move up change the order, and the sound with it; put back, the very same bits: " + ord);

  /* 4 · Tape warmth: a third harmonic on the tone; a 9 kHz tone does not fold back (oversampled) */
  await put(p, "Take 5", 2);
  await p.evaluate(() => { [1, 2].forEach(i => __T.plain(i)); __T.only(0); __aogStudio.songChanged(); }); await p.evaluate(() => __T.render("tref"));
  await p.evaluate(() => __T.fx(0, [{ t: "tape", p: { drive: 100 } }])); await p.evaluate(() => __T.render("tape"));
  const h3 = await p.evaluate(() => [+(__T.tone("tref", 990, 3, 0.5) - __T.tone("tref", 330, 3, 0.5)).toFixed(1), +(__T.tone("tape", 990, 3, 0.5) - __T.tone("tape", 330, 3, 0.5)).toFixed(1)]);
  await p.evaluate(() => { __T.plain(0); __T.only(2); __T.fx(2, [{ t: "tape", p: { drive: 100 } }]); }); await p.evaluate(() => __T.render("hi"));
  const al9 = await p.evaluate(() => ({ f: +__T.tone("hi", 9000, 2, 1).toFixed(1), a17: +(__T.tone("hi", 17100, 2, 1) - __T.tone("hi", 9000, 2, 1)).toFixed(1), a09: +(__T.tone("hi", 900, 2, 1) - __T.tone("hi", 9000, 2, 1)).toFixed(1),
    a8: +(__T.tone("hi", 8100, 2, 1) - __T.tone("hi", 9000, 2, 1)).toFixed(1) }));
  ok(h3[0] < -70 && h3[1] > -40, `Tape warmth adds warmth: the third harmonic of the tone ${h3[0]} → ${h3[1]} dB under it`);
  ok(al9.a17 < -60 && al9.a09 < -60 && al9.a8 < -60, `Tape warmth on a 9 kHz tone: what would fold back (17.1 kHz, 8.1 kHz, 900 Hz) stays more than 60 dB under it (oversampled): ` + JSON.stringify(al9));
  /* the De-esser: 7 kHz comes down, 1 kHz stays */
  await put(p, "Take 3", 3);
  await p.evaluate(() => { __T.plain(2); __T.plain(3); __T.only(3); __aogStudio.songChanged(); }); await p.evaluate(() => __T.render("sref"));
  await p.evaluate(() => __T.fx(3, [{ t: "dess", p: { f: 7000, thr: -45 } }])); await p.evaluate(() => __T.render("dess"));
  const ds = await p.evaluate(() => ({ s7: +(__T.tone("dess", 7000, 3, 1) - __T.tone("sref", 7000, 3, 1)).toFixed(2), s1: +(__T.tone("dess", 1000, 3, 1) - __T.tone("sref", 1000, 3, 1)).toFixed(2) }));
  await p.evaluate(() => { __aogStudio.SONG.tracks[3].fx[0].p.thr = 0; __aogStudio.songChanged(); }); await p.evaluate(() => __T.render("dess0"));
  const d0 = await p.evaluate(() => ({ s7: +(__T.tone("dess0", 7000, 3, 1) - __T.tone("sref", 7000, 3, 1)).toFixed(3), s1: +(__T.tone("dess0", 1000, 3, 1) - __T.tone("sref", 1000, 3, 1)).toFixed(3) }));
  ok(ds.s7 < -6 && Math.abs(ds.s1) < 0.5 && Math.abs(d0.s7) < 0.05 && Math.abs(d0.s1) < 0.05, `the De-esser on 1 kHz + 7 kHz: 7 kHz ${ds.s7} dB, 1 kHz ${ds.s1} dB; with nothing to squeeze, both as they were (${d0.s7}, ${d0.s1})`);

  /* 4b · Duck under another track (Jimmy's 4): a steady pad dips under each kick by the Depth, and comes back over the release */
  await put(p, "Drum take 6", 5); await put(p, "Piano take 7", 6);
  await p.evaluate(() => { [3, 5, 6].forEach(i => __T.plain(i)); __aogStudio.SONG.tracks.forEach((x, j) => { x.mute = j !== 5 && j !== 6; }); __aogStudio.songChanged(); });
  await p.evaluate(() => __T.render("pad", 6)); await p.evaluate(() => __T.render("padmix"));
  await p.selectOption("#trackSel", "6"); await p.selectOption("#mtSel", "fx"); await p.selectOption("#fxt0", "duck"); await p.waitForTimeout(100);
  const dk = await p.evaluate(() => ({ key: document.getElementById("fx0-key").value, opts: [...document.querySelectorAll("#fx0-key option")].slice(0, 2).map(o => o.textContent).join(" | "),
    knobs: [...document.querySelectorAll('#moreBox [data-slot="0"][data-fxk]')].map(r => r.closest("label").querySelector(".st-lab").textContent).join(" | "), hint: document.querySelector('#moreBox [data-fxslot="0"] .st-line').textContent }));
  ok(dk.key === "5" && dk.opts === "Pick a track | Track 1 · Guitar" && dk.knobs === "Listens to | Depth | Grabs in | Lets go in" && /^This track dips each time the track it listens to plays/.test(dk.hint),
    "Duck under another track: it listens to the drums on track 6 at once; Depth, Grabs in, Lets go in " + JSON.stringify(dk));
  await setRange(p, "#fx0-depth", -10); await setRange(p, "#fx0-atk", 2); await setRange(p, "#fx0-rel", 100);
  await p.evaluate(() => __T.render("duck", 6));
  const du = await p.evaluate(() => [1.2, 1.8, 2.4, 3.0].map(tk => ({ dip: +(__T.db("duck", tk + 0.03, 0.02) - __T.db("pad", tk + 0.03, 0.02)).toFixed(2), mid: +(__T.db("duck", tk + 0.2, 0.02) - __T.db("pad", tk + 0.2, 0.02)).toFixed(2),
    back: +(__T.db("duck", tk + 0.52, 0.03) - __T.db("pad", tk + 0.52, 0.03)).toFixed(2) })));
  ok(du.every(q => near(q.dip, -10, 1) && q.mid < -1 && q.mid > -7 && Math.abs(q.back) < 0.5), "the pad (track 7, as its own file too) dips 10 dB under each kick and comes back over the 100 ms release: " + JSON.stringify(du));
  await p.selectOption("#fx0-key", "-1"); await p.waitForTimeout(60); await p.evaluate(() => __T.render("nokey", 6));
  ok(await p.evaluate(() => __T.hash("nokey") === __T.hash("pad")), "with no track to listen to, the slot does nothing: the very same bits");
  await p.selectOption("#fx0-key", "5"); await p.waitForTimeout(60);
  await p.evaluate(() => __T.render("duckmix"));
  await p.waitForFunction(() => __aogStudio.LIVE && __aogStudio.LIVE.c._dmDuck === true, null, { timeout: 8000 }); await p.waitForTimeout(100);
  const latD = await p.evaluate(async () => (await __aogStudio.chainLatency()) / 44100);
  await p.evaluate(() => __T.recOn());
  const wd = await p.evaluate(() => { __aogStudio.play(); return Object.assign({}, __aogStudio.PLAY.wins[0], { lag: __aogStudio.LIVE.lag }); });
  await p.waitForTimeout(3800); await p.evaluate(() => __aogStudio.stop()); await p.waitForTimeout(200); await p.evaluate(() => __T.recOff());
  const dl2 = await p.evaluate(([w, lat]) => [1.23, 1.4, 1.75, 2.43, 2.6, 2.95].map(s => { const ct = w.at + (s - w.from) + lat + w.lag; return { s, live: +__T.ldb(ct, 0.02).toFixed(2), mix: +__T.db("duckmix", s, 0.02).toFixed(2) }; }), [wd, latD]);
  ok(dl2.every(q => near(q.live, q.mix, 0.5)), "the speakers duck as the bounce does (within 0.5 dB): " + dl2.map(q => q.s + "s " + q.live + "/" + q.mix).join(", "));
  /* Tune the voice (Jimmy's 6): a voice-like tone 40 cents sharp of A, the song in C major */
  await p.evaluate(() => { AOGSong.set({ key: 0, minor: false }); __T.fx(6, []); });
  await put(p, "Guitar take 8", 6);
  await p.evaluate(() => { __T.plain(6); __aogStudio.SONG.tracks.forEach((x, j) => { x.mute = j !== 6; }); __aogStudio.songChanged(); });
  await p.evaluate(() => __T.render("v0"));
  const tn = await p.evaluate(() => { const s = document.getElementById("fxt0"); s.value = "tune"; s.dispatchEvent(new Event("change", { bubbles: true }));
    return { say: document.getElementById("tuneSay0").textContent, hint: document.querySelector('#moreBox [data-fxslot="0"] .st-line').textContent,
      knobs: [...document.querySelectorAll('#moreBox [data-slot="0"][data-fxk]')].map(r => r.closest("label").querySelector(".st-lab").textContent + " " + document.getElementById(r.id + "-o").textContent).join(" | ") }; });
  await p.waitForFunction(() => __aogDeskMore.DM.tuning === 0, null, { timeout: 30000 });
  await setRange(p, "#fx0-amt", 100); await setRange(p, "#fx0-spd", 100);
  await p.waitForFunction(() => __aogDeskMore.DM.tuning === 0, null, { timeout: 30000 }); await p.evaluate(() => __aogStudio.stretchAll());
  await p.evaluate(() => __T.render("v100"));
  const tv = await p.evaluate(() => ({ f0: +__T.peakHz("v0", 430, 460, 1, 2).toFixed(1), f1: +__T.peakHz("v100", 430, 460, 1, 2).toFixed(1), f1b: +__T.peakHz("v100", 430, 460, 4, 2).toFixed(1),
    on: (() => { const c = __aogStudio.SONG.tracks[6].clip, o = __aogStudio.BUF.get(c.id), q = __aogDeskMore.dmBase(c), f = d => { for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > 0.05) return i / o.sampleRate; return -1; };
      return [+f(o.getChannelData(0)).toFixed(4), +f(q.getChannelData(0)).toFixed(4), q !== o]; })(), off: [+__T.lastLoud("v0", 0.01).toFixed(3), +__T.lastLoud("v100", 0.01).toFixed(3)], len: [__T.B.v0.L.length, __T.B.v100.L.length],
    say: document.getElementById("tuneSay0").textContent }));
  ok(/^Tuning your voice…$/.test(tn.say) && tn.knobs === "Amount 70 % | Speed 50 · medium" && /toward the song's key, C major, before the track's strip\.$/.test(tn.hint), "Tune the voice: Amount and Speed, toward the song's key, and Tuning your voice… while it works " + JSON.stringify(tn));
  ok(near(tv.f0, 450.3, 0.6) && near(tv.f1, 440, 1) && near(tv.f1b, 440, 1) && tv.on[2] && near(tv.on[1], tv.on[0], 0.005) && near(tv.off[1], tv.off[0], 0.02) && tv.len[0] === tv.len[1] && tv.say === "",
    `at 100 % and fast, a tone 40 cents sharp (${tv.f0} Hz) is pulled to A (${tv.f1} Hz, ${tv.f1b} Hz later on); the tuned recording starts when it did (${tv.on.slice(0, 2).join(" / ")} s), the song ends when it did (${tv.off.join(" / ")} s), as long to the sample`);
  await setRange(p, "#fx0-amt", 0); await p.evaluate(() => __aogStudio.stretchAll()); await p.evaluate(() => __T.render("vz"));
  ok(await p.evaluate(() => __T.hash("vz") === __T.hash("v0")), "at 0 % the voice is left alone: the very same bits");
  await p.evaluate(() => { __T.fx(6, []); __T.plain(5); __aogStudio.songChanged(); });

  /* 5 · the Chorus, and a chain (Compressor, Sweep EQ, Tape, Chorus) heard on the speakers as in the bounce */
  await p.evaluate(() => { __T.plain(3); __T.only(0); __T.fx(0, [{ t: "chorus", p: { rate: 0.8, depth: 60, mix: 60 } }]); }); await p.evaluate(() => __T.render("ch"));
  const ch = await p.evaluate(W => [0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map(t => +__T.lr("ch", t, W).toFixed(2)), W);
  ok(Math.max(...ch) - Math.min(...ch) > 1, "the Chorus: left and right sway apart and back (left minus right: " + ch.join(", ") + " dB)");
  await p.evaluate(() => __T.fx(0, [{ t: "comp", p: { thr: -30, ratio: 3 } }, { t: "eq", p: { f1: 660, g1: 6 } }, { t: "chorus", p: { rate: 1.3, depth: 70, mix: 60 } }]));
  await p.evaluate(() => { const s = document.getElementById("startSel"); s.value = "2"; s.dispatchEvent(new Event("change", { bubbles: true })); });
  await p.evaluate(() => __T.render("chain"));
  const lat = await p.evaluate(async () => (await __aogStudio.chainLatency()) / 44100);
  await p.evaluate(() => __T.recOn());
  const w1 = await p.evaluate(() => { __aogStudio.play(); return Object.assign({}, __aogStudio.PLAY.wins[0], { lag: __aogStudio.LIVE.lag }); });
  await p.waitForTimeout(4600);
  await p.evaluate(() => __aogStudio.stop()); await p.waitForTimeout(250);
  await p.evaluate(() => __T.recOff());
  const cmp = await p.evaluate(([w, lat, W]) => [3.0, 3.6, 4.2, 4.8, 5.4, 6.0].map(s => { const ct = w.at + (s - w.from) + lat + w.lag;
    return { s, live: +__T.ldb(ct, W).toFixed(2), mix: +__T.db("chain", s, W).toFixed(2), llr: +__T.llr(ct, W).toFixed(2), mlr: +__T.lr("chain", s, W).toFixed(2) }; }), [w1, lat, W]);
  ok(cmp.every(q => near(q.live, q.mix, 0.5) && near(q.llr, q.mlr, 0.5)), "a chain of a Compressor, a Sweep EQ and a Chorus, played from bar 2: the speakers match the bounce within 0.5 dB, left and right too (the Chorus sways in time with the song): " + cmp.map(q => q.s + "s " + q.live + "/" + q.mix + " lr " + q.llr + "/" + q.mlr).join(", "));
  await p.evaluate(() => { const s = document.getElementById("startSel"); s.value = "1"; s.dispatchEvent(new Event("change", { bubbles: true })); });

  /* 6 · kept: a reload, and a song file on a fresh device */
  const fxKeep = await p.evaluate(() => JSON.stringify(__aogStudio.SONG.tracks.map(x => x.fx || null)));
  const hKeep = await p.evaluate(() => __T.hash("chain"));
  await p.reload(); await p.waitForFunction(() => window.__aogStudio && __aogStudio.BUF.size >= 4 && !__aogStudio.S.decoding, null, { timeout: 30000 });
  await p.waitForTimeout(300); await p.evaluate(HELP);
  await p.evaluate(() => __T.render("back"));
  const back = await p.evaluate(() => ({ j: JSON.stringify(__aogStudio.SONG.tracks.map(x => x.fx || null)), h: __T.hash("back") }));
  ok(back.j === fxKeep && back.h === hKeep, "after a reload every slot is back, and the song is the very same bits");
  const b64 = await p.evaluate(async () => { const f = await __aogStudio.songFile(), u = new Uint8Array(await f.arrayBuffer()); let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); });
  const c2 = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(c2); await routes(c2);
  const q = await c2.newPage(); await q.goto(U2 + "music-studio.html"); await q.waitForTimeout(700);
  const there = await q.evaluate(async b64 => { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const st = __aogStudio, r = await st.readSongFile(new Blob([u])); await st.applySong(r); return JSON.stringify(st.SONG.tracks.map(x => x.fx || null)); }, b64);
  await q.waitForFunction(() => __aogStudio.BUF.size >= 4 && !__aogStudio.S.decoding, null, { timeout: 30000 });
  await q.evaluate(HELP); await q.evaluate(() => __T.render("there"));
  ok(there === fxKeep && await q.evaluate(() => __T.hash("there")) === hKeep, "a song file opened on a fresh device: the same slots, the same bits");
  await c2.close();

  /* 7 · the Echo in beats */
  await p.evaluate(() => { const st = __aogStudio; [0, 1, 2, 3].forEach(i => __T.plain(i)); });
  await put(p, "Take 4", 4);
  await p.evaluate(() => { __T.plain(4); __T.only(4); __aogStudio.songChanged(); });
  const e0 = await p.evaluate(() => ({ opts: [...document.querySelectorAll("#etSel option")].map(o => o.textContent).join(" | "), v: document.getElementById("etSel").value, lab: document.getElementById("etSel").closest("label").querySelector(".st-lab").textContent,
    inMaster: !!document.querySelector("#master #etSel") }));
  ok(e0.inMaster && e0.lab === "Echo time" && e0.v === "d8" && e0.opts === "1/4 · one beat | 1/8 · half a beat | Dotted 1/8 · three quarters of a beat | 1/8 triplet · a third of a beat | 1/16 · a quarter of a beat",
    "the whole song has Echo time, in beats; a dotted eighth, as always: " + JSON.stringify(e0));
  await p.evaluate(() => __T.render("dry"));
  await p.evaluate(() => { __aogStudio.SONG.tracks[4].echo = 100; __aogStudio.songChanged(); });
  const echoAt = async () => { await p.evaluate(() => __T.render("wet")); return p.evaluate(() => { const a = __T.peakAt("dry", 0.3, 0.8), t = __T.first("wet", "dry", a + 0.05, 0.5); return +(t - a).toFixed(4); }); };
  const got = {};
  for (const [k, beats] of [["d8", 0.75], ["q", 1], ["e", 0.5], ["t8", 1 / 3], ["s", 0.25]]) {
    await p.selectOption("#etSel", k); await p.waitForTimeout(40); got[k] = [await echoAt(), +(beats * 0.6).toFixed(4)]; }
  ok(Object.values(got).every(([g, w]) => near(g, w, 0.0025)), "at 100 a minute the echo of a click comes one dotted 1/8, 1/4, 1/8, 1/8 triplet and 1/16 later (within 2.5 ms): " + JSON.stringify(got));
  await p.selectOption("#etSel", "q");
  await p.click("#playBtn"); await p.waitForTimeout(400);
  await p.evaluate(() => AOGSong.set({ bpm: 120 })); await p.waitForTimeout(300);
  const dl = await p.evaluate(() => +__aogStudio.LIVE.dly.delayTime.value.toFixed(4));
  await p.click("#playBtn");
  const g120 = await echoAt();
  await p.evaluate(() => AOGSong.set({ bpm: 100 })); await p.waitForTimeout(100);
  ok(near(g120, 0.5, 0.0025) && near(dl, 0.5, 0.002), `the song at 120: a 1/4 echo is 0.5 s, in the bounce (${g120}) and on the speakers while it plays (${dl})`);

  /* 8 · Undo for mixer moves */
  await p.evaluate(() => { __aogStudio.SONG.tracks.forEach(x => { x.mute = false; }); __aogStudio.SONG.master.glue = 30; delete __aogStudio.SONG.master.et; __aogStudio.songChanged(); __aogStudio.selectTrack(0); __aogStudio.paintAll(); });
  const ua = await p.evaluate(() => __aogStudio.UNDO.length);
  await p.focus("#t0-vol"); for (let k = 0; k < 5; k++) await p.keyboard.press("ArrowRight");
  const v5 = await p.evaluate(() => [__aogStudio.SONG.tracks[0].vol, __aogStudio.UNDO.length]);
  await p.click("#tlUndo"); await p.waitForTimeout(80);
  const vu = await p.evaluate(() => [__aogStudio.SONG.tracks[0].vol, +document.getElementById("t0-vol").value, +document.getElementById("fv0").value]);
  await p.click("#tlRedo"); await p.waitForTimeout(80);
  const vr = await p.evaluate(() => __aogStudio.SONG.tracks[0].vol);
  ok(v5[0] === 85 && v5[1] === ua + 1 && vu.every(v => v === 80) && vr === 85, `a run of five slider moves (80 → 85) is one Undo step; Undo puts the fader back (${vu.join(",")}), Redo moves it again`);
  await p.click('#mixer .st-strip[data-tr="0"] [data-ms="mute"]');
  await p.evaluate(() => { const r = document.getElementById("t0-pan"); for (let v = 5; v <= 50; v += 5) { r.value = String(-v); r.dispatchEvent(new Event("input", { bubbles: true })); } });
  await p.evaluate(() => { const r = document.getElementById("t0-low"); r.value = "6"; r.dispatchEvent(new Event("input", { bubbles: true })); const s = document.getElementById("t0-room"); s.value = "40"; s.dispatchEvent(new Event("input", { bubbles: true })); });
  await p.evaluate(() => { const r = document.getElementById("m-glue"); r.value = "70"; r.dispatchEvent(new Event("input", { bubbles: true })); });
  await p.selectOption("#etSel", "s");
  const mx = await p.evaluate(() => { const x = __aogStudio.SONG.tracks[0]; return [x.mute, x.pan, x.low, x.room, __aogStudio.SONG.master.glue, __aogStudio.SONG.master.et].join(); });
  const steps = [];
  for (let k = 0; k < 6; k++) { await p.click("#tlUndo"); await p.waitForTimeout(50); steps.push(await p.evaluate(() => { const x = __aogStudio.SONG.tracks[0]; return [x.mute, x.pan, x.low, x.room, __aogStudio.SONG.master.glue, __aogStudio.SONG.master.et || "d8"].join(); })); }
  const mute0 = await p.evaluate(() => [document.querySelector('#mixer .st-strip[data-tr="0"] [data-ms="mute"]').getAttribute("aria-pressed"), document.getElementById("etSel").value]);
  ok(mx === "true,-50,6,40,70,s" && steps.join(" / ") === "true,-50,6,40,70,d8 / true,-50,6,40,30,d8 / true,-50,6,0,30,d8 / true,-50,0,0,30,d8 / true,0,0,0,30,d8 / false,0,0,0,30,d8" && mute0.join() === "false,d8",
    "Undo takes back, one at a time: the Echo's time, Glue, the Room send, Low, a run of Side moves, Mute: " + steps.join(" / "));
  for (let k = 0; k < 6; k++) await p.click("#tlRedo");
  ok(await p.evaluate(() => { const x = __aogStudio.SONG.tracks[0]; return [x.mute, x.pan, x.low, x.room, __aogStudio.SONG.master.glue, __aogStudio.SONG.master.et].join(); }) === mx, "Redo does them all again");
  await p.evaluate(() => { const x = __aogStudio.SONG.tracks[0]; Object.assign(x, { mute: false, pan: 0, low: 0, room: 0 }); __aogStudio.SONG.master.glue = 30; delete __aogStudio.SONG.master.et; __aogStudio.songChanged(); __aogStudio.paintAll(); });

  /* 9 · a name and a colour */
  await p.selectOption("#mtSel", "look"); await p.waitForTimeout(60);
  await p.fill("#tkName", "Riffs"); await p.waitForTimeout(60);
  await p.selectOption("#tkCol", "rose"); await p.waitForTimeout(80);
  const lk = await p.evaluate(() => ({ lane: document.querySelector('#timeline .st-lane[data-sel="0"] .st-lnm').textContent, c: document.querySelector('#timeline .st-lane[data-sel="0"] .st-ln').style.getPropertyValue("--c"),
    ch: document.querySelector("#chStrip .st-chn").textContent, tape: document.querySelector('#chFaders .st-f1[data-tr="0"] .st-tape').textContent, strip: document.querySelector('#mixer .st-strip[data-tr="0"]').style.getPropertyValue("--c"),
    fs: parseFloat(getComputedStyle(document.getElementById("tkName")).fontSize), opts: [...document.querySelectorAll("#tkCol option")].map(o => o.textContent).join(" | "), ph: document.getElementById("tkName").placeholder }));
  ok(lk.lane === "Riffs" && lk.c === "#eeb0b4" && lk.ch === "Riffs" && lk.tape === "Riffs" && lk.strip === "#eeb0b4" && lk.fs >= 16 && lk.opts === "Gold | Sage | Coral | Sky | Orchid | Lilac | Mint | Sand | Rose | Ice" && lk.ph === "Guitar",
    "a name and a colour: on the lane, the channel strip, the fader's tape and the mixer: " + JSON.stringify(lk));
  const pc0 = await p.evaluate(`(${PROBE})()`);
  ok(!pc0.length, "with a name and a colour of its own, every word on the desk reads (" + pc0.length + " " + JSON.stringify(pc0.slice(0, 2)) + ")");
  await p.reload(); await p.waitForFunction(() => window.__aogStudio && __aogStudio.BUF.size >= 4 && !__aogStudio.S.decoding, null, { timeout: 30000 }); await p.waitForTimeout(200); await p.evaluate(HELP);
  ok(await p.evaluate(() => { const x = __aogStudio.SONG.tracks[0]; return x.name === "Riffs" && x.col === "rose" && document.querySelector('#timeline .st-lane[data-sel="0"] .st-lnm').textContent === "Riffs"; }), "a reload keeps the name and the colour");

  /* 10 · versions: saved without copying any recording, opened, and A/B while it plays */
  await p.evaluate(() => { const st = __aogStudio; st.SONG.tracks.forEach((x, j) => { x.mute = j > 1; }); st.songChanged(); });
  await p.fill("#verName", "First mix"); await p.click("#verSave"); await p.waitForTimeout(150);
  await p.evaluate(() => { const st = __aogStudio; st.SONG.tracks[0].mute = true; st.songChanged(); });
  await p.click("#verSave"); await p.waitForTimeout(150);
  const vs = await p.evaluate(async () => { const st = __aogStudio, keys = await st.skeys(), ids = new Set(); st.SONG.tracks.forEach(x => { if (x.clip) ids.add(x.clip.id); });
    const vk = keys.filter(k => /^ver:/.test(k)), audio = keys.filter(k => /^c/.test(k)), v = await st.sget(vk[0]);
    return { opts: [...document.querySelectorAll("#verSel option")].map(o => o.textContent.split(" · ")[0]).join(" | "), vk: vk.length, audio: audio.length, ids: ids.size, blob: JSON.stringify(v).length < 200000 && !(v.song && v.song.wav),
      msg: document.getElementById("verMsg").textContent, list: JSON.parse(localStorage.getItem("aog.studio.versions.v1")).length }; });
  ok(vs.opts === "Version 2 | First mix" && vs.vk === 2 && vs.audio === vs.ids && vs.blob && vs.msg === "Saved on this device: Version 2." && vs.list === 2,
    "two versions saved on this device; the recordings are kept once, never copied again: " + JSON.stringify(vs));
  await p.selectOption("#verSel", { index: 1 });
  await p.click("#verOpen"); await p.waitForTimeout(60);
  const ask = await p.evaluate(() => [document.getElementById("verAsk").hidden, document.getElementById("verAskT").textContent, document.getElementById("verYes").textContent]);
  await p.click("#verYes"); await p.waitForTimeout(300);
  ok(!ask[0] && /^Open First mix\? It takes the place of the song on the desk now\./.test(ask[1]) && ask[2] === "Yes, open it" && await p.evaluate(() => __aogStudio.SONG.tracks[0].mute === false && document.getElementById("verMsg").textContent === "First mix is on the desk."),
    "Open asks first, then First mix is on the desk (track 1 heard again)");
  /* A/B: the song plays; B (Version 2, track 2 muted) and back to A, from the same spot */
  await p.selectOption("#verSel", { index: 0 }); await p.click("#verCmp"); await p.waitForSelector("#verB", { timeout: 8000 });
  await p.evaluate(() => __T.recOn());
  await p.evaluate(() => __aogStudio.play()); await p.waitForTimeout(1600);
  const pa = await p.evaluate(() => ({ pos: __aogStudio.songPos(__aogStudio.AC.currentTime), ct: __aogStudio.AC.currentTime, saved: localStorage.getItem("aog.studio.v1") }));
  await p.click("#verB"); await p.waitForTimeout(40);
  const pb = await p.evaluate(() => ({ pos: __aogStudio.songPos(__aogStudio.AC.currentTime), ct: __aogStudio.AC.currentTime, on: __aogStudio.PLAY.on, m: __aogStudio.SONG.tracks[0].mute, pressed: document.getElementById("verB").getAttribute("aria-pressed") }));
  await p.waitForTimeout(1400);
  await p.evaluate(() => { const st = __aogStudio; st.SONG.tracks[0].vol = 81; st.songChanged(); });
  const blocked = await p.evaluate(() => localStorage.getItem("aog.studio.v1"));
  await p.click("#verA"); await p.waitForTimeout(1400);
  const pz = await p.evaluate(() => ({ on: __aogStudio.PLAY.on, m: __aogStudio.SONG.tracks[0].mute, ct: __aogStudio.AC.currentTime }));
  await p.evaluate(() => __aogStudio.stop()); await p.waitForTimeout(150); await p.evaluate(() => __T.recOff());
  const lvA = await p.evaluate(ct => +__T.ldb(ct - 0.6, 0.3).toFixed(1), pb.ct), lvB = await p.evaluate(ct => +__T.ldb(ct + 0.9, 0.3).toFixed(1), pb.ct), lvA2 = await p.evaluate(ct => +__T.ldb(ct - 0.5, 0.3).toFixed(1), pz.ct);
  await p.click("#verStop"); await p.waitForTimeout(60);
  ok(pb.on && pb.m === true && pb.pressed === "true" && near(pb.pos - pa.pos, pb.ct - pa.ct, 0.08) && pz.on && pz.m === false && blocked === pa.saved && lvA - lvB > 3 && near(lvA2, lvA, 1.5),
    `A/B while it plays: B (track 1 muted) from the very same spot (${pa.pos.toFixed(2)} → ${pb.pos.toFixed(2)} s), the speakers ${lvA} → ${lvB} dB, A again ${lvA2} dB; nothing is saved while B is on`);
  ok(await p.evaluate(() => !document.getElementById("verA") && __aogStudio.SONG.tracks[0].mute === false && JSON.parse(localStorage.getItem("aog.studio.v1")).tracks[0].mute === false), "Stop comparing: your song is back on the desk");

  /* 11 · Spanish */
  await p.evaluate(() => { __aogStudio.SONG.tracks[0].fx = [{ t: "comp", on: true, p: __aogDeskMore.dmDefaults("comp") }, null, null]; __aogStudio.songChanged(); __aogStudio.selectTrack(1); __aogStudio.selectTrack(0); });
  await p.selectOption("#mtSel", "fx");
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(150);
  const es = await p.evaluate(() => ({ mt: [...document.querySelectorAll("#mtSel option")].map(o => o.textContent).join(" | "), slot: document.querySelector("#fxt0").closest("label").querySelector(".st-lab").textContent,
    knobs: [...document.querySelectorAll('#moreBox [data-slot="0"][data-fxk]')].map(r => r.closest("label").querySelector(".st-lab").textContent).join(" | "), gr: document.getElementById("gr0").textContent,
    et: document.getElementById("etSel").closest("label").querySelector(".st-lab").textContent + ": " + document.querySelector("#etSel option:checked").textContent, ver: document.getElementById("verSave").textContent,
    vh: document.querySelector("#verBlk h2").textContent, cmp: document.getElementById("verCmp").textContent, slotEs: [...document.querySelectorAll("#fxt0 option")].slice(-2).map(o => o.textContent).join(" | ") }));
  ok(es.mt === "Cerrado | Efectos · 1 encendido | Tomas · 1 | Nombre y color" && es.slot === "Espacio 1" && es.knobs === "Empieza en | Fuerza | Actúa en | Suelta en | Subir después" && es.gr === "Reduciendo ahora: —"
    && es.et === "Tiempo del eco: 1/8 con puntillo · tres cuartos de pulso" && es.ver === "Guardar esta versión" && es.vh === "Versiones de esta canción" && es.cmp === "Comparar con tu canción de ahora" && es.slotEs === "Bajar bajo otra pista | Afinar la voz", "Spanish: " + JSON.stringify(es));
  await p.evaluate(() => document.getElementById("langBtn").click());
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();

  /* 12 · an iPhone and an iPad, light and dark: two effects open, a name, a version: it fits, reads and is calm */
  for (const [dev, theme] of [["iPhone 13", "light"], ["iPhone 13", "dark"], ["iPad (gen 7)", "light"], ["iPad (gen 7)", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(700);
    await add(m, { n: 1, f: [330], bars: 4 });
    await m.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
    await m.click("#putBtn"); await m.waitForFunction(() => __aogStudio.SONG.tracks[0].clip && !__aogStudio.S.busy, null, { timeout: 15000 });
    await m.evaluate(HELP);
    await m.selectOption("#mtSel", "fx"); await m.selectOption("#fxt0", "comp"); await m.selectOption("#fxt1", "eq"); await m.waitForTimeout(100);
    await m.fill("#verName", "Phone mix"); await m.click("#verSave"); await m.waitForTimeout(150);
    await m.evaluate(() => { __aogStudio.SONG.tracks[0].name = "Lead"; __aogStudio.SONG.tracks[0].col = "ice"; __aogStudio.songChanged(); document.getElementById("moreBox").scrollIntoView({ block: "start" }); }); await m.waitForTimeout(150);
    const f = await m.evaluate(() => { const r = el => el.getBoundingClientRect(), btn = [...document.querySelectorAll("#moreBox button, #verBlk button, #master select")].filter(x => x.offsetParent);
      return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, minH: Math.min(...btn.map(x => Math.round(r(x).height))), right: Math.max(...btn.map(x => Math.round(r(x).right))),
        fs: Math.min(...[...document.querySelectorAll("#moreBox select, #verBlk input, #verBlk select, #etSel")].filter(x => x.offsetParent).map(x => parseFloat(getComputedStyle(x).fontSize))) }; });
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    ok(f.sw <= f.iw && f.minH >= 44 && f.right <= f.iw && f.fs >= 16 && !pc.length && !pk.length, `${dev}, ${theme}, two effects open, a version saved: it fits (${JSON.stringify(f)}), reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await m.screenshot({ path: path.join(__dirname, "..", `studiomore-${dev.split(" ")[0].toLowerCase()}-${theme}.png`) });
    await cx.close();
  }
  /* 13 · inside the Recording Studio (where the desk is used) */
  for (const [dev, theme] of [["iPad (gen 7) landscape", "light"], ["iPhone 13", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U + "the-studio#studio");
    await m.waitForFunction(() => { const d = document.getElementById("room").contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && /studio/.test(d.location.pathname); }, null, { timeout: 20000 });
    await m.waitForTimeout(1200);
    const f = m.frames().find(x => x.parentFrame() === m.mainFrame());
    await f.evaluate(`(${TAKE})(${JSON.stringify({ n: 1, f: [330], bars: 4 })})`);
    await f.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
    await f.click("#putBtn"); await f.waitForFunction(() => __aogStudio.SONG.tracks[0].clip && !__aogStudio.S.busy, null, { timeout: 15000 });
    await f.selectOption("#mtSel", "fx"); await f.selectOption("#fxt0", "dess");
    await f.evaluate(() => document.getElementById("moreBox").scrollIntoView({ block: "center" })); await m.waitForTimeout(300);
    const fc = await f.evaluate(`(${PROBE})()`), fk = await f.evaluate(`(${CALM})()`), sw = await f.evaluate(() => document.scrollingElement.scrollWidth - innerWidth);
    ok(!fc.length && !fk.length && sw <= 1, `inside the Recording Studio, ${dev}, ${theme}, a De-esser open: readable (${fc.length} ${JSON.stringify(fc.slice(0, 2))}), calm (${fk.join("; ") || "ok"}), nothing sideways (${sw})`);
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the iPhone, the iPad or in the Studio " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); srv2.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
