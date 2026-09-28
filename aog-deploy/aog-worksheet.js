/* ═══════════════════════════════════════════════════════════════════════════
   AOG-WS-MODEL-V1 (2026-09-28) — Jimmy: "ALL THE TESTS AND WORKSHEETS in the curriculum need to follow
   the DAILY DRAFTS model of NAME, SEND and CHECK YOUR WORK … Also if these can look nicer, more like a
   sketch pad (ACROSS THE CURRICULUM AND RESOURCE ROOM MATERIAL)."

   aog-grace.js loads this on every page. It finds the send boxes each family of worksheet already has
   and lays them out the Daily Drafts way, at the end of the work, inside the sheet:

       Check my work (where the page has a check or a try-again)  →  Name line  →  Send to my teacher

   Nothing new is sent and no answer checking changes: the page's own input, button and send code are
   MOVED, never rebuilt, so every listener and payload stays exactly as it was. All of it is screen-only;
   print keeps (or gets) a paper Name / Date line.

   Families handled here:
     1. Practice rooms (m…, c…, h…, v…, b…, e…, s…, sp…, fc…, ec…, r… — the Resource Room): .sendbox
        built by each page's buildUI(); its <label><input></label> becomes the name line.
     2. Course units, chapter reviews (.review .csend): verdict + Try again become the check row, the
        .cwho field the name line, Print moves below. (Unit tests and lesson worksheets: aog-pages.js
        and aog-unit.js draw the same model themselves.)
     3. SEL worksheets, room workbooks and the bench worksheets (microscope/telescope/drums/decks/
        waves-lessons): the "Finished?" card (#wsWho / #wbWho + FINISHED).
   Look: pencil outlines (#2A2622), paper (#FBF8F0), faint crumpled paper on screen only, striped
   pencil edges on the confidence cards. Light theme only for the paper; dark theme keeps its colours.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  var D = document, H = D.documentElement;
  if (window.__aogWsModel) return; window.__aogWsModel = 1;
  function es() { return /^es/i.test(H.lang || ""); }
  function T(en, sp) { return es() ? sp : en; }
  function bi(el, en, sp) { el.setAttribute("data-en", en); el.setAttribute("data-es", sp); el.textContent = T(en, sp); return el; }
  function mk(tag, cls) { var e = D.createElement(tag); if (cls) e.className = cls; return e; }
  var uid = 0;

  var INK = "#2A2622", PAPER = "#FBF8F0", LIGHT = 'html:not([data-theme="dark"])';
  var CRUMPLE = "url(/img/paper-crumple.webp)";
  var css = ""
    /* the three rows */
    + "\n.aog-ws-check{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:14px 0 8px}"
    + "\n.aog-ws-check:empty{display:none}"
    + "\n.aog-ws-check .aog-ws-k,.aog-ws-sig label,.aog-ws-sig .aog-ws-l{font-size:.72rem;font-weight:800;letter-spacing:.13em;text-transform:uppercase}"
    + "\n.aog-ws-sig{display:flex !important;flex-direction:row !important;align-items:center;gap:8px 12px;flex-wrap:wrap;margin:14px 0 0;padding-top:12px;border-top:1px solid rgba(42,38,34,.25)}"
    + "\n.aog-ws-sig input{flex:1 1 220px;max-width:360px;min-height:48px;border:0 !important;border-bottom:2px solid currentColor !important;border-radius:0 !important;background:transparent !important;padding:8px 4px !important;font:inherit;font-size:17px !important;font-weight:700;color:inherit;box-shadow:none !important}"
    + "\n.aog-ws-sig input:focus{outline:2px solid #B87A12;outline-offset:2px}"
    + "\n.aog-ws-sig .aog-ws-note{flex-basis:100%;font-size:.85rem;font-style:italic;margin:0}"
    + "\n.aog-ws-sig:not(.aog-ws-keep):has(+ [hidden]){display:none !important}"
    + "\n.aog-ws-send{margin:10px 0 4px !important;padding:10px 14px !important;display:flex !important;flex-wrap:wrap;align-items:center;gap:6px 14px;max-width:none !important}"
    + "\n.aog-ws-send[hidden]{display:none !important}"
    + "\n.aog-ws-send > .sk,.aog-ws-send > .ck,.aog-ws-send > label:empty,.aog-ws-send > h2{display:none !important}"
    + "\n.aog-ws-send .snote,.aog-ws-send .aog-ws-snote,.aog-ws-send > p:not([class]){flex:1 1 240px;margin:0 !important;font-size:15px !important}"
    + "\n.aog-ws-send .srow,.aog-ws-send .row{margin:0 !important;display:flex;flex-wrap:wrap;gap:8px;align-items:center}"
    + "\n.aog-ws-send .sst,.aog-ws-send .cst,.aog-ws-send .st,.aog-ws-send .aogtest-st{flex-basis:100%;margin:0 !important}"
    + "\n.aog-ws-send .sst:empty,.aog-ws-send .cst:empty,.aog-ws-send .st:empty{display:none}"
    /* the buttons: Check my work is the site's outlined pill; Send is the green pill with the pencil envelope */
    + "\n.aog-ws-check button{min-height:44px !important;padding:0 18px !important;border-radius:999px !important;border:2px solid #2A2622 !important;background:#FFFDF8 !important;color:#1F2630 !important;font:800 15px/1 -apple-system,'Segoe UI',Inter,Roboto,Arial,sans-serif !important;cursor:pointer;box-shadow:1px 2px 0 -0.5px rgba(42,38,34,.35) !important}"
    + "\n.aog-ws-check button:focus-visible,.aog-ws-send button:focus-visible{outline:3px solid #B87A12 !important;outline-offset:2px}"
    + "\n.aog-ws-send button.go,.aog-ws-send button.aogtest-go{min-height:48px !important;padding:0 22px !important;border-radius:999px !important;background:#2E7D4F !important;border:2px solid #1E5A38 !important;color:#fff !important;font:800 16px/1 -apple-system,'Segoe UI',Inter,Roboto,Arial,sans-serif !important;box-shadow:0 8px 18px -10px rgba(30,90,56,.7) !important;cursor:pointer}"
    + "\n.aog-ws-send button.go::before,.aog-ws-send button.aogtest-go::before{content:'';display:inline-block;width:1.25em;height:1.25em;margin-right:.45em;vertical-align:-.28em;background:url(/img/sketch/2709.webp) center/contain no-repeat;filter:invert(1) brightness(1.9)}"
    + "\n.aog-ws-send button.go:hover,.aog-ws-send button.aogtest-go:hover{background:#256A42 !important}"
    + "\nhtml[data-theme=\"dark\"] .aog-ws-check button{background:#252B35 !important;color:#EDE7DA !important;border-color:#8C939B !important}"
    /* phone: five confidence cards wrap 3 + 2 so the words never break */
    + "\n@media (max-width:520px){ :is(.conf-row, .confrow){display:flex !important;flex-wrap:wrap !important;gap:8px !important} :is(.conf-row .conf-b, .confrow .confb){flex:1 1 calc(33.333% - 8px) !important;min-width:0 !important;word-break:normal !important;overflow-wrap:normal !important;hyphens:none !important} .confrow .confb{white-space:nowrap !important;font-size:15px !important;padding-right:6px !important} }"
    + "\n.aog-ws-block{margin:18px 0 10px}#wsPrev .aog-ws-block,#wbPrev .aog-ws-block{display:none !important}"
    + "\n.aog-ws-send button.go.btn-fin{letter-spacing:0 !important;text-transform:none !important}"
    + "\n@media screen{ .aog-ws-topname{display:none !important} }"
    + "\n.layout:has(> .aogdd){display:block !important}.layout > .aogdd{margin:0 0 14px}"
    + "\n.aog-ws-signprint{display:none}"
    + "\n@media print{ .aog-ws-check,.aog-ws-sig,.aog-ws-send{display:none !important}"
    + " .aog-ws-signprint{display:flex !important;gap:28px;font:14px sans-serif;margin:14px 0}"
    + " .aog-ws-signprint span{border-bottom:1px solid #000;min-width:190px;display:inline-block} }"
    /* sketch pad: paper, pencil outlines, faint crumple (screen, light theme) */
    + "\n@media screen{"
    + LIGHT + " .aog-ws-send{background:" + CRUMPLE + " 0 0/620px," + PAPER + " !important;background-blend-mode:multiply !important;border:1.6px solid " + INK + " !important;border-radius:12px !important;box-shadow:2px 3px 0 -1px rgba(42,38,34,.35) !important;color:#1F2630 !important}"
    + LIGHT + " .aog-ws-send *:not(button):not(button *){color:#1F2630 !important}"
    + LIGHT + " .aog-ws-sig, " + LIGHT + " .aog-ws-sig *{color:#1F2630 !important}"
    + LIGHT + " :is(html.aog-ws-pad section.sheet, html.aog-ws-pad #main > section.pane, .review, #wsTurnin, #wbFin){background-image:" + CRUMPLE + " !important;background-size:620px !important;background-blend-mode:multiply !important}"
    + LIGHT + " html.aog-ws-pad section.sheet, " + LIGHT + " .aog-ws{border:1.6px solid " + INK + " !important;box-shadow:2px 3px 0 -1px rgba(42,38,34,.3), 0 14px 28px -22px rgba(0,0,0,.45) !important}"
    /* spiral binding + pencil margin on the practice sheet and the lesson worksheet (as AOG-SKETCHBOOK-PAGES-V1) */
    + LIGHT + " body :is(html.aog-ws-pad section.sheet, .aog-ws.aog-ws.aog-ws){padding-top:34px !important;padding-left:36px !important;background-image:radial-gradient(circle at 11px 9px, rgba(29,39,51,.6) 0 2.4px, transparent 2.9px), radial-gradient(ellipse 5px 8px at 11px 7px, transparent 0 3px, #8C939B 3.2px 4.4px, transparent 4.6px), linear-gradient(90deg, transparent 22px, rgba(184,69,70,.42) 22px 23.5px, transparent 23.5px), " + CRUMPLE + " !important;background-size:22px 18px, 22px 18px, 100% 100%, 620px 620px !important;background-repeat:repeat-x, repeat-x, repeat-y, repeat !important;background-position:12px 4px, 12px 4px, 0 0, 0 0 !important;background-color:" + PAPER + " !important}"
    /* the confidence cards: pencil-outlined paper with the colour as a striped edge */
    + "\n:is(.conf-row .conf-b, .confrow .confb):nth-child(1){--pg:#4A5A8C} :is(.conf-row .conf-b, .confrow .confb):nth-child(2){--pg:#3F4AA6} :is(.conf-row .conf-b, .confrow .confb):nth-child(3){--pg:#1F8080} :is(.conf-row .conf-b, .confrow .confb):nth-child(4){--pg:#2E8B57} :is(.conf-row .conf-b, .confrow .confb):nth-child(5){--pg:#B87A12}"
    + LIGHT + " :is(.conf-row .conf-b, .confrow .confb):not([aria-pressed=\"true\"]):not(.on):not(.sel){background:repeating-linear-gradient(38deg, var(--pg) 0 3px, " + PAPER + " 3px 7px) left top/9px 100% no-repeat, " + CRUMPLE + " 0 0/620px, " + PAPER + " !important;background-blend-mode:normal, multiply, normal !important;border:1.6px solid " + INK + " !important;border-radius:10px !important;box-shadow:1px 2px 0 -0.5px rgba(42,38,34,.35) !important;padding-left:16px !important;color:#1F2630 !important}"
    + LIGHT + " :is(.conf-row .conf-b, .confrow .confb):not([aria-pressed=\"true\"]):not(.on):not(.sel) *{color:#1F2630 !important}"
    + LIGHT + " :is(.conf-row .conf-b, .confrow .confb):is([aria-pressed=\"true\"], .on, .sel){border:1.6px solid " + INK + " !important;box-shadow:inset 0 0 0 3px " + PAPER + " !important;background-image:none !important}"
    + LIGHT + " :is(.conf-row .conf-b, .confrow .confb):is([aria-pressed=\"true\"], .on, .sel) .aogpic img{filter:invert(1)}"
    + LIGHT + " :is(.conf, #closeCard .confrow){background-color:transparent}"
    /* hint row and teacher drawer: pencil on paper */
    + LIGHT + " html.aog-ws-pad :is(.ladder-head, .lhints){background:" + CRUMPLE + " 0 0/620px, " + PAPER + " !important;background-blend-mode:multiply !important;border:1.4px dashed " + INK + " !important;border-radius:10px !important;box-shadow:none !important}"
    + LIGHT + " html.aog-ws-pad :is(.ladder-head, .lhints), " + LIGHT + " html.aog-ws-pad :is(.ladder-head, .lhints) *:not(button):not(button *){color:#1F2630 !important}"
    + LIGHT + " html.aog-ws-pad details.teach{background:" + CRUMPLE + " 0 0/620px, " + PAPER + " !important;background-blend-mode:multiply !important;border:1.6px solid " + INK + " !important;box-shadow:2px 3px 0 -1px rgba(42,38,34,.3) !important}"
    /* striped pencil number tabs (as aog-dd-sketch-nums) */
    + LIGHT + " :is(.aog-ws .part h6 .n, .review .q .qn){display:inline-block;min-width:1.7em;text-align:center;margin-right:6px;padding:0 6px;border:1.3px solid " + INK + ";border-radius:4px;background:" + PAPER + ";box-shadow:inset 0 -4px 0 -1px " + PAPER + ", inset 0 -7px 0 -1px var(--bnc,#5E6B7A);font-family:Georgia,\"Times New Roman\",serif;font-weight:700;color:#1F2630 !important}"
    + "\n}";

  function addCss() {
    if (D.getElementById("aog-ws-model-css")) return;
    var st = D.createElement("style"); st.id = "aog-ws-model-css"; st.textContent = css;
    (D.head || H).appendChild(st);
  }

  function sigRow(input) {
    var sig = mk("div", "aog-ws-sig no-print");
    if (!input.id) input.id = "aogWsName" + (++uid);
    var lb = bi(mk("label"), "Name", "Nombre"); lb.htmlFor = input.id;
    sig.appendChild(lb); sig.appendChild(input);
    if (!input.getAttribute("placeholder")) input.setAttribute("placeholder", T("Enter your name", "Escribe tu nombre"));
    sig.appendChild(bi(mk("p", "aog-ws-note"), "Sign with your name or class code. Use the same one every time.",
      "Firma con tu nombre o tu código de clase. Usa siempre el mismo."));
    return sig;
  }
  function signPrint() {
    var p = mk("div", "aog-ws-signprint");
    p.innerHTML = "<div>" + T("Name", "Nombre") + " <span></span></div><div>" + T("Date", "Fecha") + " <span></span></div>";
    return p;
  }

  /* 1. practice rooms: the page's .sendbox (its own input, button and send code) */
  function rooms() {
    Array.prototype.forEach.call(D.querySelectorAll(".sendbox:not([data-aog-ws])"), function (box) {
      if (box.closest(".teach, details")) return;          /* the teacher's copy stays in the drawer */
      var inp = box.querySelector("label input, input[type=text]"); if (!inp) return;
      box.setAttribute("data-aog-ws", "1");
      var lab = inp.closest("label");
      var sig = sigRow(inp); sig.classList.add("aog-ws-keep");   /* the name line is always there; the page shows its Send box when a set is done */
      if (lab && lab.parentNode) lab.parentNode.removeChild(lab);
      box.parentNode.insertBefore(sig, box);
      box.parentNode.insertBefore(signPrint(), sig);
      box.classList.add("aog-ws-send");
      var sn = box.querySelector(".snote");
      if (sn && /Nothing is sent until|only when you tap/i.test(sn.getAttribute("data-en") || sn.textContent)) { sn.setAttribute("data-en", SEND_EN); sn.setAttribute("data-es", SEND_ES); sn.textContent = T(SEND_EN, SEND_ES); }
    });
  }

  /* 2. course units, chapter reviews and every other scored .review with a .csend */
  function reviews() {
    Array.prototype.forEach.call(D.querySelectorAll(".review .csend:not([data-aog-ws])"), function (cs) {
      var r = cs.closest(".review"); if (!r || r.getAttribute("data-kind") === "unit-test") return;
      var inp = cs.querySelector(".cwho"); if (!inp) return;
      cs.setAttribute("data-aog-ws", "1");
      var foot = r.querySelector(".rfoot");
      var chk = mk("div", "aog-ws-check no-print");
      if (foot) {
        chk.appendChild(bi(mk("span", "aog-ws-k"), "Check my work", "Revisa mi trabajo"));
        var v = foot.querySelector("[data-verdict]"), again = foot.querySelector(".reset-r");
        if (v) chk.appendChild(v);
        if (again) chk.appendChild(again);
      }
      /* Jimmy, 2026-09-26: "Those mid chapter reviews don't need a teacher check." — aog-pages.js keeps their
         Send box off, so a chapter review gets the check row only: no name line, nothing to send. */
      if (r.getAttribute("data-kind") === "chapter-review") { r.insertBefore(chk, cs); if (foot) r.insertBefore(foot, cs.nextSibling); return; }
      var sig = sigRow(inp);
      var note = bi(mk("p", "aog-ws-snote"), SEND_EN, SEND_ES);
      cs.insertBefore(note, cs.firstChild.nextSibling);
      cs.classList.add("aog-ws-send");
      r.insertBefore(chk, cs); r.insertBefore(signPrint(), cs); r.insertBefore(sig, cs);
      if (foot) r.insertBefore(foot, cs.nextSibling);    /* Print stays below, like Clear and Print on Daily Drafts */
    });
  }

  /* 3. SEL worksheets, room workbooks, bench worksheets: the "Finished?" card */
  /* the one short line under Send, as on Daily Drafts */
  var SEND_EN = "Your answers go to your teacher when you tap Send. Tap to send again.",
      SEND_ES = "Tus respuestas le llegan a tu maestro/a cuando tocas Enviar. Toca para enviarlo otra vez.";

  /* Check my work for a writing sheet: count the parts still empty and move to the first one */
  function checkRow(scope) {
    var chk = mk("div", "aog-ws-check no-print");
    chk.appendChild(bi(mk("span", "aog-ws-k"), "Check my work", "Revisa mi trabajo"));
    var b = bi(mk("button", "aog-ws-chkbtn"), "Check my work", "Revisar mi trabajo"); b.type = "button";
    var res = mk("span", "aog-ws-res"); res.setAttribute("aria-live", "polite");
    b.addEventListener("click", function () {
      var root = scope(); if (!root) return;
      var f = Array.prototype.filter.call(root.querySelectorAll("textarea, input[type=text]:not([data-aog-ws]), input:not([type])"), function (x) {
        return !x.closest(".aog-ws-block, .no-print, [hidden]") && !x.disabled && x.offsetParent !== null; });
      var empty = f.filter(function (x) { return !x.value.trim(); });
      res.textContent = empty.length ? T("Parts still empty: ", "Partes vacías: ") + empty.length + "." : T("Every part has an answer.", "Cada parte tiene respuesta.");
      if (empty[0]) { try { empty[0].scrollIntoView({ block: "center" }); empty[0].focus({ preventScroll: true }); } catch (e) {} }
    });
    chk.appendChild(b); chk.appendChild(res);
    return chk;
  }

  /* 3. SEL worksheets, room workbooks, bench worksheets: the page's "Finished?" card becomes the Daily Drafts
     block (check row, name line, compact Send) INSIDE the sheet the student is on, above that sheet's own
     Print / Erase row. The same input, button and status line are moved, so the page's send code is untouched. */
  function finished() {
    [["wsWho", "wsSendBtn", "wsSt"], ["wbWho", "wbSendBtn", "wbSt"]].forEach(function (ids) {
      var inp = D.getElementById(ids[0]), btn = D.getElementById(ids[1]), st = D.getElementById(ids[2]);
      if (!inp || !btn || inp.getAttribute("data-aog-ws")) return;
      var card = inp.closest("#wsTurnin, #wbFin, section, div[id]");
      inp.setAttribute("data-aog-ws", "1");
      function current() {
        return D.querySelector("main .sheet.is-active, .sheets .sheet.is-active") || D.querySelector(".wrap section.unit:not([hidden])") ||
               D.querySelector("main .sheet, .sheets .sheet");
      }
      var block = mk("div", "aog-ws-block no-print");
      block.appendChild(checkRow(current));
      block.appendChild(sigRow(inp));
      var send = mk("div", "aog-ws-send");
      send.appendChild(bi(mk("p", "aog-ws-snote"), SEND_EN, SEND_ES));
      btn.classList.add("go"); send.appendChild(btn);
      if (st) send.appendChild(st);
      block.appendChild(send);
      /* the button keeps its element and listener; only its words follow the model */
      function label() {
        var t = btn.textContent || "", w = T("Send to my teacher", "Enviar a mi maestro/a");
        if (/FINISHED/.test(t) && t !== w) btn.textContent = w;
        if (st && /FINISHED/.test(st.textContent)) st.textContent = st.textContent.replace(/FINISHED/g, T("Send", "Enviar"));
      }
      label();
      Array.prototype.forEach.call(D.querySelectorAll("textarea[placeholder*=FINISHED], input[placeholder*=FINISHED]"), function (x) {
        x.placeholder = x.placeholder.replace(/tap FINISHED/g, "tap Send to my teacher").replace(/FINISHED/g, "Send to my teacher"); });
      new MutationObserver(label).observe(btn, { childList: true, characterData: true, subtree: true });
      if (st) new MutationObserver(label).observe(st, { childList: true, characterData: true, subtree: true });
      if (card) card.style.display = "none";
      /* the name moves to the end: the top Name box (bench sheets) and the workbook's Name rule stay for paper
         only, and the name signed at the end fills them, so a printed copy still carries it */
      function syncName() {
        Array.prototype.forEach.call(D.querySelectorAll('input[data-f="name"]'), function (f) {
          if (f.value !== inp.value) { f.value = inp.value; try { f.dispatchEvent(new Event("input", { bubbles: true })); } catch (e) {} } });
      }
      Array.prototype.forEach.call(D.querySelectorAll('input[data-f="name"]'), function (f) {
        var box = f.parentNode; if (box) box.classList.add("aog-ws-topname");
        if (!inp.value && f.value) inp.value = f.value; });
      inp.addEventListener("input", syncName);
      var nl = D.querySelector(".nameline > span:first-child"); if (nl && /^\s*Name\s*$/.test(nl.textContent)) nl.classList.add("aog-ws-topname");
      function seat() {
        var sh = current(); if (!sh) { if (card && card.parentNode && block.parentNode !== card.parentNode) card.parentNode.insertBefore(block, card); return; }
        var feet = sh.querySelectorAll(".sheet-foot"), foot = sh.querySelector(":scope > .sheet-foot") || feet[feet.length - 1] || null;
        if (foot) { if (foot.previousElementSibling !== block) foot.parentNode.insertBefore(block, foot); }
        else if (block.parentNode !== sh || sh.lastElementChild !== block) sh.appendChild(block);
      }
      seat();
      var main = D.querySelector("main") || D.body;
      new MutationObserver(seat).observe(main, { attributes: true, attributeFilter: ["class", "hidden"], subtree: true });
      D.addEventListener("aog:lesson", function () { setTimeout(seat, 0); });
      window.addEventListener("hashchange", function () { setTimeout(seat, 50); });
    });
  }

  /* AOG-WS-DROPDOWN-V1 — the drop-down rule (CLAUDE.md): the room workbooks' unit rail and the scenario cards'
     unit row are choices of where to look, so each becomes one menu (aog-dropdowns.js presses the old buttons). */
  function roomMenus() {
    if (!/^room-\d+-(workbook|cards)$/.test((location.pathname.split("/").pop() || "").replace(/\.html$/, ""))) return;
    var rail = D.getElementById("rail"), lb = D.querySelector(".lbtns");
    var did = 0;
    if (rail && !rail.hasAttribute("data-aog-dropdown") && rail.querySelectorAll(".ritem").length >= 4) {
      rail.setAttribute("data-aog-dropdown", "Unit|Unidad"); did = 1;
      Array.prototype.forEach.call(rail.querySelectorAll(".ritem"), function (b) {
        var a = b.querySelector(".rl"), n = b.querySelector(".rn");
        if (a && n) b.setAttribute("data-aog-label", a.textContent.trim() + " · " + n.textContent.trim()); });
    }
    if (lb && !lb.hasAttribute("data-aog-dropdown") && lb.children.length >= 4) { lb.setAttribute("data-aog-dropdown", "Unit|Unidad"); did = 1; }
    if (did && !D.querySelector('script[src*="aog-dropdowns.js"]')) {
      var sc = D.createElement("script"); sc.src = "/aog-dropdowns.js"; sc.defer = true; (D.head || H).appendChild(sc);
    }
  }

  function run() { addCss(); try { roomMenus(); } catch (e) {}
    if (D.querySelector(".sendbox, .conf-row, .confrow")) H.classList.add("aog-ws-pad"); try { rooms(); } catch (e) {} try { reviews(); } catch (e) {} try { finished(); } catch (e) {} }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", run); else run();
  /* the send boxes are built by page scripts after load — look again a few times, then stop */
  [300, 900, 2000, 4000].forEach(function (t) { setTimeout(run, t); });
  new MutationObserver(function () {
    Array.prototype.forEach.call(D.querySelectorAll(".aog-ws-sig label[data-en], .aog-ws-note, .aog-ws-snote, .aog-ws-k, .aog-ws-chkbtn"), function (e) {
      var w = T(e.getAttribute("data-en"), e.getAttribute("data-es")); if (e.textContent !== w) e.textContent = w; });
    Array.prototype.forEach.call(D.querySelectorAll(".aog-ws-block .aog-ws-send .go"), function (b) {
      if (/^(Send to my teacher|Enviar a mi maestro\/a)$/.test(b.textContent)) b.textContent = T("Send to my teacher", "Enviar a mi maestro/a"); });
  }).observe(H, { attributes: true, attributeFilter: ["lang"] });
})();
