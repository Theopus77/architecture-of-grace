/**
 * ARCHITECTURE OF GRACE — Identity layer (client)  ·  v1.0
 * ===========================================================================
 * Connects up to 550+ students to their roster spot WITHOUT building traditional
 * user accounts. Two paths, matching the district directory backend
 * (AoG-District-Directory-Sync.gs):
 *
 *   Option B — Roster-Link Tokens  (DEFAULT, privacy-first, no email)
 *     A student link carries "?t=<token>". On load this module resolves the
 *     token to the student's placement (anonymized CODE + class + grade),
 *     fills the "#studentId" box for them, and locks it so the code is stable
 *     across any device. No login, no email, no account. The raw code never
 *     appears in the URL — only the opaque token does.
 *
 *   Option A — Google Workspace SSO  (OPT-IN; a district must enable it)
 *     Replaces the "Student ID code" box with a "Sign in with your School
 *     Google Account" button. The Google credential is verified server-side and
 *     matched to a roster spot. The email is used only to look up the student;
 *     only the anonymized CODE is ever stored locally or synced. SSO loads only
 *     when AOGIdentity is configured with { sso:true } — the default build stays
 *     a single self-contained page with no third-party login script.
 *
 * It is intentionally framework-free and side-effect-light: it touches only the
 * "#studentId" input (and, for SSO, an optional mount element). If no token and
 * no SSO config are present, it does nothing — the app behaves exactly as before.
 *
 * ---------------------------------------------------------------------------
 * USAGE (host already sets SCHOOL_SYNC_URL from the dashboard config panel):
 *
 *   AOGIdentity.init({
 *     syncUrl: SCHOOL_SYNC_URL,         // the Apps Script /exec URL
 *     schoolId: "a01",                  // optional; from launch params
 *     studentInput: "#studentId",       // default
 *     sso: false,                       // Option A opt-in
 *     googleClientId: "",               // required only when sso:true
 *     ssoMount: "#aogSsoMount",         // where to render the SSO button
 *     lang: (window.lang || "en")
 *   });
 *
 * Returns a Promise that resolves to the placement object (or null).
 * =========================================================================== */
