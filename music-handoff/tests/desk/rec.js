/* AOG-DESK-REC-V1, AOG-DESK-CLICK-V1 (slice 3 of the DAW build) — recording like a pro:
   · the loop is a band on the song; dragging its end moves it, on a bar;
   · the click: every 1/8 at the song's tempo, the first beat of each bar stronger, exactly where the song's beats are
     heard; its own level; a count-in of two bars; it reaches the speakers only: a bounce is the same with it on or off,
     and the desk's output (what the meters hear) is silent while only the click plays;
   · markers: named, on the song, Go to one (stopped: the song starts there; playing: it carries on from there);
   · punch in and out: Record your voice with the punch on bars 3 to 4 replaces only those bars (the take before plays
     everywhere else, 40 dB and more over the new one, and the other way round inside);
   · a take each time round: three and a bit passes of a two-bar loop make four takes, each on bar 1, each two bars;
   · kept by a reload and a song file; Spanish; an iPhone and an iPad, light and dark. Port 9342. */
const T = require("./lib.js"), { ok, near, add, put, HELP } = T;
const fs = require("fs"), os = require("os"), path = require("path");
const PORT = 9342, U = "http://localhost:" + PORT + "/", srv = T.srv(PORT);
const MIC = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "deskrec-")), "tone.wav");
(() => { const sr = 48000, n = sr * 40, b = Buffer.alloc(44 + n * 2); b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(9000 * Math.sin(2 * Math.PI * 330 * i / sr)), 44 + i * 2); fs.writeFileSync(MIC, b); })();
const sel = (p, id, v) => p.evaluate(([id, v]) => { const s = document.getElementById(id); s.value = String(v); s.dispatchEvent(new Event("change", { bubbles: true })); }, [id, v]);
const click = (p, id) => p.evaluate(id => document.getElementById(id).click(), id);
const view = async (p, v) => { await p.evaluate(() => { const d = document.getElementById("drMore"); if (!d.open) { d.open = true; d.dispatchEvent(new Event("toggle")); } }); await p.waitForTimeout(50); await sel(p, "drView", v); await p.waitForTimeout(50); };

