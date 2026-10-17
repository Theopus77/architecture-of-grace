/* AOG-DESK-ARRANGE-V1, AOG-DESK-CLIPLOOP-V1 (slice 5 of the DAW build) — clip looping and the arrangement:
   · a two-bar piece's right end dragged (the mouse, and a finger on an iPad) to bar 7: it plays three times, each time
     the same sound to the sample; to the middle of bar 6: twice and a part; back inside: shorter; one Undo each;
   · Repeat a section three more times: the section's sound four times, what came after it 6 bars later, one Undo;
   · Add 2 bars at bar 3 on every track: what was at bar 3 is at bar 5 (a piece across it is cut there, its drawn line,
     the sections and the markers move too); Take them out again: the very same song, to the bit;
   · Sections follow the markers: Intro, Chorus and your own words; a new marker makes a new section;
   · Spanish; an iPhone and an iPad, light and dark. Port 9344. */
const T = require("./lib.js"), { ok, near, add, put, HELP } = T;
const PORT = 9344, U = "http://localhost:" + PORT + "/", srv = T.srv(PORT);
const click = (p, id) => p.evaluate(id => document.getElementById(id).click(), id);
const sel = (p, id, v) => p.evaluate(([id, v]) => { const s = document.getElementById(id); s.value = String(v); s.dispatchEvent(new Event("change", { bubbles: true })); }, [id, v]);
const view = async (p, v) => { await p.evaluate(() => { const d = document.getElementById("daMore"); if (!d.open) { d.open = true; d.dispatchEvent(new Event("toggle")); } }); await p.waitForTimeout(50); await sel(p, "daView", v); await p.waitForTimeout(50); };
/* where the right end of piece j of track i is, and how wide a beat is */
const handle = (p, i, j) => p.evaluate(([i, j]) => { const h = document.querySelector(`#timeline .st-lane[data-sel="${i}"] .st-clip[data-pc="${j}"] .st-lph`); h.scrollIntoView({ block: "center" }); const r = h.getBoundingClientRect(), lt = h.closest(".st-lane").querySelector(".st-lt").getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, left: lt.left, per: lt.width / (__aogStudio.tlBars() * 4) }; }, [i, j]);
async function dragTo(p, i, j, beat) { const h = await handle(p, i, j), x1 = h.left + beat * h.per; await p.mouse.move(h.x, h.y); await p.mouse.down(); for (let k = 1; k <= 10; k++) await p.mouse.move(h.x + (x1 - h.x) * k / 10, h.y); await p.mouse.up(); await p.waitForTimeout(150); }
const PIECES = (p, i) => p.evaluate(i => JSON.stringify(__aogStudio.pcs(__aogStudio.SONG.tracks[i].clip).map(q => [+q.a.toFixed(3), +q.b.toFixed(3), +q.at.toFixed(3), q.n])), i);
const CLICKS = `(name) => { const d = __T.B[name].L, o = []; let last = -1e9; for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > 0.05 && i - last > 4410) { o.push(+(i / 44100).toFixed(3)); last = i; } return o; }`;

