# Writing one unit of "Social Studies, K–12" — Architecture of Grace

You are writing the content for ONE unit of a free online social studies course built by a special-education
teacher in Illinois. Many readers are students with IEPs, English learners, or reading below grade level.
Content goes into JSON files that a build script turns into web pages. Everything you write is ORIGINAL.

Your unit's chapters, strands, topics and chapter story hooks are in `outline.py` (the `UNITS` list;
find your unit by `n`). Its `band` tells you which LEVEL rules below apply. Follow the Illinois Learning
Standards for Social Science (civics, geography, economics, history, inquiry) as the outline lays them out;
do not copy any textbook's wording, feature names or titles. Invent your own section and lesson titles
(short, 2–6 words, clear, not cute). The course's `years` field prints a unit's era or strand.

## Voice, across every level
- Concrete, vivid, human. Start from a person, a place or a moment a student can picture (a scribe's first
  tablet, a bank run in a small town). Explain every hard word the first time. Active voice. No filler,
  no "In this lesson we will".
- History is an argument from evidence: show the source, the map, the number — not just the fact. Say how
  we know. Show more than one point of view on the same event, especially the people who were left out.
- Honest and fair on hard topics (slavery, removal, war, injustice): plain facts, real people, no
  softening and no sermon. Neutral on contested present-day politics: what the evidence shows, what the
  sides argue, what the trade-offs are.
- Where it fits, connect to Illinois and Chicago and to the student's own life — only with facts you are
  sure of.
