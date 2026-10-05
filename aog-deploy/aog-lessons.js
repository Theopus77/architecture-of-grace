/* ══ AOG-LESSONS-V1 (2026-10-05) — one lesson card for every music lab ════════════════════════════════════════════════
   Jimmy: "make sure all music labs have lessons galore". The piano's and the drum machine's lessons are each built into
   their own page; the labs that had none (the Beat Lab, the Drum Kit, the guitar, the bass, the band and the Mixing Desk)
   share this one card instead. A lab gives it its lessons (made by _work/music/make_lab_lessons.py from the lab's lesson
   file, which also makes the lab's printable worksheets page) and tells it, as things happen, which step was just done:

     const L = AOGLessons.attach({
       data: window.AOG_LESSON_DATA,          // {key, sheet, lessons:[{id, en, es, ben, bes, steps:[ids], song, ten, tes}], steps:{id:[en, es]}}
       mount: "lessons",                      // the <section> the card is drawn in
       lang: () => "en" or "es"
     });
     L.mark("play1");                         // a step is done: it ticks, and stays ticked on this device
     L.count("sends")                         // a counter kept with the lessons (returns the new value)
     L.paint();                               // after the page's language changes

   The card: "Lessons · 3/18", the Worksheet button, one menu of every lesson (a drop-down, as CLAUDE.md asks), the lesson's
   name and one line about it, its steps (each ticks itself when done), a "Try this" line, and Next lesson when it is done.
   Steps tick only for the lesson's own ids; nothing moves or sounds on its own. ═════════════════════════════════════ */
