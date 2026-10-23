/* AOG-LOCKER-V3 (2026-10-23) — Jimmy's song on his iPhone went up as "Saving to your locker… 4 of 27" (27 pieces of 4 MB, one
   after another) and "Keep this song in my locker" sent all of it again after every change. Now each recording goes up once
   and a save is the song itself. The locker here is the real AoG-Studio-Locker.gs (v3), run in node against a pretend Google
   (../lib/fakegas.js); the v2 script is kept as it was (fixtures/AoG-Studio-Locker-v2.gs). Port 9287.
   · a Mac: a song of three recordings saves with the switch (have, 3 pieces, songPut); a fader moved then sends only the song
     (one request, counted in bytes); a new take sends only that recording;
   · a big take (13 MB, 4 pieces) by Save to my locker: 3 pieces at once, "Saving to your locker… 4 of 13 MB", the line to keep
     the screen open, cut off after 2 pieces: "It stopped at 8 of 13 MB. Press Save to my locker again: it carries on."; Save
     again sends only the 2 pieces that did not arrive; across the session no piece arrives twice;
   · an iPad opens it (every recording, "Getting your song… n of m MB"); the Mac adds a take; the iPad's Open it fetches only
     that recording; an earlier save fetches nothing;
   · Jimmy's iPad (2026-10-23, "The string contains invalid characters."): an iPhone opens the song while the locker answers a
     piece with no data (asked again, and it comes), a piece with line breaks (taken out) and a piece with words for data, twice:
     "That song did not come through. Press Open again: it carries on.", never a browser's words; Open again fetches only the
     pieces that had not come, and the song is the Mac's, byte for byte;
   · a v2 script: the switch never sends a 16 MB song (says once to update the script, with the steps); Save to my locker sends
     it whole, in MB; a second device opens it through the same bad answers, carrying on the same way;
   · a v2 save in a v3 locker is listed and opens on the new desk;
   · aog.studio.locker.v1 survives the front page's Clear my data and Reset everything, the dashboard's Delete everything (and is
     not in its backup), Start a new song and the switch; only Disconnect removes it;
   · an iPhone and an iPad, light and dark, English and Spanish: the new lines fit, read and are calm; no page errors. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), os = require("os");
const PORT = 9287, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const OUT = process.env.AOG_SHOTS || fs.mkdtempSync(path.join(os.tmpdir(), "locker3-"));
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => { pg.on("pageerror", e => errs.push(pg.url().split("/").pop().slice(0, 40) + ": " + e.message)); pg.on("dialog", d => d.accept()); }); }
const W = ms => new Promise(r => setTimeout(r, ms));

const fakeGas = require("../lib/fakegas.js");
const URL3 = "https://script.google.com/macros/s/AKfycbLOCKERthree_12345/exec", URL2 = "https://script.google.com/macros/s/AKfycbLOCKERtwoOld_1234/exec";
const G = fakeGas(fs.readFileSync(path.join(ROOT, "AoG-Studio-Locker.gs"), "utf8"), { url: URL3, now: Date.now() });
const G2 = fakeGas(fs.readFileSync(path.join(__dirname, "fixtures/AoG-Studio-Locker-v2.gs"), "utf8"), { url: URL2, now: Date.now() });
G.run("setup"); G2.run("setup");
const KEY = G.props.LOCKER_KEY, KEY2 = G2.props.LOCKER_KEY;
const HASH = "#locker=" + encodeURIComponent(URL3) + "&k=" + KEY, HASH2 = "#locker=" + encodeURIComponent(URL2) + "&k=" + KEY2;
const MAC_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
const QUIET = /^(hello|list|check)$/;
/* every request to a locker: its action, its size in bytes, the recording and piece; st.hook may answer in the locker's place
   ("abort" cuts the connection), st.delay holds each piece so that pieces sent at once overlap */
