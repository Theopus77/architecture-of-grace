/* AOG-JAM-V1 — Jam with me: a band that follows you (aog-jam.js, the door; aog-jam-band.js, the band).
   A · the Piano (port 9306): the closed block under the takes; nothing loads, sounds or ticks before it is needed (no
       band file, no drum kit, no AudioContext; with the block open but the band off, no timer runs); Start the band
       loads the recorded kit and bass; a count-in of four; chords played on the keys (C G Am F, one a bar, at the song's
       100) are followed within one beat, on the beat at once, and the bass plays each chord's root; the tempo holds;
       a learner who speeds up 100 → 110 is followed smoothly (no beat more than 3 % from the one before) and caught;
       Keep steady stays at 100; when the learner stops the band plays on a little, then fades and ends; Keep playing
       when I stop keeps it going; Stop the band always; the band is not in a take unless Record the band too; the
       Studio's hush (aog-hush) and a hidden page pause it and only what was paused comes back; Spanish.
   B · the Guitar and the Bass (port 9307): a real guitar through a stand-in AOGLive (listen: single notes; frames with
       AOGLearn.hearChord: chords); the Bass offers drums and keys, and the keys play the chord.
   C · the Band and the Studio (port 9308): the Band's own beat section is not heard as the learner; inside the Studio
       on an iPhone and an iPad, light and dark, the block sits in the instrument's panel, reads and is calm.
   No page errors. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const P1 = 9306, P2 = 9307, P3 = 9308, U1 = "http://localhost:" + P1 + "/", U2 = "http://localhost:" + P2 + "/", U3 = "http://localhost:" + P3 + "/";
const srv1 = require("../srv.js")(P1), srv2 = require("../srv.js")(P2), srv3 = require("../srv.js")(P3);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
const ONLY = (process.env.JAM_ONLY || "ABC").split("");

/* counts: AudioContexts made, and every timer and frame callback that runs (the silent treatment) */
const COUNT = () => {
  /* __cb: every callback on the page; __jam: those the jam's own files asked for; __acs/__acsJam: AudioContexts made */
  window.__acs = 0; window.__acsJam = 0; window.__cb = 0; window.__jam = 0;
  const mine = () => /aog-jam/.test(new Error().stack || "");
  const A = window.AudioContext; if (A) window.AudioContext = class extends A { constructor(...a) { super(...a); window.__acs++; if (mine()) window.__acsJam++; } };
  const st = window.setTimeout, si = window.setInterval, rf = window.requestAnimationFrame;
  const wrap = f => { const j = mine(); return function () { window.__cb++; if (j) window.__jam++; return f.apply(this, arguments); }; };
  window.setTimeout = function (f, ...r) { return st.call(this, typeof f === "function" ? wrap(f) : f, ...r); };
  window.setInterval = function (f, ...r) { return si.call(this, typeof f === "function" ? wrap(f) : f, ...r); };
  if (rf) window.requestAnimationFrame = function (f) { return rf.call(this, wrap(f)); };
  try { localStorage.setItem("aog.song.v1", JSON.stringify({ bpm: 100, key: 0, minor: false, at: Date.now() })); } catch (e) {}
};
async function routes(ctx) { await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" })); }
const setChk = (f, id, v) => f.evaluate(([id, v]) => { const e = document.getElementById(id); if (e.checked !== v) e.click(); }, [id, v]);
const St = f => f.evaluate(() => AOGJamBand.test.state());
async function openJam(f) { await f.evaluate(() => { const b = document.getElementById("jmBox"); b.scrollIntoView({ block: "center" }); if (!b.open) b.querySelector("summary").click(); });
  await f.waitForFunction(() => window.AOGJamBand && document.getElementById("jmGo"), null, { timeout: 10000 }); }
async function startJam(f, made) {
  await f.evaluate(m => { AOGJamBand.test.made(m); document.getElementById("jmGo").click(); }, !!made);
  await f.waitForFunction(() => AOGJamBand.test.state().on && AOGJamBand.test.beats().length > 0, null, { timeout: 15000 });
}
/* the learner, in the page: chords on the keys at times on the audio clock (heard time: the band's time + its delay) */
const DRIVER = () => {
  window.__drive = (seq, on, off) => new Promise(done => {
    let i = 0; const offs = [];
    const id = setInterval(() => {
      const c = window.__jamCtx(), now = c.currentTime;
      while (i < seq.length && now >= seq[i].t) { seq[i].ms.forEach(m => on(m)); offs.push([now + seq[i].d, seq[i].ms]); i++; }
      for (let j = offs.length - 1; j >= 0; j--) if (now >= offs[j][0]) { offs[j][1].forEach(m => off(m)); offs.splice(j, 1); }
      if (i >= seq.length && !offs.length) { clearInterval(id); done(); }
    }, 1);
  });
};
/* where the groove begins: the count-in's first beat + its four beats */
const grooveAt = f => f.evaluate(() => { const B = AOGJamBand.test.beats(), s = AOGJamBand.test.state(); return B[0][1] + s.k0 * B[0][2] + s.lag; });
const CH = { C: [48, 52, 55, 60, 64], G: [43, 47, 50, 55, 59, 67], Am: [45, 52, 57, 60, 64], F: [41, 48, 53, 57, 60, 65] };
/* a chord name's root (C, F♯, B♭ …) */
const rootOf = n => { const m = /^([A-G])([♯♭]?)/.exec(n || ""); if (!m) return -1; return ({ C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === "♯" ? 1 : m[2] === "♭" ? 11 : 0)) % 12; };
/* the band's changes of root, and when its bass (or keys) first played each new root */
function follow(ev, beatSec) {
  const out = [], chords = ev.filter(e => e.k === "chord").filter((c, i, A) => i === 0 || rootOf(c.ch) !== rootOf(A[i - 1].ch));
  chords.forEach((c, i) => {
    const next = chords[i + 1] ? chords[i + 1].t : 1e9, root = rootOf(c.ch);
    const first = ev.find(e => (e.k === "bass" || e.k === "keys") && !e.x && e.t >= c.t - 0.02 && e.t < next && (e.k === "bass" ? e.m % 12 === root : e.m.some(m => m % 12 === root)));
    const wrong = ev.filter(e => e.k === "bass" && !e.x && e.t > c.t + 0.06 && e.t < next - 0.01 && !e.cut && e.deg === "R" && e.m % 12 !== root).length;
    out.push({ ch: c.ch, t: c.t, lag: first ? Math.round((first.t - c.t) * 1000) : null, now: !!(first && first.now), wrong: wrong });
  });
  return out;
}
function steps(beats) { const r = []; for (let i = 1; i < beats.length; i++) r.push(Math.abs(beats[i][2] / beats[i - 1][2] - 1)); return r; }

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  let c, p, a, s, ev;

  if (ONLY.includes("A")) {
  /* ══ A · the Piano ══ */
  c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c);
  await c.addInitScript(COUNT); await c.addInitScript(DRIVER);
  const asked = []; c.on("request", r => asked.push(r.url()));
  p = await c.newPage(); await p.goto(U1 + "music-piano.html"); await p.waitForTimeout(1500);
  await p.evaluate(() => { window.__jamCtx = () => ctx(); });
  a = await p.evaluate(() => { const box = document.getElementById("jmBox"), blk = box && box.closest(".blk");
    return { closed: box && !box.open, sum: box && box.querySelector("summary").textContent, inPlay: !!(blk && blk.querySelector("#kbd")), afterTakes: document.getElementById("jamBox").previousElementSibling.id,
      band: !!window.AOGJamBand, acs: window.__acsJam, room: window.AOGJamRoom && AOGJamRoom.room }; });
  const bandAsked = () => asked.filter(u => /aog-jam-band\.js|aog-drumkit\.js|audio\/drums|audio\/bass/.test(u)).map(u => u.split("/").slice(-2).join("/"));
  ok(a.closed && a.sum === "Jam with me" && a.inPlay && a.afterTakes === "takes" && a.room === "piano", "the Piano: Jam with me is closed, in the keys' panel, under the takes: " + JSON.stringify(a));
  ok(!a.band && a.acs === 0 && bandAsked().length === 0, "nothing is loaded or made before it is needed (no band file, no kit, no AudioContext): " + JSON.stringify({ band: a.band, acs: a.acs, asked: bandAsked() }));
  /* the silent treatment: the page at rest, then with the block open and the band off */
  let cb0 = await p.evaluate(() => window.__cb); await p.waitForTimeout(3000); const rest = (await p.evaluate(() => window.__cb)) - cb0;
  await openJam(p);
  a = await p.evaluate(() => ({ acs: window.__acsJam, st: AOGJamBand.test.state(), feels: [...document.querySelectorAll("#jmFeel option")].map(o => o.textContent), who: [...document.querySelectorAll("#jmWho option")].map(o => o.textContent),
    tempo: [...document.querySelectorAll("#jmTempo option")].map(o => o.textContent), go: document.getElementById("jmGo").textContent, now: document.getElementById("jmNow").hidden }));
  await p.waitForTimeout(300); cb0 = await p.evaluate(() => [window.__cb, window.__jam]); await p.waitForTimeout(3000);
  const idle = (await p.evaluate(() => window.__cb)) - cb0[0], idleJam = (await p.evaluate(() => window.__jam)) - cb0[1];
  ok(a.acs === 0 && !a.st.on && !a.st.timer && !a.st.ctx && /aog-jam-band\.js$/.test(bandAsked().join()) && bandAsked().length === 1 && idleJam === 0,
    `opened, the band only gets its own file: no sound engine, no timer of its own (in 3 s: ${idleJam} jam callbacks; the page's own: ${rest} at rest, ${idle} open), asked: ${bandAsked()}`);
  ok(a.feels.join("|") === "Steady rock|Slow ballad|Funk|Swing|Hip-hop|Reggae" && a.who.join("|") === "Drums and bass|Drums only|Bass only" && a.tempo.join("|") === "Follow my tempo|Keep steady" && a.go === "Start the band" && a.now,
    "the choices are menus: " + JSON.stringify([a.feels, a.who, a.tempo, a.go]));
  a = await p.evaluate(() => ({ count: document.getElementById("jmCount").checked, keep: document.getElementById("jmKeep").checked, rec: document.getElementById("jmRec").checked, lvl: document.getElementById("jmLevel").value }));
  ok(a.count && !a.keep && !a.rec && a.lvl === "70", "Count me in on, Keep playing when I stop off, Record the band too off, Band level 70: " + JSON.stringify(a));

  /* 1 · real sounds, a count-in, chords at the song's tempo */
  await startJam(p, false);
  s = await St(p);
  ok(s.kit === "P" && s.bass === "ready" && s.k0 === 4 && Math.abs(s.bpm - 100) < 0.01, "Start the band: the recorded kit (P) and bass are in, four clicks first, at the song's 100: " + JSON.stringify({ kit: s.kit, bass: s.bass, k0: s.k0, bpm: s.bpm, say: s.say }));
  let G = await grooveAt(p), beat = 0.6;
  const prog = ["C", "G", "Am", "F", "C", "G", "Am", "F"];
  await p.evaluate(sq => window.__drive(sq, m => noteOn("k", m, 0.8), m => noteOff("k", m)), prog.map((n, i) => ({ t: G + i * 4 * beat, ms: CH[n], d: 4 * beat - 0.1 })));
  ev = await p.evaluate(() => AOGJamBand.test.events());
  const F1 = follow(ev, beat), counted = ev.filter(e => e.k === "hat" && e.beat < 4 && e.s === 0).length;
  ok(counted === 4, "four count-in clicks: " + counted);
  ok(F1.length === 8 && F1.map(x => x.ch).join(" ") === prog.join(" "), "the band hears each chord: " + F1.map(x => x.ch).join(" "));
  ok(F1.every(x => x.lag != null && x.lag <= 600), "each chord followed within one beat (ms to its root in the bass): " + F1.map(x => x.lag).join(", "));
  ok(F1.slice(1).every(x => x.now || x.lag <= 25), "played on the beat, the bass changes at once: " + F1.map(x => (x.now ? "now " : "") + x.lag).join(", "));
  ok(F1.every(x => x.wrong === 0), "the bass plays each chord's root: " + F1.map(x => x.wrong).join(","));
  let bt = await p.evaluate(() => AOGJamBand.test.beats()), sb = steps(bt);
  ok(bt.every(x => Math.abs(60 / x[2] - 100) < 1.2), "a learner at the song's tempo: the band stays at 100 (" + Math.min(...bt.map(x => 60 / x[2])).toFixed(2) + "–" + Math.max(...bt.map(x => 60 / x[2])).toFixed(2) + ")");
  a = await p.evaluate(() => document.getElementById("jmChord").textContent);
  ok(a === "F", "the chord it hears, shown: " + a);
  await p.evaluate(() => document.getElementById("jmGo").click()); await p.waitForTimeout(600);
  s = await St(p);
  ok(!s.on && !s.timer && s.say === "stopped" && (await p.evaluate(() => document.getElementById("jmSay").textContent)) === "The band stopped.", "Stop the band: it stops, its timer too: " + JSON.stringify({ on: s.on, timer: s.timer, say: s.say }));
  cb0 = await p.evaluate(() => window.__jam); await p.waitForTimeout(3000); a = (await p.evaluate(() => window.__jam)) - cb0;
  ok(a <= 1, "stopped, it rests: " + a + " jam callbacks in 3 s (one is the clean-up that lets its sound go)");

  /* 2 · the learner speeds up, 100 → 110 */
  await p.evaluate(() => { document.getElementById("jmCount").click(); });   /* no count-in */
  await startJam(p, true);
  G = (await p.evaluate(() => { const B = AOGJamBand.test.beats(); return B[0][1] + AOGJamBand.test.state().lag; }));
  const seq = []; let t = G;
  for (let i = 0; i < 40; i++) { const bpm = i < 4 ? 100 : i < 24 ? 100 + 10 * (i - 4) / 20 : 110; seq.push({ t: t, ms: i % 2 ? [60, 64, 67] : [48, 60, 64, 67], d: 0.15 }); t += 60 / bpm; }
  await p.evaluate(sq => window.__drive(sq, m => noteOn("k", m, 0.8), m => noteOff("k", m)), seq);
  bt = await p.evaluate(() => AOGJamBand.test.beats()); sb = steps(bt);
  const last = bt[bt.length - 1], end = 60 / last[2];
  ev = await p.evaluate(() => AOGJamBand.test.events());
  const ons = ev.filter(e => e.k === "on").slice(-6), phase = ons.map(o => { const bb = bt.reduce((x, y) => Math.abs(y[1] - o.t) < Math.abs(x[1] - o.t) ? y : x); return Math.round((o.t - bb[1]) * 1000); });
  ok(Math.max(...sb) <= 0.03, "followed smoothly: the biggest change from one beat to the next is " + (Math.max(...sb) * 100).toFixed(2) + " %");
  ok(Math.abs(end - 110) / 110 < 0.03, "and caught: the band ends at " + end.toFixed(1) + " beats a minute (the learner 110)");
  ok(phase.every(x => Math.abs(x) < 45), "the band's beat lands with the learner's (ms off, last six): " + phase.join(", "));
  a = await p.evaluate(() => document.getElementById("jmBpm").textContent);
  ok(/^1(0[6-9]|1[0-3]) beats a minute$/.test(a), "the tempo it plays, shown: " + a);

  /* 3 · the learner stops: a bar or two more, then it fades and ends */
  const stopAt = await p.evaluate(() => AOGJamBand.test.state().now);
  await p.waitForFunction(() => !AOGJamBand.test.state().on, null, { timeout: 20000 });
  ev = await p.evaluate(() => AOGJamBand.test.events()); s = await St(p);
  const endE = ev.find(e => e.k === "end"), lastOn = ev.filter(e => e.k === "on").pop(), ivE = 60 / end;
  const after = endE ? (endE.t - lastOn.t) / ivE : 0;
  ok(endE && after >= 9 && after <= 15 && s.say === "ended" && !s.timer, `when the learner stops, the band plays on, fades over a bar and ends (${after.toFixed(1)} beats after the last note), its timer stopped: ` + (await p.evaluate(() => document.getElementById("jmSay").textContent)));
  ok(ev.filter(e => endE && e.t > endE.t + 0.01 && e.k !== "chord").length === 0, "nothing is played after the end");

  /* 4 · Keep steady */
  await p.selectOption("#jmTempo", "steady");
  await startJam(p, true);
  G = (await p.evaluate(() => { const B = AOGJamBand.test.beats(); return B[0][1] + AOGJamBand.test.state().lag; }));
  await p.evaluate(sq => window.__drive(sq, m => noteOn("k", m, 0.8), m => noteOff("k", m)), Array.from({ length: 16 }, (_, i) => ({ t: G + i * 60 / 110, ms: [48, 60, 64, 67], d: 0.15 })));
  bt = await p.evaluate(() => AOGJamBand.test.beats());
  ok(bt.every(x => Math.abs(x[2] - 0.6) < 1e-4), "Keep steady: the band stays at 100 while the learner plays 110 (" + bt.length + " beats)");
  await p.evaluate(() => document.getElementById("jmGo").click());
  await p.selectOption("#jmTempo", "follow");

  /* 5 · Keep playing when I stop */
  await p.evaluate(() => document.getElementById("jmKeep").click());
  await startJam(p, true);
  await p.evaluate(() => AOGJamBand.test.feed(48)); await p.waitForTimeout(6500);
  s = await St(p);
  ok(s.on && s.phase === "groove", "Keep playing when I stop: after more than two bars of quiet it still plays: " + s.phase);
  await p.evaluate(() => document.getElementById("jmGo").click()); await p.evaluate(() => document.getElementById("jmKeep").click());

  /* 6 · out of sight: the Studio's hush and a hidden page pause it; only what was paused comes back */
  await startJam(p, true);
  await p.waitForTimeout(500);
  await p.evaluate(() => window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: true } })));
  await p.waitForTimeout(200);
  let n0 = await p.evaluate(() => AOGJamBand.test.events().length), cbh = await p.evaluate(() => window.__jam); await p.waitForTimeout(1500);
  a = await p.evaluate(() => ({ st: AOGJamBand.test.state(), n: AOGJamBand.test.events().length, cb: window.__jam }));
  ok(a.st.paused === "hush" && !a.st.timer && a.n === n0 && a.cb - cbh <= 1, `hushed: it pauses, lays nothing more, its timer stops (${a.n - n0} new, ${a.cb - cbh} jam callbacks in 1.5 s)`);
  await p.evaluate(() => window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: false } }))); await p.waitForTimeout(800);
  a = await p.evaluate(() => ({ st: AOGJamBand.test.state(), n: AOGJamBand.test.events().length }));
  ok(!a.st.paused && a.st.timer && a.n > n0, "woken: it carries on");
  await p.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  a = await St(p);
  await p.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => false }); document.dispatchEvent(new Event("visibilitychange")); });
  s = await St(p);
  ok(a.paused === "hidden" && !a.timer && !s.paused && s.timer, "a hidden page pauses it, and showing the page brings it back");
  await p.evaluate(() => document.getElementById("jmGo").click()); await p.waitForTimeout(400);
  await p.evaluate(() => window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: false } }))); s = await St(p);
  ok(!s.on && !s.timer, "a band that was stopped stays stopped when the Studio wakes the room");

  /* 7 · the take: the band is in it only with Record the band too */
  const takeLate = async (recBand) => {
    if (recBand) await p.evaluate(() => document.getElementById("jmRec").click());
    await startJam(p, true); await p.waitForTimeout(300);
    await p.evaluate(() => { noteOn("k", 72, 0.9); setTimeout(() => noteOff("k", 72), 120); });
    await p.waitForTimeout(80); await p.evaluate(() => document.getElementById("recBtn").click());
    await p.waitForTimeout(3600); await p.evaluate(() => document.getElementById("recBtn").click());
    await p.waitForFunction(n => document.querySelectorAll("#takes audio").length >= n, recBand ? 2 : 1, { timeout: 8000 });
    const out = await p.evaluate(async () => { const u = document.querySelector("#takes audio").src, ab = await (await fetch(u)).arrayBuffer(), bf = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(ab);
      const d = bf.getChannelData(0), sr = bf.sampleRate, a0 = Math.floor(2 * sr), a1 = Math.min(d.length, Math.floor(3.2 * sr)); let q = 0; for (let i = a0; i < a1; i++) q += d[i] * d[i];
      return { rms: Math.sqrt(q / Math.max(1, a1 - a0)), sec: bf.duration, to: AOGJamBand.test.state().to }; });
    await p.evaluate(() => document.getElementById("jmGo").click()); await p.waitForTimeout(500);
    if (recBand) await p.evaluate(() => document.getElementById("jmRec").click());
    return out;
  };
  const off = await takeLate(false), on = await takeLate(true);
  ok(off.to === "out" && off.rms < 0.002, "the band is not in the take (quiet after the one note: rms " + off.rms.toFixed(5) + ", " + off.sec.toFixed(1) + " s take)");
  ok(on.to === "take" && on.rms > 0.01, "with Record the band too, the band is in the take (rms " + on.rms.toFixed(4) + ")");
  a = await p.evaluate(() => document.getElementById("jmRec").checked);
  ok(!a, "Record the band too is chosen each time (off again)");
  ok(errs.length === 0, "the Piano: no page errors " + errs.join(" | "));
  await c.close();

  /* 8 · Spanish */
  c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); watch(c); await routes(c);
  await c.addInitScript(COUNT); await c.addInitScript(() => { try { localStorage.setItem("aog.lang", "es"); } catch (e) {} });
  p = await c.newPage(); await p.goto(U1 + "music-piano.html"); await p.waitForTimeout(1200);
  await openJam(p);
  a = await p.evaluate(() => ({ sum: document.getElementById("jmSum").textContent, go: document.getElementById("jmGo").textContent, intro: document.getElementById("jmIntro").textContent,
    feels: [...document.querySelectorAll("#jmFeel option")].map(o => o.textContent).join("|"), who: [...document.querySelectorAll("#jmWho option")].map(o => o.textContent).join("|"),
    rec: document.getElementById("jmRecL").textContent, keep: document.getElementById("jmKeepL").textContent }));
  ok(a.sum === "Toca conmigo" && a.go === "Empezar la banda" && a.feels === "Rock firme|Balada lenta|Funk|Swing|Hip-hop|Reggae" && a.who === "Batería y bajo|Solo batería|Solo bajo" && a.rec === "Grabar también la banda",
    "en español: " + JSON.stringify(a));
  await startJam(p, true);
  for (const [ms, want] of [[CH.C, "Do"], [CH.Am, "La m"], [[50, 54, 57, 60], "Re7"]]) { await p.evaluate(ms => ms.forEach(m => noteOn("k", m, 0.8)), ms); await p.waitForTimeout(250);
    a = await p.evaluate(() => document.getElementById("jmChord").textContent); ok(a === want, "the chord in Spanish: " + a + " (" + want + ")"); await p.evaluate(ms => ms.forEach(m => noteOff("k", m)), ms); await p.waitForTimeout(120); }
  a = await p.evaluate(() => [document.getElementById("jmGo").textContent, document.getElementById("jmBpm").textContent]);
  ok(a[0] === "Parar la banda" && /pulsos por minuto$/.test(a[1]), "Stop and tempo in Spanish: " + a.join(" · "));
  a = await p.evaluate(`(${CALM})()`); const pc = await p.evaluate(`(${PROBE})()`);
  ok(!a.length && !pc.length, "on an iPhone, open and playing: calm (" + (a.join("; ") || "ok") + "), readable (" + pc.length + " " + JSON.stringify(pc.slice(0, 2)) + ")");
  await p.evaluate(() => document.getElementById("jmGo").click());
  ok(errs.length === 0, "Spanish: no page errors " + errs.join(" | "));
  await c.close();
  }

  if (ONLY.includes("B")) {
  /* ══ B · a real guitar, and the Bass's keys ══ */
  c = await b.newContext({ viewport: { width: 1180, height: 820 } }); watch(c); await routes(c); await c.addInitScript(COUNT); await c.addInitScript(DRIVER);
  p = await c.newPage(); await p.goto(U2 + "music-guitar.html"); await p.waitForTimeout(1500);
  await p.evaluate(() => { window.__jamCtx = () => ctx(); window.__live = null; window.__frames = null;
    AOGLive.listen = fn => { window.__live = fn; return () => { window.__live = null; }; }; });
  await openJam(p); await setChk(p, "jmCount", false);
  await startJam(p, true);
  s = await St(p);
  let G2 = await p.evaluate(() => { const B = AOGJamBand.test.beats(); return B[0][1] + AOGJamBand.test.state().lag; });
  /* single notes, as the listener hears them: a bar of E (E B E G♯), a bar of A (A E A C♯), a bar of D */
  const line = [[40, 47, 52, 56], [45, 52, 57, 61], [50, 57, 62, 66]], lseq = [];
  line.forEach((bar, i) => bar.forEach((m, j) => lseq.push({ t: G2 + (i * 4 + j) * 0.6 + 0.06, ms: [m], d: 0.1 })));
  await p.evaluate(sq => window.__drive(sq, m => window.__live && window.__live(m), () => {}), lseq);
  ev = await p.evaluate(() => AOGJamBand.test.events());
  const FL = follow(ev, 0.6);
  const named = ev.filter(e => e.k === "chord").map(e => e.ch).join(" ");
  ok(/E$/.test(named.split(" A")[0]) && / A /.test(" " + named + " ") && / D$/.test(named), "the kind follows the notes too (G♯ makes E major, C♯ A major, F♯ D major): " + named);
  ok(s.live && FL.map(x => rootOf(x.ch)).join(" ") === "4 9 2", "a real guitar (AOGLive.listen): the band hears E, A, D from single notes: " + FL.map(x => x.ch + " " + x.lag + " ms").join(", "));
  ok(FL.every(x => x.lag != null && x.lag <= 600 && x.wrong === 0), "followed within a beat, the bass on each root: " + JSON.stringify(FL));
  await p.evaluate(() => document.getElementById("jmGo").click());
  /* chords heard whole (AOGLive.frames + AOGLearn.hearChord, where they exist) */
  await p.evaluate(() => { AOGLive.frames = fn => { window.__frames = fn; return () => { window.__frames = null; }; };
    window.AOGLearn = Object.assign(window.AOGLearn || {}, { hearChord: fr => fr.chord }); });
  await startJam(p, true);
  await p.evaluate(() => { for (let i = 0; i < 2; i++) window.__frames({ chord: { root: 2, q: "min", conf: 0.9 } }); });
  a = await p.evaluate(() => document.getElementById("jmChord").textContent);
  ok(a === "Dm", "a strummed chord heard whole (frames + hearChord): " + a);
  await p.evaluate(() => document.getElementById("jmGo").click());
  ok(errs.length === 0, "the Guitar: no page errors " + errs.join(" | "));
  /* the Bass: drums and keys */
  p = await c.newPage(); await p.goto(U2 + "music-bass.html"); await p.waitForTimeout(1500);
  await p.evaluate(() => { window.__jamCtx = () => ctx(); });
  await openJam(p);
  a = await p.evaluate(() => [...document.querySelectorAll("#jmWho option")].map(o => o.textContent).join("|"));
  ok(a === "Drums and keys|Drums only|Keys only", "the Bass: the band offers keys, not a second bass: " + a);
  await setChk(p, "jmCount", false);
  await startJam(p, true);
  G2 = await p.evaluate(() => { const B = AOGJamBand.test.beats(); return B[0][1] + AOGJamBand.test.state().lag; });
  const bl = [[36, 43, 36, 43], [41, 48, 41, 48], [43, 50, 43, 50]], bseq = [];
  bl.forEach((bar, i) => bar.forEach((m, j) => bseq.push({ t: G2 + (i * 4 + j) * 0.6, ms: [m], d: 0.4 })));
  await p.evaluate(sq => window.__drive(sq, m => AOGJamBand.test.feed(m, 0.8, window.__jamCtx().currentTime + AOGJamBand.test.state().lag), () => {}), bseq);
  ev = await p.evaluate(() => AOGJamBand.test.events());
  const FB = follow(ev, 0.6), keys = ev.filter(e => e.k === "keys" && !e.x);
  ok(FB.map(x => rootOf(x.ch)).join(" ") === "0 5 7" && FB.every(x => x.lag != null && x.lag <= 600), "the Bass: a bass line C, F, G is followed within a beat: " + FB.map(x => x.ch + " " + x.lag).join(", "));
  ok(keys.length > 4 && !ev.some(e => e.k === "bass") && keys.every(e => e.m.length >= 3), "the keys play the chord (" + keys.length + " chords, no bass from the band)");
  await p.evaluate(() => document.getElementById("jmGo").click());
  ok(errs.length === 0, "the Bass: no page errors " + errs.join(" | "));
  await c.close();
  }

  if (ONLY.includes("C")) {
  /* ══ C · the Band, and inside the Studio ══ */
  c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c); await c.addInitScript(COUNT);
  p = await c.newPage(); await p.goto(U3 + "music-band.html"); await p.waitForTimeout(1500);
  await openJam(p); await setChk(p, "jmCount", false);
  await startJam(p, true);
  /* the Band's own beat section strokes come with e.kit: never the learner's */
  await p.evaluate(() => { const c = ctx(); for (let i = 0; i < 6; i++) AOGRecorder.note(c, { stop() {} }, { m: 36, v: 0.9, when: c.currentTime, kit: "bd" }); });
  await p.waitForTimeout(200);
  a = await St(p);
  ok(!a.chord, "the Band's beat section is not heard as the learner: " + JSON.stringify(a.chord));
  await p.evaluate(() => { [55, 59, 62].forEach(m => keyOn(m, 0.8)); }); await p.waitForTimeout(300);
  a = await St(p);
  ok(a.chordEn === "G", "the Band's keys: the band hears G: " + a.chordEn);
  await p.evaluate(() => { [55, 59, 62].forEach(m => keyOff(m)); document.getElementById("jmGo").click(); });
  ok(errs.length === 0, "the Band: no page errors " + errs.join(" | "));
  await c.close();
  for (const [dev, theme, room] of [["iPhone 13", "light", "piano"], ["iPhone 13", "dark", "guitar"], ["iPad (gen 7)", "light", "band"], ["iPad (gen 7)", "dark", "bass"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme, serviceWorkers: "block" }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U3 + "the-studio#" + room);
    const file = "music-" + room + ".html";
    await m.waitForFunction(f => { const fr = document.getElementById("room"), d = fr && fr.contentDocument; return fr && fr.getAttribute("data-file") === "/" + f && d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio"); }, file, { timeout: 20000 });
    await m.waitForTimeout(900);
    const f = await (await m.$("#room")).contentFrame();
    a = await f.evaluate(() => { const box = document.getElementById("jmBox"), blk = box && box.closest(".blk"); return { closed: box && !box.open, inPlay: !!(blk && blk.querySelector("#kbd,#neckBox")) }; });
    await openJam(f); await startJam(f, true); await f.evaluate(() => AOGJamBand.test.feed(48)); await f.waitForTimeout(300);
    const pc = await f.evaluate(`(${PROBE})()`), pk = await f.evaluate(`(${CALM})()`), side = await f.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const small = await f.evaluate(() => [...document.querySelectorAll("#jmIn button, #jmIn select, #jmIn .jm-chk")].filter(e => e.getClientRects().length).map(e => Math.round(e.getBoundingClientRect().height)).filter(h => h < 44).length);
    ok(a.closed && a.inPlay && !pc.length && !pk.length && side <= 2 && !small, `${dev}, ${theme}, ${room}: in the instrument's panel, closed (${JSON.stringify(a)}); open and playing it reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}), is calm (${pk.join("; ") || "ok"}), nothing sideways (${side}), every control a finger high (${small} small)`);
    await f.evaluate(() => document.getElementById("jmGo").click());
    await m.screenshot({ path: path.join(require("os").tmpdir(), `jam-${dev.split(" ")[0].toLowerCase()}-${theme}-${room}.png`) });
    await cx.close();
  }
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  }
  await b.close(); srv1.close(); srv2.close(); srv3.close();
  console.log(fails ? fails + " FAILED" : "ALL PASS");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + (e.stack || e)); process.exit(1); });
