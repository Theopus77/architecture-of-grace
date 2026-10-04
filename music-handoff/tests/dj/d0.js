/* The turntables' sound engine and their four records, in Node (no browser, no port): the deck core in
   aog-vinyl-worklet.js (loops, pads on the beat, slip), the effects (echo, flanger and reverb in beats), the
   brickwall limiter, and the crate made in aog-dj.js (tempo by style, length, level, clean loop points). */
const path = require("path");
const W = process.env.AOG_ROOT || path.join(__dirname, "../../../aog-deploy");
const { VinylCore, DJFxCore, DJLimitCore } = require(path.join(W, "aog-vinyl-worklet.js"));
const DJ = require(path.join(W, "aog-dj.js"));
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const SR = 48000, BSR = 44100;

/* a test record: a 124 BPM click track over two tones that never line up with the beat */
function record(sec, bpm) {
  const n = Math.round(sec * BSR), L = new Float32Array(n), R = new Float32Array(n), beat = 60 / bpm * BSR;
  for (let i = 0; i < n; i++) { const t = i / BSR; L[i] = R[i] = 0.3 * Math.sin(2 * Math.PI * 97.3 * t) + 0.2 * Math.sin(2 * Math.PI * 1234.5 * t); }
  for (let b = 0; b * beat < n; b++) { const i0 = Math.round(b * beat); for (let j = 0; j < 600 && i0 + j < n; j++) { const v = 0.5 * Math.exp(-j / 80) * Math.sin(j * 0.3); L[i0 + j] += v; R[i0 + j] += v; } }
  return { L, R, beat };
}
function run(core, blocks) { const oL = new Float32Array(128), oR = new Float32Array(128), out = new Float32Array(blocks * 128); for (let b = 0; b < blocks; b++) { core.process(oL, oR, 128); out.set(oL, b * 128); } return out; }
function maxStep(y, from, to) { let m = 0; for (let i = Math.max(1, from); i < Math.min(y.length, to); i++) m = Math.max(m, Math.abs(y[i] - y[i - 1])); return m; }

