
/* =====================================================================
   ONE DATASET, THREE TOTALS   ·   team review item 10
   =====================================================================

   Three screens report three different numbers off the same records and
   none of them says why:

       Overview        93 reflections · Spring
       Students       279 shown
       Trends         310 responses

   ⚠ ALL THREE ARE CORRECT. Measured on the demo seed: 310 = 279 student
   + 28 done at home + 3 an adult did about themselves, spread across
   Fall, Winter and Spring. 93 is the students in the most recent window
   alone, which is what "the class right now" means. Nothing here is an
   arithmetic bug, and NOT ONE NUMBER IS CHANGED BY THIS BLOCK.

   What was wrong is that only ONE of the three explained itself. Students
   already carried "31 self-reflections are not on this list — one done at
   home, or an adult's own", which is exactly right and is why 279 never
   confused anybody. Overview said "93 reflections" without the word
   student. And Trends said "310 responses" and then described them as
   "this class" — a set that includes three grown-ups' own reflections and
   mixes three windows together.

   ⚠ WHAT THIS DELIBERATELY DOES NOT DO. It does not narrow the Trends
   set. "How everyone's doing" says everyone and means everyone, and its
   figures also drive Growth, Trajectory and the MTSS report; changing
   them would create three NEW disagreements to replace this one. Whether
   the whole Overview should exclude home and adult is a product decision
   for Jimmy, recorded as open — not something a labeling pass gets to
   settle quietly.

   So: say what was counted, and reconcile the three numbers in the one
   place a teacher notices the gap.
   ===================================================================== */
