/* ══ AOG-SKY-V1 (2026-10-03) — THEIR SKY ═══════════════════════════════════════
   Jimmy: the slips should earn "kick ass pictures" as a reward, the way Daily Drafts
   fill the stained-glass Blueprint — "not stained glass but something else".
   Every slip a child sends lights one star in their own night sky. Seven stars join
   into a named constellation (The Builder's Square, The Lantern, The Bridge…).
   Each kind of slip has its own light: gold for class check-ins, sky blue for
   checklists, amber for point sheets, rose for notes from home. A fuller slip
   burns brighter; no star is ever dim. Stars still to come wait as faint
   pinpricks, the way empty panes wait in the window. Nothing moves.
     AOGSky.rows(name)            the slips this device knows for one child, oldest first
     AOGSky.html(rows, {mark, es}) the sky as HTML (mark: ring the newest star)
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  if (window.AOGSky) return;

  var KIND = {
    check: { c: "#8FD0FF", en: "Checklists", es: "Listas" },
    points: { c: "#FFB070", en: "Point sheets", es: "Hojas de puntos" },
    home: { c: "#F59BC0", en: "Notes from home", es: "Notas de casa" },
    class: { c: "#F2C964", en: "Check-ins", es: "Registros" }
  };
  function kindOf(r) {
    var ty = String(r.checkinType || "").replace(/^slip-/, "");
    if (/^(school|homecheck|bedtime)$/.test(ty)) return "check";
    if (/^(points|homepoints)$/.test(ty)) return "points";
    if (String(r.respondentRole || "") === "parent" || /^(home|morning|homework)$/.test(ty)) return "home";
    return "class";
  }
  function xp(r) { try { return typeof r.extra === "string" ? JSON.parse(r.extra) : (r.extra || {}); } catch (e) { return {}; } }
  /* how full the slip was: a checklist's steps, a point sheet's bricks; anything sent counts well */
  function strength(r) {
    var a = xp(r).answers || {}, m;
    if (a.steps && (m = /(\d+) of (\d+)/.exec(a.steps)) && +m[2]) return +m[1] / +m[2];
    if (a.bricks && (m = /\((\d+)%\)/.exec(a.bricks))) return +m[1] / 100;
    return 0.85;
  }
  function fold(s) { return String(s || "").replace(/\s+/g, " ").trim().toLowerCase(); }
  function arr(k) { try { var v = JSON.parse(localStorage.getItem(k) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function isSlip(r) { var t = String(r && r.checkinType || ""); return /^slip-/.test(t) || t === "weekly"; }

  function rows(name) {
    var k = fold(name);
    var remote = arr("aog.checkin.remote").filter(isSlip);
    var mine = arr("aog.slips.mine").filter(isSlip).filter(function (m) {
      return !remote.some(function (r) { return String(r.studentId) === String(m.studentId) && String(r.checkinType) === String(m.checkinType) && Math.abs(Date.parse(r.timestamp) - Date.parse(m.timestamp)) < 180000; });
    });
    return remote.concat(mine).filter(function (r) { return !k || fold(r.studentId) === k; })
      .sort(function (a, b) { return String(a.timestamp || a.date || "").localeCompare(String(b.timestamp || b.date || "")); });
  }

  /* seven stars each, in a 100 × 80 box; L = the lines between them */
  var CON = [
    { en: "The Builder's Square", es: "La escuadra", p: [[12, 8], [12, 28], [12, 48], [12, 70], [34, 70], [56, 70], [80, 70]], L: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]] },
    { en: "The Lantern", es: "La linterna", p: [[50, 4], [50, 18], [32, 30], [68, 30], [30, 60], [70, 60], [50, 74]], L: [[0, 1], [1, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 6]] },
    { en: "The Bridge", es: "El puente", p: [[4, 70], [14, 46], [31, 31], [50, 26], [69, 31], [86, 46], [96, 70]], L: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]] },
    { en: "The Tower", es: "La torre", p: [[38, 74], [38, 50], [38, 26], [50, 6], [62, 26], [62, 50], [62, 74]], L: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [1, 5]] },
    { en: "The Key", es: "La llave", p: [[14, 40], [28, 26], [42, 40], [28, 54], [62, 40], [84, 40], [84, 56]], L: [[0, 1], [1, 2], [2, 3], [3, 0], [2, 4], [4, 5], [5, 6]] },
    { en: "The Bell", es: "La campana", p: [[50, 6], [38, 24], [62, 24], [30, 52], [70, 52], [20, 68], [80, 68]], L: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 6]] },
    { en: "The Dove", es: "La paloma", p: [[8, 42], [28, 36], [44, 18], [54, 40], [74, 28], [92, 34], [48, 62]], L: [[0, 1], [1, 2], [2, 3], [1, 3], [3, 4], [4, 5], [3, 6]] },
    { en: "The Cornerstone", es: "La piedra angular", p: [[20, 12], [80, 12], [80, 70], [20, 70], [50, 41], [20, 41], [80, 41]], L: [[0, 1], [1, 2], [2, 3], [3, 0], [5, 4], [4, 6]] },
    { en: "The Open Door", es: "La puerta abierta", p: [[24, 74], [24, 26], [40, 10], [60, 10], [76, 26], [76, 74], [66, 46]], L: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
    { en: "The Lighthouse", es: "El faro", p: [[44, 74], [42, 46], [40, 20], [50, 6], [60, 20], [58, 46], [56, 74]], L: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [1, 5]] }
  ];
  function rnd(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function svg(list, opt) {
    opt = opt || {};
    var es = !!opt.es, n = list.length, cols = 2, cw = 180, ch = 150, W = cols * cw;
    var groups = Math.max(2, Math.ceil((n + 1) / 7)); if (groups % cols) groups++;
    var H = Math.ceil(groups / cols) * ch + 10, R = rnd(n * 97 + 13), g = "";
    /* the quiet background sky */
    for (var b = 0; b < 26 * groups; b++) g += '<circle cx="' + (R() * W).toFixed(1) + '" cy="' + (R() * H).toFixed(1) + '" r="' + (0.4 + R() * 0.7).toFixed(2) + '" fill="#DCE6F2" opacity="' + (0.15 + R() * 0.3).toFixed(2) + '"/>';
    for (var k = 0; k < groups; k++) {
      var con = CON[k % CON.length], cyc = Math.floor(k / CON.length), ox = (k % cols) * cw + 40, oy = Math.floor(k / cols) * ch + 18;
      var J = rnd(k * 31 + 7), pts = con.p.map(function (q) { return [ox + q[0] + (J() - 0.5) * 6, oy + q[1] + (J() - 0.5) * 6]; });
      var lit = function (i) { return k * 7 + i < n; };
      con.L.forEach(function (l) {
        var a = pts[l[0]], c = pts[l[1]], on = lit(l[0]) && lit(l[1]);
        g += '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + c[0].toFixed(1) + '" y2="' + c[1].toFixed(1) + '" stroke="' + (on ? "#F4EAD2" : "#8AA0BC") + '" stroke-width="' + (on ? 1.3 : 0.8) + '" opacity="' + (on ? 0.6 : 0.18) + '"' + (on ? "" : ' stroke-dasharray="2 4"') + '/>';
      });
      pts.forEach(function (q, i) {
        var idx = k * 7 + i;
        if (idx < n) {
          var r = list[idx], kd = kindOf(r), s = Math.max(0.35, Math.min(1, strength(r)));
          g += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="' + (8 + 6 * s).toFixed(1) + '" fill="url(#aogSky-' + kd + ')" opacity="' + (0.5 + 0.4 * s).toFixed(2) + '"/>'
            + '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="' + (2 + 1.8 * s).toFixed(1) + '" fill="' + KIND[kd].c + '"/>'
            + '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="' + (0.9 + 0.6 * s).toFixed(1) + '" fill="#FFFDF5"/>';
          if (opt.mark && idx === n - 1) g += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="13" fill="none" stroke="#FFFDF5" stroke-width="1.4" opacity=".85"/>';
        } else g += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="1.5" fill="#B9C8DA" opacity=".35"/>';
      });
      var done = (k + 1) * 7 <= n, started = k * 7 < n;
      g += '<text x="' + (ox + 50) + '" y="' + (oy + 100) + '" text-anchor="middle" font-family="Fraunces,Georgia,serif" font-size="12" letter-spacing=".04em" fill="' + (done ? "#F2C964" : "#B9C8DA") + '" opacity="' + (done ? 1 : started ? 0.8 : 0.5) + '">' + esc((es ? con.es : con.en) + (cyc ? " " + ["", "II", "III", "IV", "V"][Math.min(cyc, 4)] : "")) + '</text>';
    }
    var defs = Object.keys(KIND).map(function (kd) { return '<radialGradient id="aogSky-' + kd + '"><stop offset="0" stop-color="' + KIND[kd].c + '" stop-opacity=".9"/><stop offset=".35" stop-color="' + KIND[kd].c + '" stop-opacity=".35"/><stop offset="1" stop-color="' + KIND[kd].c + '" stop-opacity="0"/></radialGradient>'; }).join("")
      + '<linearGradient id="aogSky-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06121F"/><stop offset=".6" stop-color="#0A1E33"/><stop offset="1" stop-color="#16365A"/></linearGradient>';
    var stars = n, cons = Math.floor(n / 7);
    var label = es ? ("Un cielo de noche con " + stars + " estrellas y " + cons + " constelaciones terminadas") : ("A night sky with " + stars + " stars and " + cons + " finished constellations");
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(label) + '"><defs>' + defs + '</defs><rect width="' + W + '" height="' + H + '" rx="14" fill="url(#aogSky-bg)"/>'
      + '<path d="M' + (W - 34) + ' 18a12 12 0 1 0 10 18a9.5 9.5 0 1 1 -10 -18z" fill="#F4EAD2" opacity=".85"/>' + g + '</svg>';
  }

  var CSS = ".aogsky{margin:16px 0 0}.aogsky svg{display:block;width:100%;height:auto;border-radius:14px;box-shadow:0 0 0 1px rgba(42,38,34,.35)}"
    + ".aogsky-cap{margin:10px 0 0;font-weight:700}.aogsky-lg{display:flex;flex-wrap:wrap;gap:6px 14px;margin:8px 0 0;font-size:14px}"
    + ".aogsky-lg span{display:inline-flex;align-items:center;gap:6px}.aogsky-lg i{width:12px;height:12px;border-radius:50%;box-shadow:0 0 0 1px rgba(0,0,0,.35)}"
    + "@media print{.aogsky svg{box-shadow:none}}";
  function css() { if (document.getElementById("aog-sky-css")) return; var s = document.createElement("style"); s.id = "aog-sky-css"; s.textContent = CSS; (document.head || document.documentElement).appendChild(s); }

  function html(list, opt) {
    opt = opt || {}; css();
    var es = !!opt.es, n = list.length, cons = Math.floor(n / 7), left = 7 - n % 7;
    var cap = es ? (n + (n === 1 ? " estrella" : " estrellas") + " · " + cons + (cons === 1 ? " constelación terminada" : " constelaciones terminadas") + " · " + left + " más para la siguiente")
      : (n + (n === 1 ? " star" : " stars") + " · " + cons + (cons === 1 ? " constellation finished" : " constellations finished") + " · " + left + " more for the next");
    var used = {}; list.forEach(function (r) { used[kindOf(r)] = 1; });
    var lg = Object.keys(KIND).filter(function (k) { return used[k]; }).map(function (k) { return '<span><i style="background:' + KIND[k].c + '"></i>' + esc(es ? KIND[k].es : KIND[k].en) + '</span>'; }).join("");
    return '<div class="aogsky">' + svg(list, opt) + '<p class="aogsky-cap">' + cap + '</p>' + (lg ? '<div class="aogsky-lg">' + lg + '</div>' : "") + '</div>';
  }
  window.AOGSky = { rows: rows, html: html, svg: svg };
})();
