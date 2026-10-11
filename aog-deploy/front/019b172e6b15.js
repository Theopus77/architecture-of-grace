
/* ============================================================================
   THE SCIENCE PULL CAN BE DELETED — AOG-PRACTICE-DEL-V1 (build .30ec).
   The sixth pulled source to get a tombstone list, and the last one that was
   missing it. Same contract as the exit slip's remove/restore: this module
   owns the store, hands back what it took so a caller can offer Undo, and is
   the only way a tombstone is written or lifted.
   ⚠ A ROW KEY MUST SURVIVE A RE-PULL, so it is built from what the Sheet
   itself carries — student, activity, date, set — never from an array index.
   ⚠ BOTH SPELLINGS OF A CODE, ALWAYS (the .30dj case hazard: one child became
   two entries because a compare picked one spelling). Only the compare is
   normalized; nothing stored is rewritten.
   ========================================================================= */
(function () {
  "use strict";
  var STORE = "aog.practice.remote";
  var PGONE = "aog.practice.removed.v1";

  function jload(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
  function jsave(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function code(x) { return String(x == null ? "" : x).trim().toUpperCase(); }
  function rows() { var a = jload(STORE, []); return (Object.prototype.toString.call(a) === "[object Array]") ? a : []; }

  function keyOf(r) {
    if (!r) return "";
    return [code(r.studentId), String(r.activityId || ""),
            String(r.date || r.timestamp || "").slice(0, 10),
            String(r.setNo == null ? "" : r.setNo)].join("|");
  }
  function goneList() { var a = jload(PGONE, []); return (a && a.slice) ? a.slice() : []; }
  function goneSet() { var o = {}; goneList().forEach(function (k) { o[String(k)] = 1; }); return o; }
  function goneSave(a) { jsave(PGONE, a.length > 4000 ? a.slice(a.length - 4000) : a); }

  /* the one function every reader on this dashboard goes through */
  function live(list) {
    var dead = goneSet();
    return (list || rows()).filter(function (r) { return !dead[keyOf(r)]; });
  }

  function keysFor(sid) {
    var want = code(sid), out = [];
    rows().forEach(function (r) { if (code(r && r.studentId) === want) out.push(keyOf(r)); });
    return out;
  }

  /* remove() hands back the rows it took, so a caller can offer Undo */
  function remove(keys) {
    var want = {}; (keys || []).forEach(function (k) { want[String(k)] = 1; });
    var took = [], kept = [];
    rows().forEach(function (r) { if (want[keyOf(r)]) took.push(r); else kept.push(r); });
    if (!took.length) return [];
    jsave(STORE, kept);
    var g = goneList();
    took.forEach(function (r) { var k = keyOf(r); if (g.indexOf(k) < 0) g.push(k); });
    goneSave(g);
    repaint();
    return took;
  }
  /* restore() is the ONLY way a tombstone is lifted */
  function restore(took) {
    if (!took || !took.length) return 0;
    var back = rows(), have = {};
    back.forEach(function (r) { have[keyOf(r)] = 1; });
    var dead = goneList(), lift = {};
    took.forEach(function (r) { var k = keyOf(r); lift[k] = 1; if (!have[k]) back.push(r); });
    jsave(STORE, back);
    goneSave(dead.filter(function (k) { return !lift[String(k)]; }));
    repaint();
    return took.length;
  }
  function repaint() {
    ["aogRenderPractice", "aogRenderPracticeChart", "aogRenderPracticePrintBar"].forEach(function (fn) {
      try { if (typeof window[fn] === "function") window[fn](); } catch (e) {}
    });
  }

  window.aogPracticeDel = {
    KEYS: { store: STORE, removed: PGONE },
    keyOf: keyOf, live: live, keysFor: keysFor,
    remove: remove, restore: restore, removed: goneList, repaint: repaint
  };
})();
