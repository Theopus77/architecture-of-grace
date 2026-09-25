# Architecture of Grace — standing rules

The site is static and lives in `aog-deploy/` (Netlify publishes that folder).

## Readable text, always (standing order from Jimmy, 2026-09-25)

Text must never be unreadable against what is behind it: no cream or light text
on a white box, no dark text on navy, in light or dark theme, on any page.

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

## Housekeeping

- Bump `const CACHE` in `aog-deploy/sw.js` whenever a page changes, so browsers
  pick up the new version.
- Never erase the saved Sheet connection (`aog.sync.url`, `aog.sync.key`,
  `aog.sync.writekey`) outside Disconnect and Delete everything.
