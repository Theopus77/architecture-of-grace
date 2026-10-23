# Edits from the `standards` agent (AOG-R36-V1, 2026-10-23)

Owner of the target: the `lessons` agent (`aog-deploy/room-36-lessons.html`). Every **Old** block is copied byte for byte from the file as it stands today and occurs exactly once (checked by applying all edits, in order, to a copy). Apply them in the order given. The page is hand-edited (no generator under `_work` writes it).

## What this does

Two grade 6–8 Illinois SEL benchmarks were never cited by any Room 36 lesson: **1B.3b** and **3A.3b**. Each now gets a short, calm activity inside an existing Unit 1 lesson, plus the alignment-box line:

- **U1·L4, Peer Pressure & The Volume of Integrity** · new Step 5, *Who Helps Me — My Support Map* (10 min) → 1B.3b. It grows out of the One-Ally Strategy (Step 4).
- **U1·L6, The Agency of Choice** · new Step 4, *Rules and Their Reasons* (10 min) → 3A.3b. A rule is the clearest middle-ring example (you cannot control it, you can influence it).

Both keep the privacy rule: the map and the journal line stay with the student and are never collected. Crisis lines are written exactly as the brief gives them.

### The benchmark wording

- 1B.3b — "Analyze how making use of school and community supports and opportunities can contribute to school and life success."
- 3A.3b — "Analyze the reasons for school and societal rules."

**For Jimmy:** the brief says this wording is quoted elsewhere on the site. It is not. I searched every HTML, JS, JSON, Python and Markdown file and the text of every PDF in the repo. Neither code appears; the site quotes only the a-benchmarks (and some b-benchmarks for other grades). The wording above is ISBE's published text for the grade 6–8 (Middle/Junior High) stage. A web search matched 1B.3b word for word (the Grades 6–8 listing on commonplanner.com) and matched 3A.3b in substance ("analyzing the reasons for school and societal rules", ISBE's Goal 3 document). This sandbox cannot reach isbe.net, so please check both lines against the ISBE chart before this goes to a reviewer. The same search reports that **ISBE published revised SEL standards dated July 2026, for 2026–27, with new numbering** (e.g. 1A.3.1). Every benchmark code on the site uses the older scheme (1A.3a). That is bigger than Room 36, and someone should look at it before a state review.

### Time

Each lesson grows from 40 to 40–50 minutes. Each new step says: "In a 40-minute period, teach Step N as the opening of the next class." The 25- and 40-minute paths in `sel-paths/room-36.json` total exactly 25 and 40 (`_work/sel/paths/validate.py`), so they need the change below. I do not own that file; its owner (or the lead) should apply it after the lessons page changes, then re-run `python3 _work/sel/paths/inventory.py` and `python3 _work/sel/paths/validate.py`.

```json
"u1l4": { "p25": { "steps": {"01": 4, "02": 6, "03": 8, "04": 4}, "cards": 0, "exit": 3,
                   "note": "Trim each step and skip the extra card round; the one-ally strategy stays. Open the next class with the support map." },
          "p40": { "steps": {"01": 6, "02": 7, "03": 10, "04": 4, "05": 9}, "cards": 0, "exit": 4,
                   "note": "Full lesson. The second card runs inside the analysis step, and the support map closes the period." } },
"u1l6": { "p25": { "steps": {"01": 5, "02": 15}, "cards": 0, "exit": 5,
                   "note": "Frankl principle and the full Choice-Agency Map; the key insight lands in the exit ticket. Rules and their reasons opens the next class." },
          "p40": { "steps": {"01": 5, "02": 15, "03": 8, "04": 8}, "cards": 0, "exit": 4,
                   "note": "Frankl, the full map, a shorter discussion, then rules and their reasons." } }
```

(The u1l6 p25 note is 23 words; the validator allows 26.)

### Also affected (no edit needed from you)

- `standards.html` (mine) already shows 1B.3b on U1·L4 and 3A.3b on U1·L6, and lists both in the benchmark index. If these edits are **not** applied, tell the lead: those two cells and index rows must come out again, and the count goes back from 79 to 77.
- `xw-illinois-sel.html` (mine) names U1·L4's support map under 1B and U1·L6's rules step under 3A. Same caveat.

---

## The edits (file: `aog-deploy/room-36-lessons.html`)

### 1. U1·L4 · time line

Why: The new Step 5 adds 10 minutes.

**Old**

````html
<div class="meta">40 min  ·  September Week 4</div>
````

**New**

````html
<div class="meta">40–50 min  ·  September Week 4</div>
````

### 2. U1·L4 · objective

Why: Names what the new step teaches.

**Old**

````html
<p>Students identify at least two mechanisms by which peer pressure operates and articulate one strategy for maintaining integrity when social pressure is high.</p>
````

**New**

