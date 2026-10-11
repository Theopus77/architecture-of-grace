# Writing one unit of "Skateboarding: History, Tricks and the Science of Balance" — Architecture of Grace

You are writing the content for ONE unit of a free online course, K–12 and Adult, on skateboarding: its
history (people, places, boards, wheels, parks, videos, contests, the Olympics), HOW TO skate (pushing,
stopping, turning, dropping in, ollies, flip tricks, grinds and slides), and the SCIENCE underneath it
(forces, inertia, friction, energy, levers and torque, center of mass, rotation, materials). It is built by
a special-education teacher in Illinois for a public-school setting and for adults learning at home or in a
community class. Many readers are students with IEPs, English learners, or reading below grade level.
Content goes into JSON files that a build script turns into web pages. Everything you write is ORIGINAL.

Your unit's chapters, strands, topics and chapter story hooks are in `outline.py` (the `UNITS` list;
find your unit by `n`). Its `band` tells you which LEVEL rules below apply. Cover the outline's topics in
order across the sections and lessons. Invent your own section and lesson titles (short, 2–6 words,
clear, not cute) — never cut a title from the outline's topic list.

The quality bar is the finished Buddhist Texts course: read `../bud/ch7.json` and `../bud/ch20.json` before
you start, and match their depth — every paragraph teaches something specific and true. For a science
lesson at this site's standard, also look at `../sci/ch22.json`.

## The three threads (this course is different from Sports History)
Every unit belongs mainly to one thread (its `strand` says which), and the threads cross often: a history
lesson can explain why a new wheel made a new trick possible; a trick lesson names the physics; a science
lesson uses a real trick as its example.

1. **History.** People, places, products and dates, told concretely. Deep time first: surfers, homemade
   boards and roller-skate wheels before the famous names. Name the people who were left out and the doors
   that opened (women, skaters of color, adaptive and wheelchair skaters, skaters outside the United States),
   factually. Stories and legends ("who invented the first skateboard") are labeled as stories; no single
   inventor is documented.
2. **How to.** Unlike the site's Sports History, this course DOES teach technique, step by step, because
   the owner asked for it. Rules for every how-to lesson:
   - Safety first, every time, without lecturing: a helmet that fits and is buckled; wrist guards and pads
     for learning; flat shoes; a smooth, dry place away from cars; for K–5, a grown-up nearby. Say it once
     per lesson in a natural place, not as a list repeated word for word.
   - Progression: stationary on grass or carpet first, then rolling slowly, then faster. Small, low
     obstacles (a painted curb, a low flat bar) before anything higher. Never present stairs, handrails,
     gaps, roofs, traffic, hills with cars or "skitching" (holding onto a vehicle) as something to try.
     Advanced tricks are described for understanding and for when a learner is ready, at a skatepark.
   - Write steps a learner can follow: where each foot goes (bolts, tail, nose, toe side, heel side), what
     each foot does, in order, with what it should feel like and one or two common problems and fixes.
     Steps live in the `reading` paragraphs (use "First… Next… Then…" or numbered sentences in a paragraph)
     and often a `think` look that pictures the move.
   - Regular (left foot forward) and goofy (right foot forward) are both normal. Write directions as
     "front foot" and "back foot", never left and right.
   - Falling is part of learning: teach how to fall small (crouch low, roll, slide on knee pads, do not
     catch yourself with locked straight arms). Fear is a normal signal; break a trick into smaller steps.
3. **Science.** Real physics, correct and concrete. Start from the trick, then the idea, then (from 6–8 up)
   the number. Use SI units (meters, seconds, kilograms, newtons; g = 9.8 m/s²) and, where it helps, a
   familiar comparison. Label every coefficient of friction, hardness or speed that is not a fixed constant
   as an example or a typical range ("about", "for example"). Worked examples show each step of the
   arithmetic and are correct. Useful, correct relationships: F = ma; weight = mg; kinetic friction
   f = μN; on a level surface the slowing is μg and the slide distance is v²/(2μg); potential energy mgh
   and kinetic energy ½mv², so a frictionless drop from height h gives v = √(2gh); flight time for a jump of
   height h is 2√(2h/g) (a 0.30 m ollie gives about 0.49 s); torque = force × lever arm; centripetal
   acceleration v²/r; angular momentum L = Iω is conserved without an outside torque. K–2 and 3–5 use the
   ideas in plain words (push, pull, gravity, friction, balance, stored energy, motion energy) with no
   formulas.

