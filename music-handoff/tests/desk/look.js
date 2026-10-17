/* AOG-DESK-LOOK-V2 (slice 9 of the DAW build) — the Mixing Desk as it shows inside the Recording Studio:
   · a double click (computer) or a double tap (a finger on an iPad) puts a fader or knob back where it starts: a track's
     volume to 0 dB, its side to the middle, the Glue to 30; one Undo brings the move back;
   · every mixer strip's buttons and knobs line up, with or without a recording; a group is named under the strip's name;
   · on an iPhone the counter and Your songs never overlap; the loop's band carries no words under the markers;
   · inside the Studio on an iPhone (upright and sideways), an iPad (upright and sideways) and a computer, light and dark:
     nothing sideways, every button and menu big enough for a finger, readable and calm. Port 9348. */
const T = require("./lib.js"), { ok, near, add, put } = T;
const PORT = 9348, U = "http://localhost:" + PORT + "/", srv = T.srv(PORT);
const inner = p => p.frames().find(x => x.parentFrame() === p.mainFrame());
async function studio(b, opts, theme) {
  const cx = await b.newContext(Object.assign({ colorScheme: theme }, opts)); T.watch(cx); await T.routes(cx);
  await cx.addInitScript(th => { try { localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
  const m = await cx.newPage(); await m.goto(U + "the-studio#studio", { timeout: 120000 });
  await m.waitForFunction(() => { const d = document.getElementById("room").contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && /studio/.test(d.location.pathname) && d.defaultView.__aogDeskArrange; }, null, { timeout: 90000 });
  await m.waitForTimeout(1000);
  const f = inner(m);
  for (let n = 1; n <= 2; n++) await f.evaluate(`(${T.TAKE})(${JSON.stringify({ n, f: [220 * n], bars: 4 })})`);
  await f.waitForFunction(() => __aogStudio.INBOX.items.length === 2, null, { timeout: 8000 });
  for (let n = 1; n <= 2; n++) await f.evaluate(async n => { const st = __aogStudio, v = [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.startsWith("Guitar take " + n)); await st.putOn(v.value, n - 1); }, n);
  await f.waitForFunction(() => __aogStudio.SONG.tracks[1].clip && !__aogStudio.S.busy, null, { timeout: 20000 });
  await f.evaluate(() => { const st = __aogStudio; st.SONG.tracks[0].grp = "drums"; st.SONG.tracks[1].grp = "drums"; st.SONG.marks = [{ b: 1, w: "Intro" }]; st.SONG.loopOn = true; st.SONG.loopFrom = 1; st.SONG.loopTo = 2; st.selectTrack(0); st.songChanged(); });
  return { cx, m, f };
}
(async () => {
  const b = await T.launch();
  /* 1 · a computer: double click to reset; the strips line up; the group's name */
  let { cx, m, f } = await studio(b, { viewport: { width: 1366, height: 900 } }, "dark");
  await f.evaluate(() => { const set = (id, v) => { const r = document.getElementById(id); r.value = String(v); r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true })); }; set("t2-vol", 50); set("t2-pan", -40); set("m-glue", 70); });
  const u0 = await f.evaluate(() => __aogStudio.UNDO.length);
  for (const id of ["t2-vol", "t2-pan", "m-glue"]) { await f.evaluate(id => document.getElementById(id).scrollIntoView({ block: "center" }), id); await f.dblclick("#" + id, { position: { x: 4, y: 8 } }); await m.waitForTimeout(120); }
  const r1 = await f.evaluate(() => ({ v: __aogStudio.SONG.tracks[2].vol, p: __aogStudio.SONG.tracks[2].pan, g: __aogStudio.SONG.master.glue, u: __aogStudio.UNDO.length }));
  await f.evaluate(() => __aogStudio.undo()); const r2 = await f.evaluate(() => __aogStudio.SONG.master.glue);
  ok(r1.v === 80 && r1.p === 0 && r1.g === 30 && r2 === 70, `a double click puts a fader back: volume ${r1.v} (0 dB), side ${r1.p} (the middle), Glue ${r1.g}; Undo brings the Glue back to ${r2}`);
  const al = await f.evaluate(() => { const tops = sel => [...document.querySelectorAll("#mixer .st-strip")].map(s => Math.round(s.querySelector(sel).getBoundingClientRect().top)); return { mute: tops('[data-ms="mute"]'), vol: tops('input[data-k="vol"]'), tags: [...document.querySelectorAll("#mixer .st-gtag")].map(e => e.textContent.trim()).join(",") }; });
  ok(new Set(al.mute).size === 1 && new Set(al.vol).size === 1 && al.tags === "Drums,Drums,,,,,,", `every strip lines up, with or without a recording (Mute at ${al.mute[0]}, Volume at ${al.vol[0]}); the group is named under its strips: ${al.tags}`);
  const band = await f.evaluate(() => ({ words: document.getElementById("cyBand").textContent.trim(), lab: document.querySelector(".st-cyn").textContent }));
  ok(band.words === "" && band.lab === "Loop · marks", `the loop's band carries no words under the markers; the strip is "${band.lab}"`);
  await cx.close();

  /* 2 · an iPad: a double tap with a finger */
  ({ cx, m, f } = await studio(b, { ...T.pw.devices["iPad (gen 7)"] }, "light"));
  await f.evaluate(() => { const r = document.getElementById("fv1"); r.value = "40"; r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true })); r.scrollIntoView({ block: "center" }); });
  await m.waitForTimeout(300);
  const box = await f.evaluate(() => { const r = document.getElementById("fv1").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  const fr = await (await m.$("#room")).boundingBox(), s = await cx.newCDPSession(m), X = fr.x + box.x, Y = fr.y + box.y;
  for (let k = 0; k < 2; k++) { await s.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: X, y: Y }] }); await m.waitForTimeout(40); await s.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await m.waitForTimeout(90); }
  await m.waitForTimeout(200);
  const tap = await f.evaluate(() => ({ v: __aogStudio.SONG.tracks[1].vol, homed: __aogDeskPro.DP.homed || 0 }));
  ok(tap.v === 80 && tap.homed >= 1, `iPad: a double tap on track 2's fader puts it back to 0 dB (${tap.v})`);
  await cx.close();

  /* 3 · everywhere: fits, a finger can press it, readable, calm; on an iPhone the counter and Your songs apart */
  for (const [dev, theme] of [["iPhone 13", "light"], ["iPhone 13", "dark"], ["iPhone 13 landscape", "dark"], ["iPad (gen 7)", "dark"], ["iPad (gen 7) landscape", "light"], [null, "light"]]) {
    ({ cx, m, f } = await studio(b, dev ? { ...T.pw.devices[dev] } : { viewport: { width: 1440, height: 900 } }, theme));
    await f.evaluate(() => { for (const id of ["pmBox", "drMore", "daMore"]) { const d = document.getElementById(id); if (d) { d.open = true; d.dispatchEvent(new Event("toggle")); } } });
    await m.waitForTimeout(400);
    const g = await f.evaluate(() => { const R = el => el.getBoundingClientRect(), a = R(document.querySelector("#transport .st-read")), sb = R(document.getElementById("songsBtn")), over = !(a.right <= sb.left || sb.right <= a.left || a.bottom <= sb.top || sb.bottom <= a.top);
      const els = [...document.querySelectorAll("#desk button, #desk select")].filter(x => x.offsetParent && getComputedStyle(x).visibility !== "hidden" && !x.closest(".st-tl"));
      const small = els.filter(x => { const r = R(x); return r.height < 44 || r.width < 44; }).map(x => (x.id || x.className) + "[" + x.textContent.slice(0, 14) + "] " + Math.round(R(x).width) + "x" + Math.round(R(x).height));
      return { over, iw: innerWidth, sw: document.scrollingElement.scrollWidth, n: els.length, small }; });
    const pc = await f.evaluate(`(${T.PROBE})()`), pk = await f.evaluate(`(${T.CALM})()`);
    ok(!g.over && g.sw <= g.iw && !g.small.length && !pc.length && !pk.length, `${dev || "computer"}, ${theme}, in the Studio: the counter and Your songs apart (${!g.over}), nothing sideways (${g.sw} ≤ ${g.iw}), ${g.n} buttons and menus a finger can press${g.small.length ? " (small: " + g.small.join(", ") + ")" : ""}, readable (${pc.length} ${JSON.stringify(pc.slice(0, 2))}), calm (${pk.join("; ") || "ok"})`);
    await cx.close();
  }
  await T.done(b, srv);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
