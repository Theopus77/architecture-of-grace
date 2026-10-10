# Architecture of Grace — standing rules

The site is static and lives in `aog-deploy/` (Netlify publishes that folder).

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
the Lab Bench, Quiet Space; no Daily Practice, no Check-in). Teacher leads with the
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

## The Adult Edition (Book 6)

- Five pages: `/adult`, `/adult/curriculum` (the whole manual), `/adult/workbook`, `/adult/anchors`,
  `/adult/sessions` (the console for running a session). It is all free and nothing is locked
  (Jimmy, 2026-10-10: "ITS ALL FREE ... Nothing is locked"): no key, no encryption, no workbook word.
  Shared skin `aog-adult.css`. Build sources live in `adult-build/` at the repo root (not published);
  read its README before changing them.
- Don't commit `book6.json` (the build source; it travels in the Adult Edition zip). The crisis box goes on every
  Adult page. The workbook sends only by the facilitator's own `?dest=` link, never a default Sheet.

## Housekeeping

- Bump `const CACHE` in `aog-deploy/sw.js` whenever a page changes, so browsers
  pick up the new version.
- Never erase the saved Sheet connection (`aog.sync.url`, `aog.sync.key`,
  `aog.sync.writekey`) outside Disconnect and Delete everything.
- Never erase the Studio's locker (`aog.studio.locker.v1`: its web address and
  key) outside the Studio's own Disconnect. Every clear, reset or Delete
  everything keeps it, and no backup file or Sheet send may carry it.
