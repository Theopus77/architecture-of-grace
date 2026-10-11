
/* =====================================================================
   CONNECT & SYNC — THE SCREEN A TEACHER ACTUALLY FAILS AT
   team review 2026-08-27, item 8   ·   built 2026-08-28
   =====================================================================

   The general-education teacher picking this product up cold got as far as
   "Connect your school's Sheet", found a box wanting an Apps Script /exec
   URL and a box wanting an ADMIN_PULL_KEY, and closed the tab. It is the
   only item on any review list where a real teacher stopped.

   ⚠ THIS DOES NOT CHANGE THE ARCHITECTURE. The credential-free POST from a
   student's phone is the hard part and the current design got it right —
   see the educator-Sheets plan before touching any of that. What was wrong
   is that the screen could not tell the truth about itself.

   FOUR THINGS, ALL OF THEM ON THE FAILURE PATH:

   1 · TEST CONNECTION WENT GREEN WHEN IT HAD NO IDEA. It posted with
       mode:"no-cors", which resolves for a URL that is merely REACHABLE —
       a deployment set to "Only myself", a wrong passcode, an old /exec
       from a deleted deployment all resolved happily — and then it said
       "Test ping sent" in green and sent the teacher to look for a row in
       a Sheet that was never going to receive one. syncRecord has read the
       real reply since August (Apps Script's redirect carries
       Access-Control-Allow-Origin: *); the test button never caught up.
       ⚠ A TEST THAT CANNOT FAIL IS WORSE THAN NO TEST. It spends the one
       moment a teacher is still willing to debug.

   2 · ONE GENERIC URL ERROR FOR THREE DIFFERENT MISTAKES. "That doesn't
       look like an Apps Script Web App link" is true and useless. Each of
       the three things people actually paste is now named, along with what
       to do instead.

   3 · THE PASSCODE READ AS REQUIRED AND IS NOT. It is ADMIN_PULL_KEY, the
       READ key. Collection works with the URL alone. A teacher who does not
       have it should be able to finish, send, and come back for it.

   4 · ⚠ THE TOGGLE COULD SILENTLY POINT AT SOMEONE ELSE'S SHEET. "Send
       self-reflections taken on this device to the central sheet" turns on
       whatever destination resolves — and with no connection of your own
       saved, that is the one this SITE publishes, which is not yours. It
       now says whose it is before it does it.
   ===================================================================== */
