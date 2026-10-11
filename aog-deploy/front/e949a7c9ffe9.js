
/* ============================================================================
   ARCHITECTURE OF GRACE  ·  ONE PRODUCT LANGUAGE, TWO MOMENTS   2026-08-27

   Built from Jimmy's "Daily Check-In + Exit Slip · one product language"
   handoff. Its §00 is a hard architectural rule, not a preference:

       THE EXIT SLIP IS THE MASTER TEMPLATE.

   So this block is the master template, extracted. Every look-and-feel
   decision the Exit Slip made — palette, type, chips, cards, buttons,
   selection states, focus rings, the escape hatch, progressive disclosure,
   the nav, the closing screen, and every responsive step — lives HERE ONCE
   and is worn by BOTH screens:

       #screen-exit-slip        .xs-*    "What was my day?"      on the way out
       #screen-daily-checkin    .sc-*    "How am I doing now?"   in the moment

   ⚠ THIS IS THE ONLY PLACE THOSE RULES EXIST. The two injectCss functions
   downstream were emptied of them on purpose. If you restyle a chip here,
   both screens change, which is the entire point (§21: one component, many
   experiences). If you find yourself adding a `.sc-` rule that duplicates an
   `.xs-` one, you are rebuilding the bug this block deleted.

   ⚠ WHAT THIS BLOCK DOES NOT OWN: THE STAGE. Each screen keeps its own
   one-viewport machinery — fitStage, the measured head, sc-free / xs-free,
   the visualViewport correction. That code was phone-verified separately on
   each screen (see aog-checkin-fit) and prising it into a shared module
   would put a screen students are already using at risk to save eighty
   lines. Jimmy chose "shared tokens, kept mechanics" explicitly. Look is
   shared. Stage is not.

   ⚠ SPECIFICITY IS LOAD-BEARING. Every rule here is ID-scoped
   (#screen-… .class) and this stylesheet is injected at parse time, before
   either screen's own. That means:
     · a screen's OWN ID-scoped rule, injected later, wins a tie — which is
       how each screen keeps control of its stage;
     · a screen's class-only rule (0,1,0) LOSES to these (1,1,0) whatever
       the order — which is why every responsive rule for a shared component
       had to come here too. A media query left behind downstream would have
       been silently dead, and the one that matters most is the
       max-height:740px block that makes an iPhone X fit.

   ⚠ DARK MODE. --navy and --cream are NOT remapped for dark; --ink, --paper,
   --rule and --ink-faint are. Writing navy on a dark card is the exact bug
   that made the whole Daily Check-In unreadable for weeks (34 axe nodes).
   The tokens below are declared once for light and again under
   :root[data-theme="dark"], so neither theme inherits the other's, and every
   rule in this file reads a token rather than a literal.
   ============================================================================ */
