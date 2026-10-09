/* The turntables on a phone, an iPad and a computer; in Spanish; readable in every state; every control labelled
   and usable from the keyboard.
   · iPhone: one menu (Show) picks Deck A, B, C or the Mixer; one at a time; nothing wider than the screen.
   · iPad and computer: two decks on the desk (A · B, A · C, B · C), the third waiting with everything it had; from 960 px the
     two decks and the mixer bay are one chassis, below that the mixer is one row under them.
   · Spanish: the decks, the mixer and the crate all speak Spanish (hardware words like SYNC stay as printed on decks).
   · Contrast: the site's own probe (tools/check-contrast.js), run with records on, buttons lit, both benches, both themes. */
const fs = require("fs"), path = require("path");
const { pw, ok, done, open, load } = require("./lib.js");
const srv = require("../srv.js")(9933);
/* the contrast probe, taken word for word from the site's checker */
const ROOT = process.env.AOG_ROOT || path.resolve(__dirname, "../../../aog-deploy");
const SRC = fs.readFileSync(path.resolve(ROOT, "../tools/check-contrast.js"), "utf8");
const PROBE = "(" + SRC.slice(SRC.indexOf("function probe()"), SRC.indexOf("(async () => {")).trim() + ")()";
const visible = `(sel) => [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length && getComputedStyle(e).visibility !== "hidden").map(e => e.id || e.className)`;
const over = p => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
(async () => {
  /* ── 1 · iPhone ── */
  {
    const { b, p, errs } = await open(9933, { device: pw.devices["iPhone 13"], bench: "simple" });
    const sel = p.locator(".viewpick select.aogdd-sel");
    const opts = await sel.evaluate(s => [...s.options].map(o => o.text));
    const shown = async () => p.evaluate(v => (0, eval)(v)("#deckA, #deckB, #deckC, #mixer"), visible);
    const v0 = await shown();
    ok(opts.join() === "Deck A,Deck B,Deck C,Mixer" && v0.join() === "deckA", `phone: one menu (Show: ${opts.join(" · ")}) and one deck on screen (${v0})`);
    await sel.selectOption({ label: "Mixer" }); await p.waitForTimeout(250);
    const v1 = await shown();
    const order = await p.evaluate(() => { const x = document.querySelector("#mixer .xfade").getBoundingClientRect().top, s = document.querySelector("#mixer .strips").getBoundingClientRect().top; return x < s; });
    ok(v1.join() === "mixer" && order && (await over(p)) <= 1, `Mixer: only the mixer shows, the crossfader first (in reach without scrolling past three channels), nothing sideways (${await over(p)} px)`);
    await sel.selectOption({ label: "Deck C" }); await p.waitForTimeout(250);
    const v2 = await shown();
    await load(p, { C: "triphop" });
    const fit = await p.evaluate(() => { const r = document.querySelector("#deckC .platter").getBoundingClientRect(), pads = [...document.querySelectorAll("#deckC .pad")].map(x => x.getBoundingClientRect().height);
      const btns = [...document.querySelectorAll("#deckC .row button, #mixer .strip button")].filter(b => b.getClientRects().length).map(b => b.getBoundingClientRect().height);
      return { left: r.left, right: r.right, w: innerWidth, padMin: Math.min(...pads), btnMin: Math.min(...btns) }; });
    ok(v2.join() === "deckC" && fit.left >= 0 && fit.right <= fit.w && fit.padMin >= 44 && fit.btnMin >= 38 && (await over(p)) <= 1,
      `Deck C: on its own, the platter inside the screen (${fit.left.toFixed(0)}–${fit.right.toFixed(0)} of ${fit.w} px), pads ${fit.padMin.toFixed(0)} px tall, no button under ${fit.btnMin.toFixed(0)} px, nothing sideways`);
    const anim = await p.evaluate(() => document.getAnimations().filter(a => { try { return a.playState === "running" && a.effect.getComputedTiming().iterations === Infinity; } catch (e) { return false; } }).length);
    ok(anim === 0, "nothing animates on its own on a touch screen (" + anim + ")");
    /* the phone in Spanish */
    await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(500);
    const optsEs = await p.locator(".viewpick select.aogdd-sel").evaluate(s => [...s.options].map(o => o.text));
    const labEs = await p.locator(".viewpick .aogdd-lab").textContent();
    ok(optsEs.join() === "Plato A,Plato B,Plato C,Mezclador" && /mostrar/i.test(labEs), `phone in Spanish: ${labEs} · ${optsEs.join(" · ")}`);
    ok(errs.length === 0, "phone: no page errors " + errs.join(" | "));
    await b.close();
  }
  /* ── 2 · iPad and computer: two decks on the desk (AOG-DJ-DESK-V1), the third one tap away ── */
  for (const [name, dev, bench] of [["iPad", pw.devices["iPad (gen 7)"], "full"], ["iPad landscape", { viewport: { width: 1080, height: 810 }, hasTouch: true }, "simple"], ["computer", { viewport: { width: 1280, height: 900 } }, "full"], ["computer", { viewport: { width: 1280, height: 900 } }, "simple"]]) {
    const { b, p, errs } = await open(9933, { device: dev, bench });
    await load(p, { A: "house", B: "disco", C: "techno" });
    const lay = () => p.evaluate(() => {
      const r = id => document.getElementById(id).getBoundingClientRect(), vis = id => document.getElementById(id).getClientRects().length > 0;
      const bay = document.getElementById("bay"), bayOn = !!bay && bay.getClientRects().length > 0, br = bayOn ? bay.getBoundingClientRect() : null;
      const shown = ["deckA", "deckB", "deckC"].filter(vis), d = shown.map(r);
      const rev = r("deckA").width ? document.querySelector("#" + shown[0] + " .revc").getBoundingClientRect() : null, pl = document.querySelector("#" + shown[0] + " .platter").getBoundingClientRect();
      const strips = ["stripA", "stripB", "stripC"].filter(vis), sr = strips.map(r), x = document.getElementById("xf").getBoundingClientRect();
      const sync = document.querySelector("#" + shown[0] + " [data-sync]").getBoundingClientRect(), key = document.querySelector("#" + shown[0] + " [data-key]").getBoundingClientRect();
      const pads = [...document.querySelectorAll("#" + shown[0] + " .pad")].map(e => e.getBoundingClientRect());
      return { shown, tops: d.map(x => Math.round(x.top)), lefts: d.map(x => Math.round(x.left)), rights: d.map(x => Math.round(x.right)), bay: br && [Math.round(br.left), Math.round(br.right)], strips,
        stripRow: sr.length === 2 && Math.abs(sr[0].top - sr[1].top) <= 2 && sr[0].right <= x.left + 1 && x.right <= sr[1].left + 1, xfInBay: !!document.querySelector("#bay #xf"),
        revClear: rev.top >= pl.bottom - 0.5 || rev.right <= pl.left || rev.left >= pl.right, platRound: Math.abs(pl.width - pl.height) < 1, platW: Math.round(pl.width),
        syncLeftOfKey: sync.right <= key.left && Math.abs(sync.top - key.top) < 2, syncAbovePads: sync.bottom <= Math.min(...pads.map(e => e.top)),
        padMin: Math.min(...pads.map(e => Math.min(e.width, e.height))), padRows: new Set(pads.map(e => Math.round(e.top))).size,
        pairOn: [...document.querySelectorAll("#pairs [data-pair]")].filter(e => e.classList.contains("on")).map(e => e.textContent), waiting: document.getElementById("waiting").textContent,
        pick: getComputedStyle(document.getElementById("viewpick")).display, w: innerWidth };
    });
    const L = await lay();
    const wide = L.w >= 960;
    ok(L.shown.join() === "deckA,deckB" && Math.abs(L.tops[0] - L.tops[1]) <= 2 && L.lefts[0] < L.lefts[1] && L.pick === "none" && L.pairOn.join() === "A · B" && /^C is waiting · Driving Techno$/.test(L.waiting),
      `${name} (${L.w} px, ${bench}): two decks on the desk (${L.shown}), A · B lit, "${L.waiting}"`);
    if (wide) ok(L.bay && L.bay[0] === L.rights[0] && L.bay[1] === L.lefts[1] && L.xfInBay, `${name}: one chassis, deck A ${L.lefts[0]}–${L.rights[0]}, the bay ${L.bay}, deck B from ${L.lefts[1]}: no paper between them; the crossfader is in the bay`);
    else ok(!L.bay && L.stripRow, `${name}: under the decks one mixer row: channel ${L.strips[0].slice(-1)}, the crossfader, channel ${L.strips[1].slice(-1)}`);
    ok(L.revClear && L.platRound && L.syncLeftOfKey && L.syncAbovePads && L.padMin >= 44 && (await over(p)) <= 1,
      `${name}: REV under the record, never on it; the platter round (${L.platW} px); SYNC left of KEY, above the pads; pads ${L.padMin.toFixed(0)} px, ${L.padRows} row(s); nothing sideways`);
    if (name === "iPad landscape") {
      /* the deck scrolled to the top of the screen: SYNC and all eight pads on screen at 1080 × 810 */
      await p.evaluate(() => { const d = document.getElementById("decks"); scrollTo(0, d.getBoundingClientRect().top + scrollY - 56); }); await p.waitForTimeout(200);
      const fit = await p.evaluate(() => { const pads = [...document.querySelectorAll("#deckA .pad")].map(e => e.getBoundingClientRect()), s = document.querySelector("#deckA [data-sync]").getBoundingClientRect();
        return { sync: s.bottom <= innerHeight, pads: pads.every(e => e.top >= 0 && e.bottom <= innerHeight), bottom: Math.round(Math.max(...pads.map(e => e.bottom))), h: innerHeight }; });
      ok(fit.sync && fit.pads, `1080 × 810: SYNC and the eight pads fully on screen with the desk in view (pads end at ${fit.bottom} of ${fit.h} px)`);
    }
    /* A · C: C comes up; B is parked, its song, cues and pitch untouched */
    await p.evaluate(() => { const d = decks[1]; d.cues[2] = 4410; const i = document.querySelector('[data-speed="B"]'); i.value = "1.03"; i.dispatchEvent(new Event("input")); });
    const before = await p.evaluate(() => ({ buf: decks[1].buf, cue: decks[1].cues[2], pitch: decks[1].pitch, name: decks[1].name }));
    await p.click('[data-pair="AC"]'); await p.waitForTimeout(200);
    const L2 = await lay();
    const after = await p.evaluate(() => ({ same: !!decks[1].buf && decks[1].buf.length > 0, cue: decks[1].cues[2], pitch: decks[1].pitch, name: decks[1].name, sides: decks.map(d => d.side).join("") }));
    ok(L2.shown.join() === "deckA,deckC" && L2.pairOn.join() === "A · C" && /^B is waiting · Disco Edit$/.test(L2.waiting) && after.same && after.cue === before.cue && after.pitch === before.pitch && after.name === before.name && after.sides.startsWith("L") && after.sides.endsWith("R"),
      `${name}: A · C puts C on the desk; B waits with its song, pad 3 and pitch ${after.pitch} untouched ("${L2.waiting}"; sides ${after.sides})`);
    ok(errs.length === 0, `${name}: no page errors ` + errs.join(" | "));
    await b.close();
  }
  /* the bay's channel fader is the mixer's volume */
  {
    const { b, p, errs } = await open(9933, { bench: "simple", ctx: { viewport: { width: 1280, height: 900 } } });
    await load(p, { A: "house" });
    await p.evaluate(() => document.querySelector('#bay [data-bfader="A"]').scrollIntoView({ block: "end" })); await p.waitForTimeout(200);
    const f = await p.locator('#bay [data-bfader="A"]').boundingBox();
    await p.mouse.move(f.x + f.width / 2, f.y + f.height - 60); await p.mouse.down(); await p.mouse.move(f.x + f.width / 2, f.y + f.height - 2, { steps: 4 }); await p.mouse.up();
    const v1 = await p.evaluate(() => ({ vol: decks[0].vol, strip: +document.querySelector('#strips [data-vol="A"]').value }));
    await p.focus('#bay [data-bvol="A"]'); await p.keyboard.press("End");
    const v2 = await p.evaluate(() => decks[0].vol);
    ok(v1.vol < 0.05 && v1.strip === v1.vol && v2 === 1, `the bay's fader A drags the channel down (${v1.vol}, the mixer's slider follows: ${v1.strip}) and the keyboard brings it up (${v2})`);
    ok(errs.length === 0, "bay: no page errors " + errs.join(" | "));
    await b.close();
  }
  /* ── 3 · Spanish shows Spanish ── */
  {
    const { b, p, errs } = await open(9933, { bench: "full" });
    await load(p, { A: "house", B: "disco", C: "techno" });
    await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(600);
    await p.evaluate(() => document.querySelector('#made [data-spine="made:0"]').click()); await p.waitForTimeout(200);
    const es = await p.evaluate(() => {
      const q = s => [...document.querySelectorAll(s)].map(e => e.textContent.trim());
      return { decks: q(".deck h2"), mixer: document.getElementById("mixH").textContent, made: document.querySelector("#made h3").textContent,
        madeNames: q("#made .spine .sp-t"), fx: q('[data-fxtype="A"]'), kills: q('[data-kill="A"]'), side: q('[data-side="A"]'), go: document.querySelector('[data-play="A"]').textContent,
        load: document.querySelector('[data-dock="A"]').textContent, chop: document.querySelector('[data-chop="A"]').textContent, erase: document.querySelector('[data-erase="A"]').textContent,
        bars: document.querySelector('[data-loop="A"][data-beats="16"]').textContent, snap: [...document.querySelector('[data-snap="A"]').options].map(o => o.text),
        rec: document.getElementById("recBtn").textContent, hint: document.getElementById("padHint").textContent, onto: document.querySelector("#made .sleeve .sb button").getAttribute("aria-label"),
        song: document.querySelector("#deckA .song").textContent, lang: document.documentElement.lang };
    });
    const want = es.decks.join() === "Plato A,Plato B,Plato C" && es.mixer === "Mezclador" && es.made === "Discos" && es.fx.join() === "Eco,Sala,Flanger" &&
      es.kills.join() === "CORTA AGUDOS,CORTA MEDIOS,CORTA GRAVES" && es.side.join() === "Izq.,Ninguno,Der." && es.go === "Arrancar" && es.load === "Cargar una canción" &&
      es.chop === "Cortar 8" && es.erase === "Borrar" && es.bars === "4 compases" && es.snap.join() === "en el pulso,en ½ pulso,en ¼ de pulso,al instante" &&
      /Grabar/.test(es.rec) && /^Pads: toca/.test(es.hint) && es.onto === "House de Chicago · Al plato A" && es.madeNames.join() === "House de Chicago,Techno con empuje,Break trip-hop polvoriento,Edit de disco,Trip-hop ahumado,Trip-hop de medianoche,Trip-hop de ventana con lluvia,Boom bap del sótano,Boom bap de la era dorada,Boom bap de cypher" && es.lang === "es";
    ok(want, "in Spanish: " + [es.decks.join("/"), es.mixer, es.made, es.fx.join("/"), es.kills.join("/"), es.side.join("/"), es.go, es.load, es.chop, es.erase, es.bars, es.snap.join("/"), es.rec, es.onto, es.madeNames.join("/")].join(" · "));
    /* and no English left on the decks, the mixer or the crate (hardware words such as SYNC, KEY, SLIP, CUE, MASTER stay as printed) */
    const left = await p.evaluate(() => {
      const ENG = /\b(Deck [ABC]|Mixer|Made right here|Amount|Beats|Left|Right|None|Lands|Chop 8|Erase|4 bars|Start|Stop|Load a song|Take it off|Set cue|Effect|Volume|Filter|Reverb|Echo|on the beat|Onto deck|Pitch|Nudge|Crossfader side|No song yet|Record\b|Up next|Starter crate|Previously spun)\b/;
      const out = [], w = document.createTreeWalker(document.querySelector(".wrap"), NodeFilter.SHOW_TEXT);
      for (let n; (n = w.nextNode());) { const t = n.nodeValue.trim(); if (!t) continue; const el = n.parentElement; if (!el || !el.getClientRects().length || el.closest("script,style,.aogdd-src,option,#lessons,footer,.pg,.bench-bar,header")) continue; if (ENG.test(t)) out.push(t.slice(0, 40)); }
      const attrs = [...document.querySelectorAll("#decks [aria-label], #mixer [aria-label], #cratecard [aria-label], #decks [title]")].map(e => (e.getAttribute("aria-label") || "") + " " + (e.getAttribute("title") || "")).filter(s => ENG.test(s));
      return out.concat(attrs.map(a => "label: " + a.slice(0, 40)));
    });
    ok(left.length === 0, "no English left on the decks, the mixer or the crate" + (left.length ? ": " + left.slice(0, 8).join(" | ") : ""));
    ok(errs.length === 0, "Spanish: no page errors " + errs.join(" | "));
    await b.close();
  }
  /* ── 4 · readable in every state ── */
  for (const [theme, bench, lang] of [["light", "full", ""], ["dark", "full", ""], ["light", "simple", "es"], ["dark", "full", "es"]]) {
    const { b, p, errs } = await open(9933, { bench, lang, theme, ctx: { colorScheme: theme, viewport: { width: 1024, height: 1300 } } });
    const th = await p.evaluate(() => document.documentElement.getAttribute("data-theme"));
    ok(th === theme, `the page opened in the ${th} theme`);
    await load(p, { A: "house", B: "disco", C: "techno" });
    /* light every kind of button: master, sync, loop, kill, effect, side, erase, a set pad, record */
    await p.evaluate(() => { document.querySelector('[data-sync="B"]').click(); document.querySelector('[data-kill="A"][data-band="low"]').click();
      document.querySelector('[data-fxtype="C"][data-v="flanger"]').click(); document.querySelector('[data-side="C"][data-v="R"]').click(); document.querySelector('[data-erase="C"]').click(); });
    await p.evaluate(() => document.querySelectorAll(".dmore").forEach(x => { x.open = true; }));   /* the rest of each deck, opened: read too */
    await p.click('[data-play="A"]'); await p.waitForTimeout(400);
    await p.click('[data-loop="A"][data-beats="4"]'); await p.click('[data-chop="A"]'); await p.click("#recBtn"); await p.waitForTimeout(700);
    const bad = await p.evaluate(PROBE);
    await p.click("#recBtn"); await p.waitForTimeout(500);
    const bad2 = await p.evaluate(PROBE);
    ok(bad.length === 0 && bad2.length === 0, `${theme} · ${bench} bench${lang ? " · Spanish" : ""}: every word readable with records on and every kind of button lit (${bad.concat(bad2).slice(0, 4).map(x => x.ratio + ":1 " + x.where + " \"" + x.text + "\"").join(" | ") || "none under 3:1"})`);
    ok(errs.length === 0, `${theme} ${bench}: no page errors ` + errs.join(" | "));
    await b.close();
  }
  /* ── 5 · every control labelled, and the keyboard does what a finger does ── */
  {
    const { b, p, errs } = await open(9933, { bench: "full" });
    await load(p, { A: "house" });
    const unnamed = await p.evaluate(() => [...document.querySelectorAll("#decks button, #decks select, #decks input, #mixer button, #mixer select, #mixer input, #made button")].filter(e => e.getClientRects().length).filter(e => {
      const by = (e.getAttribute("aria-labelledby") || "").split(/\s+/).map(id => document.getElementById(id)).filter(Boolean).map(x => x.textContent).join(" ").trim();
      const name = (e.getAttribute("aria-label") || "").trim() || by || (e.textContent || "").trim() || (e.labels && e.labels[0] && e.labels[0].textContent.trim()) || (e.closest("label") && e.closest("label").textContent.trim()) || "";
      return !name; }).map(e => e.outerHTML.slice(0, 80)));
    ok(unnamed.length === 0, "every button, menu and slider on the decks and the mixer has a name" + (unnamed.length ? ": " + unnamed.join(" | ") : ""));
    const tabbable = await p.evaluate(() => [...document.querySelectorAll("#deckA .pad, #deckA [data-loop], #stripA [data-kill], #deckA .platter, #stripA input, #xf")].every(e => e.tabIndex >= 0 && !e.disabled));
    ok(tabbable, "the pads, loops, kills, sliders, the platter and the crossfader can all be reached with Tab");
    await p.focus("#deckA .platter"); await p.keyboard.press("Space"); await p.waitForTimeout(600);
    const k1 = await p.evaluate(() => decks[0].motor);
    await p.focus('[data-hot="A"][data-i="0"]'); await p.keyboard.press("Enter"); await p.waitForTimeout(150);
    const k2 = await p.evaluate(() => decks[0].cues[0] != null);
    await p.keyboard.press("Delete"); await p.waitForTimeout(100);
    const k3 = await p.evaluate(() => decks[0].cues[0] == null);
    await p.focus('[data-loop="A"][data-beats="2"]'); await p.keyboard.press("Space"); await p.waitForTimeout(250);
    const k4 = await p.evaluate(() => decks[0].loopOn && decks[0].loopBeats === 2 && document.querySelector('[data-loop="A"][data-beats="2"]').getAttribute("aria-pressed") === "true");
    await p.focus('[data-kill="A"][data-band="mid"]'); await p.keyboard.press("Enter"); await p.waitForTimeout(150);
    const k5 = await p.evaluate(() => decks[0].eq.killed("mid"));
    await p.focus("#xf"); await p.keyboard.press("Home"); await p.waitForTimeout(100);
    const k6 = await p.evaluate(() => +document.getElementById("xf").value === 0 && decks[1].xgv === 0);
    await p.focus('[data-cue="A"]'); await p.keyboard.down("Space"); await p.waitForTimeout(250);
    const k7 = await p.evaluate(() => decks[0].cueHeld); await p.keyboard.up("Space"); await p.waitForTimeout(150);
    const k8 = await p.evaluate(() => !decks[0].cueHeld && !decks[0].motor);
    ok(k1 && k2 && k3 && k4 && k5 && k6 && k7 && k8, `by keyboard alone: Space starts the platter (${k1}), Enter marks a pad (${k2}) and Delete empties it (${k3}), Space sets a 2-beat loop (${k4}), Enter kills the mids (${k5}), Home sends the crossfader to A (${k6}), holding Space on CUE plays from the mark and letting go stops (${k7}, ${k8})`);
    ok(errs.length === 0, "keyboard: no page errors " + errs.join(" | "));
    await b.close();
  }
  srv.close(); process.exit(done() ? 1 : 0);
})().catch(e => { console.log("CRASH", e.stack); process.exit(1); });
