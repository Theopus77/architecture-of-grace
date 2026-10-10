# Room 36 review — Book 3 · The Interior · Grades 6–8

Read-only review of `aog-deploy/room-36-curriculum.html`, `room-36-lessons.html`, `room-36-cards.html`, `room-36-workbook.html`, `w1`–`w7` worksheets, `AoG-Interior-Worksheets.html`, `AoG-Anchor-Charts.html` (CHARTS array) and `novels/room-36.json` ("The Year of Two Voices"). Novel facts used as ground truth: seventh grade, ages 12→13, Mr. Patel (19 years), Ms. Calloway visiting; side characters Brielle, Cassidy, Maddie, Hannah (a girl in the year above), Imani (Darius's sister, 8), Aaliyah (Marcus's sister), Reese, Owen, Cole, Megan, Dr. Pam Mendel, Mrs. Tomlin, Mr. Ortiz.

SURE mechanical fixes are listed first in each table.

---

## novels/room-36.json

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| Note Before You Begin — "when the cohort leaves for high school, the Wall will go with them — Ms. Calloway will move it, the summer between seventh and eighth grade, to the eighth-grade hallway" | Self-contradiction in one sentence: the cohort is in seventh grade; next year is eighth grade, not high school (Room 104 confirms an eighth-grade year). | "By the end of seventh grade, the Wall will go with them — Ms. Calloway will move it, the summer between seventh and eighth grade, to the eighth-grade hallway." | sure |

No other factual problems found in the novel text sampled; the novel is internally consistent on ages, names and chapter order.

---

## room-36-curriculum.html

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| Ch. 19 crosswalk — "The cohort takes on a two-week Grace Challenge. Three small acts each." | Novel Ch. 19: "For seven days, each kid in Room 36 picked one small act of grace per day … At the end of the week, the class … talked about what happened." | "The cohort takes on a seven-day Grace Challenge — one small act of grace a day, written in the journal that night. The class, not the teacher, debriefs at the end of the week." | sure |
| Ch. 21 crosswalk — "comes back for spring break" | Novel Ch. 21: "In the third week of May, Mia came to Lincoln Park for a long weekend." | "comes back in May for a four-day long weekend." | sure |
| Marker guide Ch. 22 — "They are thirteen. … They will carry it into high school next year." | Next year is eighth grade (novel: "the summer between seventh and eighth grade"). | "They will carry it into eighth grade next year, and into high school after that." | sure |
| Marker guide Ch. 22 — "You will know them at fourteen and at twenty-five." | Fine as is; noted only because it sits beside the high-school error. | — | judgment call |
| Cohort line — "plus Brielle, Cassidy, Maddie, Hannah (grown-up version)" | Hannah in the novel is "a girl named Hannah in the year above them" (Ch. 1) and the person Priya's Critic compares her to (Ch. 8). "grown-up version" is not a meaning any reader can decode. Also Imani, Aaliyah, Reese, Owen, Cole, Megan, Dr. Pam Mendel, Mrs. Tomlin, Mr. Ortiz are all named and carry scenes. | "plus Brielle, Cassidy, Maddie, Hannah (the year above), Imani and Aaliyah (little sisters), Reese, Owen, Cole, Megan, Dr. Pam Mendel, Mrs. Tomlin, Mr. Ortiz" | judgment call |
| Ch. 11 crosswalk — "The cohort returns to Priya's old practice" | In Ch. 11 the Friend Test worksheet is handed out by Mr. Patel and the scene is Marcus's; the novel never attributes the practice to Priya. Could not verify against Books 1–2; check before publishing. | If unverifiable: "The cohort returns to the two-column practice from Room 18 — write what you would say to your best friend, then say it to yourself." | judgment call |
| Ch. 18 crosswalk — quoted "Maybe they didn't see. Maybe they had a bad morning. Maybe it is not about me." Three maybes before the verdict. | These words are not in the chapter (the chapter teaches "Interpretation A / Interpretation B" and "charitable interpretation"). The quotation marks imply the novel says it. Same for Ch. 12's quoted chart line "the draft is editable" and Ch. 8's "It is loud, not true" — none appear in the novel. | Drop the quotation marks or label them "chart line" rather than novel quotes: e.g. "Chart line: Maybe they didn't see. Maybe they had a bad morning. Maybe it is not about me." | judgment call |
| Ch. 16 crosswalk/marker — "Four sections: what you did; what it cost me; what I am putting down; what I am keeping." | Correct for the novel, but `room-36-lessons.html` U3·L6 template has FIVE differently named sections (see lessons table). One of the two must change; the novel and workbook both say four. | Keep this; fix the lesson template. | sure (conflict) |
| Ch. 21 anchor chart — "GRACE GAP (6-8) — the gap between what someone has done lately and what you still extend toward them." | The lesson U4·L6 anchor chart defines Grace Gap as "where the absence of grace creates a noticeably harder experience for someone" (an observation target for the final project). Two incompatible definitions of the same term; the workbook tests the crosswalk one. | Rename this one to avoid the collision: "GRACE ACROSS DISTANCE (6-8) — the gap between what someone has done lately and what you still extend toward them." and change the lesson-alignment cell to "U4·L6 — Grace Audit (community application)". | judgment call |
| Grace in Practice closing — "A senior who has practiced these five behaviors across four years" and header "in a 6-12 classroom" | This is the 6–8 book; a seventh-grader is not a senior. Text was clearly written for the 6–12 span. | "A student who has practiced these five behaviors across middle school has begun building the architecture this curriculum has pointed at since first grade." and "in a 6–8 classroom". | judgment call |
| Marker guide Ch. 3 — "they reduce the weight by maybe forty percent" | Invented precision presented to students as fact. | "they take a real amount of the weight off. That is real relief." | judgment call |
| Register line — "suicidal ideation is statistically present in this band" | Teacher-facing only; acceptable under AFSP guidance. No change. | — | judgment call |

