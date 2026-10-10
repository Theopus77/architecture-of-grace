/* ══ AOG-ADULT-ROOMMENU-V1 (2026-10-10) — THE ADULT EDITION'S "JUMP TO ANOTHER ROOM" ══════════════════
   Jimmy: "I dont see any interactive anchor charts or lesson pages on the Adult SEL … in the drop down menu I
   don't see anything either." Every SEL room page carries a "Jump to another room" drop-down: the rooms'
   lessons, then the room's own pages. Every Adult Edition page now carries the same menu, placed right under
   the masthead: the five rooms and the Adult Edition's lessons, then all the Adult Edition's own pages.
   (aog-sel.js adds the Adult Edition's lessons to the rooms' menus the other way round.) ═══════════════════ */
(function () {
  "use strict";
  if (window.__aogAdultMenu) return; window.__aogAdultMenu = 1;
  var D = document;
  var ROOMS = [["room-12-lessons.html", "Room 12 · Grades K–2 · The Lessons"], ["room-18-lessons.html", "Room 18 · Grades 3–5 · The Lessons"],
               ["room-36-lessons.html", "Room 36 · Grades 6–8 · The Lessons"], ["room-104-lessons.html", "Room 104 · Grades 9–10 · The Lessons"],
               ["room-207-lessons.html", "Room 207 · Grades 11–12 · The Lessons"], ["/adult/lessons", "The Adult Edition · The Lessons"]];
  /* [address, label, the file it serves] */
  var ADULT = [["/adult", "The program", "adult-edition"], ["/adult/curriculum", "The curriculum", "adult-curriculum"],
               ["/adult/lessons", "The lessons", "adult-lessons"], ["/adult/workbook", "The workbook", "adult-workbook"],
               ["/adult/charts", "Anchor charts", "adult-charts"], ["/adult/anchors", "Anchor cards", "adult-anchors"],
               ["/adult/sessions", "Facilitator console", "adult-sessions"], ["/the-dwelling.html", "The novel · The Dwelling", "the-dwelling"]];
  function here() {
    var p = location.pathname.replace(/\/+$/, "").replace(/\.html$/, "");
    for (var i = 0; i < ADULT.length; i++) if (p === ADULT[i][0] || p.split("/").pop() === ADULT[i][2]) return ADULT[i][0];
    return "";
  }
  function build() {
    var mast = D.querySelector("header.mast"); if (!mast || D.getElementById("aogAdultRoom")) return;
    var cur = here(), h = '<label for="aogAdultRoomSel">Jump to another room</label><select id="aogAdultRoomSel">';
    h += '<optgroup label="SEL · The rooms">' + ROOMS.map(function (r) { return '<option value="' + r[0] + '">' + r[1] + "</option>"; }).join("") + "</optgroup>";
    h += '<optgroup label="The Adult Edition · Book 6">' + ADULT.map(function (a) { return '<option value="' + a[0] + '"' + (a[0] === cur ? " selected" : "") + ">" + a[1] + "</option>"; }).join("") + "</optgroup></select>";
    var box = D.createElement("div"); box.id = "aogAdultRoom"; box.className = "aroom no-print"; box.innerHTML = h;
    mast.parentNode.insertBefore(box, mast.nextSibling);
    D.getElementById("aogAdultRoomSel").addEventListener("change", function () { if (this.value && this.value !== cur) location.href = this.value; });
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", build); else build();
})();
