/* The Kitchen Lab — the page (AOG-KITCHEN-LAB-V1, 2026-10-12)
   Jimmy: "Could we not take this amazement to FACS for cooking and sewing lessons? Have this person cook recipes by
   preloaded or the viewer plugs it in." Earlier: "this has to be silent when not being used … lighting fast".
   The words, the recipe card and the player work at once. The 3D kitchen (aog-kitchen3d.js) loads right after and only
   draws when it is asked: a step playing, a drag of the camera, a resize or a theme change. Go plays one step once.
   "Watch the whole recipe" plays the steps in order once and stops. With "reduce motion" on, Go shows the step's end
   at once. Nothing moves on its own and nothing makes a sound. */
(function () {
"use strict";
const R = window.AOGKitchenRecipes;
const $ = id => document.getElementById(id);
const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
const KEY = "aog.kitchen.v1", MINE = "aog.kitchen.mine.v1";
let S = { lang: "en", mode: "recipe", recipe: "pancakes", skill: "chop", factor: 1, speed: "normal", view: "shoulder", draft: "" };
try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && typeof s === "object") S = Object.assign(S, s); } catch (e) {}
try { const l = localStorage.getItem("aog.lang"); if (l === "es" || l === "en") S.lang = l; } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const es = () => S.lang === "es";
const L = (en, sp) => es() ? sp : en;
const W = o => o ? (es() ? o.es : o.en) : null;
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const SPEEDS = { normal: [1, "Normal", "Normal"], slow: [1.7, "Slow", "Lento"], vslow: [2.6, "Very slow", "Muy lento"] };
const VIEWS = { shoulder: ["Over the shoulder", "Sobre el hombro"], across: ["Across the counter", "Del otro lado de la mesa"], hands: ["Close on the hands", "Cerca de las manos"], walk: ["Walk around (drag)", "Dar la vuelta (arrastra)"] };

/* ── saved recipes: on this device only ── */
function mine() { try { const a = JSON.parse(localStorage.getItem(MINE) || "[]"); return Array.isArray(a) ? a.filter(x => x && x.id && typeof x.text === "string") : []; } catch (e) { return []; } }
function putMine(a) { try { localStorage.setItem(MINE, JSON.stringify(a)); return true; } catch (e) { return false; } }
let draftRecipe = null;   // what Read it understood, before it is saved
function recipeById(id) {
  const r = R.RECIPES.find(x => x.id === id); if (r) return r;
  if (id === "draft" && draftRecipe) return draftRecipe;
  const m = mine().find(x => x.id === id); if (m) { const p = R.read(m.text, S.lang); p.id = m.id; return p; }
  return null;
}
/* the thing being played: a recipe, or one skill as a one-step recipe */
function current() {
  if (S.mode === "skill") {
    const a = R.ACTIONS[S.skill] ? S.skill : "chop";
    return { id: "skill-" + a, skill: a, ing: [], steps: [{ a: [a], tools: R.ACTIONS[a].tools.slice(), ing: [], en: R.ACTIONS[a].en.how.join(" "), es: R.ACTIONS[a].es.how.join(" "), demo: true }] };
  }
  if (S.mode === "mine") return draftRecipe;
  return recipeById(S.recipe) || R.RECIPES[0];
}

