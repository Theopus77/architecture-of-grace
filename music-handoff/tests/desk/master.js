/* AOG-DESK-MASTER-V1, AOG-DESK-GROUPS-V1 (slice 1 of the DAW build) — sends and a master you can see:
   · a song with nothing new set renders to the very same bits as the desk before this change (origin/main);
   · the Room send adds a reverb tail, after the fader (12 dB down on the fader is 12 dB less tail), and the Room return
     sets its level (0: no tail; 40 is 12 dB under 80); the Echo comes exactly one beat later at the song's tempo and its
     return sets its level;
   · the Low cut takes 40 Hz down and leaves 1 kHz alone; EQ Off is the flat EQ; the curve is drawn;
   · the Glue set by hand: a make-up of 6 dB is 6.0 dB louder than Glue Off; a threshold of −30 dB at 4:1 holds a loud tone
     back, and its meter says how much while it plays; the limiter's bypass lets the peaks through;
   · the stereo meter reads +1 for the same sound in both speakers, −1 for one turned upside down; the spectrum draws only
     while the song plays and rests when it stops;
   · groups: two Drums tracks move together by the same decibels, one Undo; a track in no group stays;
   · kept by a reload and by a song file; Spanish; an iPhone and an iPad, light and dark. Port 9340. */
const T = require("./lib.js"), { ok, near, add, put, HELP } = T;
const PORT = 9340, U = "http://localhost:" + PORT + "/", srv = T.srv(PORT);
const setRange = (p, sel, v) => p.evaluate(([sel, v]) => { const r = document.querySelector(sel); r.value = String(v); r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true })); }, [sel, v]);
const view = async (p, v) => { await p.evaluate(() => { const d = document.getElementById("pmBox"); if (!d.open) { d.open = true; d.dispatchEvent(new Event("toggle")); } }); await p.waitForTimeout(50); await p.selectOption("#pmView", v); await p.waitForTimeout(50); };
const M = (p, fn) => p.evaluate(`(()=>{ const st=__aogStudio, m=st.SONG.master, x=st.SONG.tracks; (${fn})(m, x, st); st.songChanged(); })()`);
const R = (p, n) => p.evaluate(n => __T.render(n), n);

