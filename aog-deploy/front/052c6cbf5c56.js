
/* ============================================================================
   ONE STUDENT'S EXIT SLIPS  ·  2026-08-28

   Jimmy, looking at his own panel with five slips on it: *"How does one
   eventually just see a single student's data? Also the list of slips is
   going to get LONG."* Both true. The panel was built class-first and had
   exactly one view — every slip, one line each, newest first. At 25 students
   × 30 school days that is 750 lines and no way to pull one child out.

   So: a row of student doors above the list, and behind each one everything
   that student has ever said, including a picture of it.

   ⚠ IT DOES NOT REPLACE THE CLASS VIEW, IT SITS UNDER IT. The six at-a-glance
   cards and the pattern card stay exactly where they are and keep the range
   chips. Opening a student swaps only the list at the bottom.

   ⚠ ONE SOURCE FOR THE §-RULES. `gist`, `detail`, `barsHtml`, `tally` and
   `patterns` are borrowed from the class view through its own export, never
   re-implemented here. Each of them carries a rule — nothing ranked, every
   bar the same color, the denominator named, at most two reads and one of
   them good — and a second copy is a second place for a rule to quietly stop
   being true.

   ⚠ THE STUDENT DOOR IGNORES THE RANGE CHIPS, ON PURPOSE. "Today" is the
   right default for a class and the wrong one for a child: the question
   being asked here is *what has this student been telling me*, and the
   answer to that is all of it. The door says which span it is showing.

   ⚠ NOTHING HERE IS A SCORE — see §12 and the .gs header. There is no
   number about a student anywhere on this screen except counts of what they
   themselves chose, and the denominator is printed beside every one.
   ============================================================================ */
