/* ══ AOG-DROPDOWNS-V1 (2026-09-26) — ONE MENU INSTEAD OF A WALL OF TABS ═════
   Jimmy, on the Educator Dashboard: "THERE IS TOO MUCH happening on these
   pages with the words and the tabs … We need drop down menus." The rows of
   section tabs and link buttons become one drop-down each. The old buttons
   stay in the page (tucked out of sight) and the menu simply presses them,
   so every screen keeps working exactly as before. The menu rebuilds itself
   whenever the dashboard shows or hides a tab. */
(function () {
  "use strict";
  var D = document;
  var ROWS = [
    { sel: "#screen-admin .container-wide > .tabs", en: "Section", es: "Sección" },
    { sel: "#aogDistTabs", en: "Which link?", es: "¿Qué enlace?", show: 1 },
    { sel: "#screen-admin .dash-roles-seg", en: "View as", es: "Ver como" },
    { sel: "#screen-admin .cps-bands", en: "Grade band", es: "Grados" },
    { sel: "#screen-admin .xv-range", en: "Show", es: "Mostrar" },
    { sel: "#aogIepPwBar", en: "Show", es: "Mostrar" }
  ];
  /* THE STANDING RULE (CLAUDE.md): any row of four or more section or tab
     choices is a drop-down. A new row opts in with one attribute:
       <div data-aog-dropdown="Label|Etiqueta"> <button>…</button> … </div> */
  function extra() {
    return Array.prototype.map.call(D.querySelectorAll("[data-aog-dropdown]"), function (el, i) {
      if (!el.id) el.id = "aogdd-auto-" + i;
      var l = (el.getAttribute("data-aog-dropdown") || "Choose|Elige").split("|");
      return { sel: "#" + el.id, en: l[0], es: l[1] || l[0], show: 1 };
    });
  }
  function es() { return /^es/i.test(D.documentElement.lang || ""); }
  function shown(el) {
    if (el.hidden || el.closest("[hidden]:not(.tab-more-menu)")) return false;
    return getComputedStyle(el).display !== "none";
  }
  function items(row) {
    var out = [];
    Array.prototype.forEach.call(row.children, function (k) {
      if (k.classList.contains("tab-more-wrap")) {
        k.querySelectorAll(".tab-more-menu button, .tab-more-menu a").forEach(function (m) { if (shown(m)) out.push(m); });
      } else if ((k.tagName === "BUTTON" || k.tagName === "A") && shown(k)) out.push(k);
    });
    return out;
  }
  function isOn(b) {
    return b.classList.contains("active") || b.classList.contains("on") ||
      b.getAttribute("aria-selected") === "true" || b.getAttribute("aria-pressed") === "true";
  }
  function build(cfg) {
    var row = D.querySelector(cfg.sel); if (!row) return;
    var box = row.__aogdd;
    if (!box) {
      box = D.createElement("label"); box.className = "aogdd no-print";
      box.innerHTML = '<span class="aogdd-lab"></span><select class="aogdd-sel"></select>';
      row.parentNode.insertBefore(box, row);
      row.classList.add("aogdd-src"); row.__aogdd = box;
      box.querySelector("select").addEventListener("change", function () {
        var b = (row.__aogddItems || [])[this.selectedIndex]; if (b) b.click();
        setTimeout(refresh, 60);
      });
    }
    var list = items(row); row.__aogddItems = list;
    var sel = box.querySelector("select"), html = "", on = -1;
    list.forEach(function (b, i) {
      var t = (b.childNodes.length && b.firstChild.nodeType === 3 ? b.firstChild.nodeValue : b.textContent).replace(/[▾▼]/g, "").replace(/\s+/g, " ").trim();
      html += "<option>" + t.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</option>";
      if (on < 0 && isOn(b)) on = i;
    });
    if (sel.__html !== html) { sel.innerHTML = html; sel.__html = html; }
    if (on >= 0) sel.selectedIndex = on;
    var lab = es() ? cfg.es : cfg.en;
    sel.setAttribute("aria-label", lab);
    /* a visible label only where the page has none of its own nearby */
    box.querySelector(".aogdd-lab").textContent = cfg.show ? lab : "";
    box.hidden = list.length < 2;
  }
  var t = 0;
  function refresh() { clearTimeout(t); t = setTimeout(function () { ROWS.concat(extra()).forEach(build); }, 40); }
  var css = D.createElement("style");
  css.textContent =
    ".aogdd-src{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important}" +
    ".aogdd{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0 14px;font:600 14px/1.3 Inter,system-ui,sans-serif}" +
    ".aogdd[hidden]{display:none}" +
    ".aogdd-lab:empty{display:none}.aogdd-lab{color:inherit;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;opacity:.8}" +
    ".aogdd-sel{min-height:44px;min-width:min(100%,280px);max-width:100%;padding:8px 38px 8px 14px;border-radius:12px;border:1.5px solid #C9A24A;" +
    "background:#FFFDF8 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237a5a12' stroke-width='2.4' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\") no-repeat right 12px center/16px;" +
    "color:#0A1E33;font:600 16px/1.3 Inter,system-ui,sans-serif;-webkit-appearance:none;appearance:none;cursor:pointer}" +
    ".aogdd .aogdd-sel{background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C9A24A' stroke-width='2.4' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")!important;background-repeat:no-repeat!important;background-position:right 12px center!important;background-size:16px!important;padding-right:38px!important}";
  function start() {
    D.head.appendChild(css); refresh();
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) { var n = list[i].target; if (n.closest && n.closest(".aogdd")) continue; refresh(); return; }
    }).observe(D.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "hidden", "style", "aria-selected"] });
    D.addEventListener("click", function () { setTimeout(refresh, 80); }, true);
    new MutationObserver(refresh).observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();
})();