async function routes(ctx, log, st) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  for (const [u, g] of [[URL3, G], [URL2, G2]]) await ctx.route(x => x.href.startsWith(u), async r => {
    if (r.request().method() !== "POST") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(g.get()) });
    const raw = r.request().postData() || ""; let body = {}; try { body = JSON.parse(raw); } catch (e) {}
    g.clock.now = Date.now();
    const e = { t: Date.now(), a: body.action, bytes: Buffer.byteLength(raw), rid: body.rid, n: body.n, nrecs: Array.isArray(body.recs) ? body.recs.length : 0 };
    if (log) log.push(e);
    const h = st && st.hook ? st.hook(body, e, g) : null;
    if (h === "abort") { e.aborted = true; return r.abort(); }
    if (st) { st.on = (st.on || 0) + 1; st.max = Math.max(st.max || 0, st.on); }
    try {
      if (st && st.delay && /^(recPart|recGet|part|get)$/.test(body.action)) await W(st.delay);
      const ans = h || g.post(body);
      e.ok = !!ans.ok;
      await r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(ans) });
    } finally { if (st) st.on--; }
  });
}
const acts = log => log.filter(e => !QUIET.test(e.a));
const seq = log => acts(log).map(e => e.a + (e.a === "have" ? "(" + e.nrecs + ")" : "")).join(" ");
/* a take, a note a bar (2.4 s each), into Takes sent here */
const TAKE = `(async (n, freqs, from) => { const sr = 44100, head = 0.05, bar = 2.4, sec = head + bar * freqs.length, len = Math.round(sec * sr);
  const ab = new ArrayBuffer(44 + len * 4), v = new DataView(ab), s = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  s(0, "RIFF"); v.setUint32(4, 36 + len * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, len * 4, true);
  let ph = 0;
  for (let i = 0; i < len; i++) { const t = i / sr - head; let x = 0;
    if (t >= 0) { const k = Math.min(freqs.length - 1, Math.floor(t / bar)); ph += 2 * Math.PI * freqs[k] / sr; x = Math.round(9000 * Math.sin(ph)); }
    v.setInt16(44 + i * 4, x, true); v.setInt16(46 + i * 4, x, true); }
  await AOGHandoff.add(AOGHandoff.INBOX, { from: from || "guitar", n, name: { en: "Guitar take " + n, es: "Toma de guitarra " + n }, sec, bpm: 100, at: Date.now() + n, take: true,
    wav: new Blob([ab], { type: "audio/wav" }) }, { key: "l3|" + n });
})`;
const freqs = (k, f0) => Array.from({ length: k }, (x, i) => f0 + 11 * i);
async function addTake(p, n, k) { const before = await p.evaluate(() => __aogStudio.INBOX.items.length); await p.evaluate(`(async()=>{ const add=${TAKE}; await add(${n}, ${JSON.stringify(freqs(k, 200 + n * 17))}); })()`);
  await p.waitForFunction(b => __aogStudio.INBOX.items.length > b, before, { timeout: 15000 }); }
async function put(p, take, track) {
  await p.selectOption("#trackSel", String(track));
  const v = await p.evaluate(nm => [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === nm).value, take);
  await p.selectOption("#srcSel", v); await p.click("#putBtn");
  await p.waitForFunction(t => __aogStudio.SONG.tracks[t].clip && !__aogStudio.S.busy, track, { timeout: 30000 });
}
const state = p => p.evaluate(async () => {
  const st = __aogStudio, S = JSON.parse(JSON.stringify(st.SONG));
  S.tracks.forEach(x => { if (x.clip) delete x.clip.peakDb; });
  const sums = [];
  for (const x of S.tracks) if (x.clip) { const v = await st.sget(x.clip.id); const u = new Uint8Array(await v.wav.arrayBuffer()); let h = 0; for (let i = 0; i < u.length; i += 7) h = (h * 31 + u[i]) >>> 0; sums.push(u.length + ":" + h); }
  return { song: JSON.stringify(Object.assign(S, { sel: 0 })), sums: sums.join(","), sid: S.sid };
});
const vol = async (p, i, v) => { await p.evaluate(([i, v]) => { const r = document.getElementById("t" + i + "-vol"); r.value = String(v); r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true })); }, [i, v]); await W(400); };
const txt = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.trim() : null; }, sel);
const shown = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return !!e && !e.hidden && !!e.offsetParent; }, sel);
const hide = (p, on) => p.evaluate(on => { if (on) { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" }); }
  else { delete document.hidden; delete document.visibilityState; } document.dispatchEvent(new Event("visibilitychange")); }, on);
const until = async (fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 20000)) { if (await fn()) return true; await W(150); } return false; };
/* every text a line showed while something happened */
const record = (p, ids) => p.evaluate(ids => { window.__said = window.__said || {}; ids.forEach(id => { const el = document.getElementById(id); window.__said[id] = [];
  new MutationObserver(() => { const w = el.hidden ? "(hidden)" : el.textContent.trim(); const a = window.__said[id]; if (w && a[a.length - 1] !== w) a.push(w); }).observe(el, { childList: true, characterData: true, subtree: true, attributes: true }); }); }, ids);
