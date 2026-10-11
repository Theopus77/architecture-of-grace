
(function () {
  window.AOG_STORE_ENABLED = false;

  if (window.AOG_STORE_ENABLED) return;

  /* 1. Any link left pointing at the Store lands on the Library instead —
        which is where the previews and sample lessons live anyway. Covers the
        ecosystem doors, "Browse the Store", old bookmarks and the #store hash. */
  try {
    var realGoStore = window.aogGoStore;
    window.aogGoStore = function () {
      if (typeof window.aogGoLibrary === "function") return window.aogGoLibrary();
      if (typeof window.showScreen === "function") return window.showScreen("screen-library");
      if (typeof realGoStore === "function") return realGoStore();
    };
  } catch (e) {}

  /* 2. Hide the commerce chrome: the Explore menu item, the cart, Buy buttons. */
  var CSS = [
    '#aogCartBtn', '#aogCartDrawer', '#aogCartOverlay',
    '.exnav-menu a[onclick*="aogGoStore"]',
    '.topbar-actions > a[onclick*="aogGoStore"]',
    '[onclick*="aogOpenCart"]',
    '[onclick*="aogStoreScrollBrowse"]',
    /* \u26a0 2026-09-09: an onclick is not the only way in. Anything whose
       href ENDS at the store hash goes too \u2014 the utility-bar cart icon,
       footer links, and any stale deep link a bookmark still carries. */
    'a[href$="#store"]', 'a[href$="#store"] *',
    '.uic[href*="#store"]',
    '.lp-buy'
  ].join(',') + '{display:none !important;}';
  try {
    var st = document.createElement("style");
    st.id = "aog-store-off";
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  } catch (e) {}

  /* 2b. THE HASH IS A DOOR TOO. #store still routed into the Store screen and
        left "#store" sitting in the address bar to be re-shared. Rewrite it to
        the Library before the router ever reads it, and again on every change. */
  function guardHash() {
    try {
      if ((location.hash || "").replace(/^#/, "").split("?")[0].toLowerCase() === "store") {
        if (history && history.replaceState) {
          history.replaceState(null, "", location.pathname + location.search + "#library");
        } else { location.hash = "#library"; }
        if (typeof window.aogGoLibrary === "function") window.aogGoLibrary();
      }
    } catch (e) {}
  }
  guardHash();
  try { window.addEventListener("hashchange", guardHash); } catch (e) {}

  /* 3. Relabel the one button whose text names the Store, so it matches where
        it now goes. Re-runs after language switches, which repaint labels. */
  function relabel() {
    try {
      var es = (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es";
      /* \u26a0 2026-09-09: the i18n pass repaints this button AFTER the switch
         runs, so relabeling alone put "Browse the Store" back on the glass.
         The string itself is now the Library (lp_b_b, and the markup); this
         only holds the line if an older cached copy repaints. */
      document.querySelectorAll('[data-i18n="lp_b_b"]').forEach(function (b) {
        b.textContent = es ? "Explorar la biblioteca" : "Browse the Library";
      });
      var e = document.getElementById("exNavMenu");
      if (e) {
        var s = e.querySelector('a[onclick*="aogGoStore"]');
        if (s) { s.setAttribute("hidden", "hidden"); }
      }
    } catch (_e) {}
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", relabel);
  } else { relabel(); }
  setTimeout(relabel, 600);
  try {
    document.addEventListener("click", function (ev) {
      if (ev.target && ev.target.closest && ev.target.closest(".lang-toggle")) setTimeout(relabel, 60);
    }, true);
  } catch (_e) {}
})();
