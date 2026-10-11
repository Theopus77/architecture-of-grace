
(function () {
  window.AOG_TOUR_FAB_VISIBLE = false;
  if (window.AOG_TOUR_FAB_VISIBLE) return;
  try {
    var st = document.createElement("style");
    st.id = "aog-tour-off";
    st.textContent = '#tourFab,.tour-fab{display:none !important;}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) {}
})();
