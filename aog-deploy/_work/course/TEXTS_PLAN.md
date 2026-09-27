# TEXTS_PLAN — three K–12 courses: Hindu Texts, Buddhist Texts, Chinese Classics (2026-09-27)

The same job RELIGION_PLAN.md did for bib / heb / qur / tal. This wave was DESIGN ONLY: every course has a complete
K–12 `outline.py` in the builder's shape, a `SPEC.md` for its writers, and the scaffold scripts `HANDOFF.md` names.
No chapters written, no HTML built, `sw.js` / `_redirects` / `sitemap.xml` untouched, nothing committed.

Stance, all three: neutral, descriptive, academic — studied, never preached. "Hindus believe…", "Buddhists believe…",
"Confucius taught…", "adherents believe…", "the Gita says…". Deities and the Buddha are always described with the
respect their devotees give them, never demeaned; meditation and worship are described, never led; living practice
(temples, festivals, home shrines in Illinois) is respected. Quotations exactly, only from U.S.-public-domain
translations; everything else `"paraphrase": true`. The Chinese Classics course reads the Analects and the Daodejing as
philosophy and ethics; whether Confucianism is a religion is named as a debate, not settled.

## The three courses at a glance

| course | id | folder | bands | units | chapters | status |
|---|---|---|---|---|---|---|
| Hindu Texts | hin | `_work/hin` | K–2 (3) · 3–5 (4) · 6–8 (4) · 9–10 (3) · 11–12 (3) | 17 | 34 | new — all 17 to write |
| Buddhist Texts | bud | `_work/bud` | K–2 (3) · 3–5 (4) · 6–8 (4) · 9–10 (3) · 11–12 (3) | 17 | 34 | new — all 17 to write |
| Chinese Classics | chn | `_work/chn` | K–2 (3) · 3–5 (4) · 6–8 (4) · 9–10 (3) · 11–12 (3) | 17 | 34 | new — all 17 to write |

Writer load: 51 units (one agent each, 20 at a time). Unit 1 is kindergarten; units and chapters run straight through.

Arc in every course: K–2 stories and values (Ramayana, Krishna and Ganesha tales · the prince and the Jataka tales ·
stories of Confucius, Laozi and Zhuangzi); 3–5 what the texts are, key teachings and festivals; 6–8 history and genres;
9–10 close reading of core passages in public-domain translation; 11–12 interpretation, comparison and a capstone.

Pages and short links (checked against `_redirects` and the deploy folder — no collisions for any of them):

| course | unit pages | contents page | short links | hub (later) |
|---|---|---|---|---|
| hin | `hin-u1.html` … `hin-u17.html` | `hindu-texts-course.html` | `/hindu-texts-course`, `/hin1` … `/hin17` | `hindu-texts-hub.html` at `/hindu-texts` |
| bud | `bud-u1.html` … `bud-u17.html` | `buddhist-texts-course.html` | `/buddhist-texts-course`, `/bud1` … `/bud17` | `buddhist-texts-hub.html` at `/buddhist-texts` |
| chn | `chn-u1.html` … `chn-u17.html` | `chinese-classics-course.html` | `/chinese-classics-course`, `/chn1` … `/chn17` | `chinese-classics-hub.html` at `/chinese-classics` |

`plumb_<id>.py` writes all of these redirect rows (including the hub row) in the build wave.

## Sources cleared for exact quotation (everything else is paraphrase)

- Hindu: Edwin Arnold, *The Song Celestial* (Bhagavad Gita, 1885); F. Max Müller, *The Upanishads* (SBE 1 and 15,
  1879/1884); Ralph T.H. Griffith, *Hymns of the Rigveda* (1896) and *The Ramayan of Valmiki* (1870–74); K.M. Ganguli,
  *The Mahabharata* (1883–96).
- Buddhist: F. Max Müller, *The Dhammapada* (SBE 10, 1881); T.W. Rhys Davids, *Buddhist Suttas* (SBE 11, 1881);
  *The Jataka*, ed. E.B. Cowell (1895–1907), and Francis & Thomas, *Jataka Tales* (1916).
- Chinese: James Legge, *Confucian Analects* (1861; 2nd ed. 1893), *The Tao Teh King* (SBE 39, 1891), *The Works of
  Mencius* (1861; 2nd ed. 1895).

## Files created or changed in this wave

