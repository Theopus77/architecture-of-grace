/* =====================================================================
   ARCHITECTURE OF GRACE · MTSS INTEGRATION REPORTS  (elite edition)
   Maps each saved check-in to an MTSS tier (1 universal / 2 targeted /
   3 intensive). Views: Individual · Class & group · School-wide.
   Adds: live MTSS triangle, tier-movement over time, auto executive
   summary, CSV + copy exports, and a print cover page. localStorage only.
   ===================================================================== */
(function () {
  'use strict';
  var KEY = "aogScreener.v2.results";
  var META_KEY = "aog.mtss.meta";

  function L() {
    try { if (typeof dashLang !== "undefined" && dashLang) return dashLang; } catch (e) {}
    try { if (typeof lang !== "undefined" && lang) return lang; } catch (e) {}
    return "en";
  }
  function t(en, es) { return L() === "es" ? es : en; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function num(v) { return (v == null || isNaN(v)) ? null : Math.round(v); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "[]") || []; } catch (e) { return []; } }
  function meta() { try { return JSON.parse(localStorage.getItem(META_KEY) || "{}") || {}; } catch (e) { return {}; } }
  function saveMeta(m) { try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (e) {} }

  function latestByStudent(rows) {
    var m = {};
    rows.forEach(function (r) { var id = r.studentId || "—"; if (!m[id] || (r.timestamp || 0) > (m[id].timestamp || 0)) m[id] = r; });
    return Object.keys(m).map(function (k) { return m[k]; });
  }
  function allByStudent(rows) {
    var m = {};
    rows.forEach(function (r) { var id = r.studentId || "—"; (m[id] = m[id] || []).push(r); });
    Object.keys(m).forEach(function (k) { m[k].sort(function (a, b) { return (a.timestamp || 0) - (b.timestamp || 0); }); });
    return m;
  }
  function compOf(r) { var c = num(r.normComposite); if (c != null) return c; var a = r.normA || 0, b = r.normB || 0, cc = r.normC || 0; return Math.round((a + b + cc) / 3); }
  function tierOf(r) {
    if (r.tier === "High Risk") return 3;
    if (r.tier === "Some Risk") return 2;
    if (r.tier === "Low Risk") return 1;
    var c = compOf(r);
    return c < 50 ? 3 : c < 75 ? 2 : 1;
  }
  function movement(rows) {
    var m = allByStudent(rows), up = 0, hold = 0, down = 0, repeat = 0;
    Object.keys(m).forEach(function (k) {
      var arr = m[k]; if (arr.length < 2) return; repeat++;
      var first = tierOf(arr[0]), last = tierOf(arr[arr.length - 1]);
      if (last < first) up++; else if (last > first) down++; else hold++;
    });
    return { up: up, hold: hold, down: down, repeat: repeat };
  }
  var TIER = {
    1: { name: function () { return t("Tier 1 · Universal", "Nivel 1 · Universal"); }, sub: function () { return t("Core, whole-class support is working.", "El apoyo central para toda la clase funciona."); }, color: "#2E6B3A", bg: "#E8F2EA" },
    2: { name: function () { return t("Tier 2 · Targeted", "Nivel 2 · Específico"); }, sub: function () { return t("Small-group support and more frequent check-ins.", "Apoyo en grupo pequeño y chequeos más frecuentes."); }, color: "#B8860B", bg: "#FBF1DD" },
    3: { name: function () { return t("Tier 3 · Intensive", "Nivel 3 · Intensivo"); }, sub: function () { return t("Individualized, coordinated support.", "Apoyo individualizado y coordinado."); }, color: "#B23A3A", bg: "#F7E7E7" }
  };
  var DOM = {
    A: { name: function () { return t("Emotional Regulation & Well-Being", "Regulación emocional y bienestar"); }, k: "normA",
      support: function () { return t("the Window of Tolerance, a regulation toolkit, and paced-breathing / body-reset tools", "la Ventana de Tolerancia, un kit de regulación y herramientas de respiración / reinicio corporal"); } },
    B: { name: function () { return t("Self-Compassion & Growth Mindset", "Autocompasión y mentalidad de crecimiento"); }, k: "normB",
      support: function () { return t("the Kind Coach work, a Self-Compassion Letter, and reframing the inner critic", "el trabajo del Kind Coach, una Carta de Autocompasión y reencuadrar al crítico interior"); } },
    C: { name: function () { return t("Social Competency & Repair", "Competencia social y reparación"); }, k: "normC",
      support: function () { return t("the Three Sides protocol, perspective-taking, and repair practice", "el protocolo Tres Lados, la toma de perspectiva y la práctica de reparación"); } }
  };
  function bandColor(v) { return v >= 75 ? "#2E6B3A" : v >= 50 ? "#B8860B" : "#B23A3A"; }
  function lowestDomain(r) {
    var a = r.normA == null ? 100 : r.normA, b = r.normB == null ? 100 : r.normB, c = r.normC == null ? 100 : r.normC;
    var min = Math.min(a, b, c); return min === a ? "A" : min === b ? "B" : "C";
  }
  function gradeLabel(r) { if (r.population === "adult") return t("Adult", "Adulto"); return r.grade != null && r.grade !== "" ? (t("Grade ", "Grado ") + esc(r.grade)) : "—"; }
  function fmtDate(ts) { if (!ts) return "—"; try { return new Date(ts).toLocaleDateString(); } catch (e) { return "—"; } }
  function today() { try { return new Date().toLocaleDateString(); } catch (e) { return ""; } }

  function bar(label, v) {
    var val = num(v); var w = Math.max(0, Math.min(100, val == null ? 0 : val));
    return '<div class="mtss-bar"><div class="mtss-bar-l">' + label + '</div>'
      + '<div class="mtss-bar-track"><div class="mtss-bar-fill" style="width:' + w + '%;background:' + bandColor(w) + '"></div></div>'
      + '<div class="mtss-bar-v" style="color:' + bandColor(w) + '">' + (val == null ? "—" : val) + '</div></div>';
  }
  function tierBadge(tn) { var m = TIER[tn]; return '<span class="mtss-pill" style="color:' + m.color + ';background:' + m.bg + ';border-color:' + m.color + '">' + m.name() + '</span>'; }

  // ---- the iconic MTSS triangle, filled with live data ----
  function triangle(counts, n) {
    var apexY = 42, baseY = 252, cx = 182, halfBase = 162, H = baseY - apexY;
    function hw(y) { return halfBase * (y - apexY) / H; }
    function xl(y) { return (cx - hw(y)).toFixed(1); }
    function xr(y) { return (cx + hw(y)).toFixed(1); }
    var y1 = baseY - 0.50 * H, y2 = y1 - 0.28 * H; // band tops
    var pct = function (x) { return n ? Math.round(x / n * 100) : 0; };
    function band(yb, yt, col) { return '<polygon points="' + xl(yb) + ',' + yb.toFixed(1) + ' ' + xr(yb) + ',' + yb.toFixed(1) + ' ' + xr(yt) + ',' + yt.toFixed(1) + ' ' + xl(yt) + ',' + yt.toFixed(1) + '" fill="' + col + '" stroke="#fff" stroke-width="2.5"/>'; }
    function inLbl(y, tn, fs) { return '<text x="' + cx + '" y="' + y.toFixed(0) + '" text-anchor="middle" fill="#fff" font-weight="800" font-size="' + fs + '">' + t("Tier", "Nivel") + ' ' + tn + ' · ' + counts[tn] + ' (' + pct(counts[tn]) + '%)</text>'; }
    var s = '<svg viewBox="0 0 364 270" width="100%" style="max-width:430px;display:block;margin:6px auto 10px;" role="img" aria-label="MTSS tier triangle">';
    s += band(baseY, y1, TIER[1].color);
    s += band(y1, y2, TIER[2].color);
    s += '<polygon points="' + xl(y2) + ',' + y2.toFixed(1) + ' ' + xr(y2) + ',' + y2.toFixed(1) + ' ' + cx + ',' + apexY + '" fill="' + TIER[3].color + '" stroke="#fff" stroke-width="2.5"/>';
    s += inLbl((baseY + y1) / 2 + 5, 1, 14);
    s += inLbl((y1 + y2) / 2 + 5, 2, 12);
    // Tier 3 apex is too small for text — label it above the tip with a leader.
    s += '<line x1="' + cx + '" y1="' + (apexY - 12) + '" x2="' + cx + '" y2="' + apexY + '" stroke="' + TIER[3].color + '" stroke-width="1.2"/>';
    s += '<text x="' + cx + '" y="24" text-anchor="middle" fill="' + TIER[3].color + '" font-weight="800" font-size="13">' + t("Tier", "Nivel") + ' 3 · ' + counts[3] + ' (' + pct(counts[3]) + '%)</text>';
    s += '</svg>';
    return s;
  }
  function benchmarkRows(counts, n) {
    var bench = { 1: 80, 2: 15, 3: 5 };
    var pct = function (x) { return n ? Math.round(x / n * 100) : 0; };
    var h = '<div class="mtss-bench-grid">';
    [1, 2, 3].forEach(function (tn) {
      var a = pct(counts[tn]);
      h += '<div class="mtss-bench-row"><span class="mtss-bench-l">' + t("Tier", "Nivel") + ' ' + tn + '</span>'
        + '<div class="mtss-bench-track"><div class="mtss-bench-fill" style="width:' + a + '%;background:' + TIER[tn].color + '"></div>'
        + '<div class="mtss-bench-mark" style="left:' + bench[tn] + '%" title="' + t("target", "objetivo") + ' ' + bench[tn] + '%"></div></div>'
        + '<span class="mtss-bench-v">' + a + '% <span class="mtss-bench-t">/ ' + bench[tn] + '%</span></span></div>';
    });
    h += '</div>';
    return h;
  }
  function movementBlock(rows) {
    var mv = movement(rows);
    if (!mv.repeat) {
      return '<div class="mtss-move mtss-move-empty">' + t("Run a second round of check-ins to unlock tier-movement tracking — the clearest proof the supports are working.", "Haz una segunda ronda de chequeos para activar el seguimiento de movimiento entre niveles — la prueba más clara de que los apoyos funcionan.") + '</div>';
    }
    return '<div class="mtss-move">'
      + '<div class="mtss-move-item up"><div class="mtss-move-n">↑ ' + mv.up + '</div><div class="mtss-move-l">' + t("moved up a tier", "subieron de nivel") + '</div></div>'
      + '<div class="mtss-move-item hold"><div class="mtss-move-n">→ ' + mv.hold + '</div><div class="mtss-move-l">' + t("held steady", "se mantuvieron") + '</div></div>'
      + '<div class="mtss-move-item down"><div class="mtss-move-n">↓ ' + mv.down + '</div><div class="mtss-move-l">' + t("slipped a tier", "bajaron de nivel") + '</div></div>'
      + '<div class="mtss-move-foot">' + t("Across", "Entre") + ' ' + mv.repeat + ' ' + t("students with 2+ check-ins (first vs. latest).", "estudiantes con 2+ chequeos (primero vs. último).") + '</div></div>';
  }
  function execSummary(rows) {
    var people = latestByStudent(rows), n = people.length;
    var counts = { 1: 0, 2: 0, 3: 0 }, sumA = 0, sumB = 0, sumC = 0;
    people.forEach(function (p) { counts[tierOf(p)]++; sumA += p.normA || 0; sumB += p.normB || 0; sumC += p.normC || 0; });
    var pct = function (x) { return n ? Math.round(x / n * 100) : 0; };
    var avg = { A: sumA / n, B: sumB / n, C: sumC / n };
    var lowK = avg.A <= avg.B && avg.A <= avg.C ? "A" : (avg.B <= avg.C ? "B" : "C");
    var mv = movement(rows);
    var s = t("On " + today() + ", " + n + " participants completed the Universal Check-In. ",
      "El " + today() + ", " + n + " participantes completaron el Chequeo Universal. ");
    s += t(pct(counts[1]) + "% (" + counts[1] + ") are at Tier 1 (universal), " + pct(counts[2]) + "% (" + counts[2] + ") at Tier 2 (targeted), and " + pct(counts[3]) + "% (" + counts[3] + ") at Tier 3 (intensive). ",
      pct(counts[1]) + "% (" + counts[1] + ") están en Nivel 1 (universal), " + pct(counts[2]) + "% (" + counts[2] + ") en Nivel 2 (específico) y " + pct(counts[3]) + "% (" + counts[3] + ") en Nivel 3 (intensivo). ");
    s += t("The most common area of need is " + DOM[lowK].name() + ". ", "El área de mayor necesidad es " + DOM[lowK].name() + ". ");
    s += mv.repeat
      ? t("Across " + mv.repeat + " students with repeat check-ins, " + mv.up + " moved up at least one tier, " + mv.hold + " held steady, and " + mv.down + " slipped.",
        "Entre " + mv.repeat + " estudiantes con chequeos repetidos, " + mv.up + " subieron al menos un nivel, " + mv.hold + " se mantuvieron y " + mv.down + " bajaron.")
      : t("A second round of check-ins will show tier movement over time.", "Una segunda ronda de chequeos mostrará el movimiento entre niveles con el tiempo.");
    return s;
  }

  function emptyMsg() {
    return '<div class="mtss-empty">'
      + t("No check-ins are saved on this device yet. Run a check-in to populate this report — or load demo data to explore it right now.", "Aún no hay chequeos guardados en este dispositivo. Haz un chequeo para llenar este informe — o carga datos de demostración para explorarlo ahora mismo.")
      + '<div style="margin-top:16px;"><button type="button" class="mtss-print" onclick="window.aogMTSSLoadDemo&&window.aogMTSSLoadDemo()">'
      + t("Load demo data", "Cargar datos de demostración") + '</button></div>'
      + '</div>';
  }

  // =========================== VIEWS ===========================
  var _view = "individual", _student = null;

  function metaBar() {
    var m = meta();
    return '<div class="mtss-meta">'
      + '<label>' + t("School / Org", "Escuela / Org") + '<input id="mtssMetaSchool" value="' + esc(m.school || "") + '" placeholder="' + t("e.g. Lincoln Elementary", "p. ej. Primaria Lincoln") + '"></label>'
      + '<label>' + t("Prepared by", "Preparado por") + '<input id="mtssMetaBy" value="' + esc(m.by || "") + '" placeholder="' + t("your name", "tu nombre") + '"></label>'
      + '<label>' + t("Date / range", "Fecha / rango") + '<input id="mtssMetaDate" value="' + esc(m.date || today()) + '"></label>'
      + '</div>';
  }

  function viewIndividual(rows) {
    var groups = allByStudent(rows);
    var people = latestByStudent(rows).sort(function (a, b) { return tierOf(b) - tierOf(a) || compOf(a) - compOf(b); });
    if (!people.length) return emptyMsg();
    if (!_student || !people.some(function (p) { return (p.studentId || "—") === _student; })) _student = people[0].studentId || "—";
    var r = people.filter(function (p) { return (p.studentId || "—") === _student; })[0] || people[0];
    var hist = groups[_student] || [r];
    var tn = tierOf(r), ld = lowestDomain(r), dm = DOM[ld];
    var opts = people.map(function (p) { var id = p.studentId || "—"; return '<option value="' + esc(id) + '"' + (id === _student ? " selected" : "") + '>' + esc(id) + " — " + TIER[tierOf(p)].name() + "</option>"; }).join("");
    var supports = tn === 1
      ? t("Keep core (Tier 1) practice in place. Reinforce " + dm.support() + " with the whole class.", "Mantén la práctica central (Nivel 1). Refuerza " + dm.support() + " con toda la clase.")
      : tn === 2
        ? t("Add small-group (Tier 2) work using " + dm.support() + ". Re-check every 2–3 weeks.", "Añade trabajo en grupo pequeño (Nivel 2) usando " + dm.support() + ". Revisa cada 2–3 semanas.")
        : t("Begin an individualized (Tier 3) plan, coordinated with a counselor, using " + dm.support() + ". Progress-monitor weekly.", "Inicia un plan individualizado (Nivel 3), coordinado con un consejero, usando " + dm.support() + ". Monitorea semanalmente.");

    var h = metaBar();
    h += '<div class="mtss-pick"><label>' + t("Student", "Estudiante") + ':</label><select id="mtssStudentSel" onchange="window.__mtssPickStudent(this.value)">' + opts + '</select></div>';
    h += '<div class="mtss-report" id="mtssPrintArea">';
    h += '<div class="mtss-rep-head"><div><div class="mtss-rep-name">' + esc(r.studentId || "—") + '</div><div class="mtss-rep-meta">' + gradeLabel(r) + ' · ' + fmtDate(r.timestamp) + ' · ' + esc(r.mode === "depth" ? t("Thorough", "A fondo") : t("Quick", "Rápido")) + '</div></div>' + tierBadge(tn) + '</div>';
    // trajectory
    if (hist.length >= 2) {
      var first = hist[0], last = hist[hist.length - 1], ft = tierOf(first), lt = tierOf(last);
      var word = lt < ft ? t("improved", "mejoró") : lt > ft ? t("slipped", "bajó") : t("held steady", "se mantuvo");
      var arrow = lt < ft ? "↑" : lt > ft ? "↓" : "→";
      h += '<div class="mtss-traj"><strong>' + t("Trajectory", "Trayectoria") + ':</strong> ' + arrow + ' ' + word + ' — ' + TIER[ft].name() + ' (' + fmtDate(first.timestamp) + ') → ' + TIER[lt].name() + ' (' + fmtDate(last.timestamp) + ') · ' + t("composite", "compuesto") + ' ' + compOf(first) + '→' + compOf(last) + '</div>';
    }
    h += '<div class="mtss-rec" style="border-color:' + TIER[tn].color + '"><strong>' + t("Recommended support tier", "Nivel de apoyo recomendado") + ':</strong> ' + TIER[tn].name() + ' — ' + TIER[tn].sub() + '</div>';
    h += '<div class="mtss-sec-h">' + t("Scores", "Puntajes") + '</div>';
    h += bar(t("Composite", "Compuesto"), compOf(r)) + bar("A · " + DOM.A.name(), r.normA) + bar("B · " + DOM.B.name(), r.normB) + bar("C · " + DOM.C.name(), r.normC);
    h += '<div class="mtss-need"><strong>' + t("Area of greatest need", "Área de mayor necesidad") + ':</strong> ' + ld + ' · ' + dm.name() + '</div>';
    h += '<div class="mtss-sec-h">' + t("Suggested supports", "Apoyos sugeridos") + '</div><p class="mtss-p">' + supports + '</p>';
    h += '<div class="mtss-sec-h">' + t("Progress monitoring", "Monitoreo del progreso") + '</div>';
    h += '<table class="mtss-pm"><tbody>' + pmRow(t("Intervention chosen", "Intervención elegida")) + pmRow(t("Owner / who", "Responsable")) + pmRow(t("Goal", "Meta")) + pmRow(t("Start date", "Fecha de inicio"), t("Review date", "Fecha de revisión")) + '</tbody></table>';
    h += '<p class="mtss-foot">' + t("This is a reflective screener, not a diagnosis. Use it alongside your team’s judgment and your district’s MTSS process.", "Este es un cuestionario reflexivo, no un diagnóstico. Úsalo junto con el criterio de tu equipo y el proceso MTSS de tu distrito.") + '</p></div>';
    return h;
  }
  function pmRow(a, b) {
    if (b) return '<tr><th>' + a + '</th><td class="mtss-blank"></td><th>' + b + '</th><td class="mtss-blank"></td></tr>';
    return '<tr><th>' + a + '</th><td class="mtss-blank" colspan="3"></td></tr>';
  }

  function viewClass(rows) {
    var people = latestByStudent(rows).sort(function (a, b) { return tierOf(b) - tierOf(a) || compOf(a) - compOf(b); });
    if (!people.length) return emptyMsg();
    var counts = { 1: 0, 2: 0, 3: 0 }; people.forEach(function (p) { counts[tierOf(p)]++; });
    var h = metaBar();
    h += '<div class="mtss-exportbar"><button type="button" class="mtss-xbtn" onclick="window.__mtssCSV()">' + t("⤓ Export roster (CSV)", "⤓ Exportar lista (CSV)") + '</button></div>';
    h += '<div class="mtss-report" id="mtssPrintArea"><div class="mtss-rep-head"><div class="mtss-rep-name">' + t("Class & small-group view", "Vista de clase y grupo pequeño") + '</div></div>';
    h += '<div class="mtss-tiles">';
    [3, 2, 1].forEach(function (tn) { h += '<div class="mtss-tile" style="border-color:' + TIER[tn].color + '"><div class="mtss-tile-n" style="color:' + TIER[tn].color + '">' + counts[tn] + '</div><div class="mtss-tile-l">' + TIER[tn].name() + '</div></div>'; });
    h += '</div>';
    h += '<table class="mtss-roster"><thead><tr><th>' + t("Student", "Estudiante") + '</th><th>' + t("Grade", "Grado") + '</th><th>' + t("Comp.", "Comp.") + '</th><th>A</th><th>B</th><th>C</th><th>' + t("MTSS tier", "Nivel MTSS") + '</th></tr></thead><tbody>';
    people.forEach(function (p) {
      h += '<tr><td>' + esc(p.studentId || "—") + '</td><td>' + gradeLabel(p) + '</td><td>' + compOf(p) + '</td>'
        + '<td style="color:' + bandColor(p.normA || 0) + '">' + (num(p.normA) == null ? "—" : num(p.normA)) + '</td>'
        + '<td style="color:' + bandColor(p.normB || 0) + '">' + (num(p.normB) == null ? "—" : num(p.normB)) + '</td>'
        + '<td style="color:' + bandColor(p.normC || 0) + '">' + (num(p.normC) == null ? "—" : num(p.normC)) + '</td>'
        + '<td>' + tierBadge(tierOf(p)) + '</td></tr>';
    });
    h += '</tbody></table><p class="mtss-foot">' + t("Group students who share a Tier 2/3 need and the same low domain for small-group support.", "Agrupa a los estudiantes que comparten una necesidad de Nivel 2/3 y el mismo dominio bajo para apoyo en grupo pequeño.") + '</p></div>';
    return h;
  }

  function viewSchool(rows) {
    var people = latestByStudent(rows);
    if (!people.length) return emptyMsg();
    var n = people.length, counts = { 1: 0, 2: 0, 3: 0 }, sumA = 0, sumB = 0, sumC = 0, bands = {};
    people.forEach(function (p) {
      var tn = tierOf(p); counts[tn]++; sumA += p.normA || 0; sumB += p.normB || 0; sumC += p.normC || 0;
      var bk = p.population === "adult" ? t("Adults", "Adultos") : (t("Grade ", "Grado ") + (p.grade == null ? "—" : p.grade));
      bands[bk] = bands[bk] || { 1: 0, 2: 0, 3: 0, n: 0 }; bands[bk][tn]++; bands[bk].n++;
    });
    var h = metaBar();
    h += '<div class="mtss-exportbar">'
      + '<button type="button" class="mtss-xbtn" onclick="window.__mtssCopy()">' + t("⧉ Copy summary", "⧉ Copiar resumen") + '</button>'
      + '<button type="button" class="mtss-xbtn" onclick="window.__mtssCSV()">' + t("⤓ Export roster (CSV)", "⤓ Exportar lista (CSV)") + '</button></div>';
    h += '<div class="mtss-report" id="mtssPrintArea"><div class="mtss-rep-head"><div class="mtss-rep-name">' + t("School / grade-wide summary", "Resumen de toda la escuela / grado") + '</div><div class="mtss-rep-meta">' + n + ' ' + t("participants", "participantes") + '</div></div>';
    // executive summary
    h += '<div class="mtss-exec"><div class="mtss-exec-h">' + t("Executive summary", "Resumen ejecutivo") + '</div><p id="mtssExecText">' + esc(execSummary(rows)) + '</p></div>';
    // triangle (hero)
    h += '<div class="mtss-grid2"><div><div class="mtss-sec-h">' + t("MTSS distribution", "Distribución MTSS") + '</div>' + triangle(counts, n) + '</div>'
      + '<div><div class="mtss-sec-h">' + t("Actual vs. benchmark", "Real vs. referencia") + '</div>' + benchmarkRows(counts, n)
      + '<div class="mtss-bench-note">' + t("Healthy systems run ~80 / 15 / 5. A larger Tier 2/3 share points to a core (Tier 1) gap, not just individual need.", "Los sistemas saludables van ~80 / 15 / 5. Una mayor proporción de Nivel 2/3 indica una brecha central (Nivel 1), no solo necesidad individual.") + '</div></div></div>';
    // movement
    h += '<div class="mtss-sec-h">' + t("Tier movement over time", "Movimiento entre niveles") + '</div>' + movementBlock(rows);
    // domain averages
    h += '<div class="mtss-sec-h">' + t("Average domain scores", "Puntajes promedio por dominio") + '</div>';
    h += bar("A · " + DOM.A.name(), Math.round(sumA / n)) + bar("B · " + DOM.B.name(), Math.round(sumB / n)) + bar("C · " + DOM.C.name(), Math.round(sumC / n));
    // grade bands
    h += '<div class="mtss-sec-h">' + t("By grade band", "Por nivel de grado") + '</div>';
    h += '<table class="mtss-roster"><thead><tr><th>' + t("Band", "Banda") + '</th><th>n</th><th style="color:#2E6B3A">T1</th><th style="color:#B8860B">T2</th><th style="color:#B23A3A">T3</th></tr></thead><tbody>';
    Object.keys(bands).forEach(function (k) { var b = bands[k]; h += '<tr><td>' + esc(k) + '</td><td>' + b.n + '</td><td>' + b[1] + '</td><td>' + b[2] + '</td><td>' + b[3] + '</td></tr>'; });
    h += '</tbody></table><p class="mtss-foot">' + t("Aggregate only — no individual scores leave this view. A reflective screener, not a diagnosis.", "Solo agregado — ningún puntaje individual sale de esta vista. Un cuestionario reflexivo, no un diagnóstico.") + '</p></div>';
    return h;
  }

  // exports
  window.__mtssCSV = function () {
    var people = latestByStudent(load());
    var rows = [["Student", "Grade", "Composite", "A", "B", "C", "AoG tier", "MTSS tier", "Date"]];
    people.forEach(function (p) { rows.push([p.studentId || "", p.population === "adult" ? "Adult" : (p.grade == null ? "" : p.grade), compOf(p), num(p.normA) == null ? "" : num(p.normA), num(p.normB) == null ? "" : num(p.normB), num(p.normC) == null ? "" : num(p.normC), p.tier || "", "Tier " + tierOf(p), fmtDate(p.timestamp)]); });
    var csv = rows.map(function (r) { return r.map(function (c) { var s = String(c); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(","); }).join("\n");
    try {
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "AoG-MTSS-roster.csv";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (e) {}
  };
  window.__mtssCopy = function () {
    var txt = execSummary(load());
    try { if (navigator.clipboard) { navigator.clipboard.writeText(txt); return flash(); } } catch (e) {}
    try { var ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); flash(); } catch (e) {}
    function flash() { var b = document.querySelector('.mtss-xbtn'); if (b) { var o = b.textContent; b.textContent = t("✓ Copied", "✓ Copiado"); setTimeout(function () { b.textContent = o; }, 1400); } }
  };
  window.__mtssPickStudent = function (id) { _student = id; render(); };

  // persist meta inputs
  function wireMeta() {
    ["School", "By", "Date"].forEach(function (f) {
      var el = document.getElementById("mtssMeta" + f);
      if (el) el.addEventListener("input", function () { var m = meta(); m[f.toLowerCase()] = el.value; saveMeta(m); syncCover(); });
    });
  }
  function syncCover() {
    var m = meta();
    var set = function (id, v) { var e = document.getElementById(id); if (e) e.textContent = v || "—"; };
    set("mtssCovSchool", m.school); set("mtssCovBy", m.by); set("mtssCovDate", m.date || today());
    var vn = document.getElementById("mtssCovView"); if (vn) vn.textContent = _view === "individual" ? t("Individual Student", "Estudiante individual") : _view === "class" ? t("Class & Small Group", "Clase y grupo pequeño") : t("School / Grade-Wide", "Toda la escuela / grado");
  }

  function render() {
    var body = document.getElementById("mtssBody"); if (!body) return;
    var rows = load();
    document.querySelectorAll(".mtss-tab").forEach(function (b) { b.classList.toggle("active", b.dataset.v === _view); });
    body.innerHTML = _view === "individual" ? viewIndividual(rows) : _view === "class" ? viewClass(rows) : viewSchool(rows);
    wireMeta(); syncCover();
  }

  function ensureOverlay() {
    if (document.getElementById("mtssOverlay")) return;
    var ov = document.createElement("div"); ov.id = "mtssOverlay"; ov.className = "mtss-overlay";
    ov.innerHTML =
      '<div class="mtss-cover">'
      + '<div class="mtss-cover-mark">A</div>'
      + '<div class="mtss-cover-brand">Architecture of Grace</div>'
      + '<div class="mtss-cover-title">MTSS Integration Report</div>'
      + '<div class="mtss-cover-view" id="mtssCovView"></div>'
      + '<div class="mtss-cover-meta"><div><span>' + t("School / Org", "Escuela / Org") + '</span><b id="mtssCovSchool">—</b></div>'
      + '<div><span>' + t("Prepared by", "Preparado por") + '</span><b id="mtssCovBy">—</b></div>'
      + '<div><span>' + t("Date / range", "Fecha / rango") + '</span><b id="mtssCovDate">—</b></div></div>'
      + '<div class="mtss-cover-foot">' + t("Confidential — for educational planning. A reflective screener, not a diagnosis.", "Confidencial — para planificación educativa. Un cuestionario reflexivo, no un diagnóstico.") + '</div>'
      + '</div>'
      + '<div class="mtss-modal">'
      + '<div class="mtss-head"><div class="mtss-title">' + t("MTSS Integration Report", "Informe de integración MTSS") + '</div>'
      + '<div class="mtss-head-actions"><button class="mtss-print" type="button" onclick="window.print()">' + t("Print / Save PDF", "Imprimir / Guardar PDF") + '</button>'
      + '<button class="mtss-close" type="button" aria-label="Close" onclick="window.aogCloseMTSS()">✕</button></div></div>'
      + '<div class="mtss-tabs">'
      + '<button class="mtss-tab active" data-v="individual" type="button">' + t("Individual student", "Estudiante individual") + '</button>'
      + '<button class="mtss-tab" data-v="class" type="button">' + t("Class & group", "Clase y grupo") + '</button>'
      + '<button class="mtss-tab" data-v="school" type="button">' + t("School-wide", "Toda la escuela") + '</button>'
      + '</div><div class="mtss-body" id="mtssBody"></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener("click", function (e) { if (e.target === ov) window.aogCloseMTSS(); });
    ov.querySelectorAll(".mtss-tab").forEach(function (b) { b.addEventListener("click", function () { _view = b.dataset.v; render(); }); });
  }

  window.aogMTSSLoadDemo = function () {
    try {
      var active = false;
      try { active = localStorage.getItem("aogScreener.demoActive") === "1"; } catch (e) {}
      if (!active && typeof toggleDemoData === "function") toggleDemoData();
    } catch (e) {}
    render();
  };
  window.aogOpenMTSS = function () { ensureOverlay(); _view = "individual"; document.getElementById("mtssOverlay").classList.add("open"); render(); };
  window.aogCloseMTSS = function () { var o = document.getElementById("mtssOverlay"); if (o) o.classList.remove("open"); };
})();
