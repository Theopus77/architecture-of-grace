/* AOG-LEARN-V1 — Learn a song, in the Piano, the Guitar and the Bass (aog-learn-ui.js). Jimmy: "Can the guitar, bass and
   piano teach how to play songs if I upload them?" … "do them all" (chords along with the song, exact MIDI files, Did I
   get it?, the bass line, the melody). The listening engine (aog-learn.js, AOGLearn) is another engineer's; here it is a
   stand-in that returns known Lessons (an audio song: 8 s, 120 beats a minute, C G Am F; a MIDI song with three parts).
   A · the Piano: closed after the instrument; a file from this device (setInputFiles), calm progress words, kept on the
       device; the chord now and next follow the playhead (an offline clock: at(T)), with the count of beats; the keys
       show the chord's shape; Speed 75 % makes a copy that keeps the pitch (440 Hz stays 440 Hz) and is 4/3 as long;
       a loop of one bar plays only that bar; Did I get it? scores a scripted performance (on time, late, other notes)
       through the piano's own notes and says so kindly, with soft marks on the bars only after the pass; nothing is
       said when the learner only listened; the room's key stays unless asked, then follows; Fix this chord is kept;
       after a reload the song opens at once (no listening again) with the fix; a MIDI song: the part is picked by
       itself, its notes are lit; Spanish.
   B · the Guitar: a song from the Turntables' crate; the neck shows the chord's shape (shapeFor); the tune with its
       "guide" line (low confidence), the notes lit on the neck, Fix this note kept.
   C · the Bass: a MIDI song, the bass part picked, the parts in a menu; Wait for me stops at each note until the right
       one is played on the neck (a wrong one does not count); the bass line of the audio song, lit on the neck.
   D · inside the Studio, iPhone and iPad, light and dark: Learn a song sits right after the instrument, closed; open,
       with a song, it reads (check-contrast) and is calm (check-calm), nothing sideways.
   No page errors. Ports 9285 (the rooms on their own) and 9286 (the Studio). */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const P1 = 9285, P2 = 9286, U1 = "http://localhost:" + P1 + "/", U2 = "http://localhost:" + P2 + "/";
const srv1 = require("../srv.js")(P1), srv2 = require("../srv.js")(P2);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }

/* the known Lessons the stand-in engine returns */
const beats = n => Array.from({ length: n }, (_, i) => i * 0.5);
const AUDIO = { v: 1, src: "audio", name: "Test song", sec: 8, sr: 44100, bpm: 120, beats: beats(16), downbeats: [0, 2, 4, 6], meter: { num: 4, den: 4 }, key: { key: 0, minor: false, conf: 0.9 },
  chords: [{ t: 0, d: 2, root: 0, q: "maj", name: "C", conf: 0.9 }, { t: 2, d: 2, root: 7, q: "maj", name: "G", conf: 0.9 }, { t: 4, d: 2, root: 9, q: "min", name: "Am", conf: 0.8 }, { t: 6, d: 2, root: 5, q: "maj", name: "F", conf: 0.9 }],
  bass: [{ t: 0, d: 1.9, m: 36, conf: 0.9 }, { t: 2, d: 1.9, m: 43, conf: 0.9 }, { t: 4, d: 1.9, m: 45, conf: 0.9 }, { t: 6, d: 1.9, m: 41, conf: 0.9 }],
  melody: [{ t: 0, d: 0.45, m: 64, conf: 0.4 }, { t: 0.5, d: 0.45, m: 67, conf: 0.45 }, { t: 2, d: 0.9, m: 71, conf: 0.4 }, { t: 4, d: 0.9, m: 72, conf: 0.5 }], tracks: [] };
