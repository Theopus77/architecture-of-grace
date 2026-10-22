
/* AOG-DD-WORKSPACE-V1 — the pencil layer. See the CSS note of the same name. */
(function(){
  "use strict";
  var KEY="aog.drops.work", body=document.body;
  function mode(){ try{ return localStorage.getItem(KEY)==="boxes"?"boxes":"pencil"; }catch(e){ return "pencil"; } }
  function apply(m){
    body.classList.toggle("work-pencil", m==="pencil");
    document.querySelectorAll("#workBar .wb").forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-work")===m ? "true":"false"); });
    if(m==="pencil") attachAll();
  }
  document.addEventListener("click", function(e){
    var b=e.target.closest && e.target.closest("#workBar .wb"); if(!b) return;
    var m=b.getAttribute("data-work"); try{ localStorage.setItem(KEY,m); }catch(e2){}
    apply(m);
  });
  function ink(){ var v=""; try{ v=getComputedStyle(document.documentElement).getPropertyValue("--ink").trim(); }catch(e){} return v||"#1D2733"; }
  function attach(host){
    if(host.__scr) return;
    var c=document.createElement("canvas"); c.className="scr"; c.setAttribute("aria-hidden","true");
    var clr=document.createElement("button"); clr.type="button"; clr.className="scrclr"; clr.title="Clear the pencil marks on this problem"; clr.setAttribute("aria-label",clr.title); clr.innerHTML="&#8634;";
    host.appendChild(c); host.appendChild(clr);
    var ctx=c.getContext("2d"), dpr=Math.max(1, window.devicePixelRatio||1), drawing=false, last=null, erasing=false;
    function size(){
      var w=host.clientWidth, h=host.clientHeight; if(!w||!h) return;
      if(c.width===Math.round(w*dpr) && c.height===Math.round(h*dpr)) return;
      var keep=null; if(c.width&&c.height){ try{ keep=document.createElement("canvas"); keep.width=c.width; keep.height=c.height; keep.getContext("2d").drawImage(c,0,0); }catch(e){ keep=null; } }
      c.width=Math.round(w*dpr); c.height=Math.round(h*dpr);
      if(keep) ctx.drawImage(keep,0,0,keep.width,keep.height,0,0,c.width,c.height);
    }
    size();
    try{ new ResizeObserver(size).observe(host); }catch(e){ window.addEventListener("resize", size); }
    function pt(e){ var r=c.getBoundingClientRect(); return {x:(e.clientX-r.left)*dpr, y:(e.clientY-r.top)*dpr}; }
    function stroke(a,b){
      ctx.lineCap="round"; ctx.lineJoin="round";
      if(erasing){ ctx.globalCompositeOperation="destination-out"; ctx.lineWidth=16*dpr; }
      else { ctx.globalCompositeOperation="source-over"; ctx.strokeStyle=ink(); ctx.lineWidth=2.1*dpr; }
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }
    c.addEventListener("pointerdown", function(e){
      if(e.button!==0 && e.button!==5 && e.button!==2) return;
      /* a stylus eraser end, or the pen's barrel button, erases */
      erasing = (e.pointerType==="pen" && (e.buttons&32)) || e.button===5 || e.button===2;
      drawing=true; last=pt(e); size();
      try{ c.setPointerCapture(e.pointerId); }catch(e2){}
      stroke(last,{x:last.x+0.01,y:last.y+0.01});
      host.classList.add("inked");
      e.preventDefault();
    });
    c.addEventListener("contextmenu", function(e){ e.preventDefault(); });
    c.addEventListener("pointermove", function(e){
      if(!drawing) return;
      var evs = (e.getCoalescedEvents ? e.getCoalescedEvents() : null) || [e];
      for(var i=0;i<evs.length;i++){ var p=pt(evs[i]); stroke(last,p); last=p; }
      e.preventDefault();
    });
    function up(){ drawing=false; last=null; }
    c.addEventListener("pointerup", up); c.addEventListener("pointercancel", up); c.addEventListener("lostpointercapture", up);
    clr.addEventListener("click", function(){ ctx.clearRect(0,0,c.width,c.height); host.classList.remove("inked"); });
    host.__scr=c;
  }
  var queued=false;
  function attachAll(){
    var hosts=document.querySelectorAll("#sheet .colp, #sheet .ug"), bar=document.getElementById("workBar");
    /* the switch only shows on a sheet that has column work on it */
    if(bar) bar.hidden=!hosts.length;
    if(!body.classList.contains("work-pencil")) return;
    hosts.forEach(attach);
  }
  function schedule(){ if(queued) return; queued=true; (window.requestAnimationFrame||setTimeout)(function(){ queued=false; attachAll(); }); }
  function boot(){
    apply(mode());
    var sh=document.getElementById("sheet");
    if(sh){ try{ new MutationObserver(schedule).observe(sh,{childList:true,subtree:true}); }catch(e){} }
    schedule();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  setTimeout(schedule, 800);
})();
