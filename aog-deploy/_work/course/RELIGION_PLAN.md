# RELIGION_PLAN — six K–12 courses: World Religions, Economics, The Bible, The Hebrew Bible, The Qur'an, Talmud Study (2026-09-27)

Jimmy: "I want a K–12 curriculum of the Bible, Quran, Talmud, the Hebrew Bible, world religion and economics."
This wave was DESIGN ONLY. Every course now has a complete K–12 `outline.py` in the builder's shape, a `SPEC.md`
for its writers, and the scaffold scripts the recipe in `HANDOFF.md` names. No chapters were written, no HTML
built, `sw.js` untouched, nothing committed.

Stance, all six text courses: neutral, descriptive, never devotional or polemical. "Christians believe…",
"the Torah says…", "Muslims believe…", "the Gemara asks…". No claim about what a reader must believe. Sources
are public-domain translations, quoted exactly or marked `"paraphrase": true`. The Daily Drafts spiral
(`daily-drops.html`, subjects religion / bible / quran / talmud) set the stance: "Items say what the text SAYS
('In Genesis…'), never rule on belief." The courses keep it.

## The six courses at a glance

| course | id | folder | bands | units | chapters | status |
|---|---|---|---|---|---|---|
| World Religions | rel | `_work/rel` | K–2 (3) · 3–5 (4) · 6–8 (5) · 9–10 (6) · 11–12 (6) | 24 | 48 | 12 HS units written and built; 12 K–8 units to write |
| Economics | eco | `_work/eco` | K–2 (3) · 3–5 (3) · 6–8 (4) · 9–10 (4) · 11–12 (4) | 18 | 36 | 8 HS units written and built; 10 K–8 units to write |
| The Bible | bib | `_work/bib` | K–2 (4) · 3–5 (4) · 6–8 (5) · 9–10 (3) · 11–12 (2) | 18 | 36 | new — all 18 to write |
| The Hebrew Bible (Tanakh) | heb | `_work/heb` | K–2 (3) · 3–5 (4) · 6–8 (4) · 9–10 (3) · 11–12 (3) | 17 | 34 | new — all 17 to write |
| The Qur'an | qur | `_work/qur` | K–2 (3) · 3–5 (4) · 6–8 (4) · 9–10 (3) · 11–12 (3) | 17 | 34 | new — all 17 to write |
| Talmud Study | tal | `_work/tal` | K–2 (3) · 3–5 (4) · 6–8 (4) · 9–10 (3) · 11–12 (3) | 17 | 34 | new — all 17 to write |

Writer load: 91 units to write (12 + 10 + 18 + 17 + 17 + 17), one agent each, 20 at a time.

Pages and short links (checked against `_redirects` and the deploy folder — no collisions):

| course | unit pages | contents page | short links |
|---|---|---|---|
| rel | `rel-u1.html` … `rel-u24.html` | `religions-course.html` | `/religions-course`, `/rel1` … `/rel24` (13–24 exist) |
| eco | `eco-u1.html` … `eco-u18.html` | `economics-course.html` | `/economics-course`, `/eco1` … `/eco18` (11–18 exist) |
| bib | `bib-u1.html` … `bib-u18.html` | `bible-course.html` | `/bible`, `/bible-course`, `/bib1` … `/bib18` |
| heb | `heb-u1.html` … `heb-u17.html` | `hebrew-bible-course.html` | `/hebrew-bible`, `/hebrew-bible-course`, `/heb1` … `/heb17` |
| qur | `qur-u1.html` … `qur-u17.html` | `quran-course.html` | `/quran`, `/quran-course`, `/qur1` … `/qur17` |
| tal | `tal-u1.html` … `tal-u17.html` | `talmud-course.html` | `/talmud`, `/talmud-course`, `/tal1` … `/tal17` |

(`/b1…`, `/h1…` are taken by other rooms, so the unit short links use the three-letter ids; `/r2-hebrew-bible.html` is
the World Religions room, not a collision.)

## Files created or changed in this wave

