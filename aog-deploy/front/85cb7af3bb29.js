
/* ============================================================================
   HOW THEY TAKE IT, AS BUTTONS  ·  2026-08-28

   Jimmy: "I really like how the exit ticket is set up. Can the daily check in
   and self reflection have a similar set up (it looks like less choices)."

   The Classroom Link Generator's last dropdown becomes the same button row the
   exit slip uses, and gains the same live sentence underneath saying what the
   link now carries. That sentence is the actual thing being copied: the exit
   slip card feels ANSWERED rather than filled in, and the reason is that it
   tells you what you just built.

   The <select id="lgMode"> is untouched and still holds the value. Everything
   that reads it -- the link builder, the remember-my-fields list, the
   harnesses -- goes on reading it. The buttons write to it and dispatch a
   real change event, so nothing needed rewiring.

   FAIL OPEN. English labels are in the markup. If this block never runs, a
   teacher still sees three working buttons in English.
   ============================================================================ */
(function () {
  "use strict";

  function el(id) { return document.getElementById(id); }
  function isEs() { try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; } catch (e) { return false; } }
  function T(en, es) { return isEs() ? es : en; }

  var MODES = [
    { v: "rapid",
      en: "Quick — about 5 minutes",  es: "Rápida — unos 5 minutos",
      hintEn: "The same 18 questions without the written parts. It fits a short advisory, and it is the one to use for a whole class.",
      hintEs: "Las mismas 18 preguntas sin las partes escritas. Cabe en una asesoría corta y es la indicada para una clase entera." },
    { v: "depth",
      en: "Thorough — adds writing",  es: "Completa — añade escritura",
      hintEn: "Adds the follow-up intensity questions and three short written reflections. Keep it for small groups or one-on-one — a class of thirty will not finish it in a period.",
      hintEs: "Añade las preguntas de intensidad y tres reflexiones escritas breves. Resérvala para grupos pequeños o uno a uno — una clase de treinta no la termina en un periodo." },
    { v: "",
      en: "Let students choose",      es: "Que elija el estudiante",
      hintEn: "The student picks the length before they start. Workable with older students; a sixth-grade class moves faster if you decide for them.",
      hintEs: "El estudiante elige la duración antes de empezar. Funciona con estudiantes mayores; una clase de sexto avanza más rápido si decides tú." }
  ];

  function paint() {
    var sel = el("lgMode"), box = el("lgModeBtns"), hint = el("lgModeHint");
    if (!sel || !box) return;
    var cur = String(sel.value || "");
    Array.prototype.forEach.call(box.querySelectorAll("button[data-m]"), function (b) {
      var v = b.getAttribute("data-m") || "";
      var on = v === cur;
      var def = null;
      for (var i = 0; i < MODES.length; i++) if (MODES[i].v === v) def = MODES[i];
      if (def) b.textContent = T(def.en, def.es);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.style.background  = on ? "var(--navy,#0A1E33)" : "";
      b.style.color       = on ? "#fff" : "";
      b.style.borderColor = on ? "var(--navy,#0A1E33)" : "";
    });
    if (hint) {
      var d = null;
      for (var k = 0; k < MODES.length; k++) if (MODES[k].v === cur) d = MODES[k];
      /* Green when the teacher has fixed the length, amber when the choice is
         handed to a twelve-year-old — the same two colors the exit slip's
         class-list line uses, meaning the same two things. */
      if (d) {
        hint.style.color = cur ? "var(--green,#2E6B3A)" : "var(--amber,#8A6D1F)";
        hint.textContent = (cur ? "✓ " : "⚠ ") + T(d.hintEn, d.hintEs);
      }
    }
    var sum = el("lgMoreSum");
    if (sum) sum.textContent = T("One more, for districts running several schools",
                                 "Uno más, para distritos con varias escuelas");
    var lbl = el("lgModeLbl");
    if (lbl && isEs()) lbl.textContent = "Cómo la hacen";
  }

  function wire() {
    var box = el("lgModeBtns"), sel = el("lgMode");
    if (!box || !sel || box.getAttribute("data-wired")) { paint(); return; }
    box.setAttribute("data-wired", "1");
    box.addEventListener("click", function (e) {
      var b = e.target && e.target.closest && e.target.closest("button[data-m]");
      if (!b) return;
      sel.value = b.getAttribute("data-m") || "";
      /* A real bubbling change event, so every listener already on lgMode --
         the link builder and the remember-my-fields writer among them -- runs
         exactly as it did when this was a dropdown. */
      try { sel.dispatchEvent(new Event("change", { bubbles: true })); } catch (x) {
        var ev = document.createEvent("HTMLEvents"); ev.initEvent("change", true, false); sel.dispatchEvent(ev);
      }
      paint();
    });
    sel.addEventListener("change", paint);
    paint();
  }

  function go() { try { wire(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
  /* Field values are restored from storage after load; repaint once they are. */
  setTimeout(go, 700); setTimeout(go, 2400);
  try { new MutationObserver(paint)
    .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
})();
