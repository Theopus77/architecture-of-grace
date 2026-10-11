/* AOG-DESK-AUTO-V1 — Jimmy's 8: "Draw changes over time (automation). Volume, pan, echo or filter changes drawn on the
   track, for fades, swells and a filter that opens into the chorus."
   A six-bar take at 100 beats a minute (a beat is 0.6 s), one steady 330 Hz note, goes on track 1; a take of steady
   noise on track 2. The desk's Glue is set to 0 so the whole chain is straight (a level drawn is a level heard). Then:
   · the menu (Draw changes on track 1: Off, Volume, Side (pan), Room, Echo, Filter) opens one lane under the track;
   · real mouse taps add points (Snap to the beat on: on a beat; off: just where the tap was), a drag moves one, a
     stroke draws several; each is one Undo; Ctrl+Z, Ctrl+Shift+Z and the buttons; Remove this point, Clear this lane;
     the keys move a picked point; the knob rests ("✎ Drawn") while its line has points;
   · the sound, in a bounce: the level follows the drawn volume within 0.5 dB at many points; Side moves the left and
     right as drawn (within 0.5 dB of the panner's own law); Room and Echo: what the send adds rises as drawn and, where
     the line is level, is what the knob at that value gives (within 1 dB); the Filter: no points is the same sound to
     the last bit (and the track does not pass through it); a drawn sweep cuts the highs and opens again (the spectral
     centroid follows it); clearing the lane gives the same sound to the last bit again;
   · the speakers (the live output, recorded sample by sample after the safety ceiling) match the bounce within 0.5 dB:
     started at bar 3, across a reschedule while it plays, looping (two passes), and after the line is changed while it
     plays; the sliders never move by themselves;
   · moving a piece leaves the line where it is; zoomed in, the points sit on the same bars as the lane above;
   · a reload keeps it; a song file (.aogsong) carries it to a fresh device (a second address) and it sounds the same;
   · Spanish; an iPad (a finger draws and drags, the level follows); an iPhone and an iPad, light and dark: readable,
     calm, nothing sideways. No page errors. Ports 9276 and 9277. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9276, PORT2 = 9277, U = "http://localhost:" + PORT + "/", U2 = "http://localhost:" + PORT2 + "/";
const srv = require("../srv.js")(PORT), srv2 = require("../srv.js")(PORT2);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
async function routes(ctx) { await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort()); }

/* a take made in the page: "tone" (one steady note) or "noise" (steady white noise from a fixed seed), o.bars bars long */
const TAKE = `(async (o) => { const sr = 44100, head = 0.05, sec = head + 2.4 * o.bars, len = Math.round(sec * sr);
  const ab = new ArrayBuffer(44 + len * 4), v = new DataView(ab), s = (q, t) => { for (let i = 0; i < t.length; i++) v.setUint8(q + i, t.charCodeAt(i)); };
  s(0, "RIFF"); v.setUint32(4, 36 + len * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, len * 4, true);
  let ph = 0, z = 0x2545f491;
  for (let i = 0; i < len; i++) { const t = i / sr - head; let x = 0;
    if (t >= 0) { const env = Math.min(1, t / 0.01, Math.max(0, (sec - head - t) / 0.01));
      if (o.kind === "noise") { z ^= z << 13; z ^= z >>> 17; z ^= z << 5; x = env * 7000 * (((z >>> 0) / 4294967296) * 2 - 1); }
      else { ph += 2 * Math.PI * 330 / sr; x = env * 9000 * Math.sin(ph); } }
    v.setInt16(44 + i * 4, Math.round(x), true); v.setInt16(46 + i * 4, Math.round(x), true); }
  await AOGHandoff.add(AOGHandoff.INBOX, { from: "guitar", n: o.n, name: { en: "Guitar take " + o.n, es: "Toma de guitarra " + o.n }, sec, bpm: 100, at: Date.now() + o.n, take: true,
    wav: new Blob([ab], { type: "audio/wav" }) }, { key: "auto|" + o.n });
})`;
const add = (p, o) => p.evaluate(`(${TAKE})(${JSON.stringify(o)})`);
async function put(p, take, track) {
  await p.selectOption("#trackSel", String(track));
  const v = await p.evaluate(nm => [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === nm).value, take);
  await p.selectOption("#srcSel", v); await p.click("#putBtn");
  await p.waitForFunction(t => __aogStudio.SONG.tracks[t].clip && !__aogStudio.S.busy, track, { timeout: 15000 });
}

/* in the page: bounces kept by name, levels, the panner's law, what a send adds, the spectral centroid, and a recorder
   on the speakers' output (after the safety ceiling), sample by sample with the context's own frame numbers */