````html
<p>Students identify at least two mechanisms by which peer pressure operates and articulate one strategy for maintaining integrity when social pressure is high. They also map the people and places at school and in the community who can help them.</p>
````

### 3. U1·L4 · alignment box (adds 1B.3b)

Why: The support map teaches 1B.3b; no grade 6–8 lesson cited it before.

**Old**

````html
<p>3B.3b  Evaluate strategies for resisting pressures to engage in unsafe or unethical activities.</p><p>Aligned to the Illinois Social/Emotional Learning Standards (ISBE).</p></div>
<div class="box chart"><div class="blab">ANCHOR CHART  ·  SIGNAL VS. NOISE
````

**New**

````html
<p>3B.3b  Evaluate strategies for resisting pressures to engage in unsafe or unethical activities.</p><p>Goal 1 — Self-Awareness &amp; Self-Management</p><p>1B.3b  Analyze how making use of school and community supports and opportunities can contribute to school and life success.</p><p>Aligned to the Illinois Social/Emotional Learning Standards (ISBE).</p></div>
<div class="box chart"><div class="blab">ANCHOR CHART  ·  SIGNAL VS. NOISE
````

### 4. U1·L4 · step count

Why: Five steps now.

**Old**

````html
<p>Scripted teaching sequence  ·  Steps 1 — 4  ·  read aloud or in your own words</p></div>
<div class="step"><span class="sn">01</span><span class="st">The Volume Metaphor</span>
````

**New**

````html
<p>Scripted teaching sequence  ·  Steps 1 — 5  ·  read aloud or in your own words</p></div>
<div class="step"><span class="sn">01</span><span class="st">The Volume Metaphor</span>
````

### 5. U1·L4 · new Step 5, Who Helps Me (8–12 min)

Why: The activity for 1B.3b. It grows out of the One-Ally Strategy and gives the student the scan box worries about (no ally) a map with roles and places on it.

**Old**

````html
<p>Students write a name or descriptor privately — not to share. Also distribute and introduce the Values Under Pressure worksheet as a private journal entry.</p>
````

**New**

````html
<p>Students write a name or descriptor privately — not to share. Also distribute and introduce the Values Under Pressure worksheet as a private journal entry.</p>
<div class="step"><span class="sn">05</span><span class="st">Who Helps Me — My Support Map</span><span class="sm">10 MIN</span></div>
<p class="script">"One ally helps in the moment. A support map helps all year. Write your name in the middle of a page. Draw two rings around it."</p>
<p class="strongp">INNER RING · AT SCHOOL: people I could go to — a teacher, the counselor, a coach, the nurse, the librarian, the front office. OUTER RING · OUTSIDE SCHOOL: an adult at home or in my family, a neighbor, a coach or club leader, a youth or faith group, the public library. Then star one place I could grow this year: a club, a team, a program, a way to help.</p>
<p class="script">"Pick one person or place on your map. Write one sentence: how could it help you keep your values, or do well in school this year?" Students write 3 min. Pair share optional — share the idea, not the names.</p>
<p>Before class, write your school's real supports on the board: the counselor's name and where to find them, the clubs and teams that meet this term, the nurse, the library. Students build from a real list, not a guess. Along the bottom of the board: 988 Suicide &amp; Crisis Lifeline (call or text 988) · Crisis Text Line: text HOME to 741741.</p>
<p>A student who could not name an ally in Step 4 can still fill the map: a role or a place counts. The map stays with the student. Never collected. In a 40-minute period, teach Step 5 as the opening of the next class.</p>
<div class="box scan"><div class="blab">IN-LESSON SCAN</div><p>OBSERVE  A student who leaves the outer ring empty, or writes that no adult feels safe to go to.</p><p>MAY SIGNAL  This student may not have a trusted adult outside school yet — or may be telling you something about home.</p><p>ACTION  Do not ask in front of others. Check in privately today: "I'd like to help you add one name." Tell the counselor the same day. If a student tells you they are being hurt, follow the disclosure steps on <a href="/room-36-safety">/room-36-safety</a>.</p></div>
````

### 6. U1·L4 · note home

Why: Tells families about the map without asking them to see it.

**Old**

````html
<p>Today students studied how peer pressure works — and what to do about it. At home, you can open this conversation by sharing a time you faced peer pressure as an adult or young person. What did you do? What do you wish you had done?</p>
````

**New**

````html
<p>Today students studied how peer pressure works — and what to do about it. At home, you can open this conversation by sharing a time you faced peer pressure as an adult or young person. What did you do? What do you wish you had done?</p>
<p>Your child also made a private map of the people and places that help them. If they want to share it, ask: "Who is one adult at school you could go to?"</p>
````

### 7. U1·L6 · time line

Why: The new Step 4 adds 10 minutes.

**Old**

````html
<div class="meta">40 min  ·  October Week 2</div>
````

