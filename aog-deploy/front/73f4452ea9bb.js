
(function () {
  "use strict";

  var realTitle = null, restoreT = 0;

  function api() { return window.AOG_PRACTICE || null; }
  function isEs() {
    try { if (typeof dashLang !== "undefined") return dashLang === "es"; } catch (e) {}
    return false;
  }
  function T(en, es) { return isEs() ? es : en; }
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function num(v) { return (v === 0 || (v && !isNaN(Number(v)))) ? Number(v) : null; }
  function today() { try { return new Date().toISOString().slice(0, 10); } catch (e) { return ""; } }
  function when(r) { return String((r && (r.date || r.timestamp)) || "").slice(0, 10); }

  function rows() {
    try {
      var a = JSON.parse(localStorage.getItem("aog.practice.remote") || "[]");
      a = Object.prototype.toString.call(a) === "[object Array]" ? a : [];
      /* a removed row never comes back — not here, not on the next pull */
      try { if (window.aogPracticeDel) a = window.aogPracticeDel.live(a); } catch (eDel) {}
      return a;
    } catch (e) { return []; }
  }
  function extraOf(r) {
    try { var x = JSON.parse(String(r.extra || "{}")); return (x && typeof x === "object") ? x : {}; }
    catch (e) { return {}; }
  }
  function probeOf(r) {
    var p = extraOf(r).probe;
    return (p && typeof p === "object" && p.v) ? p : null;
  }

  /* the three strands, named from the hubs' own h1 — the same table the
     activity pages' own eyebrow uses since AOG-M-STRANDLINE-V1 */
  var STRAND = {
    "interior-math":     { en: "The Interior Mathematics", es: "Matemáticas del Interior" },
    "concepts-data":     { en: "Number Concepts & Data",   es: "Conceptos Numéricos y Datos" },
    "science-vocabulary":{ en: "Science Vocabulary",       es: "Vocabulario de Ciencias" },
    "social-studies":    { en: "Social Studies", es: "Estudios Sociales" },
    "exam-prep":         { en: "Exam Prep", es: "Preparación de exámenes" },
    /* AOG-DD-WORK-V1: without this a Writing probe printed the eyebrow
       "The Interior Mathematics", which is simply the wrong subject. */
    "daily-drops":       { en: "Daily Drafts — K-8 Spiral Review", es: "Daily Drafts — Repaso en espiral K-8" }
  };
  function strandOf(r) {
    var s = STRAND[String(extraOf(r).series || "")] ||
            STRAND[({ m: "interior-math", c: "concepts-data", v: "science-vocabulary", h: "social-studies", b: "exam-prep" })[String(r.activityId || "").charAt(0)]] ||
            STRAND["interior-math"];
    return isEs() ? s.es : s.en;
  }
  function bandName(b) { return isEs() ? (b.es || b.en) : (b.en || b.es); }

  /* ── the dots: solid, half and empty, told apart by FILL and never by
     color, because a gray dot and a black dot are the same dot on a
     school photocopier. Same rule as the device sheet. ── */
  function dots(list, at) {
    return at.map(function (x) {
      var s = (list && list[x - 1]) || "none";
      return '<span class="rs-dot ' + (s === "ind" ? "ind" : (s === "sup" ? "sup" : "")) + '">'
           + '<span class="rs-num">' + x + '</span></span>';
    }).join("");
  }

  /* ── what this says ── a port of the device sheet's saysList. Every
     sentence here is asserted, verbatim, against m3's own copy. ── */
  function says(r, p) {
    var out = [], n = num(r.itemsTotal), ind = num(r.independent), sup = num(r.supported);
    var list = p && p.items, B = p && p.bands;
    if (ind !== null) {
      out.push(T("Independent means it was solved with no hint; supported means it was solved after one. Both are real evidence and neither is a grade.",
                 "Independiente significa resuelto sin pista; con apoyo significa resuelto después de una. Las dos son evidencia real y ninguna es una calificación."));
    } else {
      out.push(T("This one is not x of ten. It counts what the student produced, and a count of what someone made is real evidence — there is nothing here to be wrong about.",
                 "Esta no es x de diez. Cuenta lo que el estudiante produjo, y un conteo de lo que alguien hizo es evidencia real — aquí no hay nada en qué equivocarse."));
    }
    if (p && p.fin === false) {
      out.push(T("This set was not finished — read the counts as a partial probe.",
                 "Este grupo no se terminó — lee los conteos como un sondeo parcial."));
    }
    if (ind !== null && n) {
      if (ind === n && !num(r.hintsUsed)) {
        out.push(T("All " + n + " with no hints. The next honest probe is a harder set, not this one again.",
                   "Las " + n + " sin pistas. El siguiente sondeo honesto es un grupo más difícil, no este otra vez."));
      } else if (sup !== null && sup > ind) {
        out.push(T("More of this was solved with a hint than without one. The skill is emerging, not established.",
                   "Se resolvió más con pista que sin ella. La destreza está emergiendo, no establecida."));
      }
    }
    if (B && list && n) {
      /* AOG-M-UNREACHED-V1 — ⚠ A BAND NOBODY REACHED IS NOT A BAND THAT CAME
         APART. Moved in lockstep with the same sentence on all thirty activity
         pages; fixing one and not the other would leave the other lying and
         would break the cross-file drift test that exists to catch it. */
      var rate = B.filter(function (b) {
        return b.at.every(function (x) { return list[x - 1] && list[x - 1] !== "none"; });
      }).map(function (b) {
        var got = 0;
        b.at.forEach(function (x) { if (list[x - 1] === "ind") got++; });
        return { b: b, got: got, tot: b.at.length, r: got / b.at.length };
      });
      var lo = (rate.length > 1) ? rate.slice().sort(function (a, c) { return a.r - c.r; })[0] : null;
      var tie = lo ? rate.filter(function (x) { return x.r === lo.r; }).length : 0;
      if (lo && tie === 1 && lo.r < 1) {
        out.push(T(lo.b.en + " is where it came apart: " + lo.got + " of " + lo.tot + " without a hint.",
                   (lo.b.es || lo.b.en) + " es donde se rompió: " + lo.got + " de " + lo.tot + " sin pista."));
      }
    }
    var conf = num(r.confidence);
    if (conf !== null && ind !== null && n) {
      var c5 = conf / 5, got = ind / n;
      if (c5 - got >= 0.35) {
        out.push(T("Confidence is well above the result — worth one sentence with the student before the next probe.",
                   "La confianza está muy por encima del resultado — vale una frase con el estudiante antes del próximo sondeo."));
      } else if (got - c5 >= 0.35) {
        out.push(T("The result is well above the confidence — the student did better than they think they did, and should be told so.",
                   "El resultado está muy por encima de la confianza — al estudiante le fue mejor de lo que cree, y hay que decírselo."));
      }
    }
    out.push(T("One probe on one day. Read it next to what the person standing there saw.",
               "Un sondeo de un día. Léelo junto a lo que vio la persona que estaba ahí."));
    return out;
  }

  function fieldCell(lb, v) {
    return '<td><span class="lb">' + esc(lb) + '</span>'
         + (v ? '<span class="val">' + esc(v) + '</span>' : '<span class="rule"></span>') + '</td>';
  }

  /* every set of this activity this student has sent, from the SHEET —
     more than the device log, which only knows one computer */
  function setsFor(sid, actId) {
    var by = {};
    rows().forEach(function (r) {
      if (String(r.studentId) !== String(sid)) return;
      if (String(r.activityId) !== String(actId)) return;
      var s = num(r.setNo); if (!s) return;
      var prev = by[s];
      if (prev && String(prev.timestamp || "") > String(r.timestamp || "")) return;
      by[s] = r;
    });
    return by;
  }

  /* ── AOG-DD-WORK-V1: the student's actual work, printed ───────────────── */
  function ddWorkBox(r) {
    var x = extraOf(r);
    if (String(x.series || "") !== "daily-drops") return "";
    var h = "";

    if (x.kind === "writing") {
      var w = x.work || {}, txt = String(w.text || "").trim();
      h += '<div class="rs-box rs-work"><p class="rs-h">'
         + esc(T("What the student wrote", "Lo que escribió el estudiante")) + '</p>';
      h += txt
        ? '<div class="rs-para">' + esc(txt).replace(/\n+/g, "</div><div class=\"rs-para\">") + '</div>'
        : '<p class="rs-none">' + esc(T(
            "This row carries no writing — it was sent before the writing traveled with it, or the box was empty.",
            "Esta fila no lleva escritura — se envió antes de que la escritura viajara con ella, o la casilla estaba vacía.")) + '</p>';
      var cells = (w.plan && w.plan.cells) || {}, ks = [];
      for (var ck in cells) if (Object.prototype.hasOwnProperty.call(cells, ck)) ks.push(ck);
      ks.sort(function (a, b) { return (+a) - (+b); });
      if (ks.length) {
        h += '<p class="rs-h2">' + esc(T("The plan they made first", "El plan que hicieron primero"))
           + ' <span class="rs-note">' + esc((w.plan.cellsUsed || ks.length) + " / " + (w.plan.cellsTotal || ks.length)
           + " " + T("boxes filled", "casillas llenas")) + '</span></p>'
           + '<ul class="rs-plan">' + ks.map(function (k) {
               return "<li>" + esc(String(cells[k])) + "</li>"; }).join("") + "</ul>";
      }
      var rub = x.rubric || {}, rk = [];
      for (var q in rub) if (Object.prototype.hasOwnProperty.call(rub, q)) rk.push(q);
      if (rk.length) {
        var RN = { grammar: ["Grammar", "Gramática"], punct: ["Punctuation", "Puntuación"],
                   caps: ["Capitalization", "Mayúsculas"], tools: ["Use of Tools", "Uso de herramientas"],
                   plan: ["Planning & Organization", "Planificación y organización"],
                   sent: ["Complete Sentences", "Oraciones completas"] };
        h += '<p class="rs-h2">' + esc(T("Rubric, as the student scored it", "Rúbrica, como la calificó el estudiante"))
           + '</p><table class="rs-rub">' + rk.map(function (k) {
               var nm = RN[k] || [k, k];
               return "<tr><td>" + esc(isEs() ? nm[1] : nm[0]) + "</td><td><b>" + esc(rub[k]) + "</b> / 4</td></tr>";
             }).join("") + "</table>";
      }
      h += "</div>";
      return h;
    }

    /* a practice sheet — every box, every answer given */
    var A = x.answers;
    if (Object.prototype.toString.call(A) !== "[object Array]" || !A.length) {
      return '<div class="rs-box"><p class="rs-h">' + esc(T("Answers given", "Respuestas dadas")) + '</p>'
        + '<p class="rs-none">' + esc(T(
            "This row was sent before the answers traveled with it, so there is nothing to print here. It is missing from the record, not from the student.",
            "Esta fila se envió antes de que las respuestas viajaran con ella, así que no hay nada que imprimir aquí. Falta en el registro, no en el estudiante.")) + '</p></div>';
    }
    h += '<div class="rs-box rs-work"><p class="rs-h">' + esc(T("Answers given", "Respuestas dadas"))
       + ' <span class="rs-note">' + esc(T(
             "a struck answer was marked wrong; the answer that follows it in the box is the key",
             "una respuesta tachada se marcó como incorrecta; la respuesta que le sigue en el recuadro es la clave"))
       + '</span></p><table class="rs-ans">';
    A.forEach(function (b) {
      var items = (Object.prototype.toString.call(b.a) === "[object Array]") ? b.a : [];
      /* ⚠ AOG-DD-QTEXT-V1 — the question sits under the strand name, in the
         same cell, so a row still reads top-to-bottom as one item and an old
         row (which carries no `q`) simply prints as it always did. */
      var qt = String(b.q == null ? "" : b.q);
      /* ⚠ the same riddle at row level: a question holding four true/false
         statements shows four answers, and without the count the reader is
         left to infer it from how many boxes happen to be on the line. */
      var ic = items.length > 1
        ? '<span class="rs-ic">' + esc(items.length + " " + T("items", "ítems")) + "</span>" : "";
      h += "<tr><td class=\"bn\">" + esc(String(b.b || "") + ". " + String(b.s || "")) + ic
         + (qt ? '<span class="rs-q">' + esc(qt) + "</span>" : "") + "</td><td>"
         + (items.length ? items.map(function (it) {
             var g = String(it.g == null ? "" : it.g);
             /* AOG-DD-KEY-V1 — Jimmy: "MAY the answer sheet be provided with the
                printout?" A struck answer said "wrong" without saying what was
                right, which is the half of the information a teacher can't
                reconstruct. The key rides in `c` and prints beside it. It is
                only carried when it differs from what the student put, so a
                clean answer standing alone IS the key. */
             var key = (it.c == null || it.c === "") ? "" :
                       '<span class="rs-key">' + esc(String(it.c)) + "</span>";
             if (typeof it.ok === "undefined")
               return '<span class="rs-a open">' + esc(g || "\u2014") + "</span>" + key;
             if (g === "") return '<span class="rs-a blank">&mdash;</span>' + key;
             return '<span class="rs-a ' + (it.ok ? "ok" : "no") + '">' + esc(g) + "</span>" + key;
           }).join(" ") : '<span class="rs-a blank">&mdash;</span>')
         + "</td></tr>";
    });
    return h + "</table></div>";
  }

  /* ── the sheet. blank:true is the paper probe — a class set to run with a
     pencil — and it fills in nothing but the activity's own identity. ── */
  function sheetFor(r, blank) {
    var p = blank ? null : probeOf(r);
    var n = blank ? (probeOf(r) ? probeOf(r).n : num(r.itemsTotal)) : num(r.itemsTotal);
    var ind = blank ? null : num(r.independent), sup = blank ? null : num(r.supported);
    var pAny = probeOf(r);
    var bands = pAny && pAny.bands ? pAny.bands : null;
    var items = (!blank && p) ? p.items : null;
    var meas = (pAny && pAny.meas) || "";

    var h = '<div class="rs-sheet"><div class="rs-top">'
      + '<div class="rs-k">' + esc("Architecture of Grace · " + strandOf(r))
      +   '<span class="rs-r">' + esc(T("Progress probe", "Sondeo de progreso")) + '</span></div>'
      + '<h1>' + esc(r.activityName || r.activityId || "") + '</h1>'
      + (r.skill ? '<p class="rs-skill">' + esc(r.skill) + '</p>' : "")
      + '</div>'
      + '<table class="rs-fields"><tr>'
      +   fieldCell(T("Student", "Estudiante"), blank ? "" : r.studentId)
      +   fieldCell(T("Date", "Fecha"), blank ? "" : when(r))
      +   fieldCell(T("Set", "Grupo"), blank ? "" : (num(r.setNo) ? String(num(r.setNo)) : ""))
      +   fieldCell(T("Class / period", "Clase / período"), "")
      +   fieldCell(T("Measure", "Medida"), meas)
      + '</tr></table>';

    /* what happened */
    var cells = [];
    if (blank) {
      cells.push({ big: "", of: T("of ", "de ") + (n || ""), cap: T("Independent", "Independiente") });
      cells.push({ big: "", of: T("of ", "de ") + (n || ""), cap: T("Supported", "Con apoyo") });
    } else if (ind !== null) {
      cells.push({ big: ind, of: T("of ", "de ") + n, cap: T("Independent", "Independiente") });
      cells.push({ big: (sup === null ? 0 : sup), of: T("of ", "de ") + n, cap: T("Supported", "Con apoyo") });
    } else if (pAny && num(pAny.ways) !== null) {
      cells.push({ big: num(pAny.ways), of: "", cap: T("Expressions built", "Expresiones construidas") });
      cells.push({ big: (num(pAny.both) || 0), of: T("of ", "de ") + (n || ""), cap: T("From both sides", "Desde ambos lados") });
    } else {
      cells.push({ big: "—", of: "", cap: T("Independent", "Independiente") });
      cells.push({ big: "—", of: "", cap: T("Supported", "Con apoyo") });
    }
    cells.push({ big: blank ? "" : (num(r.hintsUsed) === null ? 0 : num(r.hintsUsed)), of: "", cap: T("Hints used", "Pistas usadas") });
    cells.push({ big: blank ? "" : (num(r.confidence) !== null ? num(r.confidence) : "—"),
                 of: (!blank && num(r.confidence) !== null) ? T("of 5", "de 5") : "", cap: T("Confidence", "Confianza") });
    h += '<div class="rs-box"><p class="rs-h">' + esc(T("What happened", "Lo que pasó")) + '</p>'
       + '<table class="rs-nums"><tr>'
       + cells.map(function (c) {
           return '<td><div class="big' + (blank ? " rs-write" : "") + '">' + esc(c.big === "" ? " " : c.big) + '</div>'
                + '<div class="of">' + (c.of ? esc(c.of) : "&nbsp;") + '</div>'
                + '<div class="cap">' + esc(c.cap) + '</div></td>';
         }).join("")
       + '</tr></table>'
       /* ⚠⚠ AOG-PRINT-COUNTS-V1 — "5 of 18" OVER A LIST OF TEN IS A RIDDLE.
          Jimmy: "it is hard to see that there is 18 questions out of the 10
          MAIN QUESTIONS." The score counts ITEMS; the sheet is built of ten
          QUESTIONS, and a question can hold three true/false statements. The
          two numbers are both right and neither explains the other, so the
          sheet has to say the relationship out loud. Only when they differ —
          on a sheet where ten questions hold ten items there is nothing to
          explain and the line would be noise. */
       + (function () {
           var qn = 0;
           try { var xa = extraOf(r).answers;
                 if (Object.prototype.toString.call(xa) === "[object Array]") qn = xa.length; }
           catch (e) {}
           if (blank || !qn || !n || +n === qn) return "";
           return '<p class="rs-cnt">' + esc(T(
             n + " items across " + qn + " questions — a question can hold more than one item.",
             n + " ítems en " + qn + " preguntas — una pregunta puede tener más de un ítem.")) + "</p>";
         })()
       + '</div>';

    /* item by item */
    if (bands || items || (blank && n)) {
      var rowsHtml;
      if (bands) {
        rowsHtml = bands.map(function (b) {
          var got = 0;
          if (items) b.at.forEach(function (x) { if (items[x - 1] === "ind") got++; });
          return '<tr><td class="bn">' + esc(bandName(b)) + '</td>'
               + '<td>' + dots(items, b.at) + '</td>'
               + '<td class="bs">' + (items ? (got + " " + esc(T("of", "de")) + " " + b.at.length)
                                            : ('<span class="rs-blank"></span> ' + esc(T("of", "de")) + " " + b.at.length)) + '</td></tr>';
        }).join("");
      } else {
        var all = [], k;
        for (k = 1; k <= (n || 0); k++) all.push(k);
        var gotAll = 0;
        if (items) items.forEach(function (s) { if (s === "ind") gotAll++; });
        rowsHtml = '<tr><td class="bn">' + esc(T("All " + n + " items", "Los " + n + " ítems")) + '</td>'
                 + '<td>' + dots(items, all) + '</td>'
                 + '<td class="bs">' + (items ? (gotAll + " " + esc(T("of", "de")) + " " + n)
                                              : ('<span class="rs-blank"></span> ' + esc(T("of", "de")) + " " + n)) + '</td></tr>';
      }
      h += '<div class="rs-box"><p class="rs-h">' + esc(T("Item by item", "Ítem por ítem")) + '</p>'
         + '<table class="rs-map">' + rowsHtml + '</table>'
         + '<p class="rs-legend">'
         +   '<span class="rs-dot ind"></span>' + esc(T("no hint", "sin pista")) + '&nbsp;&nbsp;&nbsp;'
         +   '<span class="rs-dot sup"></span>' + esc(T("after a hint", "después de una pista")) + '&nbsp;&nbsp;&nbsp;'
         +   '<span class="rs-dot"></span>' + esc(T("not reached", "no alcanzado"))
         + '</p></div>';
    } else if (!blank && String(extraOf(r).series || "") !== "daily-drops") {
      /* ⚠ AN EMPTY GRID READS AS TEN WRONG ANSWERS. A row sent before the
         item map traveled has no map and never will, and saying so is the
         only honest thing this box can do.
         AOG-DD-WORK-V1: a Daily Drops row never carried a dot map and never
         will — its item detail is the answers/writing box below. Printing the
         apology here too says data is missing when it is on the next line. */
      h += '<div class="rs-box"><p class="rs-h">' + esc(T("Item by item", "Ítem por ítem")) + '</p>'
         + '<p class="rs-none">' + esc(T(
             "This row was sent before the item-by-item detail traveled with it, so there is no map to draw here — and there is no way to recover one. It is missing from the record, not from the student. Probes sent from now on carry it.",
             "Esta fila se envió antes de que el detalle ítem por ítem viajara con ella, así que no hay mapa que dibujar aquí — y no hay forma de recuperarlo. Falta en el registro, no en el estudiante. Los sondeos enviados desde ahora sí lo llevan.")) + '</p></div>';
    }

    /* ── AOG-DD-WORK-V1 ──────────────────────────────────────────────────
       Jimmy: "I don't [see] their paragraph and/or answers from the worksheet."
       A Daily Drops row carries the actual work in `extra` — the paragraph and
       the plan on a writing page, the answer given in every box on a practice
       sheet. A score with no work behind it cannot be read as evidence, so the
       probe prints the work itself whenever the row carries it. Rows sent
       before this traveled say so rather than printing an empty frame. */
    if (!blank) h += ddWorkBox(r);

    /* what this says */
    if (!blank) {
      h += '<div class="rs-box"><p class="rs-h">' + esc(T("What this says", "Lo que dice esto")) + '</p>'
         + '<ul class="rs-says">' + says(r, p).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join("")
         + '</ul></div>';
    }

    /* over time — from the SHEET, which knows every device */
    var by = blank ? {} : setsFor(r.studentId, r.activityId);
    h += '<div class="rs-box"><p class="rs-h">'
       +   esc(T("Over time — the same skills, three sets of numbers",
                 "A lo largo del tiempo — las mismas destrezas, tres grupos de números"))
       + '</p><table class="rs-over"><tr>'
       + [1, 2, 3].map(function (s) {
           var q = by[s];
           return '<td><div class="st">' + esc(T("Set ", "Grupo ")) + s + '</div>'
                + '<div class="dt">' + (q ? esc(when(q)) : "") + '</div>'
                + '<div class="sc">' + (q && num(q.independent) !== null
                    ? esc(num(q.independent) + " / " + (num(q.itemsTotal) || "")) : "") + '</div></td>';
         }).join("")
       + '</tr></table><p class="rs-legend">'
       + esc(blank
           ? T("Write each set in as it is run.", "Escribe cada grupo a medida que se aplica.")
           : T("Filled in from every row this student has sent to your Sheet, from any device. A blank box is a set that has never arrived — write it in.",
               "Rellenado con todas las filas que este estudiante ha enviado a tu hoja, desde cualquier dispositivo. Una casilla vacía es un grupo que nunca llegó — escríbelo a mano."))
       + '</p></div>';

    h += '<table class="rs-sign"><tr>'
      +   '<td style="width:34%"><span class="lb">' + esc(T("Recorded by", "Registrado por")) + '</span><span class="rule"></span></td>'
      +   '<td><span class="lb">' + esc(T("What to teach next", "Qué enseñar después")) + '</span><span class="rule"></span></td>'
      + '</tr></table>'
      + '<div class="rs-lines"><div></div><div></div></div>'
      + '<p class="rs-prov">'
      +   esc(blank
            ? T("A blank probe sheet to run with a pencil. It is a probe, not a test score.",
                "Una hoja de sondeo en blanco para aplicar con lápiz. Es un sondeo, no una calificación.")
            : T("Printed from the Educator Dashboard on " + today() + ", from the row this student sent on " + when(r)
                + ". It is a probe, not a test score.",
                "Impreso desde el Panel del Educador el " + today() + ", de la fila que este estudiante envió el " + when(r)
                + ". Es un sondeo, no una calificación."))
      + '</p></div>';
    return h;
  }

  /* Black on white, block layout only — NO flex and NO vh, the rule the MTSS
     blank first sheet paid for. Ported from the activity pages' own
     #aogRecSheet print CSS and scoped to #printReport. The blanket
     transparent is AOG-PPRINT-NOGROUND: everything in here still matches the
     app's own themed component CSS, and a bare <th> brought a navy ground
     with it the last time. */
  var CSS =
    '<style>'
    + '@media print{html,body{background:#fff !important;}}'
    + '#printReport .rs-sheet *{background-color:transparent;}'
    + '#printReport .rs-sheet{background-color:#fff;color:#000;font-size:10.5pt;line-height:1.4;'
    +   'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}'
    + '#printReport .rs-sheet + .rs-sheet{break-before:page;page-break-before:always;}'
    + '#printReport .rs-top{border-bottom:2pt solid #000;padding-bottom:7px;}'
    + '#printReport .rs-k{font-size:8pt;font-weight:800;letter-spacing:.14em;text-transform:uppercase;}'
    + '#printReport .rs-k .rs-r{float:right;letter-spacing:.1em;}'
    + '#printReport .rs-sheet h1{font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;'
    +   'font-size:20pt;line-height:1.1;margin:5px 0 0;font-weight:700;color:#000;}'
    + '#printReport .rs-skill{font-size:11pt;margin:2px 0 0;}'
    + '#printReport .rs-fields{width:100%;border-collapse:collapse;margin-top:11px;}'
    + '#printReport .rs-fields td{font-size:9pt;padding:0 10px 3px 0;vertical-align:bottom;white-space:nowrap;}'
    + '#printReport .rs-fields .lb{display:block;font-size:7.5pt;font-weight:800;letter-spacing:.1em;text-transform:uppercase;}'
    + '#printReport .rs-fields .rule{display:block;border-bottom:1pt solid #000;min-width:8em;height:15px;}'
    + '#printReport .rs-fields td:first-child .rule{min-width:13em;}'
    + '#printReport .rs-fields .val{display:block;font-size:11pt;font-weight:700;height:15px;}'
    + '#printReport .rs-box{border:1.5pt solid #000;margin-top:12px;padding:9px 11px;'
    +   'page-break-inside:avoid;break-inside:avoid;}'
    + '#printReport .rs-h{font-size:8pt;font-weight:800;letter-spacing:.13em;text-transform:uppercase;margin:0 0 6px;}'
    + '#printReport .rs-nums{width:100%;border-collapse:collapse;table-layout:fixed;}'
    + '#printReport .rs-nums td{text-align:center;padding:2px 4px;vertical-align:top;}'
    + '#printReport .rs-nums .big{font-size:25pt;font-weight:800;line-height:1;font-variant-numeric:tabular-nums;'
    +   'border-bottom:0;min-height:29pt;}'
    /* ⚠ A BLANK SHEET NEEDS SOMEWHERE TO WRITE. The four numbers came out
       as empty air above their captions - a teacher running the probe on
       paper had nothing to put a pencil on. */
    + '#printReport .rs-nums .big.rs-write{border-bottom:1pt solid #000;margin:0 14% 2px;}'
    + '#printReport .rs-nums .of{font-size:9.5pt;margin-top:1px;}'
    + '#printReport .rs-nums .cap{font-size:7.5pt;font-weight:800;letter-spacing:.09em;text-transform:uppercase;margin-top:3px;}'
    + '#printReport .rs-map{width:100%;border-collapse:collapse;margin-top:2px;}'
    + '#printReport .rs-map td{padding:4px 7px 13px 0;vertical-align:middle;border-bottom:.5pt solid #000;}'
    + '#printReport .rs-map tr:last-child td{border-bottom:0;}'
    + '#printReport .rs-map .bn{font-size:9.5pt;font-weight:700;width:36%;}'
    + '#printReport .rs-map .bs{font-size:9pt;text-align:right;white-space:nowrap;width:22%;}'
    + '#printReport .rs-blank{display:inline-block;border-bottom:1pt solid #000;width:2.2em;}'
    + '#printReport .rs-dot{display:inline-block;width:15px;height:15px;border:1.25pt solid #000;'
    +   'border-radius:50%;margin-right:4px;position:relative;vertical-align:middle;}'
    /* ⚠ solid, half and empty are told apart by FILL, never by color — a gray
       dot and a black dot are the same dot on a school photocopier */
    + '#printReport .rs-dot.ind{background-color:#000;}'
    + '#printReport .rs-dot.sup::after{content:"";position:absolute;left:0;top:0;bottom:0;width:50%;'
    +   'background-color:#000;border-top-left-radius:15px;border-bottom-left-radius:15px;}'
    + '#printReport .rs-dot .rs-num{position:absolute;left:0;right:0;top:16px;font-size:6.5pt;'
    +   'text-align:center;font-weight:700;}'
    + '#printReport .rs-legend{font-size:8.5pt;margin:9px 0 0;}'
    + '#printReport .rs-legend .rs-dot{width:11px;height:11px;margin:0 3px 0 0;}'
    + '#printReport .rs-legend .rs-dot.sup::after{border-radius:11px 0 0 11px;}'
    + '#printReport .rs-none{font-size:9.5pt;margin:0;}'
    /* AOG-DD-WORK-V1 — the student's own work on the printed probe */
    + '#printReport .rs-work .rs-h2{font-size:8pt;font-weight:800;letter-spacing:.06em;'
    +   'text-transform:uppercase;margin:11px 0 5px;}'
    + '#printReport .rs-work .rs-note{font-weight:600;letter-spacing:0;text-transform:none;font-style:italic;}'
    + '#printReport .rs-para{font-size:10pt;line-height:1.5;margin:0 0 6px;'
    +   'padding:7px 9px;border-left:2px solid #111;background:#fafafa;'
    +   'white-space:pre-wrap;word-wrap:break-word;}'
    + '#printReport ul.rs-plan{margin:0;padding-left:15px;}'
    + '#printReport ul.rs-plan li{font-size:9.5pt;margin-bottom:2px;}'
    + '#printReport table.rs-rub{width:100%;border-collapse:collapse;}'
    + '#printReport table.rs-rub td{font-size:9.5pt;padding:2px 0;border-bottom:1px dotted #bbb;}'
    + '#printReport table.rs-rub td:last-child{text-align:right;white-space:nowrap;width:60px;}'
    + '#printReport table.rs-ans{width:100%;border-collapse:collapse;table-layout:fixed;}'
    + '#printReport table.rs-ans td{font-size:9pt;padding:3px 0;border-bottom:1px dotted #bbb;'
    +   'vertical-align:top;word-wrap:break-word;}'
    + '#printReport table.rs-ans td.bn{width:38%;padding-right:8px;font-weight:700;}'
    + '#printReport .rs-a{display:inline-block;margin:0 6px 2px 0;padding:0 3px;'
    +   'border-bottom:1px solid #111;}'
    + '#printReport .rs-a.no{text-decoration:line-through;border-bottom-color:#999;}'
    + '#printReport .rs-a.blank{border-bottom-style:dotted;color:#777;}'
    + '#printReport .rs-a.open{border-bottom-style:dashed;}'
    /* AOG-DD-SUPPORT-V1 — the probe grew a box (item-by-item AND the answers),
       and the fixed AOG-PRINTBRAND-V1 footer was landing on top of the last
       line. Give every sheet room for it rather than moving the mark. */
    + '#printReport .rs-key{display:inline-block;margin:0 6px 2px 2px;padding:0 4px;'
    +   'border:1px solid #111;border-radius:3px;font-weight:700;font-size:8.5pt;}'
    + '#printReport ul.rs-says{margin:0;padding-left:15px;}'
    + '#printReport ul.rs-says li{font-size:9.5pt;margin-bottom:3px;}'
    + '#printReport .rs-over{width:100%;border-collapse:collapse;table-layout:fixed;margin-top:3px;}'
    + '#printReport .rs-over td{border:1pt solid #000;padding:5px 7px;vertical-align:top;font-size:9pt;}'
    + '#printReport .rs-over .st{font-size:7.5pt;font-weight:800;letter-spacing:.1em;text-transform:uppercase;}'
    + '#printReport .rs-over .dt{font-size:9pt;border-bottom:.5pt solid #000;height:14px;margin-top:3px;}'
    + '#printReport .rs-over .sc{font-size:14pt;font-weight:800;margin-top:4px;height:19px;font-variant-numeric:tabular-nums;}'
    + '#printReport .rs-sign{width:100%;border-collapse:collapse;margin-top:13px;}'
    + '#printReport .rs-sign td{padding:0 10px 0 0;vertical-align:bottom;font-size:8pt;}'
    + '#printReport .rs-sign .lb{display:block;font-size:7.5pt;font-weight:800;letter-spacing:.1em;text-transform:uppercase;}'
    + '#printReport .rs-sign .rule{display:block;border-bottom:1pt solid #000;height:17px;}'
    + '#printReport .rs-lines div{border-bottom:1pt solid #000;height:20px;}'
    + '#printReport .rs-prov{font-size:8pt;margin:11px 0 0;line-height:1.35;}'
    + '</style>';

  /* the newest row per student+activity+set, so a student who tapped Send
     twice is one sheet and not two */
  function pick(filterFn) {
    var seen = {}, out = [];
    rows().slice().sort(function (a, b) {
      var x = String(a.timestamp || a.date || ""), y = String(b.timestamp || b.date || "");
      return x < y ? -1 : (x > y ? 1 : 0);
    }).forEach(function (r) {
      if (!filterFn(r)) return;
      seen[String(r.studentId) + "|" + String(r.activityId) + "|" + String(r.setNo || 0)] = r;
    });
    Object.keys(seen).forEach(function (k) { out.push(seen[k]); });
    out.sort(function (a, b) {
      var s = String(a.studentId).localeCompare(String(b.studentId));
      if (s) return s;
      var t = String(a.activityId).localeCompare(String(b.activityId));
      if (t) return t;
      return (num(a.setNo) || 0) - (num(b.setNo) || 0);
    });
    return out;
  }

  /* ⚠⚠ .30i5 — AN ACTIVITY NOBODY DID IS NOT A CHOICE. Jimmy: "An activty
     that someone has not done should not show up in the drop down tab. JIMBOB
     THE CREATOR has not down MATCH THE MEANING." This list was built from
     EVERY row in the store, so the moment a second student existed the menu
     offered work the named student had never touched — and the buttons beside
     it then printed that other child's activity under this child's name.
     ⚠ WITH NO STUDENT PICKED IT STILL LISTS EVERYTHING, because "Print that
     activity — every student" is a real, cross-student job. Scope follows the
     chip, and the chip is [[aog-tab-pull-bar]]'s one owned selection. */
  function actList(sid) {
    var seen = {}, out = [];
    rows().forEach(function (r) {
      if (sid && String(r.studentId) !== String(sid)) return;
      var id = String(r.activityId || "");
      if (!id || seen[id]) return;
      seen[id] = 1;
      out.push({ id: id, name: String(r.activityName || id) });
    });
    out.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return out;
  }

  /* ⚠⚠ .30i5 — THE TWO CHOICES LIVE HERE, NOT IN THE DOM. Both <select>s were
     rebuilt from scratch on every render of the print bar, with 25 hard-coded
     as `selected` and the activity falling back to the first one
     alphabetically. Since .30i3 the bar also repaints after an automatic
     pull — so a teacher could pick an activity and a count, have the card
     silently repaint underneath them, and press a button that now meant
     something else. THAT is how "Print a blank class set does not work"
     happens without a single error: it worked, on the wrong activity, or at
     a count nobody chose. Same fault, same fix, as the student `pick`. */
  var pickAct = "", pickCopies = 1   /* ⚠ AOG-PRINT-COUNTS-V1 — WAS 25. A teacher who did not
                       notice the box printed twenty-five copies of a draft.
                       A default that costs paper when it is ignored is the
                       wrong default; one is the safe floor, and the numbers
                       for a whole class are one click away. */;
  /* AOG-DD-CLASSSET-DASH — 0 means "the draft this row ran"; a typed
     number wins until the teacher picks a different activity. */
  var pickDraft = 0;

  /* ══ AOG-DD-CLASSSET-DASH ══════════════════════════════════════════════════
     A Daily Drafts row, and only a Daily Drafts row, names a page that can lay
     out its own questions:  dd-<subject>-g<grade>-s<draft>.
     ⚠ THE SUBJECTS ARE THE ENGINE'S OWN FIVE. Add one there and add it here,
     in the same edit, or the class-set button quietly stops appearing for it. */
  function ddParse(id) {
    /* ⚠ AOG-DD-FREEWRITE-V1 — the letter before the number says WHICH page:
       -s is the assigned draft, -f is a free write. They are different pieces
       of paper at the same number, so the letter has to survive into the link
       or a blank class set of a free write prints the day's prompt instead. */
    /* AOG-DD-LINK-TEN-V1 - all ten subjects; the Foundry's grades are u1..u30. */
    var m = /^dd-(math|ela|write|science|social-studies|spanish|facs|religion|bible|quran|talmud|hindu|buddhist|chinese|cultures|health|economics|foundry|sports|martial|unseen|secrets)-g(K|[1-8]|9-10|11-12|u\d{1,2})-([sf])(\d+)$/.exec(String(id || ""));
    if (!m) return null;
    return { subj: m[1], grade: m[2], free: m[3] === "f", sheet: parseInt(m[4], 10) || 1 };
  }
  /* ⚠ THE FILENAME, NOT /drops — see this patcher's header. key=on is what
     puts the answer key on the end, and it is a TEACHER link by design. */
  function ddClassSetURL(dd, draft, copies) {
    return "daily-drops.html?subject=" + encodeURIComponent(dd.subj)
         + "&grade=" + encodeURIComponent(dd.grade)
         + "&sheet=" + (draft || dd.sheet)
         + (dd.free ? "&free=1" : "")
         + "&key=on&classset=" + copies;
  }


  function paint(list, blank, name) {
    var pr = document.getElementById("printReport");
    if (!pr || !list.length) return 0;
    pr.innerHTML = CSS + list.map(function (r) { return sheetFor(r, blank); }).join("");
    if (realTitle === null) realTitle = document.title;
    document.title = "AoG_" + String(name || "probe").replace(/[^A-Za-z0-9]+/g, "_") + "_" + today();
    /* synchronous inside the click — iOS Safari blocks a print that has left
       the user-gesture chain */
    /* ⚠ NOT ON A TIMER, AND NOT AFTER print() — see AOG-PRINT-HOLD in the
       head. The 400 ms wipe is what printed blank paper on the iPad. */
    aogPrintHold(function () {
      if (realTitle !== null) { document.title = realTitle; realTitle = null; }
      restoreT = 0; pr.innerHTML = "";
    });
    try { window.print(); } catch (e) {}
    return list.length;
  }

  function actOf() {
    var s = document.getElementById("ppActSel");
    var v = s ? String(s.value || "") : "";
    return v || pickAct;
  }
  function copiesOf() {
    var s = document.getElementById("ppCopies");
    var v = s ? parseInt(s.value, 10) : pickCopies;
    if (!v || isNaN(v)) v = pickCopies;
    return Math.max(1, Math.min(40, v));
  }
  function probeSay(msg) {
    var n = document.getElementById("ppMsg");
    if (n) { n.textContent = msg || ""; n.style.color = msg ? "var(--gold-deep,#9a6f24)" : ""; }
  }

  window.aogPrintProbeSheets = function (what, arg) {
    if (what === "student") return paint(pick(function (r) { return String(r.studentId) === String(arg); }), false, arg);
    if (what === "activity") return paint(pick(function (r) { return String(r.activityId) === String(arg); }), false, arg);
    if (what === "all")      return paint(pick(function () { return true; }), false, "everything");
    if (what === "blank") {
      /* ⚠ A BLANK SHEET IS BUILT FROM A REAL ROW — it needs the item count and
         the band names, so it borrows the shape of a row that already exists
         for this activity, from ANY student. */
      var one = pick(function (r) { return String(r.activityId) === String(arg); })[0];
      /* ⚠⚠ IT USED TO `return 0` HERE, SILENTLY. A button that does nothing and
         says nothing is indistinguishable from a broken one, and that is
         exactly the report this build answers. */
      if (!one) {
        probeSay(T("No sheet has arrived for that activity yet, so there is no blank to build from.",
                   "Todavía no ha llegado ninguna hoja de esa actividad, así que no hay nada en blanco que construir."));
        return 0;
      }
      probeSay("");
      var copies = copiesOf();
      var list = [];
      for (var i = 0; i < copies; i++) list.push(one);
      return paint(list, true, "blank_" + arg);
    }
    return 0;
  };

  /* ── the bar. Hooked into AOG-PRACTICE-PRINT-V1's own render so there is
     ONE control panel above the picture and not two. ── */
  window.aogProbeBarHtml = function (sel, all) {
    /* ⚠ SCOPED TO THE PICKED STUDENT. `sel` is the chip AOG-PRACTICE-PRINT-V1
       hands down — the same one naming the two buttons above. */
    var acts = actList(sel);
    if (!acts.length) return "";
    var a0 = pickAct || actOf();
    if (!acts.some(function (a) { return a.id === a0; })) a0 = acts[0].id;
    pickAct = a0;
    var dd = ddParse(a0);
    var h = '<div class="pb-sec"><div class="pb-lb">'
      + esc(T("Question-by-question sheets", "Hojas pregunta por pregunta"))
      + '</div>'
      + '<p class="pb-sub">' + esc(T(
          "A “probe” is one practice sheet a student sent. This prints that sheet showing each question: right on their own, right with a hint, or not yet.",
          "Un “sondeo” es una hoja de práctica que envió un estudiante. Esto imprime esa hoja con cada pregunta: bien solo, bien con pista, o todavía no.")) + '</p>'
      + '<div class="pb-row">'
      + (sel ? '<button type="button" class="pb-go" data-ppsheet="marked" data-ppa="' + esc(sel) + '">'
             + esc(T("Print the marked worksheet", "Imprimir la hoja corregida")) + '</button>' : "")
      + (sel ? '<button type="button" class="pb-go" data-ppsheet="student" data-ppa="' + esc(sel) + '">'
             + esc(T("Print ", "Imprimir ")) + esc(sel) + esc(T("'s probe sheets", " — sus hojas")) + '</button>' : "")
      + '<label class="pb-pick"><span>' + esc(T("Activity", "Actividad")) + '</span>'
      +   '<select id="ppActSel">'
      +   acts.map(function (a) {
            return '<option value="' + esc(a.id) + '"' + (a.id === a0 ? " selected" : "") + '>' + esc(a.name) + '</option>';
          }).join("")
      +   '</select></label>'
      + '<button type="button" data-ppsheet="activity">' + esc(T("Print that activity — every student", "Imprimir esa actividad — todos")) + '</button>'
      + '<button type="button" data-ppsheet="all">' + esc(T("Print everything", "Imprimir todo")) + '</button>'
      + '</div>'
      + '<div class="pb-row pb-row2">'
      + '<label class="pb-pick"><span>' + esc(T("Blank copies", "Copias en blanco")) + '</span>'
      +   '<select id="ppCopies">'
      +   [1, 2, 3, 4, 5, 10, 15, 20, 25, 30].map(function (c) {
            return '<option value="' + c + '"' + (c === pickCopies ? " selected" : "") + '>' + c + '</option>';
          }).join("")
      +   '</select></label>'
      /* ⚠⚠ THE DRAFT ITSELF — only where there is one. dd-<subj>-g<grade>-s<draft>
         is the only activity id that names a page that can lay out questions. */
      + (dd
          ? '<label class="pb-pick"><span>' + esc(T("Draft", "Borrador")) + '</span>'
            + '<input id="ppDraft" type="number" min="1" max="180" value="' + (pickDraft || dd.sheet) + '" inputmode="numeric" style="width:5.2rem">'
            + '</label>'
            + '<button type="button" class="pb-go" data-ppsheet="classset">'
            + esc(T("Print a blank class set", "Imprimir un juego en blanco")) + '</button>'
          : "")
      + '<button type="button" data-ppsheet="blank">' + esc(T("Print blank record sheets", "Imprimir hojas de registro en blanco")) + '</button>'
      + '<span class="pb-note">' + esc(dd ? T(
          "Blank class set: the questions on paper, one page per student, with the answer key at the end.",
          "Juego en blanco: las preguntas en papel, una página por estudiante, con la clave al final.") : T(
          "Blank sheets are the paper version of the same probe — run it with a pencil and fill it in by hand.",
          "Las hojas en blanco son la versión en papel del mismo sondeo — aplícalo con lápiz y complétalo a mano.")) + '</span>'
      /* ⚠ A PLACE FOR THE BUTTON TO SPEAK. Empty until something needs saying. */
      + '<span class="pb-note" id="ppMsg" style="flex:1 0 100%;font-weight:700;"></span>'
      + '</div></div>';
    return h;
  };

  /* ⚠⚠ REMEMBER THE CHOICE AT THE MOMENT IT IS MADE, not at the moment it is
     used — by then the card may have repainted and the <select> may be a
     different element holding a different value. */
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (!t || !t.id) return;
    if (t.id === "ppActSel") {
      pickAct = String(t.value || "");
      /* ⚠ A TYPED DRAFT BELONGS TO THE ACTIVITY IT WAS TYPED FOR. Carrying 42
         from Social Studies into Science reads as a remembered choice and is
         really a stale one — the box goes back to the draft the new row ran. */
      pickDraft = 0;
      probeSay("");
    }
    else if (t.id === "ppCopies") { pickCopies = Math.max(1, Math.min(40, parseInt(t.value, 10) || 1)); }
    else if (t.id === "ppDraft") { pickDraft = Math.max(1, Math.min(180, parseInt(t.value, 10) || 1)); }
  });

  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-ppsheet]") : null;
    if (!t) return;
    var bar = document.getElementById("aogPracticePrintBar");
    if (!bar || !bar.contains(t)) return;
    var what = t.getAttribute("data-ppsheet");
    var arg = t.getAttribute("data-ppa") || actOf();
    if (what === "classset") {
      /* the draft is laid out by the page that owns the questions */
      var dd = ddParse(pickAct || actOf());
      if (!dd) { probeSay(T("That activity has no printable draft.", "Esa actividad no tiene borrador imprimible.")); return; }
      var url = ddClassSetURL(dd, pickDraft, pickCopies);
      /* ⚠ synchronous inside the click — a popup outside the gesture chain is blocked */
      /* ⚠ NO "noopener" FEATURE STRING. With it window.open RETURNS NULL by
         spec, so the check below reported every successful tab as blocked —
         and this is our own same-origin page, not an outside link. */
      var w = null;
      try { w = window.open(url, "_blank"); } catch (e) {}
      if (!w) probeSay(T("Your browser blocked the new tab. Allow pop-ups for this site, or open it yourself: ",
                         "Tu navegador bloqueó la pestaña. Permite ventanas emergentes o ábrela tú: ") + url);
      else probeSay("");
      return;
    }
    if (what === "marked") {
      /* AOG-DD-REVIEW-V1 — Jimmy: "the printout of the problems with the right answers in green or
         red." The drafts page rebuilds the exact sheet (same grade + sheet number = same problems),
         lays the row's answers over it, marks it, and prints. One tab per probe the student sent on
         the picked activity, newest first. */
      var dd2 = ddParse(pickAct || actOf());
      if (!dd2) { probeSay(T("That activity has no worksheet to rebuild.", "Esa actividad no tiene hoja que reconstruir.")); return; }
      var mine = pick(function (r) { return String(r.studentId) === String(arg) && String(r.activityId) === String(pickAct || actOf()); })
        .filter(function (r) { var x = extraOf(r); return Object.prototype.toString.call(x.answers) === "[object Array]" && x.answers.length; });
      if (!mine.length) { probeSay(T("No probe with answers has arrived for that student on this activity yet.", "Todavía no ha llegado ningún sondeo con respuestas de ese estudiante en esta actividad.")); return; }
      mine.sort(function (a, b) { return (num(b.setNo) || 0) - (num(a.setNo) || 0); });
      var opened = 0;
      mine.slice(0, 6).forEach(function (r) {
        var x = extraOf(r);
        var rv = { who: String(r.studentId), date: String(r.date || r.timestamp || "").slice(0, 10),
                   a: x.answers.map(function (bx) { return (bx && bx.a ? bx.a : []).map(function (it) { return it && typeof it === "object" ? String(it.g == null ? "" : it.g) : String(it == null ? "" : it); }); }) };
        var b64 = btoa(unescape(encodeURIComponent(JSON.stringify(rv)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        var url = "daily-drops.html?subject=" + encodeURIComponent(x.subject || dd2.subj)
                + "&grade=" + encodeURIComponent(x.grade || dd2.grade)
                + "&sheet=" + encodeURIComponent(x.sheet || r.setNo || dd2.sheet)
                + (x.lang === "es" ? "&lang=es" : "")
                + "&review=" + b64 + "&print=1";
        var w = null;
        try { w = window.open(url, "_blank"); } catch (eW) {}
        if (w) opened++;
      });
      probeSay(opened ? "" : T("Your browser blocked the new tab. Allow pop-ups for this site and try again.", "Tu navegador bloqueó la pestaña. Permite ventanas emergentes e inténtalo de nuevo."));
      return;
    }
    window.aogPrintProbeSheets(what, arg);
  });
})();
