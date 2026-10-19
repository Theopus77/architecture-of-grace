/* AOG-PIANO-LICKS-V1 (2026-10-19) — Jimmy: piano licks "that follow the same style of the guitar and bass licks", and
   AOG-LICKS-SONG-V1 ("I could use them for in making a song without much modification of my own"). Inside the Studio, in
   the Piano room (music-piano.html, /the-studio#piano), Licks to try right under the keys (aog-piano-licks.js):
   0 · by numbers, in the page, every lick in all 24 keys (twelve major, twelve minor): every note on the keys the piano
       shows (C2 to C7), on three octaves of keys at most (a computer and an iPad show it all); whole bars from beat 1;
       beats 1 and 3 land on the chord's own notes; every other note is the key's or the chord's, or passes by a half or
       whole step on purpose; each hand ends on its chord's root; the same shape in every key. Fit to my chords on five
       progressions (with minor, seventh and diminished chords, from bar 1 and from bar 2) passes the same numbers;
       Repeat 1, 2 and 4 join end to start with no gap and no overlap. Rendered offline on the grand piano: no clicks
       where notes stop, never over full scale, never silent
   on an iPhone, an iPad and an iPad sideways, at once:
   1 · the block opens closed ("Licks to try") and loads the lick file only when opened; the menu has every group (22),
       at least six licks in each, in English and in Spanish, a line for each lick in both
   2 · ▶ Play this lick sits right under the keys; pressed from the foot of the page, the keys are in sight as it plays
   3 · every lick plays: each key lit as it sounds (on an iPad every key; on a phone every right-hand key), and it ends
       by itself, the keys back as they were
   4 · Stop stops it at once; it follows a key change while it plays, and major and minor; Lick speed changes its length;
       the song's tempo (73.5 and 170, past the old 132 limit), "In your song: …"; Fit to my chords follows the room's chord pattern;
       Repeat makes it 2 and 4 times as long; ● Record this lick makes a take at the song's tempo that + Add to My Track
       puts on bar 1 with its tempo and key, and Send to the drum machine takes; the take starts on the downbeat, is not
       clipped; a hidden tab and the Studio's hush stop it; afterwards no timer or frame callback from it; no page errors.
   Port 9446 (the pages). PIANOLICKS_QUICK=1 plays every sixth lick on each device (a quick look while working). */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const path = require("path"), PORT = 9446, srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const GROUPS_EN = ["Blues", "Boogie-woogie", "Rock and roll", "Funk", "Motown and soul", "Disco", "Hip-hop and R&B", "Neo-soul", "Gospel", "Jazz", "Stride and ragtime", "New Orleans",
  "Latin and salsa", "Reggae and ska", "Afrobeat and highlife", "Country", "Pop", "House piano", "Slow and singing", "Classical-style runs", "Piano tricks", "Fills and turnarounds"];
const GROUPS_ES = ["Blues", "Boogie-woogie", "Rock and roll", "Funk", "Motown y soul", "Disco", "Hip-hop y R&B", "Neo-soul", "Gospel", "Jazz", "Stride y ragtime", "Nueva Orleans",
  "Latino y salsa", "Reggae y ska", "Afrobeat y highlife", "Country", "Pop", "Piano house", "Lentas y cantadas", "Escalas al estilo clásico", "Trucos de piano", "Rellenos y vueltas"];
const NLICKS = 154, NGROUPS = 22;
const COUNT = () => { window.__calls = []; const si = window.setInterval, st = window.setTimeout, raf = window.requestAnimationFrame;
  const tag = k => { const s = (new Error().stack || "").split("\n").slice(2, 6).join(" "); return () => { if (window.__calls.length < 4000) window.__calls.push(k + " " + s); }; };
  window.setInterval = (f, ...a) => { const t = tag("interval"); return si(() => { t(); typeof f === "function" && f(); }, ...a); };
  window.setTimeout = (f, ...a) => { const t = tag("timeout"); return st(() => { t(); typeof f === "function" && f(); }, ...a); };
  window.requestAnimationFrame = f => { const t = tag("frame"); return raf(x => { t(); f(x); }); }; };

