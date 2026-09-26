/* AOG-PRACTICE-GLASS-V1 — a small picture on the confidence scale (storm → sun),
   the same five the daily check-in uses. Decoration only (aria-hidden). */
(function () {
  var P = ["⛈️", "🌧️", "⛅", "🌤️", "☀️"];
  function go() {
    document.querySelectorAll(".conf-row").forEach(function (row) {
      Array.prototype.forEach.call(row.querySelectorAll(".conf-b"), function (b, i) {
        if (b.querySelector(".aogpic") || !P[i]) return;
        b.insertAdjacentHTML("afterbegin", '<span class="aogpic" aria-hidden="true">' + P[i] + "</span>");
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
  setTimeout(go, 1200);
})();
