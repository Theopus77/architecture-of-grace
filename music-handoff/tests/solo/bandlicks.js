/* AOG-BAND-LICKS-V1, AOG-LICKS-SONG-V1 (2026-10-19) — Jimmy: "start some agents on the piano and band licks as well that follow
   the same style of the guitar and bass licks", then "I could use them … in making a song without much modification of my
   own." The Band's licks, inside the Studio, in the Band room:
   0 · by numbers, every lick in all 24 keys (twelve major, twelve minor) on every player of the manifest that plays licks,
       once and repeated twice: every note inside that player's reach; beats 1 and 3 on the chord's own notes; every other
       note the key's or the chord's, or passing by a half or whole step on purpose; a breath (a rest of half a beat or more)
       at least every two bars, the seam of a repeat too; no wider than SPANMAX; whole bars from beat 1; it ends on its
       chord's root; the same shape in every key. Fit to my chords: the same numbers on the Band's own chord patterns (major,
       minor, with sevenths, diminished), repeated twice and four times. Repeat: the seams gap-free.
       Rendered offline at the song's tempo (on the trumpet every lick; the first of each group on the alto sax, the big band
       and the flute): never over full scale, never silent, no clicks where notes stop, glide or shake.
   on an iPhone, an iPad and an iPad sideways, at once:
   1 · the licks load only when "Licks to try" is opened; the menu has every group (22) with at least six licks in each, in
       English and Spanish; the block sits right under the keys; pressed from the foot of the page the keys are in sight
   2 · every lick plays (all on the iPhone, every third on the iPads): each note sounds, each is lit on the keys in turn,
       inside the player's reach, and it ends by itself
   3 · Stop stops it at once; it follows a key change while it plays, and minor and major; Lick speed changes its length;
       with the chord pattern playing it starts on a bar line and the band plays the lick's chords; with Fit to my chords
       the band keeps its own and the lick's notes follow them
   4 · the song's tempo and key: set in the song (aog-song.js), the lick plays there, and the line says so
   5 · ● Record this lick: a take of this room at the song's tempo, from its first note on the downbeat, that + Add to My
       Track (AOGStudioRec.add) puts in the Studio's inbox with its tempo and notes, and Send to the drum machine sends
   6 · the Studio's hush and a hidden tab stop it; afterwards no timer or frame callback from the licks; no page errors.
   Port 9450. BANDLICKS_QUICK=1: fewer licks played and rendered (a quick look while working). */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const path = require("path"), PORT = 9450, srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const QUICK = !!process.env.BANDLICKS_QUICK;
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const GROUPS_EN = ["Blues", "Jazz and bebop", "Swing and big band", "Cool and modal jazz", "Funk horns", "Motown and soul", "R&B and hip-hop", "Gospel",
  "New Orleans and second line", "Ska and reggae", "Latin: salsa and mambo", "Afrobeat", "Disco", "Pop", "Rock horns", "Country and folk", "Slow and singing",
  "Classical", "Marches and fanfares", "Section hits and backgrounds", "Call and response", "Fills and turnarounds"];
const GROUPS_ES = ["Blues", "Jazz y bebop", "Swing y big band", "Cool jazz y jazz modal", "Metales de funk", "Motown y soul", "R&B y hip-hop", "Gospel",
  "Nueva Orleans y second line", "Ska y reggae", "Latino: salsa y mambo", "Afrobeat", "Disco", "Pop", "Metales de rock", "Country y folk", "Lentas y cantadas",
  "Clásica", "Marchas y fanfarrias", "Golpes de sección y fondos", "Pregunta y respuesta", "Rellenos y vueltas"];
const NLICKS = 154, NGROUPS = 22;
const COUNT = () => { window.__calls = []; const si = window.setInterval, st = window.setTimeout, raf = window.requestAnimationFrame;
  const tag = k => { const s = (new Error().stack || "").split("\n").slice(2, 7).join(" "); return () => { if (window.__calls.length < 4000) window.__calls.push(k + " " + s); }; };
  window.setInterval = (f, ...a) => { const t = tag("interval"); return si(() => { t(); typeof f === "function" && f(); }, ...a); };
  window.setTimeout = (f, ...a) => { const t = tag("timeout"); return st(() => { t(); typeof f === "function" && f(); }, ...a); };
  window.requestAnimationFrame = f => { const t = tag("frame"); return raf(x => { t(); f(x); }); }; };

