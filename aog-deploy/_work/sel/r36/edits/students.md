# Edits from the `students` agent (AOG-R36-V1, 2026-10-23)

New page: `aog-deploy/room-36-students.html` (/room-36-students). Its "My Room 36" card only READS this device's
storage. Two of the three things it shows need small additions in pages I do not own. Until those land, the card shows
"where you left off" in the novel and 0 workbook checks. It never breaks.

## 1. aog-novel.js (owner: novel-reader): remember the chapters opened
Why: the reader keeps only where you left off (`aog.novel.<key>.at`). "Chapters read" needs the set of sections opened.
Key the students' page reads: `aog.novel.room-36.read`, a JSON array of section indexes (the `?ch=` numbers).
Works for every book (`aog.novel.<KEY>.read`). Words stay on the device; nothing is sent.

File `aog-deploy/aog-novel.js`, in `render`, old text (exact):

    ls.set("aog.novel." + KEY + ".at", i);
    try {
      var u = new URL(location.href); u.searchParams.set("ch", i);

New text:

    ls.set("aog.novel." + KEY + ".at", i);
    /* AOG-R36-V1: the sections opened, for the students' own progress card (/room-36-students). On this device only. */
    try { var rd = JSON.parse(ls.get("aog.novel." + KEY + ".read") || "[]"); if (!(rd instanceof Array)) rd = []; if (rd.indexOf(i) < 0) { rd.push(i); ls.set("aog.novel." + KEY + ".read", JSON.stringify(rd)); } } catch (e) {}
    try {
      var u = new URL(location.href); u.searchParams.set("ch", i);

## 2. room-36-workbook.html (owner: workbook): keep the checks on the device
Why: the workbook's "Checked: n / 7" tally resets on every reload; nothing is stored. The students' page reads
`aog.interior.wb36.v1` = `{"u1":["u1-q1","u1-q3"], "u2":[…], … "u5":[…]}` (the `.q` ids already in the page), and shows
only how many are checked per unit (no right/wrong, no scores).

File `aog-deploy/room-36-workbook.html`, old text (exact):

        tn.textContent=(+tn.textContent)+1;
        if(o.getAttribute("data-ok")==="1" && first) tr.textContent=(+tr.textContent)+1;

New text:

        tn.textContent=(+tn.textContent)+1;
        if(o.getAttribute("data-ok")==="1" && first) tr.textContent=(+tr.textContent)+1;
        /* AOG-R36-V1: which questions are checked, on this device only, for /room-36-students */
        try{ var WK="aog.interior.wb36.v1", wd=JSON.parse(localStorage.getItem(WK)||"{}")||{}, uid=sec.id;
             wd[uid]=wd[uid]||[]; if(wd[uid].indexOf(q.id)<0) wd[uid].push(q.id); localStorage.setItem(WK, JSON.stringify(wd)); }catch(e){}

(Optional, the workbook owner's call: on load, mark those questions done again. The students' page does not need it.)
If the workbook gets an "Erase" button later, it should remove `aog.interior.wb36.v1` too.

## 3. Links into the new page (owners: lead / lessons / curriculum / cards / workbook / worksheets / novel-reader)
Suggested: a "For students" door to `/room-36-students` wherever Room 36 shows its own menu (the novel's "Jump to another
room" Room 36 group, the workbook's Explore menu, sel.html's Room 36 card). Short link `/room-36-students` is the lead's.
Suggested option text for room-36-novel.html's `<optgroup label="Room 36">`:

    <option value="room-36-students.html">For students · My Room 36</option>

## For Jimmy
- The line every student page carries is "What you write here stays on this device. No one else can read it." On a
  shared classroom device, the next person on the same browser could open the same saved worksheet. Worth a plain
  extra line on the worksheets ("On a shared device, tap Erase when you are done.")? Not changed here.
- Spanish chapter titles on the students' page are mine (with the brief's key terms). If the novel-es agents title a
  chapter differently, the novel's title wins; tell me or the lead and the `CH` table in the page is the one place to change.
