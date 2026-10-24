/* Architecture of Grace — offline service worker
 * Cache-first for assets, network-first for the page, so the regulation tools,
 * PECS images, and breathing guides stay responsive at zero latency even with
 * no internet (sensory closets, basement classrooms, Wi-Fi dead zones).
 *
 * The CACHE name carries the build version. It must be bumped BY HAND on every
 * deploy — the build.py auto-stamp belongs to the older 1.75 MB lineage and does
 * not run on this file. Forget the bump and returning visitors keep the stale
 * page from their cache.
 *
 * Bump by REPLACING the CACHE line. Don't keep the old one as a comment: every byte here is
 * downloaded again on each update check. Old lines live in tools/sw-cache-history.txt and git log.
 */
const CACHE = 'aog-cache-2026.10.24.m7590'   // PHYSICS: ITS OWN COURSE, K-12, IN THE SCIENCE ORDER (physics-hub.html)

// Same-origin essentials — reliable to precache at install.
/* AOG-SW-LIGHT-V1 (2026-10-01) — Jimmy: "Why is it taking so long for the website to load on my phone now?"
   Every CACHE bump used to re-download ~700 pages (about 218 MB) at once, and the site updated 31 times in a day.
   Now:
     · an update downloads only these few core files (the 7 MB home page is no longer one of them; it saves itself
       when it is visited, like every other page);
     · pages are kept in KEEP, a store that is NOT wiped by an update, and refresh themselves whenever the device is
       online (network-first for pages and the site's own scripts; everything else is served from the store and
       refreshed in the background);
     · every lesson on PRECACHE_LESSONS is saved only when someone asks: the dashboard's Set up page has
       "Save the whole site for offline", which sends 'aog-save-offline' and gets progress back, one page at a time. */
const KEEP = 'aog-keep-v1';
const PRECACHE = [
  './talk-it-out.html', './aog-styles.css', './manifest.json', './og-image.png',
  './favicon.ico', './favicon-16.png', './favicon-32.png',
  './icon-192.png', './icon-512.png', './icon-512-maskable.png', './apple-touch-icon.png'
];

