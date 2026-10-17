/* AOG-STEADY-ALL-V1 (2026-10-17) — Jimmy: "As I have been tapping notes and such, sometimes it still feels like after a
   certain number of notes are played, it freezes up for a note or two…" (iPhone sideways and iPad, inside the Studio, in
   every room). Every room as a visitor gets it, inside the Studio (/the-studio#room, the made rooms in fast/), on an iPhone
   held sideways (iPhone 13 landscape, touch) with its processor slowed four times (DevTools protocol). 300 notes by real
   touches in the patterns a player makes: a scale, repeated notes, three-finger chords (the fingers a moment apart), a fast
   run, and long notes held while others play. The page's own work is read from a trace of its main thread, in thread time,
   so a busy computer running the tests does not count against the room:
     · every key, fret, pad and drum played is reachable: nothing of the Studio's lies over it (the floating My notes did)
     · every finger that lands makes its sound
     · each note's main-thread time, from the task that carries the finger to the sound's start(), is 25 ms or less
     · no task with 50 ms or more of work while playing (the page's scripts, style, layout, painting, hit-testing; a
       garbage collection is shown, not failed: the page's heap is a few MB, and its pause on a computer this loaded is
       mostly waiting for helper threads)
     · the voices stay bounded while playing (96 sounds at once at most: a held player is two, its start and its loop,
       and a voice let go fades a moment), and let go once the notes have rung out
     · nothing is fetched or unpacked mid-play (no recording, no room the Studio warms)
   The Turntables: a record playing, its eight pads (a chop each) pressed; the "sound" is the jump sent to the deck.
   node play/steady-all.js [piano guitar bass pads kit decks]; the Band, with its new sounds, is play/steady-band.js.
   Port 9380. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const RATE = 4, NOTE_MS = 25, LONG_MS = 50, VOICES = 96, N = +process.env.STEADY_NOTES || 300;
function serve(port) {
  const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".wasm": "application/wasm" };
  return http.createServer((q, r) => {
    let u = decodeURIComponent(q.url.split("?")[0].split("#")[0]);
    if (u === "/the-studio" || u === "/music") u = "/the-studio.html";
    else { const m = u.match(/^\/(music-[a-z]+\.html)$/); if (m && fs.existsSync(path.join(ROOT, "fast", m[1]))) u = "/fast/" + m[1]; }
    if (u.endsWith("/")) u += "index.html";
    let f = path.join(ROOT, u); if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html";
    fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": T[path.extname(f)] || "application/octet-stream" }); r.end(d); });
  }).listen(port);
}
/* in every frame: each sound started (and a mark in the trace), the voices alive, fetches and unpacking, each finger */
const PROBE = () => {
  const A = () => performance.timeOrigin + performance.now();
  const P = window.__P = { st: [], live: 0, peak: 0, ev: [], dn: [] };
  const mark = () => { P.st.push(A()); try { console.timeStamp("aog-note"); } catch (e) {} };
  window.__aogMark = mark;
  const f0 = window.fetch; window.fetch = function (u) { P.ev.push({ k: "fetch", t: A(), u: String(u && u.url || u) }); return f0.apply(this, arguments); };
  const B = window.BaseAudioContext || window.AudioContext;
  if (B && B.prototype.decodeAudioData) { const d0 = B.prototype.decodeAudioData; B.prototype.decodeAudioData = function () { P.ev.push({ k: "decode", t: A() }); return d0.apply(this, arguments); }; }
  const OFF = window.OfflineAudioContext;
  ["AudioBufferSourceNode", "OscillatorNode", "ConstantSourceNode"].forEach(k => {
    const C = window[k]; if (!C) return; const Pr = C.prototype, o = Pr.start; if (!o) return;
    Pr.start = function () {
      if (!(OFF && this.context instanceof OFF)) {
        mark(); P.live++; if (P.live > P.peak) P.peak = P.live;
        this.addEventListener("ended", () => { P.live--; });
      }
      return o.apply(this, arguments);
    };
  });
  addEventListener("pointerdown", e => P.dn.push({ t: A() }), true);
};
/* where a finger plays, in the room's own page */
const KEYS = () => [...document.querySelectorAll("#kbd [data-m]")].map(el => { const r = el.getBoundingClientRect(), bk = el.classList.contains("bk"); return { bk, x: r.x + r.width / 2, y: r.y + r.height * (bk ? 0.6 : 0.85) }; })
  .filter(k => k.x > 0 && k.x < innerWidth).sort((a, b) => a.bk - b.bk);
