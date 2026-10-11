
/* ═══════════════════════════════════════════════════════════════════════════
   ADDITIONAL EVIDENCE · the student's own account, beside an IEP goal
   Build 2026.08.29au.

   Jimmy: "It is valuable information (additional) as it doesn't live in the IEP
   language."  Both halves of that sentence are the design.

   ⚠ THIS DECORATES FROM OUTSIDE. Nothing in #aog-iep-js is touched, exactly as
   #aog-home-school does it. Delete this block and the monitor is what it was.
   ⚠ NOTHING IS WRITTEN. This block only ever READS.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  function isEs() {
    try { if (typeof dashLang !== "undefined" && dashLang === "es") return true; } catch (e) {}
    return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es";
  }
  function T(en, es) { return isEs() ? es : en; }
  function esc(x) {
    return String(x == null ? "" : x).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function el(id) { return document.getElementById(id); }
  function code(x) { return String(x == null ? "" : x).trim(); }
  function shortD(iso) {
    /* .30cy — slice first: a Sheet-pulled record can carry a full ISO
       timestamp in .date, and "28T07:00:00.000Z" coerces to NaN (the 8/NaN
       Jimmy saw on a goal card). Same family as the 1899 trap. */
    var p = String(iso || "").slice(0, 10).split("-");
    return p.length === 3 ? ((+p[1]) + "/" + (+p[2])) : String(iso || "");
  }

  /* ── the readers. All four already exist; none of them is re-implemented. ── */
  function goalOf(goalId) {
    try { return (window.AOGIepRead.load().goals || {})[goalId] || null; } catch (e) { return null; }
  }
  function scales() {
    try { return window.AOGCheckins.scales || []; } catch (e) { return []; }
  }
  /* ⚠ THE STUDENT'S OWN CHECK-INS ONLY. timelineFor merges the adult daily log
     into the same buckets, and an adult's observation of a child is not the
     child's account of their day — it is already on this card as the daily log.
     respondentRole is the one field that tells them apart. */
  function checkinsFor(sid) {
    var out = [];
    try {
      (window.AOGCheckins.timeline(sid) || []).forEach(function (d) {
        (d.periods || []).forEach(function (p) {
          if (String(p.respondentRole || "") === "student") out.push(p);
        });
      });
    } catch (e) {}
    out.sort(function (a, b) { return String(a.date || "") < String(b.date || "") ? -1 : 1; });
    return out;
  }
  function slipsFor(sid) {
    try { return window.AOGExitStudent.forStudent(sid) || null; } catch (e) { return null; }
  }

  /* ── "most often", never an average ──────────────────────────────────────
     ⚠ THE THREE READINGS ARE NEVER AVERAGED INTO ONE ANOTHER and never into a
     single number. A student can arrive Heavy and be ready to work; that is two
     mornings' worth of information and one number destroys it. The check-in
     module's own comment says so and this obeys it.
     ⚠ AND A TIE IS REPORTED AS A TIE. Picking a winner from 5-and-5 is inventing
     a reading the data does not contain. */
  function mode(rows, key) {
    var n = {}, total = 0;
    rows.forEach(function (r) {
      var v = r[key];
      if (v === "" || v == null) return;
      v = parseInt(v, 10);
      if (!isFinite(v) || v < 1 || v > 5) return;
      n[v] = (n[v] || 0) + 1; total++;
    });
    if (!total) return null;
    var best = 0, keys = Object.keys(n);
    keys.forEach(function (k) { if (n[k] > best) best = n[k]; });
    var top = keys.filter(function (k) { return n[k] === best; }).map(Number).sort(function (a, b) { return a - b; });
    return { top: top, count: best, total: total };
  }
  function wordFor(k, v) {
    var ser = scales().filter(function (x) { return x.k === k; })[0];
    if (!ser || !ser.words) return String(v);
    var arr = isEs() ? (ser.words.es || ser.words.en) : ser.words.en;
    return arr[v - 1] || String(v);
  }
  function labelFor(k) {
    var ser = scales().filter(function (x) { return x.k === k; })[0];
    return ser ? T(ser.en, ser.es) : k;
  }
  function readingLine(rows, k) {
    var m = mode(rows, k);
    if (!m) return "";
    var words = m.top.map(function (v) { return "“" + wordFor(k, v) + "”"; });
    var said = (words.length === 1)
      ? T("most often ", "casi siempre ") + words[0]
      : T("split between ", "repartido entre ") + words.join(T(" and ", " y "));
    return labelFor(k) + " — " + said + " (" + m.count + T(" of ", " de ") + m.total + ")";
  }

  /* ⚠ SAME JOIN AS THE SIBLINGS. aog.practice.remote is the dashboard
     pull's own copy of the Sheet's Practice tab — the Turn-ins inbox reads
     and refreshes the same store, so this panel can never disagree with it. */
  function turninsFor(sid) {
    var a = [];
    try { a = JSON.parse(localStorage.getItem("aog.practice.remote") || "[]"); } catch (e) { a = []; }
    if (Object.prototype.toString.call(a) !== "[object Array]") a = [];
    var out = a.filter(function (r) { return r && code(r.studentId) === sid; });
    out.sort(function (x, y) { return String(x.timestamp || x.date || "").localeCompare(String(y.timestamp || y.date || "")); });
    return out;
  }

  function snapshot(goalId) {
    var g = goalOf(goalId);
    if (!g) return null;
    var sid = code(g.student);
    if (!sid) return null;
    var ci = checkinsFor(sid);
    var sl = slipsFor(sid);
    var tn = turninsFor(sid);
    var tnames = [];
    for (var ti = tn.length - 1; ti >= 0 && tnames.length < 3; ti--) {
      var nm = String(tn[ti].activityName || tn[ti].activityId || "").trim();
      if (nm && tnames.indexOf(nm) < 0) tnames.push(nm);
    }
    var rows = (sl && sl.rows) ? sl.rows : (sl && sl.length ? sl : []);
    var talk = 0;
    ci.forEach(function (r) { if (r.followUp) talk++; });
    var classes = [];
    try {
      var mx = window.AOGExitStudent.matrix(rows) || {};
      classes = (mx.classes || []).slice(0, 3);
    } catch (e) {}
    return {
      sid: sid,
      ci: { n: ci.length, from: ci.length ? ci[0].date : "", to: ci.length ? ci[ci.length - 1].date : "", rows: ci, talk: talk },
      slips: { n: rows.length, from: rows.length ? rows[0].date : "", to: rows.length ? rows[rows.length - 1].date : "", classes: classes },
      tins: { n: tn.length, from: tn.length ? (tn[0].date || "") : "", to: tn.length ? (tn[tn.length - 1].date || "") : "", names: tnames }
    };
  }

  function span(a, b) {
    if (!a) return "";
    return " · " + shortD(a) + (b && b !== a ? T(" to ", " a ") + shortD(b) : "");
  }

  /* ── the sentence that has to be on both the screen and the paper ───────── */
  function caveat() {
    return T(
      "This is the student’s own account of their school day, collected on a different instrument and in their own words. It is additional context for the team. It is not progress-monitoring data for this goal, it is not measured against the aimline, it is never added to the measurements above, and nothing here determines whether a goal has been met.",
      "Este es el relato del propio estudiante sobre su día escolar, recogido con otro instrumento y en sus propias palabras. Es contexto adicional para el equipo. No son datos de monitoreo de progreso de esta meta, no se miden contra la línea objetivo, nunca se suman a las mediciones de arriba y nada aquí determina si una meta se ha cumplido.");
  }

  /* ═════════════════════════════════════════════════ THE SCREEN */
  /* ═════════════════════════════════════════════ A CODE THAT MATCHES NOTHING
     Build 2026.08.29aw.

     ⚠ THE SILENCE WAS THE BUG. Returning an empty string is RIGHT when the code
     is one the building knows and nothing has been logged against it yet. It is
     WRONG when the code matches nothing anywhere, because then the missing panel
     is not a fact about the child - it is a fact about a typo, rendered as if it
     were a finding. Same class as the support link with no grade that silently
     claimed 6-8. [[aog-grade-bands]]

     ⚠ SCREEN ONLY. aogIepEvidenceBlock - the paper - is deliberately NOT given
     this. A printed IEP page is the record; check-this-code is a note to the
     author of the goal and has no business on it.

     ⚠ AND IT STATES NOTHING. It says what was looked for, what exists, and asks
     one question. Deciding that two codes are one child is the teacher's call,
     and this block has never written anything. */
  function unknownCountLine(c) {
    var n;
    try { n = window.AOGStudent.counts(c) || {}; } catch (e) { return String(c); }
    var bits = [];
    if (n.checkin) bits.push(n.checkin + T(n.checkin === 1 ? " day of check-ins" : " days of check-ins",
                                           n.checkin === 1 ? " día de registros" : " días de registros"));
    if (n.exit) bits.push(n.exit + T(n.exit === 1 ? " day of exit slips" : " days of exit slips",
                                     n.exit === 1 ? " día de boletas" : " días de boletas"));
    if (n.daily) bits.push(n.daily + T(n.daily === 1 ? " day in the daily log" : " days in the daily log",
                                       n.daily === 1 ? " día en el registro diario" : " días en el registro diario"));
    return String(c) + (bits.length ? (" (" + bits.join(", ") + ")") : "");
  }

  function unknownHtml(sid) {
    var all;
    try { all = window.AOGStudent.codes() || []; } catch (e) { return ""; }
    /* ⚠ WITH NOTHING COLLECTED ANYWHERE this banner would sit on every goal in
       the caseload and would be telling the teacher about an empty app rather
       than about a code. A warning that is always on is furniture. */
    if (!all.length) return "";
    try { if (window.AOGStudent.known(sid)) return ""; } catch (e) { return ""; }

    var sug = [];
    try { sug = window.AOGStudent.near(sid, all) || []; } catch (e) {}

    var h = '<div class="iepev iepev-unknown"><h4>' +
      esc(T("Check the student code", "Revisa el código del estudiante")) + "</h4>" +
      '<div class="iepev-row"><span class="iepev-src">' +
        esc(T("This goal says", "Esta meta dice")) + "</span>" +
        '<span class="iepev-what"><strong>' + esc(sid) + "</strong> — " +
        esc(T("nothing has been recorded under that code: no check-ins, no exit slips, no turn-ins, no class list and no home check-ins.",
              "no hay nada guardado con ese código: ni registros, ni boletas de salida, ni entregas, ni lista de clase, ni registros de casa.")) +
        "</span></div>";

    if (sug.length) {
      h += '<div class="iepev-row"><span class="iepev-src">' +
        esc(T("Codes in use that look close", "Códigos en uso que se parecen")) + "</span>" +
        '<span class="iepev-what">' + sug.map(function (c) { return esc(unknownCountLine(c)); }).join("<br>") +
        "<br>" + esc(T("Is one of these the same student?", "¿Alguno de estos es el mismo estudiante?")) +
        "</span></div>";
    } else {
      h += '<div class="iepev-row"><span class="iepev-src">' +
        esc(T("If this code is new", "Si el código es nuevo")) + "</span>" +
        '<span class="iepev-what">' +
        esc(T("That is expected. Evidence will appear here once something is recorded under it.",
              "Es lo esperado. La evidencia aparecerá aquí cuando se registre algo con ese código.")) +
        "</span></div>";
    }

    return h + '<div class="iepev-note">' +
      esc(T("The goal and its measurements are not affected. This panel gathers additional evidence by matching the code exactly, so a code differing by so much as a full stop finds nothing.",
            "La meta y sus mediciones no se ven afectadas. Este panel reúne evidencia adicional emparejando el código exactamente, así que un código que difiera aunque sea en un punto no encuentra nada.")) +
      "</div></div>";
  }

  function evHtml(goalId) {
    var s = snapshot(goalId);
    if (!s) return "";
    if (!s.ci.n && !s.slips.n && !s.tins.n) return unknownHtml(s.sid);

    var lines = ["arrival", "readiness", "connection"]
      .map(function (k) { return readingLine(s.ci.rows, k); })
      .filter(function (x) { return x; });

    var ciWhat = s.ci.n
      ? (s.ci.n + T(s.ci.n === 1 ? " check-in" : " check-ins", s.ci.n === 1 ? " registro" : " registros") + span(s.ci.from, s.ci.to) + ".")
      : T("None yet.", "Ninguno todavía.");

    var slWhat = s.slips.n
      ? (s.slips.n + T(s.slips.n === 1 ? " slip" : " slips", s.slips.n === 1 ? " boleta" : " boletas") + span(s.slips.from, s.slips.to)
         + (s.slips.classes.length ? (T(" · named most often: ", " · mencionó más: ") + s.slips.classes.join(" · ")) : "") + ".")
      : T("None yet.", "Ninguna todavía.");

    var tinWhat = s.tins.n
      ? (s.tins.n + T(s.tins.n === 1 ? " turn-in" : " turn-ins", s.tins.n === 1 ? " entrega" : " entregas") + span(s.tins.from, s.tins.to)
         + (s.tins.names.length ? (T(" · latest: ", " · más recientes: ") + s.tins.names.join(" · ")) : "") + ".")
      : T("None yet.", "Ninguna todavía.");

    return '<div class="iepev"><h4>' +
        esc(T("Additional evidence — not IEP data", "Evidencia adicional — no son datos del IEP")) + "</h4>" +
      '<div class="iepev-row"><span class="iepev-src">' + esc(T("Daily check-ins", "Registros diarios")) + "</span>" +
        '<span class="iepev-what">' + esc(ciWhat) +
        (lines.length ? ('<br>' + lines.map(esc).join("<br>")) : "") +
        (s.ci.talk ? ('<br>' + esc(T("Asked to talk: ", "Pidió hablar: ") + s.ci.talk)) : "") +
        "</span></div>" +
      '<div class="iepev-row"><span class="iepev-src">' + esc(T("Exit slips", "Boletas de salida")) + "</span>" +
        '<span class="iepev-what">' + esc(slWhat) + "</span></div>" +
      '<div class="iepev-row"><span class="iepev-src">' + esc(T("Turn-ins", "Entregas")) + "</span>" +
        '<span class="iepev-what">' + esc(tinWhat) +
        (s.tins.n ? ('<br><a href="/turnins">' + esc(T("Read every turn-in, answers included, in the inbox →",
                                                       "Lee cada entrega, con respuestas, en la bandeja →")) + "</a>") : "") +
        "</span></div>" +
      '<div class="iepev-note">' + esc(caveat()) + "</div></div>";
  }

  /* ═════════════════════════════════════════════════ THE PAPER
     ⚠ INLINE LIGHT HEX, NEVER A TOKEN. The print window has its own stylesheet
     and its own light palette; a var(--ink) here resolves to nothing and the
     text renders black-on-black or not at all. Same rule the home-school paper
     block and the printed chart already keep. [[aog-iep-chart]] */
  window.aogIepEvidenceBlock = function (goalId, es) {
    var s = snapshot(goalId);
    if (!s) return "";
    if (!s.ci.n && !s.slips.n && !s.tins.n) return "";
    function E(x) {
      return String(x == null ? "" : x).replace(/[&<>"]/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
      });
    }
    var was = isEs;
    /* the caller decides the language of a printed page, not the document */
    isEs = function () { return !!es; };
    var out;
    try {
      var lines = ["arrival", "readiness", "connection"]
        .map(function (k) { return readingLine(s.ci.rows, k); })
        .filter(function (x) { return x; });
      var LB = "font-size:9.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#46506E;";
      var ROW = "display:flex;gap:12px;align-items:baseline;padding:8px 0;border-top:1px solid #E4DAC5;flex-wrap:wrap;";
      var SRC = "flex:0 0 150px;font-size:11.5px;font-weight:800;color:#0A1E33;";
      var WHAT = "flex:1;min-width:190px;font-size:12.5px;line-height:1.5;color:#46506E;";
      var ciWhat = s.ci.n
        ? (s.ci.n + (es ? (s.ci.n === 1 ? " registro" : " registros") : (s.ci.n === 1 ? " check-in" : " check-ins")) + span(s.ci.from, s.ci.to) + ".")
        : (es ? "Ninguno todavía." : "None yet.");
      var slWhat = s.slips.n
        ? (s.slips.n + (es ? (s.slips.n === 1 ? " boleta" : " boletas") : (s.slips.n === 1 ? " slip" : " slips")) + span(s.slips.from, s.slips.to)
           + (s.slips.classes.length ? ((es ? " · mencionó más: " : " · named most often: ") + s.slips.classes.join(" · ")) : "") + ".")
        : (es ? "Ninguna todavía." : "None yet.");
      var tinWhat = s.tins.n
        ? (s.tins.n + (es ? (s.tins.n === 1 ? " entrega" : " entregas") : (s.tins.n === 1 ? " turn-in" : " turn-ins")) + span(s.tins.from, s.tins.to)
           + (s.tins.names.length ? ((es ? " · más recientes: " : " · latest: ") + s.tins.names.join(" · ")) : "") + ".")
        : (es ? "Ninguna todavía." : "None yet.");
      out = '<div style="margin:14px 0 0;border:1px solid #E4DAC5;border-radius:10px;padding:12px 14px 13px;background:#FBF8F1;page-break-inside:avoid;break-inside:avoid;">' +
        '<span style="' + LB + 'display:block;margin:0 0 3px;">' +
          E(es ? "Evidencia adicional — no son datos del IEP" : "Additional evidence — not IEP data") + "</span>" +
        '<div style="' + ROW + 'border-top:0;"><span style="' + SRC + '">' +
          E(es ? "Registros diarios" : "Daily check-ins") + "</span>" +
          '<span style="' + WHAT + '">' + E(ciWhat) +
          (lines.length ? ("<br>" + lines.map(E).join("<br>")) : "") +
          (s.ci.talk ? ("<br>" + E((es ? "Pidió hablar: " : "Asked to talk: ") + s.ci.talk)) : "") +
          "</span></div>" +
        '<div style="' + ROW + '"><span style="' + SRC + '">' +
          E(es ? "Boletas de salida" : "Exit slips") + "</span>" +
          '<span style="' + WHAT + '">' + E(slWhat) + "</span></div>" +
        '<div style="' + ROW + '"><span style="' + SRC + '">' +
          E(es ? "Entregas" : "Turn-ins") + "</span>" +
          '<span style="' + WHAT + '">' + E(tinWhat) + "</span></div>" +
        '<div style="margin:10px 0 0;padding-top:9px;border-top:1px solid #E4DAC5;font-size:11px;line-height:1.55;color:#46506E;">' +
          E(caveat()) + "</div></div>";
    } finally { isEs = was; }
    return out;
  };

  /* ═════════════════════════════════════════════════ PAINT */
  function css() {
    if (el("aogIepEvCss")) return;
    var st = document.createElement("style");
    st.id = "aogIepEvCss";
    st.textContent = [
      ".iepev{margin-top:12px;border:1px solid var(--rule,#E4DAC5);border-radius:12px;overflow:hidden;}",
      ".iepev h4{margin:0;padding:10px 14px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;",
      "  color:var(--ink,#0A1E33);background:var(--card-soft,rgba(74,85,120,.05));}",
      ".iepev-row{display:flex;gap:12px;align-items:baseline;padding:11px 14px;border-top:1px solid var(--rule,#E4DAC5);flex-wrap:wrap;}",
      ".iepev-src{flex:0 0 132px;font-size:12px;font-weight:800;color:var(--ink,#0A1E33);}",
      /* ⚠ --ink-soft, not --ink-faint. Faint measures ~3.08:1 on this panel and
         this text is the information, not decoration. [[aog-contrast]] */
      ".iepev-what{flex:1;min-width:180px;font-size:12.5px;color:var(--ink-soft,#46506E);line-height:1.55;}",
      /* ⚠ NO NEW COLOR. The daily log carries 187 known dark-theme contrast
         failures; this panel distinguishes itself by BORDER STYLE and by what
         it says, and every value in it is already measured in both themes.
         [[aog-contrast]] */
      ".iepev.iepev-unknown{border-style:dashed;}",
      ".iepev-note{padding:11px 14px;border-top:1px solid var(--rule,#E4DAC5);font-size:11.5px;line-height:1.6;color:var(--ink-soft,#46506E);}",
      ".iepev-what a{color:var(--ink,#0A1E33);font-weight:700;}"
    ].join("\n");
    document.head.appendChild(st);
  }

  var painting = false;
  function paint() {
    if (painting) return;
    painting = true;
    try {
      css();
      var body = el("aogIepBody");
      if (!body) return;
      body.querySelectorAll(".iep-card").forEach(function (card) {
        var id = String(card.id || "").replace(/^iepCard_/, "");
        if (!id) return;
        var html = evHtml(id);
        var have = card.querySelector('.iepev[data-ev="' + id + '"]');
        if (!html) { if (have) have.parentNode.removeChild(have); return; }
        /* ⚠ THE OPENER IS NO LONGER ONE FIXED STRING - the unknown-code panel
           carries a modifier class. Matching the old literal would miss, the
           have/replace check below would never find its own panel, and paint()
           would append a fresh copy on every mutation. Insert after whatever
           class list is there. */
        html = html.replace(/^<div class="iepev([^"]*)">/, '<div class="iepev$1" data-ev="' + esc(id) + '">');
        if (have) {
          var tmp = document.createElement("div");
          tmp.innerHTML = html;
          if (have.outerHTML === tmp.firstChild.outerHTML) return;  /* nothing moved */
          have.parentNode.replaceChild(tmp.firstChild, have);
        } else {
          var tmp2 = document.createElement("div");
          tmp2.innerHTML = html;
          card.appendChild(tmp2.firstChild);
        }
      });
    } catch (e) {} finally { painting = false; }
  }

  /* The IEP panel is re-rendered wholesale by its own module, so this hangs on
     a mutation observer rather than binding once — the same way the home-school
     strip and the student-links buttons re-attach. */
  function watch() {
    var body = el("aogIepBody");
    if (!body) return;
    try {
      new MutationObserver(function () { setTimeout(paint, 0); })
        .observe(body, { childList: true, subtree: true });
    } catch (e) {}
  }

  function init() {
    paint(); watch();
    document.addEventListener("click", function () { setTimeout(paint, 60); }, true);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.AOGIepEvidence = { snapshot: snapshot, html: evHtml, paint: paint };
})();
