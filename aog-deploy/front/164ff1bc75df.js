(function(){
  var loaded = false, lastLoadAt = 0;
  function frame(){ return document.getElementById("talkframe"); }

  function load(){
    if (loaded) return;
    var host = document.querySelector("#screen-talk .talk-wrap");
    var tpl  = document.getElementById("talkdoc");
    if (!host || !tpl) return;
    loaded = true;
    lastLoadAt = +new Date();

    /* Build the frame with its content ALREADY set, then insert it.
       Assigning .srcdoc to a frame that is already in the document is a
       navigation of that frame, and a navigation pushes a session-history
       entry — so the browser Back button first rewound the board to a blank
       about:blank inside a still-full-screen overlay, which read as "an extra
       blank page". A frame inserted with its content already on it performs
       its initial navigation instead, which replaces rather than pushes. */
    var fr = document.createElement("iframe");
    fr.id = "talkframe";
    fr.title = "Talk It Out — whole-class discussion board";
    fr.setAttribute("allow", "fullscreen");
    fr.setAttribute("allowfullscreen", "");
    fr.onload = function(){
      try{
        var d = fr.contentDocument;
        if (!d || !d.querySelector) return;
        /* Inside the site, the board's "Architecture of Grace" chip should step
           back one screen — not reload the whole app inside its own frame. It
           lives in the board's own header bar, so nothing sits under it. */
        var home = d.querySelector(".aog-home");
        if (home){
          home.setAttribute("href", "#");
          home.addEventListener("click", function(e){
            e.preventDefault();
            try{ parent.aogTalkBack(); }catch(_){}
          });
        }
        /* Space, arrows, W, R, T, P and F are bound inside the frame, so the
           frame needs the focus the moment the board opens. */
        if (fr.contentWindow && fr.contentWindow.focus) fr.contentWindow.focus();
      }catch(_e){}
    };
    fr.srcdoc = tpl.textContent.replace(/<\\\/script>/g, "<\/script>").replace('<html lang="en">', '<html lang="en" data-theme="' + (document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light") + '">'); /* .30eg: the frame begins on the app's theme, not the OS's */
    host.innerHTML = "";
    host.appendChild(fr);
  }

  /* If the board screen is ever showing with nothing in the frame — a restored
     tab, a bfcache return, a Back press that outran us — the full-bleed overlay
     would be a blank white screen with the site's own header hidden behind it,
     and no way out. Never leave that on screen: rebuild the board, or go home. */
  function rescue(){
    var sc = document.getElementById("screen-talk");
    if (!sc || !sc.classList.contains("active")) return;
    /* A board that was only just built has not painted yet; leave it alone or
       the rescue turns into a rebuild loop on a #talk deep link. */
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

  window.aogGoTalk = function(){
    try{ if (typeof aogCloseExplore === "function") aogCloseExplore(); }catch(e){}
    if (typeof showScreen === "function") showScreen("screen-talk");
    if (typeof aogSetHash === "function"){ try{ aogSetHash("talk"); }catch(e){} }
    load();
    var fr = frame();
    if (fr) setTimeout(function(){ try{ fr.contentWindow.focus(); }catch(e){} }, 150);
    return false;
  };

  window.aogTalkBack = function(){
    if (typeof goBack === "function") goBack();
    else if (typeof showScreen === "function") showScreen("screen-welcome");
  };

  /* Wrap showScreen so the chrome hides on the way in and comes back on the way
     out — including a browser Back — without touching the original function. */
  function wrap(){
    if (typeof window.showScreen !== "function" || window.showScreen.__aogTalk) return;
    var real = window.showScreen;
    var wrapped = function(id){
      var r = real.apply(this, arguments);
      try{ document.body.classList.toggle("aog-talk-open", id === "screen-talk"); }catch(e){}
      return r;
    };
    wrapped.__aogTalk = true;
    window.showScreen = wrapped;
  }

  var HASHES = { "talk":1, "talk-it-out":1, "talkitout":1, "board":1 };
  function route(){
    var h = (location.hash || "").replace(/^#/, "").trim().toLowerCase();
    if (!HASHES[h]) return;
    if (typeof showScreen === "function") showScreen("screen-talk");
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