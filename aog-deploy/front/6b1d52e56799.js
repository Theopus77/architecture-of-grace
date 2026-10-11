
(function () {
  function card() { return document.getElementById("qsCard") || document.querySelector(".qs-card"); }
  function apply(collapsed) {
    var c = card(); if (!c) return;
    c.classList.toggle("qs-collapsed", collapsed);
    var b = c.querySelector(".qs-toggle");
    if (b) { b.setAttribute("aria-expanded", String(!collapsed)); var tx = b.querySelector(".qs-toggle-tx"); if (tx) { var es = document.documentElement.getAttribute("lang") === "es"; tx.textContent = collapsed ? (es ? "Mostrar" : "Show") : (es ? "Ocultar" : "Hide"); } }
  }
  window.aogQsToggle = function () { var c = card(); if (!c) return; var now = !c.classList.contains("qs-collapsed"); try { localStorage.setItem("aog.qs.collapsed", now ? "1" : "0"); } catch (e) {} apply(now); };
  /* Reveal the 4-step walkthrough card (called from the Quick tour). Session-only:
     the card goes back into hiding on the next load. */
  window.aogQsShow = function () { var c = card(); if (!c) return; c.removeAttribute("hidden"); c.style.display = ""; apply(false); };
  function init() {
    var c = card(); if (!c) return;
    var help = document.getElementById("tabHelp");
    var tabs = document.querySelector("#screen-admin .tabs");
    var anchor = help || tabs;
    if (anchor && anchor.parentNode) { anchor.parentNode.insertBefore(c, anchor.nextSibling); }
    var col = true; try { if (localStorage.getItem("aog.qs.collapsed") === "0") col = false; } catch (e) {}
    apply(col);
    var HIDE = { trajectory: 1, goals: 1, daily: 1, export: 1 };
    function vis() { var t = document.querySelector("#screen-admin .tab.active"); var name = t ? t.getAttribute("data-tab") : ""; c.style.display = HIDE[name] ? "none" : ""; }
    vis();
    var tb = document.querySelectorAll("#screen-admin .tab");
    Array.prototype.forEach.call(tb, function (b) { b.addEventListener("click", function () { setTimeout(vis, 0); }); });
  }
  if (document.readyState !== "loading") init(); else document.addEventListener("DOMContentLoaded", init);
})();