## Voice, across every level
- Concrete first, then the idea. Every lesson starts from a real place, board, person, date, trick or
  measurement, shows what happens, then states the idea. Explain every term the first time. Active voice.
- **Every sentence carries a fact, an explanation or a step. No filler, no repeated stock sentences, no
  padding to reach a length.** If a paragraph is too short, add another true, specific fact or step. Do not
  reuse a sentence anywhere in the course. **Never write a lesson, paragraph or question ABOUT this
  course, the website, its drawings or this SPEC.**
- Neuro-affirming, plain words: say what a learner can do and what helps; short sentences, one idea each.
  Never mock beginners, never "kooks" or insults; no deficit labels. Encouraging, like a good coach.
- Skate words are taught as vocabulary (deck, trucks, kingpin, bushings, coping, transition, nose, tail,
  bolts, regular, goofy, fakie, switch, frontside, backside, pop, grind, slide). Slang is defined.
- Brands and companies appear only as history needs (Makaha, Hobie, Cadillac Wheels, Powell Peralta,
  Santa Cruz, Thrasher, the X Games) — never as advertising and never "the best".
- `words` are the key terms: {"w": "…", "d": "…"}.
- Plain text only. No HTML, no markdown except: in `reading` paragraphs you MAY mark a key word with
  *asterisks* the first time it appears (only words that are also in that lesson's `words`, spelled the same).
- Questions test understanding: what a term means, what happened when and why, the order of a trick's
  steps, which foot does what, what a force does, a short calculation (6–8 up). Every check is answerable
  from that lesson's reading or words. Wrong choices come from real confusions (mixing up front and back
  foot, kickflip and heelflip, potential and kinetic energy, dates and people) — never jokes.
- Illinois and Chicago only with facts you are sure of. American spelling.
- Band notes: K–2 — boards, parts, safety, balance, pushing, stopping, gravity and friction in play words;
  3–5 — the first boom and the urethane wheel, forces and energy on a ramp, first tricks (kickturn, tic-tac,
  manual, drop-in); 6–8 — pools, parks, the ollie's history and physics, ollie and flip tricks;
  9–10 — the street and video era, the X Games, grinds and friction, balance, turning and rotation;
  11–12 — public space and the Olympics, engineering of boards and ramps, advanced tricks and the science
  of practice; Adult — culture and art, who skates, starting or returning safely as an adult, and a
  capstone of measuring and community planning. Adult readers are grown-ups: respectful, direct, never
  childish, the same reading rules as 11–12.

## LEVEL rules (from your unit's band)
| level | band  | reading paragraphs | chars per paragraph | avg sentence | words per lesson | choices per question |
|-------|-------|--------------------|---------------------|--------------|------------------|----------------------|
| k2    | K–2   | 2–3                | 80–260              | ≤ 9 words    | 1–3              | 3                    |
| 35    | 3–5   | 3                  | 150–500             | ≤ 13 words   | 2–4              | 4                    |
| 68    | 6–8   | 3–4                | 180–800             | ≤ 17 words   | 2–5              | 4                    |
| hs    | 9–10  | 3–4                | 250–900             | ≤ 20 words   | 3–5              | 4                    |
| hs2   | 11–12 | 3–4                | 250–900             | ≤ 22 words   | 3–6              | 4                    |
| ad    | Adult | 3–4                | 250–900             | ≤ 22 words   | 3–6              | 4                    |
- K–2 also: story paragraphs 120–400 chars (3–4 of them); intro paragraphs 120–400; mainIdea ≤ 120 chars;
  the `look` is almost always `think` (a picture in words:
  "Look at the board on the grass…") or `data` with 3–4 simple rows.
- 3–5 also: story paragraphs 150–600; intro 150–600.
- 6–8, 9–10, 11–12, Adult: story paragraphs 200–900; intro 200–900.
- Chapters: 3–4 sections; 2–4 lessons per section. Aim: K–2 → 6–8 lessons per chapter; 3–5 → 9–11;
  6–8 and up → 10–12.
