/* AOG-PAGES-V1 (2026-09-26) — Jimmy: "I don't like the continuous scroll on all the new
   curriculum. Each section should get its own NEXT page or BACK." Course units (the pages the
   course builder makes: #main with section.chap) now show one page at a time: the unit
   overview, each chapter's opening story, each section, each chapter review, then the word
   match, the unit test, and the writing task. A Back / Next bar sits at the foot of every page.
   Links and the Contents menu still jump straight to any section; the browser's Back works;
   printing prints the whole unit. */
(function () {
  var D = document, main = D.getElementById("main");
  if (!main || !main.querySelector("section.chap")) return;
  /* AOG-PG-CHIPS-V1 (2026-09-26) — Jimmy: "Those tabs need to be fixed. The text needs to be
     moved." A Check-yourself choice was a full-width bar with "7" pinned at its left edge.
     Each choice is now a chip that fits its own words, text centred, and the chips sit in a
     row that wraps on a phone. Long answers still wrap inside their chip. */
  try { var cs = D.createElement("style"); cs.textContent =
    ".opts,.q.wide .opts{display:flex!important;flex-wrap:wrap;gap:8px 10px;grid-template-columns:none}" +
    ".opt{width:auto!important;flex:0 1 auto;min-width:88px;max-width:100%;text-align:center!important;justify-content:center;align-items:center!important;padding:10px 18px!important;border-radius:999px!important}" +
    ".opt .l{margin-top:0!important}" +
    "@media(max-width:560px){.opt{flex:1 1 calc(50% - 10px);min-width:0}}" +
    /* Jimmy, 2026-09-26: "Those mid chapter reviews don't need a teacher check." Only the unit test keeps its Send box. */
    ".review[data-kind=\"chapter-review\"] .csend{display:none!important}";
    (D.head || D.documentElement).appendChild(cs); } catch (e) {}
  var es = function () { return (D.documentElement.lang || "").indexOf("es") === 0; };
  var ALWAYS = /\b(jump|rail|teach|foot)\b/;
  var pages = [];
  function add(els, id, en, esT) { els = els.filter(Boolean); if (els.length) pages.push({ els: els, id: id, en: en, es: esT }); }
  function txt(e) { return e ? e.textContent.replace(/\s+/g, " ").trim() : ""; }
  var kids = [].slice.call(main.children), over = [], pager2 = null;
  kids.forEach(function (k) {
    var c = String(k.className);
    if (ALWAYS.test(c)) return;
    if (/\bpager2\b/.test(c)) { pager2 = k; return; }
    if (k.matches("section.chap")) {
      if (over.length) { add(over, "top", "Unit overview", "Resumen de la unidad"); over = []; }
      var head = k.querySelector(":scope > .chead"), name = txt(head && head.querySelector("h2,h3")) || txt(head);
      var opener = [].slice.call(k.children).filter(function (e) { return !e.matches(".sec,.review"); });
      add(opener, k.id, "Chapter: " + name, "Capítulo: " + name);
      [].slice.call(k.querySelectorAll(":scope > .sec, :scope > .review")).forEach(function (s) {
        var t = txt(s.querySelector("h2,h3,.sec-t")) || name;
        if (s.matches(".review")) add([s], s.id, "Chapter review", "Repaso del capítulo");
        else add([s], s.id, t, t);
        s.__chead = head;
      });
      k.__chap = true; return;
    }
    if (k.id === "wrap") {
      var wh = k.querySelector(":scope > .wh"), parts = [].slice.call(k.children).filter(function (e) { return e !== wh; });
      parts.forEach(function (s, i) {
        var t = txt(s.querySelector("h2,h3")) || "Wrap-up";
        if (s.matches(".rooms") && pages.length && pages[pages.length - 1].wrap) { pages[pages.length - 1].els.push(s); return; }
        add([s], s.id || ("wrap" + i), t, t); pages[pages.length - 1].wrap = true; s.__wh = wh;
      });
      return;
    }
    over.push(k);
  });
  if (over.length) add(over, "top", "Unit overview", "Resumen de la unidad");
  if (pages.length < 3) return;
  var all = []; pages.forEach(function (p, i) { p.els.forEach(function (e) { e.__pg = i; all.push(e); }); });
  var st = D.createElement("style");
  st.textContent = ".aogpg-off{display:none!important}"
    + ".aogpg-bar{display:flex;align-items:stretch;justify-content:space-between;gap:10px;margin:26px 0 8px;padding:12px;border-radius:16px;border:1.5px solid rgba(10,30,51,.14);background:rgba(255,255,255,.7)}"
    + "[data-theme=dark] .aogpg-bar{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.18)}"
    + ".aogpg-bar button{flex:1 1 0;min-height:56px;border-radius:14px;border:1.5px solid rgba(10,30,51,.2);background:#fff;color:#0A1E33;font:inherit;font-weight:800;cursor:pointer;padding:8px 14px;display:flex;flex-direction:column;justify-content:center;gap:2px;text-align:left}"
    + ".aogpg-bar button.next{background:#0A1E33;color:#F4EEE2;border-color:#0A1E33;text-align:right;align-items:flex-end}"
    + ".aogpg-bar button[disabled]{visibility:hidden}"
    + ".aogpg-bar button small{font-weight:600;font-size:13px;opacity:.85;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}"
    + ".aogpg-mid{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;font:700 13px Inter,sans-serif;color:inherit;opacity:.8;gap:6px}"
    + ".aogpg-mid select{font:inherit;font-size:16px;min-height:40px;border-radius:10px;max-width:180px}"
    + "@media (max-width:600px){.aogpg-bar{flex-wrap:wrap}.aogpg-mid{order:-1;flex-basis:100%}}"
    + ".aogpg-mid .pp{min-height:40px;border-radius:999px;border:1.5px solid rgba(10,30,51,.25);background:#fff;color:#0A1E33;font:inherit;font-size:14px;font-weight:800;padding:0 14px;cursor:pointer}"
    + "@media print{.aogpg-off{display:block!important}.aogpg-bar{display:none!important}html.aogpg-one .aogpg-off:not(.aogpg-in){display:none!important}}";
  (D.head || D.documentElement).appendChild(st);
  var bar = D.createElement("nav"); bar.className = "aogpg-bar no-print"; bar.setAttribute("aria-label", "Pages");
  var cur = -1;
  function label(p) { return es() ? p.es : p.en; }
  function show(i, scroll) {
    i = Math.max(0, Math.min(pages.length - 1, i)); cur = i;
    all.forEach(function (e) { e.classList.toggle("aogpg-off", e.__pg !== i); });
    /* the chapter heading rides along with each of its sections, and the wrap-up heading with each wrap page */
    [].slice.call(main.querySelectorAll("section.chap")).forEach(function (ch) {
      var on = pages[i].els.some(function (e) { return ch.contains(e); }); ch.classList.toggle("aogpg-off", !on);
      var h = ch.querySelector(":scope > .chead"); if (h && on && h.classList.contains("aogpg-off")) h.classList.remove("aogpg-off");
    });
    var wrap = D.getElementById("wrap");
    if (wrap) { var won = pages[i].els.some(function (e) { return wrap.contains(e); }); wrap.classList.toggle("aogpg-off", !won);
      var wh = wrap.querySelector(":scope > .wh"); if (wh) wh.classList.toggle("aogpg-off", !won); }
    if (pager2) pager2.classList.toggle("aogpg-off", i !== pages.length - 1);
    var P = pages[i - 1], N = pages[i + 1];
    bar.innerHTML = '<button type="button" class="prev"' + (P ? "" : " disabled") + '><span>‹ ' + (es() ? "Atrás" : "Back") + "</span><small>" + (P ? label(P) : "") + "</small></button>"
      + '<div class="aogpg-mid"><span>' + (es() ? "Página " : "Page ") + (i + 1) + (es() ? " de " : " of ") + pages.length + "</span>"
      + '<select aria-label="' + (es() ? "Ir a una página" : "Go to a page") + '">' + pages.map(function (p, k) { return '<option value="' + k + '"' + (k === i ? " selected" : "") + ">" + (k + 1) + ". " + label(p) + "</option>"; }).join("") + '</select><button type="button" class="pp">' + (pages[i].els[0].closest && pages[i].els[0].closest("section.chap") ? (es() ? "Imprimir este capítulo" : "Print this chapter") : (es() ? "Imprimir esta página" : "Print this page")) + "</button></div>"
      + '<button type="button" class="next"' + (N ? "" : " disabled") + "><span>" + (es() ? "Siguiente" : "Next") + " ›</span><small>" + (N ? label(N) : "") + "</small></button>";
    var anchor = pages[i].els[pages[i].els.length - 1];
    anchor.parentNode.insertBefore(bar, anchor.nextSibling);
    if (i === pages.length - 1 && pager2) main.insertBefore(bar, pager2);
    bar.querySelector(".prev").onclick = function () { go(cur - 1); };
    bar.querySelector(".next").onclick = function () { go(cur + 1); };
    bar.querySelector("select").onchange = function () { go(+this.value); };
    /* Jimmy: "Section printing should be an option." Prints only the page on screen. */
    bar.querySelector(".pp").onclick = function () {
      /* AOG-PG-PRINTCHAP-V1 (2026-09-27): print the whole chapter being viewed, not one section. */
      var ch = pages[cur].els[0].closest && pages[cur].els[0].closest("section.chap"), ins = [];
      if (ch) pages.forEach(function (p) { if (p.els.some(function (e) { return ch.contains(e); })) p.els.forEach(function (e) { ins.push(e); }); });
      ins.forEach(function (e) { e.classList.add("aogpg-in"); });
      D.documentElement.classList.add("aogpg-one");
      var off = function () { ins.forEach(function (e) { e.classList.remove("aogpg-in"); }); D.documentElement.classList.remove("aogpg-one"); window.removeEventListener("afterprint", off); };
      window.addEventListener("afterprint", off); window.print(); setTimeout(off, 1500);
    };
    if (scroll) { var top = (pages[i].els[0].closest("section.chap") || pages[i].els[0]); try { top.scrollIntoView({ block: "start" }); } catch (e) { top.scrollIntoView(); } }
  }
  function go(i) {
    var id = pages[i] && pages[i].id; show(i, true);
    try { history.pushState({ aogpg: i }, "", "#" + id); } catch (e) {}
  }
  function pageOf(id) {
    if (!id) return -1; var t = D.getElementById(id); if (!t) return -1;
    for (var i = 0; i < pages.length; i++) if (pages[i].id === id || pages[i].els.some(function (e) { return e === t || e.contains(t); })) return i;
    var ch = t.closest && t.closest("section.chap"); if (ch) for (var j = 0; j < pages.length; j++) if (pages[j].id === ch.id) return j;
    return -1;
  }
  function fromHash(scroll) {
    var id = decodeURIComponent((location.hash || "").slice(1)), i = pageOf(id);
    if (i < 0) i = cur < 0 ? 0 : cur;
    show(i, false);
    if (scroll && id) { var t = D.getElementById(id); if (t && pages[i].id !== id) setTimeout(function () { t.scrollIntoView({ block: "start" }); }, 30); else if (t) t.scrollIntoView({ block: "start" }); }
  }
  window.addEventListener("hashchange", function () { fromHash(true); });
  window.addEventListener("popstate", function (e) { if (e.state && typeof e.state.aogpg === "number") show(e.state.aogpg, true); else fromHash(true); });
  new MutationObserver(function () { if (cur >= 0) show(cur, false); }).observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] });
  fromHash(false);
  window.aogPages = { go: go, pages: pages };
})();

