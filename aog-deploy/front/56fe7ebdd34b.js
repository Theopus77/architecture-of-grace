
/* AOG-SR-PAPER-V2: turns the paper look on while a student or child reflection runs (population "k12"), and off
   for the adult and workplace runs and every other screen. It only sets an attribute on <html>; it reads nothing
   and changes nothing else. */
(function(){
  var IDS=["screen-survey","screen-reflection","screen-closing","screen-thanks"];
  function sync(){ try{
    var on=false;
    for(var i=0;i<IDS.length;i++){ var s=document.getElementById(IDS[i]); if(s&&s.classList.contains("active")){ on=true; break; } }
    var pop; try{ pop=population; }catch(e){ pop=""; }
    if(on&&pop!=="adult") document.documentElement.setAttribute("data-sr-paper",""); else document.documentElement.removeAttribute("data-sr-paper");
  }catch(e){} }
  function boot(){ try{
    var mo=new MutationObserver(sync);
    IDS.forEach(function(id){ var s=document.getElementById(id); if(s) mo.observe(s,{attributes:true,attributeFilter:["class"]}); });
    sync();
  }catch(e){} }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
