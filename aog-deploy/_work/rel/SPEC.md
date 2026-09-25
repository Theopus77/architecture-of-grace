# Writing one unit of "World Religions, Grades 9–12" — Architecture of Grace

You are writing the content for ONE unit of a free online World Religions course built by a
special-education teacher in Illinois for a public-school setting. Many readers are students with IEPs,
English learners, or reading below grade level. Content goes into JSON files that a build script turns
into web pages. Everything you write is ORIGINAL.

Your unit's chapters, strands, topics and chapter story hooks are in `outline.py` (the `UNITS` list;
find your unit by `n`). Its `band` tells you which LEVEL rules below apply. Follow the academic,
comparative sequence the outline lays out; do not copy any textbook's wording, feature names or titles.
Invent your own section and lesson titles (short, 2–6 words, clear, not cute).

## Voice, across every level
- This is the academic STUDY of religion, not the practice of it, in a public school. The tone is
  neutral, descriptive and respectful toward every tradition and toward students of no religion:
  "Muslims believe…", "the Torah teaches…", "many Buddhists practice…", "adherents hold…". Never assert
  or deny that any religious claim is true; never rank traditions; never use "we" for any faith.
- Concrete first, then the idea. Start every lesson from a text, a practice, a place or a person
  (a Sabbath table, a line of the Gita, a pilgrim at Mecca, a monastery bell), show what it means to
  adherents, then state the concept. Explain every term the first time. Active voice. No filler.
- Use the traditions' own terms, with a plain gloss the first time (*Torah* — the first five books of the
  Hebrew Bible; *dharma* — duty, the right way to live). Show diversity WITHIN traditions (Sunni and Shia;
  Orthodox, Conservative and Reform; Theravada and Mahayana; many Hindu paths).
- `words` are the key terms: {"w": "covenant", "d": "…"}.
- Plain text only. No HTML, no markdown except: in `reading` paragraphs you MAY mark a key word with
  *asterisks* the first time it appears (only words that are also in that lesson's `words`, spelled the same).
- Connect to Illinois and Chicago (the 1893 World's Parliament of Religions in Chicago, the city's
  houses of worship, the Bahá'í House of Worship in Wilmette) and the site's own rooms only with facts
  you are sure of. American spelling.
- Questions test understanding: what a term means, what a text says, which practice belongs to which
  tradition, how two traditions answer the same question differently, what a source's author is doing.
  Wrong choices come from real confusions (mixing up traditions, terms or texts) — never from mocking
  any belief.

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
- Every fact about a tradition must be well established and stated the way its scholars and adherents
  would recognize: names, dates (use "c." freely), texts, practices, holidays, founders, numbers of
  adherents (rounded, "about", "estimates vary"). If unsure, leave it out or say it generally.
- Attribute beliefs, always: "Christians believe", "according to the Qur'an", "in Jewish tradition".
  Describe disagreements between and within traditions without taking a side. Avoid loaded words
  (cult, myth used to mean false, primitive, pagan as a slur, heathen, sect used dismissively).
- Sensitive topics (violence, conversion, persecution, gender roles) are described factually and with
  care, with dates and places, not judgments.
- `source` looks are central to this course. `"paraphrase": false` requires a public-domain translation
  AND an exact quotation: the King James Bible (1611), the Jewish Publication Society Tanakh (1917),
  Rodwell's or Palmer's Qur'an (1861/1880), Max Müller's Sacred Books of the East (1879–1910, e.g. the
  Dhammapada, the Upanishads, the Daodejing translations), Legge's Analects (1861), Edwin Arnold's Gita
  (1885), Macauliffe's Sikh Religion (1909). Anything else, or any quote you are not certain is exact,
  is `"paraphrase": true` with the text in your own words. Cite the text, chapter and verse or section.
  Aim for 3–6 sources per chapter; every chapter has at least one.
- `data` looks: rounded, generally cited figures (adherents by tradition, calendar facts, dates in a
  sequence, the Five Pillars as a numbered list is NOT data — use think). Cite plainly ("common estimates").
- `think` looks: a passage to interpret, two texts side by side, a practice to explain, a case to reason
  about ("A hospital serves patients of every faith. What would each tradition ask about the food?").

## Files you write
1. `ch<N>.json` — one file per chapter of your unit (N = chapter number from outline.py). Write each with
   the Write tool as soon as it is done.
2. `u<n>_head.json` — the unit's intro, big question, timeline and wrap-up (no chapters).
3. Then run: `cd <folder> && python3 assemble.py <n>` — it builds `u<n>.json` and validates it for your
   level. Fix every problem it reports (edit the chapter files, re-run) until it prints OK.

### ch<N>.json
```
{
 "n": 24, "title": "Torah, Talmud and a People", "years": "Judaism",     // "years" = the strand label
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
   "write": {"prompt": "an argue-from-the-sources task: pose a question, cite two or three texts from the unit, and explain what each tradition would say and why",
             "tips": ["3–5 short tips: e.g. name the text you cite, attribute every belief to its tradition, compare rather than judge, use the unit's terms"]}
 }
}
```

When done, reply with ONLY: the validator's OK line, and a list of any facts you were unsure about and left
out or softened (one line each), and any quote you set to paraphrase.