(async () => {
  const b = await T.launch(["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--use-file-for-fake-audio-capture=" + MIC]);
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); T.watch(c); await T.routes(c);
  const p = await c.newPage();
  await p.goto(U + "music-studio.html"); await p.waitForTimeout(600); await T.ready(p);
  await add(p, { n: 1, f: [440], bars: 6 });
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
  await put(p, 1, 0); await p.evaluate(HELP);
  await p.evaluate(() => { __aogStudio.SONG.master.glue = 0; __aogStudio.songChanged(); });
  const bs = await p.evaluate(() => __aogStudio.barSec());

  /* 1 · the loop on the song, dragged by its end */
  await click(p, "loopBtn"); await sel(p, "loopFrom", 1); await sel(p, "loopTo", 2); await p.waitForTimeout(80);
  const band = await p.evaluate(() => { const e = document.getElementById("cyBand"); return e ? e.getAttribute("aria-label") : null; });
  const h = await p.evaluate(() => { const e = document.querySelector('#cyBand .st-cyh.b'); e.scrollIntoView({ block: "center" }); const r = e.getBoundingClientRect(), s = document.getElementById("cyStrip").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, per: s.width / __aogStudio.tlBars() }; });
  await p.mouse.move(h.x, h.y); await p.mouse.down(); for (let k = 1; k <= 8; k++) await p.mouse.move(h.x + h.per * 2 * k / 8, h.y); await p.mouse.up(); await p.waitForTimeout(100);
  const dr = await p.evaluate(() => ({ to: __aogStudio.SONG.loopTo, line: document.getElementById("tlLine").textContent, menu: document.getElementById("loopTo").value }));
  ok(band === "The loop, bars 1 to 2. Drag an end to change it." && dr.to === 4 && dr.menu === "4" && dr.line === "The loop is bars 1 to 4.", `the loop is a band on the song; its end dragged two bars along: ${JSON.stringify(dr)}`);
  await sel(p, "loopTo", 2);

  /* 2 · the click */
  await click(p, "loopBtn");   /* off */
  await view(p, "ck"); await click(p, "drCk"); await sel(p, "drSub", 2);
  const ck = await p.evaluate(() => JSON.parse(localStorage.getItem("aog.studio.click.v1")));
  ok(ck.on === true && ck.sub === 2 && ck.acc === true, "the click is on, every 1/8, the first beat strong, kept on this device " + JSON.stringify(ck));
  await p.evaluate(() => __T.render("ckOn"));
  await p.evaluate(() => { __aogDeskRec.DR.mlog.length = 0; __aogStudio.play(); });
  await p.waitForTimeout(2600);
  const m1 = await p.evaluate(() => { const st = __aogStudio, w = st.PLAY.wins[0], lag = 3 * 0.006 + (st.LIVE.lag || 0); return { w: Object.assign({}, w), lag, log: __aogDeskRec.DR.mlog.slice() }; });
  await p.evaluate(() => __aogStudio.stop());
  const L = m1.log.filter(q => q.when <= m1.w.at + 2.5), beat = bs / 4;
  const offs = L.map((q, k) => q.when - (m1.w.at + m1.lag + k * beat / 2)), kinds = L.map(q => q.kind).join("");
  ok(L.length >= 6 && Math.max(...offs.map(Math.abs)) < 1e-6 && /^201010102/.test(kinds), `the click: every 1/8 (${(beat / 2 * 1000).toFixed(0)} ms), on the song's beats as heard (the most off: ${(Math.max(...offs.map(Math.abs)) * 1e6).toFixed(2)} µs), the bar's first beat strong: ${kinds}`);
  /* its level */
  await view(p, "ck"); await p.evaluate(() => { const r = document.getElementById("drLvl"); r.value = "30"; r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true })); });
  await p.evaluate(() => { __aogDeskRec.DR.mlog.length = 0; __aogStudio.play(); }); await p.waitForTimeout(700);
  const g30 = await p.evaluate(() => __aogDeskRec.DR.mlog[0]); await p.evaluate(() => __aogStudio.stop());
  ok(near(20 * Math.log10(g30.gain / L[0].gain), -12.04, 0.05), `its own level: at 30 the click is ${(20 * Math.log10(g30.gain / L[0].gain)).toFixed(2)} dB under 60`);
  /* never in the mix, never at the meters */
  await p.evaluate(() => __T.render("ckOff0"));
  await p.evaluate(() => { __aogDeskRec.CK.on = false; }); await p.evaluate(() => __T.render("ckOff")); await p.evaluate(() => { __aogDeskRec.CK.on = true; });
  const same = await p.evaluate(() => [__T.hash("ckOn"), __T.hash("ckOff")]);
  await p.evaluate(() => { __aogStudio.SONG.tracks[0].mute = true; __aogStudio.songChanged(); }); await p.waitForTimeout(600);
  await p.evaluate(() => __T.recOn()); await p.evaluate(() => { __aogDeskRec.DR.mlog.length = 0; __aogStudio.play(); }); await p.waitForTimeout(1500);
  await p.evaluate(() => __aogStudio.stop()); await p.waitForTimeout(150); await p.evaluate(() => __T.recOff());
  const out = await p.evaluate(() => { const r = __T.live; let m = 0, at = 0; for (let i = 0; i < r.L.length; i++) { const v = Math.max(Math.abs(r.L[i]), Math.abs(r.R[i])); if (v > m) { m = v; at = i; } } return { m, at: at / r.L.length, len: r.L.length, n: __aogDeskRec.DR.mlog.length, mute: __aogStudio.SONG.tracks.map(x => x.mute).join() }; });
  await p.evaluate(() => { __aogDeskRec.CK.on = false; }); await p.evaluate(() => __T.recOn()); await p.evaluate(() => __aogStudio.play()); await p.waitForTimeout(1500);
  await p.evaluate(() => __aogStudio.stop()); await p.waitForTimeout(150); await p.evaluate(() => __T.recOff()); await p.evaluate(() => { __aogDeskRec.CK.on = true; });
  out.base = await p.evaluate(() => { const r = __T.live; let m = 0; for (let i = 0; i < r.L.length; i++) m = Math.max(m, Math.abs(r.L[i]), Math.abs(r.R[i])); return m; });
  ok(same[0] === same[1] && out.n >= 3 && out.m < 1e-4 && out.base < 1e-4, `the click never reaches the mix (a bounce is the same with it on and off: ${same[0]}) nor the desk's output (its loudest sample with ${out.n} clicks playing: ${out.m.toExponential(2)}, under −80 dB, where a click is −17 dB; without them ${out.base.toExponential(2)})`);
  await p.evaluate(() => { __aogStudio.SONG.tracks[0].mute = false; __aogStudio.songChanged(); });
  /* a count-in of two bars */
  await view(p, "ck"); await sel(p, "drCnt", 2);
  await p.evaluate(() => { __aogDeskRec.DR.mlog.length = 0; __aogStudio.play(); }); await p.waitForTimeout(400);
  const ci = await p.evaluate(() => { const st = __aogStudio; return { gap: st.PLAY.T0 - st.PLAY.countAt, log: __aogDeskRec.DR.mlog.filter(q => q.when < st.PLAY.T0).map(q => [q.when - st.PLAY.countAt, q.kind]), song: st.SONG.countIn, txt: document.getElementById("posOut").textContent }; });
  await p.evaluate(() => __aogStudio.stop());
  const lag0 = m1.lag;
  ok(near(ci.gap, 2 * bs, 1e-6) && ci.song === true && ci.log.length === 8 && ci.log.every((q, k) => near(q[0], lag0 + k * beat, 1e-6) && q[1] === (k % 4 === 0 ? 2 : 1)), `a count-in of two bars: 8 clicks, a strong one each bar, the song after ${(ci.gap).toFixed(3)} s; "${ci.txt}"`);
  await sel(p, "drCnt", 0); await click(p, "drCk");

  /* 3 · markers */
  await view(p, "mk");
  await sel(p, "startSel", 3); await click(p, "drMkAdd");
  await p.evaluate(() => { const i = document.getElementById("drMkW"); i.focus(); i.value = "Verse"; i.dispatchEvent(new Event("input", { bubbles: true })); i.blur(); });
  await sel(p, "startSel", 5); await view(p, "mk"); await click(p, "drMkAdd");
  await p.evaluate(() => { const i = document.getElementById("drMkW"); i.value = "Chorus"; i.dispatchEvent(new Event("input", { bubbles: true })); });
  await p.waitForTimeout(300);
  const mk = await p.evaluate(() => ({ m: JSON.stringify(__aogStudio.SONG.marks), f: [...document.querySelectorAll("#cyStrip .st-mkf")].map(e => e.textContent + "@" + e.style.left), opts: [...document.querySelectorAll("#drMk option")].map(o => o.textContent) }));
  ok(mk.m === '[{"b":3,"w":"Verse"},{"b":5,"w":"Chorus"}]' && mk.f.length === 2 && mk.f[0].startsWith("Verse@") && mk.opts.join("|") === "Pick a marker|Bar 3 · Verse|Bar 5 · Chorus", "two markers, named, on the song: " + JSON.stringify(mk));
  await sel(p, "drMk", 0);
  const go1 = await p.evaluate(() => ({ s: __aogStudio.SONG.startBar, line: document.getElementById("drLine").textContent }));
  await sel(p, "startSel", 1); await p.evaluate(() => __aogStudio.play()); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('#cyStrip .st-mkf[data-mk="1"]').click()); await p.waitForTimeout(500);
  const go2 = await p.evaluate(() => { const st = __aogStudio; return { on: st.PLAY.on, pos: st.songPos(st.AC.currentTime) }; });
  await p.evaluate(() => __aogStudio.stop());
  ok(go1.s === 3 && go1.line === "Now at bar 3: Verse." && go2.on && go2.pos > 4 * bs && go2.pos < 4 * bs + 1.2, `Go to Verse (stopped): the song starts at bar 3; a tap on Chorus while it plays carries on from bar 5 (now ${go2.pos.toFixed(2)} s)`);

  /* 4 · punch in and out, on track 8 (a take there first: 440 Hz) */
  await sel(p, "startSel", 1);
  await p.evaluate(async () => { const st = __aogStudio, v = [...document.querySelectorAll("#srcSel option")].find(o => /^Guitar take 1/.test(o.textContent)).value; await st.putOn(v, 7); });
  await p.waitForFunction(() => __aogStudio.SONG.tracks[7].clip && !__aogStudio.S.busy, null, { timeout: 30000 });
  await p.evaluate(() => { const x = __aogStudio.SONG.tracks; x.forEach((y, i) => { y.mute = i !== 7; }); __aogStudio.selectTrack(7); __aogStudio.songChanged(); });
  await view(p, "lp"); await click(p, "drPunch"); await sel(p, "drPa", 3); await sel(p, "drPb", 4);
  const pl = await p.evaluate(() => ({ p: JSON.stringify([__aogStudio.SONG.punchOn, __aogStudio.SONG.punch]), l: [...document.querySelectorAll("#drBox .st-line")].map(e => e.textContent).find(t => /changes only/.test(t)), strip: !!document.querySelector("#cyStrip .st-puc") }));
  ok(pl.p === '[true,{"a":3,"b":4}]' && pl.l === "Record your voice changes only bars 3 to 4. The rest stays." && pl.strip, "the punch on bars 3 to 4: " + JSON.stringify(pl));
  const old = await p.evaluate(() => __aogStudio.SONG.tracks[7].clip.id);
  await p.evaluate(() => { __aogStudio.SONG.tracks.forEach(y => { y.mute = false; }); __aogStudio.SONG.tracks[0].mute = true; __aogStudio.songChanged(); });
  await p.click("#voiceRec");
  await p.waitForFunction(() => __aogStudio.VOICE.state === "done" && !__aogStudio.VOICE.busy, null, { timeout: 40000 });
  await p.evaluate(() => { const x = __aogStudio.SONG.tracks; x.forEach((y, i) => { y.mute = i !== 7; }); __aogStudio.songChanged(); });
  await p.evaluate(HELP); await p.evaluate(() => __T.render("punch"));
  const pr = await p.evaluate(old => { const st = __aogStudio, x = st.SONG.tracks[7], d = (t, f, g) => +(__T.tone("punch", f, t, 0.6) - __T.tone("punch", g, t, 0.6)).toFixed(1), b = st.barSec();
    return { comp: JSON.stringify(x.comp), takes: (x.takes || []).map(c => c.id).join(), nw: x.clip.voice, b1: d(0.5 * b, 440, 330), b2: d(1.5 * b, 440, 330), b3: d(2.5 * b, 330, 440), b4: d(3.5 * b, 330, 440), b5: d(4.5 * b, 440, 330), b6: d(5.5 * b, 440, 330), old }; }, old);
  ok(pr.nw && pr.takes === old && pr.comp === `[[0,8,"${old}"],[16,512,"${old}"]]` && [pr.b1, pr.b2, pr.b3, pr.b4, pr.b5, pr.b6].every(v => v > 40),
    `the punch replaces only bars 3 and 4: the take before is ${[pr.b1, pr.b2].join(", ")} dB over the new one in bars 1–2, the new one ${[pr.b3, pr.b4].join(", ")} dB over it in bars 3–4, the old one ${[pr.b5, pr.b6].join(", ")} dB in bars 5–6`);

  /* 5 · a take each time round */
  await view(p, "lp"); await click(p, "drPunch"); await click(p, "loopBtn"); await sel(p, "loopFrom", 1); await sel(p, "loopTo", 2); await view(p, "lp"); await click(p, "drLrec");
  const lrw = await p.evaluate(() => [...document.querySelectorAll("#drBox .st-line")].map(e => e.textContent).join(" | "));
  const n0 = await p.evaluate(() => { const x = __aogStudio.SONG.tracks[7]; return [x.clip].concat(x.takes || []).length; });
  await p.click("#voiceRec");
  await p.waitForFunction(() => __aogStudio.VOICE.rec && __aogStudio.PLAY.on, null, { timeout: 10000 });
  const T0 = await p.evaluate(() => __aogStudio.PLAY.T0);
  await p.waitForFunction(([T0, bs]) => __aogStudio.AC.currentTime > T0 + 2 * bs * 3.25, [T0, bs], { timeout: 40000, polling: 50 });
  await p.click("#voiceStop");
  await p.waitForFunction(() => __aogStudio.VOICE.state === "done" && !__aogStudio.VOICE.busy, null, { timeout: 30000 });
  const lr = await p.evaluate(n0 => { const st = __aogStudio, x = st.SONG.tracks[7], all = [x.clip].concat(x.takes || []), mine = all.filter(c => c.voice).sort((a, b) => a.at - b.at).slice(-4);
    return { n: all.length - n0, bars: mine.map(c => c.startBar).join(), body: mine.map(c => +c.body.toFixed(2)), loud: mine.map(c => Math.round(c.peakDb)), place: x.clip.id === mine[3].id, lanes: document.querySelectorAll('#timeline .st-tkr[data-tkr="7"]').length, loop: st.SONG.loopOn }; }, n0);
  ok(lrw.includes("While the loop plays, each time round is a take of its own.") && lr.n === 4 && lr.bars === "1,1,1,1" && lr.body.slice(0, 3).every(v => near(v, 2 * bs, 0.01)) && lr.body[3] > 0.3 && lr.body[3] < bs && lr.loud.every(v => v > -30) && lr.place && lr.loop,
    `three and a bit times round a two-bar loop: ${lr.n} new takes, each on bar ${lr.bars}, ${lr.body.join(" / ")} s long, all with your voice (${lr.loud.join(", ")} dB); the last plays, the others are take lanes (${lr.lanes})`);

  /* 6 · kept */
  const want = await p.evaluate(() => JSON.stringify([__aogStudio.SONG.marks, __aogStudio.SONG.punch, !!__aogStudio.SONG.lrec]));
  await p.reload(); await T.ready(p);
  const got = await p.evaluate(() => JSON.stringify([__aogStudio.SONG.marks, __aogStudio.SONG.punch, !!__aogStudio.SONG.lrec]));
  const fl = await p.evaluate(async () => { const r = await __aogStudio.readSongFile(await __aogStudio.songFile()); return JSON.stringify([r.song.marks, r.song.punch, !!r.song.lrec]); });
  ok(want === got && got === fl, "a reload and a song file keep the markers, the punch and a take each time round " + got);

  /* 7 · Spanish */
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(100); await view(p, "ck");
  const es = await p.evaluate(() => ({ s: document.querySelector("#drMore summary").textContent, o: [...document.querySelectorAll("#drView option")].map(o => o.textContent).join("|"), b: document.getElementById("drCk").textContent, l: [...document.querySelectorAll("#drBox .st-line")].map(e => e.textContent).join("|"), mk: [...document.querySelectorAll("#cyStrip .st-mkf")].map(e => e.getAttribute("aria-label")).join("|") }));
  ok(es.s === "Bucle, pinchazo, clic y marcas" && es.o === "Bucle y pinchazo|El clic|Marcas" && es.b === "Clic: apagado" && /El clic va solo a tus altavoces/.test(es.l) && es.mk === "Ir al compás 3: Verse|Ir al compás 5: Chorus", "in Spanish: " + JSON.stringify(es));
  await c.close();

  /* 8 · an iPhone and an iPad */
  const open = v => async m => { await view(m, v); await m.evaluate(() => document.getElementById("drBox").scrollIntoView({ block: "start" })); };
  await T.looks(b, U, open("lp"), "#drBox button, #drBox select, #drBox input", "Loop and punch");
  await T.looks(b, U, async m => { await open("mk")(m); await click(m, "drMkAdd"); await click(m, "loopBtn"); await m.evaluate(() => document.getElementById("timeline").scrollIntoView({ block: "start" })); }, "#drBox button, #drBox select, #drBox input, #cyStrip button", "Markers");
  await T.done(b, srv);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
