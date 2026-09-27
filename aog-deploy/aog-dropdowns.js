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
    { sel: "#screen-admin .cps-bands", en: "Grade band", es: "Grados" },
    { sel: "#screen-admin .xv-range", en: "Show", es: "Mostrar" },
    { sel: "#aogIepPwBar", en: "Show", es: "Mostrar" }
  ];
  /* THE STANDING RULE (CLAUDE.md): any row of four or more section or tab
     choices is a drop-down. A new row opts in with one attribute:
       <div data-aog-dropdown="Label|Etiqueta"> <button>…</button> … </div> */
  /* any row of more than six name chips (e.g. the exit-slip student filter) becomes a menu */
  function chipRows() {
    var out = [];
    D.querySelectorAll("#screen-admin div, #screen-admin span").forEach(function (el) {
      if (el.__aogChip || el.classList.contains("aogdd-src") || el.closest(".aogdd, .aogtop")) return;
      var bs = Array.prototype.filter.call(el.children, function (k) { return k.tagName === "BUTTON"; });
      if (bs.length < 7 || bs.length !== el.children.length) return;
      if (!/^(everyone|todos|all)$/i.test((bs[0].textContent || "").trim())) return;
      el.__aogChip = 1; if (!el.id) el.id = "aogdd-chip-" + out.length + "-" + Math.random().toString(36).slice(2, 6);
      el.setAttribute("data-aog-dropdown", "Student|Estudiante");
    });
    return out;
  }
  function extra() {
    try { chipRows(); } catch (e) {}
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
    var sel = box.querySelector("select"), html = "", on = -1, grp = null;
    list.forEach(function (b, i) {
      var t = (b.childNodes.length && b.firstChild.nodeType === 3 ? b.firstChild.nodeValue : b.textContent).replace(/[▾▼]/g, "").replace(/\s+/g, " ").trim();
      /* a button may name its group (data-aog-group); the menu then shows the groups as headings */
      var g = b.getAttribute("data-aog-group");
      if (g && g !== grp) { html += (grp ? "</optgroup>" : "") + '<optgroup label="' + g.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;") + '">'; grp = g; }
      html += "<option>" + t.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</option>";
      if (on < 0 && isOn(b)) on = i;
    });
    if (grp) html += "</optgroup>";
    if (sel.__html !== html) { sel.innerHTML = html; sel.__html = html; }
    if (on >= 0) sel.selectedIndex = on;
    var lab = es() ? cfg.es : cfg.en;
    sel.setAttribute("aria-label", lab);
    /* a visible label only where the page has none of its own nearby */
    box.querySelector(".aogdd-lab").textContent = lab;
    box.hidden = list.length < 2;
  }
  var t = 0;
  function refresh() { if (t) return; t = setTimeout(function () { t = 0; try { ROWS.concat(extra()).forEach(function (r) { try { build(r); } catch (e) {} }); } catch (e) {} try { demoBar(); } catch (e) {} try { iepPick(); } catch (e) {} try { gsBar(); } catch (e) {} try { practiceFilter(); } catch (e) {} }, 40); }
  var css = D.createElement("style");
  css.textContent =
    ".aogdd-src{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important}" +
    ".aogdd{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0 14px;font:600 14px/1.3 Inter,system-ui,sans-serif}" +
    ".aogdd[hidden]{display:none}" +
    ".aogdd-gs{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;margin:-4px 0 14px;font:600 14px/1.3 Inter,system-ui,sans-serif;color:#F4EEE2}" +
    ".aogdd-gsb{display:inline-flex;align-items:center;min-height:40px;padding:0 14px;border-radius:999px;border:1.5px solid #C9A24A;background:transparent;color:#F2C964;text-decoration:none;font:700 14px/1 Inter,system-ui,sans-serif;cursor:pointer}" +
    ".aogdd-demo{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 14px}.aogdd-demo[hidden]{display:none}" +
    ".aogdd-demo-btn{min-height:44px;padding:0 18px;border-radius:999px;border:2px solid #1E1F22;background:#C9A24A;color:#0A1E33;font:700 15px/1 Inter,system-ui,sans-serif;cursor:pointer}" +
    ".aogdd-demo-tx{font:500 14px/1.4 Inter,system-ui,sans-serif;color:#15202E}html[data-theme=dark] .aogdd-demo-tx{color:#F4EEE2}" +
    ".aogdd-lab:empty{display:none}.aogdd-lab{color:inherit;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;opacity:.8;flex:0 0 7.5em;min-width:7.5em}" +
    ".aogdd .aogdd-sel{flex:0 1 280px}" +
    ".aogdd-sel{min-height:44px;min-width:min(100%,280px);max-width:100%;padding:8px 38px 8px 14px;border-radius:12px;border:1.5px solid #C9A24A;" +
    "background:#FFFDF8 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237a5a12' stroke-width='2.4' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\") no-repeat right 12px center/16px;" +
    "color:#0A1E33;font:600 16px/1.3 Inter,system-ui,sans-serif;-webkit-appearance:none;appearance:none;cursor:pointer}" +
    ".aogdd .aogdd-sel{background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C9A24A' stroke-width='2.4' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")!important;background-repeat:no-repeat!important;background-position:right 12px center!important;background-size:16px!important;padding-right:38px!important}";
  /* AOG-DEMO-IN-CHECKINS-V1 (2026-09-26) — Jimmy: "DEMO DATA should go into the
     student check-in page that produces that amazing data." The header's Demo
     menu steps aside; on Student Check-ins a clear button presses the same
     Try demo data / Clear demo data switch (real records are stashed and come
     back on Clear, exactly as before). */
  function demoBar() {
    var real = D.getElementById("btnDemoData"); if (!real) return;
    var wrap = D.getElementById("aogDemoWrap"); if (wrap) wrap.style.display = "none";
    /* AOG-DEMO-TOP-V1 (2026-09-26) — Jimmy: "The demo data tool should be up by the MTSS Report
       and school sync." One button in the header, on every tab. */
    var bar = D.getElementById("aogDemoBar");
    if (!bar) {
      var anchor = D.getElementById("aogDemoWrap") || D.querySelector("#dashHero .admin-actions");
      if (!anchor) return;
      bar = D.createElement("span"); bar.id = "aogDemoBar"; bar.className = "aogdd-demo-top no-print";
      bar.innerHTML = '<button type="button" class="btn btn-sm aogdd-demo-btn"></button><span class="aogdd-demo-tx" hidden></span>';
      anchor.parentNode.insertBefore(bar, anchor);
      bar.querySelector("button").addEventListener("click", function () { real.click(); setTimeout(demoBar, 120); });
      var st = D.createElement("style");
      st.textContent = ".aogdd-demo-top .aogdd-demo-btn{background:transparent!important;border:1.5px solid #F2C964!important;color:#F2C964!important;font-weight:800;min-height:40px;border-radius:999px;padding:0 14px}";
      D.head.appendChild(st);
    }
    var isOn = /clear/i.test(real.textContent || "");
    bar.querySelector("button").textContent = isOn ? (es() ? "Quitar los datos de demostración" : "Clear demo data")
                                                    : (es() ? "Probar con datos de demostración" : "Try demo data");
    bar.querySelector(".aogdd-demo-tx").textContent = isOn
      ? (es() ? "Estás viendo estudiantes de ejemplo. Tus datos reales vuelven al quitar la demostración." : "You are seeing sample students. Your real data comes back when you clear the demo.")
      : (es() ? "Llena esta página con estudiantes de ejemplo para ver cómo se ve." : "Fill this page with sample students to see what it can show.");
  }

  /* AOG-IEP-PICK-V1 (2026-09-26) — Jimmy: "The student list needs to be in a drop
     down … the two names blend in", and pulled check-ins gave him nothing to act
     on. The IEP tab strip becomes one menu: every student with a goal, then every
     student the pulled check-ins and practice know who has no goal yet — pick one
     of those and a new goal opens already filled in with their code. */
  function jl(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  function dataStudents() {
    var seen = {};
    function add(v) { v = String(v || "").trim(); if (v && v.length < 40 && !/\((test|home)\)$/.test(v) && !/·|^(Mr|Mrs|Ms|Dr|Coach|Parent)\b/.test(v)) seen[v] = 1; }
    ["aog.checkin.remote", "aog.practice.remote", "aogScreener.v2.results", "aog.checkin.student.v1", "aog.practice.mine"].forEach(function (k) {
      var v = jl(k); if (!v) return;
      var arr = Array.isArray(v) ? v : (v.rows || v.records || v.items || Object.keys(v.students || {}).map(function (x) { return { studentId: x }; }));
      (arr || []).forEach(function (r) { if (r) add(r.studentId || r.student || r.code || r.sid || r.name); });
    });
    return Object.keys(seen).sort();
  }
  function iepPick() {
    var strip = Array.prototype.filter.call(D.querySelectorAll(".iep-tabs"), function (x) { return x.getClientRects().length || x.classList.contains("aogdd-src"); })
      .filter(function (x) { var p = x.parentNode; return p && p.getClientRects().length; })[0];
    if (!strip) return;
    var tabs = Array.prototype.slice.call(strip.querySelectorAll("button.iep-tab"));
    var have = tabs.map(function (b) { return (b.childNodes[0] && b.childNodes[0].nodeValue || b.textContent).trim(); });
    var extra = dataStudents().filter(function (n) { return have.indexOf(n) < 0; });
    var sig = have.join("|") + "#" + extra.join("|") + "#" + tabs.map(function (b) { return b.getAttribute("aria-selected"); }).join();
    if (strip.__aogSig === sig) return; strip.__aogSig = sig;
    var box = strip.previousElementSibling && strip.previousElementSibling.classList.contains("aogdd-iep") ? strip.previousElementSibling : null;
    if (!box) { box = D.createElement("label"); box.className = "aogdd aogdd-iep no-print"; box.innerHTML = '<span class="aogdd-lab"></span><select class="aogdd-sel"></select>'; strip.parentNode.insertBefore(box, strip); }
    strip.classList.add("aogdd-src");
    box.querySelector(".aogdd-lab").textContent = es() ? "Estudiante" : "Student";
    var sel = box.querySelector("select"), h = "", on = 0;
    function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    h += '<optgroup label="' + (es() ? "Con metas" : "With IEP goals") + '">';
    tabs.forEach(function (b, i) {
      var n = b.querySelector(".n"); var c = n ? " · " + n.textContent + (es() ? " metas" : " goals") : "";
      var att = b.querySelector(".fu") ? (es() ? " · necesita atención" : " · needs attention") : "";
      h += '<option value="t' + i + '">' + esc(have[i] + c + att) + "</option>";
      if (b.getAttribute("aria-selected") === "true") on = i;
    });
    h += "</optgroup>";
    if (extra.length) {
      h += '<optgroup label="' + (es() ? "Con datos, sin meta todavía — elige para crear una" : "Have check-in data, no goal yet — pick to start one") + '">';
      extra.forEach(function (n) { h += '<option value="n' + esc(n) + '">＋ ' + esc(n) + "</option>"; });
      h += "</optgroup>";
    }
    sel.innerHTML = h; sel.selectedIndex = on;
    sel.onchange = function () {
      var v = sel.value;
      if (v.charAt(0) === "t") { var b = tabs[+v.slice(1)]; if (b) b.click(); }
      else if (window.aogIepWizFor) window.aogIepWizFor(v.slice(1));
      setTimeout(refresh, 80);
    };
  }
  /* AOG-GS-BAR-V1 (2026-09-26) — Jimmy: "Put the GS code more out there with the
     ones I just referenced." Under Which link?, one bar: the Sheet script and its
     one-page setup guide, and a way to the connection page. */
  function gsBar() {
    var dd = D.querySelector('#screen-admin select[aria-label="Which link?"], #screen-admin select[aria-label="¿Qué enlace?"]');
    if (!dd) return;
    var box = dd.closest(".aogdd"); if (!box) return;
    var bar = D.getElementById("aogGsBar");
    if (!bar) {
      bar = D.createElement("div"); bar.id = "aogGsBar"; bar.className = "aogdd-gs no-print";
      box.parentNode.insertBefore(bar, box.nextSibling);
    }
    var h = es() ? ['Tu Hoja de Google:', 'Descargar Code.gs', 'Guía de una página', 'Conectar y sincronizar →']
                 : ['Your Google Sheet:', 'Download Code.gs', 'One-page setup guide', 'Connect & sync →'];
    /* AOG-GS-QUIET-V1 (2026-09-26) — Jimmy: "The Google script does not have to sit there all the
       time." Once this device has a Sheet connected, the row folds to one small button. */
    var connected = false; try { connected = !!localStorage.getItem("aog.sync.url"); } catch (e) {}
    var open = bar.__open || !connected;
    var html = !open
      ? '<button type="button" class="aogdd-gsb" data-gsopen="1">✓ ' + (es() ? "Tu Hoja está conectada · herramientas de la Hoja" : "Your Sheet is connected · Sheet tools") + ' ▸</button>'
      : '<b>' + h[0] + '</b> <a class="aogdd-gsb" href="AoG-Screener-Sync-Code.gs" download="AoG-Screener-Sync-Code.gs">⬇ ' + h[1] + '</a>'
      + ' <a class="aogdd-gsb" href="AoG-Sheet-Setup.pdf" target="_blank" rel="noopener">📄 ' + h[2] + '</a>'
      + ' <button type="button" class="aogdd-gsb" data-gsconnect="1">' + h[3] + '</button>'
      + (connected ? ' <button type="button" class="aogdd-gsb" data-gsopen="0">' + (es() ? "Ocultar" : "Hide") + '</button>' : '');
    if (bar.__h !== html) { bar.innerHTML = html; bar.__h = html; }
    var tg = bar.querySelector("[data-gsopen]");
    if (tg) tg.onclick = function () { bar.__open = tg.getAttribute("data-gsopen") === "1"; gsBar(); };
    var b = bar.querySelector("[data-gsconnect]");
    if (b) b.onclick = function () { var o = Array.prototype.find.call(dd.options, function (x) { return /Connect|Conectar/.test(x.text); }); if (o) { dd.value = o.value; dd.selectedIndex = o.index; dd.dispatchEvent(new Event("change")); } };
  }
  /* AOG-PRACTICE-FOLLOWS-V1 (2026-09-26) — Jimmy: "That list needs to fold in. It
     was on Mia but everyone showed up." The practice table shows only the student
     picked above it, with one button to show everyone. */
  var showAll = false;
  function practiceFilter() {
    var sc = D.querySelector("#screen-admin .pc-scroll"); if (!sc || !sc.getClientRects().length) return;
    var tb = sc.querySelector("table"); if (!tb || !tb.tBodies[0]) return;
    var chip = D.querySelector("#screen-admin .gc-chip[aria-pressed=true], #screen-admin .pb-chip[aria-pressed=true]");
    var who = chip ? chip.textContent.trim() : "";
    var bar = D.getElementById("aogPcWho");
    if (!bar) { bar = D.createElement("div"); bar.id = "aogPcWho"; bar.className = "aogdd-demo no-print"; sc.parentNode.insertBefore(bar, sc);
      bar.addEventListener("click", function (e) { if (e.target.closest("button")) { showAll = !showAll; practiceFilter(); } }); }
    var n = 0;
    Array.prototype.forEach.call(tb.tBodies[0].rows, function (r) {
      var c = r.cells[0], nm = c ? c.textContent.trim() : "";
      var keep = showAll || !who || !nm || nm === who || r.classList.contains("pc-sub") || (!r.cells[0].textContent.trim());
      if (nm && nm !== who && !showAll && who) keep = false;
      r.style.display = keep ? "" : "none"; if (keep && nm) n++;
    });
    var t = showAll ? (es() ? "Mostrando a todos · " : "Showing everyone · ") : (who ? (es() ? "Mostrando solo a " : "Showing only ") + who + " · " : "");
    var html = '<span class="aogdd-demo-tx">' + t + n + (es() ? " filas" : " rows") + '</span><button type="button" class="aogdd-gsb">' + (showAll ? (es() ? "Solo " : "Only ") + (who || "") : (es() ? "Mostrar a todos" : "Show everyone")) + '</button>';
    if (bar.__h !== html) { bar.innerHTML = html; bar.__h = html; }
  }
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
