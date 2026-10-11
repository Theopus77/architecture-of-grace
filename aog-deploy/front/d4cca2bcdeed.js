
/* Forward-compatible hook for if/when the crosswalk + practitioner data is ever moved
   out of the inline page. Today the data is inline (already parsed at load), so this is
   a no-op readiness gate — the render functions stay synchronous so nothing breaks. */
(function () {
  window.AOG_DATA_READY = !!(window.AOG_CROSSWALK && window.AOG_SESSIONS);
  window.ensureAogData = function () {
    if (window.AOG_DATA_READY) return Promise.resolve();
    return new Promise(function (resolve) {
      if (window.AOG_CROSSWALK && window.AOG_SESSIONS) { window.AOG_DATA_READY = true; resolve(); }
      else { setTimeout(function () { window.AOG_DATA_READY = true; resolve(); }, 50); }
    });
  };
})();
