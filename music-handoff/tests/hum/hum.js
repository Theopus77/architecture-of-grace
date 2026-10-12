/* AOG-HUM-V1 (2026-10-12) — "Hum it, and the Studio plays it." Jimmy: "Sing or hum a tune and it becomes notes, played on any
   instrument." Known sound stands in for the voice (synth.js makes it, with its answers): hummed tones with vibrato, breath
   and a voice that wanders, glides between legato notes, "la la", notes apart, a tune sung sharp or flat, a person's loose
   timing; and mouth drums (boom, ka, tss).
   9303 · Chromium's pretend microphone plays a sung tune into the Piano: nothing is fetched or asked for on load; Record →
     Listening… → Stop gives the notes (pitch exact, onsets on the beat), the microphone is let go, the listening ran in a
     Worker; Hear it plays it; tap a note: Up a step (to the next note in the key), Take it out; Keep it makes a take with
     notes like a played one. Count me in: four clicks first, then the song's beat one, moved by the measured trip. Hush
     stops the microphone and keeps what it heard; idle, nothing of Hum it runs (no timers, no frames). Then known tunes
     straight in (AOGHum.test.feed): accuracy over many voices; Keep in the key (the song's key, or the key heard), snapping
     (1/8, 1/16, Off), the octave per room (Piano as sung, Guitar, Bass down into its reach, Band by the instrument chosen),
     Lower / Higher; and without a Worker, the same notes in slices.
   9304 · the pretend microphone beatboxes into the Drum Machine: kick, snare and hi-hat named and on the 1/16 grid; Keep it
     writes bank A pads 1–3 (Undo brings the old beat back); Hear it plays the pads; Teach it my sounds names another
     mouth's sounds right.
   9305 · inside the Studio: a hummed take is added to My Track and reaches the Mixing Desk with its notes (Edit the notes);
     Hum it sits right after Learn a song; Spanish; an iPhone and an iPad, light and dark: readable, calm, nothing sideways.
   No page errors. Run: node music-handoff/tests/hum/hum.js */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), os = require("os");
const S = require("./synth.js");
const P1 = 9303, P2 = 9304, P3 = 9305;
const srv1 = require("../srv.js")(P1), srv2 = require("../srv.js")(P2), srv3 = require("../srv.js")(P3);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "hum-"));
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* the tunes (C major unless said), with what is in them */
const T1 = [[60, 1], [62, 1], [64, 1], [65, 0.5], [67, 0.5], [69, 1], [67, 1], [65, 1], [64, 2]];                   /* no note twice in a row: it can be hummed legato */
const T2 = [[64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1], [60, 1], [60, 1], [62, 1], [64, 1], [64, 1.5], [62, 0.5], [62, 2]];   /* Ode to Joy */
const T3 = [[60, 0.5], [64, 0.5], [67, 0.5], [72, 0.5], [71, 0.25], [69, 0.25], [67, 0.5], [65, 1], [64, 0.5], [62, 0.5], [60, 2]];   /* leaps and 1/16 notes */
const G1 = [[67, 1], [71, 1], [74, 1], [72, 0.5], [71, 0.5], [69, 1], [66, 1], [67, 2]];   /* G major, with its F♯ */
const shift = (t, k) => t.map(n => [n[0] == null ? null : n[0] + k, n[1]]);

const MIC_TUNE = S.melody({ notes: T1, bpm: 100, style: "la", lead: 3.2, tail: 6, vib: 0.4, breath: 0.08 });
const MIC_BEAT = S.beatbox({ hits: [["k", 0], ["h", 0.5], ["s", 1], ["h", 1.5], ["k", 2], ["k", 2.5], ["s", 3], ["h", 3.5], ["k", 4], ["h", 4.5], ["s", 5], ["h", 5.5], ["k", 6], ["s", 7], ["h", 7.5]], bpm: 100, lead: 1.2, tail: 6 });
const F1 = path.join(TMP, "tune.wav"), F2 = path.join(TMP, "beat.wav");
fs.writeFileSync(F1, S.wav(MIC_TUNE.x, MIC_TUNE.sr)); fs.writeFileSync(F2, S.wav(MIC_BEAT.x, MIC_BEAT.sr));