async function openBand(b, vw, errs, nm) {
  const ctx = await b.newContext({ viewport: vw, isMobile: true, hasTouch: true, serviceWorkers: "block" });
  await ctx.addInitScript(COUNT);
  await ctx.addInitScript(() => { try { if (!sessionStorage.getItem("__bl")) { sessionStorage.setItem("__bl", "1"); localStorage.removeItem("aog.band.licks.v1"); localStorage.removeItem("aog.song.v1"); } } catch (e) {} });
  ctx.on("page", pg => pg.on("pageerror", e => errs.push(nm + ": " + e.message)));
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  const p = await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#band`);
  await p.waitForFunction(() => [...document.querySelectorAll("iframe")].some(f => { try { return f.contentWindow.AOGBandLick && f.contentDocument.getElementById("kbd"); } catch (e) { return false; } }), null, { timeout: 60000 });
  const f = p.frames().find(x => /music-band/.test(x.url()));
  const lazy = await f.evaluate(() => ({ lib: !!window.AOGBandLicks, tag: !!document.querySelector('script[src*="aog-band-licks"]'), shut: document.getElementById("lkBody").hidden }));
  await f.evaluate(() => { if (S.lang !== "en") document.getElementById("langBtn").click();
    const s = document.getElementById("soundSel"); if (S.sound !== "trumpet") { s.value = "trumpet"; s.onchange(); }
    if (S.minor) document.getElementById("majBtn").click(); const k = document.getElementById("keySel"); k.value = "0"; k.onchange();
    document.getElementById("lkOpen").click(); });
  await f.waitForFunction(() => window.AOGBandLicks && document.querySelectorAll("#lkSel option").length > 0, null, { timeout: 20000 });
  await f.waitForFunction(() => soundReady(S.sound), null, { timeout: 40000 }).catch(() => {});
  return { ctx, p, f, lazy };
}

/* ── 0 · the numbers, in the page (its own manifest, scales and chord notes) ── */
const NUMBERS = (quick) => {
  const L = AOGBandLicks, MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10];
  const QT = { maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6], dom7: [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], m7b5: [0, 3, 6, 10] };
  const players = Object.keys(MAN).map(p => [p, L.reach(p, MAN[p].sus)]).filter(x => x[1]);
  const none = Object.keys(MAN).filter(p => !L.reach(p, MAN[p].sus));
  const out = { n: 0, notes: 0, bad: [], strong: 0, passing: 0, breaths: 0, players: players.length, none, fits: 0, seams: 0 };
  const fail = (s) => { if (out.bad.length < 30) out.bad.push(s); };
  const verify = (C, tag, key, minor, R0) => {
    if (!C) { fail(tag + ": does not fit"); return; }
    const SC = minor ? MIN : MAJ;
    if (C.notes[0].tb !== 0) fail(tag + ": does not start on beat 1");
    if (Math.abs(C.one / 4 - Math.round(C.one / 4)) > 1e-6) fail(tag + ": not whole bars");
    let from = 0, run = 0;
    C.notes.forEach((n, i) => {
      out.notes++;
      if (n.m < R0[0] || n.m > R0[1]) fail(`${tag}: note ${i} (${n.m}) outside ${R0}`);
      const ch = C.chords.find(c => n.tb >= c.t0 - 1e-6 && n.tb < c.t1 - 1e-6) || C.chords[C.chords.length - 1];
      const pc = ((n.m - key) % 12 + 12) % 12, tones = QT[ch.q].map(x => (ch.root + x) % 12), strong = Math.abs(n.tb / 2 - Math.round(n.tb / 2)) < 1e-6;
      if (strong) { out.strong++; if (tones.indexOf(pc) < 0) fail(`${tag}: beat ${n.tb + 1} not in the chord`); }
      if (SC.indexOf(pc) < 0 && tones.indexOf(pc) < 0) { out.passing++; const nx = C.notes[i + 1];
        if (strong || !nx || Math.abs(nx.m - n.m) > 2) fail(`${tag}: note ${i} outside the key, not passing by step`); }
      const pv = C.notes[i - 1]; if (pv && n.tb - (pv.tb + pv.slot) >= 0.5 - 1e-6) { from = n.tb; out.breaths++; }
      run = Math.max(run, n.tb + n.slot - from);
    });
    if (run > 8 + 1e-6) fail(`${tag}: ${run} beats without a breath`);
    for (let k = 0; k < C.times; k++) { const ms = C.notes.filter(n => Math.floor(n.tb / C.one + 1e-9) === k).map(n => n.m); if (Math.max(...ms) - Math.min(...ms) > L.SPANMAX) fail(tag + ": too wide"); }
    const last = C.notes[C.notes.length - 1], lc = C.chords[last.chord];
    if (((last.m - key - lc.root) % 12 + 12) % 12 !== 0) fail(tag + ": does not end on its chord's root");
    if (Math.abs(C.beats - C.chordBeats) > 1e-6) fail(tag + ": notes and chords not the same length");
    if (C.times > 1) { out.seams++; const firsts = C.notes.filter(n => Math.abs(n.tb / C.one - Math.round(n.tb / C.one)) < 1e-9 && n.tb > 0);
      if (firsts.length !== C.times - 1) fail(tag + ": a repeat does not start right on its bar line");
      C.notes.forEach((n, i) => { const nx = C.notes[i + 1]; if (nx && n.t + n.d > nx.t + 1e-6) fail(tag + ": two notes overlap at " + n.tb); }); }
  };
  /* the Band's own patterns: major, minor, sevenths, diminished */
  const FITS = PRESETS.filter(p => p.chords.length >= 2).filter((p, i, a) => i % Math.max(1, Math.floor(a.length / 10)) === 0).slice(0, 10).map(p => ({ id: p.id, minor: !!p.minor, ch: p.chords.map(c => ({ off: c.off, q: c.q })) }));
  const fitQs = new Set([].concat(...FITS.map(f => f.ch.map(c => c.q))));
  L.ORDER.forEach(id => {
    const def = L.LICKS[id];
    for (const [p, R0] of players) {
      if (quick && players.indexOf(players.find(x => x[0] === p)) % 6) continue;
      const ref = {};
      for (let key = 0; key < 12; key++) for (const minor of [false, true]) {
        for (const times of [1, 2]) { const C = L.compile(def, { key, minor, range: R0, times }); out.n++; verify(C, `${id} on ${p} in ${key}${minor ? "m" : ""} x${times}`, key, minor, R0);
          if (C && times === 1) { const shape = C.notes.map(n => n.m - C.notes[0].m).join(","), m = minor ? "min" : "maj"; if (ref[m] == null) ref[m] = shape; else if (ref[m] !== shape) fail(`${id} on ${p}: not the same shape in every key`); } }
      }
    }
    /* fitted, on a few players (the trumpet, the tuba, the flute, the violins), in four keys, on the Band's patterns */
    for (const p of ["trumpet", "tuba", "flute", "violins"]) { const R0 = L.reach(p, MAN[p].sus);
      for (const key of [0, 3, 7, 10]) for (const F of FITS) for (const times of [2, 4]) {
        const C = L.compile(def, { key, minor: F.minor, range: R0, fit: F.ch, times }); out.fits++; verify(C, `${id} on ${p} in ${key}${F.minor ? "m" : ""} fitted to ${F.id} x${times}`, key, F.minor, R0); } }
  });
  out.fitQs = [...fitQs]; out.fitN = FITS.length; out.fitIds = FITS.map(f => f.id);
  return out;
};
/* offline: the lick's sound, its peak, and its worst click (energy above 8 kHz in 1 ms windows, 15 dB over every window in
   the 70 ms around it; the first 35 ms of each note, its own attack, left out: a low brass recording speaks about 20 ms
   after its start), as basslicks.js measures one */
