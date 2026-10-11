
/* AOG-DOOR3-HOME-LAST-V1 (2026-09-26) — Jimmy: "since AT HOME conversation starters and cards is so
   big, it should be at the bottom of the door." Other scripts add rows to door three after load,
   so the At-home group is moved back to the end each time. */
(function(){
  function last(){ var f=document.getElementById("aogdrBeyondHome"); if(!f) return; var h=f.previousElementSibling, ul=f.parentNode;
    if(!h||!ul) return; if(ul.lastElementChild!==f){ ul.appendChild(h); ul.appendChild(f); } }
  [0,400,1200,2500,5000].forEach(function(t){ setTimeout(last,t); });
})();
