# Edits from the `measures` agent (AOG-R36-V1, 2026-10-23)

Page built: `aog-deploy/room-36-measures.html` (/room-36-measures). It names every Room 36 measure A–H:

| | Instrument | When (as the page states it) |
|---|---|---|
| A | Grace Compass check-in (the site's 19 statements, Quick) | Sept. Wk 1, Jan. Wk 1, June Wk 1 (before U1·L1, U3·L1, U4·L7); optional before U2·L1 and U4·L1 |
| B | Bridge check (ticks only, new) | end of U1·L7, U2·L7, U3·L7 |
| C | Self-assessment, Sept. and June (16 "I can" items, new) | start of U1·L1; Step 1 of U4·L7 |
| D | GAPA, skills in action (pilot only, new) | Sept. Wks 1–2 (before U1·L2); June Wk 1 (U4·L6 week) |
| E | Fidelity log (new form) | weekly |
| F | Year-End Card (new) | close of U4·L7 |
| G | Family Mid-Year Survey (new) | U2·L7 |
| H | End-of-Year Family Survey (new) | U4·L7 |

Links into the page: `/room-36-measures#a` … `#h` (a hash opens that tool's "How to give it").

All edits below are for **room-36-lessons.html** (owner: lessons). Old text is copied exactly from the file as it
stands today (2026-10-23). `&amp;`, `’` and `&rsquo;` are as in the source.

---

## 1. Unit 1 crosswalk intro, step 1 — "Screen" → "Check in"

Why: "check-in", never "screener"; the score is a starting point (evidence.html).

Old:
~~~html
<p class="script strong">1 · Screen.  Run the Grace Compass check-in. It scores three domains — A (Regulation &amp; Well-Being), B (Self-Compassion &amp; Growth), C (Social Competency &amp; Repair).</p>
~~~
New:
~~~html
<p class="script strong">1 · Check in.  Run the Grace Compass check-in (<a href="/room-36-measures#a">Instrument A</a>). It scores three domains — A (Regulation &amp; Well-Being), B (Self-Compassion &amp; Growth), C (Social Competency &amp; Repair). A score is a starting point for a conversation, never a label, a placement or a diagnosis.</p>
~~~

## 2. Unit 1 crosswalk intro, "Important" line — "digital screener"

Old:
~~~html
The same routing logic runs the Grace Compass digital screener, so print and screen always agree.</p>
~~~
New:
~~~html
The Grace Compass check-in on screen uses the same routing, so paper and screen always agree.</p>
~~~

## 3. Every unit crosswalk footer (4 places, identical) — "digital screener"

Old (occurs 4 times; replace all):
~~~html
Mirrors the Grace Compass digital screener.
~~~
New:
~~~html
Matches the Grace Compass check-in.
~~~

## 4. U1·L1 — give the self-assessment (Instrument C) at the start of the lesson

Why: the post-assessment in U4·L7 is compared with a "pre-assessment" that no lesson gives. The pilot plan says
"Pre (before U1·L1)". Ten minutes fit when the optional scenario cards wait (the lesson already says the cards are
"Use if time allows"). The check-in itself is given in another period that week so the lesson keeps its time.

Old (the end of the U1·L1 SAFETY CHECK box; unique):
~~~html
surfaces something significant for students carrying heavy self-perception burdens.</p></div>
~~~
New:
~~~html
surfaces something significant for students carrying heavy self-perception burdens.</p></div>
<div class="box plain"><div class="blab">START OF YEAR  ·  SELF-ASSESSMENT  ·  10 MIN</div><p>Before the opening ritual, hand out the Room 36 self-assessment (<a href="/room-36-measures#c">Instrument C</a>): sixteen "I can" lines, ticks only. Say: "This is not a test. There are no wrong answers. You will fill in the same sheet in June and see what changed." Students may skip any line. Collect the sheets and seal them in one envelope until U4·L7. Today the scenario cards wait, to make room.</p><p>This week, in another class period, run the Grace Compass check-in (<a href="/room-36-measures#a">Instrument A</a>), Quick version.</p></div>
~~~

Note for the calendar/pacing owner: in `sel-paths/room-36.json`, `u1l1.p40` gives the cards 8 minutes; with the
self-assessment those 8 minutes plus 2 from Step 4 go to Instrument C. `u1l1.p25` has no room for it; on the
25-minute path give Instrument C in the same period as the check-in.

## 5. U1·L7 — bridge exit tickets are collected (box after the exit ticket)

Why: the exit ticket just above says "Never collected. Never graded."; the family letters promise "Nothing a student
writes is collected, read, or kept." The bridge check (Instrument B) keeps a way for a student to ask for an adult,
with ticks only. **Same old text as families.md #1; this new text includes the families agent's sentence, so apply
this one instead of that one.**

Old:
~~~html
<div class="box plain"><div class="blab">Bridge Exit Tickets:</div><p>Collect these and review privately before Unit 2 Lesson 1. Flag for counselor awareness any student whose ticket reveals acute or alarming self-critical language. These exit tickets tell you which students enter Unit 2 with the highest self-critical load.</p></div>
~~~
New:
~~~html
<div class="box plain"><div class="blab">Bridge check · Instrument B</div><p>Bridge exit tickets stay in students' journals, like every exit ticket. Do not collect them. Instead, hand out the bridge check (<a href="/room-36-measures#b">Instrument B</a>): one idea to keep and a choice to ask for a quiet word with an adult, ticks only. Read the cards the same day and talk with every student who asked before Unit 2 Lesson 1, with the counselor when the student chose the counselor. If something you saw or heard worries you, tell the counselor what you noticed, not what a student wrote.</p></div>
~~~

## 6. U1·L7 — teacher reflection repeats the collection

Old:
~~~html
Review all bridge exit tickets privately before Unit 2 Lesson 1. Flag for counselor awareness any student whose ticket reveals acute or alarming self-critical language.
~~~
New:
~~~html
Read the bridge checks (Instrument B) the same day. Talk with every student who asked for a quiet word before Unit 2 Lesson 1.
~~~

## 7. U2·L7 — teacher reflection: collect bridge exit tickets

Old:
~~~html
Collect bridge exit tickets and review privately before Unit 3 Lesson 1. Flag any student whose ticket reveals acute material for counselor awareness.
~~~
New:
~~~html
Exit tickets stay in the journals. Hand out the bridge check (<a href="/room-36-measures#b">Instrument B</a>) and talk with every student who asked for a quiet word before Unit 3 Lesson 1.
~~~

## 8. U2·L7 — PPRA note: the mid-year survey, linked

Old:
~~~html
<p>Family Mid-Year Survey (Instrument G) distributed today. Unit 3 Family Transition Letter distributed today.</p>
~~~
New:
~~~html
<p>Family Mid-Year Survey (<a href="/room-36-measures#g">Instrument G</a>: no names, English and Spanish together) distributed today. Unit 3 Family Transition Letter distributed today.</p>
~~~

## 9. U3·L7 — safety check: review bridge exit tickets

Old:
~~~html
Distribute Unit 4 Family Transition Letter at the close of this lesson. Review bridge exit tickets privately before Unit 4 Lesson 1.
~~~
New:
~~~html
Distribute Unit 4 Family Transition Letter at the close of this lesson. Hand out the bridge check (<a href="/room-36-measures#b">Instrument B</a>); talk with every student who asked for a quiet word before Unit 4 Lesson 1.
~~~

## 10. U4·L7 — pre-lesson checklist: the post-assessment

Old:
~~~html
<p>☐  Post-assessment printed and ready to distribute (administer BEFORE the celebration)</p>
~~~
New:
~~~html
<p>☐  Self-assessment (<a href="/room-36-measures#c">Instrument C</a>) printed, and the sealed September envelope ready (give it BEFORE the celebration)</p>
~~~

## 11. U4·L7 — Step 1 script: what happens to the two sheets

Why: the old script collects both sheets and also promises them back today; the PPRA note then says "store …
privately". Students compare and keep their own sheets; the teacher keeps only the class tally (in a pilot, the coded
numbers in the school's own Sheet).

Old:
~~~html
<p class="script">Distribute the post-assessment alongside the pre-assessment (students compare). Students complete silently. Collect both documents. "You will get these back today — so you can see where you started and where you are now."</p>
~~~
New:
~~~html
<p class="script">Students fill in the same sheet as in September (Instrument C), silently. Then hand each student their September sheet to compare. "These are yours to keep — so you can see where you started and where you are now." Before they go home, count the class tally on the tally sheet, with no names (in a validation pilot, copy each code's numbers into your school's own Sheet).</p>
~~~

## 12. U4·L7 — safety check, first paragraph: a score does not pick students

Why: Instrument C is a strengths self-report for the student, not a way to choose who needs help (evidence.html: never a
basis for a placement). The teacher's year of knowing the student is.

Old:
~~~html
<p>After the year-end lesson: debrief with the school counselor. Review post-assessment data together. Identify students who may benefit from continued counselor contact into next year.</p>
~~~
New:
~~~html
<p>After the year-end lesson: debrief with the school counselor. Look at the class tally together. From what you have seen and heard this year, not from a score, name students who may want continued counselor contact next year.</p>
~~~

## 13. U4·L7 — PPRA note, first paragraph

Old:
~~~html
<p>Post-Assessment (Instrument C) administered BEFORE the celebration. Store alongside pre-assessment privately.</p>
~~~
New:
~~~html
<p>Self-assessment (<a href="/room-36-measures#c">Instrument C</a>) given BEFORE the celebration, on the same sheet as in September. Students take both sheets home; the teacher keeps only the class tally, with no names.</p>
~~~

## 14. U4·L7 — PPRA note, the family survey linked

Old:
~~~html
<p>Distribute End-of-Year Family Survey (Instrument H).
~~~
New:
~~~html
<p>Distribute End-of-Year Family Survey (<a href="/room-36-measures#h">Instrument H</a>).
~~~

---

## For Jimmy (not changed)

1. **U4·L7 safety check, second paragraph**: "Submit anonymous aggregate data to the Architecture of Grace, LLC if your
   district has opted in. Store pre/post assessments privately and securely." The PLAN reserves this for you. It
   clashes with the same lesson's PPRA note ("Nothing is collected on a server of ours"). A wording that matches the
   note: "If your district has opted into the validation pilot, it shares the class totals under its own data
   governance; the data lives in your school's own Google Sheet." (The second sentence would also go, if edit 11 is
   applied: students keep their sheets.)
2. **Quick, not Thorough, in Room 36.** The site's Thorough mode saves three short written reflections with the
   response, and with a school Sheet they travel to that Sheet. Under the Room 36 rule (a student's own words stay
   with the student) the measures page tells teachers to use Quick. If you want Thorough allowed, say so.
3. **"GAPA"** is never spelled out — not in the pilot plan PDF nor anywhere on the site. The page says "GAPA: skills
   in action". If the letters stand for something, tell me and it goes in.
4. **Consent for the check-in.** The site's own legal crosswalk (xw-idea-legal.html, "Working Compliance Summary")
   puts the nineteen-statement reflection in the "instrument layer": written consent, in advance, questions attached.
   The measures page says so for A and prints the statements to attach. The consent agent's letters should name
   Instruments A and C (and D in a pilot) and attach their sheets.
5. **The pilot PDFs** (`pilot/AoG-Pilot-Overview.pdf`) call the check-in a "5-minute digital screener" and say
   "Screen → Route → Teach → Re-check"; they also print architectureofgrace.org. Not changed (PDFs; not mine).
6. **Pilot plan vs. lessons on timing.** The pilot plan gives the self-assessment "Post (after final lesson)"; the
   lessons give it in U4·L7 before the celebration. The page follows the lessons.
7. **New instruments written in this edition** (B, the 16 items of C, D's five behaviours, scenarios and anchors,
   E's form, F, G, H). None has been through outside review; the page says so and links evidence.html. Their wording
   is mine and is yours to change; keep C's items the same in September and June.