const RENDER = async (ids) => {
  const hp = (x, fc, sr) => { const w0 = 2 * Math.PI * fc / sr, al = Math.sin(w0) / (2 * 0.7071), cs = Math.cos(w0), a0 = 1 + al;
    const b0 = (1 + cs) / 2 / a0, b1 = -(1 + cs) / a0, b2 = (1 + cs) / 2 / a0, a1 = -2 * cs / a0, a2 = (1 - al) / a0, y = new Float32Array(x.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = x[i], o = b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o; } return y; };
  const out = [];
  for (const id of ids) {
    const R = await AOGBandLick._t.lkRender(id); if (!R) { out.push({ id, none: true }); continue; }
    const sr = R.o.sr, x = R.o.L, h = hp(x, 8000, sr), W = Math.round(0.001 * sr), n = Math.floor(x.length / W), e = new Float64Array(n);
    let pk = 0, rms = 0, first = -1; for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > pk) pk = a; rms += x[i] * x[i]; if (first < 0 && a > 0.002) first = i / sr; } rms = Math.sqrt(rms / x.length);
    for (let k = 0; k < n; k++) { let s = 0; for (let i = k * W; i < (k + 1) * W; i++) s += h[i] * h[i]; e[k] = s / W; }
    const skip = new Uint8Array(n); R.starts.forEach(t => { const a = Math.floor((t - 0.003) * 1000), z = Math.ceil((t + 0.035) * 1000); for (let k = Math.max(0, a); k < Math.min(n, z); k++) skip[k] = 1; });
    const floor = Math.pow(pk * Math.pow(10, -75 / 20), 2); let worst = 0, at = -1;
    for (let k = 0; k < n; k++) { if (skip[k]) continue; let mx = 0;
      for (let j = Math.max(0, k - 35); j < Math.min(n, k + 36); j++) if (Math.abs(j - k) > 3 && e[j] > mx) mx = e[j];
      const q = (e[k] + floor) / (mx + floor); if (q > worst) { worst = q; at = k / 1000; } }
    out.push({ id, pk: +pk.toFixed(3), rms: +rms.toFixed(4), db: +(10 * Math.log10(worst || 1)).toFixed(1), at: +at.toFixed(3), first: +first.toFixed(3), sec: +(x.length / sr).toFixed(2), want: +(R.C.beats * R.beat + 1.5).toFixed(2) });
  }
  return out;
};

