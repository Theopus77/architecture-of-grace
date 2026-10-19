/* AOG-PADS-16BARS-V1 (2026-10-18) — Jimmy: "Can we get 8 bars in the recording studio as an option? Even 16 bars." The Drum
   Machine's loop is 1, 2, 4, 8 or 16 bars (3 and 12 with the 12-bar blues). Everything that uses the loop works at 8 and 16:
     1 · the menu has 8 and 16 bars, in English and Spanish
     2 · taps recorded across 16 bars land in their bars and play back there, the next time round; the scheduler only ever
         looks a moment ahead; the click and Repeat keep time at 16 bars
     3 · Line up taps (quantize) and swing at 16 bars
     4 · chord patterns fill 8 and 16 bars (8 chords over 8 bars, 4 chords four times over 16, the 12-bar blues in 12);
         beats and beats in parts repeat over 16 bars
     5 · a longer loop repeats what you made; Copy bars 1–4 to the rest fills bars 5–16; Clear empties only those bars
     6 · Make the loop into a file: 16 bars at 60 beats a minute is 64 s exactly, with no main-thread task of 50 ms or more
     7 · Send to the Mixing Desk and to the turntables carries bars 8 and 16
     8 · the steps show four bars at a time; ◀ ▶ and the menu (16 bars) or buttons (8 bars) move between them; the view follows
         the bar playing until a step is touched, then stays; every step can be reached by a finger inside the Studio on an
         iPhone upright (390×844) and on its side (844×390) and an iPad
     9 · tap-to-sound within 25 ms at 4× CPU throttle with a 16-bar loop playing (play/steady-all.js's measure, iPhone on
         its side, inside the Studio, the made page)
    10 · left alone with a 16-bar loop kept, the page rests: no timer or frame callback in 3 s
   No page errors. Ports 9410 (pages), 9411 (the made pages). Run: node music-handoff/tests/pads/bars16.js */
