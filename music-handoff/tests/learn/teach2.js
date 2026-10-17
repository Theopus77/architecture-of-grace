/* AOG-LEARN-V2 — Learn a song, a step up (aog-learn-ui.js). Jimmy: "Make it hit the ceiling … the world's best".
   The listening engine (aog-learn.js) is another engineer's; here it is a stand-in that returns known Lessons and the new
   calls it is getting (sections, simplify, capo, hearChord); the Bass gets today's engine (none of them), so the page
   must still work with it.
   A · the Piano (port 9290): the song's parts as quiet labels on the bars, Go to a part, Loop this part; a song kept
       before gets its parts from AOGLearn.sections; the chord pictures (keys), tap one to see it; Easier chords (the
       names, the keys, Did I get it? takes the easier and the full chord, Fix this chord keeps the full one); Step up
       the speed (60 %, +5 % after a clean full pass, never otherwise, said kindly); Your best, kept on the device; the
       slower copy made in a Worker, the same as in slices, one copy kept, freed when the song changes; the speed stepped
       up while a loop plays; Quiet the bass / the voice (what each lets through, measured), the plain line for a song
       with one channel; Print the chord sheet (a new window, black on white, four bars a line, the parts as headings)
       and the print-only part of the page when no window opens; Spanish; MIDI parts that sound like what they are.
   B · the Guitar (port 9291): the capo line and Use the capo (the shapes in the bars, on the neck above the capo, said
       in Spanish too), Did I get it? with the shapes played; the chord pictures (the room's own shapes, the capo bar),
       tap one to light it; a real guitar's strums (AOGLive.frames → hearChord) counted as chords; single notes for a
       tune; the voice of a stereo song quieted; aog-liveinput.js's frames: only while the input is on.
   C · the Bass (port 9292), today's engine: no parts menu, no capo, Easier chords by itself, quiet the bass first,
       the root's place on the neck for each chord, single notes from a real bass.
   D · inside the Studio (port 9293), iPhone and iPad, light and dark: with the parts and both closed boxes open it
       reads (check-contrast), is calm (check-calm), nothing sideways, every control a finger high.
   No page errors. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const P1 = 9290, P2 = 9291, P3 = 9292, P4 = 9293;
const srv = [P1, P2, P3, P4].map(p => require("../srv.js")(p)), U = p => "http://localhost:" + p + "/";
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }

/* the songs (a steady tone; stereo for the Guitar's, so its voice can be quieted) */
function wav(sec, f, f2) { const sr = 44100, n = sr * sec, ch = f2 ? 2 : 1, b = Buffer.alloc(44 + n * 2 * ch);
  b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2 * ch, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(ch, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2 * ch, 28); b.writeUInt16LE(2 * ch, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2 * ch, 40);
  for (let i = 0; i < n; i++) { b.writeInt16LE(Math.round(9000 * Math.sin(2 * Math.PI * f * i / sr)), 44 + i * 2 * ch); if (f2) b.writeInt16LE(Math.round(9000 * Math.sin(2 * Math.PI * f2 * i / sr)), 46 + i * 4); }
  return b; }
const SONG16 = { name: "Long song.wav", mimeType: "audio/wav", buffer: wav(16, 440) };
const GSONG = { name: "Capo song.wav", mimeType: "audio/wav", buffer: wav(8.5, 440, 660) };
const BSONG = { name: "Bass song.wav", mimeType: "audio/wav", buffer: wav(8, 110) };
const OLD = wav(8, 330);
const midiFile = (name, pad) => ({ name: name, mimeType: "audio/midi", buffer: Buffer.concat([Buffer.from("MThd\0\0\0\x06\0\0\0\x01\0\x60MTrk\0\0\0\x04\0\xff\x2f\0", "binary"), Buffer.alloc(pad)]) });
const LONGMID = midiFile("long.mid", 7);

const beats = (n, step) => Array.from({ length: n }, (_, i) => i * (step || 0.5));
const ch = (t, d, root, q, name) => ({ t, d, root, q, name, conf: 0.9 });
const L16 = { v: 1, src: "audio", name: "Long", sec: 16, sr: 44100, bpm: 120, beats: beats(32), downbeats: beats(8, 2), meter: { num: 4, den: 4 }, key: { key: 0, minor: false, conf: 0.9 },
  chords: [ch(0, 2, 0, "maj7", "Cmaj7"), ch(2, 2, 7, "7", "G7"), ch(4, 2, 9, "m7", "Am7"), ch(6, 2, 5, "sus4", "Fsus4"), ch(8, 2, 0, "maj7", "Cmaj7"), ch(10, 2, 7, "7", "G7"), ch(12, 2, 9, "m7", "Am7"), ch(14, 2, 0, "maj", "C")],
  bass: [], melody: [], tracks: [],
  sections: [{ t: 0, d: 2, kind: "intro" }, { t: 2, d: 4, kind: "part", letter: "A" }, { t: 6, d: 4, kind: "part", letter: "B" }, { t: 10, d: 4, kind: "part", letter: "A" }, { t: 14, d: 2, kind: "end" }] };
const L8 = { v: 1, src: "audio", name: "Old", sec: 8, sr: 44100, bpm: 120, beats: beats(16), downbeats: [0, 2, 4, 6], meter: { num: 4, den: 4 }, key: { key: 0, minor: false, conf: 0.9 },
  chords: [ch(0, 2, 0, "maj", "C"), ch(2, 2, 7, "maj", "G"), ch(4, 2, 9, "min", "Am"), ch(6, 2, 5, "maj", "F")], bass: [], melody: [], tracks: [] };
const LG = { v: 1, src: "audio", name: "Capo", sec: 8, sr: 44100, bpm: 120, beats: beats(16), downbeats: [0, 2, 4, 6], meter: { num: 4, den: 4 }, key: { key: 10, minor: false, conf: 0.9 },
  chords: [ch(0, 2, 10, "maj", "Bb"), ch(2, 2, 3, "maj", "Eb"), ch(4, 2, 5, "maj", "F"), ch(6, 2, 10, "maj", "Bb")],
  bass: [], melody: [{ t: 0, d: 0.9, m: 70, conf: 0.9 }, { t: 2, d: 0.9, m: 67, conf: 0.9 }], tracks: [] };
const LB = { v: 1, src: "audio", name: "Bass", sec: 8, sr: 44100, bpm: 120, beats: beats(16), downbeats: [0, 2, 4, 6], meter: { num: 4, den: 4 }, key: { key: 0, minor: false, conf: 0.9 },
  chords: [ch(0, 2, 0, "maj", "C"), ch(2, 2, 7, "7", "G7"), ch(4, 2, 9, "m7", "Am7"), ch(6, 2, 5, "maj", "F")],
  bass: [{ t: 0, d: 1.9, m: 36, conf: 0.9 }, { t: 2, d: 1.9, m: 43, conf: 0.9 }], melody: [], tracks: [] };
