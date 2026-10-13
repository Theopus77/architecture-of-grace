/* AOG-STEMS-RESAMPLE-V1 · AOG-STEMS-GPU-CHECK-V1 · AOG-STEMS-CHECK-V1 · AOG-STEMS-COMPARE-V1 — Split a song, as it runs on an iPad.
   Jimmy, on his iPad, after "The parts are cleaner now": "It sounds nasty! … It all sounded shitty!"
   An iPad plays at 48 kHz. The model hears 44.1 kHz, and the change of rate was made by an OfflineAudioContext, whose buffer
   player draws straight lines between samples: on a real song (Karissa Hobbs, "Let's Go Fishin'", CC BY 3.0) the round trip
   kept only 29 dB, the voice came out 25 dB from what the model really made (45 dB at 44.1 kHz), and The rest got 10 dB of
   hiss above 16 kHz. Now a band-limited resampler does it (94 dB), a GPU is self-tested before it is trusted, the model's
   split is checked against the quick one, and the Turntables can play either (Hear: Quick parts · Clean parts).
   A · the splitter (port 9316): the resampler; the 48 kHz path against the 44.1 kHz one; channel order, sample alignment and
       the joins between segments; the self-test (on WebAssembly here); the checks (a worse split keeps the quick parts,
       said plainly in English and Spanish); both splits kept.
   B · WebGPU (port 9317, SwiftShader, a software GPU): the self-test on a GPU that gives a wrong answer (faked: half of one
       stage's output cut off) fails, and the parts are made with WebAssembly, with only a quiet console note.
   C · the Turntables at 48 kHz, like an iPad (port 9318): split, cleaned, then Hear: Quick parts · Clean parts swaps what the
       deck plays (levels and quiet parts stay); Spanish; check-silent; no page errors.
   Run one part: REAL_ONLY=A node stems/real.js */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path"), cp = require("child_process");