process.env.STEADY_NOTES = process.env.STEADY_NOTES || "120";
const STEADY = require("../play/steady-all.js");
const pw = STEADY.pw;
const PORT = 9410, U = "http://localhost:" + PORT + "/"; const srv = require("../srv.js")(PORT);
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
/* the site's own readability and calm probes (tools/check-contrast.js, tools/check-calm.js), as rooms/compact uses them */
const fs = require("fs"), path = require("path"), TOOLS = path.resolve(__dirname, "../../../tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
const COUNT = () => { window.__calls = 0; window.__what = []; const si = window.setInterval, st = window.setTimeout, raf = window.requestAnimationFrame;
  const tag = k => { const s = (new Error().stack || "").split("\n")[3] || ""; return () => { window.__calls++; if (window.__what.length < 6) window.__what.push(k + " " + s.trim()); }; };
  window.setInterval = (f, ...a) => { const t = tag("interval"); return si(() => { t(); typeof f === "function" && f(); }, ...a); };
  window.setTimeout = (f, ...a) => { const t = tag("timeout"); return st(() => { t(); typeof f === "function" && f(); }, ...a); };
  window.requestAnimationFrame = f => { const t = tag("frame"); return raf(x => { t(); f(x); }); }; };
/* a kept 16-bar loop: a kick each beat and a hat each eighth, bars 1 to 16 */
const KEPT = (() => { const ev = []; for (let b = 0; b < 16; b++) for (let i = 0; i < 16; i++) { const t = b * 384 + i * 24; if (i % 4 === 0) ev.push({ b: 0, p: 0, t, v: 0.9, len: 24 }); if (i % 2 === 0) ev.push({ b: 0, p: 2, t, v: 0.7, len: 24 }); } return ev; })();
async function ctxOf(b, opts) {
  const c = await b.newContext({ serviceWorkers: "block", ...opts }); await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  c.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); return c;
}
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* 10 · rest, alongside the rest of the checks */
  const rest = (async () => {
    const c = await ctxOf(b, { viewport: { width: 1024, height: 768 } }); await c.addInitScript(COUNT);
    await c.addInitScript(ev => { try { if (!sessionStorage.getItem("k")) { sessionStorage.setItem("k", "1"); localStorage.setItem("aog.pads.v1", JSON.stringify({ v: 1, bank: 0, sel: 0, banks: [{ type: "drums" }, { type: "chords" }, { type: "notes" }, { type: "chops" }], ev, bpm: 90, bars: 16 })); } } catch (e) {} }, KEPT);
    const p = await c.newPage(); await p.goto(U + "music-pads.html"); await p.waitForTimeout(40000);
    const r = await p.evaluate(async () => { const nav = !document.getElementById("barNav").hidden, n0 = document.querySelectorAll("#steps .st").length; window.__calls = 0; window.__what = [];
      await new Promise(r => setTimeout(r, 3000)); return { bars: S.bars, nav, n0, n: window.__calls - 1, what: window.__what.filter(w => !/eval at evaluate/.test(w)).slice(0, 3) }; });
    ok(r.bars === 16 && r.nav && r.n0 === 64 && r.n === 0, `left alone with a 16-bar loop kept (${r.bars} bars, ${r.n0} steps shown, the bar groups ${r.nav ? "shown" : "missing"}), it rests: ${r.n} timer/frame callbacks in 3 s ${r.what.join(" | ")}`);
    await c.close();
  })();

  const c = await ctxOf(b, { viewport: { width: 1280, height: 900 } });
  const p = await c.newPage(); await p.goto(U + "music-pads.html"); await p.waitForFunction(() => typeof canPlay === "function" && canPlay(0), null, { timeout: 60000 });
  await p.waitForTimeout(500);

  /* 1 · the menu */
  const menu = () => p.evaluate(() => [...document.querySelectorAll("#barsSel option")].map(o => o.textContent).join("|"));
  let m = await menu();
  ok(m === "1 bar|2 bars|4 bars|8 bars|16 bars", "Loop length: " + m);
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(200); m = await menu();
  ok(m === "1 compás|2 compases|4 compases|8 compases|16 compases", "Largo del bucle: " + m);
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(200);

  /* 2 · record across 16 bars, then hear each hit in its bar */
  await p.selectOption("#barsSel", "16");
  const r2 = await p.evaluate(async () => {
    S.ev = []; S.q = 24; S.swing = 50; S.click = false; changed(); retime(180); await prep(0);
    const wait = ms => new Promise(r => setTimeout(r, ms)), sp = () => spt(), L = loopLen();
    const pos = () => (ac.currentTime - SEQ.t0) / sp();
    document.getElementById("loopRec").click();   /* Record the loop: it starts playing */
    const plan = [[1, 0], [4, 1], [7, 2], [10, 4], [13, 5], [15, 6]];   /* (bar index, pad) */
    for (const [bar, pad] of plan) { while (pos() < bar * 384 + 100) await wait(15); hitPad(0, pad, 0.9, ac.currentTime); }
    /* Repeat at bar 16: a held pad, on the 16th-note grid */
    S.rate = 24; S.rpt = true; while (pos() < 15 * 384 + 200) await wait(15);
    press("rp", 7, 0.8); await wait(400); release("rp"); S.rpt = false;
    const rec = S.ev.map(e => ({ p: e.p, t: e.t }));
    /* the next time round, with the click: every hit sounds in its own bar; nothing is scheduled more than a moment ahead */
    SEQ.rec = false; S.click = true;
    const got = [], clicks = []; const tr0 = window.trigger, bl0 = window.blip;
    window.trigger = function (bi, pi, vel, when, T) { if (!T) got.push({ p: pi, abs: (when - SEQ.t0) / spt(), ahead: when - ac.currentTime }); return tr0.apply(this, arguments); };
    window.blip = function (when, top) { clicks.push({ abs: (when - SEQ.t0) / spt(), top }); return bl0.apply(this, arguments); };
    while (pos() < 2 * L + 50) await wait(30);
    window.trigger = tr0; window.blip = bl0; stop();
    const pass1 = got.filter(g => g.abs >= L - 0.5 && g.abs < 2 * L - 0.5), c1 = clicks.filter(g => g.abs >= L - 0.5 && g.abs < 2 * L - 0.5);
    return { plan, rec, heard: pass1.map(g => ({ p: g.p, bar: Math.floor(((Math.round(g.abs) % L) + L) % L / 384) })), ahead: Math.max(...got.map(g => g.ahead)),
      clicks: c1.length, tops: c1.filter(x => x.top).map(x => Math.round(x.abs) % L), rpt: rec.filter(e => e.p === 7) };
  });
  const inBar = r2.plan.every(([bar, pad]) => r2.rec.some(e => e.p === pad && Math.floor(e.t / 384) === bar));
  ok(inBar, "taps recorded across 16 bars land in their bars: " + r2.rec.filter(e => e.p !== 7).map(e => "pad " + (e.p + 1) + " bar " + (Math.floor(e.t / 384) + 1)).join(", "));
  const heardOk = r2.plan.every(([bar, pad]) => r2.heard.some(h => h.p === pad && h.bar === bar)) && r2.heard.filter(h => h.p !== 7).length === r2.plan.length;
  ok(heardOk, "the next time round each hit plays in its bar: " + r2.heard.filter(h => h.p !== 7).map(h => "pad " + (h.p + 1) + " bar " + (h.bar + 1)).join(", "));
  ok(r2.ahead < 0.2, `the scheduler looks only a moment ahead, never the whole loop (at most ${(r2.ahead * 1000).toFixed(0)} ms ahead)`);
  ok(r2.clicks === 64 && r2.tops.join() === "0", `the click: ${r2.clicks} clicks over 16 bars (a beat each), the high one on bar 1 only (${r2.tops.join()})`);
  ok(r2.rpt.length >= 3 && r2.rpt.every(e => e.t % 24 === 0 && Math.floor(e.t / 384) === 15) && r2.heard.filter(h => h.p === 7).length === r2.rpt.length,
    `Repeat at bar 16: ${r2.rpt.length} hits, each on a 16th note in bar 16 (${r2.rpt.map(e => e.t - 15 * 384).join(",")}), all heard the next time round`);

  /* 3 · Line up taps and swing at 16 bars */
  const r3 = await p.evaluate(() => {
    S.ev = []; changed(); retime(120); const sp = spt(); SEQ.t0 = 0; SEQ.abs = 1e9;   /* (a pass long gone: nothing is skipped) */
    const at = tk => SEQ.t0 + tk * sp, out = {};
    S.q = 24; out.q16 = recordHit(0, 0, 0.8, at(13 * 384 + 30)).t - 13 * 384;
    S.q = 48; out.q8 = recordHit(0, 0, 0.8, at(13 * 384 + 30)).t - 13 * 384;
    S.q = 0; out.q0 = recordHit(0, 0, 0.8, at(13 * 384 + 31)).t - 13 * 384;
    S.q = 24; out.wrap = recordHit(0, 1, 0.8, at(16 * 384 * 3 + 14 * 384 + 1)).t - 14 * 384;   /* the fourth time round, bar 15 */
    S.ev = [{ b: 0, p: 2, t: 15 * 384 + 24, v: 0.8, len: 24 }, { b: 0, p: 2, t: 15 * 384 + 48, v: 0.8, len: 24 }]; S.swing = 66; SEQ.map = null;
    const keys = [...evMap().keys()].map(k => k - 15 * 384); S.swing = 50; SEQ.map = null; SEQ.abs = 0;
    return Object.assign(out, { keys: keys.sort((a, b) => a - b) });
  });
  ok(r3.q16 === 24 && r3.q8 === 48 && r3.q0 === 31 && r3.wrap === 0, `Line up taps at bar 14 of 16: 16th notes ${r3.q16}, eighths ${r3.q8}, exactly as played ${r3.q0}; the fourth time round lands in bar 15 (${r3.wrap})`);
  ok(r3.keys.join() === "32,48", `swing 66 % in bar 16: the off-beat 16th moves later (${r3.keys.join(", ")})`);

  /* 4 · chord patterns and beats over long loops */
  const r4 = await p.evaluate(() => {
    const B = S.banks[1], bi = 1, out = {};
    const put = (id, bars) => { S.bars = bars; B.pat = id; patToLoop(B); const ev = S.ev.filter(e => e.b === bi).sort((a, b) => a.t - b.t);
      return { bars: S.bars, n: ev.length, at: ev.map(e => e.t / 384).join(","), pads: ev.map(e => e.p + 1).join(","), len: ev.map(e => (e.len + 12) / 384).join(","), each: patEach(patPads(patOf(B)).length) }; };
    out.canon8 = put("canon", 8); out.canon16 = put("canon", 16); out.pop16 = put("pop", 16); out.blues16 = put("blues", 16); out.wheel8 = put("wheel", 8); out.pop4 = put("pop", 4);
    out.canonPads = patPads(PATS.find(x => x.id === "canon")).map(x => x + 1).join(",");
    S.bars = 16; S.ev = []; startBeat("boombap");
    const A = S.ev.filter(e => e.b === 0), sig = bar => A.filter(e => Math.floor(e.t / 384) === bar).map(e => e.p + ":" + (e.t % 384)).sort().join();
    const nb = 1 + ((beatById("boombap") || {}).parts || []).length;   /* AOG-BEATS-PERFECT-V1: a beat may be a phrase of 2 or 4 bars */
    out.beat = { bars: S.bars, every: [...Array(16).keys()].every(k => sig(k) && sig(k) === sig(k % nb)) };
    const P = beatFlat().map(x => x.b).find(x => x.parts && x.parts.length);
    if (P) { S.bars = 16; startBeat(P.id); const A2 = S.ev.filter(e => e.b === 0), s2 = bar => A2.filter(e => Math.floor(e.t / 384) === bar).map(e => e.p + ":" + (e.t % 384)).sort().join(), n = P.parts.length + 1;
      out.parts = { id: P.id, n, bars: S.bars, rep: [...Array(16).keys()].every(k => s2(k) === s2(k % n)), differ: s2(0) !== s2(1) }; }
    return out;
  });
  const cp = r4.canonPads;
  ok(r4.canon8.bars === 8 && r4.canon8.n === 8 && r4.canon8.at === "0,1,2,3,4,5,6,7" && r4.canon8.pads === cp && r4.canon8.each === "One chord each bar.", `Canon (8 chords) over 8 bars: one a bar (${r4.canon8.at}; pads ${r4.canon8.pads}; "${r4.canon8.each}")`);
  ok(r4.canon16.bars === 16 && r4.canon16.n === 16 && r4.canon16.pads === cp + "," + cp, `Canon over 16 bars: twice round (${r4.canon16.pads})`);
  ok(r4.pop16.bars === 16 && r4.pop16.n === 16 && r4.pop16.len.split(",").every(x => x === "1"), `Pop (4 chords) over 16 bars: four times round, a bar each (${r4.pop16.pads})`);
  ok(r4.blues16.bars === 12 && r4.blues16.n === 12 && r4.blues16.at === "0,1,2,3,4,5,6,7,8,9,10,11", `the 12-bar blues in a long loop is 12 bars, one chord a bar (${r4.blues16.bars} bars: ${r4.blues16.pads})`);
  ok(r4.wheel8.bars === 8 && r4.wheel8.n === 6 && r4.wheel8.len === "1,1,1,1,1,3", `6 chords over 8 bars: a bar each, home holds the last 3 (${r4.wheel8.len}; "${r4.wheel8.each}")`);
  ok(r4.pop4.bars === 4 && r4.pop4.n === 4, "a short loop is as before: Pop over 4 bars");
  ok(r4.beat.bars === 16 && r4.beat.every, "a beat fills all 16 bars, its phrase repeating");
  ok(!!r4.parts && r4.parts.rep && r4.parts.differ && r4.parts.bars === 16, "a beat in parts plays its parts bar after bar, round and round over 16 bars: " + JSON.stringify(r4.parts));

  /* 5 · a longer loop repeats; copy and clear bars */
  const r5 = await p.evaluate(async () => {
    const out = {}, s = document.getElementById("barsSel");
    S.bank = 0; S.sel = 0; paintAll();
    s.value = "4"; s.onchange(); S.ev = []; for (let bar = 0; bar < 4; bar++) S.ev.push({ b: 0, p: bar, t: bar * 384, v: 0.8, len: 24 }); S.ev.push({ b: 1, p: 0, t: 0, v: 0.8, len: 360 }); changed();
    s.value = "16"; s.onchange();
    const sig = (bi, bar) => S.ev.filter(e => e.b === bi && Math.floor(e.t / 384) === bar).map(e => e.p + ":" + e.t % 384).sort().join();
    out.grew = [...Array(16).keys()].every(k => sig(0, k) === sig(0, k % 4)) && sig(1, 12) === sig(1, 0); out.line = document.getElementById("line").textContent;
    /* bars 5–8 in view, Clear: only bank A's bars 5–8 */
    document.querySelector('#barNav [data-gd="1"]').click();
    out.clearLab = document.getElementById("barClear").textContent; out.copyLab = document.getElementById("barCopy").textContent;
    document.getElementById("barClear").click();
    out.cleared = [4, 5, 6, 7].every(k => sig(0, k) === "") && sig(0, 3) !== "" && sig(0, 8) !== "" && sig(1, 4) !== "";
    /* bars 1–4 in view: one tap fills bars 5–16 */
    S.ev = S.ev.filter(e => !(e.b === 0 && e.t >= 4 * 384)); S.ev.push({ b: 0, p: 9, t: 2 * 384 + 72, v: 0.6, len: 24 }); changed();
    const sel = document.getElementById("barGrp"); sel.value = "0"; sel.dispatchEvent(new Event("change", { bubbles: true }));
    out.copyLab0 = document.getElementById("barCopy").textContent;
    document.getElementById("barCopy").click();
    out.copied = [...Array(16).keys()].every(k => sig(0, k) === sig(0, k % 4)) && sig(0, 14) === sig(0, 2);
    out.copyLine = document.getElementById("line").textContent;
    document.getElementById("undoBtn").click(); out.undone = sig(0, 6) === "";
    document.querySelector('#barNav [data-gd="1"]').click(); document.querySelector('#barNav [data-gd="1"]').click(); document.querySelector('#barNav [data-gd="1"]').click();
    out.lastHidesCopy = document.getElementById("barCopy").hidden && getComputedStyle(document.getElementById("barCopy")).display === "none";
    return out;
  });
  ok(r5.grew, "4 bars made longer, 16: the 4 bars repeat to fill them (every bank): " + r5.line);
  ok(r5.clearLab === "Clear bank A's bars 5–8" && r5.cleared, `"${r5.clearLab}" empties only bank A's bars 5 to 8`);
  ok(r5.copyLab0 === "Copy bank A's bars 1–4 to the rest" && r5.copied, `"${r5.copyLab0}" fills bars 5 to 16 with bars 1 to 4: ${r5.copyLine}`);
  ok(r5.undone, "Undo takes the copy back");
  ok(r5.lastHidesCopy, "on bars 13–16 there is nothing after to copy to: the copy button steps aside");

  /* 6 · Make the loop into a file: 16 bars at 60 */
  const bounce = () => p.evaluate(async () => {
    S.bars = 16; S.ev = []; retime(60);
    for (let bar = 0; bar < 16; bar++) for (let i = 0; i < 16; i++) { const t = bar * 384 + i * 24; if (i % 4 === 0) S.ev.push({ b: 0, p: 0, t, v: 0.9, len: 24 }); if (i % 8 === 4) S.ev.push({ b: 0, p: 1, t, v: 0.9, len: 24 }); S.ev.push({ b: 0, p: 2, t, v: 0.6, len: 24 }); if (i % 3 === 0) S.ev.push({ b: 0, p: 6, t, v: 0.5, len: 24 }); }
    const B = S.banks[1]; B.pat = "pop"; patToLoop(B); await prep(1); changed();
    await new Promise(r => setTimeout(r, 2500));   /* (the page's helpers settle after the loop is drawn again) */
    const long = []; const po = new PerformanceObserver(l => l.getEntries().forEach(e => long.push(Math.round(e.duration)))); po.observe({ entryTypes: ["longtask"] });
    /* and a heartbeat: the page answers within a few frames all through */
    let gap = 0, last = performance.now(), go = true; const beat = () => { const n = performance.now(); gap = Math.max(gap, n - last); last = n; if (go) setTimeout(beat, 4); }; beat();
    console.timeStamp("aog-bounce-start"); const t0 = performance.now(); await makeBounce(); const ms = performance.now() - t0; go = false; console.timeStamp("aog-bounce-end");
    await new Promise(r => setTimeout(r, 100)); po.disconnect();
    const o = BOUNCE.out; return { ok: !!o, sec: o && o.sec, bars: o && o.bars, size: o && o.blob.size, n: S.ev.length, long, gap: Math.round(gap), ms: Math.round(ms), line: document.getElementById("bounceLine").textContent };
  });
  const r6 = await bounce();
  ok(r6.ok && Math.abs(r6.sec - 64) < 1e-3 && r6.size === 44 + Math.round(64 * 44100) * 4 && r6.bars === 16, `16 bars at 60 beats a minute make a file of ${r6.sec && r6.sec.toFixed(3)} s (${r6.size} bytes, ${r6.n} hits; made in ${r6.ms} ms): ${r6.line}`);
  ok(r6.long.length === 0, `no main-thread task of 50 ms or more while it is made (${r6.long.join(", ") || "none"}; longest pause between two heartbeats ${r6.gap} ms)`);
  /* again with the processor slowed four times, read from a trace as play/steady-all.js reads it: the page's own work (its
     scripts, style, layout, painting) in any one task stays under 50 ms; the browser's own steps (taking the finished sound
     back from the audio thread, a garbage collection) are shown */
  {
    const cdp = await c.newCDPSession(p); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    const tev = []; cdp.on("Tracing.dataCollected", d => { for (const e of d.value) if (e.ph === "M" || e.ph === "X" || e.name === "TimeStamp") tev.push(e); });
    await cdp.send("Tracing.start", { traceConfig: { includedCategories: ["toplevel", "devtools.timeline", "v8.gc"] }, transferMode: "ReportEvents" });
    const r = await bounce();
    const done = new Promise(rr => cdp.once("Tracing.tracingComplete", rr)); await cdp.send("Tracing.end"); await done;
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    const tr = STEADY.readTrace(tev), mk = n => (tev.find(e => e.name === "TimeStamp" && e.args && e.args.data && e.args.data.message === n) || {}).ts;
    const a = mk("aog-bounce-start"), z = mk("aog-bounce-end");
    const gcOf = T => tr.gcs.filter(g => g.ts >= T.ts && g.ts <= T.ts + T.dur && (g.name === "MajorGC" || g.name === "MinorGC")).reduce((q, g) => q + tr.td(g), 0);
    const inside = tr.tasks.filter(T => a && z && T.ts + T.dur >= a && T.ts <= z + 50000);
    const page = inside.filter(T => tr.work(T) - gcOf(T) >= 50), own = inside.filter(T => tr.td(T) >= 50 && tr.work(T) - gcOf(T) < 50);
    ok(r.ok && Math.abs(r.sec - 64) < 1e-3 && !!a && page.length === 0, `4 times slower than a phone: the file is made (${r.ms} ms) and no task holds 50 ms of the page's own work: ${page.map(T => (tr.work(T) - gcOf(T)).toFixed(0) + " ms (" + tr.what(T) + ")").join("; ") || "none"}${own.length ? "; the browser's own: " + own.map(T => tr.td(T).toFixed(0) + " ms (" + (tr.what(T) || "unnamed") + ")").join("; ") : ""}`);
  }

  /* 7 · send 16 bars, then 8, to the desk and the turntables */
  const send = async () => p.evaluate(async () => {
    const got = {}; const a0 = AOGHandoff.add, p0 = AOGHandoff.put;
    AOGHandoff.add = function (k, it) { got.desk = { bars: it.bars, passSec: it.passSec, loop: it.loop, bpm: it.bpm }; return a0.apply(this, arguments); };
    AOGHandoff.put = function (k, it) { if (k === "padbench") got.decks = { bars: it.bars, passSec: it.passSec, bpm: it.bpm }; return p0.apply(this, arguments); };
    document.getElementById("bStudio").click(); await new Promise(r => setTimeout(r, 1500));
    document.getElementById("bDecks").click(); await new Promise(r => setTimeout(r, 1500));
    AOGHandoff.add = a0; AOGHandoff.put = p0; return got;
  });
  let s7 = await send();
  ok(s7.desk && s7.desk.bars === 16 && Math.abs(s7.desk.passSec - 64) < 1e-3 && s7.decks && s7.decks.bars === 16, "sent: the desk gets 16 bars, 64 s a pass; the turntables 16 bars: " + JSON.stringify(s7));
  await p.evaluate(async () => { const s = document.getElementById("barsSel"); s.value = "8"; s.onchange(); retime(120); await makeBounce(); });
  s7 = await send();
  ok(s7.desk && s7.desk.bars === 8 && Math.abs(s7.desk.passSec - 16) < 1e-3 && s7.decks && s7.decks.bars === 8, "sent: 8 bars at 120 are 16 s, to the desk and the turntables: " + JSON.stringify(s7));

  /* 6 · seamless: what rings over the end of a long loop is in its first moments (a kick on the last 16th of bar 16; a chord
     over the end of 8 bars at 60, from 4 s before the end to 2 s after it) */
  const r6b = await p.evaluate(async () => {
    const rms = async (o, a, b) => { const v = new Int16Array((await o.blob.arrayBuffer()).slice(44)); const sr = 44100; let s = 0, n = 0;
      for (let i = Math.round(a * sr) * 2; i < Math.round(b * sr) * 2 && i < v.length; i++) { s += (v[i] / 32768) ** 2; n++; } return 20 * Math.log10(Math.sqrt(s / Math.max(1, n)) + 1e-9); };
    const out = {};
    S.bars = 16; retime(90); S.ev = [{ b: 0, p: 0, t: 16 * 384 - 24, v: 1, len: 24 }]; changed(); let o = await renderLoop();
    out.kick = { head: await rms(o, 0, 0.08), mid: await rms(o, 5, 20), end: await rms(o, o.sec - 0.15, o.sec) };
    S.bars = 8; retime(60); S.ev = [{ b: 1, p: 0, t: 8 * 384 - 4 * 96, v: 0.9, len: 6 * 96 }]; await prep(1); changed(); o = await renderLoop();
    out.chord = { head: await rms(o, 0, 1.5), quiet: await rms(o, 4, 20), held: await rms(o, o.sec - 2, o.sec - 0.1), sec: o.sec };
    return out;
  });
  ok(r6b.kick.head > -50 && r6b.kick.mid < -90 && r6b.kick.end > -50, `16 bars: a kick on the very last 16th rings on into the file's first moment (${r6b.kick.head.toFixed(0)} dB), silence between (${r6b.kick.mid.toFixed(0)} dB)`);
  ok(r6b.chord.head > -60 && r6b.chord.held > -50 && r6b.chord.quiet < -90, `8 bars at 60: a chord held over the loop's end goes on sounding at the file's start (${r6b.chord.head.toFixed(0)} dB; before the end ${r6b.chord.held.toFixed(0)} dB; silence between ${r6b.chord.quiet.toFixed(0)} dB)`);

  /* 8 · the step view */
  const r8 = await p.evaluate(async () => {
    const out = {}, s = document.getElementById("barsSel"), nav = document.getElementById("barNav"), first = () => +document.querySelector("#steps .st").dataset.s, n = () => document.querySelectorAll("#steps .st").length;
    S.bank = 0; S.sel = 0; paintAll();
    s.value = "4"; s.onchange(); out.four = { hidden: nav.hidden, n: n() };
    s.value = "8"; s.onchange(); out.eight = { btns: [...nav.querySelectorAll(".bg")].map(b => b.textContent + (b.getAttribute("aria-pressed") === "true" ? "*" : "")).join("|"), n: n(), first: first() };
    nav.querySelector('.bg[data-g="1"]').click(); out.eight.after = first();
    s.value = "16"; s.onchange(); const g0 = document.getElementById("barGrp"); g0.value = "0"; g0.dispatchEvent(new Event("change", { bubbles: true }));
    out.sixteen = { opts: [...document.querySelectorAll("#barGrp option")].map(o => o.textContent).join("|"), n: n(), prevOff: nav.querySelector('[data-gd="-1"]').disabled };
    nav.querySelector('[data-gd="1"]').click(); nav.querySelector('[data-gd="1"]').click(); out.sixteen.at = first(); out.sixteen.menu = document.getElementById("barGrp").value;
    /* a step tapped in bars 9–12 is a hit in that bar */
    S.ev = S.ev.filter(e => !(e.b === 0 && e.p === 0)); changed();
    document.querySelector('#steps .st[data-s="133"]').click(); out.tap = S.ev.filter(e => e.b === 0 && e.p === 0).map(e => e.t).join();
    /* playing: the view follows the bar playing, and shows it */
    S.ev = S.ev.filter(e => e.b === 0); retime(180); s.value = "16"; s.onchange(); document.getElementById("barGrp").value = "0"; document.getElementById("barGrp").dispatchEvent(new Event("change", { bubbles: true }));
    const wait = ms => new Promise(r => setTimeout(r, ms)), bar = () => Math.floor(((ac.currentTime - SEQ.t0) / spt()) / 384);
    play(); while (bar() < 4 || stepNow < 64 + 4) await wait(20);
    out.follow = { g: SV.g, first: first(), now: document.getElementById("barNow").textContent, lit: !!document.querySelector("#steps .st.now") };
    /* a finger on a step: from then on the view stays */
    const st = document.querySelector('#steps .st[data-s="70"]'); st.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); st.click();
    while (bar() < 8 || stepNow < 128 + 4) await wait(20);
    out.stay = { g: SV.g, first: first(), now: document.getElementById("barNow").textContent };
    stop(); out.stopNow = document.getElementById("barNow").textContent;
    document.getElementById("langBtn").click(); out.es = { opts: [...document.querySelectorAll("#barGrp option")].map(o => o.textContent).join("|"), copy: document.getElementById("barCopy").textContent, clear: document.getElementById("barClear").textContent };
    document.getElementById("langBtn").click();
    return out;
  });
  ok(r8.four.hidden && r8.four.n === 64, "4 bars: all 64 steps, no bar groups");
  ok(r8.eight.btns === "Bars 1–4*|Bars 5–8" && r8.eight.n === 64 && r8.eight.first === 0 && r8.eight.after === 64, `8 bars: two buttons (${r8.eight.btns}); 64 steps at a time; Bars 5–8 shows steps 65 to 128`);
  ok(r8.sixteen.opts === "Bars 1–4|Bars 5–8|Bars 9–12|Bars 13–16" && r8.sixteen.prevOff && r8.sixteen.at === 128 && r8.sixteen.menu === "2", `16 bars: a menu (${r8.sixteen.opts}) with ◀ ▶; ▶ twice shows bars 9–12 (from step ${r8.sixteen.at + 1})`);
  ok(r8.tap === String(133 * 24), "a step tapped in bars 9–12 is a hit there (" + r8.tap + ")");
  ok(r8.follow.g === 1 && r8.follow.first === 64 && r8.follow.now === "Playing bar 5 of 16" && r8.follow.lit, "playing, the view follows to bars 5–8 and says " + JSON.stringify(r8.follow));
  ok(r8.stay.g === 1 && r8.stay.first === 64 && /^Playing bar 9 of 16$/.test(r8.stay.now), "after a step is touched the view stays on bars 5–8 while bar 9 plays: " + JSON.stringify(r8.stay));
  ok(r8.stopNow === "", "stopped, the playing bar's line goes");
  ok(r8.es.opts === "Compases 1–4|Compases 5–8|Compases 9–12|Compases 13–16" && r8.es.copy === "Copia los compases 5–8 del banco A al resto" && r8.es.clear === "Borra los compases 5–8 del banco A", "in Spanish: " + JSON.stringify(r8.es));
  await c.close();

  /* 8 · every step reachable by a finger, inside the Studio */
  const IPH = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
  const IPAD = "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
  const DEV = { "iPhone upright": { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3, userAgent: IPH },
    "iPhone sideways": { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3, userAgent: IPH },
    "iPad upright": { viewport: { width: 820, height: 1180 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, userAgent: IPAD },
    "iPad sideways": { viewport: { width: 1180, height: 820 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, userAgent: IPAD } };
  for (const [dev, o] of Object.entries(DEV)) {
    const theme = /upright/.test(dev) ? "dark" : "light";
    const c2 = await ctxOf(b, { ...o, colorScheme: theme }), p2 = await c2.newPage();
    await c2.addInitScript(th => { try { localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    await p2.goto(U + "the-studio#pads");
    await p2.waitForFunction(() => { const fr = document.getElementById("room"), d = fr && fr.contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && d.location.pathname.endsWith("music-pads.html"); }, null, { timeout: 60000 });
    await p2.waitForTimeout(1500);
    const f = await (await p2.$("#room")).contentFrame();
    await f.evaluate(() => { const s = document.getElementById("barsSel"); s.value = "16"; s.onchange(); });
    const seen = new Set(); let small = [], blocked = [], navSmall = "";
    for (let g = 0; g < 4; g++) {
      if (g > 0) { await f.locator('#barNav [data-gd="1"]').tap(); await p2.waitForTimeout(150); }
      else navSmall = await f.evaluate(() => [...document.querySelectorAll("#barNav button,#barNav select,#barTools button")].filter(e => !e.hidden).map(e => { const r = e.getBoundingClientRect(); return r.height < 44 ? (e.id || e.textContent) + " " + Math.round(r.height) : ""; }).filter(Boolean).join(", "));
      const r = await f.evaluate(() => [...document.querySelectorAll("#steps .st")].map(el => {
        el.scrollIntoView({ block: "nearest", inline: "nearest" });
        const q = el.getBoundingClientRect(), fe = window.frameElement.getBoundingClientRect(), x = q.x + q.width / 2, y = q.y + q.height / 2;
        const inTop = fe.x + x >= 0 && fe.x + x <= parent.innerWidth && fe.y + y >= 0 && fe.y + y <= parent.innerHeight;
        const top = parent.document.elementFromPoint(fe.x + x, fe.y + y), own = document.elementFromPoint(x, y);
        return { s: +el.dataset.s, w: Math.round(q.width), h: Math.round(q.height), hit: inTop && top === window.frameElement && own === el };
      }));
      r.forEach(x => { if (x.hit) seen.add(x.s); else blocked.push(x.s); if (x.w < 32 || x.h < 40) small.push(x.s + ":" + x.w + "×" + x.h); });
    }
    /* readable and calm, with 16 bars (the menu, Copy and Clear) and with 8 (the two buttons, the playing group marked) */
    let pc = await f.evaluate(`(${PROBE})()`), pk = await f.evaluate(`(${CALM})()`);
    await f.evaluate(() => { const s = document.getElementById("barsSel"); s.value = "8"; s.onchange(); SV.bar = -1; barPlaying(5); });
    pc = pc.concat(await f.evaluate(`(${PROBE})()`)); pk = pk.concat(await f.evaluate(`(${CALM})()`));
    ok(!pc.length && !pk.length, `${dev} (${theme}): the steps, the bar choices and Copy and Clear read clearly (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and are calm (${pk.join("; ") || "ok"})`);
    const size = await f.evaluate(() => { const q = document.querySelector("#steps .st").getBoundingClientRect(); return Math.round(q.width) + "×" + Math.round(q.height) + ", " + getComputedStyle(document.getElementById("steps")).gridTemplateColumns.split(" ").length + " to a row"; });
    ok(seen.size === 256 && !blocked.length, `${dev}: every one of the 256 steps can be reached by a finger (${seen.size}${blocked.length ? "; covered or out of reach: " + blocked.slice(0, 6).join(",") : ""})`);
    ok(!small.length, `${dev}: each step is a finger wide (${size}${small.length ? "; too small: " + small.slice(0, 4).join(", ") : ""})`);
    ok(!navSmall, `${dev}: the bar choices and Copy and Clear are 44 px tall or more ${navSmall}`);
    await c2.close();
  }

  /* 9 · tap-to-sound with a 16-bar loop playing (the made page, inside the Studio, iPhone on its side, 4× slower) */
  {
    const port = 9411, s2 = STEADY.serve(port);
    STEADY.ROOMS.pads = Object.assign({}, STEADY.ROOMS.pads, {
      setup: async f => { await f.waitForFunction(() => typeof canPlay === "function" && canPlay(0), null, { timeout: 120000 });
        await f.evaluate(() => { const s = document.getElementById("barsSel"); s.value = "16"; s.onchange(); startBeat("boombap"); S.bank = 0; paintAll(); play();
          /* the loop stops a moment after the last finger lifts, so the voices can be counted once they have rung out */
          addEventListener("pointerup", () => { clearTimeout(window.__st); window.__st = setTimeout(() => { if (SEQ.on) stop(); }, 2500); }, true); });
        await f.waitForFunction(() => SEQ.on && S.bars === 16 && S.ev.filter(e => e.t >= 15 * 384).length > 0, null, { timeout: 20000 }); }
    });
    try { await STEADY.play(b, port, "pads"); } catch (e) { ok(false, "steady: " + e.message.split("\n")[0]); }
    s2.close();
  }
  await rest;
  const sf = STEADY.fails(); if (sf) fails += sf;
  ok(errs.length === 0, "no page errors " + errs.slice(0, 4).join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
