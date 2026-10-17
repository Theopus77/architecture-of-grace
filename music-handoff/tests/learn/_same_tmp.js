const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const L2 = require("./listen2.js");
const srv = require("../srv.js")(9287), srv2 = require("../srv.js")(9288);
const HARNESS = `<!doctype html><html><head><meta charset="utf-8"><title>t</title></head><body><script src="aog-learn.js"></script><script>(${L2.synth2.toString()})();</script></body></html>`;
(async () => {
  const b = await pw.chromium.launch();
  const open = async (port, noW) => { const c = await b.newContext(); await c.route("**/__t.html", r => r.fulfill({ contentType: "text/html", body: HARNESS }));
    if (noW) await c.addInitScript(() => { delete window.Worker; window.Worker = undefined; });
    const p = await c.newPage(); await p.goto(`http://localhost:${port}/__t.html`); await p.waitForFunction(() => window.AOGLearn && window.renderSong); return p; };
  const p = await open(9287), q = await open(9288, true);
  for (let rep = 0; rep < 3; rep++) for (const S of L2.FORMS) {
    const a = await p.evaluate(async ({ ev, sec }) => AOGLearn.analyze(await renderSong(ev, sec), { name: "x" }), S);
    const z = await q.evaluate(async ({ ev, sec }) => AOGLearn.analyze(await renderSong(ev, sec), { name: "x" }), S);
    const dk = Object.keys(a).filter(k => JSON.stringify(a[k]) !== JSON.stringify(z[k]));
    console.log(rep, S.name, dk.length ? "DIFF " + dk.map(k => k + " " + JSON.stringify(a[k]).slice(0, 120) + " | " + JSON.stringify(z[k]).slice(0, 120)).join(" ; ") : "same");
  }
  await b.close(); srv.close(); srv2.close();
})();
