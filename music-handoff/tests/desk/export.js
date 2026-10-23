/* AOG-DESK-STEMS-GROUPS-V1, AOG-DESK-PROJECT-V1 (slice 7 of the DAW build) — export like a studio:
   · Send it out, then Each track and group on its own: one .zip with a .wav for every track and one for each group; the
     tracks' files add back up to the song's file, and a group's file is its tracks' files added up (24-bit, to 0.00002);
   · Save my song: a .aogsong that is a zip (song.json and audio/<id>.wav); on a fresh device Open my song gives the very
     same desk: the song (the arrangement, the mixer, the master, markers, groups, follow the tempo …), every recording
     byte for byte, and the same mix to the bit;
   · the locker's address and key and the Sheet's keys are never in the file; a file cut short or not a song is refused;
     a song file from before (AOGSONG1) still opens;
   · Spanish; an iPhone and an iPad, light and dark. Port 9346. */
const T = require("./lib.js"), { ok, near, add, put, HELP } = T;
const fs = require("fs"), os = require("os"), path = require("path");
const PORT = 9346, U = "http://localhost:" + PORT + "/", srv = T.srv(PORT);
const OUTD = fs.mkdtempSync(path.join(os.tmpdir(), "deskexp-"));
const click = (p, id) => p.evaluate(id => document.getElementById(id).click(), id);
/* in the page: a .wav (16 or 24-bit PCM) into two Float32Arrays */
const WAVREAD = `async (blob) => { const v = new DataView(await blob.arrayBuffer()), bits = v.getUint16(34, true), ch = v.getUint16(22, true), n = v.getUint32(40, true) / (ch * bits / 8), L = new Float32Array(n), R = new Float32Array(n);
  for (let i = 0; i < n; i++) for (let c = 0; c < 2; c++) { const o = 44 + (i * ch + c) * bits / 8; let x; if (bits === 16) x = v.getInt16(o, true) / 32768; else { x = v.getUint8(o) | (v.getUint8(o + 1) << 8) | (v.getInt8(o + 2) << 16); x /= 8388608; } (c ? R : L)[i] = x; } return { L, R, bits }; }`;
const STATE = p => p.evaluate(async () => { const st = __aogStudio, ids = []; st.SONG.tracks.forEach(x => { if (x.clip) ids.push(x.clip.id); (x.takes || []).forEach(c => ids.push(c.id)); });
  const sums = []; for (const id of ids.sort()) { const v = await st.sget(id), u = new Uint8Array(await v.wav.arrayBuffer()); let h = 0x811c9dc5; for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 16777619) >>> 0; } sums.push(u.length + ":" + h.toString(16)); }
  const s = JSON.parse(JSON.stringify(st.SONG)); delete s.sel; const canon = v => Array.isArray(v) ? "[" + v.map(canon).join(",") + "]" : v && typeof v === "object" ? "{" + Object.keys(v).sort().map(k => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}" : JSON.stringify(v); return { song: canon(s), sums: sums.join(",") }; });

