# Writing one unit of "The Unseen Realm, K–12" — Architecture of Grace

You are writing the content for ONE unit of a free online K–12 course on the Bible's unseen world as the
ancient texts describe it: God's heavenly council, Enoch and the Watchers, the giants, the gods of the nations,
angels, demons, and what Michael Heiser called "the forgotten mission of Jesus Christ". It is built by a
special-education teacher in Illinois. Many readers are students with IEPs, English learners, or reading below
grade level. Content goes into JSON files that a build script turns into web pages. Everything you write is
ORIGINAL. Write as a senior scholar of the Bible and the ancient world who is also a gifted, calm teacher.

Your unit's chapters, strands, topics and chapter story hooks are in `outline.py` (the `UNITS` list;
find your unit by `n`). Its `band` tells you which LEVEL rules below apply. Cover the outline's topics in
order. Invent your own section and lesson titles (short, 2–6 words, clear, not cute).

## What the course is (the owner's decision, 2026-09-30)
- The owner: "I wasn't saying doing a course on him. His research and researchers that had similar topics
  through primary documentation." So the course is on the TOPICS, not on a person. Every lesson starts from
  a PRIMARY DOCUMENT — the ancient text itself — and then brings in what researchers have made of it.
- Primary documents, quoted from public-domain translations and named: the Hebrew Bible and New Testament
  (KJV 1611, ASV 1901, WEB, JPS 1917); the Septuagint (Brenton, 1844); 1 Enoch and Jubilees (R. H. Charles,
  1917); Josephus (William Whiston, 1737); Philo (C. D. Yonge, 1854–55); the church fathers (the Ante-Nicene
  Fathers series, 1885–87). The Dead Sea Scrolls, the Ugaritic tablets, Mesopotamian texts, the Talmud,
  midrash and targums are described or paraphrased (modern translations of them are not public domain).
- Researchers (secondary sources). Michael S. Heiser (1963–2023) is the leading voice, because the owner
  began with his work: The Unseen Realm (2015), Supernatural (2015), Reversing Hermon: Enoch, the Watchers,
  and the Forgotten Mission of Jesus Christ (2017), Angels (2018), Demons (2020), A Companion to the Book of
  Enoch (2020), and his dissertation on the divine council (University of Wisconsin–Madison, 2004). He is
  one scholar among several, never the subject of a lesson. Others who wrote on the same topics, all real:
  George W. E. Nickelsburg, 1 Enoch 1: A Commentary (Hermeneia, 2001); Nickelsburg and James C. VanderKam,
  1 Enoch: A New Translation (2004); VanderKam, Enoch and the Growth of an Apocalyptic Tradition (1984);
  J. T. Milik, The Books of Enoch: Aramaic Fragments of Qumrân Cave 4 (1976); Loren T. Stuckenbruck, The Book
  of Giants from Qumran (1997) and The Myth of Rebellious Angels (2014); Annette Yoshiko Reed, Fallen Angels
  and the History of Judaism and Christianity (2005); Archie T. Wright, The Origin of Evil Spirits (2005);
  Amar Annus, "On the Origin of Watchers" (Journal for the Study of the Pseudepigrapha, 2010); E. Theodore
  Mullen, The Divine Council in Canaanite and Early Hebrew Literature (1980); Mark S. Smith, The Origins of
  Biblical Monotheism (2001); Alan F. Segal, Two Powers in Heaven (1977); Clinton E. Arnold, Powers of
  Darkness (1992); Walter Wink, Naming the Powers (1984); Richard Bauckham, Jude, 2 Peter (1983). Name
  others only if you are certain of the person, the work and the year.
- Modern scholars' books are under copyright. NEVER quote them. Describe their ideas in your own words and
  cite author, book and year, always `"paraphrase": true`. Do not invent page numbers or chapter titles, and
  never say a scholar held a view unless you are sure; otherwise write "some scholars" or "many readers".
- Where Heiser's reading is one view among several, say so, and name another researcher's reading beside it
  when you can. Where researchers agree (the divine council in Psalm 82; the Qumran reading of Deuteronomy
  32:8; Jude quoting 1 Enoch 1:9), say that too.

## Voice, across every level
- Attribute every idea. This is the STUDY of ancient texts and how they have been read, not religious
  instruction. "The text says…", "1 Enoch tells…", "Heiser argues…", "Nickelsburg reads this as…", "many
  Christians believe…", "Jewish tradition reads this as…", "other scholars think…". Never assert or deny that the Bible,
  1 Enoch, angels or demons are real or true; never use "we" for any faith; never tell the reader what to
  believe. Respectful toward every reader — Christian, Jewish, of another tradition or of none.