(async () => {
  const b = await T.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); T.watch(c); await T.routes(c);
  const p = await c.newPage();
  await p.goto(U + "music-studio.html"); await p.waitForTimeout(600); await T.ready(p);
  await add(p, { n: 1, kind: "click", clicks: [0.1, 1.3, 2.5, 3.7], bars: 2 });
  await add(p, { n: 2, f: [440], bars: 2 });
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 2, null, { timeout: 8000 });
  await put(p, 1, 0); await put(p, 2, 1);
  await p.evaluate(HELP); await p.evaluate(`window.__CL = ${CLICKS}`);
  await p.evaluate(() => { const st = __aogStudio; st.SONG.master.glue = 0; st.SONG.tracks[1].mute = true; st.selectTrack(0); st.songChanged(); });
  const bs = await p.evaluate(() => __aogStudio.barSec());

  /* 1 · a piece's end, dragged */
  await p.evaluate(() => __T.render("one"));
  const u0 = await p.evaluate(() => __aogStudio.UNDO.length);
  await dragTo(p, 0, 0, 24);
  const d1 = await PIECES(p, 0), w1 = await p.evaluate(() => document.getElementById("tlLine").textContent), u1 = await p.evaluate(() => __aogStudio.UNDO.length);
  await p.evaluate(() => __T.render("three"));
  const cl3 = await p.evaluate(() => __CL("three")), same = await p.evaluate(bs => __T.same("three", "three", 4 * bs, 6 * bs, 2 * bs), bs);
  ok(d1 === "[[0,8,0,3]]" && w1 === "Piece 1 now plays 3 times, to bar 6." && u1 === u0 + 1 && cl3.length === 12 && near(cl3[4], 0.1 + 2 * bs, 0.002) && near(cl3[11], 3.7 + 4 * bs, 0.002) && same < 1e-6,
    `dragged to bar 7, the piece plays 3 times (${d1}); "${w1}"; its clicks ${cl3.join(", ")}; the third time is the second's sound to the sample (${same})`);
  await dragTo(p, 0, 0, 22);
  const d2 = await PIECES(p, 0), w2 = await p.evaluate(() => document.getElementById("tlLine").textContent);
  await p.evaluate(() => __T.render("bit"));
  const clb = await p.evaluate(() => __CL("bit"));
  ok(d2 === "[[0,8,0,2],[0,6,16,1]]" && w2 === "Piece 1 now plays 2 times and a part, to bar 6." && clb.length === 11 && near(clb[10], 4 * bs + 2.5, 0.002), `to the middle of bar 6: twice and a part of one (${d2}); "${w2}"`);
  await p.click("#tlUndo"); await p.waitForTimeout(100);
  const d3 = await PIECES(p, 0);
  ok(d3 === d1, "Undo: three times again");
  await dragTo(p, 0, 0, 5);
  const d4 = await PIECES(p, 0); await p.click("#tlUndo"); await p.click("#tlUndo"); await p.waitForTimeout(100);
  const d5 = await PIECES(p, 0);
  ok(d4 === "[[0,5,0,1]]" && d5 === "[[0,8,0,1]]", `back inside the piece: shorter (${d4}); Undo twice: as it was (${d5})`);

  /* 2 · repeat a section */
  await p.evaluate(() => { const st = __aogStudio, x = st.SONG.tracks; x[1].mute = false; x[1].clip.pieces = [{ a: 0, b: 8, at: 8, n: 1 }]; st.SONG.sections = [{ a: 0, b: 8, n: "verse" }]; st.songChanged(); });
  await p.evaluate(() => __T.render("sec0"));
  const u2 = await p.evaluate(() => __aogStudio.UNDO.length);
  await view(p, "rp"); await sel(p, "daSec", 0); await sel(p, "daTimes", 3); await click(p, "daRep");
  const rp = await p.evaluate(() => ({ s: JSON.stringify(__aogStudio.SONG.sections), t1: JSON.stringify(__aogStudio.pcs(__aogStudio.SONG.tracks[1].clip).map(q => q.at)), line: document.getElementById("daLine").textContent, u: __aogStudio.UNDO.length }));
  await p.evaluate(() => __T.render("sec3"));
  const rpc = await p.evaluate(bs => ({ cl: __CL("sec3").filter(t => t < 8 * bs - 0.01).length, same: [2, 3].map(k => __T.same("sec3", "sec3", k * 2 * bs, (k + 1) * 2 * bs - 0.05, (k - 1) * 2 * bs)), tone: +(__T.tone("sec3", 440, 8.5 * bs, 0.5) - __T.tone("sec3", 440, 2.5 * bs, 0.5)).toFixed(1) }), bs);
  ok(rp.s === '[{"a":0,"b":8,"n":"verse"},{"a":8,"b":16,"n":"verse"},{"a":16,"b":24,"n":"verse"},{"a":24,"b":32,"n":"verse"}]' && rp.t1 === "[32]" && rp.u === u2 + 1 && rp.line === "Verse now plays 3 more times after itself." && rpc.cl === 16 && rpc.same.every(v => v < 1e-6) && rpc.tone > 60,
    `Repeat Verse 3 more times: four Verses, each the same sound to the sample (${rpc.same.map(v => v.toExponential(0))}); the tone after it moved to bar 9 (${rpc.tone} dB louder there than at bar 3); one Undo; "${rp.line}"`);
  await p.click("#tlUndo"); await p.waitForTimeout(100);
  const rpu = await p.evaluate(() => JSON.stringify(__aogStudio.SONG.sections) + " " + JSON.stringify(__aogStudio.pcs(__aogStudio.SONG.tracks[1].clip).map(q => q.at)));
  ok(rpu === '[{"a":0,"b":8,"n":"verse"}] [8]', "Undo: one Verse again, the tone back at bar 3");

  /* 3 · add and take out bars */
  await p.evaluate(() => { const st = __aogStudio, x = st.SONG.tracks; x[0].clip.pieces = [{ a: 0, b: 8, at: 0, n: 2 }]; x[1].lines = { vol: [[0, 40], [8, 60], [16, 80]] }; st.SONG.marks = [{ b: 2, w: "Intro" }, { b: 4, w: "Chorus" }]; st.SONG.sections = [{ a: 8, b: 16, n: "chorus" }]; st.songChanged(); });
  await p.evaluate(() => __T.render("pre")); const hPre = await p.evaluate(() => __T.hash("pre"));
  await view(p, "br"); await sel(p, "daAt", 3); await sel(p, "daN", 2); await click(p, "daAdd");
  const ad = await p.evaluate(() => { const st = __aogStudio, x = st.SONG.tracks; return { p0: JSON.stringify(st.pcs(x[0].clip).map(q => [q.a, q.b, q.at, q.n])), p1: JSON.stringify(st.pcs(x[1].clip).map(q => q.at)), ln: JSON.stringify(x[1].lines.vol), mk: JSON.stringify(st.SONG.marks), sec: JSON.stringify(st.SONG.sections), line: document.getElementById("daLine").textContent }; });
  await p.evaluate(() => __T.render("ins"));
  const ins = await p.evaluate(bs => ({ gap: __T.peak("ins", 2 * bs + 0.05, 4 * bs - 0.05), same: __T.same("pre", "ins", 4 * bs, 9 * bs, 2 * bs), head: __T.diff("pre", "ins") === 0 ? 0 : __T.same("pre", "ins", 0, 2 * bs - 0.01, 0) }), bs);
  ok(ad.p0 === "[[0,8,0,1],[0,8,16,1]]" && ad.p1 === "[16]" && ad.ln === "[[0,40],[8,60],[16,60],[24,80]]" && ad.mk === '[{"b":2,"w":"Intro"},{"b":6,"w":"Chorus"}]' && ad.sec === '[{"a":16,"b":24,"n":"chorus"}]' && ad.line === "2 empty bars added at bar 3." && ins.gap < 1e-6 && ins.same < 1e-6 && ins.head < 1e-6,
    `Add 2 bars at bar 3: the looped piece is cut there and the rest moves 2 bars (${ad.p0}), the tone, its drawn line, the marker and the section move too; bars 3–4 are silent and what follows is the same sound 2 bars later; "${ad.line}"`);
  await click(p, "daDel");
  await p.evaluate(() => __T.render("back")); const hBack = await p.evaluate(() => __T.hash("back"));
  const bk = await p.evaluate(() => ({ mk: JSON.stringify(__aogStudio.SONG.marks), sec: JSON.stringify(__aogStudio.SONG.sections), line: document.getElementById("daLine").textContent }));
  ok(hBack === hPre && bk.mk === '[{"b":2,"w":"Intro"},{"b":4,"w":"Chorus"}]' && bk.sec === '[{"a":8,"b":16,"n":"chorus"}]' && bk.line === "Bars 3 to 4 are taken out. What came after moved up.", `Take out bars 3 to 4 again: the very same song, to the bit (${hBack}); "${bk.line}"`);
  await sel(p, "daAt", 2); await sel(p, "daN", 1); await click(p, "daDel");
  const dl = await p.evaluate(() => JSON.stringify(__aogStudio.pcs(__aogStudio.SONG.tracks[0].clip).map(q => [q.a, q.b, q.at, q.n])));
  ok(dl === "[[0,4,0,1],[0,8,4,1]]", "Take out bar 2: the piece across it is cut, and the rest moves up a bar " + dl);
  await p.click("#tlUndo");

  /* 4 · sections that follow the markers */
  await p.evaluate(() => { __aogStudio.SONG.marks = [{ b: 1, w: "Intro" }, { b: 3, w: "chorus" }, { b: 5, w: "My bit" }]; __aogStudio.songChanged(); });
  await view(p, "mk"); await click(p, "daMk");
  const sm = await p.evaluate(() => JSON.stringify(__aogStudio.SONG.sections));
  await p.evaluate(() => { const d = document.getElementById("drMore"); d.open = true; d.dispatchEvent(new Event("toggle")); }); await p.waitForTimeout(50); await sel(p, "drView", "mk"); await sel(p, "startSel", 7); await click(p, "drMkAdd"); await p.waitForTimeout(100);
  const sm2 = await p.evaluate(() => ({ s: JSON.stringify(__aogStudio.SONG.sections), strip: [...document.querySelectorAll("#secStrip .st-sec b")].map(e => e.textContent).join("|") }));
  ok(sm === '[{"a":0,"b":8,"n":"intro"},{"a":8,"b":16,"n":"chorus"},{"a":16,"b":20,"w":"My bit"}]' && /\{"a":24,"b":28,"w":"Marker 4"\}\]$/.test(sm2.s) && sm2.strip === "Intro|Chorus|My bit|Marker 4", `the markers make the sections (${sm}); a new marker at bar 7 makes a new one: ${sm2.strip}`);
  const keep = await p.evaluate(async () => { const r = await __aogStudio.readSongFile(await __aogStudio.songFile()); return !!r.song.secMk; });
  ok(keep, "a song file keeps that the sections follow the markers");

  /* 5 · Spanish */
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(100); await view(p, "br");
  const es = await p.evaluate(() => ({ s: document.querySelector("#daMore summary").textContent, o: [...document.querySelectorAll("#daView option")].map(o => o.textContent).join("|"), b: document.getElementById("daAdd").textContent, tip: document.querySelector("#daBox .st-dai > .st-line").textContent }));
  ok(es.s === "Arreglo: repetir, añadir o quitar compases" && es.o === "Repetir una sección|Añadir o quitar compases|Secciones de las marcas" && es.b === "Añadir compases" && es.tip === "Arrastra el extremo derecho de una parte por su carril para repetirla.", "in Spanish: " + JSON.stringify(es));
  await c.close();

  /* 6 · an iPad: a finger drags a piece's end; an iPhone and an iPad, light and dark */
  const cx = await b.newContext({ ...T.pw.devices["iPad (gen 7)"] }); T.watch(cx); await T.routes(cx);
  const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await T.ready(m);
  await add(m, { n: 1, kind: "click", clicks: [0.1], bars: 2 }); await m.waitForFunction(() => __aogStudio.INBOX.items.length === 1); await put(m, 1, 0); await m.waitForTimeout(300);
  const h = await handle(m, 0, 0); await m.waitForTimeout(300); const h2 = await handle(m, 0, 0);
  const s = await m.context().newCDPSession(m), x1 = h2.left + 16 * h2.per;
  await s.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: h2.x, y: h2.y }] });
  for (let k = 1; k <= 10; k++) { await s.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: h2.x + (x1 - h2.x) * k / 10, y: h2.y }] }); await m.waitForTimeout(16); }
  await s.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await m.waitForTimeout(300);
  const tp = await m.evaluate(() => ({ p: JSON.stringify(__aogStudio.pcs(__aogStudio.SONG.tracks[0].clip).map(q => [q.a, q.b, q.at, q.n])), sx: scrollX }));
  ok(tp.p === "[[0,8,0,2]]" && tp.sx === 0, "iPad: a finger drags the piece's end to bar 5: it plays twice " + JSON.stringify(tp));
  await cx.close();
  await T.looks(b, U, async m => { await view(m, "br"); await m.evaluate(() => document.getElementById("daBox").scrollIntoView({ block: "center" })); }, "#daBox button, #daBox select", "Arrange");
  await T.done(b, srv);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