- `_work/rel/outline.py` — BANDS now K–2 … 11–12; K–2, 3–5, 6–8 units added; after the 2026-09-27 renumbering they are units 1–12 (chapters 1–24) and the high-school units are 13–24.
- `_work/eco/outline.py` — BANDS now K–2 … 11–12; K–8 units added; after the 2026-09-27 renumbering they are units 1–10 (chapters 1–20) and the high-school units are 11–18.
- `_work/rel/{build_rel,plumb_rel}.py`, `_work/eco/{build_eco,plumb_eco}.py`, `_work/rel/SPEC.md`, `_work/eco/SPEC.md` —
  strings say K–12 instead of 9–12; the plumb `hub()` now skips (and names) a band the hub page lacks instead of asserting.
- `_work/bib`, `_work/heb`, `_work/qur`, `_work/tal` — each: `outline.py`, `SPEC.md`, `build_<id>.py`, `inject_<id>_jump.py`,
  `plumb_<id>.py`, `banners_<id>.py` (stub), `validate.py`, `assemble.py` (copied from rel unchanged). All compile; every
  `build_<id>.py` imports and reports its five jump groups.
- `_work/course/build_course.py` — the `jump_block()` strip regex now knows `bible-course|bib-u|hebrew-bible-course|heb-u|quran-course|qur-u|talmud-course|tal-u`.
- `_work/course/renumber.py` — the straight-through renumbering script; run on rel and eco 2026-09-27 (see Decision 1).
- this file.

Verified: `python3 -c "import outline"` in all six folders; units and chapters contiguous 1…N in every course; every unit has
exactly two chapters; LINKS keys match the units; `python3 assemble.py 1` and `7` (rel) and `5` (eco) still print OK (before renumbering; now rel 13–24 and eco 11–18 print OK).

## Decisions for Jimmy

1. **Numbering of the K–8 bands in World Religions and Economics — Renumbered on Jimmy's instruction (2026-09-27): K–2 is unit 1.**
   Jimmy: "Fix the numbers. Kindergarten should be K, not 13." `renumber.py` was run in `_work/rel` and `_work/eco`, so units
   and chapters now run straight through in band order, kindergarten first, high school last.
   - rel: K–2 units 1–3, 3–5 units 4–7, 6–8 units 8–12 (chapters 1–24, still to write); the high-school units that were 1–12
     are now **units 13–24** (chapters 25–48): old unit N → N+12, old chapter N → N+24. Built pages `rel-u13…24.html`, `/rel13…/rel24`.
   - eco: K–2 units 1–3, 3–5 units 4–6, 6–8 units 7–10 (chapters 1–20, still to write); the high-school units that were 1–8
     are now **units 11–18** (chapters 21–36): old unit N → N+10, old chapter N → N+20. Built pages `eco-u11…18.html`, `/eco11…/eco18`.
   - Done with it: the prose cross-references ("unit 1", "Chapter 4" …) were updated, the old `rel-u1…12.html` / `eco-u1…8.html`
     pages removed, `_redirects`, `sitemap.xml`, `sw.js`, the hubs, the dashboard catalogue and the standards crosswalk
     (`_work/standards/{rel,eco,outlines}.json`) moved to the new numbers. `plumb_<id>.py` now lists only units whose page is built.
   - The cost Jimmy accepted: the old short links `/rel1…/rel12` and `/eco1…/eco8` no longer open the high-school units (they
     stay unused until the K–8 units are built), and per-unit progress saved in a browser under the old numbers does not carry over.

2. **Public-domain sources — two translations Jimmy named are not clear for quotation.** Yusuf Ali's Qur'an (1934)
   and the Soncino Talmud (1935–52) are not public domain in the U.S. (nor is Danby's Mishnah, 1933, or Sefaria's
   William Davidson Talmud, CC BY-NC). The SPECs therefore quote only Pickthall (1930 — U.S. public domain since
   2026), Rodwell (1861), Palmer (1880), Sale (1734); Rodkinson's Talmud (1896–1903) and Charles Taylor's Pirkei Avot
   (1877); KJV, ASV, WEB, JPS 1917. Everything else is `"paraphrase": true`. Rodkinson is abridged and uneven, so the
   Talmud high-school units lean on paraphrase with tractate and page cited. If Jimmy is content with CC BY-NC
   attribution for a free site, Sefaria's translation could be allowed for Talmud quotations — say so and the tal SPEC
   changes one paragraph.

