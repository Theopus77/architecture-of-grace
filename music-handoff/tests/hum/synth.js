/* AOG-HUM-V1 tests: made-up voices and mouth drums with known answers (no real recording needed).
   melody(o): a hummed or sung tune. o = { notes:[[midi, beats], …] (midi null = a rest), bpm, sr, lead (s of quiet before),
     style: "hum" (legato: one breath, the pitch steps with a short glide) | "la" (each note sung "la": the sound dips
     for the l) | "apart" (a breath of air between notes), vib (semitones, ±), cents (the whole tune sharp or flat),
     breath (noise level, 0..1 of the voice), seed }
   It also returns the truth: [{t, d, m}] in seconds of the sound.
   beatbox(o): o = { hits:[[kind "k"|"s"|"h", beat], …], bpm, sr, lead }: boom (a low voiced thump), ka (a short mid noise
     burst with a click) and tss (a hiss), and the truth [{t, k}].
   wav(x, sr): a mono 16-bit .wav. */
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function melody(o) {
  const sr = o.sr || 48000, bpm = o.bpm || 100, beat = 60 / bpm, lead = o.lead == null ? 0.6 : o.lead, style = o.style || "hum";
  const vib = o.vib == null ? 0.35 : o.vib, cents = o.cents || 0, breath = o.breath == null ? 0.06 : o.breath, R = rng(o.seed || 7);
  const rush = o.rush || 0;   /* each onset a little early or late, at random up to this many seconds (a person, not a clock) */
  let total = 0; o.notes.forEach(n => total += n[1] * beat);
  const len = Math.ceil((lead + total + (o.tail == null ? 1.2 : o.tail)) * sr), x = new Float32Array(len), truth = [];
  let t = lead; const segs = [];
  o.notes.forEach(n => { const d = n[1] * beat; if (n[0] != null) segs.push({ t, d, m: n[0], b: (t - lead) / beat }); t += d; });
  if (rush) segs.forEach((s, i) => { if (i === 0) return; const j = (R() * 2 - 1) * rush, prev = segs[i - 1]; const legato = Math.abs(prev.t + prev.d - s.t) < 1e-6; s.t += j; s.d -= j; if (legato) prev.d += j; });
  segs.forEach(s => truth.push({ t: s.t, d: s.d, m: s.m, b: s.b }));
  let ph = 0, lp = 0, hp = 0;
  const glide = 0.05, gap = style === "apart" ? 0.07 : 0;
  for (let i = 0; i < len; i++) {
    const tt = i / sr; let k = -1;
    for (let j = 0; j < segs.length; j++) if (tt >= segs[j].t && tt < segs[j].t + segs[j].d) { k = j; break; }
    let amp = 0, m = segs.length ? segs[0].m : 60;
    if (k >= 0) {
      const s = segs[k], u = tt - s.t, left = s.t + s.d - tt, prev = segs[k - 1], legato = style !== "apart" && prev && Math.abs(prev.t + prev.d - s.t) < 1e-6;
      m = s.m;
      if (legato && u < glide) m = prev.m + (s.m - prev.m) * (0.5 - 0.5 * Math.cos(Math.PI * u / glide));
      if (u > 0.12) m += vib * Math.sin(2 * Math.PI * 5.5 * (u - 0.12)) * Math.min(1, (u - 0.12) / 0.2);
      m += 0.15 * Math.sin(2 * Math.PI * 0.7 * tt);   /* a voice wanders a little */
      const att = legato ? 1 : Math.min(1, u / 0.03);
      const nextLeg = style !== "apart" && segs[k + 1] && Math.abs(s.t + s.d - segs[k + 1].t) < 1e-6;
      const rel = nextLeg ? 1 : Math.max(0, Math.min(1, (left - gap) / 0.04));
      amp = 0.5 * att * rel;
      if (style === "la" && legato) { const dip = u < 0.06 ? 0.12 + 0.88 * (0.5 - 0.5 * Math.cos(Math.PI * u / 0.06)) : 1; amp *= dip; }
    }
    const f = 440 * Math.pow(2, (m + cents / 100 - 69) / 12);
    ph += 2 * Math.PI * f / sr;
    let v = 0; for (let h = 1; h <= 8; h++) v += Math.sin(h * ph) / Math.pow(h, 1.6);
    const n = R() * 2 - 1; lp += 0.25 * (n - lp); hp = n - lp;
    let air = breath * (amp > 0 ? amp : 0) * hp;
    /* a breath between notes (an "h"), and a little room hiss */
    if (k < 0 && segs.some(s => tt >= s.t - 0.12 && tt < s.t)) air += 0.03 * hp;
    x[i] = amp * v * 0.8 + air + 0.0015 * n;
  }
  return { x, sr, truth, beat, lead };
}
/* a band-pass (RBJ biquad), twice over, so the band is a band */
function band(sr, f0, Q) {
  const w = 2 * Math.PI * f0 / sr, al = Math.sin(w) / (2 * Q), a0 = 1 + al, b0 = al / a0, b2 = -al / a0, a1 = -2 * Math.cos(w) / a0, a2 = (1 - al) / a0;
  const st = [[0, 0, 0, 0], [0, 0, 0, 0]];
  return x => { for (const z of st) { const y = b0 * x + b2 * z[1] - a1 * z[2] - a2 * z[3]; z[1] = z[0]; z[0] = x; z[3] = z[2]; z[2] = y; x = y; } return x * 3; };
}
function beatbox(o) {
  const sr = o.sr || 48000, bpm = o.bpm || 100, beat = 60 / bpm, lead = o.lead == null ? 0.6 : o.lead, R = rng(o.seed || 11);
  let last = 0; o.hits.forEach(h => last = Math.max(last, h[1]));
  const len = Math.ceil((lead + (last + 1) * beat + (o.tail == null ? 1 : o.tail)) * sr), x = new Float32Array(len), truth = [];
  o.hits.forEach(([k, b]) => {
    const t0 = lead + b * beat, i0 = Math.round(t0 * sr); truth.push({ t: t0, k, b });
    let ph = 0, lp = 0;
    const bq = { s: band(sr, o.snareHz || 2200, 1.2), h: o.hatHz ? band(sr, o.hatHz, 1.5) : null };   /* another mouth: ka and tss lower (o.snareHz, o.hatHz) */
    const dur = k === "k" ? 0.18 : k === "s" ? 0.14 : 0.12, g = o.gain || 1;
    for (let i = 0; i < dur * sr && i0 + i < len; i++) {
      const u = i / sr, n = R() * 2 - 1; let v = 0;
      if (k === "k") {   /* boom: a voiced thump falling 160 → 90 Hz, a soft lip click */
        const f = 90 + 70 * Math.exp(-u / 0.03); ph += 2 * Math.PI * f / sr;
        v = (Math.sin(ph) + 0.35 * Math.sin(2 * ph) + 0.15 * Math.sin(3 * ph)) * Math.min(1, u / 0.004) * Math.exp(-u / 0.07) * 0.7;
        if (u < 0.004) v += 0.25 * n;
      } else if (k === "s") {   /* ka: a short burst of breath shaped by the mouth, around 1.5–3 kHz */
        const y = bq.s(n);
        v = 0.9 * y * Math.min(1, u / 0.002) * Math.exp(-u / 0.045);
        ph += 2 * Math.PI * 700 / sr; v += 0.05 * Math.sin(ph) * Math.exp(-u / 0.03);
      } else {   /* tss: a hiss over 5 kHz */
        lp += 0.6 * (n - lp); const hi = bq.h ? bq.h(n) * 0.5 : n - lp;
        v = 0.7 * hi * Math.min(1, u / 0.003) * Math.exp(-u / 0.05);
      }
      const fade = Math.min(1, (dur - u) / 0.01);   /* no click where it ends */
      x[i0 + i] += v * g * fade;
    }
  });
  for (let i = 0; i < len; i++) x[i] += 0.001 * (R() * 2 - 1);
  return { x, sr, truth, beat, lead };
}
function wav(x, sr) {
  const n = x.length, b = Buffer.alloc(44 + n * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767))), 44 + i * 2);
  return b;
}
module.exports = { melody, beatbox, wav };