const LMID = { v: 1, src: "midi", name: "Long MIDI", sec: 8, sr: 0, bpm: 120, beats: beats(16), downbeats: [0, 2, 4, 6], meter: { num: 4, den: 4 }, key: { key: 0, minor: false, conf: 1 },
  chords: [], bass: [], melody: [], tracks: [
    { name: "Piano", ch: 0, program: 0, drums: false, notes: [{ t: 0, d: 3.5, m: 60, v: 0.8 }] },
    { name: "Guitar", ch: 1, program: 25, drums: false, notes: [{ t: 4, d: 3, m: 52, v: 0.8 }] },
    { name: "Drums", ch: 9, program: 0, drums: true, notes: [{ t: 7.5, d: 0.1, m: 36, v: 0.9 }] }] };
const BY = {}; BY[SONG16.buffer.length] = L16; BY[GSONG.buffer.length] = LG; BY[BSONG.buffer.length] = LB; BY[LONGMID.buffer.length] = LMID;
const BASE = `window.__LS = ${JSON.stringify(BY)};
  window.AOGLearn = { words: { en: { listen: "Listening to the song…", intro: "Intro", part: "Part", end: "Ending" }, es: { listen: "Escuchando la canción…", intro: "Intro", part: "Parte", end: "Final" } },
    analyze: async function (x, o) { if (!(x instanceof Blob)) throw new Error("not a blob"); o.onProgress(0.5, "listen"); await new Promise(r => setTimeout(r, 60)); return JSON.parse(JSON.stringify(window.__LS[x.size])); },
    fromMidi: function (ab) { return JSON.parse(JSON.stringify(window.__LS[ab.byteLength])); } };`;
/* the new calls (the engine engineer's, in parallel): stand-ins that count their calls */
const NEW = `
  AOGLearn.sections = function (L) { localStorage.setItem("__secCalls", String(+(localStorage.getItem("__secCalls") || 0) + 1)); var d = L.downbeats, out = [];
    for (var i = 0; i < d.length; i += 2) out.push({ t: d[i], d: (d[i + 2] != null ? d[i + 2] : L.sec) - d[i], kind: "part", letter: String.fromCharCode(65 + i / 2) }); return out; };
  AOGLearn.simplify = function (c, key, minor) { window.__simp = (window.__simp || 0) + 1; return { t: c.t, d: c.d, root: c.root, q: (c.q === "m7" || c.q === "min" || c.q === "dim") ? "min" : "maj", name: "" }; };
  AOGLearn.capo = function (L) { if (!L.key || L.key.key !== 10) return { fret: 0, shapes: [], open: false };
    return { fret: 3, shapes: [{ from: { root: 10, q: "maj" }, shape: "G" }, { from: "Eb", shape: "C" }, { from: { root: 5, q: "maj" }, shape: { root: 2, q: "maj" } }], open: true }; };
  AOGLearn.hearChord = function (buf, sr, key, minor) { window.__hc = (window.__hc || 0) + 1; return window.__chord || null; };`;
async function routes(ctx, today) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/aog-learn\.js(\?.*)?$/, r => r.fulfill({ body: BASE + (today ? "" : NEW), contentType: "text/javascript" }));
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  await ctx.route(/\/__live\.html$/, r => r.fulfill({ contentType: "text/html", body: `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="m"></div><script src="/aog-liveinput.js"></script><script>
    window.ac = new AudioContext(); window.h = AOGLive.attach({ mount: "m", kind: "guitar", context: () => ac, out: () => ac.destination, rig: () => ({}), lang: () => "en", bpm: () => 120, tool: "guitar" });</script></body></html>` }));
}
const S = f => f.evaluate(() => AOGLearnUI.test.state());
async function openPanel(f) {
  /* AOG-ROOMS-COMPACT-V1: inside the Studio, Learn a song waits in More: a person picks it there first */
  if (await f.evaluate(() => { const b = document.getElementById("lgBox"); return !!(document.getElementById("aogMoreSel") && b && b.closest("[data-aog-sec]") && !b.closest("[data-aog-on]")); }))
    { await f.selectOption("#aogMoreSel", "learn"); await f.waitForTimeout(200); }
  await f.evaluate(() => { const b = document.getElementById("lgBox"); b.scrollIntoView({ block: "center" }); if (!b.open) b.querySelector("summary").click(); }); await f.waitForTimeout(200); }
