/* ══ AOG-RESOURCES-V1 (2026-09-27) — THE RESOURCE LIBRARY ══
   Jimmy: "Each subject area should have additional resources to choose and use
   depending upon the subject matter one is after." and "Remember we are the 1%."
   Put <div data-aog-resources="math"></div> on any page (optional data-topic="…"
   and data-band="6-8" to start filtered). It draws a Resource library: three
   drop-downs (Topic, Kind, Grades) and a card for each free resource in
   aog-resources.json. The JSON is fetched once per page and kept by sw.js.
   aog-unit.js also reads it through window.aogResources.pick(). Still, no motion. */
(function () {
  "use strict";
  if (window.aogResources) return;
  var D = document, URL_ = "/aog-resources.json", P = null;
  var BANDS = ["K-2", "3-5", "6-8", "9-12"];
  var KINDS = {
    "primary-source": ["Primary source", "Fuente primaria"], simulation: ["Simulation", "Simulación"], video: ["Video", "Video"],
    reading: ["Reading", "Lectura"], dataset: ["Data", "Datos"], map: ["Map", "Mapa"], practice: ["Practice", "Práctica"],
    reference: ["Reference", "Consulta"], audio: ["Audio", "Audio"], tool: ["Tool", "Herramienta"]
  };
  function load() {
    if (!P) P = fetch(URL_).then(function (r) { if (!r.ok) throw 0; return r.json(); }).catch(function () { P = null; return null; });
    return P;
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function isEs() {
    if ((D.documentElement.lang || "").slice(0, 2) === "es") return true;
    var s = D.querySelector("[data-en][data-es]");
    return !!(s && s.getAttribute("data-es") && s.getAttribute("data-es") !== s.getAttribute("data-en") && s.textContent.trim() === s.getAttribute("data-es").trim());
  }
  function sp(en, es, tag, cls) {
    tag = tag || "span";
    return "<" + tag + (cls ? ' class="' + cls + '"' : "") + ' data-en="' + esc(en) + '" data-es="' + esc(es) + '">' + esc(isEs() ? es : en) + "</" + tag + ">";
  }
  function opt(v, en, es) { return '<option value="' + esc(v) + '" data-en="' + esc(en) + '" data-es="' + esc(es) + '">' + esc(isEs() ? es : en) + "</option>"; }
  function bandOf(s) {
    s = String(s || "").replace(/[–—]/g, "-").toUpperCase();
    var m = /\b(K-2|3-5|6-8|9-12)\b/.exec(s); return m ? m[1] : "";
  }

  /* ── word-overlap picker for aog-unit.js ── */
  var STOP = " a an and the of to in on for with by at from is are be it its as or how what why who when where this that these those your you we our one two not into about their than then more most can do does do lesson unit chapter part la el los las de del y en un una que ";
  function words(t) {
    return String(t || "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9áéíóúñü]+/g, " ").split(" ").filter(function (w) { return w.length > 2 && STOP.indexOf(" " + w + " ") < 0; })
      .map(function (w) { return w.length > 4 ? w.replace(/(ies|es|s)$/, "") : w; });
  }
  function pick(data, subject, text, band, n) {
    var S = data && data.subjects && data.subjects[subject]; if (!S) return [];
    var want = words(text); if (!want.length) return [];
    if (!S.__df) { S.__df = {}; S.items.forEach(function (it) { var u = {}; words(it.title + " " + it.note + " " + it.topics.join(" ")).forEach(function (w) { u[w] = 1; }); Object.keys(u).forEach(function (w) { S.__df[w] = (S.__df[w] || 0) + 1; }); }); }
    var set = {}, cap = Math.max(3, S.items.length * 0.2);
    want.forEach(function (w) { if ((S.__df[w] || 0) <= cap) set[w] = 1; });
    var scored = S.items.map(function (it, i) {
      if (band && it.grades.indexOf(band) < 0) return null;
      var sc = 0;
      it.topics.forEach(function (t) {
        var lab = S.topics[t] ? S.topics[t].en + " " + t.replace(/-/g, " ") : t;
        words(lab).forEach(function (w) { if (set[w]) sc += 3; });
      });
      words(it.title).forEach(function (w) { if (set[w]) sc += 2; });
      words(it.note).forEach(function (w) { if (set[w]) sc += 1; });
      return sc > 0 ? { it: it, sc: sc, i: i } : null;
    }).filter(Boolean);
    scored.sort(function (a, b) { return b.sc - a.sc || a.i - b.i; });
    var seen = {}, out = [];
    scored.forEach(function (s) { if (out.length < (n || 3) && !seen[s.it.url]) { seen[s.it.url] = 1; out.push(s.it); } });
    return out;
  }

  /* ── the library section ── */
  function draw(host, data) {
    var key = host.getAttribute("data-aog-resources"), S = data && data.subjects && data.subjects[key];
    if (!S) { host.hidden = true; return; }
    var id = "aogres-" + key + "-" + Math.random().toString(36).slice(2, 7);
    var tp = opt("", "All topics", "Todos los temas"), used = {};
    S.items.forEach(function (it) { it.topics.forEach(function (t) { used[t] = 1; }); });
    Object.keys(S.topics).forEach(function (t) { if (used[t]) tp += opt(t, S.topics[t].en, S.topics[t].es); });
    var kd = opt("", "All kinds", "Todos los tipos"), haveK = {};
    S.items.forEach(function (it) { haveK[it.kind] = 1; });
    Object.keys(KINDS).forEach(function (k) { if (haveK[k]) kd += opt(k, KINDS[k][0], KINDS[k][1]); });
    var gd = opt("", "All grades", "Todos los grados");
    BANDS.forEach(function (b) { gd += opt(b, "Grades " + b, "Grados " + b); });
    host.classList.add("aogres", "no-print");
    host.setAttribute("role", "region");
    host.setAttribute("aria-labelledby", id + "-h");
    host.innerHTML =
      '<h2 id="' + id + '-h" data-en="Resource library" data-es="Biblioteca de recursos">' + esc(isEs() ? "Biblioteca de recursos" : "Resource library") + "</h2>" +
      sp("Free, trusted places to read, watch, try and explore. Choose a topic to see what fits.", "Sitios gratis y confiables para leer, ver, probar y explorar. Elige un tema para ver lo que sirve.", "p", "aogres-lead") +
      '<div class="aogres-filters">' +
      '<label for="' + id + '-t">' + sp("Topic", "Tema") + '</label><select id="' + id + '-t" class="aogres-t">' + tp + "</select>" +
      '<label for="' + id + '-k">' + sp("Kind", "Tipo") + '</label><select id="' + id + '-k" class="aogres-k">' + kd + "</select>" +
      '<label for="' + id + '-g">' + sp("Grades", "Grados") + '</label><select id="' + id + '-g" class="aogres-g">' + gd + "</select>" +
      "</div>" +
      '<p class="aogres-count" aria-live="polite"></p><ul class="aogres-list"></ul>';
    var selT = host.querySelector(".aogres-t"), selK = host.querySelector(".aogres-k"), selG = host.querySelector(".aogres-g");
    var t0 = host.getAttribute("data-topic"), g0 = bandOf(host.getAttribute("data-band"));
    if (t0 && used[t0]) selT.value = t0;
    if (g0) selG.value = g0;
    function paint() {
      var t = selT.value, k = selK.value, g = selG.value;
      var list = S.items.filter(function (it) { return (!t || it.topics.indexOf(t) > -1) && (!k || it.kind === k) && (!g || it.grades.indexOf(g) > -1); });
      host.querySelector(".aogres-count").innerHTML = list.length
        ? sp(list.length + (list.length === 1 ? " resource" : " resources"), list.length + (list.length === 1 ? " recurso" : " recursos"))
        : sp("Nothing matches yet. Try All topics or All grades.", "Aún no hay nada. Prueba Todos los temas o Todos los grados.");
      host.querySelector(".aogres-list").innerHTML = list.map(function (it) {
        var kn = KINDS[it.kind] || [it.kind, it.kind];
        return '<li class="aogres-card"><div class="aogres-top"><span class="aogres-chip">' + sp(kn[0], kn[1]) + "</span>" +
          '<span class="aogres-gr">' + sp("Grades ", "Grados ") + esc(it.grades.join(", ")) + "</span></div>" +
          '<h3 class="aogres-title">' + esc(it.title) + "</h3>" +
          '<p class="aogres-org">' + esc(it.org) + "</p>" +
          '<p class="aogres-note">' + esc(it.note) + "</p>" +
          '<a class="aogres-open" href="' + esc(it.url) + '" target="_blank" rel="noopener">' + sp("Open", "Abrir") + ' <span aria-hidden="true">↗</span><span class="aogres-sr">: ' + esc(it.title) + "</span></a></li>";
      }).join("");
    }
    [selT, selK, selG].forEach(function (s) { s.addEventListener("change", paint); });
    paint();
  }
  function boot() {
    var hosts = D.querySelectorAll("[data-aog-resources]");
    if (!hosts.length) return;
    load().then(function (data) { Array.prototype.forEach.call(hosts, function (h) { if (!h.__aogres) { h.__aogres = 1; draw(h, data); } }); });
  }
  window.aogResources = { load: load, pick: pick, bandOf: bandOf };
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", boot); else boot();
})();
