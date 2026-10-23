# Room 36 calendar edits (AOG-R36-V1, agent: calendar, 2026-10-23)

The page: `room-36-calendar.html` (/room-36-calendar). The chapter ↔ lesson pairs: `_work/sel/r36/pairs.json`.
`room-36-calendar.html?l=u2l6` opens that lesson's plans and checklist.

## pairs.json — how to read it

One entry per lesson id (`u1l1` … `u4l7`), nothing else at the top level:

- `ch`: every chapter that goes with the lesson, numbered as the reader labels them ("Chapter 12" → `12`).
- `new`: chapters read for the first time before this lesson. Every chapter 1–22 is in exactly one `new`, in book order.
- `back`: chapters already read that this lesson looks back to (always read earlier in the year).
- `at`: the reader's `?ch=` values for `ch`, in the same order. **`?ch=` is the section index, not the chapter number**
  (aog-novel.js counts the note, the four part pages and the closing words): Ch. 1 → `?ch=2`, Ch. 8 → 10, Ch. 14 → 17,
  Ch. 18 → 22, Ch. 22 → 26.
- `min`: read-aloud minutes of the `new` chapters, at about 150 words a minute.
- `inclass`: chapters in `new` that are read together in class only (12, 15, 16).
- `note` / `note_es`: one line about the scene, English and Spanish.

Lessons with no chapter of their own: U4·L2 (empty `ch`). Lessons with only a look-back: U1·L2 (Ch. 1), U2·L3 (Ch. 5),
U2·L4 (Ch. 6), U3·L2 (Ch. 14), U3·L4 (Ch. 14), U3·L5 (Ch. 15), U4·L3 (Ch. 18).

## 1. novel-reader (aog-novel.js, room-36-novel.html)

- Chapter ↔ lesson links: for chapter N, "Read before U?·L?" is the lesson whose `new` holds N; "Looked back to in …" are
  the lessons whose `back` holds N. Link a lesson as `room-36-lessons.html?l=<id>`.
- Chapters 12, 15 and 16 are the heavy ones (`inclass`); the calendar says to read them together in class, on a day the
  counselor is in the building. That is where the content note and crisis box matter most.
- If the reader's addressing changes (e.g. `?ch=` becomes the chapter number), tell the lead: the calendar builds its
  links from `at` (`readerUrl()` in room-36-calendar.html) and pairs.json's `at` would need the new values.

## 2. lessons (room-36-lessons.html)

- The "Today" strip can take its novel chapter from pairs.json (`new` first, then `back`; `note`/`note_es` as the line).
- A link from each lesson to its timing and checklist: `room-36-calendar.html?l=<id>`, words "Timing and checklist" /
  "Tiempos y lista".
- Pacing gap (owner of `sel-paths/room-36.json`, the lead): three lessons have a step that is in neither the 25- nor the
  40-minute plan. U4·L2 step 03 "Scenario Cards B & C" is covered by the plans' card minutes. U4·L3 step 03 "Debrief &
  Step 0 on the poster" and U4·L4 step 03 "Pair check & first commitment" are not; the calendar lists them under "Not in
  either timed plan yet". Suggested: give each a minute count in `p40` (and in `p25` if it is core).

## 3. families (room-36-families.html)

Your section 5 asked to hear if the calendar pairs chapters differently. It does, in five places; please take the
pairs from pairs.json so every page says the same thing:

- Ch. 6 (Guilt & Shame) is read before **U1·L6**, not U1·L2. The chapter happens "six weeks" into the year and comes
  after Ch. 3–5, so it cannot be read before U1·L2 without breaking the story. U2·L4 looks back to it (Darius's four
  steps, which "Mr. Patel will teach the class formally in November"). U1·L2 looks back to Ch. 1's Mistake Wall.
- Ch. 18 is read before **U4·L1** (the book sets it in "the first week of April"; it names grace), and U4·L3 looks back
  to it. The crosswalk pairs it with U4·L3 only.
- Look-backs added: U2·L3 → Ch. 5 (Maya: "every B feel like an F"), U3·L2 and U3·L4 → Ch. 14, U3·L5 → Ch. 15.

## 4. curriculum (room-36-curriculum.html)

The crosswalk pairs 15 chapters. The other seven, as the calendar places them (one line each, if you add them):
Ch. 4 → U1·L4 · Ch. 5 → U1·L5 · Ch. 6 → U1·L6 (and U2·L4) · Ch. 7 → U1·L7 · Ch. 9 → U2·L1 · Ch. 13 → U2·L7 ·
Ch. 17 → U3·L7. The crosswalk's Ch. 20 "U4·L5 + U3·L7": U3·L7 comes before Ch. 20 is read, so the calendar pairs
Ch. 20 with U4·L5 only.

## 5. lead (sw.js, _redirects, sitemap.xml, sel.html)

- `_redirects`: `/room-36-calendar  /room-36-calendar.html  200` (canonical on the page is
  https://architectureofgrace.com/room-36-calendar).
- `sitemap.xml`: add https://architectureofgrace.com/room-36-calendar.
- `sw.js`: bump CACHE.
- A link from sel.html / room-36-lessons.html / room-36-curriculum.html: "The year, week by week" / "El año, semana a semana".

## 6. safety (room-36-safety.html) — please confirm

- The calendar follows your edits #30 and #32 already: U4·L3 and U4·L5 are ★ (counselor reachable the same day), with
  your checklist items (the trusted-adult line, the DCFS Hotline, "the class's own teacher" for U4·L5). If Jimmy drops
  them, set `star` back in the calendar (the override is one line in its data build; tell the lead).
- Every ★/★★ checklist carries: "You know the DCFS Hotline: 1-800-25-ABUSE (1-800-252-2873). If what a student says gives
  you reasonable cause to believe they are abused or neglected, you call it yourself." U2·L6 and U3·L6 carry your
  "the counselor hears it right then, not first at the debrief."
- New on the calendar (not in the lessons): chapters 12, 15 and 16 are read together in class, not sent home alone, and
  on a day the counselor is in the building. Say if the safety page should word it differently.

## For Jimmy

- **September to May.** The lessons page puts U4·L6 and U4·L7 in June Weeks 1–2. The calendar asks when the year ends: in
  a May year it moves them to May Weeks 3–4 (open weeks in the lessons' plan) and says so; in a June year it keeps June.
- **Spring break** is the teacher's choice (March Week 1 to April Week 4, March Week 4 by default). The calendar moves
  lessons past it and never leaves a ★★ lesson in the week before a break.
- **Thanksgiving** week (November Week 4) is shown as a short teaching week, because the lessons page puts U2·L4 there.
- **★★ lessons have 25-minute plans** in sel-paths. U3·L6's own rule is "if you cannot finish, do not start", so the
  calendar shows the 25-minute plan with that warning. You may prefer no 25-minute plan for U2·L6 and U3·L6.
- **Exit tickets.** Every checklist says "Students wrote it alone. It was not collected and not graded." The lessons page
  still says to collect the U1·L7 bridge exit tickets and to "review bridge exit tickets" after U3·L7; the families and
  safety edits files already propose the fix.
- **Left off the checklists on purpose:** U4·L7's "Submit anonymous aggregate data to the Architecture of Grace, LLC"
  (yours to decide, PLAN.md). The U4·L7 checklist says only that pre- and post-assessments are kept private and safe.
- The lessons page says "Grace Compass digital screener" in five places (the brief's word is "check-in"); the lessons
  owner can change "Mirrors the Grace Compass digital screener." and "runs the Grace Compass digital screener" to
  "…check-in".
