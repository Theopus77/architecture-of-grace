
(function(){
  var STAGE_NONE = 0, STAGE_CLOSING = 1, STAGE_DONE = 2;
  var stage = STAGE_NONE;

  /* renderClosing() paints the chips from a `closingSel` that is not on
     window, so it cannot be emptied directly. Clicking an already-on chip
     runs toggleClosingChip, which does empty it. */
  function freshClosing(){
    try{
      if (typeof window.renderClosing === "function") window.renderClosing();
      var on = document.querySelectorAll("#closingOptions .choice-chip.on");
      Array.prototype.forEach.call(on, function(c){ try{ c.click(); }catch(e){} });
    }catch(e){}
  }

  /* If they chose a word, it was written into #farewellWord on the way to the
     farewell screen. Carry it onto the thank-you so the payoff survives the
     screen we no longer visit. */
  function carryWord(){
    try{
      var w = document.getElementById("farewellWord");
      var word = w ? (w.textContent || "").trim() : "";
      var host = document.querySelector("#screen-thanks .thanks-stage");
      var slot = document.getElementById("aogThanksWord");
      if (!word || word === "\u2014"){ if (slot) slot.style.display = "none"; return; }
      if (!slot && host){
        slot = document.createElement("div");
        slot.id = "aogThanksWord";
        slot.style.cssText = "font-family:var(--font-serif,Georgia,serif);font-style:italic;"
          + "font-size:26px;line-height:1.3;color:var(--gold-deep);margin:6px 0 2px;";
        var lede = document.getElementById("thanksLede");
        if (lede && lede.parentNode) lede.parentNode.insertBefore(slot, lede);
        else host.appendChild(slot);
      }
      if (slot){ slot.textContent = word; slot.style.display = ""; }
    }catch(e){}
  }

  function wrap(){
    if (typeof window.showScreen !== "function" || window.showScreen.__aogClosingFirst) return;
    var real = window.showScreen;
    var wrapped = function(id){
      /* A new reflection starting: arm the closing step again. */
      if (id === "screen-checkin" || id === "screen-choose" || id === "screen-welcome") stage = STAGE_NONE;

      if (id === "screen-thanks" && stage === STAGE_NONE){
        stage = STAGE_CLOSING;
        freshClosing();
        return real.call(this, "screen-closing");
      }
      /* The closing buttons head for the farewell screen when a word was
         chosen. That screen is no longer part of the flow — for ANY route.
         It was gated on stage === STAGE_CLOSING, which left the farewell
         reachable whenever the stage machine was out of step (a second
         reflection in one page load, a stale cached build, a route that
         skips checkin/choose/welcome). Jimmy, 2026-08-23: "THE THANK YOU
         should be the last thing a student sees." Unconditional now, so the
         guarantee does not depend on knowing every route. */
      if (id === "screen-farewell"){
        stage = STAGE_DONE;
        carryWord();
        return real.call(this, "screen-thanks");
      }
      return real.apply(this, arguments);
    };
    wrapped.__aogClosingFirst = true;
    window.showScreen = wrapped;
  }

  /* "Skip", and "Keep this word" with nothing chosen, both call resetToStart()
     for a school student — which wipes the session and goes home, throwing away
     the results they were about to be shown. From the closing step it must land
     on the thank-you instead. */
  function wrapReset(){
    if (typeof window.resetToStart !== "function" || window.resetToStart.__aogClosingFirst) return;
    var real = window.resetToStart;
    var wrapped = function(){
      if (stage === STAGE_CLOSING){
        stage = STAGE_DONE;
        carryWord();
        if (typeof window.showScreen === "function") window.showScreen("screen-thanks");
        return;
      }
      return real.apply(this, arguments);
    };
    wrapped.__aogClosingFirst = true;
    window.resetToStart = wrapped;
  }

  /* The thank-you is the end of the road now. */
  function hideOneMoreThing(){
    var b = document.getElementById("btnToClosing");
    if (b) b.style.display = "none";
  }

  function boot(){ wrap(); wrapReset(); hideOneMoreThing(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 800);
  setTimeout(boot, 2200);
})();