/* ── the player ── P.k: the step; P.u: how far through it (0 … 1) */
const P = { k: 0, u: 0, playing: false, whole: false, raf: 0, last: 0, frames: 0 };
let K3 = null, K3state = "", rec = null;
function stepOf() { return rec && rec.steps[P.k]; }
function plan(step) {   // the skills of a step, one after another, in seconds at Normal speed
  let t = 0; const seg = (step ? step.a : []).map(id => { const d = (R.ACTIONS[id] || R.ACTIONS.counter).secs; const s = { id, t0: t, t1: t + d }; t += d; return s; });
  return { seg, total: Math.max(t, 1) };
}
function segAt(step, u) { const p = plan(step), t = u * p.total; return p.seg.find(s => t < s.t1) || p.seg[p.seg.length - 1]; }
function show() {   // put the kitchen and the words where the player is
  const st = stepOf(); if (!st) return;
  if (K3) K3.show(P.k, P.u);
  const sc = $("scrub"); sc.value = Math.round(P.u * 1000);
  const s = segAt(st, P.u), A = s && R.ACTIONS[s.id];
  $("say").textContent = A ? W(A).n + (rec.steps.length > 1 ? " · " + L("step ", "paso ") + (P.k + 1) + "/" + rec.steps.length : "") : "";
  clock(st, s);
  lightHow(st, s);
  $("goBtn").textContent = P.playing ? L("Pause", "Pausa") : (P.u >= 1 ? L("Again", "Otra vez") : L("Go", "Ir"));
  $("prevBtn").disabled = P.k <= 0; $("nextBtn").disabled = P.k >= rec.steps.length - 1;
}
function clock(st, s) {
  const A = s && R.ACTIONS[s.id];
  let big = "", small = "";
  if (st.timer) { const m = st.timer.min, sec = st.timer.sec; big = m != null ? (m >= 60 && m % 60 === 0 ? (m / 60) + " " + L(m === 60 ? "hour" : "hours", m === 60 ? "hora" : "horas") : R.fmtNum(m, true, S.lang) + " " + L(m === 1 ? "minute" : "minutes", m === 1 ? "minuto" : "minutos")) : sec + " " + L("seconds", "segundos"); }
  else if (A && A.clock) { big = A.clock.sec + " " + L("seconds", "segundos"); }
  if (st.temp && !big) { big = st.temp.f + " °F"; small = st.temp.c + " °C"; }
  else if (big) small = L("shown quickly", "mostrado rápido");
  const on = !!big; $("clock").hidden = !on; if (!on) return;
  $("clockBig").textContent = big; $("clockSmall").textContent = small;
  // the hand goes once around over the step (for wash-hands, over the scrubbing part)
  let f = P.u; if (!st.timer && A && A.clock) { const p = plan(st), t = P.u * p.total, d = s.t1 - s.t0; f = Math.min(1, Math.max(0, ((t - s.t0) / d - 0.2) / 0.55)); }
  const a = f * Math.PI * 2, x = 20 + 14 * Math.sin(a), y = 20 - 14 * Math.cos(a);
  $("clockHand").setAttribute("x2", x.toFixed(2)); $("clockHand").setAttribute("y2", y.toFixed(2));
  $("clockArc").setAttribute("d", f <= 0.001 ? "" : f >= 0.999 ? "M20 3 A17 17 0 1 1 19.99 3" : `M20 3 A17 17 0 ${a > Math.PI ? 1 : 0} 1 ${(20 + 17 * Math.sin(a)).toFixed(2)} ${(20 - 17 * Math.cos(a)).toFixed(2)}`);
}
function lightHow(st, s) {   // the skill card lights the part of the skill the cook is doing
  const how = document.querySelectorAll("#card ol.how li"); if (!how.length || !s) return;
  const p = plan(st), t = P.u * p.total, f = Math.min(0.999, Math.max(0, (t - s.t0) / (s.t1 - s.t0)));
  const n = Math.min(how.length - 1, Math.floor(f * how.length));
  how.forEach((li, i) => li.classList.toggle("on", P.u > 0 && i === n));
}
function lightStep() { document.querySelectorAll("#card ol.steps > li").forEach((li, i) => { li.classList.toggle("on", i === P.k); const b = li.querySelector("button"); if (b) b.setAttribute("aria-current", i === P.k ? "step" : "false"); }); }
function setStep(k, u) {
  stop(); P.k = Math.max(0, Math.min(rec.steps.length - 1, k)); P.u = u || 0; P.whole = false; lightStep(); show(); describe();
}
function describe() {
  const st = stepOf(); if (!st) return;
  $("stageDesc").textContent = L("A cook in an apron at a kitchen counter. ", "Una persona con delantal en la cocina. ") + L("Step ", "Paso ") + (P.k + 1) + ": " + W(st);
}
function go(whole) {
  if (P.playing) { stop(); show(); return; }
  if (whole) { P.whole = true; if (P.u >= 1 || P.k >= rec.steps.length - 1 && P.u > 0) { P.k = 0; } P.u = 0; lightStep(); }
  if (REDUCE) {   // reduce motion: the end of the step, at once (the whole recipe: the last step's end)
    if (P.whole) { P.k = rec.steps.length - 1; P.whole = false; lightStep(); }
    P.u = 1; show(); describe(); return;
  }
  if (P.u >= 1) P.u = 0;
  P.playing = true; P.last = 0; show();
  P.raf = requestAnimationFrame(tick);
}
function tick(now) {
  if (!P.playing) return;
  const dt = P.last ? Math.min(0.1, (now - P.last) / 1000) : 0; P.last = now;
  const st = stepOf(), dur = plan(st).total * SPEEDS[S.speed][0];
  P.u = Math.min(1, P.u + dt / dur);
  if (P.u >= 1) {
    if (P.whole && P.k < rec.steps.length - 1) { P.k++; P.u = 0; lightStep(); describe(); scrollStep(); }
    else { P.u = 1; P.playing = false; P.whole = false; P.raf = 0; show(); return; }
  }
  show();
  P.raf = requestAnimationFrame(tick);
}
function stop() { P.playing = false; if (P.raf) cancelAnimationFrame(P.raf); P.raf = 0; }
function scrollStep() { const li = document.querySelectorAll("#card ol.steps > li")[P.k]; if (li && window.innerWidth >= 900) { const box = li.getBoundingClientRect(); if (box.bottom > innerHeight || box.top < 0) li.scrollIntoView({ block: "nearest" }); } }