---

## room-36-lessons.html

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| Unit 4 routing table — "U4·L5 + U3·L7<br>+ U3·L7 — Difficult vs. Unsafe / Limits" | Duplicated "+ U3·L7". | "U4·L5 + U3·L7<br>Difficult vs. Unsafe / Limits" | sure |
| Footer tab — "The Worksheets — the interactive six ↑" (twice, incl. the JS string at `wsTab.innerHTML=`) | Header and page say seven worksheets. | "The Worksheets — the interactive seven ↑" | sure |
| U3·L6 Step 1 — "The person who hurt you may have moved on. But you do — because resentment is the experience of reliving harm." | Grammar: the verb has no antecedent. | "The person who hurt you may have moved on. You have not — because resentment is the experience of reliving harm." | sure |
| U3·L7 — anchor chart formula "When you ___ / I ___ / Going forward, I need ___." vs Step 2 "Use the formula: 'I need ___. When ___ happens, I will ___.'" | Two different formulas taught in the same lesson; the chart, the CHARTS array and Card BD-A all use the first. | Step 2: "Use the formula on the chart: 'When you ___ / I ___ / Going forward, I need ___.'" | sure |
| U3·L3 header "★ HIGH RISK" but the block reads "★★ MANDATORY PRE-LESSON REQUIREMENTS" (same block heading also used on U4·L7, which is only "★ ELEVATED") | Star level in the checklist heading contradicts the lesson's own flag. | U3·L3: "★ MANDATORY PRE-LESSON REQUIREMENTS"; U4·L7: "PRE-LESSON CHECKLIST" (no stars). | sure |
| U3·L6 worksheet template — five sections ("What I have been carrying / What carrying it has cost me / What I want to name about what happened / What I am choosing to release / What I am keeping") | Novel Ch. 16, curriculum crosswalk, marker guide and workbook Q5–Q6 all teach FOUR sections: what you did; what it cost me; what I am putting down; what I am keeping. Workbook answer "Section four: what I am keeping" is wrong against this template (keeping is section five). | Replace the template with four labelled sections: "1 · What you did:" "2 · What it cost me:" "3 · What I am putting down:" "4 · What I am keeping — a boundary, a standard, a lesson:" | sure (conflict) |
| U2·L7 Opening — "OPENING · 3 MINUTES … Students write 4 minutes." | Timing inside a 3-minute opening is 4 minutes. | "OPENING · 5 MINUTES" | sure |
| U2·L7 — "Return U2L1 journals … before class begins" / "Return the journals from U2L1" | Every exit ticket says "Never collected"; U1·L7 correctly says "Open your journal to the first entry". Teachers never had the journals. | "Have students open their journals to the U2L1 entry (the specific words of their internal critic)." (both places, and in the anchor-chart build note) | sure |
| U4·L6 anchor block — "This is the anchor chart from U4L1 — post alongside the Unit 4 Grace definition." | The Grace Gap chart is new in L6; U4L1's chart is "What Is Grace?". | "Post alongside the What Is Grace? chart from U4L1." | sure |
| U4·L6 — Quick Review and Opening repeat the same words ("Unit 4: what is grace? … What is a Grace Gap? … Today we take that concept outside the classroom") | Duplicated content, 3–4 minutes of the same line. | Delete the OPENING paragraph; keep Quick Review. | sure |
| U2·L1 anchor-chart block — "CATASTROPHISING / GLOBALISING / PERSONALISING" ; U2·L3 note home "paralyse" ; U3·L1 "analyse" ; U3·L5 "analyse" | British spellings in an ISBE-aligned US curriculum that otherwise uses "Catastrophizing" (worksheet, CHARTS array, workbook). | "CATASTROPHIZING / GLOBALIZING / PERSONALIZING"; "paralyze"; "analyze". | sure |
| U1·L7 — "Look at everything this class has built in six weeks" / "remember from these six weeks" vs same lesson "The distance between Week 1 and Week 7" and note home "after the last seven weeks" | Sep Wk1 → Oct Wk3 is seven weeks. | "seven weeks" in both Step 1 and the Step 2 script. | sure |
| U3·L7 Consolidation Note — "Limits DI + Boundary Scripts (20 min) → Scenario Cards (5 min) → … Bridge (5 min)" vs steps "01 … 8 MIN", "02 … 15 MIN", Part 1 "25 min total", "05 Bridge Framing 8 MIN", Part 2 "20–22 min" | Note says 3+20+5+12+5+5 = 50; steps add to 3+23(+5 cards)+22+5 = 53–58 for a 45–50 min lesson. | Make Step 02 "12 MIN", Step 05 "5 MIN", Part 1 "20 min total", Part 2 "17 min total", and change the note to "Opening (3) → Limits DI + Boundary Scripts (20, cards inside) → Synthesis + Collective Wisdom (14) → Bridge (5) → Exit ticket (5)". | sure |
| U4·L2 — Steps total 2+8+10 = 20 min of a 40-min lesson; Cards B and C are listed but no step runs them | A teacher cannot see where the second half of the lesson goes. | Add "03 Scenario Cards B & C · 15 MIN — Pairs on Card B (The Repeated Mistake). Card C (The Power Difference) as a whole class — deliver the equity alert first." | sure |
| U4·L3 — Steps total 2+7+15 = 24 min / 40 ; U4·L4 — 2+7+12 = 21 min / 40 | Same gap. | U4·L3 add "03 Debrief & Step 0 on the poster · 10 MIN"; U4·L4 add "03 Pair check & first commitment · 10 MIN". | judgment call |
| U4·L4 exit ticket — "What measuring grace means to me: ___." | Odd phrasing for 11–14; nothing in the lesson is about "measuring". | "What I expect to notice after a week of these: ___." | judgment call |
| U2·L6 "See Section 4 — Teacher Wellbeing" ; U3·L1 "Disclosure Protocol (Section 4 — Legal & Clinical Compliance)" ; U3·L6 "established six-step protocol" | "Section 4" exists nowhere on the site and is given two different names; "six-step protocol" is never defined. | Link to the actual protocol page, or: "See the Disclosure Protocol and Teacher Wellbeing notes in the Book 3 teacher manual (Section 4)." Use one name. | judgment call |
| U2·L7 "Family Mid-Year Survey (Instrument G)" and U4·L7 "End-of-Year Family Survey (Instrument G)" | Two different surveys share one instrument letter. | Give the end-of-year survey its own letter, e.g. "(Instrument H)", or drop the letters. | judgment call |
| U4·L1 Opening — "Use the opening ritual — the same one from the first lesson. 'Put both feet on the floor. Take one breath that is slower than usual.'" | U1·L1 says only "Begin with the opening ritual" and never scripts it; the first time the words appear is here in April. | In U1·L1 QUICK REVIEW: "None — this is Lesson 1. Begin with the opening ritual: 'Put both feet on the floor. Take one breath that is slower than usual.' Ninety seconds. You will use this ritual all year." | judgment call |
| U1·L3 Card 1·F step — "Marcus deleted his comment — still showing up 14 months later" | The novel's Marcus incident (crosswalk "the June screenshot incident") is a screenshot he forwarded of somebody else's texts; the card invents a different incident for the same named character. Acceptable as a scenario, but a class that has read Ch. 3 will notice. | Either rename the card's character ("Cameron") or align it: "Marcus forwarded a screenshot of somebody else's texts in June, deleted it within minutes — a copy resurfaced fourteen months later." | judgment call |
| U2·L5 FT Pair A — "quits gym, stops eating well" (card: "stops eating properly") | Disordered-eating cue in a lesson with no counselor note; a counselor would flag it for a 6–8 room. | "quits the gym, stops sleeping well" | judgment call |
| U1·L2 / U2·L6 / U3·L6 — risk protocol | ★★ lessons carry counselor-in-room, crisis resources, no-sub, no-pre-break, same-day debrief and AFSP wording. ★ lessons (U3·L3, U4·L6) carry counselor-available + posted resources. Protocol coverage is complete. | — | sure (no change) |
| U1·L4 Step 4 — "Research shows that having ONE person…" ; U2·L2 "Leon Festinger's research" ; U4·L4 "Sonja Lyubomirsky's research" | Attributions are accurate (Asch 1951 for the ally effect; Festinger 1954; Lyubomirsky kindness studies). No change. | — | judgment call |

