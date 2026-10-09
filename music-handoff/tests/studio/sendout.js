/* AOG-STUDIO-SENDOUT-V1 — STUDIO-HANDOFF §12, Jimmy's first pick: "Send it out … leaves the Studio as a file".
   Three takes on three tracks, the third muted, the song named "Rainy day". Send it out makes rainy-day.wav: its loudest
   moment at −1 dB, the muted track named as left out; Download saves it and says so; Share… hands that very file to the
   share sheet (a pretend one: the test browser has none) and says Sent; with no share sheet there is no Share button.
   A quiet song comes up by 12 dB at most; a silent song is told plainly and nothing is made. Each track on its own makes
   one .zip that any unzip opens, with a .wav per track heard, each as long as the song's file and at its level.
   Spanish; an iPhone and an iPad, light and dark: nothing sideways, readable and calm; no page errors. Port 9248. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
const PORT = 9248, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const OUTD = process.env.AOG_SHOTS || fs.mkdtempSync(path.join(os.tmpdir(), "sendout-"));
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
async function routes(ctx) { await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort()); }
const TAKE = `(async (n, freqs) => { const sr = 44100, head = 0.05, bar = 2.4, sec = head + bar * freqs.length, len = Math.round(sec * sr);
  const ab = new ArrayBuffer(44 + len * 4), v = new DataView(ab), s = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  s(0, "RIFF"); v.setUint32(4, 36 + len * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, len * 4, true);
  let ph = 0;
  for (let i = 0; i < len; i++) { const t = i / sr - head; let x = 0;
    if (t >= 0) { const k = Math.min(freqs.length - 1, Math.floor(t / bar)); ph += 2 * Math.PI * freqs[k] / sr; x = Math.round(7000 * Math.sin(ph)); }
    v.setInt16(44 + i * 4, x, true); v.setInt16(46 + i * 4, x, true); }
  await AOGHandoff.add(AOGHandoff.INBOX, { from: "guitar", n, name: { en: "Guitar take " + n, es: "Toma de guitarra " + n }, sec, bpm: 100, at: Date.now() + n, take: true,
    wav: new Blob([ab], { type: "audio/wav" }) }, { key: "out|" + n });
})`;
async function put(p, take, track) {
  await p.selectOption("#trackSel", String(track));
  const v = await p.evaluate(nm => [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === nm).value, take);
  await p.selectOption("#srcSel", v); await p.click("#putBtn");
  await p.waitForFunction(t => __aogStudio.SONG.tracks[t].clip && !__aogStudio.S.busy, track, { timeout: 15000 });
}
async function song(p) {
  await p.evaluate(`(async()=>{ const add=${TAKE}; await add(1, [220,330,440,550]); await add(2, [660,550,440,330]); await add(3, [880,880,880,880]); })()`);
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 3, null, { timeout: 8000 });
  await put(p, "Guitar take 1", 0); await put(p, "Guitar take 2", 1); await put(p, "Guitar take 3", 2);
  await p.fill("#songName", "Rainy day");
  await p.click('#mixer .st-strip[data-tr="2"] [data-ms="mute"]');
}
const line = (p, id) => p.evaluate(i => document.getElementById(i).textContent.trim(), id);
async function sendOut(p) {
  await p.evaluate(() => { __aogStudio.OUT.song = null; document.getElementById("outBox").innerHTML = ""; });
  await p.click("#outBtn");
  await p.waitForFunction(() => !__aogStudio.OUT.busy && (__aogStudio.OUT.song || document.getElementById("outLine").textContent), null, { timeout: 60000 });
}
/* the peak (dB) and length of the file Send it out made */
const fileInfo = p => p.evaluate(async () => {
  const o = __aogStudio.OUT.song; if (!o) return null;
  const buf = await new OfflineAudioContext(2, 1, 44100).decodeAudioData(await o.file.arrayBuffer());
  let pk = 0; for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > pk) pk = a; } }
  return { name: o.file.name, db: +(20 * Math.log10(pk)).toFixed(2), frames: buf.length, g: o.g, size: o.file.size };
});

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* 1 · a computer with no share sheet */
  const c = await b.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true }); watch(c); await routes(c);
  const p = await c.newPage(); await p.goto(U + "music-studio.html"); await p.waitForTimeout(700);
  ok(await p.textContent("#outBtn") === "Send it out" && await p.isDisabled("#outBtn"), "Send it out sits beside Make the mix, and waits for a recording");
  await song(p);
  ok(!(await p.isDisabled("#outBtn")), "with a song on the desk, Send it out can be pressed");
  await sendOut(p);
  let f = await fileInfo(p);
  ok(f && f.name === "rainy-day.wav" && Math.abs(f.db + 1) < 0.15, `the file: ${JSON.stringify(f)} (its loudest moment at −1 dB)`);
  const box = await line(p, "outBox");
  ok(box.includes("Your file is ready") && box.includes("This file stays yours. Nothing is uploaded.") && box.includes("Not in the file: track 3."), "the box: " + box);
  ok(!(await p.$("[data-outshare]")), "with no share sheet, there is no Share button");
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click('[data-outdl="song"]')]);
  const wavPath = path.join(OUTD, dl.suggestedFilename()); await dl.saveAs(wavPath);
  ok(dl.suggestedFilename() === "rainy-day.wav" && fs.statSync(wavPath).size === f.size && fs.readFileSync(wavPath).slice(0, 4).toString() === "RIFF" && await line(p, "outLine") === "Saved: rainy-day.wav.",
    "Download saves rainy-day.wav and says so");

  /* 2 · each track on its own */
  await p.click("#stemBtn");
  await p.waitForFunction(() => __aogStudio.OUT.stems && !__aogStudio.OUT.busy, null, { timeout: 90000 });
  const [dz] = await Promise.all([p.waitForEvent("download"), p.click('[data-outdl="stems"]')]);
  const zipPath = path.join(OUTD, dz.suggestedFilename()); await dz.saveAs(zipPath);
  const z = JSON.parse(cp.execFileSync("python3", ["-I", "-c", `import zipfile,sys,json,wave,io
z=zipfile.ZipFile(sys.argv[1]); bad=z.testzip(); out=[]
for n in z.namelist():
    w=wave.open(io.BytesIO(z.read(n))); out.append([n,w.getnframes(),w.getnchannels(),w.getframerate()])
print(json.dumps({"bad":bad,"files":out}))`, zipPath]).toString());
  ok(dz.suggestedFilename() === "rainy-day-tracks.zip" && z.bad === null && z.files.length === 2, "the .zip opens with any unzip and holds the two tracks heard: " + JSON.stringify(z.files.map(x => x[0])));
  ok(z.files.every(x => x[1] === f.frames && x[2] === 2 && x[3] === 44100) && z.files[0][0] === "rainy-day-track-1-guitar-take-1.wav" && z.files[1][0] === "rainy-day-track-2-guitar-take-2.wav",
    "each is a stereo .wav as long as the song's file, named by its track");
  ok((await line(p, "outBox")).includes("Each track on its own: 2 files in one .zip"), "the box says what the .zip holds");

  /* 3 · a quiet song comes up 12 dB at most; a silent song is told plainly */
  await p.evaluate(() => { const r = document.getElementById("m-vol") || document.querySelector('#master input[data-k="vol"]'); r.value = "20"; r.dispatchEvent(new Event("input", { bubbles: true })); });
  await sendOut(p); f = await fileInfo(p);
  ok(f && Math.abs(f.g - Math.pow(10, 12 / 20)) < 1e-6 && f.db < -1.2, `a very quiet song comes up 12 dB, no more (${f && f.db} dB)`);
  for (const i of [0, 1]) await p.click(`#mixer .st-strip[data-tr="${i}"] [data-ms="mute"]`);
  await sendOut(p);
  ok(await line(p, "outLine") === "Your song is silent, so there is nothing to send. Turn a track up first." && !(await p.evaluate(() => __aogStudio.OUT.song)), "a silent song is told plainly, and nothing is made");
  await p.evaluate(() => document.getElementById("langBtn").click());
  ok(await p.textContent("#outBtn") === "Compártela", "Spanish: " + await p.textContent("#outBtn"));
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();

  /* 4 · a device with a share sheet: Share… hands over the very file */
  const sh = await b.newContext({ ...pw.devices["iPhone 13"] }); watch(sh); await routes(sh);
  await sh.addInitScript(() => { window.__shared = []; navigator.canShare = d => !!(d && d.files && d.files.length);
    navigator.share = async d => { window.__shared.push({ n: d.files.length, name: d.files[0].name, size: d.files[0].size, type: d.files[0].type }); }; });
  const q = await sh.newPage(); await q.goto(U + "music-studio.html"); await q.waitForTimeout(700);
  await song(q); await sendOut(q);
  const fq = await fileInfo(q);
  ok(!!(await q.$('[data-outshare="song"]')), "on a phone with a share sheet, Share… is there");
  await q.click('[data-outshare="song"]');
  const shared = await q.evaluate(() => window.__shared);
  ok(shared.length === 1 && shared[0].name === "rainy-day.wav" && shared[0].size === fq.size && shared[0].type === "audio/wav" && await line(q, "outLine") === "Sent.", "Share… hands rainy-day.wav to the share sheet: " + JSON.stringify(shared));
  await sh.close();

  /* 5 · an iPhone and an iPad, light and dark */
  for (const [dev, theme] of [["iPhone 13", "light"], ["iPhone 13", "dark"], ["iPad (gen 7)", "light"], ["iPad (gen 7)", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {}
      navigator.canShare = d => !!(d && d.files); navigator.share = async () => {}; }, theme);
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(700);
    await song(m); await sendOut(m);
    await m.click("#stemBtn"); await m.waitForFunction(() => __aogStudio.OUT.stems && !__aogStudio.OUT.busy, null, { timeout: 90000 });
    await m.locator("#outBox").scrollIntoViewIfNeeded(); await m.waitForTimeout(200);
    const fit = await m.evaluate(() => { const r = el => el.getBoundingClientRect(), box = document.getElementById("outBox"), btn = [...box.querySelectorAll("button,a.st-btn")].concat([document.getElementById("outBtn")]).filter(x => x.offsetParent);
      return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, minBtn: Math.min(...btn.map(x => Math.round(r(x).height))), right: Math.max(...btn.map(x => Math.round(r(x).right))) }; });
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    ok(fit.sw <= fit.iw && fit.minBtn >= 44 && fit.right <= fit.iw && !pc.length && !pk.length,
      `${dev}, ${theme}: fits (${JSON.stringify(fit)}), reads (${pc.length} unreadable ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await m.locator("#outBox").screenshot({ path: path.join(OUTD, `sendout-${dev.split(" ")[0].toLowerCase()}-${theme}.png`) });
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the phone or the iPad " + errs.join(" | "));
  console.log("files: " + OUTD);
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
