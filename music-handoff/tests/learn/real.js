/* AOG-LEARN-V1 (2026-10-11) — the real listening engine (aog-learn.js) behind the rooms' Learn a song, with no stand-in:
   a starter-crate song chosen in the Piano and in the Guitar is heard, kept, and shows its key, tempo and chords on the
   bars. No page errors. Port 9299. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const path = require("path"), fs = require("fs");
const PORT = 9299, U = "http://localhost:" + PORT + "/"; const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
(async () => {
  let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] }); const errs = [];
  for (const [room, file, meta, want] of [["music-piano.html", "audio/crate/02-porch-light.mp3", "C major · 80 beats a minute", /Cmaj7.*Fmaj7.*Dm7.*G7/],
                                          ["music-guitar.html", "audio/crate/01-paper-kites.mp3", "D minor · 90 beats a minute", /Dm.*Gm.*F/]]) {
    const c = await b.newContext({ viewport: { width: 1366, height: 900 }, serviceWorkers: "block" });
    c.on("page", pg => pg.on("pageerror", e => errs.push(e.message)));
    await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
    const p = await c.newPage(); await p.goto(U + room); await p.waitForTimeout(1200);
    await p.evaluate(() => { const bx = document.getElementById("lgBox"); if (!bx.open) bx.querySelector("summary").click(); });
    await p.setInputFiles("#lgFile", { name: path.basename(file), mimeType: "audio/mpeg", buffer: fs.readFileSync(path.join(ROOT, file)) });
    const t0 = Date.now();
    await p.waitForFunction(() => window.AOGLearnUI && AOGLearnUI.test.state().open, null, { timeout: 60000 }).catch(() => {});
    const s = await p.evaluate(() => ({ st: AOGLearnUI.test.state(), say: document.getElementById("lgSay").textContent, meta: (document.getElementById("lgMeta") || {}).textContent,
      bars: [...document.querySelectorAll("#lgBars .lg-bar")].slice(0, 12).map(e => e.textContent).join(" "), opts: [...document.getElementById("lgFollow").options].map(o => o.textContent).join("|") }));
    ok(s.st.open && s.say === "Kept on this device. It opens at once next time." && s.meta.startsWith(meta) && want.test(s.bars) && s.opts === "The chords|The tune",
      `${room}: ${file} heard in ${((Date.now() - t0) / 1000).toFixed(1)} s: ${s.meta} · ${s.bars}`);
    await c.close();
  }
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
