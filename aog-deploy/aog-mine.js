/* ══ AOG-MINE-V1 (2026-09-25) — WHAT I SENT, KEPT ON MY OWN DEVICE ═══════════
   Jimmy: "There is nothing on Student area in the DASHBOARD. The student /
   individual should be able to access their material in here as well."
   Every activity posts its result to the Sheet and keeps nothing, so a
   learner's own device could never show them their own work. This watches
   those posts (every activity page sends the same JSON: action "checkin") and
   keeps a copy in localStorage "aog.practice.mine" — the same row shape the
   Sheet stores, minus the write key. It never sends anything anywhere.
   The Inbox and My Blueprint read it beside rows pulled from the Sheet. ══ */
(function () {
  "use strict";
  if (window.__aogMine || !window.fetch) return;
  window.__aogMine = 1;
  var KEY = "aog.practice.mine", MAX = 800;
  function keep(p) {
    try {
      if (!p || p.action !== "checkin" || p.checkinType !== "practice" || !p.studentId) return;
      var row = {};
      for (var k in p) if (k !== "_backendAuth" && k !== "action") row[k] = p[k];
      if (typeof row.extra === "string" && row.extra.length > 20000) row.extra = "";
      row.timestamp = row.timestamp || new Date().toISOString();
      row.mine = true;
      var all = JSON.parse(localStorage.getItem(KEY) || "[]");
      var id = row.studentId + "|" + row.timestamp + "|" + (row.activityId || "");
      for (var i = 0; i < all.length; i++) if ((all[i].studentId + "|" + all[i].timestamp + "|" + (all[i].activityId || "")) === id) return;
      all.push(row);
      while (all.length > MAX) all.shift();
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch (e) {}
  }
  var raw = window.fetch;
  window.fetch = function (url, opts) {
    try {
      var u = typeof url === "string" ? url : (url && url.url) || "";
      if (opts && /post/i.test(opts.method || "") && /script\.google(usercontent)?\.com\//.test(u) && typeof opts.body === "string" && opts.body.charAt(0) === "{")
        keep(JSON.parse(opts.body));
    } catch (e) {}
    return raw.apply(this, arguments);
  };
})();
