/* ══ AOG-CONN-KEEP-V1 (2026-09-25) — THE SHEET CONNECTION STAYS PUT ══════════
   Jimmy: "I have to reinstall the url to connect QUITE A BIT and I am not
   talking about when I need to redeploy the GS code."
   Nothing on the site erases aog.sync.url except Disconnect and Delete
   everything. The browser does:
   · Safari deletes a site's localStorage after 7 days without a visit (ITP);
   · architectureofgrace.org, architectureofgrace.netlify.app and every Netlify
     preview link are different sites to a browser, each with its own storage.
   So the connection now lives in three places — localStorage, IndexedDB and a
   cookie — and any one surviving puts the others back. And there is a restore
   link: #aog-connect=… carries the connection in the part of the URL that is
   never sent to a server; open it on any address, any browser, and the
   connection is back. Disconnect and Delete everything still clear all three:
   removing a sync key through localStorage clears the copies with it, and an
   eviction never calls removeItem, which is how the two are told apart.
   Must load BEFORE the page reads aog.sync.url. ══════════════════════════ */
(function () {
  "use strict";
  var KEYS = ["aog.sync.url", "aog.sync.key", "aog.sync.writekey"];
  var COOKIE = "aogconn", DB = "aog-keep", STORE = "kv";
  var ls; try { ls = window.localStorage; } catch (e) { return; }
  if (!ls) return;
  var rawSet = Storage.prototype.setItem, rawRemove = Storage.prototype.removeItem, rawClear = Storage.prototype.clear;

  function enc(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function dec(s) {
    try { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "=";
          return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch (e) { return null; }
  }
  function valid(o) { return o && typeof o.u === "string" && /^https:\/\/script\.google\.com\/.*\/exec$/.test(o.u); }
  function read() { var u = ls.getItem(KEYS[0]); return u ? { u: u, k: ls.getItem(KEYS[1]) || "", w: ls.getItem(KEYS[2]) || "" } : null; }
  function write(o) {
    rawSet.call(ls, KEYS[0], o.u);
    if (o.k) rawSet.call(ls, KEYS[1], o.k);
    if (o.w) rawSet.call(ls, KEYS[2], o.w);
  }
  function cookieGet() { var m = document.cookie.match(/(?:^|;\s*)aogconn=([^;]+)/); return m ? dec(m[1]) : null; }
  function cookieSet(o) {
    try { document.cookie = COOKIE + "=" + (o ? enc(o) : "") + ";path=/;max-age=" + (o ? 34560000 : 0) + ";SameSite=Strict" + (location.protocol === "https:" ? ";Secure" : ""); } catch (e) {}
  }
  function idb(fn) {
    try {
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(STORE); };
      r.onsuccess = function () { try { fn(r.result.transaction(STORE, "readwrite").objectStore(STORE)); } catch (e) {} };
    } catch (e) {}
  }
  function mirror(o) {
    cookieSet(o);
    idb(function (st) { if (o) st.put(o, "conn"); else st.delete("conn"); });
    if (o) try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}
  }

  /* Disconnect / Delete everything → the copies go too. */
  Storage.prototype.removeItem = function (k) {
    if (this === ls && k === KEYS[0]) mirror(null);
    return rawRemove.apply(this, arguments);
  };
  Storage.prototype.clear = function () { if (this === ls) mirror(null); return rawClear.apply(this, arguments); };
  /* Save connection → the copies follow. */
  Storage.prototype.setItem = function (k) {
    var r = rawSet.apply(this, arguments);
    if (this === ls && KEYS.indexOf(k) >= 0) { var o = read(); if (o) mirror(o); }
    return r;
  };

  var restored = "";
  /* 1 · a restore link wins */
  var m = location.hash.match(/[#&]aog-connect=([^&]+)/);
  if (m) {
    var o = dec(m[1]);
    if (valid(o)) { write(o); mirror(o); restored = "link"; }
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  }
  /* 2 · localStorage lost it, the cookie did not */
  if (!restored && !read()) {
    var c = cookieGet();
    if (valid(c)) { write(c); restored = "copy"; }
  }
  var now = read();
  if (now) mirror(now);
  /* 3 · both lost it, IndexedDB did not: put it back and reload once */
  if (!now) idb(function (st) {
    var q = st.get("conn");
    q.onsuccess = function () {
      var o = q.result;
      if (!valid(o) || read()) return;
      write(o); cookieSet(o);
      try { if (!sessionStorage.getItem("aog.keep.reloaded")) { sessionStorage.setItem("aog.keep.reloaded", "1"); location.reload(); } } catch (e) {}
    };
  });

  /* The restore link, for the dashboard's button */
  window.aogConnRestoreLink = function () {
    var o = read(); if (!o) return "";
    return location.origin + "/#aog-connect=" + enc(o);
  };
  window.aogConnCopyRestoreLink = function (btn) {
    var link = window.aogConnRestoreLink();
    var es = (document.documentElement.lang || "").indexOf("es") === 0;
    if (!link) { alert(es ? "Primero guarda la conexión." : "Save the connection first."); return; }
    function done(ok) {
      if (!btn) return;
      var old = btn.getAttribute("data-label") || btn.textContent;
      btn.setAttribute("data-label", old);
      btn.textContent = ok ? (es ? "Copiado — guárdalo en marcadores o en tus notas" : "Copied — keep it in your bookmarks or notes") : link;
      setTimeout(function () { btn.textContent = old; }, 4000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(function () { done(true); }, function () { prompt("Copy this link:", link); });
    else prompt("Copy this link:", link);
  };
  if (restored === "link") {
    document.addEventListener("DOMContentLoaded", function () {
      var d = document.createElement("div");
      d.setAttribute("role", "status");
      d.textContent = "Sheet connection restored on this browser.";
      d.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99999;background:#2E6B3A;color:#fff;padding:10px 16px;border-radius:10px;font:600 14px system-ui,sans-serif;box-shadow:0 6px 18px #0005";
      document.body.appendChild(d);
      setTimeout(function () { d.remove(); }, 5000);
    });
  }
})();