---

## room-36-cards.html

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| Card 1-E — situation begins "[…] dealing with significant anxiety" | Truncated / placeholder text: the sentence has no subject. | "Kezia's feed shows a perfect life — coffee shops, friends, sun on her face. Underneath, she is dealing with significant anxiety and hasn't slept properly in three months. She told a close friend: "If I posted what I actually feel, I'd lose everything."" | sure |
| Card 1-B teacher note — "Introduces identity-fusion concept." | Question 3 on the same card and the lesson say "identity foreclosure". | "Introduces the identity-foreclosure concept." | sure |
| Card FT-1 Q3 — "(acknowledge repair commit → move on)" and Lesson 4 family note "acknowledge repair commit. move on." | Missing arrows / punctuation in the four-step list. | "(acknowledge → repair → commit → move on)" and "acknowledge → repair → commit → move on." | sure |
| Card BD A Q2 — "When you ______ // Going forward, I need ______." | Middle clause of the formula is missing. | "When you ______ / I ______ / Going forward, I need ______." | sure |
| Card IDs — "FT.A" / "FT-B"; "GR-A" / "GR.B"; "MR A" / "MR-B" / "MR.C"; "CH.A" / "CH-B"; "HP-A" / "HP.B"; "DE A" / "DE B" / "DE C"; "BD A" / "BD-B" | Inconsistent separators across the deck. | Use one form throughout: "FT-A", "FT-B", "GR-A", "GR-B", "MR-A", "MR-B", "MR-C", "CH-A", "CH-B", "HP-A", "HP-B", "DE-A", "DE-B", "DE-C", "BD-A", "BD-B". | sure |
| British spellings across the deck — "humour", "Prioritise", "apologised", "apologise", "practised", "hospitalised", "demoralising", "modelling", "behaviour", "centre", "recognise", "mum" (FT.A: "tells her mum") — while Card 1-D says "apologized" | US curriculum; mixed spelling within one deck. | Americanize: "humor", "Prioritize", "apologized", "practiced", "hospitalized", "demoralizing", "modeling", "behavior", "center", "recognize", "tells her mom". | sure |
| Hyphens used as dashes (~30 places), e.g. 1-A "social mask-new name spelling", 1-E "close it- even slightly", 1-G "bad person- I just", MR A "cost Jamie- and what" | Reads as a typo on the board and in print. | Replace " - " / "- " / "-" used as a dash with " — " (em dash). | sure |
| Unit headings — "Unit 1 The Mask & The Mirror", "Unit 2 The Internal Critic & The Friend Test", "Unit 3 Repair & Reckoning" | Lessons/curriculum call them "Identity & The Weight of Perception", "Self-Compassion & The Internal Critic", "Empathy & Forgiving Others". Unit 4 matches. | Use the lesson-page unit names. | judgment call |
| Card II-B Q4 — "How does this scenario change if Amara is from an underrepresented group in the class?" | Amara is a named cohort member the class knows; asking students to hypothesize her group membership is awkward and invites identification. | "How does this scenario change if the joke touched on the student's culture or background?" | judgment call |
| Card FVR-A teacher note — "Counselor should be present." | Lesson U3·L3 requires counselor "on-site or immediately available" for the lesson and "present ONLY" for Card B. Note on Card A overstates. | "Counselor on-site for the lesson. Do not ask students to share personal forgiveness situations." | judgment call |
| Card FT.A — "stops eating properly" | See lessons table. | "stops sleeping properly" | judgment call |
| Lessons data-es "Tarjetas de escenarios" vs deck/site "Tarjetas de escenario" | One Spanish string differs from all others. | "Tarjetas de escenario" | sure |

