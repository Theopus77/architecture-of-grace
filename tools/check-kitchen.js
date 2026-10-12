#!/usr/bin/env node
/* AOG KITCHEN CHECK — Jimmy (2026-10-12): "Could we not take this amazement to FACS for cooking and sewing lessons? Have
   this person cook recipes by preloaded or the viewer plugs it in." The Kitchen Lab (kitchen.html, /kitchen-lab;
   aog-kitchen.js, aog-kitchen3d.js, aog-kitchen-recipes.js) works every picture out from (step, how far through it),
   and reads recipes people type in, so a change could quietly teach the wrong thing. This checks:
     · the words: all 28 kitchen skills and all 9 recipes, in English and Spanish, with how-to steps and a safe habit;
       every recipe step names only skills, tools and ingredients the kitchen knows,
     · the recipe reader: seven different recipes (English and Spanish, numbered or not, fractions like "1 1/2 cups",
       units like "taza" and "2 tbsp", verbs like "picar" and "hornear") are read on the device and scale ½×, 2×, 3×,
     · the 3D kitchen: every skill shows the right tool in the right hand (the knife's tip on the board, a turner to flip,
       oven mitts at the oven, a thermometer …) and the hands reach what they hold; every recipe step shows its skill,
     · calm and silent: Go plays one step once and stops; "Watch the whole recipe" plays once and stops; ◀ ▶ step it;
       nothing draws or asks for frames while idle; "reduce motion" shows the end at once; timers never run in real time,
     · every address the FACS course links to (/kitchen-lab#skill-<each skill>, #<each recipe>, #plug-in) opens it,
     · the plug-in panel: read, preview, scale, save on this device, still there after a reload, played from the list,
     · the camera menu, dragging to walk around, the dark (night) look, letting go of the 3D cleanly,
     · iPhone and iPad, English and Spanish: no sideways scroll.
       node tools/check-kitchen.js
   Exit code 1 when anything fails. Run it after any change to the Kitchen Lab's files (see CLAUDE.md). */
const path = require("path"), fs = require("fs"), http = require("http"), cp = require("child_process");
let pw; try { pw = require("playwright"); } catch (e) { pw = require(cp.execSync("npm root -g").toString().trim() + "/playwright"); }
const ROOT = path.join(__dirname, "..", "aog-deploy");
const R = require(path.join(ROOT, "aog-kitchen-recipes.js"));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".woff2": "font/woff2" };
const server = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split("?")[0].split("#")[0]);
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r);
});
let fails = 0;
const ok = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) fails++; };
const wait = ms => new Promise(o => setTimeout(o, ms));

/* the ids fixed by the 3D contract (aog-deploy/_work/engine3d/CONTRACT.md) */
const SKILLS = ["wash-hands", "tie-hair", "measure-dry", "measure-liquid", "crack-egg", "whisk", "stir", "fold", "pour", "chop", "slice", "dice",
  "mince", "peel", "grate", "knead", "roll-dough", "spread", "season", "flip", "saute", "boil", "simmer", "bake", "check-temp", "plate", "wipe-clean", "wash-dishes"];
const RECIPES = ["fruit-salad", "yogurt-parfait", "scrambled-eggs", "pancakes", "veggie-stir-fry", "tomato-pasta", "vinaigrette", "quick-bread", "pizza-dough"];
/* what must be in the cook's hand at some moment of each skill (R = right, L = left; "shown" = on the counter in view) */
const HOLD = {
  "measure-dry": { R: "straight", L: "cups" }, "measure-liquid": { shown: "jug" }, whisk: { R: "whisk" }, stir: { R: "spoon" }, fold: { R: "spatula" },
  pour: { R: "jug" }, chop: { R: "knife" }, slice: { R: "knife" }, dice: { R: "knife" }, mince: { R: "knife" }, peel: { R: "peeler" },
  grate: { shown: "grater" }, "roll-dough": { shown: "pin" }, spread: { R: "spoon" }, flip: { R: "turner" }, saute: { R: "spatula" },
  simmer: { R: "spoon" }, "check-temp": { R: "thermo" }, plate: { R: "spoon" }, "wipe-clean": { R: "cloth" }, "wash-dishes": { R: "sponge" },
  bake: { mitts: true }, boil: { shown: "spoon" }
};
const KNIVES = ["chop", "slice", "dice", "mince"];

