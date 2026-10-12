/* ══ AOG-DOJO-V1 (2026-10-12) — the Dojo's page and player (dojo.html, /dojo) ═════════════════════════════════════
   Jimmy: "In the martial arts curriculum books, instructions on how to learn moves with this engine showing the person
   the moves!!!" The words, the step list and the player work at once from aog-dojo-moves.js; the 3D room and the
   figure (aog-dojo3d.js → aog-figure3d.js → three.js from /vendor) load right after, with a small note.
   Calm (CLAUDE.md): nothing moves until Go; Go plays the move once and stops; ◀ ▶ step through it; with "reduce motion"
   on, every step shows its finished pose at once. requestAnimationFrame runs only while a move plays.
   Addresses: /dojo#<move-id> opens a move; ?side=left mirrors it. Practice marks stay on this device (aog.dojo.v1). */
(function () {
"use strict";
const $ = id => document.getElementById(id);
const D = window.AOGDojoMoves, MOVES = D.MOVES, BY = {};
MOVES.forEach(m => BY[m.id] = m);
const KEY = "aog.dojo.v1", FPS = 30;
const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ── saved choices (this device only) ── */
const DEF = { lang: "en", id: "ready", speed: 0.5, view: "front", band: "all", ghost: false, progress: {} };
let S;
try { S = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { S = null; }
if (!S || typeof S !== "object") { S = JSON.parse(JSON.stringify(DEF)); try { if (localStorage.getItem("aog.lang") === "es") S.lang = "es"; } catch (e) {} }
for (const k in DEF) if (S[k] == null) S[k] = JSON.parse(JSON.stringify(DEF[k]));
if (S.view === "orbit") S.view = "front";
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
const es = () => S.lang === "es";
const L = (en, sp) => es() ? sp : en;
const num = (x, d) => x.toFixed(d).replace(".", es() ? "," : ".");
let mirror = /[?&]side=left\b/.test(location.search);

/* ── the move now open ── */
let MV = null;
const P = { t: 0, playing: false, t0: 0, from: 0, to: 0, raf: 0, ran: false };
function cur() { return MV; }
function words(m) { return es() ? m.es : m.en; }
function stepAt(t) {
  const k = MV.keys;
  if (t <= k[0].t + 1e-6) return k[0].s;
  for (let i = 0; i < k.length; i++) if (k[i].t >= t - 1e-6) return k[i].s;
  return k[k.length - 1].s;
}
function stepEnd(s) { let t = 0; MV.keys.forEach(k => { if (k.s === s) t = k.t; }); return t; }
function nSteps() { return MV.en.steps.length; }

/* ── the 3D room (aog-dojo3d.js), loaded right after the words are on the page ── */
let G3 = null, G3state = "";   // "", "loading", "ready", "failed"
function load3D() {
  if (G3state) return;
  G3state = "loading"; waitNote();
  import("/aog-dojo3d.js").then(m => m.create({ host: $("stage"), dark: isDark, colors: tokens, onView: v => { S.view = v; save(); $("viewPick").value = v; } }))
    .then(g => { G3 = g; G3state = "ready"; waitNote(); G3.setMove(MV, mirror); G3.setView(S.view); G3.setGhost(S.ghost); show(); })
    .catch(err => { G3state = "failed"; console.warn("The Dojo 3D:", err); waitNote(); });
}
function waitNote() {
  const w = $("wait");
  if (G3state === "ready") { w.hidden = true; return; }
  w.hidden = false;
  $("waitTxt").textContent = G3state === "failed" ? L("The 3D dojo could not start on this device. The steps below still work.", "El dojo en 3D no pudo iniciar en este equipo. Los pasos de abajo siguen funcionando.")
    : L("Getting the dojo ready…", "Preparando el dojo…");
}
function isDark() { return document.documentElement.getAttribute("data-theme") === "dark"; }
function tokens() {
  const cs = getComputedStyle(document.documentElement), g = n => cs.getPropertyValue(n).trim();
  return { gi: g("--dj-gi"), belt: g("--dj-belt"), skin: g("--dj-skin"), hair: g("--dj-hair"), floor: g("--dj-floor"), mat: g("--dj-mat"), mat2: g("--dj-mat2"),
           wall: g("--dj-wall"), wood: g("--dj-wood"), accent: g("--dj-accent"), stage: g("--stage") };
}

/* ── draw the moment P.t (only when something changed) ── */
function show() {
  const s = stepAt(P.t);
  if (G3) G3.show(P.t);
  const sc = $("scrub"); sc.max = Math.round(MV.dur * FPS); sc.value = Math.round(P.t * FPS);
  $("tRead").textContent = num(P.t / 1, 1) + " s";
  const ws = words(MV);
  $("capStep").textContent = S.ghost ? L("Ghost: the whole move at once", "Fantasma: todo el movimiento a la vez") : L("Step ", "Paso ") + (s + 1) + L(" of ", " de ") + ws.steps.length;
  document.querySelectorAll("#steps li").forEach((li, i) => { const on = i === s; if (li.classList.contains("on") !== on) li.classList.toggle("on", on); });
  $("stageDesc").textContent = ws.n + ". " + L("Step ", "Paso ") + (s + 1) + ": " + ws.steps[s];
  paintPlayer();
}
function paintPlayer() {
  const s = stepAt(P.t), last = nSteps() - 1;
  $("goBtn").textContent = P.playing ? L("Pause", "Pausa") : (P.t >= MV.dur - 1e-6 ? L("Again", "Otra vez") : L("Go", "Iniciar"));
  $("backBtn").disabled = P.t <= 1e-6;
  $("fwdBtn").disabled = s >= last && P.t >= stepEnd(last) - 1e-6;
  $("goBtn").disabled = S.ghost; $("scrub").disabled = S.ghost; $("backBtn").disabled = $("backBtn").disabled || S.ghost; $("fwdBtn").disabled = $("fwdBtn").disabled || S.ghost;
}

/* ── the player: plays once from → to, then stops; no frames are asked for while idle ── */
function stop() { P.playing = false; if (P.raf) cancelAnimationFrame(P.raf); P.raf = 0; }
function play(from, to) {
  stop();
  if (REDUCE) { P.t = to; P.ran = true; show(); return; }
  P.from = from; P.to = to; P.t = from; P.t0 = performance.now(); P.playing = true; P.ran = true;
  const tick = now => {
    if (!P.playing) return;
    const t = P.from + (now - P.t0) / 1000 * S.speed;
    P.t = Math.min(P.to, Math.max(P.from, t));
    if (P.t >= P.to) { P.t = P.to; P.playing = false; P.raf = 0; show(); return; }
    show(); P.raf = requestAnimationFrame(tick);
  };
  P.raf = requestAnimationFrame(tick);
  paintPlayer();
}
function go() {
  if (S.ghost) return;
  if (P.playing) { stop(); show(); return; }
  play(P.t >= MV.dur - 1e-6 ? 0 : P.t, MV.dur);
}
function next() {
  if (S.ghost) return;
  const s = stepAt(P.t), here = P.t >= stepEnd(s) - 1e-6 ? s + 1 : s;
  if (here > nSteps() - 1) return;
  play(P.t, stepEnd(here));
}
function back() {
  if (S.ghost) return;
  stop();
  // the latest step end before this moment (or the very start)
  let t = 0;
  for (let s = 0; s < nSteps(); s++) { const e = stepEnd(s); if (e < P.t - 1e-6) t = e; }
  P.t = t; show();
}
function jumpStep(i) { if (S.ghost) setGhost(false); stop(); if (i === 0) { P.t = 0; show(); return; } play(stepEnd(i - 1), stepEnd(i)); }

/* ── open a move ── */
function open(id, push) {
  if (!BY[id]) id = "ready";
  stop(); MV = BY[id]; S.id = id; save();
  P.t = 0; P.ran = false;
  if (push) { const u = location.pathname + location.search + "#" + id; if (location.hash !== "#" + id) history.replaceState(null, "", u); }
  $("movePick").value = id;
  panel();
  if (G3) G3.setMove(MV, mirror);
  show();
}
function setMirror(on) {
  mirror = on; stop();
  const q = new URLSearchParams(location.search); if (on) q.set("side", "left"); else q.delete("side");
  const qs = q.toString(); history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
  $("mirrorBtn").setAttribute("aria-pressed", String(on));
  $("capSide").hidden = !on; $("capSide").textContent = L("Other side", "Otro lado");
  if (G3) G3.setMove(MV, mirror);
  show();
}
function setGhost(on) {
  S.ghost = on; save(); stop();
  $("ghostBtn").setAttribute("aria-pressed", String(on));
  if (G3) G3.setGhost(on);
  show();
}

/* ── the picker: a drop-down grouped by kind, with the grade band on each move ── */
function picker() {
  const band = S.band;
  const ok = m => band === "all" || bandRank(m.band) <= bandRank(band);
  $("movePick").innerHTML = D.KINDS.map(k => {
    const list = MOVES.filter(m => m.kind === k.k && (ok(m) || m.id === S.id));
    if (!list.length) return "";
    return `<optgroup label="${esc(L(k.en, k.es))}">` + list.map(m => `<option value="${m.id}">${esc(words(m).n)} · ${D.BANDS[m.band]}${progMark(m.id)}</option>`).join("") + "</optgroup>";
  }).join("");
  $("movePick").value = S.id;
  $("bandPick").innerHTML = [["all", L("All grades", "Todos los grados")], ["K-2", "K–2"], ["3-5", L("Up to 3–5", "Hasta 3–5")], ["6-8", L("Up to 6–8", "Hasta 6–8")], ["9-12", L("Up to 9–12", "Hasta 9–12")]]
    .map(([v, t]) => `<option value="${v}">${esc(t)}</option>`).join("");
  $("bandPick").value = band;
}
const bandRank = b => ({ "K-2": 0, "3-5": 1, "6-8": 2, "9-12": 3 }[b] || 0);
function progMark(id) { const p = S.progress[id] || 0; return p === 3 ? " ✓✓" : p === 2 ? " ✓" : ""; }

/* ── the words beside the stage ── */
function panel() {
  const m = MV, w = words(m), p = S.progress[m.id] || 0;
  const kind = D.KINDS.find(k => k.k === m.kind);
  const safety = m.fall ? D.SAFE.fall : m.kind === "kick" ? D.SAFE.kick : (m.kind === "hand" || m.kind === "block" || m.kind === "combo") ? D.SAFE.strike : null;
  const hist = m.id === "form-1"
    ? L("This form was made for this site. Its moves come from karate and taekwondo.", "Esta forma se hizo para este sitio. Sus movimientos vienen del karate y el taekwondo.")
    : L("This move comes from ", "Este movimiento viene de ") + (es() ? m.art.es : m.art.en) + ".";
  const ladder = [[1, L("Learning", "Aprendiendo")], [2, L("I can do it slowly", "Lo hago despacio")], [3, L("I can do it smoothly", "Lo hago con fluidez")]];
  const nexts = nextUp();
  $("panel").innerHTML =
    `<p class="kicker">${esc(L(kind.en, kind.es))}</p>
     <h2 id="moveName">${esc(w.n)}</h2>
     <p><span class="tag">${L("Grades ", "Grados ")}${D.BANDS[m.band]}</span><span class="tag">${esc(es() ? m.art.es : m.art.en)}</span></p>
     <h3>${L("Steps", "Pasos")}</h3>
     <ol class="tsteps" id="steps">${w.steps.map((s, i) => `<li data-step="${i}" tabindex="0">${esc(s)}</li>`).join("")}</ol>
     <h3>${L("What helps", "Lo que ayuda")}</h3>
     <ul class="tips">${w.tips.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
     <div class="note warn" id="safety"><p><b>${L("Safety first", "Primero la seguridad")}</b></p>
       <p>${L("Warm up first. Clear space around you. Stop if something hurts. Children: practise with a grown-up nearby.", "Calienta primero. Despeja el espacio a tu alrededor. Detente si algo duele. Niños: practiquen con un adulto cerca.")}</p>
       ${safety ? `<p>${esc(es() ? safety.es : safety.en)}</p>` : ""}</div>
     <h3>${L("My practice", "Mi práctica")}</h3>
     <div class="prog" role="group" aria-label="${L("My practice", "Mi práctica")}">${ladder.map(([v, t]) => `<button type="button" data-prog="${v}" aria-pressed="${p === v}">${esc(t)}</button>`).join("")}</div>
     <p class="muted" style="font-size:.9rem;margin:.3rem 0 0">${L("Saved on this device only.", "Se guarda solo en este equipo.")}</p>
     ${nexts.length ? `<h3>${L("Try next", "Prueba después")}</h3><div class="nextup">${nexts.map(n => `<button type="button" data-open="${n.id}">${esc(words(n).n)}</button>`).join("")}</div>` : ""}
     <h3>${L("Learn the history", "Aprende la historia")}</h3>
     <p>${esc(hist)} <a class="more" href="/martial-arts">${L("The martial arts course →", "El curso de artes marciales →")}</a></p>`;
  document.querySelectorAll("#steps li").forEach(li => {
    const i = +li.getAttribute("data-step");
    li.onclick = () => jumpStep(i);
    li.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); jumpStep(i); } };
  });
  document.querySelectorAll("#panel [data-prog]").forEach(b => b.onclick = () => {
    const v = +b.getAttribute("data-prog"); S.progress[m.id] = S.progress[m.id] === v ? 0 : v; if (!S.progress[m.id]) delete S.progress[m.id]; save();
    picker(); panel(); show();
  });
  document.querySelectorAll("#panel [data-open]").forEach(b => b.onclick = () => { open(b.getAttribute("data-open"), true); window.scrollTo({ top: 0 }); });
}
/* moves in the same group the learner has not marked "smoothly" yet, after this one */
function nextUp() {
  const same = MOVES.filter(x => x.kind === MV.kind && x.id !== MV.id && (S.progress[x.id] || 0) < 3);
  const i = MOVES.indexOf(MV);
  return same.sort((a, b) => ((MOVES.indexOf(a) - i + 99) % 99) - ((MOVES.indexOf(b) - i + 99) % 99)).slice(0, 3);
}

