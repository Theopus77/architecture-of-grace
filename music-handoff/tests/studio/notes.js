/* AOG-NOTES-V1 · AOG-PIANOROLL-V1 (2026-10-11) — Jimmy's ceiling-breaker: "Record notes, not just sound. The Piano, Guitar,
   Bass and Band would also keep which notes you played. At the desk you could then fix a wrong note, change an instrument
   after recording, or tighten the timing (quantize) on a piano-roll."
   Inside the Studio: a take on the piano (two keys, a key held on the pedal, a chord pad, a chord pattern), on the guitar (a
   strum and single notes), on the bass and on the band (a key and a pad) carries its notes, each at the time it sounded in
   the take, with its pitch, its length, its string or its player; a take recorded over My Track has its notes on its cut
   (a note played 10 ms after bar 3's line is at 10 ms). Each room's AOGRoomRender plays the notes again offline and it
   sounds like the take (the loudness over time alike, r > 0.9; the attacks within 5 ms). At the Mixing Desk the clip shows
   Edit the notes; the piano-roll moves a note (dragged), deletes one (Delete), adds one (a tap), Undo and Redo; Tighten the
   timing puts a sloppy line on the 1/8 grid (the re-rendered attacks within 5 ms of it, from up to 25 ms off); Play it with
   the changes and Keep the new one replace the clip's sound and keep its bar; Change the instrument changes the sound (its
   spectrum); the pitch moves an octave and a half step. The notes survive a reload and the .aogsong file. Spanish. iPhone
   and iPad: readable (check-contrast probe), calm (check-calm calmProbe), 44 px buttons, the grid scrolls inside itself and
   the page never sideways. No page errors. Ports 9274 (computer) and 9275 (iPhone, iPad). */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9274, PORT2 = 9275, U = "http://localhost:" + PORT + "/", U2 = "http://localhost:" + PORT2 + "/";
const srv = require("../srv.js")(PORT), srv2 = require("../srv.js")(PORT2);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
async function ctxOf(b, opts, theme) {
  const c = await b.newContext(Object.assign({ viewport: { width: 1366, height: 900 } }, opts || {}));
  if (theme) await c.addInitScript(th => { try { localStorage.setItem("aog.theme", th); } catch (e) {} }, theme);
  c.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message)));
  await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await c.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  return c;
}
async function arrived(p, file) {
  await p.waitForFunction(f => { const fr = document.getElementById("room"), d = fr && fr.contentDocument;
    return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && d.location.pathname.endsWith(f); }, file, { timeout: 30000 });
  await p.waitForTimeout(700);
}
const door = async (p, id, file) => { await p.click('.sh-doors a[data-room="' + id + '"]'); await arrived(p, file); };
const R = async (p, fn, arg) => { const f = await (await p.$("#room")).contentFrame(); return f.evaluate(([src, a]) => (new Function("a", "return (" + src + ")(a)"))(a), [fn.toString(), arg]); };
const frameOf = async p => (await p.$("#room")).contentFrame();

/* in the room: the take's sound, its notes played again, and how alike they are */
const COMPARE = async () => {
  const k = REC.takes[0], N = k.notes, ev = N.ev;
  const out = await AOGRoomRender.render({ sound: N.sound, events: N.ev, sec: k.sec, tail: 0, set: N.set, space: N.space, sr: N.sr });
  const ab = await k.blob.arrayBuffer(), dv = new DataView(ab), n = (ab.byteLength - 44) >> 2, L = new Float32Array(n);
  for (let i = 0; i < n; i++) L[i] = (dv.getInt16(44 + i * 4, true) + dv.getInt16(46 + i * 4, true)) / 65536;
  const sr = N.sr, M = new Float32Array(out.L.length); for (let i = 0; i < M.length; i++) M[i] = (out.L[i] + out.R[i]) / 2;
  const env = (x, hop) => { const w = Math.round(sr * hop), o = []; for (let i = 0; i + w <= x.length; i += w) { let s = 0; for (let j = 0; j < w; j++) s += x[i + j] * x[i + j]; o.push(Math.sqrt(s / w)); } return o; };
  const a = env(L, 0.01), b = env(M, 0.01), nn = Math.min(a.length, b.length);
  let ma = 0, mb = 0; for (let i = 0; i < nn; i++) { ma += a[i]; mb += b[i]; } ma /= nn; mb /= nn;
  let sab = 0, saa = 0, sbb = 0; for (let i = 0; i < nn; i++) { sab += (a[i] - ma) * (b[i] - mb); saa += (a[i] - ma) ** 2; sbb += (b[i] - mb) ** 2; }
  /* where a note's sound lines up best: the render's sound from 2 ms before the note to 22 ms after, slid ±12 ms over the
     take's, the shift where they match most (a soft bass pluck has no sharp attack, but its wave is its wave). A note asked for "now" lands on one of the sound engine's 128-sample turns: within 3 ms */
  const shiftAt = t => { const a0 = Math.round((t - 0.002) * sr), n = Math.round(0.024 * sr), S = Math.round(0.012 * sr); let best = -2, bs = 0;
    for (let s = -S; s <= S; s += 4) { let xy = 0, xx = 0, yy = 0; for (let i = 0; i < n; i++) { const x = M[a0 + i] || 0, y = L[a0 + i + s] || 0; xy += x * y; xx += x * x; yy += y * y; }
      const r = xy / Math.sqrt(xx * yy + 1e-20); if (r > best) { best = r; bs = s; } }
    for (let s = bs - 4; s <= bs + 4; s++) { let xy = 0, xx = 0, yy = 0; for (let i = 0; i < n; i++) { const x = M[a0 + i] || 0, y = L[a0 + i + s] || 0; xy += x * y; xx += x * x; yy += y * y; }
      const r = xy / Math.sqrt(xx * yy + 1e-20); if (r > best) { best = r; bs = s; } }
    return { ms: bs / sr * 1000, r: best }; };
  /* only a note (or a chord) with no other note starting within 40 ms of it, so each attack is its own */
  const groups = []; ev.forEach(e => { const g = groups[groups.length - 1]; if (g && e.t - g.t < 0.002) return; groups.push({ t: e.t }); });
  const starts = groups.filter((g, i) => (!groups[i - 1] || g.t - groups[i - 1].t >= 0.04) && (!groups[i + 1] || groups[i + 1].t - g.t >= 0.04)).map(g => g.t);
  let near = 0, worst = 0; const diffs = []; starts.forEach(t => { const sh = shiftAt(t + N.lag), d = Math.abs(sh.ms); diffs.push(+sh.ms.toFixed(2) + "@" + sh.r.toFixed(2)); if (d <= 5 && sh.r > 0.5) near++; worst = Math.max(worst, d); });
  const oa = starts, ob = starts;
  const first = x => { for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > 0.002) return i / sr; return -1; };
  return { corr: +(sab / Math.sqrt(saa * sbb)).toFixed(4), onsTake: oa.length, onsRender: ob.length, near, worst, diffs: diffs.join(","), firstTake: +(first(L) * 1000).toFixed(2), firstRender: +(first(M) * 1000).toFixed(2) };
};
/* in the room: its sounds (named in English and Spanish), and the take's notes played by another of them */
const OTHER = async (pick) => {
  const k = REC.takes[0], N = k.notes, list = AOGRoomRender.sounds(), s = list.find(x => x.id === pick && x.id !== N.sound) || list.find(x => x.id !== N.sound);
  const out = await AOGRoomRender.render({ sound: s.id, was: N.sound, events: N.ev, sec: k.sec, tail: 0, set: N.set, space: N.space, sr: N.sr });
  let e = 0; for (let i = 0; i < out.L.length; i++) e += out.L[i] * out.L[i];
  return { id: s.id, rms: +Math.sqrt(e / out.L.length).toFixed(4), list: list.length, en: s.name.en, es: s.name.es, notTake: s.id !== N.sound };
};
/* the played notes found in the take's notes: the same pitch (string, player), at the time it sounded.
   A note asked for ahead (fut: a pattern's) begins exactly then: within 2 ms. A note asked for "now" (a key, a pad, a
   pluck) begins when the sound engine next takes it up, which can be well after the page's clock said "now" (the engine
   works ahead of it, more so on a busy computer): its time is when it really began (the recorder's note count marks it),
   so here it is only found near where it was asked for (100 ms); the sound itself proves its time (COMPARE, to 3 ms) */
