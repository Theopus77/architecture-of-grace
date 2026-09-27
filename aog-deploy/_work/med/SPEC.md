# Writing one unit of "Medicine and Health, K–12" — Architecture of Grace

You are writing the content for ONE unit of a free online K–12 course on health, the human body and the
world's medical traditions — Western (biomedical) medicine and its history, Traditional Chinese Medicine,
Ayurveda, Unani, Kampo and Indigenous healing — built by a special-education teacher in Illinois for a
public-school setting. Many readers are students with IEPs, English learners, or reading below grade level.
Content goes into JSON files that a build script turns into web pages. Everything you write is ORIGINAL.
Write as a senior physician and historian of medicine who is also a gifted teacher of young readers would.

Your unit's chapters, strands, topics and chapter story hooks are in `outline.py` (the `UNITS` list;
find your unit by `n`). Its `band` tells you which LEVEL rules below apply. Cover the outline's topics in
order. Invent your own section and lesson titles (short, 2–6 words, clear, not cute).

## Voice, across every level
- Accurate and fair. Traditional systems are described respectfully and in their own terms ("Traditional
  Chinese Medicine teaches…", "Ayurveda holds…"); qi, meridians and doshas are named as the tradition's
  ideas, not as measured facts. Then say plainly and gently what scientific evidence shows: where it
  supports a practice for a use, where it does not, and where it is unclear.
- Never say any remedy, traditional or modern, cures a serious disease unless that is established (e.g.
  antibiotics for bacterial infections). No dosing advice. Always point to a doctor, nurse, pharmacist or
  trusted adult, and to telling your doctor about any herbs or supplements.
- No fear-based wording. Facts about risks (vaping, alcohol, contamination) are stated calmly. Different
  bodies and minds are described with respect; no deficit labels.
- By the owner's decision the course does not include LGBTQ topics. Puberty and reproduction are mentioned
  only briefly and non-explicitly ("ask a parent, school nurse or doctor").
- Science is a way of knowing: show the observation, the test and how ideas changed (the four humors were
  believed for 2,000 years, then replaced).
- Concrete first, then the idea. Start every lesson from a person, a place, a scene or a real example, then
  state the concept. Explain every term the first time. Active voice. No filler.
- `words` are the key terms: {"w": "…", "d": "…"}.
- Plain text only. No HTML, no markdown except: in `reading` paragraphs you MAY mark a key word with
  *asterisks* the first time it appears (only words that are also in that lesson's `words`, spelled the same).
- Neuro-affirming, plain words: say what a learner can do and what helps; short sentences, one idea each.
- Wrong choices come from real confusions (mixing up people, places, dates, terms) — never jokes or mockery.
- Every `source` and `data` look feeds a resources list, so each must be real and citable (author or body,
  title, year). Never invent a citation, a quotation or a statistic. American spelling.
- Connect to Illinois and Chicago only with facts you are sure of.
- `"paraphrase": false` only for an exact public-domain quotation you are certain of (e.g. the Declaration of
  Independence, the Universal Declaration of Human Rights, Locke, Burke, Marx and Engels in the 1888 English
  translation, the Hippocratic Oath in a public-domain translation, Nightingale). Otherwise `"paraphrase": true`.
- Aim for 2–5 `source` looks per chapter; every chapter has at least one. `data` looks: rounded, widely cited
  figures with the source named. Mix across a chapter: mostly think, 2–4 data, sources where a real one fits.

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
- Every fact — name, date (use "c." or "about" freely), place, number — must be well established. If unsure,
  leave it out or say it generally. Round numbers and name who measured them.
- Contested questions (in politics, economics or medical evidence) are described as contested, with the main
  views, never settled by you.

## Files you write
1. `ch<N>.json` — one file per chapter of your unit (N = chapter number from outline.py). Write each with
   the Write tool as soon as it is done.
2. `u<n>_head.json` — the unit's intro, big question, timeline and wrap-up (no chapters).
3. Then run: `cd <folder> && python3 assemble.py <n>` — it builds `u<n>.json` and validates it for your
   level. Fix every problem it reports (edit the chapter files, re-run) until it prints OK.

### ch<N>.json
```
{
 "n": 24, "title": "…", "years": "…",     // "years" = the strand label
 "bigQuestion": "One open question the whole chapter helps answer (ends with ?)",
 "story": {                              // a narrative opener — a real-feeling scene — a real person, place or moment
   "title": "…", "kicker": "one-sentence teaser",
   "paragraphs": ["…", "…", "…", "…"],   // count and length per LEVEL rules
   "think": "one question for students to discuss after the story"
 },
 "sections": [
   {"title": "…", "lessons": [
     {
      "title": "…",
      "mainIdea": "One sentence: the single thing to remember.",
      "reading": ["p1", "p2", "p3"],       // teach the idea through a real example
      "words": [{"w": "feudalism", "d": "a system where land was traded for loyalty and service"}],
      "look": { … see below … },
      "check": [ {"q": "…", "choices": ["…","…","…","…"], "a": 2, "why": "why the answer is right, with the reason"} ]  // exactly 3
     }
   ]}
 ],
 "review": [ 6 or 8 multiple-choice questions on the whole chapter, same shape as check ]
}
```
`look` is one of:
- `{"type":"think","title":"…","text":"a passage to interpret, two texts side by side, a scenario or a picture in words (60–600 chars)","prompt":"a question that asks the student to try it"}` — the used often, with sources
- `{"type":"data","title":"…","rows":[["Christianity",2.4],["Islam",1.9],["Hinduism",1.2]],"unit":"billion adherents (common estimates)","cite":"…","prompt":"a question about the numbers"}` (3–8 rows; numbers only in the second slot)
- `{"type":"source","title":"…","text":"the quote or paraphrase","cite":"who, what, year","paraphrase":false,"prompt":"a question about it"}`
Mix across a chapter: mostly think, 2–4 data, sources only where a real one fits.

Questions: one clearly right answer; wrong choices from specific mistakes. Mix terms, texts,
comparison (how two traditions differ), and reading a passage or description. No "all of the above", no
trick wording. Spread the right answer evenly over the positions (the validator checks ~equal shares).
`why` names the text, term or tradition in one or two sentences.

### u<n>_head.json
```
{
 "intro": ["2–3 paragraphs that open the unit: the situations, why it matters, what you will be able to do"],
 "bigQuestion": "the unit's essential question",
 "timeline": [ {"y": "c. 500 BCE", "t": "Something that happened"} ],   // 8–12 moments, in order:
     // when it happened — the tradition's history in order (years, "c." freely), OR for K–2 a sequence students live through
     // ("Monday" … "Friday" / "Step 1" … "Step 8"). Keep `y` under 12 characters.
 "wrap": {
   "words": [ 8 (K–2) or 12 key terms across the unit, {"w","d"} ],
   "test": [ 10 (K–2) or 15 multiple-choice questions across the whole unit ],
   "write": {"prompt": "an argue-from-evidence task: pose a question, cite two or three facts or sources from the unit, and explain your claim",
             "tips": ["3–5 short tips: e.g. name your sources, give both sides fairly, use the unit's terms"]}
 }
}
```

When done, reply with ONLY: the validator's OK line, and a list of any facts you were unsure about and left
out or softened (one line each), and any quote you set to paraphrase.

