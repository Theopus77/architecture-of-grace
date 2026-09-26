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
    + "@media print{.aogpg-off{display:block!important}.aogpg-bar{display:none!important}}";
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
      + '<select aria-label="' + (es() ? "Ir a una página" : "Go to a page") + '">' + pages.map(function (p, k) { return '<option value="' + k + '"' + (k === i ? " selected" : "") + ">" + (k + 1) + ". " + label(p) + "</option>"; }).join("") + "</select></div>"
      + '<button type="button" class="next"' + (N ? "" : " disabled") + "><span>" + (es() ? "Siguiente" : "Next") + " ›</span><small>" + (N ? label(N) : "") + "</small></button>";
    var anchor = pages[i].els[pages[i].els.length - 1];
    anchor.parentNode.insertBefore(bar, anchor.nextSibling);
    if (i === pages.length - 1 && pager2) main.insertBefore(bar, pager2);
    bar.querySelector(".prev").onclick = function () { go(cur - 1); };
    bar.querySelector(".next").onclick = function () { go(cur + 1); };
    bar.querySelector("select").onchange = function () { go(+this.value); };
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
