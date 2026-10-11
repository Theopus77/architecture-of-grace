
/* ============================================================================
   THE DASHBOARD SOFT GATE — added 2026-08-25 after a live proof.

   Until now `openAdmin()` was four lines with no check of any kind, and every
   route into the adult view went through it or straight to
   showScreen("screen-admin"). From a student's own classroom link, typing
   #results reached the per-student list: 31 classmate codes, their bands, any
   individual report INCLUDING the adult pattern-read, and the export controls.
   ?start=dashboard did the same. The data is device-local, so on a true 1:1
   Chromebook that is one child's own record — but on a shared cart it is
   everyone who used that browser profile, and on a teacher's laptop after a
   Pull it is the whole class.

   ⚠ WHAT THIS IS AND IS NOT.
   It is a soft gate: it stops a student who types #results, wanders in from a
   link, or picks up an unlocked laptop. It is NOT authentication and does not
   pretend to be — the data still sits in this browser's localStorage, and
   anyone with devtools can read it whatever this screen says. Do not describe
   it to a school as encryption or as access control.

   Design choices worth keeping:
   · It intercepts showScreen("screen-admin"), NOT openAdmin — two call sites
     reach the screen directly, and every future one will too.
   · The dashboard is never rendered behind the prompt. A refused visitor stays
     on the screen they were already on, so nothing is painted and nothing is
     sitting under an overlay waiting to be inspected.
   · The code is stored as a salted SHA-256, never in the clear.
   · "Forgot your code" clears this device's data rather than granting entry.
     Any recovery path a teacher can use, a student can use — so the recovery
     path has to destroy rather than reveal. The school's Sheet still has the
     synced copy; that is what makes this safe.
   · Day one is not blocked. A teacher who has never set a code is offered one
     and can skip; skipping leaves a standing "not locked" chip rather than
     silently pretending everything is fine.
============================================================================ */
(function () {
  var LOCK = "aog.dash.lock.v1";
  var SKIP = "aog.dash.lock.skip";
  var OPEN = "aog.dash.unlock";        /* sessionStorage — timestamp */
  var IDLE_MS = 30 * 60 * 1000;
  var tries = 0;
  /* AOG-NOLOCK-V1 (2026-09-26) — Jimmy: "I don't like the password to the dashboard. Eliminate for all things right now." No code is asked for anywhere; a code set earlier is cleared. */
  try { localStorage.removeItem(LOCK); localStorage.removeItem(SKIP); } catch (e) {}
  return;

  function T(en, es) { try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; } }
  function esc(x) { return String(x == null ? "" : x).replace(/[&<>"]/g, function (c) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function lget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lset(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  function lockRec() { try { return JSON.parse(lget(LOCK) || "") || null; } catch (e) { return null; } }
  function hasLock() { var r = lockRec(); return !!(r && r.hash); }

  /* The set-a-code offer used to be the very FIRST thing a new teacher saw —
     a security decision demanded before the product had shown any value
     (audit 2026-08-30). The offer now waits for the first open on which this
     device actually holds something worth protecting; until then the standing
     "not locked" chip carries it. A device that skipped is unchanged, and a
     device with a code is unchanged — this only moves the day-one modal.
     ⚠ Fails CLOSED on unreadable JSON: unreadable is not the same as empty,
     so a store that cannot be parsed still counts as data and still prompts. */
  var DATA_KEYS = ["aogScreener.v2.results", "aog.iep.v1",
                   "aog.checkin.student.v1", "aog.exit.v1", "aog.daily.v1",
                   "aog.home.checkin.v1", "aog.evclass.v1", "aog.thisisme.v1",
                   "aog.iepmeet.v1", "aog.iepteam.v1"];
  function hasData() {
    for (var i = 0; i < DATA_KEYS.length; i++) {
      var raw = lget(DATA_KEYS[i]);
      if (!raw) continue;
      try {
        var o = JSON.parse(raw);
        if (!o) continue;
        if (Object.prototype.toString.call(o) === "[object Array]") {
          if (o.length) return true;
        } else if (o.logs) {
          if (Object.keys(o.logs).length) return true;
        } else if (Object.keys(o).length) return true;
      } catch (e) { return true; }
    }
    return false;
  }
  function unlockedNow() {
    var t = parseInt(sget(OPEN) || "0", 10);
    return !!t && (Date.now() - t) < IDLE_MS;
  }
  function markUnlocked() { sset(OPEN, String(Date.now())); }

  /* SHA-256 where the browser offers it. On file:// and other insecure
     contexts crypto.subtle is absent, so a documented fallback keeps the gate
     working for local testing — it is obfuscation, not a hash, and it is
     labeled as such in the stored record so it can never be mistaken later. */
  async function digest(salt, code) {
    var msg = salt + "" + code;
    try {
      if (window.crypto && window.crypto.subtle && window.isSecureContext) {
        var buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg));
        return { alg: "sha256", v: Array.from(new Uint8Array(buf)).map(function (b) {
          return b.toString(16).padStart(2, "0"); }).join("") };
      }
    } catch (e) {}
    var h = 5381;
    for (var i = 0; i < msg.length; i++) { h = ((h << 5) + h + msg.charCodeAt(i)) | 0; }
    return { alg: "weak-fallback-insecure-context", v: String(h >>> 0) };
  }
  function newSalt() {
    try {
      var a = new Uint8Array(16); window.crypto.getRandomValues(a);
      return Array.from(a).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    } catch (e) { return String(Date.now()) + ":fallback"; }
  }

  function injectCss() {
    if (document.getElementById("aogDashLockCss")) return;
    var st = document.createElement("style");
    st.id = "aogDashLockCss";
    st.textContent = [
      "#aogDashLock{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;",
      "padding:24px;background:var(--navy,#0A1E33);}",
      "#aogDashLock .dl-card{width:100%;max-width:430px;background:var(--card,#fff);border-radius:16px;",
      "padding:28px 30px;box-shadow:0 24px 60px rgba(0,0,0,.4);}",
      "#aogDashLock .dl-k{font-size:11px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;",
      "color:var(--gold-deep,#9a6f24);margin:0 0 8px;}",
      "#aogDashLock h2{font-family:var(--font-serif,Georgia,serif);font-size:23px;line-height:1.25;",
      "color:var(--navy,#0A1E33);margin:0 0 10px;font-weight:600;}",
      "#aogDashLock p{font-size:14px;line-height:1.6;color:var(--ink-soft,#5b6675);margin:0 0 16px;}",
      "#aogDashLock input{width:100%;font:inherit;font-size:20px;letter-spacing:.22em;text-align:center;",
      "padding:13px 14px;border:1px solid var(--rule,#E4DAC5);border-radius:11px;background:var(--cream,#FBF8F1);",
      "color:var(--navy,#0A1E33);margin:0 0 14px;}",
      "#aogDashLock .dl-row{display:flex;gap:10px;flex-wrap:wrap;}",
      "#aogDashLock button{font:inherit;font-size:14px;font-weight:700;border-radius:999px;padding:11px 20px;cursor:pointer;border:0;}",
      "#aogDashLock .dl-go{color:#fff;background:var(--navy,#0A1E33);}",
      "#aogDashLock .dl-ghost{color:var(--navy,#0A1E33);background:transparent;border:1px solid var(--rule,#E4DAC5);}",
      "#aogDashLock .dl-msg{font-size:13px;font-weight:700;color:var(--red,#8B2A2A);min-height:18px;margin:10px 0 0;}",
      "#aogDashLock .dl-fine{font-size:12px;line-height:1.6;color:var(--ink-faint,#8A92A6);margin:16px 0 0;",
      "padding-top:13px;border-top:1px solid var(--rule-soft,#EFE8DA);}",
      "#aogDashLock .dl-link{background:none;border:0;padding:0;font-size:12px;font-weight:700;",
      "color:var(--ink-faint,#8A92A6);text-decoration:underline;cursor:pointer;}",
      "#aogDashNotLocked{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;",
      "color:var(--gold-deep,#9a6f24);background:rgba(217,163,59,.14);border-radius:999px;padding:6px 13px;margin:0 0 12px;}",
      "#aogDashNotLocked button{background:none;border:0;padding:0;font:inherit;text-decoration:underline;cursor:pointer;color:inherit;}",
      "@media (max-width:480px){#aogDashLock .dl-card{padding:22px 20px;}}"
    ].join("");
    document.head.appendChild(st);
  }

  function close_() { var n = document.getElementById("aogDashLock"); if (n && n.parentNode) n.parentNode.removeChild(n); }

  /* onPass is called only when the visitor should be let through. */
  function prompt_(mode, onPass) {
    injectCss();
    close_();
    var setting = (mode === "set");
    var wrap = document.createElement("div");
    wrap.id = "aogDashLock";
    wrap.innerHTML =
      '<div class="dl-card" role="dialog" aria-modal="true" aria-labelledby="aogDashLockH">' +
        '<p class="dl-k">' + esc(T("Educator Dashboard", "Panel del Educador")) + "</p>" +
        '<h2 id="aogDashLockH">' + esc(setting
          ? T("Protect this dashboard", "Protege este panel")
          : T("Enter your dashboard code", "Escribe tu código del panel")) + "</h2>" +
        "<p>" + esc(setting
          ? T("Pick a 4–6 digit code for this computer. It is stored on this device only — nothing is sent anywhere, and there is no account. It keeps a student who wanders in from opening the adult view.",
              "Elige un código de 4 a 6 dígitos para esta computadora. Se guarda solo en este dispositivo — no se envía nada y no hay cuenta. Evita que un estudiante entre a la vista de adulto.")
          : T("This computer is locked. Enter the code you set.",
              "Esta computadora está bloqueada. Escribe el código que elegiste.")) + "</p>" +
        '<input id="aogDashLockIn" type="password" inputmode="numeric" autocomplete="off" maxlength="6" ' +
          'aria-label="' + esc(T("Dashboard code", "Código del panel")) + '">' +
        '<div class="dl-row">' +
          '<button type="button" class="dl-go" id="aogDashLockGo">' +
            esc(setting ? T("Set the code", "Guardar el código") : T("Unlock", "Desbloquear")) + "</button>" +
          '<button type="button" class="dl-ghost" id="aogDashLockOut">' +
            esc(setting ? T("Skip for now", "Ahora no") : T("Back", "Volver")) + "</button>" +
        "</div>" +
        '<p class="dl-msg" id="aogDashLockMsg"></p>' +
        (setting ? "" :
          '<p class="dl-fine">' + esc(T("Forgotten it? ", "¿Lo olvidaste? ")) +
            '<button type="button" class="dl-link" id="aogDashLockForgot">' +
              esc(T("Clear this device and start again", "Borra este dispositivo y empieza de nuevo")) + "</button>" +
            " — " + esc(T("there is no way to read the code back, so the only way in is to clear what is stored here. That clears everything on this computer, including IEP goals, progress data and daily check-ins, which are stored only here and are never synced. A backup file downloads first.",
                          "no hay forma de recuperar el código, así que la única entrada es borrar lo que está aquí. Eso borra todo lo de esta computadora, incluidas las metas del IEP, los datos de progreso y los registros diarios, que se guardan solo aquí y nunca se sincronizan. Primero se descarga un archivo de respaldo.")) +
          "</p>") +
      "</div>";
    document.body.appendChild(wrap);

    var input = document.getElementById("aogDashLockIn");
    var msg = document.getElementById("aogDashLockMsg");
    try { input.focus(); } catch (e) {}

    function fail(t) { if (msg) msg.textContent = t; try { input.value = ""; input.focus(); } catch (e) {} }

    document.getElementById("aogDashLockGo").addEventListener("click", async function () {
      var code = String(input.value || "").trim();
      if (setting) {
        if (!/^\d{4,6}$/.test(code)) return fail(T("Four to six digits.", "De cuatro a seis dígitos."));
        var salt = newSalt();
        var d = await digest(salt, code);
        lset(LOCK, JSON.stringify({ v: 1, salt: salt, alg: d.alg, hash: d.v }));
        try { localStorage.removeItem(SKIP); } catch (e) {}
        markUnlocked();
        close_(); onPass();
        return;
      }
      var rec = lockRec();
      if (!rec) { close_(); onPass(); return; }
      var got = await digest(rec.salt, code);
      if (got.v === rec.hash) { tries = 0; markUnlocked(); close_(); onPass(); return; }
      tries++;
      /* No lockout — a teacher fat-fingering their own code at 8:00 AM must not
         be shut out. A growing pause makes guessing tedious without that. */
      if (tries >= 5) {
        var wait = Math.min(8, tries - 4);
        fail(T("That code is not right. Try again in " + wait + "s.",
               "Ese código no es correcto. Inténtalo en " + wait + " s."));
        var go = document.getElementById("aogDashLockGo");
        if (go) { go.disabled = true; setTimeout(function () { try { go.disabled = false; } catch (e) {} }, wait * 1000); }
      } else fail(T("That code is not right.", "Ese código no es correcto."));
    });

    document.getElementById("aogDashLockOut").addEventListener("click", function () {
      if (setting) { lset(SKIP, "1"); close_(); onPass(); }
      else { close_(); }          /* refused: stay where you were, render nothing */
    });

    var forgot = document.getElementById("aogDashLockForgot");
    if (forgot) forgot.addEventListener("click", function () {
      close_();
      /* The backup goes to disk BEFORE the confirm, not after it. A teacher who
         has just been locked out is not in a state to notice a suggestion, and
         this is the one path where the cost of missing it is a caseload of IEP
         progress data. The file is written locally and sent nowhere. */
      try { if (typeof window.privacyExportJSON === "function") window.privacyExportJSON(); } catch (e) {}
      try { if (typeof window.privacyDeleteAll === "function") window.privacyDeleteAll(); } catch (e) {}
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); document.getElementById("aogDashLockGo").click(); }
    });
  }

  /* The standing reminder on an unlocked device. Not a nag screen — one chip. */
  function paintChip() {
    var host = document.getElementById("screen-admin");
    if (!host) return;
    var have = document.getElementById("aogDashNotLocked");
    if (hasLock()) { if (have && have.parentNode) have.parentNode.removeChild(have); return; }
    if (have) return;
    injectCss();   /* .30ed — the chip used to arrive unstyled when no prompt had opened first */
    var chip = document.createElement("div");
    chip.id = "aogDashNotLocked";
    chip.innerHTML = "&#9679; " + esc(T("This computer is not locked.", "Esta computadora no está bloqueada.")) +
      ' <button type="button" id="aogDashLockNow">' + esc(T("Set a code", "Poner un código")) + "</button>";
    host.insertBefore(chip, host.firstChild);
    var b = document.getElementById("aogDashLockNow");
    if (b) b.addEventListener("click", function () { prompt_("set", function () { paintChip(); }); });
  }

  /* ⚠ Wrap showScreen, not openAdmin: two call sites reach screen-admin
     directly today and nothing stops a third being added. */
  function wrap() {
    if (typeof window.showScreen !== "function" || window.showScreen.__aogLock) return;
    var orig = window.showScreen;
    var wrapped = function (name) {
      if (name === "screen-admin" && !unlockedNow()) {
        if (hasLock()) { prompt_("enter", function () { orig.call(window, name); setTimeout(paintChip, 60); }); return; }
        /* No skip recorded AND something on this device to protect: offer the
           code. An empty device walks straight in and keeps the chip. */
        if (!lget(SKIP) && hasData()) { prompt_("set", function () { orig.call(window, name); setTimeout(paintChip, 60); }); return; }
        markUnlocked();
      }
      var r = orig.apply(this, arguments);
      if (name === "screen-admin") setTimeout(paintChip, 60);
      return r;
    };
    wrapped.__aogLock = true;
    window.showScreen = wrapped;
  }

  /* ⚠ THE BOOT-ORDER TRAP, which caught this once already.
     ?start=dashboard is handled by a listener registered EARLIER in the
     document than this one, so it calls showScreen before the wrapper exists
     and walks straight past the gate. Wrapping is therefore not enough: once
     wrapped, we look at where the page actually ended up and gate it
     retro-actively. Any future route that reaches screen-admin during boot is
     caught by this too, which is the point — do not remove it on the grounds
     that the wrapper "should" be sufficient. */
  function guardExisting() {
    var a = document.getElementById("screen-admin");
    if (!a) return;
    var showing = getComputedStyle(a).display !== "none";
    if (!showing || unlockedNow()) return;
    if (!hasLock() && (lget(SKIP) || !hasData())) { markUnlocked(); return; }
    var orig = window.showScreen && window.showScreen.__aogLock
      ? null : null;   /* we always re-enter through the wrapper below */
    /* Step off the dashboard first, so nothing is left painted underneath. */
    try { if (typeof window.showScreen === "function") window.showScreen("screen-welcome"); } catch (e) {}
    prompt_(hasLock() ? "enter" : "set", function () {
      try { window.showScreen("screen-admin"); } catch (e) {}
      setTimeout(paintChip, 60);
    });
  }

  function go() { try { wrap(); guardExisting(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
  setTimeout(go, 700); setTimeout(go, 2200);

  window.AOGDashLock = { has: hasLock, prompt: prompt_, unlocked: unlockedNow };
})();
