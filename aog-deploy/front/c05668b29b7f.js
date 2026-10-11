
/* ============================================================================
   AOG GRACE COMPASS — ADULT / PRACTITIONER pathway
   Source of truth: Architecture of Grace · The Adult Edition (Practitioner
   Edition) — a 12-session manualized group intervention. Maps an adult check-in
   (lowest domain) to a specific SESSION, fully traceable, with the manual's
   own risk-management protocol.
   ========================================================================== */
(function () {
  function DTx(en, es) { try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; } }
  function isEs() { try { return (typeof dashLang !== "undefined" && dashLang === "es") || (typeof lang !== "undefined" && lang === "es"); } catch (e) { return false; } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]; }); }
  var STORE_URL = "https://architectureofgrace.com/#store";

  /* The twelve-session arc (verbatim titles + anchor concepts; objectives drawn
     from the manual's phase descriptions and session objectives). dom: which
     screener domain the session principally serves. risk: 0 / 1(★) / 2(★★).
     rescreen: ◆ re-screen for active risk before the session. */
  window.AOG_SESSIONS = [
    { n:1,  phase:"I · Foundation", title:"Arrival & The Group Compact", anchor:"The Compact",
      obj:"Establishes the room, the group compact, and the four foundational distinctions in their first form — the relational trust required to move inward.", dom:"ALL", risk:0, rescreen:false },
    { n:2,  phase:"I · Foundation", title:"Identity Is Not Behavior", anchor:"Identity / Behavior",
      obj:"Participants establish, operationally, the distinction between identity and behavior — full ownership of the behavior, full preservation of the larger identity, without identity-collapse.", dom:"B", risk:0, rescreen:false },
    { n:3,  phase:"I · Foundation", title:"The Two Voices — Self-Talk Made Visible", anchor:"Two Voices",
      obj:"Externalizes the inner critic and the kinder voice so self-talk becomes visible, nameable, and a matter of choice rather than fact.", dom:"B", risk:0, rescreen:false },
    { n:4,  phase:"II · Interior", title:"Feelings as Messengers", anchor:"Messengers",
      obj:"Emotional naming as foundational data, not pathology — a feeling arrives as information, not a verdict.", dom:"A", risk:0, rescreen:false },
    { n:5,  phase:"II · Interior", title:"Carrying Too Much — The Backpack Inventory", anchor:"The Backpack",
      obj:"The explicit cataloguing of what the participant has been carrying — naming the weight before any attempt to set it down.", dom:"A", risk:1, rescreen:false },
    { n:6,  phase:"II · Interior", title:"The Compassionate Witness", anchor:"The Witness",
      obj:"Constructs the non-punitive evaluative stance the rest of the program uses — the capacity to see one's own history without contempt.", dom:"B", risk:1, rescreen:false },
    { n:7,  phase:"III · Repair", title:"Grief vs. Resentment — The Critical Distinction", anchor:"Grief / Resentment",
      obj:"The distinction that makes everything that follows possible — separating what is grieved from what is resented so each can be addressed in its own register.", dom:"C", risk:2, rescreen:true },
    { n:8,  phase:"III · Repair", title:"Forgiving the Younger Self", anchor:"The Younger Self",
      obj:"The inward application of the framework — extending to the earlier self the same compassion the participant is learning to extend to others.", dom:"B", risk:2, rescreen:true },
    { n:9,  phase:"III · Repair", title:"Inherited Shame & Intergenerational Weight", anchor:"Inheritance",
      obj:"Lifts material that does not belong to the participant off the participant — distinguishing inherited shame from one's own.", dom:"B", risk:1, rescreen:true },
    { n:10, phase:"III · Repair", title:"The Living Amend", anchor:"The Living Amend",
      obj:"Translates internal change into a sustained behavioral commitment — repair lived forward, not a single apology.", dom:"C", risk:1, rescreen:false },
    { n:11, phase:"IV · Legacy", title:"Forgiveness Is Not Reconciliation", anchor:"Forgiveness / Reconciliation",
      obj:"Held until Phase IV deliberately: forgiveness can be complete without reconciliation; reconciliation requires conditions forgiveness does not.", dom:"C", risk:1, rescreen:false },
    { n:12, phase:"IV · Legacy", title:"The Final Backpack Audit & Closure", anchor:"The Audit",
      obj:"The structured decision about which weights are carried forward and which are set down — the session that determines whether the work holds in the months that follow.", dom:"ALL", risk:2, rescreen:true }
  ];

  var DOMA = {
    A:{en:"Emotional Regulation & Well-Being",es:"Regulación emocional y bienestar",fcs_en:"feelings as information and the load being carried",fcs_es:"las emociones como información y la carga que se lleva"},
    B:{en:"Self-Compassion & Interior Work",es:"Autocompasión y trabajo interior",fcs_en:"identity-without-collapse and the Compassionate Witness",fcs_es:"la identidad sin colapso y el Testigo Compasivo"},
    C:{en:"Social Competency & Repair",es:"Competencia social y reparación",fcs_en:"the grief/resentment distinction and the living amend",fcs_es:"la distinción duelo/resentimiento y la enmienda viva"}
  };

  /* a between-session reflection (the adult analog of the "home question") */
  var BTW = {
    A:{en:"Before next session, notice one time a feeling arrived as information rather than a verdict. Name it on paper and bring it back to the group.",
       es:"Antes de la próxima sesión, note una vez en que una emoción llegó como información y no como veredicto. Nómbrela por escrito y tráigala al grupo."},
    B:{en:"This week, catch the inner critic once and answer it in the voice of the Compassionate Witness. Write both lines.",
       es:"Esta semana, sorprenda al crítico interior una vez y respóndale con la voz del Testigo Compasivo. Escriba ambas frases."},
    C:{en:"Identify one relationship where grief and resentment have been tangled. You do not need to act — only to notice which is which.",
       es:"Identifique una relación donde el duelo y el resentimiento se hayan enredado. No necesita actuar — solo notar cuál es cuál."}
  };

  function lowestKey(rec) {
    if (typeof aogLowestDomainKey === "function") return aogLowestDomainKey(rec.normA, rec.normB, rec.normC);
    var d = { A: rec.normA || 0, B: rec.normB || 0, C: rec.normC || 0 };
    return Object.keys(d).sort(function (x, y) { return d[x] - d[y]; })[0];
  }

  /* faithful to the manualized arc: sessions surface in program order (n) */
  function sessionsFor(dom) {
    var s = (window.AOG_SESSIONS || []).filter(function (x) { return x.dom === dom; });
    if (!s.length) s = (window.AOG_SESSIONS || []).filter(function (x) { return x.dom === "ALL"; });
    return s.sort(function (a, b) { return a.n - b.n; });
  }
  /* the Legacy phase (S11–S12) is the "doing well / consolidate" recommendation */
  function legacySessions() {
    return (window.AOG_SESSIONS || []).filter(function (x) { return x.n >= 11; }).sort(function (a, b) { return b.n - a.n; });
  }

  function riskProtocol(s, es) {
    if (!s.risk && !s.rescreen) return "";
    var parts = [];
    if (s.risk >= 2) parts.push(es ? "★★ Riesgo alto — consulta clínica antes y después de la sesión es obligatoria."
                                   : "★★ High risk — pre-session and post-session clinical consultation required.");
    else if (s.risk === 1) parts.push(es ? "★ Riesgo elevado — co-facilitador en la sala; disponibilidad clínica el mismo día."
                                         : "★ Elevated risk — co-facilitator in the room; same-day clinical availability.");
    if (s.rescreen) parts.push(es ? "◆ Reevaluar el riesgo activo antes de iniciar esta sesión." : "◆ Re-screen for active risk before this session begins.");
    var cls = s.risk >= 2 ? "gc-risk-2" : "gc-risk-1";
    return "<div class=\"gc-risk " + cls + "\">" + parts.map(esc).join(" ") + "</div>";
  }

  function sessionCard(s, es) {
    var cite = (es ? "Trazable a: Edición para Profesionales · Sesión " : "Traceable to: Practitioner Edition · Session ") + s.n + " · " + esc(s.title) + " · " + (es ? "Fase " : "Phase ") + esc(s.phase);
    return "<div class=\"gc-res gc-res-adult\">" +
      "<div class=\"gc-res-lesson\">" + (es ? "Sesión " : "Session ") + s.n + " · " + esc(s.title) + " <span class=\"gc-phase\">" + esc(s.phase) + "</span></div>" +
      "<div class=\"gc-res-grid\">" +
        "<div class=\"gc-res-k\">" + (es ? "Concepto ancla" : "Anchor concept") + "</div><div class=\"gc-res-v\">" + esc(s.anchor) + "</div>" +
        "<div class=\"gc-res-k\">" + (es ? "Objetivo clínico" : "Clinical aim") + "</div><div class=\"gc-res-v\">" + esc(s.obj) + "</div>" +
      "</div>" +
      riskProtocol(s, es) +
      "<div class=\"gc-cite\">" + cite + "</div>" +
    "</div>";
  }

  var META = {
    breathing:{ic:"🫁",en:"4-7-8 Breathing",es:"Respiración 4-7-8"}, boxbreath:{ic:"🟦",en:"Paced Breathing",es:"Respiración pausada"},
    rainbow:{ic:"🌈",en:"Rainbow Breathing",es:"Respiración arcoíris"}, take5:{ic:"🖐️",en:"Take 5",es:"Toma 5"},
    grounding:{ic:"🌿",en:"5-4-3-2-1 Grounding",es:"Anclaje 5-4-3-2-1"}, pmr:{ic:"🧘",en:"Body Scan",es:"Escaneo corporal"},
    movement:{ic:"🏃",en:"Movement Break",es:"Pausa de movimiento"}, calmjar:{ic:"🫙",en:"Calm Down Jar",es:"Frasco de la calma"},
    tappad:{ic:"👆",en:"Tap Pad",es:"Almohadilla de toques"}, bodycheck:{ic:"🧭",en:"Body Check",es:"Autorreflexión del cuerpo"},
    bilateral:{ic:"🦋",en:"Butterfly Hug",es:"Abrazo mariposa"}, safeplace:{ic:"🌱",en:"Safe Place",es:"Lugar seguro"},
    fidget:{ic:"🌀",en:"Visual Fidget",es:"Fidget visual"}, emotion:{ic:"🟡",en:"Emotion Wheel",es:"Rueda de emociones"},
    feelwheel:{ic:"🎡",en:"Feelings Wheel",es:"Rueda de sentimientos"}, coreg:{ic:"🧡",en:"Co-Regulation",es:"Co-regulación"},
    animalyoga:{ic:"🦁",en:"Animal Yoga",es:"Yoga animal"}
  };
  function toolChips(rec, es) {
    var ids = (typeof window.aogMatchTools === "function") ? window.aogMatchTools(rec) : [];
    ids = ids.slice(0, 5);
    if (!ids.length) ids = ["breathing", "grounding", "pmr"];
    return ids.map(function (id) {
      var m = META[id]; if (!m) return "";
      return "<a class=\"gc-tool\" role=\"button\" href=\"#\" onclick=\"if(typeof toolOpen==='function')toolOpen('" + id + "');return false;\"><span class=\"gc-tool-ic\" aria-hidden=\"true\">" + m.ic + "</span><span class=\"gc-tool-tx\">" + esc(es ? m.es : m.en) + "</span></a>";
    }).join("");
  }

  window.aogGraceCompassAdult = function (rec) {
    if (!rec || !(window.AOG_SESSIONS && window.AOG_SESSIONS.length)) return "";
    var es = isEs();
    var scores = { A: rec.normA, B: rec.normB, C: rec.normC };
    var lk = lowestKey(rec);
    var minScore = scores[lk];
    var supporting = (minScore != null && minScore < 75);
    var sessions = (supporting ? sessionsFor(lk) : legacySessions()).slice(0, 2);
    if (!sessions.length) return "";

    var domName = supporting ? (es ? DOMA[lk].es : DOMA[lk].en) : (es ? "Integración y legado" : "Integration & legacy");
    var focus = supporting ? (es ? DOMA[lk].fcs_es : DOMA[lk].fcs_en) : (es ? "consolidar las cuatro distinciones" : "consolidating the four distinctions");
    var scoreTxt = (supporting && minScore != null) ? (Math.round(minScore) + "")
      : ((typeof aogBandLabel === "function") ? aogBandLabel(100) : (es ? "Seguir observando" : "Keep noticing"));
    var scoreCls = supporting ? (minScore < 50 ? "gc-low" : "gc-mid") : "gc-ok";
    var lead = supporting
      ? (es ? "El área de enfoque ahora es <strong>" + esc(domName) + "</strong> — el trabajo de " + esc(focus) + "."
            : "The focus area right now is <strong>" + esc(domName) + "</strong> — the work of " + esc(focus) + ".")
      : (es ? "Las tres áreas van bien. El trabajo ahora es de consolidación y legado."
            : "All three areas are doing well — the work now is consolidation and legacy.");
    var btw = supporting ? BTW[lk] : BTW.C;
    var bandSr = supporting ? (minScore < 50 ? (es ? "necesita apoyo" : "needs support") : (es ? "vale una reflexión" : "worth a reflection")) : (es ? "va bien" : "doing well");
    var pillAria = (supporting && minScore != null) ? ((es ? "Puntuación " : "Score ") + Math.round(minScore) + (es ? " de 100 · " : " of 100 · ") + bandSr) : bandSr;

    return "" +
    "<div class=\"aog-gc aog-gc-adult\" role=\"region\" aria-label=\"" + (es ? "Guía Grace Compass · Profesional" : "Grace Compass guidance · Practitioner") + "\">" +
      "<div class=\"gc-head\">" +
        "<div class=\"gc-eyebrow\"><span class=\"gc-compass\" aria-hidden=\"true\">◉</span> " + (es ? "Grace Compass · Adulto / Profesional" : "Grace Compass · Adult / Practitioner") + "</div>" +
        "<div class=\"gc-score-pill " + scoreCls + "\" role=\"img\" aria-label=\"" + esc(pillAria) + "\">" + esc(scoreTxt) + "</div>" +
      "</div>" +
      "<p class=\"gc-lead\">" + lead + "</p>" +
      "<div class=\"gc-section gc-now\">" +
        "<div class=\"gc-sec-label\">" + (es ? "Ahora mismo · anclaje y regulación" : "Right now · grounding & regulation") + "</div>" +
        "<div class=\"gc-tools\">" + toolChips(rec, es) + "</div>" +
      "</div>" +
      "<div class=\"gc-section gc-grow\">" +
        "<div class=\"gc-sec-label\">" + (es ? "La sesión precisa · Edición para Profesionales" : "The precise session · Practitioner Edition") + "</div>" +
        sessions.map(function (s) { return sessionCard(s, es); }).join("") +
      "</div>" +
      "<div class=\"gc-section gc-home\">" +
        "<div class=\"gc-sec-label\">" + (es ? "Una reflexión entre sesiones" : "One between-session reflection") + "</div>" +
        "<p class=\"gc-home-q\">" + esc(es ? btw.es : btw.en) + "</p>" +
      "</div>" +
      "<div class=\"gc-store\">" +
        (es ? "¿Facilita un grupo? " : "Facilitating a group? ") +
        "<a href=\"" + STORE_URL + "\" target=\"_blank\" rel=\"noopener\">" + (es ? "Pida la Edición para Profesionales y los cuadernos de participante" : "Order the Practitioner Edition & participant workbooks") + " →</a>" +
      "</div>" +
    "</div>";
  };
})();

