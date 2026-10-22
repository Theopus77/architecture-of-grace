/* AOG-SHARE-V1 (2026-10-22) — ✉ Send to a friend (aog-share.js, from Listen back), and a beat link opening the Studio.
   · nothing of it loads before the key is pressed;
   · iPhone (Spanish, dark): a beat on the Drum Machine (a beat, chords, a bass, another kit) is on My Track; Listen back shows
     ✉ Enviar a un amigo; the sheet offers two plain choices, fits (390×844 and 390×664), 44 px keys, readable and calm;
   · Send the song hands the share sheet a small file (.m4a, audio/mp4) with Listen back's message, smaller than the .wav would
     be, and it decodes back to the song's length, with sound in it;
   · Send the beat hands over https://architectureofgrace.com/the-studio?beat=…; "aog-studio-did" {what:"shared"} each time;
   · iPad (English, light), a fresh browser: the link opens the Studio on the Drum Machine, the address is clean, the beat is
     the same (hits, kits, instruments, pattern, bars, tempo, swing), the song's tempo and key are the sender's, the loop is on
     My Track, nothing plays until Play, the line says what to do, "remixopened" fires; 🎤 Sing or rap's booth has that loop
     as its backing (a fake microphone); ▶ Tocar / Play then plays it;
   · a garbage link, a tampered link (wild numbers, unknown names, markup in the title), a link too long: cleaned or refused
     with one kind line, no page errors, the Studio opens as usual. Port 9633. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy"), PORT = 9633, srv = require("../srv.js")(PORT);
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const W = ms => new Promise(r => setTimeout(r, ms));
const U = `http://localhost:${PORT}/`;
async function setup(b, o, lang, theme) {
  const ctx = await b.newContext({ ...o, colorScheme: theme, serviceWorkers: "block", acceptDownloads: true }); const errs = [], asked = [];
  ctx.on("page", x => x.on("pageerror", e => errs.push(e.message)));
  ctx.on("request", r => { if (/aog-share\.js/.test(r.url())) asked.push(r.url()); });
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  await ctx.addInitScript(([l, th]) => { try { if (!sessionStorage.getItem("t")) { localStorage.clear(); sessionStorage.setItem("t", "1"); } localStorage.setItem("aog.lang", l);
    localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); } catch (e) {}
    /* the words as read, with the site's emoji pictures read as their emoji */
    window.SAY = el => [...el.childNodes].map(n => n.nodeType === 3 ? n.data : n.tagName === "IMG" ? n.alt : n.textContent).join("");
    window.__did = []; window.addEventListener("aog-studio-did", e => window.__did.push(e.detail && e.detail.what)); }, [lang, theme]);
  return { ctx, errs, asked };
}
const pads = p => p.frames().find(x => /music-pads/.test(x.url()));
const sheetView = p => p.evaluate(() => { const d = document.getElementById("shrDlg"), R = e => e.getBoundingClientRect(), vis = e => !!(e && e.getClientRects().length);
  const bt = d ? [...d.querySelectorAll("button, input")].filter(vis) : [], inV = e => { const r = R(e); return r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1; };
  return d ? { open: d.open, h: document.getElementById("shrH").textContent, picks: [...d.querySelectorAll(".shr-pick b")].map(x => x.textContent), says: [...d.querySelectorAll(".shr-pick span")].map(x => x.textContent),
    allIn: bt.every(inV), min: Math.min(...bt.map(x => Math.round(R(x).height))), side: document.scrollingElement.scrollWidth <= innerWidth + 1 && d.scrollWidth <= d.clientWidth + 1,
    focus: document.activeElement && document.activeElement.id, line: document.getElementById("shrLine").textContent } : null; });
