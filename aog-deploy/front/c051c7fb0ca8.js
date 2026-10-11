
      (function () {
        var GLANG = (document.documentElement.getAttribute("lang") === "es") ? "es" : "en";
        var STYLE = "narrative";
        var T = {
          en: { area: "Goal Area: Functional (social-emotional / behavioral)", present: "Present level (related to goal)", presentTxt: function (b, d, bi) { return "Currently " + b + " on the " + d + " check-in; " + (bi === 2 ? "strength and relationship are the focus." : "growth and relationship are the focus."); },
            goalStmt: "Goal Statement", scoring: "Scoring Method", scoringTxt: function (b, n, d, bi) { return bi === 2 ? "Sustained demonstration across check-in windows and settings, with the relational indicators below observed by a trusted adult — a record of strength and growing leadership, never a deficit count." : "Growth across check-in windows from " + b + " toward " + n + ", with the relational indicators below observed by a trusted adult — a flag for support and a record of growth, never a deficit count."; },
            bench: "Benchmarks / Short-Term Objectives", evalProc: "Evaluation Procedure: Observation", schedule: "Schedule for Determining Progress",
            ee: "Essential Elements (relational indicators)", supports: "Supports", header: "GRACE GOAL", student: "Student", grade: "Grade", date: "Date", current: "Current", target: "Target by year-end", targetHi: "Sustain & generalize",
            foot: "Relationship-centered SEL goal · Architecture of Grace. A guide for growth, not a diagnosis or a behavior count.",
            obj: function (p, who, core, rung, prog, d) { return who + " will " + core + " " + rung + ", with check-in growth " + prog + " on the " + d + " domain, as observed by a trusted adult."; },
            progLast: function (n, bi) { return bi === 2 ? "sustained across settings" : "reaching " + n; }, progMid: function (n, bi) { return bi === 2 ? "sustaining the pattern" : "showing growth toward " + n; },
            bands: ["Adult follow-up", "Worth a conversation", "Keep noticing"],
            rungs: ["with adult cueing and support", "with a brief reminder", "independently in a structured setting", "independently and generalized across settings", "independently across settings, and beginning to model it for peers"],
            periods: function (n) { return n === 4 ? ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"] : n === 3 ? ["Trimester 1", "Trimester 2", "Trimester 3"] : ["Semester 1", "Semester 2"]; } },
          es: { area: "Área de la meta: Funcional (socioemocional / conductual)", present: "Nivel actual (relacionado con la meta)", presentTxt: function (b, d, bi) { return "Actualmente " + b + " en el registro de " + d + "; " + (bi === 2 ? "la fortaleza y la relación son el enfoque." : "el enfoque es el crecimiento y la relación."); },
            goalStmt: "Declaración de la meta", scoring: "Método de puntuación", scoringTxt: function (b, n, d, bi) { return bi === 2 ? "Demostración sostenida a través de los períodos de registro y en distintos entornos, con los indicadores relacionales de abajo observados por un adulto de confianza — un registro de fortaleza y liderazgo creciente, nunca un conteo de déficits." : "Crecimiento a través de los períodos de registro desde " + b + " hacia " + n + ", con los indicadores relacionales de abajo observados por un adulto de confianza — una señal de apoyo y un registro de crecimiento, nunca un conteo de déficits."; },
            bench: "Puntos de referencia / Objetivos a corto plazo", evalProc: "Procedimiento de evaluación: Observación", schedule: "Calendario para determinar el progreso",
            ee: "Elementos esenciales (indicadores relacionales)", supports: "Apoyos", header: "META GRACE", student: "Estudiante", grade: "Grado", date: "Fecha", current: "Actual", target: "Meta para fin de año", targetHi: "Sostener y generalizar",
            foot: "Meta SEL centrada en la relación · Architecture of Grace. Una guía para el crecimiento, no un diagnóstico ni un conteo de conductas.",
            obj: function (p, who, core, rung, prog, d) { return who + " " + core + " " + rung + ", con crecimiento en el registro " + prog + " en el dominio de " + d + ", observado por un adulto de confianza."; },
            progLast: function (n, bi) { return bi === 2 ? "sostenido en distintos entornos" : "alcanzando " + n; }, progMid: function (n, bi) { return bi === 2 ? "sosteniendo el patrón" : "mostrando crecimiento hacia " + n; },
            bands: ["Seguimiento de un adulto", "Vale una conversación", "Seguir observando"],
            rungs: ["con apoyo y señales del adulto", "con un breve recordatorio", "de forma independiente en un entorno estructurado", "de forma independiente y generalizada en distintos entornos", "de forma independiente en distintos entornos, y comenzando a modelarlo para sus compañeros"],
            periods: function (n) { return n === 4 ? ["Período 1", "Período 2", "Período 3", "Período 4"] : n === 3 ? ["Trimestre 1", "Trimestre 2", "Trimestre 3"] : ["Semestre 1", "Semestre 2"]; } }
        };
        /* ============================================================
           Competency registry — ONE self-contained config per skill.
           To add a competency, add a single object here; every view
           (COMPS, composer slots/PARTS, family HOME tips, SEL auto-map)
           is derived below, so there's a single place to edit.
             name, domain — labels (EN/ES)
             sel          — default Illinois SEL standard code
             core         — observable verb phrase (used in objectives)
             ms           — relational indicators (EN/ES)
             res          — supports / resource line
             home         — a warm "at home" practice (Family style)
             slots        — composer pieces:
                            cue · recog (the internal recognition) ·
                            move (the choice) · outcome · sustain · noun
           ============================================================ */
        var COMP = {
          pause: {
            name: { en: "The Pause", es: "La Pausa" }, domain: { en: "Emotional Regulation & Well-Being", es: "Regulación emocional y bienestar" }, sel: "1A",
            core: { en: "pause and choose a reset before reacting when strong feelings rise", es: "se detiene y elige una estrategia de calma antes de reaccionar cuando surgen emociones fuertes" },
            ms: { en: ["Names the feeling before acting", "Uses a chosen reset (breath, water, movement) when cued, then independently", "Re-engages with the group ready to continue"], es: ["Nombra la emoción antes de actuar", "Usa una estrategia de calma (respiración, agua, movimiento) con apoyo y luego de forma independiente", "Se reincorpora al grupo listo/a para continuar"] },
            res: { en: "Book 1 · regulation lessons · Quiet Space reset tools", es: "Libro 1 · lecciones de regulación · herramientas del Espacio Tranquilo" },
            resTail: { en: "regulation lessons · Quiet Space reset tools", es: "lecciones de regulación · herramientas del Espacio Tranquilo" },
            home: { en: "naming big feelings together and practicing one calm-down — a slow breath, a glass of water, a short walk — before talking it through.", es: "nombrar juntos las emociones grandes y practicar una forma de calmarse — una respiración lenta, un vaso de agua, una caminata corta — antes de hablar." },
            slots: {
              cue: { en: "When strong feelings rise", es: "Cuando surgen emociones fuertes" },
              recog: { en: "the early signal that they're becoming activated", es: "la primera señal de que se está activando" },
              move: { en: "pause and use a reset before reacting", es: "pausar y usar una estrategia de calma antes de reaccionar" },
              outcome: { en: "so a big moment gives way to calm and connection", es: "para que un momento intenso dé paso a la calma y la conexión" },
              sustain: { en: "calm and connection", es: "la calma y la conexión" },
              noun: { en: "the Pause", es: "la Pausa" } }
          },
          charitable: {
            name: { en: "The Charitable Read", es: "La Lectura Caritativa" }, domain: { en: "Social Competency & Repair", es: "Competencia social y reparación" }, sel: "2A",
            core: { en: "offer the benefit of the doubt in an unclear moment", es: "ofrece el beneficio de la duda en un momento confuso" },
            ms: { en: ["Offers a kinder, alternative explanation when prompted", "Pauses retaliation and checks intent", "Asks a question instead of making an accusation"], es: ["Ofrece una explicación más amable cuando se le indica", "Pausa la represalia y verifica la intención", "Hace una pregunta en lugar de una acusación"] },
            res: { en: "Book 3 · perspective-taking · the Three Sides protocol", es: "Libro 3 · toma de perspectiva · protocolo de los Tres Lados" },
            resTail: { en: "perspective-taking · the Three Sides protocol", es: "toma de perspectiva · protocolo de los Tres Lados" },
            home: { en: "wondering out loud together when something feels unfair: “I wonder if that was an accident?”", es: "preguntarse en voz alta juntos cuando algo parezca injusto: “¿Sería un accidente?”" },
            slots: {
              cue: { en: "When someone's intent is unclear", es: "Cuando la intención de alguien no está clara" },
              recog: { en: "the moment they're about to assume the worst", es: "el momento en que está a punto de suponer lo peor" },
              move: { en: "offer the benefit of the doubt and check intent before reacting", es: "ofrecer el beneficio de la duda y verificar la intención antes de reaccionar" },
              outcome: { en: "so a misread gives way to understanding and the friendship is protected", es: "para que una mala interpretación dé paso a la comprensión y se proteja la amistad" },
              sustain: { en: "trust and the benefit of the doubt", es: "la confianza y el beneficio de la duda" },
              noun: { en: "the charitable read", es: "la lectura caritativa" } }
          },
          coach: {
            name: { en: "The Coach Voice", es: "La Voz del Entrenador" }, domain: { en: "Self-Compassion & Growth Mindset", es: "Autocompasión y mentalidad de crecimiento" }, sel: "1B",
            core: { en: "answer the inner critic with a kind coach voice after a mistake", es: "responde a la crítica interior con una voz amable de entrenador después de un error" },
            ms: { en: ["Replaces a harsh self-statement with a kinder one when cued", "Names one thing learned from the mistake", "Re-attempts the task after a setback"], es: ["Reemplaza una autocrítica dura por una más amable cuando se le indica", "Nombra algo que aprendió del error", "Vuelve a intentar la tarea tras un tropiezo"] },
            res: { en: "Book 2 · The Year of the Inner Critic", es: "Libro 2 · El año del crítico interior" },
            resTail: { en: "the inner-critic / kind-coach work", es: "el trabajo del crítico interior / entrenador amable" },
            home: { en: "modeling a kind “coach voice” out loud when a mistake happens, instead of harsh words.", es: "modelar en voz alta una “voz de entrenador” amable cuando ocurra un error, en lugar de palabras duras." },
            slots: {
              cue: { en: "After a mistake", es: "Después de un error" },
              recog: { en: "the inner critic starting up", es: "que el crítico interior se activa" },
              move: { en: "answer it with the voice of a kind coach, holding the mistake separate from their worth", es: "responder con la voz de un entrenador amable, manteniendo el error aparte de su valor" },
              outcome: { en: "so shame gives way to learning and trying again", es: "para que la vergüenza dé paso al aprendizaje y a un nuevo intento" },
              sustain: { en: "self-compassion and the courage to try again", es: "la autocompasión y el valor de volver a intentarlo" },
              noun: { en: "the coach voice", es: "la voz del entrenador" } }
          },
          repair: {
            name: { en: "The Repair Move", es: "El Acto de Reparación" }, domain: { en: "Social Competency & Repair", es: "Competencia social y reparación" }, sel: "2D",
            core: { en: "move toward repair after a conflict", es: "avanza hacia la reparación después de un conflicto" },
            ms: { en: ["Acknowledges the impact on the other person", "Offers a genuine repair in words or action", "Re-enters the relationship without avoidance"], es: ["Reconoce el impacto en la otra persona", "Ofrece una reparación genuina con palabras o acciones", "Vuelve a la relación sin evitarla"] },
            res: { en: "Book 3 · repair lessons · restorative conversation guide", es: "Libro 3 · lecciones de reparación · guía de conversación restaurativa" },
            resTail: { en: "repair lessons · restorative conversation guide", es: "lecciones de reparación · guía de conversación restaurativa" },
            home: { en: "practicing a simple repair together after a hard moment: “I'm sorry — here's what I'll do.”", es: "practicar juntos una reparación sencilla después de un momento difícil: “Lo siento — esto es lo que haré.”" },
            slots: {
              cue: { en: "When conflict ruptures a relationship", es: "Cuando un conflicto rompe una relación" },
              recog: { en: "that the rupture is theirs to help mend", es: "que la ruptura está en sus manos para ayudar a repararla" },
              move: { en: "move toward repair by owning their impact and offering a next step", es: "avanzar hacia la reparación reconociendo su impacto y ofreciendo un siguiente paso" },
              outcome: { en: "so a rupture can become reconnection", es: "para que una ruptura pueda convertirse en reconexión" },
              sustain: { en: "trust and a culture of repair", es: "la confianza y una cultura de reparación" },
              noun: { en: "the repair move", es: "el acto de reparación" } }
          },
          release: {
            name: { en: "The Release / Boundary", es: "El Soltar / Límite" }, domain: { en: "Emotional Regulation & Well-Being", es: "Regulación emocional y bienestar" }, sel: "1A",
            core: { en: "release what they cannot control while holding a kind, firm boundary", es: "suelta lo que no puede controlar mientras mantiene un límite amable y firme" },
            ms: { en: ["Names what is and isn't theirs to carry", "Uses a release strategy instead of replaying", "Holds a respectful 'no' without aggression or collapse"], es: ["Nombra lo que es y lo que no es suyo para cargar", "Usa una estrategia para soltar en vez de repetir", "Mantiene un 'no' respetuoso sin agresión ni colapso"] },
            res: { en: "Books 4–5 · boundaries & release · the Difficult-vs-Unsafe distinction", es: "Libros 4–5 · límites y soltar · la distinción Difícil-vs-Inseguro" },
            resTail: { en: "boundaries & release · the Difficult-vs-Unsafe distinction", es: "límites y soltar · la distinción Difícil-vs-Inseguro" },
            home: { en: "helping them name what they can let go of, and practicing a kind, firm “no” together.", es: "ayudarles a nombrar lo que pueden soltar y practicar juntos un “no” amable y firme." },
            slots: {
              cue: { en: "When something weighs on them", es: "Cuando algo le pesa" },
              recog: { en: "what is and isn't theirs to carry", es: "lo que es y lo que no es suyo para cargar" },
              move: { en: "set down what they can't control while holding a kind, firm boundary", es: "soltar lo que no puede controlar mientras mantiene un límite amable y firme" },
              outcome: { en: "so peace and self-respect can grow together", es: "para que la paz y el respeto propio puedan crecer juntos" },
              sustain: { en: "peace and healthy boundaries", es: "la paz y los límites saludables" },
              noun: { en: "the release and a clear boundary", es: "el soltar y un límite claro" } }
          }
        };
        /* Derived views — keep existing call sites working from the single source above. */
        var COMPS = {}, PARTS = {}, HOME = {}, COMP_SEL = {};
        Object.keys(COMP).forEach(function (k) { var c = COMP[k]; COMPS[k] = { name: c.name, domain: c.domain, core: c.core, ms: c.ms, res: c.res, resTail: c.resTail }; PARTS[k] = c.slots; HOME[k] = c.home; COMP_SEL[k] = c.sel; });

        /* ============================================================
           Templated goal composer.
           Instead of hard-coding one sentence per competency, each skill
           is broken into reusable slots (cue · internal recognition ·
           the move/choice · outcome · what's sustained). Band-keyed
           frames then assemble the goal dynamically — naming the internal
           move, and shifting tone by where the student is starting:
             need    (Adult follow-up)      → scaffolded, adult-supported
             reflect (Worth a conversation) → growth
             well    (Keep noticing)         → maintenance + modeling for peers
           Frame keys mirror the check-in band names, so the composer stays
           tied to the actual check-in data rather than an abstract scale.
           ============================================================ */
        var BAND_KEY = { 0: "need", 1: "reflect", 2: "well" };
        /* A per-band window into the developmental "rungs" (see T.rungs),
           so objectives scale from where the student actually starts. */
        var RUNG_BAND = { 0: [0, 2], 1: [0, 3], 2: [2, 4] };
        function rungFor(t, bi, i, n) { var w = RUNG_BAND[bi] || [0, 3]; var f = (n <= 1) ? 1 : (i / (n - 1)); return t.rungs[Math.round(w[0] + f * (w[1] - w[0]))]; }
        /* Band-keyed sentence frames — keys mirror the three check-in bands.
           Slots: cue · who · recog · move · outcome · sustain · noun */
        var GFRAME = {
          en: {
            need: function (s) { return s.cue + ", " + s.who + " is learning to notice " + s.recog + " and, with support from a trusted adult, to " + s.move + " — " + s.outcome + "."; },
            reflect: function (s) { return s.cue + ", " + s.who + " notices " + s.recog + " and chooses to " + s.move + " — " + s.outcome + "."; },
            well: function (s) { return s.cue + ", " + s.who + " consistently notices " + s.recog + " and chooses to " + s.move + " on their own and across settings — and is beginning to model it for peers, sustaining " + s.sustain + "."; }
          },
          es: {
            need: function (s) { return s.cue + ", " + s.who + " está aprendiendo a notar " + s.recog + " y, con el apoyo de un adulto de confianza, a " + s.move + " — " + s.outcome + "."; },
            reflect: function (s) { return s.cue + ", " + s.who + " nota " + s.recog + " y elige " + s.move + " — " + s.outcome + "."; },
            well: function (s) { return s.cue + ", " + s.who + " nota de manera constante " + s.recog + " y elige " + s.move + " por su cuenta y en distintos entornos — y comienza a modelarlo para sus compañeros, sosteniendo " + s.sustain + "."; }
          }
        };
        function composeGoal(compKey, bi, who) {
          var L = (GLANG === "es") ? "es" : "en"; var band = BAND_KEY[bi] || "reflect";
          var p = PARTS[compKey];
          if (!p) { var c = COMPS[compKey]; return c ? (who + " " + c.core[L]) : ""; }
          var slots = { who: who, cue: p.cue[L], recog: p.recog[L], move: p.move[L], outcome: p.outcome[L], sustain: p.sustain[L], noun: p.noun[L] };
          return GFRAME[L][band](slots);
        }
        function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
        function val(id) { var e = document.getElementById(id); return e ? (e.value || "") : ""; }

        /* BAND-AWARE SUPPORTS (2026-08-26). `res` hard-coded a book: the Coach
           Voice said "Book 2 · The Year of the Inner Critic", and that string
           printed as "Supports:" on the exported goal of a 6-8 student, whose
           book is Book 3. The builder already collects the grade -- use it.
           `res` stays as the fallback for a goal written with no grade set. */
        function aoggGoalBook() {
          try {
            var band = (typeof aogGradeToBand === "function") ? aogGradeToBand(val("aoggGrade").trim()) : null;
            var bk = (band && typeof aogBandBook === "function") ? aogBandBook(band) : null;
            if (!bk) return null;
            return (GLANG === "es" ? bk.n.replace("Book", "Libro") : bk.n) + " \u00b7 " + bk.t;
          } catch (e) { return null; }
        }
        function aoggSupports(c) {
          if (!c) return "";
          var bk = aoggGoalBook();
          var tail = (c.resTail && c.resTail[GLANG]) ? c.resTail[GLANG] : "";
          if (bk) return tail ? (bk + " \u00b7 " + tail) : bk;
          return c.res[GLANG];
        }

        /* ============================================================
           Illinois Learning Standards registry.
           Built to be extensible: SEL is fully populated now; future
           frameworks (ELA, Math, Science, etc.) can be added under
           IL_FRAMEWORKS without touching the goal-generation code.
           ============================================================ */
        var IL_STAGE_LABEL = {
          "1": { en: "Early Elementary", es: "Primaria temprana" },
          "2": { en: "Late Elementary", es: "Primaria superior" },
          "3": { en: "Middle / Jr. High", es: "Secundaria / preparatoria menor" },
          "4": { en: "Early High School", es: "Preparatoria temprana" },
          "5": { en: "Late High School", es: "Preparatoria superior" }
        };
        /* Map the app's grade bands onto Illinois' five developmental stages. */
        function ilStage(grade) { var b = gbBand(grade); return ({ k2: "1", "35": "2", "68": "3", "910": "4", "1112": "5", adult: "5" })[b] || ""; }
        var IL_SEL_GOALS = {
          "1": { en: "Develop self-awareness and self-management skills to achieve school and life success.", es: "Desarrollar la autoconciencia y las habilidades de autocontrol para lograr el éxito escolar y en la vida." },
          "2": { en: "Use social-awareness and interpersonal skills to establish and maintain positive relationships.", es: "Usar la conciencia social y las habilidades interpersonales para establecer y mantener relaciones positivas." },
          "3": { en: "Demonstrate decision-making skills and responsible behaviors in personal, school, and community contexts.", es: "Demostrar habilidades de toma de decisiones y conductas responsables en contextos personales, escolares y comunitarios." }
        };
        /* Each standard: goal number, descriptor, and one representative
           grade-banded benchmark (stages 1–5) drawn from the ISBE SEL
           Standards (Descriptions of Stage-Appropriate Performance). */
        var IL_SEL = {
          "1A": { goal: "1", name: { en: "Identify and manage one's emotions and behavior.", es: "Identificar y manejar las propias emociones y la conducta." }, b: {
            "1": { c: "1A.1b", en: "Demonstrate control of impulsive behavior.", es: "Demostrar control de la conducta impulsiva." },
            "2": { c: "1A.2b", en: "Describe and demonstrate ways to express emotions in a socially acceptable manner.", es: "Describir y demostrar formas de expresar las emociones de manera socialmente aceptable." },
            "3": { c: "1A.3b", en: "Apply strategies to manage stress and to motivate successful performance.", es: "Aplicar estrategias para manejar el estrés y motivar un desempeño exitoso." },
            "4": { c: "1A.4a", en: "Analyze factors that create stress or motivate successful performance.", es: "Analizar los factores que generan estrés o motivan un desempeño exitoso." },
            "5": { c: "1A.5a", en: "Evaluate how expressing one's emotions in different situations affects others.", es: "Evaluar cómo la expresión de las propias emociones en distintas situaciones afecta a los demás." } } },
          "1B": { goal: "1", name: { en: "Recognize personal qualities and external supports.", es: "Reconocer las cualidades personales y los apoyos externos." }, b: {
            "1": { c: "1B.1a", en: "Identify one's likes and dislikes, needs and wants, strengths and challenges.", es: "Identificar gustos y disgustos, necesidades y deseos, fortalezas y desafíos propios." },
            "2": { c: "1B.2a", en: "Describe personal skills and interests that one wants to develop.", es: "Describir las habilidades e intereses personales que uno desea desarrollar." },
            "3": { c: "1B.3a", en: "Analyze how personal qualities influence choices and successes.", es: "Analizar cómo las cualidades personales influyen en las decisiones y los logros." },
            "4": { c: "1B.4a", en: "Set priorities in building on strengths and identifying areas for improvement.", es: "Establecer prioridades para aprovechar las fortalezas e identificar áreas de mejora." },
            "5": { c: "1B.5a", en: "Implement a plan to build on a strength, meet a need, or address a challenge.", es: "Implementar un plan para desarrollar una fortaleza, satisfacer una necesidad o enfrentar un desafío." } } },
          "1C": { goal: "1", name: { en: "Demonstrate skills related to achieving personal and academic goals.", es: "Demostrar habilidades para alcanzar metas personales y académicas." }, b: {
            "1": { c: "1C.1b", en: "Identify goals for academic success and classroom behavior.", es: "Identificar metas para el éxito académico y la conducta en el aula." },
            "2": { c: "1C.2a", en: "Describe the steps in setting and working toward goal achievement.", es: "Describir los pasos para fijar metas y trabajar hacia su logro." },
            "3": { c: "1C.3a", en: "Set a short-term goal and make a plan for achieving it.", es: "Fijar una meta a corto plazo y elaborar un plan para alcanzarla." },
            "4": { c: "1C.4b", en: "Apply strategies to overcome obstacles to goal achievement.", es: "Aplicar estrategias para superar obstáculos en el logro de metas." },
            "5": { c: "1C.5b", en: "Monitor progress toward achieving a goal, and evaluate one's performance against criteria.", es: "Monitorear el progreso hacia una meta y evaluar el propio desempeño según criterios." } } },
          "2A": { goal: "2", name: { en: "Recognize the feelings and perspectives of others.", es: "Reconocer los sentimientos y las perspectivas de los demás." }, b: {
            "1": { c: "2A.1a", en: "Recognize that others may experience situations differently from oneself.", es: "Reconocer que los demás pueden vivir las situaciones de manera diferente a uno mismo." },
            "2": { c: "2A.2a", en: "Identify verbal, physical, and situational cues that indicate how others may feel.", es: "Identificar señales verbales, físicas y situacionales que indican cómo pueden sentirse los demás." },
            "3": { c: "2A.3a", en: "Predict others' feelings and perspectives in a variety of situations.", es: "Predecir los sentimientos y las perspectivas de los demás en diversas situaciones." },
            "4": { c: "2A.4a", en: "Analyze similarities and differences between one's own and others' perspectives.", es: "Analizar las semejanzas y diferencias entre la propia perspectiva y la de los demás." },
            "5": { c: "2A.5b", en: "Demonstrate ways to express empathy for others.", es: "Demostrar formas de expresar empatía hacia los demás." } } },
          "2B": { goal: "2", name: { en: "Recognize individual and group similarities and differences.", es: "Reconocer las semejanzas y diferencias individuales y de grupo." }, b: {
            "1": { c: "2B.1a", en: "Describe the ways that people are similar and different.", es: "Describir las formas en que las personas son semejantes y diferentes." },
            "2": { c: "2B.2a", en: "Identify differences among and contributions of various social and cultural groups.", es: "Identificar las diferencias y los aportes de diversos grupos sociales y culturales." },
            "3": { c: "2B.3b", en: "Analyze the effects of taking action to oppose bullying based on individual and group differences.", es: "Analizar los efectos de actuar para oponerse al acoso basado en diferencias individuales y de grupo." },
            "4": { c: "2B.4b", en: "Demonstrate respect for individuals from different social and cultural groups.", es: "Demostrar respeto por personas de distintos grupos sociales y culturales." },
            "5": { c: "2B.5a", en: "Evaluate strategies for being respectful of others and opposing stereotyping and prejudice.", es: "Evaluar estrategias para respetar a los demás y oponerse a los estereotipos y prejuicios." } } },
          "2C": { goal: "2", name: { en: "Use communication and social skills to interact effectively with others.", es: "Usar la comunicación y las habilidades sociales para interactuar eficazmente con los demás." }, b: {
            "1": { c: "2C.1a", en: "Identify ways to work and play well with others.", es: "Identificar formas de trabajar y jugar bien con los demás." },
            "2": { c: "2C.2a", en: "Describe approaches for making and keeping friends.", es: "Describir maneras de hacer y conservar amistades." },
            "3": { c: "2C.3a", en: "Analyze ways to establish positive relationships with others.", es: "Analizar formas de establecer relaciones positivas con los demás." },
            "4": { c: "2C.4a", en: "Evaluate the effects of requesting support from and providing support to others.", es: "Evaluar los efectos de pedir apoyo a los demás y de brindarles apoyo." },
            "5": { c: "2C.5a", en: "Evaluate the application of communication and social skills in daily interactions with peers, teachers, and families.", es: "Evaluar la aplicación de la comunicación y las habilidades sociales en las interacciones diarias con compañeros, maestros y familias." } } },
          "2D": { goal: "2", name: { en: "Demonstrate an ability to prevent, manage, and resolve interpersonal conflicts in constructive ways.", es: "Demostrar la capacidad de prevenir, manejar y resolver conflictos interpersonales de manera constructiva." }, b: {
            "1": { c: "2D.1b", en: "Identify approaches to resolving conflicts constructively.", es: "Identificar enfoques para resolver conflictos de manera constructiva." },
            "2": { c: "2D.2b", en: "Apply constructive approaches in resolving conflicts.", es: "Aplicar enfoques constructivos en la resolución de conflictos." },
            "3": { c: "2D.3a", en: "Evaluate strategies for preventing and resolving interpersonal problems.", es: "Evaluar estrategias para prevenir y resolver problemas interpersonales." },
            "4": { c: "2D.4a", en: "Analyze how listening and talking accurately help in resolving conflicts.", es: "Analizar cómo escuchar y hablar con precisión ayuda a resolver conflictos." },
            "5": { c: "2D.5a", en: "Evaluate the effects of using negotiation skills to reach win-win solutions.", es: "Evaluar los efectos de usar habilidades de negociación para lograr soluciones en las que todos ganan." } } },
          "3A": { goal: "3", name: { en: "Consider ethical, safety, and societal factors in making decisions.", es: "Considerar factores éticos, de seguridad y sociales al tomar decisiones." }, b: {
            "1": { c: "3A.1b", en: "Identify social norms and safety considerations that guide behavior.", es: "Identificar las normas sociales y las consideraciones de seguridad que guían la conducta." },
            "2": { c: "3A.2a", en: "Demonstrate the ability to respect the rights of self and others.", es: "Demostrar la capacidad de respetar los derechos propios y de los demás." },
            "3": { c: "3A.3a", en: "Evaluate how honesty, respect, fairness, and compassion enable one to take the needs of others into account when making decisions.", es: "Evaluar cómo la honestidad, el respeto, la justicia y la compasión permiten tener en cuenta las necesidades de los demás al tomar decisiones." },
            "4": { c: "3A.4a", en: "Demonstrate personal responsibility in making ethical decisions.", es: "Demostrar responsabilidad personal al tomar decisiones éticas." },
            "5": { c: "3A.5a", en: "Apply ethical reasoning to evaluate societal practices.", es: "Aplicar el razonamiento ético para evaluar las prácticas sociales." } } },
          "3B": { goal: "3", name: { en: "Apply decision-making skills to deal responsibly with daily academic and social situations.", es: "Aplicar habilidades de toma de decisiones para actuar responsablemente en situaciones académicas y sociales cotidianas." }, b: {
            "1": { c: "3B.1b", en: "Make positive choices when interacting with classmates.", es: "Tomar decisiones positivas al interactuar con los compañeros." },
            "2": { c: "3B.2a", en: "Identify and apply the steps of systematic decision making.", es: "Identificar y aplicar los pasos de la toma de decisiones sistemática." },
            "3": { c: "3B.3b", en: "Evaluate strategies for resisting pressures to engage in unsafe or unethical activities.", es: "Evaluar estrategias para resistir la presión de participar en actividades inseguras o poco éticas." },
            "4": { c: "3B.4b", en: "Apply decision-making skills to establish responsible social and work group relationships.", es: "Aplicar habilidades de toma de decisiones para establecer relaciones sociales y de trabajo responsables." },
            "5": { c: "3B.5b", en: "Evaluate how responsible decision making affects interpersonal and group relationships.", es: "Evaluar cómo la toma de decisiones responsable afecta las relaciones interpersonales y de grupo." } } },
          "3C": { goal: "3", name: { en: "Contribute to the well-being of one's school and community.", es: "Contribuir al bienestar de la propia escuela y comunidad." }, b: {
            "1": { c: "3C.1a", en: "Identify and perform roles that contribute to one's classroom.", es: "Identificar y desempeñar roles que contribuyen al propio salón de clases." },
            "2": { c: "3C.2a", en: "Identify and perform roles that contribute to the school community.", es: "Identificar y desempeñar roles que contribuyen a la comunidad escolar." },
            "3": { c: "3C.3a", en: "Evaluate one's participation in efforts to address an identified school need.", es: "Evaluar la propia participación en esfuerzos para atender una necesidad escolar identificada." },
            "4": { c: "3C.4a", en: "Plan, implement, and evaluate one's participation in activities and organizations that improve school climate.", es: "Planificar, implementar y evaluar la propia participación en actividades y organizaciones que mejoran el clima escolar." },
            "5": { c: "3C.5a", en: "Work cooperatively with others to plan, implement, and evaluate a project to meet an identified school need.", es: "Trabajar en cooperación con otros para planificar, implementar y evaluar un proyecto que atienda una necesidad escolar identificada." } } }
        };
        var IL_SEL_ORDER = ["1A", "1B", "1C", "2A", "2B", "2C", "2D", "3A", "3B", "3C"];
        /* COMP_SEL (each competency's default SEL standard) is derived from the
           competency registry above — set "sel" on a competency to change it. */
        /* Frameworks layer — only SEL today; add ELA/Math/etc. here later. */
        var IL_FRAMEWORKS = { sel: { label: { en: "Social/Emotional Learning (SEL)", es: "Aprendizaje socioemocional (SEL)" }, goals: IL_SEL_GOALS, standards: IL_SEL, order: IL_SEL_ORDER } };
        /* Resolve the currently selected standard + grade-appropriate benchmark. */
        function ilSelected() {
          var code = val("aoggStd") || COMP_SEL[val("aoggComp")] || "1A";
          var std = IL_SEL[code]; if (!std) { code = COMP_SEL[val("aoggComp")] || "1A"; std = IL_SEL[code]; }
          var stage = ilStage(val("aoggGrade").trim());
          var bench = stage && std.b[stage] ? std.b[stage] : null;
          return { code: code, goal: std.goal, name: std.name[GLANG], goalText: IL_SEL_GOALS[std.goal][GLANG], stage: stage, benchCode: bench ? bench.c : "", benchText: bench ? bench[GLANG] : "" };
        }
        /* Build the alignment lines injected into each goal output. */
        function ilAlignLines() {
          var es = GLANG === "es"; var s = ilSelected(); var L = [];
          L.push((es ? "Alineación con los Estándares de Aprendizaje SEL de Illinois" : "Illinois SEL Learning Standards Alignment") + ":");
          L.push((es ? "Meta " : "Goal ") + s.goal + ": " + s.goalText);
          L.push((es ? "Estándar " : "Standard ") + s.code + ": " + s.name);
          if (s.benchCode) {
            L.push((es ? "Indicador por etapa (" : "Stage benchmark (") + (IL_STAGE_LABEL[s.stage] ? IL_STAGE_LABEL[s.stage][GLANG] : "") + "): " + s.benchCode + " — " + s.benchText);
          } else {
            L.push(es ? "Indicador por etapa: añade un grado para el indicador específico." : "Stage benchmark: add a grade for the stage-specific benchmark.");
          }
          return L;
        }
        /* Populate / sync the framework + standard dropdowns. */
        window.aogGoalStdSync = function (resetToComp) {
          var fw = document.getElementById("aoggFw");
          var sel = document.getElementById("aoggStd"); if (!sel) return;
          var keep = (!resetToComp && sel.value) ? sel.value : (COMP_SEL[val("aoggComp")] || "1A");
          var html = "";
          IL_SEL_ORDER.forEach(function (code) {
            html += '<option value="' + code + '">' + code + ' · ' + esc(IL_SEL[code].name[GLANG]) + '</option>';
          });
          sel.innerHTML = html; sel.value = keep;
          if (fw && !fw.options.length) {
            var f = ""; Object.keys(IL_FRAMEWORKS).forEach(function (k) { f += '<option value="' + k + '">' + esc(IL_FRAMEWORKS[k].label[GLANG]) + '</option>'; });
            fw.innerHTML = f; fw.value = "sel";
          }
        };
        /* Grade-band helper text for the competency dropdown — same Pause·Coach Voice·Repair
           vocabulary as the Daily Log, worded for the entered grade band. */
        var GB_BAND_LABEL = { k2: "K–2", "35": "3–5", "68": "6–8", "910": "9–10", "1112": "11–12", adult: "Adult" };
        function gbBand(g) { g = (g || "").toString().trim().toLowerCase().replace(/grade|gr\.?/g, "").trim();
          if (g.indexOf("adult") >= 0) return "adult";
          if (g === "k" || g === "kg" || g === "kinder") return "k2";
          var n = parseInt(g, 10); if (!isNaN(n)) { if (n <= 2) return "k2"; if (n <= 5) return "35"; if (n <= 8) return "68"; if (n <= 10) return "910"; return "1112"; }
          return ""; }
        var GB_HINT = {
          pause: { k2:{en:"noticing a big feeling and using a Pause to find calm",es:"notar una emoción grande y usar una Pausa para calmarse"}, "35":{en:"using the Pause to settle before reacting",es:"usar la Pausa para calmarse antes de reaccionar"}, "68":{en:"catching a strong feeling and choosing a reset",es:"notar una emoción fuerte y elegir una estrategia de calma"}, "910":{en:"regulating with a Pause or a brief Release",es:"regularse con una Pausa o un breve Soltar"}, "1112":{en:"naming the feeling and self-regulating before responding",es:"nombrar la emoción y autorregularse antes de responder"}, adult:{en:"pausing to regulate before reacting under stress",es:"pausar para regularse antes de reaccionar bajo estrés"} },
          charitable: { k2:{en:"thinking “maybe it was an accident” before getting upset",es:"pensar “quizás fue un accidente” antes de enojarse"}, "35":{en:"giving a friend the benefit of the doubt",es:"dar a un amigo el beneficio de la duda"}, "68":{en:"reading an unclear moment kindly instead of as an attack",es:"interpretar un momento confuso con amabilidad, no como un ataque"}, "910":{en:"checking intent before reacting to a slight",es:"verificar la intención antes de reaccionar a un desaire"}, "1112":{en:"assuming good faith and checking the story before judging",es:"asumir buena fe y verificar la historia antes de juzgar"}, adult:{en:"extending the benefit of the doubt before concluding",es:"ofrecer el beneficio de la duda antes de concluir"} },
          coach: { k2:{en:"using a kind coach voice, not a mean one, after a mistake",es:"usar una voz de entrenador amable, no dura, tras un error"}, "35":{en:"talking to themselves like a coach, not a critic",es:"hablarse como un entrenador, no como un crítico"}, "68":{en:"answering the inner critic with a kinder coach voice",es:"responder al crítico interior con una voz de entrenador más amable"}, "910":{en:"meeting a setback with self-compassion",es:"enfrentar un revés con autocompasión"}, "1112":{en:"separating a mistake from self-worth and re-engaging",es:"separar el error del valor propio y volver a intentarlo"}, adult:{en:"responding to a misstep with self-compassion, not self-criticism",es:"responder a un error con autocompasión, no con autocrítica"} },
          repair: { k2:{en:"saying sorry and making it right with a friend",es:"pedir perdón y reparar con un amigo"}, "35":{en:"making a Repair Move after a bump",es:"hacer un Acto de Reparación tras un roce"}, "68":{en:"owning impact and offering a repair after conflict",es:"reconocer el impacto y ofrecer una reparación tras un conflicto"}, "910":{en:"moving toward repair instead of avoidance",es:"avanzar hacia la reparación en lugar de evitar"}, "1112":{en:"naming impact and re-entering the relationship after rupture",es:"reconocer el impacto y volver a la relación tras la ruptura"}, adult:{en:"owning impact and offering a genuine repair",es:"reconocer el impacto y ofrecer una reparación genuina"} },
          release: { k2:{en:"letting go of a little upset and moving on",es:"soltar un pequeño disgusto y seguir adelante"}, "35":{en:"letting go of what they can’t control",es:"soltar lo que no pueden controlar"}, "68":{en:"releasing a grudge or setting a small boundary",es:"soltar un rencor o poner un pequeño límite"}, "910":{en:"letting go or setting a healthy boundary",es:"soltar o poner un límite saludable"}, "1112":{en:"releasing rumination and holding a clear boundary",es:"soltar la rumiación y mantener un límite claro"}, adult:{en:"releasing what isn’t theirs to carry and setting boundaries",es:"soltar lo que no les corresponde cargar y poner límites"} }
        };
        window.aogGoalCompHint = function () {
          var host = document.getElementById("aoggCompHint"); if (!host) return;
          var comp = val("aoggComp"); var c = COMPS[comp]; if (!c) { host.innerHTML = ""; return; }
          var es = (GLANG === "es"); var grade = val("aoggGrade").trim(); var dom = c.domain[GLANG];
          var domTag = ' <span style="color:var(--ink-faint,#8A92A6);font-weight:600;">· ' + esc(dom) + '</span>';
          var band = grade ? gbBand(grade) : "";
          if (band && GB_HINT[comp] && GB_HINT[comp][band]) {
            host.innerHTML = '<span style="display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.04em;color:var(--gold-deep,#9a6f24);background:rgba(217,163,59,.16);border-radius:999px;padding:1px 8px;margin-right:6px;vertical-align:middle;">' + esc(GB_BAND_LABEL[band] || "") + '</span>' + esc((es ? "A esta edad: " : "At this band: ") + GB_HINT[comp][band][GLANG]) + domTag;
          } else {
            host.innerHTML = esc((es ? "Significa: " : "Means: ") + c.core[GLANG]) + domTag + ' <span style="color:var(--ink-faint,#8A92A6);font-style:italic;">' + esc(es ? "(añade un grado para texto por edad)" : "(add a grade for age-specific wording)") + '</span>';
          }
        };
        function build() { var tx = STYLE === "condensed" ? buildCondensed() : STYLE === "family" ? buildFamily() : buildNarrative(); if (!tx) return tx; var al = ""; try { al = alignSentence(); } catch (e) {} return al ? (tx + "\n\n" + al) : tx; }
        /* HOME (the warm "at home" tip per competency) is derived from the
           competency registry above — edit a competency's "home" to change it. */
        /* Family style has its own gentle, collaborative voice (it does not
           reuse the Narrative/Condensed frames), and keeps the standards
           reference to a single soft footer rather than in the body. */
        function buildFamily() {
          var t = T[GLANG]; var c = COMPS[val("aoggComp")]; if (!c) return "";
          var p = PARTS[val("aoggComp")];
          var code = val("aoggCode").trim(), grade = val("aoggGrade").trim(); var es = GLANG === "es";
          var who = code || (es ? "tu hijo/a" : "your child");
          var bi = parseInt(val("aoggBand"), 10) || 0; var L_ = es ? "es" : "en";
          var move = p ? p.move[L_] : c.core[GLANG];
          var home = HOME[val("aoggComp")] ? HOME[val("aoggComp")][GLANG] : "";
          var L = [];
          L.push((es ? "UNA META QUE CRECEMOS JUNTOS — " : "A GOAL WE’RE GROWING TOGETHER — ") + c.name[GLANG]);
          L.push((es ? "Para: " : "For: ") + who + (grade ? ("   " + t.grade + ": " + grade) : ""));
          L.push("");
          /* Warm, band-aware opening. */
          var open;
          if (es) {
            open = bi === 0 ? ("Ahora mismo, " + who + " apenas comienza a aprender a " + move + ". Y ahí justo empezamos — este año lo practicaremos juntos, con calma, para que los momentos difíciles sean un poco más fáciles.")
              : bi === 2 ? (who + " ya lo hace muy bien. Así que este año se trata de mantenerlo firme y, poco a poco, ayudar a sus amigos a aprender a " + move + " también — para que todo el salón se sienta un poco más amable.")
              : ("Este año acompañamos a " + who + " mientras aprende a " + move + ", para que los momentos difíciles sean un poco más fáciles y la conexión se mantenga fuerte.");
          } else {
            open = bi === 0 ? ("Right now, " + who + " is just beginning to learn to " + move + ". That’s exactly where we start — this year we’ll practice it together, gently, so the hard moments get a little easier.")
              : bi === 2 ? (who + " already does this well. So this year is about keeping it steady and, little by little, helping friends learn to " + move + " too — so the whole classroom feels a bit kinder.")
              : ("This year we’re walking alongside " + who + " as they learn to " + move + ", so the hard moments get a little easier and the people around them stay close.");
          }
          L.push(open);
          L.push("");
          L.push(es ? "Lo que esperamos ver más seguido:" : "What we’re hoping to see more of:");
          c.ms[GLANG].forEach(function (m) { L.push("  • " + m); });
          L.push("");
          L.push(es ? "Cómo sabremos que va bien:" : "How we’ll know it’s going well:");
          L.push(es ? ("Haremos algunos registros juntos durante el año y simplemente notaremos que esto sucede más seguido. Se trata de crecimiento y conexión, a su propio ritmo.") : ("We’ll check in together a few times during the year and simply notice this happening more often. It’s about growth and connection, at " + who + "’s own pace."));
          if (home) { L.push(""); L.push(es ? "En casa, pueden ayudar:" : "At home, you can help by:"); L.push("  " + home); }
          L.push("");
          L.push(es ? "Con cariño, su equipo escolar — y ustedes." : "With care, your school team — and you.");
          /* Soft footer: standards reference, demoted and code-free. */
          var sAl = ilSelected();
          L.push("");
          L.push("— " + (es ? ("Alineada con los estándares de aprendizaje SEL de Illinois (Meta " + sAl.goal + ").") : ("Aligned with the Illinois SEL learning standards (Goal " + sAl.goal + ").")));
          return L.join("\n");
        }
        function buildCondensed() {
          var t = T[GLANG]; var c = COMPS[val("aoggComp")]; if (!c) return "";
          var bi = parseInt(val("aoggBand"), 10) || 0; var n = parseInt(val("aoggPeriods"), 10) || 4;
          var code = val("aoggCode").trim(), grade = val("aoggGrade").trim();
          var who = code || (GLANG === "es" ? "[Estudiante]" : "[Student]");
          var dom = c.domain[GLANG]; var band = t.bands[bi]; var nb = t.bands[Math.min(bi + 1, 2)];
          var targetDisp = (bi === 2) ? t.targetHi : nb;
          var labs = t.periods(n); var letters = "ABCDEFGH"; var es = GLANG === "es";
          var L = [];
          L.push(t.header + " — " + c.name[GLANG] + " · " + (es ? "Funcional" : "Functional"));
          L.push(t.student + ": " + (code || "________") + "   " + t.grade + ": " + (grade || "__") + "   " + t.current + ": " + band + " → " + targetDisp);
          L.push("");
          L.push((es ? "Meta anual: " : "Annual goal: ") + composeGoal(val("aoggComp"), bi, who));
          L.push("");
          L.push(es ? "Objetivos:" : "Objectives:");
          labs.forEach(function (p, i) { var rung = rungFor(t, bi, i, n); L.push(letters[i] + ". " + p + ": " + who + (es ? " " : " will ") + c.core[GLANG] + " " + rung + ". (" + (es ? "Observación" : "Observation") + "; " + band + "→" + targetDisp + ")"); });
          L.push("");
          L.push((bi === 2 ? (es ? "Medida: demostración sostenida en los registros (" : "Measure: sustained demonstration across check-in windows (") : (es ? "Medida: crecimiento en los registros (" : "Measure: growth across check-in windows (")) + band + "→" + targetDisp + ") " + (es ? "más los indicadores relacionales, observados por un adulto de confianza — no un conteo de déficits." : "plus the relational indicators, observed by a trusted adult — not a deficit count."));
          L.push((es ? "Indicadores: " : "Indicators: ") + c.ms[GLANG].join("; "));
          var sAl = ilSelected();
          L.push((es ? "Estándar SEL de Illinois: " : "Illinois SEL standard: ") + (es ? "Meta " : "Goal ") + sAl.goal + " · " + sAl.code + " — " + sAl.name + (sAl.benchCode ? (" · " + sAl.benchCode + " " + sAl.benchText) : ""));
          L.push((es ? "Apoyos: " : "Supports: ") + aoggSupports(c));
          return L.join("\n");
        }
        function buildNarrative() {
          var t = T[GLANG]; var c = COMPS[val("aoggComp")]; if (!c) return "";
          var bi = parseInt(val("aoggBand"), 10) || 0; var n = parseInt(val("aoggPeriods"), 10) || 4;
          var code = val("aoggCode").trim(), grade = val("aoggGrade").trim();
          var who = code || (GLANG === "es" ? "[Estudiante]" : "[Student]");
          var dom = c.domain[GLANG]; var band = t.bands[bi]; var ni = Math.min(bi + 1, 2); var nb = t.bands[ni];
          var targetDisp = (bi === 2) ? t.targetHi : nb;
          var goal = composeGoal(val("aoggComp"), bi, who);
          var labs = t.periods(n); var letters = "ABCDEFGH";
          var L = [];
          L.push(t.header + " — " + c.name[GLANG] + " (" + dom + ")");
          L.push(t.area);
          L.push(t.student + ": " + (code || "__________") + "   " + t.grade + ": " + (grade || "____") + "   " + t.date + ": __________   " + t.current + ": " + band + "   " + t.target + ": " + targetDisp);
          L.push("");
          L.push(t.present + ":"); L.push(t.presentTxt(band, dom, bi));
          L.push("");
          L.push(t.goalStmt + ":"); L.push(goal);
          L.push("");
          L.push(t.scoring + ":"); L.push(t.scoringTxt(band, nb, dom, bi));
          L.push("");
          ilAlignLines().forEach(function (x) { L.push(x); });
          L.push("");
          L.push(t.bench + ":");
          labs.forEach(function (p, i) {
            var rung = rungFor(t, bi, i, n);
            var prog = (i === n - 1) ? t.progLast(nb, bi) : t.progMid(nb, bi);
            L.push(letters[i] + ". (" + p + ") " + t.obj(p, who, c.core[GLANG], rung, prog, dom));
            L.push("   " + t.evalProc + "   ·   " + t.schedule + ": " + p);
          });
          L.push("");
          L.push(t.ee + ":");
          c.ms[GLANG].forEach(function (m) { L.push("  • " + m); });
          L.push("");
          L.push(t.supports + ": " + aoggSupports(c));
          L.push("");
          L.push(t.foot);
          return L.join("\n");
        }
        /* ---- School & district alignment (optional, generic + editable) ---- */
        var VKEY = "aog.goals.values";
        var VDEF = {
          en: ["A safe, welcoming and inspiring environment", "Engaging, relevant and rigorous instruction", "Diversity, equity, inclusion and access", "Strong family and community relationships", "Innovative and empathetic staff"],
          es: ["Un entorno seguro, acogedor e inspirador", "Instrucci\u00f3n atractiva, relevante y rigurosa", "Diversidad, equidad, inclusi\u00f3n y acceso", "Relaciones s\u00f3lidas con las familias y la comunidad", "Personal innovador y emp\u00e1tico"]
        };
        function vLoad() { try { var v = JSON.parse(localStorage.getItem(VKEY) || "null"); if (v && Array.isArray(v.en) && Array.isArray(v.es) && v.en.length && v.es.length) return v; } catch (e) {} return { en: VDEF.en.slice(), es: VDEF.es.slice() }; }
        function vSave(v) { try { localStorage.setItem(VKEY, JSON.stringify(v)); } catch (e) {} }
        var PBIS_T = { en: { none: "None", respectful: "Respectful", responsible: "Responsible", safe: "Safe" }, es: { none: "Ninguna", respectful: "Respetuoso", responsible: "Responsable", safe: "Seguro" } };
        window.aogGoalAlignPopulate = function () {
          var es = GLANG === "es"; var tt = PBIS_T[GLANG];
          var ps = document.getElementById("aoggPbis");
          if (ps) { var cur = ps.value; ps.innerHTML = '<option value="">' + tt.none + '</option><option value="respectful">' + tt.respectful + '</option><option value="responsible">' + tt.responsible + '</option><option value="safe">' + tt.safe + '</option>'; if (cur) ps.value = cur; }
          var vs = document.getElementById("aoggValue");
          if (vs) { var cv = vs.value; var list = vLoad()[GLANG] || []; var o = '<option value="">' + (es ? "Ninguno" : "None") + '</option>'; list.forEach(function (v, i) { o += '<option value="' + i + '">' + esc(v) + '</option>'; }); vs.innerHTML = o; if (cv !== "" && list[+cv] != null) vs.value = cv; }
        };
        window.aogGoalValuesEdit = function () {
          var es = GLANG === "es"; var v = vLoad();
          var msg = es ? "Edita la lista de valores del distrito (uno por l\u00ednea). Es una lista gen\u00e9rica y editable \u2014 usa la redacci\u00f3n de tu propio distrito." : "Edit the district values list (one per line). It is a generic, editable list \u2014 use your own district's wording.";
          var txt = window.prompt(msg, (v[GLANG] || []).join("\n"));
          if (txt == null) return;
          var arr = txt.split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
          if (!arr.length) arr = VDEF[GLANG].slice();
          v[GLANG] = arr; vSave(v);
          window.aogGoalAlignPopulate(); if (window.aogGoalRegen) aogGoalRegen();
        };
        function alignSentence() {
          var es = GLANG === "es";
          var ps = document.getElementById("aoggPbis"); var vs = document.getElementById("aoggValue");
          var pk = ps ? ps.value : ""; var vi = (vs && vs.value !== "") ? parseInt(vs.value, 10) : -1;
          var pw = pk ? (PBIS_T[GLANG][pk] || "") : "";
          var vl = vLoad(); var vw = "";
          if (vi >= 0) { vw = (vl[GLANG] && vl[GLANG][vi] != null) ? vl[GLANG][vi] : ((vl[es ? "en" : "es"] || [])[vi] || ""); }
          if (!pw && !vw) return "";
          if (pw && vw) return es ? ("Esta meta apoya la expectativa escolar de ser " + pw + " y avanza el compromiso del distrito con " + vw + ".") : ("This goal supports the school-wide expectation of being " + pw + " and advances the district's commitment to " + vw + ".");
          if (pw) return es ? ("Esta meta apoya la expectativa escolar de ser " + pw + ".") : ("This goal supports the school-wide expectation of being " + pw + ".");
          return es ? ("Esta meta avanza el compromiso del distrito con " + vw + ".") : ("This goal advances the district's commitment to " + vw + ".");
        }
        window.aogGoalRegen = function () { var o = document.getElementById("aoggOut"); if (o && !o.hidden) window.aogGoalGen(); };
        window.aogGoalLang = function (l) { GLANG = l; var b = document.querySelectorAll("#panel-goals .aogg-lang button"); Array.prototype.forEach.call(b, function (x) { x.classList.toggle("on", x.getAttribute("data-l") === l); }); if (typeof aogGoalPopulate === "function") aogGoalPopulate(); try { window.aogGoalAlignPopulate && aogGoalAlignPopulate(); } catch (e) {} try { window.aogGoalStdSync && window.aogGoalStdSync(false); } catch (e) {} try { window.aogGoalCompHint && window.aogGoalCompHint(); } catch (e) {} var o = document.getElementById("aoggOut"); if (o && !o.hidden) window.aogGoalGen(); };
        window.aogGoalStyle = function (s) { STYLE = s; var b = document.querySelectorAll("#panel-goals .aogg-seg button"); Array.prototype.forEach.call(b, function (x) { x.classList.toggle("on", x.getAttribute("data-s") === s); }); var o = document.getElementById("aoggOut"); if (o && !o.hidden) window.aogGoalGen(); };
        function recIdx(v) { return v >= 75 ? 2 : v >= 50 ? 1 : 0; }
        function lowestComp(r) { var a = +r.normA || 0, b = +r.normB || 0, cc = +r.normC || 0; var m = Math.min(a, b, cc); return a === m ? "pause" : (b === m ? "coach" : "repair"); }
        window.aogGoalPopulate = function () {
          var sel = document.getElementById("aoggStudent"); if (!sel) return;
          var recs = []; try { recs = (window.getAllRecords ? getAllRecords() : []) || []; } catch (e) {}
          var by = {};
          recs.forEach(function (r) { if (!r || r.normComposite == null) return; var id = (r.studentId == null ? "" : String(r.studentId)).trim(); if (!id) return; if (!by[id] || new Date(r.timestamp) > new Date(by[id].timestamp)) by[id] = r; });
          var ids = Object.keys(by).sort(function (a, b) { return a.localeCompare(b); });
          var cur = sel.value;
          var opts = '<option value="">' + (GLANG === "es" ? "— elegir —" : "— choose —") + "</option>";
          ids.forEach(function (id) { opts += '<option value="' + esc(id) + '">' + esc(id) + "</option>"; });
          sel.innerHTML = opts; window.__aoggRecs = by;
          /* Student-in-focus (audit P1): default to the student just opened
             elsewhere — if they have a saved check-in here. Same freshness
             rule as every door: the focus wins only over an older quiet
             default or nothing; a REAL pick (stamped by aogGoalFromRecord)
             holds until a newer focus exists. Quiet prefill only — fields
             fill exactly as a manual pick would fill them, but nothing
             generates until the teacher asks. */
          var fcG = null; try { fcG = window.AOGFocus ? AOGFocus.get() : null; } catch (eF) {}
          var adopt = !!(fcG && by[fcG.code] && fcG.code !== cur && fcG.at > (+(sel.dataset.aogPickedAt || 0)));
          if (adopt) { try { window.aogGoalFromRecord(fcG.code, true); } catch (eG) { adopt = false; } }
          if (!adopt && cur && by[cur]) sel.value = cur;
          try { window.aogGoalCompHint && window.aogGoalCompHint(); } catch (e) {}
        };
        window.aogGoalFromRecord = function (id, quiet) {
          var by = window.__aoggRecs || {}; var r = by[id]; if (!r) return;
          function set(fid, v) { var e = document.getElementById(fid); if (e != null && v != null) e.value = v; }
          set("aoggStudent", id);
          set("aoggCode", r.studentId); set("aoggGrade", r.grade || "");
          set("aoggBand", String(recIdx(+r.normComposite || 0))); set("aoggComp", lowestComp(r));
          try { window.aogGoalCompHint && window.aogGoalCompHint(); } catch (e) {}
          /* `quiet` prefills the fields without generating — the student-in-
             focus default uses it, because a goal that writes itself on tab
             open is an opinion, and pressing Generate stays the teacher's act.
             A real pick stamps pickedAt (so no later focus can wrestle it) and
             is itself an act of attention, so it also writes the focus. */
          if (!quiet) {
            try { var sEl = document.getElementById("aoggStudent"); if (sEl) sEl.dataset.aogPickedAt = String(Date.now()); } catch (eP) {}
            try { if (window.AOGFocus) AOGFocus.set(id, "goals"); } catch (eF2) {}
            window.aogGoalGen();
          }
        };
        window.aogGoalGen = function () {
          var text = build(); if (!text) return; window.__aoggText = text;
          var out = document.getElementById("aoggOut");
          out.innerHTML = '<div class="aogg-card"><div class="aogg-acts"><button class="aogg-copy" id="aoggCopy" type="button" aria-label="Copy goal and objectives to clipboard" onclick="aogGoalCopy()">' + (GLANG === "es" ? "Copiar" : "Copy") + '</button><button class="aogg-print" type="button" aria-label="Open a print-friendly goal page" onclick="aogGoalPrint()">' + (GLANG === "es" ? "Imprimir" : "Print") + '</button></div><pre class="aogg-pre">' + esc(text) + '</pre></div>';
          out.hidden = false;
          if (typeof window.renderProgress === "function") window.renderProgress();
        };
        window.aogGoalCopy = function () {
          var tx = window.__aoggText || ""; var btn = document.getElementById("aoggCopy");
          function done() { if (btn) { var o = btn.textContent; btn.textContent = (GLANG === "es" ? "¡Copiado!" : "Copied!"); btn.classList.add("copied"); setTimeout(function () { btn.textContent = o; btn.classList.remove("copied"); }, 1600); } }
          if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(tx).then(done, function () { window.prompt("Copy:", tx); }); } else { window.prompt("Copy:", tx); }
        };
        window.aogGoalPrint = function () {
          var tx = window.__aoggText || ""; if (!tx) return;
          var title = (GLANG === "es" ? "Meta y objetivos" : "Goal & objectives");
          var doc = '<!doctype html><html><head><meta charset="utf-8"><title>' + title + '</title><style>*{-webkit-print-color-adjust:exact;print-color-adjust:exact;}body{font-family:-apple-system,Segoe UI,Inter,system-ui,sans-serif;color:#0A1E33;margin:36px;max-width:720px;}.bh{display:flex;align-items:center;gap:12px;border-bottom:3px solid #D9A33B;padding-bottom:12px;margin:0 0 16px;}.mk{width:40px;height:40px;border-radius:8px;background:#D9A33B;color:#0A1E33;font-family:Georgia,serif;font-weight:700;font-size:24px;display:flex;align-items:center;justify-content:center;}.wm{font-family:Georgia,serif;font-size:18px;font-weight:700;}.sb{font-size:12px;color:#46506E;}pre{white-space:pre-wrap;word-break:break-word;font-family:inherit;font-size:13px;line-height:1.6;}.ft{margin-top:18px;border-top:1px solid #E4DAC5;padding-top:8px;font-size:10.5px;color:#8A92A6;}@media print{body{margin:.5in;} .np{display:none;}}</style></head><body><div class="bh"><span class="mk">A</span><div><div class="wm">Architecture of Grace</div><div class="sb">' + title + '</div></div></div><pre>' + esc(tx) + '</pre>' + (window.__aogProgSvg ? ('<h3 style="font-family:Georgia,serif;font-size:15px;margin:20px 0 6px;color:#0A1E33;">' + (GLANG === "es" ? "Monitoreo de progreso" : "Progress monitoring") + '</h3>' + window.__aogProgSvg + '<pre>' + esc(window.__aogProgText || "") + '</pre>') : '') + '<div class="ft">' + (GLANG === "es" ? "Centrado en la relación · Una guía para el crecimiento, no un diagnóstico ni un conteo." : "Relationship-centered · A guide for growth, not a diagnosis or a count.") + '</div><p class="np"><button onclick="window.print()" style="font:inherit;font-weight:700;background:#0A1E33;color:#fff;border:0;border-radius:8px;padding:9px 18px;cursor:pointer;">' + (GLANG === "es" ? "Imprimir" : "Print") + '</button></p></body></html>';
          var w = window.open("", "_blank"); if (!w) { alert(GLANG === "es" ? "Permite las ventanas emergentes para imprimir." : "Please allow pop-ups to print."); return; }
          w.document.open(); w.document.write(doc); w.document.close(); w.focus(); try { w.print(); } catch (e) {}
        };
        var DK = { pause: "A", release: "A", coach: "B", charitable: "C", repair: "C" };
        function tColor(v) { return v >= 75 ? "#2E6B3A" : v >= 50 ? "#8A6D1F" : "#8B2A2A"; }
        function tName(v) { var t = T[GLANG]; return v >= 75 ? t.bands[2] : v >= 50 ? t.bands[1] : t.bands[0]; }
        function progYear(r) {
          var d = new Date(r.timestamp || Date.now()); if (isNaN(d.getTime())) d = new Date();
          var y = d.getFullYear(), m = d.getMonth();
          var sx = { Fall: 0, Winter: 1, Spring: 2, Summer: 3 }[(r.window || "").toString().trim()];
          if (sx == null) sx = (m >= 7 ? 0 : m <= 1 ? 1 : m <= 4 ? 2 : 3);
          var sy = (m >= 7) ? y : y - 1; var ly = (sx === 0) ? sy : sy + 1;
          var ab = { 0: "F", 1: "W", 2: "Sp", 3: "Su" }[sx];
          return { sort: sy * 10 + sx, label: ab + "'" + ("0" + (ly % 100)).slice(-2) };
        }
        function progRows(id) {
          var recs = []; try { recs = (window.getAllRecords ? getAllRecords() : []) || []; } catch (e) {}
          var rows = recs.filter(function (r) { return r && String(r.studentId == null ? "" : r.studentId).trim() === id && r.normComposite != null; })
            .map(function (r) { var k = progYear(r); return { label: k.label, sort: k.sort, comp: +r.normComposite || 0, A: +r.normA || 0, B: +r.normB || 0, C: +r.normC || 0, ts: r.timestamp }; });
          var seen = {}; rows.forEach(function (r) { var p = seen[r.sort]; if (!p || new Date(r.ts) >= new Date(p.ts)) seen[r.sort] = r; });
          return Object.keys(seen).map(function (s) { return seen[s]; }).sort(function (a, b) { return a.sort - b.sort; });
        }
        function progSvg(rows, dk, targetLo, nb) {
          var W = 560, H = 190, ml = 30, mr = 16, mt = 14, mb = 28, n = rows.length;
          var X = function (i) { return ml + (W - ml - mr) * (n <= 1 ? 0.5 : i / (n - 1)); };
          var Y = function (v) { return mt + (H - mt - mb) * (1 - Math.max(0, Math.min(100, v)) / 100); };
          var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:560px;display:block;margin-top:8px;">';
          [[75, 100, "#E8F0E7"], [50, 75, "#F5EAC8"], [0, 50, "#F3DFDC"]].forEach(function (b) { s += '<rect x="' + ml + '" y="' + Y(b[1]) + '" width="' + (W - ml - mr) + '" height="' + (Y(b[0]) - Y(b[1])) + '" fill="' + b[2] + '" opacity=".6"/>'; });
          [0, 50, 100].forEach(function (tk) { s += '<text x="' + (ml - 5) + '" y="' + (Y(tk) + 3) + '" text-anchor="end" font-size="9" fill="#8A92A6">' + tk + '</text>'; });
          if (targetLo > 0) { s += '<line x1="' + ml + '" y1="' + Y(targetLo) + '" x2="' + (W - mr) + '" y2="' + Y(targetLo) + '" stroke="#0A1E33" stroke-width="1.3" stroke-dasharray="5 4"/><text x="' + (ml + 4) + '" y="' + (Y(targetLo) - 5) + '" text-anchor="start" font-size="9" font-weight="700" fill="#0A1E33">' + (GLANG === "es" ? "Meta: " : "Target: ") + esc(nb) + '</text>'; }
          var d = ""; rows.forEach(function (r, i) { d += (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(r[dk]).toFixed(1) + " "; });
          s += '<path d="' + d + '" fill="none" stroke="#0A1E33" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
          rows.forEach(function (r, i) { var v = r[dk]; s += '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="3.5" fill="' + tColor(v) + '" stroke="#fff" stroke-width="1.5"/><text x="' + X(i).toFixed(1) + '" y="' + (H - mb + 15) + '" text-anchor="middle" font-size="9.5" font-weight="700" fill="#46506E">' + esc(r.label) + '</text>'; });
          return s + "</svg>";
        }
        function progBars(rows, dk, targetLo, nb) {
          var W = 560, H = 190, ml = 30, mr = 16, mt = 14, mb = 28, n = rows.length;
          var plotW = W - ml - mr, slot = plotW / n, bw = Math.min(54, slot * 0.5);
          var Y = function (v) { return mt + (H - mt - mb) * (1 - Math.max(0, Math.min(100, v)) / 100); };
          var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:560px;display:block;margin-top:8px;">';
          [[75, 100, "#E8F0E7"], [50, 75, "#F5EAC8"], [0, 50, "#F3DFDC"]].forEach(function (b) { s += '<rect x="' + ml + '" y="' + Y(b[1]) + '" width="' + plotW + '" height="' + (Y(b[0]) - Y(b[1])) + '" fill="' + b[2] + '" opacity=".55"/>'; });
          [0, 50, 100].forEach(function (tk) { s += '<text x="' + (ml - 5) + '" y="' + (Y(tk) + 3) + '" text-anchor="end" font-size="9" fill="#8A92A6">' + tk + '</text>'; });
          rows.forEach(function (r, i) { var v = r[dk]; var cx = ml + slot * i + slot / 2; var x = cx - bw / 2; var y = Y(v); var h = Y(0) - y; s += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3" fill="' + tColor(v) + '"/><text x="' + cx.toFixed(1) + '" y="' + (y - 4) + '" text-anchor="middle" font-size="10" font-weight="800" fill="#0A1E33">' + Math.round(v) + '</text><text x="' + cx.toFixed(1) + '" y="' + (H - mb + 15) + '" text-anchor="middle" font-size="9.5" font-weight="700" fill="#46506E">' + esc(r.label) + '</text>'; });
          if (targetLo > 0) { s += '<line x1="' + ml + '" y1="' + Y(targetLo) + '" x2="' + (W - mr) + '" y2="' + Y(targetLo) + '" stroke="#0A1E33" stroke-width="1.3" stroke-dasharray="5 4"/><text x="' + (ml + 4) + '" y="' + (Y(targetLo) - 5) + '" text-anchor="start" font-size="9" font-weight="700" fill="#0A1E33">' + (GLANG === "es" ? "Meta: " : "Target: ") + esc(nb) + '</text>'; }
          return s + "</svg>";
        }
        window.aogProgView = function (v) { window.__aogProgView = v; if (typeof window.renderProgress === "function") window.renderProgress(); };
        window.renderProgress = function () {
          var box = document.getElementById("aoggProgress"); if (!box) return;
          var id = val("aoggStudent"); var t = T[GLANG]; var es = GLANG === "es";
          if (!id) { box.hidden = true; box.innerHTML = ""; return; }
          var rows = progRows(id);
          if (!rows.length) { box.hidden = false; box.innerHTML = '<div class="aogg-prog-card"><div class="aogg-prog-hint">' + (es ? "No hay registros guardados para monitorear el progreso." : "No saved check-ins yet to monitor progress.") + "</div></div>"; return; }
          var ck = val("aoggComp"); var dk = DK[ck] || "A"; var c = COMPS[ck];
          var bi = parseInt(val("aoggBand"), 10) || 0; var ni = Math.min(bi + 1, 2);
          var targetLo = ni === 2 ? 75 : ni === 1 ? 50 : 0; var nb = t.bands[ni];
          var vals = rows.map(function (r) { return r[dk]; });
          var last = vals[vals.length - 1], first = vals[0];
          var sk = last >= targetLo ? "met" : (last > first ? "on" : "attn");
          var statusTxt = es
            ? (sk === "met" ? "En la banda meta o por encima (" + nb + ")." : sk === "on" ? "En camino — avanzando hacia " + nb + "." : "Necesita atención — aún no avanza hacia " + nb + ".")
            : (sk === "met" ? "At or above the target band (" + nb + ")." : sk === "on" ? "On track — progressing toward " + nb + "." : "Needs attention — not yet progressing toward " + nb + ".");
          var statusColor = sk === "met" ? "#2E6B3A" : sk === "on" ? "#8A6D1F" : "#8B2A2A";
          var view = window.__aogProgView || "line";
          var svg = (view === "bars") ? progBars(rows, dk, targetLo, nb) : progSvg(rows, dk, targetLo, nb); window.__aogProgSvg = svg;
          var pv = '<span class="aogg-seg aogg-pv"><button type="button" class="' + (view === "line" ? "on" : "") + '" onclick="aogProgView(\'line\')">' + (es ? "Línea" : "Line") + '</button><button type="button" class="' + (view === "bars" ? "on" : "") + '" onclick="aogProgView(\'bars\')">' + (es ? "Barras" : "Bars") + '</button></span>';
          var dom = c.domain[GLANG];
          var PL = [];
          PL.push((es ? "ACTUALIZACIONES DE PROGRESO — " : "GOAL PROGRESS UPDATES — ") + id + " · " + c.name[GLANG] + " (" + dom + ")");
          PL.push((es ? "Meta para fin de año: " : "Target by year-end: ") + nb);
          rows.forEach(function (r) { var v = Math.round(r[dk]); var ant = v >= targetLo ? (es ? "Cumplió la meta" : "Met Goal") : (v > first ? (es ? "Cumplirá la meta" : "Will Meet Goal") : (es ? "Quizás no cumpla" : "May Not Meet Goal")); PL.push(r.label + " — " + (es ? "Puntaje" : "Score") + ": " + v + "/100 — " + tName(v) + " — " + (es ? "Anticipa" : "Anticipate") + ": " + ant); });
          PL.push((es ? "General: " : "Overall: ") + statusTxt);
          window.__aogProgText = PL.join("\n");
          box.hidden = false;
          box.innerHTML = '<div class="aogg-prog-card"><div class="aogg-prog-head"><div class="aogg-prog-h">' + (es ? "Monitoreo de progreso" : "Progress monitoring") + " — " + esc(c.name[GLANG]) + '</div><div class="aogg-prog-acts">' + pv + '<button class="aogg-copy" id="aogProgCopy" type="button" aria-label="Copy progress updates" onclick="aogProgCopy()">' + (es ? "Copiar" : "Copy") + '</button><button class="aogg-print" type="button" aria-label="Print progress page" onclick="aogProgPrint()">' + (es ? "Imprimir" : "Print") + '</button></div></div><div class="aogg-prog-status" style="color:' + statusColor + '">' + esc(statusTxt) + "</div>" + svg + "</div>";
        };
        window.aogProgCopy = function () {
          var tx = window.__aogProgText || ""; var btn = document.getElementById("aogProgCopy");
          function done() { if (btn) { var o = btn.textContent; btn.textContent = (GLANG === "es" ? "¡Copiado!" : "Copied!"); btn.classList.add("copied"); setTimeout(function () { btn.textContent = o; btn.classList.remove("copied"); }, 1600); } }
          if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(tx).then(done, function () { window.prompt("Copy:", tx); }); } else { window.prompt("Copy:", tx); }
        };
        window.aogProgPrint = function () {
          var tx = window.__aogProgText || ""; if (!tx) return; var svg = window.__aogProgSvg || ""; var es = GLANG === "es"; var title = es ? "Monitoreo de progreso" : "Progress monitoring";
          var doc = '<!doctype html><html><head><meta charset="utf-8"><title>' + title + '</title><style>*{-webkit-print-color-adjust:exact;print-color-adjust:exact;}body{font-family:-apple-system,Segoe UI,Inter,system-ui,sans-serif;color:#0A1E33;margin:36px;max-width:680px;}.bh{display:flex;align-items:center;gap:12px;border-bottom:3px solid #D9A33B;padding-bottom:12px;margin:0 0 16px;}.mk{width:40px;height:40px;border-radius:8px;background:#D9A33B;color:#0A1E33;font-family:Georgia,serif;font-weight:700;font-size:24px;display:flex;align-items:center;justify-content:center;}.wm{font-family:Georgia,serif;font-size:18px;font-weight:700;}.sb{font-size:12px;color:#46506E;}pre{white-space:pre-wrap;font-family:inherit;font-size:13px;line-height:1.6;}.ft{margin-top:16px;border-top:1px solid #E4DAC5;padding-top:8px;font-size:10.5px;color:#8A92A6;}@media print{body{margin:.5in;}.np{display:none;}}</style></head><body><div class="bh"><span class="mk">A</span><div><div class="wm">Architecture of Grace</div><div class="sb">' + title + '</div></div></div>' + svg + '<pre>' + esc(tx) + '</pre><div class="ft">' + (es ? "Centrado en la relación · Una señal de apoyo, no un conteo de déficits." : "Relationship-centered · A flag for support, not a deficit count.") + '</div><p class="np"><button onclick="window.print()" style="font:inherit;font-weight:700;background:#0A1E33;color:#fff;border:0;border-radius:8px;padding:9px 18px;cursor:pointer;">' + (es ? "Imprimir" : "Print") + '</button></p></body></html>';
          var w = window.open("", "_blank"); if (!w) { alert(es ? "Permite las ventanas emergentes." : "Please allow pop-ups."); return; }
          w.document.open(); w.document.write(doc); w.document.close(); w.focus(); try { w.print(); } catch (e) {}
        };
        try { var lb = document.querySelectorAll("#panel-goals .aogg-lang button"); Array.prototype.forEach.call(lb, function (x) { x.classList.toggle("on", x.getAttribute("data-l") === GLANG); }); } catch (e) {}
        try { window.aogGoalPopulate(); } catch (e) {}
        try { window.aogGoalAlignPopulate(); } catch (e) {}
        try { window.aogGoalStdSync && window.aogGoalStdSync(true); } catch (e) {}
      })();
      