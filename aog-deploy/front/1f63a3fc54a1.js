
/* AOG-DOORS-DEST-V1 — a door with a list opens it under its own row; one open at a time. */
function aogDoorPlace(btn){
  var grid = document.getElementById("aogdnGrid"), panel = document.getElementById("aogdnPanel"); if(!grid || !panel) return;
  var top = btn.offsetTop, last = btn;
  grid.querySelectorAll(".aogdn-door").forEach(function(c){ if(Math.abs(c.offsetTop - top) < 4) last = c; });
  if(last.nextElementSibling !== panel) last.parentNode.insertBefore(panel, last.nextElementSibling);
}
function aogDoorClose(){
  var panel = document.getElementById("aogdnPanel"); if(!panel) return;
  var open = document.querySelector('#aogdnGrid .aogdn-door[aria-expanded="true"]');
  document.querySelectorAll('#aogdnGrid .aogdn-door[aria-expanded]').forEach(function(d){ d.setAttribute("aria-expanded","false"); });
  panel.hidden = true; panel.querySelectorAll(".aogdn-list").forEach(function(l){ l.hidden = true; });
  if(open) try{ open.focus({preventScroll:true}); }catch(e){}
}
function aogDoorOpen(btn){
  var panel = document.getElementById("aogdnPanel"); if(!panel) return;
  var was = btn.getAttribute("aria-expanded") === "true";
  aogDoorClose(); if(was) return;
  var list = document.getElementById(btn.getAttribute("aria-controls")); if(!list) return;
  aogDoorPlace(btn); list.hidden = false; panel.hidden = false; btn.setAttribute("aria-expanded","true");
  try{ var r = panel.getBoundingClientRect(); if(r.bottom > innerHeight) panel.scrollIntoView({block:"nearest", behavior:"instant"}); }catch(e){}
}
function aogDoorFold(e, b){
  if(e){ e.preventDefault(); e.stopPropagation(); }
  var f = document.getElementById(b.getAttribute("aria-controls")); if(!f) return;
  var open = b.getAttribute("aria-expanded") !== "true", ul = b.closest("ul");
  if(ul) [].forEach.call(ul.children, function(li){ var o = li.querySelector(":scope > .aogdn-flab");
    if(o && o !== b && o.getAttribute("aria-expanded") === "true"){ o.setAttribute("aria-expanded","false"); var x = document.getElementById(o.getAttribute("aria-controls")); if(x) x.hidden = true; } });
  b.setAttribute("aria-expanded", open ? "true" : "false"); f.hidden = true;
  if(open){ aogFoldPlace(b, f); f.hidden = false; }
}
/* AOG-DOOR-CARDS-V1: an open subject's grade cards go right after the last card in its row, full width. */
function aogFoldPlace(b, f){
  var li = b.closest("li"), ul = li && li.parentNode; if(!ul) return;
  var top = li.offsetTop, last = li;
  [].forEach.call(ul.children, function(c){ if(c !== f && !c.hidden && !c.classList.contains("aogdn-fold") && Math.abs(c.offsetTop - top) < 4) last = c; });
  if(last.nextElementSibling !== f) ul.insertBefore(f, last.nextElementSibling);
}
document.addEventListener("keydown", function(e){ if(e.key === "Escape" && document.querySelector('#aogdnGrid .aogdn-door[aria-expanded="true"]')) aogDoorClose(); });
window.addEventListener("resize", function(){ var b = document.querySelector('#aogdnGrid .aogdn-door[aria-expanded="true"]'); if(b) aogDoorPlace(b);
  document.querySelectorAll('#aogdnPanel .aogdn-flab[aria-expanded="true"]').forEach(function(x){ var f = document.getElementById(x.getAttribute("aria-controls")); if(f){ f.hidden = true; aogFoldPlace(x, f); f.hidden = false; } }); });
