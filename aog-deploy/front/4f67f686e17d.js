
/* ═══════════════════════════════════════════════════════════════════════════
   ONE STUDENT, ONE IDENTITY · the resolver every stream can agree on
   Build 2026.08.29aw.

   Jimmy asked what a substantially more capable model would find in all of this.
   It found one thing: A STUDENT HAS NO IDENTITY IN THIS SYSTEM. There is a typed
   string, five times, and a hope.

   #aog-iep-evidence joins an IEP goal to the evidence streams with
   `var sid = code(g.student)` and an exact match. The goal form taught
   `e.g., J.R.`; the check-in teaches `initials and a number, like JR14`. THE TWO
   ENDS OF THE JOIN TAUGHT INCOMPATIBLE FORMATS - and a miss returned an empty
   string, which renders exactly like a child with no evidence. A false negative
   wearing the clothes of a finding, and no suite can catch it because nothing
   is broken.

   ⚠ THIS BLOCK ONLY EVER READS. It never writes a code, never repairs a goal,
   never renames anything and never touches aog.iep.v1. It answers three
   questions - what codes exist, is this one of them, what looks close - and
   every screen decides for itself. A resolver that quietly rewrote records
   would be a worse bug than the one it exists to surface.

   ⚠ AND IT NEVER CHANGES CASE ON DISK. aog.population.v1 uppercases its member
   codes and the check-in store does not, which is what .29h's lowercase
   Print/Share bug was made of. Matching runs on a NORMALIZED COPY; the spelling
   handed back is always the one that is stored.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── AOG-SID-PURE-START ──────────────────────────────────────────────────
     No DOM, no storage, no clock between these markers. Slice it into a vm and
     it runs in node, the same way the IEP pure region below does.
     ⚠ AND DO NOT NAME ANOTHER MODULE'S MARKER IN PROSE. This comment used to
     spell the IEP region's start marker out in full, which put a SECOND copy of
     that literal earlier in the file than the real one - and t104 finds its
     region with indexOf, so it sliced from here and threw on a build with
     nothing wrong with it. A marker is an API. [[aog-deploy]] */

  /* "J.R." -> "JR" · "jr 14" -> "JR14" · "A-104" -> "A104"
     ⚠ FOR COMPARISON ONLY. Never stored, never displayed, never written back
     over what a teacher typed. */
  function norm(s) {
    return String(s == null ? "" : s).toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  /* What might be the same child, best first, at most three.
     ⚠ A SUGGESTION IS A QUESTION AND NEVER A CORRECTION. JR1 and JR14 can be
     two real students in one building, so this offers and never decides - the
     same rule the colleague count already keeps: a count is a proposal, never
     a measurement. [[aog-colleague-link]] */
  function near(target, list) {
    var t = norm(target), same = [], pre = [];
    if (!t || t.length < 2) return [];
    (list || []).forEach(function (c) {
      var n = norm(c);
      if (!n) return;
      /* punctuation-only difference - the J.R. / JR case, highest confidence */
      if (n === t) { if (String(c) !== String(target)) same.push(c); return; }
      /* one is the start of the other - the J.R. / JR14 case */
      if (n.indexOf(t) === 0 || t.indexOf(n) === 0) pre.push(c);
    });
    pre.sort(function (a, b) { return norm(a).length - norm(b).length; });
    /* ⚠ AN EXACT MATCH AFTER NORMALIZING IS AN ANSWER, AND WEAKER CANDIDATES
       BESIDE IT ARE AN INVITATION TO PICK THE WRONG ONE. t114 caught this: jr14
       was being offered JR14 and JR1 together. When the punctuation-or-case-only
       match exists it IS the list. */
    return same.length ? same.slice(0, 3) : pre.slice(0, 3);
  }
  /* ── AOG-SID-PURE-END ──────────────────────────────────────────────────── */

  function jload(k) {
    try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; }
  }

  /* ⚠ THREE STORES SHARE ONE SHAPE and the exit-slip block says so in its own
     words: { logs: { CODE: { date: [ rec ] } } }. One loop, not three copies of
     one loop that can drift apart. */
  var LOGSTORES = ["aog.checkin.student.v1", "aog.exit.v1", "aog.daily.v1"];

  /* A render pass asks this once per goal card. Twenty-four goals used to mean
     seventy-two JSON.parse calls of the whole check-in store for one screen, so
     a burst shares one scan. Short enough that a check-in logged in another tab
     shows up on the next look. */
  var CACHE = null, CACHE_AT = 0, TTL = 1500;

  function codes() {
    var now = (new Date()).getTime();
    if (CACHE && (now - CACHE_AT) < TTL) return CACHE;
    var seen = {}, out = [];
    function add(c) {
      var s = String(c == null ? "" : c).trim();
      if (!s || seen[s]) return;
      seen[s] = 1; out.push(s);
    }
    /* ⚠ EVERY SOURCE FAILS OPEN ON ITS OWN. One store holding unparseable JSON
       must not cost the other four - a resolver that throws is a resolver that
       silently turns every code unknown, which is the original bug with a
       louder voice. */
    LOGSTORES.forEach(function (k) {
      try { Object.keys((jload(k) || {}).logs || {}).forEach(add); } catch (e) {}
    });
    /* the class lists a teacher built in August */
    try {
      (window.AOGPop.classes() || []).forEach(function (c) {
        (c && c.members || []).forEach(add);
      });
    } catch (e) {}
    /* the home check-in keeps its own store and exports its own enumerator */
    try { (window.AOGHomeCi.codes() || []).forEach(add); } catch (e) {}
    out.sort();
    CACHE = out; CACHE_AT = now;
    return out;
  }

  function known(c) {
    var t = norm(c);
    if (!t) return false;
    var list = codes();
    for (var i = 0; i < list.length; i++) if (norm(list[i]) === t) return true;
    return false;
  }

  /* DAYS, not rows - the grain the restore panel already uses when it says what
     is inside a backup. A suggestion is only worth answering if it says what is
     behind it. */
  function countsFor(c) {
    var t = norm(c), out = { checkin: 0, exit: 0, daily: 0 };
    var name = { "aog.checkin.student.v1": "checkin", "aog.exit.v1": "exit", "aog.daily.v1": "daily" };
    LOGSTORES.forEach(function (k) {
      try {
        var logs = (jload(k) || {}).logs || {};
        Object.keys(logs).forEach(function (id) {
          if (norm(id) !== t) return;
          out[name[k]] += Object.keys(logs[id] || {}).length;
        });
      } catch (e) {}
    });
    return out;
  }

  function forget() { CACHE = null; CACHE_AT = 0; }

  window.AOGStudent = {
    norm: norm, near: near, codes: codes, known: known,
    counts: countsFor, forget: forget, stores: LOGSTORES
  };
})();