async function loaded(f, name) { await f.waitForFunction(n => window.AOGLearnUI && AOGLearnUI.test.state().open && AOGLearnUI.test.state().name === n, name, { timeout: 15000 }); await f.waitForTimeout(200); }
const lit = (f, sel) => f.evaluate(sel => [...document.querySelectorAll(sel)].map(e => e.getAttribute("data-m") || e.getAttribute("data-c")).sort().join(" "), sel);
const pcs = s => [...new Set(s.split(" ").filter(Boolean).map(m => +m % 12))].sort((x, y) => x - y).join(",");
const barNames = f => f.evaluate(() => [...document.querySelectorAll("#lgBars .lg-bar")].map(e => { const c = e.cloneNode(true); c.querySelectorAll(".lg-sec,small").forEach(x => x.remove()); return c.textContent; }).join("|"));
const tiles = f => f.evaluate(() => [...document.querySelectorAll("#lgShapes .lg-shape")].map(e => e.querySelector("span").textContent).join(" | "));
const openSub = (f, id) => f.evaluate(id => { const d = document.getElementById(id); if (d && !d.open) d.querySelector("summary").click(); }, id);
const said = f => f.evaluate(() => document.getElementById("lgSaid").textContent);
const best = f => f.evaluate(() => document.getElementById("lgBest").textContent);

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* ══ A · the Piano ══ */
  let c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c);
  let p = await c.newPage(); await p.goto(U(P1) + "music-piano.html"); await p.waitForTimeout(1200);
  await openPanel(p); await p.setInputFiles("#lgFile", SONG16); await loaded(p, "Long song.wav");
  let a = await p.evaluate(() => ({ labels: [...document.querySelectorAll("#lgBars .lg-bar")].map((e, i) => { const s = e.querySelector(".lg-sec"); return s ? (i + 1) + ":" + s.textContent : ""; }).filter(Boolean).join(","),
    opts: [...document.getElementById("lgPart").options].map(o => o.textContent).join(" | "), more: document.getElementById("lgMore").open, shapes: document.getElementById("lgShapesBox").open,
    checks: ["lgStep", "lgEasy"].map(id => document.getElementById(id).checked).join(","), quiet: document.getElementById("lgQuiet").value }));
  ok(a.labels === "1:Intro,2:Part A,4:Part B,6:Part A,8:Ending", "U2 the song's parts are quiet labels on the bars: " + a.labels);
  ok(a.opts === "Choose a part | Intro · bar 1 | Part A · bars 2–3 | Part B · bars 4–5 | Part A · bars 6–7 | Ending · bar 8", "U2 Go to a part is a drop-down of the parts: " + a.opts);
  ok(!a.more && !a.shapes && a.checks === "false,false" && a.quiet === "none", "everything new is closed and off at first: " + JSON.stringify(a));
  await p.selectOption("#lgPart", "2"); await p.waitForTimeout(100);
  let st = await S(p);
  ok(Math.abs(st.T - 6) < 1e-6 && st.now === "Fsus4", "U2 Go to a part: Part B starts at bar 4 (6 s), Fsus4: " + st.T + " " + st.now);
  await p.click("#lgLoopPart");
  a = await p.evaluate(() => ({ st: document.getElementById("lgStatus").textContent, inl: [...document.querySelectorAll("#lgBars .lg-bar.in")].map(e => e.getAttribute("data-b")).join(","), loop: AOGLearnUI.test.state().loop, btn: document.getElementById("lgLoop").textContent }));
  ok(a.st === "Bars 4–5 play again and again." && a.inl === "3,4" && JSON.stringify(a.loop) === "[3,4]" && a.btn === "Stop the loop", "U2 Loop this part: bars 4–5, marked and said: " + JSON.stringify(a));
  await p.click("#lgLoop");
  await p.evaluate(() => { const c = document.getElementById("lgCount"); c.checked = false; c.dispatchEvent(new Event("change")); });

  /* U4 the chord pictures: the keys */
  await openSub(p, "lgShapesBox"); await p.waitForTimeout(100);
  a = await p.evaluate(() => ({ t: [...document.querySelectorAll("#lgShapes .lg-shape")].map(e => e.querySelector("span").textContent + ":" + e.querySelectorAll("circle").length + ":" + e.querySelectorAll("rect.wk").length).join(" | "),
    line: document.querySelector("#lgShapesBox .line").textContent }));
  ok(a.t === "Cmaj7:4:14 | G7:4:14 | Am7:4:14 | Fsus4:3:14 | C:3:14" && a.line === "Tap one to see it on the keys.", "U4 the piano: a small picture of the keys for each chord, in the order they come: " + a.t);
  await p.click('#lgShapes .lg-shape[data-k="3"]'); await p.waitForTimeout(100);
  let keys = await lit(p, "#kbd .lrn"); st = await S(p);
  ok(pcs(keys) === "0,5,10" && st.pin === "Fsus4" && (await p.getAttribute('#lgShapes .lg-shape[data-k="3"]', "aria-pressed")) === "true", "U4 tap Fsus4: F B♭ C lit on the keys: " + keys);
  await p.evaluate(() => AOGLearnUI.test.at(0.1)); keys = await lit(p, "#kbd .lrn");
  ok(pcs(keys) === "0,4,7,11" && (await S(p)).pin === "", "U4 going on in the song lights the song's chord again (Cmaj7): " + keys);

  /* U3 Easier chords */
  await openSub(p, "lgMore"); await p.check("#lgEasy"); await p.waitForTimeout(150);
  a = { bars: await barNames(p), simp: await p.evaluate(() => window.__simp || 0), tiles: await tiles(p) };
  await p.evaluate(() => AOGLearnUI.test.at(0.1)); keys = await lit(p, "#kbd .lrn"); st = await S(p);
  ok(a.bars === "C|G|Am|F|C|G|Am|C" && a.simp > 0 && st.now === "C" && pcs(keys) === "0,4,7" && a.tiles === "C | G | Am | F" && st.easy, "U3 Easier chords: the engine's easier chords in the bars, the pictures, the chord now and the keys: " + JSON.stringify([a, st.now, keys]));
  await p.evaluate(() => { window.__T = 0; AOGLearnUI.test.clock(() => window.__T); AOGLearnUI.test.pass(0); });
  const hit = (T, ms) => p.evaluate(([T, ms]) => { window.__T = T; ms.forEach(m => noteOn("k", m, 0.7)); ms.forEach(m => noteOff("k", m)); }, [T, ms]);
  await hit(0.02, [60, 64, 67, 71]); await hit(2.02, [67, 71, 74]); await hit(4.03, [57, 60, 64, 67]); await hit(6.0, [65, 69, 72]);
  let r = await p.evaluate(() => { window.__T = 7.9; return AOGLearnUI.test.endPass(7.9); });
  ok(r && r.k === 4 && r.n === 4, "U3 Did I get it? takes the easier chord and the full one (Cmaj7 and Am7 played in full, G and F easy): " + JSON.stringify(r && r.res));
  await p.evaluate(() => { window.__T = 2.6; AOGLearnUI.test.at(2.6); }); await p.click("#lgFix");
  a = await p.evaluate(() => ({ root: document.getElementById("lgFixRoot").value, q: document.getElementById("lgFixQ").value }));
  ok(a.root === "7" && a.q === "7", "U3 Fix this chord fixes the chord itself (G7), not the easier copy: " + JSON.stringify(a));
  await p.click("#lgFixNo"); await p.uncheck("#lgEasy"); await p.waitForTimeout(150);
  ok((await barNames(p)) === "Cmaj7|G7|Am7|Fsus4|Cmaj7|G7|Am7|C", "U3 Easier chords off: the chords as they are");

  /* U1 Step up the speed, U7 Your best */
  await p.check("#lgStep"); await p.waitForTimeout(150);
  st = await S(p);
  ok(st.speed === 60 && (await p.inputValue("#lgSpeed")) === "60" && st.stepUp, "U1 Step up the speed starts at 60 %: " + st.speed);
  const clean = async () => { await p.evaluate(() => AOGLearnUI.test.pass(0)); await hit(0.02, [60, 64, 67, 71]); await hit(2.02, [67, 71, 74, 65]); await hit(4.01, [57, 60, 64, 67]); await hit(6.01, [65, 70, 72]); };
  await clean(); r = await p.evaluate(() => AOGLearnUI.test.endPass(7.9, true));
  a = { said: await said(p), sp: (await S(p)).speed, sel: await p.inputValue("#lgSpeed"), best: await best(p) };
  ok(a.said === "You played all 4 chords on time. Clean pass. Now 65 %." && a.sp === 65 && a.sel === "65", "U1 a clean pass: 5 % faster, said kindly: " + JSON.stringify(a));
  ok(a.best === "Your best: 4 of 4 at 60 %.", "U7 Your best, one plain line: " + a.best);
  await p.evaluate(() => AOGLearnUI.test.pass(0)); await hit(0.02, [60, 64, 67, 71]); await hit(2.02, [67, 71, 74]);
  r = await p.evaluate(() => AOGLearnUI.test.endPass(7.9, true));
  a = { said: await said(p), sp: (await S(p)).speed, best: await best(p), red: await p.evaluate(() => [...document.querySelectorAll("#lgIn *")].some(e => /✗|✕|❌|fail|wrong/i.test(e.textContent))) };
  ok(r.k === 2 && a.sp === 65 && a.said === "You played 2 of 4 chords on time. The change to Am7 went by quietly." && a.best === "Your best: 2 of 4 at 65 %." && !a.red,
    "U1 a pass under 90 %: the speed stays, the words stay kind, no red fail; U7 the best at this speed: " + JSON.stringify(a));
  await clean(); await p.evaluate(() => AOGLearnUI.test.endPass(7.9, false));
  ok((await S(p)).speed === 65 && !/Clean pass/.test(await said(p)), "U1 a clean stretch that is not a whole pass (a pause): the speed never moves");
  await p.selectOption("#lgSpeed", "100"); await clean(); await p.evaluate(() => AOGLearnUI.test.endPass(7.9, true));
  a = { said: await said(p), sp: (await S(p)).speed };
  ok(a.sp === 100 && a.said === "You played all 4 chords on time. Clean pass. That's full speed.", "U1 at 100 % it stays at 100 %: " + JSON.stringify(a));
  const kept = await p.evaluate(() => new Promise(ok => { const r = indexedDB.open("aog-learn", 1); r.onsuccess = () => { const q = r.result.transaction("songs").objectStore("songs").get("Long song.wav·" + (16 * 44100 * 2 + 44)); q.onsuccess = () => ok(q.result && q.result.best); }; }));
  await p.waitForTimeout(400);
  const kept2 = await p.evaluate(() => new Promise(ok => { const r = indexedDB.open("aog-learn", 1); r.onsuccess = () => { const q = r.result.transaction("songs").objectStore("songs").get("Long song.wav·" + (16 * 44100 * 2 + 44)); q.onsuccess = () => ok(q.result && q.result.best); }; }));
  ok(kept2 && kept2["chords|60"].k === 4 && kept2["chords|60"].n === 4 && kept2["chords|65"].k === 4 && kept2["chords|100"].k === 4 && kept2["chords|60"].at > 0, "U7 the best per speed is kept with the song (IndexedDB): " + JSON.stringify(kept2 || kept));
  await p.evaluate(() => AOGLearnUI.test.clock(null));

  /* U9 the slower copy in a Worker; the same as in slices; one copy kept */
  const sum = sp => p.evaluate(async sp => { const x = await AOGLearnUI.test.buffer(sp); let s = 0; for (let i = 0; i < x.ch0.length; i += 3) s += Math.abs(x.ch0[i]) * (1 + (i % 7));
    let z = 0; for (let i = x.sr * 2 + 1; i < x.sr * 4; i++) if (x.ch0[i - 1] < 0 && x.ch0[i] >= 0) z++; return { len: x.len, sum: s, hz: z / 2, how: AOGLearnUI.test.how() }; }, sp);
  const w75 = await sum(75);
  ok(w75.how.how === "worker" && Math.abs(w75.len - Math.round(16 * 44100 / 0.75)) <= 1 && Math.abs(w75.hz - 440) <= 2 && w75.how.cache.join() === "75", "U9 Speed 75 %: made in a Worker, 4/3 as long, the pitch kept: " + JSON.stringify(w75));
  const w80 = await sum(80);
  ok(w80.how.cache.join() === "80", "U9 one slower copy at a time (75 % freed for 80 %): " + w80.how.cache.join());
  await p.evaluate(() => AOGLearnUI.test.noWorker(true)); const s75 = await sum(75); await p.evaluate(() => AOGLearnUI.test.noWorker(false));
  ok(s75.how.how === "slices" && s75.len === w75.len && Math.abs(s75.sum - w75.sum) < 1e-6 * Math.abs(w75.sum), "U9 where no Worker can start, the same copy in slices: " + JSON.stringify([s75.how.how, s75.sum, w75.sum]));
  /* the speed stepped up while a loop plays: it goes on at the new speed */
  await p.selectOption("#lgSpeed", "60"); await p.click("#lgLoop"); await p.click('#lgBars .lg-bar[data-b="0"]'); await p.click('#lgBars .lg-bar[data-b="0"]');
  await p.click("#lgPlay"); await p.waitForFunction(() => AOGLearnUI.test.state().playing, null, { timeout: 30000 });
  await p.evaluate(() => AOGLearnUI.test.stepTo(65));
  await p.waitForFunction(() => { const s = AOGLearnUI.test.state(); return s.playing && s.speed === 65 && AOGLearnUI.test.how().cache.join() === "65"; }, null, { timeout: 30000 }).catch(() => {});
  st = await S(p); a = await p.evaluate(() => AOGLearnUI.test.how());
  ok(st.playing && st.speed === 65 && a.cache.join() === "65" && st.T >= 0 && st.T < 2.01, "U1 stepped up while the loop plays: it goes on round the loop at 65 %: " + JSON.stringify([st.playing, st.speed, st.T, a]));
  await p.click("#lgPlay"); await p.click("#lgLoop");

  /* U5 Quiet a part */
  a = await p.evaluate(() => [...document.getElementById("lgQuiet").options].map(o => o.textContent).join(" | "));
  ok(a === "Nothing | Quiet the voice | Quiet the bass", "U5 the piano offers the voice first: " + a);
  await p.selectOption("#lgQuiet", "voice"); await p.waitForFunction(() => !document.getElementById("lgQuietLine").hidden, null, { timeout: 8000 }).catch(() => {});
  a = await p.evaluate(() => ({ line: document.getElementById("lgQuietLine").hidden ? "" : document.getElementById("lgQuietLine").textContent, chain: AOGLearnUI.test.chain() }));
  ok(a.line === "This song has one channel, so the voice can't be quieted." && a.chain.mode === "none" && a.chain.stereo === false, "U5 a song with one channel: said plainly, nothing changed: " + JSON.stringify(a));
  await p.selectOption("#lgQuiet", "bass"); await p.waitForTimeout(100);
  a = await p.evaluate(() => ({ hid: document.getElementById("lgQuietLine").hidden, chain: AOGLearnUI.test.chain() }));
  ok(a.hid && a.chain.mode === "bass" && a.chain.nodes.join() === "highpass,lowshelf", "U5 Quiet the bass: a high-pass and a low shelf on the player: " + JSON.stringify(a));
  const qb = await p.evaluate(() => AOGLearnUI.test.quietTest("bass")), qv = await p.evaluate(() => AOGLearnUI.test.quietTest("voice")), qn = await p.evaluate(() => AOGLearnUI.test.quietTest("none"));
  const f3 = o => Object.keys(o).map(k => k + ":" + o[k].toFixed(3)).join(" ");
  ok(qn[60] > 0.28 && qb[60] < 0.06 && qb[1000] > 0.25 && qb[2500] > 0.25, "U5 the bass quieted: 60 Hz from 0.30 to " + qb[60].toFixed(3) + ", the rest kept: " + f3(qb));
  ok(qv[1000] < 0.03 && qv[60] > 0.2 && qv[2500] > 0.2, "U5 the voice quieted: the middle (1 kHz) gone, its low end (60 Hz) and the sides (2.5 kHz) kept: " + f3(qv));
  await p.selectOption("#lgQuiet", "none");

  /* U8 Print the chord sheet */
  const [pop] = await Promise.all([c.waitForEvent("page", { timeout: 8000 }), p.click("#lgPrint")]);
  await pop.waitForLoadState("load"); await pop.waitForTimeout(500);
  a = await pop.evaluate(() => ({ h1: document.querySelector("h1").textContent, info: document.querySelector(".info").textContent, h2: [...document.querySelectorAll("h2")].map(e => e.textContent).join("|"),
    rows: [...document.querySelectorAll("tr")].map(r => [...r.children].map(td => td.textContent).join(",")).join(" / "), four: [...document.querySelectorAll("tr")].every(r => r.children.length === 4),
    ink: getComputedStyle(document.body).color, bg: getComputedStyle(document.body).backgroundColor, td: getComputedStyle(document.querySelector("td")).borderTopColor, print: [...document.styleSheets].some(s => [...s.cssRules].some(r => r.media && /print/.test(r.media.mediaText))) }));
  ok(a.h1 === "Long song.wav" && a.info === "C major · 120 beats a minute · 8 bars." && a.h2 === "Intro|Part A|Part B|Part A|Ending" && a.four && a.ink === "rgb(0, 0, 0)" && a.bg === "rgb(255, 255, 255)" && a.print,
    "U8 the chord sheet: a new window, black on white, the parts as headings, four to a line: " + JSON.stringify(a).slice(0, 300));
  ok(a.rows.startsWith("1Cmaj7,,,") && a.rows.includes("2G7,3Am7,,") && a.rows.includes("8C,,,"), "U8 the bars with their chords: " + a.rows);
  await pop.close();
  await p.evaluate(() => AOGLearnUI.test.noPopup(true)); a = await p.evaluate(() => AOGLearnUI.test.print());
  const scr = await p.evaluate(() => getComputedStyle(document.getElementById("lgPrintSheet")).display);
  await p.emulateMedia({ media: "print" });
  const prt = await p.evaluate(() => ({ sheet: getComputedStyle(document.getElementById("lgPrintSheet")).display, rest: [...document.body.children].filter(e => e.id !== "lgPrintSheet" && getComputedStyle(e).display !== "none").length, tds: document.querySelectorAll("#lgPrintSheet td").length }));
  await p.emulateMedia({ media: "screen" }); await p.evaluate(() => AOGLearnUI.test.noPopup(false));
  ok(a === "page" && scr === "none" && prt.sheet === "block" && prt.rest === 0 && prt.tds === 20, "U8 no new window: a part of the page that only prints, alone on paper: " + JSON.stringify([a, scr, prt]));

  /* Spanish */
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(300);
  a = await p.evaluate(() => ({ more: document.querySelector("#lgMore summary").textContent, step: document.getElementById("lgStep").parentNode.textContent, easy: document.getElementById("lgEasy").parentNode.textContent,
    part: document.getElementById("lgPart").parentNode.querySelector(".plab").textContent, opt: document.getElementById("lgPart").options[2].textContent, loopPart: document.getElementById("lgLoopPart").textContent,
    secs: [...document.querySelectorAll("#lgBars .lg-sec")].map(e => e.textContent).join(","), quiet: document.getElementById("lgQuiet").parentNode.querySelector(".plab").textContent,
    qo: [...document.getElementById("lgQuiet").options].map(o => o.textContent).join(" | "), print: document.getElementById("lgPrint").textContent, shapes: document.querySelector("#lgShapesBox summary").textContent,
    tap: document.querySelector("#lgShapesBox .line").textContent, best: document.getElementById("lgBest").textContent }));
  ok(a.more === "Más formas de practicar" && a.step === "Subir la velocidad poco a poco" && a.easy === "Acordes más fáciles" && a.part === "Ir a una parte" && a.opt === "Parte A · compases 2–3" && a.loopPart === "Repetir esta parte" &&
    a.secs === "Intro,Parte A,Parte B,Parte A,Final" && a.quiet === "Suavizar una parte de la canción" && a.qo === "Nada | Suavizar la voz | Suavizar el bajo" && a.print === "Imprimir la hoja de acordes" &&
    a.shapes === "Los acordes de la canción" && a.tap === "Toca uno para verlo en el teclado." && a.best === "Tu mejor pasada: 4 de 4 al 65 %.", "Spanish: " + JSON.stringify(a));
  await p.selectOption("#lgSpeed", "65");
  await p.evaluate(() => { window.__T = 0; AOGLearnUI.test.clock(() => window.__T); }); await clean(); await p.evaluate(() => AOGLearnUI.test.endPass(7.9, true));
  a = await said(p);
  ok(a === "Tocaste los 4 acordes a tiempo. Pasada limpia. Ahora al 70 %.", "Spanish: a clean pass: " + a);
  await p.evaluate(() => { AOGLearnUI.test.clock(null); document.getElementById("langBtn").click(); }); await p.waitForTimeout(300);

  /* a song kept before (no parts in its lesson): AOGLearn.sections gives them; the slower copy is freed */
  await p.reload(); await p.waitForTimeout(800);
  await p.evaluate(async ([L, b64]) => { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    await new Promise(ok => { const r = indexedDB.open("aog-learn", 1); r.onsuccess = () => { const tx = r.result.transaction("songs", "readwrite");
      tx.objectStore("songs").put({ id: "Old song·1", name: "Old song", src: "audio", lesson: L, blob: new Blob([u], { type: "audio/wav" }), fixes: {}, speed: 100, loop: null, follow: null, at: 1 }); tx.oncomplete = () => { r.result.close(); ok(); }; }; }); }, [L8, OLD.toString("base64")]);
  await openPanel(p); await loaded(p, "Long song.wav");
  await p.evaluate(() => AOGLearnUI.test.buffer(75)); const before = (await p.evaluate(() => AOGLearnUI.test.how())).cache.join();
  await p.click("#lgOther"); await p.waitForTimeout(300);
  await p.selectOption("#lgList", { label: "Old song" }); await p.click("#lgOpen"); await loaded(p, "Old song");
  await p.waitForFunction(() => AOGLearnUI.test.state().secs.length === 2, null, { timeout: 8000 }).catch(() => {});
  a = await p.evaluate(() => ({ secs: AOGLearnUI.test.state().secs.map(x => (x.a + 1) + ":" + x.label).join(","), calls: localStorage.getItem("__secCalls"), labels: [...document.querySelectorAll("#lgBars .lg-sec")].map(e => e.textContent).join(","), cache: AOGLearnUI.test.how().cache.join() }));
  ok(a.secs === "1:Part A,3:Part B" && +a.calls > 0 && a.labels === "Part A,Part B", "U2 a song kept before: its parts from AOGLearn.sections: " + JSON.stringify(a));
  ok(before === "75" && a.cache === "", "U9 the slower copy is freed when the song changes: " + JSON.stringify([before, a.cache]));

  /* U10 a MIDI song's parts sound like what they are */
  await p.click("#lgOther"); await p.setInputFiles("#lgFile", LONGMID); await loaded(p, "long.mid");
  const rm = await p.evaluate(async () => { const r = (a, b) => AOGLearnUI.test.rms(a, b); return { p0: await r(0.05, 0.3), p1: await r(2.6, 3.2), g0: await r(4.03, 4.3), g1: await r(6.3, 6.9), k: await r(7.5, 7.62), q: await r(3.75, 3.95) }; });
  ok(rm.p0 > 3 * rm.p1 && rm.p1 > 0.0005, "U10 a piano part rings and fades while held: " + rm.p0.toFixed(4) + " → " + rm.p1.toFixed(4));
  ok(rm.g0 > 3 * rm.g1 && rm.g1 > 0.0002, "U10 a guitar part is plucked and dies away: " + rm.g0.toFixed(4) + " → " + rm.g1.toFixed(4));
  ok(rm.k > 0.01 && rm.q < rm.k / 4, "U10 the drums: a kick where it is due, quiet between: " + rm.k.toFixed(4) + " / " + rm.q.toFixed(4));
  ok(errs.length === 0, "the Piano: no page errors " + errs.join(" | "));
  await c.close();

  /* ══ B · the Guitar ══ */
  c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c);
  p = await c.newPage();
  /* aog-liveinput.js's frames: only while the input is on */
  await p.goto(U(P2) + "__live.html"); await p.waitForTimeout(300);
  a = await p.evaluate(async () => { const off = AOGLive.frames(() => {}); const A = h.state, o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 220; o.connect(g); o.start(); A.inGain = g; A.o = A.o;
    window.__got = []; const stop = AOGLive.frames((b, sr) => { let s = 0; for (let i = 0; i < b.length; i++) s += b[i] * b[i]; __got.push([b.length, sr, Math.sqrt(s / b.length)]); });
    await new Promise(r => setTimeout(r, 650)); const n1 = __got.length; A.inGain = null; await new Promise(r => setTimeout(r, 350)); const n2 = __got.length; await new Promise(r => setTimeout(r, 300)); stop && stop();
    return { off: off, n1: n1, n2: n2, n3: __got.length, f: __got[__got.length - 1] }; });
  ok(a.off === null && a.n1 >= 4 && a.f[0] === Math.round(0.25 * a.f[1]) && Math.abs(a.f[2] - 0.707) < 0.05 && a.n3 === a.n2, "U6 AOGLive.frames: nothing while the input is off; then the last quarter second every 100 ms; nothing once it is off again: " + JSON.stringify(a));
  await p.goto(U(P2) + "music-guitar.html"); await p.waitForTimeout(1200);
  ok((await p.evaluate(() => AOGLive.frames(() => {}))) === null, "U6 in the Guitar, with the input off, no frames (no new question for the microphone)");
  await openPanel(p); await p.setInputFiles("#lgFile", GSONG); await loaded(p, "Capo song.wav");
  a = { meta: await p.textContent("#lgMeta"), bars: await barNames(p) };
  ok(a.meta === "B♭ major · 120 beats a minute · 4 bars" && a.bars === "B♭|E♭|F|B♭", "the Guitar: the song in B♭: " + JSON.stringify(a));
  await openSub(p, "lgMore"); await p.waitForTimeout(100);
  a = await p.evaluate(() => ({ line: document.getElementById("lgCapoLine").textContent, capo: document.getElementById("lgCapo").checked }));
  ok(a.line === "Capo 3: play these as G, C, D." && !a.capo, "U3 the capo line (AOGLearn.capo), Use the capo off at first: " + a.line);
  await p.check("#lgCapo"); await p.waitForTimeout(150); await p.evaluate(() => AOGLearnUI.test.at(0.1)); await p.waitForTimeout(100);
  a = await p.evaluate(() => ({ cells: [...document.querySelectorAll("#neck .dot.lrn")].map(e => e.getAttribute("data-c")).sort().join(" "), roots: [...document.querySelectorAll("#neck .dot.lroot")].map(e => e.getAttribute("data-c")).sort().join(" "),
    want: openShape({ root: 7, q: "maj", id: "maj" }).map((f, s) => f >= 0 ? s + ":" + (f + 3) : "").filter(Boolean).sort().join(" "), fret0: S.fret0, st: AOGLearnUI.test.state(),
    inReach: [...document.querySelectorAll("#neck .dot.lrn")].every(e => inReach(+e.getAttribute("data-c").split(":")[1])) }));
  const wantRoots = await p.evaluate(w => w.split(" ").filter(c => { const [s, f] = c.split(":").map(Number); return (TUNING[s] + f) % 12 === 10; }).sort().join(" "), a.want);
  ok(a.cells === a.want && a.roots === wantRoots && a.inReach && a.st.now === "G" && a.st.capo === 3, "U3 Use the capo: G's shape lit three frets up, every lit fret in view, B♭'s roots ringed: " + JSON.stringify([a.cells, a.want, a.roots, a.fret0, a.st.now]));
  ok((await barNames(p)) === "G|C|D|G", "U3 the shapes in the bars: " + (await barNames(p)));
  /* Did I get it? with the shapes played above the capo (they sound as the song's chords) */
  await p.evaluate(() => { window.__T = 0; AOGLearnUI.test.clock(() => window.__T); AOGLearnUI.test.pass(0); });
  for (const T of [0.02, 2.02, 4.02, 6.02]) {
    await p.evaluate(T => { AOGLearnUI.test.at(T + 0.05); window.__T = T; [...document.querySelectorAll("#neck .dot.lrn")].forEach(e => { const [s, f] = e.getAttribute("data-c").split(":").map(Number); pluckCell(s, f, 0.8); }); }, T);
  }
  r = await p.evaluate(() => { window.__T = 7.9; return AOGLearnUI.test.endPass(7.9); });
  ok(r && r.k === 4, "U3 the shapes above the capo, played on the neck, count as the song's chords: " + JSON.stringify(r && r.res));
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(300);
  a = await p.evaluate(() => ({ line: document.getElementById("lgCapoLine").textContent, use: document.getElementById("lgCapo").parentNode.textContent, tap: document.querySelector("#lgShapesBox .line").textContent }));
  ok(a.line === "Cejilla 3: tócalos como Sol, Do, Re." && a.use === "Usar la cejilla" && a.tap === "Toca uno para verlo en el mástil.", "Spanish: " + JSON.stringify(a));
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(300);
  /* U4 the chord pictures: the room's own shapes */
  await openSub(p, "lgShapesBox"); await p.waitForTimeout(100);
  const pic = () => p.evaluate(() => [...document.querySelectorAll("#lgShapes .lg-shape")].map(e => ({ n: e.querySelector("span").textContent, 
    fretted: e.querySelectorAll("circle[r='4.4']").length, x: e.querySelectorAll("path.mk2").length, cp: e.querySelectorAll("line.cp").length, nut: e.querySelectorAll("line.nut").length })));
  let pics = await pic();
  const shp = await p.evaluate(() => [[7, "G"], [0, "C"], [2, "D"]].map(([r]) => { const f = openShape({ root: r, q: "maj", id: "maj" }); return { fretted: f.filter(x => x > 0).length, x: f.filter(x => x < 0).length }; }));
  ok(pics.map(x => x.n).join(" | ") === "G | C | D" && pics.every((x, i) => x.cp === 1 && x.fretted === shp[i].fretted && x.x === shp[i].x), "U4 with the capo: G, C and D boxes, the capo's gold bar, a dot for each finger, × for each quiet string: " + JSON.stringify([pics, shp]));
  await p.click('#lgShapes .lg-shape[data-k="1"]'); await p.waitForTimeout(100);
  a = await p.evaluate(() => ({ cells: [...document.querySelectorAll("#neck .dot.lrn")].map(e => e.getAttribute("data-c")).sort().join(" "), want: openShape({ root: 0, q: "maj", id: "maj" }).map((f, s) => f >= 0 ? s + ":" + (f + 3) : "").filter(Boolean).sort().join(" ") }));
  ok(a.cells === a.want, "U4 tap C: its shape lit above the capo: " + a.cells);
  await p.uncheck("#lgCapo"); await p.waitForTimeout(150);
  pics = await pic();
  const shp2 = await p.evaluate(() => [10, 3, 5].map(r => { const x = learnShape({ root: r, q: "maj", id: "maj", pcs: [] }).f; return { fretted: x.filter(v => v > 0).length, x: x.filter(v => v < 0).length }; }));
  ok(pics.map(x => x.n).join(" | ") === "B♭ | E♭ | F" && pics.every((x, i) => x.cp === 0 && x.fretted === shp2[i].fretted && x.x === shp2[i].x), "U4 without the capo: the room's own shapes where the hand is: " + JSON.stringify([pics, shp2]));
  await p.click('#lgShapes .lg-shape[data-k="1"]'); await p.waitForTimeout(100);
  a = await p.evaluate(() => ({ cells: [...document.querySelectorAll("#neck .dot.lrn")].map(e => e.getAttribute("data-c")).sort().join(" "), want: learnShape({ root: 3, q: "maj", id: "maj", pcs: [] }).f.map((f, s) => f >= 0 ? s + ":" + f : "").filter(Boolean).sort().join(" ") }));
  ok(a.cells === a.want, "U4 tap E♭: lit on the neck as drawn: " + a.cells);
  /* U6 a real guitar's strums, heard as chords */
  await p.evaluate(() => { window.AOGLive = { listen: fn => { window.__lsn = 1; return () => {}; }, frames: fn => { window.__fr = fn; return () => { window.__fr = null; }; } }; });
  a = await p.evaluate(() => AOGLearnUI.test.live(true));
  ok(a === "chords", "U6 following the chords with the input on: the Guitar listens for strums: " + a);
  await p.evaluate(() => { window.__T = 0; AOGLearnUI.test.at(0); AOGLearnUI.test.pass(0); });
  const frame = (T, amp, chord) => p.evaluate(([T, amp, chord]) => { window.__T = T; window.__chord = chord; const b = new Float32Array(11025); for (let i = 0; i < b.length; i++) b[i] = amp * Math.sin(i / 7); window.__fr(b, 44100); }, [T, amp, chord]);
  for (const [T, cc] of [[0.03, { root: 10, q: "maj", name: "Bb", conf: 0.8 }], [2.0, { root: 3, q: "maj", name: "Eb", conf: 0.8 }], [4.0, { root: 2, q: "maj", name: "D", conf: 0.8 }], [6.02, { root: 10, q: "maj", name: "Bb", conf: 0.8 }]]) {
    await frame(T - 0.1, 0.001, null); await frame(T, 0.4, cc); await frame(T + 0.1, 0.4, cc); await frame(T + 0.2, 0.4, cc); await frame(T + 0.3, 0.4, cc);
  }
  r = await p.evaluate(() => { window.__T = 7.9; return AOGLearnUI.test.endPass(7.9); });
  a = await said(p);
  ok(r && r.res.map(x => x.how).join(",") === "on,on,other,on" && (await p.evaluate(() => window.__hc)) > 0, "U6 strums heard as chords (AOGLearn.hearChord) count in Did I get it?: " + JSON.stringify(r && r.res) + " · " + a);
  ok(a === "You played 3 of 4 chords on time. At the change to F, other notes sounded — try the loop at 75%.", "U6 said kindly: " + a);
  await p.evaluate(() => { AOGLearnUI.test.clock(null); AOGLearnUI.test.live(false); });
  await p.selectOption("#lgFollow", "melody"); a = await p.evaluate(() => AOGLearnUI.test.live(true)); await p.evaluate(() => AOGLearnUI.test.live(false));
  ok(a === "notes", "U6 following the tune: single notes, as before: " + a);
  await p.selectOption("#lgFollow", "chords");
  /* U5 the voice of a stereo song */
  await openSub(p, "lgMore");
  a = await p.evaluate(() => [...document.getElementById("lgQuiet").options].map(o => o.textContent).join(" | "));
  await p.selectOption("#lgQuiet", "voice"); await p.waitForFunction(() => AOGLearnUI.test.chain().stereo != null, null, { timeout: 8000 }).catch(() => {});
  let q = await p.evaluate(() => ({ chain: AOGLearnUI.test.chain(), hid: document.getElementById("lgQuietLine").hidden }));
  ok(a === "Nothing | Quiet the voice | Quiet the bass" && q.chain.mode === "voice" && q.chain.stereo === true && q.hid, "U5 a stereo song: the voice quieted, no note: " + JSON.stringify([a, q]));
  ok(errs.length === 0, "the Guitar: no page errors " + errs.join(" | "));
  await c.close();

  /* ══ C · the Bass, with today's engine (none of the new calls) ══ */
  c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c, true);
  p = await c.newPage(); await p.goto(U(P3) + "music-bass.html"); await p.waitForTimeout(1200);
  await openPanel(p); await p.setInputFiles("#lgFile", BSONG); await loaded(p, "Bass song.wav");
  await openSub(p, "lgMore"); await p.waitForTimeout(100);
  a = await p.evaluate(() => ({ part: !!document.getElementById("lgPart"), capo: !!document.getElementById("lgCapoLine"), q: [...document.getElementById("lgQuiet").options].map(o => o.textContent).join(" | "), sec: document.querySelectorAll(".lg-sec").length }));
  ok(!a.part && !a.capo && !a.sec && a.q === "Nothing | Quiet the bass | Quiet the voice", "today's engine: no parts, no capo; the Bass offers to quiet the bass first: " + JSON.stringify(a));
  await p.check("#lgEasy"); await p.waitForTimeout(150);
  ok((await barNames(p)) === "C|G|Am|F", "U3 Easier chords without the engine's help: the plain chords: " + (await barNames(p)));
  await openSub(p, "lgShapesBox"); await p.waitForTimeout(100);
  a = await p.evaluate(() => [...document.querySelectorAll("#lgShapes .lg-shape")].map(e => e.querySelector("span").textContent + ":" + e.querySelectorAll("circle.dt,circle.dr").length + ":" + e.querySelectorAll("line.ln").length).join(" | "));
  ok(a === "C:1:9 | G:1:9 | Am:1:9 | F:1:9", "U4 the bass: the root's place for each chord, four strings: " + a);
  await p.click('#lgShapes .lg-shape[data-k="1"]'); await p.waitForTimeout(100);
  a = await p.evaluate(() => ({ root: [...document.querySelectorAll("#neck .dot.lroot")].map(e => e.getAttribute("data-c")).join(" "), want: (c => c.s + ":" + c.f)(cellFor(bassRoot({ off: ((7 - S.key) % 12 + 12) % 12, q: "maj" }))) }));
  ok(a.root === a.want, "U4 tap G: its root ringed on the neck: " + JSON.stringify(a));
  await p.evaluate(() => { window.AOGLive = { listen: fn => () => {}, frames: fn => () => {} }; });
  a = await p.evaluate(() => { const k = AOGLearnUI.test.live(true); AOGLearnUI.test.live(false); return k; });
  ok(a === "notes", "U6 the bass: single notes from a real bass: " + a);
  ok(errs.length === 0, "the Bass: no page errors " + errs.join(" | "));
  await c.close();

  /* ══ D · inside the Studio: iPhone and iPad, light and dark ══ */
  for (const [dev, theme, room] of [["iPhone 13", "light", "piano"], ["iPhone 13", "dark", "guitar"], ["iPad (gen 7)", "light", "bass"], ["iPad (gen 7)", "dark", "guitar"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme, serviceWorkers: "block" }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U(P4) + "the-studio#" + room);
    const file = "music-" + room + ".html";
    await m.waitForFunction(f => { const fr = document.getElementById("room"), d = fr && fr.contentDocument; return fr && fr.getAttribute("data-file") === "/" + f && d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio"); }, file, { timeout: 20000 });
    await m.waitForTimeout(900);
    const f = await (await m.$("#room")).contentFrame();
    await openPanel(f); await f.setInputFiles("#lgFile", room === "guitar" ? GSONG : SONG16); await loaded(f, room === "guitar" ? "Capo song.wav" : "Long song.wav");
    await openSub(f, "lgMore"); await openSub(f, "lgShapesBox");
    if (room === "guitar") await f.check("#lgCapo");
    await f.evaluate(() => AOGLearnUI.test.at(2.6)); await f.waitForTimeout(300);
    const pc = await f.evaluate(`(${PROBE})()`), pk = await f.evaluate(`(${CALM})()`), side = await f.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const small = await f.evaluate(() => [...document.querySelectorAll("#lgIn button, #lgIn select, #lgIn label.pbtn, #lgIn summary, #lgIn .lg-chk")].filter(e => e.getClientRects().length && !e.classList.contains("lg-n")).map(e => [e.id || e.className || e.tagName, Math.round(e.getBoundingClientRect().height)]).filter(x => x[1] < 44));
    const parts = await f.evaluate(() => ({ secs: document.querySelectorAll("#lgBars .lg-sec").length, tiles: document.querySelectorAll("#lgShapes .lg-shape svg").length,
      neck: typeof GTR === "undefined" || !GTR ? "-" : (l => l.length >= 3 && l.every(e => inReach(+e.getAttribute("data-c").split(":")[1])) ? "in view at fret " + S.fret0 : "OFF")([...document.querySelectorAll("#neck .dot.lrn")]) }));
    ok(!pc.length && !pk.length && side <= 2 && !small.length && parts.tiles >= 3 && parts.neck !== "OFF", `${dev}, ${theme}, ${room}: the capo shape ${parts.neck}; with the parts (${parts.secs}), the pictures (${parts.tiles}) and More ways open it reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}), is calm (${pk.join("; ") || "ok"}), nothing sideways (${side}), every control a finger high (${JSON.stringify(small)})`);
    for (const [id, suf] of [["lgBarsLab", "bars"], ["lgShapesBox", "shapes"], ["lgMore", "more"]]) {
      await f.evaluate(id => document.getElementById(id).scrollIntoView({ block: "start" }), id); await m.waitForTimeout(150);
      await m.screenshot({ path: path.join(require("os").tmpdir(), `learn2-${dev.split(" ")[0].toLowerCase()}-${theme}-${room}-${suf}.png`), fullPage: false });
    }
    await cx.close();
  }
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await b.close(); srv.forEach(s => s.close());
  console.log(fails ? fails + " FAILED" : "ALL PASS");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + (e.stack || e)); process.exit(1); });