(function () {
  "use strict";

  function el(id) { return document.getElementById(id); }
  function T(en, es) {
    try { if (typeof DT === "function") return DT(en, es); } catch (e) {}
    try { if (typeof dashLang !== "undefined" && dashLang === "es") return es; } catch (e2) {}
    return en;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }

  /* ⚠ THE SAME SET renderStudents USES, ARGUMENT FOR ARGUMENT. Anything
     less and this line would be a fourth number for a teacher to
     reconcile, which is the defect it exists to close. */
  function currentSet() {
    try {
      if (typeof getAllRecords !== "function" || typeof applyFilters !== "function") return null;
      var v = function (id) { var n = el(id); return n ? n.value : ""; };
      return applyFilters(getAllRecords(), {
        window: v("studentFilterWindow"),
        grade:  v("studentFilterGrade"),
        tier:   v("studentFilterTier")
      });
    } catch (e) { return null; }
  }

  function isAdult(r) {
    try { return (typeof aogIsAdultRec === "function") ? aogIsAdultRec(r)
                 : !!(r && (r.population === "adult" || String(r.grade) === "Adult")); }
    catch (e) { return false; }
  }

  function split(rows) {
    var s = 0, h = 0, a = 0, wins = {}, order = [];
    (rows || []).forEach(function (r) {
      if (!r) return;
      if (isAdult(r)) a++;
      else if (r.context === "home") h++;
      else s++;
      var w = r.window || "";
      if (w && !wins[w]) { wins[w] = 1; order.push(w); }
    });
    return { student: s, home: h, adult: a, total: (rows || []).length, windows: order };
  }

  function winWords(list) {
    var lab = list.map(function (w) {
      try { return (typeof winLabel === "function") ? String(winLabel(w)).replace(/\s*\(.*\)$/, "") : w; }
      catch (e) { return w; }
    });
    if (!lab.length) return "";
    if (lab.length === 1) return lab[0];
    return lab.slice(0, -1).join(", ") + T(" and ", " y ") + lab[lab.length - 1];
  }

  function injectCss() {
    if (el("aog-total-css")) return;
    var st = document.createElement("style");
    st.id = "aog-total-css";
    st.textContent = [
      "#aogTotalsScope{font-size:12.5px;line-height:1.7;color:var(--ink-soft,#5b6675);margin:-10px 0 18px;padding:11px 14px;border-left:3px solid var(--rule,#E4DAC5);background:var(--rule-soft,#EFEADB);border-radius:0 8px 8px 0;max-width:74ch;}",
      "#aogTotalsScope b{color:var(--navy,#0A1E33);font-weight:800;font-variant-numeric:tabular-nums;}",
      /* ⚠ THE THIRD TIME THIS EXACT PAIR HAS BITTEN. --ink-faint is legible
         on --card and measures 4.41:1 on --cream, a fail for text this size,
         and this block's ground IS --cream. Same fault as the typed-words
         box in .29j. RULE: nothing on a --cream ground uses --ink-faint. */
      "#aogTotalsScope .ots-rec{display:block;margin-top:5px;color:var(--ink-soft,#5b6675);}",
      ":root[data-theme=\"dark\"] #aogTotalsScope{background:var(--paper,#152331);border-left-color:var(--rule,#2B3B4B);}",
      ":root[data-theme=\"dark\"] #aogTotalsScope b{color:var(--ink,#ECE5D6);}"
    ].join("\n");
    document.head.appendChild(st);
  }

  /* ⚠ "THIS CLASS" IS FALSE OVER A MIXED SET. The domain cards say
     "N% of this class scored in the lower range" while the set can hold a
     parent's and a staff member's own reflection. The ARITHMETIC is fine
     — it is the noun that is wrong — so only the noun changes, and only
     while the set actually is mixed. */
  function fixNoun(mixed) {
    try {
      var host = el("panel-students");
      if (!host) return;
      /* ⚠ THE SUMMARY SENTENCE SAYS IT TOO, and it is the first thing read:
         "Results are mixed across the class" and "a good place to start as
         a class" sit directly above a breakdown saying 28 of these were done
         at home and 3 are a grown-up's own. Same treatment — the noun, never
         the number. Scoped to #panel-students so the Overview's own
         .ov-summary, which really is about a class, is untouched. */
      var cards = host.querySelectorAll(".domain-card, .ov-summary");
      Array.prototype.forEach.call(cards, function (c) {
        var walker = document.createTreeWalker(c, NodeFilter.SHOW_TEXT, null);
        var n;
        while ((n = walker.nextNode())) {
          if (mixed) {
            if (n.nodeValue.indexOf("of this class scored") >= 0)
              n.nodeValue = n.nodeValue.replace("of this class scored", "in this view scored");
            if (n.nodeValue.indexOf("de esta clase puntuó") >= 0)
              n.nodeValue = n.nodeValue.replace("de esta clase puntuó", "en esta vista puntuó");
            if (n.nodeValue.indexOf("across the class") >= 0)
              n.nodeValue = n.nodeValue.replace("across the class", "across this view");
            if (n.nodeValue.indexOf("as a class") >= 0)
              n.nodeValue = n.nodeValue.replace("as a class", "as a group");
            if (n.nodeValue.indexOf("de la clase") >= 0)
              n.nodeValue = n.nodeValue.replace("de la clase", "de esta vista");
            if (n.nodeValue.indexOf("para la clase") >= 0)
              n.nodeValue = n.nodeValue.replace("para la clase", "para el grupo");
          }
        }
      });
    } catch (e) {}
  }

  function render() {
    var host = el("panel-students");
    if (!host) return;
    var sum = host.querySelector(".ov-summary");
    if (!sum) return;
    var rows = currentSet();
    if (!rows) return;
    injectCss();

    var s = split(rows);
    var mixed = (s.home + s.adult) > 0;

    var line = el("aogTotalsScope");
    if (!line) {
      line = document.createElement("p");
      line.id = "aogTotalsScope";
      sum.parentNode.insertBefore(line, sum.nextSibling);
    }

    if (!s.total) { line.innerHTML = ""; return; }

    var parts = [];
    parts.push("<b>" + s.student + "</b> " +
      esc(s.student === 1 ? T("student", "estudiante") : T("students", "estudiantes")));
    if (s.home) parts.push("<b>" + s.home + "</b> " + esc(T("done at home", "hechas en casa")));
    if (s.adult) parts.push("<b>" + s.adult + "</b> " +
      esc(s.adult === 1 ? T("an adult did about themselves", "de un adulto sobre sí mismo")
                        : T("adults did about themselves", "de adultos sobre sí mismos")));

    var w = winWords(s.windows);
    var html = esc(T("What that counts: ", "Qué cuenta eso: ")) + parts.join(" · ") +
      (w ? esc(T(", across ", ", en ") + w) : "") + ".";

    /* The reconciliation — the whole point. A teacher who spots the three
       numbers gets the answer here instead of doubting the product. */
    if (mixed) {
      html += '<span class="ots-rec">' + esc(
        T("Students lists the " + s.student + " student ones only; the rest are under Family & adults. Today’s Picture counts students in the most recent window alone, which is why its number is smaller again. Narrow the filters above to change what this view counts.",
          "Estudiantes muestra solo las " + s.student + " de estudiantes; el resto están en Familias y adultos. La Foto de hoy cuenta solo las de estudiantes de la ventana más reciente, por eso su número es aún menor. Ajusta los filtros de arriba para cambiar lo que cuenta esta vista.")) +
        "</span>";
    } else {
      html += '<span class="ots-rec">' + esc(
        T("All of them are students, so this matches the Students list. Today’s Picture counts the most recent window alone, which is why its number can be smaller.",
          "Todas son de estudiantes, así que coincide con la lista de Estudiantes. La Foto de hoy cuenta solo la ventana más reciente, por eso su número puede ser menor.")) +
        "</span>";
    }
    line.innerHTML = html;
    fixNoun(mixed);
  }

  (function boot() {
    function go() {
      if (typeof window.renderStudents === "function" && !window.renderStudents.__aogTotals) {
        var orig = window.renderStudents;
        var wrapped = function () {
          var r = orig.apply(this, arguments);
          try { render(); } catch (e) {}
          return r;
        };
        wrapped.__aogTotals = true;
        /* Carry the other layers' flags — see #aog-one-story. */
        try {
          Object.keys(orig).forEach(function (k) {
            if (k.indexOf("__aog") === 0 && !wrapped[k]) wrapped[k] = orig[k];
          });
        } catch (eF) {}
        window.renderStudents = wrapped;
      }
      try { render(); } catch (e) {}
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
    setTimeout(go, 900);
    setTimeout(go, 2600);
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest && e.target.closest('.tab[data-tab="students"], .dmode[data-mode="trends"]');
      if (t) setTimeout(go, 220);
    });
    ["studentFilterWindow", "studentFilterGrade", "studentFilterTier"].forEach(function (id) {
      document.addEventListener("change", function (e) {
        if (e.target && e.target.id === id) setTimeout(go, 60);
      });
    });
  })();

  window.AOGTotals = { split: split, set: currentSet, render: render };
})();
