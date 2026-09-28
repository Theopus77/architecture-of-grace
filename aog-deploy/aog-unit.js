/* ══ AOG-UNIT-V1 (2026-09-27) — ONE LESSON AT A TIME, WORKSHEETS, RESOURCES ══
   Jimmy: "I don't want one long scroll of chapter or unit. I also want
   worksheets and secondary resources provided for all subjects."
   Runs on every course unit page (<course>-u<N>.html, all subjects, past and
   future). It never touches the lesson words: it pages the lessons that are
   already there, adds a Worksheet built from each lesson's own words, and a
   short "More to explore" list under it. */
(function boot() {
  "use strict";
  if (window.__aogUnit) return;
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); return; }
  window.__aogUnit = 1;
  var D = document, CO = window.AOG_COURSE || {};
  if (!CO.id) return;
  var KEY = "aog.interior.ws.v1." + CO.id + CO.unit;
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function isEs() { var s = D.querySelector("[data-en][data-es]"); return !!(s && s.getAttribute("data-es") && s.textContent.trim() === s.getAttribute("data-es").trim() && s.getAttribute("data-es") !== s.getAttribute("data-en")); }
  function T(en, es) { return isEs() ? es : en; }
  function sp(en, es) { return '<span data-en="' + esc(en) + '" data-es="' + esc(es) + '">' + esc(T(en, es)) + "</span>"; }

  /* ── 1. the pages come from aog-pages.js (one section per page, Back / Next). A link to
     #ws-<lesson id> opens that lesson's page and its worksheet. ── */
  var PAGES = Array.prototype.slice.call(D.querySelectorAll("article.les"));
  if (!PAGES.length) return;
  function fromHash() {
    var m = /^#ws-(.+)$/.exec(location.hash || ""); if (!m) return;
    var les = D.getElementById(m[1]); if (!les || !les.classList.contains("les")) return;
    try { var P = window.aogPages; if (P && P.pages) for (var i = 0; i < P.pages.length; i++) if (P.pages[i].els.some(function (e) { return e.contains(les); })) { P.go(i); break; } } catch (e) {}
    var box = les.querySelector(".aog-ws"); if (!box || box.hidden) openWs(les);
  }
  window.addEventListener("hashchange", fromHash);
  setTimeout(fromHash, 0);

  /* ── 2. a Worksheet for every lesson, built from the lesson's own words ── */
  var DEST = null, DEST_RE = /^https:\/\/script\.google\.com\/[^\s]*\/exec$/;
  try {
    var dm = /[?&]dest=([^&]+)/.exec(location.search || "");
    if (dm) { var t = decodeURIComponent(dm[1]).replace(/-/g, "+").replace(/_/g, "/"); while (t.length % 4) t += "="; var o = JSON.parse(atob(t)); if (o && typeof o.u === "string" && DEST_RE.test(o.u)) DEST = { url: o.u, key: o.k || "" }; }
  } catch (e) {}
  if (!DEST) { try { var cfg = window.AOG_SYNC_DEFAULTS; if (cfg && !cfg.destinations && typeof cfg.url === "string" && DEST_RE.test(cfg.url) && Object.prototype.toString.call(cfg.schools) === "[object Array]" && cfg.schools.length) DEST = { url: cfg.url, key: cfg.key || "" }; } catch (e) {} }
  function saved() { try { return JSON.parse(ls(KEY + "ws") || "{}") || {}; } catch (e) { return {}; } }
  function txt(el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; }
  function lessonBits(les) {
    var mi = les.querySelector(".main-idea"); var miT = mi ? txt(mi).replace(/^(Main idea|Idea principal)\s*/i, "") : "";
    var words = Array.prototype.map.call(les.querySelectorAll(".words dt"), function (dt) { var dd = dt.nextElementSibling; return { w: txt(dt), d: txt(dd) }; });
    var qs = Array.prototype.map.call(les.querySelectorAll(".checks .qq"), function (q) { return txt(q).replace(/^\d+\.\s*/, ""); });
    var look = les.querySelector(".look");
    return { title: txt(les.querySelector(".lh h4")), n: txt(les.querySelector(".lh .ln")), mi: miT, words: words, qs: qs.slice(0, 3), lookT: look ? txt(look.querySelector("h5")) : "", lookP: look ? txt(look.querySelector(".prompt")) : "", cite: look ? txt(look.querySelector(".cite")) : "" };
  }
  function wsHtml(les, b) {
    var lid = les.getAttribute("data-lid") || les.id, S = saved()[lid] || {}, k = 0;
    function part(en, es, inner) { k++; return '<div class="part"><h6><span class="n">' + k + "</span>" + sp(en, es) + "</h6>" + inner + "</div>"; }
    function ta(name, ph) { return '<textarea name="' + name + '" placeholder="' + esc(ph) + '">' + esc(S[name] || "") + "</textarea>"; }
    var h = '<h5>' + sp("Worksheet", "Hoja de trabajo") + ": " + esc(b.n ? b.n + " " : "") + esc(b.title) + "</h5><p class=\"sub\">" + sp("Write in your own words. Short answers are fine.", "Escribe con tus palabras. Las respuestas cortas están bien.") + "</p>";
    h += '<div class="row"><div><label>' + sp("Date", "Fecha") + '</label><input name="date" value="' + esc(S.date || "") + '"></div></div>';
    if (b.words.length) h += part("Words to know", "Palabras clave", b.words.map(function (w, i) { return '<div class="wq"><p class="def">' + esc(w.d) + '</p><input name="w' + i + '" data-word="' + esc(w.w) + '" placeholder="' + esc(T("Which word is this?", "¿Qué palabra es?")) + '" value="' + esc(S["w" + i] || "") + '"><span class="mark"></span></div>'; }).join("") + '<button type="button" class="chkw" style="min-height:44px;margin-top:6px;border-radius:10px;border:1.5px solid var(--rule,#C9C2B2);background:var(--field-2,#F4F0E6);color:inherit;padding:0 14px;font:700 15px system-ui,sans-serif;cursor:pointer">' + sp("Check my words", "Revisar mis palabras") + "</button>");
    h += part("The main idea, in my own words", "La idea principal, con mis palabras", '<p class="sub">' + esc(b.mi) + "</p>" + ta("mi", T("Say it your way.", "Dilo a tu manera.")));
    if (b.qs.length) h += part("Answer in a sentence", "Responde con una oración", b.qs.map(function (q, i) { return '<div class="wq"><p>' + (i + 1) + ". " + esc(q) + "</p>" + ta("q" + i, T("Your answer", "Tu respuesta")) + "</div>"; }).join(""));
    if (b.lookP) h += part("Look again", "Mira otra vez", '<div class="wq"><p>' + esc(b.lookT ? b.lookT + " — " : "") + esc(b.lookP) + "</p>" + ta("look", T("What do you notice?", "¿Qué notas?")) + "</div>");
    h += part("Show what you learned", "Muestra lo que aprendiste", '<p class="sub">' + sp("Draw it, map it, or list it on paper. Then tell it here in one or two lines.", "Dibújalo, haz un mapa o una lista en papel. Luego cuéntalo aquí en una o dos líneas.") + '</p><div class="pad" aria-hidden="true"></div>' + ta("show", T("What I made", "Lo que hice")));
    /* AOG-WS-MODEL-V1 (2026-09-28) — the Daily Drafts order at the end of the sheet: check my work, the name
       line, then a small Send box right under it. Screen only; the printed copy has its own Name / Date line. */
    h += '<div class="aog-ws-check no-print"><span class="aog-ws-k">' + sp("Check my work", "Revisa mi trabajo") + '</span><button type="button" class="chkall">' + sp("Check my work", "Revisar mi trabajo") + '</button><span class="chkres" aria-live="polite"></span></div>';
    h += '<div class="aog-ws-sig no-print"><label for="who-' + esc(lid) + '">' + sp("Name", "Nombre") + '</label><input id="who-' + esc(lid) + '" name="who" placeholder="' + esc(T("Enter your name", "Escribe tu nombre")) + '" value="' + esc(ls(KEY + "who") || "") + '"><p class="aog-ws-note">' + sp("Sign with your name or class code. Use the same one every time.", "Firma con tu nombre o tu código de clase. Usa siempre el mismo.") + '</p></div>';
    if (DEST) h += '<div class="aog-ws-send no-print"><p class="aog-ws-snote">' + sp("Your answers go to your teacher when you tap Send. Tap to send again.", "Tus respuestas le llegan a tu maestro cuando tocas Enviar. Toca para enviarlo otra vez.") + '</p><button type="button" class="go">' + sp("Send to my teacher", "Enviar a mi maestro") + '</button><p class="st" aria-live="polite"></p></div>';
    else h += '<p class="st" aria-live="polite"></p>';
    h += '<div class="btns no-print"><button type="button" class="pr">' + sp("Print", "Imprimir") + '</button><button type="button" class="cl">' + sp("Clear", "Borrar") + '</button></div>';
    return h;
  }
  function today() { var x = new Date(); return x.getFullYear() + "-" + ("0" + (x.getMonth() + 1)).slice(-2) + "-" + ("0" + x.getDate()).slice(-2); }
  function openWs(les) {
    var box = les.querySelector(".aog-ws");
    if (box) { box.hidden = !box.hidden; les.querySelector(".aog-wsbtn").setAttribute("aria-pressed", box.hidden ? "false" : "true"); if (!box.hidden) box.scrollIntoView({ block: "start" }); return; }
    var b = lessonBits(les), lid = les.getAttribute("data-lid") || les.id;
    box = D.createElement("div"); box.className = "aog-ws"; box.id = "ws-" + lid; box.setAttribute("data-dest", DEST ? "1" : "0");
    box.innerHTML = wsHtml(les, b);
    var body = les.querySelector(".body") || les; body.appendChild(box);
    les.querySelector(".aog-wsbtn").setAttribute("aria-pressed", "true");
    var st = box.querySelector(".st");
    function fields() { var o = {}; Array.prototype.forEach.call(box.querySelectorAll("input[name],textarea[name]"), function (f) { o[f.name] = f.value; }); return o; }
    var sT; box.addEventListener("input", function () {
      if (sT) clearTimeout(sT);
      sT = setTimeout(function () { var all = saved(); all[lid] = fields(); ls(KEY + "ws", JSON.stringify(all)); var who = box.querySelector('[name="who"]').value.trim(); if (who) ls(KEY + "who", who); }, 300);
    });
    /* Check my work: marks the words (as "Check my words" does) and says which parts are still empty */
    box.querySelector(".chkall").onclick = function () {
      var cw = box.querySelector(".chkw"); if (cw) cw.onclick();
      var right = 0, words = 0, empty = 0;
      Array.prototype.forEach.call(box.querySelectorAll("input[data-word]"), function (f) { words++; if (f.value.trim().toLowerCase() === f.getAttribute("data-word").toLowerCase()) right++; });
      Array.prototype.forEach.call(box.querySelectorAll("textarea[name]"), function (f) { if (!f.value.trim()) empty++; });
      var m = (words ? T("Words: ", "Palabras: ") + right + " / " + words + ". " : "") + (empty ? T("Parts still empty: ", "Partes vacías: ") + empty + "." : T("Every part has an answer.", "Cada parte tiene respuesta."));
      box.querySelector(".chkres").textContent = m;
      var first = box.querySelector(".mark.no") || Array.prototype.filter.call(box.querySelectorAll("textarea[name]"), function (f) { return !f.value.trim(); })[0];
      if (first) { var t = first.previousElementSibling && first.classList.contains("mark") ? first.previousElementSibling : first; try { t.focus({ preventScroll: true }); t.scrollIntoView({ block: "center" }); } catch (e) {} }
    };
    var cwb = box.querySelector(".chkw"); if (cwb) cwb.onclick = function () {
      Array.prototype.forEach.call(box.querySelectorAll("input[data-word]"), function (f) {
        var m = f.nextElementSibling, ok = f.value.trim().toLowerCase() === f.getAttribute("data-word").toLowerCase();
        m.className = "mark " + (ok ? "ok" : "no"); m.textContent = f.value.trim() ? (ok ? "✓" : T("try again", "inténtalo otra vez")) : "";
      });
    };
    box.querySelector(".cl").onclick = function () {
      if (!confirm(T("Clear this worksheet?", "¿Borrar esta hoja?"))) return;
      Array.prototype.forEach.call(box.querySelectorAll('textarea[name],input[data-word],input[name="date"]'), function (f) { f.value = ""; });
      var all = saved(); delete all[lid]; ls(KEY + "ws", JSON.stringify(all)); st.textContent = "";
    };
    box.querySelector(".pr").onclick = function () { printWs(les, b, fields()); };
    var go = box.querySelector(".go");
    if (go) go.onclick = function () {
      var f = fields(), who = (f.who || "").trim();
      if (!who) { st.textContent = T("Enter your name first.", "Escribe primero tu nombre."); box.querySelector('[name="who"]').focus(); return; }
      var ans = [], n = 0, k = 0;
      b.words.forEach(function (w, i) { n++; var ok = (f["w" + i] || "").trim().toLowerCase() === w.w.toLowerCase(); if (ok) k++; ans.push({ q: T("Word: ", "Palabra: ") + w.d, a: f["w" + i] || "", ok: ok, key: w.w }); });
      [["mi", b.mi]].concat(b.qs.map(function (q, i) { return ["q" + i, q]; })).concat(b.lookP ? [["look", b.lookP]] : []).concat([["show", T("Show what you learned", "Muestra lo que aprendiste")]]).forEach(function (pr) { n++; if ((f[pr[0]] || "").trim()) k++; ans.push({ q: pr[1], a: f[pr[0]] || "" }); });
      if (k < n) { st.textContent = T("Fill in every part first.", "Completa primero cada parte."); return; }
      var payload = { action: "checkin", checkinType: "practice", _backendAuth: DEST.key, studentId: who, timestamp: new Date().toISOString(), date: today(),
        activityId: "crs-" + CO.id + "-u" + CO.unit + "-ws-" + lid, activityName: T("Worksheet", "Hoja de trabajo") + ": " + (b.n ? b.n + " " : "") + b.title, skill: CO.title || "",
        setNo: CO.unit, itemsTotal: n, independent: k, supported: 0, hintsUsed: "", confidence: "", source: "link", course: CO.id, unit: CO.unit, assessment: "worksheet",
        extra: { series: "course", build: "unit ws v1", lang: isEs() ? "es" : "en", review: "ws-" + lid, answers: ans, correct: k, total: n } };
      st.textContent = T("Sending…", "Enviando…"); go.disabled = true;
      fetch(DEST.url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw 0; st.className = "st done"; st.textContent = T("Sent. Your teacher has it.", "Enviado. Tu maestro ya lo tiene."); })
        .catch(function () { st.textContent = T("It did not send. Check the connection and try again.", "No se envió. Revisa la conexión e inténtalo otra vez."); go.disabled = false; });
    };
    box.scrollIntoView({ block: "start" });
  }
  function printWs(les, b, f) {
    var lines = function (n) { var s = ""; for (var i = 0; i < n; i++) s += '<div class="ln"></div>'; return s; };
    var h = "<h1>" + esc(T("Worksheet", "Hoja de trabajo")) + ": " + esc((b.n ? b.n + " " : "") + b.title) + "</h1><p class=\"sub\">" + esc(D.title.replace(/ — .*$/, "")) + "</p>";
    h += '<div class="fields">' + esc(T("Name", "Nombre")) + " <span>" + esc(f.who || "") + "</span> " + esc(T("Date", "Fecha")) + " <span>" + esc(f.date || "") + "</span></div>";
    var k = 0; function part(t, inner) { k++; return "<section><h2>" + k + ". " + esc(t) + "</h2>" + inner + "</section>"; }
    if (b.words.length) h += part(T("Words to know", "Palabras clave"), b.words.map(function (w, i) { return "<p><i>" + esc(w.d) + "</i><br>" + esc(T("Word", "Palabra")) + ": <span class=\"bl\">" + esc(f["w" + i] || "") + "</span></p>"; }).join(""));
    h += part(T("The main idea, in my own words", "La idea principal, con mis palabras"), "<p><i>" + esc(b.mi) + "</i></p>" + (f.mi ? "<p>" + esc(f.mi) + "</p>" : lines(3)));
    if (b.qs.length) h += part(T("Answer in a sentence", "Responde con una oración"), b.qs.map(function (q, i) { return "<p>" + (i + 1) + ". " + esc(q) + "</p>" + (f["q" + i] ? "<p>" + esc(f["q" + i]) + "</p>" : lines(2)); }).join(""));
    if (b.lookP) h += part(T("Look again", "Mira otra vez"), "<p>" + esc(b.lookP) + "</p>" + (f.look ? "<p>" + esc(f.look) + "</p>" : lines(2)));
    h += part(T("Show what you learned", "Muestra lo que aprendiste"), (f.show ? "<p>" + esc(f.show) + "</p>" : "") + '<div class="pad"></div>');
    var doc = "<!doctype html><html><head><meta charset=\"utf-8\"><title>" + esc(b.title) + "</title><style>body{font:15px/1.45 Georgia,serif;color:#000;margin:28px}h1{font-size:20px;margin:0 0 4px}h2{font:bold 15px sans-serif;margin:16px 0 6px}.sub{font:13px sans-serif;color:#333;margin:0 0 12px}.fields{display:flex;gap:28px;font:14px sans-serif;margin:0 0 14px}.fields span{border-bottom:1px solid #000;min-width:190px;display:inline-block;padding:0 4px}.bl{border-bottom:1px solid #000;min-width:160px;display:inline-block;padding:0 4px}.ln{border-bottom:1px solid #9a9a9a;height:26px}.pad{border:1px solid #9a9a9a;border-radius:8px;height:140px;margin-top:8px}p{margin:4px 0}section{break-inside:avoid;page-break-inside:avoid;margin:0 0 6px}h2{border-bottom:1px solid #ccc;padding-bottom:3px;break-after:avoid}@page{margin:14mm}</style></head><body>" + h + "</body></html>";
    var fr = D.createElement("iframe"); fr.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0"; D.body.appendChild(fr);
    var w = fr.contentWindow; w.document.open(); w.document.write(doc); w.document.close();
    setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} setTimeout(function () { fr.remove(); }, 1500); }, 250);
  }

  /* ── 3. More to explore: the lesson's own source, then places to look further ── */
  var SITES = {
    kids: ["Britannica Kids", "https://kids.britannica.com/search?query="],
    simple: ["Simple English Wikipedia", "https://simple.wikipedia.org/w/index.php?search="],
    loc: ["Library of Congress", "https://www.loc.gov/search/?q="],
    khan: ["Khan Academy", "https://www.khanacademy.org/search?page_search_query="],
    nasa: ["NASA", "https://www.nasa.gov/?search="],
    pbs: ["PBS LearningMedia", "https://www.pbslearningmedia.org/search/?q="],
    guten: ["Project Gutenberg (free books)", "https://www.gutenberg.org/ebooks/search/?query="],
    si: ["Smithsonian", "https://www.si.edu/search/collection-images?edan_q="],
    sd: ["SpanishDict", "https://www.spanishdict.com/translate/"],
    sefaria: ["Sefaria (Hebrew texts)", "https://www.sefaria.org/search?q="],
    bg: ["Bible Gateway", "https://www.biblegateway.com/quicksearch/?quicksearch="],
    quran: ["Quran.com", "https://quran.com/search?q="],
    inv: ["Investopedia", "https://www.investopedia.com/search?q="]
  };
  var BY = { ela: ["kids", "guten", "khan"], mth: ["khan", "kids", "pbs"], sci: ["nasa", "pbs", "kids"], ush: ["loc", "si", "kids"], ssc: ["loc", "kids", "si"], spa: ["sd", "kids", "khan"], fcs: ["kids", "pbs", "khan"],
    rel: ["kids", "simple", "sefaria"], eco: ["khan", "inv", "kids"], bib: ["bg", "kids", "simple"], heb: ["sefaria", "bg", "kids"], qur: ["quran", "kids", "simple"], tal: ["sefaria", "kids", "simple"] };
  var picks = BY[CO.id] || ["kids", "simple", "khan"];
  PAGES.forEach(function (les) {
    if (!les.classList.contains("les")) return;
    var b = lessonBits(les), bt = les.querySelector(".lbtns");
    if (bt) {
      var w = D.createElement("button"); w.type = "button"; w.className = "lbtn aog-wsbtn"; w.setAttribute("aria-pressed", "false");
      w.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>' + sp("Worksheet", "Hoja de trabajo");
      w.addEventListener("click", function () { openWs(les); });
      bt.appendChild(w);
    }
    var m = D.createElement("aside"); m.className = "aog-more no-print";
    var q = encodeURIComponent(b.title);
    m.innerHTML = '<div class="k">' + sp("More to explore", "Para explorar más") + "</div><ul>" + (b.cite ? '<li class="src">' + sp("Source in this lesson: ", "Fuente de esta lección: ") + esc(b.cite) + "</li>" : "") +
      picks.map(function (id) { var s = SITES[id]; return '<li class="srch"><a href="' + s[1] + q + '" target="_blank" rel="noopener">' + esc(s[0]) + ": " + esc(b.title) + "</a></li>"; }).join("") + "</ul>";
    var body = les.querySelector(".body") || les; body.appendChild(m);
  });
  /* ── 4. AOG-SOURCES-V1 — Jimmy: "Make sure primary sources are provided throughout the
     material with actual links." Every citation the page can read becomes a link to the
     original text; each lesson's More-to-explore box leads with "Read the original". ── */
  var BIBLE = "Genesis Exodus Leviticus Numbers Deuteronomy Joshua Judges Ruth 1_Samuel 2_Samuel 1_Kings 2_Kings 1_Chronicles 2_Chronicles Ezra Nehemiah Esther Job Psalm Psalms Proverbs Ecclesiastes Song_of_Songs Song_of_Solomon Isaiah Jeremiah Lamentations Ezekiel Daniel Hosea Joel Amos Obadiah Jonah Micah Nahum Habakkuk Zephaniah Haggai Zechariah Malachi Matthew Mark Luke John Acts Romans 1_Corinthians 2_Corinthians Galatians Ephesians Philippians Colossians 1_Thessalonians 2_Thessalonians 1_Timothy 2_Timothy Titus Philemon Hebrews James 1_Peter 2_Peter 1_John 2_John 3_John Jude Revelation".split(" ").map(function (b) { return b.replace(/_/g, " "); });
  var TRACT = "Berakhot Peah Shabbat Eruvin Pesachim Yoma Sukkah Beitzah Rosh_Hashanah Taanit Ta'anit Megillah Moed_Katan Chagigah Hagigah Yevamot Ketubot Nedarim Nazir Sotah Gittin Kiddushin Bava_Kamma Bava_Metzia Bava_Batra Sanhedrin Makkot Shevuot Avodah_Zarah Horayot Zevachim Menachot Chullin Bekhorot Arakhin Temurah Keritot Meilah Tamid Niddah Kelim Yadayim Eduyot Avot".split(" ").map(function (b) { return b.replace(/_/g, " "); });
  var BOOKS = [
    [/Wealth of Nations/i, "Adam Smith, The Wealth of Nations", "Wealth of Nations Adam Smith"],
    [/Ricardo|Principles of Political Economy/i, "David Ricardo, Principles", "Ricardo Principles of Political Economy"],
    [/Douglass/i, "Narrative of the Life of Frederick Douglass", "Narrative of the Life of Frederick Douglass"],
    [/Principia/i, "Isaac Newton, Principia", "Newton Principia"],
    [/Dhammapada/i, "The Dhammapada (Müller)", "Dhammapada"],
    [/Analects/i, "The Analects (Legge)", "Analects Confucius"],
    [/Daodejing|Tao Te Ching|Tao Teh King/i, "The Daodejing (Legge)", "Tao Teh King"],
    [/Bhagavad Gita/i, "The Bhagavad Gita", "Bhagavad Gita"],
    [/Upanishad/i, "The Upanishads", "Upanishads"],
    [/Darwin|Origin of Species/i, "Darwin, On the Origin of Species", "Origin of Species Darwin"],
    [/Federalist/i, "The Federalist Papers", "Federalist Papers"],
    [/Walden|Thoreau/i, "Thoreau", "Thoreau"],
    [/Uncle Tom/i, "Uncle Tom's Cabin", "Uncle Tom's Cabin"]];
  var GOV = [
    [/Declaration of Independence/i, "https://www.archives.gov/founding-docs/declaration-transcript", "The Declaration of Independence (National Archives)"],
    [/Bill of Rights|First Amendment|Amendment/i, "https://www.archives.gov/founding-docs/bill-of-rights-transcript", "The Bill of Rights (National Archives)"],
    [/Constitution of the United States|U\.S\. Constitution|US Constitution|Constitution, Art/i, "https://www.archives.gov/founding-docs/constitution-transcript", "The U.S. Constitution (National Archives)"],
    [/Emancipation Proclamation/i, "https://www.archives.gov/exhibits/featured-documents/emancipation-proclamation/transcript.html", "The Emancipation Proclamation (National Archives)"],
    [/Gettysburg/i, "https://www.loc.gov/resource/rbpe.24404500/", "The Gettysburg Address (Library of Congress)"],
    [/Universal Declaration of Human Rights/i, "https://www.un.org/en/about-us/universal-declaration-of-human-rights", "Universal Declaration of Human Rights (United Nations)"],
    [/NASA/i, "https://nssdc.gsfc.nasa.gov/planetary/factsheet/", "NASA planetary fact sheets"],
    [/Census/i, "https://www.census.gov/library/publications.html", "U.S. Census Bureau publications"],
    [/Bureau of Labor Statistics|BLS/i, "https://www.bls.gov/", "U.S. Bureau of Labor Statistics"],
    [/Federal Reserve|FRED/i, "https://fred.stlouisfed.org/", "FRED, Federal Reserve Bank of St. Louis"],
    [/Pew/i, "https://www.pewresearch.org/religion/", "Pew Research Center"]];
  function sourceLink(txt) {
    var t = String(txt || "").replace(/&#x27;|’/g, "'").replace(/\s+/g, " ").trim();
    if (!t || /made-up|written for this lesson|built for this lesson|counted for this lesson from the/i.test(t) && !/Genesis|Qur|Talmud|Mishnah/.test(t)) {
      if (!/counted for this lesson from ([A-Z])/.test(t)) return null;
    }
    var m, jps = /JPS|Jewish Publication/i.test(t);
    m = /Qur'?an[^0-9]*(\d{1,3}):(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?/i.exec(t);
    if (m) return { url: "https://quran.com/" + m[1] + "/" + m[2] + (m[3] ? "-" + m[3] : ""), label: "Qur'an " + m[1] + ":" + m[2] + (m[3] ? "–" + m[3] : "") + " on Quran.com" };
    m = /(?:Mishnah\s+)?(?:Pirkei\s+)?Avot\s+(\d+):(\d+)/i.exec(t);
    if (m) return { url: "https://www.sefaria.org/Pirkei_Avot." + m[1] + "." + m[2], label: "Pirkei Avot " + m[1] + ":" + m[2] + " on Sefaria" };
    m = /Mishnah\s+([A-Z][A-Za-z' ]+?)\s+(\d+):(\d+)/.exec(t);
    if (m && TRACT.indexOf(m[1].trim()) > -1) return { url: "https://www.sefaria.org/Mishnah_" + m[1].trim().replace(/'/g, "").replace(/ /g, "_") + "." + m[2] + "." + m[3], label: "Mishnah " + m[1].trim() + " " + m[2] + ":" + m[3] + " on Sefaria" };
    for (var i = 0; i < TRACT.length; i++) {
      var re = new RegExp("(?:Talmud,?\\s*)?\\b" + TRACT[i].replace(/'/g, "'?") + "\\s+(\\d{1,3})([ab])\\b");
      m = re.exec(t);
      if (m) { var tr = TRACT[i].replace(/'/g, "").replace(/ /g, "_").replace(/^Hagigah$/, "Chagigah"); return { url: "https://www.sefaria.org/" + tr + "." + m[1] + m[2], label: TRACT[i] + " " + m[1] + m[2] + " (Talmud) on Sefaria" }; }
    }
    for (var j = 0; j < BIBLE.length; j++) {
      var bre = new RegExp("(?:^|[^A-Za-z])(" + BIBLE[j].replace(/ /g, "\\s+") + ")(?:\\s*\\([^)]*\\))?\\s+(\\d{1,3}(?::\\d{1,3})?(?:\\s*[-–]\\s*\\d{1,3}(?::\\d{1,3})?)?)");
      m = bre.exec(t);
      if (m) {
        var ref = (BIBLE[j] === "Psalm" ? "Psalms" : BIBLE[j]) + " " + m[2].replace(/\s+/g, "").replace("–", "-");
        if (jps && j < 39) return { url: "https://www.sefaria.org/" + ref.replace(/ (?=\d)/, ".").replace(/ /g, "_").replace(/:/g, ".") , label: ref + " (Tanakh) on Sefaria" };
        var ver = /ASV|American Standard/i.test(t) ? "ASV" : /WEB|World English/i.test(t) ? "WEB" : "KJV";
        return { url: "https://www.biblegateway.com/passage/?search=" + encodeURIComponent(ref) + "&version=" + ver, label: ref + " (" + ver + ") on Bible Gateway" };
      }
    }
    for (var g = 0; g < GOV.length; g++) if (GOV[g][0].test(t)) return { url: GOV[g][1], label: GOV[g][2] };
    for (var k = 0; k < BOOKS.length; k++) if (BOOKS[k][0].test(t)) return { url: "https://www.gutenberg.org/ebooks/search/?query=" + encodeURIComponent(BOOKS[k][2]), label: BOOKS[k][1] + " (free on Project Gutenberg)" };
    m = /counted for this lesson from ([^,]+),\s*([^,]+)/.exec(t);
    if (!m && /\b1[0-9]{3}\b|\b20[0-2][0-9]\b/.test(t) && !/made-up|example|written for this lesson|built for this lesson|counted for this lesson/i.test(t)) {
      var q = t.replace(/\([^)]*\)/g, "").replace(/[“”"]/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
      if (/^(ela|spa)$/.test(CO.id)) return { url: "https://www.gutenberg.org/ebooks/search/?query=" + encodeURIComponent(q), label: q + " (Project Gutenberg)" };
      return { url: "https://www.loc.gov/search/?q=" + encodeURIComponent(q), label: q + " (Library of Congress)" };
    }
    if (m) return { url: "https://www.gutenberg.org/ebooks/search/?query=" + encodeURIComponent(m[1] + " " + m[2]), label: m[2].trim() + ", " + m[1].trim() + " (Project Gutenberg)" };
    return null;
  }
  function linkify(el) {
    if (!el || el.querySelector("a")) return null;
    var L = sourceLink(el.textContent); if (!L) return null;
    var a = D.createElement("a"); a.href = L.url; a.target = "_blank"; a.rel = "noopener"; a.className = "aog-srclink";
    a.title = T("Read the original", "Leer el original") + ": " + L.label;
    while (el.firstChild) a.appendChild(el.firstChild);
    a.appendChild(D.createTextNode(" ↗")); el.appendChild(a);
    return L;
  }
  PAGES.forEach(function (les) {
    var found = [];
    Array.prototype.forEach.call(les.querySelectorAll(".look cite, .look .cite, .source cite"), function (c) { var L = linkify(c); if (L) found.push(L); });
    var more = les.querySelector(".aog-more ul");
    if (more && found.length) {
      var seen = {}, html = "";
      found.forEach(function (L) { if (seen[L.url]) return; seen[L.url] = 1; html += '<li><a href="' + esc(L.url) + '" target="_blank" rel="noopener">' + sp("Read the original", "Leer el original") + ": " + esc(L.label) + "</a></li>"; });
      var src = more.querySelector(".src"); if (src) src.remove();
      more.insertAdjacentHTML("afterbegin", html);
    }
  });
  /* reviews, stories and chapter openers carry sources too */
  Array.prototype.forEach.call(D.querySelectorAll("section.review .look cite, article.story cite, .chap .look cite"), linkify);

  /* ── 5. AOG-RESOURCES-V1 — the lesson's "More to explore" draws on the Resource
     library (aog-resources.json): 2–3 resources whose topics or title share words
     with the lesson, kept to the unit's grade band. The search links stay only
     when nothing in the library fits. "Read the original" stays first. ── */
  var LIB = { mth: "math", sci: "science", ssc: "social-studies", ush: "social-studies", ela: "english", spa: "spanish", fcs: "facs", eco: "economics",
    rel: "religions", bib: "bible", heb: "hebrew-bible", qur: "quran", tal: "talmud" }[CO.id];
  function useLib() {
    var R = window.aogResources; if (!R || !LIB) return;
    var md = D.querySelector('meta[name="description"]'), band = R.bandOf((md && md.content) || "") || R.bandOf(D.title);
    R.load().then(function (data) {
      if (!data) return;
      PAGES.forEach(function (les) {
        var ul = les.querySelector(".aog-more ul"); if (!ul || ul.querySelector(".lib")) return;
        var b = lessonBits(les);
        var text = [b.title, b.title, b.mi, b.words.map(function (w) { return w.w; }).join(" ")].join(" ");
        var got = R.pick(data, LIB, text, band, 3);
        if (got.length < 2) got = R.pick(data, LIB, text + " " + (CO.title || "") + " " + (CO.title || ""), band, 3);
        if (!got.length) return;
        Array.prototype.forEach.call(ul.querySelectorAll("li.srch"), function (li) { li.remove(); });
        ul.insertAdjacentHTML("beforeend", got.map(function (it) {
          return '<li class="lib"><a href="' + esc(it.url) + '" target="_blank" rel="noopener">' + esc(it.title) + "</a> <span class=\"org\">(" + esc(it.org) + ")</span> — " + esc(it.note) + "</li>";
        }).join(""));
      });
    });
  }
  if (window.aogResources) useLib();
  else if (LIB) { var rs = D.createElement("script"); rs.src = "/aog-resources.js"; rs.defer = true; rs.onload = useLib; D.head.appendChild(rs); }


})();
