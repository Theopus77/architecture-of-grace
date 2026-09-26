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
    + "@media print{.aogpg-off{display:block!important}.aogpg-bar{display:none!important}html.aogpg-one .aogpg-off{display:none!important}}";
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
      + '<select aria-label="' + (es() ? "Ir a una página" : "Go to a page") + '">' + pages.map(function (p, k) { return '<option value="' + k + '"' + (k === i ? " selected" : "") + ">" + (k + 1) + ". " + label(p) + "</option>"; }).join("") + '</select><button type="button" class="pp">' + (es() ? "Imprimir esta página" : "Print this page") + "</button></div>"
      + '<button type="button" class="next"' + (N ? "" : " disabled") + "><span>" + (es() ? "Siguiente" : "Next") + " ›</span><small>" + (N ? label(N) : "") + "</small></button>";
    var anchor = pages[i].els[pages[i].els.length - 1];
    anchor.parentNode.insertBefore(bar, anchor.nextSibling);
    if (i === pages.length - 1 && pager2) main.insertBefore(bar, pager2);
    bar.querySelector(".prev").onclick = function () { go(cur - 1); };
    bar.querySelector(".next").onclick = function () { go(cur + 1); };
    bar.querySelector("select").onchange = function () { go(+this.value); };
    /* Jimmy: "Section printing should be an option." Prints only the page on screen. */
    bar.querySelector(".pp").onclick = function () {
      D.documentElement.classList.add("aogpg-one");
      var off = function () { D.documentElement.classList.remove("aogpg-one"); window.removeEventListener("afterprint", off); };
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
    var lid = c.getAttribute("data-lesson") || "", qs = c.querySelectorAll(".q"), n = qs.length, k = 0, seen = 0, retry = 0, answers = [];
    Array.prototype.forEach.call(qs, function (q, j) { var s = st(q), a = +q.getAttribute("data-a");
      if (s && s.done) seen++; if (s && s.first) k++; if (s && s.first === false) retry++;
      var f = s ? (s.first ? a : (s.tried && s.tried.length ? s.tried[0] : null)) : null, it = { g: f === null ? "" : optText(q, f).slice(0, 120) };
      if (f !== null) { it.ok = !!(s && s.first); if (!it.ok) it.c = optText(q, a).slice(0, 120); }
      answers.push({ b: j + 1, s: T("Check yourself", "Compruébalo"), q: qText(q).slice(0, 240), a: [it] }); });
    if (seen < n) return; if (sent()[lid] && !force) return;
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
    function ok() { markSent(lid); say(c, T("Sent to your teacher.", "Enviado a tu maestro.")); }
    function bad() { say(c, T("Could not send. Tap to try again.", "No se pudo enviar. Toca para intentar de nuevo."), true); }
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
