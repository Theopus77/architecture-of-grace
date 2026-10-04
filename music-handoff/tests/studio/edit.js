/* AOG-STUDIO-EDIT-V1 — Jimmy: "In the studio I need a way to edit the tracks that are in the mixer. Cut them up, slow or speed
   them up, etc." A take of four bars at 100 beats a minute, each bar its own note (220, 330, 440 and 550 Hz), goes on track 1.
   Then, listening to Make the mix each time (the note in each bar, found by counting its waves, and how loud it is):
   cut it in two at bar 3, move the second piece a bar later, remove it, Undo, copy a piece, cut a bar off its end; the
   speed at 50 % keeping the pitch (the song's tempo halves, the notes stay), like a tape (the notes drop an octave), and at
   125 %; a second track matched to the first, and one tempo for every track (one Undo takes it back); a fade in and a fade
   out; Play; a reload keeps it all; the mixer's Edit button; Spanish; an iPhone and an iPad, light and dark, nothing
   sideways, readable and calm; no page errors. Port 9243. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9243, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
async function routes(ctx) { await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort()); }

/* a take of four bars at 100 beats a minute (a bar is 2.4 s), 0.05 s of quiet first as a take has; each bar one note */
const TAKE = `(async (n, freqs) => { const sr = 44100, head = 0.05, bar = 2.4, sec = head + bar * freqs.length, len = Math.round(sec * sr);
  const ab = new ArrayBuffer(44 + len * 4), v = new DataView(ab), s = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  s(0, "RIFF"); v.setUint32(4, 36 + len * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, len * 4, true);
  let ph = 0;
  for (let i = 0; i < len; i++) { const t = i / sr - head; let x = 0;
    if (t >= 0) { const k = Math.min(freqs.length - 1, Math.floor(t / bar)), u = t - k * bar, env = Math.min(1, u / 0.01, Math.max(0, (bar - 0.2 - u) / 0.01)); ph += 2 * Math.PI * freqs[k] / sr; x = Math.round(9000 * env * Math.sin(ph)); }
    v.setInt16(44 + i * 4, x, true); v.setInt16(46 + i * 4, x, true); }
  await AOGHandoff.add(AOGHandoff.INBOX, { from: "guitar", n, name: { en: "Guitar take " + n, es: "Toma de guitarra " + n }, sec, bpm: 100, at: Date.now() + n, take: true,
    wav: new Blob([ab], { type: "audio/wav" }) }, { key: "edit|" + n });
})`;
const NOTES = [220, 330, 440, 550];
/* Make the mix, then each bar's note (by counting its waves in the middle of the bar) and level */
async function mixBars(p, nBars) {
  await p.evaluate(() => { document.getElementById("mixLine").textContent = ""; });
  await p.click("#mixBtn");
  await p.waitForFunction(() => /ready|did not/.test(document.getElementById("mixLine").textContent), null, { timeout: 60000 });
  return p.evaluate(async (nBars) => {
    const st = __aogStudio, m = st.MIX, buf = await new OfflineAudioContext(2, 1, 44100).decodeAudioData(await m.wav.arrayBuffer()), d = buf.getChannelData(0), sr = buf.sampleRate, bar = st.barSec();
    const out = [];
    for (let k = 0; k < nBars; k++) {
      const a = Math.floor((k * bar + 0.3 * bar) * sr), z = Math.min(d.length, Math.floor((k * bar + 0.75 * bar) * sr));
      let s = 0, n = 0, up = 0; for (let i = a; i < z; i++) { s += d[i] * d[i]; n++; if (i > a && d[i - 1] < 0 && d[i] >= 0) up++; }
      const db = n ? 10 * Math.log10(s / n + 1e-12) : -120;
      out.push({ hz: db > -45 ? Math.round(up / ((z - a) / sr)) : 0, db: +db.toFixed(1) });
    }
    return { bars: out, sec: +buf.duration.toFixed(2), bar: +bar.toFixed(3), line: document.getElementById("mixLine").textContent };
  }, nBars);
}
const near = (hz, want) => want === 0 ? hz === 0 : Math.abs(hz - want) / want < 0.03;
const shape = (r, want) => r.bars.length === want.length && r.bars.every((b, i) => near(b.hz, want[i]));
const say = r => r.bars.map(b => b.hz || "·").join(" ");
const act = async (p, a) => { await p.click(`#clipBox [data-act="${a}"]`); await p.waitForTimeout(60); };
const slide = (p, v) => p.evaluate(v => { const r = document.getElementById("spdR"); r.value = String(v); r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true })); }, v);
const ready = p => p.waitForFunction(() => !__aogStudio.S.stretching, null, { timeout: 60000 });
async function put(p, take, track) {
  await p.selectOption("#trackSel", String(track));
  const v = await p.evaluate(nm => [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === nm).value, take);
  await p.selectOption("#srcSel", v); await p.click("#putBtn");
  await p.waitForFunction(t => __aogStudio.SONG.tracks[t].clip && !__aogStudio.S.busy, track, { timeout: 15000 });
}

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(c); await routes(c);
  const p = await c.newPage();
  await p.goto(U + "music-studio.html"); await p.waitForTimeout(700);
  await p.evaluate(`(async()=>{ const add=${TAKE}; await add(1, ${JSON.stringify(NOTES)}); await add(2, ${JSON.stringify(NOTES)}); })()`);
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 2, null, { timeout: 8000 });
  await put(p, "Guitar take 1", 0);

  /* 1 · as it came in: four bars, four notes */
  let r = await mixBars(p, 4);
  ok(shape(r, NOTES) && Math.abs(r.bar - 2.4) < 1e-3, `as it came in: ${say(r)} Hz in bars 1 to 4 (a bar is ${r.bar} s)`);
  const panel = await p.evaluate(() => ({ h: [...document.querySelectorAll("#clipBox h3")].map(h => h.textContent), cut: [...document.querySelectorAll("#cutSel option")].map(o => o.textContent),
    sel: document.querySelector("#cutSel option:checked").textContent, piece: !!document.getElementById("pieceSel"), undo: document.querySelector('[data-act="undo"]').disabled,
    spd: document.getElementById("spdOut").textContent, keep: document.querySelector('[data-act="keep"]').getAttribute("aria-pressed"), fi: document.querySelector("#fiSel option:checked").textContent,
    drop: !!document.querySelector('[data-act="drop"]') }));
  ok(panel.h.join(" | ") === "Cut it up | Speed | Fade in and out" && panel.cut.length === 15 && panel.cut[0] === "Bar 1 · beat 2" && panel.cut[3] === "Bar 2" && panel.sel === "Bar 3" && !panel.piece && panel.undo && !panel.drop
    && panel.spd === "Normal speed · 100 beats a minute" && panel.keep === "true" && panel.fi === "None",
    "the track's panel: " + JSON.stringify(panel));

  /* 2 · cut it in two at bar 3; the second piece a bar later */
  await act(p, "cut");
  const cutp = await p.evaluate(() => ({ P: __aogStudio.pcs(__aogStudio.SONG.tracks[0].clip).map(q => [q.a, q.b, q.at, q.n].join()), line: document.getElementById("editLine").textContent,
    menu: [...document.querySelectorAll("#pieceSel option")].map(o => o.textContent), chosen: document.querySelector("#pieceSel option:checked").textContent, blocks: document.querySelectorAll("#timeline .st-lane")[0].querySelectorAll(".st-clip").length }));
  ok(cutp.P.join(" / ") === "0,8,0,1 / 8,16,8,1" && cutp.line === "Cut in two. Now there are 2 pieces." && cutp.menu.join(" | ") === "Piece 1 · bars 1 to 2 | Piece 2 · bars 3 to 4" && cutp.chosen === "Piece 2 · bars 3 to 4" && cutp.blocks === 2,
    "cut at bar 3: " + JSON.stringify(cutp));
  r = await mixBars(p, 4);
  ok(shape(r, NOTES), "cut but not moved, it sounds the same: " + say(r));
  await act(p, "start+");
  r = await mixBars(p, 5);
  ok(shape(r, [220, 330, 0, 440, 550]), "the second piece a bar later: a quiet bar 3, then its two notes: " + say(r));

  /* 3 · remove it; Undo brings it back */
  await act(p, "drop");
  r = await mixBars(p, 5);
  const dl = await p.evaluate(() => document.getElementById("editLine").textContent);
  ok(shape(r, [220, 330, 0, 0, 0]) && dl === "Piece removed. Undo brings it back.", "Remove this piece: " + say(r) + " · " + dl);
  await act(p, "undo");
  r = await mixBars(p, 5);
  const ul = await p.evaluate(() => ({ line: document.getElementById("editLine").textContent, n: __aogStudio.pcs(__aogStudio.SONG.tracks[0].clip).length }));
  ok(shape(r, [220, 330, 0, 440, 550]) && ul.line === "Back to how it was." && ul.n === 2, "Undo: the piece is back where it was: " + say(r) + " · " + ul.line);

  /* 4 · copy the second piece: the copy plays right after it */
  await act(p, "copy");
  r = await mixBars(p, 7);
  ok(shape(r, [220, 330, 0, 440, 550, 440, 550]), "Copy this piece: it plays again right after: " + say(r));
  await act(p, "undo");

  /* 5 · the first piece, a bar cut off its end */
  await p.selectOption("#pieceSel", "0");
  await act(p, "out+bar");
  r = await mixBars(p, 5);
  const ce = await p.evaluate(() => [...document.querySelectorAll("#clipBox .st-stp .st-val")].map(x => x.textContent));
  ok(shape(r, [220, 0, 0, 440, 550]) && ce[3] === "3 bars", "piece 1, a bar cut from its end: " + say(r) + " · " + ce.join(" | "));
  await act(p, "undo"); await act(p, "undo"); await act(p, "undo");
  const back = await p.evaluate(() => __aogStudio.pcs(__aogStudio.SONG.tracks[0].clip).map(q => [q.a, q.b, q.at, q.n].join()).join(" / "));
  ok(back === "0,16,0,1", "Undo, three times: one piece again, as it came in (" + back + ")");

  /* 6 · speed: 50 % keeping the pitch; like a tape; 125 % */
  await slide(p, 50); await ready(p);
  r = await mixBars(p, 4);
  const s50 = await p.evaluate(() => ({ bpm: __aogStudio.songBpm(), out: document.getElementById("spdOut").textContent, kept: __aogStudio.STRETCH.size, tempo: document.getElementById("tempoOut").textContent }));
  ok(shape(r, NOTES) && Math.abs(r.bar - 4.8) < 1e-3 && s50.bpm === 50 && s50.out === "50% speed · 50 beats a minute" && s50.kept === 1 && r.bars.every(x => x.db > -30) && /^50 beats a minute/.test(s50.tempo),
    `half speed, the pitch kept: the same notes (${say(r)}), each bar now ${r.bar} s, the song at ${s50.bpm} beats a minute; ${s50.out}; levels ${r.bars.map(x => x.db).join(" ")} dB`);
  await act(p, "keep");
  r = await mixBars(p, 4);
  const tl = await p.evaluate(() => [...document.querySelectorAll("#clipBox .st-line")].map(x => x.textContent).join(" | "));
  ok(shape(r, NOTES.map(f => f / 2)) && /Like a tape: slower sounds lower/.test(tl), "like a tape: an octave lower (" + say(r) + "); " + tl);
  await act(p, "keep");
  await slide(p, 125); await ready(p);
  r = await mixBars(p, 4);
  ok(shape(r, NOTES) && Math.abs(r.bar - 1.92) < 1e-3, `125 %, the pitch kept: ${say(r)}, a bar is ${r.bar} s`);

  /* the stretched sound itself: a steady note stays steady (no warble, no dips) */
  const steady = await p.evaluate(async () => {
    const sr = 44100, n = sr * 2, ac = new OfflineAudioContext(1, n, sr), bf = ac.createBuffer(1, n, sr), d = bf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = 0.5 * Math.sin(2 * Math.PI * 196 * i / sr);
    const out = await __aogStudio.wsola(bf, 0.5, () => false), y = out.getChannelData(0), w = Math.floor(0.05 * sr), lv = [];
    for (let a = sr / 2; a + w < y.length - sr / 2; a += w) { let s = 0; for (let i = a; i < a + w; i++) s += y[i] * y[i]; lv.push(10 * Math.log10(s / w)); }
    let up = 0; for (let i = sr; i < 3 * sr; i++) if (y[i - 1] < 0 && y[i] >= 0) up++;
    return { len: +(out.length / sr).toFixed(3), spread: +(Math.max(...lv) - Math.min(...lv)).toFixed(2), hz: up / 2 };
  });
  ok(steady.len === 4 && steady.spread < 1.5 && Math.abs(steady.hz - 196) <= 2, "a steady note made twice as long stays steady: " + JSON.stringify(steady));

  /* 7 · two tracks: the second at 100 is matched to the song; then one tempo for every track, and one Undo */
  await slide(p, 75); await ready(p);
  await put(p, "Guitar take 2", 1);
  const t2 = await p.evaluate(() => ({ note: (document.querySelector("#clipBox .st-line.note") || {}).textContent || "", match: !!document.querySelector('[data-act="match"]') }));
  ok(/at 100 beats a minute and your song is at 75/.test(t2.note) && t2.match, "track 2 at 100 under a song at 75: " + t2.note);
  await act(p, "match"); await ready(p);
  const m2 = await p.evaluate(() => ({ s: __aogStudio.SONG.tracks[1].clip.speed, note: !!document.querySelector("#clipBox .st-line.note"), out: document.getElementById("spdOut").textContent }));
  ok(m2.s === 0.75 && !m2.note && m2.out === "75% speed · 75 beats a minute", "Match the song's tempo: " + JSON.stringify(m2));
  r = await mixBars(p, 4);
  ok(shape(r, NOTES) && r.bars.every(x => x.db > -24), "both tracks together at 75 %, the notes in place: " + say(r) + " · " + r.bars.map(x => x.db).join(" ") + " dB");
  await slide(p, 100); await ready(p);
  await p.selectOption("#trackSel", "0");
  await act(p, "spdall"); await ready(p);
  const all = await p.evaluate(() => ({ s: __aogStudio.SONG.tracks.slice(0, 2).map(x => x.clip.speed), line: document.getElementById("editLine").textContent }));
  ok(all.s.join() === "0.75,0.75" && all.line === "Every track now plays at 75 beats a minute.", "Use this tempo on every track: " + JSON.stringify(all));
  await act(p, "undo");
  const un = await p.evaluate(() => __aogStudio.SONG.tracks.slice(0, 2).map(x => x.clip.speed).join());
  ok(un === "0.75,1", "one Undo takes back the change to every track: " + un);
  await p.selectOption("#trackSel", "1"); await act(p, "off"); await p.selectOption("#trackSel", "0");

  /* 8 · fades: in over a bar, out over a bar */
  await p.selectOption("#fiSel", "4"); await p.selectOption("#foSel", "4");
  const fd = await p.evaluate(async () => {
    const st = __aogStudio; st.MIX && 0; document.getElementById("mixLine").textContent = ""; await st.makeMix();
    const buf = await new OfflineAudioContext(2, 1, 44100).decodeAudioData(await st.MIX.wav.arrayBuffer()), d = buf.getChannelData(0), sr = 44100, bar = st.barSec();
    const db = (a, z) => { let s = 0, n = 0; for (let i = Math.floor(a * sr); i < Math.floor(z * sr); i++) { s += d[i] * d[i]; n++; } return +(10 * Math.log10(s / n + 1e-12)).toFixed(1); };
    return { start: db(0.05, 0.25), endBar1: db(0.8 * bar, 0.9 * bar), bar2: db(1.3 * bar, 1.6 * bar), lastEnd: db(3.7 * bar, 3.85 * bar), lastStart: db(3.05 * bar, 3.2 * bar) };
  });
  ok(fd.start < fd.endBar1 - 10 && Math.abs(fd.bar2 - fd.endBar1) < 2.5 && fd.lastEnd < fd.lastStart - 6, "fade in and fade out over a bar each: " + JSON.stringify(fd));

  /* 9 · Play: the edited song is heard */
  await act(p, "cut");
  const lv = await p.evaluate(async () => { const st = __aogStudio; st.play(); const d = new Float32Array(1024); let pk = 0;
    await new Promise(res => setTimeout(res, 1500)); for (const a of st.AN.a) { a.getFloatTimeDomainData(d); for (const x of d) pk = Math.max(pk, Math.abs(x)); } st.stop(); return pk; });
  ok(lv > 0.02, "Play sounds with the pieces, the speed and the fades (peak " + lv.toFixed(3) + ")");

  /* 10 · a reload keeps the pieces, the speed and the fades, and makes the slower copy again */
  const before = await p.evaluate(() => JSON.stringify(__aogStudio.SONG.tracks[0].clip));
  await p.reload();
  await p.waitForFunction(() => window.__aogStudio && __aogStudio.BUF.size >= 1 && !__aogStudio.S.decoding && __aogStudio.STRETCH.size === 1 && !__aogStudio.S.stretching, null, { timeout: 30000 });
  const after = await p.evaluate(() => JSON.stringify(__aogStudio.SONG.tracks[0].clip));
  r = await mixBars(p, 4);
  ok(after === before && shape(r, NOTES) && Math.abs(r.bar - 3.2) < 1e-3, "after a reload: the same pieces, speed and fades, and the same notes (" + say(r) + ")");

  /* 11 · the mixer's Edit button opens the track's panel */
  await put(p, "Guitar take 2", 2); await p.selectOption("#trackSel", "0");
  const ed = await p.evaluate(() => ({ shown: [...document.querySelectorAll(".st-strip [data-edit]")].map(x => !x.hidden).slice(0, 4).join(), txt: document.querySelector('.st-strip[data-tr="2"] [data-edit]').textContent.trim(),
    aria: document.querySelector('.st-strip[data-tr="2"] [data-edit]').getAttribute("aria-label") }));
  await p.click('.st-strip[data-tr="2"] [data-edit]'); await p.waitForTimeout(150);
  const ed2 = await p.evaluate(() => ({ sel: __aogStudio.SONG.sel, focus: document.activeElement.id, top: Math.round(document.getElementById("trackBlk").getBoundingClientRect().top) }));
  ok(ed.shown === "true,false,true,false" && /Edit$/.test(ed.txt) && ed.aria === "Edit track 3" && ed2.sel === 2 && ed2.focus === "trackSel" && ed2.top >= 0 && ed2.top < 120,
    "the mixer's Edit button: " + JSON.stringify(ed) + " → " + JSON.stringify(ed2));

  /* 12 · Spanish */
  await p.selectOption("#trackSel", "0");
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(150);
  const es = await p.evaluate(() => ({ h: [...document.querySelectorAll("#clipBox h3")].map(h => h.textContent).join(" | "), b: [...document.querySelectorAll("#clipBox [data-act]")].map(x => x.textContent).join(" | "),
    out: document.getElementById("spdOut").textContent, piece: document.querySelector("#pieceSel option").textContent, ed: document.querySelector('.st-strip[data-tr="0"] [data-edit]').textContent.trim() }));
  ok(es.h === "Córtala en partes | Velocidad | Entrada y salida suaves" && /Deshacer/.test(es.b) && /Cortar aquí/.test(es.b) && /Copiar esta parte/.test(es.b) && /Mantener el tono/.test(es.b)
    && es.out === "75 % de velocidad · 75 pulsos por minuto" && /^Parte 1 · compases 1 a 2$/.test(es.piece) && /Editar$/.test(es.ed), "Spanish: " + JSON.stringify(es));
  await p.evaluate(() => document.getElementById("langBtn").click());
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await c.close();

  /* 13 · an iPhone and an iPad, light and dark: a track cut in two, its panel fits, reads and is calm */
  for (const [dev, theme] of [["iPhone 13", "light"], ["iPhone 13", "dark"], ["iPad (gen 7)", "light"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(700);
    await m.evaluate(`(async()=>{ const add=${TAKE}; await add(1, ${JSON.stringify(NOTES)}); })()`);
    await m.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
    await m.click("#putBtn"); await m.waitForFunction(() => __aogStudio.SONG.tracks[0].clip && !__aogStudio.S.busy, null, { timeout: 15000 });
    await m.evaluate(() => __aogStudio.clipAct("cut"));
    await m.locator("#clipBox").scrollIntoViewIfNeeded(); await m.waitForTimeout(200);
    const f = await m.evaluate(() => { const r = el => el.getBoundingClientRect(), box = document.getElementById("clipBox"), btn = [...box.querySelectorAll("button")].filter(x => x.offsetParent), sel = [...box.querySelectorAll("select")];
      return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, minBtn: Math.min(...btn.map(x => Math.round(r(x).height))), right: Math.max(...btn.concat(sel).map(x => Math.round(r(x).right))),
        selFs: Math.min(...sel.map(x => parseFloat(getComputedStyle(x).fontSize))), range: Math.round(r(document.getElementById("spdR")).height) }; });
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    ok(f.sw <= f.iw && f.minBtn >= 44 && f.right <= f.iw && f.selFs >= 16 && f.range >= 40 && !pc.length && !pk.length,
      `${dev}, ${theme}: the panel fits (${JSON.stringify(f)}), reads (${pc.length} unreadable ${JSON.stringify(pc.slice(0, 2))}) and is calm (${pk.join("; ") || "ok"})`);
    await m.screenshot({ path: `studioedit-${dev.split(" ")[0].toLowerCase()}-${theme}.png`, fullPage: true });
    await cx.close();
  }
  ok(errs.length === 0, "no page errors on the phone or the iPad " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