async function openPiano(b, vw, errs, nm) {
  const ctx = await b.newContext({ viewport: vw, isMobile: true, hasTouch: true, serviceWorkers: "block" });
  await ctx.addInitScript(COUNT);
  await ctx.addInitScript(() => { try { if (!sessionStorage.getItem("pk.t")) { sessionStorage.setItem("pk.t", "1"); localStorage.removeItem("aog.piano.licks.v1"); localStorage.removeItem("aog.piano.licks.open"); localStorage.removeItem("aog.song.v1"); } } catch (e) {} });
  ctx.on("page", pg => pg.on("pageerror", e => errs.push(nm + ": " + e.message)));
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  const p = await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#piano`);
  await p.waitForFunction(() => [...document.querySelectorAll("iframe")].some(f => { try { return f.contentDocument && f.contentDocument.getElementById("pkLicks") && f.contentDocument.querySelector("#kbd [data-m]"); } catch (e) { return false; } }), null, { timeout: 60000 });
  const f = p.frames().find(x => /music-piano/.test(x.url()));
  await f.evaluate(() => { if (S.lang !== "en") document.getElementById("langBtn").click(); });
  return { ctx, p, f };
}
async function openLicks(f) {
  const before = await f.evaluate(() => ({ open: document.getElementById("pkLicks").open, loaded: !!window.AOGPianoLicks || !!document.querySelector('script[src*="aog-piano-licks"]'),
    sum: document.querySelector("#pkLicks>summary").textContent }));
  await f.evaluate(() => { document.querySelector("#pkLicks>summary").click(); });
  await f.waitForFunction(() => window.AOGPianoLicks && AOGPianoLicks._t && document.querySelectorAll("#pkLickSel option").length > 0, null, { timeout: 20000 });
  return before;
}

