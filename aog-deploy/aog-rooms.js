/* ══ AOG-ROOM-STEPS-V1 (2026-09-27) — Start Here, one part at a time ════════════
   Jimmy chose the stepper: in every practice room the Start Here pane shows ONE
   part at a time. aog-grace.js loads this file on room pages. The parts are found
   from the pane's own headings: everything before the first h2.ts-h is part 1,
   and each h2.ts-h starts a new part ("What people get wrong", the key words …).
   Nothing is removed: the parts are only wrapped and hidden with the hidden
   attribute, so saved answers, typing and print (which shows every part) are
   untouched. The part a learner is on is remembered for that room. */
(function () {
  "use strict";
  if (window.__aogRoomSteps) return;
  window.__aogRoomSteps = 1;
  var D = document, H = D.documentElement;
  var slug = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
  var KEY = "aog.room.step." + slug;

  function es() { return /^es/i.test(H.lang || ""); }
  function say(el, en, sp) { el.setAttribute("data-en", en); el.setAttribute("data-es", sp); el.textContent = es() ? sp : en; }

  function build() {
    var pane = D.getElementById("paneTeach");
    if (!pane || pane.getAttribute("data-aog-rsteps")) return;
    var kids = Array.prototype.slice.call(pane.children), parts = [[]];
    kids.forEach(function (k) {
      if (k.tagName === "H2" && k.classList.contains("ts-h") && !k.classList.contains("vh") && parts[parts.length - 1].length) parts.push([]);
      if (k.tagName === "H2" && k.classList.contains("vh")) return; /* the pane's hidden name stays where it is */
      if (k.tagName === "SCRIPT" || k.tagName === "STYLE") return;
      parts[parts.length - 1].push(k);
    });
    parts = parts.filter(function (p) { return p.length; });
    if (parts.length < 2) return;
    pane.setAttribute("data-aog-rsteps", String(parts.length));
    var steps = parts.map(function (nodes, i) {
      var w = D.createElement("div"); w.className = "aog-rstep"; w.setAttribute("data-step", String(i + 1));
      pane.insertBefore(w, nodes[0]);
      nodes.forEach(function (n) { w.appendChild(n); });
      /* several "People often think…" cards side by side on a wide screen */
      var traps = w.querySelectorAll(":scope > .trap");
      if (traps.length > 1) {
        var g = D.createElement("div"); g.className = "aog-trapgrid";
        w.insertBefore(g, traps[0]);
        Array.prototype.forEach.call(traps, function (t) { g.appendChild(t); });
      }
      if (w.querySelector(":scope > .aog-trapgrid") && w.querySelector(":scope > .spine")) w.classList.add("aog-rstep-pair");
      var nav = D.createElement("div"); nav.className = "aog-rstepnav no-print";
      var back = D.createElement("button"); back.type = "button"; back.className = "aog-rstep-back"; say(back, "Back", "Atrás");
      var where = D.createElement("span"); where.className = "aog-rstep-where";
      say(where, (i + 1) + " of " + parts.length, (i + 1) + " de " + parts.length);
      var next = D.createElement("button"); next.type = "button"; next.className = "aog-rstep-next";
      if (i === parts.length - 1) say(next, "Done", "Listo"); else say(next, "Next", "Siguiente");
      if (i === 0) back.hidden = true;
      back.addEventListener("click", function () { show(i - 1, true); });
      next.addEventListener("click", function () {
        if (i < parts.length - 1) { show(i + 1, true); return; }
        var tc = D.getElementById("tabCards");
        if (tc) { tc.click(); try { window.scrollTo(0, Math.max(0, (D.querySelector(".tabs") || pane).getBoundingClientRect().top + window.pageYOffset - 70)); } catch (e) {} }
      });
      nav.appendChild(back); nav.appendChild(where); nav.appendChild(next);
      w.appendChild(nav);
      return w;
    });
    function show(n, jump) {
      n = Math.max(0, Math.min(steps.length - 1, n));
      steps.forEach(function (s, j) { s.hidden = j !== n; });
      try { localStorage.setItem(KEY, String(n)); } catch (e) {}
      if (jump) {
        try {
          var top = pane.getBoundingClientRect().top + window.pageYOffset - 70;
          if (window.pageYOffset > top) window.scrollTo(0, Math.max(0, top));
        } catch (e) {}
        try { var f = steps[n].querySelector("h2, h3"); if (f) { f.setAttribute("tabindex", "-1"); f.focus({ preventScroll: true }); } } catch (e) {}
      }
    }
    var start = 0;
    try { start = parseInt(localStorage.getItem(KEY) || "0", 10) || 0; } catch (e) {}
    show(start, false);
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", build); else build();
})();