3. **No hubs for the four new courses.** `hub` in each `build_<id>.py` points at the Daily Drafts subject page
   (`daily-drops.html?subject=bible|quran|talmud`) and LINKS point at `/drops/<subject>/<grade>` plus the sister
   courses and the relevant World Religions rooms (/r2 Hebrew Bible, /r3 New Testament, /r4 Judaism, /r5 Islam).
   The Hebrew Bible course uses the "bible" and "talmud" spirals (there is no "hebrew bible" subject in Daily Drafts).
   If Jimmy wants a `bible-hub.html` etc., that is a separate small job after the courses exist.

4. **The religions and economics hubs only have 9–10 and 11–12 band sections.** `plumb_rel.py` / `plumb_eco.py`
   will now print a notice and skip K–2, 3–5 and 6–8 rather than fail; someone must add
   `<section class="band" id="k-2">` (etc.) to `religions-hub.html` and `economics-hub.html` in the build wave, or
   accept that the hubs list only the HS units and the contents page carries the rest.

5. **Jump-menu groups.** The builder only fills optgroups that already exist in the lifted s13 menu. Today the pages
   carry "World Religions · Grades 9–10 / 11–12" and "Economics · Grades 9–10 / 11–12" only. The build wave must add
   the three new World Religions and Economics band groups and the four new courses' five groups each
   (`"The Bible · Grades K–2"` … `"Talmud Study · Grades 11–12"`) to every page's `#jumpSel` (a one-off injector like
   `_work/jump/inject_jump.py`) BEFORE running `build_<id>.py`; otherwise the new pages get no course options.

6. (Checked: the Daily Drafts "economics" and "religion" spirals already carry K, 1–8, 9–10 and 11–12 banks, so every
   `/drops/<subject>/<grade>` link in the K–8 LINKS resolves. Nothing to decide.)

## The writer wave (next wave; nothing here has started)

