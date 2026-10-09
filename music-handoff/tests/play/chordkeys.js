/* AOG-CHORD-KEYS-10-V1 — Jimmy: "I have only use 6 keys for the chords. There are 10, 1 through 0 should be used and the other
   keys if needed." On the guitar and the bass, 1 to 0 play the ten chord buttons in order; − and = would play an eleventh and
   a twelfth (there are ten, so they do nothing); each button shows its key once a key is pressed; the picture of the keys
   says so, English and Spanish; the same inside the Recording Studio. Solo: the letters start like the piano, with "Only the scale" as a choice (AOG-SOLO-KEYS-CHOICE-V1). The desk's Your songs
   button (AOG-DESK-SONGS-BTN-V1). No page errors. Port 9262. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const path = require("path");
const PORT = 9262, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
const KEYS = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0"];
const spy = f => f.evaluate(() => { window.__pd = []; if (!window.padDown.__spy) { const o = window.padDown; window.padDown = function (i) { window.__pd.push(i); return o.apply(this, arguments); }; window.padDown.__spy = 1; } });
(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  c.on("page", pg => pg.on("pageerror", e => errs.push(e.message)));
  await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await c.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  const p = await c.newPage();
  for (const inst of ["guitar", "bass"]) {
    await p.goto(U + "music-" + inst + ".html"); await p.waitForTimeout(1500);
    await p.mouse.click(5, 300); await spy(p);
    for (const k of KEYS.concat(["Minus", "Equal"])) { await p.keyboard.press(k); await p.waitForTimeout(60); }
    const got = await p.evaluate(() => window.__pd.join(","));
    ok(got === "0,1,2,3,4,5,6,7,8,9", `${inst}: 1 to 0 play the ten chords in order, − and = nothing more: ${got}`);
    const caps = await p.evaluate(() => [...document.querySelectorAll("#chordStrip .cs")].map(b => { const k = b.querySelector("kbd"); return k && getComputedStyle(k).display !== "none" ? k.textContent : "?"; }).join(""));
    const line = await p.evaluate(() => { const r = document.querySelector("#keyMap .km-row"); return [...r.querySelectorAll("kbd")].map(k => k.textContent).join("") + " " + r.querySelector(".km-say").textContent; });
    ok(caps === "1234567890" && line === "1234567890 the chords", `${inst}: each chord shows its key (${caps}); the picture of the keys says so: ${line}`);
    await p.evaluate(() => { const b = document.getElementById("langBtn"); if (b) b.click(); }); await p.waitForTimeout(400);
    ok(await p.evaluate(() => document.querySelector("#keyMap .km-row .km-say").textContent) === "los acordes", inst + ": in Spanish too");
    await p.evaluate(() => { const b = document.getElementById("langBtn"); if (b) b.click(); });
  }
  /* AOG-SOLO-KEYS-CHOICE-V1: in Solo the letters play every note as on the piano, unless "Only the scale" is chosen */
  await p.goto(U + "music-guitar.html"); await p.evaluate(() => { try { localStorage.removeItem("aog.guitar.solo.v1"); } catch (e) {} }); await p.reload(); await p.waitForTimeout(1500);
  await p.click('[data-so-mode="solo"]'); await p.waitForTimeout(600); await p.mouse.click(5, 300);
  const held = async code => { await p.keyboard.down(code); await p.waitForTimeout(100); const r = await p.evaluate(() => [...KEYCELLS.values()].map(c => { const [s, f] = c.split(":").map(Number); return (TUNING[s] + f) % 12; }).join(",")); await p.keyboard.up(code); return r; };
  const pianoMode = await p.evaluate(() => document.querySelector('[data-so-keys="piano"]').getAttribute("aria-pressed"));
  const a1 = await held("KeyA"), w1 = await held("KeyW");
  ok(pianoMode === "true" && a1 === "0" && w1 === "1", `Solo starts like the piano: A plays C (${a1}), W plays C♯ (${w1})`);
  await p.click('[data-so-keys="scale"]'); await p.mouse.click(5, 300);
  const w2 = (await held("KeyW")).split(",").filter(x => ["1","3","6","8","10"].includes(x)).join(""), kept = await p.evaluate(() => JSON.parse(localStorage.getItem("aog.guitar.solo.v1")).keys);
  ok(w2 === "" && kept === "scale", `"Only the scale": W plays no note between the white keys, and the choice is kept (${kept})`);
  await p.click('[data-so-keys="piano"]');

  /* AOG-DESK-SONGS-BTN-V1: Your songs on the console goes straight to saving and opening */
  await p.goto(U + "music-studio.html"); await p.waitForTimeout(1200);
  const sb = await p.evaluate(() => { const b = document.getElementById("songsBtn"); return { inTop: !!b.closest("#transport .st-top"), text: b.textContent }; });
  await p.click("#songsBtn"); await p.waitForTimeout(400);
  const at = await p.evaluate(() => { const r = document.getElementById("carryBlk").getBoundingClientRect(); return { top: Math.round(r.top), save: !!document.getElementById("fileSave"), lockOpen: !!document.querySelector("#locker details[open]") }; });
  ok(sb.inTop && /Your songs/.test(sb.text) && /Save or open/.test(sb.text) && at.top >= -2 && at.top < 200 && at.lockOpen, "Your songs sits on the console and opens Save, Open and the locker: " + JSON.stringify({ sb, at }));

  /* inside the Recording Studio: the keys reach the room */
  await p.goto(U + "the-studio#guitar");
  await p.waitForFunction(() => { const d = document.getElementById("room").contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && /guitar/.test(d.location.pathname); }, null, { timeout: 20000 });
  await p.waitForTimeout(1500);
  const f = p.frames().find(x => x.parentFrame() === p.mainFrame());
  await spy(f); await p.mouse.click(5, 120);
  for (const k of ["Digit7", "Digit0"]) { await p.keyboard.press(k); await p.waitForTimeout(80); }
  ok(await f.evaluate(() => window.__pd.join(",")) === "6,9", "in the Studio, 7 and 0 play the seventh and the tenth chord");
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
