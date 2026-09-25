# Writing one unit of "Family & Consumer Sciences, K–12" — Architecture of Grace

You are writing the content for ONE unit of a free online Family & Consumer Sciences (FACS) course built
by a special-education teacher in Illinois. Many readers are students with IEPs, English learners, or
reading below grade level. Content goes into JSON files that a build script turns into web pages.
Everything you write is ORIGINAL.

Your unit's chapters, strands, topics and chapter story hooks are in `outline.py` (the `UNITS` list;
find your unit by `n`). Its `band` tells you which LEVEL rules below apply. Follow the FCS progression the
outline lays out (food and nutrition, kitchen and textile skills, consumer skills, child development,
independent living); do not copy any textbook's wording, feature names or titles. Invent your own section
and lesson titles (short, 2–6 words, clear, not cute).

## Voice, across every level
- Hands first, then the rule. Start every lesson from a situation a student can picture (a pan on the
  stove, a torn seam, two cereal boxes on a shelf, a first paycheck), walk through what to do step by
  step, then state the principle. Explain every technical word the first time. Active voice. No filler,
  no "In this lesson we will".
- Show the steps. A reading that teaches a skill WALKS THROUGH it in order with the real numbers and
  tools ("set the oven to 350 °F; spoon the flour into the dry cup and level it with the back of a knife").
  Name common mistakes and what goes wrong because of them.
- Safety is never optional and never vague: temperatures, times and rules are the STANDARD ones (USDA /
  FDA food-safety figures, the twenty-second hand wash, "back to sleep"). A lesson never tells a child to
  use a stove, a knife or an iron without a grown-up at K–5.
- `words` are the technical terms: {"w": "cross-contamination", "d": "…"}; at K–2 they are simple
  (germ, mitt, plate).