/* ── the page's own words ── */
function pageWords() {
  document.documentElement.lang = S.lang;
  document.title = L("The Dojo", "El Dojo") + " — Architecture of Grace";
  $("brand").textContent = L("The Dojo", "El Dojo");
  $("mastK").textContent = L("Martial arts · moves in 3D", "Artes marciales · movimientos en 3D");
  $("mastH").textContent = L("The Dojo", "El Dojo");
  $("mastL").textContent = L("Pick a move. Press Go to watch it once, or step through it slowly.", "Elige un movimiento. Toca Iniciar para verlo una vez, o avanza paso a paso.");
  $("langBtn").textContent = es() ? "EN" : "ES";
  $("themeBtn").textContent = isDark() ? L("Light", "Claro") : L("Dark", "Oscuro");
  $("nav").innerHTML = `<a href="/martial-arts">${L("The course", "El curso")}</a><a href="/dojo" class="on">${L("The Dojo", "El Dojo")}</a>`;
  $("pickLab").textContent = L("Move", "Movimiento");
  $("bandLab").textContent = L("Grades", "Grados");
  $("speedLab").textContent = L("Speed", "Velocidad");
  $("viewLab").textContent = L("View", "Vista");
  $("speedPick").innerHTML = [[1, L("Normal", "Normal")], [0.5, L("Slow", "Lento")], [0.25, L("Very slow", "Muy lento")]].map(([v, t]) => `<option value="${v}">${t}</option>`).join("");
  $("speedPick").value = String(S.speed);
  $("viewPick").innerHTML = [["front", L("Front", "De frente")], ["side", L("Side", "De lado")], ["behind", L("Behind you (copy it like a mirror)", "Detrás de ti (cópialo como en un espejo)")], ["orbit", L("Walk around (drag)", "Dar la vuelta (arrastra)")]]
    .map(([v, t]) => `<option value="${v}">${esc(t)}</option>`).join("");
  $("viewPick").value = S.view;
  $("mirrorBtn").textContent = L("Mirror: practise the other side", "Espejo: practica el otro lado");
  $("ghostBtn").textContent = L("Ghost: the whole move in one picture", "Fantasma: todo el movimiento en una imagen");
  $("backBtn").setAttribute("aria-label", L("Step back", "Paso anterior"));
  $("fwdBtn").setAttribute("aria-label", L("Next step", "Paso siguiente"));
  $("scrub").setAttribute("aria-label", L("Move through time", "Moverse en el tiempo"));
  $("capSide").textContent = L("Other side", "Otro lado");
  $("foot").textContent = L("Architecture of Grace · The Dojo · Practise slowly, in a clear space, and strike only the air. Falls only on a mat. Children: with a grown-up nearby.",
    "Architecture of Grace · El Dojo · Practica despacio, en un espacio despejado, y golpea solo el aire. Caídas solo sobre colchoneta. Niños: con un adulto cerca.");
  waitNote();
}