// The Book 3 classroom pages: the six student worksheets, the teacher view and
// the anchor-chart board. Cached ONE AT A TIME and best-effort on purpose — a
// single missing file inside PRECACHE's addAll would abort the whole core
// precache and take the site's offline capability down with it. Same rule as
// the scroll reveal: this must fail open.
const PRECACHE_LESSONS = [
  './skateboarding-course.html', './skateboarding-hub.html', './skt-u1.html', './skt-u2.html', './skt-u3.html', './skt-u4.html', './skt-u5.html', './skt-u6.html', './skt-u7.html', './skt-u8.html', './skt-u9.html', './skt-u10.html', './skt-u11.html', './skt-u12.html', './skt-u13.html', './skt-u14.html', './skt-u15.html', './skt-u16.html', './skt-u17.html', './skt-u18.html',   // AOG-SKT-V1 — Skateboarding and the Skate Lab
  './secret-societies-course.html', './sec-u1.html', './sec-u2.html', './sec-u3.html', './sec-u4.html', './sec-u5.html', './sec-u6.html', './sec-u7.html', './sec-u8.html', './sec-u9.html', './sec-u10.html', './sec-u11.html', './sec-u12.html', './sec-u13.html', './sec-u14.html', './sec-u15.html', './sec-u16.html', './sec-u17.html',   // AOG-SEC-V1 — the Secret Societies course
  './unseen-realm-course.html', './unr-u1.html', './unr-u2.html', './unr-u3.html', './unr-u4.html', './unr-u5.html', './unr-u6.html', './unr-u7.html', './unr-u8.html', './unr-u9.html', './unr-u10.html', './unr-u11.html', './unr-u12.html', './unr-u13.html', './unr-u14.html', './unr-u15.html', './unr-u16.html', './unr-u17.html',   // AOG-UNR-V1 — The Unseen Realm course
  './martial-arts-course.html', './mar-u1.html', './mar-u2.html', './mar-u3.html', './mar-u4.html', './mar-u5.html', './mar-u6.html', './mar-u7.html', './mar-u8.html', './mar-u9.html', './mar-u10.html', './mar-u11.html', './mar-u12.html', './mar-u13.html', './mar-u14.html', './mar-u15.html', './mar-u16.html', './mar-u17.html',   // AOG-MAR-V1 — the The Measured Step course
  './sports-course.html', './spt-u1.html', './spt-u2.html', './spt-u3.html', './spt-u4.html', './spt-u5.html', './spt-u6.html', './spt-u7.html', './spt-u8.html', './spt-u9.html', './spt-u10.html', './spt-u11.html', './spt-u12.html', './spt-u13.html', './spt-u14.html', './spt-u15.html', './spt-u16.html', './spt-u17.html',   // AOG-SPT-V1 — the Sports History course
  './medicine-health-course.html', './med-u1.html', './med-u2.html', './med-u3.html', './med-u4.html', './med-u5.html', './med-u6.html', './med-u7.html', './med-u8.html', './med-u9.html', './med-u10.html', './med-u11.html', './med-u12.html', './med-u13.html', './med-u14.html', './med-u15.html', './med-u16.html', './med-u17.html',   // AOG-MED-V1 — the Medicine and Health course
  './world-cultures-course.html', './wcs-u1.html', './wcs-u2.html', './wcs-u3.html', './wcs-u4.html', './wcs-u5.html', './wcs-u6.html', './wcs-u7.html', './wcs-u8.html', './wcs-u9.html', './wcs-u10.html', './wcs-u11.html', './wcs-u12.html', './wcs-u13.html', './wcs-u14.html', './wcs-u15.html', './wcs-u16.html', './wcs-u17.html',   // AOG-WCS-V1 — the World Cultures course
  './buddhist-texts-course.html', './bud-u1.html', './bud-u2.html', './bud-u3.html', './bud-u4.html', './bud-u5.html', './bud-u6.html', './bud-u7.html', './bud-u8.html', './bud-u9.html', './bud-u10.html', './bud-u11.html', './bud-u12.html', './bud-u13.html', './bud-u14.html', './bud-u15.html', './bud-u16.html', './bud-u17.html',   // AOG-BUD-V1 — the Buddhist Texts course
  './hindu-texts-course.html', './hin-u1.html', './hin-u2.html', './hin-u3.html', './hin-u4.html', './hin-u5.html', './hin-u6.html', './hin-u7.html', './hin-u8.html', './hin-u9.html', './hin-u10.html', './hin-u11.html', './hin-u12.html', './hin-u13.html', './hin-u14.html', './hin-u15.html', './hin-u16.html', './hin-u17.html',   // AOG-HIN-V1 — the Hindu Texts course
  './chinese-classics-hub.html', './chinese-classics-course.html', './chn-u1.html', './chn-u2.html', './chn-u3.html', './chn-u4.html', './chn-u5.html', './chn-u6.html', './chn-u7.html', './chn-u8.html', './chn-u9.html', './chn-u10.html', './chn-u11.html', './chn-u12.html', './chn-u13.html', './chn-u14.html', './chn-u15.html', './chn-u16.html', './chn-u17.html',   // AOG-CHN-V1 — the Chinese Classics course
  './bible-hub.html', './hebrew-bible-hub.html', './quran-hub.html', './talmud-hub.html',   // AOG-DOORS-V1 — the course doors
  './talmud-course.html', './tal-u1.html', './tal-u2.html', './tal-u3.html', './tal-u4.html', './tal-u5.html', './tal-u6.html', './tal-u7.html', './tal-u8.html', './tal-u9.html', './tal-u10.html', './tal-u11.html', './tal-u12.html', './tal-u13.html', './tal-u14.html', './tal-u15.html', './tal-u16.html', './tal-u17.html',   // AOG-TAL-V1 — the The Talmud course
  './quran-course.html', './qur-u1.html', './qur-u2.html', './qur-u3.html', './qur-u4.html', './qur-u5.html', './qur-u6.html', './qur-u7.html', './qur-u8.html', './qur-u9.html', './qur-u10.html', './qur-u11.html', './qur-u12.html', './qur-u13.html', './qur-u14.html', './qur-u15.html', './qur-u16.html', './qur-u17.html',   // AOG-QUR-V1 — the Qur’an course
  './hebrew-bible-course.html', './heb-u1.html', './heb-u2.html', './heb-u3.html', './heb-u4.html', './heb-u5.html', './heb-u6.html', './heb-u7.html', './heb-u8.html', './heb-u9.html', './heb-u10.html', './heb-u11.html', './heb-u12.html', './heb-u13.html', './heb-u14.html', './heb-u15.html', './heb-u16.html', './heb-u17.html',   // AOG-HEB-V1 — the Hebrew Bible course
  './bible-course.html', './bib-u1.html', './bib-u2.html', './bib-u3.html', './bib-u4.html', './bib-u5.html', './bib-u6.html', './bib-u7.html', './bib-u8.html', './bib-u9.html', './bib-u10.html', './bib-u11.html', './bib-u12.html', './bib-u13.html', './bib-u14.html', './bib-u15.html', './bib-u16.html', './bib-u17.html', './bib-u18.html',   // AOG-BIB-V1 — the Bible course
  './facs-course.html', './fcs-u1.html', './fcs-u2.html', './fcs-u3.html', './fcs-u4.html', './fcs-u5.html', './fcs-u6.html', './fcs-u7.html', './fcs-u8.html', './fcs-u9.html', './fcs-u10.html', './fcs-u11.html', './fcs-u12.html', './fcs-u13.html', './fcs-u14.html', './fcs-u15.html', './fcs-u16.html', './fcs-u17.html', './fcs-u18.html', './fcs-u19.html', './fcs-u20.html',   // AOG-FCS-V1 — the Family & Consumer Sciences course
  './religions-course.html', './rel-u1.html', './rel-u2.html', './rel-u3.html', './rel-u4.html', './rel-u5.html', './rel-u6.html', './rel-u7.html', './rel-u8.html', './rel-u9.html', './rel-u10.html', './rel-u11.html', './rel-u12.html', './rel-u13.html', './rel-u14.html', './rel-u15.html', './rel-u16.html', './rel-u17.html', './rel-u18.html', './rel-u19.html', './rel-u20.html', './rel-u21.html', './rel-u22.html', './rel-u23.html', './rel-u24.html',   // AOG-REL-V1 — the World Religions course
  './economics-course.html', './eco-u1.html', './eco-u2.html', './eco-u3.html', './eco-u4.html', './eco-u5.html', './eco-u6.html', './eco-u7.html', './eco-u8.html', './eco-u9.html', './eco-u10.html', './eco-u11.html', './eco-u12.html', './eco-u13.html', './eco-u14.html', './eco-u15.html', './eco-u16.html', './eco-u17.html', './eco-u18.html',   // AOG-ECO-V1 — the Economics course
  './room-12-cards.html', './room-18-cards.html', './room-36-cards.html', './room-104-cards.html', './room-207-cards.html',   // AOG-SEL-V1 — the scenario cards
  './spanish-course.html', './spa-u1.html', './spa-u2.html', './spa-u3.html', './spa-u4.html', './spa-u5.html', './spa-u6.html', './spa-u7.html', './spa-u8.html', './spa-u9.html', './spa-u10.html', './spa-u11.html', './spa-u12.html', './spa-u13.html', './spa-u14.html', './spa-u15.html', './spa-u16.html', './spa-u17.html', './spa-u18.html', './spa-u19.html', './spa-u20.html',   // AOG-SPA-V1 — the Spanish course, K–12
  './english-course.html', './ela-u1.html', './ela-u2.html', './ela-u3.html', './ela-u4.html', './ela-u5.html', './ela-u6.html', './ela-u7.html', './ela-u8.html', './ela-u9.html', './ela-u10.html', './ela-u11.html', './ela-u12.html', './ela-u13.html', './ela-u14.html', './ela-u15.html', './ela-u16.html', './ela-u17.html', './ela-u18.html', './ela-u19.html', './ela-u20.html', './ela-u21.html', './ela-u22.html', './ela-u23.html', './ela-u24.html',   // AOG-ELA-V1 — the English course, K–12
  './social-studies-course.html', './ssc-u1.html', './ssc-u2.html', './ssc-u3.html', './ssc-u4.html', './ssc-u5.html', './ssc-u6.html', './ssc-u7.html', './ssc-u8.html', './ssc-u9.html', './ssc-u10.html', './ssc-u11.html', './ssc-u12.html', './ssc-u13.html', './ssc-u14.html', './ssc-u15.html', './ssc-u16.html', './ssc-u17.html', './ssc-u18.html', './ssc-u19.html', './ssc-u20.html', './ssc-u21.html', './ssc-u22.html', './ssc-u23.html', './ssc-u24.html',   // AOG-SS-V1 — the Social Studies course, K–12
  './math-course.html', './mth-u1.html', './mth-u2.html', './mth-u3.html', './mth-u4.html', './mth-u5.html', './mth-u6.html', './mth-u7.html', './mth-u8.html', './mth-u9.html', './mth-u10.html', './mth-u11.html', './mth-u12.html', './mth-u13.html', './mth-u14.html', './mth-u15.html', './mth-u16.html', './mth-u17.html', './mth-u18.html', './mth-u19.html', './mth-u20.html', './mth-u21.html', './mth-u22.html', './mth-u23.html', './mth-u24.html', './mth-u25.html', './mth-u26.html', './mth-u27.html',   // AOG-MTH-V1 — the math course, K–12
  './science-course.html', './sci-u1.html', './sci-u2.html', './sci-u3.html', './sci-u4.html', './sci-u5.html', './sci-u6.html', './sci-u7.html', './sci-u8.html', './sci-u9.html', './sci-u10.html', './sci-u11.html', './sci-u12.html', './sci-u13.html', './sci-u14.html', './sci-u15.html', './sci-u16.html', './sci-u17.html', './sci-u18.html', './sci-u19.html', './sci-u20.html', './sci-u21.html', './sci-u22.html', './sci-u23.html', './sci-u24.html', './sci-u25.html', './sci-u26.html', './sci-u27.html',   // AOG-SCI-V1 — the science course, K–12
  './aog-jump.js', './aog-cards.js',   // AOG-USH-V1 — the two shared scripts every lesson page now loads
  './us-history.html', './ush-u1.html', './ush-u2.html', './ush-u3.html', './ush-u4.html', './ush-u5.html', './ush-u6.html', './ush-u7.html', './ush-u8.html', './ush-u9.html', './ush-u10.html',   // the U.S. History course, grades 6–8
  './student-evidence.html',   // .30eu — the Student Evidence record; self-contained, meeting rooms have no Wi-Fi
  './AoG-Interior-Worksheets.html', './AoG-Anchor-Charts.html',
  './room-36-curriculum.html',  // .30fu — the Room 36 teacher curriculum page; a planning-period read with no Wi-Fi promise, same rule
  './room-36-workbook.html',    // .30fu amended — the companion workbook rides beside it
  './adult-edition.html', './adult-curriculum.html', './adult-lessons.html', './adult-charts.html', './adult-workbook.html', './adult-anchors.html', './adult-sessions.html', './aog-adult.css', './aog-adult.js',   // AOG-ADULT (2026-10-09) — Book 6, the Adult Edition
  './room-36-lessons.html',     // .30fv — all 28 lessons; the planning-period read continues
  './room-207-curriculum.html', './room-207-lessons.html', './room-207-workbook.html',   // Room 207 · Grades 11–12 — same planning-period rule as Room 36
  './AoG-Anchor-Charts-207.html',   // Room 207 anchor charts
  './w207-1-compass-of-integrity.html', './w207-2-living-amend-design.html', './w207-3-backpack-audit.html',
  './w207-4-bitterness-ledger.html', './w207-5-graduation-charter.html',
  './room-104-curriculum.html', './room-104-lessons.html', './room-104-workbook.html',   // Room 104 · Grades 9–10 — same planning-period rule as Room 36
  './AoG-Anchor-Charts-104.html',   // Room 104 anchor charts
  './w104-1-identity-shield.html', './w104-2-backpack-audit.html',
  './room-12-curriculum.html', './room-12-lessons.html', './room-12-workbook.html',   // Room 12 · Grades K–2 — same planning-period rule as Room 36
  './AoG-Anchor-Charts-12.html',   // Room 12 anchor charts
  './w12-1-my-identity-web.html', './w12-2-i-can-change-and-grow.html', './w12-3-where-my-feelings-live.html',
  './w12-4-being-kind-to-myself.html',
  './room-18-curriculum.html', './room-18-lessons.html', './room-18-workbook.html',   // Room 18 · Grades 3–5 — same planning-period rule as Room 36
  './AoG-Anchor-Charts-18.html',   // Room 18 anchor charts
  './w18-1-identity-web.html', './w18-2-guilt-vs-shame.html', './w18-3-two-voices.html',
  './w18-4-accountability-map.html', './w18-5-letter-from-your-best-friend.html', './w18-6-forgiveness-vs-trust.html',
  './w18-7-three-panel-story.html', './w18-8-grace-gap.html', './w18-9-pause-practice.html',
  './w18-10-my-regulation-toolkit.html', './w18-11-my-recovery-map.html', './w18-12-my-repair-plan.html',
  './w18-13-my-limit-statements.html',
  './turn-ins.html',            // .30gj — the teacher inbox reads a local store; the shell should open offline
  './w1-identity-audit.html', './w2-values-under-pressure.html',
  './w3-choice-agency-map.html', './w4-letter-to-my-future-self.html',
  './w5-perfectionism-spectrum.html', './w6-rewriting-the-script.html',
  './w7-internal-critic-profile.html',
  './daily-drops.html',         // Daily Drops — K-8 spiral review; a page a
                               // classroom opens every morning, so it must
                               // open with the Wi-Fi down like the rest.
  // MATH-STRAND — the two math series. Every one of these pages promises the
  // student it works with the network off, so they belong here; best-effort,
  // one at a time, never inside PRECACHE's addAll.
  './interior-math.html', './concepts-and-data.html',
  './m1-one-step-equations.html', './m2-where-it-goes.html',
  './m3-walk-the-line.html', './m4-how-far-from-zero.html',
  './m5-sign-and-size.html', './m6-both-ways.html',
  './m7-what-goes-first.html', './m8-like-and-unlike.html',
  './m9-land-on-it.html', './m10-smaller-steps.html',
  './m11-two-names.html', './m12-name-the-move.html',
  './m13-say-it-in-math.html', './m14-last-on-first-off.html', './m27-ratios-rates.html', './m28-proportional-percent.html', './m29-inequalities.html', './m30-area-surface-volume.html', './m31-angles-triangles-scale.html', './m32-probability-sampling.html', './m33-exponents-roots-scinot.html', './m34-equations-systems.html', './m35-functions-slope.html', './m36-transformations.html', './m37-pythagorean-theorem.html', './m26-geometry-coordinate-plane.html', './m49-sequences-series.html', './m50-statistics-sample-to-claim.html', './m51-financial-math.html', './m52-capstone-model-it.html', './m43-geo-proof-congruence-triangles.html', './m44-geo-similarity-trig.html', './m45-geo-circles-area-volume.html', './m46-alg2-polynomial-rational.html', './m47-alg2-exponential-logarithmic.html', './m48-trigonometric-functions.html', './m38-alg1-linear-equations-inequalities.html', './m39-alg1-functions-linear-models.html', './m40-alg1-systems.html', './m21-multiplication-division-meaning.html', './m22-multi-digit-multiplication.html', './m23-fractions-add-subtract-multiply.html', './m18-add-subtract-within-1000.html', './m19-length-time-money.html', './m20-shapes-equal-shares.html', './m41-alg1-exponents-polynomials-factoring.html', './m42-alg1-quadratics.html', './m15-counting-how-many.html', './m16-add-subtract-within-20.html', './m17-tens-ones-hundreds.html', './m24-decimals.html', './m25-measurement-area-perimeter-volume.html',
  './c1-cut-it-fair.html', './c2-top-and-bottom.html',
  './c3-more-than-a-whole.html', './c4-close-to-what.html',
  './c5-which-is-bigger.html', './c6-same-amount-new-name.html',
  './c7-make-it-even.html', './c8-the-middle-number.html',
  './c9-the-odd-one-out.html', './c10-stems-and-leaves.html',
  './c11-x-marks-the-number.html',
  './c12-bring-it-down.html', './c13-trade-a-ten.html',
  // SCIENCE VOCABULARY — the third series. Same promise, same rule.
  './vocabulary-science.html', './science-microscope.html',
  './v1-match-the-meaning.html', './v2-build-the-word.html',
  './v3-say-it-in-a-sentence.html', './v4-picture-it.html',
  './v5-which-one-doesnt-belong.html',
  // SOCIAL STUDIES — the fourth series. Same promise, same rule.
  './social-studies.html',
  './h1-order-the-story.html', './h2-because-of-that.html',
  './h3-whose-voice.html', './h4-the-main-idea.html',
  './h5-words-of-a-new-nation.html', './h6-map-of-a-growing-nation.html',
  './h7-back-it-up.html', './h8-one-person-big-ripple.html',
  './h9-the-third-branch.html', './h10-the-first-branch.html',
  './h11-the-second-branch.html', './h12-the-blueprint.html',
  './h13-rights-in-writing.html', './h14-how-a-bill-becomes-a-law.html',
  './h15-the-illinois-constitution.html',
  './h16-put-it-all-together.html',
  './social-quiz.html',
  // EXAM PREP — the fifth series (.30fa). Same promise, same rule;
  // b2–b10 join this list in .30fb when those pages land.
  './exam-prep.html',
  './b1-living-things.html', './b11-grammar.html',
  './b2-cell-system.html', './b3-body-systems.html', './b4-reproduction.html',
  './b5-ecosystems.html', './b6-populations.html', './b7-heredity.html',
  './b9-new-nation.html', './b10-interior-math.html',
  './b12-sixth-grade-review.html', './b13-sixth-grade-practice.html',
  // THE WORKSHOP UNITS (AOG-LAB-V1): built from _work/subjects, each with a Lab tab.
  './b14-matter.html', './b15-forces-energy-waves.html', './b16-earth-systems.html', './b17-space-systems.html', './b18-forces-motion.html', './b19-life-cycles-traits.html', './b20-weather-climate.html', './b21-energy.html', './b22-changing-surface.html', './b23-matter-properties.html', './b24-ecosystems.html', './b25-earth-in-space.html', './b26-pushes-pulls.html', './b27-sun-moon-sky.html', './b28-living-things-need.html', './b29-weather-seasons.html', './b30-light-sound.html', './b31-materials-change.html', './b32-cells-energy.html', './b34-ecosystems-human-impact.html', './b35-matter-reactions.html', './b36-forces-energy-waves-hs.html', './b37-earth-space-hs.html', './b38-chem-atoms-bonding.html', './b39-chem-stoich-solutions.html', './b40-physics-motion-forces.html', './b41-physics-energy-waves-electricity.html', './b42-environmental-science.html', './b43-capstone-evidence.html', './s1-government.html', './s2-communities-illinois.html', './s3-first-peoples.html', './s4-explorers-colonies-nation.html', './s5-money-markets-choices.html', './s6-maps-us-regions.html', './s7-me-family-class.html', './s8-rules-fair-choices.html', './s9-maps-where-things-are.html', './s10-then-and-now.html', './s11-needs-wants-work.html', './s12-symbols-stories.html', './s13-world-before-1500.html', './s14-world-regions.html', './s15-reconstruction-to-present.html', './s16-empires-and-exchange.html', './s17-revolutions-modern-world.html', './s18-human-geography.html', './s19-civics-rights-power.html', './s20-industry-progressive-era.html', './s21-world-wars-cold-war.html', './s22-civil-rights-to-today.html', './s23-government.html', './s24-economics.html', './s25-capstone-inquiry.html', './r1-reading-sacred-texts.html', './r2-hebrew-bible.html', './r3-new-testament.html', './r4-judaism.html', './r5-islam.html', './r6-hinduism.html', './r7-buddhism.html', './r8-confucianism-daoism.html', './r9-sikhism-jainism-africa-americas.html', './r10-religion-and-the-world.html', './r11-one-question-many-lenses.html', './r12-capstone.html', './n1-the-outsiders.html',
  // WORD STUDY — the sixth series (.30fq). Same promise, same rule.
  './word-foundry.html',
  // SUBJECT HUBS — Science and Social Studies, one door per band (AOG-SUBJECT-HUB-V1). Same promise, same rule.
  './science-hub.html', './social-studies-hub.html', './religions-hub.html', './english-hub.html', './math-hub.html', './wf-units.html'
];

