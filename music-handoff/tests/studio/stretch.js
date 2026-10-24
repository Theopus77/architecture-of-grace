/* AOG-STRETCH-PRO-V1 on the Mixing Desk (aog-stretch.js, hooks in music-studio.html ensureStretch / stretchOf / cleanClip):
   · an old song: made and saved by the desk as it was (origin/main, music-studio-before.html), with a kick take at 80 %;
     opened on today's desk it bounces to the very same bits (the first WSOLA), and the engine's file is never loaded;
   · its speed changed to 125 %: the clip is marked (sx 2), its copy is made by the new engine in its Worker, every kick of
     the bounce lands within 1 ms of where it belongs and keeps its peak within 1 dB (the first WSOLA's numbers beside it);
   · old and new side by side on the desk's own recording at 0.75×, 0.9×, 1.1×, 1.25× and 1.5×;
   · Undo: back to 80 % and the first WSOLA, to the bit; Redo: the new copy, to the bit; a reload and a song file keep it;
   · a fresh desk with no stretch never loads aog-stretch.js; with the file blocked, the first WSOLA plays and nothing breaks.
   Port 9298. */
const T = require("../desk/lib.js"), { ok, add, put, HELP } = T;
const PORT = 9298, U = "http://localhost:" + PORT + "/", srv = T.srv(PORT);
const slide = (p, v) => p.evaluate(v => { const r = document.getElementById("spdR"); r.value = String(v); r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true })); }, v);
const settleOld = p => p.waitForFunction(() => { const st = __aogStudio; return st.SONG.tracks.every(x => !x.clip || !st.needStretch(x.clip) || st.stretchReady(x.clip)) && !st.S.stretching; }, null, { timeout: 60000 });
const settle = p => p.waitForFunction(() => { const st = __aogStudio; return st.SONG.tracks.every(x => !x.clip || !st.needStretch(x.clip) || (st.stretchReady(x.clip) && st.sxOk(x.clip))) && !st.S.stretching; }, null, { timeout: 60000 });
const readyOld = p => p.waitForFunction(() => window.__aogStudio && !__aogStudio.S.decoding && __aogStudio.SONG.tracks.every(x => !x.clip || __aogStudio.BUF.has(x.clip.id)), null, { timeout: 30000 });
/* in the page: where each kick starts (the first sample over half its peak) and its peak, in a bounce or a buffer */
const KICKS = `window.__K = (L, R, sr, near) => { const o = []; let mx = 0; for (let i = 0; i < L.length; i++) mx = Math.max(mx, Math.abs(L[i]), Math.abs(R[i]));
  const hit = []; for (let i = 1; i < L.length; i++) { const v = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (v > 0.3 * mx && (!hit.length || i - hit[hit.length - 1] > 0.3 * sr)) hit.push(i); }
  return hit.map(h => { let a = Math.max(0, h - Math.round(0.02 * sr)), pk = 0; for (let i = a; i < h + Math.round(0.03 * sr) && i < L.length; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
    for (let i = a; i < L.length; i++) if (Math.max(Math.abs(L[i]), Math.abs(R[i])) >= 0.5 * pk) return { at: i / sr, pk }; return { at: -1, pk }; }); };
  window.__cmp = (ref, got, sp) => { if (got.length !== ref.length) return { n: got.length, err: Infinity, db: Infinity };
    let err = 0, db = 0; for (let k = 0; k < ref.length; k++) { err = Math.max(err, Math.abs((got[k].at - got[0].at) - (ref[k].at - ref[0].at) / sp)); db = Math.max(db, Math.abs(20 * Math.log10(got[k].pk / ref[k].pk))); }
    return { n: got.length, err: err * 1000, db }; };`;

