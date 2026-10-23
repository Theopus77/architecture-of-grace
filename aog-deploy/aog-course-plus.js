/* ══ AOG-COURSE-PLUS-V1 (2026-10-23) — what every course unit page adds for the learner and the teacher ═══════════════
   Jimmy: "DO them all … This should be showstopper for the young to the old." Calm first: everything here is closed or
   still until someone taps it. No timer, no loop, no sound, no score shown for review.

   1. Where I left off: the last lesson touched in each course is kept on this device (aog.course.trail.v1), so
      /my-learning can offer one "Pick up where I left off" button per course.
   2. Three from before: every check, review and test question answered here is kept (aog.course.again.v1, at most 240,
      on this device only), with a day it is due again. A question missed on the first try comes back the next day; one
      answered right comes back after 3, 7, 21, then 60 days. Near the top of the unit, "Three from before" (closed) asks
      up to three that are due, from this course. Nothing is scored or sent.
   3. Show what you know, your way: in the wrap-up a menu chooses Write it (the box that was there), Say it (record on
      this device), Draw it (a drawing pad) or Make it (a practice room, then a few words). Writing and Make it can go to
      the teacher the way the tests do; a recording or a drawing is saved as a file to show.
   4. Teach it tomorrow: in "For the teacher", a link to the one-page plan for this unit (/teach?c=<course>&u=<N>).
   Loaded with defer by every unit page that build_course.py writes (the line marked AOG-COURSE-PLUS-V1), and by /my-learning,
   which uses only the review engine (window.AOG_AGAIN) and the styles. */