(function () {
  "use strict";

  /* Both spellings of one component, in one rule. `sel(".xs-chip",".sc-chip")`
     is the whole trick: it is impossible to change one screen's chip and
     forget the other, because there is only one chip. */
  function sel(xs, sc) {
    var out = [];
    if (xs) xs.split(",").forEach(function (s) { s = s.trim(); if (s) out.push("#screen-exit-slip " + s); });
    if (sc) sc.split(",").forEach(function (s) { s = s.trim(); if (s) out.push("#screen-daily-checkin " + s); });
    return out.join(",");
  }
  /* The three row-shaped selectables: the Exit Slip's class rows and day
     words, and the Check-In's 1-5 scale rows. One card, three uses. */
  var CARD = sel(".xs-cls,.xs-day", ".sc-s");
  /* .30fg */ var _scErrCss = ".sc-err{color:var(--red,#B5503F);font-size:14px;margin:8px 0 0;font-weight:600}";
  try { var _st = document.createElement("style"); _st.textContent = _scErrCss; document.head.appendChild(_st); } catch (e) {}

  var S = [

    /* ===================================================================
       01 · THE TOKENS.  One palette, declared twice, read everywhere.
       =================================================================== */
    ":root{--aog-dusk:#4C3F6B;--aog-deep:#3A2F55;--aog-pale:#F0ECF7;--aog-on:#FFFFFF;",
    "  --aog-r-chip:12px;--aog-r-card:13px;--aog-r-gate:15px;--aog-r-pill:99px;}",
    ':root[data-theme="dark"]{--aog-dusk:#C3B2E8;--aog-deep:#DACFF2;--aog-pale:#241E33;--aog-on:#14121C;}',
    /* The Exit Slip's own names still resolve, so nothing downstream that
       says var(--xs-dusk) had to be rewritten to keep working. */
    "#screen-exit-slip,#screen-daily-checkin{--xs-dusk:var(--aog-dusk);--xs-deep:var(--aog-deep);",
    "  --xs-pale:var(--aog-pale);--xs-on:var(--aog-on);}",

    /* ===================================================================
       02 · THE RIBBON.  §10 — one navigation language. Four named beats,
       so a student can see where they are in the shape of the thing rather
       than being told "3 of 8". The count is still there, quietly, in the
       meta row beneath it.
       =================================================================== */
    sel(".xs-top", ".sc-top") + "{flex:0 0 auto;padding:16px 0 0;background:transparent;margin:0;position:relative;}",
    sel(".xs-ribbon", ".sc-ribbon") + "{max-width:660px;margin:0 auto;padding:0 20px;display:flex;gap:8px;align-items:flex-end;}",
    sel(".xs-beat", ".sc-beat") + "{flex:1 1 0;min-width:0;}",
    sel(".xs-beat b", ".sc-beat b") + "{display:block;font-size:10.5px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;",
    "  color:var(--ink-faint);margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
    sel(".xs-beat i", ".sc-beat i") + "{display:block;height:4px;border-radius:99px;background:var(--rule);}",
    sel(".xs-beat.done i,.xs-beat.now i", ".sc-beat.done i,.sc-beat.now i") + "{background:var(--aog-dusk);}",
    sel(".xs-beat.now b", ".sc-beat.now b") + "{color:var(--aog-dusk);}",
    sel(".xs-meta", ".sc-meta") + "{max-width:660px;margin:10px auto 0;padding:0 20px;display:flex;justify-content:space-between;",
    "  align-items:baseline;gap:12px;font-size:12.5px;color:var(--ink-faint);}",
    sel(".xs-meta .xs-count", ".sc-meta .sc-count") + "{font-variant-numeric:tabular-nums;}",

    /* ===================================================================
       03 · TYPE.  §02 — same fonts, weights, sizes and hierarchy. The
       Check-In's question used to be set in the serif at 30px; it is the
       Exit Slip's 650-weight sans now, and the two screens read as one
       product at a glance.
       =================================================================== */
    sel(".xs-wrap", ".sc-wrap") + "{max-width:660px;margin:0 auto;padding:0 20px;width:100%;box-sizing:border-box;}",
    sel(".xs-q", ".sc-q") + "{font-family:inherit;font-size:clamp(21px,3.1vw,28px);line-height:1.22;margin:0 0 8px;",
    "  color:var(--ink);font-weight:650;letter-spacing:-.01em;text-wrap:balance;}",
    sel(".xs-sub", ".sc-sub") + "{font-size:15px;line-height:1.45;margin:0;color:var(--ink-faint);}",

    /* ===================================================================
       04 · CHIPS, GROUPS, THE FOLD AND THE ESCAPE HATCH.
       §08 — one selection component. §17 — progressive disclosure.
       §18 — the escape hatch is NEVER behind "More choices"; it renders on
       the first paint of every screen, outside the fold, because it is the
       option a student needs when they do not want to be here.
       =================================================================== */
    sel(".xs-gh", ".sc-gh") + "{font-size:11.5px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;",
    /* ⚠ --ink AND a gold rule, not --ink-faint. The group labels (PEOPLE,
       TOMORROW, GRACE) were 11px ink-faint floating between pill after pill,
       and Jimmy read the screen as one undifferentiated sea ("the headers are
       blending in"). Same fix .ci-ghead already carries: the label is
       information, so it gets information ink and a rule that marks where a
       group begins. */
    "  color:var(--ink);border-bottom:2px solid var(--gold,#D9A33B);padding-bottom:5px;margin:12px 0 9px;}",
    sel(".xs-gh:first-child", ".sc-gh:first-child") + "{margin-top:0;}",
    sel(".xs-chips", ".sc-chips") + "{display:flex;flex-wrap:wrap;gap:8px;}",
    sel(".xs-chip", ".sc-chip") + "{display:inline-flex;align-items:center;padding:10px 14px;border-radius:var(--aog-r-chip);",
    "  border:1.5px solid var(--rule);background:var(--paper);color:var(--ink);font-size:15.5px;",
    "  line-height:1.25;cursor:pointer;text-align:left;font-family:inherit;transition:background .12s,border-color .12s;}",
    sel(".xs-chip:hover", ".sc-chip:hover") + "{border-color:var(--aog-dusk);}",
    sel(".xs-chip.on", ".sc-chip.on") + "{background:var(--aog-dusk);border-color:var(--aog-dusk);color:var(--aog-on);}",
    sel(".xs-chip:focus-visible", ".sc-chip:focus-visible") + "{outline:3px solid var(--aog-dusk);outline-offset:2px;}",

    sel(".xs-esc", ".sc-esc") + "{margin-top:16px;padding-top:14px;border-top:1px dashed var(--rule);}",
    sel(".xs-esc .xs-chip", ".sc-esc .sc-chip") + "{background:transparent;border-style:dashed;color:var(--ink-faint);}",
    sel(".xs-esc .xs-chip.on", ".sc-esc .sc-chip.on") + "{background:var(--aog-dusk);border-style:solid;",
    "  border-color:var(--aog-dusk);color:var(--aog-on);}",

    sel(".xs-more", ".sc-more") + "{display:inline-flex;align-items:center;gap:7px;margin-top:14px;padding:9px 15px;",
    "  border-radius:var(--aog-r-pill);border:1.5px solid var(--rule);background:transparent;color:var(--aog-dusk);",
    "  font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;}",
    sel(".xs-more:hover", ".sc-more:hover") + "{border-color:var(--aog-dusk);}",
    sel(".xs-more:focus-visible", ".sc-more:focus-visible") + "{outline:3px solid var(--aog-dusk);outline-offset:2px;}",
    sel(".xs-more .cv", ".sc-more .cv") + "{transition:transform .15s;}",
    sel('.xs-more[aria-expanded="true"] .cv', '.sc-more[aria-expanded="true"] .cv') + "{transform:rotate(180deg);}",

    /* ===================================================================
       05 · THE ROW CARD.  Exit Slip class rows, Exit Slip day words, and
       Check-In scale rows are the same object. §08 — do not invent a
       DailyCheckInButton when a card already exists.
       =================================================================== */
    CARD + "{display:flex;align-items:center;width:100%;border-radius:var(--aog-r-card);",
    "  border:1.5px solid var(--rule);background:var(--paper);color:var(--ink);font-size:16.5px;",
    "  cursor:pointer;text-align:left;font-family:inherit;box-sizing:border-box;",
    "  transition:background .12s,border-color .12s;}",
    sel(".xs-cls", "") + "{gap:11px;padding:12px 14px;}",
    sel(".xs-day", ".sc-s") + "{gap:14px;padding:12px 16px;}",
    CARD.split(",").map(function (s) { return s + ":hover"; }).join(",") + "{border-color:var(--aog-dusk);}",
    CARD.split(",").map(function (s) { return s + ".on"; }).join(",") + "{background:var(--aog-dusk);border-color:var(--aog-dusk);color:var(--aog-on);}",
    CARD.split(",").map(function (s) { return s + ":focus-visible"; }).join(",") + "{outline:3px solid var(--aog-dusk);outline-offset:2px;}",
    sel("", ".sc-s .lab") + "{flex:1 1 auto;min-width:0;font-size:16.5px;font-weight:600;}",

    /* ===================================================================
       06 · WRITING IS A DOOR, NEVER A REQUIREMENT (§19).
       =================================================================== */
    sel(".xs-ta", ".sc-text") + "{width:100%;box-sizing:border-box;margin-top:14px;padding:12px 14px;",
    "  border-radius:var(--aog-r-chip);border:1.5px solid var(--rule);background:var(--paper);color:var(--ink);",
    "  font-family:inherit;font-size:15.5px;line-height:1.45;}",
    sel(".xs-ta:focus-visible", ".sc-text:focus-visible") + "{outline:3px solid var(--aog-dusk);outline-offset:1px;}",

    /* ===================================================================
       07 · BUTTONS AND THE NAV.  §10 — the same back, the same forward, in
       the same places, on both screens.
       =================================================================== */
    sel(".xs-nav", ".sc-nav") + "{flex:0 0 auto;margin-top:14px;padding:12px 0 16px;display:flex;align-items:center;",
    "  gap:14px;border-top:1px solid var(--rule-soft,var(--rule));}",
    sel(".xs-next", ".sc-next") + "{background:var(--aog-dusk);color:var(--aog-on);border:0;border-radius:var(--aog-r-pill);",
    "  padding:13px 32px;font-size:16px;font-weight:650;cursor:pointer;font-family:inherit;}",
    sel(".xs-next[disabled]", ".sc-next[disabled]") + "{opacity:.4;cursor:default;}",
    sel(".xs-next:focus-visible", ".sc-next:focus-visible") + "{outline:3px solid var(--aog-deep);outline-offset:2px;}",
    sel(".xs-ghost", ".sc-ghost") + "{background:transparent;color:var(--ink);border:1.5px solid var(--rule);",
    "  border-radius:var(--aog-r-pill);padding:12px 26px;font-size:15.5px;font-weight:600;cursor:pointer;font-family:inherit;}",
    sel(".xs-back", ".sc-back") + "{background:none;border:0;color:var(--ink-faint);font-size:15px;cursor:pointer;",
    "  font-family:inherit;padding:8px 4px;}",
    sel(".xs-skip", ".sc-skip") + "{background:none;border:0;color:var(--ink-faint);font-size:14.5px;cursor:pointer;",
    "  font-family:inherit;margin-left:auto;text-decoration:underline;text-underline-offset:3px;padding:8px 4px;}",

    /* ===================================================================
       08 · THE CLOSING SCREEN (§09).  Same arc, same three lines, same
       weight, same timing. Only the words change.
       =================================================================== */
    sel(".xs-done", ".sc-done") + "{max-width:620px;margin:0 auto;padding:34px 4px 12px;text-align:center;}",
    sel(".xs-done .arc", ".sc-done .arc") + "{margin:0 auto 22px;display:block;}",
    sel(".xs-done h2", ".sc-done h2") + "{font-family:inherit;font-size:clamp(24px,3.4vw,31px);line-height:1.2;",
    "  margin:0 0 18px;color:var(--ink);font-weight:650;}",
    sel(".xs-lines", ".sc-lines") + "{margin:0 auto 20px;max-width:430px;}",
    sel(".xs-lines p", ".sc-lines p") + "{margin:0 0 7px;font-size:17px;line-height:1.5;color:var(--ink);}",
    sel(".xs-lines p.neither", ".sc-lines p.neither") + "{color:var(--aog-dusk);font-weight:600;}",
    sel(".xs-see", ".sc-see") + "{font-size:19px;font-weight:650;color:var(--ink);margin:0 0 22px;letter-spacing:.01em;}",
    /* ⚠ .xs-seen and .sc-sent are the same object under two names. The
       Check-In's `.sc-seen` is something ELSE — the "who reads this" box on
       the tell-an-adult question — and merging the two names would have put
       a 14px faint caption where a 13px parchment panel belongs. Renamed to
       .sc-sent rather than colliding. */
    sel(".xs-seen", ".sc-sent") + "{font-size:14px;color:var(--ink-faint);margin:0 0 20px;line-height:1.5;}",
    sel(".xs-hand", ".sc-hand") + "{text-align:left;border:1px solid var(--rule);border-radius:var(--aog-r-card);",
    "  padding:14px 16px;margin:0 auto 20px;max-width:470px;background:var(--aog-pale);}",
    sel(".xs-hand p", ".sc-hand p") + "{margin:0 0 8px;font-size:14.5px;line-height:1.5;color:var(--ink);}",
    sel(".xs-hand p.now", ".sc-hand p.now") + "{margin:0;font-weight:650;}",
    sel(".xs-recap", ".sc-recap") + "{text-align:left;max-width:470px;margin:0 auto 22px;}",
    sel(".xs-recap .rr", ".sc-recap .rr") + "{display:flex;gap:12px;padding:9px 0;border-bottom:1px solid var(--rule-soft,var(--rule));}",
    sel(".xs-recap .rr:last-child", ".sc-recap .rr:last-child") + "{border-bottom:0;}",
    sel(".xs-recap .rk", ".sc-recap .rk") + "{flex:0 0 84px;font-size:11px;font-weight:700;letter-spacing:.08em;",
    "  text-transform:uppercase;color:var(--ink-faint);padding-top:3px;}",
    sel(".xs-recap .rv", ".sc-recap .rv") + "{flex:1 1 auto;font-size:15px;line-height:1.4;color:var(--ink);}",

    /* ===================================================================
       09 · THE EXIT SLIP'S OWN FURNITURE. Not shared because the Check-In
       has no equivalent — but it lives here so that nothing downstream can
       out-specify the responsive rules below it.
       =================================================================== */
    sel(".xs-classes", "") + "{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;align-items:stretch;}",
    sel(".xs-cls .pd", "") + "{font-size:11.5px;font-weight:700;letter-spacing:.06em;color:var(--ink-faint);min-width:34px;}",
    sel(".xs-cls.on .pd", "") + "{color:var(--aog-on);opacity:.82;}",
    sel(".xs-cls.alt", "") + "{border-style:dashed;color:var(--ink-faint);}",
    sel(".xs-cls.alt.on", "") + "{border-style:solid;color:var(--aog-on);}",
    sel(".xs-gate", "") + "{display:block;width:100%;box-sizing:border-box;padding:17px 20px;border-radius:var(--aog-r-gate);",
    "  border:2px solid var(--aog-dusk);background:var(--aog-pale);color:var(--ink);font-size:18.5px;",
    "  font-weight:650;cursor:pointer;text-align:left;font-family:inherit;margin-bottom:6px;}",
    sel(".xs-gate.on", "") + "{background:var(--aog-dusk);border-color:var(--aog-dusk);color:var(--aog-on);}",
    sel(".xs-gate:focus-visible", "") + "{outline:3px solid var(--aog-deep);outline-offset:2px;}",
    sel(".xs-orline", "") + "{display:flex;align-items:center;gap:12px;margin:16px 0 12px;color:var(--ink-faint);font-size:13px;}",
    sel(".xs-orline:before,.xs-orline:after", "") + "{content:\"\";flex:1 1 auto;height:1px;background:var(--rule);}",
    sel(".xs-dim", "") + "{opacity:.42;transition:opacity .16s;}",
    sel(".xs-days", "") + "{display:grid;grid-template-columns:repeat(auto-fit,minmax(152px,1fr));gap:8px;}",
    sel(".xs-day .em", "") + "{font-size:22px;line-height:1;}",
    sel(".xs-tellrow", ".sc-tellrow") + "{display:flex;flex-wrap:wrap;gap:10px;}",

    /* ===================================================================
       10 · RESPONSIVE — §04, ONE SET OF BREAKPOINTS FOR BOTH SCREENS.

       ⚠ EVERY RESPONSIVE RULE FOR A SHARED COMPONENT HAS TO BE HERE. These
       selectors are ID-scoped (1,1,0); a class-only media rule left behind
       in either screen's own stylesheet would be silently outranked no
       matter where it sat in the file. The one that matters most is the
       max-height block: it is what makes an iPhone X fit, and losing it is
       invisible on every desktop anyone would test on.
       =================================================================== */
    "@media (max-width:768px){",
    sel(".xs-q", ".sc-q") + "{font-size:clamp(20px,4.6vw,25px);}",
    sel(".xs-chip", ".sc-chip") + "{padding:9px 13px;font-size:15px;}",
    sel(".xs-cls", "") + "{padding:12px 14px;font-size:16px;}",
    sel(".xs-beat b", ".sc-beat b") + "{font-size:9.5px;letter-spacing:.06em;}",
    "}",
    "@media (max-width:430px){",
    sel(".xs-top", ".sc-top") + "{padding-top:12px;}",
    sel(".xs-q", ".sc-q") + "{font-size:clamp(19px,5.6vw,23px);}",
    sel(".xs-sub", ".sc-sub") + "{font-size:14px;}",
    sel(".xs-nav", ".sc-nav") + "{margin-top:10px;padding:10px 0 12px;gap:10px;}",
    sel(".xs-next", ".sc-next") + "{padding:12px 26px;font-size:15.5px;}",
    sel(".xs-gate", "") + "{font-size:17px;padding:15px 17px;}",
    sel(".xs-day", ".sc-s") + "{font-size:15.5px;}",
    "}",
    /* ⚠ HEIGHT, NOT WIDTH. An iPhone X in Safari shows 635px and an iPhone 14
       shows 844px at the SAME width, so a width media query cannot tell them
       apart and the short one is the one that scrolls. */
    "@media (max-height:740px){",
    sel(".xs-top", ".sc-top") + "{padding-top:10px;}",
    sel(".xs-q", ".sc-q") + "{font-size:clamp(18px,4.4vw,22px);}",
    sel(".xs-sub", ".sc-sub") + "{font-size:13.5px;}",
    sel(".xs-nav", ".sc-nav") + "{margin-top:8px;padding:9px 0 10px;}",
    sel(".xs-chip", ".sc-chip") + "{padding:8px 12px;font-size:15px;}",
    sel(".xs-cls", "") + "{padding:9px 11px;font-size:15px;gap:8px;}",
    sel(".xs-classes", "") + "{gap:7px;}",
    /* ⚠ THE PERIOD BADGE GOES ON A SHORT SCREEN. Q1 and Q3 of the slip are
       the two questions with no fold to give — hiding one of a student's own
       classes behind More choices would be worse than scrolling — so they
       have to fit by being smaller. The badge is decorative and already
       aria-hidden; dropping it buys ~34px of width per cell. */
    sel(".xs-cls .pd", "") + "{display:none;}",
    sel(".xs-day", ".sc-s") + "{padding:9px 12px;font-size:15px;gap:11px;}",
    sel(".xs-days", "") + "{gap:7px;}",
    sel(".xs-gh", ".sc-gh") + "{margin:10px 0 6px;}",
    sel(".xs-esc", ".sc-esc") + "{margin-top:11px;padding-top:10px;}",
    sel(".xs-gate", "") + "{padding:13px 16px;font-size:17px;}",
    sel(".xs-orline", "") + "{margin:11px 0 9px;}",
    sel(".xs-more", ".sc-more") + "{margin-top:10px;padding:8px 14px;}",
    "}",
    "@media (prefers-reduced-motion:reduce){",
    sel(".xs-chip,.xs-cls,.xs-day,.xs-more .cv,.xs-dim", ".sc-chip,.sc-s,.sc-more .cv") + "{transition:none;}",
    "}"
  ];

  function put() {
    if (document.getElementById("aog-ds-css")) return;
    var s = document.createElement("style");
    s.id = "aog-ds-css";
    s.textContent = S.join("\n");
    (document.head || document.documentElement).appendChild(s);
  }
  put();

  /* Read by both screens so neither keeps its own copy of the palette, and
     by the harnesses so a token can be asserted rather than eyeballed. */
  window.AOGDS = {
    ensure: put,
    token: function (n) {
      try { return getComputedStyle(document.documentElement).getPropertyValue("--aog-" + n).trim(); }
      catch (e) { return ""; }
    }
  };
})();
