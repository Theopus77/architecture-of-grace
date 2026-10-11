
/* ============================================================================
   §15 · §16 · §17 — the Overview stops competing with itself.

   Nothing here is removed, rebuilt or re-rendered. Six existing blocks are
   MOVED, as live DOM nodes, into one collapsible below Today's Picture:

     the curriculum strip · the three filter selects · the summary line ·
     the KPI grid · "How everyone's doing" and its distribution chart ·
     "Domain averages" and its bars

   Moving the nodes rather than copying their markup is the whole trick — every
   id survives, so refreshAdmin(), the chart renderers, the filter listeners and
   the i18n dictionary all keep writing into exactly the elements they always
   wrote into, and none of them needs to know this happened.

   Why collapsed by default: §16's teacher arrives at 8:00 with thirty seconds.
   Today's Picture answers the question. Six charts underneath it answer a
   different question, on a different day, and putting them at equal weight is
   what made the morning test fail. The choice is remembered, so a teacher who
   opens it never has to open it twice.

   ⚠ A chart drawn inside a hidden box measures zero width. Opening the box
   therefore calls refreshAdmin() once, which redraws them at their real size.
============================================================================ */
(function () {
  var KEY = "aog.ov.detail";
  var placed = false;

  function T(en, es) { try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; } }
  function el(id) { return document.getElementById(id); }
  function open_() { try { return localStorage.getItem(KEY) === "open"; } catch (e) { return false; } }
  function setOpen(v) { try { localStorage.setItem(KEY, v ? "open" : "shut"); } catch (e) {} }

  function injectCss() {
    if (el("aogOvDetailCss")) return;
    var st = document.createElement("style");
    st.id = "aogOvDetailCss";
    st.textContent = [
      "#aogOvDetail{margin:6px 0 18px;}",
      "#aogOvDetailBtn{width:100%;display:flex;align-items:center;gap:12px;text-align:left;",
      "font:inherit;cursor:pointer;background:transparent;color:var(--ink,#22303F);",
      "border:1px solid var(--rule,#E4DAC5);border-radius:12px;padding:13px 16px;}",
      "#aogOvDetailBtn:hover{background:var(--cream,#FBF8F1);}",
      "#aogOvDetailBtn .ovd-car{flex:0 0 auto;width:15px;height:15px;transition:transform .18s ease;color:var(--ink-faint,#8A92A6);}",
      "#aogOvDetail.is-open #aogOvDetailBtn .ovd-car{transform:rotate(90deg);}",
      "#aogOvDetailBtn .ovd-tx{min-width:0;}",
      "#aogOvDetailBtn .ovd-t{display:block;font-weight:700;font-size:14.5px;color:var(--navy,#0A1E33);}",
      /* --navy on a dark ground measured 1.04:1. Same family as the fix above. */
      ":root[data-theme=\"dark\"] #aogOvDetailBtn .ovd-t{color:var(--ink,#ECE5D6);}",
      ":root[data-theme=\"dark\"] #aogOvDetailBtn:hover{background:var(--paper,#152331);}",
      "#aogOvDetailBtn .ovd-s{display:block;font-size:12.5px;line-height:1.5;color:var(--ink-faint,#8A92A6);margin-top:2px;}",
      "#aogOvDetailBody{display:none;padding-top:14px;}",
      "#aogOvDetail.is-open #aogOvDetailBody{display:block;}",
      "@media print{#aogOvDetailBody{display:block !important;}#aogOvDetailBtn{display:none;}}",
      "@media (prefers-reduced-motion:reduce){#aogOvDetailBtn .ovd-car{transition:none;}}"
    ].join("");
    document.head.appendChild(st);
  }

  var CARET = '<svg class="ovd-car" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';

  /* The six blocks, in the order they already appear on the panel. Anything
     missing is skipped rather than assumed — a role that never had a KPI grid
     must not throw. */
  function pieces(panel) {
    var out = [];
    function add(n) { if (n && out.indexOf(n) < 0) out.push(n); }
    add(el("aogCurriculumStrip"));
    add(panel.querySelector(".filter-bar"));
    add(el("ovSummary"));
    add(el("kpiGrid"));
    var heads = panel.querySelectorAll(".section-head.ov-head-row");
    if (heads[0]) add(heads[0]);
    add(panel.querySelector(".dist-card"));
    if (heads[1]) add(heads[1]);
    add(el("domainSummary"));
    return out;
  }

  function place() {
    var panel = el("panel-overview");
    if (!panel) return;
    injectCss();

    var wrap = el("aogOvDetail"), body;
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "aogOvDetail";
      wrap.innerHTML =
        '<button type="button" id="aogOvDetailBtn" aria-expanded="false" aria-controls="aogOvDetailBody">' +
          CARET +
          '<span class="ovd-tx"><span class="ovd-t"></span><span class="ovd-s"></span></span>' +
        "</button>" +
        '<div id="aogOvDetailBody"></div>';
      /* After the first-run panels, before the teaching notes. */
      var teach = el("ovTeach");
      if (teach && teach.parentNode === panel) panel.insertBefore(wrap, teach);
      else panel.appendChild(wrap);

      el("aogOvDetailBtn").addEventListener("click", function () {
        var now = !wrap.classList.contains("is-open");
        paint(now);
        setOpen(now);
        /* Charts measured zero while they were hidden. One redraw at real width. */
        if (now) setTimeout(function () {
          try { if (typeof refreshAdmin === "function") refreshAdmin(); } catch (e) {}
        }, 20);
      });
    }
    body = el("aogOvDetailBody");

    pieces(panel).forEach(function (n) { if (n.parentNode !== body) body.appendChild(n); });
    paint(wrap.classList.contains("is-open") || (!placed && open_()));
    placed = true;
  }

  function paint(isOpen) {
    var wrap = el("aogOvDetail"), btn = el("aogOvDetailBtn");
    if (!wrap || !btn) return;
    wrap.classList.toggle("is-open", !!isOpen);
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    btn.querySelector(".ovd-t").textContent = T("Class detail", "Detalle de la clase");
    btn.querySelector(".ovd-s").textContent = isOpen
      ? T("Filters, the class distribution, domain averages and curriculum progress. Everything is still here.",
          "Filtros, la distribución de la clase, promedios por dominio y avance del currículo. Todo sigue aquí.")
      : T("Filters, the class distribution, domain averages and curriculum progress.",
          "Filtros, la distribución de la clase, promedios por dominio y avance del currículo.");
  }

  /* refreshAdmin writes into these ids; it never replaces them, so a re-place
     after it is a no-op. It is here only so that a future render which DID
     rebuild the panel would find its way back into the box on the next tick. */
  function wrapRefresh() {
    if (typeof window.refreshAdmin !== "function" || window.refreshAdmin.__aogOvd) return;
    var orig = window.refreshAdmin;
    var wrapped = function () {
      var r = orig.apply(this, arguments);
      try { place(); } catch (e) {}
      return r;
    };
    wrapped.__aogOvd = true;
    window.refreshAdmin = wrapped;
  }

  function go() { try { place(); wrapRefresh(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
  setTimeout(go, 900);
  setTimeout(go, 2600);

  window.AOGOverviewDetail = { place: place, open: function () { paint(true); setOpen(true); } };
})();
