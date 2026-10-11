
(function () {
  "use strict";

  function T(en, es) { try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; } }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }
  function el(id) { return document.getElementById(id); }
  function todayISO() {
    var d = new Date(), m = d.getMonth() + 1, da = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (da < 10 ? "0" + da : da);
  }
  function jload(k, fb) { try { return JSON.parse(localStorage.getItem(k) || "") || fb; } catch (e) { return fb; } }

  /* Eleven periods, 0 through 10, and 0 is Advisory. Mirrors PERIOD_DEFS in
     the check-in layer; if you add a period there, add it here. */
  var PICK_PERIODS = (function () {
    var out = [{ v: "", en: "All periods", es: "Todos los periodos" },
               { v: "Advisory", en: "Period 0 · Advisory", es: "Periodo 0 · Asesoría" }];
    for (var i = 1; i <= 10; i++) out.push({ v: "Period " + i, en: "Period " + i, es: "Periodo " + i });
    return out;
  })();

  var DOMAINS = [
    { k: "A", norm: "normA", en: "Emotional Regulation & Well-Being", es: "Regulación emocional y bienestar", q: "emotional regulation" },
    { k: "B", norm: "normB", en: "Self-Compassion & Growth Mindset",  es: "Autocompasión y mentalidad de crecimiento", q: "self-compassion" },
    { k: "C", norm: "normC", en: "Social Competency & Repair",        es: "Competencia social y reparación", q: "repair" }
  ];

  /* THE LESSON, BY NAME. Read straight out of the single canonical record —
     RI_CONSTRUCTS for what each book teaches and where, curriculumJumpUrl for
     the file. No second recommendation engine, no new mapping: the book comes
     from the class's own grade band, so a link can never leave that band.
     With no grade recorded there is no honest book to name, and this returns
     null rather than guessing one. */
  function lessonFor(domKey, grade) {
    try {
      if (grade == null || String(grade).trim() === "") return null;
      if (typeof aogGradeToBand !== "function" || typeof aogBandBook !== "function") return null;
      if (typeof RI_CONSTRUCTS === "undefined" || !RI_CONSTRUCTS || !RI_CONSTRUCTS.length) return null;
      var book = aogBandBook(aogGradeToBand(grade));
      if (!book) return null;
      var bn = parseInt(String(book.n).replace(/[^0-9]/g, ""), 10);
      if (!bn) return null;
      var first = null;
      for (var i = 0; i < RI_CONSTRUCTS.length; i++) {
        var c = RI_CONSTRUCTS[i];
        if (!c || c.domain !== domKey) continue;
        var r = c.resources && c.resources[bn];
        if (!r || !r.loc) continue;
        var url = "";
        try { if (typeof curriculumJumpUrl === "function") url = curriculumJumpUrl(bn, c.items) || ""; } catch (eU) {}
        var hit = { book: book, loc: r.loc, res: String(r.res || "").replace(/<[^>]*>/g, ""), url: url };
        if (url) return hit;          /* a real lesson file wins */
        if (!first) first = hit;      /* otherwise name it in prose and say so */
      }
      return first;
    } catch (e) { return null; }
  }

  /* CS_DATA's own band keys: k2 · 35 · 68 · 912 · adult. Not the same set as
     the Daily log's — do not assume they match. */
  function csBand(grade) {
    var g = String(grade == null ? "" : grade).trim().toLowerCase();
    if (g.indexOf("adult") >= 0 || g === "college") return "adult";
    if (g === "k" || g === "kg") return "k2";
    var n = parseInt(g, 10);
    if (isNaN(n)) return "68";          /* a junior-high build; 6–8 is the honest default */
    if (n <= 2) return "k2";
    if (n <= 5) return "35";
    if (n <= 8) return "68";
    return "912";
  }

  var PIC = { period: "" };

  /* ------------------------------------------------------- the check-in door
     §5. Advisory is the natural home for a daily check-in, and until now a
     teacher who wanted one at 8:00 AM had to leave the Overview, find Set up,
     open Distribute and build a link. The door does not build a second link
     system — it calls the one builder the Distribute card uses
     (window.aogCheckinLinkFor, exported from the check-in layer) and hands
     back exactly what that card would have produced for this period. */
  var DOOR = { link: "", period: "" };

  function periodLabel(store) {
    for (var i = 0; i < PICK_PERIODS.length; i++) {
      if (PICK_PERIODS[i].v === store) return T(PICK_PERIODS[i].en, PICK_PERIODS[i].es);
    }
    return store;
  }

  function doorHtml() {
    /* No assumed home period any more. The door used to headline
       "Period 0 · Advisory" and default the link to Advisory whenever the
       picker read "All periods"; it now carries whatever the teacher actually
       chose, and nothing when they have chosen nothing. Honest, and it stops
       the card naming a period the school may not run. */
    var per = PIC.period || "";
    DOOR.period = per;
    DOOR.link = "";
    try { if (typeof window.aogCheckinLinkFor === "function") DOOR.link = window.aogCheckinLinkFor(per) || ""; } catch (e) {}

    var acts = "";
    if (DOOR.link) {
      acts =
        '<button type="button" class="tp-btn" id="tpOpenCi">' +
          esc(T("Open today\u2019s check-in", "Abrir el registro de hoy")) + "</button>" +
        '<button type="button" class="tp-btn ghost" id="tpCopyCi">' +
          esc(T("Copy the student link", "Copiar el enlace del estudiante")) + "</button>";
    }
    acts += '<button type="button" class="tp-btn ghost" id="tpDaily">' +
      esc(T("Log what I saw", "Registrar lo que vi")) + "</button>" +
      '<span class="tp-ok" id="tpCiOk" style="display:none;">' + esc(T("Copied", "Copiado")) + "</span>";

    var note = !DOOR.link
      ? T("A shareable link needs the site to be open from its web address rather than from a file. \u201cLog what I saw\u201d still opens the Daily Log.",
          "Un enlace para compartir necesita que el sitio se abra desde su direcci\u00f3n web y no desde un archivo. \u201cRegistrar lo que vi\u201d s\u00ed abre el Registro diario.")
      : (per
        ? T("The link opens in a new tab and carries the period chosen above, so today\u2019s answers land against it. Post it in Google Classroom or project it. \u201cLog what I saw\u201d opens the Daily Log at that period for your own notes.",
            "El enlace abre en otra pesta\u00f1a y lleva el periodo elegido arriba, para que las respuestas de hoy queden ah\u00ed. Publ\u00edcalo en Google Classroom o proy\u00e9ctalo. \u201cRegistrar lo que vi\u201d abre el Registro diario en ese periodo.")
        : T("Pick a period above and the link will remember it. Post the link in Google Classroom or show it on the board. “Log what I saw” opens your own notes.",
            "Elige un periodo arriba y el enlace lo recordará. Publica el enlace en Google Classroom o muéstralo en la pizarra. “Anotar lo que vi” abre tus propias notas."));

    return '<div class="tp-door">' +
      '<p class="tp-lbl">' + esc(T("Daily check-in", "Registro diario")) + "</p>" +
      '<p class="tp-big"><b style="font-size:18px;">' +
        esc(T("About four minutes, seven questions, in their own words.",
              "Unos cuatro minutos, siete preguntas, en sus propias palabras.")) + "</b>" +
        (per ? ' <span style="color:var(--ink-soft,#5b6675);font-size:14px;">\u00b7 ' +
               esc(periodLabel(per)) + "</span>" : "") + "</p>" +
      '<div class="tp-acts" style="margin-top:11px;">' + acts + "</div>" +
      '<p class="tp-note">' + esc(note) + "</p>" +
    "</div>";
  }



  /* ---------------------------------------------------------- today's check-ins
     Both stores, because an adult logging a period and a student describing
     their morning are both check-ins that happened today. Counted separately,
     because they are not the same kind of thing. */
  function checkinsToday(periodFilter) {
    var day = todayISO(), fromAdults = 0, fromStudents = 0, wantsTalk = 0, ids = {};
    var adult = (jload("aog.daily.v1", {}).logs) || {};
    Object.keys(adult).forEach(function (sid) {
      ((adult[sid] || {})[day] || {}).periods && (adult[sid][day].periods || []).forEach(function (p) {
        if (periodFilter && p.period !== periodFilter) return;
        fromAdults++; ids[sid] = 1;
        if (p.followUp) wantsTalk++;
      });
    });
    var stu = (jload("aog.checkin.student.v1", {}).logs) || {};
    Object.keys(stu).forEach(function (sid) {
      ((stu[sid] || {})[day] || []).forEach(function (e) {
        if (periodFilter && e.period && e.period !== periodFilter) return;
        if (periodFilter && !e.period) return;
        fromStudents++; ids[sid] = 1;
        if (e.followUp) wantsTalk++;
      });
    });
    return { adults: fromAdults, students: fromStudents, people: Object.keys(ids).length, wantsTalk: wantsTalk };
  }

  /* --------------------------------------------------------------- the bands
     School reflections only. Home and workplace reflections are somebody's
     private business and are already excluded from every class view. */
  function classPicture() {
    var recs = [];
    try {
      recs = ((typeof getAllRecords === "function" ? getAllRecords() : []) || []).filter(function (r) {
        return r && r.context !== "home" && r.population !== "adult" && r.normComposite != null;
      });
    } catch (e) {}
    if (!recs.length) return null;

    /* The most recent window present, so a Fall picture is not diluted by
       last Spring's. */
    var newest = recs.slice().sort(function (a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    })[0];
    var win = newest && newest.window;
    /* .30fg — "this window" means the CURRENT one. A window name repeats every school year
       (three Springs on a device that has run three years), and counting them all made the
       modal grade drift toward K after gradeBack walked older records down — the demo named a
       Book 1 lesson under a junior-high period list. Keep to records within 240 days of the
       newest one. */
    var _nt = newest ? new Date(newest.timestamp).getTime() : 0;
    var inWin = win ? recs.filter(function (r) { return r.window === win && (_nt - new Date(r.timestamp).getTime()) < 240 * 86400000; }) : recs;

    var bands = { "Low Risk": 0, "Some Risk": 0, "High Risk": 0 };
    inWin.forEach(function (r) { if (bands[r.tier] != null) bands[r.tier]++; });

    var means = DOMAINS.map(function (d) {
      var vals = inWin.map(function (r) { return r[d.norm]; }).filter(function (v) { return v != null && !isNaN(v); });
      return { d: d, mean: vals.length ? vals.reduce(function (a, b) { return a + b; }, 0) / vals.length : null };
    }).filter(function (o) { return o.mean != null; });
    means.sort(function (a, b) { return a.mean - b.mean; });

    var grades = {};
    inWin.forEach(function (r) { if (r.grade != null && r.grade !== "") grades[r.grade] = (grades[r.grade] || 0) + 1; });
    var topGrade = Object.keys(grades).sort(function (a, b) { return grades[b] - grades[a]; })[0] || "";

    var flags = inWin.filter(function (r) { return r.unsafeFlag || r.trustedAdultFlag; }).length;

    return {
      n: inWin.length, window: win, bands: bands,
      lowest: means[0] || null, spread: means,
      grade: topGrade, flags: flags,
      newest: newest && newest.timestamp
    };
  }

  /* A starter for the domain that needs one, from the bank the app already
     ships. Rotates by the day so a teacher opening this every morning is not
     handed the same sentence for a fortnight. */
  function starterFor(domKey, grade) {
    try {
      var D = window.AOG_CS_DATA;
      if (!D) return null;
      var bank = D[csBand(grade)] || D["68"] || D["35"];
      var items = bank && bank[domKey];
      if (!items || !items.length) return null;
      var d = new Date();
      var day = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
      var o = items[day % items.length];
      return (typeof dashLang !== "undefined" && dashLang === "es") ? (o.es || o.en) : o.en;
    } catch (e) { return null; }
  }

  /* ------------------------------------------------------------------ styles */
  function injectCss() {
    if (el("aog-tp-css")) return;
    var s = document.createElement("style");
    s.id = "aog-tp-css";
    s.textContent = [
      "#aogTodaysPicture{border:1px solid var(--rule,#E4DAC5);border-left:4px solid var(--gold,#D9A33B);border-radius:14px;background:var(--card,#fff);padding:20px 22px;margin:0 0 22px;}",
      "#aogTodaysPicture .tp-top{display:flex;align-items:baseline;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:4px;}",
      /* AOG-TP-CLOSE-V1 — the fold's Close sits in the top-right corner; the date keeps clear of it */
      "#aogTodaysPicture .tp-top{padding-right:78px;}",
      "#aogTodaysPicture .tp-kicker{font-size:11px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);margin:0;}",
      "#aogTodaysPicture .tp-date{font-size:12.5px;color:var(--ink-faint,#8A92A6);font-weight:600;}",
      "#aogTodaysPicture .tp-lead{font-family:var(--font-serif,Georgia,serif);font-size:20px;line-height:1.3;font-weight:600;color:var(--navy,#0A1E33);margin:2px 0 14px;}",
      "#aogTodaysPicture .tp-ctl{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:0 0 16px;}",
      "#aogTodaysPicture .tp-ctl label{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-faint,#8A92A6);}",
      "#aogTodaysPicture select{font:inherit;font-size:13.5px;font-weight:600;color:var(--navy,#0A1E33);background:var(--card,#fff);border:1px solid var(--rule,#E4DAC5);border-radius:9px;padding:8px 11px;}",
      "#aogTodaysPicture .tp-sec{border-top:1px solid var(--rule-soft,#EFE8DA);padding-top:13px;margin-top:13px;}",
      "#aogTodaysPicture .tp-sec:first-of-type{border-top:0;padding-top:0;margin-top:0;}",
      "#aogTodaysPicture .tp-lbl{font-size:10.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-faint,#8A92A6);margin:0 0 7px;}",
      "#aogTodaysPicture .tp-big{font-size:15.5px;line-height:1.6;color:var(--ink,#22303F);margin:0;}",
      "#aogTodaysPicture .tp-big b{font-size:22px;font-weight:800;color:var(--navy,#0A1E33);}",
      "#aogTodaysPicture .tp-bands{display:flex;flex-wrap:wrap;gap:9px;margin:8px 0 0;}",
      "#aogTodaysPicture .tp-band{display:inline-flex;align-items:baseline;gap:8px;border:1px solid var(--rule,#E4DAC5);border-radius:999px;padding:6px 14px 6px 11px;font-size:13.5px;font-weight:600;color:var(--ink,#22303F);}",
      "#aogTodaysPicture .tp-band .n{font-size:17px;font-weight:800;}",
      "#aogTodaysPicture .tp-band .dot{width:9px;height:9px;border-radius:50%;align-self:center;flex:0 0 auto;}",
      "#aogTodaysPicture .tp-note{font-size:12.5px;line-height:1.6;color:var(--ink-soft,#5b6675);margin:7px 0 0;}",
      "#aogTodaysPicture .tp-quote{font-family:var(--font-serif,Georgia,serif);font-size:18px;line-height:1.45;color:var(--navy,#0A1E33);background:var(--cream,#FBF8F1);border-left:3px solid var(--gold,#D9A33B);border-radius:0 10px 10px 0;padding:13px 16px;margin:2px 0 11px;}",
      "#aogTodaysPicture .tp-acts{display:flex;gap:9px;flex-wrap:wrap;}",
      "#aogTodaysPicture .tp-btn{font:inherit;font-size:13px;font-weight:700;color:#fff;background:var(--navy,#0A1E33);border:0;border-radius:999px;padding:9px 17px;cursor:pointer;}",
      "#aogTodaysPicture a.tp-btn{display:inline-block;text-decoration:none;line-height:1.2;}",
      "#aogTodaysPicture a.tp-btn:focus-visible,#aogTodaysPicture .tp-btn:focus-visible{outline:2px solid var(--gold,#D9A33B);outline-offset:2px;}",
      "#aogTodaysPicture .tp-btn.ghost{color:var(--navy,#0A1E33);background:transparent;border:1px solid var(--rule,#E4DAC5);}",
      "#aogTodaysPicture .tp-btn:hover{opacity:.9;}",
      "#aogTodaysPicture .tp-ok{font-size:13px;font-weight:700;color:var(--green,#2E6B3A);align-self:center;}",
      "#aogTodaysPicture .tp-foot{font-size:11.5px;line-height:1.6;color:var(--ink-faint,#8A92A6);margin:16px 0 0;padding-top:11px;border-top:1px solid var(--rule-soft,#EFE8DA);}",
      "#aogTodaysPicture .tp-door{background:var(--cream,#FBF8F1);border:1px solid var(--rule-soft,#EFE8DA);border-radius:12px;padding:15px 17px;margin-top:14px;}",
      "#aogTodaysPicture .tp-door .tp-lbl{color:var(--gold-deep,#9a6f24);}",
      "#aogTodaysPicture .tp-door .tp-sec{border:0;padding:0;margin:0;}",
      "@media (max-width:560px){#aogTodaysPicture{padding:16px 15px;}#aogTodaysPicture .tp-lead{font-size:18px;}#aogTodaysPicture .tp-door{padding:13px 13px;}}",
      "@media print{#aogTodaysPicture .tp-acts,#aogTodaysPicture select{display:none;}}",
      /* ⚠ THE SAME BUG, A FIFTH TIME. --navy is an INK for a light ground and
         --cream is a GROUND for dark ink; NEITHER is remapped for dark, so
         every use of one without the other inverts. Seven serious contrast
         failures on this card in dark mode — team review item 15 — all of
         them this. Where the ground stays light, the ink stays dark; where
         the ground goes dark, the ink follows. 2026-08-27. */
      ":root[data-theme=\"dark\"] #aogTodaysPicture .tp-lead,",
      ":root[data-theme=\"dark\"] #aogTodaysPicture .tp-big b,",
      ":root[data-theme=\"dark\"] #aogTodaysPicture select,",
      ":root[data-theme=\"dark\"] #aogTodaysPicture .tp-btn.ghost{color:var(--ink,#ECE5D6);}",
      ":root[data-theme=\"dark\"] #aogTodaysPicture .tp-quote{background:var(--paper,#152331);color:var(--ink,#ECE5D6);}",
      ":root[data-theme=\"dark\"] #aogTodaysPicture .tp-door{background:var(--paper,#152331);border-color:var(--rule,#2B3B4B);}",
      ":root[data-theme=\"dark\"] #aogTodaysPicture .tp-door .tp-lbl{color:var(--gold,#E7B85E);}"
    ].join("\n");
    document.head.appendChild(s);
  }

  var BAND_ORDER = [
    { key: "Low Risk",  col: "var(--green,#2E6B3A)" },
    { key: "Some Risk", col: "var(--gold-deep,#9a6f24)" },
    { key: "High Risk", col: "var(--red,#8B2A2A)" }
  ];

  function render() {
    var host = el("panel-overview");
    if (!host) return;
    injectCss();

    var card = el("aogTodaysPicture");
    if (!card) {
      card = document.createElement("div");
      card.id = "aogTodaysPicture";
      /* Above the curriculum strip, below nothing — it is the first thing on
         the tab, which is the whole point of it. */
      host.insertBefore(card, host.firstChild);
    }

    var ci = checkinsToday(PIC.period);
    var cp = classPicture();
    var d = new Date();
    var dateStr = d.toLocaleDateString(
      (typeof dashLang !== "undefined" && dashLang === "es") ? "es" : "en",
      { weekday: "short", day: "numeric", month: "short" });

    var periodSel = '<div class="tp-ctl"><label for="tpPeriod">' + esc(T("Period", "Periodo")) + "</label>" +
      '<select id="tpPeriod">' + PICK_PERIODS.map(function (p) {
        return '<option value="' + esc(p.v) + '"' + (p.v === PIC.period ? " selected" : "") + ">" +
          esc(T(p.en, p.es)) + "</option>";
      }).join("") + "</select>" +
      '<span class="tp-note" style="margin:0;">' +
        esc(T("filters today’s check-ins", "filtra los registros de hoy")) + "</span></div>";

    /* ── today ── */
    var todayHtml;
    if (ci.adults + ci.students === 0) {
      todayHtml = '<p class="tp-big">' + esc(PIC.period
        ? T("No check-ins logged for this period yet today.", "Aún no hay registros de este periodo hoy.")
        : T("No check-ins logged yet today.", "Aún no hay registros hoy.")) + "</p>" +
        '<p class="tp-note">' + esc(T("Share a check-in link from Set up ▸ Distribute. This fills in as students answer.",
                                      "Comparte un enlace de registro desde Configurar ▸ Distribuir. Esto se llena a medida que los estudiantes responden.")) + "</p>";
    } else {
      /* ⚠ TWO STORES, TWO KINDS OF ROW — SAY WHICH IS WHICH. ci.students is
         the students' own daily check-ins; ci.adults is the teacher's Daily
         Log, periods an adult recorded ABOUT students. The old line called
         both "check-ins" and then labeled ci.people — distinct STUDENT
         codes, in both stores — by who wrote the rows, which produced
         "90 check-ins today · from 34 adults" on a screen where no student
         had said anything. The student number leads; staff logs are named
         as logs; the people are always students. 2026-08-28. */
      var parts = [];
      var lead = ci.students
        ? '<b>' + ci.students + "</b> " + esc(ci.students === 1
            ? T("student check-in today", "registro de estudiante hoy")
            : T("student check-ins today", "registros de estudiantes hoy"))
        : esc(T("No student check-ins yet today", "Aún no hay registros de estudiantes hoy"));
      if (ci.adults) parts.push(ci.adults + " " + (ci.adults === 1
        ? T("period logged by staff", "periodo anotado por el personal")
        : T("periods logged by staff", "periodos anotados por el personal")));
      if (ci.people) parts.push((ci.adults ? T("across ", "de ") : T("from ", "de ")) +
        ci.people + " " + (ci.people === 1 ? T("student", "estudiante") : T("students", "estudiantes")));
      todayHtml = '<p class="tp-big">' + lead +
        ' <span style="color:var(--ink-soft,#5b6675);font-size:14px;">' +
        (parts.length ? ("· " + esc(parts.join(" · "))) : "") + "</span></p>" +
        (ci.wantsTalk
          ? '<p class="tp-note" style="color:var(--gold-deep,#9a6f24);font-weight:700;">' +
            esc(ci.wantsTalk + " " + (ci.wantsTalk === 1
              ? T("asked to talk with someone.", "pidió hablar con alguien.")
              : T("asked to talk with someone.", "pidieron hablar con alguien."))) + "</p>"
          : "");
    }

    /* ── the class right now ── */
    var classHtml, moveHtml = "";
    if (!cp) {
      classHtml = '<p class="tp-big">' + esc(T("No class reflections on this computer yet.",
                                               "Aún no hay autorreflexiones de la clase en esta computadora.")) + "</p>" +
        '<p class="tp-note">' + esc(T("Share a class link, or tap Refresh classroom data in Set up to bring in answers from other devices.",
                                      "Comparte un enlace de clase, o toca Actualizar datos de la clase en Configurar para traer respuestas de otros dispositivos.")) + "</p>";
    } else {
      var winLbl = cp.window ? cp.window : T("all windows", "todas las ventanas");
      classHtml = '<p class="tp-big"><b>' + cp.n + "</b> " +
        /* ⚠ SAY "STUDENT". This number is students, school context, most
           recent window only — and it sits on the same dashboard as Trends'
           310 and Students' 279. Unlabeled it read as a third contradictory
           total; one word makes it the narrowest of three honest counts.
           Team review item 10. */
        esc(cp.n === 1 ? T("student reflection", "autorreflexión de estudiante")
                       : T("student reflections", "autorreflexiones de estudiantes")) +
        ' <span style="color:var(--ink-soft,#5b6675);font-size:14px;">· ' + esc(winLbl) + "</span></p>" +
        '<div class="tp-bands">' + BAND_ORDER.map(function (b) {
          var n = cp.bands[b.key] || 0;
          return '<span class="tp-band"><span class="dot" style="background:' + b.col + ';"></span>' +
            '<span class="n" style="color:' + b.col + ';">' + n + "</span> " +
            esc(typeof tierLabel === "function" ? tierLabel(b.key) : b.key) + "</span>";
        }).join("") + "</div>" +
        '<p class="tp-note">' + esc(T(
          "From the reflection window, not from today — the reflection runs two or three times a year.",
          "De la ventana de la autorreflexión, no de hoy — se hace dos o tres veces al año.")) + "</p>";

      if (cp.lowest) {
        var dom = cp.lowest.d;
        var st = starterFor(dom.k, cp.grade);
        var les = lessonFor(dom.k, cp.grade);
        /* NEAR-TIE (2026-08-27). When the three domain averages sit within a
           point of each other, "the lowest of the three" is decided by noise
           and by the A<B<C tie-break, not by the class. The card still names a
           domain so the starter and the lesson have something to attach to,
           but it stops presenting a coin-flip as a finding. The same rule runs
           on Recommended focus, so the two cards cannot disagree in confidence. */
        var tpGap = (cp.spread && cp.spread.length > 1)
          ? (cp.spread[1].mean - cp.spread[0].mean) : null;
        var tpTie = (tpGap !== null && tpGap < 1);
        moveHtml =
          '<div class="tp-sec"><p class="tp-lbl">' + esc(T("Most noticeable area", "Área más notable")) + "</p>" +
            '<p class="tp-big"><b style="font-size:18px;">' + esc(T(dom.en, dom.es)) + "</b>" +
            ' <span style="color:var(--ink-soft,#5b6675);font-size:14px;">· ' +
            esc(tpTie
              ? T("narrowly the lowest — all three are within a point, averaging ",
                  "apenas la más baja — las tres están a menos de un punto, en promedio ")
              : T("the lowest of the three, averaging ", "la más baja de las tres, en promedio ")) +
            Math.round(cp.lowest.mean) + "/100</span></p>" +
            '<p class="tp-note">' + esc(tpTie
              ? T("The three are close this window, so any of them is a reasonable place to start. It is not a finding about any one student.",
                  "Las tres están cerca en esta ventana, así que cualquiera es un buen punto de partida. No es una conclusión sobre ningún estudiante.")
              : T(
              "Lowest of three is where a conversation is most likely to be useful. It is not a finding about any one student.",
              "La más baja de las tres es donde una conversación probablemente ayude más. No es una conclusión sobre ningún estudiante.")) + "</p>" +
          "</div>" +
          (st
            ? '<div class="tp-sec"><p class="tp-lbl">' + esc(T("Suggested next move", "Siguiente paso sugerido")) + "</p>" +
                '<p class="tp-quote" id="tpQuote">“' + esc(st) + '”</p>' +
                '<div class="tp-acts">' +
                  '<button type="button" class="tp-btn" id="tpCopy">' + esc(T("Copy", "Copiar")) + "</button>" +
                  '<button type="button" class="tp-btn ghost" id="tpMore">' + esc(T("More starters", "Más iniciadores")) + "</button>" +
                  (les ? "" : '<button type="button" class="tp-btn ghost" id="tpLesson">' + esc(T("Find the lesson", "Buscar la lección")) + "</button>") +
                  '<span class="tp-ok" id="tpOk" style="display:none;">' + esc(T("Copied", "Copiado")) + "</span>" +
                "</div>" +
                '<p class="tp-note">' + esc(T(
                  "A prompt to open with, not a script. Nothing here is a diagnosis or a recommendation about a particular child.",
                  "Una frase para empezar, no un guion. Nada aquí es un diagnóstico ni una recomendación sobre un estudiante en particular.")) + "</p>" +
              "</div>"
            : "");

        if (les) {
          moveHtml +=
            '<div class="tp-sec"><p class="tp-lbl">' + esc(T("The lesson for it", "La lección para eso")) + "</p>" +
              '<p class="tp-big"><b style="font-size:16px;">' + esc(les.book.n + " · " + les.loc) + "</b>" +
              ' <span style="color:var(--ink-soft,#5b6675);font-size:13.5px;">· ' + esc(les.book.t) + "</span></p>" +
              (les.res ? '<p class="tp-note">' + esc(les.res) + "</p>" : "") +
              '<div class="tp-acts" style="margin-top:10px;">' +
                (les.url
                  ? '<a class="tp-btn" id="tpOpenLesson" href="' + esc(les.url) + '" target="_blank" rel="noopener">' + esc(T("Open the lesson", "Abrir la lección")) + "</a>"
                  : "") +
                '<button type="button" class="tp-btn ghost" id="tpLesson">' + esc(T("More in the library", "Más en la biblioteca")) + "</button>" +
              "</div>" +
              '<p class="tp-note">' + esc(T(
                "Chosen from this class's own grade band, not from the results of any one student.",
                "Elegida según la banda de grado de esta clase, no según los resultados de ningún estudiante.")) + "</p>" +
            "</div>";
        }
      }
    }

    card.innerHTML =
      '<div class="tp-top"><p class="tp-kicker">' + esc(T("Today’s picture", "El panorama de hoy")) + "</p>" +
        '<span class="tp-date">' + esc(dateStr) + "</span></div>" +
      '<p class="tp-lead">' + esc(T("What do I need to know right now?", "¿Qué necesito saber ahora mismo?")) + "</p>" +
      periodSel +
      '<div class="tp-sec"><p class="tp-lbl">' + esc(T("Today", "Hoy")) + "</p>" + todayHtml + "</div>" +
      doorHtml() +
      '<div class="tp-sec"><p class="tp-lbl">' + esc(T("The class right now", "La clase ahora mismo")) + "</p>" + classHtml + "</div>" +
      moveHtml +
      /* The population layer may amend this line — and ONLY amend it. With
         no class set up it returns "" and the original wording below stands
         word for word, which is the case for every teacher until they decide
         otherwise. See the population layer's aogPopFoot. */
      '<p class="tp-foot">' + esc((window.aogPopFoot && window.aogPopFoot(T)) || T(
        "These are counts, not percentages. The site keeps no class list on purpose, so it shows who checked in, never who didn’t. A blank means nothing yet, not a problem. No student is ranked or named here.",
        "Son conteos, no porcentajes. El sitio no guarda lista de clase a propósito, así que muestra quién respondió, nunca quién no. Un espacio vacío no significa un problema. Aquí no se clasifica ni se nombra a ningún estudiante.")) + "</p>";

    wire(cp);
  }

  function wire(cp) {
    /* §5 + §14. Three moves out of the door: hand the check-in to the class,
       copy the link for Google Classroom, or open the Daily Log at this same
       period to write down what you saw yourself. */
    var openCi = el("tpOpenCi");
    if (openCi) openCi.addEventListener("click", function () {
      if (!DOOR.link) return;
      try { window.open(DOOR.link, "_blank", "noopener"); } catch (e) { location.href = DOOR.link; }
    });

    var copyCi = el("tpCopyCi"), ciOk = el("tpCiOk");
    if (copyCi) copyCi.addEventListener("click", function () {
      if (!DOOR.link) return;
      var done = function () {
        if (!ciOk) return;
        ciOk.style.display = "";
        setTimeout(function () { ciOk.style.display = "none"; }, 1800);
      };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(DOOR.link).then(done, done);
        } else {
          var ta = document.createElement("textarea");
          ta.value = DOOR.link; ta.style.position = "fixed"; ta.style.left = "-9999px";
          document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); } catch (e) {}
          document.body.removeChild(ta); done();
        }
      } catch (e) {}
    });

    var daily = el("tpDaily");
    if (daily) daily.addEventListener("click", function () {
      /* Carry the period across, but only if the Daily log actually offers it —
         a period it does not know would be set and then silently dropped on the
         panel's next render. */
      try {
        var opt = document.querySelector('#dlPeriod option[value="' + String(DOOR.period).replace(/"/g, '') + '"]');
        if (opt && typeof window.dlPeriodChange === "function") window.dlPeriodChange(DOOR.period);
      } catch (e) {}
      try { if (typeof window.aogQsTab === "function") window.aogQsTab("daily"); } catch (e) {}
    });

    var sel = el("tpPeriod");
    if (sel) sel.addEventListener("change", function () { PIC.period = sel.value; render(); });

    var copy = el("tpCopy"), q = el("tpQuote"), ok = el("tpOk");
    if (copy && q) copy.addEventListener("click", function () {
      var txt = q.textContent.replace(/^[“"]|[”"]$/g, "");
      var done = function () { if (ok) { ok.style.display = ""; setTimeout(function () { ok.style.display = "none"; }, 1800); } };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
        else done();
      } catch (e) { done(); }
    });

    var more = el("tpMore");
    if (more) more.addEventListener("click", function () {
      try { if (window.toolOpen) window.toolOpen("convostarters"); } catch (e) {}
    });

    var lesson = el("tpLesson");
    if (lesson && cp && cp.lowest) lesson.addEventListener("click", function () {
      try {
        if (typeof aogGoConstruct === "function") aogGoConstruct(cp.lowest.d.q, String(cp.grade || ""));
      } catch (e) {}
    });
  }

  /* The card is part of the Overview, so it refreshes when the Overview does. */
  (function boot() {
    function attach() {
      if (typeof window.refreshAdmin === "function" && !window.refreshAdmin.__aogTP) {
        var orig = window.refreshAdmin;
        var wrapped = function () {
          var r = orig.apply(this, arguments);
          try { render(); } catch (e) {}
          return r;
        };
        wrapped.__aogTP = true;
        /* Carry the other layers' flags; see #aog-one-story. */
        try {
          Object.keys(orig).forEach(function (k) {
            if (k.indexOf("__aog") === 0 && !wrapped[k]) wrapped[k] = orig[k];
          });
        } catch (eF) {}
        window.refreshAdmin = wrapped;
      }
      if (el("panel-overview")) { try { render(); } catch (e) {} }
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", attach);
    else attach();
    setTimeout(attach, 900);
    setTimeout(attach, 2400);
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest && e.target.closest('.tab[data-tab="overview"]');
      if (t) setTimeout(function () { try { render(); } catch (_e) {} }, 80);
    });
  })();

  window.AOGTodaysPicture = { render: render, today: checkinsToday, picture: classPicture };
})();
