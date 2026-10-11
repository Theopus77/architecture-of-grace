
/* ============================================================
   SYNC DIAGNOSTICS  ·  add ?diag=1 to any link to switch on
   Shows, on the phone itself, every step of the submission path.
   Never prints the passcode — only whether one was attached.
   ?diag=0 (or the Hide button) switches it back off.
   ============================================================ */
(function () {
  function want() {
    try {
      var q = new URLSearchParams(location.search).get("diag");
      if (q === "1") localStorage.setItem("aog.diag", "1");
      if (q === "0") localStorage.removeItem("aog.diag");
      return localStorage.getItem("aog.diag") === "1";
    } catch (e) { return false; }
  }
  if (!want()) return;

  var box = null;
  function fmt(r) {
    var d = r.detail;
    if (d && typeof d === "object") {
      d = Object.keys(d).map(function (k) { return k + "=" + d[k]; }).join("   ");
    }
    return r.t + "  " + r.step + (d ? "\n         " + d : "");
  }
  function btn(label, fn) {
    var b = document.createElement("button");
    b.textContent = label;
    b.style.cssText = "font:inherit;font-weight:700;background:#D9A33B;color:#0A1E33;border:0;border-radius:6px;padding:3px 9px;margin-left:6px;cursor:pointer;";
    b.onclick = fn;
    return b;
  }
  function ensure() {
    if (box && document.body.contains(box)) return box;
    box = document.createElement("div");
    box.id = "aogSyncDiag";
    box.style.cssText = "position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483000;max-height:46vh;overflow:auto;background:#0A1E33;color:#E8EEF7;font:11.5px/1.45 ui-monospace,Menlo,Consolas,monospace;border:1px solid #D9A33B;border-radius:10px;padding:10px 12px;box-shadow:0 6px 24px rgba(0,0,0,.35);-webkit-overflow-scrolling:touch;white-space:pre-wrap;word-break:break-word;";
    box.setAttribute("data-open", "0");
    var bar = document.createElement("div");
    bar.style.cssText = "display:flex;gap:8px;align-items:center;justify-content:space-between;margin:0 0 7px;";
    var t = document.createElement("strong");
    t.textContent = "SYNC DIAGNOSTICS";
    t.style.cssText = "color:#D9A33B;letter-spacing:.06em;";
    var btns = document.createElement("span");
    btns.appendChild(btn("Refresh", function () { snapshot(); }));
    btns.appendChild(btn("Copy", function () {
      var txt = (window.AOG_SYNC_LOG || []).map(fmt).join("\n");
      try { navigator.clipboard.writeText(txt); } catch (e) {}
    }));
    btns.appendChild(btn("Hide", function () {
      try { localStorage.removeItem("aog.diag"); } catch (e) {}
      if (box && box.parentNode) box.parentNode.removeChild(box);
    }));
    bar.appendChild(t); bar.appendChild(btns);
    box.appendChild(bar);
    var body = document.createElement("div");
    body.id = "aogSyncDiagBody";
    body.style.display = "none";
    box.appendChild(body);
    btns.insertBefore(btn("Open", function () {
      var open = box.getAttribute("data-open") === "1";
      box.setAttribute("data-open", open ? "0" : "1");
      body.style.display = open ? "none" : "";
      box.style.right = open ? "" : "8px";
      this.textContent = open ? "Open" : "Close";
      if (!open) window.aogSyncDiagRender();
    }), btns.firstChild);
    /* Collapsed by default: a chip in the corner, so nothing on the survey
       screen is ever covered. Tap Open to read the trace. */
    box.style.right = "";
    document.body.appendChild(box);
    return box;
  }
  window.aogSyncDiagRender = function () {
    try {
      if (!document.body) return;
      ensure();
      var b = document.getElementById("aogSyncDiagBody");
      if (!b) return;
      b.textContent = (window.AOG_SYNC_LOG || []).map(fmt).join("\n") || "waiting for a submission…";
      if (box.getAttribute("data-open") === "1") box.scrollTop = box.scrollHeight;
    } catch (e) {}
  };
  function ss(k) { try { return sessionStorage.getItem(k) || "(blank)"; } catch (e) { return "?"; } }
  function snapshot() {
    try {
      if (typeof window.aogApplySyncDefaults === "function") window.aogApplySyncDefaults();
    } catch (e) {}
    try {
      window.AOG_SYNC_LOG = window.AOG_SYNC_LOG || [];
      window.AOG_SYNC_LOG.push({
        t: new Date().toISOString().slice(11, 19),
        step: "0. launch state",
        detail: {
          syncFlag: ss("aog.launch.sync"),
          schoolId: ss("aog.launch.schoolId"),
          classId: ss("aog.launch.classId"),
          grade: ss("aog.launch.grade"),
          window: ss("aog.launch.window"),
          configFile: window.AOG_SYNC_DEFAULTS ? "loaded" : "NOT LOADED",
          linkDest: ss("aog.launch.dest") ? "carried by this link" : "none",
          ownWriteKey: (function () { try { return aogOwnWriteKey_() ? "set" : "not set"; } catch (e) { return "?"; } })(),
          destination: (typeof SCHOOL_SYNC_URL !== "undefined" && SCHOOL_SYNC_URL)
            ? ("set via " + (window.AOG_SYNC_SOURCE || "?")) : "MISSING",
          online: navigator.onLine ? "yes" : "no"
        }
      });
      window.aogSyncDiagRender();
    } catch (e) {}
  }
  function boot() { window.aogSyncDiagRender(); setTimeout(snapshot, 900); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
