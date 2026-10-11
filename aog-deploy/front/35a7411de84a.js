
/* ============================================================
   THE GRACE TRAJECTORY — multi-year, per-student dashboard view (additive)
   Reads existing records via getAllRecords(); no schema change required.
   The season window is year-qualified at READ time from each record's
   timestamp, so Fall/Winter/Spring chain into one continuous line across
   school years. Tiers/colors match the live model (>=75 green, >=50 amber,
   else red). Nothing here writes data or alters existing behavior.
   ============================================================ */
(function () {
  var SEASON_IX = { Fall: 0, Winter: 1, Spring: 2, Summer: 3 };
  var SEASON_ABBR = { Fall: "F", Winter: "W", Spring: "Sp", Summer: "Su" };
  function pad2(n) { n = ((n % 100) + 100) % 100; return (n < 10 ? "0" : "") + n; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function num(v) { v = parseFloat(v); return isNaN(v) ? 0 : v; }
  function tColor(v) { return v >= 75 ? "var(--green)" : v >= 50 ? "var(--amber)" : "var(--red)"; }
  function tName(v) { return (typeof aogBandLabel === "function") ? aogBandLabel(v)
    : (v >= 75 ? "Keep noticing" : v >= 50 ? "Worth a conversation" : "Adult follow-up"); }

  /* derive a sortable, year-qualified window key from a record */
  function tjKey(rec) {
    var season = (rec.window || "").toString().trim();
    var d = new Date(rec.timestamp || Date.now());
    if (isNaN(d.getTime())) d = new Date();
    var y = d.getFullYear(), m = d.getMonth(); // 0 = Jan
    var si = SEASON_IX[season];
    if (si == null) si = (m >= 7 ? 0 : m <= 1 ? 1 : m <= 4 ? 2 : 3);
    var startYear = (m >= 7) ? y : y - 1;          // school year that owns this window
    var labelYear = (si === 0) ? startYear : startYear + 1;
    var abbr = SEASON_ABBR[season] || ["F", "W", "Sp", "Su"][si];
    return { sort: startYear * 10 + si, seasonIx: si, label: abbr + "'" + pad2(labelYear) };
  }

  function gather() {
    var recs = [];
    try { recs = (window.getAllRecords ? getAllRecords() : []) || []; } catch (e) { recs = []; }
    recs = recs.filter(function (r) {
      if (!r || r.normComposite == null) return false;
      if (ST.source === "school") return r.context !== "home";
      if (ST.source === "family") return r.context === "home";
      return true;
    });
    var by = {};
    recs.forEach(function (r) {
      var id = (r.studentId == null ? "" : String(r.studentId)).trim() || "—";
      var k = tjKey(r);
      (by[id] = by[id] || []).push({
        label: k.label, sort: k.sort, seasonIx: k.seasonIx,
        comp: num(r.normComposite), A: num(r.normA), B: num(r.normB), C: num(r.normC),
        grade: r.grade || "", ta: !!r.trustedAdultFlag, ts: r.timestamp
      });
    });
    Object.keys(by).forEach(function (id) {
      var seen = {};
      by[id].forEach(function (row) { var p = seen[row.sort]; if (!p || new Date(row.ts) >= new Date(p.ts)) seen[row.sort] = row; });
      by[id] = Object.keys(seen).map(function (s) { return seen[s]; }).sort(function (a, b) { return a.sort - b.sort; });
    });
    return by;
  }

  var ST = (window.__aogtj = window.__aogtj || { student: null, source: "all", vis: { comp: true, A: true, B: true, C: true } });
  if (!ST.source) ST.source = "all";
  if (!ST.view) ST.view = "line";
  if (!ST.gran) ST.gran = "season";
  var COLA = "var(--navy)", COLB = "var(--gold-deep,#9a6f24)", COLC = "#3a6ea5", COLK = "var(--red)";
  function el(id) { return document.getElementById(id); }

  var tjCtlMax = 0;
  // Lock the control strip (toolbar + chips/zoom or dropdowns/legend) to the tallest height
  // seen across source modes, so the chart below it always starts at the same Y — no shift.
  function lockTjCtl(host){ try{ var c=host&&host.querySelector('.aogtj-ctl'); if(!c) return; c.style.minHeight=''; var h=c.offsetHeight; if(h>tjCtlMax) tjCtlMax=h; c.style.minHeight=tjCtlMax+'px'; }catch(e){} }
  // Restore scroll INSTANTLY. The page sets `html{scroll-behavior:smooth}` globally, so a plain
  // scrollTo here animates into a visible glide on every re-render — force an instant snap.
  function tjPinScroll(y){ try{ var d=document.documentElement, prev=d.style.scrollBehavior; d.style.scrollBehavior='auto'; window.scrollTo(0,y); d.style.scrollBehavior=prev; }catch(e){} }
  window.aogRenderTrajectory = function () {
    var host = el("aogtjBody"); if (!host) return;
    var _tjScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
    var by = gather();
    var ids = Object.keys(by).sort(function (a, b) { return a.localeCompare(b); });
    if (!ids.length) {
      host.innerHTML = '<div class="aogtj-empty"><div class="aogtj-empty-h">No self-reflections yet</div>'
        + '<p>Each student’s multi-year line appears here as windows accrue across the year and across grades. Try demo data to see it in action.</p>'
        + '<button class="btn btn-secondary btn-sm" type="button" onclick="if(window.toggleDemoData)window.toggleDemoData();">Load demo data</button></div>';
      return;
    }
    /* Student-in-focus (audit P1): adopt the focus as the DEFAULT pick when
       it is fresher than this view's own last deliberate pick and actually
       has a line to show. One click on the picker undoes it. */
    try {
      var fc = window.AOGFocus ? AOGFocus.get() : null;
      if (fc && by[fc.code] && fc.at > (ST.pickedAt || 0)) { ST.student = fc.code; ST.pickedAt = fc.at; }
    } catch (eF) {}
    if (!ST.student || !by[ST.student]) ST.student = ids[0];
    if (!ST.visUserSet && by[ST.student] && by[ST.student].length) {
      var lw = by[ST.student][by[ST.student].length - 1];
      var lo = "A"; if (lw.B < lw[lo]) lo = "B"; if (lw.C < lw[lo]) lo = "C";
      ST.vis = { comp: true, A: lo === "A", B: lo === "B", C: lo === "C" };
    }
    var dailyIds = tjDailyIds();
    var opts = ids.map(function (id) {
      var mark = dailyIds[id] ? "• " : "";
      return '<option value="' + esc(id) + '"' + (id === ST.student ? " selected" : "") + ">" + mark + esc(id) + " · " + by[id].length + " window" + (by[id].length > 1 ? "s" : "") + "</option>";
    }).join("");
    function chip(k, label, color) { return '<span class="aogtj-chip' + (ST.vis[k] ? "" : " off") + '" style="border-color:' + color + ';color:' + color + '" role="button" tabindex="0" aria-pressed="' + (ST.vis[k] ? "true" : "false") + '" onclick="aogTjToggle(\'' + k + '\',this)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'||event.key===\'Spacebar\'){event.preventDefault();aogTjToggle(\'' + k + '\',this);}"><span class="sw" style="background:' + color + '"></span>' + label + "</span>"; }
    function srcToggle() {
      var DTx = function (en, es) { return (typeof DT === "function") ? DT(en, es) : en; };
      var opt = function (v, lab) { return '<button type="button" class="' + (ST.source === v ? "on" : "") + '" onclick="aogTjSource(\'' + v + '\')">' + lab + "</button>"; };
      return '<span class="aogtj-src" role="group" aria-label="' + DTx("Data source", "Origen de datos") + '">' + opt("all", DTx("All", "Todos")) + opt("school", DTx("School", "Escuela")) + opt("family", DTx("Family", "Familia")) + opt("both", DTx("Home + School", "Hogar + escuela")) + "</span>";
    }
    function viewToggle() {
      var DTx = function (en, es) { return (typeof DT === "function") ? DT(en, es) : en; };
      var opt = function (v, lab) { return '<button type="button" class="' + (ST.view === v ? "on" : "") + '" onclick="aogTjView(\'' + v + '\')">' + lab + "</button>"; };
      return '<span class="aogtj-src" role="group" aria-label="' + DTx("Chart type", "Tipo de gráfico") + '">' + opt("line", DTx("Line", "Línea")) + opt("bars", DTx("Bars", "Barras")) + "</span>";
    }
    if (ST.source === "both") {
      var DTx = function (en, es) { return (typeof DT === "function") ? DT(en, es) : en; };
      var pools = poolByContext();
      var sIds = Object.keys(pools.sch).sort(function (a, b) { return a.localeCompare(b); });
      var hIds = Object.keys(pools.hom).sort(function (a, b) { return a.localeCompare(b); });
      if (!sIds.length && !hIds.length) {
        host.innerHTML = '<div class="aogtj-empty"><div class="aogtj-empty-h">' + DTx("No self-reflections yet", "Aún no hay auto-reflexiones") + '</div><p>' + DTx("The combined view overlays one child’s school and home windows on one growth picture. Try demo data to see it.", "La vista combinada superpone las ventanas de la escuela y del hogar de un mismo niño en una sola imagen de crecimiento. Prueba los datos de demostración.") + '</p><button class="btn btn-secondary btn-sm" type="button" onclick="if(window.toggleDemoData)window.toggleDemoData();">' + DTx("Load demo data", "Cargar datos de demostración") + '</button></div>';
        return;
      }
      var links = tjLoadLinks();
      if (!ST.schoolId || pools.sch[ST.schoolId] === undefined) {
        var lastS = ""; try { lastS = localStorage.getItem("aog.tj.lastschool") || ""; } catch (e) {}
        ST.schoolId = (lastS && pools.sch[lastS]) ? lastS : (sIds[0] || "");
        if (links[ST.schoolId] != null && pools.hom[links[ST.schoolId]]) ST.homeId = links[ST.schoolId];
      }
      if (!ST.homeId || pools.hom[ST.homeId] === undefined) ST.homeId = hIds[0] || "";
      var isLinked = ST.schoolId && links[ST.schoolId] != null && links[ST.schoolId] === ST.homeId;
      var showHint = false; try { showHint = !localStorage.getItem("aog.tj.bothhint"); } catch (e) {}
      var sOpt = sIds.length ? sIds.map(function (id) { return '<option value="' + esc(id) + '"' + (id === ST.schoolId ? " selected" : "") + ">" + esc(id) + " · " + pools.sch[id].length + "w</option>"; }).join("") : '<option value="">' + DTx("(no school data)", "(sin datos escolares)") + "</option>";
      var hOpt = hIds.length ? hIds.map(function (id) { return '<option value="' + esc(id) + '"' + (id === ST.homeId ? " selected" : "") + ">" + esc(id) + " · " + pools.hom[id].length + "w</option>"; }).join("") : '<option value="">' + DTx("(no home data)", "(sin datos del hogar)") + "</option>";
      host.innerHTML =
        '<div class="aogtj-ctl">'
        + '<div class="aogtj-srcrow">' + srcToggle() + '</div>'
        + '<div class="aogtj-toolbar">'
        + '<div class="aogtj-group"><label class="aogtj-lbl" for="aogtjSchoolSel">' + DTx("School", "Escuela") + '</label>'
        + '<select id="aogtjSchoolSel" onchange="aogTjPickSchool(this.value)">' + sOpt + '</select></div>'
        + '<div class="aogtj-group"><label class="aogtj-lbl" for="aogtjHomeSel">' + DTx("Home", "Hogar") + '</label>'
        + '<select id="aogtjHomeSel" onchange="aogTjPickHome(this.value)">' + hOpt + '</select></div>'
        + '<div class="aogtj-group aogtj-right">'
        + '<span class="aogtj-meta" id="aogtjMeta"></span>'
        + '<span class="aogtj-acts">'
        + '<button class="aogtj-iep" type="button" aria-pressed="' + (isLinked ? "true" : "false") + '" aria-label="' + (isLinked ? DTx("Unlink this school code and home member", "Desvincular este código escolar y miembro del hogar") : DTx("Link this school code and home member as the same child", "Vincular este código escolar y miembro del hogar como el mismo niño")) + '" onclick="' + (isLinked ? "aogTjUnlink()" : "aogTjLink()") + '">' + (isLinked ? DTx("🔗 Linked — unlink", "🔗 Vinculado — desvincular") : DTx("🔗 Link as same child", "🔗 Vincular como mismo niño")) + '</button>'
        + '<button class="aogtj-print" id="aogtjPrint" type="button" aria-label="' + DTx("Open a print-friendly home-and-school summary", "Abrir un resumen imprimible de hogar y escuela") + '" onclick="aogTjPrintBoth()">' + DTx("Print summary", "Imprimir resumen") + '</button></span></div></div>'
        + '<div class="aogtj-legend">'
        + '<span class="aogtj-chip" style="border-color:var(--navy);color:var(--navy)"><span class="sw" style="background:var(--navy)"></span>' + DTx("School (solid line)", "Escuela (línea sólida)") + '</span>'
        + '<span class="aogtj-chip" style="border-color:var(--gold-deep,#9a6f24);color:var(--gold-deep,#9a6f24)"><span class="sw" style="background:var(--gold-deep,#9a6f24)"></span>' + DTx("Home (dashed line)", "Hogar (línea discontinua)") + '</span></div>'
        + (showHint ? '<div class="aogtj-sub" id="aogtjBothHint" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:-2px 0 6px;">🔒 ' + DTx("This pairing stays only on this device and browser.", "Esta vinculación permanece solo en este dispositivo y navegador.") + ' <a href="#" onclick="aogTjHintDismiss();return false;" style="color:var(--gold-deep,#9a6f24);font-weight:700;text-decoration:none;">' + DTx("Got it", "Entendido") + "</a></div>" : "")
        + '</div>'
        + '<div class="aogtj-chartwrap"><div id="aogtjChart"></div></div>'
        + '<div class="aogtj-card"><div class="aogtj-h">' + DTx("Across both environments", "En ambos entornos") + '</div><div class="aogtj-sub">' + DTx("One child’s growth at school and at home, on one picture. The closer the two lines, the more consistent the experience across environments — the same language, the same human, in both places.", "El crecimiento de un mismo niño en la escuela y en el hogar, en una sola imagen. Cuanto más cerca estén las dos líneas, más consistente es la experiencia entre entornos — el mismo lenguaje, la misma persona, en ambos lugares.") + '</div><div id="aogtjBothNote"></div></div>';
      var srows = pools.sch[ST.schoolId] || [], hrows = pools.hom[ST.homeId] || [];
      el("aogtjChart").innerHTML = combinedSvg(srows, hrows);
      var sl = srows.length ? srows[srows.length - 1] : null, hl = hrows.length ? hrows[hrows.length - 1] : null;
      var note = "";
      if (sl) note += '<div style="font-size:13px;margin:3px 0;"><b style="color:var(--navy)">' + DTx("School", "Escuela") + '</b> — ' + DTx("latest", "última") + " " + esc(ST.schoolId) + ": " + Math.round(sl.comp) + " · " + tName(sl.comp) + "</div>";
      if (hl) note += '<div style="font-size:13px;margin:3px 0;"><b style="color:var(--gold-deep,#9a6f24)">' + DTx("Home", "Hogar") + '</b> — ' + DTx("latest", "última") + " " + esc(ST.homeId) + ": " + Math.round(hl.comp) + " · " + tName(hl.comp) + "</div>";
      if (sl && hl) { var diff = Math.round(sl.comp - hl.comp); var ad = Math.abs(diff); note += '<div style="font-size:12.5px;color:var(--ink-soft);margin-top:7px;">' + DTx("School vs home gap", "Diferencia escuela vs hogar") + ": " + (diff > 0 ? "+" : "") + diff + " " + DTx("points", "puntos") + ". " + (ad <= 8 ? DTx("Closely aligned — both environments are telling a similar story.", "Muy alineados — ambos entornos cuentan una historia similar.") : DTx("A gap worth a conversation between home and school — a starting point, not a judgment.", "Una diferencia que vale una conversación entre el hogar y la escuela — un punto de partida, no un juicio.")) + "</div>"; }
      if (isLinked) note = '<div style="font-size:12px;color:var(--green);font-weight:700;margin-bottom:5px;">' + DTx("🔗 Linked as the same child — this pairing reopens automatically on this device.", "🔗 Vinculados como el mismo niño — esta combinación se reabre automáticamente en este dispositivo.") + "</div>" + note;
      el("aogtjBothNote").innerHTML = note || '<div class="aogtj-sub">' + DTx("Pick a school student and a home member to compare.", "Elige un estudiante de la escuela y un miembro del hogar para comparar.") + "</div>";
      lockTjCtl(host);
      tjPinScroll(_tjScroll);
      return;
    }
    var DTx0 = function (en, es) { return (typeof DT === "function") ? DT(en, es) : en; };
    var demoOn = false; try { demoOn = localStorage.getItem("aogScreener.demoActive") === "1"; } catch (e) {}
    var nudgeSeen = false; try { nudgeSeen = !!localStorage.getItem("aog.tj.bothnudge"); } catch (e) {}
    var hasHome = false; try { hasHome = (window.getAllRecords ? getAllRecords() : []).some(function (r) { return r && r.context === "home"; }); } catch (e) {}
    var nudge = (demoOn && hasHome && !nudgeSeen)
      ? '<div id="aogtjBothNudge" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:linear-gradient(90deg,color-mix(in srgb,var(--gold,#D9A33B) 16%,transparent),transparent);border:1px solid var(--gold,#D9A33B);border-radius:10px;padding:9px 12px;margin-bottom:12px;font-size:13px;">'
        + '<span style="font-size:15px;" aria-hidden="true">✨</span>'
        + '<span style="flex:1;min-width:160px;color:var(--ink);">' + DTx0("New: see one child’s growth at school and at home on one chart.", "Nuevo: mira el crecimiento de un mismo niño en la escuela y el hogar en un gráfico.") + '</span>'
        + '<button type="button" style="white-space:nowrap;background:var(--gold,#D9A33B);color:var(--navy,#0A1E33);border:1px solid var(--gold,#D9A33B);border-radius:8px;padding:6px 13px;font-weight:800;font-size:12.5px;cursor:pointer;box-shadow:0 2px 6px -2px rgba(154,111,36,.5);" onclick="aogTjTryBoth()">' + DTx0("Try the Both view", "Probar la vista Ambos") + ' &rarr;</button>'
        + '<a href="#" onclick="aogTjNudgeDismiss();return false;" aria-label="' + DTx0("Dismiss", "Descartar") + '" style="color:var(--ink-soft);text-decoration:none;font-weight:800;font-size:15px;line-height:1;">&times;</a>'
        + '</div>'
      : "";
    host.innerHTML = nudge + '<div class="aogtj-ctl">' +
      '<div class="aogtj-srcrow">' + srcToggle() + '</div>'
      + '<div class="aogtj-toolbar">'
      + '<div class="aogtj-group"><label class="aogtj-lbl" for="aogtjSel">Student</label>'
      + '<select id="aogtjSel" onchange="aogTjPick(this.value)">' + opts + "</select></div>"
      + '<div class="aogtj-group aogtj-view-controls">' + viewToggle() + '</div>'
      + '<div class="aogtj-group aogtj-right">'
      + '<span class="aogtj-meta" id="aogtjMeta"></span>'
      + '<span class="aogtj-acts">'
      + '<button class="aogtj-iep" id="aogtjIep" type="button" aria-live="polite" aria-label="Copy a printable IEP-style summary of this student to the clipboard" onclick="aogTjCopyIEP()">' + (typeof DT==='function'?DT('Copy IEP summary','Copiar resumen IEP'):'Copy IEP summary') + '</button>'
      + '<button class="aogtj-print" id="aogtjPrint" type="button" aria-label="Open a print-friendly one-page summary of this student" onclick="aogTjPrint()">' + (typeof DT==='function'?DT('Print summary','Imprimir resumen'):'Print summary') + '</button>'
      + '</span></div></div>'
      + '<div class="aogtj-legend">' + chip("comp", "Composite", COLK) + chip("A", "A · Regulation", COLA) + chip("B", "B · Self-Compassion", COLB) + chip("C", "C · Social &amp; Repair", COLC) + "</div>"
      + (function(){
          var T2 = function(en, es){ return (typeof DT === "function") ? DT(en, es) : en; };
          // Fine → Coarse order (matching granList() in Daily Log)
          var GG = [
            ["day",    T2("Day", "Día")],
            ["days3",  T2("3 Days", "3 días")],
            ["week",   T2("Week", "Semana")],
            ["week2",  T2("2 Weeks", "2 semanas")],
            ["week3",  T2("3 Weeks", "3 semanas")],
            ["month",  T2("Month", "Mes")],
            ["season", T2("Seasonal", "Por temporada")]
          ];
          var cur = ST.gran || "season";
          var buttons = GG.map(function(x){
            return '<button type="button" class="'+(cur===x[0]?"on":"")+'" onclick="aogTjGran(\''+x[0]+'\')">'+x[1]+'</button>';
          }).join("");
          return '<div class="aogtj-legend" style="align-items:center;margin-top:-4px;">' +
            '<span style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-faint);margin-right:6px;">' +
            T2("Zoom", "Zoom") + '</span>' +
            '<span class="aogtj-src" role="group" aria-label="' + T2("Time zoom", "Acercamiento de tiempo") + '">' +
            buttons +
            '</span>' +
            '<span style="font-size:11.5px;color:var(--ink-faint);margin-left:8px;">' +
            T2("Day = most detailed · Seasonal = full school-year view · • marks students with a daily log",
               "Día = más detalle · Por temporada = vista completa del año escolar · • marca estudiantes con registro diario") +
            '</span></div>';
        })()
      + '</div>'
      + '<div class="aogtj-chartwrap"><div id="aogtjChart"></div></div>'
      + '<div class="aogtj-cols"><div class="aogtj-card"><div class="aogtj-h">' + ((typeof DT==="function")?DT("Latest window profile","Perfil de la ventana más reciente"):"Latest window profile") + '</div><div id="aogtjProfile"></div></div>'
      + '<div class="aogtj-card"><div class="aogtj-h">' + ((typeof DT==="function")?DT("Tier journey","Trayectoria de niveles"):"Tier journey") + '</div><div id="aogtjJourney"></div><div id="aogtjFlag"></div></div></div>'
      + '<div class="aogtj-card"><div class="aogtj-chead" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;"><div class="aogtj-h">' + ((typeof DT==="function")?DT("Class movement, year over year","Movimiento de la clase, año tras año"):"Class movement, year over year") + '</div><span class="aogtj-src" role="group" aria-label="' + ((typeof DT==="function")?DT("Chart type","Tipo de gráfico"):"Chart type") + '"><button type="button" id="aogtjClassLineBtn" class="' + ((ST.classView==="line")?"on":"") + '" onclick="aogTjClassView(\'line\')">' + ((typeof DT==="function")?DT("Line","Línea"):"Line") + '</button><button type="button" id="aogtjClassBarsBtn" class="' + ((ST.classView==="line")?"":"on") + '" onclick="aogTjClassView(\'bars\')">' + ((typeof DT==="function")?DT("Bars","Barras"):"Bars") + '</button></span></div><div class="aogtj-sub">' + ((typeof DT==="function")?DT("Band composition per window across all students — the class climbing across years.","Composición por banda en cada ventana entre todos los estudiantes — la clase ascendiendo a lo largo de los años."):"Band composition per window across all students — the class climbing across years.") + '</div><div id="aogtjClass"></div></div>';
    aogTjClass(by);
    aogTjDraw();
    // Keep the chart from shifting: lock the control strip to the tallest height seen, then pin
    // scroll so replacing the body can't lurch the viewport (student / source / zoom / line-bars).
    lockTjCtl(host);
    tjPinScroll(_tjScroll);
  };

  window.aogTjPick = function (v) { ST.student = v; ST.pickedAt = Date.now(); try { if (window.AOGFocus) AOGFocus.set(v, "trajectory"); } catch (eF) {} aogTjDraw(); };
  window.aogTjToggle = function (k, c) { ST.vis[k] = !ST.vis[k]; ST.visUserSet = true; if (c) { c.classList.toggle("off", !ST.vis[k]); c.setAttribute("aria-pressed", ST.vis[k] ? "true" : "false"); } aogTjDraw(); };
  window.aogTjSource = function (s) { ST.source = s; ST.student = null; aogRenderTrajectory(); };
  window.aogTjView = function (v) { ST.view = v; aogRenderTrajectory(); };
  window.aogTjGran = function (g) { ST.gran = g; aogRenderTrajectory(); };
  window.aogTjPickSchool = function (v) { ST.schoolId = v; var lm = tjLoadLinks(); if (lm[v] != null) ST.homeId = lm[v]; aogRenderTrajectory(); };
  window.aogTjPickHome = function (v) { ST.homeId = v; aogRenderTrajectory(); };
  window.aogTjLink = function () { if (!ST.schoolId || !ST.homeId) return; var m = tjLoadLinks(); m[ST.schoolId] = ST.homeId; tjSaveLinks(m); try { localStorage.setItem("aog.tj.lastschool", ST.schoolId); } catch (e) {} aogRenderTrajectory(); };
  window.aogTjUnlink = function () { var m = tjLoadLinks(); delete m[ST.schoolId]; tjSaveLinks(m); aogRenderTrajectory(); };
  window.aogTjHintDismiss = function () { try { localStorage.setItem("aog.tj.bothhint", "1"); } catch (e) {} var e2 = el("aogtjBothHint"); if (e2) e2.style.display = "none"; };
  window.aogTjTryBoth = function () { try { localStorage.setItem("aog.tj.bothnudge", "1"); } catch (e) {} ST.source = "both"; ST.student = null; aogRenderTrajectory(); };
  window.aogTjNudgeDismiss = function () { try { localStorage.setItem("aog.tj.bothnudge", "1"); } catch (e) {} var e2 = el("aogtjBothNudge"); if (e2) e2.style.display = "none"; };
  window.aogTjPrintBoth = function () {
    var DTx = function (en, es) { return (typeof DT === "function") ? DT(en, es) : en; };
    var pools = poolByContext();
    var srows = (pools.sch[ST.schoolId] || []), hrows = (pools.hom[ST.homeId] || []);
    if (!srows.length && !hrows.length) return;
    var sl = srows.length ? srows[srows.length - 1] : null, hl = hrows.length ? hrows[hrows.length - 1] : null;
    var rowsHtml = function (rows, who) {
      if (!rows.length) return "<tr><td>" + who + "</td><td colspan='2' style='color:#777'>" + DTx("no data", "sin datos") + "</td></tr>";
      return rows.map(function (r) { return "<tr><td>" + who + "</td><td>" + esc(r.label) + "</td><td>" + Math.round(r.comp) + " · " + tName(r.comp) + "</td></tr>"; }).join("");
    };
    var gap = (sl && hl) ? Math.round(sl.comp - hl.comp) : null;
    var w = window.open("", "_blank"); if (!w) return;
    w.document.write('<!doctype html><html lang="' + (typeof GLANG !== "undefined" ? GLANG : "en") + '"><head><meta charset="utf-8"><title>Architecture of Grace — ' + DTx("Home &amp; School summary", "Resumen de hogar y escuela") + '</title>'
      + '<style>body{font:14px/1.5 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a1a1a;max-width:760px;margin:32px auto;padding:0 20px}h1{color:#0A1E33;font-size:22px;margin:0 0 2px}.sub{color:#9a6f24;font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:11px}table{border-collapse:collapse;width:100%;margin:14px 0}th,td{border:1px solid #ccc;padding:7px 10px;text-align:left;font-size:13px}th{background:#0A1E33;color:#fff}h2{color:#0A1E33;font-size:15px;margin:18px 0 4px}.svgwrap{border:1px solid #e6e0d2;border-radius:8px;padding:8px;margin:12px 0}.ft{margin-top:22px;border-top:1px solid #ccc;padding-top:8px;color:#666;font-size:11px;font-style:italic}</style></head><body>'
      + '<div class="sub">' + DTx("Home &amp; School — combined growth", "Hogar y escuela — crecimiento combinado") + '</div>'
      + '<h1>' + DTx("Architecture of Grace", "Architecture of Grace") + '</h1>'
      + '<p>' + DTx("School", "Escuela") + ": <b>" + esc(ST.schoolId || "—") + "</b> &nbsp;·&nbsp; " + DTx("Home", "Hogar") + ": <b>" + esc(ST.homeId || "—") + "</b></p>"
      + '<div class="svgwrap">' + combinedSvg(srows, hrows) + "</div>"
      + (gap !== null ? "<p>" + DTx("Latest school vs home gap", "Diferencia escuela vs hogar más reciente") + ": <b>" + (gap > 0 ? "+" : "") + gap + " " + DTx("points", "puntos") + "</b>. " + (Math.abs(gap) <= 8 ? DTx("Closely aligned across environments.", "Muy alineados entre entornos.") : DTx("A gap worth a home–school conversation.", "Una diferencia que vale una conversación entre hogar y escuela.")) + "</p>" : "")
      + "<h2>" + DTx("Window by window", "Ventana por ventana") + "</h2>"
      + "<table><tr><th>" + DTx("Setting", "Entorno") + "</th><th>" + DTx("Window", "Ventana") + "</th><th>" + DTx("Composite", "Compuesto") + "</th></tr>" + rowsHtml(srows, DTx("School", "Escuela")) + rowsHtml(hrows, DTx("Home", "Hogar")) + "</table>"
      + '<div class="ft">' + DTx("A relationship-centered reflection across home and school — a guide for growth, not a diagnosis. Composite 0–100; bands: 75+ Keep noticing, 50–74 Worth a conversation, under 50 Adult follow-up.", "Una reflexión centrada en las relaciones entre el hogar y la escuela — una guía para el crecimiento, no un diagnóstico. Compuesto 0–100; bandas: 75+ Seguir observando, 50–74 Vale una conversación, menos de 50 Seguimiento de un adulto.") + "</div>"
      + "</body></html>");
    w.document.close(); w.focus(); try { w.print(); } catch (e) {}
  };
  window.aogTjCopyIEP = function () {
    var by = gather(); var rows = by[ST.student]; if (!rows || !rows.length) return;
    var first = rows[0], last = rows[rows.length - 1];
    var d = Math.round(last.comp - first.comp);
    var trend = d >= 5 ? ("rising (+" + d + " since " + first.label + ")") : d <= -5 ? ("declining (" + d + " since " + first.label + ")") : "stable";
    var txt = [
      "ARCHITECTURE OF GRACE — Trajectory summary",
      "Student code: " + ST.student + "    Grade: " + (last.grade || "—"),
      "Windows tracked: " + rows.length + " (" + first.label + " → " + last.label + ")",
      "",
      "Latest window (" + last.label + "):",
      "  Composite: " + Math.round(last.comp) + "/100 — " + tName(last.comp),
      "  A · Emotional Regulation & Well-Being: " + Math.round(last.A),
      "  B · Self-Compassion & Growth Mindset: " + Math.round(last.B),
      "  C · Social Competency & Repair: " + Math.round(last.C),
      (last.ta ? "  Trusted-adult connection: present" : "  Trusted-adult: FLAG — low connection to a trusted adult (a flag on its own)"),
      "",
      "Trend: composite " + trend + ".",
      "",
      "Note: Architecture of Grace self-reflections are flags for support, not diagnoses. Interpret alongside other evidence."
    ].join("\n");
    var btn = document.getElementById("aogtjIep");
    function done() { if (btn) { var o = btn.textContent; btn.textContent = "Copied!"; btn.classList.add("copied"); setTimeout(function () { btn.textContent = o; btn.classList.remove("copied"); }, 1600); } }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, function () { window.prompt("Copy the IEP summary:", txt); });
    } else { window.prompt("Copy the IEP summary:", txt); }
  };
  window.aogTjPrint = function () {
    var by = gather(); var rows = by[ST.student]; if (!rows || !rows.length) return;
    var first = rows[0], last = rows[rows.length - 1];
    var dd = Math.round(last.comp - first.comp);
    var trend = dd >= 5 ? ("rising (+" + dd + " since " + first.label + ")") : dd <= -5 ? ("declining (" + dd + " since " + first.label + ")") : "stable";
    var doms = [["A · Emotional Regulation & Well-Being", last.A], ["B · Self-Compassion & Growth Mindset", last.B], ["C · Social Competency & Repair", last.C]];
    var domRows = doms.map(function (x) { var v = Math.round(x[1]); return '<tr><td>' + x[0] + '</td><td style="text-align:right;font-weight:800;color:' + tColor(v) + '">' + v + ' · ' + tName(v) + '</td></tr>'; }).join("");
    var jdots = rows.map(function (r) { var v = Math.round(r.comp); return '<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:' + tColor(v) + ';margin:0 4px;"></span>'; }).join("");
    var jlabels = rows.map(function (r) { return '<span style="display:inline-block;width:22px;text-align:center;font-size:9px;color:#46506E;">' + esc(r.label) + '</span>'; }).join("");
    var ct = tColor(last.comp);
    var doc = '<!doctype html><html><head><meta charset="utf-8"><title>Trajectory — ' + esc(ST.student) + '</title><style>'
      + ':root{--navy:#0A1E33;--green:#2E6B3A;--amber:#8A6D1F;--red:#8B2A2A;--green-bg:#E8F0E7;--amber-bg:#F5EAC8;--red-bg:#F3DFDC;--rule:#E4DAC5;--ink:#0A1E33;--ink-soft:#46506E;--ink-faint:#646E86;--gold:#D9A33B;--card:#fff;}'
      + 'body{font-family:-apple-system,Segoe UI,Inter,system-ui,sans-serif;color:#0A1E33;margin:32px;max-width:760px;}'
      + 'h1{font-family:Georgia,serif;font-size:22px;margin:0 0 2px;} h3{margin:16px 0 5px;font-size:14px;}'
      + '.sub{color:#46506E;font-size:13px;margin:0 0 16px;} .meta{font-size:13px;margin:0 0 8px;}'
      + 'table{width:100%;border-collapse:collapse;margin:4px 0 12px;font-size:13px;} td{padding:7px 4px;border-bottom:1px solid #E4DAC5;}'
      + '.flag{background:#F5EAC8;border-left:4px solid #8A6D1F;padding:9px 12px;border-radius:6px;font-size:12.5px;margin:8px 0;} .flag.ok{background:#E8F0E7;border-left-color:#2E6B3A;}'
      + '.disc{font-size:11px;color:#646E86;margin-top:20px;border-top:1px solid #E4DAC5;padding-top:10px;}'
      + 'svg{max-width:100%;height:auto;} @media print{body{margin:.5in;} .noprint{display:none;}}'
      + '</style></head><body>'
      + '<h1>Grace Trajectory — Student Summary</h1><p class="sub">Architecture of Grace · multi-year self-reflection</p>'
      + '<p class="meta"><b>Student code:</b> ' + esc(ST.student) + ' &nbsp;&nbsp; <b>Grade:</b> ' + esc(last.grade || "—") + ' &nbsp;&nbsp; <b>Windows:</b> ' + rows.length + ' (' + esc(first.label) + ' → ' + esc(last.label) + ')</p>'
      + '<h3>Multi-year trajectory</h3>' + lineSvg(rows)
      + '<h3>Latest window (' + esc(last.label) + ')</h3>'
      + '<table><tr><td><b>Composite</b></td><td style="text-align:right;font-weight:800;color:' + ct + '">' + Math.round(last.comp) + '/100 · ' + tName(last.comp) + '</td></tr>' + domRows + '</table>'
      + (last.ta ? '<div class="flag ok"><b>Trusted-adult connection present</b> on the latest window.</div>' : '<div class="flag"><b>Trusted-adult flag.</b> Low connection to a trusted adult — a flag on its own, regardless of the composite.</div>')
      + '<p style="font-size:13px;margin:6px 0;"><b>Trend:</b> composite ' + trend + '.</p>'
      + '<h3>' + ((typeof DT==="function")?DT("Tier journey","Trayectoria de niveles"):"Tier journey") + '</h3><div>' + jdots + '</div><div style="margin-top:2px;">' + jlabels + '</div>'
      + '<div class="disc">Architecture of Grace self-reflections are flags for support, not diagnoses. Interpret alongside other evidence. Generated ' + new Date().toLocaleDateString() + '.</div>'
      + '<p class="noprint" style="margin-top:18px;"><button onclick="window.print()" style="font:inherit;font-weight:700;background:#0A1E33;color:#fff;border:0;border-radius:8px;padding:9px 18px;cursor:pointer;">Print</button></p>'
      + '</body></html>';
    var w = window.open("", "_blank");
    if (!w) { alert("Please allow pop-ups to open the print-friendly summary."); return; }
    w.document.open(); w.document.write(doc); w.document.close(); w.focus();
    try { w.print(); } catch (e) {}
  };

  function aogTjDraw() {
    var by = gather(); var rows = by[ST.student]; if (!rows || !rows.length) return;
    var last = rows[rows.length - 1], meta = el("aogtjMeta");
    if (meta) meta.innerHTML = "Grade " + esc(last.grade || "—") + " · " + rows.length + " windows · latest <b style=\"color:" + tColor(last.comp) + "\">" + Math.round(last.comp) + " · " + tName(last.comp) + "</b>";
    var g = ST.gran || "season";
    if (g !== "season" && typeof window.aogDailyTrendSVG === "function") {
      var dr = window.aogDailyTrendSVG(ST.student, g, null, ST.view);
      if (dr && dr.has) {
        el("aogtjChart").innerHTML = dr.svg + '<div style="font-size:12px;color:var(--ink-faint);text-align:center;margin-top:4px;">' + (typeof DT === "function" ? DT("Daily-log zoom", "Acercamiento del registro diario") : "Daily-log zoom") + ' · ' + esc(dr.cap) + '</div>';
      } else {
        // Context-aware fallback message based on selected granularity
        var granLabel = (function(gr){
          var T2 = function(en, es){ return (typeof DT === "function") ? DT(en, es) : en; };
          if (gr === "day")    return T2("today", "hoy");
          if (gr === "days3")  return T2("the last 3 days", "los últimos 3 días");
          if (gr === "week")   return T2("this week", "esta semana");
          if (gr === "week2")  return T2("the last 2 weeks", "las últimas 2 semanas");
          if (gr === "week3")  return T2("the last 3 weeks", "las últimas 3 semanas");
          if (gr === "month")  return T2("this month", "este mes");
          return T2("this period", "este período");
        })(g);
        var msgEn = 'No daily log data for ' + granLabel + ' yet for &ldquo;' + esc(ST.student) + '&rdquo;. Add entries in the Daily Log tab using the same student code to see trends here.';
        var msgEs = 'Aún no hay datos de registro diario para ' + granLabel + ' de &ldquo;' + esc(ST.student) + '&rdquo;. Agrega entradas en la pestaña Registro diario con el mismo código para ver tendencias aquí.';
        el("aogtjChart").innerHTML =
          '<div style="padding:34px 16px;text-align:center;color:var(--ink-soft);font-size:13.5px;line-height:1.5;">' +
            (typeof DT === "function" ? DT(msgEn, msgEs) : "No daily log data yet for the selected range.") +
          '</div>';
      }
    } else {
      el("aogtjChart").innerHTML = (ST.view === "bars") ? barsSvg(rows) : lineSvg(rows);
    }
    el("aogtjProfile").innerHTML = profile(last);
    el("aogtjJourney").innerHTML = journey(rows);
    el("aogtjFlag").innerHTML = flag(last);
  }

  /* which student codes have at least one logged Daily Log day (for the dropdown marker) */
  function tjDailyIds() {
    var out = {};
    try {
      var st = JSON.parse(localStorage.getItem("aog.daily.v1") || "{}"); var logs = (st && st.logs) || {};
      Object.keys(logs).forEach(function (id) {
        var days = logs[id] || {};
        var any = Object.keys(days).some(function (d) { var day = days[d]; return day && day.periods && day.periods.length > 0; });
        if (any) out[id] = 1;
      });
    } catch (e) {}
    return out;
  }

  /* persistent school↔home pairings (this device only) for the combined "Both" view */
  function tjLoadLinks() { try { return JSON.parse(localStorage.getItem("aog.tj.links") || "{}") || {}; } catch (e) { return {}; } }
  function tjSaveLinks(m) { try { localStorage.setItem("aog.tj.links", JSON.stringify(m || {})); } catch (e) {} }

  /* group records into school vs home pools, latest-per-window, for the combined "Both" view */
  function poolByContext() {
    var recs = [];
    try { recs = (window.getAllRecords ? getAllRecords() : []) || []; } catch (e) { recs = []; }
    var sch = {}, hom = {};
    recs.forEach(function (r) {
      if (!r || r.normComposite == null) return;
      var id = (r.studentId == null ? "" : String(r.studentId)).trim(); if (!id) return;
      var dst = (r.context === "home") ? hom : sch;
      var k = tjKey(r);
      (dst[id] = dst[id] || []).push({
        label: k.label, sort: k.sort, seasonIx: k.seasonIx,
        comp: num(r.normComposite), A: num(r.normA), B: num(r.normB), C: num(r.normC),
        grade: r.grade || "", ta: !!r.trustedAdultFlag, ts: r.timestamp
      });
    });
    [sch, hom].forEach(function (d) {
      Object.keys(d).forEach(function (id) {
        var seen = {};
        d[id].forEach(function (row) { var p = seen[row.sort]; if (!p || new Date(row.ts) >= new Date(p.ts)) seen[row.sort] = row; });
        d[id] = Object.keys(seen).map(function (s) { return seen[s]; }).sort(function (a, b) { return a.sort - b.sort; });
      });
    });
    return { sch: sch, hom: hom };
  }

  /* overlay a school series and a home series on one chart, on the union of windows */
  function combinedSvg(srows, hrows) {
    var W = 900, H = 320, ml = 40, mr = 130, mt = 18, mb = 42;
    var all = {};
    srows.forEach(function (r) { all[r.sort] = { sort: r.sort, label: r.label, seasonIx: r.seasonIx }; });
    hrows.forEach(function (r) { if (!all[r.sort]) all[r.sort] = { sort: r.sort, label: r.label, seasonIx: r.seasonIx }; });
    var wins = Object.keys(all).map(function (k) { return all[k]; }).sort(function (a, b) { return a.sort - b.sort; });
    var idx = {}; wins.forEach(function (w, i) { idx[w.sort] = i; });
    var n = wins.length || 1;
    var X = function (i) { return ml + (W - ml - mr) * (n <= 1 ? 0.5 : i / (n - 1)); };
    var Y = function (v) { return mt + (H - mt - mb) * (1 - Math.max(0, Math.min(100, v)) / 100); };
    var s = "";
    [[75, 100, "var(--green-bg)"], [50, 75, "var(--amber-bg)"], [0, 50, "var(--red-bg)"]].forEach(function (b) { s += '<rect x="' + ml + '" y="' + Y(b[1]) + '" width="' + (W - ml - mr) + '" height="' + (Y(b[0]) - Y(b[1])) + '" fill="' + b[2] + '" opacity="0.6"/>'; });
    [0, 25, 50, 75, 100].forEach(function (t) { s += '<line x1="' + ml + '" y1="' + Y(t) + '" x2="' + (W - mr) + '" y2="' + Y(t) + '" stroke="var(--rule)" stroke-width="1"/><text x="' + (ml - 6) + '" y="' + (Y(t) + 3) + '" text-anchor="end" font-size="10" fill="var(--ink-faint)">' + t + "</text>"; });
    s += '<text x="' + (W - mr + 8) + '" y="' + Y(89) + '" text-anchor="start" font-size="9" font-weight="700" fill="var(--green)">DOING WELL</text>';
    s += '<text x="' + (W - mr + 8) + '" y="' + Y(62) + '" text-anchor="start" font-size="9" font-weight="700" fill="var(--amber)">WORTH A REFLECTION</text>';
    s += '<text x="' + (W - mr + 8) + '" y="' + Y(23) + '" text-anchor="start" font-size="9" font-weight="700" fill="var(--red)">NEEDS SUPPORT</text>';
    wins.forEach(function (w, i) { if (i > 0 && w.seasonIx === 0) { s += '<line x1="' + X(i) + '" y1="' + mt + '" x2="' + X(i) + '" y2="' + (H - mb) + '" stroke="var(--ink-faint)" stroke-width="1" stroke-dasharray="3 4" opacity="0.5"/><text x="' + X(i) + '" y="' + (mt + 10) + '" text-anchor="middle" font-size="8.5" font-weight="700" fill="var(--ink-faint)">new year</text>'; } });
    wins.forEach(function (w, i) { s += '<text x="' + X(i) + '" y="' + (H - mb + 18) + '" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink-soft)">' + esc(w.label) + "</text>"; });
    function plot(rows, color, dash, below) {
      if (!rows.length) return "";
      var pts = rows.map(function (r) { return { x: X(idx[r.sort]), y: Y(r.comp), v: r.comp }; });
      var d = ""; pts.forEach(function (pt, i) { d += (i ? "L" : "M") + pt.x.toFixed(1) + " " + pt.y.toFixed(1) + " "; });
      var o = '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"' + (dash ? ' stroke-dasharray="7 5"' : "") + "/>";
      pts.forEach(function (pt) { o += '<circle cx="' + pt.x.toFixed(1) + '" cy="' + pt.y.toFixed(1) + '" r="4" fill="#fff" stroke="' + color + '" stroke-width="2.4"/><text x="' + pt.x.toFixed(1) + '" y="' + (below ? pt.y + 16 : pt.y - 9) + '" text-anchor="middle" font-size="10" font-weight="800" fill="' + color + '">' + Math.round(pt.v) + "</text>"; });
      return o;
    }
    s += plot(srows, "var(--navy)", false, false);
    s += plot(hrows, "var(--gold-deep,#9a6f24)", true, true);
    return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="School and home trajectory" style="width:100%;min-width:560px;display:block;">' + s + "</svg>";
  }

  function lineSvg(rows) {
    var W = 900, H = 320, ml = 40, mr = 110, mt = 18, mb = 42, n = rows.length;
    var X = function (i) { return ml + (W - ml - mr) * (n <= 1 ? 0.5 : i / (n - 1)); };
    var Y = function (v) { return mt + (H - mt - mb) * (1 - Math.max(0, Math.min(100, v)) / 100); };
    var s = "";
    [[75, 100, "var(--green-bg)"], [50, 75, "var(--amber-bg)"], [0, 50, "var(--red-bg)"]].forEach(function (b) {
      s += '<rect x="' + ml + '" y="' + Y(b[1]) + '" width="' + (W - ml - mr) + '" height="' + (Y(b[0]) - Y(b[1])) + '" fill="' + b[2] + '" opacity="0.6"/>';
    });
    [0, 25, 50, 75, 100].forEach(function (t) { s += '<line x1="' + ml + '" y1="' + Y(t) + '" x2="' + (W - mr) + '" y2="' + Y(t) + '" stroke="var(--rule)" stroke-width="1"/><text x="' + (ml - 6) + '" y="' + (Y(t) + 3) + '" text-anchor="end" font-size="10" fill="var(--ink-faint)">' + t + "</text>"; });
    s += '<text x="' + (W - mr + 8) + '" y="' + Y(89) + '" text-anchor="start" font-size="9" font-weight="700" fill="var(--green)">DOING WELL</text>';
    s += '<text x="' + (W - mr + 8) + '" y="' + Y(62) + '" text-anchor="start" font-size="9" font-weight="700" fill="var(--amber)">WORTH A REFLECTION</text>';
    s += '<text x="' + (W - mr + 8) + '" y="' + Y(23) + '" text-anchor="start" font-size="9" font-weight="700" fill="var(--red)">NEEDS SUPPORT</text>';
    if (rows.length) { var fc = rows[0].comp; var ti0 = fc >= 75 ? 2 : fc >= 50 ? 1 : 0; var tlo = (ti0 === 0) ? 50 : 75; var tlbl = (ti0 >= 2 ? "Maintain: " : "Goal: ") + tName(tlo); s += '<line x1="' + ml + '" y1="' + Y(tlo) + '" x2="' + (W - mr) + '" y2="' + Y(tlo) + '" stroke="var(--gold-deep,#9a6f24)" stroke-width="1.5" stroke-dasharray="6 4"/><text x="' + (ml + 4) + '" y="' + (Y(tlo) - 4) + '" font-size="9.5" font-weight="800" fill="var(--gold-deep,#9a6f24)">' + tlbl + '</text>'; }
    rows.forEach(function (r, i) { if (i > 0 && r.seasonIx === 0) { s += '<line x1="' + X(i) + '" y1="' + mt + '" x2="' + X(i) + '" y2="' + (H - mb) + '" stroke="var(--ink-faint)" stroke-width="1" stroke-dasharray="3 4" opacity="0.5"/><text x="' + X(i) + '" y="' + (mt + 10) + '" text-anchor="middle" font-size="8.5" font-weight="700" fill="var(--ink-faint)">new year</text>'; } });
    rows.forEach(function (r, i) { s += '<text x="' + X(i) + '" y="' + (H - mb + 18) + '" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink-soft)">' + esc(r.label) + "</text>"; });
    var series = [];
    if (ST.vis.A) series.push({ k: "A", col: COLA, w: 2 });
    if (ST.vis.B) series.push({ k: "B", col: COLB, w: 2 });
    if (ST.vis.C) series.push({ k: "C", col: COLC, w: 2 });
    if (ST.vis.comp) series.push({ k: "comp", col: COLK, w: 3.2, lab: true });
    series.forEach(function (d) {
      var p = ""; rows.forEach(function (r, i) { p += (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(r[d.k]).toFixed(1) + " "; });
      s += '<path d="' + p + '" fill="none" stroke="' + d.col + '" stroke-width="' + d.w + '" stroke-linecap="round" stroke-linejoin="round" opacity="' + (d.k === "comp" ? 1 : 0.85) + '"/>';
      rows.forEach(function (r, i) {
        s += '<circle cx="' + X(i) + '" cy="' + Y(r[d.k]) + '" r="' + (d.k === "comp" ? 4.5 : 3) + '" fill="#fff" stroke="' + d.col + '" stroke-width="2"/>';
        if (d.lab) s += '<text x="' + X(i) + '" y="' + (Y(r[d.k]) - 10) + '" text-anchor="middle" font-size="10.5" font-weight="800" fill="' + d.col + '">' + Math.round(r.comp) + "</text>";
      });
    });
    return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Multi-year trajectory" style="width:100%;min-width:560px;display:block;">' + s + "</svg>";
  }
  function barsSvg(rows) {
    var W = 900, H = 320, ml = 40, mr = 110, mt = 18, mb = 42, n = rows.length;
    var Y = function (v) { return mt + (H - mt - mb) * (1 - Math.max(0, Math.min(100, v)) / 100); };
    var plotW = W - ml - mr, slot = plotW / n, bw = Math.min(64, slot * 0.5);
    var X = function (i) { return ml + slot * i + slot / 2; };
    var s = "";
    [[75, 100, "var(--green-bg)"], [50, 75, "var(--amber-bg)"], [0, 50, "var(--red-bg)"]].forEach(function (b) { s += '<rect x="' + ml + '" y="' + Y(b[1]) + '" width="' + plotW + '" height="' + (Y(b[0]) - Y(b[1])) + '" fill="' + b[2] + '" opacity="0.6"/>'; });
    [0, 25, 50, 75, 100].forEach(function (t) { s += '<line x1="' + ml + '" y1="' + Y(t) + '" x2="' + (W - mr) + '" y2="' + Y(t) + '" stroke="var(--rule)" stroke-width="1"/><text x="' + (ml - 6) + '" y="' + (Y(t) + 3) + '" text-anchor="end" font-size="10" fill="var(--ink-faint)">' + t + "</text>"; });
    s += '<text x="' + (W - mr + 8) + '" y="' + Y(89) + '" text-anchor="start" font-size="9" font-weight="700" fill="var(--green)">DOING WELL</text>';
    s += '<text x="' + (W - mr + 8) + '" y="' + Y(62) + '" text-anchor="start" font-size="9" font-weight="700" fill="var(--amber)">WORTH A REFLECTION</text>';
    s += '<text x="' + (W - mr + 8) + '" y="' + Y(23) + '" text-anchor="start" font-size="9" font-weight="700" fill="var(--red)">NEEDS SUPPORT</text>';
    if (rows.length) { var fc = rows[0].comp; var ti0 = fc >= 75 ? 2 : fc >= 50 ? 1 : 0; var tlo = (ti0 === 0) ? 50 : 75; var tlbl = (ti0 >= 2 ? "Maintain: " : "Goal: ") + tName(tlo); s += '<line x1="' + ml + '" y1="' + Y(tlo) + '" x2="' + (W - mr) + '" y2="' + Y(tlo) + '" stroke="var(--gold-deep,#9a6f24)" stroke-width="1.5" stroke-dasharray="6 4"/><text x="' + (ml + 4) + '" y="' + (Y(tlo) - 4) + '" font-size="9.5" font-weight="800" fill="var(--gold-deep,#9a6f24)">' + tlbl + '</text>'; }
    rows.forEach(function (r, i) { if (i > 0 && r.seasonIx === 0) { var xx = ml + slot * i; s += '<line x1="' + xx + '" y1="' + mt + '" x2="' + xx + '" y2="' + (H - mb) + '" stroke="var(--ink-faint)" stroke-width="1" stroke-dasharray="3 4" opacity="0.5"/><text x="' + xx + '" y="' + (mt + 10) + '" text-anchor="middle" font-size="8.5" font-weight="700" fill="var(--ink-faint)">new year</text>'; } });
    rows.forEach(function (r, i) { var v = r.comp; var cx = X(i); var x = cx - bw / 2; var y = Y(v); var h = Y(0) - y; s += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3" fill="' + tColor(v) + '"/><text x="' + cx.toFixed(1) + '" y="' + (y - 6) + '" text-anchor="middle" font-size="11" font-weight="800" fill="var(--ink)">' + Math.round(v) + '</text>'; });
    rows.forEach(function (r, i) { s += '<text x="' + X(i).toFixed(1) + '" y="' + (H - mb + 18) + '" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink-soft)">' + esc(r.label) + "</text>"; });
    return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Multi-year trajectory (bars)" style="width:100%;min-width:560px;display:block;">' + s + "</svg>";
  }

  function profile(last) {
    var D = [["A", "A · Emotional Regulation &amp; Well-Being"], ["B", "B · Self-Compassion &amp; Growth Mindset"], ["C", "C · Social Competency &amp; Repair"]];
    var h = '<div class="aogtj-prof-win">' + esc(last.label) + "</div>";
    D.forEach(function (d) { var v = Math.round(last[d[0]]); h += '<div class="aogtj-bar"><div class="aogtj-bl"><span>' + d[1] + '</span><span style="color:' + tColor(v) + '">' + v + '</span></div><div class="aogtj-track"><div class="aogtj-fill" style="width:' + v + "%;background:" + tColor(v) + '"></div></div></div>'; });
    var cv = Math.round(last.comp);
    h += '<div class="aogtj-bar"><div class="aogtj-bl"><span style="font-weight:800">Composite</span><span style="color:' + tColor(cv) + '">' + cv + " · " + tName(cv) + '</span></div><div class="aogtj-track" style="height:15px"><div class="aogtj-fill" style="width:' + cv + "%;background:" + tColor(cv) + '"></div></div></div>';
    return h;
  }

  function journey(rows) {
    return '<div class="aogtj-journey">' + rows.map(function (r) { var v = Math.round(r.comp); return '<div class="aogtj-jstep"><div class="aogtj-jdot" style="background:' + tColor(v) + '" title="' + tName(v) + " (" + v + ')"></div><div class="aogtj-jwin">' + esc(r.label) + "</div></div>"; }).join("") + "</div>";
  }

  function flag(last) {
    if (last.ta) return '<div class="aogtj-flag ok"><span>✓</span><div><b>Trusted-adult connection present</b> on the latest window.</div></div>';
    return '<div class="aogtj-flag"><span>⚠</span><div><b>Trusted-adult flag.</b> Connection to a trusted adult is low on the latest window — a flag on its own, regardless of the composite.</div></div>';
  }

  function aogTjClassLineSvg(order, wins) {
    var T = function (en, es) { return (typeof DT === "function") ? DT(en, es) : en; };
    var W = 720, H = 248, padL = 30, padR = 12, padT = 14, padB = 36;
    var n = order.length;
    var X = function (i) { return n <= 1 ? (padL + (W - padL - padR) / 2) : padL + (W - padL - padR) * (i / (n - 1)); };
    var Y = function (p) { return padT + (H - padT - padB) * (1 - p / 100); };
    var pct = function (c, k) { return c.n ? (c[k] / c.n * 100) : 0; };
    var series = [ { k: "g", col: "var(--green)", en: "Keep noticing", es: "Seguir observando" }, { k: "a", col: "var(--amber)", en: "Worth a conversation", es: "Vale una conversación" }, { k: "d", col: "var(--red)", en: "Adult follow-up", es: "Seguimiento de un adulto" } ];
    var grid = "";
    [0, 25, 50, 75, 100].forEach(function (g) { var yy = Y(g); grid += '<line x1="' + padL + '" y1="' + yy + '" x2="' + (W - padR) + '" y2="' + yy + '" stroke="var(--rule)" stroke-width="1"/><text x="' + (padL - 5) + '" y="' + (yy + 3) + '" text-anchor="end" font-size="9" fill="var(--ink-faint)">' + g + '</text>'; });
    var xlabels = order.map(function (w, i) { return '<text x="' + X(i).toFixed(1) + '" y="' + (H - padB + 15) + '" text-anchor="middle" font-size="9" fill="var(--ink-faint)">' + esc(w) + '</text>'; }).join("");
    var lines = series.map(function (s) {
      var pts = order.map(function (w, i) { return X(i).toFixed(1) + "," + Y(pct(wins[w], s.k)).toFixed(1); }).join(" ");
      var dots = order.map(function (w, i) { return '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(pct(wins[w], s.k)).toFixed(1) + '" r="3" fill="' + s.col + '"/>'; }).join("");
      return '<polyline points="' + pts + '" fill="none" stroke="' + s.col + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>' + dots;
    }).join("");
    var legend = series.map(function (s) { return '<span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--ink-soft);margin-right:14px;"><span style="width:14px;height:3px;border-radius:2px;background:' + s.col + ';display:inline-block;"></span>' + T(s.en, s.es) + '</span>'; }).join("");
    return '<div style="margin:2px 0 8px;">' + legend + '</div><svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + T("Share of class in each band over time", "Proporción de la clase en cada banda a lo largo del tiempo") + '">' + grid + lines + xlabels + '</svg>';
  }
  window.aogTjClassView = function (v) {
    ST.classView = (v === "line") ? "line" : "bars";
    try { localStorage.setItem("aog.tj.classview", ST.classView); } catch (e) {}
    var lb = el("aogtjClassLineBtn"), bb = el("aogtjClassBarsBtn");
    if (lb) lb.classList.toggle("on", ST.classView === "line");
    if (bb) bb.classList.toggle("on", ST.classView !== "line");
    if (window.__aogTjBy) aogTjClass(window.__aogTjBy);
  };
  function aogTjClass(by) {
    window.__aogTjBy = by;
    if (ST.classView == null) { try { ST.classView = localStorage.getItem("aog.tj.classview") || "bars"; } catch (e) { ST.classView = "bars"; } }
    var wins = {};
    Object.keys(by).forEach(function (id) { by[id].forEach(function (r) { var w = (wins[r.label] = wins[r.label] || { sort: r.sort, g: 0, a: 0, d: 0, n: 0 }); if (r.comp >= 75) w.g++; else if (r.comp >= 50) w.a++; else w.d++; w.n++; }); });
    var order = Object.keys(wins).sort(function (a, b) { return wins[a].sort - wins[b].sort; });
    var box = el("aogtjClass"); if (!box) return;
    if (!order.length) { box.innerHTML = '<div class="aogtj-sub">No windows yet.</div>'; return; }
    if ((ST.classView || "bars") === "line") {
      box.innerHTML = aogTjClassLineSvg(order, wins);
    } else {
      box.innerHTML = order.map(function (w) {
        var c = wins[w], seg = function (v, col, t) { return v > 0 ? '<div class="aogtj-cseg" style="flex:' + v + ";background:" + col + '" title="' + t + ": " + v + '">' + v + "</div>" : ""; };
        return '<div class="aogtj-crow"><div class="aogtj-cwin">' + esc(w) + '</div><div class="aogtj-cbar">' + seg(c.g, "var(--green)", tName(80)) + seg(c.a, "var(--amber)", tName(60)) + seg(c.d, "var(--red)", tName(10)) + '</div><div class="aogtj-cn">' + c.n + "</div></div>";
      }).join("");
    }
    var _lb = el("aogtjClassLineBtn"), _bb = el("aogtjClassBarsBtn");
    if (_lb) _lb.classList.toggle("on", ST.classView === "line");
    if (_bb) _bb.classList.toggle("on", ST.classView !== "line");
    var DTx = function (en, es) { return (typeof DT === "function") ? DT(en, es) : en; };
    var f = wins[order[0]], l = wins[order[order.length - 1]];
    var pct = function (c) { return c.n ? Math.round((c.g / c.n) * 100) : 0; };
    var p0 = pct(f), p1 = pct(l), dlt = p1 - p0;
    var dir = dlt > 0 ? DTx("up", "más") : dlt < 0 ? DTx("down", "menos") : DTx("about the same as", "casi igual que");
    var plain;
    if (order.length < 2) {
      plain = DTx("In plain terms: in " + order[0] + ", " + p1 + "% of check-ins land in the green “Keep noticing” band. More windows will show the class climbing over time.",
                  "En pocas palabras: en " + order[0] + ", el " + p1 + "% de los registros caen en la banda verde “Seguir observando”. Con más ventanas se verá a la clase ascender con el tiempo.");
    } else {
      plain = DTx("In plain terms: " + p1 + "% of check-ins are in the green “Keep noticing” band in " + order[order.length - 1] + " — " + Math.abs(dlt) + " points " + dir + " " + p0 + "% back in " + order[0] + ". Greener bars over time mean more students are doing well.",
                  "En pocas palabras: el " + p1 + "% de los registros están en la banda verde “Seguir observando” en " + order[order.length - 1] + " — " + Math.abs(dlt) + " puntos " + dir + " el " + p0 + "% en " + order[0] + ". Barras más verdes con el tiempo significan más estudiantes bien.");
    }
    box.innerHTML += '<div class="aogtj-sub" style="margin-top:10px;padding-top:9px;border-top:1px solid var(--rule);">' + esc(plain) + "</div>";
  }
})();