Spanish (`data-es`) strings in the deck are complete and correct; card bodies are English-only by design.

---

## room-36-workbook.html

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| All Part A questions — correct option is A in 31 of 33 (`data-ok="1"` is the first option everywhere except U1 Q3 and Q6); no shuffle in the page script | Students will notice by question 3. | Reorder options so the correct letter varies (roughly 8 A / 8 B / 8 C / 9 D), and update the answer-key letters to match. | sure |
| Unit 3 Q6 answer — "Section four: what I am keeping." and Q5 "Four sections, never sent." | Correct against the novel and crosswalk; wrong against the five-section template in `room-36-lessons.html` U3·L6. Fix the lesson template (see above). | — | sure (conflict) |
| Unit 4 Q6 — "The Grace Gap is — A the gap between what someone has done lately and what you still extend toward them" | The lesson U4·L6 a student sat through defines Grace Gap as "where the absence of grace creates a noticeably harder experience for someone"; none of the four options matches what the lesson taught. | Either add the lesson definition as the keyed answer, or rename the crosswalk concept (see curriculum table) and reword: "Grace across distance is —". | sure (conflict) |
| Year-End Q4 explanation — "The last line of Room 36." | The novel's last lines are "The vocabulary, now, is yours. Carry it."; "The framework is portable. They are taking it with them." is the curriculum page's sign-off. | "The closing line of the Room 36 curriculum." | sure |
| Year-End Part B 2 — "A short letter to your ninth-grade self" | The book is seventh grade and the workbook serves grades 6–8; a sixth-grader's next self is not ninth grade. | "A short letter to your high-school self" | judgment call |
| Unit 4 Q1–Q3 (three maybes, Three-Strike Rule) and Unit 1 Q6 (three digital-backpack rules) | These are taught only in the curriculum crosswalk's neuro-affirming column and marker guide, not in any lesson on the lessons page (U4·L3 teaches Step 0 + the four-step Pause; U1·L3 never gives the three rules). A class taught from the lessons page cannot answer them. | Add the three rules to U1·L3 Step 4 and the Three-Strike Rule to U4·L3's teacher reflection / Card B debrief, or reword the workbook items to the lesson's Step 0 and four-step Pause. | judgment call |
| Unit 2 Q7 explanation — "The Critic is loud, not true; the Witness is quiet, and accurate." | Fine for students; comma before "and accurate" is stray. | "the Witness is quiet and accurate." | sure |
| Unit 3 intro — "release that does not require trust" | Good. No change. | — | — |

