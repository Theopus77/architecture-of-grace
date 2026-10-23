# Room 36 build plan and file owners (AOG-R36-V1, 2026-10-23)

Sources: the reviewer audit and the teacher/student audit (summarized below), `_work/sel/review/room-36.md`.

## Phase 0 — the lead (now)
Privacy: w1–w7 and the workbook never send a student's words ("I finished" at most); one line on each saying what stays
on the device; the workbook's answer key behind "For the teacher". Then sw.js, _redirects, sitemap, sel.html links.

## Phase 1 — new pages and data (parallel; each agent owns only its files)
| agent | owns | job |
|---|---|---|
| families | room-36-families.html | the year in 10 minutes for families and boards: every lesson by month with a plain purpose, ★/★★ marks, what stays private, how to opt out, the benchmark grid, links to every word a child reads |
| measures | room-36-measures.html | Instruments A–H in one table and in full, printable, EN/ES: student check-in items, the pre/post self-assessment, family surveys G and H, the GAPA rubric, the year-end card; "check-in, never a screener" |
| consent | room-36-consent.html | before-the-year letter (10 days ahead, names the counselor-present lessons), active consent for ★/★★ lessons incl. U2·L6, notice + opt-out for the rest, an alternative activity for every sensitive lesson, Unit 2/3/4 transition letters; EN/ES, printable |
| safety | room-36-safety.html | disclosure and Illinois mandated-reporting protocol, a line-by-line safe-messaging review of each ★★/★ lesson (rewrites go to the edits file), the counselor sign-off form, crisis lines |
| calendar | room-36-calendar.html | 28 lessons week by week Sept–May, a reading schedule that covers every chapter, 25- and 40-minute pacing (sel-paths/room-36.json), a one-page fidelity checklist per lesson |
| students | room-36-students.html | the students' door: novel, workbook, worksheets, cards, calm tools; "My Room 36" progress kept on the device; no teacher scripts |
| years | room-36-years.html | grade 6 / 7 / 8 as Year A / B / C so no student repeats the same year: per lesson, a new scenario, a deeper role, a different novel focus |
| standards | standards.html, xw-illinois-sel.html | 2D shown where lessons cite it; 2D mapped correctly; activities for 1B.3b and 3A.3b written into the edits file for the lessons page |
| novel-es (×7) | novels/room-36.es/*.json | the Book 3 novel in Spanish, section by section |

## Phase 2 — one owner per existing page (after Phase 1's edits files exist)
| agent | owns | job |
|---|---|---|
| lessons | room-36-lessons.html | apply every edits file; a "Today" strip per lesson (chart, cards, worksheet, novel chapter); open on the next lesson not yet taught; smaller banner; long parts folded; teacher-only notes behind "Teacher view"; drop-down rows; no smooth scroll; Spanish notes home |
| curriculum | room-36-curriculum.html | apply edits; "Teach next"; fold the long crosswalk; reviewer-safe wording |
| cards | room-36-cards.html | Spanish card stories; filter as a drop-down |
| workbook | room-36-workbook.html | Spanish; Listen |
| worksheets | w1…w7 | Spanish prompts; Listen; crisis box on w6/w7 |
| charts | AoG-Anchor-Charts.html | phone toolbar, no arrow-key hint on touch, lesson row as a drop-down, Spanish chart lines |
| novel-reader | aog-novel.js, room-36-novel.html | Spanish switch, a content note and crisis box on the heavy chapters, one chapter loaded at a time, chapter ↔ lesson links |

## For Jimmy (not decided here)
One legal name (Architecture of Grace (Illinois) / …, LLC / … Foundation); the .org address printed in the pilot PDFs;
U4·L7 "submit anonymous aggregate data to the Architecture of Grace, LLC".
