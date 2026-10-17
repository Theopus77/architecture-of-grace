/* AOG-DESK-REF-V1 (slice 6 of the DAW build) — compare your mix with a song (A/B):
   · aog-desk-ref.js is fetched only when Compare with a song first opens; a song file chosen there is read on the device
     (no request leaves the page but that one file of the site), its loudness the desk's own LUFS (in a Worker);
   · while the song plays, one tap switches from your mix (A) to the reference (B) and back: with Same loudness on, what
     you hear is as loud either way (within 0.5 dB, measured on the speakers' signal); off, the louder reference is louder;
   · the reference starts with the song's bar 1, exactly where the song is heard; it rests when the song stops;
   · Spanish; an iPhone and an iPad, light and dark. Port 9345. */
const T = require("./lib.js"), { ok, near, add, put, HELP } = T;
const fs = require("fs"), os = require("os"), path = require("path");
const PORT = 9345, U = "http://localhost:" + PORT + "/", srv = T.srv(PORT);
const REF = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "deskref-")), "my-favourite.wav");
(() => { const sr = 48000, n = sr * 12, b = Buffer.alloc(44 + n * 4); b.write("RIFF", 0); b.writeUInt32LE(36 + n * 4, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 4, 40);
  let z = 0x1234567; for (let i = 0; i < n; i++) { z ^= z << 13; z ^= z >>> 17; z ^= z << 5; const x = Math.round(12000 * (((z >>> 0) / 4294967296) * 2 - 1)); b.writeInt16LE(x, 44 + i * 4); b.writeInt16LE(x, 46 + i * 4); } fs.writeFileSync(REF, b); })();
const sel = (p, id, v) => p.evaluate(([id, v]) => { const s = document.getElementById(id); s.value = String(v); s.dispatchEvent(new Event("change", { bubbles: true })); }, [id, v]);
const view = async (p, v) => { await p.evaluate(() => { const d = document.getElementById("pmBox"); if (!d.open) { d.open = true; d.dispatchEvent(new Event("toggle")); } }); await p.waitForTimeout(50); await sel(p, "pmView", v); await p.waitForTimeout(50); };
/* the LUFS of a stretch of the recording of the speakers' signal, with the desk's own meter */
const SEG = `(a, b) => { const r = __T.live, sr = __T.lsr, i0 = Math.round(a * sr - r.f0), i1 = Math.round(b * sr - r.f0); return lufsInt(kPow([r.L.subarray(i0, i1), r.R.subarray(i0, i1)], sr)); }`;
async function abRun(p) {
  await p.evaluate(() => { const s = document.getElementById("startSel"); s.value = "1"; s.dispatchEvent(new Event("change", { bubbles: true })); __aogStudio.play(); });
  await p.waitForTimeout(300);
  await p.evaluate(() => __T.recOn()); await p.evaluate(() => AOGDeskRef.out.connect(__T.node));
  const t0 = await p.evaluate(() => __aogStudio.AC.currentTime);
  await p.waitForTimeout(2600);
  const ct = await p.evaluate(() => { document.getElementById("abBtn").click(); return __aogStudio.AC.currentTime; });
  await p.waitForTimeout(2600);
  const b = await p.evaluate(() => ({ w: document.getElementById("abBtn").textContent, p: document.getElementById("abBtn").getAttribute("aria-pressed"), live: __aogStudio.LIVE.out.gain.value }));
  await p.evaluate(() => document.getElementById("abBtn").click()); await p.waitForTimeout(200);
  await p.evaluate(() => __aogStudio.stop()); await p.waitForTimeout(150); await p.evaluate(() => { try { AOGDeskRef.out.disconnect(__T.node); } catch (e) {} __T.recOff(); });
  const l = await p.evaluate(`((t0, ct) => { const seg = ${SEG}; return { A: seg(t0 + 0.4, ct - 0.1), B: seg(ct + 0.2, ct + 2.4) }; })(${t0}, ${ct})`);
  return Object.assign(l, b);
}

