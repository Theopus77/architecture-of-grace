
/* ============================================================================
   THIS IS ME GETS A LINK BUILDER  ·  .30ds, 2026-09-02

   Jimmy, looking at the My Voice card at the bottom of the IEP panel:

     "How can I send the link to anyone and get their results from this and
      whatever is connected to the script, and that they have the option to
      just do it and keep it on their device?"

   The second half was already true and had been since .29be: the page lives
   in aog.thisisme.v1 on the device that built it, private lines never leave,
   and (since .30hf) a FINISHED page sends its kept lines itself — Send
   remains a button on top. That half needed nothing then.

   ⚠⚠ THE FIRST HALF WAS THE SAME FAULT [[aog-practice-links]] FIXED FOR THE
   THIRTY ACTIVITY PAGES, IN A SIXTH PLACE. The receiving half shipped in
   .30bv — aogSendTimRow posts to DailyCheckins with checkinType "thisisme",
   queues offline, and comes home through the same Pull the teacher rows ride.
   But the only builder of a This Is Me link was the "Copy link for their
   device" button on the IEP card, and it built:

       origin + pathname + "?thisisme=1&sid=CODE"

   with no dest= on it. A hand-built link carries no school, so a page a
   student sent from their own Chromebook posted to whatever Sheet the site
   config publishes — not the teacher's. Same shape, same silence, same cost.

   This is the sending half. It is NOT a new destination system: it calls
   aogDestParam_() and aogOrgId_(), the same two functions the classroom link,
   the check-in, the exit slip, the home links and the practice link use.

   ⚠ IT ALSO BUILDS A LINK THAT NAMES NOBODY. A per-student link (sid=CODE)
   opens the builder straight onto that child. A link with no sid opens the
   WHO step (AOG-TIM-WHO-V1, added in the same build) and the student types
   their own short code — which is what makes "send it to anyone" a true
   sentence rather than thirty separate links. A code in a link has always
   been a WRITE credential and never a read one, and the sid-less link is the
   stronger form of that rule: it hands out no codes at all.
============================================================================ */
(function () {
  "use strict";
  function T(en, es) { try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; } }
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  var SEL = "aog.tim.link.sid";
  function savedSid() {
    try { return String(localStorage.getItem(SEL) || "").trim().toUpperCase(); } catch (e) { return ""; }
  }

  /* ── the link ───────────────────────────────────────────────────────────
     .30el — THIS IS ME GOT ITS SHORT PATH, AND ITS OWN CARD. Until this
     build the builder opened the APP ITSELF with ?thisisme=1, so a texted
     link wore index.html's generic card — the exact fault .29ak fixed for
     the other six instruments. Jimmy, with that card on his screen: "It
     needs to change to match the THIS IS MY VOICE." The four edits .29ak's
     comment prescribes are all in: AOG_SHARE_PATHS.thisisme, a /myvoice
     rule in _redirects, link/thisisme.html carrying My Voice's own og tags,
     and og-myvoice.png. The door forwards to the app with the whole query
     string intact and defaults thisisme=1 for a bare typed /myvoice, so
     nothing about what OPENS changed — the did-you-say-this chips are still
     read from the store on the device that opens the link. Only the picture
     on the link changed. Off a web server (file://, the test harness)
     aogShareBase_ returns "" and the fallback below still builds the page's
     own path, so the link still works. */
  function base() {
    try {
      if (typeof window.aogShareBase_ === "function") {
        var b = window.aogShareBase_("thisisme");
        if (b) return b;
      }
      if (location.protocol !== "http:" && location.protocol !== "https:") return "";
      return location.origin + location.pathname;
    } catch (e) { return ""; }
  }
  function destParam() {
    try { return (typeof window.aogDestParam_ === "function") ? (window.aogDestParam_() || "") : ""; }
    catch (e) { return ""; }
  }
  function orgId() {
    try { return (typeof window.aogOrgId_ === "function") ? String(window.aogOrgId_() || "") : ""; }
    catch (e) { return ""; }
  }
  function savedUrl() { try { return String(localStorage.getItem("aog.sync.url") || "").trim(); } catch (e) { return ""; } }
  function savedWriteKey() {
    try { return (typeof window.aogOwnWriteKey_ === "function") ? String(window.aogOwnWriteKey_() || "") : ""; }
    catch (e) { return ""; }
  }

  /* AOG-TIM-LINK-V1 · the one builder. The IEP card's own Copy button calls
     this too, so there is exactly one answer to "what is on a This Is Me
     link" and it cannot drift between two places. */
  function buildLink(code) {
    var b = base();
    if (!b) return "";
    var q = ["thisisme=1"];
    var c = String(code == null ? "" : code).trim().toUpperCase();
    if (c) q.push("sid=" + encodeURIComponent(c));
    var d = destParam(), o = orgId();
    if (d) q.push("dest=" + encodeURIComponent(d));
    if (o) q.push("org=" + encodeURIComponent(o));
    return b + "?" + q.join("&");
  }

  /* ── the sentence that makes it honest ────────────────────────────────
     Three states, never silence — the same three [[aog-practice-links]]
     named, worded for what actually travels here: not a score, a page. */
  function destState() {
    if (destParam()) return "ok";
    if (savedUrl() && !savedWriteKey()) return "nokey";
    return "none";
  }
  function destLine() {
    var s = destState();
    if (s === "ok") {
      return { c: "var(--green,#2E6B3A)", t: T(
        "✓ This link carries your Sheet. A student can open it on any device — a Chromebook, a phone at home, an account that is not yours — and when they finish their page, the lines they kept post to the Sheet you connected here — Send stays as a button too. If they never tap Send, nothing leaves their device and the page is still theirs to print or read aloud.",
        "✓ Este enlace lleva tu Hoja. Un estudiante puede abrirlo en cualquier dispositivo — un Chromebook, un teléfono en casa, una cuenta que no es tuya — y cuando termina su página, las líneas que conservó llegan a la Hoja que conectaste aquí — Enviar sigue existiendo como botón. Las líneas privadas nunca salen, y la página sigue siendo suya para imprimir o leer en voz alta.") };
    }
    if (s === "nokey") {
      return { c: "var(--amber,#8A6D1F)", t: T(
        "⚠ You have connected a Sheet but not entered a Write key, and a link cannot carry a destination without one. A page sent from this link would go to whatever Sheet this site publishes — not necessarily yours. Add the Write key in Connect & sync, then build the link again. (The Passcode is the READ key and is not the same field.)",
        "⚠ Conectaste una Hoja pero no ingresaste una Clave de escritura, y sin ella un enlace no puede llevar un destino. Una página enviada desde este enlace iría a la Hoja que publique este sitio — no necesariamente la tuya. Agrega la Clave de escritura en Conectar y sincronizar y vuelve a crear el enlace. (El Código de acceso es la clave de LECTURA y no es el mismo campo.)") };
    }
    return { c: "var(--amber,#8A6D1F)", t: T(
      "⚠ This link carries no Sheet of its own, so a page sent from it lands in whatever Sheet this site publishes — not necessarily yours. Connect your Sheet and your Write key in Connect & sync, then build the link again. (A student can still build and print their page — only the Send button needs this.)",
      "⚠ Este enlace no lleva ninguna Hoja propia, así que una página enviada desde él llega a la Hoja que publique este sitio — no necesariamente la tuya. Conecta tu Hoja y tu Clave de escritura en Conectar y sincronizar y vuelve a crear el enlace. (El estudiante igual puede construir e imprimir su página — solo el botón Enviar necesita esto.)") };
  }

  function whoLine(code) {
    return code
      ? T("This link opens straight onto " + code + "'s page. Give it only to that student.",
          "Este enlace abre directamente la página de " + code + ". Dáselo solo a ese estudiante.")
      : T("This link names nobody. Whoever opens it types their own short code first, so one link works for a whole class — and you are not handing anyone else's code out.",
          "Este enlace no nombra a nadie. Quien lo abra escribe primero su propio código corto, así que un enlace sirve para toda la clase — y no estás repartiendo el código de nadie más.");
  }

  function cardHtml() {
    var code = savedSid(), d = destLine();
    return '<p class="small">' + esc(T(
        "This Is Me is the student's own page for their own IEP meeting — every line written, chosen or approved by them, one line at a time. Hand out the link this builds. Leave the code box EMPTY for one link a whole class can use.",
        "Este soy yo es la página propia del estudiante para su propia reunión de IEP — cada línea escrita, elegida o aprobada por él, una línea a la vez. Reparte el enlace que se crea aquí. Deja la casilla del código VACÍA para un enlace que sirva a toda la clase.")) + "</p>" +
      '<div class="welcome-fields" style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin:14px 0 6px;">' +
        '<div class="field"><label for="timLgSid">' + esc(T("One student's code (optional)", "Código de un estudiante (opcional)")) + "</label>" +
          '<input type="text" id="timLgSid" autocomplete="off" spellcheck="false" placeholder="' + esc(T("leave empty for the whole class", "déjalo vacío para toda la clase")) + '" value="' + esc(code) + '"></div>' +
        '<div class="field"><label for="timLgUrl">' + esc(T("Shareable link", "Enlace para compartir")) + "</label>" +
          '<input type="text" id="timLgUrl" readonly value="' + esc(buildLink(code)) + '"></div>' +
      "</div>" +
      '<div class="rm-row" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:8px 0 0;">' +
        '<button type="button" class="btn btn-secondary btn-sm" id="timLgCopy">' + esc(T("Copy link", "Copiar enlace")) + "</button>" +
        '<button type="button" class="btn btn-secondary btn-sm" id="timLgOpen">' + esc(T("Open it", "Abrirlo")) + "</button>" +
        '<span class="small" id="timLgSaid" aria-live="polite" style="font-weight:700;"></span>' +
      "</div>" +
      '<p class="small" id="timLgWho" style="margin:12px 0 0;line-height:1.6;color:var(--ink-soft,#5b6675);">' + esc(whoLine(code)) + "</p>" +
      '<p class="small" id="timLgDest" style="margin:8px 0 0;font-weight:700;line-height:1.6;color:' + d.c + ';">' + esc(d.t) + "</p>" +
      '<p class="small" style="margin:8px 0 0;color:var(--ink-faint,#8A92A6);line-height:1.6;">' + esc(T(
        "Pages that come back arrive on the DailyCheckins tab of your Sheet and land on the My Voice card in IEP progress — press Check for pages there. Only the lines the student KEPT ever travel: a line they marked private, and every line they took off the page, never leave their device.",
        "Las páginas que regresan llegan a la pestaña DailyCheckins de tu Hoja y aparecen en la tarjeta Mi voz en Progreso del IEP — presiona Buscar páginas ahí. Solo viajan las líneas que el estudiante CONSERVÓ: una línea marcada como privada, y cada línea que quitó de su página, nunca salen de su dispositivo.")) + "</p>";
  }

  function repaintLink() {
    var s = el("timLgSid"); if (!s) return;
    var code = String(s.value || "").trim().toUpperCase();
    try { localStorage.setItem(SEL, code); } catch (e) {}
    var u = el("timLgUrl"); if (u) u.value = buildLink(code);
    var w = el("timLgWho"); if (w) w.textContent = whoLine(code);
    var d = destLine(), p = el("timLgDest");
    if (p) { p.style.color = d.c; p.textContent = d.t; }
  }
  function wire() {
    var s = el("timLgSid");
    if (s && !s.__aogTimWired) { s.__aogTimWired = 1; s.addEventListener("input", repaintLink); }
    var c = el("timLgCopy");
    if (c && !c.__aogTimWired) {
      c.__aogTimWired = 1;
      c.addEventListener("click", function () {
        var u = el("timLgUrl"), said = el("timLgSaid");
        if (!u) return;
        function ok() { if (said) { said.style.color = "var(--green,#2E6B3A)"; said.textContent = T("Copied.", "Copiado."); setTimeout(function () { said.textContent = ""; }, 2600); } }
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(u.value).then(ok, function () { u.select(); }); return; }
        } catch (e) {}
        try { u.select(); document.execCommand("copy"); ok(); } catch (e2) {}
      });
    }
    var o = el("timLgOpen");
    if (o && !o.__aogTimWired) {
      o.__aogTimWired = 1;
      o.addEventListener("click", function () {
        var u = el("timLgUrl");
        if (u && u.value) window.open(u.value, "_blank", "noopener");
      });
    }
  }

  /* ⚠ THE CARD GOES INTO #panel-distribute ITSELF, NOT INTO A PANE. The tab
     strip re-reads the panel's own children, groups them by .section-head and
     moves each group into its pane; a node appended straight into a pane is
     invisible to that grouping and would never move again. */
  function install() {
    if (el("aogTimLgCard")) return true;
    var panel = el("panel-distribute");
    if (!panel) return false;
    var head = document.createElement("div");
    head.className = "section-head";
    head.innerHTML = "<h2>" + esc(T("This Is Me page", "Página Este soy yo")) + "</h2>";
    var card = document.createElement("div");
    card.id = "aogTimLgCard";
    card.className = "table-card";
    card.style.padding = "24px 28px";
    card.innerHTML = cardHtml();
    panel.appendChild(head);
    panel.appendChild(card);
    wire();
    try { if (typeof window.__aogDistRebuild === "function") window.__aogDistRebuild(); } catch (e) {}
    return true;
  }

  /* ⚠ The dashboard language switch does not touch documentElement.lang, so a
     card built once sits there in the language it was born in. Hang on
     refreshAdmin — and copy every __aog* flag off the function being wrapped,
     or the next wrapper undoes one of theirs. */
  function watchLang() {
    if (typeof window.refreshAdmin !== "function" || window.refreshAdmin.__aogTimDist) return;
    var orig = window.refreshAdmin;
    var wrapped = function () {
      var r = orig.apply(this, arguments);
      try {
        var c = el("aogTimLgCard");
        if (c) {
          c.innerHTML = cardHtml();
          wire();
          var hd = c.previousElementSibling;
          if (hd && hd.classList && hd.classList.contains("section-head")) {
            hd.innerHTML = "<h2>" + esc(T("This Is Me page", "Página Este soy yo")) + "</h2>";
          }
        }
      } catch (e) {}
      return r;
    };
    Object.keys(orig).forEach(function (k) { if (k.indexOf("__aog") === 0 && !wrapped[k]) wrapped[k] = orig[k]; });
    wrapped.__aogTimDist = 1;
    window.refreshAdmin = wrapped;
  }

  /* ⚠ INSTALL IS NOT ENOUGH — THE SENTENCE GOES STALE. install() returns
     early once the card exists, so a teacher who connects their Sheet in the
     Connect & sync tab and then walks back here would read the sentence the
     card was BORN with, over a link built from the same stale state. A real
     Chromium caught exactly this on the practice card in .30dq — the green
     case measured identical to the amber one, because it was still the amber
     one. Recompute on every boot, and boot on the tab strip's own buttons. */
  function boot() {
    try { install(); } catch (e) {}
    try { watchLang(); } catch (e2) {}
    try { repaintLink(); } catch (e3) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 900);
  setTimeout(boot, 2600);
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest &&
      e.target.closest('.tab[data-tab="distribute"], .dmode, #aogDistTabs button, #aogSyncCard button');
    if (t) setTimeout(boot, 260);
  });

  window.AOGTimLinks = {
    link: buildLink,
    destState: destState,
    install: install,
    /* test seam — the suite asserts the sentence without reading pixels */
    __line: destLine
  };
})();
