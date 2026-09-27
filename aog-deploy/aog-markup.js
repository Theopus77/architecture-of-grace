/* ══ AOG-MARKUP-V1 (2026-09-27) — HIGHLIGHTS AND NOTES ON EVERY READING PAGE ══
   Jimmy: "Very interactive text books I want … INTERACTIVE TEXT THROUGHOUT THE ECOSYSTEM."
   Select words in any reading paragraph, then tap Highlight or Add a note. Marks stay on this
   device (localStorage, one list per page). "My notes" opens a drawer listing every mark; a tap
   jumps back to it; the list prints. Marks are tied to the paragraph's own words, so they
   come back on pages that draw their text later (novels, lessons, card decks). */
(function boot() {
  "use strict";
  if (window.__aogMarkup) return;
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); return; }
  window.__aogMarkup = 1;
  var D = document;
  var MK = "aog.marks." + (location.pathname.replace(/\/+$/, "").replace(/\.html$/, "") || "/home");
  var SKIPSEL = "header,nav,footer,form,label,button,select,textarea,input,.aog-mkdrawer,.aog-mktip,.no-print,[contenteditable],.opts,.say,.why,.drawer,.jump,.rail,.aogpg-bar,.aog-unav,.aog-ws,.aog-more,.site-bar,#aogTopbar,.topbar,.mast .credit";
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function isEs() { var h = D.documentElement.lang || ""; return /^es/.test(h); }
  function T(en, es) { return isEs() ? es : en; }
  function hash(s) { s = s.replace(/\s+/g, " ").trim().slice(0, 160); var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + "." + s.length; }
  function ok(el) { return el && !el.closest(SKIPSEL) && (el.textContent || "").replace(/\s+/g, " ").trim().length >= 40; }
  function blocks() { return Array.prototype.filter.call(D.querySelectorAll("p, blockquote, li, dd"), function (el) { return ok(el) && !el.querySelector("p, li, blockquote") ; }); }
  function blockOf(node) { var el = node && (node.nodeType === 1 ? node : node.parentElement); el = el && el.closest("p, blockquote, li, dd"); return ok(el) ? el : null; }
  if (blocks().length < 2 && !/novel|dwelling|lessons|cards|workbook|curriculum/.test(location.pathname)) return;
  function marks() { try { return JSON.parse(ls(MK) || "[]") || []; } catch (e) { return []; } }
  function saveMarks(a) { ls(MK, JSON.stringify(a)); drawList(); }
  function headingFor(el) {
    var n = el; while (n && n !== D.body) {
      var h = n.querySelector && n.querySelector(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > .lh h4, :scope > header h2");
      if (h && h.textContent.trim()) return h.textContent.replace(/\s+/g, " ").trim().slice(0, 60);
      n = n.parentElement;
    }
    return "";
  }
  function offsetIn(p, node, off) { var w = D.createTreeWalker(p, NodeFilter.SHOW_TEXT, null), n, pos = 0; while ((n = w.nextNode())) { if (n === node) return pos + off; pos += n.nodeValue.length; } return -1; }
  function wrapRange(p, start, len, id, note) {
    var w = D.createTreeWalker(p, NodeFilter.SHOW_TEXT, null), n, pos = 0, parts = [];
    while ((n = w.nextNode())) {
      var L = n.nodeValue.length, a = Math.max(start - pos, 0), b = Math.min(start + len - pos, L);
      if (b > a && a < L && !(n.parentElement && n.parentElement.closest("mark.aog-hl"))) parts.push([n, a, b]);
      pos += L; if (pos >= start + len) break;
    }
    parts.forEach(function (x) {
      var node = x[0]; if (x[2] < node.nodeValue.length) node.splitText(x[2]);
      var mid = x[1] > 0 ? node.splitText(x[1]) : node;
      var m = D.createElement("mark"); m.className = "aog-hl" + (note ? " has-note" : ""); m.setAttribute("data-mk", id); if (note) m.title = note;
      mid.parentNode.insertBefore(m, mid); m.appendChild(mid);
    });
  }
  function applyAll() {
    var all = marks(); if (!all.length) return;
    var bs = blocks(), byHash = {};
    bs.forEach(function (b) { if (b.querySelector("mark.aog-hl")) return; var k = hash(b.textContent); (byHash[k] = byHash[k] || []).push(b); });
    all.forEach(function (m) {
      if (D.querySelector('mark[data-mk="' + m.id + '"]')) return;
      (byHash[m.h] || []).some(function (p) { if (p.textContent.substr(m.s, m.t.length) === m.t) { wrapRange(p, m.s, m.t.length, m.id, m.n); return true; } });
    });
  }
  var tip = D.createElement("div"); tip.className = "aog-mktip no-print"; tip.hidden = true; tip.setAttribute("role", "toolbar"); tip.setAttribute("aria-label", T("Mark this text", "Marcar este texto"));
  tip.innerHTML = '<button type="button" data-a="hl">' + T("Highlight", "Resaltar") + '</button><button type="button" data-a="note">' + T("Add a note", "Agregar nota") + "</button>";
  D.body.appendChild(tip);
  var pending = null;
  function hideTip() { tip.hidden = true; pending = null; }
  D.addEventListener("selectionchange", function () {
    var sel = window.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) { if (!tip.matches(":hover")) hideTip(); return; }
    var r = sel.getRangeAt(0), p1 = blockOf(r.startContainer), p2 = blockOf(r.endContainer);
    if (!p1 || p1 !== p2) { hideTip(); return; }
    var s0 = offsetIn(p1, r.startContainer, r.startOffset), s1 = offsetIn(p1, r.endContainer, r.endOffset);
    var text = p1.textContent.slice(s0, s1); if (s0 < 0 || !text.trim()) { hideTip(); return; }
    pending = { p: p1, s: s0, t: text };
    tip.textContent = ""; tip.innerHTML = '<button type="button" data-a="hl">' + T("Highlight", "Resaltar") + '</button><button type="button" data-a="note">' + T("Add a note", "Agregar nota") + "</button>";
    tip.hidden = false; /* fixed just above My notes (aog-markup.css) */
  });
  tip.addEventListener("mousedown", function (e) { e.preventDefault(); });
  tip.addEventListener("click", function (e) {
    var btn = e.target.closest("button"); if (!btn || !pending) return;
    var note = "";
    if (btn.getAttribute("data-a") === "note") { note = prompt(T("Your note", "Tu nota"), "") || ""; if (!note.trim()) { hideTip(); return; } }
    var m = { id: "m" + Date.now().toString(36), h: hash(pending.p.textContent), s: pending.s, t: pending.t, n: note.trim(), w: headingFor(pending.p) };
    var all = marks(); all.push(m); saveMarks(all);
    wrapRange(pending.p, m.s, m.t.length, m.id, m.n);
    try { window.getSelection().removeAllRanges(); } catch (err) {}
    hideTip();
  });
  D.addEventListener("click", function (e) {
    var mk = e.target.closest && e.target.closest("mark.aog-hl"); if (!mk) return;
    var id = mk.getAttribute("data-mk"), m = marks().filter(function (x) { return x.id === id; })[0]; if (!m) return;
    var act = prompt((m.n ? T("Note: ", "Nota: ") + m.n + "\n\n" : "") + T("Type a new note, or type DELETE to remove this highlight.", "Escribe una nota nueva, o escribe BORRAR para quitar este resaltado."), m.n || "");
    if (act === null) return;
    var all = marks();
    if (/^(delete|borrar)$/i.test(act.trim())) {
      all = all.filter(function (x) { return x.id !== id; });
      Array.prototype.forEach.call(D.querySelectorAll('mark[data-mk="' + id + '"]'), function (x) { var p = x.parentNode; while (x.firstChild) p.insertBefore(x.firstChild, x); p.removeChild(x); p.normalize(); });
    } else {
      all.forEach(function (x) { if (x.id === id) x.n = act.trim(); });
      Array.prototype.forEach.call(D.querySelectorAll('mark[data-mk="' + id + '"]'), function (x) { x.classList.toggle("has-note", !!act.trim()); x.title = act.trim(); });
    }
    saveMarks(all);
  });
  var dbtn = D.createElement("button"); dbtn.type = "button"; dbtn.className = "aog-mkbtn no-print"; dbtn.setAttribute("aria-expanded", "false");
  var drawer = D.createElement("aside"); drawer.className = "aog-mkdrawer no-print"; drawer.hidden = true; drawer.setAttribute("aria-label", T("My highlights and notes", "Mis resaltados y notas"));
  D.body.appendChild(dbtn); D.body.appendChild(drawer);
  function drawList() {
    var all = marks();
    dbtn.innerHTML = "✎ " + T("My notes", "Mis notas") + (all.length ? ' <span class="n">' + all.length + "</span>" : "");
    var h = '<div class="hd"><b>' + T("My highlights and notes", "Mis resaltados y notas") + '</b><button type="button" class="x" aria-label="' + T("Close", "Cerrar") + '">✕</button></div>';
    h += all.length ? "" : '<p class="empty">' + T("Select words in a reading, then tap Highlight or Add a note. They stay on this device.", "Selecciona palabras en una lectura y toca Resaltar o Agregar nota. Se guardan en este dispositivo.") + "</p>";
    h += "<ol>" + all.map(function (m) {
      return '<li><button type="button" class="go" data-go="' + esc(m.id) + '">' + (m.w ? '<span class="ln">' + esc(m.w) + "</span> " : "") + "“" + esc(m.t.length > 90 ? m.t.slice(0, 88) + "…" : m.t) + "”</button>" + (m.n ? '<p class="nt">' + esc(m.n) + "</p>" : "") + "</li>";
    }).join("") + "</ol>";
    if (all.length) h += '<button type="button" class="pr">' + T("Print my notes", "Imprimir mis notas") + "</button>";
    drawer.innerHTML = h;
  }
  dbtn.addEventListener("click", function () { drawList(); drawer.hidden = !drawer.hidden; dbtn.setAttribute("aria-expanded", drawer.hidden ? "false" : "true"); });
  drawer.addEventListener("click", function (e) {
    if (e.target.closest(".x")) { drawer.hidden = true; dbtn.setAttribute("aria-expanded", "false"); return; }
    var go = e.target.closest(".go");
    if (go) {
      var el = D.querySelector('mark[data-mk="' + go.getAttribute("data-go") + '"]');
      if (el) {
        try { var P = window.aogPages, les = el.closest("article.les, section"); if (P && les) for (var i = 0; i < P.pages.length; i++) if (P.pages[i].els.some(function (x) { return x.contains(el); })) { P.go(i); break; } } catch (err) {}
        el.scrollIntoView({ block: "center" }); el.classList.add("flash"); setTimeout(function () { el.classList.remove("flash"); }, 1600);
      } else alert(T("That part is not on screen right now. Open the chapter or card it came from, and it will be marked again.", "Esa parte no está en pantalla. Abre el capítulo o la tarjeta de donde vino y se marcará otra vez."));
      drawer.hidden = true; dbtn.setAttribute("aria-expanded", "false"); return;
    }
    if (e.target.closest(".pr")) {
      var rows = marks().map(function (m) { return "<li>" + (m.w ? "<b>" + esc(m.w) + "</b>" : "") + "<p>“" + esc(m.t) + "”</p>" + (m.n ? "<p><i>" + esc(m.n) + "</i></p>" : "") + "</li>"; }).join("");
      var fr = D.createElement("iframe"); fr.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0"; D.body.appendChild(fr);
      var w = fr.contentWindow; w.document.open(); w.document.write('<!doctype html><meta charset="utf-8"><title>' + esc(T("My notes", "Mis notas")) + '</title><style>body{font:15px/1.5 Georgia,serif;margin:28px}h1{font-size:20px}li{margin:0 0 12px}p{margin:2px 0}</style><h1>' + esc(D.title.replace(/ [—·|] .*$/, "")) + "</h1><ol>" + rows + "</ol>"); w.document.close();
      setTimeout(function () { try { w.focus(); w.print(); } catch (err) {} setTimeout(function () { fr.remove(); }, 1500); }, 250);
    }
  });
  drawList(); applyAll();
  /* pages that draw their text later (novel chapters, lesson steps, card decks) */
  var tmo; new MutationObserver(function (list) {
    if (list.every(function (r) { return r.target.closest && r.target.closest(".aog-mkdrawer, .aog-mktip, mark.aog-hl"); })) return;
    clearTimeout(tmo); tmo = setTimeout(applyAll, 250);
  }).observe(D.body, { childList: true, subtree: true });
})();
