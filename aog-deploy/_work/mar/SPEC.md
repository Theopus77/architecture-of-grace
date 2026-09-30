# Writing one unit of "The Measured Step — Martial Arts History, K–12" — Architecture of Grace

You are writing the content for ONE unit of a free online K–12 course on martial arts as history — named traditions from many places (judo, karate, taekwondo, the many Chinese systems, Muay Thai, capoeira, silat, arnis/eskrima, wrestling, boxing, fencing, sumo), their rooms, ranks, codes, governing bodies and Olympic paths, and how nations, law, film and migration shaped them. It is built by a special-education teacher in Illinois for a
public-school setting. Many readers are students with IEPs, English learners, or reading below grade level.
Content goes into JSON files that a build script turns into web pages. Everything you write is ORIGINAL.

Your unit's chapters, strands, topics and chapter story hooks are in `outline.py` (the `UNITS` list;
find your unit by `n`). Its `band` tells you which LEVEL rules below apply. Follow the sequence the
outline lays out; do not copy any textbook's wording, feature names or titles.
Invent your own section and lesson titles (short, 2–6 words, clear, not cute) — never cut a title from the outline's topic list.

The quality bar is the finished Buddhist Texts course: read `../bud/ch7.json` and `../bud/ch20.json` before you
start, and match their depth — every paragraph teaches something specific and true.

## Voice, across every level (both history books)
- This is HISTORY in a public school: games and martial arts as public institutions — rooms, rule books,
  governing bodies, schools, leagues, laws, people and dates. It is not PE, not coaching and not a playbook.
- **History only. No technique is ever taught, described step by step, or pictured in words:** no strike,
  kick, choke, hold, throw, tackle, play, drill, formation, stance or "how to". You may NAME a technique or
  a rule when history needs it ("the forward pass was legalized in 1906"); never explain how to do it.
  Follow this rule silently — **never write a lesson, paragraph or question ABOUT this rule, this course,
  the website, its drawings or its SPEC.** Every lesson teaches a real historical fact.
- Concrete first, then the idea. Every lesson starts from a real place, document, object, person or date,
  shows what happened, then states the idea. Explain every term the first time. Active voice.
- **Every sentence carries a fact or an explanation. No filler, no repeated stock sentences, no padding to
  reach a length.** If a paragraph is too short, add another true, specific fact (a name, a place, a date,
  a number, a cause, a consequence) — never a sentence like "The reading keeps the name and the date
  together." Do not reuse a sentence anywhere in the course.
- Deep time first: begin with older games and practices and the places they came from, not with the
  famous modern date. Name the people who were shut out and when doors opened (race, sex, disability,
  class), factually, with dates and laws.
- Traditions and rituals (bowing, the dojo, ranks, blessings before a match, national symbols) are
  DESCRIBED, never led. Attribute beliefs ("in many judo schools, students bow to…").
- Myth stays labeled as story: legends of origins (Shaolin legends, the Doubleday baseball story, ancient
  claims) are named as legends and set beside what historians can document.
- `words` are the key terms: {"w": "…", "d": "…"}.
- Plain text only. No HTML, no markdown except: in `reading` paragraphs you MAY mark a key word with
  *asterisks* the first time it appears (only words that are also in that lesson's `words`, spelled the same).
- Neuro-affirming, plain words: say what a learner can do and what helps; short sentences, one idea each.
- Questions test understanding: what a term means, what happened when and why, who made a rule, how two
  institutions differ, what a document says. Every check is answerable from that lesson's reading or words.
  Wrong choices come from real confusions (mixing up dates, people, sports, bodies) — never jokes.
- Connect to Illinois and Chicago only with facts you are sure of (IHSA, founded 1900; Chicago Park
  District; the 1893 World's Columbian Exposition; Chicago teams and venues with correct dates). American
  spelling.
- Course-specific: K–2 rooms (circle, ring, strip, mat), clothes as school marks, many countries and many names; 3–5 how arts got their shapes (Kanō and judo, Okinawa and karate, taekwondo as a national sport, capoeira, Queensberry boxing, wrestling older than leagues); 6–8 place and nation (China is not one kung fu, Southeast Asia and diaspora, women on the mat, the state and the gym); 9–10 and 11–12 who owns the name (lineage and certificates, Olympic code versus village art, film and invented styles, MMA as a league, Illinois rooms).
- Respect living traditions and communities. Never exotic, never "mystical"; name places and peoples precisely (Okinawa/Ryukyu, not "Japan" for early karate; Afro-Brazilian capoeira).
- The sister course Sports History covers sport broadly; mention it only as history needs.

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
- Every fact — name, date, place, number, rule, body — must be well established. If unsure, leave it out
  or say it generally ("in the late 1800s"). Never invent a person, date, number, quotation or citation.
- `source` looks cite a real, named work or record: a rule book (IFAB Laws of the Game; Official Baseball
  Rules; NCAA or NFHS rules), a founding document or law (Title IX, Education Amendments of 1972;
  the Amateur Sports Act of 1978), a primary text (Naismith, *Basketball: Its Origin and Development*, 1941;
  the Queensberry Rules, 1867; Kanō Jigorō's writings), official records (IOC, FIFA, IHSA, Kodokan).
  **Never cite this course, its outline, its SPEC or "Architecture of Grace".** `"paraphrase": false`
  only for an exact quotation you are certain of from a public-domain text; otherwise `"paraphrase": true`.
- `data` looks: real, generally cited numbers (years, distances, team sizes, counts), 3–8 rows, **one kind
  of thing in one unit per chart** (all years, or all feet — never mixed; no "note" rows, no filler rows).
- `think` looks: a document or scene to interpret, two rules side by side, an object described, a case to
  reason about.
- Timelines hold real dates only (years or "c." years) — no measurements or counts.
- Hard history (segregation, exclusion of women, injuries and deaths that forced rule changes, war,
  nationalism, colonial rule) is told factually with context and dates, never sensational.

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
      "words": [{"w": "dharma", "d": "duty or the right way to live; a key word in Hindu and Buddhist texts"}],
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
   "write": {"prompt": "an argue-from-the-text task: pose a question, cite two or three passages from the unit (text, book or chapter, and verse, with the translation), and explain what the text says and how its readers have read it",
             "tips": ["3–5 short tips: e.g. name the text you cite, attribute every belief to its tradition or reader, compare rather than judge, use the unit's terms"]}
 }
}
```

When done, reply with ONLY: the validator's OK line, and a list of any facts you were unsure about and left
out or softened (one line each), and any quote you set to paraphrase.

Note: the examples inside the file shapes above come from a religion course. For this course, `source`
looks cite rule books, records, laws and historical works (see Accuracy), and the unit `write` task asks
students to argue from the unit's dates, documents and records (name each one), not from scripture.
