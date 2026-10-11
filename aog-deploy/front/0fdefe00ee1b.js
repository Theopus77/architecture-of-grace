(function(){
  /* ---- 1. Mark the body while a reflection screen is showing ----------
     A body class rather than :has(), which older school iPads do not have.
     Wrapping showScreen is the same idiom the page already uses. */
  /* screen-daily-checkin joined this on 2026-08-28. On an iPhone X the site
     header measured 148 px of a 635 px visible viewport — 23% of the screen
     given to a masthead a student does not need mid-check-in — and the stage
     shrank to fit under it until question 2 showed its fourteen feeling
     words through a 174 px window with 98 px of scrolling inside it — the
     "there is a lot of scrolling" Jimmy reported from his own iPhone X.
     Hiding the header takes that box from 174 px to 322 px and the internal
     scroll to zero. Checked first: none of the OTHER aog-survey-focus rules
     match anything inside the check-in (.survey-stage, .item-card, #itemText,
     .response-option, .progress-bar, #domainChip, .response-grid-6,
     .survey-actions, .nav-row all return 0 there), so this hides .topbar and
     #tourFab and changes nothing else. */
  var FOCUS = { "screen-survey":1, "screen-reflection":1, "screen-daily-checkin":1, "screen-exit-slip":1, "screen-home-skills":1, "screen-home-checkin":1 };
  /* screen-exit-slip joined 2026-08-27. Checked the same way the check-in
     was: none of the OTHER aog-survey-focus rules match anything inside it
     (.survey-stage, .item-card, #itemText, .response-option, .progress-bar,
     #domainChip, .response-grid-6, .survey-actions, .nav-row all return 0
     there — every control on that screen is .xs-* prefixed), so this hides
     .topbar and #tourFab and changes nothing else.

     screen-home-skills joined 2026-08-28, checked the same way — every
     control on the family screen is .hs-* prefixed. This one matters more
     than the other three: the person reading it is a parent who followed a
     text message, and the marketing header of a curriculum site is not what
     they came for. */
  function wrapShow(){
    if (typeof window.showScreen !== "function" || window.showScreen.__aogSurveyFocus) return;
    var real = window.showScreen;
    var wrapped = function(id){
      var r = real.apply(this, arguments);
      try{ document.body.classList.toggle("aog-survey-focus", !!FOCUS[id]); }catch(e){}
      return r;
    };
    wrapped.__aogSurveyFocus = true;
    window.showScreen = wrapped;
  }

  /* Put a Quiet Space door beside Save & exit. Nobody should have to finish
     a reflection to reach the calming tools, and on a phone the header that
     used to carry that link is now hidden here. */
  function addCalmDoor(){
    ["screen-survey","screen-reflection"].forEach(function(sid){
      var sc = document.getElementById(sid); if(!sc) return;
      var row = sc.querySelector(".survey-stage > .nav-row"); if(!row) return;
      if (row.querySelector(".aog-survey-calm")) return;
      var a = document.createElement("button");
      a.type = "button";
      a.className = "btn btn-ghost aog-survey-calm";
      a.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6c0 4 6 9 6 9s6-5 6-9a6 6 0 0 0-6-6z"/><circle cx="12" cy="9" r="1.5"/></svg> <span>Quiet Space</span>';
      a.title = "Quiet Space — an in-the-moment reset";
      a.addEventListener("click", function(){
        if (typeof window.showStationMode === "function") window.showStationMode();
        else if (typeof window.openRightNow === "function") window.openRightNow();
      });
      try{
        var es = (document.documentElement.getAttribute("lang")||"en").slice(0,2) === "es";
        if (es) a.querySelector("span").textContent = "Espacio Tranquilo";
      }catch(e){}
      row.appendChild(a);
    });
  }

  /* ---- 2. Keep dropdowns inside the screen ---------------------------
     .aog-demo-menu is anchored `right:0` to its button. When the toolbar
     wraps on a phone the button lands near the left edge, and a 200px+
     menu hanging off its right edge runs off the screen — which is what
     "District demo" was doing. Measure after opening and nudge it back. */
  function clamp(menu, anchor){
    if (!menu || menu.hidden || !anchor) return;
    var vw = document.documentElement.clientWidth, pad = 10;
    menu.style.maxWidth = (vw - pad * 2) + "px";
    menu.style.right = "auto";
    menu.style.left = "0px";
    var a = anchor.getBoundingClientRect();
    var w = menu.getBoundingClientRect().width;
    var left = a.width - w;                       // the design intent: right-aligned
    if (a.left + left < pad) left = pad - a.left; // ...unless that runs off the left
    if (a.left + left + w > vw - pad) left = vw - pad - w - a.left;
    menu.style.left = Math.round(left) + "px";
  }
  function clampOpen(){
    clamp(document.getElementById("aogDemoMenu"), document.getElementById("aogDemoWrap"));
    var rc = document.getElementById("dashRoleCompactMenu");
    clamp(rc, rc && rc.parentElement);
  }
  function hookMenus(){
    ["aogDemoBtn","dashRoleCompactBtn"].forEach(function(id){
      var b = document.getElementById(id);
      if (!b || b.__aogClamped) return;
      b.__aogClamped = 1;
      b.addEventListener("click", function(){ setTimeout(clampOpen, 0); });
    });
  }
  window.addEventListener("resize", clampOpen);
  window.addEventListener("orientationchange", function(){ setTimeout(clampOpen, 120); });

  function boot(){ wrapShow(); addCalmDoor(); hookMenus(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 700);
  setTimeout(boot, 2000);
})();