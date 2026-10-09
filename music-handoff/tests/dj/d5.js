/* The turntables on a slow iPad: Chromium's CPU slowed four times (CDP Emulation.setCPUThrottlingRate), an iPad
   screen, the Full bench (the busiest screen: three platters, six waveforms, the EQ curve), three records playing
   in sync with effects on. Measured for 10 s with the decks in view, then 6 s with the mixer and its live EQ curve in
   view: how often the screen redraws, the longest stall, long tasks, and whether the audio clock keeps pace with
   the wall clock while the decks stay locked. */
const { pw, ok, done, open, load, snap, realBpm } = require("./lib.js");
const srv = require("../srv.js")(9934);
(async () => {
  const { b, c, p, errs } = await open(9934, { device: pw.devices["iPad (gen 7)"], bench: "full" });
  await load(p, { A: "house", B: "disco", C: "techno" });
  await p.click('[data-play="A"]'); await p.waitForTimeout(500);
  await p.click('[data-sync="B"]'); await p.click('[data-play="B"]');
  await p.click('[data-pair="AC"]');   /* AOG-DJ-DESK-V1: C comes onto the desk; B keeps playing off it */
  await p.click('[data-sync="C"]'); await p.click('[data-play="C"]');
  await p.evaluate(() => { const set = (sel, v, ev) => { const i = document.querySelector(sel); i.value = v; i.dispatchEvent(new Event(ev || "input")); };
    document.querySelector('[data-fxtype="B"][data-v="reverb"]').click(); set('[data-fxamt="B"]', "0.5"); set('[data-fxamt="A"]', "0.4");
    document.querySelector('[data-fxtype="C"][data-v="flanger"]').click(); set('[data-fxamt="C"]', "0.6"); set('[data-filter="C"]', "-0.3"); });
  await p.waitForTimeout(1500);
  const cdp = await c.newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await p.waitForTimeout(1500);
  const s1 = await Promise.all(["A", "B", "C"].map(id => snap(p, id)));
  const measure = (ms) => p.evaluate((ms) => new Promise(res => {
    const t = [], longs = []; let po = null;
    try { po = new PerformanceObserver(l => l.getEntries().forEach(e => longs.push(e.duration))); po.observe({ type: "longtask", buffered: false }); } catch (e) {}
    const a0 = actx.currentTime, w0 = performance.now();
    const f = now => { t.push(now); if (now - w0 < ms) requestAnimationFrame(f); else {
      if (po) po.disconnect();
      const iv = t.slice(1).map((x, i) => x - t[i]).sort((x, y) => x - y);
      res({ frames: t.length, fps: (t.length - 1) / ((t[t.length - 1] - t[0]) / 1000), p95: iv[Math.floor(iv.length * 0.95)], worst: iv[iv.length - 1],
            longs: longs.length, longMax: longs.length ? Math.max(...longs) : 0, audio: (actx.currentTime - a0) / ((performance.now() - w0) / 1000), playing: decks.filter(d => d.motor).length }); } };
    requestAnimationFrame(f);
  }), ms);
  const smooth = (m) => m.playing === 3 && m.fps >= 45 && m.p95 <= 34 && m.worst <= 120;
  const said = (m) => `${m.fps.toFixed(1)} frames a second over ${m.frames} frames; 95% of frames within ${m.p95.toFixed(1)} ms, the slowest ${m.worst.toFixed(1)} ms; ${m.longs} long tasks (longest ${m.longMax.toFixed(0)} ms); audio clock ${(m.audio * 100).toFixed(1)}% of real time`;
  /* 1. the decks in view: three platters, six waveforms */
  const m = await measure(10000);
  console.log(`     CPU ×4, iPad screen, Full bench, three decks with effects, the decks in view: ${said(m)}`);
  /* 2. the mixer in view: three channel strips with their meters, and the live EQ curve */
  await p.evaluate(() => document.getElementById("eqCurve").scrollIntoView({ block: "center" }));
  await p.waitForTimeout(600);
  const shown = await p.evaluate(() => { const r = document.getElementById("eqCurve").getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; });
  const m2 = await measure(6000);
  console.log(`     … the mixer and its live EQ curve in view: ${said(m2)}`);
  const s2 = await Promise.all(["A", "B", "C"].map(id => snap(p, id)));
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  const bpm = s1.map((x, i) => realBpm(x, s2[i]));
  ok(smooth(m), `the screen keeps moving smoothly with the CPU four times slower, decks in view: ${m.fps.toFixed(1)} fps, 95th percentile frame ${m.p95.toFixed(1)} ms, slowest ${m.worst.toFixed(1)} ms`);
  ok(shown && smooth(m2), `… and with the mixer and live EQ curve in view: ${m2.fps.toFixed(1)} fps, 95th percentile frame ${m2.p95.toFixed(1)} ms, slowest ${m2.worst.toFixed(1)} ms`);
  ok(m.audio > 0.98 && m2.audio > 0.98 && bpm.every(x => Math.abs(x - 125) < 0.1), `the audio keeps pace (${(m.audio * 100).toFixed(1)}% / ${(m2.audio * 100).toFixed(1)}% of real time) and the three decks stay locked meanwhile: ${bpm.map(x => x.toFixed(3)).join(" / ")} BPM`);
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await b.close(); srv.close(); process.exit(done() ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
