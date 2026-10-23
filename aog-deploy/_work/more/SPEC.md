# Spanish lessons and three ways in: writing one unit (AOG-MORE-V1, 2026-10-23)

Jimmy: "DO them all, start with Spanish and three ways in." "This should be showstopper for the young to the old."

Every course lesson on Architecture of Grace already has an English reading, key words, a "look" panel
and three checks. You add two things for ONE unit:

1. **Spanish for everything a learner reads** in the unit. Today the buttons switch to Spanish but the
   lessons stay English.
2. **Three ways in** to every lesson's reading: *Shorter · Just right · More*. "Just right" is the reading
   that is already there. You write the **Shorter** reading and the **More** paragraphs, in English and
   in Spanish.

Who reads this: K–12 students in Illinois public schools (and adults in the Adult band). Many have IEPs,
are English learners, or read below grade level. Spanish-speaking families read along at home.
A five-year-old and a grandparent should both feel the page was written for them.

## Where things are
- The English unit you work from: `_work/<course>/u<N>.json` (read it; never change it).
- You write into `_work/more/<course>/` (make the folder if it is missing):
  - `u<N>.head.json`: the unit's own words in Spanish (not for the Spanish course `spa`).
  - `u<N>.ch<C>.json`: one file for each chapter C of the unit (C is the chapter's `n`).
- Check your work with `python3 _work/more/validate.py <course> <N>` (run it from `aog-deploy/`).
  Fix everything it reports and run it again until it prints `OK`.

## File 1: `u<N>.head.json`
The same keys as the unit, in Spanish, same counts and the same order:
```json
{
 "title": "…", "years": "…",
 "intro": ["…", "…"],
 "bigQuestion": "…",
 "timeline": [{"t": "…"}, …],
 "wrap": {
   "words": [{"w": "…", "d": "…"}, …],
   "test": [{"q": "…", "choices": ["…", "…", "…"], "why": "…"}, …],
   "write": {"prompt": "…", "tips": ["…", …]}
 }
}
```
Leave out every timeline `y` and every `a` (answer index): they stay as in English.

## File 2: `u<N>.ch<C>.json`, one per chapter
The chapter in Spanish, mirroring the English chapter exactly (same sections, same lessons, same order),
plus the two new readings in every lesson:
```json
{
 "title": "…", "years": "…", "bigQuestion": "…",
 "story": {"title": "…", "kicker": "…", "paragraphs": ["…"], "think": "…"},
 "sections": [
  {"title": "…", "lessons": [
    {
     "title": "…", "mainIdea": "…",
     "reading": ["…", "…", "…"],
     "words": [{"w": "…", "d": "…"}],
     "look": {"title": "…", "text": "…", "prompt": "…"},
     "check": [{"q": "…", "choices": ["…", "…", "…"], "why": "…"}],
     "short": ["…"],
     "more": ["…"],
     "short_es": ["…"],
     "more_es": ["…"]
    }
  ]}
 ],
 "review": [{"q": "…", "choices": ["…"], "why": "…"}]
}
```
- `look`: give `title` and `prompt` always; `text` for a `think` or `source` look; for a `data` look give
  `unit` (if English has one) and `rows`: the row labels only, as a list of strings in the same order
  (`["Chicago", "Springfield"]`); the numbers stay as in English. Never translate `cite`.
- `short` and `more` are **English**; `short_es` and `more_es` are their Spanish versions.
- For the Spanish course (`spa`) write NO Spanish at all and no head file: each lesson carries only
  `short` and `more`, and the chapter and section keys are left out
  (`{"sections": [{"lessons": [{"short": […], "more": […]}, …]}, …]}`). That course teaches Spanish to
  English speakers; its readings already mix in Spanish words with English glosses. Keep them that way.

## Spanish: the rules
- Neutral Latin American Spanish, as a good bilingual teacher in Chicago would write it. Address the
  reader as **tú**. Warm, plain, short sentences, at the same reading level as the English.
- **Translate faithfully.** Never add, drop or change a fact, number, date, name, claim or promise.
  Keep every paragraph: the same number of paragraphs, in the same order.
- Questions: translate `q`, every choice **in the same order** (the right answer stays at the same
  place), and `why`. A wrong choice stays a believable wrong choice in Spanish.
- Key words: `words[].w` is the Spanish term and `d` its plain Spanish meaning. In the Spanish `reading`,
  mark each key word with *asterisks* the first time it appears, spelled as its `w` (a plural or
  feminine form that contains it is fine). Mark the same key words the English marks, no others.
- Names: use the usual Spanish form where there is one (Estados Unidos, Londres, Cristóbal Colón, Jesús,
  Moisés, el Corán, Confucio); otherwise keep the name as it is.
- Quotations in a `source` look: translate the meaning plainly. Never invent wording. The page marks it
  as a translation, so do not add "(traducido)".
- Math, science and money: numbers, symbols, units and formulas stay exactly as in English (no turning
  miles into kilometers). Use the decimal point as in English (3.5, not 3,5), so the numbers match.
- Faith courses: neutral and descriptive, as the English is ("los creyentes…", "según la tradición…").
  Standard Spanish names for books and figures (Génesis, Éxodo, los Evangelios, la Torá, el Talmud,
  el Bhagavad Gita, Buda).
- Plain text only. No HTML, no markdown except *asterisks* for key words in readings.

## Three ways in: the rules (English, then the same in Spanish)
**Shorter** (`short`) is the same lesson in fewer words, for a learner who wants less to read.
- 1 paragraph, or 2 if the lesson really needs it (never more than the original has).
- About half as long: **40–65 %** of the original reading's characters, all paragraphs counted together.
- Shorter, simpler sentences than the original. One idea each. Start from the same person, place or
  example the original starts from.
- It MUST still hold every fact needed to answer the lesson's **three checks** and the main idea.
  Read the checks before you write it. A learner who reads only Shorter can answer all three.
- Mark every key word the original marks, with *asterisks*, the first time it appears.
- Never babyish. Shorter means clearer, not childish: in an adult or high-school lesson it reads like a
  good summary for a busy adult.

**More** (`more`) is for a learner who wants more. It is shown AFTER the original reading, so write only
the extra: **1 or 2 new paragraphs** (together **25–80 %** of the original's characters).
- Add one more true thing: a further detail, a second example, a connection to everyday life, a
  "here is how we know", a person's story. Textbook-certain facts only. Never invent a quote, a number,
  a date or a source; if you are not sure of a detail, choose a different one.
- Same voice and the same reading level as the original. More means more to think about, not harder
  words. Explain any new term in the sentence where it appears (no new *asterisk* words).
- It must not repeat the original, contradict it, or answer the checks for the learner.
- Each paragraph stays inside the length the band allows (see below).

`short_es` and `more_es`: your Shorter and More, in Spanish, by the Spanish rules above (same number of
paragraphs as your English `short` and `more`).

## Reading level by band (from the unit's `band`)
| band   | sentences, on average | one paragraph (characters) |
|--------|-----------------------|----------------------------|
| k-2    | 5–9 words             | 60–300                     |
| 3-5    | 8–13 words            | 100–550                    |
| 6-8    | 10–17 words           | 140–850                    |
| 9-10   | 12–20 words           | 180–950                    |
| 11-12  | 12–22 words           | 180–950                    |
| adult  | 12–22 words           | 180–950                    |
In K–2, Shorter can be two or three very short sentences. In the Adult band, write for grown-ups:
respectful, never childish.

## Voice, always (the site's standing rules)
- Neuro-affirming: describe what a learner can do and what helps; never deficit labels.
- Calm and warm, like a good teacher talking. No exclamation-mark hype.
- Balanced and fair, as the English is. You keep its stance; you never add an opinion.
- No stereotypes. Respectful of every culture and faith.

## How to work
1. Read this file, then `_work/<course>/u<N>.json`.
2. Write `u<N>.head.json` (skip for `spa`), then one chapter file at a time.
3. After each chapter, run `python3 _work/more/validate.py <course> <N>`. It also tells you which
   chapter files are still missing. Fix what it reports before going on.
4. Finish when it prints `OK`. Reply with one line: `<course> u<N> OK` and the counts it printed.
Do not touch any other file. Do not run git.
