# HANDOFF — an Adult band for every course (2026-10-11)

Jimmy: "I think an adult course is needed for all the curriculum. Could you write a handoff so it will be fluid and
easy to implement when I have another session create it."

**Whatever Jimmy says overrides this file.** Where he is silent, this file decides.

Skateboarding (`_work/skt`, built 2026-10-11) is the first course with an Adult band and is the **model to copy**.
Everything below was done once for it and works. This file turns that into a repeatable recipe for the other courses.

---

## 0. Before you start

1. **The Skateboarding branch must be on `main` first.** It carries the engine changes every course needs:
   Adult support in `make_hubs.py` (band names, the band picker, the "bands" count, the Practice-every-day grade),
   `plumb_adult.py`, the `"ad"` level in `_work/skt/validate.py`, and the `head_of()` fix for new hubs. Run
   `git log --oneline main | grep -i skateboarding`. If nothing comes back, ask Jimmy to merge the Skateboarding PR
   (or merge `origin/claude/skateboarding` into your branch) before you touch anything.
2. Read `/CLAUDE.md` (the standing rules: readable text, calm pages, plain words, drop-downs, cache bump),
   `_work/course/HANDOFF.md` (the course recipe), and the Skateboarding files you will copy from:
   `_work/skt/SPEC.md` (the `ad` row and the Adult voice), `_work/skt/outline.py` (units 16–18),
   `_work/skt/build_skt.py` (`BAND_ES`, `desc_lead`).
3. **Ask Jimmy these, then go.** The defaults hold if he doesn't say:

   | Question | Default |
   | --- | --- |
   | How many Adult units per course? | **3 units, 2 chapters each** (6 chapters, about 66 lessons), the same as Skateboarding |
   | Which courses, in what order? | All 22 in the order of §5, one course per PR |
   | U.S. History 6–8 (`ush`)? It has no bands at all. | **Leave it out.** It is a grades 6–8 course; adults use Social Studies' Adult band |
   | Word Foundry's Daily Practice? | Leave it out. It runs by class unit, not by grade |
   | Daily Practice Adult banks? | **Nothing to do.** Every subject except Word Foundry already has an `adult` bank |

Daily Practice already has Adult. This job is the **courses**: new units, pages, hubs and drawings.

---

## 1. What "Adult" means on this site

- Grown-ups learning at home, in a community or adult-education class (adult basic education, GED/HiSET
  preparation, English learners, parents learning beside their children, people returning to a subject).
- **Reading rules are the 11–12 rules** (the `ad` row below). The voice is respectful and direct, never childish:
  real-life situations (work, money, family, health care, civic life, the news), with the learner's own experience
  as a starting point.
- Each course's own rules still hold in its Adult units. Faith courses study and never preach. Medicine & Health
  is never medical advice. Sports History and The Measured Step teach history only. Secret Societies tests claims
  against records.
- Plain words and neuro-affirming language, the same as everywhere (CLAUDE.md).
- Don't confuse this with the **Adult Edition** (`/adult`, Book 6, the SEL manual). That is a separate book. A
  course's Adult band lives on the course's own hub at `#adult` (for example `/math#adult`), never at `/adult`.

---

## 2. The recipe, per course (`<id>` = the course id, for example `mth`)

Work on the session's own branch. One course per PR is easiest for Jimmy to review.

### 2.1 Outline: `_work/<id>/outline.py`
- Add the band last in `BANDS`:
  `dict(id="adult", title="Adult", level="ad"),`
- **Append** 3 units. Never renumber existing units or chapters: live links, saved progress and the Sheet depend on
  them. Find the next numbers with:
  ```
  cd aog-deploy/_work/<id> && python3 -c "import outline as o; print('next unit', o.UNITS[-1]['n']+1, '· next chapter', max(c['n'] for u in o.UNITS for c in u['chapters'])+1)"
  ```
- Each new unit: `band="adult"`, `title`, `strand`, and two chapters with `n`, `title`, `strand`, `topics` (specific
  and factual: these steer the writer) and `story` (a real-feeling adult scene). §5 has starting ideas.