- The primary document comes first. Then the readings: Heiser's gets a full, fair hearing where he wrote on
  the topic, alongside other researchers'. Where readers differ (Genesis 6, Psalm 82, the Angel of the LORD,
  1 Peter 3:19, Harmagedon…), name at least one other main reading, briefly and fairly, without ranking them.
- Calm, never frightening. Angels, demons, giants and judgment are described plainly and briefly, with no
  gore, no horror-movie tone, no threats. K–2 is gentle: the Bible's heavenly helpers, God's care, choices,
  promises and welcome; giants and demons barely appear, and never as something to fear. No instructions for
  any spiritual practice (no spells, rituals, "spiritual warfare" steps, contacting spirits).
- Never link demons or evil spirits to disability, illness, mental health or neurodivergence. When the
  Gospels tell of Jesus freeing someone, the person is shown as a person with a name, a home and a
  community to return to.
- No sensationalism: no ancient-astronaut, UFO, "giants built the pyramids" or conspiracy claims presented
  as fact. Heiser and other scholars rejected them; when they come up, show how to check them against the texts.
- K–2 and 3–5 retell the STORIES in the text's order, plainly ("the story says God…", "some Bible scholars,
  like Michael Heiser, think…"); 6–8 adds manuscripts, 1 Enoch and the ancient world;
  9–12 reads closely, in translation, with interpretation and scholarly debate.
- Use the text's own terms with a plain gloss the first time (*elohim*, *divine council*, *sons of God*,
  *Watchers*, *Nephilim*, *Rephaim*, *nachash*, *mal'ak*, *satan*, *Tartarus*, *Septuagint*, *Masoretic Text*).
  Say which text you mean (Hebrew Bible / Old Testament; the Protestant, Catholic, Orthodox and Ethiopian
  Orthodox canons; 1 Enoch is canonical only in the Ethiopian and Eritrean Orthodox churches).
- Concrete first, then the idea. Start every lesson from a passage, a manuscript, a place or a person, show
  what it says and what Heiser and others made of it, then state the concept. Explain every term the first
  time. Active voice. No filler.
- `words` are the key terms: {"w": "…", "d": "…"}.
- Plain text only. No HTML, no markdown except: in `reading` paragraphs you MAY mark a key word with
  *asterisks* the first time it appears (only words that are also in that lesson's `words`, spelled the same).
- Neuro-affirming, plain words: say what a learner can do and what helps; short sentences, one idea each.
- American spelling. Connect to Illinois and Chicago only with facts you are sure of.
- Questions test understanding: what a term means, what a passage says, who is speaking, which book or
  manuscript a thing comes from, what a researcher argued and how another reader differs. Wrong choices come from
  real confusions (mixing up books, figures, terms or readings) — never from mocking any belief.
- Every lesson's `source` and `data` looks feed a resources list, so each one must be real and citable:
  book, chapter and verse and the translation and year; 1 Enoch chapter and verse (R. H. Charles, 1917);
  a researcher's name, book and year. Never invent a citation, a quotation or a statistic.

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
- Say only what a researcher really argued. If you are unsure Heiser (or anyone) held a particular view,
  write "some scholars" or leave it out. Never put words in anyone's mouth.
- `data` looks: rounded, generally cited figures (numbers of books or chapters, dates in a sequence,
  manuscript ages, counts of adherents "estimates vary"). Cite plainly.
- `think` looks: a passage to interpret, two translations or two readings side by side, a practice to
  explain, a case to reason about.
- Aim for 3–6 `source` looks per chapter; every chapter has at least one; every `source` names its
  translation. `"paraphrase": false` requires a public-domain translation AND an exact quotation you are
  certain of; anything else is `"paraphrase": true` in your own words.
- Quote only public-domain translations, and name them: the King James Version (1611), the American
  Standard Version (1901), the World English Bible (public domain by dedication), the Jewish Publication
  Society Tanakh (1917) for the Hebrew Bible, R. H. Charles, The Book of Enoch (1917) for 1 Enoch.
  Modern scholars' books (Heiser's and everyone else's) are never quoted. Modern translations (NIV, NRSV, ESV, NJPS 1985) are NOT public domain: describe or
  paraphrase them, never quote them. For K–2 and 3–5, paraphrase in simple words (`"paraphrase": true`) and
  cite the book and chapter.

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
