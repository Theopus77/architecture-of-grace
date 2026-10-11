/* AOG-SONG-V1 (2026-10-11) — Jimmy's "2": "One tempo and key for the song. Set them once in the Studio, and every room opens
   there." The Studio's ♩ Song button sets the song's tempo and key; the Drum Machine, the Drum Kit, the Piano, the Guitar,
   the Bass and the Band all follow (the Drum Machine's chords bank takes the key, its notes bank keeps its scale in the
   song's key); a tempo or key changed in a room changes the song; the Mixing Desk's bars are the song's; a new song takes
   its first take's tempo; a song already on the desk keeps its tempo; Spanish. No page errors. Port 9269. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const path = require("path");
const PORT = 9269, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
async function ctxOf(b, init) {
  const c = await b.newContext({ viewport: { width: 1366, height: 900 } });
  c.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message)));
  await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await c.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  if (init) await c.addInitScript(init);
  return c;
}
async function arrived(p, file) {
  await p.waitForFunction(f => { const fr = document.getElementById("room"), d = fr && fr.contentDocument;
    return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && d.location.pathname.endsWith(f); }, file, { timeout: 30000 });
  await p.waitForTimeout(700);
}
const door = async (p, id, file) => { await p.click('.sh-doors a[data-room="' + id + '"]'); await arrived(p, file); };
/* run in the room in sight, in its own global scope (its `const S` is not on window) */
const R = async (p, fn) => { const f = await (await p.$("#room")).contentFrame(); return f.evaluate(src => (new Function("w", "return (" + src + ")(w)"))(window), fn.toString()); };

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  let c = await ctxOf(b), p = await c.newPage();
  await p.goto(U + "the-studio#piano"); await arrived(p, "music-piano.html");
  ok(await p.evaluate(() => document.getElementById("tpSong").textContent) === "♩ Song" && await p.evaluate(() => AOGSong.get()) === null, "a new Studio: ♩ Song, and no tempo yet");
  await p.click("#tpSong");
  ok(await p.evaluate(() => !document.getElementById("songBox").hidden && /Not set yet\. Your first take sets it/.test(document.getElementById("songSay").textContent)), "the panel opens and says the song has no tempo yet");
  /* set 104, D minor */
  await p.fill("#songBpm", "104"); await p.press("#songBpm", "Enter"); await p.dispatchEvent("#songBpm", "change");
  await p.selectOption("#songKey", "2"); await p.click("#songMin"); await p.waitForTimeout(500);
  let s = await p.evaluate(() => ({ s: AOGSong.get(), btn: document.getElementById("tpSong").textContent, say: document.getElementById("songSay").textContent }));
  ok(s.s.bpm === 104 && s.s.key === 2 && s.s.minor && s.btn === "♩ Song · 104 · D minor" && s.say === "Every room plays at this tempo and in this key.", "the song is 104, D minor: " + JSON.stringify(s));
  let pr = await R(p, w => ({ bpm: S.bpm, key: S.key, minor: S.minor, slider: w.document.getElementById("bpm").value }));
  ok(pr.bpm === 104 && pr.key === 2 && pr.minor === true && pr.slider === "104", "the piano follows at once: " + JSON.stringify(pr));
  await p.click("#songDone");
  for (const [id, file] of [["guitar", "music-guitar.html"], ["bass", "music-bass.html"], ["band", "music-band.html"]]) {
    await door(p, id, file);
    const r = await R(p, w => ({ bpm: S.bpm, key: S.key, minor: S.minor }));
    ok(r.bpm === 104 && r.key === 2 && r.minor === true, `the ${id} opens in the song: ` + JSON.stringify(r));
  }
  await door(p, "pads", "music-pads.html");
  const pd = await R(p, w => ({ bpm: S.bpm, chords: S.banks.filter(x => x.type === "chords").map(x => x.key + " " + x.scale), notes: S.banks.filter(x => x.type === "notes").map(x => x.key + " " + x.scale), tempo: w.document.getElementById("tempo").value }));
  ok(pd.bpm === 104 && pd.tempo === "104" && pd.chords.join() === "2 minor" && pd.notes.join() === "2 pmin", "the Drum Machine: 104, its chords in D minor, its notes bank's minor pentatonic on D: " + JSON.stringify(pd));
  await door(p, "kit", "music-kit.html");
  ok(await R(p, w => S.bpm) === 104, "the Drum Kit plays at 104");
  /* a room's own tempo changes the song */
  await door(p, "pads", "music-pads.html");
  await R(p, w => w.document.getElementById("tUp").click()); await p.waitForTimeout(400);
  s = await p.evaluate(() => ({ s: AOGSong.get(), btn: document.getElementById("tpSong").textContent }));
  ok(s.s.bpm === 105 && s.btn === "♩ Song · 105 · D minor", "+1 on the Drum Machine makes the song 105: " + s.btn);
  await door(p, "piano", "music-piano.html");
  ok(await R(p, w => S.bpm) === 105, "and the piano, kept open, is at 105 when it comes back");
  /* a room's key changes the song: the guitar to G major */
  await door(p, "guitar", "music-guitar.html");
  await R(p, w => { const el = w.document.getElementById("keySel"); el.value = "7"; el.dispatchEvent(new Event("change", { bubbles: true })); w.document.getElementById("majBtn").click(); });
  await p.waitForTimeout(400);
  s = await p.evaluate(() => AOGSong.get());
  ok(s.key === 7 && s.minor === false, "the guitar's key changes the song to G major: " + JSON.stringify(s));
  await door(p, "band", "music-band.html");
  ok(JSON.stringify(await R(p, w => [S.key, S.minor])) === "[7,false]", "the band follows into G major");
  /* the desk's bars are the song's */
  await door(p, "studio", "music-studio.html");
  ok(await R(p, w => w.__aogStudio.songBpm ? w.__aogStudio.songBpm() : w.songBpm()) === 105, "the Mixing Desk's tempo is the song's: 105");
  /* Spanish */
  await p.click('.sh-lang button[data-lang="es"]'); await p.waitForTimeout(900);
  ok(await p.evaluate(() => document.getElementById("tpSong").textContent) === "♩ Canción · 105 · Sol mayor", "in Spanish: " + await p.evaluate(() => document.getElementById("tpSong").textContent));
  await c.close();

  /* a new song takes its first take's tempo and key */
  c = await ctxOf(b); p = await c.newPage();
  await p.goto(U + "the-studio#band"); await arrived(p, "music-band.html");
  const own = await R(p, w => ({ bpm: S.bpm, key: S.key, minor: S.minor }));
  await R(p, w => w.AOGStudioRec.toggle()); await p.waitForTimeout(400);
  await R(p, w => { keyOn(64, 0.8); }); await p.waitForTimeout(700); await R(p, w => { if (typeof keyOff === "function") keyOff(64); });
  await R(p, w => w.AOGStudioRec.toggle());
  await p.waitForFunction(() => { const r = document.getElementById("room").contentWindow.AOGStudioRec; return !r.on() && !r.busy() && r.last(); }, null, { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(500);
  s = await p.evaluate(() => AOGSong.get());
  ok(s && s.bpm === own.bpm && s.key === own.key && s.minor === !!own.minor, "the first take sets the song: " + JSON.stringify({ own, s }));
  await c.close();

  /* a song already on the desk keeps its tempo */
  c = await ctxOf(b, () => { try { if (location.protocol === "http:" && window === window.top && !localStorage.getItem("aog.song.v1") && !sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1");
    localStorage.setItem("aog.studio.v1", JSON.stringify({ v: 1, tracks: [{ clip: { id: "c1", bpm: 120, speed: 1, startBar: 1 } }] })); } } catch (e) {} });
  p = await c.newPage(); await p.goto(U + "the-studio#piano"); await arrived(p, "music-piano.html");
  s = await p.evaluate(() => AOGSong.get());
  ok(s && s.bpm === 120 && await R(p, w => S.bpm) === 120, "a song already on the desk keeps its tempo (120), and the rooms follow: " + JSON.stringify(s));
  await c.close();

  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
