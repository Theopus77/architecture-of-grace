
/* ═══════════════════════════════════════════════════════════════════════════
   WHICH SCHOOL YEAR A DATE BELONGS TO · one rule, one home
   Build 2026.08.29ax.

   Every store was an undifferentiated stream of ISO dates: no record knew
   which school year it belonged to, so the longitudinal reading — year over
   year, archive and roll forward, a student's third year of data — had no
   substrate, and August's rollover is where a caseload silently becomes a
   mess. From this build on, every evidence record is stamped at write time
   with the school year its OWN date falls in. July 1 is the boundary:
   2026-07-01 through 2027-06-30 is "2026-27".

   ⚠ STAMPED, NEVER READ BACK YET. Nothing renders, filters, or rolls over on
   this field today — a filter that always matches is noise. It exists so the
   longitudinal chapter is possible later at low cost. An ABSENT year means
   written before .29ax and nothing else; legacy records get a meaning, not a
   repair, the same way legacy points without src did.

   ⚠ EVERY WRITE SITE FAILS OPEN. Callers ask
   `window.AOGYear ? AOGYear(d) : ""`. Deleting this block costs new records
   their stamp and breaks nothing else — the same contract as every block.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  window.AOGYear = function (iso) {
    var m = /^(\d{4})-(\d{2})/.exec(String(iso || ""));
    if (!m) return "";
    var y = +m[1];
    if (+m[2] < 7) y -= 1;  /* Jan–Jun belong to the year that began the previous fall */
    return y + "-" + ("0" + ((y + 1) % 100)).slice(-2);
  };
})();
