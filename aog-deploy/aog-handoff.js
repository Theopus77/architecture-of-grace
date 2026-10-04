/* ══ AOG-MUSIC-HANDOFF-V1 (2026-09-23) ════════════════════════════════════════
   A shelf the two music benches can both reach. Jimmy: "Can we hook up the drum
   sampler to these?" Two pages cannot share one audio engine — a browser gives
   each tab its own — so the drum machine BOUNCES its pattern to audio and leaves
   it here, and the Turntables pick it up and put it on a platter. Nothing goes
   near a network: this is IndexedDB, on this computer, in this browser.
   Anything left here is replaced by the next bounce.

   AOG-STUDIO-INBOX-V1 (2026-10-04) — Jimmy: "All the instruments should be able
   to record and send their tracks over to the STUDIO." A shelf holds one thing;
   a LIST holds many. The Studio's inbox ("studioinbox") is a list: every take
   sent to it waits there, two guitar takes beside a bass take and a drum take.
     add(list, take, {max, key})  a take joins the list, newest first. It may
                                  carry a .wav (a Blob). At most `max` stay
                                  (16 for the inbox); the oldest makes room, and
                                  the list remembers which ones went, so the
                                  Studio can say so. A take with the same `key`
                                  as one already there replaces it (a second
                                  press of Send is not a second take).
     list(list)                   {items, gone}: what waits there, newest first,
                                  without the audio; and what was pushed out.
     item(list, id)               one take, with its audio.
     remove(list, id)             one take, out of the list.
   How it is kept: each take is one record ("studioinbox/<id>") and the list's
   small index is another ("studioinbox"); both are written in one transaction,
   so two tabs sending at once never lose a take. The same database, store and
   version as the shelves: a page with the older copy of this file still reads
   every shelf, and put/get/listen work exactly as before. A change to a list is
   announced under the list's name, like a shelf's. ═══════════════════════════ */
(function (root) {
  "use strict";
  var DB = "aog-music", STORE = "handoff", VER = 1;
  var INBOX = "studioinbox", INBOX_MAX = 16, GONE_MAX = 8;

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

  /* ── AOG-STUDIO-INBOX-V1: lists ── */
  function binary(v) {
    return (typeof Blob !== "undefined" && v instanceof Blob) || (typeof ArrayBuffer !== "undefined" && (v instanceof ArrayBuffer || ArrayBuffer.isView(v)));
  }
  /* what the index keeps of a take: everything but its audio */
  function metaOf(item) {
    var m = {}, k;
    for (k in item) if (Object.prototype.hasOwnProperty.call(item, k) && !binary(item[k])) m[k] = item[k];
    return m;
  }
  function cleanIndex(ix) {
    var ok = function (x) { return x && typeof x === "object" && typeof x.id === "string" && x.id; };
    var items = ix && Array.isArray(ix.items) ? ix.items.filter(ok) : [];
    var gone = ix && Array.isArray(ix.gone) ? ix.gone.filter(ok) : [];
    return { v: 1, items: items, gone: gone };
  }
  function newId() { return "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function rec(list, id) { return list + "/" + id; }
  /* one transaction, so the take and the index always agree */
  function change(list, fn) {
    return open().then(function (db) {
      return new Promise(function (ok, no) {
        var tx, out;
        try { tx = db.transaction(STORE, "readwrite"); } catch (e) { db.close(); no(e); return; }
        var st = tx.objectStore(STORE), q = st.get(list);
        q.onsuccess = function () {
          var ix = cleanIndex(q.result);
          try { out = fn(ix, st); } catch (e) { try { tx.abort(); } catch (e2) {} return; }
          st.put(ix, list);
        };
        tx.oncomplete = function () { db.close(); ok(out); };
        /* a failed write aborts the whole transaction: the take and the index stay as they were */
        tx.onabort = function () { db.close(); no(tx.error || new Error("aborted")); };
      });
    }).then(function (v) { announce(list); return v; });
  }
  function add(list, val, opts) {
    opts = opts || {};
    var max = Math.max(1, Math.floor(opts.max || (list === INBOX ? INBOX_MAX : 16)));
    var item = {}, k;
    for (k in val) if (Object.prototype.hasOwnProperty.call(val, k)) item[k] = val[k];
    item.id = newId(); item.sent = Date.now();
    if (opts.key != null) item.key = String(opts.key);
    var meta = metaOf(item);
    return change(list, function (ix, st) {
      var gone = [];
      /* the same take sent again takes the place of the first send */
      if (item.key) ix.items = ix.items.filter(function (x) { if (x.key === item.key) { st.delete(rec(list, x.id)); return false; } return true; });
      st.put(item, rec(list, item.id));
      ix.items.unshift(meta);
      while (ix.items.length > max) { var old = ix.items.pop(); st.delete(rec(list, old.id)); old.goneAt = item.sent; gone.push(old); }
      if (gone.length) ix.gone = gone.concat(ix.gone).slice(0, GONE_MAX);
      return { id: item.id, sent: item.sent, gone: gone };
    });
  }
  function list(name) {
    return get(name).then(function (ix) { ix = cleanIndex(ix); return { items: ix.items, gone: ix.gone }; });
  }
  function item(name, id) {
    if (typeof id !== "string" || !id) return Promise.resolve(null);
    return get(rec(name, id));
  }
  /* taking one out also clears the note about takes that were pushed out: the list has room again */
  function remove(name, id) {
    return change(name, function (ix, st) {
      var had = ix.items.some(function (x) { return x.id === id; });
      ix.items = ix.items.filter(function (x) { return x.id !== id; });
      st.delete(rec(name, id));
      ix.gone = [];
      return had;
    });
  }
  root.AOGHandoff = { put: put, get: get, listen: listen, add: add, list: list, item: item, remove: remove, INBOX: INBOX, INBOX_MAX: INBOX_MAX };
})(typeof self !== "undefined" ? self : this);
