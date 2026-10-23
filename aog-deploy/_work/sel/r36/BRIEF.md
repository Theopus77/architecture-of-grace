# Room 36 (SEL, grades 6–8): the showstopper build — brief for every agent (AOG-R36-V1, 2026-10-23)

Jimmy: "Only do the Junior high material for the SEL no other bands. I trust the team … to make this a game changer show
stopper with the calmness that this material carries." Audience that must be won over: district adoption committees,
school boards, state reviewers, counselors, parents, and the 11–14-year-olds themselves.

## Read first (binding)
- /home/user/architecture-of-grace/CLAUDE.md — readable text in light and dark, calm pages (no motion, 16px fields, 44px
  targets), plain words in English AND Spanish, drop-downs for rows of 4+ choices (`data-aog-dropdown="Label|Etiqueta"`
  on the row; do NOT edit aog-dropdowns.js), silent until used, always architectureofgrace.com (never .org).
- This brief and `PLAN.md` beside it (who owns which file).

## Never
- Never touch a file you do not own (PLAN.md). Never run git. Never edit sw.js, _redirects, sitemap.xml, aog-dropdowns.js,
  aog-topbar.js, aog-grace.js, aog-calm.css — the lead does those.
- Never touch another grade band (Rooms 12, 18, 104, 207, the Adult edition).
- Never change a fact, a promise or a privacy claim, except where this brief says so. Never invent research, statistics,
  citations, laws or phone numbers. If unsure, leave it out and note it in your edits file for Jimmy.
- Never add deficit labels, clinical labels about children, or anything a hostile reader could quote out of context.

## The privacy rule (decided)
The family letters promise: "Nothing a student writes is collected, read, or kept." That promise stands. In Room 36 a
student's own writing never leaves the device. A sheet may at most tell the teacher "I finished" (name, sheet, time;
no words). Every student page says in one line what stays on the device.

## Words to use
- "check-in", never "screener" or "screening"; a check-in score is a teacher's starting point, never a label, a placement
  or a diagnosis (evidence.html says so).
- Crisis lines, exactly: 988 Suicide & Crisis Lifeline (call or text 988); Crisis Text Line: text HOME to 741741.
- Illinois mandated reporting: the DCFS Hotline 1-800-25-ABUSE (1-800-252-2873); every school employee in Illinois is a
  mandated reporter and must call when they have reasonable cause to believe a child is abused or neglected; they do
  not investigate first and do not hand the call to someone else.
- Star levels as the lessons use them: ★ elevated, ★★ highest (counselor physically present).
- Students read "Room 36"; teachers and reviewers may read the unit/lesson codes (U2·L6).

## New pages: how they look and behave
Copy the head, hero and card style of `aog-deploy/ef.html` (first-paint style, light-start script, canonical .com link,
icons, theme tokens for light AND dark, `<script src="/aog-topbar.js"></script>` first in body,
`<script src="/aog-grace.js" defer></script>` last). Every visible word in a `<span data-en="…" data-es="…">` leaf (the top
bar swaps them; no nested elements inside a translated span). Print on white paper with a clean @media print. iPhone
first, then iPad, then computer. One short line per screen; no walls of text; details/summary to fold long parts.
Add the comment marker AOG-R36-V1 with a one-paragraph note of what the page is.

## Checks you must pass before you finish (from the repo root)
    node tools/check-contrast.js <your pages>
    node tools/check-calm.js <your pages>
Serve aog-deploy with `python3 -m http.server <port>` (pick a free port 8800–8899) and look at your pages with
Playwright at 390, 820 and 1280 wide, light and dark, EN and ES (Node: require the global playwright via
`require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright")`). No console errors.

## Edits to files you do not own
Write them to `_work/sel/r36/edits/<your-name>.md`: file, exact old text (copied), exact new text, why. The owner applies
them later. Keep each edit small and exact.

## New page addresses (link to them freely; the lead adds the short links)
- /room-36-families  → room-36-families.html   (for families and boards: the whole year in 10 minutes)
- /room-36-measures  → room-36-measures.html   (every check-in and survey, A–H, printable)
- /room-36-consent   → room-36-consent.html    (letters, consent, opt-out, alternative activities)
- /room-36-safety    → room-36-safety.html     (disclosure and mandated reporting, safe messaging, counselor sign-off)
- /room-36-calendar  → room-36-calendar.html   (the year week by week, the reading schedule, fidelity checklists)
- /room-36-students  → room-36-students.html   (the students' door and "My Room 36")
- /room-36-years     → room-36-years.html      (grades 6, 7 and 8: Year A, B and C)
- existing: room-36-curriculum.html, room-36-lessons.html (#l/u1l2 style anchors — check the page), room-36-cards.html
  (#u1l2, #c-1-c), room-36-workbook.html, w1…w7, AoG-Anchor-Charts.html, room-36-novel.html (?ch=N — check aog-novel.js),
  family-letters.html, evidence.html, privacy.html, dpa.html, counselor-capacity.html, standards.html, xw-illinois-sel.html.

## Finish
Reply in ≤ 200 words: what you built or changed, the check results, and anything Jimmy must decide.
