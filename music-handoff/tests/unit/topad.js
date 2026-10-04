/* toPad (aog-recorder.js) in node: a take .wav in, a pad's PCM out. Checks the band-limiting (no aliasing), the level,
   the leading-silence trim, the 2.5 s cap, the trailing trim and the end fade. */
const fs = require("fs"), vm = require("vm");
const WT = process.env.AOG_ROOT || require("path").resolve(__dirname,"../../../aog-deploy");
const src = fs.readFileSync(WT + "/aog-recorder.js", "utf8");
const win = {}; const sandbox = { window: win, location: { pathname: "/music-guitar.html" }, document: {}, Blob, DataView, Int16Array, Float32Array, Math, Promise, console };
vm.createContext(sandbox); vm.runInContext(src, sandbox);
const toPad = win.AOGRecorder.toPad;
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
function wav(L, R, sr) {
  const n = L.length, h = Buffer.alloc(44), d = Buffer.alloc(n * 4);
  h.write("RIFF", 0); h.writeUInt32LE(36 + n * 4, 4); h.write("WAVE", 8); h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(sr, 24); h.writeUInt32LE(sr * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(n * 4, 40);
  const c = v => Math.max(-32768, Math.min(32767, Math.round(v * 32767)));
  for (let i = 0; i < n; i++) { d.writeInt16LE(c(L[i]), i * 4); d.writeInt16LE(c(R[i]), i * 4 + 2); }
  return new Blob([h, d], { type: "audio/wav" });
}
function tone(sr, sec, hz, amp, lead) { const n = Math.round(sec * sr), o = new Float32Array(n), s0 = Math.round((lead || 0) * sr); for (let i = s0; i < n; i++) o[i] = amp * Math.sin(2 * Math.PI * hz * (i - s0) / sr); return o; }
function rmsAt(y, hz, sr) { /* the level of one frequency in y (a single-bin DFT over the middle of the signal) */
  const a = Math.floor(y.length * 0.2), b = Math.floor(y.length * 0.8); let re = 0, im = 0;
  for (let i = a; i < b; i++) { re += y[i] * Math.cos(2 * Math.PI * hz * i / sr); im += y[i] * Math.sin(2 * Math.PI * hz * i / sr); }
  return 2 * Math.sqrt(re * re + im * im) / (b - a);
}
(async () => {
  for (const sr of [44100, 48000]) {
    /* 1 kHz at half scale, 50 ms of silence first, 1.5 s long */
    const t1 = tone(sr, 1.55, 1000, 0.5, 0.05), y1 = await toPad(wav(t1, t1, sr));
    const first = y1.findIndex(v => Math.abs(v) > 0.002);
    let pk = 0; for (const v of y1) pk = Math.max(pk, Math.abs(v));
    ok(first >= 0 && first <= 40, `${sr}: the leading 50 ms of silence is gone (first sound at sample ${first}, ${(first / 26.04).toFixed(1)} ms)`);
    ok(Math.abs(pk - 0.8) < 0.01, `${sr}: the peak is set to 0.8 (${pk.toFixed(3)})`);
    ok(Math.abs(y1.length / 26040 - 1.5) < 0.02, `${sr}: 1.5 s of sound gives ${(y1.length / 26040).toFixed(3)} s at 26,040 Hz`);
    const k1 = rmsAt(y1, 1000, 26040);
    ok(Math.abs(k1 - 0.8) < 0.02, `${sr}: a 1 kHz tone keeps its level through the change of rate (${k1.toFixed(3)})`);
    /* 15 kHz is above the new limit (13,020 Hz): without a low-pass it would fold back to 26,040 − 15,000 = 11,040 Hz */
    const lo = tone(sr, 1.55, 1000, 0.3, 0.05), hi = tone(sr, 1.55, 15000, 0.3, 0.05), mix = lo.map((v, i) => v + hi[i]);
    const y2 = await toPad(wav(mix, mix, sr));
    const keep = rmsAt(y2, 1000, 26040), alias = rmsAt(y2, 11040, 26040);
    ok(20 * Math.log10(alias / keep) < -60, `${sr}: 15 kHz does not fold back to 11,040 Hz (${(20 * Math.log10(alias / keep)).toFixed(1)} dB below the 1 kHz tone)`);
    /* 12 kHz should pass (under the 45% cut of 11.7 kHz is the pass band; 12 kHz is in the transition), 10 kHz passes */
    const t3 = tone(sr, 1.0, 10000, 0.5, 0.05), y3 = await toPad(wav(t3, t3, sr));
    ok(rmsAt(y3, 10000, 26040) > 0.7, `${sr}: 10 kHz passes (${rmsAt(y3, 10000, 26040).toFixed(3)})`);
    /* 4 s of sound: only the first 2.5 s, and it fades out at the cut */
    const t4 = tone(sr, 4.0, 440, 0.5, 0.05), y4 = await toPad(wav(t4, t4, sr));
    ok(y4.length === Math.floor(2.5 * 26040), `${sr}: a long take keeps the first 2.5 s (${y4.length} samples)`);
    ok(Math.abs(y4[y4.length - 1]) < 1e-6 && Math.abs(y4[y4.length - 260]) < 0.8 * 0.6, `${sr}: the last 20 ms fade out, so the cut does not click`);
    /* a quiet tail is not kept */
    const t5 = tone(sr, 2.0, 440, 0.5, 0.05); for (let i = Math.round(0.85 * sr); i < t5.length; i++) t5[i] = 0;
    const y5 = await toPad(wav(t5, t5, sr));
    ok(Math.abs(y5.length / 26040 - 0.8) < 0.01, `${sr}: 0.8 s of sound and 1.2 s of silence keeps ${(y5.length / 26040).toFixed(3)} s`);
    /* left and right are mixed to one channel */
    const L = tone(sr, 1.0, 1000, 0.5, 0.05), R = new Float32Array(L.length), y6 = await toPad(wav(L, R, sr));
    ok(y6 && Math.abs(rmsAt(y6, 1000, 26040) - 0.8) < 0.02, `${sr}: a sound on one side only still comes through`);
  }
  /* silence: nothing */
  ok((await toPad(wav(new Float32Array(48000), new Float32Array(48000), 48000))) === null, "a silent take gives nothing");
  const t0 = Date.now(); const big = tone(48000, 2.6, 300, 0.5, 0.05); await toPad(wav(big, big, 48000)); const ms = Date.now() - t0;
  ok(ms < 1500, "2.5 s at 48 kHz takes " + ms + " ms");
  console.log(fails ? fails + " FAILED" : "ALL PASS"); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
