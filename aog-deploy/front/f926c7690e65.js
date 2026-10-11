
/* ══ AOG-PRINT-HOLD ══ see _work/topbar/p_iosprint.py for the whole story.
   window.print() BLOCKS on a desktop and DOES NOT ON iOS. Every in-place
   print here used to empty its host 400 ms after calling print(); on an iPad
   that deleted the sheet before iOS had drawn the preview, so the teacher
   got the right page count and blank paper.

   ⚠⚠ ARM IT BEFORE print(), NEVER AFTER. On a desktop `afterprint` fires
   while print() is still blocking, so a listener added afterwards never
   hears it and the title would sit mutated until the next click.

   ⚠ THE FLOOR IS NOT DECORATION. iOS fires visibilitychange when the share
   sheet APPEARS; without a floor that is read as "printing is over" and we
   are back to wiping the sheet mid-print.

   ⚠ LEAVING THE SHEET IN THE HOST COSTS NOTHING — #printReport is
   display:none off paper. The restore is about the tab's title and
   tidiness, never about safety. */
(function () {
  "use strict";
  var FLOOR = 1500, BACKSTOP = 120000, pending = null, mq = null;
  try { mq = window.matchMedia ? window.matchMedia("print") : null; } catch (e) {}
  function drop(p) {
    if (!p) return;
    try { clearTimeout(p.floorT); } catch (e) {}
    try { clearTimeout(p.backT); } catch (e) {}
    try { window.removeEventListener("afterprint", p.onEnd); } catch (e) {}
    try { window.removeEventListener("focus", p.onLate, true); } catch (e) {}
    try { document.removeEventListener("visibilitychange", p.onLate, true); } catch (e) {}
    try { document.removeEventListener("pointerdown", p.onLate, true); } catch (e) {}
    try { document.removeEventListener("keydown", p.onLate, true); } catch (e) {}
    if (mq && p.onMq) {
      try { mq.removeEventListener ? mq.removeEventListener("change", p.onMq) : mq.removeListener(p.onMq); } catch (e) {}
    }
  }
  window.aogPrintHold = function (restore) {
    /* A second print owns the cleanup now. The old restore is DROPPED, not
       run: it would empty the host the new sheet was just written into. */
    drop(pending); pending = null;
    var p = { armed: false };
    function finish() {
      if (pending !== p) return;
      pending = null; drop(p);
      try { restore(); } catch (e) {}
    }
    p.onEnd  = finish;
    p.onLate = function () { if (p.armed) finish(); };
    p.onMq   = function (ev) { if (!ev.matches) finish(); };
    pending = p;
    try { window.addEventListener("afterprint", p.onEnd); } catch (e) {}
    try { window.addEventListener("focus", p.onLate, true); } catch (e) {}
    try { document.addEventListener("visibilitychange", p.onLate, true); } catch (e) {}
    try { document.addEventListener("pointerdown", p.onLate, true); } catch (e) {}
    try { document.addEventListener("keydown", p.onLate, true); } catch (e) {}
    if (mq) {
      try { mq.addEventListener ? mq.addEventListener("change", p.onMq) : mq.addListener(p.onMq); } catch (e) {}
    }
    p.floorT = setTimeout(function () { p.armed = true; }, FLOOR);
    p.backT  = setTimeout(finish, BACKSTOP);
  };
})();
