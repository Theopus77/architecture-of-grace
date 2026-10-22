/* AOG-QUICKSTART-V1 (2026-10-22) — ✦ Start a song, in the Recording Studio (the-studio.html; the key on its top line, made by
   _work/music/make_studio_page.py). Jimmy wants the Studio to be a showstopper for his 13-year-old: open it, tap one key, pick
   a vibe, and within seconds a good beat, chords and a bass are playing, with the Piano's keys lit so every note fits.
   No wrong first step.

   This file is fetched the first time ✦ Start a song is pressed; nothing of it loads before. A vibe is
     {beat (an AOGBeats id), bpm, key (0 = C … 11 = B), minor, pat (a chord pattern of the Drum Machine), chords and bass
      (Drum Machine instruments), style (how the bass plays: kick, eighths, pulse, octave), scale (the Piano's lit scale),
      mix (the chords' and the bass's pad volumes, 100 = as levelled: set by measure so the drums lead)}.
   Picking one:
     1. sets the song's tempo and key (AOGSong), so every room follows;
     2. has the Drum Machine, out of sight (AOGStudioShell.withRoom), make the beat on bank A, the chords on bank B and the
        bass on bank C, four bars, and put the loop on My Track (music-pads.html, AOGPadsSetup.song);
     3. goes to the Piano with the song's scale lit (music-piano.html, AOGPianoScale), and starts ♫ Play along, so the loop
        plays round and round while you play over it;
     4. says one line: "Your beat is playing. Play the lit keys — every one fits."
   The sound wakes inside the tap (an iPhone wants that) and rests again if nothing came of it. Nothing moves on its own;
   the sheet is still paper, the same in light and dark, like the Song sheet. Test: music-handoff/tests/studio/quickstart.js. */