/* every ask for the microphone counted, every stream kept (to see it let go); the timers and frames Hum it starts, counted */
const INIT = () => {
  window.__gum = 0; window.__streams = []; window.__humT = 0;
  const md = navigator.mediaDevices;
  if (md && md.getUserMedia) { const g = md.getUserMedia.bind(md); md.getUserMedia = async c => { window.__gum++; const s = await g(c); window.__streams.push(s); return s; }; }
  const mine = () => /aog-hum\.js/.test(new Error().stack || "");
  ["setTimeout", "setInterval", "requestAnimationFrame"].forEach(k => { const f = window[k]; window[k] = function (fn) { if (mine()) { const a = Array.prototype.slice.call(arguments), g = fn; a[0] = function () { window.__humT++; return g.apply(this, arguments); }; return f.apply(window, a); } return f.apply(window, arguments); }; });
};
async function ctxOf(b, opts, setup) {
  const c = await b.newContext(Object.assign({ viewport: { width: 1280, height: 900 } }, opts || {}));
  c.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message)));
  await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await c.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  await c.addInitScript(INIT);
  await c.addInitScript(s => { try { if (!sessionStorage.getItem("humset")) { sessionStorage.setItem("humset", "1"); Object.keys(s).forEach(k => localStorage.setItem(k, s[k])); } } catch (e) {} },
    Object.assign({ "aog.song.v1": JSON.stringify({ bpm: 100, key: 0, minor: false, at: 1 }), "aog.overdub.v1": JSON.stringify({ on: false, from: 1 }) }, setup || {}));
  return c;
}
const st = (f) => f.evaluate(() => AOGHum.test.state());
const settle = (f, ms) => f.waitForFunction(() => { const s = AOGHum.test.state(); return !s.busy && (s.phase === "result" || s.phase === "idle"); }, null, { timeout: ms || 20000 });
/* known sound straight into Hum it, as if the microphone had heard it */
async function feed(f, kind, snd, origin) {
  const i16 = new Int16Array(snd.x.length); for (let i = 0; i < i16.length; i++) i16[i] = Math.max(-32768, Math.min(32767, Math.round(snd.x[i] * 32767)));
  const b64 = Buffer.from(i16.buffer).toString("base64");
  await f.evaluate(async ([b, sr, k, o]) => { const bin = atob(b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const q = new Int16Array(u.buffer), x = new Float32Array(q.length); for (let i = 0; i < q.length; i++) x[i] = q[i] / 32768; await AOGHum.test.feed(k, x, sr, o); }, [b64, snd.sr, kind, origin == null ? null : origin]);
  await settle(f);
  return st(f);
}
async function setTidy(f, snap, key) {
  await f.evaluate(([s, k]) => { const a = document.getElementById("hmSnap"); if (s != null) { a.value = String(s); a.dispatchEvent(new Event("change")); }
    const b = document.getElementById("hmKey"); if (b && k != null && b.checked !== k) b.click(); }, [snap, key]);
}
/* how close the notes are to the answer: pitch exact, onsets from beat one (first note = beat one) */
function score(td, truth, beat, oct) {
  const n = td.notes, t0 = truth[0].t, out = { n: n.length, want: truth.length, pitch: 0, on50: 0, err: [] };
  truth.forEach((q, i) => { const g = n[i]; if (!g) return; if (g.m === q.m + 12 * (oct || 0)) out.pitch++; const e = Math.abs(g.t - (q.t - t0)); out.err.push(e); if (e <= 0.05) out.on50++; });
  out.mean = out.err.length ? Math.round(out.err.reduce((a, b) => a + b, 0) / out.err.length * 1000) : -1; delete out.err;
  return out;
}
function scoreB(td, truth, bpm) {
  const ev = td.ev.slice().sort((a, b) => a.t - b.t || a.p - b.p), b0 = truth[0].b, P = { k: 0, s: 1, h: 2 };
  let kind = 0, on = 0; truth.forEach((q, i) => { const e = ev[i]; if (!e) return; if (e.p === P[q.k]) kind++; if (Math.abs(e.t - (q.b - b0) * 96) <= 0.05 / (60 / bpm / 96)) on++; });
  return { n: ev.length, want: truth.length, kind, on };
}

(async () => {
  /* ═══════════════ 9303 · the Piano, with a pretend microphone that sings ═══════════════ */
  const b1 = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--use-file-for-fake-audio-capture=" + F1] });
  const c1 = await ctxOf(b1);
  const p = await c1.newPage(); await p.goto("http://localhost:" + P1 + "/music-piano.html"); await p.waitForTimeout(1500);
  const load = await p.evaluate(() => ({ eng: performance.getEntriesByType("resource").some(r => /aog-hum-engine/.test(r.name)), gum: window.__gum, sum: document.getElementById("hmSum").textContent,
    open: document.getElementById("hmBox").open, inner: document.getElementById("hmIn").innerHTML.length, defer: document.querySelector('script[src="/aog-hum.js"]').defer, eng2: !!window.AOGHumEngine }));
  ok(!load.eng && !load.eng2 && load.gum === 0 && load.sum === "Hum it" && !load.open && load.inner === 0 && load.defer,
    "on load: Hum it is one closed block, its inside not yet made, its listening not fetched, the microphone not asked for, the file deferred: " + JSON.stringify(load));
  await p.click("#hmSum"); await p.waitForTimeout(300);
  const words = await p.evaluate(() => document.getElementById("hmIn").innerText);
  ok(words.includes("Hum or sing the tune. Any voice works.") && words.includes("The microphone turns on only when you press Record.") && words.includes("Count me in"),
    "open: the plain words, and that the microphone waits for Record");
  /* idle and open: nothing of Hum it runs */
  let t0 = await p.evaluate(() => window.__humT); await sleep(3000);
  ok(await p.evaluate(() => window.__humT) - t0 === 0, "open and idle for 3 s: no timer or frame of Hum it ran");
  ok(await p.evaluate(() => window.__gum) === 0, "opening it does not ask for the microphone");

  /* Record → Listening… → Stop */
  await p.click("#hmRec");
  await p.waitForFunction(() => AOGHum.test.state().phase === "listen", null, { timeout: 8000 });
  const L1 = await p.evaluate(() => ({ say: document.getElementById("hmSay").textContent, btn: document.getElementById("hmRec").textContent, pr: document.getElementById("hmRec").getAttribute("aria-pressed"), gum: window.__gum }));
  ok(/^● Listening… 0:0\d\. Press Stop when you finish\.$/.test(L1.say) && L1.btn === "■ Stop" && L1.pr === "true" && L1.gum === 1, "Record: the microphone once, ● Listening…, the button is Stop: " + JSON.stringify(L1));
  await sleep(9800);
  await p.click("#hmRec"); await settle(p);
  const r1 = await st(p), rel = await p.evaluate(() => ({ ended: window.__streams.every(s => s.getTracks().every(t => t.readyState === "ended")),
    eng: performance.getEntriesByType("resource").some(r => /aog-hum-engine/.test(r.name)), page: !!window.AOGHumEngine }));
  ok(rel.ended, "Stop lets the microphone go at once");
  ok(r1.worker && rel.eng && !rel.page, "the listening was fetched on the first Record and ran in a Worker, not on the page");
  const s1 = score(r1.tidy, MIC_TUNE.truth, 0.6, 0);
  ok(r1.phase === "result" && s1.n === 9 && s1.pitch === 9 && s1.on50 === 9 && r1.say === "9 notes. Tap a note to change it.",
    "the sung tune through the microphone: 9 notes, every pitch right, every onset on its beat (1/8, ±50 ms): " + JSON.stringify(s1) + " " + r1.say);
  const roll = await p.evaluate(() => [...document.querySelectorAll("#hmRoll .hm-n")].map(b => b.textContent).join(" "));
  ok(roll === "C4 D4 E4 F4 G4 A4 G4 F4 E4", "the strip shows the notes, still: " + roll);
  ok(await p.evaluate(() => !document.getAnimations().length || document.getAnimations().every(a => !document.getElementById("hmBox").contains(a.effect && a.effect.target))), "nothing on the strip moves");

  /* Hear it */
  await p.click("#hmHear"); await p.waitForFunction(() => AOGHum.test.state().playing && !/ready/.test(document.getElementById("hmSay").textContent), null, { timeout: 15000 });
  const h1 = await p.evaluate(() => ({ btn: document.getElementById("hmHear").textContent, rr: !!window.AOGRoomRender }));
  ok(h1.btn === "■ Stop" && h1.rr, "Hear it plays the notes through the piano's own render, and turns into Stop");
  await p.click("#hmHear"); ok(!(await st(p)).playing, "Stop stops it");

  /* tap a note, Up a step (in the key: E → F), then Take it out */
  await p.click('#hmRoll .hm-n[data-i="2"]');
  const fx = await p.evaluate(() => document.getElementById("hmFix").innerText.replace(/\s+/g, " "));
  ok(/This note: E4 Up a step Down a step Take it out/.test(fx), "tap a note: its name and Up a step, Down a step, Take it out: " + fx);
  await p.click('#hmFix [data-do="up"]');
  let m2 = await p.evaluate(() => AOGHum.test.state().tidy.notes.map(n => n.m));
  ok(m2[2] === 65, "Up a step moves E to F, the next note in C major: " + m2.join(","));
  await p.click('#hmFix [data-do="down"]'); await p.click('#hmFix [data-do="down"]');
  m2 = await p.evaluate(() => AOGHum.test.state().tidy.notes.map(n => n.m));
  ok(m2[2] === 62, "Down a step twice: D: " + m2.join(","));
  await p.click('#hmRoll .hm-n[data-i="8"]'); await p.click('#hmFix [data-do="out"]');
  const r2 = await st(p);
  ok(r2.tidy.notes.length === 8 && r2.say === "8 notes. Tap a note to change it.", "Take it out: 8 notes");

  /* Keep it: a take with notes, like a played one */
  await p.click("#hmKeep"); await p.waitForFunction(() => AOGHum.test.state().kept, null, { timeout: 20000 });
  const k1 = await p.evaluate(async () => { const k = REC.takes[0], N = k.notes, ab = await k.blob.arrayBuffer(), dv = new DataView(ab), n = (ab.byteLength - 44) >> 2; let pk = 0;
    for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(dv.getInt16(44 + i * 4, true)));
    const kept = await AOGHandoff.list("roomtakes/keysbench");
    return { say: document.getElementById("hmSay").textContent, last: AOGStudioRec.last(), room: N.room, sound: N.sound, v: N.v, ev: N.ev.map(e => [e.t, e.m, e.d]), bpm: k.bpm, pk, sec: k.sec,
      list: document.getElementById("takes").innerText.includes("Take 1"), kept: kept.items.length, cur: S.sound }; });
  const want = r2.tidy.notes.map(n => n.m);
  ok(k1.say === "Kept as take 1, with your takes. Send it to the Mixing Desk to use it in your song." && k1.last.n === 1 && k1.last.notes === 8 && k1.list && k1.kept === 1,
    "Keep it: take 1 is in the takes and kept on the device: " + k1.say);
  ok(k1.room === "piano" && k1.sound === k1.cur && k1.v === 1 && k1.bpm === 100 && k1.ev.map(e => e[1]).join() === want.join() && Math.abs(k1.ev[0][0] - 0.05) < 1e-6 && k1.pk > 3000,
    "the take carries its notes (the piano, its sound, 100 a minute, the first at 0.05 s, the same pitches) and is not silent: " + JSON.stringify(k1.ev.slice(0, 3)));
  const ev1 = k1.ev; let onGrid = ev1.every(e => Math.abs(((e[0] - 0.05) / 0.3) - Math.round((e[0] - 0.05) / 0.3)) < 1e-3);
  ok(onGrid, "every note of the take sits on the 1/8 grid of the song's tempo");

  /* Count me in: four clicks at the song's tempo, then beat one moved by the measured trip */
  const counted = async (rt) => {
    await p.evaluate(r => { localStorage.setItem("aog.latency.v1", JSON.stringify({ rt: r, at: 1 })); const c = document.getElementById("hmCount"); if (!c.checked) c.click(); window.__osc = 0;
      const o = AudioContext.prototype.createOscillator; AudioContext.prototype.createOscillator = function () { window.__osc++; return o.apply(this, arguments); }; }, rt);
    await p.click("#hmAgain");
    await p.waitForFunction(() => AOGHum.test.state().phase === "count", null, { timeout: 8000 }).catch(async e => { console.log("DBG", JSON.stringify(await p.evaluate(() => { const s = AOGHum.test.state(); return { ph: s.phase, msg: s.msg, say: s.say, rec: s.rec, busy: s.busy }; }))); throw e; });
    const say = await p.evaluate(() => document.getElementById("hmSay").textContent);
    await p.waitForFunction(() => AOGHum.test.state().phase === "listen", null, { timeout: 8000 }).catch(async e => { console.log("DBG2", JSON.stringify(await p.evaluate(() => { const s = AOGHum.test.state(); return { ph: s.phase, msg: s.msg, say: s.say, rec: s.rec, busy: s.busy, ctx: s.ctx, tos: s.tos, D: s.D, osc: window.__osc }; }))); throw e; });
    await sleep(8500); await p.click("#hmRec"); await settle(p);
    const s = await st(p);
    return { say, osc: await p.evaluate(() => window.__osc), origin: s.origin, tidy: s.tidy, n: s.tidy && s.tidy.notes.length };
  };
  const cA = await counted(0.08), cB = await counted(0.2);
  /* the clicks start 0.35 s after the microphone is on, four beats of 0.6 s: beat one about 2.75 s in, then the trip */
  ok(cA.say === "Get ready… 4" && cA.osc === 4 && cA.origin > 2.6 && cA.origin < 3.1 && Math.abs((cB.origin - cA.origin) - 0.12) < 0.04,
    "Count me in: Get ready… 4, four clicks, beat one after them, moved later by the measured trip (0.08 s → 0.2 s moves it " + (cB.origin - cA.origin).toFixed(3) + " s): " + JSON.stringify({ a: cA.origin, b: cB.origin }));
  const firstBeat = cA.tidy.notes[0].t / 0.6;
  ok(cA.n === 9 && Math.abs(firstBeat - Math.round(firstBeat * 2) / 2) < 1e-6, "with Count me in, the notes sit on the song's own beats from beat one (the first on beat " + (firstBeat + 1) + ")");
  await p.evaluate(() => { const c = document.getElementById("hmCount"); if (c.checked) c.click(); localStorage.removeItem("aog.latency.v1"); });

  /* hush: the Studio puts the room out of sight while it listens */
  await p.click("#hmAgain"); await p.waitForFunction(() => AOGHum.test.state().phase === "listen", null, { timeout: 8000 }); await sleep(5200);
  await p.evaluate(() => window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: true } })));
  await settle(p);
  const hu = await p.evaluate(() => ({ s: AOGHum.test.state(), ended: window.__streams.every(s => s.getTracks().every(t => t.readyState === "ended")) }));
  ok(hu.ended && !hu.s.rec && hu.s.phase === "result" && hu.s.msg === "away" && hu.s.say === "It stopped when the room went out of sight. Here is what it heard.",
    "hush while listening: the microphone stops and what it heard is kept: " + hu.s.say);
  await p.evaluate(() => window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: false } })));
  t0 = await p.evaluate(() => window.__humT); await sleep(3000);
  ok(await p.evaluate(() => window.__humT) - t0 === 0 && !(await st(p)).playing && !(await st(p)).rec, "awake again: nothing starts by itself, nothing runs while idle");

  /* ── known tunes straight in: accuracy ── */
  const runs = [
    { name: "T1 hummed legato", notes: T1, style: "hum", snap: 2 }, { name: "T1 la la, 35 cents sharp", notes: T1, style: "la", cents: 35, snap: 2 },
    { name: "Ode to Joy, la la", notes: T2, style: "la", snap: 2 }, { name: "Ode to Joy, apart, breathy", notes: T2, style: "apart", breath: 0.25, snap: 2 },
    { name: "Ode to Joy, apart, 40 cents flat, wide vibrato", notes: T2, style: "apart", cents: -40, vib: 0.7, snap: 2 },
    { name: "T3 leaps and 1/16, la", notes: T3, style: "la", snap: 4 }, { name: "T3 apart, low voice", notes: shift(T3, -12), style: "apart", snap: 4, oct: -12 },
    { name: "T1 high voice, legato", notes: shift(T1, 12), style: "hum", snap: 2, oct: 12 }, { name: "Ode to Joy, loose timing ±30 ms", notes: T2, style: "la", rush: 0.03, snap: 2 }
  ];
  let tot = { n: 0, want: 0, pitch: 0, on50: 0 }, offT = { on50: 0, want: 0 };
  for (const r of runs) {
    const snd = S.melody({ notes: r.notes, bpm: 100, style: r.style, cents: r.cents || 0, vib: r.vib == null ? 0.4 : r.vib, breath: r.breath == null ? 0.08 : r.breath, rush: r.rush || 0, seed: 3 + runs.indexOf(r) });
    await setTidy(p, r.snap, true);
    const s = await feed(p, "tune", snd), sc = score(s.tidy, snd.truth.map(q => ({ t: q.t, m: q.m - (r.oct || 0) + (r.oct || 0) })), 0.6, 0);
    tot.n += Math.min(sc.n, sc.want); tot.want += sc.want; tot.pitch += sc.pitch; tot.on50 += sc.on50;
    /* Off: the raw onsets, from the first */
    await setTidy(p, 0, true); const so = await st(p), soff = score(so.tidy, snd.truth, 0.6, 0); offT.on50 += soff.on50; offT.want += soff.want;
    ok(sc.n === sc.want && sc.pitch === sc.want && sc.on50 === sc.want, r.name + ": " + JSON.stringify(sc) + " · Off: " + soff.on50 + "/" + soff.want + " within 50 ms, mean " + soff.mean + " ms");
  }
  console.log("ACCURACY notes found " + tot.n + "/" + tot.want + ", pitch exact " + tot.pitch + "/" + tot.want + ", onset on its beat (snapped, ±50 ms) " + tot.on50 + "/" + tot.want + ", unsnapped within 50 ms " + offT.on50 + "/" + offT.want);
  ok(offT.on50 >= offT.want * 0.95, "unsnapped, at least 95% of onsets are within 50 ms of the truth");

  /* Keep in the key: a note sung between two (C♯ 40 cents sharp, in C major) goes to D; with it off, the nearest half step */
  const between = S.melody({ notes: [[60, 1], [61.4, 1], [64, 1], [65, 1], [67, 2]], bpm: 100, style: "apart", seed: 21 });
  await setTidy(p, 2, true); let kk = await feed(p, "tune", between);
  const keyLine = await p.evaluate(() => document.getElementById("hmKeyLine").textContent);
  ok(kk.tidy.notes.map(n => n.m).join() === "60,62,64,65,67" && keyLine === "In C major, the song's key.", "Keep in the key: the in-between note goes to D, in the song's key: " + kk.tidy.notes.map(n => n.m) + " · " + keyLine);
  await setTidy(p, null, false); kk = await st(p);
  ok(kk.tidy.notes.map(n => n.m).join() === "60,61,64,65,67" && (await p.evaluate(() => document.getElementById("hmKeyLine").textContent)) === "", "with Keep in the key off, the nearest half step (C♯)");
  await setTidy(p, null, true);
  /* no song key: the key heard in the tune (G major, from its F♯) */
  await p.evaluate(() => AOGSong.set({ bpm: 100 }) && localStorage.setItem("aog.song.v1", JSON.stringify({ bpm: 100, at: 2 })));
  kk = await feed(p, "tune", S.melody({ notes: G1, bpm: 100, style: "la", seed: 5 }));
  ok(kk.tidy.key && kk.tidy.key.key === 7 && !kk.tidy.key.minor && kk.tidy.from === "hum" && (await p.evaluate(() => document.getElementById("hmKeyLine").textContent)) === "In G major, the key your tune is in." &&
    kk.tidy.notes.map(n => n.m).join() === G1.map(n => n[0]).join(), "no song key: the key heard in the tune, G major, and its F♯ kept");
  await p.evaluate(() => localStorage.setItem("aog.song.v1", JSON.stringify({ bpm: 100, key: 0, minor: false, at: 3 })));

  /* the octave, per room: a high voice and a low voice */
  const hi = S.melody({ notes: shift(T1, 12), bpm: 100, style: "la", seed: 8 }), lo = S.melody({ notes: shift(T1, -12), bpm: 100, style: "la", seed: 9 });
  const pianoHi = (await feed(p, "tune", hi)).tidy.notes.map(n => n.m), pianoLo = (await feed(p, "tune", lo)).tidy.notes.map(n => n.m);
  ok(pianoHi[0] === 72 && pianoLo[0] === 48, "the Piano plays it as sung (high: C5, low: C3)");
  await p.click("#hmLower"); const lw = (await st(p)).tidy.notes.map(n => n.m);
  await p.click("#hmHigher"); await p.click("#hmHigher"); const hg = (await st(p)).tidy.notes.map(n => n.m);
  ok(lw[0] === 36 && hg[0] === 60, "Lower and Higher move the whole tune an octave: " + lw[0] + " · " + hg[0]);
  /* without a Worker: the same notes, worked out on the page in slices */
  await p.evaluate(() => AOGHum.test.noWorker());
  const sl = await feed(p, "tune", hi);
  ok(sl.tidy.notes.map(n => n.m).join() === pianoHi.join() && !sl.worker, "with no Worker, the page works it out in slices and finds the same notes");
  const room = async (file, setup) => {
    const q = await c1.newPage(); await q.goto("http://localhost:" + P1 + "/" + file); await q.waitForTimeout(1800);
    if (setup) await q.evaluate(setup);
    await q.click("#hmSum"); await q.waitForTimeout(200);
    const a = (await feed(q, "tune", hi)).tidy.notes.map(n => n.m), b = (await feed(q, "tune", lo)).tidy.notes.map(n => n.m), r = await q.evaluate(() => AOGHumRoom.range && AOGHumRoom.range());
    return { q, a, b, r };
  };
  const g = await room("music-guitar.html");
  ok(g.a[0] === 72 && g.b[0] === 48, "the Guitar plays it as sung when it fits its reach (C5 · C3)");
  await g.q.click("#hmKeep"); await g.q.waitForFunction(() => AOGHum.test.state().kept, null, { timeout: 20000 });
  const gk = await g.q.evaluate(() => ({ n: REC.takes[0].notes.ev.length, room: REC.takes[0].notes.room }));
  ok(gk.n === 9 && gk.room === "guitar", "the Guitar keeps it as a take with its notes: " + JSON.stringify(gk)); await g.q.close();
  const bs = await room("music-bass.html");
  ok(bs.a[0] === 36 && bs.b[0] === 36 && bs.a.every(m => m >= 28 && m <= 67), "the Bass takes it down into its reach (a high voice three octaves, a low one, one): " + bs.a[0] + " · " + bs.b[0]); await bs.q.close();
  const bd = await room("music-band.html");
  ok(bd.r && bd.a.every(m => m >= bd.r[0] && m <= bd.r[1]) && bd.b.every(m => m >= bd.r[0] && m <= bd.r[1]), "the Band: every note in the reach of the instrument chosen now " + JSON.stringify(bd.r) + ": " + bd.a[0] + " · " + bd.b[0]);
  const tuba = await bd.q.evaluate(() => { const s = document.getElementById("soundSel"), o = [...s.options].find(x => x.value === "tuba"); if (!o) return null; s.value = "tuba"; s.dispatchEvent(new Event("change", { bubbles: true })); return AOGHumRoom.range(); });
  if (tuba) { const tb = (await feed(bd.q, "tune", hi)).tidy.notes.map(n => n.m);
    ok(tb.every(m => m >= tuba[0] && m <= tuba[1]) && tb[0] < 72, "the Band on the tuba: the tune moves down into the tuba's reach " + JSON.stringify(tuba) + ": " + tb[0]); }
  await bd.q.close();
  await b1.close();

  /* ═══════════════ 9304 · the Drum Machine, with a pretend microphone that beatboxes ═══════════════ */
  const b2 = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--use-file-for-fake-audio-capture=" + F2] });
  const c2 = await ctxOf(b2);
  const d = await c2.newPage(); await d.goto("http://localhost:" + P2 + "/music-pads.html"); await d.waitForTimeout(1500);
  const dl = await d.evaluate(() => ({ sum: document.getElementById("hmSum").textContent, eng: performance.getEntriesByType("resource").some(r => /aog-hum-engine/.test(r.name)), gum: window.__gum, ev: S.ev.length }));
  ok(dl.sum === "Beatbox it" && !dl.eng && dl.gum === 0, "the Drum Machine: one closed Beatbox it; nothing fetched or asked for on load");
  await d.click("#hmSum"); await d.waitForTimeout(200);
  const bw = await d.evaluate(() => document.getElementById("hmIn").innerText);
  ok(bw.includes("Make the drum sounds with your mouth: boom for the kick, ka for the snare, tss for the hi-hat.") && bw.includes("Teach it my sounds"), "its plain words");
  /* a beat there already, to come back with Undo */
  await d.evaluate(() => startBeat(AOGBeats.classroom[0].id)); const before = await d.evaluate(() => JSON.stringify(S.ev.filter(e => e.b === 0).map(e => [e.p, e.t])));
  await d.click("#hmRec"); await d.waitForFunction(() => AOGHum.test.state().phase === "listen", null, { timeout: 8000 });
  await sleep(7500); await d.click("#hmRec"); await settle(d);
  const bb = await st(d), sb = scoreB(bb.tidy, MIC_BEAT.truth, 90);
  const bpmPads = await d.evaluate(() => S.bpm);
  const sb2 = scoreB(bb.tidy, MIC_BEAT.truth, bpmPads);
  ok(bb.phase === "result" && sb2.n === 15 && sb2.kind === 15, "the beatbox through the microphone: 15 hits, each named right (kick, snare, hi-hat): " + JSON.stringify(sb2) + " " + bb.say);
  /* the beatbox was at 100 a minute; the Drum Machine plays at the song's 100 */
  ok(bpmPads === 100 && sb2.on === 15, "every hit on its 1/16 step at the song's tempo: " + sb2.on + "/15");
  const strip = await d.evaluate(() => ({ k: document.querySelectorAll("#hmRoll .hm-n.k").length, s: document.querySelectorAll("#hmRoll .hm-n.s").length, h: document.querySelectorAll("#hmRoll .hm-n.h").length }));
  ok(strip.k === 5 && strip.s === 4 && strip.h === 6, "the strip shows the hits in their rows: " + JSON.stringify(strip));
  /* tap a hit: it can be another drum, or go */
  await d.click('#hmRoll .hm-n[data-i="0"]'); await d.click('#hmFix [data-do="s"]');
  ok((await st(d)).tidy.ev.find(e => e.i === 0).p === 1, "tap a hit, Snare: it is a snare now");
  await d.click('#hmRoll .hm-n[data-i="0"]'); await d.click('#hmFix [data-do="k"]');
  await d.click("#hmHear"); await d.waitForFunction(() => AOGHum.test.state().playing, null, { timeout: 10000 });
  const fl = await d.evaluate(async () => { let n = 0; const o = window.trigger; return new Promise(r => setTimeout(() => r(AOGHum.test.state().playing), 600)); });
  ok(fl, "Hear it plays the Drum Machine's own pads"); await d.click("#hmHear");
  await d.click("#hmKeep"); await d.waitForFunction(() => AOGHum.test.state().kept === "b", null, { timeout: 10000 });
  const kb = await d.evaluate(() => ({ ev: S.ev.filter(e => e.b === 0).map(e => [e.p, e.t]).sort((a, b) => a[1] - b[1] || a[0] - b[0]), bars: S.bars, say: document.getElementById("hmSay").textContent,
    saved: JSON.parse(localStorage.getItem("aog.pads.v1") || "{}").ev }));
  const wantB = MIC_BEAT.truth.map(q => [{ k: 0, s: 1, h: 2 }[q.k], Math.round((q.b - 0) * 96)]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  ok(JSON.stringify(kb.ev) === JSON.stringify(wantB) && kb.bars === 2 && kb.say === "Your beat is on bank A, over 2 bars. Press Play. Undo brings back the beat you had.",
    "Keep it: bank A's kick, snare and hi-hat pads hold the beat, over 2 bars: " + kb.say);
  await d.click("#undoBtn");
  ok(await d.evaluate(() => JSON.stringify(S.ev.filter(e => e.b === 0).map(e => [e.p, e.t]))) === before, "Undo brings back the beat that was there");
  /* Teach it my sounds: another mouth, whose ka and tss sit lower */
  const other = { snareHz: 1100, hatHz: 3600 };
  const mix = S.beatbox(Object.assign({ hits: [["k", 0], ["s", 1], ["h", 1.5], ["k", 2], ["h", 2.5], ["s", 3], ["h", 3.5]], bpm: 100, seed: 4 }, other));
  let before2 = await feed(d, "beat", mix), sb3 = scoreB(before2.tidy, mix.truth, 100);
  const teach = S.beatbox(Object.assign({ hits: [["k", 0], ["h", 2], ["s", 4]], bpm: 100, seed: 6 }, other));
  const tt = await feed(d, "teach", teach);
  ok(tt.cal && tt.say === "Got it. Your boom, tss and ka are kept on this device." && !!(await d.evaluate(() => localStorage.getItem("aog.hum.beatbox.v1"))), "Teach it my sounds: boom, tss, ka kept on this device");
  const after2 = await feed(d, "beat", mix), sb4 = scoreB(after2.tidy, mix.truth, 100);
  ok(sb4.kind === 7 && sb4.kind > sb3.kind, "with the learner's own sounds, all 7 hits of that mouth are named right (before: " + sb3.kind + "/7)");
  await d.click("#hmForget"); ok(!(await st(d)).cal && (await st(d)).say === "Back to the usual sounds.", "Forget my sounds");
  /* idle: nothing runs */
  t0 = await d.evaluate(() => window.__humT); await sleep(3000);
  ok(await d.evaluate(() => window.__humT) - t0 === 0, "the Drum Machine, Beatbox it open and idle 3 s: nothing of it ran");
  await b2.close();

  /* ═══════════════ 9305 · inside the Studio; Spanish; iPhone and iPad ═══════════════ */
  const b3 = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c3 = await ctxOf(b3, { viewport: { width: 1180, height: 820 } });
  const sp = await c3.newPage(); await sp.goto("http://localhost:" + P3 + "/the-studio#piano");
  const arrived = async (file) => sp.waitForFunction(f => { const fr = document.getElementById("room"), dd = fr && fr.contentDocument; return dd && dd.readyState === "complete" && dd.documentElement.classList.contains("in-studio") && dd.location.pathname.endsWith(f); }, file, { timeout: 30000 });
  await arrived("music-piano.html"); await sp.waitForTimeout(1200);
  let fr = await (await sp.$("#room")).contentFrame();
  const order = await fr.evaluate(() => { const l = document.getElementById("learnBlk"), h = document.getElementById("humBlk"); return { next: l && l.nextElementSibling === h, open: document.getElementById("hmBox").open }; });
  ok(order.next && !order.open, "inside the Studio, Hum it sits closed right after Learn a song");
  await fr.click("#hmSum"); await fr.waitForTimeout(200);
  await feed(fr, "tune", S.melody({ notes: T1, bpm: 100, style: "la", seed: 12 }));
  await fr.click("#hmKeep"); await fr.waitForFunction(() => AOGHum.test.state().kept, null, { timeout: 20000 });
  const sk = await fr.evaluate(() => document.getElementById("hmSay").textContent);
  ok(sk === "Kept as take 1, with your takes. Add it to My Track to use it in your song.", "in the Studio, it says to add it to My Track: " + sk);
  await fr.evaluate(() => AOGStudioRec.add()); await sp.waitForTimeout(800);
  const inb = await fr.evaluate(async () => { const r = await AOGHandoff.list(AOGHandoff.INBOX), x = r.items.find(i => i.from === "piano"), it = x && await AOGHandoff.item(AOGHandoff.INBOX, x.id); return it ? { n: it.notes && it.notes.ev.length, hum: it.notes && it.notes.hum } : null; });
  ok(inb && inb.n === 9 && inb.hum === 1, "+ Add to My Track: the hummed take is in My Track's inbox with its 9 notes");
  await sp.click('.sh-doors a[data-room="studio"]'); await arrived("music-studio.html");
  await sp.waitForFunction(() => { const w = document.getElementById("room").contentWindow; return w.__aogStudio && w.document.readyState === "complete" && !w.__aogStudio.S.decoding; }, null, { timeout: 30000 });
  fr = await (await sp.$("#room")).contentFrame();
  const desk = await fr.evaluate(async () => { const st = __aogStudio; await st.refreshInbox(); const src = st.sources().filter(o => o.kind === "take" && o.x.from === "piano").sort((a, b) => (b.x.at || 0) - (a.x.at || 0))[0];
    let ti = st.SONG.tracks.findIndex((x, i) => i < 7 && !x.clip); if (ti < 0) ti = 0; await st.putOn(src.id, ti); selectTrack(ti); await new Promise(r => setTimeout(r, 500));
    const c = st.SONG.tracks[ti].clip, b = document.querySelector('#clipBox [data-act="notes"]'); return { notes: c.notes && c.notes.ev.length, btn: b ? b.textContent : null }; });
  ok(desk.notes === 9 && desk.btn === "Edit the notes", "at the Mixing Desk the hummed take is a clip with its notes, and Edit the notes: " + JSON.stringify(desk));

  /* Spanish, and the iPhone and iPad, light and dark */
  for (const dev of [{ name: "iPhone", vp: { width: 390, height: 844 }, mobile: true }, { name: "iPad", vp: { width: 820, height: 1180 }, mobile: true }]) {
    for (const theme of ["light", "dark"]) {
      const cx = await ctxOf(b3, { viewport: dev.vp, isMobile: dev.mobile, hasTouch: true }, { "aog.theme": theme, "aog.lang": "es" });
      for (const file of ["music-piano.html", "music-pads.html"]) {
        const q = await cx.newPage(); await q.goto("http://localhost:" + P3 + "/" + file); await q.waitForTimeout(1500);
        const pads = file === "music-pads.html";
        const sum = await q.evaluate(() => document.getElementById("hmSum").textContent);
        await q.click("#hmSum"); await q.waitForTimeout(200);
        if (pads) await feed(q, "beat", S.beatbox({ hits: [["k", 0], ["h", 0.5], ["s", 1], ["h", 1.5]], bpm: 100, seed: 2 }));
        else await feed(q, "tune", S.melody({ notes: T1, bpm: 100, style: "la", seed: 13 }));
        await q.click('#hmRoll .hm-n[data-i="1"]');
        const txt = await q.evaluate(() => document.getElementById("hmIn").innerText);
        const bad = await q.evaluate(`(${PROBE})()`), calm = await q.evaluate(`(${CALM})()`);
        const hmBad = bad.filter(x => /hm|Tarar|boca|Grabar|nota|golpe|Ajustar|Cuéntame|micrófono/i.test(JSON.stringify(x)));
        const btn = await q.evaluate(() => [...document.querySelectorAll("#hmIn button")].filter(b => b.getClientRects().length && !b.classList.contains("hm-n")).every(b => b.getBoundingClientRect().height >= 44));
        const es = pads ? sum === "Hazlo con la boca" && txt.includes("Haz la batería con la boca") && txt.includes("Enséñale mis sonidos") && txt.includes("Este golpe:") && txt.includes("Bombo")
          : sum === "Tararéalo" && txt.includes("Tararea o canta la melodía. Cualquier voz sirve.") && txt.includes("9 notas. Toca una nota para cambiarla.") && txt.includes("Esta nota: Re4") && txt.includes("Mantener en la tonalidad") && txt.includes("En Do mayor, la tonalidad de la canción.");
        ok(es, dev.name + " " + theme + " " + file + ": Spanish words" + (es ? "" : ": " + sum + " | " + txt.slice(0, 300)));
        ok(!hmBad.length && !calm.length && btn, dev.name + " " + theme + " " + file + ": readable, calm, nothing sideways, buttons 44 px" + (hmBad.length || calm.length ? ": " + JSON.stringify(hmBad.slice(0, 3)) + " " + calm.join("; ") : ""));
        await q.close();
      }
      await cx.close();
    }
  }
  await b3.close();
  ok(!errs.length, "no page errors" + (errs.length ? ": " + errs.slice(0, 5).join(" | ") : ""));
  srv1.close(); srv2.close(); srv3.close();
  console.log(fails ? fails + " failed" : "all passed");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + (e && e.stack || e)); process.exit(1); });
