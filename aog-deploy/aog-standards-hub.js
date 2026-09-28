/* AOG-STANDARDS-V2 · 2026-09-28 — the Standards & Alignment hub (/standards).
   Jimmy: "The crosswalk is supposed to incorporate EVERYTHING, not just the SEL
   material." The page holds every part (courses, SEL lessons, faith & texts,
   Daily Drafts, benches, practice rooms, framework documents) in its own
   <section class="hubpanel">. This shows one part at a time, picked from the
   drop-down that aog-dropdowns.js builds over the #hubPick buttons.
   - The address remembers the part (#academic, #sel …) so links can point in.
   - An old link to something inside a part (#band-K-2) opens that part first.
   - No animation and no smooth scrolling; the part simply appears.
   Without this script every part shows, one after another. */
(function () {
  "use strict";
  var D = document;
  function panels() { return Array.prototype.slice.call(D.querySelectorAll(".hubpanel")); }
  function buttons() { return Array.prototype.slice.call(D.querySelectorAll("#hubPick button[data-panel]")); }

  function show(id, focusEl) {
    var ps = panels(); if (!ps.length) return false;
    var hit = ps.filter(function (p) { return p.id === id; })[0];
    if (!hit) return false;
    ps.forEach(function (p) { p.hidden = p !== hit; });
    buttons().forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-panel") === id ? "true" : "false"); });
    try { history.replaceState(null, "", id === "overview" ? location.pathname + location.search : "#" + id); } catch (e) {}
    if (focusEl) { try { focusEl.scrollIntoView({ block: "start", behavior: "auto" }); } catch (e) {} }
    return true;
  }

  /* a hash that names a part, or anything inside one */
  function fromHash(scroll) {
    var h = decodeURIComponent((location.hash || "").slice(1));
    if (!h) return show("overview");
    var el = D.getElementById(h);
    var p = el && (el.classList.contains("hubpanel") ? el : el.closest(".hubpanel"));
    if (!p) return show("overview");
    show(p.id);
    if (el !== p) { try { history.replaceState(null, "", "#" + h); } catch (e) {} }
    if (scroll || el !== p) { try { el.scrollIntoView({ block: "start", behavior: "auto" }); } catch (e) {} }
    return true;
  }

  function start() {
    if (!panels().length) return;
    D.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("#hubPick button[data-panel]");
      if (b) { show(b.getAttribute("data-panel")); return; }
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href").slice(1), el = id && D.getElementById(id);
      if (!el) return;
      var p = el.classList.contains("hubpanel") ? el : el.closest(".hubpanel");
      if (!p) return;
      e.preventDefault();
      show(p.id);
      var bar = D.querySelector(".hubbar");
      try { (el === p ? (bar || p) : el).scrollIntoView({ block: "start", behavior: "auto" }); } catch (e2) {}
      if (el !== p) { try { history.replaceState(null, "", "#" + id); } catch (e3) {} }
    });
    window.addEventListener("hashchange", function () { fromHash(true); });
    fromHash(false);
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();
})();
