
(function(){
  "use strict";
  function vis(el){
    if(!el) return false;
    var s = window.getComputedStyle(el);
    return s.display !== "none" && s.visibility !== "hidden" && el.offsetParent !== null;
  }
  function onWelcome(){
    var w = document.getElementById("screen-welcome");
    return !!(w && w.classList.contains("active"));
  }

  /* 1 + 2 — the nudge belongs to the welcome screen, and owns the corner alone.
     Hidden rather than removed: maybeNudge() bails early if #aogNudge already
     exists, so removing it would mean it never returns this session, and the
     × button's "seen" flag is the only thing that should retire it for good. */
  function tidyNudge(){
    var n = document.getElementById("aogNudge");
    if(n){
      var show = onWelcome();
      n.style.display = show ? "" : "none";
      document.body.classList.toggle("aog-nudge-up", show);
    } else {
      document.body.classList.remove("aog-nudge-up");
    }
  }

  /* 3 — never two Backs. The topbar's Back is the real one and goBack() always
     resolves, so the Guide's own button only appears if the topbar's is not
     there (a deep link straight into the Guide). */
  function tidyBack(){
    var hero = document.querySelector(".guide-hero-back");
    if(!hero) return;
    hero.classList.toggle("aog-back-dupe", vis(document.getElementById("topbarBack")));
  }

  function tidy(){ tidyNudge(); tidyBack(); }

  /* The nudge is created ~1100ms after landing on welcome, and the topbar Back
     is toggled by the router — so watch for both rather than guessing at timing. */
  function watch(){
    try{
      new MutationObserver(tidy).observe(document.body, { childList:true, subtree:false });
    }catch(e){}
    try{
      var tb = document.getElementById("topbarBack");
      if(tb) new MutationObserver(tidyBack).observe(tb, { attributes:true, attributeFilter:["style","class"] });
    }catch(e){}
    /* wrap rather than replace, and hand back the original's return value */
    if(window.showScreen && !window.showScreen.__manners){
      var orig = window.showScreen;
      window.showScreen = function(){
        var r = orig.apply(this, arguments);
        try{ requestAnimationFrame(tidy); }catch(e){ tidy(); }
        return r;
      };
      window.showScreen.__manners = true;
    }
  }

  function init(){ watch(); tidy(); }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 200); });
  else setTimeout(init, 200);
  window.addEventListener("popstate", function(){ setTimeout(tidy, 60); });

  window.__aogManners = { tidy:tidy };
})();
