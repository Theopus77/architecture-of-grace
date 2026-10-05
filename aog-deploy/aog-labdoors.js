/* ══ AOG-LABDOORS-V1 (2026-10-05) — the music labs' doors, across the top of every lab ══════════════════════════════════
   Jimmy: "maybe for the different labs, small doors should be across the top of the page … moving from room to room
   easier." Nine small doors, each the lab's own pencil drawing (the Studio door's pictures) and its name, in the Studio's
   order; the lab you are in is marked (aria-current) and the others are one tap away. On a phone the row slides
   sideways inside itself (the page stays still) as a slim row of small pictures beside their names, a finger
   high, so the lab below stays on the screen; on a wide screen all nine fit, as picture doors. It sits just above the lab's bar.
   An exception to the drop-down rule (CLAUDE.md, "Drop-down menus"), asked for by Jimmy on 2026-10-05.
   A lab loads it with  <script src="/aog-labdoors.js" defer></script>. ═════════════════════════════════════════════ */
(function () {
  "use strict";
  var D = document;
  var LABS = [
    { id: "drums", href: "/drums", pic: "music-drums", en: "Drum Machine", es: "Caja de ritmos", m: /^(music-drums|drums|drum-machine)$/ },
    { id: "kit", href: "/drum-kit", pic: "music-kit", en: "Drum Kit", es: "Batería", m: /^(music-kit|drum-kit|kit)$/ },
    { id: "pads", href: "/beat-lab", pic: "music-pads", en: "Beat Lab", es: "Lab. de ritmos", m: /^(music-pads|beat-lab|beatlab|pads|pad-machine)$/ },
    { id: "decks", href: "/turntables", pic: "music-decks", en: "Turntables", es: "Tocadiscos", m: /^(music-decks|turntables|decks)$/ },
    { id: "piano", href: "/piano", pic: "music-piano", en: "Piano", es: "Piano", m: /^(music-piano|piano|keys)$/ },
    { id: "guitar", href: "/guitar", pic: "music-guitar", en: "Guitar", es: "Guitarra", m: /^(music-guitar|guitar)$/ },
    { id: "bass", href: "/bass", pic: "music-bass", en: "Bass", es: "Bajo", m: /^(music-bass|bass)$/ },
    { id: "band", href: "/band", pic: "music-band", en: "Band", es: "Banda", m: /^(music-band|band)$/ },
    { id: "studio", href: "/mixing-desk", pic: "music-mixdesk", en: "Mixing Desk", es: "Mesa de mezclas", m: /^(music-studio|studio|mixing-desk)$/ }
  ];
  var CSS = [
    ".labdoors{margin:.2rem 0 .6rem;padding:0}",
    ".labdoors ul{list-style:none;margin:0;padding:2px 2px 6px;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(88px,1fr);gap:8px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}",
    ".labdoors li{scroll-snap-align:start}",
    ".labdoors a{display:flex;flex-direction:column;align-items:stretch;gap:4px;min-height:44px;text-decoration:none;color:var(--ink,#1a232c);background:var(--card,#fffcf7);border:1px solid var(--line,#ddd8cc);border-radius:12px;padding:4px 4px 6px}",
    ".labdoors .ld-pic{display:block;aspect-ratio:4/3;border-radius:8px;overflow:hidden;background:#f3eee2}",
    ".labdoors img{display:block;width:100%;height:100%;object-fit:cover;object-position:68% 42%}",
    ".labdoors .ld-n{font:700 .82rem/1.15 var(--sans,system-ui,sans-serif);text-align:center;padding:0 2px;color:var(--ink,#1a232c)}",
    ".labdoors a[aria-current=page]{border:2px solid #c9a24b;box-shadow:inset 0 0 0 1px #c9a24b}",
    ".labdoors a[aria-current=page] .ld-n{font-weight:800}",
    ".labdoors a:focus-visible{outline:3px solid #c9a24b;outline-offset:2px}",
    "@media (min-width:900px){.labdoors ul{overflow:visible;grid-auto-flow:row;grid-template-columns:repeat(9,minmax(0,1fr))}}",
    /* a phone: one slim row, a small picture beside the name, a finger high, so the lab below stays on the screen */
    "@media (max-width:699px){.labdoors{margin:.1rem 0 .3rem}.labdoors ul{grid-auto-columns:max-content;gap:6px;padding:2px 2px 4px}.labdoors a{flex-direction:row;align-items:center;gap:6px;padding:3px 10px 3px 3px;min-height:44px}.labdoors .ld-pic{width:44px;height:34px;aspect-ratio:auto;flex:0 0 auto}.labdoors .ld-n{white-space:nowrap;font-size:.86rem}}",
    /* the doors say where the labs are, so the old Music tools menu (aog-dropdowns.js, drawn just before #navTools) steps
       aside: said once (CLAUDE.md). It stays in the page, so anything that still reaches for it works. */
    "html.has-labdoors label.aogdd:has(+ #navTools),html.has-labdoors .sisters>label.aogdd:last-child{display:none!important}",
    "@media print{.labdoors{display:none}}"
  ].join("\n");
  function here() {
    var f = (location.pathname.split("/").pop() || "").replace(/\.html$/, "");
    for (var i = 0; i < LABS.length; i++) if (LABS[i].m.test(f)) return LABS[i].id;
    return "";
  }
  function lang() { return (D.documentElement.getAttribute("lang") || "en").indexOf("es") === 0 ? "es" : "en"; }
  function paint(nav) {
    var es = lang() === "es", cur = here();
    nav.setAttribute("aria-label", es ? "Laboratorios de música" : "Music labs");
    nav.innerHTML = "<ul>" + LABS.map(function (l) {
      return '<li><a href="' + l.href + '"' + (l.id === cur ? ' aria-current="page"' : "") + '>' +
        '<span class="ld-pic" aria-hidden="true"><picture><source type="image/webp" srcset="/img/banners/' + l.pic + '-pencil-900.webp">' +
        '<img src="/img/banners/' + l.pic + '-pencil-900.jpg" alt="" width="900" height="315" loading="lazy" decoding="async"></picture></span>' +
        '<span class="ld-n">' + (es ? l.es : l.en) + "</span></a></li>";
    }).join("") + "</ul>";
    var on = nav.querySelector("[aria-current]");
    if (on && on.parentNode && nav.firstChild.scrollWidth > nav.firstChild.clientWidth) {
      var ul = nav.firstChild, li = on.parentNode;
      ul.scrollLeft = Math.max(0, li.offsetLeft - (ul.clientWidth - li.offsetWidth) / 2);   /* the lab you are in, in view */
    }
  }
  function start() {
    if (D.getElementById("labdoors")) return;
    var bar = D.querySelector(".wrap > .bench-bar") || D.querySelector(".bench-bar"); if (!bar) return;
    if (!D.getElementById("labdoors-css")) { var st = D.createElement("style"); st.id = "labdoors-css"; st.textContent = CSS; D.head.appendChild(st); }
    var nav = D.createElement("nav"); nav.id = "labdoors"; nav.className = "labdoors no-print";
    bar.parentNode.insertBefore(nav, bar);
    D.documentElement.classList.add("has-labdoors");
    paint(nav);
    var last = lang();
    try { new MutationObserver(function () { if (lang() !== last) { last = lang(); paint(nav); } }).observe(D.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();
})();