/* ── 1. the words and the recipes, straight from the data ── */
function words() {
  const missing = SKILLS.filter(id => !R.ACTIONS[id]);
  ok(!missing.length, "all 28 kitchen skills from the contract are there" + (missing.length ? " (missing: " + missing.join(", ") + ")" : ""));
  ok(SKILLS.every(id => R.SKILLS.includes(id)), "every skill is in the Skills menu");
  const badW = SKILLS.filter(id => { const A = R.ACTIONS[id]; return !A || ["en", "es"].some(l => !A[l] || !A[l].n || !Array.isArray(A[l].how) || A[l].how.length < 2 || !A[l].safe) || A.en.how.length !== A.es.how.length; });
  ok(!badW.length, "every skill has a name, how-to steps and a safe habit in English and Spanish" + (badW.length ? " (" + badW.join(", ") + ")" : ""));
  const badT = SKILLS.filter(id => R.ACTIONS[id] && R.ACTIONS[id].tools.some(t => !R.TOOLS[t]));
  ok(!badT.length, "every skill's tools are named in both languages" + (badT.length ? " (" + badT.join(", ") + ")" : ""));
  ok(/20/.test(R.ACTIONS["wash-hands"].en.how.join(" ")) && R.ACTIONS["wash-hands"].en.how.length === 5 && R.ACTIONS["wash-hands"].clock && R.ACTIONS["wash-hands"].clock.sec === 20,
     "handwashing has all five steps and a 20-second scrub");
  ok(/claw/i.test(R.ACTIONS.chop.en.how.join(" ")) && /tip/i.test(R.ACTIONS.chop.en.how.join(" ")) && /garra/i.test(R.ACTIONS.chop.es.how.join(" ")), "chopping teaches the claw grip and the knife tip on the board");
  ok(/level|straight edge/i.test(R.ACTIONS["measure-dry"].en.how.join(" ")) && /eye/i.test(R.ACTIONS["measure-liquid"].en.how.join(" ")), "dry measures are levelled; liquids are read at eye level");
  ok(/flat/i.test(R.ACTIONS["crack-egg"].en.how.join(" ")) && /mitt/i.test(JSON.stringify(R.ACTIONS.bake.en)) && /thickest/i.test(JSON.stringify(R.ACTIONS["check-temp"].en)),
     "eggs crack on a flat surface; the oven uses mitts; the thermometer goes in the thickest part");
  ok(/tilt/i.test(R.ACTIONS.whisk.en.how.join(" ")) && /turner/i.test(R.ACTIONS.flip.en.how.join(" ")) && /fold|over/i.test(R.ACTIONS.fold.en.how.join(" ")), "the whisk's bowl tilts, flips use a turner, folding lifts and turns over");
  ok(/165/.test(JSON.stringify(R.ACTIONS["check-temp"])) && /74/.test(JSON.stringify(R.ACTIONS["check-temp"])), "safe temperatures are given in °F and °C");

  const missR = RECIPES.filter(id => !R.RECIPES.find(r => r.id === id));
  ok(!missR.length, "all 9 recipes from the contract are there" + (missR.length ? " (missing: " + missR.join(", ") + ")" : ""));
  const probs = [];
  R.RECIPES.forEach(r => {
    if (!r.en || !r.es || !r.en.n || !r.es.n) probs.push(r.id + ": name");
    if (!r.ing.length || r.ing.some(i => !i.en || !i.es)) probs.push(r.id + ": ingredients");
    if (!Array.isArray(r.allergens)) probs.push(r.id + ": allergens");
    if (!r.steps.length) probs.push(r.id + ": steps");
    if (!r.steps.some(s => s.a.includes("wash-hands"))) probs.push(r.id + ": no handwashing");
    r.steps.forEach((s, k) => {
      if (!s.a.length || s.a.some(a => !R.ACTIONS[a] || (a === "counter" && !s.rise))) probs.push(r.id + " step " + (k + 1) + ": unknown skill " + s.a.join("+"));
      (s.tools || []).forEach(t => { if (!R.TOOLS[t]) probs.push(r.id + " step " + (k + 1) + ": unknown tool " + t); });
      (s.ing || []).forEach(i => { if (!r.ing.find(x => x.k === i)) probs.push(r.id + " step " + (k + 1) + ": unknown ingredient " + i); });
      if (!s.en || !s.es) probs.push(r.id + " step " + (k + 1) + ": words");
    });
  });
  ok(!probs.length, "every recipe step names known skills, tools and ingredients, in both languages" + (probs.length ? " — " + probs.slice(0, 6).join("; ") : ""));
  const alg = id => R.RECIPES.find(r => r.id === id).allergens;
  ok(alg("pancakes").includes("egg") && alg("pancakes").includes("milk") && alg("pancakes").includes("wheat") && alg("scrambled-eggs").includes("egg") && alg("pizza-dough").includes("wheat"),
     "allergens are named (pancakes: egg, milk, wheat; eggs: egg; pizza dough: wheat)");
  const pan = R.RECIPES.find(r => r.id === "pancakes"), fl = pan.ing.find(i => i.q != null && i.u === "cup");
  ok(fl && R.fmtAmount(fl, 2, "en") !== R.fmtAmount(fl, 1, "en") && /taza/.test(R.fmtAmount(fl, 1, "es")), "a recipe's amounts scale and are written in Spanish units (" + (fl ? R.fmtAmount(fl, 0.5, "en") + " · " + R.fmtAmount(fl, 3, "es") : "") + ")");
}

