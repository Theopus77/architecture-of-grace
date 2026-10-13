/* AOG-STEMS-AI-V1 — Split a song into its parts, Best quality: a trained model (SCNet) on the device (aog-stems-ai.js,
   models/stems/scnet-v1, vendor/onnxruntime-web-1.30.0). Jimmy: "It needs to be improved. Quantum this meaning it needs a
   big leap in its abilities."
   A · the splitter (port 9313): nothing of the model loads until a clean split starts; quick parts first, then the model's;
       how close each part comes (SDR, dB) quick against model; the four add back; Classical keeps the quick Drums and Bass
       and another kind needs no new run; Stop; out of sight (aog-hush) no new segment starts; kept on the device (stereo
       bass and voice); Split quality (its first choice per device, kept); a device that cannot run it keeps the quick
       split; the words in English and Spanish.
       AI_FULL=1: also every song of stems/split.js at its full length, and the starter crate (two records' first bars).
   B · the Turntables (port 9314): Split into parts: the quick parts at once, then "Making the parts cleaner… n%" with a
       Stop, then the model's parts in the deck's engine (lockstep: all four at full are the record, each part alone is that
       part as the record); kept (next time at once, no Worker); Stop keeps the quick parts; Split quality in More; Quick
       means no model; Spanish; an iPhone in the Studio (contrast, calm); idle after; no page errors.
   C · Learn a song and the Mixing Desk (port 9315): the cleaner parts follow and are kept; the desk's tracks get them.
   Run one part: AI_ONLY=B node stems/ai.js */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const P1 = 9313, P2 = 9314, P3 = 9315;
