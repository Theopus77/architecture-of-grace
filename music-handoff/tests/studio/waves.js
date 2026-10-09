const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9246, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
async function routes(ctx) { await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort()); }

/* a take of four bars at 100 beats a minute (a bar is 2.4 s), 0.05 s of quiet first as a take has; each bar one note */
const TAKE = `(async (n, freqs) => { const sr = 44100, head = 0.05, bar = 2.4, sec = head + bar * freqs.length, len = Math.round(sec * sr);
  const ab = new ArrayBuffer(44 + len * 4), v = new DataView(ab), s = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  s(0, "RIFF"); v.setUint32(4, 36 + len * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, len * 4, true);
  let ph = 0;
  for (let i = 0; i < len; i++) { const t = i / sr - head; let x = 0;
    if (t >= 0) { const k = Math.min(freqs.length - 1, Math.floor(t / bar)), u = t - k * bar, env = Math.min(1, u / 0.01, Math.max(0, (bar - 0.2 - u) / 0.01)); ph += 2 * Math.PI * freqs[k] / sr; x = Math.round(9000 * env * Math.sin(ph)); }
    v.setInt16(44 + i * 4, x, true); v.setInt16(46 + i * 4, x, true); }
  await AOGHandoff.add(AOGHandoff.INBOX, { from: "guitar", n, name: { en: "Guitar take " + n, es: "Toma de guitarra " + n }, sec, bpm: 100, at: Date.now() + n, take: true,
    wav: new Blob([ab], { type: "audio/wav" }) }, { key: "edit|" + n });
})`;
const NOTES = [220, 330, 440, 550];
/* Make the mix, then each bar's note (by counting its waves in the middle of the bar) and level */
async function mixBars(p, nBars) {
  await p.evaluate(() => { document.getElementById("mixLine").textContent = ""; });
  await p.click("#mixBtn");
  await p.waitForFunction(() => /ready|did not/.test(document.getElementById("mixLine").textContent), null, { timeout: 60000 });
  return p.evaluate(async (nBars) => {
    const st = __aogStudio, m = st.MIX, buf = await new OfflineAudioContext(2, 1, 44100).decodeAudioData(await m.wav.arrayBuffer()), d = buf.getChannelData(0), sr = buf.sampleRate, bar = st.barSec();
    const out = [];
    for (let k = 0; k < nBars; k++) {
      const a = Math.floor((k * bar + 0.3 * bar) * sr), z = Math.min(d.length, Math.floor((k * bar + 0.75 * bar) * sr));
      let s = 0, n = 0, up = 0; for (let i = a; i < z; i++) { s += d[i] * d[i]; n++; if (i > a && d[i - 1] < 0 && d[i] >= 0) up++; }
      const db = n ? 10 * Math.log10(s / n + 1e-12) : -120;
      out.push({ hz: db > -45 ? Math.round(up / ((z - a) / sr)) : 0, db: +db.toFixed(1) });
    }
    return { bars: out, sec: +buf.duration.toFixed(2), bar: +bar.toFixed(3), line: document.getElementById("mixLine").textContent };
  }, nBars);
}
const near = (hz, want) => want === 0 ? hz === 0 : Math.abs(hz - want) / want < 0.03;
const shape = (r, want) => r.bars.length === want.length && r.bars.every((b, i) => near(b.hz, want[i]));
const say = r => r.bars.map(b => b.hz || "·").join(" ");
const act = async (p, a) => { await p.click(`#clipBox [data-act="${a}"]`); await p.waitForTimeout(60); };
const slide = (p, v) => p.evaluate(v => { const r = document.getElementById("spdR"); r.value = String(v); r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true })); }, v);
const ready = p => p.waitForFunction(() => !__aogStudio.S.stretching, null, { timeout: 60000 });
async function put(p, take, track) {
  await p.selectOption("#trackSel", String(track));
  const v = await p.evaluate(nm => [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === nm).value, take);
  await p.selectOption("#srcSel", v); await p.click("#putBtn");
  await p.waitForFunction(t => __aogStudio.SONG.tracks[t].clip && !__aogStudio.S.busy, track, { timeout: 15000 });
}


/* AOG-STUDIO-WAVES-V1 — Jimmy: "On the studio, I would like to see the sounds waves, which is a super easy way to cut and
   paste sound." The four-bar take (one note a bar) on track 1: its block on the song shows its wave; the track's panel shows
   it large. Tap the wave in bar 2 and the cut goes there; Cut here cuts there; drag the right edge of a piece a bar in and
   the mix loses that bar; drag the left edge in and it loses its first bar. iPad and iPhone; calm and readable. Port 9246. */
async function waveXY(p, beat){ return p.evaluate(b => { const c=__aogStudio.SONG.tracks[__aogStudio.SONG.sel].clip, cv=document.getElementById("waveC"); cv.scrollIntoView({block:"center"});
  const r=cv.getBoundingClientRect(), pad=10, full=__aogStudio.fullBeats(c); return {x:r.left+pad+b/full*(r.width-2*pad), y:r.top+r.height/2}; }, beat); }