const P1 = 9316, P2 = 9317, P3 = 9318;
const srv = [P1, P2, P3].map(p => require("../srv.js")(p)), U = p => "http://localhost:" + p + "/";
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const SONG = fs.readFileSync(path.join(__dirname, "song.js"), "utf8");
const ONLY = (process.env.REAL_ONLY || "ABC").split("");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
function watch(ctx) { ctx.on("page", pg => pg.on("pageerror", e => errs.push(pg.url().split("/").pop() + ": " + e.message))); }
async function routes(ctx) {
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/__h\.html$/, r => r.fulfill({ contentType: "text/html", body: `<!doctype html><html lang="en"><meta charset="utf-8"><script src="/aog-stems.js"></script><script>${SONG}</script>` }));
}
/* in the page: measures */
const LIB = `
window.__snr = (x, y, o) => { o = o || 0; let a = 0, e = 0; for (let i = 3000; i < x.length - 3000; i++) { const v = y[i + o] || 0; a += x[i] * x[i]; e += (x[i] - v) * (x[i] - v); } return 10 * Math.log10(a / e); };
window.__lag = (x, y) => { let best = -1e9, lag = 0; for (let o = -8; o <= 8; o++) { const v = __snr(x, y, o); if (v > best) { best = v; lag = o; } } return lag; };
window.__ch = (P, k) => [P[k].getChannelData(0), P[k].getChannelData(1)];
`;

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* ══ A · the splitter ══ */
  if (ONLY.includes("A")) {
    const c = await b.newContext(); watch(c); await routes(c);
    const p = await c.newPage(); await p.goto(U(P1) + "__h.html"); await p.addScriptTag({ content: LIB });
    /* the resampler: a round trip of a song with broadband hats, 44.1 → 48 → 44.1 kHz; and the old way, for the record */
    let a = await p.evaluate(async () => {
      /* a song's voice and bass with 40 tones from 60 Hz to 19.5 kHz (real records hold little above 20 kHz; what is above
         the lower rate's top can not come back, and the hats of the synthetic songs are mostly up there) */
      const s = makeSong({ seed: 7, bars: 3 }), n = s.n, R = AOGStems.test.resample;
      let z = 99; const rnd = () => { z = (z * 16807) % 2147483647; return z / 2147483647; };
      const tones = []; for (let k = 0; k < 40; k++) tones.push([60 * Math.pow(19500 / 60, rnd()), 2 * Math.PI * rnd(), 0.004 * rnd()]);
      const X = [0, 1].map(c => { const o = new Float32Array(n), v = s.parts.voice[c], b = s.parts.bass[c]; for (let i = 0; i < n; i++) { let y = v[i] + b[i]; for (const [f, ph, a] of tones) y += a * Math.sin(2 * Math.PI * f * i / 44100 + ph + c); o[i] = y; } return o; });
      const up = R(X, 44100, 48000), back = R(up, 48000, 44100, n);
      const sine = (f, sr, m) => { const o = new Float32Array(m); for (let i = 0; i < m; i++) o[i] = 0.5 * Math.sin(2 * Math.PI * f * i / sr); return o; };
      const rms = (a) => { let e = 0; for (let i = 2000; i < a.length - 2000; i++) e += a[i] * a[i]; return Math.sqrt(e / (a.length - 4000)); };
      const alias = 20 * Math.log10(rms(R([sine(23000, 48000, 48000)], 48000, 44100)[0]) / rms(sine(23000, 48000, 48000)));
      const pass19 = 20 * Math.log10(rms(R([sine(19000, 48000, 48000)], 48000, 44100)[0]) / rms(sine(19000, 48000, 48000)));
      const oac = async (ch, from, to, len) => { const b0 = bufOf(ch, from), ctx = new OfflineAudioContext(2, len, to), src = ctx.createBufferSource(); src.buffer = b0; src.connect(ctx.destination); src.start(0); const r = await ctx.startRendering(); return [r.getChannelData(0), r.getChannelData(1)]; };
      const o1 = await oac(X, 44100, 48000, up[0].length), o2 = await oac(o1, 48000, 44100, n);
      return { n, len: up[0].length, alias: +alias.toFixed(1), pass19: +pass19.toFixed(2), sinc: +__snr(X[0], back[0]).toFixed(1), sincR: +__snr(X[1], back[1]).toFixed(1), lag: __lag(X[0], back[0]), oac: +__snr(X[0], o2[0]).toFixed(1),
        steady: (() => { const one = [new Float32Array(20000).fill(0.5)], r = R(one, 48000, 44100)[0]; let m = 0; for (let i = 200; i < r.length - 200; i++) m = Math.max(m, Math.abs(r[i] - 0.5)); return m; })() };
    });
    ok(a.len === Math.round(a.n * 48000 / 44100) && a.sinc > 60 && a.sincR > 60 && a.lag === 0 && a.steady < 1e-6 && a.oac < a.sinc - 20 && a.alias < -70 && a.pass19 > -0.2,
      "A the change of rate is band-limited: a round trip 44.1 → 48 → 44.1 kHz keeps " + a.sinc + " dB (the OfflineAudioContext way: " + a.oac + " dB), no delay; 19 kHz passes, 23 kHz does not fold back; a steady level passes exactly: " + JSON.stringify(a));
    /* the 48 kHz path: the same song at 48 kHz splits like it does at 44.1 kHz; channel order, alignment, the sum */
    a = await p.evaluate(async () => {
      const s = makeSong({ seed: 7, bars: 8 }), n = s.n, R = AOGStems.test.resample, P = ["drums", "bass", "voice"];
      /* every part under 15 kHz (through 32 kHz and back), so what the 48 kHz path keeps is all of the song */
      for (const k of ["drums", "bass", "voice", "other"]) s.parts[k] = R(R(s.parts[k], 44100, 32000), 32000, 44100, n);
      s.mix = [0, 1].map(c => { const o = new Float32Array(n); for (const k of ["drums", "bass", "voice", "other"]) { const a = s.parts[k][c]; for (let i = 0; i < n; i++) o[i] += a[i]; } return o; });
      const b44 = bufOf(s.mix, 44100), q44 = await AOGStems.split(b44, {}), m44 = await AOGStems.clean(b44, { quick: q44 });
      const segs = AOGStems.test.ai.last.segments;
      const X48 = R(s.mix, 44100, 48000), b48 = bufOf(X48, 48000), q48 = await AOGStems.split(b48, {}), m48 = await AOGStems.clean(b48, { quick: q48 });
      const out = { segs, len: m48.length === X48[0].length, sr: m48.sampleRate, parts: {} };
      for (const k of P) { const d = R(__ch(m48, k), 48000, 44100, n), r = __ch(m44, k), t = s.parts[k];
        out.parts[k] = { vs44: +((__snr(r[0], d[0]) + __snr(r[1], d[1])) / 2).toFixed(1), swapped: +((__snr(r[0], d[1]) + __snr(r[1], d[0])) / 2).toFixed(1), lag: __lag(r[0], d[0]),
          sdr44: +sdr(t, r).toFixed(1), sdr48: +sdr(t, d).toFixed(1) }; }
      /* the drums lean right (hats 0.35 / 0.6): the model's left is the song's left */
      const dl = __ch(m48, "drums"), tl = R(s.parts.drums, 44100, 48000); out.drumsLR = [+__snr(tl[0], dl[0]).toFixed(1), +__snr(tl[0], dl[1]).toFixed(1)];
      let se = 0; for (let ch = 0; ch < 2; ch++) { const x = b48.getChannelData(ch), Y = ["drums", "bass", "voice", "other"].map(k => m48[k].getChannelData(ch)); for (let i = 0; i < x.length; i++) se = Math.max(se, Math.abs(Y[0][i] + Y[1][i] + Y[2][i] + Y[3][i] - x[i])); }
      out.sumErr = se; out.check = AOGStems.test.ai.check;
      /* the joins between segments (11 s apart less 1.1 s): the part's error near a join is no bigger than elsewhere, and no click */
      const L = 485100, fade = Math.floor(L / 10), hop = L - fade, J = [hop - fade, 2 * hop - fade].filter(j => j > 0 && j < n - fade);
      out.joins = {};
      for (const k of P) { const r = __ch(m44, k), t = s.parts[k]; let en = 0, nn = 0, el = 0, ne = 0, click = 0;
        const near = new Uint8Array(n); for (const j of J) for (let i = Math.max(0, j - 2205); i < Math.min(n, j + fade + 2205); i++) near[i] = 1;
        for (let ch = 0; ch < 2; ch++) for (let i = 3000; i < n - 3000; i++) { const e = r[ch][i] - t[ch][i]; if (near[i]) { en += e * e; nn++; } else { el += e * e; ne++; } }
        const step = (at) => { let mx = 0, e = 0; for (let i = at - 2048; i < at + 2048; i++) { const d2 = Math.abs(r[0][i + 1] - 2 * r[0][i] + r[0][i - 1]); e += d2 * d2; if (i >= at - 64 && i < at + 64) mx = Math.max(mx, d2); } return mx / (Math.sqrt(e / 4096) + 1e-9); };
        const other = []; for (let q = 1; q <= 40; q++) other.push(step(Math.round(5000 + q * (n - 10000) / 41))); other.sort((x, y) => x - y);
        for (const j of J) for (const at of [j, j + fade]) click = Math.max(click, step(at) / other[20]);
        out.joins[k] = { dB: +(10 * Math.log10((en / nn) / (el / ne))).toFixed(1), click: +click.toFixed(2) }; }
      out.nJoins = J.length;
      window.__m44 = m44; window.__q44 = q44;
      return out; });
    const pr = a.parts;
    ok(a.segs >= 3 && a.len && a.sr === 48000 && ["drums", "bass", "voice"].every(k => pr[k].vs44 >= 30 && pr[k].lag === 0 && pr[k].swapped < pr[k].vs44 - 3 && pr[k].sdr48 >= pr[k].sdr44 - 1),
      "A at 48 kHz (an iPad) the model's parts are the 44.1 kHz ones (≥ 30 dB alike), not swapped left for right, not one sample off, and as close to the true parts: " + JSON.stringify(pr));
    ok(a.drumsLR[0] > a.drumsLR[1] && a.sumErr < 1e-4, "A the left channel stays left (the drums lean right in this song), and the four parts add back to the 48 kHz song: " + JSON.stringify({ lr: a.drumsLR, sum: a.sumErr }));
    ok(a.nJoins >= 2 && Object.values(a.joins).every(j => j.dB <= 3 && j.click < 2.5), "A the joins between segments: no bigger error near a join than elsewhere, and no click: " + JSON.stringify(a.joins));
    ok(a.check && !a.check.worse && a.check.m.excess < 1.5 && a.check.m.clip === 0, "A the checks pass a good split (its parts add up to about the song, nothing clips): " + JSON.stringify(a.check));
    /* the self-test, on WebAssembly here (on a GPU it always runs) */
    a = await p.evaluate(async () => { const s = makeSong({ seed: 5, bars: 3 }), buf = bufOf(s.mix, 44100), q = await AOGStems.split(buf, {});
      AOGStems.test.ai.selftestAll = true; AOGStems.test.ai.selftest = null; const m = await AOGStems.clean(buf, { quick: q }); AOGStems.test.ai.selftestAll = false;
      return { self: AOGStems.test.ai.selftest, q: m.quality }; });
    ok(a.q === "model" && a.self && a.self.ok && a.self.db >= 60, "A the self-test: a fixed input through all ten stages gives the stored answers (worst " + (a.self && a.self.db) + " dB alike): " + JSON.stringify(a.self));
    /* a split that checks worse than the quick one: the quick parts stay, said plainly */
    a = await p.evaluate(async () => { const s = makeSong({ seed: 9, bars: 3 }), buf = bufOf(s.mix, 44100), q = await AOGStems.split(buf, {}), out = {};
      AOGStems.test.ai.fakeWorse = true; try { await AOGStems.clean(buf, { quick: q }); out.r = "finished"; } catch (e) { out.r = e.kept && e.worse ? "kept" : e.message; out.check = e.check; } AOGStems.test.ai.fakeWorse = false;
      out.en = AOGStems.word("cleanWorse", "en"); out.es = AOGStems.word("cleanWorse", "es"); return out; });
    ok(a.r === "kept" && a.check && a.check.worse && a.en === "The quick parts sounded better here, so they stay." && a.es === "Aquí las partes rápidas sonaban mejor, así que se quedan.",
      "A when the model's split checks worse than the quick one (faked: its voice upside down), the quick parts stay, said plainly: " + JSON.stringify(a));
    /* both splits kept */
    a = await p.evaluate(async () => { const m = window.__m44, q = window.__q44; await AOGStems.keep("t|real", m);
      const meta = await AOGStems.has("t|real"), cl = await AOGStems.keptParts("t|real", { sr: 44100, len: m.length }), qk = await AOGStems.keptParts("t|real", { sr: 44100, len: m.length }, "quick");
      const same = (x, y) => { const X = Array.isArray(x) ? x : [x], Y = Array.isArray(y) ? y : [y]; return X.length === Y.length && X.every((a, i) => a.length === Y[i].length && a.every((v, j) => v === Y[i][j])); };
      const r = { meta: meta.hasQuick, clean: cl.quality, hasQuick: cl.hasQuick, quick: qk.quality, cmp: qk.cmpQuick, d: same(qk.d, q.pack.d), b: same(qk.b, q.pack.b), v: same(qk.v, q.pack.v), mv: same(cl.v, m.pack.v) };
      await AOGStems.drop("t|real"); return r; });
    ok(a.meta && a.clean === "model" && a.hasQuick && a.quick === "listen" && a.cmp && a.d && a.b && a.v && a.mv, "A both splits are kept with the song: the model's, and the quick one exactly as it was: " + JSON.stringify(a));
    await c.close();
  }

  /* ══ B · WebGPU (SwiftShader) ══ */
  if (ONLY.includes("B")) {
    const gb = await pw.chromium.launch({ args: ["--enable-unsafe-webgpu", "--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
    const c = await gb.newContext(); watch(c); await routes(c);
    const p = await c.newPage(); const notes = []; p.on("console", m => { if (/aog-stems/.test(m.text())) notes.push(m.type() + ": " + m.text()); });
    await p.goto(U(P2) + "__h.html"); await p.addScriptTag({ content: LIB });
    const a = await p.evaluate(async () => {
      const ad = navigator.gpu ? await navigator.gpu.requestAdapter() : null;
      if (!ad) return { adapter: false };
      const s = makeSong({ seed: 3, bars: 2 }), buf = bufOf(s.mix, 44100), q = await AOGStems.split(buf, {});
      AOGStems.test.ai.fakeGPU = "half"; AOGStems.test.ai.selftest = null;
      const t0 = performance.now(), m = await AOGStems.clean(buf, { quick: q }), ms = Math.round(performance.now() - t0); AOGStems.test.ai.fakeGPU = "";
      return { adapter: true, lim: ad.limits.maxStorageBufferBindingSize, ms, q: m.quality, ep: AOGStems.test.ai.last.ep, why: AOGStems.test.ai.gpuWhy, self: AOGStems.test.ai.selftest,
        voice: +sdr(s.parts.voice, __ch(m, "voice")).toFixed(1), quick: +sdr(s.parts.voice, __ch(q, "voice")).toFixed(1) }; });
    if (!a.adapter) ok(true, "B (no WebGPU adapter in this Chromium: skipped)");
    else {
      ok(a.q === "model" && a.ep === "wasm" && /^selftest s0\.x/.test(a.why) && a.self && a.self.ok === false && a.voice > a.quick + 3,
        `B a GPU that gives a wrong answer (faked: half of a stage cut off) fails the self-test, and the parts are made with WebAssembly instead (${a.ms} ms; the voice ${a.quick} → ${a.voice} dB): ` + JSON.stringify({ why: a.why, self: a.self, lim: a.lim }));
      ok(notes.length >= 1 && notes.every(n => /^info: aog-stems: the GPU was not used/.test(n)), "B it says why only in the console, quietly (an info line): " + JSON.stringify(notes));
    }
    await gb.close();
  }

  /* ══ C · the Turntables at 48 kHz ══ */
  if (ONLY.includes("C")) {
    const c = await b.newContext({ viewport: { width: 1366, height: 900 } }); watch(c); await routes(c);
    await c.addInitScript(() => { try { localStorage.setItem("aog.decks.bench", "full"); localStorage.setItem("aog.stems.quality.v1", "best"); } catch (e) {}
      const AC = window.AudioContext; if (AC) window.AudioContext = class extends AC { constructor(o) { super(Object.assign({}, o || {}, { sampleRate: 48000 })); } }; });
    const p = await c.newPage(); await p.goto(U(P3) + "music-decks.html"); await p.waitForTimeout(1200);
    await p.addScriptTag({ content: SONG });
    await p.evaluate(async () => { const s = makeSong({ seed: 7, bars: 3 }), d = decks[0]; await loadFile(d, songFile(s, "ipad-song.wav"));
      await new Promise(r => { const t0 = Date.now(), k = setInterval(() => { if (d.bpm !== -1 || Date.now() - t0 > 8000) { clearInterval(k); r(); } }, 50); }); });
    await p.click('[data-psplit="A"]');
    await p.waitForFunction(() => decks[0].parts.model === true, null, { timeout: 300000 });
    await p.click('[data-part="A"][data-k="drums"]');   /* the drums quiet: it stays quiet through the swap */
    await p.evaluate(() => { const mo = document.querySelector("#deckA .dmore"); if (mo && !mo.open) mo.querySelector("summary").click(); });
    await p.waitForTimeout(300);
    const region = () => p.evaluate(async () => { const d = decks[0]; const r = await partsRegion(d, Math.round(0.5 * d.buf.sampleRate), 24000); return r ? Array.from(r.L.subarray(0, 24000)) : null; });
    let a = await p.evaluate(() => { const g = document.querySelector('[data-pmore="A"] .phear'); return { sr: decks[0].buf.sampleRate, line: document.querySelector('[data-pline="A"]').textContent,
      hear: g ? [...g.children].map(e => e.textContent + (e.getAttribute("aria-pressed") === "true" ? "*" : "")).join(" ") : null, h: g ? Math.round(g.querySelector("button").getBoundingClientRect().height) : 0 }; });
    ok(a.sr === 48000 && a.line === "The parts are cleaner now." && a.hear === "Hear: Quick parts Clean parts*" && a.h >= 44, "C at 48 kHz the record is split and cleaned; More has Hear: Quick parts · Clean parts, on Clean, a finger high: " + JSON.stringify(a));
    const r1 = await region();
    await p.click('[data-phear="A"][data-v="quick"]');
    await p.waitForFunction(() => decks[0].parts.hear === "quick", null, { timeout: 10000 });
    await p.waitForTimeout(300);
    const r2 = await region();
    a = await p.evaluate(async ([r1, r2]) => { const d = decks[0], id = partsId(d), S = 1 / 32767, a0 = Math.round(0.5 * d.buf.sampleRate), x = d.buf.getChannelData(0);
      const cl = await AOGStems.keptParts(id, { sr: d.buf.sampleRate, len: d.buf.length }), qk = await AOGStems.keptParts(id, { sr: d.buf.sampleRate, len: d.buf.length }, "quick");
      const pc = (v) => Array.isArray(v) ? v[0] : v, want = (raw) => r1.map((_, i) => x[a0 + i] - pc(raw.d)[a0 + i] * S);   /* the drums quiet: the record less the drums */
      const diff = (y, z) => { let m = 0; for (let i = 0; i < y.length; i++) m = Math.max(m, Math.abs(y[i] - z[i])); return m; };
      const g = document.querySelector('[data-pmore="A"] .phear');
      return { clean: diff(r1, want(cl)), quick: diff(r2, want(qk)), differ: diff(r1, r2), g: decks[0].parts.g, model: decks[0].parts.model, pressed: [...g.querySelectorAll("button")].map(b => b.getAttribute("aria-pressed")).join(",") }; }, [r1, r2]);
    ok(a.clean < 1e-4 && a.quick < 1e-4 && a.differ > 1e-3 && a.g.drums === 0 && a.model && a.pressed === "true,false",
      "C Hear: Quick parts puts the quick split in the deck's engine (the record less the quick drums, as the drums are still quiet), Clean parts the model's: " + JSON.stringify(a));
    await p.click('[data-phear="A"][data-v="clean"]'); await p.waitForFunction(() => decks[0].parts.hear === "clean", null, { timeout: 10000 });
    /* Spanish */
    await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(300);
    a = await p.evaluate(() => { const g = document.querySelector('[data-pmore="A"] .phear'); return g ? [...g.children].map(e => e.textContent).join(" ") + " | " + g.getAttribute("aria-label") : null; });
    ok(a === "Oír: Partes rápidas Partes limpias | Oír:", "C in Spanish: " + a);
    await p.evaluate(() => document.getElementById("langBtn").click());
    await c.close();
    /* check-silent on the pages the split lives in */
    let out = "", code = 0; try { out = cp.execSync("node " + path.join(ROOT, "..", "tools", "check-silent.js") + " music-decks.html music-studio.html the-studio.html", { encoding: "utf8", timeout: 600000 }); } catch (e) { out = (e.stdout || "") + (e.stderr || ""); code = e.status || 1; }
    ok(code === 0, "C check-silent on the Turntables, the Mixing Desk and the Studio: " + (out.trim().split("\n").pop() || ""));
  }

  ok(!errs.length, "no page errors" + (errs.length ? ": " + errs.slice(0, 5).join(" | ") : ""));
  await b.close(); srv.forEach(s => s.close());
  console.log(fails ? `${fails} FAILED` : "all passed");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + (e && e.stack || e)); process.exit(1); });