/* ── the words on the card ── */
function amt(i) { return R.fmtAmount(i, S.mode === "recipe" ? S.factor : (rec && rec.factor) || 1, S.lang); }
function stepMeta(st) {
  let h = st.a.map(id => `<span class="tag act">${esc(W(R.ACTIONS[id]).n)}</span>`).join("");
  if (st.timer) h += `<span class="tag time">⏱ ${st.timer.min != null ? R.fmtNum(st.timer.min, true, S.lang) + " min" : st.timer.sec + " s"}</span>`;
  if (st.temp) h += `<span class="tag time">${st.temp.f} °F · ${st.temp.c} °C</span>`;
  if (st.sure === false) h += `<span class="tag unsure">${L("Shown at the counter", "Se muestra en la mesa")}</span>`;
  return h;
}
function stepsList(r) {
  return `<ol class="steps">${r.steps.map((st, i) => `<li${i === P.k ? ' class="on"' : ""}><button type="button" data-step="${i}"><span>${esc(W(st))}<span class="meta">${stepMeta(st)}</span></span></button></li>`).join("")}</ol>`;
}
function algChips(list) {
  if (!list || !list.length) return `<span class="tag">${L("No major allergens", "Sin alérgenos principales")}</span>`;
  return list.map(a => `<span class="tag alg">${esc(L(R.ALLERGENS[a][0], R.ALLERGENS[a][1]))}</span>`).join("");
}
function ingList(r, f) {
  return `<ul class="ing">${r.ing.map(i => `<li><span class="q">${esc(R.fmtAmount(i, f, S.lang)) || "—"}</span><span>${esc(W(i))}</span></li>`).join("")}</ul>`;
}
function toolsList(list) { return `<ul class="tools">${list.filter(t => R.TOOLS[t]).map(t => `<li>${esc(L(R.TOOLS[t][0], R.TOOLS[t][1]))}</li>`).join("")}</ul>`; }
function scaleSeg() {
  return `<div class="seg" role="group" aria-label="${L("How much", "Cuánto")}" id="scaleSeg">${[[0.5, "½×"], [1, "1×"], [2, "2×"], [3, "3×"]].map(([f, t]) => `<button type="button" data-f="${f}" aria-pressed="${S.factor === f}">${t}</button>`).join("")}</div>`;
}
function safetyNote(r) {
  const stove = r.steps.some(s => s.a.some(a => ["flip", "saute", "boil", "simmer", "bake", "check-temp"].includes(a)));
  const knife = r.steps.some(s => s.a.some(a => ["chop", "slice", "dice", "mince", "peel", "grate"].includes(a)));
  let t = [];
  if (knife) t.push(L("Knives: claw grip, tip on the board, cut on a board that does not slide.", "Cuchillos: mano en garra, punta sobre la tabla, corta en una tabla que no se deslice."));
  if (stove) t.push(L("Stove and oven: pot handles turned in, oven mitts, and a grown-up nearby for children.", "Estufa y horno: mangos hacia dentro, guantes de horno y un adulto cerca de los niños."));
  if (r.ing.some(i => i.item === "egg" || i.item === "chicken" || i.item === "meat")) t.push(L("Raw egg or meat: wash your hands after, and keep it apart from food that is ready to eat.", "Huevo o carne cruda: lávate las manos después y sepáralo de la comida lista para comer."));
  return t.length ? `<div class="note safe"><b>${L("Safe habits", "Hábitos seguros")}</b><br>${t.map(esc).join("<br>")}</div>` : "";
}
function recipeCard() {
  const r = rec, f = S.factor;
  const serves = r.serves ? `<span class="tag">${L("Serves", "Porciones")}: ${R.fmtNum(r.serves * f, false, S.lang)}</span>` : "";
  const time = r.minutes ? `<span class="tag time">${L("About", "Unos")} ${r.minutes} min</span>` : "";
  return `<h2>${esc(W(r).n)}</h2><p class="muted" style="margin:.1rem 0 .4rem">${esc(W(r).about || "")}</p>
    <div class="facts">${serves}${time}</div>
    <div class="row"><b>${L("How much", "Cuánto")}</b>${scaleSeg()}</div>
    <h3>${L("Allergens", "Alérgenos")}</h3><div class="facts">${algChips(r.allergens)}</div>
    <h3>${L("Ingredients", "Ingredientes")}</h3>${ingList(r, f)}
    <details class="more"><summary>${L("Tools", "Utensilios")} (${r.tools.length})</summary>${toolsList(r.tools)}</details>
    ${safetyNote(r)}
    <h3>${L("Steps", "Pasos")}</h3>
    <div class="row"><button type="button" class="btn btn-go" id="wholeBtn">${L("Watch the whole recipe", "Ver toda la receta")}</button></div>
    ${stepsList(r)}`;
}
function skillCard() {
  const A = R.ACTIONS[S.skill], w = W(A);
  return `<h2>${esc(w.n)}</h2><p class="muted" style="margin:.1rem 0 .4rem">${L("Press Go to watch it once.", "Pulsa Ir para verlo una vez.")}</p>
    <ol class="how">${w.how.map(h => `<li>${esc(h)}</li>`).join("")}</ol>
    <div class="note safe"><b>${L("Safe habit", "Hábito seguro")}</b><br>${esc(w.safe)}</div>
    <h3>${L("Tools", "Utensilios")}</h3>${A.tools.length ? toolsList(A.tools) : `<p class="hint">${L("Just clean hands.", "Solo manos limpias.")}</p>`}
    <p class="hint">${L("Link to this skill:", "Enlace a esta habilidad:")} <code>/kitchen-lab#skill-${esc(S.skill)}</code></p>`;
}
const EXAMPLE = {
  en: "Banana oat muffins\nIngredients\n1 1/2 cups flour\n1 cup oats\n1/2 cup sugar\n2 tsp baking powder\n2 ripe bananas\n1 egg\n3/4 cup milk\n1/3 cup oil\nSteps\n1. Wash your hands.\n2. Heat the oven to 375°F.\n3. Peel the bananas and mash them in a bowl.\n4. Crack in the egg. Whisk in the milk and oil.\n5. Measure the flour, oats, sugar and baking powder. Fold them in.\n6. Spoon into a muffin tin and bake for 20 minutes.",
  es: "Licuado de frutas en tazón\nIngredientes\n1 plátano\n1 taza de fresas\n1/2 taza de yogur natural\n2 cucharadas de granola\n1 cucharadita de miel\nPasos\n1. Lávate las manos.\n2. Enjuaga las fresas.\n3. Pela el plátano y córtalo en rodajas.\n4. Pica las fresas.\n5. Pon el yogur en un tazón y revuelve con la miel.\n6. Sirve con la fruta y la granola encima."
};
function mineCard() {
  const d = draftRecipe;
  let h = `<h2>${L("Plug in your own recipe", "Pon tu propia receta")}</h2>
    <p class="muted" style="margin:.1rem 0 .4rem">${L("Paste or type it below: the ingredients, then the steps. English or Spanish. It is read here on your device.", "Pégala o escríbela abajo: los ingredientes y luego los pasos. En inglés o español. Se lee aquí, en tu dispositivo.")}</p>
    <label class="sr" for="mineText">${L("Your recipe", "Tu receta")}</label>
    <textarea class="mine" id="mineText" spellcheck="true" placeholder="${esc(L("Title\nIngredients\n2 cups flour\n1 egg\nSteps\n1. Whisk the egg.\n2. Bake for 20 minutes.", "Título\nIngredientes\n2 tazas de harina\n1 huevo\nPasos\n1. Bate el huevo.\n2. Hornea 20 minutos."))}">${esc(S.draft || "")}</textarea>
    <div class="row"><button type="button" class="btn btn-go" id="readBtn">${L("Read it", "Leerla")}</button><button type="button" class="btn" id="exBtn">${L("Try an example", "Probar un ejemplo")}</button><button type="button" class="btn" id="clearBtn">${L("Clear", "Borrar")}</button></div>`;
  if (d) {
    const unsure = d.steps.filter(s => s.sure === false).length;
    h += `<div id="preview"><h3>${L("What I understood", "Lo que entendí")}: ${esc(W(d).n)}</h3>
      <div class="row"><b>${L("How much", "Cuánto")}</b>${scaleSeg()}</div>
      <h3>${L("Ingredients", "Ingredientes")} (${d.ing.length})</h3>${d.ing.length ? ingList(d, S.factor) : `<p class="hint">${L("No ingredients found. Put each one on its own line, starting with the amount.", "No encontré ingredientes. Pon cada uno en su propia línea, empezando con la cantidad.")}</p>`}
      <h3>${L("Allergens it names", "Alérgenos que nombra")}</h3><div class="facts">${algChips(d.allergens)}</div><p class="hint">${L("Always check the labels too.", "Revisa también las etiquetas.")}</p>
      <h3>${L("Steps", "Pasos")} (${d.steps.length})</h3>
      ${d.steps.length ? `<div class="row"><button type="button" class="btn btn-go" id="wholeBtn">${L("Watch the whole recipe", "Ver toda la receta")}</button><button type="button" class="btn" id="saveBtn">${L("Save on this device", "Guardar en este dispositivo")}</button></div>${stepsList(d)}` : `<p class="hint">${L("No steps found. Put each step on its own line, like “1. Chop the onion.”", "No encontré pasos. Pon cada paso en su propia línea, como “1. Pica la cebolla.”")}</p>`}
      ${unsure ? `<div class="note">${L("Some steps have no cooking word I know. They are shown at the counter with their words.", "Algunos pasos no tienen una palabra de cocina que conozca. Se muestran en la mesa con sus palabras.")}</div>` : ""}
      ${d.unknown.length ? `<div class="note"><b>${L("Lines I did not understand", "Líneas que no entendí")}</b><br>${d.unknown.map(esc).join("<br>")}</div>` : ""}</div>`;
  }
  const saved = mine();
  if (saved.length) h += `<h3>${L("Saved on this device", "Guardadas en este dispositivo")}</h3><div class="saved">${saved.map(m => `<div><span>${esc(m.title)}</span><span class="row" style="margin:0"><button type="button" class="btn" data-open="${esc(m.id)}">${L("Open", "Abrir")}</button><button type="button" class="btn" data-del="${esc(m.id)}">${L("Delete", "Borrar")}</button></span></div>`).join("")}</div>`;
  return h;
}

