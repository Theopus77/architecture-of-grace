/* aog-crosswalk.js — the Crosswalk Matrix cards (room-*-curriculum.html,
   xw-matrix-*.html).
   Anchor chart triggers are plain links in the page (they work with no script).
   This file adds one quiet thing to each Neuro-affirming adjustment:
   a "Desk card" button that opens the adjustment as a large card you can
   print or copy. Nothing opens by itself; nothing moves. */
(function () {
  "use strict";
  var D = document, H = D.documentElement;
  var ES = function () { return /^es/i.test(H.lang || ""); };
  function say(en, es) { return ES() ? es : en; }

  var css = "" +
    ".xw a.xchart{display:inline-block;border:1px solid currentColor;border-radius:8px;padding:2px 10px;font-weight:700;text-decoration:none;color:inherit}" +
    "a.xchart:hover{text-decoration:underline}" +
    ".xw-acts{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 0}" +
    ".xw-btn{font:inherit;font-size:16px;font-weight:700;min-height:44px;padding:6px 14px;border-radius:10px;border:1.5px solid currentColor;background:transparent;color:inherit;cursor:pointer}" +
    ".xw-btn:hover{text-decoration:underline}" +
    ".xw-desk{margin:10px 0 0;padding:18px 18px 14px;border-radius:12px;border:2px solid #2f6b4f;background:#fffdf7;color:#1d2433}" +
    ".xw-desk .xw-dk{font-size:.8rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#2f5f47;margin:0}" +
    ".xw-desk .xw-dt{font-size:1rem;font-weight:700;margin:4px 0 0;color:#1d2433}" +
    ".xw-desk .xw-dw{font-size:1.2rem;line-height:1.5;margin:10px 0 0;color:#1d2433}" +
    ".xw-desk .xw-btn{color:#1d2433}" +
    ".xw-said{font-size:.95rem;margin:8px 0 0;min-height:1.2em;color:#1d2433}" +
    ":root[data-theme=dark] .xw-desk{background:#1b2230;color:#f3efe4;border-color:#8fc9a8}" +
    ":root[data-theme=dark] .xw-desk .xw-dk{color:#8fc9a8}" +
    ":root[data-theme=dark] .xw-desk .xw-dt,:root[data-theme=dark] .xw-desk .xw-dw,:root[data-theme=dark] .xw-desk .xw-btn,:root[data-theme=dark] .xw-said{color:#f3efe4}" +
    "@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .xw-desk{background:#1b2230;color:#f3efe4;border-color:#8fc9a8}" +
    ":root:not([data-theme=light]) .xw-desk .xw-dk{color:#8fc9a8}" +
    ":root:not([data-theme=light]) .xw-desk .xw-dt,:root:not([data-theme=light]) .xw-desk .xw-dw,:root:not([data-theme=light]) .xw-desk .xw-btn,:root:not([data-theme=light]) .xw-said{color:#f3efe4}}" +
    ".xw-sheet{display:none}" +
    "@media print{.xw-acts,.xw-desk{display:none!important}" +
    "html.xw-print-one body>*:not(.xw-sheet),html.xw-print-one .aog-cwm{display:none!important}" +
    "html.xw-print-one,html.xw-print-one body{background:#fff!important;margin:0!important;padding:0!important;zoom:1!important}" +
    "html.xw-print-one .xw-sheet{display:block!important;color:#111;font:12pt/1.45 Georgia,'Times New Roman',serif}" +
    "@page{size:letter;margin:0.4in 0.5in}" +
    ".xw-half{position:relative;height:4.6in;box-sizing:border-box;padding:0.3in 0.4in;break-inside:avoid}" +
    ".xw-half svg.xw-frame{position:absolute;inset:0;width:100%;height:100%;overflow:visible}" +
    ".xw-ph{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1pt solid #111;padding:0 0 4pt;margin:0 0 8pt;font-size:9pt;letter-spacing:.08em;text-transform:uppercase}" +
    ".xw-ph b{font-weight:700}" +
    ".xw-pk{font-size:9pt;letter-spacing:.1em;text-transform:uppercase;color:#444;margin:0}" +
    ".xw-pt{font-size:13pt;font-weight:700;margin:3pt 0 0}" +
    ".xw-pw{font-size:15pt;line-height:1.5;margin:10pt 0 0}" +
    ".xw-cut{height:0.3in;display:flex;align-items:center;gap:8pt;font:8pt Georgia,serif;color:#555;letter-spacing:.1em;text-transform:uppercase}" +
    ".xw-cut:before,.xw-cut:after{content:'';flex:1;border-top:1pt dashed #777}}";
  var st = D.createElement("style"); st.id = "aog-crosswalk-css"; st.textContent = css;
  D.head.appendChild(st);

  function btn(en, es) {
    var b = D.createElement("button");
    b.type = "button"; b.className = "xw-btn";
    b.setAttribute("data-en", en); b.setAttribute("data-es", es);
    b.textContent = say(en, es);
    return b;
  }

  function where(host) {
    var art = host.closest("article");
    if (art) {
      var ch = art.querySelector(".chch"), h = art.querySelector("h3");
      return [(ch ? ch.textContent + " · " : "") + (h ? h.textContent : "")].join("");
    }
    var tr = host.closest("tr");
    if (tr) {
      var c = tr.querySelector('td[data-label^="Chapter"]');
      if (c) return c.textContent.split(" — ")[0];
    }
    return "";
  }

  function copy(text, done) {
    function fallback() {
      var ta = D.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0"; ta.style.fontSize = "16px";
      D.body.appendChild(ta); ta.select();
      var ok = false; try { ok = D.execCommand("copy"); } catch (e) {}
      D.body.removeChild(ta); done(ok);
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
        return;
      }
    } catch (e) {}
    fallback();
  }

  /* a hand-drawn pencil frame: a slightly wobbly double line, grey ink */
  var FRAME = '<svg class="xw-frame" viewBox="0 0 700 460" preserveAspectRatio="none" aria-hidden="true">' +
    '<path d="M6 8 C180 4 520 11 694 6 C697 150 692 310 695 452 C520 456 190 450 7 454 C3 300 9 160 6 8 Z" fill="none" stroke="#555" stroke-width="1.4" stroke-linejoin="round"/>' +
    '<path d="M12 13 C200 10 500 16 689 12 C691 160 687 300 690 447 C500 450 210 446 12 449 C9 290 14 150 12 13 Z" fill="none" stroke="#999" stroke-width="0.8"/></svg>';
  function half(t, words) {
    var h = D.createElement("div"); h.className = "xw-half";
    h.innerHTML = FRAME;
    var ph = D.createElement("div"); ph.className = "xw-ph";
    var l = D.createElement("b"); l.textContent = "Architecture of Grace";
    var r = D.createElement("span"); r.textContent = say("Desk card", "Tarjeta de mesa");
    ph.appendChild(l); ph.appendChild(r); h.appendChild(ph);
    var k = D.createElement("p"); k.className = "xw-pk"; k.textContent = say("Neuro-affirming adjustment", "Ajuste neuroafirmativo"); h.appendChild(k);
    if (t) { var tt = D.createElement("p"); tt.className = "xw-pt"; tt.textContent = t; h.appendChild(tt); }
    var w = D.createElement("p"); w.className = "xw-pw"; w.textContent = words; h.appendChild(w);
    return h;
  }
  function sheet(t, words) {
    var old = D.querySelector(".xw-sheet"); if (old) old.remove();
    var sh = D.createElement("div"); sh.className = "xw-sheet"; sh.setAttribute("aria-hidden", "true");
    sh.appendChild(half(t, words));
    var cut = D.createElement("div"); cut.className = "xw-cut"; cut.textContent = say("Cut here", "Corta aquí");
    sh.appendChild(cut);
    sh.appendChild(half(t, words));
    D.body.appendChild(sh);
    return sh;
  }
  window.aogCrosswalkSheet = sheet;

  var n = 0;
  function build(host, textEl) {
    var words = (textEl.textContent || "").trim();
    if (!words) return;
    n += 1;
    var id = "xw-desk-" + n;
    var acts = D.createElement("div"); acts.className = "xw-acts";
    var open = btn("Desk card", "Tarjeta de mesa");
    open.setAttribute("aria-expanded", "false");
    open.setAttribute("aria-controls", id);
    acts.appendChild(open);

    var card = D.createElement("div");
    card.className = "xw-desk"; card.id = id; card.hidden = true;
    card.setAttribute("role", "region");
    var k = D.createElement("p"); k.className = "xw-dk";
    k.setAttribute("data-en", "Neuro-affirming adjustment"); k.setAttribute("data-es", "Ajuste neuroafirmativo");
    k.textContent = say("Neuro-affirming adjustment", "Ajuste neuroafirmativo");
    var t = where(host);
    card.appendChild(k);
    if (t) { var tt = D.createElement("p"); tt.className = "xw-dt"; tt.textContent = t; card.appendChild(tt); }
    var w = D.createElement("p"); w.className = "xw-dw"; w.textContent = words; card.appendChild(w);
    card.setAttribute("aria-label", say("Desk card", "Tarjeta de mesa") + (t ? " · " + t : ""));

    var row = D.createElement("div"); row.className = "xw-acts";
    var pr = btn("Print this card", "Imprimir esta tarjeta");
    var cp = btn("Copy the words", "Copiar el texto");
    row.appendChild(pr); row.appendChild(cp); card.appendChild(row);
    var said = D.createElement("p"); said.className = "xw-said"; said.setAttribute("aria-live", "polite");
    card.appendChild(said);

    open.addEventListener("click", function () {
      var show = card.hidden;
      card.hidden = !show;
      open.setAttribute("aria-expanded", String(show));
      open.setAttribute("data-en", show ? "Close desk card" : "Desk card");
      open.setAttribute("data-es", show ? "Cerrar la tarjeta" : "Tarjeta de mesa");
      open.textContent = say(open.getAttribute("data-en"), open.getAttribute("data-es"));
      said.textContent = "";
    });
    pr.addEventListener("click", function () {
      var sh = sheet(t, words); H.classList.add("xw-print-one");
      var undo = function () {
        H.classList.remove("xw-print-one"); if (sh.parentNode) sh.remove();
        window.removeEventListener("afterprint", undo);
      };
      window.addEventListener("afterprint", undo);
      window.print();
    });
    cp.addEventListener("click", function () {
      copy((t ? t + "\n" : "") + words, function (ok) {
        said.textContent = ok ? say("Copied. You can paste it now.", "Copiado. Ya puedes pegarlo.")
                              : say("Copy did not work here. Select the words and copy them.", "No se pudo copiar aquí. Selecciona el texto y cópialo.");
      });
    });

    host.appendChild(acts);
    host.appendChild(card);
  }

  function go() {
    D.querySelectorAll(".panel.neuro").forEach(function (p) {
      var t = p.querySelector("p"); if (t) build(p, t);
    });
    D.querySelectorAll('td[data-label="Neuro-affirming adjustment"]').forEach(function (td) {
      var span = D.createElement("span"); // keep the words as they are; wrap for reading
      while (td.firstChild) span.appendChild(td.firstChild);
      td.appendChild(span);
      build(td, span);
    });
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", go); else go();
})();
