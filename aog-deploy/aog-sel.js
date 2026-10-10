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
          var steps = sec.querySelectorAll(".step"), lastN = 0, strand = false;
          for (var i = 0; i < steps.length; i++) {
            var st = steps[i], sn = (st.querySelector(".sn") || {}).textContent, sm = st.querySelector(".sm");
            /* Room 18 embeds a strand lesson after some lessons, numbered from 01 again: it is its
               own session and stays as written under every path */
            var nN = parseInt(sn, 10) || 0; if (nN <= lastN) strand = true; lastN = nN;
            if (strand) { var blkS = stepBlock(st); for (var q = 0; q < blkS.length; q++) blkS[q].removeAttribute("data-aog-cut"); if (sm && sm.hasAttribute("data-aog-sm")) sm.textContent = sm.getAttribute("data-aog-sm"); continue; }
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
    /* 1c — AOG-SEL-CARDPAGES-V1 (2026-09-26) — ONE LESSON'S CARDS AT A TIME. Jimmy: "I don't like
       all the scrolling between lessons and units." The scenario-card pages showed every card in
       one long wall. Now a Lesson menu (units → lessons), Previous / Next, and only that lesson's
       cards on screen; "All lessons" brings the wall back; a #u1l3 link from a lesson page opens
       that lesson. Screen only: Print the deck still prints everything. */
    try {
      if (/^room-(12|18|36|104|207)-cards$/.test(slug)) {
        var es2 = /^es/i.test(H.lang || "");
        var blocksC = Array.prototype.slice.call(D.querySelectorAll(".lessonblk[id]"));
        if (blocksC.length > 2) {
          var KEYC = "aog.sel.cards." + slug, ALL = "all";
          var labelOf = function (b) { var sh = b.querySelector(".sh"); if (!sh) return b.id; var n = sh.querySelector(".sn"), t = sh.querySelector("h3, h4"); return (n && t) ? n.textContent.trim() + " · " + t.textContent.trim() : sh.textContent.replace(/\s+/g, " ").trim(); };
          var unitOf = function (b) { var u = b.closest(".unit-spread"); var h = u && u.querySelector("h2"); return h ? h.textContent.replace(/\s+/g, " ").trim() : (b.getAttribute("data-unit") || ""); };
          var boxC = D.createElement("div"); boxC.className = "aog-cardpager no-print";
          var selC = D.createElement("select"); selC.setAttribute("aria-label", es2 ? "Elige una lección" : "Pick a lesson");
          var oAllC = D.createElement("option"); oAllC.value = ALL; oAllC.textContent = es2 ? "Todas las lecciones" : "All lessons"; selC.appendChild(oAllC);
          var gC = null, gnameC = "";
          blocksC.forEach(function (b) {
            var un = unitOf(b);
            if (un !== gnameC) { gC = D.createElement("optgroup"); gC.label = un; selC.appendChild(gC); gnameC = un; }
            var oC = D.createElement("option"); oC.value = b.id; oC.textContent = labelOf(b); (gC || selC).appendChild(oC);
          });
          var prevC = D.createElement("button"), nextC = D.createElement("button");
          prevC.type = nextC.type = "button"; prevC.className = "nv-btn"; nextC.className = "nv-btn primary";
          prevC.innerHTML = "&#8249; " + (es2 ? "Anterior" : "Previous"); nextC.innerHTML = (es2 ? "Siguiente" : "Next") + " &#8250;";
          var labC = D.createElement("label"); labC.innerHTML = '<span class="k">' + (es2 ? "Lección" : "Lesson") + "</span>"; labC.appendChild(selC);
          boxC.appendChild(labC); boxC.appendChild(prevC); boxC.appendChild(nextC);
          var firstC = D.querySelector(".unit-spread"); if (firstC) firstC.parentNode.insertBefore(boxC, firstC);
          var curC = ALL;
          var showC = function (id, push) {
            curC = id; selC.value = id;
            var idx = -1;
            blocksC.forEach(function (b, i) { var on = id === ALL || b.id === id; if (b.id === id) idx = i; if (on) b.removeAttribute("data-aog-page"); else b.setAttribute("data-aog-page", "1"); });
            Array.prototype.forEach.call(D.querySelectorAll(".unit-spread"), function (u) { var any = u.querySelector(".lessonblk:not([data-aog-page])"); if (any) u.removeAttribute("data-aog-page"); else u.setAttribute("data-aog-page", "1"); });
            prevC.disabled = id === ALL || idx <= 0; nextC.disabled = id === ALL || idx >= blocksC.length - 1;
            ls.set(KEYC, id);
            try { var u2 = new URL(location.href); if (id === ALL) u2.searchParams["delete"]("lesson"); else u2.searchParams.set("lesson", id); u2.hash = ""; if (push) history.pushState({ lesson: id }, "", u2); else history.replaceState({ lesson: id }, "", u2); } catch (e) {}
            if (push) { try { boxC.scrollIntoView({ block: "start", behavior: "auto" }); window.scrollBy(0, -70); } catch (e) {} }
          };
          selC.addEventListener("change", function () { showC(selC.value, true); });
          prevC.addEventListener("click", function () { var i = blocksC.findIndex(function (b) { return b.id === curC; }); if (i > 0) showC(blocksC[i - 1].id, true); });
          nextC.addEventListener("click", function () { var i = blocksC.findIndex(function (b) { return b.id === curC; }); if (i < blocksC.length - 1) showC(blocksC[i + 1].id, true); });
          window.addEventListener("popstate", function (e) { if (e.state && e.state.lesson) showC(e.state.lesson, false); });
          /* the unit buttons already on the page ("Show Unit 1") open that unit's first lesson */
          var startC = ALL;
          try {
            var h = (location.hash || "").replace("#", ""), q = new URL(location.href).searchParams.get("lesson");
            if (q && D.getElementById(q)) startC = q;
            else if (h && D.getElementById(h) && D.getElementById(h).classList.contains("lessonblk")) startC = h;
            else if (h && D.getElementById(h) && D.getElementById(h).closest(".lessonblk")) startC = D.getElementById(h).closest(".lessonblk").id;
            else { var m = ls.get(KEYC); if (m && (m === ALL || D.getElementById(m))) startC = m; else startC = blocksC[0].id; }
          } catch (e) { startC = blocksC[0].id; }
          showC(startC, false);
          if (startC !== ALL && location.hash) { var tgt = D.getElementById(location.hash.slice(1)); if (tgt) setTimeout(function () { tgt.scrollIntoView({ block: "start" }); window.scrollBy(0, -80); }, 50); }
        }
      }
    } catch (e) {}
    /* 2a — AOG-ADULT-IN-ROOMMENU-V1 (2026-10-10): Jimmy, "in the drop down menu I don't see anything" for the
       Adult Edition. Wherever the rooms' menu lists the five rooms' lessons, the Adult Edition's lessons follow. */
    try {
      var rsel = D.getElementById("roomSel");
      var r207 = rsel && rsel.querySelector('option[value="room-207-lessons.html"]');
      if (r207 && !rsel.querySelector('option[value="/adult/lessons"]')) {
        var ao = D.createElement("option"); ao.value = "/adult/lessons"; ao.textContent = "The Adult Edition · The Lessons";
        r207.parentNode.insertBefore(ao, r207.nextSibling);
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

/* AOG-SEL-KVPAIR-V1 (2026-09-27) — Jimmy: "Words overlap on the page." A .kv block used as a
   two-column table (a long left cell, or a first row of two headings like Kindergarten | Grades
   1–2) becomes .kv-pair: equal columns, first row as headings; on a narrow phone each cell keeps
   its heading above it. See aog-sel.css. */
(function () {
  function run() {
    Array.prototype.forEach.call(document.querySelectorAll(".kv"), function (kv) {
      if (kv.classList.contains("kv-pair")) return;
      var rows = kv.querySelectorAll(":scope > .kvr"); if (!rows.length) return;
      var t = function (el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; };
      var first = rows[0], k0 = t(first.querySelector(".kvk")), v0 = t(first.querySelector(".kvv"));
      var longLeft = Array.prototype.some.call(rows, function (r) { return t(r.querySelector(".kvk")).length > 26; });
      var headRow = rows.length > 1 && /^(KINDERGARTEN|GRADES?\b|L\d)/i.test(k0) && /^(GRADES?\b|L\d)/i.test(v0);
      if (!longLeft && !headRow) return;
      kv.classList.add("kv-pair");
      if (headRow) {
        first.classList.add("kv-head");
        for (var i = 1; i < rows.length; i++) {
          var c = rows[i].children;
          if (c[0]) c[0].setAttribute("data-h", k0);
          if (c[1]) c[1].setAttribute("data-h", v0);
        }
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
