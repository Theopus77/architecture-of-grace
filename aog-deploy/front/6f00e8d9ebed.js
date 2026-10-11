
/* AOG-SR-SLIP-PAPER-V1: while a student's own results are printed, draws a hatched bar under each of the four
   scores that are already on the slip (width = that score out of 100). It only adds a drawing; it never changes
   the record or what is saved or sent, and the print sheet is emptied after printing as before. */
(function(){
  function bars(){ try{
    if(!document.documentElement.hasAttribute("data-sr-results")) return;
    var r=document.getElementById("printReport"), row=r&&r.querySelector(".home-view>div:nth-child(2)"); if(!row||row.querySelector(".srp-bar")) return;
    Array.prototype.forEach.call(row.children,function(c,k){
      if(k>3) return; var v=c.children[1], m=v&&v.textContent.match(/^\s*(\d+)/); if(!m) return;
      var i=document.createElement("i"); i.className="srp-bar"; i.setAttribute("aria-hidden","true");
      var b=document.createElement("b"); b.style.width=Math.max(0,Math.min(100,+m[1]))+"%"; i.appendChild(b); c.appendChild(i);
    });
  }catch(e){} }
  function boot(){ var r=document.getElementById("printReport"); if(r) new MutationObserver(bars).observe(r,{childList:true}); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
