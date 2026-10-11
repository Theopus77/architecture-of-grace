
/* AOG-EXNAV-BANDS-V1 — one band open at a time within its door */
function aogToggleBand(e, b){
  e.preventDefault(); e.stopPropagation();
  var f = document.getElementById(b.getAttribute("aria-controls")); if(!f) return;
  var open = b.getAttribute("aria-expanded") !== "true";
  var door = b.closest(".exnav-fold");
  if(door){ door.querySelectorAll(".exnav-blab").forEach(function(o){ if(o !== b){ o.setAttribute("aria-expanded","false"); var of = document.getElementById(o.getAttribute("aria-controls")); if(of) of.hidden = true; } }); }
  f.hidden = !open; b.setAttribute("aria-expanded", String(open));
}