/* ── 2. the recipe reader, on the device ── */
const SAMPLES = [
  { lang: "en", text: "Banana oat muffins\nIngredients\n1 1/2 cups flour\n1 cup oats\n1/2 cup sugar\n2 tsp baking powder\n2 ripe bananas\n1 egg\n3/4 cup milk\n1/3 cup oil\nSteps\n1. Wash your hands.\n2. Heat the oven to 375°F.\n3. Peel the bananas and mash them in a bowl.\n4. Crack in the egg. Whisk in the milk and oil.\n5. Measure the flour, oats, sugar and baking powder. Fold them in.\n6. Spoon into a muffin tin and bake for 20 minutes.",
    title: "Banana oat muffins", ing: 8, first: [1.5, "cup"], steps: 6, want: [["wash-hands"], ["bake"], ["peel", "stir"], ["crack-egg", "whisk"], ["measure-dry", "fold"], ["bake"]], alg: ["wheat", "egg", "milk"], timer: 20, temp: 375 },
  { lang: "es", text: "Licuado de frutas en tazón\nIngredientes\n1 plátano\n1 taza de fresas\n1/2 taza de yogur natural\n2 cucharadas de granola\n1 cucharadita de miel\nPasos\n1. Lávate las manos.\n2. Enjuaga las fresas.\n3. Pela el plátano y córtalo en rodajas.\n4. Pica las fresas.\n5. Pon el yogur en un tazón y revuelve con la miel.\n6. Sirve con la fruta y la granola encima.",
    title: "Licuado de frutas en tazón", ing: 5, first: [1, ""], second: [1, "cup"], steps: 6, want: [["wash-hands"], ["rinse"], ["peel", "slice"], ["chop"], ["stir"], ["plate"]], alg: ["milk", "wheat"] },
  { lang: "en", text: "Guacamole\n2 avocados\n1/2 onion, finely chopped\n1 lime\npinch of salt\nMash the avocados. Mince the onion. Stir in the lime juice and salt. Serve.",
    title: "Guacamole", ing: 4, first: [2, ""], steps: 4, want: [["stir"], ["mince"], ["stir"], ["plate"]], alg: [] },
  { lang: "es", text: "Bizcocho\nIngredientes:\n200 g de harina\n250 ml de leche\n2 huevos\n1 1/2 tazas de azúcar\nPaso 1: Bate los huevos.\nPaso 2: Mezcla la harina con la leche.\nPaso 3: Hornea a 180 °C por 25 minutos.",
    title: "Bizcocho", ing: 4, first: [200, "g"], fourth: [1.5, "cup"], steps: 3, want: [["whisk"], ["stir"], ["bake"]], alg: ["wheat", "milk", "egg"], timer: 25, tempC: 180 },
  { lang: "en", text: "Pancakes\n• 1½ c. flour\n• ¾ cup milk\n- 2 tbsp oil\nDirections\n1) Whisk everything together.\n2) Pour 1/4 cup onto a hot pan.\n3) Flip when bubbles pop.\n4) Juggle the plates.",
    title: "Pancakes", ing: 3, first: [1.5, "cup"], third: [2, "tbsp"], steps: 4, want: [["whisk"], ["pour"], ["flip"], ["counter"]], unsure: 1, alg: ["wheat", "milk"] },
  { lang: "en", text: "Chicken bites\n1 lb chicken breast\n2 tbsp olive oil\nSteps\n1. Dice the chicken.\n2. Sauté in the oil for 8 minutes.\n3. Check that it reaches 165°F with a food thermometer.\n4. Wipe the counter and wash the dishes.",
    title: "Chicken bites", ing: 2, first: [1, "lb"], steps: 4, want: [["dice"], ["saute"], ["check-temp"], ["wipe-clean", "wash-dishes"]], alg: [], temp: 165 },
  { lang: "es", text: "Pizza\nIngredientes\n2 tazas de harina\n1 sobre de levadura\n3/4 taza de agua tibia\nPasos\n1. Amasa la masa 8 minutos.\n2. Estira la masa con el rodillo.\n3. Unta la salsa.\n4. Ralla el queso y espolvoréalo.\n5. Hornea a 450 °F 12 minutos.",
    title: "Pizza", ing: 3, first: [2, "cup"], steps: 5, want: [["knead"], ["roll-dough"], ["spread"], ["grate", "season"], ["bake"]], alg: ["wheat"], timer: 12, temp: 450 },
  { lang: "es", text: "Pasta con tomate\nIngredientes\n1/2 libra de espaguetis\n1 lata de tomate triturado\n2 dientes de ajo\nPreparación\nHierve el agua. Cocina la pasta 10 minutos. Pica el ajo y saltéalo. Cocina a fuego lento la salsa 15 minutos. Escurre la pasta y sirve.",
    title: "Pasta con tomate", ing: 3, first: [0.5, "lb"], steps: 5, want: [["boil"], ["boil"], ["chop", "saute"], ["simmer"], ["pour", "plate"]], alg: ["wheat"] }
];
function reader() {
  SAMPLES.forEach(s => {
    const r = R.read(s.text, s.lang), errs = [];
    if (r.en.n !== s.title) errs.push("title “" + r.en.n + "”");
    if (r.ing.length !== s.ing) errs.push(r.ing.length + " ingredients");
    const q = (i, w) => { const x = r.ing[i]; if (w && (!x || Math.abs(x.q - w[0]) > 1e-6 || x.u !== w[1])) errs.push("ingredient " + (i + 1) + " read as " + (x ? x.q + " " + x.u : "nothing")); };
    q(0, s.first); q(1, s.second); q(2, s.third); q(3, s.fourth);
    if (r.steps.length !== s.steps) errs.push(r.steps.length + " steps");
    else s.want.forEach((w, k) => { if (r.steps[k].a.join("+") !== w.join("+")) errs.push("step " + (k + 1) + " → " + r.steps[k].a.join("+") + " (wanted " + w.join("+") + ")"); });
    if (r.steps.some(st => st.a.some(a => !R.ACTIONS[a]))) errs.push("a step maps to an unknown skill");
    if ((s.unsure || 0) !== r.steps.filter(st => st.sure === false).length) errs.push("steps shown at the counter: " + r.steps.filter(st => st.sure === false).length);
    if (r.steps.some(st => st.sure === false && st.a.join() !== "counter")) errs.push("an unknown step does not fall back to the counter");
    if (s.alg.slice().sort().join() !== r.allergens.slice().sort().join()) errs.push("allergens " + r.allergens.join(","));
    if (s.timer && !r.steps.some(st => st.timer && st.timer.min === s.timer)) errs.push("no " + s.timer + "-minute timer");
    if (s.temp && !r.steps.some(st => st.temp && st.temp.f === s.temp)) errs.push("no " + s.temp + " °F");
    if (s.tempC && !r.steps.some(st => st.temp && st.temp.c === s.tempC)) errs.push("no " + s.tempC + " °C");
    // scaling: ½×, 2×, 3× change every measured amount, and stay readable kitchen fractions
    const measured = r.ing.filter(i => i.q != null);
    [0.5, 2, 3].forEach(f => measured.forEach(i => { const a = R.fmtAmount(i, f, s.lang); if (!a || a === R.fmtAmount(i, 1, s.lang) || /\d\.\d{3}/.test(a)) errs.push("scaling " + f + "× of " + i.raw + " → " + a); }));
    if (r.unknown.length) errs.push("lines not understood: " + r.unknown.join(" | "));
    ok(!errs.length, `the reader understands “${s.title}” (${s.lang === "es" ? "Spanish" : "English"}; ${measured.length} amounts scale ½× 2× 3×)` + (errs.length ? " — " + errs.join("; ") : ""));
  });
  const a = R.readIngredient("1 1/2 cups flour"), b = R.readIngredient("2 tbsp sugar"), c = R.readIngredient("2 tazas de leche"), d = R.readIngredient("1 cucharada de aceite");
  ok(a.q === 1.5 && a.u === "cup" && b.q === 2 && b.u === "tbsp" && c.q === 2 && c.u === "cup" && c.name === "leche" && d.u === "tbsp", "“1 1/2 cups”, “2 tbsp”, “2 tazas de leche”, “1 cucharada” are read right");
  const v = s => R.verbsIn(s).join("+");
  ok(v("Pica la cebolla.") === "chop" && v("Hornea 20 minutos.") === "bake" && v("Bate los huevos.") === "whisk" && v("Pela las papas.") === "peel" && v("Voltea el panqueque.") === "flip" && v("Ralla el queso.") === "grate",
     "Spanish cooking verbs (picar, hornear, batir, pelar, voltear, rallar) become the right skills");
  ok(R.read("", "en").steps.length === 0 && R.read("hello there", "en").ing.length === 0, "an empty or odd paste is handled calmly");
}