(async () => {
  const b = await T.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); T.watch(c); await T.routes(c);
  const reqs = []; c.on("request", r => reqs.push(r.method() + " " + r.url().replace(U, "/")));
  const p = await c.newPage();
  await p.goto(U + "music-studio.html"); await p.waitForTimeout(600); await T.ready(p);
  await add(p, { n: 1, kind: "noise", bars: 5, amp: 3000 });
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
  await put(p, 1, 0); await p.evaluate(HELP);
  const before = await p.evaluate(() => !!window.AOGDeskRef);
  const n0 = reqs.length;
  await view(p, "ab"); await p.waitForFunction(() => window.AOGDeskRef && document.getElementById("abPick"), null, { timeout: 8000 });
  const pane = await p.evaluate(() => [...document.querySelectorAll("#refPane .st-line, #refPane button")].map(e => e.textContent).join(" | "));
  ok(!before && pane === "Compare your mix with a song you like. It stays on this device and is never saved or sent. | Choose a song to compare | On an iPad or iPhone, pick Choose File, then your song.", "fetched when Compare with a song first opens: " + pane);
  await p.setInputFiles("#refIn", REF);
  await p.waitForFunction(() => AOGDeskRef.R.buf && isFinite(AOGDeskRef.R.mix) && !AOGDeskRef.R.busy, null, { timeout: 30000 });
  const info = await p.evaluate(async () => { const R = AOGDeskRef.R, chs = [R.buf.getChannelData(0), R.buf.getChannelData(1)], own = loudOf(chs[0], chs[1], R.buf.sampleRate).lufs; const mix = await __aogStudio.renderSong(null), mo = loudOf(mix.Lc, mix.Rc, 44100).lufs;
    return { ref: R.lufs, own, mix: R.mix, mo, gain: 20 * Math.log10(R.gain), lines: [...document.querySelectorAll("#refPane .st-line")].map(e => e.textContent) }; });
  const net = reqs.slice(n0).filter(r => !/^GET (\/|blob:)/.test(r));
  ok(near(info.ref, info.own, 0.01) && near(info.mix, info.mo, 0.01) && near(info.gain, info.mix - info.ref, 0.01) && info.lines[2] === `The reference: my-favourite · ${(info.ref < 0 ? "−" : "") + Math.abs(info.ref).toFixed(1)} LUFS · Your mix: ${(info.mix < 0 ? "−" : "") + Math.abs(info.mix).toFixed(1)} LUFS` && /plays [\d.]+ dB quieter/.test(info.lines[3]) && net.length === 0,
    `the reference's loudness ${info.ref.toFixed(2)} LUFS and the mix's ${info.mix.toFixed(2)}, as the desk's own meter reads them; it will play ${info.gain.toFixed(2)} dB; nothing sent anywhere (every request reads the site's own files; ${net.length} others); "${info.lines[3]}"`);

  /* A/B, the same loudness */
  const r1 = await abRun(p);
  const lg = await p.evaluate(() => ({ log: AOGDeskRef.R.log[0], srcs: AOGDeskRef.R.srcs.length, live: __aogStudio.LIVE.out.gain.value }));
  ok(near(r1.A, r1.B, 0.5) && r1.p === "true" && r1.w === "Hearing B: the reference. Tap for A." && r1.live < 0.01, `one tap from A to B while it plays: your mix ${r1.A.toFixed(2)} LUFS, the reference ${r1.B.toFixed(2)} LUFS on the speakers (within 0.5 dB); "${r1.w}"`);
  ok(near(lg.log.when, lg.log.at + lg.log.lag, 0.5 / 44100 + 1e-9) && lg.log.off < 1 / 44100 && lg.srcs === 0 && lg.live === 1, `the reference starts with bar 1 on the sample where the song is heard (${(lg.log.lag * 1000).toFixed(1)} ms after it is sent, as the desk's chain); stopped, it rests and your mix is back`);
  /* not the same loudness */
  await p.click("#abSame");
  const r2 = await abRun(p);
  ok(r2.B - r2.A > 5, `with Same loudness off, the reference is ${(r2.B - r2.A).toFixed(1)} dB louder: louder would win`);
  await p.click("#abSame");
  ok(reqs.slice(n0).filter(r => !/^GET (\/|blob:)/.test(r)).length === 0, "still nothing sent anywhere: every request is the page reading the site's own files");
  const hush = await p.evaluate(async () => { const n = AOGDeskRef.R.srcs.length; await new Promise(r => setTimeout(r, 400)); return n + AOGDeskRef.R.srcs.length; });
  ok(hush === 0, "nothing of the reference plays while the song is stopped");

  /* Spanish */
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(100); await view(p, "ab");
  const es = await p.evaluate(() => [...document.querySelectorAll("#refPane button")].map(e => e.textContent).join(" | "));
  ok(es === "Elegir otra canción | Quitar la referencia | Oyes A: tu mezcla. Toca para B. | Misma sonoridad: encendido", "in Spanish: " + es);
  await p.click("#abRm"); await p.waitForTimeout(80);
  ok(await p.evaluate(() => !AOGDeskRef.R.buf && !document.getElementById("abBtn")), "Quitar la referencia: it is gone");
  await c.close();

  await T.looks(b, U, async m => { await view(m, "ab"); await m.waitForFunction(() => document.getElementById("abPick")); await m.evaluate(() => document.getElementById("proMaster").scrollIntoView({ block: "start" })); }, "#proMaster button, #proMaster select", "Compare with a song");
  await T.done(b, srv);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
