
/* ===== Recovering from a half-downloaded page =========================
   This document is ~3.5 MB. On a weak school Wi-Fi, or mid-deploy, the
   browser can receive a truncated copy — and the service worker will
   cache that truncated copy without noticing. Every visit afterwards is
   then a blank page, with no way out from inside the browser: on iOS the
   only cure is Settings > Safari > Advanced > Website Data. A student who
   hits that just sees white and gives up.

   The last line of <body> sets window.__AOG_DOC_END. If it is missing
   shortly after load, the document did not arrive whole — so drop every
   cache, unregister the worker, and reload. Exactly once per tab, so a
   genuine failure can never become a reload loop; if the second attempt
   is also short, say so in plain words instead of showing nothing.
   ===================================================================== */
(function(){
  var KEY = "aog.heal.v1";
  function tried(){ try{ return sessionStorage.getItem(KEY) === "1"; }catch(e){ return false; } }
  function mark(){ try{ sessionStorage.setItem(KEY, "1"); }catch(e){} }

  function purgeAndReload(){
    mark();
    var went = false;
    var go = function(){ if (went) return; went = true; try{ location.reload(); }catch(e){} };
    try{
      var jobs = [];
      if (window.caches && caches.keys){
        jobs.push(caches.keys().then(function(names){
          return Promise.all(names.map(function(n){ return caches.delete(n); }));
        }));
      }
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations){
        jobs.push(navigator.serviceWorker.getRegistrations().then(function(regs){
          return Promise.all(regs.map(function(r){ return r.unregister(); }));
        }));
      }
      if (!jobs.length) return go();
      Promise.all(jobs).then(go, go);
      setTimeout(go, 3000);
    }catch(e){ go(); }
  }

  function sayItPlainly(){
    try{
      var d = document.createElement("div");
      d.setAttribute("style", "position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;"
        + "justify-content:center;background:#FCF8F0;color:#0A1E33;"
        + "font:16px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:28px;text-align:center;");
      d.innerHTML = '<div style="max-width:22em">'
        + '<div style="font-size:19px;font-weight:700;margin-bottom:10px">This page didn\u2019t finish loading.</div>'
        + '<p style="margin:0 0 18px;color:#46506E">It is usually the connection. Tap below to try again.</p>'
        + '<button type="button" id="aogHealRetry" style="font:inherit;font-weight:700;background:#0A1E33;color:#fff;'
        + 'border:0;border-radius:10px;padding:12px 22px;cursor:pointer">Try again</button>'
        + '<p style="margin:16px 0 0;font-size:13px;color:#8A92A6">Still blank? On iPhone: Settings \u203a Safari \u203a Advanced \u203a Website Data, and remove architectureofgrace.com.</p>'
        + '</div>';
      document.body.appendChild(d);
      var btn = document.getElementById("aogHealRetry");
      if (btn) btn.addEventListener("click", function(){
        try{ sessionStorage.removeItem(KEY); }catch(e){}
        purgeAndReload();
      });
    }catch(e){}
  }

  /* An auto-reload is only ever safe if we can be certain we will remember
     having done it. With cookies blocked or Private Browsing on, sessionStorage
     throws, tried() is false forever, and a page that genuinely cannot load
     would reload itself endlessly — a worse failure than the one being fixed.
     So: reload only when storage works AND this is not already a reload. In
     every other case say so plainly; the button below does the same repair,
     under the reader's control. */
  function canRemember(){
    try{ sessionStorage.setItem("aog.t", "1"); sessionStorage.removeItem("aog.t"); return true; }
    catch(e){ return false; }
  }
  function isReload(){
    try{ var n = performance.getEntriesByType("navigation")[0];
         return !!(n && n.type === "reload"); }catch(e){ return false; }
  }
  function check(){
    if (window.__AOG_DOC_END) return;          // the document arrived whole
    if (tried() || isReload() || !canRemember()) return sayItPlainly();
    purgeAndReload();
  }
  window.addEventListener("load", function(){ setTimeout(check, 1200); });
  /* "load" never fires if the response was cut mid-resource, so back it up. */
  setTimeout(function(){ if (document.readyState !== "loading") check(); }, 8000);
})();
