/* ══ AOG-SEL-V1 (2026-09-26) — THE SEL FAMILY, ONE ENGINE ═════════════════════
   Loaded by aog-grace.js on every SEL page (see the SEL list there). It does
   three small things so the pages behave like one site, without touching a
   word of the curriculum:

   1. THE SITE BAR ON EVERY PAGE. Four of the five companion workbooks never
      carried aog-topbar.js (Room 36's did). Any SEL page without the bar
      gets it, so the theme, language and Quiet Space live in the same place
      on every page.
   2. THE NOVEL IN EVERY ROOM MENU. Each room page has a "Jump to another
      room" drop-down listing that room's curriculum, lessons, cards, workbook
      and charts. The room's novel now sits in that list too, and the
      companion-workbook links to the PDF gain a "read it here" sibling.
   3. THE CLASS ON <html>, so aog-sel.css can scope every rule. ═══════════════ */
(function () {
  "use strict";
  if (window.__aogSel) return; window.__aogSel = 1;
  var D = document, H = D.documentElement;
  H.classList.add("aog-sel");

  var slug = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
  var room = (slug.match(/^(?:room-|w)(12|18|36|104|207)(?:-|$)/) || slug.match(/^AoG-Anchor-Charts-(12|18|104|207)$/) || [])[1];
  if (!room && /^AoG-Anchor-Charts$/.test(slug)) room = "36";
  if (!room && /^w\d+-/.test(slug)) room = "36";              /* w1…w7 are Room 36's worksheets */
  var NOVELS = { "12": "The Year We Met Sammy", "18": "The Year of the Inner Critic", "36": "The Year of Two Voices",
                 "104": "The Year We Looked Up", "207": "The Year We Walked Out" };

  /* 1 — the site bar */
  try {
    if (!D.getElementById("aogTopbar") && !D.querySelector('script[src*="aog-topbar"]')) {
      var s = D.createElement("script"); s.src = "/aog-topbar.js"; (D.head || H).appendChild(s);
    }
  } catch (e) {}

  var ready = function (fn) { if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", fn); else fn(); };
  ready(function () {
    /* 0 — the workbook tally drives a progress bar (aog-sel.css draws it from --p) */
    try {
      var tallies = D.querySelectorAll(".tally[data-total]");
      var paint = function (t) { var n = parseInt((t.querySelector(".tn") || {}).textContent, 10) || 0, tot = parseInt(t.getAttribute("data-total"), 10) || 1; t.style.setProperty("--p", Math.round(100 * n / tot)); };
      for (var k = 0; k < tallies.length; k++) {
        paint(tallies[k]);
        if (window.MutationObserver) new MutationObserver(function (t) { return function () { paint(t); }; }(tallies[k])).observe(tallies[k], { childList: true, subtree: true, characterData: true });
      }
    } catch (e) {}
    /* 2 — the novel in the room menu */
    try {
      if (room && NOVELS[room]) {
        var sel = D.getElementById("roomSel");
        if (sel && !sel.querySelector('option[value="room-' + room + '-novel.html"]')) {
          var groups = sel.querySelectorAll("optgroup"), g = null;
          for (var i = 0; i < groups.length; i++) if ((groups[i].label || "").replace(/\s+/g, " ").trim() === "Room " + room) g = groups[i];
          var o = D.createElement("option"); o.value = "room-" + room + "-novel.html";
          o.textContent = "The novel · " + NOVELS[room];
          if (g) g.appendChild(o); else sel.appendChild(o);
        }
      }
      /* the PDF link on the workbook and curriculum pages gets a sibling that opens the reader */
      if (room && NOVELS[room]) {
        var links = D.querySelectorAll('a[href*="Room' + room + '-DIGITAL.pdf"]');
        for (var j = 0; j < links.length; j++) {
          var a = links[j];
          if (a.closest(".aogtop") || a.parentNode.querySelector('a[href="room-' + room + '-novel.html"]')) continue;
          var r = a.cloneNode(false);
          r.href = "room-" + room + "-novel.html"; r.removeAttribute("target"); r.removeAttribute("rel"); r.removeAttribute("download");
          r.textContent = (/^es/i.test(H.lang || "") ? "Leer la novela aquí" : "Read the novel here");
          a.parentNode.insertBefore(r, a.nextSibling);
          if (a.parentNode.classList && !a.parentNode.classList.contains("mats")) { var sp = D.createTextNode(" "); a.parentNode.insertBefore(sp, r); }
        }
      }
    } catch (e) {}
  });
})();
