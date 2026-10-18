/* AOG-SOLO-GTRLICKS-V1 (2026-10-18) — Jimmy: "Can we have around the same amount for guitar licks as well?" The Guitar's
   Solo mode has 122 licks in 19 groups: the first 57 (aog-solo.js, unchanged) and 65 more (aog-guitar-licks.js, loaded the
   first time Solo opens on the Guitar), written against chords like the bass's. Inside the Studio, in the Guitar room:
   0 · by numbers, every new lick in all 24 keys (twelve major, twelve minor): every note on the six strings (E2 to the
       15th fret of the high E string) and in its five-fret hand position; the notes held at once within four frets; it
       plays the note written (a bend starts a half or whole step below it and reaches it); beats 1 and 3 land on the
       chord's own notes (every note of a double-stop); every other note is the key's or the chord's, or passes by a half
       or whole step on purpose; a bend starts on the key's note, the chord's or a blue note; it ends on its chord's root;
       the same shape in every key. The first 57 are as they were (the same notes, the same groups). Between them the
       new licks use every way the guitar plays: bends that come back down, slides, hammer-ons, pull-offs, vibrato, pinch
       squeals, taps, double-stops, muted rakes, tremolo picking, muted hits. Rendered offline, every lick, old and new
       (A minor, the lead sound): no clicks where notes stop or slide, never over full scale, never silent
   on an iPhone, an iPad and an iPad sideways, at once:
   1 · the lick menu has every group (19; the first eight with 7 to 9 licks, the new ones 5 or 6), in English and in
       Spanish ("Frases para probar", "Frase", "▶ Tocar esta frase"), a line for each lick in both
   2 · ▶ Play this lick sits right under the neck; pressed from the foot of the page, the neck is in sight as it plays
   3 · every lick, old and new, plays: every note in range, each lit on the neck in turn (on a phone the four frets in
       view follow the lick), and it ends by itself
   4 · Stop stops it at once; it follows a key change while it plays, and minor and major; Lick speed changes its length;
       with the band, the band plays the lick's chords; afterwards no timer or frame callback from Solo; no page errors.
   Ports 9440 (the pages). GUITARLICKS_QUICK=1 plays every sixth lick (a quick look while working). */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const path = require("path"), PORT = 9440, srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const GROUPS_EN = ["Blues", "Rock", "Metal", "Shred and tapping", "Funk and soul", "Country", "Jazz and fusion", "Slow and singing",
  "Reggae and ska", "Motown and soul", "Latin", "Gospel", "Punk", "Pop", "Neo-soul", "Afrobeat and highlife", "Surf", "Slide and Delta blues", "Fills and turnarounds"];
const GROUPS_ES = ["Blues", "Rock", "Metal", "Velocidad y tapping", "Funk y soul", "Country", "Jazz y fusión", "Lentas y cantadas",
  "Reggae y ska", "Motown y soul", "Latino", "Gospel", "Punk", "Pop", "Neo-soul", "Afrobeat y highlife", "Surf", "Slide y blues del Delta", "Rellenos y vueltas"];
const TOTAL = 122, NEW = 65, OLD = 57;
/* the first 57 licks as they were before the new ones came (a fingerprint of their notes and of the first eight groups) */
const OLD_PRINT = "57|8|13ajyn5";
/* every timer and frame callback, with where it came from (as silent/rest counts them) */
const COUNT = () => { window.__calls = []; const si = window.setInterval, st = window.setTimeout, raf = window.requestAnimationFrame;
  const tag = k => { const s = (new Error().stack || "").split("\n").slice(2, 6).join(" "); return () => { if (window.__calls.length < 4000) window.__calls.push(k + " " + s); }; };
  window.setInterval = (f, ...a) => { const t = tag("interval"); return si(() => { t(); typeof f === "function" && f(); }, ...a); };
  window.setTimeout = (f, ...a) => { const t = tag("timeout"); return st(() => { t(); typeof f === "function" && f(); }, ...a); };
  window.requestAnimationFrame = f => { const t = tag("frame"); return raf(x => { t(); f(x); }); }; };

