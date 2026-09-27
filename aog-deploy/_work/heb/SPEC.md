# Writing one unit of "The Hebrew Bible (Tanakh), K–12" — Architecture of Grace

You are writing the content for ONE unit of a free online K–12 course on The Hebrew Bible built by a
special-education teacher in Illinois for a public-school setting. Many readers are students with IEPs,
English learners, or reading below grade level. Content goes into JSON files that a build script turns
into web pages. Everything you write is ORIGINAL.

Your unit's chapters, strands, topics and chapter story hooks are in `outline.py` (the `UNITS` list;
find your unit by `n`). Its `band` tells you which LEVEL rules below apply. Follow the sequence the
outline lays out; do not copy any textbook's wording, feature names or titles.
Invent your own section and lesson titles (short, 2–6 words, clear, not cute).

## Voice, across every level
- This is the STUDY of the Tanakh in a public school, as Jewish tradition reads it and as historians and
  literary readers read it — not religious instruction. Neutral, descriptive and respectful: "the Torah
  says…", "Jewish tradition teaches…", "Rashi reads this as…", "the rabbis of the Talmud…", "scholars
  date…". Never assert or deny that the text is true, revealed or historical. Christian readings are
  described where they differ, without ranking (Isaiah 7:14, Isaiah 53, Psalm 22), and the order and count
  of books are the Tanakh's (24 books; Torah, Nevi'im, Ketuvim).
- Use Hebrew names and terms with a plain gloss the first time (*Bereshit*, *parashah*, *haftarah*,
  *midrash*, *peshat*, *chesed*, *teshuvah*), and give the common English name too (Genesis). Write the
  divine name as "God" or "the LORD" as JPS 1917 does; never spell out the four-letter name.
- K–2 and 3–5 retell the stories plainly in the text's order and connect them to the Jewish year (Shabbat,
  Passover, Shavuot, Purim) as practices Jewish families keep; 6–8 adds the shape of the book and the ways
  of reading; 9–12 reads closely with the commentators, the text's transmission and its modern readers.
- Concrete first, then the idea. Start every lesson from a passage, a practice, a place or a person, show
  what it says and what it has meant to its readers, then state the concept. Explain every term the first
  time. Active voice. No filler.
- `words` are the key terms: {"w": "…", "d": "…"}.
- Plain text only. No HTML, no markdown except: in `reading` paragraphs you MAY mark a key word with
  *asterisks* the first time it appears (only words that are also in that lesson's `words`, spelled the same).
- Connect to Illinois and Chicago (the city's houses of worship and schools, the 1893 World's Parliament of
  Religions) only with facts you are sure of. American spelling.
- Questions test understanding: what a term means, what a passage says, who is speaking to whom, which
  book or tradition a thing belongs to, how two readers read the same text differently, what a passage's
  author is doing. Wrong choices come from real confusions (mixing up books, figures, terms or readings) —
  never from mocking any belief.
- Every lesson's `source` and `data` looks feed a resources list that a shared page script builds from them,
  so each one must be real and citable: the book, chapter and verse (or surah:ayah, tractate and page),
  the translation and its year. Prefer public-domain sources; never invent a citation.

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
- Attribute beliefs, always. Never assert or deny that any religious claim is true; never use "we" for any
  faith; never tell the reader what to believe or that the text is (or is not) true. Describe disagreements
  between and within traditions without taking a side. Avoid loaded words (myth used to mean false, cult,
  primitive, pagan or sect used as slurs, "the Jews" as a blanket subject of blame, "Mohammedan").
- Sensitive passages (violence, conquest, slavery, gender, punishment, other peoples) are described
  factually, with their context and with how readers have handled them, never as a verdict on a tradition.
- Every fact about the text — book, chapter, verse, author as tradition names them, date (use "c." freely),
  language, manuscript — must be well established. If unsure, leave it out or say it generally.
- `data` looks: rounded, generally cited figures (numbers of books or chapters, dates in a sequence,
  manuscript ages, counts of adherents "estimates vary"). Cite plainly.
- `think` looks: a passage to interpret, two translations or two readings side by side, a practice to
  explain, a case to reason about.
- Aim for 3–6 `source` looks per chapter; every chapter has at least one; every `source` names its
  translation. `"paraphrase": false` requires a public-domain translation AND an exact quotation you are
  certain of; anything else is `"paraphrase": true` in your own words.
- Quote only public-domain translations, and name them: the Jewish Publication Society Tanakh (1917) is
  the course's text; the King James Version (1611) or ASV (1901) for comparison; Charles Taylor's Sayings of
  the Jewish Fathers (1877) for Pirkei Avot; Rodkinson's Talmud (1896–1903) for Talmudic passages. Rashi,
  Ibn Ezra, Ramban, midrash and the NJPS (1985), Alter and Fox translations are paraphrased
  (`"paraphrase": true`) with the commentator and the verse named — never quoted from modern translations.

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
 "story": {                              // a narrative opener — a real-feeling scene — a text being read, a practice observed, a moment in the tradition's history
   "title": "…", "kicker": "one-sentence teaser",
   "paragraphs": ["…", "…", "…", "…"],   // count and length per LEVEL rules
   "think": "one question for students to discuss after the story"
 },
 "sections": [
   {"title": "…", "lessons": [
     {
      "title": "…",
      "mainIdea": "One sentence: the single thing to remember.",
      "reading": ["p1", "p2", "p3"],       // teach the idea through a text or practice, attributed
      "words": [{"w": "covenant", "d": "a binding agreement; in the Hebrew Bible, the bond between God and Israel"}],
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
 "timeline": [ {"y": "c. 500 BCE", "t": "The Buddha teaches in northern India"} ],   // 8–12 moments, in order:
     // when it happened — the tradition's history in order (years, "c." freely), OR for K–2 a sequence students live through
     // ("Monday" … "Friday" / "Step 1" … "Step 8"). Keep `y` under 12 characters.
 "wrap": {
   "words": [ 8 (K–2) or 12 key terms across the unit, {"w","d"} ],
   "test": [ 10 (K–2) or 15 multiple-choice questions across the whole unit ],
   "write": {"prompt": "an argue-from-the-text task: pose a question, cite two or three passages from the unit (book, chapter, verse or tractate and page), and explain what the text says and how its readers have read it",
             "tips": ["3–5 short tips: e.g. name the text you cite, attribute every belief to its tradition or reader, compare rather than judge, use the unit's terms"]}
 }
}
```

When done, reply with ONLY: the validator's OK line, and a list of any facts you were unsure about and left
out or softened (one line each), and any quote you set to paraphrase.