(function () {
  "use strict";
  var CO = window.AOG_COURSE || {};
  var ON = !!(CO.id && CO.unit);   /* a course unit page; elsewhere (/my-learning) only the shared review engine */
  var D = document, H = D.documentElement;
  var K_TRAIL = "aog.course.trail.v1", K_AGAIN = "aog.course.again.v1", MAX_AGAIN = 240, DAY = 864e5;
  function lang() { return (H.getAttribute("lang") || "en").toLowerCase().indexOf("es") === 0 ? "es" : "en"; }
  function T(en, es) { return lang() === "es" ? es : en; }
  function $$(sel, root) { return Array.prototype.slice.call((root || D).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function rd(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function unitTitle() { var h = D.querySelector(".spread h2.ut"); return h ? h.textContent.trim() : ""; }
  function courseTitle() { var k = D.querySelector("header.mast .k span"); return k ? k.textContent.replace(/^The Interior — |^El Interior — /, "").trim() : CO.id; }
  /* words that follow the language: data-en / data-es leaves, painted here and by the page's own paintLang */
  function W(en, es) { return '<span data-en="' + esc(en) + '" data-es="' + esc(es) + '">' + esc(lang() === "es" ? es : en) + "</span>"; }

  var st = D.createElement("style");
  st.textContent = [
    ".aogp-box{margin:18px 0 0;border:1.5px solid var(--rule);border-radius:16px;background:var(--field);box-shadow:var(--lift-sm)}",
    ".aogp-box>summary{cursor:pointer;list-style:none;min-height:52px;display:flex;align-items:center;gap:10px;padding:10px 16px;font-weight:700}",
    ".aogp-box>summary::-webkit-details-marker{display:none}",
    ".aogp-box>summary .s{font-weight:600;color:var(--ink-soft);font-size:.92rem}",
    ".aogp-box .in{padding:4px 16px 16px}",
    ".aogp-q{margin:0 0 12px;padding:10px 12px 12px;border-radius:12px;background:var(--field-2);border:1px solid var(--rule-soft)}",
    ".aogp-q .from{font:700 .7rem var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft);margin:0 0 4px}",
    ".aogp-q .qq{font-weight:700;margin:0 0 8px;line-height:1.4}",
    ".aogp-q ul{display:grid;gap:6px;margin:0;padding:0;list-style:none}",
    ".aogp-o{min-height:44px;width:100%;text-align:left;padding:9px 12px;border:1px solid var(--rule);border-radius:10px;background:var(--field);color:var(--ink);cursor:pointer;font:inherit;font-size:.97rem;line-height:1.35}",
    ".aogp-o[data-st=right]{border-color:var(--good);background:var(--good-wash);font-weight:700}",
    ".aogp-o[data-st=tried]{opacity:.55}",
    ".aogp-q .say{font-size:.93rem;margin:8px 0 0;color:var(--ink);line-height:1.45}",
    ".aogp-q .say a{font-weight:700}",
    ".aogp-way{margin:10px 0 12px;padding:12px 0 0;border-top:1px dashed var(--paper-line,var(--rule))}",
    ".aogp-way h3{font-size:1.02rem;margin:0 0 .4em}",
    ".aogp-way label.pick{display:grid;gap:6px;font-weight:700;font-size:.92rem;color:var(--ink-soft);max-width:360px}",
    ".aogp-way select{min-height:48px;border:1px solid var(--rule);border-radius:12px;background:var(--field);color:var(--ink);padding:8px 12px;font:inherit;font-size:16px}",
    ".aogp-pane{margin-top:12px}",
    ".aogp-pane p{margin:.3em 0;color:var(--ink-soft);font-size:.95rem}",
    ".aogp-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px}",
    ".aogp-pad{display:block;width:100%;height:auto;aspect-ratio:8/5;background:#FFFFFF;border:1px solid var(--rule);border-radius:12px;touch-action:none;cursor:crosshair}",
    ".aogp-pane textarea{width:100%;min-height:140px;padding:12px 14px;border:1px solid var(--rule);border-radius:12px;background:var(--field);color:var(--ink);font:16px/1.6 var(--serif)}",
    ".aogp-pane .doors{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0}",
    ".aogp-pane .doors a{display:inline-flex;align-items:center;min-height:44px;padding:8px 14px;border:1px solid var(--rule);border-radius:999px;background:var(--field-2);color:var(--ink);font:600 .9rem var(--sans);text-decoration:none}",
    ".aogp-swatch{min-width:44px;min-height:44px;border-radius:999px;border:2px solid var(--rule);cursor:pointer}",
    ".aogp-swatch[aria-pressed=true]{outline:3px solid var(--focus);outline-offset:2px}",
    ".aogp-st{font-size:.92rem;color:var(--ink)}",
    ".aogp-send{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px}",
    ".aogp-send input{flex:1 1 180px;min-height:44px;padding:6px 10px;border:1px solid var(--rule);border-radius:10px;background:var(--field);color:var(--ink);font:inherit;font-size:16px}",
    "#write textarea[hidden],#write .wfoot[hidden]{display:none}",
    "@media print{.aogp-box,.aogp-way,.aogp-send{display:none!important}}"
  ].join("");
  D.head.appendChild(st);

  /* ── 1. where I left off ── */
  function remember(lid, title) {
    var t = rd(K_TRAIL, {}) || {};
    t[CO.id] = { u: CO.unit, lid: lid || "", lt: title || "", ut: unitTitle(), ct: courseTitle(), p: location.pathname.replace(/^\//, "") || "", ts: Date.now() };
    wr(K_TRAIL, t);
  }
  D.addEventListener("click", function (ev) {
    if (!ON) return;
    var a = ev.target.closest && ev.target.closest("article.les[data-lid]");
    if (a) { var h = a.querySelector(".lh h4"); remember(a.getAttribute("data-lid"), h ? h.textContent.trim() : ""); }
  });

  /* ── 2. every question answered here, kept for later ── */
  function qText(q) { var e = q.querySelector(".qq"); if (!e) return ""; var c = e.cloneNode(true), n = c.querySelector(".qn"); if (n) n.remove(); return c.textContent.trim(); }
  function whyText(q) { var w = q.querySelector(".why"); if (!w) return ""; var c = w.cloneNode(true), b = c.querySelector("b"); if (b) b.remove(); return c.textContent.trim(); }
  D.addEventListener("click", function (ev) {
    if (!ON) return;
    var o = ev.target.closest && ev.target.closest(".q[data-q] .opt"); if (!o) return;
    var q = o.closest(".q");
    /* the page has already answered it (its handler runs first): one picked, so this was the first try */
    var tried = q.querySelectorAll('.opt[data-st="tried"]').length, right = q.querySelector('.opt[data-st="right"]');
    if (tried + (right ? 1 : 0) !== 1) return;
    var ok = !!right, key = CO.id + ":" + CO.unit + ":" + q.getAttribute("data-q");
    var les = q.closest("article.les"), rev = q.closest(".review");
    var here = les ? "#" + les.id : rev && rev.id ? "#" + rev.id : "";
    var A = rd(K_AGAIN, []) || [];
    A = A.filter(function (x) { return x.k !== key; });
    A.push({ k: key, c: CO.id, ct: courseTitle(), ut: unitTitle(), q: qText(q),
      o: $$(".opt span:last-child", q).map(function (s) { return s.textContent.trim(); }),
      a: +q.getAttribute("data-a"), w: whyText(q), h: (location.pathname.replace(/^\//, "") || "") + here,
      t: Date.now(), n: 0, due: Date.now() + (ok ? 3 * DAY : 20 * 36e5) });
    if (A.length > MAX_AGAIN) {               /* let go of the ones answered right longest ago first */
      A.sort(function (x, y) { return (x.n > 0 || x.due - x.t > DAY ? 0 : 1) - (y.n > 0 || y.due - y.t > DAY ? 0 : 1) || x.t - y.t; });
      A = A.slice(A.length - MAX_AGAIN);
    }
    wr(K_AGAIN, A);
  });

  /* Three from before: the shared engine is window.AOG_AGAIN, so /my-learning asks the same way */
  var GAPS = [3, 7, 21, 60];
  function due(course) {
    var now = Date.now();
    return (rd(K_AGAIN, []) || []).filter(function (x) { return x.due <= now && (!course || x.c === course); })
      .sort(function (x, y) { return x.due - y.due; }).slice(0, 3);
  }
  function settle(key, firstOk) {
    var A = rd(K_AGAIN, []) || [];
    A.forEach(function (x) {
      if (x.k !== key) return;
      if (firstOk) { x.due = Date.now() + GAPS[Math.min(x.n, GAPS.length - 1)] * DAY; x.n++; }
      else { x.due = Date.now() + DAY; x.n = 0; }
    });
    wr(K_AGAIN, A);
  }
  function askHtml(items, showCourse) {
    return items.map(function (x, i) {
      return '<div class="aogp-q" data-k="' + esc(x.k) + '" data-a="' + x.a + '"><p class="from">' + esc((showCourse ? x.ct + " · " : "") + x.ut) + '</p><p class="qq">' + esc(x.q) + "</p><ul>" +
        x.o.map(function (c, j) { return '<li><button type="button" class="aogp-o" data-i="' + j + '">' + esc(c) + "</button></li>"; }).join("") +
        '</ul><p class="say" aria-live="polite"></p></div>';
    }).join("");
  }
  function wireAsk(root, items) {
    root.addEventListener("click", function (ev) {
      var b = ev.target.closest(".aogp-o"); if (!b || b.disabled) return;
      var q = b.closest(".aogp-q"), a = +q.getAttribute("data-a"), i = +b.getAttribute("data-i"), key = q.getAttribute("data-k");
      var x = items.filter(function (y) { return y.k === key; })[0] || {};
      var first = !q.hasAttribute("data-tried");
      q.setAttribute("data-tried", "1");
      if (i === a) {
        b.setAttribute("data-st", "right");
        $$(".aogp-o", q).forEach(function (o) { o.disabled = true; });
        if (!q.hasAttribute("data-done")) { q.setAttribute("data-done", "1"); settle(key, first); }
        q.querySelector(".say").innerHTML = esc((first ? T("Yes. ", "Sí. ") : T("That's it. ", "Eso es. ")) + (x.w || "")) +
          (x.h ? ' <a href="/' + esc(x.h) + '">' + esc(T("Back to the lesson", "Volver a la lección")) + "</a>" : "");
      } else {
        b.setAttribute("data-st", "tried"); b.disabled = true;
        q.querySelector(".say").textContent = T("Not that one. Try another.", "Esa no. Prueba otra.");
      }
    });
  }
  window.AOG_AGAIN = { due: due, html: askHtml, wire: wireAsk };
  if (!ON) return;

  /* inside the unit overview (aog-pages.js shows a unit one page at a time; this stays on its first page) */
  var tl = D.querySelector(".intro .lead");
  var mine = due(CO.id);
  if (tl && mine.length) {
    var box = D.createElement("details");
    box.className = "aogp-box no-print"; box.id = "before";
    box.innerHTML = "<summary>" + W("Three from before", "Tres de antes") + ' <span class="s">' +
      W("A few questions from lessons you did earlier. Just for you; nothing is scored.", "Unas preguntas de lecciones que ya hiciste. Solo para ti; no cuenta como nota.") + '</span></summary><div class="in"></div>';
    tl.appendChild(box);
    box.addEventListener("toggle", function () {
      if (!box.open || box.hasAttribute("data-built")) return;
      box.setAttribute("data-built", "1");
      var inn = box.querySelector(".in"); inn.innerHTML = askHtml(mine, false); wireAsk(inn, mine);
    });
  }

  /* ── 3. show what you know, your way ── */
  var write = D.getElementById("write");
  if (write) {
    var WAYS = [["write", "Write it", "Escríbelo"], ["say", "Say it", "Dilo"], ["draw", "Draw it", "Dibújalo"], ["make", "Make it", "Constrúyelo"]];
    /* inside the writing task, so it is one page with it; Write it is the box that was always there */
    var way = D.createElement("div");
    way.className = "aogp-way no-print"; way.id = "your-way";
    way.innerHTML = "<h3>" + W("Show what you know, your way", "Muestra lo que sabes, a tu manera") + "</h3>" +
      '<label class="pick">' + W("How do you want to show it?", "¿Cómo quieres mostrarlo?") +
      '<select id="aogpWay">' + WAYS.map(function (w) { return '<option value="' + w[0] + '" data-en="' + w[1] + '" data-es="' + w[2] + '">' + (lang() === "es" ? w[2] : w[1]) + "</option>"; }).join("") + "</select></label>" +
      '<div class="aogp-pane" data-way="say" hidden></div><div class="aogp-pane" data-way="draw" hidden></div><div class="aogp-pane" data-way="make" hidden></div>';
    var ta0 = D.getElementById("writeBox"), mine0 = [ta0, write.querySelector(".wfoot")].filter(Boolean);
    write.insertBefore(way, ta0 ? (D.querySelector('label[for="writeBox"]') || ta0) : null);
    var sel = way.querySelector("#aogpWay"), built = {};
    sel.addEventListener("change", function () {
      var v = sel.value;
      mine0.forEach(function (e) { e.hidden = v !== "write"; });
      var sr = write.querySelector('.aogp-send[data-send="write"]'); if (sr) sr.parentNode.hidden = v !== "write";
      $$(".aogp-pane", way).forEach(function (p) { p.hidden = p.getAttribute("data-way") !== v; });
      if (v !== "write" && !built[v]) { built[v] = 1; ({ say: buildSay, draw: buildDraw, make: buildMake })[v](way.querySelector('.aogp-pane[data-way="' + v + '"]')); }
      if (v !== "say") stopRec();
    });
  }
  function prompt() { var p = D.querySelector("#write .wp"); return p ? p.textContent.trim() : ""; }
  function fileName(kind, ext) { return (CO.id + "-unit" + CO.unit + "-" + kind + "." + ext); }
  function saveBlob(blob, name) {
    var a = D.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  /* Say it: the microphone opens only on Record and closes on Stop, on leaving the tab, or on the Studio's hush */
  var rec = null, recStream = null, recChunks = [], recUrl = null;
  function stopRec() {
    try { if (rec && rec.state !== "inactive") rec.stop(); } catch (e) {}
    if (recStream) { recStream.getTracks().forEach(function (t) { t.stop(); }); recStream = null; }
  }
  D.addEventListener("visibilitychange", function () { if (D.hidden) stopRec(); });
  window.addEventListener("aog-hush", function (e) { if (e.detail && e.detail.on) stopRec(); });
  function buildSay(p) {
    if (!(navigator.mediaDevices && window.MediaRecorder)) {
      p.innerHTML = "<p>" + W("This device can't record here. Try Write it, or record on another device.", "Este aparato no puede grabar aquí. Prueba Escríbelo, o graba en otro aparato.") + "</p>"; return;
    }
    p.innerHTML = "<p>" + W("Say your answer out loud. Use the question above to help you. The recording stays on this device.", "Di tu respuesta en voz alta. Usa la pregunta de arriba como ayuda. La grabación se queda en este aparato.") + "</p>" +
      '<div class="aogp-row"><button type="button" class="btn btn-a" data-r="go">' + W("● Record", "● Grabar") + '</button><button type="button" class="btn" data-r="stop" disabled>' + W("■ Stop", "■ Parar") + "</button>" +
      '<button type="button" class="btn" data-r="save" disabled>' + W("Save the recording", "Guardar la grabación") + '</button><span class="aogp-st" aria-live="polite"></span></div><audio controls hidden style="margin-top:10px;width:100%"></audio>';
    var go = p.querySelector('[data-r="go"]'), stop = p.querySelector('[data-r="stop"]'), save = p.querySelector('[data-r="save"]'), au = p.querySelector("audio"), stx = p.querySelector(".aogp-st"), blob = null;
    go.addEventListener("click", function () {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
        recStream = s; recChunks = [];
        rec = new MediaRecorder(s);
        rec.ondataavailable = function (e) { if (e.data && e.data.size) recChunks.push(e.data); };
        rec.onstop = function () {
          go.disabled = false; stop.disabled = true;
          if (recStream) { recStream.getTracks().forEach(function (t) { t.stop(); }); recStream = null; }
          if (!recChunks.length) return;
          blob = new Blob(recChunks, { type: rec.mimeType || "audio/webm" });
          if (recUrl) URL.revokeObjectURL(recUrl);
          recUrl = URL.createObjectURL(blob); au.src = recUrl; au.hidden = false; save.disabled = false;
          stx.textContent = T("Done. Play it back, then save it to show your teacher.", "Listo. Escúchala y guárdala para mostrársela a tu maestro.");
        };
        rec.start(); go.disabled = true; stop.disabled = false;
        stx.textContent = T("Recording…", "Grabando…");
      }).catch(function () { stx.textContent = T("The microphone is off. You can turn it on in the browser's settings.", "El micrófono está apagado. Puedes encenderlo en los ajustes del navegador."); });
    });
    stop.addEventListener("click", stopRec);
    save.addEventListener("click", function () { if (blob) saveBlob(blob, fileName("said", /mp4/.test(blob.type) ? "m4a" : "webm")); });
  }

  /* Draw it: an SVG pad (no canvas on the page, so the page keeps its size); kept on this device as you draw */
  function buildDraw(p) {
    var KEY = "aog.course.draw.v1." + CO.id + CO.unit, strokes = rd(KEY, []) || [], color = "#1D2733";
    var COLORS = [["#1D2733", "Black", "Negro"], ["#1B5FA8", "Blue", "Azul"], ["#A8323A", "Red", "Rojo"], ["#2E6B4F", "Green", "Verde"]];
    p.innerHTML = "<p>" + W("Draw what you learned. Add labels if they help.", "Dibuja lo que aprendiste. Pon nombres si te ayudan.") + "</p>" +
      '<svg class="aogp-pad" viewBox="0 0 800 500" role="img" aria-label="Drawing pad"></svg>' +
      '<div class="aogp-row">' + COLORS.map(function (c, i) { return '<button type="button" class="aogp-swatch" data-c="' + c[0] + '" style="background:' + c[0] + '" aria-pressed="' + (i ? "false" : "true") + '" aria-label="' + c[1] + '" title="' + c[1] + '"></button>'; }).join("") +
      '<button type="button" class="btn" data-d="undo">' + W("Undo", "Deshacer") + '</button><button type="button" class="btn" data-d="clear">' + W("Clear", "Borrar todo") + "</button>" +
      '<button type="button" class="btn btn-a" data-d="save">' + W("Save the picture", "Guardar el dibujo") + "</button></div>";
    var svg = p.querySelector("svg"), NS = "http://www.w3.org/2000/svg", cur = null;
    function pathD(pts) { return pts.length ? "M" + pts.map(function (q) { return q[0] + " " + q[1]; }).join(" L") : ""; }
    function paint() {
      svg.innerHTML = "";
      strokes.forEach(function (s) {
        var e = D.createElementNS(NS, "path"); e.setAttribute("d", pathD(s.p)); e.setAttribute("stroke", s.c);
        e.setAttribute("stroke-width", "5"); e.setAttribute("fill", "none"); e.setAttribute("stroke-linecap", "round"); e.setAttribute("stroke-linejoin", "round");
        svg.appendChild(e); s.el = e;
      });
    }
    function at(ev) { var r = svg.getBoundingClientRect(); return [Math.round((ev.clientX - r.left) * 800 / r.width), Math.round((ev.clientY - r.top) * 500 / r.height)]; }
    function keep() { wr(KEY, strokes.map(function (s) { return { c: s.c, p: s.p }; })); }
    svg.addEventListener("pointerdown", function (ev) {
      ev.preventDefault(); try { svg.setPointerCapture(ev.pointerId); } catch (e) {}
      cur = { c: color, p: [at(ev)] }; strokes.push(cur); paint();
    });
    svg.addEventListener("pointermove", function (ev) {
      if (!cur) return; var q = at(ev), l = cur.p[cur.p.length - 1];
      if (Math.abs(q[0] - l[0]) + Math.abs(q[1] - l[1]) < 3) return;
      cur.p.push(q); cur.el.setAttribute("d", pathD(cur.p));
    });
    function end() { if (cur) { cur = null; keep(); } }
    svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
    p.addEventListener("click", function (ev) {
      var sw = ev.target.closest(".aogp-swatch");
      if (sw) { color = sw.getAttribute("data-c"); $$(".aogp-swatch", p).forEach(function (b) { b.setAttribute("aria-pressed", b === sw ? "true" : "false"); }); return; }
      var b = ev.target.closest("[data-d]"); if (!b) return;
      var k = b.getAttribute("data-d");
      if (k === "undo") { strokes.pop(); paint(); keep(); }
      else if (k === "clear") { strokes = []; paint(); keep(); }
      else if (k === "save") {
        var c = D.createElement("canvas"); c.width = 1600; c.height = 1000;   /* never put on the page */
        var g = c.getContext("2d"); g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, 1600, 1000); g.lineCap = g.lineJoin = "round"; g.lineWidth = 10;
        strokes.forEach(function (s) { g.strokeStyle = s.c; g.beginPath(); s.p.forEach(function (q, i) { g[i ? "lineTo" : "moveTo"](q[0] * 2, q[1] * 2); }); if (s.p.length === 1) g.lineTo(s.p[0][0] * 2 + .1, s.p[0][1] * 2); g.stroke(); });
        g.fillStyle = "#1D2733"; g.font = "28px sans-serif"; g.fillText(courseTitle() + " · " + unitTitle(), 24, 970);
        c.toBlob(function (bl) { if (bl) saveBlob(bl, fileName("drawing", "png")); }, "image/png");
      }
    });
    paint();
  }

  /* Make it: the unit's practice rooms, then a few words about what was made */
  function buildMake(p) {
    var doors = $$(".rooms .door").map(function (a) { return '<a href="' + esc(a.getAttribute("href")) + '" target="_blank" rel="noopener">' + esc(a.textContent) + " ›</a>"; }).join("");
    var KEY = "aog.course.make.v1." + CO.id + CO.unit, v = "";
    try { v = localStorage.getItem(KEY) || ""; } catch (e) {}
    p.innerHTML = "<p>" + W("Make something that shows what you learned: in a room on this site, or with your hands. Then tell about it here.", "Haz algo que muestre lo que aprendiste: en una sala de este sitio, o con tus manos. Luego cuéntalo aquí.") + "</p>" +
      (doors ? '<div class="doors">' + doors + "</div>" : "") +
      '<label class="vh" for="aogpMake">' + W("What you made", "Lo que hiciste") + "</label>" +
      '<textarea id="aogpMake" placeholder="' + esc(T("What did you make? What does it show?", "¿Qué hiciste? ¿Qué muestra?")) + '"></textarea>' + sendRow("make");
    var ta = p.querySelector("textarea"); ta.value = v;
    ta.addEventListener("input", function () { try { localStorage.setItem(KEY, ta.value); } catch (e) {} });
    wireSend(p, "make", function () { return ta.value.trim(); });
  }

  /* sending, by the same rules every sender on the site keeps: a ?dest= link first, then the site's connected sheet */
  var DEST = (function () {
    var RE = /^https:\/\/script\.google\.com\/[^\s]*\/exec$/;
    try {
      var dm = /[?&]dest=([^&]+)/.exec(location.search || "");
      if (dm) { var t = decodeURIComponent(dm[1]).replace(/-/g, "+").replace(/_/g, "/"); while (t.length % 4) t += "=";
        var o = JSON.parse(atob(t)); if (o && typeof o.u === "string" && RE.test(o.u)) return { url: o.u, key: typeof o.k === "string" ? o.k : "" }; }
    } catch (e) {}
    try { var c = window.AOG_SYNC_DEFAULTS;
      if (c && !c.destinations && typeof c.url === "string" && RE.test(c.url) && Object.prototype.toString.call(c.schools) === "[object Array]" && c.schools.length)
        return { url: c.url, key: typeof c.key === "string" ? c.key : "" }; } catch (e) {}
    return null;
  })();
  function sendRow(kind) {
    if (!DEST) return "";
    return '<div class="aogp-send" data-send="' + kind + '"><input type="text" class="who" autocomplete="off" aria-label="Enter your name" placeholder="' + esc(T("Enter your name", "Escribe tu nombre")) + '">' +
      '<button type="button" class="btn">' + W("Send to my teacher", "Enviar a mi maestro") + '</button><span class="aogp-st" aria-live="polite"></span></div>';
  }
  function wireSend(root, kind, getText) {
    var row = root.querySelector('.aogp-send[data-send="' + kind + '"]'); if (!row) return;
    var inp = row.querySelector(".who"), btn = row.querySelector("button"), stx = row.querySelector(".aogp-st"), whoKey = "aog.interior.ws.v1." + CO.id + CO.unit + "who";
    try { inp.value = localStorage.getItem(whoKey) || ""; } catch (e) {}
    btn.addEventListener("click", function () {
      var who = inp.value.trim(), text = getText();
      if (!who) { stx.textContent = T("Enter your name first.", "Escribe primero tu nombre."); inp.focus(); return; }
      if (!text) { stx.textContent = T("Write a few words first.", "Escribe primero unas palabras."); return; }
      try { localStorage.setItem(whoKey, who); } catch (e) {}
      var x = new Date(), day = x.getFullYear() + "-" + ("0" + (x.getMonth() + 1)).slice(-2) + "-" + ("0" + x.getDate()).slice(-2);
      var body = JSON.stringify({ action: "checkin", checkinType: "practice", _backendAuth: DEST.key, studentId: who, timestamp: x.toISOString(), date: day,
        activityId: "crs-" + CO.id + "-u" + CO.unit + "-" + kind, activityName: "Unit " + CO.unit + " · show what you know (" + kind + ")", skill: CO.title || "",
        setNo: CO.unit, itemsTotal: "", independent: "", supported: "", source: "link", course: CO.id, unit: CO.unit, assessment: "show-" + kind,
        extra: { series: "course", build: "course plus v1", lang: lang(), way: kind, prompt: prompt().slice(0, 600), text: text.slice(0, 6000) } });
      btn.disabled = true; stx.textContent = T("Sending…", "Enviando…");
      function ok() { btn.disabled = false; stx.textContent = T("Sent. Your teacher has it.", "Enviado. Tu maestro lo tiene."); }
      function bad() { btn.disabled = false; stx.textContent = T("Could not send. Try again.", "No se pudo enviar. Inténtalo otra vez."); }
      fetch(DEST.url, { method: "POST", mode: "cors", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body })
        .then(function (r) { return r.json(); }).then(function (j) { if (j && j.ok) ok(); else bad(); })
        .catch(function () { fetch(DEST.url, { method: "POST", mode: "no-cors", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body }).then(ok).catch(bad); });
    });
  }
  /* the writing box that was always there can now be sent too */
  if (write && DEST) {
    var wf = write.querySelector(".wfoot");
    if (wf) {
      var holder = D.createElement("div"); holder.className = "no-print"; holder.innerHTML = sendRow("write");
      wf.parentNode.insertBefore(holder, wf.nextSibling);
      wireSend(holder, "write", function () { var b = D.getElementById("writeBox"); return b ? b.value.trim() : ""; });
    }
  }

  /* ── 4. teach it tomorrow ── */
  var teach = D.querySelector("details.teach .inner");
  if (teach) {
    var tp = D.createElement("p");
    tp.innerHTML = '<a href="/teach?c=' + encodeURIComponent(CO.id) + "&u=" + CO.unit + '" style="font-weight:700">' + W("Teach it tomorrow: a ready plan for this unit ›", "Enséñalo mañana: un plan listo para esta unidad ›") + "</a>";
    teach.insertBefore(tp, teach.firstChild);
  }
})();