const MIDI = { v: 1, src: "midi", name: "Test MIDI", sec: 4, sr: 0, bpm: 120, beats: beats(8), downbeats: [0, 2], meter: { num: 4, den: 4 }, key: { key: 0, minor: false, conf: 1 },
  chords: [], bass: [], melody: [], tracks: [
    { name: "Piano", ch: 0, program: 0, drums: false, notes: [{ t: 0.5, d: 0.4, m: 60, v: 0.8 }, { t: 1, d: 0.4, m: 64, v: 0.8 }, { t: 1.5, d: 0.4, m: 67, v: 0.8 }, { t: 2, d: 0.9, m: 72, v: 0.8 }] },
    { name: "Drums", ch: 9, program: 0, drums: true, notes: [{ t: 0, d: 0.1, m: 36, v: 0.9 }, { t: 1, d: 0.1, m: 38, v: 0.9 }] },
    { name: "Bass", ch: 1, program: 33, drums: false, notes: [{ t: 0.5, d: 0.45, m: 36, v: 0.8 }, { t: 1, d: 0.45, m: 43, v: 0.8 }, { t: 2, d: 0.9, m: 36, v: 0.8 }] }] };
const STUB = `window.AOGLearn = { words: { listen: { en: "Listening to the song…", es: "Escuchando la canción…" }, chords: { en: "Finding the chords…", es: "Buscando los acordes…" } },
  analyze: async function (x, o) { var n = +(localStorage.getItem("__lgCalls") || 0) + 1; localStorage.setItem("__lgCalls", String(n));
    if (!(x instanceof Blob)) throw new Error("not a blob");
    o.onProgress(0.3, "listen"); await new Promise(r => setTimeout(r, 150)); o.onProgress(0.8, "chords"); await new Promise(r => setTimeout(r, 150));
    return JSON.parse(${JSON.stringify(JSON.stringify(AUDIO))}); },
  fromMidi: function (ab) { var n = +(localStorage.getItem("__lgMidi") || 0) + 1; localStorage.setItem("__lgMidi", String(n)); return JSON.parse(${JSON.stringify(JSON.stringify(MIDI))}); } };`;
/* the song: 8 s of a steady 440 Hz tone (its pitch is what Speed must keep) */
function wav(sec, f) { const sr = 44100, n = sr * sec, b = Buffer.alloc(44 + n * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(9000 * Math.sin(2 * Math.PI * f * i / sr)), 44 + i * 2);
  return b; }
const SONG = { name: "My song.wav", mimeType: "audio/wav", buffer: wav(8, 440) };
const TUNE = { name: "tune.mid", mimeType: "audio/midi", buffer: Buffer.from("MThd\0\0\0\x06\0\0\0\x01\0\x60MTrk\0\0\0\x04\0\xff\x2f\0", "binary") };

async function routes(ctx) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/aog-learn\.js(\?.*)?$/, r => r.fulfill({ body: STUB, contentType: "text/javascript" }));
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
}
const S = f => f.evaluate(() => AOGLearnUI.test.state());
async function openPanel(f) {
  /* AOG-ROOMS-COMPACT-V1: inside the Studio, Learn a song waits in More: a person picks it there first */
  if (await f.evaluate(() => { const b = document.getElementById("lgBox"); return !!(document.getElementById("aogMoreSel") && b && b.closest("[data-aog-sec]") && !b.closest("[data-aog-on]")); }))
    { await f.selectOption("#aogMoreSel", "learn"); await f.waitForTimeout(200); }
  await f.evaluate(() => { const b = document.getElementById("lgBox"); b.scrollIntoView({ block: "center" }); if (!b.open) b.querySelector("summary").click(); }); await f.waitForTimeout(200); }
