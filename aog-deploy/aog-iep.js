/* AOG-IEP-REC-V1 (2026-09-25) — ONE IEP RECORD FOR EVERY SEND.
   Jimmy: "make sure that EVERY SINGLE ITEM that is able to be sent to the
   teacher has the capability to be used in IEP data."

   Every page that sends work to the teacher calls AOG_IEP.fill(payload) just
   before it posts. fill() adds the same columns everywhere (the sheet script's
   PRACTICE_COLS lists them):
     correct, total, pctCorrect   accuracy, first try
     standards                    standard codes the work served
     byStrand                     per-skill breakdown, "Skill 2/3; Skill 1/1"
     supports                     listen; spanish; hints; wordbank; retry
     attempt                      this student's attempt number on this page
     minutes                      time on task since the page opened
     course, unit, assessment     for course pages
   A page may pass any of these itself; fill() only fills what is missing.
   Nothing here sends anything, and nothing here is shown to the student. */
(function () {
  "use strict";
  if (window.AOG_IEP) return;
  var T0 = Date.now(), used = {}, KEY = "aog.iep.v1.";

  function mark(s) { if (s) used[s] = true; }

  /* Listen / read-aloud: every Listen button on the site ends in
     speechSynthesis.speak, so one wrapper sees them all. */
  try {
    var ss = window.speechSynthesis;
    if (ss && ss.speak && !ss.speak.__aogIep) {
      var sp = ss.speak.bind(ss);
      var w = function (u) { mark("listen"); return sp(u); };
      w.__aogIep = true;
      ss.speak = w;
    }
  } catch (e) {}

  function lang() {
    try {
      var q = new URLSearchParams(location.search).get("lang");
      if (q) return q.toLowerCase();
    } catch (e) {}
    return String(document.documentElement.lang || "en").toLowerCase();
  }

  function attemptKey(p) {
    return KEY + "att." + String(p.activityId || location.pathname) + "." + String(p.studentId || "");
  }
  function nextAttempt(p) {
    var k = attemptKey(p), n = 1;
    try { n = (parseInt(localStorage.getItem(k), 10) || 0) + 1; localStorage.setItem(k, String(n)); } catch (e) {}
    return n;
  }

  function num(v) { return (typeof v === "number" && isFinite(v)) ? v : (v !== "" && v != null && isFinite(+v) ? +v : null); }

  /* byStrand may arrive as rows [{name|strand|k, ok|right|correct, n|total}] or as a string */
  function strandText(rows) {
    if (!rows) return "";
    if (typeof rows === "string") return rows;
    try {
      return rows.map(function (r) {
        var nm = r.name || r.strand || r.k || r.label || "";
        var ok = num(r.ok); if (ok === null) ok = num(r.right); if (ok === null) ok = num(r.correct);
        var n = num(r.n); if (n === null) n = num(r.total);
        return nm + (n !== null ? " " + (ok || 0) + "/" + n : "");
      }).filter(Boolean).join("; ");
    } catch (e) { return ""; }
  }

  function pageStandards() {
    if (window.AOG_PAGE_STANDARDS) return [].concat(window.AOG_PAGE_STANDARDS).join("; ");
    var m = document.querySelector('meta[name="aog-standards"]');
    return m ? m.getAttribute("content") || "" : "";
  }

  function fill(p, opt) {
    opt = opt || {};
    if (!p || typeof p !== "object") return p;
    var ex = {};
    try { ex = typeof p.extra === "string" ? JSON.parse(p.extra) : (p.extra || {}); } catch (e) { ex = {}; }
    var t = ex.tally || {};

    if (p.correct === undefined) {
      var c = num(opt.correct); if (c === null) c = num(ex.correct); if (c === null) c = num(t.correct);
      if (c === null) c = num(p.independent);
      p.correct = c === null ? "" : c;
    }
    if (p.total === undefined) {
      var n = num(opt.total); if (n === null) n = num(ex.total); if (n === null) n = num(t.total);
      if (n === null) n = num(p.itemsTotal);
      p.total = n === null ? "" : n;
    }
    if (p.pctCorrect === undefined) {
      p.pctCorrect = (num(p.total) > 0 && num(p.correct) !== null) ? Math.round(p.correct / p.total * 100) : "";
    }
    if (p.standards === undefined) p.standards = opt.standards || ex.standards || pageStandards() || "";
    if (p.byStrand === undefined) p.byStrand = strandText(opt.byStrand || ex.byStrand) || "";

    var sup = Object.keys(used);
    if (lang().indexOf("es") === 0 || String(ex.lang || "").indexOf("es") === 0) sup.push("spanish");
    if (num(p.hintsUsed) > 0 || num(ex.hints) > 0 || num(t.hints) > 0) sup.push("hints");
    if (num(p.supported) > 0) sup.push("retry");
    (opt.supports || []).forEach(function (s) { sup.push(s); });
    if (p.supports === undefined) {
      p.supports = sup.filter(function (s, i) { return sup.indexOf(s) === i; }).join("; ");
    }
    if (p.attempt === undefined) p.attempt = nextAttempt(p);
    if (p.minutes === undefined) p.minutes = Math.round((Date.now() - T0) / 6000) / 10;
    ["course", "unit", "assessment"].forEach(function (k) { if (p[k] === undefined && opt[k] !== undefined) p[k] = opt[k]; });
    if (p.assessment === undefined) p.assessment = "practice";
    return p;
  }

  window.AOG_IEP = { fill: fill, mark: mark, supportsUsed: function () { return Object.keys(used); } };
})();
