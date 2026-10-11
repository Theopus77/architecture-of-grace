/* AOG-REAL-ROOMS-V1 — Jimmy's 5 (2026-10-11): "Real rooms. Today every reverb is a made-up decay. Free (CC0) recordings of
   real halls, plates and churches would make the reverb sound like real spaces."
   - Each file in audio/rooms/ loads and decodes; its decay time (RT60, Schroeder T30) is in the range for its kind, and
     small room < studio < hall < church.
   - The rooms' knob (AOGRoom): the made-up room plays at once, the real one once it has arrived; when a file cannot load
     the made-up one stays, with no page error. Five steps, Church the fifth; Spanish names.
   - The wet level of each knob step, of the desk's rooms and of the pedal's types stays within ±2 dB of the made-up one it
     replaces (pink noise through each, heard as a loudness meter hears it: K-weighted, as LUFS are; the pedal's made-up
     reverb at the level its normalising convolver plays it). amp/b1 checks the guitar's and the bass's sounds themselves.
   - The Mixing Desk: a new song starts in the Hall, a song from before keeps its made-up room ("Smooth"); the Room choice
     changes the reverb tail of the mix (small < hall < church, late in the tail), the same mix twice is the same to the
     sample, the speakers use the same room, and the choice is kept after a reload and in a song file (.aogsong).
   - The amp's reverb pedal: hall and plate (and room, spring) use the files; an offline render waits for them.
   - Spanish; the desk's choice readable and calm on an iPhone and an iPad, light and dark; no page errors. Port 9281. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const PORT = 9281, U = "http://localhost:" + PORT + "/";
const srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
async function routes(ctx, wav) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  if (wav === "slow") await ctx.route(/\/audio\/rooms\/.*\.wav/, async r => { await new Promise(z => setTimeout(z, 1200)); r.continue(); });
  if (wav === "fail") await ctx.route(/\/audio\/rooms\/.*\.wav/, r => r.abort());
}
/* in the page: decay time (Schroeder T30, or T20) of a buffer; the wet level (dB) of pink noise through an IR */
const LIB = `window.__rt = b => { const n = b.length, e = new Float64Array(n); for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) e[i] += d[i] * d[i]; }
    const edc = new Float64Array(n); let s = 0; for (let i = n - 1; i >= 0; i--) { s += e[i]; edc[i] = s; } const db = i => 10 * Math.log10(edc[i] / edc[0] + 1e-30);
    for (const lo of [-35, -25]) { let a = -1, z = -1; for (let i = 0; i < n; i++) { const v = db(i); if (a < 0 && v <= -5) a = i; if (v <= lo) { z = i; break; } }
      if (a >= 0 && z > a) { let sx = 0, sy = 0, sxx = 0, sxy = 0, m = 0; for (let i = a; i < z; i += 4) { const x = i / b.sampleRate, y = db(i); sx += x; sy += y; sxx += x * x; sxy += x * y; m++; }
        const k = (m * sxy - sx * sy) / (m * sxx - sx * sx); return -60 / k; } } return null; };
  window.__pink = (n, seed) => { let x = seed || 12345; const r = () => { x = (x * 16807) % 2147483647; return x / 2147483647 * 2 - 1; }; const o = new Float32Array(n); let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < n; i++) { const w = r(); b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; o[i] = (b0 + b1 + b2 + w * 0.1848) * 0.1; } return o; };
  window.__wet = async (ir, gain) => { const sr = ir.sampleRate, n = sr * 3, oc = new OfflineAudioContext(2, n + ir.length, sr), src = oc.createBufferSource(), nb = oc.createBuffer(1, n, sr);
    nb.copyToChannel(__pink(n), 0); src.buffer = nb; const cv = oc.createConvolver(); cv.normalize = false; cv.buffer = ir; const g = oc.createGain(); g.gain.value = gain == null ? 1 : gain;
    /* heard as a loudness meter hears it: the K-weighting of ITU-R BS.1770 (its two filters, at this sample rate) */
    const K = Math.tan(Math.PI * 1681.974450955533 / sr), Q = 0.7071752369554196, Vh = Math.pow(10, 3.999843853973347 / 20), Vb = Math.pow(Vh, 0.4996667741545416), a0 = 1 + K / Q + K * K;
    const K2 = Math.tan(Math.PI * 38.13547087602444 / sr), Q2 = 0.5003270373238773, a2 = 1 + K2 / Q2 + K2 * K2;
    const k1 = oc.createIIRFilter([(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0], [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]);
    const k2 = oc.createIIRFilter([1, -2, 1], [1, 2 * (K2 * K2 - 1) / a2, (1 - K2 / Q2 + K2 * K2) / a2]);
    src.connect(cv); cv.connect(g); g.connect(k1); k1.connect(k2); k2.connect(oc.destination); src.start(0); const o = await oc.startRendering(); let s = 0, m = 0;
    for (let c = 0; c < 2; c++) { const d = o.getChannelData(c); for (let i = Math.round(sr * 1.5); i < n; i++) { s += d[i] * d[i]; m++; } } return 10 * Math.log10(s / m + 1e-30); };`;
