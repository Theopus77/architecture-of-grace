
/* AOG-DOORS-CARD-FOLDS-V1 — one band open at a time on card 01 */
function aogToggleCardBand(e, b){
  e.preventDefault(); e.stopPropagation();
  var f = document.getElementById(b.getAttribute("aria-controls")); if(!f) return;
  var open = b.getAttribute("aria-expanded") !== "true";
  var card = b.closest(".aogdr-door");
  /* AOG-ATRIUM-V2: a fold that holds this button (the grade rooms) stays open */
  if(card){ card.querySelectorAll(".aogdr-blab").forEach(function(o){ var of0 = document.getElementById(o.getAttribute("aria-controls")); if(o !== b && !(of0 && of0.contains(b))){ o.setAttribute("aria-expanded","false"); var of = of0; if(of) of.hidden = true; } }); }
  f.hidden = !open; b.setAttribute("aria-expanded", String(open));
}
