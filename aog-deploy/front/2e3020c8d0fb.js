
/* AOG-SR-PAPER-V1: the two quick doors ("I just need to check in", "Close out your day") are placed by their own
   scripts at the top of the screen; this lays them side by side under the masthead. Moving them is safe: each
   script only re-creates its door when the id is missing. */
(function(){
  function lay(){ try{
    var f=document.getElementById("checkin-funnel"), h=f&&f.querySelector(".hero"); if(!h) return;
    var w=document.getElementById("srDoors"); if(!w){ w=document.createElement("div"); w.id="srDoors"; h.parentNode.insertBefore(w,h.nextSibling); }
    ["aogQuickDoor","aogExitDoor"].forEach(function(id){ var b=document.getElementById(id); if(b&&b.parentNode!==w) w.appendChild(b); });
  }catch(e){} }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",lay); else lay();
  [400,1000,2600,4000].forEach(function(t){ setTimeout(lay,t); });
})();