(async () => {
  const b = await T.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true }); T.watch(c); await T.routes(c);
  const p = await c.newPage();
  await p.goto(U + "music-studio.html"); await p.waitForTimeout(600); await T.ready(p);
  await add(p, { n: 1, kind: "noise", bars: 4, amp: 2500 }); await add(p, { n: 2, f: [220], bars: 4, amp: 5000 }); await add(p, { n: 3, f: [330], bars: 4, amp: 5000 });
  await p.waitForFunction(() => __aogStudio.INBOX.items.length === 3, null, { timeout: 8000 });
  await put(p, 1, 0); await put(p, 2, 1); await put(p, 3, 2); await p.evaluate(HELP);
  await p.evaluate(() => { const st = __aogStudio, x = st.SONG.tracks; st.SONG.master.glue = 0; x[0].grp = "drums"; x[1].grp = "drums"; x[0].pan = -40; x[2].vol = 60; x[1].low = 3; st.songChanged(); });
  await p.selectOption("#bitsSel", "24");

  /* 1 · stems: each track and each group */
  await click(p, "outBtn"); await p.waitForFunction(() => __aogStudio.OUT.song && !__aogStudio.OUT.busy, null, { timeout: 60000 });
  const lab = await p.evaluate(() => document.getElementById("stemBtn").textContent);
  await click(p, "stemBtn"); await p.waitForFunction(() => __aogStudio.OUT.stems && !__aogStudio.OUT.busy, null, { timeout: 90000 });
  const st = await p.evaluate(`(async () => { const rd = ${WAVREAD}, Z = await __aogStudio.zipRead(__aogStudio.OUT.stems.file), names = [...Z.keys()], song = await rd(__aogStudio.OUT.song.file), F = {};
    for (const n of names) F[n] = await rd(Z.get(n));
    const tr = names.filter(n => /-track-/.test(n)), gr = names.filter(n => /-group-/.test(n)), m = (a, f) => { let e = 0; for (let i = 0; i < song.L.length; i++) for (const ch of ["L", "R"]) e = Math.max(e, Math.abs(a[ch][i] - f(i, ch))); return e; };
    const sum = m(song, (i, ch) => tr.reduce((s, n) => s + F[n][ch][i], 0)), g = gr.length ? m(F[gr[0]], (i, ch) => F[tr[0]][ch][i] + F[tr[1]][ch][i]) : -1;
    let pk = 0; for (let i = 0; i < song.L.length; i++) pk = Math.max(pk, Math.abs(song.L[i]));
    return { names, sum, g, bits: song.bits, pk, n: __aogStudio.OUT.stems.n }; })()`);
  ok(lab === "Each track and group on its own (.zip)" && st.names.length === 4 && st.names.filter(n => /-track-/.test(n)).length === 3 && /-group-drums\.wav$/.test(st.names[3]) && st.bits === 24 && st.sum < 2e-5 && st.g >= 0 && st.g < 2e-5 && st.pk > 0.05,
    `"${lab}": ${st.names.join(", ")}; the tracks add up to the song's file (the most any sample differs: ${st.sum.toExponential(1)}), the Drums group is its two tracks added up (${st.g.toExponential(1)})`);

  /* 2 · Save my song: a zip; open it on a fresh device */
  await p.evaluate(() => { const st = __aogStudio, S = st.SONG; S.marks = [{ b: 2, w: "Verse" }]; S.punch = { a: 2, b: 3 }; S.master.rvRet = 60; S.master.lc = 40; S.tracks[1].clip.warp = true; S.sections = [{ a: 0, b: 8, n: "intro" }]; S.name = "Night drive";
    localStorage.setItem("aog.studio.locker.v1", JSON.stringify({ url: "https://script.google.com/macros/s/AKfycbSECRETLOCKERxyz123/exec", key: "LOCKERKEY12345" })); localStorage.setItem("aog.sync.key", "SHEETKEY99999"); localStorage.setItem("aog.sync.url", "https://script.google.com/macros/s/AKfycbSHEETURL/exec"); st.songChanged(); });
  await p.evaluate(() => __T.render("a")); const ha = await p.evaluate(() => __T.hash("a"));
  /* the mix itself, carried over to the other device to be compared sample by sample (Chrome's own bounce can differ in the
     last bit from one bounce to the next, on main too, and the Low cut's filter carries that on; so: the same to −80 dB) */
  const RA = await p.evaluate(() => { const a = __T.B.a, n = a.L.length, u = new Uint8Array(n * 8); new Float32Array(u.buffer, 0, n).set(a.L); new Float32Array(u.buffer, n * 4, n).set(a.R); let s = ""; for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); });
  const A = await STATE(p);
  const [dl] = await Promise.all([p.waitForEvent("download"), click(p, "fileSave")]);
  const fname = dl.suggestedFilename(), fpath = path.join(OUTD, fname); await dl.saveAs(fpath);
  const bytes = fs.readFileSync(fpath), text = bytes.toString("latin1");
  ok(/^night-drive-\d{4}-\d\d-\d\d-\d{4}\.aogsong$/.test(fname) && text.startsWith("PK\x03\x04") && text.includes("song.json") && (text.match(/audio\/c[a-z0-9]+\.wav/g) || []).length >= 6, `Save my song: ${fname}, a zip of song.json and the recordings (${(bytes.length / 1048576).toFixed(1)} MB)`);
  ok(!/LOCKERKEY12345|SECRETLOCKER|SHEETKEY99999|SHEETURL|aog\.studio\.locker|aog\.sync/.test(text), "the locker's address and key and the Sheet's keys are never in the file");
  const c2 = await b.newContext({ ...T.pw.devices["iPhone 13"] }); T.watch(c2); await T.routes(c2);
  const q = await c2.newPage(); await q.goto(U + "music-studio.html"); await T.ready(q);
  await q.setInputFiles("#fileIn", fpath);
  await q.waitForFunction(() => /is on the desk/.test(document.getElementById("fileLine").textContent) && !__aogStudio.S.decoding && __aogStudio.SONG.tracks.every(x => !x.clip || __aogStudio.BUF.has(x.clip.id)), null, { timeout: 40000 });
  const B = await STATE(q); await q.evaluate(HELP); await q.evaluate(() => __T.render("b")); const hb = await q.evaluate(() => __T.hash("b"));
  const md = await q.evaluate(ra => { const s = atob(ra), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); const n = u.length / 8, L = new Float32Array(u.buffer, 0, n), R = new Float32Array(u.buffer, n * 4, n), b = __T.B.b; if (b.L.length !== n) return Infinity; let e = 0; for (let i = 0; i < n; i++) e = Math.max(e, Math.abs(L[i] - b.L[i]), Math.abs(R[i] - b.R[i])); return e; }, RA);
  ok(B.song === A.song && B.sums === A.sums && md < 1e-4, `Open my song on an iPhone: the same desk (the song ${B.song.length} characters, the same), every recording byte for byte, and the same mix (${hb === ha ? "to the bit" : "the most any sample differs: " + md.toExponential(1)})${B.song === A.song ? "" : "; the song differs"}${B.sums === A.sums ? "" : "; a recording differs"}`);
  /* refused: cut short, not a song; a file from before opens */
  const cutf = path.join(OUTD, "cut.aogsong"); fs.writeFileSync(cutf, bytes.slice(0, bytes.length - 5000));
  const junk = path.join(OUTD, "junk.aogsong"); fs.writeFileSync(junk, "PK\x03\x04 this is not a song at all");
  const flip = Buffer.from(bytes); flip[Math.floor(bytes.length / 2)] ^= 0xff; const flipf = path.join(OUTD, "flip.aogsong"); fs.writeFileSync(flipf, flip);
  const bad = [];
  for (const f of [cutf, junk, flipf]) { await q.evaluate(() => { document.getElementById("fileLine").textContent = ""; document.getElementById("fileIn").value = ""; }); await q.setInputFiles("#fileIn", f);
    await q.waitForFunction(() => /not a song file|Open /.test(document.getElementById("fileLine").textContent + document.getElementById("openAskT").textContent) || !document.getElementById("openAsk").hidden, null, { timeout: 20000 }); bad.push(await q.evaluate(() => document.getElementById("fileLine").textContent)); }
  ok(bad.every(w => w === "That is not a song file from the Mixing Desk."), "a file cut short, one that is not a song, and one with a changed byte are each refused: " + bad.join(" | "));
  const old = await q.evaluate(async () => { const st = __aogStudio, parts = [], meta = []; for (const x of st.SONG.tracks) { if (!x.clip) continue; const v = await st.sget(x.clip.id); meta.push({ id: x.clip.id, size: v.wav.size }); parts.push(v.wav); for (const c of x.takes || []) { const w = await st.sget(c.id); meta.push({ id: c.id, size: w.wav.size }); parts.push(w.wav); } }
    const head = new TextEncoder().encode(JSON.stringify({ kind: "aog-song", v: 1, at: Date.now(), song: st.SONG, clips: meta })), pre = new Uint8Array(12); for (let i = 0; i < 8; i++) pre[i] = "AOGSONG1".charCodeAt(i); new DataView(pre.buffer).setUint32(8, head.length, true);
    const r = await st.readSongFile(new Blob([pre, head].concat(parts))); return !!r && r.song.tracks.filter(x => x.clip).length; });
  ok(old === 3, "a song file from before (AOGSONG1) still opens: " + old + " tracks");
  await c2.close();

  /* 3 · Spanish */
  await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(100);
  const es = await p.evaluate(() => ({ s: document.getElementById("fileSave").textContent, o: document.getElementById("fileOpen").textContent, w: document.querySelector('#carryBlk [data-t="fileWhat"]').textContent }));
  ok(es.s === "Guardar mi canción" && es.o === "Abrir mi canción" && es.w === "Un archivo guarda toda la canción. Se queda en tu aparato; muévelo con AirDrop o Archivos.", "in Spanish: " + JSON.stringify(es));
  await c.close();

  await T.looks(b, U, async m => { await m.click("#foldSave > summary"); /* AOG-DESK-FOLDS-V1 */ await m.evaluate(() => document.getElementById("carryBlk").scrollIntoView({ block: "start" })); }, "#carryBlk button, #carryBlk select, #carryBlk input", "Save my song");
  await T.done(b, srv);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