async function openGuitar(b, vw, errs, nm) {
  const ctx = await b.newContext({ viewport: vw, isMobile: true, hasTouch: true, serviceWorkers: "block" });
  await ctx.addInitScript(COUNT);
  ctx.on("page", pg => pg.on("pageerror", e => errs.push(nm + ": " + e.message)));
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  const p = await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#guitar`);
  await p.waitForFunction(() => [...document.querySelectorAll("iframe")].some(f => { try { return f.contentDocument && f.contentDocument.getElementById("neckBox") && f.contentDocument.querySelector('[data-so-mode="solo"]') && f.contentWindow.AOGSolo; } catch (e) { return false; } }), null, { timeout: 60000 });
  const f = p.frames().find(x => /music-guitar/.test(x.url()));
  const before = await f.evaluate(() => ({ lib: !!window.AOGGuitarLicks, script: !!document.querySelector('script[src*="aog-guitar-licks"]'), menu: document.querySelectorAll("#soLickSel option").length }));
  await f.evaluate(() => { try { localStorage.removeItem("aog.guitar.solo.v1"); } catch (e) {} });
  await f.evaluate(() => { if (S.lang !== "en") document.getElementById("langBtn").click(); document.querySelector('[data-so-mode="solo"]').click(); });
  await f.waitForFunction(() => AOGSolo._t.GLK.st === "ready" && document.querySelectorAll("#soLickSel option").length > 100, null, { timeout: 20000 });
  return { ctx, p, f, before };
}