async function numbers(b, errs) {
  const { ctx, f, lazy } = await openBand(b, { width: 390, height: 844 }, errs, "numbers");
  ok(!lazy.lib && !lazy.tag && lazy.shut, `the licks are not loaded until "Licks to try" is opened (${JSON.stringify(lazy)})`);
  const t0 = Date.now(), r = await f.evaluate(NUMBERS, QUICK);
  ok(r.bad.length === 0 && r.n >= NLICKS * 24 * 2 * (QUICK ? 5 : r.players), `by numbers: ${NLICKS} licks on ${r.players} players (none for ${r.none.join(", ")}) in 24 keys, once and twice: ${r.n} licks, ${r.notes} notes; on beats 1 and 3, ${r.strong} notes all in the chord; ${r.passing} passing notes, each by step; ${r.breaths} breaths; ${r.seams} repeats with clean seams (${((Date.now() - t0) / 1000).toFixed(0)} s) ${r.bad.slice(0, 6).join(" | ")}`);
  ok(r.fits > 0 && ["min", "dom7"].every(q => r.fitQs.indexOf(q) >= 0), `Fit to my chords: ${r.fits} fitted licks on ${r.fitN} of the Band's patterns (${r.fitIds.join(", ")}; chords ${r.fitQs.join(", ")}), twice and four times, the same numbers`);
  const ids = await f.evaluate(() => AOGBandLicks.ORDER.slice());
  const firsts = await f.evaluate(() => AOGBandLicks.GROUPS.map(g => g[1][0]));
  await f.evaluate(() => { S.key = 9; S.minor = true; S.bpm = 120; });
  const tr = Date.now(), all = await f.evaluate(RENDER, QUICK ? firsts : ids), ms = Date.now() - tr;
  const bad = all.filter(x => x.none || x.pk >= 1 || x.rms < 0.004 || x.db > 15 || x.first > 0.03 || Math.abs(x.sec - x.want) > 0.02);
  ok(!bad.length, `rendered offline on the trumpet in A minor at 120 a minute, ${all.length} licks (${(ms / 1000).toFixed(0)} s): peaks ${Math.min(...all.map(x => x.pk))} to ${Math.max(...all.map(x => x.pk))}, never silent, first sound within ${Math.max(...all.map(x => x.first))} s of the downbeat, no clicks (worst ${Math.max(...all.map(x => x.db))} dB over its neighbours) ${bad.slice(0, 5).map(x => JSON.stringify(x)).join(" ")}`);
  for (const snd of ["sax", "bigband", "flute", "tuba"]) {
    await f.evaluate((snd) => { const s = document.getElementById("soundSel"); s.value = snd; s.onchange(); }, snd);
    await f.waitForFunction(() => soundReady(S.sound), null, { timeout: 60000 }).catch(() => {});
    const rr = await f.evaluate(RENDER, firsts), bb = rr.filter(x => x.none || x.pk >= 1 || x.rms < 0.004 || x.db > 15);
    ok(rr.length === NGROUPS && !bb.length, `and on the ${snd}, the first lick of each group: no clicks (worst ${Math.max(...rr.map(x => x.db))} dB), peaks under full scale (${Math.max(...rr.map(x => x.pk))}) ${bb.slice(0, 4).map(x => JSON.stringify(x)).join(" ")}`);
  }
  await ctx.close();
}

