
/* ============================================================================
   THE REST OF THE DAY  ·  HOME CHECK-IN   THE REST OF THE DAY  ·  HOME CHECK-IN                        2026-08-29
   ----------------------------------------------------------------------------
   SCHOOL SEES PART OF A DAY. THIS IS THE REST OF IT.

   A bridge, not a second assessment. Three taps for three moments the school
   day cannot see — the morning before it, the afternoon after it, and the
   evening the day ended in — plus one small reflection and one optional note.
   Sixty to ninety seconds, on a phone, with no account and no app.

   ⚠ THIS IS NOT THE HOME OBSERVATION. #aog-home-school asks how one IEP SKILL
   went at home and is bound to one goal. This asks what the rest of the day
   was LIKE and is bound to a student code. Any teacher can hand it out for any
   student; a student who has goals gains nothing here that a student without
   them does not. Nothing in this block reads, writes or decorates aog.iep.v1.

   ⚠ WHO ANSWERS IT. At 6-8 the family adult often was not there for most of
   what is being asked about and the student was. So the link asks once, and
   the record says which. A student answering at home and an adult answering
   about the same evening are two readings of one evening, and the value is
   that they can differ. Neither is corrected against the other, ever.

   ⚠ SIX RULES THAT MUST NOT BE "IMPROVED"

   1 - NOTHING HERE IS A SCORE. No percentage, no rating, no average, no
       index, no color ramp, no streak. The options are KEYS, not ranks: do
       not sort them, do not add them up, do not paint them. A day is drawn as
       the words that were tapped and nothing else.

   2 - EVERY MOMENT CAN BE SKIPPED, AND SKIPPING IS AN ANSWER. The fifth
       option on each moment is honest and is never behind a fold - a parent
       who left for work at six did not see the morning, and an evening at
       5 pm has not happened yet. A skip is stored as "na", is EXCLUDED from
       every count, and NEVER ends the check-in early. It moves to the next
       moment like any other tap.

   3 - THE FOLLOW-UP FLAG IS A REQUEST, NEVER A DIAGNOSIS. Exactly two things
       raise it: somebody typed something, or somebody ticked "Please get in
       touch". NOT a hard morning. NOT a hard evening. NOT three of them in a
       row. A system that reads every difficult answer as an alert is how a
       family learns to stop answering honestly.

   4 - NOBODY IS TOLD THEY ARE BEHIND. No "you have not submitted", no missing
       -day warning, no participation count, no streak, no nudge. A quiet week
       reads "Nothing noted this week - that is completely fine." and stops.
       The obligation-word grep in t101 covers the whole family screen and
       does not accept the words inside a negation.

   5 - IT NEVER ASKS ABOUT THE HOUSEHOLD. Not sleep hours, not meals, not
       homework minutes, not screen time, not who was home. Every one of those
       was drafted and cut - see the CUT list in the handoff. What is left is
       what a person can OBSERVE about a young person, which is what a witness
       can honestly give.

   6 - THE THREE MOMENTS ARE NEVER COLLAPSED INTO ONE. No day score, no
       "overall". The whole point is that a day has a shape, and a shape is
       lost the moment it becomes one number.

   ⚠ WHAT THE LINK CARRIES, AND WHAT IT NEVER DOES
   The pseudonymous student code (or nothing, on a class link, in which case
   the person types the code the way they do on the check-in), and the class
   context the Sheet needs. It NEVER carries a name, a goal, an area, a
   disability, the Sheet address or any passcode - the same contract as
   [[aog-student-links]] and [[aog-home-school]].

   Reads: [[aog-home-school]] [[aog-checkin-20]] [[aog-exit-slip]]
          [[aog-slip-links]] [[aog-backup-symmetry]] [[aog-sheet-tab-names]]
   ============================================================================ */
