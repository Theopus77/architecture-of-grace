
/* ============================================================================
   IEP TEAM BUILD · THE REVIEW QUEUE  ·  2026-09-07

   Jimmy: *"help the whole IEP team contribute evidence without requiring the
   case manager to chase down information from every teacher and related
   service provider."*

   ⚠ THIS MODULE EXISTS BECAUSE OF ONE COMMENT ALREADY IN THIS FILE, in
   <script id="aog-home-school">:

       "Accepting a colleague's count onto the chart is a SEPARATE feature
        that does not exist yet, and when it is built it must stamp
        provenance the way the benchmark generator does and require the
        case manager to accept each point — see the signed-IEP rule."

   That sentence is the specification. This is that feature, and nothing more.

   WHAT WAS ACTUALLY MISSING. Colleagues have been able to submit for weeks —
   the adult team check-in (/support) and the per-goal colleague link both
   ship, both are write-only by link, both are role-tagged. What has never
   existed anywhere in this product is a place where a submission is PENDING
   REVIEW. Every stream lands and is simply displayed. This module is that
   queue, and only that queue.

   WHAT IT READS
     · aog.daily.v1   — support check-ins already arriving (checkinType
                        "support"). READ ONLY. This module never writes there.
     · aog.iepteam.v1 — its own store: structured contributions from the
                        /contribute door (stage 2), plus the review state for
                        BOTH sources.

   WHAT IT WRITES
     · aog.iepteam.v1 — always.
     · aog.iep.v1     — ONLY through accept(), ONLY on a submission that
                        carried opportunities AND successes, ONLY on a
                        trials/steps goal, ONLY on a human click, and ALWAYS
                        stamped src:"team_contrib". [[aog-signed-iep-rule]]
     · aog.iepdocs.v1 — ONLY through route(), which APPENDS attributed draft
                        text to an existing paperwork draft. It never creates
                        a document, never overwrites a field, and marks what
                        it wrote as drafted until a person edits it.

   THE RULES THIS OBEYS, all of them already written elsewhere in this file
     1. A contribution is NOT a measurement. Narrative can never reach the
        chart — there is no button for it, at all.
     2. Provenance is never erased. src:"team_contrib" prints in the evidence
        table, the CSV and the meeting packet because SRCL names it.
     3. Sources are never blended. Support check-ins and structured
        contributions are counted and shown separately, never summed.
     4. Missing is not negative. A role that has not answered reads "not yet".
     5. One source for the decision rules — this module computes no signal.
     6. The team decides. A recommendation is displayed as a recommendation
        and never preselects one of the seven meeting decisions.

   ⚠ DELETABLE WHOLE. It decorates via a MutationObserver on #aogIepBody and
   appends its own pill; it never edits another module's render. Remove this
   block and the <style> above and the engine is exactly what it was.
   ⚠ aog.iepteam.v1 is registered in the Remove-records key table AND in the
   remove-one-student sweep. [[aog-backup-symmetry]]
   ============================================================================ */
