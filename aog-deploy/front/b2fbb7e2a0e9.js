
(function () {
  window.AOG_STARTHERE_EXTRAS_ENABLED = false;

  if (window.AOG_STARTHERE_EXTRAS_ENABLED) return;

  /* The role cards stay in the DOM so nothing else that looks them up breaks. */
  try {
    var st = document.createElement("style");
    st.id = "aog-starthere-extras-off";
    st.textContent = '#screen-starthere .sh-card.outside{display:none !important;}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) {}
})();
