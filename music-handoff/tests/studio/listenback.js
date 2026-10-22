/* AOG-LISTENBACK-V1 (2026-10-22) — the payoff moment: ▶ Listen back plays My Track on the whole screen with the song's
   title and the artist's name, like a real release, and Share it sends it to friends (aog-listenback.js, the-studio.html).
   · nothing on My Track: ▶ Listen back says what to do first, and opens nothing;
   · a Drum Machine loop on My Track: from My Track's sheet, Listen back opens over the room; the first time it asks the artist
     name (and the song's title, which goes to the Mixing Desk); after that it is remembered and not asked again;
   · it shows the title, "by <artist>", the key and tempo; it plays by itself, and the bar and the time move only while it
     plays; Pause stops them and the sound rests; Play goes on from there;
   · Share it makes a levelled .wav (audio/wav, more than a header, named after the title) and hands it to the share sheet
     with "<title> by <artist> — made in the Recording Studio at architectureofgrace.com"; with no share sheet, a download;
   · Back to the studio closes it, the sound rests, and the room is where you left it; Escape closes it too;
   · readable and calm while open, nothing sideways, every button 44 px or more and on the screen;
   · + Add to My Track offers ▶ Listen back on the line beside "Added to My Track.";
   · an iPhone in Spanish, an iPad in English, a phone on its side; no page errors. Port 9627. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy"), PORT = 9627, srv = require("../srv.js")(PORT);
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const W = ms => new Promise(r => setTimeout(r, ms));
async function setup(b, o, lang) {
  const ctx = await b.newContext({ ...o, serviceWorkers: "block", acceptDownloads: true }); const errs = [];
  ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  await ctx.addInitScript(l => { try { if (!sessionStorage.getItem("t")) { localStorage.clear(); sessionStorage.setItem("t", "1"); } localStorage.setItem("aog.lang", l); } catch (e) {} }, lang);
  return { ctx, errs };
}
async function loop(p) {   /* a Drum Machine loop on My Track, in one tap (AOG-PADS-LOOP-ADD-V1) */
  await p.evaluate(() => AOGStudioShell.go("pads")); await W(3500);
  const f = p.frames().find(x => /music-pads/.test(x.url()));
  await f.waitForFunction(() => document.querySelectorAll("#grpSel option").length > 3, null, { timeout: 30000 });
  await f.evaluate(async () => { startBeat("boombap"); document.getElementById("bounceBtn").click();
    for (let i = 0; i < 160; i++) { const r = await AOGHandoff.list(AOGHandoff.INBOX); if (r && r.items && r.items.some(x => x.from === "pads" && x.sec > 0)) break; await new Promise(r => setTimeout(r, 250)); }
    try { stopBeat && stopBeat(); } catch (e) {} });
  await W(1500);
}
const st = p => p.evaluate(() => window.AOGListenBack ? AOGListenBack.state() : null);
const view = p => p.evaluate(() => { const d = document.getElementById("lbDlg"), g = id => document.getElementById(id), vis = e => !!(e && e.getClientRects().length && getComputedStyle(e).visibility !== "hidden");
  const R = e => e.getBoundingClientRect(), inV = e => { const r = R(e); return r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1; };
  const bt = d ? [...d.querySelectorAll("button, input")].filter(vis) : [];
  return d ? { open: d.open, ask: vis(g("lbAsk")), title: g("lbTitle").textContent, by: vis(g("lbBy")) ? g("lbBy").textContent : "", small: g("lbSmall").textContent,
    play: g("lbPlay").textContent, line: g("lbLine").textContent, pos: +g("lbPos").value, clock: g("lbClock").textContent, cover: vis(g("lbCover")) && R(g("lbCover")).width > 100,
    allIn: bt.every(inV) && inV(g("lbCover")), min: Math.min(...bt.filter(x => x.type !== "range").map(x => Math.round(R(x).height))), side: d.scrollWidth <= d.clientWidth + 1,
    fits: d.scrollHeight <= d.clientHeight + 1, focus: document.activeElement && document.activeElement.id } : null; });
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  for (const [nm, o, lang] of [["iPhone", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, "es"], ["iPad", { viewport: { width: 1180, height: 820 }, hasTouch: true }, "en"]]) {
    const { ctx, errs } = await setup(b, o, lang), es = lang === "es";
    const p = await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#piano`); await W(4000);
    const sheet = async () => { if (await p.evaluate(() => !!document.getElementById("mtOpen").offsetParent && !document.getElementById("mtRow").offsetParent)) await p.click("#mtOpen"); await W(200); };
    /* nothing on My Track */
    await sheet();
    ok(await p.evaluate(e => document.getElementById("mtLb").textContent === (e ? "▶ Escúchala" : "▶ Listen back") && !!document.getElementById("mtLb").offsetParent, es), `${nm}: ▶ Listen back sits on My Track${es ? " (▶ Escúchala)" : ""}`);
    await p.click("#mtLb"); await W(800);
    let line = await p.textContent("#tpLine");
    ok(/Nothing to hear yet|Todavía no hay nada/.test(line) && !(await p.evaluate(() => { const d = document.getElementById("lbDlg"); return !!(d && d.open); })), `${nm}: with nothing on My Track it says what to do first, and opens nothing: "${line}"`);
    /* a loop on My Track, then back to the Piano */
    await loop(p);
    await p.evaluate(() => AOGStudioShell.go("piano")); await W(3500);
    const where0 = await p.evaluate(() => ({ hash: location.hash, file: document.getElementById("room").getAttribute("data-file"), src: document.getElementById("room").src }));
    await sheet(); await p.click("#mtLb");
    await p.waitForFunction(() => { const d = document.getElementById("lbDlg"); return d && d.open; }, null, { timeout: 15000 });
    let v = await view(p);
    ok(v.open && v.ask && v.focus === "lbArtist", `${nm}: the first time, it asks the artist name first: ${JSON.stringify({ ask: v.ask, focus: v.focus })}`);
    await p.fill("#lbArtist", "DJ Theo"); await p.fill("#lbName", "Night Drive"); await p.click("#lbDone");
    await p.waitForFunction(() => AOGListenBack.state().on, null, { timeout: 30000 }).catch(() => {});
    await W(400);
    v = await view(p); let s = await st(p);
    ok(!v.ask && v.title === "Night Drive" && v.by === (es ? "de DJ Theo" : "by DJ Theo") && (es ? /pulsos por minuto/ : /beats a minute/).test(v.small) && v.cover,
      `${nm}: it shows the title, the artist and the key and tempo, with a cover: ${JSON.stringify({ t: v.title, by: v.by, small: v.small, cover: v.cover })}`);
    ok(await p.evaluate(() => { const f = [...document.querySelectorAll("iframe.sh-room")].find(x => x.getAttribute("data-file") === "/music-studio.html"); return f && f.contentWindow.__aogStudio.SONG.name; }) === "Night Drive",
      `${nm}: the title went to the Mixing Desk's song name`);
    ok(await p.evaluate(() => localStorage.getItem("aog.studio.artist.v1")) === "DJ Theo", `${nm}: the artist name is kept on the device`);
    const a1 = await st(p), v1 = await view(p); await W(1500); const a2 = await st(p), v2 = await view(p);
    ok(a1.on && a1.ac === "running" && a2.pos > a1.pos + 0.8 && v2.pos > v1.pos && a1.raf, `${nm}: it plays by itself, and the bar and time move: ${a1.pos.toFixed(2)} → ${a2.pos.toFixed(2)} s, bar ${v1.pos} → ${v2.pos}, "${v2.clock}"`);
    await p.click("#lbPlay"); await W(500);
    const b1 = await st(p); await W(1000); const b2 = await st(p), vb = await view(p);
    ok(!b1.on && Math.abs(b2.pos - b1.pos) < 0.01 && b2.ac === "suspended" && !b2.raf && vb.play === (es ? "▶ Tocar" : "▶ Play"), `${nm}: Pause stops it, the bar stays still and the sound rests: ${JSON.stringify({ pos: b2.pos, ac: b2.ac, raf: b2.raf, play: vb.play })}`);
    await p.click("#lbPlay"); await W(1200); const c1 = await st(p);
    ok(c1.on && c1.pos > b2.pos + 0.5, `${nm}: Play goes on from there: ${b2.pos.toFixed(2)} → ${c1.pos.toFixed(2)} s`);
    /* readable, calm, fits */
    const pc = await p.evaluate(`(${PROBE})()`), pk = await p.evaluate(`(${CALM})()`); v = await view(p);
    ok(!pc.length && !pk.length && v.allIn && v.min >= 44 && v.side, `${nm}: readable (${pc.length} ${JSON.stringify(pc.slice(0, 2))}), calm (${pk.join("; ") || "ok"}), on the screen, 44 px keys (${v.min}), nothing sideways`);
    await p.screenshot({ path: path.join(process.env.AOG_SHOTS || require("os").tmpdir(), `listenback-${nm.toLowerCase()}.png`) });
    /* Share it: the share sheet gets the .wav and the message */
    await p.evaluate(() => { window.__shared = null; navigator.share = async d => { const f = d.files[0], h = new Uint8Array(await f.slice(0, 12).arrayBuffer());
      window.__shared = { name: f.name, type: f.type, size: f.size, head: String.fromCharCode(...h.slice(0, 4)) + String.fromCharCode(...h.slice(8, 12)), text: d.text, title: d.title }; }; navigator.canShare = () => true; });
    await p.click("#lbShare");
    await p.waitForFunction(() => !!window.__shared, null, { timeout: 30000 }).catch(() => {});
    const sh = await p.evaluate(() => window.__shared);
    const msg = es ? "Night Drive, de DJ Theo — hecha en el estudio de grabación de architectureofgrace.com" : "Night Drive by DJ Theo — made in the Recording Studio at architectureofgrace.com";
    ok(sh && sh.type === "audio/wav" && sh.size > 44 && sh.head === "RIFFWAVE" && sh.name === "night-drive.wav" && sh.text === msg && sh.title === "Night Drive",
      `${nm}: Share it hands the share sheet a .wav of the song and the message: ${JSON.stringify(sh)}`);
    /* no share sheet: a download */
    await p.evaluate(() => { try { delete Navigator.prototype.share; } catch (e) {} navigator.share = undefined; navigator.canShare = undefined; });
    const dl = p.waitForEvent("download", { timeout: 20000 }).catch(() => null);
    await p.click("#lbShare"); const d = await dl; await W(300);
    line = (await view(p)).line;
    ok(d && d.suggestedFilename() === "night-drive.wav" && /night-drive\.wav/.test(line), `${nm}: with no share sheet, the file downloads: ${d && d.suggestedFilename()} "${line}"`);
    /* Back to the studio */
    await p.click("#lbBack"); await W(500);
    const where1 = await p.evaluate(() => ({ hash: location.hash, file: document.getElementById("room").getAttribute("data-file"), src: document.getElementById("room").src }));
    s = await st(p);
    ok(!s.open && !s.on && s.ac === "suspended" && JSON.stringify(where0) === JSON.stringify(where1) && !(await p.evaluate(() => document.getElementById("lbDlg").open)),
      `${nm}: Back to the studio closes it, the sound rests, and the room is where you left it: ${JSON.stringify(where1)}`);
    /* again: not asked twice; Escape closes */
    await sheet(); await p.click("#mtLb"); await W(800); v = await view(p);
    ok(v.open && !v.ask && v.by === (es ? "de DJ Theo" : "by DJ Theo"), `${nm}: opened again, the artist name is remembered and not asked again`);
    await p.waitForFunction(() => AOGListenBack.state().on, null, { timeout: 30000 }).catch(() => {});
    await p.keyboard.press("Escape"); await W(500); s = await st(p);
    ok(!s.open && !s.on && !(await p.evaluate(() => document.getElementById("lbDlg").open)), `${nm}: Escape closes it`);
    /* + Add to My Track offers it on the line (iPad: the bar's Record in the Drum Machine) */
    if (nm === "iPad") {
      await p.evaluate(() => AOGStudioShell.go("pads")); await W(3000);
      const f = p.frames().find(x => /music-pads/.test(x.url()));
      await f.evaluate(() => { if (!SEQ.on) document.getElementById("playBtn").click(); }); await W(800);   /* the beat plays (as studio/arrive.js) */
      await p.click("#tpRec"); await W(3000); await p.click("#tpRec");
      await p.waitForFunction(() => !document.getElementById("tpAdd").hidden, null, { timeout: 15000 }).catch(() => {});
      await f.evaluate(() => { if (SEQ.on) document.getElementById("playBtn").click(); });
      await p.click("#tpAdd").catch(() => {});
      await p.waitForFunction(() => /Added to My Track/.test(document.getElementById("tpLine").textContent), null, { timeout: 15000 }).catch(() => {});
      const hint = await p.evaluate(() => { const g = document.getElementById("tpLbGo"), r = g.getBoundingClientRect(); return { t: g.textContent, vis: !g.hidden && r.height >= 44, line: document.getElementById("tpLine").textContent }; });
      ok(hint.vis && hint.t === "▶ Listen back", `${nm}: after + Add to My Track, ▶ Listen back sits on the line: ${JSON.stringify(hint)}`);
      if (hint.vis) { await p.click("#tpLbGo"); await W(800); ok((await view(p)).open, `${nm}: and opens Listen back`); await p.click("#lbBack"); await W(300); }
    }
    ok(errs.length === 0, `${nm}: no page errors ` + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  /* a phone on its side */
  { const { ctx, errs } = await setup(b, { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }, "en");
    const p = await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#piano`); await W(4000);
    await loop(p); await p.evaluate(() => AOGStudioShell.go("piano")); await W(3000);
    await p.evaluate(() => AOGStudioShell.listenBack());
    await p.waitForFunction(() => { const d = document.getElementById("lbDlg"); return d && d.open; }, null, { timeout: 15000 });
    let v = await view(p);
    ok(v.ask && v.allIn && v.fits && v.min >= 44, `a phone on its side: the artist name fits on the screen: ${JSON.stringify({ ask: v.ask, allIn: v.allIn, fits: v.fits, min: v.min })}`);
    await p.fill("#lbArtist", "Ava"); await p.press("#lbArtist", "Enter"); await p.press("#lbName", "Enter");
    await p.waitForFunction(() => AOGListenBack.state().on, null, { timeout: 30000 }).catch(() => {});
    v = await view(p); const pc = await p.evaluate(`(${PROBE})()`);
    ok(!v.ask && v.title === "My song" && v.by === "by Ava" && v.allIn && v.fits && v.side && v.min >= 44 && !pc.length && (await st(p)).on,
      `a phone on its side: the cover beside the words, all on the screen, readable, playing: ${JSON.stringify({ title: v.title, by: v.by, allIn: v.allIn, fits: v.fits, min: v.min, pc: pc.slice(0, 2) })}`);
    await p.screenshot({ path: path.join(process.env.AOG_SHOTS || require("os").tmpdir(), "listenback-sideways.png") });
    await p.click("#lbBack"); await W(300);
    ok(errs.length === 0, "a phone on its side: no page errors " + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
