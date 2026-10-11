
/* ============================================================================
   THE FIRST TWO MINUTES — 2026-08-25.

   Jimmy's brief: simplify the public-facing experience WITHOUT DELETING
   ANYTHING. The story a first-time visitor should meet is

       student -> reflection -> awareness -> educator dashboard ->
       conversation -> growth

   and everything that makes the first impression feel broader than the core
   school use case should move deeper, not disappear.

   ⚠ NOTHING HERE DELETES A DOOR. Two surfaces are re-ordered by MOVING live
   DOM nodes with appendChild — every id, click handler, title, i18n key and
   translation survives untouched, exactly as the Overview collapsible does.
   Anything moved is one click away, never gone:

     1. The Explore menu is regrouped. Understand / Use / Adopt carry the core
        story; a new "More from Architecture of Grace" group at the foot carries
        the regulation tools, standards alignment, the library, anchor charts,
        words of encouragement and voices.

     2. The chooser screen ("who is this for?") keeps the three doors that ARE
        the school story -- the student's reflection, specialists, and family --
        and folds "For grown-ups & teams" (the workplace track) and "How full is
        your tank?" into a disclosure underneath. Both were named in the brief as
        things that broaden the first impression; both stay on the same screen,
        one click down.

   The workplace screen itself, the tank, the library, alignment and every other
   destination are UNCHANGED and still reachable from their other doors, the
   ecosystem map and their direct links.
============================================================================ */
(function () {
  function esES() { try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; } catch (e) { return false; } }
  function T(en, es) { return esES() ? es : en; }
  function el(id) { return document.getElementById(id); }

  /* ---------------------------------------------------------------- 1 · Explore
     Resolve each item by its i18n key where it has one, or by its visible text
     where it does not. Never by position -- the menu has been reordered before. */
  function exItems() {
    var m = el("exNavMenu");
    return m ? Array.prototype.slice.call(m.querySelectorAll(":scope > a")) : [];
  }
  function exFind(key, text) {
    var list = exItems();
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      var sp = a.querySelector("span[data-i18n]");
      if (key && sp && sp.getAttribute("data-i18n") === key) return a;
      if (text && (a.textContent || "").trim().toLowerCase().indexOf(text) >= 0) return a;
      if (key && key.charAt(0) === "@" && (a.getAttribute("title") || "").indexOf(key.slice(1)) === 0) return a;
    }
    return null;
  }
  function groupLabel(key, en, es) {
    var m = el("exNavMenu");
    var found = m.querySelector('.exnav-grouplab[data-i18n="' + key + '"]');
    if (found) return found;
    var d = document.createElement("div");
    d.className = "exnav-grouplab";
    d.setAttribute("data-aog-grp", key);
    d.textContent = T(en, es);
    return d;
  }

  var GROUPS = [
    { lab: "nav_grp_understand", en: "Understand", es: "Entender",
      items: [["@The Framework", null], ["pv_foot_link", null]] },
    { lab: "nav_grp_use", en: "Use", es: "Usar",
      /* ⚠ THE THREE ACTIVITY-SERIES ITEMS ARE MATCHED BY @title, NEVER BY
         TEXT. exFind's text branch reads the visible label, and these labels
         translate — on a Spanish menu a text match would find nothing and all
         three would drift back above the first group label with no heading
         over them. Titles are static English, so the @ branch is the stable
         one, and the match is a PREFIX: the title must START with the key.
         ⚠ Science Vocabulary was added to the markup in .30dn and forgotten
         here for one build — it rendered above "Understand" with no heading,
         which is exactly the failure this comment already described. Adding a
         row to the menu is TWO edits: the anchor, and this table. */
      /* ⚠ CALM & REGULATION TOOLS BELONGS IN USE, and did on the three hub
         bars already -- index.html was the only place still filing it under
         "More from Architecture of Grace". Jimmy, looking at the live menu:
         "It should go in the USE menu as well as the calming and regulation
         tools while your at it." One product, one menu: the order here and
         the order in the hub bars are now the same list. */
      items: [["aog_dash_nav", null], /* 2026-09-12, Jimmy: "Remove the inbox from the drop down box" - the /turnins row is gone from the Explore menu; the page itself and its other doors (dashboard cards, IEP evidence panel) are untouched. */ ["@Mathematics", null], ["@Number Concepts", null],
              ["@Science Vocabulary", null], ["@Science Topics", null], ["@Social Studies", null], ["@English", null], ["aog_tools_nav", null],
              ["nav_family", null], [null, "talk it out"], ["@Anchor Charts", null]] },
    { lab: "nav_grp_adopt", en: "Adopt", es: "Adoptar",
      items: [["aog_schools_nav", null], ["pp_nav", null]] },
    /* Everything below is still one click away -- that is the whole point. */
    { lab: "nav_grp_more", en: "More from Architecture of Grace", es: "Más de Architecture of Grace",
      /* Calm & Regulation Tools moved up to Use. Four items remain, so this
         heading still has something under it -- a label whose items all move
         is a heading over nothing, and regroupExplore hides it. */
      items: [["nav_align", null], ["aog_lib_nav", null],
              ["nav_woe", null], ["g_tab_voices", null]] }
  ];

  function regroupExplore() {
    var m = el("exNavMenu");
    if (!m || m.getAttribute("data-aog-regrouped") === "1") return;
    if (!exItems().length) return;
    GROUPS.forEach(function (g) {
      var lab = groupLabel(g.lab, g.en, g.es);
      var wanted = [];
      g.items.forEach(function (pair) {
        var a = exFind(pair[0], pair[1]);
        if (a) wanted.push(a);
      });
      if (!wanted.length) { if (lab.parentNode === m) m.appendChild(lab); return; }
      m.appendChild(lab);
      wanted.forEach(function (a) { m.appendChild(a); });
    });
    /* A label whose items all moved is a heading over nothing. "Resources"
       emptied itself in exactly this way on the first run. Hidden, never
       removed -- restoring an item to that group brings its heading back. */
    Array.prototype.forEach.call(m.querySelectorAll(".exnav-grouplab"), function (d) {
      var n = d.nextElementSibling, any = false;
      while (n && !n.classList.contains("exnav-grouplab")) {
        if (n.tagName === "A" && getComputedStyle(n).display !== "none") { any = true; break; }
        n = n.nextElementSibling;
      }
      d.style.display = any ? "" : "none";
    });
    /* .first controls the top rule; it must sit on the first one still showing. */
    var shown = Array.prototype.filter.call(m.querySelectorAll(".exnav-grouplab"),
      function (d) { return d.style.display !== "none"; });
    Array.prototype.forEach.call(m.querySelectorAll(".exnav-grouplab"), function (d) {
      d.classList.toggle("first", d === shown[0]);
    });
    m.setAttribute("data-aog-regrouped", "1");
  }

  /* ------------------------------------------------------------- 2 · The chooser
     "For grown-ups & teams" and "How full is your tank?" fold into a disclosure.
     Moved, not hidden with display:none, so keyboard order and the reveal agree. */
  function injectCss() {
    if (el("aogFirstCss")) return;
    var st = document.createElement("style");
    st.id = "aogFirstCss";
    st.textContent = [
      "#aogMoreWays{margin:10px 0 0;}",
      "#aogMoreWaysBtn{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;",
      "font:inherit;font-size:13.5px;font-weight:700;cursor:pointer;background:transparent;",
      "color:var(--ink-soft,#5b6675);border:1px dashed var(--rule,#E4DAC5);border-radius:12px;padding:12px 16px;}",
      "#aogMoreWaysBtn:hover{background:var(--cream,#FBF8F1);color:var(--navy,#0A1E33);}",
      "#aogMoreWaysBtn .mw-car{width:13px;height:13px;transition:transform .18s ease;}",
      "#aogMoreWays.is-open #aogMoreWaysBtn .mw-car{transform:rotate(90deg);}",
      "#aogMoreWaysBody{display:none;padding-top:10px;}",
      "#aogMoreWays.is-open #aogMoreWaysBody{display:block;}",
      "@media (prefers-reduced-motion:reduce){#aogMoreWaysBtn .mw-car{transition:none;}}"
    ].join("");
    document.head.appendChild(st);
  }

  var CAR = '<svg class="mw-car" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';

  function foldChooser() {
    var host = document.querySelector(".aog-checkins");
    if (!host || el("aogMoreWays")) return;
    var deeper = [
      host.querySelector(".choose-adult"),   /* the workplace / grown-ups track */
      host.querySelector(".choose-tank")     /* the 60-second energy read */
    ].filter(Boolean);
    if (!deeper.length) return;
    injectCss();

    var wrap = document.createElement("div");
    wrap.id = "aogMoreWays";
    wrap.innerHTML =
      '<button type="button" id="aogMoreWaysBtn" aria-expanded="false" aria-controls="aogMoreWaysBody">' +
        CAR + "<span>" + T("More ways people use this", "Más formas de usarlo") + "</span>" +
      "</button><div id=\"aogMoreWaysBody\"></div>";
    host.appendChild(wrap);
    var body = el("aogMoreWaysBody");
    deeper.forEach(function (n) { body.appendChild(n); });

    el("aogMoreWaysBtn").addEventListener("click", function () {
      var open = !wrap.classList.contains("is-open");
      wrap.classList.toggle("is-open", open);
      this.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function paintLang() {
    var m = el("exNavMenu");
    if (m) Array.prototype.forEach.call(m.querySelectorAll("[data-aog-grp]"), function (d) {
      if (d.getAttribute("data-aog-grp") === "nav_grp_more")
        d.textContent = T("More from Architecture of Grace", "Más de Architecture of Grace");
    });
    var b = el("aogMoreWaysBtn");
    if (b) { var sp = b.querySelector("span"); if (sp) sp.textContent = T("More ways people use this", "Más formas de usarlo"); }
  }

  function go() { try { regroupExplore(); foldChooser(); paintLang(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
  setTimeout(go, 800); setTimeout(go, 2400);
  try { new MutationObserver(paintLang).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}

  window.AOGFirstImpression = { regroup: regroupExplore, fold: foldChooser };
})();
