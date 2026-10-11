
(function () {
  /* The seasonal window is a fact about today's date. seasonFromDate() has
     always existed for Family Mode; school mode made students pick it from a
     dropdown and blocked them with an alert if they didn't. Prefill it.
     A launch link (?window=) or a deliberate change still wins — we only ever
     fill a blank. */
  function fillWindow() {
    try {
      var w = document.getElementById("window");
      if (!w || w.value) return;
      if (typeof seasonFromDate !== "function") return;
      var s = seasonFromDate();
      /* A school in August is already in its Fall window even though the
         calendar still says Summer. Family Mode keeps the calendar answer;
         only the school-side prefill shifts. */
      try {
        if (s === "Summer" && new Date().getMonth() === 7 &&
            (typeof context === "undefined" || context === "school")) { s = "Fall"; }
      } catch (e) {}
      for (var i = 0; i < w.options.length; i++) {
        if (w.options[i].value === s) { w.value = s; break; }
      }
    } catch (e) {}
  }

  /* Same for the grade when a classroom link carried one — parseLaunchParams
     runs before this screen is ever shown, so re-apply on entry. */
  function fillGrade() {
    try {
      var g = document.getElementById("grade");
      if (!g || g.value) return;
      var v = sessionStorage.getItem("aog.launch.grade");
      if (!v) return;
      for (var i = 0; i < g.options.length; i++) {
        if (g.options[i].value === v || g.options[i].text === v) { g.value = g.options[i].value; break; }
      }
    } catch (e) {}
  }

  function fill() { fillWindow(); fillGrade(); }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fill);
  else fill();
  setTimeout(fill, 400);

  /* Re-fill whenever the check-in screen is opened, since resetToStart()
     deliberately blanks both fields. */
  try {
    var real = window.showScreen;
    if (typeof real === "function") {
      window.showScreen = function (id) {
        var r = real.apply(this, arguments);
        if (id === "screen-checkin") { setTimeout(fill, 30); }
        return r;
      };
    }
  } catch (e) {}
})();
