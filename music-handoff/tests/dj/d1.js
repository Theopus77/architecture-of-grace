/* The turntables, three decks: the records made on the page load on all three and play; SYNC locks a deck to
   the MASTER's tempo (within 0.1 BPM, measured on the audio clock) and onto its beat, and keeps it there when the
   master moves; three decks at full volume still come out under 0 dBFS; nothing throws. */
const { ok, done, open, load, snap, realBpm, take } = require("./lib.js");
const srv = require("../srv.js")(9930);
(async () => {
  const { b, p, errs } = await open(9930);
  /* 1 · three decks, three records made right here */
  const t0 = Date.now();
  await load(p, { A: "house", B: "disco", C: "techno" });
  const info = await p.evaluate(() => decks.map(d => ({ id: d.id, name: d.name, bpm: d.bpm, beat0: d.beat0, sec: +d.buf.duration.toFixed(1), made: d.made })));
  ok(info.length === 3 && info[0].bpm === 125 && info[1].bpm === 120 && info[2].bpm === 135 && info.every(x => x.beat0 === 0 && x.sec > 120),
    `three records on three decks in ${((Date.now() - t0) / 1000).toFixed(1)} s, each over two minutes, tempo exact: ` + info.map(x => `${x.id} ${x.name} ${x.bpm} BPM ${x.sec} s`).join(" · "));
  const strips = await p.evaluate(() => [...document.querySelectorAll(".strip")].map(s => s.id));
  ok(strips.join() === "stripA,stripB,stripC", "the mixer has a channel for each deck: " + strips.join(", "));
  /* 2 · A plays; it becomes the master */
  await p.click('[data-play="A"]'); await p.waitForTimeout(1600);
  const a1 = await snap(p, "A"); await p.waitForTimeout(1500); const a2 = await snap(p, "A");
  const st = await p.evaluate(() => ({ motor: decks[0].motor, master: masterId, label: document.querySelector('[data-play="A"]').textContent }));
  ok(st.motor && st.master === "A" && Math.abs(realBpm(a1, a2) - 125) < 0.1 && /Stop/.test(st.label), `deck A plays at ${realBpm(a1, a2).toFixed(3)} BPM and leads (MASTER): ` + JSON.stringify(st));
  /* 3 · B and C SYNC to A and start: they land on A's tempo and on its beat */
  await p.click('[data-sync="B"]'); await p.click('[data-play="B"]');
  /* AOG-DJ-DESK-V1: two decks on the desk; A · C brings C up, and B keeps playing off the desk */
  await p.click('[data-pair="AC"]');
  await p.click('[data-sync="C"]'); await p.click('[data-play="C"]');
  await p.waitForTimeout(2500);
  const s1 = await Promise.all(["A", "B", "C"].map(id => snap(p, id)));
  await p.waitForTimeout(4000);
  const s2 = await Promise.all(["A", "B", "C"].map(id => snap(p, id)));
  const real = s1.map((x, i) => realBpm(x, s2[i]));
  ok(Math.abs(s2[1].eff - 125) < 0.1 && Math.abs(s2[2].eff - 125) < 0.1, `SYNC shows 125 on all three: A ${s2[0].eff.toFixed(2)}, B ${s2[1].eff.toFixed(2)} (pitch ${((s2[1].pitch - 1) * 100).toFixed(2)}%), C ${s2[2].eff.toFixed(2)} (pitch ${((s2[2].pitch - 1) * 100).toFixed(2)}%)`);
  ok(real.every(r => Math.abs(r - 125) < 0.1), "and that is what the audio really plays, measured on the audio clock over 4 s: " + real.map(r => r.toFixed(3)).join(" / ") + " BPM");
  const ph = await p.evaluate(() => { const m = decks[0]; return [1, 2].map(i => { const d = decks[i]; return phaseErr(d, m, Math.max(d.frame, m.frame), syncRatio(d, m).f); }); });
  const bpmA = 125, ms = ph.map(e => Math.abs(e) * 60 / bpmA * 1000);
  ok(ms.every(x => x < 2), "the beats line up: B and C sit " + ms.map(x => x.toFixed(2) + " ms").join(" and ") + " from A's beat");
  /* 4 · the master moves; the synced decks follow at once */
  await p.evaluate(() => { const i = document.querySelector('[data-speed="A"]'); i.value = "1.02"; i.dispatchEvent(new Event("input")); });
  await p.waitForTimeout(1500);
  const f1 = await Promise.all(["A", "B", "C"].map(id => snap(p, id))); await p.waitForTimeout(3000);
  const f2 = await Promise.all(["A", "B", "C"].map(id => snap(p, id)));
  const fr = f1.map((x, i) => realBpm(x, f2[i]));
  ok(fr.every(r => Math.abs(r - 127.5) < 0.1), "A's pitch to +2%: all three now play " + fr.map(r => r.toFixed(3)).join(" / ") + " BPM (127.5 wanted)");
  const ph2 = await p.evaluate(() => { const m = decks[0]; return [1, 2].map(i => { const d = decks[i]; return Math.abs(phaseErr(d, m, Math.max(d.frame, m.frame), syncRatio(d, m).f)) * 60 / effBpm(m) * 1000; }); });
  ok(ph2.every(x => x < 3), "and stay on its beat: " + ph2.map(x => x.toFixed(2) + " ms").join(", "));
  /* 5 · MASTER moves to C by hand; A, now synced, follows C */
  await p.evaluate(() => { const i = document.querySelector('[data-speed="A"]'); i.value = "1"; i.dispatchEvent(new Event("input")); });
  await p.click('[data-master="C"]'); await p.click('[data-sync="A"]'); await p.waitForTimeout(2500);
  const mm = await p.evaluate(() => ({ master: masterId, effA: effBpm(decks[0]), effC: effBpm(decks[2]), syncC: decks[2].syncLock, pressed: document.querySelector('[data-master="C"]').getAttribute("aria-pressed") }));
  ok(mm.master === "C" && mm.pressed === "true" && !mm.syncC && Math.abs(mm.effA - mm.effC) < 0.1, "MASTER pressed on C: C leads (its own SYNC lets go) and A follows it: " + JSON.stringify(mm));
  /* 6 · three decks at full volume, every EQ band lifted, crossfader in the middle: the mix still never clips */
  await p.evaluate(() => { decks.forEach(d => { d.side = "N"; ["low", "mid", "high"].forEach(bd => { const i = document.querySelector(`[data-eq="${d.id}"][data-band="${bd}"]`); i.value = "1"; i.dispatchEvent(new Event("input")); }); }); setMix(); });
  await p.waitForTimeout(400);
  const tk = await take(p, 6000);
  ok(tk && tk.sec > 5 && tk.peak < 1 && tk.flat === 0 && tk.rms > -30, `three decks, +6 dB on every band: the take peaks at ${tk && (20 * Math.log10(tk.peak)).toFixed(2)} dBFS, no clipped samples (${tk && tk.flat}), level ${tk && tk.rms.toFixed(1)} dB`);
  const rows = await p.evaluate(() => [...document.querySelectorAll("#takes .take")].map(r => r.querySelectorAll("[data-totake]").length));
  ok(rows.length === 1 && rows[0] === 3, "the take can go onto any of the three decks (" + rows + " buttons)");
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await b.close(); srv.close(); process.exit(done() ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
