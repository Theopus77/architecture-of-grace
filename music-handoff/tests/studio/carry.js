/* AOG-STUDIO-CARRY-V1 — Jimmy: "go back and forth between my iPhone, iPad and computer without setting up an account".
   A song of two tracks (eight bars each, so the locker gets it in two pieces), named, one track turned down, made on a
   computer. Save song file; the file opens on an iPhone (its own browser, nothing shared) with the same tracks, mixer and
   sound; opening another asks first, and No keeps the song; a file that is not a song says so. The locker, against a
   pretend Apps Script that keeps what it gets the way AoG-Studio-Locker.gs does: a wrong key is told plainly; Connect;
   Save to my locker (two pieces); the link for other devices connects an iPad, takes itself out of the address bar, and
   the iPad opens the song; Remove asks first; Disconnect forgets only the locker (the Sheet's aog.sync.* stays); Spanish;
   an iPhone and an iPad, light and dark: nothing sideways, readable and calm; no page errors. Port 9247. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), os = require("os");
const PORT = 9247, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const OUT = process.env.AOG_SHOTS || fs.mkdtempSync(path.join(os.tmpdir(), "carry-"));
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }

/* the pretend locker: the same requests and answers as AoG-Studio-Locker.gs, kept in memory */
const LOCK_URL = "https://script.google.com/macros/s/AKfycbTESTdeployment_123456/exec", LOCK_KEY = "k3y0fTheLocker99";
const STORE = new Map(); let calls = [];
function locker(body) {
  if (body.key !== LOCK_KEY) return { ok: false, error: "key" };
  calls.push(body.action);
  if (body.action === "hello") return { ok: true, locker: 1 };
  if (body.action === "list") return { ok: true, songs: [...STORE.entries()].filter(([, s]) => s.done).map(([id, s]) => ({ id, name: s.name, at: s.at, size: s.size, parts: s.parts })) };
  if (body.action === "begin") { const id = "s" + Math.random().toString(36).slice(2, 12); STORE.set(id, { name: body.name, size: body.size, parts: body.parts, at: Date.now(), done: false, data: [] }); return { ok: true, id }; }
  const s = STORE.get(body.id); if (!s) return { ok: false, error: "That song is not in the locker." };
  if (body.action === "part") { s.data[body.n] = Buffer.from(body.data, "base64"); return { ok: true }; }
  if (body.action === "finish") { const tot = s.data.reduce((a, d) => a + (d ? d.length : 0), 0); if (tot !== s.size) return { ok: false, error: "A piece of the song did not arrive. Try again." }; s.done = true; return { ok: true }; }
  if (body.action === "get") return { ok: true, data: s.data[body.n].toString("base64") };
  if (body.action === "remove") { STORE.delete(body.id); return { ok: true }; }
  return { ok: false, error: "unknown action" };
}
async function routes(ctx) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/studio(\?.*)?(#.*)?$/, r => r.fulfill({ path: path.join(ROOT, "music-studio.html"), contentType: "text/html" }));
  await ctx.route(u => u.href.startsWith(LOCK_URL), r => {
    if (r.request().method() !== "POST") return r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    let body = {}; try { body = JSON.parse(r.request().postData()); } catch (e) {}
    r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(locker(body)) });
  });
  await ctx.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/qrcodejs/, r => r.fulfill({ contentType: "text/javascript",
    body: "window.QRCode=function(el,o){var c=document.createElement('canvas');c.width=o.width;c.height=o.height;el.appendChild(c);};window.QRCode.CorrectLevel={M:0};" }));
}
/* eight bars at 100 beats a minute, a note a bar (about 3.4 MB) */
const TAKE = `(async (n, freqs) => { const sr = 44100, head = 0.05, bar = 2.4, sec = head + bar * freqs.length, len = Math.round(sec * sr);
  const ab = new ArrayBuffer(44 + len * 4), v = new DataView(ab), s = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  s(0, "RIFF"); v.setUint32(4, 36 + len * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, len * 4, true);
  let ph = 0;
  for (let i = 0; i < len; i++) { const t = i / sr - head; let x = 0;
    if (t >= 0) { const k = Math.min(freqs.length - 1, Math.floor(t / bar)); ph += 2 * Math.PI * freqs[k] / sr; x = Math.round(9000 * Math.sin(ph)); }
    v.setInt16(44 + i * 4, x, true); v.setInt16(46 + i * 4, x, true); }
  await AOGHandoff.add(AOGHandoff.INBOX, { from: "guitar", n, name: { en: "Guitar take " + n, es: "Toma de guitarra " + n }, sec, bpm: 100, at: Date.now() + n, take: true,
    wav: new Blob([ab], { type: "audio/wav" }) }, { key: "carry|" + n });
})`;
async function put(p, take, track) {
  await p.selectOption("#trackSel", String(track));
  const v = await p.evaluate(nm => [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === nm).value, take);
  await p.selectOption("#srcSel", v); await p.click("#putBtn");
  await p.waitForFunction(t => __aogStudio.SONG.tracks[t].clip && !__aogStudio.S.busy, track, { timeout: 15000 });
}
/* what must match on both devices: the arrangement, each recording's bytes, and the mix */
const state = p => p.evaluate(async () => {
  const st = __aogStudio, S = JSON.parse(JSON.stringify(st.SONG));
  S.tracks.forEach(x => { if (x.clip) delete x.clip.peakDb; });
  const db = await new Promise(ok => { const r = indexedDB.open("aog-studio", 1); r.onsuccess = () => ok(r.result); });
  const sums = [];
  for (const x of S.tracks) if (x.clip) {
    const v = await new Promise(ok => { const q = db.transaction("clips").objectStore("clips").get(x.clip.id); q.onsuccess = () => ok(q.result); });
    const u = new Uint8Array(await v.wav.arrayBuffer()); let h = 0; for (let i = 0; i < u.length; i += 7) h = (h * 31 + u[i]) >>> 0; sums.push(u.length + ":" + h);
  }
  db.close();
  return { song: JSON.stringify(Object.assign(S, { sel: 0 })), sums: sums.join(","), bufs: st.BUF.size };
});
async function mix(p) {
  await p.evaluate(() => { document.getElementById("mixLine").textContent = ""; });
  await p.click("#mixBtn");
  await p.waitForFunction(() => /ready|did not|lista|No funcionó/.test(document.getElementById("mixLine").textContent), null, { timeout: 60000 });
  return p.evaluate(async () => { const u = new Uint8Array(await __aogStudio.MIX.wav.arrayBuffer()); let h = 0; for (let i = 0; i < u.length; i += 5) h = (h * 31 + u[i]) >>> 0; return u.length + ":" + h; });
}
const line = (p, id) => p.evaluate(i => document.getElementById(i).textContent.trim(), id);
const waitLine = (p, id, re) => p.waitForFunction(([i, s]) => new RegExp(s).test(document.getElementById(i).textContent), [id, re.source], { timeout: 60000 });

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* 1 · the computer: a song of two tracks */
  const c = await b.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true }); watch(c); await routes(c);
  await c.grantPermissions(["clipboard-read", "clipboard-write"], { origin: U });
  await c.addInitScript(() => { try { if (!localStorage.getItem("aog.sync.url")) localStorage.setItem("aog.sync.url", "https://script.google.com/macros/s/SHEET/exec"); } catch (e) {} });
  const p = await c.newPage();
  await p.goto(U + "music-studio.html"); await p.waitForTimeout(700);
  ok(await p.isVisible("#carryBlk") && (await p.textContent("#carryBlk h2")).trim() === "Your song on your other devices", "the Mixing Desk has \"Your song on your other devices\"");
  ok(!(await p.isDisabled("#fileSave")), "Save song file is there");
  await p.click("#fileSave");
  ok(await line(p, "fileLine") === "Put a recording on a track first.", "with no song, Save song file says what to do first");
  await p.evaluate(`(async()=>{ const add=${TAKE}; await add(1, [220,330,440,550,220,330,440,550]); await add(2, [660,550,440,330,660,550,440,330]); })()`);
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 2, null, { timeout: 8000 });
  await put(p, "Guitar take 1", 0); await put(p, "Guitar take 2", 1);
  await p.fill("#songName", "Rainy day");
  await p.evaluate(() => { const r = document.getElementById("t1-vol"); r.value = "40"; r.dispatchEvent(new Event("input", { bubbles: true })); });
  await p.waitForTimeout(400);
  const A = await state(p), mixA = await mix(p);
  ok(/"name":"Rainy day"/.test(A.song) && A.bufs === 2, "the song is named and has two tracks");

  /* 2 · Save song file */
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click("#fileSave")]);
  const fname = dl.suggestedFilename(), fpath = path.join(OUT, fname); await dl.saveAs(fpath);
  await waitLine(p, "fileLine", /^Saved/);
  const size = fs.statSync(fpath).size;
  ok(/^rainy-day-\d{4}-\d\d-\d\d-\d{4}\.aogsong$/.test(fname) && size > 6.5e6 && fs.readFileSync(fpath).slice(0, 8).toString() === "AOGSONG1",
    `the file: ${fname}, ${(size / 1048576).toFixed(1)} MB`);
  ok((await line(p, "fileLine")).startsWith("Saved: " + fname + ". On an iPhone or iPad it is in the Files app"), "the line says where the file went: " + await line(p, "fileLine"));

  /* 3 · an iPhone opens it: same tracks, same mixer, same sound */
  const ph = await b.newContext({ ...pw.devices["iPhone 13"] }); watch(ph); await routes(ph);
  const q = await ph.newPage(); await q.goto(U + "music-studio.html"); await q.waitForTimeout(700);
  ok((await state(q)).bufs === 0, "the iPhone starts with an empty desk");
  await q.setInputFiles("#fileIn", fpath);
  await waitLine(q, "fileLine", /is on the desk/);
  await q.waitForFunction(() => __aogStudio.BUF.size === 2 && !__aogStudio.S.decoding, null, { timeout: 30000 });
  ok(await line(q, "fileLine") === "Rainy day is on the desk.", "the iPhone: " + await line(q, "fileLine"));
  const B = await state(q);
  ok(B.song === A.song, "the arrangement, names, mixer and volumes match");
  ok(B.sums === A.sums, "each recording is the same, byte for byte");
  ok((await q.inputValue("#songName")) === "Rainy day", "the name box shows the song's name");
  const mixB = await mix(q);
  ok(mixB === mixA, "the iPhone's mix is the computer's mix, byte for byte");

  /* 4 · opening another asks first; No keeps the song; a wrong file says so */
  await q.evaluate(() => { document.getElementById("fileIn").value = ""; });
  await q.setInputFiles("#fileIn", fpath);
  await q.waitForFunction(() => !document.getElementById("openAsk").hidden, null, { timeout: 8000 });
  ok((await q.textContent("#openAskT")).startsWith("Open Rainy day? It takes the place of the song on the desk now."), "a second song asks first: " + await q.textContent("#openAskT"));
  await q.click("#openNo");
  ok(await q.isHidden("#openAsk") && (await state(q)).sums === A.sums, "Not now keeps the song as it was");
  const junk = path.join(OUT, "not-a-song.aogsong"); fs.writeFileSync(junk, "hello, this is not a song");
  await q.setInputFiles("#fileIn", junk); await waitLine(q, "fileLine", /not a song file/);
  ok(await line(q, "fileLine") === "That is not a song file from the Mixing Desk." && (await state(q)).sums === A.sums, "a file that is not a song is told plainly, and nothing changes");
  const cutf = path.join(OUT, "cut-short.aogsong"); fs.writeFileSync(cutf, fs.readFileSync(fpath).slice(0, size - 1000));
  await q.evaluate(() => { document.getElementById("fileLine").textContent = ""; });
  await q.setInputFiles("#fileIn", cutf); await waitLine(q, "fileLine", /not a song file|on the desk/);
  ok(await line(q, "fileLine") === "That is not a song file from the Mixing Desk." && await q.isHidden("#openAsk"), "a song file cut short is not opened");

  /* 5 · the locker on the computer: a wrong key, then Connect */
  ok(await p.isVisible("#lkUrl") && await p.isVisible("#lkConnect"), "before it is connected, the locker shows a web address, a key and Connect");
  await p.fill("#lkUrl", "https://example.com/exec"); await p.fill("#lkKey", LOCK_KEY); await p.click("#lkConnect");
  ok(await line(p, "lockLine") === "The web address should start with https://script.google.com and end with /exec.", "a wrong web address is told plainly");
  await p.fill("#lkUrl", LOCK_URL); await p.fill("#lkKey", "wrongwrongwrong"); await p.click("#lkConnect");
  await waitLine(p, "lockLine", /said no/);
  ok(await p.evaluate(() => !localStorage.getItem("aog.studio.locker.v1")), "a wrong key is told plainly and not kept");
  await p.fill("#lkKey", LOCK_KEY); await p.click("#lkConnect");
  await p.waitForSelector("#lkSave", { timeout: 10000 });
  ok(await line(p, "lockLine") === "This device is connected to your locker." && (await p.textContent("#locker")).includes("No songs in your locker yet."), "Connect: " + await line(p, "lockLine"));

  /* 6 · Save to my locker: two pieces */
  calls = [];
  await p.click("#lkSave"); await waitLine(p, "lockLine", /is in your locker|did not|could not/);
  ok(await line(p, "lockLine") === "Rainy day is in your locker.", "saved: " + await line(p, "lockLine"));
  ok(calls.join(" ") === "begin part part finish list", "it went up in two pieces: " + calls.join(" "));
  ok((await p.textContent("#locker")).includes("Rainy day"), "the locker lists Rainy day");

  /* 7 · the link for other devices; an iPad opens it */
  await p.click("#lkPair");
  const link = await p.evaluate(() => navigator.clipboard.readText());
  ok(link.startsWith(U + "music-studio.html#locker=") && link.includes("&k=" + LOCK_KEY) && await line(p, "lockLine") === "Link copied. Paste it into a message to yourself.", "the link is copied: " + await line(p, "lockLine"));
  await p.click("#lkQrBtn"); await p.waitForSelector("#lkQr canvas", { timeout: 5000 });
  ok((await p.textContent("#lkQrBtn")) === "Hide the QR code" && (await line(p, "locker")).includes("Keep the link private"), "Show a QR code draws one, with a line to keep it private");
  await p.click("#lkQrBtn"); ok(await p.isHidden("#lkQr"), "Hide the QR code hides it");

  const pad = await b.newContext({ ...pw.devices["iPad (gen 7)"] }); watch(pad); await routes(pad);
  const r = await pad.newPage(); await r.goto(link); await r.waitForTimeout(500);
  await r.waitForFunction(() => /Rainy day/.test(document.getElementById("locker").textContent), null, { timeout: 10000 });
  ok(!(await r.evaluate(() => location.hash)) && await line(r, "lockLine") === "Your locker is connected on this device.", "the iPad: connected, and the link left the address bar");
  await r.click("[data-lkopen]");
  await waitLine(r, "lockLine", /is on the desk|did not/);
  await r.waitForFunction(() => __aogStudio.BUF.size === 2 && !__aogStudio.S.decoding, null, { timeout: 30000 });
  const C = await state(r);
  ok(C.song === A.song && C.sums === A.sums && await line(r, "lockLine") === "Rainy day is on the desk.", "the iPad opens the song from the locker, the same in every byte");

  /* 8 · Remove asks first */
  await r.click("[data-lkrm]");
  ok((await r.textContent("#locker .st-q p")).startsWith("Take Rainy day out of your locker?"), "Remove asks first");
  await r.click("[data-lkrmno]"); ok(STORE.size === 1 && await r.isVisible("[data-lkrm]"), "Keep it keeps it");
  await r.click("[data-lkrm]"); await r.click("[data-lkrmyes]");
  await waitLine(r, "lockLine", /trash/);
  ok(STORE.size === 0 && (await r.textContent("#locker")).includes("No songs in your locker yet."), "removed: " + await line(r, "lockLine"));

  /* 9 · Disconnect forgets only the locker */
  await p.click("#lkOff");
  ok(await p.evaluate(() => !localStorage.getItem("aog.studio.locker.v1") && localStorage.getItem("aog.sync.url") === "https://script.google.com/macros/s/SHEET/exec") && await p.isVisible("#lkUrl"),
    "Disconnect: the locker is forgotten, the Sheet connection stays: " + await line(p, "lockLine"));

  /* 10 · Spanish */
  await p.evaluate(() => document.getElementById("langBtn").click());
  ok((await p.textContent("#carryBlk h2")).trim() === "Tu canción en tus otros aparatos" && (await p.textContent("#fileSave")) === "Guardar archivo de canción" && (await p.textContent("#lkConnect")) === "Conectar",
    "Spanish: " + (await p.textContent("#carryBlk h2")).trim());
  await p.evaluate(() => document.getElementById("langBtn").click());

  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close(); await ph.close(); await pad.close();

  /* 11 · an iPhone and an iPad, light and dark, connected and not: nothing sideways, readable and calm */
  for (const [dev, theme, conn] of [["iPhone 13", "light", false], ["iPhone 13", "dark", true], ["iPhone 13", "light", true], ["iPad (gen 7)", "dark", false]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(([th, conn, u, k]) => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1");
      if (conn) localStorage.setItem("aog.studio.locker.v1", JSON.stringify({ url: u, key: k })); } catch (e) {} }, [theme, conn, LOCK_URL, LOCK_KEY]);
    STORE.set("sdemo12345", { name: "Rainy day", size: 10, parts: 1, at: Date.now(), done: true, data: [Buffer.alloc(10)] });
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(900);
    if (conn) { await m.waitForSelector("[data-lkopen]"); await m.click("[data-lkrm]"); await m.click("#lkQrBtn"); await m.waitForSelector("#lkQr canvas"); }
    else await m.click("#carryBlk details summary");
    await m.locator("#carryBlk").scrollIntoViewIfNeeded(); await m.waitForTimeout(200);
    const f = await m.evaluate(() => { const r = el => el.getBoundingClientRect(), box = document.getElementById("carryBlk"), btn = [...box.querySelectorAll("button")].filter(x => x.offsetParent), inp = [...box.querySelectorAll("input")].filter(x => x.offsetParent);
      return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, minBtn: Math.min(...btn.map(x => Math.round(r(x).height))), right: Math.max(...btn.concat(inp).map(x => Math.round(r(x).right))),
        inFs: Math.min(...inp.map(x => parseFloat(getComputedStyle(x).fontSize))) }; });
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    ok(f.sw <= f.iw && f.minBtn >= 44 && f.right <= f.iw && f.inFs >= 16 && !pc.length && !pk.length,
      `${dev}, ${theme}, ${conn ? "connected" : "not connected"}: fits (${JSON.stringify(f)}), reads (${pc.length} unreadable ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await m.locator("#carryBlk").screenshot({ path: path.join(OUT, `carry-${dev.split(" ")[0].toLowerCase()}-${theme}-${conn ? "on" : "off"}.png`) });
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the phone or the iPad " + errs.join(" | "));
  console.log("shots: " + OUT);
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