- `_work/hin`, `_work/bud`, `_work/chn` — each: `outline.py` (BANDS, 17 UNITS, LINKS), `SPEC.md`, `build_<id>.py`,
  `inject_<id>_jump.py`, `plumb_<id>.py`, `banners_<id>.py` (stub; reads `banners_<id>_a` / `_b` when they exist),
  `validate.py` and `assemble.py` (copied from tal unchanged).
- `_work/course/build_course.py` — the `jump_block()` strip regex now also knows
  `hindu-texts-course|hin-u|buddhist-texts-course|bud-u|chinese-classics-course|chn-u`.
- this file.

LINKS per unit: `/drops/<subject>/<grade>` for the Daily Drafts subjects `hindu`, `buddhist`, `chinese` (grades K, 1–8,
9-10, 11-12), the World Religions rooms `/r6` Hinduism, `/r7` Buddhism, `/r8` Confucianism and Daoism, `/r1`, `/r11`,
`/r12`, the matching World Religions units (`/rel6` Traditions of India and East Asia, `/rel11` South and East Asian
Traditions, `/rel18` Hinduism, `/rel19` Buddhism, `/rel20` Confucianism and Daoism, `/rel23`), `/religions`,
`/religions-course`, and the sister courses' contents pages.

Verified: `python3 -c "import outline"` in all three folders; units 1–17 and chapters 1–34 contiguous; every unit has
two chapters; LINKS keys match the units; every `build_<id>.py` imports and reports five jump groups
("Hindu Texts · Grades K–2" … "Chinese Classics · Grades 11–12"); every script compiles.

## Decisions for Jimmy

1. **The Zhuangzi.** Legge's Zhuangzi (SBE 39–40, 1891) is also U.S. public domain but was not on the list, so the SPEC
   paraphrases every Zhuangzi passage (units 2, 6, 10, 14). Say so and the chn SPEC changes one sentence to allow it.
2. **Arnold's Gita is loose verse.** It is quotable but it paraphrases as it rhymes. K.T. Telang's prose Gita (SBE 8,
   1882) is also public domain and closer to the Sanskrit — useful for 9–10 close reading (units 12–13). Allow Telang too?
3. **Daily Drafts subjects.** LINKS assume the parallel Daily Drafts agent adds subjects `hindu`, `buddhist`, `chinese`
   with grade banks K, 1–8, 9-10, 11-12. If it names them differently or leaves out a grade, change `_dd()` in each outline.
