/* AOG-DESK-MORE-V1 (part 2 of 2) — Jimmy's 9, 11 and 12 at the Mixing Desk:
   · takes and comping (AOG-DESK-TAKES-V1): a second Guitar take (440 Hz) put on the track that holds the first (330 Hz)
     with Add as another take; two take lanes under the track; a tap on bar 3 of Take 1 makes Take 1 play there and only
     there, the switch exactly on the bar lines (an equal-power crossfade of 10 ms, measured sample by sample), no click;
     a drag along it chooses bars 5 to 6; the panel's Use it there; Undo and Redo; Remove take; the speakers play the
     same as the bounce; the voice's Record again keeps the earlier take as a take lane; a reload and a song file keep it;
   · song sections (AOG-DESK-SECTIONS-V1): + Mark a section, its name (from the list, or your own words), its bars (the
     menus, and its edge dragged with the mouse, on a bar), Copy this section after itself and to the end: the copy is the
     section's sound to the sample, what came after it is the same sound later, the drawn line comes along; Undo;
   · the clipboard: Copy a piece, Paste it on an empty track at bar 9 (the very same sound, 8 bars later); Cut and Paste
     at the playhead; a track that holds another recording says so;
   · Split at the playhead (stopped: the start bar; playing: on the beat), Reverse a piece (a click 0.5 s in is heard
     0.5 s before the end), Pitch +7 semitones (330 Hz becomes 494 Hz, and it lasts just as long), −12;
   · Spanish; an iPhone and an iPad, light and dark (a finger taps a take lane): readable, calm, nothing sideways; and
     inside the Recording Studio. Port 9280. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), os = require("os");
const PORT = 9280, U = "http://localhost:" + PORT + "/";
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
/* the pretend microphone (as studio/voice): a steady 330 Hz tone */
const MIC = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "more2-")), "tone.wav");
(() => { const sr = 48000, n = sr * 30, b = Buffer.alloc(44 + n * 2); b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(9000 * Math.sin(2 * Math.PI * 330 * i / sr)), 44 + i * 2); fs.writeFileSync(MIC, b); })();
/* the takes and the helpers are studio/more's */
const SRC = fs.readFileSync(path.join(__dirname, "more.js"), "utf8");
const TAKE = SRC.slice(SRC.indexOf("const TAKE = `") + 14, SRC.indexOf("})`;", SRC.indexOf("const TAKE = `")) + 2);
const h0 = SRC.indexOf("const HELP = `") + 14, HELP0 = SRC.slice(h0, SRC.indexOf("})();`;", h0) + 5);
/* and a little more: the two takes' share of a mix, in short windows (least squares), the live recording's tones */
const HELP = HELP0.replace("return T; })();", `
  /* how much of a take is heard over a short window: Take 1 is on the left only, Take 2 on the right only */
  T.share = (name, ref, ch, t, w) => { const M = T.B[name][ch], A = T.B[ref][ch], i0 = Math.round((t - w / 2) * sr), n = Math.round(w * sr); let aa = 0, ma = 0;
    for (let i = i0; i < i0 + n; i++) { aa += A[i] * A[i]; ma += M[i] * A[i]; } return ma / aa; };
  T.d2 = (name, t0, t1, ch) => { const d = T.B[name][ch || "L"]; let m = 0; for (let i = Math.round(t0 * sr) + 2; i < Math.round(t1 * sr); i++) m = Math.max(m, Math.abs(d[i] - 2 * d[i - 1] + d[i - 2])); return m; };
  T.ltone = (ct, f, w, ch) => { const r = T.live, a = Math.round(ct * T.lsr - r.f0), N = Math.round(w * T.lsr), k = 2 * Math.cos(2 * Math.PI * f / T.lsr); let s1 = 0, s2 = 0;
    for (let i = 0; i < N; i++) { const x = r[ch || "L"][a + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)), s0 = x + k * s1 - s2; s2 = s1; s1 = s0; } return 10 * Math.log10((s1 * s1 + s2 * s2 - k * s1 * s2) / (N * N) + 1e-30); };
  T.same = (a, b, t0, t1, sh, skip) => { const A = T.B[a], Bb = T.B[b], o = Math.round(sh * sr); let m = 0;
    for (let i = Math.round(t0 * sr); i < Math.round(t1 * sr); i++) { const ts = i / sr; if ((skip || []).some(s => Math.abs(ts - s) < 0.015)) continue; const j = i - o; if (j < 0 || j >= A.L.length || i >= Bb.L.length) continue;
      m = Math.max(m, Math.abs(Bb.L[i] - A.L[j]), Math.abs(Bb.R[i] - A.R[j])); } return m; };
  T.hz = (name, t, w) => { const d = T.B[name].L, a = Math.round(t * sr), n = Math.round(w * sr); let up = 0, f = -1, l = -1;
    for (let i = a + 1; i < a + n; i++) if (d[i - 1] < 0 && d[i] >= 0) { const x = i - 1 + d[i - 1] / (d[i - 1] - d[i]); if (f < 0) f = x; l = x; up++; } return (up - 1) / ((l - f) / sr); };
  T.lastLoud = (name, thr) => { const d = T.B[name].L; for (let i = d.length - 1; i >= 0; i--) if (Math.abs(d[i]) > thr) return i / sr; return -1; };
  return T; })();`);
