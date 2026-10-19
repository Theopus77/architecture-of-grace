/* AOG-LICKS-SONG-V1 (2026-10-19) — Jimmy: "I want them … so I could use them in making a song without much modification of
   my own. This should be applied to the guitar and bass licks as well (to use them within my own creations / songs)."
   The Guitar's and the Bass's "Licks to try", inside the Studio (/the-studio#guitar, #bass):
   0 · by numbers, in the page: every lick (the guitar's 161, the first 57 too; the bass's 158), Fit to my chords on five
       progressions (pop; minor with ♭III ♭VI ♭VII; two-five-one with m7, 7 and maj7; a blues of 7ths; one with a sus4, a
       ♭II and a m7♭5) in four keys (C and E♭ major, A and F♯ minor), from bar 1 and from bar 2: the lick is on those
       chords bar by bar; every note on the strings and in its hand position (a bar's own when the hand moves with the
       chord); it plays the note written; beats 1 and 3 on the chord's own notes; every other note the key's or the
       chord's, or passing by step; a bend starts on the key's note, the chord's or a blue note; held notes on their own
       strings within four frets; it ends on its chord's root (the guitar). Fit off: the lick's own notes, exactly as before.
       Every lick lasts whole bars and starts on beat 1; Repeat 2 and 4 put each time exactly a lick's bars after the one
       before, nothing of one time still sounding when the next begins; and the fastest notes at 240 beats a minute (the
       song's top tempo) are still at least 25 ms apart, so no lick needs a half-time fallback.
   on an iPhone (the guitar) and an iPad (the bass):
   1 · the words, English and Spanish: Fit to my chords / Seguir mis acordes, Repeat / Repetir, ● Record this lick /
       ● Grabar esta frase, "In your song: {key}, {n} beats a minute." / "En tu canción: …", said once; the row fits the
       screen (no sideways scroll), its buttons 44 px or taller
   2 · the song's tempo: a song at 200 and at 45 beats a minute (outside the room's own 50–180, and past the old 60–132
       clamp) plays the lick at exactly that tempo; Lick speed still slows it, for practice
   3 · with the band and Fit on, the band plays the room's chords under the lick; Fit off, the lick's own chords
   4 · ● Record this lick: a normal take of the room (Fit on, Repeat 2, a song at 104): its tempo, on bar 1, its notes,
       as long as the lick's bars plus the ring-out, its first sound on the downbeat; never over full scale, no clicks;
       + Add to My Track puts it in the Studio's inbox with its tempo and bar 1; Send to the Drum Machine puts it on the
       chops bank (padstake); the song keeps its tempo and has the room's key
   5 · silent: the Studio's hush stops a lick that plays; afterwards no timer or frame callback from Solo; no page errors.
   Port 9473. */
const pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright");
const path = require("path"), PORT = 9473, srv = require("../srv.js")(PORT);
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const COUNT = () => { window.__calls = []; const si = window.setInterval, st = window.setTimeout, raf = window.requestAnimationFrame;
  const tag = k => { const s = (new Error().stack || "").split("\n").slice(2, 6).join(" "); return () => { if (window.__calls.length < 4000) window.__calls.push(k + " " + s); }; };
  window.setInterval = (f, ...a) => { const t = tag("interval"); return si(() => { t(); typeof f === "function" && f(); }, ...a); };
  window.setTimeout = (f, ...a) => { const t = tag("timeout"); return st(() => { t(); typeof f === "function" && f(); }, ...a); };
  window.requestAnimationFrame = f => { const t = tag("frame"); return raf(x => { t(); f(x); }); }; };