/* ── 0 · the numbers, in the page (its own tuning and the library's words for nothing: the rules are written out here) ── */
const NUMBERS = () => {
  const L = AOGGuitarLicks, T = TUNING, MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10], top = T[T.length - 1] + MAXF;
  const QT = { maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6], dom7: [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], m7b5: [0, 3, 6, 10] };
  const out = { n: 0, notes: 0, bad: [], strong: 0, passing: 0, bends: 0, lo: 99, hi: 0, held: 0, kinds: {} };
  const kind = k => { out.kinds[k] = (out.kinds[k] || 0) + 1; };
  L.ORDER.forEach(id => {
    const ref = {};
    for (let key = 0; key < 12; key++) for (const minor of [false, true]) {
      const C = L.compile(L.LICKS[id], { key, minor, tuning: T, maxf: MAXF }); out.n++;
      const fail = m => { if (out.bad.length < 30) out.bad.push(`${id} in ${key}${minor ? "m" : ""}: ${m}`); };
      if (!C) { fail("does not fit on the neck"); continue; }
      const SC = minor ? MIN : MAJ, win = f => (f >= C.w && f <= C.w + 4) || (f === 0 && C.w <= 2), pcOf = m => ((m - key) % 12 + 12) % 12;
      const toks = {};
      C.notes.forEach((n, i) => {
        out.notes++;
        const end = n.sl ? n.sl[0] : n.f, fret = n.sl && n.sl[1] === 0 ? end : n.f, played = T[n.s] + fret, bend = n.b && n.b[0] >= 1 ? n.b[0] : 0;
        out.lo = Math.min(out.lo, T[n.s] + n.f, T[n.s] + end); out.hi = Math.max(out.hi, n.tm, T[n.s] + end);
        if (!(n.s >= 0 && n.s < 6 && T[n.s] + Math.min(n.f, end) >= T[0] && n.tm <= top && n.f <= MAXF && end <= MAXF && n.f >= 0)) fail(`note ${i} is off the six strings`);
        if (!win(n.f) || !win(end)) fail(`note ${i} is outside the hand position (frets ${C.w} to ${C.w + 4})`);
        if (!(n.sl && n.sl[1] > 0) && played !== n.fm) fail(`note ${i} is fretted at ${played}, written ${n.fm}`);
        if (n.fm + bend !== n.tm) fail(`note ${i} reaches ${n.fm + bend}, written ${n.tm}`);
        if (n.k === "g") { kind(n.rake ? "rake" : "muted"); return; }
        if (n.b) { kind(n.b.length > 3 ? "bend and release" : n.b[0] < 1 ? "curl" : "bend"); out.bends++; }
        if (n.sl) kind("slide"); if (n.k === "h") kind(n.sl ? "slide" : "hammer-on"); if (n.k === "o") kind("pull-off"); if (n.k === "t") kind("tap");
        if (n.v != null) kind("vibrato"); if (n.q) kind("pinch");
        (toks[n.tok] = toks[n.tok] || []).push(n);
        const ch = C.chords.find(c => n.tb >= c.t0 - 1e-6 && n.tb < c.t1 - 1e-6) || C.chords[C.chords.length - 1];
        const pc = pcOf(n.tm), tones = QT[ch.q].map(x => (ch.root + x) % 12), strong = Math.abs(n.tb / 2 - Math.round(n.tb / 2)) < 1e-6;
        if (strong) { out.strong++; if (tones.indexOf(pc) < 0) fail(`beat ${n.tb + 1}: not a note of the chord`); }
        if (bend) { const sp = pcOf(n.fm); if (SC.indexOf(sp) < 0 && tones.indexOf(sp) < 0 && [3, 6, 10].indexOf(sp) < 0) fail(`note ${i} bends from outside the key`); }
        if (SC.indexOf(pc) < 0 && tones.indexOf(pc) < 0) { out.passing++;
          const after = C.notes.filter(x => x.tok > n.tok && x.k !== "g"), nt = after.length ? after[0].tok : -1, near = after.filter(x => x.tok === nt);
          if (strong || !near.some(x => Math.abs(x.fm - n.tm) <= 2 || Math.abs(x.tm - n.tm) <= 2)) fail(`note ${i} is outside the key and does not pass by step`); }
      });
      Object.values(toks).forEach(g => { const at = {}; g.forEach(n => { (at[n.tb.toFixed(4)] = at[n.tb.toFixed(4)] || []).push(n); });
        Object.values(at).forEach(h => { if (h.length < 2) return; out.held++; kind(h.length > 2 ? "chord" : "double-stop");
          const fr = h.map(n => n.f).filter(f => f > 0); if (new Set(h.map(n => n.s)).size !== h.length) fail("two notes at once on one string");
          if (fr.length > 1 && Math.max(...fr) - Math.min(...fr) > 3) fail("notes held at once more than four frets apart"); }); });
      const real = C.notes.filter(n => n.k !== "g"), lt = real[real.length - 1].tok, lc = C.chords[C.chords.length - 1];
      if (!real.filter(n => n.tok === lt).some(n => pcOf(n.tm) === lc.root % 12)) fail("does not end on its chord's root");
      if (Math.abs(C.beats - C.chordBeats) > 1e-6) fail("the notes and the chords are not the same length");
      const shape = C.notes.filter(n => !n.rake).map(n => pcOf(n.tm)).join(",");   /* a rake's muted strings are wherever the hand is */
      const m = minor ? "min" : "maj"; if (ref[m] == null) ref[m] = shape; else if (ref[m] !== shape) fail("not the same shape as in C");
    }
    /* tremolo: the same note picked again and again, eight to a beat */
    const C = L.compile(L.LICKS[id], { key: 9, minor: true, tuning: T, maxf: MAXF });
    if (C && C.notes.some((n, i) => i > 6 && C.notes.slice(i - 7, i + 1).every(x => x.tok === n.tok && x.s === n.s && x.f === n.f))) kind("tremolo");
  });
  /* the first licks, as they were */
  const h = s => { let x = 5381; for (let i = 0; i < s.length; i++) x = ((x * 33) ^ s.charCodeAt(i)) >>> 0; return x.toString(36); };
  const old = AOGSolo._t.LICKS, og = AOGSolo._t.LICK_GROUPS;
  out.oldPrint = Object.keys(old).length + "|" + og.length + "|" + h(JSON.stringify(old) + JSON.stringify(og));
  return out;
};
/* offline: the lick's sound, its peak, and its worst click (energy above 8 kHz in 1 ms windows, 15 dB over every window in
   the 70 ms around it; the first few ms of each note, its own attack, left out), as basslicks.js and pianosets.js measure it */
