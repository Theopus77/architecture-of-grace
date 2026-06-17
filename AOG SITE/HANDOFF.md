# Architecture of Grace — Project Handoff

_Last updated: 2026-06-16. Internal working doc (not part of the deployed site)._

## What this is
Architecture of Grace (AoG) is a **privacy-first, bilingual (EN/ES) SEL + MTSS web app** for schools **and** families. It is a **single self-contained `index.html`** (inline `<style>` and `<script>`) — no build step, no backend. Data lives **on-device** by default; a school may optionally sync to **its own** Google Sheet via an Apps Script Web App. Deployed by drag-and-drop to Netlify.

The framing is a "trinity": **Daily Pulse** (private Quiet Space), **Smart Screener** (scored to MTSS tiers + multi-year growth), **Actionable Content** (every flag maps to a lesson/anchor chart/novel). Tone is relationship-centered — "a guide for growth, not a diagnosis or a behavior count."

## Files & folders
- **Live working file:** `/Users/jramsden/Documents/GitHub/architecture-of-grace/AOG SITE/index.html` — edit this.
- **Deploy folder (drop into Netlify):** `…/architecture-of-grace/aog-deploy/` — contains `index.html` + `pilot/` + collateral. After ANY edit, refresh it:
  `cp ".../AOG SITE/index.html" ".../aog-deploy/index.html"` (and copy changed `pilot/*` files too).
- **Collateral in `AOG SITE/`:** `pilot/` (10 role Quick-Starts `AoG-StartHere-*[ -ES].pdf`, 5 feedback forms `AoG-Feedback-*.pdf`), plus `AoG-Pilot-Pitch.pdf`, `AoG-Pilot-Kit.docx`, `AoG-Pilot-Outcome-Tracker.xlsx`, Sheet sync `Code.gs`/template/guide.
- **Generators** live in the scratch outputs dir (NOT persistent across sessions): `gen_quickstarts.py`, `gen_feedback_addendum.py`, `gen_pitch.py`, `gen_tracker.py`, `gen_kit.js`. Re-create from this doc if needed.

## Hard rules (do not break)
- **NO school or district names anywhere.** Verify every change: `grep -ci darien ".../index.html"` must return `0`.
- **Everything bilingual** (EN + ES).
- User preference: **concise and direct**; minimal preamble.
- Sandbox **cannot delete** files in mounted folders; deploy is built by copy, not `rm`.

## Architecture cheat-sheet
- **Tabs:** `.tab[data-tab="x"]` ↔ `#panel-x`. The generic tab click + `refreshAdmin()` (search it) re-renders every panel; it calls `renderOverview/renderStudents/renderHome/renderGrowth/aogRenderTrajectory/aogGoalPopulate/aogRenderDaily`. To switch tabs in code: `aogQsTab('trajectory')`.
- **i18n:** dashboard uses `data-dl` keys → `DASH_I18N` dict; reflection screens use `data-i18n` → `I18N_UI`; dynamic strings use `DT(en,es)` / local `DTx(en,es)`.
- **Screener records:** `STORAGE_KEY = "aogScreener.v2.results"`. Canonical reader: `getAllRecords()` (local + `REMOTE_RECORDS`). Key fields: `studentId`, `context` ("school"|"home"), `grade`, `window` (Fall/Winter/Spring/Summer, no year), `timestamp`, `normComposite`, `normA/B/C`, `tier`, `trustedAdultFlag`. Year is derived at read time from `timestamp`.
- **Bands:** composite <50 needs support (red), 50–74 worth a reflection (amber), 75+ doing well (green). Demo data: `buildDemoRecords()` / `toggleDemoData()` (`DEMO_FLAG="aogScreener.demoActive"`). Demo includes 3 paired home+school kids (Maya/Isaiah/Sofia) and seeds `aog.tj.links`.

## Feature engines (all in `index.html`)
- **Trajectory** (`#panel-trajectory`, IIFE defining `window.aogRenderTrajectory`): state `window.__aogtj` = `{student, source, view, gran, schoolId, homeId, vis, visUserSet}`.
  - `source`: `all|school|family|both`. **Both** = Home+School overlay (`combinedSvg`, `poolByContext`); link store `aog.tj.links` (`tjLoadLinks/SaveLinks`), `aogTjLink/Unlink`; first-time hint `aog.tj.bothhint`; demo nudge `aog.tj.bothnudge`.
  - `view`: `line|bars`. `gran` (Zoom): `season` (screener windows) or `day|days3|week|week2|week3|month` → renders the **Daily Log** trend for that student via `window.aogDailyTrendSVG(student,gran)`. Students with daily data get a "•" in the dropdown (`tjDailyIds()`).
- **Goal Builder** (`#panel-goals`): relationship-centered IEP goals + objectives by reporting period + progress monitoring; pulls from saved check-ins; copy/print.
- **Daily Log** (`#panel-daily`, `<script id="aog-daily-js">`): store `aog.daily.v1` = `{tpl:{student:{skills,periods}}, logs:{student:{date:{skills,periods:[{name,checks[],note}]}}}}`. Per-student/day skill×period checklist → auto %/smiley (bands 40/60) → daily total. Editable skills (Behavior-log set / Grace competencies / custom) + periods. `aogDailyTrendSVG(student,gran,store)` is the shared trend renderer (also used by Trajectory zoom). History + weekly rollup; CSV export (`aogDailyExport`). Empty (unchecked) days are excluded from trend/history/CSV and not persisted on mere open.
- **Sheet sync** (`#panel-export` area + bottom script): `SCHOOL_SYNC_URL/KEY` from `localStorage` `aog.sync.url`/`aog.sync.key`; in-app connect panel with a green "Connected" banner (`aogSyncRenderState`).

## How to verify changes (the workflow used throughout)
1. Edit `index.html`.
2. Syntax-check changed script blocks with Node:
   extract `<script>…</script>` blocks, `new vm.Script(code)` on the ones matching your change.
3. Functional-test with **jsdom**: pull the relevant block, run it in a JSDOM realm with stubs (`window.DT`, `getAllRecords`, `localStorage`, `SEASON_IX/SEASON_ABBR/pad2`), call the public fns, assert output.
4. `grep -ci darien` → 0.
5. `cp` index.html (and any changed `pilot/*`) into `aog-deploy/`.

## Recently completed (newest first)
- Trajectory **Zoom** toggle (Seasonal + day/3-day/week/2-wk/3-wk/month) pulling Daily Log data; "•" dropdown marker for students with daily logs.
- **Daily Log** tab (checklist grid, %/smiley, editable skills+periods, history, weekly rollup, CSV export) + **Growth trend** chart with granularity buckets.
- Discoverability: renamed Trajectory "Both" → **"Home + School"**; added "Compare home & school →" pill on the Growth tab.
- Feedback forms updated (online + appended PDF addendum pages) with new-feature questions; "Highlights" strip on the Pilot page.
- Home+School overlay + "link as same child"; "What helps me" picker on results screen; quick-start guides refreshed with a "Try these" box.

## Open ideas / next steps
- Roll daily/weekly daily-log averages into the seasonal Trajectory as a contextual marker (currently zoom swaps the chart rather than overlaying on the seasonal axis).
- Optional: push daily-log data to the school's Google Sheet (currently CSV export only).
- Evidence/validation: cut-scores are provisional; the pilot kit exists to gather real signal — that's the real "level up."

## The honest gap
Measures are **provisional, not a validated instrument**; results are a flag for support, not a diagnosis. Family/IEP data use should be reviewed by district counsel and IT. Keep this framing in all copy.
