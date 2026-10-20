# Architecture of Grace — standing rules

The site is static and lives in `aog-deploy/` (Netlify publishes that folder).

## The address is architectureofgrace.com (standing order from Jimmy, 2026-10-10)

"IT will always be .com from now on unless other wise noted." Every link, canonical tag,
link-preview tag, sitemap entry, printed address and message says **architectureofgrace.com**.
Never write `.org`. Builders and templates (`aog-deploy/_work`, `adult-build`) use .com too.

## Readable text, always (standing order from Jimmy, 2026-09-25)

Text must never be unreadable against what is behind it: no cream or light text
on a white box, no dark text on navy, in light or dark theme, on any page.

- The check also opens every room inside index.html (#framework, #workplace …); add new rooms to ROOMS in tools/check-contrast.js.
- It also opens the music tools' views behind their Go to menu (music-piano.html#lessons, #meet …); add new views to VIEWS there.
- Before every commit that touches an `.html`, `.css`, or `aog-grace.*` file, run:

      node tools/check-contrast.js <the pages you changed>

  and after any change to a shared file (`aog-grace.js`, `aog-grace.css`,
  `aog-topbar.js`, anything loaded by many pages) run it on every page:

      node tools/check-contrast.js

  It opens each page in light and dark and fails on any text below 3:1.
  Do not push while it fails. Fix the page; never loosen the check.
- `aog-grace.js` paints each page's masthead navy with cream text. Anything
  with its own light background inside the masthead must get dark ink (the
  `data-aog-card` marker). Every tag counts, including `p`, `span`, `a` and `button`.
- Close every `<header>` before the page body. An unclosed header pulls the whole
  page into the navy masthead.

## Calm pages for neurodivergent learners (standing order from Jimmy, 2026-09-25)

"Make sure ALL PAGES have the NEURODIVERGENT principles applied to all, PAST
PRESENT AND FUTURE." Every page, now and every page added later:

- Loads `aog-calm.css` (it comes with `aog-grace.js`; a page without that file
  must link it). It keeps the page still sideways, stops iOS zooming when a box
  is tapped (every field is 16px or larger), turns off motion on touch screens
  and when "reduce motion" is set, stops rubber-band scrolling, and shows a clear
  focus ring.
- Must pass, on a phone-size screen:

      node tools/check-calm.js <the pages you changed>
      node tools/check-calm.js            # after changing anything shared

- Design for the iPhone first, then the iPad, then a computer, and check all three.
- No endless animations, nothing that moves on its own, no surprise sounds.
- Neuro-affirming words: describe what a learner can do and what helps; never
  deficit labels.
- No page-change fade or flash (Jimmy, 2026-09-27). `@view-transition` stays
  `navigation: none` in `aog-smooth.css`; a new page simply appears.
- Pages show at 85% on a computer (`aog-calm.css`), except pages with a canvas,
  which draw at full size so a pen lands exactly under the finger. Keep it so.
- A row of grade buttons (the "Every day" strip, class `daily`) sits in one even
  row on an iPad or computer; the shared rule in `aog-calm.css` does it. Reuse
  that markup for new subjects.

## Plain words (standing order from Jimmy, 2026-09-26)

The words people read to *use* the site are written plainly: headings, intros,
buttons, instructions, help text and empty-state messages, in English and Spanish.

- Short sentences. One idea each. Everyday words; no jargon or legal phrasing.
- Say what to do or what happens, not how the system works inside.
- Warm and direct, like a good teacher talking; never cold or clinical.
- Rewriting never changes a fact, a promise or a privacy claim.
- Leave curriculum content alone (lessons, novels, worksheets, questions,
  crosswalks, quoted standards): those words are the teaching.
- Daily Practice (Jimmy, 2026-10-10; it was "Daily Drafts", which said nothing
  about what is behind the door). Spanish: Práctica diaria. Use the new name in
  every word people read. Keep the old name where it is data: the Sheet's tab
  names ("Practice · Daily Drafts · …", AoG-Sheet-Sync-Code.gs), the
  dashboard's matching on them, and old saved rows. The page is still
  `daily-drops.html` at /drops.

## Drop-down menus, not walls of tabs (standing order from Jimmy, 2026-09-26)

"There is too much happening … We need drop down menus … make it a permanent
call moving forward." On the Educator Dashboard and every page after it:

- A row of four or more section, tab or link choices is a drop-down, not a
  row of buttons. `aog-dropdowns.js` does this: list the row in its `ROWS`, or
  give the row `data-aog-dropdown="Label|Etiqueta"`. The old buttons stay in
  the page and the menu presses them, so nothing else has to change.
- Rows of actions (Save, Copy, Download) stay as buttons; only choices of
  *where to look* become menus.
- Exception (Jimmy, 2026-10-05): the music labs' picture doors. Every music
  lab shows the eight labs as small picture doors across the top
  (`aog-labdoors.js`), so moving from room to room is one tap. A new music lab
  joins LABS there and loads the script. The order makes a song: Drum Machine,
  Drum Kit, Piano, Guitar, Bass, Band, Turntables, Mixing Desk. Menus that list
  the music labs use the same order.
- The Drum Machine is `music-pads.html` (/drum-machine; it was the Beat Lab). It is
  where it is at (Jimmy, 2026-10-07: "The old machine is obsolete. THE DRUM MACHINE IS
  WHERE IT IS AT!!!"). The first drum machine, `music-drums.html`, is retired: /drums,
  /classic-drum-machine, /music-drums.html and its guide and lessons redirect to the
  Drum Machine (`_redirects`). Every music tool sends to the Drum Machine: chords to its
  chords bank, the bass's low notes to its notes bank, takes and whole recordings to its
  chops bank (`padschords`, `padstake`). Never link or send to the classic machine again.
- Say a thing once. One short line per screen, not the same description in
  three places.

## One home for the music rooms (standing order from Jimmy, 2026-10-10)

"One location for all the instruments … and that is the studio. Two designs and
layouts seems sort of silly." The Recording Studio (`the-studio.html`, /the-studio,
/music) is the only place the eight rooms are used.

- A room opened on its own address (/piano, `music-piano.html`, an old link or
  bookmark) opens the Studio in that room. A line at the top of each room's
  `<head>` (AOG-STUDIO-ONLY-V1) does it and carries the address along (`?at=`),
  so a lesson, a take or a locker link still lands. A new room gets the same line.
- Design and fix a room as it looks inside the Studio (`html.in-studio`), not on
  its own. There is no "own tab" link.
- The site's checks still open each room on its own; that is expected.
- The Studio has no site top bar (Jimmy, 2026-10-10). Its own line carries Back
  and EN | ES; Back leaves the Studio (the page before, or the front page when it
  was opened from its icon). It is its own Home Screen app: `studio.webmanifest`,
  `studio-icon-*.png`, start `/the-studio`.
- `the-studio.html` is built by `_work/music/make_studio_page.py`; the Guitar and
  Bass by `make_strings.py` (`strings_page.html`), the Band by `make_band.py`
  (`band_head.html`). Change the source, then build.

## The front page starts on Student (standing order from Jimmy, 2026-10-10)

"Show everything … overwhelms me." `index.html` opens on Student (the Studio,
the Lab Bench, the Cube, Quiet Space; no Daily Practice, no Check-in). Teacher leads with the
Dashboard, The Courses, SEL and Daily Practice. Parent has the most doors. Show
everything stays one tap away. The sets are `SETS` in AOG-AUDIENCE-START-V1.
The words under the title follow the choice too (`HERO`, AOG-HERO-AUDIENCE-V1):
short for Students, home and grown-ups for Parents, the classroom for Teachers;
Show everything keeps the full words. There is no gold button under the title.

## Home Screen apps (standing order from Jimmy, 2026-10-10)

"Make a direct link icon" to each of these, each at its own address: the Studio
(/the-studio), Daily Practice (/drops), SEL (/sel), The Courses (/courses), Adult
SEL (/adult), the Educator Dashboard (/dashboard), the calm tools (/calm), the
Microscope Lab (/microscope) and the Oscilloscope (/oscilloscope, also /waves). Each page links its own
`<name>.webmanifest` and `app-<name>-touch.png` (the Studio: `studio.*`), so Add to
Home Screen opens that place, full screen.

- `/sel` and `/courses` are built from the front page's SEL and Courses panels by
  `_work/home/make_door_pages.py`. Change a panel in index.html, then run it.
- `/calm` is index.html opening on the Calm & regulation tools (`#tools`); a script
  at the top of index.html swaps in `calm.webmanifest` and its icon there.
- The calm tools screen has its own quiet look (Jimmy, 2026-10-10: "I don't think it
  is very calming"): `#aog-calm-facelift` at the end of index.html, warm paper (dark:
  muted green-grey), one sage accent, one kind of card, no glows, stripes or lifts.
  It is not one of `aog-chapel.js`'s navy rooms. Keep it so.

## Slips (Jimmy, 2026-10-17: "Make it easier to access and also allow each 'slip' to be edited")

- `/slip` (also `/slips`) with no `?s=` lists every slip in groups with a Find box. A new slip joins a group in
  `GROUPS` in `slip.html` (AOG-SLIP-OVERHAUL-V1); one left out still shows under "More slips".
- Every slip can be changed (`?s=<id>&edit=1`). The change is kept on the device (`aog.slips.edits.v1`) and rides in the
  slip's shared link as `&x=`; a change from a link is always cleaned (`cleanSpec`) before use. A changed slip still sends
  as `slip-<id>`. Keep question ids stable when changing a built-in slip; the Dashboard reads answers by id.
- Anyone can make their own slip (Jimmy: "super simple and easy to use for anybody"): "+ Make your own slip" on the list
  (`?new=1`) or "Save as a new slip" in the editor. Its id is `my-<letters>`; it travels whole in its link (AOG-SLIP-OWN-V1).
  The editor keeps Save and Preview at the foot of the screen, and a question taken away can be put back. Keep it that simple.

## Thinking-skills checklists (Jimmy, 2026-10-14)

"Executive function checklist to use for students … shared digitally or printed like the other slips."

- Every checklist lives in one file, `aog-ef-slips.js` (`AOG_EF`). `slip.html` adds each one to its slips
  (`/slip.html?s=efstart` …), `/ef` (`ef.html`) lists them with Open, Share/Copy link and Print, and the
  Dashboard hands them out and charts the weekly self-check (`efself`). Never copy a step into another page.
- A new checklist joins `AOG_EF`, the Thinking skills group in `aog-topbar.js`, and VIEWS in
  `tools/check-contrast.js`.
- Students read "thinking skills"; teachers read "executive function". Steps are short "I" sentences
  about what helps.
- On paper each checklist fits one page (`/ef` Print; Print all makes one page each). Keep lists short.
- Rules that make sense (Jimmy, 2026-10-15: "Arbitrary rules cause rebellion. Make executive functioning material
  related to helping stop this."): three student lists (`efrule`, `eftalk` done together, `efmyrule`) and the adults'
  guide at `/ef#rules` (the reason test and words that invite a yes, `AOG_EF_RULES`). Pushback is a need for
  fairness and a say; never call it defiance.
- Junior high (Jimmy, 2026-10-15: "A lot of behavioral issues in junior high are caused by this."): `efpublic`
  (called out in front of people) and `efpitch` (pitch a rule change) for grades 6–8, and `/ef#jh` for adults
  (`AOG_EF_RULES.jh`: why pushback peaks at 11–14, what works, words for this age).
- Strength and character for boys (Jimmy, 2026-10-15: "Biblical masculinity", then "Make it secular but with
  biblical undertones. Just make one without biblical references."): six lists in `AOG_EF_STRONG` at `/ef#strong`,
  in the Dashboard's own group and the top bar's Check-in slips door. No verse, name or prayer; the values underneath
  stay: strength under control, used to protect and serve, honest about feelings and mistakes. Never "real men don't…".

## The Adult Edition (Book 6)

- Seven pages: `/adult`, `/adult/curriculum` (the whole manual), `/adult/lessons` (one lesson at a time),
  `/adult/charts` (interactive anchor charts), `/adult/workbook`, `/adult/anchors`, `/adult/sessions` (the
  console). Every Adult page loads `aog-adult.js` (the "Jump to another room" menu); a new Adult page joins
  ADULT there. `aog-sel.js` lists the Adult Edition's lessons in every SEL room menu. It is all free and nothing is locked
  (Jimmy, 2026-10-10: "ITS ALL FREE ... Nothing is locked"): no key, no encryption, no workbook word.
  Shared skin `aog-adult.css`. Build sources live in `adult-build/` at the repo root (not published);
  read its README before changing them.
- Don't commit `book6.json` (the build source; it travels in the Adult Edition zip). The crisis box goes on every
  Adult page. The workbook sends only by the facilitator's own `?dest=` link, never a default Sheet.

## The front page and the Studio rooms are built (Jimmy, 2026-10-11: "FLASH SPEED, LIGHTING BOLT SPEED!")

`index.html` and the rooms (`music-*.html`) are still the files to edit, as always (a room's own generator still
writes its page). Visitors get the made versions, the same pages with their larger blocks of code moved into
`front/` (named after what is in it, so a phone keeps the code between updates and readies it off the main thread):

    python3 tools/build-fast.py

Run it after every change to `index.html` or a room. `_redirects` serves the made pages at the same addresses
(`front.html` at `/`; `fast/music-*.html` at `/music-*.html` and the rooms' short names). The contrast and calm
checks stop while a made page is older than its source. Never edit `front.html`, `fast/` or `front/` by hand.

The retired classic dashboard (`#screen-admin` in index.html) waits in `<template id="aog-classic-dash">`
(AOG-CLASSIC-LATER-V1). Only `?classic=1` builds it; every other visit runs just its code (the check-in needs
`AOG_OBS` from it) and gets an empty stand-in. Building it on every visit doubled the front page's time on a phone.

Eight screens behind the front page's doors (Framework, Ecosystem, Words, PECS, About, Library, Curriculum, Privacy)
keep their contents in `<template data-aog-later>` and are built when `showScreen()` opens them (AOG-SCREENS-LATER-V1).
Edit them inside the template. Only a screen nothing reaches into before it is opened may wait like this: the
Guide, Pilot, Start Here, Workplace and Store are wired up as the page starts, so they stay built.

## The Cube Lab (Jimmy, 2026-10-11: "how to take this to the ceiling … DO them all")

`cube-lab.html` (/cube), its solver `aog-cube.js` (the beginner's way the steps teach) and `aog-cube-short.js` (the
short way: Kociemba's two-phase search, about 20 moves, run in a worker; Jimmy, 2026-10-12: "Big leap"). After any
change to any of them, run

    node tools/check-cube.js

Solve with me has one way: the fewest moves (Jimmy, 2026-10-17: "Why is there a short and fast way? It is confusing … I
want the least possible moves"). No Way menu. The beginner's steps and Level 2 (`aog-cube-l2.js`) are taught in Learn.
The search looks six ways at once (three axes, and the cube's inverse) and averages about 19.8 moves in 2.5 s. Find
fewer moves (Jimmy, 2026-10-17: "DO the two upgrades") runs two workers on tap for up to 30 s: one keeps searching,
`proveLeast` proves how few moves the cube could need. Proven for cubes up to about 13 moves from solved; for a fully
mixed cube it shows the best found and the proven floor. Proving the exact least for any cube needs gigabytes of
tables, so it is not done in the browser. Turning the cube, leaving or hiding the tab ends both workers.

It turns the cube with a finger on an iPad and an iPhone (acting like Safari) and with a mouse, and checks:
a finger on the cube never scrolls the page; the space around the cube never moves it; following the arrow,
circling a middle square (the steering wheel) and two-finger swipes make the right moves; Solve with me and
every Learn step reach the end; the three kinds of help, practising one step, the named moves, the camera's
color reader, symbols, Read aloud (never on its own) and the move card. Do not push while it fails; add a
check for anything new the hands can do.

## Skateboarding (Jimmy, 2026-10-11: "a history of skateboarding curriculum … k12 and adult … how to do tricks, grinds … from a science perspective")

- The course is `_work/skt` (id `skt`, 18 units in six bands: K–2 … 11–12 and **Adult**, the first course with an
  Adult band), built like every other course; Daily Practice is the `skate` book (`_work/ddworld/skt.py`).
  Unlike Sports History it **teaches technique**, always safety first (helmet, pads, a safe place, a grown-up near
  children; never stairs, rails, traffic or holding onto a vehicle). Directions say front foot and back foot.
- Only the course and its Daily Practice book are kept (Jimmy, 2026-10-13: "Except for the course itself (the
  written material), get rid of everything else that is skateboarding related"; then "The daily practice you may
  keep"). The Skate Lab (/skate), its 3D trick book, the front-page Skateboarding door and the top bar's skate door are gone; /skate and /skate-lab send
  to the course (/skateboarding). Don't add them back unless Jimmy asks.

## The Microscope Lab, in depth (Jimmy, 2026-10-12: "a quantum leap forward in the Micro")

`science-microscope.html` (/microscope, a Home Screen app) and its depth engine `aog-micro-3d.js` (AOG-MICRO-DEPTH-V1,
WebGL2, no three.js). Nine slides are built in depth (`DEPTH_SPECS`: onion, cheek, elodea, pond, blood, pollen, section,
yeast, crystal): the fine knob moves a thin sharp slice through them, with depth of field from the objective's NA. The
optics are worked out live: finest detail λ/(NA + NA of the condenser), λ/2NA with the iris open; brightfield, phase
contrast, darkfield, slit, polarized light (with the red plate) and fluorescence. Pond water and elodea move only after
Play and stop by themselves after 45 seconds. The depth engine loads only when a depth slide opens and lets go of the
graphics chip when you leave it. After any change to either file, run

    node tools/check-microscope.js

It checks every original slide at every objective, focusing through depth, the Abbe numbers and bar test, every light,
Play, silence while idle, the Home Screen links, and iPhone and iPad in English and Spanish. Do not push while it fails.

## The Telescope, with the real sky (Jimmy, 2026-10-12: "a quantum leap forward … the telescope")

`telescope.html` (/telescope; `science-telescope.html` is an old orphan copy). The bench and eyepiece open as before
with nothing extra loaded. "Real sky" and the star map (`#sky`) load `aog-telescope-astro.js` (Sun, Moon, planets,
Jupiter's moons, Saturn's rings, rise and set, after Meeus and JPL), `aog-telescope-catalog.js` and `data/sky/`
(8,874 stars, 88 constellations, 139 deep-sky objects; built by `data/sky/source/make_sky.py` from d3-celestial,
BSD-3-Clause, license beside it), `aog-telescope-real.js` (the eyepiece as it looks tonight) and
`aog-telescope-map.js` (the WebGL star map; "Point the telescope" turns it once). Location only on tap; Chicago by
default. Four telescopes (90 mm, 130 mm, 8-inch Dobsonian, 1 m), the air and sky glow change what shows. After any
change to these files, run

    node tools/check-telescope.js

It checks the sky against cited textbook values, every original target and lesson button, the map loading only on
demand and staying still, pointing, and iPhone and iPad in English and Spanish. Do not push while it fails.

## Silent until used (standing order from Jimmy, 2026-10-12)

"This has to be silent when not being used … lighting fast connectivity." Every page, now and later: nothing moves,
redraws or makes a sound while nobody touches it, and a page that is not itself a 3D room loads no 3D or heavy engine
(three.js, `aog-*3d.js`, `aog-figure3d.js`, `aog-3dkit.js`, `aog-micro-3d.js`, star catalogues) until someone taps for
it. The 3D rooms (the Dojo, the Kitchen, the Sewing Room) may build their scene as they open, then must be still. Leaving 3D frees the graphics
chip. After any change to a page with animation, 3D or sound, run

    node tools/check-silent.js <the pages you changed>     # or with no pages, every page in its list

and add new pages and rooms to its PAGES list. Do not push while it fails.

## The silent treatment: light speed (standing order from Jimmy, 2026-10-12)

"Make sure everything that has been built and will continue to be built has the silent treatment as I want this website
LIGHT SPEED!!" Every feature, now and later:

- Loads nothing until it is needed. A room's new script is `defer`. A heavy engine, worker, model or big file is fetched on
  the first press that needs it, never as the page opens.
- Is silent and still out of sight. Every AudioContext a page makes goes through `AOGVU.own(ctx)`, so the Studio's hush pauses
  it. Players, the mic, timers, rAF and polling stop on the `aog-hush` event (`detail.on`) and when the tab is hidden. They wake
  only what they paused (AOG-SILENT-V1, `aog-vu.js`).
- Rests when idle: no timer, loop or rAF while nothing plays, listens or is dragged. A paused player suspends its engine.
- Does heavy work in a Worker, or in slices of 12 ms or less.
- Never slows the note path: tap-to-sound stays 10–25 ms on a phone.
- Rooms and the front page are built with `python3 tools/build-fast.py`. Big new code goes in its own file, loaded when used.

## The Dojo and Practice the Moves (Jimmy, 2026-10-12: "instructions on how to learn moves with this engine showing the person the moves")

- The Dojo is `dojo.html` (/dojo): the site's figure (`aog-figure3d.js`, outfit "gi") shows the 36 moves in
  `aog-dojo-moves.js` (ids fixed in `_work/engine3d/CONTRACT.md`) step by step in 3D (`aog-dojo3d.js`, `aog-3dkit.js`).
  `/dojo#<id>` opens a move; `/dojo?side=left#<id>` and `/dojo#<id>?side=left` the other side. Words show at once, the
  3D loads right after, and it draws only when a step plays or the view is dragged. After any change, run
  `node tools/check-dojo.js`.
- The Measured Step (martial-arts history) now ends every unit with Practice the Moves: safe, solo basics into the
  air, numbered steps, What helps, Stay safe and a Watch it in 3D button. The history lessons stay history-only. The
  practice lessons live in `_work/mar/mar_practice.py` (assemble.py adds them); after a change, rebuild the course and
  run `node tools/check-mar-practice.js`.

## The Kitchen and the Sewing Room (Jimmy, 2026-10-12: "take this amazement to FACS for cooking and sewing lessons")

- The 3D Kitchen is `kitchen.html` at **/kitchen-lab** (/kitchen stays the older "Kitchen & the Sewing Table" page,
  `fcs-shop.html`). The site's figure (outfit "apron") cooks the 9 recipes in `aog-kitchen-recipes.js` and any recipe a
  person types or pastes in (read on the device, English or Spanish, scaled ½×–3×, saved on the device), and shows the
  28 skills one at a time: `/kitchen-lab#<recipe>`, `/kitchen-lab#skill-<id>`, `/kitchen-lab#plug-in`. After any change,
  run `node tools/check-kitchen.js`.
- The 3D Sewing Room is `sewing.html` at **/sewing-lab** (also /sewing): 20 moves in `aog-sewing-moves.js` — hand
  stitches whose thread really goes through the cloth (front and back), buttons, cutting, the machine and pressing.
  `/sewing-lab#<id>` opens a move. After any change, run `node tools/check-sewing.js`.
- FACS lessons and room pages link into both (`_work/fcs/practice3d.py`, `add_3d.py`, `add_3d_rooms.py`); after a
  change run `node tools/check-facs-3d.js`. The ids are fixed in `_work/engine3d/CONTRACT.md`.

## Piano licks, ready for a song (Jimmy, 2026-10-19: piano licks "that follow the same style of the guitar and bass licks"; "I could use them for in making a song")

- Licks to try sits right under the Piano's keys, closed (`#pkLicks`, class `aog-licks-near`; `aog-labdoors.js` keeps it
  there in the Studio). Opening it loads `aog-piano-licks.js`: 154 licks in 22 groups, written against chords like the
  Guitar's and the Bass's (the format is in its header). A new lick joins `RAW` and `W` there.
- Each lick is whole bars from beat 1, plays at the song's tempo (`AOGSong`) in the room's key, lights each key as it
  sounds (blue right hand, purple left) and widens the keys in view while it plays (`AOG_PKV` in `buildKeys`).
  Fit to my chords puts it on the room's chord pattern; Repeat 1, 2, 4; ● Record this lick makes a take through
  `REC.addTake` (`aog-recorder.js`), so + Add to My Track and Send to the drum machine take it. Keep these words the
  same in every room that has licks.
- After any change, run `node music-handoff/tests/solo/pianolicks.js` (the numbers in all 24 keys and fitted to other
  chords, a render with no clicks, iPhone and iPad). Do not push while it fails.

## No floating My notes button (Jimmy, 2026-10-18: "I don't like the my notes button. Please remove that")

`aog-markup.js` no longer puts the floating My notes button on any page. Highlights and notes still work, and a tap on
a highlight still edits or removes it. Don't add the button back unless Jimmy asks.

## Housekeeping

- Bump `const CACHE` in `aog-deploy/sw.js` whenever a page changes, so browsers
  pick up the new version.
- Never erase the saved Sheet connection (`aog.sync.url`, `aog.sync.key`,
  `aog.sync.writekey`) outside Disconnect and Delete everything.
- Never erase the Studio's locker (`aog.studio.locker.v1`: its web address and
  key) outside the Studio's own Disconnect. Every clear, reset or Delete
  everything keeps it, and no backup file or Sheet send may carry it.
