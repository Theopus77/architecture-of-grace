
/* ============================================================================
   AOG CROSSWALK VIEWER — in-app internal tab (#panel-crosswalk).
   Reuses the already-embedded data: window.AOG_CROSSWALK (81 K-12 rows),
   window.AOG_CROSSWALK_ES (provisional ES overlay), window.AOG_SESSIONS (12
   Practitioner sessions). Hidden by default; revealed via the URL hash
   "#crosswalk" or localStorage flag "aog.internal" = "1". Namespaced .xw-* so
   nothing collides with dashboard styles.
   ========================================================================== */
(function () {
  function es() { try { return (typeof dashLang !== "undefined" && dashLang === "es"); } catch (e) { return false; } }
  function t(en, esS) { return es() ? esS : en; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]; }); }
  function star(r) { return r === 2 ? "★★" : r === 1 ? "★" : ""; }
  var STATE = { mode: "k12", q: "", band: "", dom: "", risk: "" };

  function trES(row) {
    if (!es()) return null;
    return (window.AOG_CROSSWALK_ES || {})[row.b + "|" + row.lesson] || null;
  }

  function k12Rows() {
    return (window.AOG_CROSSWALK || []).filter(function (r) {
      if (STATE.band && r.b !== STATE.band) return false;
      if (STATE.dom && r.dom !== STATE.dom) return false;
      if (STATE.risk !== "" && String(r.risk) !== STATE.risk) return false;
      if (STATE.q) { var blob = (r.theme + " " + r.lesson + " " + r.scene + " " + r.chart + " " + r.neuro).toLowerCase(); if (blob.indexOf(STATE.q) < 0) return false; }
      return true;
    });
  }
  function adultRows() {
    return (window.AOG_SESSIONS || []).filter(function (s) {
      if (STATE.dom && s.dom !== STATE.dom) return false;
      if (STATE.risk !== "" && String(s.risk) !== STATE.risk) return false;
      if (STATE.q) { var blob = (s.title + " " + s.anchor + " " + s.obj + " " + s.phase).toLowerCase(); if (blob.indexOf(STATE.q) < 0) return false; }
      return true;
    });
  }

  function domLabel(d) { return d === "ALL" ? t("Integration", "Integración") : t("Domain ", "Dominio ") + d; }

  function k12Card(r) {
    var tr = trES(r);
    var L = tr && tr.lesson ? tr.lesson : r.lesson, TH = tr && tr.theme ? tr.theme : r.theme,
        SC = tr && tr.scene ? tr.scene : r.scene, CH = tr && tr.chart ? tr.chart : r.chart, NE = tr && tr.neuro ? tr.neuro : r.neuro;
    var prov = es() ? ("<span class=\"xw-prov\" style=\"opacity:0.65;\">" + (tr ? "trad. provisional" : "EN · ES pend.") + "</span>") : "";
    return "<div class=\"xw-card d" + r.dom + "\"><div class=\"xw-crow\">" +
      "<span class=\"xw-tag band\">" + esc(r.b) + "</span>" +
      "<span class=\"xw-tag dom " + r.dom + "\">" + esc(domLabel(r.dom)) + "</span>" +
      (r.risk ? "<span class=\"xw-tag risk\">" + star(r.risk) + "</span>" : "") +
      "<span class=\"xw-theme\">" + esc(TH) + "</span> " + prov + "</div>" +
      "<div class=\"xw-lesson\">" + esc(L) + "</div>" +
      "<div class=\"xw-grid\">" +
        "<div class=\"xw-k\">" + t("Novel scene", "Escena de la novela") + "</div><div class=\"xw-v\">" + esc(SC) + "</div>" +
        "<div class=\"xw-k\">" + t("Anchor chart", "Ancla visual") + "</div><div class=\"xw-v\">" + esc(CH) + "</div>" +
        "<div class=\"xw-k\">" + t("Neuro-affirming", "Neuroafirmante") + "</div><div class=\"xw-v\">" + esc(NE) + window.aogNeuroExtrasHtml(r, r.b, es()) + "</div>" +
      "</div></div>";
  }
  function adultCard(s) {
    return "<div class=\"xw-card d" + s.dom + "\"><div class=\"xw-crow\">" +
      "<span class=\"xw-tag band\">" + t("Session ", "Sesión ") + s.n + "</span>" +
      "<span class=\"xw-tag dom " + s.dom + "\">" + esc(domLabel(s.dom)) + "</span>" +
      (s.risk ? "<span class=\"xw-tag risk\">" + star(s.risk) + (s.rescreen ? " ◆" : "") + "</span>" : "") +
      "<span class=\"xw-theme\">" + t("Phase ", "Fase ") + esc(s.phase) + "</span></div>" +
      "<div class=\"xw-lesson\">" + esc(s.title) + "</div>" +
      "<div class=\"xw-grid\">" +
        "<div class=\"xw-k\">" + t("Anchor concept", "Concepto ancla") + "</div><div class=\"xw-v\">" + esc(s.anchor) + "</div>" +
        "<div class=\"xw-k\">" + t("Clinical aim", "Objetivo clínico") + "</div><div class=\"xw-v\">" + esc(s.obj) + "</div>" +
      "</div></div>";
  }

  function renderList(host) {
    var list = host.querySelector(".xw-list");
    var cnt = host.querySelector(".xw-count");
    if (!list) return;
    if (STATE.mode === "adult") {
      var rows = adultRows();
      cnt.textContent = rows.length + " / " + (window.AOG_SESSIONS || []).length + t(" sessions", " sesiones");
      list.innerHTML = rows.length ? rows.map(adultCard).join("") : "<div class=\"xw-empty\">" + t("No sessions match these filters.", "Ninguna sesión coincide.") + "</div>";
    } else {
      var r2 = k12Rows();
      cnt.textContent = r2.length + " / " + (window.AOG_CROSSWALK || []).length + t(" rows", " filas");
      list.innerHTML = r2.length ? r2.map(k12Card).join("") : "<div class=\"xw-empty\">" + t("No rows match these filters.", "Ninguna fila coincide.") + "</div>";
    }
  }

  function buildControls(host) {
    var bandSel = "<select class=\"xw-sel\" data-f=\"band\"><option value=\"\">" + t("All bands", "Todas las bandas") + "</option><option>K-2</option><option>3-5</option><option>6-8</option><option>9-10</option><option>11-12</option></select>";
    host.innerHTML =
      "<div class=\"xw-head\"><div class=\"xw-h1\">" + t("Crosswalk Viewer", "Visor de Crosswalk") + " <span class=\"xw-int\">" + t("internal", "interno") + "</span></div>" +
        "<div class=\"xw-sub\">" + t("The Grace Compass source of truth — 81 K–12 rows + 12 Practitioner sessions. Filter, search, verify every mapping.", "La fuente de verdad de Grace Compass — 81 filas K–12 + 12 sesiones para profesionales. Filtra, busca y verifica cada mapeo.") + "</div></div>" +
      "<div class=\"xw-bar\">" +
        "<div class=\"xw-seg\" data-seg=\"mode\"><button data-mode=\"k12\" class=\"on\">" + t("K–12 Crosswalk", "Crosswalk K–12") + "</button><button data-mode=\"adult\">" + t("Practitioner", "Profesional") + "</button></div>" +
        "<input type=\"text\" class=\"xw-q\" placeholder=\"" + t("Search…", "Buscar…") + "\">" +
        bandSel +
        "<select class=\"xw-sel\" data-f=\"dom\"><option value=\"\">" + t("All domains", "Todos los dominios") + "</option><option value=\"A\">A · " + t("Regulation", "Regulación") + "</option><option value=\"B\">B · " + t("Self-Compassion", "Autocompasión") + "</option><option value=\"C\">C · " + t("Social & Repair", "Social y reparación") + "</option><option value=\"ALL\">" + t("Integration", "Integración") + "</option></select>" +
        "<select class=\"xw-sel\" data-f=\"risk\"><option value=\"\">" + t("Any risk", "Cualquier riesgo") + "</option><option value=\"1\">★</option><option value=\"2\">★★</option><option value=\"0\">" + t("No flag", "Sin marca") + "</option></select>" +
        "<span class=\"xw-count\"></span>" +
      "</div>" +
      "<div class=\"xw-list\"></div>";

    var q = host.querySelector(".xw-q");
    q.value = STATE.q;
    q.addEventListener("input", function () { STATE.q = this.value.trim().toLowerCase(); renderList(host); });
    host.querySelectorAll(".xw-sel").forEach(function (sel) {
      sel.value = STATE[sel.getAttribute("data-f")] || "";
      sel.addEventListener("change", function () { STATE[this.getAttribute("data-f")] = this.value; renderList(host); });
    });
    host.querySelector("[data-seg=mode]").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      STATE.mode = b.getAttribute("data-mode");
      Array.prototype.forEach.call(this.children, function (x) { x.classList.toggle("on", x.getAttribute("data-mode") === STATE.mode); });
      var bs = host.querySelector("[data-f=band]"); if (bs) bs.style.display = STATE.mode === "adult" ? "none" : "";
      renderList(host);
    });
  }

  window.aogRenderCrosswalk = function () {
    var host = document.getElementById("aogXwRoot");
    if (!host) return;
    if (!host.querySelector(".xw-bar")) buildControls(host);
    renderList(host);
  };

  /* reveal the hidden internal tab when explicitly requested */
  window.aogShowCrosswalkTab = function (activate) {
    var tab = document.querySelector('.tab[data-tab="crosswalk"]');
    if (!tab) return;
    tab.style.display = "";
    try { localStorage.setItem("aog.internal", "1"); } catch (e) {}
    if (activate) tab.click();
  };
  function maybeReveal() {
    var on = false;
    try { on = localStorage.getItem("aog.internal") === "1"; } catch (e) {}
    var hash = (location.hash || "").toLowerCase().indexOf("crosswalk") >= 0;
    if (on || hash) window.aogShowCrosswalkTab(hash);
  }
  if (document.readyState !== "loading") maybeReveal(); else document.addEventListener("DOMContentLoaded", maybeReveal);
  window.addEventListener("hashchange", maybeReveal);
})();

