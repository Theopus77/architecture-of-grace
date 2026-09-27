/* ════════════════════════════════════════════════════════════════════════════
   ARCHITECTURE OF GRACE — THE UNIT JUMP. ONE CONTROL, EVERY UNIT PAGE.

   Jimmy: the unit drop-down "looks meh".

   Every unit page carries, right after <main id="main">:

       <div class="jump no-print"><label><span data-en="Jump to another unit"
         data-es="Ir a otra unidad">…</span>
       <select id="jumpSel">
         <optgroup label="Social Studies · Grades 6–8"> <option value="…">…

   This file leaves that markup exactly where it is (it is the no-JS fallback,
   and the page's own `jumpSel.addEventListener("change", …)` keeps working)
   and builds, next to it, a control that belongs to the site:

     • a physical button in the Interior's panel language — the compass, a
       small gold eyebrow, the current unit's name, a chevron;
     • a panel (a floating card under the button on wide screens, a bottom
       sheet on phones) with a search box, a rail of subject chips, and the
       subjects → bands → units read straight out of the <select>.

   Load it in ONE line, before </body>:

       <script src="/aog-jump.js" defer></script>

   ── THINGS THIS FILE KNOWS ─────────────────────────────────────────────────
   1. THE PAGE OWNS ITS LANGUAGE. Its paintLang() walks every [data-en] in the
      document and sets textContent, so every translated span we add is a
      LEAF (no children). Option labels are read from the <select> AT OPEN
      TIME, every time, so a language switch is honored.
   2. THE PANEL IS REBUILT ON EVERY OPEN. Cheap (a few hundred rows) and it
      means the widget never holds stale state.
   3. TWO PAGES (interior-math, concepts-and-data) call their unit select
      #unitSel and use #jumpSel for an activity picker whose optgroups have no
      "· Grades" suffix. The parser tolerates both: a group label that does
      not split into "Subject · Grades band" becomes a one-band subject.
   4. NOTHING LEAVES THE PAGE. No fetches, no fonts, no icons but inline SVG.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  if (!document.querySelector || !document.addEventListener) return;

  var IDS = ["jumpSel", "unitSel"];
  var SUBJECT_SHORT = { "family & consumer sciences": "FACS" };
  var STR = {
    search:   { en: "Search units…",        es: "Buscar unidades…" },
    searchL:  { en: "Search units",         es: "Buscar unidades" },
    close:    { en: "Close",                es: "Cerrar" },
    none:     { en: "No units match.",      es: "Ninguna unidad coincide." },
    hubs:     { en: "Subject hubs",         es: "Portadas por materia" },
    current:  { en: "Current page",         es: "Página actual" },
    subjects: { en: "Subjects",             es: "Materias" },
    bands:    { en: "bands",                es: "bandas" },
    band:     { en: "band",                 es: "banda" },
    units:    { en: "units",                es: "unidades" },
    unit:     { en: "unit",                 es: "unidad" },
    results:  { en: "results",              es: "resultados" }
  };

  /* ── CSS ────────────────────────────────────────────────────────────────── */
  var CSS = [
    ":root{",
    "  --aogj-face:linear-gradient(180deg,var(--field,#fff) 0%,var(--field-2,#EFEAE0) 100%);",
    "  --aogj-face-hi:linear-gradient(180deg,#fff 0%,var(--field,#fff) 100%);",
    "  --aogj-sheen:rgba(255,255,255,.85);",
    "  --aogj-press:rgba(29,39,51,.10);",
    "  --aogj-panel:var(--field,#fff);",
    "  --aogj-panel-shadow:0 1px 0 rgba(255,255,255,.7),0 30px 60px -28px rgba(29,39,51,.55),0 12px 24px -16px rgba(29,39,51,.35);",
    "  --aogj-well:var(--field-2,#EFEAE0);",
    "  --aogj-well-inset:inset 0 2px 4px rgba(29,39,51,.10),inset 0 1px 0 rgba(29,39,51,.04);",
    "  --aogj-scrim:rgba(29,39,51,.42);",
    "  --aogj-check:var(--gold-deep,#7A5C1F);",
    "  --aogj-check-bg:rgba(184,137,58,.14);",
    "  --aogj-icon-bg:radial-gradient(circle at 35% 30%,rgba(255,255,255,.95),rgba(184,137,58,.22) 70%,rgba(184,137,58,.34));",
    "  --aogj-icon:var(--navy,#1B3A5F);",
    "  --aogj-on-navy:#fff;",
    "  --aogj-ring:rgba(184,137,58,.20);",
    "}",
    "@media (prefers-color-scheme:dark){:root:not([data-theme=\"light\"]){",
    "  --aogj-face:linear-gradient(180deg,#232B36 0%,var(--field,#1A2029) 100%);",
    "  --aogj-face-hi:linear-gradient(180deg,#2A333F 0%,#1F2731 100%);",
    "  --aogj-sheen:rgba(233,238,244,.10);",
    "  --aogj-press:rgba(0,0,0,.35);",
    "  --aogj-panel:#1E2530;",
    "  --aogj-panel-shadow:0 0 0 1px rgba(233,238,244,.06),0 34px 70px -30px rgba(0,0,0,.95),0 12px 26px -16px rgba(0,0,0,.8);",
    "  --aogj-well:#12161C;",
    "  --aogj-well-inset:inset 0 2px 5px rgba(0,0,0,.55),inset 0 1px 0 rgba(0,0,0,.4);",
    "  --aogj-scrim:rgba(0,0,0,.6);",
    "  --aogj-check:var(--gold,#D6A852);",
    "  --aogj-check-bg:rgba(214,168,82,.16);",
    "  --aogj-icon-bg:radial-gradient(circle at 35% 30%,rgba(214,168,82,.42),rgba(214,168,82,.14) 70%,rgba(0,0,0,.25));",
    "  --aogj-icon:var(--gold,#D6A852);",
    "  --aogj-on-navy:#12161C;",
    "  --aogj-ring:rgba(214,168,82,.24);",
    "}}",
    ":root[data-theme=\"dark\"]{",
    "  --aogj-face:linear-gradient(180deg,#232B36 0%,var(--field,#1A2029) 100%);",
    "  --aogj-face-hi:linear-gradient(180deg,#2A333F 0%,#1F2731 100%);",
    "  --aogj-sheen:rgba(233,238,244,.10);",
    "  --aogj-press:rgba(0,0,0,.35);",
    "  --aogj-panel:#1E2530;",
    "  --aogj-panel-shadow:0 0 0 1px rgba(233,238,244,.06),0 34px 70px -30px rgba(0,0,0,.95),0 12px 26px -16px rgba(0,0,0,.8);",
    "  --aogj-well:#12161C;",
    "  --aogj-well-inset:inset 0 2px 5px rgba(0,0,0,.55),inset 0 1px 0 rgba(0,0,0,.4);",
    "  --aogj-scrim:rgba(0,0,0,.6);",
    "  --aogj-check:var(--gold,#D6A852);",
    "  --aogj-check-bg:rgba(214,168,82,.16);",
    "  --aogj-icon-bg:radial-gradient(circle at 35% 30%,rgba(214,168,82,.42),rgba(214,168,82,.14) 70%,rgba(0,0,0,.25));",
    "  --aogj-icon:var(--gold,#D6A852);",
    "  --aogj-on-navy:#12161C;",
    "  --aogj-ring:rgba(214,168,82,.24);",
    "}",

    /* the native control: still in the DOM, still the no-JS fallback */
    ".aog-jump-native{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;border:0!important}",
    ".aogj-host{position:relative}",
    ".aogj-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}",

    /* ── the button ── */
    ".aogj-btn{display:flex;align-items:center;gap:14px;width:100%;max-width:560px;min-height:60px;margin:0;padding:8px 14px 8px 10px;",
    "  border:1px solid var(--rule);border-radius:16px;background:var(--aogj-face);color:var(--ink);font:inherit;text-align:left;cursor:pointer;",
    "  box-shadow:inset 0 1px 0 var(--aogj-sheen),var(--lift-sm);transition:transform .14s ease,box-shadow .14s ease,border-color .14s ease;-webkit-tap-highlight-color:transparent}",
    ".aogj-btn:hover{border-color:var(--gold);box-shadow:inset 0 1px 0 var(--aogj-sheen),0 1px 2px rgba(29,39,51,.07),0 12px 26px -14px rgba(29,39,51,.5);transform:translateY(-1px)}",
    ".aogj-btn:active,.aogj-btn[aria-expanded=\"true\"]{transform:translateY(1px);background:var(--aogj-face-hi);box-shadow:inset 0 2px 4px var(--aogj-press)}",
    ".aogj-btn:focus-visible{outline:3px solid var(--focus);outline-offset:2px}",
    ".aogj-ico{flex:0 0 auto;width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:var(--aogj-icon-bg);color:var(--aogj-icon);",
    "  box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -2px 3px rgba(29,39,51,.10),0 1px 1px rgba(29,39,51,.08)}",
    ":root[data-theme=\"dark\"] .aogj-ico{box-shadow:inset 0 1px 0 rgba(233,238,244,.12),inset 0 -2px 3px rgba(0,0,0,.4)}",
    "@media (prefers-color-scheme:dark){:root:not([data-theme=\"light\"]) .aogj-ico{box-shadow:inset 0 1px 0 rgba(233,238,244,.12),inset 0 -2px 3px rgba(0,0,0,.4)}}",
    ".aogj-ico svg{width:24px;height:24px;display:block}",
    ".aogj-txt{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px}",
    ".aogj-eyebrow{display:block;font-size:.7rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--gold-deep);line-height:1.2}",
    ".aogj-cur{display:block;font-size:1.02rem;font-weight:800;line-height:1.25;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".aogj-chev{flex:0 0 auto;width:30px;height:30px;border-radius:999px;display:flex;align-items:center;justify-content:center;color:var(--ink-soft);background:var(--aogj-well);box-shadow:var(--aogj-well-inset);transition:transform .2s ease}",
    ".aogj-chev svg{width:16px;height:16px;display:block}",
    ".aogj-btn[aria-expanded=\"true\"] .aogj-chev{transform:rotate(180deg)}",

    /* ── the panel ── */
    ".aogj-backdrop{display:none;position:fixed;inset:0;z-index:1200;background:var(--aogj-scrim);opacity:0;transition:opacity .2s ease}",
    ".aogj-backdrop.is-on{display:block;opacity:1}",
    ".aogj-panel{position:absolute;z-index:1210;left:0;top:calc(100% + 10px);width:min(560px,100%);max-height:70vh;display:flex;flex-direction:column;",
    "  background:var(--aogj-panel);color:var(--ink);border:1px solid var(--rule);border-radius:18px;box-shadow:var(--aogj-panel-shadow);overflow:hidden;",
    "  transform-origin:top left;transition:opacity .16s ease,transform .18s cubic-bezier(.2,.8,.3,1.1)}",
    ".aogj-panel[hidden]{display:none}",
    ".aogj-panel.is-pre{opacity:0;transform:translateY(-6px) scale(.985)}",
    ".aogj-handle{display:none}",
    ".aogj-head{display:flex;align-items:center;gap:10px;padding:14px 12px 10px 18px;border-bottom:1px solid var(--rule-soft)}",
    ".aogj-title{flex:1 1 auto;font-size:.72rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--gold-deep)}",
    ".aogj-x{flex:0 0 auto;width:48px;height:48px;margin:-8px -4px -8px 0;border:1px solid transparent;border-radius:12px;background:transparent;color:var(--ink-soft);cursor:pointer;display:flex;align-items:center;justify-content:center;font:inherit}",
    ".aogj-x:hover{background:var(--aogj-well);color:var(--ink);border-color:var(--rule-soft)}",
    ".aogj-x:focus-visible{outline:3px solid var(--focus);outline-offset:-3px}",
    ".aogj-x svg{width:18px;height:18px;display:block}",
    ".aogj-tools{padding:12px 16px 0;display:flex;flex-direction:column;gap:10px}",
    ".aogj-search{position:relative;display:block}",
    ".aogj-search svg{position:absolute;left:14px;top:50%;width:18px;height:18px;margin-top:-9px;color:var(--ink-faint);pointer-events:none}",
    ".aogj-in{display:block;width:100%;min-height:48px;margin:0;padding:10px 40px 10px 42px;border:1px solid var(--rule);border-radius:12px;background:var(--aogj-well);color:var(--ink);",
    "  font:inherit;font-size:16px;box-shadow:var(--aogj-well-inset);-webkit-appearance:none;appearance:none}",
    ".aogj-in::placeholder{color:var(--ink-faint);opacity:1}",
    ".aogj-in:focus{outline:none;border-color:var(--gold);box-shadow:var(--aogj-well-inset),0 0 0 4px var(--aogj-ring)}",
    ".aogj-in::-webkit-search-cancel-button{-webkit-appearance:none;appearance:none}",
    ".aogj-clear{position:absolute;right:4px;top:50%;width:40px;height:40px;margin-top:-20px;border:0;border-radius:10px;background:transparent;color:var(--ink-soft);cursor:pointer;display:none;align-items:center;justify-content:center}",
    ".aogj-clear.is-on{display:flex}",
    ".aogj-clear svg{width:14px;height:14px}",
    ".aogj-clear:focus-visible{outline:3px solid var(--focus);outline-offset:-3px}",
    ".aogj-rail{display:flex;gap:8px;overflow-x:auto;padding:2px 28px 12px 2px;margin:0 -2px;scrollbar-width:none;-webkit-overflow-scrolling:touch;-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 36px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 36px),transparent)}",
    ".aogj-rail::-webkit-scrollbar{display:none}",
    ".aogj-chip{flex:0 0 auto;min-height:44px;padding:0 15px;border:1px solid var(--rule);border-radius:999px;background:var(--aogj-face);color:var(--ink);font:inherit;font-size:.88rem;font-weight:700;cursor:pointer;white-space:nowrap;",
    "  box-shadow:inset 0 1px 0 var(--aogj-sheen),0 1px 2px rgba(29,39,51,.06)}",
    ".aogj-chip:hover{border-color:var(--gold)}",
    ".aogj-chip[aria-pressed=\"true\"]{background:var(--navy);border-color:var(--navy);color:var(--aogj-on-navy);box-shadow:inset 0 1px 0 rgba(255,255,255,.18),inset 0 -2px 0 rgba(0,0,0,.18)}",
    ".aogj-chip:focus-visible{outline:3px solid var(--focus);outline-offset:2px}",
    ".aogj-body{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:4px 10px 12px;border-top:1px solid var(--rule-soft);scroll-padding-top:12px}",
    /* AOG-JUMP-SCROLL-V2 (2026-09-27) — Jimmy: "make the scroll bar more obvious but elegant". Phones and
       Macs hide the native bar until you scroll, so the panel draws its own: a slim soft track down the right
       edge and a gold handle that shows where you are; drag it, tap the track, or scroll as usual. */
    ".aogj-bodywrap{position:relative;flex:1 1 auto;min-height:0;display:flex;flex-direction:column}",
    ".aogj-body{scrollbar-width:none;padding-right:22px}",
    ".aogj-body::-webkit-scrollbar{display:none}",
    ".aogj-ybar{position:absolute;top:8px;bottom:8px;right:6px;width:8px;border-radius:8px;background:rgba(27,58,95,.09);cursor:pointer;touch-action:none}",
    ".aogj-ybar[hidden]{display:none}",
    ".aogj-ythumb{position:absolute;left:0;right:0;top:0;min-height:36px;border-radius:8px;background:linear-gradient(180deg,#D8B660,#B8913A);box-shadow:0 1px 2px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.35);cursor:grab}",
    ".aogj-ybar:hover .aogj-ythumb,.aogj-ythumb.drag{background:linear-gradient(180deg,#C9A24B,#9E7A2A);cursor:grabbing}",
    ".aogj-ybar::after{content:'';position:absolute;inset:-8px -6px}",
    ":root[data-theme=dark] .aogj-ybar{background:rgba(255,255,255,.10)}",
    ":root[data-theme=dark] .aogj-ythumb{background:linear-gradient(180deg,#F2D892,#E0B85A)}",
    ".aogj-subj{margin:6px 0 0}",
    ".aogj-subj+.aogj-subj{border-top:1px solid var(--rule-soft);padding-top:6px}",
    ".aogj-subjhead{display:flex;align-items:center;gap:10px;width:100%;min-height:48px;padding:6px 8px 6px 10px;border:0;border-radius:12px;background:transparent;color:var(--ink);font:inherit;text-align:left;cursor:pointer}",
    ".aogj-subjhead:hover{background:var(--a-wash)}",
    ".aogj-subjhead:focus-visible{outline:3px solid var(--focus);outline-offset:-3px}",
    ".aogj-subjname{font-weight:800;font-size:1rem}",
    ".aogj-subjmeta{flex:1 1 auto;color:var(--ink-faint);font-size:.85rem;font-weight:600}",
    ".aogj-subjhead svg{flex:0 0 auto;width:16px;height:16px;color:var(--ink-faint);transition:transform .2s ease}",
    ".aogj-subjhead[aria-expanded=\"true\"] svg{transform:rotate(180deg)}",
    ".aogj-subjhead[aria-expanded=\"true\"] .aogj-subjmeta{color:var(--ink-soft)}",
    ".aogj-bands{padding:0 0 6px}",
    ".aogj-bands[hidden]{display:none}",
    ".aogj-band{padding:4px 0 2px}",
    ".aogj-bandlab{display:flex;align-items:baseline;gap:8px;padding:10px 10px 4px;font-size:.7rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--gold-deep)}",
    ".aogj-bandlab i{font-style:normal;color:var(--ink-faint);letter-spacing:.04em;font-weight:600;order:2}",
    ".aogj-bandlab::after{content:\"\";flex:1 1 auto;height:1px;background:var(--rule-soft);align-self:center;order:1}",
    ".aogj-list,.aogj-subs{list-style:none;margin:0;padding:0}",
    ".aogj-subs{margin:0 0 4px 22px;padding-left:12px;border-left:2px solid var(--rule)}",
    ".aogj-row{display:flex;align-items:center;gap:10px;min-height:48px;padding:8px 12px;border-radius:10px;color:var(--ink);text-decoration:none;font-weight:600;line-height:1.3;cursor:pointer}",
    ".aogj-row:hover{background:var(--a-wash);color:var(--a)}",
    ".aogj-row:focus-visible{outline:3px solid var(--focus);outline-offset:-3px}",
    ".aogj-subs .aogj-row{min-height:44px;font-weight:500;font-size:.94rem;color:var(--ink-soft)}",
    ".aogj-subs .aogj-row:hover{color:var(--a)}",
    ".aogj-row .aogj-dot{flex:0 0 auto;width:6px;height:6px;border-radius:999px;background:var(--rule);margin:0 4px}",
    ".aogj-subs .aogj-row .aogj-dot{width:5px;height:5px}",
    ".aogj-row.is-cur,.aogj-subs .aogj-row.is-cur{background:var(--aogj-check-bg);color:var(--ink);font-weight:800;cursor:default}",
    ".aogj-row .aogj-ck{display:none;flex:0 0 auto;width:22px;height:22px;border-radius:999px;background:var(--aogj-check);color:var(--field);align-items:center;justify-content:center;margin:0 -4px}",
    ".aogj-row.is-cur .aogj-ck{display:flex}",
    ".aogj-row.is-cur .aogj-dot{display:none}",
    ".aogj-ck svg{width:12px;height:12px}",
    ".aogj-rowtxt{flex:1 1 auto;min-width:0}",
    ".aogj-empty{padding:26px 14px;text-align:center;color:var(--ink-soft);font-weight:600}",
    ".aogj-empty[hidden]{display:none}",
    ".aogj-foot{border-top:1px solid var(--rule);background:var(--aogj-well);padding:8px 16px 8px}",
    ".aogj-footlab{display:block;font-size:.66rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--ink-faint);margin:0 0 2px}",
    ".aogj-hubs{display:flex;flex-wrap:wrap;gap:0 2px;margin:0 -8px}",
    ".aogj-hub{display:inline-flex;align-items:center;min-height:40px;padding:0 8px;border-radius:10px;color:var(--navy);font-weight:700;font-size:.84rem;text-decoration:none;white-space:nowrap}",
    ".aogj-hub:hover{background:var(--a-wash);text-decoration:underline;text-underline-offset:3px}",
    ".aogj-hub:focus-visible{outline:3px solid var(--focus);outline-offset:-3px}",
    ".is-hid{display:none!important}",
    ".aogj-panel.is-q .aogj-subjmeta,.aogj-panel.is-q .aogj-subjhead svg{display:none}",
    ".aogj-panel.is-q .aogj-subjhead{min-height:40px;padding-top:10px;pointer-events:none}",
    ".aogj-row.is-ctx{font-weight:500;color:var(--ink-soft)}",

    /* ── phone: bottom sheet ── */
    "@media (max-width:719.98px){",
    "  .aogj-panel{position:fixed;left:0;right:0;bottom:0;top:auto;width:auto;max-width:none;max-height:min(88vh,88dvh);border-radius:22px 22px 0 0;border-bottom:0;transform-origin:bottom center;padding-bottom:env(safe-area-inset-bottom,0)}",
    "  .aogj-panel.is-pre{transform:translateY(24px);opacity:0}",
    "  .aogj-handle{display:block;width:44px;height:5px;border-radius:999px;background:var(--rule);margin:10px auto 0}",
    "  .aogj-head{padding-top:8px}",
    "  html.aogj-lock,html.aogj-lock body{overflow:hidden!important;overscroll-behavior:none}",
    "}",
    "@media (prefers-reduced-motion:reduce){.aogj-btn,.aogj-chev,.aogj-panel,.aogj-backdrop,.aogj-subjhead svg{transition:none!important}.aogj-panel.is-pre{transform:none}}",
    "@media print{.aogj-btn,.aogj-panel,.aogj-backdrop,.aogj-host{display:none!important}}"
  ].join("\n");

  /* ── SVG ────────────────────────────────────────────────────────────────── */
  var SVG = {
    compass: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.2"/><path d="M15.6 8.4l-2.3 5.6-5.6 2.3 2.3-5.6z" fill="currentColor" stroke="none" opacity=".92"/><path d="M12 2.8v1.8M12 19.4v1.8M2.8 12h1.8M19.4 12h1.8" stroke-width="1.6"/></svg>',
    chev: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 6l4.5 4.5L12.5 6"/></svg>',
    x: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.6-4.6"/></svg>',
    check: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3.2 3L13 4.8"/></svg>'
  };

  /* ── helpers ────────────────────────────────────────────────────────────── */
  function lang() {
    var l = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
    return l.indexOf("es") === 0 ? "es" : "en";
  }
  function t(key) { return STR[key][lang()]; }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function leaf(tag, cls, en, es, text) {
    var n = el(tag, cls);
    n.setAttribute("data-en", en);
    n.setAttribute("data-es", es);
    n.textContent = text != null ? text : (lang() === "es" ? es : en);
    return n;
  }
  function fold(s) {
    s = String(s || "").toLowerCase();
    if (s.normalize) { try { s = s.normalize("NFD").replace(/[̀-ͯ]/g, ""); } catch (e) {} }
    return s.replace(/\s+/g, " ").replace(/^ | $/g, "");
  }
  function cleanText(s) { return String(s || "").replace(/ /g, " ").replace(/\s+/g, " ").replace(/^ | $/g, ""); }
  function isIndented(opt) { return /^(?: |\s){2,}/.test(opt.text || opt.textContent || ""); }
  function reducedMotion() {
    try { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  }
  function isPhone() {
    try { return window.matchMedia && window.matchMedia("(max-width: 719.98px)").matches; } catch (e) { return false; }
  }
  function visible(n) { return !!(n.offsetWidth || n.offsetHeight || n.getClientRects().length); }

  var BAND_RE = /(?:K|\d{1,2})\s*[–\-]\s*\d{1,2}$/;

  /* "Social Studies 6–8 · The World Before 1500" → "The World Before 1500".
     Strips a leading segment only when it names a subject or ends in a band. */
  function stripPrefix(text, subjects) {
    var parts = text.split(" · ");
    if (parts.length < 2) return text;
    var head = cleanText(parts[0]);
    var headNoBand = cleanText(head.replace(BAND_RE, ""));
    var ok = BAND_RE.test(head);
    if (!ok) {
      for (var i = 0; i < subjects.length; i++) {
        var s = fold(subjects[i]);
        if (fold(head) === s || fold(headNoBand) === s || fold(head) === fold(SUBJECT_SHORT[s] || "")) { ok = true; break; }
      }
      if (!ok && /^[a-z .&]+$/i.test(headNoBand) && /^(facs|fcs|ela|stem)$/i.test(headNoBand)) ok = true;
    }
    return ok ? parts.slice(1).join(" · ") : text;
  }

  /* Read the <select> into subjects → bands → rows. Done on every open. */
  function parse(sel) {
    var subjects = [], byName = {}, hubs = [], loose = [], current = null;
    function subject(name) {
      var k = fold(name);
      if (!byName[k]) { byName[k] = { name: name, bands: [], units: 0 }; subjects.push(byName[k]); }
      return byName[k];
    }
    function rowsOf(container) {
      var rows = [], last = null;
      Array.prototype.forEach.call(container.children, function (o) {
        if (o.tagName !== "OPTION") return;
        var r = { text: cleanText(o.text || o.textContent), value: o.value || "", cur: !!o.selected && !o.value, subs: [] };
        if (isIndented(o) && last) { last.subs.push(r); } else { rows.push(r); last = r; }
        if (r.cur) current = r;
      });
      return rows;
    }
    Array.prototype.forEach.call(sel.children, function (g) {
      if (g.tagName === "OPTGROUP") {
        var label = cleanText(g.label || g.getAttribute("label"));
        var rows = rowsOf(g);
        if (/^jump to a subject$/i.test(label) || /^ir a una materia$/i.test(label)) { hubs = hubs.concat(rows); return; }
        var m = label.split(" · ");
        var sName = m[0], bName = null;
        if (m.length > 1 && /^(grades?|grados?)\b/i.test(m[m.length - 1])) { bName = m.slice(1).join(" · "); sName = m.slice(0, -1).join(" · "); }
        var S = subject(sName);
        var units = 0;
        rows.forEach(function (r) { units += 1 + r.subs.length; if (r.cur || anyCur(r.subs)) S.hasCur = true; });
        S.units += units;
        S.bands.push({ name: bName, rows: rows, units: units });
      } else if (g.tagName === "OPTION") {
        var l = rowsOf({ children: [g] });
        loose = loose.concat(l);
      }
    });
    function anyCur(list) { for (var i = 0; i < list.length; i++) if (list[i].cur) return true; return false; }
    return { subjects: subjects, hubs: hubs, loose: loose, current: current };
  }

  function currentName(sel, data) {
    var names = data.subjects.map(function (s) { return s.name; });
    var opt = sel.options[sel.selectedIndex];
    var txt = cleanText(opt ? (opt.text || opt.textContent) : "");
    if (!txt) return "";
    return stripPrefix(txt, names);
  }

  /* ── one widget per select ──────────────────────────────────────────────── */
  function build(sel) {
    var host = sel.parentNode;
    /* the label: either wraps the select or points at it */
    var label = sel.closest ? sel.closest("label") : null;
    if (!label) { var byFor = sel.id ? document.querySelector('label[for="' + sel.id + '"]') : null; if (byFor) label = byFor; }
    var labelSpan = label ? label.querySelector("[data-en]") : null;
    var eyeEn = labelSpan ? labelSpan.getAttribute("data-en") : "Jump to another unit";
    var eyeEs = labelSpan ? labelSpan.getAttribute("data-es") || eyeEn : "Ir a otra unidad";
    if (label && label.contains(sel)) { host = label.parentNode; }
    if (host.classList) host.classList.add("aogj-host");

    /* hide the native control (kept for no-JS and for the page's own handler) */
    if (label) { label.classList.add("aog-jump-native"); label.setAttribute("aria-hidden", "true"); }
    if (!label || !label.contains(sel)) { sel.classList.add("aog-jump-native"); sel.setAttribute("aria-hidden", "true"); }
    sel.setAttribute("tabindex", "-1");

    var uid = "aogj-" + (sel.id || Math.floor(Math.random() * 1e6));

    /* button */
    var btn = el("button", "aogj-btn");
    btn.type = "button";
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", uid + "-panel");
    var ico = el("span", "aogj-ico", SVG.compass);
    var txt = el("span", "aogj-txt");
    var eyebrow = leaf("span", "aogj-eyebrow", eyeEn, eyeEs);
    var cur = el("span", "aogj-cur");
    txt.appendChild(eyebrow); txt.appendChild(cur);
    var chev = el("span", "aogj-chev", SVG.chev);
    btn.appendChild(ico); btn.appendChild(txt); btn.appendChild(chev);

    /* panel shell */
    var panel = el("div", "aogj-panel");
    panel.id = uid + "-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", uid + "-title");
    panel.hidden = true;
    var backdrop = el("div", "aogj-backdrop");

    var anchor = (label && label.contains(sel)) ? label : sel;
    anchor.parentNode.insertBefore(btn, anchor.nextSibling);
    btn.parentNode.insertBefore(panel, btn.nextSibling);
    document.body.appendChild(backdrop);

    var state = { open: false, data: null, q: "" };

    function refreshButton() {
      state.data = parse(sel);
      cur.textContent = currentName(sel, state.data) || (lang() === "es" ? "Elegir" : "Choose");
    }
    refreshButton();

    /* ── render ── */
    function render() {
      var data = state.data = parse(sel);
      var L = lang();
      panel.innerHTML = "";
      state.q = "";

      panel.appendChild(el("div", "aogj-handle"));
      var head = el("div", "aogj-head");
      var title = leaf("span", "aogj-title", eyeEn, eyeEs); title.id = uid + "-title";
      var x = el("button", "aogj-x", SVG.x); x.type = "button"; x.setAttribute("aria-label", t("close"));
      head.appendChild(title); head.appendChild(x);
      panel.appendChild(head);

      var tools = el("div", "aogj-tools");
      var search = el("label", "aogj-search");
      search.innerHTML = SVG.search;
      var sl = leaf("span", "aogj-sr", STR.searchL.en, STR.searchL.es);
      var input = el("input", "aogj-in");
      input.type = "search"; input.setAttribute("autocomplete", "off"); input.setAttribute("autocapitalize", "off"); input.setAttribute("spellcheck", "false");
      input.placeholder = t("search"); input.setAttribute("aria-label", t("searchL"));
      var clear = el("button", "aogj-clear", SVG.x); clear.type = "button"; clear.setAttribute("aria-label", t("close")); clear.tabIndex = -1;
      search.appendChild(sl); search.appendChild(input); search.appendChild(clear);
      tools.appendChild(search);

      var rail = null;
      if (data.subjects.length > 1) {
        rail = el("div", "aogj-rail");
        rail.setAttribute("role", "group");
        rail.setAttribute("aria-label", t("subjects"));
        tools.appendChild(rail);
      }
      panel.appendChild(tools);

      var body = el("div", "aogj-body");
      var live = el("div", "aogj-sr"); live.setAttribute("aria-live", "polite");
      var empty = leaf("div", "aogj-empty", STR.none.en, STR.none.es); empty.hidden = true;
      body.appendChild(live);
      /* AOG-JUMP-SCROLL-V2 — the drawn scroll bar */
      var bwrap = el("div", "aogj-bodywrap"); bwrap.appendChild(body); panel.appendChild(bwrap);
      var ybar = el("div", "aogj-ybar"); ybar.setAttribute("aria-hidden", "true");
      var ythumb = el("div", "aogj-ythumb"); ybar.appendChild(ythumb); bwrap.appendChild(ybar);
      var ySync = function () {
        var sh = body.scrollHeight, ch = body.clientHeight, tr = ybar.clientHeight;
        if (sh <= ch + 2 || !tr) { ybar.hidden = true; return; }
        ybar.hidden = false;
        var th = Math.max(36, Math.round(tr * ch / sh));
        ythumb.style.height = th + "px";
        ythumb.style.transform = "translateY(" + Math.round((tr - th) * body.scrollTop / (sh - ch)) + "px)";
      };
      body.addEventListener("scroll", ySync, { passive: true });
      if (window.ResizeObserver) new ResizeObserver(ySync).observe(body);
      if (window.MutationObserver) new MutationObserver(function () { requestAnimationFrame(ySync); }).observe(body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "aria-expanded"] });
      var yDrag = null;
      ybar.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        var r = ybar.getBoundingClientRect(), th = ythumb.offsetHeight, sh = body.scrollHeight, ch = body.clientHeight;
        var tRect = ythumb.getBoundingClientRect();
        var grab = (e.clientY >= tRect.top && e.clientY <= tRect.bottom) ? e.clientY - tRect.top : th / 2;
        var move = function (y) { var f = (y - r.top - grab) / Math.max(1, r.height - th); body.scrollTop = Math.max(0, Math.min(1, f)) * (sh - ch); };
        move(e.clientY); yDrag = move; ythumb.classList.add("drag");
        try { ybar.setPointerCapture(e.pointerId); } catch (err) {}
      });
      ybar.addEventListener("pointermove", function (e) { if (yDrag) yDrag(e.clientY); });
      var yEnd = function () { yDrag = null; ythumb.classList.remove("drag"); };
      ybar.addEventListener("pointerup", yEnd); ybar.addEventListener("pointercancel", yEnd);
      setTimeout(ySync, 0);

      var openSubject = null;
      data.subjects.forEach(function (S) { if (S.hasCur && !openSubject) openSubject = S; });
      if (!openSubject && data.subjects.length) openSubject = data.subjects[0];

      var sections = [];
      var subjectNames = data.subjects.map(function (S) { return S.name; });
      function row(r, sub) {
        var li = el("li");
        var a;
        if (r.cur) {
          a = el("span", "aogj-row is-cur");
          a.setAttribute("aria-current", "page");
          a.tabIndex = 0;
        } else {
          a = el("a", "aogj-row");
          a.href = r.value;
        }
        a.setAttribute("data-k", fold(r.text));
        var ck = el("span", "aogj-ck", SVG.check);
        var dot = el("span", "aogj-dot");
        var tx = el("span", "aogj-rowtxt"); tx.textContent = r.cur ? stripPrefix(r.text, subjectNames) : r.text;
        a.appendChild(ck); a.appendChild(dot); a.appendChild(tx);
        if (r.cur) { a.appendChild(leaf("span", "aogj-sr", " " + STR.current.en, " " + STR.current.es)); }
        li.appendChild(a);
        if (r.subs.length) {
          var ul = el("ul", "aogj-subs");
          r.subs.forEach(function (s) { ul.appendChild(row(s, true)); });
          li.appendChild(ul);
        }
        return li;
      }

      /* loose options (a placeholder outside any optgroup) are skipped when
         they are the selected "" entry, else shown as a first band */
      var looseRows = data.loose.filter(function (r) { return !(r.cur && !r.value); });
      if (looseRows.length) {
        data.subjects.unshift({ name: "", bands: [{ name: null, rows: looseRows, units: looseRows.length }], units: looseRows.length, loose: true });
      }

      data.subjects.forEach(function (S) {
        var sec = el("section", "aogj-subj");
        var bands = el("div", "aogj-bands");
        var isOpen = (S === openSubject) || S.loose || data.subjects.length === 1;
        var headBtn = null;
        if (!S.loose && data.subjects.length > 1) {
          headBtn = el("button", "aogj-subjhead"); headBtn.type = "button";
          headBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
          var nm = el("span", "aogj-subjname"); nm.textContent = S.name;
          var nb = S.bands.length, nu = S.units;
          var metaEn = nb + " " + (nb === 1 ? STR.band.en : STR.bands.en) + " · " + nu + " " + (nu === 1 ? STR.unit.en : STR.units.en);
          var metaEs = nb + " " + (nb === 1 ? STR.band.es : STR.bands.es) + " · " + nu + " " + (nu === 1 ? STR.unit.es : STR.units.es);
          var meta = leaf("span", "aogj-subjmeta", metaEn, metaEs);
          headBtn.appendChild(nm); headBtn.appendChild(meta); headBtn.insertAdjacentHTML("beforeend", SVG.chev);
          sec.appendChild(headBtn);
          bands.hidden = !isOpen;
          bands.id = uid + "-s" + sections.length;
          headBtn.setAttribute("aria-controls", bands.id);
        }
        S.bands.forEach(function (B) {
          var bd = el("div", "aogj-band");
          if (B.name) {
            var bl = el("div", "aogj-bandlab");
            var bn = el("span"); bn.textContent = B.name;
            var bc = el("i"); bc.textContent = String(B.units);
            bl.appendChild(bn); bl.appendChild(bc);
            bd.appendChild(bl);
          }
          var ul = el("ul", "aogj-list");
          B.rows.forEach(function (r) { ul.appendChild(row(r, false)); });
          bd.appendChild(ul);
          bd.setAttribute("data-k", fold((S.name || "") + " " + (B.name || "")));
          bands.appendChild(bd);
        });
        sec.appendChild(bands);
        body.appendChild(sec);
        var rec = { S: S, sec: sec, bands: bands, head: headBtn, chip: null };
        sections.push(rec);

        if (rail && !S.loose) {
          var chip = el("button", "aogj-chip"); chip.type = "button";
          chip.textContent = SUBJECT_SHORT[fold(S.name)] || S.name;
          chip.setAttribute("aria-pressed", isOpen ? "true" : "false");
          chip.setAttribute("aria-controls", bands.id);
          chip.title = S.name;
          rail.appendChild(chip);
          rec.chip = chip;
          chip.addEventListener("click", function () {
            /* a chip opens that subject alone and brings it into view */
            sections.forEach(function (o) { if (o.head) setOpen(o, o === rec); });
            var top = sec.offsetTop - body.offsetTop;
            if (body.scrollTo && !reducedMotion()) body.scrollTo({ top: top, behavior: "smooth" }); else body.scrollTop = top;
          });
        }
        if (headBtn) headBtn.addEventListener("click", function () { setOpen(rec, bands.hidden); });
      });
      body.appendChild(empty);

      function setOpen(rec, on) {
        if (!rec.head) return;
        rec.bands.hidden = !on;
        rec.head.setAttribute("aria-expanded", on ? "true" : "false");
        if (rec.chip) rec.chip.setAttribute("aria-pressed", on ? "true" : "false");
      }

      /* footer: the subject hubs — AOG-JUMP-NOHUBS-V1 (2026-09-27): Jimmy, "Remove the subject hub at the
         bottom of the box." The hubs stay in the Explore menu and the subject chips above. */
      if (false && data.hubs.length) {
        var foot = el("div", "aogj-foot");
        foot.appendChild(leaf("span", "aogj-footlab", STR.hubs.en, STR.hubs.es));
        var hubs = el("div", "aogj-hubs");
        data.hubs.forEach(function (h) {
          var a = el("a", "aogj-hub"); a.href = h.value;
          var m = h.text.match(/^(?:All of|Todo(?: de)?)\s+(.+?)\s+[—–-]\s+.+$/);
          var nm2 = m ? m[1] : h.text; a.textContent = SUBJECT_SHORT[fold(nm2)] || nm2;
          a.title = h.text;
          hubs.appendChild(a);
        });
        foot.appendChild(hubs);
        panel.appendChild(foot);
      }

      /* ── search ── */
      var savedOpen = null;
      function filter(q) {
        q = fold(q);
        state.q = q;
        clear.classList.toggle("is-on", !!q);
        if (q && savedOpen === null) savedOpen = sections.map(function (r) { return !r.bands.hidden; });
        var shown = 0;
        sections.forEach(function (rec, i) {
          var any = false;
          Array.prototype.forEach.call(rec.bands.querySelectorAll(".aogj-band"), function (bd) {
            var bandHit = q && bd.getAttribute("data-k").indexOf(q) > -1;
            var bandAny = false;
            Array.prototype.forEach.call(bd.querySelectorAll(".aogj-list > li"), function (li) {
              var top = li.firstChild, hit = !q || bandHit || top.getAttribute("data-k").indexOf(q) > -1;
              var subAny = false;
              Array.prototype.forEach.call(li.querySelectorAll(".aogj-subs > li"), function (sli) {
                var sh = !q || bandHit || hit || sli.firstChild.getAttribute("data-k").indexOf(q) > -1;
                sli.classList.toggle("is-hid", !sh);
                if (sh) { subAny = true; shown++; }
              });
              var show = hit || subAny;
              top.classList.toggle("is-ctx", !!q && !hit && subAny);
              li.classList.toggle("is-hid", !show);
              if (show) { bandAny = true; if (hit) shown++; }
            });
            bd.classList.toggle("is-hid", !bandAny);
            if (bandAny) any = true;
          });
          rec.sec.classList.toggle("is-hid", q ? !any : false);
          if (q) { setOpen(rec, true); }
          else if (savedOpen) { setOpen(rec, savedOpen[i]); }
        });
        if (!q) savedOpen = null;
        if (rail) rail.classList.toggle("is-hid", !!q);
        panel.classList.toggle("is-q", !!q);
        empty.hidden = !(q && shown === 0);
        if (q) live.textContent = shown + " " + t("results");
        else live.textContent = "";
        body.scrollTop = 0;
      }
      input.addEventListener("input", function () { filter(input.value); });
      clear.addEventListener("click", function () { input.value = ""; filter(""); input.focus(); });
      x.addEventListener("click", close);

      /* Enter in the search box follows the first visible row */
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.keyCode === 13) {
          var first = firstRow();
          if (first) { e.preventDefault(); if (first.href) location.href = first.href; }
        }
      });

      /* the current row: clicking it just closes */
      Array.prototype.forEach.call(panel.querySelectorAll(".aogj-row.is-cur"), function (c) {
        c.addEventListener("click", close);
        c.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.keyCode === 13 || e.key === " " || e.keyCode === 32) { e.preventDefault(); close(); } });
      });


      state.input = input;
      state.body = body;
    }

    function rows() {
      return Array.prototype.filter.call(panel.querySelectorAll(".aogj-row"), visible);
    }
    function firstRow() { var r = rows(); return r.length ? r[0] : null; }
    function focusables() {
      var sel = 'button,[href],input,[tabindex]:not([tabindex="-1"])';
      return Array.prototype.filter.call(panel.querySelectorAll(sel), function (n) { return visible(n) && !n.disabled; });
    }

    /* ── open / close ── */
    function onKey(e) {
      var k = e.key || "";
      if (k === "Escape" || e.keyCode === 27) { e.preventDefault(); close(); return; }
      if (k === "Tab" || e.keyCode === 9) {
        var f = focusables(); if (!f.length) return;
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
        return;
      }
      if (k === "ArrowDown" || k === "ArrowUp" || e.keyCode === 40 || e.keyCode === 38) {
        var down = (k === "ArrowDown" || e.keyCode === 40);
        var r = rows(); if (!r.length) return;
        var j = r.indexOf(document.activeElement);
        var next;
        if (j === -1) next = down ? r[0] : r[r.length - 1];
        else next = r[Math.max(0, Math.min(r.length - 1, j + (down ? 1 : -1)))];
        e.preventDefault(); next.focus();
        if (next.scrollIntoView) { try { next.scrollIntoView({ block: "nearest" }); } catch (err) { next.scrollIntoView(false); } }
        return;
      }
      if ((k === "Home" || k === "End") && document.activeElement !== state.input) {
        var rr = rows(); if (!rr.length) return;
        e.preventDefault(); (k === "Home" ? rr[0] : rr[rr.length - 1]).focus();
      }
    }
    function onDocDown(e) {
      if (!state.open) return;
      var n = e.target;
      if (panel.contains(n) || btn.contains(n)) return;
      close();
    }
    function onResize() { if (state.open) applyLock(); }
    function applyLock() {
      var lock = state.open && isPhone();
      document.documentElement.classList.toggle("aogj-lock", lock);
      backdrop.classList.toggle("is-on", lock);
    }

    function open() {
      if (state.open) return;
      state.open = true;
      render();
      btn.setAttribute("aria-expanded", "true");
      panel.hidden = false;
      panel.classList.add("is-pre");
      applyLock();
      /* force a frame so the transition plays */
      void panel.offsetHeight; // eslint-disable-line no-void
      panel.classList.remove("is-pre");
      /* bring the current row into view (the panel must be laid out first) */
      var curRow = panel.querySelector(".aogj-row.is-cur"), body = state.body;
      if (curRow && body) {
        var off = curRow.getBoundingClientRect().top - body.getBoundingClientRect().top;
        if (off > body.clientHeight * .55) body.scrollTop = off - Math.round(body.clientHeight * .35);
      }
      if (!isPhone()) {
        var rect = panel.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        if (rect.bottom > vh - 12) {
          var by = Math.min(rect.bottom - vh + 16, Math.max(0, rect.top - 12));
          if (by > 0) { try { window.scrollBy({ top: by, behavior: reducedMotion() ? "auto" : "smooth" }); } catch (e) { window.scrollBy(0, by); } }
        }
      }
      document.addEventListener("keydown", onKey, true);
      document.addEventListener("mousedown", onDocDown, true);
      document.addEventListener("touchstart", onDocDown, true);
      window.addEventListener("resize", onResize);
      setTimeout(function () { if (state.open && state.input) state.input.focus(); }, 30);
    }
    function close() {
      if (!state.open) return;
      state.open = false;
      panel.hidden = true;
      panel.innerHTML = "";
      btn.setAttribute("aria-expanded", "false");
      applyLock();
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("mousedown", onDocDown, true);
      document.removeEventListener("touchstart", onDocDown, true);
      window.removeEventListener("resize", onResize);
      btn.focus();
    }
    btn.addEventListener("click", function () { if (state.open) close(); else open(); });
    backdrop.addEventListener("click", close);

    /* a language switch re-reads the current unit's name */
    if (window.MutationObserver) {
      try {
        new MutationObserver(function () { refreshButton(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
      } catch (e) {}
    }
  }

  function init() {
    var any = false;
    IDS.forEach(function (id) {
      var sel = document.getElementById(id);
      if (!sel || sel.tagName !== "SELECT" || sel.getAttribute("data-aogj")) return;
      if (!any) { var st = document.createElement("style"); st.id = "aogj-style"; st.textContent = CSS; document.head.appendChild(st); any = true; }
      sel.setAttribute("data-aogj", "1");
      try { build(sel); } catch (e) { sel.removeAttribute("data-aogj"); sel.classList.remove("aog-jump-native"); if (window.console && console.warn) console.warn("aog-jump:", e); }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
