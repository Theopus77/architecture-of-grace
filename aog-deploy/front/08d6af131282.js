
/* ===================================================================
   ITEM 7 · GRACE STEP — a guided 3-breath micro-interaction
   =================================================================== */
window.aogGraceBreathe = function (btn) {
  var step = btn.closest ? btn.closest(".grace-step") : null;
  if (!step) return;
  var es = (typeof lang !== "undefined" && lang === "es");
  var box = step.querySelector(".grace-breath");
  var orb = step.querySelector(".grace-orb");
  var cue = step.querySelector(".grace-cue");
  if (!box || !orb || !cue) return;
  btn.style.display = "none";
  box.hidden = false;
  var reduce = false;
  try { reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches; } catch (e) {}
  var IN = es ? "Inhala\u2026" : "Breathe in\u2026";
  var HOLD = es ? "Sost\u00e9n" : "Hold";
  var OUT = es ? "Exhala\u2026" : "Breathe out\u2026";
  var DONE = es ? "Bien. Eso ya cuenta." : "Nice. That counts.";
  orb.classList.add("gb-anim");
  var seq = [], i;
  for (i = 0; i < 3; i++) {
    seq.push([IN, 1, 4000]);
    seq.push([HOLD, 1, 1500]);
    seq.push([OUT, 0.6, 4000]);
  }
  seq.push([DONE, 0.78, 0]);
  (function run(idx) {
    if (idx >= seq.length) {
      setTimeout(function () {
        if (btn) { btn.style.display = ""; btn.textContent = es ? "Otra vez" : "Again"; }
      }, 1200);
      return;
    }
    var s = seq[idx];
    cue.textContent = s[0];
    orb.style.setProperty("--gb-dur", (reduce ? 0 : s[2] / 1000) + "s");
    orb.style.transform = "scale(" + s[1] + ")";
    setTimeout(function () { run(idx + 1); }, s[2]);
  })(0);
};