const HELP = `window.__T = (() => {
  const st = __aogStudio, sr = 44100, T = { B: {} };
  T.render = async (name) => { const r = await st.renderSong(null); T.B[name || "cur"] = { L: Float32Array.from(r.Lc), R: Float32Array.from(r.Rc) }; return r.frames; };
  const rms = (d, a, z) => { let s = 0, n = 0; for (let i = Math.max(0, Math.round(a)); i < Math.min(d.length, Math.round(z)); i++) { s += d[i] * d[i]; n++; } return n ? s / n : 0; };
  const dB = x => 10 * Math.log10(x + 1e-20);
  T.db = (name, t, w) => { const b = T.B[name || "cur"]; return dB((rms(b.L, t * sr, (t + w) * sr) + rms(b.R, t * sr, (t + w) * sr)) / 2); };
  T.lr = (name, t, w) => { const b = T.B[name || "cur"]; return dB(rms(b.L, t * sr, (t + w) * sr)) - dB(rms(b.R, t * sr, (t + w) * sr)); };
  T.wet = (a, b, t, w) => { const A = T.B[a], Bb = T.B[b]; let s = 0, n = 0; for (let i = Math.round(t * sr); i < Math.round((t + w) * sr); i++) { const x = A.L[i] - Bb.L[i], y = A.R[i] - Bb.R[i]; s += x * x + y * y; n += 2; } return dB(s / n); };
  T.same = (a, b) => { const A = T.B[a], Bb = T.B[b]; if (A.L.length !== Bb.L.length) return { n: -1, len: [A.L.length, Bb.L.length] }; let n = 0, m = 0;
    for (let i = 0; i < A.L.length; i++) { const x = Math.abs(A.L[i] - Bb.L[i]), y = Math.abs(A.R[i] - Bb.R[i]); if (x || y) n++; if (x > m) m = x; if (y > m) m = y; } return { n, m }; };
  /* the level the drawn volume should give over a window, from the line itself: the mean of (v/80)^4 (power) */
  T.expVol = (L, t, w) => { const beat = 60 / st.songBpm(); let s = 0, n = 0; for (let u = 0; u < w; u += 0.001) { const x = st.drawnAt(L, (t + u) / beat) / 80, g = x * x; s += g * g; n++; } return dB(s / n); };
  T.panLaw = p => { const x = p <= 0 ? p + 1 : p, c = Math.cos(x * Math.PI / 2), s = Math.sin(x * Math.PI / 2); return p <= 0 ? 20 * Math.log10((1 + c) / Math.max(1e-9, s)) : 20 * Math.log10(c / (1 + s)); };
  T.cent = (name, t) => { const b = T.B[name || "cur"], N = 4096, re = new Float64Array(N), im = new Float64Array(N), a = Math.round(t * sr);
    for (let i = 0; i < N; i++) re[i] = (b.L[a + i] + b.R[a + i]) / 2 * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N));
    for (let i = 1, j = 0; i < N; i++) { let bit = N >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= N; len <<= 1) { const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < N; i += len) { let cr = 1, ci = 0; for (let j = 0; j < len / 2; j++) { const ur = re[i + j], ui = im[i + j], vr = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci, vi = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr;
        re[i + j] = ur + vr; im[i + j] = ui + vi; re[i + j + len / 2] = ur - vr; im[i + j + len / 2] = ui - vi; const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr; } } }
    let s = 0, m = 0; for (let k = 1; k < N / 2; k++) { const p = re[k] * re[k] + im[k] * im[k]; s += k * sr / N * p; m += p; } return s / m; };
  T.recOn = async () => { const c = st.live();
    if (!T.node) { const code = 'class R extends AudioWorkletProcessor{constructor(){super();this.b=[];this.n=0;this.f0=-1;}process(i){const x=i[0];if(x&&x.length){if(this.f0<0)this.f0=currentFrame;this.b.push(x[0].slice(),(x[1]||x[0]).slice());this.n+=x[0].length;if(this.n>=2048){this.port.postMessage({f:this.f0,b:this.b});this.b=[];this.n=0;this.f0=-1;}}return true;}}registerProcessor("aogautorec",R);';
      await c.audioWorklet.addModule(URL.createObjectURL(new Blob([code], { type: "text/javascript" })));
      T.node = new AudioWorkletNode(c, "aogautorec", { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1], channelCount: 2, channelCountMode: "explicit" });
      const z = c.createGain(); z.gain.value = 0; st.LIVE.out.connect(T.node); T.node.connect(z); z.connect(c.destination);
      T.node.port.onmessage = e => { if (T.rec) T.rec.push(e.data); }; }
    T.rec = []; T.lsr = c.sampleRate; };
  T.recOff = () => { const ch = T.rec; T.rec = null; const f0 = ch[0].f, last = ch[ch.length - 1], f1 = last.f + last.b.length / 2 * 128;
    const L = new Float32Array(f1 - f0), R = new Float32Array(f1 - f0);
    ch.forEach(c => { for (let k = 0; k < c.b.length / 2; k++) { const o = c.f - f0 + k * 128; L.set(c.b[2 * k], o); R.set(c.b[2 * k + 1], o); } });
    T.live = { f0, L, R }; return (f1 - f0) / T.lsr; };
  /* the speakers' level over a window that starts at context time ct */
  T.ldb = (ct, w) => { const r = T.live, a = ct * T.lsr - r.f0, z = (ct + w) * T.lsr - r.f0; return dB((rms(r.L, a, z) + rms(r.R, a, z)) / 2); };
  return T; })();`;
const W = 20 / 330;   /* a window of exactly twenty cycles of the note */

/* where a beat and a value are on a track's drawing lane, in the page's pixels */
const laneXY = (p, i, beat, v, noScroll) => p.evaluate(([i, beat, v, noScroll]) => { const st = __aogStudio, alt = document.querySelector(`#timeline [data-alt="${i}"]`);
  if (!noScroll) alt.scrollIntoView({ block: "center", inline: "nearest" });
  const r = alt.getBoundingClientRect(), A = st.AUTO[st.SONG.tracks[i].lane], Wd = st.tlBars() * 4;
  return { x: r.left + beat / Wd * r.width, y: r.top + (8 + 84 * (1 - (v - A.lo) / (A.hi - A.lo))) / 100 * r.height, perBeat: r.width / Wd, h: r.height }; }, [i, beat, v, !!noScroll]);
