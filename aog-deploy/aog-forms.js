/* ══ AOG-FORMS-GLASS-V1 (2026-09-26) — THE STUDENT FORMS, UPGRADED ═══════════
   Jimmy: "Can the inside of the daily check-in, exit slip, practice page,
   This Is Me, adult team check-in get a upgrade — the words or icons and
   everything in between." Every answer is a glass tile with a picture:
   the five-step scales read as weather (storm → sun), each feeling, need and
   class has its own small picture, and a chosen tile lights in its own glass.
   Pictures help a learner who reads slowly find their answer first. Nothing
   moves; every tile is 44px or taller; the words and the answers saved are
   exactly as before (the picture is decoration, aria-hidden). */
(function () {
  "use strict";
  var D = document;
  var STEP = ["", "⛈️", "🌧️", "⛅", "🌤️", "☀️"];
  var GLASS = ["", "#4A5A8C", "#3F4AA6", "#1F8080", "#2E8B57", "#B87A12"];
  var IC = {
    /* feelings */
    "good":"🙂","calm":"😌","focused":"🎯","confident":"💪","hopeful":"🌱","proud":"⭐","happy":"😊","excited":"🎉",
    "wired":"⚡","tired":"😴","worried":"😟","sad":"😢","lonely":"🫂","overwhelmed":"🌊","frustrated":"😤","angry":"😠",
    "embarrassed":"😳","stretched thin":"🪢","happy":"😊","mad":"😠","scared":"😨","silly":"🤪","loved":"💛","bored":"😐","nervous":"😬","safe":"🏡","grumpy":"😒","numb":"😶","i’m not sure":"🤔","i'm not sure":"🤔","i’d rather not say":"🔒","i'd rather not say":"🔒",
    /* needs */
    "i’m okay":"👍","i'm okay":"👍","a quiet minute":"🤫","a break":"☕","to move":"🏃","some space":"🫧","help":"🙋",
    "help getting started":"🚦","more time":"⏳","clearer directions":"🧭","someone to listen":"👂","encouragement":"💬",
    "a second chance":"🔄","nothing right now":"✋",
    /* classes */
    "english / language arts":"📖","math":"➗","science":"🔬","social studies":"🌎","art":"🎨","physical education":"⚽",
    "health":"❤️","spanish":"🗣️","technology":"💻","foods / family & consumer":"🍳","band":"🎺","choir / vocal music":"🎤",
    "advisory":"🧭","other encore / elective":"✨","learning resource":"🧩","study skills":"📚"
  };
  function key(b) { return String(b.getAttribute("data-v") || b.textContent || "").trim().toLowerCase(); }
  function decorate() {
    D.querySelectorAll("#screen-daily-checkin .sc-s:not([data-aogic])").forEach(function (b) {
      var v = +b.getAttribute("data-v") || 3; b.setAttribute("data-aogic", "1");
      b.style.setProperty("--gl", GLASS[v] || GLASS[3]);
      var dot = b.querySelector(".sc-dot");
      if (dot) { dot.innerHTML = '<span class="aogic" aria-hidden="true">' + STEP[v] + "</span>"; }
    });
    D.querySelectorAll("#screen-daily-checkin .sc-chip:not([data-aogic]), #screen-exit-slip .xs-chip:not([data-aogic]), .fdx-chip:not([data-aogic])").forEach(function (b, i) {
      b.setAttribute("data-aogic", "1");
      var ic = IC[key(b)] || IC[String(b.textContent || "").trim().toLowerCase()];
      if (ic) b.insertAdjacentHTML("afterbegin", '<span class="aogic" aria-hidden="true">' + ic + "</span>");
    });
  }
  var css = D.createElement("style"); css.id = "aog-forms-glass";
  var SC = "#screen-daily-checkin, #screen-exit-slip, #screen-staff-checkin, #aogTimOv";
  css.textContent = [
    /* the progress words never cut off */
    "#screen-daily-checkin .sc-beat b{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;font-size:10px!important;letter-spacing:.08em!important}",
    /* the five-step scale: glass tiles with weather */
    "#screen-daily-checkin .sc-s{--gl:#1F8080;min-height:56px!important;border:2px solid #1E1F22!important;border-radius:14px!important;",
    "box-shadow:0 0 0 1px rgba(242,201,100,.45),inset 6px 0 0 var(--gl)!important;background:#FFFDF8!important;color:#15202E!important}",
    "#screen-daily-checkin .sc-s .sc-dot{background:transparent!important;width:34px!important;height:34px!important;display:grid!important;place-items:center!important}",
    ".aogic{font-size:24px;line-height:1;font-family:'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif}",
    "#screen-daily-checkin .sc-s[aria-pressed=true]{background:var(--gl)!important;color:#fff!important;",
    "background-image:radial-gradient(120% 90% at 30% 15%,rgba(255,255,255,.3),rgba(255,255,255,0) 60%)!important}",
    "#screen-daily-checkin .sc-s[aria-pressed=true] .lab{color:#fff!important}",
    /* feelings, needs and classes: tiles with a picture */
    "#screen-daily-checkin .sc-chip, #screen-exit-slip .xs-chip, .fdx-chip{display:inline-flex!important;align-items:center;gap:8px;min-height:48px!important;",
    "border:2px solid #1E1F22!important;border-radius:14px!important;background:#FFFDF8!important;color:#15202E!important;",
    "box-shadow:0 0 0 1px rgba(242,201,100,.45)!important;padding:8px 14px!important;font-weight:600!important}",
    "#screen-daily-checkin .sc-chip .aogic, #screen-exit-slip .xs-chip .aogic{font-size:20px}",
    "#screen-daily-checkin .sc-chip[aria-pressed=true], #screen-exit-slip .xs-chip[aria-pressed=true]{background:#1F5F8B!important;color:#fff!important;",
    "background-image:radial-gradient(120% 90% at 30% 15%,rgba(255,255,255,.3),rgba(255,255,255,0) 60%)!important}",
    /* the adult check-in and This Is Me: the same glass on every choice */
    "#screen-staff-checkin button[aria-pressed], #aogTimOv button[aria-pressed]{min-height:44px;border:2px solid #1E1F22!important;border-radius:14px!important;",
    "box-shadow:0 0 0 1px rgba(242,201,100,.45)!important}",
    "#screen-staff-checkin button[aria-pressed=true], #aogTimOv button[aria-pressed=true]{background:#1F5F8B!important;color:#fff!important}",
    /* the Next / Done button: one clear gold step */
    "#screen-daily-checkin .sc-next:not(:disabled), #screen-exit-slip .xs-next:not(:disabled){background:#C9A24A!important;color:#0A1E33!important;border:2px solid #1E1F22!important}",
    /* dark theme: same glass, dark panes */
    "html[data-theme=dark] #screen-daily-checkin .sc-s:not([aria-pressed=true]), html[data-theme=dark] #screen-daily-checkin .sc-chip:not([aria-pressed=true]),",
    "html[data-theme=dark] #screen-exit-slip .xs-chip:not([aria-pressed=true]){background:#13314F!important;color:#F4EEE2!important}",
    "html[data-theme=dark] #screen-daily-checkin .sc-s:not([aria-pressed=true]) .lab{color:#F4EEE2!important}"
  ].join("");
  function start() {
    D.head.appendChild(css); decorate();
    new MutationObserver(function () { decorate(); }).observe(D.body, { childList: true, subtree: true });
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();
})();