(async () => {
  const b = await T.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); T.watch(c); await T.routes(c, true);
  const p = await c.newPage();
  await p.goto(U + "music-studio.html"); await p.waitForTimeout(600); await T.ready(p);
  await add(p, { n: 1, kind: "click", clicks: [0.5], bars: 4 });
  await add(p, { n: 2, f: [40, 1000], amps: [0.5, 0.5], bars: 6 });
  await add(p, { n: 3, f: [220], bars: 6, amp: 12000 });
  await add(p, { n: 4, f: [330], bars: 6, inv: true });
  await add(p, { n: 5, f: [100], bars: 4, amp: 32000 });
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 5, null, { timeout: 8000 });
  await put(p, 1, 0); await put(p, 2, 1); await put(p, 3, 2); await put(p, 4, 3); await put(p, 5, 4);
  await p.evaluate(HELP);
  ok(await p.evaluate(() => __aogStudio.songBpm()) === 100, "the song is at 100 beats a minute");

  /* 0 · nothing new set: the same bits as the desk before (git origin/main) */
  await M(p, (m, x) => { Object.assign(x[0], { vol: 70, pan: -20, low: 3 }); Object.assign(x[1], { vol: 60, high: -4 }); x[2].mute = x[3].mute = x[4].mute = true; m.glue = 40; m.low = 2; m.high = -1; });
  await R(p, "now"); const hNow = await p.evaluate(() => __T.hash("now"));
  let hOld = "no old page";
  if (T.oldPage()) { const q = await c.newPage(); await q.goto(U + "music-studio-before.html"); await q.waitForFunction(() => window.__aogStudio && !__aogStudio.S.decoding && __aogStudio.SONG.tracks.every(x => !x.clip || __aogStudio.BUF.has(x.clip.id)), null, { timeout: 30000 });
    await q.evaluate(HELP); await q.evaluate(() => __T.render("old")); hOld = await q.evaluate(() => __T.hash("old")); await q.close(); }
  ok(hNow === hOld, "a song with nothing new set is the same to the bit as the desk before this change: " + hNow + " / " + hOld);

  /* 1 · the Room send and return */
  await M(p, (m, x) => { x.forEach((y, i) => { y.mute = i !== 0; }); Object.assign(x[0], { vol: 80, pan: 0, low: 0, room: 0, echo: 0 }); m.glue = 0; m.low = 0; m.high = 0; });
  await R(p, "dry"); await M(p, (m, x) => { x[0].room = 60; }); await R(p, "wet");
  await M(p, (m, x) => { x[0].vol = 40; }); await R(p, "wetLow"); await M(p, (m, x) => { x[0].vol = 80; });
  const tail = await p.evaluate(() => ({ dry: __T.energy("dry", 0.62, 2.2), wet: __T.energy("wet", 0.62, 2.2), low: __T.energy("wetLow", 0.62, 2.2) }));
  const post = 10 * Math.log10(tail.low / tail.wet);
  ok(tail.dry < 1e-9 && tail.wet > 1e-4 && near(post, -12, 0.3), `the Room send adds a tail after the click (${tail.dry.toExponential(1)} → ${tail.wet.toExponential(2)}), after the fader: the fader 12 dB down gives a tail ${post.toFixed(2)} dB`);
  await view(p, "rt");
  await setRange(p, "#pm-rvRet", 40); await R(p, "ret40"); const r40 = await p.evaluate(() => [__T.energy("ret40", 0.62, 2.2), __aogStudio.SONG.master.rvRet, document.getElementById("pm-rvRet-o").textContent]);
  await setRange(p, "#pm-rvRet", 0); await R(p, "ret0"); const r0 = await p.evaluate(() => __T.energy("ret0", 0.62, 2.2));
  await setRange(p, "#pm-rvRet", 80); const r80 = await p.evaluate(() => "rvRet" in __aogStudio.SONG.master);
  const rd = 10 * Math.log10(r40[0] / tail.wet);
  ok(near(rd, -12, 0.3) && r40[1] === 40 && r40[2] === "−12 dB" && r0 < 1e-9 && !r80, `the Room return: at 40 the tail is ${rd.toFixed(2)} dB (−12 dB in level), its words "${r40[2]}"; at 0 no tail (${r0.toExponential(1)}); back at 80 the song holds nothing new`);
  /* 2 · the Echo, one beat later, and its return */
  await M(p, (m, x) => { x[0].room = 0; x[0].echo = 60; m.et = "q"; }); await R(p, "echo");
  const e1 = await p.evaluate(() => ({ at: __T.peakAt("echo", 0.9, 1.4), pk: __T.peak("echo", 1.05, 1.2), before: __T.peak("echo", 0.6, 1.05) }));
  await setRange(p, "#pm-dlRet", 40); await R(p, "echo40"); const e40 = await p.evaluate(() => __T.peak("echo40", 1.05, 1.2));
  await setRange(p, "#pm-dlRet", 0); await R(p, "echo0"); const e0 = await p.evaluate(() => __T.peak("echo0", 0.6, 2.5));
  await setRange(p, "#pm-dlRet", 80);
  ok(near(e1.at, 1.1, 0.003) && e1.before < 1e-4 && near(20 * Math.log10(e40 / e1.pk), -12, 0.5) && e0 < 1e-6, `the Echo comes one beat (0.6 s) after the click, at ${e1.at.toFixed(4)} s; its return at 40 is ${(20 * Math.log10(e40 / e1.pk)).toFixed(2)} dB; at 0 nothing`);
  await M(p, (m, x) => { x[0].echo = 0; delete m.et; });

  /* 3 · the EQ: the Low cut, the bypass, the curve */
  await M(p, (m, x) => { x.forEach((y, i) => { y.mute = i !== 1; }); Object.assign(x[1], { vol: 80, high: 0 }); });
  await R(p, "flat"); await view(p, "eq");
  const d0 = await p.evaluate(() => document.querySelector("#pmEqC path.c").getAttribute("d"));
  await p.selectOption("#pmLc", "120"); await R(p, "lc");
  const d1 = await p.evaluate(() => document.querySelector("#pmEqC path.c").getAttribute("d"));
  const lc = await p.evaluate(() => ({ f40: __T.tone("lc", 40, 1, 2) - __T.tone("flat", 40, 1, 2), f1k: __T.tone("lc", 1000, 1, 2) - __T.tone("flat", 1000, 1, 2), m: __aogStudio.SONG.master.lc }));
  ok(lc.m === 120 && lc.f40 < -15 && Math.abs(lc.f1k) < 0.2 && d0 !== d1 && parseFloat(d1.split(" ")[1]) > parseFloat(d0.split(" ")[1]) + 20, `the Low cut below 120 Hz: 40 Hz ${lc.f40.toFixed(1)} dB, 1 kHz ${lc.f1k.toFixed(2)} dB; the curve drops at the left`);
  await M(p, m => { m.low = 6; m.mid = -4; m.high = 5; }); await R(p, "eqOn");
  await p.click("#pmEqOn"); await R(p, "eqOff");
  const eqb = await p.evaluate(() => ({ off: __aogStudio.SONG.master.eqOff, pressed: document.getElementById("pmEqOn").getAttribute("aria-pressed"), w: document.getElementById("pmEqOn").textContent, d: __T.diff("eqOff", "flat"), on: __T.diff("eqOn", "flat") }));
  ok(eqb.off === true && eqb.pressed === "false" && eqb.w === "EQ: Off" && eqb.d < 1e-6 && eqb.on > 0.01, `EQ Off is the flat EQ (the most any sample differs: ${eqb.d.toExponential(1)}; with it on, ${eqb.on.toFixed(3)}), "${eqb.w}"`);
  await p.click("#pmEqOn"); await M(p, m => { m.low = 0; m.mid = 0; m.high = 0; delete m.lc; });

  /* 4 · the Glue by hand, its bypass and its meter; the limiter */
  await M(p, (m, x) => { x.forEach((y, i) => { y.mute = i !== 2; }); x[2].vol = 80; m.glue = 0; });
  await view(p, "gl");
  await p.click("#pmGlOn"); await R(p, "gOff"); await p.click("#pmGlOn");
  await setRange(p, "#pm-mk", 6); await R(p, "g6");
  const g6 = await p.evaluate(() => ({ gc: JSON.stringify(__aogStudio.SONG.master.gc), d: __T.db("g6", 1, 4) - __T.db("gOff", 1, 4), hand: document.getElementById("pmGlW").textContent, kb: !document.getElementById("pmGlKnob").hidden }));
  ok(g6.gc === '{"thr":0,"ratio":1,"mk":6}' && near(g6.d, 6, 0.1) && g6.hand === "Set by hand. The Glue knob rests." && g6.kb, `the Glue's make-up of 6 dB, set by hand: ${g6.d.toFixed(2)} dB louder than Glue Off ${g6.gc}; "${g6.hand}"`);
  await setRange(p, "#pm-mk", 0); await setRange(p, "#pm-thr", -30); await setRange(p, "#pm-ratio", 4); await R(p, "gc");
  const gq = await p.evaluate(() => __T.db("gc", 1, 4) - __T.db("gOff", 1, 4));
  ok(gq < -3, `the Glue starting at −30 dB at 4 : 1 holds a loud tone back ${gq.toFixed(1)} dB`);
  await p.evaluate(() => { const s = document.getElementById("startSel"); s.value = "1"; s.dispatchEvent(new Event("change", { bubbles: true })); __aogStudio.play(); });
  await p.waitForTimeout(1800);
  const gr = await p.evaluate(() => document.getElementById("pmGr").textContent);
  await p.evaluate(() => __aogStudio.stop()); await p.waitForTimeout(100);
  const gr0 = await p.evaluate(() => document.getElementById("pmGr").textContent);
  const grN = +((/([\d.]+) dB/.exec(gr) || [])[1] || 0);
  ok(grN > 3 && gr0 === "Holding back now: —", `while it plays the Glue says "${gr}"; stopped, "${gr0}"`);
  await p.click("#pmGlKnob"); const back = await p.evaluate(() => ({ gc: "gc" in __aogStudio.SONG.master, w: document.getElementById("pmGlW").textContent }));
  ok(!back.gc && back.w === "Glue brings the loudest moments a little closer to the rest.", "Use the Glue knob again: the knob decides again");
  await M(p, (m, x) => { x.forEach((y, i) => { y.mute = i !== 4; }); x[4].vol = 100; m.glue = 0; });
  await R(p, "lim"); await view(p, "lim"); await p.click("#pmLimOn"); await R(p, "limOff");
  const lim = await p.evaluate(() => ({ on: __T.peak("lim", 0.5, 3), off: __T.peak("limOff", 0.5, 3), w: document.getElementById("pmLimOn").textContent }));
  await p.click("#pmLimOn");
  ok(lim.off > lim.on * 1.12 && lim.off <= 0.981 && lim.w === "Limiter: Off", `the limiter holds the peaks at ${lim.on.toFixed(3)}; bypassed they reach ${lim.off.toFixed(3)} (the safety ceiling still under 0.98)`);

  /* 5 · the stereo meter and the spectrum */
  await M(p, (m, x) => { x.forEach((y, i) => { y.mute = i !== 2; }); x[2].vol = 60; });
  await view(p, "mt");
  const d00 = await p.evaluate(() => __aogDeskPro.DP.draws);
  await p.waitForTimeout(600);
  const dIdle = await p.evaluate(() => __aogDeskPro.DP.draws);
  await p.evaluate(() => __aogStudio.play()); await p.waitForTimeout(1500);
  const mono = await p.evaluate(() => ({ c: __aogDeskPro.DP.corr, w: document.getElementById("pmStW").textContent, d: __aogDeskPro.DP.draws, x: document.getElementById("pmStI").style.left }));
  await p.evaluate(() => __aogStudio.stop()); await p.waitForTimeout(150);
  await M(p, (m, x) => { x.forEach((y, i) => { y.mute = i !== 3; }); x[3].vol = 60; });
  await p.evaluate(() => __aogStudio.play()); await p.waitForTimeout(1500);
  const anti = await p.evaluate(() => ({ c: __aogDeskPro.DP.corr, w: document.getElementById("pmStW").textContent }));
  await p.evaluate(() => __aogStudio.stop()); await p.waitForTimeout(150);
  const r1 = await p.evaluate(() => ({ d: __aogDeskPro.DP.draws, w: document.getElementById("pmStW").textContent, hid: document.getElementById("pmStI").hidden }));
  await p.waitForTimeout(1000);
  const r2 = await p.evaluate(() => __aogDeskPro.DP.draws);
  ok(mono.c > 0.98 && /almost the same in both$/.test(mono.w) && mono.x === "100.0%" || (mono.c > 0.98 && /almost the same/.test(mono.w)), `the same sound in both speakers reads ${mono.c.toFixed(3)}: "${mono.w}"`);
  ok(anti.c < -0.98 && /the sides cancel/.test(anti.w), `one side turned upside down reads ${anti.c.toFixed(3)}: "${anti.w}"`);
  ok(dIdle === d00 && mono.d > d00 + 10 && r2 === r1.d && r1.w === "—" && r1.hid, `the spectrum draws only while the song plays (${d00} idle → ${mono.d} playing), and rests when it stops (${r1.d} then ${r2} a second later)`);

  /* 6 · groups */
  await M(p, (m, x) => { x.forEach(y => { y.mute = false; }); x[0].vol = 80; x[1].vol = 40; x[2].vol = 60; });
  await view(p, "gp");
  await p.selectOption("#pmG0", "drums"); await p.selectOption("#pmG1", "drums");
  const gsay = await p.evaluate(() => [...document.querySelectorAll("#proMaster .st-pmp .st-line")].pop().textContent);
  const u0 = await p.evaluate(() => __aogStudio.UNDO.length);
  await setRange(p, "#t0-vol", 40);
  const g1 = await p.evaluate(() => ({ v: __aogStudio.SONG.tracks.map(x => x.vol).slice(0, 3), s: document.getElementById("t1-vol").value, f: document.getElementById("fv1").value, u: __aogStudio.UNDO.length }));
  await p.evaluate(() => { const r = document.getElementById("fv1"); r.value = "40"; r.dispatchEvent(new Event("input", { bubbles: true })); r.dispatchEvent(new Event("change", { bubbles: true })); });
  const g2 = await p.evaluate(() => __aogStudio.SONG.tracks.map(x => x.vol).slice(0, 3));
  await p.click("#tlUndo"); await p.click("#tlUndo"); const g3 = await p.evaluate(() => __aogStudio.SONG.tracks.map(x => x.vol).slice(0, 3));
  ok(gsay === "Drums moves together: Track 1 and Track 2." && g1.v.join() === "40,20,60" && g1.s === "20" && g1.f === "20" && g1.u === u0 + 1 && g2.join() === "80,40,60" && g3.join() === "80,40,60",
    `Drums: track 1's fader to half (−12 dB) takes track 2 from 40 to ${g1.v[1]} (−12 dB too), track 3 stays; the console's fader of track 2 back up brings track 1 along (${g2}); Undo puts them back (${g3}); "${gsay}"`);

  /* 7 · kept: a reload, a song file */
  await M(p, m => { m.rvRet = 50; m.lc = 60; m.gc = { thr: -12, ratio: 2.5, mk: 1.5 }; m.limOff = true; });
  const want = await p.evaluate(() => JSON.stringify([__aogStudio.SONG.master.rvRet, __aogStudio.SONG.master.lc, __aogStudio.SONG.master.gc, __aogStudio.SONG.master.limOff, __aogStudio.SONG.tracks.map(x => x.grp || "")]));
  await p.reload(); await T.ready(p); await p.waitForTimeout(200);
  const got = await p.evaluate(() => JSON.stringify([__aogStudio.SONG.master.rvRet, __aogStudio.SONG.master.lc, __aogStudio.SONG.master.gc, __aogStudio.SONG.master.limOff, __aogStudio.SONG.tracks.map(x => x.grp || "")]));
  const viaFile = await p.evaluate(async () => { const f = await __aogStudio.songFile(), r = await __aogStudio.readSongFile(f), m = r.song.master; return JSON.stringify([m.rvRet, m.lc, m.gc, m.limOff, r.song.tracks.map(x => x.grp || "")]); });
  ok(want === got && got === viaFile, "a reload and a song file keep the returns, the Low cut, the Glue by hand, the limiter's bypass and the groups " + got);
  await M(p, m => { delete m.rvRet; delete m.lc; delete m.gc; delete m.limOff; });

  /* 8 · Spanish */
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(100); await view(p, "gl");
  const es = await p.evaluate(() => ({ s: document.querySelector("#pmBox summary").textContent, o: [...document.querySelectorAll("#pmView option")].map(o => o.textContent).join(" | "), b: document.getElementById("pmGlOn").textContent, l: [...document.querySelectorAll("#proMaster .st-lab")].map(e => e.textContent).join(" | ") }));
  ok(es.s === "Más para toda la canción" && es.o === "Retornos de sala y eco | Ecualizador y corte de graves | Unión | Limitador | Estéreo y espectro | Grupos | Comparar con una canción (A/B)" && es.b === "Unión: encendido" && /Empieza en \| Proporción \| Compensar/.test(es.l), "in Spanish: " + JSON.stringify(es));
  await p.evaluate(() => document.getElementById("langBtn").click());
  await c.close();

  /* 9 · an iPhone and an iPad, light and dark */
  const open = v => async m => { await view(m, v); await m.evaluate(() => document.getElementById("proMaster").scrollIntoView({ block: "start" })); };
  await T.looks(b, U, open("gl"), "#proMaster button, #proMaster select, #proMaster input", "the Glue");
  await T.looks(b, U, open("gp"), "#proMaster button, #proMaster select, #proMaster input", "Groups");
  await T.done(b, srv);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
