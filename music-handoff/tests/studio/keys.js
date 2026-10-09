/* AOG-STUDIO-KEYS-V1, AOG-KIT-KEYS-V1, AOG-DECKS-KEYS-V1, AOG-DESK-KEYS-V1 — Jimmy: "I want the keyboard to be able to be
   used for all instruments in ways that make sense. At the moment nothing works with the keyboard or tapping keys."
   Inside the Recording Studio, after a tap on the room's door (the keyboard is then with the Studio, not the room), the
   keys play every room: the Drum Machine's pads, the Piano's keys and chords, the Guitar's and the Bass's strings, the
   Band's keys, the Drum Kit's drums (A S D F G H J K, 1 to 8, Shift harder; its letters show once a key is pressed), the
   Turntables (the left hand the left deck, the right hand the right: Q/P start and stop, W/O cue, A…/H… pads, ← → the
   crossfader), the Mixing Desk (1 to 8 a track, M mute, S solo, ↑ ↓ the fader, Space play). Keys stay with the Studio
   while a menu of the Studio is in use, and Space on one of the Studio's own buttons presses that button. Each room's
   keys line, English and Spanish; readable and calm in light and dark. No page errors. Port 9257. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9257, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
async function routes(ctx) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
}
const FILE = { pads: "music-pads.html", kit: "music-kit.html", piano: "music-piano.html", guitar: "music-guitar.html", bass: "music-bass.html", band: "music-band.html", decks: "music-decks.html", studio: "music-studio.html" };
const inner = p => p.frames().find(f => f.parentFrame() === p.mainFrame());
async function arrived(p, id) {
  await p.waitForFunction(f => { const d = document.getElementById("room").contentDocument;
    return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && d.location.pathname.endsWith(f); }, FILE[id], { timeout: 25000 });
  await p.waitForTimeout(1500);
}
/* count what the room plays: each room's own sound functions, wrapped */
const spy = f => f.evaluate(() => { window.__hits = []; for (const n of ["noteOn", "press", "padDown", "keyOn", "pluckCell", "pluckShape", "hit"]) {
  if (typeof window[n] === "function" && !window[n].__spy) { const o = window[n]; window[n] = function () { window.__hits.push(n + ":" + [].slice.call(arguments, 0, 3).join(",")); return o.apply(this, arguments); }; window[n].__spy = 1; } } });