(function (global) {
  "use strict";

  var T = function (en, es, lang) { return (lang === "es" ? es : en); };

  function qs(sel) { return sel ? document.querySelector(sel) : null; }

  function readTokenFromUrl() {
    try {
      var p = new URLSearchParams(global.location.search);
      return p.get("t") || p.get("token") || "";
    } catch (e) { return ""; }
  }

  /* POST a JSON body to the Apps Script web app; returns parsed JSON or null. */
  function callSync(syncUrl, body) {
    return fetch(syncUrl, {
      method: "POST",
      // text/plain avoids a CORS preflight against Apps Script (same trick the
      // dashboard's write path uses).
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); }).catch(function () { return null; });
  }

  /* Place a resolved roster spot into the form: fill + lock the student code,
     and pre-set grade/class if the page exposes those controls. */
  function applyPlacement(cfg, place) {
    var input = qs(cfg.studentInput || "#studentId");
    if (input && place.studentId) {
      input.value = place.studentId;
      input.readOnly = true;
      input.setAttribute("aria-readonly", "true");
      input.dataset.aogLocked = "1";
      // Soft visual cue without depending on the app's CSS.
      input.style.background = "rgba(0,0,0,0.04)";
      var label = document.getElementById("lblStudentId");
      if (label && !label.dataset.aogNoted) {
        label.dataset.aogNoted = "1";
        var note = document.createElement("span");
        note.style.cssText = "font-weight:400;opacity:.7;margin-left:6px;font-size:.85em;";
        note.textContent = T("· set by your class link", "· asignado por el enlace de tu clase", cfg.lang);
        label.appendChild(note);
      }
    }
    var grade = document.getElementById("grade");
    if (grade && place.grade) {
      var hit = [].slice.call(grade.options).find(function (o) { return o.value === place.grade || o.text === place.grade; });
      if (hit) grade.value = hit.value;
    }
    // Make the placement available to the rest of the app (write path can read it).
    global.AOG_PLACEMENT = place;
    try {
      global.dispatchEvent(new CustomEvent("aog:placement", { detail: place }));
    } catch (e) {}
  }

  /* Option B: resolve the link token to a placement and apply it. */
  function resolveToken(cfg) {
    var token = cfg.token || readTokenFromUrl();
    if (!token || !cfg.syncUrl) return Promise.resolve(null);
    // GET keeps it cache-friendly and preflight-free for a pure read.
    var url = cfg.syncUrl + (cfg.syncUrl.indexOf("?") >= 0 ? "&" : "?") +
      "action=resolve&t=" + encodeURIComponent(token);
    return fetch(url).then(function (r) { return r.json(); }).then(function (res) {
      if (res && res.ok && res.placement) {
        // Carry the token so the write path can sync without exposing the code.
        res.placement.token = token;
        applyPlacement(cfg, res.placement);
        return res.placement;
      }
      return null;
    }).catch(function () { return null; });
  }

  /* Option A: render the "Sign in with your School Google Account" button.
     Loads Google Identity Services lazily — only when a district opts in. */
  function renderSso(cfg) {
    if (!cfg.sso || !cfg.googleClientId || !cfg.syncUrl) return Promise.resolve(null);
    var mount = qs(cfg.ssoMount || "#aogSsoMount");
    if (!mount) return Promise.resolve(null);

    return new Promise(function (resolve) {
      function start() {
        if (!(global.google && global.google.accounts && global.google.accounts.id)) { resolve(null); return; }
        global.google.accounts.id.initialize({
          client_id: cfg.googleClientId,
          callback: function (resp) {
            var idToken = resp && resp.credential;
            if (!idToken) { resolve(null); return; }
            callSync(cfg.syncUrl, {
              action: "resolveEmail",
              schoolId: cfg.schoolId || "",
              idToken: idToken   // verified server-side; email never trusted raw
            }).then(function (out) {
              if (out && out.ok && out.placement) {
                applyPlacement(cfg, out.placement);
                resolve(out.placement);
              } else {
                mount.insertAdjacentHTML("beforeend",
                  '<p style="color:#B5503F;font-size:13px;margin:8px 0 0;">' +
                  T("That account isn’t on the class roster yet. Ask your teacher.",
                    "Esa cuenta aún no está en la lista de la clase. Pregúntale a tu maestro/a.", cfg.lang) +
                  "</p>");
                resolve(null);
              }
            });
          }
        });
        // Replace the typed-code box with the sign-in button.
        var field = (qs(cfg.studentInput || "#studentId") || {}).closest ?
          qs(cfg.studentInput || "#studentId").closest(".field") : null;
        if (field) field.style.display = "none";
        var btnWrap = document.createElement("div");
        mount.appendChild(btnWrap);
        global.google.accounts.id.renderButton(btnWrap, { theme: "outline", size: "large", text: "signin_with" });
        var hint = document.createElement("div");
        hint.style.cssText = "font-size:12px;opacity:.7;margin-top:6px;";
        hint.textContent = T("Sign in with your School Google Account",
                             "Inicia sesión con tu cuenta de Google de la escuela", cfg.lang);
        mount.appendChild(hint);
      }
      if (global.google && global.google.accounts && global.google.accounts.id) { start(); return; }
      var s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true; s.defer = true;
      s.onload = start;
      s.onerror = function () { resolve(null); };
      document.head.appendChild(s);
    });
  }

  var AOGIdentity = {
    /* Token path is the credential carried in the URL; expose it for the write path. */
    token: readTokenFromUrl,

    /* Main entry. Token path first (default); SSO only if opted in and no token. */
    init: function (cfg) {
      cfg = cfg || {};
      cfg.lang = cfg.lang || global.lang || "en";
      return resolveToken(cfg).then(function (place) {
        if (place) return place;                 // Option B succeeded
        if (cfg.sso) return renderSso(cfg);      // Option A, opt-in fallback
        return null;
      });
    },

    /* For the write path: returns { token } to merge into a sync record so the
       server resolves the code server-side (the raw code stays out of the URL). */
    writeFields: function () {
      var t = readTokenFromUrl();
      return t ? { token: t } : {};
    }
  };

  global.AOGIdentity = AOGIdentity;
  if (typeof module !== "undefined" && module.exports) module.exports = AOGIdentity;
})(typeof window !== "undefined" ? window : this);
