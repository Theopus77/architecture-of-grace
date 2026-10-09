/* AOG-CHOPS-TO-PADS-V1 — STUDIO-HANDOFF §9, Jimmy: "I cut this from my record. Put it on the pads." A record of his own
   ("my-record.wav", 120 beats a minute, every beat its own note) on deck A, the needle in bar 3. Chops to the Drum Machine
   sends 16 beats from the start of bar 3 into the Mixing Desk's list, named "my-record · chops", and says so with a link.
   The Drum Machine opens with the chops bank in front, named after the record; its 16 pads are beats 9 to 24 of the
   record, one beat each, and a pad plays. A record with no known tempo sends 8 seconds, cut in 16 equal parts; too
   close to the end says so plainly. Nothing leaves the computer (every outside address is refused). In the Studio: the
   link changes the room to the Drum Machine, and My Track marks the Turntables. Spanish; an iPhone, light and dark:
   nothing sideways, readable and calm; no page errors. Port 9250. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9250, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [], outside = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
async function routes(ctx) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => { if (r.request().method() !== "GET") outside.push(r.request().method() + " " + r.request().url()); r.abort(); });
  const R = { "drum-machine": "music-pads.html", "the-studio": "the-studio.html", turntables: "music-decks.html" };
  await ctx.route(/\/(drum-machine|the-studio|turntables)(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, R[new URL(r.request().url()).pathname.slice(1)]), contentType: "text/html" }));
}
/* a record: 120 beats a minute (0.5 s a beat), 16 bars, beat k a steady note of 200 + 20·k Hz */
const RECORD = `(async (name, bpm) => { const sr = 44100, beat = 60 / 120, n = Math.round(64 * beat * sr), ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab);
  const w = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + n * 4, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 4, true);
  let ph = 0; for (let i = 0; i < n; i++) { const k = Math.floor(i / sr / beat); ph += 2 * Math.PI * (200 + 20 * k) / sr; const x = Math.round(9000 * Math.sin(ph)); v.setInt16(44 + i * 4, x, true); v.setInt16(46 + i * 4, x, true); }
  return new File([ab], name, { type: "audio/wav" }); })`;