{ /* 1 · a loop comes round without a click */
  const r = record(20, 124), c = new VinylCore(SR); c.noiseAmt = 0;
  c.msg({ t: "buf", L: r.L, R: r.R, sr: BSR }); c.msg({ t: "motor", on: true, instant: true });
  run(c, 200);
  c.msg({ t: "bloop", b0: 0, len: r.beat, n: 1 });
  const before = c.wraps, y = run(c, 2000);
  const plainStep = maxStep(r.L, 1, r.L.length), loopStep = maxStep(y, 10, y.length);
  const seam = Math.abs(r.L[Math.floor(c.loopB)] - r.L[Math.floor(c.loopA)]);
  ok(c.wraps - before > 5 && loopStep <= plainStep * 1.15,
    `a 1-beat loop on sound that never repeats wraps ${c.wraps - before} times; its steepest step ${loopStep.toFixed(4)} is no bigger than the record's own ${plainStep.toFixed(4)} (a hard seam would step ${seam.toFixed(4)})`);
}
{ /* 2 · a pad waits for the next beat line, or jumps at once (phase kept) when pressed just after one */
  const r = record(20, 124), c = new VinylCore(SR); c.noiseAmt = 0;
  c.msg({ t: "buf", L: r.L, R: r.R, sr: BSR }); c.msg({ t: "motor", on: true, instant: true });
  run(c, 300);
  const cue = 8 * r.beat;
  c.msg({ t: "qjump", to: cue, b0: 0, len: r.beat, late: 0.03 * BSR });
  const waited = !!c.pend;
  run(c, 200);
  const j = c.lastJump, k = j ? j.at / r.beat : NaN;
  ok(waited && j && Math.abs(k - Math.round(k)) < 1e-9 && j.over >= 0 && j.over < 2 && Math.abs(j.to - cue) < 1e-6,
    `a pad pressed between beats waits, then jumps on beat ${k.toFixed(6)} (${j ? j.over.toFixed(3) : "?"} samples past the line) to its mark`);
  const c2 = new VinylCore(SR); c2.noiseAmt = 0; c2.msg({ t: "buf", L: r.L, R: r.R, sr: BSR }); c2.msg({ t: "motor", on: true, instant: true });
  while (c2.pos < 3 * r.beat + 0.010 * BSR) run(c2, 1);
  const into = c2.pos - 3 * r.beat;
  c2.msg({ t: "qjump", to: cue, b0: 0, len: r.beat, late: 0.03 * BSR });
  ok(!c2.pend && Math.abs(c2.pos - (cue + into)) < 1e-6, `a pad pressed ${(into / BSR * 1000).toFixed(1)} ms after a beat jumps at once, to its mark + ${(into / BSR * 1000).toFixed(1)} ms (still on the beat)`);
}
{ /* 3 · SLIP: a chop, then back where the record would have been */
  const r = record(30, 124), c = new VinylCore(SR); c.noiseAmt = 0;
  c.msg({ t: "buf", L: r.L, R: r.R, sr: BSR }); c.msg({ t: "slip", on: true }); c.msg({ t: "motor", on: true, instant: true });
  run(c, 300);
  c.msg({ t: "qjump", to: 20 * r.beat, b0: 0, len: r.beat, late: 0 });
  c.msg({ t: "qret", b0: 0, len: r.beat });
  const p0 = c.pos; run(c, 900);
  const expect = p0 + 900 * 128 * (BSR / SR);
  ok(!c.div && Math.abs(c.pos - expect) < 2, `SLIP: after a one-beat chop the record is where it would have been (${(c.pos - expect).toFixed(3)} samples off)`);
}
{ /* 4 · the effects keep time in beats */
  for (const [bpm, beats] of [[124, 0.75], [90, 0.5], [132, 1]]) {
    const fx = new DJFxCore(SR), bs = 60 / bpm;
    fx.msg({ t: "fx", type: "echo", amt: 1, beatSec: bs, beats: { echo: beats } });
    const n = Math.round(SR * 3), inL = new Float32Array(n), inR = new Float32Array(n), oL = new Float32Array(n), oR = new Float32Array(n);
    const t0 = 2400; inL[t0] = inR[t0] = 1;
    for (let o = 0; o < n; o += 128) fx.process(inL.subarray(o, o + 128), inR.subarray(o, o + 128), oL.subarray(o, o + 128), oR.subarray(o, o + 128), Math.min(128, n - o));
    let pk = 0, at = 0; for (let i = t0 + 50; i < n; i++) { if (Math.abs(oL[i]) > pk) { pk = Math.abs(oL[i]); at = i; } }
    const want = beats * bs * SR;
    ok(Math.abs((at - t0) - want) < 3, `ECHO at ${bpm} BPM, ${beats} beat: the first repeat comes ${((at - t0) / SR * 1000).toFixed(2)} ms after the sound (${(want / SR * 1000).toFixed(2)} ms wanted)`);
  }
  const fx = new DJFxCore(SR); fx.msg({ t: "fx", type: "flanger", amt: 1, beatSec: 60 / 124, beats: { flanger: 16 } });
  ok(Math.abs(fx.fPeriod - 16 * 60 / 124 * SR) < 1, `FLANGER: one sweep every 16 beats (${(fx.fPeriod / SR).toFixed(3)} s at 124 BPM)`);
  fx.msg({ t: "fx", type: "reverb", beats: { reverb: 4 } });
  ok(Math.abs(fx.rt - 4 * 60 / 124) < 1e-9, `REVERB: rings for 4 beats (${fx.rt.toFixed(3)} s at 124 BPM)`);
}
{ /* 5 · the limiter at the end of the mix: nothing over the ceiling, quiet music untouched */
  const lim = new DJLimitCore(SR), n = SR * 4, inL = new Float32Array(n), inR = new Float32Array(n), oL = new Float32Array(n), oR = new Float32Array(n);
  let s = 12345; const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  for (let i = 0; i < n; i++) { const t = i / SR, g = t < 2 ? 4 : 0.3; inL[i] = g * (0.6 * Math.sin(2 * Math.PI * 55 * t) + 0.4 * (rnd() * 2 - 1) * (i % 9000 < 300 ? 1 : 0.2)); inR[i] = inL[i] * 0.9; }
  for (let o = 0; o < n; o += 128) lim.process(inL.subarray(o, o + 128), inR.subarray(o, o + 128), oL.subarray(o, o + 128), oR.subarray(o, o + 128), 128);
  let pk = 0; for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(oL[i]), Math.abs(oR[i]));
  ok(pk <= lim.ceil + 1e-6, `LIMITER: sound 12 dB over full scale comes out peaking at ${(20 * Math.log10(pk)).toFixed(2)} dBFS (ceiling ${(20 * Math.log10(lim.ceil)).toFixed(2)})`);
  let dmax = 0; for (let i = n - SR / 2; i < n; i++) dmax = Math.max(dmax, Math.abs(oL[i] - inL[i - lim.L]));
  ok(dmax < 1e-6, `and a quiet passage comes through unchanged (largest difference ${dmax.toExponential(1)}), ${(lim.L / SR * 1000).toFixed(2)} ms late`);
  let flat = 0; for (let i = 1; i < n; i++) if (Math.abs(oL[i]) > lim.ceil - 1e-7 && Math.abs(oL[i - 1]) > lim.ceil - 1e-7 && Math.sign(oL[i]) === Math.sign(oL[i - 1])) flat++;
  ok(flat < 3, `no squared-off, clipped peaks (${flat})`);
}
{ /* 6 · the crate made on the page */
  const RANGE = { house: [120, 128], techno: [128, 135], triphop: [85, 95], disco: [115, 125] };
  const STEADY = { house: true, techno: true, triphop: false, disco: true };   /* a trip-hop break swings across two bars */
  for (const x of DJ.list) {
    const t0 = Date.now(), r = DJ.render(x.id), ms = Date.now() - t0, sr = r.sr, N = Math.round(4 * 60 / r.bpm * sr), sec = r.L.length / sr;
    let pk = 0; for (let i = 0; i < r.L.length; i++) pk = Math.max(pk, Math.abs(r.L[i]), Math.abs(r.R[i]));
    const lufs = DJ.loudness(r.L, r.R, sr);
    const diff = (k1, k2) => { let d = 0, e = 1e-12; for (let i = 0; i < N; i++) { d = Math.max(d, Math.abs(r.L[k1 * N + i] - r.L[k2 * N + i]), Math.abs(r.R[k1 * N + i] - r.R[k2 * N + i])); e = Math.max(e, Math.abs(r.L[k1 * N + i])); } return d === 0 ? -Infinity : 20 * Math.log10(d / e); };
    const four = Math.max(diff(1, 5), diff(2, 6), diff(3, 7)), one = STEADY[x.id] ? Math.max(diff(1, 2), diff(2, 3), diff(3, 4)) : -Infinity;
    const db = v => v === -Infinity ? "exact" : v.toFixed(0) + " dB";
    ok(r.bpm >= RANGE[x.id][0] && r.bpm <= RANGE[x.id][1] && sec >= 120 && r.beat0 === 0 && r.L.length >= r.bars * N,
      `${x.en || x.id}: ${r.bpm} BPM (${RANGE[x.id].join("–")} for the style), ${sec.toFixed(1)} s, ${r.bars} bars of exactly ${N} samples and a ${((r.L.length - r.bars * N) / sr).toFixed(2)} s ring-out, beat one at the very start (made in ${ms} ms)`);
    ok(Math.abs(lufs + 14) < 0.5 && pk < Math.pow(10, -0.9 / 20), `${x.en || x.id}: level ${lufs.toFixed(1)} LUFS (−14 wanted), peak ${(20 * Math.log10(pk)).toFixed(2)} dBFS`);
    ok(four < -120 && one < -120, `${x.en || x.id}: in the opening phrase a 4-bar loop comes round ${db(four)}` + (STEADY[x.id] ? `, a 1-bar loop ${db(one)}` : "") + " from the record playing on");
  }
}
console.log(fails ? fails + " FAILED" : "ALL PASS");
process.exit(fails ? 1 : 0);
