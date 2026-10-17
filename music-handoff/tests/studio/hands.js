/* AOG-DESK-HANDS-V1 — Jimmy ("4 · Hands on the desk"): "Drag clips along the timeline, zoom in, nudge off the beat, add
   Redo, a volume knob for each clip, and crossfades between pieces. Today clips move only with buttons and menus."
   A four-bar take at 100 beats a minute (a beat is 0.6 s), one steady note a bar with no gaps, goes on track 1. Then:
   · drag (real mouse events): with Snap to the beat on the piece lands on a beat; off, just where it is let go, and the
     mix starts it there to the millisecond; a drag is one Undo; a finger drag on an iPad (real touch events) moves it too;
   · zoom: Zoom in / out and + / − make the lanes wider and they scroll inside their window, never the page; the
     playhead stays in sight while the song plays; no smooth scrolling;
   · nudge: 10 ms earlier / later (buttons, , and ., Alt + arrows, Shift a beat); a run of nudges is one Undo; the old keys
     still work;
   · Undo and Redo, a round trip over three changes (buttons, Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y); a new change clears Redo;
   · a piece's volume (−24 to +12 dB): heard in the mix and in the track's own file at its level;
   · crossfades: where two pieces meet, Off leaves a dip; a crossfade leaves none and no click (the same sound carried on,
     and two different notes); the speakers' plan (played from just before the seam) sounds the same as the mix;
   · a reload keeps the positions, the volumes, the crossfade, the zoom and the snap; Spanish; an iPhone and an iPad,
     light and dark: readable, calm, nothing sideways. No page errors. Port 9265. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9265, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
async function routes(ctx) { await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort()); }

/* a take of four bars at 100 beats a minute (a bar is 2.4 s), 0.05 s of quiet first as a take has; each bar one steady
   note, the notes joined with no gap (the phase carries on, so the take itself never clicks) */
const TAKE = `(async (n, freqs) => { const sr = 44100, head = 0.05, bar = 2.4, sec = head + bar * freqs.length, len = Math.round(sec * sr);
  const ab = new ArrayBuffer(44 + len * 4), v = new DataView(ab), s = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  s(0, "RIFF"); v.setUint32(4, 36 + len * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, len * 4, true);
  let ph = 0;
  for (let i = 0; i < len; i++) { const t = i / sr - head; let x = 0;
    if (t >= 0) { const k = Math.min(freqs.length - 1, Math.floor(t / bar)), env = Math.min(1, t / 0.01, Math.max(0, (sec - head - t) / 0.01)); ph += 2 * Math.PI * freqs[k] / sr; x = Math.round(9000 * env * Math.sin(ph)); }
    v.setInt16(44 + i * 4, x, true); v.setInt16(46 + i * 4, x, true); }
  await AOGHandoff.add(AOGHandoff.INBOX, { from: "guitar", n, name: { en: "Guitar take " + n, es: "Toma de guitarra " + n }, sec, bpm: 100, at: Date.now() + n, take: true,
    wav: new Blob([ab], { type: "audio/wav" }) }, { key: "hands|" + n });
})`;
const NOTES = [220, 330, 440, 550], STEADY = [330, 330, 330, 330];
async function put(p, take, track) {
  await p.selectOption("#trackSel", String(track));
  const v = await p.evaluate(nm => [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === nm).value, take);
  await p.selectOption("#srcSel", v); await p.click("#putBtn");
  await p.waitForFunction(t => __aogStudio.SONG.tracks[t].clip && !__aogStudio.S.busy, track, { timeout: 15000 });
}
const P0 = (p, tr = 0) => p.evaluate(tr => __aogStudio.pcs(__aogStudio.SONG.tracks[tr].clip).map(q => ({ a: q.a, b: q.b, at: q.at, n: q.n, g: q.g || 0 })), tr);
const act = async (p, a) => { await p.click(`#clipBox [data-act="${a}"]`); await p.waitForTimeout(60); };
/* where piece j of track 1 is on the song, and how many pixels a beat is there */
const clipBox = (p, j = 0) => p.evaluate(j => { const el = document.querySelector(`#timeline .st-lane[data-sel="0"] .st-clip[data-pc="${j}"]`); el.scrollIntoView({ block: "center", inline: "nearest" });
  const r = el.getBoundingClientRect(), lt = el.parentNode.getBoundingClientRect(), tl = document.getElementById("timeline").getBoundingClientRect(), lab = document.querySelector("#timeline .st-ln").getBoundingClientRect().width;
  /* the part of the piece in view (zoomed in, its start may be under the names or past the right edge) */
  const l = Math.max(r.left, tl.left + lab + 2), z = Math.min(r.right, tl.right - 2);
  return { x: l + Math.min((z - l) / 2, 40), y: r.top + r.height / 2, perBeat: lt.width / (__aogStudio.tlBars() * 4) }; }, j);
