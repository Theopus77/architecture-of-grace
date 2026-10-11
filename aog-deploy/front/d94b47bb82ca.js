
(function () {
  window.AOG_SYNC_SETUP_VISIBLE = true;   /* 2026-09-12, Jimmy: "reopen or unhide the sync code with the backend and admin codes and GS script information" — the Connect & sync pill is back for everyone. */

  /* The private way back in, for the one person who still sets this up. */
  var unlocked = false;
  try {
    if (/[?&]sync=1\b/.test(location.search)) { sessionStorage.setItem("aog.sync.setup.show", "1"); }
    unlocked = sessionStorage.getItem("aog.sync.setup.show") === "1";
  } catch (e) {}

  if (window.AOG_SYNC_SETUP_VISIBLE || unlocked) return;

  /* 1. The pill and its pane. Both are built at runtime by the aog.dist.tab
        module further down, so this is CSS — it does not matter who runs first. */
  try {
    var st = document.createElement("style");
    st.id = "aog-sync-setup-off";
    st.textContent = '#aogDistTabs button[data-t="connect"],#aogDistPane-connect{display:none !important;}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) {}

  /* 2. ⚠ A HIDDEN TAB CAN STILL BE THE SELECTED ONE. The module restores the
        last tab from aog.dist.tab, so a teacher who left it on Connect & sync
        would reopen to a hidden pane and an empty strip. Move the saved tab
        off it BEFORE the module reads it — this block runs first. */
  try {
    if (localStorage.getItem("aog.dist.tab") === "connect") {
      localStorage.setItem("aog.dist.tab", "checkin");
    }
  } catch (e) {}
})();