const srv = [P1, P2, P3].map(p => require("../srv.js")(p)), U = p => "http://localhost:" + p + "/";
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const SONG = fs.readFileSync(path.join(__dirname, "song.js"), "utf8");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
const ONLY = (process.env.AI_ONLY || "ABC").split(""), FULL = !!process.env.AI_FULL;
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
const SPY = `(() => {
  const W = window.Worker; window.__workers = [];
  if (W) window.Worker = function (u, o) { const w = new W(u, o), r = { url: String(u), done: false }; window.__workers.push(r); const t = w.terminate.bind(w); w.terminate = () => { r.done = true; t(); }; return w; };
  window.__n = { to: 0, iv: 0, raf: 0 };
  const st = window.setTimeout, si = window.setInterval, ra = window.requestAnimationFrame;
  window.setTimeout = function () { window.__n.to++; return st.apply(window, arguments); };
  window.setInterval = function () { window.__n.iv++; return si.apply(window, arguments); };
  window.requestAnimationFrame = function (f) { window.__n.raf++; return ra.call(window, f); };
})();`;
const HEAVY = /onnxruntime|\/models\/stems\/|aog-stems-ai/;
async function routes(ctx) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/__h\.html$/, r => r.fulfill({ contentType: "text/html", body: `<!doctype html><html lang="en"><meta charset="utf-8"><script src="/aog-stems.js"></script><script>${SONG}</script>` }));
  const R = { "the-studio": "the-studio.html", turntables: "music-decks.html" };
  await ctx.route(/\/(the-studio|turntables)(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, R[new URL(r.request().url()).pathname.slice(1)]), contentType: "text/html" }));
}
const f1 = x => x == null ? "—" : x.toFixed(1);

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* ══ A · the splitter ══ */
  if (ONLY.includes("A")) {
    const c = await b.newContext(); watch(c); await routes(c); await c.addInitScript(SPY);
    const REQ = []; c.on("request", r => REQ.push(r.url()));   /* the page's and its Workers' */
    const p = await c.newPage(); await p.goto(U(P1) + "__h.html");
    const heavy = async () => REQ.filter(u => HEAVY.test(u)).map(u => u.split("/").slice(-2).join("/"));
    /* quick, then clean; SDR per part for both, the add-back error, the progress steps */
    const both = (fn, o, extra) => p.evaluate(async ([fn, o, extra]) => {
      const s = window[fn](o), buf = bufOf(s.mix, s.sr), t0 = performance.now(), prog = [];
      const q = await AOGStems.split(buf, extra || {}), t1 = performance.now();
      const m = await AOGStems.clean(buf, Object.assign({ quick: q, onProgress: p => prog.push(Math.round(p * 100)) }, extra || {})), t2 = performance.now();
      const P = ["drums", "bass", "voice", "other"], r = { sec: +(s.n / s.sr).toFixed(1), quickMs: Math.round(t1 - t0), cleanMs: Math.round(t2 - t1), kind: m.kind, note: m.note, q: m.quality, model: m.model, ai: AOGStems.test.ai.last };
      if (s.parts) for (const k of P) { r["q_" + k] = +sdr(s.parts[k], [q[k].getChannelData(0), q[k].getChannelData(1)]).toFixed(2); r["m_" + k] = +sdr(s.parts[k], [m[k].getChannelData(0), m[k].getChannelData(1)]).toFixed(2); r["s_" + k] = +sdr(s.parts[k], s.mix).toFixed(2); }
      let e = 0; for (let ch = 0; ch < 2; ch++) { const a = s.mix[ch], X = P.map(k => m[k].getChannelData(ch)); for (let i = 0; i < a.length; i++) e = Math.max(e, Math.abs(X[0][i] + X[1][i] + X[2][i] + X[3][i] - a[i])); }
      const en = T => { let z = 0; for (let ch = 0; ch < 2; ch++) { const a = T.getChannelData ? T.getChannelData(ch) : T[ch]; for (let i = 0; i < a.length; i += 3) z += a[i] * a[i]; } return z; }, all = en(s.mix);
      r.share = P.map(k => +(en(m[k]) / all).toFixed(3)); r.qshare = P.map(k => +(en(q[k]) / all).toFixed(3));
      r.sumErr = e; r.prog = prog.filter((x, i, a) => i === 0 || x !== a[i - 1]);
      window.__last = { q, m }; return r; }, [fn, o, extra || null]);
    let a = await p.evaluate(() => ({ stems: !!window.AOGStems, model: AOGStems.model, quality: AOGStems.quality(), can: AOGStems.canBest() }));
    let h = await heavy();
    ok(a.stems && a.model === "scnet" && !h.length, "A the splitter is here, and nothing of the model is fetched until a clean split starts: " + JSON.stringify([a, h]));
    ok(a.quality === "best" && a.can, "A Split quality starts at Best on this computer (it has navigator.gpu): " + JSON.stringify(a));
    const r1 = await both("makeSong", { seed: 7, bars: 3 });
    h = await heavy();
    console.log("     a sung song, " + r1.sec + " s: quick " + r1.quickMs + " ms, then the model " + r1.cleanMs + " ms (" + JSON.stringify(r1.ai) + ")");
    const row = r => ["drums", "bass", "voice", "other"].map(k => `${k} ${f1(r["q_" + k])} → ${f1(r["m_" + k])}`).join(", ");
    console.log("     SDR, quick → model: " + row(r1));
    ok(r1.q === "model" && r1.model === "scnet" && r1.sumErr < 1e-4, "A clean(): quality \"model\", model \"scnet\", and the four still add back to the song (largest difference " + r1.sumErr.toExponential(1) + ")");
    ok(["drums", "bass", "voice", "other"].every(k => r1["m_" + k] >= r1["q_" + k] + 4) && r1.m_voice >= 15 && r1.m_drums >= 15, "A a big leap on a sung song: every part at least 4 dB closer than the quick split's: " + row(r1));
    ok(r1.prog.length >= 8 && r1.prog[r1.prog.length - 1] === 100 && r1.prog.every((x, i, A) => i === 0 || x >= A[i - 1]), "A calm progress, always forward, to 100 %: " + r1.prog.join(","));
    ok(h.some(x => /ort\.wasm\.min\.mjs/.test(x)) && h.some(x => /weights\.bin/.test(x)) && h.some(x => /aog-stems-ai\.js/.test(x)) && !h.some(x => /ort-wasm-simd-threaded\.asyncify|webgpu/.test(x)),
      "A at the press it fetches only this site's files: the model's Worker, onnxruntime's WebAssembly and the weights (no WebGPU build where there is no GPU adapter): " + h.join(", "));
    a = await p.evaluate(() => window.__workers.map(w => w.url.split("/").pop() + ":" + w.done));
    ok(a.length >= 2 && a.every(x => /:true$/.test(x)), "A every Worker (the quick split's, the model's) is let go when it is done: " + a.join(" "));
    const r2 = await both("makeRap", { seed: 21, bars: 4 });
    console.log("     trap, " + r2.sec + " s, " + r2.cleanMs + " ms. SDR, quick → model: " + row(r2) + "; the line: \"" + r2.note + "\"");
    ok(r2.m_bass >= r2.q_bass + 3 && r2.m_voice >= r2.q_voice + 1 && r2.m_drums >= r2.q_drums + 3 && r2.sumErr < 1e-4, "A trap (808, rap): the 808's body is Bass, the rap is Voice, better than the quick split: " + row(r2));
    /* Classical: the quick split's Drums and Bass, the model's Voice; another kind needs no new run */
    const r3 = await both("makeClassical", { seed: 65, soprano: true, bars: 2 });
    a = await p.evaluate(async () => { const { q, m } = window.__last, same = (x, y) => { const X = Array.isArray(x) ? x : [x], Y = Array.isArray(y) ? y : [y]; return X.length === Y.length && X.every((a, i) => a === Y[i] || (a.length === Y[i].length && a.every((v, j) => v === Y[i][j]))); };
      const mp = m.pack, w0 = window.__workers.length, pop = await AOGStems.rekind(m, { kind: "pop", auto: false }), back = await AOGStems.rekind(pop, q);
      return { kind: m.kind, d: same(mp.d, q.pack.d), b: same(mp.b, q.pack.b), md: !!mp.md && !!mp.mb, pop: pop.kind === "pop" && same(pop.pack.d, mp.md) && same(pop.pack.b, mp.mb) && !pop.pack.md, back: back.kind === "classical" && same(back.pack.d, q.pack.d),
        newWorkers: window.__workers.length - w0, note: m.note, vshare: m.stats.voice }; });
    console.log("     an orchestra with a soprano, " + r3.sec + " s. SDR, quick → model+fixes: " + row(r3));
    ok(a.kind === "classical" && a.d && a.b && a.md && a.pop && a.back && a.newWorkers === 0 && a.note === "classical" && r3.m_voice >= r3.q_voice + 3,
      "A Classical: Drums and Bass are the quick split's (timpani are Drums), the Voice is the model's; another kind of music swaps in the model's own Drums and Bass and back, with no new run: " + JSON.stringify(a));
    /* Stop */
    a = await p.evaluate(async () => { const s = makeSong({ seed: 9, bars: 8 }), buf = bufOf(s.mix, s.sr), q = await AOGStems.split(buf, {}), ctl = new AbortController(); let at = 0; const w0 = window.__workers.length;
      try { await AOGStems.clean(buf, { quick: q, signal: ctl.signal, onProgress: p => { if (p > 0.1 && !at) { at = performance.now(); ctl.abort(); } } }); return { name: "finished" }; }
      catch (e) { return { name: e.name, ms: Math.round(performance.now() - at), live: window.__workers.slice(w0).filter(w => !w.done).length }; } });
    ok(a.name === "AbortError" && a.ms < 1000 && a.live === 0, "A Stop ends the model's work at once (its Worker let go): " + JSON.stringify(a));
    /* out of sight: no new segment starts until it is back */
    a = await p.evaluate(async () => { const s = makeSong({ seed: 3, bars: 3 }), buf = bufOf(s.mix, s.sr), q = await AOGStems.split(buf, {}); let top = 0;
      window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: true } }));
      const pr = AOGStems.clean(buf, { quick: q, onProgress: p => { top = Math.max(top, p); } });
      await new Promise(r => setTimeout(r, 6000)); const held = top, live = window.__workers.filter(w => /aog-stems-ai/.test(w.url) && !w.done).length;
      window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: false } }));
      const m = await pr; return { held: +held.toFixed(3), live, done: m.quality }; });
    ok(a.held <= 0.02 && a.done === "model", "A out of sight (the Studio's hush) the model starts no segment (progress held at " + a.held + "); back in sight it finishes: " + JSON.stringify(a));
    /* kept on the device */
    a = await p.evaluate(async () => { const { m } = window.__last, s = makeSong({ seed: 4, bars: 3 }), f = songFile(s, "kept.wav"), q = await AOGStems.split(f, {}), mm = await AOGStems.clean(f, { quick: q });
      await AOGStems.keep("t|ai", mm); const meta = await AOGStems.has("t|ai"), raw = await AOGStems.keptParts("t|ai", { sr: 44100, len: mm.length }), back = await AOGStems.kept("t|ai", f);
      let d = 0; for (const k of ["drums", "bass", "voice", "other"]) for (let ch = 0; ch < 2; ch++) { const x = mm[k].getChannelData(ch), y = back[k].getChannelData(ch); for (let i = 0; i < x.length; i++) d = Math.max(d, Math.abs(x[i] - y[i])); }
      return { meta: meta.quality + "/" + meta.model, stereo: Array.isArray(raw.b) && raw.b.length === 2 && Array.isArray(raw.v) && raw.v.length === 2 && raw.b[0] !== raw.b[1], q: back.quality, d }; });
    ok(a.meta === "model/scnet" && a.stereo && a.q === "model" && a.d === 0, "A kept on the device, marked as the model's (bass and voice in stereo), and found again exactly: " + JSON.stringify(a));
    /* a device that cannot run it keeps the quick split, and says so */
    a = await p.evaluate(async () => { const s = makeSong({ seed: 5, bars: 3 }), buf = bufOf(s.mix, s.sr), q = await AOGStems.split(buf, {}), out = {};
      AOGStems.test.ai.failInit = "wasm"; try { await AOGStems.clean(buf, { quick: q }); out.init = "finished"; } catch (e) { out.init = e.kept ? "kept" : e.message; } AOGStems.test.ai.failInit = "";
      AOGStems.test.ai.failSeg = 1; try { await AOGStems.clean(buf, { quick: q }); out.seg = "finished"; } catch (e) { out.seg = e.kept ? "kept" : e.message; } AOGStems.test.ai.failSeg = 0;
      out.live = window.__workers.filter(w => /aog-stems/.test(w.url) && !w.done).length; out.en = AOGStems.word("cleanKept", "en"); out.es = AOGStems.word("cleanKept", "es"); return out; });
    ok(a.init === "kept" && a.seg === "kept" && a.live === 0 && a.en === "This device kept the quick split." && a.es === "Este aparato se quedó con la separación rápida.",
      "A the model cannot start, or runs out of memory midway: the quick split stays, said plainly: " + JSON.stringify(a));
    /* the words */
    a = await p.evaluate(() => ["clean", "cleanDone", "cleanStopped", "qLab", "qQuick", "qBest", "cleanGo"].map(k => AOGStems.word(k, "en") + " / " + AOGStems.word(k, "es")));
    ok(a[0] === "Making the parts cleaner… %n% / Limpiando las partes… %n %" && a[1] === "The parts are cleaner now. / Las partes ya están más limpias." && a[3] === "Split quality / Calidad" && a[4] === "Quick / Rápida" && a[5] === "Best (slower) / La mejor (más lenta)",
      "A the words, in English and Spanish: " + a.join(" | "));
    /* Split quality: kept on this device */
    a = await p.evaluate(() => { AOGStems.setQuality("quick"); const q1 = AOGStems.quality(); AOGStems.setQuality("best"); return { q1, q2: AOGStems.quality(), stored: localStorage.getItem("aog.stems.quality.v1") }; });
    ok(a.q1 === "quick" && a.q2 === "best" && a.stored === "best", "A the choice is kept on this device: " + JSON.stringify(a));
    if (FULL) {
      /* every song of stems/split.js at its own length, and the starter crate */
      const SONGS = [["a sung song", "makeSong", { seed: 7 }], ["a sung song at 120", "makeSong", { seed: 11, bpm: 120, key: 2 }], ["a sung song, one channel", "makeSong", { seed: 5, mono: true }],
        ["pop", "makeSong", { seed: 13, pop: true, bpm: 104 }], ["trap", "makeRap", { seed: 21 }], ["boom-bap", "makeRap", { seed: 33, boom: true }], ["trap, one channel", "makeRap", { seed: 21, mono: true }],
        ["hip hop with a sampled loop", "makeRap", { seed: 35, boom: true, sample: true }], ["classic rock", "makeRock", { seed: 41 }], ["metal", "makeRock", { seed: 43, metal: true }],
        ["a solo piano piece", "makeClassical", { seed: 61, piano: true }], ["an orchestra", "makeClassical", { seed: 63 }], ["an orchestra with a soprano", "makeClassical", { seed: 65, soprano: true }], ["experimental", "makeExperimental", { seed: 77 }]];
      console.log("     FULL · song | kind | drums | bass | voice | the rest   (quick → model+fixes, dB; the song as it is in brackets) · shares quick → model · the line");
      for (const [nm, fn, o] of SONGS) { const r = await both(fn, o);
        console.log(`     ${nm} (${r.sec} s, ${r.cleanMs} ms) | ${r.kind} | ` + ["drums", "bass", "voice", "other"].map(k => r["q_" + k] == null ? "—" : `${f1(r["q_" + k])} → ${f1(r["m_" + k])} (${f1(r["s_" + k])})`).join(" | ") + ` · ${r.qshare.join(" ")} → ${r.share.join(" ")} · "${r.note}"`); }
      for (const f of ["01-paper-kites.mp3", "09-blue-lamp.mp3"]) {
        const cr = await p.evaluate(async (f) => { const ab = await (await fetch("/audio/crate/" + f)).arrayBuffer(), bpm = { "01-paper-kites.mp3": 90, "09-blue-lamp.mp3": 120 }[f], bar = 240 / bpm;
          const ctx = new OfflineAudioContext(2, 1, 44100), full = await ctx.decodeAudioData(ab), n = Math.min(full.length, Math.round((12 * bar + 0.5) * 44100)), buf = new AudioBuffer({ numberOfChannels: 2, length: n, sampleRate: 44100 });
          for (let ch = 0; ch < 2; ch++) buf.getChannelData(ch).set(full.getChannelData(Math.min(ch, full.numberOfChannels - 1)).subarray(0, n));
          const q = await AOGStems.split(buf, {}), t0 = performance.now(), m = await AOGStems.clean(buf, { quick: q }), ms = performance.now() - t0, sr = 44100;
          const share = (R, a, b) => { const all = ["drums", "bass", "voice", "other"].map(k => { const x = R[k].getChannelData(0); let s = 0; for (let i = Math.round(a * sr); i < Math.round(b * sr); i++) s += x[i] * x[i]; return s; }), t = all.reduce((x, y) => x + y, 0); return all.map(x => +(x / t).toFixed(3)); };
          return { sec: +(n / sr).toFixed(1), ms: Math.round(ms), q: [share(q, 0.1, 4 * bar - 0.1), share(q, 4 * bar + 0.1, 8 * bar - 0.1)], m: [share(m, 0.1, 4 * bar - 0.1), share(m, 4 * bar + 0.1, 8 * bar - 0.1)] }; }, f);
        console.log(`     FULL · the crate's ${f} (first ${cr.sec} s, the model ${cr.ms} ms): shares [drums, bass, voice, the rest] in bars 1–4 (drums only) quick ${cr.q[0]} → model ${cr.m[0]}; bars 5–8 (the bass comes in) quick ${cr.q[1]} → model ${cr.m[1]}`);
      }
    }
    await c.close();
  }

  /* ══ B · the Turntables ══ */
  if (ONLY.includes("B")) {
    const c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c);
    await c.addInitScript(SPY);
    await c.addInitScript(() => { try { localStorage.setItem("aog.decks.bench", "full"); } catch (e) {} });
    let p = await c.newPage(); await p.goto(U(P2) + "music-decks.html"); await p.waitForTimeout(1200);
    await p.addScriptTag({ content: SONG });
    const put = (pg, deck, seed, name, bars) => pg.evaluate(async ([deck, seed, name, bars]) => { const s = makeSong({ seed: seed, bars: bars || 3 }), d = decks.find(x => x.id === deck);
      await loadFile(d, songFile(s, name)); await new Promise(r => { const t0 = Date.now(), k = setInterval(() => { if (d.bpm !== -1 || Date.now() - t0 > 8000) { clearInterval(k); r(); } }, 50); }); }, [deck, seed, name, bars]);
    let a = await p.evaluate(re => ({ heavy: performance.getEntriesByType("resource").some(e => new RegExp(re).test(e.name)), stems: !!window.AOGStems }), HEAVY.source);
    ok(!a.heavy && !a.stems, "B the Turntables open with nothing of the parts or the model loaded: " + JSON.stringify(a));
    await put(p, "A", 7, "short-song.wav");
    await p.evaluate(() => { window.__lines = []; const el = document.querySelector('[data-pline="A"]'); new MutationObserver(() => { const t = el.textContent; if (t && window.__lines[window.__lines.length - 1] !== t) window.__lines.push(t); }).observe(el, { childList: true, characterData: true, subtree: true }); });
    await p.click('[data-psplit="A"]');
    await p.waitForFunction(() => decks[0].parts.st === "on", null, { timeout: 90000 });
    a = await p.evaluate(() => ({ model: decks[0].parts.model, clean: decks[0].parts.clean, row: document.querySelector('[data-prow="A"]').textContent, stop: !document.querySelector('[data-pcrow="A"]').hidden, sr: decks[0].buf.sampleRate }));
    ok(!a.model && a.clean === "busy" && a.row === "DrumsBassVoiceThe restOnly" && a.stop, "B Split into parts: the quick parts at once (the four buttons work), the cleaner ones on their way with a Stop of their own: " + JSON.stringify(a));
    await p.waitForFunction(() => /^Making the parts cleaner… \d{1,3}%$/.test(document.querySelector('[data-pline="A"]').textContent), null, { timeout: 30000 });
    await p.click('[data-part="A"][data-k="voice"]');   /* the quick parts play while the model works: the voice quiet */
    const t0 = Date.now();
    await p.waitForFunction(() => decks[0].parts.model === true, null, { timeout: 240000 });
    a = await p.evaluate(() => ({ lines: window.__lines, g: decks[0].parts.g, stop: !document.querySelector('[data-pcrow="A"]').hidden, live: window.__workers.filter(w => /aog-stems/.test(w.url) && !w.done).length }));
    const cl = a.lines.filter(l => /cleaner…/.test(l));
    ok(cl.length >= 3 && a.lines[a.lines.length - 1] === "The parts are cleaner now." && a.g.voice === 0 && a.g.drums === 1 && !a.stop && a.live === 0,
      `B then the model's parts take their place (${Date.now() - t0} ms; ${cl.length} calm steps, e.g. "${cl[Math.floor(cl.length / 2)]}"), the voice still quiet as it was, its Worker let go: ` + JSON.stringify({ last: a.lines[a.lines.length - 1], g: a.g, live: a.live }));
    /* lockstep with the model's parts (stereo bass and voice), in the deck's own engine, off line */
    const lock = await p.evaluate(async () => {
      const d = decks[0], raw = await AOGStems.keptParts(partsId(d), { sr: d.buf.sampleRate, len: d.buf.length }), sr = d.buf.sampleRate, S = 1 / 32767;
      const L0 = d.buf.getChannelData(0), R0 = d.buf.getChannelData(1), bl = Math.round(60 / 100 * sr), two = x => Array.isArray(x) ? [x[0], x[1] || x[0]] : [x, x];
      const [dL, dR] = two(raw.d), [bL, bR] = two(raw.b), [vL, vR] = two(raw.v), flt = a => { const o = new Float32Array(a.length); for (let i = 0; i < a.length; i++) o[i] = a[i] * S; return o; };
      const moves = { 0: { t: "seek", v: Math.round(1 * sr), park: true }, 1: { t: "motor", on: true, instant: true }, 60: { t: "pitch", v: 1.06 }, 120: { t: "hand", on: true, rate: -1.5 }, 150: { t: "hand", on: true, rate: 2.2 },
        180: { t: "hand", on: false }, 220: { t: "bloop", len: bl, n: 1, b0: 0 }, 330: { t: "loop", on: false }, 340: { t: "qjump", to: Math.round(0.5 * sr), len: 0 }, 380: { t: "rev", on: true }, 430: { t: "rev", on: false } };
      function render(o) { const c = new AOGVinylCore(sr); c.msg({ t: "buf", L: o.L || L0, R: o.R || R0, sr: sr }); c.msg({ t: "noise", v: 0 }); c.msg({ t: "key", on: false }); c.msg({ t: "slip", on: false });
        if (o.g) { c.msg({ t: "parts", dL, dR, b: bL, v: vL, bR, vR }); c.msg({ t: "pgain", g: o.g, now: true }); }
        const N = 128, B = 480, oL = new Float32Array(N * B), oR = new Float32Array(N * B);
        for (let k = 0; k < B; k++) { if (moves[k]) c.msg(moves[k]); c.frame = k * N; c.process(oL.subarray(k * N, (k + 1) * N), oR.subarray(k * N, (k + 1) * N), N); }
        return [oL, oR]; }
      const diff = (x, y) => { let m = 0; for (let c = 0; c < 2; c++) for (let i = 0; i < x[c].length; i++) m = Math.max(m, Math.abs(x[c][i] - y[c][i])); return m; };
      const one = k => ({ drums: 0, bass: 0, voice: 0, other: 0, [k]: 1 });
      const rec = render({}), full = render({ g: { drums: 1, bass: 1, voice: 1, other: 1 } }), out = { full: diff(full, rec), alone: {}, q: raw.quality, stereo: bL !== bR && vL !== vR };
      const as = { drums: [flt(dL), flt(dR)], bass: [flt(bL), flt(bR)], voice: [flt(vL), flt(vR)] };
      for (const k of ["drums", "bass", "voice"]) out.alone[k] = diff(render({ g: one(k) }), render({ L: as[k][0], R: as[k][1] }));
      const oth = [new Float32Array(L0.length), new Float32Array(L0.length)]; for (let i = 0; i < L0.length; i++) { oth[0][i] = L0[i] - as.drums[0][i] - as.bass[0][i] - as.voice[0][i]; oth[1][i] = R0[i] - as.drums[1][i] - as.bass[1][i] - as.voice[1][i]; }
      out.alone.other = diff(render({ g: one("other") }), render({ L: oth[0], R: oth[1] }));
      return out; });
    ok(lock.q === "model" && lock.stereo && lock.full === 0 && Object.values(lock.alone).every(x => x < 1e-5),
      "B lockstep with the model's parts (bass and voice in stereo): all four at full are the record exactly, and each part alone is that part played as the record, through a scratch, a speed change, a loop, a cue jump and reverse: " + JSON.stringify(lock));
    /* More: Split quality, Best; the line said for this song */
    a = await p.evaluate(() => ({ q: [...document.querySelectorAll('[data-pq="A"] option')].map(o => o.textContent + (o.selected ? "*" : "")).join(" | "), go: !!document.querySelector('[data-pcgo="A"]'),
      lab: document.querySelector('[data-pq="A"]').closest("label").textContent.split("\n")[0].trim() }));
    ok(a.q === "Quick | Best (slower)*" && !a.go && /^Split quality/.test(a.lab), "B the deck's More box: Split quality, Quick · Best (slower), at Best; no Make the parts cleaner (they are): " + JSON.stringify(a));
    /* kept: the same record next time, the model's parts at once */
    let p2 = await c.newPage(); await p2.goto(U(P2) + "music-decks.html"); await p2.waitForTimeout(1200); await p2.addScriptTag({ content: SONG });
    await put(p2, "A", 7, "short-song.wav");
    await p2.waitForFunction(() => decks[0].parts.st === "on", null, { timeout: 15000 }).catch(() => {});
    a = await p2.evaluate(() => ({ st: decks[0].parts.st, model: decks[0].parts.model, clean: decks[0].parts.clean, workers: window.__workers.filter(w => /aog-stems/.test(w.url)).length }));
    ok(a.st === "on" && a.model && a.clean === "" && a.workers === 0, "B kept: the record has its cleaner parts at once next time, nothing split or cleaned again: " + JSON.stringify(a));
    await p2.close();
    /* Stop keeps the quick parts (deck B) */
    await put(p, "B", 11, "other-song.wav");
    await p.click('[data-psplit="B"]');
    await p.waitForFunction(() => /cleaner… \d+%/.test(document.querySelector('[data-pline="B"]').textContent), null, { timeout: 90000 });
    await p.click('[data-pcstop="B"]'); await p.waitForTimeout(400);
    a = await p.evaluate(() => ({ line: document.querySelector('[data-pline="B"]').textContent, st: decks[1].parts.st, model: decks[1].parts.model, live: window.__workers.filter(w => /aog-stems/.test(w.url) && !w.done).length,
      go: (document.querySelector('[data-pcgo="B"]') || {}).textContent }));
    ok(a.line === "Stopped. The quick parts stay." && a.st === "on" && !a.model && a.live === 0 && a.go === "Make the parts cleaner", "B Stop: the quick parts stay, said plainly, the Worker let go, and Make the parts cleaner waits in More: " + JSON.stringify(a));
    /* Quick: no model at all */
    await p.selectOption('[data-pq="B"]', "quick"); await p.waitForTimeout(200);
    a = await p.evaluate(() => ({ stored: localStorage.getItem("aog.stems.quality.v1"), go: !!document.querySelector('[data-pcgo="B"]') }));
    await put(p, "B", 13, "third-song.wav");
    const w0 = await p.evaluate(() => window.__workers.length);
    await p.click('[data-psplit="B"]'); await p.waitForFunction(() => decks[1].parts.st === "on", null, { timeout: 90000 }); await p.waitForTimeout(800);
    const a2 = await p.evaluate(w0 => ({ clean: decks[1].parts.clean, ai: window.__workers.slice(w0).filter(w => /aog-stems-ai/.test(w.url)).length, line: document.querySelector('[data-pline="B"]').textContent }), w0);
    ok(a.stored === "quick" && !a.go && a2.clean === "" && a2.ai === 0 && a2.line === "The record is in four parts. Tap a part to quiet it.", "B Split quality: Quick is kept on this device, and a split then stays quick (no model): " + JSON.stringify([a, a2]));
    await p.evaluate(() => localStorage.setItem("aog.stems.quality.v1", "best"));
    /* Spanish: the progress and Stop */
    await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(300);
    await put(p, "B", 17, "otra.wav");
    await p.click('[data-psplit="B"]');
    await p.waitForFunction(() => / %$/.test(document.querySelector('[data-pline="B"]').textContent) && decks[1].parts.clean === "busy", null, { timeout: 90000 });
    a = await p.evaluate(() => ({ line: document.querySelector('[data-pline="B"]').textContent, stop: document.querySelector('[data-pcstop="B"]').textContent, q: [...document.querySelectorAll('[data-pq="B"] option')].map(o => o.textContent).join(" | ") }));
    await p.click('[data-pcstop="B"]'); await p.waitForTimeout(300);
    const es2 = await p.evaluate(() => document.querySelector('[data-pline="B"]').textContent);
    ok(/^Limpiando las partes… \d{1,3} %$/.test(a.line) && a.stop === "Parar" && a.q === "Rápida | La mejor (más lenta)" && es2 === "Detenido. Se quedan las partes rápidas.", "B in Spanish: " + JSON.stringify(a) + " / " + es2);
    await p.evaluate(() => document.getElementById("langBtn").click());
    /* idle: nothing of the model runs */
    await p.waitForTimeout(3000);
    a = await p.evaluate(async () => { const n0 = Object.assign({}, window.__n), w0 = window.__workers.length, wl = window.__workers.map(w => w.url.split("/").pop()); await new Promise(r => setTimeout(r, 3000)); const n1 = window.__n;
      return { intervals: n1.iv - n0.iv, timeouts: n1.to - n0.to - 1, newWorkers: window.__workers.length - w0, live: window.__workers.filter(w => /aog-stems/.test(w.url) && !w.done).length }; });
    ok(a.intervals === 0 && a.newWorkers === 0 && a.live === 0 && a.timeouts <= 14, "B idle after: no Worker, no interval, only the page's own resting look: " + JSON.stringify(a));
    await c.close();
    /* on an iPhone, in the Studio, dark: the More box with Split quality reads and is calm */
    const ph = await b.newContext(Object.assign({}, pw.devices["iPhone 13"], { colorScheme: "dark", serviceWorkers: "block" })); watch(ph); await routes(ph);
    await ph.addInitScript(() => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", "dark"); localStorage.setItem("aog.interior.ws.v1.theme", "dark"); localStorage.setItem("aog.stems.quality.v1", "best"); } catch (e) {} });
    const m = await ph.newPage(); await m.goto(U(P2) + "the-studio#decks");
    await m.waitForFunction(() => { const fr = document.getElementById("room"), d = fr && fr.contentDocument; return fr && /music-decks/.test(fr.getAttribute("data-file") || "") && d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio"); }, null, { timeout: 30000 });
    await m.waitForTimeout(900);
    const q = await (await m.$("#room")).contentFrame();
    await q.addScriptTag({ content: SONG });
    await q.evaluate(async () => { const s = makeSong({ seed: 7, bars: 3 }), d = decks[0]; await loadFile(d, songFile(s, "short-song.wav")); });
    await q.waitForTimeout(300); await q.evaluate(() => document.querySelector('[data-psplit="A"]').scrollIntoView({ block: "center" }));
    await q.tap('[data-psplit="A"]');
    await q.waitForFunction(() => decks[0].parts.st === "on" && decks[0].parts.model, null, { timeout: 240000 }).catch(() => {});
    await q.evaluate(() => { const mo = document.querySelector("#deckA .dmore"); if (!mo.open) mo.querySelector("summary").click(); document.querySelector('[data-pq="A"]').scrollIntoView({ block: "center" }); });
    await q.waitForTimeout(300);
    a = await q.evaluate(() => { const s = document.querySelector('[data-pq="A"]'), r = s.getBoundingClientRect(); return { model: decks[0].parts.model, h: Math.round(r.height), font: parseFloat(getComputedStyle(s).fontSize), right: Math.round(r.right), iw: innerWidth, sw: document.scrollingElement.scrollWidth }; });
    const pc = await q.evaluate(`(${PROBE})()`), pk = await q.evaluate(`(${CALM})()`);
    ok(a.model && a.h >= 44 && a.font >= 16 && a.right <= a.iw && a.sw <= a.iw && !pc.length && !pk.length, "B on an iPhone in the Studio (dark): the cleaner parts arrive; Split quality is a finger high, 16px, fits, reads and is calm: " + JSON.stringify(a) + (pc.length ? " contrast: " + JSON.stringify(pc.slice(0, 3)) : "") + (pk.length ? " calm: " + JSON.stringify(pk.slice(0, 3)) : ""));
    await ph.close();
  }

  /* ══ C · Learn a song and the Mixing Desk ══ */
  if (ONLY.includes("C")) {
    const c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c); await c.addInitScript(SPY);
    let p = await c.newPage(); await p.goto(U(P3) + "music-bass.html"); await p.waitForTimeout(1200);
    await p.addScriptTag({ content: SONG });
    const fileOf = (pg, seed, name) => pg.evaluate(async ([seed]) => { const f = songFile(makeSong({ seed: seed, bars: 3 }), "x.wav"), u = new Uint8Array(await f.arrayBuffer()); let s = ""; for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); }, [seed])
      .then(b64 => ({ name: name, mimeType: "audio/wav", buffer: Buffer.from(b64, "base64") }));
    const FILE = await fileOf(p, 7, "Practice song.wav");
    await p.evaluate(() => { const bx = document.getElementById("lgBox"); bx.scrollIntoView({ block: "center" }); if (!bx.open) bx.querySelector("summary").click(); }); await p.waitForTimeout(200);
    await p.setInputFiles("#lgFile", FILE);
    await p.waitForFunction(() => window.AOGLearnUI && AOGLearnUI.test.state().open && AOGLearnUI.test.state().name === "Practice song.wav", null, { timeout: 60000 });
    await p.evaluate(() => { const d = document.getElementById("lgMore"); if (d && !d.open) d.querySelector("summary").click(); }); await p.waitForTimeout(200);
    await p.click("#lgSplit");
    await p.waitForFunction(() => AOGLearnUI.test.stems().st === "on", null, { timeout: 90000 });
    let a = await p.evaluate(() => ({ s: AOGLearnUI.test.stems(), stop: !!document.getElementById("lgCleanStop"), q: (document.getElementById("lgQual") || {}).value }));
    ok(a.s.quality === "listen" && a.s.clean === "busy" && a.stop && a.q === "best", "C Learn a song: Split the song into parts gives the quick parts first (Quiet a part works), the cleaner ones on their way, with Stop and Split quality: " + JSON.stringify(a));
    await p.waitForFunction(() => AOGLearnUI.test.stems().model, null, { timeout: 240000 });
    a = await p.evaluate(() => ({ s: AOGLearnUI.test.stems(), line: document.getElementById("lgSplitLine").textContent }));
    ok(a.s.quality === "model" && a.s.clean === "" && a.line === "The parts are cleaner now.", "C then the model's parts take their place, said plainly: " + JSON.stringify(a));
    /* kept */
    p = await c.newPage(); await p.goto(U(P3) + "music-bass.html"); await p.waitForTimeout(1200);
    await p.evaluate(() => { const bx = document.getElementById("lgBox"); if (!bx.open) bx.querySelector("summary").click(); });
    await p.waitForFunction(() => window.AOGLearnUI && AOGLearnUI.test.stems().st === "on", null, { timeout: 20000 }).catch(() => {});
    a = await p.evaluate(() => ({ s: AOGLearnUI.test.stems(), w: window.__workers.length }));
    ok(a.s.st === "on" && a.s.model && a.w === 0, "C kept: the song opens with its cleaner parts next time, nothing run again: " + JSON.stringify(a));
    await p.close();
    /* the Mixing Desk */
    const d = await c.newPage(); await d.goto(U(P3) + "music-studio.html"); await d.waitForTimeout(1500); await d.addScriptTag({ content: SONG });
    a = await d.evaluate(() => ({ lab: document.querySelector('#splitBlk [data-t="splitQ"]').textContent, opts: [...document.getElementById("splitQual").options].map(o => o.textContent + (o.selected ? "*" : "")).join(" | "), stems: !!window.AOGStems }));
    ok(a.lab === "Split quality" && a.opts === "Quick | Best (slower)*" && !a.stems, "C the Mixing Desk: Split quality (Best), with nothing loaded yet: " + JSON.stringify(a));
    const F2 = await fileOf(d, 11, "Desk song.wav");
    await d.setInputFiles("#splitIn", F2);
    await d.waitForFunction(() => /cleaner…/.test(document.getElementById("splitMsg").textContent), null, { timeout: 90000 });
    const before = await d.evaluate(() => { const S0 = __aogStudio.SONG; return S0.tracks.slice(0, 3).map(x => { const bf = x.clip && __aogStudio.BUF.get(x.clip.id); return bf ? Array.from(bf.getChannelData(0).subarray(50000, 70000)) : null; }); });
    await d.waitForFunction(() => !__aogStudio.SPL.busy, null, { timeout: 240000 });
    a = await d.evaluate(async (before) => { const S0 = __aogStudio.SONG, out = { msg: document.getElementById("splitMsg").textContent, names: S0.tracks.slice(0, 4).map(x => x.clip && x.clip.name) };
      out.changed = S0.tracks.slice(0, 3).map((x, i) => { const bf = __aogStudio.BUF.get(x.clip.id), y = bf.getChannelData(0), z = before[i]; let dd = 0; for (let k = 0; k < z.length; k++) dd = Math.max(dd, Math.abs(y[50000 + k] - z[k])); return +dd.toFixed(3); });
      out.live = window.__workers.filter(w => /aog-stems/.test(w.url) && !w.done).length; return out; }, before);
    ok(/^Drums, Bass, Voice and The rest: on tracks 1, 2, 3 and 4\. The parts are cleaner now\./.test(a.msg) && a.changed.every(x => x > 0.001) && a.live === 0,
      "C the desk: the quick parts go on four tracks, then the cleaner ones take their place in those recordings: " + JSON.stringify(a));
    await c.close();
  }

  ok(!errs.length, "no page errors" + (errs.length ? ": " + errs.slice(0, 5).join(" | ") : ""));
  await b.close(); srv.forEach(s => s.close());
  console.log(fails ? `${fails} FAILED` : "all passed");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + (e && e.stack || e)); process.exit(1); });