Reading level of Part A/B prompts is appropriate for 11–14; "cessation of resentment" (U4 Q4 option A) is the one hard phrase.

| Unit 4 Q4 option A — "distance, plus the cessation of resentment" | "cessation" is above grade level for many 11-year-olds. | "distance, plus letting the resentment go" | judgment call |

---

## Worksheets (w1–w7) and AoG-Interior-Worksheets.html

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| w6 Rewriting the Script — sections "3 Is it the whole truth? · 4 The Compassionate Witness · 5 Rewriting the script" vs lesson U2·L6 worksheet box "(3) Evidence that contradicts it. (4) What it costs me to keep it. (5) A more accurate, fair version." and scan note "Section 5 is the most important — write a word, any word, that is fairer" | Lesson describes a section 4 ("what it costs me") that the worksheet does not have; counselor script points at section numbers that differ. | In the lesson's WORKSHEET box: "(1) The script I carry. (2) Where it was written. (3) Is it the whole truth? (4) What the Compassionate Witness would say. (5) An alternative script, in one sentence." | sure |
| w5 Perfectionism Spectrum — two marks ("In school", "Another part of my life"), prompts "Where I sit — and why" / "One way I want to move toward healthy striving" vs lesson U2·L3 box "mark where they sit in school, activities, and social life … 'One area where my perfectionism looks like laziness is ___. What is actually happening is I am afraid of ___.' Then: 'One imperfect step I can take this week is ___.'" | Lesson describes prompts the interactive sheet does not contain (the exit ticket carries them instead). | Lesson WORKSHEET box: "Two marks: school, and one other area of life. Then: why each mark sits where it does, and one way to move toward healthy striving. The 'one imperfect step' goes in the journal/exit ticket." | judgment call |
| w5 — "Toxic perfectionism" (heading, slider label, family note) | Lesson and CHARTS array use "Perfectionism" vs "Healthy Striving"; "toxic" is a label some students will apply to themselves. Neuro-affirming preference. | "Perfectionism" (or "Fear-driven perfectionism") throughout w5. | judgment call |
| w2 Values Under Pressure — columns "The pressure I feel / The integrity response / What it costs / What it gives" + "My one person" vs lesson box "One value that has come under peer pressure. What was the pressure? What did they do? What do they wish they had done? What would they do differently next time?" | Lesson describes a different sheet. | Lesson WORKSHEET box: "One value I will not trade. Four columns: the pressure, the integrity response, what it costs, what it gives. Plus 'my one person' from the One-Ally Strategy. Never collected." | judgment call |
| w4 / lesson U1·L7 — lesson box lists three prompts ("What do you want to remember from Unit 1? …") while the sheet prints three sentence starters ("Right now I am learning that… / One thing I want you to remember is… / I hope that by June…") | Minor; the starters match Step 2 of the lesson. | Align the lesson box to the three starters. | judgment call |
| AoG-Interior-Worksheets.html list — "Unit 2 · L1 Internal Critic Profile architectureofgrace.com/w7" sits between w4 and w5 | Correct by lesson order; the URL numbering (w7 before w5) will confuse teachers reading aloud. | Leave order; no change needed. | judgment call |
| All seven sheets — crisis lines on w6 and w7 only | Correct: only the ★★ lesson (U2·L6) and the Critic sheet carry 988 / 741741. No change. | — | — |