const NECK_AT = () => { const svg = document.getElementById("neck"), r = svg.getBoundingClientRect(), sx = r.width / NECK.W, sy = r.height / NECK.H, out = [];
  for (let i = 0; i < NECK.n; i++) for (let row = 0; row < NECK.rows; row++) { let x = (NECK.fx[i] + NECK.fx[i + 1]) / 2; if (NECK.flip) x = NECK.W - x; out.push({ x: r.x + x * sx, y: r.y + (NECK.top + (row + 0.5) * NECK.rowH) * sy }); }
  return out; };
const ROOMS = {
  piano: { file: "music-piano", ready: () => { const s = SOUNDS[S.sound]; return !(s && s.kind === "sample") || !!(SETS[s.set] && SETS[s.set].ready); }, at: KEYS,
    /* the grand, then a small recorded set, then a made sound */
    sounds: () => { const ids = Object.keys(SOUNDS), smp = ids.find(k => k !== S.sound && SOUNDS[k].kind === "sample" && SETS[SOUNDS[k].set] && SETS[SOUNDS[k].set].notes.length <= 25 && (SETS[SOUNDS[k].set].layers || []).length === 1), made = ids.find(k => SOUNDS[k].kind !== "sample");
      return [S.sound, smp, made].filter(Boolean); },
    pick: id => { const s = document.getElementById("soundSel"); s.value = id; s.onchange(); } },
  /* the Band: its first sound, then the mariachi, a folk and a classroom instrument, and a voice */
  band: { file: "music-band", ready: () => typeof soundReady === "function" && soundReady(S.sound), at: KEYS,
    sounds: () => [S.sound, "mariachi", "mandolin", "ukulele", "voice_f_aa"].filter((k, i, a) => SOUNDS[k] && a.indexOf(k) === i),
    pick: id => { const s = document.getElementById("soundSel"); s.value = id; s.onchange(); } },
  guitar: { file: "music-guitar", ready: () => typeof soundReady === "function" && soundReady(S.sound), at: NECK_AT },
  bass: { file: "music-bass", ready: () => typeof soundReady === "function" && soundReady(S.sound), at: NECK_AT },
  pads: { file: "music-pads", ready: () => typeof canPlay === "function" && canPlay(S.bank),
    at: () => [...document.querySelectorAll("#pads .pad")].map(el => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }).filter(k => k.x > 0 && k.y > 0 && k.y < innerHeight && k.x < innerWidth) },
  kit: { file: "music-kit", ready: () => { const s = AOGDrumKit.state(S.bank); return !!(s && s.state === "ready"); },
    at: () => [...document.querySelectorAll("[data-pad]")].filter(g => g.getClientRects().length).map(g => { const sh = g.querySelector(".glow > *") || g, r = sh.getBoundingClientRect(); return { x: r.x + r.width / 2, y: Math.min(r.y + r.height / 2, innerHeight - 20) }; }).filter(k => k.x > 0 && k.y > 0 && k.y < innerHeight) },
  /* the Turntables: a record on deck A, playing, its eight pads set to the next eight beats; a press sends the jump */
  decks: { file: "music-decks", deck: true,
    setup: async f => { await f.evaluate(() => { const s0 = window.send; window.send = function (d, m) { if (m && (m.t === "qjump" || m.t === "jump")) window.__aogMark(); return s0.apply(this, arguments); };
        loadMade(decks.find(d => d.id === "A"), "house"); });
      await f.waitForFunction(() => { const d = decks.find(x => x.id === "A"); return d.buf && d.bpm > 0 && (d.node || d.core); }, null, { timeout: 90000 });
      await f.evaluate(() => { document.querySelector('[data-play="A"]').click(); });
      await f.waitForFunction(() => decks.find(x => x.id === "A").motor, null, { timeout: 20000 });
      await f.evaluate(() => { chop8(decks.find(x => x.id === "A")); const b = document.querySelector('[data-hot="A"][data-i="0"]'); b.scrollIntoView({ block: "center" }); }); },
    ready: () => true,
    at: () => [...document.querySelectorAll('[data-hot="A"]')].map(el => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }).filter(k => k.y > 0 && k.y < innerHeight) }
};
/* the phrase: n notes over w places, a little over a minute of playing */
function phrase(n, w) {
  const plan = []; let t = 0, i = 0;
  const add = (ks, step, hold) => { plan.push({ t, ks, hold }); t += step; };
  while (plan.length < n) {
    const ph = Math.floor(i / 20) % 5, j = plan.length; i++;
    if (ph === 0) add([j % Math.min(w, 15)], 200, 150);                                               /* a scale */
    else if (ph === 1) add([(j >> 2) % Math.min(w, 8)], 130, 80);                                     /* repeated notes */
    else if (ph === 2) { const k = (j * 2) % Math.max(1, w - 5); add([k, (k + 2) % w, (k + 4) % w], 280, 220); }   /* chords */
    else if (ph === 3) add([(j * 5) % w], 100, 60);                                                   /* a fast run */
    else add([(j * 3) % w], 200, j % 4 === 0 ? 1200 : 140);                                           /* long notes held while others play */
  }
  return plan;
}
/* the renderer's main thread from a trace: its tasks (thread time), each finger's dispatch, each sound's mark, collections */
function readTrace(ev) {
  const main = new Set(ev.filter(e => e.ph === "M" && e.name === "thread_name" && /CrRendererMain/.test(e.args && e.args.name)).map(e => e.pid + ":" + e.tid));
  const on = ev.filter(e => main.has(e.pid + ":" + e.tid)).sort((a, b) => a.ts - b.ts);
  const tasks = []; let end = -1;
  for (const e of on) if (e.ph === "X" && (e.name === "ThreadControllerImpl::RunTask" || e.name === "RunTask") && e.ts >= end) { tasks.push(e); end = e.ts + e.dur; }
  const downs = on.filter(e => e.ph === "X" && e.name === "EventDispatch" && e.args && e.args.data && e.args.data.type === "pointerdown");
  const marks = on.filter(e => e.name === "TimeStamp" && e.args && e.args.data && e.args.data.message === "aog-note");
  const gcs = on.filter(e => e.ph === "X" && (e.name === "MajorGC" || e.name === "MinorGC" || e.name === "V8.GCFinalizeMC" || e.name === "V8.GCIncrementalMarking"));
  const inside = (x, T) => x.ts >= T.ts && x.ts <= T.ts + T.dur;
  const taskOf = x => { let lo = 0, hi = tasks.length - 1, best = null; while (lo <= hi) { const m = (lo + hi) >> 1; if (tasks[m].ts <= x.ts) { best = tasks[m]; lo = m + 1; } else hi = m - 1; } return best && inside(x, best) ? best : null; };
  const td = e => (e.tdur != null ? e.tdur : e.dur) / 1000;
  /* what a task spent its time on: the scripts it ran (by file and line), and the browser's own steps by name */
  const WRAP = /^(ThreadControllerImpl::RunTask|RunTask|EventDispatch|v8\.callFunction|AsyncTask Run|TimerBase::run|TimerFire|ProxyMain::BeginMainFrame|WebFrameWidgetImpl::|LocalFrameView::|Blink\.|BlinkScheduler|ScheduledAction|V8\.GC_)/;
  const what = T => { const w = {}; on.forEach(x => { if (x === T || x.ph !== "X" || !inside(x, T) || WRAP.test(x.name)) return;
      const k = x.name === "FunctionCall" ? ((x.args.data || {}).functionName || "?") + "@" + ((x.args.data || {}).url || "").split("/").pop() + ":" + (x.args.data || {}).lineNumber : x.name;
      w[k] = (w[k] || 0) + td(x); });
    return Object.entries(w).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => k + " " + v.toFixed(0)).join(", "); };
  /* the work a task did that the trace can name: the page's scripts and the browser's own steps for it (style, layout,
     painting, hit-testing, parsing), outermost first. Waiting is left out: the slowed processor is slowed by spinning, so a
     main thread waiting on a helper (a frame's commit, a collection's helpers) on a busy computer counts as busy */
  const NAMED = /^(FunctionCall|EventDispatch|TimerFire|FireAnimationFrame|FireIdleCallback|EvaluateScript|v8\.compile|v8\.run|ParseHTML|ParseAuthorStyleSheet|UpdateLayoutTree|Layout|PrePaint|Paint|Layerize|HitTest|LayoutView::HitTest|DecodeImage|MajorGC|MinorGC)$/;
  const work = T => { let s = 0, end = -1; on.forEach(x => { if (x === T || x.ph !== "X" || !inside(x, T) || x.ts < end || !NAMED.test(x.name)) return; s += td(x); end = x.ts + x.dur; }); return s; };
  return { tasks, downs, marks, gcs, taskOf, td, what, work };
}
async function play(b, port, id, opts) {
  opts = opts || {};
  const R = ROOMS[id], U = "http://localhost:" + port + "/";
  const c = await b.newContext({ ...pw.devices["iPhone 13 landscape"], serviceWorkers: "block" });
  await c.addInitScript(PROBE); await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  const errs = []; c.on("page", pg => pg.on("pageerror", e => errs.push(e.message)));
  const p = await c.newPage(), cdp = await c.newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: RATE });
  if (opts.before) await opts.before(p);
  await p.goto(U + "the-studio#" + id);
  let f = null; for (let i = 0; i < 600 && !f; i++) { f = p.frames().find(x => x.url().indexOf(R.file) >= 0); if (!f) await p.waitForTimeout(100); }
  await f.waitForLoadState("load");
  if (R.setup) await R.setup(f);
  await f.waitForFunction(R.ready, null, { timeout: 120000 });
  await p.waitForTimeout(800);
  const fr = await (await f.frameElement()).boundingBox();
  let at = await f.evaluate(R.at);
  /* nothing lies over a place a finger plays: the room's own page and the Studio around it */
  const own = await f.evaluate(T => T.map(k => { const el = document.elementFromPoint(k.x, k.y); return el && el.closest && el.closest("#kbd,#neck,#pads,[data-pad],[data-hot],#pvStrip") ? "" : (el ? el.tagName + "." + String(el.className && el.className.baseVal != null ? el.className.baseVal : el.className).split(" ")[0] : "nothing"); }), at);
  const top = await p.evaluate(T => T.map(k => { const el = document.elementFromPoint(k.x, k.y); return el && el.tagName === "IFRAME" ? "" : el ? el.tagName + "." + String(el.className).split(" ")[0] : "nothing"; }), at.map(k => ({ x: fr.x + k.x, y: fr.y + k.y })));
  const over = at.map((k, i) => own[i] || (top[i] ? "the Studio's " + top[i] : "")).filter(Boolean);
  ok(at.length >= 8 && !over.length, `${id}: every place to play (${at.length}) can be reached by a finger${over.length ? ": " + [...new Set(over)].slice(0, 4).join(", ") + " lies over " + over.length : ""}`);
  at = at.filter((k, i) => !own[i] && !top[i]);
  const xy = k => ({ x: fr.x + at[k].x, y: fr.y + at[k].y });
  const touch = (type, pts) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts });
  /* the first tap wakes the sound (it is not one of the notes measured) */
  await touch("touchStart", [{ ...xy(0), id: 1 }]); await p.waitForTimeout(120); await touch("touchEnd", [{ ...xy(0), id: 1 }]); await p.waitForTimeout(1500);
  const sounds = R.sounds ? await f.evaluate(R.sounds) : [null];
  const tev = []; cdp.on("Tracing.dataCollected", d => { for (const e of d.value) if (e.ph === "M" || e.ph === "X" || e.name === "TimeStamp") tev.push(e); });
  const W = Math.min(at.length, 15), fingers = { planned: 0 }, spans = [];
  let peak = 0, base = 0;
  for (let si = 0; si < sounds.length; si++) {
    if (sounds[si] && si > 0) { await f.evaluate(R.pick, sounds[si]); await f.waitForFunction(R.ready, null, { timeout: 120000 }); await p.waitForTimeout(800);
      await touch("touchStart", [{ ...xy(0), id: 1 }]); await p.waitForTimeout(120); await touch("touchEnd", [{ ...xy(0), id: 1 }]); await p.waitForTimeout(1200); }
    const plan = phrase(Math.round(N / sounds.length), W);
    /* what runs before the first note (an amp's slow wobblers, a keep-alive) is not a voice */
    if (si === 0) base = await f.evaluate("__P.live");
    await f.evaluate(() => { __P.peak = __P.live; });
    await cdp.send("Tracing.start", { traceConfig: { includedCategories: ["toplevel", "devtools.timeline", "v8.gc"] }, transferMode: "ReportEvents" });
    await p.waitForTimeout(300);
    const S0 = Date.now() + 200, down = new Set(), ends = [];
    const lift = async e => { const w = e.at - Date.now(); if (w > 0) await new Promise(r => setTimeout(r, w)); e.ks.forEach(x => down.delete(x)); await touch("touchEnd", e.ks.map(x => ({ ...xy(x.k), id: x.id }))); };
    for (const n of plan) {
      while (ends.length && ends[0].at <= S0 + n.t) await lift(ends.shift());
      const w = S0 + n.t - Date.now(); if (w > 0) await new Promise(r => setTimeout(r, w));
      const used = new Set([...down].map(x => x.id)), fing = n.ks.map(k => { let q = 1; while (used.has(q)) q++; used.add(q); return { k, id: q }; });
      /* a chord's fingers land a moment apart, as a hand's do */
      for (const x of fing) { if (fing.length > 1 && x !== fing[0]) await new Promise(r => setTimeout(r, 12)); down.add(x); await touch("touchStart", [...down].map(y => ({ ...xy(y.k), id: y.id }))); }
      fingers.planned += fing.length;
      ends.push({ at: S0 + n.t + n.hold, ks: fing }); ends.sort((a, b) => a.at - b.at);
    }
    for (const e of ends) await lift(e);
    const S1 = Date.now() + 300; await p.waitForTimeout(500);
    const done = new Promise(r => cdp.once("Tracing.tracingComplete", r)); await cdp.send("Tracing.end"); await done;
    spans.push({ S0, S1, sound: sounds[si] });
    peak = Math.max(peak, await f.evaluate("__P.peak"));
  }
  const P = await f.evaluate("__P"), PT = await p.evaluate("window.__P || {ev:[]}");
  const tr = readTrace(tev);
  /* every finger: its dispatch, the sound marked after it (before the next finger), the task that carried it */
  const downs = tr.downs, rows = downs.map((d, i) => { const nx = downs[i + 1] ? downs[i + 1].ts : Infinity, m = tr.marks.find(x => x.ts >= d.ts && x.ts < nx), T = tr.taskOf(d);
    if (!m || !T) return { ok: false, T };
    const same = tr.taskOf(m) === T, ms = same && m.tts != null && T.tts != null ? (m.tts - T.tts) / 1000 : (m.ts - T.ts) / 1000 * (tr.td(T) / Math.max(0.001, T.dur / 1000));
    return { ok: true, ms, same, T }; });
  const sounded = rows.filter(r => r.ok), ms = sounded.map(r => r.ms).sort((a, b) => a - b), worst = ms[ms.length - 1] || 0, p95 = ms[Math.floor(ms.length * 0.95)] || 0;
  const label = id + (sounds.length > 1 ? " (" + sounds.filter(Boolean).join(", ") + ")" : "");
  /* (which sound a silent finger was on, read from the page's own clock) */
  const quiet = P.dn.filter((d, i) => spans.some(s => d.t >= s.S0 && d.t <= s.S1) && !P.st.some(t => t >= d.t - 1 && t < (P.dn[i + 1] ? P.dn[i + 1].t : Infinity)))
    .map(d => (spans.find(s => d.t >= s.S0 && d.t <= s.S1) || {}).sound || id);
  ok(downs.length >= fingers.planned && sounded.length === downs.length, `${label}: ${fingers.planned} fingers landed, every one made its sound (${downs.length} reached the room, ${sounded.length} sounded${quiet.length ? "; silent on " + quiet.join(", ") : ""})`);
  ok(worst <= NOTE_MS, `${label}: every note's main-thread time to its sound within ${NOTE_MS} ms (worst ${worst.toFixed(1)}, 95% within ${p95.toFixed(1)}; four times slower than a phone)`);
  /* (the trace runs only while a phrase is played) */
  /* a long task: one whose named work (scripts, layout, painting) is 50 ms or more; a garbage collection is shown apart */
  const gcOf = T => tr.gcs.filter(g => g.ts >= T.ts && g.ts <= T.ts + T.dur && (g.name === "MajorGC" || g.name === "MinorGC")).reduce((s, g) => s + tr.td(g), 0);
  const long = tr.tasks.filter(T => tr.td(T) >= LONG_MS && tr.work(T) - gcOf(T) >= LONG_MS), gc = tr.tasks.filter(T => gcOf(T) >= LONG_MS);
  const slowed = tr.tasks.filter(T => tr.td(T) >= LONG_MS && tr.work(T) < LONG_MS && gcOf(T) < LONG_MS).length;
  ok(long.length === 0, `${label}: no task of ${LONG_MS} ms or more while playing: ${long.map(T => (tr.work(T) - gcOf(T)).toFixed(0) + " ms (" + tr.what(T) + ")").slice(0, 4).join("; ") || "none"}${gc.length ? "; garbage collection " + gc.map(T => gcOf(T).toFixed(0) + " ms").join(", ") : ""}${slowed ? "; " + slowed + " stretch(es) with no work named, the computer itself" : ""}`);
  /* the voices: bounded while playing, gone once they have rung out */
  await p.waitForTimeout(6000);
  const after = Math.max(0, (await f.evaluate("__P.live")) - base); peak -= base;
  ok(peak <= VOICES && after <= 2, `${label}: the voices stay bounded (at most ${peak} at once, ${VOICES} allowed) and let go (${after} still alive 6 s after the last note)`);
  const mid = P.ev.concat(PT.ev || []).filter(e => spans.some(s => e.t >= s.S0 + 50 && e.t <= s.S1));
  ok(mid.length === 0, `${label}: nothing fetched or unpacked mid-play: ${mid.map(e => e.k + " " + (e.u || "").split("/").slice(-2).join("/") + " " + Math.round(e.t - spans.find(s => e.t >= s.S0 && e.t <= s.S1).S0) + " ms in").slice(0, 5).join(", ") || "none"}`);
  ok(errs.length === 0, `${label}: no page errors ${errs.slice(0, 3).join(" | ")}`);
  const res = { c, p, f, cdp, rows, worst, p95, long: long.map(T => tr.work(T)) };
  if (!opts.keep) await c.close();
  return res;
}
module.exports = { pw, ok, play, serve, ROOMS, phrase, readTrace, fails: () => fails, PROBE };
if (require.main === module) (async () => {
  const port = +process.env.STEADY_PORT || 9380, srv = serve(port), b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const list = process.argv.slice(2).length ? process.argv.slice(2) : ["piano", "guitar", "bass", "pads", "kit", "decks"];
  for (const id of list) { try { await play(b, port, id); } catch (e) { ok(false, id + ": " + e.message.split("\n")[0]); } }
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
