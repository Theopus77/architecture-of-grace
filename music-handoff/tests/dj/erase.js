/* AOG-DJ-ERASE-V1 (2026-10-12) — Jimmy: "The erase on the turn table for the chops should not be hidden if the chops are not
   hidden." On an iPad, with More closed (the Simple bench), each deck's Erase shows right with its pads; it empties a pad
   that holds a spot. Port 9294. */
const { pw, ok, done } = require("./lib.js");
const srv = require("../srv.js")(9294);
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ ...pw.devices["iPad (gen 7) landscape"] }); const p = await c.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); await p.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await p.goto("http://localhost:9294/music-decks.html"); await p.waitForTimeout(1500);
  await p.evaluate(() => { document.body.classList.add("bench-simple"); document.querySelectorAll(".dmore").forEach(x => x.open = false); });
  const seen = await p.evaluate(() => ["A", "B"].map(id => { const e = document.querySelector('[data-erase="' + id + '"]'), pad = document.querySelector('[data-hot="' + id + '"][data-i="0"]');
    const r = e && e.getBoundingClientRect(), q = pad.getBoundingClientRect(); return { pads: q.width > 0, erase: !!r && r.width > 0 && r.height >= 40 && !e.closest("details:not([open])") }; }));
  ok(seen.every(s => s.pads && s.erase), "with More closed, each deck's Erase shows with its pads: " + JSON.stringify(seen));
  await p.evaluate(() => loadMade(decks[0], "house"));
  await p.waitForFunction(() => decks[0].buf && decks[0].bpm > 0, null, { timeout: 60000 });
  await p.tap('[data-hot="A"][data-i="2"]'); await p.waitForTimeout(200);
  const had = await p.evaluate(() => decks[0].cues[2] != null);
  await p.tap('[data-erase="A"]'); await p.waitForTimeout(150);
  const on = await p.evaluate(() => document.querySelector('[data-erase="A"]').getAttribute("aria-pressed"));
  await p.tap('[data-hot="A"][data-i="2"]'); await p.waitForTimeout(200);
  ok(had && on === "true" && await p.evaluate(() => decks[0].cues[2] == null && !decks[0].erase), "Erase, then the pad: the pad is empty again");
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await b.close(); srv.close(); done();
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
