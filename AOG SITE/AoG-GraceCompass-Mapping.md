# Grace Compass — Domain → Crosswalk Mapping (Phase 1)

_Generated 2026-06-18. This is the precision-mapping logic now embedded in `index.html` (`#aog-gc-engine`). The 5 SECULAR crosswalk DOCX remain the single source of truth — this document only records how a check-in is routed to a row._

## Source of truth
All 81 rows from the five grade-band crosswalks are embedded verbatim as `window.AOG_CROSSWALK` (`#aog-gc-data`): `K-2` (18), `3-5` (19), `6-8` (15), `9-10` (14), `11-12` (15). Each row carries its original five columns (Novel Scene, SEL Theme, Lesson, Anchor Chart, Neuro-Affirming Adjustment) plus two derived tags: `dom` and `risk`.

## How a check-in maps to a row
1. **Grade → band** via the app's existing `aogGradeToBand()`. Adult/no-grade records return nothing here (they belong to the Practitioner Edition pathway).
2. **Lowest domain** via the app's existing `aogLowestDomainKey()` (ties resolve A < B < C). If the lowest domain still scores 75+, the student is "doing well" and the panel switches to an **enrichment** row (an `All Four · Integration` capstone) instead of a support row.
3. **Row selection**: filter the crosswalk to `band + domain`, gentlest-risk first, take the top resource (plus one alternate). If that band teaches the domain in a different volume, the engine walks to the **nearest band** that does and labels it a *foundational anchor* — still fully traceable.

## Domain → theme assignment
The screener scores three domains; the curriculum is built on four pillars. They map as follows:

| Screener domain | Crosswalk pillars / themes folded in |
|---|---|
| **A — Emotional Regulation & Well-Being** | Regulation Toolkit, Body-as-Information, emotional-literacy / "feelings" lessons, Self-Management, "the toolkit has a limit." |
| **B — Self-Compassion & Growth** | The **Identity** pillar + the **Self-Compassion** pillar: inner critic vs. coach, guilt vs. shame, the Friend Test, mistake-tolerance, "I am more than my worst moment," masking/mirror, narrative authorship, rejection-is-not-evidence. |
| **C — Social Competency & Repair** | The **Forgiveness** pillar + the **Grace** pillar: repair protocol, apology, impact vs. intent, reconciliation, charitable interpretation, grace, limits/boundaries, "difficult vs. unsafe." |

Because this is a forgiveness-centered novel, **domain C is the richest** and **domain A is intentionally sparse** (regulation is taught through the recurring Toolkit). That is why the panel pairs each A/B/C lesson with up to **five curated regulation tools** for "Right Now" support — the tools carry the in-the-moment load; the crosswalk row carries the longer-term teaching.

## Risk flags
`★` (higher-sensitivity) and `★★` (highest-sensitivity) are read directly from the crosswalk scene text. Flagged rows surface a matching support-protocol note (trusted-adult / counselor co-facilitation + posted Crisis Resources page), mirroring the printed protocols. 18 rows carry a flag; 2 are `★★`.

## To adjust a mapping
Re-tag a row by editing its `dom` value in `#aog-gc-data` inside `index.html` (`A`, `B`, `C`, or `ALL`). No other code changes are needed — selection, fallback, and citation all follow the tag.

---

## Adult / Practitioner pathway (Clinical Edition)
Adult records (`population === "adult"` or `grade === "Adult"`) route to a parallel engine (`#aog-gc-adult`) whose source of truth is **Architecture of Grace · The Clinical Edition** — the 12-session manualized group intervention. The data layer `window.AOG_SESSIONS` holds all twelve sessions (title, phase, anchor concept, clinical aim, domain tag, risk tier). The same lowest-domain logic applies; the panel surfaces the relevant session(s) **in program order**, citing "Practitioner Edition · Session N · [Title] · Phase". Domain → session map:

- **A — Regulation & Well-Being:** S4 Feelings as Messengers, S5 The Backpack Inventory.
- **B — Self-Compassion & Interior Work:** S2 Identity Is Not Behavior, S3 The Two Voices, S6 The Compassionate Witness, S8 Forgiving the Younger Self, S9 Inherited Shame.
- **C — Social Competency & Repair:** S7 Grief vs. Resentment, S10 The Living Amend, S11 Forgiveness ≠ Reconciliation.
- **Doing well →** Legacy phase (S12 The Final Backpack Audit, S11).

Risk protocols are the manual's own: ★ Elevated (co-facilitator in room; same-day clinical availability), ★★ High (pre- and post-session consultation), ◆ re-screen for active risk before the session. To re-tag, edit a session's `dom` in `#aog-gc-adult`.

## Provisional Spanish overlay
`window.AOG_CROSSWALK_ES` now covers **all 81 rows** — the 19 primary picks (`#aog-gc-es-data`) plus the remaining 62 (`#aog-gc-es-data2`, merged via `Object.assign`). In ES mode the panel and the internal viewer use these and show a **"Traducción provisional · revisión pendiente"** tag; any future untranslated row falls back to English with an "edición ES en preparación" note. **English remains the single source of truth.** These strings need a native-speaker / clinical review before public release, or replacement with official ES editions when they exist. Keyed by `"band|lesson"`.

## Crosswalk Viewer (internal tab)
The viewer is built into the dashboard as a **hidden** tab (`#panel-crosswalk`, script `#aog-gc-viewer`), not a standalone file. It reuses the embedded data (no duplication) and toggles between the 81 K–12 rows and the 12 Practitioner sessions, with band / domain / risk filters, search, and EN/ES.

To reveal it (it stays hidden for normal users):

- Open the dashboard with `#crosswalk` in the URL (e.g. `…/index.html#crosswalk`), **or**
- Run `aogShowCrosswalkTab(true)` in the browser console.

Once revealed it persists on that device via `localStorage["aog.internal"] = "1"`. (The earlier standalone `AoG-Crosswalk-Viewer.html` is now redundant — safe to delete.)
