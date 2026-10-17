/* AOG-ROOM-PEDALS-V1 (2026-10-11) — Jimmy: "Can the pedals and effects be added to all instruments not just the guitar and
   bass". A pedalboard in the Piano, the Band, the Drum Machine and the Drum Kit: the guitar's panel, starting with no amp
   and every pedal off; each room's own starters first in its menu; the drum rooms' new drum-bus effects (Punch, Tape,
   Filter, Crush). This checks, room by room:
   A · inside the Studio the strip is right under the instrument, the full board after the playing, nothing on, the
       starters first in the menu; iPhone and iPad, light and dark: nothing sideways, it reads (check-contrast) and is
       calm (check-calm), with pedals turned on;
   B · all off is the room exactly as before (offline: the same samples with the rig taken out of the chain, and the Drum
       Machine's Bounce byte for byte); the board idle puts no worklet in the path;
   C · each new drum effect does what it says: Filter cuts the highs, Crush adds steps (quantisation) and holds samples,
       Punch changes the envelope of a hit, Tape adds harmonics (and no aliasing to speak of);
   D · a pedal at its own knobs keeps the room's level within 2 dB (the piano's amps too);
   E · a take recorded with a pedal on carries it (the Drum Kit's Filter, the piano's tremolo), and a Bounce does;
   F · settings stay with each sound (each kit; the whole Drum Machine) after a reload, Put this sound back clears them;
   G · Spanish.
   No page errors. Ports 9272 (the rooms on their own) and 9273 (the Studio). */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs"), path = require("path");
const P1 = 9272, P2 = 9273, U1 = "http://localhost:" + P1 + "/", U2 = "http://localhost:" + P2 + "/";
const srv1 = require("../srv.js")(P1), srv2 = require("../srv.js")(P2);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const TOOLS = path.join(ROOT, "..", "tools");
const cut = (file, name) => { const s = fs.readFileSync(path.join(TOOLS, file), "utf8"), a = s.indexOf("function " + name + "()"), end = "\n  return bad;\n}", e = s.indexOf(end, a); return s.slice(a, e + end.length); };
const PROBE = cut("check-contrast.js", "probe"), CALM = cut("check-calm.js", "calmProbe");
const MEASURE = fs.readFileSync(path.join(__dirname, "../bandt/measure.inc"), "utf8").replace(/^const MEASURE=`/, "").replace(/`;\s*$/, "");
/* small sound tools, put into each page: energy above or below a frequency (RBJ filters, twice), a tone's harmonics */
const DSP = `
window.__band = function(chs, f, type, a, b){ const sr=44100, w=2*Math.PI*f/sr, cw=Math.cos(w), al=Math.sin(w)/(2*0.707);
  const hp=type==="hp", b0=hp?(1+cw)/2:(1-cw)/2, b1=hp?-(1+cw):(1-cw), b2=b0, a0=1+al, a1=-2*cw, a2=1-al; let e=0;
  for(const x of chs){ let y=Float64Array.from(x.subarray(a||0, b||x.length)); for(let pass=0;pass<2;pass++){ let x1=0,x2=0,y1=0,y2=0;
    for(let i=0;i<y.length;i++){ const v=y[i], o=(b0*v+b1*x1+b2*x2-a1*y1-a2*y2)/a0; x2=x1; x1=v; y2=y1; y1=o; y[i]=o; } }
    for(let i=0;i<y.length;i++) e+=y[i]*y[i]; }
  return 10*Math.log10(e+1e-20); };
window.__tone = function(x, f, a, b){ let re=0, im=0; for(let i=a;i<b;i++){ const t=2*Math.PI*f*i/44100; re+=x[i]*Math.cos(t); im+=x[i]*Math.sin(t); } return 2*Math.sqrt(re*re+im*im)/(b-a); };
window.__seed = function(){ let x = 0x2f6b1a3d; Math.random = function(){ x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; }; };   /* the same "random" every render */
window.__wav = async function(url){ const ab=await (await fetch(url)).arrayBuffer(); const oc=new OfflineAudioContext(2, 1, 44100); const b=await oc.decodeAudioData(ab); return [b.getChannelData(0), b.getChannelData(b.numberOfChannels>1?1:0)]; };`;
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
const db = x => (x >= 0 ? "+" : "") + x.toFixed(2);

