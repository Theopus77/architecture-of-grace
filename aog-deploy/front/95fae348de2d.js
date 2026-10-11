
/* AOG-SR-RESULTS-PAPER-V1: turns the paper look on for a student's or child's own results (not adult or
   workplace), gives each area a striped number and a plain line, and moves the scores, colour band and the
   Closed loop note into a "For adults" fold. It only moves nodes that are already there; it reads the record,
   never writes it, and never touches what is saved, sent or printed. */
(function(){
  var COL={A:"#2F63B8",B:"#B8457A",C:"#2E8B57"};
  function rec(){ return window._lastResult||window._pendingRecord||null; }
  function kid(r){ return !!r && r.population!=="adult" && String(r.grade)!=="Adult"; }
  function es(){ try{ return lang==="es"; }catch(e){ return false; } }
  function T(en,sp){ return es()?sp:en; }
  function decorate(){ try{
    var box=document.getElementById("myResultsReport"), r=rec(); if(!box||!kid(r)) return;
    var hd=box.querySelector(".home-header");
    if(hd && !hd.querySelector(".srr-adults")){
      var d=document.createElement("details"); d.className="srr-adults";
      d.innerHTML='<summary>'+T("For adults: scores and details","Para adultos: puntajes y detalles")+'</summary><p class="srr-note">'+T("These numbers help your teacher or family know how to help. They are not a grade.","Estos números ayudan a tu maestro o tu familia a saber cómo ayudarte. No son una calificación.")+'</p>';
      var pill=hd.querySelector(".pill"); if(pill){ var ps=pill.previousSibling; if(ps&&ps.nodeType===3) ps.textContent=ps.textContent.replace(/\s*·\s*$/," "); var pp=document.createElement("p"); pp.appendChild(pill); d.appendChild(pp); }
      var sc=hd.querySelector(".home-header-scores"); if(sc) d.appendChild(sc);
      var cl=box.querySelector(".home-cl"); if(cl) d.appendChild(cl);
      hd.appendChild(d);
    }
    var gc=document.getElementById("grace-compass-report");
    if(gc && !box.querySelector(".srr-h-help")){ var h=document.createElement("h2"); h.className="srr-h srr-h-help"; h.textContent=T("What might help","Lo que te puede ayudar"); box.insertBefore(h,gc); }
    var secs=box.querySelectorAll(".home-domain-section"), keys=["A","B","C"], vals=[r.normA,r.normB,r.normC];
    var hi=-1,lo=-1; vals.forEach(function(v,i){ if(v==null) return; if(hi<0||v>vals[hi]) hi=i; if(lo<0||v<vals[lo]) lo=i; });
    Array.prototype.forEach.call(secs,function(s,i){
      if(i>2||s.querySelector(".srr-num")) return;
      s.style.setProperty("--nc",COL[keys[i]]);
      var head=s.querySelector(".home-domain-head"), L=s.querySelector(".home-domain-headL"); if(!head||!L) return;
      var n=document.createElement("span"); n.className="srr-num"; n.setAttribute("aria-hidden","true"); n.textContent=String(i+1); head.insertBefore(n,head.firstChild);
      if(hi!==lo && (i===hi||i===lo)){ var t=document.createElement("span"); t.className="srr-tag"; t.textContent=i===hi?T("Where you feel strongest right now","Donde te sientes más fuerte ahora"):T("A place to grow, gently","Un lugar para crecer, con calma"); L.appendChild(t); }
    });
  }catch(e){} }
  function sync(){ try{
    var s=document.getElementById("screen-myresults"), on=!!s&&s.classList.contains("active")&&kid(rec());
    if(on){ document.documentElement.setAttribute("data-sr-results",""); decorate(); } else document.documentElement.removeAttribute("data-sr-results");
  }catch(e){} }
  function boot(){ try{
    var s=document.getElementById("screen-myresults"); if(s) new MutationObserver(sync).observe(s,{attributes:true,attributeFilter:["class"]});
    var b=document.getElementById("myResultsReport"); if(b) new MutationObserver(function(){ if(document.documentElement.hasAttribute("data-sr-results")) decorate(); }).observe(b,{childList:true});
    sync();
  }catch(e){} }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