const said = (p, id) => p.evaluate(id => (window.__said && window.__said[id]) || [], id);
const recsIn = g => { const r = g.root().folders.find(f => f.name === "Recordings" && !f.isTrashed()); return r ? JSON.parse(r.files.find(f => f.name === "index.json" && !f.trashed).bytes).r : {}; };
const lkpKeys = p => p.evaluate(() => new Promise(ok => { const r = indexedDB.open("aog-studio", 1); r.onsuccess = () => { const q = r.result.transaction("clips").objectStore("clips").getAllKeys(); q.onsuccess = () => ok(q.result.filter(k => typeof k === "string" && k.indexOf("lkp|") === 0)); }; r.onerror = () => ok(["?"]); }));
const RAW = /invalid characters|not correctly encoded|InvalidCharacter|atob|undefined/;

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* 1 · the Mac: three recordings, the switch */
  const macLog = [], macAll = [], macSt = {}, mac = await b.newContext({ viewport: { width: 1280, height: 900 }, userAgent: MAC_UA }); watch(mac);
  await routes(mac, { push: e => { macLog.push(e); macAll.push(e); } }, macSt); await mac.clock.install();
  const M = await mac.newPage(); await M.goto(U + "music-studio.html" + HASH);
  await until(() => M.evaluate(() => __aogStudio.CARRY.ver === 3));
  ok(await M.evaluate(() => __aogStudio.CARRY.ver === 3) && /Locker script v3/.test(await txt(M, "#locker .st-lkl")), "the Mac is connected to a v3 locker: " + (await txt(M, "#locker .st-lkl")).replace(/\s+/g, " "));
  for (const n of [1, 2, 3]) await addTake(M, n, 2);
  await put(M, "Guitar take 1", 0); await put(M, "Guitar take 2", 1); await put(M, "Guitar take 3", 2);
  await M.fill("#songName", "Rainy day"); await M.evaluate(() => document.getElementById("songName").blur());
  const SID = (await state(M)).sid;
  await M.evaluate(() => { document.getElementById("foldSave").open = true; });
  await M.waitForSelector("#lkKeep");
  macLog.length = 0; macSt.delay = 300; macSt.max = 0;
  await M.check("#lkKeep");
  await until(() => M.evaluate(() => !!__aogStudio.LK.id && !__aogStudio.KEEP.busy));
  const first = acts(macLog), upMax = macSt.max; macSt.delay = 0;
  ok(upMax === 3, "its 3 recordings go up 3 at once (" + upMax + " at once)");
  ok(seq(macLog) === "have(3) recPart recPart recPart songPut", "on: it asks the locker which of the 3 recordings it has, sends each once, then the song (" + seq(macLog) + ")");
  ok(Object.keys(recsIn(G)).length === 3 && Object.values(recsIn(G)).every(e => e.d === 1), "the locker holds the 3 recordings, whole, in Recordings");
  const saves = () => G.live().filter(f => f.name.startsWith("s" + SID)).map(f => JSON.parse(f.files.find(x => x.name === "song.json" && !x.trashed).bytes)).sort((a, b) => b.at - a.at);
  ok(saves().length === 1 && saves()[0].v === 3 && saves()[0].recs.length === 3 && saves()[0].dev === "Mac", "one save, v3, naming its 3 recordings, from the Mac");
  ok(/^Saved to your locker · Mac · \d{1,2}:\d\d\s?[AP]M$/.test(await txt(M, "#lkKeepAt")), "under the switch: " + await txt(M, "#lkKeepAt"));
  const firstBytes = first.reduce((a, e) => a + e.bytes, 0);

  /* 2 · a fader moved: only the song */
  await record(M, ["lkKeepAt", "lockLine", "lkBig"]);
  macLog.length = 0;
  await vol(M, 0, 61);
  await mac.clock.fastForward(21000);
  await until(() => macLog.some(e => e.a === "songPut") && M.evaluate(() => !__aogStudio.KEEP.busy), 60000);
  const fader = acts(macLog), faderBytes = fader.reduce((a, e) => a + e.bytes, 0);
  ok(seq(macLog) === "songPut" && faderBytes < 20000, "a fader moved: one request, the song itself, " + faderBytes + " bytes (the first save sent " + firstBytes + ")");
  ok(saves().length === 2 && saves()[0].recs.length === 3, "a second save, with the same 3 recordings");
  const kw = await said(M, "lkKeepAt");
  ok(!kw.some(w => /^Saving/.test(w)) && /^Saved to your locker · Mac · /.test(await txt(M, "#lkKeepAt")) && saves()[0].at > saves()[1].at, "when only the song changed, no progress words: \"" + await txt(M, "#lkKeepAt") + "\" right away" + (kw.length ? " (" + kw.join(" | ") + ")" : ""));

  /* 3 · a new take: only that recording */
  await addTake(M, 4, 2);
  macLog.length = 0;
  await put(M, "Guitar take 4", 3);
  await mac.clock.fastForward(21000);
  await until(() => macLog.some(e => e.a === "songPut") && M.evaluate(() => !__aogStudio.KEEP.busy), 60000);
  const take = acts(macLog), takeBytes = take.reduce((a, e) => a + e.bytes, 0), t4 = await M.evaluate(async () => (await __aogStudio.ridOf(__aogStudio.SONG.tracks[3].clip.id)).rid);
  ok(seq(macLog) === "have(1) recPart songPut" && take.filter(e => e.a === "recPart").every(e => e.rid === t4), "a new take: the locker is asked about that one recording, it goes, then the song (" + seq(macLog) + ", " + takeBytes + " bytes; " + take.map(e => e.a + ":" + e.bytes + (e.ok === undefined ? "?" : e.ok ? "" : "!") + "@" + (e.t - take[0].t) + "ms").join(" ") + ")");

  /* 4 · a big take by Save to my locker: 3 at once, MB words, cut off, carried on */
  await M.uncheck("#lkKeep");
  await addTake(M, 5, 31);
  await put(M, "Guitar take 5", 4);
  const big = await M.evaluate(async () => { const r = await __aogStudio.ridOf(__aogStudio.SONG.tracks[4].clip.id); return { rid: r.rid, size: r.size }; });
  ok(big.size > 12.5 * 1048576 && big.size < 13 * 1048576, "the big take is " + (big.size / 1048576).toFixed(1) + " MB: 4 pieces of 4 MB");
  await record(M, ["lockLine", "lkBig"]);
  macLog.length = 0; let sent = 0; macSt.delay = 300; macSt.max = 0;
  macSt.hook = body => body.action === "recPart" && ++sent > 2 ? "abort" : null;   /* the screen locks after 2 pieces */
  await M.click("#lkSave");
  await until(() => M.evaluate(() => !__aogStudio.CARRY.busy && /stopped|could not|is in your/.test(document.getElementById("lockLine").textContent)), 30000);
  macSt.hook = null;
  const ln = await txt(M, "#lockLine"), sw = await said(M, "lockLine"), bw = await said(M, "lkBig");
  const got1 = acts(macLog).filter(e => e.a === "recPart" && !e.aborted).map(e => e.n).sort();
  ok(macSt.max <= 3, "never more than 3 pieces at once (" + macSt.max + ")");
  ok(sw.includes("Saving to your locker… 0 of 13 MB") && sw.includes("Saving to your locker… 4 of 13 MB") && sw.includes("Saving to your locker… 8 of 13 MB") && sw.filter(w => /^Saving.* of /.test(w)).every(w => /^Saving to your locker… \d+ of 13 MB$/.test(w)),
    "progress in MB, not pieces: " + sw.filter(w => /^Saving/.test(w)).join(" | "));
  ok(bw[0] === "Keep this screen open until it says it is saved. If it stops, press Save again: it carries on." && bw[bw.length - 1] === "(hidden)" && !(await shown(M, "#lkBig")),
    "during the big save, and only then: " + bw[0]);
  ok(ln === "It stopped at 8 of 13 MB. Press Save to my locker again: it carries on." && got1.length === 2, "cut off after 2 pieces, said plainly: " + ln);
  macLog.length = 0; macSt.max = 0;
  await record(M, ["lockLine"]);
  await M.click("#lkSave");
  await until(() => M.evaluate(() => !__aogStudio.CARRY.busy && /is in your locker|stopped/.test(document.getElementById("lockLine").textContent)), 30000);
  const got2 = acts(macLog).filter(e => e.a === "recPart").map(e => e.n).sort();
  ok(await txt(M, "#lockLine") === "Rainy day is in your locker." && seq(macLog) === "have(1) recPart recPart songPut" && got2.length === 2 && got2.every(n => !got1.includes(n)) && macLog.filter(e => e.a === "recPart").every(e => e.rid === big.rid),
    "Save again carries on: only the 2 pieces that did not arrive (" + got1 + " then " + got2 + "), then the song: " + await txt(M, "#lockLine"));
  ok((await said(M, "lockLine")).filter(w => /^Saving.* of /.test(w))[0] === "Saving to your locker… 8 of 13 MB", "and it starts from where it stopped: " + (await said(M, "lockLine")).filter(w => /^Saving/.test(w)).join(" | "));
  macSt.delay = 0;
  await M.check("#lkKeep");

  /* 5 · the iPad opens it; then only what it lacks */
  const padLog = [], padSt = {}, pad = await b.newContext({ ...pw.devices["iPad (gen 7)"] }); watch(pad); await routes(pad, padLog, padSt); await pad.clock.install();
  const D = await pad.newPage(); await D.goto(U + "music-studio.html" + HASH);
  await until(() => D.evaluate(() => __aogStudio.CARRY.ver === 3 && Array.isArray(__aogStudio.CARRY.songs) && __aogStudio.CARRY.songs.length > 0));
  await D.evaluate(() => { document.getElementById("foldSave").open = true; });
  await record(D, ["lockLine"]);
  padLog.length = 0; padSt.delay = 200; padSt.max = 0;
  await D.click("[data-lkopen]");
  await until(() => D.evaluate(() => /is on the desk|did not/.test(document.getElementById("lockLine").textContent) && !__aogStudio.S.decoding), 40000);
  const pieces = 3 + 1 + 4, downMax = padSt.max; padSt.delay = 0;
  ok(downMax === 3, "pieces come down 3 at once, never more (" + downMax + " at once)");
  ok(seq(padLog) === "songGet " + Array(pieces).fill("recGet").join(" ") && (await state(D)).sums === (await state(M)).sums, "the iPad opens the Mac's song: the song, then each recording's pieces (" + pieces + "), byte for byte");
  const lw = (await said(D, "lockLine")).filter(w => /^Getting/.test(w));
  ok(lw.length >= 2 && lw.every(w => /^Getting your song… \d+ of 16 MB$/.test(w)) && lw.includes("Getting your song… 16 of 16 MB"), "progress in MB: " + lw.slice(0, 3).join(" | ") + " … " + lw[lw.length - 1]);
  ok((await lkpKeys(D)).length === 0, "the pieces kept while it came down are gone once it is open");
  await addTake(M, 6, 2);
  macLog.length = 0;
  await put(M, "Guitar take 6", 5);
  await mac.clock.fastForward(21000);
  await until(() => macLog.some(e => e.a === "songPut") && M.evaluate(() => !__aogStudio.KEEP.busy), 60000);
  ok(seq(macLog) === "have(1) recPart songPut", "the Mac adds a take: only it goes up (" + seq(macLog) + ")");
  const t6 = await M.evaluate(async () => (await __aogStudio.ridOf(__aogStudio.SONG.tracks[5].clip.id)).rid);
  padLog.length = 0;
  await pad.clock.fastForward(16000); await hide(D, true); await hide(D, false);
  await until(() => shown(D, "#lkNew"), 8000);
  ok(/^A newer version from your Mac \(/.test(await txt(D, "#lkNewT")), "the iPad: " + await txt(D, "#lkNewT"));
  await D.click("#lkNewOpen");
  await until(() => D.evaluate(() => !__aogStudio.CARRY.busy && !!__aogStudio.SONG.tracks[5].clip && !__aogStudio.S.decoding), 30000);
  ok(seq(padLog) === "songGet recGet" && padLog.find(e => e.a === "recGet").rid === t6, "Open it: the song, and only the recording the iPad lacked (" + seq(padLog) + ")");
  const A6 = await state(M), B6 = await state(D);
  ok(A6.song === B6.song && A6.sums === B6.sums, "the same song on both, byte for byte");
  await D.click("#lkRefresh"); await until(() => D.evaluate(() => !!document.querySelector("#locker .st-earl")));
  await D.click("#locker .st-earl summary");
  padLog.length = 0;
  await D.click("#locker .st-erow:last-child [data-lkopen]");
  await D.waitForSelector("#openAsk:not([hidden])"); await D.click("#openYes");
  await until(() => D.evaluate(() => !__aogStudio.CARRY.busy && /is on the desk/.test(document.getElementById("lockLine").textContent)), 30000);
  ok(seq(padLog) === "songGet", "an earlier save opens from the song alone: every recording is already on the iPad (" + seq(padLog) + ")");

  /* 6 · the iPad bug, v3: bad answers, then Open again carries on */
  const phLog = [], phSt = {}, ph = await b.newContext({ ...pw.devices["iPhone 13"] }); watch(ph); await routes(ph, phLog, phSt);
  const Q = await ph.newPage(); await Q.goto(U + "music-studio.html" + HASH);
  await until(() => Q.evaluate(() => __aogStudio.CARRY.ver === 3 && Array.isArray(__aogStudio.CARRY.songs) && __aogStudio.CARRY.songs.length > 0));
  await Q.evaluate(() => { document.getElementById("foldSave").open = true; });
  const tries = {}, firstGot = new Set();
  phSt.hook = (body, e, g) => {
    if (body.action !== "recGet") return null;
    const k = body.rid + "|" + body.n; tries[k] = (tries[k] || 0) + 1;
    if (body.rid === big.rid && body.n === 1 && tries[k] === 1) return { ok: true };   /* no data, once */
    if (body.rid === big.rid && body.n === 3) return { ok: true, data: "That song is not in the locker." };   /* words for data, every time */
    firstGot.add(k);
    if (body.rid === big.rid && body.n === 0) { const a = g.post(body); return { ok: true, data: a.data.replace(/(.{76})/g, "$1\r\n") }; }   /* line breaks */
    return null;
  };
  phLog.length = 0;
  await Q.click("[data-lkopen]");
  await until(() => Q.evaluate(() => !__aogStudio.CARRY.busy && /did not|on the desk/.test(document.getElementById("lockLine").textContent)), 40000);
  const bad = await txt(Q, "#lockLine");
  ok(bad === "That song did not come through. Press Open again: it carries on." && !RAW.test(await Q.evaluate(() => document.body.innerText)), "a piece that would not come: " + bad);
  ok(tries[big.rid + "|1"] === 2 && tries[big.rid + "|3"] === 2, "a piece with no data is asked for once more (and came); one with words for data was asked twice, then it stopped");
  ok((await lkpKeys(Q)).length >= 1, "the pieces that came are kept on the iPhone (" + (await lkpKeys(Q)).length + ")");
  phSt.hook = null; phLog.length = 0;
  await Q.click("[data-lkopen]");
  await until(() => Q.evaluate(() => !__aogStudio.CARRY.busy && /did not|on the desk/.test(document.getElementById("lockLine").textContent) && !__aogStudio.S.decoding), 40000);
  const again = phLog.filter(e => e.a === "recGet").map(e => e.rid + "|" + e.n);
  ok(/is on the desk/.test(await txt(Q, "#lockLine")) && again.includes(big.rid + "|3") && again.every(k => !firstGot.has(k)) && again.length < 5 + 4,
    "Open again carries on: " + again.length + " pieces, none fetched twice: " + await txt(Q, "#lockLine"));
  const Cq = await state(Q), Cm = await state(M);
  ok(Cq.sums === Cm.sums, "and the song is the Mac's, byte for byte (line breaks taken out)");
  ok((await lkpKeys(Q)).length === 0, "the kept pieces are gone once it is open");

  /* 7 · a v2 script: the 15 MB guard; the whole song; the iPad bug the v2 way */
  const oldLog = [], old = await b.newContext({ viewport: { width: 1280, height: 900 }, userAgent: MAC_UA }); watch(old); await routes(old, oldLog); await old.clock.install();
  const O = await old.newPage(); await O.goto(U + "music-studio.html" + HASH2);
  await until(() => O.evaluate(() => __aogStudio.CARRY.ver === 2));
  await addTake(O, 7, 38); await put(O, "Guitar take 7", 0);
  await O.fill("#songName", "Big song"); await O.evaluate(() => document.getElementById("songName").blur());
  await O.evaluate(() => { document.getElementById("foldSave").open = true; });
  await O.waitForSelector("#lkKeep");
  oldLog.length = 0;
  await O.check("#lkKeep"); await W(1500);
  await vol(O, 0, 40); await old.clock.fastForward(21000); await W(1500);
  const oldSay = await O.evaluate(() => (document.body.innerText.match(/This song is big, so it is not kept in your locker on its own\. Update your locker script: then only what changed is sent\. Your songs and key stay the same\./g) || []).length);
  ok(acts(oldLog).length === 0 && oldSay === 1, "a v2 script and a 16 MB song: the switch sends nothing (" + seq(oldLog) + "), and says once to update the script (" + oldSay + ")");
  await O.click("#locker .st-keep .st-old summary");
  const how = await O.evaluate(() => [...document.querySelectorAll("#locker .st-keep .st-old li")].map(l => l.textContent));
  ok(how.length === 3 && /Manage deployments.*Edit.*New version/.test(how[2]), "with the same three steps: " + how.join(" / "));
  await record(O, ["lockLine", "lkBig"]);
  oldLog.length = 0;
  await O.click("#lkSave");
  await until(() => O.evaluate(() => !__aogStudio.CARRY.busy && /is in your locker|could not|stopped/.test(document.getElementById("lockLine").textContent)), 40000);
  const ow = (await said(O, "lockLine")).filter(w => /^Saving/.test(w));
  ok(seq(oldLog) === "begin part part part part finish" && await txt(O, "#lockLine") === "Big song is in your locker.",
    "Save to my locker on a v2 script: the whole song, as before (" + seq(oldLog) + "): " + await txt(O, "#lockLine"));
  ok(ow.length >= 2 && ow.every(w => /^Saving to your locker… \d+ of 15 MB$/.test(w)) && !(await said(O, "lkBig")).length, "in MB (" + ow.join(" | ") + "), and no carry-on line, since a v2 script starts again");
  const oldSong = await state(O);
  const o2Log = [], o2St = {}, o2 = await b.newContext({ ...pw.devices["iPad (gen 7)"] }); watch(o2); await routes(o2, o2Log, o2St);
  const R = await o2.newPage(); await R.goto(U + "music-studio.html" + HASH2);
  await until(() => R.evaluate(() => __aogStudio.CARRY.ver === 2 && Array.isArray(__aogStudio.CARRY.songs) && __aogStudio.CARRY.songs.length > 0));
  await R.evaluate(() => { document.getElementById("foldSave").open = true; });
  const t2 = {};
  o2St.hook = body => { if (body.action !== "get") return null; t2[body.n] = (t2[body.n] || 0) + 1;
    if (body.n === 1 && t2[1] === 1) return { ok: true };
    if (body.n === 3) return { ok: true, data: "The string contains invalid characters." };
    return null; };
  await R.click("[data-lkopen]");
  await until(() => R.evaluate(() => !__aogStudio.CARRY.busy && /did not|on the desk/.test(document.getElementById("lockLine").textContent)), 40000);
  ok(await txt(R, "#lockLine") === "That song did not come through. Press Open again: it carries on." && t2[1] === 2 && t2[3] === 2 && !RAW.test(await R.evaluate(() => document.body.innerText)),
    "the v2 way too: a piece with no data asked again, a bad piece twice, then a plain line: " + await txt(R, "#lockLine"));
  o2St.hook = null; o2Log.length = 0;
  await R.click("[data-lkopen]");
  await until(() => R.evaluate(() => !__aogStudio.CARRY.busy && /did not|on the desk/.test(document.getElementById("lockLine").textContent) && !__aogStudio.S.decoding), 40000);
  ok(/is on the desk/.test(await txt(R, "#lockLine")) && seq(o2Log) === "get" && o2Log[0].n === 3 && (await state(R)).sums === oldSong.sums, "Open again: only the piece that had not come (" + seq(o2Log) + " " + (o2Log[0] || {}).n + "), the song byte for byte");

  /* 8 · a v2 save in a v3 locker opens on the new desk */
  const file = Buffer.from(await M.evaluate(async () => { const b = await __aogStudio.songFile(); const u = new Uint8Array(await b.arrayBuffer()); let s = ""; for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); }), "base64");
  const PART = 4 * 1024 * 1024, np = Math.ceil(file.length / PART), vb = G.post({ key: KEY, action: "begin", name: "From the v2 desk", size: file.length, parts: np, sid: "fromthev2dsk", dev: "Windows" });
  for (let i = 0; i < np; i++) G.post({ key: KEY, action: "part", id: vb.id, n: i, data: file.slice(i * PART, (i + 1) * PART).toString("base64") });
  G.post({ key: KEY, action: "finish", id: vb.id });
  await D.click("#lkRefresh"); await until(() => D.evaluate(() => /From the v2 desk/.test(document.getElementById("locker").textContent)));
  padLog.length = 0;
  await D.evaluate(id => document.querySelector('[data-lkopen="' + id + '"]').click(), vb.id);
  await D.waitForSelector("#openAsk:not([hidden])"); await D.click("#openYes");
  await until(() => D.evaluate(() => !__aogStudio.CARRY.busy && /is on the desk|did not/.test(document.getElementById("lockLine").textContent) && !__aogStudio.S.decoding), 40000);
  ok(/is on the desk/.test(await txt(D, "#lockLine")) && seq(padLog) === Array(np).fill("get").join(" ") && (await state(D)).sums === (await state(M)).sums, "a v2 save in a v3 locker is listed and opens (" + seq(padLog) + ")");

  /* 9 · no piece went up twice, all session */
  const arrived = macAll.filter(e => e.a === "recPart" && e.ok).map(e => e.rid + "|" + e.n);
  ok(arrived.length === new Set(arrived).size && arrived.length === 3 + 1 + 4 + 1, "across the Mac's whole session, each piece of each recording arrived once (" + arrived.length + ")");
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await mac.close(); await pad.close(); await ph.close(); await old.close(); await o2.close();

  /* 10 · aog.studio.locker.v1 survives every clear and reset */
  const kc = await b.newContext({ acceptDownloads: true }); watch(kc); await routes(kc);
  const LKV = JSON.stringify({ url: URL3, key: KEY, did: "keepme12345678" });
  const K = await kc.newPage(); await K.goto(U + "music-studio.html"); await K.waitForTimeout(500);
  await K.evaluate(v => { localStorage.setItem("aog.studio.locker.v1", v); localStorage.setItem("aog.demo.thing", "1"); }, LKV);
  await K.goto(U + "index.html"); await K.waitForTimeout(1500);
  await K.evaluate(() => window.aogClearMyData());
  ok(await K.evaluate(v => localStorage.getItem("aog.studio.locker.v1") === v && !localStorage.getItem("aog.demo.thing"), LKV), "the front page's Clear my data keeps the locker");
  await K.evaluate(() => localStorage.setItem("aog.demo.thing", "1"));
  await Promise.all([K.waitForNavigation({ timeout: 20000 }).catch(() => {}), K.evaluate(() => window.aogResetAll())]);
  await K.waitForTimeout(800);
  ok(await K.evaluate(v => localStorage.getItem("aog.studio.locker.v1") === v && !localStorage.getItem("aog.demo.thing"), LKV), "Reset everything keeps the locker");
  await K.goto(U + "dashboard.html"); await K.waitForTimeout(1500);
  const [dl] = await Promise.all([K.waitForEvent("download", { timeout: 10000 }).catch(() => null), K.evaluate(() => backup())]);
  const bk = dl ? fs.readFileSync(await dl.path(), "utf8") : "";
  ok(bk.length > 10 && !bk.includes(KEY) && !bk.includes("AKfycbLOCKERthree") && !bk.includes("keepme12345678"), "the dashboard's backup file never carries the locker");
  await K.evaluate(() => { localStorage.setItem("aog.demo.thing", "1"); deleteAll(); });
  ok(await K.evaluate(v => localStorage.getItem("aog.studio.locker.v1") === v && !localStorage.getItem("aog.demo.thing"), LKV), "the dashboard's Delete everything keeps the locker");
  await K.goto(U + "music-studio.html"); await K.waitForTimeout(800);
  await K.evaluate(() => { document.getElementById("foldNew").open = true; }); await K.click("#newBtn"); await K.click("#newYes");
  await K.evaluate(() => { document.getElementById("foldSave").open = true; });
  await K.waitForSelector("#lkKeep", { timeout: 10000 }); await K.check("#lkKeep"); await K.uncheck("#lkKeep");
  ok(await K.evaluate(v => localStorage.getItem("aog.studio.locker.v1") === v, LKV), "Start a new song and the switch keep it");
  await K.click("#lkOff");
  ok(await K.evaluate(() => !localStorage.getItem("aog.studio.locker.v1")), "only Disconnect removes it");
  await kc.close();

  /* 11 · an iPhone and an iPad, light and dark, English and Spanish: the new lines fit, read and are calm */
  const ES = { bigHint: "Mantén esta pantalla abierta hasta que diga que se guardó. Si se detiene, pulsa Guardar otra vez: sigue donde iba.",
    lockSaving: "Guardando en tu casillero… 34 de 108 MB", lockLoading: "Trayendo tu canción… 34 de 108 MB", lockStopped: "Se detuvo en 34 de 108 MB. Pulsa Guardar en mi casillero otra vez: sigue donde iba.",
    lockOpenStopped: "Esa canción no llegó entera. Pulsa Abrir otra vez: sigue donde iba." };
  const EN = { bigHint: "Keep this screen open until it says it is saved. If it stops, press Save again: it carries on.",
    lockSaving: "Saving to your locker… 34 of 108 MB", lockLoading: "Getting your song… 34 of 108 MB", lockStopped: "It stopped at 34 of 108 MB. Press Save to my locker again: it carries on.",
    lockOpenStopped: "That song did not come through. Press Open again: it carries on." };
  for (const [dev, theme, lang] of [["iPhone 13", "light", "en"], ["iPhone 13", "dark", "es"], ["iPad (gen 7)", "dark", "en"], ["iPad (gen 7)", "light", "es"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(([th, lang, u, k]) => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1");
      if (lang === "es") localStorage.setItem("aog.lang", "es");
      localStorage.setItem("aog.studio.locker.v1", JSON.stringify({ url: u, key: k })); } catch (e) {} }, [theme, lang, URL3, KEY]);
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(900);
    await until(() => m.evaluate(() => __aogStudio.CARRY.ver === 3));
    await m.evaluate(() => { document.getElementById("foldSave").open = true; });
    const words = await m.evaluate(() => { const st = __aogStudio, p = st.mbPair(34 * 1048576, 108 * 1048576);
      return { bigHint: st.t("bigHint"), lockSaving: st.t("lockSaving", p), lockLoading: st.t("lockLoading", p), lockStopped: st.t("lockStopped", p), lockOpenStopped: st.t("lockOpenStopped") }; });
    const want = lang === "es" ? ES : EN;
    ok(Object.keys(want).every(k => words[k] === want[k]), `${dev}, ${lang}: the words (${Object.keys(want).filter(k => words[k] !== want[k]).map(k => k + "=" + words[k]).join("; ") || "all as written"})`);
    await m.evaluate(w => { const st = __aogStudio; document.getElementById("lockLine").textContent = w.lockSaving; st.bigLine(true, false); st.KEEP.note = w.lockSaving; st.bigLine(true, true); }, words);
    await m.waitForTimeout(200);
    const f = await m.evaluate(() => { const r = el => el.getBoundingClientRect(), big = document.getElementById("lkBig"), box = document.getElementById("lkNew"), h = document.getElementById("lkNewH");
      return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, big: !big.hidden && r(big).width > 0 && r(big).right <= innerWidth, box: !box.hidden && !h.hidden && r(h).right <= innerWidth, hint: h.textContent }; });
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    ok(f.sw <= f.iw && f.big && f.box && f.hint === want.bigHint && !pc.length && !pk.length,
      `${dev}, ${theme}, ${lang}: the keep-the-screen-open line under the locker and on the console fits (${JSON.stringify(f).slice(0, 160)}), reads (${pc.length} unreadable ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await m.locator("#carryBlk").screenshot({ path: path.join(OUT, `locker3-${dev.split(" ")[0].toLowerCase()}-${theme}.png`) }).catch(() => {});
    await m.locator("#lkNew").screenshot({ path: path.join(OUT, `locker3-new-${dev.split(" ")[0].toLowerCase()}-${theme}.png`) }).catch(() => {});
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the phone or the iPad " + errs.join(" | "));
  console.log("shots: " + OUT);
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