const hits = f => f.evaluate(() => window.__hits.slice());
async function tapDoor(p, id) { await p.click(`.sh-doors a[data-room="${id}"]`); await arrived(p, id); }

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage(); await p.goto(U + "the-studio#pads"); await arrived(p, "pads");

  /* 1 · the instruments, inside the Studio, after a tap on their door */
  const PLAYS = [["pads", ["KeyZ", "KeyA", "Digit1"], /^press:/], ["piano", ["KeyA", "KeyW", "Digit1"], /^(noteOn|padDown):/], ["guitar", ["KeyA", "KeyS", "Digit2"], /^(pluck\w+|padDown):/],
    ["bass", ["KeyA", "Digit1"], /^(pluck\w+|padDown):/], ["band", ["KeyA", "Digit1"], /^(keyOn|noteOn|padDown):/]];
  for (const [id, keys, re] of PLAYS) {
    if (id !== "pads") await tapDoor(p, id); else await tapDoor(p, "pads");
    const f = inner(p); await spy(f);
    for (const k of keys) { await p.keyboard.down(k); await p.waitForTimeout(120); await p.keyboard.up(k); await p.waitForTimeout(150); }
    const h = await hits(f);
    ok(h.length >= keys.length && h.every(x => re.test(x)), `${id}: after a tap on its door, the keys ${keys.join(" ")} play it: ${h.join(" | ")}`);
  }
  /* the Drum Kit: the home row, 1 to 8, Shift harder; the letters on the drums */
  await tapDoor(p, "kit"); let f = inner(p);
  await f.waitForFunction(() => ready(), null, { timeout: 30000 }); await spy(f);
  for (const k of ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "Digit1"]) { await p.keyboard.press(k); await p.waitForTimeout(90); }
  await p.keyboard.down("Shift"); await p.keyboard.press("KeyS"); await p.keyboard.up("Shift"); await p.waitForTimeout(150);
  let h = await hits(f);
  ok(h.map(x => x.split(",")[1]).join(" ") === "kick snare ch oh tom rim bell clap kick snare" && /,2$/.test(h[h.length - 1]),
    "kit: A S D F G H J K play kick, snare, hi-hat, open hat, tom, ride, crash and the eighth piece; 1 plays the kick; Shift S plays the snare harder: " + h.join(" | "));
  const kk = await f.evaluate(() => ({ on: document.documentElement.classList.contains("aog-keys"), letters: [...document.querySelectorAll("#pageKit .kkey")].filter(e => getComputedStyle(e).display !== "none").map(e => e.textContent).sort().join(""),
    line: getComputedStyle(document.getElementById("kitKeys")).display !== "none" ? document.getElementById("kitKeys").textContent : "" }));
  ok(kk.on && kk.letters === "ADFGHJKS" && /^On a keyboard, A S D F G H J K play the drums/.test(kk.line), "kit: once a key is pressed the letters show on the drums, with one line saying so: " + JSON.stringify(kk));
  await p.keyboard.press("Space"); await p.waitForTimeout(500);
  ok(await f.evaluate(() => BT.on), "kit: Space starts the beat to play along with");
  await p.keyboard.press("Space"); await p.waitForTimeout(300);
  ok(!(await f.evaluate(() => BT.on)), "kit: Space stops it");
  /* the Studio keeps its own keys: a menu of the Studio in use, and Space on a Studio button */
  await spy(f);
  await p.focus("#mtAdd"); await p.keyboard.press("KeyA"); await p.waitForTimeout(150);
  ok((await hits(f)).length === 0, "keys typed into the Studio's own menu stay there");
  await p.focus("#tpListen"); await p.keyboard.press("Space");
  await p.waitForFunction(() => location.hash === "#studio", null, { timeout: 8000 }); await arrived(p, "studio");
  ok(true, "Space on the Studio's ▶ Listen presses Listen (and goes to the desk), not the room");

  /* 2 · the Mixing Desk */
  f = inner(p);
  await f.evaluate(async () => {
    const sr = 48000, n = sr * 2, mk = hz => { const b = new ArrayBuffer(44 + n * 2), v = new DataView(b), w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
      w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
      v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true); for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.round(Math.sin(2 * Math.PI * hz * i / sr) * 9000), true); return new Blob([b], { type: "audio/wav" }); };
    for (const [from, hz] of [["pads", 110], ["piano", 262], ["guitar", 330]]) { const at = Date.now(); await AOGHandoff.add(AOGHandoff.INBOX, { from, n: 1, name: from, sec: 2, bpm: 120, at, take: true, wav: mk(hz) }, { key: from + "|" + at }); }
    await __aogStudio.listenFill(); });
  await f.waitForFunction(() => __aogStudio.SONG.tracks[2].clip && !__aogStudio.S.busy, null, { timeout: 20000 });
  await p.click('.sh-doors a[data-room="studio"]').catch(() => {}); await p.waitForTimeout(300);
  await p.keyboard.press("Digit3"); await p.waitForTimeout(200);
  ok(await f.evaluate(() => __aogStudio.SONG.sel === 2 && document.querySelector("#chStrip .st-chn").textContent === "Guitar"), "desk: 3 picks track 3, the Guitar");
  await p.keyboard.press("KeyM"); await p.waitForTimeout(150);
  ok(await f.evaluate(() => __aogStudio.SONG.tracks[2].mute), "desk: M mutes it");
  await p.keyboard.press("KeyM"); await p.keyboard.press("KeyS"); await p.waitForTimeout(150);
  ok(await f.evaluate(() => !__aogStudio.SONG.tracks[2].mute && __aogStudio.SONG.tracks[2].solo), "desk: M again unmutes, S solos");
  await p.keyboard.press("KeyS");
  const v0 = await f.evaluate(() => __aogStudio.SONG.tracks[2].vol);
  await p.keyboard.press("ArrowUp"); await p.keyboard.press("ArrowUp"); await p.keyboard.press("ArrowDown"); await p.waitForTimeout(150);
  ok(await f.evaluate(v => __aogStudio.SONG.tracks[2].vol === v + 4 && +document.getElementById("fv2").value === v + 4 && +document.getElementById("t2-vol").value === v + 4, v0), "desk: ↑ ↑ ↓ move the guitar's fader up a step, on the console and the mixer");
  await p.keyboard.press("Space"); await p.waitForTimeout(400);
  ok(await f.evaluate(() => __aogStudio.PLAY.on), "desk: Space plays");
  await p.keyboard.press("Space"); await p.waitForTimeout(300);
  ok(!(await f.evaluate(() => __aogStudio.PLAY.on)), "desk: Space stops");

  /* 3 · the Turntables: the left hand the left deck, the right hand the right */
  await tapDoor(p, "decks"); f = inner(p);
  await f.evaluate(() => { loadMade(decks[0], "house"); loadMade(decks[1], "techno"); });
  await f.waitForFunction(() => decks[0].buf && decks[1].buf && (decks[0].node || decks[0].core) && (decks[1].node || decks[1].core), null, { timeout: 90000 });
  if (await f.$('[data-pair="AB"]')) await f.click('[data-pair="AB"]').catch(() => {});
  await p.click('.sh-doors a[data-room="decks"]'); await p.waitForTimeout(300);
  await p.keyboard.press("KeyQ"); await p.waitForTimeout(700);
  let st = await f.evaluate(() => [!!decks[0].motor, !!decks[1].motor]);
  ok(st[0] && !st[1], "decks: Q starts the left deck (A) and only it: " + st);
  await p.keyboard.press("KeyP"); await p.waitForTimeout(700);
  st = await f.evaluate(() => [!!decks[0].motor, !!decks[1].motor]);
  ok(st[0] && st[1], "decks: P starts the right deck (B): " + st);
  await p.keyboard.press("KeyA"); await p.keyboard.press("KeyH"); await p.waitForTimeout(300);
  ok(await f.evaluate(() => decks[0].cues[0] != null && decks[1].cues[0] != null), "decks: A marks pad 1 on the left deck, H pad 1 on the right");
  await p.keyboard.press("KeyQ"); await p.keyboard.press("KeyP"); await p.waitForTimeout(500);
  st = await f.evaluate(() => [!!decks[0].motor, !!decks[1].motor]);
  ok(!st[0] && !st[1], "decks: Q and P stop them: " + st);
  const x0 = await f.evaluate(() => +document.getElementById("xf").value);
  await p.keyboard.press("ArrowLeft"); await p.keyboard.press("ArrowLeft"); await p.waitForTimeout(150);
  ok(await f.evaluate(x => Math.abs(+document.getElementById("xf").value - (x - 0.2)) < 0.011, x0), "decks: ← moves the crossfader toward the left deck");
  const dl = await f.evaluate(() => getComputedStyle(document.getElementById("keysHint")).display !== "none" ? document.getElementById("keysHint").textContent : "");
  ok(/^On a keyboard, the left hand plays the left deck/.test(dl), "decks: one line says which keys: " + dl.slice(0, 70));
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();

  /* 4 · Spanish, light and dark, a computer and an iPad */
  for (const [dev, theme] of [[null, "light"], [null, "dark"], ["iPad (gen 7) landscape", "light"], ["iPad (gen 7) landscape", "dark"]]) {
    const cx = await b.newContext(dev ? { ...pw.devices[dev], colorScheme: theme } : { viewport: { width: 1366, height: 900 }, colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage();
    for (const [file, sel, key] of [["music-kit.html", "#kitKeys", "Digit1"], ["music-decks.html", "#keysHint", "KeyQ"], ["music-studio.html", ".st-keys", "Digit1"]]) {
      await m.goto(U + file); await m.waitForTimeout(1800);
      await m.mouse.click(4, 300); await m.keyboard.press(key); await m.waitForTimeout(300);
      await m.evaluate(s => { const e = document.querySelector(s); if (e) e.scrollIntoView({ block: "center" }); }, sel);
      const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`), shown = await m.evaluate(s => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== "none" && e.textContent.length > 20; }, sel);
      ok(shown && !pc.length && !pk.length, `${dev || "computer"}, ${theme}, ${file}: the keys line shows, reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    }
    if (theme === "light" && !dev) {
      await m.goto(U + "music-kit.html"); await m.waitForTimeout(1500);
      await m.evaluate(() => { const b = document.getElementById("langBtn"); if (b) b.click(); }); await m.waitForTimeout(400);
      ok(/^Con un teclado, A S D F G H J K tocan la batería/.test(await m.textContent("#kitKeys")), "kit in Spanish: " + (await m.textContent("#kitKeys")).slice(0, 60));
    }
    await cx.close();
  }
  ok(errs.length === 0, "no page errors in light, dark, Spanish " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
