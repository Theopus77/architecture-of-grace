const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const srv = require("../srv.js")(9311);
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  const p = await c.newPage(); await p.goto("http://localhost:9311/music-piano.html"); await p.waitForTimeout(1500);
  console.log(await p.evaluate(() => ({ prog: S.prog.length, act: document.activeElement.tagName })));
  await p.keyboard.press("Space"); await p.waitForTimeout(500);
  console.log(await p.evaluate(() => ({ playing: S.playing, act: document.activeElement.tagName + "#" + document.activeElement.id, line: (document.getElementById("ownLine") || {}).textContent })));
  await b.close(); srv.close();
})();
