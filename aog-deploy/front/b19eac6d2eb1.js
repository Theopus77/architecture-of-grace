
/* ============================================================================
   AOG GRACE COMPASS — precision mapping engine (Phase 1)
   Maps a check-in (grade band + lowest domain) to the EXACT crosswalk row:
   lesson + novel scene + anchor chart + neuro-affirming adjustment, with a
   traceable citation and the razor-and-blades storefront link.
   Source of truth: window.AOG_CROSSWALK (the 5 SECULAR crosswalk DOCX).
   ========================================================================== */
(function () {
  function DTx(en, es) { try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; } }
  function isEs() { try { return (typeof dashLang !== "undefined" && dashLang === "es") || (typeof lang !== "undefined" && lang === "es"); } catch (e) { return false; } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]; }); }

  var STORE_URL = "https://architectureofgrace.com/#store";

  /* minimal local tool labels (icons mirror the dashboard tool library) */
  var TOOLMETA = {
    breathing:{ic:"🫁",en:"4-7-8 Breathing",es:"Respiración 4-7-8"},
    boxbreath:{ic:"🟦",en:"Paced Breathing",es:"Respiración pausada"},
    rainbow:{ic:"🌈",en:"Rainbow Breathing",es:"Respiración arcoíris"},
    take5:{ic:"🖐️",en:"Take 5",es:"Toma 5"},
    grounding:{ic:"🌿",en:"5-4-3-2-1 Grounding",es:"Anclaje 5-4-3-2-1"},
    pmr:{ic:"🧘",en:"Body Scan",es:"Escaneo corporal"},
    movement:{ic:"🏃",en:"Movement Break",es:"Pausa de movimiento"},
    calmjar:{ic:"🫙",en:"Calm Down Jar",es:"Frasco de la calma"},
    tappad:{ic:"👆",en:"Tap Pad",es:"Almohadilla de toques"},
    bodycheck:{ic:"🧭",en:"Body Check",es:"Autorreflexión del cuerpo"},
    bilateral:{ic:"🦋",en:"Butterfly Hug",es:"Abrazo mariposa"},
    safeplace:{ic:"🌱",en:"Safe Place",es:"Lugar seguro"},
    fidget:{ic:"🌀",en:"Visual Fidget",es:"Fidget visual"},
    emotion:{ic:"🟡",en:"Emotion Wheel",es:"Rueda de emociones"},
    feelwheel:{ic:"🎡",en:"Feelings Wheel",es:"Rueda de sentimientos"},
    coreg:{ic:"🧡",en:"Co-Regulation",es:"Co-regulación"},
    animalyoga:{ic:"🦁",en:"Animal Yoga",es:"Yoga animal"}
  };

  var DOM = {
    A:{en:"Emotional Regulation & Well-Being",es:"Regulación emocional y bienestar",kid_en:"calming the body",kid_es:"calmar el cuerpo"},
    B:{en:"Self-Compassion & Growth",es:"Autocompasión y crecimiento",kid_en:"a kinder inner voice",kid_es:"una voz interior más amable"},
    C:{en:"Social Competency & Repair",es:"Competencia social y reparación",kid_en:"repair and connection",kid_es:"reparación y conexión"}
  };

  /* one gentle home question per domain */
  var HOMEQ = {
    A:{en:"When a big feeling showed up this week, what helped your child’s body settle — and could you name that one thing together?",
       es:"Cuando apareció una emoción grande esta semana, ¿qué ayudó al cuerpo de su niño/a a calmarse — y podrían nombrar juntos esa cosa?"},
    B:{en:"Could you share one small mistake you made this week and what you learned? It quietly teaches that a mistake is something we did, not who we are.",
       es:"¿Podría compartir un pequeño error que cometió esta semana y qué aprendió? Enseña en silencio que un error es algo que hicimos, no quiénes somos."},
    C:{en:"Is there a small rupture — a sibling spat, a hard moment — where you could wonder aloud together what the other person might have been feeling?",
       es:"¿Hay una pequeña ruptura — una pelea entre hermanos, un momento difícil — donde podrían preguntarse juntos en voz alta qué pudo haber sentido la otra persona?"}
  };

  /* kid-voiced "take this home" prompt — what the STUDENT can do/share with a grown-up */
  var SELFQ = {
    A:{en:"When a big feeling shows up, try naming it and taking one slow breath. You could show a grown-up your favorite way to feel calm again.",
       es:"Cuando aparezca una emoción grande, intenta nombrarla y tomar una respiración lenta. Podrías mostrarle a una persona adulta tu forma favorita de volver a la calma."},
    B:{en:"This week, catch one moment you were hard on yourself — and say the kinder thing instead. You could ask a grown-up about a time they made a mistake and what they learned.",
       es:"Esta semana, sorprende un momento en que fuiste duro contigo — y di mejor lo amable. Podrías preguntarle a una persona adulta sobre una vez que cometió un error y qué aprendió."},
    C:{en:"If something feels bumpy with someone, try wondering out loud together what they might have been feeling. A grown-up can help you talk it through.",
       es:"Si algo se siente difícil con alguien, intenta preguntarte en voz alta qué pudo estar sintiendo. Una persona adulta puede ayudarte a conversarlo."}
  };

  var BAND_SEQ = ["K-2","3-5","6-8","9-10","11-12"];
  function normBand(grade) {
    if (typeof aogGradeToBand === "function") {
      var b = aogGradeToBand(grade);
      if (b) return String(b).replace(/[‒–—−]/g, "-").replace(/\s+/g, "");
    }
    return null;
  }
  /* lowest domain key A/B/C (ties A<B<C); falls back to the dashboard helper */
  function lowestKey(rec) {
    if (typeof aogLowestDomainKey === "function") return aogLowestDomainKey(rec.normA, rec.normB, rec.normC);
    var d = { A: rec.normA || 0, B: rec.normB || 0, C: rec.normC || 0 };
    return Object.keys(d).sort(function (x, y) { return d[x] - d[y]; })[0];
  }

  /* the heart: exact crosswalk rows for a band + domain, with nearest-band fallback */
  function rowsFor(band, dom) {
    var all = window.AOG_CROSSWALK || [];
    var hit = all.filter(function (r) { return r.b === band && r.dom === dom; });
    var fallback = false, fromBand = band;
    if (!hit.length) {
      /* walk outward to the nearest band that teaches this domain (still fully traceable) */
      var i = BAND_SEQ.indexOf(band);
      for (var step = 1; step < BAND_SEQ.length && !hit.length; step++) {
        [i - step, i + step].forEach(function (j) {
          if (!hit.length && j >= 0 && j < BAND_SEQ.length) {
            var h = all.filter(function (r) { return r.b === BAND_SEQ[j] && r.dom === dom; });
            if (h.length) { hit = h; fromBand = BAND_SEQ[j]; fallback = true; }
          }
        });
      }
    }
    /* gentlest-first ordering, but a flagged scene's higher-risk rows sort later */
    hit = hit.slice().sort(function (a, b) { return (a.risk - b.risk) || 0; });
    return { rows: hit, fallback: fallback, fromBand: fromBand };
  }

  function toolChips(rec, es) {
    var ids = (typeof window.aogMatchTools === "function") ? window.aogMatchTools(rec) : [];
    ids = ids.slice(0, 5);
    if (!ids.length) ids = ["breathing", "grounding", "safeplace"];
    return ids.map(function (id) {
      var m = TOOLMETA[id]; if (!m) return "";
      var open = "if(typeof toolOpen==='function')toolOpen('" + id + "');return false;";
      return "<a class=\"gc-tool\" role=\"button\" href=\"#\" onclick=\"" + open + "\"><span class=\"gc-tool-ic\" aria-hidden=\"true\">" + m.ic + "</span><span class=\"gc-tool-tx\">" + esc(es ? m.es : m.en) + "</span></a>";
    }).join("");
  }

  /* Phase 3: a prominent, glanceable risk banner at the top of the report */
  function riskBanner(level, es) {
    if (!level) return "";
    if (level >= 2) return "<div class=\"gc-riskbanner gc-rb-2\" role=\"note\"><span class=\"gc-rb-flag\" aria-hidden=\"true\">★★</span><span class=\"gc-rb-tx\"><strong>" +
      (es ? "Lección de máxima sensibilidad." : "Highest-sensitivity lesson.") + "</strong> " +
      (es ? "Se requiere co-facilitación del consejero/a y la página de Recursos de Crisis publicada antes de enseñar. Informe al equipo de antemano y reevalúe el riesgo activo."
          : "Counselor co-facilitation and the posted Crisis Resources page are required before teaching. Pre-brief the team and re-screen for active risk.") + "</span></div>";
    return "<div class=\"gc-riskbanner gc-rb-1\" role=\"note\"><span class=\"gc-rb-flag\" aria-hidden=\"true\">★</span><span class=\"gc-rb-tx\"><strong>" +
      (es ? "Lección de mayor sensibilidad." : "Higher-sensitivity lesson.") + "</strong> " +
      (es ? "Tenga a un adulto de confianza presente y siga su protocolo de apoyo por banda de grado antes de enseñar esta escena."
          : "Have a trusted adult present and follow your grade-band support protocol before teaching this scene.") + "</span></div>";
  }

  function riskNote(risk, es) {
    if (!risk) return "";
    if (risk >= 2) return "<div class=\"gc-risk gc-risk-2\" role=\"note\"><span class=\"gc-risk-star\" aria-hidden=\"true\">★★</span> " +
      (es ? "Escena de máxima sensibilidad. Requiere co-facilitación del consejero/a y la página de Recursos de Crisis publicada antes de enseñarla."
          : "Highest-sensitivity scene. Requires counselor co-facilitation and the posted Crisis Resources page before teaching.") + "</div>";
    return "<div class=\"gc-risk gc-risk-1\"><span class=\"gc-risk-star\">★</span> " +
      (es ? "Escena de mayor sensibilidad. Tenga a la mano su protocolo de apoyo y un adulto de confianza; siga la guía al margen."
          : "Higher-sensitivity scene. Keep your support protocol and a trusted adult available; follow the in-margin guardrail.") + "</div>";
  }

  /* Neuro-affirming render-time supports (don't bloat the 81 source rows): an
     interoception/alexithymia body-scan on 3-5 & 6-8 regulation/self-compassion rows,
     and a demand-soft "first step only" option on repair/apology/Slow-Release rows. */
  var AOG_INTERO_TIP = { en: "Interoception first — before naming the feeling, do a 10-second body scan (hands, stomach, chest, jaw) and point to where you feel it most. That spot is the starting place; you don’t have to name the emotion yet, just the location.", es: "Primero la interocepción — antes de nombrar el sentimiento, haz un escaneo corporal de 10 segundos (manos, estómago, pecho, mandíbula) y señala dónde lo sientes más. Ese punto es el comienzo; no tienes que nombrar la emoción todavía, solo el lugar." };
  var AOG_PDA_TIP = { en: "Demand-soft option — if any step feels like too much today, you only have to do the first one; the rest can wait. Starting is what counts, and you decide when you’re ready for step 2.", es: "Opción de baja demanda — si algún paso se siente como demasiado hoy, solo tienes que hacer el primero; el resto puede esperar. Empezar es lo que cuenta, y tú decides cuándo estás listo/a para el paso 2." };
  window.aogNeuroExtrasHtml = function (r, fromBand, isEs) {
    if (!r) return "";
    function e(s){ return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
    var band = String(r.b || fromBand || ""), dom = r.dom || "", out = [];
    if ((band === "3-5" || band === "6-8") && (dom === "A" || dom === "B")) out.push(isEs ? AOG_INTERO_TIP.es : AOG_INTERO_TIP.en);
    var blob = ((r.lesson || "") + " " + (r.theme || "") + " " + (r.scene || "")).toLowerCase();
    if (/apolog|repair|slow release|make it right/.test(blob)) out.push(isEs ? AOG_PDA_TIP.es : AOG_PDA_TIP.en);
    if (!out.length) return "";
    return out.map(function (tip) { return '<div class="gc-na-extra" style="margin-top:6px;padding-left:10px;border-left:2px solid var(--gold,#B8893A);font-size:12.5px;line-height:1.5;color:var(--ink-soft,#5b6478);">' + e(tip) + '</div>'; }).join("");
  };
  function gcExplicitCite(L, band, scene, es) {
    var bookMap = { "K-2":"1", "3-5":"2", "6-8":"3", "9-10":"4", "11-12":"5" };
    var book = bookMap[band] || "";
    var u = (String(L).match(/U(\d+)/) || [])[1];
    var l = (String(L).match(/L(\d+)/) || [])[1];
    var title = (String(L).split("—")[1] || "").trim();
    var ch = ((String(scene || "").match(/Ch\.?\s*[0-9–-]+/) || [])[0]) || "";
    var parts = [];
    if (book) parts.push((es ? "Libro " : "Book ") + book);
    if (u) parts.push((es ? "Unidad " : "Unit ") + u);
    if (l) parts.push((es ? "Lección " : "Lesson ") + l);
    return '<div class="gc-teachnext" style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;background:#FBF3DF;border:1px solid var(--gold,#D9A33B);border-radius:9px;padding:8px 12px;margin:0 0 9px;font-size:14.5px;font-weight:700;color:var(--navy,#0A1E33);">' +
      '<span aria-hidden="true">📖</span>' +
      '<span style="font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);">' + (es ? "Para enseñar" : "Teach next") + '</span>' +
      '<span>' + esc(parts.join(" · ")) + (title ? (" — " + esc(title)) : "") + (ch ? (' <span style="color:var(--ink-soft,#5b6478);font-weight:600;">· ' + esc(ch) + "</span>") : "") + '</span>' +
    '</div>';
  }
  function resourceCard(r, band, fallback, fromBand, es, selfView) {
    /* provisional ES overlay (English remains the source of truth) */
    var tr = (es && window.AOG_CROSSWALK_ES) ? window.AOG_CROSSWALK_ES[(r.b || fromBand) + "|" + r.lesson] : null;
    var L = (tr && tr.lesson) ? tr.lesson : r.lesson;
    var TH = (tr && tr.theme) ? tr.theme : r.theme;
    var SC = (tr && tr.scene) ? tr.scene : r.scene;
    var CH = (tr && tr.chart) ? tr.chart : r.chart;
    var NE = (tr && tr.neuro) ? tr.neuro : r.neuro;
    /* STUDENT self-view: warm, minimal — the lesson named plainly + the story moment.
       No teacher-instruction (neuro) text, no anchor-chart spec, no crosswalk citation. */
    if (selfView) {
      var _p = L.split(/\s*—\s*/); var title = (_p.length > 1) ? _p.slice(1).join(" — ") : L;
      return "<div class=\"gc-res\">" +
        "<div class=\"gc-res-lesson\">" + esc(title) + "</div>" +
        "<p class=\"gc-res-v\" style=\"margin:0;\">" + esc(SC) + "</p>" +
      "</div>";
    }
    var prov = es ? ("<span class=\"gc-prov\" style=\"opacity:0.65;font-size:10px;\">" + (tr ? "Traducción provisional" : "EN · ES en preparación") + "</span>") : "";
    var cite = (es ? "Trazable a: " : "Traceable to: ") + esc(fromBand) + " · Crosswalk · " + esc(TH) + " · " + esc(L);
    var fb = fallback ? "<span class=\"gc-fb\">" + (es ? "(anclaje fundacional — se enseña en la banda " + esc(fromBand) + " y se transfiere)" : "(foundational anchor — taught in the " + esc(fromBand) + " volume and carried forward)") + "</span>" : "";
    return "<div class=\"gc-res\">" +
      "<div class=\"gc-res-lesson\">" + (selfView ? esc(L) : gcExplicitCite(L, fromBand, SC, es)) + " " + fb + " " + prov + "</div>" +
      "<div class=\"gc-res-grid\">" +
        "<div class=\"gc-res-k\">" + (es ? "Escena de la novela" : "Novel scene") + "</div><div class=\"gc-res-v\">" + esc(SC) + "</div>" +
        "<div class=\"gc-res-k\">" + (es ? "Ancla visual" : "Anchor chart") + "</div><div class=\"gc-res-v\">" + esc(CH) + "</div>" +
        "<div class=\"gc-res-k\">" + (es ? "Ajuste neuroafirmante" : "Neuro-affirming adjustment") + "</div><div class=\"gc-res-v\">" + esc(NE) + window.aogNeuroExtrasHtml(r, fromBand, es) + "</div>" +
      "</div>" +
      (selfView ? "" : riskNote(r.risk, es)) +
      "<div class=\"gc-cite\">" + cite + "</div>" +
    "</div>";
  }

  /* PUBLIC: compact domain-score strip for the printed session sheet (print-safe inline styles). */
  window.aogCompassScoreStrip = function (rec, es) {
    if (!rec) return "";
    function sc(lbl, v) {
      var val = (v == null) ? "—" : Math.round(v);
      return "<div style=\"min-width:104px;\"><div style=\"font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#7a5a12;font-weight:700;font-family:Inter,system-ui,sans-serif;\">" + lbl + "</div><div style=\"font-size:21px;font-weight:800;color:#0A1E33;font-family:Fraunces,Georgia,serif;\">" + val + "<span style=\"font-size:11px;color:#646E86;font-weight:600;\">/100</span></div></div>";
    }
    return "<div style=\"display:flex;gap:24px;flex-wrap:wrap;margin:0 0 20px;\">" +
      sc(es ? "Compuesto" : "Composite", rec.normComposite) +
      sc(es ? "Regulación" : "Emotional Reg.", rec.normA) +
      sc(es ? "Autocompasión" : "Self-Compassion", rec.normB) +
      sc(es ? "Social" : "Social", rec.normC) +
    "</div>";
  };

  /* PUBLIC: returns the Grace Compass panel HTML for a check-in record. */
  window.aogGraceCompass = function (rec, opts) {
    if (!rec || !(window.AOG_CROSSWALK && window.AOG_CROSSWALK.length)) return "";
    opts = opts || {}; var selfView = !!opts.self; /* student's own view: drop risk protocols + storefront */
    var es = isEs();
    /* adult / clinical records route to the Practitioner Edition pathway */
    var isAdult = !!(rec.population === "adult" || String(rec.grade) === "Adult");
    if (isAdult) { return (typeof window.aogGraceCompassAdult === "function") ? window.aogGraceCompassAdult(rec) : ""; }
    var band = normBand(rec.grade);
    if (!band) return "";

    var scores = { A: rec.normA, B: rec.normB, C: rec.normC };
    var lk = lowestKey(rec);
    var minScore = scores[lk];
    var supporting = (minScore != null && minScore < 75);
    var dom = supporting ? lk : "ALL";

    var rowLimit = opts.compact ? 1 : 2; /* printed session sheet keeps it to one precise resource */
    var picked = rowsFor(band, dom);
    var rows = picked.rows.slice(0, rowLimit);
    if (!rows.length) { /* doing-well with no ALL row in band -> nearest ALL */
      picked = rowsFor(band, "ALL"); rows = picked.rows.slice(0, 1);
    }
    if (!rows.length) return "";

    var domName = supporting ? (es ? DOM[lk].es : DOM[lk].en) : (es ? "Integración y crecimiento" : "Integration & growth");
    var kid = supporting ? (es ? DOM[lk].kid_es : DOM[lk].kid_en) : (es ? "afianzar las cuatro áreas" : "weaving all four areas together");
    var scoreTxt = (supporting && minScore != null) ? (Math.round(minScore) + "")
      : ((typeof aogBandLabel === "function") ? aogBandLabel(100) : (es ? "Seguir observando" : "Keep noticing"));
    var scoreCls = supporting ? (minScore < 50 ? "gc-low" : "gc-mid") : "gc-ok";

    var lead = selfView
      ? (supporting
          ? (es ? "Un lugar amable para crecer ahora es <strong>" + esc(kid) + "</strong>."
                : "A gentle place to grow right now is <strong>" + esc(kid) + "</strong>.")
          : (es ? "Te va muy bien en las tres áreas. Aquí va algo para seguir creciendo."
                : "You’re doing really well across all three — here’s something to keep growing."))
      : (supporting
          ? (es ? "El área para apoyar ahora es <strong>" + esc(domName) + "</strong> — el trabajo de " + esc(kid) + "."
                : "The area to support right now is <strong>" + esc(domName) + "</strong> — the work of " + esc(kid) + ".")
          : (es ? "Las tres áreas van bien. Aquí va un recurso de enriquecimiento para seguir creciendo."
                : "All three areas are doing well — here is an enrichment resource to keep growing."));

    var homeq = selfView ? (supporting ? SELFQ[lk] : SELFQ.C) : (supporting ? HOMEQ[lk] : HOMEQ.C);
    var maxRisk = rows.reduce(function (m, r) { return Math.max(m, r.risk || 0); }, 0);
    var headFlag = (maxRisk && !selfView) ? "<span class=\"gc-headflag gc-hf-" + maxRisk + "\" aria-hidden=\"true\">" + (maxRisk >= 2 ? "★★" : "★") + "</span>" : "";
    /* accessible score-pill label (color alone must not convey the band) */
    var bandSr = supporting ? (minScore < 50 ? (es ? "necesita apoyo" : "needs support") : (es ? "vale una reflexión" : "worth a reflection")) : (es ? "va bien" : "doing well");
    var pillAria = (supporting && minScore != null) ? ((es ? "Puntuación " : "Score ") + Math.round(minScore) + (es ? " de 100 · " : " of 100 · ") + bandSr) : bandSr;
    /* warm, student-voiced section labels on the self-view; clinical labels otherwise */
    var lblCls = selfView ? "gc-next-step" : "gc-sec-label";
    var lblTools = selfView ? (es ? "Tu siguiente paso" : "Your next step") : (es ? "Ahora mismo · herramientas de regulación" : "Right now · regulation tools");
    var lblStory = selfView ? (es ? "Una historia para ti" : "A story that meets you here") : (es ? "El recurso preciso · crecimiento a largo plazo" : "The precise resource · longer-term growth");
    var lblHome = selfView ? (es ? "Para llevar a casa" : "Take this home") : (es ? "Una pregunta suave para casa" : "One gentle question for home");

    return "" +
    "<div class=\"aog-gc\" role=\"region\" aria-label=\"" + (es ? "Guía Grace Compass" : "Grace Compass guidance") + "\">" +
      "<div class=\"gc-head\">" +
        "<div class=\"gc-eyebrow\"><span class=\"gc-compass\" aria-hidden=\"true\">◉</span> " + (es ? "Grace Compass" : "Grace Compass") + headFlag + "</div>" +
        "<div class=\"gc-score-pill " + scoreCls + "\" role=\"img\" aria-label=\"" + esc(pillAria) + "\">" + esc(scoreTxt) + "</div>" +
      "</div>" +
      "<p class=\"gc-lead\">" + lead + "</p>" +
      (selfView ? "" : riskBanner(maxRisk, es)) +

      "<div class=\"gc-section gc-now gc-coll hd-collapsed\">" +
        "<div class=\"" + lblCls + " gc-sec-toggle\" role=\"button\" tabindex=\"0\" aria-expanded=\"false\" onclick=\"aogGcToggle(this)\" onkeydown=\"aogGcKey(event,this)\">" + lblTools + "<span class=\"gc-chev\" aria-hidden=\"true\">&#9662;</span></div>" +
        "<div class=\"gc-sec-body\"><div class=\"gc-tools\">" + toolChips(rec, es) + "</div></div>" +
      "</div>" +

      "<div class=\"gc-section gc-grow gc-coll hd-collapsed\">" +
        "<div class=\"" + lblCls + " gc-sec-toggle\" role=\"button\" tabindex=\"0\" aria-expanded=\"false\" onclick=\"aogGcToggle(this)\" onkeydown=\"aogGcKey(event,this)\">" + lblStory + "<span class=\"gc-chev\" aria-hidden=\"true\">&#9662;</span></div>" +
        "<div class=\"gc-sec-body\">" + rows.map(function (r) { return resourceCard(r, band, picked.fallback, picked.fromBand, es, selfView); }).join("") + "</div>" +
      "</div>" +

      "<div class=\"gc-section gc-home\">" +
        "<div class=\"" + lblCls + "\">" + lblHome + "</div>" +
        "<p class=\"gc-home-q\">" + esc(es ? homeq.es : homeq.en) + "</p>" +
      "</div>" +

      (selfView ? "" : ("<div class=\"gc-store\">" +
        (es ? "¿No tiene este cuaderno en su salón? " : "Don’t have this workbook copy in your classroom? ") +
        "<a href=\"" + STORE_URL + "\" target=\"_blank\" rel=\"noopener\">" + (es ? "Pida el paquete de materiales físicos" : "Order the Physical Materials Bundle") + " →</a>" +
      "</div>")) +
    "</div>";
  };
})();

