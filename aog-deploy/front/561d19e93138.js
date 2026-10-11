
/* ═══ WHERE ARE THE CHECK-IN RESULTS? ════════════════════════════════════════
   They were already on this screen. That is the problem.

   The daily CHECK-IN (what a student says about their own day) and the daily
   LOG (what a teacher records per period) are two different tools, and the
   check-in results were appended to the bottom of the log's tab with no
   heading of their own. A teacher who had just sent a check-in to two classes
   opened the tab, saw a logging form for one student at a time, and concluded
   the results were somewhere else. There was nothing on screen that said the
   word "check-in" until you had scrolled past a whole form for something else.

   This adds the two things that were missing and changes no behavior:
     · a real heading over the check-in section, saying what it is and that
       "Pull check-ins from the sheet" is what fetches rows written on the
       students' own devices;
     · a jump link at the top of the tab — but ONLY when check-ins actually
       exist, so it never advertises an empty room.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  function T(en, es) {
    try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; }
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }
  function el(id) { return document.getElementById(id); }

  function countCheckins() {
    var n = 0;
    try {
      var logs = (JSON.parse(localStorage.getItem("aog.checkin.student.v1") || "{}") || {}).logs || {};
      for (var k in logs) {
        if (!Object.prototype.hasOwnProperty.call(logs, k)) continue;
        for (var d in logs[k]) {
          if (Object.prototype.hasOwnProperty.call(logs[k], d)) n += (logs[k][d] || []).length;
        }
      }
    } catch (e) {}
    try {
      var remote = JSON.parse(localStorage.getItem("aog.checkin.remote") || "[]");
      if (Object.prototype.toString.call(remote) === "[object Array]") n += remote.length;
    } catch (e2) {}
    return n;
  }

  var CSS = [
    "#aogCiHead{margin:34px 0 4px;padding-top:22px;border-top:2px solid var(--gold,#B8893A);}",
    "#aogCiHead .cih-eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);font-weight:700;}",
    "#aogCiHead h3{font-family:Fraunces,Cormorant Garamond,serif;font-size:23px;margin:3px 0 6px;color:var(--ink);}",
    "#aogCiHead .cih-sub{font-size:13px;line-height:1.55;color:var(--ink-soft,#46506E);max-width:70ch;}",
    "#aogCiJump{display:inline-flex;align-items:center;gap:7px;margin:0 0 16px;padding:9px 15px;border:1px solid var(--gold,#B8893A);",
    "  border-radius:999px;background:var(--card,#fff);color:var(--ink);font:inherit;font-size:13px;font-weight:700;cursor:pointer;}",
    "#aogCiJump:hover{background:var(--cream,#FBF8F1);}",
    "#aogCiJump .cij-n{font-weight:800;color:var(--gold-deep,#9a6f24);}",
    "@media print{#aogCiJump{display:none !important;}}"
  ].join("\n");

  function styleOnce() {
    if (el("aog-checkin-wayfinding-css")) return;
    var st = document.createElement("style");
    st.id = "aog-checkin-wayfinding-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function heading() {
    var extra = el("aogCiPanelExtra");
    if (!extra) return false;
    styleOnce();
    var h = el("aogCiHead");
    if (!h) {
      h = document.createElement("div");
      h.id = "aogCiHead";
      extra.parentNode.insertBefore(h, extra);
    }
    h.innerHTML =
      '<div class="cih-eyebrow">' + esc(T("The students’ own words", "Las palabras de los estudiantes")) + "</div>" +
      "<h3>" + esc(T("Daily check-in results", "Resultados del registro diario")) + "</h3>" +
      '<div class="cih-sub">' +
        esc(T("These are daily check-ins: what students said about their own day, on their own devices. Your notes above are separate.",
              "Estos son los registros diarios: lo que los estudiantes dijeron de su propio día, en sus dispositivos. Tus notas de arriba son aparte.")) +
        " " +
        esc(T("Check-ins from other devices appear when you tap “Pull check-ins from the sheet.”",
              "Los registros de otros dispositivos aparecen al tocar “Traer registros de la hoja”.")) +
      "</div>";
    return true;
  }

  function jump() {
    var panel = el("panel-daily");
    if (!panel || !el("aogCiPanelExtra")) return;
    var n = countCheckins();
    var b = el("aogCiJump");
    /* An empty room needs no signpost. */
    if (!n) { if (b) b.remove(); return; }
    styleOnce();
    if (!b) {
      b = document.createElement("button");
      b.type = "button";
      b.id = "aogCiJump";
      var head = panel.querySelector(".section-head");
      if (head && head.nextSibling) panel.insertBefore(b, head.nextSibling);
      else panel.insertBefore(b, panel.firstChild);
      b.addEventListener("click", function () {
        var t = el("aogCiHead") || el("aogCiPanelExtra");
        if (t && t.scrollIntoView) t.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    b.innerHTML = esc(T("Daily check-in results", "Resultados del registro diario")) +
      ' <span class="cij-n">' + n + "</span> ↓";
  }

  function paint() { if (heading()) jump(); }

  /* aogRenderDaily rebuilds #aogCiPanelExtra, which throws away anything we
     put inside it — so re-run after it, the same way the check-in layer
     wraps it rather than editing it. */
  (function wrap() {
    function attach() {
      if (typeof window.aogRenderDaily !== "function" || window.aogRenderDaily.__aogWayfind) return;
      var orig = window.aogRenderDaily;
      var wrapped = function () {
        var r = orig.apply(this, arguments);
        try { setTimeout(paint, 30); } catch (e) {}
        return r;
      };
      wrapped.__aogWayfind = true;
      /* preserve the check-in layer's own marker if it wrapped first */
      if (orig.__aogCheckin) wrapped.__aogCheckin = true;
      window.aogRenderDaily = wrapped;
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", attach);
    else attach();
    setTimeout(attach, 900);
    setTimeout(attach, 2600);
  })();

  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest && e.target.closest('.tab[data-tab="daily"], .tab, .dmode');
    if (t) setTimeout(paint, 250);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(paint, 700); });
  else setTimeout(paint, 700);
  setTimeout(paint, 2600);

  window.AOGCheckinWayfinding = { paint: paint, count: countCheckins };
})();
