# Resume note — the 3D engine build (2026-10-12)

**All of it is deployed (live on main):** the Microscope and Telescope (PR #435), the Skate Lab in 3D with the shared
figure (PR #436), the Dojo with the martial-arts Practice strand (PR #438), and the Kitchen, the Sewing Room and the
FACS Watch it in 3D lessons (PR #440). The rest of this note is history.

## Status when usage paused
| Piece | Owner files | Status |
|---|---|---|
| Martial arts Practice strand | `_work/mar/mar_practice.py` → mar-u*.html | DONE, checks pass (`tools/check-mar-practice.js`) |
| FACS → 3D links | `_work/fcs/practice3d.py`, fc*.html, fcs-shop.html | DONE, checks pass (`tools/check-facs-3d.js`) |
| Realistic figure + stage kit | `aog-figure3d.js`, `aog-3dkit.js`, `_work/engine3d/figure-test.html`, `tools/check-figure.js` | in progress |
| Skate: new skater, 3D physics rooms, free skate | `aog-skate*.js`, `skate-lab.html`, `tools/check-skate.js` | in progress |
| Dojo (/dojo) | `dojo.html`, `aog-dojo*.js`, `tools/check-dojo.js` | in progress (must accept `/dojo?side=left#id` and `/dojo#id?side=left`) |
| Kitchen (/kitchen-lab) | `kitchen.html`, `aog-kitchen*.js`, `tools/check-kitchen.js` | in progress (asked for `#plug-in`) |
| Sewing Room (/sewing-lab, /sewing) | `sewing.html`, `aog-sewing*.js`, `tools/check-sewing.js` | in progress |
| Telescope real sky | `telescope.html`, `aog-telescope-*.js`, `data/sky/`, `tools/check-telescope.js` | in progress |
| Microscope depth | `science-microscope.html`, `aog-micro-*.js`, `tools/check-microscope.js` | in progress |

Redirects already added: /dojo, /martial-arts-dojo, /kitchen-lab, /sewing-lab, /sewing. (/kitchen stays fcs-shop.html.)

## To finish (Lead)
1. For each unfinished piece: run its check, `node tools/check-contrast.js <pages>`, `node tools/check-calm.js <pages>`,
   `node tools/check-silent.js <pages>`; look at screenshots; fix or re-task.
2. Point FACS "plug in" links at `/kitchen-lab#plug-in` once it works (`_work/fcs/practice3d.py` PLUG, then add_3d.py + rebuild per its notes).
3. Add new rooms (e.g. skate `#free`) to PAGES in `tools/check-silent.js`.
4. Bump `const CACHE` in sw.js (one line naming all of it); CLAUDE.md sections for the Dojo, Kitchen, Sewing Room,
   figure, telescope sky, microscope depth, FACS/MAR practice files; retire orphan science-telescope.html (redirect).
5. Full `node tools/check-contrast.js` and `node tools/check-calm.js` (shared files changed), then ask Jimmy before
   opening a PR to main and merging (deploy).
