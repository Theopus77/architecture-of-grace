/* AOG-DESK-SPEED-V1, AOG-DESK-KEYS-V2 (slice 8 of the DAW build) — speed and keys, with a five-minute song: eight tracks
   of 40 pieces each played three times (960 sounds) and eight more takes:
   · a bounce lays its sounds a stretch at a time as it renders, and is the same mix as laying them all at once (no sample
     more than 0.000001 apart, −120 dB); the speakers lay a few seconds ahead (a few dozen sounds at play, not 960), and a loop across the stretches
     plays without a gap;
   · while it plays, nothing asks the page for a size or a media query on every frame; a repaint draws the waves from the
     cached peaks (no recording is read again);
   · the loudness, true peak and .wav of the whole song are worked out in a Worker: the same numbers and bytes, and the
     page is held up far less than when it worked them out itself;
   · the keys: Space, L, R, ← → (Shift), Ctrl+D, Ctrl+E, and the Keys list in English and Spanish; Ctrl+D reaches the desk
     inside the Recording Studio too. Port 9347. */
const T = require("./lib.js"), { ok, near, add, put, HELP } = T;
const fs = require("fs"), os = require("os"), path = require("path");
const PORT = 9347, U = "http://localhost:" + PORT + "/", srv = T.srv(PORT);
const MIC = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "deskspeed-")), "tone.wav");
(() => { const sr = 48000, n = sr * 20, b = Buffer.alloc(44 + n * 2); b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(6000 * Math.sin(2 * Math.PI * 330 * i / sr)), 44 + i * 2); fs.writeFileSync(MIC, b); })();
const BIG = async p => {
  for (let n = 1; n <= 16; n++) await add(p, { n, f: [110 * (1 + n % 5)], bars: 12, amp: 2500 });
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 16, null, { timeout: 60000 });
  for (let n = 1; n <= 8; n++) await put(p, n, n - 1);
  await p.evaluate(() => { const st = __aogStudio; st.SONG.master.glue = 0;
    st.SONG.tracks.forEach(x => { if (!x.clip) return; const P = []; for (let k = 0; k < 40; k++) P.push({ a: (k % 12) * 4, b: (k % 12) * 4 + 4, at: k * 12, n: 3 }); x.clip.pieces = P; }); st.songChanged(); });
  for (let n = 9; n <= 16; n++) { await p.evaluate(n => { const v = [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === "Guitar take " + n); window.__src = v && v.value; }, n);
    const i = n - 9; await p.evaluate(i => dmAddTake(window.__src, i), i);
    await p.waitForFunction(i => (__aogStudio.SONG.tracks[i].takes || []).length === 1 && !__aogStudio.S.busy, i, { timeout: 30000 }); }
  await p.evaluate(() => { const st = __aogStudio; st.SONG.tracks.forEach(x => { x.clip.pieces = x.takes[0].pieces = null; }); st.SONG.tracks.forEach(x => { [x.clip, x.takes[0]].forEach(c => { const P = []; for (let k = 0; k < 40; k++) P.push({ a: (k % 12) * 4, b: (k % 12) * 4 + 4, at: k * 12, n: 3 }); c.pieces = P; }); x.comp = [[0, 240, x.takes[0].id]]; }); st.songChanged(); });
  await T.ready(p);
};