(function (root) {
  "use strict";
  var W = {
    lessons: { en: "Lessons", es: "Lecciones" },
    lesson: { en: "Lesson {n} of {t}", es: "Lección {n} de {t}" },
    song: { en: "A song to make", es: "Una canción para hacer" },
    sheet: { en: "Worksheet {n}", es: "Hoja {n}" },
    pick: { en: "Pick a lesson", es: "Elige una lección" },
    skills: { en: "Skills", es: "Habilidades" },
    songs: { en: "Songs to make", es: "Canciones para hacer" },
    tryit: { en: "Try this:", es: "Prueba esto:" },
    done: { en: "Well done. That lesson is finished.", es: "Muy bien. Esa lección está terminada." },
    alldone: { en: "Every lesson is finished. You can play any of them again.", es: "Terminaste todas las lecciones. Puedes repetir cualquiera." },
    next: { en: "Next lesson →", es: "Siguiente lección →" },
    start: { en: "Do the steps here, on the lab. They tick themselves.", es: "Haz los pasos aquí, en el laboratorio. Se marcan solos." }
  };
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  var CSS = [
    ".aogl{background:var(--card,#fffcf7);color:var(--ink,#1a232c);border:1px solid var(--line,#ddd8cc);border-radius:16px;padding:.9rem 1rem 1rem;margin:1rem 0}",
    ".aogl-head{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;justify-content:space-between}",
    ".aogl-k{margin:0;font:800 .74rem/1.2 var(--sans,system-ui,sans-serif);letter-spacing:.12em;text-transform:uppercase;color:var(--steel,#2f5c6b)}",
    ".aogl-sheet{min-height:44px;display:inline-flex;align-items:center;padding:0 .9rem;border-radius:999px;border:1px solid var(--line,#ddd8cc);background:var(--card,#fffcf7);color:var(--ink,#1a232c);font-weight:700;font-size:.9rem;text-decoration:none}",
    ".aogl-pick{display:grid;gap:.3rem;margin:.6rem 0 .2rem;font:800 .72rem/1.2 var(--sans,system-ui,sans-serif);letter-spacing:.12em;text-transform:uppercase;color:var(--ink,#1a232c)}",
    ".aogl-pick select{min-height:48px;width:100%;font:600 16px/1.25 var(--sans,system-ui,sans-serif);letter-spacing:0;text-transform:none;color:#0A1E33;background:#FFFDF8;border:1px solid #c9bfa9;border-radius:12px;padding:0 .6rem}",
    ".aogl-mk{margin:.7rem 0 0;font-size:.85rem;color:var(--muted,#5c6670)}",
    ".aogl h3{margin:.15rem 0 .25rem;font-size:1.25rem}",
    ".aogl-b{margin:0 0 .5rem;color:var(--ink,#1a232c)}",
    ".aogl ol{list-style:none;margin:.4rem 0;padding:0;display:grid;gap:.4rem}",
    ".aogl li{display:grid;grid-template-columns:auto 1fr;gap:.6rem;align-items:start;line-height:1.4}",
    ".aogl-ck{width:1.6rem;height:1.6rem;border-radius:7px;border:2px solid var(--muted,#5c6670);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1rem;color:#fff}",
    ".aogl li.ok .aogl-ck{background:#2c7a4e;border-color:#2c7a4e}",
    ".aogl li.ok>span:last-child{color:var(--muted,#5c6670)}",
    ".aogl-try{margin:.6rem 0 0;padding:.5rem .7rem;border-left:4px solid #c45c26;background:var(--steel-soft,#e3eef2);border-radius:0 8px 8px 0;color:var(--ink,#1a232c)}",
    ".aogl-ok{margin:.7rem 0 0;display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;font-weight:700;color:var(--ink,#1a232c)}",
    ".aogl-next{min-height:44px;border-radius:12px;border:1px solid #2c7a4e;background:#2c7a4e;color:#fff;font:800 .95rem/1.2 var(--sans,system-ui,sans-serif);padding:0 1rem;cursor:pointer}",
    "@media print{.aogl{display:none}}"
  ].join("\n");
  function style() { if (document.getElementById("aogl-style")) return; var s = document.createElement("style"); s.id = "aogl-style"; s.textContent = CSS; document.head.appendChild(s); }

  function attach(o) {
    var D = o.data || {}, LES = D.lessons || [], STEPS = D.steps || {}, KEY = D.key || "aog.lessons.v1";
    var st = { done: {}, pick: null, n: {} };
    try { var r = JSON.parse(localStorage.getItem(KEY) || "null"); if (r) { st.done = r.done || {}; st.pick = typeof r.pick === "number" ? r.pick : null; st.n = r.n || {}; } } catch (e) {}
    var lang = function () { try { return o.lang() === "es" ? "es" : "en"; } catch (e) { return "en"; } };
    var w = function (k, v) { var s = (W[k] || {})[lang()] || k; if (v) for (var x in v) s = s.split("{" + x + "}").join(v[x]); return s; };
    var L2 = function (en, es) { return lang() === "es" ? (es || en) : en; };
    var save = function () { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
    var isDone = function (m) { return m.steps.every(function (id) { return st.done[id]; }); };
    var now = function () { for (var i = 0; i < LES.length; i++) if (!isDone(LES[i])) return i; return LES.length; };
    var picked = function () { if (st.pick == null || st.pick < 0 || st.pick >= LES.length) return Math.min(now(), LES.length - 1); return st.pick; };
    var soon = 0;
    function mount() { return typeof o.mount === "string" ? document.getElementById(o.mount) : o.mount; }
    function paint() {
      var box = mount(); if (!box || !LES.length) return;
      style(); box.classList.add("aogl", "no-print");
      var p = picked(), m = LES[p], doneN = LES.filter(isDone).length, es = lang() === "es", ok = isDone(m), all = now() >= LES.length;
      var opts = function (song) {
        return LES.map(function (x, i) { return { x: x, i: i }; }).filter(function (y) { return !!y.x.song === song; })
          .map(function (y) { return '<option value="' + y.i + '"' + (y.i === p ? " selected" : "") + ">" + (y.i + 1) + (isDone(y.x) ? " ✓" : "") + " · " + esc(L2(y.x.en, y.x.es)) + "</option>"; }).join("");
      };
      var songs = opts(true);
      var html = '<div class="aogl-head"><p class="aogl-k">' + esc(w("lessons")) + " · " + doneN + "/" + LES.length + "</p>" +
        (D.sheet ? '<a class="aogl-sheet" href="' + esc(D.sheet) + "#l" + (p + 1) + '">' + esc(w("sheet", { n: p + 1 })) + "</a>" : "") + "</div>" +
        '<label class="aogl-pick"><span>' + esc(w("pick")) + '</span><select data-aogl-pick>' +
        '<optgroup label="' + esc(w("skills")) + '">' + opts(false) + "</optgroup>" +
        (songs ? '<optgroup label="' + esc(w("songs")) + '">' + songs + "</optgroup>" : "") + "</select></label>" +
        '<p class="aogl-mk">' + esc(w("lesson", { n: p + 1, t: LES.length })) + (m.song ? " · " + esc(w("song")) : "") + (ok ? " · ✓" : "") + "</p>" +
        "<h3>" + esc(L2(m.en, m.es)) + "</h3>" +
        '<p class="aogl-b">' + esc(L2(m.ben, m.bes)) + (doneN === 0 && p === 0 ? " " + esc(w("start")) : "") + "</p>" +
        "<ol>" + m.steps.map(function (id) { var s = STEPS[id] || [id, id], d = !!st.done[id];
          return '<li class="' + (d ? "ok" : "") + '"><span class="aogl-ck" aria-hidden="true">' + (d ? "✓" : "") + '</span><span>' + (d ? '<span class="sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">✓ </span>' : "") + esc(L2(s[0], s[1])) + "</span></li>"; }).join("") + "</ol>" +
        (m.ten ? '<p class="aogl-try"><b>' + esc(w("tryit")) + "</b> " + esc(L2(m.ten, m.tes)) + "</p>" : "") +
        (ok ? '<p class="aogl-ok" aria-live="polite">' + esc(all ? w("alldone") : w("done")) + (p < LES.length - 1 ? ' <button type="button" class="aogl-next" data-aogl-next>' + esc(w("next")) + "</button>" : "") + "</p>" : "");
      if (box.__h === html) return;
      var f = document.activeElement, keep = f && box.contains(f) && f.matches && f.matches("[data-aogl-pick]");
      box.innerHTML = html; box.__h = html;
      var sel = box.querySelector("[data-aogl-pick]");
      sel.setAttribute("aria-label", w("pick"));
      sel.onchange = function () { st.pick = +sel.value; save(); paint(); };
      if (keep) sel.focus({ preventScroll: true });
      var nx = box.querySelector("[data-aogl-next]");
      if (nx) nx.onclick = function () { st.pick = Math.min(LES.length - 1, picked() + 1); save(); paint(); };
    }
    function paintSoon() { clearTimeout(soon); soon = setTimeout(paint, 250); }
    var api = {
      /* the lesson on screen stays on screen when it is finished, with Next lesson, until it is pressed */
      mark: function (id) { if (!STEPS[id] || st.done[id]) return false; if (st.pick == null && LES.length) st.pick = picked(); st.done[id] = true; save(); paintSoon(); return true; },
      marked: function (id) { return !!st.done[id]; },
      count: function (k) { st.n[k] = (st.n[k] || 0) + 1; save(); return st.n[k]; },
      counted: function (k) { return st.n[k] || 0; },
      paint: paint,
      picked: function () { return LES[picked()]; },
      reset: function () { st.done = {}; st.pick = 0; st.n = {}; save(); paint(); }
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint); else paint();
    return api;
  }
  root.AOGLessons = { attach: attach };
})(typeof window !== "undefined" ? window : this);
