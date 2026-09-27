# Writing one unit of "Economics, K–12" — Architecture of Grace

You are writing the content for ONE unit of a free online K–12 Economics course built by a special-education
teacher in Illinois. Many readers are students with IEPs, English learners, or reading below grade level.
Content goes into JSON files that a build script turns into web pages. Everything you write is ORIGINAL.

Your unit's chapters, strands, topics and chapter story hooks are in `outline.py` (the `UNITS` list;
find your unit by `n`). Its `band` tells you which LEVEL rules below apply. Follow the standard
high-school sequence the outline lays out (microeconomics, then macroeconomics and the world economy);
do not copy any textbook's wording, feature names or titles. Invent your own section and lesson titles
(short, 2–6 words, clear, not cute).

## Voice, across every level
- Concrete first, then the model. Start every lesson from a situation a student can picture (a lemonade
  stand, a concert ticket, a first job, gas prices, a school budget), show the idea on that example with
  numbers, then state it in general. Explain every economics word the first time. Active voice. No
  filler, no "In this lesson we will".
- Show the work. A reading that teaches a concept WALKS THROUGH a worked example with actual numbers
  ("at $3 the store sells 100 cups; at $2, 150 cups — quantity demanded rose as price fell"). Curves are
  described in words and small tables, never drawn. Name common mistakes (a shift versus a movement
  along the curve; opportunity cost as a list).
- Balanced and non-partisan: present the standard economic reasoning and the trade-offs; where
  economists disagree (minimum wage, tariffs, the size of government), say so and give the main
  arguments on each side. No party labels, no advocacy.