// Cross-origin extras that complete the offline experience (the dyslexia font).
// Cached best-effort — a failure here must NEVER block install of the core.
const PRECACHE_OPTIONAL = [
  './aog-glass.js',   // AOG-GLASS-V1 — the Blueprint windows painted as real glass
  './aog-resources.json', './aog-resources.js', './aog-resources.css', './aog-crosswalk.js',   // AOG-RESOURCES-V1 — the resource library
  'https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5.0.0/files/opendyslexic-latin-400-normal.woff2',
  'https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic@5.0.0/files/opendyslexic-latin-700-normal.woff2'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) {
    PRECACHE_OPTIONAL.forEach(function (u) { c.add(u).catch(function () {}); }); // best-effort, small
    return c.addAll(PRECACHE).catch(function () {});                              // core, small
  }));
});

/* AOG-SW-LIGHT-V1 — before an old versioned cache is dropped, the pages and files it already holds are copied into
   KEEP (on the device, no network), so nothing a device had saved for offline is lost by an update. */
function keepFrom(oldName) {
  return Promise.all([caches.open(oldName), caches.open(KEEP)]).then(function (cs) {
    var from = cs[0], to = cs[1];
    return from.keys().then(function (reqs) {
      return reqs.reduce(function (p, rq) {
        return p.then(function () {
          return to.match(rq).then(function (have) {
            if (have) return;
            return from.match(rq).then(function (r) { if (r) return to.put(rq, r); });
          });
        }).catch(function () {});
      }, Promise.resolve());
    });
  }).catch(function () {});
}

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      var old = keys.filter(function (k) { return k !== CACHE && k !== KEEP; });
      return old.filter(function (k) { return /^aog-cache-/.test(k); }).reduce(function (p, k) { return p.then(function () { return keepFrom(k); }); }, Promise.resolve())
        .then(function () { return Promise.all(old.map(function (k) { return caches.delete(k); })); });
    }).then(function () { return self.clients.claim(); })
  );
});

