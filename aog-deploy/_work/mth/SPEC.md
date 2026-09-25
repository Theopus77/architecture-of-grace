# Writing one unit of "Mathematics, K–12" — Architecture of Grace

You are writing the content for ONE unit of a free online math course built by a special-education
teacher in Illinois. Many readers are students with IEPs, English learners, or reading below grade level.
Content goes into JSON files that a build script turns into web pages. Everything you write is ORIGINAL.

Your unit's chapters, strands, topics and chapter story hooks are in `outline.py` (the `UNITS` list;
find your unit by `n`). Its `band` tells you which LEVEL rules below apply. Follow the Illinois Learning
Standards for Mathematics (Common Core) progression the outline lays out; do not copy any textbook's
wording, feature names or titles. Invent your own section and lesson titles (short, 2–6 words, clear, not cute).

## Voice, across every level
- Concrete first, then the rule. Start every lesson from a situation a student can picture (sharing
  cookies, a phone plan, a basketball's arc), show the method on that example step by step, then state the
  idea in general. Explain every math word the first time. Active voice. No filler, no "In this lesson we will".
- Show the work. A reading paragraph that teaches a method WALKS THROUGH a worked example with the actual
  numbers ("3/4 + 1/8: rewrite 3/4 as 6/8, then 6/8 + 1/8 = 7/8"). Name common mistakes and why they happen.
- Math notation in plain text only: fractions as 3/4; × and ÷ (or "times" and "divided by"); exponents as
  2^3 or "2 to the third power"; square roots as √16; π; ≤ ≥ ≠; negative numbers as −5; decimals with a
  leading zero (0.75); units with numbers (12 cm, $4.50). No LaTeX, no HTML, no markdown except:
  in `reading` paragraphs you MAY mark a key word with *asterisks* the first time it appears (only words
  that are also in that lesson's `words`).
- Where it fits, connect to Illinois and Chicago, everyday life and the site's own rooms — only with facts
  you are sure of. American spelling.

## LEVEL rules (from your unit's band)
| level | band  | reading paragraphs | chars per paragraph | avg sentence | words per lesson | choices per question |
|-------|-------|--------------------|---------------------|--------------|------------------|----------------------|
| k2    | K–2   | 2–3                | 80–260              | ≤ 9 words    | 1–3              | 3                    |
| 35    | 3–5   | 3                  | 150–500             | ≤ 13 words   | 2–4              | 4                    |
| 68    | 6–8   | 3–4                | 180–800             | ≤ 17 words   | 2–5              | 4                    |
| hs    | 9–10  | 3–4                | 250–900             | ≤ 20 words   | 3–5              | 4                    |
| hs2   | 11–12 | 3–4                | 250–900             | ≤ 22 words   | 3–6              | 4                    |
- K–2 also: story paragraphs 120–400 chars (3–4 of them); intro paragraphs 120–400; mainIdea ≤ 120 chars;
  questions use numbers within the grade's range; the `look` is almost always `think` (a picture in words:
  "Look at the two towers of blocks…") or `data` with 3–4 simple rows.
- 3–5 also: story paragraphs 150–600; intro 150–600.
- 6–8, 9–10, 11–12: story paragraphs 200–900; intro 200–900.
- Chapters: 3–4 sections; 2–4 lessons per section. Aim: K–2 → 6–8 lessons per chapter; 3–5 → 9–11;
  6–8 and up → 10–12.
- Reviews: K–2 → 6 questions per chapter, unit test 10, wrap words 8. All other levels → 8 per chapter,
  test 15, wrap words 12.

## Accuracy — the most important rule
- EVERY numeric answer must be right. Compute each question's answer twice, on paper in your head and once
  more by a different route, before you write the `a` index. Wrong choices should be the answers a student
  gets from a specific, common mistake (forgot to regroup, added denominators, dropped the sign).
- Every worked example in a reading must be arithmetically correct. Re-check each one.
- Historic and real-world figures: only well-established facts (Gauss and 1 to 100, Euclid's Elements,
  the Fibonacci sequence, U.S. coin values, the Richter scale being logarithmic). If unsure of a date or
  number, leave it out or say it more generally.
- `source` looks (`"paraphrase": false`) must be public domain (before 1929, or U.S. federal government
  work) AND exact; otherwise set `"paraphrase": true`. A `source` in math is a line from a historic text
  (Euclid, Fibonacci's Liber Abaci, Newton, Euler, a government statistics report). Zero sources in a
  chapter is fine; `think` and `data` carry most math chapters.
- `data` looks: real, standard figures (coin values, unit conversions, a small table of values from a
  function you define, typical interest rates labeled "example", U.S. Census rounded counts). Cite plainly.

## Files you write
1. `ch<N>.json` — one file per chapter of your unit (N = chapter number from outline.py). Write each with
   the Write tool as soon as it is done.
2. `u<n>_head.json` — the unit's intro, big question, timeline and wrap-up (no chapters).
3. Then run: `cd <folder> && python3 assemble.py <n>` — it builds `u<n>.json` and validates it for your
   level. Fix every problem it reports (edit the chapter files, re-run) until it prints OK.

### ch<N>.json
```
{
 "n": 24, "title": "Ratios and Unit Rates", "years": "Ratios",     // "years" = the strand label
 "bigQuestion": "One open question the whole chapter helps answer (ends with ?)",
 "story": {                              // a narrative opener — a real situation, a puzzle, a moment in the history of the idea
   "title": "…", "kicker": "one-sentence teaser",
   "paragraphs": ["…", "…", "…", "…"],   // count and length per LEVEL rules
   "think": "one question for students to discuss after the story"
 },
 "sections": [
   {"title": "…", "lessons": [
     {
      "title": "…",
      "mainIdea": "One sentence: the single thing to remember.",
      "reading": ["p1", "p2", "p3"],       // teach the method through a worked example
      "words": [{"w": "unit rate", "d": "a rate with 1 as the second amount, like 60 miles per 1 hour"}],
      "look": { … see below … },
      "check": [ {"q": "…", "choices": ["…","…","…","…"], "a": 2, "why": "why the answer is right, with the arithmetic"} ]  // exactly 3
     }
   ]}
 ],
 "review": [ 6 or 8 multiple-choice questions on the whole chapter, same shape as check ]
}
```
`look` is one of:
- `{"type":"think","title":"…","text":"a worked problem, a scenario or a picture in words (60–600 chars)","prompt":"a question that asks the student to try it"}` — the workhorse for math
- `{"type":"data","title":"…","rows":[["1 hour",60],["2 hours",120],["3 hours",180]],"unit":"miles","cite":"…","prompt":"a question about the numbers"}` (3–8 rows; numbers only in the second slot)
- `{"type":"source","title":"…","text":"the quote or paraphrase","cite":"who, what, year","paraphrase":false,"prompt":"a question about it"}`
Mix across a chapter: mostly think, 2–4 data, sources only where a real one fits.

Questions: one clearly right answer; wrong choices from specific mistakes. Mix computation, reasoning
(why, which method, what would happen if) and reading a table or description. No "all of the above", no
trick wording. Spread the right answer evenly over the positions (the validator checks ~equal shares).
`why` shows the arithmetic in one or two sentences.

### u<n>_head.json
```
{
 "intro": ["2–3 paragraphs that open the unit: the situations, why it matters, what you will be able to do"],
 "bigQuestion": "the unit's essential question",
 "timeline": [ {"y": "c. 300 BCE", "t": "Euclid's Elements gathers geometry into proofs"} ],   // 8–12 moments, in order:
     // how people figured this out (years), OR for K–2 a sequence students live through
     // ("Monday" … "Friday" / "Step 1" … "Step 8"). Keep `y` under 12 characters.
 "wrap": {
   "words": [ 8 (K–2) or 12 key terms across the unit, {"w","d"} ],
   "test": [ 10 (K–2) or 15 multiple-choice questions across the whole unit ],
   "write": {"prompt": "an explain-your-reasoning task: solve a problem and explain each step, or argue which method is best",
             "tips": ["3–5 short tips: state the answer, show each step, say why it works, check it"]}
 }
}
```

When done, reply with ONLY: the validator's OK line, and a list of any facts you were unsure about and left
out or softened (one line each), and any quote you set to paraphrase.