4. **Hubs and the dashboard.** `make_hubs.py` (HUBS list) and `dash_catalog.py` (the course tuple list) do not yet list
   hin / bud / chn. In the build wave add three HUBS entries (`hindu-texts-hub.html`, `buddhist-texts-hub.html`,
   `chinese-classics-hub.html`) and three catalogue tuples ("Hindu Texts"/"Textos hindúes", "Buddhist Texts"/"Textos
   budistas", "Chinese Classics"/"Clásicos chinos"), and decide whether they join the faith-courses door beside bib/heb/qur/tal.
5. **Jump-menu groups.** As in RELIGION_PLAN decision 5: the fifteen new optgroups ("Hindu Texts · Grades K–2" …) must be
   added to every page's `#jumpSel` (a one-off injector like `_work/jump/inject_jump.py`) BEFORE `build_<id>.py` runs;
   because `aog-dropdowns.js` already turns the menu into a drop-down, nothing else changes.

## The writer wave (next wave; nothing here has started)

One agent per unit, 20 at a time. Suggested order: K–5 of all three first (story units share the least risk), then 6–8,
then high school. Commit each validated unit (`git add -A aog-deploy/_work/<id>`); no HTML until a course is complete.

The exact prompt to give a writer (replace `<id>`, `<N>`, `<Course>`):

```
You are writing ONE unit of the "<Course>, K–12" course at Architecture of Grace.
Working directory: /home/user/architecture-of-grace/aog-deploy/_work/<id>
1. Read SPEC.md in full — voice, stance, LEVEL rules, accuracy and sources, file shapes.
2. In outline.py find the unit with n=<N>: its band, title, strand, and its two chapters (their n, title, strand,
   topics and story hook). The band's LEVEL row in SPEC.md is the one you follow.
3. Write ch<A>.json and ch<B>.json (A and B are the chapter numbers from outline.py) and u<N>_head.json, with the
   Write tool, each as soon as it is done. Some files may already exist: keep what is good, fix what is not.
4. Run `python3 assemble.py <N>` and fix every problem it reports until it prints OK.
Rules that matter most: every belief attributed ("Hindus believe…", "Buddhists believe…", "Confucius taught…"),
nothing asserted or denied about any tradition's truth; deities, the Buddha and sacred images always described with
the respect their devotees give them, never demeaned; meditation, prayer and worship described, never led; every
`source` is a real, citable passage (text, book or chapter and verse, translation and year); `"paraphrase": false`
only for an exact quotation from a public-domain translation named in SPEC.md, otherwise `"paraphrase": true`;
curriculum facts checked, "c." on uncertain dates, scholarly and traditional dates both named; Chicago/Illinois
facts only where certain; plain words at the band's level.
Reply with ONLY: the validator's OK line, a one-line list of any facts you softened or left out, and any quote you
set to paraphrase.
```

After each course's units all print OK, run the adversarial reviewer on every unit (copy `_work/rel/REVIEW_PROMPT.txt`,
swap the folder and the source list from that course's SPEC.md, and add: "flag any wording that demeans a deity or
practice, or that leads a practice instead of describing it").

## The build wave (after the writers)

Per course, HANDOFF.md steps 7–11: two illustrator agents for banners (`banners_<id>_a.py` units 1–9, `_b.py` the rest,
drawn with `_work/course/banner_kit.py`; no deity drawn as a figure of fun — prefer lamps, scrolls, temples, trees,
landscapes), then decision 5's jump-group injection, `python3 _work/<id>/build_<id>.py` → `inject_<id>_jump.py` → every
other course's injector → `plumb_<id>.py` (bumps `sw.js` CACHE, adds redirects and sitemap rows) → `make_hubs.py` and
`dash_catalog.py` after decision 4 → `node tools/check-contrast.js` and `node tools/check-calm.js` on every new page
(and on every page after a shared change) → screenshots at iPhone, iPad and desktop → commit. `run_course.sh` runs the
chain for one course.

## Build-wave prep (done 2026-09-27, decisions 3–5 approved)

- **Decision 3 — checked.** `daily-drops.html` has subjects `hindu`, `buddhist`, `chinese`, each with banks K, 1–8,
  9-10, 11-12 (and adult). Every `_dd()` grade in the three `outline.py` files (K, 1–8, 9-10, 11-12) exists, and
  `_redirects` routes `/drops/:subject/:grade`. Nothing to change.
- **Decision 4 — added, not run.** `make_hubs.py` COURSES has `hin`, `bud`, `chn` (hindu-texts-hub.html,
  buddhist-texts-hub.html, chinese-classics-hub.html; resource library `religions`). `dash_catalog.py` lists the
  three tuples (it only lists units whose pages exist). Run both only after the course pages exist.
- **Decision 5 — held on purpose.** `aog-jump.js` reads the `<select>` as it is: it never checks whether a page
  exists and never hides an empty group. Options pointing at `hin-u1.html` … would be broken links in view, and
  empty groups would show three subjects with "0 units". So nothing is injected yet. The injector is ready and
  re-runnable (tested on a copy: second run adds 0). In the build wave, BEFORE `build_<id>.py`:

      cd aog-deploy
      python3 _work/course/inject_groups.py hin
      python3 _work/course/inject_groups.py bud
      python3 _work/course/inject_groups.py chn

  It puts the fifteen empty groups ("Hindu Texts · Grades K–2" … "Chinese Classics · Grades 11–12") after
  Talmud Study on every page's `#jumpSel`. Then `build_<id>.py` and `inject_<id>_jump.py` fill them.

### Door 03 switch-on (home page, index.html)

Three folds (Hindu Texts, Buddhist Texts, Chinese Classics, each "Every grade" + "Course contents") sit inside
`<!-- AOG-DOOR3-OFF-START … AOG-DOOR3-OFF-END -->` under the comment AOG-DOOR3-MORE-COURSES. Once all three
courses are built and `plumb_<id>.py` has added `/hindu-texts`, `/hindu-texts-course`, `/buddhist-texts`,
`/buddhist-texts-course`, `/chinese-classics`, `/chinese-classics-course` to `_redirects`:

1. In index.html delete the line containing `<!-- AOG-DOOR3-OFF-START` and the line containing
   `AOG-DOOR3-OFF-END -->` (the folds between them stay).
2. On the `<p class="aogdr-count" data-aog-door3-count …>` line change `5 courses` / `5 cursos` (all three places)
   to `8 courses` / `8 cursos`.
3. `node tools/check-contrast.js index.html` and `node tools/check-calm.js index.html`, bump `CACHE` in `sw.js`.
   If a course is late, switch on only its two `<li>` lines (move them above the OFF-START line) and count 6 or 7.

## Unit lists

### Hindu Texts (`_work/hin`, 17 units, 34 chapters)


**Grades K–2**

- Unit 1 · Rama, Sita and Hanuman — ch 1 Rama, Sita and the Golden Deer; ch 2 Hanuman the Brave Helper
- Unit 2 · Krishna, Ganesha and the Stories Families Tell — ch 3 Krishna and the Mountain; ch 4 Ganesha and the Race Around the World
- Unit 3 · Lights, Colors and Kindness — ch 5 Diwali: The Festival of Lights; ch 6 Holi, Namaste and Helping Others

**Grades 3–5**

- Unit 4 · What the Hindu Texts Are — ch 7 Heard and Remembered: Shruti and Smriti; ch 8 Sanskrit, Gurus and Memory
- Unit 5 · The Ramayana — ch 9 Valmiki's Poem: From Ayodhya to the Forest; ch 10 Lanka, Return and the Meaning of Dharma
- Unit 6 · The Mahabharata and the Gita — ch 11 Two Families, One Kingdom; ch 12 Arjuna's Question and Stories Inside the Story
- Unit 7 · Key Teachings and Festivals — ch 13 Dharma, Karma, Samsara, Moksha; ch 14 A Year of Festivals and a Temple Near Chicago

**Grades 6–8**

- Unit 8 · The Vedas — ch 15 Hymns of the Rig Veda; ch 16 Four Vedas, Ritual and an Unbroken Voice
- Unit 9 · The Upanishads — ch 17 Atman and Brahman: Teachers in the Forest; ch 18 Stories of the Upanishads
- Unit 10 · Epics, Puranas and Poets — ch 19 Itihasa: Epic as Story and Teaching; ch 20 Puranas and the Bhakti Poets
- Unit 11 · Hindu Texts in History — ch 21 From the Indus to the Guptas; ch 22 Texts on the Move: Asia, Chicago and Today

**Grades 9–10**

- Unit 12 · Close Reading the Bhagavad Gita — ch 23 Arjuna's Despair and Krishna's Answer; ch 24 Action Without Clinging
- Unit 13 · Devotion, Vision and the Upanishads — ch 25 Devotion and the Universal Form; ch 26 Katha, Chandogya and Isha: "That Art Thou"
- Unit 14 · Hymns and Hard Cases — ch 27 The Hymn of Creation and the Purusha Hymn; ch 28 Dharma Dilemmas: Dice, the Yaksha and Sita's Trial

**Grades 11–12**

- Unit 15 · Interpreters Across the Centuries — ch 29 Shankara, Ramanuja, Madhva; ch 30 Modern Readers: Reform, Freedom and the West
- Unit 16 · Comparison and Critique — ch 31 Caste, Gender and the Texts; ch 32 The Gita Beside Other Scriptures
- Unit 17 · The Texts in Life, and Capstone — ch 33 Texts in Performance, Art and Diaspora; ch 34 Capstone: A Passage, Its Readers and Your Argument

### Buddhist Texts (`_work/bud`, 17 units, 34 chapters)


**Grades K–2**

- Unit 1 · The Prince Who Asked Why — ch 1 Siddhartha Sees the World; ch 2 Under the Bodhi Tree
- Unit 2 · Jataka Tales — ch 3 The Monkey King's Bridge; ch 4 The Hare in the Moon
- Unit 3 · Calm and Kindness — ch 5 Breathing and Being Still; ch 6 Kind to Every Living Thing

**Grades 3–5**

- Unit 4 · What the Buddhist Texts Are — ch 7 The Three Baskets; ch 8 From Memory to Palm Leaves
- Unit 5 · The Buddha's Life as the Texts Tell It — ch 9 Four Sights and the Great Going Forth; ch 10 Teaching, the Sangha and the Last Journey
- Unit 6 · Key Teachings — ch 11 Four Noble Truths and the Eightfold Path; ch 12 Five Precepts and the Dhammapada's Sayings
- Unit 7 · Festivals and Communities — ch 13 Vesak, Obon and the Buddhist Year; ch 14 Temples and Sanghas in Chicago

**Grades 6–8**

- Unit 8 · From India Across Asia — ch 15 The Buddha's India and Ashoka's Edicts; ch 16 Theravada, Mahayana, Vajrayana: Roads to Asia
- Unit 9 · Genres of the Pali Canon — ch 17 Suttas, Vinaya and Abhidhamma; ch 18 Verses, Jatakas and Nuns' Songs
- Unit 10 · Mahayana Sutras, Zen and Tibet — ch 19 The Lotus Sutra and the Heart Sutra; ch 20 Zen Stories and Tibetan Texts
- Unit 11 · Buddhist Texts Come to America — ch 21 Translators, Scholars and 1893; ch 22 Japanese American Buddhists and Buddhism Today

**Grades 9–10**

- Unit 12 · Close Reading the Suttas — ch 23 Setting the Wheel in Motion; ch 24 The Buddha's Last Days
- Unit 13 · Close Reading the Dhammapada — ch 25 The Twin Verses and the Mind; ch 26 Anger, the Wise and the Self
- Unit 14 · Jatakas and Hard Questions — ch 27 Jatakas as Moral Arguments; ch 28 Questions to the Buddha: Kalamas, Tevijja and the Raft

**Grades 11–12**

- Unit 15 · Interpreters Across the Centuries — ch 29 Not-Self and Emptiness: Classical Readers; ch 30 Modern Readers: Engaged, Reform and Convert Buddhism
- Unit 16 · Comparison — ch 31 Suffering and Its End Across Traditions; ch 32 Ethics Across Traditions
- Unit 17 · The Texts in Life, and Capstone — ch 33 Texts in Art, Ritual and American Life; ch 34 Capstone: A Passage, Its Readers and Your Argument

### Chinese Classics (`_work/chn`, 17 units, 34 chapters)


**Grades K–2**

- Unit 1 · Stories of Confucius — ch 1 A Boy Who Loved to Learn; ch 2 Teacher Kong and His Students
- Unit 2 · Stories of Laozi and Zhuangzi — ch 3 The Old Master Rides West; ch 4 The Butterfly Dream and the Useless Tree
- Unit 3 · Family, Friends and Harmony — ch 5 Respect at Home and the New Year; ch 6 Be Like Water

**Grades 3–5**

- Unit 4 · What the Classics Are — ch 7 The Analects: Sayings Collected by Students; ch 8 The Daodejing: 81 Short Chapters
- Unit 5 · Key Teachings of Confucius — ch 9 Ren, Li and the Junzi; ch 10 Five Relationships and Mencius's Sprouts
- Unit 6 · Key Teachings of the Dao — ch 11 The Dao, Wu Wei and Yin-Yang; ch 12 Water, the Uncarved Block and Simplicity
- Unit 7 · Festivals and Everyday Life — ch 13 New Year, Qingming and the Mid-Autumn Moon; ch 14 Temples, Teachers and Chinatown

**Grades 6–8**

- Unit 8 · The Age of Philosophers — ch 15 Zhou, Spring and Autumn and the Hundred Schools; ch 16 Mozi, the Legalists and the Burning of the Books
- Unit 9 · The Confucian Classics — ch 17 Four Books and Five Classics; ch 18 Mencius and Xunzi: Is Human Nature Good?
- Unit 10 · The Daoist Texts — ch 19 Laozi, the Zhuangzi and the Guodian Bamboo; ch 20 Daoism as Religion: Temples, Immortals and the Canon
- Unit 11 · The Classics Through History — ch 21 Empire, Exams and Neo-Confucianism; ch 22 The Classics Travel West

**Grades 9–10**

- Unit 12 · Close Reading the Analects — ch 23 Learning, Filial Piety and Governing by Virtue; ch 24 Ren, Reciprocity and the Rectification of Names
- Unit 13 · Close Reading the Daodejing — ch 25 Naming, Opposites, Water and Emptiness; ch 26 The Sage Ruler and the Small State
- Unit 14 · Mencius and Zhuangzi Close Up — ch 27 Mencius: The Child at the Well and the Ox; ch 28 Zhuangzi: Cook Ding, the Frog and the Fish

**Grades 11–12**

- Unit 15 · Interpreters Across the Centuries — ch 29 Commentators: Wang Bi, Zhu Xi and Wang Yangming; ch 30 Modern Readers: Revolution, Revival and the West
- Unit 16 · Comparison and Debate — ch 31 Confucius and Laozi in Dialogue; ch 32 The Golden Rule and the Good Person Across Traditions
- Unit 17 · The Classics Today, and Capstone — ch 33 The Classics in Translation, Art and Daily Life; ch 34 Capstone: A Passage, Its Readers and Your Argument

