/* AOG-DESK-WARP-V1 (slice 2 of the DAW build) — Follow the song's tempo:
   · a take played at 100 beats a minute with a click on every beat, set to follow the tempo: the song at 120 and at 80,
     every click is within 10 ms of its beat (the bounce), and the take spans exactly its 4 bars; without it they drift;
   · its pitch is kept (440 Hz stays 440 Hz); the stretch is made in a Worker (the same bits as the desk's own WSOLA), and
     the page stays easy to use while a minute-long take is made (a 10 ms timer is never held back 100 ms);
   · Off again: its own speed, the same bits as before it was ever on; Undo; a reload and a song file keep it;
   · a take with notes (the Piano) is played again by its room at the new tempo: its notes start within 10 ms of the beats;
   · Spanish; an iPhone and an iPad, light and dark. Port 9341. */
const T = require("./lib.js"), { ok, near, add, put, HELP } = T;
const PORT = 9341, U = "http://localhost:" + PORT + "/", srv = T.srv(PORT);
const tempo = (p, bpm) => p.evaluate(b => { AOGSong.set({ bpm: b }); }, bpm);
const settle = p => p.waitForFunction(() => { const st = __aogStudio; return st.SONG.tracks.every(x => !x.clip || !st.needStretch(x.clip) || st.stretchReady(x.clip)) && !st.S.stretching; }, null, { timeout: 60000 });
/* the clicks in a bounce: the first sample over half the loudest, then 0.2 s of quiet before the next */
const ONSETS = `(name, from, to) => { const d = __T.B[name].L, sr = 44100; let m = 0; for (let i = 0; i < d.length; i++) m = Math.max(m, Math.abs(d[i]));
  const o = []; let last = -1e9; for (let i = Math.round(from * sr); i < Math.min(d.length, Math.round(to * sr)); i++) if (Math.abs(d[i]) > m * 0.35 && i - last > 0.2 * sr) { o.push(i / sr); last = i; } return o; }`;