- `words` are the economics terms: {"w": "opportunity cost", "d": "…"}.
- Plain text only: $, %, numbers with commas. No HTML, no markdown except: in `reading` paragraphs you
  MAY mark a key word with *asterisks* the first time it appears (only words that are also in that
  lesson's `words`, spelled the same).
- Connect to Illinois and Chicago (the Chicago Board of Trade, the Federal Reserve Bank of Chicago, the
  state's farms and factories) and the site's own rooms only with facts you are sure of. American spelling.
- Questions test the reasoning: which way a curve shifts and why, the opportunity cost in a described
  choice, a calculation (unit price, percent change, simple interest), reading a small table, which
  policy tool fits. Wrong choices come from specific, common mistakes.

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
- EVERY number in a question or worked example is right — compute it twice. Percent changes, elasticity
  as a ratio, interest, GDP components, unemployment rate = unemployed ÷ labor force × 100.
- Standard definitions only (the ones in any introductory text): scarcity, opportunity cost, the law of
  demand and supply, equilibrium, elasticity, market structures, GDP (C + I + G + NX), real vs. nominal,
  CPI, the labor force and unemployment, fiscal and monetary policy, the Fed's tools, comparative
  advantage, exchange rates.
- Every price, wage, rate and quantity is a LABELED EXAMPLE unless it is a well-known standard figure
  (the Fed's 2% inflation target; the FDIC insuring deposits up to $250,000; the CPI published by the
  BLS). Real historical figures only when certain and rounded ("unemployment peaked near 25% in the
  Great Depression"; "about 10% in late 2009"). If unsure of a date or number, leave it out or say it
  more generally.
- Institutions: the Federal Reserve's dual mandate (maximum employment and stable prices); the
  twelve Reserve Banks, one in Chicago; Congress and the President make fiscal policy; the Fed makes
  monetary policy. Describe tax types (progressive, regressive, proportional) without rates unless certain.
- `source` looks (`"paraphrase": false`) must be public domain (before 1929, or U.S. federal government
  text) AND exact: Adam Smith's Wealth of Nations (1776), Ricardo (1817), Marshall (1890), Bastiat,
  the Federal Reserve Act (1913), a BLS or Census sentence. Otherwise set `"paraphrase": true`.
  Zero sources in a chapter is fine; one or two per chapter is good.
- `data` looks: a small demand or supply schedule you define (labeled example), GDP components as
  rounded shares, unemployment in a few years rounded, a price index example. Cite plainly.
- `think` looks are the workhorse: a decision to analyze, a market event to trace, a policy case.

## Files you write
1. `ch<N>.json` — one file per chapter of your unit (N = chapter number from outline.py). Write each with
   the Write tool as soon as it is done.
2. `u<n>_head.json` — the unit's intro, big question, timeline and wrap-up (no chapters).
3. Then run: `cd <folder> && python3 assemble.py <n>` — it builds `u<n>.json` and validates it for your
   level. Fix every problem it reports (edit the chapter files, re-run) until it prints OK.

### ch<N>.json
```
{
 "n": 24, "title": "Supply, Demand and the Market", "years": "Markets",     // "years" = the strand label
 "bigQuestion": "One open question the whole chapter helps answer (ends with ?)",
 "story": {                              // a narrative opener — a real-feeling situation — a business, a family, a market, a moment in economic history
   "title": "…", "kicker": "one-sentence teaser",
   "paragraphs": ["…", "…", "…", "…"],   // count and length per LEVEL rules
   "think": "one question for students to discuss after the story"
 },
 "sections": [
   {"title": "…", "lessons": [
     {
      "title": "…",
      "mainIdea": "One sentence: the single thing to remember.",
      "reading": ["p1", "p2", "p3"],       // teach the model through a worked example with numbers
      "words": [{"w": "opportunity cost", "d": "the next-best thing you give up when you make a choice"}],
      "look": { … see below … },
      "check": [ {"q": "…", "choices": ["…","…","…","…"], "a": 2, "why": "why the answer is right, with the reason"} ]  // exactly 3
     }
   ]}
 ],
 "review": [ 6 or 8 multiple-choice questions on the whole chapter, same shape as check ]
}
```
`look` is one of:
- `{"type":"think","title":"…","text":"a decision to analyze, a market event to trace, a scenario or a picture in words (60–600 chars)","prompt":"a question that asks the student to try it"}` — the workhorse for economics
- `{"type":"data","title":"…","rows":[["$1",200],["$2",150],["$3",100]],"unit":"cups demanded (example)","cite":"…","prompt":"a question about the numbers"}` (3–8 rows; numbers only in the second slot)
- `{"type":"source","title":"…","text":"the quote or paraphrase","cite":"who, what, year","paraphrase":false,"prompt":"a question about it"}`
Mix across a chapter: mostly think, 2–4 data, sources only where a real one fits.

Questions: one clearly right answer; wrong choices from specific mistakes. Mix calculation, reasoning
(which way, why, what would happen if) and reading a table or description. No "all of the above", no
trick wording. Spread the right answer evenly over the positions (the validator checks ~equal shares).
`why` names the rule or shows the arithmetic in one or two sentences.

### u<n>_head.json
```
{
 "intro": ["2–3 paragraphs that open the unit: the situations, why it matters, what you will be able to do"],
 "bigQuestion": "the unit's essential question",
 "timeline": [ {"y": "1776", "t": "Adam Smith publishes The Wealth of Nations"} ],   // 8–12 moments, in order:
     // how the ideas came about — economists, events and institutions in order (years), OR for K–2 a sequence students live through
     // ("Monday" … "Friday" / "Step 1" … "Step 8"). Keep `y` under 12 characters.
 "wrap": {
   "words": [ 8 (K–2) or 12 key terms across the unit, {"w","d"} ],
   "test": [ 10 (K–2) or 15 multiple-choice questions across the whole unit ],
   "write": {"prompt": "an analyze-and-argue task: take a real-feeling decision or policy, apply the unit's model with numbers, and argue a conclusion with the trade-offs named",
             "tips": ["3–5 short tips: e.g. name the opportunity cost, show the numbers, say which way the curve shifts and why, name the trade-off"]}
 }
}
```

When done, reply with ONLY: the validator's OK line, and a list of any facts you were unsure about and left
out or softened (one line each), and any quote you set to paraphrase.