async function mouseDrag(p, j, dx) {
  const a = await clipBox(p, j);
  await p.mouse.move(a.x, a.y); await p.mouse.down();
  for (let k = 1; k <= 10; k++) await p.mouse.move(a.x + dx * k / 10, a.y + (k % 2));
  await p.mouse.up(); await p.waitForTimeout(200); return a;
}
/* the song through the whole desk (as Make the mix does), then: the first sound, the level of each bar, and around a
   point: the smallest and largest loudness in 4 ms steps, and the biggest jump from one sample to the next */
const RENDER = `(async (o) => { const st = __aogStudio, r = await st.renderSong(o.only == null ? null : o.only), d = r.Lc, sr = 44100, bar = st.barSec();
  const db = (a, z) => { let s = 0, n = 0; for (let i = Math.max(0, Math.floor(a * sr)); i < Math.min(d.length, Math.floor(z * sr)); i++) { s += d[i] * d[i]; n++; } return n ? 10 * Math.log10(s / n + 1e-12) : -120; };
  let first = -1; for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > 0.003) { first = i / sr; break; }
  const bars = []; for (let k = 0; k < (o.bars || 4); k++) bars.push(+db((k + 0.3) * bar, (k + 0.7) * bar).toFixed(2));
  let seam = null;
  if (o.at != null) { const w = o.win || 0.006, lv = []; for (let t = o.at - 0.06; t <= o.at + 0.06; t += 0.002) lv.push(db(t - w / 2, t + w / 2));
    let jump = 0, ref = 0; const a = Math.floor((o.at - 0.06) * sr), z = Math.floor((o.at + 0.06) * sr);
    for (let i = a + 1; i < z; i++) jump = Math.max(jump, Math.abs(d[i] - d[i - 1]));
    for (const c of [o.at - 0.4, o.at + 0.4]) { const a2 = Math.floor((c - 0.05) * sr); for (let i = a2 + 1; i < a2 + 0.1 * sr; i++) ref = Math.max(ref, Math.abs(d[i] - d[i - 1])); }
    const steady = Math.min(db(o.at - 0.5, o.at - 0.2), db(o.at + 0.2, o.at + 0.5));
    seam = { min: +(Math.min(...lv) - steady).toFixed(2), max: +(Math.max(...lv) - steady).toFixed(2), jump: +(jump / ref).toFixed(2) }; }
  return { first: first, bars: bars, seam: seam };
})`;
const render = (p, o) => p.evaluate(`${RENDER}(${JSON.stringify(o || {})})`);

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage();
  await p.goto(U + "music-studio.html"); await p.waitForTimeout(700);
  await p.evaluate(`(async()=>{ const add=${TAKE}; await add(1, ${JSON.stringify(NOTES)}); await add(2, ${JSON.stringify(STEADY)}); })()`);
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 2, null, { timeout: 8000 });
  await put(p, "Guitar take 1", 0);

  /* 0 · the row under the lanes */
  const row = await p.evaluate(() => ({ t: document.getElementById("tlTools").innerText.replace(/\s+/g, " ").trim(), snap: document.getElementById("snapBtn").getAttribute("aria-pressed"),
    zin: document.getElementById("zoomIn").getAttribute("aria-label"), zout: document.getElementById("zoomOut").getAttribute("aria-label"), out: document.getElementById("zoomOut").disabled,
    redo: document.querySelector('#clipBox [data-act="redo"]').disabled, keys: document.querySelector(".st-keys").textContent }));
  ok(row.t === "ZOOM − 1× + Snap to the beat: On ↶ Undo ↷ Redo" && row.snap === "true" && row.zin === "Zoom in" && row.zout === "Zoom out" && row.out && row.redo
    && /Ctrl\/⌘ ZUndo \(with Shift, redo\)$/.test(row.keys) && /Nudge the piece 10 ms/.test(row.keys)   /* AOG-DESK-KEYS-V2: the Keys list */, "under the lanes: zoom, snap, undo and redo: " + JSON.stringify(row));

  /* 1 · drag with Snap to the beat on: 1.3 beats to the right lands on beat 2 of bar 1 */
  let a = await clipBox(p);
  await mouseDrag(p, 0, 1.3 * a.perBeat);
  let P = await P0(p), line = await p.evaluate(() => document.getElementById("tlLine").textContent);
  ok(P.length === 1 && P[0].at === 1 && line === "Piece 1 now starts at Bar 1 · beat 2." && await p.evaluate(() => __aogStudio.UNDO.length === 1),
    `drag 1.3 beats with Snap on: it lands on a beat (at ${P[0].at}) · "${line}" · one Undo step`);
  let r = await render(p);
  ok(Math.abs(r.first - 0.6) < 0.003, "the mix starts it on that beat: first sound at " + r.first.toFixed(4) + " s (want 0.6)");
  await p.click("#tlUndo"); await p.waitForTimeout(100);
  ok((await P0(p))[0].at === 0 && await p.evaluate(() => !document.getElementById("tlRedo").disabled), "Undo under the lanes puts it back on bar 1, and Redo lights");
  /* 2 · Snap off: it lands just where it is let go */
  await p.click("#snapBtn"); await p.waitForTimeout(60);
  const so = await p.evaluate(() => ({ t: document.getElementById("snapBtn").textContent, pr: document.getElementById("snapBtn").getAttribute("aria-pressed"), line: document.getElementById("tlLine").textContent }));
  ok(so.t === "Snap to the beat: Off" && so.pr === "false" && so.line === "A piece you drag lands just where you let go.", "Snap to the beat: Off " + JSON.stringify(so));
  a = await clipBox(p);
  await mouseDrag(p, 0, 2.37 * a.perBeat);
  P = await P0(p);
  const want = 2.37;
  ok(Math.abs(P[0].at - want) < 1.2 / a.perBeat && Math.abs(P[0].at - Math.round(P[0].at)) > 0.05 && !(await p.evaluate(() => document.getElementById("tlRedo").disabled === false)),
    `drag 2.37 beats with Snap off: at ${P[0].at.toFixed(4)} beats (off the beat; a pixel is ${(1 / a.perBeat).toFixed(4)} beats); a new change clears Redo`);
  r = await render(p);
  ok(Math.abs(r.first - P[0].at * 0.6) < 0.002, `the mix starts it there to the millisecond: ${r.first.toFixed(4)} s (want ${(P[0].at * 0.6).toFixed(4)})`);
  const atOpt = await p.evaluate(() => document.querySelector("#atSel option:checked").textContent);
  ok(/^Bar 1 · beat 3, \d+ ms (late|early)$/.test(atOpt), "Starts at bar says it to the millisecond: " + atOpt);
  const offAt = P[0].at;

  /* 3 · nudge: buttons, then , and . (a run is one Undo), Alt + arrows, Shift a beat; the old keys still work */
  await act(p, "nudge+");
  P = await P0(p);
  ok(Math.abs(P[0].at - (offAt + 0.01 / 0.6)) < 1e-4, `10 ms later: ${offAt.toFixed(5)} → ${P[0].at.toFixed(5)} beats`);
  await act(p, "nudge-");
  ok(Math.abs((await P0(p))[0].at - offAt) < 1e-4, "10 ms earlier: back where it was");
  await p.waitForTimeout(1700);   /* a new run of nudges (the buttons' run was more than 1.5 s ago) */
  const u0 = await p.evaluate(() => __aogStudio.UNDO.length);
  await p.mouse.click(4, 300);
  for (const k of ["Period", "Period", "Period", "Comma"]) { await p.keyboard.press(k); await p.waitForTimeout(40); }
  P = await P0(p);
  const u1 = await p.evaluate(() => __aogStudio.UNDO.length);
  ok(Math.abs(P[0].at - (offAt + 0.02 / 0.6)) < 1e-4 && u1 === u0 + 1, `. . . , moves it 20 ms later, as one Undo step (${u0} → ${u1})`);
  await p.keyboard.press("Alt+ArrowRight"); await p.keyboard.press("Shift+Comma"); await p.waitForTimeout(60);
  P = await P0(p);
  ok(Math.abs(P[0].at - (offAt + 0.03 / 0.6 - 1)) < 1e-4, `Alt+→ 10 ms later, Shift+, a beat earlier: at ${P[0].at.toFixed(5)}`);
  await p.keyboard.press("Control+z"); await p.waitForTimeout(100);
  ok(Math.abs((await P0(p))[0].at - offAt) < 1e-4, "one Ctrl+Z takes the whole run of nudges back");
  await p.keyboard.press("Control+Shift+z"); await p.waitForTimeout(100);
  ok(Math.abs((await P0(p))[0].at - (offAt + 0.03 / 0.6 - 1)) < 1e-4, "Ctrl+Shift+Z does it again");
  await p.keyboard.press("Control+z"); await p.waitForTimeout(100);
  await p.keyboard.press("Control+y"); await p.waitForTimeout(100);
  ok(Math.abs((await P0(p))[0].at - (offAt + 0.03 / 0.6 - 1)) < 1e-4, "Ctrl+Z, then Ctrl+Y does it again too");
  const v0 = await p.evaluate(() => __aogStudio.SONG.tracks[0].vol);
  await p.keyboard.press("ArrowUp"); await p.keyboard.press("KeyM"); await p.waitForTimeout(100);
  ok(await p.evaluate(v => __aogStudio.SONG.tracks[0].vol === v + 4 && __aogStudio.SONG.tracks[0].mute, v0), "the desk's own keys still work: ↑ moves the fader, M mutes");
  await p.keyboard.press("KeyM");
  /* back to bar 1, Snap on again */
  await p.selectOption("#atSel", "0"); await p.click("#snapBtn"); await p.waitForTimeout(60);

  /* 4 · Undo and Redo, a round trip over three changes */
  const j0 = await p.evaluate(() => JSON.stringify(__aogStudio.pcs(__aogStudio.SONG.tracks[0].clip)));
  await p.selectOption("#cutSel", "8"); await act(p, "cut");      /* cut at bar 3 */
  await act(p, "start+");                                          /* piece 2 a bar later */
  await p.evaluate(() => { const r = document.getElementById("pvR"); r.value = "-6"; r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true })); });
  await p.waitForTimeout(60);
  const j3 = await p.evaluate(() => JSON.stringify(__aogStudio.pcs(__aogStudio.SONG.tracks[0].clip)));
  for (let k = 0; k < 3; k++) await act(p, "undo");
  const jU = await p.evaluate(() => JSON.stringify(__aogStudio.pcs(__aogStudio.SONG.tracks[0].clip)));
  for (let k = 0; k < 3; k++) await act(p, "redo");
  const jR = await p.evaluate(() => JSON.stringify(__aogStudio.pcs(__aogStudio.SONG.tracks[0].clip)));
  const rl = await p.evaluate(() => ({ line: document.getElementById("editLine").textContent, redo: document.querySelector('#clipBox [data-act="redo"]').disabled }));
  ok(jU === j0 && jR === j3 && j3 !== j0 && rl.line === "Done again." && rl.redo, "Undo three times, then Redo three times: " + j3 + " · " + JSON.stringify(rl));

  /* 5 · a piece's volume: piece 2 (bars 4 and 5) at −6 dB, then −24 and +6; the mix and the track's own file follow */
  const pv = await p.evaluate(() => ({ out: document.getElementById("pvOut").textContent, vt: document.getElementById("pvR").getAttribute("aria-valuetext"), lab: document.querySelector('label[for="pvR"]').textContent,
    aria: document.getElementById("pvR").getAttribute("aria-label"), min: document.getElementById("pvR").min, max: document.getElementById("pvR").max }));
  ok(pv.out === "−6 dB" && pv.vt === "−6 dB" && pv.lab === "Volume of this piece" && pv.aria === "Volume of piece 2" && pv.min === "-24" && pv.max === "12", "the piece's volume slider: " + JSON.stringify(pv));
  const setV = async v => { await p.evaluate(v => { const r = document.getElementById("pvR"); r.value = String(v); r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true })); }, v); await p.waitForTimeout(60); };
  await setV(0); r = await render(p, { bars: 5 });
  const base = r.bars;
  await setV(-6); r = await render(p, { bars: 5 });
  const d6 = r.bars.map((x, i) => +(x - base[i]).toFixed(2));
  await setV(-24); r = await render(p, { bars: 5 });
  const d24 = r.bars.map((x, i) => +(x - base[i]).toFixed(2));
  await setV(6); r = await render(p, { bars: 5 });
  const dp6 = r.bars.map((x, i) => +(x - base[i]).toFixed(2));
  const rs = await render(p, { bars: 5, only: 0 });
  const ds = rs.bars.map((x, i) => +(x - base[i]).toFixed(2));
  const nearDb = (x, w, tol) => Math.abs(x - w) <= tol;
  ok(nearDb(d6[0], 0, 0.3) && nearDb(d6[1], 0, 0.3) && base[2] < -60 && nearDb(d6[3], -6, 1) && nearDb(d6[4], -6, 1), "−6 dB on piece 2: bars 1–2 the same, bar 3 quiet, bars 4–5 about 6 dB down: " + d6.join(" "));
  ok(nearDb(d24[3], -24, 2) && nearDb(d24[4], -24, 2) && nearDb(d24[0], 0, 0.3), "−24 dB: " + d24.join(" "));
  ok(dp6[3] > 3 && dp6[4] > 3 && nearDb(dp6[0], 0, 0.5), "+6 dB (the desk's glue and ceiling hold the top): " + dp6.join(" "));
  ok(nearDb(ds[3] - ds[0], dp6[3] - dp6[0], 1), "the track's own file (a stem) carries it too: " + ds.join(" "));
  await setV(-6);

  /* 6 · crossfades. The same sound carried on: take 2 (one steady note) cut at bar 3, the pieces still touching */
  await put(p, "Guitar take 2", 1);
  await p.evaluate(() => { __aogStudio.SONG.tracks[0].mute = true; });
  await p.selectOption("#cutSel", "8"); await act(p, "cut");
  const xf0 = await p.evaluate(() => ({ opts: [...document.querySelectorAll("#xfSel option")].map(o => o.textContent).join(" | "), lab: document.getElementById("xfSel").closest("label").querySelector(".st-lab").textContent, v: document.getElementById("xfSel").value }));
  ok(xf0.opts === "Off | 10 ms | 50 ms | 1 beat | 1 bar" && xf0.lab === "Crossfade where pieces meet" && xf0.v === "off", "the crossfade menu: " + JSON.stringify(xf0));
  const solo = async on => p.evaluate(on => { const x = __aogStudio.SONG.tracks; x[0].mute = on; x[1].mute = false; }, on);
  await solo(true);
  r = await render(p, { at: 4.8 });
  const offSeam = r.seam;
  await p.selectOption("#xfSel", "10ms"); await p.waitForTimeout(60);
  await solo(true);
  r = await render(p, { at: 4.8 });
  ok(offSeam.min < -3 && r.seam.min > -0.5 && r.seam.max < 0.5 && r.seam.jump < 1.3,
    `a cut put back together: Off dips ${offSeam.min} dB at the seam; 10 ms leaves it even (${r.seam.min} to ${r.seam.max} dB) with no click (largest step ${r.seam.jump}× the note's own)`);
  /* two different notes: take 1 again on track 3, bar 1 (220 Hz) then bars 3–4 (440, 550) moved up to bar 2 */
  await put(p, "Guitar take 1", 2);
  await p.selectOption("#cutSel", "4"); await act(p, "cut");
  await p.selectOption("#pieceSel", "1"); await p.selectOption("#cutSel", "8"); await act(p, "cut");
  await p.selectOption("#pieceSel", "1"); await act(p, "drop");
  await p.selectOption("#pieceSel", "1"); await p.selectOption("#atSel", "4");
  P = await P0(p, 2);
  ok(P.map(q => [q.a, q.b, q.at].join()).join(" / ") === "0,4,0 / 8,16,4", "bar 1 then bars 3–4 right after it: " + P.map(q => [q.a, q.b, q.at].join()).join(" / "));
  const mute = () => p.evaluate(() => { const x = __aogStudio.SONG.tracks; x[0].mute = true; x[1].mute = true; x[2].mute = false; });
  await mute(); r = await render(p, { at: 2.4, win: 0.01 });
  const offTwo = r.seam;
  await p.selectOption("#xfSel", "50ms"); await p.waitForTimeout(60);
  await mute(); r = await render(p, { at: 2.4, win: 0.01 });
  const onTwo = r.seam;
  ok(offTwo.min < -3 && onTwo.min > -2 && onTwo.max < 2 && onTwo.jump < 1.3,
    `220 Hz into 440 Hz: Off dips ${offTwo.min} dB; a 50 ms equal-power crossfade stays within ${onTwo.min} to ${onTwo.max} dB, no click (${onTwo.jump}×)`);
  const plan = await p.evaluate(() => { const st = __aogStudio, c = st.SONG.tracks[2].clip, L = st.piecePlays(c, st.playBuf(c)); return L.map(q => [q.inW ? [q.inW.w0, q.inW.w1].map(v => v.toFixed(3)).join("-") : "", q.outW ? [q.outW.w0, q.outW.w1].map(v => v.toFixed(3)).join("-") + (q.outW.lin ? " straight" : " equal-power") : ""].join("|")); });
  ok(plan.join(" / ") === "|2.375-2.425 equal-power / 2.375-2.425|", "the plan: one 50 ms window centred on the seam at 2.4 s: " + plan.join(" / "));
  /* the speakers play the same plan: from just before the seam, through the same chain, it sounds as the mix does */
  const same = await p.evaluate(async () => {
    const st = __aogStudio, sr = 44100, end = 4, out = [];
    for (const from of [0, 2.0]) {
      const oc = new OfflineAudioContext(2, Math.ceil((end - from) * sr), sr), E = st.makeEngine(oc, false);
      st.schedule(E, from, end, 0); const buf = await oc.startRendering(); out.push({ from, d: buf.getChannelData(0) });
    }
    const lv = (o, t) => { const a = Math.floor((t - o.from) * sr), n = Math.floor(0.004 * sr); let s = 0; for (let i = a; i < a + n; i++) s += o.d[i] * o.d[i]; return 10 * Math.log10(s / n + 1e-12); };
    let worst = 0; for (let t = 2.3; t < 2.5; t += 0.004) worst = Math.max(worst, Math.abs(lv(out[0], t) - lv(out[1], t)));
    return +worst.toFixed(3);
  });
  ok(same < 0.5, "played from just before the seam (as ▶ Play does) the crossfade sounds as it does in the mix: within " + same + " dB in 4 ms steps");

  /* 7 · zoom: the lanes grow, scroll inside their window, never the page; the playhead stays in sight while playing */
  await p.evaluate(() => { const x = __aogStudio.SONG.tracks; x[0].mute = false; x[1].mute = false; x[2].mute = false; });
  const z1 = await p.evaluate(() => { const tl = document.getElementById("timeline"); return { lane: tl.querySelector(".st-lane").getBoundingClientRect().width, cw: tl.clientWidth, sw: tl.scrollWidth }; });
  await p.click("#zoomIn"); await p.click("#zoomIn"); await p.waitForTimeout(100);
  const z4 = await p.evaluate(() => { const tl = document.getElementById("timeline"), lab = tl.querySelector(".st-ln").getBoundingClientRect().width;
    tl.scrollLeft = 400; return { z: __aogStudio.VIEW.zoom, out: document.getElementById("zoomOutV").textContent, lane: tl.querySelector(".st-lane").getBoundingClientRect().width, lab, cw: tl.clientWidth, sw: tl.scrollWidth,
      sl: tl.scrollLeft, page: document.scrollingElement.scrollWidth - innerWidth, sx: scrollX, ob: getComputedStyle(tl).overscrollBehaviorX, sb: getComputedStyle(tl).scrollBehavior,
      sticky: Math.round(tl.querySelector(".st-ln").getBoundingClientRect().left - tl.getBoundingClientRect().left) }; });
  ok(z4.z === 4 && z4.out === "4×" && Math.abs(z4.lane - (z4.lab + 4 * (z1.lane - z4.lab))) < 3 && z4.sw > z4.cw * 3 && z4.sl === 400 && z4.page <= 0 && z4.sx === 0 && z4.ob === "contain" && z4.sb === "auto" && z4.sticky <= 1,
    `Zoom in twice: 4×, the lanes ${Math.round(z1.lane)} → ${Math.round(z4.lane)} px, scrolled 400 px inside their window, the names stay at the left, the page does not move sideways ` + JSON.stringify(z4));
  await p.mouse.click(4, 300);
  await p.keyboard.press("Minus"); await p.waitForTimeout(60);
  const zk = await p.evaluate(() => __aogStudio.VIEW.zoom);
  await p.keyboard.press("Equal"); await p.keyboard.press("NumpadAdd"); await p.waitForTimeout(60);
  ok(zk === 2 && await p.evaluate(() => __aogStudio.VIEW.zoom) === 8, "− zooms out (2×), = and + zoom in (8×)");
  await p.click("#zoomIn"); await p.waitForTimeout(60);
  ok(await p.evaluate(() => __aogStudio.VIEW.zoom === 16 && document.getElementById("zoomIn").disabled), "16× is as far as it goes: Zoom in rests");
  await p.selectOption("#trackSel", "0");
  await p.evaluate(() => { document.getElementById("timeline").scrollLeft = 0; const s = document.getElementById("startSel"); s.value = "3"; s.dispatchEvent(new Event("change", { bubbles: true })); });
  await p.evaluate(() => __aogStudio.play()); await p.waitForTimeout(900);
  const ph = await p.evaluate(() => { const tl = document.getElementById("timeline"), r = tl.getBoundingClientRect(), x = tl.querySelector(".st-ph").getBoundingClientRect().left, lab = tl.querySelector(".st-ln").getBoundingClientRect().width;
    return { x: Math.round(x - r.left), lab: Math.round(lab), w: Math.round(r.width), sl: tl.scrollLeft, on: __aogStudio.PLAY.on }; });
  await p.evaluate(() => __aogStudio.stop());
  ok(ph.on && ph.sl > 0 && ph.x >= ph.lab && ph.x <= ph.w, "playing from bar 3 at 16×, the lanes turned to keep the playhead in sight: " + JSON.stringify(ph));
  await p.evaluate(() => { const s = document.getElementById("startSel"); s.value = "1"; s.dispatchEvent(new Event("change", { bubbles: true })); });

  /* 8 · a reload keeps it all */
  await p.selectOption("#trackSel", "0"); await p.selectOption("#pieceSel", "1");
  await p.click("#snapBtn"); await p.waitForTimeout(60);
  a = await clipBox(p, 1);
  await mouseDrag(p, 1, 0.43 * a.perBeat);
  const before = await p.evaluate(() => ({ P: __aogStudio.pcs(__aogStudio.SONG.tracks[0].clip).map(q => [q.a, q.b, q.at, q.g || 0].join()), xf: __aogStudio.SONG.tracks[2].clip.xf, xf2: __aogStudio.SONG.tracks[1].clip.xf, z: __aogStudio.VIEW.zoom, snap: __aogStudio.VIEW.snap }));
  await p.reload();
  await p.waitForFunction(() => window.__aogStudio && __aogStudio.BUF.size >= 3 && !__aogStudio.S.decoding, null, { timeout: 30000 });
  await p.waitForTimeout(300);
  const after = await p.evaluate(() => ({ P: __aogStudio.pcs(__aogStudio.SONG.tracks[0].clip).map(q => [q.a, q.b, q.at, q.g || 0].join()), xf: __aogStudio.SONG.tracks[2].clip.xf, xf2: __aogStudio.SONG.tracks[1].clip.xf, z: __aogStudio.VIEW.zoom, snap: __aogStudio.VIEW.snap }));
  const frac = +before.P[1].split(",")[2];
  ok(JSON.stringify(after) === JSON.stringify(before) && Math.abs(frac - Math.round(frac)) > 0.05 && before.xf === "50ms" && before.xf2 === "10ms" && before.z === 16 && before.snap === false && /,-6$/.test(before.P[1]),
    "after a reload: the same places (off the beat too), volumes, crossfades, zoom and snap " + JSON.stringify(after));
  const fileBack = await p.evaluate(async () => { const st = __aogStudio, f = await st.songFile(), r = await st.readSongFile(f); return r && r.song ? Object.assign({}, r.song.tracks[0].clip, { xf: r.song.tracks[2].clip && r.song.tracks[2].clip.xf }) : null; }).catch(e => "x " + e.message);
  ok(fileBack && typeof fileBack === "object" && fileBack.xf === "50ms" && fileBack.pieces && Math.abs(fileBack.pieces[1].at - frac) < 1e-9 && fileBack.pieces[1].g === -6,
    "a song file carries them too: " + JSON.stringify(fileBack && fileBack.pieces));

  /* 9 · Spanish */
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(150);
  await p.selectOption("#trackSel", "0");
  const es = await p.evaluate(() => ({ t: document.getElementById("tlTools").innerText.replace(/\s+/g, " ").trim(), zin: document.getElementById("zoomIn").getAttribute("aria-label"), zout: document.getElementById("zoomOut").getAttribute("aria-label"),
    undo: document.getElementById("tlUndo").getAttribute("aria-label"), b: [...document.querySelectorAll("#clipBox [data-act]")].map(x => x.textContent).join(" | "), lab: document.querySelector('label[for="pvR"]').textContent,
    xf: document.getElementById("xfSel").closest("label").querySelector(".st-lab").textContent, xo: [...document.querySelectorAll("#xfSel option")].map(o => o.textContent).join(" | "),
    at: document.querySelector("#atSel option:checked").textContent, keys: document.querySelector(".st-keys").textContent }));
  ok(es.t === "ZOOM − 16× + Ajustar al pulso: No ↶ Deshacer ↷ Rehacer" && es.zin === "Acercar" && es.zout === "Alejar" && es.undo === "Deshacer el último cambio" && /10 ms antes \| 10 ms después/.test(es.b) && /↷ Rehacer/.test(es.b)
    && es.lab === "Volumen de esta parte" && es.xf === "Fundido donde se juntan las partes" && es.xo === "No | 10 ms | 50 ms | 1 pulso | 1 compás" && /^Compás \d+ · pulso \d, \d+ ms (tarde|antes)$|^Compás \d+, \d+ ms (tarde|antes)$/.test(es.at)
    && /Mover la parte 10 ms/.test(es.keys), "Spanish: " + JSON.stringify(es));
  await p.click("#snapBtn"); await p.waitForTimeout(60);
  ok(await p.textContent("#snapBtn") === "Ajustar al pulso: Sí" && await p.textContent("#tlLine") === "Una parte que arrastras cae en un pulso.", "Spanish, Snap on: " + await p.textContent("#snapBtn"));
  await p.evaluate(() => document.getElementById("langBtn").click());
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();

  /* 10 · an iPad: a finger drags a piece (real touch events); an iPhone and an iPad, light and dark, zoomed in: readable,
     calm, nothing sideways, every new button big enough for a finger */
  for (const [dev, theme] of [["iPad (gen 7)", "light"], ["iPad (gen 7)", "dark"], ["iPhone 13", "light"], ["iPhone 13", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(700);
    await m.evaluate(`(async()=>{ const add=${TAKE}; await add(1, ${JSON.stringify(NOTES)}); })()`);
    await m.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
    await m.click("#putBtn"); await m.waitForFunction(() => __aogStudio.SONG.tracks[0].clip && !__aogStudio.S.busy, null, { timeout: 15000 });
    await m.evaluate(() => __aogStudio.clipAct("cut"));
    if (dev.startsWith("iPad") && theme === "light") {
      const s = await m.context().newCDPSession(m);
      await clipBox(m, 0); await m.waitForTimeout(500);   /* the page settles once it has scrolled */
      const q = await clipBox(m, 0), dx = 2 * q.perBeat;
      const hit = await m.evaluate(q => { const e = document.elementFromPoint(q.x, q.y); const cr = document.querySelector("#timeline .st-lane[data-sel=\"0\"] .st-clip[data-pc=\"0\"]").getBoundingClientRect(); return (e && (e.className.baseVal != null ? "svg" : e.className)) + " " + Math.round(q.x) + "," + Math.round(q.y) + " sy" + scrollY + " clip " + [cr.left, cr.top, cr.width, cr.height].map(Math.round); }, q);
      await s.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: q.x, y: q.y }] });
      for (let k = 1; k <= 10; k++) { await s.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: q.x + dx * k / 10, y: q.y }] }); await m.waitForTimeout(16); }
      await s.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await m.waitForTimeout(300);
      const tp = await m.evaluate(() => ({ at: __aogStudio.pcs(__aogStudio.SONG.tracks[0].clip)[0].at, sy: scrollX, line: document.getElementById("tlLine").textContent }));
      ok(tp.at === 2 && tp.sy === 0 && tp.line === "Piece 1 now starts at Bar 1 · beat 3.", "iPad: a finger drags piece 1 two beats along its lane: " + JSON.stringify(tp) + " " + hit);
    }
    await m.evaluate(() => __aogStudio.zoomTo(4)); await m.waitForTimeout(100);
    await m.evaluate(() => { document.getElementById("timeline").scrollLeft = 250; document.getElementById("timeline").scrollIntoView({ block: "center" }); });
    await m.waitForTimeout(150);
    const f = await m.evaluate(() => { const r = el => el.getBoundingClientRect(), btn = [...document.querySelectorAll("#tlTools button, #clipBox [data-act^=nudge], #clipBox [data-act=redo]")].filter(x => x.offsetParent);
      return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, sl: document.getElementById("timeline").scrollLeft, minH: Math.min(...btn.map(x => Math.round(r(x).height))), minW: Math.min(...btn.map(x => Math.round(r(x).width))), narrow: btn.filter(x => r(x).width < 44).map(x => (x.id || x.getAttribute("data-act")) + " " + JSON.stringify(x.textContent)).join(),
        right: Math.max(...[...document.querySelectorAll("#tlTools button")].map(x => Math.round(r(x).right))), pv: Math.round(r(document.getElementById("pvR")).height), xfFs: parseFloat(getComputedStyle(document.getElementById("xfSel")).fontSize) }; });
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    ok(f.sw <= f.iw && f.sl > 0 && f.minH >= 44 && f.minW >= 44 && f.right <= f.iw && f.pv >= 40 && f.xfFs >= 16 && !pc.length && !pk.length,
      `${dev}, ${theme}, zoomed in: it fits (${JSON.stringify(f)}), reads (${pc.length} unreadable ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await m.screenshot({ path: path.join(__dirname, "..", `studiohands-${dev.split(" ")[0].toLowerCase()}-${theme}.png`) });
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the iPad or the iPhone " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