/* ── wiring ── */
$("goBtn").onclick = go;
$("fwdBtn").onclick = next;
$("backBtn").onclick = back;
$("scrub").oninput = () => { stop(); P.t = Math.min(MV.dur, +$("scrub").value / FPS); show(); };
$("movePick").onchange = () => open($("movePick").value, true);
$("bandPick").onchange = () => { S.band = $("bandPick").value; save(); picker(); };
$("speedPick").onchange = () => { S.speed = +$("speedPick").value; save(); if (P.playing) { const t = P.t; P.from = t; P.t0 = performance.now(); } };
$("viewPick").onchange = () => { S.view = $("viewPick").value; save(); if (G3) { G3.setView(S.view); show(); } };
$("mirrorBtn").onclick = () => setMirror(!mirror);
$("ghostBtn").onclick = () => setGhost(!S.ghost);
$("langBtn").onclick = () => { S.lang = es() ? "en" : "es"; save(); try { localStorage.setItem("aog.lang", S.lang); } catch (e) {} pageWords(); picker(); panel(); show(); };
$("themeBtn").onclick = () => {
  const n = isDark() ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", n); document.documentElement.classList.toggle("dark", n === "dark");
  try { localStorage.setItem("aog.interior.ws.v1.theme", n); } catch (e) {}
  pageWords();
};
new MutationObserver(() => { $("themeBtn").textContent = isDark() ? L("Light", "Claro") : L("Dark", "Oscuro"); if (G3) { G3.colors(); show(); } })
  .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
