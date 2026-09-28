/* ===========================================================================
   ARCHITECTURE OF GRACE — built-in Sheet destination for classroom links
   ---------------------------------------------------------------------------
   WHY THIS FILE EXISTS
   A student who opens a classroom link on a phone has never typed the Web App
   URL into that browser. Without this file the phone has nowhere to post, so
   the reflection saves locally and never reaches the Sheet. This file gives
   the deployed site a destination, so the shareable link can stay clean —
   it still carries only grade, class and window, never a URL or a passcode.

   FILL IN TWO LINES BELOW, then deploy this file next to index.html.

   ⚠ AS OF BUILD .29ai THIS FILE IS NO LONGER THE ONLY WAY IN, AND IT SHOULD
   NOT BE HOW A SCHOOL THAT IS NOT YOURS GETS A DESTINATION. A school now
   enters its own Web App URL and its own BACKEND_AUTH_KEY in its own
   dashboard (Set up ▸ Syncing & distribution ▸ Connect your school's Sheet),
   and every classroom link and QR code that dashboard generates carries the
   destination inside it. A destination on a link WINS over anything in this
   file. Nobody has to send you a key any more — and you should not accept
   one: holding another district's write key makes you the single point of
   failure for a Sheet you cannot even see.

   What this file is still for: the destination YOU publish for YOUR OWN
   classes, on a site you run.

   SECURITY, PLAINLY
   This file is public: anyone can read it. KEY is a WRITE-ONLY token — it
   cannot read a single row back. That much is verified in the Apps Script:
   both read paths compare against ADMIN_PULL_KEY only, and ADMIN_PULL_KEY
   lives in Script Properties and in the teacher's own browser, never here.

   BUT "the worst it allows is junk rows" UNDERSTATES IT, and this comment used
   to say exactly that. The write path validates nothing, so anyone holding this
   key can append rows carrying REAL student codes, invented scores and tiers,
   and the unsafeFlag / trustedAdultFlag safety flags — and can post check-ins
   attributed to a NAMED staff member with followUp set. Forged rows are not
   distinguishable from real ones in a teacher's report. There is no rate limit,
   no origin check and no size cap on the endpoint. What it still cannot do:
   read anything, change an existing row, or delete one — every write is an
   appendRow. Rotate KEY by editing the line below and updating
   BACKEND_AUTH_KEY in Apps Script; do that if you ever suspect abuse.
   =========================================================================== */