- Reviews: K–2 → 6 questions per chapter, unit test 10, wrap words 8. All other levels → 8 per chapter,
  test 15, wrap words 12.

## Accuracy — the most important rule
- Every fact — name, date, place, number — must be well established. If unsure, leave it out or say it
  generally ("in the late 1970s"). Never invent a person, date, number, quotation, record or citation.
- Facts checked for this course (use freely): sidewalk surfing in California in the late 1950s and early
  1960s; store-made boards around 1959; Makaha (Larry Stevenson, 1963) and Hobie boards in the 1960s; the
  first National Skateboard Championships, Anaheim, California, 1965, shown on ABC's Wide World of Sports;
  Patti McGee, women's national champion and on the cover of Life magazine in 1965; the first boom faded
  around 1965–66; Frank Nasworthy's urethane wheels (Cadillac Wheels) in the early 1970s; Larry Stevenson's
  kicktail patent (granted 1971); sealed precision bearings in the mid-1970s; the Zephyr team (Santa Monica
  and Venice, California, including Peggy Oki, Tony Alva, Jay Adams, Stacy Peralta) at the Del Mar
  Nationals in 1975; the California drought of 1976–77 and empty pools; Carlsbad Skatepark (California) and
  Skateboard City (Port Orange, Florida) both opened in 1976; many parks closed in the early 1980s over
  insurance costs; Alan "Ollie" Gelfand's no-hands aerial (the ollie) on transition in the late 1970s;
  Rodney Mullen's flat-ground ollie in the early 1980s and his many flat-ground tricks; Thrasher (1981);
  TransWorld SKATEboarding (1983); The Bones Brigade Video Show (Powell Peralta, 1984); Blind's Video Days
  (1991); Plan B's Questionable (1992); ESPN's Extreme Games (1995, Rhode Island), called the X Games from
  1996; Tony Hawk's 900 at the 1999 X Games in San Francisco; Tony Hawk's Pro Skater (1999); Elissa Steamer
  was the first woman in that game; Burnside skatepark, Portland, Oregon, built by skaters without
  permission under the Burnside Bridge starting in 1990, later accepted by the city; the Southbank
  undercroft, London, skated since the 1970s, kept after the Long Live Southbank campaign (agreement in
  2014); the Tony Hawk Foundation (2002), renamed The Skatepark Project (2020); Skateistan, Kabul, 2007,
  founded by Oliver Percovich; the IOC added skateboarding in 2016; Tokyo 2020 (held 2021): Yuto Horigome
  (Japan) men's street gold, Momiji Nishiya (Japan, age 13) women's street gold, Rayssa Leal (Brazil, 13)
  silver, Sakura Yosozumi (Japan) women's park gold, Sky Brown (Great Britain, 13) park bronze, Keegan
  Palmer (Australia) men's park gold; Paris 2024: Horigome and Palmer won again, Arisa Trew (Australia)
  women's park gold, Coco Yoshizawa (Japan) women's street gold; Aaron Fotheringham, wheelchair skating
  (WCMX), the first wheelchair backflip in the mid-2000s; Jim Phillips (Santa Cruz graphics) and Vernon
  Courtland Johnson (Powell Peralta graphics); decks are most often seven plies of maple; wheel hardness
  on the durometer A scale, about 78A (soft) to about 101A (hard); ABEC is a precision-tolerance standard for
  bearings, not a speed rating; the American Academy of Pediatrics advises that children under 5 should not
  ride skateboards and that children 6 to 10 should be supervised by an adult; wrist injuries are among the
  most common skateboarding injuries, and wrist guards help prevent them.