/* AOG-PG-CHECKSEND-V1 (2026-09-26) — Jimmy: "If a student is using these, it would be nice if
   these quick check-ins still get sent and drawn up in the data chain to the teacher through
   the Google Sheet." Chapter reviews and the unit test already send; the three-question
   Check yourself under each lesson did not. Now, on a page opened with the teacher's ?dest=
   (the class link), each lesson's check sends ONE row the moment its last question is right —
   if a name is signed. With no name yet, a small name box appears under the check and sends on
   Sign. Same payload shape as the review send (series "course"), so turn-ins and the dashboard
   already draw it. A check sends once; answering again does not resend. */
(function () {
  var D = document, main = D.getElementById("main");
  if (!main || !main.querySelector(".checks .q")) return;
  if (/[?&]review=/.test(location.search)) return;   /* AOG-PG-REVIEW-V1: a reviewed copy is read, not worked */
  var DEST_RE = /^https:\/\/script\.google\.com\/[^\s]*\/exec$/, DEST = null;
  try { var dm = /[?&]dest=([^&]+)/.exec(location.search || "");
    if (dm) { var tt = decodeURIComponent(dm[1]).replace(/-/g, "+").replace(/_/g, "/"); while (tt.length % 4) tt += "=";
      var o = JSON.parse(atob(tt)); if (o && typeof o.u === "string" && DEST_RE.test(o.u)) DEST = { url: o.u, key: (typeof o.k === "string" ? o.k : "") }; } } catch (e) {}
  if (!DEST) { try { var cfg = window.AOG_SYNC_DEFAULTS;
    if (cfg && !cfg.destinations && typeof cfg.url === "string" && DEST_RE.test(cfg.url) && Object.prototype.toString.call(cfg.schools) === "[object Array]" && cfg.schools.length)
      DEST = { url: cfg.url, key: (typeof cfg.key === "string" ? cfg.key : "") }; } catch (e) {} }
  if (!DEST) return;
  /* the page keeps its own state private; its storage key is built the same way it builds it */
  var CO = window.AOG_COURSE || {}, KEYP = "aog.interior.ws.v1." + (CO.id || "x") + (CO.unit || "");
  var es = function () { return (D.documentElement.lang || "").indexOf("es") === 0; };
  function T(en, sp) { return es() ? sp : en; }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k) || ""; localStorage.setItem(k, v); } catch (e) {} return ""; }
  function who() { return (ls(KEYP + "who") || ls("aog.drops.who") || "").trim(); }
  function setWho(v) { ls(KEYP + "who", v); ls("aog.drops.who", v); try { localStorage.setItem("aog.dash2.student", JSON.stringify(v)); } catch (e) {} }
  function sent() { try { return JSON.parse(ls(KEYP + "chksent") || "{}") || {}; } catch (e) { return {}; } }
  function markSent(lid) { var s = sent(); s[lid] = new Date().toISOString(); ls(KEYP + "chksent", JSON.stringify(s));
    /* the student dashboard shows a tick on today's work once something from this page went */
    try { var f = location.pathname.replace(/^.*\//, ""), a = JSON.parse(localStorage.getItem("aog.dash2.sent") || "[]"); a.push({ f: f, at: s[lid] }); localStorage.setItem("aog.dash2.sent", JSON.stringify(a.slice(-200))); } catch (e) {} }
  function today() { var x = new Date(); return x.getFullYear() + "-" + ("0" + (x.getMonth() + 1)).slice(-2) + "-" + ("0" + x.getDate()).slice(-2); }
  /* read from the page itself: a right-marked choice means done; struck choices were first tries */
  function st(q) { var right = q.querySelector(".opt[data-st=\"right\"]"), tried = Array.prototype.map.call(q.querySelectorAll(".opt[data-st=\"tried\"]"), function (o) { return +o.getAttribute("data-i"); });
    if (!right && !tried.length) return null; return { done: !!right, tried: tried, first: right ? !tried.length : false }; }
  function optText(q, i) { var o = q.querySelector('.opt[data-i="' + i + '"] span:last-child'); return o ? o.textContent.trim() : ""; }
  function qText(q) { var e = q.querySelector(".qq"); if (!e) return ""; var c = e.cloneNode(true); var n = c.querySelector(".qn"); if (n) n.remove(); return c.textContent.trim(); }
  function box(c) {
    var b = c.querySelector(".aogchk"); if (b) return b;
    b = D.createElement("div"); b.className = "aogchk no-print"; b.setAttribute("aria-live", "polite");
    b.innerHTML = '<label><span>' + T("Your name or code", "Tu nombre o código") + '</span><input type="text" maxlength="40" autocomplete="off"></label><button type="button" class="btn solid">' + T("Sign and send", "Firmar y enviar") + '</button><p class="aogchk-st"></p>';
    c.appendChild(b);
    b.querySelector("button").addEventListener("click", function () { var v = b.querySelector("input").value.trim(); if (!v) { b.querySelector("input").focus(); return; } setWho(v); send(c, true); });
    return b;
  }
  function say(c, msg, keepForm) { var b = box(c); b.querySelector(".aogchk-st").textContent = msg; b.classList.toggle("done", !keepForm); }
  function send(c, force) {
    send.busy = send.busy || {};
    var lid = c.getAttribute("data-lesson") || "", qs = c.querySelectorAll(".q"), n = qs.length, k = 0, seen = 0, retry = 0, answers = [];
    Array.prototype.forEach.call(qs, function (q, j) { var s = st(q), a = +q.getAttribute("data-a");
      if (s && s.done) seen++; if (s && s.first) k++; if (s && s.first === false) retry++;
      var f = s ? (s.first ? a : (s.tried && s.tried.length ? s.tried[0] : null)) : null, it = { g: f === null ? "" : optText(q, f).slice(0, 120) };
      if (f !== null) { it.ok = !!(s && s.first); if (!it.ok) it.c = optText(q, a).slice(0, 120); }
      answers.push({ b: j + 1, s: T("Check yourself", "Compruébalo"), q: qText(q).slice(0, 240), a: [it] }); });
    if (seen < n) return; if ((sent()[lid] || send.busy[lid]) && !force) return;
    send.busy[lid] = 1;
    var nm = who(); if (!nm) { say(c, T("Done. Sign your name to send it to your teacher.", "Listo. Firma tu nombre para enviárselo a tu maestro."), true); return; }
    var les = c.closest(".les"), h4 = les && les.querySelector("h4"), ln = les && les.querySelector(".ln");
    var title = (ln ? ln.textContent.trim() + " " : "") + (h4 ? h4.textContent.trim() : lid);
    var payload = { action: "checkin", checkinType: "practice", _backendAuth: DEST.key, studentId: nm, timestamp: new Date().toISOString(), date: today(),
      activityId: "crs-" + CO.id + "-u" + CO.unit + "-chk-" + lid, activityName: title + " · " + T("Check yourself", "Compruébalo"), skill: CO.title || "",
      setNo: CO.unit, itemsTotal: n, independent: k, supported: retry, hintsUsed: "", confidence: "", source: "link",
      course: CO.id, unit: CO.unit, assessment: "lesson-check",
      extra: { series: "course", build: "check send v1", lang: es() ? "es" : "en", review: "chk-" + lid, lesson: title, firstTry: answers.map(function (a) { return a.a[0].ok === undefined ? null : (a.a[0].ok ? 1 : 0); }), answers: answers, correct: k, total: n } };
    if (window.AOG_IEP) { try { AOG_IEP.fill(payload, { correct: k, total: n, standards: "", byStrand: "", supports: es() ? ["spanish"] : [] }); } catch (e) {} }
    var body = JSON.stringify(payload);
    say(c, T("Sending…", "Enviando…"));
    function ok() { delete send.busy[lid]; markSent(lid); say(c, T("Sent to your teacher.", "Enviado a tu maestro.")); }
    function bad() { delete send.busy[lid]; say(c, T("Could not send. Tap to try again.", "No se pudo enviar. Toca para intentar de nuevo."), true); }
    fetch(DEST.url, { method: "POST", mode: "cors", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body })
      .then(function (r) { return r.json(); }).then(function (j) { if (j && j.ok) ok(); else bad(); })
      .catch(function () { fetch(DEST.url, { method: "POST", mode: "no-cors", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body }).then(ok).catch(bad); });
  }
  try { var cs = D.createElement("style"); cs.textContent =
    ".aogchk{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:end;margin:10px 0 0;padding:10px 12px;border:1px dashed var(--rule,#c9c2b3);border-radius:12px;font-size:.95rem}" +
    ".aogchk label{display:flex;flex-direction:column;gap:4px;flex:1 1 180px;font-weight:700}.aogchk input{font-size:16px;padding:8px 10px;border:1px solid var(--rule,#c9c2b3);border-radius:8px;min-height:44px}" +
    ".aogchk .aogchk-st{flex:1 1 100%;margin:0;font-weight:700}.aogchk.done label,.aogchk.done button{display:none}.aogchk:not(.done) .aogchk-st:empty{display:none}";
    (D.head || D.documentElement).appendChild(cs); } catch (e) {}
  /* every check whose questions are all done and never sent — now, and after each answer */
  function sweep() { Array.prototype.forEach.call(main.querySelectorAll(".checks"), function (c) { var lid = c.getAttribute("data-lesson") || ""; if (sent()[lid]) { say(c, T("Sent to your teacher.", "Enviado a tu maestro.")); return; } send(c, false); }); }
  D.addEventListener("click", function (ev) { if (ev.target.closest(".checks .opt")) setTimeout(sweep, 50); });
  sweep();
})();

/* AOG-PG-STRICTTEST-V1 (2026-09-26) — Jimmy, on whether a student should see the right answers
   before sending: "Sure on the tests." The UNIT TEST is now one shot: a student picks an answer
   for every question and sees nothing — no green, no strike, no Why — until they press Send
   (or "Check my test" when no teacher link is on the page). Then every question is marked, the
   key is shown beside a miss, and the score appears. Picks can be changed until then. Lesson
   checks and chapter reviews keep their try-again behaviour. Try again clears the test. */
(function () {
  var D = document, main = D.getElementById("main");
  if (!main) return;
  var r = main.querySelector('.review[data-kind="unit-test"]'); if (!r || !r.querySelector(".q")) return;
  if (/[?&]review=/.test(location.search)) return;   /* AOG-PG-REVIEW-V1: a reviewed copy is read, not worked */
  var DEST_RE = /^https:\/\/script\.google\.com\/[^\s]*\/exec$/, DEST = null;
  try { var dm = /[?&]dest=([^&]+)/.exec(location.search || "");
    if (dm) { var tt = decodeURIComponent(dm[1]).replace(/-/g, "+").replace(/_/g, "/"); while (tt.length % 4) tt += "=";
      var o = JSON.parse(atob(tt)); if (o && typeof o.u === "string" && DEST_RE.test(o.u)) DEST = { url: o.u, key: (typeof o.k === "string" ? o.k : "") }; } } catch (e) {}
  if (!DEST) { try { var cfg = window.AOG_SYNC_DEFAULTS;
    if (cfg && !cfg.destinations && typeof cfg.url === "string" && DEST_RE.test(cfg.url) && Object.prototype.toString.call(cfg.schools) === "[object Array]" && cfg.schools.length)
      DEST = { url: cfg.url, key: (typeof cfg.key === "string" ? cfg.key : "") }; } catch (e) {} }
  var CO = window.AOG_COURSE || {}, KEYP = "aog.interior.ws.v1." + (CO.id || "x") + (CO.unit || ""), rid = r.getAttribute("data-review") || "t";
  var SK = KEYP + "test:" + rid;
  var es = function () { return (D.documentElement.lang || "").indexOf("es") === 0; };
  function T(en, sp) { return es() ? sp : en; }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k) || ""; localStorage.setItem(k, v); } catch (e) {} return ""; }
  function who() { return (ls(KEYP + "who") || ls("aog.drops.who") || "").trim(); }
  function setWho(v) { ls(KEYP + "who", v); ls("aog.drops.who", v); try { localStorage.setItem("aog.dash2.student", JSON.stringify(v)); } catch (e) {} }
  function load() { try { return JSON.parse(ls(SK) || "{}") || {}; } catch (e) { return {}; } }
  var S = load(); S.picks = S.picks || {};
  function save() { ls(SK, JSON.stringify(S)); }
  function qs() { return r.querySelectorAll(".q"); }
  function optText(q, i) { var o = q.querySelector('.opt[data-i="' + i + '"] span:last-child'); return o ? o.textContent.trim() : ""; }
  function qText(q) { var e = q.querySelector(".qq"); if (!e) return ""; var c = e.cloneNode(true); var n = c.querySelector(".qn"); if (n) n.remove(); return c.textContent.trim(); }
  function today() { var x = new Date(); return x.getFullYear() + "-" + ("0" + (x.getMonth() + 1)).slice(-2) + "-" + ("0" + x.getDate()).slice(-2); }
  try { var cs = D.createElement("style"); cs.textContent =
    '.review[data-kind="unit-test"] .csend{display:none!important}' +
    '.review[data-kind="unit-test"]:not(.aogrev) [data-rscore],.review[data-kind="unit-test"]:not(.aogrev) [data-verdict]{visibility:hidden}' +
    '.review[data-kind="unit-test"] .opt[data-pick]{border-color:var(--navy-2,#1E3D62);box-shadow:inset 0 0 0 2px var(--navy-2,#1E3D62);font-weight:700}' +
    '.review[data-kind="unit-test"] .opt[data-pick] .l{background:var(--navy-2,#1E3D62);border-color:var(--navy-2,#1E3D62);color:#fff}' +
    '.aogtest{margin:14px 0 0;padding:14px;border:2px solid var(--navy-2,#1E3D62);border-radius:14px;display:flex;flex-wrap:wrap;gap:10px 12px;align-items:end}' +
    '.aogtest .aogtest-h{flex:1 1 100%;margin:0;font-weight:800}.aogtest .aogtest-n{flex:1 1 100%;margin:0;font-size:.95rem}' +
    '.aogtest label{display:flex;flex-direction:column;gap:4px;flex:1 1 200px;font-weight:700;font-size:.95rem}.aogtest input{font-size:16px;padding:9px 10px;border:1px solid var(--rule,#c9c2b3);border-radius:8px;min-height:44px}' +
    '.aogtest .aogtest-st{flex:1 1 100%;margin:0;font-weight:700}.aogtest .aogtest-st:empty{display:none}.review.aogrev .aogtest label,.review.aogrev .aogtest button{display:none}';
    (D.head || D.documentElement).appendChild(cs); } catch (e) {}
  var box = D.createElement("div"); box.className = "aogtest no-print";
  var foot = r.querySelector(".rfoot"); if (foot && foot.parentNode) foot.parentNode.insertBefore(box, foot); else r.appendChild(box);
  function paintBox() {
    var n = qs().length, k = Object.keys(S.picks).length;
    box.innerHTML = '<p class="aogtest-h">' + T("One shot: answer every question, then press the button.", "Una sola oportunidad: responde todas las preguntas y luego pulsa el botón.") + '</p>' +
      '<p class="aogtest-n">' + T("Answered", "Respondidas") + ": " + k + " / " + n + '</p>' +
      (DEST ? '<label><span>' + T("Your name or code", "Tu nombre o código") + '</span><input type="text" maxlength="40" autocomplete="off" value="' + who().replace(/"/g, "&quot;") + '"></label>' : "") +
      '<button type="button" class="btn solid">' + (DEST ? T("Send to my teacher", "Enviar a mi maestro") : T("Check my test", "Revisar mi prueba")) + '</button><p class="aogtest-st" aria-live="polite">' + (S.st || "") + '</p>';
    box.querySelector("button").addEventListener("click", submit);
  }
  function say(m) { S.st = m; save(); var e = box.querySelector(".aogtest-st"); if (e) e.textContent = m; }
  function paintPicks() { Array.prototype.forEach.call(qs(), function (q) { var id = q.getAttribute("data-q"), p = S.picks[id];
    Array.prototype.forEach.call(q.querySelectorAll(".opt"), function (o) { if (!S.revealed && +o.getAttribute("data-i") === p) o.setAttribute("data-pick", "1"); else o.removeAttribute("data-pick"); }); }); }
  function reveal() {
    var n = 0, k = 0;
    Array.prototype.forEach.call(qs(), function (q) { var a = +q.getAttribute("data-a"), p = S.picks[q.getAttribute("data-q")]; n++;
      Array.prototype.forEach.call(q.querySelectorAll(".opt"), function (o) { var i = +o.getAttribute("data-i"); o.disabled = true; o.removeAttribute("data-pick"); o.removeAttribute("data-st");
        if (i === a) o.setAttribute("data-st", "right"); else if (i === p) o.setAttribute("data-st", "tried"); });
      if (p === a) k++; var w = q.querySelector(".why"); if (w) w.hidden = false; var s = q.querySelector(".say"); if (s) s.textContent = (p === a) ? "" : T("Not this one — the right answer is marked.", "Esta no — la correcta está marcada."); });
    r.classList.add("aogrev");
    var sc = r.querySelector("[data-rscore]"); if (sc) sc.textContent = k + " / " + n;
    var v = r.querySelector("[data-verdict]"); if (v) { var pct = n ? k / n : 0; v.textContent = pct >= .9 ? T("Strong. You own this unit.", "Fuerte. Esta unidad es tuya.") : pct >= .7 ? T("Good — read the ones you missed.", "Bien — lee las que fallaste.") : T("Read the unit again, then try again.", "Vuelve a leer la unidad y prueba otra vez."); }
    return { k: k, n: n };
  }
  function submit() {
    var n = qs().length, k = Object.keys(S.picks).length;
    if (k < n) { say(T("Answer every question first.", "Responde primero todas las preguntas.")); return; }
    var nm = ""; if (DEST) { var inp = box.querySelector("input"); nm = inp ? inp.value.trim() : ""; if (!nm) { say(T("Enter your name first.", "Escribe primero tu nombre.")); if (inp) inp.focus(); return; } setWho(nm); }
    var answers = [], first = [], right = 0;
    Array.prototype.forEach.call(qs(), function (q, j) { var a = +q.getAttribute("data-a"), p = S.picks[q.getAttribute("data-q")], ok = p === a; if (ok) right++;
      var it = { g: optText(q, p).slice(0, 120), ok: ok }; if (!ok) it.c = optText(q, a).slice(0, 120);
      first.push(ok ? 1 : 0); answers.push({ b: j + 1, s: T("Unit test", "Examen de la unidad"), q: qText(q).slice(0, 240), a: [it] }); });
    S.revealed = true; S.revealedAt = new Date().toISOString(); save(); reveal();
    if (!DEST) { say(T("Checked. Your score is above.", "Revisado. Tu puntaje está arriba.")); return; }
    var payload = { action: "checkin", checkinType: "practice", _backendAuth: DEST.key, studentId: nm, timestamp: new Date().toISOString(), date: today(),
      activityId: "crs-" + CO.id + "-u" + CO.unit + "-" + rid, activityName: r.getAttribute("data-title") || "", skill: CO.title || "",
      setNo: CO.unit, itemsTotal: n, independent: right, supported: 0, hintsUsed: "", confidence: "", source: "link",
      course: CO.id, unit: CO.unit, assessment: "unit-test",
      extra: { series: "course", build: "strict test v1", lang: es() ? "es" : "en", review: rid, oneShot: true, firstTry: first, answers: answers, correct: right, total: n } };
    if (window.AOG_IEP) { try { AOG_IEP.fill(payload, { correct: right, total: n, standards: r.getAttribute("data-std") || "", byStrand: "", supports: es() ? ["spanish"] : [] }); } catch (e) {} }
    var body = JSON.stringify(payload); say(T("Sending…", "Enviando…"));
    function ok() { S.sentAt = new Date().toISOString(); save(); say(T("Sent. Your teacher has it.", "Enviado. Tu maestro lo tiene."));
      try { var f = location.pathname.replace(/^.*\//, ""), a = JSON.parse(localStorage.getItem("aog.dash2.sent") || "[]"); a.push({ f: f, at: S.sentAt }); localStorage.setItem("aog.dash2.sent", JSON.stringify(a.slice(-200))); } catch (e) {} }
    function bad() { say(T("Could not send. Your score is above; tell your teacher.", "No se pudo enviar. Tu puntaje está arriba; avisa a tu maestro.")); }
    fetch(DEST.url, { method: "POST", mode: "cors", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body })
      .then(function (x) { return x.json(); }).then(function (j) { if (j && j.ok) ok(); else bad(); })
      .catch(function () { fetch(DEST.url, { method: "POST", mode: "no-cors", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body }).then(ok).catch(bad); });
  }
  /* picks: caught before the page's own handler, so nothing is marked until the reveal */
  D.addEventListener("click", function (ev) {
    var o = ev.target.closest && ev.target.closest(".opt"); if (!o || !r.contains(o)) return;
    ev.stopPropagation(); ev.preventDefault(); if (S.revealed || o.disabled) return;
    var q = o.closest(".q"); S.picks[q.getAttribute("data-q")] = +o.getAttribute("data-i"); save(); paintPicks();
    var e = box.querySelector(".aogtest-n"); if (e) e.textContent = T("Answered", "Respondidas") + ": " + Object.keys(S.picks).length + " / " + qs().length;
  }, true);
  /* Try again clears the one shot; the page's own reset runs after this */
  D.addEventListener("click", function (ev) { var b = ev.target.closest && ev.target.closest(".reset-r"); if (!b || !r.contains(b)) return;
    S = { picks: {} }; save(); r.classList.remove("aogrev");
    Array.prototype.forEach.call(r.querySelectorAll(".opt"), function (o) { o.disabled = false; o.removeAttribute("data-pick"); o.removeAttribute("data-st"); });
    Array.prototype.forEach.call(r.querySelectorAll(".why"), function (w) { w.hidden = true; }); paintBox(); }, true);
  new MutationObserver(function () { if (!S.revealed) paintBox(); }).observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] });
  paintBox();
  if (S.revealed) { setTimeout(function () { reveal(); }, 0); } else paintPicks();
})();

