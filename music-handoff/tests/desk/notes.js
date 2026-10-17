/* AOG-DESK-NOTES-V1 (slice 4 of the DAW build) — note editing deluxe in the piano-roll (aog-desk-notes.js, fetched the
   first time Edit the notes opens):
   · Line up: sloppy notes (up to 0.08 beats off) on 1/8 all the way land exactly on it, and the piano plays them back on
     it (each attack within 5 ms of its line); halfway moves each half the way; swing 100 % puts every offbeat a third of
     a step late; Undo brings them back;
   · Feel: every note moves at most 10 ms and its strength at most 10 %, and some do move;
   · the Strength lane: a drag along its top makes the notes it crosses full strength;
   · Lengths: each note held to the next; all a beat long;
   · Move in the key: in C major E goes to F, B to C, C♯ (not in the key) up to D and down to C; in A minor C goes to D;
   · copy two notes and paste them at bar 3; Show the key lights the key's rows;
   · Spanish; an iPhone and an iPad, light and dark. Port 9343. */
const T = require("./lib.js"), { ok, near, put, HELP } = T;
const PORT = 9343, U = "http://localhost:" + PORT + "/", srv = T.srv(PORT);
const click = (p, id) => p.evaluate(id => document.getElementById(id).click(), id);
const sel = (p, id, v) => p.evaluate(([id, v]) => { const s = document.getElementById(id); s.value = String(v); s.dispatchEvent(new Event("change", { bubbles: true })); }, [id, v]);
const range = (p, id, v) => p.evaluate(([id, v]) => { const s = document.getElementById(id); s.value = String(v); s.dispatchEvent(new Event("input", { bubbles: true })); }, [id, v]);
/* a note take (8 notes a half beat apart at 100 a minute) on the inbox: rendered by the piano, or a plain tone */
const NOTE_TAKE = async (p, n, real) => p.evaluate(async ([n, real]) => {
  const ev = Array.from({ length: 8 }, (_, k) => ({ t: 0.05 + k * 0.3, m: 60 + [0, 4, 7, 4, 5, 9, 7, 11][k], v: 0.7, d: 0.25 }));
  let L, R, sr = 44100, lag = 0;
  if (real) { const r = await AOGPianoRoll.renderHere("piano", { sound: "", was: "", events: ev, sec: 4, tail: 0, set: {}, space: 0, sr: 44100 }); L = r.L; R = r.R || r.L; sr = r.sr || 44100;
    let m = 0; for (let i = 0; i < L.length; i++) m = Math.max(m, Math.abs(L[i])); for (let i = 0; i < L.length; i++) if (Math.abs(L[i]) > m * 0.05) { lag = Math.round((i / sr - 0.05) * 1e4) / 1e4; break; } }
  else { L = new Float32Array(sr * 4); ev.forEach(e => { for (let i = Math.round(e.t * sr); i < Math.round((e.t + 0.2) * sr); i++) L[i] = 0.25 * Math.sin(2 * Math.PI * 262 * i / sr); }); R = L; }
  const N = L.length, ab = new ArrayBuffer(44 + N * 4), v = new DataView(ab), s = (q, t) => { for (let i = 0; i < t.length; i++) v.setUint8(q + i, t.charCodeAt(i)); };
  s(0, "RIFF"); v.setUint32(4, 36 + N * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, N * 4, true);
  for (let i = 0; i < N; i++) { v.setInt16(44 + i * 4, Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767))), true); v.setInt16(46 + i * 4, Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))), true); }
  await AOGHandoff.add(AOGHandoff.INBOX, { from: "piano", n: n, name: { en: "Take " + n, es: "Toma " + n }, sec: N / sr, bpm: 100, bars: 1, at: Date.now() + n, take: true, notes: { v: 1, room: "piano", sound: "", set: {}, space: 0, sr: 44100, lag: lag, ev: ev, ped: [] }, wav: new Blob([ab], { type: "audio/wav" }) }, { key: "notes|" + n });
  return lag; }, [n, real]);