/* ── putting the page together ── */
function modes() {
  $("modes").innerHTML = [["recipe", "Recipes", "Recetas"], ["skill", "Skills", "Habilidades"], ["mine", "Your recipe", "Tu receta"]]
    .map(([k, en, sp]) => `<button type="button" data-mode="${k}" aria-pressed="${S.mode === k}">${L(en, sp)}</button>`).join("");
  $("modes").querySelectorAll("[data-mode]").forEach(b => b.onclick = () => openMode(b.getAttribute("data-mode"), true));
}
function picks() {
  const saved = mine();
  const rs = R.RECIPES.map(r => [r.id, W(r).n]).concat(saved.map(m => [m.id, L("Saved: ", "Guardada: ") + m.title]));
  $("recipeRow").innerHTML = rs.map(([id, n]) => `<button type="button" data-recipe="${esc(id)}" aria-pressed="${S.mode === "recipe" && S.recipe === id}">${esc(n)}</button>`).join("");
  $("skillRow").innerHTML = R.SKILLS.map(id => `<button type="button" data-skill="${id}" aria-pressed="${S.skill === id}">${esc(W(R.ACTIONS[id]).n)}</button>`).join("");
  $("recipeRow").querySelectorAll("[data-recipe]").forEach(b => b.onclick = () => openRecipe(b.getAttribute("data-recipe"), true));
  $("skillRow").querySelectorAll("[data-skill]").forEach(b => b.onclick = () => openSkill(b.getAttribute("data-skill"), true));
  $("recipeRow").hidden = S.mode !== "recipe"; $("skillRow").hidden = S.mode !== "skill";
  $("pick").hidden = S.mode === "mine";
}
function views() {
  $("viewRow").innerHTML = Object.keys(VIEWS).map(k => `<button type="button" data-view="${k}" aria-pressed="${S.view === k}">${esc(L(VIEWS[k][0], VIEWS[k][1]))}</button>`).join("");
  $("viewRow").querySelectorAll("[data-view]").forEach(b => b.onclick = () => setView(b.getAttribute("data-view")));
  $("speedRow").innerHTML = Object.keys(SPEEDS).map(k => `<button type="button" data-speed="${k}" aria-pressed="${S.speed === k}">${L(SPEEDS[k][1], SPEEDS[k][2])}</button>`).join("");
  $("speedRow").querySelectorAll("[data-speed]").forEach(b => b.onclick = () => { S.speed = b.getAttribute("data-speed"); save(); views(); });
  $("viewHint").textContent = S.view === "walk" ? L("Drag the kitchen to walk around it.", "Arrastra la cocina para darle la vuelta.") : "";
  $("stage").classList.toggle("walk", S.view === "walk");
}
function setView(v) { if (!VIEWS[v]) return; S.view = v; save(); views(); if (K3) { K3.setView(v); K3.show(P.k, P.u); } }
function card() {
  $("card").innerHTML = S.mode === "recipe" ? recipeCard() : S.mode === "skill" ? skillCard() : mineCard();
  wireCard(); lightStep(); show();
}
function wireCard() {
  document.querySelectorAll("#card [data-step]").forEach(b => b.onclick = () => {
    setStep(+b.getAttribute("data-step"));
    // on a phone the kitchen is above the list: bring it into view so the step can be watched
    const st = $("stage"), r = st.getBoundingClientRect(); if (window.innerWidth < 900 && (r.bottom < 60 || r.top > innerHeight - 60)) st.scrollIntoView({ block: "start" });
  });
  const wb = $("wholeBtn"); if (wb) wb.onclick = () => { stop(); P.u = 0; P.k = 0; go(true); };
  const sg = $("scaleSeg"); if (sg) sg.querySelectorAll("[data-f]").forEach(b => b.onclick = () => { S.factor = +b.getAttribute("data-f"); save(); card(); });
  if (S.mode === "mine") {
    const ta = $("mineText");
    ta.oninput = () => { S.draft = ta.value; save(); };
    $("readBtn").onclick = () => { S.draft = ta.value; save(); readDraft(); };
    $("exBtn").onclick = () => { S.draft = EXAMPLE[S.lang]; save(); readDraft(); };
    $("clearBtn").onclick = () => { S.draft = ""; draftRecipe = null; save(); load(null); card(); };
    const sb = $("saveBtn"); if (sb) sb.onclick = () => {
      const a = mine(), id = "my-" + Date.now().toString(36);
      a.push({ id, title: W(draftRecipe).n, text: S.draft, at: new Date().toISOString().slice(0, 10) });
      sb.textContent = putMine(a) ? L("Saved ✓", "Guardada ✓") : L("Could not save here", "No se pudo guardar aquí");
      sb.disabled = true; picks(); setTimeout(() => card(), 900);
    };
    document.querySelectorAll("#card [data-open]").forEach(b => b.onclick = () => openRecipe(b.getAttribute("data-open"), true));
    document.querySelectorAll("#card [data-del]").forEach(b => b.onclick = () => { putMine(mine().filter(m => m.id !== b.getAttribute("data-del"))); picks(); card(); });
  }
}
function readDraft() {
  draftRecipe = S.draft.trim() ? R.read(S.draft, S.lang) : null; if (draftRecipe) draftRecipe.id = "draft";
  load(draftRecipe); card();
  const pv = $("preview"); if (pv && window.innerWidth < 900) pv.scrollIntoView({ block: "start" });
}
function load(r) {   // a new recipe (or skill) for the player and the kitchen
  stop(); rec = r || { id: "empty", ing: [], steps: [{ a: ["counter"], tools: [], ing: [], en: "Plug in a recipe to watch it here.", es: "Pon una receta para verla aquí." }], allergens: [], tools: [] };
  P.k = 0; P.u = 0; P.whole = false;
  if (K3) K3.load(rec);
}
function openMode(m, push) {
  S.mode = m; save(); modes(); picks();
  if (m === "recipe") return openRecipe(S.recipe, push);
  if (m === "skill") return openSkill(S.skill, push);
  if (push) history.replaceState(null, "", "#plug-in");
  if (S.draft && !draftRecipe) { draftRecipe = R.read(S.draft, S.lang); draftRecipe.id = "draft"; }
  load(draftRecipe); card();
}
function openRecipe(id, push) {
  if (!recipeById(id) || id === "draft") id = "pancakes";
  S.mode = "recipe"; S.recipe = id; save(); modes(); picks();
  if (push) history.replaceState(null, "", "#" + id);
  load(recipeById(id)); card();
}
function openSkill(id, push) {
  if (!R.ACTIONS[id] || R.ACTIONS[id].extra && id !== "rinse") id = "chop";
  S.mode = "skill"; S.skill = id; save(); modes(); picks();
  if (push) history.replaceState(null, "", "#skill-" + id);
  load(current()); card();
}
function route() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (/^skill-/.test(h)) return openSkill(h.slice(6), false);
  if (h === "plug-in" || h === "mine") return openMode("mine", false);
  if (h && recipeById(h)) return openRecipe(h, false);
  if (S.mode === "skill") return openSkill(S.skill, false);
  if (S.mode === "mine") return openMode("mine", false);
  return openRecipe(S.recipe, false);
}
function words() {
  document.documentElement.lang = S.lang;
  document.title = L("The Kitchen Lab", "El Laboratorio de Cocina") + " — Architecture of Grace";
  $("brand").textContent = L("The Kitchen Lab", "El Laboratorio de Cocina");
  $("mastK").textContent = L("Family & Consumer Sciences", "Ciencias de la familia");
  $("mastH").textContent = L("The Kitchen Lab", "El Laboratorio de Cocina");
  $("mastL").textContent = L("Watch real recipes, step by step.", "Mira recetas reales, paso a paso.");
  $("langBtn").textContent = es() ? "EN" : "ES";
  $("themeBtn").textContent = document.documentElement.getAttribute("data-theme") === "dark" ? L("Light", "Claro") : L("Dark", "Oscuro");
  $("nav").innerHTML = `<a href="/facs-course">${L("The course", "El curso")}</a><a href="/kitchen">${L("Kitchen & Sewing", "Cocina y costura")}</a>`;
  $("prevBtn").setAttribute("aria-label", L("Previous step", "Paso anterior")); $("nextBtn").setAttribute("aria-label", L("Next step", "Paso siguiente"));
  $("scrub").setAttribute("aria-label", L("Move through the step", "Recorre el paso"));
  $("modes").setAttribute("aria-label", L("Show", "Mostrar")); $("speedRow").setAttribute("aria-label", L("Speed", "Velocidad"));
  $("foot").textContent = L("Architecture of Grace · The Kitchen Lab · times on the clock are shown quickly, never in real time. Safe temperatures: eggs and chicken 165 °F (74 °C), ground meat 160 °F (71 °C). Children cook with a grown-up nearby, always at the stove and oven.",
    "Architecture of Grace · El Laboratorio de Cocina · los tiempos del reloj se muestran rápido, nunca en tiempo real. Temperaturas seguras: huevos y pollo 165 °F (74 °C), carne molida 160 °F (71 °C). Los niños cocinan con un adulto cerca, siempre en la estufa y el horno.");
  if (K3state !== "ready") $("wait").textContent = K3state === "fail" ? L("The 3D kitchen could not open on this device. The recipe and its steps still work.", "La cocina en 3D no pudo abrir en este dispositivo. La receta y sus pasos siguen funcionando.") : L("Getting the kitchen ready…", "Preparando la cocina…");
}