const RENDER = async (ids) => {
  const hp = (x, fc, sr) => { const w0 = 2 * Math.PI * fc / sr, al = Math.sin(w0) / (2 * 0.7071), cs = Math.cos(w0), a0 = 1 + al;
    const b0 = (1 + cs) / 2 / a0, b1 = -(1 + cs) / a0, b2 = (1 + cs) / 2 / a0, a1 = -2 * cs / a0, a2 = (1 - al) / a0, y = new Float32Array(x.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = x[i], o = b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o; } return y; };
  const out = [];
  for (const id of ids) {
    const r = await AOGSolo._t.renderLick(id, { bpm: 110 }); if (!r) { out.push({ id, none: true }); continue; }
    const sr = r.sr, x = r.buf.getChannelData(0), h = hp(x, 8000, sr), W = Math.round(0.001 * sr), n = Math.floor(x.length / W), e = new Float64Array(n);
    let pk = 0, rms = 0; for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > pk) pk = a; rms += x[i] * x[i]; } rms = Math.sqrt(rms / x.length);
    for (let k = 0; k < n; k++) { let s = 0; for (let i = k * W; i < (k + 1) * W; i++) s += h[i] * h[i]; e[k] = s / W; }
    const skip = new Uint8Array(n); r.starts.forEach(t => { const a = Math.floor((t - 0.003) * 1000), z = Math.ceil((t + 0.012) * 1000); for (let k = Math.max(0, a); k < Math.min(n, z); k++) skip[k] = 1; });
    const floor = Math.pow(pk * Math.pow(10, -75 / 20), 2); let worst = 0, at = -1;
    for (let k = 0; k < n; k++) { if (skip[k]) continue; let mx = 0;
      for (let j = Math.max(0, k - 35); j < Math.min(n, k + 36); j++) if (Math.abs(j - k) > 3 && e[j] > mx) mx = e[j];
      const q = (e[k] + floor) / (mx + floor); if (q > worst) { worst = q; at = k / 1000; } }
    out.push({ id, pk: +pk.toFixed(3), rms: +rms.toFixed(4), db: +(10 * Math.log10(worst || 1)).toFixed(1), at: +at.toFixed(3), stops: r.stops.length });
  }
  return out;
};