(function () {
  "use strict";
  if (window.__aogIepTeam) return;
  window.__aogIepTeam = 1;

  var TKEY  = "aog.iepteam.v1";
  var DAILY = "aog.daily.v1";
  var IEPK  = "aog.iep.v1";
  var DOCK  = "aog.iepdocs.v1";
  var MEKEY = "aog.checkin.me";

  var ST = { on: false, sid: "" };

  function T(en, es) {
    var l = "";
    try { l = localStorage.getItem("dashLang") || localStorage.getItem("lang") || document.documentElement.lang || ""; } catch (e) {}
    return (String(l).slice(0, 2).toLowerCase() === "es") ? es : en;
  }
  function esc(s) {
    return String(s === null || s === undefined ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function jload(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return (v === null || v === undefined) ? d : v; } catch (e) { return d; } }
  function jsave(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function code(s) { return String(s === null || s === undefined ? "" : s).trim().toUpperCase(); }
  function todayISO() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }

  function store() {
    var s = jload(TKEY, null);
    if (!s || typeof s !== "object") s = {};
    if (!s.v) s.v = 1;
    if (!s.asks || typeof s.asks !== "object") s.asks = {};
    if (!s.subs || typeof s.subs !== "object") s.subs = {};
    if (!s.seen || typeof s.seen !== "object") s.seen = {};
    return s;
  }
  function put(s) { return jsave(TKEY, s); }

  /* ───────────────────────────── roles.
     ⚠ THE SAME VOCABULARY THE SUPPORT CHECK-IN ALREADY WRITES. A third
     spelling of respondentRole would make grouping unreliable across the two
     streams that already exist. Additive only — never rename one. */
  var ROLEL = {
    teacher:          { en: "Teacher",                  es: "Docente" },
    special_educator: { en: "Special educator",         es: "Educador/a especial" },
    related_service:  { en: "Related service provider", es: "Servicios relacionados" },
    social_worker:    { en: "Social worker / counselor", es: "Trabajo social" },
    admin:            { en: "Administrator",            es: "Administrador/a" },
    other_staff:      { en: "Other staff",              es: "Otro personal" },
    /* ⚠ NEW VALUES, NEVER RENAMES. respondentRole is ADDITIVE ONLY. Until now
       an SLP, an OT, a PT and a school psychologist all wrote themselves down
       as `related_service` and arrived at the meeting as one undifferentiated
       voice. Jimmy named the four that matter, so each gets its own value and
       they roll up together in isRelated() where a grouping is wanted.
       `related_service` stays valid forever — rows already carry it. */
    slp:              { en: "Speech-language pathologist", es: "Patólogo/a del habla" },
    ot:               { en: "Occupational therapist",   es: "Terapeuta ocupacional" },
    pt:               { en: "Physical therapist",       es: "Fisioterapeuta" },
    psych:            { en: "School psychologist",      es: "Psicólogo/a escolar" },
    gened:            { en: "General education",        es: "Educación general" },
    sped:             { en: "Special education",        es: "Educación especial" },
    related:          { en: "Related service provider", es: "Servicios relacionados" },
    support:          { en: "Support staff",            es: "Personal de apoyo" },
    para:             { en: "Paraprofessional",         es: "Paraprofesional" },
    family:           { en: "Family",                   es: "Familia" },
    student:          { en: "Student",                  es: "Estudiante" }
  };
  function roleLabel(v) { var d = ROLEL[String(v || "")]; return d ? T(d.en, d.es) : (v || T("Adult", "Adulto")); }
  /* The related-services roll-up. Stage 3's panel groups by this and names the
     specific discipline inside it — the group is for arranging, never for
     flattening four people into one line. */
  var RELATED = { slp:1, ot:1, pt:1, psych:1, social_worker:1, related_service:1, related:1 };
  function isRelated(r) { return !!RELATED[String(r || "")]; }

  /* ⚠ THE DOOR SENDS KEYS, NOT WORDS — the same vocabulary the class-evidence
     form uses, so the tallies combine. Nothing was translating them back, so
     the card and the printed packet both read "visual, break" and "well".
     A key is for joining; a person reads the label. Keep these in step with
     contribute.html's SUPPORTS and RESP. */
  var SUPL = {
    verbal:  { en: "Verbal prompt",     es: "Indicación verbal" },
    visual:  { en: "Visual cue",        es: "Apoyo visual" },
    model:   { en: "Modeling",          es: "Modelado" },
    checkin: { en: "Check-in",          es: "Consulta breve" },
    chunk:   { en: "Chunked task",      es: "Tarea dividida" },
    extra:   { en: "Extra time",        es: "Tiempo adicional" },
    seat:    { en: "Seating / setting", es: "Ubicación" },
    "break": { en: "Movement or break", es: "Descanso o movimiento" },
    peer:    { en: "Peer support",      es: "Apoyo de compañeros" },
    adult:   { en: "Adult nearby",      es: "Adulto cerca" }
  };
  var RESPL = {
    well:    { en: "Responds well",          es: "Responde bien" },
    some:    { en: "Helps some of the time", es: "Ayuda a veces" },
    little:  { en: "Little change so far",   es: "Poco cambio" },
    depends: { en: "Depends on the day",     es: "Depende del día" }
  };
  function supLabel(v) { var d = SUPL[String(v || "")]; return d ? T(d.en, d.es) : String(v || ""); }
  function supList(v) {
    var a = Object.prototype.toString.call(v) === "[object Array]" ? v : String(v || "").split(",");
    return a.map(function (x) { return supLabel(String(x).trim()); }).filter(Boolean).join(" · ");
  }
  function respLabel(v) { var d = RESPL[String(v || "")]; return d ? T(d.en, d.es) : String(v || ""); }

  function meId() { try { return String((jload(MEKEY, {}) || {}).id || "").trim(); } catch (e) { return ""; } }

  /* ═══════════════════════════ READ · the two streams, kept apart */

  /* Stream A — support check-ins already arriving. READ ONLY.
     ⚠ These carry no numerator and denominator, so they can NEVER reach the
     chart from here. The one path that turns adult observation into a point
     is AOGIepTrack.accept(), which aggregates a DAY and already exists. This
     module does not duplicate it and must not. */
  function supportRows(sid) {
    var out = [];
    try {
      var logs = (jload(DAILY, {}).logs || {})[sid] || {};
      Object.keys(logs).forEach(function (date) {
        ((logs[date] || {}).periods || []).forEach(function (p) {
          if (!p) return;
          if (String(p.checkinType || "") !== "support") return;
          out.push({
            kind: "support",
            id:   "s|" + sid + "|" + (p.timestamp || date) + "|" + (p.respondentId || ""),
            date: p.date || date,
            ts:   p.timestamp || "",
            role: p.respondentRole || "",
            who:  p.respondentId || "",
            period: p.period || "",
            note: p.note || "",
            followUp: !!p.followUp,
            obs:  Array.isArray(p.obs) ? p.obs : []
          });
        });
      });
    } catch (e) {}
    return out;
  }

  /* Stream B — structured contributions. Stage 2 fills this from /contribute;
     it is already read here so the queue works the day the door ships. */
  function subRows(sid) {
    var s = store(), list = s.subs[sid];
    if (!Array.isArray(list)) return [];
    return list.map(function (r) {
      var o = {}; for (var k in r) if (Object.prototype.hasOwnProperty.call(r, k)) o[k] = r[k];
      o.kind = "sub"; o.id = "c|" + (r.id || "");
      return o;
    });
  }

  /* ═══════════════════════════ THE PULL

     ⚠ ITS OWN TAB, ITS OWN ACTION, ITS OWN PULL — Jimmy's call, and the right
     one. The first draft rode this on the support check-in so the Apps Script
     never had to change; the cost was that the Sheet's own columns did not
     describe the data, and that the row had to be DIVERTED inside
     mergeRemoteIntoDaily so the check-in scorer would not read a contribution
     as 0 of 3 domains it never carried. That divert is gone. A team
     contribution now never enters the check-in stream at all, which is a
     smaller and much more honest claim than "we intercept it in time".

     Needs SCRIPT_VERSION 12 (action `teamEvidence` to write, `pullTeam` to
     read). ⚠ The pull is gated on ADMIN_PULL_KEY, which lives only in the
     script properties and in this teacher's own browser — the published write
     key on every colleague's link cannot read a single row back. */
  var SYNC_URL = "aog.sync.url";
  var SYNC_PULLKEY = "aog.sync.key";

  function pullCfg() {
    var u = "", k = "";
    try { u = String(localStorage.getItem(SYNC_URL) || ""); } catch (e) {}
    try { k = String(localStorage.getItem(SYNC_PULLKEY) || ""); } catch (e) {}
    if (!/^https:\/\/script\.google\.com\/[^\s]*\/exec$/.test(u)) return null;
    if (!k) return null;
    return { url: u, key: k };
  }

  /* Merge pulled rows. Dedup on timestamp + who, the same key the check-in
     merge uses — the Sheet has no de-duplication of its own and a pull is
     re-run freely. Review state already set on a row is never reset. */
  function ingestRows(rows) {
    if (Object.prototype.toString.call(rows) !== "[object Array]") return 0;
    var s = store(), added = 0;
    function n(v) { return (v === 0 || v) && isFinite(Number(v)) ? Number(v) : null; }
    rows.forEach(function (r) {
      if (!r) return;
      var sid = String(r.studentId || "").trim();
      if (!sid) return;
      if (!Array.isArray(s.subs[sid])) s.subs[sid] = [];
      var id = "r|" + String(r.timestamp || "") + "|" + String(r.respondentId || "");
      for (var i = 0; i < s.subs[sid].length; i++) if (s.subs[sid][i].id === id) return;
      s.subs[sid].push({
        id: id, askId: r.askId || "", ts: String(r.timestamp || ""),
        date: String(r.date || "").slice(0, 10),
        role: String(r.respondentRole || ""), who: String(r.respondentId || ""),
        goalId: r.goalId || "", area: r.area || "", focus: r.focus || "",
        evidence: r.evidence || "", perf: r.perf || "",
        opps: n(r.opps), succ: n(r.succ),
        strengths: r.strengths || "", concerns: r.concerns || "",
        /* pipe-joined on the wire, never prose */
        supports: String(r.supports || "").split("|").filter(Boolean),
        response: r.response || "", recommend: r.recommend || "",
        note: String(r.note || ""), followUp: r.followUp === true,
        status: "new", routed: {}, source: "sheet"
      });
      added++;
    });
    if (added) put(s);
    return added;
  }

  window.aogIepTeamPull = function () {
    var cfg = pullCfg();
    var btn = document.getElementById("iept_pullbtn");
    function say(m) { var n = document.getElementById("iept_pullmsg"); if (n) n.textContent = m; }
    if (!cfg) { say(T("Set up Connect & sync first — this needs your read passcode.",
                      "Configura Conectar y sincronizar primero.")); return; }
    if (btn) { btn.disabled = true; btn.textContent = T("Checking…", "Consultando…"); }
    say("");
    fetch(cfg.url, {
      method: "POST", mode: "cors", redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "pullTeam", _backendAuth: cfg.key })
    }).then(function (r) { return r.text(); }).then(function (txt) {
      var j = null;
      try { j = JSON.parse(txt); } catch (e) {}
      if (btn) { btn.disabled = false; btn.textContent = T("Check for new evidence", "Buscar evidencia nueva"); }
      /* ⚠ A 200 IS NOT A YES. An older script answers ok:false to an action it
         does not know, and v11 rejects an unknown action outright. */
      if (!j || !j.ok) {
        say(T("The sheet said no: ", "La hoja respondió que no: ")
            + ((j && j.error) ? j.error : T("unreadable reply", "respuesta ilegible"))
            + T(" — your sheet may still be on the older script.", " — puede que tu hoja siga con el script anterior."));
        return;
      }
      var got = ingestRows(j.teamEvidence);
      say(got ? T(got + (got === 1 ? " new contribution." : " new contributions."), got + " aportaciones nuevas.")
              : T("Nothing new.", "Nada nuevo."));
      paint();
    }).catch(function () {
      if (btn) { btn.disabled = false; btn.textContent = T("Check for new evidence", "Buscar evidencia nueva"); }
      say(T("Could not reach the sheet. Nothing was changed.", "No se pudo conectar. Nada cambió."));
    });
  };

  function statusOf(item) {
    if (item.kind === "sub") return item.status || "new";
    var s = store();
    return s.seen[item.id] || "new";
  }
  function setStatus(item, st) {
    var s = store();
    if (item.kind === "sub") {
      var list = s.subs[ST.sid] || [];
      for (var i = 0; i < list.length; i++) {
        if (("c|" + list[i].id) === item.id) { list[i].status = st; break; }
      }
    } else {
      if (st === "new") delete s.seen[item.id]; else s.seen[item.id] = st;
    }
    put(s); paint();
  }

  function rowsFor(sid) {
    var all = supportRows(sid).concat(subRows(sid));
    all.sort(function (a, b) { return String(b.ts || b.date) < String(a.ts || a.date) ? -1 : 1; });
    return all;
  }

  /* ═══════════════════════════ THE ONE BRIDGE TO THE CHART

     ⚠ Everything about this function is deliberate and none of it is
     decoration. It refuses unless the contributor supplied BOTH a count of
     opportunities and a count of successes, because a number without its
     denominator is not a measurement. It refuses unless the goal is measured
     in trials or steps, because those are the only measures where "n of m"
     means what the aimline thinks it means — the same test acceptable() makes
     in [[aog-iep-track]]. It refuses to overwrite a day that already has a
     point. And it stamps src so that the evidence table, the CSV and the
     meeting packet all say where the number came from, forever. */
  function acceptableGoal(g) {
    return !!g && (g.measure === "trials" || g.measure === "steps");
  }
  function canAccept(item) {
    if (item.kind !== "sub") return false;
    var o = Number(item.opps), s = Number(item.succ);
    if (!isFinite(o) || !isFinite(s) || o <= 0 || s < 0 || s > o) return false;
    if (!item.goalId) return false;
    var st = jload(IEPK, { goals: {}, data: {} });
    return acceptableGoal((st.goals || {})[item.goalId]);
  }
  function accept(item) {
    if (!canAccept(item)) return false;
    var st = jload(IEPK, { goals: {}, data: {} });
    st.goals = st.goals || {}; st.data = st.data || {};
    var gid = item.goalId, d = item.date || todayISO();
    if (!st.data[gid]) st.data[gid] = [];
    if (st.data[gid].some(function (p) { return p && p.date === d; })) {
      alert(T("There is already a measurement on " + d + " for this goal. Edit or remove that point first.",
              "Ya hay una medición el " + d + " para esta meta. Edita o elimina ese dato primero."));
      return false;
    }
    st.data[gid].push({
      date: d,
      value: Number(item.succ),
      total: Number(item.opps),
      year: (window.AOGYear ? window.AOGYear(d) : ""),
      /* ⚠ THE STAMP. A point a colleague counted must be tellable from one
         the case manager measured, on every surface, forever. */
      src: "team_contrib",
      note: T("From " + roleLabel(item.role) + " · " + (item.who || T("unsigned", "sin firma")) + " · " + item.succ + " of " + item.opps + " opportunities",
              "De " + roleLabel(item.role) + " · " + (item.who || T("unsigned", "sin firma")) + " · " + item.succ + " de " + item.opps + " ocasiones")
    });
    st.data[gid].sort(function (a, b) { return String(a.date) < String(b.date) ? -1 : 1; });
    jsave(IEPK, st);
    setStatus(item, "used");
    try { if (typeof window.aogRenderIep === "function") window.aogRenderIep(); } catch (e) {}
    return true;
  }

  /* ═══════════════════════════ ROUTE TO PAPERWORK

     ⚠ APPENDS, NEVER REPLACES, and never creates a document. The wording on a
     signed IEP is not this tool's to author — what lands is attributed draft
     text a person edits, and the attribution is what makes it safe to paste.
     [[aog-signed-iep-rule]] */
  function latestDoc(sid) {
    var d = jload(DOCK, { docs: {}, goalMeta: {} });
    d.docs = d.docs || {};
    var best = null, bestId = "";
    Object.keys(d.docs).forEach(function (id) {
      var doc = d.docs[id];
      if (!doc || code(doc.student) !== code(sid)) return;
      if (!best || Number(doc.updated || doc.created || 0) > Number(best.updated || best.created || 0)) { best = doc; bestId = id; }
    });
    return bestId ? { store: d, id: bestId, doc: best } : null;
  }
  function route(item, field) {
    var found = latestDoc(ST.sid);
    if (!found) {
      alert(T("Start a Meeting Paperwork draft for this student first — this sends the text into that draft.",
              "Primero inicia un borrador de Documentos de reunión para este estudiante."));
      return;
    }
    var txt = String(item[field === "a_strengths" ? "strengths" : "concerns"] || "").trim();
    if (!txt) return;
    var doc = found.doc;
    doc.fields = doc.fields || {};
    var line = txt + "  [" + roleLabel(item.role) + (item.who ? " · " + item.who : "") + " · " + (item.date || "") + T(" · drafted", " · borrador") + "]";
    doc.fields[field] = String(doc.fields[field] || "").trim();
    doc.fields[field] = doc.fields[field] ? (doc.fields[field] + "\n" + line) : line;
    doc.updated = Date.now();
    jsave(DOCK, found.store);
    var r = store();
    if (item.kind === "sub") {
      var list = r.subs[ST.sid] || [];
      for (var i = 0; i < list.length; i++) if (("c|" + list[i].id) === item.id) { list[i].routed = list[i].routed || {}; list[i].routed[field] = true; list[i].status = "used"; }
    } else { r.seen[item.id] = "used"; }
    put(r);
    paint();
    alert(T("Sent to the paperwork draft, marked as drafted and attributed. Open Meeting Paperwork to edit it.",
            "Enviado al borrador, marcado como borrador y atribuido."));
  }

  /* ═══════════════════════════ THE ASK — one link per person

     ⚠ THE LINK CARRIES A CODE, AN OPAQUE GOAL ID AND A PLAIN-LANGUAGE FOCUS
     PHRASE THE CASE MANAGER TYPES. It never carries the goal text, a name, a
     disability or a diagnosis — the same rule the family and colleague links
     have obeyed since .29ac. The composer says so on the screen, because the
     one field a person could paste goal text into is the focus field.

     ⚠ NO `sk` TOKEN, AND THAT IS DELIBERATE. staffTokenFor guards the app's
     own staff SCREEN, where the risk is a thirteen-year-old typing who=staff
     to read something back. This door is a separate page that can only
     submit — there is nothing behind it to read — so the token would be
     guarding a door with no room behind it. [[aog-security-posture]] */
  function linkFor(ask, role) {
    var base = "/contribute";
    try { if (typeof window.aogSharePath_ === "function") base = window.aogSharePath_("contribute") || base; } catch (e) {}
    var p = ["sid=" + encodeURIComponent(ask.student)];
    if (ask.id)     p.push("ask=" + encodeURIComponent(ask.id));
    if (ask.goalId) p.push("g=" + encodeURIComponent(ask.goalId));
    if (ask.area)   p.push("area=" + encodeURIComponent(ask.area));
    if (ask.focus)  p.push("focus=" + encodeURIComponent(ask.focus));
    if (ask.from)   p.push("from=" + encodeURIComponent(ask.from));
    if (ask.to)     p.push("to=" + encodeURIComponent(ask.to));
    if (role)       p.push("role=" + encodeURIComponent(role));
    /* the destination rides on the link, validated at both ends. Without one
       the door refuses to send rather than pretending. [[aog-linkdest]] */
    try {
      var d = (typeof window.aogDestParam_ === "function") ? (window.aogDestParam_() || "") : "";
      var nm = (typeof window.AOG_DEST_PARAM !== "undefined") ? window.AOG_DEST_PARAM : "dest";
      if (d) p.push(nm + "=" + encodeURIComponent(d));
    } catch (e) {}
    var origin = "";
    try { origin = location.origin || ""; } catch (e) {}
    return origin + base + "?" + p.join("&");
  }

  /* the roles a case manager actually asks. Same values the door offers. */
  var ASKABLE = ["teacher", "special_educator", "slp", "social_worker", "psych", "ot", "pt", "para", "admin", "other_staff"];

  function askHTML(sid) {
    var s = store();
    var open = ST.askOpen ? " open" : "";
    var goals = [];
    try {
      var r = window.AOGIepRead;
      if (r && r.goalsFor) goals = (r.goalsFor(sid) || []).filter(function (x) { return x.g && !x.g.archived; });
    } catch (e) {}
    var h = '<details class="iept-ask"' + open + ' ontoggle="aogIepTeamAskToggle(this)">';
    h += "<summary>" + esc(T("Ask the team", "Pedir al equipo")) + "</summary>";
    h += '<div class="iept-askbody">';
    h += '<p class="iept-note" style="margin:0 0 12px">' + esc(T(
      "One link per person. They see the student code, the focus you write and the window — nothing else, and nothing they can read back.",
      "Un enlace por persona. Solo ven el código, el enfoque y el período.")) + "</p>";

    h += '<label class="iept-al" for="iept_focus">' + esc(T("What to focus on, in plain language", "Enfoque, en lenguaje sencillo")) + "</label>";
    h += '<input type="text" id="iept_focus" maxlength="90" placeholder="' + esc(T("starting work without a prompt", "empezar sin recordatorio")) + '">';
    h += '<p class="iept-note">⚠ ' + esc(T("This travels in the link, so write a skill in ordinary words — never the goal text itself.",
                                            "Esto viaja en el enlace: escribe la habilidad en palabras corrientes, nunca el texto de la meta.")) + "</p>";

    h += '<div class="iept-arow">';
    h += '<div><label class="iept-al" for="iept_from">' + esc(T("From", "Desde")) + '</label><input type="date" id="iept_from"></div>';
    h += '<div><label class="iept-al" for="iept_to">' + esc(T("To", "Hasta")) + '</label><input type="date" id="iept_to"></div>';
    h += "</div>";

    if (goals.length) {
      h += '<label class="iept-al" for="iept_goal">' + esc(T("Tie it to a goal (optional)", "Vincular a una meta (opcional)")) + "</label>";
      h += '<select id="iept_goal"><option value="">' + esc(T("No particular goal", "Ninguna meta en particular")) + "</option>";
      goals.forEach(function (row) {
        var a = "";
        try { a = window.AOGIepRead.areaLabel(row.g.area) || row.g.area; } catch (e) { a = row.g.area || ""; }
        h += '<option value="' + esc(row.id) + '" data-area="' + esc(row.g.area || "") + '">' + esc(a + " · " + String(row.g.title || "").slice(0, 70)) + "</option>";
      });
      h += "</select>";
      h += '<p class="iept-note">' + esc(T("Only the goal's id travels, never its wording.", "Solo viaja el id de la meta, nunca su texto.")) + "</p>";
    }

    h += '<label class="iept-al">' + esc(T("Who are you asking?", "¿A quién le pides?")) + "</label>";
    h += '<div class="iept-roles">';
    ASKABLE.forEach(function (r) {
      h += '<button type="button" class="iept-chip" aria-pressed="false" data-role="' + esc(r) + '" onclick="aogIepTeamRoleTap(this)">' + esc(roleLabel(r)) + "</button>";
    });
    h += "</div>";
    h += '<div class="iept-acts" style="border-top:0;padding-top:4px"><button type="button" class="iept-btn go" onclick="aogIepTeamMakeLinks()">'
       + esc(T("Create the links", "Crear los enlaces")) + "</button></div>";
    h += '<div id="iept_links"></div>';
    h += "</div></details>";
    return h;
  }

  window.aogIepTeamAskToggle = function (d) { ST.askOpen = !!(d && d.open); };
  window.aogIepTeamRoleTap = function (b) {
    b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
  };
  window.aogIepTeamMakeLinks = function () {
    var host = document.getElementById("iept_links"); if (!host) return;
    var roles = [].slice.call(document.querySelectorAll('#aogIepTeamRoot .iept-chip[aria-pressed="true"]')).map(function (b) { return b.getAttribute("data-role"); });
    if (!roles.length) { host.innerHTML = '<p class="iept-note">' + esc(T("Choose at least one person to ask.", "Elige al menos una persona.")) + "</p>"; return; }
    var gsel = document.getElementById("iept_goal");
    var gid = gsel ? gsel.value : "";
    var area = "";
    try { if (gsel && gsel.selectedIndex > 0) area = gsel.options[gsel.selectedIndex].getAttribute("data-area") || ""; } catch (e) {}
    var ask = {
      id: "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      student: ST.sid,
      goalId: gid, area: area,
      focus: (document.getElementById("iept_focus") || {}).value || "",
      from: (document.getElementById("iept_from") || {}).value || "",
      to: (document.getElementById("iept_to") || {}).value || "",
      roles: roles, created: new Date().toISOString(), closed: false
    };
    var s = store(); s.asks[ask.id] = ask; put(s);

    var noDest = false;
    try { noDest = !(typeof window.aogDestParam_ === "function" && window.aogDestParam_()); } catch (e) { noDest = true; }
    var h = "";
    if (noDest) {
      h += '<p class="iept-warn">' + esc(T(
        "These links have no destination on them, so nothing a colleague sends can reach you. Set up Connect & sync first, then create them again.",
        "Estos enlaces no llevan destino. Configura Conectar y sincronizar primero.")) + "</p>";
    }
    roles.forEach(function (r) {
      var u = linkFor(ask, r);
      h += '<div class="iept-link"><span class="iept-role">' + esc(roleLabel(r)) + "</span>"
         + '<input type="text" readonly value="' + esc(u) + '" onclick="this.select()">'
         + '<button type="button" class="iept-btn" onclick="aogIepTeamCopy(this)">' + esc(T("Copy", "Copiar")) + "</button></div>";
    });
    host.innerHTML = h;
  };
  window.aogIepTeamCopy = function (b) {
    var inp = b.parentNode.querySelector("input"); if (!inp) return;
    try { inp.select(); document.execCommand("copy"); } catch (e) {}
    try { if (navigator.clipboard) navigator.clipboard.writeText(inp.value); } catch (e) {}
    var was = b.textContent; b.textContent = T("Copied", "Copiado");
    setTimeout(function () { b.textContent = was; }, 1400);
  };

  /* ═══════════════════════════ RENDER */

  function fld(label, v) {
    v = String(v === null || v === undefined ? "" : v).trim();
    if (!v) return "";
    return '<div class="iept-f"><span class="iept-fl">' + esc(label) + '</span><div class="iept-fv">' + esc(v) + "</div></div>";
  }

  function cardHTML(item, idx) {
    var st = statusOf(item);
    var h = '<div class="iept-card' + (st === "new" ? " is-new" : "") + '">';
    h += '<div class="iept-top">';
    h += '<span class="iept-who">' + esc(item.who || T("Unsigned", "Sin firma")) + "</span>";
    h += '<span class="iept-role">' + esc(roleLabel(item.role)) + "</span>";
    h += '<span class="iept-st ' + st + '">' + esc(st === "new" ? T("New", "Nuevo") : st === "used" ? T("Used", "Usado") : T("Set aside", "Apartado")) + "</span>";
    h += '<span class="iept-when">' + esc(item.date || "") + (item.period ? " · " + esc(T("Period ", "Período ") + item.period) : "") + "</span>";
    h += "</div>";

    if (item.kind === "support") {
      h += '<div class="iept-fv" style="font-size:12.5px;color:var(--ink-soft,#46506E)">'
         + esc(T("Adult team check-in", "Registro del equipo"))
         + (item.obs.length ? " · " + esc(item.obs.length + T(" observations ticked", " observaciones marcadas")) : "")
         + (item.followUp ? " · <b>" + esc(T("asked for follow-up", "pidió seguimiento")) + "</b>" : "")
         + "</div>";
      h += fld(T("Note", "Nota"), item.note);
      h += '<p class="iept-note">' + esc(T("A colleague's observation, not a measurement. The chart path for these is the day tally on the goal card.",
                                           "Una observación, no una medición.")) + "</p>";
    } else {
      h += fld(T("What they saw", "Lo que observó"), item.evidence);
      h += fld(T("Current performance", "Desempeño actual"), item.perf);
      h += fld(T("Strengths", "Fortalezas"), item.strengths);
      h += fld(T("Concerns", "Inquietudes"), item.concerns);
      h += fld(T("Supports used", "Apoyos usados"), supList(item.supports));
      h += fld(T("Response to support", "Respuesta al apoyo"), respLabel(item.response));
      h += fld(T("Recommended next step", "Siguiente paso sugerido"), item.recommend);
      h += fld(T("Anything else", "Algo más"), item.note);
      if (isFinite(Number(item.opps)) && Number(item.opps) > 0) {
        h += fld(T("Counted", "Conteo"), item.succ + T(" of ", " de ") + item.opps + T(" opportunities", " ocasiones"));
      }
    }

    h += '<div class="iept-acts">';
    if (canAccept(item)) {
      h += '<button type="button" class="iept-btn go" onclick="aogIepTeamAccept(' + idx + ')">'
         + esc(T("Accept as a measurement", "Aceptar como medición")) + "</button>";
    }
    if (item.kind === "sub" && String(item.strengths || "").trim()) {
      h += '<button type="button" class="iept-btn" onclick="aogIepTeamRoute(' + idx + ',\'a_strengths\')">'
         + esc(T("Send to strengths", "Enviar a fortalezas")) + "</button>";
    }
    if (item.kind === "sub" && String(item.concerns || "").trim()) {
      h += '<button type="button" class="iept-btn" onclick="aogIepTeamRoute(' + idx + ',\'a_parent\')">'
         + esc(T("Send to concerns", "Enviar a inquietudes")) + "</button>";
    }
    if (st !== "used") h += '<button type="button" class="iept-btn" onclick="aogIepTeamMark(' + idx + ',\'used\')">' + esc(T("Mark used", "Marcar usado")) + "</button>";
    if (st !== "aside") h += '<button type="button" class="iept-btn" onclick="aogIepTeamMark(' + idx + ',\'aside\')">' + esc(T("Set aside", "Apartar")) + "</button>";
    if (st !== "new")  h += '<button type="button" class="iept-btn" onclick="aogIepTeamMark(' + idx + ',\'new\')">' + esc(T("Undo", "Deshacer")) + "</button>";
    h += "</div></div>";
    return h;
  }

  var VIEW = [];

  function bodyHTML(sid) {
    var rows = rowsFor(sid);
    VIEW = rows;
    var nNew = rows.filter(function (r) { return statusOf(r) === "new"; }).length;

    var h = '<div class="iept-wrap">';
    h += '<div class="iept-head">' + esc(T("Team evidence", "Evidencia del equipo")) + "</div>";
    h += '<p class="iept-lede">' + esc(T(
      "What the team has sent in for this student, newest first. Nothing here changes the student's record until you decide it should.",
      "Lo que el equipo ha enviado para este estudiante. Nada cambia el expediente hasta que tú lo decidas.")) + "</p>";
    h += '<div class="iept-acts" style="border-top:0;padding-top:0;margin:0 0 16px">'
       + '<button type="button" class="iept-btn" id="iept_pullbtn" onclick="aogIepTeamPull()">'
       + esc(T("Check for new evidence", "Buscar evidencia nueva")) + "</button>"
       + '<button type="button" class="iept-btn go" onclick="aogIepTeamPrint()">'
       + esc(T("Print the team packet", "Imprimir el paquete")) + "</button>"
       + '<span class="iept-note" id="iept_pullmsg" style="margin:0"></span></div>';

    if (!sid) {
      h += '<div class="iept-empty">' + esc(T("Choose a student above.", "Elige un estudiante arriba.")) + "</div></div>";
      return h;
    }
    if (!rows.length) {
      h += askHTML(sid);
      h += '<div class="iept-empty">' + esc(T(
        "Nothing from the team yet for " + sid + ". Adult team check-ins appear here as soon as they arrive, and so will structured contributions.",
        "Nada del equipo todavía para " + sid + ".")) + "</div></div>";
      return h;
    }

    h += '<div class="iept-ctx">' + esc(T(
      "Context, not measurement. A colleague's account stands under their own name and their own role. It is never blended with what you measured, and it reaches the chart only where someone counted opportunities and successes — and only when you accept it.",
      "Contexto, no medición. El relato de un colega se mantiene bajo su nombre y su rol.")) + "</div>";

    h += askHTML(sid);

    h += '<div class="iept-grp">' + esc(T("Waiting for you", "Esperando tu revisión"))
       + (nNew ? '<span class="iept-count">' + nNew + "</span>" : "") + "</div>";
    var any = false;
    rows.forEach(function (r, i) { if (statusOf(r) === "new") { h += cardHTML(r, i); any = true; } });
    if (!any) h += '<div class="iept-empty">' + esc(T("Nothing new. Everything below has been read.", "Nada nuevo.")) + "</div>";

    var done = rows.filter(function (r) { return statusOf(r) !== "new"; });
    if (done.length) {
      h += '<div class="iept-grp">' + esc(T("Already reviewed", "Ya revisado")) + "</div>";
      rows.forEach(function (r, i) { if (statusOf(r) !== "new") h += cardHTML(r, i); });
    }
    h += "</div>";
    return h;
  }


  /* ═══════════════════════════ THE TEAM PACKET

     ⚠ FOUR HOUSE RULES, ALL OF THEM LEARNED THE HARD WAY IN THIS FILE.
     1. Print from its OWN window, written SYNCHRONOUSLY inside the click.
        Printing in place produced ~80 blank pages once and the isolation CSS
        exists because of it.
     2. NEVER put window.print() behind a timer — iOS Safari blocks it the
        moment it leaves the gesture chain.
     3. LITERAL LIGHT HEX, never a token. This document has no theme; a var()
        that does not resolve prints as black on black. [[aog-iep-chart]]
     4. NO FLEX AND NO vh IN A PRINT SHEET. A flex cover page fragmented
        across a page break and printed a blank first sheet. [[aog-mtss-print-blank]]
        Everything below lays out with tables and blocks, on purpose. */

  var PROLE = ["special_educator","teacher","slp","ot","pt","psych","social_worker","para","admin","other_staff"];

  function pesc(x) { return esc(x); }
  function pfield(label, v) {
    v = String(v === null || v === undefined ? "" : v).trim();
    if (!v) return "";
    return '<tr><td class="pl">' + pesc(label) + '</td><td class="pv">' + pesc(v) + "</td></tr>";
  }

  function printDocHTML(sid) {
    var rows = rowsFor(sid);
    var used = rows.filter(function (r) { return statusOf(r) !== "aside"; });

    /* who answered, and who has not — ⚠ MISSING IS NOT NEGATIVE. A role that
       has not answered reads "not yet", never as a concern. */
    var asked = {}, answered = {};
    var st = store();
    Object.keys(st.asks).forEach(function (aid) {
      var a = st.asks[aid] || {};
      if (code(a.student) !== code(sid)) return;
      (a.roles || []).forEach(function (r) { asked[r] = true; });
    });
    used.forEach(function (r) { if (r.role) answered[r.role] = (answered[r.role] || 0) + 1; });
    var waiting = Object.keys(asked).filter(function (r) { return !answered[r]; });

    /* group: related services together, each discipline still named */
    var groups = [
      { k: "rel",   t: T("Related services", "Servicios relacionados"),
        rows: used.filter(function (r) { return isRelated(r.role); }) },
      { k: "teach", t: T("Teachers", "Docentes"),
        rows: used.filter(function (r) { return !isRelated(r.role) && (r.role === "teacher" || r.role === "special_educator"); }) },
      { k: "other", t: T("Others on the team", "Otros del equipo"),
        rows: used.filter(function (r) { return !isRelated(r.role) && r.role !== "teacher" && r.role !== "special_educator"; }) }
    ].filter(function (g) { return g.rows.length; });

    var recs = used.filter(function (r) { return String(r.recommend || "").trim(); });
    var today = todayISO();
    var people = {};
    used.forEach(function (r) { if (r.who) people[r.who] = 1; });
    var nPeople = Object.keys(people).length;

    var CSS = [
"@page{size:letter portrait;margin:0.55in 0.6in 0.6in;}",
"*{box-sizing:border-box;}",
"body{margin:0;background:#FFFFFF;color:#0A1E33;font:13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;}",
".cover{border-bottom:3px solid #D9A33B;padding:0 0 18px;margin:0 0 22px;}",
".mk{width:54px;height:54px;background:#0A1E33;color:#D9A33B;font:600 30px/52px Georgia,serif;text-align:center;border-radius:10px;}",
".brand{font:400 21px/1.2 Georgia,serif;color:#0A1E33;margin:12px 0 2px;}",
".brand b{font-weight:600;color:#7E5B18;}",
"h1{font:600 34px/1.12 Georgia,serif;margin:14px 0 6px;color:#0A1E33;}",
".sub{font:italic 400 15px/1.4 Georgia,serif;color:#46506E;margin:0 0 16px;}",
"table.meta{width:100%;border-collapse:collapse;margin:14px 0 0;}",
"table.meta td{padding:5px 10px 5px 0;font-size:12px;vertical-align:top;border-bottom:1px solid #EFEADB;}",
"table.meta td.k{width:150px;font-size:9.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#5C667E;padding-top:8px;}",
"table.meta td.v{font-weight:600;color:#0A1E33;}",
".strip{border:1px solid #E4DAC5;border-left:3px solid #0A1E33;background:#FCF8F0;padding:11px 14px;margin:0 0 18px;}",
".strip .n{font:600 22px/1 Georgia,serif;color:#0A1E33;}",
".strip .l{font-size:9.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#5C667E;}",
".strip td{padding:0 26px 0 0;vertical-align:bottom;}",
"h2{font:600 17px/1.25 Georgia,serif;color:#0A1E33;margin:26px 0 10px;padding-bottom:5px;border-bottom:2px solid #0A1E33;}",
".card{border:1px solid #E4DAC5;border-left:3px solid #D9A33B;padding:12px 15px;margin:0 0 12px;page-break-inside:avoid;break-inside:avoid;}",
".who{font-size:14.5px;font-weight:700;color:#0A1E33;}",
".role{display:inline-block;font-size:9.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#0A1E33;border:1px solid #0A1E33;border-radius:999px;padding:1px 8px;margin-left:7px;}",
".when{float:right;font-size:11px;color:#5C667E;font-variant-numeric:tabular-nums;}",
"table.f{width:100%;border-collapse:collapse;margin:8px 0 0;}",
"table.f td{padding:4px 0;vertical-align:top;font-size:12.5px;line-height:1.45;}",
"table.f td.pl{width:132px;font-size:9.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#5C667E;padding-top:5px;}",
"table.f td.pv{color:#0A1E33;}",
".count{border:1px solid #7E5B18;background:#F5EAC8;padding:6px 10px;margin:9px 0 0;font-size:12px;color:#7E5B18;font-weight:700;}",
".ctx{border-left:3px solid #D9A33B;background:#FCF8F0;padding:10px 14px;margin:0 0 18px;font-size:12px;color:#46506E;}",
".waiting{border:1px dashed #E4DAC5;padding:10px 14px;margin:0 0 18px;font-size:12px;color:#46506E;}",
".pb{page-break-before:always;}",
".rec{border-top:1px solid #EFEADB;padding:9px 0;font-size:12.5px;}",
".rec .src{font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#5C667E;display:block;margin:0 0 2px;}",
".foot{margin-top:26px;padding-top:12px;border-top:1px solid #E4DAC5;font-size:10.5px;color:#5C667E;line-height:1.5;}",
".none{border:1px dashed #E4DAC5;padding:20px;text-align:center;color:#5C667E;font-size:12.5px;}"
    ].join("\n");

    var h = "";
    h += '<div class="cover">';
    h += '<div class="mk">A</div>';
    h += '<div class="brand">Architecture of <b>Grace</b></div>';
    h += "<h1>" + pesc(T("Team Evidence", "Evidencia del equipo")) + "</h1>";
    h += '<div class="sub">' + pesc(T("What the team has seen, in their own words, for one student and one reporting window.",
                                       "Lo que el equipo ha observado, en sus palabras.")) + "</div>";
    h += '<table class="meta">';
    h += '<tr><td class="k">' + pesc(T("Student", "Estudiante")) + '</td><td class="v">' + pesc(sid) + "</td></tr>";
    h += '<tr><td class="k">' + pesc(T("Prepared", "Preparado")) + '</td><td class="v">' + pesc(today) + "</td></tr>";
    var mile = null;
    try { mile = (window.AOGEvidence && AOGEvidence.mileFor) ? AOGEvidence.mileFor(sid) : null; } catch (e) {}
    if (mile && mile.date) {
      h += '<tr><td class="k">' + pesc(mile.kind === "reeval" ? T("Reevaluation", "Reevaluación") : T("Annual review", "Revisión anual"))
         + '</td><td class="v">' + pesc(mile.date) + "</td></tr>";
    }
    h += "</table></div>";

    h += '<table class="strip"><tr>';
    h += '<td><div class="n">' + used.length + '</div><div class="l">' + pesc(used.length === 1 ? T("contribution", "aportación") : T("contributions", "aportaciones")) + "</div></td>";
    h += '<td><div class="n">' + nPeople + '</div><div class="l">' + pesc(nPeople === 1 ? T("person", "persona") : T("people", "personas")) + "</div></td>";
    h += '<td><div class="n">' + Object.keys(answered).length + '</div><div class="l">' + pesc(T("roles answering", "roles que respondieron")) + "</div></td>";
    h += "</tr></table>";

    h += '<div class="ctx"><b>' + pesc(T("Context, not measurement.", "Contexto, no medición.")) + "</b> "
       + pesc(T("A colleague's account stands under their own name and their own role. It is never blended with what was measured, and it reaches a progress chart only where someone counted opportunities and successes — and only when the case manager accepts it.",
                "El relato de un colega se mantiene bajo su nombre y su rol.")) + "</div>";

    if (waiting.length) {
      h += '<div class="waiting"><b>' + pesc(T("Still to hear from:", "Falta escuchar a:")) + "</b> "
         + pesc(waiting.map(roleLabel).join(" · "))
         + " — " + pesc(T("asked, not yet answered. Not a concern; simply not in yet.",
                          "solicitado, aún sin respuesta. No es una preocupación.")) + "</div>";
    }

    if (!used.length) {
      h += '<div class="none">' + pesc(T("No team contributions for this student yet.", "Aún no hay aportaciones.")) + "</div>";
    }

    groups.forEach(function (g) {
      h += "<h2>" + pesc(g.t) + "</h2>";
      g.rows.forEach(function (r) {
        h += '<div class="card">';
        h += '<span class="when">' + pesc(r.date || "") + "</span>";
        h += '<span class="who">' + pesc(r.who || T("Unsigned", "Sin firma")) + "</span>";
        h += '<span class="role">' + pesc(roleLabel(r.role)) + "</span>";
        h += '<table class="f">';
        if (r.kind === "support") {
          h += pfield(T("Adult team check-in", "Registro del equipo"),
                      (r.obs && r.obs.length ? r.obs.length + T(" observations ticked", " observaciones marcadas") : T("submitted", "enviado")));
          h += pfield(T("Note", "Nota"), r.note);
        } else {
          h += pfield(T("What they saw", "Lo observado"), r.evidence);
          h += pfield(T("Performance now", "Desempeño actual"), r.perf);
          h += pfield(T("Strengths", "Fortalezas"), r.strengths);
          h += pfield(T("Concerns", "Inquietudes"), r.concerns);
          h += pfield(T("Supports used", "Apoyos"), supList(r.supports));
          h += pfield(T("Response", "Respuesta"), respLabel(r.response));
          h += pfield(T("Suggested next step", "Siguiente paso"), r.recommend);
          h += pfield(T("Anything else", "Algo más"), r.note);
        }
        h += "</table>";
        if (r.kind !== "support" && isFinite(Number(r.opps)) && Number(r.opps) > 0) {
          h += '<div class="count">' + pesc(T("Counted: ", "Conteo: ") + r.succ + T(" of ", " de ") + r.opps + T(" opportunities", " ocasiones"))
             + " — " + pesc(statusOf(r) === "used" ? T("accepted onto the chart", "aceptado en la gráfica")
                                                   : T("not yet accepted onto the chart", "aún no aceptado")) + "</div>";
        }
        h += "</div>";
      });
    });

    if (recs.length) {
      h += '<div class="pb"></div>';
      h += "<h2>" + pesc(T("What the team suggests", "Lo que sugiere el equipo")) + "</h2>";
      h += '<div class="ctx">' + pesc(T("Gathered here so the team can read them together. A suggestion is a suggestion — the team decides, and this page only remembers.",
                                        "Reunidas aquí. El equipo decide; esta página solo recuerda.")) + "</div>";
      recs.forEach(function (r) {
        h += '<div class="rec"><span class="src">' + pesc(roleLabel(r.role) + (r.who ? " · " + r.who : "")) + "</span>" + pesc(r.recommend) + "</div>";
      });
    }

    h += '<div class="foot">'
       + pesc(T("Confidential — for educational planning. Prepared from what the team sent in; nothing here has changed the student's record.",
                "Confidencial — para planificación educativa."))
       + "<br>" + pesc(T("A measurement describes performance on a skill. It does not describe the student.",
                         "Una medición describe el desempeño en una habilidad. No describe al estudiante."))
       + "</div>";

    return "<!doctype html><html><head><meta charset=\"utf-8\"><title>"
         + pesc(T("Team Evidence", "Evidencia del equipo") + " · " + sid)
         + "</title><style>" + CSS + "</style></head><body>" + h + "</body></html>";
  }

  window.aogIepTeamPrint = function () {
    var sid = ST.sid || currentSid();
    if (!sid) { alert(T("Choose a student first.", "Elige un estudiante primero.")); return; }
    /* ⚠ OPENED AND WRITTEN INSIDE THE CLICK. No await, no timer, no fetch
       between the gesture and print() — iOS blocks anything else. */
    var w = window.open("", "_blank");
    if (!w) { alert(T("Your browser blocked the print window. Allow pop-ups for this site and try again.",
                      "El navegador bloqueó la ventana. Permite ventanas emergentes.")); return; }
    w.document.open();
    w.document.write(printDocHTML(sid));
    w.document.close();
    try { w.focus(); w.print(); } catch (e) {}
  };

  /* ───────────────────────────── mount.
     ⚠ It appends its own pill to the bar that aog-ieppw-js owns, from an
     observer, rather than editing that module's render. That is the same
     decoration pattern aog-iep-evidence, aog-iep-track and aog-iep-meet use,
     and it is why deleting this block leaves no dead control behind. */
  function currentSid() {
    try {
      var f = document.getElementById("iepFilter");
      var v = f ? String(f.value || "").trim() : "";
      if (v && v.toUpperCase() !== "ALL") return v;
      var t = localStorage.getItem("aog.iep.tab") || "";
      return (t && t !== "ALL") ? t : "";
    } catch (e) { return ""; }
  }

  function ensure() {
    var host = document.getElementById("aogIepBody");
    if (!host || !host.parentNode) return;
    var bar = document.getElementById("aogIepPwBar");
    if (bar && bar.style.display !== "none" && !bar.querySelector("[data-iept-pill]")) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "ieppw-pill"; b.setAttribute("data-iept-pill", "1");
      b.setAttribute("aria-pressed", ST.on ? "true" : "false");
      b.textContent = T("Team evidence", "Evidencia del equipo");
      b.onclick = function () { window.aogIepTeamView(true); };
      bar.appendChild(b);
    }
    var root = document.getElementById("aogIepTeamRoot");
    if (!root) {
      root = document.createElement("div"); root.id = "aogIepTeamRoot";
      host.parentNode.appendChild(root);
    }
    var pill = bar ? bar.querySelector("[data-iept-pill]") : null;
    if (pill) pill.setAttribute("aria-pressed", ST.on ? "true" : "false");
    root.style.display = ST.on ? "" : "none";
    if (ST.on) {
      var pwRoot = document.getElementById("aogIepPwRoot");
      host.style.display = "none";
      if (pwRoot) pwRoot.style.display = "none";
      ST.sid = currentSid();
      root.innerHTML = bodyHTML(ST.sid);
    }
  }
  function paint() { try { ensure(); } catch (e) {} }

  window.aogIepTeamView = function (on) {
    ST.on = !!on;
    if (ST.on) {
      /* the other two pills must read as unpressed while this one is on */
      try {
        var bar = document.getElementById("aogIepPwBar");
        if (bar) Array.prototype.forEach.call(bar.querySelectorAll(".ieppw-pill:not([data-iept-pill])"), function (p) { p.setAttribute("aria-pressed", "false"); });
      } catch (e) {}
    }
    paint();
  };
  window.aogIepTeamMark = function (i) {
    var st = arguments[1] || "used";
    var item = VIEW[i]; if (item) setStatus(item, st);
  };
  window.aogIepTeamAccept = function (i) {
    var item = VIEW[i]; if (!item) return;
    if (!confirm(T("Add " + item.succ + " of " + item.opps + " on " + item.date + " to this goal's chart, stamped as a team contribution from " + (item.who || "an unsigned contributor") + "?",
                   "¿Agregar este dato a la gráfica, marcado como aportación del equipo?"))) return;
    accept(item);
  };
  window.aogIepTeamRoute = function (i) {
    var f = arguments[1] || "a_strengths";
    var item = VIEW[i]; if (item) route(item, f);
  };

  /* ⚠ Turning OFF is what the other two pills do implicitly — they call
     aogIepPwView, which repaints and would otherwise leave this view stacked
     on top. Wrapping it is one line and keeps the ownership honest. */
  function wrapView() {
    var orig = window.aogIepPwView;
    if (typeof orig !== "function") { setTimeout(wrapView, 300); return; }
    if (orig.__ieptWrapped) return;
    var w = function () { ST.on = false; var r = orig.apply(this, arguments); paint(); return r; };
    w.__ieptWrapped = true;
    window.aogIepPwView = w;
  }

  /* ⚠ THE PILL BAR IS REBUILT WITH innerHTML ON EVERY RENDER.
     aog-ieppw-js's ensureUI() does `bar.innerHTML = ...` each time, which
     silently deletes an appended pill. Observing the bar's PARENT is not
     enough — the bar node itself never changes, only its children — so this
     watches the bar too, and wraps aogRenderIep as the reliable hook. This
     cost three failing assertions to find and is exactly the kind of thing a
     source grep cannot see. */
  function wrapRender() {
    var orig = window.aogRenderIep;
    if (typeof orig !== "function") { setTimeout(wrapRender, 300); return; }
    if (orig.__ieptWrapped) return;
    var w = function () { var r = orig.apply(this, arguments); try { paint(); } catch (e) {} return r; };
    w.__ieptWrapped = true;
    window.aogRenderIep = w;
  }

  function watch() {
    var host = document.getElementById("aogIepBody");
    if (!host) { setTimeout(watch, 400); return; }
    try {
      var mo = new MutationObserver(function () { paint(); });
      mo.observe(host.parentNode || host, { childList: true, subtree: false });
    } catch (e) {}
    (function watchBar() {
      var bar = document.getElementById("aogIepPwBar");
      if (!bar) { setTimeout(watchBar, 400); return; }
      if (bar.__ieptWatched) return;
      bar.__ieptWatched = 1;
      try {
        var mb = new MutationObserver(function () {
          if (!bar.querySelector("[data-iept-pill]")) paint();
        });
        mb.observe(bar, { childList: true, subtree: false });
      } catch (e) {}
      paint();
    })();
    try {
      document.addEventListener("change", function (ev) {
        var t = ev && ev.target;
        if (t && t.id === "iepFilter" && ST.on) paint();
      }, true);
    } catch (e) {}
  }

  function init() { wrapView(); wrapRender(); paint(); watch(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  /* One export, read-mostly, so the meeting brief can count contributions
     without reaching into the store itself. */
  window.AOGIepTeam = {
    KEY: TKEY,
    ingestRows: ingestRows,
    pull: window.aogIepTeamPull,
    isRelated: isRelated,
    linkFor: linkFor,
    rows: rowsFor,
    status: statusOf,
    roleLabel: roleLabel,
    printDoc: printDocHTML,
    print: window.aogIepTeamPrint,
    countNew: function (sid) { return rowsFor(sid).filter(function (r) { return statusOf(r) === "new"; }).length; },
    roles: function (sid) {
      var seen = {}; rowsFor(sid).forEach(function (r) { if (r.role) seen[r.role] = (seen[r.role] || 0) + 1; }); return seen;
    }
  };
})();