const ROOMS = { small: [0.25, 0.7], studio: [0.35, 0.9], hall: [1.0, 2.2], church: [2.5, 6], plate: [1.2, 3], spring: [0.8, 2.5] };

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* 1 · every file loads and decodes; its decay time is right for its kind */
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(c); await routes(c, "slow");
  const p = await c.newPage(); await p.goto(U + "music-piano.html"); await p.waitForTimeout(1200); await p.evaluate(LIB);
  const files = await p.evaluate(async R => { const L = await AOGRoom.lib(), out = {}, oc = new OfflineAudioContext(2, 1, 44100);
    for (const id of Object.keys(R)) { const r = await fetch(L.base + L.list[id].file), bytes = +(r.headers.get("content-length") || 0), ab = await r.arrayBuffer();
      const kb = Math.round(ab.byteLength / 1024), bf = await oc.decodeAudioData(ab); out[id] = { kb, ch: bf.numberOfChannels, sec: +bf.duration.toFixed(2), sr: bf.sampleRate, rt: +__rt(bf).toFixed(2), listed: L.list[id].rt }; }
    return out; }, ROOMS);
  let total = 0;
  for (const [id, [lo, hi]] of Object.entries(ROOMS)) { const f = files[id]; total += f.kb;
    ok(f && f.rt >= lo && f.rt <= hi && Math.abs(f.rt - f.listed) < 0.08 && f.sr === 44100 && f.ch === (id === "spring" ? 1 : 2) && f.sec <= (id === "church" ? 5 : 3.5),
      `${id}.wav decodes: ${JSON.stringify(f)} (RT60 expected ${lo}–${hi} s)`); }
  ok(files.small.rt < files.studio.rt && files.studio.rt < files.hall.rt && files.hall.rt < files.church.rt && total < 2048, `small < studio < hall < church (${files.small.rt}, ${files.studio.rt}, ${files.hall.rt}, ${files.church.rt} s); all six ${total} KB`);
  ok(fs.existsSync(path.join(ROOT, "audio/rooms/CREDITS.txt")) && Object.keys(ROOMS).every(id => fs.readFileSync(path.join(ROOT, "audio/rooms/CREDITS.txt"), "utf8").includes(id + ".wav")) &&
    /Creative Commons 0/.test(fs.readFileSync(path.join(ROOT, "audio/rooms/CREDITS.txt"), "utf8")), "audio/rooms/CREDITS.txt names each file, its source and its licence (CC0)");

  /* 2 · the rooms' knob: the made-up room at once, the real one when it has arrived (the files are slowed here by 1.2 s) */
  await p.evaluate(() => AOGRoom.set(0)); await p.reload(); await p.waitForTimeout(1200); await p.evaluate(LIB);
  await p.mouse.click(5, 400).catch(() => {}); await p.keyboard.down("KeyA"); await p.waitForTimeout(150); await p.keyboard.up("KeyA"); await p.waitForTimeout(300);
  const steps = await p.evaluate(() => AOGRoom.presets.map(q => q.en + "/" + q.es).join(", "));
  ok(steps === "Dry/Seco, Small room/Sala pequeña, Studio/Estudio, Hall/Sala grande, Church/Iglesia", "five steps: " + steps);
  const before = await p.evaluate(() => { AOGRoom.set(3); return AOGRoom.chains.map(ch => ({ on: ch.on, real: ch.conv.buffer && ch.conv.buffer.__aogReal || "" })); });
  ok(before.length >= 1 && before.every(x => x.on && !x.real), "Hall: the made-up room plays at once, while the file is on its way " + JSON.stringify(before));
  await p.waitForFunction(() => AOGRoom.chains.every(ch => ch.conv.buffer && ch.conv.buffer.__aogReal === "hall"), null, { timeout: 15000 }).catch(() => {});
  const after = await p.evaluate(() => AOGRoom.chains.map(ch => ch.conv.buffer && ch.conv.buffer.__aogReal || ""));
  ok(after.length && after.every(x => x === "hall"), "then the real hall (Liverpool Philharmonic Hall) " + after.join());
  /* the wet level of each step, made-up and real, pink noise through it at the step's wet gain */
  const lv = await p.evaluate(async () => { const out = []; const oc = new OfflineAudioContext(2, 1, 44100);
    for (let i = 1; i < AOGRoom.presets.length; i++) { const made = AOGRoom.ir(oc, i); const L = await AOGRoom.lib(); await L.load(oc, AOGRoom.presets[i].real);
      await new Promise(r => setTimeout(r, 50)); const real = AOGRoom.ir(oc, i), w = AOGRoom.presets[i].wet;
      out.push({ id: AOGRoom.presets[i].id, real: real.__aogReal || "", d: +((await __wet(real, w)) - (await __wet(made, w))).toFixed(2) }); }
    return out; });
  ok(lv.every(x => x.real === x.id && Math.abs(x.d) <= 2), "each knob step is as wet as before (real − made-up, dB): " + lv.map(x => x.id + " " + x.d).join(", "));
  /* the knob: a tap goes Hall → Church; its name in Spanish */
  const kn = await p.evaluate(() => { const k = document.querySelector(".aogroom"); k.click(); const en = k.querySelector("b").textContent; return { en, at: AOGRoom.get() }; });
  await p.evaluate(() => { const b = document.getElementById("langBtn"); if (b) b.click(); });
  await p.waitForTimeout(300);
  const kes = await p.evaluate(() => document.querySelector(".aogroom b").textContent);
  ok(kn.en === "Church" && kn.at === 4 && kes === "Iglesia", `a tap after Hall turns it to Church (${kn.en}, ${kn.at}); in Spanish: ${kes}`);
  await p.evaluate(() => { const b = document.getElementById("langBtn"); if (b) b.click(); AOGRoom.set(0); });
  await c.close();

  /* 3 · a file that cannot load: the made-up room stays, no page error */
  const cf = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(cf); await routes(cf, "fail");
  const pf = await cf.newPage(); await pf.goto(U + "music-piano.html"); await pf.waitForTimeout(1000);
  await pf.mouse.click(5, 400).catch(() => {}); await pf.keyboard.down("KeyA"); await pf.waitForTimeout(150); await pf.keyboard.up("KeyA");
  await pf.evaluate(() => AOGRoom.set(4)); await pf.waitForTimeout(1500);
  const fb = await pf.evaluate(() => AOGRoom.chains.map(ch => ({ on: ch.on, real: ch.conv.buffer && ch.conv.buffer.__aogReal || "", len: ch.conv.buffer && ch.conv.buffer.length })));
  ok(fb.length && fb.every(x => x.on && !x.real && x.len > 0), "when the file cannot load, the made-up church stays " + JSON.stringify(fb));
  await pf.evaluate(() => AOGRoom.set(0)); await cf.close();

  /* 4 · the Mixing Desk */
  const cd = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(cd); await routes(cd);
  const d = await cd.newPage(); await d.goto(U + "music-studio.html"); await d.waitForTimeout(800); await d.evaluate(LIB);
  const fresh = await d.evaluate(() => ({ room: __aogStudio.SONG.master.room, sel: document.getElementById("roomSel") && document.getElementById("roomSel").value,
    opts: [...document.querySelectorAll("#roomSel option")].map(o => o.value + ":" + o.textContent).join(", "), lab: document.getElementById("roomSel").closest("label").querySelector(".st-lab").textContent }));
  ok(fresh.room === "hall" && fresh.sel === "hall" && fresh.opts === "made:Smooth, small:Small room, studio:Studio, hall:Hall, church:Church" && fresh.lab === "Room sound",
    `a new song starts in the Hall; the choice "${fresh.lab}": ${fresh.opts}`);
  /* a song from before (no room saved) keeps its made-up room */
  await d.evaluate(() => { const s = JSON.parse(JSON.stringify(__aogStudio.SONG)); delete s.master.room; localStorage.setItem("aog.studio.v1", JSON.stringify(s)); });
  await d.reload(); await d.waitForTimeout(800); await d.evaluate(LIB);
  const old = await d.evaluate(() => ({ room: __aogStudio.SONG.master.room, sel: document.getElementById("roomSel").value, same: __aogStudio.LIVE ? __aogStudio.LIVE.rev.buffer === __aogStudio.LIVE.madeIR : null }));
  ok(old.room === "made" && old.sel === "made", "a song from before keeps the made-up room (Smooth): " + JSON.stringify(old));
  /* the made-up room and the desk's real rooms: each as wet as before */
  const dl = await d.evaluate(async () => { const st = __aogStudio, oc = new OfflineAudioContext(2, 1, 44100), out = [], was = st.SONG.master.room;
    for (const id of ["small", "studio", "hall", "church"]) { st.SONG.master.room = id; await st.deskRoomLoad(oc, id); const E = st.makeEngine(oc, false), real = E.rev.buffer, made = E.madeIR;
      out.push({ id, real: real.__aogReal, d: +((await __wet(real)) - (await __wet(made))).toFixed(2) }); }
    st.SONG.master.room = was; return out; }).catch(e => [{ id: "error " + e.message, d: 99 }]);
  ok(dl.every(x => x.real === x.id && Math.abs(x.d) <= 2), "the desk's rooms are as wet as the made-up one (dB): " + dl.map(x => x.id + " " + x.d).join(", "));
  /* a song: one take on track 1 with its Room up; the tail of the mix after the take ends, for each room */
  const sr = 44100, sec = 2;
  await d.evaluate(async ({ sr, sec }) => { const n = sr * sec, ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab), s = (q, t) => { for (let i = 0; i < t.length; i++) v.setUint8(q + i, t.charCodeAt(i)); };
    s(0, "RIFF"); v.setUint32(4, 36 + n * 4, true); s(8, "WAVE"); s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true);
    v.setUint16(32, 4, true); v.setUint16(34, 16, true); s(36, "data"); v.setUint32(40, n * 4, true); const pk = __pink(n, 777);
    for (let i = 0; i < n; i++) { const x = Math.round(Math.max(-1, Math.min(1, pk[i] * 2)) * 12000); v.setInt16(44 + i * 4, x, true); v.setInt16(46 + i * 4, x, true); }
    await AOGHandoff.add(AOGHandoff.INBOX, { from: "guitar", n: 1, name: { en: "Guitar take 1", es: "Toma de guitarra 1" }, sec, bpm: 120, at: Date.now(), take: true, wav: new Blob([ab], { type: "audio/wav" }) }, { key: "rr|1" }); }, { sr, sec });
  await d.waitForFunction(() => __aogStudio.INBOX.items.length >= 1, null, { timeout: 8000 });
  await d.selectOption("#trackSel", "0");
  const sv = await d.evaluate(() => [...document.querySelectorAll("#srcSel option")].find(o => o.textContent.split(" · ")[0] === "Guitar take 1").value);
  await d.selectOption("#srcSel", sv); await d.click("#putBtn");
  await d.waitForFunction(() => __aogStudio.SONG.tracks[0].clip && !__aogStudio.S.busy, null, { timeout: 15000 });
  const tails = await d.evaluate(async sec => { const st = __aogStudio, out = {}; st.SONG.tracks[0].room = 80;
    const end = sec + 0.06, part = (r, a, z) => { let s = 0, m = 0; for (const ch of [r.Lc, r.Rc]) for (let i = Math.round(44100 * (end + a)); i < Math.min(ch.length, Math.round(44100 * (end + z))); i++) { s += ch[i] * ch[i]; m++; } return 10 * Math.log10(s / Math.max(1, m) + 1e-30); };
    for (const id of ["made", "small", "hall", "church", "church"]) { st.SONG.master.room = id; const r = await st.renderSong(null);
      const k = out[id] ? id + "2" : id; out[k] = { late: +part(r, 0.7, 1.7).toFixed(1), body: +part(r, -1.0, -0.2).toFixed(2), r }; }
    let same = out.church.r.Lc.length === out.church2.r.Lc.length; for (let i = 0; same && i < out.church.r.Lc.length; i++) if (out.church.r.Lc[i] !== out.church2.r.Lc[i] || out.church.r.Rc[i] !== out.church2.r.Rc[i]) same = false;
    const res = {}; for (const k in out) res[k] = { late: out[k].late, body: out[k].body }; res.same = same; return res; }, sec);
  ok(tails.small.late < tails.hall.late - 3 && tails.hall.late < tails.church.late - 3 && Math.abs(tails.made.late - tails.church.late) > 1,
    `the Room choice changes the tail of the mix, late in it (dB): small ${tails.small.late}, hall ${tails.hall.late}, church ${tails.church.late}, made-up ${tails.made.late}`);
  ok(Math.abs(tails.small.body - tails.made.body) < 2 && Math.abs(tails.church.body - tails.made.body) < 2, `while the take plays the mix is as loud whatever the room (dB): made-up ${tails.made.body}, small ${tails.small.body}, hall ${tails.hall.body}, church ${tails.church.body}`);
  ok(tails.same, "the same mix twice (church) is the same to the sample");
  /* the speakers: choosing Church on the desk puts the same room on the live Room return */
  await d.selectOption("#roomSel", "church");
  await d.evaluate(() => __aogStudio.play()); await d.waitForTimeout(300); await d.evaluate(() => __aogStudio.stop());
  await d.waitForFunction(() => { const E = __aogStudio.LIVE; return E && E.rev.buffer && E.rev.buffer.__aogReal === "church"; }, null, { timeout: 15000 }).catch(() => {});
  const lv2 = await d.evaluate(async () => { const st = __aogStudio, E = st.LIVE, oc = new OfflineAudioContext(2, 1, E.c.sampleRate); await st.deskRoomLoad(oc, "church"); const E2 = st.makeEngine(oc, false);
    return { real: E.rev.buffer && E.rev.buffer.__aogReal, sr: E.c.sampleRate, same: E.rev.buffer === E2.rev.buffer, room: st.SONG.master.room }; });
  ok(lv2.real === "church" && lv2.same && lv2.room === "church", "the speakers play the same church as the mix (the same IR) " + JSON.stringify(lv2));
  /* after a reload, and in a song file */
  await d.waitForTimeout(1500); await d.reload(); await d.waitForTimeout(900);
  const rl = await d.evaluate(async () => { const st = __aogStudio, f = await st.songFile(), r = await st.readSongFile(f);
    return { room: st.SONG.master.room, sel: document.getElementById("roomSel").value, file: r && r.song && r.song.master.room }; });
  ok(rl.room === "church" && rl.sel === "church" && rl.file === "church", "the choice is kept after a reload and in the song file " + JSON.stringify(rl));
  /* Spanish */
  await d.evaluate(() => document.getElementById("langBtn").click()); await d.waitForTimeout(300);
  const es = await d.evaluate(() => ({ lab: document.getElementById("roomSel").closest("label").querySelector(".st-lab").textContent, opts: [...document.querySelectorAll("#roomSel option")].map(o => o.textContent).join(", "),
    sel: document.getElementById("roomSel").value, from: document.querySelector(".st-roomc a").textContent }));
  ok(es.lab === "Sonido de sala" && es.opts === "Suave, Sala pequeña, Estudio, Sala grande, Iglesia" && es.sel === "church" && es.from === "De dónde vienen las salas", "in Spanish: " + JSON.stringify(es));
  await d.evaluate(() => document.getElementById("langBtn").click());
  await cd.close();

  /* 5 · the amp's reverb pedal: hall, plate, room and spring use the files; as wet as before; an offline render waits */
  const ca = await b.newContext({ viewport: { width: 1280, height: 900 } }); watch(ca); await routes(ca);
  const g = await ca.newPage(); await g.goto(U + "music-guitar.html"); await g.waitForTimeout(1500); await g.evaluate(LIB);
  const amp = await g.evaluate(async () => { const oc = new OfflineAudioContext(2, 22050, 22050), first = AOGAmp.reverbIR(oc, "hall", 0.5).__aogReal || "";
    await AOGAmp.load(oc); const out = { first }; await new Promise(r => setTimeout(r, 50));
    for (const [ty, dd] of [["hall", 0.1], ["hall", 0.5], ["plate", 0.5], ["room", 0.1], ["room", 0.5], ["spring", 0.5]]) { const real = AOGAmp.reverbIR(oc, ty, dd), made = AOGAmp.madeVerb(oc, ty, dd), ns = AOGRooms.normScale(made);   /* the made-up one plays normalised */
      out[ty + dd] = { real: real.__aogReal || "", d: +((await __wet(real)) - (await __wet(made, ns))).toFixed(2), rt: +__rt(real).toFixed(2), madeRt: +__rt(made).toFixed(2) }; }
    const oc2 = new OfflineAudioContext(2, 44100, 44100); await AOGAmp.load(oc2); out.offline = AOGAmp.reverbIR(oc2, "plate", 0.3).__aogReal || "";
    return out; });
  const KS = ["hall0.1", "hall0.5", "plate0.5", "room0.1", "room0.5", "spring0.5"], WANT = ["hall", "church", "plate", "small", "hall", "spring"];
  ok(amp.first === "" && KS.every((k, i) => amp[k].real === WANT[i]), "the pedal: made-up at first, then (type, decay → file) " + KS.map(k => k + " → " + amp[k].real).join(", "));
  ok(KS.every(k => Math.abs(amp[k].d) <= 2), "each pedal type as wet as before (dB): " + KS.map(k => k + " " + amp[k].d + " (RT60 " + amp[k].rt + " s, made-up " + amp[k].madeRt + " s)").join(", "));
  ok(amp.offline === "plate", "an offline render (AOGAmp.load) starts on the real plate: " + amp.offline);
  /* the live rig: turn the reverb pedal on, Plate; it plays the real plate once in */
  const rig = await g.evaluate(async () => { const c = new AudioContext(), r = AOGAmp.create(c, { kind: "guitar", state: AOGAmp.defaults("guitar") }), st = JSON.parse(JSON.stringify(r.state));
    st.fx.reverb.on = true; st.fx.reverb.type = "plate"; r.set(st); for (let i = 0; i < 60; i++) { await new Promise(z => setTimeout(z, 100)); if (AOGAmp.reverbIR(c, "plate", +st.fx.reverb.decay / 10).__aogReal) break; }
    r.set(st); return AOGAmp.reverbIR(c, "plate", +st.fx.reverb.decay / 10).__aogReal || ""; }).catch(e => "error " + e.message);
  ok(rig === "plate", "a live rig's Plate becomes the real plate: " + rig);
  await ca.close();

  /* 6 · the desk's choice on an iPhone and an iPad, light and dark: fits, reads, calm */
  for (const [dev, theme] of [["iPhone 13", "light"], ["iPhone 13", "dark"], ["iPad (gen 7)", "light"], ["iPad (gen 7)", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme }); watch(cx); await routes(cx);
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage(); await m.goto(U + "music-studio.html"); await m.waitForTimeout(900);
    await m.locator("#roomSel").scrollIntoViewIfNeeded();
    const fit = await m.evaluate(() => { const s = document.getElementById("roomSel"), r = s.getBoundingClientRect(), a = document.querySelector(".st-roomc a").getBoundingClientRect();
      return { iw: innerWidth, sw: document.scrollingElement.scrollWidth, font: parseFloat(getComputedStyle(s).fontSize), h: Math.round(r.height), inside: r.left >= 0 && r.right <= innerWidth, link: a.right <= innerWidth && a.width > 0 }; });
    const pc = await m.evaluate(`(${PROBE})()`), pk = await m.evaluate(`(${CALM})()`);
    ok(fit.sw <= fit.iw && fit.inside && fit.link && fit.font >= 16 && fit.h >= 44 && !pc.length && !pk.length,
      `${dev}, ${theme}: the Room sound choice fits (${JSON.stringify(fit)}), reads (${pc.length} unreadable ${JSON.stringify(pc.slice(0, 2))}), calm (${pk.join("; ") || "ok"})`);
    await cx.close();
  }
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