(async () => {
  words(); reader();
  await new Promise(o => server.listen(0, o)); const port = server.address().port, URL = `http://127.0.0.1:${port}/kitchen.html`;
  const b = await pw.chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });   // WebGL for the 3D kitchen
  const outside = [];
  async function ctxFor(vp, touch, extra) {
    const ctx = await b.newContext(Object.assign({ viewport: vp, isMobile: !!touch, hasTouch: !!touch }, extra || {}));
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => { outside.push(r.request().url()); r.abort(); });
    await ctx.addInitScript(() => {   // count the animation frames the page asks for
      window.__raf = 0; const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = f => { window.__raf++; return raf(f); };
    });
    return ctx;
  }
  async function pageIn(ctx, hash, untilReady) {
    const p = await ctx.newPage(); p.errs = [];
    p.on("pageerror", e => p.errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) p.errs.push(m.text()); });
    await p.goto(URL + (hash ? "#" + hash : ""), { waitUntil: "load" });
    if (untilReady !== false) await ready(p);
    return p;
  }
  async function ready(p) { for (let i = 0; i < 120 && await p.evaluate(() => window.AOGKitchen && window.AOGKitchen.K3state) !== "ready"; i++) await wait(250);
    return await p.evaluate(() => window.AOGKitchen.K3state); }
  const fast = p => p.evaluate(() => { const A = window.AOGKitchen; Object.values(A.R.ACTIONS).forEach(a => { a._secs = a._secs || a.secs; a.secs = 0.12; }); });
  async function untilStopped(p, ms) { for (let t = 0; t < (ms || 15000); t += 100) { if (!await p.evaluate(() => window.AOGKitchen.P.playing)) return true; await wait(100); } return false; }
  const idle = async (p, ms) => { const a = await p.evaluate(() => [window.__raf, window.AOGKitchen.K3.renders()]); await wait(ms || 1200); const z = await p.evaluate(() => [window.__raf, window.AOGKitchen.K3.renders()]); return { raf: z[0] - a[0], renders: z[1] - a[1] }; };

  /* ── 3. a first visit on a computer: the words at once, the 3D right after, then still ── */
  const ctx = await ctxFor({ width: 1280, height: 900 });
  const p0 = await ctx.newPage(); p0.errs = []; p0.on("pageerror", e => p0.errs.push(e.message));
  await p0.goto(URL + "#pancakes", { waitUntil: "domcontentloaded" });
  const first = await p0.evaluate(() => ({ h2: (document.querySelector("#card h2") || {}).textContent, steps: document.querySelectorAll("#card ol.steps > li").length,
    ing: document.querySelectorAll("#card ul.ing li").length, wait: document.getElementById("wait").textContent, three: !!document.querySelector("#stage canvas") }));
  ok(first.h2 === "Fluffy pancakes" || (first.h2 && first.steps === 10 && first.ing > 3), `the recipe card is there at once (“${first.h2}”, ${first.ing} ingredients, ${first.steps} steps)`);
  ok(/Getting the kitchen ready/.test(first.wait), "“Getting the kitchen ready…” shows while the 3D loads");
  ok(await ready(p0) === "ready", "the 3D kitchen opens right after");
  const loaded = await p0.evaluate(() => performance.getEntriesByType("resource").map(e => e.name.replace(location.origin, "")));
  ok(loaded.some(u => /three\.module/.test(u)) && loaded.some(u => /aog-figure3d/.test(u)) && loaded.some(u => /aog-kitchen3d/.test(u)), "it loads three.js, the figure and the kitchen from this site");
  let q = await idle(p0, 1500);
  ok(q.raf === 0 && q.renders === 0, `still while idle (${q.raf} frames asked, ${q.renders} drawings in 1.5 s)`);
  const card = await p0.evaluate(() => ({ alg: Array.from(document.querySelectorAll("#card .tag.alg")).map(e => e.textContent), tools: document.querySelectorAll("#card ul.tools li").length,
    on: Array.from(document.querySelectorAll("#card ol.steps > li")).findIndex(li => li.classList.contains("on")), safe: !!document.querySelector("#card .note.safe") }));
  ok(card.alg.length >= 3 && card.tools >= 4 && card.on === 0 && card.safe, `the card shows allergens (${card.alg.join(", ")}), tools, the safe habits, and lights the current step`);
  // scaling on the card
  const sc = await p0.evaluate(() => { const g = () => document.querySelector("#card ul.ing li .q").textContent; const a = g(); document.querySelector('#scaleSeg [data-f="2"]').click(); const b2 = g(); document.querySelector('#scaleSeg [data-f="0.5"]').click(); const h = g(); document.querySelector('#scaleSeg [data-f="1"]').click(); return [a, b2, h]; });
  ok(sc[0] !== sc[1] && sc[0] !== sc[2] && sc[1] !== sc[2], `½× 1× 2× change the amounts (${sc[2]} · ${sc[0]} · ${sc[1]})`);
  // Go plays one step once and stops; ◀ ▶
  await fast(p0);
  const r0 = await p0.evaluate(() => window.AOGKitchen.K3.renders());
  await p0.evaluate(() => document.getElementById("goBtn").click());
  const playing = await p0.evaluate(() => window.AOGKitchen.P.playing);
  const stopped = await untilStopped(p0, 60000);
  const after = await p0.evaluate(() => { const A = window.AOGKitchen; return { k: A.P.k, u: A.P.u, label: document.getElementById("goBtn").textContent, r: A.K3.renders() }; });
  ok(playing && stopped && after.k === 0 && after.u === 1 && after.r > r0 + 2, `Go plays the first step once and stops at its end (button now “${after.label}”)`);
  q = await idle(p0, 1000); ok(q.raf === 0 && q.renders === 0, "after the step: no frames, no drawing");
  await p0.evaluate(() => document.getElementById("nextBtn").click()); await p0.evaluate(() => document.getElementById("nextBtn").click()); await p0.evaluate(() => document.getElementById("prevBtn").click());
  const nav = await p0.evaluate(() => ({ k: window.AOGKitchen.P.k, on: Array.from(document.querySelectorAll("#card ol.steps > li")).findIndex(li => li.classList.contains("on")) }));
  ok(nav.k === 1 && nav.on === 1, "▶ ▶ ◀ move one step at a time and the card lights the step");
  await p0.evaluate(() => { const s = document.getElementById("scrub"); s.value = 500; s.dispatchEvent(new Event("input")); });
  ok(await p0.evaluate(() => Math.abs(window.AOGKitchen.P.u - 0.5) < 0.01 && !window.AOGKitchen.P.playing), "the slider moves through a step by hand");
  // speed
  const sp = await p0.evaluate(() => { const A = window.AOGKitchen; const out = []; document.querySelectorAll("#speedRow [data-speed]").forEach(b => out.push(b.getAttribute("data-speed"))); document.querySelector('#speedRow [data-speed="vslow"]').click(); const v = A.state.speed; document.querySelector('#speedRow [data-speed="normal"]').click(); return [out.length, v]; });
  ok(sp[0] === 3 && sp[1] === "vslow", "three speeds: Normal, Slow, Very slow");
  // the whole recipe plays once and stops
  const steps = await p0.evaluate(() => window.AOGKitchen.rec.steps.length);
  await p0.evaluate(() => { window.__seen = new Set(); const A = window.AOGKitchen; window.__seenT = setInterval(() => window.__seen.add(A.P.k), 20); });
  await p0.evaluate(() => document.getElementById("wholeBtn").click());
  const wholeStop = await untilStopped(p0, 180000);
  const wh = await p0.evaluate(() => { clearInterval(window.__seenT); const A = window.AOGKitchen; return { k: A.P.k, u: A.P.u, whole: A.P.whole, seen: window.__seen.size }; });
  ok(wholeStop && wh.k === steps - 1 && wh.u === 1 && !wh.whole && wh.seen >= steps - 1, `“Watch the whole recipe” plays all ${steps} steps once and stops at the end`);
  q = await idle(p0, 1000); ok(q.raf === 0 && q.renders === 0, "after the recipe: no frames, no drawing");
  // timers: shown, never in real time
  const tm = await p0.evaluate(() => { const A = window.AOGKitchen; const k = A.rec.steps.findIndex(s => s.timer); A.setStep(k, 0.5); const st = A.rec.steps[k];
    return { k, min: st.timer && st.timer.min, shown: !document.getElementById("clock").hidden, txt: document.getElementById("clockBig").textContent + " " + document.getElementById("clockSmall").textContent, secs: A.plan(st).total }; });
  ok(tm.k >= 0 && tm.shown && /minute/.test(tm.txt) && tm.secs < 30, `a timer is shown on the clock (“${tm.txt}”) and plays in ${tm.secs.toFixed(1)} s, never in real time`);
  // camera menu and walking around
  const cams = await p0.evaluate(() => Array.from(document.querySelectorAll("#viewRow [data-view]")).map(b => b.getAttribute("data-view")));
  const dd = await p0.evaluate(() => { const s = document.querySelector("#viewRow") && document.querySelector("#viewRow").closest(".viewrow").querySelector("select"); return s ? s.options.length : 0; });
  ok(cams.join() === "shoulder,across,hands,walk" && dd >= 4, "the camera menu has Over the shoulder, Across the counter, Close on the hands, Walk around");
  const camPos = {};
  for (const v of cams) camPos[v] = await p0.evaluate(v => { window.AOGKitchen.setView(v); return window.AOGKitchen.K3.camera.position.toArray().map(x => +x.toFixed(2)).join(","); }, v);
  ok(new Set(Object.values(camPos)).size === 4, "each camera view looks from its own place");
  const box = await (await p0.$("#stage canvas")).boundingBox();
  const beforeDrag = await p0.evaluate(() => [window.AOGKitchen.K3.renders(), window.AOGKitchen.K3.camera.position.x]);
  await p0.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p0.mouse.down(); await p0.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 20, { steps: 6 }); await p0.mouse.up();
  const afterDrag = await p0.evaluate(() => [window.AOGKitchen.K3.renders(), window.AOGKitchen.K3.camera.position.x]);
  ok(afterDrag[0] > beforeDrag[0] && Math.abs(afterDrag[1] - beforeDrag[1]) > 0.05, "dragging walks the camera around the kitchen (drawn only while dragging)");
  q = await idle(p0, 800); ok(q.raf === 0 && q.renders === 0, "after the drag: still");
  await p0.evaluate(() => window.AOGKitchen.setView("shoulder"));
  // night look
  const nightR = await p0.evaluate(() => window.AOGKitchen.K3.renders());
  await p0.evaluate(() => document.getElementById("themeBtn").click()); await wait(200);
  const night = await p0.evaluate(() => ({ r: window.AOGKitchen.K3.renders(), bg: window.AOGKitchen.K3.scene.background.getHexString() }));
  ok(night.r > nightR && night.bg !== "f3ece0", "the dark theme turns the kitchen to its night look (drawn once)");
  await p0.evaluate(() => document.getElementById("themeBtn").click()); await wait(100);
  ok(!p0.errs.length, "no errors on a computer" + (p0.errs.length ? ": " + p0.errs.slice(0, 3).join(" | ") : ""));

  /* ── 4. every skill: the right tool in the right hand, hands that reach, one play that stops ──
     (on a narrow window, so the many pictures draw quickly) */
  await p0.close();
  const ctxS = await ctxFor({ width: 480, height: 800 });
  const pk = await pageIn(ctxS, "skill-chop");
  const sk = await pk.evaluate(async ([SK, HOLD, KNIVES]) => {
    const A = window.AOGKitchen, out = {};
    for (const id of SK) {
      A.openSkill(id, true);
      const o = { action: true, hold: !HOLD[id], knife: true, reach: 0, h2: (document.querySelector("#card h2") || {}).textContent, how: document.querySelectorAll("#card ol.how li").length, lit: 0 };
      for (let i = 1; i < 16; i++) {
        const u = i / 16; A.setStep(0, u); const f = A.K3.info();
        if (f.action !== id) o.action = f.action;
        const H = HOLD[id];
        if (H && ((!H.R || (f.hands.R.tool === H.R && f.hands.R.gap < 0.05)) && (!H.L || (f.hands.L.tool === H.L && f.hands.L.gap < 0.05)) && (!H.shown || f.tools.includes(H.shown)) && (!H.mitts || f.mitts))) o.hold = true;
        if (KNIVES.includes(id) && f.knifeTipY != null && (f.knifeTipY < f.boardTop - 0.012 || (u >= 0.15 && u <= 0.85 && Math.abs(f.knifeTipY - f.boardTop) > 0.012))) o.knife = u.toFixed(2) + ": " + (f.knifeTipY - f.boardTop).toFixed(3);
        if (H && !o.hold) o.seen = (o.seen || "") + " " + u.toFixed(2) + ":" + f.hands.R.tool + "/" + (f.hands.R.gap || 0).toFixed(2) + "," + f.hands.L.tool + "," + f.tools.join("+") + (f.mitts ? ",mitts" : "");
        ["R", "L"].forEach(S => { if (f.hands[S].miss != null) o.reach = Math.max(o.reach, f.hands[S].miss); });
        if (document.querySelector("#card ol.how li.on")) o.lit++;
      }
      out[id] = o;
    }
    return out;
  }, [SKILLS, HOLD, KNIVES]);
  const wrongA = SKILLS.filter(id => sk[id].action !== true || sk[id].h2 !== R.ACTIONS[id].en.n || sk[id].how < 2);
  ok(!wrongA.length, "every skill opens with its own card and the cook does that skill all the way through" + (wrongA.length ? " (" + wrongA.map(id => id + "→" + sk[id].action).join(", ") + ")" : ""));
  const wrongH = SKILLS.filter(id => !sk[id].hold);
  ok(!wrongH.length, "the right tool is in the right hand (knife, whisk, spoon, spatula, turner, thermometer, straight edge, mitts …)" + (wrongH.length ? " (" + wrongH.map(id => id + ":" + (sk[id].seen || "").slice(0, 300)).join(", ") + ")" : ""));
  ok(KNIVES.every(id => sk[id].knife === true), "chop, slice, dice and mince keep the knife's tip on the board, and it never goes through it" + (KNIVES.some(id => sk[id].knife !== true) ? " (" + KNIVES.filter(id => sk[id].knife !== true).map(id => id + " " + sk[id].knife).join(", ") + ")" : ""));
  const far = SKILLS.filter(id => sk[id].reach > 0.07);
  ok(!far.length, "the hands reach what they hold (within 7 cm all the way through)" + (far.length ? " (" + far.map(id => id + " " + Math.round(sk[id].reach * 100) + " cm").join(", ") + ")" : ""));
  ok(SKILLS.every(id => sk[id].lit > 4), "the skill card lights the part of the skill the cook is doing");
  // one skill played with Go stops by itself
  await pk.evaluate(() => window.AOGKitchen.openSkill("chop", true)); await fast(pk);
  await pk.evaluate(() => document.getElementById("goBtn").click()); const skStop = await untilStopped(pk, 60000);
  ok(skStop && await pk.evaluate(() => window.AOGKitchen.P.u === 1), "a skill plays once with Go and stops");

  /* ── 5. every recipe, in English and Spanish: each step shows its own skill ── */
  for (const lang of ["en", "es"]) {
    const res = await pk.evaluate(async ([RC, lang]) => {
      const A = window.AOGKitchen; if (A.state.lang !== lang) document.getElementById("langBtn").click();
      const out = [];
      for (const id of RC) {
        A.openRecipe(id, true); const r = A.rec, bad = [];
        const h2 = document.querySelector("#card h2").textContent, want = lang === "es" ? r.es.n : r.en.n;
        if (h2 !== want) bad.push("title");
        if (document.querySelectorAll("#card ol.steps > li").length !== r.steps.length) bad.push("steps on the card");
        r.steps.forEach((st, k) => { [0.25, 0.75].forEach(u => { A.setStep(k, u); const a = A.K3.info().action; if (!st.a.includes(a)) bad.push("step " + (k + 1) + " shows " + a); }); });
        out.push([id, bad]);
      }
      return out;
    }, [RECIPES, lang]);
    const badR = res.filter(x => x[1].length);
    ok(!badR.length, `all 9 recipes in ${lang === "es" ? "Spanish" : "English"}: the card and every step's skill` + (badR.length ? " — " + badR.map(x => x[0] + ": " + x[1].slice(0, 3).join(", ")).join("; ") : ""));
  }
  const esWords = await pk.evaluate(() => ({ go: document.getElementById("goBtn").textContent, h1: document.getElementById("mastH").textContent, lang: document.documentElement.lang }));
  ok(esWords.lang === "es" && /Laboratorio de Cocina/.test(esWords.h1) && /Ir|Otra vez/.test(esWords.go), "the page speaks Spanish when ES is chosen");
  await pk.evaluate(() => document.getElementById("langBtn").click());
  ok(!pk.errs.length, "no errors through every skill and recipe" + (pk.errs.length ? ": " + pk.errs.slice(0, 3).join(" | ") : ""));

  /* ── 6. letting go of the 3D ── */
  const disp = await pk.evaluate(() => { const A = window.AOGKitchen, c = document.querySelector("#stage canvas"), gl = c.getContext("webgl2") || c.getContext("webgl"); A.K3.dispose(); return { gone: !document.querySelector("#stage canvas"), lost: gl ? gl.isContextLost() : true }; });
  ok(disp.gone && disp.lost, "leaving the 3D lets go of the drawing and the graphics chip");
  await pk.close(); await ctxS.close();

  /* ── 7. every address the FACS course links to ── */
  const linked = new Set();
  const scan = d => { for (const f of fs.readdirSync(d)) { const full = path.join(d, f), st = fs.statSync(full);
    if (st.isDirectory()) { if (!/node_modules|vendor|fast|front/.test(f)) scan(full); }
    else if (/\.(html|py|json|js)$/.test(f) && st.size < 4e6) { const t = fs.readFileSync(full, "utf8"); let m; const re = /kitchen-lab#([a-z0-9-]+)/g; while ((m = re.exec(t))) if (m[1] !== "skill-") linked.add(m[1]); } } };
  scan(ROOT);
  const want = new Set(SKILLS.map(s => "skill-" + s).concat(RECIPES, ["plug-in"]).concat(Array.from(linked)));
  const pa = await ctx.newPage(); pa.errs = []; pa.on("pageerror", e => pa.errs.push(e.message));
  const wrongAddr = [];
  for (const h of want) {
    await pa.goto("about:blank"); await pa.goto(URL + "#" + h, { waitUntil: "domcontentloaded" });
    const got = await pa.evaluate(() => { const A = window.AOGKitchen; return { mode: A.state.mode, skill: A.state.skill, recipe: A.state.recipe, h2: (document.querySelector("#card h2") || {}).textContent, ta: !!document.getElementById("mineText") }; });
    const okk = /^skill-/.test(h) ? got.mode === "skill" && got.skill === h.slice(6) && got.h2 === R.ACTIONS[h.slice(6)].en.n
      : h === "plug-in" ? got.mode === "mine" && got.ta : got.mode === "recipe" && got.recipe === h && got.h2 === R.RECIPES.find(r => r.id === h).en.n;
    if (!okk) wrongAddr.push(h);
  }
  ok(!wrongAddr.length, `all ${want.size} addresses open the right thing (/kitchen-lab#skill-<28 skills>, #<9 recipes>, #plug-in; ${linked.size} found linked in the site)` + (wrongAddr.length ? " (" + wrongAddr.join(", ") + ")" : ""));
  // hashchange, without a reload
  await ready(pa);
  const hc = await pa.evaluate(async () => { const A = window.AOGKitchen, out = [];
    for (const h of ["skill-crack-egg", "vinaigrette", "plug-in", "skill-flip"]) { location.hash = h; await new Promise(o => setTimeout(o, 80)); out.push(A.state.mode + ":" + (A.state.mode === "skill" ? A.state.skill : A.state.mode === "recipe" ? A.state.recipe : "mine") + ":" + (A.K3 ? A.K3.info().action : "")); }
    return out; });
  ok(hc.join() === "skill:crack-egg:crack-egg,recipe:vinaigrette:wash-hands,mine:mine:counter,skill:flip:flip", "changing the address on the page opens the new skill, recipe or panel (" + hc.join(" · ") + ")");
  ok(!pa.errs.length, "no errors opening the addresses" + (pa.errs.length ? ": " + pa.errs.slice(0, 3).join(" | ") : ""));
  await pa.close(); await ctx.close();

  /* ── 8. reduce motion: each step's end at once ── */
  const cr = await ctxFor({ width: 1280, height: 900 }, false, { reducedMotion: "reduce" });
  const pr = await pageIn(cr, "skill-chop");
  const rm = await pr.evaluate(() => { const A = window.AOGKitchen; const f0 = window.__raf; document.getElementById("goBtn").click(); const one = { u: A.P.u, playing: A.P.playing, raf: window.__raf - f0 };
    A.openRecipe("pancakes", true); document.getElementById("wholeBtn").click(); return { REDUCE: A.REDUCE, one, whole: { k: A.P.k, u: A.P.u, playing: A.P.playing, last: A.rec.steps.length - 1 }, raf: window.__raf - f0 }; });
  ok(rm.REDUCE && rm.one.u === 1 && !rm.one.playing && rm.whole.k === rm.whole.last && rm.whole.u === 1 && !rm.whole.playing && rm.raf === 0,
     "with “reduce motion”, Go shows the step's end at once and the whole recipe shows the finished dish, with no animation frames");
  await cr.close();

  /* ── 9. plug in your own recipe: read, preview, scale, save, reload, play ── */
  const cp2 = await ctxFor({ width: 390, height: 844 }, true, { deviceScaleFactor: 2 });
  const pp = await pageIn(cp2, "plug-in");
  const ta = await pp.evaluate(() => { const t = document.getElementById("mineText"); return { fs: parseFloat(getComputedStyle(t).fontSize), w: t.getBoundingClientRect().width }; });
  ok(ta.fs >= 16 && ta.w > 300, `the recipe box is a full-width 16px text area on an iPhone (${ta.fs}px), so iOS does not zoom`);
  const before = outside.length;
  await pp.fill("#mineText", SAMPLES[0].text); await pp.evaluate(() => document.getElementById("readBtn").click()); await wait(150);
  const pv = await pp.evaluate(() => ({ h: (document.querySelector("#preview h3") || {}).textContent, ing: document.querySelectorAll("#preview ul.ing li").length, steps: document.querySelectorAll("#preview ol.steps > li").length,
    alg: document.querySelectorAll("#preview .tag.alg").length, q: (document.querySelector("#preview ul.ing li .q") || {}).textContent }));
  ok(/What I understood/.test(pv.h) && pv.ing === 8 && pv.steps === 6 && pv.alg === 3 && pv.q === "1½ cups", `Read it shows what it understood: ${pv.ing} ingredients (first “${pv.q}”), ${pv.steps} steps, ${pv.alg} allergens`);
  ok(outside.length === before, "the recipe is read on this device: nothing is sent anywhere");
  await pp.click('#scaleSeg [data-f="3"]'); await wait(80);
  ok(await pp.evaluate(() => document.querySelector("#preview ul.ing li .q").textContent) === "4½ cups", "3× scales your recipe (1½ cups → 4½ cups)");
  await pp.click('#scaleSeg [data-f="1"]');
  // an odd line is shown, and an unknown step is played calmly at the counter
  await pp.fill("#mineText", SAMPLES[4].text + "\n???"); await pp.evaluate(() => document.getElementById("readBtn").click()); await wait(100);
  const odd = await pp.evaluate(() => ({ unsure: document.querySelectorAll("#preview .tag.unsure").length, notes: Array.from(document.querySelectorAll("#preview .note")).map(n => n.textContent).join(" ") }));
  ok(odd.unsure === 1 && /no cooking word I know/.test(odd.notes) && /did not understand/.test(odd.notes) && /\?\?\?/.test(odd.notes), "the preview names the step it could not picture and the line it did not understand" + (odd.unsure === 1 && /\?\?\?/.test(odd.notes) ? "" : " — " + JSON.stringify(odd)));
  await pp.evaluate(() => { const A = window.AOGKitchen; A.setStep(3, 0.5); });
  ok(await pp.evaluate(() => window.AOGKitchen.K3.info().action === "counter" && /Juggle/.test(document.getElementById("stageDesc").textContent)), "an unknown step is shown at the counter with its own words");
  // save on this device, reload, open from the list, play
  await pp.fill("#mineText", SAMPLES[1].text); await pp.evaluate(() => document.getElementById("readBtn").click()); await wait(100);
  await pp.evaluate(() => document.getElementById("saveBtn").click()); await wait(1000);
  const saved = await pp.evaluate(() => JSON.parse(localStorage.getItem("aog.kitchen.mine.v1") || "[]"));
  ok(saved.length === 1 && saved[0].title === "Licuado de frutas en tazón" && /córtalo/.test(saved[0].text), "Save keeps the recipe on this device");
  await pp.reload({ waitUntil: "load" }); await ready(pp);
  const list = await pp.evaluate(() => ({ saved: Array.from(document.querySelectorAll("#card .saved span:first-child")).map(s => s.textContent), menu: Array.from(document.querySelectorAll("#recipeRow [data-recipe]")).map(b => b.textContent) }));
  ok(list.saved.includes("Licuado de frutas en tazón") && list.menu.some(t => /^Saved: Licuado/.test(t)), "after a reload it is still in the saved list and the recipe menu" + (list.saved.includes("Licuado de frutas en tazón") && list.menu.some(t => /^Saved: Licuado/.test(t)) ? "" : " — " + JSON.stringify(list).slice(0, 300)));
  await pp.click("#card [data-open]"); await wait(150);
  const opened = await pp.evaluate(() => { const A = window.AOGKitchen; return { mode: A.state.mode, id: A.state.recipe, n: A.rec.steps.length, h2: document.querySelector("#card h2").textContent, hash: location.hash }; });
  ok(opened.mode === "recipe" && /^my-/.test(opened.id) && opened.n === 6 && opened.h2 === "Licuado de frutas en tazón", "Open plays a saved recipe like any other (" + opened.hash + ")");
  await fast(pp); await pp.evaluate(() => document.getElementById("wholeBtn").click()); const ps = await untilStopped(pp, 120000);
  ok(ps && await pp.evaluate(() => window.AOGKitchen.P.k === 5 && window.AOGKitchen.P.u === 1), "your recipe plays once from start to end and stops");
  // Spanish example, and delete
  await pp.evaluate(() => window.AOGKitchen.openMode("mine", true)); await pp.evaluate(() => document.getElementById("langBtn").click()); await pp.evaluate(() => document.getElementById("exBtn").click()); await wait(150);
  const ex = await pp.evaluate(() => ({ h: document.querySelector("#preview h3").textContent, steps: document.querySelectorAll("#preview ol.steps > li").length, lang: window.AOGKitchen.state.lang }));
  ok(ex.lang === "es" && /Lo que entendí/.test(ex.h) && ex.steps === 6, "the Spanish example reads in Spanish (" + ex.h + ")");
  await pp.evaluate(() => document.getElementById("langBtn").click());
  await pp.click("#card [data-del]"); await wait(100);
  ok(await pp.evaluate(() => JSON.parse(localStorage.getItem("aog.kitchen.mine.v1") || "[]").length === 0), "Delete removes a saved recipe from this device");
  ok(!pp.errs.length, "no errors in the plug-in panel" + (pp.errs.length ? ": " + pp.errs.slice(0, 3).join(" | ") : ""));
  await cp2.close();

  /* ── 10. iPhone and iPad, English and Spanish: no sideways scroll, the kitchen draws ── */
  for (const [name, vp] of [["iPhone", { width: 390, height: 844 }], ["iPad", { width: 820, height: 1180 }]]) {
    for (const lang of ["en", "es"]) {
      const c = await ctxFor(vp, true);
      if (lang === "es") await c.addInitScript(() => { try { localStorage.setItem("aog.lang", "es"); } catch (e) {} });
      const p = await pageIn(c, "skill-wash-hands");
      const res = [];
      for (const h of ["skill-wash-hands", "pancakes", "plug-in"]) {
        await p.evaluate(h => { location.hash = h; }, h); await wait(120);
        if (h === "plug-in") { await p.click("#exBtn"); await wait(120); }
        res.push(await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, lang: document.documentElement.lang })));
      }
      const st = await p.evaluate(() => { const s = document.getElementById("stage").getBoundingClientRect(); return { w: s.width, h: s.height, ready: window.AOGKitchen.K3state }; });
      ok(res.every(r => r.sw <= r.iw && r.lang === lang) && st.ready === "ready" && st.w > 300 && st.h > 200 && !p.errs.length,
         `${name} ${lang === "es" ? "Spanish" : "English"}: skill, recipe and plug-in fit the screen (no sideways scroll), the kitchen draws` + (p.errs.length ? " — " + p.errs[0] : ""));
      await c.close();
    }
  }

  await b.close(); server.close();
  console.log(fails ? `\n${fails} kitchen check(s) failed.` : "\nKitchen Lab: every check passes.");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