(async () => {
  const b = await T.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); T.watch(c); await T.routes(c, true);
  ok(!!T.oldPage(), "origin/main's desk is here to make the old song");

  /* A · an old song, made by the desk as it was */
  const q = await c.newPage(); await q.goto(U + "music-studio-before.html"); await q.waitForTimeout(600); await readyOld(q);
  await add(q, { n: 1, kind: "kick", bars: 4 }); await add(q, { n: 2, f: [220, 330], bars: 4, amp: 7000 });
  await q.waitForFunction(() => __aogStudio.INBOX.items.length === 2, null, { timeout: 8000 });
  await put(q, 1, 0); await put(q, 2, 1);
  await q.evaluate(HELP); await q.evaluate(KICKS);
  await q.evaluate(() => { const st = __aogStudio; st.SONG.tracks[1].mute = true; st.SONG.master.glue = 0; st.songChanged(); });
  await q.evaluate(() => __T.render("one"));
  await q.selectOption("#trackSel", "0"); await q.waitForTimeout(80); await slide(q, 80); await settleOld(q);
  await q.evaluate(() => __T.render("old80"));
  const A = await q.evaluate(() => ({ h: __T.hash("old80"), h1: __T.hash("one"), sp: __aogStudio.spd(__aogStudio.SONG.tracks[0].clip), k1: __K(__T.B.one.L, __T.B.one.R, 44100), k80: __K(__T.B.old80.L, __T.B.old80.R, 44100) }));
  await q.waitForTimeout(500); await q.close();
  ok(A.sp === 0.8 && A.k1.length >= 6, `the old desk: a kick take at ${Math.round(A.sp * 100)} % (${A.k1.length} kicks), saved`);

  const p = await c.newPage(); await p.goto(U + "music-studio.html"); await p.waitForTimeout(600); await T.ready(p);
  await p.evaluate(HELP); await p.evaluate(KICKS); await settle(p);
  await p.evaluate(() => __T.render("new80"));
  const B = await p.evaluate(() => { const st = __aogStudio, cl = st.SONG.tracks[0].clip, s = st.STRETCH.get(cl.id); return { h: __T.hash("new80"), sx: cl.sx, pro: !!(s && st.SXB.has(s.buf)), loaded: !!window.AOGStretch, tag: !!document.querySelector('script[src="/aog-stretch.js"]') }; });
  ok(B.h === A.h, "the old song on today's desk: the very same bits as the desk it was made on (" + B.h + ")");
  ok(B.sx === undefined && !B.pro && !B.loaded && !B.tag, `it keeps the first WSOLA (no mark, not the new copy) and the new engine is never loaded: ${JSON.stringify(B)}`);

  /* B · its speed changed: the new engine */
  await p.selectOption("#trackSel", "0"); await p.waitForTimeout(80); await slide(p, 125); await settle(p);
  await p.evaluate(() => __T.render("pro125"));
  const C = await p.evaluate(ref => { const st = __aogStudio, cl = st.SONG.tracks[0].clip, s = st.STRETCH.get(cl.id), k = __K(__T.B.pro125.L, __T.B.pro125.R, 44100);
    return { sx: cl.sx, pro: !!(s && st.SXB.has(s.buf)), w: window.AOGStretch ? AOGStretch.stats.worker : 0, here: window.AOGStretch ? AOGStretch.stats.here : -1, h: __T.hash("pro125"), r: __cmp(ref, k, 1.25), saved: JSON.parse(localStorage.getItem("aog.studio.v1")).tracks[0].clip.sx }; }, A.k1);
  ok(C.sx === 2 && C.pro && C.w >= 1 && C.here === 0, `its speed changed to 125 %: marked (sx ${C.sx}), the copy made by the new engine in its Worker (${C.w} time, ${C.here} on the page)`);
  ok(C.saved === 2, "the mark is kept in the saved song");
  ok(C.r.n === A.k1.length && C.r.err <= 1 && C.r.db <= 1, `the bounce at 125 %: all ${C.r.n} kicks within ${C.r.err.toFixed(2)} ms of where they belong (at most 1), peaks within ${C.r.db.toFixed(2)} dB (at most 1)`);

  /* old and new, side by side on the desk's own recording */
  const rows = await p.evaluate(async () => { const st = __aogStudio, b0 = st.BUF.get(st.SONG.tracks[0].clip.id), g = x => [x.getChannelData(0), x.getChannelData(1)];
    const ref = __K(...g(b0), 44100), out = [];
    for (const sp of [0.75, 0.9, 1.1, 1.25, 1.5]) { const o = await st.warpWork(b0, sp, 0.012), n = await st.sxStretch(b0, sp);
      out.push({ sp, old: __cmp(ref, __K(...g(o), 44100), sp), neu: __cmp(ref, __K(...g(n), 44100), sp), len: n.length === Math.round(b0.length / sp) }); }
    return out; });
  rows.forEach(r => ok(r.neu.err <= 1 && r.neu.db <= 1 && r.len, `${r.sp}× on the desk: kicks within ${r.neu.err.toFixed(2)} ms, peaks within ${r.neu.db.toFixed(2)} dB, exact length (the first WSOLA: ${r.old.err.toFixed(1)} ms, ${r.old.db.toFixed(1)} dB)`));

  /* C · Undo and Redo */
  await p.click("#tlUndo"); await p.waitForTimeout(80); await settle(p); await p.evaluate(() => __T.render("undo"));
  const D = await p.evaluate(() => ({ h: __T.hash("undo"), sx: __aogStudio.SONG.tracks[0].clip.sx, sp: __aogStudio.spd(__aogStudio.SONG.tracks[0].clip) }));
  ok(D.sp === 0.8 && D.sx === undefined && D.h === A.h, `Undo: back to 80 % and the first WSOLA, to the bit (${D.h === A.h ? "same" : "differs"})`);
  await p.click("#tlRedo"); await p.waitForTimeout(80); await settle(p); await p.evaluate(() => __T.render("redo"));
  const E = await p.evaluate(() => ({ h: __T.hash("redo"), sx: __aogStudio.SONG.tracks[0].clip.sx }));
  ok(E.sx === 2 && E.h === C.h, "Redo: the new copy again, to the bit");

  /* D · kept: a reload and a song file */
  await p.waitForTimeout(400); await p.reload(); await T.ready(p); await p.evaluate(HELP); await settle(p); await p.evaluate(() => __T.render("re"));
  const F = await p.evaluate(async () => { const st = __aogStudio, r = await st.readSongFile(await st.songFile()); return { h: __T.hash("re"), sx: st.SONG.tracks[0].clip.sx, file: r.song.tracks[0].clip.sx }; });
  ok(F.sx === 2 && F.file === 2 && F.h === C.h, `a reload and a song file keep it (sx ${F.sx}, in the file ${F.file}), the same bits after the reload`);
  await c.close();

  /* E · a fresh desk loads nothing it does not need; F · without the engine, the first WSOLA plays */
  const c2 = await b.newContext({ viewport: { width: 1280, height: 900 } }); T.watch(c2); await T.routes(c2);
  await c2.route(/aog-stretch\.js/, r => r.abort());
  const m = await c2.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(600); await T.ready(m);
  await add(m, { n: 1, kind: "kick", bars: 2 }); await m.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 }); await put(m, 1, 0);
  await m.waitForTimeout(300);
  const G0 = await m.evaluate(() => ({ loaded: !!window.AOGStretch, tag: !!document.querySelector('script[src="/aog-stretch.js"]') }));
  ok(!G0.loaded && !G0.tag, "a desk with a recording at its own speed never loads aog-stretch.js");
  await m.selectOption("#trackSel", "0"); await m.waitForTimeout(80); await slide(m, 125); await settle(m);
  const G = await m.evaluate(async () => { const st = __aogStudio, cl = st.SONG.tracks[0].clip, s = st.STRETCH.get(cl.id), o = await st.warpWork(st.BUF.get(cl.id), 1.25, 0.012);
    let d = 0; for (let k = 0; k < 2; k++) { const x = s.buf.getChannelData(k), y = o.getChannelData(k); if (x.length !== y.length) return { d: -1 }; for (let i = 0; i < x.length; i++) d = Math.max(d, Math.abs(x[i] - y[i])); }
    return { sx: cl.sx, pro: st.SXB.has(s.buf), d }; });
  ok(G.sx === 2 && !G.pro && G.d === 0, `with aog-stretch.js blocked: the first WSOLA plays (the same bits as its Worker: ${G.d}), and nothing breaks`);
  await c2.close();
  await T.done(b, srv);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
