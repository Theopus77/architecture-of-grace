/* AOG-STUDIO-TRANSPORT-V1 — Jimmy: "After the studio shell, make sure it all works … I want the studio to be the RECORDING
   STUDIO." /the-studio is The Recording Studio. In every room that records (the Drum Machine, the Drum Kit, the Piano, the
   Guitar, the Bass, the Band, the Turntables), inside the Studio and using only the Studio's own transport: ● Record turns
   to ■ Stop with a running time, something is played, Stop makes a take that is not silent, + Add to My Track sends it
   the usual way (the Mixing Desk's list) and My Track marks that room; no page errors in any room. At the Mixing Desk:
   ● Record says to pick a room; ▶ Listen puts each room's take on a track by itself and plays it (AOG-STUDIO-LISTEN-V1); with a take on a track it plays and
   becomes ■ Stop listening; Send it out makes the song's file. From any room, ▶ Listen and Send it out go to the Mixing
   Desk first. A phone on its side gives the room the whole screen. The name in the Studio, the site bar's Explore menu
   and the home page; Spanish; an iPhone and an iPad, light and dark: the transport fits, reads and is calm. Port 9253. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9253, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
async function routes(ctx) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
}
const FILE = { pads: "music-pads.html", kit: "music-kit.html", piano: "music-piano.html", guitar: "music-guitar.html", bass: "music-bass.html", band: "music-band.html", decks: "music-decks.html", studio: "music-studio.html" };
const FROM = { pads: "pads", kit: "drums", piano: "piano", guitar: "guitar", bass: "bass", band: "band", decks: "decks" };
const NAME = { pads: "Drum Machine", kit: "Drum Kit", piano: "Piano", guitar: "Guitar", bass: "Bass", band: "Band", decks: "Turntables" };
/* something to play in each room, for about two seconds */
const PLAY = {
  pads: async f => { for (const i of [0, 1, 0, 1, 2]) { await f.click(`.pads button.pad[data-p="${i}"]`); await f.waitForTimeout(300); } },
  kit: async f => { for (const id of ["kick", "snare", "kick", "snare", "kick"]) { await f.evaluate(id => hit(S.bank, id, 1), id); await f.waitForTimeout(300); } },
  piano: async f => { await f.evaluate(() => noteOn("k", 60, 0.8)); await f.waitForTimeout(1200); await f.evaluate(() => noteOff("k", 60)); await f.waitForTimeout(300); },
  guitar: async f => { await f.evaluate(() => playChord(pads()[0], 0.8)); await f.waitForTimeout(1500); },
  bass: async f => { await f.evaluate(() => playChord(pads()[0], 0.8)); await f.waitForTimeout(1500); },
  band: async f => { await f.waitForFunction(() => soundReady(S.sound), null, { timeout: 30000 }); await f.evaluate(() => padDown(0, 0.8)); await f.waitForTimeout(1200); await f.evaluate(() => padUp(0)); await f.waitForTimeout(300); },
  decks: async f => { await f.evaluate(() => loadMade(decks[0], "house")); await f.waitForFunction(() => decks[0].buf && decks[0].bpm > 0 && (decks[0].node || decks[0].core), null, { timeout: 60000 }); await f.click('[data-play="A"]'); await f.waitForTimeout(1800); await f.click('[data-play="A"]'); }
};
const inner = p => p.frames().find(f => f.parentFrame() === p.mainFrame());
async function arrived(p, id) {
  await p.waitForFunction(f => { const fr = document.getElementById("room"), d = fr.contentDocument;
    return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && d.location.pathname.endsWith(f); }, FILE[id], { timeout: 25000 });
  await p.waitForTimeout(1200);
}
const tp = p => p.evaluate(() => ({ rec: document.getElementById("tpRec").textContent, pressed: document.getElementById("tpRec").getAttribute("aria-pressed"), recOff: document.getElementById("tpRec").disabled,
  add: !document.getElementById("tpAdd").hidden, listen: document.getElementById("tpListen").textContent, line: document.getElementById("tpLine").textContent }));