**New**

````html
<div class="meta">40–50 min  ·  October Week 2</div>
````

### 8. U1·L6 · objective

Why: Names what the new step teaches.

**Old**

````html
<p>Students complete a choice-agency map and articulate at least one situation in their current life where they have more agency over their response than they currently believe.</p>
````

**New**

````html
<p>Students complete a choice-agency map and articulate at least one situation in their current life where they have more agency over their response than they currently believe. They also analyze the reason behind a school rule and a community rule.</p>
````

### 9. U1·L6 · alignment box (adds 3A.3b)

Why: Rules and Their Reasons teaches 3A.3b; no grade 6–8 lesson cited it before. It sits under the Goal 3 line already in the box.

**Old**

````html
<p>3B.3a  Analyze how decision-making skills improve study habits and academic performance.</p><p>Aligned to the Illinois Social/Emotional Learning Standards (ISBE).</p></div>
````

**New**

````html
<p>3B.3a  Analyze how decision-making skills improve study habits and academic performance.</p><p>3A.3b  Analyze the reasons for school and societal rules.</p><p>Aligned to the Illinois Social/Emotional Learning Standards (ISBE).</p></div>
````

### 10. U1·L6 · step count

Why: Four steps now.

**Old**

````html
<p>Scripted teaching sequence  ·  Steps 1 — 3  ·  read aloud or in your own words</p></div>
<div class="step"><span class="sn">01</span><span class="st">The Frankl Principle</span>
````

**New**

````html
<p>Scripted teaching sequence  ·  Steps 1 — 4  ·  read aloud or in your own words</p></div>
<div class="step"><span class="sn">01</span><span class="st">The Frankl Principle</span>
````

### 11. U1·L6 · new Step 4, Rules and Their Reasons (8–12 min)

Why: The activity for 3A.3b. A rule is the clearest middle-ring example (you cannot control it, you can influence it). The words are the site's own: the reason test (AOG_EF_RULES.test) and the three steps of the efrule checklist (pause, find the reason, speak up the strong way).

**Old**

````html
<p>ACTION  Note privately for counselor follow-up. Do not correct in class — the framing requires careful individual work, not whole-class instruction.</p></div>
````

**New**

````html
<p>ACTION  Note privately for counselor follow-up. Do not correct in class — the framing requires careful individual work, not whole-class instruction.</p></div>
<div class="step"><span class="sn">04</span><span class="st">Rules and Their Reasons</span><span class="sm">10 MIN</span></div>
<p class="script">"Rules are a good test of the middle ring. You did not make most of the rules you live by. You can still understand them — and you can influence them."</p>
<p class="strongp">Write two rules on the board: one school rule (phones away during work time) and one community rule (slow down in a school zone). For each, ask: "What is it for?" A good rule is for one of four things: SAFETY · LEARNING · FAIRNESS · KINDNESS.</p>
<p class="script">"Here is a test for any rule. Can you say its reason in one sentence? Is the reason safety, learning, fairness or kindness — not 'because I said so'? Does it say what to do?"</p>
<p class="script">"Now pick one rule — at school or in the community — that does not make sense to you yet. Write the rule, the reason you guess, and one question you could ask about it." Students write 3 min in the journal. Pair share optional.</p>
<p class="script">"When a rule feels unfair, three things help. Pause. Find the reason. Speak up the strong way — at a calm time, not in front of everyone. Some rules really are unfair, and people have changed rules by speaking up this way. The rule may sit in the middle ring. Your response lives in the inner circle."</p>
<p>Be ready to give the reason for each of your own class rules in one sentence. If one fails the test, say so, and say when the class will look at it again. Pushback is a need for fairness and a say; treat it that way, never as defiance. A student's own copy: When a rule feels unfair (<a href="/slip.html?s=efrule">/slip.html?s=efrule</a>); grades 7–8 can pitch a change (<a href="/slip.html?s=efpitch">/slip.html?s=efpitch</a>). For adults: <a href="/ef#rules">/ef#rules</a>. The journal is never collected. In a 40-minute period, teach Step 4 as the opening of the next class.</p>
````

### 12. U1·L6 · note home

Why: One question families can ask.

**Old**

````html
<p>Today students learned about the space between what happens and how we respond — and that space is where our agency lives. At home, you can use the language: "You can't control that. What can you control?"</p>
````

**New**

````html
<p>Today students learned about the space between what happens and how we respond — and that space is where our agency lives. At home, you can use the language: "You can't control that. What can you control?"</p>
<p>They also looked at why rules exist. You might ask: "What is one rule that makes sense to you? What is it for?"</p>
````

---

## For the families page: every grade 6–8 Illinois SEL benchmark and the lessons that teach it (after these edits)

