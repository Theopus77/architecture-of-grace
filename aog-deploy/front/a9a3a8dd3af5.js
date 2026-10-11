
(function () {
  window.AOG_DIST_FULL_STRIP = false;
  if (window.AOG_DIST_FULL_STRIP) return;

  try {
    var st = document.createElement("style");
    st.id = "aog-dist-trim-off";
    st.textContent = [
      '#aogDistMoments',
      '#aogDistTabs button[data-t="reflection"]',
      '#aogDistPane-reflection',
      /* 2026-09-09, Jimmy: "I just want to be able to use the check-in slips,
         the exit slips, and the team check-ins at the moment. and the my
         voice" — so the strip keeps checkin, exitslip, support and thisisme.
         The practice and home links still WORK; only the row that hands out a
         new one is hidden, and the Practice dashboard tab is untouched. */
      /* 2026-09-12, Jimmy: "the PRACTICE ... DISTRIBUTE ... is hidden" - the
         Student practice page pill is back (it is the only builder that stamps a
         Sheet onto a Daily Drafts or activity link). Home check-in stays hidden. */
      '#aogDistTabs button[data-t="homeci"]',   '#aogDistPane-homeci'
    ].join(',') + '{display:none !important;}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) {}

  /* ⚠⚠ THE HIDDEN PILL IS ALSO THE DEFAULT ONE. Two ways a device ends up
     selecting it, and the guard must cover BOTH:
       · it is SAVED (a computer parked on it) — the .30lb trap; and
       · NOTHING is saved, because the strip falls back to TABS[0], which is
         reflection. A brand-new device therefore opened the strip with the
         self-reflection hint above an EMPTY panel. Caught by rendering with
         a fresh browser profile — a saved-value test passes right over it.
     Written before the dist-tabs module reads the value. */
  try {
    var cur = localStorage.getItem("aog.dist.tab");
    if (!cur || cur === "reflection" || cur === "practice" || cur === "homeci") {
      localStorage.setItem("aog.dist.tab", "checkin");
    }
  } catch (e) {}
})();