async function drag(p, from, to){ const a=await waveXY(p, from), z=await waveXY(p, to);
  await p.mouse.move(a.x, a.y); await p.mouse.down(); for(let k=1;k<=8;k++) await p.mouse.move(a.x+(z.x-a.x)*k/8, a.y); await p.mouse.up(); await p.waitForTimeout(150); }
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ viewport: { width: 1180, height: 820 }, deviceScaleFactor: 2 }); watch(c); await routes(c);
  const p = await c.newPage();
  await p.goto(U + "music-studio.html"); await p.waitForTimeout(700);
  await p.evaluate(`(async()=>{ const add=${TAKE}; await add(1, ${JSON.stringify(NOTES)}); })()`);
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
  await put(p, "Guitar take 1", 0);
  const look = await p.evaluate(() => { const cv=document.getElementById("waveC"), x=cv.getContext("2d"), d=x.getImageData(0,0,cv.width,cv.height).data;
    let lit=0; for(let i=0;i<d.length;i+=4) if(d[i]>200 && d[i+1]>150 && d[i+2]<160) lit++;
    return { svg: document.querySelectorAll("#timeline .st-lane")[0].querySelectorAll(".st-clip svg.wv path").length, w: cv.width, lit: lit,
      hint: cv.closest(".st-wave").querySelector(".st-line").textContent, aria: cv.getAttribute("aria-label") }; });
  ok(look.svg === 1 && look.w > 1000 && look.lit > 2000 && look.hint === "Tap the wave where you want to cut. Drag an edge to trim.", "the wave shows on the song and large in the panel: " + JSON.stringify(look));
  /* tap in bar 2, beat 3 (the 7th beat counted from 0 is 6) */
  const at = await waveXY(p, 6.1); await p.mouse.click(at.x, at.y); await p.waitForTimeout(100);
  const tap = await p.evaluate(() => ({ v: document.getElementById("cutSel").value, txt: document.querySelector("#cutSel option:checked").textContent, line: document.getElementById("editLine").textContent }));
  ok(tap.v === "6" && tap.txt === "Bar 2 · beat 3" && tap.line === "The cut goes at Bar 2 · beat 3. Press Cut here.", "a tap on the wave puts the cut there: " + JSON.stringify(tap));
  await act(p, "cut");
  ok(await p.evaluate(() => __aogStudio.pcs(__aogStudio.SONG.tracks[0].clip).map(q => [q.a, q.b].join()).join(" / ")) === "0,6 / 6,16", "Cut here cuts where the wave was tapped");
  await act(p, "undo");
  /* drag the right edge one bar in: bar 4 is gone */
  await drag(p, 16, 12);
  let r = await mixBars(p, 4);
  const tr = await p.evaluate(() => ({ P: __aogStudio.pcs(__aogStudio.SONG.tracks[0].clip).map(q => [q.a, q.b].join()).join(" / "), line: document.getElementById("editLine").textContent }));
  ok(tr.P === "0,12" && tr.line === "Trimmed." && shape(r, [220, 330, 440, 0]), "drag the right edge a bar in: " + JSON.stringify(tr) + " · " + say(r));
  /* drag the left edge one bar in: it now starts with the second note */
  await drag(p, 0, 4);
  r = await mixBars(p, 3);
  ok(await p.evaluate(() => __aogStudio.pcs(__aogStudio.SONG.tracks[0].clip).map(q => [q.a, q.b].join()).join(" / ")) === "4,12", "drag the left edge a bar in");
  await act(p, "undo"); await act(p, "undo");
  ok(await p.evaluate(() => __aogStudio.pcs(__aogStudio.SONG.tracks[0].clip).map(q => [q.a, q.b].join()).join(" / ")) === "0,16", "Undo takes both trims back");
  /* a phone and an iPad, light and dark: calm and readable */
  for (const [nm, vp, mob] of [["iPhone", { width: 390, height: 844 }, true], ["iPad", { width: 1024, height: 1366 }, true]]) {
    for (const th of ["light", "dark"]) {
      const q = await (await b.newContext({ viewport: vp, isMobile: mob, hasTouch: mob, colorScheme: th })).newPage(); await routes(q.context()); watch(q.context());
      await q.goto(U + "music-studio.html"); await q.waitForTimeout(700);
      await q.evaluate(`(async()=>{ const add=${TAKE}; await add(1, ${JSON.stringify(NOTES)}); })()`);
      await q.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
      await put(q, "Guitar take 1", 0);
      const bad = await q.evaluate(`(${PROBE})()`), calm = await q.evaluate(`(${CALM})()`);
      const side = await q.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      ok(!bad.length && !calm.length && !side, `${nm} ${th}: readable, calm, nothing sideways ` + JSON.stringify(bad.concat(calm)).slice(0, 300));
      if (th === "light") { await q.evaluate(() => document.getElementById("waveC").scrollIntoView({ block: "center" })); await q.screenshot({ path: path.join(__dirname, "..", "studiowaves-" + nm.toLowerCase() + ".png") }); }
      await q.context().close();
    }
  }
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await b.close(); srv.close(); console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0);
})();
