
/* ===================================================================
   ITEM 8 · CONTEXTUAL TOOLTIPS — a single floating tip (position:fixed,
   so it overlays and never shifts the dashboard layout) plus an
   annotator that tags dashboard metrics with plain-English explanations.
   =================================================================== */
(function () {
  var tip = null;
  function ensureTip() {
    if (!tip) {
      tip = document.createElement("div");
      tip.id = "aogTip";
      tip.setAttribute("role", "tooltip");
      document.body.appendChild(tip);
    }
    return tip;
  }
  function show(el) {
    var txt = el.getAttribute("data-tip");
    if (!txt) return;
    var t = ensureTip();
    t.textContent = txt;
    t.classList.remove("below");
    t.style.left = "0px"; t.style.top = "0px";
    t.classList.add("on");
    var r = el.getBoundingClientRect();
    var tr = t.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var left = Math.max(8, Math.min(cx - tr.width / 2, window.innerWidth - tr.width - 8));
    var top = r.top - tr.height - 10;
    if (top < 8) { top = r.bottom + 10; t.classList.add("below"); }
    t.style.left = left + "px";
    t.style.top = top + "px";
    t.style.setProperty("--tip-arrow", (cx - left) + "px");
  }
  function hide() { if (tip) tip.classList.remove("on"); }
  function closestTip(e) { return e.target && e.target.closest ? e.target.closest("[data-tip]") : null; }
  document.addEventListener("mouseover", function (e) { var el = closestTip(e); if (el) show(el); });
  document.addEventListener("mouseout", function (e) { if (closestTip(e)) hide(); });
  document.addEventListener("focusin", function (e) { var el = closestTip(e); if (el) show(el); });
  document.addEventListener("focusout", hide);
  /* tap toggles on touch devices */
  document.addEventListener("click", function (e) {
    var el = closestTip(e);
    if (!el) return;
    if (tip && tip.classList.contains("on") && tip.textContent === el.getAttribute("data-tip")) hide();
    else show(el);
  });
  window.addEventListener("scroll", hide, true);
  window.addEventListener("resize", hide);

  window.aogAnnotateTips = function () {
    var es = (typeof lang !== "undefined" && lang === "es");
    function T(en, esT) { return es ? esT : en; }
    var kpiTips = [
      T("How many people completed a self-reflection in this view. The filters above narrow it by window, grade, or mode.",
        "Cu\u00e1ntas personas completaron una autorreflexión en esta vista. Los filtros de arriba lo acotan por per\u00edodo, grado o modo."),
      T("The group\u2019s average overall score, from 0 to 100. Higher means more strengths reported across the domains.",
        "El puntaje general promedio del grupo, de 0 a 100. M\u00e1s alto significa m\u00e1s fortalezas reportadas en los dominios."),
      T("How many people didn\u2019t name an adult they trust \u2014 often a good first place to reach out.",
        "Cu\u00e1ntas personas no nombraron a un adulto de confianza \u2014 suele ser un buen primer lugar para acercarse.")
    ];
    function annotateKpis(sel) {
      var cards = document.querySelectorAll(sel);
      for (var i = 0; i < cards.length && i < kpiTips.length; i++) {
        cards[i].setAttribute("data-tip", kpiTips[i]);
        cards[i].setAttribute("tabindex", "0");
      }
    }
    annotateKpis("#panel-overview .kpi-grid .kpi");
    annotateKpis("#hdKpis .hd-kpi");

    var segTip = {
      "dist-green": T("People scoring 75\u2013100 \u2014 doing well across the domains.", "Personas con 75\u2013100 \u2014 van bien en los dominios."),
      "dist-amber": T("People scoring 50\u201374 \u2014 worth a gentle self-reflection.", "Personas con 50\u201374 \u2014 vale una autorreflexión amable."),
      "dist-red": T("People scoring 0\u201349 \u2014 likely need some support.", "Personas con 0\u201349 \u2014 probablemente necesitan apoyo.")
    };
    [].forEach.call(document.querySelectorAll("#distChart .dist-segment, #hdChart .dist-segment, .trend-bar .dist-segment"), function (s) {
      var key = s.classList.contains("dist-green") ? "dist-green"
              : s.classList.contains("dist-amber") ? "dist-amber"
              : s.classList.contains("dist-red") ? "dist-red" : null;
      if (key) { s.setAttribute("data-tip", segTip[key]); s.setAttribute("tabindex", "0"); }
    });

    [].forEach.call(document.querySelectorAll("#domainSummary .domain-card"), function (c) {
      var nm = c.querySelector(".domain-card-title");
      var name = nm ? nm.textContent.trim() : T("this domain", "este dominio");
      c.setAttribute("data-tip", T("Average score (0\u2013100) for " + name + " across everyone in this view. Lower domains are where to focus support next.",
                                    "Puntaje promedio (0\u2013100) de " + name + " en todas las personas de esta vista. Los dominios m\u00e1s bajos son donde enfocar el apoyo."));
      c.setAttribute("tabindex", "0");
    });

    [].forEach.call(document.querySelectorAll(".trend-row"), function (r) {
      r.setAttribute("data-tip", T("How this window splits across the three bands. Compare rows to see how the group moves over time.",
                                    "C\u00f3mo se reparte este per\u00edodo entre las tres bandas. Compara filas para ver c\u00f3mo cambia el grupo con el tiempo."));
      r.setAttribute("tabindex", "0");
    });
  };
})();
