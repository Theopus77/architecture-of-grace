/* AOG-SLIDES-V1 (2026-09-26) — Jimmy: "go through all of the slides throughout all subjects and
   give them the facelift we have been giving everything else." Every "Start here" picture on the
   167 lesson pages (science, social studies, FACS, math, English, Spanish, the rooms) is an SVG
   drawn with the shared ts-* shapes. This file lifts them all in place, in each page's own colours:
   shapes get light-from-above shading and a soft shadow, outline shapes (rocks, boxes) get a stone
   fill, the picture sits on a lit stage, and a counter shows which step you are on. Nothing moves
   on its own; the short fade between steps is off for reduced motion and on touch screens. */
(function () {
  var NS = "http://www.w3.org/2000/svg", D = document, n = 0;
  function rgb(c) { var m = /rgba?\(([^)]+)\)/.exec(c || ""); if (!m) return null; var p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); if (p.length > 3 && p[3] === 0) return null; return p.slice(0, 3); }
  function mix(a, b, t) { return "rgb(" + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(",") + ")"; }
  var W = [255, 255, 255], K = [10, 30, 51];
  function el(tag, at) { var e = D.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); return e; }
  function grad(defs, id, base) {
    var g = el("radialGradient", { id: id, cx: "34%", cy: "28%", r: "78%", fx: "30%", fy: "22%" });
    [[0, mix(base, W, .55)], [.5, mix(base, W, .12)], [1, mix(base, K, .22)]].forEach(function (s) { g.appendChild(el("stop", { offset: s[0], "stop-color": s[1] })); });
    defs.appendChild(g);
  }
  function closed(e) {
    var t = e.tagName.toLowerCase();
    if (t === "line" || t === "polyline") return false;
    if (t === "path") return /z\s*$/i.test((e.getAttribute("d") || "").trim());
    return true;
  }
  function lift(svg) {
    if (svg.__aogLift) return;
    var shapes = svg.querySelectorAll(".ts-a,.ts-b,.ts-c,.ts-box");
    if (!shapes.length) return;
    svg.__aogLift = 1; n++;
    var id = "aogts" + n, defs = el("defs", {});
    var f = el("filter", { id: id + "sh", x: "-25%", y: "-25%", width: "150%", height: "160%" });
    f.appendChild(el("feDropShadow", { dx: "0", dy: "2.2", stdDeviation: "2.2", "flood-color": "#0A1E33", "flood-opacity": ".24" }));
    defs.appendChild(f);
    var stone = el("linearGradient", { id: id + "st", x1: "0", y1: "0", x2: "0", y2: "1" });
    [[0, "#FBF8F1"], [1, "#DDD5C4"]].forEach(function (s) { stone.appendChild(el("stop", { offset: s[0], "stop-color": s[1] })); });
    defs.appendChild(stone);
    svg.insertBefore(defs, svg.firstChild);
    var made = {};
    Array.prototype.forEach.call(shapes, function (e) {
      if (!closed(e)) return;
      var cs = getComputedStyle(e), cls = /ts-(box|a|b|c)(?![\w-])/.exec(e.getAttribute("class"))[0];
      if (cls === "ts-box") {
        e.style.fill = "url(#" + id + "st)"; e.style.filter = "url(#" + id + "sh)";
        return;
      }
      var fill = rgb(cs.fill), stroke = rgb(cs.stroke);
      /* a washed fill with a strong stroke: shade from the stroke colour, kept light */
      var base = fill, washed = false;
      if (fill && stroke && (fill[0] + fill[1] + fill[2]) > 600) { base = stroke; washed = true; }
      base = base || stroke; if (!base) return;
      var key = cls + base.join("-") + (washed ? "w" : "");
      if (!made[key]) { made[key] = id + "g" + Object.keys(made).length; grad(defs, made[key], washed ? base.map(function (v) { return Math.round(v + (255 - v) * .55); }) : base); }
      e.style.fill = "url(#" + made[key] + ")";
      e.style.stroke = mix(stroke || base, K, .18);
      if (!e.getAttribute("stroke-width") && !parseFloat(cs.strokeWidth)) e.style.strokeWidth = "1.2";
      e.style.filter = "url(#" + id + "sh)";
    });
    Array.prototype.forEach.call(svg.querySelectorAll(".ts-line,.ts-dash"), function (e) { e.style.strokeLinecap = "round"; e.style.strokeLinejoin = "round"; });
  }
  function counter(pic) {
    var fr = pic.querySelectorAll("svg > g[data-z]");
    if (fr.length < 2 || pic.querySelector(".aog-step")) return;
    var c = D.createElement("div"); c.className = "aog-step"; c.setAttribute("aria-hidden", "true");
    for (var i = 0; i < fr.length; i++) c.appendChild(D.createElement("i"));
    pic.appendChild(c);
    function sync() { var on = 0; for (var i = 0; i < fr.length; i++) if (fr[i].style.display !== "none") on = i; var d = c.children; for (var j = 0; j < d.length; j++) d[j].className = j === on ? "on" : (j < on ? "past" : ""); }
    sync();
    try { new MutationObserver(sync).observe(pic, { attributes: true, subtree: true, attributeFilter: ["style"] }); } catch (e) {}
  }
  var css = ".ground-pic{position:relative;background:radial-gradient(120% 90% at 50% 8%,#FFFDF7 0%,#F6F0E3 58%,#E9E0CE 100%)!important;"
    + "border:1px solid rgba(10,30,51,.12)!important;border-radius:18px!important;padding:18px 14px 26px!important;"
    + "box-shadow:inset 0 1px 0 #fff,inset 0 -26px 40px -34px rgba(10,30,51,.35),0 16px 34px -28px rgba(10,30,51,.55)!important}"
    + ".ground-pic::before{content:'';position:absolute;left:12%;right:12%;bottom:22px;height:14px;border-radius:50%;background:radial-gradient(closest-side,rgba(10,30,51,.14),transparent);pointer-events:none}"
    + ".ground-pic svg{position:relative;max-width:520px!important;filter:saturate(1.08)}"
    + ".ground-pic svg > g[data-z]{animation:aogSlideIn .28s ease-out both}"
    + "@keyframes aogSlideIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}"
    + "@media (prefers-reduced-motion:reduce),(hover:none){.ground-pic svg > g[data-z]{animation:none}}"
    + ".aog-step{position:absolute;left:0;right:0;bottom:9px;display:flex;justify-content:center;gap:7px}"
    + ".aog-step i{width:8px;height:8px;border-radius:50%;background:rgba(10,30,51,.18)}"
    + ".aog-step i.past{background:rgba(10,30,51,.4)}.aog-step i.on{background:#B8893A;box-shadow:0 0 0 3px rgba(184,137,58,.22)}"
    + ".ground-cap{font-size:1.1rem!important;line-height:1.5}"
    + "[data-theme='dark'] .ground-pic{background:radial-gradient(120% 90% at 50% 8%,#FFFDF7 0%,#F1EADB 60%,#E2D8C4 100%)!important}";
  function run() {
    Array.prototype.forEach.call(D.querySelectorAll(".ground-pic"), function (p) {
      Array.prototype.forEach.call(p.querySelectorAll("svg"), lift); counter(p);
    });
  }
  function boot() {
    if (!D.querySelector(".ground-pic")) return;
    var st = D.createElement("style"); st.id = "aog-slides-css"; st.textContent = css; (D.head || D.documentElement).appendChild(st);
    run(); setTimeout(run, 600); setTimeout(run, 1800);
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", boot); else boot();
  window.aogSlidesLift = run;
})();
