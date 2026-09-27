# Doors build — progress (2026-09-27)

Runner: from aog-deploy/, `sh _work/course/run_course.sh <id>` = inject_groups.py <id> → build_<id>.py →
own injector → every other injector → plumb_<id>.py. Never run two at once. index.html has no #jumpSel (untouched).
Shared banner pieces: _work/course/banner_kit.py (finished; `Scene`, `contact_sheet`).
Hubs: build_{bib,heb,qur,tal}.py now point `hub` at <course>-hub.html; plumb_{heb,qur,tal} send /hebrew-bible, /quran, /talmud to the hubs.

- [x] heb — banners_heb_a.py (17, hhb*), built 17 units + hebrew-bible-course.html, plumbed
- [x] qur — banners_qur_a.py (17, qrb*), built + quran-course.html, plumbed
- [x] tal — banners_tal_a.py (17, tlb*), built + talmud-course.html, plumbed
- [x] rel K–8 — banners_rel_b.py (1–12, rkb*); rebuilt all 24; K–8 optgroups; plumb_rel sw/sitemap now incremental
- [x] eco K–8 — banners_eco_b.py (1–10, eob*); banners_eco.py shifts the old _a keys by +10 (HS units 11–18 finally get their banners); rebuilt all 18; plumb_eco incremental
- [x] bib rebuilt so its back link goes to bible-hub.html; /bible now → bible-hub.html in _redirects
- [x] doors: _work/course/make_hubs.py (hubs | k8 | check) → bible-hub, hebrew-bible-hub, quran-hub, talmud-hub; K–8 bands on religions-hub + economics-hub; band strips are drop-downs (aog-dropdowns.js)
- [x] aog-topbar.js Explore rows: Hebrew Bible, Qur'an, Talmud Study after The Bible; Economics/World Religions subs now K–12
- [x] sw.js precaches the 4 hubs (CACHE bumped); sitemap has the 4 doors
- [x] verify: targeted contrast + calm pass (33 pages); links 3682 checked, 0 broken; Playwright 390×844 clean. Full-site contrast/calm run after the topbar change: see report
