# HANDOFF — U.S. History 6–8 rebuild (2026-09-24)

Jimmy: "It is time to rehaul and redo the whole social studies [6–8] … follow this format [the
textbook's table of contents: Units → Chapters → Sections → numbered lessons] … the drop menu looks
meh … reach the ceiling." Also: "Nothing gets lost, but the face needs a facelift."

## DONE — the content (this folder)
`u1.json` … `u10.json`: all 10 units and 29 chapters, 338 lessons, 1,396 questions. Every file passes
`python3 validate.py uN.json`. English only; Spanish comes in a second pass (add `…Es` fields; the
renderer should fall back to English).
- `outline.py`: the arc (unit/chapter titles, years, topics) and `LINKS`, which maps the site's
  existing 6–8 pages (h1–h16, b9 modules, s13, s14, s15) onto the units they belong to. Nothing gets
  deleted.
- `SPEC.md`: the JSON shape and writing rules. `validate.py` and `assemble.py` are included for when
  you add to the content.
- The text is original. It follows a textbook's arc only; no wording, feature names or titles were copied.

JSON shape: unit {n, title, years, intro[], bigQuestion, timeline[{y,t}], chapters[], wrap{words[12],
test[15], write{prompt,tips[]}}}. Chapter {n, title, years, bigQuestion, story{title,kicker,
paragraphs[],think}, sections[{title, lessons[]}], review[8]}. Lesson {title, mainIdea, reading[]
(key words marked *like this*), words[{w,d}], look{type: source|data|think, …}, check[3 MC {q,
choices[4], a, why}]}.

## NOT DONE — the build (next session)
1. **`/us-history` → `us-history.html`**, the course contents page in the textbook's look. Each unit
   gets a spread: a large banner with "UNIT 3", a huge condensed title and the years. Below it, each
   chapter gets a numbered badge, a "CHAPTER" tab and the chapter's story. Then comes "SECTION 1 ·
   title", and under it numbered lessons (1.1, 1.2, …), each linking to its anchor on the unit page.
   Also: progress ticks (localStorage, wrapped in try/catch), a lesson search and a sticky 1–10 unit rail.
2. **`/ush1` … `/ush10` → `ush-u1.html` … `ush-u10.html`**, one page per unit. Each has the banner,
   intro, big question and timeline rail. Then chapter by chapter: opener and story, then
   sections → lessons. A lesson shows its reading with key-word pop-ups, the "look" panel (a quote card,
   a small bar chart for `data`, or a scenario) and 3 checks with instant feedback. Each chapter ends
   with an 8-question review with a score. The unit ends with the wrap-up: a 12-word match, a
   15-question test and a writing task. Also: "Practice rooms" (the `LINKS` for that unit), a Listen
   button (speechSynthesis), a contents drawer on phones, and print styles.
3. **Banners:** the cloud container can't reach Wikimedia or the Library of Congress. Use drawn SVG
   scenes, or public-domain images Jimmy downloads himself (Leutze's *Washington Crossing the Delaware*
   and Library of Congress photos), credited on the page.
4. **The menu facelift:** 195 pages carry `<select id="jumpSel">` (grouped by subject and band). Write
   ONE `aog-jump.js` that turns it into a styled button with a panel: search, grouped bands and
   the current page marked. Keep the select as the no-JS fallback, and add one `<script src="/aog-jump.js"
   defer>` line to each page. Also replace the "Social Studies · Grades 6–8" optgroup in every page:
   list the 10 new units first, then the older rooms.
5. **Hub:** in `social-studies-hub.html`, rework band 6–8 so it leads with the course (10 unit cards),
   and keep every existing card below it under "More rooms".
6. **Site plumbing:** in `_redirects`, add `/us-history` and `/ush1`–`/ush10`. In `sw.js`, bump `CACHE`
   to `…2026.09.24.4380`. Update `sitemap.xml`. Pages follow site conventions: the theme boot script in
   `<head>`, `<script src="/aog-topbar.js">` in `<body>`, hidden `#langBtn` and `#themeBtn` that the bar
   clicks, and `[data-en]` spans kept as leaves. Use the tokens from `social-studies-hub.html`
   (`--acc #7A5230`, the serif stack) plus navy `#0A1E33` and a flag red for the badges.

## Fact-check before students see it (writers flagged these)
- Quotes a writer was not 100% sure of: Grant's *Personal Memoirs* (u5), Webster's "now and for ever"
  (u5), Equiano (u2, set to paraphrase). Every other quote is either set to paraphrase or public domain
  and believed exact.
- Data tables to spot-check: colonial population estimates (u2, u3), Embargo exports $108M/$22M/$52M
  (u4), the SlaveVoyages destinations (u1), births, TV share, Chicago's Black population and troops
  in Vietnam (u9), inflation 1970–83, foreign-born population and unemployment 2007–13 (u10).
- Illinois claim to double-check: Illinois repealed its Black Laws in 1865 after John Jones's
  campaign (u6).
- Unit 10 describes the present as of 2025, strictly factual. Recent elections get dates and results
  only.