window.AOG_SYNC_DEFAULTS = {

  /* 1. Your Apps Script Web App URL — the deployment link ending in /exec */
  url: "https://script.google.com/macros/s/AKfycbxqHWGZNbc4uZTo4bxsP6bEkChj_3L_BLCvvmmKm_eX6dqdbeATi8Ktln5XIW9_iV2x/exec",  /* restored 2026-09-28 (Jimmy: "I want the Google Sheet back up. It just has no Sheet references.") */

  /* 2. The value of BACKEND_AUTH_KEY in Apps Script ▸ Project Settings ▸
        Script properties. Write-only: see the note above. */
  key: "Grace-D61-Sync-2026",  /* must match BACKEND_AUTH_KEY in Apps Script; change both together */
  label: "Architecture of Grace — site default Sheet (the owner's own Google account)",

  /* 3. Which classroom links may use this destination.

        ⚠ ROLLED BACK TO ["*"] THE SAME NIGHT .30cr SHIPPED (2026-08-30,
        build .30cs). .30cr set this to [] on the belief that every live link
        carried its destination inside it. It did not: the generating browser
        had aog.sync.url and the read passcode saved, but the WRITE KEY box
        (aog.sync.writekey) had never been filled, and aogDestParam_() emits
        nothing without it — so every link and QR in the field, students'
        and colleagues' alike, was riding this wildcard. For the hour .30cr
        was live, link syncing was OFF for the whole fleet.

        THE FLIP IS STILL THE GOAL: [] is what makes "another school's data
        cannot reach a sheet we control" a property of the code. But the
        order is: save the write key on the connect card → regenerate EVERY
        link and QR → verify dest= rides on a fresh one → re-issue → THEN [].
        Never flip on a belief about the links; flip on a decoded QR.

        ["*"] = ANY classroom link syncs, whatever the School ID says, and a
        blank School ID works too. This WAS the shipping setting through
        .30cq: the passcode is the gate, not the School ID, so the
        Distribute fields are free labels you can type anything into.

        Note what "*" does and does not open up. It does NOT let a passer-by
        sync — a device only syncs if it opened a "?sync=on" link you handed
        out, or has its own saved connection. What "*" does allow is someone
        you gave a sync link to writing rows you did not expect.

        ⚠ CORRECTED 2026-08-28. This paragraph used to say "nobody can READ
        the sheet: the deployed Apps Script has no read path at all." That was
        true when it was written and is not true now — the script has TWO read
        paths, `pull` and `pullCheckins`, added for the dashboard's Pull from
        Sheet. The conclusion still holds and is what matters: both compare
        against ADMIN_PULL_KEY only, so THE KEY IN THIS FILE STILL CANNOT READ
        A SINGLE ROW. But do not quote the old reason to a district — check
        the script, not this comment.

        A list of School IDs, e.g. ["NORTH-JH", "WEST-MS"] — matched
        case-insensitively — lets ONLY links carrying one of those IDs fall
        through, but the ID is free text a stranger could type too, so a list
        is looser than it looks. A blank School ID never matches a list.
        Whatever you choose, the Distribute page states in green or amber
        whether the link in front of you will actually reach the Sheet. */
  /* ⚠⚠ FLIPPED TO [] ON 2026-09-08, AND THIS TIME ON DECODED QR CODES, NOT ON
     A BELIEF ABOUT THE LINKS — which is the exact mistake .30cr made and .30cs
     had to undo the same night.

     WHAT WAS DECODED FIRST, not assumed:
       · 25 individual teacher sheets → 200 links → 200 carry dest= → all
         decode to this same /exec and this same write key. They are
         SELF-SUFFICIENT and do not touch this file.
       · The combined AoG-Teacher-QR-Sheets-NAMED-linked.pdf was the ONLY
         thing riding this wildcard: 140 links, none with dest, generated
         30 Aug 17:15 — a day OLDER than the individual sheets and missing
         Gray entirely. It was rebuilt on 2026-09-08 from the 25 current
         sheets (29 pages, 200/200 dest, Gray restored) and re-verified.
         Old file kept as .bak-30aug-nodest.
       · aog.sync.writekey IS saved in the generating browser and
         aogDestParam_() emits a 195-char dest, so links made from here on
         carry their own destination. In .30cr that box was empty, which is
         why every link in the field went dark.

     WHAT THIS TURNS OFF, plainly: a device that opens an activity page with
     no dest= on the link — typing architectureofgrace.org and working a
     Daily Drafts sheet, the way the iPad did on 2026-09-08 — no longer has a
     destination, so the Send box is not added to the page at all. That is
     the point: another school's rows can no longer reach a Sheet we control.
     It is also the one workflow it costs, so hand out links, not the address.

     ⚠ THE COMMENT BELOW IS WRONG ABOUT THE ACTIVITY PAGES and was left in
     place for weeks: "a device only syncs if it opened a ?sync=on link" is
     true of the check-in flow inside index.html and NOT true of
     daily-drops.html or any b/c/m/v Interior page, which read this file
     directly and test only that `schools` is a NON-EMPTY ARRAY. That single
     length test is the whole gate this line controls.

     TO REVERT: put ["*"] back and redeploy. Ten seconds, no data migration. */
  /* ⚠⚠ RE-OPENED 2026-09-18 (build .30m1 · send fix) — AS A NAMED LIST, NOT
     ["*"]. It was [] from 2026-09-08, and that did one more thing than the
     note above admits: it turned the Send box off on EVERY Daily Drafts and
     Interior page reached without a dest= on the link. Those pages do not
     match a School ID at all — they test only that this array is NON-EMPTY —
     so [] removed the box from the page entirely. No error, no failed post,
     nothing to notice. Jimmy works sheets by typing the address, which is the
     one workflow 2026-09-08 cost, and the ten new Grades 9-10 / 11-12 band
     doors carry no dest either, so the bands looked dead.

     WHY A NAMED LIST AND NOT ["*"]. Two different gates read this array:
       · daily-drops.html and every b/c/m/v Interior page — LENGTH ONLY.
         Any non-empty array switches them back on. ["*"] buys nothing here.
       · index.html's check-in / screener flow — MATCHES the School ID the
         link put in sessionStorage. ["*"] means any link and a blank ID.
         A named list means ONLY a link carrying this ID, and a typed
         address (no School ID) stays closed.
     So this line restores exactly the workflow that broke and leaves the
     check-in path tighter than ["*"] would.

     WHAT IT STILL COSTS, plainly: someone who types architectureofgrace.org
     and works a Daily Drafts or Interior sheet can append rows to this Sheet.
     That is unavoidable while those pages gate on length alone — it is the
     price of Jimmy's own workflow, not an oversight.

     VERIFIED BY RENDERING, not by reading: headless Chromium at 390px, all 25
     subject x grade combinations K-12 show the Send box, 0 JS errors; the
     index.html resolver run against this same array returns null for a typed
     address and null for a wrong School ID.

     THE APPS SCRIPT WAS NEVER THE PROBLEM. v15 routes dd-math-g9-10-s3 and
     every other band id to its own Daily Drafts tab; the band grade rides
     inside `extra` and no tab or column is keyed on it. Do not re-paste it.

     TO UNDO: put [] back and redeploy. Ten seconds, no data migration.
     Backup of the pre-fix file: aog-sync-config.js.bak-sendfix1 */
  schools: ["AOG-SITE"],

  /* ─────────────────────────────────────────────────────────────────────────
     4. OPTIONAL — MORE THAN ONE SCHOOL ON ONE SITE.

     Leave this out entirely and nothing changes: `url`, `key` and `schools`
     above keep working exactly as they do today. That is the live setting.

     Fill it in and the site switches to REGISTRY MODE. Each entry is one
     destination — one Sheet, one Apps Script, one pair of keys. A classroom
     link then carries ?org=<id>, and that id decides where the row goes.

         destinations: {
           "north-jh": {
             label: "Northside Junior High",
             url:   "https://script.google.com/macros/s/…/exec",
             key:   "<that school's BACKEND_AUTH_KEY>"
           },
           "lincoln-es": { label: "Lincoln Elementary", url: "…", key: "…" }
         }

     ⚠ IN REGISTRY MODE, `url` / `key` / `schools` ABOVE ARE IGNORED. There is
     no default destination and no fallback. A link with no ?org=, or an org
     that is not listed here, syncs NOWHERE — the reflection and the check-in
     still run and stay on the device. That is deliberate: a router that
     guesses is a router that eventually files one district's children under
     another district's name.

     ⚠ AN ID IS NOT A SECRET and is not a password. It picks an entry in this
     public file. It is also NOT the School ID a teacher types into the
     Distribute card — that one is free text for their own labeling, and
     routing on it would make a typo dangerous. Issue ids yourself, keep them
     boring and unguessable-ish, and hand each school its own.

     ⚠ EVERY KEY IN THIS FILE IS PUBLIC, so in registry mode one listed school
     can append forged rows into another listed school's Sheet. That is the
     same unvalidated-write risk described above, with a wider blast radius.
     Say so to a district rather than let them discover it.

     Migrating: give your own Sheet the first entry and hand that id to
     everyone already using the site, so nothing goes dark on the day you
     switch.
     ───────────────────────────────────────────────────────────────────────── */
  // destinations: { }
};

/* AOG-DEVICE-SHEET-V1 (2026-09-27) — Jimmy: "If I don't send my children a direct link and they or I use my iPad /
   phone, I want the data to go to the Google Sheet that the device is connected to."
   Order, on every page that sends work:
     1. a classroom link's own destination (?dest= / ?org=)   — unchanged, it still wins
     2. THIS DEVICE's saved Sheet connection (Dashboard ▸ Set up ▸ Connect your school's Sheet:
        aog.sync.url + aog.sync.writekey)                        — NEW
     3. the site default above                                   — only when 1 and 2 are absent
   Read-only here: nothing is ever written to or erased from the saved connection. */
(function () {
  try {
    var u = localStorage.getItem("aog.sync.url") || "", k = localStorage.getItem("aog.sync.writekey") || "";
    var cfg = window.AOG_SYNC_DEFAULTS;
    if (cfg && !cfg.destinations && /^https:\/\/script\.google\.com\/[^\s]*\/exec$/.test(u) && k) {
      cfg.url = u; cfg.key = k; cfg.label = "This device's Sheet";
      if (!cfg.schools || !cfg.schools.length) cfg.schools = ["*"];
    }
  } catch (e) {}
})();
