(function(){
  var loaded = false, lastLoadAt = 0;
  function frame(){ return document.getElementById("chartframe"); }

  function load(){
    if (loaded) return;
    var host = document.querySelector("#screen-charts .charts-wrap");
    if (!host) return;
    loaded = true;
    lastLoadAt = +new Date();

    /* Content set BEFORE insertion: a frame already in the document treats a
       new srcdoc as a navigation, which pushes a history entry, and Back then
       rewinds the board to a blank page inside a full-screen overlay. Set
       first, insert second — that is an initial navigation, which replaces. */
    var fr = document.createElement("iframe");
    fr.id = "chartframe";
    fr.title = "Anchor charts — all four units";
    fr.setAttribute("allow", "fullscreen");
    fr.setAttribute("allowfullscreen", "");
    fr.onload = function(){
      try{
        var d = fr.contentDocument;
        if (!d || !d.querySelector) return;
        /* the frame follows the app's theme, same as the old srcdoc injection did */
        try{ d.documentElement.setAttribute("data-theme", document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"); }catch(_t){}
        var home = d.querySelector(".aog-home");
        if (home){
          home.setAttribute("href", "#");
          home.addEventListener("click", function(e){
            e.preventDefault();
            try{ parent.aogChartsBack(); }catch(_){}
          });
        }
        /* Arrow keys and R are bound inside the frame. */
        if (fr.contentWindow && fr.contentWindow.focus) fr.contentWindow.focus();
      }catch(_e){}
    };
    /* .30ha — the frame now loads the LIVE standalone page instead of the
       frozen #chartdoc srcdoc twin, which had drifted to Units 1–2 while the
       real page grew to all four units (Jimmy 2026-09-05: "the charts tab from
       the drop down menu is old"). Same-origin, so the .aog-home rewiring and
       theme sync in onload still apply; the SW caches it cache-first after the
       first online visit, and rescue() below still covers a dead frame. */
    fr.src = "AoG-Anchor-Charts.html";
    host.innerHTML = "";
    host.appendChild(fr);
  }

  /* Never leave a blank full-bleed overlay on screen with the site header
     hidden behind it and no way out — rebuild, or go home. */
  function rescue(){
    var sc = document.getElementById("screen-charts");
    if (!sc || !sc.classList.contains("active")) return;
    if (lastLoadAt && (+new Date() - lastLoadAt) < 3000) return;
    var fr = frame(), alive = false;
    try{ alive = !!(fr && fr.contentDocument && fr.contentDocument.body
                    && fr.contentDocument.body.innerText.trim().length > 10); }catch(e){ alive = true; }
    if (alive) return;
    loaded = false;
    load();
    setTimeout(function(){
      var f2 = frame(), ok = false;
      try{ ok = !!(f2 && f2.contentDocument && f2.contentDocument.body
                   && f2.contentDocument.body.innerText.trim().length > 10); }catch(e){ ok = true; }
      if (!ok && typeof showScreen === "function"){
        showScreen("screen-welcome");
        if (typeof aogSetHash === "function") { try{ aogSetHash(""); }catch(e){} }
      }
    }, 900);
  }
  window.addEventListener("pageshow", function(){ setTimeout(rescue, 250); });
  window.addEventListener("popstate", function(){ setTimeout(rescue, 250); });

  window.aogGoCharts = function(){
    try{ if (typeof aogCloseExplore === "function") aogCloseExplore(); }catch(e){}
    if (typeof showScreen === "function") showScreen("screen-charts");
    if (typeof aogSetHash === "function"){ try{ aogSetHash("charts"); }catch(e){} }
    load();
    var fr = frame();
    if (fr) setTimeout(function(){ try{ fr.contentWindow.focus(); }catch(e){} }, 150);
    return false;
  };

  window.aogChartsBack = function(){
    if (typeof goBack === "function") goBack();
    else if (typeof showScreen === "function") showScreen("screen-welcome");
  };

  function wrap(){
    if (typeof window.showScreen !== "function" || window.showScreen.__aogCharts) return;
    var real = window.showScreen;
    var wrapped = function(id){
      var r = real.apply(this, arguments);
      try{ document.body.classList.toggle("aog-charts-open", id === "screen-charts"); }catch(e){}
      return r;
    };
    wrapped.__aogCharts = true;
    window.showScreen = wrapped;
  }

  var HASHES = { "charts":1, "anchor-charts":1, "anchorcharts":1, "anchors":1 };
  function route(){
    var h = (location.hash || "").replace(/^#/, "").trim().toLowerCase();
    if (!HASHES[h]) return;
    if (typeof showScreen === "function") showScreen("screen-charts");
    load();
    var fr = frame();
    if (fr) setTimeout(function(){ try{ fr.contentWindow.focus(); }catch(e){} }, 200);
  }
  window.addEventListener("hashchange", route);

  function boot(){ wrap(); route(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(wrap, 700);
})();