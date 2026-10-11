
(function () {
  window.AOG_STARTHERE_VISIBLE = false;
  if (window.AOG_STARTHERE_VISIBLE) return;
  try {
    var st = document.createElement("style");
    st.id = "aog-starthere-off";
    st.textContent = [
      '.exnav-start',
      '#startHereNavBtn',
      '.exnav-menu a[href="#starthere"]',
      '.aogtop-menu a[href="/#starthere"]'
    ].join(',') + '{display:none !important;}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) {}
})();
