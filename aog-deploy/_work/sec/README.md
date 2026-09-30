# Secret Societies, K–12 (`sec`) — how it was built (2026-09-30)

Jimmy's brief: "a deep dive on secret societies … authentic, hard to find material … same K–12 format."
His decisions: brotherhoods and orders, plus criminal and hate secret orders (grades 6–12 only);
resistance networks and college/power clubs left out; Bill Cooper taught in 11–12 as a documented
life plus a claims ledger students sort themselves (documented / disputed / shown false).

| Part | Where |
| --- | --- |
| Research dossiers d1–d9, source check, verified list | `research/` (`verified.md` gates what lessons may use) |
| Outline (17 units, 34 chapters, LINKS) and writer contract | `outline.py`, `SPEC.md` |
| Units | `ch1…ch34.json`, `u1…u17_head.json` → `python3 assemble.py N` and `python3 ../course/quality_check.py N` |
| Pages | `build_sec.py`, `inject_sec_jump.py`, `plumb_sec.py` (run `sh _work/course/run_course.sh sec` from aog-deploy/) |
| Hub | `python3 _work/course/make_hubs.py doors sec` (social-studies cards, `cards="ss"`) |
| Drawings | `_work/art/kit/scenes/sec-u*-still.glsl`, `secret-societies-hub-still.glsl`, `kit/secparts_{a,b}.glsl`, `pencil/params_sec{A,B}.json`, alt text in `banners.json`; then `python3 _work/art/apply_banners.py --style pencil --only sec` |
| Daily Drafts | `_work/ddworld/sec.py` (subject key `secrets`, /drops/secrets/<grade>) → `python3 _work/ddworld/build.py` |
| Standards | `_work/standards/sec.json` → `export_outlines.py`, `build_standards.py` |
| Doors | home page Social studies fold (`index.html`) and `aog-topbar.js` `var EX`, after The Measured Step |

After any rebuild: `run_course.sh sec` → `apply_banners.py --style pencil --only sec` → `make_hubs.py doors sec`
→ `make_hubs.py check`, then the contrast and calm checks.

Open items: lesson content is English with Spanish page chrome (as every course); a Spanish content
pass is the blueprint's second pass. Facts the fact-checkers called "standard but not in the research
files" are listed in their reports; a further live-source pass can confirm them.
