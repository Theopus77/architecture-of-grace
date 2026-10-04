/* Shared parts for the turntables' DJ suites (dj/d1 … dj/d5; dj/d0 runs in Node alone): a browser, a page with
   records on it, a take decoded. Each suite has its own port (9930–9934). The pages come from $AOG_ROOT (default:
   the repo's aog-deploy). */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const done = () => { console.log(fails ? fails + " FAILED" : "ALL PASS"); return fails; };
async function open(port, opts) {
  opts = opts || {};
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const c = await b.newContext(Object.assign({ viewport: { width: 1280, height: 900 } }, opts.device || {}, opts.ctx || {}));
  await c.addInitScript(([bench, lang, th]) => { try { localStorage.setItem("aog.decks.bench", bench); if (lang) localStorage.setItem("aog.lang", lang);
    if (th) { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } } catch (e) {} },
    [opts.bench || "full", opts.lang || "", opts.theme || ""]);
  const p = await c.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message));
  await p.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await p.goto(`http://localhost:${port}/music-decks.html` + (opts.hash || "")); await p.waitForTimeout(1200);
  return { b, c, p, errs };
}
/* put records made on the page onto decks: { A:"house", B:"disco", … } */
async function load(p, which) {
  await p.evaluate(w => { Object.keys(w).forEach(id => loadMade(decks.find(d => d.id === id), w[id])); }, which);
  await p.waitForFunction(w => Object.keys(w).every(id => { const d = decks.find(x => x.id === id); return d.buf && d.bpm > 0 && d.made === w[id] && (d.node || d.core); }), which, { timeout: 60000 });
}
/* the deck's reported position and the audio-clock frame it belongs to */
const snap = (p, id) => p.evaluate(id => { const d = decks.find(x => x.id === id); return { pos: d.pos, frame: d.frame, bpm: d.bpm, sr: d.buf.sampleRate, csr: actx.sampleRate, g0: d.beat0 * d.buf.sampleRate, eff: effBpm(d), pitch: d.pitch, bend: d.bend }; }, id);
/* the tempo a deck REALLY played at between two reports: beats travelled ÷ minutes of audio clock */
function realBpm(a, b) { const beats = (b.pos - a.pos) / (60 / a.bpm * a.sr), min = (b.frame - a.frame) / a.csr / 60; return beats / min; }
/* record the mix with the turntables' own Record button for `ms`, and give the take back as numbers */
async function take(p, ms) {
  await p.click("#recBtn"); await p.waitForTimeout(ms); await p.click("#recBtn"); await p.waitForTimeout(600);
  return p.evaluate(async () => {
    const k = TAPE.takes[0]; if (!k) return null;
    const ab = await k.blob.arrayBuffer(); const v = new DataView(ab); const n = (ab.byteLength - 44) / 4, sr = v.getUint32(24, true);
    const L = new Float32Array(n), R = new Float32Array(n);
    for (let i = 0; i < n; i++) { L[i] = v.getInt16(44 + i * 4, true) / 32768; R[i] = v.getInt16(46 + i * 4, true) / 32768; }
    window.__take = { L, R, sr };
    let pk = 0, flat = 0; for (let i = 1; i < n; i++) { const a = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (a > pk) pk = a; if (a > 0.9999 && Math.abs(L[i - 1]) > 0.9999) flat++; }
    let s = 0; for (let i = 0; i < n; i++) s += L[i] * L[i];
    return { n, sr, sec: n / sr, peak: pk, flat, rms: 10 * Math.log10(s / n + 1e-20) };
  });
}
module.exports = { pw, ok, done, open, load, snap, realBpm, take };