- Plain text only: °F, ¼ and 1/4 both fine, $4.50, 2 tsp. No HTML, no markdown except: in `reading`
  paragraphs you MAY mark a key word with *asterisks* the first time it appears (only words that are also
  in that lesson's `words`, spelled the same).
- Respectful of every family: families differ in size, income, food, faith and who does the cooking.
  No food is "bad"; bodies are not judged. Connect to Illinois and Chicago and the site's own rooms only
  with facts you are sure of. American spelling.
- Questions test the skill: the right step, the right tool, the safe temperature, the better unit price,
  what went wrong in a described situation. Wrong choices come from real mistakes (water on a grease
  fire, thawing on the counter, a heaping cup of flour).

## LEVEL rules (from your unit's band)
| level | band  | reading paragraphs | chars per paragraph | avg sentence | words per lesson | choices per question |
|-------|-------|--------------------|---------------------|--------------|------------------|----------------------|
| k2    | K–2   | 2–3                | 80–260              | ≤ 9 words    | 1–3              | 3                    |
| 35    | 3–5   | 3                  | 150–500             | ≤ 13 words   | 2–4              | 4                    |
| 68    | 6–8   | 3–4                | 180–800             | ≤ 17 words   | 2–5              | 4                    |
| hs    | 9–10  | 3–4                | 250–900             | ≤ 20 words   | 3–5              | 4                    |
| hs2   | 11–12 | 3–4                | 250–900             | ≤ 22 words   | 3–6              | 4                    |
- K–2 also: story paragraphs 120–400 chars (3–4 of them); intro paragraphs 120–400; mainIdea ≤ 120 chars;
  the `look` is almost always `think` (a picture in words:
  "Look at the red apple on the table…") or `data` with 3–4 simple rows.
- 3–5 also: story paragraphs 150–600; intro 150–600.
- 6–8, 9–10, 11–12: story paragraphs 200–900; intro 200–900.
- Chapters: 3–4 sections; 2–4 lessons per section. Aim: K–2 → 6–8 lessons per chapter; 3–5 → 9–11;
  6–8 and up → 10–12.
- Reviews: K–2 → 6 questions per chapter, unit test 10, wrap words 8. All other levels → 8 per chapter,
  test 15, wrap words 12.

## Accuracy — the most important rule
- EVERY safety fact must be the standard one. Use these and no others: danger zone 40–140 °F; the
  two-hour rule (one hour above 90 °F); safe minimum internal temperatures — poultry 165 °F, ground meats
  160 °F, whole cuts of beef, pork, lamb and veal 145 °F with a 3-minute rest, fish 145 °F, leftovers
  reheated to 165 °F, eggs cooked until firm; refrigerator at or below 40 °F, freezer 0 °F; wash hands
  20 seconds; grease fire — smother with a lid or baking soda, never water; safe sleep — on the back, on a
  firm flat surface, nothing else in the crib. If a figure is not in this list and you are not sure of it,
  leave it out.
- Kitchen equivalents: 3 tsp = 1 Tbsp; 4 Tbsp = ¼ cup; 16 Tbsp = 1 cup; 2 cups = 1 pint; 2 pints =
  1 quart; 4 quarts = 1 gallon; 8 fl oz = 1 cup; 16 oz = 1 lb. Every scaled recipe must be arithmetically
  right — compute it twice.
- Money: every price, wage, rate, rent and budget is a labeled example ("example"), and the arithmetic in
  it is right. Tax and withholding are described in general terms (federal and state income tax, Social
  Security and Medicare) with no rates unless you are certain. Interest examples use simple round numbers.
- Nutrition: the six nutrient classes, MyPlate's five groups, the Nutrition Facts label as it exists now
  (serving size, calories, % Daily Value, added sugars line). No diet advice beyond balance and variety;
  no calorie targets for children.
- Child development: milestones as RANGES ("many children walk between about 9 and 15 months"), never as
  deadlines; every child develops differently.
- `source` looks (`"paraphrase": false`) must be public domain (before 1929, or U.S. federal government
  text) AND exact; otherwise set `"paraphrase": true`. Good sources here: a line from an old cookbook or
  household manual (Fannie Farmer 1896, the Boston Cooking-School), a USDA or FDA sentence, a proverb.
  Zero sources in a chapter is fine.
- `data` looks: real standard figures (safe temperatures, equivalents, care-label meanings, car-seat
  stages) or example figures plainly labeled (a cost sheet, a unit-price comparison, a weekly budget).
- `think` looks are the workhorse: a kitchen scene to diagnose, a step list to order, a label to read.

## Files you write
1. `ch<N>.json` — one file per chapter of your unit (N = chapter number from outline.py). Write each with
   the Write tool as soon as it is done.
2. `u<n>_head.json` — the unit's intro, big question, timeline and wrap-up (no chapters).
3. Then run: `cd <folder> && python3 assemble.py <n>` — it builds `u<n>.json` and validates it for your
   level. Fix every problem it reports (edit the chapter files, re-run) until it prints OK.

### ch<N>.json
```
{
 "n": 24, "title": "Clean, Separate, Cook, Chill", "years": "Food Safety",     // "years" = the strand label
 "bigQuestion": "One open question the whole chapter helps answer (ends with ?)",
 "story": {                              // a narrative opener — a real-feeling situation in a kitchen, a home, a store or a classroom
   "title": "…", "kicker": "one-sentence teaser",
   "paragraphs": ["…", "…", "…", "…"],   // count and length per LEVEL rules
   "think": "one question for students to discuss after the story"
 },
 "sections": [
   {"title": "…", "lessons": [
     {
      "title": "…",
      "mainIdea": "One sentence: the single thing to remember.",
      "reading": ["p1", "p2", "p3"],       // teach the skill step by step with real numbers and tools
      "words": [{"w": "danger zone", "d": "40 to 140 °F, the range where bacteria grow fastest"}],
      "look": { … see below … },
      "check": [ {"q": "…", "choices": ["…","…","…","…"], "a": 2, "why": "why the answer is right, with the reason"} ]  // exactly 3
     }
   ]}
 ],
 "review": [ 6 or 8 multiple-choice questions on the whole chapter, same shape as check ]
}
```
`look` is one of:
- `{"type":"think","title":"…","text":"a kitchen or household scene to diagnose, a step list, a scenario or a picture in words (60–600 chars)","prompt":"a question that asks the student to try it"}` — the workhorse for FACS
- `{"type":"data","title":"…","rows":[["poultry",165],["ground beef",160],["fish",145]],"unit":"°F","cite":"…","prompt":"a question about the numbers"}` (3–8 rows; numbers only in the second slot)
- `{"type":"source","title":"…","text":"the quote or paraphrase","cite":"who, what, year","paraphrase":false,"prompt":"a question about it"}`
Mix across a chapter: mostly think, 2–4 data, sources only where a real one fits.

Questions: one clearly right answer; wrong choices from specific mistakes. Mix steps, tools, safe
figures, reasoning (why, what would happen if) and reading a label, a table or a described scene. No "all of the above", no
trick wording. Spread the right answer evenly over the positions (the validator checks ~equal shares).
`why` names the rule or the figure in one or two sentences.

### u<n>_head.json
```
{
 "intro": ["2–3 paragraphs that open the unit: the situations, why it matters, what you will be able to do"],
 "bigQuestion": "the unit's essential question",
 "timeline": [ {"y": "1896", "t": "Fannie Farmer standardizes level measurements in her cookbook"} ],   // 8–12 moments, in order:
     // how people learned this — the history of the skill, tool or rule (years), OR for K–2 a sequence students live through
     // ("Monday" … "Friday" / "Step 1" … "Step 8"). Keep `y` under 12 characters.
 "wrap": {
   "words": [ 8 (K–2) or 12 key terms across the unit, {"w","d"} ],
   "test": [ 10 (K–2) or 15 multiple-choice questions across the whole unit ],
   "write": {"prompt": "a plan-and-explain task: write the steps for a job, a safety plan, a cost sheet or a menu, and explain why each step is there",
             "tips": ["3–5 short tips: e.g. put the steps in order, name the tool for each step, say the safety rule, check the numbers"]}
 }
}
```

When done, reply with ONLY: the validator's OK line, and a list of any facts you were unsure about and left
out or softened (one line each), and any quote you set to paraphrase.