Spanish: each worksheet's `data-es` strings (masthead, back link, room switcher, "Unidad") are present and correct.

---

## AoG-Anchor-Charts.html (CHARTS array)

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| `id:"gracegap"` name "The Grace Gap — What to Look For", definition "where the absence of grace creates a noticeably harder experience for someone." | Matches the lesson, conflicts with the crosswalk/workbook definition (see curriculum and workbook tables). | Resolve at the crosswalk/workbook end. | sure (conflict) |
| `id:"critic"` cols — "Catastrophizing / Globalizing / Personalizing" | Correct US spelling; lessons page block uses -ising. | Fix the lessons page. | sure |
| `id:"charter"` post/keep and all 28 chart names vs lesson anchor-chart headings | All 28 names, post/keep notes, formula wording and step lists match the lessons page. | — | sure (no change) |

---

## Safety and neuro-affirming language — summary

- All ★★ lessons (U2·L6, U3·L6) and ★ lessons (U3·L3, U4·L6) carry their protocol notes; the crosswalk flags match the lessons page flags. U3·L3's checklist heading mislabels itself ★★ (fixed above).
- No deficit labels found in student-facing text. Two phrases to soften: "toxic perfectionism" (w5) and "stops eating properly/well" (FT-A card and U2·L5).
- Digital content that will date: "Instagram" (novel Ch. 3, crosswalk Ch. 3) and "Summer 23. Fall 23." season labels in the novel. Acceptable for a novel; the crosswalk could say "Kezia's feed" instead of "Kezia's Instagram" to age better. Judgment call.
- Crisis numbers (988, HOME to 741741) are consistent everywhere they appear.

## Grade-level fit — summary

Student-facing text (workbook, worksheets, cards) reads at grade 6–8. Hard words worth checking: "cessation" (workbook U4 Q4), "absolution" (workbook U3 Q1 option A), "identity foreclosure" (card 1-B, flagged Grades 7–8 already), "preference falsification" and "audience collapse" (teacher tips only, fine).