async function openRoom(b, room, vw, errs) {
  const ctx = await b.newContext({ viewport: vw, isMobile: true, hasTouch: true, serviceWorkers: "block" });
  await ctx.addInitScript(COUNT);
  ctx.on("page", pg => pg.on("pageerror", e => errs.push(room + ": " + e.message)));
  await ctx.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await ctx.route(/\/the-studio(\?[^#]*)?$/, r => r.fulfill({ path: path.join(ROOT, "the-studio.html"), contentType: "text/html" }));
  const p = await ctx.newPage(); await p.goto(`http://localhost:${PORT}/the-studio#${room}`);
  await p.waitForFunction(() => [...document.querySelectorAll("iframe")].some(f => { try { return f.contentDocument && f.contentDocument.getElementById("neckBox") && f.contentDocument.querySelector('[data-so-mode="solo"]') && f.contentWindow.AOGSolo; } catch (e) { return false; } }), null, { timeout: 60000 });
  const f = p.frames().find(x => new RegExp("music-" + room).test(x.url()));
  await f.evaluate(r => { try { localStorage.removeItem("aog." + r + ".solo.v1"); localStorage.removeItem("aog.song.v1"); } catch (e) {} }, room);
  await f.evaluate(() => { if (S.lang !== "en") document.getElementById("langBtn").click(); document.querySelector('[data-so-mode="solo"]').click(); });
  await f.waitForFunction(() => { const T = AOGSolo._t; return (GTR ? T.GLK.st : T.BLK.st) === "ready" && document.querySelectorAll("#soLickSel option").length > 100; }, null, { timeout: 20000 });
  return { ctx, p, f };
}

/* ── 0 · the numbers, written out here (not the library's check) ── */
const NUMBERS = () => {
  const L = GTR ? AOGGuitarLicks : AOGBassLicks, T = TUNING, top = T[T.length - 1] + MAXF, MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10];
  const C_ = (off, q) => ({ off, q, iv: Q[q].slice() });
  const PROGS = { pop: [C_(0, "maj"), C_(7, "maj"), C_(9, "min"), C_(5, "maj")], minor: [C_(0, "min"), C_(8, "maj"), C_(3, "maj"), C_(10, "maj")],
    jazz: [C_(2, "m7"), C_(7, "dom7"), C_(0, "maj7"), C_(9, "m7")], blues: [C_(0, "dom7"), C_(5, "dom7"), C_(0, "dom7"), C_(7, "dom7")],
    odd: [C_(0, "min"), C_(1, "maj"), { off: 6, q: "sus4", iv: [0, 5, 7] }, { off: 11, q: "m7b5", iv: [0, 3, 6, 10] }] };
  const KEYS = [[0, false], [3, false], [9, true], [6, true]];
  const ids = AOGSolo._t.lickGroups().reduce((a, g) => a.concat(g[1]), []);
  const out = { licks: ids.length, n: 0, notes: 0, moved: 0, bad: [], strong: 0, own: 0, ownBad: [], bars: 0, reps: 0, seams: [], fast: 99, fastAt: "" };
  const fail = (a, m) => { if (a.length < 20) a.push(m); };
  const S0 = { key: S.key, minor: S.minor, prog: S.prog, preset: S.preset };
  for (const [key, minor] of KEYS) {
    S.key = key; S.minor = minor;
    for (const id of ids) {
      /* Fit off: the lick's own notes, as before (the guitar's first 57: lickNotes; the rest: compile) */
      const plain = AOGSolo._t.lickPlan(id, { fit: false, reps: 1 }), was = GTR && AOGSolo._t.LICKS[id] ? AOGSolo._t.lickNotes(id) : (GTR ? AOGSolo._t.gtrLickNow(id) : AOGSolo._t.bassLickNow(id)).notes;
      out.own++; if (JSON.stringify(plain.notes.map(n => [n.t, n.s, n.f, n.d])) !== JSON.stringify(was.map(n => [n.t, n.s, n.f, n.d]))) fail(out.ownBad, `${id}: not its own notes with Fit off`);
      /* whole bars, beat 1, Repeat seams; the fastest notes */
      out.bars++; if (plain.beats % 4 !== 0 || plain.notes.some(n => n.t < -0.26 || (n.t < 0 && !n.rake) || n.t + n.d > plain.beats + 1e-6)) fail(out.ownBad, `${id}: not whole bars from beat 1 (${plain.beats})`);
      const on = [...new Set(plain.notes.filter(n => !n.rake).map(n => n.t))].sort((a, b) => a - b);
      for (let i = 1; i < on.length; i++) { const ms = (on[i] - on[i - 1]) * 60000 / 240; if (ms < out.fast) { out.fast = ms; out.fastAt = id; } }
      for (const reps of [2, 4]) { const pl = AOGSolo._t.lickPlan(id, { fit: false, reps }); out.reps++;
        if (pl.total !== plain.beats * reps || pl.notes.length !== plain.notes.length * reps) fail(out.seams, `${id} ×${reps}: ${pl.total} beats, ${pl.notes.length} notes`);
        for (let r = 0; r < reps; r++) { const mine = pl.notes.filter(n => (n.rep || 0) === r), lo = Math.min(...mine.filter(n => !n.rake).map(n => n.t)), hi = Math.max(...mine.map(n => n.t + n.d));
          const want = plain.notes.filter(n => !n.rake).reduce((a, n) => Math.min(a, n.t), 99) + r * plain.beats;
          if (Math.abs(lo - want) > 1e-3 || hi > (r + 1) * plain.beats + 1e-6) fail(out.seams, `${id} ×${reps}: time ${r + 1} from ${lo} to ${hi}`); } }
      /* Fit to my chords */
      for (const pn of Object.keys(PROGS)) for (const from of [0, 1]) {
        S.prog = PROGS[pn]; S.preset = "";
        const pl = AOGSolo._t.lickPlan(id, { fit: true, reps: 1, from }); out.n++;
        const tag = `${id} ${pn} from ${from + 1} in ${key}${minor ? "m" : ""}`;
        if (!pl || !pl.fit) { fail(out.bad, tag + ": not fitted"); continue; }
        const prog = PROGS[pn], bars = pl.bars;
        for (let j = 0; j < bars; j++) { const want = prog[(from + j) % prog.length], got = pl.over[j]; if (!got || got.off !== want.off || got.q !== want.q) fail(out.bad, `${tag}: bar ${j + 1} is not on ${want.off}${want.q}`); }
        const SC = minor ? MIN : MAJ, pcOf = m => ((m - key) % 12 + 12) % 12, ns = pl.notes, real = ns.filter(n => n.k !== "g");
        const chordAtT = t => { const p = prog[(from + Math.floor(t / 4 + 1e-9)) % prog.length], iv = new Set(p.iv.map(x => ((x % 12) + 12) % 12));
          const third = iv.has(4) ? 4 : iv.has(3) ? 3 : null; return { root: p.off % 12, tones: [...iv], third }; };
        ns.forEach((n, i) => {
          out.notes++;
          const W = n.w != null ? n.w : pl.w, win = f => (f >= W && f <= W + 4) || (f === 0 && W <= 2), end = n.sl ? n.sl[0] : n.f;
          if (n.w != null) out.moved++;
          if (!(n.s >= 0 && n.s < T.length && n.f >= 0 && n.f <= MAXF && end >= 0 && end <= MAXF && n.tm <= top)) fail(out.bad, `${tag}: note ${i} off the strings`);
          if (!win(n.f) || !win(end)) fail(out.bad, `${tag}: note ${i} outside the hand position ${W}-${W + 4}`);
          const fm = n.sl && n.sl[1] === 0 ? T[n.s] + n.sl[0] : T[n.s] + n.f, bend = n.b && n.b[0] >= 1 ? n.b[0] : 0;
          if (!(n.sl && n.sl[1] > 0) && fm + bend !== n.tm) fail(out.bad, `${tag}: note ${i} plays ${fm + bend}, written ${n.tm}`);
          if (n.k === "g") return;
          /* the chord's own notes: the room's chord, as it is (a sus4 its fourth, not a third) */
          const ch = chordAtT(n.tb != null ? n.tb : n.t), own = ch.tones.map(x => (ch.root + x) % 12), pc = pcOf(n.tm), tb = n.tb != null ? n.tb : n.t, strong = Math.abs(tb / 2 - Math.round(tb / 2)) < 1e-6;
          const isTone = own.indexOf(pc) >= 0;
          if (strong) { out.strong++; if (!isTone) fail(out.bad, `${tag}: beat ${tb + 1} (${n.tm}) is not a note of the chord`); }
          if (bend) { const sp = pcOf(fm); if (SC.indexOf(sp) < 0 && own.indexOf(sp) < 0 && [3, 6, 10].indexOf(sp) < 0) fail(out.bad, `${tag}: note ${i} bends from outside the key`); }
          if (SC.indexOf(pc) < 0 && !isTone) { const after = real.filter(x => x.t > n.t + 1e-6), nt = after.length ? after[0].t : -1, near = after.filter(x => Math.abs(x.t - nt) < 1e-6);
            if (strong || !near.some(x => Math.abs(x.tm - n.tm) <= 2 || Math.abs((x.fm || x.tm) - n.tm) <= 2)) fail(out.bad, `${tag}: note ${i} (${n.tm}) is outside the key and does not pass by step`); }
        });
        const at = {}; ns.forEach(n => { const k = n.t.toFixed(3); (at[k] = at[k] || []).push(n); });
        Object.values(at).forEach(h => { if (h.length < 2) return; if (new Set(h.map(n => n.s)).size !== h.length) fail(out.bad, `${tag}: two notes at once on one string`);
          const fr = h.map(n => n.f).filter(f => f > 0); if (fr.length > 1 && Math.max(...fr) - Math.min(...fr) > 3) fail(out.bad, `${tag}: notes at once more than four frets apart`); });
        if (GTR) { const last = real[real.length - 1], lt = real.filter(n => Math.abs(n.t - last.t) < 1e-6), lc = chordAtT(last.tb != null ? last.tb : last.t);
          if (!lt.some(n => pcOf(n.tm) === pcOf(key + lc.root))) fail(out.bad, `${tag}: does not end on its chord's root`); }
      }
    }
  }
  Object.assign(S, S0);
  return out;
};

async function numbers(f, room) {
  const t0 = Date.now(), r = await f.evaluate(NUMBERS);
  ok(r.ownBad.length === 0, `${room}: Fit off, all ${r.licks} licks play their own notes as before, in whole bars from beat 1 ${r.ownBad.slice(0, 4).join(" | ")}`);
  ok(r.seams.length === 0 && r.reps === r.bars * 2, `${room}: Repeat 2 and 4 (${r.reps} times checked): each time exactly a lick's bars after the one before, nothing of one time left when the next begins ${r.seams.slice(0, 4).join(" | ")}`);
  ok(r.fast >= 25, `${room}: at 240 beats a minute the fastest notes are ${r.fast.toFixed(1)} ms apart (${r.fastAt}): every lick is playable, no half-time needed`);
  ok(r.n === r.licks * 4 * 10 && r.bad.length === 0, `${room}: Fit to my chords, by numbers (${((Date.now() - t0) / 1000).toFixed(0)} s): ${r.n} fits (${r.licks} licks, 5 progressions with m7, 7, maj7, sus4 and m7♭5 chords, 4 keys, from bar 1 and 2), ${r.notes} notes, ${r.strong} on beats 1 and 3 all in the chord, ${r.moved} in a bar's own hand position ${r.bad.slice(0, 6).join(" | ")}`);
}

/* the click measure aog-solo's lick tests use (energy above 8 kHz in 1 ms windows, against its 70 ms around; each note's attack left out) */
const MEASURE = async (o) => {
  const T = await AOGSolo._t.lickTake(o.id, { fit: o.fit, reps: o.reps, bpm: o.bpm });
  const hp = (x, fc, sr) => { const w0 = 2 * Math.PI * fc / sr, al = Math.sin(w0) / (2 * 0.7071), cs = Math.cos(w0), a0 = 1 + al;
    const b0 = (1 + cs) / 2 / a0, b1 = -(1 + cs) / a0, b2 = (1 + cs) / 2 / a0, a1 = -2 * cs / a0, a2 = (1 - al) / a0, y = new Float32Array(x.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = x[i], q = b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = v; y2 = y1; y1 = q; y[i] = q; } return y; };
  const ab = await T.blob.arrayBuffer(), dv = new DataView(ab), n = (ab.byteLength - 44) / 4, x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = dv.getInt16(44 + i * 4, true) / 32768;
  const sr = 44100, h = hp(x, 8000, sr), W = Math.round(0.001 * sr), nw = Math.floor(n / W), e = new Float64Array(nw);
  let pk = 0, first = -1; for (let i = 0; i < n; i++) { const a = Math.abs(x[i]); if (a > pk) pk = a; if (first < 0 && a > 0.002) first = i; }
  for (let k = 0; k < nw; k++) { let s = 0; for (let i = k * W; i < (k + 1) * W; i++) s += h[i] * h[i]; e[k] = s / W; }
  const skip = new Uint8Array(nw); T.starts.forEach(t => { const a = Math.floor((t - 0.003) * 1000), z = Math.ceil((t + 0.012) * 1000); for (let k = Math.max(0, a); k < Math.min(nw, z); k++) skip[k] = 1; });
  const floor = Math.pow(pk * Math.pow(10, -75 / 20), 2); let worst = 0;
  for (let k = 0; k < nw; k++) { if (skip[k]) continue; let mx = 0; for (let j = Math.max(0, k - 35); j < Math.min(nw, k + 36); j++) if (Math.abs(j - k) > 3 && e[j] > mx) mx = e[j];
    const q = (e[k] + floor) / (mx + floor); if (q > worst) worst = q; }
  return { pk: +pk.toFixed(3), db: +(10 * Math.log10(worst || 1)).toFixed(1), first: first / sr, sec: T.sec, total: T.plan.total, fit: T.plan.fit, ev: T.notes.ev.length, wav: T.blob.type, size: T.blob.size };
};

async function device(b, room, nm, vw, errs) {
  const { ctx, p, f } = await openRoom(b, room, vw, errs);
  if (process.env.LICKSONG_NUMBERS !== "0") await numbers(f, room);
  /* 1 · the words */
  const words = async () => f.evaluate(() => { const q = id => document.getElementById(id), rr = el => el.getBoundingClientRect();
    const row = [q("soFit"), ...q("soRep").querySelectorAll(".pbtn"), q("soRecLick")];
    return { fit: q("soFit").textContent, pressed: q("soFit").getAttribute("aria-pressed"), rep: q("soRep").querySelector(".plab").textContent, reps: [...q("soRep").querySelectorAll(".pbtn")].map(b => b.textContent + "|" + b.getAttribute("aria-label")),
      rec: q("soRecLick").textContent, line: q("soSongLine").textContent, lines: [...document.querySelectorAll("#rig .so-licks .line")].filter(l => /In your song|En tu canción/.test(l.textContent)).length,
      tall: Math.min(...row.map(el => rr(el).height)), wide: document.documentElement.scrollWidth - innerWidth, shown: row.every(el => rr(el).width > 0) }; });
  await f.evaluate(() => { S.key = 9; S.minor = true; S.bpm = 104; buildNeck(); litNeck(); AOGSolo.paint(); document.getElementById("bpm").dispatchEvent(new Event("input", { bubbles: true })); });
  const en = await words();
  ok(en.fit === "Fit to my chords" && en.rep === "Repeat" && en.reps.join() === "1×|1 time,2×|2 times,4×|4 times" && en.rec === "● Record this lick" && en.line === "In your song: A minor, 104 beats a minute." && en.lines === 1,
    `${room} ${nm}: "${en.fit}", "${en.rep}" ${en.reps.join(" ")}, "${en.rec}"; "${en.line}" (once)`);
  ok(en.shown && en.tall >= 44 && en.wide <= 0, `${room} ${nm}: the row is on screen, its buttons ${Math.round(en.tall)} px or taller, no sideways scroll (${en.wide})`);
  await f.evaluate(() => document.getElementById("langBtn").click());
  const es = await words();
  await f.evaluate(() => document.getElementById("langBtn").click());
  ok(es.fit === "Seguir mis acordes" && es.rep === "Repetir" && es.reps.join() === "1×|1 vez,2×|2 veces,4×|4 veces" && es.rec === "● Grabar esta frase" && es.line === "En tu canción: La menor, 104 pulsos por minuto." && es.lines === 1,
    `${room} ${nm}: Spanish: "${es.fit}", "${es.rep}", "${es.rec}"; "${es.line}"`);
  /* 2 · the song's tempo, past the old clamp; Lick speed for practice */
  const id = room === "guitar" ? "g_rgline" : "b_rgdrop";
  const tp = await f.evaluate(async (id) => {
    const sel = document.getElementById("soLickSel"), btn = document.getElementById("soLickBtn"), wait = ms => new Promise(r => setTimeout(r, ms)), r = document.getElementById("soLickSpd");
    sel.value = id; sel.dispatchEvent(new Event("change", { bubbles: true }));
    const one = async (bpm, spd) => { AOGSong.set({ bpm }); await wait(60); r.value = String(spd); r.dispatchEvent(new Event("input", { bubbles: true })); btn.click(); await wait(80); const L = AOGSolo._t.LICK, o = { bpm, spd, beat: L.beat, on: L.on, line: document.getElementById("soSongLine").textContent }; btn.click(); return o; };
    const a = await one(200, 100), b2 = await one(45, 100), c = await one(97.5, 100), d = await one(97.5, 50); await one(104, 100); return [a, b2, c, d];
  }, id);
  ok(Math.abs(tp[0].beat - 60 / 200) < 1e-9 && Math.abs(tp[1].beat - 60 / 45) < 1e-9 && Math.abs(tp[2].beat - 60 / 97.5) < 1e-9 && Math.abs(tp[3].beat - 2 * 60 / 97.5) < 1e-9 && tp.every(x => x.on) && /200 beats/.test(tp[0].line),
    `${room} ${nm}: a song at 200, 45 and 97.5 beats a minute: the lick's beat is ${tp.slice(0, 3).map(x => x.beat.toFixed(4)).join(", ")} s (no clamp); at 50% speed ${tp[3].beat.toFixed(4)} s (practice); "${tp[0].line}"`);
  /* 3 · with the band: Fit on, the room's chords; Fit off, the lick's own */
  const bd = await f.evaluate(async (id) => {
    const sel = document.getElementById("soLickSel"), btn = document.getElementById("soLickBtn"), fit = document.getElementById("soFit"), wait = ms => new Promise(z => setTimeout(z, ms)), B = AOGSolo._t.BAND;
    S.prog = [{ off: 0, q: "min" }, { off: 5, q: "m7" }, { off: 10, q: "dom7" }, { off: 3, q: "maj7" }]; S.preset = ""; litNeck();
    sel.value = id; sel.dispatchEvent(new Event("change", { bubbles: true }));
    document.getElementById("soBand").click(); await wait(400);
    const run = async (on) => { if ((fit.getAttribute("aria-pressed") === "true") !== on) fit.click(); btn.click(); const L = AOGSolo._t.LICK, k0 = Math.round((L.t0 - B.t0) / B.barSec), over = JSON.parse(JSON.stringify(B.over || {}));
      const prog = S.prog, n = L.plan.bars, want = []; for (let j = 0; j < n; j++) want.push(prog[(k0 + j) % prog.length]);
      const lick = L.plan.fit; btn.click(); return { on, k0, fitted: lick, over: Array.from({ length: n }, (x, j) => over[k0 + j]), want, own: AOGSolo._t.lickPlan(id, { fit: false }).over }; };
    const a = await run(true), c = await run(false);
    document.getElementById("soBand").click(); await wait(100); S.prog = []; return { a, c };
  }, id);
  const same = (x, y) => x.length === y.length && x.every((c, i) => c && y[i] && c.off === y[i].off && c.q === y[i].q);
  ok(bd.a.fitted && same(bd.a.over, bd.a.want) && same(bd.c.over, bd.c.own), `${room} ${nm}: with the band, Fit on: the band plays the room's chords under the lick (${bd.a.over.map(c => c.off + c.q).join(" ")}); Fit off: the lick's own (${bd.c.over.map(c => c.off + c.q).join(" ")})`);
  /* 4 · ● Record this lick: a take */
  const rec = await f.evaluate(async (id) => {
    const q = x => document.getElementById(x), wait = ms => new Promise(z => setTimeout(z, ms)), sel = q("soLickSel");
    S.prog = [{ off: 0, q: "min" }, { off: 8, q: "maj" }, { off: 3, q: "maj" }, { off: 10, q: "dom7" }]; S.preset = ""; litNeck();
    AOGSong.set({ bpm: 104 }); await wait(50);
    sel.value = id; sel.dispatchEvent(new Event("change", { bubbles: true }));
    if (q("soFit").getAttribute("aria-pressed") !== "true") q("soFit").click();
    q("soRep").querySelector('[data-so-rep="2"]').click();
    const n0 = AOGStudioRec.last() ? AOGStudioRec.last().n : 0, keyWas = AOGSong.get();
    q("soRecLick").click(); const busy = q("soRecLick").disabled, making = q("soLickLine").textContent;
    const lim = performance.now() + 30000; while (AOGSolo._t.LREC.busy && performance.now() < lim) await wait(100);
    const last = AOGStudioRec.last(), took = AOGSolo._t.LREC.last, line = q("soLickLine").textContent;
    const btns = [...document.querySelectorAll("#takes .aogrec-take")][0], studioBtn = btns && btns.querySelector("[data-aogrec-studio]"), drumBtn = btns && btns.querySelector("[data-aogrec-drum]");
    const layer = studioBtn ? studioBtn.textContent : "";
    if (studioBtn) studioBtn.click(); await wait(800);
    const inbox = (await AOGHandoff.list(AOGHandoff.INBOX)) || [];
    const mine = inbox.map(x => x.value || x).filter(x => x && x.from === (GTR ? "guitar" : "bass")).sort((a, b) => (b.at || 0) - (a.at || 0))[0];
    if (drumBtn) drumBtn.click(); await wait(800);
    const pads = await AOGHandoff.get("padstake");
    const song = AOGSong.get();
    return { busy, making, n0, last, took, line, layer, inbox: mine ? { bpm: mine.bpm, place: mine.place, sec: mine.sec, notes: mine.notes ? mine.notes.ev.length : 0, wav: mine.wav && mine.wav.size } : null,
      pads: pads ? { from: pads.from, id: !!pads.id } : null, song, keyWas, key: S.key, minor: S.minor };
  }, id);
  const want = rec.took ? rec.took.bars * 4 * 60 / 104 : 0;
  ok(rec.busy && rec.making === "Making the take…" && rec.last && rec.last.n === rec.n0 + 1 && rec.last.notes > 0 && rec.took && rec.took.fit && rec.took.bpm === 104 && Math.abs(rec.last.sec - (want + 1.6)) < 0.05 && /^Take \d+ is ready\. Add it to My Track from your takes\.$/.test(rec.line),
    `${room} ${nm}: ● Record this lick (Fit on, Repeat 2, at 104): take ${rec.last && rec.last.n}, ${rec.last && rec.last.sec.toFixed(2)} s (${rec.took && rec.took.bars} bars and the ring-out), ${rec.last && rec.last.notes} notes kept; "${rec.making}" then "${rec.line}"`);
  ok(rec.layer === "+ Add to My Track" && rec.inbox && rec.inbox.bpm === 104 && rec.inbox.place && rec.inbox.place.bar === 1 && rec.inbox.notes > 0 && rec.inbox.wav > 44,
    `${room} ${nm}: "${rec.layer}" puts it in the Studio's inbox at 104 beats a minute, on bar 1, with its notes: ${JSON.stringify(rec.inbox)}`);
  ok(rec.pads && rec.pads.from === room && rec.pads.id, `${room} ${nm}: Send to the Drum Machine puts it on the chops bank: ${JSON.stringify(rec.pads)}`);
  ok(rec.song && rec.song.hasBpm && rec.song.bpm === 104 && rec.song.hasKey && rec.song.key === rec.key && rec.song.minor === rec.minor, `${room} ${nm}: the song keeps 104 and has the room's key: ${JSON.stringify(rec.song)}`);
  const m = await f.evaluate(MEASURE, { id, fit: true, reps: 2, bpm: 104 });
  const m2 = await f.evaluate(MEASURE, { id: room === "guitar" ? "blues" : "b_fkoct", fit: true, reps: 4, bpm: 168 });
  ok([m, m2].every(x => x.pk < 1 && x.pk > 0.02 && x.db <= 15 && x.first < 0.03 && x.ev > 0 && x.wav === "audio/wav"),
    `${room} ${nm}: the take's sound: peaks ${m.pk} and ${m2.pk} (never full scale), worst click ${m.db} and ${m2.db} dB over its neighbours, first sound at ${(m.first * 1000).toFixed(1)} and ${(m2.first * 1000).toFixed(1)} ms (the downbeat)`);
  /* 5 · silent */
  const hush = await f.evaluate(async (id) => { const wait = ms => new Promise(z => setTimeout(z, ms)); document.getElementById("soLickBtn").click(); await wait(200); const was = AOGSolo._t.LICK.on;
    window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: true } })); await wait(50); const now = AOGSolo._t.LICK.on;
    window.dispatchEvent(new CustomEvent("aog-hush", { detail: { on: false } })); return { was, now }; }, id);
  ok(hush.was && !hush.now, `${room} ${nm}: the Studio's hush stops a lick that plays`);
  const rest = await f.evaluate(async () => { await new Promise(r => setTimeout(r, 2500)); window.__calls = []; await new Promise(r => setTimeout(r, 3000));
    const mine = window.__calls.filter(c => /aog-solo\.js|aog-(guitar|bass)-licks\.js/.test(c)); return { mine: mine.length, what: mine.slice(0, 2) }; });
  ok(rest.mine === 0, `${room} ${nm}: afterwards Solo rests: ${rest.mine} timer or frame callbacks from it in 3 s ${rest.what.join(" | ")}`);
  await ctx.close();
}

(async () => {
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] }); const errs = [];
  const only = process.env.LICKSONG_ROOM;
  if (!only || only === "guitar") await device(b, "guitar", "iPhone", { width: 390, height: 844 }, errs);
  if (!only || only === "bass") await device(b, "bass", "iPad", { width: 820, height: 1180 }, errs);
  ok(errs.length === 0, "no page errors " + errs.slice(0, 5).join(" | "));
  console.log(fails ? fails + " FAILED" : "ALL PASS"); await b.close(); srv.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log("CRASH " + (e.stack || e.message)); process.exit(1); });