/* AOG-SW-LIGHT-V1 — "Save the whole site for offline" (dashboard ▸ Set up). One page at a time, never all at once;
   a page already saved is skipped; progress goes back to the page that asked. 'aog-offline-status' only counts. */
var SAVING = false, STOP = false;
function offlineList() { return ['./', './index.html'].concat(PRECACHE_LESSONS); }
function tell(src, msg) { try { if (src && src.postMessage) src.postMessage(msg); } catch (err) {} }
function countSaved() {
  var list = offlineList();
  return caches.open(KEEP).then(function (c) {
    return Promise.all(list.map(function (u) { return c.match(new Request(u)).then(function (m) { return m ? 1 : 0; }, function () { return 0; }); }));
  }).then(function (a) { return { saved: a.reduce(function (x, y) { return x + y; }, 0), total: list.length }; });
}
self.addEventListener('message', function (e) {
  var d = e.data || {}, src = e.source;
  if (d.type === 'aog-offline-status') {
    e.waitUntil(countSaved().then(function (st) { st.type = 'aog-offline-status'; st.saving = SAVING; tell(src, st); }));
  } else if (d.type === 'aog-save-stop') {
    STOP = true;
  } else if (d.type === 'aog-save-offline' && !SAVING) {
    SAVING = true; STOP = false;
    var list = offlineList(), done = 0, failed = 0;
    e.waitUntil(caches.open(KEEP).then(function (c) {
      return list.reduce(function (p, u) {
        return p.then(function () {
          if (STOP) return;
          var rq = new Request(u);
          return c.match(rq).then(function (have) {
            if (have) return;
            return fetch(rq, { cache: 'no-cache' }).then(function (r) {
              if (!worthCaching(r)) { failed++; return; }
              return verifyComplete(r.clone()).then(function (body) {
                if (!body) { failed++; return; }
                return c.put(rq, new Response(body, { status: 200, statusText: 'OK', headers: r.headers })).then(function () { return keepFront(c, body); });
              });
            }).catch(function () { failed++; });
          }).then(function () { done++; if (done % 5 === 0 || done === list.length) tell(src, { type: 'aog-save-progress', done: done, total: list.length, failed: failed }); });
        });
      }, Promise.resolve());
    }).then(function () {
      SAVING = false;
      return countSaved().then(function (st) { st.type = 'aog-save-done'; st.failed = failed; st.stopped = STOP; tell(src, st); });
    }, function () { SAVING = false; }));
  }
});

