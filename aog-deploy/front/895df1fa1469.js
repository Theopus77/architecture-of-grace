(function(){
  function curLang(){ return (typeof lang!=="undefined" && lang==="es") ? "es" : "en"; }
  function ecoLoad(key){
    var L=curLang();
    var fr=document.getElementById("ecoframe-"+key); if(!fr) return;
    var tpl=document.getElementById(L==="es" ? "ecodoc-"+key+"-es" : "ecodoc-"+key) || document.getElementById("ecodoc-"+key);
    if(!tpl) return;
    if(fr.getAttribute("data-lang")!==L){ fr.srcdoc=tpl.textContent; fr.setAttribute("data-lang",L); }
    // Auto-size the iframe to its content so the OUTER page scrolls — no nested scrollbar.
    var fit=function(){ try{
      var d=fr.contentDocument; if(!d) return;
      var b=d.body, e=d.documentElement;
      var h=Math.max(b?b.scrollHeight:0, e?e.scrollHeight:0, b?b.offsetHeight:0);
      if(h){ fr.style.height=h+"px"; }
    }catch(_e){} };
    fr.onload=function(){
      /* AOG-ECO-FACELIFT-V1 (2026-09-26) — Jimmy: "COMPLETE OVERHAUL FACE LIFT" for
         #eco-parents and #eco-educators (and their four siblings). On screen the
         Letter pages stop being tall sheets of empty paper: each page is a leaded
         stained-glass pane sized to its words, on the site's night-navy ground,
         with calmer type. Print is untouched — the fridge copy still prints. */
      try{
        var dd=fr.contentDocument;
        if(dd && !dd.getElementById("aog-eco-face")){
          var st=dd.createElement("style"); st.id="aog-eco-face";
          st.textContent="@media screen{html,body{background:linear-gradient(180deg,#0B2036,#081828)!important;}"+
            "body{padding:18px 12px 40px!important;margin:0!important;}"+
            ".page{height:auto!important;min-height:0!important;max-width:880px!important;width:auto!important;margin:0 auto 22px!important;"+
            "border:3px solid #1E1F22!important;border-radius:20px!important;box-shadow:0 0 0 1px rgba(242,201,100,.5),inset 0 7px 0 #C9A24A,0 24px 50px -30px rgba(0,0,0,.8)!important;"+
            "padding:34px 34px 28px!important;overflow:hidden;}"+
            ".page:nth-of-type(4n+2){box-shadow:0 0 0 1px rgba(242,201,100,.5),inset 0 7px 0 #2F63B8,0 24px 50px -30px rgba(0,0,0,.8)!important}"+
            ".page:nth-of-type(4n+3){box-shadow:0 0 0 1px rgba(242,201,100,.5),inset 0 7px 0 #2E8B57,0 24px 50px -30px rgba(0,0,0,.8)!important}"+
            ".page:nth-of-type(4n+4){box-shadow:0 0 0 1px rgba(242,201,100,.5),inset 0 7px 0 #7B4FA0,0 24px 50px -30px rgba(0,0,0,.8)!important}"+
            ".box{border-radius:14px!important;}"+
            "body{font-size:16.5px!important;line-height:1.6!important;}"+
            "h1{font-size:clamp(30px,5vw,42px)!important;}"+
            "@media (max-width:560px){.page{padding:22px 16px 18px!important;border-width:2px!important;}}}";
          (dd.head||dd.documentElement).appendChild(st);
        }
      }catch(_s){}
      fit();
      try{
        var d=fr.contentDocument, w=fr.contentWindow;
        if(d&&d.fonts&&d.fonts.ready&&d.fonts.ready.then){ d.fonts.ready.then(fit); }
        if(w&&w.addEventListener){ w.addEventListener("resize",fit); }
        if(("ResizeObserver" in window)&&d&&d.body){ try{ new ResizeObserver(fit).observe(d.body); }catch(_r){} }
      }catch(_o){}
      setTimeout(fit,250); setTimeout(fit,800); setTimeout(fit,1600);
    };
    if(!fr._aogFitResize){ fr._aogFitResize=1; window.addEventListener("resize",function(){ fit(); }); }
    setTimeout(fit,300); setTimeout(fit,900);
  }
  window.aogOpenEco=function(key){
    if(key==="home"){ location.href="/grace-at-home.html"; return; }
    if(typeof showScreen==="function") showScreen("screen-eco-"+key);
    if(typeof aogSetHash==="function") try{aogSetHash("eco-"+key);}catch(e){}
    ecoLoad(key);
    try{ window.scrollTo(0,0); }catch(e){}
  };
  window.aogEcoRelang=function(){
    var act=document.querySelector(".screen.active");
    if(act && act.id.indexOf("screen-eco-")===0){ ecoLoad(act.id.replace("screen-eco-","")); }
  };
})();