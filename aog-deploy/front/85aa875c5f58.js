
/* ═══════════════════════════════════════════════════════════════════════════
   STUDENT IN FOCUS · one remembered "who", read as a DEFAULT and nothing more
   Added 2026-08-30 — audit P1 (Website/AOG-Architecture-Audit-2026-08-30.md).

   The audit's one failed criterion was context retention: reading a student's
   report and then opening One-student-over-time or the IEP door meant finding
   the same child again by hand. This block remembers the last student an
   adult DELIBERATELY opened — a report unfolded, a picker picked, an IEP tab
   chosen — and the doors read it as their default selection.

   ⚠ A DEFAULT, NEVER A FILTER. Nothing is hidden, sorted, or excluded by this
   value; every door's own picker stays fully populated and one click undoes
   the default. A door adopts the focus only when it is FRESHER than that
   door's own last deliberate pick (focus `at` beats the door's `pickedAt`),
   so a focus can never wrestle a selection away from the person making it.

   ⚠ WRITTEN ONLY BY AN ADULT'S OWN ACT ON THIS DEVICE. A synced check-in, a
   Pull, a render must never move it: focus is a record of attention, and
   attention is not something this software infers. Do not add a write site
   that fires from data arriving.

   ⚠ SHORT-LIVED ON PURPOSE — eight hours, a school day. Yesterday's focus
   defaulting today's view would read as the software holding opinions about
   which student matters, which is exactly what this site promises not to do.

   Fails open everywhere. Deleting this block costs the defaults and breaks
   nothing else — the same contract as every block.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var KEY = "aog.student.focus";
  var TTL = 8 * 60 * 60 * 1000;
  function get() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!o || !o.code || !o.at) return null;
      if ((Date.now() - o.at) > TTL) return null;
      return o;
    } catch (e) { return null; }
  }
  window.AOGFocus = {
    get: get,
    code: function () { var o = get(); return o ? o.code : ""; },
    set: function (code, src) {
      var c = String(code == null ? "" : code).trim();
      if (!c) return;
      try { localStorage.setItem(KEY, JSON.stringify({ code: c, at: Date.now(), src: String(src || "") })); } catch (e) {}
    },
    clear: function () { try { localStorage.removeItem(KEY); } catch (e) {} }
  };
})();
