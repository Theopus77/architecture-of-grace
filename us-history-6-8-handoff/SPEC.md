# Writing one unit of "U.S. History, Grades 6–8" — Architecture of Grace

You are writing the content for ONE unit of a free online U.S. history course for junior-high students
(grades 6–8) in Illinois. The course is built by a special-education teacher; many readers are
students with IEPs, English learners, or reading below grade level. Content goes into JSON files that
a build script turns into web pages. Folder: /tmp/claude-0/-home-claude/e1d39295-aa46-5e5b-94d9-d51de51a280f/scratchpad/ush/
Your unit's chapters, years, suggested topics and chapter story are in `outline.py` in that folder.

## Voice and level
- Grade 6–8 reading level. Short, clear sentences (average under 17 words). Concrete, vivid, human.
  Explain every hard word the first time. Active voice. No filler, no "In this lesson we will".
- Tell history as a story with real people, places and dates, including the people often left out
  (Native nations, enslaved and free African Americans, women, immigrants, Latino and Asian Americans).
  Where relevant, connect to Illinois and Chicago — but only with facts you are sure of.
- Honest about hard history (slavery, removal, violence, discrimination) but age-appropriate:
  no graphic detail. Say what happened and why it matters.
- Neutral and fair on political questions. For recent history (after 1990), be strictly factual,
  describe what supporters and critics argued, never take a side.
- Write EVERYTHING in your own words. This course follows the general arc of a standard U.S. history
  textbook, but you must NOT imitate any textbook's wording, feature names or titles. Invent your own
  section and lesson titles (short, 2–6 words, clear, not cute).
- American spelling. Plain text only — no HTML, no markdown except: in `reading` paragraphs you MAY mark
  a key word with *asterisks* the first time it appears (only words that are also in that lesson's `words`).

## Accuracy — this is the most important rule
- Use only well-established facts: dates, names, numbers you are confident of. If unsure of a detail,
  leave it out or say it more generally. A wrong date is worse than no date.
- Quoted primary sources (`look.type = "source"` with `"paraphrase": false`) must be public domain
  (before 1929, or U.S. federal government work like presidential speeches, laws, court opinions)
  AND you must be certain of the exact wording. Keep quotes short (under 70 words). You may shorten
  with "…". If you are not 100% sure of the exact words, set `"paraphrase": true` and write a clear
  modern paraphrase, and the cite says "(paraphrased)". Never invent a quote. Never attribute words to
  a person they did not say or write.
- `data` looks use only standard, widely published rounded figures (census counts, well-known
  statistics). Cite the general source (e.g. "U.S. Census Bureau, rounded"). If unsure, use `think`.

## Files you write
1. `ch<N>.json` — one file per chapter of your unit (N = chapter number from outline.py). Write each
   chapter file with the Write tool as soon as it is done (one chapter per Write call).
2. `u<n>_head.json` — the unit's intro, big question, timeline and wrap-up (no chapters).
3. Then run: `cd <folder> && python3 assemble.py <n>` — it builds `u<n>.json` and validates it.
   Fix every problem it reports (edit the chapter files, re-run) until it prints OK.

### ch<N>.json
```
{
 "n": 3, "title": "The Thirteen Colonies", "years": "1585–1732",
 "bigQuestion": "One open question the whole chapter helps answer (ends with ?)",
 "story": {                              // a narrative opener, 4–6 paragraphs, 200–900 chars each
   "title": "…", "kicker": "one-sentence teaser",
   "paragraphs": ["…", "…", "…", "…"],
   "think": "one question for students to discuss after the story"
 },
 "sections": [                           // 3–4 sections
   {"title": "…", "lessons": [           // 2–4 lessons per section; aim for 10–12 lessons per chapter
     {
      "title": "…",
      "mainIdea": "One sentence: the single thing to remember (30–220 chars).",
      "reading": ["p1", "p2", "p3"],     // 3–4 paragraphs, 180–800 chars each
      "words": [{"w": "charter", "d": "a written document that gives permission to start a colony"}],  // 2–5
      "look": { … see below … },
      "check": [ {"q": "…", "choices": ["…","…","…","…"], "a": 2, "why": "why the answer is right"} ]  // exactly 3
     }
   ]}
 ],
 "review": [ 8 multiple-choice questions on the whole chapter, same shape as check ]
}
```
`look` is one of:
- `{"type":"source","title":"…","text":"the quote or paraphrase","cite":"who, what, year","paraphrase":false,"prompt":"a question about it"}`
- `{"type":"data","title":"…","rows":[["1790",3.9],["1800",5.3]],"unit":"million people","cite":"…","prompt":"a question about the numbers"}` (3–8 rows)
- `{"type":"think","title":"…","text":"a short scenario or perspective to consider (60–600 chars)","prompt":"a question"}`
Mix them across the chapter: roughly 4+ sources, 1–3 data, the rest think.

Questions: 4 choices, one clearly right answer, wrong choices plausible but clearly wrong to a student
who read the lesson. Mix recall and reasoning (cause/effect, why, compare). No "all of the above",
no trick wording. Spread the right answer evenly over positions 0–3 (the validator checks ~25% each).
`why` explains in one or two sentences.

### u<n>_head.json
```
{
 "intro": ["2–3 paragraphs (200–900 chars) that open the unit: why this era matters, what changes"],
 "bigQuestion": "the unit's essential question",
 "timeline": [ {"y": "1607", "t": "English colonists found Jamestown in Virginia"} ],   // 8–12, in order
 "wrap": {
   "words": [ 12 key terms across the unit, {"w","d"} ],
   "test": [ 15 multiple-choice questions across the whole unit ],
   "write": {"prompt": "an argument or explanation task using evidence from the unit",
             "tips": ["3–5 short tips: claim, evidence to use, etc."]}
 }
}
```

When done, reply with ONLY: the validator's OK line, and a list of any facts you were unsure about
and left out or softened (one line each), and any quote you set to paraphrase.
