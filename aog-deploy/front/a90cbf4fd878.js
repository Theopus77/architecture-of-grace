
/* =====================================================================
   ONE STUDENT, ONE STORY   ·   handoff v3 §13 (and v1/v2 §7 before it)
   =====================================================================

   Three handoffs in a row asked for this and all three were right. A
   student's record is split across three doors — check-ins and reflections
   under Students, slips under Exit Slip, goals under IEP — so the adult who
   wants the whole picture of one child has to remember to visit three
   screens and hold the answer in their head.

   ⚠ IT IS READ-ONLY AND IT REBUILDS NOTHING. No new store, no new schema,
   no second copy of any engine. Every number here is read through the module
   that owns it:

       exit slips  →  window.AOGExitStudent.forStudent / matrix   (its rules:
                      sorted by total mentions, never by how often it was the
                      hard one; two marks are two questions, not two ends of
                      a scale)
       goals       →  window.AOGIepRead.goalsFor / signal / sigWord / sigWhy
                      (four conservative states, none read off one point)
       home        →  window.AOGHome.cfg / obs
       reflections
       + check-ins →  window.AOGNotice.history, which already had them

   A second implementation is a second place for a rule to stop being true.
   That is the argument that widened AOGExitView for the exit-slip student
   door, and it is why AOGIepRead exists at all.

   ⚠ THE TEACHER-ONLY GATE. buildHomeReport's second argument is the
   self/child flag. This card returns the report UNTOUCHED when it is true.
   A student opening their own results, or a family in Family Mode, must
   never find an IEP goal, a progress signal, or an adult's gathering of
   their record staring back at them. Asserted both ways in t92.

   ⚠ IT IS A MAP, NOT A DUPLICATE. Each lens says how much is there and
   opens the door where it actually lives. It deliberately does NOT redraw
   the exit-slip matrix or the IEP chart — a second chart of the same data,
   drawn by different code, is how two screens start disagreeing.
   ===================================================================== */