const lbView = p => p.evaluate(() => { const d = document.getElementById("lbDlg"), R = e => e.getBoundingClientRect(), vis = e => !!(e && e.getClientRects().length);
  const bt = [...d.querySelectorAll("button, input")].filter(vis), inV = e => { const r = R(e); return r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1; };
  return { allIn: bt.every(inV), min: Math.min(...bt.filter(x => x.type !== "range").map(x => Math.round(R(x).height))), send: document.getElementById("lbSend").textContent, sendVis: vis(document.getElementById("lbSend")) }; });
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  let LINK = "", SENT = null;
  /* ═══ 1 · the sender: an iPhone, in Spanish, dark ═══ */
  {
    const { ctx, errs, asked } = await setup(b, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, "es", "dark");
    const p = await ctx.newPage(); await p.goto(U + "the-studio#pads"); await W(4000);
    const f = pads(p);
    await f.waitForFunction(() => window.AOGPadsSetup && AOGPadsSetup.ready(), null, { timeout: 30000 });
    /* a beat, another kit on pads 9–16, chords in a pattern, a bass line; the song in A minor at 96 */
    await p.evaluate(() => AOGSong.set({ key: 9, minor: true, bpm: 96 }));
    await f.evaluate(async () => {
      startBeat("boombap"); const K = KITS(); S.banks[0].kitB = K[Math.min(3, K.length - 1)];
      S.banks[1].inst = "k:grand"; S.banks[1].pat = PATS[0].id; S.banks[2].inst = "a:upright"; S.swing = 54;
      S.ev = S.ev.filter(e => e.b === 0).concat([0, 1, 2, 3].map(i => ({ b: 1, p: [0, 5, 3, 4][i], t: i * 384, v: 0.8, len: 360 })),
        [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ b: 2, p: i % 5, t: i * 192, v: 0.9, len: 150 })));
      if (S.bars < 4) S.bars = 4; S.pads["1:0"] = { vol: 80 }; retime(96); changed(); paintAll();
      document.getElementById("bounceBtn").click();
      for (let i = 0; i < 200; i++) { const r = await AOGHandoff.list(AOGHandoff.INBOX); if (r && r.items && r.items.some(x => x.from === "pads" && x.sec > 0)) break; await new Promise(r => setTimeout(r, 250)); }
    });
    SENT = await f.evaluate(() => AOGPadsSetup.recipe());
    ok(SENT.ev.some(e => e.b === 1) && SENT.ev.some(e => e.b === 2) && SENT.bars >= 4, `iPhone: a beat with chords and a bass is on the Drum Machine (${SENT.ev.length} hits, ${SENT.bars} bars, kits ${SENT.kits.join(" ")})`);
    await W(1200);
    /* Listen back, with the new key; nothing of the share loaded yet */
    await p.evaluate(() => AOGStudioShell.listenBack());
    await p.waitForFunction(() => { const d = document.getElementById("lbDlg"); return d && d.open; }, null, { timeout: 15000 });
    await p.fill("#lbArtist", "DJ Theo"); await p.fill("#lbName", "Night Drive"); await p.click("#lbDone");
    await p.waitForFunction(() => AOGListenBack.state().on, null, { timeout: 40000 }).catch(() => {});
    let lv = await lbView(p);
    ok(lv.sendVis && lv.send === "✉ Enviar a un amigo" && lv.allIn && lv.min >= 44 && !asked.length && !(await p.evaluate(() => !!window.AOGShare)),
      `iPhone: Listen back shows "${lv.send}", all on the screen with 44 px keys; nothing of the share is loaded yet: ` + JSON.stringify({ ...lv, asked: asked.length }));
    await p.setViewportSize({ width: 390, height: 664 }); await W(400); lv = await lbView(p);
    ok(lv.allIn && lv.min >= 44, `iPhone 390×664 (Safari's bars): Listen back still fits with the new key: ` + JSON.stringify(lv));
    await p.setViewportSize({ width: 390, height: 844 }); await W(300);
    /* the share sheet: a pretend share sheet keeps what it was given */
    await p.evaluate(() => { window.__shared = []; navigator.canShare = () => true;
      navigator.share = async d => { const f = d.files && d.files[0]; window.__shared.push(f ? { name: f.name, type: f.type, size: f.size, buf: Array.from(new Uint8Array(await f.arrayBuffer())), text: d.text, title: d.title } : { url: d.url, text: d.text, title: d.title }); }; });
    await p.click("#lbSend");
    await p.waitForFunction(() => { const d = document.getElementById("shrDlg"); return d && d.open; }, null, { timeout: 15000 });
    await W(300);
    let v = await sheetView(p);
    const pc = await p.evaluate(`(${PROBE})()`), pk = await p.evaluate(`(${CALM})()`);
    ok(v.open && v.h === "Enviar a un amigo" && v.picks.join(" | ") === "Enviar la canción | Enviar el ritmo" && v.says.every(x => x.length > 10) && v.allIn && v.min >= 44 && v.side && v.focus === "shrSong" && !pc.length && !pk.length,
      `iPhone: ✉ opens two plain choices, fits, 44 px keys, readable (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and calm (${pk.join("; ") || "ok"}): ` + JSON.stringify(v));
    await p.setViewportSize({ width: 390, height: 664 }); await W(300); v = await sheetView(p);
    ok(v.allIn && v.side && v.min >= 44, `iPhone 390×664: the sheet fits: ` + JSON.stringify({ allIn: v.allIn, min: v.min }));
    await p.screenshot({ path: path.join(process.env.AOG_SHOTS || require("os").tmpdir(), "share-iphone.png") });
    await p.setViewportSize({ width: 390, height: 844 }); await W(300);
    /* Send the song */
    await p.click("#shrSong");
    await p.waitForFunction(() => window.__shared.length >= 1, null, { timeout: 60000 }).catch(() => {});
    const song = await p.evaluate(async () => {
      const s = window.__shared[0]; if (!s) return null;
      const lb = AOGListenBack.state(), O = new OfflineAudioContext(2, 1, 48000);
      let dec = null; try { const bf = await O.decodeAudioData(new Uint8Array(s.buf).buffer); let pk = 0; const d = bf.getChannelData(0); for (let i = 0; i < d.length; i++) pk = Math.max(pk, Math.abs(d[i])); dec = { sec: bf.duration, peak: pk }; } catch (e) { dec = { err: String(e) }; }
      return { name: s.name, type: s.type, size: s.size, head: String.fromCharCode(...s.buf.slice(4, 8)), text: s.text, title: s.title, dur: lb.dur, wav: Math.round(lb.dur * 48000) * 4 + 44, dec, kind: AOGShare.state().kind, did: window.__did.slice() };
    });
    ok(song && song.name === "night-drive.m4a" && song.type === "audio/mp4" && song.head === "ftyp" && song.text === "Night Drive, de DJ Theo — hecha en el estudio de grabación de architectureofgrace.com" && song.title === "Night Drive",
      `iPhone: Send the song hands the share sheet night-drive.m4a with Listen back's message: ` + JSON.stringify(song && { name: song.name, type: song.type, head: song.head, text: song.text, kind: song.kind }));
    ok(song && song.size * 5 < song.wav, `iPhone: the file is small: ${song && Math.round(song.size / 1024)} KB against ${song && Math.round(song.wav / 1024)} KB as a .wav (${song && song.kind})`);
    ok(song && song.dec && Math.abs(song.dec.sec - song.dur) < 0.06 && song.dec.peak > 0.1 && song.dec.peak <= 1.0,
      `iPhone: it decodes back to the song's length, with sound: ${song && JSON.stringify(song.dec)} for ${song && song.dur.toFixed(3)} s`);
    ok(song && song.did.filter(x => x === "shared").length === 1, `iPhone: "aog-studio-did" {what:"shared"} fired once: ${song && JSON.stringify(song.did)}`);
    /* Send the beat */
    await p.click("#shrBeat");
    await p.waitForFunction(() => window.__shared.length >= 2, null, { timeout: 20000 }).catch(() => {});
    const bt = await p.evaluate(() => ({ s: window.__shared[1], did: window.__did.slice(), line: document.getElementById("shrLine").textContent }));
    LINK = bt.s && bt.s.url || "";
    ok(/^https:\/\/architectureofgrace\.com\/the-studio\?beat=z[A-Za-z0-9_-]+$/.test(LINK) && /Night Drive: un ritmo que hice en el estudio de grabación de architectureofgrace\.com/.test(bt.s.text) && !/DJ Theo/.test(LINK + bt.s.text),
      `iPhone: Send the beat hands over a link to architectureofgrace.com (${LINK.length} characters), without the artist's name: ` + JSON.stringify({ url: LINK.slice(0, 70) + "…", text: bt.s && bt.s.text }));
    ok(bt.did.filter(x => x === "shared").length === 2 && /Enviado/.test(bt.line), `iPhone: "shared" fired again; the line says "${bt.line}"`);
    const inLink = await p.evaluate(async u => { const o = await AOGShare._t.decode(new URL(u).searchParams.get("beat")); return { keys: Object.keys(o).sort().join(","), json: JSON.stringify(o) }; }, LINK);
    ok(!/DJ Theo|aog\.|wav|blob|rec/.test(inLink.json) && inLink.keys === "a,bars,bpm,bt,c,e,k,key,mi,n,pd,sw,v".split(",").filter(k => k !== "bt" || /"bt"/.test(inLink.json)).sort().join(","),
      `iPhone: the link holds the recipe only (${inLink.keys}), no recordings and nothing personal`);
    /* no share sheet: the link is copied */
    await p.evaluate(() => { navigator.share = undefined; window.__clip = ""; Object.defineProperty(navigator, "clipboard", { value: { writeText: async t => { window.__clip = t; } }, configurable: true }); });
    await p.click("#shrBeat"); await W(600);
    const cp = await p.evaluate(() => ({ clip: window.__clip, line: document.getElementById("shrLine").textContent }));
    ok(cp.clip.indexOf(LINK) > 0 && /Enlace copiado/.test(cp.line), `iPhone: with no share sheet the link is copied: "${cp.line}"`);
    await p.keyboard.press("Escape"); await W(400);
    const after = await p.evaluate(() => ({ sheet: document.getElementById("shrDlg").open, lb: document.getElementById("lbDlg").open, focus: document.activeElement && document.activeElement.id }));
    ok(!after.sheet && after.lb && after.focus === "lbSend", `iPhone: Escape puts the sheet away; Listen back stays, the keyboard back on ✉: ` + JSON.stringify(after));
    await p.click("#lbBack"); await W(300);
    ok(errs.length === 0, `iPhone: no page errors ` + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  /* ═══ 2 · the friend: an iPad, in English, light, a fresh browser ═══ */
  {
    const { ctx, errs, asked } = await setup(b, { viewport: { width: 1180, height: 820 }, hasTouch: true }, "en", "light");
    const p = await ctx.newPage(); const t0 = Date.now();
    await p.goto(LINK.replace("https://architectureofgrace.com/", U));
    await p.waitForFunction(() => window.AOGShare && /welcome|bad/.test(AOGShare.state().at), null, { timeout: 90000 }).catch(() => {});
    await W(600);
    const r = await p.evaluate(() => ({ at: AOGShare.state().at, url: location.pathname + location.search + location.hash, room: document.getElementById("room").getAttribute("data-file"),
      vis: !!document.getElementById("room").offsetParent, line: SAY(document.getElementById("tpLine")), did: window.__did.slice(), song: AOGSong.get(), along: AOGStudioShell.along() }));
    ok(r.at === "welcome" && r.url === "/the-studio#pads" && r.room === "/music-pads.html" && r.vis, `iPad: the link opens the Studio on the Drum Machine, the address clean (${((Date.now() - t0) / 1000).toFixed(1)} s): ` + JSON.stringify({ at: r.at, url: r.url, room: r.room }));
    ok(r.line === "A friend sent you a beat. Press Play to hear it, or tap 🎤 Sing or rap to rap over it." && r.did.filter(x => x === "remixopened").length === 1,
      `iPad: one warm line, and "remixopened" fired: "${r.line}" ${JSON.stringify(r.did)}`);
    ok(r.song && r.song.bpm === 96 && r.song.key === 9 && r.song.minor === true, `iPad: the song's tempo and key are the sender's: ` + JSON.stringify(r.song));
    const f = pads(p);
    const got = await f.evaluate(() => ({ rec: AOGPadsSetup.recipe(), on: SEQ.on, ac: (typeof ac !== "undefined" && ac) ? ac.state : null }));
    const key = e => [e.b, e.p, e.t, Math.round(e.v * 100), e.len].join(":"), A = SENT.ev.map(key).sort().join(","), B = got.rec.ev.map(key).sort().join(",");
    ok(A === B && JSON.stringify(got.rec.kits) === JSON.stringify(SENT.kits) && JSON.stringify(got.rec.chords) === JSON.stringify(SENT.chords) && JSON.stringify(got.rec.bass) === JSON.stringify(SENT.bass)
      && got.rec.bars === SENT.bars && got.rec.bpm === SENT.bpm && got.rec.swing === SENT.swing && got.rec.pads["1:0"] && got.rec.pads["1:0"].vol === 80,
      `iPad: the same beat: ${got.rec.ev.length} hits, kits ${got.rec.kits.join(" ")}, chords ${got.rec.chords.inst} ${got.rec.chords.pat}, bass ${got.rec.bass.inst}, ${got.rec.bars} bars at ${got.rec.bpm}, swing ${got.rec.swing}`);
    ok(!got.on && got.ac !== "running" && !r.along.on, `iPad: nothing plays until Play: ` + JSON.stringify({ seq: got.on, ac: got.ac, along: r.along.on }));
    /* the loop is on My Track, and the mic booth has it to rap over */
    const sec = SENT.bars * 4 * 60 / SENT.bpm;
    const mt = await p.evaluate(async () => { const r = await AOGHandoff.list(AOGHandoff.INBOX); return ((r && r.items) || []).filter(x => x.from === "pads").map(x => ({ bars: x.bars, bpm: x.bpm, sec: x.sec, loop: !!x.loop })); });
    ok(mt.length === 1 && mt[0].loop && mt[0].bpm === SENT.bpm && Math.abs(mt[0].sec - sec) < 0.02, `iPad: the loop is on My Track: ` + JSON.stringify(mt));
    await p.click("#shMic");
    await p.waitForFunction(() => window.AOGMicBooth && AOGMicBooth.state().open, null, { timeout: 15000 }).catch(() => {});
    await p.waitForFunction(() => AOGMicBooth.state().bk, null, { timeout: 40000 }).catch(() => {});
    const mb = await p.evaluate(() => AOGMicBooth.state());
    ok(mb.open && mb.bk && mb.bk.loop && Math.abs(mb.bk.sec - sec) < 0.05 && !mb.mic, `iPad: 🎤 Sing or rap opens with the friend's loop as its backing (${sec.toFixed(2)} s): ` + JSON.stringify(mb.bk));
    await p.keyboard.press("Escape"); await W(500);
    const pc = await p.evaluate(`(${PROBE})()`), pk = await p.evaluate(`(${CALM})()`);
    ok(!pc.length && !pk.length, `iPad: readable (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and calm (${pk.join("; ") || "ok"})`);
    await f.evaluate(() => document.getElementById("playBtn").click()); await W(900);
    const pl = await f.evaluate(() => ({ on: SEQ.on, ac: ac && ac.state, label: document.getElementById("playBtn").textContent }));
    ok(pl.on && pl.ac === "running", `iPad: ▶ Play plays the friend's beat: ` + JSON.stringify(pl));
    await f.evaluate(() => document.getElementById("playBtn").click());
    await p.screenshot({ path: path.join(process.env.AOG_SHOTS || require("os").tmpdir(), "share-ipad-arrived.png") });
    ok(errs.length === 0, `iPad: no page errors ` + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  /* ═══ 3 · links that are broken or tampered with: an iPhone, in Spanish ═══ */
  {
    const { ctx, errs } = await setup(b, { viewport: { width: 390, height: 664 }, isMobile: true, hasTouch: true }, "es", "light");
    const p = await ctx.newPage();
    const open = async (code, wait) => {
      await p.goto(U + "the-studio?beat=" + code);
      await p.waitForFunction(() => window.AOGShare && /welcome|bad/.test(AOGShare.state().at), null, { timeout: wait || 30000 }).catch(() => {});
      await W(500);
      return p.evaluate(() => ({ at: AOGShare.state().at, line: SAY(document.getElementById("tpLine")), room: document.getElementById("room").getAttribute("data-file"), url: location.pathname + location.search + location.hash, did: window.__did.slice() }));
    };
    for (const [nm, code] of [["garbage", "%25%25garbage!!"], ["random bytes", "z" + "Qk9PTSBnb2VzIHRoZSBkeW5hbWl0ZQ".repeat(4)], ["too long", "z" + "A".repeat(17000)], ["no hits", null]]) {
      let c = code;
      if (c === null) c = await p.evaluate(() => AOGShare._t.encode({ v: 1, bpm: 120, bars: 4, e: [9, 9, 9, 9, 9] })).catch(() => "");
      if (!c) { await p.goto(U + "the-studio#pads"); await p.waitForFunction(() => !!window.AOGStudioShell, null, { timeout: 15000 }); await p.addScriptTag({ url: "/aog-share.js" });
        c = await p.evaluate(() => AOGShare._t.encode({ v: 1, bpm: 120, bars: 4, e: [9, 9, 9, 9, 9] })); }
      const r = await open(c);
      ok(r.at === "bad" && r.line === "Ese enlace de ritmo no se abrió. Pídele a tu amigo que lo mande otra vez." && r.room === "/music-pads.html" && r.url === "/the-studio#pads" && !r.did.includes("remixopened"),
        `a ${nm} link is refused with one kind line, and the Studio opens as usual: ` + JSON.stringify(r));
    }
    /* tampered: wild numbers, unknown names, markup, extra keys */
    const bad = await p.evaluate(() => AOGShare._t.encode({ v: 1, n: "<img src=x onerror=alert(1)>" + "x".repeat(300), bpm: 9999, sw: "lots", bars: 7, key: 99, mi: "yes", k: ["<script>", "P", 42], c: ["javascript:alert(1)", 4, "../../x", 99, "nope"], a: ["a:upright", -3, "minor", 0],
      e: [0, 0, 0, 80, 24, 0, 2, 96, 80, 24, 9, 0, 0, 80, 24, 0, 99, 0, 80, 24, 0, 1, -5, 80, 24, 1, 0, 0, 1e9, 24, 2, 3, 192.5, 80, 24, "0", 1, 1, 1, 1, 1, 0, 0, 70, 9e9],
      pd: [[1, 0, 9999, 99, 9999], [7, 7, 7, 7, 7], "x"], evil: { __proto__: { polluted: 1 } }, bt: "../../etc" }));
    const r = await open(bad);
    const st = await pads(p).evaluate(() => ({ bpm: S.bpm, bars: S.bars, n: S.ev.length, ev: S.ev.map(e => [e.b, e.p, e.t, e.v, e.len]), kits: [S.banks[0].kitA, S.banks[0].kitB, S.banks[0].kitC].every(k => KITS().indexOf(k) >= 0),
      inst: S.banks[1].inst, okInst: !!INST[S.banks[1].inst], pad: S.pads["1:0"], beat: S.beat, on: SEQ.on, polluted: ({}).polluted }));
    ok(r.at === "welcome" && /Un amigo te mandó un ritmo/.test(r.line) && st.bpm === 180 && st.bars === 4 && st.n === 3 && st.kits && st.okInst && st.inst !== "javascript:alert(1)" && st.pad && st.pad.vol === 150 && st.pad.tune === 12
      && !st.beat && !st.on && st.polluted === undefined, `a tampered link is cleaned: tempo 180, 4 bars, only the 3 good hits, known kits and instruments, pad volume 150: ` + JSON.stringify(st));
    ok(errs.length === 0, `broken and tampered links: no page errors ` + errs.slice(0, 3).join(" | "));
    await ctx.close();
  }
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
