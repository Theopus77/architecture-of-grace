
(function () {
  window.AOG_FAITH_ENABLED = false;

  if (window.AOG_FAITH_ENABLED) return;

  /* 1. The Faith Companion overlay never opens, even from a stale link. */
  try {
    var realOpen = window.aogFaithOpen;
    window.AOG_FAITH_OPEN_REAL = realOpen;
    window.aogFaithOpen = function () { return false; };
  } catch (e) {}

  /* 2. Drop the Divine Blueprint shelf from the Resource Index catalog. Its
        group renders from this array, and an empty group is skipped already,
        so removing the category removes the whole "Faith track" tier too. */
  try {
    if (typeof RESOURCE_LIBRARY !== "undefined" && RESOURCE_LIBRARY && RESOURCE_LIBRARY.splice) {
      for (var i = RESOURCE_LIBRARY.length - 1; i >= 0; i--) {
        var c = RESOURCE_LIBRARY[i] && RESOURCE_LIBRARY[i].cat;
        if (c && /Divine Blueprint/i.test(c)) { RESOURCE_LIBRARY.splice(i, 1); }
      }
    }
  } catch (e) {}

  /* 3. Hide the entrances: the Start Here door, the ecosystem orbit door,
        the Christian crosswalk toggle and its panel. */
  var CSS = [
    '#screen-starthere .sh-card.faith',
    '[onclick*="aogFaithOpen"]',
    '.xa-faithbar', '#xaFaith', '.xa-faithnote'
  ].join(',') + '{display:none !important;}';
  try {
    var st = document.createElement("style");
    st.id = "aog-faith-off";
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  } catch (e) {}

  /* 4. Belt and braces: the crosswalk panel starts hidden behind a button, so
        make sure it is closed and cannot be reopened by a stale aria state. */
  function shut() {
    try {
      var f = document.getElementById("xaFaith");
      if (f) { f.setAttribute("hidden", ""); }
      var b = document.getElementById("xaFaithBtn");
      if (b) { b.setAttribute("aria-expanded", "false"); b.setAttribute("hidden", ""); }
    } catch (_e) {}
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", shut); }
  else { shut(); }
  setTimeout(shut, 600);
})();
