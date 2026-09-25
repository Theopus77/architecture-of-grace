# HANDOFF — building a course for another subject (2026-09-25)

Four courses share one engine: U.S. History 6–8 (`_work/ush`), Science K–12
(`_work/sci`), Math K–12 (`_work/mth`) and Spanish K–12 (`_work/spa`, done
2026-09-25: 20 units, 40 chapters, 377 lessons). Jimmy's ask, still open:
**the same facelift for FACS (Family & Consumer Sciences), World Religions and Economics.**

Hubs already on the site: `spanish-hub.html` (/spanish), `facs-hub.html` (/facs),
`religions-hub.html`, `economics-hub.html` (/economics). Their bands: Spanish and
FACS run K–2 … 11–12; Economics and World Religions run 9–10 and 11–12 only
(see each hub's `<section class="band" id="…">`). Existing rooms per band are the
`.unit` cards in each hub — those become the course's LINKS (practice rooms).

## The recipe (Math took ~4 hours of wall-clock with agents; copy `_work/mth`)
1. `mkdir _work/<id>` (ids so far: ush, sci, mth, spa; pick e.g. `fcs`, `rel`, `eco`).
   Spanish is the most recent and the cleanest to copy: `_work/spa/{build,inject_spa_jump,plumb}_spa.py`.
   Copy `validate.py`, `assemble.py` from `_work/sci` unchanged. Copy
   `banners_sci.py` → `banners_<id>.py` (edit the two module names inside).
2. Write `outline.py`: `BANDS` (only the bands the subject has), `UNITS`
   (n=1…, `band`, `title`, `strand`, `chapters=[dict(n, title, strand, topics, story)]`),
   `LINKS` (unit → [(href, label)] from the hub cards). Chapters number straight
   through. Sanity-check numbering with a one-liner (see the sci/mth sessions).
3. Write `SPEC.md` for the subject's voice (start from `_work/mth/SPEC.md`; keep the
   LEVEL table, the file shapes and the reply format verbatim — the validator
   depends on them). Subject notes worth adding: Spanish — readings can carry
   Spanish words/phrases with English glosses, and `words` are the Spanish terms;
   FACS — safety facts must be standard (USDA temperatures etc.); World Religions —
   neutral, descriptive, "adherents believe…", sources are scriptures in public-domain
   translations (paraphrase: true unless certain); Economics — label every price and
   rate an example, standard definitions only.
4. Write `build_<id>.py` from `_work/mth/build_mth.py`: change id, page/short
   patterns (`<id>-u%d.html`, `<id>%d`), contents page (`<subject>-course.html`,
   `/<subject>-course`), hub file, titles/EN-ES strings, `jump_groups()` labels
   (`"<Subject> · Grades …"` must match the page optgroup labels exactly — check
   `grep -o '<optgroup label="[^"]*"' s13-world-before-1500.html`), `jump_cur`/`jump_strip`.
   Check `_redirects` for short-link collisions first.
5. `inject_<id>_jump.py` and `plumb_<id>.py`: sed-copy `_work/sci/inject_sci_jump.py`
   and `_work/sci/plumb_sci.py` (see the mth session's sed for the substitutions;
   bump the sw.js CACHE to the next number; then grep for leftover "sci"/"Science").
6. Writers: one agent per unit, prompt = "Read SPEC.md, find unit n=N in outline.py,
   write ch<N>.json files and uN_head.json, run `python3 assemble.py N` until OK".
   Concurrency cap is 20 agents; launch the rest as hand-backs arrive. Commit each
   validated unit (`git add -A aog-deploy`).
7. Banners: two illustrator agents (units 1–14, 15–27) writing `banners_<id>_a.py`
   / `_b.py` with ids prefixed `<x>b{n}-` — point them at `_work/sci/banners_sci_a.py`
   for the house style; they render with Playwright at
   `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` and validate with minidom.
8. Build: `python3 _work/<id>/build_<id>.py` → `python3 _work/<id>/inject_<id>_jump.py`
   → re-run the OTHER courses' injectors too (`_work/jump/inject_jump.py`,
   `_work/sci/inject_sci_jump.py`, `_work/mth/inject_mth_jump.py`) so the new pages
   carry every course; `build_course.jump_block()` strips injected course options
   from the lifted s13 menu so a rebuild never duplicates them — extend the regex
   there with the new id (`us-history|ush-u\d+|science-course|sci-u\d+|math-course|mth-u\d+|spanish-course|spa-u\d+|…`).
   Also add the new page pattern to `_work/jump/inject_jump.py`? No — it only
   handles the SS 6–8 group; nothing to change.
9. `python3 _work/<id>/plumb_<id>.py` (hub bands, _redirects, sw.js, sitemap).
10. Verify: serve `aog-deploy` with `python3 -m http.server 8765`, screenshot with
    the scratchpad `shot.py` pattern (Playwright), check console errors on every
    unit page, look at K–2 and HS lessons, the contents page, the jump panel.
11. Commit, push, Jimmy merges on GitHub; Netlify deploys `main` automatically
    (publish directory `aog-deploy`, set in `netlify.toml`).

## Things the engine already handles
- 3-choice questions (K–2), negative bar-chart values, band grouping on the
  contents page, per-course localStorage keys, EN/ES chrome strings, print,
  the contents drawer, Listen, the word match, tests, writing task.
- The shared scripts `aog-jump.js` (menu) and `aog-cards.js` (study cards)
  are already on every page; new course pages get `aog-jump.js` from the builder.

## Known cosmetic leftovers
- `inject_mth_jump.py` prints "Math group" now; earlier runs said "Science group"
  (text only — the regexes targeted the Math groups).
- Root-level copies of `index.html` / `social-*.html` in the repo root are stale
  duplicates from a manual upload; the site is `aog-deploy/`.

## Lessons from the Spanish build (2026-09-25)
- The hub's band ids are not always lower-case: `spanish-hub.html` uses `id="K-2"`.
  `plumb_spa.py` maps it with `HUB_ID`; check `grep -o '<section class="band" id="[^"]*"' <hub>` first.
- Illustrator agents: Playwright's Python package is not installed; the agents rendered
  with the chromium binary headless (`--screenshot`) instead, which works fine.
  Watch for f-strings like `-{x*head}` that print `--` when the value is negative
  — check every banner with `grep -c '\-\-'` on the built page or the console.
- A writer batch can die on the session usage limit; the validator makes it safe to
  relaunch just the missing units ("some ch files may exist, keep what is good").
- Headless Chromium at a 420px window ignores the viewport meta (text runs off the
  right edge) — Math does the same; it is not a course bug.
