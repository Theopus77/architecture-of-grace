# HANDOFF — a new topic, built on the curriculum blueprint (2026-09-30)

Jimmy: "A handoff for an undetermined topic … follow the same blueprint the curriculum has
received unless I override it."

**The topic is not chosen yet.** Ask Jimmy what it is, which grades (bands) it covers, and
anything he wants done differently. Then build it with the blueprint below. **Whatever Jimmy
says overrides this file.** Where he is silent, the blueprint decides.

## 0. Read first (they are the rules)
- `/CLAUDE.md` (repo root). This covers readable text (`node tools/check-contrast.js`), calm pages
  (`node tools/check-calm.js`), iPhone → iPad → computer, plain English and Spanish words,
  drop-downs for 4 or more choices, bumping `CACHE` in `sw.js`, and never erasing `aog.sync.*`.
- `aog-deploy/_work/course/HANDOFF.md`, the course recipe step by step. This is the blueprint for
  the content and the build.
- The newest example to copy is **World Cultures & Societies** (`_work/wcs/`: SPEC.md, assemble.py,
  build_wcs.py, banners_wcs.py). Its output is `world-cultures-course.html`, `world-cultures-hub.html`
  and `wcs-u1…u17.html`.

## 1. The blueprint, piece by piece
1. **Outline:** `_work/<id>/outline.py`, with BANDS, UNITS → chapters → topics and story hooks, and
   LINKS to the existing practice rooms.
2. **Voice and shapes:** `_work/<id>/SPEC.md`. Copy the LEVEL table, the JSON shapes and the reply
   format word for word, because the validator depends on them. Neutral and balanced. Original
   writing. Concrete first. Neuro-affirming. No stereotypes. The owner's content decisions in
   `_work/wcs/SPEC.md` carry over.
3. **Content:** `u1.json…uN.json` (unit → chapters → sections → lessons with reading, words, a
   look panel and 3 checks, then chapter review and unit wrap-up). Every file passes `validate.py`.
   Spanish goes in a second pass.
4. **Pages:** `build_<id>.py` makes the contents page `<subject>-course.html`, one page per
   unit `<id>-uN.html`, and short links in `_redirects`.
5. **Hub:** `<subject>-hub.html` with band cards. It also joins the Courses door on the home page
   and the Explore menu.
6. **Pencil drawings:** a masthead drawing for the hub and for each unit, made with the sketch
   pipeline (`_work/art/kit/scenes/<id>-still.glsl` → gbuf.js → pencil.py →
   `img/banners/<id>-pencil-{1600.webp,900.webp,900.jpg}`). Use the same sketchbook look as
   the rest of the site.
7. **Daily Drafts:** add the subject as a new leather-bound book on the right shelf in
   `daily-drops.html`, with ten boxes a day for each grade. Use the send model: Check my work →
   Name → Send to my teacher, inside the sheet.
8. **Worksheets and tests:** the same Daily Drafts send model, and printing on white paper.
9. **Standards:** `_work/standards/<id>.json`, then run `python3 _work/standards/build_standards.py`
   so it shows on /standards and on the "Every unit and standard" page.
10. **Plumbing:** `sitemap.xml`, the Explore and jump menus, and a `CACHE` bump in `sw.js` that keeps
    the old line as a comment.

## 2. Before every push
- `node tools/check-contrast.js <changed pages>` and `node tools/check-calm.js <changed pages>`.
  After changing anything shared, run both on the whole site.
- Look at it at iPhone (390), iPad (820) and computer sizes.

## 3. Deploying
Work on the session's own branch. **Keep live deploys to a minimum and deploy only when Jimmy
says** ("Deploy", "Send it"). A deploy is a PR from the branch to `main`, then a merge. Netlify
publishes `aog-deploy/`.