(function () {
  "use strict";
  if (window.AOGQuickstart) return;
  var D = document;
  var VIBES = [
    { id: "trap", name: ["Trap", "Trap"], say: ["Dark, deep 808s, hi-hat rolls.", "Oscuro, 808 profundos, charles en ráfagas."],
      beat: "traprolls", bpm: 140, key: 9, minor: true, pat: "minor", chords: "k:bells", bass: "a:synthbass", style: "kick", scale: "minpent", mix: { chords: 115, bass: 65 } },
    { id: "drill", name: ["Drill", "Drill"], say: ["Dark and tense, sliding hi-hats.", "Oscuro y tenso, charles que se deslizan."],
      beat: "drill", bpm: 142, key: 4, minor: true, pat: "epic", chords: "k:strings", bass: "a:synthbass", style: "kick", scale: "minpent", mix: { chords: 100, bass: 60 } },
    { id: "lofi", name: ["Lo-fi", "Lo-fi"], say: ["Chill and soft. Good for study.", "Tranquilo y suave. Bueno para estudiar."],
      beat: "lofi", bpm: 78, key: 5, minor: false, pat: "lofi", chords: "k:epwarm", bass: "a:upright", style: "kick", scale: "majpent", mix: { chords: 80, bass: 35 } },
    { id: "pop", name: ["Pop", "Pop"], say: ["Bright and happy, with claps.", "Alegre y brillante, con palmas."],
      beat: "clappop", bpm: 108, key: 0, minor: false, pat: "pop", chords: "k:grand", bass: "a:growly", style: "pulse", scale: "majpent", mix: { chords: 100, bass: 70 } },
    { id: "rock", name: ["Rock", "Rock"], say: ["Big drums and guitar chords.", "Batería grande y acordes de guitarra."],
      beat: "rockbasic", bpm: 112, key: 7, minor: false, pat: "anthem", chords: "g:black", bass: "a:growly", style: "eighths", scale: "majpent", mix: { chords: 100, bass: 45 } },
    { id: "house", name: ["House", "House"], say: ["Dance music. A kick on every beat.", "Para bailar. Un bombo en cada pulso."],
      beat: "house", bpm: 124, key: 0, minor: false, pat: "dance", chords: "k:pad", bass: "a:acidbass", style: "octave", scale: "majpent", mix: { chords: 55, bass: 60 } }
  ];
  var W = {
    h: ["Pick a vibe", "Elige un estilo"],
    say: ["Tap one. A beat, chords and a bass start in a few seconds.", "Toca uno. Un ritmo, acordes y un bajo empiezan en unos segundos."],
    close: ["Not now", "Ahora no"],
    making: ["Making your beat…", "Haciendo tu ritmo…"],
    fail: ["That did not work. Try again.", "No funcionó. Inténtalo otra vez."],
    on: ["Your beat is playing. Play the lit keys — every one fits.", "Tu ritmo está sonando. Toca las teclas iluminadas: todas encajan."]
  };
  function es() { return (D.documentElement.getAttribute("lang") || "en").indexOf("es") === 0; }
  function w(k) { return W[k][es() ? 1 : 0]; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  var CSS = [
    "#qsSheet { position:fixed; z-index:45; top:calc(max(0px, env(safe-area-inset-top)) + 58px); left:50%; transform:translateX(-50%); width:min(40rem, calc(100vw - 24px));",
    "  max-height:calc(100dvh - 72px); overflow:auto; overscroll-behavior:contain; box-sizing:border-box; padding:.9rem 1rem 1rem; border-radius:8px;",
    "  background:#f4ecdb; color:#1f1a12; box-shadow:0 14px 36px rgba(0,0,0,.6), 0 0 0 1px #050403; }",
    "#qsSheet[hidden] { display:none; }",
    "#qsSheet .qs-top { display:flex; align-items:flex-start; gap:.75rem; }",
    "#qsSheet .qs-top > div { flex:1 1 auto; min-width:0; }",
    "#qsH { margin:0; font:600 1.3rem/1.2 \"Fraunces\", Georgia, serif !important; letter-spacing:0 !important; color:#1f1a12 !important; }",
    "#qsSay { margin:.25rem 0 0; font:500 1rem/1.35 Inter, system-ui, sans-serif; color:#3b3224 !important; }",
    "#qsClose { flex:0 0 auto; min-height:44px; min-width:44px; padding:0 .9rem; border-radius:9px; border:1px solid #b9a988; background:#fffaf0; color:#1f1a12;",
    "  font:800 .95rem/1 Inter, system-ui, sans-serif; cursor:pointer; touch-action:manipulation; }",
    "#qsList { list-style:none; margin:.8rem 0 0; padding:0; display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:8px; }",
    "#qsList li { display:flex; min-width:0; }",
    "#qsList button { flex:1 1 auto; min-width:0; min-height:76px; display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:.2rem;",
    "  padding:.55rem .75rem; border-radius:10px; border:1.5px solid #2a251f; background:#2a251f; color:#f4ead6; text-align:left; cursor:pointer;",
    "  touch-action:manipulation; -webkit-tap-highlight-color:transparent; box-shadow:0 2px 0 #050403; }",
    "#qsList button b { font:800 1.15rem/1.1 Inter, system-ui, sans-serif; color:#f3d48e; }",
    "#qsList button span { font:500 .92rem/1.25 Inter, system-ui, sans-serif; color:#f4ead6; overflow-wrap:anywhere; }",
    "#qsList button:active { transform:translateY(1px); box-shadow:0 1px 0 #050403; }",
    "#qsList button[aria-pressed=\"true\"] { background:#fbf1d8; border-color:#7a5a1c; box-shadow:0 0 0 2px #e2b55c; }",
    "#qsList button[aria-pressed=\"true\"] b, #qsList button[aria-pressed=\"true\"] span { color:#1d1608; }",
    "#qsList button:disabled { cursor:default; }",
    "#qsSheet button:focus-visible { outline:3px solid #b9822a; outline-offset:2px; }",
    "#qsLine { margin:.7rem 0 0; font:700 1rem/1.3 Inter, system-ui, sans-serif; color:#1f1a12; }",
    "#qsLine:empty { display:none; }",
    /* AOG-MISSIONS-V1: Missions · 3 of 12, the sheet's last line */
    "#qsMs { display:block; width:100%; margin:.75rem 0 0; min-height:44px; padding:.3rem .9rem; border-radius:9px; border:1.5px solid #b98f3e; background:#fffaf0; color:#1f1a12;",
    "  font:800 .95rem/1.2 Inter, system-ui, sans-serif; text-align:center; cursor:pointer; touch-action:manipulation; -webkit-tap-highlight-color:transparent; }",
    "@media (min-width:700px) { #qsSheet { top:66px; } #qsList { grid-template-columns:repeat(3, minmax(0,1fr)); } }",
    "@media (orientation:landscape) and (max-height:500px) { #qsSheet { top:8px; max-height:calc(100dvh - 16px); } #qsList { grid-template-columns:repeat(3, minmax(0,1fr)); } #qsList button { min-height:60px; } }"
  ].join("\n");
  var box = null, busy = false, picked = "", line = "";
  function shell() { return window.AOGStudioShell || null; }
  function build() {
    if (box) return box;
    var st = D.createElement("style"); st.id = "qsCss"; st.textContent = CSS; D.head.appendChild(st);
    box = D.createElement("div"); box.id = "qsSheet"; box.hidden = true;
    box.setAttribute("role", "dialog"); box.setAttribute("aria-labelledby", "qsH");
    D.body.appendChild(box);
    box.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("button"); if (!b) return;
      if (b.id === "qsClose") { close(); return; }
      if (b.id === "qsMs") { var S0 = shell(); close(true); if (S0 && S0.missions) S0.missions.open("m"); return; }   /* AOG-MISSIONS-V1 */
      var v = VIBES.filter(function (x) { return x.id === b.getAttribute("data-vibe"); })[0]; if (v) choose(v);
    });
    box.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.stopPropagation(); close(); } });
    /* a tap outside the sheet puts it away (the work goes on; the line above the desk says how it is going) */
    D.addEventListener("pointerdown", function (e) { if (box.hidden) return; var t = e.target;
      if (t && t.closest && (t.closest("#qsSheet") || t.closest("#qsOpen"))) return; close(true); }, true);
    window.addEventListener("blur", function () { setTimeout(function () { var a = D.activeElement; if (!box.hidden && a && a.tagName === "IFRAME") close(true); }, 0); });
    try { new MutationObserver(function () { if (!box.hidden) paint(); }).observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
    return box;
  }
  function paint() {
    var e = es() ? 1 : 0;
    box.innerHTML = '<div class="qs-top"><div><h2 id="qsH">' + esc(w("h")) + '</h2><p id="qsSay">' + esc(w("say")) + '</p></div>' +
      '<button type="button" id="qsClose">' + esc(w("close")) + "</button></div>" +
      '<ul id="qsList">' + VIBES.map(function (v) {
        return '<li><button type="button" data-vibe="' + v.id + '" aria-pressed="' + (picked === v.id ? "true" : "false") + '"' + (busy ? " disabled" : "") + ">" +
          "<b>" + esc(v.name[e]) + "</b><span>" + esc(v.say[e]) + "</span></button></li>"; }).join("") + "</ul>" +
      '<p id="qsLine" role="status" aria-live="polite">' + (line ? esc(w(line)) : "") + "</p>" + msKey();
  }
  /* AOG-MISSIONS-V1: the missions, one tap from here (the Studio counts them; aog-missions.js opens on the tap) */
  function msKey() {
    var S = shell(), c = S && S.missions && S.missions.count ? S.missions.count() : null; if (!c) return "";
    return '<button type="button" id="qsMs" aria-haspopup="dialog">' + esc(es() ? "Misiones · " + c.n + " de " + c.t : "Missions · " + c.n + " of " + c.t) + "</button>";
  }
  function open() {
    if (!busy && line !== "fail") line = "";
    build(); paint(); box.hidden = false;
    var k = D.getElementById("qsOpen"); if (k) k.setAttribute("aria-expanded", "true");
    var f = box.querySelector('#qsList button[aria-pressed="true"]') || box.querySelector("#qsList button"); if (f) try { f.focus({ preventScroll: true }); } catch (e) {}
  }
  function close(quiet) {
    if (!box || box.hidden) return;
    box.hidden = true;
    if (busy && line) { var S = shell(); if (S && S.line) S.line(W[line][0], W[line][1]); }   /* still working: the line above the desk says so */
    var k = D.getElementById("qsOpen"); if (k) { k.setAttribute("aria-expanded", "false"); if (!quiet) try { k.focus({ preventScroll: true }); } catch (e) {} }
  }
  /* one line at a time: in the sheet while it is open, else just above the desk */
  function say(k) { line = k; if (box && !box.hidden) { paint(); return; } var S = shell(); if (S && S.line && k) S.line(W[k][0], W[k][1]); }
  function frames(file) { return [].slice.call(D.querySelectorAll('iframe.sh-room[data-file="/' + file + '"]')); }
  /* the Piano's lit scale: kept on this device for a Piano not open yet, and set at once in one that is */
  function pianoScale(v) {
    var K = "aog.piano.scales.v1";
    try { var o = JSON.parse(localStorage.getItem(K) || "null") || {}; o[v.minor ? "min" : "maj"] = v.scale; localStorage.setItem(K, JSON.stringify(o)); } catch (e) {}
    var done = false;
    frames("music-piano.html").forEach(function (f) { try { var P = f.contentWindow && f.contentWindow.AOGPianoScale; if (P && P.set({ minor: v.minor, id: v.scale })) done = true; } catch (e) {} });
    return done;
  }
  function pianoScaleSoon(v) {   /* a Piano just opened gets its scale once its page is ready (a few tries, then it rests) */
    var n = 0; (function again() { if (pianoScale(v) || ++n > 40) return; setTimeout(again, 250); })();
  }
  function waitAlong() {
    return new Promise(function (ok, no) {
      var t0 = Date.now(), seen = false;
      (function again() {
        var S = shell(), a = S && S.along ? S.along() : null;
        if (a && a.on) { ok(); return; }
        if (a && a.busy) seen = true;
        if ((seen && a && !a.busy) || Date.now() - t0 > 45000) { no(new Error("not playing")); return; }
        setTimeout(again, 200);
      })();
    });
  }
  function choose(v) {
    var S = shell(); if (busy || !S) return;
    busy = true; picked = v.id;
    S.wake(true);   /* inside the tap: the sound may start later, when the beat is ready */
    try { if (S.along().on) S.alongToggle(); } catch (e) {}   /* one song at a time */
    say("making");
    if (window.AOGSong) AOGSong.set({ bpm: v.bpm, key: v.key, minor: v.minor });
    pianoScale(v);
    S.withRoom("pads", function (pw) { return pw.AOGPadsSetup.song(v); }, function (pw) { return pw.AOGPadsSetup && pw.AOGPadsSetup.ready(); })
      .then(function () {
        line = ""; close(true);   /* the loop is on My Track: off to the Piano, where ♫ Play along says what it is doing */
        S.go("piano"); pianoScaleSoon(v);
        S.alongToggle();
        return waitAlong();
      })
      .then(function () {
        busy = false; pianoScale(v); say("on");
        try { window.dispatchEvent(new CustomEvent("aog-studio-did", { detail: { what: "started" } })); } catch (e) {}   /* AOG-MISSIONS-V1 */
      }, function () {
        busy = false; S.wake(false); line = "fail"; open();
      });
  }
  /* the key on the top line: opens the sheet, or puts it away when it is open */
  function press() { if (box && !box.hidden) close(); else open(); }
  window.AOGQuickstart = { press: press, open: open, close: close, VIBES: VIBES, busy: function () { return busy; } };
})();
