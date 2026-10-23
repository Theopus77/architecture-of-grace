/* AOG-LOCKER-V2 (2026-10-23) — Jimmy has an iPhone, an iPad, computers and his family's; the locker, his no-account way to move
   songs between them, made a showstopper. The locker here is the v2 locker script, run in node against a pretend Google
   (../lib/fakegas.js): since AOG-LOCKER-V3 it is kept as it was (fixtures/AoG-Studio-Locker-v2.gs), so this suite is also
   today's desk on a v2 script (the whole song each save, as before; studio/locker3.js drives the v3 script). The v1 script
   is kept as it was too (fixtures/AoG-Studio-Locker-v1.gs). Port 9283.
   · one link: the script's "link" prints /the-studio#locker=…&k=…; an iPad opens it in the Studio, which opens the Mixing Desk
     connected, says so in one line, and takes the link out of both address bars; a whole link pasted into the web address box
     on a Mac connects at once;
   · Keep this song in my locker: on, it saves at once; then about 20 s after the last change (not at 19 s); never while it plays
     or records; when the page is hidden; each save carries its device and time, shown under the switch; and with nothing
     changing, no request at all for 60 s of the page's time and 10 s of real time;
   · the iPad: "A newer version from your Mac (…) is in your locker." with Keep this one (not offered again) and Open it (the
     Mac's song, byte for byte); both changed: "This song changed here and on your Mac (…)", Keep mine (it goes up as the
     newest, and the Mac is then offered the iPad's) and Open the locker's;
   · the locker keeps the last 3 saves; Songs in your locker shows the device and time; Earlier saves opens one, and the newest
     is not offered again;
   · a take: a guitar take and a Vocal Booth take (its sound, its dry recording) sent from an iPhone show up in the iPad's
     Takes sent here, "from your iPhone", byte for byte, and leave the locker; the iPhone is not handed its own takes back;
     the voice take goes on track 8 as a voice, with its sound and dry recording;
   · a v1 script: the desk says once "Update your locker script to use this. Your songs and key stay the same." with the
     steps; no switch, no Send to my locker, no new requests; Save to my locker works as before;
   · aog.studio.locker.v1 survives the front page's Clear my data and Reset everything, the dashboard's Delete everything
     (and is not in its backup), Start a new song and the switch; only Disconnect removes it;
   · an iPhone and an iPad, light and dark, English and Spanish: nothing sideways, 44 px, readable and calm; no page errors. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), os = require("os");
const PORT = 9283, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const OUT = process.env.AOG_SHOTS || fs.mkdtempSync(path.join(os.tmpdir(), "locker2-"));
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => { pg.on("pageerror", e => errs.push(pg.url().split("/").pop().slice(0, 40) + ": " + e.message)); pg.on("dialog", d => d.accept()); }); }
const W = ms => new Promise(r => setTimeout(r, ms));

/* the two lockers: the real v2 script, and v1 as it was */
const fakeGas = require("../lib/fakegas.js");
const URL2 = "https://script.google.com/macros/s/AKfycbLOCKERtwo_123456/exec", URL1 = "https://script.google.com/macros/s/AKfycbLOCKERone_123456/exec";
const G = fakeGas(fs.readFileSync(path.join(__dirname, "fixtures/AoG-Studio-Locker-v2.gs"), "utf8"), { url: URL2, now: Date.now() });   /* AOG-LOCKER-V3: the v2 script, as it was */
const G1 = fakeGas(fs.readFileSync(path.join(__dirname, "fixtures/AoG-Studio-Locker-v1.gs"), "utf8"), { now: Date.now() });
G.run("setup"); G1.run("setup");
const KEY = G.props.LOCKER_KEY, KEY1 = G1.props.LOCKER_KEY;
const LINK = G.run("link").find(l => l.includes("#locker=")) || "";
const HASH = LINK.slice(LINK.indexOf("#")), HASH1 = "#locker=" + encodeURIComponent(URL1) + "&k=" + KEY1;
const MAC_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
async function routes(ctx, log) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  for (const [u, g] of [[URL2, G], [URL1, G1]]) await ctx.route(x => x.href.startsWith(u), r => {
    if (r.request().method() !== "POST") return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(g.get()) });
    let body = {}; try { body = JSON.parse(r.request().postData()); } catch (e) {}
    g.clock.now = Date.now();
    if (log) log.push((g === G1 ? "v1:" : "") + body.action);
    r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(g.post(body)) });
  });
  await ctx.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/qrcodejs/, r => r.fulfill({ contentType: "text/javascript",
    body: "window.QRCode=function(el,o){var c=document.createElement('canvas');c.width=o.width;c.height=o.height;el.appendChild(c);};window.QRCode.CorrectLevel={M:0};" }));
}
/* a take of a few bars, a note a bar, into Takes sent here */
const TAKE = `(async (n, freqs, from) => { const sr = 44100, head = 0.05, bar = 2.4, sec = head + bar * freqs.length, len = Math.round(sec * sr);
  const ab = new ArrayBuffer(44 + len * 4), v = new DataView(ab), s = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  s(0, "RIFF"); v.setUint32(4, 36 + len * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, len * 4, true);
  let ph = 0;
  for (let i = 0; i < len; i++) { const t = i / sr - head; let x = 0;
    if (t >= 0) { const k = Math.min(freqs.length - 1, Math.floor(t / bar)); ph += 2 * Math.PI * freqs[k] / sr; x = Math.round(9000 * Math.sin(ph)); }
    v.setInt16(44 + i * 4, x, true); v.setInt16(46 + i * 4, x, true); }
  await AOGHandoff.add(AOGHandoff.INBOX, { from: from || "guitar", n, name: { en: "Guitar take " + n, es: "Toma de guitarra " + n }, sec, bpm: 100, at: Date.now() + n, take: true,
    wav: new Blob([ab], { type: "audio/wav" }) }, { key: "l2|" + n });
})`;
async function put(p, take, track) {
  await p.selectOption("#trackSel", String(track));
  const v = await p.evaluate(nm => [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === nm).value, take);
  await p.selectOption("#srcSel", v); await p.click("#putBtn");
  await p.waitForFunction(t => __aogStudio.SONG.tracks[t].clip && !__aogStudio.S.busy, track, { timeout: 15000 });
}
const state = p => p.evaluate(async () => {
  const st = __aogStudio, S = JSON.parse(JSON.stringify(st.SONG));
  S.tracks.forEach(x => { if (x.clip) delete x.clip.peakDb; });
  const sums = [];
  for (const x of S.tracks) if (x.clip) { const v = await st.sget(x.clip.id); const u = new Uint8Array(await v.wav.arrayBuffer()); let h = 0; for (let i = 0; i < u.length; i += 7) h = (h * 31 + u[i]) >>> 0; sums.push(u.length + ":" + h); }
  return { song: JSON.stringify(Object.assign(S, { sel: 0 })), sums: sums.join(","), sid: S.sid };
});
const vol = async (p, i, v) => { await p.evaluate(([i, v]) => { const r = document.getElementById("t" + i + "-vol"); r.value = String(v); r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true })); }, [i, v]); await W(400); };   /* the desk keeps a change 200 ms later (saveSoon): the locker's 20 s count from there */
const volOf = (p, i) => p.evaluate(i => __aogStudio.SONG.tracks[i].vol, i);
const txt = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.trim() : null; }, sel);
const shown = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return !!e && !e.hidden && !!e.offsetParent; }, sel);
const hide = (p, on) => p.evaluate(on => { if (on) { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" }); }
  else { delete document.hidden; delete document.visibilityState; } document.dispatchEvent(new Event("visibilitychange")); }, on);
const saves = sid => G.live().filter(f => f.name.startsWith("s" + sid)).map(f => JSON.parse(f.files.find(x => x.name === "song.json" && !x.trashed).bytes)).sort((a, b) => b.at - a.at);
const TIME = /\d{1,2}:\d\d\s?[AP]M/;
const until = async (fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 20000)) { if (await fn()) return true; await W(150); } return false; };

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* 1 · one link: the iPad opens the script's link in the Studio */
  ok(LINK === "https://architectureofgrace.com/the-studio#locker=" + encodeURIComponent(URL2) + "&k=" + KEY, "the locker script's link: the Studio at architectureofgrace.com, the address and key after #");
  const padLog = [], pad = await b.newContext({ ...pw.devices["iPad (gen 7)"] }); watch(pad); await routes(pad, padLog); await pad.clock.install();
  const P = await pad.newPage(); await P.goto(U + "the-studio" + HASH);
  let D = null; await until(async () => (D = P.frames().find(f => /\/music-studio\.html/.test(f.url()))) && await D.evaluate(() => !!window.__aogStudio).catch(() => false));
  ok(!!D, "the Studio opens the Mixing Desk for the link");
  await until(() => D.evaluate(() => /Locker connected/.test(document.getElementById("locker").textContent)));
  const pst = await D.evaluate(() => ({ lk: JSON.parse(localStorage.getItem("aog.studio.locker.v1") || "null"), hash: location.hash, line: document.getElementById("lockLine").textContent.trim(), light: document.querySelector("#locker .st-lkl").textContent }));
  ok(pst.lk && pst.lk.url === URL2 && pst.lk.key === KEY && /^[a-z0-9]{8,40}$/.test(pst.lk.did), "the iPad keeps the address and key, and its own device id");
  ok(P.url().endsWith("/the-studio#studio") && pst.hash === "", "the link left both address bars: " + P.url().split("/").pop());
  ok(pst.line === "Your locker is connected on this device." && /Locker script v2/.test(pst.light), "one kind line: " + pst.line + " · " + pst.light.replace(/\s+/g, " "));

  /* 2 · the Mac: the whole link pasted into the web address box */
  const macLog = [], mac = await b.newContext({ viewport: { width: 1280, height: 900 }, userAgent: MAC_UA }); watch(mac); await routes(mac, macLog); await mac.clock.install();
  const M = await mac.newPage(); await M.goto(U + "music-studio.html"); await M.waitForTimeout(600);
  await M.click("#foldSave > summary");
  ok(await txt(M, "#locker .st-field .st-lab") === "Web address or device link", "the box says it takes the device link too");
  await M.fill("#lkUrl", LINK);
  await M.waitForSelector("#lkKeep", { timeout: 10000 });
  ok(await M.evaluate(() => { const o = JSON.parse(localStorage.getItem("aog.studio.locker.v1") || "null"); return !!o; }) && await txt(M, "#lockLine") === "This device is connected to your locker.",
    "pasting the whole link connects at once: " + await txt(M, "#lockLine"));
  ok(await M.evaluate(([u, k]) => { const o = JSON.parse(localStorage.getItem("aog.studio.locker.v1")); return o.url === u && o.key === k; }, [URL2, KEY]), "the address and key were read out of the link");

  /* 3 · a song on the Mac; Keep this song in my locker */
  await M.evaluate(`(async()=>{ const add=${TAKE}; await add(1, [220,330]); await add(2, [440,550]); })()`);
  await M.waitForFunction(() => __aogStudio.INBOX.items.length === 2, null, { timeout: 8000 });
  await put(M, "Guitar take 1", 0); await put(M, "Guitar take 2", 1);
  await M.fill("#songName", "Rainy day"); await M.evaluate(() => document.getElementById("songName").blur());
  const SID = (await state(M)).sid;
  ok(/^[a-z0-9]{12}$/.test(SID), "the song has its own id: " + SID);
  ok(await txt(M, "#lkKeep + span") === "Keep this song in my locker" && await txt(M, "#lkKeepAt") === "Not in your locker yet." && !(await M.isChecked("#lkKeep")), "the switch, off, and the line under it");
  macLog.length = 0;
  await M.check("#lkKeep");
  await until(() => M.evaluate(() => !!__aogStudio.LK.id && !__aogStudio.KEEP.busy));
  let sv = saves(SID);
  ok(sv.length === 1 && sv[0].dev === "Mac" && sv[0].name === "Rainy day" && macLog.join(" ") === "begin part finish", "on: it saves at once, as the Mac (" + macLog.join(" ") + ")");
  ok(new RegExp("^Saved to your locker · Mac · " + TIME.source + "$").test(await txt(M, "#lkKeepAt")), "under the switch: " + await txt(M, "#lkKeepAt"));
  macLog.length = 0;
  await vol(M, 0, 61);
  await mac.clock.fastForward(19000); await W(400);
  ok(macLog.length === 0, "19 s after a change: nothing yet (" + macLog.join(" ") + ")");
  await mac.clock.fastForward(2000);
  await until(() => macLog.includes("finish") && M.evaluate(() => !__aogStudio.KEEP.busy));
  sv = saves(SID);
  ok(macLog.join(" ") === "begin part finish" && sv.length === 2 && sv[0].dev === "Mac", "about 20 s after the last change, it saved quietly (" + macLog.join(" ") + ")");
  ok(await txt(M, "#lockLine") === "This device is connected to your locker.", "quietly: the locker's line did not change");

  /* never while it plays */
  macLog.length = 0;
  await M.evaluate(() => { __aogStudio.SONG.loopOn = true; __aogStudio.SONG.loopFrom = 1; __aogStudio.SONG.loopTo = 2; });
  await vol(M, 0, 62);
  await M.evaluate(() => __aogStudio.play());
  await until(() => M.evaluate(() => __aogStudio.PLAY.on), 5000);
  await mac.clock.fastForward(21000); await W(500);
  ok(await M.evaluate(() => __aogStudio.PLAY.on) && macLog.length === 0, "while it plays: no save (" + macLog.join(" ") + ")");
  await M.evaluate(() => __aogStudio.stop());
  await mac.clock.fastForward(21000);
  await until(() => macLog.includes("finish") && M.evaluate(() => !__aogStudio.KEEP.busy));
  ok(macLog.join(" ") === "begin part finish" && saves(SID)[0].dev === "Mac", "once it stops, the change goes (" + macLog.join(" ") + ")");
  await M.evaluate(() => { __aogStudio.SONG.loopOn = false; });

  /* never while it records */
  macLog.length = 0;
  await M.evaluate(() => { __aogStudio.VOICE.rec = true; });
  await vol(M, 0, 63);
  await mac.clock.fastForward(21000); await W(500);
  ok(macLog.length === 0, "while it records: no save (" + macLog.join(" ") + ")");
  await M.evaluate(() => { __aogStudio.VOICE.rec = false; __aogStudio.songChanged(); });   /* the take is in: Stop changes the song */
  await mac.clock.fastForward(21000);
  await until(() => macLog.includes("finish") && M.evaluate(() => !__aogStudio.KEEP.busy));
  ok(macLog.join(" ") === "begin part finish", "after recording, the change goes (" + macLog.join(" ") + ")");

  /* when the page is hidden */
  macLog.length = 0;
  await vol(M, 0, 64);
  await hide(M, true);
  await until(() => macLog.includes("finish") && M.evaluate(() => !__aogStudio.KEEP.busy), 8000);
  ok(macLog.join(" ") === "begin part finish", "hidden: the change goes at once (" + macLog.join(" ") + ")");
  macLog.length = 0; await hide(M, true); await W(600);
  ok(macLog.length === 0, "hidden again with nothing changed: nothing goes");
  await hide(M, false); await W(800);

  /* never polls */
  await mac.clock.fastForward(16000); await W(300); macLog.length = 0;
  await mac.clock.fastForward(60000); await W(600);
  const fake = macLog.length; await W(10000);
  ok(fake === 0 && macLog.length === 0, "with nothing changing: no request in 60 s of the page's time, nor in 10 s of real time (" + macLog.join(" ") + ")");
  ok(await M.evaluate(() => !__aogStudio.KEEP.timer), "and no timer waiting");

  /* 4 · the iPad opens the song; the newer version from the Mac */
  await D.evaluate(() => { document.getElementById("foldSave").open = true; });   /* the link opened it already */
  await D.click("#lkRefresh"); await until(() => D.evaluate(() => /Rainy day/.test(document.getElementById("locker").textContent)));
  const row = await D.evaluate(() => { const r = [...document.querySelectorAll("#locker .st-rec")].find(x => /Rainy day/.test(x.textContent)); return r ? r.querySelector(".st-cn").textContent : ""; });
  ok(new RegExp("^Mac · " + TIME.source + " · \\d+\\.\\d MB$").test(row) && await D.evaluate(() => /Earlier saves \(2\)/.test(document.getElementById("locker").textContent)),
    "Songs in your locker: the device and time of the last save (" + row + "), and its earlier saves");
  await D.click("[data-lkopen]");
  await until(() => D.evaluate(() => /is on the desk/.test(document.getElementById("lockLine").textContent) && __aogStudio.BUF.size === 2 && !__aogStudio.S.decoding), 30000);
  ok((await state(D)).sums === (await state(M)).sums && await volOf(D, 0) === 64, "the iPad opens the Mac's song");
  ok(!(await shown(D, "#lkNew")) && !(await shown(P, "#lkNew")), "nothing newer: no line");
  await vol(M, 1, 33);
  await hide(M, true); await until(() => M.evaluate(() => !__aogStudio.KEEP.busy && !__aogStudio.keepDirty())); await hide(M, false);
  padLog.length = 0;
  await pad.clock.fastForward(16000); await hide(D, true); await hide(D, false);
  await until(() => shown(D, "#lkNew"), 8000);
  const nl = await txt(D, "#lkNewT");
  ok(new RegExp("^A newer version from your Mac \\(" + TIME.source + "\\) is in your locker\\.$").test(nl) && padLog.join(" ") === "check", "back in view, one question, one calm line: " + nl + " (" + padLog.join(" ") + ")");
  ok(await txt(D, "#lkNewOpen") === "Open it" && await txt(D, "#lkNewKeep") === "Keep this one" && await volOf(D, 1) !== 33, "Open it / Keep this one; the song is not changed on its own");
  await D.click("#lkNewKeep");
  ok(!(await shown(D, "#lkNew")) && await volOf(D, 1) !== 33, "Keep this one: the line goes, the song stays");
  await pad.clock.fastForward(16000); await hide(D, true); await hide(D, false); await W(1200);
  ok(!(await shown(D, "#lkNew")), "that version is not offered again");
  await vol(M, 1, 34); await hide(M, true); await until(() => M.evaluate(() => !__aogStudio.KEEP.busy && !__aogStudio.keepDirty())); await hide(M, false);
  await pad.clock.fastForward(16000); await hide(D, true); await hide(D, false);
  await until(() => shown(D, "#lkNew"), 8000);
  ok(/^A newer version from your Mac/.test(await txt(D, "#lkNewT")), "a newer one again: the line again");
  await D.click("#lkNewOpen");
  await until(() => D.evaluate(() => !__aogStudio.CARRY.busy && __aogStudio.SONG.tracks[1].vol === 34 && /on the desk/.test(document.getElementById("lockLine").textContent)), 30000);
  const A1 = await state(M), B1 = await state(D);
  ok(A1.song === B1.song && A1.sums === B1.sums, "Open it: the Mac's song, the same in every byte");
  ok(await txt(D, "#lkNewT") === "Rainy day is on the desk." && !(await shown(D, "#lkNewOpen")), "and says so: " + await txt(D, "#lkNewT"));

  /* both changed: Keep mine */
  await vol(D, 2, 20);   /* the iPad changes it (its switch is off) */
  await vol(M, 1, 35); await hide(M, true); await until(() => M.evaluate(() => !__aogStudio.KEEP.busy && !__aogStudio.keepDirty())); await hide(M, false);
  await pad.clock.fastForward(16000); await hide(D, true); await hide(D, false);
  await until(() => D.evaluate(() => /changed here/.test(document.getElementById("lkNewT").textContent)), 8000);
  const bl = await txt(D, "#lkNewT");
  ok(new RegExp("^This song changed here and on your Mac \\(" + TIME.source + "\\)\\.$").test(bl) && await txt(D, "#lkNewOpen") === "Open the locker's" && await txt(D, "#lkNewKeep") === "Keep mine",
    "both changed, said plainly: " + bl);
  await D.click("#lkNewKeep");
  await until(() => D.evaluate(() => /^Saved to your locker/.test(document.getElementById("lkNewT").textContent)), 15000);
  sv = saves(SID);
  ok(sv[0].dev === "iPad" && new RegExp("^Saved to your locker · iPad · " + TIME.source + "$").test(await txt(D, "#lkNewT")), "Keep mine: it went up as the newest, from the iPad: " + await txt(D, "#lkNewT"));
  await mac.clock.fastForward(16000); await hide(M, true); await hide(M, false);
  await until(() => shown(M, "#lkNew"), 8000);
  ok(/^A newer version from your iPad \(/.test(await txt(M, "#lkNewT")), "the Mac is offered the iPad's: " + await txt(M, "#lkNewT"));
  await M.click("#lkNewOpen");
  await until(() => M.evaluate(() => !__aogStudio.CARRY.busy && __aogStudio.SONG.tracks[2].vol === 20), 30000);
  ok((await state(M)).song === (await state(D)).song, "the Mac opens it: the same song on both");

  /* both changed: Open the locker's (the Mac's switch off for this, so its own change stays on the Mac) */
  await M.uncheck("#lkKeep");
  await vol(M, 3, 45);
  await D.evaluate(() => { document.getElementById("foldSave").open = true; });
  await vol(D, 3, 56); await D.click("#lkSave");
  await until(() => D.evaluate(() => /is in your locker/.test(document.getElementById("lockLine").textContent) && !__aogStudio.CARRY.busy), 15000);
  await mac.clock.fastForward(16000); await hide(M, true); await hide(M, false);
  await until(() => M.evaluate(() => /changed here and on your iPad/.test(document.getElementById("lkNewT").textContent)), 8000);
  ok(/^This song changed here and on your iPad/.test(await txt(M, "#lkNewT")), "the Mac: both changed: " + await txt(M, "#lkNewT"));
  await M.click("#lkNewOpen");
  await until(() => M.evaluate(() => !__aogStudio.CARRY.busy && __aogStudio.SONG.tracks[3].vol === 56), 30000);
  ok(await volOf(M, 3) === 56 && (await state(M)).song === (await state(D)).song, "Open the locker's: the iPad's song on the Mac");
  await M.check("#lkKeep");

  /* 5 · three saves kept; Earlier saves */
  sv = saves(SID);
  ok(sv.length === 3 && G.live().filter(f => f.name.startsWith("s" + SID)).length === 3, "the locker keeps the last 3 saves of the song (" + sv.map(x => x.dev).join(", ") + ")");
  await M.evaluate(() => { document.getElementById("foldSave").open = true; });
  await M.click("#lkRefresh"); await until(() => M.evaluate(() => !!document.querySelector("#locker .st-earl")));
  ok(await txt(M, "#locker .st-earl summary") === "Earlier saves (2)", "one short line: " + await txt(M, "#locker .st-earl summary"));
  await M.click("#locker .st-earl summary");
  const er = await M.evaluate(() => [...document.querySelectorAll("#locker .st-erow span")].map(s => s.textContent));
  ok(er.length === 2 && er.every(x => new RegExp("^(iPad|Mac) · " + "\\d{1,2}:\\d\\d\\s?[AP]M$").test(x)), "each earlier save: its device and time (" + er.join(" | ") + ")");
  ok(sv[0].dev === "iPad" && sv[1].dev === "iPad" && sv[2].dev === "Mac", "the three: the iPad's save, Keep mine, and the Mac's before them");
  await M.click("#locker .st-erow:last-child [data-lkopen]");
  await M.waitForSelector("#openAsk:not([hidden])"); await M.click("#openYes");
  await until(() => M.evaluate(() => !__aogStudio.CARRY.busy && /is on the desk/.test(document.getElementById("lockLine").textContent)), 30000);
  const ev = [await volOf(M, 1), await volOf(M, 2), await volOf(M, 3)];
  ok(ev[0] === 35 && ev[1] !== 20 && ev[3 - 1] !== 56, "the earliest save opens: the Mac's, before the iPad's changes (" + ev.join(", ") + ")");
  await mac.clock.fastForward(16000); await hide(M, true); await hide(M, false); await W(1500);
  ok(!(await shown(M, "#lkNew")) || !/newer|changed/.test(await txt(M, "#lkNewT")), "opened on purpose: the newest is not offered over it");

  /* 6 · a take from the iPhone to the iPad */
  const phLog = [], ph = await b.newContext({ ...pw.devices["iPhone 13"] }); watch(ph); await routes(ph, phLog);
  const Q = await ph.newPage(); await Q.goto(U + "music-studio.html" + HASH); await Q.waitForTimeout(800);
  await until(() => Q.evaluate(() => __aogStudio.CARRY.ver === 2));
  await Q.evaluate(`(async()=>{ const add=${TAKE}; await add(7, [330,440,550]); })()`);
  await Q.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
  ok(await Q.evaluate(() => { const b = document.querySelector("#inbox [data-lksend]"); return !!b && b.textContent === "Send to my locker" && b.getBoundingClientRect().height >= 44; }), "each take sent here has Send to my locker");
  await Q.click("#inbox [data-lksend]");
  await until(() => Q.evaluate(() => /is in your locker/.test(document.getElementById("inboxLine").textContent)), 15000);
  ok(await txt(Q, "#inboxLine") === "Guitar take 7 is in your locker for your other devices.", "the iPhone: " + await txt(Q, "#inboxLine"));
  /* a Vocal Booth take on track 8: its sound and its dry recording */
  const vsum = await Q.evaluate(async () => {
    const sr = 44100, n = sr * 2, L = new Float32Array(n), R = new Float32Array(n), dry = new Float32Array(n);
    for (let i = 0; i < n; i++) { const t = i / sr; dry[i] = t > 0.2 ? 0.3 * Math.sin(2 * Math.PI * 226 * t) : 0; L[i] = dry[i] * 0.8 + 0.1 * Math.sin(2 * Math.PI * 452 * t) * (t > 0.2); R[i] = L[i] * 0.9; }
    const r = await __aogStudio.voicePut({ L, R, dry, sr, head: 0.2, body: 1.8, startBar: 2, snd: "harmony", loop: false });
    const c = __aogStudio.SONG.tracks[7].clip, w = await __aogStudio.sget(c.id), d = await __aogStudio.sget(c.dry);
    const h = async b => { const u = new Uint8Array(await b.arrayBuffer()); let x = 0; for (let i = 0; i < u.length; i += 3) x = (x * 31 + u[i]) >>> 0; return u.length + ":" + x; };
    return { name: r.name, snd: c.snd, wav: await h(w.wav), dry: await h(d.wav) };
  });
  await Q.selectOption("#trackSel", "7");
  await Q.waitForSelector("#voiceLock", { timeout: 5000 });
  ok(await txt(Q, "#voiceLock") === "Send to my locker", "the voice take on track 8 has Send to my locker too");
  await Q.click("#voiceLock");
  await until(() => Q.evaluate(() => /is in your locker/.test(document.getElementById("recLine").textContent)), 15000);
  ok(await txt(Q, "#recLine") === vsum.name + " is in your locker for your other devices.", "the voice take: " + await txt(Q, "#recLine"));
  ok(G.live(G.root().folders.find(f => f.name === "takes")).length === 2, "two takes wait in the locker");
  phLog.length = 0; await Q.evaluate(() => __aogStudio.lockCheck(true)); await W(800);
  ok(phLog.join(" ") === "check" && await Q.evaluate(() => __aogStudio.INBOX.items.length === 1), "the iPhone is not handed its own takes back");
  /* the iPad: Add a recording opened */
  padLog.length = 0;
  await D.evaluate(() => { const f = document.getElementById("foldAdd"); f.open = false; });
  await W(200); await D.evaluate(() => { document.getElementById("foldAdd").open = true; });
  await until(() => D.evaluate(() => __aogStudio.INBOX.items.filter(x => x.dev === "iPhone").length === 2), 20000);
  ok(padLog[0] === "check" && padLog.filter(x => x === "takeDone").length === 2, "opening Add a recording asks the locker, and fetches both (" + padLog.join(" ") + ")");
  const cards = await D.evaluate(() => [...document.querySelectorAll("#inbox .st-rec")].map(r => r.querySelector(".st-cn").textContent));
  ok(cards.filter(c => /from your iPhone/.test(c)).length === 2, "Takes sent here, marked from your iPhone: " + cards.filter(c => /iPhone/.test(c)).join(" | "));
  ok(G.live(G.root().folders.find(f => f.name === "takes")).length === 0, "received: out of the locker");
  const got = await D.evaluate(async () => { const it = __aogStudio.INBOX.items.filter(x => x.dev === "iPhone"), out = {};
    const h = async b => { const u = new Uint8Array(await b.arrayBuffer()); let x = 0; for (let i = 0; i < u.length; i += 3) x = (x * 31 + u[i]) >>> 0; return u.length + ":" + x; };
    for (const x of it) { const r = await AOGHandoff.item(AOGHandoff.INBOX, x.id); out[x.voice ? "voice" : "guitar"] = { id: x.id, from: x.from, snd: x.snd, wav: await h(r.wav), dry: r.dry ? await h(r.dry) : "", name: x.name, sec: x.sec }; }
    return out; });
  ok(got.guitar && got.guitar.from === "guitar" && got.guitar.name.en === "Guitar take 7", "the guitar take arrived as itself");
  ok(got.voice && got.voice.from === "vocal" && got.voice.snd === "harmony" && got.voice.wav === vsum.wav && got.voice.dry === vsum.dry, "the voice take arrived with its sound and its dry recording, byte for byte");
  const onT = await D.evaluate(async id => { await __aogStudio.putOn("take:" + id, 7); const c = __aogStudio.SONG.tracks[7].clip, d = c && c.dry ? await __aogStudio.sget(c.dry) : null;
    const h = async b => { const u = new Uint8Array(await b.arrayBuffer()); let x = 0; for (let i = 0; i < u.length; i += 3) x = (x * 31 + u[i]) >>> 0; return u.length + ":" + x; };
    return c ? { voice: c.voice, snd: c.snd, dry: d ? await h(d.wav) : "", bar: c.startBar, head: c.head } : null; }, got.voice.id);
  ok(onT && onT.voice && onT.snd === "harmony" && onT.dry === vsum.dry && onT.bar === 2 && Math.abs(onT.head - 0.2) < 0.01, "on track 8 it is a voice again: its sound, its dry take, bar 2 (" + JSON.stringify(onT) + ")");
  ok(await D.evaluate(() => !__aogStudio.SONG.tracks.some(x => x.clip && x.clip.tid && __aogStudio.INBOX.items.some(y => y.id === x.clip.tid && y.from === "guitar" && y.dev))), "a take from another device is never put on a track by itself");

  /* 7 · a v1 script */
  const oldLog = [], old = await b.newContext({ viewport: { width: 1280, height: 900 }, userAgent: MAC_UA }); watch(old); await routes(old, oldLog);
  const O = await old.newPage(); await O.goto(U + "music-studio.html"); await O.waitForTimeout(600);
  await O.click("#foldSave > summary"); await O.fill("#lkUrl", U + "the-studio" + HASH1);
  await until(() => O.evaluate(() => /Locker connected/.test(document.getElementById("locker").textContent)));
  const said = await O.evaluate(() => (document.body.innerText.match(/Update your locker script to use this\. Your songs and key stay the same\./g) || []).length);
  ok(said === 1 && !(await O.$("#lkKeep")), "a v1 script: said once, plainly; no switch (" + said + ")");
  await O.click("#locker .st-old summary");
  const how = await O.evaluate(() => [...document.querySelectorAll("#locker .st-old li")].map(l => l.textContent));
  ok(how.length === 3 && /script\.google\.com/.test(how[0]) && /Save/.test(how[1]) && /Manage deployments.*Edit.*New version.*Deploy/.test(how[2]), "a short how-to: " + how.join(" / "));
  await O.evaluate(`(async()=>{ const add=${TAKE}; await add(3, [220,330]); })()`);
  await O.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
  ok(!(await O.$("#inbox [data-lksend]")), "no Send to my locker on a take with a v1 script");
  await put(O, "Guitar take 3", 0);
  oldLog.length = 0; await O.click("#lkSave"); await until(() => O.evaluate(() => /is in your locker/.test(document.getElementById("lockLine").textContent)), 15000);
  ok(oldLog.join(" ") === "v1:begin v1:part v1:finish v1:list", "Save to my locker works as before (" + oldLog.join(" ") + ")");
  oldLog.length = 0; await hide(O, true); await hide(O, false); await O.evaluate(() => { const f = document.getElementById("foldAdd"); f.open = false; f.open = true; }); await W(1500);
  ok(oldLog.length === 0, "and asks it nothing new (" + oldLog.join(" ") + ")");
  await old.close();

  /* 8 · aog.studio.locker.v1 survives every clear and reset */
  const kc = await b.newContext({ acceptDownloads: true }); watch(kc); await routes(kc);
  const LKV = JSON.stringify({ url: URL2, key: KEY, did: "keepme12345678" });
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
  ok(bk.length > 10 && !bk.includes(KEY) && !bk.includes("AKfycbLOCKERtwo") && !bk.includes("keepme12345678"), "the dashboard's backup file never carries the locker");
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

  /* 9 · Spanish */
  await D.evaluate(() => document.getElementById("langBtn").click());
  await D.evaluate(() => { document.getElementById("foldSave").open = true; });
  await until(() => D.evaluate(() => !!document.getElementById("lkKeep")));
  ok(await txt(D, "#lkKeep + span") === "Guardar esta canción en mi casillero" && /^Guardada en tu casillero · iPad · /.test(await txt(D, "#lkKeepAt")), "Spanish: " + await txt(D, "#lkKeep + span") + " · " + await txt(D, "#lkKeepAt"));
  ok(await D.evaluate(() => [...document.querySelectorAll("#inbox [data-lksend]")].every(b => b.textContent === "Enviar a mi casillero") && /de tu iPhone/.test(document.getElementById("inbox").textContent)), "Enviar a mi casillero · de tu iPhone");
  await D.evaluate(() => document.getElementById("langBtn").click());

  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await mac.close(); await pad.close(); await ph.close();

  /* 10 · an iPhone and an iPad, light and dark: the switch, the earlier saves and the newer line fit, read and are calm */
  for (const [dev, theme, lang] of [["iPhone 13", "light", "en"], ["iPhone 13", "dark", "es"], ["iPad (gen 7)", "dark", "en"], ["iPad (gen 7)", "light", "es"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(([th, lang, u, k, sid]) => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1");
      if (lang === "es") localStorage.setItem("aog.lang", "es");
      if (!localStorage.getItem("aog.studio.v1")) { localStorage.setItem("aog.studio.locker.v1", JSON.stringify({ url: u, key: k }));
        localStorage.setItem("aog.studio.v1", JSON.stringify({ v: 1, tracks: [], sid: sid, name: "Rainy day" })); localStorage.setItem("aog.studio.lockkeep.v1", JSON.stringify({ on: true, lk: {} })); } } catch (e) {} }, [theme, lang, URL2, KEY, SID]);
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(900);
    await until(() => shown(m, "#lkNew"), 10000);
    await m.evaluate(() => { document.getElementById("foldSave").open = true; });
    await m.waitForSelector("#locker .st-earl", { timeout: 10000 }); await m.click("#locker .st-earl summary");
    await m.waitForTimeout(200);
    const f = await m.evaluate(() => { const r = el => el.getBoundingClientRect(), boxes = [document.getElementById("carryBlk"), document.getElementById("lkNew")];
      const btn = boxes.flatMap(b => [...b.querySelectorAll("button,summary,label.st-ksw")]).filter(x => x.offsetParent);
      return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, minBtn: Math.min(...btn.map(x => Math.round(r(x).height))), right: Math.max(...btn.map(x => Math.round(r(x).right))), n: btn.length,
        line: document.getElementById("lkNewT").textContent, ks: (() => { const l = r(document.querySelector("label.st-ksw")), s = r(document.querySelector("label.st-ksw span")), a = r(document.getElementById("lkKeepAt")); return { w: Math.round(s.width), lines: Math.round(s.height / 20), gap: Math.round(a.top - l.bottom) }; })() }; });   /* the switch: its words on one or two lines, the line under it below it */
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    ok(f.sw <= f.iw && f.ks.w >= 150 && f.ks.lines <= 2 && f.ks.gap >= 0 && f.minBtn >= 44 && f.right <= f.iw && !pc.length && !pk.length && (lang === "es" ? /^Hay una versión más nueva de tu iPad/ : /^A newer version from your iPad/).test(f.line),
      `${dev}, ${theme}, ${lang}: fits (${JSON.stringify(f)}), reads (${pc.length} unreadable ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await m.locator("#lkNew").screenshot({ path: path.join(OUT, `locker2-new-${dev.split(" ")[0].toLowerCase()}-${theme}.png`) }).catch(() => {});
    await m.locator("#carryBlk").screenshot({ path: path.join(OUT, `locker2-${dev.split(" ")[0].toLowerCase()}-${theme}.png`) });
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the phone or the iPad " + errs.join(" | "));
  console.log("shots: " + OUT);
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
