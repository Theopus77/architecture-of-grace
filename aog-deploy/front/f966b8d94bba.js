
    /* =====================================================================
       POPULATION + CONTEXT LAYER  ·  built 2026-08-27 from Jimmy's
       "Population + Context Layer 2.0" handoff.

       WHAT THIS IS. Everything above this line is excellent at understanding
       activity that EXISTS. It cannot say who was expected, because until now
       nothing in the product knew that a class is a thing. This layer teaches
       it: a CONTEXT (period + course + grade + term + school), a POPULATION
       (the pseudonymous codes that belong to that context), and an
       ASSIGNMENT (the day an activity was actually handed to them).

       WHAT THIS IS NOT, and must never become: an SIS, an attendance system,
       a behavior tracker, a compliance scoreboard, or a central student
       database. No student name is stored anywhere that leaves this device.
       No participation grade is computed. Nothing here ranks a child.

       ---------------------------------------------------------------------
       THE ONE RECONCILIATION THAT MATTERS

       On 2026-08-25 Jimmy said, unprompted, "I don't want a roster", and
       Today's Picture was built to count and never to divide: "22 of 24
       checked in" was an invented denominator and a shortfall dressed up as
       information. THAT DECISION IS NOT REVERSED HERE, and Today's Picture is
       not touched.

       What changed is that the handoff supplies the missing half. A fraction
       is dishonest when the denominator is guessed. It is honest when the
       teacher DECLARED it and then DECLARED that they handed the activity
       out. So:

         · with no class set up, everything behaves exactly as it did before,
           down to the wording — this layer is invisible;
         · a count is still a count everywhere outside a class the teacher
           built themselves;
         · inside a class, a number is only ever shown for a day the teacher
           assigned, and the residue is called NOT OBSERVED — never missing,
           never a shortfall, never evidence of anything.

       ---------------------------------------------------------------------
       FIVE PARTICIPATION STATES (handoff section 10), and the rule that
       missing data is not a behavioral signal (section 11):

         EXPECTED     the code belongs to this context
         ASSIGNED     an adult deliberately handed this activity to it
         AVAILABLE    that assignment's day has arrived
         COMPLETED    a real response exists
         NOT OBSERVED available, and no response — and we do not know why

       NOT OBSERVED IS NEVER WRITTEN DOWN. It is derived at render time by
       subtracting the events that exist from the population that was
       expected, and it disappears the moment the class list changes. There is
       no "missing" record on this device and none on the Sheet — grep the
       storage after any render and you will find no such key. That is
       deliberate: a stored absence becomes a fact about a child, and it is
       not one.

       INTERPRETATION IS DETERMINISTIC ONLY (section 44.1). Counts, frequency
       thresholds and categorical flags. No sentiment scoring, no profiling,
       no risk classification, and nothing whatsoever run over a student's
       free text. Every signal below states what it counted and offers one
       question. None of them state a conclusion about a person.
       ===================================================================== */
    (function () {
      "use strict";

      var POP  = "aog.population.v1";      /* classes + their member codes    */
      var PRIV = "aog.pop.private.v1";     /* device-only notes; never leaves */
      var ASGN = "aog.assign.v1";          /* what was handed out, and when   */

      function el(id) { return document.getElementById(id); }
      function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
      }
      function isEs() { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; }
      function T(en, es) { return isEs() ? es : en; }
      function jload(k, fb) { try { return JSON.parse(localStorage.getItem(k) || "") || fb; } catch (e) { return fb; } }
      function jsave(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
      function todayISO() {
        var d = new Date(), m = d.getMonth() + 1, da = d.getDate();
        return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (da < 10 ? "0" + da : da);
      }
      function shiftISO(iso, days) {
        var p = String(iso).split("-");
        var d = new Date(+p[0], +p[1] - 1, +p[2]);
        d.setDate(d.getDate() + days);
        var m = d.getMonth() + 1, da = d.getDate();
        return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (da < 10 ? "0" + da : da);
      }
      function code(s) { return String(s == null ? "" : s).trim().toUpperCase(); }
      function uniq(a) { var s = {}, o = []; a.forEach(function (x) { if (x && !s[x]) { s[x] = 1; o.push(x); } }); return o; }

      /* ⚠ ELEVEN PERIODS, 0 THROUGH 10, AND 0 IS ADVISORY. This mirrors
         PERIOD_DEFS in the check-in layer and PICK_PERIODS in Today's Picture.
         Three copies of one list is already one too many; if a twelfth period
         is ever added it must be added in all three. */
      var PERIODS = (function () {
        var out = [{ v: "Advisory", n: 0, en: "Period 0 · Advisory", es: "Periodo 0 · Asesoría" }];
        for (var i = 1; i <= 10; i++) out.push({ v: "Period " + i, n: i, en: "Period " + i, es: "Periodo " + i });
        return out;
      })();
      function periodLabel(v) {
        for (var i = 0; i < PERIODS.length; i++) if (PERIODS[i].v === v) return T(PERIODS[i].en, PERIODS[i].es);
        return v || T("No period", "Sin periodo");
      }
      function periodNum(v) {
        for (var i = 0; i < PERIODS.length; i++) if (PERIODS[i].v === v) return PERIODS[i].n;
        return "";
      }

      /* ================================================================ MODEL
         LAYER 1 IDENTITY — a pseudonymous code, and nothing else. The school
         owns the name-to-code list and always did; this layer never asks for
         it and has nowhere to put it.

         LAYER 2/3 POPULATION + CONTEXT — a class is one object because a
         teacher experiences it as one thing ("I have Period 3"). Underneath,
         its fields are exactly the context fields the Sheet has always
         carried, so nothing new has to be invented on the wire.

         ONE STUDENT, MANY CONTEXTS (section 21). A code is not owned by a
         class. The same code may sit in Period 1 ELA, Period 3 Math and an
         intervention group; each membership is its own row, keyed
         CODE#CTXKEY, and the identity is never duplicated. */

      function popLoad() {
        var o = jload(POP, null);
        if (!o || !o.classes || Object.prototype.toString.call(o.classes) !== "[object Array]") o = { v: 1, classes: [] };
        return o;
      }
      function popSave(o) { o.v = 1; o.updated = new Date().toISOString(); jsave(POP, o); }
      function classes() { return popLoad().classes.filter(function (c) { return c && c.id; }); }
      function classById(id) { return classes().filter(function (c) { return c.id === id; })[0] || null; }

      function newId() {
        var abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "";
        for (var i = 0; i < 6; i++) s += abc.charAt(Math.floor(Math.random() * abc.length));
        return "CTX-" + s;
      }

      /* THE COMPOSITE KEY (section 44.1). A school-owned Google Sheet is a
         flat file and there are no joins on the client. So a membership row
         carries its own whole identity: the student code, then the context
         key, then every context field spelled out beside it. A person can
         read one row and know what it means; a QUERY can filter on any column
         without a lookup table. */
      function ctxKey(c) {
        return [
          code(c.schoolId) || "SCHOOL",
          code(c.classId) || ("P" + (periodNum(c.period) === "" ? "X" : periodNum(c.period))),
          c.period || "NOPERIOD",
          code(c.term) || "TERM"
        ].join("~");
      }
      function memberKey(studentCode, c) { return code(studentCode) + "#" + ctxKey(c); }

      function normalizeClass(c) {
        return {
          id:       c.id || newId(),
          schoolId: String(c.schoolId || "").trim(),
          classId:  String(c.classId || "").trim(),
          course:   String(c.course || "").trim(),
          room:     String(c.room || "").trim(),
          grade:    String(c.grade || "").trim(),
          term:     String(c.term || "").trim(),
          period:   String(c.period || "").trim(),
          kind:     c.kind || "class",         /* class | group | caseload   */
          members:  uniq((c.members || []).map(code)),
          created:  c.created || new Date().toISOString(),
          updated:  new Date().toISOString()
        };
      }
      function upsertClass(c) {
        var store = popLoad(), rec = normalizeClass(c), hit = -1;
        store.classes.forEach(function (x, i) { if (x && x.id === rec.id) hit = i; });
        if (hit >= 0) { rec.created = store.classes[hit].created || rec.created; store.classes[hit] = rec; }
        else store.classes.push(rec);
        popSave(store);
        return rec;
      }
      function removeClass(id) {
        var store = popLoad();
        store.classes = store.classes.filter(function (c) { return c && c.id !== id; });
        popSave(store);
        /* The assignments go with it. An assignment to a context that no
           longer exists cannot be evaluated and must not linger as a ghost
           denominator. */
        var a = asgnLoad();
        a.items = a.items.filter(function (x) { return x && x.ctx !== id; });
        asgnSave(a);
      }

      /* Codes pasted from anywhere — a column copied out of a spreadsheet, a
         comma list, a line per child. Anything that is not a code is dropped
         silently rather than becoming a member nobody meant to add. */
      function parseCodes(text) {
        return uniq(String(text || "")
          .split(/[\s,;]+/)
          .map(code)
          .filter(function (s) { return s.length >= 2 && s.length <= 24; }));
      }

      /* -------------------------------------------------- device-only notes
         A teacher looking at A104 has to know which child that is, and the
         school's own list is downstairs in a filing cabinet. So there is one
         optional free-text note per code, and it is the single most carefully
         fenced thing in this file:

           · a SEPARATE storage key, so no export or sync path can reach it
             by walking the population object;
           · never included in a CSV, never posted to the Sheet, never
             printed, never in a link;
           · shown only on this device, to whoever is already signed in to
             this dashboard.

         There is a test that asserts every serialized row and every payload
         is free of it. If that test is ever deleted, this feature must be
         deleted with it. */
      function privLoad() { return jload(PRIV, {}) || {}; }
      function privGet(c) { return privLoad()[code(c)] || ""; }
      function privSet(c, v) {
        var o = privLoad();
        if (String(v || "").trim()) o[code(c)] = String(v).trim().slice(0, 40); else delete o[code(c)];
        jsave(PRIV, o);
      }

      /* =========================================================== ASSIGNMENT
         EXPECTED is not ASSIGNED and ASSIGNED is not COMPLETED (section 10).
         The middle term is the one every other system skips, and skipping it
         is exactly how "no response" quietly turns into "did not comply".

         An assignment is a deliberate act by an adult: I handed this to this
         class, for this day. It is the ONLY thing that authorizes a
         denominator. Nothing infers it, nothing back-fills it, and a class
         with no assignment for a day shows a count, like the rest of the
         product. */
      function asgnLoad() {
        var o = jload(ASGN, null);
        if (!o || Object.prototype.toString.call(o.items) !== "[object Array]") o = { v: 1, items: [] };
        return o;
      }
      function asgnSave(o) { o.v = 1; jsave(ASGN, o); }
      function assignments(ctxId) {
        return asgnLoad().items.filter(function (a) { return a && (!ctxId || a.ctx === ctxId); });
      }
      function assignFor(ctxId, activity, dateISO) {
        var d = dateISO || todayISO();
        return assignments(ctxId).filter(function (a) {
          if (a.activity !== activity) return false;
          if (a.from && d < a.from) return false;
          if (a.to && d > a.to) return false;
          return true;
        })[0] || null;
      }
      function assign(ctxId, activity, fromISO, toISO) {
        var store = asgnLoad();
        var from = fromISO || todayISO(), to = toISO || from;
        /* Assigning the same activity to the same class for the same day
           twice is one assignment, not two. */
        var dup = store.items.filter(function (a) {
          return a && a.ctx === ctxId && a.activity === activity && a.from === from && a.to === to;
        })[0];
        if (dup) return dup;
        var rec = { id: "ASG-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
                    ctx: ctxId, activity: activity, from: from, to: to,
                    created: new Date().toISOString() };
        store.items.push(rec);
        asgnSave(store);
        return rec;
      }
      function unassign(id) {
        var store = asgnLoad();
        store.items = store.items.filter(function (a) { return a && a.id !== id; });
        asgnSave(store);
      }

      /* ============================================================== EVENTS
         LAYER 4. One reader over three stores, because a reflection, a
         student's check-in and an adult's observation are all things that
         happened — and are NOT the same kind of thing (section 18). Every
         event keeps its own `kind` and its own `voice`, and nothing here ever
         averages a student's answer together with an adult's note to
         manufacture a truth score.

         SEVERAL CHECK-INS IN ONE DAY STAY SEVERAL (section 19). This returns
         every event with its own timestamp and period. Participation asks
         only "did at least one exist", which is a different question from
         "what was the day like", and the second question is answered
         elsewhere and never by folding them together. */
      function eventsFor(c, opt) {
        opt = opt || {};
        var out = [], want = opt.date || null, since = opt.since || null;
        var wantSchool = code(c.schoolId), wantClass = code(c.classId), wantPeriod = c.period || "";

        function inCtx(ev) {
          /* A field the teacher left blank is not a filter. A field they
             filled in is. Anything the event does not carry cannot disagree. */
          if (wantSchool && code(ev.schoolId) && code(ev.schoolId) !== wantSchool) return false;
          if (wantClass && code(ev.classId) && code(ev.classId) !== wantClass) return false;
          if (wantPeriod && ev.period && ev.period !== wantPeriod) return false;
          /* A daily check-in with no period at all cannot be placed in a
             period-defined class. Silence, not a guess. */
          if (wantPeriod && !ev.period && !wantClass) return false;
          if (c.grade && ev.grade && String(ev.grade) !== String(c.grade)) return false;
          return true;
        }
        function keep(ev) {
          if (want && ev.date !== want) return;
          if (since && ev.date < since) return;
          if (!inCtx(ev)) return;
          out.push(ev);
        }

        /* the student's own daily check-in */
        var stu = (jload("aog.checkin.student.v1", {}).logs) || {};
        Object.keys(stu).forEach(function (sid) {
          Object.keys(stu[sid] || {}).forEach(function (d) {
            (stu[sid][d] || []).forEach(function (e) {
              keep({ kind: "checkin", voice: "student", student: code(sid), date: d,
                     timestamp: e.timestamp, period: e.period || "", classId: e.classId || "",
                     schoolId: e.schoolId || "", grade: e.grade || "", followUp: !!e.followUp,
                     readiness: e.readiness, arrival: e.arrival, connection: e.connection,
                     challenge: e.challenge || "", challengeImpact: e.challengeImpact,
                     need: e.need || "" });
            });
          });
        });

        /* an adult's observation of a student — a different data type, kept
           different all the way through */
        var ad = (jload("aog.daily.v1", {}).logs) || {};
        Object.keys(ad).forEach(function (sid) {
          Object.keys(ad[sid] || {}).forEach(function (d) {
            ((ad[sid][d] || {}).periods || []).forEach(function (p) {
              keep({ kind: "observation", voice: "adult", student: code(sid), date: d,
                     timestamp: p.timestamp, period: p.period || "", classId: p.classId || "",
                     schoolId: p.schoolId || "", grade: p.grade || "", followUp: !!p.followUp,
                     regulated: !!p.regulated, usedStrategy: !!p.usedStrategy, connected: !!p.connected,
                     role: p.respondentRole || "" });
            });
          });
        });

        /* the self-reflection. It carries no period — it never has — so it
           joins on classId, school and grade, which is why a class that wants
           its reflections counted needs a Class ID. Said out loud in the UI
           rather than left as a silent miss. */
        var recs = [];
        try { recs = (typeof getAllRecords === "function" ? getAllRecords() : []) || []; } catch (e) {}
        recs.forEach(function (r) {
          if (!r || r.context === "home" || r.population === "adult") return;
          var d = String(r.timestamp || "").slice(0, 10);
          keep({ kind: "reflection", voice: "student", student: code(r.studentId), date: d,
                 timestamp: r.timestamp, period: "", classId: r.classId || "",
                 schoolId: r.schoolId || "", grade: r.grade || "", window: r.window || "",
                 tier: r.tier || "", normA: r.normA, normB: r.normB, normC: r.normC,
                 normComposite: r.normComposite, followUp: !!r.trustedAdultFlag });
        });

        out.sort(function (a, b) { return String(a.timestamp) < String(b.timestamp) ? -1 : 1; });
        return out;
      }

      /* ====================================================== PARTICIPATION
         Derived here, at render time, every time. Nothing below writes.

         The residue is called NOT OBSERVED and the UI says, every single
         time it is shown, that the system does not know why. A student may be
         absent, in another room, on a dead Chromebook, unassigned, or simply
         not doing it today, and none of those are distinguishable from here.
         Turning that into a judgement is the exact failure this layer exists
         to prevent. */
      function participation(c, opt) {
        opt = opt || {};
        var activity = opt.activity || "checkin";
        var date = opt.date || todayISO();
        var expected = uniq((c.members || []).map(code));
        var a = assignFor(c.id, activity, date);
        var assigned = !!a;
        var available = assigned && date <= todayISO();

        var evs = eventsFor(c, { date: activity === "reflection" ? null : date })
          .filter(function (e) {
            if (activity === "reflection") return e.kind === "reflection";
            if (activity === "observation") return e.kind === "observation";
            return e.kind === "checkin";
          });
        if (activity === "reflection" && a) {
          evs = evs.filter(function (e) { return (!a.from || e.date >= a.from) && (!a.to || e.date <= a.to); });
        }

        var didMap = {};
        evs.forEach(function (e) { if (e.student) didMap[e.student] = (didMap[e.student] || 0) + 1; });
        var did = Object.keys(didMap);

        var completed = expected.filter(function (s) { return didMap[s]; });
        /* Someone answered who is not on this class list. That is information
           about the LIST, not about the person — a code typed differently, a
           student who moved sections, a link shared on. It is surfaced as a
           question, never as an intruder. */
        var offList = did.filter(function (s) { return expected.indexOf(s) < 0; });
        var notObserved = available ? expected.filter(function (s) { return !didMap[s]; }) : [];

        var state = !expected.length ? "no-population"
                  : !assigned        ? "not-assigned"
                  : !available       ? "scheduled"
                  : !completed.length ? "none-yet"
                  : notObserved.length ? "partial" : "all-in";

        return {
          activity: activity, date: date, assignment: a,
          expected: expected, assigned: assigned, available: available,
          completed: completed, notObserved: notObserved, offList: offList,
          events: evs, state: state,
          /* A fraction EXISTS only when a person declared both halves of it.
             Everywhere else this is null and the caller shows a count. */
          fraction: available && expected.length ? { done: completed.length, of: expected.length } : null
        };
      }

      /* ============================================================= SIGNALS
         LAYER 5, and the hard line from section 44.1: deterministic
         calculation only. Every one of these is a COUNT against a stated
         THRESHOLD. There is no model here, no scoring of anything a student
         wrote, and no classification of a person.

         Each signal returns: what was counted, in plain words · one question
         an adult might open with · one place to go next. None of them return
         a verdict, and none of them name a child — the order of inquiry is
         GROUP, then CONTEXT, then PATTERN, then INDIVIDUAL, then CONVERSATION
         (section 15), and this function only ever produces the first three. */
      function signals(c, opt) {
        opt = opt || {};
        var days = opt.days || 10;
        var since = shiftISO(todayISO(), -days);
        var evs = eventsFor(c, { since: since });
        var checkins = evs.filter(function (e) { return e.kind === "checkin"; });
        var out = [];

        function studentsOf(list) { return uniq(list.map(function (e) { return e.student; })).length; }

        /* 1 · readiness. "Can they get to the work" is its own question and is
           never folded into how they arrived — see the Daily Check-In 2.0
           note. Threshold: three or more different students at the bottom two
           rungs inside the window. */
        var lowReady = checkins.filter(function (e) { return e.readiness !== "" && e.readiness != null && +e.readiness <= 2; });
        if (studentsOf(lowReady) >= 3) {
          out.push({
            k: "readiness", tone: "amber",
            what: T(studentsOf(lowReady) + " students said they could not get started, across " + lowReady.length + " check-ins in the last " + days + " days.",
                    studentsOf(lowReady) + " estudiantes dijeron que no podían empezar, en " + lowReady.length + " registros en los últimos " + days + " días."),
            ask: T("“What would make the first five minutes easier?”",
                   "“¿Qué haría más fáciles los primeros cinco minutos?”"),
            why: T("Readiness is about getting to the work, not about effort or worth.",
                   "La disposición se trata de poder empezar el trabajo, no del esfuerzo ni del valor personal."),
            go: { q: "getting started", label: T("Find a getting-started practice", "Buscar una práctica para empezar") }
          });
        }

        /* 2 · a barrier chosen again and again. The label is the student's own
           word from a fixed list, counted. Nothing is read from the free-text
           box beside it. */
        /* ⚠ "Nothing today" IS AN ANSWER, AND IT IS NOT A BARRIER. It is the
           most-chosen option in a healthy room, so counting it here produced
           the sentence "Nothing today was named 61 times by 10 students" —
           a signal about the absence of a signal. Both languages, because the
           store holds whichever the student's screen was in. */
        var NOT_A_BARRIER = { "nothing today": 1, "nada hoy": 1, "nada por ahora": 1 };
        var barrels = {};
        checkins.forEach(function (e) {
          var b = String(e.challenge || "").split(" · ")[0].trim();
          if (!b || NOT_A_BARRIER[b.toLowerCase()]) return;
          barrels[b] = barrels[b] || { n: 0, who: {} };
          barrels[b].n++; barrels[b].who[e.student] = 1;
        });
        var topBar = Object.keys(barrels).sort(function (x, y) { return barrels[y].n - barrels[x].n; })[0];
        if (topBar && barrels[topBar].n >= 3) {
          var heavy = checkins.filter(function (e) {
            return String(e.challenge || "").indexOf(topBar) === 0 && +e.challengeImpact >= 4;
          }).length;
          var bn = barrels[topBar].n, bw = Object.keys(barrels[topBar].who).length;
          /* "named 25 times … 25 of them a lot" is arithmetic read aloud and
             reads as a stutter. When every mention carried a heavy impact,
             say that; when some did, say how many. */
          var heavyEn = !heavy ? "" : heavy >= bn ? ", every time as getting in the way a lot" : ", " + heavy + " of them as getting in the way a lot";
          var heavyEs = !heavy ? "" : heavy >= bn ? ", siempre como un gran estorbo" : ", " + heavy + " de ellas como un gran estorbo";
          out.push({
            k: "barrier", tone: "amber",
            what: T("“" + topBar + "” was named " + bn + " times by " + bw + (bw === 1 ? " student" : " students") + heavyEn + ".",
                    "“" + topBar + "” se nombró " + bn + " veces por " + bw + (bw === 1 ? " estudiante" : " estudiantes") + heavyEs + "."),
            ask: T("“A lot of us named the same thing this week. What would help?”",
                   "“Varios nombramos lo mismo esta semana. ¿Qué ayudaría?”"),
            why: T("A barrier named often is a fact about the week. It is not a cause, and nobody said it was.",
                   "Una barrera nombrada muchas veces es un hecho de la semana. No es una causa, y nadie dijo que lo fuera."),
            go: { q: String(topBar).toLowerCase(), label: T("Find a lesson that touches this", "Buscar una lección sobre esto") }
          });
        }

        /* 3 · asked to talk. This is not a pattern read at all — it is a
           request a student made out loud, and it outranks everything else on
           the card. */
        var talk = evs.filter(function (e) { return e.followUp; });
        if (talk.length) {
          out.push({
            k: "talk", tone: "red",
            what: T(studentsOf(talk) + (studentsOf(talk) === 1 ? " student has" : " students have") + " asked to talk with someone.",
                    studentsOf(talk) + (studentsOf(talk) === 1 ? " estudiante ha pedido" : " estudiantes han pedido") + " hablar con alguien."),
            ask: T("They asked. Open their check-in and go to them.",
                   "Lo pidieron. Abre su registro y ve con ellos."),
            why: T("This is a request, not a pattern. It does not need interpreting.",
                   "Esto es una petición, no un patrón. No necesita interpretación."),
            students: true
          });
        }

        /* 4 · the reflection window, scoped to this class. Same math as the
           Overview, same bands, same words — one instrument, one reading. */
        var refl = evs.filter(function (e) { return e.kind === "reflection" && e.normComposite != null; });
        if (!refl.length) {
          var all = eventsFor(c, {}).filter(function (e) { return e.kind === "reflection" && e.normComposite != null; });
          refl = all;
        }
        if (refl.length >= 3) {
          var newest = refl.slice().sort(function (a, b) { return String(b.timestamp) < String(a.timestamp) ? -1 : 1; })[0];
          var win = newest && newest.window;
          var inWin = win ? refl.filter(function (r) { return r.window === win; }) : refl;
          var doms = [
            { k: "normA", en: "Emotional Regulation & Well-Being", es: "Regulación emocional y bienestar", q: "emotional regulation" },
            { k: "normB", en: "Self-Compassion & Growth Mindset",  es: "Autocompasión y mentalidad de crecimiento", q: "self-compassion" },
            { k: "normC", en: "Social Competency & Repair",        es: "Competencia social y reparación", q: "repair" }
          ].map(function (d) {
            var v = inWin.map(function (r) { return r[d.k]; }).filter(function (x) { return x != null && !isNaN(x); });
            return { d: d, mean: v.length ? v.reduce(function (a, b) { return a + b; }, 0) / v.length : null };
          }).filter(function (o) { return o.mean != null; }).sort(function (a, b) { return a.mean - b.mean; });
          if (doms.length) {
            out.push({
              k: "domain", tone: "info",
              what: T("Across " + inWin.length + " self-reflections" + (win ? " in " + win : "") + ", the lowest of the three areas is " + doms[0].d.en + ".",
                      "En " + inWin.length + " autorreflexiones" + (win ? " de " + win : "") + ", el área más baja de las tres es " + doms[0].d.es + "."),
              ask: T("Lowest of three is where a conversation is most likely to be useful.",
                     "La más baja de tres es donde una conversación tiene más probabilidad de ayudar."),
              why: T("From the reflection window, not from today. It is not a finding about any one student.",
                     "De la ventana de autorreflexión, no de hoy. No es un hallazgo sobre ningún estudiante."),
              go: { q: doms[0].d.q, label: T("Find the lesson", "Buscar la lección") }
            });
          }
        }

        return out;
      }

      /* ====================================================== SERIALIZATION
         Section 44.1. A school-owned Google Sheet is a flat file, so the
         one-student-to-many-contexts model is flattened into one row per
         MEMBERSHIP, each row carrying its own composite key and every context
         field spelled out. No joins, no lookup tab, no client-side relational
         anything — a teacher can sort this in the Sheet and it still means
         what it says.

         WHAT IS NOT IN THESE ROWS, ever: a name, a device-only note, and any
         participation state. Absence is derived at read time and belongs to a
         moment, not to a file. */
      var COLS = ["memberKey", "studentCode", "contextKey", "contextId", "schoolId",
                  "classId", "course", "grade", "period", "periodNum", "term", "room", "kind"];
      function serializeRows() {
        var rows = [];
        classes().forEach(function (c) {
          (c.members || []).forEach(function (s) {
            rows.push({
              memberKey:  memberKey(s, c),
              studentCode: code(s),
              contextKey: ctxKey(c),
              contextId:  c.id,
              schoolId:   c.schoolId, classId: c.classId, course: c.course,
              grade:      c.grade,    period:  c.period,  periodNum: periodNum(c.period),
              term:       c.term,     room:    c.room,    kind: c.kind || "class"
            });
          });
        });
        return rows;
      }
      function toCsv() {
        function q(v) { var s = String(v == null ? "" : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
        return [COLS.join(",")].concat(serializeRows().map(function (r) {
          return COLS.map(function (k) { return q(r[k]); }).join(",");
        })).join("\n");
      }
      function fromCsv(text) {
        var lines = String(text || "").split(/\r?\n/).filter(function (l) { return l.trim(); });
        if (!lines.length) return 0;
        var head = lines[0].split(",").map(function (h) { return h.trim().replace(/^"|"$/g, ""); });
        var ix = {}; head.forEach(function (h, i) { ix[h] = i; });
        if (ix.studentCode == null) return 0;
        var byCtx = {}, n = 0;
        lines.slice(1).forEach(function (l) {
          var cells = l.match(/("([^"]|"")*"|[^,]*)/g) || [];
          function g(k) { var i = ix[k]; return i == null ? "" : String(cells[i * 2] == null ? cells[i] : cells[i * 2] || "").replace(/^"|"$/g, "").replace(/""/g, '"'); }
          var cells2 = l.split(",").map(function (x) { return x.replace(/^"|"$/g, "").replace(/""/g, '"'); });
          function v(k) { var i = ix[k]; return i == null ? "" : (cells2[i] || ""); }
          var sc = code(v("studentCode")); if (!sc) return;
          var key = v("contextKey") || v("contextId") || v("period");
          byCtx[key] = byCtx[key] || {
            schoolId: v("schoolId"), classId: v("classId"), course: v("course"),
            grade: v("grade"), period: v("period"), term: v("term"), room: v("room"),
            kind: v("kind") || "class", members: []
          };
          byCtx[key].members.push(sc); n++;
        });
        Object.keys(byCtx).forEach(function (k) {
          var incoming = byCtx[k];
          /* Match an existing class rather than making a second one with the
             same name. Identity is never duplicated, and neither is a room. */
          var hit = classes().filter(function (c) {
            return ctxKey(c) === ctxKey(normalizeClass(incoming));
          })[0];
          if (hit) { hit.members = uniq(hit.members.concat(incoming.members)); upsertClass(hit); }
          else upsertClass(incoming);
        });
        return n;
      }

      /* The 6-8 room, said out loud. The elite review asked for this: a middle
         school teacher should recognize their own building on the screen, and
         a K-2 lesson should never turn up on a junior-high card unexplained. */
      var BANDS = [
        { lo: 0,  hi: 2,  en: "Grades K–2 · The Foundation", es: "Grados K–2 · Los cimientos" },
        { lo: 3,  hi: 5,  en: "Grades 3–5 · The Framework",  es: "Grados 3–5 · La estructura" },
        { lo: 6,  hi: 8,  en: "Grades 6–8 · The Interior",   es: "Grados 6–8 · El interior" },
        { lo: 9,  hi: 10, en: "Grades 9–10 · The Façade",    es: "Grados 9–10 · La fachada" },
        { lo: 11, hi: 12, en: "Grades 11–12 · The Capstone", es: "Grados 11–12 · La culminación" }
      ];
      function bandLabel(grade) {
        var g = parseInt(String(grade).replace(/[^0-9]/g, ""), 10);
        if (isNaN(g)) return "";
        for (var i = 0; i < BANDS.length; i++) if (g >= BANDS[i].lo && g <= BANDS[i].hi) return T(BANDS[i].en, BANDS[i].es);
        return "";
      }
      function classTitle(c) {
        var bits = [], per = c.period ? periodLabel(c.period) : "";
        if (per) bits.push(per);
        /* "Period 0 · Advisory · Advisory" is what you get if you print the
           course beside a period label that already contains it. Advisory is
           the common case and reads as a stutter. */
        if (c.course && per.toLowerCase().indexOf(String(c.course).toLowerCase()) < 0) bits.push(c.course);
        if (!bits.length) bits.push(c.classId || T("Untitled class", "Clase sin título"));
        return bits.join(" · ");
      }

      /* ================================================================= CSS
         Continuity, not decoration. The elite review's note on the 6-8 ask was
         that the workspace already has four card treatments and does not need
         a fifth — so these cards are the product's own paper, rule and gold,
         with the state carried by a dot and a word rather than by a new
         palette. --cream is a light PAPER color and is never remapped for
         dark; nothing here uses it as a ground. */
      var CSS = [
        /* --gold is a color for text ON NAVY. On paper it measures 2.14:1, which
           is the same trap the rest of this build has fallen into four times. The
           strip carries its own accent token: a deep antique gold in light (6.0:1
           on paper) and the theme's own gold in dark, where the ground is dark. */
        "#aogPopStrip{margin:0 0 22px;--pop-accent:#7A5A0F;}",
        ":root[data-theme=\"dark\"] #aogPopStrip{--pop-accent:var(--gold,#E7B85E);}",
        "#aogPopStrip .ps-head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin:0 0 10px;}",
        "#aogPopStrip .ps-eyebrow{font-size:11px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--pop-accent);}",
        "#aogPopStrip .ps-sub{font-size:12.5px;color:var(--ink-faint);}",
        "#aogPopStrip .ps-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(216px,1fr));gap:12px;}",
        /* flex column, not block: a <button> stretched by the grid centers its own
           content vertically, so a card without the asked-to-talk flag sat 13px
           lower than its neighbors. */
        "#aogPopStrip .ps-card{position:relative;text-align:left;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;width:100%;padding:13px 15px 14px;border-radius:14px;",
        "  border:1px solid var(--rule);background:var(--paper);color:var(--ink);font-family:inherit;cursor:pointer;",
        "  transition:border-color .16s ease, box-shadow .16s ease, transform .16s ease;}",
        "#aogPopStrip .ps-card:hover{border-color:var(--gold);box-shadow:var(--shadow-md,0 4px 10px rgba(0,0,0,.08));}",
        "#aogPopStrip .ps-card:active{transform:translateY(1px);}",
        "#aogPopStrip .ps-card.on{border-color:var(--gold);box-shadow:0 0 0 2px var(--gold) inset;}",
        "#aogPopStrip .ps-card .ps-t{display:block;font-weight:700;font-size:15px;letter-spacing:-.01em;line-height:1.25;}",
        "#aogPopStrip .ps-card .ps-band{display:block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--pop-accent);margin-top:3px;}",
        "#aogPopStrip .ps-card .ps-n{display:block;font-size:12.5px;color:var(--ink-faint);margin-top:6px;}",
        "#aogPopStrip .ps-card .ps-state{display:flex;align-items:center;gap:6px;margin-top:9px;font-size:12.5px;font-weight:600;}",
        "#aogPopStrip .ps-dot{width:9px;height:9px;border-radius:50%;flex:0 0 auto;background:var(--ink-faint);}",
        "#aogPopStrip .ps-dot.g{background:var(--green);} #aogPopStrip .ps-dot.a{background:var(--amber);} #aogPopStrip .ps-dot.r{background:var(--red);}",
        "#aogPopStrip .ps-flag{display:table;margin-top:8px;font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:999px;}",
        "#aogPopDetail{margin:14px 0 0;padding:18px 20px 20px;border:1px solid var(--rule);border-radius:16px;background:var(--paper);}",
        "#aogPopDetail h3{margin:0 0 3px;font-size:19px;letter-spacing:-.01em;}",
        "#aogPopDetail .pd-meta{font-size:12.5px;color:var(--ink-faint);margin:0 0 14px;}",
        "#aogPopDetail .pd-states{display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:10px;margin:0 0 6px;}",
        "#aogPopDetail .pd-st{padding:11px 12px;border:1px solid var(--rule);border-radius:12px;}",
        "#aogPopDetail .pd-st b{display:block;font-size:23px;line-height:1.1;letter-spacing:-.02em;}",
        "#aogPopDetail .pd-st span{display:block;font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-faint);margin-top:3px;}",
        "#aogPopDetail .pd-st em{display:block;font-style:normal;font-size:11.5px;color:var(--ink-faint);margin-top:5px;line-height:1.4;}",
        "#aogPopDetail .pd-note{font-size:12.5px;color:var(--ink-faint);margin:10px 0 0;line-height:1.6;}",
        "#aogPopDetail .pd-sig{margin:16px 0 0;padding:13px 15px;border:1px solid var(--rule);border-radius:12px;}",
        "#aogPopDetail .pd-sig .sg-what{font-weight:700;font-size:14.5px;line-height:1.45;}",
        "#aogPopDetail .pd-sig .sg-ask{font-size:13.5px;color:var(--ink-soft);margin-top:6px;}",
        "#aogPopDetail .pd-sig .sg-why{font-size:12px;color:var(--ink-faint);margin-top:6px;}",
        "#aogPopDetail .pd-acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:11px;}",
        ".aog-pop-btn{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--rule);background:transparent;color:var(--ink);",
        "  font-family:inherit;font-size:13px;font-weight:600;padding:7px 13px;border-radius:9px;cursor:pointer;}",
        ".aog-pop-btn:hover{border-color:var(--gold);}",
        ".aog-pop-btn.primary{background:var(--gold);border-color:var(--gold);color:var(--navy);}",
        ".aog-pop-btn.primary:hover{filter:brightness(1.06);}",
        "#panel-classes .pc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;}",
        "#panel-classes .pc-card{padding:16px 18px;border:1px solid var(--rule);border-radius:14px;background:var(--paper);}",
        "#panel-classes .pc-card h4{margin:0 0 2px;font-size:16.5px;}",
        "#panel-classes .pc-card .pc-meta{font-size:12.5px;color:var(--ink-faint);margin-bottom:10px;}",
        "#panel-classes .pc-codes{display:flex;flex-wrap:wrap;gap:5px;margin:9px 0 0;}",
        "#panel-classes .pc-code{font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;padding:2px 7px;border:1px solid var(--rule);border-radius:6px;color:var(--ink-soft);}",
        "#panel-classes .pc-form{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:13px;align-items:end;}",
        "#panel-classes .pc-form .field{min-width:0;}",
        "#panel-classes .pc-full{grid-column:1/-1;}",
        "@media (max-width:640px){#aogPopStrip .ps-cards{grid-template-columns:1fr 1fr;}}"
      ].join("\n");
      (function () {
        if (el("aog-pop-css")) return;
        var s = document.createElement("style");
        s.id = "aog-pop-css";
        s.textContent = CSS;
        document.head.appendChild(s);
      })();

      /* ======================================================= THE CLASS STRIP
         Section 12. Six periods and a hundred and twenty children arrive at
         the top of the Overview as six cards, and the teacher's first move is
         the one they already make in their head: WHICH ROOM AM I IN?

         ⚠ PARTICIPATION IS NEVER COLOR-CODED. The dot beside a count is
         always neutral, on purpose. The moment 17-of-20 turns amber it has
         become a compliance score with a passing grade, and a class that was
         at a funeral on Tuesday goes orange for it. Color in this layer is
         reserved for a student who asked to talk, which is a request, not a
         rating.

         ⚠ NOTHING IS SORTED BY ANYTHING. Classes render in the order the
         teacher created them. Sorting classes by participation is the shortest
         path from this card to a leaderboard. */

      var sel = null;   /* the class currently opened, in memory only */

      function stateWords(p) {
        if (p.state === "no-population")
          return { t: T("No codes yet", "Sin códigos aún"), d: "" };
        if (p.state === "not-assigned")
          return { t: T("Nothing assigned today", "Nada asignado hoy"), d: "" };
        if (p.state === "scheduled")
          return { t: T("Assigned for " + p.assignment.from, "Asignado para " + p.assignment.from), d: "" };
        if (p.state === "none-yet")
          return { t: T("0 of " + p.expected.length + " so far", "0 de " + p.expected.length + " por ahora"), d: "" };
        return { t: p.completed.length + T(" of ", " de ") + p.expected.length + T(" checked in", " registrados"), d: "" };
      }

      function stripHost() {
        var panel = el("panel-overview");
        if (!panel) return null;
        var host = el("aogPopStrip");
        if (!host) {
          host = document.createElement("div");
          host.id = "aogPopStrip";
          /* FIRST child of the Overview, ahead of Today's Picture — but ONLY
             when a class exists. With no class this element is never inserted
             at all, so Today's Picture is still the first thing on the panel
             and every assertion written against that still holds. Which room
             am I in comes before what is happening in it; that is the order in
             the handoff and the order in a teacher's head. */
          panel.insertBefore(host, panel.firstChild);
        }
        return host;
      }

      function renderStrip() {
        var list = classes();
        var host = el("aogPopStrip");
        if (!list.length) { if (host) host.remove(); sel = null; return; }
        host = stripHost();
        if (!host) return;

        if (sel && !classById(sel)) sel = null;

        var today = todayISO();
        var totalExpected = 0, totalDone = 0, anyFraction = false, talkAll = 0;
        var cards = list.map(function (c) {
          var p = participation(c, { date: today, activity: "checkin" });
          var sg = signals(c, { days: 7 });
          var talk = sg.filter(function (s) { return s.k === "talk"; })[0];
          if (talk) talkAll++;
          totalExpected += p.expected.length;
          if (p.fraction) { anyFraction = true; totalDone += p.fraction.done; }
          var w = stateWords(p);
          var band = bandLabel(c.grade);
          return '<button type="button" class="ps-card' + (sel === c.id ? " on" : "") + '" data-ctx="' + esc(c.id) + '"' +
                 ' aria-pressed="' + (sel === c.id ? "true" : "false") + '">' +
                   '<span class="ps-t">' + esc(classTitle(c)) + "</span>" +
                   (band ? '<span class="ps-band">' + esc(band) + "</span>" : "") +
                   '<span class="ps-n">' + esc(
                       p.expected.length
                         ? p.expected.length + T(" on this list", " en esta lista")
                         : T("no codes on this list yet", "aún sin códigos en esta lista")
                     ) + "</span>" +
                   '<span class="ps-state"><span class="ps-dot"></span>' + esc(w.t) + "</span>" +
                   (talk ? '<span class="ps-flag" style="background:var(--red-bg);color:var(--red);">' +
                            esc(T("Someone asked to talk", "Alguien pidió hablar")) + "</span>" : "") +
                 "</button>";
        }).join("");

        host.innerHTML =
          '<div class="ps-head">' +
            '<span class="ps-eyebrow">' + esc(T("My classes", "Mis clases")) + "</span>" +
            '<span class="ps-sub">' + esc(
              totalExpected
                ? T(list.length + " classes · " + totalExpected + " students expected" +
                    (anyFraction ? " · " + totalDone + " checked in today where a check-in was assigned" : ""),
                    list.length + " clases · " + totalExpected + " estudiantes esperados" +
                    (anyFraction ? " · " + totalDone + " registrados hoy donde se asignó un registro" : ""))
                : T(list.length + " classes · add student codes in Set up ▸ My classes",
                    list.length + " clases · agrega códigos en Configurar ▸ Mis clases")
            ) + "</span>" +
          "</div>" +
          '<div class="ps-cards">' + cards + "</div>" +
          '<div id="aogPopDetail" style="display:none"></div>';

        host.querySelectorAll(".ps-card").forEach(function (b) {
          b.addEventListener("click", function () {
            var id = b.getAttribute("data-ctx");
            sel = (sel === id) ? null : id;
            renderStrip();
            if (sel) {
              /* Scope the rest of the Overview to the same room. Today's
                 Picture already has a period picker; this drives it rather
                 than growing a second one that could disagree with it. */
              var c = classById(sel);
              var pick = el("tpPeriod");
              if (c && pick && c.period) {
                var has = pick.querySelector('option[value="' + String(c.period).replace(/"/g, "") + '"]');
                if (has && pick.value !== c.period) {
                  pick.value = c.period;
                  try { pick.dispatchEvent(new Event("change", { bubbles: true })); } catch (e) {}
                }
              }
            }
          });
        });

        if (sel) renderDetail(classById(sel));
      }

      function renderDetail(c) {
        var box = el("aogPopDetail");
        if (!box || !c) return;
        var p = participation(c, { date: todayISO(), activity: "checkin" });
        var sg = signals(c, { days: 10 });

        function st(n, label, note) {
          return '<div class="pd-st"><b>' + esc(n) + "</b><span>" + esc(label) + "</span>" +
                 (note ? "<em>" + esc(note) + "</em>" : "") + "</div>";
        }

        var states = "";
        if (!p.expected.length) {
          states = '<p class="pd-note">' + esc(T(
            "This class has no student codes yet, so there is nothing to be expected. Add them in Set up ▸ My classes, or leave it empty — the rest of the dashboard works either way.",
            "Esta clase aún no tiene códigos, así que no hay nadie esperado. Agrégalos en Configurar ▸ Mis clases, o déjala vacía — el resto del panel funciona igual.")) + "</p>";
        } else if (!p.assigned) {
          states =
            st(p.expected.length, T("Expected", "Esperados"), T("on this class list", "en esta lista")) +
            st(p.events.length,   T("Check-ins today", "Registros hoy"), T("a count, not a share — nothing was assigned", "un conteo, no una proporción — no se asignó nada"));
        } else {
          states =
            st(p.expected.length,     T("Expected", "Esperados"),      T("belong to this class", "pertenecen a esta clase")) +
            st(T("Yes", "Sí"),        T("Assigned", "Asignado"),       T("you handed it out for " + p.assignment.from, "lo repartiste para " + p.assignment.from)) +
            st(p.available ? T("Yes", "Sí") : T("Not yet", "Aún no"), T("Available", "Disponible"), T("the day has arrived", "el día ha llegado")) +
            st(p.completed.length,    T("Completed", "Completados"),   T("a real response exists", "existe una respuesta real")) +
            st(p.notObserved.length,  T("Not observed", "Sin observar"), T("no response — and we do not know why", "sin respuesta — y no sabemos por qué"));
        }

        var sigs = sg.length ? sg.map(function (s) {
          var go = s.go
            ? '<button type="button" class="aog-pop-btn primary" data-go="' + esc(s.go.q) + '" data-grade="' + esc(c.grade || "") + '">' + esc(s.go.label) + "</button>"
            : "";
          var stu = s.students
            ? '<button type="button" class="aog-pop-btn" data-students="1">' + esc(T("Open Students", "Abrir Estudiantes")) + "</button>"
            : "";
          var tint = s.tone === "red" ? "border-color:var(--red);" : s.tone === "amber" ? "border-color:var(--amber);" : "";
          return '<div class="pd-sig" style="' + tint + '">' +
                   '<div class="sg-what">' + esc(s.what) + "</div>" +
                   '<div class="sg-ask">' + esc(s.ask) + "</div>" +
                   '<div class="sg-why">' + esc(s.why) + "</div>" +
                   (go || stu ? '<div class="pd-acts">' + go + stu + "</div>" : "") +
                 "</div>";
        }).join("") : '<p class="pd-note">' + esc(T(
            "Nothing in this class has crossed a threshold worth interrupting you for. That is not the same as nothing happening.",
            "Nada en esta clase ha cruzado un umbral que valga interrumpirte. Eso no es lo mismo que decir que no pasa nada.")) + "</p>";

        var off = p.offList.length
          ? '<p class="pd-note">' + esc(T(
              p.offList.length + " check-in" + (p.offList.length === 1 ? "" : "s") + " today came from a code that is not on this class list. That is usually a code typed differently, or a link shared on — worth a look at the list, not at the student.",
              p.offList.length + " registro(s) de hoy vienen de un código que no está en esta lista. Suele ser un código escrito distinto, o un enlace compartido — revisa la lista, no al estudiante.")) + "</p>"
          : "";

        box.style.display = "";
        box.innerHTML =
          "<h3>" + esc(classTitle(c)) + "</h3>" +
          '<p class="pd-meta">' + esc([
              bandLabel(c.grade), c.room, c.term, c.classId ? T("Class ID ", "ID de clase ") + c.classId : ""
            ].filter(Boolean).join(" · ") || T("No extra context set", "Sin contexto adicional")) + "</p>" +
          '<div class="pd-states">' + states + "</div>" +
          (p.assigned && p.available
            ? '<p class="pd-note"><b>' + esc(T("Not observed is not a finding.", "Sin observar no es un hallazgo.")) +
              "</b> " + esc(T(
                "A student may have been absent, in another room, on a Chromebook that would not load it, or simply not doing it today. Nothing here can tell those apart, so nothing here calls it anything. A blank is not evidence of anything.",
                "Un estudiante pudo estar ausente, en otra sala, con una Chromebook que no cargó, o simplemente sin hacerlo hoy. Nada aquí distingue entre esas cosas, así que nada aquí lo llama nada. Un espacio en blanco no es evidencia de nada.")) + "</p>"
            : "") +
          off +
          '<div class="pd-acts" style="margin-top:14px;">' +
            (p.assigned
              ? '<button type="button" class="aog-pop-btn" data-unassign="' + esc(p.assignment.id) + '">' +
                  esc(T("Undo today's assignment", "Deshacer la asignación de hoy")) + "</button>"
              : '<button type="button" class="aog-pop-btn primary" data-assign="' + esc(c.id) + '">' +
                  esc(T("I handed today's check-in to this class", "Repartí el registro de hoy a esta clase")) + "</button>") +
            '<button type="button" class="aog-pop-btn" data-link="' + esc(c.id) + '">' + esc(T("Copy this class's check-in link", "Copiar el enlace de esta clase")) + "</button>" +
          "</div>" +
          sigs;

        box.querySelectorAll("[data-assign]").forEach(function (b) {
          b.addEventListener("click", function () { assign(b.getAttribute("data-assign"), "checkin"); renderStrip(); });
        });
        box.querySelectorAll("[data-unassign]").forEach(function (b) {
          b.addEventListener("click", function () { unassign(b.getAttribute("data-unassign")); renderStrip(); });
        });
        box.querySelectorAll("[data-go]").forEach(function (b) {
          b.addEventListener("click", function () {
            var q = b.getAttribute("data-go"), g = b.getAttribute("data-grade");
            if (window.aogGoConstruct) window.aogGoConstruct(q, g || "");
            else if (window.aogGoLibrary) window.aogGoLibrary();
          });
        });
        box.querySelectorAll("[data-students]").forEach(function (b) {
          b.addEventListener("click", function () { if (window.aogSetDashMode) window.aogSetDashMode("student"); });
        });
        box.querySelectorAll("[data-link]").forEach(function (b) {
          b.addEventListener("click", function () {
            var url = linkFor(classById(b.getAttribute("data-link")));
            if (!url) { b.textContent = T("Only on the live site", "Solo en el sitio publicado"); return; }
            try {
              navigator.clipboard.writeText(url).then(function () {
                var was = b.textContent; b.textContent = T("Copied", "Copiado");
                setTimeout(function () { b.textContent = was; }, 1400);
              });
            } catch (e) {}
          });
        });
      }

      /* ONE builder, not a second link system. This borrows the check-in
         layer's own exported builder and only adds the class context, exactly
         as Today's Picture does. On file:// it returns "" and the button says
         so rather than handing out a dead link. */
      function linkFor(c) {
        if (!c) return "";
        var base = (location.protocol === "http:" || location.protocol === "https:")
          ? (location.origin + location.pathname) : "";
        if (!base) return "";
        base = (typeof aogShareBase_ === "function" && aogShareBase_("checkin")) || base;
        var p = new URLSearchParams();
        p.set("checkin", "daily"); p.set("who", "student"); p.set("sync", "on");
        if (isEs()) p.set("lang", "es");
        if (c.schoolId) p.set("schoolId", c.schoolId);
        if (c.grade)    p.set("grade", c.grade);
        if (c.classId)  p.set("classId", c.classId);
        if (c.term)     p.set("term", c.term);
        if (c.period)   p.set("period", c.period);
        var org = (typeof aogOrgId_ === "function") ? aogOrgId_() : "";
        if (org) p.set("org", org);
        var _destP = (typeof aogDestParam_ === "function") ? aogDestParam_() : "";
        if (_destP) p.set(AOG_DEST_PARAM, _destP);
        return base + "?" + p.toString();
      }

      /* ============================================ SET UP ▸ MY CLASSES
         The roster is invisible infrastructure (section 30), so the place you
         build it is not the place you use it. This panel is where a teacher
         spends twenty minutes once; everything after that happens on the
         Overview without them thinking about a data structure again. */

      var editing = null;

      function fieldSel(id, label, opts, val) {
        return '<div class="field"><label for="' + id + '">' + esc(label) + "</label>" +
               '<select id="' + id + '">' + opts.map(function (o) {
                 return '<option value="' + esc(o.v) + '"' + (String(o.v) === String(val || "") ? " selected" : "") + ">" + esc(o.t) + "</option>";
               }).join("") + "</select></div>";
      }
      function fieldTxt(id, label, val, ph) {
        return '<div class="field"><label for="' + id + '">' + esc(label) + "</label>" +
               '<input type="text" id="' + id + '" autocomplete="off" value="' + esc(val || "") + '" placeholder="' + esc(ph || "") + '"></div>';
      }

      function renderPanel() {
        var panel = el("panel-classes");
        if (!panel) return;
        var list = classes(), c = editing ? (classById(editing) || null) : null;

        var pOpts = [{ v: "", t: T("No period", "Sin periodo") }].concat(PERIODS.map(function (p) {
          return { v: p.v, t: T(p.en, p.es) };
        }));
        var gOpts = [{ v: "", t: T("Any", "Cualquiera") }].concat(
          ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map(function (g) {
            return { v: g, t: T("Grade " + g, "Grado " + g) };
          }));

        var form =
          '<div class="table-card" style="padding:22px 26px;">' +
            "<h3 style=\"margin:0 0 4px;font-size:18px;\">" + esc(c ? T("Edit this class", "Editar esta clase") : T("Add a class", "Agregar una clase")) + "</h3>" +
            '<p class="small" style="margin:0 0 16px;color:var(--ink-faint);">' + esc(T(
              "Period and course are your own names for it. School ID, Class ID and term match the link and the Sheet, so a self-reflection from weeks ago can find this class.",
              "Periodo y curso son tus propios nombres. El ID de escuela, el ID de clase y el término coinciden con el enlace y la Hoja, para que una autorreflexión de hace semanas encuentre esta clase.")) + "</p>" +
            '<div class="pc-form">' +
              fieldSel("pcPeriod", T("Period", "Periodo"), pOpts, c && c.period) +
              fieldTxt("pcCourse", T("Course or class name", "Curso o nombre de la clase"), c && c.course, "ELA") +
              fieldSel("pcGrade", T("Grade", "Grado"), gOpts, c && c.grade) +
              fieldTxt("pcRoom", T("Room", "Salón"), c && c.room, "104") +
              fieldTxt("pcSchool", T("School ID", "ID de escuela"), c && c.schoolId, "NORTH-JH") +
              fieldTxt("pcClass", T("Class ID", "ID de clase"), c && c.classId, "ELA-3") +
              fieldTxt("pcTerm", T("Term", "Término"), c && c.term, "Fall 2026") +
              '<div class="field pc-full"><label for="pcCodes">' + esc(T("Student codes", "Códigos de estudiantes")) + "</label>" +
                '<textarea id="pcCodes" rows="3" style="width:100%;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;" placeholder="' +
                  esc(T("A104  A105  A106 — paste a column, a comma list, or one per line", "A104  A105  A106 — pega una columna, una lista o uno por línea")) + '">' +
                  esc((c && c.members || []).join(" ")) + "</textarea>" +
                '<div class="small" style="color:var(--ink-faint);margin-top:6px;">' + esc(T(
                  "Codes only, never names. The list that matches codes to children stays wherever your school keeps it. This site has no place for it and never asks.",
                  "Solo códigos, nunca nombres. La lista que une códigos con niños se queda donde tu escuela la guarde. Este sitio no tiene lugar para ella y nunca la pide.")) + "</div>" +
              "</div>" +
              '<div class="field pc-full" style="display:flex;gap:9px;flex-wrap:wrap;">' +
                '<button type="button" class="aog-pop-btn primary" id="pcSave">' + esc(c ? T("Save changes", "Guardar cambios") : T("Add this class", "Agregar esta clase")) + "</button>" +
                (c ? '<button type="button" class="aog-pop-btn" id="pcCancel">' + esc(T("Cancel", "Cancelar")) + "</button>" : "") +
              "</div>" +
            "</div>" +
          "</div>";

        var cards = list.length ? list.map(function (x) {
          var p = participation(x, { date: todayISO(), activity: "checkin" });
          var notes = privLoad();
          return '<div class="pc-card">' +
            "<h4>" + esc(classTitle(x)) + "</h4>" +
            '<div class="pc-meta">' + esc([bandLabel(x.grade), x.room, x.term, x.classId].filter(Boolean).join(" · ") ||
              T("no extra context", "sin contexto adicional")) + "</div>" +
            '<div style="font-size:13.5px;">' + esc(
              x.members.length
                ? x.members.length + T(" student codes", " códigos de estudiantes")
                : T("no codes yet", "aún sin códigos")) +
              (p.assigned ? esc(T(" · check-in assigned today", " · registro asignado hoy")) : "") + "</div>" +
            '<div class="pc-codes">' + x.members.slice(0, 40).map(function (m) {
              var n = notes[m];
              return '<span class="pc-code" title="' + esc(n || "") + '">' + esc(m) + (n ? " · " + esc(n) : "") + "</span>";
            }).join("") + (x.members.length > 40 ? '<span class="pc-code">+' + (x.members.length - 40) + "</span>" : "") + "</div>" +
            '<div class="pd-acts" style="margin-top:12px;">' +
              '<button type="button" class="aog-pop-btn" data-edit="' + esc(x.id) + '">' + esc(T("Edit", "Editar")) + "</button>" +
              '<button type="button" class="aog-pop-btn" data-notes="' + esc(x.id) + '">' + esc(T("Who is who (this device only)", "Quién es quién (solo este dispositivo)")) + "</button>" +
              '<button type="button" class="aog-pop-btn" data-del="' + esc(x.id) + '">' + esc(T("Remove", "Quitar")) + "</button>" +
            "</div>" +
            '<div class="pc-notes" data-notehost="' + esc(x.id) + '" style="display:none;margin-top:12px;"></div>' +
          "</div>";
        }).join("") : '<p class="small" style="color:var(--ink-faint);">' + esc(T(
          "No classes yet. Until you add one, nothing about the dashboard changes — the Overview counts what happened and does not divide it by anything.",
          "Aún no hay clases. Hasta que agregues una, nada cambia en el panel — el Panorama cuenta lo que pasó y no lo divide entre nada.")) + "</p>";

        panel.innerHTML =
          '<div class="section-head"><h2>' + esc(T("My classes", "Mis clases")) + "</h2>" +
            '<div class="small">' + esc(T(
              "A class here is just a setting, not a file on a child: a period, course, grade, term and the student codes in it. It lets the dashboard tell a quiet Period 3 from a Period 3 that was never sent a link.",
              "Una clase aquí es solo un contexto, no un expediente de un niño: un periodo, curso, grado, término y los códigos de estudiantes. Permite al panel distinguir un Periodo 3 tranquilo de un Periodo 3 que nunca recibió un enlace.")) + "</div></div>" +
          form +
          '<div class="section-head" style="margin-top:26px;"><h2>' + esc(T("Your classes", "Tus clases")) + "</h2>" +
            '<div class="small">' + esc(T(
              "Nothing is ranked or sorted by a score. Classes stay in the order you made them.",
              "Nada se clasifica ni se ordena por puntaje. Las clases quedan en el orden en que las creaste.")) + "</div></div>" +
          '<div class="pc-grid">' + cards + "</div>" +
          '<div class="section-head" style="margin-top:26px;"><h2>' + esc(T("Move this list", "Mover esta lista")) + "</h2>" +
            '<div class="small">' + esc(T(
              "One row for each student in each class, ready to open in your own Sheet. Codes and class details only. No names, no notes, and no record of who did or didn’t do anything.",
              "Una fila por cada estudiante en cada clase, lista para abrir en tu propia Hoja. Solo códigos y datos de la clase. Sin nombres, sin notas y sin registro de quién hizo o no hizo algo.")) + "</div></div>" +
          '<div class="pd-acts">' +
            '<button type="button" class="aog-pop-btn" id="pcCsv">' + esc(T("Download my classes (CSV)", "Descargar mis clases (CSV)")) + "</button>" +
            '<button type="button" class="aog-pop-btn" id="pcImp">' + esc(T("Import a CSV", "Importar un CSV")) + "</button>" +
            '<input type="file" id="pcFile" accept=".csv,text/csv" style="display:none">' +
          "</div>" +
          '<p class="small" style="margin-top:14px;color:var(--ink-faint);line-height:1.7;max-width:70ch;">' + esc(T(
            "What this never becomes: attendance, a behavior record, a participation grade, or a list anyone can rank. Absence is worked out fresh each time you look at it and is never written down, here or in your Sheet — because a stored absence turns into a fact about a child, and it is not one.",
            "En qué nunca se convierte: asistencia, un registro de conducta, una nota por participación o una lista que alguien pueda clasificar. La ausencia se calcula cada vez que la miras y nunca se guarda, ni aquí ni en tu Hoja — porque una ausencia guardada se convierte en un hecho sobre un niño, y no lo es.")) + "</p>";

        var save = el("pcSave");
        if (save) save.addEventListener("click", function () {
          function v(id) { var e = el(id); return e ? String(e.value || "").trim() : ""; }
          var rec = {
            id: c ? c.id : null, period: v("pcPeriod"), course: v("pcCourse"), grade: v("pcGrade"),
            room: v("pcRoom"), schoolId: v("pcSchool"), classId: v("pcClass"), term: v("pcTerm"),
            members: parseCodes(v("pcCodes"))
          };
          if (!rec.period && !rec.course && !rec.classId) return;
          upsertClass(rec);
          editing = null;
          renderPanel(); renderStrip();
          /* Today's Picture reads aogPopFoot on ITS next render, not on ours.
             Adding the first class has to bring the whole screen into step or
             the card keeps promising there is no roster while one exists. */
          try { if (window.refreshAdmin) window.refreshAdmin(); } catch (e) {}
        });
        var cancel = el("pcCancel");
        if (cancel) cancel.addEventListener("click", function () { editing = null; renderPanel(); });

        panel.querySelectorAll("[data-edit]").forEach(function (b) {
          b.addEventListener("click", function () { editing = b.getAttribute("data-edit"); renderPanel(); try { el("pcPeriod").focus(); } catch (e) {} });
        });
        panel.querySelectorAll("[data-del]").forEach(function (b) {
          b.addEventListener("click", function () {
            if (b.getAttribute("data-armed")) {
              removeClass(b.getAttribute("data-del")); editing = null; renderPanel(); renderStrip();
              try { if (window.refreshAdmin) window.refreshAdmin(); } catch (e) {}
              return;
            }
            b.setAttribute("data-armed", "1");
            b.textContent = T("Tap again to remove", "Toca otra vez para quitar");
          });
        });
        panel.querySelectorAll("[data-notes]").forEach(function (b) {
          b.addEventListener("click", function () { toggleNotes(b.getAttribute("data-notes")); });
        });

        var csv = el("pcCsv");
        if (csv) csv.addEventListener("click", function () {
          var blob = new Blob([toCsv()], { type: "text/csv;charset=utf-8" });
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "aog-classes-" + todayISO() + ".csv";
          document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
        });
        var imp = el("pcImp"), file = el("pcFile");
        if (imp && file) {
          imp.addEventListener("click", function () { file.click(); });
          file.addEventListener("change", function () {
            var f = file.files && file.files[0]; if (!f) return;
            var r = new FileReader();
            r.onload = function () {
              fromCsv(String(r.result || "")); editing = null; renderPanel(); renderStrip();
              try { if (window.refreshAdmin) window.refreshAdmin(); } catch (e) {}
            };
            r.readAsText(f);
          });
        }
      }

      /* WHO IS WHO — the only place a human word sits beside a code, and it
         lives in its own storage key so that no export, no CSV and no Sheet
         payload can reach it by walking the population object. There is a test
         that asserts exactly that. */
      function toggleNotes(id) {
        var host = document.querySelector('[data-notehost="' + String(id).replace(/"/g, "") + '"]');
        var c = classById(id);
        if (!host || !c) return;
        if (host.style.display !== "none") { host.style.display = "none"; host.innerHTML = ""; return; }
        var notes = privLoad();
        host.style.display = "";
        host.innerHTML =
          '<p class="small" style="color:var(--ink-faint);margin:0 0 8px;line-height:1.6;">' + esc(T(
            "This stays on this computer. It is never exported, never sent to your Sheet, never printed and never in a link. Clearing this browser clears it.",
            "Esto se queda en esta computadora. Nunca se exporta, nunca se envía a tu Hoja, nunca se imprime y nunca va en un enlace. Si borras este navegador, se borra.")) + "</p>" +
          c.members.map(function (m) {
            return '<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">' +
              '<span class="pc-code" style="min-width:74px;">' + esc(m) + "</span>" +
              '<input type="text" data-note="' + esc(m) + '" value="' + esc(notes[m] || "") + '" maxlength="40" style="flex:1;min-width:0;" ' +
                'placeholder="' + esc(T("first name, seat, whatever helps you", "nombre, asiento, lo que te ayude")) + '"></div>';
          }).join("");
        host.querySelectorAll("[data-note]").forEach(function (i) {
          i.addEventListener("change", function () { privSet(i.getAttribute("data-note"), i.value); });
        });
      }

      /* =============================================================== WIRING
         Everything above is inert until something calls it. The dashboard
         already has one redraw entry point — refreshAdmin — and both surfaces
         hang off it, so a tab change, a role change and a data pull all bring
         these up to date without a second scheduler. */

      /* The two places the product tells a teacher, in Jimmy's words, that it
         keeps no roster on purpose. Both stay literally true when no class
         exists — which is every teacher until they decide otherwise — and
         both are amended, not replaced, the moment one does. The promise did
         not change: a fraction still requires a denominator a person
         declared. */
      window.aogPopFoot = function (T2) {
        var n = classes().length;
        if (!n) return "";
        return T2(
          "Counts, never fractions — on this card. You have set up " + n + (n === 1 ? " class" : " classes") + " of your own, and a number out of a class list appears only up there, only for a class you built and only for a day you handed something out. A blank is still not evidence of anything. Nothing on this card ranks students, and no student is named.",
          "Conteos, nunca fracciones — en esta tarjeta. Tienes " + n + (n === 1 ? " clase" : " clases") + " propias, y un número sobre una lista aparece solo arriba, solo para una clase que tú creaste y solo para un día en que repartiste algo. Un espacio en blanco sigue sin ser evidencia de nada. Nada en esta tarjeta clasifica a los estudiantes ni los nombra."
        );
      };
      window.aogPopListNote = function (T2) {
        if (!classes().length) return "";
        return T2(
          "no ranking, and no “missing” filter — a class list lives in Set up ▸ My classes, and not being on one is not a finding",
          "sin clasificación y sin filtro de “faltantes” — la lista de clase está en Configurar ▸ Mis clases, y no estar en una no es un hallazgo"
        );
      };

      function paintTabCopy() {
        try {
          TAB_HINTS.classes = {
            en: "Set up the classes you teach, so the dashboard knows who was expected where.",
            es: "Configura las clases que enseñas, para que el panel sepa quién se esperaba dónde."
          };
        } catch (e) {}
        try {
          TAB_HELP.classes = {
            en: "<h5>My classes — context, not a file on a child</h5>A class here is a <strong>period, a course, a grade, a term</strong> and the pseudonymous <strong>codes</strong> that belong to it. It exists so the dashboard can tell a quiet Period 3 apart from a Period 3 nobody handed anything to. <strong>Codes only — no names.</strong> Absence is worked out fresh each time you look and is never written down.",
            es: "<h5>Mis clases — contexto, no un expediente sobre un niño</h5>Una clase aquí es un <strong>periodo, un curso, un grado, un término</strong> y los <strong>códigos</strong> seudónimos que le pertenecen. Existe para que el panel distinga un Periodo 3 tranquilo de uno al que nadie le repartió nada. <strong>Solo códigos — sin nombres.</strong> La ausencia se calcula cada vez que la miras y nunca se guarda."
          };
        } catch (e) {}
      }

      function draw() {
        try { renderStrip(); } catch (e) {}
        try { if (el("panel-classes")) renderPanel(); } catch (e) {}
      }

      function wrapRefresh() {
        if (typeof window.refreshAdmin !== "function" || window.refreshAdmin.__pop) return false;
        var orig = window.refreshAdmin;
        window.refreshAdmin = function () {
          var r = orig.apply(this, arguments);
          try { draw(); } catch (e) {}
          return r;
        };
        window.refreshAdmin.__pop = true;
        return true;
      }

      function init() {
        paintTabCopy();
        if (!wrapRefresh()) {
          /* refreshAdmin is defined in the main body and is there long before
             this runs; the retry is belt and braces for a slow parse. */
          var tries = 0, iv = setInterval(function () {
            if (wrapRefresh() || ++tries > 40) clearInterval(iv);
          }, 120);
        }
        /* A real click on Overview or My classes redraws immediately rather
           than waiting for whatever else refreshAdmin is doing. */
        document.addEventListener("click", function (e) {
          var t = e.target && e.target.closest && e.target.closest(".tab[data-tab]");
          if (!t) return;
          var name = t.getAttribute("data-tab");
          if (name === "overview" || name === "classes") setTimeout(draw, 0);
        });
        setTimeout(draw, 200);
      }

      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(init, 240); });
      else setTimeout(init, 240);

      /* The public surface. Deliberately small, and deliberately read-only
         about participation: there is a way to ASK what the states are and no
         way to STORE what they were. */
      window.AOGPop = {
        classes: classes, classById: classById, upsertClass: upsertClass, removeClass: removeClass,
        parseCodes: parseCodes, ctxKey: ctxKey, memberKey: memberKey,
        assign: assign, unassign: unassign, assignments: assignments, assignFor: assignFor,
        events: eventsFor, participation: participation, signals: signals,
        serializeRows: serializeRows, toCsv: toCsv, fromCsv: fromCsv,
        bandLabel: bandLabel, classTitle: classTitle, linkFor: linkFor,
        render: draw, COLS: COLS,
        KEYS: { population: POP, deviceOnlyNotes: PRIV, assignments: ASGN }
      };
    })();
    