async function room(b, file, opt) {
  const c = await b.newContext(opt || { viewport: { width: 1366, height: 900 } });
  await c.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  const p = await c.newPage(); p.on("pageerror", e => errs.push(file + ": " + e.message));
  await p.goto(U1 + file); await p.waitForTimeout(1200);
  await p.addScriptTag({ content: MEASURE + DSP });
  return { c, p };
}
/* pick a pedal from the strip's menu, as a hand would */
const addPed = (p, id) => p.evaluate(id => { const s = document.querySelector("#pedalsNear select[data-addped]"); s.value = id; s.dispatchEvent(new Event("change", { bubbles: true })); }, id);
const knob = (p, ped, k, v) => p.evaluate(([ped, k, v]) => { const i = document.querySelector(`#pedalsNear input[data-scope="ped:${ped}"][data-k="${k}"]`); i.value = String(v); i.dispatchEvent(new Event("input", { bubbles: true })); }, [ped, k, v]);
const menu = p => p.evaluate(() => { const s = document.querySelector("#pedalsNear select[data-addped]"); return s ? [...s.options].map(o => o.value).filter(Boolean) : []; });
const onNow = p => p.evaluate(() => [...document.querySelectorAll("#pedalsNear .aa-ped")].map(e => e.getAttribute("data-p")));

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  /* ══ B · all off is the room exactly as before; D · each pedal keeps the level ══
     A room's own sound differs by a hair between two renders of the very same chain (a step of a 32-bit float, in the
     recordings' timing), on main too, so the chain without the rig is rendered twice and the rig in place may differ no
     more than that (at most 2e-6, more than 110 dB under the peak). The 1987 dial is at 0 here: its crunch worklet,
     spliced in as the chain is made, can land a sample apart between renders (about 2e-4, on main as well). */
  {
    const { c, p } = await room(b, "music-piano.html");
    const r = await p.evaluate(async () => {
      const out = {};
      async function render(id, st, how){        /* how: "old" the chain as it was before the pedals, "pre" before the compressor */
        __seed(); const oc = new OfflineAudioContext(2, 44100 * 3, 44100); await AOGAmp.load(oc);
        if (st) ROOMFX[id] = st; else delete ROOMFX[id];
        const ch = makeChain(oc); await addCrunch(ch); ch.master.gain.value = volGain(0.8); setSendLevel(ch, id); setEra(ch, 0, 0); delete ROOMFX[id];
        if (how === "old") { ch.bus.disconnect(); ch.bus.connect(ch.pre); ch.rig.output.disconnect(); }
        if (how === "pre") { ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination); }
        [60, 64, 67, 48].forEach((m, j) => { const vc = makeVoice(oc, ch, id, m, 0.74 * (j === 3 ? 0.85 : 1), 0.05); vc.stop(2.05, vc.tau); });
        const buf = await oc.startRendering(); return { buf, active: ch.rig.active, worklet: ch.rig.worklet };
      }
      for (const id of ["grand", "epwarm"]) {
        if (SOUNDS[id].kind === "sample") await loadSet(SOUNDS[id].set);
        const a = await render(id, null, ""), o = await render(id, null, "old"), o2 = await render(id, null, "old");
        let d = 0, dn = 0, pk = 0; for (let ch = 0; ch < 2; ch++) { const x = a.buf.getChannelData(ch), y = o.buf.getChannelData(ch); for (let i = 0; i < x.length; i++) { d = Math.max(d, Math.abs(x[i] - y[i])); pk = Math.max(pk, Math.abs(y[i])); dn = Math.max(dn, Math.abs(o2.buf.getChannelData(ch)[i] - y[i])); } }
        out[id] = { d, dn, pk, active: a.active, worklet: a.worklet, lv: {} };
        const d0 = AOGAmp.defaults("keys"), z = __kw((await render(id, d0, "pre")).buf);
        for (const pd of AOGAmp.pedalsOf("keys")) { const st = JSON.parse(JSON.stringify(d0)); st.fx[pd.id].on = true; out[id].lv[pd.id] = __kw((await render(id, st, "pre")).buf) - z; }
        for (const m of AOGAmp.ROOMK.keys.models.slice(1)) { const st = JSON.parse(JSON.stringify(d0)); st.model = m; st.cab = AOGAmp.MODELS[m].cab; out[id].lv["amp " + m] = __kw((await render(id, st, "pre")).buf) - z; }
      }
      return out;
    });
    for (const [id, v] of Object.entries(r)) {
      ok((v.d === 0 || v.d <= Math.max(4 * v.dn, 2e-6)) && v.pk > 0.01 && !v.active && !v.worklet, `piano · ${id}: every pedal off and no amp is the piano as before (${v.d === 0 ? "sample for sample" : "largest difference " + v.d.toExponential(2) + ", the old chain twice " + v.dn.toExponential(2)}; peak ${v.pk.toFixed(3)}); nothing is in the path, no worklet`);
      const bad = Object.entries(v.lv).filter(([k, x]) => Math.abs(x) > 2);
      ok(!bad.length, `piano · ${id}: each pedal and amp at its own knobs stays within 2 dB: ${Object.entries(v.lv).map(([k, x]) => k + " " + db(x)).join(", ")}`);
    }
    await c.close();
  }
  {
    const { c, p } = await room(b, "music-band.html");
    const r = await p.evaluate(async () => {
      const out = {};
      async function render(id, st, how){
        __seed(); const oc = new OfflineAudioContext(2, 44100 * 3, 44100); await AOGAmp.load(oc);
        if (st) ROOMFX[id] = st; else delete ROOMFX[id];
        const ch = makeChain(oc); await addCrunch(ch); ch.master.gain.value = volGain(0.8); setSendLevel(ch, id); setEra(ch, 0, 0); delete ROOMFX[id];
        if (how === "old") { ch.bus.disconnect(); ch.bus.connect(ch.pre); ch.rig.output.disconnect(); }
        if (how === "pre") { ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination); }
        [60, 64, 67, 48].forEach(m => { const vc = makeVoice(oc, ch, instOf(id), m, 0.74, 0.05, "sus"); if (vc) vc.stop(2.05, vc.tau); });
        const buf = await oc.startRendering(); return { buf, active: ch.rig.active, worklet: ch.rig.worklet };
      }
      for (const id of ["trumpet", "violins"]) {
        await loadSound(id);
        const a = await render(id, null, ""), o = await render(id, null, "old"), o2 = await render(id, null, "old");
        let d = 0, dn = 0, pk = 0; for (let ch = 0; ch < 2; ch++) { const x = a.buf.getChannelData(ch), y = o.buf.getChannelData(ch); for (let i = 0; i < x.length; i++) { d = Math.max(d, Math.abs(x[i] - y[i])); pk = Math.max(pk, Math.abs(y[i])); dn = Math.max(dn, Math.abs(o2.buf.getChannelData(ch)[i] - y[i])); } }
        out[id] = { d, dn, pk, active: a.active, worklet: a.worklet, lv: {} };
        const d0 = AOGAmp.defaults("band"), z = __kw((await render(id, d0, "pre")).buf);
        for (const pd of AOGAmp.pedalsOf("band")) { const st = JSON.parse(JSON.stringify(d0)); st.fx[pd.id].on = true; out[id].lv[pd.id] = __kw((await render(id, st, "pre")).buf) - z; }
      }
      return out;
    });
    for (const [id, v] of Object.entries(r)) {
      ok((v.d === 0 || v.d <= Math.max(4 * v.dn, 2e-6)) && v.pk > 0.01 && !v.active && !v.worklet, `band · ${id}: every pedal off is the band as before (${v.d === 0 ? "sample for sample" : "largest difference " + v.d.toExponential(2) + ", the old chain twice " + v.dn.toExponential(2)}; peak ${v.pk.toFixed(3)}); no worklet in the path`);
      const bad = Object.entries(v.lv).filter(([k, x]) => Math.abs(x) > 2);
      ok(!bad.length, `band · ${id}: each pedal at its own knobs stays within 2 dB: ${Object.entries(v.lv).map(([k, x]) => k + " " + db(x)).join(", ")}`);
    }
    await c.close();
  }

  /* ══ the Drum Kit: B, C and D offline ══ */
  {
    const { c, p } = await room(b, "music-kit.html");
    const r = await p.evaluate(async () => {
      await AOGDrumKit.load(S.bank, {}, {}, x => x, null);
      const out = {};
      /* src: "beat" (a bar of kick, snare and hats), "kick" (one hit), "sine" (a tone); at: "rig" the rig's own output, "out" the room's */
      async function render(st, src, at, how){
        __seed(); const oc = new OfflineAudioContext(2, 44100 * 2.2, 44100); await AOGAmp.load(oc);
        if (st) ROOMFX[S.bank] = st; else delete ROOMFX[S.bank];
        const m = makeChain(oc); if (m.rig) await m.rig.ready(); delete ROOMFX[S.bank];
        if (how === "old") { m.bus.disconnect(); m.bus.connect(m.lim); m.rig.output.disconnect(); }
        if (at === "rig") { m.lim.disconnect(); m.rig.output.disconnect(); m.rig.output.connect(oc.destination); }
        if (src === "beat") for (let k = 0; k < 4; k++) { const t = 0.05 + k * 0.5; AOGDrumKit.playDirect(oc, m.bus, S.bank, "kick", t, false, 0.5); AOGDrumKit.playDirect(oc, m.bus, S.bank, "snare", t + 0.25, false, 0.5);
          for (let h = 0; h < 4; h++) AOGDrumKit.playDirect(oc, m.bus, S.bank, "ch", t + h * 0.125, false, 0.4); }
        if (src === "kick") AOGDrumKit.playDirect(oc, m.bus, S.bank, "kick", 0.1, true, 0.6);
        if (src === "sine" || src === "high") { const o = oc.createOscillator(), g = oc.createGain(); o.frequency.value = src === "sine" ? 220 : 7000; g.gain.value = src === "sine" ? 0.5 : 0.9; o.connect(g); g.connect(m.bus); o.start(0.05); o.stop(2.1); }
        const buf = await oc.startRendering(); return { x: [buf.getChannelData(0), buf.getChannelData(1)], active: m.rig.active, worklet: m.rig.worklet, buf };
      }
      const d0 = AOGAmp.defaults("drums"), on = (id, k) => { const s = JSON.parse(JSON.stringify(d0)); s.fx[id].on = true; Object.assign(s.fx[id], k || {}); return s; };
      /* B · all off */
      /* the recorded kit itself differs by a hair (one step of a 32-bit float) between two renders of the very same chain,
         so the chain without the rig is rendered twice: the rig in its place must differ no more than that */
      const a = await render(null, "beat", "out"), o = await render(null, "beat", "out", "old"), o2 = await render(null, "beat", "out", "old");
      let d = 0, dn = 0, pk = 0; for (let ch = 0; ch < 2; ch++) for (let i = 0; i < a.x[ch].length; i++) { d = Math.max(d, Math.abs(a.x[ch][i] - o.x[ch][i])); dn = Math.max(dn, Math.abs(o2.x[ch][i] - o.x[ch][i])); pk = Math.max(pk, Math.abs(o.x[ch][i])); }
      out.null = { d, d0: dn, pk, active: a.active, worklet: a.worklet };
      /* D · levels at each effect's own knobs, through the room (its limiter too) */
      const z = __kw(a.buf); out.lv = {};
      for (const pd of AOGAmp.pedalsOf("drums")) out.lv[pd.id] = __kw((await render(on(pd.id), "beat", "out")).buf) - z;
      /* C · Filter: the highs go, the lows stay */
      const bR = await render(null, "beat", "rig"), fR = await render(on("filter"), "beat", "rig"), fH = await render(on("filter", { mode: "hpf" }), "beat", "rig");
      out.filter = { hi: __band(fR.x, 6000, "hp") - __band(bR.x, 6000, "hp"), lo: __band(fR.x, 150, "lp") - __band(bR.x, 150, "lp"),
        hpLo: __band(fH.x, 150, "lp") - __band(bR.x, 150, "lp"), worklet: fR.worklet };
      const sw = await render(on("filter", { freq: 3 }), "beat", "rig"); out.filter.sweep = __band(sw.x, 2000, "hp") - __band(bR.x, 2000, "hp");
      /* C · Crush, all crushed (Mix 10): every sample on a step of 2/2^bits, each held for a few samples */
      const cs = on("crush", { mix: 10 }), cr = await render(cs, "beat", "rig"), q = 2 / Math.pow(2, AOGAmp.busParams(AOGAmp.normalize(cs, "drums")).crush.bits);
      let onGrid = 0, n = 0, runs = 0, prev = NaN; const x = cr.x[0];
      for (let i = 4410; i < 88200; i++) { if (Math.abs(x[i]) < 1e-6) continue; n++; const v = x[i] / q; if (Math.abs(v - Math.round(v)) < 2e-3) onGrid++; if (x[i] !== prev) runs++; prev = x[i]; }
      let onGrid0 = 0, n0 = 0; const x0 = bR.x[0]; for (let i = 4410; i < 88200; i++) { if (Math.abs(x0[i]) < 1e-6) continue; n0++; const v = x0[i] / q; if (Math.abs(v - Math.round(v)) < 2e-3) onGrid0++; }
      out.crush = { grid: onGrid / Math.max(1, n), grid0: onGrid0 / Math.max(1, n0), hold: n / Math.max(1, runs), bits: Math.log2(2 / q), worklet: cr.worklet };
      const cd = await render(on("crush"), "beat", "rig"); let e = 0, e0 = 0; for (let i = 0; i < x0.length; i++) { const dd = cd.x[0][i] - x0[i]; e += dd * dd; e0 += x0[i] * x0[i]; }
      out.crush.noise = 10 * Math.log10(e / e0);
      /* C · Punch: the start of a hit against its ring */
      const env = xs => { const y = xs[0]; let st = 0; for (let i = 0; i < y.length; i++) if (Math.abs(y[i]) > 0.01) { st = i; break; }
        let pk = 0; for (let i = st; i < st + 441; i++) pk = Math.max(pk, Math.abs(y[i]));
        let r2 = 0; for (let i = st + 2646; i < st + 8820; i++) r2 += y[i] * y[i]; return 20 * Math.log10(pk / Math.sqrt(r2 / 6174)); };
      const k0 = await render(null, "kick", "rig"), k1 = await render(on("punch"), "kick", "rig"), k2 = await render(on("punch", { snap: 5, ring: 10 }), "kick", "rig");
      out.punch = { snap: env(k1.x) - env(k0.x), ring: env(k2.x) - env(k0.x), worklet: k1.worklet };
      /* C · Tape: a 220 Hz tone gains its harmonics; a 7 kHz tone's fifth harmonic would fold back to 9.1 kHz without the oversampling */
      const s0 = await render(null, "sine", "rig"), s1 = await render(on("tape"), "sine", "rig"), A = 22050, B = 66150;
      const hd = xs => { const f = __tone(xs[0], 220, A, B); return { h2: 20 * Math.log10(__tone(xs[0], 440, A, B) / f), h3: 20 * Math.log10(__tone(xs[0], 660, A, B) / f) }; };
      const hi = await render(on("tape", { drive: 10 }), "high", "rig"), al = 20 * Math.log10(__tone(hi.x[0], 9100, A, B) / __tone(hi.x[0], 7000, A, B));
      out.tape = { off: hd(s0.x), on: hd(s1.x), alias: al, worklet: s1.worklet };
      return out;
    });
    ok(r.null.d <= Math.max(r.null.d0, 6e-8) && r.null.pk > 0.05 && !r.null.active && !r.null.worklet, `drum kit: every effect off is the kit as before (largest difference ${r.null.d.toExponential(2)}, ${(20 * Math.log10(r.null.d / r.null.pk + 1e-30)).toFixed(0)} dB under the peak; the same chain twice differs by ${r.null.d0.toExponential(2)}); no worklet in the path`);
    ok(!Object.values(r.lv).some(x => Math.abs(x) > 2), `drum kit: each effect at its own knobs stays within 2 dB: ${Object.entries(r.lv).map(([k, x]) => k + " " + db(x)).join(", ")}`);
    ok(r.filter.hi < -8 && Math.abs(r.filter.lo) < 2 && r.filter.hpLo < -10 && r.filter.sweep < r.filter.hi - 6, `Filter cuts the highs (above 6 kHz ${db(r.filter.hi)} dB, the lows ${db(r.filter.lo)} dB); Cut the lows takes the lows (${db(r.filter.hpLo)} dB); Sweep down to 3 cuts far more (above 2 kHz ${db(r.filter.sweep)} dB)`);
    ok(r.crush.grid > 0.99 && r.crush.grid0 < 0.2 && r.crush.hold > 2 && r.crush.worklet && r.crush.noise > -40 && r.crush.noise < -3,
      `Crush puts every sample on a step (${(r.crush.grid * 100).toFixed(1)}% on the ${r.crush.bits.toFixed(1)}-bit grid, ${(r.crush.grid0 * 100).toFixed(1)}% without it), holds each for ${r.crush.hold.toFixed(1)} samples; at its own knobs it adds grit ${db(r.crush.noise)} dB under the beat`);
    ok(r.punch.snap > 1.5 && r.punch.ring < -1.5 && r.punch.worklet, `Punch changes a hit's envelope: Snap makes the start ${db(r.punch.snap)} dB stronger against the ring; Ring at 10 lets it ring longer (${db(r.punch.ring)} dB)`);
    ok(r.tape.on.h3 > -40 && r.tape.on.h2 > -55 && r.tape.on.h3 > r.tape.off.h3 + 30 && r.tape.alias < -60 && r.tape.worklet,
      `Tape adds harmonics to a 220 Hz tone (2nd ${r.tape.on.h2.toFixed(1)} dB, 3rd ${r.tape.on.h3.toFixed(1)} dB; without it ${r.tape.off.h2.toFixed(1)} / ${r.tape.off.h3.toFixed(1)} dB), and nothing folds back from a hot 7 kHz tone (${r.tape.alias.toFixed(1)} dB at 9.1 kHz)`);
    await c.close();
  }

  /* ══ the Drum Machine: Bounce, byte for byte with all off; with the Filter on it carries it ══ */
  {
    const { c, p } = await room(b, "music-pads.html");
    const r = await p.evaluate(async () => {
      S.bank = 0; S.bars = 1; S.ev = []; for (let i = 0; i < 16; i++) { if (i % 4 === 0) S.ev.push({ b: 0, p: 0, t: i * 24, v: 0.9, len: 24 }); if (i % 8 === 4) S.ev.push({ b: 0, p: 1, t: i * 24, v: 0.9, len: 24 }); if (i % 2 === 0) S.ev.push({ b: 0, p: 2, t: i * 24, v: 0.7, len: 24 }); }
      await prep(0);
      const bytes = async o => new Uint8Array(await o.blob.arrayBuffer());
      const live = await renderLoop();
      const m0 = window.master; window.master = cc => { const m = m0(cc); m.bus.disconnect(); m.bus.connect(m.lim); if (m.rig) m.rig.output.disconnect(); return m; };
      const old = await renderLoop(), old2 = await renderLoop(); window.master = m0;
      const A = await bytes(live), B = await bytes(old), C = await bytes(old2); let same = A.length === B.length, same0 = B.length === C.length;
      for (let i = 0; same && i < A.length; i++) if (A[i] !== B[i]) same = false;
      for (let i = 0; same0 && i < B.length; i++) if (B[i] !== C[i]) same0 = false;
      FXST = AOGAmp.normalize({ fx: { filter: { on: true, freq: 3 } } }, "drums");
      const f = await renderLoop(); FXST = null;
      const dec = async o => __wav(URL.createObjectURL(o.blob));
      const x0 = await dec(live), xo = await dec(old), xo2 = await dec(old2), x1 = await dec(f);
      let d = 0, d0 = 0; for (let ch = 0; ch < 2; ch++) for (let i = 0; i < x0[ch].length; i++) { d = Math.max(d, Math.abs(x0[ch][i] - xo[ch][i])); d0 = Math.max(d0, Math.abs(xo2[ch][i] - xo[ch][i])); }
      return { same, same0, d: Math.round(d * 32768), d0: Math.round(d0 * 32768), n: A.length, sec: live.sec, hi: __band(x1, 3000, "hp") - __band(x0, 3000, "hp") };
    });
    /* byte for byte where the machine itself renders the same file twice; otherwise no further apart than two of its own */
    ok(r.n > 1000 && (r.same || (!r.same0 && r.d <= Math.max(1, r.d0))), `drum machine: every effect off, Bounce makes the same file as before (${r.same ? "byte for byte" : "within " + r.d + " step of 16 bits; two Bounces of the old chain differ by " + r.d0}; ${r.n} bytes, ${r.sec.toFixed(2)} s)`);
    ok(r.hi < -10, `drum machine: Bounce carries the effects (the Filter swept down: above 3 kHz ${db(r.hi)} dB)`);
    await c.close();
  }

  /* ══ E · a take carries the pedal: the Drum Kit with its Filter, the piano with a tremolo; the live rig idle again after ══ */
  {
    const { c, p } = await room(b, "music-kit.html");
    await p.evaluate(async () => { ctx(); await AOGDrumKit.load(S.bank, {}, {}, x => x, null); });
    const take = async () => {
      await p.click("#takeBtn"); await p.waitForTimeout(500);
      for (let k = 0; k < 6; k++) { await p.evaluate(() => { const c0 = ctx(), t = c0.currentTime + 0.02; sound(S.bank, "kick", t, false, 0.5); sound(S.bank, "ch", t, false, 0.5); sound(S.bank, "ch", t + 0.12, false, 0.5); sound(S.bank, "snare", t + 0.25, false, 0.5); }); await p.waitForTimeout(500); }
      await p.click("#takeBtn"); await p.waitForTimeout(1500);
      return p.evaluate(async () => { const a = document.querySelector("#takeList a[download]"); const x = await __wav(a.href); return { hi: __band(x, 5000, "hp"), all: __band(x, 40, "hp"), n: document.querySelectorAll("#takeList a[download]").length }; });
    };
    const t0 = await take();
    await addPed(p, "filter"); await knob(p, "filter", "freq", 3); await p.waitForTimeout(200);
    const live = await p.evaluate(() => ({ active: RIG.active }));
    const t1 = await take();
    ok(t1.n === 2 && live.active && t1.hi - t1.all < t0.hi - t0.all - 10, `drum kit: a take made with the Filter on carries it (the highs ${db(t1.hi - t1.all)} dB of the take, ${db(t0.hi - t0.all)} dB without it)`);
    await p.evaluate(() => document.querySelector('#pedalsNear button[data-fs="filter"]').click()); await p.waitForTimeout(150);
    const idle = await p.evaluate(() => ({ active: RIG.active, worklet: RIG.worklet }));
    ok(!idle.active && !idle.worklet, "drum kit: the Filter off again, the live rig is a straight wire again: " + JSON.stringify(idle));
    await c.close();
  }
  {
    const { c, p } = await room(b, "music-piano.html");
    await p.evaluate(async () => { const s = SOUNDS[S.sound]; if (s.kind === "sample") await loadSet(s.set); ctx(); });
    const take = async () => {
      await p.click("#recBtn"); await p.waitForTimeout(500);
      await p.evaluate(() => noteOn("k", 60, 0.8)); await p.waitForTimeout(1600); await p.evaluate(() => noteOff("k", 60));
      await p.click("#recBtn"); await p.waitForTimeout(1500);
      return p.evaluate(async () => { const a = document.querySelector("#takes a[download]"); const [L] = await __wav(a.href);
        /* how much the level wobbles: 20 ms windows over the first second of the note */
        let st = 0; for (let i = 0; i < L.length; i++) if (Math.abs(L[i]) > 0.01) { st = i; break; }
        const w = []; for (let j = 0; j < 40; j++) { let s = 0; for (let i = st + 4410 + j * 882; i < st + 4410 + (j + 1) * 882; i++) s += L[i] * L[i]; w.push(10 * Math.log10(s / 882 + 1e-12)); }
        let sw = 0; for (let j = 1; j < w.length; j++) sw += Math.abs(w[j] - w[j - 1]); return { wob: sw / (w.length - 1), n: document.querySelectorAll("#takes a[download]").length }; });
    };
    const t0 = await take();
    await addPed(p, "trem"); await p.evaluate(() => document.querySelector('#pedalsNear button[data-mode="square"]').click()); await p.waitForTimeout(100);
    await knob(p, "trem", "rate", 7); await knob(p, "trem", "depth", 10); await p.waitForTimeout(200);
    const t1 = await take();
    ok(t1.n === 2 && t1.wob > t0.wob * 3 && t1.wob > 2, `piano: a take made with the tremolo on carries it (the level moves ${t1.wob.toFixed(2)} dB every 20 ms, ${t0.wob.toFixed(2)} dB without it)`);
    await c.close();
  }

  /* ══ F · settings stay with each sound, after a reload; Put this sound back ══ */
  {
    const { c, p } = await room(b, "music-piano.html");
    const pick = id => p.evaluate(id => { const s = document.getElementById("soundSel"); s.value = id; s.dispatchEvent(new Event("change", { bubbles: true })); }, id);
    const first = await menu(p), none = await onNow(p), amp = await p.evaluate(() => document.querySelector('#ampBox select[data-aa="model"]').value);
    ok(first.slice(0, 4).join() === "rotary,chorus,phaser,trem" && !none.length && amp === "none", `piano: the board starts clean (no amp, nothing on), the starters first in the menu: ${first.join(", ")}`);
    await pick("epwarm"); await p.waitForTimeout(100); await addPed(p, "rotary"); await knob(p, "rotary", "depth", 9);
    await p.evaluate(() => { const s = document.querySelector('#ampBox select[data-aa="model"]'); s.value = "clean"; s.dispatchEvent(new Event("change", { bubbles: true })); });
    await pick("grand"); await p.waitForTimeout(150);
    const g = await onNow(p);
    await pick("epwarm"); await p.waitForTimeout(150);
    const e = await p.evaluate(() => ({ on: [...document.querySelectorAll("#pedalsNear .aa-ped")].map(x => x.getAttribute("data-p")), depth: fxFor("epwarm").fx.rotary.depth, model: fxFor("epwarm").model }));
    ok(!g.length && e.on.join() === "rotary" && e.depth === 9 && e.model === "clean", `piano: each sound keeps its own (the grand: none; the electric piano: ${e.on.join()} at depth ${e.depth}, ${e.model} amp)`);
    await p.waitForTimeout(500); await p.reload({ waitUntil: "domcontentloaded" }); await p.waitForTimeout(1800);
    const after = await p.evaluate(() => ({ sound: S.sound, on: [...document.querySelectorAll("#pedalsNear .aa-ped")].map(x => x.getAttribute("data-p")), ep: fxFor("epwarm"), gr: fxFor("grand") }));
    ok(after.sound === "epwarm" && after.on.join() === "rotary" && after.ep.fx.rotary.depth === 9 && after.ep.model === "clean" && !after.gr.fx.rotary.on && after.gr.model === "none", "piano: after a reload, still so: " + JSON.stringify({ sound: after.sound, on: after.on, model: after.ep.model }));
    await p.evaluate(() => document.querySelector('#ampBox button[data-aa="back"]').click()); await p.waitForTimeout(500); await p.reload({ waitUntil: "domcontentloaded" }); await p.waitForTimeout(1800);
    const back = await p.evaluate(() => ({ on: [...document.querySelectorAll("#pedalsNear .aa-ped")].length, model: fxFor("epwarm").model, note: document.querySelector("#ampBox .aa-note").textContent }));
    ok(!back.on && back.model === "none", "piano: Put this sound back clears it, and it stays cleared: " + JSON.stringify(back));
    await c.close();
  }
  {
    const { c, p } = await room(b, "music-band.html");
    const pick = id => p.evaluate(id => { const s = document.getElementById("soundSel"); s.value = id; s.dispatchEvent(new Event("change", { bubbles: true })); }, id);
    const brass = await menu(p); await pick("violins"); await p.waitForTimeout(150); const str = await menu(p);
    ok(brass[0] === "od" && str.slice(0, 2).join() === "chorus,delay" && (await p.evaluate(() => !document.querySelector("#ampBox .aa-head"))), `band: no amp to pick; a little drive first for brass (${brass.join(", ")}), chorus and a lush echo first for strings (${str.join(", ")})`);
    await addPed(p, "delay"); await p.waitForTimeout(100);
    const wide = await p.evaluate(() => fxFor("violins").fx.delay.type);
    await pick("trumpet"); await p.waitForTimeout(150); await addPed(p, "od"); await p.waitForTimeout(500);
    await p.reload({ waitUntil: "domcontentloaded" }); await p.waitForTimeout(1800);
    const r = await p.evaluate(() => ({ v: AOGAmp.pedalsOf("band").filter(x => fxFor("violins").fx[x.id].on).map(x => x.id), t: AOGAmp.pedalsOf("band").filter(x => fxFor("trumpet").fx[x.id].on).map(x => x.id), shown: [...document.querySelectorAll("#pedalsNear .aa-ped")].map(x => x.getAttribute("data-p")) }));
    ok(wide === "wide" && r.v.join() === "delay" && r.t.join() === "od" && r.shown.join() === "od", `band: the echo starts Wide; each sound keeps its own after a reload (violins: ${r.v}, trumpet: ${r.t}; on screen: ${r.shown})`);
    await c.close();
  }
  {
    const { c, p } = await room(b, "music-kit.html");
    await addPed(p, "tape"); await p.waitForTimeout(100);
    const was = await p.evaluate(() => S.bank), other = await p.evaluate(() => KITS().find(k => k !== S.bank));
    await p.evaluate(k => pickKit(k), other); await p.waitForTimeout(150); const o = await onNow(p);
    await p.evaluate(k => pickKit(k), was); await p.waitForTimeout(600);
    await p.reload({ waitUntil: "domcontentloaded" }); await p.waitForTimeout(1800);
    const r = await p.evaluate(() => ({ bank: S.bank, shown: [...document.querySelectorAll("#pedalsNear .aa-ped")].map(x => x.getAttribute("data-p")), kept: document.querySelector("#ampBox .aa-note").textContent }));
    ok(!o.length && r.shown.join() === "tape" && /this kit/.test(r.kept), `drum kit: each kit keeps its own (another kit: none; kit ${r.bank} after a reload: ${r.shown}); "${r.kept}"`);
    await c.close();
  }
  {
    const { c, p } = await room(b, "music-pads.html");
    const first = await menu(p);
    ok(first.slice(0, 4).join() === "punch,tape,filter,crush" && !(await onNow(p)).length, `drum machine: nothing on at first; the drum-bus starters first: ${first.join(", ")}`);
    await addPed(p, "crush"); await knob(p, "crush", "bits", 8); await p.waitForTimeout(500);
    await p.reload({ waitUntil: "domcontentloaded" }); await p.waitForTimeout(1800);
    const r = await p.evaluate(() => ({ shown: [...document.querySelectorAll("#pedalsNear .aa-ped")].map(x => x.getAttribute("data-p")), bits: fxState().fx.crush.bits, live: (ctx(), LIVE_M.rig.active) }));
    ok(r.shown.join() === "crush" && r.bits === 8 && r.live, "drum machine: the effects stay with the machine after a reload, and the sound starts with them: " + JSON.stringify(r));
    await c.close();
  }

  /* ══ G · Spanish ══ */
  for (const [file, kind, want] of [["music-piano.html", "keys", ["Pedales", "+ Añadir un pedal o efecto", "Altavoz giratorio", "Pedales y amplificador"]],
    ["music-band.html", "band", ["Pedales", "+ Añadir un pedal o efecto", "Overdrive", "Pedales"]],
    ["music-kit.html", "drums", ["Efectos", "+ Añadir un efecto", "Pegada", "Efectos"]], ["music-pads.html", "drums", ["Efectos", "+ Añadir un efecto", "Cinta", "Efectos"]]]) {
    const { c, p } = await room(b, file);
    await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(300);
    if (kind === "drums") { await addPed(p, "filter"); await addPed(p, "crush"); await addPed(p, "punch"); await addPed(p, "tape"); } else { await addPed(p, kind === "keys" ? "rotary" : "chorus"); await addPed(p, "delay"); }
    await p.waitForTimeout(200);
    const r = await p.evaluate(([kind]) => {
      const n = document.getElementById("pedalsNear"), sel = n.querySelector("select[data-addped]");
      const h = (document.querySelector("#ampBlk h2") || {}).textContent;
      const descs = [...document.querySelectorAll("#ampBox .aa-ped")].every(e => { const pd = AOGAmp.PEDALS.find(x => x.id === e.getAttribute("data-p")); return e.querySelector(".aa-pd").textContent === AOGAmp.descOf(pd, kind, "es") && e.querySelector("b").textContent === pd.es; });
      const knobs = [...n.querySelectorAll(".aa-kl")].map(e => e.textContent), modes = [...n.querySelectorAll(".aa-modes button")].map(e => e.textContent);
      return { strip: n.querySelector(".aa-nearh b").textContent, add: sel ? sel.options[0].textContent : "", names: [...document.querySelectorAll("#ampBox .aa-ped b")].map(e => e.textContent), h, descs, knobs, modes,
        help: document.querySelector("#ampBox .aa-board > p").textContent, note: document.querySelector("#ampBox .aa-note").textContent, back: document.querySelector('#ampBox button[data-aa="back"]').textContent };
    }, [kind]);
    const english = /\b(Pedals|Effects|Add a|Press On|Sweep|Snap|Ring|Grit|Cut the|Your settings|Put this)\b/;
    ok(r.strip === want[0] && r.add === want[1] && r.names.indexOf(want[2]) >= 0 && r.h === want[3] && r.descs && !english.test(JSON.stringify(r)),
      `${file} in Spanish: "${r.strip}", "${r.add}", ${r.names.join(", ")}; knobs ${r.knobs.join(", ")}${r.modes.length ? "; " + r.modes.join(", ") : ""}; "${r.help}" "${r.back}" "${r.note}"`);
    await c.close();
  }

  /* ══ A · inside the Studio: under the instrument; iPhone and iPad, light and dark ══ */
  const F = { piano: "music-piano.html", band: "music-band.html", pads: "music-pads.html", kit: "music-kit.html" };
  const INST = { piano: "kbd", band: "kbd", pads: "pads", kit: "kitBox" };
  const START = { piano: "rotary,chorus,phaser,trem", band: "od,chorus,delay,reverb", pads: "punch,tape,filter,crush", kit: "punch,tape,filter,crush" };
  for (const [dev, theme] of [["iPhone 13", "light"], ["iPhone 13", "dark"], ["iPad (gen 7)", "light"], ["iPad (gen 7)", "dark"]]) {
    const cx = await b.newContext({ ...pw.devices[dev], colorScheme: theme });
    cx.on("page", pg => pg.on("pageerror", e => errs.push(dev + ": " + e.message)));
    await cx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
    await cx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
    await cx.addInitScript(th => { try { localStorage.setItem("aog.grace.navy.v1", "1"); localStorage.setItem("aog.theme", th); localStorage.setItem("aog.interior.ws.v1.theme", th); localStorage.setItem("aog.theme.lightstart.v1", "1"); } catch (e) {} }, theme);
    const m = await cx.newPage();
    for (const id of Object.keys(F)) {
      await m.goto(U2 + "the-studio#" + id);
      await m.waitForFunction(f => { const fr = document.getElementById("room"), d = fr && fr.contentDocument; return fr && fr.getAttribute("data-file") === "/" + f && d && d.readyState === "complete" && d.documentElement.classList.contains("in-studio"); }, F[id], { timeout: 30000 });
      await m.waitForTimeout(1000);
      const fr = await (await m.$("#room")).contentFrame();
      /* AOG-ROOMS-COMPACT-V1: in the Studio the whole board waits in More; open it there, as a person would */
      const part = await fr.evaluate(() => { const s = document.getElementById("aogMoreSel"), k = document.getElementById("ampBlk"); return s && k ? k.getAttribute("data-aog-sec") : null; });
      if (part) { await fr.selectOption("#aogMoreSel", part); await m.waitForTimeout(250); await fr.evaluate(() => scrollTo(0, 0)); }
      const pos = await fr.evaluate(([inst]) => { const n = document.getElementById("pedalsNear"), i = document.getElementById(inst), blk = document.getElementById("ampBlk"), r = e => e.getBoundingClientRect();
        const s = n.querySelector("select[data-addped]");
        return { shown: !n.hidden && r(n).height > 40, gap: Math.round(r(n).top - r(i).bottom), after: !!(i.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING), blkAfter: r(blk).top > r(n).bottom,
          menu: s ? [...s.options].map(o => o.value).filter(Boolean).slice(0, 4).join() : "", on: n.querySelectorAll(".aa-ped").length, board: !!document.querySelector("#ampBox .aa-board") }; }, [INST[id]]);
      /* two starters on, so their knobs show too */
      await fr.evaluate(() => { for (let k = 0; k < 2; k++) { const s = document.querySelector("#pedalsNear select[data-addped]"); s.value = s.options[1].value; s.dispatchEvent(new Event("change", { bubbles: true })); } });
      await m.waitForTimeout(200);
      await fr.evaluate(() => document.getElementById("pedalsNear").scrollIntoView({ block: "center" })); await m.waitForTimeout(200);
      const pc = await fr.evaluate(`(${PROBE})()`), pk = await fr.evaluate(`(${CALM})()`);
      await fr.evaluate(() => document.getElementById("ampBox").scrollIntoView({ block: "start" })); await m.waitForTimeout(200);
      const pc2 = await fr.evaluate(`(${PROBE})()`), pk2 = await fr.evaluate(`(${CALM})()`);
      const fit = await fr.evaluate(() => ({ sw: document.scrollingElement.scrollWidth, iw: innerWidth, small: [...document.querySelectorAll("#pedalsNear button, #pedalsNear select, #ampBox button, #ampBox select")].filter(e => e.offsetParent && e.getBoundingClientRect().height < 40).length }));
      ok(pos.shown && pos.after && pos.gap >= -2 && pos.gap < (id === "pads" ? 420 : 140) && pos.blkAfter && pos.menu === START[id] && !pos.on && pos.board && fit.sw <= fit.iw && !fit.small && !pc.length && !pk.length && !pc2.length && !pk2.length,
        `${dev}, ${theme}, ${id}: the pedals sit under the instrument (${pos.gap} px below it), the board after them, nothing on, starters ${pos.menu}; nothing sideways (${fit.sw}/${fit.iw}), every button 40 px or more; reads (${pc.length + pc2.length} ${JSON.stringify(pc.concat(pc2).slice(0, 2))}) and is calm (${pk.concat(pk2).join("; ") || "ok"})`);
      await fr.evaluate(() => { try { localStorage.removeItem("aog.piano.fx.v1"); localStorage.removeItem("aog.band.fx.v1"); localStorage.removeItem("aog.kit.fx.v1"); localStorage.removeItem("aog.pads.fx.v1"); } catch (e) {} });
    }
    await cx.close();
  }

  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv1.close(); srv2.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