/* AOG-SAVE-FRONT-V1 (2026-10-22): a made page (the front page, the Studio rooms, Daily Practice) keeps its code in
   front/. Saving the page for offline saves those files too, or it would open with the Wi-Fi down and do nothing. */
function keepFront(c, body) {
  var names = body.match(/src="\/front\/[0-9a-f]+\.js"/g) || [];
  return names.reduce(function (p, s) {
    var rq = new Request(s.slice(5, -1));
    return p.then(function () {
      return c.match(rq).then(function (have) {
        if (have) return;
        return fetch(rq).then(function (r) { if (r && r.status === 200 && r.type === 'basic') return c.put(rq, r); }).catch(function () {});
      });
    });
  }, Promise.resolve());
}

// --- aog-sw-hardened helpers -------------------------------------------------
// Is this response safe to keep? Only a plain, final, same-origin 200 that says
// it is HTML. Redirects and opaque responses are replayed badly from a cache.
function worthCaching(r) {
  if (!r || !r.ok || r.status !== 200 || r.redirected) return false;
  if (r.type !== 'basic' && r.type !== 'default') return false;
  var ct = (r.headers.get('content-type') || '').toLowerCase();
  return ct.indexOf('text/html') === 0 || ct.indexOf('text/html') > -1;
}

// Read the whole body before deciding. If the server declared a Content-Length
// and we received fewer bytes, the download was cut short — return null so
// nothing is written. Returns the body text when it looks complete.
function verifyComplete(res) {
  var declared = parseInt(res.headers.get('content-length') || '', 10);
  return res.text().then(function (body) {
    if (!body) return null;
    if (!isNaN(declared) && declared > 0) {
      // Content-Length counts bytes; the body is characters. Compare bytes.
      var bytes = new TextEncoder().encode(body).length;
      if (bytes < declared) return null;
    }
    // Belt: a complete page of ours always closes its html element.
    if (body.length > 4096 && body.lastIndexOf('</html>') === -1) return null;
    return body;
  }).catch(function () { return null; });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  /* ⚠ ONLY http(s) IS CACHEABLE. Chrome extensions issue GETs through the page
     — a grammar checker, a password manager — and Cache.put() REJECTS a
     chrome-extension:// request with an unhandled promise rejection, once per
     asset, on every single load. It broke nothing, but it filled the console
     with red for anyone running extensions, which is every teacher, and a
     console full of red is where a real error goes to hide. */
  if (req.url.indexOf('http') !== 0) return;

  // The page itself: network-first (so updates land), fall back to cache offline.
  //
  // aog-sw-hardened (2026-08-22): this used to cache whatever came back. On a
  // weak connection index.html (3.5 MB) can arrive truncated with a perfectly
  // normal 200, and caching that copy left an iPhone showing a blank page on
  // every visit — recoverable only through Settings > Safari > Website Data.
  // Now a page is only stored if it is a clean, complete, same-origin 200 HTML
  // response: any redirect, error, opaque response, or a body shorter than the
  // Content-Length it promised is served to the user but never written to the
  // cache, so a bad moment on the network can't become a permanent blank page.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (r) {
        if (worthCaching(r)) {
          var copy = r.clone();
          verifyComplete(copy).then(function (body) {
            if (body) caches.open(KEEP).then(function (c) {
              c.put(req, new Response(body, { status: 200, statusText: 'OK', headers: r.headers }));
            });
          });
        }
        return r;
      }).catch(function () {
        return caches.match(req).then(function (m) { return m || caches.match('./index.html').then(function (h) { return h || caches.match('./'); }); });
      })
    );
    return;
  }

  // The sync destination must never come back stale from a cache: a rotated
  // key would keep failing on every returning device. Network-first, cache as
  // the offline backup only.
  /* AOG-SW-ASSETS-NETFIRST-V1 (4314) — the site's own scripts and stylesheet
     (aog-topbar.js, aog-nav.js, aog-identity.js, aog-styles.css,
     aog-sync-config.js) come from the NETWORK first and fall back to the cache
     only when offline. Before this they were cache-first, so a browser that had
     visited once kept printing with an old aog-topbar.js after a drag. Jimmy's
     Mac Safari still split "What people get wrong" onto the foot of a page after
     4313 went live, while his phone had the fix. */
  /* AOG-FRONT-BUILD-V1 (2026-10-11): the front page's code (front/), one file per block, named after what is in it.
     A name never changes its contents, so a saved copy is always right: it comes straight from the store, and only a
     block never seen before is fetched (and kept). */
  /* AOG-STEMS-AI-V1 (2026-10-12): the separation model and its runtime (about 40 MB, fetched only at Best quality) live in
     versioned folders whose files never change: a saved copy is used as it is, never fetched again in the background. */
  if (/\/(vendor\/onnxruntime-web-\d[^\/]*|models\/stems\/[a-z0-9-]+-v\d+)\//.test(req.url)) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (r) {
          if (r && r.status === 200 && r.type === 'basic') { var copy = r.clone(); e.waitUntil(caches.open(KEEP).then(function (c) { return c.put(req, copy); }).catch(function () {})); }
          return r;
        });
      })
    );
    return;
  }
  if (/\/front\/[0-9a-f]+\.js(\?|#|$)/.test(req.url)) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (r) {
          if (r && r.status === 200 && r.type === 'basic') { var copy = r.clone(); e.waitUntil(caches.open(KEEP).then(function (c) { return c.put(req, copy); }).catch(function () {})); }
          return r;
        });
      })
    );
    return;
  }
  /* AOG-SW-CODE-FAST-V1 (2026-10-10) — Jimmy: the Studio was "lagging … a horrific experience". Every room asks for
     about twenty of these files, one after another, and each one waited on the network, every time, even when nothing
     had changed. Now the first time this version of the site asks for a file it comes from the network, as before, and
     is kept in this version's own store (CACHE); after that it comes straight from the store. A new version (a new
     CACHE line, bumped with every change) starts with an empty store, so a changed file still lands at once and an old
     one can never stick (the trouble 4314 fixed). Offline, any saved copy is used. */
  if (/\/aog-[^\/?#]*\.(js|css)(\?|#|$)/.test(req.url)) {
    e.respondWith(
      caches.open(CACHE).then(function (c) { return c.match(req); }).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (r) {
          if (r && r.status === 200 && r.type === 'basic') {
            var a = r.clone(), b = r.clone();
            e.waitUntil(Promise.all([
              caches.open(CACHE).then(function (c) { return c.put(req, a); }),
              caches.open(KEEP).then(function (c) { return c.put(req, b); })
            ]).catch(function () {}));
          }
          return r;
        }).catch(function () { return caches.match(req); });
      }, function () { return fetch(req); })
    );
    return;
  }

  // Everything else (fonts, css, images, data): served from the store at once, refreshed from the network in the
  // background (AOG-SW-LIGHT-V1: KEEP outlives updates, so a file must refresh itself rather than wait for a wipe).
  e.respondWith(
    caches.match(req).then(function (m) {
      var net = fetch(req).then(function (r) {
        if (r && r.status === 200 && (r.type === 'basic' || r.type === 'cors')) {
          var copy = r.clone();
          caches.open(KEEP).then(function (c) { c.put(req, copy); });
        }
        return r;
      });
      if (m) { e.waitUntil(net.catch(function () {})); return m; }
      return net.catch(function () { return m; });
    })
  );
});