async function device(b, nm, vw, errs) {
  const { ctx, p, f } = await openBand(b, vw, errs, nm);
  /* 1 · the menu, in English, and its place */
  const en = await f.evaluate(() => ({ groups: [...document.querySelectorAll("#lkSel optgroup")].map(g => [g.label, g.querySelectorAll("option").length]),
    ids: [...document.querySelectorAll("#lkSel option")].map(o => o.value), names: [...document.querySelectorAll("#lkSel option")].map(o => o.textContent),
    h: document.getElementById("lkOpen").textContent, lab: document.querySelector('#bandLicks [data-t="lickLab"]').textContent, btn: document.getElementById("lkPlay").textContent,
    fit: document.getElementById("lkFit").textContent, rep: document.getElementById("lkRepLab").textContent, rec: document.getElementById("lkRec").textContent,
    line: document.getElementById("lkLine").textContent, song: document.getElementById("lkSong").textContent }));
  ok(JSON.stringify(en.groups.map(g => g[0])) === JSON.stringify(GROUPS_EN) && en.groups.every(g => g[1] >= 6) && en.ids.length === NLICKS && new Set(en.ids).size === NLICKS && en.names.every(x => x && !/^lk_/.test(x)) && !/elite/i.test(en.names.join(" ")),
    `${nm}: ${en.ids.length} licks in ${en.groups.length} groups: ${en.groups.map(g => g[0] + " " + g[1]).join(", ")}`);
  ok(en.h === "Licks to try" && en.lab === "Lick" && en.btn === "▶ Play this lick" && en.fit === "Fit to my chords" && en.rep === "Repeat" && en.rec === "● Record this lick" && en.line.length > 20 && /^In your song: C major, \d+ beats a minute\.$/.test(en.song),
    `${nm}: "${en.h}", "${en.lab}", "${en.btn}", "${en.fit}", "${en.rep}", "${en.rec}"; "${en.song}"; "${en.line}"`);
  const near = await f.evaluate(async () => {
    const kb = document.getElementById("kbd"), box = document.getElementById("bandLicks"), btn = document.getElementById("lkPlay"), W = ms => new Promise(r => setTimeout(r, ms));
    const gap = box.getBoundingClientRect().top - kb.getBoundingClientRect().bottom, after = kb.nextElementSibling === box;
    scrollTo(0, document.documentElement.scrollHeight); await W(100);
    btn.click(); await W(300);
    const k = kb.getBoundingClientRect(), seen = k.top >= -1 && k.bottom <= innerHeight + 1, playing = AOGBandLick._t.LK.on && btn.getAttribute("aria-pressed") === "true";
    btn.click(); return { gap: Math.round(gap), after, seen, playing, stopped: !AOGBandLick._t.LK.on };
  });
  ok(near.after && near.gap >= 0 && near.gap <= 60, `${nm}: Licks to try sits right under the keys (${near.gap} px below them)`);
  ok(near.seen && near.playing && near.stopped, `${nm}: pressed from the foot of the page, the lick plays with the keys in sight`);
  /* 2 · every lick plays, every note sounding, inside the reach and lit in turn, and ends */
  await f.evaluate(() => { const k = document.getElementById("keySel"); k.value = "9"; k.onchange(); document.getElementById("minBtn").click(); const r = document.getElementById("bpm"); r.value = "176"; r.dispatchEvent(new Event("input", { bubbles: true })); });
  const bad = [], t0 = Date.now(); let notes = 0, lit = 0;
  const play = QUICK ? en.ids.filter((id, i) => i % 11 === 0) : nm === "iPhone" ? en.ids : en.ids.filter((id, i) => i % 3 === (nm === "iPad" ? 1 : 2));
  for (const id of play) {
    const r = await f.evaluate(async (id) => {
      const sel = document.getElementById("lkSel"); sel.value = id; sel.dispatchEvent(new Event("change", { bubbles: true }));
      document.getElementById("lkPlay").click();
      const L = AOGBandLick._t.LK; if (!L.on || L.id !== id) return { id, started: false };
      const lim = performance.now() + (L.end - ac.currentTime) * 1000 + 3000;
      while (L.on && performance.now() < lim) await new Promise(r => setTimeout(r, 100));
      const R0 = L.C.pl.range, seen = new Set(L.seen);
      return { id, started: true, ended: !L.on && document.getElementById("lkPlay").getAttribute("aria-pressed") === "false", n: L.log.length, want: L.C.notes.length,
        silent: L.log.filter(x => !x.made).length, out: L.log.filter(x => x.m < R0[0] || x.m > R0[1]).length, unlit: L.C.notes.filter(n => !seen.has(n.m)).length };
    }, id);
    notes += r.n || 0; lit += (r.n || 0) - (r.unlit || 0);
    if (!r.started || !r.ended || r.n !== r.want || r.silent || r.out || r.unlit) bad.push(JSON.stringify(r));
  }
  ok(bad.length === 0, `${nm}: ${play.length === en.ids.length ? "all " : ""}${play.length} licks played on the trumpet in A minor at 176 a minute (${((Date.now() - t0) / 1000).toFixed(0)} s): ${notes} notes, every one sounding inside its reach, ${lit} lit on the keys in turn; each ended by itself ${bad.slice(0, 4).join(" ")}`);
  await f.evaluate(() => { const r = document.getElementById("bpm"); r.value = "100"; r.dispatchEvent(new Event("input", { bubbles: true })); });
  /* 3 · Stop */
  const st = await f.evaluate(async () => {
    const sel = document.getElementById("lkSel"), btn = document.getElementById("lkPlay"); sel.value = "w_afriff"; sel.dispatchEvent(new Event("change", { bubbles: true }));
    btn.click(); await new Promise(r => setTimeout(r, 900)); const vs = AOGBandLick._t.LK.voices.slice(), was = AOGBandLick._t.LK.on;
    btn.click(); await new Promise(r => setTimeout(r, 150));
    return { was, n: vs.length, on: AOGBandLick._t.LK.on, stopped: vs.every(v => v.stopped), lit: document.querySelectorAll("#kbd .lk").length, btn: btn.textContent, raf: AOGBandLick._t.LK.raf };
  });
  ok(st.was && st.n > 0 && !st.on && st.stopped && st.lit === 0 && st.raf === 0 && st.btn === "▶ Play this lick", `${nm}: ■ Stop stops it at once: ${JSON.stringify(st)}`);
  /* the key and the mood */
  const km = await f.evaluate(async () => {
    const sel = document.getElementById("lkSel"), btn = document.getElementById("lkPlay"), ks = document.getElementById("keySel"), wait = ms => new Promise(r => setTimeout(r, ms)), L = AOGBandLick._t.LK;
    document.getElementById("minBtn").click(); ks.value = "9"; ks.onchange(); sel.value = "w_crcall"; sel.dispatchEvent(new Event("change", { bubbles: true }));
    btn.click(); await wait(200); const a = L.C.notes.map(n => n.m % 12);
    ks.value = "2"; ks.onchange(); await wait(300); const d = { on: L.on, pcs: L.C.notes.map(n => n.m % 12) }; btn.click();
    document.getElementById("majBtn").click(); await wait(50); btn.click(); await wait(200); const maj = L.C.notes.map(n => n.m % 12); btn.click();
    ks.value = "9"; ks.onchange(); document.getElementById("minBtn").click();
    return { a, d, maj };
  });
  ok(km.a[0] === 9 && km.a[1] === 0 && km.d.on && km.d.pcs[0] === 2 && km.d.pcs.every((x, i) => x === (km.a[i] + 5) % 12) && km.maj[0] === 2 && km.maj[1] === 6,
    `${nm}: it follows the key: A minor (${km.a.slice(0, 4)}), to D minor while it plays (${km.d.pcs.slice(0, 4)}), D major (${km.maj.slice(0, 4)})`);
  /* Lick speed */
  const sp = await f.evaluate(async () => {
    const sel = document.getElementById("lkSel"), btn = document.getElementById("lkPlay"), r = document.getElementById("lkSpd"), wait = ms => new Promise(z => setTimeout(z, ms));
    const len = async (v) => { r.value = String(v); r.dispatchEvent(new Event("input", { bubbles: true })); sel.value = "w_swriff"; sel.dispatchEvent(new Event("change", { bubbles: true }));
      btn.click(); await wait(60); const L = AOGBandLick._t.LK, o = { len: L.end - L.t0, out: document.getElementById("lkSpdOut").textContent }; btn.click(); return o; };
    const a = await len(100), h = await len(50), q = await len(25); await len(100); return { a, h, q };
  });
  ok(Math.abs(sp.h.len / sp.a.len - 2) < 0.05 && Math.abs(sp.q.len / sp.a.len - 4) < 0.1 && sp.h.out === "50% speed", `${nm}: Lick speed: full ${sp.a.len.toFixed(2)} s, half ${sp.h.len.toFixed(2)} s ("${sp.h.out}"), a quarter ${sp.q.len.toFixed(2)} s`);
  /* with the chord pattern: the lick's chords, then Fit to my chords */
  const bd = await f.evaluate(async () => {
    const $ = id => document.getElementById(id), wait = ms => new Promise(z => setTimeout(z, ms)), L = AOGBandLick._t.LK, sel = $("lkSel"), btn = $("lkPlay");
    const p = PRESETS.find(x => x.minor && x.chords.some(c => c.q === "dom7")) || PRESETS.find(x => x.minor);
    $("progSel").value = p.id; $("progSel").onchange();
    $("playBtn").click(); await wait(500);
    sel.value = "w_blturn"; sel.dispatchEvent(new Event("change", { bubbles: true })); btn.click();
    const k0 = Math.round((L.t0 - PLAY.t0) / PLAY.barSec), onBar = Math.abs((L.t0 - PLAY.t0) / PLAY.barSec - k0) < 1e-3, over = JSON.parse(JSON.stringify(PLAY.over || {}));
    const wantOwn = L.C.chords.filter(c => c.t0 % 4 === 0).map(c => c.band.off + c.band.q);
    btn.click(); await wait(100);
    $("lkFit").click(); btn.click();
    const k1 = Math.round((L.t0 - PLAY.t0) / PLAY.barSec), onBar1 = Math.abs((L.t0 - PLAY.t0) / PLAY.barSec - k1) < 1e-3, over1 = !!PLAY.over;
    const fitCh = L.C.chords.map(c => c.root + c.q), song = L.C.chords.map((c, j) => { const x = S.prog[(k1 + j) % S.prog.length]; return x.off + x.q; });
    btn.click(); $("lkFit").click(); $("playBtn").click(); await wait(100);
    return { pat: p.id, onBar, own: Object.keys(over).sort().map(k => over[k].off + over[k].q), wantOwn, onBar1, over1, fitCh, song, after: !!PLAY.over, playing: S.playing };
  });
  ok(bd.onBar && JSON.stringify(bd.own) === JSON.stringify(bd.wantOwn) && bd.onBar1 && !bd.over1 && JSON.stringify(bd.fitCh) === JSON.stringify(bd.song) && !bd.after && !bd.playing,
    `${nm}: with the "${bd.pat}" pattern playing, the lick starts on a bar line and the band plays its chords (${bd.own.join(" ")}); with Fit to my chords the band keeps its own and the lick follows them (${bd.fitCh.join(" ")})`);
  /* 4 · the song's tempo and key */
  const sg = await f.evaluate(async () => {
    const wait = ms => new Promise(z => setTimeout(z, ms)), L = AOGBandLick._t.LK;
    AOGSong.set({ bpm: 97, key: 7, minor: false }); await wait(400);
    document.getElementById("lkPlay").click(); await wait(80);
    const o = { bpm: S.bpm, key: S.key, minor: S.minor, beat: L.beat, first: L.C.notes[0].m % 12, line: document.getElementById("lkSong").textContent };
    document.getElementById("lkPlay").click(); return o;
  });
  ok(sg.bpm === 97 && sg.key === 7 && !sg.minor && Math.abs(sg.beat - 60 / 97) < 1e-9 && sg.line === "In your song: G major, 97 beats a minute.", `${nm}: the song's tempo and key: ${JSON.stringify(sg)}`);
  /* Repeat: four times, back to back */
  const rp = await f.evaluate(async () => {
    const L = AOGBandLick._t.LK; document.querySelector('#bandLicks [data-rep="4"]').click();
    const sel = document.getElementById("lkSel"); sel.value = "w_crcall"; sel.dispatchEvent(new Event("change", { bubbles: true }));
    const C = AOGBandLick._t.lkCompile("w_crcall", 0), starts = C.notes.filter(n => n.tb % C.one === 0).map(n => n.t);
    document.querySelector('#bandLicks [data-rep="1"]').click();
    return { times: C.times, one: C.one, beats: C.beats, starts, pressed: document.querySelector('#bandLicks [data-rep="1"]').getAttribute("aria-pressed") };
  });
  ok(rp.times === 4 && rp.beats === rp.one * 4 && JSON.stringify(rp.starts) === JSON.stringify([0, 1, 2, 3].map(k => k * rp.one)) && rp.pressed === "true", `${nm}: Repeat 4: ${rp.beats} beats, each time round starting right on its bar (${rp.starts.join(", ")})`);
  /* 5 · Record this lick, then + Add to My Track and Send to the drum machine */
  const rc = await f.evaluate(async () => {
    const $ = id => document.getElementById(id), wait = ms => new Promise(z => setTimeout(z, ms)), L = AOGBandLick._t.LK;
    document.querySelector('#bandLicks [data-rep="2"]').click();
    const sel = $("lkSel"); sel.value = "w_swriff"; sel.dispatchEvent(new Event("change", { bubbles: true }));
    const before = window.AOGStudioRec.last();
    $("lkRec").click(); const lim = performance.now() + 30000; await wait(50); while (L.rec && performance.now() < lim) await wait(100);
    const last = window.AOGStudioRec.last(), line = $("lkLine").textContent;
    await window.AOGStudioRec.add(); await wait(300);
    const inbox = await AOGHandoff.list(AOGHandoff.INBOX), meta = inbox.items.find(x => x.from === "band" && x.n === (last && last.n)), mine = meta ? await AOGHandoff.item(AOGHandoff.INBOX, meta.id) : null;
    const db = document.querySelector('#takes [data-aogrec-drum]'); if (db) db.click(); await wait(800);
    const pads = await AOGHandoff.get("padstake");
    let first = -1, pk = 0; if (mine && mine.wav) { const ab = await mine.wav.arrayBuffer(), dv = new DataView(ab), n = (ab.byteLength - 44) / 4;
      for (let i = 0; i < n; i++) { const v = Math.abs(dv.getInt16(44 + i * 4, true)) / 32768; if (v > pk) pk = v; if (first < 0 && v > 0.002) first = i / 44100; } }
    document.querySelector('#bandLicks [data-rep="1"]').click();
    return { before: before && before.n, last, line, made: L.last, inbox: mine ? { bpm: mine.bpm, sec: mine.sec, notes: mine.notes && mine.notes.ev.length, place: mine.place } : null, pads: !!(pads && pads.from === "band"), first, pk, err: L.err || "" };
  });
  const want = rc.made ? rc.made.beats * 60 / 97 + 1.5 : 0;
  ok(rc.last && rc.last.n === (rc.before || 0) + 1 && /^Done\. Your lick is take \d+/.test(rc.line) && rc.made && rc.made.beats === 16 && Math.abs(rc.last.sec - want) < 0.02 && rc.last.notes > 0,
    `${nm}: ● Record this lick made take ${rc.last && rc.last.n} (${rc.last && rc.last.sec.toFixed(2)} s for ${rc.made && rc.made.beats} beats at 97 a minute, ${rc.last && rc.last.notes} notes): "${rc.line}" ${rc.err}`);
  ok(rc.inbox && Math.abs(rc.inbox.bpm - 97) < 0.01 && rc.inbox.notes > 0 && rc.inbox.place && rc.inbox.place.bar === 1 && rc.pads && rc.first >= 0 && rc.first < 0.03 && rc.pk < 1,
    `${nm}: + Add to My Track took it (${JSON.stringify(rc.inbox)}), its first sound ${rc.first.toFixed(3)} s from the downbeat, peak ${rc.pk.toFixed(2)}; Send to the drum machine sent it (${rc.pads})`);
  /* Spanish */
  await f.evaluate(() => document.getElementById("langBtn").click());
  const es = await f.evaluate(() => ({ groups: [...document.querySelectorAll("#lkSel optgroup")].map(g => g.label), names: [...document.querySelectorAll("#lkSel option")].map(o => o.textContent),
    h: document.getElementById("lkOpen").textContent, lab: document.querySelector('#bandLicks [data-t="lickLab"]').textContent, btn: document.getElementById("lkPlay").textContent,
    fit: document.getElementById("lkFit").textContent, rep: document.getElementById("lkRepLab").textContent, rec: document.getElementById("lkRec").textContent, song: document.getElementById("lkSong").textContent,
    all: AOGBandLicks.ORDER.every(id => { const n = AOGBandLicks.WORDS["lk_" + id], d = AOGBandLicks.WORDS["ld_" + id]; return n && d && n.es && d.es && n.en && d.en && d.es !== d.en; }) }));
  await f.evaluate(() => document.getElementById("langBtn").click());
  ok(JSON.stringify(es.groups) === JSON.stringify(GROUPS_ES) && es.h === "Frases para probar" && es.lab === "Frase" && es.btn === "▶ Tocar esta frase" && es.fit === "Seguir mis acordes" && es.rep === "Repetir" && es.rec === "● Grabar esta frase"
    && es.song === "En tu canción: Sol mayor, 97 pulsos por minuto." && es.all && es.names.length === NLICKS && es.names.filter((x, i) => x !== en.names[i]).length > 100 && !/elite/i.test(es.names.join(" ")),
    `${nm}: Spanish: "${es.h}", "${es.lab}", "${es.btn}", "${es.fit}", "${es.rep}", "${es.rec}"; "${es.song}"; ${es.groups.join(", ")}`);
  /* 6 · hush, a hidden tab; then it rests */
  const hu = await f.evaluate(async () => {
    const wait = ms => new Promise(z => setTimeout(z, ms)), L = AOGBandLick._t.LK, btn = document.getElementById("lkPlay");
    btn.click(); await wait(200); const a = L.on; window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: true } })); await wait(50); const b = L.on;
    window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: false } }));
    btn.click(); await wait(200); const c = L.on;
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); await wait(50); const d = L.on;
    delete document.hidden; return { a, b, c, d };
  });
  ok(hu.a && !hu.b && hu.c && !hu.d, `${nm}: the Studio's hush and a hidden tab stop it (${JSON.stringify(hu)})`);
  const rest = await f.evaluate(async () => { await new Promise(r => setTimeout(r, 2500)); window.__calls = []; await new Promise(r => setTimeout(r, 3000));
    const mine = window.__calls.filter(c => /lkFrame|playLick|lickStop|lkPaint|lickRecord|lkRender|aog-band-licks/.test(c));
    return { mine: mine.length, what: mine.slice(0, 2), all: window.__calls.length, on: AOGBandLick._t.LK.on, raf: AOGBandLick._t.LK.raf }; });
  ok(rest.mine === 0 && !rest.on && !rest.raf, `${nm}: stopped, the licks rest: ${rest.mine} timer or frame callbacks from them in 3 s (${rest.all} in the room in all) ${rest.what.join(" | ")}`);
  await ctx.close();
}