let rsT = 0;
window.addEventListener("resize", () => { clearTimeout(rsT); rsT = setTimeout(() => { if (G3 && G3.resize()) show(); }, 120); });
window.addEventListener("hashchange", () => { const k = location.hash.slice(1); if (BY[k] && k !== S.id) open(k, false); });
const st = $("stage");
st.addEventListener("pointerdown", e => { if (G3) G3.onDown(e); });
st.addEventListener("pointermove", e => { if (G3 && G3.onMove(e)) show(); });
["pointerup", "pointercancel", "pointerleave"].forEach(k => st.addEventListener(k, () => { if (G3) G3.onUp(); }));
window.addEventListener("pagehide", () => { stop(); if (G3) { G3.dispose(); G3 = null; G3state = ""; } });

/* for the site's checks (tools/check-dojo.js) */
window.AOGDojo = { MOVES, P, state: S, open: id => open(id, true), go, next, back, stepAt: t => stepAt(t), stepEnd: s => stepEnd(s),
  get move() { return MV; }, get mirror() { return mirror; }, G3: () => G3, G3state: () => G3state, setMirror, setGhost };

pageWords();
const start = location.hash.slice(1);
if (BY[start]) S.id = start;
picker();
$("mirrorBtn").setAttribute("aria-pressed", String(mirror)); $("capSide").hidden = !mirror;
$("ghostBtn").setAttribute("aria-pressed", String(S.ghost));
open(S.id, !!BY[start]);
/* the room loads right after the words are showing */
setTimeout(load3D, 30);
})();