(function () {
  "use strict";

  function T(en, es) { try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; } }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }
  function el(id) { return document.getElementById(id); }
  function jload(k, fb) { try { return JSON.parse(localStorage.getItem(k) || "") || fb; } catch (e) { return fb; } }
  function shortD(iso) {
    var p = String(iso || "").slice(0, 10).split("-");
    return p.length === 3 ? (parseInt(p[1], 10) + "/" + parseInt(p[2], 10)) : String(iso || "");
  }
  function span(a, b) {
    if (!a) return "";
    return a === b ? shortD(a) : (shortD(a) + " – " + shortD(b));
  }

  /* ---------------------------------------------------------------
     THE FOUR LENSES. Counts only — each one opens the door that owns it.
     --------------------------------------------------------------- */

  function checkinCount(sid) {
    var days = (jload("aog.checkin.student.v1", {}).logs || {})[sid] || {};
    var n = 0, last = "";
    Object.keys(days).sort().forEach(function (d) {
      n += (days[d] || []).length;
      last = d;
    });
    return { n: n, last: last };
  }

  function turninCount(sid) {
    try {
      var a = JSON.parse(localStorage.getItem("aog.practice.remote") || "[]");
      if (Object.prototype.toString.call(a) !== "[object Array]") return { n: 0, last: "" };
      var want = String(sid).trim().toLowerCase();
      var n = 0, last = "";
      a.forEach(function (r) {
        if (!r || String(r.studentId || "").trim().toLowerCase() !== want) return;
        n++;
        var d = String(r.date || r.timestamp || "").slice(0, 10);
        if (d > last) last = d;
      });
      return { n: n, last: last };
    } catch (e) { return { n: 0, last: "" }; }
  }

  function reflectionCount(sid) {
    try {
      var all = ((typeof getAllRecords === "function" ? getAllRecords() : []) || [])
        .filter(function (r) {
          return r && String(r.studentId || "").trim().toLowerCase() === String(sid).toLowerCase()
                 && r.context !== "home";
        });
      all.sort(function (a, b) { return String(a.date || a.timestamp) < String(b.date || b.timestamp) ? -1 : 1; });
      var lastR = all.length ? all[all.length - 1] : null;
      return { n: all.length, last: lastR ? String(lastR.date || lastR.timestamp || "").slice(0, 10) : "" };
    } catch (e) { return { n: 0, last: "" }; }
  }

  function slipsFor(sid) {
    try {
      if (!window.AOGExitStudent || typeof window.AOGExitStudent.forStudent !== "function") return null;
      return window.AOGExitStudent.forStudent(sid);
    } catch (e) { return null; }
  }

  function goalsFor(sid) {
    try {
      if (!window.AOGIepRead || typeof window.AOGIepRead.goalsFor !== "function") return [];
      return (window.AOGIepRead.goalsFor(sid) || []).filter(function (r) { return r.g && !r.g.archived; });
    } catch (e) { return []; }
  }

  /* Home observations for a goal, if a family was ever connected to it.
     ⚠ §14's rule: home and school are two labeled sources on ONE goal and
     are never added into a single number. The line prints both, named. */
  function homeCount(goalId) {
    try {
      if (!window.AOGHome || typeof window.AOGHome.cfg !== "function") return 0;
      var c = window.AOGHome.cfg(goalId);
      if (!c || !c.key) return 0;
      return (window.AOGHome.obs(c.key) || []).length;
    } catch (e) { return 0; }
  }

  /* ---------------------------------------------------------------
     IN CLASS. Borrowed wholesale from the exit-slip student door so the
     two screens cannot disagree about which classes came up.
     --------------------------------------------------------------- */
  function classLines(rows) {
    try {
      if (!window.AOGExitStudent || typeof window.AOGExitStudent.matrix !== "function") return [];
      var m = window.AOGExitStudent.matrix(rows) || { classes: [] };
      return (m.classes || []).slice(0, 4).map(function (c) {
        var fav = 0, hard = 0;
        rows.forEach(function (r) {
          if (String(r.favClass || "").trim() === c) fav++;
          if (String(r.hardClass || "").trim() === c) hard++;
        });
        return { c: c, fav: fav, hard: hard };
      });
    } catch (e) { return []; }
  }

  function dayWords(rows) {
    return rows.map(function (r) { return String(r.dayWord || "").trim(); })
               .filter(function (w) { return w; })
               .slice(-8);
  }

  /* ---------------------------------------------------------------
     CSS. ⚠ --navy is an INK for a light ground and --cream is a GROUND for
     dark ink; neither is remapped for dark. Every use of either has an
     override at the end of this block. Same bug, same discipline.
     --------------------------------------------------------------- */
  function injectCss() {
    if (el("aog-story-css")) return;
    var s = document.createElement("style");
    s.id = "aog-story-css";
    s.textContent = [
      "#aogStoryCard{border:1px solid var(--rule,#E4DAC5);border-left:4px solid var(--aog-dusk,#6E7FA6);border-radius:14px;background:var(--card,#fff);padding:19px 21px;margin:0 0 18px;}",
      "#aogStoryCard .ost-lbl{font-size:10.5px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:var(--aog-dusk,#5c6c92);margin:0 0 3px;}",
      "#aogStoryCard .ost-lead{font-family:var(--font-serif,Georgia,serif);font-size:18px;line-height:1.35;font-weight:600;color:var(--navy,#0A1E33);margin:0 0 14px;}",
      "#aogStoryCard .ost-lenses{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 4px;}",
      "#aogStoryCard .ost-lens{flex:1 1 150px;min-width:0;border:1px solid var(--rule-soft,#EFE8DA);border-radius:11px;padding:10px 12px;}",
      "#aogStoryCard .ost-lens .n{font-size:22px;font-weight:800;color:var(--navy,#0A1E33);line-height:1.1;font-variant-numeric:tabular-nums;}",
      "#aogStoryCard .ost-lens .k{font-size:12.5px;font-weight:700;color:var(--ink,#22303F);margin-top:1px;}",
      "#aogStoryCard .ost-lens .w{font-size:11px;line-height:1.5;color:var(--ink-faint,#8A92A6);font-weight:600;margin-top:3px;}",
      "#aogStoryCard .ost-sec{border-top:1px solid var(--rule-soft,#EFE8DA);padding-top:13px;margin-top:15px;}",
      /* ⚠ CAPPED, OR THE MARK STOPS BELONGING TO THE CLASS. The count is
         right-aligned so the marks form a column a teacher can scan, but on
         a 1050px card that put "○ 3" nearly 900px from the word "Math" and
         the pairing had to be re-found on every row. The column survives;
         the distance does not. */
      "#aogStoryCard .ost-row{display:flex;align-items:baseline;gap:10px;padding:6px 0;max-width:460px;}",
      "#aogStoryCard .ost-cls{font-size:14.5px;color:var(--ink,#22303F);flex:1 1 auto;min-width:0;}",
      "#aogStoryCard .ost-mk{font-size:12.5px;font-weight:700;color:var(--ink-soft,#5b6675);white-space:nowrap;font-variant-numeric:tabular-nums;}",
      "#aogStoryCard .ost-words{font-size:13.5px;line-height:1.7;color:var(--ink-soft,#5b6675);margin:7px 0 0;}",
      "#aogStoryCard .ost-words b{font-weight:700;color:var(--ink,#22303F);}",
      "#aogStoryCard .ost-goal{border:1px solid var(--rule-soft,#EFE8DA);border-radius:11px;padding:11px 13px;margin:0 0 8px;}",
      "#aogStoryCard .ost-goal:last-of-type{margin-bottom:0;}",
      "#aogStoryCard .ost-area{display:inline-block;font-size:9.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-soft,#5b6675);border:1px solid var(--rule,#E4DAC5);border-radius:999px;padding:2px 8px;margin-bottom:5px;}",
      "#aogStoryCard .ost-gt{font-size:14.5px;line-height:1.45;color:var(--ink,#22303F);margin:0 0 5px;}",
      "#aogStoryCard .ost-sig{font-size:13px;font-weight:800;color:var(--navy,#0A1E33);}",
      "#aogStoryCard .ost-why{font-size:12px;line-height:1.55;color:var(--ink-soft,#5b6675);margin:2px 0 0;}",
      "#aogStoryCard .ost-src{font-size:11.5px;font-weight:700;color:var(--ink-faint,#8A92A6);margin-top:4px;}",
      "#aogStoryCard .ost-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px;}",
      "#aogStoryCard .ost-btn{font:inherit;font-size:12.5px;font-weight:700;color:var(--navy,#0A1E33);background:transparent;border:1px solid var(--rule,#E4DAC5);border-radius:999px;padding:8px 15px;cursor:pointer;}",
      "#aogStoryCard .ost-btn:hover{opacity:.85;}",
      "#aogStoryCard .ost-btn:focus-visible{outline:2px solid var(--gold,#D9A33B);outline-offset:2px;}",
      "#aogStoryCard .ost-note{font-size:11.5px;line-height:1.6;color:var(--ink-faint,#8A92A6);margin:7px 0 0;}",
      "#aogStoryCard .ost-foot{font-size:11.5px;line-height:1.6;color:var(--ink-faint,#8A92A6);margin:15px 0 0;padding-top:10px;border-top:1px solid var(--rule-soft,#EFE8DA);}",
      "@media (max-width:560px){#aogStoryCard{padding:15px 14px;}#aogStoryCard .ost-lens{flex:1 1 100%;}}",
      "@media print{#aogStoryCard .ost-acts{display:none;}}",
      ":root[data-theme=\"dark\"] #aogStoryCard .ost-lead,",
      ":root[data-theme=\"dark\"] #aogStoryCard .ost-lens .n,",
      ":root[data-theme=\"dark\"] #aogStoryCard .ost-sig,",
      ":root[data-theme=\"dark\"] #aogStoryCard .ost-btn{color:var(--ink,#ECE5D6);}",
      ":root[data-theme=\"dark\"] #aogStoryCard .ost-lbl{color:var(--aog-dusk,#9BAAD0);}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ---------------------------------------------------------------
     BUILD
     --------------------------------------------------------------- */
  function lens(n, kind, where) {
    return '<div class="ost-lens"><div class="n">' + n + "</div>" +
           '<div class="k">' + esc(kind) + "</div>" +
           '<div class="w">' + esc(where) + "</div></div>";
  }

  function cardHtml(sid, grade) {
    var ci = checkinCount(sid);
    var rf = reflectionCount(sid);
    var xs = slipsFor(sid);
    var gl = goalsFor(sid);
    var ti = turninCount(sid);
    var xn = xs ? xs.n : 0;

    var html = '<div id="aogStoryCard">' +
      '<p class="ost-lbl">' + esc(T("One student, one story", "Un estudiante, una historia")) + "</p>" +
      /* ⚠ IT MUST BE TRUE WITH THREE ZEROES ON IT. The first wording said the
         record was "gathered from the four places it lives", which overclaims
         on the very common case — a student with reflections and nothing else,
         which is what every teacher sees in week one. Naming the four places
         is true either way, and on an empty card it quietly tells a teacher
         the other three exist. */
      '<p class="ost-lead">' + esc(
        T("Everything this device holds about " + sid + " — reflections, check-ins, exit slips, goals and turn-ins, in one place.",
          "Todo lo que este dispositivo tiene sobre " + sid + " — reflexiones, registros, boletas de salida, metas y entregas, en un solo lugar.")) +
      "</p>";

    html += '<div class="ost-lenses">' +
      lens(rf.n, T("reflections", "reflexiones"),
           rf.n ? T("latest " + shortD(rf.last) + " · the report below", "última " + shortD(rf.last) + " · el informe abajo")
                : T("none yet", "ninguna todavía")) +
      lens(ci.n, T("check-ins", "registros"),
           ci.n ? T("latest " + shortD(ci.last) + " · History above", "último " + shortD(ci.last) + " · Historial arriba")
                : T("none yet", "ninguno todavía")) +
      lens(xn, T("exit slips", "boletas de salida"),
           xn ? span(xs.from, xs.to) : T("none yet", "ninguna todavía")) +
      lens(gl.length, T("goals", "metas"),
           gl.length ? T("IEP Progress", "Progreso del IEP") : T("none on this device", "ninguna en este dispositivo")) +
      lens(ti.n, T("turn-ins", "entregas"),
           ti.n ? T("latest " + shortD(ti.last) + " · the Turn-ins inbox", "última " + shortD(ti.last) + " · la bandeja de entregas")
                : T("none yet", "ninguna todavía")) +
      "</div>";

    /* ---- TURN-INS ---- */
    if (ti.n) {
      html += '<div class="ost-sec"><p class="ost-lbl">' + esc(T("Turn-ins", "Entregas")) + "</p>" +
        '<p class="ost-note">' + esc(
          T("FINISHED work from the worksheets, the workbook and the practice pages. The full answers live in the Turn-ins inbox.",
            "Trabajos FINISHED de las hojas, el cuaderno y las páginas de práctica. Las respuestas completas viven en la bandeja de entregas.")) + "</p>" +
        '<div class="ost-acts"><a class="ost-btn" href="/turnins" style="text-decoration:none;display:inline-block;">' +
        esc(T("Open the Turn-ins inbox", "Abrir la bandeja de entregas")) + "</a></div></div>";
    }

    /* ---- IN CLASS ---- */
    if (xn) {
      var lines = classLines(xs.rows);
      var words = dayWords(xs.rows);
      html += '<div class="ost-sec">' +
        '<p class="ost-lbl">' + esc(T("In class", "En clase")) + "</p>";
      if (lines.length) {
        html += lines.map(function (L) {
          var parts = [];
          if (L.fav) parts.push("● " + L.fav);
          if (L.hard) parts.push("○ " + L.hard);
          return '<div class="ost-row"><span class="ost-cls">' + esc(L.c) + "</span>" +
                 '<span class="ost-mk">' + esc(parts.join("  ")) + "</span></div>";
        }).join("");
        /* ⚠ The key says out loud that these are TWO QUESTIONS, not two ends
           of a scale. Without it ● reads as good and ○ reads as bad, and the
           card becomes a problem list about a child. */
        html += '<p class="ost-note">' + esc(
          T("● the class they enjoyed most · ○ the class they found most challenging — two questions, not two ends of a scale. A picture of repetition, not of progress: there is no score in an exit slip.",
            "● la clase que más disfrutaron · ○ la que les resultó más difícil — dos preguntas, no dos extremos de una escala. Una imagen de repetición, no de progreso: no hay puntaje en una boleta de salida.")) +
          "</p>";
      }
      if (words.length) {
        html += '<p class="ost-words">' + esc(T("How they described the day: ", "Cómo describieron el día: ")) +
          "<b>" + words.map(esc).join(" · ") + "</b>" + "</p>" +
          '<p class="ost-note">' + esc(T("Their own word, oldest first — the last one is the most recent. A perception, never a measurement, and never averaged.",
                                         "Su propia palabra, de la más antigua a la más reciente — la última es la más reciente. Una percepción, nunca una medición, y nunca promediada.")) + "</p>";
      }
      html += '<div class="ost-acts"><button class="ost-btn" type="button" id="ostExit" data-sid="' + esc(sid) + '">' +
        esc(T("Open their exit slips", "Abrir sus boletas de salida")) + "</button></div></div>";
    }

    /* ---- GOALS ---- */
    if (gl.length) {
      var R = window.AOGIepRead;
      html += '<div class="ost-sec"><p class="ost-lbl">' + esc(T("Goals", "Metas")) + "</p>";
      html += gl.slice(0, 4).map(function (row) {
        var g = row.g, pts = row.pts || [];
        var used = pts;
        try { used = (R.periodSplit(g, pts) || {}).used || pts; } catch (e) {}
        var sg = null;
        try { sg = R.signal(g, used, R.dayNum(new Date().toISOString().slice(0, 10))); } catch (e2) {}
        var word = "", why = "";
        try { word = R.sigWord(sg && sg.k); why = R.sigWhy(sg) || ""; } catch (e3) {}
        var area = "";
        try { area = R.areaLabel(g.area) || ""; } catch (e4) {}
        var last = pts.length ? String(pts[pts.length - 1].date || "") : "";
        var hn = homeCount(row.id);

        var out = '<div class="ost-goal">';
        if (area) out += '<span class="ost-area">' + esc(area) + "</span>";
        out += '<p class="ost-gt">' + esc(String(g.title || T("Untitled goal", "Meta sin título"))) + "</p>";
        if (word) out += '<span class="ost-sig">' + esc(word) + "</span>";
        if (why) out += '<p class="ost-why">' + esc(why) + "</p>";
        /* ⚠ TWO SOURCES, NAMED, NEVER ADDED TOGETHER. §14. */
        out += '<p class="ost-src">' + esc(
          hn ? T("School " + pts.length + " · Home " + hn, "Escuela " + pts.length + " · Casa " + hn)
             : T(pts.length === 1 ? "1 measurement" : pts.length + " measurements",
                 pts.length === 1 ? "1 medición" : pts.length + " mediciones")) +
          (last ? esc(T(" · last " + shortD(last), " · última " + shortD(last))) : "") + "</p>";
        return out + "</div>";
      }).join("");
      if (gl.length > 4) {
        html += '<p class="ost-note">' + esc(T((gl.length - 4) + " more in IEP Progress.",
                                               (gl.length - 4) + " más en Progreso del IEP.")) + "</p>";
      }
      /* §29 — the standing sentence, in the words the rest of the product uses. */
      html += '<p class="ost-note">' + esc(
        T("The signal describes a record, never a child, and it is never read off a single point. The number tells you where to begin; the adult decides what it means.",
          "La señal describe un registro, nunca a un estudiante, y nunca se lee de un solo punto. El número te dice por dónde empezar; el adulto decide qué significa.")) + "</p>";
      html += '<div class="ost-acts"><button class="ost-btn" type="button" id="ostIep">' +
        esc(T("Open IEP Progress", "Abrir Progreso del IEP")) + "</button></div></div>";
    }

    html += '<p class="ost-foot">' + esc(
      T("Read-only. Nothing here is new data and nothing here was recalculated — it is the same record, gathered, and each count opens the door that owns it.",
        "Solo lectura. Nada aquí es un dato nuevo ni fue recalculado — es el mismo registro, reunido, y cada conteo abre la puerta que lo contiene.")) +
      "</p></div>";

    return html;
  }

  function wire(sid) {
    var x = el("ostExit");
    if (x) x.addEventListener("click", function () {
      try { if (window.AOGExitStudent && window.AOGExitStudent.select) window.AOGExitStudent.select(sid); } catch (e) {}
      try { if (typeof window.aogQsTab === "function") { window.aogQsTab("exitslip"); return; } } catch (e2) {}
      try { var b = document.querySelector('#screen-admin .tab[data-tab="exitslip"]'); if (b) b.click(); } catch (e3) {}
    });
    var i = el("ostIep");
    if (i) i.addEventListener("click", function () {
      try { if (typeof window.aogQsTab === "function") { window.aogQsTab("iep"); return; } } catch (e) {}
      try { var b = document.querySelector('#screen-admin .tab[data-tab="iep"]'); if (b) b.click(); } catch (e2) {}
    });
  }

  /* ---------------------------------------------------------------
     ATTACH. Same shape as the NOTICE layer's wrapper, with its own flag so
     the two wrappers compose instead of fighting.
     --------------------------------------------------------------- */
  (function attach() {
    function go() {
      if (typeof window.buildHomeReport !== "function" || window.buildHomeReport.__aogStory) return;
      var orig = window.buildHomeReport;
      var wrapped = function (rec, isSelf) {
        var html = orig.apply(this, arguments);
        /* ⚠ THE GATE. A child's own results screen and Family Mode get
           exactly what they got before — no goals, no signal, no gathering. */
        if (isSelf) return html;
        try {
          var sid = String((rec && rec.studentId) || "").trim();
          if (!sid) return html;
          injectCss();
          var extra = cardHtml(sid, rec && rec.grade);
          /* Rendered at the end, then lifted to sit under History — the
             pattern is read first, then the evidence for it, then the rest
             of the record. If History is not there it follows Notice; if
             neither is, it stays where it landed. */
          setTimeout(function () {
            try {
              var card = el("aogStoryCard");
              var anchor = el("aogHistoryCard") || el("aogNoticeCard");
              if (card && anchor && anchor.parentNode) anchor.parentNode.insertBefore(card, anchor.nextSibling);
              wire(sid);
            } catch (e) {}
          }, 0);
          return html + extra;
        } catch (e) { return html; }
      };
      wrapped.__aogStory = true;
      /* ⚠ CARRY THE OTHER LAYERS' FLAGS FORWARD, OR YOU BREAK THEIR GUARD.
         Two blocks now wrap this same function, and each guards against
         double-wrapping by checking its OWN flag on window.buildHomeReport.
         A fresh wrapper carries neither flag, so the layer that wrapped
         FIRST sees an unflagged function on its next retry (the NOTICE
         layer retries at 800 ms and 2400 ms) and wraps a second time —
         after which every teacher report renders the Notice and History
         cards TWICE. Caught in the harness before it shipped: the probe
         showed __aogNotice false on a function the notice layer had
         already wrapped. Copy every __aog* flag off the function being
         wrapped; a third layer then costs nothing. */
      try {
        Object.keys(orig).forEach(function (k) {
          if (k.indexOf("__aog") === 0 && !wrapped[k]) wrapped[k] = orig[k];
        });
      } catch (eF) {}
      window.buildHomeReport = wrapped;
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
    setTimeout(go, 900);
    setTimeout(go, 2600);
  })();

  window.AOGStory = {
    html: cardHtml,
    lenses: function (sid) {
      var xs = slipsFor(sid), gl = goalsFor(sid);
      return { reflections: reflectionCount(sid).n, checkins: checkinCount(sid).n,
               slips: xs ? xs.n : 0, goals: gl.length, turnins: turninCount(sid).n };
    }
  };
})();
