/* The turntables on a phone, an iPad and a computer; in Spanish; readable in every state; every control labelled
   and usable from the keyboard.
   · iPhone: one menu (Show) picks Deck A, B, C or the Mixer; one at a time; nothing wider than the screen.
   · iPad and computer: the three decks side by side, the mixer's three channels side by side under them.
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
  /* ── 2 · iPad and computer: side by side ── */
  for (const [name, dev] of [["iPad", pw.devices["iPad (gen 7)"]], ["computer", { viewport: { width: 1280, height: 900 } }]]) {
    const { b, p, errs } = await open(9933, { device: dev, bench: "full" });
    const lay = await p.evaluate(() => {
      const r = id => document.getElementById(id).getBoundingClientRect();
      const d = ["deckA", "deckB", "deckC"].map(r), s = ["stripA", "stripB", "stripC"].map(r), m = r("mixer");
      return { tops: d.map(x => Math.round(x.top)), lefts: d.map(x => Math.round(x.left)), widths: d.map(x => Math.round(x.width)), stops: s.map(x => Math.round(x.top)), slefts: s.map(x => Math.round(x.left)),
               mixerBelow: m.top >= Math.max(...d.map(x => x.bottom)) - 1, pick: getComputedStyle(document.getElementById("viewpick")).display, w: innerWidth };
    });
    const same = a => Math.max(...a) - Math.min(...a) <= 2;
    ok(same(lay.tops) && lay.lefts[0] < lay.lefts[1] && lay.lefts[1] < lay.lefts[2] && same(lay.widths) && lay.pick === "none",
      `${name} (${lay.w} px): the three decks side by side, ${lay.widths[0]} px each, no menu needed`);
    ok(same(lay.stops) && lay.slefts[0] < lay.slefts[1] && lay.slefts[1] < lay.slefts[2] && lay.mixerBelow && (await over(p)) <= 1, `${name}: the mixer's three channels side by side under the decks; nothing sideways`);
    ok(errs.length === 0, `${name}: no page errors ` + errs.join(" | "));
    await b.close();
  }
  /* ── 3 · Spanish shows Spanish ── */
  {
    const { b, p, errs } = await open(9933, { bench: "full" });
    await load(p, { A: "house", B: "disco", C: "techno" });
    await p.evaluate(() => document.getElementById("langBtn").click()); await p.waitForTimeout(600);
    const es = await p.evaluate(() => {
      const q = s => [...document.querySelectorAll(s)].map(e => e.textContent.trim());
      return { decks: q(".deck h2"), mixer: document.getElementById("mixH").textContent, made: document.querySelector("#made h3").textContent,
        madeNames: q("#made .mi b"), fx: q('[data-fxtype="A"]'), kills: q('[data-kill="A"]'), side: q('[data-side="A"]'), go: document.querySelector('[data-play="A"]').textContent,
        load: document.querySelector('[data-dock="A"]').textContent, chop: document.querySelector('[data-chop="A"]').textContent, erase: document.querySelector('[data-erase="A"]').textContent,
        bars: document.querySelector('[data-loop="A"][data-beats="16"]').textContent, snap: [...document.querySelector('[data-snap="A"]').options].map(o => o.text),
        rec: document.getElementById("recBtn").textContent, hint: document.getElementById("padHint").textContent, onto: document.querySelector("#made .onto em").textContent,
        song: document.querySelector("#deckA .song").textContent, lang: document.documentElement.lang };
    });
    const want = es.decks.join() === "Plato A,Plato B,Plato C" && es.mixer === "Mezclador" && es.made === "Hechos aquí mismo" && es.fx.join() === "Eco,Sala,Flanger" &&
      es.kills.join() === "CORTA AGUDOS,CORTA MEDIOS,CORTA GRAVES" && es.side.join() === "Izq.,Ninguno,Der." && es.go === "Arrancar" && es.load === "Cargar una canción" &&
      es.chop === "Cortar 8" && es.erase === "Borrar" && es.bars === "4 compases" && es.snap.join() === "en el pulso,en ½ pulso,en ¼ de pulso,al instante" &&
      /Grabar/.test(es.rec) && /^Pads: toca/.test(es.hint) && es.onto === "Al plato" && es.madeNames.join() === "House de Chicago,Techno con empuje,Break trip-hop polvoriento,Edit de disco" && es.lang === "es";
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