/* an iPhone on its side: the keys fill the screen, and the open licks come with them as one row */
async function sideways(b, errs) {
  const { ctx, f } = await openBand(b, { width: 844, height: 390 }, errs, "iPhone sideways");
  const r = await f.evaluate(async () => {
    const $ = id => document.getElementById(id), wait = ms => new Promise(z => setTimeout(z, ms)), L = AOGBandLick._t.LK;
    for (let i = 0; i < 30 && !BP.on; i++) await wait(100);
    const seen = e => { const q = e.getBoundingClientRect(); return q.width > 0 && q.top >= 0 && q.bottom <= innerHeight && q.left >= 0 && q.right <= innerWidth; };
    const inPv = $("bandLicks").parentNode === $("playView"), shown = seen($("lkSel")) && seen($("lkPlay")), hidden = !$("lkFit").offsetParent && !$("lkRec").offsetParent;
    $("lkPlay").click(); let lit = 0; for (let i = 0; i < 20; i++) { await wait(100); lit = Math.max(lit, document.querySelectorAll("#bpMain .lk").length); }
    const on = L.on; $("lkPlay").click();
    return { bp: BP.on, inPv, shown, hidden, on, lit };
  });
  ok(r.bp && r.inPv && r.shown && r.hidden && r.on && r.lit > 0, `iPhone sideways: the keys fill the screen and the licks come along as one row (the menu and Play), and a lick plays lit there ${JSON.stringify(r)}`);
  await ctx.close();
}

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] }); const errs = [];
  if (process.env.BANDLICKS_SIDEWAYS) { await sideways(b, errs); ok(errs.length === 0, "no page errors " + errs.slice(0, 5).join(" | ")); console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0); }
  if (!process.env.BANDLICKS_NUMBERS) await sideways(b, errs);
  if (!process.env.BANDLICKS_DEVICES) await numbers(b, errs);
  if (!process.env.BANDLICKS_NUMBERS) await Promise.all([["iPhone", { width: 390, height: 844 }], ["iPad", { width: 820, height: 1180 }], ["iPad sideways", { width: 1180, height: 820 }]].map(([nm, vw]) => device(b, nm, vw, errs)));
  ok(errs.length === 0, "no page errors " + errs.slice(0, 5).join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + (e.stack || e.message)); process.exit(1); });
