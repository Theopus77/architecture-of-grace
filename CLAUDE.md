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

## Drop-down menus, not walls of tabs (standing order from Jimmy, 2026-09-26)

"There is too much happening … We need drop down menus … make it a permanent
call moving forward." On the Educator Dashboard and every page after it:

- A row of four or more section, tab or link choices is a drop-down, not a
  row of buttons. `aog-dropdowns.js` does this: list the row in its `ROWS`, or
  give the row `data-aog-dropdown="Label|Etiqueta"`. The old buttons stay in
  the page and the menu presses them, so nothing else has to change.
- Rows of actions (Save, Copy, Download) stay as buttons; only choices of
  *where to look* become menus.
- Say a thing once. One short line per screen, not the same description in
  three places.

## Housekeeping

- Bump `const CACHE` in `aog-deploy/sw.js` whenever a page changes, so browsers
  pick up the new version.
- Never erase the saved Sheet connection (`aog.sync.url`, `aog.sync.key`,
  `aog.sync.writekey`) outside Disconnect and Delete everything.