async function numbers(b, errs) {
  const { ctx, f, before } = await openGuitar(b, { width: 390, height: 844 }, errs, "numbers");
  ok(!before.lib && !before.script && before.menu === OLD, `before Solo opens, the new licks' file is not loaded (the menu has the first ${before.menu})`);
  const r = await f.evaluate(NUMBERS);
  ok(r.n === NEW * 24 && r.bad.length === 0, `by numbers: ${r.n / 24} new licks in 24 keys each, ${r.notes} notes (MIDI ${r.lo} to ${r.hi}); on beats 1 and 3, ${r.strong} notes all in the chord; ${r.bends} bends from the key's notes; ${r.held} double-stops and chords within four frets; ${r.passing} passing notes, each by step ${r.bad.slice(0, 6).join(" | ")}`);
  const want = ["bend", "bend and release", "slide", "hammer-on", "pull-off", "vibrato", "pinch", "tap", "double-stop", "chord", "rake", "tremolo", "muted"];
  ok(want.every(k => r.kinds[k] > 0), `every way to play: ${want.map(k => k + " " + (r.kinds[k] || 0)).join(", ")}`);
  ok(r.oldPrint === OLD_PRINT, `the first ${OLD} licks and their eight groups are as they were (${r.oldPrint})`);
  /* the recorded guitar in before rendering */
  await f.waitForFunction(() => { const id = recOf(S.sound); return !id || (REAL.sets[id] && /ready|failed/.test(REAL.sets[id].state)); }, null, { timeout: 30000 }).catch(() => {});
  const ids = await f.evaluate(() => AOGSolo._t.lickGroups().reduce((a, g) => a.concat(g[1]), []));
  await f.evaluate(() => { S.key = 9; S.minor = true; });
  const snd = await f.evaluate(() => S.sound);
  const t0 = Date.now(), all = await f.evaluate(RENDER, ids), ms = Date.now() - t0;
  const loud = all.filter(x => x.pk >= 1 || x.rms < 0.004 || x.none), clicky = all.filter(x => x.db > 15);
  ok(all.length === TOTAL && !loud.length && !clicky.length, `rendered in A minor on the ${snd} sound, every lick old and new (${(ms / 1000).toFixed(0)} s): peaks ${Math.min(...all.map(x => x.pk))} to ${Math.max(...all.map(x => x.pk))}, no clicks (worst ${Math.max(...all.map(x => x.db))} dB over its neighbours) ${loud.concat(clicky).slice(0, 5).map(x => JSON.stringify(x)).join(" ")}`);
  await ctx.close();
}

