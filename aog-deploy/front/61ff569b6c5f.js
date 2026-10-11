
/* =====================================================================
   THE CHECK-INS DOOR · build 2026.08.29s

   Four small runtime layers that finish the door merge and the demo-truth
   fixes. Source-level changes (MODES, ORDER, LAB, markup, tour) live in
   #aog-dash-modes-js and the static markup; this block holds only what has
   to run.

   1 · REFLECT TAB — the third moment. A MAP, not a second engine: count via
       AOGTotals.split (never recomputed — the one-total rule), jumps to
       where things already live.
   2 · GREETING REPAINT — the header said "No self-reflections yet" over 310
       records because nothing repainted #dashToday after load. It now rides
       refreshAdmin. ⚠ The wrapper copies every property off the function it
       wraps — four other layers guard on their own __aog* flags, and a
       wrapper that drops them makes them wrap AGAIN on their next retry
       (the .29k double-card bug).
   3 · DEMO SEEDS — toggleDemoData seeded reflections, teacher daily logs
       and IEP goals but ZERO student check-ins and ZERO exit slips, so the
       voice card said "0 students answered" beside "90 check-ins today".
       Seeds ride the instruments' own record shapes; option strings are
       the banks' exact keys (they are KEYS — the voice card buckets by
       them). Stash/restore is symmetric: Clear puts back exactly what a
       real classroom had (the backup-symmetry rule).
   4 · ESCAPE closes the role/demo menus and the More menu — team-review
       item 13.
   ===================================================================== */