/* AOG-PG-REVIEW-V1 (2026-09-26) — the Inbox's "See / Print the worksheet" for course units. The row
   carries the section (a chapter review, the unit test, or a lesson check) and the answer the student
   picked for each question; the page rebuilds itself around them: their pick marked right in green or
   struck in red with the key beside it, the Why open, a Reviewed copy banner, and the page turned to
   that section. ?print=1 prints it. Nothing here writes to the student's saved state. */
(function () {
  var D = document, m = /[?&]review=([^&]+)/.exec(location.search || ""); if (!m) return;
  var rv; try { var s = decodeURIComponent(m[1]).replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; rv = JSON.parse(decodeURIComponent(escape(atob(s)))); } catch (e) { return; }
  if (!rv || !rv.rid) return;
  var es = (D.documentElement.lang || "").indexOf("es") === 0, T = function (a, b) { return es ? b : a; };
  function run() {
    var sec = /^chk-/.test(rv.rid) ? D.querySelector('.checks[data-lesson="' + rv.rid.slice(4) + '"]') : D.querySelector('.review[data-review="' + rv.rid + '"]');
    if (!sec) return;
    var qs = sec.querySelectorAll(".q"), norm = function (x) { return String(x == null ? "" : x).replace(/\s+/g, " ").trim().toLowerCase(); }, right = 0, n = 0;
    Array.prototype.forEach.call(qs, function (q, j) {
      var a = +q.getAttribute("data-a"), opts = q.querySelectorAll(".opt"), g = rv.a ? rv.a[j] : null, pick = -1;
      if (g != null && g !== "") Array.prototype.forEach.call(opts, function (o, i) { var tx = o.querySelector("span:last-child"); if (pick < 0 && tx && norm(tx.textContent) === norm(g)) pick = i; });
      n++; if (pick === a) right++;
      Array.prototype.forEach.call(opts, function (o, i) { o.disabled = true; o.removeAttribute("data-st"); if (i === a) o.setAttribute("data-st", "right"); else if (i === pick) o.setAttribute("data-st", "tried"); });
      var w = q.querySelector(".why"); if (w) w.hidden = false;
      var say = q.querySelector(".say"); if (say) say.textContent = pick < 0 ? T("No answer given.", "Sin respuesta.") : (pick === a ? "" : T("Their pick is struck; the right answer is green.", "Su elección está tachada; la correcta está en verde."));
    });
    var rs = sec.querySelector("[data-rscore]"); if (rs) rs.textContent = right + " / " + n;
    var v = sec.querySelector("[data-verdict]"); if (v) v.textContent = "";
    var sc = sec.querySelector("[data-score]"); if (sc) sc.textContent = right + " / " + n;
    Array.prototype.forEach.call(sec.querySelectorAll(".csend, .aogchk, .aogtest, .reset-r"), function (e) { e.style.display = "none"; });
    D.body.classList.add("aog-reviewed");
    var b = D.createElement("div"); b.className = "aogrv no-print-keep";
    b.innerHTML = '<span><span class="k">' + T("Reviewed copy", "Copia revisada") + '</span><br><b>' + String(rv.who || "").replace(/[<>&]/g, "") + '</b></span><span><span class="k">' + T("Date", "Fecha") + '</span><br><b>' + String(rv.date || "").replace(/[<>&]/g, "") + '</b></span><span><span class="k">' + T("Score", "Puntaje") + '</span><br><b>' + right + " / " + n + '</b></span><span class="lg"><i class="g"></i>' + T("right", "correcta") + ' &nbsp; <i class="r"></i>' + T("their pick, when wrong", "su elección, si fue incorrecta") + '</span>';
    sec.insertBefore(b, sec.firstChild);
    try { var st = D.createElement("style"); st.textContent = '.aogrv{display:flex;flex-wrap:wrap;gap:14px 26px;align-items:end;border:2px solid var(--navy-2,#1E3D62);border-radius:12px;padding:10px 14px;margin:0 0 12px;font-size:.95rem}.aogrv .k{font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;opacity:.75}.aogrv .lg i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-1px;margin-right:4px}.aogrv .lg i.g{background:#1c7a3c}.aogrv .lg i.r{background:#b3261e}' +
      'body.aog-reviewed .opt[data-st="right"]{border-color:#1c7a3c!important;background:#e6f4ea!important;font-weight:700}body.aog-reviewed .opt[data-st="tried"]{opacity:1!important;border-color:#b3261e!important;background:#fbe9e7!important;text-decoration:line-through}body.aog-reviewed .opt[data-st="tried"] .l{background:#b3261e;border-color:#b3261e;color:#fff}' +
      '@media print{body.aog-reviewed .aogrv{border-color:#000}body.aog-reviewed .opt[data-st="right"]{color:#1c7a3c!important;border-color:#1c7a3c!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}body.aog-reviewed .opt[data-st="tried"]{color:#b3261e!important;border-color:#b3261e!important;text-decoration:line-through}body.aog-reviewed .aogpg-off,body.aog-reviewed .aog-rv-hide{display:none!important}body.aog-reviewed .review,body.aog-reviewed .checks{display:block!important}}';
      (D.head || D.documentElement).appendChild(st); } catch (e) {}
    /* on paper, only the reviewed section and its banner: every sibling on the way up is hidden */
    try { var node = sec; while (node && node !== D.body) { var par = node.parentElement; if (!par) break; Array.prototype.forEach.call(par.children, function (k) { if (k !== node && !/SCRIPT|STYLE|LINK/.test(k.tagName)) k.classList.add("aog-rv-hide"); }); node = par; } } catch (e) {}
    /* turn to that page */
    try { var P = window.aogPages; if (P && P.pages) { for (var i = 0; i < P.pages.length; i++) { if (P.pages[i].els.some(function (e) { return e === sec || e.contains(sec); })) { P.go(i); break; } } } } catch (e) {}
    try { sec.scrollIntoView({ block: "start" }); } catch (e) {}
    D.title = (rv.who ? rv.who + " · " : "") + D.title;
    if (/[?&]print=1/.test(location.search)) setTimeout(function () { try { window.print(); } catch (e) {} }, 700);
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", function () { setTimeout(run, 50); }); else setTimeout(run, 50);
})();