- Add `LINKS` for the new units. Use the course's existing practice rooms and `/drops/<subject>/adult`.

### 2.2 Validator: `_work/<id>/validate.py`
Add the Adult level right after the `hs2` line (all 22 validators have that exact line):
```
cd aog-deploy/_work/<id> && python3 - <<'EOF'
p='validate.py'; s=open(p).read()
a=' "hs2": dict(read=(3,4), para=(250,900), words=(3,6), choices=4, story=(4,6), sp=(200,900), intro=(200,900), main=220, review=8, test=15, wwords=12),\n'
assert a in s and '"ad"' not in s
s=s.replace(a, a+a.replace('"hs2"', ' "ad"').replace('  "ad"', ' "ad"')); open(p,'w').write(s)
EOF
grep -n '"ad"' validate.py
```

### 2.3 Writer contract: `_work/<id>/SPEC.md`
- Add the row under the `hs2` row of the LEVEL table:
  `| ad    | Adult | 3–4                | 250–900             | ≤ 22 words   | 3–6              | 4                    |`
- Change "6–8, 9–10, 11–12: story paragraphs 200–900" to "6–8, 9–10, 11–12, Adult: …".
- Add one paragraph on the Adult voice (copy §1 above, plus the course's own adult focus from §5).
- Keep everything else word for word. The validator and the writers depend on it.

### 2.4 Build script: `_work/<id>/build_<id>.py` (and `plumb_<id>.py` if it has `BAND_ES`)
- `BAND_ES` gets `"adult": "Adultos"`.
- `title`, `contents_desc`, `foot` and `teach` say "K–12 and Adult" where they say "K–12". Add one sentence to
  `teach` on what the Adult band covers.
- `desc_lead`: copy Skateboarding's form, so an Adult unit reads "…, for adults" and not "…, adult".
  ```
  desc_lead=lambda u: "<Course>, %s" % (BAND_TITLE.get(u.get("band"), "K–12").lower() if u.get("band") != "adult" else "for adults"),
  ```

### 2.5 Write the units: one agent per unit, in parallel
Give each writer the prompt in §3.1 (up to about 20 at once; relaunch any that stop, using `_work/RESUME_NOTE.txt`).
When they hand back, run both gates yourself on each new unit:
```
cd aog-deploy/_work/<id> && python3 assemble.py <n> && python3 ../course/quality_check.py <n>
```

### 2.6 Review: do not skip this
Send one reviewer per course (prompt in §3.2). On Skateboarding the gates passed every unit, yet the reviewers still
found **24 real errors**: 21 in the 377 lessons and 3 in the 500 practice items. Among them: a physics misconception, two definitions
of one term that contradicted each other, an unsafe practice spot, a podium that mixed two events, and a wrong decade.
Apply every fix with an exact-match replace (assert the old text is there), then re-run both gates.

### 2.7 Build and plumb
From `aog-deploy/`:
```
sh _work/course/run_course.sh <id>           # groups → build → jump menus (adds "<Course> · Adult") → plumb
python3 _work/course/plumb_adult.py <id> --dry
python3 _work/course/plumb_adult.py <id>      # new units: short links, sw.js precache + one CACHE bump, sitemap
```
`plumb_<id>.py` stops early on a course that is already live, which is why `plumb_adult.py` exists. It fills in only
what is missing and can be run any number of times. (A dry run on Science shows `sci-u28.html` was never precached;
running it on `sci` fixes that too.)

### 2.8 The hub
In `_work/course/make_hubs.py`, find the course's entry in `COURSES`:
- `kicker`: "A course of study · K–12 and Adult" / "Un curso de estudio · K–12 y adultos"
- `lede`: add "and adults" plainly
- `hints`: add `"adult": ("…", "…")`, one short line saying what the band covers (if the course uses `hints`)
- Practice rooms named in the new `LINKS` must be in `EXPLORE`, or they won't show. Add any missing.

Then:
```
python3 _work/course/make_hubs.py doors <id> && python3 _work/course/make_hubs.py check
```
Courses still on the old SS-style hubs (`cards="ss"`) build the same way.

### 2.9 Pencil drawings for the new units
Two illustrator agents at most (the machine has 4 cores; render one at a time each). Use
`_work/art/pencil/BATCH_PROMPT.txt` with the new unit ids and batch name `<id>Adult`. Rules: objects only, no
people or faces, no logos or flags, no fake readable text, each drawing distinct from its neighbours. Then:
```
python3 - <<'EOF'   # merge the batch's alt texts into banners.json (keeps the file's format; run from aog-deploy/_work/art)
import json; raw=open('banners.json').read(); d=json.loads(raw)
for k,v in json.load(open('pencil/alt_<id>Adult.json')).items(): d.setdefault(k,{})['pencil_alt']=v
open('banners.json','w').write(json.dumps(d,indent=1,ensure_ascii=False)+("\n" if raw.endswith("\n") else ""))
EOF
cd aog-deploy && python3 _work/art/apply_banners.py --style pencil --only <id> && python3 _work/course/make_hubs.py doors <id>
python3 _work/art/sketchicons/shortmap.py
```

### 2.10 Standards and the dashboard
- `_work/standards/<id>.json`: add a `{"n": <unit>, "standards": [...]}` entry per new unit. Use the course
  framework's **high-school codes as the reference point**, copying exact code and text from units already in that
  file, and say so in the framework `note` ("The Adult units use the high-school codes as a reference point").
  Never invent a code.
- Then: `python3 _work/standards/export_outlines.py && python3 _work/standards/build_standards.py && python3 _work/course/dash_catalog.py`

### 2.11 The front page and the site bar (once per batch of courses, not per course)
- `index.html`, `#aogdnList-courses`: each course lists its bands. Add an Adult link after "Grades 11–12"
  (`/math#adult`, words "Adult" / "Adultos"), and change "All five bands · the whole map" to
  **"Every band · the whole map"** / "Todas las bandas · el mapa completo". There are 12 of these on the front page.
- `aog-topbar.js`, `var EX` (around line 334, a hand copy of the front-page doors): the same edits. There are 6 there.
  The same courses there still say "Daily Drafts · every day"; change those to "Daily Practice · every day" /
  "Práctica diaria · cada día" while you are in that line (CLAUDE.md: Daily Practice).
- Then: `python3 _work/home/make_door_pages.py` (rebuilds `/courses`) and `python3 tools/build-fast.py`.

---

## 3. Prompts to paste

### 3.1 Writer (one per unit)
> You are writing ONE unit of a course for Architecture of Grace. FOLDER = /home/user/architecture-of-grace/aog-deploy/_work/<id>   UNIT_N = <n>
> 1. Read FOLDER/SPEC.md completely (the contract: voice, the LEVEL table, accuracy, the JSON shapes). Your unit is in
>    the Adult band (level `ad`): write for grown-ups, respectful and direct, never childish, about real adult life,
>    with the 11–12 reading rules. Then find unit n=UNIT_N in FOLDER/outline.py (its chapters, topics and story hooks).
>    Read /home/user/architecture-of-grace/aog-deploy/_work/skt/ch33.json for an Adult chapter's feel, and one
>    finished 11–12 chapter of this course for its own voice.
> 2. Write FOLDER/ch<N>.json for each chapter of your unit, one file at a time, covering the outline's topics in order.
> 3. Write FOLDER/u<UNIT_N>_head.json per SPEC.
> 4. Run: cd FOLDER && python3 assemble.py UNIT_N and python3 ../course/quality_check.py UNIT_N. Fix and re-run until
>    both print OK. Do not edit assemble.py, validate.py, outline.py, SPEC.md or any other unit's files.
> 5. Reply with ONLY: the two OK lines, then one line per fact you were unsure of and left out or softened, and any
>    quote set to paraphrase.
> Quality bar: every lesson teaches something specific and true, with a concrete example; its three checks are
> answerable from its reading; worked numbers show their arithmetic and are correct. Original text only.

### 3.2 Reviewer (one per course, after the writers)
> You are the reviewing editor for the new Adult units of a course on the Architecture of Grace site. Folder:
> /home/user/architecture-of-grace/aog-deploy/_work/<id> . Read SPEC.md and outline.py, then read the new units
> u<a>.json … u<c>.json completely. Do NOT edit any file. Report problems only: file (chN.json), lesson or question,
> the exact wrong text (short quote), why it is wrong, and the exact replacement. In priority order: (1) wrong facts,
> numbers or arithmetic (recompute every number), wrong answer keys, a "wrong" choice that is also right; (2) anything
> that breaks the course's own rules (preaching in a faith course, medical advice, technique in a history-only book,
> an unattributed belief) or is unsafe; (3) history or names that contradict SPEC or are uncertain but stated as fact,
> an exact quotation that is not exact, a source or standard that does not exist; (4) a check not answerable from its
> lesson; (5) a term defined two different ways; (6) anything childish for adults, or not neuro-affirming. Skip style.
> Reply with the list only, or "unit N: clean".