(function () {
  "use strict";
  function jload(k, fb) { try { return JSON.parse(localStorage.getItem(k) || "") || fb; } catch (e) { return fb; } }
  function jsave(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function isEs() { try { return (typeof dashLang !== "undefined" && dashLang === "es"); } catch (e) { return false; } }
  function dayISO(back) {
    var d = new Date(); if (back) d.setDate(d.getDate() - back);
    var m = d.getMonth() + 1, a = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (a < 10 ? "0" + a : a);
  }
  /* The nth most recent SCHOOL day (0 = today, or Friday on a weekend).
     buildDemoDaily seeds weekdays only; a seed that put student check-ins
     on a Saturday would sit beside a Daily Log that skipped it. */
  function schoolISO(n) {
    var d = new Date();
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
    while (n > 0) { d.setDate(d.getDate() - 1); while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1); n--; }
    var m = d.getMonth() + 1, a = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (a < 10 ? "0" + a : a);
  }

  /* ----------------------------------------------------- 1 · reflect tab */
  window.aogReflectGo = function (dest) {
    try {
      if (dest === "distribute") {
        /* ⚠ 2026-09-09: the reflection pill is hidden (aog-dist-trim-switch);
           landing here would open a strip with no pane under it. */
        try { localStorage.setItem("aog.dist.tab", "checkin"); } catch (e) {}
        if (window.aogSetDashMode) window.aogSetDashMode("setup");
      } else if (dest === "student") {
        /* .30gz — since the .30gt/.30gu merges, Reflection LIVES in the student
           door, so aogSetDashMode("student") was a same-door no-op and the
           button did nothing (Jimmy 2026-09-05). The reports are the Student
           view TAB (data-tab="home"); aogQsTab lands door and tab together. */
        if (window.aogQsTab) window.aogQsTab("home");
        else if (window.aogSetDashMode) window.aogSetDashMode("student");
      } else if (window.aogSetDashMode) {
        window.aogSetDashMode("trends");
      }
    } catch (e) {}
  };

  function paintReflectCount() {
    var el = document.getElementById("aogReflectCount");
    if (!el) return;
    var es = isEs();
    try {
      var recs = (typeof getAllRecords === "function" ? getAllRecords() : []) || [];
      var sp = (window.AOGTotals && window.AOGTotals.split) ? window.AOGTotals.split(recs) : null;
      if (!sp || !sp.total) {
        el.textContent = es ? "Aún no hay autorreflexiones en este dispositivo."
                            : "No self-reflections on this device yet.";
        return;
      }
      var t = sp.student + " " + (es
        ? (sp.student === 1 ? "autorreflexión de estudiante" : "autorreflexiones de estudiantes")
        : (sp.student === 1 ? "student self-reflection" : "student self-reflections"))
        + (es ? " en este dispositivo" : " on this device");
      var extra = [];
      if (sp.home) extra.push(sp.home + (es ? " en casa" : " at home"));
      if (sp.adult) extra.push(sp.adult + (es ? " de adultos" : " adults’ own"));
      el.textContent = t + (extra.length ? " · " + extra.join(" · ") : "") + ".";
    } catch (e) { try { el.textContent = ""; } catch (_e) {} }
  }

  /* ------------------------------------------- 2 · greeting on refreshAdmin */
  function paintGreeting() {
    try {
      var td = document.getElementById("dashToday");
      if (td && window.aogTodayCard) td.innerHTML = window.aogTodayCard(isEs());
    } catch (e) {}
  }
  function wrapRefresh() {
    var f = window.refreshAdmin;
    if (typeof f !== "function" || f.__aogGreet) return;
    var w = function () {
      var r = f.apply(this, arguments);
      try { paintGreeting(); } catch (e) {}
      try { paintReflectCount(); } catch (e) {}
      /* door titles are JS-built text — they hang on refreshAdmin, never on
         a lang-attribute observer (the .29l rule). */
      try { if (window.__aogDashModes && window.__aogDashModes.paint) window.__aogDashModes.paint(); } catch (e) {}
      return r;
    };
    for (var k in f) { try { w[k] = f[k]; } catch (e) {} }
    w.__aogGreet = true;
    window.refreshAdmin = w;
  }

  /* --------------------------------------------------- 3 · demo seeds */
  var CK = "aog.checkin.student.v1", XK = "aog.exit.v1";
  var CKS = "aogScreener.demoStash.checkins", XKS = "aogScreener.demoStash.exit";

  function pushLog(store, rec) {
    if (!store.logs) store.logs = {};
    if (!store.logs[rec.studentId]) store.logs[rec.studentId] = {};
    if (!store.logs[rec.studentId][rec.date]) store.logs[rec.studentId][rec.date] = [];
    store.logs[rec.studentId][rec.date].push(rec);
  }
  function mkCi(sid, date, hhmm, period, o) {
    var r = {
      timestamp: date + "T" + hhmm + ":00.000Z", date: date,
      slipType: "checkin", checkinType: "daily",
      assignmentId: "", trackingGroup: "", term: "",
      districtId: "", schoolId: "", classId: "", grade: "7",
      period: period, studentId: sid, respondentId: sid, respondentRole: "student",
      arrival: 3, feelingWords: "Calm", need: "I’m okay", connection: 3,
      challenge: "Nothing today", challengeImpact: "", readiness: 4,
      contextTag: "", tellAdult: "", agency: "Ask for help", note: "",
      followUp: false, source: "link"
    };
    for (var k in o) r[k] = o[k];
    return r;
  }
  function mkX(sid, date, o) {
    var r = {
      timestamp: date + "T20:05:00.000Z", date: date, submitTime: "3:05 PM",
      slipType: "exit",
      districtId: "", schoolId: "", classId: "", grade: "7",
      period: "", term: "", assignmentId: "", trackingGroup: "",
      studentId: sid, respondentId: sid, respondentRole: "student",
      classesAvailable: "ELA | Math | Science", scheduleSource: "link",
      favClass: "", favWhy: "", hardClass: "", hardWhy: "", goodMoment: "",
      roughMoment: "", response: "", closing: "", dayWord: "", written: "",
      followUp: false, source: "link"
    };
    for (var k in o) r[k] = o[k];
    return r;
  }

  /* Option strings are the banks' exact keys — copied, never reworded. */
  var FEEL = ["Good", "Tired", "Calm", "Worried", "Focused", "Frustrated", "Happy", "Overwhelmed"];
  var NEED = ["I’m okay", "A quiet minute", "Help getting started", "More time", "Encouragement", "I’m okay", "Help", "Nothing right now"];
  var CHAL = ["Nothing today", "Schoolwork", "I’m distracted", "Sleep", "Something with friends", "Schoolwork", "I’m stuck", "I’m worried"];
  var AGCY = ["Ask for help", "Use the Pause", "Start the hard thing first", "Use my Coach Voice", "Take a real break", "Ask for help"];
  var XHARDWHY = ["I didn’t understand it", "I ran out of time", "I got frustrated", "I was distracted"];
  var XRESP = ["I asked for help", "I kept trying", "I moved on", "I gave up"];
  var XGOOD = ["Someone made me laugh", "I learned something"];
  var XDAY = ["Okay", "Pretty good", "Difficult", "Okay", "Pretty good"];

  function seedDemoVoice() {
    var names = Object.keys((jload("aog.daily.v1", {}) || {}).logs || {})
      .filter(function (n) { return !/\(home\)/i.test(n); });
    if (!names.length) return;
    /* stash exactly once — never stash demo data as if it were real */
    if (localStorage.getItem(CKS) == null) localStorage.setItem(CKS, localStorage.getItem(CK) || "");
    if (localStorage.getItem(XKS) == null) localStorage.setItem(XKS, localStorage.getItem(XK) || "");

    var ci = { logs: {} }, xs = { logs: {} };
    var days = [schoolISO(0), schoolISO(1), schoolISO(2)];
    var perDay = [Math.min(24, names.length), Math.min(20, names.length), Math.min(18, names.length)];
    days.forEach(function (d, di) {
      for (var i = 0; i < perDay[di]; i++) {
        var sid = names[i];
        var chal = CHAL[(i + di) % CHAL.length];
        var o = {
          arrival: 2 + ((i + di) % 4), connection: 2 + ((i * 2 + di) % 4),
          readiness: 2 + ((i + di * 2) % 4),
          feelingWords: FEEL[(i + di) % FEEL.length],
          need: NEED[(i + di * 3) % NEED.length],
          challenge: chal,
          challengeImpact: chal === "Nothing today" ? "" : (2 + ((i + di) % 3)),
          agency: AGCY[(i + di) % AGCY.length],
          period: "Period " + (1 + (i % 7))
        };
        /* two hands up TODAY — the See-who tap and the voice card's typed
           words both have something real to show */
        if (di === 0 && i === 4) { o.tellAdult = "Can I talk to someone about lunch? It keeps going wrong."; o.followUp = true; }
        if (di === 0 && i === 11) { o.tellAdult = "I want to show you what I did in math."; o.followUp = true; }
        pushLog(ci, mkCi(sid, d, "13:0" + (i % 6), o.period, o));
      }
    });

    var xDays = [schoolISO(0), schoolISO(1)];
    var xPerDay = [Math.min(16, names.length), Math.min(20, names.length)];
    xDays.forEach(function (d, di) {
      for (var j = 0; j < xPerDay[di]; j++) {
        var sid2 = names[j];
        var o2 = {
          favClass: ["Science", "Art", "ELA", "Math"][j % 4],
          dayWord: XDAY[(j + di) % XDAY.length],
          goodMoment: XGOOD[(j + di) % XGOOD.length],
          response: XRESP[(j + di) % XRESP.length]
        };
        /* a pattern worth noticing: Math named hard by the same four, same reason */
        if (j % 5 === 1) { o2.hardClass = "Math"; o2.hardWhy = XHARDWHY[0]; }
        else if (j % 5 === 3) { o2.hardClass = "ELA"; o2.hardWhy = XHARDWHY[(j + di) % XHARDWHY.length]; }
        if (di === 0 && j === 6) { o2.response = "I need help with this"; o2.followUp = true; }
        if (di === 0 && j === 9) { o2.written = "Today was better than yesterday."; o2.followUp = true; }
        pushLog(xs, mkX(sid2, d, o2));
      }
    });

    jsave(CK, ci); jsave(XK, xs);
  }

  function restoreVoice() {
    try {
      var c = localStorage.getItem(CKS);
      if (c != null) { if (c) localStorage.setItem(CK, c); else localStorage.removeItem(CK); localStorage.removeItem(CKS); }
      var x = localStorage.getItem(XKS);
      if (x != null) { if (x) localStorage.setItem(XK, x); else localStorage.removeItem(XK); localStorage.removeItem(XKS); }
    } catch (e) {}
  }

  function wrapDemo() {
    var f = window.toggleDemoData;
    if (typeof f !== "function" || f.__aogVoiceSeed) return;
    var w = function () {
      var wasOn = false;
      try { wasOn = localStorage.getItem("aogScreener.demoActive") === "1"; } catch (e) {}
      var r = f.apply(this, arguments);
      try {
        var isOn = localStorage.getItem("aogScreener.demoActive") === "1";
        if (!wasOn && isOn) seedDemoVoice();
        else if (wasOn && !isOn) restoreVoice();
        if (typeof window.refreshAdmin === "function") window.refreshAdmin();
        paintGreeting();
      } catch (e2) {}
      return r;
    };
    for (var k in f) { try { w[k] = f[k]; } catch (e) {} }
    w.__aogVoiceSeed = true;
    window.toggleDemoData = w;
  }

  /* --------------------------------------------- 4 · Escape closes menus */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" && e.key !== "Esc") return;
    try { if (window.aogCloseMoreTabs) window.aogCloseMoreTabs(); } catch (e1) {}
    try {
      ["aogDemoMenu", "dashRoleCompactMenu"].forEach(function (id) {
        var m = document.getElementById(id); if (m) m.hidden = true;
      });
      ["aogDemoBtn", "dashRoleCompactBtn"].forEach(function (id) {
        var b = document.getElementById(id); if (b) b.setAttribute("aria-expanded", "false");
      });
    } catch (e2) {}
  });

  /* ------------------------------------------------------------- boot */
  function boot() { wrapRefresh(); wrapDemo(); paintReflectCount(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 700);
  setTimeout(boot, 2000);

  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest && e.target.closest('.tab[data-tab="reflect"], .dmode[data-mode="voice"]');
    if (t) setTimeout(paintReflectCount, 250);
  });
})();
