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
  var ls = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
             set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
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
    /* 1b — AOG-SEL-PATHS-V1 (2026-09-26) — TWO PATHS FOR EVERY LESSON. Jimmy: "make the curriculum
       optional 25 minutes and 40 minutes … Two different paths for each lesson?" Each lesson keeps
       its words; sel-paths/room-N.json says which numbered steps a 25-minute and a 40-minute
       path keep, and for how long, plus whether the scenario cards fit. The teacher picks
       "As written", "25 minutes" or "40 minutes" once and every lesson on the page follows. */
    try {
      var lm = slug.match(/^room-(12|18|36|104|207)-lessons$/);
      if (lm && window.fetch) fetch("/sel-paths/room-" + lm[1] + ".json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (paths) {
        if (!paths) return;
        var KEYP = "aog.sel.path", es = /^es/i.test(H.lang || "");
        var LBL = { full: es ? "Como está escrita" : "As written", p25: es ? "25 minutos" : "25 minutes", p40: es ? "40 minutos" : "40 minutes" };
        var mode = (function () { var v = ls.get(KEYP); return (v === "p25" || v === "p40") ? v : "full"; })();
        var stepBlock = function (st) {           /* the step header and everything under it, until the next step or the lesson's tail */
          var out = [st], n = st.nextElementSibling;
          while (n && !(n.classList.contains("step") || (n.classList.contains("box") && (n.classList.contains("exit") || n.classList.contains("cards"))) || n.classList.contains("wchip") || /^H[23]$/.test(n.tagName))) { out.push(n); n = n.nextElementSibling; }
          return out;
        };
        var apply = function (sec, entry) {
          var path = mode === "full" ? null : entry[mode];
          var steps = sec.querySelectorAll(".step");
          for (var i = 0; i < steps.length; i++) {
            var st = steps[i], sn = (st.querySelector(".sn") || {}).textContent, sm = st.querySelector(".sm");
            var keep = !path || (path.steps && path.steps[String(sn).trim()] != null);
            var blk = stepBlock(st);
            for (var j = 0; j < blk.length; j++) { if (keep) blk[j].removeAttribute("data-aog-cut"); else blk[j].setAttribute("data-aog-cut", "1"); }
            if (sm) {
              if (!sm.hasAttribute("data-aog-sm")) sm.setAttribute("data-aog-sm", sm.textContent);
              sm.textContent = (path && keep) ? path.steps[String(sn).trim()] + " MIN" : sm.getAttribute("data-aog-sm");
            }
          }
          var cards = sec.querySelectorAll(".box.cards");
          for (var c = 0; c < cards.length; c++) { if (path && !path.cards) cards[c].setAttribute("data-aog-cut", "1"); else cards[c].removeAttribute("data-aog-cut"); }
          var note = sec.querySelector(".aog-path-note"), badge = sec.querySelector(".aog-path-badge");
          if (note) { note.textContent = path ? (path.note || "") : ""; note.hidden = !path; }
          if (badge) { badge.textContent = path ? (es ? "Hoy: " : "Today: ") + (mode === "p25" ? "25" : "40") + " min" : ""; badge.hidden = !path; }
        };
        var secs = D.querySelectorAll("section.lesson[id]"), wired = [];
        for (var k = 0; k < secs.length; k++) {
          var sec = secs[k], entry = paths[sec.id];
          if (!entry || !entry.p25 || !entry.p40) continue;
          var host = sec.querySelector(".lchips") || sec.querySelector(".lhead");
          if (!host) continue;
          var box = D.createElement("div"); box.className = "aog-path no-print";
          box.innerHTML = '<label><span class="k">' + (es ? "Duración de la lección" : "Lesson length") + '</span><select aria-label="' + (es ? "Duración de la lección" : "Lesson length") + '">' +
            '<option value="full">' + LBL.full + '</option><option value="p25">' + LBL.p25 + '</option><option value="p40">' + LBL.p40 + '</option></select></label>' +
            '<span class="aog-path-badge" hidden></span><p class="aog-path-note" hidden></p>';
          host.parentNode.insertBefore(box, host.nextSibling);
          box.querySelector("select").value = mode;
          box.querySelector("select").addEventListener("change", function (e) {
            mode = e.target.value; ls.set(KEYP, mode);
            for (var w = 0; w < wired.length; w++) { wired[w].box.querySelector("select").value = mode; apply(wired[w].sec, wired[w].entry); }
          });
          wired.push({ sec: sec, entry: entry, box: box });
          apply(sec, entry);
        }
      }).catch(function () {});
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