---

## 4. Before every push (per course)
```
cd aog-deploy/_work/<id> && for n in <new units>; do python3 assemble.py $n; python3 ../course/quality_check.py $n; done
cd /home/user/architecture-of-grace
node tools/check-contrast.js <hub> <contents page> <the new unit pages>
node tools/check-calm.js     <hub> <contents page> <the new unit pages>
# after §2.11 (index.html, aog-topbar.js are shared): run both on every page
node tools/check-contrast.js && node tools/check-calm.js
python3 aog-deploy/_work/course/make_hubs.py check
```
Look at the hub's Adult band and one Adult unit at iPhone (390), iPad (820) and computer width. Deploy only when Jimmy
says ("Deploy", "Send it"): a PR from the branch to `main`, then a merge.

---

## 5. The courses and starting ideas for their Adult units

Every course has 5 bands today (`k-2` … `11-12`). The table shows the next free unit and chapter numbers. Unit ideas
are a starting point for `outline.py`, not final titles: check them against the course's 11–12 units so nothing
repeats, and **link, don't copy** (civics lives in Social Studies, personal finance in Economics, health care in
Medicine & Health).

Suggested order: the core subjects first, since adult learners need them most, then the rest.

| # | Course (id · hub) | Next unit · chapter | Adult units (3) — ideas |
| --- | --- | --- | --- |
| 1 | Math (`mth` · /math) | 28 · 63 | Money math for real life (budgets, interest, loans, unit price) · Measuring for home and work (units, scale drawings, area and volume for projects) · Numbers in the news (percent change, rates, graphs that mislead, risk) |
| 2 | English (`ela` · /english) | 25 · 56 | Reading for life (forms, leases, letters from school, the news) · Writing at work (emails, résumés, cover letters, clear reports) · A book club for adults (a short novel or memoir, discussion and a response essay) |
| 3 | Science (`sci` · /science) | 29 · 65 | Science in the news (how studies work, evidence, claims) · Energy at home (electricity, heating, bills, efficiency) · Weather, climate and hazards (forecasts, preparing a household) |
| 4 | Social Studies (`ss` · /social) | 25 · 56 | Civic life (voting, local government, jury duty, public meetings) · Rights in everyday life (work, housing, school; where to get help) · Media literacy (sources, ads, checking a claim) |
| 5 | Spanish (`spa` · /spanish) | 21 · 41 | Spanish for daily life (greetings, family, shopping, directions) · Spanish at work and in the community (health visits, school, service jobs) · Conversation and culture (travel, music, film, news in Spanish) |
| 6 | Economics (`eco` · /economics) | 19 · 37 | Personal finance (credit, debt, saving, retirement accounts) · Work and pay (pay stubs, benefits, taxes, the job market) · The economy in your life (inflation, interest rates, housing) |
| 7 | FACS (`fcs` · /facs) | 21 · 41 | Living on your own (housing, budgeting, cleaning, repairs) · Feeding a household (planning, food safety, cooking on a budget) · Caring for others (young children, aging parents, balancing work and home) |
| 8 | Medicine & Health (`med` · /medicine-health) | 18 · 35 | Using health care (insurance words, appointments, questions to ask; never advice) · Staying well through adulthood (screenings, sleep, movement, stress) · Health for a family (medicines safely, first aid, reliable sources) |
| 9 | World Cultures (`wcs` · /world-cultures) | 18 · 35 | Neighbors from everywhere (immigration stories, languages, foods) · Respect across cultures (customs, holidays, workplace) · Global issues (migration, trade, the environment) |
| 10 | World Religions (`rel` · /religions) | 25 · 49 | Religion in public life (holidays at work, law, accommodation) · Interfaith neighbors (visiting a place of worship respectfully) · Capstone: one question, many traditions |
| 11 | The Bible (`bib` · /bible) | 19 · 37 | Reading the Bible as an adult (translations, study tools, genres) · The Bible in art, law, literature and music · Capstone: a study project from the text |
| 12 | The Hebrew Bible (`heb`) | 18 · 35 | Reading the Tanakh as an adult (translations, commentary traditions) · The Tanakh in culture and law · Capstone study project |
| 13 | The Qur'an (`qur`) | 18 · 35 | Reading the Qur'an in translation (how translations differ, tafsir) · The Qur'an in art, calligraphy and daily life · Capstone study project |
| 14 | Talmud Study (`tal`) | 18 · 35 | How to study a page (the layout, a study partner) · Talmudic reasoning in ethics and law · Capstone: follow one argument |
| 15 | Hindu Texts (`hin`) | 18 · 35 | Reading the Gita and the epics as an adult · The texts in art, festivals and public life · Capstone study project |
| 16 | Buddhist Texts (`bud`) | 18 · 35 | Reading the suttas as an adult (translations, schools) · The texts in modern life (described, never led) · Capstone study project |
| 17 | Chinese Classics (`chn`) | 18 · 35 | Reading the Analects and the Daodejing as an adult · The classics in business, art and modern China · Capstone study project |
| 18 | Sports History (`spt` · /sports) | 18 · 35 | Community sport (recreation leagues, masters athletes, park districts) · Stadiums, money and the public (bonds, taxes, votes) · Capstone (history only, never technique) |
| 19 | The Measured Step (`mar` · /martial-arts) | 18 · 35 | Adults on the mat: the history of adult clubs and schools · Martial arts as institutions (federations, ranks, the Olympics) · Capstone (history only) |
| 20 | The Unseen Realm (`unr`) | 18 · 35 | Reading the ancient documents as an adult (translations, editions) · How scholars disagree (names each scholar's view) · Capstone |
| 21 | Secret Societies (`sec`) | 18 · 35 | Records an adult can search (archives, court records, lodge histories) · Testing a viral claim · Capstone |
| — | U.S. History 6–8 (`ush`) | — | Left out by default (§0). If Jimmy wants it, it first needs `BANDS` like every other course |
| ✓ | Skateboarding (`skt`) | done | The model: units 16–18 |

---

## 6. Things learned on Skateboarding (save yourself the trouble)

- A course's "bands" count, band names and Practice grade map live in `make_hubs.py`. They are generic since
  Skateboarding: nothing to change there per course.
- The hub's footer says "We describe what people believe; we never tell anyone what to believe" on every course
  except Economics and Skateboarding (`FOOT2` in `make_hubs.py`). Leave it as it is for the faith and history courses.
- The first Adult unit's spiral review is empty (no earlier Adult unit). That is expected; the engine leaves it out.
- `run_course.sh` re-runs every course's jump injector over ~650 pages. That's normal; it only adds what is missing.
- Rewriting a JSON file with a different indent turns a 1-line change into a 200-line diff. Insert lines in the file's
  own format (as §2.9 does) and check `git diff --stat`.
- The writer agents mark example numbers as examples and leave out facts they are unsure of. Their reply lists those;
  read it. The reviewer still finds what the writer didn't know it got wrong.