const MATCH = (a) => {
  const N = REC.takes[0].notes, ev = N.ev, an = a.exp.find(x => x.fut) || a.exp[0];
  const e0 = ev.filter(e => Math.abs(e.m - an.m) < 0.01 && (an.s == null || e.s === an.s)).sort((x, y) => Math.abs(x.t - (an.w - a.exp[0].w) - ev[0].t) - Math.abs(y.t - (an.w - a.exp[0].w) - ev[0].t))[0];
  if (!e0) return { ok: false, why: "no first note", n: ev.length };
  const T0 = an.w - e0.t, miss = [], lo = an.fut ? -0.002 : -0.1;
  a.exp.forEach(x => { const t = x.w - T0; const e = ev.find(y => Math.abs(y.m - x.m) < 0.01 && (x.fut && an.fut ? Math.abs(y.t - t) < 0.002 : (y.t - t >= lo && y.t - t <= 0.1)) && (x.s == null || y.s === x.s) && (x.p == null || y.p === x.p));
    if (!e) { const nr = ev.filter(y => Math.abs(y.m - x.m) < 0.01).map(y => y.t.toFixed(3)).join("/"); miss.push(x.m + "@" + t.toFixed(3) + (x.s != null ? "s" + x.s : "") + (x.p ? ":" + x.p : "") + "~" + nr); } });
  return { ok: !miss.length, miss: miss.slice(0, 8), n: ev.length, exp: a.exp.length, room: N.room, sound: N.sound, lag: N.lag, first: e0 };
};
const recWait = async p => { await p.waitForFunction(() => { const r = document.getElementById("room").contentWindow.AOGStudioRec; return r && !r.on() && !r.busy(); }, null, { timeout: 12000 }); await p.waitForTimeout(400); };
/* a drum take on My Track: a click on every bar line at 120 (2 s a bar), 8 bars (as studio/overdub.js) */
const DRUMS = () => { const sr = 44100, n = Math.round(sr * (0.05 + 16.5)), ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab), w = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + n * 4, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 4, true);
  for (let k = 0; k < 8; k++) { const s0 = Math.round(sr * (0.05 + 2 * k)); for (let i = 0; i < 2000; i++) { const x = Math.round(12000 * Math.sin(i / 3) * Math.exp(-i / 400)); v.setInt16(44 + (s0 + i) * 4, x, true); v.setInt16(46 + (s0 + i) * 4, x, true); } }
  return AOGHandoff.add(AOGHandoff.INBOX, { from: "pads", n: 1, name: { en: "Drum take 1", es: "Toma de ritmos 1" }, sec: n / sr, bpm: 120, at: Date.now(), take: true, wav: new Blob([ab], { type: "audio/wav" }) }, { key: "nt|drums" }); };
