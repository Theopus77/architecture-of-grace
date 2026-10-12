/* AOG-CHOPS-LONGER-V1 (2026-10-12) — Jimmy: "Why are the chops like 1/10 of a second?" The Turntables send 32 beats of the
   record; on the Drum Machine each of pads 1–16 starts a beat after the last and plays "Each pad plays" long: 2 beats
   unless chosen, or 1 beat, or 1 bar; pads 17–24 start two beats apart and play twice as long; no pad is a tiny blip; a
   chop really sounds that long; Spanish. No page errors. Port 9295. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const PORT = 9295, U = "http://localhost:" + PORT + "/"; const srv = require("../srv.js")(PORT);
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
(async () => { const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] }); const errs = [];
  const c = await b.newContext({ serviceWorkers: "block", viewport: { width: 1024, height: 768 } }); await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  c.on("page", pg => pg.on("pageerror", e => errs.push(e.message)));
  const p = await c.newPage();
  await p.goto(U + "music-decks.html"); await p.waitForTimeout(1500);
  await p.evaluate(() => loadMade(decks[0], "house")); await p.waitForFunction(() => decks[0].buf && decks[0].bpm > 0, null, { timeout: 60000 });
  await p.evaluate(() => chopsToPads(decks[0])); await p.waitForTimeout(800);
  await p.goto(U + "music-pads.html"); await p.waitForTimeout(4000);
  const look = () => p.evaluate(async () => { const bi = S.banks.findIndex(x => x.type === "chops"); S.bank = bi; await prep(bi); const R = READY[bi], info = recInfo(S.banks[bi].rec);
    return { sec: info.sec, bpm: info.bpm, ch: (R.chops || []).map(x => x && [+x[0].toFixed(3), +x[1].toFixed(3)]) }; });
  let r = await look(); const beat = 60 / r.bpm;
  ok(Math.abs(r.sec - 32 * beat) < 0.05, `the Turntables send 32 beats (${r.sec} s at ${r.bpm})`);
  const near = (x, y) => Math.abs(x - y) < 0.01;
  ok(r.ch.slice(0, 16).every((x, i) => x && near(x[0], i * beat) && near(x[1], 2 * beat)), "pads 1–16 start a beat apart and play 2 beats: " + JSON.stringify(r.ch.slice(0, 3)));
  ok(r.ch.slice(16).every((x, i) => x && near(x[0], 2 * i * beat) && near(x[1], 4 * beat)), "pads 17–24 start two beats apart and play 4 beats: " + JSON.stringify(r.ch.slice(16, 18)));
  ok(r.ch.every(x => !x || x[1] > 0.06), "no pad is a tiny blip");
  await p.evaluate(() => paintSetRow());
  ok(await p.evaluate(() => { const s = document.getElementById("fClen"); return s && [...s.options].map(o => o.textContent).join("|") === "1 beat · about 0.5 s|2 beats · about 1 s|1 bar · about 1.9 s" && s.value === "2"; }), "the chops bank has Each pad plays: 1 beat | 2 beats | 1 bar, each with about how long, on 2 beats");
  for (const [v, n] of [["1", 1], ["4", 4]]) {
    await p.selectOption("#fClen", v); await p.waitForTimeout(300); r = await look();
    ok(r.ch.slice(0, 16).every(x => x && near(x[1], Math.min(n * beat, r.sec - x[0]))), `Each pad plays ${v === "1" ? "1 beat" : "1 bar"}: ${JSON.stringify(r.ch.slice(0, 2))}`);
  }
  await p.selectOption("#fClen", "2"); await p.waitForTimeout(300); await look();
  /* it really sounds that long: pad 1 starts its sound for 2 beats */
  const heard = await p.evaluate(async () => { const st = AudioBufferSourceNode.prototype.start, got = [];
    AudioBufferSourceNode.prototype.start = function (w, off, dur) { got.push(dur); return st.apply(this, arguments); };
    hitPad(S.bank, 0, 0.9, ctx().currentTime + 0.05); await new Promise(r => setTimeout(r, 200)); AudioBufferSourceNode.prototype.start = st; return got.filter(x => x != null); });
  ok(heard.length >= 1 && Math.abs(heard[0] - 2 * beat) < 0.01, "pad 1 sounds for 2 beats: " + heard.map(x => x.toFixed(3)).join(" ") + " s");
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await p.evaluate(() => { S0.lang = "es"; paintSetRow(); });
  const es = await p.evaluate(() => { const s = document.getElementById("fClen"); return s ? s.closest("label").querySelector("span").textContent + ": " + [...s.options].map(o => o.textContent).join("|") : ""; });
  ok(es === "Cada pad suena: 1 tiempo · unos 0,5 s|2 tiempos · unos 1 s|1 compás · unos 1,9 s", "in Spanish: " + es);
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
