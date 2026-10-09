/* AOG-DECKS-SAY-V1 — Jimmy: "The loops option and the taps don't work on the turn table!" Every press answers, on an iPad:
   with no record, a loop, a pad or TAP says to load a song first; a loop on a stopped record starts it so the loop is
   heard, and says so; pressing it again lets go; the first tap on an empty pad marks the spot and says so; TAP counts
   the taps and then says the tempo it set. Spanish. No page errors. Port 9935. */
const { pw, ok, done } = require("./lib.js");
const srv = require("../srv.js")(9935);
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ ...pw.devices["iPad (gen 7) landscape"] }); const p = await c.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message)); await p.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await p.goto("http://localhost:9935/music-decks.html"); await p.waitForTimeout(1500);
  const line = () => p.evaluate(() => document.getElementById("chopLineA").textContent);
  await p.tap("#deckA .dmore > summary"); await p.waitForTimeout(200);
  await p.tap('[data-loop="A"][data-beats="4"]'); const l1 = await line();
  await p.tap('[data-hot="A"][data-i="0"]'); const l2 = await line();
  await p.tap('[data-tap="A"]'); const l3 = await line();
  ok([l1, l2, l3].every(x => x === "Load a song on this deck first."), "with no record, a loop, a pad and TAP each say to load a song first");
  await p.evaluate(() => loadMade(decks[0], "house"));
  await p.waitForFunction(() => decks[0].buf && decks[0].bpm > 0 && (decks[0].node || decks[0].core), null, { timeout: 60000 });
  await p.tap('[data-loop="A"][data-beats="4"]'); await p.waitForTimeout(1500);
  const s = await p.evaluate(() => { const d = decks[0]; return { on: d.loopOn, motor: d.motor, a: d.loopA, b: d.loopB, pos: d.pos }; });
  ok(s.on && s.motor && s.pos >= s.a - 1 && s.pos <= s.b + 1 && await line() === "Looping 4 beats. Tap it again to let go.", "a loop on a stopped record starts it, inside the loop, and says so: " + await line());
  await p.tap('[data-loop="A"][data-beats="4"]'); await p.waitForTimeout(200);
  ok(!(await p.evaluate(() => decks[0].loopOn)) && await line() === "Loop off. The record plays on.", "tapped again, the loop lets go: " + await line());
  await p.tap('[data-hot="A"][data-i="1"]'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => decks[0].cues[1] != null) && await line() === "Pad 2 marks this spot. Tap it again to jump back here.", "the first tap on an empty pad marks the spot and says so");
  const taps = [];
  for (let i = 0; i < 3; i++) { await p.tap('[data-tap="A"]'); await p.waitForTimeout(500); taps.push(await line()); }
  ok(taps[0] === "Tap 1 · keep tapping in time with the beat." && taps[1] === "Tap 2 · keep tapping in time with the beat." && /^Tempo set: 1\d\d beats a minute\.$/.test(taps[2]), "TAP counts, then sets the tempo: " + taps.join(" / "));
  await p.evaluate(() => { const b = document.querySelector('[data-lang="es"]') || document.getElementById("langBtn"); if (b) b.click(); }); await p.waitForTimeout(400);
  if (!(await p.evaluate(() => document.querySelector("#deckA .dmore").open))) await p.tap("#deckA .dmore > summary");
  await p.tap('[data-loop="A"][data-beats="2"]'); await p.waitForTimeout(300);
  ok(/^En bucle 2 pulsos\. Tócalo otra vez para soltarlo\.$/.test(await line()), "in Spanish: " + await line());
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await b.close(); srv.close(); process.exit(done() ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
