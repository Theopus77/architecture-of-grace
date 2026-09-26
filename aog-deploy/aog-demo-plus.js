/* AOG-DEMO-PLUS-V1 · 2026-09-25
   ═══════════════════════════════════════════════════════════════════════
   THE DEMO, THE WHOLE PICTURE.

   Jimmy: "Can the MTSS demo data get a face lift with all the new pulls we
   can do, plus with all the new data points from the daily drafts and etc."

   "Try demo data" used to fill the self-reflection, the daily log, four IEP
   goals and three days of check-ins. Every pull added since — Daily Drafts
   and Word Foundry practice rows, the support check-ins other adults send
   from their own devices, family evening check-ins, home observations on an
   IEP goal, team evidence, This Is Me pages — landed on an empty tab in
   demo. A principal deciding whether to keep reading saw "Nothing yet" on
   the tabs that are the product's best argument.

   THIS LAYER WRAPS THE SAME TOGGLE the check-ins door already wraps, and
   keeps its three rules:
     1 · a real store is stashed before it is touched, and comes back on Clear
         (this layer keeps its own stash under one key, and only ever restores
         what it stashed);
     2 · option strings are the banks' exact keys — copied, never reworded —
         so every reader that joins on them still joins;
     3 · nothing here is sent anywhere. It is written into this browser the
         way a pull would write it (source "sheet", _remote true), and no
         fetch happens.

   It also gives the MTSS Report the section the request was really about:
   for the student on screen, everything the OTHER pulls know — check-ins,
   exit slips, what the adults around them noted, practice, IEP progress,
   team and home evidence — under the self-reflection scores, on screen and
   in print. Real data or demo, the section reads the same stores.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var FLAG = "aogScreener.demoActive";
  var PLUS = "aogScreener.demoStash.plus";          /* { key: stashedString|null } */
  var REC  = "aogScreener.v2.results";
  var CK   = "aog.checkin.student.v1", XK = "aog.exit.v1", DK = "aog.daily.v1";
  var CKS  = "aogScreener.demoStash.checkins", XKS = "aogScreener.demoStash.exit";
  var RK   = "aog.checkin.remote", PK = "aog.practice.remote";
  var HCK  = "aog.home.checkin.v1", HOK = "aog.iep.home.v1", TK = "aog.iepteam.v1";
  var TIM  = "aog.thisisme.v1", PMK = "aog.mtss.pm.v1", MMK = "aog.mtss.meta";
  var OWN  = [RK, PK, HCK, HOK, TK, TIM, PMK, MMK];

  /* ------------------------------------------------------------ helpers */
  function T(en, es) { try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function jload(k, fb) { try { var v = JSON.parse(lsGet(k) || ""); return (v === null || v === undefined) ? fb : v; } catch (e) { return fb; } }
  function jsave(k, v) { lsSet(k, JSON.stringify(v)); }
  function demoOn() { return lsGet(FLAG) === "1"; }
  function h(str) { var x = 2166136261; str = String(str); for (var i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0) % 100; }
  function pick(list, salt) { return list[h(salt) % list.length]; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function stamp(date, hh, mm) { var p = date.split("-"); return new Date(+p[0], +p[1] - 1, +p[2], hh, mm || 0).toISOString(); }
  function clock(hh, mm) { var d = new Date(); d.setHours(hh, mm || 0); try { return d.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }); } catch (e) { return ""; } }
  /* the last n school days, newest first — index 0 is today if today is a school day */
  function schoolDays(n) {
    var out = [], d = new Date(); d.setHours(0, 0, 0, 0);
    while (out.length < n) { var w = d.getDay(); if (w !== 0 && w !== 6) out.push(iso(d)); d.setDate(d.getDate() - 1); }
    return out;
  }
  function gradeNum(g) { var n = parseInt(g, 10); return g === "K" ? 0 : (isNaN(n) ? 7 : n); }
  function gradeLabel(g) { var n = gradeNum(g); return n === 0 ? "Kindergarten" : n >= 11 ? "Grades 11–12" : n >= 9 ? "Grades 9–10" : "Grade " + n; }
  function code(s) { return String(s == null ? "" : s).trim().toUpperCase(); }

  /* ------------------------------------------------------------- roster
     The same people the demo already has: names from the demo daily log,
     grade and composite from each one's latest self-reflection. */
  function roster() {
    var logs = (jload(DK, {}) || {}).logs || {};
    var latest = {};
    (jload(REC, []) || []).forEach(function (r) {
      if (!r || r.context !== "school") return;
      var id = String(r.studentId || ""), ts = String(r.timestamp || "");
      if (!latest[id] || ts > latest[id].ts) latest[id] = { ts: ts, grade: String(r.grade || "7"), comp: +(r.normComposite || r.composite || 60) };
    });
    return Object.keys(logs).filter(function (n) { return !/\(home\)/i.test(n); }).map(function (id) {
      var l = latest[id] || { grade: "7", comp: 60 };
      return { id: id, grade: l.grade, comp: l.comp, g: gradeNum(l.grade) };
    });
  }

  /* ============================================================ 1 · CHECK-INS
     Fifteen school days instead of three, with each student's mornings
     shaped by their own composite, so the class trend, the timeline and the
     voice card have real weeks to read. Option strings are the banks' keys. */
  var FEEL_HI = ["Good", "Calm", "Focused", "Happy"];
  var FEEL_MID = ["Calm", "Tired", "Good", "Focused"];
  var FEEL_LO = ["Tired", "Worried", "Frustrated", "Overwhelmed"];
  var NEED_OK = ["I’m okay", "Nothing right now", "I’m okay"];
  var NEED_LO = ["A quiet minute", "Help getting started", "More time", "Encouragement", "Help"];
  var CHAL = ["Schoolwork", "I’m distracted", "Sleep", "Something with friends", "I’m stuck", "I’m worried"];
  var AGCY = ["Ask for help", "Use the Pause", "Start the hard thing first", "Use my Coach Voice", "Take a real break"];
  var TELL = [
    "Can I talk to someone about lunch? It keeps going wrong.",
    "I want to show you what I did in math.",
    "Group work is hard for me right now.",
    "I didn’t sleep much. Can I have a slower start?"
  ];

  function mkCi(st, date, hh, mm, o) {
    var r = {
      timestamp: stamp(date, hh, mm), date: date,
      slipType: "checkin", checkinType: "daily",
      assignmentId: "", trackingGroup: "", term: "",
      districtId: "", schoolId: "", classId: "Demo", grade: st.grade,
      period: "", studentId: st.id, respondentId: st.id, respondentRole: "student",
      arrival: 3, feelingWords: "Calm", need: "I’m okay", connection: 3,
      challenge: "Nothing today", challengeImpact: "", readiness: 4,
      contextTag: "", tellAdult: "", agency: "Ask for help", note: "",
      followUp: false, source: "link"
    };
    for (var k in o) r[k] = o[k];
    return r;
  }

  function buildCheckins(people, days) {
    var ci = { logs: {} }, tells = 0;
    days.forEach(function (d, di) {
      people.forEach(function (st, i) {
        if (h(st.id + d + "ci") >= (di === 0 ? 90 : 74)) return;
        var base = st.comp >= 75 ? 4 : st.comp >= 50 ? 3 : 2;
        var lift = (st.comp < 50 && di < 6) ? 1 : 0;            /* the low group is coming up this fortnight */
        var arrival = clamp(base + (h(st.id + d + "a") % 3) - 1 + (lift && h(st.id + d + "l") < 50 ? 1 : 0), 1, 5);
        var connection = clamp(base + (h(st.id + d + "c") % 3) - 1, 1, 5);
        var readiness = clamp(base + (h(st.id + d + "r") % 3) - 1 + lift, 1, 5);
        var low = arrival <= 2;
        var chal = (!low && h(st.id + d + "n") < 55) ? "Nothing today" : pick(CHAL, st.id + d + "ch");
        var o = {
          period: st.g <= 5 ? "Advisory" : "Period " + (1 + (i % 6)),
          arrival: arrival, connection: connection, readiness: readiness,
          feelingWords: pick(arrival >= 4 ? FEEL_HI : arrival === 3 ? FEEL_MID : FEEL_LO, st.id + d + "f"),
          need: low ? pick(NEED_LO, st.id + d + "nd") : pick(NEED_OK, st.id + d + "nd"),
          challenge: chal,
          challengeImpact: chal === "Nothing today" ? "" : clamp(2 + (h(st.id + d + "im") % 3) + (low ? 1 : 0), 1, 5),
          agency: pick(AGCY, st.id + d + "ag")
        };
        if (di <= 1 && low && tells < 4 && h(st.id + d + "t") < 40) { o.tellAdult = TELL[tells++]; o.followUp = true; }
        var rec = mkCi(st, d, st.g <= 5 ? 8 : 8 + (i % 3), 5 + (h(st.id + d + "m") % 50), o);
        if (!ci.logs[st.id]) ci.logs[st.id] = {};
        if (!ci.logs[st.id][d]) ci.logs[st.id][d] = [];
        ci.logs[st.id][d].push(rec);
      });
    });
    return ci;
  }

  /* ========================================================== 2 · EXIT SLIPS */
  var CLASSES = ["ELA", "Math", "Science", "Social Studies"];
  var XHARDWHY = ["I didn’t understand it", "I ran out of time", "I got frustrated", "I was distracted"];
  var XRESP = ["I asked for help", "I kept trying", "I moved on", "I gave up"];
  var XGOOD = ["Someone made me laugh", "I learned something"];
  var XDAY = ["Okay", "Pretty good", "Difficult"];
  var XWRITE = ["Today was better than yesterday.", "Math felt too fast again.", "I finished my draft and I like it.", "I want to sit somewhere else in science."];

  function mkX(st, date, o) {
    var r = {
      timestamp: stamp(date, 15, 5), date: date, submitTime: clock(15, 5),
      slipType: "exit",
      districtId: "", schoolId: "", classId: "Demo", grade: st.grade,
      period: "", term: "", assignmentId: "", trackingGroup: "",
      studentId: st.id, respondentId: st.id, respondentRole: "student",
      classesAvailable: CLASSES.join(" | "), scheduleSource: "link",
      favClass: "", favWhy: "", hardClass: "", hardWhy: "", goodMoment: "",
      roughMoment: "", response: "", closing: "", dayWord: "", written: "",
      followUp: false, source: "link"
    };
    for (var k in o) r[k] = o[k];
    return r;
  }

  function buildExits(people, days) {
    var xs = { logs: {} }, writes = 0;
    days.forEach(function (d, di) {
      people.forEach(function (st, j) {
        if (h(st.id + d + "x") >= (di === 0 ? 78 : 62)) return;
        var low = st.comp < 50, mid = st.comp < 75;
        var o = {
          favClass: pick(CLASSES, st.id + "fav"),                     /* a favorite is stable */
          dayWord: low ? pick(["Difficult", "Okay", "Okay"], st.id + d + "dw") : pick(XDAY, st.id + d + "dw"),
          goodMoment: pick(XGOOD, st.id + d + "gm"),
          response: low ? pick(XRESP, st.id + d + "rs") : pick(XRESP.slice(0, 3), st.id + d + "rs")
        };
        /* the pattern worth noticing: Math named hard by the same students, same reason */
        if (mid && h(st.id + "hard") < 55) { o.hardClass = "Math"; o.hardWhy = XHARDWHY[0]; }
        else if (h(st.id + d + "hc") < 30) { o.hardClass = pick(CLASSES, st.id + d + "hcl"); o.hardWhy = pick(XHARDWHY, st.id + d + "hw"); }
        if (di <= 1 && writes < 4 && h(st.id + d + "w") < 25) { o.written = XWRITE[writes++]; o.followUp = true; }
        var rec = mkX(st, d, o);
        if (!xs.logs[st.id]) xs.logs[st.id] = {};
        if (!xs.logs[st.id][d]) xs.logs[st.id][d] = [];
        xs.logs[st.id][d].push(rec);
      });
    });
    return xs;
  }

  /* ================================================ 3 · THE OTHER ADULTS
     Support check-ins as they come back from the Sheet: signed, with the v2
     observation sentences, filed into the daily log (Team tab, IEP evidence
     queue) and mirrored raw into aog.checkin.remote (Inbox). */
  var ADULTS = [
    { id: "Ms. Okafor", role: "special_educator", periods: ["Period 2", "Period 5"] },
    { id: "Mr. Reyes", role: "social_worker", periods: ["Advisory", "Period 4"] },
    { id: "Ms. Lindqvist", role: "related_service", periods: ["Period 3"] },
    { id: "Coach Dane", role: "other_staff", periods: ["Period 6"] }
  ];
  var OBS_GOOD = ["e_stayed", "e_asked", "e_own", "e_joined", "e_kept", "r_back", "r_change", "r_tool", "r_fair", "c_built", "c_kind", "c_worked"];
  var OBS_DOM = { e_stayed: "engaged", e_asked: "engaged", e_own: "engaged", e_joined: "engaged", e_kept: "usedStrategy",
                  r_back: "regulated", r_change: "regulated", r_tool: "regulated", r_fair: "usedStrategy",
                  c_built: "connected", c_kind: "connected", c_worked: "connected" };
  var NOTES = ["Used the Pause on her own before answering.", "Needed a reset after the transition, came back well.",
               "Asked a peer for help instead of shutting down.", "Rough start; a walk and water helped.",
               "Stayed with the hard problem for the whole block.", "Named the feeling before it got big — first time I’ve seen that."];

  function buildSupport(focus, days) {
    var rows = [];                      /* raw, as a pull returns them */
    focus.forEach(function (st, si) {
      days.forEach(function (d, di) {
        ADULTS.forEach(function (a, ai) {
          if (h(st.id + d + a.id) >= 38) return;
          var prog = (days.length - 1 - di) / (days.length - 1);         /* 0 oldest .. 1 today */
          var nGood = clamp(Math.round(1 + prog * 2 + (h(st.id + d + a.id + "g") % 2)), 1, 4);
          var obs = [], seen = {};
          for (var k = 0; k < nGood; k++) { var key = OBS_GOOD[(h(st.id + d + a.id + k) + k * 5) % OBS_GOOD.length]; if (!seen[key]) { seen[key] = 1; obs.push(key); } }
          var dom = { engaged: false, regulated: false, usedStrategy: false, connected: false };
          obs.forEach(function (o) { dom[OBS_DOM[o]] = true; });
          var flags = (h(st.id + d + a.id + "fl") < 12) ? [h(st.id + d) < 50 ? "f_strength" : "f_know"] : [];
          var period = pick(a.periods, st.id + d + a.id + "p");
          var note = (h(st.id + d + a.id + "n") < 30) ? pick(NOTES, st.id + d + a.id + "nt") : "";
          var hr = period === "Advisory" ? 8 : 9 + (parseInt(period.replace(/\D/g, ""), 10) || 1);
          rows.push({
            timestamp: stamp(d, hr, 20 + ai * 7), date: d, slipType: "checkin", checkinType: "support",
            assignmentId: "", trackingGroup: "", term: "", districtId: "", schoolId: "", classId: "Demo",
            grade: st.grade, period: period, periodNum: period === "Advisory" ? 0 : (parseInt(period.replace(/\D/g, ""), 10) || ""),
            studentId: st.id, respondentRole: a.role, respondentId: a.id,
            regulated: dom.regulated, usedStrategy: dom.usedStrategy, connected: dom.connected,
            pct: Math.round(((dom.engaged ? 1 : 0) + (dom.regulated ? 1 : 0) + (dom.usedStrategy ? 1 : 0) + (dom.connected ? 1 : 0)) / 4 * 100),
            note: note, followUp: !!flags.length, source: "link",
            arrival: "", feelingWords: "", need: "", connection: "", challenge: "", challengeImpact: "",
            readiness: "", contextTag: "", tellAdult: "", agency: "",
            extra: JSON.stringify({ obsSchema: "v2", engaged: dom.engaged, obs: obs, flags: flags })
          });
        });
      });
    });
    return rows;
  }
  function fileSupportIntoDaily(rows) {
    var store = jload(DK, {}) || {};
    if (!store.logs) store.logs = {};
    var seen = {};
    Object.keys(store.logs).forEach(function (sid) {
      Object.keys(store.logs[sid] || {}).forEach(function (date) {
        ((store.logs[sid][date] || {}).periods || []).forEach(function (p) { seen[sid + "|" + p.timestamp] = 1; });
      });
    });
    rows.forEach(function (r) {
      if (seen[r.studentId + "|" + r.timestamp]) return;
      var x = JSON.parse(r.extra);
      if (!store.logs[r.studentId]) store.logs[r.studentId] = {};
      if (!store.logs[r.studentId][r.date]) store.logs[r.studentId][r.date] = { periods: [] };
      if (!store.logs[r.studentId][r.date].periods) store.logs[r.studentId][r.date].periods = [];
      store.logs[r.studentId][r.date].periods.push({
        period: r.period, regulated: r.regulated, usedStrategy: r.usedStrategy, connected: r.connected,
        engaged: x.engaged, obs: x.obs, flags: x.flags, obsSchema: "v2",
        note: r.note, timestamp: r.timestamp, slipType: "checkin", checkinType: "support",
        respondentId: r.respondentId, respondentRole: r.respondentRole,
        assignmentId: "", trackingGroup: "", term: "", year: "", followUp: r.followUp,
        source: "sheet", _remote: true, _demoPlus: true
      });
    });
    jsave(DK, store);
  }

  /* =============================================== 4 · PRACTICE ROWS
     What Daily Drafts, Word Foundry and the practice modules post when a set
     is finished — one summary row each, exactly the columns the Practice tab
     of the Sheet holds. Independent rises across the fortnight; hints fall. */
  var DD = [["math", "Math", "drops-math"], ["ela", "ELA", "drops-ela"], ["science", "Science", "drops-science"], ["social", "Social Studies", "drops-social"]];
  var WF_UNITS = [[1, "Roots of Motion"], [2, "Light and Sight"], [3, "Water and Earth"], [4, "Body and Life"], [5, "Time and Number"]];
  function pctOf(a, b) { return b ? Math.round(a / b * 100) : ""; }
  function buildPractice(people, days) {
    var rows = [];
    var learners = people.filter(function (st) { return st.g >= 2; }).slice(0, 14);
    learners.forEach(function (st, si) {
      var subj = [DD[si % 4], DD[(si + 1 + (si % 2)) % 4]];
      var gl = st.g >= 11 ? "11-12" : st.g >= 9 ? "9-10" : String(st.g);
      subj.forEach(function (s, sj) {
        var sheet = 1 + (h(st.id + s[0]) % 4);
        var base = clamp(Math.round(st.comp / 100 * 7 + 1), 3, 8);
        days.slice().reverse().forEach(function (d, k) {
          if (h(st.id + d + s[0]) >= 48) return;
          var prog = k / (days.length - 1);
          var first = clamp(Math.round(base + prog * 2 + (h(st.id + d + s[0] + "j") % 3) - 1), 2, 10);
          var hints = clamp(Math.round(2.5 - prog * 2 + (h(st.id + d + "h") % 2)), 0, 3);
          var supported = first < 10 ? clamp(Math.round((10 - first) * 0.6), 0, 10 - first) : 0;
          rows.push({
            timestamp: stamp(d, 10 + sj, 30 + (h(st.id + d) % 25)), date: d, checkinType: "practice",
            activityId: "dd-" + s[0] + "-g" + gl + "-s" + sheet, activityName: "Daily Drafts — " + s[1] + " · " + gradeLabel(st.grade),
            skill: "Daily spiral review, 10 strands — score is items correct",
            setNo: sheet, itemsTotal: 10, independent: first, supported: supported,
            pctIndependent: pctOf(first, 10), hintsUsed: hints, confidence: "",
            studentId: st.id, note: "", source: "link", group: s[2],
            extra: JSON.stringify({ series: "daily-drops", lang: "en", build: "demo", subject: s[0], grade: gl, sheet: sheet,
                                    correct: first + supported, total: 10, checked: true, hints: hints, finalCorrect: first + supported })
          });
          sheet++;
        });
      });
    });
    /* writing — a scored rubric, 6 categories × 4 */
    learners.slice(0, 6).forEach(function (st, si) {
      [8, 4, 1].forEach(function (back, k) {
        var d = days[Math.min(back, days.length - 1)];
        var tot = clamp(Math.round(12 + st.comp / 10 + k * 2 + (h(st.id + d + "wr") % 3)), 8, 24);
        rows.push({
          timestamp: stamp(d, 13, 10 + si), date: d, checkinType: "practice",
          activityId: "dd-write-g" + (st.g >= 9 ? "9-10" : st.g) + "-s" + (k + 1), activityName: "Daily Drafts — Writing · " + gradeLabel(st.grade),
          skill: "Writing rubric — 6 categories, 4 points each, out of 24",
          setNo: k + 1, itemsTotal: 24, independent: tot, supported: "", pctIndependent: pctOf(tot, 24), hintsUsed: "", confidence: "",
          studentId: st.id, note: "", source: "link", group: "drops-write",
          extra: JSON.stringify({ series: "daily-drops", kind: "writing", subject: "write", sheet: k + 1, words: 90 + k * 40 + (h(st.id + d) % 30), rubricRows: 6, rubricTotal: tot, rubricMax: 24 })
        });
      });
    });
    /* Word Foundry test rehearsals — grades 6 and up */
    people.filter(function (st) { return st.g >= 6; }).slice(0, 8).forEach(function (st, si) {
      var u = WF_UNITS[si % WF_UNITS.length];
      [9, 5, 2].forEach(function (back, k) {
        var d = days[Math.min(back, days.length - 1)];
        var vocab = (k + si) % 2 === 0, n = 12, right = clamp(Math.round(5 + st.comp / 20 + k * 1.5 + (h(st.id + d + "wf") % 2)), 4, 12);
        rows.push({
          timestamp: stamp(d, 14, 5 + si), date: d, checkinType: "practice",
          activityId: "wf-u" + u[0], activityName: "Word Foundry — " + u[1] + " · Test rehearsal",
          skill: vocab ? "Vocabulary test rehearsal — meaning to word; spelling counts" : "Stem test rehearsal — write what the stem means; spelling counts",
          setNo: u[0], itemsTotal: n, independent: right, supported: "", pctIndependent: pctOf(right, n), hintsUsed: "", confidence: "",
          studentId: st.id, note: "", source: "link", group: "wordfoundry",
          extra: { series: "word-foundry", build: "demo", unit: u[0], unitName: u[1], kind: vocab ? "vocab" : "stems", correct: right, total: n, firstCheck: right, checked: true }
        });
      });
    });
    /* two practice modules that score in their own tiers */
    people.filter(function (st) { return st.g >= 6; }).slice(2, 8).forEach(function (st, si) {
      var d = days[3 + (si % 5)], sci = si % 2 === 0;
      var n = 8, ind = clamp(Math.round(3 + st.comp / 25 + (h(st.id + "mod") % 2)), 2, 8);
      rows.push({
        timestamp: stamp(d, 11, 40 + si), date: d, checkinType: "practice",
        activityId: sci ? "b8" : "m12", activityName: sci ? "Natural Selection · Name the Move" : "Name the Move · Math Interior",
        skill: sci ? "Explain how a trait becomes common in a population" : "Name the operation a word problem is asking for",
        setNo: 1 + (si % 3), itemsTotal: n, independent: ind, supported: n - ind, pctIndependent: pctOf(ind, n),
        hintsUsed: 3 - (si % 3), confidence: 2 + (h(st.id + "cf") % 4),
        studentId: st.id, note: "", source: "link", group: sci ? "science" : "math-interior",
        extra: JSON.stringify({ series: sci ? "b8" : "m12", lang: "en", build: "demo", tally: { n: n, ind: ind, sup: n - ind, hints: 3 - (si % 3) } })
      });
    });
    return rows;
  }

  /* ============================================ 5 · FAMILY EVENING CHECK-INS
     Three moments, one tap each, as a family answers them from a phone. */
  var HC_MORN = [["easy", "Up and out without much friction"], ["slow", "A slow start, but they got there"], ["prompted", "Somebody had to keep them moving"], ["hard", "It was a rough start"]];
  var HC_AFT = [["talking", "Came in talking"], ["quiet", "Quiet, but alright"], ["wiped", "Wiped out"], ["wound", "Wound up"]];
  var HC_EVE = [["settled", "Settled"], ["unread", "Quiet - hard to read"], ["carrying", "Still carrying something from today"], ["hard", "It got hard tonight"]];
  var HC_HELP = [["alone", "Some time alone"], ["food", "Food"], ["talk", "Talking to someone"], ["music", "Music or a screen"], ["move", "Getting outside or moving"]];
  var HC_NOTE = ["Homework went better once we ate first.", "Talked about the friend thing on the drive home.", "", "", "Big feelings at bedtime, settled with a story.", ""];
  function buildHomeCheckins(fams, days) {
    var obs = {}, n = 0;
    fams.forEach(function (st, si) {
      var key = code(st.id); obs[key] = [];
      days.slice(0, 12).forEach(function (d, di) {
        if (h(st.id + d + "hc") >= 70) return;
        var rough = st.comp < 55 ? 1 : 0;
        var m = HC_MORN[clamp((h(st.id + d + "m") % 3) + rough, 0, 3)];
        var a = HC_AFT[h(st.id + d + "a") % 4];
        var e = HC_EVE[clamp((h(st.id + d + "e") % 3) + (rough && h(st.id + d) < 40 ? 1 : 0), 0, 3)];
        var helps = HC_HELP.filter(function (x, i) { return h(st.id + d + x[0]) < 35; });
        var student = h(st.id + d + "who") < 25;
        obs[key].push({
          timestamp: stamp(d, 19, 30 + (h(st.id + d) % 25)), date: d, submitTime: clock(19, 30 + (h(st.id + d) % 25)),
          slipType: "homecheckin", studentId: key, respondentId: student ? key : pick(["Mom", "Dad", "Grandma", "Tía"], st.id + "fam"),
          respondentRole: student ? "student" : "family",
          districtId: "", schoolId: "", classId: "Demo", grade: st.grade, term: "",
          morning: m[1], morningKey: m[0], afternoon: a[1], afternoonKey: a[0], evening: e[1], eveningKey: e[0],
          helped: helps.map(function (x) { return x[1]; }).join(" | "), helpedKeys: helps.map(function (x) { return x[0]; }).join(" | "),
          note: pick(HC_NOTE, st.id + d + "hn"), followUp: e[0] === "hard" && h(st.id + d + "fu") < 50, source: "sheet"
        });
        n++;
      });
    });
    return { obs: obs, pulled: { at: new Date().toISOString(), n: n }, mint: {} };
  }

  /* ============================================ 6 · HOME OBSERVATIONS ON A GOAL
     The family's side of one IEP goal (Marcus's coping-strategy goal): the
     shared skill in plain words, four weeks of evenings, hard → own. */
  var HO_LEVELS = { regulation: [["own", "Handled it themselves"], ["reminder", "Used something after a nudge"], ["help", "Needed an adult"], ["hard", "It was a hard one"], ["na", "It didn't come up today"]] };
  function buildHomeObs(days, iep) {
    var goalId = "demoIepB", g = (iep.goals || {})[goalId];
    if (!g) return { cfg: {}, obs: {}, pulled: {} };
    var key = "demohome7k2m", sid = code(g.student);
    var cfg = {}; cfg[goalId] = { on: true, fit: "optional", skill: "Using a calm-down move when something gets frustrating",
      ask: "How did the hard moment go today?", scale: "regulation", key: key, code: sid, since: days[days.length - 1],
      districtId: "", schoolId: "", classId: "Demo", grade: g.grade || "7", term: "" };
    var obs = {}; obs[key] = [];
    var L = HO_LEVELS.regulation;
    days.forEach(function (d, di) {
      if (h(sid + d + "ho") >= 62) return;
      var prog = (days.length - 1 - di) / (days.length - 1);
      var idx = h(sid + d + "lv") < 15 ? 4 : clamp(Math.round(3 - prog * 2.6 + ((h(sid + d + "lj") % 3) - 1) * 0.6), 0, 3);
      var lv = L[idx];
      obs[key].push({
        timestamp: stamp(d, 20, 10 + (h(sid + d) % 30)), date: d, year: "", homeKey: key, skill: cfg[goalId].skill,
        level: lv[1], levelKey: lv[0], studentId: sid,
        timeOfDay: pick(["evening", "after school", "bedtime"], sid + d + "tod"), activity: pick(["homework", "chores", "screens ending", "siblings"], sid + d + "act"),
        support: idx >= 2 ? pick(["a reminder to breathe", "sat with him", "a break first"], sid + d + "sup") : "",
        note: idx === 0 && h(sid + d + "hn") < 40 ? "Did the breathing thing before I even said anything." : "",
        followUp: false, respondentRole: "family", extra: "", opps: null, indep: null
      });
    });
    return { cfg: cfg, obs: obs, pulled: { at: new Date().toISOString(), n: obs[key].length } };
  }

  /* =================================================== 7 · TEAM EVIDENCE
     What a case manager asked the team for, and what came back — one row per
     adult per goal, in the vocabulary the contribute door sends. */
  function buildTeam(iep, days) {
    var subs = {}, goals = iep.goals || {};
    var who = [["Ms. Okafor", "special_educator"], ["Mr. Reyes", "social_worker"], ["Ms. Lindqvist", "slp"], ["Coach Dane", "other_staff"], ["Ms. Patel", "teacher"]];
    var EV = {
      reading: ["Found the main idea in 3 of 4 passages this week with the graphic organizer; details still need a prompt.",
                "Reads aloud with more phrasing since the repeated-reading routine; stumbles on multisyllable words."],
      social: ["Used the Pause twice in period 4 without a prompt; once after one reminder.",
               "Walked away from a conflict at lunch and came to find me — that is new."],
      writing: ["Topic sentence is there every time now; the third supporting sentence is the one that goes missing."]
    };
    var STR = ["Wants to do well and says so.", "Funny, kind to younger students.", "Asks for a break before it gets big — most days.", "Strong oral vocabulary."];
    var CON = ["Fades after lunch.", "Avoids starting when the page looks long.", "Shuts down if corrected in front of peers.", ""];
    var REC = ["Keep the organizer; fade the prompt for details.", "Pre-teach the vocabulary the day before.", "Front-load the strategy card at the start of period 4.", "Check in before the class transition, not after."];
    Object.keys(goals).forEach(function (gid, gi) {
      var g = goals[gid]; if (!g || g.archived) return;
      var sid = g.student; if (!subs[sid]) subs[sid] = [];
      who.forEach(function (w, wi) {
        if (h(gid + w[0]) >= 60) return;
        var d = days[Math.min(1 + ((gi * 3 + wi * 2) % 9), days.length - 1)];
        var counted = h(gid + w[0] + "c") < 60, opps = counted ? 4 + (h(gid + w[0] + "o") % 5) : null;
        var succ = counted ? clamp(Math.round(opps * (0.45 + (h(gid + w[0] + "s") % 40) / 100)), 0, opps) : null;
        var ts = stamp(d, 15, 40 + wi * 3);
        subs[sid].push({
          id: "r|" + ts + "|" + w[0], askId: "ask-" + gid, ts: ts, date: d, role: w[1], who: w[0],
          goalId: gid, area: g.area || "", focus: String(g.title || "").slice(0, 60),
          evidence: pick(EV[g.area] || EV.reading, gid + w[0] + "ev"), perf: counted ? succ + " of " + opps + " opportunities this week" : "Not counted — observed in passing",
          opps: opps, succ: succ, strengths: pick(STR, gid + w[0] + "st"), concerns: pick(CON, gid + w[0] + "cn"),
          supports: [pick(["verbal", "visual", "model", "checkin"], gid + w[0] + "s1"), pick(["chunk", "extra", "break", "peer"], gid + w[0] + "s2")],
          response: pick(["well", "some", "depends", "well"], gid + w[0] + "rs"), recommend: pick(REC, gid + w[0] + "rc"),
          note: "", followUp: h(gid + w[0] + "f") < 20, status: "new", routed: {}, source: "sheet"
        });
      });
    });
    return { v: 1, asks: {}, subs: subs, seen: {} };
  }

  /* ===================================================== 8 · THIS IS ME
     Two students' own pages — the lines they kept, filed the way a pull files them. */
  function buildThisIsMe(people, days) {
    var st = { students: {} };
    var pages = [
      { soma: "My stomach goes tight before I know I’m worried.", lines: [
        ["str", "I’m good at noticing when a friend is left out."], ["str", "I can draw anything if you give me time."],
        ["help", "A quiet minute before I have to talk."], ["hard", "Being called on before my hand is up."], ["hard", "Group work when nobody listens."]] },
      { soma: "My hands want to move when I’m stuck.", lines: [
        ["str", "I finish what I start, even when it’s boring."], ["help", "Say the steps once, then let me try."],
        ["hard", "Reading out loud in front of people."], ["str", "Little kids like me and I like them."]] }
    ];
    people.filter(function (p) { return p.comp < 70 && p.g >= 3; }).slice(0, 2).forEach(function (p, i) {
      var pg = pages[i], ts = stamp(days[2 + i * 3], 12, 15);
      st.students[p.id] = { soma: pg.soma, somaAt: ts, no: {}, sentTs: ts, sentFrom: "link", fam: "",
        entries: pg.lines.map(function (l, j) { return { id: "sent_" + ts + "_" + j, ts: ts, day: days[2 + i * 3], sy: "", sec: l[0], pillar: "", text: l[1], st: "kept", src: { kind: "sent" } }; }) };
    });
    return st;
  }

  /* ==================================================== 9 · MTSS LINES
     The progress-monitoring lines for the students the report puts in Tier 2
     and 3 — filled the way a counselor fills them, not left as write-ins. */
  function buildPm(people, days) {
    var pm = {}, ints = [
      ["Check-in / Check-out with Mr. Reyes, daily", "Mr. Reyes (counselor)", "Arrive Steady or better 4 of 5 mornings"],
      ["Small-group Pause practice, Tue/Thu", "Ms. Okafor", "Use a named strategy with ≤1 prompt, 3 of 4 days"],
      ["Repair Circle after conflicts + peer buddy at lunch", "Ms. Patel + Coach Dane", "Two weeks with no lunch referral"]
    ];
    people.filter(function (p) { return p.comp < 60; }).sort(function (a, b) { return a.comp - b.comp; }).slice(0, 5).forEach(function (p, i) {
      var it = ints[i % ints.length];
      pm[p.id] = { int: it[0], own: it[1], goal: it[2], start: days[Math.min(9, days.length - 1)], review: days[0] };
    });
    return pm;
  }

  /* ================================================================ SEED */
  function seedPlus() {
    if (lsGet(PLUS) != null) return;                        /* seeded already */
    var people = roster(); if (!people.length) return;
    var days = schoolDays(15);
    var stash = {};
    OWN.forEach(function (k) { stash[k] = lsGet(k); });
    /* the check-ins door stashes these once; do the same if it has not yet */
    if (lsGet(CKS) == null) lsSet(CKS, lsGet(CK) || "");
    if (lsGet(XKS) == null) lsSet(XKS, lsGet(XK) || "");
    lsSet(PLUS, JSON.stringify(stash));

    var iep = jload("aog.iep.v1", {}) || {};
    var focus = people.slice().sort(function (a, b) { return a.comp - b.comp; }).slice(0, 6);
    var fams = people.filter(function (p) { return /^(Maya R\.|Isaiah B\.|Sofia G\.|Marcus T\.)$/.test(p.id); });
    if (fams.length < 3) fams = people.slice(0, 4);

    /* every store on its own: one builder failing must not cost the others */
    function step(fn) { try { fn(); } catch (e) { try { console.warn("aog-demo-plus", e); } catch (e2) {} } }
    step(function () { jsave(CK, buildCheckins(people, days)); });
    step(function () { jsave(XK, buildExits(people, days.slice(0, 10))); });
    step(function () { var support = buildSupport(focus, days); fileSupportIntoDaily(support); jsave(RK, support); });
    step(function () { jsave(PK, buildPractice(people, days)); });
    step(function () { jsave(HCK, buildHomeCheckins(fams, days)); });
    step(function () { jsave(HOK, buildHomeObs(schoolDays(28), iep)); });
    step(function () { jsave(TK, buildTeam(iep, days)); });
    step(function () { jsave(TIM, buildThisIsMe(people, days)); });
    step(function () { jsave(PMK, buildPm(people, days)); });
    step(function () { if (!(jload(MMK, {}) || {}).school) jsave(MMK, { school: "Grace Demo K–12", by: "MTSS team (demo)", date: days[9] + " – " + days[0] }); });
    lsSet("aog.sync.lastpull.plus", new Date().toISOString());
  }

  function restorePlus() {
    var raw = lsGet(PLUS); if (raw == null) return;
    var stash = {}; try { stash = JSON.parse(raw) || {}; } catch (e) {}
    OWN.forEach(function (k) { if (stash[k] == null) lsDel(k); else lsSet(k, stash[k]); });
    /* the demo daily log is restored by the toggle itself; if the real one is
       already back, sweep our signed rows out of it just in case */
    try {
      var d = jload(DK, null);
      if (d && d.logs) {
        Object.keys(d.logs).forEach(function (sid) {
          Object.keys(d.logs[sid] || {}).forEach(function (date) {
            var e = d.logs[sid][date]; if (!e || !e.periods) return;
            e.periods = e.periods.filter(function (p) { return !p._demoPlus; });
          });
        });
        jsave(DK, d);
      }
    } catch (e2) {}
    lsDel(PLUS); lsDel("aog.sync.lastpull.plus");
  }

  function repaint() {
    try { if (typeof window.refreshAdmin === "function") window.refreshAdmin(); } catch (e) {}
    try { if (typeof window.aogRenderPractice === "function") window.aogRenderPractice(); } catch (e) {}
    try { if (typeof window.aogRenderIep === "function") window.aogRenderIep(); } catch (e) {}
  }

  /* wrap the toggle — after every other wrapper, whichever order they booted */
  function wrapDemo() {
    var f = window.toggleDemoData;
    if (typeof f !== "function" || f.__aogPlus) return;
    var w = function () {
      var was = demoOn();
      var r = f.apply(this, arguments);
      var now = demoOn();
      /* run after the synchronous seeders above us have finished */
      setTimeout(function () {
        try { if (!was && now) seedPlus(); else if (was && !now) restorePlus(); repaint(); } catch (e) {}
      }, 60);
      return r;
    };
    for (var k in f) { try { w[k] = f[k]; } catch (e) {} }
    w.__aogPlus = true;
    window.toggleDemoData = w;
  }

  /* ======================================================= THE MTSS SECTION
     "Beyond the self-reflection": for the student on screen, what every
     other pull knows. Counts and plain sentences; no new score. */
  function daysBack(n) { var d = new Date(); d.setDate(d.getDate() - n); return iso(d); }
  function avg(a) { var s = 0, n = 0; a.forEach(function (v) { v = +v; if (!isNaN(v) && v > 0) { s += v; n++; } }); return n ? s / n : null; }
  function word(scale, v) { return v == null ? "—" : scale[clamp(Math.round(v) - 1, 0, 4)]; }
  var ARR = ["Rough", "Heavy", "Okay", "Steady", "Good"], CON = ["On my own", "Distant", "Okay", "Connected", "I belong"], RDY = ["Can’t get started", "Going to be hard", "Can do some", "Ready", "Let’s go"];
  var ARR_ES = ["Difícil", "Pesado", "Más o menos", "Estable", "Bien"], CON_ES = ["Por mi cuenta", "Distante", "Más o menos", "Conectado/a", "Pertenezco"], RDY_ES = ["No puede empezar", "Va a ser difícil", "Puede hacer algo", "Listo/a", "¡Vamos!"];
  function sameId(a, b) { return String(a || "").replace(/\s+/g, " ").trim().toLowerCase() === String(b || "").replace(/\s+/g, " ").trim().toLowerCase(); }
  function findLog(store, sid) { var logs = (store || {}).logs || {}; for (var k in logs) if (sameId(k, sid)) return logs[k]; return {}; }
  function top(list, n) { var m = {}; list.forEach(function (v) { if (v) m[v] = (m[v] || 0) + 1; }); return Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).slice(0, n).map(function (k) { return k + " ×" + m[k]; }); }

  function evidenceFor(sid) {
    var since = daysBack(30), out = [];
    var es = T("en", "es") === "es";
    /* check-ins */
    var ci = [], days = findLog(jload(CK, {}), sid);
    var ciPts = [];
    Object.keys(days).forEach(function (d) { if (d >= since) (days[d] || []).forEach(function (r) { ci.push(r); ciPts.push([d, [word(es ? ARR_ES : ARR, r.arrival), word(es ? CON_ES : CON, r.connection), r.challenge && r.challenge !== "Nothing today" ? r.challenge : "", r.tellAdult ? T("asked for an adult", "pidió un adulto") : ""].filter(Boolean).join(" · ")]); }); });
    if (ci.length) {
      var tells = ci.filter(function (r) { return r.tellAdult; }).length;
      out.push({ pts: ciPts, h: T("Daily check-ins", "Registros diarios"), n: ci.length, unit: T("in the last 30 days", "en los últimos 30 días"),
        lines: [T("Arriving", "Al llegar") + ": " + word(es ? ARR_ES : ARR, avg(ci.map(function (r) { return r.arrival; }))) + " · " + T("Connection", "Conexión") + ": " + word(es ? CON_ES : CON, avg(ci.map(function (r) { return r.connection; }))) + " · " + T("Ready to learn", "Listo/a para aprender") + ": " + word(es ? RDY_ES : RDY, avg(ci.map(function (r) { return r.readiness; }))),
          T("Named barriers", "Barreras nombradas") + ": " + (top(ci.map(function (r) { return r.challenge !== "Nothing today" ? r.challenge : ""; }), 3).join(", ") || T("none", "ninguna")),
          tells ? T("Asked to talk to an adult", "Pidió hablar con un adulto") + ": " + tells + " " + T("time(s)", "vez/veces") : ""] });
    }
    /* exit slips */
    var xs = [], xd = findLog(jload(XK, {}), sid);
    var xsPts = [];
    Object.keys(xd).forEach(function (d) { if (d >= since) (xd[d] || []).forEach(function (r) { xs.push(r); xsPts.push([d, [r.dayWord, r.hardClass ? T("hard: ", "difícil: ") + r.hardClass + (r.hardWhy ? " — " + r.hardWhy : "") : "", r.favClass ? T("favorite: ", "favorita: ") + r.favClass : ""].filter(Boolean).join(" · ")]); }); });
    if (xs.length) {
      out.push({ pts: xsPts, h: T("Exit slips", "Boletas de salida"), n: xs.length, unit: T("in the last 30 days", "en los últimos 30 días"),
        lines: [T("The day, in their word", "El día, en su palabra") + ": " + (top(xs.map(function (r) { return r.dayWord; }), 3).join(", ") || "—"),
          T("Class named hard", "Clase nombrada como difícil") + ": " + (top(xs.map(function (r) { return r.hardClass; }), 2).join(", ") || T("none", "ninguna")) + (xs.some(function (r) { return r.hardWhy; }) ? " — " + top(xs.map(function (r) { return r.hardWhy; }), 1).join("").replace(/ ×\d+$/, "") : ""),
          T("Favorite", "Favorita") + ": " + (top(xs.map(function (r) { return r.favClass; }), 1).join("").replace(/ ×\d+$/, "") || "—")] });
    }
    /* adults' observations (daily log, incl. support check-ins from other adults) */
    var ps = [], dd = findLog(jload(DK, {}), sid), adults = {};
    var psPts = [];
    Object.keys(dd).forEach(function (d) { if (d >= since) ((dd[d] || {}).periods || []).forEach(function (p) { ps.push(p); psPts.push([d, [p.period || "", p.respondentId || "", p.regulated ? T("regulated", "regulado") : "", p.usedStrategy ? T("used a strategy", "usó estrategia") : "", p.connected ? T("connected", "conectado") : ""].filter(Boolean).join(" · ")]); if (p.respondentId) adults[p.respondentId] = p.respondentRole || ""; }); });
    if (ps.length) {
      function share(k) { var n = 0; ps.forEach(function (p) { if (p[k]) n++; }); return Math.round(n / ps.length * 100) + "%"; }
      var names = Object.keys(adults);
      out.push({ pts: psPts, h: T("What adults observed", "Lo que observaron los adultos"), n: ps.length, unit: T("period entries", "registros por periodo") + (names.length ? " · " + names.length + " " + T("adults", "adultos") : ""),
        lines: [T("Regulated", "Regulado/a") + " " + share("regulated") + " · " + T("Used a strategy", "Usó una estrategia") + " " + share("usedStrategy") + " · " + T("Connected", "Conectado/a") + " " + share("connected"),
          names.length ? names.map(function (n) { var rl = ""; try { rl = window.aogRoleLabel ? window.aogRoleLabel(adults[n]) : ""; } catch (e) {} return n + (rl ? " (" + rl + ")" : ""); }).join(" · ") : ""] });
    }
    /* practice */
    var pr = [];
    try { (jload(PK, []) || []).forEach(function (r) { if (sameId(r.studentId, sid) && String(r.date || "").slice(0, 10) >= since) pr.push(r); }); } catch (e) {}
    if (pr.length) {
      var byAct = {};
      pr.forEach(function (r) { var k = String(r.activityId || r.activityName || "?").replace(/-s\d+$/i, ""); if (!byAct[k]) byAct[k] = []; byAct[k].push(r); });
      var lines = Object.keys(byAct).slice(0, 4).map(function (k) {
        var a = byAct[k].sort(function (x, y) { return String(x.timestamp) < String(y.timestamp) ? -1 : 1; });
        var f = a[0], l = a[a.length - 1], fi = +f.independent, li = +l.independent, tot = +l.itemsTotal;
        var trend = a.length > 1 && !isNaN(fi) && !isNaN(li) ? (li > fi ? " ↑" : li < fi ? " ↓" : " →") : "";
        return String(l.activityName || k).replace(/ · .*$/, "") + ": " + (isNaN(li) ? "—" : li + (tot ? "/" + tot : "")) + " " + T("independent", "independiente") + trend + " (" + a.length + " " + T(a.length === 1 ? "send" : "sends", a.length === 1 ? "envío" : "envíos") + ")";
      });
      out.push({ pts: pr.map(function (r) { return [String(r.date || r.timestamp || "").slice(0, 10), String(r.activityName || r.activityId || "") + ": " + (r.independent != null ? r.independent + (r.itemsTotal ? "/" + r.itemsTotal : "") + " " + T("independent", "independiente") : "")]; }), h: T("Practice", "Práctica"), n: pr.length, unit: T("summary rows from the sheet", "filas de resumen de la hoja"), lines: lines });
    }
    /* IEP goals */
    try {
      var iep = jload("aog.iep.v1", {}) || {}, gl = [];
      Object.keys(iep.goals || {}).forEach(function (id) {
        var g = iep.goals[id]; if (!g || g.archived || !sameId(g.student, sid)) return;
        var pts = (iep.data || {})[id] || [], last = pts[pts.length - 1];
        var b = g.baseline || {}, tg = g.target || {}, aim = null;
        if (last && b.date && tg.date) { var span = Date.parse(tg.date) - Date.parse(b.date); if (span > 0) aim = +b.value + (+tg.value - +b.value) * ((Date.parse(last.date) - Date.parse(b.date)) / span); }
        var status = !last ? T("no data yet", "sin datos aún") : aim == null ? "" : (g.lowerBetter ? +last.value <= aim : +last.value >= aim) ? T("on track", "en camino") : T("needs attention", "requiere atención");
        gl.push(String(g.title || id).slice(0, 70) + (last ? " — " + last.value + (g.measure === "percent" ? "%" : "") : "") + (status ? " · " + status : ""));
      });
      if (gl.length) out.push({ h: T("IEP goals", "Metas del IEP"), n: gl.length, unit: T("active", "activas"), lines: gl });
    } catch (e) {}
    /* team evidence */
    try {
      var tk = jload(TK, {}) || {}, subs = [];
      Object.keys(tk.subs || {}).forEach(function (k) { if (sameId(k, sid)) subs = subs.concat(tk.subs[k] || []); });
      if (subs.length) {
        var latest = subs.slice().sort(function (a, b) { return String(a.ts) < String(b.ts) ? 1 : -1; })[0];
        out.push({ h: T("Team evidence", "Evidencia del equipo"), n: subs.length, unit: T("contributions", "aportes"),
          lines: [subs.map(function (s) { return s.who; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; }).join(" · "), latest && latest.evidence ? "“" + latest.evidence + "”" : ""] });
      }
    } catch (e) {}
    /* home */
    try {
      var hc = (jload(HCK, {}) || {}).obs || {}, hrows = [];
      Object.keys(hc).forEach(function (k) { if (sameId(k, sid)) hrows = hrows.concat(hc[k] || []); });
      hrows = hrows.filter(function (r) { return String(r.date || "") >= since; });
      var ho = jload(HOK, {}) || {}, horows = [];
      Object.keys(ho.obs || {}).forEach(function (k) { (ho.obs[k] || []).forEach(function (r) { if (sameId(r.studentId, sid) && String(r.date || "") >= since) horows.push(r); }); });
      if (hrows.length || horows.length) {
        var hl = [];
        if (hrows.length) hl.push(hrows.length + " " + T("family evening check-ins", "registros familiares por la noche") + " — " + T("evenings", "noches") + ": " + (top(hrows.map(function (r) { return r.evening; }), 2).join(", ") || "—"));
        if (horows.length) { var own = horows.filter(function (r) { return r.levelKey === "own" || r.levelKey === "reminder"; }).length, cnt = horows.filter(function (r) { return r.levelKey !== "na"; }).length; hl.push(horows.length + " " + T("home observations on the shared skill", "observaciones en casa sobre la habilidad compartida") + (cnt ? " — " + T("handled it, or after a nudge", "lo manejó, o tras un recordatorio") + ": " + own + " " + T("of", "de") + " " + cnt : "")); }
        out.push({ h: T("From home", "Desde casa"), n: hrows.length + horows.length, unit: T("in the last 30 days", "en los últimos 30 días"), lines: hl });
      }
    } catch (e) {}
    return out;
  }

  function sectionHtml(sid) {
    var ev = evidenceFor(sid);
    var h = '<div class="mtss-sec-h">' + esc(T("Beyond the self-reflection", "Más allá de la autorreflexión")) + '</div>';
    if (!ev.length) {
      return h + '<p class="mtss-p mtss-plus-empty">' + esc(T("Nothing else on this device for this student yet. Check-ins, exit slips, practice rows, team and home evidence show here once they are logged or pulled from the sheet.", "Todavía no hay nada más en este dispositivo para este estudiante. Los registros, boletas, filas de práctica y la evidencia del equipo y de casa aparecen aquí cuando se registran o se traen de la hoja.")) + '</p>';
    }
    h += '<p class="mtss-p mtss-plus-lead">' + esc(T("What the other pulls know about this student — counts and plain words, no new score.", "Lo que saben las otras fuentes sobre este estudiante — conteos y palabras sencillas, sin un puntaje nuevo.")) + '</p>';
    h += '<div class="mtss-plus">' + ev.map(function (e) {
      /* AOG-BOX-TO-DATA-V1 (2026-09-26) — Jimmy: "the boxes should be linked to the
         data points so the teacher can scan them quickly." Tap a box and every data
         point behind its number drops open, newest first. */
      var pts = (e.pts || []).slice().sort(function (a, b) { return a[0] < b[0] ? 1 : -1; });
      var drop = pts.length ? '<details class="mtss-plus-pts"><summary>' + esc(T("See the " + pts.length + " data points", "Ver los " + pts.length + " datos")) + '</summary><table>' +
        pts.map(function (q) { return '<tr><td>' + esc(q[0]) + '</td><td>' + esc(q[1] || "—") + '</td></tr>'; }).join("") + '</table></details>' : "";
      return '<div class="mtss-plus-card"><div class="mtss-plus-top"><span class="mtss-plus-n">' + e.n + '</span><div><div class="mtss-plus-h">' + esc(e.h) + '</div><div class="mtss-plus-u">' + esc(e.unit) + '</div></div></div>'
        + '<ul class="mtss-plus-l">' + e.lines.filter(Boolean).map(function (l) { return '<li>' + esc(l) + '</li>'; }).join("") + '</ul>' + drop + '</div>';
    }).join("") + '</div>';
    return h;
  }

  function classStrip() {
    var since = daysBack(30), n = { ci: 0, xs: 0, obs: 0, pr: 0, team: 0, home: 0 };
    try { var c = (jload(CK, {}) || {}).logs || {}; Object.keys(c).forEach(function (s) { Object.keys(c[s]).forEach(function (d) { if (d >= since) n.ci += (c[s][d] || []).length; }); }); } catch (e) {}
    try { var x = (jload(XK, {}) || {}).logs || {}; Object.keys(x).forEach(function (s) { Object.keys(x[s]).forEach(function (d) { if (d >= since) n.xs += (x[s][d] || []).length; }); }); } catch (e) {}
    try { var dl = (jload(DK, {}) || {}).logs || {}; Object.keys(dl).forEach(function (s) { Object.keys(dl[s]).forEach(function (d) { if (d >= since) n.obs += ((dl[s][d] || {}).periods || []).length; }); }); } catch (e) {}
    try { n.pr = (jload(PK, []) || []).filter(function (r) { return String(r.date || "").slice(0, 10) >= since; }).length; } catch (e) {}
    try { var t = (jload(TK, {}) || {}).subs || {}; Object.keys(t).forEach(function (s) { n.team += (t[s] || []).length; }); } catch (e) {}
    try { var hc = (jload(HCK, {}) || {}).obs || {}; Object.keys(hc).forEach(function (s) { n.home += (hc[s] || []).filter(function (r) { return String(r.date || "") >= since; }).length; }); } catch (e) {}
    var total = n.ci + n.xs + n.obs + n.pr + n.team + n.home;
    if (!total) return "";
    var tiles = [[n.ci, T("check-ins", "registros")], [n.xs, T("exit slips", "boletas")], [n.obs, T("adult observations", "observaciones")], [n.pr, T("practice rows", "filas de práctica")], [n.team, T("team evidence", "evidencia del equipo")], [n.home, T("family check-ins", "registros familiares")]];
    return '<div class="mtss-sec-h">' + esc(T("Evidence beyond the screener · last 30 days", "Evidencia más allá del cuestionario · últimos 30 días")) + '</div><div class="mtss-plus mtss-plus-strip">'
      + tiles.map(function (t) { return '<div class="mtss-plus-card mtss-plus-tile"><span class="mtss-plus-n">' + t[0] + '</span><div class="mtss-plus-h">' + esc(t[1]) + '</div></div>'; }).join("") + '</div>';
  }

  var CSS = '#mtssOverlay .mtss-plus{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;margin:6px 0 14px}'
    + '#mtssOverlay .mtss-plus-card{border:1px solid var(--rule,#D9CBA8);border-radius:12px;padding:12px 14px;background:var(--card,#fff)}'
    + '#mtssOverlay .mtss-plus-top{display:flex;gap:12px;align-items:center;margin-bottom:8px}'
    + '#mtssOverlay .mtss-plus-n{font-family:Fraunces,"Cormorant Garamond",serif;font-size:30px;line-height:1;font-weight:700;color:var(--gold,#B8893A);min-width:38px}'
    + '#mtssOverlay .mtss-plus-h{font-weight:800;font-size:13.5px;color:var(--ink,#1B3A5F)}'
    + '#mtssOverlay .mtss-plus-u{font-size:11.5px;color:var(--ink-soft,#5B6478)}'
    + '#mtssOverlay .mtss-plus-l{margin:0;padding-left:18px;font-size:12.5px;line-height:1.5;color:var(--ink,#1B3A5F)}'
    + '#mtssOverlay .mtss-plus-l li{margin:2px 0}'
    + '#mtssOverlay .mtss-plus-strip{grid-template-columns:repeat(auto-fit,minmax(130px,1fr))}'
    + '#mtssOverlay .mtss-plus-tile{display:flex;gap:10px;align-items:center}'
    + '#mtssOverlay .mtss-plus-lead{margin-top:0}'
    + '#mtssOverlay .mtss-plus-pts{margin-top:8px;border-top:1px dashed var(--rule,#D9CBA8);padding-top:6px}'
    + '#mtssOverlay .mtss-plus-pts summary{cursor:pointer;font-weight:800;font-size:12.5px;color:#7d5a15;min-height:32px;display:flex;align-items:center}'
    + '#mtssOverlay .mtss-plus-pts table{width:100%;border-collapse:collapse;font-size:12px;margin-top:4px}'
    + '#mtssOverlay .mtss-plus-pts td{border-top:1px solid var(--rule,#E4DAC5);padding:4px 6px;vertical-align:top;color:var(--ink,#1B3A5F)}'
    + '#mtssOverlay .mtss-plus-pts td:first-child{white-space:nowrap;font-variant-numeric:tabular-nums;color:var(--ink-soft,#5B6478)}'
    + '#mtssOverlay .mtss-plus-card{cursor:default}'
    + '@media print{.mtss-plus{display:grid!important;grid-template-columns:repeat(2,1fr)!important}.mtss-plus-card{break-inside:avoid;border-color:#bbb!important}}';

  function injectCss() { if (document.getElementById("aog-demo-plus-css")) return; var s = document.createElement("style"); s.id = "aog-demo-plus-css"; s.textContent = CSS; document.head.appendChild(s); }

  var decorating = false;
  function decorateMtss() {
    if (decorating) return;
    var body = document.getElementById("mtssBody"); if (!body || body.querySelector(".mtss-plus-host")) return;
    decorating = true;
    try { decorateInner(body); } finally { decorating = false; }
  }
  function decorateInner(body) {
    injectCss();
    var area = document.getElementById("mtssPrintArea");
    var tabActive = document.querySelector("#mtssOverlay .mtss-tab.active");
    var v = tabActive ? tabActive.getAttribute("data-v") : "individual";
    if (area && v === "individual") {
      var sel = document.getElementById("mtssStudentSel"), sid = sel ? sel.value : "";
      if (!sid) { var nm = area.querySelector(".mtss-rep-name"); sid = nm ? nm.textContent.trim() : ""; }
      if (!sid) return;
      var host = document.createElement("div"); host.className = "mtss-plus-host"; host.innerHTML = sectionHtml(sid);
      var foot = area.querySelector(".mtss-foot");
      if (foot) area.insertBefore(host, foot); else area.appendChild(host);
      return;
    }
    /* class & school views: one strip of counts inside the printed report */
    if (area && (v === "class" || v === "school")) {
      var strip = classStrip(); if (!strip) return;
      var d = document.createElement("div"); d.className = "mtss-plus-host"; d.innerHTML = strip;
      var ft = area.querySelector(".mtss-foot");
      if (ft) area.insertBefore(d, ft); else area.appendChild(d);
    }
  }

  function watchMtss() {
    var ov = document.getElementById("mtssOverlay");
    if (!ov || ov.__aogPlus) return;
    ov.__aogPlus = true;
    var queued = false;
    var mo = new MutationObserver(function () {
      if (queued) return; queued = true;
      /* one pass per frame — the dashboard's tint walker fires many mutations at once */
      (window.requestAnimationFrame || setTimeout)(function () { queued = false; try { decorateMtss(); } catch (e) {} });
    });
    mo.observe(ov, { childList: true, subtree: true });
    try { decorateMtss(); } catch (e) {}
  }
  function wrapOpen() {
    var f = window.aogOpenMTSS;
    if (typeof f !== "function" || f.__aogPlus) return;
    var w = function () { var r = f.apply(this, arguments); setTimeout(watchMtss, 0); return r; };
    w.__aogPlus = true; window.aogOpenMTSS = w;
  }

  /* ---------------------------------------------------------------- boot */
  function boot() {
    wrapDemo(); wrapOpen(); watchMtss();
    /* demo already on from an earlier session — fill the new stores once */
    try { if (demoOn() && lsGet(PLUS) == null) { seedPlus(); repaint(); } } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  setTimeout(boot, 900);
  setTimeout(boot, 2600);
  try { window.aogDemoPlus = { seed: seedPlus, restore: restorePlus, evidenceFor: evidenceFor }; } catch (e) {}
})();