(function () {
  "use strict";

  var KEY   = "aog.home.checkin.v1";   /* NOT matched by PV_KEEP -> backed up
                                          and deleted with everything else. */
  var QKEY  = "aog.homeci.queue";
  var PARAM = "hc";

  function el(id) { return document.getElementById(id); }
  function isEs() { try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; } catch (e) { return false; } }
  function T(en, es) { return isEs() ? es : en; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function code(s) { return String(s == null ? "" : s).trim().toUpperCase(); }
  function todayISO() { var d = new Date(); function p(n){ return (n<10?"0":"")+n; } return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate()); }
  function agoISO(n) { var d = new Date(); d.setDate(d.getDate()-n); function p(x){ return (x<10?"0":"")+x; } return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate()); }
  function clockNow() { try { return new Date().toLocaleTimeString(isEs()?"es":"en",{hour:"numeric",minute:"2-digit"}); } catch(e){ return ""; } }
  function jload(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return (v===null||v===undefined)?d:v; } catch (e) { return d; } }
  function jsave(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function store() { var s = jload(KEY, {}) || {}; if (!s.obs) s.obs = {}; if (!s.pulled) s.pulled = {}; if (!s.mint) s.mint = {}; return s; }
  function put(s) { jsave(KEY, s); }

  /* ═══════════════════════════════════════════════ THE THREE MOMENTS
     One tap each. Five options each. The fifth is the honest skip.

     ⚠ THE ENGLISH LABEL IS THE STORED VALUE and the key is a KEY. Spanish is
     display only - the same contract the check-in, the exit slip and the home
     observation all keep. The order is the order they are drawn in; it is NOT
     a ranking and nothing may derive one from it.

     ⚠ THE TWO WORDINGS ARE NOT A TRANSLATION OF EACH OTHER. The adult is
     asked what they SAW; the student is asked what it WAS. Asking a student
     "how did they seem" is asking them to report on themselves in the third
     person, which is the sentence a 13-year-old stops answering honestly. */
  var MOMENTS = [
    {
      id: "morning",
      lbl: ["Morning", "Mañana"],
      ask: {
        family:  ["How did the start of the day go?", "¿Cómo empezó el día?"],
        student: ["How did your morning go, before school?", "¿Cómo te fue en la mañana, antes de la escuela?"]
      },
      hint: {
        family:  ["Getting up, getting ready, getting out.", "Levantarse, alistarse, salir."],
        student: ["Getting up, getting ready, getting out.", "Levantarte, alistarte, salir."]
      },
      opts: [
        ["easy",     ["Up and out without much friction", "Se levantó y salió sin problema"],
                     ["I got myself going", "Me puse en marcha solo/a"]],
        ["slow",     ["A slow start, but they got there", "Empezó lento, pero llegó"],
                     ["Slow start, but I got there", "Empecé lento, pero llegué"]],
        ["prompted", ["Somebody had to keep them moving", "Alguien tuvo que ir empujándolo/a"],
                     ["Somebody had to keep me moving", "Alguien tuvo que ir empujándome"]],
        ["hard",     ["It was a rough start", "Fue un comienzo difícil"],
                     ["It was a rough start", "Fue un comienzo difícil"]],
        ["na",       ["I was not there for the morning", "No estuve en la mañana"],
                     ["Skip this one", "Saltar esta"]]
      ]
    },
    {
      id: "afternoon",
      lbl: ["Afternoon", "Tarde"],
      ask: {
        family:  ["How did they come home?", "¿Cómo llegó a casa?"],
        student: ["How were you when school let out?", "¿Cómo estabas al salir de la escuela?"]
      },
      hint: {
        family:  ["The first half hour back, before anything else started.", "La primera media hora en casa, antes de todo lo demás."],
        student: ["The first half hour after school.", "La primera media hora después de la escuela."]
      },
      /* ⚠ THESE FOUR ARE STATES, NOT GRADES. "Came in talking" is not better
         than "Quiet, but alright" - a quiet young person is not a worse one.
         What carries information is the CHANGE in which one gets tapped, over
         weeks, which is why every one of them is drawn the same. */
      opts: [
        ["talking",  ["Came in talking", "Llegó hablando"],
                     ["I came in talking", "Llegué hablando"]],
        ["quiet",    ["Quiet, but alright", "Callado/a, pero bien"],
                     ["Quiet, but alright", "Callado/a, pero bien"]],
        ["wiped",    ["Wiped out", "Agotado/a"],
                     ["Wiped out", "Agotado/a"]],
        ["wound",    ["Wound up", "Alterado/a"],
                     ["Wound up", "Alterado/a"]],
        ["na",       ["I did not see them after school", "No lo/la vi después de la escuela"],
                     ["Skip this one", "Saltar esta"]]
      ]
    },
    {
      id: "evening",
      lbl: ["Evening", "Noche"],
      ask: {
        family:  ["How is the day ending?", "¿Cómo termina el día?"],
        student: ["How is your night going?", "¿Cómo va tu noche?"]
      },
      hint: {
        family:  ["Right now, however the evening has gone.", "Ahora mismo, como haya ido la noche."],
        student: ["Right now, however tonight has gone.", "Ahora mismo, como haya ido esta noche."]
      },
      opts: [
        ["settled",  ["Settled", "Tranquilo/a"],
                     ["Settled", "Tranquilo/a"]],
        ["unread",   ["Quiet - hard to read", "Callado/a, difícil de saber"],
                     ["Quiet - I do not really know", "Callado/a, no sé bien"]],
        ["carrying", ["Still carrying something from today", "Todavía carga algo de hoy"],
                     ["Still carrying something from today", "Todavía cargo algo de hoy"]],
        ["hard",     ["It got hard tonight", "Se puso difícil esta noche"],
                     ["It got hard tonight", "Se puso difícil esta noche"]],
        ["na",       ["Too early to say", "Todavía es temprano para decir"],
                     ["Too early to say", "Todavía es temprano para decir"]]
      ]
    }
  ];

  /* ══════════════════════════════════════════════ THE ONE REFLECTION
     Chips, multi-select, entirely optional, and "Not much helped today" is a
     complete answer that raises nothing (rule 3). This is the only question
     that asks for a cause, and it asks it of the person best placed to know. */
  var HELPED = [
    ["alone",   ["Some time alone", "Un rato a solas"]],
    ["food",    ["Food", "Comida"]],
    ["talk",    ["Talking to someone", "Hablar con alguien"]],
    ["music",   ["Music or a screen", "Música o una pantalla"]],
    ["move",    ["Getting outside or moving", "Salir o moverse"]],
    ["routine", ["The usual routine, unchanged", "La rutina de siempre, sin cambios"]],
    ["nothing", ["Not much helped today", "Hoy no ayudó gran cosa"]]
  ];

  function moment(id) { for (var i=0;i<MOMENTS.length;i++) if (MOMENTS[i].id===id) return MOMENTS[i]; return null; }
  function optRow(m, key) { for (var i=0;i<m.opts.length;i++) if (m.opts[i][0]===key) return m.opts[i]; return null; }
  /* The ENGLISH label for the answering role - what is stored and what a
     report prints. Never the Spanish, never the key alone. */
  function labelEn(mId, key, role) {
    var m = moment(mId); if (!m) return "";
    var r = optRow(m, key); if (!r) return "";
    return (role === "student" ? r[2][0] : r[1][0]);
  }
  function labelFor(mId, key, role) {
    var m = moment(mId); if (!m) return "";
    var r = optRow(m, key); if (!r) return "";
    var pair = (role === "student" ? r[2] : r[1]);
    return isEs() ? pair[1] : pair[0];
  }
  function helpedEn(k) { for (var i=0;i<HELPED.length;i++) if (HELPED[i][0]===k) return HELPED[i][1][0]; return ""; }
  /* ⚠ "NOT MUCH HELPED TODAY" IS NOT A THING THAT HELPED. Printed under a
     "What helped:" label it reads as a contradiction the reader has to undo,
     which is the same fault as "I gave up" filed under what students say
     would help (.29s). When it is the only answer it gets its own sentence;
     alongside real answers it is dropped, because it cannot be true beside
     them. Used by BOTH the family recap and the teacher panel - one function,
     so the two can never disagree. */
  function helpedLine(labels, es) {
    var list = (labels || []).filter(Boolean);
    if (!list.length) return "";
    var none = es ? "Hoy no ayudó gran cosa" : "Not much helped today";
    var real = list.filter(function (x) { return x !== none && x !== "Not much helped today"; });
    if (!real.length) return esc(none) + ".";
    return "<strong>" + esc(es ? "Qué ayudó:" : "What helped:") + "</strong> " + esc(real.join(" · "));
  }
  function helpedLbl(k) { for (var i=0;i<HELPED.length;i++) if (HELPED[i][0]===k) return isEs()?HELPED[i][1][1]:HELPED[i][1][0]; return ""; }

  /* ═══════════════════════════════════════════════════ THE LINK CODEC
     Everything the phone needs rides in the URL, because there is no server
     in this product and there is not going to be one. base64url so it
     survives a copy-paste, a text message and a QR - not because it hides
     anything. Same shape as the home observation's, one field shorter. */
  function b64u(s) {
    try { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
    catch (e) { return ""; }
  }
  function unb64u(s) {
    try {
      s = String(s||"").replace(/-/g,"+").replace(/_/g,"/");
      while (s.length % 4) s += "=";
      return decodeURIComponent(escape(atob(s)));
    } catch (e) { return ""; }
  }
  /* c may be EMPTY. A class link carries no student code and the person types
     it on the way in, exactly as they do on the daily check-in - which is the
     whole reason one teacher can hand this to a hundred and thirty students
     without minting a hundred and thirty links. r locks the answering role
     when a teacher wants to; empty means the link asks. */
  function payloadOf(c) {
    return b64u(JSON.stringify({
      c: code(c.code || ""), r: c.role || "",
      d: c.districtId || "", h: c.schoolId || "", i: c.classId || "",
      g: c.grade || "", t: c.term || "", o: c.org || ""
    }));
  }
  function decodePayload(raw) {
    var j = unb64u(raw); if (!j) return null;
    var o = null; try { o = JSON.parse(j); } catch (e) { return null; }
    if (!o || typeof o !== "object") return null;
    var r = (o.r === "family" || o.r === "student") ? o.r : "";
    return { code: code(o.c || ""), role: r,
             districtId: o.d || "", schoolId: o.h || "", classId: o.i || "",
             grade: o.g || "", term: o.t || "", org: o.o || "" };
  }
  function baseUrl() {
    try { if (location.protocol === "http:" || location.protocol === "https:") return location.origin + location.pathname; } catch (e) {}
    return "";
  }
  function linkFor(c) {
    var b = (typeof aogShareBase_ === "function" && aogShareBase_("homeci")) || baseUrl();
    if (!b) return "";
    var dp = "";
    try { dp = (typeof aogDestParam_ === "function") ? aogDestParam_() : ""; } catch (e) {}
    return b + "?" + PARAM + "=" + payloadOf(c) + (isEs() ? "&lang=es" : "") +
           (dp ? "&" + AOG_DEST_PARAM + "=" + dp : "");
  }

  /* ══════════════════════════════════════════════════ THE OBSERVATIONS
     Keyed by student code. One record per submission - a second submission
     on the same day is a second record and is NOT merged over the first,
     because two people answering about one evening is the signal, not a
     conflict to resolve (see WHO ANSWERS IT at the top of this block). */
  /* ══════════════════════════ REMOVING ONE HOME CHECK-IN  ·  .30ea
     Jimmy: "CAN YOU MAKE SURE SOMETHING LIKE THAT IS ON EVERYPAGE that
     allows information to be inputted?"

     A whole student could already be dropped (removeStudent, below). ONE
     EVENING'S ANSWER COULD NOT — and one evening is exactly what a tester
     row is. The fifth surface to carry the same six rules.

     ⚠ THE KEY IS THE ONE addObs ALREADY DE-DUPLICATES ON: code + timestamp
     + respondentRole. Two people answering about the same evening is the
     signal, not a conflict (see WHO ANSWERS IT above), so the role is part
     of a row's identity and a key without it would take both.

     ⚠ aog.homeci.removed.v1 is NOT matched by PV_KEEP, so the full backup
     carries it and Erase everything takes it out. [[aog-backup-symmetry]] */
  var HCGONE = "aog.homeci.removed.v1";
  function hcGoneList() { var a = jload(HCGONE, []); return (a && a.slice) ? a.slice() : []; }
  function hcGoneSet() { var o = {}; hcGoneList().forEach(function (k) { o[String(k)] = 1; }); return o; }
  function hcGoneSave(a) { jsave(HCGONE, a.length > 4000 ? a.slice(a.length - 4000) : a); }
  function hcKey(sid, r) {
    return code(sid) + "|" + String((r && r.timestamp) || "") + "|" + String((r && r.respondentRole) || "");
  }
  function hcRemove(keys) {
    var want = {};
    (keys || []).forEach(function (k) { if (k) want[String(k)] = 1; });
    var st = store(), took = [], marks = {};
    Object.keys(st.obs || {}).forEach(function (k) {
      var keep = [];
      (st.obs[k] || []).forEach(function (r, i) {
        var key = hcKey(k, r);
        if (want[key]) { took.push({ code: k, at: i, row: r }); marks[key] = 1; }
        else keep.push(r);
      });
      if (keep.length) st.obs[k] = keep; else delete st.obs[k];
    });
    if (!took.length) return took;
    put(st);
    var g = hcGoneList(), have = hcGoneSet();
    Object.keys(marks).forEach(function (k) { if (!have[k]) { have[k] = 1; g.push(k); } });
    hcGoneSave(g);
    /* rule 3 — a row that never reached the Sheet must not upload afterwards */
    try {
      jsave(QKEY, (queueGet() || []).filter(function (r) { return !marks[hcKey(r && r.studentId, r)]; }));
    } catch (e) {}
    return took;
  }
  function hcRestore(took) {
    var st = store(), back = 0, undo = {};
    if (!st.obs) st.obs = {};
    (took || []).slice().sort(function (a, b) { return (a.at || 0) - (b.at || 0); })
      .forEach(function (t) {
        if (!t || !t.row) return;
        var arr = st.obs[t.code] || (st.obs[t.code] = []);
        var key = hcKey(t.code, t.row);
        var dup = arr.some(function (r) { return hcKey(t.code, r) === key; });
        if (!dup) { arr.splice(Math.min(t.at == null ? arr.length : t.at, arr.length), 0, t.row); back++; }
        undo[key] = 1;
      });
    if (back) put(st);
    /* ⚠ A RESTORED ROW MUST STOP BEING TOMBSTONED, or the next pull takes it
       away again and nobody ever works out why. */
    hcGoneSave(hcGoneList().filter(function (k) { return !undo[String(k)]; }));
    return back;
  }
  function hcKeysFor(sid) {
    var st = store(), k = code(sid);
    return (st.obs[k] || []).map(function (r) { return hcKey(k, r); });
  }

  function obsFor(sid) { var s = store(); return (s.obs[code(sid)] || []).slice(); }
  function addObs(sid, rec) {
    var s = store(), k = code(sid);
    if (!s.obs[k]) s.obs[k] = [];
    /* de-dup on the exact record identity, so a pull cannot double a row the
       phone already wrote - the exit slip's key, one field wider. */
    /* .30ea — a row a teacher removed on purpose must not come back down. */
    if (hcGoneSet()[hcKey(k, rec)]) return false;
    var dup = s.obs[k].some(function (r) {
      return r.timestamp === rec.timestamp && r.respondentRole === rec.respondentRole;
    });
    if (!dup) s.obs[k].push(rec);
    put(s);
    return !dup;
  }
  function codes() { var s = store(); return Object.keys(s.obs).filter(function (k) { return (s.obs[k]||[]).length; }).sort(); }
  function inLast(recs, days) {
    var cut = agoISO(days - 1);
    return recs.filter(function (r) { return String(r.date || "") >= cut; });
  }
  /* ⚠ "na" IS EXCLUDED FROM EVERY COUNT. Letting a skip into a denominator is
     the "Nothing today was counted as a barrier" mistake again - see
     [[aog-population-layer]]. A skip is an answer about the WITNESS, not about
     the young person. */
  function counted(recs, mId) {
    return recs.filter(function (r) { var k = r[mId + "Key"]; return k && k !== "na"; });
  }
  function tally(recs, mId) {
    var out = {};
    counted(recs, mId).forEach(function (r) { var k = r[mId+"Key"]; out[k] = (out[k]||0)+1; });
    return out;
  }

  /* ══════════════════════════════════════════════════════════════ THE WIRE
     Identical discipline to the exit slip's and the home observation's, for
     identical reasons: cors first so the reply can be read; a CORS failure
     means the POST WAS delivered and only the reply was blocked, so it is
     never re-sent (the only way to make a duplicate row); genuinely offline
     keeps it queued. Nothing here is new machinery.

     ⚠ THE TAB NAME IS A HARD CONTRACT. HomeCheckins, exactly - see
     [[aog-sheet-tab-names]]. Rename it in the Sheet and every pull silently
     returns nothing AND an empty decoy appears under the old name. */
  function destination() {
    var url = "", key = "";
    try { if (typeof SCHOOL_SYNC_URL !== "undefined") { url = SCHOOL_SYNC_URL || ""; key = SCHOOL_SYNC_KEY || ""; } } catch (e) {}
    if (!url) {
      var d = null;
      try { d = (typeof aogResolveDestination_ === "function") ? aogResolveDestination_() : null; } catch (e) {}
      if (d) { url = d.url || ""; key = d.key || ""; }
    }
    return { url: url, key: key };
  }
  function queueGet() { return jload(QKEY, []) || []; }
  function queuePush(r) { var q = queueGet(); q.push(r); jsave(QKEY, q); }
  function queueDrop(r) {
    jsave(QKEY, queueGet().filter(function (x) {
      return !(x.timestamp === r.timestamp && x.studentId === r.studentId);
    }));
  }
  function sync(rec) {
    var d = destination();
    if (!d.url || !d.key) return Promise.resolve("local");
    var p = { action: "homecheckin", passcode: d.key, _backendAuth: d.key };
    Object.keys(rec).forEach(function (k) { p[k] = rec[k] == null ? "" : rec[k]; });
    return fetch(d.url, {
      method: "POST", mode: "cors", redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(p)
    }).then(function (r) { return r.text(); }).then(function (txt) {
      var out = null; try { out = JSON.parse(txt); } catch (e) {}
      if (out && out.ok) { queueDrop(rec); return "sent"; }
      /* The script answered and said no - almost always an Apps Script that
         predates the HomeCheckins branch. Waiting will not fix that, and the
         family screen says so in words rather than spinning. */
      return "rejected";
    }).catch(function () {
      /* ⚠⚠ .30dj · THIS USED TO ANSWER "sent" AND DELETE THE ROW IN THE SAME
         BREATH. The reasoning was that a rejected fetch means the POST was
         delivered and only the CORS reply was blocked, so a re-send could only
         make a duplicate. That is ONE cause out of many and not the common one
         on a school network: a filtered host, a captive portal, a proxy that
         drops the redirect to script.googleusercontent.com, a reset connection
         and a DNS failure all reject in exactly the same shape — and
         navigator.onLine is TRUE for every one of them, because it means "this
         device has a network interface", never "the internet answered". So a
         student read "Sent to your teacher ✓" for a row no Sheet ever received,
         and the only copy of it was deleted as it was read.
         It stays queued now and is retried. A retry that duplicates is
         survivable — every pull path merges on studentId + timestamp, and the
         timestamp is fixed when the record is MADE, not when it is sent, so a
         second copy of the same row lands on the same key and is dropped. A
         row that was thrown away is not survivable. Keep the row. */
      return "offline";
    });
  }
  function flush() {
    if (navigator.onLine === false) return Promise.resolve();
    var q = queueGet(); if (!q.length) return Promise.resolve();
    return q.reduce(function (p, r) { return p.then(function () { return sync(r); }); }, Promise.resolve());
  }
  window.addEventListener("online", function () { try { flush(); } catch (e) {} });
  /* .30dj · A DEVICE THAT NEVER WENT OFFLINE NEVER FIRES "online". Now that a
     failed send stays queued, the only thing that emptied this queue was a
     transition a Chromebook on a flaky-but-connected network has no reason to
     make, so a held row would have waited for ever. Retry when the tab comes
     back to the front, which is what actually happens between one period and
     the next. Cheap: it returns immediately on an empty queue. */
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") { try { flush(); } catch (e) {} }
  });

  /* ⚠ THE SHEET GIVES BACK WHAT IT STORED, NOT WHAT WAS SENT. A submitTime
     written as "5:46 PM" is a time-only value to Sheets, which keeps it on
     its 1899-12-30 epoch; the pull returns it as a Date serialized to a full
     1899 string ("Sat Dec 30 1899 17:46:00 GMT-0600 ..."), and the date cell
     can likewise come back as a long Date string that fdate() cannot split.
     Repair both HERE, once, before the row enters the store — the .gs is
     deployed per school and cannot be assumed redeployed. The 1899 string
     carries the sheet's own wall clock in its text, so the hour survives the
     round trip even though the year is nonsense. */
  function isoDay(v) {
    var s = String(v || "").trim(), m = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
    var d = s ? new Date(s) : null;
    if (!d || isNaN(d.getTime()) || d.getFullYear() <= 1970) return "";
    var mo = d.getMonth() + 1, dy = d.getDate();
    return d.getFullYear() + "-" + (mo < 10 ? "0" : "") + mo + "-" + (dy < 10 ? "0" : "") + dy;
  }
  function normPulled(row) {
    var r = {}; for (var k in row) r[k] = row[k];
    var t = String(r.submitTime || "").trim();
    if (t && !/^\d{1,2}:\d{2}(:\d{2})?(\s?[AaPp]\.?[Mm]\.?)?$/.test(t)) {
      var td = new Date(t);
      if (!isNaN(td.getTime()) && td.getFullYear() <= 1900) {
        /* time-only cell on the Sheets epoch: keep the clock, drop the 1899 */
        try { r.submitTime = td.toLocaleTimeString(isEs() ? "es" : "en", { hour: "numeric", minute: "2-digit" }); }
        catch (e) { r.submitTime = ""; }
      }
    }
    /* an ISO day, from the date cell or failing that the timestamp — inLast()
       compares these as strings against agoISO(), so anything else silently
       falls out of every range as well as printing badly */
    r.date = isoDay(r.date) || isoDay(r.timestamp) || r.date;
    return r;
  }

  /* Pull is READ-ONLY and additive: rows that this device already holds are
     dropped by addObs's de-dup, so pulling twice cannot double a day. */
  window.aogPullHomeCheckins = function () {
    var d = destination(), rk = "";
    try { rk = localStorage.getItem("aog.sync.key") || ""; } catch (e) {}
    if (!d.url) return Promise.resolve({ ok: false, why: "nodest" });
    /* ⚠ READING NEEDS THE ADMIN_PULL_KEY, NOT THE WRITE KEY. The write key is
       published inside a page every family loads; if it could read as well,
       anyone holding a link could download every classmate's evenings. The
       same gate the exit-slip and home-observation pulls keep. */
    if (!rk) return Promise.resolve({ ok: false, why: "nokey" });
    return fetch(d.url, {
      method: "POST", mode: "cors", redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "pullHomeCheckins", passcode: rk })
    }).then(function (r) { return r.text(); }).then(function (txt) {
      var out = null; try { out = JSON.parse(txt); } catch (e) {}
      /* An older Apps Script answers 200 with something that is not this, so
         the presence of the KEY is the test, never the absence of an error. */
      if (!out || !out.ok || !("homeCheckins" in out)) return { ok: false, why: "rejected" };
      var rows = out.homeCheckins || [], added = 0;
      rows.forEach(function (row) { if (row && row.studentId && addObs(row.studentId, normPulled(row))) added++; });
      var s = store(); s.pulled.at = new Date().toISOString(); s.pulled.n = rows.length; put(s);
      try { paint(); } catch (e) {}
      return { ok: true, rows: rows.length, added: added };
    }).catch(function () { return { ok: false, why: "network" }; });
  };

  /* ═════════════════════════════════════════════════ THE FAMILY SCREEN
     One screen, one question at a time, thumb-sized targets, nothing below
     the fold that matters. The site's own palette and nothing new: this is a
     sibling of the exit slip, not a second product wearing a parent-app
     costume. */
  var HC = null;

  function css() {
    if (el("aogHcCss")) return;
    var s = document.createElement("style");
    s.id = "aogHcCss";
    s.textContent = [
      "#screen-home-checkin{display:none;}",
      /* ⚠ border-box, and svh not vh - the exact correction the home
         observation screen had to make. Without box-sizing the padding is
         ADDED to the 100vh and the phone scrolls by exactly that much on
         every screen. */
      "#screen-home-checkin.active{display:flex;align-items:flex-start;justify-content:center;",
      "  box-sizing:border-box;min-height:100svh;padding:20px 16px 28px;background:var(--paper,#FBF8F1);}",
      "@supports not (height:100svh){#screen-home-checkin.active{min-height:100vh;}}",
      /* The site footer is 74px after #aog-main inside .stage, so a section
         exactly one viewport tall still leaves the page 74px longer than the
         screen. A parent who followed a text message did not come for it. */
      "body:has(#screen-home-checkin.active) #aogGlobalFoot{display:none;}",
      "#screen-home-checkin .hc-wrap{width:100%;max-width:560px;}",
      "#screen-home-checkin .hc-eyebrow{font-size:12px;font-weight:800;letter-spacing:.10em;",
      "  text-transform:uppercase;color:var(--aog-dusk,#4A5578);margin-bottom:6px;}",
      "#screen-home-checkin h1{font-size:25px;line-height:1.2;margin:0 0 6px;color:var(--ink,#0A1E33);font-weight:800;}",
      "#screen-home-checkin .hc-sub{font-size:15px;line-height:1.6;color:var(--ink-soft,#46506E);margin:0 0 16px;}",
      "#screen-home-checkin .hc-card{background:var(--card,#fff);border:1px solid var(--rule,#E4DAC5);",
      "  border-radius:16px;padding:18px 16px;margin-bottom:12px;}",
      "#screen-home-checkin .hc-q{font-size:20px;font-weight:800;line-height:1.28;color:var(--ink,#0A1E33);margin:0 0 4px;}",
      "#screen-home-checkin .hc-hint{font-size:13.5px;line-height:1.5;color:var(--ink-faint,#646E86);margin:0 0 13px;}",
      "#screen-home-checkin .hc-note{font-size:13.5px;line-height:1.6;color:var(--ink-faint,#646E86);margin:10px 0 0;}",
      /* ⚠ ONE COLOR, ONE WEIGHT, ONE SIZE. Rule 1. No ramp, no traffic
         light, no ranking - "It was a rough start" is drawn exactly as
         "Up and out without much friction" is. t101 compares computed
         styles across all five and fails on any difference. */
      "#screen-home-checkin .hc-opt{display:flex;align-items:center;gap:12px;width:100%;text-align:left;",
      "  background:var(--card,#fff);border:1.5px solid var(--rule,#E4DAC5);border-radius:13px;",
      "  padding:13px 15px;margin-bottom:8px;font-family:inherit;font-size:16.5px;font-weight:650;",
      "  line-height:1.32;color:var(--ink,#0A1E33);cursor:pointer;min-height:54px;}",
      "#screen-home-checkin .hc-opt:hover{border-color:var(--aog-dusk,#4A5578);}",
      "#screen-home-checkin .hc-opt:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:2px;}",
      "#screen-home-checkin .hc-opt .hc-mark{flex:0 0 auto;width:22px;height:22px;border-radius:50%;",
      "  border:2px solid var(--aog-dusk,#4A5578);background:var(--aog-pale,#EEF0F6);}",
      "#screen-home-checkin .hc-opt.on{border-color:var(--aog-dusk,#4A5578);background:var(--aog-pale,#EEF0F6);}",
      "#screen-home-checkin .hc-opt.on .hc-mark{background:var(--aog-dusk,#4A5578);box-shadow:inset 0 0 0 3px var(--aog-pale,#EEF0F6);}",
      /* The skip sits under a rule so it reads as a different KIND of answer,
         not a worse one. It is never behind a fold and never a fifth-of-five
         afterthought. Rule 2. */
      "#screen-home-checkin .hc-esc{margin-top:11px;padding-top:11px;border-top:1px solid var(--rule,#E4DAC5);}",
      "#screen-home-checkin .hc-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;",
      "  border:0;border-radius:12px;padding:14px 22px;font-family:inherit;font-size:16.5px;font-weight:750;",
      "  cursor:pointer;background:var(--aog-dusk,#4A5578);color:var(--aog-on,#fff);min-height:52px;}",
      "#screen-home-checkin .hc-btn.ghost{background:transparent;color:var(--ink,#0A1E33);border:1.5px solid var(--rule,#E4DAC5);}",
      "#screen-home-checkin .hc-btn:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:2px;}",
      "#screen-home-checkin .hc-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:10px;}",
      "#screen-home-checkin .hc-back{background:none;border:0;font-family:inherit;font-size:14.5px;font-weight:700;",
      "  color:var(--ink,#0A1E33);text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:10px 2px;min-height:44px;}",
      "#screen-home-checkin textarea{width:100%;min-height:74px;border:1.5px solid var(--rule,#E4DAC5);",
      "  border-radius:12px;padding:12px;font-family:inherit;font-size:16px;line-height:1.5;",
      "  background:var(--card,#fff);color:var(--ink,#0A1E33);box-sizing:border-box;}",
      "#screen-home-checkin input.hc-code{width:100%;max-width:230px;border:1.5px solid var(--rule,#E4DAC5);",
      "  border-radius:12px;padding:13px 14px;font-family:inherit;font-size:18px;font-weight:750;letter-spacing:.06em;",
      "  text-transform:uppercase;background:var(--card,#fff);color:var(--ink,#0A1E33);box-sizing:border-box;}",
      "#screen-home-checkin .hc-chips{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 2px;}",
      "#screen-home-checkin .hc-chip{border:1.5px solid var(--rule,#E4DAC5);background:var(--card,#fff);",
      "  border-radius:999px;padding:10px 14px;font-family:inherit;font-size:15px;font-weight:650;",
      "  color:var(--ink,#0A1E33);cursor:pointer;min-height:44px;}",
      "#screen-home-checkin .hc-chip.on{border-color:var(--aog-dusk,#4A5578);background:var(--aog-pale,#EEF0F6);}",
      "#screen-home-checkin .hc-chip:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:2px;}",
      /* The rail names the three moments in words. It is NOT a progress bar
         and carries no percentage, no count of what is left and no "3 of 3" -
         it is a map of a day, which is the thing this instrument is about. */
      "#screen-home-checkin .hc-rail{display:flex;gap:6px;margin:0 0 14px;}",
      "#screen-home-checkin .hc-rail span{flex:1 1 0;font-size:11px;font-weight:800;letter-spacing:.07em;",
      "  text-transform:uppercase;color:var(--ink-faint,#646E86);border-top:3px solid var(--rule,#E4DAC5);padding-top:6px;}",
      "#screen-home-checkin .hc-rail span.on{color:var(--ink,#0A1E33);border-top-color:var(--aog-dusk,#4A5578);}",
      "#screen-home-checkin .hc-rail span.did{border-top-color:var(--gold,#D9A33B);}",
      "#screen-home-checkin .hc-tick{display:flex;align-items:flex-start;gap:10px;margin:12px 0 0;",
      "  font-size:14.5px;line-height:1.5;color:var(--ink,#0A1E33);cursor:pointer;}",
      "#screen-home-checkin .hc-tick input{width:22px;height:22px;flex:0 0 auto;margin:1px 0 0;accent-color:var(--aog-dusk,#4A5578);}",
      "#screen-home-checkin .hc-done-h{font-size:24px;font-weight:800;line-height:1.25;margin:0 0 8px;color:var(--ink,#0A1E33);}",
      "#screen-home-checkin .hc-recap{margin:0;padding:0;list-style:none;}",
      "#screen-home-checkin .hc-recap li{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--rule,#E4DAC5);font-size:15px;line-height:1.45;}",
      "#screen-home-checkin .hc-recap li:last-child{border-bottom:0;}",
      "#screen-home-checkin .hc-recap b{flex:0 0 84px;font-size:11px;font-weight:800;letter-spacing:.07em;",
      "  text-transform:uppercase;color:var(--ink-faint,#646E86);padding-top:3px;}",
      "@media (max-width:380px){#screen-home-checkin .hc-opt{font-size:16px;padding:12px 13px;min-height:50px;}",
      "  #screen-home-checkin h1{font-size:23px;}}",
      /* ⚠ SHORT PHONES (2026-08-31, Jimmy's iPhone): a moment step at the
         default spacing runs just past one viewport, which puts the fifth
         option — the honest skip — below the fold. Rule 2 says the skip is
         NEVER behind a fold, so on short viewports the whole step tightens
         until all five options and the Back control stand on one screen.
         Nothing is reordered, hidden or shrunk below tap size (44px). */
      "@media (max-height:780px){",
      "  #screen-home-checkin.active{padding:12px 16px 20px;}",
      "  #screen-home-checkin .hc-eyebrow{margin-bottom:3px;}",
      "  #screen-home-checkin h1{font-size:21px;margin-bottom:3px;}",
      "  #screen-home-checkin .hc-sub{font-size:14px;margin-bottom:10px;}",
      "  #screen-home-checkin .hc-rail{margin-bottom:10px;}",
      "  #screen-home-checkin .hc-card{padding:13px 13px;margin-bottom:9px;border-radius:13px;}",
      "  #screen-home-checkin .hc-q{font-size:18px;}",
      "  #screen-home-checkin .hc-hint{margin-bottom:9px;}",
      "  #screen-home-checkin .hc-opt{padding:10px 13px;min-height:46px;margin-bottom:6px;font-size:15.5px;}",
      "  #screen-home-checkin .hc-esc{margin-top:8px;padding-top:8px;}",
      "  #screen-home-checkin .hc-chip{padding:8px 12px;min-height:44px;font-size:14.5px;}",
      "  #screen-home-checkin textarea{min-height:56px;}",
      "  #screen-home-checkin .hc-btn{padding:12px 20px;min-height:48px;}",
      "}"
    ].join("\n");
    document.head.appendChild(s);
  }

  function ensureScreen() {
    var s = el("screen-home-checkin");
    if (s) return s;
    css();
    s = document.createElement("section");
    s.id = "screen-home-checkin";
    s.className = "screen";
    s.setAttribute("aria-label", "Home Check-In");
    /* ⚠ IT GOES WHERE THE OTHER SCREENS GO, NOT ON document.body. `.stage`
       holds every section and keeps its own full-viewport height; a screen
       appended AFTER it lands below a blank 100vh and the phone opens on an
       empty page. Measured once already on the home observation screen. */
    var sib = document.querySelector(".screen");
    if (sib && sib.parentNode) sib.parentNode.appendChild(s);
    else document.body.appendChild(s);
    return s;
  }

  function show() {
    /* SHOW BEFORE ANYTHING MEASURES - the order the check-in and the exit
       slip both had to learn. */
    var sec = ensureScreen();
    try { if (typeof showScreen === "function") showScreen("screen-home-checkin"); else sec.classList.add("active"); }
    catch (e) { sec.classList.add("active"); }
    /* ⚠ AND THE MARKETING HEADER GOES. The topbar is 148px on a phone, which
       is exactly how much this screen overflowed by before this line existed -
       measured 992 against an 844 viewport. FOCUS lives in a closure inside
       #aog-checkin-calm and its showScreen wrapper toggles the class OFF for
       any id it does not know, so the class goes on AFTER the call. The
       patcher also adds the id to FOCUS itself; this line is what makes the
       block correct on a build where it has not. */
    try { document.body.classList.add("aog-survey-focus"); } catch (e2) {}
    return sec;
  }

  /* ⚠ THE MOMENT SCREENS HAD NO IDENTITY ON THEM. A link that already carries
     the code and the role skips the intro entirely, so a parent who followed a
     text message landed on a bare question with nothing on the page saying
     what this was or who was asking. One quiet line, above the rail. */
  function railHtml(ix) {
    return '<p class="hc-eyebrow">' + esc(T("The rest of the day","El resto del día")) + '</p>' +
           '<div class="hc-rail" aria-hidden="true">' + MOMENTS.map(function (m, i) {
      var cls = (i === ix) ? "on" : (HC.a[m.id] ? "did" : "");
      return '<span class="' + cls + '">' + esc(isEs()?m.lbl[1]:m.lbl[0]) + '</span>';
    }).join("") + '</div>';
  }

  /* ------------------------------------------------------ screen 1 · who */
  function renderWho() {
    var sec = show();
    var needCode = !HC.sid;
    var needRole = !HC.role;
    sec.innerHTML =
      '<div class="hc-wrap">' +
        '<p class="hc-eyebrow">' + esc(T("Architecture of Grace","Architecture of Grace")) + '</p>' +
        '<h1>' + esc(T("The rest of the day","El resto del día")) + '</h1>' +
        '<p class="hc-sub">' + esc(T(
            "School sees part of a day. Three quick taps about the rest of it — the morning before, the afternoon after, and how tonight is going. It takes about a minute.",
            "La escuela ve una parte del día. Tres toques rápidos sobre el resto — la mañana anterior, la tarde después y cómo va esta noche. Toma como un minuto.")) + '</p>' +
        '<div class="hc-card">' +
          (needRole ?
            '<p class="hc-q">' + esc(T("Who is answering?","¿Quién responde?")) + '</p>' +
            '<p class="hc-hint">' + esc(T("Either is fine, and it can be a different person tomorrow.","Cualquiera está bien, y mañana puede ser otra persona.")) + '</p>' +
            '<button type="button" class="hc-opt" data-role="student"><span class="hc-mark"></span>' + esc(T("I am the student","Soy el/la estudiante")) + '</button>' +
            '<button type="button" class="hc-opt" data-role="family"><span class="hc-mark"></span>' + esc(T("I am a grown-up at home","Soy un adulto en casa")) + '</button>'
          : '') +
          (needCode ?
            '<div style="margin-top:' + (needRole ? "14px" : "0") + ';">' +
            '<label class="hc-q" for="hcCode" style="display:block;">' + esc(T("Student code","Código del estudiante")) + '</label>' +
            '<p class="hc-hint">' + esc(T("The short code the teacher gave — initials and a number, like JR14. Not a name.","El código corto que dio el maestro — iniciales y un número, como JR14. No un nombre.")) + '</p>' +
            '<input class="hc-code" id="hcCode" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" value="' + esc(HC.typed || "") + '">' +
            '</div>'
          : '') +
          '<div class="hc-row"><button type="button" class="hc-btn" id="hcGo">' + esc(T("Start","Empezar")) + '</button></div>' +
          '<p class="hc-note" id="hcWhoNote"></p>' +
        '</div>' +
        '<p class="hc-note">' + esc(T(
            "Nothing here is a test and there is no wrong answer. It is not stored with a name, and you can skip any part of it.",
            "Nada de esto es una prueba y no hay respuestas incorrectas. No se guarda con un nombre y puedes saltarte cualquier parte.")) + '</p>' +
      '</div>';

    sec.querySelectorAll("[data-role]").forEach(function (b) {
      b.classList.toggle("on", HC.role === b.getAttribute("data-role"));
      b.addEventListener("click", function () {
        var inp = el("hcCode"); if (inp) HC.typed = inp.value;
        HC.role = b.getAttribute("data-role");
        renderWho();
      });
    });
    var go = el("hcGo");
    if (go) go.addEventListener("click", function () {
      var inp = el("hcCode");
      if (inp) { HC.typed = inp.value; if (code(inp.value)) HC.sid = code(inp.value); }
      var n = el("hcWhoNote");
      if (!HC.role) { if (n) n.textContent = T("Tap one of the two above first.","Toca una de las dos opciones de arriba primero."); return; }
      if (!HC.sid)  { if (n) n.textContent = T("The short code goes in the box above.","El código corto va en la casilla de arriba."); return; }
      HC.step = 0; render();
    });
  }

  /* ------------------------------------------------ screens 2-4 · moments */
  function renderMoment(ix) {
    var sec = show();
    var m = MOMENTS[ix];
    var role = HC.role || "family";
    var ask  = isEs() ? m.ask[role][1]  : m.ask[role][0];
    var hint = isEs() ? m.hint[role][1] : m.hint[role][0];
    var chosen = HC.a[m.id] || "";
    var body = m.opts.filter(function (o) { return o[0] !== "na"; }).map(function (o) {
      var pair = (role === "student" ? o[2] : o[1]);
      return '<button type="button" class="hc-opt' + (chosen===o[0]?" on":"") + '" data-k="' + o[0] + '">' +
             '<span class="hc-mark"></span>' + esc(isEs()?pair[1]:pair[0]) + '</button>';
    }).join("");
    var na = optRow(m, "na");
    var naPair = (role === "student" ? na[2] : na[1]);
    sec.innerHTML =
      '<div class="hc-wrap">' +
        railHtml(ix) +
        '<div class="hc-card">' +
          '<p class="hc-q">' + esc(ask) + '</p>' +
          '<p class="hc-hint">' + esc(hint) + '</p>' +
          body +
          '<div class="hc-esc"><button type="button" class="hc-opt' + (chosen==="na"?" on":"") + '" data-k="na">' +
          '<span class="hc-mark"></span>' + esc(isEs()?naPair[1]:naPair[0]) + '</button></div>' +
        '</div>' +
        (ix > 0 ? '<button type="button" class="hc-back" id="hcBack">' + esc(T("Back","Atrás")) + '</button>' : '') +
      '</div>';
    sec.querySelectorAll("[data-k]").forEach(function (b) {
      b.addEventListener("click", function () {
        HC.a[m.id] = b.getAttribute("data-k");
        /* ⚠ A SKIP MOVES ON LIKE ANY OTHER TAP. Rule 2. Ending the check-in
           on "I was not there for the morning" would throw away the two
           moments the person WAS there for. */
        HC.step = ix + 1; render();
      });
    });
    var bk = el("hcBack");
    if (bk) bk.addEventListener("click", function () { HC.step = ix - 1; render(); });
    try { window.scrollTo({ top: 0, behavior: "instant" }); } catch (e) { try { window.scrollTo(0,0); } catch(e2){} }
  }

  /* ------------------------------------------- screen 5 · the reflection */
  function renderExtra() {
    var sec = show();
    var role = HC.role || "family";
    sec.innerHTML =
      '<div class="hc-wrap">' +
        railHtml(-1) +
        '<div class="hc-card">' +
          '<p class="hc-q">' + esc(T("What helped today?","¿Qué ayudó hoy?")) + '</p>' +
          '<p class="hc-hint">' + esc(T("Tap as many as fit, or none.","Toca los que apliquen, o ninguno.")) + '</p>' +
          '<div class="hc-chips">' + HELPED.map(function (h) {
            return '<button type="button" class="hc-chip' + (HC.a.helped.indexOf(h[0])>=0?" on":"") + '" data-h="' + h[0] + '">' + esc(helpedLbl(h[0])) + '</button>';
          }).join("") + '</div>' +
        '</div>' +
        '<div class="hc-card">' +
          '<p class="hc-q">' + esc(T("Anything you would like the school team to know?","¿Algo que quieras que el equipo escolar sepa?")) + '</p>' +
          '<p class="hc-hint">' + esc(T("Optional. Leave it empty and nothing is lost.","Opcional. Si lo dejas vacío no se pierde nada.")) + '</p>' +
          '<textarea id="hcNote" rows="3">' + esc(HC.a.note || "") + '</textarea>' +
          /* ⚠ RULE 3 LIVES HERE. These two controls - the box and the tick -
             are the ONLY two things in this instrument that raise followUp.
             Not a hard morning, not a hard evening, not four hard days. */
          '<label class="hc-tick" for="hcFu"><input type="checkbox" id="hcFu"' + (HC.a.followUp?" checked":"") + '>' +
          '<span>' + esc(role === "student"
              ? T("I would like to talk to someone at school about this.","Me gustaría hablar con alguien de la escuela sobre esto.")
              : T("I would like someone at school to get in touch.","Me gustaría que alguien de la escuela se comunique conmigo.")) + '</span></label>' +
        '</div>' +
        '<div class="hc-row"><button type="button" class="hc-btn" id="hcDone">' + esc(T("Send it","Enviar")) + '</button>' +
        '<button type="button" class="hc-back" id="hcBack2">' + esc(T("Back","Atrás")) + '</button></div>' +
      '</div>';
    sec.querySelectorAll("[data-h]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-h"), i = HC.a.helped.indexOf(k);
        if (i >= 0) HC.a.helped.splice(i, 1); else HC.a.helped.push(k);
        b.classList.toggle("on", HC.a.helped.indexOf(k) >= 0);
      });
    });
    function grab() {
      var t = el("hcNote"), f = el("hcFu");
      if (t) HC.a.note = t.value;
      if (f) HC.a.followUp = !!f.checked;
    }
    var d = el("hcDone"); if (d) d.addEventListener("click", function () { grab(); finish(); });
    var b2 = el("hcBack2"); if (b2) b2.addEventListener("click", function () { grab(); HC.step = MOMENTS.length - 1; render(); });
    try { window.scrollTo({ top: 0, behavior: "instant" }); } catch (e) {}
  }

  /* ---------------------------------------------------- screen 6 · done */
  function renderDone() {
    var sec = show();
    var role = HC.role || "family";
    var rows = MOMENTS.map(function (m) {
      var k = HC.a[m.id]; if (!k) return "";
      return '<li><b>' + esc(isEs()?m.lbl[1]:m.lbl[0]) + '</b><span>' + esc(labelFor(m.id, k, role)) + '</span></li>';
    }).join("");
    var helped = HC.a.helped.map(function (k) { return helpedLbl(k); }).filter(Boolean);
    /* ⚠ NOT A RECEIPT AND NOT A VERDICT. It repeats what was tapped so the
       person can see it was heard, and it says what happens next in plain
       words. There is no summary sentence about the young person, because
       this instrument has no standing to write one. */
    var wire = "";
    if (HC.sent === "rejected") {
      wire = T("This is saved on this phone. The school's copy did not go through — the teacher will see it once the school sheet is updated on their end. Nothing was lost.",
               "Esto quedó guardado en este teléfono. La copia de la escuela no pasó — el maestro la verá cuando se actualice la hoja de la escuela. No se perdió nada.");
    } else if (HC.sent === "offline") {
      wire = T("Saved here. It will go to the school on its own next time this phone is online.",
               "Guardado aquí. Se enviará a la escuela solo, la próxima vez que este teléfono tenga conexión.");
    } else if (HC.sent === "local") {
      wire = T("Saved on this phone.", "Guardado en este teléfono.");
    } else if (HC.sent === "sent") {
      wire = T("Sent to the school team.", "Enviado al equipo escolar.");
    } else {
      wire = T("Saving…", "Guardando…");
    }
    /* the letter's promise, every audience: after a completed submission,
       the once-ever home-screen offer */
    try { if (window.aogOfferA2HS) setTimeout(window.aogOfferA2HS, 900); } catch (e) {}
    sec.innerHTML =
      '<div class="hc-wrap">' +
        '<div class="hc-card">' +
          '<p class="hc-done-h">' + esc(T("Thank you.","Gracias.")) + '</p>' +
          '<p class="hc-sub" style="margin-bottom:12px;">' + esc(T(
              "That is the whole thing. Nothing else is expected tonight.",
              "Eso es todo. No se espera nada más esta noche.")) + '</p>' +
          '<ul class="hc-recap">' + rows + '</ul>' +
          (helped.length ? '<p class="hc-note">' + helpedLine(helped, isEs()) + '</p>' : '') +
          (HC.a.followUp ? '<p class="hc-note">' + esc(T("Someone from school will reach out.","Alguien de la escuela se comunicará.")) + '</p>' : '') +
          '<p class="hc-note">' + esc(wire) + '</p>' +
        '</div>' +
        '<div class="hc-row"><button type="button" class="hc-btn ghost" id="hcAgain">' + esc(T("Add another one","Añadir otra")) + '</button>' +
        /* A door out. On a phone this screen was a dead end — nothing led
           anywhere, so the only move was closing the tab or the app. */
        '<button type="button" class="hc-btn ghost" id="hcExit">' + esc(T("Done","Listo")) + '</button></div>' +
        '<p class="hc-note">' + esc(T(
            "This is stored under a short code, not a name. It is one small picture of one day and it does not decide anything on its own.",
            "Esto se guarda con un código corto, no con un nombre. Es una pequeña imagen de un día y por sí solo no decide nada.")) + '</p>' +
      '</div>';
    var a = el("hcAgain");
    if (a) a.addEventListener("click", function () {
      /* ⚠ CLEAR done BEFORE step. render() reads HC.done first, so leaving it
         set redrew this same screen and the button looked dead - the exact
         bug the home observation screen shipped and had to fix. */
      HC.done = false; HC.sent = ""; HC.a = { helped: [], note: "", followUp: false };
      HC.step = 0; render();
    });
    var x = el("hcExit");
    if (x) x.addEventListener("click", function () {
      /* Plain navigation, no history tricks: from a texted link this lands on
         the site home; inside the installed app it lands on the app's home.
         The record is already queued locally, so leaving mid-save loses nothing. */
      window.location.href = "./";
    });
  }

  function render() {
    if (!HC) return;
    if (HC.done) return renderDone();
    if (!HC.role || !HC.sid) return renderWho();
    if (HC.step >= MOMENTS.length) return renderExtra();
    if (HC.step >= 0) return renderMoment(HC.step);
    return renderWho();
  }

  function finish() {
    var c = HC.cfg || {};
    var role = HC.role || "family";
    var rec = {
      timestamp: new Date().toISOString(),
      date: todayISO(),
      year: window.AOGYear ? AOGYear(todayISO()) : "",
      submitTime: clockNow(),
      slipType: "homecheckin",
      studentId: HC.sid,
      respondentId: HC.sid,
      respondentRole: role,                 /* "family" or "student" */
      districtId: c.districtId || "", schoolId: c.schoolId || "",
      classId: c.classId || "", grade: c.grade || "", term: c.term || "",
      /* The ENGLISH label always, plus the key. A Spanish phone and an
         English phone write the same row. */
      morning:      labelEn("morning",   HC.a.morning   || "", role),
      morningKey:   HC.a.morning   || "",
      afternoon:    labelEn("afternoon", HC.a.afternoon || "", role),
      afternoonKey: HC.a.afternoon || "",
      evening:      labelEn("evening",   HC.a.evening   || "", role),
      eveningKey:   HC.a.evening   || "",
      helped:       HC.a.helped.map(helpedEn).filter(Boolean).join(" | "),
      helpedKeys:   HC.a.helped.join(" | "),
      note:         (HC.a.note || "").trim(),
      /* ⚠ EXACTLY TWO THINGS RAISE THIS. Not a hard morning. Not a hard
         evening. Not a run of them. Rule 3. */
      followUp:     !!((HC.a.note && HC.a.note.trim()) || HC.a.followUp),
      source:       "link"
    };
    addObs(HC.sid, rec);
    queuePush(rec);
    HC.done = true; HC.sent = "";
    render();
    sync(rec).then(function (r) { HC.sent = r; if (HC.done) render(); });
  }

  function openFromLink(cfg) {
    HC = { cfg: cfg || {}, sid: code((cfg && cfg.code) || ""), role: (cfg && cfg.role) || "",
           typed: "", step: 0, a: { helped: [], note: "", followUp: false }, done: false, sent: "" };
    css();
    render();
  }

  function fromUrl() {
    var raw = "";
    try { raw = new URLSearchParams(location.search).get(PARAM) || ""; } catch (e) {}
    if (!raw) return null;
    /* ⚠ A LINK IS A WRITE CREDENTIAL, NEVER A READ ONE - the same rule the
       student links and the home observation link keep. Nothing on this
       screen reads the school's records, another student, or the Sheet. */
    return decodePayload(raw);
  }

  /* ═══════════════════════════════════════════════════ THE TEACHER SIDE
     A fourth tab inside the Check-ins door: Daily Log · Exit slips ·
     Reflection · Home. One door for the student's voice, and this is the
     part of it the school day cannot hear. [[aog-checkins-door]] */
  var RANGE = 7, ONLY = "";

  function tcss() {
    if (el("aogHcTCss")) return;
    var s = document.createElement("style");
    s.id = "aogHcTCss";
    s.textContent = [
      "#panel-homeci .hct-wrap{max-width:980px;}",
      "#panel-homeci .hct-card{background:var(--card,#fff);border:1px solid var(--rule,#E4DAC5);border-radius:14px;padding:18px 18px;margin:0 0 16px;}",
      "#panel-homeci .hct-h{font-family:Georgia,serif;font-size:18px;font-weight:700;margin:0 0 4px;color:var(--ink,#0A1E33);}",
      /* ⚠ EVERY BUILDER RULE CARRIES BOTH SCOPES, IN ONE RULE. The builder
         moved to Set up ▸ Distribute in .29ah and rendered there completely
         unstyled — 33 assertions and an axe sweep passed on it, because
         nothing measures whether a card looks like the four cards beside it.
         A second copy of this block for the new scope would be the
         print-isolation trap all over again: two rules, one patched. */
      "#panel-homeci .hct-s,#aogHcLgCard .hct-s{font-size:13.5px;line-height:1.6;color:var(--ink-soft,#46506E);margin:0 0 14px;}",
      "#panel-homeci .hct-row,#aogHcLgCard .hct-row{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;}",
      "#panel-homeci .hct-f,#aogHcLgCard .hct-f{display:flex;flex-direction:column;gap:5px;}",
      "#panel-homeci .hct-f label,#aogHcLgCard .hct-f label{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-soft,#46506E);}",
      "#panel-homeci select,#panel-homeci input.hct-in,#aogHcLgCard select,#aogHcLgCard input.hct-in{font-family:inherit;font-size:15px;padding:9px 11px;border:1.5px solid var(--rule,#E4DAC5);",
      "  border-radius:10px;background:var(--card,#fff);color:var(--ink,#0A1E33);min-height:42px;}",
      "#panel-homeci .hct-btn,#aogHcLgCard .hct-btn{font-family:inherit;font-size:14.5px;font-weight:750;border:0;border-radius:10px;padding:11px 18px;",
      "  cursor:pointer;background:var(--aog-dusk,#4A5578);color:var(--aog-on,#fff);min-height:42px;}",
      "#panel-homeci .hct-btn.alt,#aogHcLgCard .hct-btn.alt{background:transparent;color:var(--ink,#0A1E33);border:1.5px solid var(--rule,#E4DAC5);}",
      "#panel-homeci .hct-link,#aogHcLgCard .hct-link{margin-top:12px;font-size:12.5px;line-height:1.5;word-break:break-all;color:var(--ink-soft,#46506E);",
      "  background:var(--paper,#FBF8F1);border:1px solid var(--rule,#E4DAC5);border-radius:10px;padding:10px 12px;}",
      /* ⚠ --ink-soft, NOT --ink-faint (3.08:1). This note is the sentence
         saying what the link does NOT carry — the one a teacher reads before
         texting a link to a family. It is the last place to set faintly. */
      "#panel-homeci .hct-note,#aogHcLgCard .hct-note{font-size:12.5px;line-height:1.6;color:var(--ink-soft,#46506E);margin:10px 0 0;}",
      /* One record, three moments, read left to right. NOT a chart: there is
         nothing to plot here, because there is no number here. Rule 1. */
      "#panel-homeci .hct-day{border:1px solid var(--rule,#E4DAC5);border-radius:12px;padding:12px 14px;margin:0 0 10px;background:var(--card,#fff);}",
      "#panel-homeci .hct-day-h{display:flex;flex-wrap:wrap;gap:8px;align-items:baseline;margin:0 0 10px;}",
      "#panel-homeci .hct-code{font-weight:800;font-size:15px;color:var(--ink,#0A1E33);}",
      "#panel-homeci .hct-meta{font-size:12px;color:var(--ink-faint,#646E86);}",
      "#panel-homeci .hct-who{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;",
      "  border:1px solid var(--rule,#E4DAC5);border-radius:999px;padding:2px 9px;color:var(--ink-soft,#46506E);}",
      "#panel-homeci .hct-fu{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;",
      "  border:1px solid var(--gold,#D9A33B);background:rgba(217,163,59,.14);color:#7a5510;border-radius:999px;padding:2px 9px;}",
      "#panel-homeci .hct-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;}",
      "#panel-homeci .hct-3>div{border:1px solid var(--rule,#E4DAC5);border-radius:10px;padding:9px 11px;background:var(--paper,#FBF8F1);}",
      "#panel-homeci .hct-3 dt{font-size:9.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-faint,#646E86);margin:0 0 4px;}",
      "#panel-homeci .hct-3 dd{margin:0;font-size:14.5px;font-weight:700;line-height:1.35;color:var(--ink,#0A1E33);}",
      "#panel-homeci .hct-3 dd.skip{font-weight:600;color:var(--ink-faint,#646E86);}",
      "#panel-homeci .hct-said{margin:10px 0 0;font-size:13.5px;line-height:1.55;color:var(--ink,#0A1E33);",
      "  border-left:3px solid var(--gold,#D9A33B);padding:2px 0 2px 12px;}",
      "#panel-homeci .hct-empty{border:1px dashed var(--rule,#E4DAC5);border-radius:14px;padding:22px 20px;background:var(--paper,#FBF8F1);}",
      "@media (max-width:620px){#panel-homeci .hct-3{grid-template-columns:1fr;}}"
    ].join("\n");
    document.head.appendChild(s);
  }

  function fdate(iso) {
    try {
      var p = String(iso).split("-");
      var d = new Date(+p[0], +p[1]-1, +p[2]);
      /* a row that reached the store before the pull normalizer existed can
         still hold an unsplittable date — blank beats "Invalid Date" */
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString(isEs()?"es":"en", { weekday:"short", month:"short", day:"numeric" });
    } catch (e) { return ""; }
  }
  /* A clock, or nothing — the exit slip's prettyClock rule. Rows stored by a
     pull that ran before the normalizer still hold the Sheet's 1899 Date
     string in submitTime; the clock inside it is real, the year is not. */
  function ftime(t) {
    t = String(t == null ? "" : t).trim();
    if (!t) return "";
    if (/^\d{1,2}:\d{2}(:\d{2})?(\s?[AaPp]\.?[Mm]\.?)?$/.test(t)) return t;
    var d = new Date(t);
    if (!isNaN(d.getTime()) && d.getFullYear() <= 1900) {
      try { return d.toLocaleTimeString(isEs()?"es":"en", { hour:"numeric", minute:"2-digit" }); } catch (e) {}
    }
    return "";
  }

  function classOptions() {
    var out = [];
    try {
      (window.AOGPop.classes() || []).forEach(function (k) {
        out.push({ id: k.classId || k.id || "", name: k.name || k.classId || "", schoolId: k.schoolId || "",
                   classId: k.classId || "", grade: k.grade || "", term: k.term || "", districtId: k.districtId || "" });
      });
    } catch (e) {}
    return out;
  }

  function buildLink() {
    var cls = el("hctClass"), sid = el("hctCode"), role = el("hctRole");
    var ctx = { districtId:"", schoolId:"", classId:"", grade:"", term:"", org:"" };
    if (cls && cls.value) {
      classOptions().forEach(function (k) {
        if ((k.classId || k.id) === cls.value) {
          ctx.schoolId = k.schoolId; ctx.classId = k.classId; ctx.grade = k.grade; ctx.term = k.term; ctx.districtId = k.districtId;
        }
      });
    }
    try { if (typeof aogOrgId === "function") ctx.org = aogOrgId() || ""; } catch (e) {}
    ctx.code = sid ? code(sid.value) : "";
    ctx.role = role ? (role.value || "") : "";
    return linkFor(ctx);
  }

  /* ── the Remove control  ·  .30ea ──────────────────────────────────────
     ⚠ THE ARMED STATE LIVES IN MODULE STATE, NOT ON THE DOM. paint() rebuilds
     the whole panel, so a data-armed attribute would be wiped by the very
     re-render the first press causes. Keyed by row, so arming one row cannot
     arm another.
     ⚠ TWO PRESSES, NEVER A BROWSER DIALOG. ⚠ NO RED — a family answered this
     about their own child's evening. */
  var HCDEL = { armed: "", said: "", last: null, t: 0 };
  function hcDelBtn(k) {
    var armed = HCDEL.armed === k;
    return ' <button type="button" class="hc-del" data-hcdel="' + esc(k) + '"' +
      ' style="font:inherit;font-size:10.5px;font-weight:700;cursor:pointer;border:1px solid var(--rule,#E4DAC5);' +
      'background:var(--card,#fff);color:var(--ink-soft,#5b6675);border-radius:999px;padding:1px 9px;margin-left:8px;">' +
      esc(armed ? (isEs() ? "Presiona otra vez para quitar" : "Press again to remove")
                : (isEs() ? "Quitar" : "Remove")) + "</button>";
  }
  /* ⚠ SAY THE SHEET IS UNTOUCHED, every time and in both languages. */
  function hcRemovedLine(n) {
    if (isEs()) {
      return n === 1
        ? "Se quitó 1 registro. No volverá la próxima vez que traigas datos. La fila de tu Hoja de Google queda intacta — bórrala allí si también quieres que desaparezca de la Hoja."
        : "Se quitaron " + n + " registros. No volverán la próxima vez que traigas datos. Las filas de tu Hoja de Google quedan intactas — bórralas allí si también quieres que desaparezcan de la Hoja.";
    }
    return n === 1
      ? "Removed 1 check-in. It will not come back the next time you pull. The row in your Google Sheet is untouched — delete it there if you want it gone from the Sheet too."
      : "Removed " + n + " check-ins. They will not come back the next time you pull. The rows in your Google Sheet are untouched — delete them there if you want them gone from the Sheet too.";
  }
  function hcDelNote() {
    if (!HCDEL.said) return "";
    return '<p id="hcDelSaid" style="margin:0 0 12px;padding:9px 12px;border:1px solid var(--gold,#D9A33B);' +
      'border-radius:9px;background:var(--card,#fff);color:var(--ink,#22303F);font-size:12.5px;line-height:1.6;">' +
      esc(HCDEL.said) +
      (HCDEL.last ? ' <button type="button" id="hcDelUndo" style="font:inherit;font-size:12px;font-weight:800;' +
        'cursor:pointer;border:1px solid var(--gold,#D9A33B);background:var(--card,#fff);color:var(--ink,#22303F);' +
        'border-radius:999px;padding:2px 12px;margin-left:8px;">' + esc(isEs() ? "Deshacer" : "Undo") + "</button>" : "") +
      "</p>";
  }
  function hcDisarm(repaint) {
    try { clearTimeout(HCDEL.t); } catch (e) {}
    if (!HCDEL.armed) return;
    HCDEL.armed = "";
    if (repaint) { try { paint(); } catch (e2) {} }
  }
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("#hcDelUndo")) {
      var n = 0;
      try { n = hcRestore(HCDEL.last || []); } catch (x) {}
      HCDEL.last = null;
      HCDEL.said = n
        ? (isEs() ? (n === 1 ? "Se devolvió 1 registro." : "Se devolvieron " + n + " registros.")
                  : (n === 1 ? "Put 1 check-in back." : "Put " + n + " check-ins back."))
        : (isEs() ? "No hay nada que devolver." : "Nothing to put back.");
      try { paint(); } catch (x2) {}
      return;
    }
    var b = t.closest(".hc-del");
    if (!b) { hcDisarm(true); return; }
    e.preventDefault(); e.stopPropagation();
    var k = b.getAttribute("data-hcdel");
    if (!k) return;
    if (HCDEL.armed === k) {
      hcDisarm(false);
      var took = [];
      try { took = hcRemove([k]) || []; } catch (x3) {}
      HCDEL.last = took.length ? took : null;
      HCDEL.said = took.length ? hcRemovedLine(took.length)
                               : (isEs() ? "No hay nada que quitar." : "Nothing to remove.");
      try { paint(); } catch (x4) {}
      return;
    }
    HCDEL.armed = k;
    try { clearTimeout(HCDEL.t); } catch (x5) {}
    HCDEL.t = setTimeout(function () { hcDisarm(true); }, 6000);
    try { paint(); } catch (x6) {}
  });

  function panelHtml() {
    var es = isEs();
    var all = [], s = store();
    codes().forEach(function (k) { (s.obs[k]||[]).forEach(function (r) { all.push(r); }); });
    all.sort(function (a, b) { return String(b.timestamp||"").localeCompare(String(a.timestamp||"")); });
    var shown = inLast(all, RANGE).filter(function (r) { return !ONLY || code(r.studentId) === ONLY; });
    var opts = classOptions();

    var list;
    if (!shown.length) {
      /* ⚠ THE EMPTY STATE NAMES THE THREE MOMENTS. It is the only place a
         teacher who has never seen this instrument finds out what it asks,
         and an empty state that says "no data" teaches nothing. The same
         call [[aog-three-moments]] made. And it says nothing about who has
         not answered - rule 4. */
      list = '<div class="hct-empty"><p class="hct-h">' + esc(es?"Todavía no hay registros de casa":"No home check-ins yet") + '</p>' +
        '<p class="hct-s" style="margin:0 0 10px;">' + esc(es
          ? "Cuando lleguen, cada uno cuenta un día en tres momentos que la escuela no puede ver:"
          : "Each one shares three moments of the day that school doesn’t see:") + '</p>' +
        '<div class="hct-3">' + MOMENTS.map(function (m) {
          return '<div><dt>' + esc(es?m.lbl[1]:m.lbl[0]) + '</dt><dd style="font-size:13.5px;font-weight:600;">' +
                 esc(es?m.hint.family[1]:m.hint.family[0]) + '</dd></div>';
        }).join("") + '</div>' +
        '<p class="hct-note" style="margin-top:12px;">' + esc(es
          ? "Nada aquí exige una respuesta. Una semana en silencio está perfectamente bien."
          : "No one has to answer. A quiet week is completely fine.") + '</p></div>';
    } else {
      list = shown.map(function (r) {
        var role = r.respondentRole === "student" ? "student" : "family";
        var who = role === "student" ? (es?"Estudiante":"Student") : (es?"Adulto en casa":"Grown-up at home");
        var cells = MOMENTS.map(function (m) {
          var k = r[m.id + "Key"] || "";
          var lab = k ? labelFor(m.id, k, role) : "";
          var skip = (!k || k === "na");
          return '<div><dt>' + esc(es?m.lbl[1]:m.lbl[0]) + '</dt><dd class="' + (skip?"skip":"") + '">' +
                 esc(skip ? (es?"No se registró":"Not noted") : lab) + '</dd></div>';
        }).join("");
        var helped = String(r.helped||"").split("|").map(function (x){ return x.trim(); }).filter(Boolean);
        return '<div class="hct-day">' +
          '<div class="hct-day-h"><span class="hct-code">' + esc(r.studentId||"") + '</span>' +
          hcDelBtn(hcKey(r.studentId, r)) +
          '<span class="hct-meta">' + [fdate(r.date), ftime(r.submitTime)].filter(Boolean).map(esc).join(" · ") + '</span>' +
          '<span class="hct-who">' + esc(who) + '</span>' +
          (r.followUp ? '<span class="hct-fu">' + esc(es?"Pidió contacto":"Asked to talk") + '</span>' : '') +
          '</div>' +
          '<div class="hct-3">' + cells + '</div>' +
          (helped.length ? '<p class="hct-note">' + helpedLine(helped, es) + '</p>' : '') +
          (r.note ? '<p class="hct-said">' + esc(r.note) + '</p>' : '') +
        '</div>';
      }).join("");
    }

    return '<div class="hct-wrap">' +
      /* ⚠ THE BUILDER MOVED TO Set up ▸ Distribute, where the other four live.
         It is NOT mirrored here: two builders for one link drift apart, and
         these ids are document-unique so two mounts would collide. What stays
         is the way in. */
      '<div class="hct-card">' +
        '<p class="hct-h">' + esc(es?"Repartir el registro de casa":"Hand out the home check-in") + '</p>' +
        '<p class="hct-s">' + esc(es
          ? "El generador de enlaces vive con los otros cuatro, en Configurar \u25b8 Repartir, para que todo se reparta desde un mismo lugar."
          : "You make this link in Set up ▸ Distribute, with all the others.") + '</p>' +
        '<button type="button" class="hct-btn" id="hctGoDist">' +
          esc(es?"Ir a Repartir \u25b8 Enlace del registro de casa":"Go to Distribute \u25b8 Home check-in link") + '</button>' +
      '</div>' +
      '<div class="hct-card">' +
        '<div class="hct-row" style="justify-content:space-between;">' +
          '<div><p class="hct-h" style="margin:0;">' + esc(es?"El resto del día":"The rest of the day") + '</p>' +
          '<p class="hct-s" style="margin:2px 0 0;">' + esc(es?"Lo que llegó de casa, lo más reciente primero.":"What came back from home, most recent first.") + '</p></div>' +
          '<div class="hct-row" style="margin:0;">' +
            '<select id="hctRange" aria-label="' + esc(es?"Periodo":"Range") + '">' +
              '<option value="1"' + (RANGE===1?" selected":"") + '>' + esc(es?"Hoy":"Today") + '</option>' +
              '<option value="7"' + (RANGE===7?" selected":"") + '>' + esc(es?"Últimos 7 días":"Last 7 days") + '</option>' +
              '<option value="30"' + (RANGE===30?" selected":"") + '>' + esc(es?"Últimos 30 días":"Last 30 days") + '</option>' +
            '</select>' +
            '<select id="hctOnly" aria-label="' + esc(es?"Estudiante":"Student") + '">' +
              '<option value="">' + esc(es?"Todos":"All students") + '</option>' +
              codes().map(function (k) { return '<option value="' + esc(k) + '"' + (ONLY===k?" selected":"") + '>' + esc(k) + '</option>'; }).join("") +
            '</select>' +
            '<button type="button" class="hct-btn alt" id="hctPull">' + esc(es?"Traer de la hoja":"Pull from sheet") + '</button>' +
          '</div>' +
        '</div>' +
        '<p class="small aog-pull-status" id="hctPullStatus" style="min-height:18px;margin:8px 0 12px;line-height:1.5;"></p>' +
        hcDelNote() +
        list +
        /* ⚠ WHAT THIS IS NOT, PRINTED ON THE SCREEN AND NOT FILED IN A
           DOCUMENT. §19's discipline, applied here. */
        '<p class="hct-note">' + esc(es
          ? "Esto es contexto, no una medición. No dice por qué pasó algo, no evalúa a la familia y no determina si una meta del IEP se cumplió. Una respuesta difícil no es una alerta."
          : "This is background, not a measurement. It doesn’t explain why things happened, judge a family, or decide whether an IEP goal is met. A hard answer is not an alarm.") + '</p>' +
      '</div>' +
    '</div>';
  }

  /* ═══════════════ THE LINK BUILDER, AS ITS OWN CARD
     ⚠ ONE MOUNT ONLY. hctClass / hctCode / hctRole / hctLink / hctCopy are
     document-unique ids; rendering this twice would collide and fail axe.
     If a second mount is ever wanted, give this an id prefix FIRST. */
  function linkCardHtml(es) {
    var opts = classOptions();
    return '<p class="hct-s" style="margin-top:0;">' + esc(es
        ? "Un enlace sirve para toda una clase: quien responde escribe el c\u00f3digo corto del estudiante, igual que en el registro diario. Tambi\u00e9n puedes hacer un enlace para un solo estudiante."
        : "One link works for a whole class \u2014 whoever answers types the student's short code, the same way they do on the daily check-in. You can also make a link for one student.") + '</p>' +
      '<div class="hct-row">' +
        '<div class="hct-f"><label for="hctClass">' + esc(es?"Clase":"Class") + '</label><select id="hctClass">' +
          '<option value="">' + esc(es?"Sin clase":"No class") + '</option>' +
          opts.map(function (k) { return '<option value="' + esc(k.classId||k.id) + '">' + esc(k.name) + '</option>'; }).join("") +
        '</select></div>' +
        '<div class="hct-f"><label for="hctCode">' + esc(es?"C\u00f3digo (opcional)":"Student code (optional)") + '</label>' +
          '<input class="hct-in" id="hctCode" type="text" maxlength="12" placeholder="' + esc(es?"toda la clase":"whole class") + '" style="text-transform:uppercase;width:160px;"></div>' +
        '<div class="hct-f"><label for="hctRole">' + esc(es?"Qui\u00e9n responde":"Who answers") + '</label><select id="hctRole">' +
          '<option value="">' + esc(es?"Preguntar en el enlace":"Ask on the link") + '</option>' +
          '<option value="student">' + esc(es?"El estudiante":"The student") + '</option>' +
          '<option value="family">' + esc(es?"Un adulto en casa":"A grown-up at home") + '</option>' +
        '</select></div>' +
        '<button type="button" class="hct-btn" id="hctCopy">' + esc(es?"Copiar enlace":"Copy link") + '</button>' +
      '</div>' +
      '<div class="hct-link" id="hctLink"></div>' +
      /* ⚠ SAY WHAT THE LINK DOES NOT CARRY, ON THE SCREEN. It traveled with
         the builder; a teacher about to text a link to a family should be able
         to read what they are sending, wherever the builder lives. */
      '<p class="hct-note">' + esc(es
        ? "El enlace lleva el c\u00f3digo corto y el contexto de la clase. No lleva el nombre del estudiante, ninguna meta, ning\u00fan diagn\u00f3stico, la direcci\u00f3n de la hoja ni ninguna contrase\u00f1a."
        : "The link carries the short code and the class context. It carries no student name, no goal, no diagnosis, no sheet address and no passcode.") + '</p>';
  }

  function wireLinkCard() {
    function refreshLink() { var L = el("hctLink"); if (L) L.textContent = buildLink() || "\u2014"; }
    ["hctClass","hctCode","hctRole"].forEach(function (id) {
      var e2 = el(id); if (!e2 || e2.__aogHcWired) return;
      e2.__aogHcWired = 1;
      e2.addEventListener("input", refreshLink);
      e2.addEventListener("change", refreshLink);
    });
    refreshLink();
    var cp = el("hctCopy");
    if (cp && !cp.__aogHcWired) {
      cp.__aogHcWired = 1;
      cp.addEventListener("click", function () {
        var url = buildLink(), es2 = isEs();
        function done() { cp.textContent = es2 ? "Copiado" : "Copied"; setTimeout(function () { cp.textContent = es2 ? "Copiar enlace" : "Copy link"; }, 1600); }
        try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(done, done); return; } } catch (e) {}
        try { var t = document.createElement("textarea"); t.value = url; document.body.appendChild(t);
          t.select(); document.execCommand("copy"); document.body.removeChild(t); done(); } catch (e2b) {}
      });
    }
  }

  /* ⚠ THE CARD GOES INTO #panel-distribute ITSELF, NOT INTO A PANE. The tab
     strip re-reads the panel's own children, groups them by .section-head and
     moves each group into its pane; a node appended straight into a pane is
     invisible to that grouping and would never move again. */
  function installDistCard() {
    if (el("aogHcLgCard")) return true;
    var panel = document.getElementById("panel-distribute");
    if (!panel) return false;
    var es = isEs();
    /* ⚠ tcss() normally runs from installTab(). A teacher who opens Set up
       without ever opening Check-ins ▸ Home would otherwise get this card
       with no stylesheet at all. */
    try { tcss(); } catch (e) {}
    var head = document.createElement("div");
    head.className = "section-head";
    head.innerHTML = '<h2>' + esc(es ? "Enlace del registro de casa" : "Home check-in link") + '</h2>';
    var card = document.createElement("div");
    card.id = "aogHcLgCard";
    card.className = "table-card";
    card.style.padding = "24px 28px";
    card.innerHTML = linkCardHtml(es);
    panel.appendChild(head);
    panel.appendChild(card);
    wireLinkCard();
    try { if (typeof window.__aogDistRebuild === "function") window.__aogDistRebuild(); } catch (e) {}
    return true;
  }

  /* ⚠ THE DASHBOARD LANGUAGE SWITCH DOES NOT TOUCH documentElement.lang, so a
     card built once sits there in the language it was born in. Hang on
     refreshAdmin, the hook six other blocks already use — and copy every
     __aog* flag off the function being wrapped, or the next wrapper undoes
     one of theirs. */
  function watchLang() {
    if (typeof window.refreshAdmin !== "function" || window.refreshAdmin.__aogHcDist) return;
    var orig = window.refreshAdmin;
    var wrapped = function () {
      var r = orig.apply(this, arguments);
      try {
        var c = el("aogHcLgCard");
        if (c) {
          var es = isEs();
          c.innerHTML = linkCardHtml(es);
          wireLinkCard();
          var hd = c.previousElementSibling;
          if (hd && hd.classList && hd.classList.contains("section-head")) {
            hd.innerHTML = '<h2>' + esc(es ? "Enlace del registro de casa" : "Home check-in link") + '</h2>';
          }
        }
      } catch (e) {}
      return r;
    };
    Object.keys(orig).forEach(function (k) { if (k.indexOf("__aog") === 0 && !wrapped[k]) wrapped[k] = orig[k]; });
    wrapped.__aogHcDist = 1;
    window.refreshAdmin = wrapped;
  }

  /* The way in, from the results screen to the place it is handed out. */
  function openDistribute() {
    try { localStorage.setItem("aog.dist.tab", "homeci"); } catch (e) {}
    try { if (typeof showScreen === "function") showScreen("screen-admin"); } catch (e) {}
    try { var d = document.querySelector('#dashModes .dmode[data-mode="setup"]'); if (d) d.click(); } catch (e) {}
    setTimeout(function () {
      try { var t = document.querySelector('#screen-admin .tab[data-tab="distribute"]'); if (t) t.click(); } catch (e) {}
      setTimeout(function () {
        try { installDistCard(); } catch (e) {}
        try { if (typeof window.__aogDistRebuild === "function") window.__aogDistRebuild(); } catch (e) {}
        try { var b = document.querySelector('#aogDistTabs button[data-t="homeci"]'); if (b) b.click(); } catch (e) {}
        try { var c = el("aogHcLgCard"); if (c && c.scrollIntoView) c.scrollIntoView({ block: "center" }); } catch (e) {}
      }, 340);
    }, 240);
  }

  function wirePanel() {
    var p = el("panel-homeci"); if (!p) return;
    var gd = el("hctGoDist");
    if (gd && !gd.__aogHcWired) { gd.__aogHcWired = 1; gd.addEventListener("click", openDistribute); }
    /* ⚠ The builder's wiring moved to wireLinkCard(), which the Distribute
       card owns. Nothing here binds hctCopy any more — a second binding on a
       control that now lives in another panel is how a copy button starts
       copying the wrong link. */
    var rg = el("hctRange");
    if (rg) rg.addEventListener("change", function () { RANGE = parseInt(rg.value, 10) || 7; paint(); });
    var on = el("hctOnly");
    if (on) on.addEventListener("change", function () { ONLY = code(on.value); paint(); });
    var pl = el("hctPull");
    if (pl) pl.addEventListener("click", function () {
      var st = el("hctPullStatus"), es = isEs();
      if (st) { st.textContent = es ? "Trayendo de la hoja…" : "Pulling from the sheet…"; st.style.color = "var(--ink-soft)"; }
      window.aogPullHomeCheckins().then(function (r) {
        var s2 = el("hctPullStatus"); if (!s2) return;
        if (r.ok) {
          s2.textContent = (es ? "Listo — " : "Done — ") + r.rows + (es ? " filas leídas, " : " rows read, ") + r.added + (es ? " nuevas." : " new.");
          s2.style.color = "var(--ink-soft)";
        } else if (r.why === "nokey") {
          s2.textContent = es ? "Esta computadora todavía no puede leer la hoja. Configurar ▸ Conectar y sincronizar, y pon tu ADMIN_PULL_KEY en el campo de contraseña."
                              : "This computer cannot read the sheet yet. Set up ▸ Connect & sync, and put your ADMIN_PULL_KEY in the passcode box.";
        } else if (r.why === "nodest") {
          s2.textContent = es ? "Todavía no hay una hoja conectada. Se conecta en Configurar ▸ Conectar y sincronizar."
                              : "No sheet is connected yet. Connect one under Set up ▸ Connect & sync.";
        } else if (r.why === "rejected") {
          /* ⚠ SAY WHAT FIXES IT. An older Apps Script answers 200 with nothing
             useful, and "something went wrong" sends a teacher looking in the
             wrong place for an hour. The same error the home observation and
             the exit-slip pull both had to learn to write. */
          s2.textContent = es ? "La hoja respondió pero no conoce HomeCheckins todavía. Vuelve a pegar el código de Apps Script y publica una versión nueva (Implementar ▸ Administrar implementaciones ▸ lápiz ▸ Nueva versión)."
                              : "The sheet answered but does not know HomeCheckins yet. Re-paste the Apps Script code and publish a new version (Deploy ▸ Manage deployments ▸ pencil ▸ New version).";
        } else {
          s2.textContent = es ? "No se pudo conectar. Nada se perdió." : "Could not reach the sheet. Nothing was lost.";
        }
      });
    });
  }

  function paint() {
    var p = el("panel-homeci"); if (!p) return;
    tcss();
    p.innerHTML = panelHtml();
    wirePanel();
  }

  /* ═════════════════════════════════════════ INSTALLING THE FOURTH TAB
     ⚠ THE TAB ROW'S CLICK HANDLER IS BOUND ONCE, AT LOAD, WITH
     $$(".tab").forEach(...). A tab button created later gets NO handler at
     all and looks like a dead control. So this block binds its own, doing
     exactly what that handler does - and nothing more, so the two can never
     disagree about what "active" means.

     ⚠ AND THE KEY IS "homeci", NOT "home". `home` is already the Students
     panel's tab (student: ['home'] in #aog-dash-modes-js) - reusing it would
     have pointed the Students door at this panel. */
  function installTab() {
    if (el("panel-homeci")) return true;
    var row = document.querySelector("#screen-admin .tabs");
    var host = document.querySelector("#screen-admin .tab-panel");
    if (!row || !host || !host.parentNode) return false;
    tcss();

    var b = document.createElement("button");
    b.className = "tab";
    b.setAttribute("data-tab", "homeci");
    b.setAttribute("data-dl", "dl_t_homeci");
    b.textContent = isEs() ? "Casa" : "Home";
    var more = row.querySelector(".tab-more-wrap");
    if (more) row.insertBefore(b, more); else row.appendChild(b);

    var p = document.createElement("div");
    p.className = "tab-panel";
    p.id = "panel-homeci";
    host.parentNode.appendChild(p);

    b.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (x) { x.classList.remove("active"); });
      document.querySelectorAll(".tab-panel").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      p.classList.add("active");
      try { if (typeof setTabHint === "function") setTabHint("homeci"); } catch (e) {}
      try { if (typeof setTabHelp === "function") setTabHelp("homeci"); } catch (e) {}
      paint();
      try { if (typeof refreshAdmin === "function") refreshAdmin(); } catch (e) {}
    });

    /* The door layer keeps MODES in a closure but exports the object itself.
       Adding the tab to voice here makes the runtime path work even on a
       build where the source-level MODES line has not been patched; when it
       HAS been patched this is a no-op, which is the point. */
    try {
      var DM = window.__aogDashModes;
      if (DM && DM.modes && DM.modes.voice && DM.modes.voice.indexOf("homeci") < 0) {
        DM.modes.voice.push("homeci");
        if (DM.apply) DM.apply(false);
      }
    } catch (e) {}

    /* Dictionary entries, registered the way every other tab's are. */
    try {
      if (typeof DASH_I18N !== "undefined") {
        DASH_I18N.dl_t_homeci = { en: "Home", es: "Casa" };
      }
      if (typeof TAB_HINTS !== "undefined") {
        TAB_HINTS.homeci = { en: "The morning before school, the afternoon after it, and how tonight went.",
                             es: "La mañana antes de la escuela, la tarde después y cómo fue esta noche." };
      }
      if (typeof TAB_HELP !== "undefined") {
        TAB_HELP.homeci = {
          en: "<h5>Home check-ins — the rest of the day</h5>School sees part of a day. This is a one-minute link a family adult <strong>or the student</strong> can answer at home about the <strong>morning</strong> before school, the <strong>afternoon</strong> after it, and how the <strong>evening</strong> is going. It is context, never a score, and every moment can be skipped.",
          es: "<h5>Registros de casa — el resto del día</h5>La escuela ve una parte del día. Este es un enlace de un minuto que un adulto en casa <strong>o el estudiante</strong> puede responder sobre la <strong>mañana</strong> antes de la escuela, la <strong>tarde</strong> después y cómo va la <strong>noche</strong>. Es contexto, nunca una puntuación, y cualquier momento se puede saltar."
        };
      }
    } catch (e) {}
    return true;
  }

  /* ══════════════════════════════════════════════════════════ THE WAY IN */
  window.AOGHomeCi = {
    link: linkFor, payload: payloadOf, decode: decodePayload,
    obs: obsFor, add: addObs, codes: codes, counted: counted, tally: tally,
    moments: MOMENTS, helped: HELPED,
    labelEn: labelEn, paint: paint,
    linkCard: linkCardHtml, wireLinkCard: wireLinkCard,
    installDistCard: installDistCard, openDistribute: openDistribute,
    open: function (cfg) { css(); openFromLink(cfg || {}); },
    pull: function () { return window.aogPullHomeCheckins(); },
    /* Per-student removal. `aog.home.checkin.v1` is not matched by PV_KEEP, so
       the full backup already contains it and privacyDeleteAll already removes
       it ([[aog-backup-symmetry]]). This is the ONE-STUDENT path, for the
       Remove-records screen to call once it is wired to it. */
    /* .30ea — per-entry removal. Same six rules as the exit slip, the
       check-in and the observations. removeStudent below is the blunt
       one-student path and is deliberately left as it was. */
    remove: hcRemove, restore: hcRestore, keysFor: hcKeysFor, removed: hcGoneList,
    KEYS: { obs: KEY, queue: QKEY, removed: HCGONE },
    removeStudent: function (sid) {
      var s = store(), k = code(sid);
      var had = (s.obs[k] || []).length;
      delete s.obs[k]; put(s);
      jsave(QKEY, queueGet().filter(function (r) { return code(r.studentId) !== k; }));
      try { paint(); } catch (e) {}
      return had;
    }
  };

  function init() {
    var p = fromUrl();
    if (p) { css(); openFromLink(p); return; }   /* a family's phone stops here */
    if (!installTab()) { setTimeout(installTab, 700); }
    /* Set up may not have been opened yet, so #panel-distribute can be absent
       at boot; retry the way installTab does, then stop asking. */
    if (!installDistCard()) { setTimeout(installDistCard, 900); setTimeout(installDistCard, 2600); setTimeout(installDistCard, 5200); }
    watchLang();
    setTimeout(watchLang, 1400);
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest && e.target.closest('.dmode[data-mode="voice"], .tab[data-tab="homeci"]');
      if (t) setTimeout(function () { installTab(); if (el("panel-homeci") && el("panel-homeci").classList.contains("active")) paint(); }, 260);
    });
    /* ⚠ THE DASHBOARD'S LANGUAGE SWITCH DOES NOT TOUCH documentElement.lang.
       JS-built text hangs on refreshAdmin, never on a lang observer - the
       .29l rule. The static markup outside the dashboard is the other case,
       and this block has none. */
    try {
      var f = window.refreshAdmin;
      if (typeof f === "function" && !f.__aogHomeCi) {
        var w = function () {
          var r = f.apply(this, arguments);
          try { if (el("panel-homeci") && el("panel-homeci").classList.contains("active")) paint(); } catch (e) {}
          return r;
        };
        /* ⚠ COPY EVERY __aog* KEY OFF THE FUNCTION YOU WRAP. Five other
           blocks wrap refreshAdmin and each guards on its own flag; a wrapper
           that drops them makes them wrap AGAIN on their next retry - the
           .29k double-card bug. */
        for (var k in f) { try { w[k] = f[k]; } catch (e) {} }
        w.__aogHomeCi = true;
        window.refreshAdmin = w;
      }
    } catch (e) {}
    try { flush(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 360); });
  else setTimeout(init, 360);
  setTimeout(function () { try { if (!el("screen-home-checkin") && !el("panel-homeci")) init(); } catch (e) {} }, 2400);

  /* ══════════════════════════════════════════════════════ THE FOUR CALLS
     Written down so they can be overruled on purpose rather than discovered
     by accident.

     1 · NO COLOR RAMP ON THE OPTIONS. "It was a rough start" is drawn
         exactly as "Up and out without much friction". A red dot on a hard
         morning is a deficit score in color form, and it is the same call
         the check-in's scale disc and the home observation both already
         made. To restore: color .hc-opt by data-k.

     2 · THE FOUR-CONTEXT STRIP IS NOT BUILT. Morning · School · Afternoon ·
         Evening on one line is the whole point of the architecture, and it is
         deliberately Phase 2: it needs a read across the check-in store, the
         exit-slip store and this one, and the handoff's own instruction is
         not to build the analytics first. When it is built it reads through
         AOGExitView and the check-in store, never by re-deriving either.

     3 · A SECOND ANSWER ON THE SAME DAY IS KEPT, NOT MERGED. A student and a
         grown-up describing one evening differently is the signal this
         instrument exists to produce. Neither is corrected against the other.

     4 · NOTHING HERE TOUCHES THE IEP. No goal is decorated, no aimline is
         drawn, no signal is derived. A student with goals and a student
         without get exactly the same instrument. [[aog-signed-iep-rule]] */
})();
