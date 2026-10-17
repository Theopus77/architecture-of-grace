/* AOG-STEADY-ALL-V1 (2026-10-17) — the Band, as play/steady-all.js plays every room: inside the Studio, an iPhone sideways,
   its processor slowed four times, 300 notes by real touches over five of its sounds (its first, the mariachi, a folk
   instrument, a classroom one and a voice; each picked, made ready, then played). Then the rooms the Studio keeps out of
   sight: the Piano opened first, its middle layer in, then the Band played for half a minute. The Piano, out of sight,
   waits: it unpacks none of its soft and loud recordings while another room is being played (it used to unpack all
   sixty, 20–60 ms each on a phone, between the Band's notes). Port 9381. */
const S = require("./steady-all.js");
const { pw, ok, play, serve } = S;
(async () => {
  const srv = serve(9381), b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  try { await play(b, 9381, "band"); } catch (e) { ok(false, "band: " + e.message.split("\n")[0]); }
  /* the Piano out of sight while the Band plays */
  try {
    const c = await b.newContext({ ...pw.devices["iPhone 13 landscape"], serviceWorkers: "block" });
    await c.addInitScript(S.PROBE); await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
    const p = await c.newPage(), cdp = await c.newCDPSession(p); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await p.goto("http://localhost:9381/the-studio#piano");
    let pf = null; for (let i = 0; i < 600 && !pf; i++) { pf = p.frames().find(x => /music-piano/.test(x.url())); if (!pf) await p.waitForTimeout(100); }
    await pf.waitForFunction(() => typeof SETS !== "undefined" && SETS.grand && SETS.grand.ready, null, { timeout: 120000 });
    await p.evaluate(() => { location.hash = "band"; });
    let bf = null; for (let i = 0; i < 600 && !bf; i++) { bf = p.frames().find(x => /music-band/.test(x.url())); if (!bf) await p.waitForTimeout(100); }
    await bf.waitForFunction(() => typeof soundReady === "function" && soundReady(S.sound), null, { timeout: 120000 });
    const fr = await (await bf.frameElement()).boundingBox();
    const keys = await bf.evaluate(() => [...document.querySelectorAll("#kbd .wk")].map(el => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height * 0.8 }; }).filter(k => k.x > 0 && k.x < innerWidth));
    const T = (type, pts) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts });
    const before = await pf.evaluate(() => ({ dec: __P.ev.filter(e => e.k === "decode").length, done: SETS.grand.done }));
    const t0 = Date.now(), n0 = await bf.evaluate("__P.st.length");
    for (let i = 0; i < 100; i++) { const k = keys[(i * 3) % keys.length], at = { x: fr.x + k.x, y: fr.y + k.y, id: 1 };
      await T("touchStart", [at]); await p.waitForTimeout(110); await T("touchEnd", [at]); await p.waitForTimeout(150); }
    const sec = (Date.now() - t0) / 1000, played = (await bf.evaluate("__P.st.length")) - n0;
    const after = await pf.evaluate(() => ({ dec: __P.ev.filter(e => e.k === "decode").length, done: SETS.grand.done, total: SETS.grand.total }));
    ok(played >= 100 && after.dec === before.dec, `the Piano out of sight unpacks nothing while the Band is played (${sec.toFixed(0)} s, ${played} sounds; the Piano unpacked ${after.dec - before.dec}, its layers ${before.done} → ${after.done} of ${after.total})`);
    await c.close();
  } catch (e) { ok(false, "out of sight: " + e.message.split("\n")[0]); }
  console.log(S.fails() ? S.fails() + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(S.fails() ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
