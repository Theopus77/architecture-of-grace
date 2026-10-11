
(function () {
  "use strict";

  var MOUNT = "aogPracticePrintBar";
  var realTitle = null, restoreT = 0;
  /* .30i1 — the student this card is pointed at. null means "follow the
     chart", which is what a chart chip resets it to. */
  var pick = null;

  function api() { return window.AOG_PRACTICE || null; }
  function T(en, es) { var a = api(); return a ? a.T(en, es) : en; }
  function esc(v) {
    var a = api();
    if (a) return a.esc(v);
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function today() {
    try { return new Date().toISOString().slice(0, 10); } catch (e) { return ""; }
  }
  function num(v) { return (v === 0 || (v && !isNaN(Number(v)))) ? Number(v) : null; }

  /* ⚠ PAPER IS NOT THEMED. Collapse every var(--token,#literal) to its own
     literal, then any bare var(--token) to a safe ink, so a dashboard left in
     dark mode still prints a light chart. Asserted at zero by the suite. */
  function unthemed(svg) {
    return String(svg || "")
      .replace(/var\(\s*--[A-Za-z0-9_-]+\s*,\s*(#[0-9A-Fa-f]{3,8})\s*\)/g, "$1")
      .replace(/var\(\s*--[A-Za-z0-9_-]+\s*\)/g, "#333333");
  }

  /* the probes behind one picture, as a table, because a reader at an IEP
     meeting needs the numbers and not only the shape of them */
  function probeTable(a) {
    var head = '<tr><th>' + esc(T("When", "Cuándo")) + '</th><th>' + esc(T("Set", "Grupo"))
      + '</th><th>' + esc(T("No hint", "Sin pista")) + '</th><th>' + esc(T("After a hint", "Tras una pista"))
      + '</th><th>' + esc(T("Hints", "Pistas")) + '</th><th>' + esc(T("Confidence", "Confianza")) + '</th></tr>';
    var body = a.pts.map(function (p) {
      return '<tr><td>' + esc(p.d) + '</td>'
        + '<td>' + (p.set ? esc(String(p.set)) : "&mdash;") + '</td>'
        + '<td><b>' + p.ind + '</b> / ' + (a.tot || p.tot || "") + '</td>'
        + '<td>' + (p.sup ? p.sup : "&mdash;") + '</td>'
        + '<td>' + (p.hints === null ? "&mdash;" : p.hints) + '</td>'
        + '<td>' + (p.conf === null ? "&mdash;" : p.conf + " / 5") + '</td></tr>';
    }).join("");
    return '<table class="pp-tbl">' + head + body + '</table>';
  }

  /* Rows that no picture can hold: m9 counts ways produced and has no
     independent-out-of-n at all. They are listed as what they are rather than
     flattened onto an axis that does not fit them. */
  function otherRows(list) {
    var a = api(); if (!a) return [];
    return list.filter(function (r) { return !a.chartable(r); });
  }

  function sheetFor(sid, list) {
    var a = api();
    var series = a.seriesFor(list);
    var others = otherRows(list);
    var probes = series.reduce(function (n, s) { return n + s.pts.length; }, 0);

    var h = '<div class="pp-sheet">'
      + '<div class="pp-head">'
      +   '<div class="pp-ey">Architecture of Grace &middot; '
      +     esc(T("Practice record", "Registro de práctica")) + '</div>'
      +   '<div class="pp-sid">' + esc(sid) + '</div>'
      +   '<div class="pp-meta">' + esc(T("Printed ", "Impreso ")) + esc(today())
      +     ' &middot; ' + series.length + ' ' + esc(series.length === 1 ? T("activity", "actividad") : T("activities", "actividades"))
      +     ' &middot; ' + probes + ' ' + esc(probes === 1 ? T("probe", "sondeo") : T("probes", "sondeos"))
      +   '</div>'
      + '</div>'
      + '<p class="pp-prov">' + esc(T(
          "Drawn from the rows this student chose to send to the Practice tab of the teacher's Sheet. It is progress-monitoring evidence, not a grade; confidence is the student's own number; and an activity never sent has no line here, which is a gap in the record and not in the student.",
          "Tomado de las filas que este estudiante eligió enviar a la pestaña Practice de la hoja del docente. Es evidencia de monitoreo, no una calificación; la confianza es el número del propio estudiante; y una actividad que nunca se envió no tiene línea aquí, lo cual es un hueco en el registro y no en el estudiante.")) + '</p>';

    var w = a.weakest(series);
    if (w) {
      h += '<p class="pp-next"><b>' + esc(T("Next brick: ", "Próximo ladrillo: "))
        + esc(w.name) + '</b> &mdash; ' + esc(T(
            w.last.ind + " of " + w.tot + " without a hint on " + a.shortDate(w.last.d) + ", the lowest of the " + series.length + " activities sent.",
            w.last.ind + " de " + w.tot + " sin pista el " + a.shortDate(w.last.d) + ", la más baja de las " + series.length + " actividades enviadas.")) + '</p>';
    }

    h += series.map(function (s) {
      return '<div class="pp-act">'
        + '<div class="pp-an">' + esc(s.name) + '</div>'
        + (s.skill ? '<div class="pp-as">' + esc(s.skill) + '</div>' : "")
        + '<div class="pp-svg">' + unthemed(a.svg(s)) + '</div>'
        /* AOG-PPRINT-ONEPROBE — ⚠ A ONE-PROBE ACTIVITY HAS NEITHER A LINE NOR
           A BAND: the chart only draws them at n > 1. Printing the two-probe
           caption over a single dot describes marks that are not on the paper. */
        + '<p class="pp-key">' + esc(s.pts.length > 1
            ? T("The line is what was solved with no hint. The shaded band above it is what a hint was still carrying. Every value is printed as a number as well, so nothing here depends on color.",
                "La línea es lo resuelto sin pista. La banda sombreada encima es lo que una pista todavía sostenía. Cada valor también aparece como número, así que nada aquí depende del color.")
            : T("One probe, so there is a dot and no line yet: the dot is what was solved with no hint. Every value is printed as a number as well, so nothing here depends on color.",
                "Un solo sondeo, así que hay un punto y todavía no una línea: el punto es lo resuelto sin pista. Cada valor también aparece como número, así que nada aquí depende del color.")) + '</p>'
        + '<ul class="pp-says">' + a.says(s).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join("") + '</ul>'
        + probeTable(s)
        + '</div>';
    }).join("");

    if (others.length) {
      h += '<div class="pp-act pp-other"><div class="pp-an">'
        + esc(T("Also sent, counted its own way", "También enviado, contado a su manera")) + '</div>'
        + '<p class="pp-key">' + esc(T(
            "These activities do not score out of a fixed number of items, so they are listed rather than drawn.",
            "Estas actividades no puntúan sobre un número fijo de ítems, así que se listan en lugar de dibujarse.")) + '</p>'
        + '<table class="pp-tbl"><tr><th>' + esc(T("When", "Cuándo")) + '</th><th>'
        + esc(T("Activity", "Actividad")) + '</th><th>' + esc(T("Hints", "Pistas")) + '</th><th>'
        + esc(T("Confidence", "Confianza")) + '</th></tr>'
        + others.map(function (r) {
            var c = num(r.confidence), hn = num(r.hintsUsed);
            return '<tr><td>' + esc(String(r.date || r.timestamp || "").slice(0, 10)) + '</td>'
              + '<td>' + esc(r.activityName || r.activityId || "") + '</td>'
              + '<td>' + (hn === null ? "&mdash;" : hn) + '</td>'
              + '<td>' + (c === null ? "&mdash;" : c + " / 5") + '</td></tr>';
          }).join("")
        + '</table></div>';
    }

    h += '<p class="pp-hold">' + esc(T(
        "The item-by-item detail for each probe — which question, which sub-skill — stays on the device the student worked on and is printed from there. This sheet is the summary the Sheet received.",
        "El detalle ítem por ítem de cada sondeo — qué pregunta, qué subdestreza — permanece en el dispositivo donde trabajó el estudiante y se imprime desde allí. Esta hoja es el resumen que recibió la hoja de cálculo.")) + '</p>'
      + '<div class="pp-sign"><span>' + esc(T("Reviewed by", "Revisado por"))
      + '</span><span>' + esc(T("Date", "Fecha")) + '</span></div>'
      + '</div>';
    return h;
  }

  /* Black on white, block layout only. NO flex and NO vh anywhere: a flex
     cover page with min-height:92vh is exactly what printed the MTSS report's
     blank first sheet, and Chrome breaks it differently from a harness. */
  var CSS =
    '<style>'
    /* AOG-PPRINT-PAPER — ⚠ THE PAGE, NOT ONLY THE BOX. With Background
       graphics ticked - the setting that makes the shaded hint band come
       out - the app's own body ground printed straight through, so a
       dashboard in dark mode put black text on a navy sheet of paper.
       Print media only, and only while this sheet exists. NO min-height
       and NO vh: that is what printed the MTSS report blank. */
    + '@media print{html,body{background:#fff !important;}}'
    + '#printReport .pp-sheet{font-family:Georgia,"Times New Roman",serif;color:#111;background:#fff;'
    +   'font-size:12px;line-height:1.55;}'
    + '#printReport .pp-sheet + .pp-sheet{break-before:page;page-break-before:always;}'
    /* AOG-PPRINT-NOGROUND — ⚠ EVERYTHING IN HERE STILL MATCHES THE APP\'S
       OWN THEMED CSS. .pp-tbl th declared a border and a color and no
       background, inherited the global th ground, and printed #444 text
       on navy in dark mode. Blanket the subtree rather than patching the
       one element - that is how it comes back. */
    + '#printReport .pp-sheet *{background-color:transparent;}'
    + '#printReport .pp-sheet{background-color:#fff;}'
    + '#printReport .pp-tbl th{background-color:#F1EEE7;}'
    + '#printReport .pp-head{border-bottom:2px solid #7E5B18;padding-bottom:9px;margin-bottom:13px;}'
    + '#printReport .pp-ey{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#7E5B18;font-weight:700;}'
    + '#printReport .pp-sid{font-size:23px;font-weight:700;color:#111;margin-top:2px;}'
    + '#printReport .pp-meta{font-size:11px;color:#444;margin-top:2px;}'
    + '#printReport .pp-prov{font-size:11px;color:#333;margin:0 0 12px;}'
    + '#printReport .pp-next{font-size:12px;color:#111;margin:0 0 14px;padding:7px 9px;border:1px solid #bbb;}'
    + '#printReport .pp-act{margin:0 0 18px;padding:0 0 4px;border-bottom:1px solid #ddd;'
    +   'break-inside:avoid;page-break-inside:avoid;}'
    + '#printReport .pp-an{font-size:15px;font-weight:700;color:#111;}'
    + '#printReport .pp-as{font-size:11px;color:#555;margin-bottom:5px;}'
    + '#printReport .pp-svg{width:100%;max-width:520px;margin:4px 0 2px;}'
    + '#printReport .pp-svg svg{width:100%;height:auto;}'
    + '#printReport .pp-key{font-size:10.5px;color:#444;margin:0 0 7px;}'
    + '#printReport .pp-says{margin:0 0 8px;padding-left:17px;font-size:11.5px;color:#111;}'
    + '#printReport .pp-says li{margin-bottom:3px;}'
    + '#printReport .pp-tbl{border-collapse:collapse;width:100%;font-size:11px;margin:0 0 6px;}'
    + '#printReport .pp-tbl th{text-align:left;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;'
    +   'color:#444;border-bottom:1px solid #999;padding:3px 6px 3px 0;font-weight:700;}'
    + '#printReport .pp-tbl td{padding:3px 6px 3px 0;border-bottom:1px solid #e2e2e2;color:#111;}'
    + '#printReport .pp-hold{font-size:10.5px;color:#444;margin:12px 0 0;}'
    + '#printReport .pp-sign{margin-top:22px;font-size:10.5px;color:#444;}'
    + '#printReport .pp-sign span{display:inline-block;width:46%;border-top:1px solid #999;padding-top:4px;}'
    + '#printReport .pp-sign span + span{margin-left:6%;}'
    + '</style>';

  function doPrint(which) {
    var a = api();
    var pr = document.getElementById("printReport");
    if (!a || !pr) return;
    var m = a.byStudent();
    var names = Object.keys(m).sort();
    if (which !== "*") names = names.filter(function (s) { return s === which; });
    if (!names.length) return;

    pr.innerHTML = CSS + names.map(function (s) { return sheetFor(s, m[s]); }).join("");

    /* AOG-PPRINT-TITLE — ⚠ CAPTURE THE REAL TITLE ONCE. Capturing it per call
       meant a second print inside the 400 ms cleanup window captured the
       ALREADY-MUTATED title as the thing to restore, so a double-click on the
       button left the teacher's tab called AoG_<code>_practice_<date> for the
       rest of the session. A later print resets the one timer rather than
       stacking a second. */
    if (realTitle === null) realTitle = document.title;
    document.title = "AoG_" + (which === "*" ? "practice_all"
      : String(which).replace(/[^A-Za-z0-9]+/g, "_") + "_practice") + "_" + today();
    /* Synchronous inside the click: iOS Safari blocks a print() that has left
       the user-gesture chain. */
    /* ⚠ NOT ON A TIMER, AND NOT AFTER print() — see AOG-PRINT-HOLD in the
       head. The 400 ms wipe is what printed blank paper on the iPad. */
    aogPrintHold(function () {
      if (realTitle !== null) { document.title = realTitle; realTitle = null; }
      restoreT = 0; pr.innerHTML = "";
    });
    try { window.print(); } catch (e) {}
  }
  window.aogPrintPracticeRecord = doPrint;

  /* ⚠ ABOVE the chart, never between the chart and the card — see the header. */
  function mount() {
    var host = (window.aogSheetHost && window.aogSheetHost()) || document.getElementById("panel-daily");
    if (!host) return null;
    var chart = document.getElementById("aogPracticeChart");
    var card = document.getElementById("aogPracticeCard");
    var ref = (chart && chart.parentNode === host) ? chart
            : ((card && card.parentNode === host) ? card : null);
    var b = document.getElementById(MOUNT);
    if (!b) {
      b = document.createElement("div");
      b.id = MOUNT;
      if (ref) host.insertBefore(b, ref); else host.appendChild(b);
    } else if (ref && b.nextElementSibling !== ref) {
      host.insertBefore(b, ref);
    }
    return b;
  }

  function render() {
    var b = mount();
    if (!b) return;
    var a = api();
    if (!a) { b.hidden = true; b.innerHTML = ""; return; }
    var m = a.byStudent();
    var all = Object.keys(m);
    if (!all.length) { b.hidden = true; b.innerHTML = ""; return; }
    b.hidden = false;

    /* ⚠⚠ .30i1 — `pick` IS WHAT THE TEACHER CHOSE ON THIS CARD, and it wins
       over the chart's chip. The chart drops a student who has nothing
       CHARTABLE back to the first one (its `names` are filtered by
       chartable(); these are not), and a print button must name the child it
       is actually going to print. A chart chip clears `pick`, so steering
       from the picture below still works exactly as it did. */
    var sel = (pick && all.indexOf(pick) !== -1) ? pick : a.current();
    if (all.indexOf(sel) === -1) sel = null;

    /* Same order the chart uses — most rows first, then alphabetical — so the
       two rows of chips read identically. */
    var order = all.slice().sort(function (x, y) {
      return m[y].length - m[x].length || (x < y ? -1 : 1);
    });

    var h = '<div class="pb-ey">' + esc(T("From the Sheet", "Desde la hoja")) + '</div>'
      + '<h3>' + esc(T("Print a practice record", "Imprimir un registro de práctica")) + '</h3>'
      + '<p class="pb-sub">' + esc(T(
          "One page per student: their graph and every sheet they did. Print it or save it as a PDF for a meeting.",
          "Una página por estudiante: su gráfica y cada hoja que hizo. Imprímela o guárdala como PDF para una reunión.")) + '</p>'
      + (order.length > 1
          ? '<div class="pb-who"><span class="pb-wlb">' + esc(T("Student", "Estudiante")) + '</span>'
            + order.map(function (sid) {
                return '<button type="button" class="pb-chip" data-ppwho="' + esc(sid) + '"'
                     + ' aria-pressed="' + (sid === sel ? "true" : "false") + '">' + esc(sid) + '</button>';
              }).join("")
            + '</div>'
          : "")
      + '<div class="pb-row">'
      + (sel ? '<button type="button" class="pb-go" data-ppprint="' + esc(sel) + '">'
             + esc(T("Print ", "Imprimir ")) + esc(sel) + esc(T("'s record", " — su registro")) + '</button>' : "")
      + '<button type="button" data-ppprint="*">'
      + esc(all.length === 1 ? T("Print this record", "Imprimir este registro")
                             : T("Print all " + all.length + " students", "Imprimir los " + all.length + " estudiantes"))
      + '</button>'
      + '</div>';
    /* ⚠ THE OLD SENTENCE SENT THE TEACHER DOWN THE PAGE — "the one selected
       in the picture below" — which is the whole fault this build fixes. It
       now reports whether the picture can follow, because a student whose
       rows are all counted their own way has a record to print and nothing
       to draw, and silently leaving the chart on someone else would be the
       kind of half-truth this card has been burned by before. */
    if (sel) {
      var drawable = false;
      try { drawable = (m[sel] || []).some(a.chartable); } catch (eD) { drawable = false; }
      h += '<p class="pb-sub" style="margin:9px 0 0;">' + esc(drawable
        ? T("The two buttons above print the student picked here. The picture below follows the same choice.",
            "Los dos botones de arriba imprimen al estudiante elegido aquí. La imagen de abajo sigue la misma elección.")
        : T("The two buttons above print the student picked here. This student’s rows are counted their own way, so there is nothing for the picture below to draw yet — the record still prints.",
            "Los dos botones de arriba imprimen al estudiante elegido aquí. Las filas de este estudiante se cuentan a su manera, así que todavía no hay nada que dibujar abajo — el registro sí se imprime.")) + '</p>';
    }
    /* AOG-PROBE-SHEET-V1 mounts its controls INSIDE this bar rather than as a
       second card: two cards in #panel-daily would both want to sit above the
       chart, and the chart re-seats itself against the practice card on every
       render. One bar, one place, no ping-pong. */
    try { if (typeof window.aogProbeBarHtml === "function") h += window.aogProbeBarHtml(sel, all); }
    catch (eB) {}
    b.innerHTML = h;
  }

  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-ppprint]") : null;
    if (!t) return;
    var b = document.getElementById(MOUNT);
    if (!b || !b.contains(t)) return;
    doPrint(t.getAttribute("data-ppprint"));
  });

  /* AOG-PPRINT-CHIP — ⚠ THE CHART'S CHIPS CALL ITS OWN INTERNAL render(),
     NEVER the exported window.aogRenderPracticeChart, so wrapping that export
     does not fire on a chip click and the bar kept naming the student the
     teacher had just clicked away from — a correct sentence turned false one
     click later, and the button would then print the wrong child. Listen for
     the chip itself. The immediate call is what normally does it; the 0 ms
     hop only survives a change in listener order. */
  /* .30i1 — the card's own Student chips. They set the shared selection
     through AOG_PRACTICE.select() so the chart follows, and hold `pick`
     locally for the student the chart cannot draw. */
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-ppwho]") : null;
    if (!t) return;
    var b = document.getElementById(MOUNT);
    if (!b || !b.contains(t)) return;
    pick = t.getAttribute("data-ppwho");
    try { var a = api(); if (a && a.select) a.select(pick); } catch (e2) {}
    try { render(); } catch (e3) {}
  });

  document.addEventListener("click", function (e) {
    var c = e.target && e.target.closest ? e.target.closest("[data-gcwho]") : null;
    if (!c) return;
    /* ⚠ THE PICTURE STAYS A WAY IN. Choosing from the chart clears this
       card's own pick, so the two never argue about who is selected. */
    pick = null;
    try { render(); } catch (e2) {}
    setTimeout(function () { try { render(); } catch (e3) {} }, 0);
  });

  window.aogRenderPracticePrintBar = render;

  /* ⚠ CARRY THE OTHER WRAPPERS' FLAGS — six blocks wrap refreshAdmin and two
     now wrap aogRenderPracticeChart; a wrapper that drops the others makes
     them wrap again on their next retry. */
  function wrap(name, flag) {
    var orig = window[name];
    if (typeof orig !== "function" || orig[flag]) return false;
    var wrapped = function () {
      var r = orig.apply(this, arguments);
      try { render(); } catch (e) {}
      return r;
    };
    wrapped[flag] = true;
    try {
      Object.keys(orig).forEach(function (k) {
        if (k.indexOf("__aog") === 0 && !wrapped[k]) wrapped[k] = orig[k];
      });
    } catch (eF) {}
    window[name] = wrapped;
    return true;
  }
  (function hook() {
    function go() {
      wrap("aogRenderPracticeChart", "__aogPPrint");
      wrap("aogRenderPractice", "__aogPPrintTbl");
      wrap("refreshAdmin", "__aogPPrintAdmin");
      try { render(); } catch (e) {}
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
    setTimeout(go, 1200);
    setTimeout(go, 2800);
  })();
})();