const add = (p, o) => p.evaluate(`(${TAKE})(${JSON.stringify(o)})`);
const NM = { guitar: "Guitar take", bass: "Bass take", piano: "Piano take" };
async function put(p, from, n, track) {
  await p.selectOption("#trackSel", String(track));
  const v = await p.evaluate(nm => [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === nm).value, NM[from] + " " + n);
  await p.selectOption("#srcSel", v); await p.click("#putBtn");
  await p.waitForFunction(t => __aogStudio.SONG.tracks[t].clip && !__aogStudio.S.busy, track, { timeout: 15000 });
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const ready = p => p.waitForFunction(() => window.__aogStudio && !__aogStudio.S.decoding && __aogStudio.SONG.tracks.every(x => !x.clip || __aogStudio.BUF.has(x.clip.id)), null, { timeout: 30000 });
/* a point on a lane of the song: beat b of the element el (a take lane, the sections strip) */
const at = (p, sel, beat) => p.evaluate(([sel, beat]) => { const el = document.querySelector(sel); el.scrollIntoView({ block: "center" }); const r = el.getBoundingClientRect(), W = __aogStudio.tlBars() * 4; return { x: r.left + beat / W * r.width, y: r.top + r.height / 2 }; }, [sel, beat]);

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--use-file-for-fake-audio-capture=" + MIC] });
  /* ═══ A · takes ═══ */
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage();
  await p.goto(U + "music-studio.html"); await p.waitForTimeout(700);
  await add(p, { n: 1, f: [330], bars: 6, ch: "L" }); await add(p, { n: 2, f: [440], bars: 6, ch: "R" });   /* Take 1 on the left, Take 2 on the right */
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 2, null, { timeout: 8000 });
  await put(p, "guitar", 1, 0);
  await p.evaluate(HELP);
  await p.evaluate(() => { __aogStudio.SONG.master.glue = 0; __aogStudio.songChanged(); });
  /* the newest take, of the same room, on a track that holds one: Put it on, or Add as another take */
  const v2 = await p.evaluate(() => [...document.querySelectorAll("#srcSel option")].find(o => /^Guitar take 2/.test(o.textContent)).value);
  await p.selectOption("#srcSel", v2); await p.waitForTimeout(60);
  const tb = await p.evaluate(() => ({ put: document.getElementById("putBtn").textContent, take: document.getElementById("takeBtn").textContent, hid: document.getElementById("takeBtn").hidden, vis: !!document.getElementById("takeBtn").offsetParent }));
  await p.selectOption("#trackSel", "1"); await p.waitForTimeout(40);
  const tb1 = await p.evaluate(() => document.getElementById("takeBtn").hidden);
  await p.selectOption("#trackSel", "0"); await p.waitForTimeout(40);
  ok(tb.put === "Put it on track 1" && tb.take === "Add as another take" && !tb.hid && tb.vis && tb1, "a take of the same room for a track that holds one: Put it on track 1, or Add as another take (not offered on an empty track) " + JSON.stringify(tb));
  const id1 = await p.evaluate(() => __aogStudio.SONG.tracks[0].clip.id);
  await p.click("#takeBtn"); await p.waitForFunction(() => __aogStudio.SONG.tracks[0].takes && !__aogStudio.S.busy, null, { timeout: 15000 }); await p.waitForTimeout(100);
  const t0 = await p.evaluate(() => { const x = __aogStudio.SONG.tracks[0]; return { main: x.clip.name, takes: x.takes.map(c => c.id), bar: x.clip.startBar, lanes: [...document.querySelectorAll('#timeline .st-tkr[data-tkr="0"] .st-tkn')].map(e => e.textContent).join(" | "),
    line: document.getElementById("mtLine").textContent, menu: document.getElementById("mtSel").value, opt: document.querySelector('#mtSel option[value="tk"]').textContent, aria: document.querySelector('#timeline .st-tkt').getAttribute("aria-label"), buf: x.takes.every(c => __aogStudio.BUF.has(c.id)) }; });
  ok(t0.main === "Guitar take 2" && t0.takes.join() === id1 && t0.bar === 1 && t0.lanes === "Take 1 | Take 2" && t0.line === "Take 2 is on track 1 and plays now. Tap a take's lane to choose." && t0.menu === "tk" && t0.opt === "Takes · 2" && t0.buf
    && t0.aria === "Take 1 on track 1. Tap a bar to use this take there, or drag along it.", "Add as another take: Take 2 is on track 1, on the same bars, and plays; Take 1 stays; two take lanes under the track " + JSON.stringify(t0));
  await p.evaluate(() => __T.render("r440"));
  await p.evaluate(id => { __aogStudio.SONG.tracks[0].comp = [[0, 512, id]]; __aogStudio.songChanged(); }, id1); await p.evaluate(() => __T.render("r330"));
  await p.evaluate(() => { delete __aogStudio.SONG.tracks[0].comp; __aogStudio.songChanged(); });
  const lv0 = await p.evaluate(() => [1.2, 6.0, 9.0].map(t => +(__T.tone("r440", 330, t, 0.5, "L") - __T.tone("r440", 440, t, 0.5, "R")).toFixed(1)));
  ok(lv0.every(d => d < -60), "until a take is chosen, the newest plays everywhere: 330 Hz is " + lv0.join(", ") + " dB under 440 Hz");
  /* a tap on bar 3 of Take 1 */
  const u0 = await p.evaluate(() => __aogStudio.UNDO.length);
  let pt = await at(p, `#timeline .st-tkt[data-tk="${id1}"]`, 9.3); await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(120);
  const r1 = await p.evaluate(() => ({ comp: JSON.stringify(__aogStudio.SONG.tracks[0].comp), line: document.getElementById("mtLine").textContent, u: __aogStudio.UNDO.length,
    lit: [...document.querySelectorAll('#timeline .st-tkr[data-tkr="0"]')].map(r => r.querySelectorAll(".st-tkon").length).join(",") }));
  ok(r1.comp === `[[8,12,"${id1}"]]` && r1.line === "Take 1 plays bar 3." && r1.u === u0 + 1 && r1.lit === "1,2", "a tap on bar 3 of Take 1: Take 1 plays bar 3, one Undo step; the lanes light what plays " + JSON.stringify(r1));
  await p.evaluate(() => __T.render("comp"));
  const sw = await p.evaluate(() => { const o = {}; [4.785, 4.796, 4.8, 4.804, 4.815, 7.185, 7.2, 7.215].forEach(t => { o[t] = [+__T.share("comp", "r330", "L", t, 0.001).toFixed(3), +__T.share("comp", "r440", "R", t, 0.001).toFixed(3)]; }); return o; });
  const g = t => sw[t][0], h = t => sw[t][1];
  const want = { 4.785: 0, 4.796: Math.sin(Math.PI / 2 * 0.1), 4.8: Math.SQRT1_2, 4.804: Math.sin(Math.PI / 2 * 0.9), 4.815: 1 };
  ok(Object.keys(want).every(t => near(g(t), want[t], 0.06) && near(g(t) * g(t) + h(t) * h(t), 1, 0.08)) && near(g(7.2), Math.SQRT1_2, 0.06) && g(7.215) < 0.05 && g(7.185) > 0.95,
    "the switch is on the bar line: Take 1's share is 0 → 0.16 → 0.71 → 0.99 → 1 from 15 ms before bar 3 to 15 ms after it, equal power (the two shares' squares add to 1), and back at bar 4: " + JSON.stringify(sw));
  const cl = await p.evaluate(() => ({ L: __T.d2("comp", 4.78, 4.82, "L") / __T.d2("comp", 6.0, 6.1, "L"), R: __T.d2("comp", 4.78, 4.82, "R") / __T.d2("comp", 2.0, 2.1, "R"),
    L2: __T.d2("comp", 7.18, 7.22, "L") / __T.d2("comp", 6.0, 6.1, "L"), R2: __T.d2("comp", 7.18, 7.22, "R") / __T.d2("comp", 2.0, 2.1, "R") }));
  ok(Object.values(cl).every(v => v <= 1.2), "no click: at both switches the sharpest bend of each take's wave is no sharper than its steady tone's (" + Object.entries(cl).map(([k, v]) => k + " " + v.toFixed(2)).join(", ") + ")");
  const lv1 = await p.evaluate(() => [[2.0, 440], [5.5, 330], [8.0, 440]].map(([t, f]) => +(f === 330 ? __T.tone("comp", 330, t, 0.5, "L") - __T.tone("comp", 440, t, 0.5, "R") : __T.tone("comp", 440, t, 0.5, "R") - __T.tone("comp", 330, t, 0.5, "L")).toFixed(1)));
  ok(lv1.every(d => d > 60), "bar 2 is Take 2, bar 3 Take 1, bar 4 Take 2 again: " + lv1.join(", ") + " dB over the other");
  /* a drag along Take 1 from bar 5 to the end of bar 6 (Snap on: on the beat) */
  const d0 = await at(p, `#timeline .st-tkt[data-tk="${id1}"]`, 16.2), d1 = await at(p, `#timeline .st-tkt[data-tk="${id1}"]`, 23.7);
  await p.mouse.move(d0.x, d0.y); await p.mouse.down(); for (let k = 1; k <= 12; k++) await p.mouse.move(d0.x + (d1.x - d0.x) * k / 12, d0.y); await p.mouse.up(); await p.waitForTimeout(120);
  const r2 = await p.evaluate(() => ({ comp: JSON.stringify(__aogStudio.SONG.tracks[0].comp), line: document.getElementById("mtLine").textContent }));
  ok(r2.comp === `[[8,12,"${id1}"],[16,24,"${id1}"]]` && r2.line === "Take 1 plays bar 3 and bars 5 to 6.", "a drag along Take 1 over bars 5 and 6 chooses them, on the beat: " + JSON.stringify(r2));
  const pan = await p.evaluate(() => [...document.querySelectorAll("#moreBox .st-tkl .st-cn")].map(e => e.textContent).join(" / "));
  ok(/plays bar 3 and bars 5 to 6$/.test(pan.split(" / ")[0]) && /plays bars 1 to 2 and bar 4$/.test(pan.split(" / ")[1]), "the Takes panel says where each take plays: " + pan);
  /* the speakers play the chosen bits as the bounce does */
  await p.evaluate(() => __T.render("comp2"));
  const lat = await p.evaluate(async () => (await __aogStudio.chainLatency()) / 44100);
  await p.evaluate(() => { const s = document.getElementById("startSel"); s.value = "2"; s.dispatchEvent(new Event("change", { bubbles: true })); });
  await p.evaluate(() => __T.recOn());
  const w = await p.evaluate(() => { __aogStudio.play(); return Object.assign({}, __aogStudio.PLAY.wins[0]); });
  await p.waitForTimeout(8600); await p.evaluate(() => __aogStudio.stop()); await p.waitForTimeout(200); await p.evaluate(() => __T.recOff());
  const lvL = await p.evaluate(([w, lat]) => [3.5, 5.5, 8.0, 9.8].map(s => { const ct = w.at + (s - w.from) + lat;
    return { s, l330: +__T.ltone(ct, 330, 0.4, "L").toFixed(1), m330: +__T.tone("comp2", 330, s, 0.4, "L").toFixed(1), l440: +__T.ltone(ct, 440, 0.4, "R").toFixed(1), m440: +__T.tone("comp2", 440, s, 0.4, "R").toFixed(1) }; }), [w, lat]);
  ok(lvL.every(q => (q.m330 > q.m440 ? near(q.l330, q.m330, 1) && q.l330 - q.l440 > 40 : near(q.l440, q.m440, 1) && q.l440 - q.l330 > 40)), "played from bar 2, the speakers play the chosen take in each bar, as the bounce does (within 1 dB): " + JSON.stringify(lvL));
  await p.evaluate(() => { const s = document.getElementById("startSel"); s.value = "1"; s.dispatchEvent(new Event("change", { bubbles: true })); });
  /* the panel's way, the keys' way in: Use Take 2 for bar 3 */
  await p.selectOption("#tkUse", { index: 1 }); await p.selectOption("#tkFrom", "3"); await p.selectOption("#tkTo", "3"); await p.click('#moreBox [data-dmt="use"]'); await p.waitForTimeout(80);
  const r3 = await p.evaluate(() => JSON.stringify(__aogStudio.SONG.tracks[0].comp));
  await p.click("#tlUndo"); await p.waitForTimeout(80);
  const r4 = await p.evaluate(() => JSON.stringify(__aogStudio.SONG.tracks[0].comp));
  await p.click("#tlRedo"); await p.waitForTimeout(80);
  const r5 = await p.evaluate(() => JSON.stringify(__aogStudio.SONG.tracks[0].comp));
  ok(r3 === `[[16,24,"${id1}"]]` && r4 === r2.comp && r5 === r3, "Use Take 2 for bar 3 (the panel's menus): bar 3 goes back to Take 2; Undo brings Take 1 back there, Redo again");
  /* kept: a reload, a song file */
  await p.evaluate(() => { __aogStudio.SONG.tracks[0].name = "Lead"; __aogStudio.songChanged(); });
  const keep = await p.evaluate(() => { const x = __aogStudio.SONG.tracks[0]; return JSON.stringify([x.clip.id, x.takes.map(c => c.id), x.comp, x.name]); });
  await p.evaluate(() => __T.render("k1")); const hk = await p.evaluate(() => __T.hash("k1"));
  await p.reload(); await ready(p); await p.waitForTimeout(300); await p.evaluate(HELP);
  await p.evaluate(() => __T.render("k2"));
  const back = await p.evaluate(() => { const x = __aogStudio.SONG.tracks[0]; return { j: JSON.stringify([x.clip.id, x.takes.map(c => c.id), x.comp, x.name]), buf: x.takes.every(c => __aogStudio.BUF.has(c.id)), h: __T.hash("k2"), lanes: document.querySelectorAll('#timeline .st-tkr[data-tkr="0"]').length }; });
  ok(back.j === keep && back.buf && back.h === hk && back.lanes === 2, "a reload keeps the takes, what is chosen where and the sound (the same bits)");
  const b64 = await p.evaluate(async () => { const f = await __aogStudio.songFile(), u = new Uint8Array(await f.arrayBuffer()); let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); });
  const c2 = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(c2); await routes(c2);
  const q = await c2.newPage(); await q.goto(U + "music-studio.html"); await q.waitForTimeout(700);
  const there = await q.evaluate(async b64 => { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const st = __aogStudio, r = await st.readSongFile(new Blob([u])); await st.applySong(r); const x = st.SONG.tracks[0]; return JSON.stringify([x.clip.id, x.takes.map(c => c.id), x.comp, x.name]); }, b64);
  await ready(q); await q.evaluate(HELP); await q.evaluate(() => __T.render("k3"));
  ok(there === keep && await q.evaluate(() => __T.hash("k3")) === hk, "a song file carries both takes, the choice and the name to a fresh device, the same bits");
  await c2.close();
  /* Remove take, and Undo */
  await p.selectOption("#trackSel", "0"); await p.selectOption("#mtSel", "tk");
  await p.click('#moreBox [data-dmt="rm"]'); await p.waitForTimeout(80);
  const rm = await p.evaluate(() => ({ takes: !!__aogStudio.SONG.tracks[0].takes, comp: !!__aogStudio.SONG.tracks[0].comp, lanes: document.querySelectorAll("#timeline .st-tkr").length, line: document.getElementById("mtLine").textContent }));
  await p.click("#tlUndo"); await p.waitForTimeout(80);
  ok(!rm.takes && !rm.comp && rm.lanes === 0 && rm.line === "Take 1 is removed. Undo brings it back." && await p.evaluate(id => __aogStudio.SONG.tracks[0].takes[0].id === id && __aogStudio.BUF.has(id), id1),
    "Remove take 1: one take is left, no lanes; Undo brings it back with its sound " + JSON.stringify(rm));
  /* the voice: Record again keeps the take you had */
  await p.selectOption("#trackSel", "7"); await p.waitForTimeout(60);
  for (let k = 0; k < 2; k++) { await p.click("#voiceRec"); await p.waitForFunction(() => __aogStudio.VOICE.rec, null, { timeout: 8000 }); await p.waitForTimeout(1500);
    await p.click("#voiceStop"); await p.waitForFunction(() => !__aogStudio.VOICE.rec && !__aogStudio.VOICE.busy, null, { timeout: 8000 }); await p.waitForTimeout(200); }
  const vo = await p.evaluate(() => { const x = __aogStudio.SONG.tracks[7]; return { vn: x.clip && x.clip.vn, takes: (x.takes || []).map(c => c.vn).join(), lanes: [...document.querySelectorAll('#timeline .st-tkr[data-tkr="7"] .st-tkn')].map(e => e.textContent).join(" | "),
    box: document.getElementById("voiceBox").textContent, buf: (x.takes || []).every(c => __aogStudio.BUF.has(c.id)) }; });
  ok(vo.vn === 2 && vo.takes === "1" && vo.lanes === "Take 1 | Take 2" && vo.buf && vo.box.includes("Recording again keeps this take too, as a take lane under the track, so you can choose the best bits."),
    "the voice's Record again keeps Your voice 1 as a take lane; Your voice 2 plays " + JSON.stringify(vo));
  /* Spanish */
  await p.selectOption("#trackSel", "0");
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(150);
  const es = await p.evaluate(() => ({ lane: document.querySelector('#timeline .st-tkr[data-tkr="0"] .st-tkn').textContent, aria: document.querySelector('#timeline .st-tkr[data-tkr="0"] .st-tkt').getAttribute("aria-label"),
    use: document.querySelector('#moreBox [data-dmt="use"]').textContent, show: document.querySelector('#moreBox [data-dmt="lanes"]').textContent, has: document.querySelector("#moreBox .st-line").textContent, opt: document.querySelector('#mtSel option[value="tk"]').textContent }));
  ok(es.lane === "Toma 1" && es.aria === "Toma 1 en la pista 1. Toca un compás para usar esta toma ahí, o arrastra a lo largo." && es.use === "Usarla ahí" && es.show === "Mostrar las franjas de tomas" && /^Esta pista tiene 2 tomas\./.test(es.has) && es.opt === "Tomas · 2", "Spanish: " + JSON.stringify(es));
  await p.evaluate(() => document.getElementById("langBtn").click());
  await c.close();

  /* ═══ B · the clipboard, split, reverse, pitch, sections ═══ */
  const d = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(d); await routes(d);
  const s = await d.newPage();
  await s.goto(U + "music-studio.html"); await s.waitForTimeout(700);
  await add(s, { n: 1, f: [330], bars: 6 }); await add(s, { n: 2, kind: "noise", bars: 4, from: "bass" }); await add(s, { n: 3, kind: "click", clicks: [0.5], bars: 4, from: "piano" });
  await s.waitForFunction(() => __aogStudio.INBOX.items.length === 3, null, { timeout: 8000 });
  await put(s, "guitar", 1, 0); await put(s, "bass", 2, 1);
  await s.evaluate(HELP); await s.evaluate(() => { __aogStudio.SONG.master.glue = 0; __aogStudio.songChanged(); });
  /* Copy, then Paste on the empty track 3 at bar 9: the same sound, 8 bars later */
  await s.selectOption("#trackSel", "0"); await s.click('#clipBox [data-dm="ccopy"]'); await s.waitForTimeout(80);
  const cb = await s.evaluate(() => ({ msg: document.getElementById("editLine") && document.getElementById("editLine").textContent, row: document.querySelector("#moreBox .st-clipb .st-info").textContent }));
  await s.selectOption("#trackSel", "2"); await s.selectOption("#pasteAt", "32"); await s.click("#pasteBtn"); await s.waitForFunction(() => __aogStudio.SONG.tracks[2].clip, null, { timeout: 8000 });
  const ps = await s.evaluate(() => ({ at: __aogStudio.pcs(__aogStudio.SONG.tracks[2].clip).map(q => q.at).join(), line: document.getElementById("mtLine").textContent, nid: __aogStudio.SONG.tracks[2].clip.id !== __aogStudio.SONG.tracks[0].clip.id }));
  await s.evaluate(() => __T.render("s0", 0)); await s.evaluate(() => __T.render("s2", 2));
  const pm = await s.evaluate(() => __T.same("s0", "s2", 19.7, 33.6, 19.2));   /* (from half a second in: the browser's compressors settle at the start of every bounce) */
  ok(/^Piece 1 is on the clipboard\. Pick a track, then Paste\.$/.test(cb.msg) && /^On the clipboard: Guitar take 1, piece 1, 0:14\.$/.test(cb.row) && ps.at === "32" && ps.line === "Pasted on track 3 at Bar 9." && ps.nid && pm < 1e-6,
    `Copy, then Paste on track 3 at bar 9: track 3 plays the piece 8 bars later, the very same sound (within ${pm.toExponential(1)}) ` + JSON.stringify([cb, ps]));
  /* Cut the noise from track 2, Paste it on track 4 where the playhead is (bar 1); a track that holds another recording says so */
  await s.selectOption("#trackSel", "1"); await s.click('#clipBox [data-dm="ccut"]'); await s.waitForTimeout(80);
  const cut1 = await s.evaluate(() => !__aogStudio.SONG.tracks[1].clip);
  await s.selectOption("#trackSel", "0"); await s.click("#pasteBtn"); await s.waitForTimeout(100);
  const other = await s.evaluate(() => document.getElementById("mtLine").textContent);
  await s.selectOption("#trackSel", "3"); await s.selectOption("#pasteAt", ""); await s.click("#pasteBtn"); await s.waitForFunction(() => __aogStudio.SONG.tracks[3].clip, null, { timeout: 8000 });
  const p3 = await s.evaluate(() => ({ at: __aogStudio.pcs(__aogStudio.SONG.tracks[3].clip)[0].at, line: document.getElementById("mtLine").textContent }));
  ok(cut1 && other === "Track 1 holds another recording. Paste on an empty track, or on the track the piece came from." && p3.at === 0 && p3.line === "Pasted on track 4 at Bar 1.", "Cut takes the piece off track 2; Paste on track 1 says it holds another recording; Paste on track 4 where the playhead is (bar 1) " + JSON.stringify(p3));
  await s.click("#tlUndo"); await s.click("#tlUndo"); await s.waitForTimeout(100);
  ok(await s.evaluate(() => !__aogStudio.SONG.tracks[3].clip && !!__aogStudio.SONG.tracks[1].clip && __aogStudio.BUF.has(__aogStudio.SONG.tracks[1].clip.id)), "Undo twice: the paste goes, and the cut piece is back on track 2");
  await s.evaluate(() => { const x = __aogStudio.SONG.tracks; x[2].clip = null; __aogStudio.songChanged(); });
  /* Split at the playhead: stopped, the start bar (3); playing, on the beat */
  await s.evaluate(() => __T.render("whole"));
  await s.selectOption("#trackSel", "0");
  await s.evaluate(() => { const e = document.getElementById("startSel"); e.value = "3"; e.dispatchEvent(new Event("change", { bubbles: true })); });
  await s.click('#clipBox [data-dm="split"]'); await s.waitForTimeout(80);
  const sp = await s.evaluate(() => ({ P: JSON.stringify(__aogStudio.pcs(__aogStudio.SONG.tracks[0].clip).map(q => [q.a, q.b, q.at])), line: document.getElementById("editLine").textContent }));
  await s.evaluate(() => __T.render("split"));
  const sd = await s.evaluate(() => __T.same("whole", "split", 0.5, 14, 0, [4.8]));
  ok(sp.P === "[[0,8,0],[8,24,8]]" && sp.line === "Split at Bar 3. Now there are 2 pieces." && sd < 1e-6, "Split at the playhead (stopped at bar 3): two pieces, the sound the same away from the cut (within " + sd.toExponential(1) + ") " + JSON.stringify(sp));
  await s.evaluate(() => { const e = document.getElementById("startSel"); e.value = "1"; e.dispatchEvent(new Event("change", { bubbles: true })); });
  await s.evaluate(() => __aogStudio.play()); await s.waitForTimeout(1050);
  await s.click('#clipBox [data-dm="split"]'); await s.waitForTimeout(60);
  await s.evaluate(() => __aogStudio.stop());
  const sp2 = await s.evaluate(() => __aogStudio.pcs(__aogStudio.SONG.tracks[0].clip).map(q => q.at));
  ok(sp2.length === 3 && sp2.every(a => Number.isInteger(a)) && sp2[1] >= 1 && sp2[1] <= 3, "Split while it plays, Snap to the beat on: the cut lands on a beat (pieces at beats " + sp2.join(", ") + ")");
  await s.click("#tlUndo"); await s.click("#tlUndo"); await s.waitForTimeout(80);
  /* Reverse: a click 0.5 s into a 4-bar take is heard 0.5 s before its end */
  await put(s, "piano", 3, 4);
  await s.evaluate(() => { const x = __aogStudio.SONG.tracks; x.forEach((y, j) => { y.mute = j !== 4; }); __aogStudio.songChanged(); });
  await s.evaluate(() => __T.render("fw"));
  await s.click('#clipBox [data-dm="rev"]'); await s.waitForTimeout(80);
  await s.evaluate(() => __T.render("bw"));
  const rv = await s.evaluate(() => { const c = __aogStudio.SONG.tracks[4].clip, len = __aogStudio.pcs(c)[0].b * 0.6; const b1 = __aogStudio.BUF.get(c.id);
    return { fw: +__T.peakAt("fw", 0, 9.6).toFixed(4), bw: +__T.peakAt("bw", 0, 9.6).toFixed(4), len, rev: __aogStudio.pcs(c)[0].rev, cached: __aogDeskMore.dmRev(b1) === __aogDeskMore.dmRev(b1), pressed: document.querySelector('#clipBox [data-dm="rev"]').getAttribute("aria-pressed"), line: document.getElementById("editLine").textContent }; });
  ok(near(rv.fw, 0.5, 0.001) && near(rv.bw, rv.len - 0.5, 0.0015) && rv.rev === 1 && rv.cached && rv.pressed === "true" && rv.line === "Piece 1 plays backwards.", "Reverse this piece: the click at 0.5 s is heard at " + rv.bw + " s, 0.5 s before the end of the 9.6 s piece; the backwards sound is made once and kept " + JSON.stringify(rv));
  await s.click('#clipBox [data-dm="rev"]'); await s.waitForTimeout(80); await s.evaluate(() => __T.render("fw2"));
  ok(await s.evaluate(() => __T.hash("fw2") === __T.hash("fw")), "Reverse again: forwards, the very same bits");
  /* Pitch +7 semitones: 330 Hz becomes 494 Hz, and the take lasts as long; −12: 165 Hz */
  await s.evaluate(() => { const x = __aogStudio.SONG.tracks; x.forEach((y, j) => { y.mute = j !== 0; }); __aogStudio.songChanged(); });
  await s.selectOption("#trackSel", "0");
  await s.evaluate(() => __T.render("p0"));
  const pw0 = await s.evaluate(() => ({ lab: document.querySelector('label[for="ptR"]').textContent, out: document.getElementById("ptOut").textContent, end: __aogStudio.songEnd() }));
  await s.evaluate(() => { const r = document.getElementById("ptR"); r.value = "7"; r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true })); });
  await s.waitForTimeout(100); await s.evaluate(() => __aogStudio.stretchAll());
  await s.evaluate(() => __T.render("p7"));
  const pr = await s.evaluate(() => ({ hz: +__T.hz("p7", 2, 3).toFixed(1), hz0: +__T.hz("p0", 2, 3).toFixed(1), end: [+__T.lastLoud("p0", 0.01).toFixed(3), +__T.lastLoud("p7", 0.01).toFixed(3)], se: __aogStudio.songEnd(), out: document.getElementById("ptOut").textContent, pitch: __aogStudio.SONG.tracks[0].clip.pitch }));
  await s.evaluate(() => { const r = document.getElementById("ptR"); r.value = "-12"; r.dispatchEvent(new Event("change", { bubbles: true })); }); await s.waitForTimeout(60); await s.evaluate(() => __aogStudio.stretchAll());
  await s.evaluate(() => __T.render("p12"));
  const p12 = await s.evaluate(() => +__T.hz("p12", 2, 3).toFixed(1));
  ok(pw0.lab === "Pitch (the speed stays)" && pw0.out === "As recorded" && near(pr.hz0, 330, 0.5) && near(pr.hz, 330 * Math.pow(2, 7 / 12), 2) && near(pr.end[1], pr.end[0], 0.03) && pr.se === pw0.end && pr.out === "+7 semitones · higher" && pr.pitch === 7 && near(p12, 165, 1.5),
    `Pitch +7 semitones: ${pr.hz0} Hz → ${pr.hz} Hz (${(330 * Math.pow(2, 7 / 12)).toFixed(1)} wanted), the sound ends at ${pr.end[1]} s as before (${pr.end[0]} s); −12: ${p12} Hz`);
  await s.click("#tlUndo"); await s.click("#tlUndo"); await s.waitForTimeout(80);
  ok(await s.evaluate(() => !__aogStudio.SONG.tracks[0].clip.pitch), "Undo takes the pitch back");
  /* Sections: + Mark a section; its name and bars; its edge dragged */
  await s.evaluate(() => { const x = __aogStudio.SONG.tracks; x.forEach((y, j) => { y.mute = j > 1; }); x[4].clip = null; __aogStudio.songChanged(); });
  const s0 = await s.evaluate(() => ({ lab: document.querySelector("#secTools .st-lab").textContent, opts: [...document.querySelectorAll("#secSel option")].map(o => o.textContent).join(" | "), row: !!document.querySelector("#timeline .st-secr") }));
  await s.selectOption("#secSel", "new"); await s.waitForTimeout(80);
  const s1 = await s.evaluate(() => ({ secs: JSON.stringify(__aogStudio.SONG.sections), opts: [...document.querySelectorAll("#secSel option")].map(o => o.textContent).join(" | "), row: document.querySelector("#timeline .st-secr .st-sec b").textContent,
    line: document.getElementById("secLine").textContent, btns: [...document.querySelectorAll("#secTools button")].map(b => b.textContent).join(" | "), names: [...document.querySelectorAll("#secName option")].map(o => o.textContent).join(" | ") }));
  ok(s0.lab === "Song sections" && s0.opts === "No sections yet | + Mark a section" && !s0.row && s1.secs === '[{"a":0,"b":16,"n":"verse"}]' && s1.row === "Verse" && s1.line === "Verse is marked: bars 1 to 4. Drag its edges under the ruler to change it."
    && s1.btns === "Copy this section to the end | Copy this section after itself | Remove this section" && s1.names === "Intro | Verse | Chorus | Bridge | Solo | Outro | Your own words…", "+ Mark a section: a Verse on bars 1 to 4, under the ruler " + JSON.stringify(s1));
  await s.selectOption("#secFrom", "3"); await s.waitForTimeout(40);
  await s.selectOption("#secName", "own"); await s.waitForTimeout(60); await s.fill("#secWords", "Hook"); await s.waitForTimeout(60);
  const s2 = await s.evaluate(() => ({ secs: JSON.stringify(__aogStudio.SONG.sections), row: document.querySelector("#timeline .st-secr .st-sec b").textContent, fs: parseFloat(getComputedStyle(document.getElementById("secWords")).fontSize) }));
  ok(s2.secs === '[{"a":8,"b":16,"w":"Hook"}]' && s2.row === "Hook" && s2.fs >= 16, "From bar 3, and a name in your own words: Hook, bars 3 to 4 " + JSON.stringify(s2));
  await s.selectOption("#secName", "chorus"); await s.waitForTimeout(40);
  const e0 = await s.evaluate(() => { const el = document.querySelector('#timeline .st-sec[data-sec="0"] .st-seh.b'); el.scrollIntoView({ block: "center" }); const r = el.getBoundingClientRect(), st = document.getElementById("secStrip").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, per: st.width / (__aogStudio.tlBars() * 4) }; });
  await s.mouse.move(e0.x, e0.y); await s.mouse.down(); for (let k = 1; k <= 8; k++) await s.mouse.move(e0.x + e0.per * 4.3 * k / 8, e0.y); await s.mouse.up(); await s.waitForTimeout(100);
  const s3 = await s.evaluate(() => ({ secs: JSON.stringify(__aogStudio.SONG.sections), line: document.getElementById("secLine").textContent }));
  ok(s3.secs === '[{"a":8,"b":20,"n":"chorus"}]' && s3.line === "Chorus is now bars 3 to 5.", "the Chorus's end dragged a bar on with the mouse, onto the bar line: bars 3 to 5 " + JSON.stringify(s3));
  await s.click("#tlUndo"); await s.waitForTimeout(80);
  ok(await s.evaluate(() => JSON.stringify(__aogStudio.SONG.sections)) === '[{"a":8,"b":16,"n":"chorus"}]', "Undo puts the edge back");
  /* Copy this section after itself: every track's pieces and drawn lines in bars 3 to 4 again, what came after 2 bars later */
  await s.evaluate(() => { __aogStudio.SONG.tracks[0].lines = { vol: [[0, 80], [8, 80], [16, 60], [24, 60]] }; __aogStudio.lineChanged(0); });
  await s.evaluate(() => __T.render("pre")); const hPre = await s.evaluate(() => __T.hash("pre"));
  await s.click("#secAfter"); await s.waitForTimeout(150);
  const c1 = await s.evaluate(() => ({ secs: JSON.stringify(__aogStudio.SONG.sections), line: document.getElementById("secLine").textContent, vol: JSON.stringify(__aogStudio.SONG.tracks[0].lines.vol), bars: __aogStudio.songBars() }));
  await s.evaluate(() => __T.render("post"));
  const cs = await s.evaluate(() => ({ before: __T.same("pre", "post", 0, 9.6, 0, [9.6]), copy: __T.same("pre", "post", 9.6, 14.4, 4.8, [9.6, 14.4]), after: __T.same("pre", "post", 14.4, 18.9, 4.8, [14.4]), loud: +__T.db("post", 11, 1).toFixed(1) }));
  ok(c1.secs === '[{"a":8,"b":16,"n":"chorus"},{"a":16,"b":24,"n":"chorus"}]' && c1.line === "Chorus plays again from bar 5. What came after it moved 2 bars later." && c1.vol === "[[0,80],[8,80],[16,60],[16,80],[24,60],[32,60]]" && c1.bars === 8
    && cs.before < 1e-5 && cs.copy < 1e-5 && cs.after < 1e-5 && cs.loud > -40, "Copy this section after itself: bars 5 and 6 are bars 3 and 4 again to the sample, everything after them is the same sound 2 bars later (" + JSON.stringify(cs) + "), the drawn fade comes along " + c1.vol);
  await s.click("#tlUndo"); await s.waitForTimeout(100); await s.evaluate(() => __T.render("undo"));
  ok(await s.evaluate(() => JSON.stringify(__aogStudio.SONG.sections)) === '[{"a":8,"b":16,"n":"chorus"}]' && await s.evaluate(() => __T.hash("undo")) === hPre, "Undo: one section again, and the song is the very same bits as before the copy");
  await s.selectOption("#secSel", "0"); await s.click("#secEnd"); await s.waitForTimeout(150);
  const c2e = await s.evaluate(() => ({ secs: JSON.stringify(__aogStudio.SONG.sections), line: document.getElementById("secLine").textContent }));
  await s.evaluate(() => __T.render("end"));
  const ce = await s.evaluate(() => ({ before: __T.same("pre", "end", 0, 14.4, 0, [14.4]), copy: __T.same("pre", "end", 14.4, 19.2, 9.6, [14.4, 19.2]) }));
  ok(c2e.secs === '[{"a":8,"b":16,"n":"chorus"},{"a":24,"b":32,"n":"chorus"}]' && c2e.line === "A copy of Chorus is at the end, from bar 7." && ce.before < 1e-5 && ce.copy < 1e-5, "Copy this section to the end: from bar 7 the Chorus again, to the sample; the song before it untouched " + JSON.stringify(ce));
  await s.reload(); await ready(s);
  ok(await s.evaluate(() => JSON.stringify(__aogStudio.SONG.sections)) === c2e.secs && await s.evaluate(() => document.querySelectorAll("#timeline .st-sec").length) === 2, "a reload keeps the sections");
  /* Spanish */
  await s.selectOption("#trackSel", "0"); await s.selectOption("#secSel", "0");
  await s.evaluate(() => document.getElementById("langBtn").click()); await s.waitForTimeout(150);
  const es2 = await s.evaluate(() => ({ sec: document.querySelector("#secTools .st-lab").textContent, opt: document.querySelector('#secSel option[value="0"]').textContent, btns: [...document.querySelectorAll("#secTools button")].map(b => b.textContent).join(" | "),
    row: document.querySelector("#timeline .st-secn").textContent, dm: [...document.querySelectorAll("#clipBox [data-dm]")].map(b => b.textContent).join(" | "), pit: document.querySelector('label[for="ptR"]').textContent + ": " + document.getElementById("ptOut").textContent }));
  ok(es2.sec === "Secciones de la canción" && es2.opt === "Estribillo · compases 3 a 4" && es2.btns === "Copiar esta sección al final | Copiar esta sección después de sí misma | Quitar esta sección" && es2.row === "Secciones"
    && es2.dm === "Dividir en el cabezal | Invertir esta parte | Copiar al portapapeles | Cortar al portapapeles" && es2.pit === "Tono (la velocidad se queda): Como se grabó", "Spanish: " + JSON.stringify(es2));
  await s.evaluate(() => document.getElementById("langBtn").click());
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await d.close();

  /* ═══ C · an iPhone and an iPad, light and dark: take lanes, sections and the clipboard: it fits, reads, is calm ═══ */
  for (const [dev, theme] of [["iPad (gen 7)", "light"], ["iPad (gen 7)", "dark"], ["iPhone 13", "light"], ["iPhone 13", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(700);
    await add(m, { n: 1, f: [330], bars: 4 }); await add(m, { n: 2, f: [440], bars: 4 });
    await m.waitForFunction(() => __aogStudio.INBOX.items.length === 2, null, { timeout: 8000 });
    const v1 = await m.evaluate(() => [...document.querySelectorAll("#srcSel option")].find(o => /^Guitar take 1/.test(o.textContent)).value);
    await m.selectOption("#srcSel", v1); await m.click("#putBtn"); await m.waitForFunction(() => __aogStudio.SONG.tracks[0].clip && !__aogStudio.S.busy, null, { timeout: 15000 });
    const v2b = await m.evaluate(() => [...document.querySelectorAll("#srcSel option")].find(o => /^Guitar take 2/.test(o.textContent)).value);
    await m.selectOption("#srcSel", v2b); await m.click("#takeBtn"); await m.waitForFunction(() => __aogStudio.SONG.tracks[0].takes && !__aogStudio.S.busy, null, { timeout: 15000 });
    await m.selectOption("#secSel", "new"); await m.waitForTimeout(80);
    await m.click('#clipBox [data-dm="ccopy"]'); await m.waitForTimeout(80);
    if (dev.startsWith("iPad") && theme === "light") {
      const tid = await m.evaluate(() => __aogDeskMore.dmTakeList(__aogStudio.SONG.tracks[0])[0].id);
      const pt2 = await at(m, `#timeline .st-tkt[data-tk="${tid}"]`, 5.5); await m.waitForTimeout(250);
      const ses = await m.context().newCDPSession(m);
      await ses.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: pt2.x, y: pt2.y }] }); await ses.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await m.waitForTimeout(250);
      ok(await m.evaluate(id => JSON.stringify(__aogStudio.SONG.tracks[0].comp) === `[[4,8,"${id}"]]`, tid), "iPad: a finger taps bar 2 of Take 1, and Take 1 plays there " + await m.evaluate(() => JSON.stringify(__aogStudio.SONG.tracks[0].comp)));
    }
    await m.evaluate(() => document.getElementById("timeline").scrollIntoView({ block: "start" })); await m.waitForTimeout(150);
    const f = await m.evaluate(() => { const r = el => el.getBoundingClientRect(), btn = [...document.querySelectorAll("#secTools button, #moreBox button, #clipBox [data-dm]")].filter(x => x.offsetParent);
      return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, minH: Math.min(...btn.map(x => Math.round(r(x).height))), right: Math.max(...btn.map(x => Math.round(r(x).right))),
        fs: Math.min(...[...document.querySelectorAll("#secTools select, #moreBox select, #tkName")].filter(x => x.offsetParent).map(x => parseFloat(getComputedStyle(x).fontSize))),
        lane: Math.round(r(document.querySelector("#timeline .st-tkt")).height), sec: Math.round(r(document.querySelector("#timeline .st-sec")).height) }; });
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    ok(f.sw <= f.iw && f.minH >= 44 && f.right <= f.iw && f.fs >= 16 && f.lane >= 36 && f.sec >= 28 && !pc.length && !pk.length, `${dev}, ${theme}, take lanes, a section and the clipboard: it fits (${JSON.stringify(f)}), reads (${pc.length} ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await m.screenshot({ path: path.join(__dirname, "..", `studiomore2-${dev.split(" ")[0].toLowerCase()}-${theme}.png`) });
    await cx.close();
  }
  /* inside the Recording Studio */
  {
    const cx = await b.newContext({ ...pw.devices["iPad (gen 7) landscape"], colorScheme: "dark" }); watch(cx); await routes(cx);
    await cx.addInitScript(() => { try { localStorage.setItem("aog.theme", "dark"); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} });
    const m = await cx.newPage(); await m.goto(U + "the-studio#studio");
    await m.waitForFunction(() => { const d = document.getElementById("room").contentDocument; return d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio") && /studio/.test(d.location.pathname); }, null, { timeout: 20000 });
    await m.waitForTimeout(1200);
    const f = m.frames().find(x => x.parentFrame() === m.mainFrame());
    await f.evaluate(`(${TAKE})(${JSON.stringify({ n: 1, f: [330], bars: 4 })})`); await f.evaluate(`(${TAKE})(${JSON.stringify({ n: 2, f: [440], bars: 4 })})`);
    await f.waitForFunction(() => __aogStudio.INBOX.items.length === 2, null, { timeout: 8000 });
    const va = await f.evaluate(() => [...document.querySelectorAll("#srcSel option")].find(o => /^Guitar take 1/.test(o.textContent)).value);
    await f.selectOption("#srcSel", va); await f.click("#putBtn"); await f.waitForFunction(() => __aogStudio.SONG.tracks[0].clip && !__aogStudio.S.busy, null, { timeout: 15000 });
    const vb = await f.evaluate(() => [...document.querySelectorAll("#srcSel option")].find(o => /^Guitar take 2/.test(o.textContent)).value);
    await f.selectOption("#srcSel", vb); await f.click("#takeBtn"); await f.waitForFunction(() => __aogStudio.SONG.tracks[0].takes && !__aogStudio.S.busy, null, { timeout: 15000 });
    await f.selectOption("#secSel", "new"); await f.evaluate(() => document.getElementById("timeline").scrollIntoView({ block: "center" })); await m.waitForTimeout(300);
    const fc = await f.evaluate(`(${PROBE})()`), fk = await f.evaluate(`(${CALM})()`), sw2 = await f.evaluate(() => document.scrollingElement.scrollWidth - innerWidth);
    ok(!fc.length && !fk.length && sw2 <= 1, `inside the Recording Studio, iPad landscape, dark, take lanes and a section: readable (${fc.length} ${JSON.stringify(fc.slice(0, 2))}), calm (${fk.join("; ") || "ok"}), nothing sideways (${sw2})`);
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the iPhone, the iPad or in the Studio " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