/* ── 0 · the numbers, in the page ── */
const NUMBERS = () => {
  const L = AOGPianoLicks, MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10], WH = [0, 2, 4, 5, 7, 9, 11];
  const QT = { maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6], dom7: [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], m7b5: [0, 3, 6, 10], maj6: [0, 4, 7, 9], m6: [0, 3, 7, 9], dom9: [0, 4, 7, 10, 14], maj9: [0, 4, 7, 11, 14], m9: [0, 3, 7, 10, 14], sus4: [0, 5, 7] };
  const PROGS = [[{ off: 9, q: "min" }, { off: 5, q: "maj" }, { off: 0, q: "maj" }, { off: 7, q: "maj" }], [{ off: 2, q: "m7" }, { off: 7, q: "dom7" }, { off: 0, q: "maj7" }, { off: 9, q: "m7" }],
    [{ off: 0, q: "min" }, { off: 8, q: "maj" }, { off: 3, q: "maj" }, { off: 10, q: "maj" }], [{ off: 0, q: "dom7" }, { off: 5, q: "dom7" }, { off: 0, q: "dom7" }, { off: 7, q: "dom7" }, { off: 5, q: "dom7" }, { off: 0, q: "dom7" }],
    [{ off: 0, q: "maj" }, { off: 11, q: "dim" }, { off: 4, q: "min" }, { off: 9, q: "m7" }, { off: 2, q: "min" }, { off: 7, q: "dom7" }]];
  const out = { n: 0, notes: 0, bad: [], strong: 0, passing: 0, lo: 99, hi: 0, fitN: 0, fitBad: [] };
  const judge = (C, key, minor, fail) => {
    if (!C) { fail("does not fit on the keys"); return; }
    const SC = minor ? MIN : MAJ, ms = C.notes.map(n => n.m), lo = Math.min(...ms), hi = Math.max(...ms), wlo = WH.indexOf(lo % 12) >= 0 ? lo : lo - 1;
    if (lo < 36 || hi > 96) fail(`notes from ${lo} to ${hi}, off the keys`);
    if (hi - wlo > 36) fail("needs more than three octaves of keys");
    if (C.beats % 4 || C.notes.some(n => n.t < -1e-6 || n.t + n.d > C.beats + 1e-6)) fail("not whole bars from beat 1");
    const byH = h => C.notes.filter(n => n.h === h);
    C.notes.forEach((n, i) => {
      out.notes++; out.lo = Math.min(out.lo, n.m); out.hi = Math.max(out.hi, n.m);
      if (n.h === "c") return;
      const ch = C.chords.find(c => n.tb >= c.t0 - 1e-6 && n.tb < c.t1 - 1e-6) || C.chords[C.chords.length - 1];
      const pc = ((n.m - key) % 12 + 12) % 12, tones = QT[ch.q].map(x => (ch.root + x) % 12), strong = !n.orn && Math.abs(n.tb / 2 - Math.round(n.tb / 2)) < 1e-6;
      if (strong) { out.strong++; if (tones.indexOf(pc) < 0) fail(`${n.h} beat ${n.tb + 1}: not a note of the chord`); }
      if (SC.indexOf(pc) < 0 && tones.indexOf(pc) < 0) { out.passing++;
        const nx = byH(n.h).filter(x => x.t > n.t + 1e-6 && !x.orn), t1 = nx.length ? nx[0].t : null;
        if (strong || t1 == null || !nx.filter(x => Math.abs(x.t - t1) < 1e-6).some(x => Math.abs(x.m - n.m) <= 2)) fail(`${n.h} note ${i} is outside the key and does not pass by step`); }
    });
    const lc = C.chords[C.chords.length - 1];
    ["r", "l"].forEach(h => { const z = byH(h).filter(n => n.orn !== "crush" && n.orn !== "glide"); if (!z.length) return; const t = Math.max(...z.map(n => n.tb));
      if (!z.filter(n => n.tb === t).some(n => ((n.m - key - lc.root) % 12 + 12) % 12 === 0)) fail(`the ${h === "r" ? "right" : "left"} hand does not end on its chord's root`); });
  };
  L.ORDER.forEach(id => {
    const ref = {};
    for (let key = 0; key < 12; key++) for (const minor of [false, true]) {
      const C = L.compile(L.LICKS[id], { key, minor }); out.n++;
      judge(C, key, minor, m => { if (out.bad.length < 30) out.bad.push(`${id} in ${key}${minor ? "m" : ""}: ${m}`); });
      if (C) { const shape = C.notes.map(n => n.t.toFixed(4) + n.h + ((n.m - key) % 12 + 12) % 12).sort().join(","), k = minor ? "min" : "maj"; if (ref[k] == null) ref[k] = shape; else if (ref[k] !== shape) out.bad.push(`${id}: not the same shape in ${key}`); }
    }
    /* Fit to my chords: five progressions, in four keys, from bar 1 and from bar 2 */
    PROGS.forEach((prog, pi) => [0, 5, 7, 10].forEach(key => [false, true].forEach(minor => [0, 1].forEach(bar0 => {
      out.fitN++; const C = L.compile(L.LICKS[id], { key, minor, fit: { prog, bar0 } });
      if (C) C.chords.forEach((c, j) => { const want = prog[(bar0 + Math.floor(c.t0 / 4)) % prog.length]; if (c.root !== want.off || JSON.stringify(c.tones) !== JSON.stringify(QT[want.q])) out.fitBad.push(`${id}: bar ${j + 1} is not the song's chord`); });
      judge(C, key, minor, m => { if (out.fitBad.length < 30) out.fitBad.push(`${id} fitted to ${pi} in ${key}${minor ? "m" : ""} from bar ${bar0 + 1}: ${m}`); });
    }))));
  });
  /* Repeat: 1, 2, 4 times, each one in its own bars */
  const T = AOGPianoLicks._t, seams = [];
  [["p_rkpound", 2], ["p_ltmont", 4], ["px_glide", 2], ["p_clarp", 4]].forEach(([id, rep]) => {
    const keepRep = T.LP.rep; T.LP.rep = 1; const one = T.build(id); T.LP.rep = rep; const B = T.build(id); T.LP.rep = keepRep;
    const P = one.beats; let ok = B.beats === P * rep && B.bars === one.bars * rep;
    for (let r = 0; r < rep; r++) { const mine = B.notes.filter(n => n.t >= r * P - 1e-6 && n.t < (r + 1) * P - 1e-6);
      if (mine.length !== one.notes.length || mine.some(n => n.t + n.d > (r + 1) * P + 1e-6)) ok = false;
      if (!mine.some(n => Math.abs(n.t - r * P) < 1e-6) && one.notes.some(n => n.t === 0)) ok = false; }
    seams.push({ id, rep, ok, beats: B.beats });
  });
  out.seams = seams;
  return out;
};
const RENDER = async (ids) => {
  const hp = (x, fc, sr) => { const w0 = 2 * Math.PI * fc / sr, al = Math.sin(w0) / (2 * 0.7071), cs = Math.cos(w0), a0 = 1 + al;
    const b0 = (1 + cs) / 2 / a0, b1 = -(1 + cs) / a0, b2 = (1 + cs) / 2 / a0, a1 = -2 * cs / a0, a2 = (1 - al) / a0, y = new Float32Array(x.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = x[i], o = b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o; } return y; };
  const out = [];
  for (const id of ids) {
    const r = await AOGPianoLicks._t.renderLick(id, { bpm: 110 }); if (!r) { out.push({ id, none: true }); continue; }
    const sr = r.sr, x = r.L, h = hp(x, 8000, sr), W = Math.round(0.001 * sr), n = Math.floor(x.length / W), e = new Float64Array(n);
    let pk = 0, rms = 0; for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > pk) pk = a; rms += x[i] * x[i]; } rms = Math.sqrt(rms / x.length);
    for (let k = 0; k < n; k++) { let s = 0; for (let i = k * W; i < (k + 1) * W; i++) s += h[i] * h[i]; e[k] = s / W; }
    const skip = new Uint8Array(n); r.starts.forEach(t => { const a = Math.floor((t - 0.003) * 1000), z = Math.ceil((t + 0.03) * 1000); for (let k = Math.max(0, a); k < Math.min(n, z); k++) skip[k] = 1; });
    const floor = Math.pow(pk * Math.pow(10, -75 / 20), 2); let worst = 0, at = -1;
    for (let k = 0; k < n; k++) { if (skip[k]) continue; let mx = 0;
      for (let j = Math.max(0, k - 35); j < Math.min(n, k + 36); j++) if (Math.abs(j - k) > 3 && e[j] > mx) mx = e[j];
      const q = (e[k] + floor) / (mx + floor); if (q > worst) { worst = q; at = k / 1000; } }
    out.push({ id, pk: +pk.toFixed(3), rms: +rms.toFixed(4), db: +(10 * Math.log10(worst || 1)).toFixed(1), at: +at.toFixed(3), n: r.n });
  }
  return out;
};

