
(function () {
  window.AOG_DASH_ROLES_ENABLED = true;   /* 2026-09-12, Jimmy: "unhide the teacher, specialist and admin view" - the Viewing-as picker and all five roles are back. */
  if (window.AOG_DASH_ROLES_ENABLED) return;

  /* 1. Pin the role BEFORE the dashboard's own init() reads it — that runs on
        DOMContentLoaded, this block runs during parse, so a device left on
        Parent or Leadership comes back as Teacher. */
  try { localStorage.setItem("aog.dash.role", "teacher"); } catch (e) {}

  /* 2. Hide the picker in both of its forms: the wide segmented row and the
        narrow "Viewing as: X ▾" button with its menu. */
  try {
    var st = document.createElement("style");
    st.id = "aog-dash-roles-off";
    st.textContent = '#dashRoles,.dash-roles,.dash-role-compact,#dashRoleCompactMenu{display:none !important;}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) {}

  /* 3. ⚠ THE SETTER IS A GLOBAL AND OTHER CODE CALLS IT. Hiding the buttons
        does not stop aogSetDashRole('parent') from a stale handler or an old
        deep link, and paint() would then strip the teacher's tabs with no
        visible way to get them back. Wrap it: any role in, teacher out. */
  function pin() {
    try {
      var real = window.aogSetDashRole;
      if (typeof real !== "function" || real.__aogPinned) return;
      var w = function () { return real.call(this, "teacher"); };
      w.__aogPinned = true;
      window.aogSetDashRole = w;
    } catch (e) {}
  }
  pin();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pin);
  setTimeout(pin, 400);
})();
