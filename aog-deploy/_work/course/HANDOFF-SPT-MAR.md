# HANDOFF — Sports History (`spt`) and The Measured Step (`mar`) · 2026-09-30

Two K–12 history books, built on the same engine and to the same standard as the finished courses
(Buddhist Texts is the model). This replaces the Grok drafts: Grok's units 1–7 of Sports History are kept
as a fact source only and are being rewritten to the house standard.

Read first: `CLAUDE.md` (repo root), `_work/course/HANDOFF.md` (the engine recipe),
`_work/course/HANDOFF-HISTORY-BOOKS.md` (ids, pictures, Daily Drafts, wiring), then
`_work/spt/SPEC.md` or `_work/mar/SPEC.md` (the writer contract for each book).

## Status

| Book | Folder | Outline | SPEC | Units written |
| --- | --- | --- | --- | --- |
| Sports History | `_work/spt` | 17 units, 34 chapters, LINKS fixed | done | 1–7 drafted by Grok, below standard → rewrite; 8–17 to write |
| The Measured Step | `_work/mar` | 17 units, 34 chapters, LINKS fixed | done | none → write all 17 |

What was wrong with the Grok drafts (the reason for each rule in the SPECs):
- First batch: every lesson built from template sentences to pass `validate.py`; cited its own outline.
- Units 4–7: ~270 filler sentences ("The reading keeps the name, the place, and the date together.")
  padding readings up to the minimum length. Stripped on 2026-09-30; the readings are now too short.
- Eight lessons were about the course itself ("No Dribble Lesson Here", "Objects for a Pencil Page").
- Charts with "note" rows, mixed units (yards beside meters, feet beside a track lap), off-topic rows.
- Timelines holding measurements ("400 m", "11") instead of dates.
- Facts corrected: Wingfield introduced lawn tennis in 1873 and patented it in 1874; IHSA records list
  track champions from 1893, before the IHSA was founded (1900). Still to confirm on ihsa.org: first IHSA
  girls wrestling state finals (believed February 2022, the 2021–22 season — Grok wrote 2021) and first
  IHSA boys tennis champion (Grok: 1912). Until confirmed, write "the 2021–22 season" for girls wrestling
  and leave boys tennis out of charts and questions.

## Gates — every unit must pass all three

```
cd aog-deploy/_work/<id>
python3 assemble.py <n>                 # counts, lengths, shapes → prints OK
python3 ../course/quality_check.py <n>  # filler, self-citation, meta lessons, charts, timelines → QUALITY OK
```
Then a human-standard read (the reviewer does this, see below): every paragraph teaches a specific true
fact; names, places and dates are right; checks are answerable from the lesson; history only.

## How the units get written

One writer per unit. The writer prompt:

> You are writing unit N of <book> for the Architecture of Grace site. Folder: `aog-deploy/_work/<id>`.
> Read `SPEC.md` there (all of it), find unit n=N in `outline.py`, and read `../bud/ch7.json` and
> `../bud/ch20.json` to see the quality bar. [For spt units 1–7: the existing ch/u_head files for this unit
> are a draft below standard — keep its verified facts and anything already good, rewrite everything else.]
> Write each `ch<N>.json` and `u<n>_head.json`, then run `python3 assemble.py N` and
> `python3 ../course/quality_check.py N` and fix until both pass. Do not edit any other unit's files,
> outline.py, SPEC.md or the scripts. Reply with only: both OK lines, and one line per fact you were
> unsure of and left out or softened.

The reviewer (the coordinating session) then reads every unit before accepting it, using
`_work/course/quality_check.py` plus a read of titles, main ideas, sources and chart rows, and sends a
unit back with specific notes if it falls short.

## After all 34 units pass (per book)

Follow `_work/course/HANDOFF.md` steps 4–11 and `HANDOFF-HISTORY-BOOKS.md` sections 4–7:
1. `build_<id>.py`, `inject_<id>_jump.py`, `plumb_<id>.py` from `_work/bud` (sed-copy; hub file
   `sports-hub.html` / `martial-arts-hub.html`; contents `sports-course.html` / `martial-arts-course.html`;
   short links `/spt1…`, `/mar1…`).
2. Add the ids to `build_course.jump_block()` regex, `make_hubs.py` COURSES/EXPLORE, `dash_catalog.py`,
   `_work/standards/` (META, COURSES, `<id>.json`), `_work/art/banners.json`.
3. `sh _work/course/run_course.sh <id>`, `python3 _work/course/make_hubs.py doors <id>`,
   `python3 _work/course/make_hubs.py check`.
4. Pencil drawings per `_work/art/pencil/GUIDE.md` (objects only — no figures mid-strike, no fighting).
5. Daily Drafts banks (`sports`, `martial`) in `daily-drops.html` via `_work/ddworld/`.
6. Home doors (Social studies fold) and `aog-topbar.js` `var EX`, each book with its own drawing.
7. `node tools/check-contrast.js` and `node tools/check-calm.js` on the new pages, then on every page.
8. Jimmy reviews one whole book in a browser before anything is merged. Nothing goes live half done.