/* ── the controls ── */
$("goBtn").onclick = () => go(false);
$("prevBtn").onclick = () => setStep(P.k - 1);
$("nextBtn").onclick = () => setStep(P.k + 1);
$("scrub").oninput = e => { stop(); P.u = +e.target.value / 1000; show(); };
$("langBtn").onclick = () => {
  S.lang = es() ? "en" : "es"; save(); try { localStorage.setItem("aog.lang", S.lang); } catch (e) {}
  if (S.mode === "mine" && draftRecipe) { draftRecipe = R.read(S.draft, S.lang); draftRecipe.id = "draft"; rec = draftRecipe; if (K3) K3.load(rec); }
  words(); modes(); picks(); views(); card();
};
$("themeBtn").onclick = () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next); document.documentElement.classList.toggle("dark", next === "dark");
  try { localStorage.setItem("aog.interior.ws.v1.theme", next); } catch (e) {}
  words();
};
const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";
new MutationObserver(() => { if (K3) { K3.setDark(isDark()); K3.show(P.k, P.u); } }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
window.addEventListener("hashchange", route);
let rsT = 0; window.addEventListener("resize", () => { clearTimeout(rsT); rsT = setTimeout(() => { if (K3) { K3.resize(); K3.show(P.k, P.u); } }, 60); });
document.addEventListener("keydown", e => {
  if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName)) return;
  if (e.key === "ArrowRight" && !e.metaKey && !e.ctrlKey && e.target === document.body) { setStep(P.k + 1); }
  if (e.key === "ArrowLeft" && !e.metaKey && !e.ctrlKey && e.target === document.body) { setStep(P.k - 1); }
});

/* ── the 3D kitchen, right after the words ── */
function load3D() {
  K3state = "loading";
  import("/aog-kitchen3d.js").then(m => m.create({ host: $("stage"), before: $("clock"), dark: isDark(), view: S.view, R })).then(k => {
    K3 = k; K3state = "ready"; $("wait").hidden = true;
    K3.load(rec); K3.show(P.k, P.u);
    window.addEventListener("pagehide", () => { if (K3) { K3.dispose(); K3 = null; } }, { once: true });
  }).catch(err => { K3state = "fail"; console.warn("Kitchen 3D:", err && err.message); words(); });
}

/* for the site's checks (tools/check-kitchen.js) */
window.AOGKitchen = { R, P, state: S, go, setStep, setView, openRecipe, openSkill, openMode, route, plan, readDraft, mine,
  get K3() { return K3; }, get K3state() { return K3state; }, get rec() { return rec; }, REDUCE };
words(); modes(); views(); route();
if ("requestIdleCallback" in window) requestIdleCallback(load3D, { timeout: 400 }); else setTimeout(load3D, 50);
})();