All 20 benchmarks for the Middle/Junior High stage are now taught at least once. The lesson codes are the alignment boxes in `room-36-lessons.html`; links take the form `/room-36-lessons.html?l=u1l4`.

| Benchmark | Illinois wording | Lessons that teach it |
|---|---|---|
| 1A.3a | Analyze factors that create stress or that motivate successful performance. | U1·L1, U1·L2, U1·L5, U2·L1, U2·L2, U2·L3, U2·L5, U2·L6 |
| 1A.3b | Apply strategies to manage stress and to motivate successful performance. | U1·L6, U2·L1, U2·L3, U2·L4, U3·L6, U4·L3 |
| 1B.3a | Analyze how personal qualities influence choices and successes. | U1·L1, U1·L3, U1·L5, U2·L5, U2·L6 |
| 1B.3b | Analyze how making use of school and community supports and opportunities can contribute to school and life success. | U1·L4 (new Step 5, Who Helps Me) |
| 1C.3a | Set a short-term goal and make a plan for achieving it. | U1·L7, U2·L7 |
| 1C.3b | Analyze why one achieved or did not achieve a goal. | U1·L7, U2·L7 |
| 2A.3a | Predict others’ feelings and perspectives in a variety of situations. | U2·L2, U3·L1, U3·L2, U3·L3, U4·L1, U4·L2, U4·L3 |
| 2A.3b | Analyze how one’s behavior may affect others. | U3·L1, U3·L2, U3·L4 |
| 2B.3a | Explain how individual, social, and cultural differences may increase vulnerability to bullying and identify ways to address it. | U3·L5 |
| 2B.3b | Analyze the effects of taking action to oppose bullying based on individual and group differences. | U3·L5 |
| 2C.3a | Analyze ways to establish positive relationships with others. | U3·L7, U4·L4 |
| 2C.3b | Demonstrate cooperation and teamwork to promote group effectiveness. | U4·L7 |
| 2D.3a | Evaluate strategies for preventing and resolving interpersonal problems. | U3·L3, U3·L6, U3·L7, U4·L5 |
| 2D.3b | Define unhealthy peer pressure and evaluate strategies for resisting it. | U1·L4 |
| 3A.3a | Evaluate how honesty, respect, fairness, and compassion enable one to take the needs of others into account when making decisions. | U1·L2, U2·L4, U4·L1, U4·L2, U4·L5 |
| 3A.3b | Analyze the reasons for school and societal rules. | U1·L6 (new Step 4, Rules and Their Reasons) |
| 3B.3a | Analyze how decision-making skills improve study habits and academic performance. | U1·L6 |
| 3B.3b | Evaluate strategies for resisting pressures to engage in unsafe or unethical activities. | U1·L3, U1·L4, U3·L4 |
| 3C.3a | Evaluate one’s participation in efforts to address an identified school need. | U4·L4, U4·L6, U4·L7 |
| 3C.3b | Evaluate one’s participation in efforts to address an identified need in one’s local community. | U4·L6 |

### Lesson titles (for the grid)

| Lesson | Title |
|---|---|
| U1·L1 | The Mask vs. The Mirror |
| U1·L2 | The Anatomy of a Mistake |
| U1·L3 | The Digital Backpack |
| U1·L4 | Peer Pressure & The Volume of Integrity |
| U1·L5 | Owning Your Narrative |
| U1·L6 | The Agency of Choice |
| U1·L7 | Unit 1 Wrap-Up & Bridge to Unit 2 |
| U2·L1 | The Internal Critic |
| U2·L2 | Highlight Reels & The Comparison Trap |
| U2·L3 | Perfectionism — The Critic in Disguise |
| U2·L4 | Accountability Without Self-Punishment |
| U2·L5 | The Friend Test |
| U2·L6 | Rewriting the Script |
| U2·L7 | Unit 2 Reflection & Bridge to Unit 3 |
| U3·L1 | Impact vs. Intent |
| U3·L2 | Three Sides of Every Story |
| U3·L3 | Forgiveness vs. Reconciliation |
| U3·L4 | The Digital Echo |
| U3·L5 | The Rumor & Narrative Hijack |
| U3·L6 | The Agency of Release — Letter of Release |
| U3·L7 | Limits from Self-Respect + Unit 3 Wrap-Up & Bridge to Unit 4 |
| U4·L1 | What Is Grace? |
| U4·L2 | What Does Mercy Look Like? |
| U4·L3 | Giving the Benefit of the Doubt |
| U4·L4 | Small Acts, Big Difference — The Grace Challenge |
| U4·L5 | Grace With Hard People |
| U4·L6 | Grace Audit — Final Project |
| U4·L7 | Community Charter & Year-End Celebration |

Goal headings as the lessons print them: Goal 1 — Self-Awareness & Self-Management · Goal 2 — Social Awareness & Interpersonal Skills · Goal 3 — Responsible Decision-Making.