async function numbers(b, errs) {
  const { ctx, f } = await openPiano(b, { width: 390, height: 844 }, errs, "numbers");
  await openLicks(f);
  const r = await f.evaluate(NUMBERS);
  ok(r.n === NLICKS * 24 && r.bad.length === 0, `by numbers: ${r.n / 24} licks in 24 keys each, ${r.notes} notes (MIDI ${r.lo} to ${r.hi}); on beats 1 and 3, ${r.strong} notes all in the chord; ${r.passing} passing notes, each by step; whole bars; three octaves at most ${r.bad.slice(0, 6).join(" | ")}`);
  ok(r.fitN === NLICKS * 5 * 4 * 2 * 2 && r.fitBad.length === 0, `Fit to my chords: ${r.fitN} fitted licks (5 progressions with minor, seventh and diminished chords, 4 keys, major and minor, from bar 1 and 2), each bar on the song's chord, the same numbers ${r.fitBad.slice(0, 6).join(" | ")}`);
  ok(r.seams.every(s => s.ok), `Repeat: end to start with no gap or overlap ${JSON.stringify(r.seams)}`);
  await f.waitForFunction(() => { const s = SOUNDS[S.sound]; return s.kind !== "sample" || SETS[s.set].ready; }, null, { timeout: 60000 }).catch(() => {});
  const ids = await f.evaluate(() => AOGPianoLicks.ORDER.slice());
  await f.evaluate(() => { S.key = 9; S.minor = true; });
  const t0 = Date.now(), res = await f.evaluate(RENDER, ids), ms = Date.now() - t0;
  const loud = res.filter(x => x.pk >= 1 || x.rms < 0.004 || x.none), clicky = res.filter(x => x.db > 15);
  ok(res.length === NLICKS && !loud.length && !clicky.length, `rendered in A minor on the ${await f.evaluate(() => S.sound)} sound, every lick (${(ms / 1000).toFixed(0)} s): peaks ${Math.min(...res.map(x => x.pk))} to ${Math.max(...res.map(x => x.pk))}, no clicks (worst ${Math.max(...res.map(x => x.db))} dB over its neighbours) ${loud.concat(clicky).slice(0, 5).map(x => JSON.stringify(x)).join(" ")}`);
  await ctx.close();
}