async function loaded(f, name) { if (process.env.LG_DEBUG) console.log("  say:", await f.evaluate(() => [(document.getElementById("lgSay") || {}).textContent, !!window.AOGLearnUI, !!document.getElementById("lgFile")].join(" | "))); await f.waitForFunction(n => window.AOGLearnUI && AOGLearnUI.test.state().open && AOGLearnUI.test.state().name === n, name, { timeout: 15000 }); await f.waitForTimeout(150); }
const lit = (f, sel) => f.evaluate(sel => [...document.querySelectorAll(sel)].map(e => e.getAttribute("data-m") || e.getAttribute("data-c")).sort().join(" "), sel);

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* ══ A · the Piano ══ */
  let c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c);
  let p = await c.newPage(); await p.goto(U1 + "music-piano.html"); await p.waitForTimeout(1200);
  let a = await p.evaluate(() => { const blk = document.getElementById("learnBlk"), box = document.getElementById("lgBox"), keys = document.getElementById("kbd").closest(".blk");
    return { after: blk.previousElementSibling === keys, closed: box && !box.open, sum: box && box.querySelector("summary").textContent, inRig: blk.parentNode.id }; });
  ok(a.after && a.closed && a.sum === "Learn a song" && a.inRig === "rig", "the Piano: Learn a song sits right after the keys, closed: " + JSON.stringify(a));
  /* the room's own key, set before a song is chosen, must stay */
  await p.evaluate(() => { const k = document.getElementById("keySel"); k.value = "2"; k.dispatchEvent(new Event("change", { bubbles: true })); });
  await openPanel(p);
  await p.evaluate(() => { window.__said = []; new MutationObserver(() => { const t = document.getElementById("lgSay"); if (t && t.textContent) window.__said.push(t.textContent); }).observe(document.getElementById("lgIn"), { subtree: true, childList: true, characterData: true }); });
  await p.setInputFiles("#lgFile", SONG);
  await loaded(p, "My song.wav");
  a = await p.evaluate(() => ({ said: window.__said, calls: localStorage.getItem("__lgCalls"), key: S.key, line: document.getElementById("lgSay").textContent, meta: document.getElementById("lgMeta").textContent,
    follow: document.getElementById("lgFollow").value, opts: [...document.getElementById("lgFollow").options].map(o => o.textContent).join(" | ") }));
  ok(a.calls === "1" && a.said.some(s => /^Listening to the song… 30%$/.test(s)) && a.said.some(s => /^Finding the chords… 80%$/.test(s)) && a.line === "Kept on this device. It opens at once next time.",
    "a file from this device: calm progress words while it listens, then kept: " + JSON.stringify(a.said.slice(0, 4)) + " · " + a.line);
  ok(a.meta === "C major · 120 beats a minute · 4 bars" && a.follow === "chords" && a.opts === "The chords | The tune", "the song's line and what to follow (the piano: chords, the tune): " + a.meta + " · " + a.opts);
  ok(a.key === 2, "the room's own key stays (D) when a song loads: S.key=" + a.key);
  const rec = await p.evaluate(() => new Promise(ok => { const r = indexedDB.open("aog-learn", 1); r.onsuccess = () => { const q = r.result.transaction("songs").objectStore("songs").getAll(); q.onsuccess = () => ok(q.result.map(x => ({ id: x.id, name: x.name, chords: x.lesson.chords.length, blob: !!x.blob }))); }; }));
  ok(rec.length === 1 && rec[0].id === "My song.wav·" + SONG.buffer.length && rec[0].chords === 4 && rec[0].blob, "the lesson and the song are kept in IndexedDB aog-learn: " + JSON.stringify(rec));
  /* the chord now and next follow the playhead */
  const at = async T => { await p.evaluate(T => AOGLearnUI.test.at(T), T); return { s: await S(p), keys: await lit(p, "#kbd .lrn"), root: await lit(p, "#kbd .lroot") }; };
  const pcs = s => [...new Set(s.split(" ").filter(Boolean).map(m => +m % 12))].sort((x, y) => x - y).join(",");
  let r = await at(0.01);
  ok(r.s.now === "C" && r.s.next === "Next: G in 4" && pcs(r.keys) === "0,4,7" && pcs(r.root) === "0" && r.keys.split(" ").length === 3, "at 0 s: C now, Next: G in 4; the keys show C E G once, C ringed: " + JSON.stringify([r.s.now, r.s.next, r.keys, r.root]));
  r = await at(1.0);
  ok(r.s.now === "C" && r.s.next === "Next: G in 2", "at 1 s: Next: G in 2: " + r.s.next);
  r = await at(2.6);
  ok(r.s.now === "G" && r.s.next === "Next: Am in 3" && pcs(r.keys) === "2,7,11" && pcs(r.root) === "7", "at 2.6 s: G now, Next: Am in 3, the keys G B D: " + JSON.stringify([r.s.now, r.s.next, r.keys]));
  r = await at(4.5);
  ok(r.s.now === "Am" && pcs(r.keys) === "0,4,9", "at 4.5 s: Am, the keys A C E: " + r.keys);
  r = await at(7.5);
  ok(r.s.now === "F" && r.s.next === "", "at 7.5 s: F, nothing next yet: " + JSON.stringify([r.s.now, r.s.next]));
  a = await p.evaluate(() => [...document.querySelectorAll("#lgBars .lg-bar")].map(e => e.textContent + (e.getAttribute("aria-current") === "true" ? "*" : "")).join(" | "));
  ok(a === "1C | 2G | 3Am | 4F*", "the bars with their chords, the bar now marked: " + a);
  /* Speed 75 %: a slower copy that keeps the pitch */
  await p.selectOption("#lgSpeed", "75");
  const sp = await p.evaluate(async () => { const base = await AOGLearnUI.test.base(), b = await AOGLearnUI.test.buffer(75), x = b.ch0, sr = b.sr;
    let z = 0; const a0 = sr * 2, a1 = sr * 4; for (let i = a0 + 1; i < a1; i++) if (x[i - 1] < 0 && x[i] >= 0) z++;
    return { base: base.len, len: b.len, sr: sr, hz: z / 2 }; });
  ok(Math.abs(sp.len - Math.round(sp.base / 0.75)) <= 1 && Math.abs(sp.hz - 440) <= 2, "Speed 75 %: the copy is 4/3 as long and keeps the pitch: " + JSON.stringify(sp));
  await p.selectOption("#lgSpeed", "100");
  /* a loop of one bar: only that bar plays */
  await p.evaluate(() => { const c = document.getElementById("lgCount"); c.checked = false; c.dispatchEvent(new Event("change")); });
  await p.click("#lgLoop"); await p.click('#lgBars .lg-bar[data-b="1"]'); await p.click('#lgBars .lg-bar[data-b="1"]');
  a = await p.evaluate(() => ({ st: document.getElementById("lgStatus").textContent, inl: [...document.querySelectorAll("#lgBars .lg-bar.in")].map(e => e.getAttribute("data-b")).join(","), loop: AOGLearnUI.test.state().loop }));
  ok(a.st === "Bar 2 plays again and again." && a.inl === "1" && JSON.stringify(a.loop) === "[1,1]", "Loop a part: tap the bar twice, it is marked and said: " + JSON.stringify(a));
  await p.click("#lgPlay");
  await p.waitForFunction(() => AOGLearnUI.test.state().playing, null, { timeout: 8000 });
  const Ts = []; for (let i = 0; i < 30; i++) { Ts.push(await p.evaluate(() => AOGLearnUI.test.state().T)); await p.waitForTimeout(100); }
  const srcL = await p.evaluate(() => AOGLearnUI.test.source());
  const wrapped = Ts.some((t, i) => i && t < Ts[i - 1] - 0.5);
  ok(Ts.every(t => t >= 1.99 && t < 4.01) && wrapped && srcL && srcL.loop && Math.abs(srcL.a - 2) < 1e-6 && Math.abs(srcL.b - 4) < 1e-6,
    "the loop plays bar 2 only, again and again (2–4 s): " + Ts.map(t => t.toFixed(2)).filter((_, i) => i % 5 === 0).join(" ") + " " + JSON.stringify(srcL));
  await p.click("#lgPlay"); await p.click("#lgLoop");
  ok(!(await S(p)).loop && !(await S(p)).playing, "Pause, and Stop the loop");
  /* Did I get it? A scripted performance through the piano's own notes, on an offline clock */
  await p.evaluate(() => { window.__T = 0; AOGLearnUI.test.clock(() => window.__T); AOGLearnUI.test.at(0); AOGLearnUI.test.pass(0); });
  const hit = (T, ms) => p.evaluate(([T, ms]) => { window.__T = T; ms.forEach(m => noteOn("k", m, 0.7)); ms.forEach(m => noteOff("k", m)); }, [T, ms]);
  await hit(0.03, [60, 64, 67]);     /* C, on time */
  await hit(2.31, [67, 71, 74]);     /* G, 310 ms late */
  await hit(4.02, [61, 66]);         /* at Am, other notes */
  await hit(5.98, [65, 69, 72]);     /* F, on time */
  r = await p.evaluate(() => { window.__T = 7.9; return AOGLearnUI.test.endPass(7.9); });
  a = await p.evaluate(() => ({ said: document.getElementById("lgSaid").textContent, marks: [...document.querySelectorAll("#lgBars .lg-bar")].map(e => { const m = e.querySelector(".mk"); return m ? m.className.replace("mk ", "") : "-"; }).join(","),
    red: [...document.querySelectorAll("#lgIn *")].some(e => /✗|✕|❌/.test(e.textContent)) }));
  ok(r && r.k === 2 && r.n === 4 && r.res.map(x => x.how).join(",") === "on,late,other,on", "Did I get it? on time, late, other notes, on time: " + JSON.stringify(r && r.res));
  ok(a.said === "You played 2 of 4 chords on time. The change to G came a little late — try the loop at 75%." && a.marks === "ok,try,try,ok" && !a.red,
    "said kindly, with soft marks on the bars after the pass, no red X: " + a.said + " · " + a.marks);
  await p.evaluate(() => { AOGLearnUI.test.pass(0); });
  r = await p.evaluate(() => AOGLearnUI.test.endPass(7.9));
  ok(r === null, "a pass where the learner only listened says nothing");
  await p.evaluate(() => { AOGLearnUI.test.clock(null); });
  /* the room's key stays until asked; then the song's key and tempo */
  await p.click("#lgKey"); await p.waitForTimeout(200);
  a = await p.evaluate(() => ({ key: S.key, minor: S.minor, bpm: S.bpm, st: document.getElementById("lgStatus").textContent }));
  ok(a.key === 0 && !a.minor && a.bpm === 120 && a.st === "The room is in C major now.", "Play in the song's key: the room follows (C major, 120): " + JSON.stringify(a));
  /* Fix this chord, kept */
  await p.evaluate(() => AOGLearnUI.test.at(2.6)); await p.click("#lgFix");
  await p.selectOption("#lgFixRoot", "2"); await p.selectOption("#lgFixQ", "7"); await p.click("#lgFixSave");
  r = await at(2.6);
  ok(r.s.now === "D7" && pcs(r.keys) === "0,2,6,9" && JSON.stringify(r.s.fixes.chords) === '{"1":{"root":2,"q":"7"}}' && (await p.textContent("#lgStatus")) === "Saved. This chord is now D7.",
    "Fix this chord: G becomes D7, on the keys too, and it is said: " + JSON.stringify([r.s.now, r.keys, r.s.fixes]));
  /* Spanish */
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(300);
  r = await at(1.0);
  a = await p.evaluate(() => ({ sum: document.querySelector("#lgBox summary").textContent, play: document.getElementById("lgPlay").textContent, fix: document.getElementById("lgFix").textContent, meta: document.getElementById("lgMeta").textContent }));
  ok(a.sum === "Aprende una canción" && r.s.now === "Do" && r.s.next === "Después: Re7 en 2" && a.play === "▶ Tocar" && a.fix === "Corregir este acorde" && a.meta === "Do mayor · 120 pulsos por minuto · 4 compases",
    "Spanish: " + JSON.stringify([a, r.s.now, r.s.next]));
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(300);
  /* a reload: the song opens at once, with its fix, with no listening again */
  await p.reload(); await p.waitForTimeout(1000);
  const t0 = Date.now(); await openPanel(p); await loaded(p, "My song.wav"); const took = Date.now() - t0;
  r = await at(2.6);
  ok(r.s.now === "D7" && (await p.evaluate(() => localStorage.getItem("__lgCalls"))) === "1" && took < 2500, "after a reload it opens at once (" + took + " ms), the fix kept, not listened to again");
  /* the list: the kept song, opened from the menu */
  await p.click("#lgOther"); await p.waitForTimeout(300);
  a = await p.evaluate(() => [...document.querySelectorAll("#lgList optgroup")].map(g => g.label + ": " + [...g.children].map(o => o.textContent).join(", ")).join(" | "));
  ok(a === "Learned here: My song.wav", "Choose another song: the kept song is in the menu: " + a);
  /* a MIDI song: the piano's part picked by itself, its notes lit on the keys */
  await p.setInputFiles("#lgFile", TUNE); await loaded(p, "tune.mid");
  a = await p.evaluate(() => ({ f: document.getElementById("lgFollow").value, opts: [...document.getElementById("lgFollow").options].map(o => o.textContent).join(" | "), midi: localStorage.getItem("__lgMidi"), roll: document.querySelectorAll("#lgRoll .lg-n").length }));
  ok(a.f === "t:0" && a.opts === "All the parts (no drums) | Part: Piano | Part: Bass" && a.midi === "1" && a.roll === 4, "a MIDI song: the Piano part is picked, the parts are a menu, its notes are drawn: " + JSON.stringify(a));
  r = await at(1.05);
  a = await p.evaluate(() => [...document.querySelectorAll("#lgRoll .lg-n.now")].map(e => e.getAttribute("data-m")).join(","));
  ok(r.keys === "64" && r.s.now === "E4" && a === "64", "at 1.05 s the E above middle C is lit on the keys and in the notes: " + JSON.stringify([r.keys, r.s.now, a]));
  r = await at(0.2);
  ok(r.keys === "60" && r.s.next === "Next: C4 in 1", "stopped before a note, the next one is lit: " + JSON.stringify([r.keys, r.s.next]));
  await p.selectOption("#lgFollow", "t:2"); r = await at(0.6);
  ok(r.keys === "48", "the Bass part on the piano: its C2 is shown in the octave in view (C3): " + r.keys);
  ok(errs.length === 0, "the Piano: no page errors " + errs.join(" | "));
  await c.close();

  /* ══ B · the Guitar: a song from the Turntables' crate ══ */
  c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c);
  p = await c.newPage(); await p.goto(U1 + "music-guitar.html"); await p.waitForTimeout(1200);
  await p.evaluate(async b64 => { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    await new Promise(ok => { const r = indexedDB.open("aog-crate", 1); r.onupgradeneeded = () => r.result.createObjectStore("crate");
      r.onsuccess = () => { const tx = r.result.transaction("crate", "readwrite"); tx.objectStore("crate").put([{ id: "Crate song.wav·" + u.length, name: "Crate song.wav", blob: new Blob([u], { type: "audio/wav" }), at: Date.now() }], "lib"); tx.oncomplete = () => { r.result.close(); ok(); }; }; }); },
    SONG.buffer.toString("base64"));
  await openPanel(p); await p.waitForTimeout(300);
  a = await p.evaluate(() => [...document.querySelectorAll("#lgList optgroup")].map(g => g.label + ": " + [...g.children].map(o => o.textContent).join(", ")).join(" | "));
  ok(a === "From the Turntables: Crate song.wav", "the Guitar lists the Turntables' crate: " + a);
  await p.selectOption("#lgList", { label: "Crate song.wav" }); await p.click("#lgOpen"); await loaded(p, "Crate song.wav");
  const gat = async T => { await p.evaluate(T => AOGLearnUI.test.at(T), T); return { s: await S(p), cells: await lit(p, "#neck .dot.lrn"), root: await lit(p, "#neck .dot.lroot") }; };
  r = await gat(2.6);
  const shape = await p.evaluate(() => shapeFor({ off: ((7 - S.key) % 12 + 12) % 12, q: "maj" }).map((f, s) => f >= 0 ? s + ":" + f : "").filter(Boolean).sort().join(" "));
  ok(r.s.now === "G" && r.cells === shape && r.root.length > 0, "the neck shows G's shape where the hand is (shapeFor): " + r.cells + " = " + shape + " · roots " + r.root);
  await p.selectOption("#lgFollow", "melody"); await p.waitForTimeout(150);
  r = await gat(0.1);
  a = await p.evaluate(() => ({ guide: (document.getElementById("lgGuide") || {}).textContent, cell: (c => c.s + ":" + c.f)(cellFor(64)), n: document.querySelectorAll("#lgRoll .lg-n").length }));
  ok(a.guide === "This is a guide; some notes may be off." && r.cells === a.cell && r.s.now === "E4" && a.n === 3, "the tune: the guide line (low confidence), E4 lit at its place near the hand: " + JSON.stringify([a, r.cells]));
  await p.click('#lgRoll .lg-n[data-i="0"]'); await p.click("#lgNUp"); await p.click("#lgNSave");
  r = await gat(0.1);
  ok(r.s.now === "F4" && JSON.stringify(r.s.fixes.notes) === '{"melody":{"0":{"m":65}}}' && (await p.textContent("#lgStatus")) === "Saved. The note is now F4.", "Fix this note: E4 up a step is F4, kept: " + JSON.stringify(r.s.fixes));
  ok(errs.length === 0, "the Guitar: no page errors " + errs.join(" | "));
  await c.close();

  /* ══ C · the Bass: a MIDI song, Wait for me; the bass line ══ */
  c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c);
  p = await c.newPage(); await p.goto(U1 + "music-bass.html"); await p.waitForTimeout(1200);
  await p.waitForFunction(() => { try { ctx(); return !!makeVoice0(ac, LIVE_CH, S.sound, 40, 0.01, ac.currentTime + 30, 0); } catch (e) { return false; } }, null, { timeout: 20000 });
  await openPanel(p); await p.setInputFiles("#lgFile", TUNE); await loaded(p, "tune.mid");
  a = await p.evaluate(() => ({ f: document.getElementById("lgFollow").value, opts: [...document.getElementById("lgFollow").options].map(o => o.textContent).join(" | ") }));
  ok(a.f === "t:2" && a.opts === "All the parts (no drums) | Part: Piano | Part: Bass", "the Bass picks the MIDI song's bass part: " + JSON.stringify(a));
  const bat = async T => { await p.evaluate(T => AOGLearnUI.test.at(T), T); return { s: await S(p), cells: await lit(p, "#neck .dot.lrn") }; };
  r = await bat(0.6);
  let cell = await p.evaluate(() => (c => c.s + ":" + c.f)(cellFor(36)));
  ok(r.cells === cell && r.s.now === "C2", "C2 is lit on the neck, nearest the hand: " + r.cells + " = " + cell);
  await p.evaluate(() => { AOGLearnUI.test.at(0); const c = document.getElementById("lgCount"); c.checked = false; c.dispatchEvent(new Event("change")); });
  await p.click("#lgWait"); await p.click("#lgPlay");
  await p.waitForFunction(() => { const s = AOGLearnUI.test.state(); return s.waiting && !s.playing; }, null, { timeout: 8000 });
  let st = await S(p);
  ok(st.waiting.t === 0.5 && st.waiting.ms.join() === "36" && (await p.textContent("#lgTurn")) === "Your turn: C2", "Wait for me stops at the first note and says whose turn: " + JSON.stringify(st.waiting));
  const pluck = m => p.evaluate(m => { const cl = cellFor(m); pluckCell(cl.s, cl.f, 0.8); }, m);
  await pluck(38); await p.waitForTimeout(400); st = await S(p);
  ok(st.waiting && !st.playing, "a D played instead: the song still waits");
  await pluck(36); await p.waitForFunction(() => AOGLearnUI.test.state().playing || (AOGLearnUI.test.state().waiting || {}).t === 1, null, { timeout: 4000 });
  await p.waitForFunction(() => (AOGLearnUI.test.state().waiting || {}).t === 1, null, { timeout: 4000 });
  st = await S(p);
  ok(st.waiting && st.waiting.ms.join() === "43", "C2 played: the song goes on, and waits again at the G: " + JSON.stringify(st.waiting));
  await p.click("#lgWait");   /* Wait for me off: the song goes on */
  /* the bass line of the audio song */
  await p.click("#lgOther"); await p.setInputFiles("#lgFile", SONG); await loaded(p, "My song.wav");
  a = await p.evaluate(() => [...document.getElementById("lgFollow").options].map(o => o.value).join(","));
  await p.selectOption("#lgFollow", "bass"); r = await bat(2.2);
  cell = await p.evaluate(() => (c => c.s + ":" + c.f)(cellFor(43)));
  ok(a === "chords,bass" && r.cells === cell && r.s.now === "G2" && !(await p.$("#lgGuide")), "the bass line: G2 lit on the neck, no guide line when the notes are sure: " + JSON.stringify([a, r.cells, cell]));
  await p.selectOption("#lgFollow", "chords"); r = await bat(2.2);
  cell = await p.evaluate(() => (c => c.s + ":" + c.f)(cellFor(bassRoot({ off: ((7 - S.key) % 12 + 12) % 12, q: "maj" }))));
  ok((await lit(p, "#neck .dot.lroot")) === cell, "the chords on the bass: G's lowest root in reach is ringed: " + cell);
  ok(errs.length === 0, "the Bass: no page errors " + errs.join(" | "));
  await c.close();

  /* ══ D · inside the Studio: iPhone and iPad, light and dark ══ */
  for (const [dev, theme, room] of [["iPhone 13", "light", "bass"], ["iPhone 13", "dark", "piano"], ["iPad (gen 7)", "light", "guitar"], ["iPad (gen 7)", "dark", "piano"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme, serviceWorkers: "block" }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U2 + "the-studio#" + room);
    const file = "music-" + room + ".html";
    await m.waitForFunction(f => { const fr = document.getElementById("room"), d = fr && fr.contentDocument; return fr && fr.getAttribute("data-file") === "/" + f && d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio"); }, file, { timeout: 20000 });
    await m.waitForTimeout(900);
    const f = await (await m.$("#room")).contentFrame();
    a = await f.evaluate(() => { const rig = document.getElementById("rig"), kids = [...rig.children].filter(e => e.classList.contains("blk")), lb = document.getElementById("learnBlk");
      const play = kids.find(e => e.querySelector("#kbd,#neckBox")); return { next: play && play.nextElementSibling === lb, closed: !document.getElementById("lgBox").open }; });
    await openPanel(f); await f.setInputFiles("#lgFile", SONG); await loaded(f, "My song.wav");
    await f.evaluate(() => AOGLearnUI.test.at(2.6)); await f.waitForTimeout(300);
    const pc = await f.evaluate(`(${PROBE})()`), pk = await f.evaluate(`(${CALM})()`), side = await f.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const small = await f.evaluate(() => [...document.querySelectorAll("#lgIn button, #lgIn select, #lgIn label.pbtn")].filter(e => e.getClientRects().length && !e.classList.contains("lg-n")).map(e => Math.round(e.getBoundingClientRect().height)).filter(h => h < 44).length);
    ok(a.next && a.closed && !pc.length && !pk.length && side <= 2 && !small, `${dev}, ${theme}, ${room}: right after the instrument, closed (${JSON.stringify(a)}); open with a song it reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}), is calm (${pk.join("; ") || "ok"}), nothing sideways (${side}), every control a finger high (${small} small)`);
    await m.screenshot({ path: path.join(require("os").tmpdir(), `learn-${dev.split(" ")[0].toLowerCase()}-${theme}-${room}.png`) });
    await cx.close();
  }
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await b.close(); srv1.close(); srv2.close();
  console.log(fails ? fails + " FAILED" : "ALL PASS");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + (e.stack || e)); process.exit(1); });
