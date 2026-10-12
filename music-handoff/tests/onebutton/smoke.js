const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const srv = require("../srv.js")(9311);
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  const p = await c.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push("console: " + m.text()); });
  await p.goto("http://localhost:9311/" + (process.argv[2] || "music-piano.html")); await p.waitForTimeout(1500);
  await p.evaluate(() => { document.getElementById("obBox").open = true; });
  await p.waitForFunction(() => window.AOGOne && AOGOne.ready && document.getElementById("obOn"));
  await p.click("#obOn"); await p.waitForTimeout(300);
  await p.evaluate(() => { window.__mv = []; const o = window.makeVoice; if (o) window.makeVoice = function (c, ch, id, m, v, when) { __mv.push([m, +(when || 0).toFixed(3), +c.currentTime.toFixed(3)]); return o.apply(this, arguments); }; });
  for (let i = 0; i < 4; i++) { await p.keyboard.down("Space"); await p.waitForTimeout(200); await p.keyboard.up("Space"); await p.waitForTimeout(330); }
  await p.waitForTimeout(500);
  console.log(JSON.stringify(await p.evaluate(() => ({ mv: window.__mv, next: AOGOne._t.next(), cfg: AOGOne._t.cfg(), big: document.getElementById("obBig").getBoundingClientRect().height }))));
  console.log("errs", errs);
  await b.close(); srv.close();
})();