(function () {
  "use strict";

  function el(id) { return document.getElementById(id); }
  function T(en, es) {
    try { if (typeof DT === "function") return DT(en, es); } catch (e) {}
    try { if (typeof dashLang !== "undefined" && dashLang === "es") return es; } catch (e2) {}
    return en;
  }
  function status(msg, color) {
    var e = el("aogSyncCfgStatus");
    if (e) { e.textContent = msg || ""; e.style.color = color || "var(--ink-soft)"; }
  }
  var RED = "var(--red,#8B2A2A)", GREEN = "var(--green,#2E6B3A)",
      AMBER = "var(--gold-deep,#9a6f24)", SOFT = "var(--ink-soft,#5b6675)";

  /* ---------------------------------------------------------------
     ⚠ NAME THE MISTAKE. Every branch below is something a real person
     pastes into this box, and each one has a different next step.
     Returns { url } on success or { err } with the sentence to show.
     --------------------------------------------------------------- */
  function readUrl(raw) {
    var u = String(raw == null ? "" : raw).trim()
      .replace(/^["'<]+|["'>]+$/g, "")        /* copied out of an email or a doc */
      .replace(/[?#].*$/, "")                 /* a tracking tail or an anchor */
      .replace(/\/+$/, "");                   /* a trailing slash */

    if (!u) return { url: "" };

    if (/^https?:\/\/docs\.google\.com\/spreadsheets/i.test(u)) {
      return { err: T("That is the Sheet itself, not the Web App. The link you need comes from the script attached to it: Extensions → Apps Script → Deploy → Web app.",
                      "Esa es la Hoja, no la Web App. El enlace que necesitas viene del script adjunto: Extensiones → Apps Script → Implementar → Aplicación web.") };
    }
    if (/script\.google\.com\/(home|u\/\d+\/home)/i.test(u) || /\/edit\b/i.test(u)) {
      return { err: T("That is the script editor, not the deployment. In the editor: Deploy → New deployment → Web app, then copy the Web app URL it gives you.",
                      "Ese es el editor, no la implementación. En el editor: Implementar → Nueva implementación → Aplicación web, y copia la URL que te da.") };
    }
    /* ⚠ /dev is the killer, because it WORKS for the person who deployed it
       and for nobody else. It runs as the signed-in editor, so the teacher
       tests it successfully on her own laptop and every student phone fails. */
    if (/\/dev$/i.test(u)) {
      return { err: T("That is the test link (…/dev). It only works while you are signed in to the script, so it would work on this computer and fail on every student device. Use the one ending in /exec.",
                      "Ese es el enlace de prueba (…/dev). Solo funciona con tu sesión iniciada, así que funcionaría aquí y fallaría en cada dispositivo estudiantil. Usa el que termina en /exec.") };
    }
    if (!/^https:\/\/script\.google\.com\//i.test(u)) {
      return { err: T("A Web App link starts with https://script.google.com/ — this one does not.",
                      "Un enlace de Web App empieza con https://script.google.com/ — este no.") };
    }
    if (!/\/exec$/i.test(u)) {
      return { err: T("Almost — a Web App link ends in /exec. Copy the whole Web app URL from the deployment.",
                      "Casi — un enlace de Web App termina en /exec. Copia la URL completa de la implementación.") };
    }
    return { url: u };
  }

  /* Reads the reply the way syncRecord does, and turns the three real
     failure shapes into three different sentences. */
  function readReply(res, txt) {
    var out = null;
    try { out = JSON.parse(txt); } catch (e) {}
    if (out) return { json: out };
    /* Google answers an unauthorized web app with its SIGN-IN PAGE, HTTP 200.
       A JSON parse failure here is almost never a broken script — it is
       "Who has access" set to anything but Anyone. */
    if (/<html|<!doctype/i.test(String(txt || "")) || res.status === 401 || res.status === 403) {
      return { signin: true };
    }
    return { unreadable: true };
  }

  /* ---------------------------------------------------------------
     TEST — writing first, then reading, and they are reported apart
     because they fail for different reasons and only one is required.
     --------------------------------------------------------------- */
  window.aogTestSyncConfig = async function () {
    var iu = el("aogSyncUrl"), ik = el("aogSyncKey");
    var r = readUrl(iu ? iu.value : "");
    if (r.err) { status(r.err, RED); if (iu) iu.focus(); return; }
    if (!r.url) { status(T("Paste your Web App URL first.", "Pega primero tu URL de Web App."), RED); if (iu) iu.focus(); return; }
    if (iu) iu.value = r.url;
    var key = ((ik && ik.value) || "").trim();

    status(T("Testing…", "Probando…"), SOFT);

    var wrote = false;
    try {
      var res = await fetch(r.url, {
        method: "POST", mode: "cors", redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ passcode: key, _backendAuth: key, ping: true,
                               timestamp: new Date().toISOString() })
      });
      var rep = readReply(res, await res.text());

      if (rep.signin) {
        status(T("Reached it, but the script asked for a Google sign-in. Deployment → Manage deployments → edit → Who has access: Anyone. Without that, no student device can send.",
                 "Se alcanzó, pero el script pidió iniciar sesión. Implementaciones → Administrar → editar → Quién tiene acceso: Cualquiera. Sin eso, ningún dispositivo estudiantil puede enviar."), RED);
        return;
      }
      if (rep.unreadable) {
        /* Honest amber. The POST was delivered; this browser could not read
           the answer. Never green — green here is the old bug. */
        status(T("Sent, but this browser could not read the reply, so this cannot confirm it worked. Open your Sheet and look for a row marked (connection test).",
                 "Enviado, pero este navegador no pudo leer la respuesta, así que no se puede confirmar. Abre tu Hoja y busca una fila marcada (connection test)."), AMBER);
        return;
      }
      if (rep.json && rep.json.ok) {
        wrote = true;
      } else {
        status(T("The script answered and refused it: ", "El script respondió y lo rechazó: ") +
               ((rep.json && (rep.json.error || rep.json.message)) || T("no reason given", "sin motivo")) +
               T(" — usually the BACKEND_AUTH_KEY in Script properties does not match.",
                 " — normalmente la BACKEND_AUTH_KEY en las propiedades del script no coincide."), RED);
        return;
      }
    } catch (e) {
      if (navigator.onLine === false) {
        status(T("This computer is offline, so nothing could be tested.", "Esta computadora está sin conexión; no se pudo probar nada."), AMBER);
        return;
      }
      status(T("Could not reach that URL at all. Check the deployment still exists — a deleted deployment leaves a link that looks fine and answers nothing.",
               "No se pudo alcanzar esa URL. Revisa que la implementación siga existiendo — una implementación borrada deja un enlace que parece bien y no responde."), RED);
      return;
    }

    /* ── the write worked. Now the read, which is a SEPARATE credential and
          a separate answer, and is not needed to collect anything. ── */
    if (!key) {
      status(T("Writing works — a row marked (connection test) is in your Sheet now, and you can delete it. Reading back from other devices needs the passcode, which you can add later.",
               "El envío funciona — hay una fila (connection test) en tu Hoja y puedes borrarla. Para leer lo de otros dispositivos hace falta el código, que puedes añadir después."), GREEN);
      return;
    }
    try {
      var res2 = await fetch(r.url, {
        method: "POST", mode: "cors", redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "pull", passcode: key })
      });
      var rep2 = readReply(res2, await res2.text());
      if (rep2.json && !rep2.json.error) {
        var n = 0;
        try {
          var j = rep2.json;
          n = (j.records || j.rows || j.data || []).length || 0;
        } catch (e2) {}
        status(T("Both directions work. A row marked (connection test) is in your Sheet — delete it whenever. Reading back returned " + n + " row" + (n === 1 ? "" : "s") + ".",
                 "Ambas direcciones funcionan. Hay una fila (connection test) en tu Hoja — bórrala cuando quieras. La lectura devolvió " + n + " fila" + (n === 1 ? "" : "s") + "."), GREEN);
      } else {
        status(T("Writing works, but that passcode was refused for reading (" +
                 ((rep2.json && rep2.json.error) || "no reason given") +
                 "). It must match ADMIN_PULL_KEY in Script properties — not BACKEND_AUTH_KEY. Collection is unaffected.",
                 "El envío funciona, pero ese código fue rechazado para leer (" +
                 ((rep2.json && rep2.json.error) || "sin motivo") +
                 "). Debe coincidir con ADMIN_PULL_KEY — no con BACKEND_AUTH_KEY. La recolección no se ve afectada."), AMBER);
      }
    } catch (e3) {
      status(T("Writing works. The read test could not be completed in this browser — try Refresh classroom data.",
               "El envío funciona. La prueba de lectura no se completó aquí — prueba Actualizar datos de la clase."), AMBER);
    }
  };

  /* ---------------------------------------------------------------
     SAVE — same named diagnoses, and a message that distinguishes
     "this device can send" from "this device can also read".
     --------------------------------------------------------------- */
  var origSave = window.aogSaveSyncConfig;
  window.aogSaveSyncConfig = function () {
    var iu = el("aogSyncUrl"), ik = el("aogSyncKey"), iw = el("aogSyncWriteKey");
    var r = readUrl(iu ? iu.value : "");
    if (r.err) { status(r.err, RED); if (iu) iu.focus(); return; }
    if (iu) iu.value = r.url;                    /* normalized before it is stored */
    var key = ((ik && ik.value) || "").trim();
    /* ⚠ THIS WRAPPER WRITES THE STATUS LINE LAST, so it owns the sentence.
       The original's own message about the write key never reaches a screen
       while this is installed — the same trap as the six wrappers on
       refreshAdmin. Whatever the original learns to say, say it here too. */
    var wkey = ((iw && iw.value) || "").trim();
    try { if (typeof origSave === "function") origSave(); } catch (e) {}
    if (!r.url) return;                          /* the original says its own piece */
    status((key
      ? T("Saved on this computer. It can send to your Sheet and read back from it.",
          "Guardado en esta computadora. Puede enviar a tu Hoja y leer de ella.")
      : T("Saved on this computer — it can send to your Sheet. Add the passcode when you want Refresh classroom data to bring other devices’ answers back.",
          "Guardado en esta computadora — puede enviar a tu Hoja. Añade el código cuando quieras que Actualizar datos de la clase traiga lo de otros dispositivos."))
      + " " + (wkey
      ? T("The links and QR codes you hand out now carry that destination with them.",
          "Los enlaces y códigos QR que repartas ahora llevan ese destino consigo.")
      : T("Links you hand out will not reach it — add your write key above for that.",
          "Los enlaces que repartas no llegarán — añade tu clave de escritura arriba para eso.")), GREEN);
  };

  /* ---------------------------------------------------------------
     ⚠ THE TOGGLE. With no connection of your own saved, this sends this
     computer's reflections to whatever destination the SITE publishes —
     which belongs to whoever runs the site, not to you. It never said so.

     Intercepted on click in the CAPTURE phase: preventDefault there stops
     the checkbox changing at all, so the existing change listener never
     fires and there is no state to unwind.
     --------------------------------------------------------------- */
  function ownConnection() {
    try { return !!localStorage.getItem("aog.sync.url"); } catch (e) { return false; }
  }
  function siteHost() {
    try {
      var d = window.AOG_SYNC_DEFAULTS;
      var u = d && d.url;
      if (!u) return "";
      return (String(u).match(/^https?:\/\/([^\/]+)/) || [])[1] || "";
    } catch (e) { return ""; }
  }

  document.addEventListener("click", function (ev) {
    var t = ev.target;
    if (!t || t.id !== "deviceSyncToggle") return;
    /* ⚠ CHECKED IS ALREADY FLIPPED HERE. A checkbox's pre-click activation
       sets its checkedness BEFORE the click event is dispatched, so in this
       capture-phase listener `checked` is the state the click is heading
       TO, not the one it came from — and preventDefault is what puts it
       back. Written the other way round first, which silently never warned
       anyone. Warn only when the click is turning it ON. */
    if (!t.checked) return;                      /* they are turning it OFF */
    if (ownConnection()) return;                 /* their own Sheet — nothing to warn about */
    var host = siteHost();
    if (!host) return;                           /* nothing published; the toggle does nothing */
    var msg = T(
      "This computer has no connection of its own saved.\n\nTurning this on sends the self-reflections taken HERE to the Sheet this site publishes (" + host + ") — which belongs to whoever runs the site, not to you, and you will not be able to read them back.\n\nTo send to your own Sheet, cancel and fill in Connect your Sheet above first.\n\nSend to the site’s Sheet anyway?",
      "Esta computadora no tiene una conexión propia guardada.\n\nActivar esto envía las autorreflexiones hechas AQUÍ a la Hoja que publica este sitio (" + host + ") — que pertenece a quien administra el sitio, no a ti, y no podrás leerlas de vuelta.\n\nPara enviar a tu propia Hoja, cancela y completa primero Conecta tu Hoja.\n\n¿Enviar de todos modos a la Hoja del sitio?");
    if (!window.confirm(msg)) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  }, true);

  /* A standing line under the toggle, so the answer is on screen before
     anyone reaches for it. Repainted with the panel. */
  function destLine() {
    var box = el("deviceSyncToggle");
    if (!box) return;
    var wrap = box.closest ? box.closest("label") : null;
    if (!wrap || !wrap.parentNode) return;
    var p = el("aogSyncDestLine");
    if (!p) {
      p = document.createElement("p");
      p.id = "aogSyncDestLine";
      p.className = "small";
      p.style.cssText = "margin:8px 0 0;line-height:1.6;font-weight:600;";
      wrap.parentNode.insertBefore(p, wrap.nextSibling);
    }
    if (ownConnection()) {
      p.style.color = GREEN;
      p.textContent = T("Sends to your own Sheet — the connection saved on this computer.",
                        "Envía a tu propia Hoja — la conexión guardada en esta computadora.");
      return;
    }
    var host = siteHost();
    if (!host) {
      p.style.color = SOFT;
      p.textContent = T("Nothing is connected, so this sends nowhere. Fill in Connect your Sheet above.",
                        "No hay nada conectado, así que esto no envía a ninguna parte. Completa Conecta tu Hoja arriba.");
      return;
    }
    p.style.color = AMBER;
    p.textContent = T("⚠ With no connection of your own, this would send to the Sheet this site publishes (" + host + ") — not yours, and you could not read it back.",
                      "⚠ Sin una conexión propia, esto enviaría a la Hoja que publica este sitio (" + host + ") — no a la tuya, y no podrías leerla.");
  }

  (function boot() {
    function go() {
      try { destLine(); } catch (e) {}
      if (typeof window.renderSyncStatus === "function" && !window.renderSyncStatus.__aogDest) {
        var orig = window.renderSyncStatus;
        var wrapped = function () {
          var r = orig.apply(this, arguments);
          try { destLine(); } catch (e) {}
          return r;
        };
        wrapped.__aogDest = true;
        /* Carry the other layers' flags — see #aog-one-story. */
        try {
          Object.keys(orig).forEach(function (k) {
            if (k.indexOf("__aog") === 0 && !wrapped[k]) wrapped[k] = orig[k];
          });
        } catch (eF) {}
        window.renderSyncStatus = wrapped;
      }
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
    setTimeout(go, 1000);
    setTimeout(go, 2600);
    document.addEventListener("click", function (e) {
      /* The card lives in the Distribute panel's "Connect & sync" pane
         (aog-distribute-tabs moved it there), not under Export. */
      var t = e.target && e.target.closest &&
        e.target.closest('.tab[data-tab="distribute"], .dmode[data-mode="setup"], #aogDistTabs button');
      if (t) setTimeout(go, 250);
    });
  })();

  window.AOGConnect = { readUrl: readUrl, destLine: destLine, ownConnection: ownConnection, siteHost: siteHost };
})();