(async () => {
  const b = await T.launch(["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--use-file-for-fake-audio-capture=" + MIC]);
  const c = await b.newContext({ viewport: { width: 1366, height: 900 } }); T.watch(c); await T.routes(c);
  const p = await c.newPage(); await p.goto(U + "music-studio.html"); await T.ready(p);
  await BIG(p); await p.evaluate(HELP);
  const size = await p.evaluate(() => { const st = __aogStudio; let n = 0; st.SONG.tracks.forEach(x => [x.clip].concat(x.takes || []).forEach(c => st.pcs(c).forEach(q => { n += q.n; }))); return { end: st.songEnd(), plays: n, recs: st.SONG.tracks.reduce((a, x) => a + 1 + (x.takes || []).length, 0) }; });
  ok(size.end > 285 && size.plays === 1920 && size.recs === 16, `the song: ${(size.end / 60).toFixed(1)} minutes, 16 recordings, ${size.plays} plays of a piece`);

  /* 1 · a bounce, a stretch at a time = all at once, to the bit */
  await p.evaluate(() => { window.__deskWholePlan = true; }); await p.evaluate(() => __T.render("whole")); const hw = await p.evaluate(() => __T.hash("whole"));
  await p.evaluate(() => { window.__deskWholePlan = false; }); await p.evaluate(() => __T.render("part")); const hp = await p.evaluate(() => __T.hash("part"));
  const dd = await p.evaluate(() => __T.diff("whole", "part"));
  ok(dd < 1e-6, `a bounce laid a stretch at a time is the same mix as all at once (${hw === hp ? "to the bit" : "no sample differs by more than " + dd.toExponential(1) + ", under −120 dB: the order sounds are added up in"})`);

  /* 2 · the speakers: a few seconds ahead; no size or media query asked on every frame */
  const live = await p.evaluate(async () => { const st = __aogStudio, E = st.makeEngine(new OfflineAudioContext(2, 128, 44100), false), all = st.schedule(E, 0, st.songEnd(), 0).length;
    let rect = 0, mm = 0, ch = 0; const R = Element.prototype.getBoundingClientRect, M = window.matchMedia, C = AudioBuffer.prototype.getChannelData;
    Element.prototype.getBoundingClientRect = function () { rect++; return R.apply(this, arguments); }; window.matchMedia = function () { mm++; return M.apply(this, arguments); };
    st.play(); const n0 = st.PLAY.srcs.length; await new Promise(r => setTimeout(r, 300)); rect = 0; mm = 0;
    const frames = await new Promise(r => { let k = 0; const f = () => { if (++k < 90) requestAnimationFrame(f); else r(k); }; requestAnimationFrame(f); });
    const got = { rect, mm };
    st.stop(); Element.prototype.getBoundingClientRect = R; window.matchMedia = M;
    AudioBuffer.prototype.getChannelData = function () { ch++; return C.apply(this, arguments); }; paintTimeline(); paintTrack(); AudioBuffer.prototype.getChannelData = C;
    return { all, n0, frames, rect: got.rect, mm: got.mm, ch }; });
  ok(live.all >= 900 && live.n0 > 0 && live.n0 < 80 && live.rect <= 2 && live.mm === 0 && live.ch === 0,
    `the speakers lay ${live.n0} sounds when Play is pressed, of ${live.all}; over ${live.frames} frames the page was asked for a size ${live.rect} times and a media query ${live.mm} times; a repaint read no recording again (${live.ch})`);
  /* a loop of bars 2 to 3 for 7 s, across the stretches: no gap */
  await p.evaluate(() => { const st = __aogStudio; st.SONG.tracks.forEach((x, i) => { x.mute = i !== 0; delete x.comp; }); st.SONG.loopOn = true; st.SONG.loopFrom = 2; st.SONG.loopTo = 3; st.songChanged(); });
  await p.evaluate(() => __T.recOn()); await p.evaluate(() => __aogStudio.play()); const t0 = await p.evaluate(() => __aogStudio.AC.currentTime);
  await p.waitForTimeout(7200); await p.evaluate(() => __aogStudio.stop()); await p.waitForTimeout(150); await p.evaluate(() => __T.recOff());
  const gap = await p.evaluate(t0 => { const r = __T.live, sr = __T.lsr, o = []; for (let s = t0 + 0.3; s < t0 + 6.8; s += 0.05) { const a = Math.round(s * sr - r.f0); let e = 0; for (let i = a; i < a + sr * 0.05; i++) e += r.L[i] * r.L[i]; o.push(10 * Math.log10(e / (sr * 0.05) + 1e-12)); } return { min: Math.min(...o), max: Math.max(...o) }; }, t0);
  ok(gap.min > gap.max - 6, `a loop of bars 2 to 3 played 7 s across the stretches: never a gap (every 50 ms between ${gap.min.toFixed(1)} and ${gap.max.toFixed(1)} dB)`);
  await p.evaluate(() => { const st = __aogStudio; st.SONG.tracks.forEach(x => { x.mute = false; }); st.SONG.loopOn = false; st.songChanged(); });

  /* 3 · the loudness and the .wav in a Worker */
  const wk = await p.evaluate(async () => { const st = __aogStudio, B = __T.B.part, L = B.L, R = B.R;
    let worst = 0, last = performance.now(); const k = setInterval(() => { const n = performance.now(); worst = Math.max(worst, n - last - 10); last = n; }, 10);
    const u0 = st.DW.used, a = await st.loudOfW(L, R, 44100), w = new Uint8Array(await st.wavBufW(L, R, 44100, 0.8, 16)); clearInterval(k); const wWorst = worst, used = st.DW.used - u0;
    const t1 = performance.now(), b = st.loudOf(L, R, 44100), w2 = new Uint8Array(st.wavBuf(L, R, 44100, 0.8, 16)), inline = performance.now() - t1;
    let same = w.length === w2.length; for (let i = 0; same && i < w.length; i++) if (w[i] !== w2[i]) same = false;
    return { used, wWorst: Math.round(wWorst), inline: Math.round(inline), lufs: [a.lufs, b.lufs], tp: [a.tp, b.tp], same }; });
  ok(wk.used === 2 && wk.lufs[0] === wk.lufs[1] && wk.tp[0] === wk.tp[1] && wk.same && wk.wWorst * 3 < wk.inline,
    `the song's loudness (${wk.lufs[0].toFixed(2)} LUFS), true peak and .wav come from the Worker, the same to the bit; the page was held up at most ${wk.wWorst} ms, where working them out itself holds it ${wk.inline} ms`);
  await c.close();

  /* 4 · the keys */
  const k = await b.newContext({ viewport: { width: 1366, height: 900 } }); T.watch(k); await T.routes(k);
  const q = await k.newPage(); await q.goto(U + "music-studio.html"); await T.ready(q);
  await add(q, { n: 1, f: [330], bars: 4 }); await q.waitForFunction(() => __aogStudio.INBOX.items.length === 1); await put(q, 1, 0);
  await q.mouse.click(1300, 120); await q.evaluate(() => document.activeElement && document.activeElement.blur());
  const P = () => q.evaluate(() => JSON.stringify(__aogStudio.pcs(__aogStudio.SONG.tracks[0].clip).map(p => [+p.at.toFixed(4), p.n])));
  await q.keyboard.press("KeyL"); const l1 = await q.evaluate(() => __aogStudio.SONG.loopOn); await q.keyboard.press("KeyL"); const l2 = await q.evaluate(() => __aogStudio.SONG.loopOn);
  await q.keyboard.press("ArrowRight"); const n1 = await P(); await q.keyboard.press("Shift+ArrowRight"); const n2 = await P(); await q.keyboard.press("ArrowLeft"); await q.keyboard.press("Shift+ArrowLeft"); const n3 = await P();
  await q.keyboard.press("Control+KeyD"); const d1 = await P();
  await q.evaluate(() => { const s = document.getElementById("startSel"); s.value = "2"; s.dispatchEvent(new Event("change", { bubbles: true })); }); await q.mouse.click(1300, 120);
  await q.keyboard.press("Control+KeyE"); const e1 = await P();
  ok(l1 === true && l2 === false && n1 === "[[0.0167,1]]" && n2 === "[[1.0167,1]]" && n3 === "[[0,1]]" && d1 === "[[0,1],[16,1]]" && e1 === "[[0,1],[4,1],[16,1]]",
    `L turns the loop on and off; → nudges 10 ms (${n1}), Shift+→ a beat (${n2}), back again (${n3}); Ctrl+D copies the piece after itself (${d1}); Ctrl+E cuts it at bar 2 (${e1})`);
  await q.keyboard.press("Space"); await q.waitForTimeout(300); const sp = await q.evaluate(() => __aogStudio.PLAY.on); await q.keyboard.press("Space"); const sp2 = await q.evaluate(() => __aogStudio.PLAY.on);
  await q.keyboard.press("KeyR"); await q.waitForFunction(() => __aogStudio.VOICE.rec, null, { timeout: 10000 }); await q.waitForTimeout(1200); await q.keyboard.press("KeyR");
  await q.waitForFunction(() => !__aogStudio.VOICE.rec && !__aogStudio.VOICE.busy, null, { timeout: 15000 });
  const rv = await q.evaluate(() => ({ sel: __aogStudio.SONG.sel, v: !!(__aogStudio.SONG.tracks[7].clip && __aogStudio.SONG.tracks[7].clip.voice) }));
  ok(sp && !sp2 && rv.sel === 7 && rv.v, "Space plays and stops; R records your voice on track 8, and R again stops: " + JSON.stringify(rv));
  await q.evaluate(() => { const d = document.getElementById("keysBox"); d.open = true; });
  const kl = await q.evaluate(() => ({ s: document.querySelector("#keysBox summary").textContent, n: document.querySelectorAll("#keysList li").length, shown: getComputedStyle(document.getElementById("keysBox")).display !== "none", first: document.querySelector("#keysList li").textContent }));
  await q.evaluate(() => document.getElementById("langBtn").click()); await q.waitForTimeout(100);
  const ks = await q.evaluate(() => ({ s: document.querySelector("#keysBox summary").textContent, d: [...document.querySelectorAll("#keysList li")].find(l => /D$|D[^a-z]/.test(l.querySelector("kbd").textContent)).textContent }));
  const pc = await q.evaluate(`(${T.PROBE})()`);
  ok(kl.s === "Keys" && kl.n === 11 && kl.shown && kl.first === "SpacePlay and stop" && ks.s === "Teclas" && ks.d === "Ctrl/⌘ DCopiar la parte después de sí misma" && !pc.length, `the Keys list on a computer: ${kl.n} keys ("${kl.first}"), in Spanish "${ks.d}", readable (${pc.length})`);
  await k.close();
  /* inside the Recording Studio */
  const sc = await b.newContext({ viewport: { width: 1366, height: 900 } }); T.watch(sc); await T.routes(sc);
  const m = await sc.newPage(); await m.goto(U + "the-studio#studio");
  await m.waitForFunction(() => { const d = document.getElementById("room").contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && /studio/.test(d.location.pathname); }, null, { timeout: 25000 });
  await m.waitForTimeout(1200); const f = m.frames().find(x => x.parentFrame() === m.mainFrame());
  await f.evaluate(`(${T.TAKE})(${JSON.stringify({ n: 1, f: [330], bars: 4 })})`); await f.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
  await f.click("#putBtn"); await f.waitForFunction(() => __aogStudio.SONG.tracks[0].clip && !__aogStudio.S.busy, null, { timeout: 15000 });
  await m.evaluate(() => { document.activeElement && document.activeElement.blur(); document.body.focus(); });
  await m.keyboard.press("Control+KeyD"); await m.waitForTimeout(200);
  const st = await f.evaluate(() => __aogStudio.pcs(__aogStudio.SONG.tracks[0].clip).length);
  ok(st === 2, "inside the Recording Studio, Ctrl+D reaches the desk: the piece is copied after itself");
  await sc.close();
  await T.done(b, srv);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
