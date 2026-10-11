
(function () {
  "use strict";
  if (window.__aogIepMeet) return; window.__aogIepMeet = true;

  var DKEY = "aog.iepmeet.v1";      /* {v:1, students:{ CODE:{decisions:[rec]} }} — device-only, never synced */
  function DTx(en, es) { try { if (typeof dashLang !== "undefined") return dashLang === "es" ? es : en; } catch (e) {} try { if (typeof lang !== "undefined") return lang === "es" ? es : en; } catch (e2) {} return en; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function jload(k, fb) { try { return JSON.parse(localStorage.getItem(k) || "") || fb; } catch (e) { return fb; } }
  function jsave(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function attrJs(s) { return "decodeURIComponent('" + encodeURIComponent(String(s == null ? "" : s)) + "')"; }
  function pad2(n) { n = String(n); return n.length < 2 ? "0" + n : n; }
  function todayISO() { var d = new Date(); return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function agoISO(days) { var d = new Date(Date.now() - days * 864e5); return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function fdate(iso) {
    iso = String(iso || "").slice(0, 10); if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
    var M = DTx("Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec", "ene,feb,mar,abr,may,jun,jul,ago,sep,oct,nov,dic").split(",");
    var p = iso.split("-"); var m = M[+p[1] - 1] || p[1];
    return DTx(m + " " + (+p[2]) + ", " + p[0], (+p[2]) + " " + m + " " + p[0]);
  }

/* ==== AOG-IEPMEET-PURE-START (dependency-free — extracted verbatim by AoG-IepMeeting.harness.mjs) ==== */
  var AOG_MEET_DECISIONS = ["continue", "modify", "support_up", "fade", "generalize", "met_next", "more_data"];

  /* the readiness tally: an array of signal keys in, honest counts out */
  function aogMeetTally(sigKeys) {
    var t = { goals: 0, on: 0, watch: 0, attention: 0, more: 0 };
    (sigKeys || []).forEach(function (k) {
      t.goals++;
      if (k === "on" || k === "watch" || k === "attention") t[k]++; else t.more++;
    });
    return t;
  }

  /* newest data date across every goal's points — "" when nothing measured */
  function aogMeetLastData(ptsLists) {
    var m = "";
    (ptsLists || []).forEach(function (pts) {
      (pts || []).forEach(function (p) {
        var d = String((p && p.date) || "").slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(d) && d > m) m = d;
      });
    });
    return m;
  }

  /* baseline → current → target, in the goal's own direction.
     `moved` is signed improvement (positive = moved toward the target),
     null whenever either end of the comparison is missing. */
  function aogMeetDelta(g, pts) {
    var base = (g && g.baseline && g.baseline.value != null && g.baseline.value !== "") ? +g.baseline.value : null;
    var tgt  = (g && g.target && g.target.value != null && g.target.value !== "") ? +g.target.value : null;
    if (base != null && !isFinite(base)) base = null;
    if (tgt != null && !isFinite(tgt)) tgt = null;
    var cur = null, curD = "";
    (pts || []).forEach(function (p) {
      var d = String((p && p.date) || "").slice(0, 10);
      if (p && p.value != null && isFinite(+p.value) && d >= curD) { curD = d; cur = +p.value; }
    });
    var lower = !!(g && g.lowerBetter);
    var moved = (cur != null && base != null) ? (lower ? base - cur : cur - base) : null;
    var toGo  = (cur != null && tgt  != null) ? (lower ? cur - tgt  : tgt - cur) : null;
    return { base: base, cur: cur, curDate: curD, tgt: tgt, lower: lower, moved: moved, toGo: toGo, n: (pts || []).length };
  }

  /* the evidence check — states only ("ok" | "part" | "warn"); words live outside */
  function aogMeetCheckModel(c) {
    c = c || {};
    function tri(have, of) { return of > 0 ? (have >= of ? "ok" : (have > 0 ? "part" : "warn")) : "warn"; }
    return [
      { k: "goals",  s: (c.goals > 0) ? "ok" : "warn" },
      { k: "base",   s: tri(c.withBase, c.goals) },
      { k: "target", s: tri(c.withTarget, c.goals) },
      { k: "bench",  s: tri(c.withBench, c.goals) },
      { k: "recent", s: tri(c.recent, c.goals) },
      { k: "mile",   s: c.mileDate ? "ok" : "warn" },
      { k: "voice",  s: (c.voiceN > 0) ? "ok" : "warn" },
      { k: "family", s: (c.familyN > 0) ? "ok" : "warn" }
    ];
  }
  function aogMeetCheckKey(items) {
    var m = {}; (items || []).forEach(function (i) { m[i.k] = i.s; });
    if (m.goals !== "ok") return "none";
    var formal = (m.base !== "warn" && m.target !== "warn" && m.recent !== "warn");
    var voice = (m.voice === "ok" || m.family === "ok");
    if (formal && voice) return "full";
    if (formal) return "novoice";
    return "thin";
  }

  /* modal value of a list — "" on a tie, because a tie is not a mode */
  function aogMeetMode(vals) {
    var n = {}; (vals || []).forEach(function (v) { if (v) n[v] = (n[v] || 0) + 1; });
    var best = "", bn = 0, tie = false;
    Object.keys(n).forEach(function (k) {
      if (n[k] > bn) { best = k; bn = n[k]; tie = false; }
      else if (n[k] === bn) tie = true;
    });
    return tie ? "" : best;
  }

  /* class-observation rows in → the supports that actually appear, plus an
     early-vs-late modal read of the independence scale. Completed rows only —
     a status like "student absent" is absence of evidence, never a zero. */
  function aogMeetSupportTally(rows) {
    var done = (rows || []).filter(function (r) { return r && r.status === "completed"; })
      .slice().sort(function (a, b) { return String(a.date) < String(b.date) ? -1 : 1; });
    var sup = {};
    done.forEach(function (r) { ((r && r.supports) || []).forEach(function (s) { if (s) sup[s] = (sup[s] || 0) + 1; }); });
    var top = Object.keys(sup).map(function (k) { return [k, sup[k]]; })
      .sort(function (a, b) { return b[1] - a[1] || (a[0] < b[0] ? -1 : 1); }).slice(0, 3);
    var withInd = done.filter(function (r) { return r && r.ind; });
    var early = "", late = "", enough = withInd.length >= 4;
    if (enough) {
      var half = Math.floor(withInd.length / 2);
      early = aogMeetMode(withInd.slice(0, half).map(function (r) { return r.ind; }));
      late  = aogMeetMode(withInd.slice(half).map(function (r) { return r.ind; }));
    }
    return { n: done.length, top: top, early: early, late: late, enough: enough };
  }

  /* independence direction from two i-codes (i1 most independent … i5 most
     supported): "rising" | "steady" | "more" | "" when it cannot honestly say */
  function aogMeetIndDir(early, late) {
    var a = +String(early || "").slice(1), b = +String(late || "").slice(1);
    if (!a || !b || String(early).charAt(0) !== "i" || String(late).charAt(0) !== "i") return "";
    return b < a ? "rising" : (b > a ? "more" : "steady");
  }

  /* provenance of a stored point — absent src predates the labels */
  function aogMeetSrcKey(src) {
    var s = String(src == null ? "" : src);
    if (!s) return "early";
    return { typed: "typed", transcribed: "transcribed", proposed: "proposed", aimline: "aimline", practice: "practice" }[s] || "other";
  }

  /* a decision record must carry a real decision, a real day and its goal */
  function aogMeetDecOk(d) {
    return !!(d && AOG_MEET_DECISIONS.indexOf(d.decision) >= 0 &&
      /^\d{4}-\d{2}-\d{2}$/.test(String(d.date || "")) && d.goalId);
  }
/* ==== AOG-IEPMEET-PURE-END ==== */

  /* ------------------------------------------------------------ the words */
  var DECS = {
    continue:   { en: "Continue as planned",        es: "Continuar como está" },
    modify:     { en: "Modify instruction",         es: "Modificar la instrucción" },
    support_up: { en: "Increase support",           es: "Aumentar el apoyo" },
    fade:       { en: "Fade support",               es: "Retirar el apoyo gradualmente" },
    generalize: { en: "Generalize the skill",       es: "Generalizar la destreza" },
    met_next:   { en: "Target met — next skill",    es: "Meta lograda — siguiente destreza" },
    more_data:  { en: "Collect more data",          es: "Reunir más datos" }
  };
  var CHECKS = {
    goals:  { en: "Goals defined",        es: "Metas definidas" },
    base:   { en: "Baseline recorded",    es: "Línea base registrada" },
    target: { en: "Target recorded",      es: "Meta anual registrada" },
    bench:  { en: "Benchmarks documented",es: "Referencias documentadas" },
    recent: { en: "Data in the last 30 days", es: "Datos de los últimos 30 días" },
    mile:   { en: "Meeting date set",     es: "Fecha de reunión registrada" },
    voice:  { en: "Student experience",   es: "Experiencia del estudiante" },
    family: { en: "Family perspective",   es: "Perspectiva familiar" }
  };
  var SENT = {
    full:    { en: "Enough here to discuss progress, with student and family context beside the data.",
               es: "Hay suficiente para hablar del progreso, con el contexto del estudiante y la familia junto a los datos." },
    novoice: { en: "Enough here to discuss goal progress. Student and family context is limited on this device.",
               es: "Hay suficiente para hablar del progreso en las metas. El contexto del estudiante y la familia es limitado en este dispositivo." },
    thin:    { en: "Some pieces are still thin — the brief will say so rather than guess.",
               es: "Aún faltan piezas — el resumen lo dirá en lugar de adivinar." },
    none:    { en: "No goals on this device yet.", es: "Aún no hay metas en este dispositivo." }
  };
  var CONSIDER = {
    on:        { en: "Progress is tracking with the aimline — continuing the current approach, or beginning to fade support, may both be worth discussing.",
                 es: "El progreso sigue la línea de meta — continuar el enfoque actual, o empezar a retirar el apoyo, pueden valer la conversación." },
    watch:     { en: "The picture is mixed or has gone quiet — the team may want to look at conditions and measurement cadence before changing the plan.",
                 es: "El panorama es mixto o ha quedado quieto — el equipo puede revisar condiciones y ritmo de medición antes de cambiar el plan." },
    attention: { en: "Recent points sit below the aimline — reviewing instructional conditions and supports may be warranted.",
                 es: "Los puntos recientes están por debajo de la línea — puede convenir revisar condiciones de instrucción y apoyos." },
    more:      { en: "There is not yet enough data to read a trajectory — more measurement may come before any change.",
                 es: "Aún no hay datos suficientes para leer una trayectoria — puede convenir medir más antes de cambiar algo." }
  };
  var SRCL = {
    typed:       { en: "hand-entered",            es: "escrito a mano" },
    transcribed: { en: "transcribed from records",es: "transcrito de registros" },
    proposed:    { en: "proposed from a work sample", es: "propuesto de una muestra de trabajo" },
    aimline:     { en: "aimline seed",            es: "punto de línea de meta" },
    team_contrib:{ en: "from a team contribution", es: "de una aportación del equipo" },
    practice:    { en: "from student-sent practice (no hint)", es: "de práctica enviada por el estudiante (sin pista)" },
    early:       { en: "recorded before labels",  es: "registrado antes de las etiquetas" },
    other:       { en: "other",                   es: "otro" }
  };
  var FAML = {
    own:      { en: "on their own",        es: "por su cuenta" },
    reminder: { en: "with a reminder",     es: "con un recordatorio" },
    help:     { en: "with help",           es: "con ayuda" },
    hard:     { en: "it was hard that day",es: "fue difícil ese día" }
  };
  function W(map, k) { var d = map[k]; return d ? DTx(d.en, d.es) : String(k || ""); }

  /* ------------------------------------------------- read the other stores */
  function R() { return window.AOGIepRead || null; }
  function goalsFor(sid) {
    try {
      var r = R(); if (!r || !r.goalsFor) return [];
      return (r.goalsFor(sid) || []).filter(function (x) { return x.g && !x.g.archived; });
    } catch (e) { return []; }
  }
  function sigFor(row) {
    try { var r = R(); return (r && r.signal && r.dayNum) ? r.signal(row.g, row.pts, r.dayNum(todayISO())) : null; } catch (e) { return null; }
  }
  function mileFor(sid) { try { return (window.AOGEvidence && AOGEvidence.mileFor) ? AOGEvidence.mileFor(sid) : null; } catch (e) { return null; } }
  function benchN(goalId) {
    try { var d = jload("aog.iepdocs.v1", {}); var m = (d.goalMeta || {})[goalId]; return (m && m.benchmarks) ? m.benchmarks.length : 0; } catch (e) { return 0; }
  }
  function obsRows(sid, days) {
    /* class-by-class evidence, flattened; the store is its own module's, read-only here */
    var out = [];
    try {
      var st = jload((window.AOGEvidence && AOGEvidence.KEYS) ? AOGEvidence.KEYS.evidence : "aog.evclass.v1", {});
      var logs = st.logs || {}, want = String(sid).toUpperCase(), cut = agoISO(days || 45);
      Object.keys(logs).forEach(function (k) {
        if (String(k).toUpperCase() !== want) return;
        Object.keys(logs[k] || {}).forEach(function (d) {
          if (String(d) < cut) return;
          (logs[k][d] || []).forEach(function (r) { out.push(r); });
        });
      });
    } catch (e) {}
    return out;
  }
  function supLabel(code) {
    try {
      var list = (window.AOGEvidence && AOGEvidence.supports) || [];
      for (var i = 0; i < list.length; i++) if (list[i].v === code) return DTx(list[i].en, list[i].es);
    } catch (e) {}
    return String(code || "");
  }
  function ctxCounts(row) {
    try {
      if (!row || !window.AOGIepEvidence || !AOGIepEvidence.snapshot) return { ci: 0, slips: 0 };
      var s = AOGIepEvidence.snapshot(row.id) || {};
      return { ci: (s.ci && s.ci.n) || 0, slips: (s.slips && s.slips.n) || 0 };
    } catch (e) { return { ci: 0, slips: 0 }; }
  }
  function famFor(goalId) {
    try {
      if (!window.AOGHome || !AOGHome.cfg) return null;
      var c = AOGHome.cfg(goalId); if (!c || !c.key) return null;
      var obs = AOGHome.obs(c.key) || [];
      var counted = obs.filter(function (r) { return r && r.levelKey && r.levelKey !== "na"; });
      if (!counted.length) return { n: 0 };
      var mode = aogMeetMode(counted.map(function (r) { return r.levelKey; }));
      return { n: counted.length, mode: mode };
    } catch (e) { return null; }
  }

  /* -------------------------------------------------------- decision store */
  function dload() { var s = jload(DKEY, { v: 1, students: {} }); if (!s.students) s.students = {}; return s; }
  function decsFor(sid) {
    var s = dload(), out = [], want = String(sid).toUpperCase();
    Object.keys(s.students).forEach(function (k) {
      if (String(k).toUpperCase() !== want) return;
      ((s.students[k] || {}).decisions || []).forEach(function (d) { out.push(d); });
    });
    return out.sort(function (a, b) { return String(b.ts || b.date) < String(a.ts || a.date) ? -1 : 1; });
  }
  function decAdd(sid, rec) {
    if (!aogMeetDecOk(rec)) return false;
    var s = dload(), k = String(sid);
    if (!s.students[k]) s.students[k] = { decisions: [] };
    if (!s.students[k].decisions) s.students[k].decisions = [];
    s.students[k].decisions.push(rec);
    jsave(DKEY, s);
    return true;
  }

  /* ------------------------------------------------------------- the model */
  function model(sid) {
    var rows = goalsFor(sid);
    var sigs = rows.map(sigFor);
    var tally = aogMeetTally(sigs.map(function (s) { return s ? s.k : "more"; }));
    var last = aogMeetLastData(rows.map(function (r) { return r.pts; }));
    var mile = mileFor(sid);
    var cut30 = agoISO(30);
    var recent = rows.filter(function (r) {
      return (r.pts || []).some(function (p) { return String((p && p.date) || "").slice(0, 10) >= cut30; });
    }).length;
    var ctx = rows.length ? ctxCounts(rows[0]) : { ci: 0, slips: 0 };
    var famN = 0;
    rows.forEach(function (r) { var f = famFor(r.id); if (f && f.n) famN += f.n; });
    try { if (window.AOGHomeCi && AOGHomeCi.obs) famN += (AOGHomeCi.obs(sid) || []).length; } catch (e) {}
    var checks = aogMeetCheckModel({
      goals: rows.length,
      withBase: rows.filter(function (r) { return r.g.baseline && r.g.baseline.value != null && r.g.baseline.value !== ""; }).length,
      withTarget: rows.filter(function (r) { return r.g.target && r.g.target.value != null && r.g.target.value !== ""; }).length,
      withBench: rows.filter(function (r) { return benchN(r.id) > 0; }).length,
      recent: recent,
      mileDate: (mile && mile.date) || "",
      voiceN: ctx.ci + ctx.slips,
      familyN: famN
    });
    return { sid: sid, rows: rows, sigs: sigs, tally: tally, last: last, mile: mile,
             checks: checks, checkKey: aogMeetCheckKey(checks),
             sup: aogMeetSupportTally(obsRows(sid, 45)) };
  }
  function mileLine(mile) {
    if (!mile || !mile.date) return DTx("No meeting date on this device yet.", "Aún no hay fecha de reunión en este dispositivo.");
    var kind = mile.kind === "reeval"
      ? DTx("Reevaluation — domain meeting", "Reevaluación — reunión de dominios")
      : DTx("Annual review", "Revisión anual");
    var d = /^\d{4}-\d{2}$/.test(String(mile.date)) ? String(mile.date) : fdate(mile.date);
    return kind + " · " + d;
  }

  /* --------------------------------------------------- the readiness strip */
  function tile(v, l, warn) {
    return '<div class="imb-tile' + (warn ? " warn" : "") + '"><div class="v">' + esc(v) + '</div><div class="l">' + esc(l) + "</div></div>";
  }
  function stripHTML(m) {
    if (!m.rows.length) return "";
    var r = R();
    var word = function (k) { try { return r && r.sigWord ? r.sigWord(k) : k; } catch (e) { return k; } };
    var h = '<div class="imb-strip" data-imb="1">';
    h += '<div class="imb-k">' + DTx("Meeting readiness", "Preparación para la reunión") + "</div>";
    h += '<div class="imb-tiles">';
    h += tile(m.tally.goals, DTx("Goals", "Metas"));
    if (m.tally.on) h += tile(m.tally.on, word("on"));
    if (m.tally.watch) h += tile(m.tally.watch, word("watch"), true);
    if (m.tally.attention) h += tile(m.tally.attention, word("attention"), true);
    if (m.tally.more) h += tile(m.tally.more, word("more"));
    h += tile(m.last ? fdate(m.last) : "—", DTx("Last data", "Último dato"));
    h += "</div>";
    h += '<div class="imb-mile"><b>' + esc(mileLine(m.mile)) + "</b></div>";
    h += '<div class="imb-sent">' + esc(W(SENT, m.checkKey)) + "</div>";
    h += '<div class="imb-acts"><button type="button" class="iep-btn" onclick="aogIepMeetOpen(' + attrJs(m.sid) + ')">' +
      DTx("Open meeting brief", "Abrir resumen de reunión") + " →</button></div>";
    return h + "</div>";
  }

  /* --------------------------------------------------------------- overlay */
  var ST = { sid: "", gi: 0, pick: {}, note: {}, lastFocus: null };

  function chipRow(m) {
    var h = '<div class="imb-chips">';
    m.checks.forEach(function (c) {
      var mark = c.s === "ok" ? "✓ " : (c.s === "part" ? "◐ " : "⚠ ");
      h += '<span class="imb-chip ' + c.s + '">' + mark + esc(W(CHECKS, c.k)) + "</span>";
    });
    h += "</div>";
    h += '<div class="imb-checksent">' + esc(W(SENT, m.checkKey)) + "</div>";
    return h;
  }

  function fmtVal(g, v, total) {
    if (v == null || v === "" || !isFinite(+v)) return "—";
    var u = (g && g.measure === "percent") ? "%" : "";
    var s = String(+v) + u;
    if (total != null && total !== "" && isFinite(+total)) s += " / " + (+total);
    return s;
  }

  function evTableHTML(row) {
    var pts = (row.pts || []).slice().sort(function (a, b) { return String(a.date) < String(b.date) ? 1 : -1; }).slice(0, 12);
    if (!pts.length) return "<p>" + esc(DTx("No measurements recorded yet.", "Aún no hay mediciones registradas.")) + "</p>";
    var h = '<table class="imb-tbl"><tr><th>' + DTx("Date", "Fecha") + "</th><th>" + DTx("Result", "Resultado") +
      "</th><th>" + DTx("Benchmark", "Referencia") + "</th><th>" + DTx("Source", "Fuente") + "</th><th>" + DTx("Note", "Nota") + "</th></tr>";
    pts.forEach(function (p) {
      var res = fmtVal(row.g, p.value, p.total);
      if (p.raw != null && p.raw !== "") res += " · " + DTx("raw ", "punt. ") + esc(String(p.raw));
      h += "<tr><td>" + esc(fdate(p.date)) + "</td><td>" + res + "</td><td>" + esc(p.bench || "—") +
        '</td><td><span class="imb-src">' + esc(W(SRCL, aogMeetSrcKey(p.src))) + "</span></td><td>" + esc(String(p.note || "").slice(0, 120)) + "</td></tr>";
    });
    return h + "</table>";
  }

  function helpHTML(m) {
    var s = m.sup;
    if (!s || !s.n) {
      return "<p>" + esc(DTx("No class-by-class observations in the last 45 days.", "Sin observaciones clase por clase en los últimos 45 días.")) + "</p>";
    }
    var h = "<ul>";
    if (s.top.length) {
      h += "<li>" + esc(DTx("Supports observed most often: ", "Apoyos observados con más frecuencia: ")) +
        esc(s.top.map(function (t) { return supLabel(t[0]) + " (" + t[1] + ")"; }).join(" · ")) + "</li>";
    }
    var dir = s.enough ? aogMeetIndDir(s.early, s.late) : "";
    if (dir === "rising") h += "<li>" + esc(DTx("Independence: the more recent observations lean more independent than the earlier ones.", "Independencia: las observaciones recientes tienden a más independencia que las primeras.")) + "</li>";
    else if (dir === "more") h += "<li>" + esc(DTx("Independence: the more recent observations lean toward more support than the earlier ones.", "Independencia: las observaciones recientes tienden a más apoyo que las primeras.")) + "</li>";
    else if (dir === "steady") h += "<li>" + esc(DTx("Independence: holding steady across the observations.", "Independencia: se mantiene estable entre observaciones.")) + "</li>";
    else h += "<li>" + esc(DTx("Independence: not enough observations to read a direction.", "Independencia: no hay observaciones suficientes para leer una dirección.")) + "</li>";
    h += "<li>" + esc(DTx("From " + s.n + " class observations in the last 45 days.", "De " + s.n + " observaciones de clase en los últimos 45 días.")) + "</li>";
    return h + "</ul>";
  }

  function famHTML(row) {
    var f = famFor(row.id);
    if (!f || !f.n) return "";
    var line = DTx("Family answers on this goal: ", "Respuestas familiares sobre esta meta: ") + f.n;
    if (f.mode) line += DTx(" — most often “", " — más a menudo “") + W(FAML, f.mode) + "”";
    return "<div>" + esc(line) + "</div>";
  }

  function ctxHTML(row) {
    var inner = "";
    try { if (window.AOGIepEvidence && AOGIepEvidence.html) inner = AOGIepEvidence.html(row.id) || ""; } catch (e) {}
    var fam = famHTML(row);
    if (!inner && !fam) inner = "<p>" + esc(DTx("Nothing collected around this goal yet.", "Aún no hay nada reunido alrededor de esta meta.")) + "</p>";
    return '<div class="imb-ctx"><span class="tag">' +
      DTx("Context, not measurement", "Contexto, no medición") + "</span>" + fam + inner + "</div>";
  }

  function decHTML(m, row, sig) {
    var picked = ST.pick[row.id] || "";
    var h = '<div class="imb-cons"><b>' + DTx("Possible team consideration", "Posible consideración del equipo") + ":</b> " +
      esc(W(CONSIDER, sig ? sig.k : "more")) + " " +
      esc(DTx("The team decides — this page remembers.", "El equipo decide — esta página lo recuerda.")) + "</div>";
    h += '<div class="imb-decs">';
    AOG_MEET_DECISIONS.forEach(function (k) {
      h += '<button type="button" class="imb-dec" aria-pressed="' + (picked === k ? "true" : "false") +
        '" onclick="aogIepMeetDec(' + attrJs(row.id) + "," + attrJs(k) + ')">' + esc(W(DECS, k)) + "</button>";
    });
    h += "</div>";
    h += '<input type="text" class="imb-note" id="imbNote_' + esc(row.id) + '" maxlength="240" value="' + esc(ST.note[row.id] || "") +
      '" placeholder="' + esc(DTx("Why — in the team's words (optional)", "Por qué — en palabras del equipo (opcional)")) + '">';
    h += '<button type="button" class="imb-save" onclick="aogIepMeetSaveDec(' + attrJs(row.id) + ')">' +
      esc(DTx("Record the team's decision", "Registrar la decisión del equipo")) + "</button>";
    var log = decsFor(m.sid).filter(function (d) { return d.goalId === row.id; });
    if (log.length) {
      h += '<div class="imb-log">';
      log.forEach(function (d) {
        h += '<div class="r"><b>' + esc(W(DECS, d.decision)) + "</b>" +
          (d.note ? " — " + esc(d.note) : "") +
          ' <span class="d">' + esc(fdate(d.date)) + "</span></div>";
      });
      h += "</div>";
    }
    return h;
  }

  function goalHTML(m) {
    var row = m.rows[ST.gi]; if (!row) return "";
    var sig = m.sigs[ST.gi];
    var r = R();
    var d = aogMeetDelta(row.g, row.pts);
    var h = '<div class="imb-goal">';
    var areaL = ""; try { areaL = (r && r.areaLabel) ? r.areaLabel(row.g.area) : (row.g.area || ""); } catch (e) {}
    h += '<div class="imb-area">' + esc(areaL) + (benchN(row.id) ? " · " + benchN(row.id) + esc(DTx(" benchmarks", " referencias")) : "") + "</div>";
    h += '<p class="imb-gtitle">' + esc(row.g.title || "") + "</p>";
    h += '<div class="imb-bct">';
    h += '<div class="imb-b"><div class="v">' + esc(fmtVal(row.g, d.base)) + '</div><div class="l">' + DTx("Baseline", "Línea base") + (row.g.baseline && row.g.baseline.date ? " · " + esc(fdate(row.g.baseline.date)) : "") + "</div></div>";
    h += '<div class="imb-b cur"><div class="v">' + esc(fmtVal(row.g, d.cur)) + '</div><div class="l">' + DTx("Current", "Actual") + (d.curDate ? " · " + esc(fdate(d.curDate)) : "") + "</div></div>";
    h += '<div class="imb-b"><div class="v">' + esc(fmtVal(row.g, d.tgt)) + '</div><div class="l">' + DTx("Target", "Meta") + (row.g.target && row.g.target.date ? " · " + esc(fdate(row.g.target.date)) : "") + "</div></div>";
    h += "</div>";
    if (d.moved != null) {
      var mvTxt = d.moved > 0
        ? DTx("Moved " + (+d.moved.toFixed(2)) + " toward the target since baseline", "Avanzó " + (+d.moved.toFixed(2)) + " hacia la meta desde la línea base")
        : (d.moved < 0
          ? DTx("Currently " + (+Math.abs(d.moved).toFixed(2)) + " below the baseline", "Actualmente " + (+Math.abs(d.moved).toFixed(2)) + " por debajo de la línea base")
          : DTx("Holding at baseline so far", "Se mantiene en la línea base por ahora"));
      h += '<div class="imb-moved">' + esc(mvTxt) + " · " + esc(d.n + DTx(" data points", " datos")) + "</div>";
    }
    try {
      if (r && r.chart) h += '<div class="imb-chart">' + r.chart(row.g, row.pts, null) + "</div>";
    } catch (e) {}
    if (sig) {
      var word = "", why = "";
      try { word = r.sigWord(sig.k); why = r.sigWhy(sig); } catch (e2) {}
      h += '<div class="imb-read"><span class="w">' + esc(word) + ".</span> " + esc(why) + "</div>";
    }
    h += '<div class="imb-sec"><h4>' + DTx("Evidence", "Evidencia") + "</h4>" + evTableHTML(row) + "</div>";
    h += '<div class="imb-sec imb-help"><h4>' + DTx("What appears to help", "Qué parece ayudar") + "</h4>" + helpHTML(m) + "</div>";
    h += '<div class="imb-sec"><h4>' + DTx("Around the data", "Alrededor de los datos") + "</h4>" + ctxHTML(row) + "</div>";
    h += '<div class="imb-sec"><h4>' + DTx("Team decision", "Decisión del equipo") + "</h4>" + decHTML(m, row, sig) + "</div>";
    return h + "</div>";
  }

  function ovlHTML(m) {
    var h = '<div class="imb-bar"><button type="button" class="imb-bbtn" onclick="aogIepMeetClose()" id="imbClose">✕ ' +
      DTx("Close", "Cerrar") + '</button><div class="t">' + esc(m.sid) + " · " +
      DTx("IEP evidence brief", "Resumen de evidencia IEP") +
      '</div><button type="button" class="imb-bbtn gold" onclick="aogIepMeetPrint()">' +
      DTx("Print packet", "Imprimir paquete") + "</button></div>";
    h += '<div class="imb-page">';
    h += '<div class="imb-hero"><div class="code">' + esc(m.sid) + '</div><div class="sub">' +
      DTx("IEP evidence brief", "Resumen de evidencia IEP") + '</div><div class="meet">' +
      esc(mileLine(m.mile)) + " · " + esc(DTx("Data through ", "Datos hasta ")) + esc(m.last ? fdate(m.last) : "—") + "</div></div>";
    h += chipRow(m);
    if (m.rows.length > 1) {
      h += '<div class="imb-gnav"><button type="button" class="imb-gbtn" onclick="aogIepMeetGoal(' + (ST.gi - 1) + ')"' + (ST.gi <= 0 ? " disabled" : "") + ">‹</button>";
      h += '<span class="cnt">' + DTx("Goal ", "Meta ") + (ST.gi + 1) + DTx(" of ", " de ") + m.rows.length + "</span>";
      h += '<button type="button" class="imb-gbtn" onclick="aogIepMeetGoal(' + (ST.gi + 1) + ')"' + (ST.gi >= m.rows.length - 1 ? " disabled" : "") + ">›</button>";
      m.rows.forEach(function (row, i) {
        var lbl = "";
        try { lbl = (R() && R().areaLabel) ? R().areaLabel(row.g.area) : ""; } catch (e) {}
        h += '<button type="button" class="imb-gpill" aria-pressed="' + (i === ST.gi ? "true" : "false") +
          '" onclick="aogIepMeetGoal(' + i + ')">' + (i + 1) + (lbl ? " · " + esc(lbl) : "") + "</button>";
      });
      h += "</div>";
    } else {
      h += '<div class="imb-gnav"></div>';
    }
    h += goalHTML(m);
    h += '<div class="imb-foot"><div class="p1">' +
      DTx("A measurement describes performance on a skill. It does not describe the student.",
          "Una medición describe el desempeño en una destreza. No describe al estudiante.") + "</div>" +
      DTx("A working evidence view for the team's conversation — the signed IEP is the document.",
          "Una vista de evidencia para la conversación del equipo — el IEP firmado es el documento.") + "</div>";
    return h + "</div>";
  }

  function ovlNode() { return document.getElementById("aogIepMeetOvl"); }
  function renderOvl() {
    var n = ovlNode(); if (!n || !ST.sid) return;
    n.innerHTML = ovlHTML(model(ST.sid));
  }

  window.aogIepMeetOpen = function (sid) {
    try {
      ST.sid = String(sid || ""); ST.gi = 0; ST.pick = {}; ST.note = {};
      ST.lastFocus = document.activeElement;
      var n = ovlNode();
      if (!n) {
        n = document.createElement("div");
        n.id = "aogIepMeetOvl";
        n.setAttribute("role", "dialog");
        n.setAttribute("aria-modal", "true");
        n.setAttribute("aria-label", DTx("IEP evidence brief", "Resumen de evidencia IEP"));
        document.body.appendChild(n);
      }
      n.style.display = "";
      document.body.style.overflow = "hidden";
      renderOvl();
      try { var c = document.getElementById("imbClose"); if (c) c.focus(); } catch (e2) {}
      try { if (window.AOGFocus && AOGFocus.set) AOGFocus.set(ST.sid, "iepmeet"); } catch (e3) {}
    } catch (e) {}
  };
  window.aogIepMeetClose = function () {
    try {
      var n = ovlNode(); if (n) n.style.display = "none";
      document.body.style.overflow = "";
      ST.sid = "";
      try { if (ST.lastFocus && ST.lastFocus.focus) ST.lastFocus.focus(); } catch (e2) {}
    } catch (e) {}
  };
  window.aogIepMeetGoal = function (i) {
    var m = model(ST.sid);
    if (i < 0 || i >= m.rows.length) return;
    ST.gi = i; renderOvl();
    try { var n = ovlNode(); if (n) n.scrollTop = 0; } catch (e) {}
  };
  window.aogIepMeetDec = function (goalId, k) {
    ST.pick[goalId] = k;
    try { var el = document.getElementById("imbNote_" + goalId); if (el) ST.note[goalId] = el.value; } catch (e) {}
    renderOvl();
  };
  window.aogIepMeetSaveDec = function (goalId) {
    try {
      var k = ST.pick[goalId];
      if (!k) { alert(DTx("Choose a decision first.", "Primero elige una decisión.")); return; }
      var noteEl = document.getElementById("imbNote_" + goalId);
      var m = model(ST.sid);
      var row = null, sig = null;
      m.rows.forEach(function (r2, i) { if (r2.id === goalId) { row = r2; sig = m.sigs[i]; } });
      var rec = {
        id: "md" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        ts: new Date().toISOString(),
        date: todayISO(),
        goalId: goalId,
        goalTitle: row ? String(row.g.title || "").slice(0, 200) : "",
        decision: k,
        note: noteEl ? String(noteEl.value || "").slice(0, 240) : "",
        sig: sig ? sig.k : ""
      };
      if (decAdd(ST.sid, rec)) { ST.pick[goalId] = ""; ST.note[goalId] = ""; renderOvl(); }
    } catch (e) {}
  };

  /* ----------------------------------------------------------------- print
     A dedicated window, opened synchronously inside the click, literal light
     hex only — a themed in-place print is how the MTSS report went blank. */
  var PPAL = { line: "#0A1E33", dot: "#fff", gold: "#D9A33B", grid: "#E4DAC5", txt: "#46506E", faint: "#8A92A6", trend: "#8A92A6",
               bench: ["#3E5C9A", "#B4552D", "#2E6B3A", "#6E4A9E", "#1F7A8C", "#8B2A2A"] };
  var PCSS = "body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;color:#101820;background:#fff;}" +
    ".pg{max-width:7.4in;margin:0 auto;padding:26px 8px;}" +
    ".pb{break-before:page;page-break-before:always;}" +
    "h1{font-family:Georgia,serif;font-size:26px;margin:0 0 2px;color:#0A1E33;}" +
    ".sub{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#646E86;margin:0 0 14px;}" +
    "h2{font-family:Georgia,serif;font-size:17px;color:#0A1E33;margin:0 0 10px;line-height:1.4;}" +
    "h3{font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#646E86;margin:16px 0 6px;}" +
    ".kv{font-size:12.5px;margin:2px 0;color:#101820;}.kv b{display:inline-block;min-width:130px;color:#46506E;font-weight:700;}" +
    "table{width:100%;border-collapse:collapse;font-size:11.5px;margin-top:4px;}" +
    "th{text-align:left;font-size:9.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#646E86;padding:3px 8px 3px 0;border-bottom:1px solid #E4DAC5;}" +
    "td{padding:4px 8px 4px 0;border-bottom:1px solid #EFEADB;vertical-align:top;}" +
    ".ctx{border-left:3px solid #D9A33B;padding:8px 12px;background:#FCF8F0;margin-top:6px;font-size:12px;}" +
    ".ctx .tag{font-size:9.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#7E5B18;display:block;margin-bottom:4px;}" +
    ".read{font-size:12.5px;margin:8px 0;}.read b{font-weight:800;}" +
    "ul{margin:4px 0;padding-left:18px;font-size:12px;}li{margin:2px 0;}" +
    ".foot{margin-top:22px;border-top:1px solid #E4DAC5;padding-top:10px;font-size:11px;color:#46506E;}" +
    ".foot .p1{font-weight:700;color:#0A1E33;}" +
    "svg{max-width:100%;height:auto;}" +
    "@page{size:letter portrait;margin:0.55in 0.6in 0.6in;}";

  function printDocHTML(m, es) {
    function t(en, esS) { return es ? esS : en; }
    var r = R();
    var h = '<div class="pg">';
    h += "<h1>" + esc(m.sid) + "</h1>";
    h += '<div class="sub">' + t("IEP evidence brief · Architecture of Grace", "Resumen de evidencia IEP · Architecture of Grace") + "</div>";
    h += '<div class="kv"><b>' + t("Meeting", "Reunión") + "</b> " + esc(mileLine(m.mile)) + "</div>";
    h += '<div class="kv"><b>' + t("Data through", "Datos hasta") + "</b> " + esc(m.last ? fdate(m.last) : "—") + "</div>";
    h += '<div class="kv"><b>' + t("Generated", "Generado") + "</b> " + esc(fdate(todayISO())) + "</div>";
    h += "<h3>" + t("Evidence check", "Revisión de evidencia") + "</h3><ul>";
    m.checks.forEach(function (c) {
      var mark = c.s === "ok" ? "✓" : (c.s === "part" ? "◐" : "⚠");
      h += "<li>" + mark + " " + esc(W(CHECKS, c.k)) + "</li>";
    });
    h += "</ul>";
    h += '<div class="kv" style="margin-top:8px">' + esc(W(SENT, m.checkKey)) + "</div>";

    m.rows.forEach(function (row, i) {
      var sig = m.sigs[i], d = aogMeetDelta(row.g, row.pts);
      h += '<div class="pb">';
      var areaL = ""; try { areaL = (r && r.areaLabel) ? r.areaLabel(row.g.area) : ""; } catch (e) {}
      h += '<div class="sub">' + t("Goal ", "Meta ") + (i + 1) + t(" of ", " de ") + m.rows.length + (areaL ? " · " + esc(areaL) : "") + "</div>";
      h += "<h2>" + esc(row.g.title || "") + "</h2>";
      h += '<div class="kv"><b>' + t("Baseline", "Línea base") + "</b> " + esc(fmtVal(row.g, d.base)) + (row.g.baseline && row.g.baseline.date ? " · " + esc(fdate(row.g.baseline.date)) : "") + "</div>";
      h += '<div class="kv"><b>' + t("Current", "Actual") + "</b> " + esc(fmtVal(row.g, d.cur)) + (d.curDate ? " · " + esc(fdate(d.curDate)) : "") + "</div>";
      h += '<div class="kv"><b>' + t("Target", "Meta") + "</b> " + esc(fmtVal(row.g, d.tgt)) + (row.g.target && row.g.target.date ? " · " + esc(fdate(row.g.target.date)) : "") + "</div>";
      try { if (r && r.chart) h += "<div>" + r.chart(row.g, row.pts, PPAL) + "</div>"; } catch (e2) {}
      if (sig) {
        var word = "", why = "";
        try { word = r.sigWord(sig.k); why = r.sigWhy(sig); } catch (e3) {}
        h += '<div class="read"><b>' + esc(word) + ".</b> " + esc(why) + "</div>";
      }
      h += "<h3>" + t("Evidence", "Evidencia") + "</h3>" + evTableHTML(row);
      h += "<h3>" + t("What appears to help", "Qué parece ayudar") + "</h3>" + helpHTML(m);
      var ctx = "";
      try { if (window.aogIepEvidenceBlock) ctx = window.aogIepEvidenceBlock(row.id, es) || ""; } catch (e4) {}
      var fam = famHTML(row);
      if (ctx || fam) {
        h += "<h3>" + t("Around the data", "Alrededor de los datos") + "</h3>" +
          '<div class="ctx"><span class="tag">' + t("Context, not measurement", "Contexto, no medición") + "</span>" + fam + ctx + "</div>";
      }
      var log = decsFor(m.sid).filter(function (dd) { return dd.goalId === row.id; });
      if (log.length) {
        h += "<h3>" + t("Team decisions on this goal", "Decisiones del equipo sobre esta meta") + "</h3><ul>";
        log.forEach(function (dd) {
          h += "<li><b>" + esc(W(DECS, dd.decision)) + "</b>" + (dd.note ? " — " + esc(dd.note) : "") + " (" + esc(fdate(dd.date)) + ")</li>";
        });
        h += "</ul>";
      }
      h += "</div>";
    });

    var all = decsFor(m.sid);
    if (all.length) {
      h += '<div class="pb"><h3>' + t("Decisions & next steps", "Decisiones y próximos pasos") + "</h3><ul>";
      all.forEach(function (dd) {
        h += "<li>" + esc(fdate(dd.date)) + " — <b>" + esc(W(DECS, dd.decision)) + "</b>" +
          (dd.goalTitle ? " · " + esc(String(dd.goalTitle).slice(0, 90)) : "") +
          (dd.note ? " — " + esc(dd.note) : "") + "</li>";
      });
      h += "</ul></div>";
    }
    h += '<div class="foot"><div class="p1">' +
      t("A measurement describes performance on a skill. It does not describe the student.",
        "Una medición describe el desempeño en una destreza. No describe al estudiante.") + "</div>" +
      t("A working evidence view for the team's conversation — the signed IEP is the document. Contextual sections are not progress-monitoring data.",
        "Una vista de evidencia para la conversación del equipo — el IEP firmado es el documento. Las secciones de contexto no son datos de monitoreo.") + "</div>";
    return h + "</div>";
  }

  window.aogIepMeetPrint = function () {
    try {
      if (!ST.sid) return;
      var es = DTx("en", "es") === "es";
      var m = model(ST.sid);
      var body = printDocHTML(m, es);
      var w = null;
      try { w = window.open("", "_blank"); } catch (eW) {}
      if (!w || !w.document) { alert(DTx("Allow pop-ups to print the packet.", "Permite ventanas emergentes para imprimir el paquete.")); return; }
      w.document.open();
      w.document.write("<!doctype html><html><head><meta charset=\"utf-8\"><title>" +
        esc((es ? "Resumen-IEP-" : "IEP-brief-") + m.sid) + "</title><style>" + PCSS + "</style></head><body>" + body + "</body></html>");
      w.document.close();
      w.focus();
      try { w.print(); } catch (eP) {}
    } catch (e) {}
  };

  /* ------------------------------------------------------------ the paint
     Same additive pattern as the evidence loop: find every .iep-student-h,
     read the code from its leading text node, and keep one .imb-host after
     the header (after the .evl-host when that module has already painted).
     Writes only when the HTML actually changed, so the observer settles. */
  function paint() {
    try {
      var body = document.getElementById("aogIepBody"); if (!body) return;
      var heads = body.querySelectorAll(".iep-student-h");
      for (var i = 0; i < heads.length; i++) {
        var hd = heads[i];
        var sid = ""; try { sid = String((hd.childNodes[0] && hd.childNodes[0].textContent) || "").trim(); } catch (e1) {}
        if (!sid || /^\(/.test(sid)) continue;
        var html = "";
        try { html = stripHTML(model(sid)); } catch (e2) {}
        var anchor = hd;
        var sib = hd.nextElementSibling;
        if (sib && sib.classList && sib.classList.contains("evl-host")) anchor = sib;
        var host = anchor.nextElementSibling;
        if (!(host && host.classList && host.classList.contains("imb-host"))) {
          host = null;
          var probe = hd.parentNode ? hd.parentNode.querySelector('.imb-host[data-imbsid="' + (window.CSS && CSS.escape ? CSS.escape(sid) : sid) + '"]') : null;
          if (probe) host = probe;
        }
        if (!html) { if (host) { try { host.parentNode.removeChild(host); } catch (e3) {} } continue; }
        if (!host) {
          host = document.createElement("div");
          host.className = "imb-host";
          host.setAttribute("data-imbsid", sid);
          if (anchor.nextSibling) anchor.parentNode.insertBefore(host, anchor.nextSibling);
          else anchor.parentNode.appendChild(host);
        }
        if (host.__imbHTML !== html) { host.innerHTML = html; host.__imbHTML = html; }
      }
    } catch (e) {}
  }

  var rafQ = false;
  function queuePaint() {
    /* rAF for the visible case, a timer for the hidden one — a background
       tab throttles rAF to nothing, and a re-render that lands while the
       pane is hidden must not leave the strip missing until the next look. */
    if (rafQ) return; rafQ = true;
    var done = false;
    function go() { if (done) return; done = true; rafQ = false; paint(); }
    try { if (window.requestAnimationFrame) requestAnimationFrame(go); } catch (e) {}
    setTimeout(go, 250);
  }

  function init() {
    try {
      var body = document.getElementById("aogIepBody");
      if (body && window.MutationObserver) {
        new MutationObserver(queuePaint).observe(body, { childList: true, subtree: true });
      }
      document.addEventListener("keydown", function (ev) {
        try {
          var n = ovlNode(); if (!n || n.style.display === "none" || !ST.sid) return;
          var k = ev.key || "";
          if (k === "Escape" || k === "Esc") { ev.preventDefault(); window.aogIepMeetClose(); return; }
          var tag = (ev.target && ev.target.tagName || "").toLowerCase();
          if (tag === "input" || tag === "textarea" || tag === "select") return;
          if (k === "ArrowRight") window.aogIepMeetGoal(ST.gi + 1);
          if (k === "ArrowLeft") window.aogIepMeetGoal(ST.gi - 1);
        } catch (e2) {}
      });
      queuePaint();
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  /* read-only surface for tests and future readers */
  try {
    window.AOGIepMeet = {
      model: model, decisions: decsFor, add: decAdd, paint: paint,
      printDoc: printDocHTML, KEY: DKEY, DECISIONS: AOG_MEET_DECISIONS
    };
  } catch (eX) {}
})();
