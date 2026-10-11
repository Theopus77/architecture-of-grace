
/* ══════════════════════════════════════════════════════════════════════════
   AOG-GS-FILENAME-V1 — a downloaded script that says which one it is.

   The file on the server keeps its plain name (AoG-Sheet-Sync-Code.gs) so
   nothing that links to it breaks; the `download` ATTRIBUTE renames it on the
   way to the disk. Same bytes, honest filename.

   ⚠ THE NUMBER COMES FROM window.AOG_GS_VERSION (the sync module's EXPECTED),
   never from a literal here — two copies of a version number is how it went
   stale the first time. If the module has not booted yet the link is left
   exactly as it was, which downloads correctly under the old name rather than
   under a WRONG version, and the next pass stamps it.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  function stamp() {
    var v = null;
    try { v = window.AOG_GS_VERSION; } catch (e) {}
    if (!v && v !== 0) return false;                 /* say nothing over guess */
    var a = document.querySelectorAll("a.aogcfg-gsdl");
    if (!a.length) return false;
    for (var i = 0; i < a.length; i++) {
      var el = a[i];
      if (el.getAttribute("data-gsv") === String(v)) continue;
      el.setAttribute("download", "AoG-Sheet-Sync-Code-v" + v + ".gs");
      el.setAttribute("data-gsv", String(v));
      /* say it on the page too — the version you are about to save */
      var t = el.textContent.replace(/\s*\(v\d+\)\s*$/, "");
      el.textContent = t + " (v" + v + ")";
      el.setAttribute("title", "Saves as AoG-Sheet-Sync-Code-v" + v + ".gs");
    }
    return true;
  }
  if (!stamp()) {
    var n = 0, t = setInterval(function () {
      if (stamp() || ++n > 40) clearInterval(t);
    }, 250);
  }
  /* the config card is rebuilt on tab switches, so re-stamp after a click */
  document.addEventListener("click", function () { setTimeout(stamp, 260); }, false);
})();
