
/* ============================================================================
   EXIT-SLIP AND CHECK-IN LINKS IN THE DISTRIBUTE CARD  ·  2026-08-28

   The Classroom Link Generator built exactly one kind of link — the 18-question
   self-reflection — and the product had grown two more screens a student opens
   on a link: the morning Daily Check-In and the School-Day Exit Slip. A teacher
   could reach the check-in link from Set up ▸ My classes, and could reach the
   exit slip only by reading "architectureofgrace.com/exit" onto the board.

   ⚠ ONE DOOR PER THING — the second attempt, and the first one was wrong.
   The first cut put a "What this link opens" dropdown inside the Classroom
   Link Generator. Distribute already had a tab row (see aog-dist-tabs), so
   that created a second way to choose the same thing, nested inside the
   first. Jimmy caught it in one look. The exit slip now has its own card in
   its own tab, exactly like the check-in link does, and the Classroom Link
   Generator is once again only what its heading says.

   ⚠ NEVER `checkin=` AND `exit=` ON ONE LINK. Each boots its own screen on
   load; a link carrying both would race two screens into one tab.

   ⚠ A CLASS LINK OF EITHER KIND CLEARS A LEFTOVER `sid`. aog-student-links
   keeps the code in sessionStorage so a reload does not drop a student back
   to a code box — which is also how a shared cart Chromebook would hand the
   next child the last one's identity. That clear now fires on `exit=` and
   `slip=` as well as `checkin=`.

   §12 of the one-product-language handoff asked for the two screens to speak
   the same language. This is the teacher-facing half of it: one card, one
   set of fields, one QR, three destinations.
   ============================================================================ */
