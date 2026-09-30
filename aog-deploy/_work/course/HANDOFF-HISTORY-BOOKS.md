# HANDOFF — the nine history books (2026-09-29)

Nine books were drafted outside the repo as single HTML pages: Sports History, The
Measured Step (martial arts), Europe, China, Japan, Mexico, Russia, These United
States, and Illinois. They went live on 2026-09-29 and were taken down the same day
(PR #213) because they were maps, not courses. This file says what "finished" means
on this site and how to build each book so it matches the courses that are already
finished (Buddhist Texts is the model).

Read these first, in this order:
1. `CLAUDE.md` (repo root) — standing rules: readable text, calm pages, plain words,
   drop-downs, cache bump.
2. `aog-deploy/_work/course/HANDOFF.md` — the engine recipe (steps 1–11). Still
   right, except step 7: drawings are now **pencil**, not SVG (see "Pictures" below).
3. `aog-deploy/_work/bud/SPEC.md` and `aog-deploy/_work/bud/outline.py` — the
   model course's writer contract and outline.
4. `aog-deploy/_work/art/pencil/GUIDE.md` — the approved pencil style.
5. `aog-deploy/_work/WRITER_PROMPT.txt` — what every writer agent is told.

The drafted pages themselves are in git history if you want to read them:
`git show 7c9ef8df:aog-deploy/<book>-history-hub.html` and
`git show 7c9ef8df:aog-deploy/martial-arts.html`.

---

## 1. What "finished" means

A book is finished only when it has everything a Buddhist Texts unit has. The
drafts had none of this except titles.

| Part | Finished course (Buddhist Texts) | The drafts had |
| --- | --- | --- |
| Hub page | `buddhist-texts-hub.html` from `make_hubs.py`: hero, facts, grade-band picker, unit cards, "Practice every day" | Unit titles and one line each |
| Course contents page | `buddhist-texts-course.html`: every unit, chapter and lesson, by band | Nothing (two drafts had one long page) |
| Unit pages | 17 × `bud-uN.html`, each with 2 chapters | Nothing |
| Lessons | 300 lessons: main idea, reading, key words, a "look" (data, source or think), 3 checks | Half the chapters of two books had a paragraph and 3 checks |
| Reviews and tests | Chapter review, unit test, spiral review, word match, writing task, "send to my teacher" | Nothing |
| Pictures | A pencil drawing for every unit and the hub | Nothing |
| Daily Drafts | A bank in `daily-drops.html` at `/drops/<subject>/<grade>`: 10 strands per band | Separate one-line cards (not the site's Daily Drafts) |
| Standards | `_work/standards/<id>.json`, one entry per unit | Nothing |
| Wiring | `_redirects`, home doors, Explore menu, jump menu, sitemap, cache | Added by hand, then removed |

Counts per band come from the LEVEL table in `_work/bud/SPEC.md` and are enforced by
`validate.py`. Keep them exactly:

| Band | Level | Reading paragraphs | Choices per check | Chapter review | Unit test | Wrap words |
| --- | --- | --- | --- | --- | --- | --- |
| K–2 | k2 | 2–3 | 3 | 6 | 10 | 8 |
| 3–5 | 35 | 3 | 4 | 8 | 15 | 12 |
| 6–8 | 68 | 3–4 | 4 | 8 | 15 | 12 |
| 9–10 | hs | 3–4 | 4 | 8 | 15 | 12 |
| 11–12 | hs2 | 3–4 | 4 | 8 | 15 | 12 |

Every chapter: 3–4 sections, 2–4 lessons each, exactly 3 checks per lesson.
Aim for 16–18 units per book, 2 chapters per unit (Buddhist Texts: 17 units, 34
chapters, 300 lessons).

**The site uses five bands, the drafts used four.** Split each draft's "9–12" units
into 9–10 and 11–12.

---

## 2. Course ids and addresses

All of these were checked on 2026-09-29 and are free (no files, no `_redirects`
lines, no `_work` folder). Check again before you start.

| Book | Course id | Unit pages | Short links | Hub | Contents |
| --- | --- | --- | --- | --- | --- |
| Sports History | `spt` | `spt-u1.html` … | `/spt1` … | `/sports` | `/sports-course` |
| The Measured Step | `mar` | `mar-u1.html` … | `/mar1` … | `/martial-arts` | `/martial-arts-course` |
| Europe | `eur` | `eur-uN.html` | `/eurN` | `/europe` | `/europe-course` |
| China | `chh` | `chh-uN.html` | `/chhN` | `/china` | `/china-course` |
| Japan | `jpn` | `jpn-uN.html` | `/jpnN` | `/japan` | `/japan-course` |
| Mexico | `mex` | `mex-uN.html` | `/mexN` | `/mexico` | `/mexico-course` |
| Russia | `rus` | `rus-uN.html` | `/rusN` | `/russia` | `/russia-course` |
| These United States | `usa` | `usa-uN.html` | `/usaN` | `/us` | `/us-course` |
| Illinois | `ill` | `ill-uN.html` | `/illN` | `/illinois` | `/illinois-course` |

**Watch for overlap with courses that already exist:**
- `chn` is **Chinese Classics** (a texts course). China history must use `chh`.
- `ush` is **U.S. History, grades 6–8**, finished. These United States (`usa`) runs
  K–12; its 6–8 units must not repeat `ush` — point to it instead (use `LINKS`).
- `wcs` is **World Cultures K–12**. Read its outline before writing Japan, China,
  Mexico, Europe or Russia; link, don't copy.
- `ss` Social Studies already holds civics (branches of government, the Illinois
  constitution). The U.S. and Illinois books point to those units; they don't
  repeat them.

---

## 3. Build steps (per book)

Follow `_work/course/HANDOFF.md` steps 1–11, copying `_work/bud`. In short:

```
mkdir aog-deploy/_work/<id>
# copy from _work/bud: validate.py, assemble.py, build_bud.py, inject_bud_jump.py, plumb_bud.py
# write outline.py (BANDS, UNITS, LINKS) and SPEC.md (voice section changed, LEVEL table verbatim)
cd aog-deploy/_work/<id> && python3 assemble.py <n>          # per unit, until OK
cd aog-deploy && sh _work/course/run_course.sh <id>           # groups → build → jump menus → plumb
python3 _work/course/make_hubs.py doors <id>                  # hub page (add <id> to COURSES first)
python3 _work/course/make_hubs.py check                        # every link resolves
python3 _work/art/apply_banners.py --style pencil --only <id>  # after the drawings exist
python3 _work/art/sketchicons/shortmap.py                      # refresh aog-sketch.js SHORT map
python3 _work/standards/export_outlines.py && python3 _work/standards/build_standards.py
```

A new course must also be added to: the `jump_block()` regex in
`_work/course/build_course.py`, `COURSES` and `EXPLORE` in `make_hubs.py`,
`COURSES` in `_work/course/dash_catalog.py`, `META` in
`_work/standards/export_outlines.py`, the `COURSES` tuple in
`_work/standards/build_standards.py`, and `_work/art/banners.json`.

**Writers:** one agent per unit. Prompt: "Read SPEC.md, find unit n=N in outline.py,
write ch<N>.json files and uN_head.json, run `python3 assemble.py N` until OK." See
`_work/WRITER_PROMPT.txt`; `_work/RESUME_NOTE.txt` if a writer stops partway.

---

## 4. What every page looks like

Do not hand-write course pages. `build_course.py` and `make_hubs.py` write them, so
they match the rest of the site automatically:

- **Unit page:** navy masthead (kicker, "Unit N · title", back to contents), the unit's
  pencil drawing with the line "Pencil drawing, not a photograph: …", big question,
  timeline, chapters (story, sections, lessons), chapter reviews, wrap-up, word match,
  unit test, spiral review, writing task with Print, practice rooms, previous/next,
  "For the teacher".
- **Contents page:** every band, unit, chapter and lesson, each unit with its drawing.
- **Hub:** hero with the hub drawing, facts (units, chapters, lessons, bands), a grade-band
  picker, unit cards, and "Practice every day" linking to `/drops/<subject>/<grade>`.

The pages load `aog-topbar.js` and `aog-grace.js`, which bring in `aog-calm.css`,
`aog-smooth.css` and `aog-sketch.js`. Spanish is in the page chrome (buttons, labels,
headings) only; lesson content is English, the same as every other course.

---

## 5. Pictures

Rules: `_work/art/pencil/GUIDE.md` (approved 2026-09-27) and `BATCH_PROMPT.txt`.

- One pencil still life per unit, plus one for each hub: a focal object and one or two
  supporting objects (four at most). No wide landscapes.
- No faces, nothing frightening, no flags, no political or hate symbols, no fake
  readable writing (hint-lines only). Each drawing distinct from its neighbours.
- For these books in particular:
  - **Martial arts and sports:** objects only — a folded gi and belt, a mat edge,
    a fencing mask, a roda circle drawn on a floor plan, a wrestling singlet on a
    hook, a scorebook. **No one mid-strike, no fighting figures.**
  - **War, conquest, camps, famine chapters:** a document, a map, a building, a
    tool — never violence or suffering shown.
  - **Religious buildings** (Russia, Mexico, Japan, Europe): the building or object,
    no deity figures, the same as the faith courses.
  - **Indigenous peoples:** objects and places (a milpa field plan, a pot, a mound
    site plan), no costumes, no headdresses as decoration.
- Pipeline: `kit/scenes/<id>-still.glsl` → `node kit/gbuf.js` →
  `pencil/pencil.py <id> --params … --final`; `pencil/frame.py` fits the framing rule
  (objects in x 44–90 %, y 6–64 % of a 1600×560 frame; left 40 % and bottom 35 % clear
  for the navy cover and title).
- Outputs in `aog-deploy/img/banners/`: `<id>-u<N>-pencil-1600.webp` (under 250 KB),
  `<id>-u<N>-pencil-900.webp`, `<id>-u<N>-pencil-900.jpg`; hub:
  `<hub-name>-hub-pencil-*`.
- Alt text in `_work/art/banners.json` (`pencil_alt`), always starting
  "A pencil drawing of …". Batch artists write `pencil/params_<BATCH>.json` and
  `pencil/alt_<BATCH>.json`, not the shared files.

---

## 6. Daily Drafts

The site's Daily Drafts are one page, `daily-drops.html`, fed by generated banks.
Do **not** make separate Daily Drafts pages (the drafted `dd-*.html` pages were
not the site's Daily Drafts).

- Write a bank module like `_work/ddfaith/bud.py`: `BANDS['k2'|'35'|'68'|'912'|'adult']`,
  each band exactly **10 strands**, each strand `(en, es, items)`. Items:
  `["mc", q, answer, [3 wrong]]`, `["tf", q, bool]`, `["voc", word, def]`,
  `["open", q, model]`.
- Build it into `daily-drops.html` with `_work/ddworld/` (history books sit beside
  `cul.py`), which writes between its BEGIN/END markers.
- Add the subject key to `var SUBJ`, `SUBJN`, the alias map, the rail button and its
  colour rule in `daily-drops.html`; to the `dd-(…)` id regex in `index.html`; and to
  `_work/standards/drafts.json`.
- Routes already exist: `/drops/<subject>` and `/drops/<subject>/<grade>`.
- Suggested subject keys: `sports`, `martial`, `europe`, `china-history`, `japan`,
  `mexico`, `russia`, `usa`, `illinois`.

---

## 7. Where the books appear

`plumb_<id>.py` handles `_redirects`, `sw.js` (CACHE bump and precache) and the
sitemap. By hand, keeping the two in step:

- `aog-deploy/index.html`, home doors, `#aogdnList-courses`:
  - **World Cultures** fold (`#aogdnSubjCultures`): Europe, China, Japan, Mexico, Russia.
  - **Social studies** fold (`#aogdnSubjSocial`): Sports History, These United States,
    Illinois, The Measured Step.
  - Each link uses the book's own unit drawing in `span.aogdn-cpic`, never a shared
    placeholder (the removed version reused one globe drawing for every book).
- `aog-deploy/aog-topbar.js`, `var EX` (line ~331): the same entries in the same order
  — it is a hand copy of the home doors.

---

## 8. Voice and content rules

Site-wide (CLAUDE.md): plain words for everything people use to find their way;
neuro-affirming language; no endless motion. Curriculum wording is the writer's,
within the SPEC.

From `_work/bud/SPEC.md`, applying to every history book:
- Original text only. Every lesson teaches something specific and true; its checks
  are answerable from its reading.
- Beliefs are attributed ("many Catholics believe…"), never asserted or denied.
  Practices are described, never led.
- No loaded words. Hard topics told factually, with the range of responses.
- Exact quotations only from named U.S. public-domain translations; otherwise
  `"paraphrase": true`. Never invent a citation, date, number or name.
- Illinois and Chicago links only with facts you are sure of. American spelling.
- Wrong choices come from real confusions, never from mocking anyone. Spread correct
  answers evenly across positions.

From the drafts themselves — Jimmy's rules for these books (put them in each SPEC):
- **Deep time first.** Start with land, peoples and archaeology, not the famous date
  (Mexico does not start in 1519; the U.S. does not start at Plymouth; Illinois starts
  at Cahokia, not Fort Dearborn).
- **Indigenous first** in the U.S., Illinois and Mexico books. Name nations
  (Haudenosaunee, Potawatomi, Mexica…), never "a tribe" or a costume.
- **Myth stays labeled as story.** "A story the court told," not "how the world began"
  (Japan's origin stories, Rurik, "Third Rome").
- **Name the institution, not the mood.** A dynasty, a law, a treaty, a court — with
  dates.
- **Maps are claims.** Borders, "Europe," "China," "Japanese" are arguments with a
  history, taught as such.
- **Hard chapters stay concrete:** slavery, removal, famine, camps, empire, war —
  policy with dates, not slogans.
- **Martial arts and sports: history only.** No technique, strike, choke or throw is
  taught or shown. A guest instructor follows school PE rules; the page still
  teaches history.
- **Link, don't copy.** Civics lives in Social Studies; IHSA and Friday night lights
  live in Sports History; the U.S.–Mexico War belongs on both shelves.

---

## 9. Starting outlines

These are the drafts' own unit titles. They are a starting point for `outline.py`,
not a finished outline: each book still needs chapters, topics and a story per
chapter, and its 9–12 units split into 9–10 and 11–12.

### Europe


**K–2**

- A shore with many seas — Mediterranean, Atlantic, North, Baltic. People move on water and rivers.
- Stones standing — A circle of stones, a mound. Someone planned a place before writing.
- Many languages at the market — Europe is not one tongue. A child can hear that as normal.

**3–5 · How rooms got names**

- After the ice — Hunter groups, then farmers from the Near East. Deep time before Greece.
- Greece as many cities — Athens is not “Greece.” A polis, a colony across the sea, a theater.
- Rome as a city that became a system — Roads, law, army, slaves, citizens. Then a split east and west.
- A church and many kings — After Rome in the west: monasteries, manors, new crowns.
- Towns, guilds, a charter — A wall and a market as civic architecture.

**6–8 · Fracture and expansion**

- Islam, Byzantium, Latin west — Three rooms sharing the Mediterranean. Spain, Sicily, Constantinople.
- Plague, print, reform — Death that moves. A book that multiplies. Churches that split.
- Ships and empires — Europe does not stay in Europe. Atlantic slavery and colonies belong in this course, not only in “world.”
- Revolutions and nations — 1688, 1789, 1848. “Nation” is a new kind of claim.
- Industry and class — Mills, coal, railroads, new poverty next to new wealth.
- Two wars and after — 1914, 1939, camps, iron curtain, EU as a peace project with a market.

**9–12 · Arguments**

- Who is Europe? — Greece vs “the West,” Russia, Turkey, the Balkans, migration now.
- Enlightenment and its limits — Rights language beside empire and race science.
- Fascism, Stalinism, democracy — Three twentieth-century answers. Name institutions, not moods.
- Memory laws and museums — Who may speak the war. Holocaust as European fact, not only German.

> Teacher: “Europe” is not a tribe. Classical Greece is not medieval France. Colonial chapters stay in this room so the map does not look innocent.

### China


**K–2**

- Two long rivers — Yellow River, Yangtze. Mud, millet, later rice. People live where water can be used.
- Marks that mean words — Writing can be pictures that become signs. A bone, a brush, a seal.
- A wall is a job — Earth and brick laid by workers. Not a cartoon dragon fence around “all of China.”

**3–5 · How states got a shape**

- Before any emperor — Neolithic villages. Yangshao, Longshan. Archaeology older than the dynasty list.
- Shang and bronze — Oracle bones. Kings who asked ancestors. Writing we can still read in part.
- Zhou and the mandate story — A court explains why one house may replace another. That story becomes a tool.
- Qin unifies — and dies young — One script standard, roads, harsh law, a short dynasty. Han lasts and names a people in memory.
- The exam and the official — A test as a door into the state. Not everyone got the door.

**6–8 · Empire, world, fracture**

- Silk roads were many roads — Chang’an, oasis towns, Buddhism traveling east, goods traveling both ways.
- Tang and Song — Cities, print, money, poetry, a bigger commercial world.
- Not only Han — Liao, Jin, Yuan (Mongol), Qing (Manchu). Conquest dynasties ruled the map.
- Ming, Qing, and the sea — Zheng He, then limits. Later Europe at the ports. Unequal treaties are a document lesson.
- Revolution century — 1911, warlords, Japan’s invasion, civil war, 1949.

**9–12 · Arguments**

- What counts as “China”? — Xinjiang, Tibet, Taiwan, Hong Kong, overseas Chinese. A map is a claim.
- Mao to reform — Land, famine, Cultural Revolution, then markets under a party-state.
- Women, class, countryside — Footbinding’s end is not the end of the story. Work and hukou still shape lives.
- Writing the past — Dynastic histories, nationalist textbooks, archaeology that argues with the court list.

> Teacher: do not collapse 3,000 years into “ancient China invented X.” Name the dynasty or the site. Myths of unbroken sameness are a modern project.

### Japan


**K–2**

- Islands in a sea — Japan is many islands. People crossed water. A pot, a boat, a mountain someone can name.
- A house with a roof and a garden — Wood, paper, stone path. A room can open to weather.
- A story that is a story — Sun goddess, first emperor — we say “story the court told,” not “this is how the world began.”

**3–5 · How a country got a shape**

- Jōmon and Yayoi — Cord-marked pots. Later rice fields and metal. Deep time before any emperor list.
- A capital that moves — Nara, then Heian-kyō (Kyoto). A city can be designed on a grid copied and changed from China.
- Writing arrives — Chinese characters; then kana. A country can borrow a script and remake it.
- Samurai as a job, then a class — Warriors in service. Not a costume. A social room with rules.
- A closed country that was never fully closed — Tokugawa peace. Dutch at Nagasaki. Ryukyu and Ezo on the edges.

**6–8 · Power and the modern state**

- Kamakura to Sengoku — Shoguns, temples, civil war. Who actually ruled.
- Unification and Edo — Castles, castle towns, status laws, print culture.
- Perry, Meiji, a new map — Treaties, emperor restored as symbol, industry, Hokkaido and Okinawa pulled into the state.
- Empire and war — Taiwan, Korea, China, the Pacific. Students read what the empire did, not a slogan.
- Occupation and constitution — 1945–52. Article 9. A new public room.

**9–12 · Arguments**

- What is “Japanese”? — Ainu, Ryukyu, Korean and Chinese residents, empire, and the postwar myth of homogeneity.
- Memory — Textbooks, Yasukuni, “comfort women,” Hiroshima as both victimhood and a state’s war.
- Economy and after-growth — Miracle, bubble, lost decades, 3/11.
- Okinawa — Kingdom, annexation, battle, bases. A different timeline inside the map.

> Teacher: origin myths are court literature. Jōmon is archaeology, not a national essence. Empire chapters name colonies. No bushido-as-eternal-soul.

### Mexico


**K–2**

- Corn, beans, squash — Food that built villages. A milpa is a designed field.
- A market and a pyramid — People gather. Stone is stacked on purpose. A plaza is a room.
- Two languages at home — Nahuatl, Maya languages, Spanish — a child can hear that Mexico was never one tongue.

**3–5 · How rooms got a shape**

- Before any empire — Olmec Gulf coast. Village life older than Tenochtitlan.
- Maya cities — Writing, calendar, many kingdoms — not one “Maya empire.”
- Teotihuacan and later highland states — A huge city whose rulers we still argue about. Then Toltec memory.
- Mexica / Aztec — Tenochtitlan in the lake. Tribute. A triple alliance, not “all of Mexico.”
- 1521 is not the end of Indigenous life — Conquest, disease, new churches on old sacred ground. People remain.

**6–8 · Colony, nation, revolution**

- New Spain — Viceroy, silver, missions, casta categories, Indigenous towns that kept a council.
- Independence — Hidalgo, Morelos, Iturbide. A long war, then an unstable empire and republic.
- The northern map moves — Texas, 1846–48, a border that cut communities. This is Mexican history, not only U.S. history.
- Reform and a French interval — Juárez, church and state, Maximilian. A liberal project under fire.
- 1910 — Díaz, Madero, Zapata, Villa, a constitution in 1917. Land and oil as arguments.

**9–12 · Arguments**

- Mestizaje as a state story — A unifying myth that can hide living Indigenous nations and Afro-Mexican history.
- The PRI century and after — One-party peace, 1968, 1994, pluralism that is unfinished.
- Labor and the border — Bracero, maquiladora, remittances. Illinois classrooms sit on this wire too.
- Memory — Murals, textbooks, 1968 Tlatelolco, Ayotzinapa. Who paints the wall and who is left off it.

> Teacher: start with maize and cities, not Cortés. “Aztec” is a later label; Mexica is the alliance name students can learn. The U.S.–Mexico War belongs on this page.

### Russia


**K–2**

- A long land — Woods, rivers, winter. Villages far apart. A church with onion domes is a building, not the whole story.
- Many peoples — Slavs, Finnic peoples, Tatars, Siberian nations. “Russian” is one name among others on the map.
- A story the court told — Rurik, Kiev, “Third Rome” — we say story, then we look at towns and trade.

**3–5 · How a state got a shape**

- Before Muscovy — Steppe routes. Khazars. Volga Bulgaria. Novgorod as a trading city.
- Kyivan Rus’ — A cluster of towns, not a modern country. Baptism under Vladimir is a court choice with a long echo.
- Mongol power and the rise of Moscow — Tribute, princes, a new center. Moscow is late, not first.
- Tsars and a growing map — Ivan IV, Siberia as conquest, serfs bound to land.
- Peter, a window, a new capital — St. Petersburg as a designed city facing the Baltic.

**6–8 · Empire and rupture**

- Catherine, Poland, the south — An empire that takes other people’s rooms. Cossacks, Crimea, partitions.
- Serfdom and reform — 1861 emancipation is a door with a high sill. Village and factory both change.
- 1905 and 1917 — War, bread, soviets, two revolutions, civil war. Name institutions.
- Stalin’s state — Plans, famine, camps, victory in 1945 at a terrible cost.
- Cold War to 1991 — A union of republics that breaks. Fifteen doors open at once.

**9–12 · Arguments**

- Is Russia Europe? — Peter said yes. Slavophiles said a different yes. The question is a fight, not a fact.
- Empire after empire — Ukraine, Caucasus, Central Asia, the Far East. 1991 did not end the argument.
- Memory — Gulag, Great Patriotic War, the Orthodox church and the party. Who owns the anniversary.
- Peoples the textbook skipped — Jews in the Pale, Muslims of the Volga, Indigenous Siberia. A state is not one choir.

> Teacher: Kyivan Rus’ is shared medieval history — not a modern property deed. 1917 is not the start of the land. War and famine chapters stay concrete.

### These United States


**K–2**

- Many nations already — People, languages, and towns were here long before a flag with stars.
- Food and place — Corn, bison, salmon, desert farming — different lands, different tables.
- A new flag arrives later — The United States is a country that starts in time. The continent does not.

**3–5 · First rooms**

- Deep time — From the first arrivals over thousands of years to cities like Cahokia and Chaco. Archaeology before the textbook Pilgrim.
- Hundreds of nations — Haudenosaunee, Pueblo, Cherokee, Lakota, Diné, Ojibwe — names, not a single costume.
- Contact is many meetings — Spanish south and west, French rivers, English coast, Russian Alaska. 1492 is not the only door.
- Thirteen colonies are a corner — A strip of the Atlantic. Most of the map is still Native, Spanish, or French.
- A declaration and a constitution — New paper. Who was counted. Who was not.

**6–8 · Expansion and fracture**

- Removal and resistance — Treaty, war, Trail of Tears, Plains wars. Policy with dates.
- Slavery as an institution — Not a mood. Law, cotton, the domestic trade, the war that followed.
- 1861–65 and Reconstruction — Union, emancipation, a second founding that is unfinished.
- Industry, immigration, empire — Factories, new cities, 1898, overseas rooms.
- Women, labor, the ballot — Doors that open by statute, not by feeling.

**9–12 · Arguments**

- Whose origin story? — City on a hill, melting pot, settler colony. Name the claim.
- Federalism and the color line — Courts, Jim Crow, Civil Rights Acts, the unfinished map.
- Indian law is still law — Sovereignty, reservations, urban Native life, boarding schools as policy.
- The U.S. and Mexico share a wound — 1848 belongs on both shelves. Link the Mexico book.
- Power after 1945 — Cold War, movements, immigration law, who gets to be “us.”

> Teacher: page one is not Plymouth. Thanksgiving is not the origin chapter. Illinois is the local zoom lens; this book is the wide map. Civics (branches, Illinois constitution) already lives in Social Studies — do not copy those units here; point to them.

### Illinois


**K–2**

- Prairie, river, lake — Tall grass. Mississippi, Illinois, Chicago rivers. Lake Michigan as a freshwater sea.
- People were already here — Towns and fields before the word Illinois was a state name.
- A star on a flag is a late thing — The state flag is a symbol. The land is older.

**3–5 · How the room got a name**

- Cahokia — A city of mounds near today’s Collinsville. Bigger than most imagine. Abandoned centuries before Illinois was a state.
- Illiniwek and neighbors — Peoria, Kaskaskia, Cahokia as a people-name, Miami, Sauk, Meskwaki, Potawatomi, Kickapoo, Ho-Chunk. Many nations, not one “tribe.”
- French on the rivers — Marquette, Jolliet, missions, Kaskaskia. A Catholic river world before an American one.
- 1818 — A state drawn on paper. Native nations still on the land. Black Hawk’s war (1832) is removal, not a sports mascot.
- A canal, a railroad, a city on a swamp — Chicago after the portage is engineered. The fire of 1871 is one chapter, not the origin.

**6–8 · Labor, color line, farm**

- Downstate and the coal map — Springfield is the capital on purpose. Farms, mines, river towns are Illinois too.
- Lincoln as a local argument — New Salem, Springfield, the debates. Then the war that was national.
- The Great Migration — Black Chicago as a new city inside the city. Redlining as architecture.
- Haymarket, Pullman, the stockyards — Labor history is Illinois history.
- Who is “from here” — German, Irish, Polish, Mexican, Black southern, Indian and Filipino and Chinese Chicago. DuPage is part of that wire.

**9–12 · Arguments**

- Treaty paper and the land under the school — Whose title. What a county name hides.
- Machine and reform — Chicago politics as an institution, not a joke.
- 1968, open housing, the suburbs — How the collar counties were drawn.
- A constitution (1970) and a school-funding fight — The document students actually live under.

> Teacher: start at Cahokia, not Fort Dearborn. Potawatomi removal is local. IHSA and Friday night lights belong in Sports; they can be linked, not copied.

### Sports History


**K–2 · Play**

- Balls, races, water, ice — Each kind of play has a place.
- Teams, turns, a fair rule — A game needs a turn everyone can say.
- Our field — Park, gym, Friday night lights.

**3–5 · How a sport got a shape**

- Baseball — Lot to diamond.
- Basketball — Peach basket, gym balcony.
- Football — School field as civic building.
- Soccer — The world pitch.
- Track, swim, tennis — Time, water, a line.

**6–8 · Sports as history**

- Baseball and the color line — Who was written out.
- Boxing and the newspaper — Prizefighting as public story.
- Basketball and the city — Y to neighborhood gym.
- Friday night football — Civic ritual.
- Olympics — Nations on a stage.
- Title IX — Who gets a roster.
- Disability sport — Paralympic institution.
- Chicago and Illinois — IHSA wrestling 1937; girls 2021.

**9–12 · Institutions**

- College sport — School and business.
- Labor — Reserve clause to free agency.
- Media — Radio, television, the clip.
- Records — What “clean” means.
- Protest — Field as public square.
- Women’s and men’s tours — Parallel industries.

### The Measured Step (martial arts)


**K–2 · Play**

- 1. The circle on the floor
- 2. The jacket and the belt
- 3. Many countries, many names

**3–5 · How an art got a shape**

- 4. Wrestling is older than the league
- 5. Kanō writes a rulebook
- 6. A demonstration in Okinawa
- 7. A Korean school sport
- 8. A bow, a song, a circle
- 9. Queensberry and the ring

**6–8 · Place and nation**

- 10. China is not one kung fu
- 11. Southeast Asia and the diaspora
- 12. Women on the mat
- 13. When the state uses the gym

**9–12 · Who owns the name**

- 14. Lineage and a certificate
- 15. Olympic code versus village art
- 16. Film and the invented style
- 17. MMA as a new league
- 18. Illinois room

**For the teacher**

---

## 10. Before anything goes live

1. `python3 assemble.py N` prints OK for every unit.
2. `python3 _work/course/make_hubs.py check` passes.
3. `node tools/check-contrast.js` and `node tools/check-calm.js` on the new pages;
   after touching `index.html`, `aog-topbar.js` or any shared file, on **every** page.
   A full run can flag a button mid-fade (1:1); re-run that page alone before
   calling it a real failure, and never loosen the check.
4. Serve `aog-deploy` locally and look at a K–2 unit, an 11–12 unit, the contents page
   and the hub, on a phone-size and an iPad-size window.
5. Jimmy reviews one whole book before any of it is merged. Nothing goes live half
   done again.
