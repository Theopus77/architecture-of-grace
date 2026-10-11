
/* ============================================================================
   THE DISTRIBUTE PANEL GETS TABS — 2026-08-25.

   Jimmy, looking at the live panel: "This is the first link, but it is for the
   screener that is taken a few times a year. Could these generated links be in
   tabs? It would seem confusing to a first time or even a person such as myself."

   He is right, and it is worse than two forms. Distribute stacks FIVE blocks:
   the Classroom Link Generator, the Check-In Link card the check-in layer
   injects underneath it, Connect your school's Sheet, Syncing & distribution,
   and See results from other devices. Two of those are near-identical link
   builders for two completely different things — an 18-question reflection run
   two or three times a year, and a four-minute check-in run daily — and the only
   way to tell them apart was to read both.

   Three tabs, each with a line saying WHEN you want it. The line matters more
   than the tabs: a first-timer's problem is not navigation, it is not knowing
   which of the two they are looking for.

   ⚠ Blocks are found structurally, not by position: a .section-head and
   everything after it until the NEXT .section-head is one block. The check-in
   card is injected at runtime between blocks 1 and 2, so anything keyed to an
   index would silently mis-group the moment that layer changes.

   ⚠ Runs AFTER the check-in layer. It is idempotent and re-runs on a timer, so
   if the injected card arrives late it is picked up on the next pass.

   Nothing is deleted. Every node is MOVED — ids, handlers, data-dl keys and both
   translations survive, exactly as in aog-first-impression.
============================================================================ */
(function () {
  var KEY = "aog.dist.tab";

  function T(en, es) { try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; } }
  function el(id) { return document.getElementById(id); }
  function esc(x) { return String(x == null ? "" : x).replace(/[&<>"]/g, function (c) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  var TABS = [
    /* ⚠ NAMED BY WHO ANSWERS, 2026-08-29am. Jimmy, at the screen: "Can this
       be call the student daily check in or something along those lines... I
       got this and the student support link confused." Four of these six were
       named after the INSTRUMENT, and two instruments a student answers sat
       beside one an adult answers with nothing in the words to tell them
       apart. The one thing that actually separates them is who is holding the
       phone, so that is what the tab says now. */
    { id: "reflection", en: "Student self-reflection", es: "Autorreflexión del estudiante",
      hintEn: "The 18-question reflection your class takes two or three times a year. This is the one that fills the dashboard's bands.",
      hintEs: "La reflexión de 18 preguntas que la clase hace dos o tres veces al año. Es la que llena las bandas del panel." },
    { id: "checkin", en: "Student daily check-in", es: "Registro diario del estudiante",
      hintEn: "The four-minute check-in. A class can do it each morning, and a student can check in again any time during the day. Each one is saved with its class period. Adults who work with a student can add what they saw from their own devices.",
      hintEs: "El registro de cuatro minutos. Una clase puede hacerlo por la mañana, un estudiante puede registrarse otra vez en cualquier momento del día — cada uno queda en el periodo en que se hizo — y los adultos alrededor de un estudiante pueden anotar lo que vieron desde sus dispositivos." },
    { id: "exitslip", en: "Student exit slip", es: "Salida del estudiante",
      hintEn: "The end-of-day slip \u2014 what was my day? A class link to post on the way out, and per-student cards under Set up \u25b8 My classes. Slips land in their own ExitSlips tab, never mixed with the morning check-in.",
      hintEs: "La salida del final del d\u00eda \u2014 \u00bfc\u00f3mo estuvo mi d\u00eda? Un enlace de clase para poner al salir, y tarjetas por estudiante en Configuraci\u00f3n \u25b8 Mis clases. Las salidas van a su propia pesta\u00f1a ExitSlips, nunca mezcladas con el registro de la ma\u00f1ana." },
    /* ⚠ THE LABEL MOVED, THE INSTRUMENT DID NOT. This is still the Student
       support check-in on its own screen, still /support, still og-support.png,
       still checkin=support on every link anyone has handed out. Only the tab
       a teacher reads was wrong: "Student support link" sounds like something
       a student fills in, and it is the one link on this row that a student
       must never open. */
    /* ⚠ THE SIXTH INSTRUMENT, AND THE ONE THAT COULD NOT BE HANDED OUT.
       The thirty practice pages have carried a ?dest= reader since the send
       block shipped, and NOTHING IN THIS DASHBOARD EVER BUILT A LINK WITH
       dest= ON IT — so a practice link was a bare short URL, and every row it
       produced went to whatever Sheet the site config publishes, on every
       device, for every teacher. Jimmy found it the hard way: a second Google
       account, its own Apps Script, its own Sheet, a green connection test,
       and the answers still arrived in the first account's Sheet. */
    { id: "practice", en: "Student practice page", es: "Página de práctica del estudiante",
      hintEn: "The forty-seven activities — math, number concepts and data, science vocabulary, and social studies. A student works one through, and the finished set posts ONE summary row on its own: how many they got, hints used, confidence, and the name they typed once. Nothing else leaves the device. ⚠ Build the link HERE rather than copying the short URL out of the address bar: only a link built here carries your Sheet with it.",
      hintEs: "Las cuarenta y siete actividades — matemáticas, conceptos numéricos y datos, vocabulario de ciencias y estudios sociales. Un estudiante hace una, y el grupo terminado envía UNA fila de resumen por sí solo: cuántas logró, pistas usadas, confianza y el nombre que escribió una sola vez. Nada más sale del dispositivo. ⚠ Crea el enlace AQUÍ en vez de copiar la URL corta de la barra de direcciones: solo un enlace creado aquí lleva tu Hoja consigo." },
    /* ⚠ THE SEVENTH TAB, AND THE SIXTH TIME THIS FAULT HAS BEEN FOUND.
       This Is Me could be handed to a student since .30bu and could come home
       through the Sheet since .30bv — and the only builder of its link, the
       Copy button on the IEP card, put no dest= on it. Jimmy: "how can I send
       the link to anyone and get their results?" He could not, and nothing on
       any screen said so. A link built HERE carries the Sheet; one copied out
       of the address bar never has. */
    { id: "thisisme", en: "Student This Is Me page", es: "Página Este soy yo del estudiante",
      hintEn: "The student's own page for their own IEP meeting — strengths, what helps, what is hard, how they have grown, what they want to ask their team. Every line is written, chosen or approved by them. Leave the code box empty and ONE link works for a whole class: whoever opens it types their own short code. ⚠ The page lives on their device; a finished page sends itself, and only the lines they KEPT ever travel — private lines never leave.",
      hintEs: "La página propia del estudiante para su propia reunión de IEP — fortalezas, qué le ayuda, qué le cuesta, cómo ha crecido, qué quiere preguntarle a su equipo. Cada línea la escribe, la elige o la aprueba él. Deja la casilla del código vacía y UN enlace sirve para toda la clase: quien lo abra escribe su propio código corto. ⚠ La página vive en su dispositivo; una página terminada se envía sola, y solo viajan las líneas que CONSERVÓ — las líneas privadas nunca salen." },
    /* AOG-WEEKLY-V1 (2026-09-26) — the Monday, midweek and Friday check-ins */
    { id: "weekly", en: "Student weekly check-ins", es: "Registros semanales del estudiante",
      hintEn: "Three short check-ins: Monday (how was your weekend?), midweek (how is the week going?) and Friday (the week, and weekend plans). Tap answers, and a box to write more on every question.",
      hintEs: "Tres registros cortos: lunes (¿cómo estuvo tu fin de semana?), mitad de semana (¿cómo va la semana?) y viernes (la semana y los planes del fin de semana). Respuestas con un toque y un espacio para escribir más en cada pregunta." },
    { id: "support", en: "Adult team check-in", es: "Registro del equipo de adultos",
      hintEn: "For a team around ONE student \u2014 a Tier 2 plan, a Tier 3 plan, an IEP. Every adult who sees that child logs what they saw from their own device, each entry signed with their own name, and they all meet on one timeline. Most teachers never open this tab, and that is the point of it having its own door.",
      hintEs: "Para un equipo alrededor de UN estudiante \u2014 un plan de Nivel 2, de Nivel 3, un IEP. Cada adulto que ve a ese ni\u00f1o anota lo que vio desde su propio dispositivo, cada entrada firmada con su nombre, y todas se re\u00fanen en una l\u00ednea de tiempo. La mayor\u00eda de los maestros nunca abren esta pesta\u00f1a, y por eso tiene su propia puerta." },
    /* ⚠ THE FIFTH INSTRUMENT. Shipped in .29z with its builder inside the
       Check-ins ▸ Home panel, so this row said four instruments and the
       product had five. Its card is injected by #aog-home-checkin. */
    { id: "homeci", en: "Home check-in", es: "Registro de casa",
      hintEn: "The rest of the day \u2014 the morning before school, the afternoon after it, and how the evening went. One link works for a whole class; whoever answers types the student's short code. It can be answered by the student or by a grown-up at home, and a skip counts as an answer.",
      hintEs: "El resto del d\u00eda \u2014 la ma\u00f1ana antes de la escuela, la tarde despu\u00e9s y c\u00f3mo estuvo la noche. Un enlace sirve para toda una clase; quien responde escribe el c\u00f3digo corto del estudiante. Puede responderlo el estudiante o un adulto en casa, y saltar una pregunta cuenta como respuesta." },
    { id: "connect", en: "Connect & sync", es: "Conectar y sincronizar",
      hintEn: "Set up your Sheet, check what this computer is connected to, and bring in what other devices collected. Usually done once.",
      hintEs: "Configura tu Hoja, revisa a qué está conectada esta computadora y trae lo que otros dispositivos recogieron. Normalmente se hace una vez." }
  ];

  function injectCss() {
    if (el("aogDistTabsCss")) return;
    var st = document.createElement("style");
    st.id = "aogDistTabsCss";
    st.textContent = [
      /* THE PILL ROW JOINS THE DASHBOARD (.30ef). Jimmy, from a screenshot:
         "I feel that the tabs blend in with the page. Could they somehow be
         apart of the dark blue dashboard or no?" They were outline pills on
         cream, one shade off the page. Now the framing line, the seven pills
         and the hint sit in ONE navy strip (#aogDistStrip) that hangs
         directly off the tab bar: the bar drops its bottom rounding and its
         26px margin while this panel is open, and the strip takes them over.
         The strip is navy in BOTH themes, like the dashboard above it, so no
         token flips. Selected pill = gold with navy text, the same gold as
         the active tab's underline; idle pills are light text with a border
         that clears 3:1 as an OBJECT on navy (rgba .38 blends to #5D6A78). */
      "#aogDistStrip{background:#0A1E33;border:1px solid #20425f;border-top:0;border-radius:0 0 16px 16px;padding:14px 18px 16px;margin:0 0 22px;}",
      "#screen-admin .tabs:has(~ #panel-distribute.active){border-radius:0;margin-bottom:0;}",
      "#screen-admin .tab-hint-row:has(~ #panel-distribute.active){margin:0;}",
      "#aogDistMoments{font-size:13px;line-height:1.65;color:#AFC0D2;margin:0 0 12px;max-width:74ch;}",
      "#aogDistMoments b{color:#fff;font-weight:800;}",
      "#aogDistTabs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px;}",
      "#aogDistTabs button{font:inherit;font-size:13.5px;font-weight:700;cursor:pointer;",
      "border:1px solid rgba(255,255,255,.38);background:transparent;color:#DCE6F0;",
      "border-radius:999px;padding:10px 18px;}",
      "#aogDistTabs button:hover{background:rgba(255,255,255,.10);color:#fff;border-color:rgba(255,255,255,.62);}",
      "#aogDistTabs button:focus-visible{outline:2px solid #fff;outline-offset:2px;}",
      "#aogDistTabs button[aria-selected=\"true\"]{background:var(--gold,#D9A33B);border-color:var(--gold,#D9A33B);color:#0A1E33;}",
      "#aogDistHint{font-size:13px;line-height:1.6;color:#C9D6E4;margin:0;max-width:70ch;}",
      "@media (max-width:760px){#aogDistStrip{padding:12px 12px 14px;}}",
      "#aogDistPanes > div{display:none;}",
      "#aogDistPanes > div.is-on{display:block;}",
      "@media print{#aogDistTabs{display:none;}#aogDistPanes > div{display:block !important;}}",
      "@media (max-width:520px){#aogDistTabs button{flex:1 1 100%;}}",
      /* ⚠ A GRID ITEM WILL NOT SHRINK PAST ITS MIN-CONTENT unless told to.
         Without this the four-field row overflowed the page on a phone. */
      "#panel-distribute .table-card .welcome-fields{min-width:0;}",
      "#panel-distribute .table-card .welcome-fields > .field{min-width:0;}",
      "#panel-distribute .table-card .welcome-fields > .field input,",
      "#panel-distribute .table-card .welcome-fields > .field select{max-width:100%;box-sizing:border-box;}",
      /* Four across a laptop, two across a tablet, one down a phone.
         !important because the grids carry the count as an inline style,
         which is where each card declares its own shape. */
      "@media (max-width:760px){#panel-distribute .table-card .welcome-fields{grid-template-columns:repeat(2,1fr) !important;}}",
      "@media (max-width:470px){#panel-distribute .table-card .welcome-fields{grid-template-columns:1fr !important;}}",
      /* THE BUILDERS STOP SPRAWLING (.30bx). On a wide monitor every link
         builder stretched the full dashboard width — four slim fields and a
         QR floating in a white card the size of the screen, and a sub line
         too long to read. Jimmy: "too much white… clunky." 1020px holds the
         longest link field comfortably; smaller screens never hit the cap. */
      "#panel-distribute .section-head,#panel-distribute .table-card{max-width:1020px;}"
    ].join("");
    document.head.appendChild(st);
  }

  /* A .section-head and everything up to the next .section-head is one block. */
  function blocks(panel) {
    var out = [], cur = null;
    Array.prototype.forEach.call(panel.children, function (n) {
      if (n.id === "aogDistStrip" || n.id === "aogDistTabs" || n.id === "aogDistHint" || n.id === "aogDistPanes") return;
      if (n.classList && n.classList.contains("section-head")) { cur = { head: n, rest: [] }; out.push(cur); }
      else if (cur) cur.rest.push(n);
    });
    return out;
  }

  function keyOf(b) {
    var h = b.head.querySelector("h2");
    var dl = h && h.getAttribute("data-dl");
    if (dl === "dl_lg_h1") return "reflection";
    if (dl === "dl_cfg_h1" || dl === "dl_dist_h1" || dl === "dl_ri_h1") return "connect";
    /* The check-in card is injected with a head carrying no data-dl. Identify it
       by the card it introduces, never by where it sits. */
    for (var i = 0; i < b.rest.length; i++) {
      if (b.rest[i].id === "aogCiLgCard" || (b.rest[i].querySelector && b.rest[i].querySelector("#aogCiLgCard"))) return "checkin";
      if (b.rest[i].id === "aogXsLgCard" || (b.rest[i].querySelector && b.rest[i].querySelector("#aogXsLgCard"))) return "exitslip";
      if (b.rest[i].id === "aogSuLgCard" || (b.rest[i].querySelector && b.rest[i].querySelector("#aogSuLgCard"))) return "support";
      if (b.rest[i].id === "aogHcLgCard" || (b.rest[i].querySelector && b.rest[i].querySelector("#aogHcLgCard"))) return "homeci";
      if (b.rest[i].id === "aogPrLgCard" || (b.rest[i].querySelector && b.rest[i].querySelector("#aogPrLgCard"))) return "practice";
      if (b.rest[i].id === "aogTimLgCard" || (b.rest[i].querySelector && b.rest[i].querySelector("#aogTimLgCard"))) return "thisisme";
      if (b.rest[i].id === "aogWkLgCard" || (b.rest[i].querySelector && b.rest[i].querySelector("#aogWkLgCard"))) return "weekly";
    }
    return "connect";      /* anything new lands in the admin tab, never in a link tab */
  }

  function current() { try { var v = localStorage.getItem(KEY); return TABS.some(function (t) { return t.id === v; }) ? v : "reflection"; } catch (e) { return "reflection"; } }

  /* ⚠ WRITTEN IN paint(), NOT IN build(). build() runs ONCE; paint() is what
     the lang MutationObserver calls, and it is why the tab labels and the
     hint change language at all. The first cut of this line was built once
     and never repainted, so it sat there in English on a Spanish dashboard —
     the same silent-English failure the naming canon warns about for a tab
     with no DASH_I18N entry. Caught by t94's Spanish assertion. */
  function momentsHtml() {
    return esc(T("Three lenses on the same young person.", "Tres miradas sobre la misma persona joven.")) +
      " <b>" + esc(T("Today", "Hoy")) + "</b>" +
      esc(T(" \u2014 the morning check-in. ", ": el registro de la ma\u00f1ana. ")) +
      "<b>" + esc(T("This learning experience", "Esta clase")) + "</b>" +
      esc(T(" \u2014 the end-of-day exit slip. ", ": la boleta de salida al final del d\u00eda. ")) +
      "<b>" + esc(T("Over time", "Con el tiempo")) + "</b>" +
      esc(T(" \u2014 the deeper self-reflection, two or three times a year.",
            ": la autorreflexi\u00f3n m\u00e1s profunda, dos o tres veces al a\u00f1o.")) +
      " " + esc(T("Home fills in the rest of the day. The last tab is setup, not an instrument.",
                  "Casa completa el resto del d\u00eda. La \u00faltima pesta\u00f1a es configuraci\u00f3n, no un instrumento."));
  }

  function paint(id) {
    var hint = el("aogDistHint");
    var mo = el("aogDistMoments");
    if (mo) mo.innerHTML = momentsHtml();
    TABS.forEach(function (t) {
      var b = document.querySelector('#aogDistTabs button[data-t="' + t.id + '"]');
      if (b) { b.setAttribute("aria-selected", t.id === id ? "true" : "false");
               b.textContent = T(t.en, t.es); }
      var pane = el("aogDistPane-" + t.id);
      if (pane) pane.classList.toggle("is-on", t.id === id);
      if (t.id === id && hint) hint.textContent = T(t.hintEn, t.hintEs);
    });
    try { localStorage.setItem(KEY, id); } catch (e) {}
  }

  function build() {
    var panel = el("panel-distribute");
    if (!panel) return;
    var bs = blocks(panel);
    if (!bs.length) return;
    injectCss();

    if (!el("aogDistTabs")) {
      var bar = document.createElement("div");
      bar.id = "aogDistTabs";
      bar.setAttribute("role", "tablist");
      bar.innerHTML = TABS.map(function (t) {
        return '<button type="button" role="tab" data-t="' + t.id + '" aria-selected="false" ' +
               'aria-controls="aogDistPane-' + t.id + '">' + esc(T(t.en, t.es)) + "</button>";
      }).join("");
      /* ⚠ §03 — THE THREE MOMENTS, SAID OUT LOUD, ABOVE THE TAB ROW.
         Each tab already explains its own instrument, and that was the whole
         problem: five good hints and nothing saying the first three are
         THREE LENSES ON ONE YOUNG PERSON rather than three unrelated forms.
         Handoff v1 asked for this, v3 asked again as §03, and it was absent
         both times. The cadences are the hero's words and the tab hints'
         words verbatim — if one moves, all three move. */
      var moments = document.createElement("p");
      moments.id = "aogDistMoments";

      var hint = document.createElement("p");
      hint.id = "aogDistHint";
      var panes = document.createElement("div");
      panes.id = "aogDistPanes";
      panes.innerHTML = TABS.map(function (t) {
        return '<div id="aogDistPane-' + t.id + '" role="tabpanel"></div>';
      }).join("");
      /* One navy strip holds all three (.30ef): the framing line, the
         pills, the hint. Ids are unchanged, so paint() and blocks() are
         untouched; only the parent moved. */
      var strip = document.createElement("div");
      strip.id = "aogDistStrip";
      strip.appendChild(moments);
      strip.appendChild(bar);
      strip.appendChild(hint);
      panel.insertBefore(strip, panel.firstChild);
      panel.insertBefore(panes, strip.nextSibling);
      bar.addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("button[data-t]");
        if (b) paint(b.getAttribute("data-t"));
      });
    }

    /* Move each block into its pane, in the order it already had. */
    bs.forEach(function (b) {
      var pane = el("aogDistPane-" + keyOf(b));
      if (!pane) return;
      if (b.head.parentNode !== pane) pane.appendChild(b.head);
      b.rest.forEach(function (n) { if (n.parentNode !== pane) pane.appendChild(n); });
    });

    paint(current());
  }

  function go() { try { build(); } catch (e) {} }
  /* ⚠ A HOOK, BECAUSE A BLOCK CAN ARRIVE AFTER THE LAST TIMER. build() runs at
     DOMContentLoaded and again at 900 / 2600 / 5000 ms, and any block injected
     after that would sit loose at the foot of the panel — visible under every
     tab. The Home check-in card is injected by a block that loads ~12,000
     lines further down, so it calls this when it lands. */
  window.__aogDistRebuild = go;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
  /* The check-in card is injected by another layer; re-run until it has landed. */
  setTimeout(go, 900); setTimeout(go, 2600); setTimeout(go, 5000);
  try { new MutationObserver(function () { paint(current()); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}

  /* ⚠ THAT OBSERVER NEVER FIRES FOR THE DASHBOARD'S OWN LANGUAGE SWITCH, AND
     IT NEVER HAS. applyDashLang() sets the `dashLang` variable, calls
     refreshAdmin(), and re-applies every [data-dl] / [data-dl-html] string —
     but it does NOT set documentElement.lang. Nothing here is driven by
     data-dl (the labels are built in JS), so on a Spanish dashboard the five
     Distribute tab labels and the hint under them sat there in English, and
     had since the tab row shipped. Found on 2026-08-28 by a Spanish
     assertion on the new §03 moments line, which inherited the same fault.
     refreshAdmin IS called, so that is what to hang on. */
  (function langHook() {
    function go() {
      if (typeof window.refreshAdmin !== "function" || window.refreshAdmin.__aogDistLang) return;
      var orig = window.refreshAdmin;
      var wrapped = function () {
        var r = orig.apply(this, arguments);
        try { if (el("aogDistTabs")) paint(current()); } catch (e) {}
        return r;
      };
      wrapped.__aogDistLang = true;
      /* ⚠ CARRY THE OTHER WRAPPERS' FLAGS — see the same note on
         buildHomeReport in #aog-one-story. Three blocks now wrap
         refreshAdmin, each guarding on its own flag; a wrapper that drops
         the others makes them wrap again on their next retry. */
      try {
        Object.keys(orig).forEach(function (k) {
          if (k.indexOf("__aog") === 0 && !wrapped[k]) wrapped[k] = orig[k];
        });
      } catch (eF) {}
      window.refreshAdmin = wrapped;
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
    setTimeout(go, 1200);
    setTimeout(go, 2800);
  })();

  window.AOGDistributeTabs = { build: build, show: paint };
})();