const openRoll = async p => { await p.evaluate(() => __aogStudio.openNotes(0)); await p.waitForFunction(() => window.AOGNotesPro && AOGNotesPro.on && document.getElementById("apxMore"), null, { timeout: 15000 });
  await p.evaluate(() => { const d = document.getElementById("apxMore"); d.open = true; }); };
const tool = (p, k) => sel(p, "apxTool", k);
const EV = p => p.evaluate(() => { const A = AOGPianoRoll.api(), T = A.st(); return T.ev.map(e => ({ id: e.id, b: A.bOf(e), t: e.t, m: e.m, v: e.v, d: e.d })); });

(async () => {
  const b = await T.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); T.watch(c); await T.routes(c);
  const p = await c.newPage();
  await p.goto(U + "music-studio.html"); await p.waitForTimeout(600); await T.ready(p);
  const lag = await NOTE_TAKE(p, 1, true);
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 1, null, { timeout: 8000 });
  await put(p, 1, 0, "piano"); await p.evaluate(HELP);
  const loads = await p.evaluate(() => !!window.AOGNotesPro);
  await openRoll(p);
  ok(!loads && await p.evaluate(() => [...document.querySelectorAll('script[src="/aog-desk-notes.js"]')].length === 1), "the note tools are fetched only when Edit the notes first opens (lag " + lag + " s)");

  /* 1 · line up: first a beat apart (the piano plays them back), then half a beat apart */
  const off = [0.06, -0.08, 0.05, -0.03, 0.08, -0.06, 0.04, -0.07];
  await p.evaluate(off => { const A = AOGPianoRoll.api(), T = A.st(); T.ev.forEach((e, k) => { e.t = A.r4(A.tOf(k + off[k])); e.d = 0.2; }); A.paint(); }, off);
  await tool(p, "q"); await sel(p, "apxGrid", "8"); await range(p, "apxSw", 0); await range(p, "apxAmt", 100); await click(p, "apxQ");
  await click(p, "aprPlay"); await p.waitForFunction(() => AOGPianoRoll._t.ST && AOGPianoRoll._t.ST.fresh, null, { timeout: 60000 });
  const att = await p.evaluate(() => { const T = AOGPianoRoll._t.ST, o = T.fresh.out, L = o.L, sr = o.sr || 44100, F = 128, nF = Math.floor(L.length / F), E = new Float64Array(nF); let mx = 0;
    for (let f = 0; f < nF; f++) { let e = 0; for (let i = f * F; i < f * F + F; i++) e += L[i] * L[i]; E[f] = e; mx = Math.max(mx, e); }
    const on = []; let last = -1e9; for (let f = 1; f < nF; f++) { let m = 0; const j0 = Math.max(0, f - 8); for (let j = j0; j < f; j++) m += E[j]; m /= f - j0; if (E[f] > 4 * m + 1e-12 && E[f] > 0.01 * mx && (f - last) * F / sr > 0.3) { on.push(f * F / sr); last = f; } }
    const want = Array.from({ length: 8 }, (_, k) => T.head + k * T.B); return { on, want, err: Math.max(...on.map((t, k) => Math.abs(t - want[k]))) }; });
  ok(att.on.length === 8 && att.err <= 0.005, `Line up on 1/8, then played back by the piano: each attack is within ${(att.err * 1000).toFixed(1)} ms of its line`);
  await click(p, "aprKeepOld");
  await p.evaluate(off => { const A = AOGPianoRoll.api(), T = A.st(); T.ev.forEach((e, k) => { e.t = A.r4(A.tOf(k * 0.5 + off[k])); e.d = 0.25; }); A.paint(); }, off);
  const before = await EV(p);
  await click(p, "apxQ");
  const q1 = await EV(p), line = await p.evaluate(() => document.getElementById("aprLine").textContent);
  ok(q1.every((e, k) => near(e.b, k * 0.5, 2e-3)) && line === "8 notes lined up on 1/8.", `Line up on 1/8: every note lands on its line (the most off: ${Math.max(...q1.map((e, k) => Math.abs(e.b - k * 0.5))).toFixed(4)} beats, from up to 0.08); "${line}"`);
  await click(p, "aprUndo");
  const un = await EV(p);
  ok(un.every((e, k) => near(e.b, before[k].b, 1e-4)), "Undo brings the notes back where they were");
  await range(p, "apxAmt", 50); await click(p, "apxQ");
  const q2 = await EV(p);
  ok(q2.every((e, k) => near(e.b - k * 0.5, off[k] / 2, 2e-3)), "halfway: each note moves half the way to its line");
  await click(p, "aprUndo"); await range(p, "apxAmt", 100); await range(p, "apxSw", 100); await click(p, "apxQ");
  const q3 = await EV(p);
  ok(q3.every((e, k) => near(e.b, k * 0.5 + (k % 2 ? 0.5 / 3 : 0), 2e-3)), `swing 100 %: every offbeat is a third of a 1/8 late (${q3.map(e => e.b.toFixed(3)).join(", ")})`);
  await range(p, "apxSw", 0); await click(p, "apxQ");

  /* 2 · feel */
  const f0 = await EV(p);
  await tool(p, "h"); await sel(p, "apxHt", 10); await sel(p, "apxHv", 10); await click(p, "apxH");
  const f1 = await EV(p);
  const dt = f1.map((e, k) => Math.abs(e.t - f0[k].t)), dv = f1.map((e, k) => Math.abs(e.v / f0[k].v - 1));
  ok(Math.max(...dt) <= 0.0101 && dt.some(x => x > 0.001) && Math.max(...dv) <= 0.101 && dv.some(x => x > 0.01), `Make it feel played: timing moves up to ${(Math.max(...dt) * 1000).toFixed(1)} ms, strength up to ${(Math.max(...dv) * 100).toFixed(1)} %`);
  await click(p, "aprUndo");

  /* 3 · the Strength lane */
  await click(p, "apxVl"); await p.waitForTimeout(100);
  const vl = await p.evaluate(() => { const r = document.getElementById("apxVLin").getBoundingClientRect(), A = AOGPianoRoll.api(), T = A.st(); document.getElementById("apxVL").scrollIntoView({ block: "center" }); const r2 = document.getElementById("apxVLin").getBoundingClientRect(); return { x0: r2.left + (A.bOf(T.ev[0]) - T.b0) * T.ppb + 4, x1: r2.left + (A.bOf(T.ev[3]) - T.b0) * T.ppb + 4, y: r2.top + 2, bars: document.querySelectorAll("#apxVLin .apr-vb").length }; });
  await p.mouse.move(vl.x0, vl.y); await p.mouse.down(); for (let k = 1; k <= 12; k++) await p.mouse.move(vl.x0 + (vl.x1 - vl.x0) * k / 12, vl.y); await p.mouse.up(); await p.waitForTimeout(100);
  const v1 = await EV(p);
  ok(vl.bars === 8 && v1.slice(0, 4).every(e => e.v >= 0.95) && v1.slice(4).every(e => near(e.v, 0.7, 1e-6)), `the Strength lane: 8 bars; a drag along its top makes notes 1 to 4 full strength (${v1.map(e => e.v).join(", ")}), the rest stay`);
  await click(p, "aprUndo");

  /* 4 · lengths */
  await tool(p, "l"); await click(p, "apxLeg");
  const l1 = await EV(p);
  ok(l1.slice(0, 7).every((e, k) => near(e.d, l1[k + 1].t - e.t, 1e-3)), "each note held to the next one");
  await sel(p, "apxLen", "4"); await click(p, "apxFix");
  const l2 = await EV(p), B = await p.evaluate(() => AOGPianoRoll.api().st().B);
  ok(l2.every(e => near(e.d, B, 1e-3)), `all a beat long (${B.toFixed(3)} s)`);

  /* 5 · in the key */
  await p.evaluate(() => AOGSong.set({ key: 0, minor: false }));
  await p.evaluate(() => { const A = AOGPianoRoll.api(), T = A.st(); [64, 71, 61, 60, 67, 69, 62, 65].forEach((m, k) => { T.ev[k].m = m; }); T.sel = new Set(); A.paint(); });
  await tool(p, "k"); await sel(p, "apxBy", 1); await click(p, "apxKu");
  const k1 = (await EV(p)).map(e => e.m), kw = await p.evaluate(() => document.getElementById("apxKeyW").textContent);
  await click(p, "aprUndo"); await click(p, "apxKd");
  const k2 = (await EV(p)).map(e => e.m);
  ok(k1.join() === "65,72,62,62,69,71,64,67" && k2.join() === "62,69,60,59,65,67,60,64" && kw === "In C major.", `Move in the key (C major): up a step ${k1.join(",")}, down a step ${k2.join(",")}`);
  await click(p, "aprUndo");
  await p.evaluate(() => AOGSong.set({ key: 9, minor: true })); await tool(p, "c"); await tool(p, "k");
  await p.evaluate(() => { const A = AOGPianoRoll.api(), T = A.st(); T.ev[0].m = 72; T.sel = new Set([T.ev[0].id]); A.paint(); });
  await sel(p, "apxBy", 2); await click(p, "apxKu");
  const k3 = await p.evaluate(() => [AOGPianoRoll.api().st().ev[0].m, AOGPianoRoll.api().st().ev[1].m, document.getElementById("apxKeyW").textContent]);
  ok(k3[0] === 76 && k3[1] === 71 && k3[2] === "In A minor.", `in A minor, two steps up from C is E (${k3[0]}); only the picked note moves`);

  /* 6 · copy and paste; Show the key */
  await p.evaluate(() => { const A = AOGPianoRoll.api(), T = A.st(); T.sel = new Set([T.ev[0].id, T.ev[1].id]); A.paint(); });
  await tool(p, "c"); await click(p, "apxCopy"); await sel(p, "apxAt", 3); await click(p, "apxPaste");
  const cp = await p.evaluate(() => { const A = AOGPianoRoll.api(), T = A.st(), first = T.host.firstBar(); const P = T.ev.filter(e => T.sel.has(e.id)); return { n: T.ev.length, p: P.map(e => [+(A.bOf(e) - (3 - first) * T.bpb).toFixed(3), e.m]), o: [T.ev[0], T.ev[1]].map(e => [+(A.bOf(e) - A.bOf(T.ev[0])).toFixed(3), e.m]), line: document.getElementById("aprLine").textContent }; });
  ok(cp.n === 10 && JSON.stringify(cp.p) === JSON.stringify(cp.o) && cp.line === "2 notes pasted at bar 3.", "copy two notes, paste them at bar 3: the same notes, the same spacing " + JSON.stringify(cp));
  const sh = await p.evaluate(() => ({ bg: document.getElementById("apxSc").style.backgroundImage, sc: document.querySelectorAll("#aprKeys div.sc").length, all: document.querySelectorAll("#aprKeys div").length }));
  ok(/rgba\(240, 194, 110, 0\.17\)/.test(sh.bg) && sh.sc > 0 && near(sh.sc / sh.all, 7 / 12, 0.08), `Show the key: the key's rows are lit (${sh.sc} of ${sh.all} rows)`);
  await click(p, "aprDone");

  /* 7 · Spanish */
  await p.evaluate(() => document.getElementById("langBtn").click()); await openRoll(p);
  const es = await p.evaluate(() => ({ s: document.getElementById("apxSum").textContent, o: [...document.querySelectorAll("#apxTool option")].map(o => o.textContent).join("|"), b: document.getElementById("apxVl").textContent }));
  ok(es.s === "Más herramientas de notas" && es.o === "Alinear|Sensación|Duraciones|Mover en la tonalidad|Copiar y pegar" && es.b === "Carril de fuerza: encendido", "in Spanish: " + JSON.stringify(es));
  await click(p, "aprDone"); await p.evaluate(() => document.getElementById("langBtn").click());
  await c.close();

  /* 8 · an iPhone and an iPad */
  await T.looks(b, U, async m => { await NOTE_TAKE(m, 1, false); await m.waitForFunction(() => __aogStudio.INBOX.items.length === 1); await put(m, 1, 0, "piano"); await openRoll(m); await sel(m, "apxTool", "q");
    await m.evaluate(() => document.getElementById("apxMore").scrollIntoView({ block: "center" })); }, "#apxMore button, #apxMore select, #apxVl", "More note tools");
  await T.done(b, srv);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
