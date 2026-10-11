
(function () {
  window.AOG_DASH_FULL = true;   /* 2026-09-12, Jimmy: "unhide ... the MTTS data information" - the MTSS Report button, the Trends door, My classes, IEP Progress, Goal Builder and the Reflection tab are back. */
  if (window.AOG_DASH_FULL) return;

  var CSS = [
    '#screen-admin .tab[data-tab="reflect"]',  '#panel-reflect',
    '#screen-admin .tab[data-tab="classes"]',  '#panel-classes',
    '#screen-admin .tab[data-tab="iep"]',      '#panel-iep',
    '#screen-admin .tab[data-tab="goals"]',    '#panel-goals',
    '#screen-admin .tab[data-tab="homeci"]',   '#panel-homeci',
    '#dashModes .dmode[data-mode="trends"]',
    '[onclick*="aogOpenMTSS"]'
  ].join(',') + '{display:none !important;}';
  try {
    var st = document.createElement("style");
    st.id = "aog-dash-trim-off";
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  } catch (e) {}

  /* ⚠ A HIDDEN DOOR CAN STILL BE THE SAVED ONE (the .30lf lesson). A computer
     left in the Trends door would reopen to a hidden button and its tabs. */
  try {
    if (localStorage.getItem("aog.dash.mode") === "trends") {
      localStorage.setItem("aog.dash.mode", "myclass");
    }
  } catch (e) {}

  /* ⚠ THE TAB AND MODE SETTERS ARE GLOBALS OTHER CODE CALLS — hiding a button
     does not stop aogQsTab("reflect") from a stale link, and the panel would
     open with nothing visible around it. Send those calls somewhere real.
     (The .30le lesson: wrap the setter, do not trust the buttons.) */
  /* ⚠ "home" and "homeci" are DIFFERENT TABS: home = Student view (kept),
     homeci = the Home check-in (hidden). Swapping homeci -> home is correct;
     swapping home would hide the one tab this door opens on. */
  var SWAP = { reflect: "home", classes: "distribute", iep: "home",
               goals: "home", homeci: "home" };
  function pin() {
    try {
      var qt = window.aogQsTab;
      if (typeof qt === "function" && !qt.__aogTrim) {
        var w1 = function (t) { return qt.call(this, SWAP[t] || t); };
        w1.__aogTrim = true; window.aogQsTab = w1;
      }
      var sm = window.aogSetDashMode;
      if (typeof sm === "function" && !sm.__aogTrim) {
        var w2 = function (m) { return sm.call(this, m === "trends" ? "myclass" : m); };
        w2.__aogTrim = true; window.aogSetDashMode = w2;
      }
    } catch (e) {}
  }
  pin();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pin);
  setTimeout(pin, 400);
})();
