# Room 12 (Book 1, Grades K–2) — Editorial Review

Scope: `aog-deploy/room-12-curriculum.html`, `room-12-lessons.html` (28 lessons), `room-12-cards.html` (34 cards), `room-12-workbook.html`, `w12-1..4-*.html`, `AoG-Anchor-Charts-12.html` (CHARTS/WALLS arrays), `novels/room-12.json` (The Year We Met Sammy, 27 chapters). Read-only; no files changed.

Source of truth used for facts: the novel. Ten kids (Marcus, Amara, Sofia, Priya, Darius, Jordan, Maya, Theo, Mia, Kezia), first grade, Ms. Calloway, Sammy the frog puppet, Mr. Tate (counselor), Aaliyah (Marcus's 3-year-old sister), Jaylen / Kenji / Elijah / Lily / Wyatt (other classes), Biscuit (Darius's dog). Chapter numbering in the novel matches the curriculum crosswalk (Ch. 1–27); no chapter-number errors found.

Placeholder scan (TODO / lorem / [brackets] / TBD): none found in any Room 12 file.

---

## 1. room-12-lessons.html

### SURE — mechanical

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| U3 crosswalk row `U3·L1` → "Ch. 15 · Your Hurt Is Real Mia, whose feelings were hurt by something her cousin said" | Wrong character. Novel Ch. 15 is **Priya**, left without a partner in the sticker game (Jordan pairs with Theo). Mia's hurt is Ch. 18 (Lily), and there is no cousin. | "Priya is left without a partner in the sticker game. Nobody meant it. It still hurt." | sure |
| U4 crosswalk row `U4·L3` → "Ch. 23 · Giving the Benefit of the Doubt Theo notices that when Jordan does not say hi back…" | Wrong characters. Novel Ch. 23 is **Sofia** bumped by **Wyatt** (a second-grader) on the playground. | "Wyatt bumps Sofia on the playground and keeps running. Her fast story: 'Wyatt is mean.' Then she thinks of three other reasons." | sure |
| U4 crosswalk row `U4·L5` → "Ch. 25 · Grace With Hard People Kezia talks about a cousin who is unkind." | No cousin in the novel. Ch. 25: each child writes a private "I do not have to ___. But I can wish them ___" line; Kezia's is about the grown-up who is not allowed in her house. | "Each child writes one private grace-with-limits line: 'I do not have to ___. But I can wish them ___.'" | sure |
| U2 crosswalk row `U2·L2` "The Weight We Carry (K-2) · Ch. 9 · Carrying Too Much … USE THE LITERAL BACKPACK" | Lesson 2.2 is the body-outline lesson ("Where My Feelings Live"); the backpack demo is Lesson 2.1. Row points at the wrong lesson. | Change `U2·L2` to `U2·L1` in this row (and keep the MY BACKPACK chart with it). | sure |
| Crosswalk lesson titles (all four units) | Crosswalk names do not match the lesson headings on the same page: U1·L2 "Emotions Are Information" (lesson: My Feelings Are Friends); U1·L4 "Inner Critic vs. Inner Coach (K-2)" (My Inside Voice — Kind or Unkind?); U1·L5 "Guilt vs. Shame (Oops vs. I Am Bad)" (Oops vs. I Am Bad); U1·L6 "I Am More Than My Worst Moment (K-2)" (I Can Change and Grow); U2·L2 "The Weight We Carry (K-2)" (Carrying Too Much); U2·L3 "Real Sorry (Three Parts)" (Saying Sorry and Meaning It); U2·L4 "Kind Coach Practice" (Being Kind to Myself); U2·L5 "The Letting-Go Practice" (Letting Go — The Practice); U2·L6 "When Self-Forgiveness Is Hard" (When It's Hard to Forgive Yourself); U3·L3 "Forgiveness vs. Reconciliation (K-2)" (Forgiving Is Not the Same as Trusting); U3·L5 "Narrative Identity (K-2)" (My Story Is Not the Whole Me); U4·L1 "What Is Grace? (K-2)" (What Does Grace Look Like?); U4·L3 "The Pause (K-2)" (Giving the Benefit of the Doubt); U4·L5 "Difficult vs. Unsafe (K-2)" (Grace With Hard People); U4·L7 "Community Charter & Year-End" (Community Charter & Year-End Celebration). | Use the lesson's own heading in every crosswalk row (same fix in room-12-curriculum.html "Lesson alignment"). | sure |
| Lesson 1.1, step 05: "See Section 1.6 for the full Compact protocol." | Dangling reference. 1.6 is the lesson "I Can Change and Grow"; there is no Compact protocol on the site. | "Post it beside the Identity Web and keep it up all year." | sure |
| Lesson 2.4, Safety Check: "See Section 4, Legal & Clinical Compliance." | Dangling reference to the print master; nothing on the site by that name. | "See the Consent Protocol (files/AoG-Consent-Protocol.pdf)." — or delete the sentence. | sure |
| Lesson 2.2, POST-LESSON CLOSE-OUT: "whose markings concerning specific areas (e.g., excessive marking, distressing symbols)" | Broken sentence (no verb). | "whose markings on specific areas raise concern (e.g., excessive marking, distressing symbols)" | sure |
| Lesson 2.6, TEACHER REFLECTION: "includes only an unsafe person, or is named a person already known to be unsafe" | Grammar. | "includes only an unsafe person, or names a person already known to be unsafe" | sure |
| Lesson 3.2, step 01: `They were copying someone." None of these make hurt OKAY — but understanding helps."` | Unbalanced quotation marks (closes twice). | `They were copying someone. None of these make hurt OKAY — but understanding helps."` | sure |
| Lesson 4.4, step 01: `Looking up when someone speaks." None of these are big. ALL of them count."` | Same unbalanced quotes. | `Looking up when someone speaks. None of these are big. ALL of them count."` | sure |
| Lesson 1.3, GRADES 1–2 box: "Grade 2: identify an Oops they've caught themselves saying recently." | An Oops is done, not said (Grumpy Gus lines are said — that is Lesson 4). | "Grade 2: name one Oops they made recently and what they did to fix it." | sure |
| Lesson 1.1, step 01 "Introduce Sammy · 3 MIN": "Take two minutes to introduce Sammy" | Timing contradicts the step's 3-minute label. | "Take three minutes to introduce Sammy" | sure |
| Cards door link (JS `cd.setAttribute("href","room-12-cards.html#"+id)`) for lessons 4.3, 4.4, 4.5 | Links go to `#u4l3`, `#u4l4`, `#u4l5`, but on the cards page `#u4l3` is "Small Acts" and `#u4l4` is "Grace With Hard People"; `#u4l5` does not exist. Root cause is the cards page mislabeling (see §3); fix there. | Renumber the Unit 4 lesson blocks on the cards page (u4l2→u4l3, u4l3→u4l4, u4l4→u4l5). | sure |

### Judgment calls

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| Lessons 2.4 and 2.5 header "PPRA · Counselor Briefed" | Curriculum flags Ch. 11 and Ch. 12 (these lessons) as ★ HIGH RISK; the lesson headers carry no ★ and no "Crisis resources visible" line, although the page's own legend says ★ = counselor co-facilitation + posted crisis resources. Lessons 2.6, 3.3 have the line; 3.5 and 4.7 are ★ but also lack it. | Add "★ ELEVATED" to the 2.4 and 2.5 headers and add the line "Crisis resources visible: 988 Suicide & Crisis Lifeline · Crisis Text Line: HOME to 741741." to the Safety Check of 2.4, 2.5, 3.5 and 4.7. | judgment call |
| Lessons 2.7 and 4.7, workbook U4 Q8: letters written in "December", opened in "May" | Novel: letters written at the end of January (Ch. 14), opened on the last Friday of school in June (Ch. 27). Lessons are internally consistent but disagree with the book the class is reading. | Either say "in the winter" / "on the last day of school", or align to the novel (January / June). | judgment call |
| Lesson 1.3, step 05: "You are a learner, not a failure." | Says "failure" to five-year-olds; the rest of the page avoids deficit words. | "You are a learner. Learners make mistakes." | judgment call |
| Lesson 2.4 timings: 5+4+4+5 = 18 min, then "End with the Drawing Activity" (untimed) in a 20–25 min lesson | The kind-message card — the lesson's artifact — has no minutes. | Make step 04 "Part Three — Mindfulness + Kind Message card · 8 MIN". | judgment call |
| Lesson 2.6 timings: 5+6+5+4 = 20 min for a 25–30 min lesson; the Support Web build sits inside a 6-min step | Under-allocated for the year's most important activity. | Step 02 "Talk to Someone You Trust + Build the Support Web · 12 MIN". | judgment call |
| Lesson 3.6 OBJECTIVE "forgiveness happens in many forms across many cultures"; MATERIALS lists Each Kindness "and/or" | Only After the Fall is taught; nothing cross-cultural happens. | Objective: "Students hear a story of someone practicing forgiveness and map it to the three panels." Drop "and/or Each Kindness" or add a step for it. | judgment call |
| Lesson 1.1 step 02 five branches vs curriculum Ch. 1 chart "things I love / good at / care about / special / private" | Two different branch lists for the same chart. Lesson, worksheet WS1 and CHARTS array agree; the curriculum page differs. | Fix the curriculum page (see §2). | judgment call |
| U1 crosswalk Ch. 6 anchor "I AM GROWING (K-2) — a seed → sprout → plant diagram" | Lesson 1.6 has no anchor chart (Then-and-Now drawing) and the novel's chart is "I AM A WORK IN PROGRESS". | Either name the chart "I AM A WORK IN PROGRESS" or drop the anchor-chart cell for this row. | judgment call |
| Lessons page, Spanish | `data-es` covers page chrome only (19 strings); all lesson content is English. Same for cards (content untranslated), workbook (0 strings), charts (3 strings). | State once, near the Español button: "Menus in Spanish; lesson text in English." — or leave as is. No wrong Spanish found. | judgment call |

---

## 2. room-12-curriculum.html

### SURE — mechanical

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| Ch. 15 card: "Mia, whose feelings were hurt by something her cousin said" | Wrong character (novel: Priya, sticker-partner game). | "Priya is left without a partner in the sticker game. Nobody meant it. It still hurt — and she learns to say so." | sure |
| Ch. 23 card: "Theo notices that when Jordan does not say hi back, it might not mean Jordan is mad. Maybe Jordan did not hear. Maybe Jordan had a bad morning." | Wrong characters (novel: Sofia and Wyatt). | "Wyatt bumps Sofia on the playground and keeps running. Her fast story is 'Wyatt is mean.' She pauses and thinks of three other reasons. Wyatt did not see her." | sure |
| Ch. 25 card: "Kezia talks about a cousin who is unkind. Ms. Calloway: 'Grace can be quiet…'"; Marker Guide "▸ Ch. 25 · Kezia's cousin and the quiet-grace teaching." | No cousin; quote not in the novel. Ch. 25 is the GRACE WITH LIMITS chart and the private "I do not have to ___. But I can wish them ___" lines. | Card: "The class meets the GRACE WITH LIMITS chart. Each child writes one private line: 'I do not have to ___. But I can wish them ___.'" Marker: "▸ Ch. 25 · The grace-with-limits sentence." | sure |
| Ch. 10 card: "The three parts: name what I did, say I am sorry, make it right." and Anchor chart "REAL SORRY HAS THREE PARTS (K-2) — a finger pointing ('I name it') + a heart ('I am sorry') + a hand fixing ('I make it right')." | Contradicts the novel (Ch. 10 chart: 1. I NAME WHAT I DID. 2. I NAME HOW IT HURT. 3. I NAME WHAT WILL CHANGE), lesson 2.3, the CHARTS array and the workbook. | "The three parts: name what I did, name how it hurt, name what will change." Chart: "a finger pointing ('I name what I did') + a heart ('I name how it hurt') + a hand fixing ('I name what will change')." | sure |
| Ch. 10 card: "Marcus role-plays a real apology with Sammy." | Not in the novel: Sammy teaches the chart; Marcus goes home and apologizes to Aaliyah for the thrown LEGO. | "Marcus hears the chart, realizes his sorry to Aaliyah was missing two and a half parts, and goes home to say all three." | sure |
| Ch. 12 card: "places it in a basket at the door"; Marker Guide "▸ Ch. 12 · When each child walks to the basket at the door." and "The basket will catch it." | Novel: the basket sits on the **windowsill**, and the stones go in during the lesson, not at day's end. | "places it in a basket on the windowsill" / "▸ Ch. 12 · When each child walks to the basket on the windowsill." | sure |
| Ch. 5 card: "Marcus writes the first card on the Mistake Wall: 'I knocked over a friend's block tower. I said sorry…'"; Marker Guide "▸ Ch. 5 · When Marcus writes the first card on the Mistake Wall." | Novel: Ms. Calloway writes the first Oops (the permission slip); Marcus writes the first student card, and his text reads "…block tower in September." | "Marcus writes the first student card on the Mistake Wall: 'I knocked over a friend's block tower in September. I said sorry. We rebuilt it. I walk slower past blocks now.'" / "▸ Ch. 5 · When Marcus writes the first student card…" | sure |
| Ch. 1 Anchor chart trigger: "five branches: things I love / good at / care about / special / private" | Does not match the Identity Web taught in Lesson 1.1, WS1 and the charts page (Things I Love · Things I'm Good At · Things That Make Me Happy · Something Special About My Family · Something People Might Not Know About Me). | "five branches: things I love / good at / make me happy / special about my family / people might not know about me." | sure |
| "Lesson alignment" cells (all 15 named above in §1) | Same title mismatches as the lessons crosswalk. | Use the lesson headings. | sure |
| Ch. 9 "Lesson alignment U2·L2 — The Weight We Carry (K-2)" | Backpack demo is Lesson 2.1. | "U2·L1 — What Is Forgiveness, Really?" | sure |

### Judgment calls

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| Ch. 3 card: "The class learns that mistakes are part of being a person — adults make them, teachers make them, Sammy makes them." | That is Ch. 5's teaching ("Everybody does Oopses… Teachers do them. Sammy does them"). Ch. 3 is Marcus knocking over Jaylen's tower and Oops → Fix It → Try Again. | "Marcus bumps the table and Jaylen's tower falls. Sammy separates 'I broke this' from 'I am clumsy' and teaches the Three Things: Oops, Fix It, Try Again." | judgment call |
| Ch. 6 card: 'The classroom plants seeds and watches them sprout. Sammy: "You are growing the same way. A little bit every day…"' | Quote is not in the novel; the chapter is the I AM A WORK IN PROGRESS chart and the Me-in-September / Me-Now drawing (bean plants are one passing line). | 'Ms. Calloway: "You are not finished. You are a work in progress." The kids draw Me in September and Me Now. Maya looks up.' | judgment call |
| Ch. 22 card: 'Sammy: "…A hug when they pushed." The class makes a Grace List.' | Quote and Grace List are not in the novel; the chapter's chart is "GRACE — Kindness you CHOOSE to give…" and Marcus names Jaylen rebuilding the tower. | 'Sammy: "Grace is chosen kindness — given to somebody who did not earn it." Marcus realizes Jaylen rebuilding the tower was grace.' | judgment call |
| Ch. 27 card: 'Ms. Calloway puts Sammy back in the wooden box. "Sammy will be here next year too. But we have what we needed."' | Not in the novel. Ch. 27 is the future-self letters and Ms. Calloway's ten index cards. | "The kids open their letters from January. Ms. Calloway reads one true thing she saw in each child. Sammy goes back in the box for the summer." | judgment call |
| "Register" line: "The faith overlay, in Divine Mode, is delivered as a single sentence…" followed by "This is the universal edition… with no faith content." | Describes a mode the page says it does not contain. | Drop the Divine Mode sentence from the universal edition. | judgment call |
| Grace in Practice #5: "you said thank you to Mr. Lopez today. He drives our bus" | Novel's bus driver is Patricia (Ch. 24). Harmless as a teacher-cue example, but an easy alignment. | "…thank you to Ms. Patricia today. She drives our bus…" | judgment call |
| Ch. 13 Neuro-affirming prompt: "a 'holding box'… with a lid" | Fine content; note that lessons 2.6 never mentions the holding box, so a teacher reading only the lesson will not have it. | Add one line to lesson 2.6 K box: "Offer a holding box with a lid for a stone a child is not ready to put down." | judgment call |

---

## 3. room-12-cards.html

### SURE — mechanical

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| Unit 4 block `id="u4l2"` "Lesson 2 · Giving the Benefit of the Doubt" | Benefit of the Doubt is Lesson **4.3** (4.2 is Mercy). Breaks the lessons-page link `#u4l3`. | `id="u4l3"`, "Lesson 3" | sure |
| Unit 4 block `id="u4l3"` "Lesson 3 · Small Acts, Big Difference" | Small Acts is Lesson **4.4**. | `id="u4l4"`, "Lesson 4" | sure |
| Unit 4 block `id="u4l4"` "Lesson 4 · Grace With Hard People" | Grace With Hard People is Lesson **4.5**. | `id="u4l5"`, "Lesson 5" | sure |
| Header: "Thirty-four discussion cards for Grades K–2 — two per lesson across four units." and subtitle "Room 12 · Grades K–2 · two cards a lesson" | 34 cards over 17 lessons (U1 10, U2 10, U3 8, U4 6); 28 lessons would need 56. | "Thirty-four discussion cards for Grades K–2 — up to two per lesson across four units." Subtitle: "Room 12 · Grades K–2 · 34 cards". | sure |
| Card 1-E Q3: "What are the three steps Amara could do? Oops → Fix It → Try Again)" | Stray closing parenthesis, no opening one. | "What are the three steps Amara could do? (Oops → Fix It → Try Again)" | sure |
| Card 2-E Q1: "Did Isabella do all three parts of a real sorry? Name what happened, name the hurt, name the change)" | Same stray parenthesis. | "…real sorry? (Name what happened, name the hurt, name the change)" | sure |
| Card 3-G: "spreading a rumour" | British spelling; page uses US ("color-coded"). | "spreading a rumor" | sure |
| Intro: "Cut along the centre line" | British spelling. | "Cut along the center line" | sure |
| "Hide ★★ cards" button | Every card has `data-risk=""`; the button hides nothing. Lesson 3.3 is ★★ (counselor on-site) and its cards 3-E, 3-F are unflagged. | Set `data-risk="★★"` on cards 3-E and 3-F (and show the badge), or remove the button. | sure |

### Judgment calls

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| Card 2-C Q3: "What would you put in Nadia's backpack to help her carry less?" | Inverts the metaphor — stones go **into** the backpack; carrying less means taking out. | "What is one stone Nadia could take OUT of her backpack?" | judgment call |
| Card 4-C: "Sofia texted her friend group… Nobody wrote back." | K–2 children do not have group texts; also names a cohort kid in a scenario the novel does not have. | "Sofia told her friends she could not come to the birthday party. Nobody said anything back. Her first thought was, 'They are mad at me.'" | judgment call |
| Card 3-F: "His counselor encouraged him to forgive them." | Models a counselor pushing forgiveness on a child who is still being left out — the exact thing the Unit 3 standing safety note forbids. | "A grown-up told him he should forgive them." | judgment call |
| Card 4-D Q3: "Practice saying the charitable interpretation out loud." | "Charitable interpretation" is well above K–2. | "Practice saying the kind story out loud." | judgment call |
| Card 1-F: "Sam forgot his part of the class job" | "Sam" reads as Sammy the puppet to a six-year-old. | Rename to "Leo". | judgment call |
| Card 3-B "Two years ago, Marcus's best friend…"; Card 2-J "…class play two years ago" | Two years ago a first-grader was four; long timelines do not land for K–2. | "Last year" in both. | judgment call |
| Card 3-C "During a class presentation"; Card 3-D "left out of a group project" | Middle-school settings. | 3-C: "During share time"; 3-D: "After being left out of a game at recess". | judgment call |
| Card 4-E "Ms. Abuelo" | "Abuelo" is Spanish for grandfather; odd as a surname for Spanish-speaking families. | "Ms. Alvarez" (or "Ms. Calloway", matching lesson 4.4's story of a teacher who learned every name). | judgment call |
| Card 1-J "Lily started crying and said, 'I'm always bad.'" | Lily is Mia's best friend in the novel (Ch. 18); reusing the name for a different child confuses read-alouds. | Rename to "Nora". | judgment call |
| `data-es` on subtitle: "Room 12 · Grades K–2 · two cards a lesson" → "Salón 12 · Grados K–2" | Spanish drops the phrase (moot once the English is fixed). | "Salón 12 · Grados K–2 · 34 tarjetas" | judgment call |

---

## 4. room-12-workbook.html

### SURE — mechanical

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| Every Part A question (37 of 37, all five sections) | The correct answer is **A** every time (`data-ok="1"` is always the first option). A child who notices this stops reading. | Shuffle so keys vary, e.g. Unit 1: B A C A D B A C; Unit 2: A C B A D A B A; Unit 3: C A B D A A B A; Unit 4: A B D A C A B D; Year-End: B A C A D. Move the `data-ok="1"` option accordingly; the "why" text does not change. | sure |
| Unit 2 Q1: "Sammy wore a heavy backpack. What was inside it?" | Ms. Calloway wears the backpack (novel Ch. 9; lesson 2.1 the teacher wears it). Sammy never does. | "Ms. Calloway wore a heavy backpack. What was inside it?" | sure |
| Year-End Q5 explanation: "Sammy asked this on Day 2" | It is Lesson 2 (Week 2), not Day 2. | "Sammy asked this in Lesson 2" | sure |
| Unit 4 Q8 and its explanation: "the letter we wrote to future-me in December" / "In December you sealed a letter to the May you." | Matches the lessons, not the novel (January → June). Same discrepancy as lessons 2.7/4.7; fix wherever that is settled. | If aligning to the novel: "the letter we wrote to future-me in January" / "In January you sealed a letter to the June you." | judgment call (depends on §1) |

### Judgment calls

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| Unit 2 Q2 "Forgiveness is NOT —" | Negative-stem multiple choice is hard for K–2; three of the four options are true statements about forgiveness. | "Which one is a forgiveness MYTH?" with option A "Forgiving means forgetting." | judgment call |
| Unit 3 Q3 option A "inside me, for my own peace — between people, and must be earned" | Two-blank fill with a dash is above K–2 reading; the other options are equally abstract. | "Forgiveness is for ME. Trust must be ______." A "earned" B "forgotten" C "given to everybody" D "the same as forgiveness". | judgment call |
| Unit 3 Part B 3: "Draw the Forgiveness Path with six stations." | Lesson 3.4 K box uses three stations. | "Draw the Forgiveness Path. Use three stations or six." | judgment call |
| Unit 1 Q7 "'I forgot my homework' is an ______. 'I am stupid' is ______." | Puts "I am stupid" in front of every child as a fill-in; acceptable as a sorting example but heavier than the lesson's own K wording. | "'I forgot my homework' is an ______. 'I am bad' is ______." | judgment call |
| Unit 4 Q2 explanation: "Grace is wise sometimes — and not wise other times. Both are true." | Two ideas in one line; the question is about doormat vs grace. | "A doormat has no choice. Grace is a choice. That is the difference." | judgment call |

---

## 5. Worksheets w12-1 … w12-4

All four reference the right lesson (WS1 U1·L1, WS2 U1·L6, WS3 U2·L2, WS4 U2·L4 ★ PPRA), match the lessons page's worksheet list, and carry the privacy note. No typos found.

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| w12-3 "Body words from the lesson": Tight · Busy · Heavy · Drooping · Hot · Wobbly | "Wobbly" is not in Lesson 2.2 (the lesson says "jumpy"). | Replace "Wobbly" with "Jumpy". | judgment call |
| w12-2 Sammy quote drops "I am still learning others." from the lesson's line | Harmless, but the "I am still learning ___" blank below leans on it. | 'Sammy says: "…Now I can do some of them! I am still learning others. That is what GROWING is."' | judgment call |
| w12-4 grown-ups note: "Grown-ups can also call or text 988…" | Good — keeps the crisis line adult-facing on a K–2 sheet. No change. | — | — |

---

## 6. AoG-Anchor-Charts-12.html (CHARTS / WALLS)

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| `id:"voices"` formLabel: "★ PPRA lesson · two inside voices" | Lesson 1.4 is not PPRA (only 2.4 and 2.5 are). | "Two inside voices — sort the statements" | sure |
| `id:"panels"` formLabel: "★ PPRA lesson · three panels, three truths" | Lesson 3.5 is "★ ELEVATED · Counselor On-Site", not PPRA. | "★ Elevated risk — counselor on-site · three panels, three truths" | sure |
| `WALLS[3]` (wall4) say: "★ Counselor present." | Lesson 4.7 says counselor **on standby**, not present. | "★ Counselor on standby." | sure |
| No chart objects for Lessons 2.2 (MY BACKPACK / body map), 2.5 (PUTTING DOWN STONES), 3.1 (Words for Real Hurt), 3.2 (Why People Hurt People), 4.4, 4.5, 4.6 | Curriculum crosswalk names charts for Ch. 9, 12, 25 that the live board cannot build; lessons 3.1/3.2 build charts on paper with no board. Consistent with the lessons page (those lessons show no "Build this chart" link), so not an error — but the curriculum page promises them. | Either add `lines`-form charts for 3.1 ("Words for Real Hurt") and 4.5 ("Grace With Limits: You CAN / You DO NOT HAVE TO", straight from novel Ch. 25), or soften the curriculum's "Anchor chart trigger" cells for Ch. 9/12/25 to "(paper chart — see lesson)". | judgment call |
| `WALLS[1]` (wall2) say: "letter to the May me … Do Not Open Until May" | Same December/May vs January/June question as §1. | Follow whatever is decided for lesson 2.7. | judgment call |

---

## 7. novels/room-12.json (The Year We Met Sammy)

Novel text is curriculum content; edits below are factual-consistency fixes only, not plain-words rewrites.

| Location | Issue | Proposed edit | Confidence |
|---|---|---|---|
| Ch. 13 (section 15): "He had said it on the day before kindergarten started for Aaliyah… Aaliyah had been three years old." and Ch. 13 later "I am sorry I was mean to you before you started kindergarten." | Aaliyah is three all year (Ch. 1, Ch. 10, Ch. 13, Ch. 27). Three-year-olds start preschool, not kindergarten. | "the day before preschool started for Aaliyah" / "before you started preschool". | sure |
| Ch. 14 (section 16): letters written "At the end of January"; Maya signs "— November Maya"; Ch. 27 (section 31): "in January, when you wrote letters" and "read what November-Maya had written" | Internal contradiction: written in January, signed November. | Either "At the end of November" in Ch. 14 (and "since November" / "in November, when you wrote letters" in Ch. 27), or change both signatures to "— January Maya". The November option also fits Ch. 12 ("stones… given each child in November") and the lessons' December letter. | sure |
| Ch. 24 (section 28): "Vincent — a kid in Room 12 who we have not talked about, because Vincent is one of the quieter kids" | Room 12 has exactly ten named kids (stated repeatedly: "Ten kids. Ten different grace acts" in the same chapter). Vincent cannot be in Room 12. | "Vincent — a kid in the other first-grade class who we have not talked about…" | sure |
| Ch. 22 (section 26): "He had never, until this moment, recognized what Jaylen had done as anything other than the way kindergarten worked." | The tower was in September of first grade (Ch. 3). | "…anything other than the way things worked." | sure |
| Ch. 15 (section 18): "The other red stickers were Jordan and a kid we have not really talked about yet named Theo." | Theo has already been introduced and characterized (Ch. 1, Ch. 7, Ch. 9 "Theo, who is a careful and observant child", Ch. 12). | "The other red stickers were Jordan and Theo." | sure |
| Ch. 23 (section 27): "bumps into you, doesn't text back… Their phone was off." | Sammy addressing first-graders about texting/phones; grade fit. | "bumps into you, doesn't say hi, looks at you funny, leaves you out" and drop "Their phone was off." | judgment call |
| Ch. 27 (section 31): "You came in throwing LEGOs" (Marcus's card) | The LEGO was thrown in November, not at the start of the year. | "You came in knocking over block towers and you are leaving as a brother who knows how to say a real sorry." | judgment call |
| Ch. 1 (section 2): "in a room with a teacher and a frog puppet and nine other children" | Correct (ten kids). No change — noted because the cards/curriculum use "ten kids" and this line is easy to misread. | — | — |

Safety read of the novel: Ch. 13 (Marcus/Aaliyah) and Ch. 17 (Kezia and the excluded grown-up) both have the counselor physically in the room, name "Safe comes first. Always." and never push the child toward reconciliation; matches the ★★ flags. Ch. 16 (Biscuit dies) is unflagged and handled gently — acceptable. No deficit labels toward the children in the narration.

---

## 8. Cross-file summary of the fact conflicts (one line each)

1. Ch. 15 character: novel Priya → curriculum + lessons say Mia/cousin. Fix curriculum + lessons.
2. Ch. 23 characters: novel Sofia/Wyatt → curriculum + lessons say Theo/Jordan. Fix curriculum + lessons.
3. Ch. 25: no cousin in the novel → curriculum card + marker guide + lessons crosswalk. Fix all three.
4. Real Sorry three parts: novel/lessons/charts/workbook = did · hurt · change → curriculum says did · sorry · make it right. Fix curriculum.
5. Basket location: novel windowsill → curriculum "at the door" (twice). Fix curriculum.
6. Backpack wearer: Ms. Calloway → workbook U2 Q1 says Sammy. Fix workbook.
7. Future-self letters: novel January→June; lessons/workbook/charts December→May; novel also self-contradicts (November signature). Decide one, fix the rest.
8. Unit 4 card lesson numbers off by one (4.2/4.3/4.4 should be 4.3/4.4/4.5) → breaks lesson-page links.
9. Crosswalk lesson titles (15 rows) do not match the lesson headings.
10. Workbook answer is always A.
