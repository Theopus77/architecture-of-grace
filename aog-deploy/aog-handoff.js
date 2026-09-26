/* ══ AOG-MUSIC-HANDOFF-V1 (2026-09-23) ════════════════════════════════════════
   A shelf the two music benches can both reach. Jimmy: "Can we hook up the drum
   sampler to these?" Two pages cannot share one audio engine — a browser gives
   each tab its own — so the drum machine BOUNCES its pattern to audio and leaves
   it here, and the Turntables pick it up and put it on a platter. Nothing goes
   near a network: this is IndexedDB, on this computer, in this browser.
   Anything left here is replaced by the next bounce. ═══════════════════════ */
(function (root) {
  "use strict";
  var DB = "aog-music", STORE = "handoff", VER = 1;

  function open() {
    return new Promise(function (ok, no) {
      if (!root.indexedDB) { no(new Error("no indexedDB")); return; }
      var r = root.indexedDB.open(DB, VER);
      r.onupgradeneeded = function () {
        var d = r.result;
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE);
      };
      r.onsuccess = function () { ok(r.result); };
      r.onerror = function () { no(r.error); };
    });
  }
  function put(key, val) {
    return open().then(function (db) {
      return new Promise(function (ok, no) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(val, key);
        tx.oncomplete = function () { db.close(); ok(true); };
        tx.onerror = function () { no(tx.error); };
      });
    }).then(function (v) { announce(key); return v; });
  }
  function get(key) {
    return open().then(function (db) {
      return new Promise(function (ok, no) {
        var tx = db.transaction(STORE, "readonly");
        var q = tx.objectStore(STORE).get(key);
        q.onsuccess = function () { db.close(); ok(q.result || null); };
        q.onerror = function () { no(q.error); };
      });
    }).catch(function () { return null; });
  }
  /* a tab already open hears about a new bounce at once */
  function announce(key) {
    try { new BroadcastChannel("aog-music").postMessage({ t: "handoff", key: key }); } catch (e) {}
  }
  function listen(fn) {
    try {
      var c = new BroadcastChannel("aog-music");
      c.onmessage = function (e) { if (e.data && e.data.t === "handoff") fn(e.data.key); };
      return c;
    } catch (e) { return null; }
  }
  root.AOGHandoff = { put: put, get: get, listen: listen };
})(typeof self !== "undefined" ? self : this);
