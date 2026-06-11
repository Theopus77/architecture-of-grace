# Architecture of Grace — source bundle

This folder is the **source of truth** for the site. You edit small, readable
module files here, run one command, and out comes the single deployable file
your school networks love: `dist/index.html`.

The guiding principle is **maintain modular, deploy single-file.** The deployed
artifact stays one self-contained HTML file — which is the right choice for this
audience (a teacher can run it from a USB stick, the service worker caches it in
one shot, and there are no extra files to 404 in a basement classroom with no
Wi-Fi). But the *code you actually touch* lives in clean, separate modules below.

---

## Build it

```
python3 build.py
```

That produces **`dist/index.html`** and **`dist/sw.js`** — your complete deploy
set. Requires only Python 3 (standard library — no internet, no packages).

`build.py` takes `base.html` (the original app), runs the ordered steps in
`build/` (which inline the source modules), then **stamps a build version**
(date+time) into both the page footer and the service-worker cache name. That
means every build you upload automatically refreshes returning visitors — you
never have to remember to bump a cache number.

Upload everything in `dist/` to your web root. Optionally add
`fonts/opendyslexic-400.woff2` + `-700.woff2` for true never-online dyslexia-font
support (the page falls back to the CDN if they're absent).

---

## What's here

```
src/
├── build.py            ← run this. Outputs dist/index.html
├── base.html           ← the authoritative original app (build input)
├── modules/            ← the code you edit (all my added features live here)
│   ├── engine2.js        Regulation engine: crisis triage, practice tracker,
│   │                     passport reward, feelings wheel, bilingual EN/ES
│   ├── grace-tools.js    Sensory toolkit (paced breathing, tap pad) + the full
│   │                     Spanish PECS deck + adult-first grounding gate
│   ├── css6.css          Styles for all of the above (the "components" layer)
│   └── engine.js         First-pass engine; kept only so the build reproduces
│                         exactly. engine2.js supersedes it at build time.
├── build/              ← the ordered build steps build.py runs (patch.py … patch9.py)
├── reference/          ← read-only audit copies (NOT used by the build)
│   ├── tokens.css        The :root design tokens (colors, type, shadows), lifted
│   │                     from base.html so brand/design is easy to read
│   └── accessibility.css Global reduced-motion + focus-visible rules, for a11y audits
├── sw.js               ← offline service worker (deploy alongside index.html)
└── dist/
    └── index.html      ← the built, deployable single file
```

---

## Where to change common things

- **A regulation tool's behavior** (breathing pattern, tap pad, feelings wheel) →
  `modules/grace-tools.js` (breathing/tap) or `modules/engine2.js` (feelings wheel).
- **A translation / new Spanish string** → search the `I18N_UI.*` blocks in
  `modules/engine2.js` and `modules/grace-tools.js`. The full PECS card deck is the
  `CARD_ES` map in `grace-tools.js`.
- **A PECS card or category** → the `PECS_LIBRARY` lives in `base.html`; the two
  sensory tracks I added (Sensations, Sensory Needs) are in `addSensoryCategories()`
  in `grace-tools.js`, with Spanish in `CARD_ES`.
- **Colors / fonts / shadows** → the `:root` block in `base.html` (mirrored for
  reading in `reference/tokens.css`).
- **Offline caching behavior** → `sw.js` (bump the `CACHE` name when you ship a new
  build so old caches refresh).

After editing any module, re-run `python3 build.py`.

---

## Deploy checklist

Put these at your web root together:

- `dist/index.html` (renamed to `index.html`)
- `sw.js`
- `manifest.json`
- the favicon / `icon-*` / `apple-touch-icon` files
- your `/files` and `/previews` folders

The service worker (`sw.js`) only activates over `https://` (e.g. your `.org` /
Netlify domain), not from `file://` — that's expected and harmless. Once live, it
caches the page and assets so everything works offline at zero latency.

---

## A note on "full modularization"

A deeper split (separate `state-engine.js`, `localization.js`, etc. carved out of
`base.html`) was considered and intentionally **not** done: ~90% of `base.html` is
the original author's minified/obfuscated code, and dismembering it is high-risk
for little gain — you can't meaningfully read or audit obfuscated code wherever it
lives. The clean, actively-developed code is already isolated in `modules/`, which
is where the maintainability actually matters.
