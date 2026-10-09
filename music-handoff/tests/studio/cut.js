/* AOG-STUDIO-CUT-V2 + AOG-DESK-SLIP-V2 + AOG-DESK-REST-V1 — Jimmy: "The lesson sheet needs to move and The cutting needs
   to be better and the whole studio has not reached the ceiling!!!" The Studio a dim control room (AOG-STUDIO-ROOM-V1). Two VU meters over the mixer and walnut cheeks on the console (AOG-DESK-VU-V1, AOG-DESK-WOOD-V1); a tape counter and a glowing playhead (AOG-DESK-COUNTER-V1, AOG-DESK-GLOW-V1). A tap on the big wave puts ✂ Cut here on the wave and
   pressing it cuts there; a tap on another piece picks that piece; ▶ Hear this piece plays the piece and stops; the lesson
   is a note beside play (at the foot of the console on a phone); the menus are dark with gold type. Spanish; an iPhone and
   an iPad: readable, calm, nothing sideways. No page errors. Port 9259. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9259, U = "http://localhost:" + PORT + "/";
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
async function put(p, take, track) {
  await p.selectOption("#trackSel", String(track));
  const v = await p.evaluate(nm => [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === nm).value, take);
  await p.selectOption("#srcSel", v); await p.click("#putBtn");
  await p.waitForFunction(t => __aogStudio.SONG.tracks[t].clip && !__aogStudio.S.busy, track, { timeout: 15000 });
}
/* tap the big wave at a share of its width */
async function tapWave(p, f) { const bb = await (await p.$("#waveC")).boundingBox(); await p.mouse.click(bb.x + 10 + (bb.width - 20) * f, bb.y + bb.height * 0.6); await p.waitForTimeout(250); }
const pieces = p => p.evaluate(() => __aogStudio.pcs(__aogStudio.SONG.tracks[0].clip).map(q => q.a + "-" + q.b).join(" "));

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage();
  await p.goto(U + "music-studio.html"); await p.waitForTimeout(700);
  await p.evaluate(`(async()=>{ const add=${TAKE}; await add(1, ${JSON.stringify(NOTES)}); })()`);
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
  await put(p, "Guitar take 1", 0);

  /* the lesson is a note in the console's corner, beside play */
  const slip = await p.evaluate(() => { const s = document.getElementById("slipBox"); return { inTop: !!s.closest("#transport .st-top"), shown: !document.getElementById("slip").hidden }; });
  ok(slip.inTop && slip.shown, "on a computer the lesson slip sits beside play, inside the console: " + JSON.stringify(slip));
  /* the menus are dark windows with gold type */
  const sel = await p.evaluate(() => { const cs = getComputedStyle(document.getElementById("trackSel")); return cs.backgroundColor + " " + cs.color; });
  ok(/rgb\(18, 19, 22\) rgb\(246, 227, 180\)/.test(sel), "the desk's menus are dark with gold type: " + sel);

  /* a tap on the wave puts ✂ Cut here on the wave; pressing it cuts there */
  ok(await p.evaluate(() => document.getElementById("cutNow").hidden), "before a tap there is no Cut here on the wave");
  await tapWave(p, 0.8);
  const tip = await p.evaluate(() => { const b = document.getElementById("cutNow"); return { shown: !b.hidden, text: b.textContent, at: document.getElementById("cutSel").value, left: parseFloat(b.style.left), w: document.getElementById("waveC").getBoundingClientRect().width }; });
  ok(tip.shown && /Cut here/.test(tip.text) && tip.at === "13" && tip.left > tip.w * 0.7, "a tap at 80% shows ✂ Cut here on the wave, at bar 4 · beat 2: " + JSON.stringify(tip));
  await p.click("#cutNow"); await p.waitForTimeout(300);
  ok(await pieces(p) === "0-13 13-16" && await p.evaluate(() => document.getElementById("cutNow").hidden), "pressing it cuts there: " + await pieces(p));

  /* a tap on another piece picks it */
  ok(await p.evaluate(() => document.getElementById("pieceSel").value) === "1", "the new second piece is picked");
  await tapWave(p, 0.2);
  const pick = await p.evaluate(() => ({ v: document.getElementById("pieceSel").value, line: document.getElementById("editLine").textContent, cut: !document.getElementById("cutNow").hidden }));
  ok(pick.v === "0" && /Piece 1 is picked/.test(pick.line) && !pick.cut, "a tap on piece 1 picks it, and no cut is offered: " + JSON.stringify(pick));
  await tapWave(p, 0.2);
  ok(await p.evaluate(() => !document.getElementById("cutNow").hidden), "a second tap, inside the picked piece, offers a cut");

  /* ▶ Hear this piece plays the piece once, and stops */
  const h0 = await p.evaluate(() => { const b = document.querySelector('#clipBox [data-act="hear"]'); return b && b.textContent; });
  await p.click('#clipBox [data-act="hear"]'); await p.waitForTimeout(300);
  const h1 = await p.evaluate(() => { const b = document.querySelector('#clipBox [data-act="hear"]'); return [b.textContent, b.getAttribute("aria-pressed")]; });
  await p.click('#clipBox [data-act="hear"]'); await p.waitForTimeout(200);
  const h2 = await p.evaluate(() => { const b = document.querySelector('#clipBox [data-act="hear"]'); return [b.textContent, b.getAttribute("aria-pressed")]; });
  ok(/Hear this piece/.test(h0) && h1[1] === "true" && h2[1] === "false" && /Hear this piece/.test(h2[0]), `▶ Hear this piece plays and stops: ${h0} → ${h1.join(" ")} → ${h2.join(" ")}`);

  /* AOG-DESK-VU-V1: two VU meters over the mixer; the needles swing while the song plays and rest when it stops */
  const vuShot = () => p.evaluate(() => { const a = document.getElementById("vuL"), b = document.getElementById("vuR"); return a.toDataURL().length + ":" + a.toDataURL().slice(-200) + "|" + b.toDataURL().slice(-200); });
  const vuBox = await p.evaluate(() => { const v = document.getElementById("vuBridge"), r = v.getBoundingClientRect(), f = document.getElementById("chFaders").getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), over: r.bottom <= f.top + 2 && r.left >= f.left - 2, aria: v.getAttribute("aria-label") }; });
  ok(vuBox.w > 200 && vuBox.h > 50 && vuBox.over && vuBox.aria === "How loud the song is", "the meter bridge sits over the mixer: " + JSON.stringify(vuBox));
  const rest = await vuShot();
  await p.click("#playBtn"); await p.waitForTimeout(1500);
  const live = await vuShot();
  await p.click("#playBtn"); await p.waitForTimeout(400);
  const back = await vuShot();
  ok(live !== rest && back === rest, `the needles swing while the song plays (${live !== rest}) and rest when it stops (${back === rest})`);
  /* AOG-DESK-COUNTER-V1 + AOG-DESK-GLOW-V1: the tape counter reads what the words say; the playhead glows while playing */
  const ctr = () => p.evaluate(() => ({ d: [...document.querySelectorAll("#ctr .st-cs")].map(e => { const m = /translateY\((-?[\d.]+)em\)/.exec(e.style.transform || ""); return m ? Math.round(-parseFloat(m[1])) % 10 : 0; }).join(""),
    words: document.getElementById("posOut").textContent, live: document.getElementById("timeline").classList.contains("ph-live"), lab: document.getElementById("ctrLab").hidden ? "" : document.getElementById("ctrLab").textContent }));
  const said = w => { const m = /Bar (\d+) · beat (\d) · (\d+):(\d\d)/.exec(w); return m ? String(m[1]).padStart(3, "0") + m[2] + String(m[3]).padStart(2, "0") + m[4] : "?"; };
  let k0 = await ctr();
  ok(k0.d === said(k0.words) && !k0.live, `stopped, the counter reads ${k0.d} as the words say (${k0.words}), and the playhead is plain`);
  await p.click("#playBtn"); await p.waitForTimeout(1700);
  const k1 = await ctr();
  ok(k1.d === said(k1.words) && k1.d !== k0.d && k1.live, `playing, the counter rolls with the song (${k1.d} = ${k1.words}) and the playhead glows`);
  await p.click("#playBtn"); await p.waitForTimeout(400);
  ok(!(await ctr()).live, "stopped again, the glow goes out");
  await p.evaluate(() => document.getElementById("countBtn").click()); await p.click("#playBtn"); await p.waitForTimeout(250);
  const k2 = await ctr();
  ok(/^Get ready… \d$/.test(k2.lab), "during the count-in the counter says so: " + k2.lab);
  await p.click("#playBtn"); await p.evaluate(() => document.getElementById("countBtn").click()); await p.waitForTimeout(300);
  ok((await ctr()).lab === "", "after it, the words go away");
  /* walnut cheeks on both sides of the console */
  const wood = await p.evaluate(() => { const c = document.querySelector(".st-cp"); return [getComputedStyle(c, "::before").width, getComputedStyle(c, "::after").width, getComputedStyle(c, "::before").backgroundColor].join(" "); });
  ok(/^16px 16px rgb\(74, 44, 23\)$/.test(wood), "walnut cheeks on the console: " + wood);

  /* Spanish */
  await p.evaluate(() => { const b = document.getElementById("langBtn"); if (b) b.click(); }); await p.waitForTimeout(500);
  ok(/Escuchar esta parte/.test(await p.textContent('#clipBox [data-act="hear"]')), "in Spanish: " + await p.textContent('#clipBox [data-act="hear"]'));
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();

  /* an iPhone: the slip at the foot of the console; nothing sideways */
  for (const [dev, theme] of [["iPhone 13", "light"], ["iPhone 13", "dark"], ["iPad (gen 7)", "light"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(1500);
    const r = await m.evaluate(() => { const s = document.getElementById("slipBox"), cp = document.querySelector(".st-desk .st-cp"); return { foot: s.parentNode === cp && s === cp.lastElementChild, top: !!s.closest(".st-top"), sw: document.scrollingElement.scrollWidth <= innerWidth + 1 }; });
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    const want = dev.startsWith("iPhone") ? r.foot : r.top;
    ok(want && r.sw && !pc.length && !pk.length, `${dev}, ${theme}: the slip is ${dev.startsWith("iPhone") ? "at the foot of the console" : "beside play"}, nothing sideways, readable (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and calm (${pk.join("; ") || "ok"})`);
    await cx.close();
  }
  /* AOG-STUDIO-ROOM-V1: the Recording Studio is a dim control room; everything in it, and the desk inside it, stays readable */
  for (const [dev, theme] of [["iPad (gen 7) landscape", "light"], ["iPad (gen 7) landscape", "dark"], ["iPhone 13", "light"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
    await cx.addInitScript(th => { try { localStorage.setItem("aog.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U + "the-studio#studio");
    await m.waitForFunction(() => { const d = document.getElementById("room").contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && /studio/.test(d.location.pathname); }, null, { timeout: 20000 });
    await m.waitForTimeout(1500);
    const f = m.frames().find(x => x.parentFrame() === m.mainFrame());
    const room = await m.evaluate(() => getComputedStyle(document.body).backgroundColor), desk = await f.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const pc = await m.evaluate(`(${PROBE})()`), fc = await f.evaluate(`(${PROBE})()`), fk = await f.evaluate(`(${CALM})()`);
    ok(room === "rgb(23, 17, 12)" && desk === "rgb(23, 17, 12)" && !pc.length && !fc.length && !fk.length,
      `${dev}, ${theme}: the Studio is a dim room (${room}), the desk sits in it (${desk}), all readable (${pc.length + fc.length} ${JSON.stringify(pc.concat(fc).slice(0, 2))}) and calm (${fk.join("; ") || "ok"})`);
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the phone " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