const desk = p => p.evaluate(() => { const f = [...document.querySelectorAll("iframe.sh-room")].find(x => x.getAttribute("data-file") === "/music-studio.html"); return f ? true : false; });
const D = async (p, fn, arg) => { const f = await (await p.$('iframe.sh-room[data-file="/music-studio.html"]')).contentFrame(); return f.evaluate(([src, a]) => (new Function("a", "return (" + src + ")(a)"))(a), [fn.toString(), arg]); };
const deskFrame = async p => (await p.$('iframe.sh-room[data-file="/music-studio.html"]')).contentFrame();
/* in a render's sound (L, R, sr): the moment of each attack near where it is expected (the steepest rise of the loudness) */
const ATTACKS = (a) => {
  /* the loudness of the sound's quick changes (its first difference: a hammer's strike stands out from the ringing before it) */
  const { L, sr, at } = a, hop = Math.round(sr * 0.0005), e = [];
  for (let i = 1; i + 2 * hop <= L.length; i += hop) { let s = 0; for (let j = 0; j < 2 * hop; j++) { const d = L[i + j] - L[i + j - 1]; s += d * d; } e.push(10 * Math.log10(s / (2 * hop) + 1e-14)); }
  return at.map(t => { const c = Math.round(t / 0.0005), w = 40; let best = -1e9, bi = c; for (let i = Math.max(6, c - w); i < Math.min(e.length, c + w); i++) { const d = e[i] - e[i - 6]; if (d > best) { best = d; bi = i; } } return bi * 0.0005; });
};
/* the average spectrum of a sound (frames of 4096), as a list of log levels in 64 bands from 50 Hz to 10 kHz */
const SPECTRUM = (a) => {
  const { L, sr } = a, N = 4096, bands = new Float64Array(64); let frames = 0;
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let s = 0; s + N <= L.length; s += N) {
    let en = 0; for (let i = 0; i < N; i++) { re[i] = L[s + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1))); im[i] = 0; en += re[i] * re[i]; }
    if (en < 1e-6) continue;
    for (let i = 1, j = 0; i < N; i++) { let bit = N >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; } }
    for (let len = 2; len <= N; len <<= 1) { const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang), h = len >> 1;
      for (let i = 0; i < N; i += len) { let cr = 1, ci = 0; for (let k = 0; k < h; k++) { const p = i + k, q = p + h, xr = re[q] * cr - im[q] * ci, xi = re[q] * ci + im[q] * cr; re[q] = re[p] - xr; im[q] = im[p] - xi; re[p] += xr; im[p] += xi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } }
    for (let i = 1; i < N / 2; i++) { const f = i * sr / N; if (f < 50 || f > 10000) continue; const b = Math.min(63, Math.floor(Math.log(f / 50) / Math.log(200) * 64)); bands[b] += re[i] * re[i] + im[i] * im[i]; }
    frames++;
  }
  return Array.from(bands).map(x => 10 * Math.log10(x / Math.max(1, frames) + 1e-12));
};
const corrOf = (a, b) => { const n = a.length; let ma = 0, mb = 0; for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; } ma /= n; mb /= n; let s = 0, x = 0, y = 0; for (let i = 0; i < n; i++) { s += (a[i] - ma) * (b[i] - mb); x += (a[i] - ma) ** 2; y += (b[i] - mb) ** 2; } return s / Math.sqrt(x * y); };

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await ctxOf(b), p = await c.newPage();
  await p.addInitScript(() => { try { if (!sessionStorage.getItem("nt")) { localStorage.setItem("aog.overdub.v1", JSON.stringify({ on: false, from: 1 })); sessionStorage.setItem("nt", "1"); } } catch (e) {} });
  await p.goto(U + "the-studio#piano"); await arrived(p, "music-piano.html");
  await p.evaluate(() => AOGSong.set({ bpm: 120 }));
  await p.waitForTimeout(500);

  /* NT_QUICK=1: only the desk's part (for working on the piano-roll) */
  if (process.env.NT_QUICK !== "1") {
  /* ══ 1 · the piano: keys, the pedal, a chord pad, a chord pattern ══ */
  const pr = await R(p, async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    ctx(); await loadSet(SOUNDS[S.sound].set);
    AOGStudioRec.toggle(); await sleep(350);
    const exp = []; let a;
    a = ac.currentTime; noteOn("k", 60, 0.8); exp.push({ w: a, m: 60 }); await sleep(300); noteOff("k", 60);
    a = ac.currentTime; noteOn("k", 64, 0.55); exp.push({ w: a, m: 64 }); await sleep(250); noteOff("k", 64);
    setSus(true); a = ac.currentTime; noteOn("k", 67, 0.7); exp.push({ w: a, m: 67 }); await sleep(100); noteOff("k", 67); await sleep(300); setSus(false);
    a = ac.currentTime; padDown(1, 0.74); (padHeld[1] || []).forEach(m => exp.push({ w: a, m })); await sleep(400); padUp(1);
    S.prog = [{ off: 0, q: "maj" }, { off: 5, q: "maj" }]; S.rhythm = "pulse"; await start();
    const seen = new Map(); for (let k = 0; k < 14; k++) { PLAY.voices.forEach(v => { if (v.on != null) seen.set(v.m + "@" + v.on.toFixed(4), { w: v.on, m: v.m, fut: true }); }); await sleep(200); }
    const now = ac.currentTime; stop();
    seen.forEach(v => { if (v.w < now - 0.05) exp.push(v); });
    AOGStudioRec.toggle();
    return { exp, pat: seen.size, bpm: S.bpm };
  });
  await recWait(p);
  let m = await R(p, MATCH, pr);
  ok(m.ok && m.room === "piano" && m.sound === "grand" && pr.pat >= 8, "piano: the take keeps every note that sounded — two keys, a key on the pedal, a chord pad and a chord pattern (" + pr.pat + " notes), at the times they sounded: " + JSON.stringify({ n: m.n, exp: m.exp, miss: m.miss, room: m.room, sound: m.sound, lag: m.lag }));
  const pd = await R(p, () => { const N = REC.takes[0].notes, e60 = N.ev.find(e => e.m === 60), e67 = N.ev.find(e => e.m === 67), e64 = N.ev.find(e => e.m === 64);
    return { d60: e60 && e60.d, d64: e64 && e64.d, d67: e67 && e67.d, g60: e64.t - e60.t, g64: e67.t - e64.t, g67: N.ped[1] && N.ped[1].t - e67.t, v64: e64 && e64.v, ped: N.ped, lag: N.lag, set: N.set, sr: N.sr }; });
  /* each key was let go just as the next was pressed (the page's clock can move on a few ms between the two); the third was
     let go under the pedal and sounded until the pedal came up */
  ok(Math.abs(pd.d60 - pd.g60) < 0.015 && Math.abs(pd.d64 - pd.g64) < 0.015 && Math.abs(pd.d67 - pd.g67) < 0.015 && pd.d67 > 0.25 && Math.abs(pd.v64 - 0.55) < 0.001 && pd.ped.length === 2 && pd.ped[0].on === 1 && pd.ped[1].on === 0 && typeof pd.set.era === "number",
    "piano: each note's length is how long it sounded (the pedal's note until the pedal came up), its strength, the pedal down and up, the era: " + JSON.stringify(pd));
  ok(pd.lag > 0.002 && pd.lag < 0.03, "the take measures how long after a note its sound begins (the chain's own delay): " + pd.lag * 1000 + " ms");
  let cm = await R(p, COMPARE);
  ok(cm.corr > 0.9 && cm.near >= 0.9 * cm.onsRender && cm.onsRender >= 2 && Math.abs(cm.firstTake - cm.firstRender) < 5, "piano: the notes played again through the piano sound like the take: " + JSON.stringify(cm));
  await R(p, () => AOGStudioRec.add()); await p.waitForTimeout(600);
  const inb = await p.evaluate(async () => { const r = await AOGHandoff.list(AOGHandoff.INBOX), x = r.items.find(i => i.from === "piano"), it = x && await AOGHandoff.item(AOGHandoff.INBOX, x.id); return it ? { n: it.notes && it.notes.ev.length, room: it.notes && it.notes.room } : null; });
  ok(inb && inb.n > 10 && inb.room === "piano", "+ Add to My Track sends the notes with the take: " + JSON.stringify(inb));

  /* ══ 2 · the guitar: a strum and single notes ══ */
  await door(p, "guitar", "music-guitar.html");
  const gr = await R(p, async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    ctx(); await loadSound(S.sound);
    AOGStudioRec.toggle(); await sleep(350);
    const exp = [], c = { off: 0, q: "maj" }, shp = shapeFor(c); let a = ac.currentTime, k = 0;
    playChord(c, 0.8); shp.forEach((f, s) => { if (f >= 0) { exp.push({ w: a + k * 0.016, m: TUNING[s] + f, s }); k++; } });
    await sleep(900);
    a = ac.currentTime; pluckCell(1, 3, 0.7); exp.push({ w: a, m: TUNING[1] + 3, s: 1 }); await sleep(350);
    a = ac.currentTime; pluckCell(2, 2, 0.75); exp.push({ w: a, m: TUNING[2] + 2, s: 2 }); await sleep(350);
    a = ac.currentTime; pluckCell(3, 0, 0.65); exp.push({ w: a, m: TUNING[3], s: 3 }); await sleep(500);
    muteAll(); AOGStudioRec.toggle();
    return { exp, sound: S.sound };
  });
  await recWait(p);
  m = await R(p, MATCH, gr);
  const gs = await R(p, () => { const N = REC.takes[0].notes; return { strings: N.ev.map(e => e.s).join(","), z: N.ev.filter(e => e.z != null).length, rig: !!(N.set && N.set.rig), rigOf: N.set && N.set.rigOf }; });
  ok(m.ok && m.room === "guitar" && gs.rig && gs.rigOf === gr.sound, "guitar: a strum's six strings 16 ms apart and three single notes, each with its string, and the amp as it was set: " + JSON.stringify({ n: m.n, miss: m.miss, strings: gs.strings, z: gs.z, sound: m.sound }));
  cm = await R(p, COMPARE);
  ok(cm.corr > 0.9 && cm.near >= 0.9 * cm.onsRender && cm.onsRender >= 2 && Math.abs(cm.firstTake - cm.firstRender) < 5, "guitar: the notes played again through the guitar (its amp too) sound like the take: " + JSON.stringify(cm));
  const go = await R(p, OTHER, "nylon");
  ok(go.rms > 0.003 && go.list > 5 && go.en && go.es && go.notTake, "guitar: the same notes on another guitar sound (" + go.id + ") make music: " + JSON.stringify(go));

  /* ══ 3 · the bass ══ */
  await door(p, "bass", "music-bass.html");
  const br = await R(p, async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    ctx(); await loadSound(S.sound);
    AOGStudioRec.toggle(); await sleep(350);
    const exp = []; let a;
    for (const [s, f] of [[0, 3], [0, 5], [1, 2], [1, 5], [2, 2]]) { a = ac.currentTime; pluckCell(s, f, 0.78); exp.push({ w: a, m: TUNING[s] + f, s }); await sleep(380); }
    await sleep(300); muteAll(); AOGStudioRec.toggle();
    return { exp };
  });
  await recWait(p);
  m = await R(p, MATCH, br);
  ok(m.ok && m.room === "bass" && m.n === 5, "bass: five notes, each at its time, pitch and string: " + JSON.stringify({ n: m.n, miss: m.miss, sound: m.sound }));
  cm = await R(p, COMPARE);
  ok(cm.corr > 0.9 && cm.near >= 0.9 * cm.onsRender && cm.onsRender >= 2 && Math.abs(cm.firstTake - cm.firstRender) < 5, "bass: the notes played again through the bass sound like the take: " + JSON.stringify(cm));

  /* ══ 4 · the band: a key, then a chord pad (each note with its player) ══ */
  await door(p, "band", "music-band.html");
  const bd = await R(p, async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    ctx(); await loadSound(S.sound);
    AOGStudioRec.toggle(); await sleep(350);
    const exp = []; let a = ac.currentTime;
    keyOn(67, 0.8); exp.push({ w: a, m: 67, p: playerFor(67) }); await sleep(500); keyOff(67); await sleep(200);
    a = ac.currentTime; padDown(0, 0.74); LIVE.forEach((vc, key) => { if (/^p0:/.test(key)) exp.push({ w: a, m: vc.m, p: vc.inst }); }); await sleep(700); padUp(0);
    await sleep(500); AOGStudioRec.toggle();
    return { exp, sound: S.sound };
  });
  await recWait(p);
  m = await R(p, MATCH, bd);
  ok(m.ok && m.room === "band" && bd.exp.length >= 3, "band: a key and a chord pad, each note with the player who played it: " + JSON.stringify({ n: m.n, exp: m.exp, miss: m.miss, sound: m.sound }));
  cm = await R(p, COMPARE);
  ok(cm.corr > 0.9 && cm.near >= 0.9 * cm.onsRender && cm.onsRender >= 2 && Math.abs(cm.firstTake - cm.firstRender) < 5, "band: the notes played again through the band sound like the take: " + JSON.stringify(cm));
  let ot = await R(p, OTHER, "brass");
  ok(ot.rms > 0.003 && ot.list > 10 && ot.en && ot.es && ot.notTake, "band: the same notes played by another sound (" + ot.id + ", each note given to the player who reaches it) make music: " + JSON.stringify(ot));

  /* ══ 5 · over My Track: the notes on the take's cut ══ */
  await door(p, "piano", "music-piano.html");
  await p.evaluate(DRUMS);
  await p.evaluate(() => localStorage.setItem("aog.overdub.v1", JSON.stringify({ on: true, from: 1 })));
  await R(p, () => AOGStudioRec.toggle());
  await p.waitForFunction(() => document.getElementById("room").contentWindow.AOGStudioRec.on(), null, { timeout: 40000 });
  const o = await R(p, () => { const O = REC.over; return O ? { S0: O.S0, from: O.from, barSec: O.barSec, lat: O.lat } : null; });
  if (o) {
    await R(p, a => { const when = a.S0 + (3 - a.from) * a.barSec + a.lat + 0.01; const vc = makeVoice(ac, LIVE_CH, S.sound, 62, 0.85, when); if (vc) vc.stop(when + 0.5, vc.tau);
      const w2 = when + 0.5; const v2 = makeVoice(ac, LIVE_CH, S.sound, 65, 0.7, w2); if (v2) v2.stop(w2 + 0.4, v2.tau); }, o);
    const until = o.S0 + (3 - o.from + 0.7) * o.barSec + o.lat;
    for (let k = 0; k < 300 && (await R(p, () => ac.currentTime)) < until; k++) await p.waitForTimeout(100);
  }
  await R(p, () => AOGStudioRec.toggle()); await recWait(p);
  const ov = await R(p, async () => { const k = REC.takes[0], N = k.notes, ab = await k.blob.arrayBuffer(), dv = new DataView(ab), sr = dv.getUint32(24, true), n = (ab.byteLength - 44) >> 2;
    let on = -1; for (let i = 0; i < n; i++) { const l = dv.getInt16(44 + i * 4, true); if (l > 66 || l < -66) { on = i; break; } }
    return { place: k.place, ev: N && N.ev.map(e => [e.m, e.t]), firstMs: on / sr * 1000, lag: N && N.lag }; });
  ok(o && ov.place && ov.place.bar === 3 && ov.ev && ov.ev.length === 2 && ov.ev[0][0] === 62 && Math.abs(ov.ev[0][1] - 0.01) < 0.0006 && Math.abs(ov.ev[1][1] - 0.51) < 0.0006 && Math.abs(ov.ev[0][1] * 1000 + ov.lag * 1000 - ov.firstMs) < 2,
    "over My Track: the take starts on bar 3's line and its notes are on that cut (played 10 ms after the line: at 10 ms; the next at 510 ms; the sound begins at the note plus the lag): " + JSON.stringify(ov));
  await p.evaluate(() => localStorage.setItem("aog.overdub.v1", JSON.stringify({ on: false, from: 1 })));

  }
  /* ══ 6 · a sloppy line on the piano, at 120: eight 1/8 notes, up to 25 ms off ══ */
  const ERR = [0, 0.018, -0.015, 0.022, -0.02, 0.012, -0.025, 0.016], PIT = [60, 62, 64, 65, 67, 69, 71, 72];
  await R(p, async a => { const sleep = ms => new Promise(r => setTimeout(r, ms));
    ctx(); await loadSet(SOUNDS[S.sound].set);
    AOGStudioRec.toggle(); await sleep(400);
    const t0 = ac.currentTime + 0.2; a.PIT.forEach((m, k) => { const w = t0 + k * 0.25 + a.ERR[k], vc = makeVoice(ac, LIVE_CH, S.sound, m, 0.75, w); if (vc) vc.stop(w + 0.2, vc.tau); });
    await sleep(2800); AOGStudioRec.toggle(); }, { ERR, PIT });
  await recWait(p);
  const sl = await R(p, () => { const k = REC.takes[0]; return { n: k.notes.ev.length, bpm: k.bpm, sec: k.sec }; });
  ok(sl.n === 8 && sl.bpm === 120, "the sloppy line is a take of eight notes at 120: " + JSON.stringify(sl));
  await R(p, () => AOGStudioRec.add()); await p.waitForTimeout(800);

  /* ══ 7 · at the Mixing Desk: Edit the notes ══ */
  await door(p, "studio", "music-studio.html");
  await p.waitForFunction(() => { const w = document.getElementById("room").contentWindow; return w.__aogStudio && w.document.readyState === "complete" && !w.__aogStudio.S.decoding; }, null, { timeout: 30000 });
  /* the sloppy take on a track of its own */
  const ti = await R(p, async () => { const st = __aogStudio; await st.refreshInbox(); const src = st.sources().filter(o => o.kind === "take" && o.x.from === "piano" && !o.x.place).sort((a, b) => (b.x.at || 0) - (a.x.at || 0))[0];
    let ti = st.SONG.tracks.findIndex((x, i) => i < 7 && !x.clip); if (ti < 0) ti = 0; await st.putOn(src.id, ti); selectTrack(ti); await new Promise(r => setTimeout(r, 400)); return ti; });
  const cl0 = await R(p, i => { const c = __aogStudio.SONG.tracks[i].clip; const b = document.querySelector('#clipBox [data-act="notes"]'); return { notes: c.notes && c.notes.ev.length, bar: c.startBar, id: c.id, btn: b ? b.textContent : null, head: c.head, bpm: c.bpm, sec: c.sec }; }, ti);
  ok(cl0.notes === 8 && cl0.btn === "Edit the notes", "the clip on the track keeps its notes, and shows Edit the notes: " + JSON.stringify(cl0));
  /* another clip with no notes shows no button */
  const noBtn = await R(p, () => { const i = __aogStudio.SONG.tracks.findIndex(x => x.clip && !x.clip.notes); if (i < 0) return "none"; selectTrack(i); const b = !!document.querySelector('#clipBox [data-act="notes"]'); return b; });
  ok(noBtn === false || noBtn === "none", "a clip with no notes (the drums) shows no Edit the notes: " + noBtn);
  await R(p, i => selectTrack(i), ti); await p.waitForTimeout(300);
  const fr = await frameOf(p);
  await fr.click('#clipBox [data-act="notes"]');
  await p.waitForTimeout(800);
  if (process.env.AOG_SHOTS) await p.screenshot({ path: path.join(process.env.AOG_SHOTS, "notes-computer.png") });
  const ed = await R(p, () => { const S0 = AOGPianoRoll._t.ST, box = document.getElementById("apr");
    return { open: AOGPianoRoll.isOpen(), title: document.getElementById("aprH").textContent, n: document.querySelectorAll("#aprLane .apr-n").length, play: document.getElementById("aprPlay").textContent,
      tight: document.getElementById("aprTight").textContent, inst: document.getElementById("aprInstL").textContent, sounds: document.getElementById("aprInst").options.length, dialog: box.getAttribute("role") }; });
  ok(ed.open && /^Edit the notes · Piano take \d+$/.test(ed.title) && ed.n === 8 && ed.play === "Play it with the changes" && ed.tight === "Tighten the timing" && ed.inst === "Change the instrument" && ed.sounds > 20 && ed.dialog === "dialog",
    "Edit the notes opens the piano-roll over the desk, its eight notes on the grid, and the piano's own sounds to change to: " + JSON.stringify(ed));
  /* the grid: each note's sound on its beat (the first on beat 0); the sloppy ones off by up to 25 ms */
  const offs = await R(p, () => { const T = AOGPianoRoll._t, S0 = T.ST; return S0.ev.map(e => Math.round(((T.bOf(e) * S0.B) - Math.round(T.bOf(e) * 2) / 2 * S0.B) * 1000)); });
  ok(Math.abs(offs[0]) <= 2 && offs.slice(1).every((x, k) => Math.abs(x - ERR[k + 1] * 1000) <= 2), "on the grid, the notes sit where they were played: the first on the beat, the others as far off as they were (ms): " + offs.join(", "));

  /* move a note: drag the 3rd note (64) one row up */
  const box3 = async k => { const h = (await fr.$$("#aprLane .apr-n"))[k]; await h.evaluate(el => el.scrollIntoView({ block: "center", inline: "center" })); await p.waitForTimeout(100); return h.boundingBox(); };
  const idsBy = () => R(p, () => AOGPianoRoll._t.ST.ev.map(e => Object.assign({}, e)));
  let ev0 = await idsBy();
  const els = await fr.$$eval("#aprLane .apr-n", a => a.map(e => +e.getAttribute("data-id")));
  const k64 = els.indexOf(ev0.find(e => e.m === 64).id);
  let bb = await box3(k64), row = await R(p, () => AOGPianoRoll._t.ST.row);
  await p.mouse.move(bb.x + Math.min(10, bb.width / 3), bb.y + bb.height / 2); await p.mouse.down();
  await p.mouse.move(bb.x + Math.min(10, bb.width / 3), bb.y + bb.height / 2 - row * 0.6, { steps: 4 }); await p.mouse.move(bb.x + Math.min(10, bb.width / 3), bb.y + bb.height / 2 - row, { steps: 4 }); await p.mouse.up();
  await p.waitForTimeout(200);
  let ev1 = await idsBy();
  const moved = ev1.find(e => e.id === ev0.find(x => x.m === 64).id);
  ok(moved && moved.m === 65 && Math.abs(moved.t - ev0.find(x => x.m === 64).t) < 0.0002, "a note dragged one row up moves a half step (64 → 65), at the same time: " + JSON.stringify(moved));
  /* delete a note: tap it, then Delete */
  const k72 = (await fr.$$eval("#aprLane .apr-n", a => a.map(e => +e.getAttribute("data-id")))).indexOf(ev1.find(e => e.m === 72).id);
  bb = await box3(k72); await p.mouse.click(bb.x + 6, bb.y + bb.height / 2); await p.waitForTimeout(150);
  await p.keyboard.press("Delete"); await p.waitForTimeout(200);
  let ev2 = await idsBy();
  ok(ev2.length === 7 && !ev2.some(e => e.m === 72) && /^1 note deleted\.$/.test(await R(p, () => document.getElementById("aprLine").textContent)), "a tapped note and Delete removes it: " + ev2.length + " notes");
  /* add a note: tap an empty spot (bar 2's first beat, on the row of 74) */
  await R(p, () => { const S0 = AOGPianoRoll._t.ST, x = (4.0 - S0.b0) * S0.ppb + 3, y = (S0.hi - 74) * S0.row + S0.row / 2, mk = document.createElement("i");
    mk.id = "ntSpot"; mk.style.cssText = "position:absolute;width:2px;height:2px;pointer-events:none;left:" + x + "px;top:" + y + "px"; document.getElementById("aprLane").appendChild(mk); mk.scrollIntoView({ block: "center", inline: "center" }); });
  await p.waitForTimeout(150);
  const sb = await (await fr.$("#ntSpot")).boundingBox();
  await R(p, () => document.getElementById("ntSpot").remove());
  await p.mouse.click(sb.x + 1, sb.y + 1); await p.waitForTimeout(200);
  let ev3 = await idsBy();
  const added = ev3.find(e => e.m === 74);
  const addedB = added && await R(p, id => { const T = AOGPianoRoll._t, e = T.ST.ev.find(x => x.id === id); return T.bOf(e); }, added.id);
  ok(ev3.length === 8 && added && Math.abs(addedB - 4) < 1e-6, "a tap on an empty spot adds a note there, on the grid (bar 2, beat 1, D5): " + JSON.stringify({ n: ev3.length, beat: addedB }));
  /* Undo and Redo (⌘/Ctrl+Z, Ctrl+Y) */
  await p.keyboard.press("Control+z"); await p.waitForTimeout(150);
  const u1 = (await idsBy()).length;
  await p.keyboard.press("Control+z"); await p.waitForTimeout(150);
  const u2 = await idsBy();
  await p.keyboard.press("Control+y"); await p.waitForTimeout(150);
  await p.keyboard.press("Control+y"); await p.waitForTimeout(150);
  const u3 = await idsBy();
  ok(u1 === 7 && u2.length === 8 && u2.some(e => e.m === 72) && u3.length === 8 && u3.some(e => e.m === 74) && !u3.some(e => e.m === 72), "Undo takes back the added note, then the deleted one; Redo does both again: " + [u1, u2.length, u3.length].join(" → "));
  /* the keyboard: the arrows move the picked note */
  await R(p, () => { const S0 = AOGPianoRoll._t.ST, e = S0.ev.find(x => x.m === 74); S0.sel = new Set([e.id]); document.getElementById("aprScroll").focus(); });
  await p.keyboard.press("ArrowDown"); await p.keyboard.press("ArrowRight"); await p.waitForTimeout(150);
  const kb = await R(p, () => { const T = AOGPianoRoll._t, e = T.ST.ev.find(x => x.m === 73); return e ? { m: e.m, b: T.bOf(e) } : null; });
  ok(kb && Math.abs(kb.b - 4.25) < 1e-6, "↓ and → move the picked note a half step down and one step (1/16) later: " + JSON.stringify(kb));
  await p.keyboard.press("Control+z"); await p.keyboard.press("Control+z"); await p.waitForTimeout(100);
  /* drag a note's right end: it gets longer, by whole steps (two 1/16 = half a beat = 0.25 s) */
  const e62 = (await idsBy()).find(e => e.m === 62), k62 = (await fr.$$eval("#aprLane .apr-n", a => a.map(e => +e.getAttribute("data-id")))).indexOf(e62.id);
  bb = await box3(k62); const ppb = await R(p, () => AOGPianoRoll._t.ST.ppb);
  await p.mouse.move(bb.x + bb.width - 3, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(bb.x + bb.width - 3 + ppb * 0.25, bb.y + bb.height / 2, { steps: 3 }); await p.mouse.move(bb.x + bb.width - 3 + ppb * 0.5, bb.y + bb.height / 2, { steps: 3 }); await p.mouse.up();
  await p.waitForTimeout(150);
  const len = (await idsBy()).find(e => e.id === e62.id);
  ok(Math.abs(len.d - e62.d - 0.25) < 0.001 && Math.abs(len.t - e62.t) < 0.0001 && len.m === 62, "dragging a note's right end makes it longer by whole steps (" + e62.d + " s → " + len.d + " s), its start kept");
  /* Strength: the picked note's velocity */
  await R(p, () => { const el = document.getElementById("aprVel"); el.value = "40"; el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); });
  const vel = await R(p, id => ({ v: AOGPianoRoll._t.ST.ev.find(e => e.id === id).v, out: document.getElementById("aprVelO").textContent }), e62.id);
  ok(vel.v === 0.4 && vel.out === "40", "Strength sets the picked note's velocity: " + JSON.stringify(vel));
  await p.keyboard.press("Control+z"); await p.keyboard.press("Control+z"); await p.waitForTimeout(100);
  const back = (await idsBy()).find(e => e.id === e62.id);
  ok(Math.abs(back.d - e62.d) < 0.0001 && back.v === e62.v, "and Undo takes both back: " + JSON.stringify({ d: back.d, v: back.v }));
  /* drag a box over the first three notes (from an empty spot): they are picked */
  const three = await R(p, () => { const T = AOGPianoRoll._t, S0 = T.ST, ev = S0.ev.slice().sort((a, b) => a.t - b.t).slice(0, 3), sc = document.getElementById("aprScroll");
    const x0 = (T.bOf(ev[0]) - S0.b0) * S0.ppb - 14, x1 = (T.bOf(ev[2]) - S0.b0) * S0.ppb + 10, ys = ev.map(e => (S0.hi - e.m) * S0.row), y0 = Math.min.apply(null, ys) - 8, y1 = Math.max.apply(null, ys) + S0.row + 8;
    sc.scrollLeft = Math.max(0, x0 - 40); sc.scrollTop = Math.max(0, y0 - 20); document.getElementById("aprScroll").scrollIntoView({ block: "nearest" }); return { x0, x1, y0, y1, ids: ev.map(e => e.id) }; });
  await p.waitForTimeout(150);
  const lane = await (await fr.$("#aprLane")).boundingBox();
  await p.mouse.move(lane.x + three.x0, lane.y + three.y0); await p.mouse.down(); await p.mouse.move(lane.x + (three.x0 + three.x1) / 2, lane.y + (three.y0 + three.y1) / 2, { steps: 4 }); await p.mouse.move(lane.x + three.x1, lane.y + three.y1, { steps: 4 }); await p.mouse.up();
  await p.waitForTimeout(150);
  const picked = await R(p, () => ({ sel: Array.from(AOGPianoRoll._t.ST.sel).sort(), count: document.getElementById("aprCount").textContent, n: AOGPianoRoll._t.ST.ev.length }));
  if (picked.sel.length !== 3) console.log("box:", JSON.stringify(three), JSON.stringify(lane), await R(p, a => { const el = document.elementFromPoint(a.x, a.y); return el && (el.className + "|" + el.id); }, { x: lane.x + three.x0 - (await (await p.$("#room")).boundingBox()).x, y: lane.y + three.y0 - (await (await p.$("#room")).boundingBox()).y }));
  ok(picked.sel.length === 3 && three.ids.every(id => picked.sel.indexOf(id) >= 0) && picked.count === "3 picked" && picked.n === 8, "a box dragged from an empty spot picks the notes inside it: " + JSON.stringify(picked));
  /* put the line back to its eight notes (the moved 65 back to 64, the added one out, the 72 in) */
  await R(p, a => { const S0 = AOGPianoRoll._t.ST; S0.ev = S0.ev.filter(e => e.m !== 74); const e65 = S0.ev.find(e => e.m === 65 && Math.abs(e.t - a.t64) < 0.001); if (e65) e65.m = 64;
    if (!S0.ev.some(e => e.m === 72)) S0.ev.push(Object.assign({ id: 9999 }, a.e72)); S0.sel.clear(); AOGPianoRoll._t.act("all"); }, { t64: ev0.find(x => x.m === 64).t, e72: ev0.find(x => x.m === 72) });

  /* ══ Tighten the timing: 1/8, all the way ══ */
  await fr.selectOption("#aprGrid", "8"); await fr.selectOption("#aprAmt", "1");
  await fr.click("#aprTight"); await p.waitForTimeout(200);
  const q = await R(p, () => { const T = AOGPianoRoll._t; return { off: T.ST.ev.map(e => +(((T.bOf(e) * 2) - Math.round(T.bOf(e) * 2)) * T.ST.B / 2 * 1000).toFixed(3)), line: document.getElementById("aprLine").textContent }; });
  ok(q.off.every(x => Math.abs(x) < 0.2) && /^8 notes line up on 1\/8 now\.$/.test(q.line), "Tighten the timing puts every note on the 1/8 grid: " + JSON.stringify(q));
  /* Play it with the changes: the piano plays the notes again; measure the attacks */
  await fr.click("#aprPlay");
  await p.waitForFunction(() => { const w = document.getElementById("room").contentWindow, S0 = w.AOGPianoRoll._t.ST; return S0 && (S0.fresh || /not work/.test(w.document.getElementById("aprLine").textContent)); }, null, { timeout: 60000 });
  const after = await R(p, () => { const S0 = AOGPianoRoll._t.ST, f = S0.fresh; return f ? { L: Array.from(f.out.L), sr: f.out.sr, line: document.getElementById("aprLine").textContent, hearNew: !document.getElementById("aprHearNew").hidden, keepNew: !document.getElementById("aprKeepNew").hidden, keepOld: !document.getElementById("aprKeepOld").hidden, head: S0.head, lag: S0.lag } : null; });
  const before = await R(p, i => { const st = __aogStudio, c = st.SONG.tracks[i].clip, B = st.BUF.get(c.id); return { L: Array.from(B.getChannelData(0)), sr: B.sampleRate }; }, ti);
  if (!after) console.log("render:", await R(p, () => AOGPianoRoll._t.ST.err + " · " + document.getElementById("aprLine").textContent));
  ok(after && after.line === "Ready. Hear it, then pick one." && after.hearNew && after.keepNew && after.keepOld, "Play it with the changes plays the notes through the piano, then offers Hear the new one, Hear the old one, Keep the new one, Keep the old one: " + (after && after.line));
  /* each note's sound, measured on its own: the piano plays that one note again (through the Studio, as the editor does) and
     its first sound is found as the recorder finds a take's (−54 dB); the notes as played and as tightened */
  const evNew = await R(p, () => AOGPianoRoll._t.payload()), evOld = await R(p, i => __aogStudio.SONG.tracks[i].clip.notes, ti);
  const firsts = (list, N) => p.evaluate(async a => { const out = [];
    for (const e of a.list) { const r = await AOGStudioShell.renderNotes("piano", { sound: a.sound, events: [e], sec: e.t + 0.4, tail: 0, set: a.set, space: a.space, sr: a.sr });
      let on = -1; for (let i = 0; i < r.L.length; i++) if (Math.abs(r.L[i]) > 66 / 32768 || Math.abs(r.R[i]) > 66 / 32768) { on = i; break; } out.push(on / r.sr); }
    return out; }, { list: list.filter(e => e.m !== 74), sound: N.sound, set: N.set, space: N.space, sr: N.sr });
  const atNew = await firsts(evNew.events, Object.assign({}, evOld, { sound: evNew.sound })), atOld = await firsts(evOld.ev, evOld);
  const dNew = atNew.map((t, k) => +((t - atNew[0] - k * 0.25) * 1000).toFixed(1)), dOld = atOld.map((t, k) => +((t - atOld[0] - k * 0.25) * 1000).toFixed(1));
  ok(dOld.every((x, k) => Math.abs(x - ERR[k] * 1000) <= 3), "the attacks are measured right: in the take they are as far off as they were played (ms): " + dOld.join(", "));
  ok(dNew.every(x => Math.abs(x) <= 5) && Math.abs(atNew[0] - after.head) < 0.005, "the re-rendered attacks are on the 1/8 grid (ms off): " + dNew.join(", ") + "; the first sound begins on the clip's first beat (" + (atNew[0] * 1000).toFixed(1) + " ms, its beat at " + after.head * 1000 + " ms)");
  /* Keep the new one: the clip's sound is replaced, its bar kept, its notes saved */
  await fr.click("#aprKeepNew"); await p.waitForTimeout(800);
  const kept = await R(p, a => { const st = __aogStudio, c = st.SONG.tracks[a.i].clip, B = st.BUF.get(c.id); return { id: c.id, bar: c.startBar, notes: c.notes && c.notes.ev.length, line: document.getElementById("aprLine").textContent, len: B && B.length, same: c.id === a.id,
    saved: (JSON.parse(localStorage.getItem("aog.studio.v1")).tracks[a.i].clip.notes || {}).ev.length }; }, { i: ti, id: cl0.id });
  ok(!kept.same && kept.bar === cl0.bar && kept.notes === 8 && kept.saved === 8 && kept.line === "The new one is on the track, in the same place." && kept.len >= after.L.length - 1, "Keep the new one: the clip's sound is the new one, on the same bar, its notes saved with the song: " + JSON.stringify(kept));
  const deskQ = await R(p, i => { const st = __aogStudio, c = st.SONG.tracks[i].clip, B = st.BUF.get(c.id); return Array.from(B.getChannelData(0)); }, ti);
  let dmax = 0; for (let i = 0; i < Math.min(deskQ.length, after.L.length); i++) dmax = Math.max(dmax, Math.abs(deskQ[i] - after.L[i]));
  ok(deskQ.length >= after.L.length - 1 && dmax < 1e-6, "the desk now plays the tightened line (its sound is the new one, sample for sample): " + dmax);

  /* ══ Change the instrument ══ */
  const inst = await R(p, () => [...document.getElementById("aprInst").options].map(o => o.value));
  const other = inst.indexOf("rockorgan") >= 0 ? "rockorgan" : inst.find(x => x !== "grand");
  await fr.selectOption("#aprInst", other); await p.waitForTimeout(200);
  const chLine = await R(p, () => document.getElementById("aprLine").textContent);
  await fr.click("#aprPlay");
  await p.waitForFunction(() => { const w = document.getElementById("room").contentWindow, S0 = w.AOGPianoRoll._t.ST; return S0 && (S0.fresh || /not work/.test(w.document.getElementById("aprLine").textContent)); }, null, { timeout: 90000 });
  const org = await R(p, () => { const f = AOGPianoRoll._t.ST.fresh; return f ? { L: Array.from(f.out.L), sr: f.out.sr, sound: f.sound } : null; });
  const s1 = await p.evaluate(SPECTRUM, { L: after.L, sr: after.sr }), s2 = await p.evaluate(SPECTRUM, { L: org.L, sr: org.sr });
  /* how far apart the two spectra are: the mean difference of the bands, in dB, with the two brought to one level */
  const m1 = s1.reduce((a, x) => a + x, 0) / s1.length, m2 = s2.reduce((a, x) => a + x, 0) / s2.length, dist = s1.reduce((a, x, k) => a + Math.abs((x - m1) - (s2[k] - m2)), 0) / s1.length;
  const cen = s => { let w = 0, f = 0; s.forEach((x, k) => { const pw = Math.pow(10, x / 10), hz = 50 * Math.pow(200, (k + 0.5) / 64); w += pw; f += pw * hz; }); return f / w; };
  const c1 = cen(s1), c2 = cen(s2);
  ok(org && org.sound === other && /^Now .+\. Press Play it with the changes to hear it\.$/.test(chLine) && dist > 3, "Change the instrument (" + other + "): the notes played again on it sound different (spectra " + dist.toFixed(1) + " dB apart; brightness " + Math.round(c1) + " Hz → " + Math.round(c2) + " Hz): " + chLine);
  await fr.click("#aprKeepNew"); await p.waitForTimeout(800);
  const kept2 = await R(p, i => { const c = __aogStudio.SONG.tracks[i].clip; return { sound: c.notes.sound, bar: c.startBar }; }, ti);
  ok(kept2.sound === other && kept2.bar === cl0.bar, "kept: the clip's notes say the new instrument, on the same bar: " + JSON.stringify(kept2));
  /* ══ the pitch: an octave up and a half step down, then Undo and Redo ══ */
  const pitches = () => R(p, () => AOGPianoRoll._t.ST.ev.map(e => e.m).sort((a, b) => a - b).join(","));
  const p0 = await pitches();
  await R(p, () => AOGPianoRoll._t.act("all"));
  await fr.click("#aprP4"); await p.waitForTimeout(100); const pUp = await pitches();
  await fr.click("#aprP1"); await p.waitForTimeout(100); const pDn = await pitches();
  await fr.click("#aprUndo"); await fr.click("#aprUndo"); await p.waitForTimeout(100); const pBack = await pitches();
  await fr.click("#aprRedo"); await p.waitForTimeout(100); const pRe = await pitches();
  const sh = s => s.split(",").map(Number);
  ok(sh(pUp).every((x, k) => x === sh(p0)[k] + 12) && sh(pDn).every((x, k) => x === sh(p0)[k] + 11) && pBack === p0 && sh(pRe).every((x, k) => x === sh(p0)[k] + 12), "Octave up, then Half step down move every picked note; Undo twice takes both back; Redo puts the octave back: " + [p0, pUp, pDn, pBack, pRe].join(" | "));
  await fr.click("#aprUndo"); await p.waitForTimeout(100);
  /* Done closes the editor; the desk's own keys work again */
  await fr.click("#aprDone"); await p.waitForTimeout(300);
  const closed = await R(p, () => ({ open: AOGPianoRoll.isOpen(), box: !!document.getElementById("apr"), lock: document.documentElement.classList.contains("apr-open") }));
  ok(!closed.open && !closed.box && !closed.lock, "Done closes the piano-roll: " + JSON.stringify(closed));

  /* ══ the notes survive a reload and the .aogsong file ══ */
  await p.reload(); await arrived(p, "music-studio.html");
  await p.waitForFunction(() => { const w = document.getElementById("room").contentWindow; return w.__aogStudio && !w.__aogStudio.S.decoding; }, null, { timeout: 30000 });
  await p.waitForTimeout(800);
  const rl = await R(p, i => { const st = __aogStudio, c = st.SONG.tracks[i].clip; selectTrack(i); const b = document.querySelector('#clipBox [data-act="notes"]'); return { notes: c && c.notes && c.notes.ev.length, sound: c && c.notes.sound, buf: !!(c && st.BUF.get(c.id)), btn: b && b.textContent }; }, ti);
  ok(rl.notes === 8 && rl.sound === other && rl.buf && rl.btn === "Edit the notes", "after a reload the clip still has its notes, its new sound and Edit the notes: " + JSON.stringify(rl));
  const sf = await R(p, async i => { const st = __aogStudio, blob = await st.songFile(), r = await st.readSongFile(blob), c = r.song.tracks[i].clip;
    const out = { size: blob.size, notes: c && c.notes && c.notes.ev.length, sound: c && c.notes.sound, room: c && c.notes.room };
    await st.applySong(r); const c2 = st.SONG.tracks[i].clip; out.after = c2 && c2.notes && c2.notes.ev.length;
    const ab = await blob.arrayBuffer(); let s = ""; const u = new Uint8Array(ab); for (let k = 0; k < u.length; k += 0x8000) s += String.fromCharCode.apply(null, u.subarray(k, k + 0x8000)); out.b64 = btoa(s);
    return out; }, ti);
  ok(sf.notes === 8 && sf.sound === other && sf.room === "piano" && sf.after === 8, "the .aogsong file carries the notes, and opening it puts them back: " + JSON.stringify(Object.assign({}, sf, { b64: undefined })));
  /* a song file with bad notes in it: they are checked, a bad note left out, the song still opens */
  const bad = await R(p, () => { const st = __aogStudio, c = { id: "cabcdef", src: "studioinbox", sec: 2, body: 2, notes: { room: "piano", sound: "grand", ev: [{ t: 0.1, m: 60, v: 0.5, d: 0.3 }, { t: -4, m: 60, v: 0.5, d: 1 }, { t: 0.2, m: 900, d: 1 }, "x", { t: 0.3, m: 64, v: 2, d: 0.2, o: { evil: "<script>" } }] } };
    const o = st.cleanClip(c); return { n: o && o.notes && o.notes.ev.length, v: o && o.notes.ev[1] && o.notes.ev[1].v, o: o && o.notes.ev[1] && o.notes.ev[1].o, room: st.cleanClip(Object.assign({}, c, { notes: { room: "kazoo", ev: [{ t: 0, m: 60, d: 1 }] } })).notes }; });
  ok(bad.n === 2 && bad.v === 1 && bad.o === undefined && bad.room === undefined, "notes from a file are checked: a bad note is left out, a strength kept between 0 and 1, an unknown room's notes dropped: " + JSON.stringify(bad));

  /* ══ Spanish ══ */
  await p.click('.sh-lang button[data-lang="es"]'); await p.waitForTimeout(1500);
  await arrived(p, "music-studio.html");
  const es = await R(p, async i => { selectTrack(i); await new Promise(r => setTimeout(r, 300)); const b = document.querySelector('#clipBox [data-act="notes"]'); const t = b && b.textContent; b.click(); await new Promise(r => setTimeout(r, 600));
    const g = id => document.getElementById(id).textContent;
    const o = { btn: t, title: g("aprH"), play: g("aprPlay"), tight: g("aprTight"), inst: g("aprInstL"), say: g("aprSay"), done: g("aprDone"), oct: g("aprP4"), all: g("aprAll"), snap: g("aprSnapL"), g4: document.getElementById("aprGrid").options[0].textContent, aria: document.getElementById("aprScroll").getAttribute("aria-label") };
    AOGPianoRoll.close(); return o; }, ti);
  ok(es.btn === "Editar las notas" && /^Editar las notas · /.test(es.title) && es.play === "Tocarlo con los cambios" && es.tight === "Ajustar el tiempo" && es.inst === "Cambiar el instrumento" && es.done === "Listo" && es.oct === "Octava arriba" && es.all === "Elegir todas" && es.snap === "Las notas caen en" && es.g4 === "1/4 (el pulso)" && /^Las notas\./.test(es.aria) && /^Toca una nota/.test(es.say),
    "in Spanish: " + JSON.stringify(es));
  await p.click('.sh-lang button[data-lang="en"]'); await p.waitForTimeout(800);

  /* ══ a desk on its own (no Studio around it, as the site's checks open it): the editor opens the room itself, out of sight ══ */
  const p3 = await c.newPage();
  await p3.goto(U + "music-studio.html"); await p3.waitForFunction(() => window.__aogStudio && !__aogStudio.S.decoding, null, { timeout: 30000 });
  await p3.waitForTimeout(500);
  const solo = await p3.evaluate(async i => { selectTrack(i); await new Promise(r => setTimeout(r, 300)); document.querySelector('#clipBox [data-act="notes"]').click();
    const T = AOGPianoRoll._t; for (let k = 0; k < 150 && !(T.ST.sounds && T.ST.sounds.length); k++) await new Promise(r => setTimeout(r, 200));
    document.getElementById("aprPlay").click(); for (let k = 0; k < 300 && !T.ST.fresh && !/not work/.test(document.getElementById("aprLine").textContent); k++) await new Promise(r => setTimeout(r, 200));
    const f = T.ST.fresh; let e = 0; if (f) for (let j = 0; j < f.out.L.length; j++) e += f.out.L[j] * f.out.L[j];
    const r = { sounds: T.ST.sounds ? T.ST.sounds.length : 0, rendered: !!f, rms: f ? Math.sqrt(e / f.out.L.length) : 0, frame: !!document.querySelector('iframe[src="/music-piano.html"]') }; AOGPianoRoll.close(); return r; }, ti);
  ok(solo.sounds > 20 && solo.rendered && solo.rms > 0.003 && solo.frame, "a desk on its own: the editor opens the piano out of sight itself, lists its sounds and plays the notes: " + JSON.stringify(solo));
  await p3.close();
  await c.close();

  /* ══ iPhone and iPad, light and dark: readable, calm, 44 px, the grid scrolls inside itself ══ */
  const SONGB64 = sf.b64;
  for (const dev of [{ name: "iPhone", viewport: { width: 390, height: 844 } }, { name: "iPad", viewport: { width: 820, height: 1180 } }]) {
    for (const theme of ["light", "dark"]) {
      const cx = await ctxOf(b, { viewport: dev.viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }, theme), q2 = await cx.newPage();
      await q2.goto(U2 + "the-studio#studio"); await arrived(q2, "music-studio.html");
      await q2.waitForFunction(() => { const w = document.getElementById("room").contentWindow; return w.__aogStudio && !w.__aogStudio.S.decoding; }, null, { timeout: 30000 });
      const r2 = await R(q2, async a => { const st = __aogStudio, bin = atob(a.b64), u = new Uint8Array(bin.length); for (let k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k);
        const r = await st.readSongFile(new Blob([u])); await st.applySong(r); selectTrack(a.i); await new Promise(z => setTimeout(z, 400));
        const b = document.querySelector('#clipBox [data-act="notes"]'); if (!b) return { btn: false }; b.click(); await new Promise(z => setTimeout(z, 900));
        return { btn: true, open: AOGPianoRoll.isOpen() }; }, { b64: SONGB64, i: ti });
      await q2.waitForTimeout(500);
      const f2 = await frameOf(q2);
      const look = await f2.evaluate(() => { const sc = document.getElementById("aprScroll"), small = [...document.querySelectorAll("#apr .apr-b, #apr select")].filter(e => e.getClientRects().length && e.getBoundingClientRect().height < 43.5).map(e => e.id || e.textContent);
        return { side: document.documentElement.scrollWidth - innerWidth, inner: sc.scrollWidth > sc.clientWidth + 10, small, row: AOGPianoRoll._t.ST.row, anim: document.getAnimations().filter(a => a.playState === "running").length }; });
      if (process.env.AOG_SHOTS) await q2.screenshot({ path: path.join(process.env.AOG_SHOTS, "notes-" + dev.name + "-" + theme + ".png") });
      const pc = await f2.evaluate(`(${PROBE})()`), pk = await f2.evaluate(`(${CALM})()`), top = await q2.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      ok(r2.btn && r2.open && look.side <= 2 && top <= 2 && look.inner && !look.small.length && look.row === 44 && !look.anim && !pc.length && !pk.length,
        dev.name + " (" + theme + "): the piano-roll is readable and calm, its buttons 44 px, its rows 44 px, the grid scrolls inside itself, the page never sideways: " + JSON.stringify({ look, contrast: pc.slice(0, 3), calm: pk, top }));
      await cx.close();
    }
  }

  ok(errs.length === 0, "no page errors " + errs.slice(0, 6).join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); srv2.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