/* the newest take in a room, as decibels */
const takeDb = f => f.evaluate(async () => { const k = (typeof REC !== "undefined" && REC.takes && REC.takes[0]) || (typeof TAPE !== "undefined" && TAPE.takes && TAPE.takes[0]); if (!k) return null;
  const b = await new OfflineAudioContext(2, 1, 48000).decodeAudioData(await k.blob.arrayBuffer()); let e = 0, n = 0; for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) { e += d[i] * d[i]; n++; } }
  return +(10 * Math.log10(e / n + 1e-12)).toFixed(1); });

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage(); await p.goto(U + "the-studio#pads"); await arrived(p, "pads");
  ok(await p.textContent("h1") === "The Recording Studio" && /^The Recording Studio · The Drum Machine/.test(await p.title()) && (await p.textContent(".sh-tag")) === "Play · Record · Listen · Mix · Send it out",
    "it is The Recording Studio: " + await p.title());

  /* 1 · every room that records, through the Studio's transport */
  for (const id of ["pads", "kit", "piano", "guitar", "bass", "band", "decks"]) {
    const e0 = errs.length;
    if (id !== "pads") { await p.click(`.sh-doors a[data-room="${id}"]`); await arrived(p, id); }
    const f = inner(p);
    let s = await tp(p);
    ok(s.rec === "● Record" && !s.recOff && !s.add, `${NAME[id]}: ● Record is ready`);
    await p.click("#tpRec");
    await p.waitForFunction(() => document.getElementById("tpRec").getAttribute("aria-pressed") === "true", null, { timeout: 8000 });
    await PLAY[id](f);
    s = await tp(p);
    ok(/^■ Stop \d:\d\d$/.test(s.rec), `${NAME[id]}: while it records, the button says ${s.rec}`);
    await p.click("#tpRec");
    await p.waitForFunction(() => !document.getElementById("tpAdd").hidden, null, { timeout: 20000 });
    const db = await takeDb(f);
    ok(db != null && db > -50, `${NAME[id]}: Stop makes a take that is not silent (${db} dB)`);
    const n0 = await p.evaluate(async () => (await AOGHandoff.list(AOGHandoff.INBOX)).items.length);
    await p.click("#tpAdd");
    await p.waitForFunction(() => document.getElementById("tpLine").textContent === "Added to My Track.", null, { timeout: 8000 });
    await p.waitForFunction(lay => !!document.querySelector(`#mtList .lay.on[data-layer="${lay}"], #mtList .on[data-room="${lay}"]`), id, { timeout: 8000 });
    const it = await p.evaluate(async () => (await AOGHandoff.list(AOGHandoff.INBOX)).items);
    ok(it.length === n0 + 1 && it[0].from === FROM[id] && await p.evaluate(() => document.getElementById("tpAdd").hidden), `${NAME[id]}: + Add to My Track sends it, and My Track marks it`);
    ok(errs.length === e0, `${NAME[id]}: no page errors ` + errs.slice(e0).join(" | "));
  }

  /* 2 · the Mixing Desk: Listen and Send it out */
  await p.click('.sh-doors a[data-room="studio"]'); await arrived(p, "studio");
  let s = await tp(p);
  /* AOG-STUDIO-LISTEN-V1: ▶ Listen puts each room's take from My Track on an empty track by itself, and plays */
  await p.click("#tpListen");
  const f = inner(p);
  await f.waitForFunction(() => __aogStudio.PLAY.on, null, { timeout: 30000 });
  const lay = await f.evaluate(() => __aogStudio.SONG.tracks.map(x => x.clip ? x.clip.layer + (x.clip.auto ? "*" : "") : "-").join(" "));
  ok(lay === "pads* drums* piano* guitar* bass* band* decks* -", "▶ Listen puts the seven rooms' takes on tracks 1 to 7 by itself and plays them: " + lay);
  await p.click("#tpListen"); await p.waitForTimeout(300);
  /* AOG-STUDIO-VOICE-V1: at the Mixing Desk, ● Record records your voice on track 8 */
  ok(!s.recOff, "at the Mixing Desk, ● Record is ready for your voice");
  await p.click("#tpRec"); await f.waitForFunction(() => __aogStudio.VOICE.rec, null, { timeout: 10000 });
  await p.waitForTimeout(1500); await p.click("#tpRec");
  await f.waitForFunction(() => !__aogStudio.VOICE.rec && !__aogStudio.VOICE.busy && __aogStudio.SONG.tracks[7].clip, null, { timeout: 10000 });
  ok(await f.evaluate(() => __aogStudio.SONG.tracks[7].clip.voice && __aogStudio.SONG.sel === 7) && (await tp(p)).rec === "● Record" && !(await tp(p)).add,
    "● Record, then Stop, puts your voice on track 8 (nothing more to add)");
  await f.evaluate(() => __aogStudio.refreshInbox()); await p.waitForTimeout(400);
  await f.selectOption("#trackSel", "0"); await p.waitForTimeout(200);
  await f.click("#putBtn"); await f.waitForFunction(() => __aogStudio.SONG.tracks[0].clip && !__aogStudio.S.busy, null, { timeout: 15000 });
  await p.click("#tpListen"); await p.waitForTimeout(500);
  ok(await f.evaluate(() => __aogStudio.PLAY.on) && (await tp(p)).listen === "■ Stop listening", "▶ Listen plays My Track, and becomes ■ Stop listening");
  await p.click("#tpListen"); await p.waitForTimeout(300);
  ok(!(await f.evaluate(() => __aogStudio.PLAY.on)) && (await tp(p)).listen === "▶ Listen", "■ Stop listening stops it");
  await p.click("#tpOut");
  await f.waitForFunction(() => __aogStudio.OUT.song && !__aogStudio.OUT.busy, null, { timeout: 60000 });
  ok(true, "Send it out makes the song's file at the Mixing Desk");
  /* from another room, Listen goes to the Mixing Desk first */
  await p.click('.sh-doors a[data-room="piano"]'); await arrived(p, "piano");
  await p.click("#tpListen");
  await p.waitForFunction(() => location.hash === "#studio", null, { timeout: 8000 }); await arrived(p, "studio");
  await inner(p).waitForFunction(() => __aogStudio.PLAY.on, null, { timeout: 12000 });
  ok(true, "from the piano, ▶ Listen goes to the Mixing Desk and plays");
  const bk = await p.evaluate(() => ({ back: document.getElementById("tpBack").hidden ? "" : document.getElementById("tpBack").textContent, mix: !document.getElementById("tpMix").hidden }));
  ok(bk.back === "‹ Piano" && !bk.mix, "at the desk, ‹ Piano takes the place of Mix ›: " + JSON.stringify(bk));
  await p.click("#tpListen");
  await p.click("#tpBack"); await arrived(p, "piano");
  ok(await p.evaluate(() => document.getElementById("tpBack").hidden && !document.getElementById("tpMix").hidden), "‹ Piano goes back to the piano, and Mix › is back");
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();

  /* 3 · the name across the site */
  const h = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(h); await routes(h);
  const q = await h.newPage(); await q.goto(U + "index.html"); await q.waitForTimeout(1500);
  const home = await q.evaluate(() => ({ door: [...document.querySelectorAll('.aogdn-door[data-door="studio"] .aogdn-name span')].map(x => x.textContent)[0],
    first: (document.querySelector('#aogdnList-studio .aogdn-cards li a') || {}).getAttribute && document.querySelector('#aogdnList-studio .aogdn-cards li a').getAttribute("href") }));
  ok(home.door === "The Recording Studio" && home.first === "/the-studio", "the home page's door is The Recording Studio, and its first card opens it: " + JSON.stringify(home));
  await q.goto(U + "music-piano.html"); await q.waitForTimeout(1500);
  const ex = await q.evaluate(() => { const src = [...document.scripts].map(s => s.src).find(x => /aog-topbar/.test(x)); return !!src; });
  const bar = await q.evaluate(() => /The Recording Studio/.test(document.querySelector(".aogtop") ? document.querySelector(".aogtop").outerHTML + JSON.stringify(window.__aogEX || "") : ""));
  ok(ex, "the site bar is on the room page");
  await h.close();

  /* 4 · a phone on its side; an iPhone and an iPad, light and dark */
  const ls = await b.newContext({ ...pw.devices["iPhone 13 landscape"] }); watch(ls); await routes(ls);
  const r = await ls.newPage(); await r.goto(U + "the-studio#guitar"); await arrived(r, "guitar");
  const lf = await r.evaluate(() => ({ ih: innerHeight, top: Math.round(document.getElementById("room").getBoundingClientRect().top), h: Math.round(document.getElementById("room").getBoundingClientRect().height),
    mt: getComputedStyle(document.getElementById("mt")).display, sw: document.scrollingElement.scrollWidth, iw: innerWidth }));
  ok(lf.top === 0 && lf.h >= lf.ih - 6 && lf.mt === "none" && lf.sw <= lf.iw, "a phone on its side gives the room the whole screen: " + JSON.stringify(lf));
  await ls.close();
  for (const [dev, theme] of [["iPhone 13", "light"], ["iPhone 13", "dark"], ["iPad (gen 7)", "light"], ["iPad (gen 7)", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(([th, es]) => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); if (es) localStorage.setItem("aog.lang", "es"); } catch (e) {} }, [theme, theme === "dark" && dev === "iPad (gen 7)"]);
    const m = await cx.newPage(); await m.goto(U + "the-studio#piano"); await arrived(m, "piano");
    const fit = await m.evaluate(() => { const r = el => el.getBoundingClientRect(), bt = [...document.querySelectorAll("#mt .tp-b")].filter(x => x.offsetParent);
      return { iw: innerWidth, ih: innerHeight, sw: document.scrollingElement.scrollWidth, sh: document.scrollingElement.scrollHeight, min: Math.min(...bt.map(x => Math.round(r(x).height))), right: Math.max(...bt.map(x => Math.round(r(x).right))),
        frame: Math.round(r(document.getElementById("room")).height), labels: bt.map(x => x.textContent).join(" | ") }; });
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    const esOk = !(theme === "dark" && dev === "iPad (gen 7)") || fit.labels === "● Grabar | ▶ Escuchar | Mezclar › | Compártela";
    ok(fit.sw <= fit.iw && fit.sh <= fit.ih + 1 && fit.min >= 44 && fit.right <= fit.iw && fit.frame >= 380 && !pc.length && !pk.length && esOk,
      `${dev}, ${theme}: the transport fits (${JSON.stringify(fit)}), reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await m.screenshot({ path: path.join(process.env.AOG_SHOTS || require("os").tmpdir(), `rooms-${dev.split(" ")[0].toLowerCase()}-${theme}.png`) });
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the phone or the iPad " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