One agent per unit, 20 at a time, the recipe's step 6. Order I suggest: Bible and Hebrew Bible first (they share the
most facts and can cross-check), then Qur'an and Talmud, then the rel and eco K–8 bands. Commit each validated unit
(`git add -A aog-deploy/_work/<id>`); no HTML until a course is complete.

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
Rules that matter most: every belief attributed, nothing asserted or denied about any tradition's truth; every
`source` is a real, citable passage (book, chapter, verse / surah:ayah / tractate and page, translation and year);
`"paraphrase": false` only for an exact quotation from a public-domain translation named in SPEC.md, otherwise
`"paraphrase": true`; curriculum facts checked, "c." on uncertain dates; plain words at the band's level.
Reply with ONLY: the validator's OK line, a one-line list of any facts you softened or left out, and any quote you
set to paraphrase.
```

After each course's units all print OK, run the second, adversarial reviewer on every unit (copy
`_work/rel/REVIEW_PROMPT.txt`, swap the folder and the source list from that course's SPEC.md).

Note from the coordinator (2026-09-27): the new courses use exactly the same builder and layout as ush/sci/mth/ela — the
units come out of `build_<id>.py` unchanged. A shared script, `aog-unit.js`, will page every `*-uN.html` one lesson at a
time and add worksheets and a resources list per lesson; the resources list is built from each lesson's `source` looks,
so the outlines need no extra fields, and the SPECs tell writers that every `source` and `data` must be real and citable.

## The build wave (after the writers)

Per course, the recipe's steps 7–11: two illustrator agents for banners (`banners_<id>_a.py` units 1–9, `_b.py` the
rest, ids `<x>b{n}-`), then `build_<id>.py` → `inject_<id>_jump.py` → every other course's injector → `plumb_<id>.py`
(bumps `sw.js` CACHE, adds redirects and sitemap rows) → `node tools/check-contrast.js` and `node tools/check-calm.js`
on every new page → screenshots → commit. Decisions 4 and 5 above come first.

## Unit lists

### World Religions (`_work/rel`, 24 units, 48 chapters)


**Grades K–2**

- Unit 13 · Families and Their Special Days — ch 25 Special Days at Home; ch 26 Places Where People Gather
- Unit 14 · Stories People Keep — ch 27 Old Stories from Many Lands; ch 28 Books People Keep Safe
- Unit 15 · Being Kind, Being Fair — ch 29 Golden Rules; ch 30 Quiet Time and Thank-You Time

**Grades 3–5**

- Unit 16 · What Is a Religion? — ch 31 Beliefs, Practices, Communities; ch 32 A Year of Holidays
- Unit 17 · Judaism, Christianity and Islam — ch 33 Abraham's Family: Judaism and Christianity; ch 34 Islam: One God, Five Pillars
- Unit 18 · Traditions of India and East Asia — ch 35 Hinduism and Buddhism; ch 36 Sikhism, Jainism, Confucius and the Dao
- Unit 19 · Religion in Our Community — ch 37 Neighbors of Many Faiths; ch 38 Stories That Travel

**Grades 6–8**

- Unit 20 · Studying Religion Like a Historian — ch 39 Sources, Genres and Timelines; ch 40 Symbols, Rituals and Sacred Space
- Unit 21 · Judaism and Christianity in History — ch 41 From Abraham to the Rabbis; ch 42 From Jesus to the Reformation and Beyond
- Unit 22 · Islam in History — ch 43 Muhammad, the Qur'an and the First Community; ch 44 Caliphates, Learning and the Wider World
- Unit 23 · South and East Asian Traditions — ch 45 Hinduism and Buddhism: Dharma, Karma, Awakening; ch 46 Sikhism, Jainism, Confucianism, Daoism and Shinto
- Unit 24 · Traditions Without One Book, and Religion Today — ch 47 Indigenous Traditions of Africa, the Americas and the Pacific; ch 48 Religion, Rights and Living Together

**Grades 9–10**

- Unit 1 · How to Read a Sacred Text — ch 1 Author, Audience, Purpose; ch 2 Translation, Context and Interpretation
- Unit 2 · The Biblical Lens I: The Hebrew Bible — ch 3 Creation, Covenant and Exodus; ch 4 Prophets, Psalms and Wisdom
- Unit 3 · The Biblical Lens II: The New Testament — ch 5 The Gospels and the Parables; ch 6 Paul, the Letters and the Early Church
- Unit 4 · Judaism: Torah, Talmud and a People — ch 7 Covenant, Sabbath and the Calendar; ch 8 The Talmud and Jewish Life Through History
- Unit 5 · Islam: The Qur'an and the Five Pillars — ch 9 Revelation, the Prophet and the Pillars; ch 10 Hadith, Law and the Golden Age
- Unit 6 · Hinduism: Dharma, Karma and the Gita — ch 11 The Vedas and the Many Paths; ch 12 Arjuna's Question: The Bhagavad Gita

**Grades 11–12**

- Unit 7 · Buddhism: The Four Noble Truths — ch 13 The Buddha and the Middle Way; ch 14 Sangha, Schools and the Spread of Buddhism
- Unit 8 · Confucianism and Daoism — ch 15 The Analects: Family, Ritual and the Good Ruler; ch 16 The Daodejing: The Way That Cannot Be Named
- Unit 9 · Sikhism, Jainism, and the Traditions of Africa and the Americas — ch 17 The Guru Granth Sahib and Ahimsa; ch 18 Oral Traditions That Keep the World in Story
- Unit 10 · Religion and the World — ch 19 Law, Art, Science and Charity; ch 20 Conflict, Peace and Religious Freedom
- Unit 11 · One Question, Many Lenses — ch 21 What Is a Good Life? What Is Justice?; ch 22 What Happens When We Die? Why Is There Suffering?
- Unit 12 · Capstone: The Sources Speak — ch 23 Posing the Question and Gathering the Texts; ch 24 Arguing What Each Would Say

### Economics (`_work/eco`, 18 units, 36 chapters)


**Grades K–2**

- Unit 9 · Wants, Needs and Choices — ch 17 Needs and Wants; ch 18 Goods and Services
- Unit 10 · Money, Saving and Spending — ch 19 What Money Is For; ch 20 Save, Spend or Share
- Unit 11 · Workers, Makers and Markets — ch 21 From Farm to Table; ch 22 A Class Market Day

**Grades 3–5**

- Unit 12 · Scarcity and the Choices People Make — ch 23 Why We Cannot Have Everything; ch 24 Producers, Consumers and How Work Gets Done
- Unit 13 · Markets, Prices and Money — ch 25 Supply, Demand and the Price; ch 26 Money, Banks and Interest
- Unit 14 · Trade, Government and the Community — ch 27 Trade Near and Far; ch 28 Taxes, Public Goods and Jobs

**Grades 6–8**

- Unit 15 · The Economic Way of Thinking — ch 29 Scarcity, Incentives and Trade-offs; ch 30 Economic Systems Around the World
- Unit 16 · Markets in Action — ch 31 Supply and Demand on a Graph; ch 32 Businesses, Competition and Profit
- Unit 17 · Personal Finance — ch 33 Earning, Budgeting and Saving; ch 34 Credit, Borrowing and Protecting Your Money
- Unit 18 · The Nation and the World — ch 35 Government, Taxes and the Whole Economy; ch 36 Global Trade and Development

**Grades 9–10**

- Unit 1 · Scarcity, Choice and Opportunity Cost — ch 1 Scarcity Is Not a Shortage; ch 2 Opportunity Cost and the Margin
- Unit 2 · Supply, Demand and the Market — ch 3 Demand and Supply; ch 4 Equilibrium and Elasticity
- Unit 3 · Prices, Controls and Market Failure — ch 5 Ceilings, Floors and Rationing; ch 6 Externalities and Public Goods
- Unit 4 · Competition, Firms and Market Structure — ch 7 Costs, Revenue and the Firm; ch 8 The Four Market Structures

**Grades 11–12**

- Unit 5 · Measuring the Economy — ch 9 GDP: What It Counts and What It Misses; ch 10 Prices and Jobs: The CPI and Unemployment
- Unit 6 · The Business Cycle and Fiscal Policy — ch 11 Expansion, Peak, Contraction, Trough; ch 12 Taxes, Spending and the Budget
- Unit 7 · Money, Banking and the Federal Reserve — ch 13 Money and Banks; ch 14 The Federal Reserve and Monetary Policy
- Unit 8 · Trade, Taxes and the World Economy — ch 15 Comparative Advantage and Trade Policy; ch 16 Exchange Rates, Taxes and Development

### The Bible (`_work/bib`, 18 units, 36 chapters)


**Grades K–2**

- Unit 1 · Beginnings — ch 1 Seven Days and a Garden; ch 2 Noah and the Rainbow
- Unit 2 · Abraham's Family — ch 3 Abraham, Sarah and a Promise; ch 4 Joseph and His Brothers
- Unit 3 · Moses and the Way Out — ch 5 A Baby in a Basket; ch 6 Through the Sea to a Mountain
- Unit 4 · Kings, Prophets and a Teacher — ch 7 David, Daniel and Jonah; ch 8 Stories Jesus Told

**Grades 3–5**

- Unit 5 · What the Bible Is — ch 9 A Library of Books; ch 10 The Torah's Big Story: Creation to Sinai
- Unit 6 · The Land, the Judges and the Kings — ch 11 Joshua, Judges and Ruth; ch 12 Samuel, Saul, David and Solomon
- Unit 7 · Prophets, Exile and Return — ch 13 Elijah, Isaiah, Jeremiah and the Exile; ch 14 Psalms, Proverbs, Daniel, Esther and Home Again
- Unit 8 · The New Testament Story — ch 15 The Life of Jesus in the Gospels; ch 16 Acts, Paul's Letters and the Early Church

**Grades 6–8**

- Unit 9 · Genres and How to Read Them — ch 17 Law, Narrative and Genealogy; ch 18 Poetry, Prophecy, Gospel, Letter, Apocalypse
- Unit 10 · The Pentateuch as Literature and History — ch 19 Genesis: Creation, Flood, Ancestors; ch 20 Exodus to Deuteronomy: Covenant and Law
- Unit 11 · The History Books and the Ancient Near East — ch 21 Joshua to Kings: Tribes, Monarchy, Two Kingdoms; ch 22 Exile, Persia and the Second Temple
- Unit 12 · Poetry and Wisdom — ch 23 The Psalms: Praise, Lament, Thanks; ch 24 Proverbs, Job, Ecclesiastes and the Song of Songs
- Unit 13 · The New Testament in Its World — ch 25 Gospels: Four Portraits, One Roman World; ch 26 Acts, Letters and Revelation

**Grades 9–10**

- Unit 14 · Close Reading the Torah — ch 27 Two Creation Accounts, Eden and Babel; ch 28 Covenant, Law and the Character of God
- Unit 15 · Prophets and Poets Close Up — ch 29 Amos, Hosea, Isaiah, Jeremiah: Justice and Hope; ch 30 Job and Ecclesiastes: Suffering and Meaning
- Unit 16 · Reading the Gospels Closely — ch 31 The Sermon on the Mount and the Parables; ch 32 Passion, Resurrection and the Historical Jesus

**Grades 11–12**

- Unit 17 · Paul, Interpretation and the Making of the Canon — ch 33 Romans and Galatians: Faith, Law and Grace; ch 34 Canon, Manuscripts and Translation
- Unit 18 · The Bible in Culture and Capstone — ch 35 The Bible in Literature, Art, Law and American Life; ch 36 Capstone: A Close Reading Argued from the Text

### The Hebrew Bible (Tanakh) (`_work/heb`, 17 units, 34 chapters)


**Grades K–2**

- Unit 1 · In the Beginning — ch 1 Seven Days and Shabbat; ch 2 Noah, the Ark and the Rainbow
- Unit 2 · Abraham, Sarah and Their Family — ch 3 Abraham and Sarah Go to a New Land; ch 4 Jacob, Rachel, Leah and Joseph
- Unit 3 · Moses and the Torah — ch 5 Out of Egypt: The Passover Story; ch 6 Mount Sinai and the Ten Sayings

**Grades 3–5**

- Unit 4 · What the Tanakh Is — ch 7 Torah, Nevi'im, Ketuvim; ch 8 The Torah's Big Story
- Unit 5 · Into the Land — ch 9 Joshua, Deborah, Gideon, Samson; ch 10 Ruth, Hannah and Samuel
- Unit 6 · Kings and Prophets — ch 11 Saul, David and Solomon; ch 12 Elijah, Jonah and the Prophets of Justice
- Unit 7 · Songs, Sayings and Scrolls — ch 13 Psalms and Proverbs; ch 14 Esther, Daniel and Going Home

**Grades 6–8**

- Unit 8 · The Shape of the Tanakh — ch 15 Three Parts, Twenty-Four Books, One Scroll; ch 16 How Jews Read: Parashah, Midrash, Commentary
- Unit 9 · Torah: Genesis and Exodus — ch 17 Genesis: From Creation to Joseph; ch 18 Exodus: Liberation, Sinai, the Mishkan
- Unit 10 · Torah: Leviticus to Deuteronomy, and the Former Prophets — ch 19 Holiness, the Wilderness and Moses's Last Words; ch 20 Joshua to Kings: The Land, the Monarchy, the Fall
- Unit 11 · The Latter Prophets and the Writings — ch 21 Isaiah, Jeremiah, Ezekiel and the Twelve; ch 22 Ketuvim: Psalms, Wisdom, the Five Scrolls, Ezra–Nehemiah, Chronicles

**Grades 9–10**

- Unit 12 · Close Reading Genesis — ch 23 Creation, Eden and the Akedah; ch 24 Jacob, Joseph and the Art of Biblical Narrative
- Unit 13 · Law, Covenant and the Prophetic Voice — ch 25 Sinai, the Decalogue and the Covenant Code; ch 26 Amos, Hosea, Micah, Isaiah: Justice, Mercy and Return
- Unit 14 · Poetry, Wisdom and the Scroll of Esther — ch 27 Psalms and the Song of Songs: Hebrew Poetry; ch 28 Job, Ecclesiastes and Esther: Questions Without Easy Answers

**Grades 11–12**

- Unit 15 · Text, Transmission and Translation — ch 29 From Scroll to Codex: Masoretes, Scrolls and Versions; ch 30 Translating the Tanakh
- Unit 16 · Interpretation Across the Centuries — ch 31 Midrash, Rashi, Ibn Ezra and Maimonides; ch 32 Jewish, Christian and Academic Readings of the Same Text
- Unit 17 · The Tanakh in Jewish Life and Capstone — ch 33 The Tanakh in Prayer, Holiday, Home and Literature; ch 34 Capstone: Arguing an Interpretation from Text and Commentary

### The Qur'an (`_work/qur`, 17 units, 34 chapters)


**Grades K–2**

- Unit 1 · A Book Called the Qur'an — ch 1 What the Qur'an Is; ch 2 Surahs and Ayahs
- Unit 2 · Muhammad and the First Words — ch 3 A Boy in Mecca; ch 4 The Cave and the Word "Read"
- Unit 3 · Words Muslims Say Every Day — ch 5 Bismillah and Alhamdulillah; ch 6 Stories the Qur'an Tells

**Grades 3–5**

- Unit 4 · The Shape of the Qur'an — ch 7 114 Surahs, 30 Parts; ch 8 Reciting, Memorizing and Writing It Beautifully
- Unit 5 · The Life of the Prophet as Context — ch 9 Mecca: The Message and the Hard Years; ch 10 Medina: The Hijra and a Community
- Unit 6 · Prophets in the Qur'an — ch 11 Adam, Nuh, Ibrahim and Yusuf; ch 12 Musa, Maryam, Isa and Muhammad
- Unit 7 · What the Qur'an Teaches — ch 13 One God, and Being Good; ch 14 Prayer, Fasting and the Pillars in the Qur'an

**Grades 6–8**

- Unit 8 · Structure, Style and Recitation — ch 15 Surah, Ayah, Juz': Order, Names and Style; ch 16 From Voice to Page: Collection, Script and Tajwid
- Unit 9 · Seerah: Mecca, Medina and the Occasions of Revelation — ch 17 Arabia Before Islam and the Meccan Period; ch 18 Medina, the Community and the Occasions of Revelation
- Unit 10 · Major Themes — ch 19 God, Creation, Signs and the Last Day; ch 20 Law and Ethics: Justice, Charity, Family, Food, War and Peace
- Unit 11 · Reading with the Tradition — ch 21 Hadith, Sunnah and Tafsir: How Muslims Interpret; ch 22 The Qur'an in Islamic Civilization and in America

**Grades 9–10**

- Unit 12 · Close Reading Meccan Surahs — ch 23 The Short Surahs: Al-Fatiha, Al-'Alaq, Ad-Duha, Al-'Asr, Al-Ikhlas; ch 24 Surah Yusuf and Surah Maryam: Narrative in the Qur'an
- Unit 13 · Close Reading Medinan Surahs — ch 25 Al-Baqarah: Covenant, Law, the Throne Verse and "No Compulsion"; ch 26 An-Nisa, Al-Ma'idah and Al-Hujurat: Community, Justice and the Peoples of the Book
- Unit 14 · The Qur'an and the Bible — ch 27 Shared Figures, Different Tellings; ch 28 How the Three Read Each Other's Books

**Grades 11–12**

- Unit 15 · Interpretation: Classical and Modern — ch 29 The Tafsir Tradition; ch 30 Modern Readings
- Unit 16 · Law, Ethics and Society — ch 31 From Text to Law: Usul al-Fiqh, the Schools and Ijtihad; ch 32 War, Peace, Governance and the Earth: Verses in Context
- Unit 17 · Recitation as Art, and Capstone — ch 33 Sound and Beauty: Recitation, Calligraphy and the Inimitable; ch 34 Capstone: A Verse, Its Contexts and Its Readers

### Talmud Study (`_work/tal`, 17 units, 34 chapters)


**Grades K–2**

- Unit 1 · A Very Big Book of Questions — ch 1 What Is the Talmud?; ch 2 The Torah and Its Rules
- Unit 2 · Rabbis Who Told Stories — ch 3 Hillel on One Foot; ch 4 Honi and the Carob Tree, Akiva and the Water
- Unit 3 · Learning Together — ch 5 Two Voices, One Page; ch 6 Kindness Rules from the Rabbis

**Grades 3–5**

- Unit 4 · From Sinai to the Mishnah — ch 7 Written Torah and Oral Torah; ch 8 Judah the Prince Writes It Down
- Unit 5 · The Gemara and the Two Talmuds — ch 9 Babylon and the Land of Israel; ch 10 A Page of Talmud
- Unit 6 · Famous Stories from the Talmud — ch 11 The Oven of Akhnai: "It Is Not in Heaven"; ch 12 Rabbi Akiva, Rachel and Beruriah
- Unit 7 · Fair and Kind: Talmud in Everyday Life — ch 13 Lost and Found, Honest Weights, Fair Wages; ch 14 Tzedakah, Guests and Saving a Life

**Grades 6–8**

- Unit 8 · How a Page Is Read — ch 15 Mishnah, Gemara, Rashi, Tosafot: The Vilna Page; ch 16 The Moves of the Gemara: Question, Proof, Objection, Answer
- Unit 9 · The Rabbis and Their World — ch 17 Second Temple to Yavneh; ch 18 Tannaim and Amoraim: Academies, Empires and the Editors
- Unit 10 · Sugyot in Paraphrase I: Time and Damages — ch 19 Shabbat, the Shema and Hanukkah; ch 20 The Ox, the Pit and the Fire: Damages and Neighbors
- Unit 11 · Sugyot in Paraphrase II: Argument and Mercy — ch 21 Hillel and Shammai, Akhnai and "These and Those"; ch 22 Aggadah: Pirkei Avot, Speech, Repentance

**Grades 9–10**

- Unit 12 · Reading Real Passages: Berakhot and Shabbat — ch 23 Berakhot 2a–3a: The Evening Shema; ch 24 Shabbat 31a and 21b: Hillel's Convert and the Hanukkah Lights
- Unit 13 · Reading Real Passages: Bava Metzia and Sanhedrin — ch 25 Bava Metzia 59b: The Oven of Akhnai and Wronging with Words; ch 26 Sanhedrin 37a and Makkot 7a: One Life, and a Court That Rarely Kills
- Unit 14 · Law and Story Together — ch 27 Pirkei Avot 1–2: The Chain and the Sayings; ch 28 Ta'anit and Yoma: Rain, Honi, Repentance and Yom Kippur

**Grades 11–12**

- Unit 15 · Talmudic Reasoning and Halakhah — ch 29 The Thirteen Rules, Logic and the Codes; ch 30 Responsa, Custom and Modern Questions
- Unit 16 · The Talmud in History — ch 31 Burning and Printing: From Paris 1240 to Vilna; ch 32 Talmud Beyond the Yeshiva
- Unit 17 · Great Debates and Capstone — ch 33 Honoring Parents, and "These and Those": A Whole Sugya; ch 34 Capstone: Chavruta — Present a Sugya, Its Argument and Its Mercy