- `source` looks cite a real, named work or record: Newton, *Principia* (1687; Motte's English, 1729);
  a patent; a magazine by name and year; official Olympic results (IOC, World Skate); the American Academy of
  Pediatrics; the U.S. Consumer Product Safety Commission. **Never cite this course, its outline, its SPEC
  or "Architecture of Grace".** `"paraphrase": false` only for an exact quotation you are certain of from a
  public-domain text; otherwise `"paraphrase": true`. Never invent a quotation from a skater.
- `data` looks: real, generally cited numbers or clearly labeled worked-example numbers (years, heights,
  speeds, times, hardness), 3–8 rows, **one kind of thing in one unit per chart** (all years, or all
  meters — never mixed; no "note" rows). If the numbers are a worked example, say so in `cite`
  ("Worked example with g = 9.8 m/s²").
- `think` looks: a trick pictured step by step, a scene, two boards side by side, a force diagram in
  words, a design to reason about.
- Timelines hold real dates only (years or "c." years). In K–2, a sequence students live through
  ("Step 1" … "Step 8") is allowed; how-to units in any band may use "Step 1" … too.

## Files you write
1. `ch<N>.json` — one file per chapter of your unit (N = chapter number from outline.py). Write each with
   the Write tool as soon as it is done.
2. `u<n>_head.json` — the unit's intro, big question, timeline and wrap-up (no chapters).
3. Then run: `cd <folder> && python3 assemble.py <n>` — it builds `u<n>.json` and validates it for your
   level. Fix every problem it reports (edit the chapter files, re-run) until it prints OK. Also run
   `python3 ../course/quality_check.py <n>` and fix until it prints QUALITY OK.

### ch<N>.json
```
{
 "n": 24, "title": "…", "years": "…",     // "years" = the strand label
 "bigQuestion": "One open question the whole chapter helps answer (ends with ?)",
 "story": {                              // a narrative opener — a real-feeling scene
   "title": "…", "kicker": "one-sentence teaser",
   "paragraphs": ["…", "…", "…", "…"],   // count and length per LEVEL rules
   "think": "one question for students to discuss after the story"
 },
 "sections": [
   {"title": "…", "lessons": [
     {
      "title": "…",
      "mainIdea": "One sentence: the single thing to remember.",
      "reading": ["p1", "p2", "p3"],
      "words": [{"w": "trucks", "d": "the metal parts under the deck that hold the wheels and let the board turn"}],
      "look": { … see below … },
      "check": [ {"q": "…", "choices": ["…","…","…","…"], "a": 2, "why": "why the answer is right, with the reason"} ]  // exactly 3
     }
   ]}
 ],
 "review": [ 6 or 8 multiple-choice questions on the whole chapter, same shape as check ]
}
```
`look` is one of:
- `{"type":"think","title":"…","text":"a trick pictured, a scene, two boards side by side (60–600 chars)","prompt":"a question that asks the student to try it"}`
- `{"type":"data","title":"…","rows":[["0.10 m ollie",0.29],["0.30 m ollie",0.49],["0.50 m ollie",0.64]],"unit":"seconds in the air","cite":"Worked example with g = 9.8 m/s²","prompt":"a question about the numbers"}` (3–8 rows; numbers only in the second slot)
- `{"type":"source","title":"…","text":"the quote or paraphrase","cite":"who, what, year","paraphrase":true,"prompt":"a question about it"}`
Mix across a chapter: mostly think, 2–4 data, sources only where a real one fits.

Questions: one clearly right answer; wrong choices from specific mistakes. No "all of the above", no
trick wording. Spread the right answer evenly over the positions (the validator checks ~equal shares).
`why` names the fact, term or step in one or two sentences.

### u<n>_head.json
```
{
 "intro": ["2–3 paragraphs that open the unit: the situations, why it matters, what you will be able to do"],
 "bigQuestion": "the unit's essential question",
 "timeline": [ {"y": "1965", "t": "First national championships in Anaheim, California"} ],   // 8–12 moments, in order.
     // Keep `y` under 12 characters. Real years, or "Step 1"… for a how-to sequence.
 "wrap": {
   "words": [ 8 (K–2) or 12 key terms across the unit, {"w","d"} ],
   "test": [ 10 (K–2) or 15 multiple-choice questions across the whole unit ],
   "write": {"prompt": "a task that asks the learner to explain or argue from the unit: a history unit names dates, people and records; a how-to unit explains a trick's steps and the physics behind them; a science unit explains a worked example",
             "tips": ["3–5 short tips"]}
 }
}
```

When done, reply with ONLY: the validator's OK line, the QUALITY OK line, and a list of any facts you were
unsure about and left out or softened (one line each), and any quote you set to paraphrase.