const line = (p, i, k) => p.evaluate(([i, k]) => { const L = __aogStudio.lineOf(i, k); return L ? L.map(q => q.slice()) : null; }, [i, k]);
const tap = async (p, i, beat, v) => { const a = await laneXY(p, i, beat, v); await p.mouse.click(a.x, a.y); await p.waitForTimeout(80); return a; };
async function dragFromTo(p, i, b0, v0, b1, v1, steps = 10) {
  const a = await laneXY(p, i, b0, v0), z = await laneXY(p, i, b1, v1, true);
  await p.mouse.move(a.x, a.y); await p.mouse.down();
  for (let k = 1; k <= steps; k++) await p.mouse.move(a.x + (z.x - a.x) * k / steps, a.y + (z.y - a.y) * k / steps);
  await p.mouse.up(); await p.waitForTimeout(120);
}
/* what an element shows: its words, with the site's pencil drawings (aog-sketch.js turns ✎ into <img alt="✎">) read as their mark */
const VIS = `(el => { const f = n => n.nodeType === 3 ? n.textContent : n.tagName === "IMG" ? (n.alt || "") : [...n.childNodes].map(f).join(""); return f(el).replace(/\\s+/g, " ").trim(); })`;
const undoN = p => p.evaluate(() => __aogStudio.UNDO.length);
const near = (a, b, tol) => Math.abs(a - b) <= tol;

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage();
  await p.goto(U + "music-studio.html"); await p.waitForTimeout(700);
  await add(p, { n: 1, kind: "tone", bars: 6 }); await add(p, { n: 2, kind: "noise", bars: 4 });
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 2, null, { timeout: 8000 });
  await put(p, "Guitar take 1", 0);
  await p.evaluate(() => { __aogStudio.SONG.master.glue = 0; });
  await p.evaluate(HELP);
  ok(await p.evaluate(() => __aogStudio.songBpm()) === 100, "the song is at 100 beats a minute (a beat is 0.6 s)");

  /* 0 · the menu, and the lane it opens */
  const m0 = await p.evaluate(() => ({ lab: document.querySelector("#autoTools .st-drw .st-lab").textContent, opts: [...document.querySelectorAll("#drawSel option")].map(o => o.textContent).join(" | "),
    v: document.getElementById("drawSel").value, lanes: document.querySelectorAll("#timeline .st-auto").length, fs: parseFloat(getComputedStyle(document.getElementById("drawSel")).fontSize),
    line: document.getElementById("autoLine").textContent, json: JSON.stringify(__aogStudio.SONG.tracks[0]) }));
  ok(m0.lab === "Draw changes on track 1" && m0.opts === "Off | Volume | Side (pan) | Room | Echo | Filter" && m0.v === "" && m0.lanes === 0 && m0.fs >= 16 && m0.line === "" && !/lines|lane/.test(m0.json),
    "under the lanes: Draw changes on track 1 (Off, Volume, Side (pan), Room, Echo, Filter), no lane open, nothing new in the song " + JSON.stringify(m0));
  await p.evaluate(() => __T.render("ref"));      /* the take at its knob (80: as recorded), no line */
  await p.selectOption("#drawSel", "vol"); await p.waitForTimeout(80);
  const m1 = await p.evaluate(() => { const row = document.querySelector('#timeline .st-auto[data-auto="0"]'), lane = document.querySelector('#timeline .st-lane[data-sel="0"]');
    return { row: !!row, after: row && row.previousElementSibling === lane, name: row && row.querySelector(".st-aln").textContent, aria: row && row.querySelector(".st-alt").getAttribute("aria-label"), dash: !!(row && row.querySelector(".ad")),
      hint: document.getElementById("autoLine").textContent, rule: document.getElementById("autoRule").textContent, btns: [...document.querySelectorAll("#autoTools button")].map(x => x.textContent + (x.disabled ? " (rests)" : "")).join(" | "),
      knob: document.getElementById("t0-vol").disabled, saved: JSON.parse(localStorage.getItem("aog.studio.v1")).tracks[0].lane }; });
  ok(m1.row && m1.after && m1.name === "Volume" && m1.aria === "Volume, drawn on track 1" && m1.dash && m1.hint === "Tap the lane to add a point. Drag a point to move it."
    && m1.rule === "While the lane has points, the line sets it and the knob rests. The line stays with the track when you move a piece." && m1.btns === "+ Add a point | Remove this point (rests) | Clear this lane (rests)" && !m1.knob && m1.saved === "vol",
    "Volume opens one lane right under track 1 (the knob's level as a dashed line), the hint, the rule in one line " + JSON.stringify(m1));

  /* 1 · two mouse taps with Snap to the beat on: they land on beats; each is one Undo; the knob rests */
  const u0 = await undoN(p);
  await tap(p, 0, 4.3, 80);
  const u1 = await undoN(p);
  await tap(p, 0, 19.6, 40);
  let L = await line(p, 0, "vol");
  const k1 = await p.evaluate(VIS => { const vis = eval(VIS); return { dis: ["t0-vol", "cv-vol", "fv0"].map(id => document.getElementById(id).disabled), out: vis(document.getElementById("t0-vol-o")), cv: vis(document.getElementById("cv-vol-o")),
    vt: document.getElementById("t0-vol").getAttribute("aria-valuetext"), said: document.getElementById("autoLine").textContent, opt: document.querySelector('#drawSel option[value="vol"]').textContent,
    pts: [...document.querySelectorAll('#timeline [data-alt="0"] .st-apt')].map(x => x.getAttribute("aria-label")).join(" / ") }; }, VIS);
  ok(L && L.length === 2 && L[0][0] === 4 && L[1][0] === 20 && near(L[0][1], 80, 2) && near(L[1][1], 40, 2) && u1 === u0 + 1 && await undoN(p) === u0 + 2,
    "two taps (Snap on) land on beats 4 and 20, one Undo step each: " + JSON.stringify(L));
  ok(k1.dis.every(Boolean) && k1.out === "✎ Drawn" && k1.cv === "✎ Drawn" && k1.vt === "Drawn on the track" && /^Point 2: Bar 6, −1[12] dB\.$/.test(k1.said) && k1.opt === "Volume ✎" && /^Point 1: Bar 2, [−+]?\d dB \/ Point 2: Bar 6, −1[12] dB$/.test(k1.pts),
    "while the line has points the volume knob, the open channel's fader and the short fader rest: " + JSON.stringify(k1));
  /* the bounce follows the line: before the first point it holds, then the straight line, then it holds again */
  await p.evaluate(() => __T.render("cur"));
  const lv = await p.evaluate(([L, W]) => [0.3, 1.8, 2.7, 3.6, 5.0, 6.4, 7.7, 9.1, 10.5, 11.6, 12.5, 13.6].map(t => ({ t, got: +(__T.db("cur", t, W) - __T.db("ref", t, W)).toFixed(2), want: +__T.expVol(L, t, W).toFixed(2) })), [L, W]);
  ok(lv.every(q => near(q.got, q.want, 0.5)) && lv[11].want < -9, "the mix's level follows the drawn volume within 0.5 dB at 12 places: " + lv.map(q => q.t + "s " + q.got + "/" + q.want).join(", "));

  /* 2 · Undo and Redo (keys and buttons) */
  await p.mouse.click(4, 300);
  await p.keyboard.press("Control+z"); await p.waitForTimeout(80);
  const Lu = await line(p, 0, "vol");
  await p.keyboard.press("Control+Shift+z"); await p.waitForTimeout(80);
  const Lr = await line(p, 0, "vol");
  await p.click("#tlUndo"); await p.click("#tlUndo"); await p.waitForTimeout(80);
  const Lz = await line(p, 0, "vol"), kz = await p.evaluate(() => ({ dis: document.getElementById("t0-vol").disabled, out: document.getElementById("t0-vol-o").textContent }));
  await p.click("#tlRedo"); await p.click("#tlRedo"); await p.waitForTimeout(80);
  ok(JSON.stringify(Lu) === JSON.stringify(L.slice(0, 1)) && JSON.stringify(Lr) === JSON.stringify(L) && Lz === null && !kz.dis && kz.out === "80" && JSON.stringify(await line(p, 0, "vol")) === JSON.stringify(L),
    "Ctrl+Z takes the last point back, Ctrl+Shift+Z puts it back; Undo twice leaves no line and the knob moves again (" + JSON.stringify(kz) + "); Redo twice brings both back");

  /* 3 · drag a point (Snap on: onto a beat), then Snap off: a drag and a tap land just where they are let go */
  await dragFromTo(p, 0, 20, L[1][1], 16.4, 60);
  let L2 = await line(p, 0, "vol");
  ok(L2.length === 2 && L2[1][0] === 16 && near(L2[1][1], 60, 2) && await undoN(p) === u0 + 3, "a point dragged with the mouse lands on beat 16 (Snap on), one Undo step: " + JSON.stringify(L2));
  await p.click("#snapBtn"); await p.waitForTimeout(60);
  const a3 = await laneXY(p, 0, 0, 0);
  await dragFromTo(p, 0, 16, L2[1][1], 17.37, 60);
  L2 = await line(p, 0, "vol");
  ok(near(L2[1][0], 17.37, 1.5 / a3.perBeat) && Math.abs(L2[1][0] - Math.round(L2[1][0])) > 0.05, `Snap off: the point lands just where it is let go (beat ${L2[1][0]}; a pixel is ${(1 / a3.perBeat).toFixed(3)} beats)`);
  await tap(p, 0, 26.62, 70);
  L2 = await line(p, 0, "vol");
  ok(L2.length === 3 && near(L2[2][0], 26.62, 1.5 / a3.perBeat) && Math.abs(L2[2][0] - Math.round(L2[2][0])) > 0.05, "Snap off: a tap adds a point off the beat: " + JSON.stringify(L2[2]));
  await p.click("#snapBtn"); await p.waitForTimeout(60);
  /* a stroke across the lane (Snap on): a point on each beat it passes, in place of what was there; one Undo */
  const us = await undoN(p);
  await dragFromTo(p, 0, 21, 30, 28, 90, 14);
  const Ls = await line(p, 0, "vol");
  const beats = Ls.filter(q => q[0] >= 21 && q[0] <= 28).map(q => q[0]);
  ok(JSON.stringify(beats) === "[21,22,23,24,25,26,27,28]" && Ls.filter(q => q[0] >= 21).every((q, j, A) => j === 0 || q[1] >= A[j - 1][1]) && await undoN(p) === us + 1,
    "a stroke from beat 21 to 28 draws a point on every beat, rising as drawn, the tap at 26.62 under it gone, one Undo step: " + JSON.stringify(Ls));
  await p.keyboard.press("Control+z"); await p.waitForTimeout(80);
  ok(JSON.stringify(await line(p, 0, "vol")) === JSON.stringify(L2), "one Ctrl+Z takes the whole stroke back");

  /* 4 · pick a point, Remove this point; the keys; Clear this lane (and Undo) */
  const pick = await laneXY(p, 0, L2[2][0], L2[2][1]);
  await p.mouse.click(pick.x, pick.y); await p.waitForTimeout(80);
  const pk = await p.evaluate(() => ({ said: document.getElementById("autoLine").textContent, del: document.getElementById("ptDel").disabled, on: document.querySelector('#timeline [data-alt="0"] .st-apt.on').getAttribute("data-pt") }));
  await p.click("#ptDel"); await p.waitForTimeout(80);
  const pd = await p.evaluate(() => ({ said: document.getElementById("autoLine").textContent, n: __aogStudio.lineOf(0, "vol").length, f: document.activeElement.id }));
  ok(/^Point 3: Bar 7 · beat 4, \d+ ms early, [−+]?\d dB\.$/.test(pk.said) && !pk.del && pk.on === "2" && pd.said === "Point removed." && pd.n === 2 && pd.f === "ptAdd",
    "a tap on a point picks it (it says where and how loud); Remove this point takes it out " + JSON.stringify([pk, pd]));
  const vol0 = await p.evaluate(() => __aogStudio.SONG.tracks[0].vol);
  await p.evaluate(() => { __aogStudio.AUI.i = 0; __aogStudio.AUI.k = "vol"; __aogStudio.AUI.j = 1; __aogStudio.lineChanged(0); document.querySelector('#timeline [data-alt="0"] [data-pt="1"]').focus(); });
  const before = await line(p, 0, "vol");
  await p.keyboard.press("ArrowLeft"); await p.keyboard.press("ArrowDown"); await p.keyboard.press("Shift+ArrowDown"); await p.waitForTimeout(80);
  const kk = await p.evaluate(() => ({ L: __aogStudio.lineOf(0, "vol"), f: document.activeElement.getAttribute("data-pt"), vol: __aogStudio.SONG.tracks[0].vol, sel: __aogStudio.SONG.sel }));
  ok(near(kk.L[1][0], before[1][0] - 1, 1e-6) && kk.L[1][1] === before[1][1] - 6 && kk.f === "1" && kk.vol === vol0, "the keys move a picked point: ← a beat earlier, ↓ and Shift+↓ 6 lower; it keeps the keyboard; the fader's own ↑↓ keys stay out of it " + JSON.stringify(kk));
  await p.keyboard.press("Control+z"); await p.waitForTimeout(80);
  ok(JSON.stringify(await line(p, 0, "vol")) === JSON.stringify(before), "a run of key moves is one Undo step");
  await p.click("#lnClear"); await p.waitForTimeout(80);
  const cl = await p.evaluate(() => ({ L: __aogStudio.lineOf(0, "vol"), said: document.getElementById("autoLine").textContent, knob: document.getElementById("t0-vol").disabled, opt: document.querySelector('#drawSel option[value="vol"]').textContent, f: document.activeElement.id }));
  ok(cl.L === null && cl.said === "Lane cleared. The knob sets it again." && !cl.knob && cl.opt === "Volume" && cl.f === "drawSel", "Clear this lane: no points, the knob decides again " + JSON.stringify(cl));
  await p.click("#tlUndo"); await p.waitForTimeout(80);
  ok(JSON.stringify(await line(p, 0, "vol")) === JSON.stringify(before), "Undo brings the cleared lane back");
  /* the fade for what follows: a straight fade from beat 4 (0 dB) to beat 20 (−12 dB) */
  await p.evaluate(() => { __aogStudio.SONG.tracks[0].lines.vol = [[4, 80], [20, 40]]; __aogStudio.lineChanged(0); });
  L = await line(p, 0, "vol");

  /* 5 · Side (pan): drawn from the left to the right, the left and right follow the panner's own law */
  await p.selectOption("#drawSel", "pan"); await p.waitForTimeout(80);
  ok(await p.evaluate(() => document.querySelectorAll("#timeline .st-auto").length === 1 && document.querySelector('#timeline [data-auto="0"] .st-aln').textContent === "Side (pan)"), "the menu shows one lane at a time for a track: Side (pan) now");
  await tap(p, 0, 0, -80); await tap(p, 0, 24, 80);
  const Lp = await line(p, 0, "pan");
  await p.evaluate(() => __T.render("cur"));
  const pan = await p.evaluate(([Lp, W]) => [0.5, 2.5, 4.5, 6.5, 7.2, 8.5, 10.5, 12.5].map(t => { const v = __aogStudio.drawnAt(Lp, (t + W / 2) / 0.6) / 100; return { t, got: +__T.lr("cur", t, W).toFixed(2), want: +__T.panLaw(v).toFixed(2) }; }), [Lp, W]);
  ok(Lp && Lp.length === 2 && pan.every(q => near(q.got, q.want, 0.5)) && pan[0].got > 6 && pan[7].got < -6 && near(pan[4].got, 0, 0.6),
    "Side drawn from left 80 to right 80: left minus right follows the line within 0.5 dB: " + pan.map(q => q.t + "s " + q.got + "/" + q.want).join(", "));
  ok(await p.evaluate(VIS => document.getElementById("t0-pan").disabled && eval(VIS)(document.getElementById("t0-pan-o")) === "✎ Drawn" && document.getElementById("cs-pan").disabled, VIS), "the Side knob rests too (the mixer and the open channel)");

  /* 6 · Room and Echo: what the send adds rises as drawn; where the line is level it is what the knob gives */
  for (const k of ["room", "echo"]) {
    await p.evaluate(() => __T.render("dry"));
    await p.selectOption("#drawSel", k); await p.waitForTimeout(80);
    await tap(p, 0, 8, 0); await tap(p, 0, 12, 100);
    const Lk = await line(p, 0, k), top = Lk[1][1];
    await p.evaluate(() => __T.render("cur"));
    await p.evaluate(([k, top]) => { const x = __aogStudio.SONG.tracks[0], keep = x.lines[k]; delete x.lines[k]; x[k] = top; return __T.render("knob").then(() => { x[k] = 0; x.lines[k] = keep; }); }, [k, top]);
    const wet = await p.evaluate(() => [1.0, 3.5, 6.0, 6.9, 9.5, 11.0, 12.5].map(t => ({ t, line: +__T.wet("cur", "dry", t, 0.3).toFixed(1), knob: +__T.wet("knob", "dry", t, 0.3).toFixed(1) })));
    const W3 = wet.map(q => q.line);
    ok(Lk.length === 2 && W3[0] < -90 && W3[1] < -90 && W3[2] < W3[3] - 3 && near(wet[4].line, wet[4].knob, 1) && near(wet[5].line, wet[5].knob, 1) && near(wet[6].line, wet[6].knob, 1) && wet[6].knob > -40,
      `${k}: nothing before beat 8, rising to beat 12, then what the knob at ${top} gives (within 1 dB; the dry note itself fades as drawn): ` + wet.map(q => q.t + "s " + q.line + "/" + q.knob).join(", "));
  }
  ok(await p.evaluate(() => ["t0-room", "t0-echo"].every(id => document.getElementById(id).disabled)), "the Room and Echo knobs rest while drawn");

  /* 7 · the Filter, on the noise on track 2 (track 1 muted): no points is the same sound to the last bit */
  await put(p, "Guitar take 2", 1);
  await p.evaluate(() => { const x = __aogStudio.SONG.tracks; x[0].mute = true; });
  await p.evaluate(() => __T.render("a"));
  await p.selectOption("#drawSel", "filt"); await p.waitForTimeout(80);
  await p.evaluate(() => __T.render("b"));
  const fr = await p.evaluate(() => { const oc = new OfflineAudioContext(2, 128, 44100), E = __aogStudio.makeEngine(oc, false); return { fOn: E.tr[1].fOn, same: __T.same("a", "b"), rule: document.getElementById("autoRule").textContent }; });
  ok(fr.same.n === 0 && fr.fOn === false && /Lower is darker\. At the top it is open\.$/.test(fr.rule), "the Filter lane open with no points: the mix is the same to the last bit, and the track does not pass through the filter " + JSON.stringify(fr));
  await tap(p, 1, 0, 100); await tap(p, 1, 8, 0); await tap(p, 1, 16, 100);
  const Lf = await line(p, 1, "filt");
  await p.evaluate(() => __T.render("cur"));
  const cen = await p.evaluate(() => [0.1, 2.3, 4.7, 7.1, 9.1].map(t => Math.round(__T.cent("cur", t)))), cA = await p.evaluate(() => Math.round(__T.cent("a", 4.7)));
  const fz = await p.evaluate(() => { const oc = new OfflineAudioContext(2, 128, 44100), E = __aogStudio.makeEngine(oc, false); return E.tr[1].fOn; });
  ok(Lf.length === 3 && Lf[1][1] <= 2 && fz && cen[0] > 6000 && cen[1] < cen[0] * 0.8 && cen[2] < 700 && cen[3] > cen[2] * 2 && cen[3] < cen[4] * 0.8 && cen[4] > 6000 && cA > 6000,
    `a drawn sweep (open, down to 200 Hz at bar 3, open again at bar 5): the spectral centroid ${cen.join(" → ")} Hz (the noise alone: ${cA} Hz)`);
  await p.click("#lnClear"); await p.waitForTimeout(80);
  await p.evaluate(() => __T.render("c"));
  ok(await p.evaluate(() => __T.same("a", "c").n === 0), "Clear this lane: the same sound as before, to the last bit");
  await p.click("#tlUndo"); await p.waitForTimeout(80);
  ok(JSON.stringify(await line(p, 1, "filt")) === JSON.stringify(Lf), "Undo: the sweep is back");

  /* 8 · the speakers match the mix. Track 2 muted, track 1 heard with its fade, Side, Room and Echo */
  await p.evaluate(() => { const x = __aogStudio.SONG.tracks; x[0].mute = false; x[1].mute = true; __aogStudio.lineChanged(0); });
  await p.evaluate(() => __T.render("full"));
  const lat = await p.evaluate(() => __aogStudio.LAT / 44100);
  await p.evaluate(() => __T.recOn());
  /* started at bar 3, a reschedule while it plays (as after an edit) */
  await p.evaluate(() => { const s = document.getElementById("startSel"); s.value = "3"; s.dispatchEvent(new Event("change", { bubbles: true })); });
  const w1 = await p.evaluate(() => { __aogStudio.play(); return Object.assign({}, __aogStudio.PLAY.wins[0]); });
  await p.waitForTimeout(1500);
  const sl1 = await p.evaluate(() => ["t0-vol", "cv-vol", "fv0", "t0-pan"].map(id => document.getElementById(id).value + (document.getElementById(id).disabled ? "d" : "")).join());
  await p.waitForTimeout(2300);
  const w2 = await p.evaluate(() => { __aogStudio.reschedule(); return Object.assign({}, __aogStudio.PLAY.wins[0]); });
  await p.waitForTimeout(2500);
  const sl2 = await p.evaluate(() => ["t0-vol", "cv-vol", "fv0", "t0-pan"].map(id => document.getElementById(id).value + (document.getElementById(id).disabled ? "d" : "")).join());
  await p.waitForFunction(() => !__aogStudio.PLAY.on, null, { timeout: 15000 }); await p.waitForTimeout(300);
  await p.evaluate(() => __T.recOff());
  const cmp = (ws, list) => p.evaluate(([ws, list, lat, W]) => list.map(s => { const w = ws.filter(x => s >= x.from - 1e-9).pop(); const ct = w.at + (s - w.from) + lat;
    return { s, live: +__T.ldb(ct, W).toFixed(2), mix: +__T.db("full", s, W).toFixed(2) }; }), [ws, list, lat, W]);
  const r1 = await cmp([w1, w2], [w1.from + 0.4, w1.from + 1.5, w1.from + 2.8, w2.from + 2.2, w2.from + 3.0, w2.from + 3.8, Math.min(w2.from + 4.6, 13.9)]);
  ok(w1.from === 4.8 && w2.from > w1.from + 3 && r1.every(q => near(q.live, q.mix, 0.5)), `▶ Play from bar 3, then a reschedule while it plays (at ${w2.from.toFixed(2)} s; looked at from 2 s after it: a reschedule starts the pieces again 50 ms on, so for a moment the steady note meets its own Echo in a new phase, as it always has): the speakers match the mix within 0.5 dB: ` + r1.map(q => q.s.toFixed(2) + "s " + q.live + "/" + q.mix).join(", "));
  ok(sl1 === sl2 && /d$/.test(sl1), "while it plays, the drawn knobs and faders stay still: " + sl1 + " · " + sl2);
  /* looping bars 2 to 3, two passes */
  await p.evaluate(() => { const S = __aogStudio.SONG; S.loopOn = true; S.loopFrom = 2; S.loopTo = 3; });
  await p.evaluate(() => __T.recOn());
  const w3 = await p.evaluate(() => { __aogStudio.play(); return Object.assign({}, __aogStudio.PLAY.wins[0]); });
  await p.waitForTimeout(7600);
  await p.evaluate(() => __aogStudio.stop()); await p.waitForTimeout(200);
  await p.evaluate(() => __T.recOff());
  const loopList = [3.0, 4.6, 6.6].map(s => ({ s, at: w3.at + (s - 2.4) })).concat([3.0, 4.6].map(s => ({ s, at: w3.at + 4.8 + (s - 2.4) })));
  const r2 = await p.evaluate(([L, lat, W]) => L.map(q => ({ s: q.s, live: +__T.ldb(q.at + lat, W).toFixed(2), mix: +__T.db("full", q.s, W).toFixed(2) })), [loopList, lat, W]);
  ok(near(w3.from, 2.4, 1e-9) && near(w3.to, 7.2, 1e-9) && r2.every(q => near(q.live, q.mix, 0.5)), "looping bars 2 to 3, the first pass and the second match the mix within 0.5 dB: " + r2.map(q => q.s + "s " + q.live + "/" + q.mix).join(", "));
  await p.evaluate(() => { const S = __aogStudio.SONG; S.loopOn = false; const s = document.getElementById("startSel"); s.value = "1"; s.dispatchEvent(new Event("change", { bubbles: true })); });
  /* the line changed while it plays: a drop to −12 dB at beat 8 is heard from there on, the pieces play on */
  await p.evaluate(() => __T.recOn());
  const w4 = await p.evaluate(() => { __aogStudio.play(); return Object.assign({}, __aogStudio.PLAY.wins[0]); });
  await p.waitForTimeout(1500);
  const srcs = await p.evaluate(() => { const st = __aogStudio, n = st.PLAY.srcs.length; st.SONG.tracks[0].lines.vol = [[0, 80], [8, 80], [8, 40], [24, 40]]; st.lineChanged(0); return [n, st.PLAY.srcs.length, Object.assign({}, st.PLAY.wins[0]).at]; });
  await p.waitForTimeout(5200);
  await p.evaluate(() => __aogStudio.stop()); await p.waitForTimeout(200);
  await p.evaluate(() => __T.recOff());
  await p.evaluate(() => __T.render("new"));
  const r3 = await p.evaluate(([w, lat, W]) => [0.4, 1.0, 2.6, 3.8, 4.4, 5.2, 6.0].map(s => ({ s, live: +__T.ldb(w.at + s + lat, W).toFixed(2), mix: +__T.db(s < 1.5 ? "full" : "new", s, W).toFixed(2), old: +__T.db("full", s, W).toFixed(2) })), [w4, lat, W]);
  ok(srcs[0] === srcs[1] && srcs[2] === w4.at && r3.every(q => near(q.live, q.mix, 0.5)) && r3[6].old - r3[6].live > 8,
    "a line changed while it plays: the pieces play on, and from then the speakers follow the new line (−12 dB from beat 8) within 0.5 dB: " + r3.map(q => q.s + "s " + q.live + "/" + q.mix).join(", "));

  /* 9 · a piece moved: the line stays where it is (it belongs to the track) */
  const lines0 = await p.evaluate(() => JSON.stringify(__aogStudio.SONG.tracks[0].lines));
  await p.selectOption("#trackSel", "0");
  await p.click('#clipBox [data-act="start+"]'); await p.waitForTimeout(100);
  const moved = await p.evaluate(() => ({ at: __aogStudio.pcs(__aogStudio.SONG.tracks[0].clip)[0].at, lines: JSON.stringify(__aogStudio.SONG.tracks[0].lines) }));
  await p.click("#tlUndo"); await p.waitForTimeout(100);
  ok(moved.at === 4 && moved.lines === lines0 && await p.evaluate(() => __aogStudio.pcs(__aogStudio.SONG.tracks[0].clip)[0].at === 0), "the piece moved a bar later: every line stays where it was drawn; Undo puts the piece back");

  /* 10 · zoomed in, the points sit on the same bars as the lane above, and a tap lands where it is meant to */
  await p.selectOption("#drawSel", "vol"); await p.waitForTimeout(60);
  await p.evaluate(() => __aogStudio.zoomTo(4)); await p.waitForTimeout(100);
  await p.evaluate(() => { const tl = document.getElementById("timeline"); tl.scrollLeft = 300; tl.scrollIntoView({ block: "center" }); });
  await p.waitForTimeout(100);
  const zg = await p.evaluate(() => { const st = __aogStudio, lt = document.querySelector('#timeline .st-lane[data-sel="0"] .st-lt').getBoundingClientRect(), row = document.querySelector('#timeline .st-auto[data-auto="0"]').getBoundingClientRect(),
      lane = document.querySelector('#timeline .st-lane[data-sel="0"]').getBoundingClientRect(), Wd = st.tlBars() * 4;
    return { off: [...document.querySelectorAll('#timeline [data-alt="0"] .st-apt')].map((el, j) => { const r = el.getBoundingClientRect(); return +((r.left + r.width / 2) - (lt.left + st.lineOf(0, "vol")[j][0] / Wd * lt.width)).toFixed(2); }),
      w: [Math.round(row.width), Math.round(lane.width)], left: [Math.round(row.left), Math.round(lane.left)], z: st.VIEW.zoom, sl: document.getElementById("timeline").scrollLeft }; });
  ok(zg.z === 4 && zg.sl === 300 && zg.off.every(d => Math.abs(d) <= 1) && zg.w[0] === zg.w[1] && zg.left[0] === zg.left[1], "zoomed in 4× and scrolled: the drawing lane is as wide as the lane above and every point is on its beat (within 1 px) " + JSON.stringify(zg));
  const zb = await p.evaluate(() => { const tl = document.getElementById("timeline"), lab = tl.querySelector(".st-ln").getBoundingClientRect().width, lt = tl.querySelector('.st-lane[data-sel="0"] .st-lt').getBoundingClientRect(), tr = tl.getBoundingClientRect();
    const x = tr.left + lab + 120, Wd = __aogStudio.tlBars() * 4; return Math.round((x - lt.left) / lt.width * Wd); });
  await tap(p, 0, zb + 0.2, 60);
  ok((await line(p, 0, "vol")).some(q => q[0] === zb && near(q[1], 60, 2)), "zoomed in, a tap at beat " + zb + " lands on beat " + zb);
  await p.keyboard.press("Control+z"); await p.waitForTimeout(60);
  await p.evaluate(() => __aogStudio.zoomTo(1)); await p.waitForTimeout(60);

  /* 11 · a reload keeps it; a song file carries it to a fresh device, where it sounds the same */
  const keep = await p.evaluate(() => JSON.stringify(__aogStudio.SONG.tracks.map(x => [x.lines || null, x.lane || ""])));
  await p.reload();
  await p.waitForFunction(() => window.__aogStudio && __aogStudio.BUF.size >= 2 && !__aogStudio.S.decoding, null, { timeout: 30000 });
  await p.waitForTimeout(300); await p.evaluate(HELP);
  const back = await p.evaluate(VIS => ({ j: JSON.stringify(__aogStudio.SONG.tracks.map(x => [x.lines || null, x.lane || ""])), knob: document.getElementById("t0-vol").disabled, out: eval(VIS)(document.getElementById("t0-vol-o")), lane: !!document.querySelector('#timeline [data-auto="0"] .st-apt') }), VIS);
  ok(back.j === keep && back.knob && back.out === "✎ Drawn" && back.lane, "after a reload: every line, the open lanes and the resting knobs " + keep);
  const b64 = await p.evaluate(async () => { const f = await __aogStudio.songFile(), u = new Uint8Array(await f.arrayBuffer()); let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); });
  const c2 = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(c2); await routes(c2);
  const q = await c2.newPage(); await q.goto(U2 + "music-studio.html"); await q.waitForTimeout(700);
  const there = await q.evaluate(async b64 => { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const st = __aogStudio, r = await st.readSongFile(new Blob([u])); await st.applySong(r); return JSON.stringify(st.SONG.tracks.map(x => [x.lines || null, x.lane || ""])); }, b64);
  await q.waitForFunction(() => __aogStudio.BUF.size >= 2 && !__aogStudio.S.decoding, null, { timeout: 30000 });
  await q.evaluate(() => { __aogStudio.SONG.master.glue = 0; const x = __aogStudio.SONG.tracks; x[1].mute = true; });
  await q.evaluate(HELP);
  await q.evaluate(() => __T.render("full"));
  await p.evaluate(() => { __aogStudio.SONG.master.glue = 0; }); await p.evaluate(() => __T.render("full"));
  const here = await p.evaluate(() => __T.B.full.L.length), sameThere = await q.evaluate(() => __T.B.full.L.length);
  const lvT = await q.evaluate(W => [1.0, 4.0, 7.0, 10.0].map(t => +__T.db("full", t, W).toFixed(3)), W), lvH = await p.evaluate(W => [1.0, 4.0, 7.0, 10.0].map(t => +__T.db("full", t, W).toFixed(3)), W);
  ok(there === keep && here === sameThere && lvT.every((x, j) => near(x, lvH[j], 0.05)), "a song file opened on a fresh device (another address): the same lines, and the same sound " + lvT.join(" ") + " / " + lvH.join(" "));
  await c2.close();

  /* 12 · Spanish */
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(150);
  const pt0 = await laneXY(p, 0, 4, 80); await p.mouse.click(pt0.x, pt0.y); await p.waitForTimeout(80);
  const es = await p.evaluate(VIS => ({ lab: document.querySelector("#autoTools .st-drw .st-lab").textContent, opts: [...document.querySelectorAll("#drawSel option")].map(o => o.textContent).join(" | "),
    btns: [...document.querySelectorAll("#autoTools button")].map(x => x.textContent).join(" | "), said: document.getElementById("autoLine").textContent, rule: document.getElementById("autoRule").textContent,
    knob: eval(VIS)(document.getElementById("t0-vol-o")), vt: document.getElementById("t0-vol").getAttribute("aria-valuetext"), name: document.querySelector('#timeline [data-auto="0"] .st-aln').textContent,
    aria: document.querySelector('#timeline [data-alt="0"]').getAttribute("aria-label") }), VIS);
  ok(es.lab === "Dibujar cambios en la pista 1" && es.opts === "No | Volumen ✎ | Lado (paneo) ✎ | Sala ✎ | Eco ✎ | Filtro" && es.btns === "+ Añadir un punto | Quitar este punto | Borrar esta franja"
    && /^Punto 2: Compás 2, [−+]?\d dB\.$/.test(es.said) && es.rule === "Mientras la franja tiene puntos, manda la línea y la perilla descansa. La línea se queda en la pista cuando mueves una parte." && es.knob === "✎ Dibujado" && es.vt === "Dibujado en la pista"
    && es.name === "Volumen" && es.aria === "Volumen, dibujado en la pista 1", "Spanish: " + JSON.stringify(es));
  await p.selectOption("#trackSel", "1");
  ok(await p.evaluate(() => document.getElementById("autoRule").textContent.endsWith("Más abajo suena más oscuro. Arriba está abierto.") && /^Filtro ✎$/.test(document.querySelector('#drawSel option[value="filt"]').textContent)), "Spanish, the Filter's line");
  await p.evaluate(() => document.getElementById("langBtn").click());
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();

  /* 13 · an iPad: a finger taps two points and drags one (real touch events), the level follows; an iPhone and an iPad,
     light and dark, a lane open: readable, calm, nothing sideways, every new control big enough for a finger */
  for (const [dev, theme] of [["iPad (gen 7)", "light"], ["iPad (gen 7)", "dark"], ["iPhone 13", "light"], ["iPhone 13", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(700);
    await add(m, { n: 1, kind: "tone", bars: 6 });
    await m.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
    await m.click("#putBtn"); await m.waitForFunction(() => __aogStudio.SONG.tracks[0].clip && !__aogStudio.S.busy, null, { timeout: 15000 });
    await m.evaluate(() => { __aogStudio.SONG.master.glue = 0; }); await m.evaluate(HELP);
    await m.selectOption("#drawSel", "vol"); await m.waitForTimeout(100);
    if (dev.startsWith("iPad") && theme === "light") {
      await m.evaluate(() => __T.render("ref"));
      const s = await m.context().newCDPSession(m);
      const touch = async (pts) => { await s.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: pts[0].x, y: pts[0].y }] });
        for (const q of pts.slice(1)) { await s.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: q.x, y: q.y }] }); await m.waitForTimeout(16); }
        await s.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await m.waitForTimeout(250); };
      let a = await laneXY(m, 0, 4, 80); await m.waitForTimeout(300); a = await laneXY(m, 0, 4, 80); await touch([a]);
      a = await laneXY(m, 0, 20, 40); await touch([a]);
      const T1 = await line(m, 0, "vol");
      const g0 = await laneXY(m, 0, 20, T1 && T1[1] ? T1[1][1] : 40), g1 = await laneXY(m, 0, 16, 50, true);
      await touch(Array.from({ length: 11 }, (_, k) => ({ x: g0.x + (g1.x - g0.x) * k / 10, y: g0.y + (g1.y - g0.y) * k / 10 })));
      const T2 = await line(m, 0, "vol");
      await m.evaluate(() => __T.render("cur"));
      const lvi = await m.evaluate(([L, W]) => [1.0, 3.5, 6.0, 8.0, 10.0, 12.0].map(t => ({ t, got: +(__T.db("cur", t, W) - __T.db("ref", t, W)).toFixed(2), want: +__T.expVol(L, t, W).toFixed(2) })), [T2, W]);
      const sx = await m.evaluate(() => scrollX);
      ok(T1 && T1.length === 2 && T1[0][0] === 4 && T1[1][0] === 20 && T2 && T2.length === 2 && T2[1][0] === 16 && near(T2[1][1], 50, 3) && sx === 0 && lvi.every(q => near(q.got, q.want, 0.5)),
        "iPad: a finger taps two points (beats 4 and 20) and drags the second to beat 16: " + JSON.stringify(T2) + "; the level follows within 0.5 dB: " + lvi.map(q => q.t + "s " + q.got + "/" + q.want).join(", "));
    } else await m.evaluate(() => { __aogStudio.SONG.tracks[0].lines = { vol: [[4, 80], [20, 40]] }; __aogStudio.lineChanged(0); });
    await m.evaluate(() => { document.getElementById("timeline").scrollIntoView({ block: "center" }); }); await m.waitForTimeout(150);
    const f = await m.evaluate(() => { const r = el => el.getBoundingClientRect(), btn = [...document.querySelectorAll("#autoTools button")].filter(x => x.offsetParent), pts = [...document.querySelectorAll("#timeline .st-apt")];
      return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, minH: Math.min(...btn.map(x => Math.round(r(x).height))), right: Math.max(...btn.map(x => Math.round(r(x).right))), fs: parseFloat(getComputedStyle(document.getElementById("drawSel")).fontSize),
        pt: Math.min(...pts.map(x => Math.round(r(x).width))), n: pts.length, row: Math.round(r(document.querySelector("#timeline .st-alt")).height) }; });
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    ok(f.sw <= f.iw && f.minH >= 44 && f.right <= f.iw && f.fs >= 16 && f.pt >= 44 && f.n === 2 && f.row >= 60 && !pc.length && !pk.length,
      `${dev}, ${theme}, a lane open: it fits (${JSON.stringify(f)}), reads (${pc.length} unreadable ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await m.screenshot({ path: path.join(__dirname, "..", `studioauto-${dev.split(" ")[0].toLowerCase()}-${theme}.png`) });
    await cx.close();
  }
  /* 14 · inside the Recording Studio (where the desk is used): a lane open, light and dark, readable and calm */
  for (const [dev, theme] of [["iPad (gen 7) landscape", "light"], ["iPad (gen 7) landscape", "dark"], ["iPhone 13", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
    await cx.addInitScript(th => { try { localStorage.setItem("aog.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U + "the-studio#studio");
    await m.waitForFunction(() => { const d = document.getElementById("room").contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && /studio/.test(d.location.pathname); }, null, { timeout: 20000 });
    await m.waitForTimeout(1200);
    const f = m.frames().find(x => x.parentFrame() === m.mainFrame());
    await f.evaluate(`(${TAKE})(${JSON.stringify({ n: 1, kind: "tone", bars: 6 })})`);
    await f.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
    await f.click("#putBtn"); await f.waitForFunction(() => __aogStudio.SONG.tracks[0].clip && !__aogStudio.S.busy, null, { timeout: 15000 });
    await f.selectOption("#drawSel", "vol");
    await f.evaluate(() => { const st = __aogStudio; st.SONG.tracks[0].lines = { vol: [[4, 80], [20, 40]] }; st.AUI.i = 0; st.AUI.k = "vol"; st.AUI.j = 1; st.lineChanged(0); document.getElementById("autoTools").scrollIntoView({ block: "center" }); });
    await m.waitForTimeout(300);
    const fc = await f.evaluate(`(${PROBE})()`), fk = await f.evaluate(`(${CALM})()`), sw = await f.evaluate(() => document.scrollingElement.scrollWidth - innerWidth);
    ok(!fc.length && !fk.length && sw <= 1, `inside the Recording Studio, ${dev}, ${theme}, a lane open and a point picked: readable (${fc.length} ${JSON.stringify(fc.slice(0, 2))}), calm (${fk.join("; ") || "ok"}), nothing sideways (${sw})`);
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the iPad or the iPhone " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); srv2.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