- Plain text only — no HTML, no markdown except: in `reading` paragraphs you MAY mark a key word with
  *asterisks* the first time it appears (only words that are also in that lesson's `words`).
- American spelling. Dates and numbers written out clearly. No emoji.

## LEVEL rules (from your unit's band)
| level | band  | reading paragraphs | chars per paragraph | avg sentence | words per lesson | choices per question |
|-------|-------|--------------------|---------------------|--------------|------------------|----------------------|
| k2    | K–2   | 2–3                | 80–260              | ≤ 9 words    | 1–3              | 3                    |
| 35    | 3–5   | 3                  | 150–500             | ≤ 13 words   | 2–4              | 4                    |
| 68    | 6–8   | 3–4                | 180–800             | ≤ 17 words   | 2–5              | 4                    |
| hs    | 9–10  | 3–4                | 250–900             | ≤ 20 words   | 3–5              | 4                    |
| hs2   | 11–12 | 3–4                | 250–900             | ≤ 22 words   | 3–6              | 4                    |
- K–2 also: story paragraphs 120–400 chars (3–4 of them); intro paragraphs 120–400; mainIdea ≤ 120 chars;
  questions ask about things a six-year-old saw in the reading; the `look` is almost always `think`
  (a picture in words: "Look at the puddle. Yesterday it was big…") or `data` with 3–4 simple rows.
- 3–5 also: story paragraphs 150–600; intro 150–600.
- 6–8, 9–10, 11–12: story paragraphs 200–900; intro 200–900.
- Chapters: 3–4 sections; 2–4 lessons per section. Aim: K–2 → 6–8 lessons per chapter; 3–5 → 9–11;
  6–8 and up → 10–12.
- Reviews: K–2 → 6 questions per chapter, unit test 10, wrap words 8. All other levels → 8 per chapter,
  test 15, wrap words 12.

## Accuracy — the most important rule
- Only well-established history and figures you are confident of (standard dates, well-known counts).
  If unsure of a number or date, leave it out or say it more generally ("in the 1840s", "tens of thousands").
  A wrong figure is worse than none.
- `source` looks (`"paraphrase": false`) must be public domain (published before 1929, or U.S. federal
  government work: the Constitution, the Declaration, presidential speeches and proclamations, Supreme Court
  opinions, census reports) AND you must be certain of the exact wording; keep under 70 words. If not 100%
  sure of the words, set `"paraphrase": true` and paraphrase clearly. Never invent a quote. Never quote a
  living person or any text from 1929 or later verbatim.
- `data` looks use standard, widely published rounded figures (a census population, a battle's rough
  size, a distance, a price index in round numbers). Cite the general source (e.g. "U.S. Census, rounded",
  "National Park Service", "standard estimate"). If unsure, use `think`.
- Say "about" and "roughly" when a figure is rounded. Give the era for every person and event.

## Files you write
1. `ch<N>.json` — one file per chapter of your unit (N = chapter number from outline.py). Write each with
   the Write tool as soon as it is done.
2. `u<n>_head.json` — the unit's intro, big question, timeline and wrap-up (no chapters).
3. Then run: `cd <folder> && python3 assemble.py <n>` — it builds `u<n>.json` and validates it for your
   level. Fix every problem it reports (edit the chapter files, re-run) until it prints OK.

### ch<N>.json
```
{
 "n": 22, "title": "Atoms, Molecules and States of Matter", "years": "Matter",     // "years" = the strand label
 "bigQuestion": "One open question the whole chapter helps answer (ends with ?)",
 "story": {                              // a narrative opener — a real phenomenon, discovery or scene
   "title": "…", "kicker": "one-sentence teaser",
   "paragraphs": ["…", "…", "…", "…"],   // count and length per LEVEL rules
   "think": "one question for students to discuss after the story"
 },
 "sections": [
   {"title": "…", "lessons": [
     {
      "title": "…",
      "mainIdea": "One sentence: the single thing to remember.",
      "reading": ["p1", "p2", "p3"],
      "words": [{"w": "friction", "d": "a force that slows things that rub together"}],
      "look": { … see below … },
      "check": [ {"q": "…", "choices": ["…","…","…"], "a": 1, "why": "why the answer is right"} ]  // exactly 3 questions
     }
   ]}
 ],
 "review": [ 6 or 8 multiple-choice questions on the whole chapter, same shape as check ]
}
```
`look` is one of:
- `{"type":"source","title":"…","text":"the quote or paraphrase","cite":"who, what, year","paraphrase":false,"prompt":"a question about it"}`
- `{"type":"data","title":"…","rows":[["Air",343],["Water",1480],["Steel",5960]],"unit":"m/s","cite":"…","prompt":"a question about the numbers"}` (3–8 rows; numbers only in the second slot)
- `{"type":"think","title":"…","text":"a short scenario, observation or picture in words (60–600 chars)","prompt":"a question"}`
Mix across a chapter: roughly 1–3 data, 2+ sources (fewer at K–2; zero is fine there), the rest think.

Questions: one clearly right answer; wrong choices plausible but clearly wrong to a student who read the
lesson (common misconceptions make the best wrong choices). Mix recall and reasoning (why, predict, compare,
what would happen if). No "all of the above", no trick wording. Spread the right answer evenly over the
positions (the validator checks ~equal shares). `why` explains in one or two sentences.

### u<n>_head.json
```
{
 "intro": ["2–3 paragraphs that open the unit: the phenomena, why it matters, what you will be able to explain"],
 "bigQuestion": "the unit's essential question",
 "timeline": [ {"y": "1665", "t": "Robert Hooke looks at cork and names the 'cell'"} ],   // 8–12 moments, in order:
     // how people figured this out (years), OR for K–2 a sequence students live through
     // ("Morning", "Noon", "Night" / "Day 1" … "Day 10"). Keep `y` under 12 characters.
 "wrap": {
   "words": [ 8 (K–2) or 12 key terms across the unit, {"w","d"} ],
   "test": [ 10 (K–2) or 15 multiple-choice questions across the whole unit ],
   "write": {"prompt": "a claim–evidence–reasoning task using evidence from the unit",
             "tips": ["3–5 short tips: claim, evidence to use, reasoning, the other side"]}
 }
}
```

When done, reply with ONLY: the validator's OK line, and a list of any facts you were unsure about and left
out or softened (one line each), and any quote you set to paraphrase.
