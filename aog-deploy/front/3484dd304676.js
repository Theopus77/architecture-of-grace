
/* ═══════════════════════════════════════════════════════════════════════════
   THE EVIDENCE LOOP · SCHEDULE-AWARE, MULTI-PERSPECTIVE EVIDENCE
   Build 2026.08.29bf.

   Schedule → Class/Period → Teacher → Class check-in → Student exit slip →
   Evidence timeline → Case-manager synthesis → Reevaluation or Annual review.

   Built from the 2026-08-29 master handoff: three students are approaching
   milestones (two reevaluations with a domain meeting, one annual review) and
   the case manager needs class-by-class teacher evidence and end-of-day
   student voice to arrive in one chronological record, without chasing it.

   WHAT THIS BLOCK OWNS — and what it deliberately does not.

   · aog.sched.v1      — per-student expected class contexts: period, course,
                         teacher, room, term. The schedule is the source of
                         truth for what "complete" means on a given day.
   · aog.milestone.v1  — per-student workflow: reevaluation (domain meeting →
                         evaluation process) or annual review. A reevaluation
                         and an annual review are different milestones and are
                         never conflated.
   · aog.evclass.v1    — class-by-class teacher observations: engagement,
                         independence, performance, supports, and the seven
                         explicit non-collection statuses.

   ⚠ WHY aog.evclass.v1 IS ITS OWN STORE and not rows in aog.daily.v1: every
   reader of the daily log SCORES its rows (periodStats counts domains out of
   3 or 4), and these records must never be scored — "Needed significant
   support" is an observation, not a percentage, and a status like "Student
   absent" is the absence of evidence, not a zero. One store per instrument is
   this product's standing architecture (checkin.student.v1 / exit.v1 /
   daily.v1 / thisisme.v1); the TIMELINE is where they meet, labeled.

   ⚠ NO STUDENT DATA LIVES IN THIS FILE. This page is public. Schedules,
   milestones and codes are entered on the educator's device (or seeded by a
   private device-side script kept out of the deploy folder) and stay in
   localStorage like every other store. Nothing here names a student.

   ⚠ MISSING DATA IS NOT NEGATIVE DATA. A class with no entry renders as
   "not yet" in the same ink as everything else, is never counted against a
   student or a teacher, and is never written down as a fact. The seven
   statuses (student absent, teacher absent, class canceled, schedule changed,
   not applicable, unable to collect, not yet) exist precisely so a blank
   cannot be mistaken for a struggle.

   ⚠ SOURCES ARE NEVER BLENDED. A teacher's "needed frequent prompting" and a
   student's "I did most of it myself" both stand, each under its own label.
   The difference is information. Nothing here averages across sources or
   across scales, and nothing turns a tap into a diagnosis — the check-in asks
   what happened, never why.

   ⚠ THE EXIT SLIP IS NOT REBUILT HERE. AOGExitSlip already owns the one-
   screen whole-day student reflection. This block only (1) hands it the true
   course list by writing the student's remembered schedule (aog.exit.sched.v1,
   the exit module's own tier-3 store), and (2) reads aog.exit.v1 to say
   whether today's slip exists. The Daily Check-In (moment-specific, any time
   of day) and the Exit Slip (whole day, end of day) remain two products.

   ⚠ GOAL LINKS ARE OPTIONAL. An observation may name IEP goals it speaks to
   (§22 of the handoff: goal-specific vs contextual evidence — both count),
   but nothing forces the link and nothing here writes into aog.iep.v1.

   ⚠ EVERY WRITE SITE FAILS OPEN and the block can be deleted whole: the rest
   of the product does not know it exists.

   Pure region between AOG-EVL-PURE-START/-END — no DOM, portable to Python
   for cross-build assertion (same contract as AOG-SID-PURE).
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var SKEY = "aog.sched.v1";
  var MKEY = "aog.milestone.v1";
  var EKEY = "aog.evclass.v1";
  var XSCHED = "aog.exit.sched.v1";   /* the exit slip's own remembered-schedule store */

  function TT(en, es) { try { if (typeof DT === "function") return DT(en, es); } catch (e) {} return en; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[c]; }); }
  function jload(k, fb) { try { return JSON.parse(localStorage.getItem(k) || "") || fb; } catch (e) { return fb; } }
  function jsave(k, o) { try { localStorage.setItem(k, JSON.stringify(o)); } catch (e) {} }
  function el(id) { return document.getElementById(id); }
  function key(s) { return String(s == null ? "" : s).trim().toUpperCase(); }
  function todayISO() { var d = new Date(), m = d.getMonth() + 1, da = d.getDate(); return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (da < 10 ? "0" + da : da); }
  function yearOf(d) { try { return window.AOGYear ? AOGYear(d) : ""; } catch (e) { return ""; } }

  /* ══════════════════ AOG-EVL-PURE-START · no DOM below ══════════════════ */

  /* Which weekday an ISO date is, without timezone drift: noon UTC. */
  function dow(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
    if (!m) return -1;
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12)).getUTCDay();
  }

  /* S1/S2 by calendar half: Jul–Dec reads as S1, Jan–Jun as S2.
     ⚠ AN APPROXIMATION, SAID OUT LOUD IN THE EDITOR — the real boundary is
     the district calendar's, and a class whose term is wrong is corrected by
     editing the schedule, never by this function growing cleverer. */
  function termFor(iso) {
    var m = /^\d{4}-(\d{2})/.exec(String(iso || ""));
    if (!m) return "";
    return (+m[1] >= 7) ? "S1" : "S2";
  }

  /* A BLOCKED CLASS IS ONE CLASS. Consecutive periods carrying the same
     course and the same teacher (ELA over periods 1-2, math over 5-6) are one
     class meeting that happens to span two bells, so the board, the counts
     and the link roster treat them as ONE context: the earlier row folds into
     the later one (Jimmy, 2026-08-29: "get rid of the earlier of the two"),
     which keeps `pFrom` so the label can still say "Per. 1-2". The schedule
     STORE keeps both rows exactly as the school's system shows them — this is
     a reading, not an edit, so un-blocking a class later costs nothing. */
  function mergeBlocks(list) {
    var out = [];
    list.forEach(function (c) {
      var prev = out[out.length - 1];
      if (prev && prev.p === c.p - 1
          && String(prev.course || "") === String(c.course || "")
          && String(prev.teacher || "") === String(c.teacher || "")) {
        var m = {}; for (var k in c) if (Object.prototype.hasOwnProperty.call(c, k)) m[k] = c[k];
        m.pFrom = (prev.pFrom != null ? prev.pFrom : prev.p);
        out[out.length - 1] = m;
        return;
      }
      out.push(c);
    });
    return out;
  }

  /* The classes expected on a date: term filter, Wednesday-only rows (period
     0 · Advisory meets Wednesdays in this building), weekend = none. */
  function classesOn(rec, iso) {
    var d = dow(iso);
    if (d < 1 || d > 5) return [];
    var t = termFor(iso);
    return mergeBlocks(((rec && rec.classes) || []).filter(function (c) {
      if (!c) return false;
      if (c.wOnly && d !== 3) return false;
      if (c.term && c.term !== "YR" && t && c.term !== t) return false;
      return true;
    }).slice().sort(function (a, b) { return (a.p || 0) - (b.p || 0); }));
  }

  /* Expected = the rows a check-in is looked for in. Lunch and anything the
     editor unticked stay ON the day board (context) but outside the count. */
  function expectedOn(rec, iso) {
    return classesOn(rec, iso).filter(function (c) { return c.counts !== false; });
  }

  function periodStore(p) { return p === 0 ? "Advisory" : "Period " + p; }
  function classId(c) { return (c.p || 0) + "|" + String(c.course || ""); }

  /* Day status for one class: latest entry wins the chip; every entry stays
     in the timeline. "pending" is the word for NOTHING — deliberately not a
     status a person can file, so a blank can never be confused with a fact. */
  function classState(entries, c) {
    var mine = (entries || []).filter(function (e) { return e && (e.p === c.p) && String(e.course || "") === String(c.course || ""); });
    if (!mine.length) return { k: "pending", n: 0 };
    var last = mine[mine.length - 1];
    return { k: last.status || "completed", n: mine.length, last: last };
  }

  function dayCounts(rec, entries, iso) {
    var exp = expectedOn(rec, iso), done = 0, other = 0;
    exp.forEach(function (c) {
      var s = classState(entries, c);
      if (s.k === "completed") done++;
      else if (s.k !== "pending") other++;
    });
    return { expected: exp.length, completed: done, statused: other };
  }
  /* ══════════════════ AOG-EVL-PURE-END ══════════════════ */

  /* ------------------------------------------------------------ the stores */
  function sload() { return jload(SKEY, { v: 1, students: {} }); }
  function ssave(o) { jsave(SKEY, o); }
  function mload() { return jload(MKEY, { v: 1, students: {} }); }
  function msave(o) { jsave(MKEY, o); }
  function eload() { return jload(EKEY, { v: 1, logs: {} }); }
  function esave(o) { jsave(EKEY, o); }

  function schedFor(sid) { var st = sload(); return (st.students || {})[key(sid)] || null; }
  function mileFor(sid) { var st = mload(); return (st.students || {})[key(sid)] || null; }
  function entriesFor(sid, iso) {
    var st = eload();
    return ((st.logs || {})[key(sid)] || {})[iso] || [];
  }

  function setSched(sid, rec) {
    var st = sload(); if (!st.students) st.students = {};
    rec.updated = new Date().toISOString();
    st.students[key(sid)] = rec; ssave(st);
    feedExit(sid, rec);
  }
  function setMile(sid, rec) {
    var st = mload(); if (!st.students) st.students = {};
    if (rec) { rec.updated = new Date().toISOString(); st.students[key(sid)] = rec; }
    else delete st.students[key(sid)];
    msave(st);
  }

  /* Hand the exit slip the true course list — ITS OWN tier-3 store, additive:
     other codes' remembered schedules are never touched. Lunch and advisory
     are not classes a student would call easiest or hardest. */
  function feedExit(sid, rec) {
    try {
      var courses = [];
      ((rec && rec.classes) || []).forEach(function (c) {
        if (!c || c.kind === "lunch" || c.p === 0) return;
        var name = String(c.course || "").trim();
        if (name && courses.indexOf(name) < 0) courses.push(name);
      });
      if (courses.length < 2) return;
      var all = jload(XSCHED, {}) || {};
      all[key(sid)] = courses.slice(0, 12);
      jsave(XSCHED, all);
    } catch (e) {}
  }

  /* ------------------------------------------------- the observation banks
     The handoff's own wording, kept as the visible sentence; the stored value
     is the small code so a reworded label never orphans a record. Nothing
     ranks the options: same type, same weight, same ink. */
  var SCALES = [
    { k: "eng", en: "How did the student engage today?", es: "¿Cómo participó el estudiante hoy?",
      opts: [
        { v: "e1", en: "Fully engaged", es: "Participación plena" },
        { v: "e2", en: "Mostly engaged", es: "Participación casi constante" },
        { v: "e3", en: "Inconsistent engagement", es: "Participación irregular" },
        { v: "e4", en: "Needed significant support", es: "Necesitó apoyo significativo" },
        { v: "e5", en: "Unable to meaningfully engage", es: "No logró participar de forma significativa" }
      ] },
    { k: "ind", en: "How independently did the student work?", es: "¿Con cuánta independencia trabajó?",
      opts: [
        { v: "i1", en: "Independent", es: "Independiente" },
        { v: "i2", en: "Mostly independent", es: "Mayormente independiente" },
        { v: "i3", en: "Some prompting / support", es: "Algo de apoyo o indicaciones" },
        { v: "i4", en: "Frequent prompting / support", es: "Indicaciones o apoyo frecuentes" },
        { v: "i5", en: "Significant adult support", es: "Apoyo adulto significativo" }
      ] },
    { k: "perf", en: "How did the student perform against today's classroom expectations?", es: "¿Cómo le fue frente a las expectativas de hoy en clase?",
      opts: [
        { v: "p1", en: "Met expectations", es: "Cumplió las expectativas" },
        { v: "p2", en: "Mostly met expectations", es: "Cumplió la mayoría" },
        { v: "p3", en: "Partially met expectations", es: "Cumplió en parte" },
        { v: "p4", en: "Struggled with expectations", es: "Le costó cumplirlas" },
        { v: "p5", en: "Unable to demonstrate the skill / task", es: "No pudo demostrar la destreza o tarea" }
      ] }
  ];
  var SUPPORTS = [
    { v: "verbal", en: "Verbal prompt", es: "Indicación verbal" },
    { v: "visual", en: "Visual cue", es: "Apoyo visual" },
    { v: "model", en: "Model / example", es: "Modelo / ejemplo" },
    { v: "chunk", en: "Chunking", es: "Trabajo por partes" },
    { v: "repeat", en: "Repetition", es: "Repetición" },
    { v: "time", en: "Extended time", es: "Tiempo extendido" },
    { v: "adult", en: "Adult check-in", es: "Acompañamiento de un adulto" },
    { v: "peer", en: "Peer support", es: "Apoyo de un compañero" },
    { v: "tech", en: "Technology / tool", es: "Tecnología / herramienta" },
    { v: "other", en: "Other", es: "Otro" }
  ];
  var STATUSES = [
    { v: "student_absent", en: "Student absent", es: "Estudiante ausente" },
    { v: "teacher_absent", en: "Teacher absent", es: "Docente ausente" },
    { v: "canceled", en: "Class canceled", es: "Clase cancelada" },
    { v: "sched_changed", en: "Schedule changed", es: "Cambio de horario" },
    { v: "na", en: "Not applicable", es: "No aplica" },
    { v: "unable", en: "Unable to collect", es: "No se pudo registrar" }
  ];
  function lab(list, v) {
    for (var i = 0; i < list.length; i++) if (list[i].v === v) return TT(list[i].en, list[i].es);
    return v || "";
  }
  function scaleLab(k, v) {
    for (var i = 0; i < SCALES.length; i++) if (SCALES[i].k === k) return lab(SCALES[i].opts, v);
    return v || "";
  }

  /* ------------------------------------------------------------ the writer */
  function saveObs(sid, rec) {
    var st = eload(); if (!st.logs) st.logs = {};
    var K = key(sid);
    if (!st.logs[K]) st.logs[K] = {};
    if (!st.logs[K][rec.date]) st.logs[K][rec.date] = [];
    st.logs[K][rec.date].push({
      timestamp: new Date().toISOString(),
      date: rec.date,
      studentId: K,
      p: rec.p,
      period: periodStore(rec.p),
      course: rec.course || "",
      teacher: rec.teacher || "",
      room: rec.room || "",
      term: termFor(rec.date),
      year: yearOf(rec.date),
      respondentRole: rec.respondentRole || "teacher",
      slipType: "classEvidence",
      schema: "v1",
      status: rec.status || "completed",
      eng: rec.eng || "", ind: rec.ind || "", perf: rec.perf || "",
      supports: (rec.supports || []).slice(),
      supportOther: rec.supportOther || "",
      /* label snapshots, so a record outlives a rewording */
      labs: rec.status === "completed" ? {
        eng: scaleLab("eng", rec.eng), ind: scaleLab("ind", rec.ind), perf: scaleLab("perf", rec.perf)
      } : null,
      goals: (rec.goals || []).slice(),
      note: rec.note || "",
      source: "device"
    });
    esave(st);
  }

  /* -------------------------------------------------- reading other stores
     READ ONLY, and each row keeps its source. The exit slip's structural
     facts (which class was easiest / hardest) belong to the educational
     record; the student's typed words and feelings do NOT surface here —
     the same ruling AOGIepEvidence already keeps. Read them in
     Check-ins ▸ Exit slips, where they live with their whole context. */
  function exitFor(sid, iso) {
    try {
      var logs = (jload("aog.exit.v1", {}) || {}).logs || {};
      var mine = logs[key(sid)] || logs[String(sid)] || null;
      if (!mine) {
        Object.keys(logs).forEach(function (k2) { if (key(k2) === key(sid)) mine = logs[k2]; });
      }
      return (mine && mine[iso] && mine[iso].length) ? mine[iso] : null;
    } catch (e) { return null; }
  }
  function rowsFromStore(storeKey, sid) {
    var out = [];
    try {
      var logs = (jload(storeKey, {}) || {}).logs || {};
      Object.keys(logs).forEach(function (k2) {
        if (key(k2) !== key(sid)) return;
        Object.keys(logs[k2] || {}).forEach(function (d) {
          var day = logs[k2][d];
          var list = (day && day.periods) ? day.periods : (Array.isArray(day) ? day : []);
          list.forEach(function (r) { out.push({ date: d, r: r }); });
        });
      });
    } catch (e) {}
    return out;
  }

  /* One chronological record. Each row: {date, ts, srcKey, srcLabel, line}. */
  function timeline(sid, maxDays) {
    var rows = [];
    /* teacher class observations — this block's own store */
    rowsFromStore(EKEY, sid).forEach(function (x) {
      var r = x.r, line;
      if (r.status && r.status !== "completed") {
        line = lab(STATUSES, r.status) + " — " + TT("no evidence collected", "no se registró evidencia");
      } else {
        var bits = [];
        if (r.eng) bits.push(TT("Engagement", "Participación") + ": " + (r.labs && r.labs.eng ? r.labs.eng : scaleLab("eng", r.eng)));
        if (r.ind) bits.push(TT("Independence", "Independencia") + ": " + (r.labs && r.labs.ind ? r.labs.ind : scaleLab("ind", r.ind)));
        if (r.perf) bits.push(TT("Performance", "Desempeño") + ": " + (r.labs && r.labs.perf ? r.labs.perf : scaleLab("perf", r.perf)));
        if (r.supports && r.supports.length) bits.push(TT("Supports", "Apoyos") + ": " + r.supports.map(function (v) { return v === "other" && r.supportOther ? r.supportOther : lab(SUPPORTS, v); }).join(", "));
        if (r.note) bits.push("“" + r.note + "”");
        line = bits.join(" · ");
      }
      rows.push({ date: x.date, ts: r.timestamp || "", srcKey: "obs",
        srcLabel: TT("Teacher observation", "Observación docente"),
        ctx: (r.p === 0 ? TT("Advisory", "Asesoría") : TT("Period ", "Periodo ") + r.p) + (r.course ? " · " + r.course : ""),
        line: line });
    });
    /* the team/daily support log — the existing SEL instrument, labeled apart */
    rowsFromStore("aog.daily.v1", sid).forEach(function (x) {
      var r = x.r; if (!r) return;
      var who = "";
      try { who = (typeof window.aogRoleLabel === "function" && r.respondentRole) ? window.aogRoleLabel(r.respondentRole) : (r.respondentRole || ""); } catch (e) {}
      var shorts = [];
      try { (r.obs || []).forEach(function (k2) { var s = window.AOG_OBS ? AOG_OBS.shortOf(k2, TT("en", "es") === "es") : ""; if (s) shorts.push(s); }); } catch (e) {}
      rows.push({ date: x.date, ts: r.timestamp || "", srcKey: "daily",
        srcLabel: TT("Support check-in", "Registro de apoyo"),
        ctx: (r.period || "") + (who ? " · " + who : ""),
        line: shorts.length ? shorts.join(" · ") : (r.note ? "“" + r.note + "”" : TT("logged", "registrado")) });
    });
    /* the student's own voice — presence and structure, never their words */
    rowsFromStore("aog.exit.v1", sid).forEach(function (x) {
      var r = x.r; if (!r) return;
      var bits = [];
      if (r.favClass) bits.push(TT("easiest: ", "más fácil: ") + r.favClass);
      if (r.hardClass) bits.push(TT("hardest: ", "más difícil: ") + r.hardClass);
      rows.push({ date: x.date, ts: r.timestamp || "", srcKey: "student",
        srcLabel: TT("Student voice · exit slip", "Voz del estudiante · boleta de salida"),
        ctx: TT("end of day — the whole day", "fin del día — el día completo"),
        line: bits.length ? bits.join(" · ") : TT("completed", "completada") });
    });
    rowsFromStore("aog.checkin.student.v1", sid).forEach(function (x) {
      var r = x.r; if (!r) return;
      if (r.respondentRole && r.respondentRole !== "student") return; /* an adult's row is not the student's account */
      rows.push({ date: x.date, ts: r.timestamp || "", srcKey: "student",
        srcLabel: TT("Student voice · check-in", "Voz del estudiante · reflexión"),
        ctx: r.period ? String(r.period) : "",
        line: (r.followUp ? TT("asked to talk to an adult", "pidió hablar con un adulto") : TT("completed", "completada")) });
    });
    rows.sort(function (a, b) { return (b.date + "T" + (b.ts || "")).localeCompare(a.date + "T" + (a.ts || "")); });
    /* group to the newest N distinct days */
    var days = [], byDay = {};
    rows.forEach(function (r) {
      if (!byDay[r.date]) { byDay[r.date] = []; days.push(r.date); }
      byDay[r.date].push(r);
    });
    var take = days.slice(0, maxDays || 10);
    return { days: take, byDay: byDay, more: Math.max(0, days.length - take.length) };
  }

  /* ------------------------------------------------------------- UI state */
  var ST = {}; /* per sid: {open, date, form:{...}, edit, mopen, topen, copen} */
  function stFor(sid) { var K = key(sid); if (!ST[K]) ST[K] = { date: todayISO() }; return ST[K]; }

  /* ---------------------------------------------------------------- style */
  function css() {
    if (el("aog-evl-css")) return;
    var st = document.createElement("style"); st.id = "aog-evl-css";
    st.textContent = [
      ".evl{margin:10px 0 18px;border:1.5px solid var(--rule,#E4DAC5);border-radius:14px;background:var(--card,#fff);overflow:hidden;}",
      ".evl-mile{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;padding:12px 16px;border-bottom:1px solid var(--rule,#E4DAC5);}",
      ".evl-kind{font-size:10.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);border:1px solid var(--gold,#D9A33B);border-radius:999px;padding:2px 10px;white-space:nowrap;}",
      ".evl-mile-h{font-size:14px;font-weight:700;color:var(--ink,#0A1E33);}",
      ".evl-mile-s{flex-basis:100%;font-size:12px;line-height:1.6;color:var(--ink-soft,#46506E);max-width:72ch;}",
      ".evl-path{flex-basis:100%;font-size:11.5px;color:var(--ink-soft,#46506E);display:flex;gap:6px;flex-wrap:wrap;align-items:center;}",
      ".evl-path .st{border:1px solid var(--rule,#E4DAC5);border-radius:999px;padding:2px 10px;}",
      ".evl-path .st.now{border-color:var(--navy,#0A1E33);font-weight:800;color:var(--ink,#0A1E33);}",
      ":root[data-theme=\"dark\"] .evl-path .st.now{border-color:var(--gold,#D9A33B);color:var(--gold,#D9A33B);}",
      ".evl-path .ar{opacity:.6;}",
      ".evl > details > summary{cursor:pointer;list-style:none;display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;padding:11px 52px 11px 16px;position:relative;font-size:13px;font-weight:700;color:var(--ink,#0A1E33);transition:background .15s ease;}",
      ".evl > details > summary::-webkit-details-marker{display:none;}",
      ".evl > details > summary:focus-visible{outline:2px solid var(--gold,#D9A33B);outline-offset:-2px;}",
      /* .30gx · the row read as a static caption (Jimmy: 'hard to realize is a drop down tab') — same caret-pill affordance as the .30gw card fold, flipping with open state. */
      ".evl > details > summary::after{content:'\\25B8';position:absolute;right:12px;top:50%;transform:translateY(-50%);width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;line-height:1;color:var(--gold-deep,#7E5B18);background:var(--card,#fff);border:1.5px solid var(--gold-pale,#F1DFA8);border-radius:999px;box-shadow:0 1px 3px rgba(10,30,51,.10);pointer-events:none;}",
      ".evl > details[open] > summary::after{content:'\\25BE';}",
      ".evl > details > summary:hover{background:color-mix(in srgb, var(--gold,#D9A33B) 7%, transparent);}",
      ".evl > details > summary:hover::after{border-color:var(--gold,#D9A33B);color:var(--navy,#0A1E33);}",
      ".evl-sumn{font-weight:500;color:var(--ink-soft,#46506E);font-size:12.5px;}",
      ".evl-body{padding:4px 16px 16px;}",
      ".evl-datebar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0 12px;}",
      ".evl-datebar input[type=date]{font:inherit;font-size:13px;color:var(--ink,#0A1E33);background:var(--card,#fff);border:1.5px solid var(--rule,#E4DAC5);border-radius:9px;padding:7px 10px;}",
      ".evl-ib{font:inherit;font-size:13px;font-weight:700;border:1.5px solid var(--rule,#E4DAC5);background:transparent;color:inherit;border-radius:8px;padding:6px 11px;cursor:pointer;}",
      ".evl-ib:focus-visible{outline:2px solid var(--gold,#D9A33B);outline-offset:2px;}",
      ".evl-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:9px 10px;border:1px solid var(--rule,#E4DAC5);border-radius:11px;margin-bottom:7px;background:var(--card,#fff);}",
      ".evl-row .per{flex:0 0 78px;font-size:12px;font-weight:800;color:var(--ink-soft,#46506E);}",
      ".evl-row .cls{flex:1;min-width:150px;font-size:13px;color:var(--ink,#0A1E33);line-height:1.4;}",
      ".evl-row .cls .t{display:block;font-size:11.5px;color:var(--ink-soft,#46506E);}",
      ".evl-chip{font-size:11.5px;font-weight:700;border:1px solid var(--rule,#E4DAC5);border-radius:999px;padding:3px 11px;color:var(--ink-soft,#46506E);white-space:nowrap;}",
      ".evl-chip.done{border-color:var(--green,#2E6B3A);color:var(--green,#2E6B3A);}",
      ".evl-chip.pend{border-style:dashed;}",
      ".evl-note{font-size:11.5px;line-height:1.6;color:var(--ink-soft,#46506E);margin:10px 0 0;max-width:74ch;}",
      ".evl-form{border:1.5px solid var(--navy,#0A1E33);border-radius:12px;padding:12px 14px;margin:4px 0 10px;}",
      ":root[data-theme=\"dark\"] .evl-form{border-color:var(--gold,#D9A33B);}",
      ".evl-form .fh{font-size:13.5px;font-weight:800;color:var(--ink,#0A1E33);margin-bottom:2px;}",
      ".evl-form .fs{font-size:11.5px;color:var(--ink-soft,#46506E);margin-bottom:10px;}",
      ".evl-q{font-size:12.5px;font-weight:700;color:var(--ink,#0A1E33);margin:12px 0 6px;}",
      ".evl-opts{display:flex;gap:6px;flex-wrap:wrap;}",
      ".evl-opt{font:inherit;font-size:12.5px;border:1.5px solid var(--rule,#E4DAC5);background:var(--card,#fff);color:inherit;border-radius:999px;padding:7px 13px;cursor:pointer;min-height:36px;}",
      ":root[data-theme=\"dark\"] .evl-opt{background:rgba(255,255,255,.05);}",
      ".evl-opt[aria-pressed=\"true\"]{background:var(--navy,#0A1E33);border-color:var(--navy,#0A1E33);color:#fff;font-weight:700;}",
      ":root[data-theme=\"dark\"] .evl-opt[aria-pressed=\"true\"]{background:var(--gold,#D9A33B);border-color:var(--gold,#D9A33B);color:#0A1E33;}",
      ".evl-opt:focus-visible{outline:2px solid var(--gold,#D9A33B);outline-offset:2px;}",
      ".evl-form textarea,.evl-form input[type=text]{font:inherit;font-size:13px;color:var(--ink,#0A1E33);background:var(--card,#fff);border:1.5px solid var(--rule,#E4DAC5);border-radius:9px;padding:8px 11px;width:100%;max-width:520px;display:block;}",
      ":root[data-theme=\"dark\"] .evl-form textarea,:root[data-theme=\"dark\"] .evl-form input[type=text]{background:rgba(255,255,255,.05);color:inherit;}",
      ".evl-form select{font:inherit;font-size:13px;color:var(--ink,#0A1E33);background:var(--card,#fff);border:1.5px solid var(--rule,#E4DAC5);border-radius:9px;padding:7px 10px;}",
      ".evl-save{font:inherit;font-size:13.5px;font-weight:800;color:#fff;background:var(--navy,#0A1E33);border:0;border-radius:999px;padding:10px 20px;cursor:pointer;}",
      ":root[data-theme=\"dark\"] .evl-save{background:var(--gold,#D9A33B);color:#0A1E33;}",
      ".evl-save:focus-visible{outline:2px solid var(--gold,#D9A33B);outline-offset:2px;}",
      ".evl-tl-day{margin:12px 0 4px;font-size:12px;font-weight:800;color:var(--ink-soft,#46506E);letter-spacing:.04em;}",
      ".evl-tl-row{display:flex;gap:10px;align-items:baseline;padding:8px 10px;border-top:1px solid var(--rule,#E4DAC5);flex-wrap:wrap;}",
      ".evl-tl-src{flex:0 0 190px;font-size:11.5px;font-weight:800;color:var(--ink,#0A1E33);}",
      ".evl-tl-src.student{color:var(--gold-deep,#9a6f24);}",
      ":root[data-theme=\"dark\"] .evl-tl-src.student{color:var(--gold,#D9A33B);}",
      ".evl-tl-what{flex:1;min-width:200px;font-size:12.5px;color:var(--ink-soft,#46506E);line-height:1.55;}",
      ".evl-tl-what .cx{display:block;font-size:11px;color:var(--ink-soft,#46506E);}",
      ".evl-sub{margin:14px 0 0;border-top:1px dashed var(--rule,#E4DAC5);padding-top:10px;}",
      ".evl-sub > summary{cursor:pointer;font-size:12.5px;font-weight:700;color:var(--ink-soft,#46506E);}",
      ".evl-sub > summary:focus-visible{outline:2px solid var(--gold,#D9A33B);outline-offset:2px;}",
      ".evl-ed-row{display:grid;grid-template-columns:64px 1fr 130px 70px 74px 34px;gap:6px;align-items:center;margin-bottom:6px;}",
      ".evl-ed-row input,.evl-ed-row select{font:inherit;font-size:12px;color:var(--ink,#0A1E33);background:var(--card,#fff);border:1px solid var(--rule,#E4DAC5);border-radius:7px;padding:6px 8px;min-width:0;}",
      ":root[data-theme=\"dark\"] .evl-ed-row input,:root[data-theme=\"dark\"] .evl-ed-row select{background:rgba(255,255,255,.05);color:inherit;}",
      ".evl-ed-l{font-size:11px;font-weight:800;color:var(--ink-soft,#46506E);}",
      ".evl-byc{border:1px solid var(--rule,#E4DAC5);border-radius:11px;padding:9px 12px;margin-bottom:7px;}",
      ".evl-byc .h{font-size:12.5px;font-weight:800;color:var(--ink,#0A1E33);}",
      ".evl-byc .b{font-size:12px;color:var(--ink-soft,#46506E);line-height:1.6;margin-top:3px;}",
      "@media (max-width:640px){.evl-ed-row{grid-template-columns:52px 1fr 92px;} .evl-ed-row .ed-xtra{display:none;} .evl-tl-src{flex-basis:100%;}}",
      ".evl-qrrow{flex-basis:100%;display:flex;gap:10px;align-items:center;padding:8px 2px 2px;}",
      ".evl-qrrow .qr{background:#fff;padding:8px;border:1px solid var(--rule,#E4DAC5);border-radius:8px;line-height:0;}",
      ".evl-qrrow .qh{font-size:11.5px;color:var(--ink-soft,#46506E);line-height:1.5;max-width:32ch;}",
      /* 16px on touch, or iOS zooms on focus and the page wobbles — same rule
         the check-in screens carry. */
      "@media (pointer:coarse), (max-width:740px){.evl-form textarea,.evl-form input[type=text],.evl-form select,.evl-ed-row input:not([type=checkbox]),.evl-ed-row select,.evl-datebar input[type=date]{font-size:16px !important;}}"
    ].join("\n");
    document.head.appendChild(st);
  }

  /* ------------------------------------------------------------ rendering */
  function dateWords(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ""); if (!m) return iso || "";
    var es = TT("en", "es") === "es";
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12));
    try { return d.toLocaleDateString(es ? "es" : "en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }); } catch (e) { return iso; }
  }
  function monthWords(ym) {
    var m = /^(\d{4})-(\d{2})$/.exec(ym || ""); if (!m) return ym || "";
    var es = TT("en", "es") === "es";
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, 15, 12));
    try { return d.toLocaleDateString(es ? "es" : "en-US", { month: "long", year: "numeric", timeZone: "UTC" }); } catch (e) { return ym; }
  }

  function mileHTML(sid) {
    var mi = mileFor(sid);
    if (!mi || !mi.kind) return "";
    var h = '<div class="evl-mile">';
    var today = todayISO();
    if (mi.kind === "reeval") {
      h += '<span class="evl-kind">' + esc(TT("Reevaluation", "Reevaluación")) + "</span>";
      var passed = mi.date && mi.date <= today;
      if (mi.date && !passed) {
        h += '<span class="evl-mile-h">' + esc(TT("Upcoming milestone: domain meeting — ", "Próximo hito: reunión de dominios — ") + dateWords(mi.date)) + "</span>";
        h += '<span class="evl-mile-s">' + esc(TT(
          "The domain meeting decides which areas will be evaluated. Nothing is pre-assigned here — the evidence collected below travels with the student into that decision.",
          "La reunión de dominios decide qué áreas se evaluarán. Nada está preasignado aquí — la evidencia reunida abajo acompaña al estudiante a esa decisión.")) + "</span>";
      } else if (mi.date && passed && !(mi.domains && String(mi.domains).trim())) {
        h += '<span class="evl-mile-h">' + esc(TT("Domain meeting was ", "La reunión de dominios fue el ") + dateWords(mi.date)) + "</span>";
        h += '<span class="evl-mile-s">' + esc(TT(
          "When the team has decided, record the evaluation areas below (Milestone setup). Evidence collection continues either way.",
          "Cuando el equipo haya decidido, registra las áreas de evaluación abajo (Configurar hito). La recolección de evidencia continúa igual.")) + "</span>";
      } else if (mi.domains && String(mi.domains).trim()) {
        h += '<span class="evl-mile-h">' + esc(TT("Evaluation areas the team chose: ", "Áreas de evaluación elegidas por el equipo: ") + mi.domains) + "</span>";
      } else {
        h += '<span class="evl-mile-h">' + esc(TT("Domain meeting not yet scheduled", "Reunión de dominios sin fecha aún")) + "</span>";
      }
      var stage = (!mi.date || !passed) ? 0 : (mi.domains && String(mi.domains).trim()) ? 2 : 1;
      var steps = [
        TT("Evidence", "Evidencia"), TT("Domain meeting", "Reunión de dominios"),
        TT("Evaluation / testing", "Evaluación / pruebas"), TT("Results", "Resultados"),
        TT("IEP team synthesis", "Síntesis del equipo IEP")];
      h += '<span class="evl-path">' + steps.map(function (s, i) {
        return '<span class="st' + (i === stage ? " now" : "") + '">' + esc(s) + "</span>" + (i < steps.length - 1 ? '<span class="ar" aria-hidden="true">→</span>' : "");
      }).join("") + "</span>";
    } else if (mi.kind === "annual") {
      h += '<span class="evl-kind">' + esc(TT("Annual review", "Revisión anual")) + "</span>";
      var when = mi.date ? (/^\d{4}-\d{2}$/.test(mi.date) ? monthWords(mi.date) : dateWords(mi.date)) : "";
      h += '<span class="evl-mile-h">' + esc(TT("Upcoming milestone: annual review", "Próximo hito: revisión anual") + (when ? " — " + when : "")) + "</span>";
      var steps2 = [TT("Current evidence", "Evidencia actual"), TT("Fall evidence", "Evidencia de otoño"), TT("Annual review", "Revisión anual"), TT("IEP review / progress discussion", "Revisión del IEP / progreso")];
      h += '<span class="evl-path">' + steps2.map(function (s, i) {
        return '<span class="st' + (i === 0 ? " now" : "") + '">' + esc(s) + "</span>" + (i < steps2.length - 1 ? '<span class="ar" aria-hidden="true">→</span>' : "");
      }).join("") + "</span>";
    }
    h += "</div>";
    return h;
  }

  function chipFor(state) {
    if (state.k === "pending") return '<span class="evl-chip pend">' + esc(TT("not yet", "aún no")) + "</span>";
    if (state.k === "completed") return '<span class="evl-chip done">✓ ' + esc(TT("completed", "completado")) + (state.n > 1 ? " ×" + state.n : "") + "</span>";
    return '<span class="evl-chip">' + esc(lab(STATUSES, state.k)) + "</span>";
  }

  function formHTML(sid, c) {
    var S = stFor(sid), f = S.form || {};
    var h = '<div class="evl-form" data-evlstop="1">';
    h += '<div class="fh">' + esc((c.p === 0 ? TT("Advisory", "Asesoría") : TT("Period ", "Periodo ") + (c.pFrom != null ? c.pFrom + "–" + c.p : c.p)) + " · " + (c.course || "")) + (c.teacher ? ' <span style="font-weight:500;">— ' + esc(c.teacher) + "</span>" : "") + "</div>";
    h += '<div class="fs">' + esc(TT("Thirty seconds. You are describing what you saw — not grading the student, and not diagnosing anything.", "Treinta segundos. Describes lo que viste — no calificas al estudiante ni diagnosticas nada.")) + "</div>";
    SCALES.forEach(function (sc) {
      h += '<div class="evl-q">' + esc(TT(sc.en, sc.es)) + "</div><div class=\"evl-opts\" role=\"group\">";
      sc.opts.forEach(function (o) {
        h += '<button type="button" class="evl-opt" aria-pressed="' + (f[sc.k] === o.v ? "true" : "false") + '" data-evl="pick" data-sid="' + esc(sid) + '" data-k="' + sc.k + '" data-v="' + o.v + '">' + esc(TT(o.en, o.es)) + "</button>";
      });
      h += "</div>";
    });
    h += '<div class="evl-q">' + esc(TT("What support helped? (tap any)", "¿Qué apoyo ayudó? (toca los que apliquen)")) + "</div><div class=\"evl-opts\">";
    SUPPORTS.forEach(function (o) {
      var on = (f.supports || []).indexOf(o.v) >= 0;
      h += '<button type="button" class="evl-opt" aria-pressed="' + (on ? "true" : "false") + '" data-evl="sup" data-sid="' + esc(sid) + '" data-v="' + o.v + '">' + esc(TT(o.en, o.es)) + "</button>";
    });
    h += "</div>";
    if ((f.supports || []).indexOf("other") >= 0) {
      h += '<input type="text" maxlength="60" placeholder="' + esc(TT("What was the other support?", "¿Cuál fue el otro apoyo?")) + '" value="' + esc(f.supportOther || "") + '" data-evlin="supother" data-sid="' + esc(sid) + '" style="margin-top:8px;">';
    }
    /* optional goal link — never required */
    var goals = [];
    try {
      var iep = jload("aog.iep.v1", {}) || {};
      Object.keys(iep.goals || {}).forEach(function (gid) {
        var g = iep.goals[gid];
        if (g && !g.archived && key(g.student) === key(sid)) goals.push({ id: gid, lab: String(g.title || "").slice(0, 90) });
      });
    } catch (e) {}
    if (goals.length) {
      h += '<div class="evl-q">' + esc(TT("Speaks to an IEP goal? Optional — evidence counts either way.", "¿Habla de una meta del IEP? Opcional — la evidencia cuenta igual.")) + "</div><div class=\"evl-opts\">";
      goals.forEach(function (g) {
        var on = (f.goals || []).some(function (x) { return x.id === g.id; });
        h += '<button type="button" class="evl-opt" aria-pressed="' + (on ? "true" : "false") + '" data-evl="goal" data-sid="' + esc(sid) + '" data-v="' + esc(g.id) + '" data-lab="' + esc(g.lab) + '" style="font-size:11.5px;max-width:340px;text-align:left;">' + esc(g.lab) + "…</button>";
      });
      h += "</div>";
    }
    h += '<div class="evl-q">' + esc(TT("Anything the case manager should know? Optional.", "¿Algo que deba saber quien gestiona el caso? Opcional.")) + "</div>";
    h += '<textarea rows="2" maxlength="400" data-evlin="note" data-sid="' + esc(sid) + '">' + esc(f.note || "") + "</textarea>";
    h += '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px;">';
    h += '<button type="button" class="evl-save" data-evl="save" data-sid="' + esc(sid) + '">' + esc(TT("Save this observation", "Guardar esta observación")) + "</button>";
    h += '<select data-evlin="role" data-sid="' + esc(sid) + '" aria-label="' + esc(TT("Who is recording this?", "¿Quién registra esto?")) + '">';
    [["teacher", TT("Teacher", "Docente")], ["special_educator", TT("Special educator", "Educador/a especial")], ["related_service", TT("Related service provider", "Servicios relacionados")], ["para", TT("Paraprofessional", "Paraprofesional")], ["other_staff", TT("Other staff", "Otro personal")]].forEach(function (r) {
      h += '<option value="' + r[0] + '"' + ((f.role || "teacher") === r[0] ? " selected" : "") + ">" + esc(r[1]) + "</option>";
    });
    h += "</select>";
    h += '<button type="button" class="evl-ib" data-evl="close" data-sid="' + esc(sid) + '">' + esc(TT("Cancel", "Cancelar")) + "</button>";
    h += "</div>";
    h += '<div class="evl-q" style="margin-top:14px;">' + esc(TT("Couldn't observe this class today?", "¿No se pudo observar esta clase hoy?")) + "</div><div class=\"evl-opts\">";
    STATUSES.forEach(function (o) {
      h += '<button type="button" class="evl-opt" data-evl="status" data-sid="' + esc(sid) + '" data-v="' + o.v + '">' + esc(TT(o.en, o.es)) + "</button>";
    });
    h += "</div>";
    h += '<div class="evl-note">' + esc(TT("A status explains a gap; it is never a fact about the student. Leaving a class blank is also fine — blank only ever means “no evidence collected”.", "Un estado explica un vacío; nunca es un hecho sobre el estudiante. Dejar la clase en blanco también está bien — en blanco solo significa “sin evidencia registrada”.")) + "</div>";
    h += "</div>";
    return h;
  }

  function dayHTML(sid, rec) {
    var S = stFor(sid);
    var iso = S.date || todayISO();
    var list = classesOn(rec, iso);
    var entries = entriesFor(sid, iso);
    var h = '<div class="evl-datebar">';
    h += '<button type="button" class="evl-ib" data-evl="day" data-sid="' + esc(sid) + '" data-d="-1" aria-label="' + esc(TT("Previous day", "Día anterior")) + '">‹</button>';
    h += '<input type="date" value="' + esc(iso) + '" data-evlin="date" data-sid="' + esc(sid) + '">';
    h += '<button type="button" class="evl-ib" data-evl="day" data-sid="' + esc(sid) + '" data-d="1" aria-label="' + esc(TT("Next day", "Día siguiente")) + '">›</button>';
    h += '<span class="evl-sumn">' + esc(dateWords(iso)) + "</span></div>";
    if (!list.length) {
      h += '<div class="evl-note">' + esc(TT("No classes are expected on this day.", "No se esperan clases este día.")) + "</div>";
      return h;
    }
    list.forEach(function (c) {
      var state = classState(entries, c);
      var open = S.form && S.form.cid === classId(c);
      h += '<div class="evl-row">'
        + '<span class="per">' + esc(c.p === 0 ? TT("Advisory", "Asesoría") : TT("Per. ", "Per. ") + (c.pFrom != null ? c.pFrom + "–" + c.p : c.p)) + "</span>"
        + '<span class="cls">' + esc(c.course || "") + (c.teacher ? '<span class="t">' + esc(c.teacher) + (c.room ? " · " + esc(TT("Rm ", "Aula ")) + esc(c.room) : "") + (c.term && c.term !== "YR" ? " · " + esc(c.term) : "") + "</span>" : "") + "</span>"
        + (c.counts === false ? '<span class="evl-chip">' + esc(TT("context only", "solo contexto")) + "</span>" : chipFor(state))
        + (c.counts === false ? "" : '<button type="button" class="evl-ib" data-evl="open" data-sid="' + esc(sid) + '" data-cid="' + esc(classId(c)) + '">' + esc(state.k === "pending" ? TT("Check in", "Registrar") : TT("Add another", "Agregar otra")) + "</button>")
        + "</div>";
      if (open) h += formHTML(sid, c);
    });
    /* the student's own end of day */
    var slips = exitFor(sid, iso);
    h += '<div class="evl-row"><span class="per">' + esc(TT("End of day", "Fin del día")) + "</span>"
      + '<span class="cls">' + esc(TT("Student exit slip — the whole day, in the student's own hands", "Boleta de salida — el día completo, en manos del estudiante")) + "</span>"
      + (slips ? '<span class="evl-chip done">✓ ' + esc(TT("completed", "completada")) + "</span>" : '<span class="evl-chip pend">' + esc(TT("not yet", "aún no")) + "</span>")
      + "</div>";
    var counts = dayCounts(rec, entries, iso);
    h += '<div class="evl-note"><b>' + esc(TT("Collection status: ", "Estado de recolección: ")) + counts.completed + " / " + counts.expected + " " + esc(TT("teacher check-ins", "registros docentes")) + (counts.statused ? " · " + counts.statused + " " + esc(TT("explained", "explicados")) : "") + " · " + esc(TT("exit slip ", "boleta ")) + (slips ? "✓" : esc(TT("not yet", "aún no"))) + "</b> — "
      + esc(TT("a count of what has been collected, never a score. A blank means no evidence was collected — nothing more.", "un conteo de lo recolectado, nunca una calificación. Un espacio en blanco significa que no se registró evidencia — nada más.")) + "</div>";
    return h;
  }

  /* ============================== ADULT TEAM LINKS ==============================
     One link per class on the student's actual schedule, for the adult who
     teaches it. The link opens the ADULT support check-in with the student,
     the period and the role already on it — observe, tap, submit, done.

     ⚠ NOTHING IS MINTED AND NOTHING CAN BE LOST. A link here is a pure
     function of its own settings (student code, period, role, destination,
     and the staff check `sk` computed from values in the URL itself), built
     fresh on every render. Losing one costs nothing: copying it again
     produces the identical URL. There is no token store to leak or expire.

     ⚠ THE GRAMMAR IS linkFrom()'s, NOT A SECOND ONE. checkin=support,
     who=staff, sync=on, period, staffRole, org/dest, sk — assembled through
     the same exported helpers the Distribute card uses (aogShareBase_,
     aogOrgId_, aogDestParam_, aogStaffTokenFor), so a change to the link
     grammar lands here for free. `sid` rides on it the same way the per-
     student class links already carry it: a code in a link is a WRITE
     credential, never a read one — the adult form is pre-addressed, and
     nothing about the student's past is readable from it.

     ⚠ NEVER checkin= AND exit= ON ONE LINK. This builds check-in links only.
     =========================================================================== */
  function teamLinkFor(sid, c) {
    var base = "";
    try { base = (typeof window.aogShareBase_ === "function" && window.aogShareBase_("support")) || ""; } catch (e) {}
    if (!base) {
      base = (location.protocol === "http:" || location.protocol === "https:") ? (location.origin + location.pathname) : "";
    }
    if (!base) return "";
    var p = new URLSearchParams();
    p.set("checkin", "support");
    p.set("who", "staff");
    p.set("sync", "on");
    try { if ((document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es") p.set("lang", "es"); } catch (e) {}
    p.set("period", periodStore(c.p));
    p.set("staffRole", "teacher");
    p.set("sid", key(sid));
    try { var org = (typeof window.aogOrgId_ === "function") ? window.aogOrgId_() : ""; if (org) p.set("org", org); } catch (e) {}
    try { var dp = (typeof window.aogDestParam_ === "function") ? window.aogDestParam_() : ""; if (dp) p.set((typeof AOG_DEST_PARAM !== "undefined" && AOG_DEST_PARAM) || "dest", dp); } catch (e) {}
    try { if (typeof window.aogStaffTokenFor === "function") p.set("sk", window.aogStaffTokenFor("", "", "support")); } catch (e) {}
    return base + "?" + p.toString();
  }
  function linkRowsFor(sid, rec) {
    var list = ((rec && rec.classes) || []).filter(function (c) {
      return c && c.counts !== false && c.kind !== "lunch";
    }).slice().sort(function (a, b) { return (a.p || 0) - (b.p || 0); });
    return mergeBlocks(list).map(function (c) { return { c: c, url: teamLinkFor(sid, c) }; });
  }
  function linksHTML(sid, rec) {
    if (!rec || !(rec.classes || []).length) {
      return '<div class="evl-note">' + esc(TT("Set up the schedule first — the links are built from it.", "Configura primero el horario — los enlaces se construyen a partir de él.")) + "</div>";
    }
    var rows = linkRowsFor(sid, rec);
    var destOn = false;
    try { destOn = !!(typeof window.aogDestParam_ === "function" && window.aogDestParam_()); } catch (e) {}
    var h = '<div class="evl-note" style="margin-bottom:10px;">' + esc(TT(
      "Send each adult their one link — text, email, or a QR from Set up ▸ Distribute. It opens the thirty-second adult check-in already addressed to this student and this period, on any phone or laptop, no login. The same link works every day, all year. If anyone loses it, copy it again right here — it rebuilds identically, because nothing is stored in it that this screen cannot rebuild.",
      "Envía a cada adulto su enlace — por mensaje, correo o un QR desde Configurar ▸ Distribuir. Abre el registro adulto de treinta segundos ya dirigido a este estudiante y este periodo, en cualquier teléfono o computadora, sin inicio de sesión. El mismo enlace sirve todos los días, todo el año. Si alguien lo pierde, cópialo de nuevo aquí — se reconstruye idéntico, porque no guarda nada que esta pantalla no pueda reconstruir.")) + "</div>";
    if (!destOn) {
      h += '<div class="evl-note" style="border:1px solid var(--gold,#D9A33B);border-radius:9px;padding:8px 11px;margin-bottom:10px;">' + esc(TT(
        "These links carry no Sheet destination yet, so what a colleague submits stays on their own device. Connect your Sheet in Set up ▸ Connect & sync, then copy the links again.",
        "Estos enlaces aún no llevan destino de hoja de cálculo, así que lo que un colega envíe se queda en su propio dispositivo. Conecta tu Hoja en Configurar ▸ Conectar y sincronizar, y copia los enlaces de nuevo.")) + "</div>";
    }
    rows.forEach(function (x) {
      var c = x.c;
      h += '<div class="evl-row">'
        + '<span class="per">' + esc(c.p === 0 ? TT("Advisory", "Asesoría") : TT("Per. ", "Per. ") + (c.pFrom != null ? c.pFrom + "–" + c.p : c.p)) + "</span>"
        + '<span class="cls">' + esc(c.course || "") + (c.teacher ? '<span class="t">' + esc(c.teacher) + (c.term && c.term !== "YR" ? " · " + esc(c.term) : "") + "</span>" : "") + "</span>"
        + '<button type="button" class="evl-ib" data-evl="copylink" data-sid="' + esc(sid) + '" data-url="' + esc(x.url) + '">' + esc(TT("Copy link", "Copiar enlace")) + "</button>"
        + '<button type="button" class="evl-ib" data-evl="qrtoggle" data-sid="' + esc(sid) + '" data-cid="' + esc(classId(c)) + '" aria-expanded="' + ((stFor(sid).qrs || {})[classId(c)] ? "true" : "false") + '">QR</button>'
        + (((stFor(sid).qrs || {})[classId(c)])
            ? '<span class="evl-qrrow"><span class="qr" data-url="' + esc(x.url) + '"></span><span class="qh">' + esc(TT("Scan to open this class's check-in — same as the link. Right-click to save the image, or use the teacher's printable sheet above.", "Escanea para abrir el registro de esta clase — igual que el enlace. Clic derecho para guardar la imagen, o usa la hoja imprimible del docente arriba.")) + "</span></span>"
            : "")
        + "</div>";
    });
    h += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">'
      + '<button type="button" class="evl-ib" data-evl="copyall" data-sid="' + esc(sid) + '">' + esc(TT("Copy all, ready to paste into an email", "Copiar todos, listos para pegar en un correo")) + "</button>"
      + '<span class="evl-sumn" data-evlcopied="' + esc(sid) + '"></span></div>';
    h += '<div class="evl-note">' + esc(TT(
      "What comes back: a colleague's check-in lands in your Sheet, and Check-ins ▸ Pull check-ins brings it into this dashboard — from there it appears in this student's evidence timeline, labeled as their observation.",
      "Lo que vuelve: el registro de un colega llega a tu Hoja, y Registros ▸ Traer registros lo trae a este panel — desde ahí aparece en la línea de evidencia del estudiante, etiquetado como su observación.")) + "</div>";
    return h;
  }

  function byClassHTML(sid, rec) {
    var all = rowsFromStore(EKEY, sid);
    if (!all.length) return '<div class="evl-note">' + esc(TT("No class observations yet.", "Aún no hay observaciones por clase.")) + "</div>";
    var by = {};
    all.forEach(function (x) {
      var r = x.r, k2 = (r.p || 0) + "|" + (r.course || "");
      (by[k2] = by[k2] || []).push(x);
    });
    var h = "";
    Object.keys(by).sort().forEach(function (k2) {
      var xs = by[k2]; xs.sort(function (a, b) { return a.date.localeCompare(b.date); });
      var r0 = xs[xs.length - 1].r;
      var obs = xs.filter(function (x) { return !x.r.status || x.r.status === "completed"; });
      var sup = {};
      obs.forEach(function (x) { (x.r.supports || []).forEach(function (v) { sup[v] = (sup[v] || 0) + 1; }); });
      var supLine = Object.keys(sup).map(function (v) { return lab(SUPPORTS, v) + (sup[v] > 1 ? " ×" + sup[v] : ""); }).join(", ");
      var tally = function (fk) {
        var t = {};
        obs.forEach(function (x) { var v = x.r[fk]; if (v) t[v] = (t[v] || 0) + 1; });
        return Object.keys(t).map(function (v) { return scaleLab(fk, v) + " ×" + t[v]; }).join(" · ");
      };
      h += '<div class="evl-byc"><div class="h">' + esc((r0.p === 0 ? TT("Advisory", "Asesoría") : TT("Period ", "Periodo ") + r0.p) + " · " + (r0.course || "")) + (r0.teacher ? " — " + esc(r0.teacher) : "") + "</div>"
        + '<div class="b">' + obs.length + " " + esc(obs.length === 1 ? TT("observation", "observación") : TT("observations", "observaciones")) + " · " + esc(TT("latest ", "última ")) + esc(xs[xs.length - 1].date)
        + (tally("eng") ? "<br>" + esc(TT("Engagement: ", "Participación: ")) + esc(tally("eng")) : "")
        + (tally("ind") ? "<br>" + esc(TT("Independence: ", "Independencia: ")) + esc(tally("ind")) : "")
        + (tally("perf") ? "<br>" + esc(TT("Performance: ", "Desempeño: ")) + esc(tally("perf")) : "")
        + (supLine ? "<br>" + esc(TT("Supports that helped: ", "Apoyos que ayudaron: ")) + esc(supLine) : "")
        + "</div></div>";
    });
    h += '<div class="evl-note">' + esc(TT("Counts of what was observed, class by class — patterns to notice, never a conclusion. The same student can look different in different rooms; that difference is information.", "Conteos de lo observado, clase por clase — patrones para notar, nunca una conclusión. El mismo estudiante puede verse distinto en distintas aulas; esa diferencia es información.")) + "</div>";
    return h;
  }

  function tlHTML(sid) {
    var t = timeline(sid, 10);
    if (!t.days.length) return '<div class="evl-note">' + esc(TT("Nothing in the record yet.", "Aún no hay nada en el registro.")) + "</div>";
    var h = "";
    t.days.forEach(function (d) {
      h += '<div class="evl-tl-day">' + esc(dateWords(d)) + "</div>";
      t.byDay[d].slice().reverse().forEach(function (r) {
        h += '<div class="evl-tl-row"><span class="evl-tl-src' + (r.srcKey === "student" ? " student" : "") + '">' + esc(r.srcLabel) + "</span>"
          + '<span class="evl-tl-what">' + (r.ctx ? '<span class="cx">' + esc(r.ctx) + "</span>" : "") + esc(r.line || "") + "</span></div>";
      });
    });
    if (t.more) h += '<div class="evl-note">' + esc(TT("…and " + t.more + " earlier day(s) in the record.", "…y " + t.more + " día(s) anteriores en el registro.")) + "</div>";
    h += '<div class="evl-note">' + esc(TT("Every line keeps its source. When the teacher's account and the student's differ, both stand — the difference itself may be meaningful. The student's typed words stay in Check-ins ▸ Exit slips, with their whole context.", "Cada línea conserva su fuente. Si la versión del docente y la del estudiante difieren, ambas se mantienen — la diferencia misma puede ser significativa. Las palabras escritas por el estudiante permanecen en Registros ▸ Boletas de salida, con todo su contexto.")) + "</div>";
    return h;
  }

  function schedEdHTML(sid, rec) {
    var h = '<div class="evl-note" style="margin-bottom:10px;">' + esc(TT(
      "Enter the schedule exactly as the school's system shows it — course, teacher, room. It becomes the source of truth for what a complete day of evidence means. Untick “counts” for lunch or anything a check-in should not be expected for. S1/S2 assumes the winter-break boundary; correct the term here if the district calendar says otherwise.",
      "Ingresa el horario tal como lo muestra el sistema escolar — curso, docente, aula. Se convierte en la fuente de verdad de lo que significa un día completo de evidencia. Desmarca “cuenta” para el almuerzo o lo que no deba esperar registro. S1/S2 asume el corte en las vacaciones de invierno; corrige el término aquí si el calendario del distrito dice otra cosa.")) + "</div>";
    h += '<div class="evl-ed-row evl-ed-l"><span>' + esc(TT("Period", "Periodo")) + "</span><span>" + esc(TT("Course", "Curso")) + "</span><span>" + esc(TT("Teacher", "Docente")) + '</span><span class="ed-xtra">' + esc(TT("Room", "Aula")) + '</span><span class="ed-xtra">' + esc(TT("Term", "Término")) + "</span><span>" + esc(TT("Counts", "Cuenta")) + "</span></div>";
    for (var p = 0; p <= 10; p++) {
      /* period 0 is Advisory and meets Wednesdays in this building */
      var rows = ((rec && rec.classes) || []).filter(function (c) { return c.p === p; });
      if (!rows.length) rows = [null];
      rows.forEach(function (c, i) {
        h += '<div class="evl-ed-row">'
          + '<span class="evl-ed-l">' + (p === 0 ? esc(TT("Adv (W)", "Ases (X)")) : p) + (i ? "·" + (i + 1) : "") + "</span>"
          + '<input type="text" maxlength="60" data-evled="course" data-p="' + p + '" data-i="' + i + '" value="' + esc(c ? c.course : "") + '" placeholder="' + esc(p === 0 ? TT("Advisory (leave blank if none)", "Asesoría (vacío si no hay)") : TT("Open period — leave blank", "Periodo libre — deja vacío")) + '">'
          + '<input type="text" maxlength="40" data-evled="teacher" data-p="' + p + '" data-i="' + i + '" value="' + esc(c ? c.teacher : "") + '">'
          + '<input type="text" maxlength="12" class="ed-xtra" data-evled="room" data-p="' + p + '" data-i="' + i + '" value="' + esc(c ? c.room : "") + '">'
          + '<select class="ed-xtra" data-evled="term" data-p="' + p + '" data-i="' + i + '">'
          + ["YR", "S1", "S2"].map(function (t) { return '<option value="' + t + '"' + ((c ? (c.term || "YR") : "YR") === t ? " selected" : "") + ">" + t + "</option>"; }).join("")
          + "</select>"
          + '<input type="checkbox" data-evled="counts" data-p="' + p + '" data-i="' + i + '"' + ((c ? c.counts !== false : true) ? " checked" : "") + ' aria-label="' + esc(TT("Expect a check-in for this class", "Esperar registro para esta clase")) + '">'
          + "</div>";
        if (i === rows.length - 1 && c && p > 0) {
          /* a second line for a semester split lives one tap away */
          h += '<div class="evl-ed-row" style="grid-template-columns:64px auto;"><span></span><button type="button" class="evl-ib" style="justify-self:start;font-size:11px;padding:3px 9px;" data-evl="split" data-sid="' + esc(sid) + '" data-p="' + p + '">' + esc(TT("+ semester split", "+ división semestral")) + "</button></div>";
        }
      });
    }
    h += '<div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;">'
      + '<button type="button" class="evl-save" data-evl="schedsave" data-sid="' + esc(sid) + '">' + esc(TT("Save schedule", "Guardar horario")) + "</button>"
      + "</div>";
    return h;
  }

  function mileEdHTML(sid) {
    var mi = mileFor(sid) || {};
    var h = '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0;">'
      + '<select data-evlmi="kind" data-sid="' + esc(sid) + '" class="evl-ib" style="font-weight:500;">'
      + '<option value=""' + (!mi.kind ? " selected" : "") + ">" + esc(TT("No milestone", "Sin hito")) + "</option>"
      + '<option value="reeval"' + (mi.kind === "reeval" ? " selected" : "") + ">" + esc(TT("Reevaluation (domain meeting first)", "Reevaluación (primero reunión de dominios)")) + "</option>"
      + '<option value="annual"' + (mi.kind === "annual" ? " selected" : "") + ">" + esc(TT("Annual review", "Revisión anual")) + "</option>"
      + "</select>"
      + '<input type="text" maxlength="10" data-evlmi="date" data-sid="' + esc(sid) + '" value="' + esc(mi.date || "") + '" placeholder="' + esc(TT("YYYY-MM-DD or YYYY-MM", "AAAA-MM-DD o AAAA-MM")) + '" style="font:inherit;font-size:12.5px;border:1.5px solid var(--rule,#E4DAC5);border-radius:8px;padding:6px 10px;background:var(--card,#fff);color:inherit;width:150px;">'
      + '<button type="button" class="evl-ib" data-evl="milesave" data-sid="' + esc(sid) + '">' + esc(TT("Save", "Guardar")) + "</button>"
      + "</div>";
    if (mi.kind === "reeval") {
      var today = todayISO();
      var passed = mi.date && mi.date <= today;
      if (passed) {
        h += '<div class="evl-q">' + esc(TT("Evaluation areas the team chose at the domain meeting", "Áreas de evaluación elegidas en la reunión de dominios")) + "</div>"
          + '<input type="text" maxlength="200" data-evlmi="domains" data-sid="' + esc(sid) + '" value="' + esc(mi.domains || "") + '" style="font:inherit;font-size:12.5px;border:1.5px solid var(--rule,#E4DAC5);border-radius:8px;padding:6px 10px;background:var(--card,#fff);color:inherit;width:100%;max-width:520px;">'
          + '<div class="evl-note">' + esc(TT("Record only what the team actually decided.", "Registra solo lo que el equipo realmente decidió.")) + "</div>";
      } else {
        h += '<div class="evl-note">' + esc(TT("Evaluation areas are decided at the domain meeting — this field opens after that date, so nothing is assigned before the team assigns it.", "Las áreas de evaluación se deciden en la reunión de dominios — este campo se abre después de esa fecha, para que nada se asigne antes de que el equipo lo asigne.")) + "</div>";
      }
    }
    return h;
  }

  function hostHTML(sid) {
    var S = stFor(sid);
    var rec = schedFor(sid);
    var mi = mileFor(sid);
    if (!rec && !mi && !S.setup) {
      /* stay quiet for the rest of the caseload: one slim line, no card */
      return '<div class="evl" style="border-style:dashed;background:transparent;"><details' + (S.open ? " open" : "") + ' data-evlod="' + esc(sid) + '"><summary><span>' + esc(TT("Class-by-class evidence", "Evidencia clase por clase")) + '</span><span class="evl-sumn">' + esc(TT("set up a schedule to begin", "configura un horario para empezar")) + "</span></summary>"
        + '<div class="evl-body"><div class="evl-note">' + esc(TT(
          "Give this student a schedule (period · course · teacher) and, if a milestone is coming, name it. From then on every class has a thirty-second check-in, the exit slip closes the day in the student's own voice, and everything lands in one chronological record.",
          "Da a este estudiante un horario (periodo · curso · docente) y, si se acerca un hito, nómbralo. Desde entonces cada clase tiene un registro de treinta segundos, la boleta de salida cierra el día con la voz del estudiante y todo queda en un solo registro cronológico.")) + "</div>"
        + '<details class="evl-sub"><summary>' + esc(TT("Schedule setup", "Configurar horario")) + "</summary>" + schedEdHTML(sid, rec) + "</details>"
        + '<details class="evl-sub"><summary>' + esc(TT("Milestone setup", "Configurar hito")) + "</summary>" + mileEdHTML(sid) + "</details>"
        + "</div></details></div>";
    }
    var iso = S.date || todayISO();
    var counts = rec ? dayCounts(rec, entriesFor(sid, iso), iso) : { expected: 0, completed: 0, statused: 0 };
    var slips = exitFor(sid, iso);
    var sum = rec ? (counts.completed + "/" + counts.expected + " · " + TT("slip ", "boleta ") + (slips ? "✓" : TT("not yet", "aún no"))) : TT("no schedule yet", "sin horario aún");
    var h = '<div class="evl">' + mileHTML(sid);
    h += '<details' + (S.open ? " open" : "") + ' data-evlod="' + esc(sid) + '"><summary><span>' + esc(TT("Class-by-class evidence", "Evidencia clase por clase")) + "</span>"
      + '<span class="evl-sumn">' + esc(iso === todayISO() ? TT("today: ", "hoy: ") : iso.slice(5).replace("-", "/") + ": ") + esc(sum) + "</span></summary>";
    h += '<div class="evl-body">';
    if (rec) h += dayHTML(sid, rec);
    h += '<details class="evl-sub"' + (S.lopen ? " open" : "") + ' data-evlsub="l|' + esc(sid) + '"><summary>' + esc(TT("Adult team links — one per class", "Enlaces del equipo adulto — uno por clase")) + "</summary>" + linksHTML(sid, rec) + "</details>";
    h += '<details class="evl-sub"' + (S.copen ? " open" : "") + ' data-evlsub="c|' + esc(sid) + '"><summary>' + esc(TT("Evidence by class", "Evidencia por clase")) + "</summary>" + byClassHTML(sid, rec) + "</details>";
    h += '<details class="evl-sub"' + (S.topen ? " open" : "") + ' data-evlsub="t|' + esc(sid) + '"><summary>' + esc(TT("Evidence timeline — who said what, when, in what context", "Línea de evidencia — quién dijo qué, cuándo y en qué contexto")) + "</summary>" + tlHTML(sid) + "</details>";
    h += '<details class="evl-sub"' + (S.eopen ? " open" : "") + ' data-evlsub="e|' + esc(sid) + '"><summary>' + esc(TT("Schedule setup", "Configurar horario")) + "</summary>" + schedEdHTML(sid, rec) + "</details>";
    h += '<details class="evl-sub"' + (S.mopen ? " open" : "") + ' data-evlsub="m|' + esc(sid) + '"><summary>' + esc(TT("Milestone setup", "Configurar hito")) + "</summary>" + mileEdHTML(sid) + "</details>";
    h += "</div></details></div>";
    return h;
  }

  /* ═══════════════ BY TEACHER — ONE MESSAGE PER COLLEAGUE ═══════════════
     Jimmy cannot mass-email, and should not have to: the natural unit of
     distribution is the TEACHER, not the student. A science teacher who has
     three of the caseload's students gets ONE message with three links. This
     gathers every link across every configured student, groups by teacher,
     and hands over a ready-to-paste note per colleague: what it is, how long
     it takes, bookmark it, and their links — codes only, never names. */
  function byTeacher() {
    var out = {};
    var st = sload();
    Object.keys(st.students || {}).forEach(function (sid) {
      linkRowsFor(sid, st.students[sid]).forEach(function (x) {
        var name = String((x.c && x.c.teacher) || "").trim();
        if (!name) return;
        (out[name] = out[name] || []).push({ sid: sid, c: x.c, url: x.url });
      });
    });
    return out;
  }
  function teacherMsg(name, rows) {
    var lines = rows.map(function (x) {
      var per = x.c.p === 0 ? TT("Advisory (Wednesdays)", "Asesoría (miércoles)")
        : TT("Period ", "Periodo ") + (x.c.pFrom != null ? x.c.pFrom + "–" + x.c.p : x.c.p);
      return "• " + TT("Student ", "Estudiante ") + x.sid + " — " + per + " · " + (x.c.course || "") + "\n  " + x.url;
    });
    return TT(
      "Hi — I'm collecting brief classroom check-ins for " + (rows.length === 1 ? "a student" : "a few students") + " on my caseload, and what you see in your room is evidence I can't get anywhere else.\n\n"
      + "It takes about 30 seconds at the end of the period, on any phone or laptop, no login. Please bookmark the link" + (rows.length === 1 ? "" : "s") + " — the same one works every day, all year.\n\n"
      + lines.join("\n\n") + "\n\n"
      + "Thank you!",
      "Hola — estoy reuniendo registros breves de clase para " + (rows.length === 1 ? "un estudiante" : "algunos estudiantes") + " de mi caseload, y lo que ves en tu sala es evidencia que no puedo obtener de otra forma.\n\n"
      + "Toma unos 30 segundos al final del periodo, en cualquier teléfono o computadora, sin inicio de sesión. Guarda el enlace en tus marcadores — el mismo sirve todos los días, todo el año.\n\n"
      + lines.join("\n\n") + "\n\n"
      + "¡Gracias!");
  }
  function teachersHTML() {
    var bt = byTeacher();
    var names = Object.keys(bt).sort();
    if (!names.length) return "";
    var S = ST._teach = ST._teach || {};
    var destOn = false;
    try { destOn = !!(typeof window.aogDestParam_ === "function" && window.aogDestParam_()); } catch (e) {}
    var h = '<div class="evl" style="margin-top:14px;"><details' + (S.open ? " open" : "") + ' data-evlteach="1"><summary><span>'
      + esc(TT("Team links by teacher — one message each", "Enlaces del equipo por docente — un mensaje para cada uno")) + "</span>"
      + '<span class="evl-sumn">' + names.length + " " + esc(names.length === 1 ? TT("adult", "adulto") : TT("adults", "adultos")) + "</span></summary>";
    h += '<div class="evl-body"><div class="evl-note" style="margin-bottom:10px;">' + esc(TT(
      "No mass email needed. Each adult below gets one message holding only their own links — tap Copy message, paste into an email or text to that person, send. A teacher with several of your students gets all their links in the one message.",
      "No hace falta correo masivo. Cada adulto recibe un mensaje solo con sus propios enlaces — toca Copiar mensaje, pégalo en un correo o mensaje a esa persona y envíalo. Quien tenga varios de tus estudiantes recibe todos sus enlaces en el mismo mensaje.")) + "</div>";
    if (!destOn) {
      h += '<div class="evl-note" style="border:1px solid var(--gold,#D9A33B);border-radius:9px;padding:8px 11px;margin-bottom:10px;">' + esc(TT(
        "Connect your Sheet first (Set up ▸ Connect & sync) — links copied before that stay on the sender's device.",
        "Conecta primero tu Hoja (Configurar ▸ Conectar y sincronizar) — los enlaces copiados antes se quedan en el dispositivo del remitente.")) + "</div>";
    }
    names.forEach(function (n) {
      var rows = bt[n];
      var what = rows.map(function (x) { return x.sid + " · " + (x.c.p === 0 ? TT("Adv", "Ases") : "P" + (x.c.pFrom != null ? x.c.pFrom + "–" + x.c.p : x.c.p)); }).join(", ");
      h += '<div class="evl-row">'
        + '<span class="cls" style="flex:1;"><b>' + esc(n) + "</b>"
        + '<span class="t">' + rows.length + " " + esc(rows.length === 1 ? TT("link", "enlace") : TT("links", "enlaces")) + " — " + esc(what) + "</span></span>"
        + '<button type="button" class="evl-ib" data-evl="tmsg" data-teacher="' + esc(n) + '">' + esc(TT("Copy message", "Copiar mensaje")) + "</button>"
        + '<button type="button" class="evl-ib" data-evl="qrsheet" data-teacher="' + esc(n) + '">' + esc(TT("Print QR sheet", "Imprimir hoja QR")) + "</button>"
        + "</div>";
    });
    h += '<span class="evl-sumn" data-evlteachcopied="1"></span></div></details></div>';
    return h;
  }

  /* --------------------------------------------------------- mount / paint */
  var painting = false;
  function paint() {
    if (painting) return;
    painting = true;
    try {
      css();
      var body = el("aogIepBody");
      if (!body) return;
      /* the by-teacher card sits once, above the first student */
      try {
        var thtml = teachersHTML();
        var thost = body.querySelector(".evl-teachhost");
        var firstHd = body.querySelector(".iep-student-h");
        if (!thtml) { if (thost) thost.parentNode.removeChild(thost); }
        else if (thost) { if (thost.__evlHTML !== thtml) { thost.innerHTML = thtml; thost.__evlHTML = thtml; } }
        else if (firstHd) {
          var td = document.createElement("div");
          td.className = "evl-teachhost"; td.innerHTML = thtml; td.__evlHTML = thtml;
          firstHd.parentNode.insertBefore(td, firstHd);
        }
      } catch (e) {}
      body.querySelectorAll(".iep-student-h").forEach(function (hd) {
        var sid = "";
        try { sid = String((hd.childNodes[0] && hd.childNodes[0].textContent) || "").trim(); } catch (e) {}
        if (!sid || sid === TT("(unnamed)", "(sin nombre)")) return;
        var have = hd.nextElementSibling && hd.nextElementSibling.classList && hd.nextElementSibling.classList.contains("evl-host") ? hd.nextElementSibling : null;
        var html = hostHTML(sid);
        if (have) {
          if (have.getAttribute("data-evlsid") === sid && have.__evlHTML === html) return;
          have.innerHTML = html; have.setAttribute("data-evlsid", sid); have.__evlHTML = html;
        } else {
          var d = document.createElement("div");
          d.className = "evl-host"; d.setAttribute("data-evlsid", sid);
          d.innerHTML = html; d.__evlHTML = html;
          hd.parentNode.insertBefore(d, hd.nextSibling);
        }
        try { var q6 = hd.nextElementSibling; if (q6 && q6.querySelector && q6.querySelector(".qr[data-url]:empty") && typeof window.aogDrawQr === "function") window.aogDrawQr(q6); } catch (e) {}
      });
    } catch (e) {} finally { painting = false; }
  }

  function repaint(sid) {
    var host = document.querySelector('.evl-host[data-evlsid="' + String(sid).replace(/"/g, "") + '"]');
    if (!host) { paint(); return; }
    var html = hostHTML(sid);
    host.innerHTML = html; host.__evlHTML = html;
    try { if (host.querySelector(".qr[data-url]") && typeof window.aogDrawQr === "function") window.aogDrawQr(host); } catch (e) {}
  }

  /* schedule editor: read the grid back off the DOM inside this student's host */
  function readEditor(host) {
    var rows = {};
    host.querySelectorAll("[data-evled]").forEach(function (n) {
      var p = +n.getAttribute("data-p"), i = +n.getAttribute("data-i"), f = n.getAttribute("data-evled");
      var k2 = p + "|" + i;
      if (!rows[k2]) rows[k2] = { p: p, term: "YR", counts: true };
      if (f === "counts") rows[k2].counts = !!n.checked;
      else rows[k2][f] = String(n.value || "").trim();
    });
    var classes = [];
    Object.keys(rows).forEach(function (k2) {
      var c = rows[k2];
      if (!String(c.course || "").trim()) return;
      var kind = "class";
      if (/^lu\d|lunch|almuerzo/i.test(c.course)) kind = "lunch";
      if (c.p === 0) { kind = "advisory"; c.wOnly = true; }
      c.kind = kind;
      classes.push(c);
    });
    return classes;
  }

  function shiftDay(iso, delta) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || todayISO());
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12));
    d.setUTCDate(d.getUTCDate() + delta);
    return d.toISOString().slice(0, 10);
  }

  document.addEventListener("click", function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest("[data-evl]") : null;
    if (!b) return;
    var act = b.getAttribute("data-evl"), sid = b.getAttribute("data-sid") || "";
    var S = stFor(sid);
    if (act === "qrtoggle") {
      var S9 = stFor(sid);
      S9.qrs = S9.qrs || {};
      var cid9 = b.getAttribute("data-cid");
      S9.qrs[cid9] = !S9.qrs[cid9];
      repaint(sid);
      return;
    }
    if (act === "qrsheet") {
      /* ═════ THE TEACHER'S QR SHEET — A DEDICATED PRINT WINDOW ═════
         One page per colleague: their links as labeled QR codes, codes only,
         tape-it-inside-the-desk-drawer ready. The window opens SYNCHRONOUSLY
         in the click (popup rules), shows "preparing" while the QR library
         draws offscreen, then fills and prints. The .29bb/.29bm ruling:
         never print themed app chrome in place. If the QR library cannot
         load, each cell prints the URL as text — a sheet that degrades to a
         handout, never to a blank page. */
      var tn9 = b.getAttribute("data-teacher") || "";
      var rows9 = byTeacher()[tn9] || [];
      if (!rows9.length) return;
      var w9 = null;
      try { w9 = window.open("", "_blank"); } catch (e) {}
      if (!w9) return;
      try {
        w9.document.open();
        w9.document.write('<!doctype html><html><head><meta charset="utf-8"><title>' + esc(TT("Check-in QR codes", "Códigos QR de registro")) + " · " + esc(tn9) + "</title><style>" +
          "*{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;}" +
          "body{font-family:-apple-system,'Segoe UI',Inter,system-ui,sans-serif;color:#0A1E33;margin:36px;max-width:720px;}" +
          ".bh{display:flex;align-items:center;gap:12px;border-bottom:3px solid #D9A33B;padding-bottom:12px;margin:0 0 6px;}" +
          ".mk{width:40px;height:40px;border-radius:8px;background:#D9A33B;color:#0A1E33;font-family:Georgia,serif;font-weight:700;font-size:24px;display:flex;align-items:center;justify-content:center;}" +
          ".wm{font-family:Georgia,serif;font-size:18px;font-weight:700;}.sb{font-size:12px;color:#46506E;}" +
          ".how{font-size:12.5px;color:#46506E;line-height:1.6;margin:10px 0 18px;max-width:64ch;}" +
          ".grid{display:flex;flex-wrap:wrap;gap:22px;}" +
          ".cell{width:200px;text-align:center;break-inside:avoid;}" +
          ".cell .qr{display:inline-block;background:#fff;padding:8px;border:1px solid #D9CBA8;border-radius:8px;line-height:0;min-height:60px;min-width:60px;}" +
          ".cell .lb{font-size:12.5px;font-weight:700;margin-top:6px;}.cell .lb2{font-size:11px;color:#46506E;}" +
          ".ft{margin-top:22px;border-top:1px solid #E4DAC5;padding-top:8px;font-size:10.5px;color:#8A92A6;}" +
          "@media print{body{margin:.5in;}}" +
          "</style></head><body>" +
          '<div class="bh"><span class="mk">A</span><div><div class="wm">Architecture of Grace</div><div class="sb">' +
          esc(TT("Adult team check-in · scan at the end of the period · about 30 seconds", "Registro del equipo adulto · escanea al final del periodo · unos 30 segundos")) + " · " + esc(tn9) + "</div></div></div>" +
          '<div class="how">' + esc(TT("Each code opens the check-in already addressed to that student and period — no login, any phone. The same code works every day, all year. Bookmarking the link it opens works too.", "Cada código abre el registro ya dirigido a ese estudiante y periodo — sin inicio de sesión, en cualquier teléfono. El mismo código sirve todos los días, todo el año. También puedes guardar el enlace que abre.")) + "</div>" +
          '<div class="grid">' +
          rows9.map(function (x, i) {
            var per9 = x.c.p === 0 ? TT("Advisory", "Asesoría") : TT("Period ", "Periodo ") + (x.c.pFrom != null ? x.c.pFrom + "–" + x.c.p : x.c.p);
            return '<div class="cell"><span class="qr" data-url="' + esc(x.url) + '"></span>' +
              '<div class="lb">' + esc(TT("Student ", "Estudiante ") + x.sid) + "</div>" +
              '<div class="lb2">' + esc(per9 + " · " + (x.c.course || "")) + "</div></div>";
          }).join("") +
          "</div>" +
          '<div class="ft">' + esc(TT("Codes only — no student names. What you submit goes to the case manager's records and your Sheet.", "Solo códigos — sin nombres de estudiantes. Lo que envías va a los registros de quien gestiona el caso y a tu Hoja.")) + "</div>" +
          "</body></html>");
        w9.document.close();
        /* draw the QRs in OUR document first (the library lives here), then
           copy the finished canvases across as images */
        var stage9 = document.createElement("div");
        stage9.style.cssText = "position:fixed;left:-9999px;top:0;";
        stage9.innerHTML = rows9.map(function (x, i) { return '<span class="qr" data-url="' + esc(x.url) + '" data-qi="' + i + '"></span>'; }).join("");
        document.body.appendChild(stage9);
        try { if (typeof window.aogDrawQr === "function") window.aogDrawQr(stage9); } catch (e) {}
        var tries9 = 0;
        var iv9 = setInterval(function () {
          var done9 = stage9.querySelectorAll("canvas,img").length >= rows9.length || ++tries9 > 25;
          if (!done9) return;
          clearInterval(iv9);
          try {
            var cells9 = w9.document.querySelectorAll(".cell .qr");
            stage9.querySelectorAll("[data-qi]").forEach(function (box9) {
              var i9 = +box9.getAttribute("data-qi");
              var cv9 = box9.querySelector("canvas");
              var im9 = box9.querySelector("img");
              var url9 = box9.getAttribute("data-url");
              if (!cells9[i9]) return;
              if (cv9) cells9[i9].innerHTML = '<img width="150" height="150" alt="QR code for ' + esc(url9) + '" src="' + cv9.toDataURL("image/png") + '">';
              else if (im9 && im9.src) cells9[i9].innerHTML = '<img width="150" height="150" alt="QR code for ' + esc(url9) + '" src="' + im9.src + '">';
              else cells9[i9].innerHTML = '<span style="font-size:9px;word-break:break-all;line-height:1.3;display:inline-block;max-width:180px;">' + esc(url9) + "</span>";
            });
          } catch (e) {}
          try { stage9.parentNode.removeChild(stage9); } catch (e) {}
          try { w9.focus(); w9.print(); } catch (e) {}
        }, 120);
      } catch (e) { try { w9.close(); } catch (e2) {} }
      return;
    }
    if (act === "tmsg") {
      var tn = b.getAttribute("data-teacher") || "";
      var bt2 = byTeacher();
      var msg = bt2[tn] ? teacherMsg(tn, bt2[tn]) : "";
      var done2 = function () {
        b.textContent = TT("Copied ✓ — paste into an email to ", "Copiado ✓ — pégalo en un correo a ") + tn;
        setTimeout(function () { try { b.textContent = TT("Copy message", "Copiar mensaje"); } catch (e) {} }, 2600);
      };
      try { navigator.clipboard.writeText(msg).then(done2, function () { window.prompt(TT("Copy this:", "Copia esto:"), msg); }); }
      catch (e) { window.prompt(TT("Copy this:", "Copia esto:"), msg); }
      return;
    }
    if (act === "copylink" || act === "copyall") {
      var text = "";
      if (act === "copylink") text = b.getAttribute("data-url") || "";
      else {
        var rec9 = schedFor(sid);
        text = linkRowsFor(sid, rec9 || {}).map(function (x) {
          var c9 = x.c;
          return (c9.p === 0 ? TT("Advisory", "Asesoría") : TT("Period ", "Periodo ") + (c9.pFrom != null ? c9.pFrom + "–" + c9.p : c9.p)) + " · " + (c9.course || "") + (c9.teacher ? " · " + c9.teacher : "") + "\n" + x.url;
        }).join("\n\n");
      }
      var done = function () {
        var m = document.querySelector('[data-evlcopied="' + String(sid).replace(/"/g, "") + '"]');
        if (m) { m.textContent = TT("Copied ✓", "Copiado ✓"); setTimeout(function () { if (m) m.textContent = ""; }, 1800); }
      };
      try { navigator.clipboard.writeText(text).then(done, function () { window.prompt(TT("Copy this:", "Copia esto:"), text); }); }
      catch (e) { window.prompt(TT("Copy this:", "Copia esto:"), text); }
      return;
    }
    if (act === "day") { S.date = shiftDay(S.date || todayISO(), +b.getAttribute("data-d")); S.form = null; S.open = true; repaint(sid); return; }
    if (act === "open") { S.form = { cid: b.getAttribute("data-cid"), supports: [], goals: [] }; S.open = true; repaint(sid); return; }
    if (act === "close") { S.form = null; repaint(sid); return; }
    if (act === "pick") { if (S.form) { S.form[b.getAttribute("data-k")] = b.getAttribute("data-v"); repaint(sid); } return; }
    if (act === "sup") {
      if (S.form) {
        var v = b.getAttribute("data-v"), a = S.form.supports = S.form.supports || [];
        var ix = a.indexOf(v); if (ix >= 0) a.splice(ix, 1); else a.push(v);
        repaint(sid);
      } return;
    }
    if (act === "goal") {
      if (S.form) {
        var g = { id: b.getAttribute("data-v"), lab: b.getAttribute("data-lab") || "" };
        var ga = S.form.goals = S.form.goals || [];
        var gx = -1; ga.forEach(function (x, i2) { if (x.id === g.id) gx = i2; });
        if (gx >= 0) ga.splice(gx, 1); else ga.push(g);
        repaint(sid);
      } return;
    }
    if (act === "save" || act === "status") {
      if (!S.form) return;
      var rec = schedFor(sid); if (!rec) return;
      var cls = null;
      classesOn(rec, S.date || todayISO()).forEach(function (c) { if (classId(c) === S.form.cid) cls = c; });
      /* the class might be off this date's roster after an edit; fall back to any match */
      if (!cls) (rec.classes || []).forEach(function (c) { if (classId(c) === S.form.cid) cls = c; });
      if (!cls) return;
      if (act === "save" && !S.form.eng && !S.form.ind && !S.form.perf && !(S.form.note || "").trim() && !(S.form.supports || []).length) return; /* an empty save records nothing */
      saveObs(sid, {
        date: S.date || todayISO(), p: cls.p, course: cls.course, teacher: cls.teacher, room: cls.room,
        status: act === "status" ? b.getAttribute("data-v") : "completed",
        eng: act === "save" ? (S.form.eng || "") : "", ind: act === "save" ? (S.form.ind || "") : "", perf: act === "save" ? (S.form.perf || "") : "",
        supports: act === "save" ? (S.form.supports || []) : [],
        supportOther: act === "save" ? (S.form.supportOther || "") : "",
        goals: act === "save" ? (S.form.goals || []) : [],
        note: act === "save" ? (S.form.note || "") : "",
        respondentRole: S.form.role || "teacher"
      });
      S.form = null; repaint(sid); return;
    }
    if (act === "split") {
      /* materialize current grid, duplicate the period's last row as S2 */
      var host0 = b.closest(".evl-host"); if (!host0) return;
      var classes0 = readEditor(host0);
      var p0 = +b.getAttribute("data-p");
      var mine0 = classes0.filter(function (c) { return c.p === p0; });
      if (mine0.length) {
        var cp = JSON.parse(JSON.stringify(mine0[mine0.length - 1]));
        if (mine0.length === 1 && (mine0[0].term === "YR" || !mine0[0].term)) mine0[0].term = "S1";
        cp.term = "S2"; classes0.push(cp);
      } else classes0.push({ p: p0, course: "", teacher: "", room: "", term: "S2", counts: true, kind: "class" });
      var rec0 = schedFor(sid) || { classes: [] };
      rec0.classes = classes0;
      setSched(sid, rec0); S.eopen = true; S.open = true; repaint(sid); return;
    }
    if (act === "schedsave") {
      var host1 = b.closest(".evl-host"); if (!host1) return;
      var rec1 = schedFor(sid) || {};
      rec1.classes = readEditor(host1);
      rec1.source = rec1.source || "entered " + todayISO();
      setSched(sid, rec1);
      S.eopen = false; S.open = true; repaint(sid);
      try { if (window.AOGStudent && AOGStudent.forget) AOGStudent.forget(); } catch (e) {}
      return;
    }
    if (act === "milesave") {
      var host2 = b.closest(".evl-host"); if (!host2) return;
      var kindN = host2.querySelector('[data-evlmi="kind"]');
      var dateN = host2.querySelector('[data-evlmi="date"]');
      var domN = host2.querySelector('[data-evlmi="domains"]');
      var kind = kindN ? kindN.value : "";
      if (!kind) { setMile(sid, null); S.mopen = false; repaint(sid); return; }
      var prev = mileFor(sid) || {};
      setMile(sid, { kind: kind, date: dateN ? String(dateN.value || "").trim() : (prev.date || ""), domains: domN ? String(domN.value || "").trim() : (prev.domains || "") });
      S.mopen = false; S.open = true; repaint(sid); return;
    }
  });

  /* text inputs & date: commit on change, without a repaint that would eat focus */
  document.addEventListener("change", function (ev) {
    var n = ev.target;
    if (!n || !n.getAttribute) return;
    var f = n.getAttribute("data-evlin");
    if (f) {
      var S = stFor(n.getAttribute("data-sid") || "");
      if (f === "date") { S.date = n.value || todayISO(); S.form = null; S.open = true; repaint(n.getAttribute("data-sid")); return; }
      if (!S.form) return;
      if (f === "note") S.form.note = n.value;
      if (f === "supother") S.form.supportOther = n.value;
      if (f === "role") S.form.role = n.value;
    }
  });
  /* keep <details> open-state across repaints */
  document.addEventListener("toggle", function (ev) {
    var n = ev.target; if (!n || !n.getAttribute) return;
    var od = n.getAttribute("data-evlod");
    if (od) { stFor(od).open = n.open; return; }
    if (n.getAttribute("data-evlteach")) { (ST._teach = ST._teach || {}).open = n.open; return; }
    var sub = n.getAttribute("data-evlsub");
    if (sub) {
      var pp = sub.split("|"); var S = stFor(pp[1] || "");
      if (pp[0] === "c") S.copen = n.open;
      if (pp[0] === "l") S.lopen = n.open;
      if (pp[0] === "t") S.topen = n.open;
      if (pp[0] === "e") S.eopen = n.open;
      if (pp[0] === "m") S.mopen = n.open;
    }
  }, true);

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
    document.addEventListener("click", function (ev) {
      if (ev.target && ev.target.closest && ev.target.closest(".evl-host")) return;
      setTimeout(paint, 80);
    }, true);
    /* the exit slip's remembered schedules stay in step with the source of truth */
    try {
      var st = sload();
      Object.keys(st.students || {}).forEach(function (sid) { feedExit(sid, st.students[sid]); });
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.AOGEvidence = {
    schedFor: schedFor, setSched: setSched, mileFor: mileFor, setMile: setMile,
    classesOn: classesOn, expectedOn: expectedOn, termFor: termFor, dayCounts: dayCounts,
    entriesFor: entriesFor, save: saveObs, timeline: timeline, exitFor: exitFor,
    scales: SCALES, supports: SUPPORTS, statuses: STATUSES, paint: paint,
    KEYS: { sched: SKEY, milestone: MKEY, evidence: EKEY }
  };
})();