(function () {
  "use strict";

  var K_SCHED = "aog.lg.sched";

  function el(id) { return document.getElementById(id); }
  function isEs() { try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; } catch (e) { return false; } }
  function T(en, es) { return isEs() ? es : en; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function code(s) { return String(s == null ? "" : s).trim().toUpperCase(); }
  function ls(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* The same six the exit slip's own one-time picker offers a student who has
     no schedule. Kept here as a convenience button, never as a default — a
     link that quietly asserts a day the school does not have is worse than a
     link that asks. */
  var STD68 = ["English / Language Arts", "Math", "Science", "Social Studies", "Physical Education", "Advisory"];

  function parseSched(raw) {
    return String(raw || "").split(/[|,]/).map(function (x) { return x.trim(); }).filter(Boolean).filter(function (v, i, a) { return a.indexOf(v) === i; }).slice(0, 12);
  }
  function schedList() { return parseSched(ls(K_SCHED, "")); }

  /* ═════════════════════════════════════════ THE EXIT SLIP GETS ITS OWN CARD

     ⚠ FIRST CUT WAS WRONG AND JIMMY CAUGHT IT IN ONE LOOK.

     It added a "What this link opens" DROPDOWN inside the Classroom Link
     Generator, turning that one builder into three. But Distribute already
     had a tab row — Self-Reflection link · Daily check-in link · Connect &
     sync — built from Jimmy's own earlier note that two near-identical link
     builders stacked on one page were confusing. So the dropdown created a
     SECOND way to choose the same thing, sitting inside the first one:

         "Doesn't make sense that the self-reflection has a drop down menu
          for what link opens. It is not elite in the sense that there are
          MULTIPLE doors that lead to all of these reflections / check-ins."

     ⚠ ONE DOOR PER THING. The check-in link is its own card in its own tab.
     The exit slip is now its own card in its own tab, built the same way,
     and the Classroom Link Generator went back to being exactly what it
     says it is. If you are ever tempted to add a mode selector to a builder,
     add a tab instead — the tab row is the door model this panel already has.
     ========================================================================= */

  var K_SCHED = "aog.lg.sched";

  function parseSched(raw) {
    return String(raw || "").split(/[|,]/).map(function (x) { return x.trim(); })
      .filter(Boolean).filter(function (v, i, a) { return a.indexOf(v) === i; }).slice(0, 12);
  }
  function schedList() { return parseSched(ls(K_SCHED, "")); }

  function fieldVal(id, fallbackId) {
    var e = el(id);
    var v = e ? String(e.value || "").trim() : "";
    if (v) return v;
    var f = fallbackId && el(fallbackId);
    return f ? String(f.value || "").trim() : "";
  }

  /* ⚠ ONE BUILDER, NOT A SECOND LINK SYSTEM. Same params, same order and the
     same org resolver the check-in link uses — see aogCheckinLinkFor. The
     only differences are the ones that ARE differences: exit=1 instead of
     checkin=daily, and the class list. */
  window.aogExitLinkFor = function () {
    var base = (location.protocol === "http:" || location.protocol === "https:")
      ? (location.origin + location.pathname) : "";
    if (!base) return "";
    var p = new URLSearchParams();
    /* ⚠ NEVER `checkin=` AND `exit=` ON ONE LINK. Each boots its own screen
       on load; a link carrying both would race two screens into one tab. */
    p.set("exit", "1");
    p.set("who", "student");
    p.set("sync", "on");
    if (isEs()) p.set("lang", "es");
    var school = fieldVal("xsLgSchool", "lgSchoolId");
    var grade  = fieldVal("xsLgGrade",  "lgGrade");
    var cls    = fieldVal("xsLgClass",  "lgClassId");
    var term   = fieldVal("xsLgTerm",   "ciLgTerm");
    if (school) p.set("schoolId", school);
    base = (typeof aogShareBase_ === "function" && aogShareBase_("exit")) || base;
    if (grade)  p.set("grade", grade);
    if (cls)    p.set("classId", cls);
    if (term)   p.set("term", term);
    var sc = schedList();
    /* Tier 2 of scheduleFor() needs at least two to be a day. One class is
       not a schedule, and handing the slip a list of one is worse than
       handing it nothing — it falls through to the student's own picker. */
    if (sc.length >= 2) p.set("sched", sc.join("|"));
    var org = (typeof aogOrgId_ === "function") ? aogOrgId_() : "";
    if (org) p.set("org", org);
    var _destP = (typeof aogDestParam_ === "function") ? aogDestParam_() : "";
    if (_destP) p.set(AOG_DEST_PARAM, _destP);
    return base + "?" + p.toString();
  };

  /* The same six the exit slip's own one-time picker offers a student who
     has no schedule. A convenience button, never a default — a link that
     quietly asserts a day the school does not have is worse than one that asks. */
  var STD68 = ["English / Language Arts", "Math", "Science", "Social Studies", "Physical Education", "Advisory"];

  function myCourses() {
    var out = [];
    try {
      (window.AOGPop.classes() || []).forEach(function (c) {
        var v = String((c && c.course) || "").trim();
        if (v && out.indexOf(v) === -1) out.push(v);
      });
    } catch (e) {}
    return out;
  }

  function hintSched() {
    var h = el("xsLgSchedHint");
    if (!h) return;
    var sc = schedList();
    if (!sc.length) {
      h.style.color = "var(--ink-faint)";
      h.textContent = T("Blank is fine. Each student picks their own classes once, the first time they open the slip, and it remembers.",
                        "En blanco está bien. Cada estudiante elige sus clases una vez, la primera vez que abre la salida, y se recuerda.");
    } else if (sc.length === 1) {
      h.style.color = "var(--amber,#8A6D1F)";
      h.textContent = T("\u26A0 One class is not a day, so this link will carry no schedule and each student will pick their own. Name at least two.",
                        "\u26A0 Una clase no es un d\u00eda, as\u00ed que el enlace no llevar\u00e1 horario y cada estudiante elegir\u00e1 el suyo. Nombra al menos dos.");
    } else {
      h.style.color = "var(--green,#2E6B3A)";
      h.textContent = T("\u2713 This link carries " + sc.length + " classes: " + sc.join(", ") + ".",
                        "\u2713 Este enlace lleva " + sc.length + " clases: " + sc.join(", ") + ".");
    }
  }

  function refreshExitLink() {
    var u = el("xsLgUrl");
    if (u) u.value = window.aogExitLinkFor() || "";
    hintSched();
    var box = el("xsLgQr");
    if (box) {
      box.innerHTML = "";
      /* ⚠ CLEAR THE MARK, NOT JUST THE BOX. drawQr() skips any box carrying
         data-done, so clearing innerHTML alone left this empty from the
         second refresh onward -- and this card refreshes on every keystroke. */
      box.removeAttribute("data-done");
      box.setAttribute("data-url", u ? u.value : "");
      drawQr(box.parentNode || box);
    }
  }

  function injectCard() {
    var panel = el("panel-distribute");
    if (!panel || el("aogXsLgCard")) return;

    var head = document.createElement("div");
    head.className = "section-head";
    head.innerHTML =
      "<h2>" + esc(T("Exit Slip Link", "Enlace de salida")) + "</h2>" +
      '<div class="small">' + esc(T(
        "The end-of-day slip. One link for the class, posted wherever they will see it on the way out. Name the classes in their day and the slip can ask which one they enjoyed most and which was hardest by name \u2014 without asking a twelve-year-old to build a schedule first. Slips land in an ExitSlips tab of your Sheet, separate from the check-ins and separate from the reflection.",
        "La salida del final del d\u00eda. Un enlace para la clase, puesto donde lo vean al salir. Nombra las clases de su d\u00eda y la salida podr\u00e1 preguntar cu\u00e1l disfrut\u00f3 m\u00e1s y cu\u00e1l fue m\u00e1s dif\u00edcil por su nombre \u2014 sin pedirle a alguien de doce a\u00f1os que arme un horario. Las salidas llegan a una pesta\u00f1a ExitSlips de tu Hoja, aparte de los registros y aparte de la reflexi\u00f3n.")) + "</div>";

    var card = document.createElement("div");
    card.className = "table-card";
    card.id = "aogXsLgCard";
    card.style.padding = "24px 28px";
    card.innerHTML =
      '<div class="welcome-fields" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;align-items:end;">' +
        '<div class="field"><label for="xsLgSchool">' + esc(T("School ID", "ID de escuela")) + "</label>" +
          '<input type="text" id="xsLgSchool" autocomplete="off" placeholder="e.g. NORTH-JH"></div>' +
        '<div class="field"><label for="xsLgGrade">' + esc(T("Grade", "Grado")) + "</label>" +
          '<select id="xsLgGrade"><option value="">' + esc(T("Any", "Cualquiera")) + "</option>" +
            "<option>K</option><option>1</option><option>2</option><option>3</option><option>4</option>" +
            "<option>5</option><option>6</option><option>7</option><option>8</option><option>9</option>" +
            "<option>10</option><option>11</option><option>12</option></select></div>" +
        '<div class="field"><label for="xsLgClass">' + esc(T("Class / Room", "Clase / Aula")) + "</label>" +
          '<input type="text" id="xsLgClass" autocomplete="off" placeholder="e.g. Advisory-B"></div>' +
        '<div class="field"><label for="xsLgTerm">' + esc(T("Term", "Periodo escolar")) + "</label>" +
          '<input type="text" id="xsLgTerm" autocomplete="off" placeholder="e.g. Fall 2026"></div>' +
      "</div>" +
      '<div style="margin-top:16px;">' +
        '<label for="xsLgSched">' + esc(T("The classes in their day", "Las clases de su d\u00eda")) +
          ' <span style="color:var(--ink-faint);text-transform:none;letter-spacing:normal;font-weight:400;font-size:11px;">' +
          esc(T("(two or more, comma separated \u2014 or leave it blank)", "(dos o m\u00e1s, separadas por comas \u2014 o d\u00e9jalo en blanco)")) + "</span></label>" +
        '<input type="text" id="xsLgSched" autocomplete="off" aria-describedby="xsLgSchedHint" style="width:100%;padding:9px 12px;border:1px solid var(--rule);border-radius:8px;font-size:13.5px;background:var(--card,#fff);color:var(--ink);" placeholder="' +
          esc(T("English / Language Arts, Math, Science, Social Studies", "Ingl\u00e9s, Matem\u00e1ticas, Ciencias, Estudios Sociales")) + '">' +
        '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button class="btn btn-sm" type="button" id="xsLgStd">' + esc(T("Use the standard 6\u20138 day", "Usar el d\u00eda est\u00e1ndar 6\u20138")) + "</button>" +
          '<button class="btn btn-sm" type="button" id="xsLgMine">' + esc(T("Use my classes", "Usar mis clases")) + "</button>" +
          '<button class="btn btn-sm" type="button" id="xsLgClear">' + esc(T("Clear", "Borrar")) + "</button>" +
        "</div>" +
        '<div class="small" id="xsLgSchedHint" style="margin-top:8px;line-height:1.5;"></div>' +
      "</div>" +
      '<div style="margin-top:20px;">' +
        '<label class="small" style="display:block;margin-bottom:6px;font-weight:600;" for="xsLgUrl">' +
          esc(T("Link to post at the end of the day", "Enlace para poner al final del d\u00eda")) + "</label>" +
        '<div style="display:flex;gap:10px;align-items:stretch;flex-wrap:wrap;">' +
          '<input type="text" id="xsLgUrl" readonly style="flex:1;min-width:260px;font-family:monospace;font-size:13px;padding:10px 12px;border:1px solid var(--rule,#ddd);border-radius:8px;background:var(--cream,#faf8f4);">' +
          '<button class="btn btn-sm" type="button" id="xsLgCopy">' + esc(T("Copy link", "Copiar enlace")) + "</button>" +
        "</div>" +
        '<div class="small" id="xsLgMsg" style="margin-top:6px;height:16px;color:var(--ink-faint);"></div>' +
      "</div>" +
      '<div style="margin-top:18px;display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;">' +
        '<div><label class="small" style="display:block;margin-bottom:8px;font-weight:600;">' + esc(T("QR code", "C\u00f3digo QR")) + "</label>" +
          '<div class="hs-qr qr" id="xsLgQr" style="width:180px;height:180px;"></div></div>' +
        '<div class="small" style="max-width:340px;line-height:1.65;color:var(--ink-soft,#5b6675);">' +
          esc(T("The link carries the class context and the day\u2019s class list \u2014 never a student\u2019s identifier, never the Sheet address and never a passcode, the same rule every other link here follows. For one card per student, with their own code already on it, use Set up \u25b8 My classes \u25b8 Exit-slip cards.",
                "El enlace lleva el contexto de la clase y la lista de clases del d\u00eda \u2014 nunca un identificador del estudiante, nunca la direcci\u00f3n de la hoja y nunca una contrase\u00f1a, la misma regla de todos los dem\u00e1s enlaces. Para una tarjeta por estudiante, con su propio c\u00f3digo, usa Configuraci\u00f3n \u25b8 Mis clases \u25b8 Tarjetas de salida.")) + "</div>" +
      "</div>";

    /* ⚠ TWO PLACES, BECAUSE THIS BLOCK CAN ARRIVE ON EITHER SIDE OF THE TABS.
       aog-dist-tabs MOVES every .section-head block into a pane. If it has
       already run, "Connect your school's Sheet" is no longer a child of
       #panel-distribute and insertBefore(head, thatHead) throws NotFoundError
       — the card then never appears at all, silently, because init() catches.
       So: if the pane exists, go straight into it; otherwise sit where the
       check-in card sits and let the tabs collect it on their next pass. */
    var pane = el("aogDistPane-exitslip");
    if (pane) { pane.appendChild(head); pane.appendChild(card); }
    else {
      var anchor = null;
      var heads = panel.querySelectorAll(".section-head");
      Array.prototype.forEach.call(heads, function (h) {
        if (anchor) return;
        var t = h.querySelector("h2");
        if (t && t.getAttribute("data-dl") === "dl_cfg_h1" && h.parentNode === panel) anchor = h;
      });
      if (anchor) { panel.insertBefore(head, anchor); panel.insertBefore(card, anchor); }
      else { panel.appendChild(head); panel.appendChild(card); }
    }

    ["xsLgSchool", "xsLgGrade", "xsLgClass", "xsLgTerm"].forEach(function (id) {
      var e = el(id);
      if (!e) return;
      ["input", "change"].forEach(function (ev) { e.addEventListener(ev, refreshExitLink); });
    });
    var sc = el("xsLgSched");
    sc.value = ls(K_SCHED, "");
    ["input", "change", "blur"].forEach(function (ev) {
      sc.addEventListener(ev, function () { lsSet(K_SCHED, sc.value); refreshExitLink(); });
    });
    function setSched(list) { sc.value = list.join(", "); lsSet(K_SCHED, sc.value); refreshExitLink(); }
    el("xsLgStd").addEventListener("click", function () { setSched(STD68); });
    el("xsLgClear").addEventListener("click", function () { setSched([]); });
    el("xsLgMine").addEventListener("click", function () {
      var c = myCourses();
      if (!c.length) {
        var h = el("xsLgSchedHint");
        if (h) {
          h.style.color = "var(--amber,#8A6D1F)";
          h.textContent = T("No classes are built yet \u2014 Set up \u25b8 My classes is where they go.",
                            "Todav\u00eda no hay clases \u2014 se crean en Configuraci\u00f3n \u25b8 Mis clases.");
        }
        return;
      }
      setSched(c);
    });
    var cp = el("xsLgCopy");
    if (cp) cp.addEventListener("click", function () {
      var u = el("xsLgUrl"), m = el("xsLgMsg");
      if (!u || !u.value) { if (m) m.textContent = T("Only on the live site", "Solo en el sitio publicado"); return; }
      function said(t) { if (m) { m.textContent = t; setTimeout(function () { if (m) m.textContent = ""; }, 2400); } }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(u.value).then(function () { said(T("Copied", "Copiado")); },
            function () { u.select(); said(T("Press \u2318C", "Presiona \u2318C")); });
          return;
        }
      } catch (e) {}
      u.select(); said(T("Press \u2318C", "Presiona \u2318C"));
    });
    refreshExitLink();
  }

  /* ══════════════════════════════════════════════ EXIT-SLIP CARDS PER STUDENT
     The check-in cards already exist (aog-student-links). This is the same
     card, for the other end of the day, carrying `sid` AND `sched` so a
     student taps one thing and is asked about their own classes by name.

     It writes into that module's own #aogSlinkSheet host on purpose — one
     host, one stylesheet, one print rule, two builders. Duplicating the CSS
     is how two things meant to match stop matching.
     ══════════════════════════════════════════════════════════════════════ */

  function xLinkFor(cls, sid) {
    var base = "";
    try { base = (window.AOGPop && window.AOGPop.linkFor) ? window.AOGPop.linkFor(cls) : ""; } catch (e) {}
    if (!base) return "";
    var i = base.indexOf("?");
    var b = i < 0 ? base : base.slice(0, i);
    var p;
    try { p = new URLSearchParams(i < 0 ? "" : base.slice(i + 1)); } catch (e) { return ""; }
    p.delete("checkin"); p.delete("checkinType"); p.delete("slip");
    p.set("exit", "1");
    p.set("who", "student");
    var s = schedList();
    if (s.length >= 2) p.set("sched", s.join("|"));
    p.set("sid", code(sid));
    return b + "?" + p.toString();
  }

  function host() {
    var pnl = el("panel-classes");
    if (!pnl) return null;
    var h = el("aogSlinkSheet");
    if (!h) { h = document.createElement("div"); h.id = "aogSlinkSheet"; pnl.appendChild(h); }
    return h;
  }

  /* Exported so the Daily Check-In Link card can draw a QR without a fifth
     private copy of this function existing in this file. See aog-checkin-layer. */
  function drawQr(h) {
    var boxes = h.querySelectorAll(".qr[data-url]");
    if (!boxes.length) return;
    function fallback() {
      boxes.forEach(function (b) {
        if (b.getAttribute("data-done")) return;
        b.setAttribute("data-done", "1");
        b.innerHTML = '<span style="font-size:10.5px;color:var(--ink-faint);line-height:1.35;word-break:break-all;">' +
          esc(b.getAttribute("data-url") || "") + "</span>";
      });
    }
    var p = null;
    try { p = (typeof ensureQrLib === "function") ? ensureQrLib() : null; } catch (e) {}
    if (!p) { fallback(); return; }
    p.then(function (ok) {
      if (!ok || !window.QRCode) { fallback(); return; }
      boxes.forEach(function (b) {
        var u = b.getAttribute("data-url");
        if (!u) return;
        try { new QRCode(b, { text: u, width: 120, height: 120, correctLevel: QRCode.CorrectLevel.M }); b.setAttribute("data-done", "1"); } catch (e) {}
      });
      fallback();
    }, fallback);
  }

  function buildSheet(cls) {
    var h = host();
    if (!h || !cls) return;
    var title = "";
    try { title = window.AOGPop.classTitle(cls); } catch (e) { title = (cls.course || ""); }
    var members = (cls.members || []).slice();
    var s = schedList();

    h.className = "on";
    h.innerHTML =
      '<div class="section-head sl-noprint" style="margin-top:22px;"><h2>' +
        esc(T("End-of-day cards for ", "Tarjetas de fin de día para ") + title) + "</h2>" +
        '<div class="small">' + esc(T(
          "The same student, the other end of the day. Hand these out once; the child scans or clicks their own on the way out and never types a code. Keep the paper list of which code is which child — that list is the only place the two are connected, and it belongs to you, not to this site.",
          "El mismo estudiante, el otro extremo del día. Reparte estas una vez; cada quien escanea o abre la suya al salir y nunca escribe un código. Guarda la lista en papel de qué código es de quién — esa lista es el único lugar donde se conectan, y es tuya, no de este sitio.")) +
        "</div>" +
        '<div class="small" style="margin-top:6px;' + (s.length >= 2 ? "color:var(--green,#2E6B3A);" : "color:var(--ink-faint);") + '">' +
          esc(s.length >= 2
            ? T("These cards name their day: " + s.join(", ") + ". Change it under Distribute.",
                "Estas tarjetas nombran su día: " + s.join(", ") + ". Cámbialo en Distribuir.")
            : T("No class list is set, so each student picks their own classes once, the first time they open the slip. Set one under Distribute if you would rather they did not.",
                "No hay lista de clases, así que cada estudiante elige las suyas una vez, la primera vez. Puedes fijarla en Distribuir.")) +
        "</div></div>" +
      '<div class="pd-acts sl-noprint" style="margin-bottom:14px;">' +
        '<button type="button" class="aog-pop-btn primary" id="slPrint">' + esc(T("Print these cards", "Imprimir estas tarjetas")) + "</button>" +
        '<button type="button" class="aog-pop-btn" id="slClose">' + esc(T("Close", "Cerrar")) + "</button>" +
      "</div>" +
      '<div class="sl-grid">' + members.map(function (m) {
        var u = xLinkFor(cls, m);
        /* The header above has always said "scans or clicks" — the card now
           keeps that promise: the QR is a link to the same URL it encodes. */
        return '<div class="sl-card"><a class="qr" style="display:block;" data-url="' + esc(u) + '" href="' + esc(u) + '" target="_blank" rel="noopener" aria-label="' + esc(T("Open this student’s exit slip", "Abrir la salida de este estudiante")) + '"></a>' +
          '<div class="who">' + esc(code(m)) + "</div>" +
          '<div class="cls">' + esc(T("End of day · ", "Fin del día · ") + title) + "</div>" +
          '<div class="note">' + esc(T("Open this on your way out. It is yours — please do not pass it on.",
                                        "Abre esto al salir. Es tuyo — por favor no lo compartas.")) + "</div></div>";
      }).join("") + "</div>";

    /* ⚠ print() is called straight from the click, never behind a timer —
       iOS drops a deferred print silently. See [[aog-ios-print]]. */
    var pb = el("slPrint");
    if (pb) pb.addEventListener("click", function () { if (window.aogSlPrintCards) window.aogSlPrintCards(); else window.print(); });
    var cb = el("slClose");
    if (cb) cb.addEventListener("click", function () { h.className = ""; h.innerHTML = ""; });

    drawQr(h);
    try { h.scrollIntoView({ block: "start", behavior: "smooth" }); } catch (e) {}
  }

  /* #panel-classes is re-rendered wholesale by the population layer, so the
     button is re-attached on mutation rather than bound once. It sits AFTER
     "Hand out links" so the morning one stays the first thing read. */
  function decorate() {
    var panel = el("panel-classes");
    if (!panel || !window.AOGPop) return;
    panel.querySelectorAll(".pc-card").forEach(function (card) {
      var acts = card.querySelector(".pd-acts");
      if (!acts || acts.querySelector("[data-xlinks]")) return;
      var mine = acts.querySelector("[data-links]");
      if (!mine) return;                       /* the check-in button lands first */
      var id = mine.getAttribute("data-links");
      var cls = null;
      try { cls = window.AOGPop.classById(id); } catch (e) {}
      if (!cls || !(cls.members || []).length) return;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "aog-pop-btn";
      b.setAttribute("data-xlinks", id);
      b.textContent = T("Exit-slip cards", "Tarjetas de salida");
      b.addEventListener("click", function () {
        var c = null;
        try { c = window.AOGPop.classById(id); } catch (e) {}
        if (c) buildSheet(c);
      });
      mine.parentNode.insertBefore(b, mine.nextSibling);
    });
  }

  function watchPanel() {
    var panel = el("panel-classes");
    if (!panel || !window.MutationObserver) return;
    try { new MutationObserver(function () { decorate(); }).observe(panel, { childList: true, subtree: true }); } catch (e) {}
  }

  /* ------------------------------------------------------------------ public */
  window.AOGSlipLinks = {
    schedule: schedList,
    classLink: function () { return window.aogExitLinkFor(); },
    linkFor: xLinkFor,
    forClass: function (idOrCls) {
      var c = idOrCls;
      if (typeof idOrCls === "string") { try { c = window.AOGPop.classById(idOrCls); } catch (e) { c = null; } }
      if (!c) return [];
      return (c.members || []).map(function (m) { return { code: code(m), url: xLinkFor(c, m) }; });
    }
  };

  var booted = false;
  window.aogDrawQr = drawQr;

  function init() {
    try { injectCard(); } catch (e) {}
    if (booted) { decorate(); return; }
    booted = true;
    decorate();
    watchPanel();
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest &&
        e.target.closest('.tab[data-tab="distribute"], .tab[data-tab="classes"], .dmode[data-mode="setup"]');
      if (t) setTimeout(function () { try { injectCard(); } catch (e2) {} decorate(); }, 140);
    });
    try {
      new MutationObserver(function () { try { hintSched(); } catch (e) {} })
        .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 320); });
  else setTimeout(init, 320);
  setTimeout(init, 1800);
})();