(async () => {
  const b = await T.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); T.watch(c); await T.routes(c);
  const p = await c.newPage();
  await p.goto(U + "music-studio.html"); await p.waitForTimeout(600); await T.ready(p);
  await add(p, { n: 1, kind: "click", clicks: Array.from({ length: 15 }, (_, k) => (k + 1) * 0.6), bars: 4 });
  await add(p, { n: 2, f: [440], bars: 4, amp: 9000 });
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 2, null, { timeout: 8000 });
  await put(p, 1, 0); await put(p, 2, 1);
  await p.evaluate(HELP);
  await p.evaluate(() => { const x = __aogStudio.SONG.tracks; x[1].mute = true; __aogStudio.SONG.master.glue = 0; __aogStudio.songChanged(); });
  await p.evaluate(`window.__ON = ${ONSETS}`);
  ok(await p.evaluate(() => __aogStudio.songBpm()) === 100, "the song is at 100, as the take");
  await p.evaluate(() => __T.render("t100")); const h100 = await p.evaluate(() => __T.hash("t100"));

  /* 1 · the button */
  await p.selectOption("#trackSel", "0"); await p.waitForTimeout(80);
  const btn = await p.evaluate(() => { const b = document.querySelector('#clipBox [data-act="warp"]'); return b ? [b.textContent, b.getAttribute("aria-pressed")] : null; });
  const u0 = await p.evaluate(() => __aogStudio.UNDO.length);
  await p.click('#clipBox [data-act="warp"]'); await p.waitForTimeout(80);
  const on = await p.evaluate(() => ({ w: __aogStudio.SONG.tracks[0].clip.warp, p: document.querySelector('#clipBox [data-act="warp"]').getAttribute("aria-pressed"), spd: !!document.getElementById("spdR"), line: [...document.querySelectorAll("#clipBox .st-line")].map(e => e.textContent).find(t => /follows the song/.test(t)) || "" }));
  ok(btn && btn[0] === "Follow the song's tempo" && btn[1] === "false" && on.w === true && on.p === "true" && !on.spd && on.line === "Played at 100 beats a minute, it follows the song: now 100. It stays on the bars.", "Follow the song's tempo: the button, pressed; the speed slider gives way to one line: " + JSON.stringify(on));
  await p.evaluate(() => __T.render("w100")); const hw100 = await p.evaluate(() => __T.hash("w100"));
  ok(hw100 === h100, "at the take's own tempo, following it changes nothing (the same bits)");

  /* 2 · the song at 120 and at 80 */
  for (const bpm of [120, 80]) {
    const used0 = await p.evaluate(() => __aogStudio.WW.used);
    await tempo(p, bpm); await settle(p);
    await p.evaluate(n => __T.render(n), "w" + bpm);
    const r = await p.evaluate(([n, bpm]) => { const o = __ON(n, 0, 60 / bpm * 16 - 0.05), st = __aogStudio, cl = st.SONG.tracks[0].clip; return { o, err: Math.max(...o.map((t, k) => Math.abs(t - (k + 1) * 60 / bpm))), end: st.clipEnd(cl, false), bars: 4 * 240 / bpm, used: st.WW.used }; }, ["w" + bpm, bpm]);
    ok(r.o.length === 15 && r.err <= 0.010 && near(r.end, r.bars, 0.001) && r.used > used0, `the song at ${bpm}: all 15 clicks land within ${(r.err * 1000).toFixed(1)} ms of their beats (at most 10), the take spans its 4 bars (${r.end.toFixed(4)} s of ${r.bars.toFixed(4)}), made in the Worker `);
  }
  /* without it, at 120, the clicks drift off the beats */
  await p.click('#clipBox [data-act="warp"]'); await tempo(p, 120); await settle(p);
  await p.evaluate(() => __T.render("n120"));
  const drift = await p.evaluate(() => { const o = __ON("n120", 0, 9.7); return Math.max(...o.map((t, k) => Math.abs(t - (k + 1) * 0.5))); });
  ok(drift > 0.5, `without Follow the tempo, at 120 the last click is ${drift.toFixed(2)} s off its beat`);
  await tempo(p, 100); await settle(p); await p.evaluate(() => __T.render("back")); const hb = await p.evaluate(() => __T.hash("back"));
  ok(hb === h100, "Off again, at 100: the very same bits as before it was ever on");
  await p.click("#tlUndo"); await p.waitForTimeout(80);
  const un = await p.evaluate(() => !!__aogStudio.SONG.tracks[0].clip.warp); await p.click("#tlRedo"); await p.waitForTimeout(80);
  const re = await p.evaluate(() => !!__aogStudio.SONG.tracks[0].clip.warp);
  ok(un === true && re === false, "Undo turns it back on, Redo off");
  await p.click('#clipBox [data-act="warp"]');

  /* 3 · the pitch is kept; the Worker's copy is the desk's own WSOLA, to the bit */
  await p.evaluate(() => { const x = __aogStudio.SONG.tracks; x[0].mute = true; x[1].mute = false; x[1].clip.warp = true; __aogStudio.songChanged(); });
  await tempo(p, 120); await settle(p); await p.evaluate(() => __T.render("p120"));
  const hz = await p.evaluate(() => [__T.hz("p120", 1.0, 1.5), __aogStudio.clipEnd(__aogStudio.SONG.tracks[1].clip, false)]);
  ok(near(hz[0], 440, 1) && near(hz[1], 8, 0.001), `its pitch is kept at the new tempo: ${hz[0].toFixed(2)} Hz, and its 4 bars last ${hz[1].toFixed(4)} s`);
  const same = await p.evaluate(async () => { const st = __aogStudio, b0 = st.BUF.get(st.SONG.tracks[1].clip.id), a = await st.warpWork(b0, 1.2, 0.012), z = await st.wsola(b0, 1.2, () => false, 0.012);
    let m = 0; for (let ch = 0; ch < 2; ch++) { const x = a.getChannelData(ch), y = z.getChannelData(ch); if (x.length !== y.length) return -1; for (let i = 0; i < x.length; i++) m = Math.max(m, Math.abs(x[i] - y[i])); } return m; });
  ok(same === 0, "the Worker makes exactly the desk's own WSOLA (the most any sample differs: " + same + ")");
  /* a minute-long take: the page keeps answering while it is made */
  await add(p, { n: 3, f: [220, 330], bars: 25 }); await p.waitForFunction(() => __aogStudio.INBOX.items.length === 3, null, { timeout: 8000 }); await put(p, 3, 2);
  const busyOf = bpm => p.evaluate(async bpm => { const st = __aogStudio, cl = st.SONG.tracks[2].clip; cl.warp = true; st.songChanged(); AOGSong.set({ bpm: bpm }); await new Promise(r => setTimeout(r, 250));
    let worst = 0, busy = 0, last = performance.now(); const k = setInterval(() => { const n = performance.now(), late = Math.max(0, n - last - 10); worst = Math.max(worst, late); busy += late; last = n; }, 10);
    const t0 = performance.now(); await st.stretchAll(); const took = performance.now() - t0; clearInterval(k); return { worst: Math.round(worst), busy: Math.round(busy), took: Math.round(took), ready: st.stretchReady(cl) }; }, bpm);
  await p.evaluate(() => { window.__inl = 0; const w0 = window.wsola; window.wsola = function () { window.__inl++; return w0.apply(this, arguments); }; });
  const wk = await busyOf(132), inl = await p.evaluate(() => window.__inl);
  ok(wk.ready && inl === 0, `a minute-long take is made in the Worker in ${wk.took} ms; the page's own WSOLA ran ${inl} times (a 10 ms timer was held back at most ${wk.worst} ms, by the page drawing itself again)`);
  await tempo(p, 100); await settle(p);

  /* 4 · kept: a reload and a song file */
  const want = await p.evaluate(() => __aogStudio.SONG.tracks.map(x => x.clip ? !!x.clip.warp : null).join());
  await p.reload(); await T.ready(p);
  const got = await p.evaluate(() => __aogStudio.SONG.tracks.map(x => x.clip ? !!x.clip.warp : null).join());
  const file = await p.evaluate(async () => { const r = await __aogStudio.readSongFile(await __aogStudio.songFile()); return r.song.tracks.map(x => x.clip ? !!x.clip.warp : null).join(); });
  ok(want === got && got === file && /true/.test(got), "a reload and a song file keep it: " + got);

  /* 5 · a take with notes follows by being played again by its room */
  const nt = await p.evaluate(async () => {
    const ev = Array.from({ length: 8 }, (_, k) => ({ t: 0.05 + k * 0.6, m: 60 + (k % 4) * 2, v: 0.8, d: 0.3 }));
    /* the take's sound is the piano's own: its notes played by the piano, as a take recorded there would be */
    const r = await AOGPianoRoll.renderHere("piano", { sound: "", was: "", events: ev, sec: 6, tail: 0, set: {}, space: 0, sr: 44100 });
    const sr = r.sr || 44100, L = r.L, R = r.R || r.L, n = L.length; const flux = (L, sr, upto) => { const F = 128, nF = Math.floor(Math.min(L.length, upto * sr) / F), E = new Float64Array(nF); let mx = 0;
      for (let f = 0; f < nF; f++) { let e = 0; for (let i = f * F; i < f * F + F; i++) e += L[i] * L[i]; E[f] = e; mx = Math.max(mx, e); }
      const o = []; let last = -1e9; for (let f = 1; f < nF; f++) { let m = 0; const j0 = Math.max(0, f - 8); for (let j = j0; j < f; j++) m += E[j]; m /= f - j0; if (E[f] > 4 * m + 1e-12 && E[f] > 0.01 * mx && (f - last) * F / sr > 0.25) { o.push(f * F / sr); last = f; } } return o; };
    window.__flux = flux; const on = flux(L, sr, 6);
    const ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab), s = (q, t) => { for (let i = 0; i < t.length; i++) v.setUint8(q + i, t.charCodeAt(i)); };
    s(0, "RIFF"); v.setUint32(4, 36 + n * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, n * 4, true);
    for (let i = 0; i < n; i++) { v.setInt16(44 + i * 4, Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767))), true); v.setInt16(46 + i * 4, Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))), true); }
    await AOGHandoff.add(AOGHandoff.INBOX, { from: "piano", n: 9, name: { en: "Take 9", es: "Toma 9" }, sec: n / sr, bpm: 100, bars: 2, at: Date.now() + 9, take: true, notes: { v: 1, room: "piano", sound: "", set: {}, space: 0, sr: 44100, lag: Math.round((on[0] - 0.05) * 1e4) / 1e4, ev: ev, ped: [] }, wav: new Blob([ab], { type: "audio/wav" }) }, { key: "warp|9" });
    return on; });
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 4, null, { timeout: 8000 });
  await put(p, 9, 3, "piano");
  await p.evaluate(HELP);
  await p.evaluate(() => { const st = __aogStudio, x = st.SONG.tracks; x.forEach((y, i) => { y.mute = i !== 3; }); x[3].clip.warp = true; st.songChanged(); AOGSong.set({ bpm: 120 }); });
  await p.waitForFunction(() => { const st = __aogStudio, cl = st.SONG.tracks[3].clip; return st.stretchReady(cl) && !st.S.stretching; }, null, { timeout: 90000 });
  await p.evaluate(() => __T.render("n"));
  const nr = await p.evaluate(on => { const st = __aogStudio, cl = st.SONG.tracks[3].clip, o = __flux(__T.B.n.L, 44100, 4.2);
    const want = on.map(t => (t - cl.head) / 1.2); return { n: st.WARPN.get(cl.id) || 0, o, want, err: Math.max(...o.map((t, k) => Math.abs(t - want[k]))), beat: Math.max(...o.map((t, k) => Math.abs(t - k * 0.5))) }; }, nt);
  ok(nr.n >= 1 && nr.o.length === 8 && nr.err <= 0.010 && nr.beat <= 0.030, `a Piano take with notes is played again by the piano at 120 (${nr.n} time): its 8 notes sound within ${(nr.err * 1000).toFixed(1)} ms of where the take's notes fall at the new tempo, ${(nr.beat * 1000).toFixed(1)} ms from the beats (the piano's own attack)`);
  await tempo(p, 100);

  /* 6 · Spanish */
  await p.selectOption("#trackSel", "0"); await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(100);
  const es = await p.evaluate(() => ({ b: document.querySelector('#clipBox [data-act="warp"]').textContent, l: [...document.querySelectorAll("#clipBox .st-line")].map(e => e.textContent).find(t => /sigue a la canción/.test(t)) || "" }));
  ok(es.b === "Seguir el tempo de la canción" && es.l === "Tocada a 100 pulsos por minuto, sigue a la canción: ahora 100. Se queda en los compases.", "in Spanish: " + JSON.stringify(es));
  await c.close();

  /* 7 · an iPhone and an iPad */
  await T.looks(b, U, async m => { await add(m, { n: 1, f: [330], bars: 2 }); await m.waitForFunction(() => __aogStudio.INBOX.items.length === 1); await put(m, 1, 0);
    await m.waitForTimeout(200); await m.evaluate(() => document.querySelector('#clipBox [data-act="warp"]').click()); await m.waitForTimeout(100); await m.evaluate(() => document.querySelector('#clipBox [data-act="warp"]').scrollIntoView({ block: "center" })); }, "#clipBox button, #clipBox select", "Follow the tempo");
  await T.done(b, srv);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