async function device(b, nm, vw, errs) {
  const { ctx, p, f } = await openPiano(b, vw, errs, nm);
  /* 1 · closed, nothing loaded, until it is opened */
  const before = await openLicks(f);
  ok(!before.open && !before.loaded && before.sum === "Licks to try", `${nm}: "${before.sum}" starts closed and the lick file loads only when it is opened`);
  const en = await f.evaluate(() => ({ groups: [...document.querySelectorAll("#pkLickSel optgroup")].map(g => [g.label, g.querySelectorAll("option").length]),
    ids: [...document.querySelectorAll("#pkLickSel option")].map(o => o.value), names: [...document.querySelectorAll("#pkLickSel option")].map(o => o.textContent),
    lab: document.querySelector('#pkLicksIn [data-pk="lickLab"]').textContent, btn: document.getElementById("pkLickBtn").textContent, line: document.getElementById("pkLine").textContent,
    fit: document.getElementById("pkFit").textContent, rep: document.querySelector('#pkLicksIn [data-pk="rep"]').textContent, rec: document.getElementById("pkRec").textContent,
    song: document.getElementById("pkSong").textContent, sound: S.sound }));
  ok(JSON.stringify(en.groups.map(g => g[0])) === JSON.stringify(GROUPS_EN) && en.groups.every(g => g[1] >= 6) && en.ids.length === NLICKS && new Set(en.ids).size === NLICKS && en.names.every(x => x && !/^lk_/.test(x)),
    `${nm}: ${en.ids.length} licks in ${en.groups.length} groups: ${en.groups.map(g => g[0] + " " + g[1]).join(", ")}`);
  ok(en.lab === "Lick" && en.btn === "▶ Play this lick" && en.fit === "Fit to my chords" && en.rep === "Repeat" && en.rec === "● Record this lick" && en.line.length > 20 && !/^ld_/.test(en.line) && /^In your song: .+, \d+(\.\d+)? beats a minute\.$/.test(en.song),
    `${nm}: "${en.lab}", "${en.btn}", "${en.fit}", "${en.rep}", "${en.rec}"; "${en.song}"; "${en.line}" (${en.sound})`);
  /* 2 · right under the keys; the keys in sight as it plays */
  const near = await f.evaluate(async () => {
    const kb = document.getElementById("kbd"), d = document.getElementById("pkLicks"), btn = document.getElementById("pkLickBtn");
    const gap = d.getBoundingClientRect().top - kb.getBoundingClientRect().bottom, after = kb.nextElementSibling === d;
    scrollTo(0, document.documentElement.scrollHeight); await new Promise(r => setTimeout(r, 100));
    btn.click(); await new Promise(r => setTimeout(r, 300));
    const k = kb.getBoundingClientRect(), seen = k.top >= -1 && k.bottom <= innerHeight + 1, b2 = btn.getBoundingClientRect(), bseen = b2.top >= 0 && b2.bottom <= innerHeight + 1;
    const playing = AOGPianoLicks._t.L.on && btn.getAttribute("aria-pressed") === "true";
    btn.click(); return { gap: Math.round(gap), after, seen, bseen, playing, stopped: !AOGPianoLicks._t.L.on };
  });
  ok(near.after && near.gap >= 0 && near.gap <= 40, `${nm}: Licks to try sits right under the keys (${near.gap} px below them)`);
  ok(near.seen && near.bseen && near.playing && near.stopped, `${nm}: pressed from the foot of the page, the lick plays with the keys and the button in sight ${JSON.stringify(near)}`);
  /* 3 · every lick plays, each key lit as it sounds, and ends */
  const wide = await f.evaluate(() => AOGPianoLicks._t.capOc());
  await f.evaluate(() => { S.key = 9; S.minor = true; S.bpm = 180; });
  const bad = [], t0 = Date.now(); let notes = 0, lit = 0;
  const play = process.env.PIANOLICKS_QUICK ? en.ids.filter((id, i) => i % 6 === 0) : en.ids;
  for (const id of play) {
    const r = await f.evaluate(async ({ id, wide }) => {
      const sel = document.getElementById("pkLickSel"); sel.value = id; sel.dispatchEvent(new Event("change", { bubbles: true }));
      const keys0 = [...document.querySelectorAll("#kbd [data-m]")].map(e => e.getAttribute("data-m")).join(",");
      document.getElementById("pkLickBtn").click();
      const L = AOGPianoLicks._t.L; if (!L.on || L.id !== id) return { id, started: false };
      const lim = performance.now() + (L.end - ac.currentTime) * 1000 + 3000;
      while (L.on && performance.now() < lim) await new Promise(r => setTimeout(r, 120));
      const need = wide >= 3 ? L.log : L.log.filter(n => n.h === "r"), unlit = need.filter(n => !L.seen.has(n.m));
      const keys1 = [...document.querySelectorAll("#kbd [data-m]")].map(e => e.getAttribute("data-m")).join(",");
      return { id, started: true, ended: !L.on && document.getElementById("pkLickBtn").getAttribute("aria-pressed") === "false", n: need.length, unlit: unlit.length,
        out: L.log.filter(n => n.m < 36 || n.m > 96).length, back: keys0 === keys1 && !window.AOG_PKV && !document.querySelector("#kbd .pk-r,#kbd .pk-l"), heard: L.gone.length };
    }, { id, wide });
    notes += r.n || 0; lit += (r.n || 0) - (r.unlit || 0);
    if (!r.started || !r.ended || r.out || r.unlit || !r.back || !r.heard) bad.push(JSON.stringify(r));
  }
  ok(bad.length === 0, `${nm}: ${play.length === en.ids.length ? "all " : ""}${play.length} licks played in A minor (${((Date.now() - t0) / 1000).toFixed(0)} s): ${notes} ${wide >= 3 ? "" : "right-hand "}notes, ${lit} lit on the keys as they sounded (${wide} octaves in view); each ended by itself, the keys back as they were ${bad.slice(0, 4).join(" ")}`);
  /* 4 · Stop */
  const st = await f.evaluate(async () => {
    const sel = document.getElementById("pkLickSel"), btn = document.getElementById("pkLickBtn"); sel.value = "p_rkpound"; sel.dispatchEvent(new Event("change", { bubbles: true }));
    btn.click(); await new Promise(r => setTimeout(r, 700)); const was = AOGPianoLicks._t.L.on, n = AOGPianoLicks._t.L.voices.length;
    btn.click(); const now = ac.currentTime; await new Promise(r => setTimeout(r, 120));
    const gone = AOGPianoLicks._t.L.gone;
    return { was, n, on: AOGPianoLicks._t.L.on, quiet: gone.length > 0 && gone.every(v => v.end <= now + 0.1), lit: document.querySelectorAll("#kbd .pk-r,#kbd .pk-l").length, btn: btn.textContent };
  });
  ok(st.was && !st.on && st.quiet && st.lit === 0 && st.btn === "▶ Play this lick", `${nm}: ■ Stop stops it at once: ${JSON.stringify(st)}`);
  /* the key and the mood */
  const km = await f.evaluate(async () => {
    const sel = document.getElementById("pkLickSel"), btn = document.getElementById("pkLickBtn"), ks = document.getElementById("keySel"), wait = ms => new Promise(r => setTimeout(r, ms));
    document.getElementById("minBtn").click(); ks.value = "9"; ks.onchange(); sel.value = "p_jzwalk"; sel.dispatchEvent(new Event("change", { bubbles: true }));
    btn.click(); await wait(250); const a = AOGPianoLicks._t.L.log.filter(n => n.h === "r").map(n => n.m % 12);
    ks.value = "2"; ks.onchange(); await wait(350); const L = AOGPianoLicks._t.L, d = { on: L.on, mk: L.mk, pcs: L.log.filter(n => n.h === "r").map(n => n.m % 12) }; btn.click();
    document.getElementById("majBtn").click(); await wait(50); btn.click(); await wait(250); const maj = AOGPianoLicks._t.L.log.filter(n => n.h === "r").map(n => n.m % 12); btn.click();
    ks.value = "9"; ks.onchange(); document.getElementById("minBtn").click();
    return { a, d, maj };
  });
  /* p_jzwalk starts on the two chord's third: F in A minor (Bm7b5 → D), G in D minor (Em7b5 → G), G♯ in D major (Em7 → G) */
  ok(km.d.on && km.d.mk === "2m" && km.d.pcs.every((x, i) => x === (km.a[i] + 5) % 12) && km.maj.length === km.a.length && km.maj.some((x, i) => x !== km.d.pcs[i]),
    `${nm}: it follows the key: A minor (${km.a.slice(0, 4)}), to D minor while it plays (${km.d.pcs.slice(0, 4)}), D major (${km.maj.slice(0, 4)})`);
  /* Lick speed */
  const sp = await f.evaluate(async () => {
    const sel = document.getElementById("pkLickSel"), btn = document.getElementById("pkLickBtn"), r = document.getElementById("pkLickSpd"), wait = ms => new Promise(z => setTimeout(z, ms));
    const len = async (v) => { r.value = String(v); r.dispatchEvent(new Event("input", { bubbles: true })); sel.value = "p_rkpound"; sel.dispatchEvent(new Event("change", { bubbles: true }));
      btn.click(); await wait(60); const L = AOGPianoLicks._t.L, o = { len: L.end - L.T0, out: document.getElementById("pkLickSpdOut").textContent }; btn.click(); return o; };
    const a = await len(100), h = await len(50), q = await len(25); await len(100); return { a, h, q };
  });
  ok(Math.abs(sp.h.len / sp.a.len - 2) < 0.08 && Math.abs(sp.q.len / sp.a.len - 4) < 0.15 && sp.h.out === "50% speed", `${nm}: Lick speed: full ${sp.a.len.toFixed(2)} s, half ${sp.h.len.toFixed(2)} s ("${sp.h.out}"), a quarter ${sp.q.len.toFixed(2)} s`);
  /* the song's tempo, not clamped; the line says it once */
  const sg = await f.evaluate(async () => {
    const sel = document.getElementById("pkLickSel"), btn = document.getElementById("pkLickBtn"), wait = ms => new Promise(z => setTimeout(z, ms)), out = {};
    sel.value = "p_slsing"; sel.dispatchEvent(new Event("change", { bubbles: true }));
    for (const bpm of [73.5, 170]) { AOGSong.set({ bpm }); await wait(80); btn.click(); await wait(60); const L = AOGPianoLicks._t.L; out[bpm] = { beat: L.beat, line: document.getElementById("pkSong").textContent }; btn.click(); }
    out.count = [...document.querySelectorAll("#pkLicksIn p")].filter(p => /In your song/.test(p.textContent)).length;
    return out;
  });
  ok(Math.abs(sg[73.5].beat - 60 / 73.5) < 1e-6 && Math.abs(sg[170].beat - 60 / 170) < 1e-6 && /In your song: A minor, 73\.5 beats a minute\./.test(sg[73.5].line) && /170 beats a minute/.test(sg[170].line) && sg.count === 1,
    `${nm}: at the song's tempo: 73.5 (a beat ${sg[73.5].beat.toFixed(3)} s), 170 (${sg[170].beat.toFixed(3)} s); "${sg[73.5].line}"`);
  await f.evaluate(() => AOGSong.set({ bpm: 120 }));
  /* Fit to my chords: the room's own chord pattern; Repeat */
  const ft = await f.evaluate(async () => {
    const sel = document.getElementById("pkLickSel"), btn = document.getElementById("pkLickBtn"), fit = document.getElementById("pkFit"), wait = ms => new Promise(z => setTimeout(z, ms));
    S.prog = [{ off: 0, q: "min" }, { off: 8, q: "maj" }, { off: 3, q: "maj" }, { off: 10, q: "maj" }];
    sel.value = "p_poarp"; sel.dispatchEvent(new Event("change", { bubbles: true }));
    fit.click(); btn.click(); await wait(80); const L = AOGPianoLicks._t.L, B = L.B;
    const bars = B.chords.map(c => c.root + ":" + c.q).join(" "), C = AOGPianoLicks.compile(AOGPianoLicks.LICKS.p_poarp, { key: S.key, minor: S.minor, fit: { prog: S.prog } });
    const bad = AOGPianoLicks.check(C).concat(JSON.stringify(C.notes.map(n => n.m)) === JSON.stringify(B.notes.map(n => n.m).slice(0, C.notes.length)) ? [] : ["not the notes it plays"]);
    btn.click(); const pressed = fit.getAttribute("aria-pressed");
    const reps = {}; for (const n of [1, 2, 4]) { document.querySelector(`#pkRep [data-rep="${n}"]`).click(); btn.click(); await wait(40); reps[n] = { beats: AOGPianoLicks._t.L.B.beats, len: AOGPianoLicks._t.L.end - AOGPianoLicks._t.L.T0 }; btn.click(); }
    document.querySelector('#pkRep [data-rep="1"]').click(); fit.click();
    return { fit: B.fit, bars, bad, pressed, reps, off: fit.getAttribute("aria-pressed") };
  });
  ok(ft.fit && ft.bars.startsWith("0:min 8:maj 3:maj 10:maj") && ft.bad.length === 0 && ft.pressed === "true" && ft.off === "false",
    `${nm}: Fit to my chords plays it on the room's chord pattern (${ft.bars}) and keeps the numbers ${ft.bad.slice(0, 3).join(" | ")}`);
  ok(ft.reps[2].beats === 2 * ft.reps[1].beats && ft.reps[4].beats === 4 * ft.reps[1].beats && Math.abs(ft.reps[4].len / ft.reps[1].len - 4) < 0.25,
    `${nm}: Repeat 1, 2, 4: ${ft.reps[1].beats}, ${ft.reps[2].beats}, ${ft.reps[4].beats} beats`);
  /* ● Record this lick: a take at the song's tempo, + Add to My Track and Send to the drum machine take it */
  const rc = await f.evaluate(async () => {
    const sel = document.getElementById("pkLickSel"), wait = ms => new Promise(z => setTimeout(z, ms));
    AOGSong.set({ bpm: 96 }); await wait(60);
    sel.value = "p_rkpound"; sel.dispatchEvent(new Event("change", { bubbles: true }));
    document.querySelector('#pkRep [data-rep="2"]').click();
    const n0 = REC.takes.length ? REC.takes[0].n : 0;
    document.getElementById("pkRec").click();
    const lim = performance.now() + 30000; while (AOGPianoLicks._t.RC.busy && performance.now() < lim) await wait(100);
    const k = REC.takes[0], last = AOGPianoLicks._t.last, line = document.getElementById("pkLine").textContent;
    document.querySelector('#pkRep [data-rep="1"]').click();
    if (!k || k.n === n0) return { made: false, line };
    const ab = await k.blob.arrayBuffer(), oc = new OfflineAudioContext(2, 44100, 44100), buf = await oc.decodeAudioData(ab), x = buf.getChannelData(0);
    let pk = 0, first = -1; for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > pk) pk = a; if (first < 0 && a > 0.01) first = i; }
    const shown = [...document.querySelectorAll("#takes .aogrec-take")].length;
    await AOGStudioRec.add(); await wait(300);
    const ix = await AOGHandoff.list(AOGHandoff.INBOX), it = ix.items.length ? await AOGHandoff.item(AOGHandoff.INBOX, ix.items[0].id) : null;
    const db = document.querySelector(`#takes [data-aogrec-drum="${k.n}"]`); if (db) db.click(); await wait(400);
    const pt = await AOGHandoff.get("padstake").catch(() => null);
    return { made: true, line, n: k.n, sec: +k.sec.toFixed(3), bpm: k.bpm, beats: last && last.beats, pk: +pk.toFixed(3), first: first / 44100, shown,
      inbox: it && { from: it.from, bpm: it.bpm, place: it.place, key: it.notes && it.notes.key, ev: it.notes && it.notes.ev.length }, pads: !!(pt && pt.from === "piano") };
  });
  const wantSec = rc.beats * 60 / 96;
  ok(rc.made && rc.bpm === 96 && rc.beats === 32 && rc.sec >= wantSec && rc.sec <= wantSec + 3 && rc.pk < 1 && rc.pk > 0.05 && rc.first < 0.02 && rc.shown >= 1 && rc.line === "Done. It is with your takes.",
    `${nm}: ● Record this lick: take ${rc.n}, ${rc.sec} s for ${rc.beats} beats at ${rc.bpm} (a repeat of 2), first sound at ${(rc.first * 1000).toFixed(1)} ms, peak ${rc.pk}; "${rc.line}"`);
  ok(rc.inbox && rc.inbox.from === "piano" && rc.inbox.bpm === 96 && rc.inbox.place && rc.inbox.place.bar === 1 && rc.inbox.key && rc.inbox.key.key === 9 && rc.inbox.key.minor === true && rc.inbox.ev > 0 && rc.pads,
    `${nm}: + Add to My Track puts it on bar 1 at 96 with its key (A minor) and its notes; Send to the drum machine takes it ${JSON.stringify(rc.inbox)} pads ${rc.pads}`);
  /* a hidden tab and the Studio's hush stop it */
  const hs = await f.evaluate(async () => {
    const btn = document.getElementById("pkLickBtn"), wait = ms => new Promise(z => setTimeout(z, ms)), out = {};
    btn.click(); await wait(100); window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: true } })); out.hush = !AOGPianoLicks._t.L.on; window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: false } }));
    btn.click(); await wait(100); Object.defineProperty(document, "hidden", { value: true, configurable: true }); document.dispatchEvent(new Event("visibilitychange")); out.hidden = !AOGPianoLicks._t.L.on;
    delete document.hidden; return out;
  });
  ok(hs.hush && hs.hidden, `${nm}: the Studio's hush and a hidden tab stop it ${JSON.stringify(hs)}`);
  /* Spanish */
  await f.evaluate(() => document.getElementById("langBtn").click());
  await f.waitForTimeout(100);
  const es = await f.evaluate(() => ({ groups: [...document.querySelectorAll("#pkLickSel optgroup")].map(g => g.label), names: [...document.querySelectorAll("#pkLickSel option")].map(o => o.textContent),
    sum: document.querySelector("#pkLicks>summary").textContent, lab: document.querySelector('#pkLicksIn [data-pk="lickLab"]').textContent, btn: document.getElementById("pkLickBtn").textContent,
    fit: document.getElementById("pkFit").textContent, rep: document.querySelector('#pkLicksIn [data-pk="rep"]').textContent, rec: document.getElementById("pkRec").textContent, song: document.getElementById("pkSong").textContent,
    all: AOGPianoLicks.ORDER.every(id => { const n = AOGPianoLicks.WORDS["lk_" + id], d = AOGPianoLicks.WORDS["ld_" + id]; return n && d && n.es && d.es && n.en && d.en && d.es !== d.en; }) }));
  await f.evaluate(() => document.getElementById("langBtn").click());
  ok(JSON.stringify(es.groups) === JSON.stringify(GROUPS_ES) && es.sum === "Frases para probar" && es.lab === "Frase" && es.btn === "▶ Tocar esta frase" && es.fit === "Seguir mis acordes" && es.rep === "Repetir" && es.rec === "● Grabar esta frase"
    && /^En tu canción: La menor, 96 pulsos por minuto\.$/.test(es.song) && es.all && es.names.length === NLICKS && es.names.filter((x, i) => x !== en.names[i]).length > 100,
    `${nm}: Spanish: "${es.sum}", "${es.lab}", "${es.btn}", "${es.fit}", "${es.rep}", "${es.rec}"; "${es.song}"`);
  /* afterwards it rests */
  const rest = await f.evaluate(async () => { await new Promise(r => setTimeout(r, 2500)); window.__calls = []; await new Promise(r => setTimeout(r, 3000));
    const mine = window.__calls.filter(c => /aog-piano-licks\.js/.test(c));
    return { mine: mine.length, what: mine.slice(0, 2), all: window.__calls.length, on: AOGPianoLicks._t.L.on }; });
  ok(rest.mine === 0 && !rest.on, `${nm}: stopped, the licks rest: ${rest.mine} timer or frame callbacks from them in 3 s (${rest.all} in the room in all) ${rest.what.join(" | ")}`);
  await ctx.close();
}

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] }); const errs = [];
  if (!process.env.PIANOLICKS_DEVICES) await numbers(b, errs);
  if (!process.env.PIANOLICKS_NUMBERS) await Promise.all([["iPhone", { width: 390, height: 844 }], ["iPad", { width: 820, height: 1180 }], ["iPad sideways", { width: 1180, height: 820 }]].map(([nm, vw]) => device(b, nm, vw, errs)));
  ok(errs.length === 0, "no page errors " + errs.slice(0, 5).join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + (e.stack || e.message)); process.exit(1); });