async function putRecord(p, deck, name, bpm, atSec) {
  await p.evaluate(async ([src, deck, name, bpm, atSec]) => {
    const f = await (0, eval)(src)(name, bpm), d = decks.find(x => x.id === deck);
    await loadFile(d, f);
    await new Promise(r => { const t0 = Date.now(), k = setInterval(() => { if (d.bpm !== -1 || Date.now() - t0 > 8000) { clearInterval(k); r(); } }, 50); });
    d.bpm = bpm; d.beat0 = 0; d.pos = d.cue = Math.round(atSec * d.buf.sampleRate); send(d, { t: "seek", v: d.pos, park: true });
    await new Promise(r => setTimeout(r, 300));
  }, [RECORD, deck, name, bpm, atSec]);
}

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage(); await p.goto(U + "turntables"); await p.waitForTimeout(1500);

  /* 1 · deck A: my-record.wav, the needle in bar 3 (4.7 s) */
  ok(await p.textContent('[data-chopsend="A"]') === "Chops to the Drum Machine", "each deck has Chops to the Drum Machine beside its pads");
  await putRecord(p, "A", "my-record.wav", 120, 4.7);
  await p.click('[data-chopsend="A"]');
  await p.waitForFunction(() => document.getElementById("chopLineA").textContent.length > 5, null, { timeout: 10000 });
  const ln = await p.evaluate(() => { const el = document.getElementById("chopLineA"), a = el.querySelector("a"); return { text: el.textContent.trim(), href: a && a.getAttribute("href") }; });
  ok(ln.text === "16 chops from my-record are on the Drum Machine's pads. Open the Drum Machine" && ln.href === "/drum-machine", "the line: " + JSON.stringify(ln));
  const inbox = await p.evaluate(async () => { const r = await AOGHandoff.list(AOGHandoff.INBOX), x = r.items[0], s = await AOGHandoff.get("padstake"); return { from: x.from, name: x.name, bpm: x.bpm, sec: x.sec, note: s && s.id === x.id && s.from }; });
  ok(inbox.from === "decks" && inbox.name.en === "my-record · chops" && inbox.name.es === "my-record · cortes" && inbox.bpm === 120 && Math.abs(inbox.sec - 8.02) < 0.01 && inbox.note === "decks",
    "it goes the way every take goes (the Mixing Desk's list and a note for the Drum Machine): " + JSON.stringify(inbox));

  /* 2 · the Drum Machine: the chops bank in front, beats 9 to 24 of the record, a pad plays */
  await p.click("#chopLineA a"); await p.waitForURL(/drum-machine/); await p.waitForTimeout(1800);
  const dm = await p.evaluate(() => { const B = S.banks[S.bank]; return { type: B.type, rec: B.rec, bank: "ABCD"[S.bank], line: (document.getElementById("inLine") || {}).textContent || "",
    names: [...document.querySelectorAll(".pads button.pad .pn")].map(x => x.textContent) }; });
  ok(dm.type === "chops" && /^t:/.test(dm.rec) && dm.line === "16 chops from my-record are on bank " + dm.bank + ", one beat a pad." && dm.names.length === 16,
    "the Drum Machine opens on the chops bank, named after the record: " + JSON.stringify(dm));
  const hz = await p.evaluate(async () => { const B = S.banks[S.bank], buf = await recBuf(B.rec), ch = chopsOf(B, buf), d = buf.getChannelData(0), sr = buf.sampleRate;
    return ch.map(([a, len]) => { const i0 = Math.floor((a + len * 0.2) * sr), i1 = Math.floor((a + len * 0.8) * sr); let up = 0; for (let i = i0 + 1; i < i1; i++) if (d[i - 1] < 0 && d[i] >= 0) up++; return Math.round(up / ((i1 - i0) / sr) / 20) * 20; }); });
  const want = Array.from({ length: 16 }, (_, i) => 200 + 20 * (8 + i));
  ok(hz.length === 16 && hz.every((h, i) => Math.abs(h - want[i]) <= 20), "pad by pad, the chops are beats 9 to 24 of the record: " + hz.join(" "));
  const before = await p.evaluate(() => LT.chops.size);
  await p.click('.pads button.pad[data-p="0"]'); await p.click('.pads button.pad[data-p="5"]'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => LT.chops.size) === before + 2, "pads 1 and 6 play their chops");

  /* 3 · a record with no known tempo: 8 seconds in 16 equal parts; too close to the end */
  await p.goto(U + "turntables"); await p.waitForTimeout(1500);
  await putRecord(p, "B", "no-tempo.wav", 0, 10);
  await p.click('[data-chopsend="B"]');
  await p.waitForFunction(() => /16 chops/.test(document.getElementById("chopLineB").textContent), null, { timeout: 10000 });
  const nt = await p.evaluate(async () => { const x = (await AOGHandoff.list(AOGHandoff.INBOX)).items[0]; return { bpm: x.bpm, sec: x.sec, name: x.name.en }; });
  ok(nt.bpm === 0 && Math.abs(nt.sec - 8) < 0.01 && nt.name === "no-tempo · chops", "no known tempo: 8 seconds, cut in 16 equal parts on the pads: " + JSON.stringify(nt));
  await putRecord(p, "C", "short.wav", 120, 30.5);
  if (await p.$('[data-pair="AC"]') && await p.isVisible('[data-pair="AC"]')) await p.click('[data-pair="AC"]');   /* deck C shows beside A */
  await p.click('[data-chopsend="C"]'); await p.waitForTimeout(400);
  ok(await p.textContent("#chopLineC") === "Too close to the end of the record. Move back a little and try again.", "too close to the end is told plainly");
  ok(outside.length === 0, "nothing left the computer " + outside.join(" | "));
  await c.close();

  /* 4 · in the Studio: the link changes the room; My Track marks the Turntables */
  const st = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(st); await routes(st);
  const q = await st.newPage(); await q.goto(U + "the-studio#decks");
  await q.waitForFunction(() => { const d = document.getElementById("room").contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && /music-decks/.test(d.location.pathname); }, null, { timeout: 20000 });
  await q.waitForTimeout(1500);
  const f = q.frames().find(x => x.parentFrame() === q.mainFrame());
  await putRecord(f, "A", "my-record.wav", 120, 4.7);
  await f.click('[data-chopsend="A"]');
  await q.waitForFunction(() => !!document.querySelector('#mtList .lay.on[data-layer="decks"]'), null, { timeout: 10000 });
  ok(true, "My Track marks the Turntables once the chops are sent");
  await f.click("#chopLineA a");
  await q.waitForFunction(() => { const d = document.getElementById("room").contentDocument; return location.hash === "#pads" && d && d.readyState === "complete" && /music-pads/.test(d.location.pathname); }, null, { timeout: 20000 });
  await q.waitForTimeout(1500);
  const f2 = q.frames().find(x => x.parentFrame() === q.mainFrame());
  ok(await f2.evaluate(() => S.banks[S.bank].type) === "chops", "in the Studio, Open the Drum Machine changes the room, the chops bank in front");
  await st.close();

  /* 5 · Spanish; an iPhone, light and dark */
  for (const theme of ["light", "dark"]) {
    const cx = await b.newContext({ ...pw.devices["iPhone 13"], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); if (th === "dark") localStorage.setItem("aog.lang", "es"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U + "turntables"); await m.waitForTimeout(1500);
    await putRecord(m, "A", "my-record.wav", 120, 4.7);
    await m.click('[data-chopsend="A"]'); await m.waitForFunction(() => document.getElementById("chopLineA").textContent.length > 5, null, { timeout: 10000 });
    await m.locator("#chopLineA").scrollIntoViewIfNeeded(); await m.waitForTimeout(200);
    const fit = await m.evaluate(() => { const r = el => el.getBoundingClientRect(), bt = document.querySelector('[data-chopsend="A"]'); return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, btn: Math.round(r(bt).height), right: Math.round(r(bt).right), label: bt.textContent, line: document.getElementById("chopLineA").textContent }; });
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    const es = theme === "dark";
    ok(fit.sw <= fit.iw && fit.right <= fit.iw && fit.btn >= 36 && !pc.length && !pk.length && (!es || (fit.label === "Cortes a la caja de ritmos" && fit.line.startsWith("16 cortes de my-record están en los pads de la caja de ritmos."))),
      `iPhone, ${theme}${es ? ", Spanish" : ""}: fits (${JSON.stringify(fit)}), reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await cx.close();
  }
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