(function () {
  "use strict";

  var SEL = { sid: "" };            /* which door is open; "" = everyone */

  function el(id) { return document.getElementById(id); }
  function V() { return window.AOGExitView || null; }
  function isEs() { try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; } catch (e) { return false; } }
  function T(en, es) { return isEs() ? es : en; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function code(s) { return String(s == null ? "" : s).trim().toUpperCase(); }
  function sane(d) { return d instanceof Date && !isNaN(d.getTime()) && d.getFullYear() > 1970 && d.getFullYear() < 2100; }
  function asDate(v) {
    if (!v) return null;
    var p = String(v).slice(0, 10).split("-");
    if (p.length === 3) { var d = new Date(+p[0], +p[1] - 1, +p[2]); if (sane(d)) return d; }
    var t = new Date(v); return sane(t) ? t : null;
  }
  function shortDay(iso) {
    var d = asDate(iso);
    if (!d) return "";
    return (d.getMonth() + 1) + "/" + d.getDate();
  }

  /* ------------------------------------------------------------ the roster
     Built from the slips themselves, never from a roster. This product
     keeps no class list on purpose ([[aog-population-layer]]) and a student
     appears here because they handed something in. */
  function roster() {
    var by = {}, order = [];
    var all = [];
    try { all = V().slips() || []; } catch (e) { all = []; }
    all.forEach(function (r) {
      var k = code(r.studentId);
      if (!k) return;
      if (!by[k]) { by[k] = []; order.push(k); }
      by[k].push(r);
    });
    order.sort();
    return order.map(function (k) {
      var mine = by[k].slice().sort(function (a, b) { return String(a.date) < String(b.date) ? -1 : 1; });
      return { sid: k, rows: mine, n: mine.length,
               from: mine.length ? mine[0].date : "", to: mine.length ? mine[mine.length - 1].date : "" };
    });
  }
  function forStudent(sid) {
    var r = roster().filter(function (x) { return x.sid === code(sid); })[0];
    return r || null;
  }

  /* ══════════════════════════════════════════════ THE PICTURE OF A STUDENT
     ⚠ THIS IS NOT A PROGRESS CHART AND MUST NEVER BECOME ONE. There is no
     number in an exit slip — no score, no rating, no scale — so a line that
     rises or falls would be inventing a quantity that does not exist, and
     the first thing anyone would read off it is "getting better" or "getting
     worse" about a child. §12 and §29 both forbid that.

     What CAN be drawn honestly is REPETITION: which classes this student
     named, and on which days. A teacher scanning down a column sees "Spanish
     four days running" without anyone having said a word about why.

     Two marks, and they are two DIFFERENT QUESTIONS, not two ends of a
     scale: ● the class they enjoyed most, ○ the class they found most
     challenging. Same color, same size, both in the key. Enjoyed is filled
     only because it is the one asked first — reversing them would change
     nothing about the reading. */
  function matrix(rows) {
    var days = [], seen = {}, classes = [], cseen = {};
    rows.forEach(function (r) {
      var d = String(r.date || "").slice(0, 10);
      if (d && asDate(d) && !seen[d]) { seen[d] = 1; days.push(d); }
      [r.favClass, r.hardClass].forEach(function (c) {
        c = String(c || "").trim();
        /* the escape answers are real answers, and they are not classes */
        if (!c || /^(None|They were all|I don|No —|Not really)/i.test(c)) return;
        if (!cseen[c]) { cseen[c] = 1; classes.push(c); }
      });
    });
    days.sort();
    /* ⚠ SORTED BY TOTAL MENTIONS, NOT BY HOW OFTEN IT WAS THE HARD ONE.
       Ranking the rows by the challenging column would put the difficulty
       at the top of every student's picture and quietly turn this into a
       problem list — §29's failure mode, and the same one the pattern card
       already guards against by always surfacing a good read. A class that
       comes up a lot comes up a lot; which column it came up in is what the
       two marks are for. */
    var count = {};
    classes.forEach(function (c) { count[c] = 0; });
    rows.forEach(function (r) {
      [r.favClass, r.hardClass].forEach(function (c) { c = String(c || "").trim(); if (count[c] != null) count[c]++; });
    });
    classes.sort(function (a, b) { return count[b] - count[a] || a.localeCompare(b); });
    return { days: days.slice(-24), classes: classes.slice(0, 8), rows: rows };
  }

  function matrixSvg(m) {
    if (!m.days.length || !m.classes.length) return "";
    var LW = 132, CW = Math.max(26, Math.min(40, Math.floor(430 / Math.max(1, m.days.length))));
    var RH = 26, TOP = 26;
    var W = LW + CW * m.days.length + 8, H = TOP + RH * m.classes.length + 6;
    var ink = "var(--ink,#0A1E33)", faint = "var(--ink-faint,#8A92A6)", rule = "var(--rule,#E4DAC5)";
    var mark = "var(--aog-dusk,#4A5578)";
    var s = "";

    /* date column heads */
    m.days.forEach(function (d, i) {
      var x = LW + CW * i + CW / 2;
      s += '<text x="' + x.toFixed(1) + '" y="14" text-anchor="middle" font-size="9.5" fill="' + faint + '">' +
           esc(shortDay(d)) + "</text>";
    });
    m.classes.forEach(function (c, r) {
      var y = TOP + RH * r;
      s += '<line x1="0" y1="' + (y + RH).toFixed(1) + '" x2="' + (W - 8) + '" y2="' + (y + RH).toFixed(1) +
           '" stroke="' + rule + '" stroke-width="1"/>';
      s += '<text x="0" y="' + (y + RH / 2 + 4).toFixed(1) + '" font-size="11.5" fill="' + ink + '">' +
           esc(c.length > 21 ? c.slice(0, 20) + "…" : c) + "</text>";
      m.days.forEach(function (d, i) {
        var cx = LW + CW * i + CW / 2, cy = y + RH / 2;
        var day = m.rows.filter(function (x) { return String(x.date || "").slice(0, 10) === d; });
        var fav = day.some(function (x) { return String(x.favClass || "").trim() === c; });
        var hard = day.some(function (x) { return String(x.hardClass || "").trim() === c; });
        if (fav) s += '<circle cx="' + (hard ? cx - 6 : cx).toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="5" fill="' + mark + '"/>';
        if (hard) s += '<circle cx="' + (fav ? cx + 6 : cx).toFixed(1) + '" cy="' + cy.toFixed(1) +
          '" r="4.5" fill="none" stroke="' + mark + '" stroke-width="2"/>';
      });
    });
    return '<svg viewBox="0 0 ' + W + " " + H + '" width="100%" height="' + H +
      '" role="img" aria-label="' + esc(T("Which classes this student named, and on which days",
      "Qué clases nombró este estudiante, y en qué días")) + '" style="max-width:100%;overflow:visible;">' + s + "</svg>";
  }

  /* ---------------------------------------------------------------- the CSS */
  function css() {
    if (el("aogXsCss")) return;
    var st = document.createElement("style");
    st.id = "aogXsCss";
    st.textContent = [
      "#panel-exitslip .xs-doors{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0 4px;}",
      "#panel-exitslip .xs-door{display:inline-flex;align-items:baseline;gap:7px;border:1.5px solid var(--rule);",
      "  background:var(--card);border-radius:999px;padding:7px 14px;font-family:inherit;font-size:13px;",
      "  font-weight:700;color:var(--ink);cursor:pointer;min-height:38px;}",
      "#panel-exitslip .xs-door:hover{border-color:var(--xv-dusk,#4A5578);}",
      "#panel-exitslip .xs-door:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:2px;}",
      /* ⚠ SCOPE A COLOR TO THE SURFACE IT WAS CHOSEN AGAINST. A literal
         #fff here measured 1.93:1 in dark, because --aog-dusk is a light
         lavender there and white on it is white on light. `--aog-on` is the
         token that exists precisely to be the ink for that fill, and it is
         remapped for dark; the same mistake in the other direction is what
         made the whole Daily Check-In unreadable for weeks. See
         [[aog-contrast]], [[aog-exit-slip]].
         ⚠ AND NO OPACITY ON TEXT — the count is the same color as the
         label, not a knocked-back version of it. Backing --ink-faint off to
         .72 once took it to 2.83:1 and axe found 22 nodes. */
      "#panel-exitslip .xs-door.on{background:var(--aog-dusk,#4A5578);border-color:var(--aog-dusk,#4A5578);color:var(--aog-on,#fff);}",
      "#panel-exitslip .xs-door .n{font-size:11.5px;font-weight:600;color:var(--ink-faint);font-variant-numeric:tabular-nums;}",
      "#panel-exitslip .xs-door.on .n{color:var(--aog-on,#fff);}",
      "#panel-exitslip .xs-hd{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin:16px 0 2px;}",
      "#panel-exitslip .xs-hd h3{margin:0;font-size:19px;letter-spacing:.04em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}",
      "#panel-exitslip .xs-hd .sp{font-size:12.5px;color:var(--ink-faint);font-variant-numeric:tabular-nums;}",
      "#panel-exitslip .xs-hd .cl{margin-left:auto;}",
      "#panel-exitslip .xs-chart{border:1px solid var(--rule);border-radius:12px;padding:14px 16px 10px;",
      "  background:var(--card);margin:12px 0 0;overflow-x:auto;}",
      "#panel-exitslip .xs-chart h4{margin:0 0 2px;font-size:12px;font-weight:800;letter-spacing:.07em;",
      "  text-transform:uppercase;color:var(--ink-soft);}",
      "#panel-exitslip .xs-chart .sub{margin:0 0 12px;font-size:12.5px;color:var(--ink-faint);line-height:1.5;}",
      "#panel-exitslip .xs-key{display:flex;gap:18px;flex-wrap:wrap;margin:10px 0 0;padding-top:10px;",
      "  border-top:1px solid var(--rule);font-size:12px;color:var(--ink-soft);}",
      "#panel-exitslip .xs-key span{display:inline-flex;align-items:center;gap:7px;}",
      "#panel-exitslip .xs-key i{width:11px;height:11px;border-radius:50%;background:var(--xv-dusk,#4A5578);}",
      "#panel-exitslip .xs-key i.o{background:none;border:2px solid var(--xv-dusk,#4A5578);}",
      "#panel-exitslip .xs-days{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 0;}",
      "#panel-exitslip .xs-day{border:1px solid var(--rule);border-radius:9px;padding:7px 10px;background:var(--card);min-width:78px;}",
      "#panel-exitslip .xs-day b{display:block;font-size:10.5px;font-weight:800;letter-spacing:.06em;",
      "  text-transform:uppercase;color:var(--ink-faint);}",
      "#panel-exitslip .xs-day span{display:block;font-size:12.5px;line-height:1.35;color:var(--ink);margin-top:3px;}",
      "#panel-exitslip .xs-none{font-size:13.5px;color:var(--ink-faint);line-height:1.6;margin:12px 0 0;}",
      "@media print{#panel-exitslip .xs-doors,#panel-exitslip .xs-hd .cl{display:none;}}"
    ].join("\n");
    document.head.appendChild(st);
  }

  /* ------------------------------------------------------------ the doors */
  function doorsHtml(list) {
    return '<div class="xs-doors" role="group" aria-label="' + esc(T("Students", "Estudiantes")) + '">' +
      '<button type="button" class="xs-door' + (SEL.sid ? "" : " on") + '" data-xs=""' +
        ' aria-pressed="' + (SEL.sid ? "false" : "true") + '">' + esc(T("Everyone", "Todos")) + "</button>" +
      list.map(function (r) {
        var on = SEL.sid === r.sid;
        return '<button type="button" class="xs-door' + (on ? " on" : "") + '" data-xs="' + esc(r.sid) + '"' +
          ' aria-pressed="' + (on ? "true" : "false") + '">' + esc(r.sid) +
          '<span class="n">' + r.n + "</span></button>";
      }).join("") + "</div>";
  }

  /* ----------------------------------------------------- one student's door */
  function studentHtml(rec) {
    var v = V();
    var rows = rec.rows.slice().reverse();          /* newest first, like the class list */
    var m = matrix(rec.rows);
    var svg = matrixSvg(m);
    var span = rec.from ? (shortDay(rec.from) + (rec.to && rec.to !== rec.from ? (T(" to ", " a ") + shortDay(rec.to)) : "")) : "";

    /* ⚠ THE COUNTS ARE THIS STUDENT'S OWN WORDS, AND THE DENOMINATOR IS
       NAMED — the same rule the class cards keep. "of 7 who named one" is
       "of 7 slips where they named one" for one child. */
    function answered(k) { return rows.filter(function (r) { return r[k]; }).length; }
    function card(title, key, note) {
      var n = answered(key);
      return '<div class="xv-card"><h3>' + esc(title) + "</h3>" +
        '<p class="xv-den">' + esc(n ? T("of " + n + (n === 1 ? " slip where they named one" : " slips where they named one"),
                                          "de " + n + (n === 1 ? " salida donde nombró una" : " salidas donde nombró una"))
                                    : T("not named yet", "aún no lo ha nombrado")) + "</p>" +
        (note ? '<p class="xv-den">' + esc(note) + "</p>" : "") +
        (n ? v.barsHtml(v.tally(rows, key), n) : "") + "</div>";
    }

    /* Their pattern read, from the class view's own machinery, scoped to
       them. MIN_SLIPS still applies: a pattern is never read out of one or
       two days, and that stays true inside a student's own door. */
    var pats = [];
    try { pats = v.patterns(rows) || []; } catch (e) {}

    return '<div class="xs-hd"><h3>' + esc(rec.sid) + "</h3>" +
        '<span class="sp">' + esc(rec.n + T(rec.n === 1 ? " slip" : " slips", rec.n === 1 ? " salida" : " salidas") +
          (span ? (" · " + span) : "")) + "</span>" +
        '<span class="sp">' + esc(T("all of it, whatever the range above says", "todo, sin importar el rango de arriba")) + "</span>" +
        /* .30dl · The whole-student removal, and the reason the feature is
           useful at all: a test code typed at a staff meeting is removed as
           ONE act rather than a slip at a time, and it removes every slip
           they have whatever the range above says -- exactly what the line
           beside it already promises. Wired by the class view's delegated
           listener, which owns the two-press confirm and the Undo. */
        '<span class="cl"><button type="button" class="xv-hb ghost xv-del" data-xsdel="' + esc(rec.sid) + '">' +
          esc(T("Remove all of these slips", "Quitar todas estas salidas")) + "</button>" +
          '<button type="button" class="xv-hb ghost" data-hdshare="exit:student" data-hdarg="' + esc(rec.sid) + '">' +
          esc(T("Print / Share", "Imprimir / Compartir")) + "</button>" +
          '<button type="button" class="xv-hb ghost" data-xs="">' + esc(T("Back to everyone", "Volver a todos")) + "</button></span>" +
      "</div>" +

      (svg
        ? '<div class="xs-chart"><h4>' + esc(T("Which classes they named, and when", "Qué clases nombró, y cuándo")) + "</h4>" +
          '<p class="sub">' + esc(T("A picture of repetition, not of progress. There is no score in an exit slip and nothing here is one — this only shows which class they put in each answer, on each day they handed one in.",
            "Una imagen de repetición, no de progreso. No hay puntaje en una salida y nada aquí lo es — solo muestra qué clase puso en cada respuesta, cada día que entregó una.")) + "</p>" +
          svg +
          '<div class="xs-key"><span><i></i>' + esc(T("Enjoyed most", "La que más disfrutó")) + "</span>" +
            '<span><i class="o"></i>' + esc(T("Found most challenging", "La que le resultó más difícil")) + "</span>" +
            '<span>' + esc(T("Two questions, not two ends of a scale.", "Dos preguntas, no dos extremos de una escala.")) + "</span></div>" +
          "</div>"
        : '<p class="xs-none">' + esc(T("Not enough named classes yet to draw anything. The picture appears once they have named a class on more than one day.",
            "Aún no hay suficientes clases nombradas para dibujar algo. La imagen aparece cuando nombren una clase en más de un día.")) + "</p>") +

      /* How they described each day — words along a line, never a line. */
      (rows.length
        ? '<div class="xs-chart"><h4>' + esc(T("How they described each day", "Cómo describió cada día")) + "</h4>" +
          '<p class="sub">' + esc(T("Their own word for the day, in their own order. A perception, not a measurement — and never averaged.",
            "Su propia palabra para el día, en su propio orden. Una percepción, no una medición — y nunca se promedia.")) + "</p>" +
          '<div class="xs-days">' + rec.rows.slice(-14).map(function (r) {
            return '<div class="xs-day"><b>' + esc(shortDay(r.date)) + "</b><span>" +
              esc(r.dayWord || T("—", "—")) + "</span></div>";
          }).join("") + "</div></div>"
        : "") +

      (pats.length
        ? '<div class="xv-pat"><h3>' + esc(T("Pattern emerging", "Patrón que aparece")) + "</h3>" +
          '<p class="xv-den">' + esc(T("Counted, not concluded. Each of these is a reason to ask, never a finding.",
            "Contado, no concluido. Cada uno es motivo para preguntar, nunca un hallazgo.")) + "</p>" +
          pats.map(function (p) {
            return '<div class="xv-p">' + p.reads.map(function (rd) {
              return "<p>" + esc(rd.what) + '</p><p class="ask">' + esc(rd.ask) + "</p>";
            }).join("") + "</div>";
          }).join("") + "</div>"
        : '<p class="xs-none">' + esc(T("No pattern is read from fewer than three slips — and that is on purpose.",
            "No se lee ningún patrón con menos de tres salidas — y es a propósito.")) + "</p>") +

      '<div class="xv-grid" style="margin-top:14px;">' +
        card(T("Classes they enjoyed", "Clases que disfrutó"), "favClass") +
        card(T("Classes they found challenging", "Clases que le resultaron difíciles"), "hardClass") +
        card(T("What made it challenging", "Qué la hizo difícil"), "hardWhy") +
        card(T("Good moments", "Buenos momentos"), "goodMoment") +
        card(T("When something was hard, they…", "Cuando algo fue difícil…"), "response",
             T("no answer here is better than another", "ninguna respuesta es mejor que otra")) +
        card(T("What they carried out", "Con qué se fue"), "closing") +
      "</div>" +

      '<div class="xv-list"><h3>' + esc(T("Their slips", "Sus salidas")) + "</h3>" +
        '<p class="xv-den">' + esc(T("One line each, newest first. Open one only when you want to.",
          "Una línea cada una, la más reciente primero. Ábrela solo si quieres.")) + "</p>" +
        rows.map(function (r, i) {
          var id = "xsr" + i;
          return '<button type="button" class="xv-row" data-xrow="' + id + '" aria-expanded="false" aria-controls="' + id + 'd">' +
              '<span class="when">' + esc(v.whenLabel(r)) + "</span>" +
              '<span class="gist">' + esc(v.gist(r)) + "</span>" +
              (r.followUp ? '<span class="flag">' + esc(T("asked", "pidió")) + "</span>" : "") +
            "</button>" +
            '<div class="xv-det" id="' + id + 'd" hidden>' + v.detail(r) +
              '<p class="xh-fbr"><button type="button" class="xh-fambtn" data-xh-fam="' +
              esc(String(r.studentId || "") + "|" + String(r.date || "") + "|" + String(r.timestamp || "")) +
              '">💛 ' + esc(T("Family card", "Tarjeta familiar")) + "</button></p></div>";
        }).join("") +
      "</div>";
  }

  /* ═════════════════════════════════════════════════════════ THE INJECTION
     The class view re-renders `#panel-exitslip` wholesale on every range
     change, every pull and every language flip, so this runs after it every
     time rather than binding once — the same shape every other decorator in
     this file uses.

     ⚠ IT REPLACES `.xv-list`, IT DOES NOT ADD A SECOND ONE. The doors go
     immediately above it; with "Everyone" chosen the original list is left
     exactly as the class view drew it. */
  function paint() {
    var host = el("panel-exitslip");
    if (!host || !V() || !V().slips) return;
    css();
    /* ⚠ ANCHOR ON THE RANGE ROW, NOT ON THE LIST. `.xv-list` is inside the
       has-rows branch, so on a quiet Today the class view renders its empty
       state instead and there is no list to hang anything off — which is
       exactly the moment a teacher most wants to open one student and see
       the week. `.xv-range` is drawn on every render, rows or none. */
    var anchor = host.querySelector(".xv-range");
    if (!anchor) return;
    var list = host.querySelector(".xv-list");

    var people = roster();
    /* One student is not a roster worth navigating, and a panel with nothing
       in it should not grow a control. */
    if (people.length < 2 && !SEL.sid) {
      var stale = host.querySelector(".xs-doors");
      if (stale) stale.parentNode.removeChild(stale);
      return;
    }

    /* the doors */
    var doors = host.querySelector(".xs-doors");
    var dh = doorsHtml(people);
    if (doors) {
      var tmp = document.createElement("div"); tmp.innerHTML = dh;
      doors.parentNode.replaceChild(tmp.firstChild, doors);
    } else {
      anchor.insertAdjacentHTML("afterend", dh);
    }
    doors = host.querySelector(".xs-doors");

    /* the body under them */
    var rec = SEL.sid ? forStudent(SEL.sid) : null;
    if (SEL.sid && !rec) { SEL.sid = ""; }        /* their last slip was removed */
    var mine = host.querySelector("#aogXsBody");
    if (rec) {
      var html = '<div id="aogXsBody">' + studentHtml(rec) + "</div>";
      if (mine) { mine.outerHTML = html; }
      else if (doors) { doors.insertAdjacentHTML("afterend", html); }
      /* ⚠ EVERYTHING THE CLASS VIEW DREW BELOW THE DOORS IS PUT AWAY, not
         only the list: the six class-wide cards, the pattern card and the
         two footers all answer "how did the room go", and leaving them
         under one child's name is how a reader ends up attributing the
         room's numbers to that child. */
      classBits(host).forEach(function (n) { n.style.display = "none"; });
    } else {
      if (mine) mine.parentNode.removeChild(mine);
      classBits(host).forEach(function (n) { n.style.display = ""; });
    }
    wire(host);
  }

  /* What the class view drew that belongs to the ROOM, not to one child. */
  function classBits(host) {
    var out = [];
    Array.prototype.forEach.call(host.querySelectorAll(".xv-grid, .xv-list, .xv-pat, .xv-foot, .xv-ask"), function (n) {
      if (n.closest && n.closest("#aogXsBody")) return;   /* never the student's own */
      out.push(n);
    });
    return out;
  }

  function wire(host) {
    Array.prototype.forEach.call(host.querySelectorAll("[data-xs]"), function (b) {
      if (b.getAttribute("data-xsb")) return;
      b.setAttribute("data-xsb", "1");
      b.addEventListener("click", function () {
        SEL.sid = code(b.getAttribute("data-xs"));
        safePaint();
        try {
          var t = host.querySelector(SEL.sid ? ".xs-hd" : ".xs-doors");
          if (t && t.scrollIntoView) t.scrollIntoView({ block: "start", behavior: "smooth" });
        } catch (e) {}
      });
    });
    /* The student list's own row toggles. Deliberately NOT sharing VIEW.open
       with the class list — two lists, two open-states, and a row that opened
       itself because a differently-indexed row was open in the other list is
       the kind of ghost nobody would ever track down. */
    Array.prototype.forEach.call(host.querySelectorAll("[data-xrow]"), function (b) {
      if (b.getAttribute("data-xrb")) return;
      b.setAttribute("data-xrb", "1");
      b.addEventListener("click", function () {
        var d = el(b.getAttribute("data-xrow") + "d");
        if (!d) return;
        var open = !!d.hidden;
        d.hidden = !open;
        b.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  /* ---------------------------------------------------------------- public */
  /* ==================================================== THE SHARED RECORD
     One student's own record, in the shape #aog-handoff can
     print and can put inside a link. DATA ONLY.

     ⚠ IT CARRIES THE CODE AND NEVER A NAME. The code-to-name list is the
     teacher's paper and stays the only place the two connect — the same
     rule the per-student links keep. [[aog-student-links]]

     ⚠ THE GRID IS A PICTURE OF REPETITION, NOT OF PROGRESS, and it says so
     on the page it prints onto, not only in this comment. Filled and
     outlined are two questions, never two ends of a scale. */
  function packet(sid) {
    var rec = forStudent(sid);
    var v = V();
    if (!rec || !v) return null;
    var rows = rec.rows.slice().reverse();
    var answered = function (k) { return rows.filter(function (r) { return r[k]; }).length; };
    var b = [{ y: "note", h: T("What this is", "Qué es esto"),
               p: T(v.whatThisIs ? v.whatThisIs[0] : "", v.whatThisIs ? v.whatThisIs[1] : "") }];

    b.push({ y: "kv", h: T("At a glance", "De un vistazo"), i: [
      [T("Slips", "Salidas"), String(rec.n)],
      [T("First", "Primera"), v.prettyDate(rec.from) || ""],
      [T("Most recent", "Más reciente"), v.prettyDate(rec.to) || ""],
      [T("Asked for something", "Pidió algo"), String(rows.filter(function (r) { return r.followUp; }).length)]
    ] });

    var m = matrix(rec.rows);
    if (m.days.length && m.classes.length) {
      var cells = [];
      m.classes.forEach(function (c, ci) {
        m.days.forEach(function (d, di) {
          var day = rec.rows.filter(function (x) { return String(x.date || "").slice(0, 10) === d; });
          var fav = day.some(function (x) { return String(x.favClass || "").trim() === c; });
          var hard = day.some(function (x) { return String(x.hardClass || "").trim() === c; });
          if (fav || hard) cells.push([ci, di, fav ? 1 : 0, hard ? 1 : 0]);
        });
      });
      b.push({ y: "grid", h: T("Which classes they named, and when", "Qué clases nombró, y cuándo"),
               cls: m.classes, days: m.days.map(shortDay), c: cells,
               key: T("Filled ● the class they enjoyed most · Outlined ○ the class they found most challenging. Two questions, not two ends of a scale.",
                      "Relleno ● la clase que más disfrutó · Contorno ○ la que le resultó más difícil. Dos preguntas, no dos extremos de una escala."),
               p: T("A picture of repetition, not of progress. There is no score in an exit slip and nothing here is one — this only shows which class they put in each answer, on each day they handed one in. The rows are ordered by how often a class came up at all, never by how often it was the hard one.",
                    "Una imagen de repetición, no de progreso. No hay puntaje en una salida y nada aquí lo es — solo muestra qué clase puso en cada respuesta, cada día que entregó una. Las filas se ordenan por cuántas veces apareció una clase, nunca por cuántas veces fue la difícil.") });
    }

    if (rec.rows.length) {
      b.push({ y: "words", h: T("How they described each day", "Cómo describió cada día"),
               i: rec.rows.slice(-14).map(function (r) { return [shortDay(r.date), r.dayWord || "—"]; }),
               p: T("Their own word for the day, in their own order. A perception, not a measurement — and never averaged.",
                    "Su propia palabra para el día, en su propio orden. Una percepción, no una medición — y nunca se promedia.") });
    }

    var pats = [];
    try { pats = v.patterns(rows) || []; } catch (e) {}
    if (pats.length) {
      b.push({ y: "note", h: T("Pattern emerging", "Patrón que aparece"),
               p: T("Counted, not concluded. Each of these is a reason to ask, never a finding.",
                    "Contado, no concluido. Cada uno es motivo para preguntar, nunca un hallazgo.") });
      pats.forEach(function (p) {
        b.push({ y: "rows", h: "", i: p.reads.map(function (rd) { return ["", rd.what, rd.ask]; }) });
      });
    } else {
      b.push({ y: "note", h: T("Pattern emerging", "Patrón que aparece"),
               p: T("No pattern is read from fewer than three slips — and that is on purpose.",
                    "No se lee ningún patrón con menos de tres salidas — y es a propósito.") });
    }

    [["favClass", T("Classes they enjoyed", "Clases que disfrutó")],
     ["hardClass", T("Classes they found challenging", "Clases que le resultaron difíciles")],
     ["hardWhy", T("What made it challenging", "Qué la hizo difícil")],
     ["goodMoment", T("Good moments", "Buenos momentos")],
     ["response", T("When something was hard, they…", "Cuando algo fue difícil…")],
     ["closing", T("What they carried out", "Con qué se fue")]].forEach(function (c) {
      var n = answered(c[0]);
      if (!n) return;
      b.push({ y: "bars", h: c[1], n: n,
               d: T("of " + n + (n === 1 ? " slip where they named one" : " slips where they named one"),
                    "de " + n + (n === 1 ? " salida donde nombró una" : " salidas donde nombró una")),
               i: v.tally(rows, c[0]).slice(0, 5).map(function (o) { return [o.k, o.n]; }) });
    });

    b.push({ y: "rows", h: T("Their slips", "Sus salidas"),
             i: rows.map(function (r) { return [v.whenLabel(r), v.gist(r), v.detailText ? v.detailText(r) : ""]; }) });
    var tn2 = rows.filter(function (r) { return String(r.written || "").trim(); }).length;
    if (tn2 && v.typedNote) b.push({ y: "note", h: T("What is not on this page", "Lo que no está en esta página"), p: v.typedNote(tn2) });

    return {
      v: 1, k: "exit",
      t: T("Exit slips · one student", "Salidas del día · un estudiante"),
      s: rec.sid, c: "",
      r: rec.from ? (v.prettyDate(rec.from) + (rec.to && rec.to !== rec.from ? (T(" to ", " a ") + v.prettyDate(rec.to)) : "")) : "",
      g: new Date().toISOString(), b: b
    };
  }

  window.AOGExitStudent = {
    packet: packet,
    roster: roster,
    forStudent: forStudent,
    matrix: matrix,
    select: function (sid) { SEL.sid = code(sid || ""); safePaint(); return SEL.sid; },
    selected: function () { return SEL.sid; },
    paint: function () { safePaint(); }
  };

  /* ⚠ WRAPPING `AOGExitView.render` IS NOT ENOUGH, AND THIS COST AN HOUR.
     The class view's own controls — the range chips, the pull button, the
     row toggles — call its INTERNAL `render`, not `window.AOGExitView.render`.
     A wrapper on the export therefore fires on the first paint and never
     again, so the doors appeared once and vanished the moment a teacher
     pressed "All of it". Wrapping a module's export only intercepts the
     calls that come from outside it.

     So the real mechanism is a MutationObserver on the panel, the same shape
     every other decorator in this file uses. The wrapper stays as well,
     because it costs nothing and catches a programmatic render.

     ⚠ THE OBSERVER IS DISCONNECTED WHILE PAINTING. This block writes into
     the very node it is watching; without that, every paint schedules
     another one for ever. */
  var OBS = null;
  function watch() {
    var host = el("panel-exitslip");
    if (!host || OBS || !window.MutationObserver) return;
    OBS = new MutationObserver(function () { schedule(); });
    connect();
  }
  function connect() {
    var host = el("panel-exitslip");
    if (OBS && host) { try { OBS.observe(host, { childList: true }); } catch (e) {} }
  }
  function disconnect() { if (OBS) { try { OBS.disconnect(); } catch (e) {} } }

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    setTimeout(function () { pending = false; safePaint(); }, 0);
  }
  function safePaint() {
    disconnect();
    try { paint(); } catch (e) {}
    connect();
  }

  function boot() {
    if (!V() || !V().render) { setTimeout(boot, 400); return; }
    if (!V().render.__xs) {
      var orig = V().render;
      var wrapped = function () {
        var r = orig.apply(this, arguments);
        try { schedule(); } catch (e) {}
        return r;
      };
      wrapped.__xs = true;
      V().render = wrapped;
    }
    watch();
    /* The panel may already be on screen when this block boots. */
    safePaint();
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest && e.target.closest('.tab[data-tab="exitslip"], .dmode[data-mode="exit"]');
      if (t) setTimeout(function () { watch(); safePaint(); }, 260);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 420); });
  else setTimeout(boot, 420);
})();
