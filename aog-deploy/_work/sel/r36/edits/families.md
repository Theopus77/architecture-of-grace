# Edits from the `families` agent (AOG-R36-V1, 2026-10-23)

Page built: `aog-deploy/room-36-families.html` (/room-36-families). It reads its facts from room-36-lessons.html
(titles, month/week, minutes, ★/★★ and PPRA marks, each lesson's ILLINOIS SEL ALIGNMENT box). When any of those
change in the lessons page, the families page must change too (its month list and its benchmark grid).

## 1. room-36-lessons.html — U1·L7 bridge exit tickets are collected (conflicts with the privacy rule)

Owner: lessons. In U1·L7, after the exit ticket box, the page says:

Old (exact):
    Bridge Exit Tickets: Collect these and review privately before Unit 2 Lesson 1. Flag for counselor awareness any student whose ticket reveals acute or alarming self-critical language.

New:
    Bridge Exit Tickets stay in students' journals, like every exit ticket. Do not collect them. If something you saw or heard worries you, tell the counselor what you noticed, not what a student wrote.

Why: the same box says "Never collected. Never graded.", the family letters promise "Nothing a student writes is
collected, read, or kept", and the brief keeps that promise. (The sentence appears in the U1·L7 section; check for a
second copy in the same section and change both.)

## 2. For Jimmy: the U1·L7 Future-Self Letter is kept by the teacher

U1·L7 says "Letter is sealed in an envelope — teacher stores securely. Returned at U4L7 ONLY." The teacher keeps a sealed
letter for eight months, which sits uneasily with "Nothing a student writes is … kept." The families page says it
plainly: "The teacher keeps the envelope safe, unopened, and gives it back in June." Jimmy to choose one:
(a) keep it, and add one line to family letter 1 naming it as the one thing kept, sealed and unread; or
(b) the student keeps their own sealed envelope (or it goes home) and brings it back in June.
If (b), change the bullet on room-36-families.html (#private, "The future-self letter: …").

## 3. For Jimmy: check two benchmark texts against ISBE

No lesson cites 1B.3b or 3A.3b, so their wording is not on the site anywhere. The families page quotes them as ISBE
words them (from memory of the published standards):
- 1B.3b "Analyze how making use of school and community supports and opportunities can contribute to school and life success."
- 3A.3b "Analyze the reasons for school and societal rules."
Please confirm against the ISBE document. When the standards agent's activities for these two are added to lessons
(their ILLINOIS SEL ALIGNMENT boxes), the families page's grid must list those lessons and its "18 of the 20" line
becomes 20 of 20. (Rebuild note: the page was made by a small script; editing the HTML by hand is fine.)

## 4. Lead: short link and site files

- `_redirects`: `/room-36-families  /room-36-families.html  200` (canonical on the page is
  https://architectureofgrace.com/room-36-families).
- `sitemap.xml`: add https://architectureofgrace.com/room-36-families.
- `sw.js`: bump CACHE.
- A link to the page from sel.html / family-letters.html (Letter 1 already points families to
  architectureofgrace.com/room36; /room-36-families is the plainer door for families and boards).

## 5. Novel chapter per lesson (for the calendar and novel-reader agents)

The families page links each lesson to the chapter that goes with it, by the reader's `?ch=` section index, from the
curriculum crosswalk and the chapters named like the lessons: U1·L1 ch 1–2 (?ch=2,3), U1·L2 ch 6 (7), U1·L3 ch 3 (4),
U1·L4 ch 4 (5), U1·L5 ch 5 (6), U1·L7 ch 7 (8), U2·L1 ch 8–9 (10,11), U2·L2 ch 10 (12), U2·L5 ch 11 (13), U2·L6 ch 12 (14),
U2·L7 ch 13 (15), U3·L1 ch 14 (17), U3·L3 ch 15 (18), U3·L6 ch 16 (19), U3·L7 ch 17 (20), U4·L3 ch 18 (22),
U4·L4 ch 19 (23), U4·L5 ch 20 (24), U4·L6 ch 21 (25), U4·L7 ch 22 (26). No chapter for U1·L6, U2·L3, U2·L4, U3·L2,
U3·L4, U3·L5, U4·L1, U4·L2. If the calendar's reading schedule pairs them differently, tell the families page.
