# Writing one unit of "Spanish, K–12" — Architecture of Grace

You are writing the content for ONE unit of a free online Spanish course built by a special-education
teacher in Illinois. Many readers are students with IEPs, English learners (many are heritage Spanish
speakers), or reading below grade level. Content goes into JSON files that a build script turns into
web pages. Everything you write is ORIGINAL.

Your unit's chapters, strands, topics and chapter story hooks are in `outline.py` (the `UNITS` list;
find your unit by `n`). Its `band` tells you which LEVEL rules below apply. Follow the ACTFL / Illinois
World Languages progression the outline lays out; do not copy any textbook's wording, dialogues, feature
names or titles. Invent your own section and lesson titles (short, 2–6 words, clear, not cute).

## Voice, across every level
- The course is taught IN ENGLISH, ABOUT Spanish. Readings, questions and `why` are English prose that
  carries Spanish words, phrases and example sentences, each with an English gloss the first time:
  "*la mesa* (the table)". Spanish is always correct standard Spanish with every accent and ñ, and
  ¿ ¡ at the start of questions and exclamations.
- Concrete first, then the rule. Start every lesson from a situation a student can picture (meeting a new
  classmate, ordering tacos, texting a cousin), show the pattern on that example step by step, then state
  the rule. Explain every grammar word the first time. Active voice. No filler, no "In this lesson we will".
- Show the pattern. A reading that teaches a form WALKS THROUGH real examples ("hablar → hablo, hablas,
  habla: drop -ar, add the ending"). Name common mistakes and why English speakers make them.
- `words` are the SPANISH terms (with el/la for nouns): {"w": "la biblioteca", "d": "the library — …"}.
  Grammar terms (conjugate, preterite) may also be words at 6–8 and up.
- Plain text only. No HTML, no markdown except: in `reading` paragraphs you MAY mark a key word with
  *asterisks* the first time it appears (only words that are also in that lesson's `words`, spelled the same).
- Culture: respectful and specific; Spanish-speaking people are not one culture. Connect to Chicago and
  Illinois (Pilsen, Little Village, Humboldt Park) and the site's own rooms only with facts you are sure of.
  American spelling in English.
- Questions test Spanish: pick the right form, the meaning of a sentence, the right word for a situation,
  ser or estar, which ending, a culture fact from the reading. Wrong choices come from real learner
  mistakes (wrong gender, English word order, the -o ending for every subject, a missing accent).

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
- EVERY Spanish form must be correct: conjugations, accents, gender, agreement. Check each question's
  right answer and make sure no wrong choice is ALSO correct (e.g. both tú and usted forms fit; regional
  variants like carro/coche are both right — avoid those as distractors).
- Numbers in examples (prices, times, dates) are labeled examples; arithmetic in them must be right.
- Culture and geography: only well-established facts (the 20 countries with Spanish as an official
  language, Mexico's Independence Day on September 16, Día de los Muertos on November 1–2, the ñ, the RAE
  in Madrid). If unsure of a date or number, leave it out or say it more generally.
- `source` looks (`"paraphrase": false`) must be public domain (before 1929) AND exact; otherwise set
  `"paraphrase": true`. A `source` here is a line from a public-domain Spanish text (a traditional
  proverb or rhyme, Cervantes, José Martí, Gabriela Mistral before 1929, Rubén Darío) given in Spanish
  with an English translation in the same text. Zero sources in a chapter is fine.
- `data` looks: real, simple figures — number words and their values, a verb's six forms numbered 1–6 is
  NOT data (use think for that); good data: numbers 0–20 with their values, times on a clock, prices
  labeled "example", populations of Spanish-speaking countries rounded and cited generally. Cite plainly.
- `think` looks are the workhorse: a mini-dialogue, a conjugation walk-through, a scene to describe.

## Files you write
1. `ch<N>.json` — one file per chapter of your unit (N = chapter number from outline.py). Write each with
   the Write tool as soon as it is done.
2. `u<n>_head.json` — the unit's intro, big question, timeline and wrap-up (no chapters).
3. Then run: `cd <folder> && python3 assemble.py <n>` — it builds `u<n>.json` and validates it for your
   level. Fix every problem it reports (edit the chapter files, re-run) until it prints OK.

### ch<N>.json
```
{
 "n": 24, "title": "Regular -ar, -er and -ir Verbs", "years": "Regular Verbs",     // "years" = the strand label
 "bigQuestion": "One open question the whole chapter helps answer (ends with ?)",
 "story": {                              // a narrative opener — a real-feeling situation, told in English with Spanish lines glossed
   "title": "…", "kicker": "one-sentence teaser",
   "paragraphs": ["…", "…", "…", "…"],   // count and length per LEVEL rules
   "think": "one question for students to discuss after the story"
 },
 "sections": [
   {"title": "…", "lessons": [
     {
      "title": "…",
      "mainIdea": "One sentence: the single thing to remember.",
      "reading": ["p1", "p2", "p3"],       // teach the pattern through real examples, Spanish glossed
      "words": [{"w": "hablar", "d": "to speak or talk — a regular -ar verb: hablo, hablas, habla"}],
      "look": { … see below … },
      "check": [ {"q": "…", "choices": ["…","…","…","…"], "a": 2, "why": "why the answer is right, with the Spanish rule"} ]  // exactly 3
     }
   ]}
 ],
 "review": [ 6 or 8 multiple-choice questions on the whole chapter, same shape as check ]
}
```
`look` is one of:
- `{"type":"think","title":"…","text":"a mini-dialogue, a conjugation walk-through, a scenario or a picture in words (60–600 chars)","prompt":"a question that asks the student to try it"}` — the workhorse for Spanish
- `{"type":"data","title":"…","rows":[["once",11],["doce",12],["trece",13]],"unit":"value","cite":"…","prompt":"a question about the numbers"}` (3–8 rows; numbers only in the second slot)
- `{"type":"source","title":"…","text":"the quote or paraphrase","cite":"who, what, year","paraphrase":false,"prompt":"a question about it"}`
Mix across a chapter: mostly think, 2–4 data, sources only where a real one fits.

Questions: one clearly right answer; wrong choices from specific mistakes. Mix forms, meaning,
reasoning (why this form, what changes if) and reading a dialogue or description. No "all of the above", no
trick wording. Spread the right answer evenly over the positions (the validator checks ~equal shares).
`why` names the rule or the meaning in one or two sentences.

### u<n>_head.json
```
{
 "intro": ["2–3 paragraphs that open the unit: the situations, why it matters, what you will be able to do"],
 "bigQuestion": "the unit's essential question",
 "timeline": [ {"y": "1492", "t": "Nebrija publishes the first grammar of Castilian Spanish"} ],   // 8–12 moments, in order:
     // moments in the history of Spanish and its speakers (years), OR for K–2 a sequence students live through
     // ("Monday" … "Friday" / "Step 1" … "Step 8"). Keep `y` under 12 characters.
 "wrap": {
   "words": [ 8 (K–2) or 12 key terms across the unit, {"w","d"} ],
   "test": [ 10 (K–2) or 15 multiple-choice questions across the whole unit ],
   "write": {"prompt": "a short writing task IN SPANISH for the level (K–2: label or say 3 sentences; 3–5: 4–6 sentences; 6–8+: a paragraph or letter) with an English explanation of what to include",
             "tips": ["3–5 short tips: e.g. use the words from this unit, check every verb ending, check el/la and agreement, read it aloud"]}
 }
}
```

When done, reply with ONLY: the validator's OK line, and a list of any facts you were unsure about and left
out or softened (one line each), and any quote you set to paraphrase.
