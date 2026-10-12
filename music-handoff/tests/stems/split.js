/* AOG-STEMS-V1 — Split a song into its parts (aog-stems.js). Jimmy: "Split a song into its parts. Drums, bass, voice and
   the rest come apart right on the device." … "Being able to take the instruments / vocals apart will be a GAME CHANGER in
   the turn table world!"
   A · the splitter (port 9300): songs made here from known parts (drums, bass, a lead voice, a pad; stereo and one
       channel): how close each part comes (SDR, dB, against leaving the song as it is), with the real listener's notes
       and with exact ones; the four always add back to the song; Stop; the same split in slices where no Worker can
       start; kept and found again; the starter crate (drums only in bars 1–4); Spanish words; the time it takes.
   B · the Turntables (port 9301): nothing loads before Split into parts; the calm progress words; the four part
       buttons; lockstep in the deck's own engine (each part alone, played with a scratch, a speed change, a loop, a
       cue jump and reverse, is that part played as the record; the parts at full are the record, exactly; keylock);
       a mute glides (no click); Only, holding a part, Voice only, No voice, the levels; chops from the parts you hear
       reach the Drum Machine; the split is kept (next time at once, nothing split again); Stop; Spanish; an iPhone;
       the Studio's hush; idle (no Worker, no timers of its own); no page errors.
   C · Learn a song (port 9302) and D · the Mixing Desk (port 9302) — see below. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const P1 = 9300, P2 = 9301, P3 = 9302;
const srv = [P1, P2, P3].map(p => require("../srv.js")(p)), U = p => "http://localhost:" + p + "/";
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const SONG = fs.readFileSync(path.join(__dirname, "song.js"), "utf8");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
const ONLY = (process.env.STEMS_ONLY || "ABCD").split("");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
/* every Worker made, and whether it was let go; timers and frames counted */
const SPY = `(() => {
  const W = window.Worker; window.__workers = [];
  if (W) window.Worker = function (u, o) { const w = new W(u, o), r = { url: String(u), done: false }; window.__workers.push(r); const t = w.terminate.bind(w); w.terminate = () => { r.done = true; t(); }; return w; };
  window.__n = { to: 0, iv: 0, raf: 0 };
  const st = window.setTimeout, si = window.setInterval, ra = window.requestAnimationFrame;
  window.setTimeout = function () { window.__n.to++; return st.apply(window, arguments); };
  window.setInterval = function () { window.__n.iv++; return si.apply(window, arguments); };
  window.requestAnimationFrame = function (f) { window.__n.raf++; if (window.__who) window.__who[(new Error().stack || "").split("\\n").slice(2, 4).join(" | ")] = 1; return ra.call(window, f); };
  let real; Object.defineProperty(window, "AOGVU", { configurable: true, get() { return real; }, set(v) { if (v && !v.own) v.own = c => { (window.__owned = window.__owned || []).push(c); }; real = v; } });
})();`;
async function routes(ctx) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/__h\.html$/, r => r.fulfill({ contentType: "text/html", body: `<!doctype html><html lang="en"><meta charset="utf-8"><script src="/aog-stems.js"></script><script>${SONG}</script>` }));
  const R = { "drum-machine": "music-pads.html", "the-studio": "the-studio.html", turntables: "music-decks.html" };
  await ctx.route(/\/(drum-machine|the-studio|turntables)(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, R[new URL(r.request().url()).pathname.slice(1)]), contentType: "text/html" }));
}

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* ══ A · the splitter ══ */
  if (ONLY.includes("A")) {
    const c = await b.newContext(); watch(c); await routes(c);
    const p = await c.newPage(); await p.goto(U(P1) + "__h.html");
    ok(await p.evaluate(() => !window.AOGLearn), "A the splitter loads nothing else until a split starts");
    const rows = [];
    /* Jimmy's music: "Rap, hip hop. Classic rock, heavy metal, Experimental music. Pop music, Classical music". Each song is
       built here from known parts; the kind of music is found by itself (Auto). [name, maker, options, what to expect] */
    const SONGS = [["a sung song", "makeSong", { seed: 7 }, "sung", "pop"], ["a sung song at 120", "makeSong", { seed: 11, bpm: 120, key: 2 }, "sung", "pop"], ["a sung song, one channel", "makeSong", { seed: 5, mono: true }, "sung", "pop"],
      ["pop (tuned lead, harmonies, sidechain, synth bass)", "makeSong", { seed: 13, pop: true, bpm: 104 }, "pop", "pop"],
      ["trap (808 glides, rap, double, ad-libs)", "makeRap", { seed: 21 }, "rap", "hiphop"], ["boom-bap", "makeRap", { seed: 33, boom: true }, "rap", "hiphop"],
      ["trap, one channel", "makeRap", { seed: 21, mono: true }, "rapmono", "hiphop"], ["hip hop with a sampled loop", "makeRap", { seed: 35, boom: true, sample: true }, "rap", "hiphop"],
      ["classic rock (guitars left and right, a solo)", "makeRock", { seed: 41 }, "rock", "rock"], ["metal (double kick, chugs, a growl)", "makeRock", { seed: 43, metal: true }, "metal", "rock"],
      ["a solo piano piece", "makeClassical", { seed: 61, piano: true }, "piano", "classical"], ["an orchestra (timpani, low strings)", "makeClassical", { seed: 63 }, "orch", "classical"],
      ["an orchestra with a soprano", "makeClassical", { seed: 65, soprano: true }, "opera", "classical"], ["experimental (drones, noise, glitches, no steady beat)", "makeExperimental", { seed: 77 }, "exp", "experimental"]];
    const f1 = x => x == null ? "—" : x.toFixed(1);
    console.log("     song | kind found | drums | bass | voice | the rest  (dB; in brackets the song as it is)  · energy shares · the line said");
    for (const [name, fn, opt, kind, want] of SONGS) {
      const r = await p.evaluate(async ([fn, o]) => { const t0 = performance.now(), m = await measure(window[fn](o), { lesson: "learn" }); m.wall = performance.now() - t0; return m; }, [fn, opt]);
      rows.push({ name, kind, want, L: "learn", r });
      console.log(`     ${name} | ${r.kind} | ${["drums", "bass", "voice", "other"].map(k => f1(r[k]) + " (" + f1(r[k + "0"]) + ")").join(" | ")} · ${r.share.join(" ")} · "${r.note}" · ${r.ms} ms`);
    }
    const NEED = { sung: { drums: [7, 8], bass: [4, 7], voice: [5, 11], other: [2, 9] }, pop: { drums: [6, 8], bass: [4, 6], voice: [3, 9], other: [2, 10] },
      rap: { drums: [3.5, 8], bass: [6, 5], voice: [6.5, 14], other: [2, 14] }, rapmono: { drums: [3.5, 8], bass: [6, 5], voice: [6.5, 14], other: [0.3, 17] },
      rock: { drums: [5, 8], bass: [4, 7], voice: [1.5, 14], other: [3, 6] }, metal: { drums: [4, -2], bass: [-5, 5], voice: [-1, 13], other: [1.5, 10] },
      orch: { drums: [0.5, 3], bass: [1.5, 3], other: [2.5, 7] }, opera: { drums: [0.5, 3], bass: [1, 3], voice: [0, 9], other: [0.8, 6] } };
    for (const k of ["drums", "bass", "voice", "other"]) {
      const lr = rows.filter(x => NEED[x.kind] && NEED[x.kind][k]), bad = lr.filter(x => !(x.r[k] >= NEED[x.kind][k][0] && x.r[k] - x.r[k + "0"] >= NEED[x.kind][k][1]));
      ok(!bad.length, `A ${k}, with the listener's notes: ` + lr.map(x => x.kind + " " + x.r[k]).join(", ") + " dB" + (bad.length ? " — short: " + bad.map(x => x.name).join(", ") : ""));
    }
    const kinds = rows.map(x => x.r.kind + (x.r.kind === x.want ? "" : "≠" + x.want));
    ok(rows.every(x => x.r.kind === x.want), "A Auto finds the kind of music: " + kinds.join(", "));
    const pn = rows.find(x => x.kind === "piano").r, ex = rows.find(x => x.kind === "exp").r, orch = rows.find(x => x.kind === "orch").r;
    ok(pn.share[0] <= 0.03 && pn.share[2] <= 0.02 && pn.note === "noVoice" && orch.share[2] <= 0.02 && orch.note === "noVoice",
      "A classical: a solo piano leaves Drums and Voice nearly silent (" + pn.share[0] + ", " + pn.share[2] + "), and says \"No voice found in this piece.\"; the orchestra too (voice " + orch.share[2] + ")");
    ok(ex.kind === "experimental" && ex.last.stats.grid === 0 && ex.share[3] >= 0.2 && ex.sumErr < 1e-4 && ex.wall < 30000,
      "A experimental: no drum grid invented, much of it kept in The rest (" + ex.share[3] + "), it adds back, it finishes (" + Math.round(ex.wall) + " ms)");
    ok(rows.filter(x => x.want === "rock").every(x => x.r.note === "guitars" || x.r.note === "noVoice") && rows.filter(x => x.want === "hiphop").every(x => x.r.note === "backing"),
      "A the line after a split says where a part is hard: " + [...new Set(rows.map(x => x.want + ": " + x.r.note))].join(", "));
    /* a kind chosen by hand is used, and said */
    const forced = await p.evaluate(async () => { const s = makeRock({ seed: 41, bars: 3 }); const R = await AOGStems.split(bufOf(s.mix, s.sr), { kind: "classical" }); return { kind: R.kind, auto: R.auto }; });
    ok(forced.kind === "classical" && forced.auto === false, "A a kind chosen by hand is the one used: " + JSON.stringify(forced));
    ok(rows.every(x => x.r.sumErr < 1e-4), "A the four parts add back to the song (largest difference " + Math.max(...rows.map(x => x.r.sumErr)).toExponential(1) + ")");
    ok(rows.every(x => x.r.last.how === "worker"), "A the split runs in a Worker");
    /* the same split where no Worker can start: 12 ms at a time, the very same parts */
    const same = await p.evaluate(async () => { const s = makeSong({ seed: 3, bars: 3 }), buf = bufOf(s.mix, s.sr), L = { bass: s.lesson.bass, melody: s.lesson.melody };
      const a = await AOGStems.split(buf, { lesson: L }); AOGStems.test.noWorker(true);
      let longest = 0, last = performance.now(); const tick = () => { const n = performance.now(); longest = Math.max(longest, n - last); last = n; if (!done) setTimeout(tick, 0); }; let done = false; tick();
      const b2 = await AOGStems.split(buf, { lesson: L }); done = true; AOGStems.test.noWorker(false);
      let d = 0; ["drums", "bass", "voice", "other"].forEach(k => { const x = a[k].getChannelData(1), y = b2[k].getChannelData(1); for (let i = 0; i < x.length; i++) d = Math.max(d, Math.abs(x[i] - y[i])); });
      return { d, how: AOGStems.test.last().how, longest: Math.round(longest) }; });
    ok(same.d === 0 && same.how === "slices" && same.longest <= 60, "A without a Worker: the same parts, in slices (the page's longest wait " + same.longest + " ms): " + JSON.stringify(same));
    /* Stop */
    const stop = await p.evaluate(async () => { const s = makeSong({ seed: 9, bars: 12 }), ctl = new AbortController(), t0 = performance.now(); let at = 0;
      const pr = AOGStems.split(bufOf(s.mix, s.sr), { lesson: s.lesson, signal: ctl.signal, onProgress: (p, k) => { if (k === "split" && p > 0.3 && !at) { at = performance.now(); ctl.abort(); } } });
      try { await pr; return { name: "finished" }; } catch (e) { return { name: e.name, ms: Math.round(performance.now() - at), workers: window.__workers ? 0 : 0 }; } });
    ok(stop.name === "AbortError" && stop.ms < 300, "A Stop ends the split at once: " + JSON.stringify(stop));
    /* kept, and found again with the song (the rest made again from the song) */
    const kept = await p.evaluate(async () => { const s = makeSong({ seed: 4, bars: 2 }), f = songFile(s, "kept.wav");
      const a = await AOGStems.split(f, { lesson: s.lesson }); await AOGStems.keep("t|kept", a);
      const m = await AOGStems.has("t|kept"), k = await AOGStems.kept("t|kept", f), none = await AOGStems.kept("t|none", f);
      let d = 0; ["drums", "bass", "voice", "other"].forEach(n => { for (let c = 0; c < 2; c++) { const x = a[n].getChannelData(c), y = k[n].getChannelData(c); for (let i = 0; i < x.length; i++) d = Math.max(d, Math.abs(x[i] - y[i])); } });
      const raw = await AOGStems.keptParts("t|kept", { sr: 44100, len: a.length }), wrong = await AOGStems.keptParts("t|kept", { sr: 48000 });
      return { meta: m && m.sr === 44100 && m.len === a.length && m.quality === "listen", d, none, raw: !!(raw && raw.d.length === 2 && raw.b.length === a.length), wrong }; });
    ok(kept.meta && kept.d === 0 && kept.none === null && kept.raw && kept.wrong === null, "A kept on the device and found again, exactly: " + JSON.stringify(kept));
    /* the starter crate: bars 1–4 are drums only, bars 5–8 add the bass */
    for (const f of ["01-paper-kites.mp3", "09-blue-lamp.mp3"]) {
      const cr = await p.evaluate(async (f) => { const ab = await (await fetch("/audio/crate/" + f)).arrayBuffer(), bpm = { "01-paper-kites.mp3": 90, "09-blue-lamp.mp3": 120 }[f], bar = 240 / bpm;
        const t0 = performance.now(), R = await AOGStems.split(ab, {}), ms = performance.now() - t0, sr = R.sr;
        const e = (k, a, b) => { const x = R[k].getChannelData(0); let s = 0; for (let i = Math.round(a * sr); i < Math.round(b * sr); i++) s += x[i] * x[i]; return s; };
        const share = (a, b) => { const all = ["drums", "bass", "voice", "other"].map(k => e(k, a, b)), t = all.reduce((x, y) => x + y, 0); return all.map(x => +(x / t).toFixed(3)); };
        return { sec: +(R.length / sr).toFixed(1), ms: Math.round(ms), drumsOnly: share(0.1, 4 * bar - 0.1), withBass: share(4 * bar + 0.1, 8 * bar - 0.1), all: share(8 * bar + 0.1, 16 * bar - 0.1) }; }, f);
      console.log(`     ${f}: ${cr.sec} s split in ${cr.ms} ms; energy shares [drums, bass, voice, the rest]: bars 1–4 ${cr.drumsOnly}, bars 5–8 ${cr.withBass}, bars 9–16 ${cr.all}`);
      ok(cr.drumsOnly[0] >= 0.85 && cr.withBass[1] >= 0.15 && cr.withBass[1] > cr.drumsOnly[1] * 4, "A the crate's " + f + ": bars 1–4 (drums only) are mostly Drums, the bass comes in at bar 5: " + JSON.stringify(cr));
    }
    const w = await p.evaluate(() => ({ en: AOGStems.word("split", "en"), es: AOGStems.word("split", "es"), nes: AOGStems.names.es, stop: AOGStems.word("stopped", "es") }));
    ok(w.en === "Splitting the song…" && w.es === "Separando la canción…" && w.nes.other === "El resto" && w.nes.drums === "Batería" && w.stop === "Detenido. La canción quedó como estaba.", "A the words, in English and Spanish: " + JSON.stringify(w));
    await c.close();
  }

  /* ══ B · the Turntables ══ */
  if (ONLY.includes("B")) {
    const c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c);
    await c.addInitScript(SPY);
    await c.addInitScript(() => { try { localStorage.setItem("aog.decks.bench", "full"); } catch (e) {} });
    let p = await c.newPage(); await p.goto(U(P2) + "music-decks.html"); await p.waitForTimeout(1200);
    await p.addScriptTag({ content: SONG });
    let a = await p.evaluate(() => ({ stems: !!window.AOGStems, learn: !!window.AOGLearn, loaded: performance.getEntriesByType("resource").some(e => /aog-stems|aog-learn/.test(e.name)), workers: window.__workers.length,
      row: document.querySelector('[data-prow="A"]').hidden }));
    ok(!a.stems && !a.learn && !a.loaded && a.workers === 0 && a.row, "B nothing for the parts loads or runs as the Turntables open (no record: no row): " + JSON.stringify(a));
    const put = (deck, seed, name) => p.evaluate(async ([deck, seed, name]) => { const s = makeSong({ seed: seed, bars: 8 }), d = decks.find(x => x.id === deck);
      window.__song = window.__song || {}; window.__song[deck] = s;
      await loadFile(d, songFile(s, name)); await new Promise(r => { const t0 = Date.now(), k = setInterval(() => { if (d.bpm !== -1 || Date.now() - t0 > 8000) { clearInterval(k); r(); } }, 50); }); }, [deck, seed, name]);
    await put("A", 7, "my-song.wav");
    a = await p.evaluate(() => ({ row: document.querySelector('[data-prow="A"]').textContent.trim(), hid: document.querySelector('[data-prow="A"]').hidden, parts: document.querySelectorAll('[data-part="A"]').length, more: document.querySelector('[data-pmore="A"]').hidden, stems: !!window.AOGStems }));
    ok(a.row === "Split into parts" && !a.hid && a.parts === 0 && a.more && !a.stems, "B a record on the deck: one button, Split into parts; still nothing loaded: " + JSON.stringify(a));
    await p.evaluate(() => { window.__lines = []; const el = document.querySelector('[data-pline="A"]'); new MutationObserver(() => { const t = el.textContent; if (t && window.__lines[window.__lines.length - 1] !== t) window.__lines.push(t); }).observe(el, { childList: true, characterData: true, subtree: true }); });
    const t0 = Date.now();
    await p.click('[data-psplit="A"]');
    await p.waitForFunction(() => decks[0].parts.st === "on", null, { timeout: 90000 });
    const ms = Date.now() - t0;
    a = await p.evaluate(() => ({ lines: window.__lines, row: [...document.querySelectorAll('[data-prow="A"] button')].map(x => x.textContent + ":" + x.getAttribute("aria-pressed")).join(" "),
      workers: window.__workers.filter(w => /aog-stems|aog-learn/.test(w.url)).map(w => w.done), last: AOGStems.test.last() }));
    const prog = a.lines.slice(0, -1);
    ok(prog.length >= 3 && prog.every(l => /^(Listening to the record…|Splitting the record…) \d{1,3}%$/.test(l)) && a.lines[a.lines.length - 1] === "The record is in four parts. Tap a part to quiet it.",
      `B the calm progress words (${prog.length} steps, e.g. "${prog[Math.floor(prog.length / 2)]}"), then: "${a.lines[a.lines.length - 1]}"`);
    ok(a.row === "Drums:true Bass:true Voice:true The rest:true Only:false", "B one row: Drums, Bass, Voice, The rest (all playing) and Only: " + a.row);
    ok(a.workers.length === 1 && a.workers.every(Boolean), "B one Worker listens and splits, and it is let go when the split is done: " + JSON.stringify(a.workers));
    console.log(`     the 20.2 s record split in ${ms} ms (listening ${a.last.timing.listen} ms, splitting ${a.last.timing.split} ms)`);

    /* lockstep: the deck's own engine, off line, with the very parts the deck holds */
    const lock = await p.evaluate(async () => {
      const d = decks[0], raw = await AOGStems.keptParts(partsId(d), { sr: d.buf.sampleRate, len: d.buf.length }), sr = d.buf.sampleRate, S = 1 / 32767;
      const L0 = d.buf.getChannelData(0), R0 = d.buf.getChannelData(1), bl = Math.round(60 / 100 * sr);
      const flt = a => { const o = new Float32Array(a.length); for (let i = 0; i < a.length; i++) o[i] = a[i] * S; return o; };
      const moves = { 0: { t: "seek", v: Math.round(2 * sr), park: true }, 1: { t: "motor", on: true, instant: true }, 90: { t: "pitch", v: 1.06 }, 180: { t: "hand", on: true, rate: -1.5 }, 215: { t: "hand", on: true, rate: 2.2 },
        250: { t: "hand", on: false }, 300: { t: "bloop", len: bl, n: 1, b0: 0 }, 430: { t: "loop", on: false }, 440: { t: "qjump", to: Math.round(1 * sr), len: 0 }, 500: { t: "rev", on: true }, 560: { t: "rev", on: false }, 600: { t: "pitch", v: 1 } };
      function render(o) { const c = new AOGVinylCore(sr); c.msg({ t: "buf", L: o.L || L0, R: o.R || R0, sr: sr }); c.msg({ t: "noise", v: 0 }); c.msg({ t: "key", on: !!o.key }); c.msg({ t: "slip", on: false });
        if (o.g) { c.msg({ t: "parts", dL: raw.d[0], dR: raw.d[1] || raw.d[0], b: raw.b, v: raw.v }); c.msg({ t: "pgain", g: o.g, now: true }); }
        const N = 128, B = 680, oL = new Float32Array(N * B), oR = new Float32Array(N * B);
        for (let k = 0; k < B; k++) { if (moves[k]) c.msg(moves[k]); if (o.at && o.at[k]) c.msg(o.at[k]); c.frame = k * N; c.process(oL.subarray(k * N, (k + 1) * N), oR.subarray(k * N, (k + 1) * N), N); if (o.tap) o.tap(k, c); }
        return [oL, oR]; }
      const diff = (x, y) => { let m = 0; for (let c = 0; c < 2; c++) for (let i = 0; i < x[c].length; i++) m = Math.max(m, Math.abs(x[c][i] - y[c][i])); return m; };
      const rms = x => { let s = 0; for (let i = 0; i < x[0].length; i++) s += x[0][i] * x[0][i]; return Math.sqrt(s / x[0].length); };
      const one = k => ({ drums: 0, bass: 0, voice: 0, other: 0, [k]: 1 });
      const rec = render({}), full = render({ g: { drums: 1, bass: 1, voice: 1, other: 1 } });
      /* each part alone, against that part put on the deck as the record itself, the same moves */
      const dF = flt(raw.d[0]), dR = raw.d[1] ? flt(raw.d[1]) : dF, bF = flt(raw.b), vF = flt(raw.v);
      const asRec = { drums: [dF, dR], bass: [bF, bF], voice: [vF, vF] }, out = { rec: rms(rec), full: diff(full, rec), alone: {}, rmsK: {} };
      for (const k of ["drums", "bass", "voice"]) { const x = render({ g: one(k) }), y = render({ L: asRec[k][0], R: asRec[k][1] }); out.alone[k] = diff(x, y); out.rmsK[k] = +rms(x).toFixed(4); }
      /* the rest alone is the record less the three */
      const oth = [new Float32Array(L0.length), new Float32Array(L0.length)]; for (let i = 0; i < L0.length; i++) { oth[0][i] = L0[i] - dF[i] - bF[i] - vF[i]; oth[1][i] = R0[i] - dR[i] - bF[i] - vF[i]; }
      out.alone.other = diff(render({ g: one("other") }), render({ L: oth[0], R: oth[1] }));
      /* KEY on: the four alone add back to the record (the grains are cut at one place for all four) */
      const kr = render({ key: true }), ks = ["drums", "bass", "voice", "other"].map(k => render({ key: true, g: one(k) }));
      const sum = [new Float32Array(kr[0].length), new Float32Array(kr[0].length)]; ks.forEach(x => { for (let c = 0; c < 2; c++) for (let i = 0; i < x[c].length; i++) sum[c][i] += x[c][i]; });
      out.key = diff(sum, kr); out.keyFull = diff(render({ key: true, g: { drums: 1, bass: 1, voice: 1, other: 1 } }), kr);
      /* a mute glides: the drums go quiet over a few ms, never in one step */
      const pcs = []; const muted = render({ g: { drums: 1, bass: 1, voice: 1, other: 1 }, at: { 120: { t: "pgain", g: { drums: 0, bass: 1, voice: 1, other: 1 } } }, tap: (k, c) => { if (k >= 120 && k <= 140) pcs.push(+c.pc[0].toFixed(4)); } });
      const D = render({ g: one("drums") }), i0 = 120 * 128; let jump = 0, prev = 0, ratioOk = true;
      for (let i = i0; i < i0 + Math.round(0.004 * sr); i++) { const dd = D[0][i]; if (Math.abs(dd) < 0.02) continue; const r = (full[0][i] - muted[0][i]) / dd; if (prev && Math.abs(r - prev) > 0.05) ratioOk = false; prev = r; }
      return Object.assign(out, { glide: pcs.slice(0, 3).concat(pcs.slice(-1)), ratioOk, sr }); });
    ok(lock.full === 0, "B lockstep: the four parts at full are the record itself, exactly, through a scratch, a speed change, a loop, a cue jump and reverse (difference " + lock.full + ")");
    ok(Object.values(lock.alone).every(x => x < 1e-5) && Object.values(lock.rmsK).every(x => x > 0.003), "B lockstep: each part alone plays exactly as that part would as the record, through the same moves: " + JSON.stringify(lock.alone) + " (levels " + JSON.stringify(lock.rmsK) + ")");
    ok(lock.key < 1e-5 && lock.keyFull === 0, "B lockstep with KEY on (pitch kept at 106 %): the four parts alone add back to the record: " + lock.key.toExponential(1));
    ok(lock.glide[0] < 1 && lock.glide[0] > 0.5 && lock.glide[2] < lock.glide[1] && lock.glide[3] < 0.002 && lock.ratioOk, "B a mute glides over about 8 ms, no click: " + JSON.stringify(lock.glide));

    /* the buttons */
    await p.evaluate(() => { const d = decks[0], po = d.node.port, pm = po.postMessage.bind(po); window.__msgs = []; po.postMessage = (m, tr) => { if (m && (m.t === "pgain" || m.t === "prender")) window.__msgs.push(JSON.parse(JSON.stringify(m))); return pm(m, tr); }; });
    const G = () => p.evaluate(() => { const g = decks[0].parts.g, m = window.__msgs[window.__msgs.length - 1]; return { g: ["drums", "bass", "voice", "other"].map(k => g[k]).join(","), sent: m && m.g ? ["drums", "bass", "voice", "other"].map(k => m.g[k]).join(",") : "",
      pressed: [...document.querySelectorAll('[data-part="A"]')].map(x => x.getAttribute("aria-pressed") === "true" ? 1 : 0).join("") }; });
    await p.click('[data-part="A"][data-k="drums"]'); let g = await G();
    ok(g.g === "0,1,1,1" && g.sent === g.g && g.pressed === "0111", "B a tap on Drums quiets the drums (and the engine is told): " + JSON.stringify(g));
    await p.click('[data-part="A"][data-k="drums"]'); g = await G();
    ok(g.g === "1,1,1,1" && g.pressed === "1111", "B another tap brings them back: " + JSON.stringify(g));
    await p.click('[data-ponly="A"]'); await p.click('[data-part="A"][data-k="voice"]'); g = await G();
    ok(g.g === "0,0,1,0" && g.pressed === "0010", "B Only, then Voice: the voice alone: " + JSON.stringify(g));
    await p.click('[data-part="A"][data-k="voice"]'); await p.click('[data-ponly="A"]'); g = await G();
    ok(g.g === "1,1,1,1", "B Voice again: every part; Only off: " + JSON.stringify(g));
    const box = await p.locator('[data-part="A"][data-k="bass"]').boundingBox();
    await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down(); await p.waitForTimeout(650); await p.mouse.up(); await p.waitForTimeout(100); g = await G();
    ok(g.g === "0,1,0,0", "B holding Bass plays the bass alone: " + JSON.stringify(g));
    await p.click('[data-part="A"][data-k="bass"]'); g = await G();
    ok(g.g === "1,1,1,1", "B a tap after that: every part again: " + JSON.stringify(g));
    a = await p.evaluate(() => ({ open: document.querySelector("#deckA .dmore").open, pm: !document.querySelector('[data-pmore="A"]').hidden, words: [...document.querySelectorAll('[data-pmore="A"] button, [data-pmore="A"] .plv span')].map(x => x.textContent).join(" | ") }));
    ok(a.pm && a.words === "Voice only | No voice | All parts | Drums | Bass | Voice | The rest", "B in the deck's More box: Voice only, No voice, All parts and a level for each part: " + a.words);
    await p.click('[data-pset="A"][data-v="voice"]'); g = await G();
    ok(g.g === "0,0,1,0", "B Voice only (an a cappella): " + JSON.stringify(g));
    await p.click('[data-pset="A"][data-v="novoice"]'); g = await G();
    ok(g.g === "1,1,0,1" && g.pressed === "1101", "B No voice (an instrumental): " + JSON.stringify(g));
    await p.evaluate(() => { const r = document.querySelector('[data-plvl="A"][data-k="bass"]'); r.value = "50"; r.dispatchEvent(new Event("input", { bubbles: true })); });
    g = await G(); a = await p.evaluate(() => document.querySelector('[data-plvo="A"][data-k="bass"]').textContent);
    ok(g.g === "1,0.5,0,1" && g.sent === g.g && a === "50%", "B the bass at half: " + JSON.stringify(g) + " " + a);
    await p.click('[data-pset="A"][data-v="all"]'); g = await G();
    ok(g.g === "1,1,1,1", "B All parts: the record as it is: " + JSON.stringify(g));
    /* the kind of music: Auto (and what it found), the line said for this song; another kind splits again, and is kept */
    a = await p.evaluate(() => ({ opts: [...document.querySelectorAll('[data-pkind="A"] option')].map(o => o.textContent).join(" | "), sel: document.querySelector('[data-pkind="A"]').value,
      note: (document.querySelector('[data-pmore="A"] .pnote') || {}).textContent || "" }));
    ok(a.opts === "Auto · Pop | Pop | Hip hop and rap | Rock and metal | Classical | Experimental" && a.sel === "auto" && a.note === "Some ad-libs and backing voices may stay in The rest.",
      "B Kind of music, a quiet menu in More (Auto found Pop), and one plain line: " + JSON.stringify(a));
    await p.selectOption('[data-pkind="A"]', "rock");
    await p.waitForFunction(() => decks[0].parts.st === "on" && decks[0].parts.kind === "rock", null, { timeout: 60000 }).catch(() => {});
    a = await p.evaluate(async () => { const m = await AOGStems.has(partsId(decks[0])); return { kind: decks[0].parts.kind, auto: decks[0].parts.auto, mk: m && m.kind, ma: m && m.auto, sel: document.querySelector('[data-pkind="A"]').value,
      note: (document.querySelector('[data-pmore="A"] .pnote') || {}).textContent || "", g: decks[0].parts.g }; });
    ok(a.kind === "rock" && a.auto === false && a.mk === "rock" && a.ma === false && a.sel === "rock" && a.note === "Loud guitars can leave a little of the voice in The rest.",
      "B Rock and metal chosen: split again with its settings, kept with the record, its line said: " + JSON.stringify(a));
    await p.selectOption('[data-pkind="A"]', "auto");
    await p.waitForFunction(() => decks[0].parts.st === "on" && decks[0].parts.auto === true, null, { timeout: 60000 }).catch(() => {});

    /* chops from what you hear: the drums alone, to the Drum Machine */
    await p.click('[data-ponly="A"]'); await p.click('[data-part="A"][data-k="drums"]');
    await p.evaluate(() => { const d = decks[0]; d.bpm = 100; d.beat0 = 0.5; d.pos = d.cue = Math.round(4.2 * d.buf.sampleRate); send(d, { t: "seek", v: d.pos, park: true }); });
    await p.waitForTimeout(300);
    await p.click('[data-chopsend="A"]');
    await p.waitForFunction(() => /16 chops/.test(document.getElementById("chopLineA").textContent), null, { timeout: 15000 });
    const ch = await p.evaluate(async () => {
      const d = decks[0], r = await AOGHandoff.list(AOGHandoff.INBOX), x = r.items[0], it = await AOGHandoff.item(AOGHandoff.INBOX, x.id), sr = d.buf.sampleRate;
      const ab = await it.wav.arrayBuffer(), v = new DataView(ab), n = (ab.byteLength - 44) / 4, bl = 60 / 100 * sr, a0 = Math.round(0.5 * sr + Math.floor((4.2 * sr - 0.5 * sr) / (4 * bl) + 1e-7) * 4 * bl);
      const raw = await AOGStems.keptParts(partsId(d), { sr, len: d.buf.length });
      let dm = 0, rm = 0; for (let i = 0; i < n; i++) { const y = v.getInt16(44 + i * 4, true) / 32767; dm = Math.max(dm, Math.abs(y - raw.d[0][a0 + i] / 32767)); rm = Math.max(rm, Math.abs(y - d.buf.getChannelData(0)[a0 + i])); }
      return { name: x.name.en, es: x.name.es, n, dm: +dm.toFixed(5), rm: +rm.toFixed(3), msg: window.__msgs.filter(m => m.t === "prender").length, line: document.getElementById("chopLineA").textContent };
    });
    ok(ch.name === "my-song · Drums · chops" && ch.es === "my-song · Drums · cortes" && ch.msg === 1 && ch.dm < 2e-4 && ch.rm > 0.05 && /^16 chops from my-song · Drums are on the Drum Machine's pads/.test(ch.line),
      "B Chops to the Drum Machine with the drums alone: 16 beats of just the drums, made by the deck's engine: " + JSON.stringify(ch));
    await p.click('[data-part="A"][data-k="drums"]'); await p.click('[data-ponly="A"]');
    const dm = await c.newPage(); await dm.goto(U(P2) + "music-pads.html"); await dm.waitForTimeout(2000);
    a = await dm.evaluate(() => { const B = S.banks[S.bank]; return { type: B.type, line: (document.getElementById("inLine") || {}).textContent || "" }; });
    ok(a.type === "chops" && /^\d+ chops from my-song · Drums are on bank [A-D], one beat a pad\.$/.test(a.line), "B the Drum Machine opens on its chops bank with the drums' chops: " + JSON.stringify(a));
    await dm.close();

    /* the Studio's hush: the deck that played stops, and only it starts again */
    await p.click('[data-play="A"]'); await p.waitForTimeout(300);
    a = await p.evaluate(async () => { const d = decks[0], was = d.motor; window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: true } })); const hushed = d.motor;
      const B = decks[1].motor; window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: false } })); await new Promise(r => setTimeout(r, 200));
      return { was, hushed, back: d.motor, other: decks[1].motor, B, owned: (window.__owned || []).includes(actx) }; });
    ok(a.was && !a.hushed && a.back && !a.other && a.owned, "B out of sight (aog-hush) the playing deck stops, and only it starts again; the deck's AudioContext is handed to AOGVU.own: " + JSON.stringify(a));
    await p.click('[data-play="A"]'); await p.waitForTimeout(400);

    /* Stop, on deck B */
    await put("B", 11, "other-song.wav");
    await p.click('[data-psplit="B"]');
    await p.waitForFunction(() => /\d+%/.test(document.querySelector('[data-pline="B"]').textContent), null, { timeout: 20000 });
    await p.click('[data-pstop="B"]'); await p.waitForTimeout(300);
    a = await p.evaluate(() => ({ line: document.querySelector('[data-pline="B"]').textContent, row: document.querySelector('[data-prow="B"]').textContent.trim(), st: decks[1].parts.st, live: window.__workers.filter(w => !w.done && /aog-stems|aog-learn/.test(w.url)).length }));
    ok(a.line === "Stopped. The record is as it was." && a.row === "Split into parts" && a.st === "" && a.live === 0, "B Stop: said plainly, the record as it was, the Worker let go: " + JSON.stringify(a));

    /* idle: nothing of the parts runs (the page's own resting loop looks four times a second) */
    await p.waitForTimeout(5500);
    a = await p.evaluate(async () => { const n0 = Object.assign({}, window.__n), w0 = window.__workers.length; window.__who = {}; await new Promise(r => setTimeout(r, 3000)); const n1 = window.__n; const who = Object.keys(window.__who); window.__who = null;
      return { timeouts: n1.to - n0.to - 1, intervals: n1.iv - n0.iv, frames: n1.raf - n0.raf, newWorkers: window.__workers.length - w0, live: window.__workers.filter(w => !w.done && /aog-stems|aog-learn/.test(w.url)).length,
        why: decks.map(d => d.id + ":" + d.pos + "~" + d._drawn + ":" + d.motor + ":" + (+d.level || 0).toFixed(4) + ":" + (+d.rate || 0).toFixed(3) + ":" + !!d.held), who: who.slice(0, 3), eq: [eqSeen, eqDirty, eqUntil, LOOPQ.at] }; });
    ok(a.intervals === 0 && a.newWorkers === 0 && a.live === 0 && a.timeouts <= 14 && a.frames <= 2, "B idle with the parts on: no Worker, no interval, only the page's own resting look (" + JSON.stringify(a) + " in 3 s)");

    /* kept: the same record again, on a fresh page: the parts at once, nothing split again */
    p = await c.newPage(); await p.goto(U(P2) + "music-decks.html"); await p.waitForTimeout(1200); await p.addScriptTag({ content: SONG });
    const t1 = Date.now(); await put("A", 7, "my-song.wav");
    await p.waitForFunction(() => decks[0].parts.st === "on", null, { timeout: 10000 }).catch(() => {});
    a = await p.evaluate(() => ({ st: decks[0].parts.st, row: document.querySelector('[data-prow="A"]').textContent, workers: window.__workers.filter(w => /aog-stems|aog-learn/.test(w.url)).length, last: window.AOGStems ? AOGStems.test.last() : "no lib" }));
    ok(a.st === "on" && a.workers === 0 && a.last === null && a.row === "DrumsBassVoiceThe restOnly", "B kept: the same record next time has its parts at once (" + (Date.now() - t1) + " ms, nothing split again): " + JSON.stringify(a));

    /* Spanish */
    await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(300);
    await put("B", 11, "otra.wav");
    a = await p.evaluate(() => ({ A: [...document.querySelectorAll('[data-prow="A"] button')].map(x => x.textContent).join(" | "), B: document.querySelector('[data-prow="B"]').textContent.trim(),
      more: [...document.querySelectorAll('[data-pmore="A"] button, [data-pmore="A"] .plv span')].map(x => x.textContent).join(" | "), tip: document.querySelector('[data-psplit="B"]').title }));
    ok(a.A === "Batería | Bajo | Voz | El resto | Solo" && a.B === "Separar en partes" && a.more === "Solo la voz | Sin voz | Todas las partes | Batería | Bajo | Voz | El resto" && a.tip === "Batería, bajo, voz y el resto, cada uno aparte. Se hace en este aparato.",
      "B in Spanish: " + JSON.stringify(a));
    await p.click('[data-psplit="B"]'); await p.waitForFunction(() => /%/.test(document.querySelector('[data-pline="B"]').textContent), null, { timeout: 20000 });
    a = await p.evaluate(() => document.querySelector('[data-pline="B"]').textContent);
    await p.click('[data-pstop="B"]'); await p.waitForTimeout(200);
    const b2 = await p.evaluate(() => document.querySelector('[data-pline="B"]').textContent);
    ok(/^(Escuchando el disco…|Separando el disco…) \d{1,3} %$/.test(a) && b2 === "Detenido. El disco quedó como estaba.", "B the progress and Stop in Spanish: " + a + " / " + b2);
    await c.close();

    /* inside the Studio, on an iPhone and an iPad, light and dark: the row fits, every control a finger high, the More box
       with the parts open reads (check-contrast) and is calm (check-calm) */
    for (const [dev, theme] of [["iPhone 13", "light"], ["iPhone 13", "dark"], ["iPad (gen 7)", "dark"]]) {
      const ph = await b.newContext(Object.assign({}, pw.devices[dev], { colorScheme: theme, serviceWorkers: "block" })); watch(ph); await routes(ph); await ph.addInitScript(SPY);
      await ph.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
      const m = await ph.newPage(); await m.goto(U(P2) + "the-studio#decks");
      await m.waitForFunction(() => { const fr = document.getElementById("room"), d = fr && fr.contentDocument; return fr && /music-decks/.test(fr.getAttribute("data-file") || "") && d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio"); }, null, { timeout: 30000 });
      await m.waitForTimeout(900);
      const q = await (await m.$("#room")).contentFrame();
      await q.addScriptTag({ content: SONG });
      await q.evaluate(async () => { const s = makeSong({ seed: 7, bars: 8 }), d = decks[0]; await loadFile(d, songFile(s, "my-song.wav")); });
      await q.waitForTimeout(300); await q.evaluate(() => { const b0 = document.querySelector('[data-psplit="A"]'); b0.scrollIntoView({ block: "center" }); });
      await q.tap('[data-psplit="A"]');
      await q.waitForFunction(() => decks[0].parts.st === "on", null, { timeout: 60000 }).catch(() => {});
      await q.evaluate(() => { const mo = document.querySelector("#deckA .dmore"); if (!mo.open) mo.querySelector("summary").click(); document.querySelector('[data-pmore="A"]').scrollIntoView({ block: "center" }); });
      await q.waitForTimeout(300);
      a = await q.evaluate(() => { const row = document.querySelector('[data-prow="A"]'), bs = [...row.querySelectorAll("button")].map(x => x.getBoundingClientRect());
        const ctl = [...document.querySelectorAll('[data-prow="A"] button, [data-pmore="A"] button, [data-pmore="A"] select, [data-pmore="A"] input')].map(x => x.getBoundingClientRect().height);
        return { st: decks[0].parts.st, iw: innerWidth, sw: document.scrollingElement.scrollWidth, right: Math.round(Math.max(...bs.map(r => r.right))), h: Math.round(Math.min(...ctl)), oneRow: new Set(bs.map(r => Math.round(r.top))).size === 1,
          clipped: [...row.querySelectorAll("button")].filter(x => x.scrollWidth > x.clientWidth + 1).map(x => x.textContent), font: Math.min(...[...document.querySelectorAll('[data-pmore="A"] select')].map(x => parseFloat(getComputedStyle(x).fontSize))) }; });
      const pc = await q.evaluate(`(${PROBE})()`), pk = await q.evaluate(`(${CALM})()`);
      ok(a.st === "on" && a.sw <= a.iw && a.right <= a.iw && a.h >= 44 && a.oneRow && !a.clipped.length && a.font >= 16 && !pc.length && !pk.length,
        `B in the Studio, ${dev}, ${theme}: the four parts and Only in one row, every control a finger high, the menu's text 16px, it reads and is calm: ` + JSON.stringify(a) + (pc.length ? " contrast: " + JSON.stringify(pc.slice(0, 3)) : "") + (pk.length ? " calm: " + JSON.stringify(pk.slice(0, 3)) : ""));
      await m.screenshot({ path: path.join(require("os").tmpdir(), `stems-decks-${dev.split(" ")[0].toLowerCase()}-${theme}.png`) });
      await ph.close();
    }
  }

  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await b.close(); srv.forEach(s => s.close());
  console.log(fails ? fails + " FAILED" : "ALL PASS");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