async function device(b, nm, vw, errs) {
  const { ctx, p, f } = await openGuitar(b, vw, errs, nm);
  /* 1 · the menu, in English */
  const en = await f.evaluate(() => ({ groups: [...document.querySelectorAll("#soLickSel optgroup")].map(g => [g.label, g.querySelectorAll("option").length]),
    ids: [...document.querySelectorAll("#soLickSel option")].map(o => o.value), names: [...document.querySelectorAll("#soLickSel option")].map(o => o.textContent),
    h: document.querySelector('.so-licks [data-so="lickH"]').textContent, lab: document.querySelector('.so-licks [data-so="lickLab"]').textContent,
    btn: document.getElementById("soLickBtn").textContent, line: document.getElementById("soLickLine").textContent, sound: S.sound, n: NECK.n }));
  ok(JSON.stringify(en.groups.map(g => g[0])) === JSON.stringify(GROUPS_EN) && en.groups.slice(0, 8).every(g => g[1] >= 6 && g[1] <= 9) && en.groups.slice(8).every(g => g[1] >= 5 && g[1] <= 9)
    && en.ids.length === TOTAL && new Set(en.ids).size === TOTAL && new Set(en.names).size === TOTAL && en.names.every(x => x && !/^lk_/.test(x)),
    `${nm}: ${en.ids.length} licks in ${en.groups.length} groups: ${en.groups.map(g => g[0] + " " + g[1]).join(", ")}`);
  ok(en.h === "Licks to try" && en.lab === "Lick" && en.btn === "▶ Play this lick" && en.line.length > 20 && !/^ld_/.test(en.line), `${nm}: "${en.h}", "${en.lab}", "${en.btn}"; "${en.line}" (${en.sound}; the neck shows ${en.n} frets)`);
  /* 2 · right under the neck; the neck in sight as it plays */
  const near = await f.evaluate(async () => {
    const nb = document.getElementById("neckBox"), btn = document.getElementById("soLickBtn"), lk = document.querySelector(".so-licks.so-near");
    const sel = document.getElementById("soLickSel"); sel.value = "g_rgline"; sel.dispatchEvent(new Event("change", { bubbles: true }));
    const gap = btn.getBoundingClientRect().top - nb.getBoundingClientRect().bottom, after = nb.nextElementSibling === lk;
    scrollTo(0, document.documentElement.scrollHeight); await new Promise(r => setTimeout(r, 100));
    btn.click(); await new Promise(r => setTimeout(r, 300));
    const n = nb.getBoundingClientRect(), seen = n.top >= -1 && n.bottom <= innerHeight + 1, playing = AOGSolo._t.LICK.on && btn.getAttribute("aria-pressed") === "true";
    btn.click(); return { gap: Math.round(gap), after, seen, playing, stopped: !AOGSolo._t.LICK.on };
  });
  ok(near.after && near.gap >= 0 && near.gap <= 200, `${nm}: ▶ Play this lick sits right under the neck (${near.gap} px below it)`);
  ok(near.seen && near.playing && near.stopped, `${nm}: pressed from the foot of the page, the lick plays with the neck in sight`);
  /* 3 · every lick plays, every note in range and lit in turn, and ends */
  await f.evaluate(() => { S.key = 9; S.minor = true; S.bpm = 132; buildNeck(); });
  const bad = [], t0 = Date.now(); let notes = 0, lit = 0, moves = 0;
  const play = process.env.GUITARLICKS_QUICK ? en.ids.filter((id, i) => i % 6 === 0) : en.ids;
  for (const id of play) {
    const r = await f.evaluate(async (id) => {
      const sel = document.getElementById("soLickSel"); sel.value = id; sel.dispatchEvent(new Event("change", { bubbles: true }));
      document.getElementById("soLickBtn").click();
      const L = AOGSolo._t.LICK; if (!L.on || L.id !== id) return { id, started: false };
      const cells = L.lights.map(x => ({ s: x.s, f: x.n.f, end: x.n.sl ? x.n.sl[0] : x.n.f, m: TUNING[x.s] + x.n.f, me: TUNING[x.s] + (x.n.sl ? x.n.sl[0] : x.n.f) }));
      const moves = L.view ? L.view.ev.length : 0;
      const lim = performance.now() + (L.end - ac.currentTime) * 1000 + 3000;
      while (L.on && performance.now() < lim) await new Promise(r => setTimeout(r, 120));
      const seen = new Set(L.seen);
      const unlit = cells.filter(n => !seen.has(n.s + ":" + n.f) && !seen.has(n.s + ":" + n.end));
      const out = cells.filter(n => !(n.m >= 40 && n.me >= 40 && n.m <= 79 && n.me <= 79 && n.f >= 0 && n.f <= 15 && n.end <= 15));
      return { id, started: true, ended: !L.on && document.getElementById("soLickBtn").getAttribute("aria-pressed") === "false", n: cells.length, unlit: unlit.length, what: unlit.slice(0, 3), out: out.length, moves };
    }, id);
    notes += r.n || 0; lit += (r.n || 0) - (r.unlit || 0); moves += r.moves || 0;
    if (!r.started || !r.ended || r.out || r.unlit) bad.push(JSON.stringify(r));
  }
  ok(bad.length === 0, `${nm}: ${play.length === en.ids.length ? "all " : ""}${play.length} licks played in A minor (${((Date.now() - t0) / 1000).toFixed(0)} s): ${notes} notes, every one on the six strings, ${lit} lit on the neck in turn (the frets in view moved ${moves} times); each ended by itself ${bad.slice(0, 4).join(" ")}`);
  /* 4 · Stop */
  const st = await f.evaluate(async () => {
    const sel = document.getElementById("soLickSel"), btn = document.getElementById("soLickBtn"); sel.value = "g_sftrem"; sel.dispatchEvent(new Event("change", { bubbles: true }));
    btn.click(); await new Promise(r => setTimeout(r, 700)); const vs = AOGSolo._t.LICK.voices.map(v => v.lv), was = AOGSolo._t.LICK.on;
    btn.click(); await new Promise(r => setTimeout(r, 120));
    return { was, on: AOGSolo._t.LICK.on, stopped: vs.every(lv => lv.vc.stopped), lit: document.querySelectorAll("#neck #soLick .so-now").length, btn: btn.textContent, leads: AOGSolo._t.leadsNow().length };
  });
  ok(st.was && !st.on && st.stopped && st.lit === 0 && st.leads === 0 && st.btn === "▶ Play this lick", `${nm}: ■ Stop stops it at once: ${JSON.stringify(st)}`);
  /* the key and the mood: a key change while it plays starts it again in the new key; major and minor */
  const km = await f.evaluate(async () => {
    const sel = document.getElementById("soLickSel"), btn = document.getElementById("soLickBtn"), ks = document.getElementById("keySel"), wait = ms => new Promise(r => setTimeout(r, ms));
    document.getElementById("minBtn").click(); ks.value = "9"; ks.onchange(); sel.value = "g_slhymn"; sel.dispatchEvent(new Event("change", { bubbles: true }));
    btn.click(); await wait(250); const a = AOGSolo._t.LICK.log.map(n => n.tm % 12);
    ks.value = "2"; ks.onchange(); await wait(350); const L = AOGSolo._t.LICK, d = { on: L.on, mk: L.mk, pcs: L.log.map(n => n.tm % 12) }; btn.click();
    document.getElementById("majBtn").click(); await wait(50); btn.click(); await wait(250); const maj = AOGSolo._t.LICK.log.map(n => n.tm % 12); btn.click();
    sel.value = "blues"; sel.dispatchEvent(new Event("change", { bubbles: true })); btn.click(); await wait(250); const old = AOGSolo._t.LICK.log.map(n => n.m % 12); btn.click();
    ks.value = "9"; ks.onchange(); document.getElementById("minBtn").click();
    return { a, d, maj, old };
  });
  ok(km.a[0] === 0 && km.a[2] === 9 && km.d.on && km.d.mk === "2m" && km.d.pcs[0] === 5 && km.d.pcs.every((x, i) => x === (km.a[i] + 5) % 12) && km.maj[0] === 6 && km.maj[2] === 2 && km.old.length > 3,
    `${nm}: it follows the key: A minor (${km.a.slice(0, 3)}), to D minor while it plays (${km.d.pcs.slice(0, 3)}), D major (${km.maj.slice(0, 3)}); a first lick in D major too (${km.old.slice(0, 3)})`);
  /* Lick speed */
  const sp = await f.evaluate(async () => {
    const sel = document.getElementById("soLickSel"), btn = document.getElementById("soLickBtn"), r = document.getElementById("soLickSpd"), wait = ms => new Promise(z => setTimeout(z, ms));
    const len = async (v) => { r.value = String(v); r.dispatchEvent(new Event("input", { bubbles: true })); sel.value = "g_pkriff"; sel.dispatchEvent(new Event("change", { bubbles: true }));
      btn.click(); await wait(60); const L = AOGSolo._t.LICK, o = { len: L.end - L.t0, out: document.getElementById("soLickSpdOut").textContent }; btn.click(); return o; };
    const a = await len(100), h = await len(50), q = await len(25); await len(100); return { a, h, q };
  });
  ok(Math.abs(sp.h.len / sp.a.len - 2) < 0.08 && Math.abs(sp.q.len / sp.a.len - 4) < 0.15 && sp.h.out === "50% speed", `${nm}: Lick speed: full ${sp.a.len.toFixed(2)} s, half ${sp.h.len.toFixed(2)} s ("${sp.h.out}"), a quarter ${sp.q.len.toFixed(2)} s`);
  /* with the band: the band plays the lick's chords while it plays */
  const bd = await f.evaluate(async () => {
    const sel = document.getElementById("soLickSel"), btn = document.getElementById("soLickBtn"), wait = ms => new Promise(z => setTimeout(z, ms)), B = AOGSolo._t.BAND;
    document.getElementById("soBand").click(); await wait(400); sel.value = "g_ltbossa"; sel.dispatchEvent(new Event("change", { bubbles: true })); btn.click();
    const L = AOGSolo._t.LICK, k0 = Math.round((L.t0 - B.t0) / B.barSec), over = JSON.parse(JSON.stringify(B.over || {})), onBar = Math.abs((L.t0 - B.t0) / B.barSec - k0) < 1e-3;
    await wait(B.barSec * 2.4 * 1000); const bars = {};
    B.log.filter(e => e.p === "gtr").forEach(e => { const k = Math.floor((e.t - B.t0 + 0.02) / B.barSec); (bars[k] = bars[k] || new Set()).add(e.m % 12); });
    const want = [0, 1].map(j => { const c = over[k0 + j]; return c ? Q[c.q].map(x => (S.key + c.off + x) % 12) : null; });
    const got = [0, 1].map(j => [...(bars[k0 + j] || [])]);
    btn.click(); document.getElementById("soBand").click(); await wait(100);
    return { onBar, chords: [0, 1].map(j => over[k0 + j] && chordName(over[k0 + j])), fit: got.map((g, j) => g.length > 0 && want[j] && g.every(x => want[j].indexOf(x) >= 0)), got, over: !!B.over, band: B.on };
  });
  ok(bd.onBar && bd.fit.every(Boolean) && !bd.over && !bd.band, `${nm}: with the band, the lick starts on a bar line and the band plays its chords (${bd.chords.join(", ")}), then lets them go ${JSON.stringify(bd.got)}`);
  /* Spanish */
  await f.evaluate(() => document.getElementById("langBtn").click());
  const es = await f.evaluate(() => ({ groups: [...document.querySelectorAll("#soLickSel optgroup")].map(g => g.label), names: [...document.querySelectorAll("#soLickSel option")].map(o => o.textContent),
    h: document.querySelector('.so-licks [data-so="lickH"]').textContent, lab: document.querySelector('.so-licks [data-so="lickLab"]').textContent, btn: document.getElementById("soLickBtn").textContent,
    line: document.getElementById("soLickLine").textContent, all: AOGGuitarLicks.ORDER.every(id => { const n = AOGGuitarLicks.WORDS["lk_" + id], d = AOGGuitarLicks.WORDS["ld_" + id]; return n && d && n.es && d.es && n.en && d.en && d.es !== d.en; }) }));
  await f.evaluate(() => document.getElementById("langBtn").click());
  ok(JSON.stringify(es.groups) === JSON.stringify(GROUPS_ES) && es.h === "Frases para probar" && es.lab === "Frase" && es.btn === "▶ Tocar esta frase" && es.all && es.names.length === TOTAL && es.names.filter((x, i) => x !== en.names[i]).length > 90,
    `${nm}: Spanish: "${es.h}", "${es.lab}", "${es.btn}"; ${es.groups.join(", ")}; "${es.line}"`);
  /* afterwards it rests: no timer or frame callback from Solo mode */
  const rest = await f.evaluate(async () => { await new Promise(r => setTimeout(r, 2500)); window.__calls = []; await new Promise(r => setTimeout(r, 3000));
    const mine = window.__calls.filter(c => /aog-solo\.js|aog-guitar-licks\.js/.test(c));
    return { mine: mine.length, what: mine.slice(0, 2), all: window.__calls.length, on: AOGSolo._t.LICK.on }; });
  ok(rest.mine === 0 && !rest.on, `${nm}: stopped, Solo rests: ${rest.mine} timer or frame callbacks from it in 3 s (${rest.all} in the room in all) ${rest.what.join(" | ")}`);
  await ctx.close();
}

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] }); const errs = [];
  if (!process.env.GUITARLICKS_DEVICES) await numbers(b, errs);
  if (!process.env.GUITARLICKS_NUMBERS) await Promise.all([["iPhone", { width: 390, height: 844 }], ["iPad", { width: 820, height: 1180 }], ["iPad sideways", { width: 1180, height: 820 }]].map(([nm, vw]) => device(b, nm, vw, errs)));
  ok(errs.length === 0, "no page errors " + errs.slice(0, 5).join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + (e.stack || e.message)); process.exit(1); });
