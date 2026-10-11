
(function () {
  "use strict";

  /* ---------------------------------------------------------------- basics */
  var DKEY  = "aog.daily.v1";        /* the Daily log's own store — shared */
  var QKEY  = "aog.checkin.queue";   /* rows that have not reached the Sheet */
  var RKEY  = "aog.checkin.remote";  /* rows pulled back from the Sheet */
  var MEKEY = "aog.checkin.me";      /* this adult, remembered on this device */

  function T(en, es) {
    try { return (typeof DT === "function") ? DT(en, es) : en; } catch (e) { return en; }
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
    });
  }
  function el(id) { return document.getElementById(id); }
  function todayISO() {
    var d = new Date(), m = d.getMonth() + 1, da = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (da < 10 ? "0" + da : da);
  }
  function lsGet(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function ss(k) { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function jload(k, fb) { try { return JSON.parse(localStorage.getItem(k) || "") || fb; } catch (e) { return fb; } }
  function jsave(k, o) { try { localStorage.setItem(k, JSON.stringify(o)); } catch (e) {} }

  /* The sync destination. SCHOOL_SYNC_URL is a top-level `let`, so it is in the
     global lexical scope and readable here — the same way the identity block
     above reads it. Fall back to the site config if it has not resolved yet. */
  function destination() {
    var url = "", key = "";
    try { if (typeof SCHOOL_SYNC_URL !== "undefined") { url = SCHOOL_SYNC_URL || ""; key = SCHOOL_SYNC_KEY || ""; } } catch (e) {}
    /* ⚠ This used to read window.AOG_SYNC_DEFAULTS.url straight off the
       object, which skipped the `schools` gate the reflection path honors —
       so with a narrowed list a check-in would post where a reflection would
       not. It now asks the same resolver as everything else, which is also
       what makes the registry apply here. 2026-08-28. */
    if (!url) {
      var _d = null;
      try { _d = (typeof aogResolveDestination_ === "function") ? aogResolveDestination_() : null; } catch (e) {}
      if (_d) { url = _d.url || ""; key = _d.key || ""; }
    }
    return { url: url, key: key };
  }

  /* ------------------------------------------------- launch params, extended
     parseLaunchParams() is WRAPPED, never edited. Its six keys keep behaving
     exactly as before; these five are read alongside them. */
  var CI_KEYS = {
    checkinType:   "aog.launch.checkinType",
    assignmentId:  "aog.launch.assignmentId",
    trackingGroup: "aog.launch.trackingGroup",
    term:          "aog.launch.term",
    period:        "aog.launch.period",
    staffRole:     "aog.launch.staffRole",
    who:           "aog.launch.who"
  };

  function readCheckinParams() {
    var p;
    try { p = new URLSearchParams(window.location.search); } catch (e) { return; }
    /* "checkin" is the friendly spelling; "checkinType" also accepted. */
    var t = p.get("checkin") || p.get("checkinType") || "";
    if (t) ssSet(CI_KEYS.checkinType, String(t).slice(0, 32).toLowerCase());
    ["assignmentId", "trackingGroup", "term", "period", "staffRole", "who"].forEach(function (k) {
      var v = p.get(k);
      if (v != null && v !== "") ssSet(CI_KEYS[k], String(v).slice(0, 64));
    });
  }

  /* ============================ THE STAFF-LINK TOKEN ========================
     Added 2026-08-25. A student could edit their own classroom link to
     ?checkin=support&who=staff and be handed the ADULT observation form: a
     dropdown of every student code on that device, a free-text note, a
     follow-up flag, and a live write to the school's Sheet signed with any
     name they typed. Proven in a browser, not theorized.

     ⚠ WHAT THIS TOKEN IS. It is a keyed checksum computed in the page, so a
     person who reads the bundle can compute one too. It is NOT authentication
     and must never be described as such. What it does is raise the bar from
     "type who=staff into the address bar" — which a thirteen-year-old will do
     on a dare — to "read a 4 MB bundle and reimplement a hash", which is a
     different population. With no server there is no stronger option; the real
     fix would be a district Google sign-in, which is [[aog-checkin-layer]]'s
     standing open item for the parent role too.

     ⚠ THE GRACE PERIOD. Links already handed out carry no token. Until
     STAFF_LINK_GRACE_UNTIL they still work and the screen says they need
     regenerating; after it they are treated as ordinary student links. Move
     the date, do not delete the check. */
  var STAFF_LINK_PEPPER = "AoG-staff-link-v1";
  var STAFF_LINK_GRACE_UNTIL = "2026-10-15";

  function staffTokenFor(parts) {
    var msg = STAFF_LINK_PEPPER + "|" + parts.join("|");
    var h1 = 5381, h2 = 52711;
    for (var i = 0; i < msg.length; i++) {
      var c = msg.charCodeAt(i);
      h1 = ((h1 << 5) + h1 + c) | 0;
      h2 = ((h2 << 5) + h2 + (c ^ 0x5f)) | 0;
    }
    return ((h1 >>> 0).toString(36) + (h2 >>> 0).toString(36)).slice(0, 12);
  }
  function staffTokenParts(schoolId, classId, type) {
    return [String(type || "support"), String(schoolId || ""), String(classId || "")];
  }
  function graceStillOpen() {
    try {
      var d = new Date(); var iso = d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      return iso <= STAFF_LINK_GRACE_UNTIL;
    } catch (e) { return true; }
  }
  function staffTokenOk() {
    var p; try { p = new URLSearchParams(window.location.search); } catch (e) { return false; }
    var got = p.get("sk") || "";
    var want = staffTokenFor(staffTokenParts(p.get("schoolId"), p.get("classId"), p.get("checkin") || p.get("checkinType")));
    if (got && got === want) return true;
    /* ⚠ THE GRACE PERIOD MUST NOT REOPEN THE HOLE IT IS PATCHING.
       A first cut accepted ANY token-less staff link until the cut-off, which
       meant a student typing ?who=staff was waved through for seven weeks —
       the whole pilot. Grace now applies only to links that were actually
       BUILT by the Distribute card: every one of those carries an
       assignmentId in the AOG-XXXXX shape, because the plan field is
       pre-filled by planId(). A hand-typed URL has no such thing. */
    if (!got && graceStillOpen()) {
      var plan = p.get("assignmentId") || "";
      if (/^AOG-[A-Z0-9]{5}$/.test(plan)) return "grace";
    }
    return false;
  }
  window.aogStaffTokenFor = function (schoolId, classId, type) {
    return staffTokenFor(staffTokenParts(schoolId, classId, type));
  };

  function ciType() { return ss(CI_KEYS.checkinType); }
  function ciWho()  { return (ss(CI_KEYS.who) || "").toLowerCase(); }

  /* ⚠ NOT MY LINK. `who` says WHO is answering; it never says WHICH
     instrument. The Exit Slip link the Distribute card builds carries
     `who=student` for exactly the same honest reason the check-in link does —
     a student is the one filling it in — and `isStudentLink()` used to read
     that one word and claim the link.

     Reported 2026-08-28: an exit-slip link opened on "Daily check-in ·
     What's your student code?". BOTH LAYERS BOOTED AND BOTH RENDERED THEIR
     OWN CODE SCREEN INTO THE SAME TAB, and which one a student saw came down
     to a 20-MILLISECOND RACE — the check-in re-asserts at 240 ms, the slip at
     260 ms — so it landed differently on different machines and looked
     intermittent. The proof is that the check-in's screen was in the DOM,
     fully rendered, on a link that had no `checkin=` on it at all.

     THE INVARIANT WAS ALREADY WRITTEN DOWN — "NEVER checkin= AND exit= ON ONE
     LINK, each boots its own screen on load" — and it was only ever enforced
     on the BUILDER. Nothing stopped a reader from claiming the other's link.
     Now the check-in stands down whenever the URL says exit slip, which is
     the one thing that can never be true of its own link.

     Read from the URL rather than from the slip module's sessionStorage key:
     this runs at boot, and the module that sets that key is defined ~10,000
     lines further down the file. Same accepted spellings as isSlipLink(). */
  function slipLinkOnUrl() {
    var v = "";
    try {
      var p = new URLSearchParams(window.location.search);
      v = String(p.get("exit") || p.get("slip") || "").toLowerCase();
    } catch (e) {}
    if (!v) { try { v = String(sessionStorage.getItem("aog.launch.exitSlip") || "").toLowerCase(); } catch (e2) {} }
    return v === "1" || v === "exit" || v === "on" || v === "true" || v === "yes";
  }

  /* One link grammar, two audiences. `who` is explicit on every link the
     Distribute card builds; the fallbacks below only matter for a link typed
     by hand. A support or targeted check-in is an adult describing a student,
     so those default to staff; a bare daily check-in is the student's own. */
  function isStudentLink() {
    if (slipLinkOnUrl()) return false;
    if (ciWho() === "student") return true;
    if (ciWho() === "staff" || ciWho() === "adult") return false;
    return ciType() === "daily";
  }
  function isStaffLink() {
    if (slipLinkOnUrl()) return false;
    if (!ciType()) return false;
    if (isStudentLink()) return false;
    var t = ciType();
    if (!(t === "support" || t === "targeted" || t === "staff" || t === "daily")) return false;
    /* A hand-typed who=staff no longer earns the adult form. */
    return staffTokenOk() !== false;
  }
  /* True when this adult arrived on a link built before the token existed. */
  function staffLinkNeedsRegenerating() { return staffTokenOk() === "grace"; }

  /* Wrap parseLaunchParams so the check-in keys are read on every call. */
  (function wrapLaunch() {
    if (typeof window.parseLaunchParams === "function" && !window.parseLaunchParams.__aogCheckin) {
      var orig = window.parseLaunchParams;
      var wrapped = function () {
        var r = orig.apply(this, arguments);
        try { readCheckinParams(); } catch (e) {}
        return r;
      };
      wrapped.__aogCheckin = true;
      window.parseLaunchParams = wrapped;
    }
    /* The original may already have run before this script parsed, so read now
       as well. Reading twice is harmless — it writes the same values. */
    readCheckinParams();
  })();

  /* --------------------------------------------- the check-in question set
     ⚠ THE SECOND COPY IS GONE. Until .29al this block held its own framework
     table, its own grade bands and its own Spanish bands -
     the same sentences the Daily log held, in a second place, with a test
     (t106) whose only job was to notice when the two drifted apart. They are on window.AOG_OBS now, defined once in the
     Daily-log block earlier in this document and read by both screens, so the
     drift that test guarded against cannot happen. t106 asserts the single
     source instead.

     ⚠ THIS IS A HARD DEPENDENCY, NOT A FALLBACK. A local copy kept "just in
     case" is the bug, not the safety net. If AOG_OBS is missing the screen
     renders its identity, its note and its follow-up and says so, which is
     visible - a silent second wording is not. */
  var BAND_LABEL = { k2: "K–2", "35": "3–5", "68": "6–8", "910": "9–10", "1112": "11–12" };
  var CHECK_ORDER = ["regulated", "usedStrategy", "connected"];

  function isEs() {
    try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; }
    catch (e) { return false; }
  }
  function bandFor(grade) {
    var g = String(grade == null ? "" : grade).trim().toLowerCase().replace(/grade|gr\.?/g, "").trim();
    if (g.indexOf("adult") >= 0) return "1112";
    if (g === "k" || g === "kg" || g === "kinder") return "k2";
    var n = parseInt(g, 10);
    if (!isNaN(n)) {
      if (n <= 2) return "k2";
      if (n <= 5) return "35";
      if (n <= 8) return "68";
      if (n <= 10) return "910";
      return "1112";
    }
    return "";
  }

  /* ⚠ WHERE THE BAND COMES FROM, IN ORDER, AND WHY IT IS NOT A GUESS.
       1 · the link's own `grade` - whoever built the link said so;
       2 · what this adult last chose on this device;
       3 · nothing, and the screen ASKS.

     Until .29am step 3 was `return "68"` with a comment calling 6-8 "the
     honest default". It was honest when this product was one junior high. In
     a K-8 district it means a first-grade teacher opens a link that carries no
     grade and is asked middle-school questions under a chip that confidently
     reads 6-8. A default that renders as a finding is the same class of bug as
     a clamp: the screen is asserting something nobody told it.

     ⚠ THE ITEM KEYS ARE THE SAME IN EVERY BAND. Only the wording moves, so
     changing the band mid-entry keeps every tick - see wireScreen. */
  var BANDKEY = "aog.checkin.band";
  function bandFromLink() {
    var g = ss("aog.launch.grade");
    return g ? bandFor(g) : "";
  }
  function bandRemembered() {
    var b = lsGet(BANDKEY);
    return (b && BAND_LABEL[b]) ? b : "";
  }
  function activeBand() { return bandFromLink() || bandRemembered() || "68"; }
  function bandIsChosen() { return !!(bandFromLink() || bandRemembered()); }
  /* AOG-CHECKIN-GRADES-V1 (2026-09-27) — Jimmy: the menu offers single grades, K to 12, not bands.
     The questions still come from the band: each grade maps to its band through bandFor(), and the
     band key above is still written, so everything that reads the band works as before. The grade is
     remembered on this device under its own key; an older device that only saved a band opens on that
     band's first grade. */
  var GRADEKEY = "aog.checkin.grade";
  var GRADES = ["k", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  var BAND_FIRST = { k2: "k", "35": "3", "68": "6", "910": "9", "1112": "11" };
  function gradeLabel(g) {
    if (g === "k") return T("Kindergarten", "Kínder");
    return T("Grade " + g, g + ".º");
  }
  function gradeNorm(v) {
    var g = String(v == null ? "" : v).trim().toLowerCase().replace(/grade|gr\.?/g, "").trim();
    if (g === "k" || g === "kg" || g === "kinder") return "k";
    return GRADES.indexOf(g) >= 0 ? g : "";
  }
  function gradeFromLink() { return gradeNorm(ss("aog.launch.grade")); }
  function gradeRemembered() {
    var g = gradeNorm(lsGet(GRADEKEY)), b = bandRemembered();
    if (g && (!b || bandFor(g) === b)) return g;
    return b ? BAND_FIRST[b] : "";
  }

  function checkDefs(band) {
    var es = isEs();
    var D = (window.AOG_OBS ? AOG_OBS.domains() : []);
    return D.map(function (d) {
      return { key: d.key, q: (es ? d.es : d.en), short: (es ? d.s_es : d.s_en),
               dom: (es ? d.es : d.en), fw: (es ? d.fw_es : d.fw_en) };
    });
  }
  var CHECK_ORDER_V2 = ["engaged", "regulated", "usedStrategy", "connected"];

  /* The ticks a teacher reads. `wantFlags` picks the unscored group, which is
     rendered lower down the card, next to the note and the follow-up request,
     because that is what it is: a person passing a note, not a measurement.

     ⚠ THE WHOLE CARD IS THE TAP TARGET, NOT THE 22px BOX. This gets used on a
     phone in a hallway between classes. */
  function ciObsHtml(band, wantFlags) {
    if (!window.AOG_OBS) return "";
    var es = isEs();
    return AOG_OBS.groups(band, es).filter(function (g) {
      return wantFlags ? g.flag : !g.flag;
    }).map(function (g) {
      var rows = g.items.map(function (it) {
        var attr = it.flag ? 'data-ciflag="' + esc(it.k) + '"' : 'data-ciobs="' + esc(it.k) + '"';
        return '<label class="ci-chk' + (it.flag ? " flag" : "") + '" title="' + esc(it.fw || "") + '">' +
               '<input type="checkbox" ' + attr + '>' +
               '<span class="q">' + esc(it.q) +
               (it.domLabel ? '<span class="d">' + esc(it.domLabel) + "</span>" : "") +
               "</span></label>";
      }).join("");
      return '<div class="ci-group">' +
        '<p class="ci-ghead">' + esc(g.title) + "</p>" +
        (g.sub ? '<p class="ci-gsub">' + esc(g.sub) + "</p>" : "") +
        '<div class="ci-checks">' + rows + "</div></div>";
    }).join("");
  }

  /* checkinType — the only branching in the whole layer. Adding a type is
     adding one entry here; nothing else in this file knows the list. */
  var TYPES = {
    daily:    { en: "Daily check-in",           es: "Registro diario",
                lede_en: "One quick read of how today went.",
                lede_es: "Una lectura rápida de cómo fue el día." },
    targeted: { en: "Targeted check-in",        es: "Registro focalizado",
                lede_en: "A closer look for a student a team is watching.",
                lede_es: "Una mirada más cercana para un estudiante en seguimiento." },
    support:  { en: "Student support check-in", es: "Registro de apoyo",
                lede_en: "Each adult logs what they saw. The pattern across the day is the point — not any one entry.",
                lede_es: "Cada adulto registra lo que vio. El patrón del día es lo importante — no una sola entrada." },
    staff:    { en: "Staff check-in",           es: "Registro del personal",
                lede_en: "Log what you saw this period.",
                lede_es: "Registra lo que viste en este periodo." }
  };
  function typeMeta(t) { return TYPES[t] || TYPES.support; }

  /* ⚠ ADDITIVE ONLY. `respondentRole` is a documented column in the Sheet
     and a value already written into thousands of rows; a new value is safe,
     a renamed one is not. `related_service` is the one this list was actually
     missing - a speech, OT or PT provider sees this student weekly and had to
     file themselves under "other staff".

     A subject is NOT a role. What a teacher teaches is already on the row, in
     the period and the class, and putting fourteen subjects in this menu
     would make an eight-second question a thirty-second one. */
  var ROLES = [
    { v: "teacher",           en: "Teacher",                     es: "Docente" },
    { v: "special_educator",  en: "Special educator",            es: "Educador/a especial" },
    { v: "related_service",   en: "Related service provider",    es: "Proveedor/a de servicios relacionados" },
    { v: "social_worker",     en: "Social worker / counselor",   es: "Trabajador/a social o consejero/a" },
    { v: "admin",             en: "Administrator",               es: "Administrador/a" },
    { v: "other_staff",       en: "Other staff",                 es: "Otro personal" }
  ];
  function roleLabel(v) {
    for (var i = 0; i < ROLES.length; i++) if (ROLES[i].v === v) return T(ROLES[i].en, ROLES[i].es);
    return v || T("Adult", "Adulto");
  }
  /* The Daily Log renders rows this layer wrote and needs to name their author
     in the reader's language. Exported rather than duplicated - a second copy
     of the role list is the drift this product keeps paying for. */
  window.aogRoleLabel = roleLabel;

  var PERIOD_DEFS = (function () {
    var out = [{ n: 0, store: "Advisory", en: "Period 0 · Advisory", es: "Periodo 0 · Asesoría" }];
    for (var i = 1; i <= 10; i++) {
      out.push({ n: i, store: "Period " + i, en: "Period " + i, es: "Periodo " + i });
    }
    return out;
  })();
  function periodLabelFor(store) {
    for (var i = 0; i < PERIOD_DEFS.length; i++) if (PERIOD_DEFS[i].store === store) return T(PERIOD_DEFS[i].en, PERIOD_DEFS[i].es);
    return store || "";
  }
  function periodNumFor(store) {
    for (var i = 0; i < PERIOD_DEFS.length; i++) if (PERIOD_DEFS[i].store === store) return PERIOD_DEFS[i].n;
    return "";
  }
  /* The stored values, for anything that just needs the list. */
  var PERIODS = PERIOD_DEFS.map(function (p) { return p.store; });

  /* --------------------------------------------------------------- the store
     Written in the Daily log's own shape so its panel, its trend, its history
     and its CSV export all see link-submitted entries with no change to them.
     The extra fields ride alongside; periodStats() reads named booleans and
     ignores everything it does not recognize. */
  function dailyLoad() { return jload(DKEY, {}); }
  function dailySave(o) { jsave(DKEY, o); }

  function saveEntry(rec) {
    var store = dailyLoad();
    if (!store.logs) store.logs = {};
    if (!store.logs[rec.studentId]) store.logs[rec.studentId] = {};
    if (!store.logs[rec.studentId][rec.date]) store.logs[rec.studentId][rec.date] = { periods: [] };
    var day = store.logs[rec.studentId][rec.date];
    if (!day.periods) day.periods = [];
    day.periods.push({
      /* --- the shape the Daily log has always written --- */
      period:       rec.period,
      /* ⚠ `engaged` MUST BE PRESENT, even when false. periodStats() decides
         whether to score a period out of three or four by asking whether the
         record HAS this field, so an entry that omits it would be read as a
         pre-.29al row and quietly scored out of three. */
      engaged:      !!rec.engaged,
      regulated:    !!rec.regulated,
      usedStrategy: !!rec.usedStrategy,
      connected:    !!rec.connected,
      obs:          (rec.obs || []).slice(),
      flags:        (rec.flags || []).slice(),
      obsSchema:    "v2",
      note:         rec.note || "",
      timestamp:    rec.timestamp,
      /* --- new, ignored by every existing reader --- */
      slipType:       rec.slipType || "checkin",
      checkinType:    rec.checkinType,
      respondentId:   rec.respondentId,
      respondentRole: rec.respondentRole,
      /* Class context on the LOCAL row too, not only on the Sheet payload.
         It always rode the wire and was dropped on the way into this store,
         so an adult's observation could never be placed in a class the way a
         student's own check-in could. Additive: every existing reader ignores
         a field it does not know about. 2026-08-27, population layer. */
      schoolId:       rec.schoolId || "",
      classId:        rec.classId || "",
      grade:          rec.grade || "",
      assignmentId:   rec.assignmentId || "",
      trackingGroup:  rec.trackingGroup || "",
      term:           rec.term || "",
      year:           rec.year || "",
      followUp:       !!rec.followUp,
      source:         rec.source || "link"
    });
    dailySave(store);
  }

  /* ----------------------------------------------------------------- the wire
     Same discipline as syncRecord(), for the same reasons:
       · cors first, so the reply can actually be read
       · a CORS failure means the POST WAS delivered and only the reply was
         blocked, so we never re-send — re-sending is the only way to make a
         duplicate row
       · genuinely offline (navigator.onLine === false) keeps it queued
     The only differences are action:"checkin" and the separate tab. */
  function queueGet() { return jload(QKEY, []); }
  function queuePush(rec) { var q = queueGet(); q.push(rec); jsave(QKEY, q); }
  function queueDrop(rec) {
    jsave(QKEY, queueGet().filter(function (r) {
      return !(r.timestamp === rec.timestamp && r.studentId === rec.studentId);
    }));
  }

  function payloadFor(rec) {
    var d = destination();
    var student = rec.respondentRole === "student";
    /* A student's row leaves the three adult observations EMPTY, never false.
       An empty cell reads back as null; FALSE would drop a day the student
       described into an adult's trend as three zeros. */
    var obs = function (k) { return student ? "" : !!rec[k]; };
    /* ⚠ THE DENOMINATOR BELONGS TO THE ROW, NOT TO THE BUILD READING IT. A
       v2 row carries four domains and is a percentage of four; anything
       older is a percentage of three. `obsSchema` in `extra` says which, so
       nobody downstream has to guess, and no row already in the Sheet
       changes meaning because a newer build shipped. */
    var order = (rec.obsSchema === "v2") ? CHECK_ORDER_V2 : CHECK_ORDER;
    var pct = student ? "" : Math.round(
      (order.filter(function (k) { return !!rec[k]; }).length / order.length) * 100
    );
    /* ⚠ A NEW FIELD DOES NOT HAVE TO MEAN A NEW COLUMN. `extra` is JSON and
       exists for exactly this; .29ac used it the same way for the colleague
       counts. Adding real columns would mean SCRIPT_VERSION 8 and every
       school re-pasting the Apps Script, for data that reads perfectly well
       from here. */
    var extraJson = "";
    if (!student) {
      try {
        extraJson = JSON.stringify({
          obsSchema: "v2",
          engaged:   !!rec.engaged,
          obs:       rec.obs || [],
          flags:     rec.flags || [],
          pctOf:     order.length
        });
      } catch (e) { extraJson = ""; }
    }
    /* THIS IS ME rides the same rails — .29ac's own precedent: `extra` is
       JSON and exists for exactly this. A caller that built its own extra
       (the student's kept lines) is carried verbatim; nothing else changes
       shape, and script v8 stores and returns it untouched. */
    if (rec.extraJson) extraJson = rec.extraJson;
    return {
      action: "checkin",
      passcode: d.key,
      _backendAuth: d.key,
      timestamp:      rec.timestamp,
      date:           rec.date,
      slipType:       rec.slipType || "checkin",
      checkinType:    rec.checkinType,
      assignmentId:   rec.assignmentId || "",
      trackingGroup:  rec.trackingGroup || "",
      term:           rec.term || "",
      districtId:     rec.districtId || "",
      schoolId:       rec.schoolId || "",
      classId:        rec.classId || "",
      grade:          rec.grade || "",
      period:         rec.period || "",
      periodNum:      rec.period ? periodNumFor(rec.period) : "",
      studentId:      rec.studentId,
      respondentRole: rec.respondentRole || "teacher",
      respondentId:   rec.respondentId || "",
      regulated:      obs("regulated"),
      usedStrategy:   obs("usedStrategy"),
      connected:      obs("connected"),
      pct:            pct,
      note:           rec.note || "",
      followUp:       !!rec.followUp,
      source:         rec.source || "link",
      /* the student's own seven answers; blank on an adult's row */
      arrival:        rec.arrival == null ? "" : rec.arrival,
      feelingWords:   rec.feelingWords || "",
      need:           rec.need || "",
      connection:     rec.connection == null ? "" : rec.connection,
      challenge:      rec.challenge || "",
      challengeImpact: rec.challengeImpact == null ? "" : rec.challengeImpact,
      readiness:      rec.readiness == null ? "" : rec.readiness,
      contextTag:     rec.contextTag || "",
      tellAdult:      rec.tellAdult || "",
      agency:         rec.agency || "",
      extra:          extraJson
    };
  }

  function syncCheckin(rec) {
    var d = destination();
    if (!d.url || !d.key) return Promise.resolve(false);
    var body = JSON.stringify(payloadFor(rec));
    return fetch(d.url, {
      method: "POST",
      mode: "cors",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: body
    }).then(function (res) {
      return res.text();
    }).then(function (txt) {
      var out = null;
      try { out = JSON.parse(txt); } catch (e) {}
      if (out && out.ok) { queueDrop(rec); return "sent"; }
      /* The script answered and said no — almost always an Apps Script that
         predates the check-in branch. Waiting for the network will not fix
         that, so do not tell the teacher it will. */
      return "rejected";
    }).catch(function () {
      /* ⚠⚠ .30dj · THIS USED TO ANSWER "sent" AND DELETE THE ROW IN THE SAME
         BREATH. The reasoning was that a rejected fetch means the POST was
         delivered and only the CORS reply was blocked, so a re-send could only
         make a duplicate. That is ONE cause out of many and not the common one
         on a school network: a filtered host, a captive portal, a proxy that
         drops the redirect to script.googleusercontent.com, a reset connection
         and a DNS failure all reject in exactly the same shape — and
         navigator.onLine is TRUE for every one of them, because it means "this
         device has a network interface", never "the internet answered". So a
         student read "Sent to your teacher ✓" for a row no Sheet ever received,
         and the only copy of it was deleted as it was read.
         It stays queued now and is retried. A retry that duplicates is
         survivable — every pull path merges on studentId + timestamp, and the
         timestamp is fixed when the record is MADE, not when it is sent, so a
         second copy of the same row lands on the same key and is dropped. A
         row that was thrown away is not survivable. Keep the row. */
      return "offline";
    });
  }

  function flushCheckins() {
    if (navigator.onLine === false) return Promise.resolve();
    var q = queueGet();
    if (!q.length) return Promise.resolve();
    return q.reduce(function (p, rec) {
      return p.then(function () { return syncCheckin(rec); });
    }, Promise.resolve());
  }
  window.addEventListener("online", function () { flushCheckins(); });
  /* .30dj · A DEVICE THAT NEVER WENT OFFLINE NEVER FIRES "online". Now that a
     failed send stays queued, the only thing that emptied this queue was a
     transition a Chromebook on a flaky-but-connected network has no reason to
     make, so a held row would have waited for ever. Retry when the tab comes
     back to the front, which is what actually happens between one period and
     the next. Cheap: it returns immediately on an empty queue. */
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") { try { flushCheckins(); } catch (e) {} }
  });

  /* THIS IS ME → the Sheet. Only lines the student KEPT for the page — the
     keep-private lines and every deletion never leave the device. Queued
     offline like any check-in; the row lands on the DailyCheckins tab with
     checkinType "thisisme" and the page inside `extra`, and comes home
     through the same Pull the teacher rows ride. */
  window.aogSendTimRow = function (rec) {
    rec = rec || {};
    rec.slipType = "thisisme";
    rec.checkinType = "thisisme";
    rec.respondentRole = "student";
    rec.timestamp = rec.timestamp || new Date().toISOString();
    rec.date = rec.date || todayISO();
    queuePush(rec);
    return syncCheckin(rec);
  };

  /* ------------------------------------------------------------- reading back
     Gated by ADMIN_PULL_KEY exactly like pullFromSheet, and for the same
     reason: the published write key must never be able to read a child's day
     back out of the Sheet. No device passcode, no request — the same rule the
     screener pull already follows. */
  function deviceReadKey() { return (lsGet("aog.sync.key") || "").trim(); }

  window.aogPullCheckins = function () {
    var d = destination();
    var key = deviceReadKey();
    if (!d.url) {
      return Promise.resolve({ ok: false, error: T(
        "This is a local-only copy — no central sheet is configured.",
        "Esta es una copia solo local — no hay hoja central configurada.") });
    }
    if (!key) {
      return Promise.resolve({ ok: false, error: T(
        "This computer isn’t connected for reading yet. Set up ▸ Connect your Sheet, and put your ADMIN_PULL_KEY in the Passcode box.",
        "Esta computadora aún no está conectada para leer. Configurar ▸ Conecta tu Hoja y pon tu ADMIN_PULL_KEY en el campo de contraseña.") });
    }
    return fetch(d.url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "pullCheckins", passcode: key })
    }).then(function (r) { return r.json(); }).then(function (out) {
      if (out && out.error) return { ok: false, error: String(out.error) };
      if (!out || !("checkins" in out)) {
        return { ok: false, error: T(
          "This Sheet’s script can’t send check-ins back yet. Paste the updated Apps Script, redeploy it as a NEW version, then try again.",
          "El script de esta hoja aún no puede devolver los registros. Pega el Apps Script actualizado, vuelve a desplegarlo como NUEVA versión e inténtalo otra vez.") };
      }
      var all = out.checkins || [];
      /* ⚠ A PRACTICE ROW MUST NEVER BE READ BACK AS A CHECK-IN. periodStats
         scores the three adult observations, and a practice row carries none
         of them — every finished set would land in the class trend as a zero.
         v9 returns them in their own list; a building still on v8 has them
         sitting in DailyCheckins with checkinType 'practice', so sweep both
         and let the two paths meet here. */
      var rows = [], stray = [];
      all.forEach(function (r) {
        if (String((r && r.checkinType) || "") === "practice") stray.push(r);
        else rows.push(r);
      });
      var practice = (out.practice || []).concat(stray);
      jsave(RKEY, rows);
      try { localStorage.setItem("aog.practice.remote", JSON.stringify(practice)); } catch (ePr) {}
      /* AOG-SHEET-WINS-V1 (2026-10-01) — Jimmy: "our Google Sheets says that there are no luke r but the pull is saying there are some." This device keeps copies of its own sends until the Sheet hands them back. After a good pull the Sheet is the record: a copy older than 15 minutes that the Sheet no longer has was deleted or renamed there, so it goes. */ try{ var cutM=Date.now()-15*60*1000, mineM=JSON.parse(localStorage.getItem("aog.practice.mine")||"[]"); localStorage.setItem("aog.practice.mine", JSON.stringify(mineM.filter(function(r){ var t=Date.parse((r&&r.timestamp)||""); return !isNaN(t)&&t>cutM; }))); }catch(eM){}
      mergeRemoteIntoDaily(rows);
      try { if (typeof window.aogRenderPractice === "function") window.aogRenderPractice(); } catch (ePr2) {}
      return { ok: true, count: rows.length, practice: practice.length };
    }).catch(function () {
      return { ok: false, error: T(
        "Couldn’t reach the sheet. Confirm the Web App is deployed to “Anyone” and try again.",
        "No se pudo conectar con la hoja. Confirma que la Web App esté desplegada para “Cualquiera” e inténtalo de nuevo.") };
    });
  };

  /* Pulled rows go to the store that matches WHO wrote them.
     An adult's observation joins aog.daily.v1, where the Daily log's existing
     panel, trend and CSV read it. A student's own check-in must NOT go there:
     periodStats() scores three adult observations out of three, so a student's
     row — which has none of them — would score every honest morning as 0% and
     pull the class trend down. It goes to its own store and meets the adult
     rows again on the timeline, where the two are rendered as what they are.
     De-duplicated on timestamp + student, the same key the screener merge uses. */
  /* A sent This Is Me page is NOT a check-in row. It is diverted into the
     builder's own store before role-routing can file it anywhere else —
     the same never-score logic that keeps a student's morning out of the
     adult trend. The newest sent snapshot per student wins (the student's
     device is the authority on their own page); the educator's local
     never-offer-again map is preserved. */
  function timIngestRemote(r) {
    try {
      var px = (typeof r.extra === "string") ? JSON.parse(r.extra || "{}") : (r.extra || {});
      if (!px || px.tim !== 1 || !Array.isArray(px.lines)) return;
      var sid = String(r.studentId || "").trim().toUpperCase();
      if (!sid) return;
      /* .30ea — a page a teacher removed on purpose must not come back.
         ⚠ THIS GUARD CANNOT LIVE IN mergeRemoteIntoDaily: the thisisme
         branch hands off to this function and RETURNS before the .30dp
         tombstone check ever runs. */
      try {
        var tg = jload("aog.thisisme.removed.v1", []) || [];
        for (var gi = 0; gi < tg.length; gi++) if (String(tg[gi]) === sid) return;
      } catch (eg) {}
      var st = jload("aog.thisisme.v1", { students: {} }) || { students: {} };
      if (!st.students) st.students = {};
      /* .30dj · file it under the key this store ALREADY uses for this child.
         The card used to look the student up by whatever the teacher typed, so
         a page arriving as JR14 beside a locally-built jr14 was two children.
         Normalized COMPARE, original key kept. */
      (function () {
        var ks = Object.keys(st.students);
        for (var i = 0; i < ks.length; i++) {
          if (String(ks[i]).trim().toUpperCase() === sid) { sid = ks[i]; return; }
        }
      })();
      var cur = st.students[sid] || {};
      var prevTs = String(cur.sentTs || "");
      var ts = String(r.timestamp || "");
      if (prevTs && ts && ts <= prevTs) return;   /* older than what we hold */
      /* .30eq · A PAGE SENT FROM THE FAMILY DOOR GOES BACK TO A FAMILY DOOR.
         Jimmy, with his children's pages sitting on the IEP card: "Can the
         family MY VOICE get sent to the FAMILY PAGE AND NOT THE IEP PAGE?
         It was hard to locate these." px.home is stamped by the family
         chip's send (.30en set S.home; .30eq put it on the row). A home row
         lands with sentFrom "home" AND s.fam set, which is exactly what the
         family who-door lists — so the page appears under Family → My Voice
         on THIS device, automatically, and the IEP card's inbox skips it.
         ⚠ cur.fam is carried forward either way: a page shared to the
         family once does not fall off the family door because the same
         child later sent from school. */
      st.students[sid] = {
        soma: px.soma || cur.soma || "",
        somaAt: ts,
        no: cur.no || {},
        sentTs: ts,
        sentFrom: px.home ? "home" : "link",
        fam: px.home ? ts : (cur.fam || ""),
        entries: px.lines.map(function (l, i) {
          return { id: "sent_" + ts + "_" + i, ts: ts, day: l.day || String(r.date || "").slice(0, 10),
                   sy: r.year || "", sec: l.sec || "str", pillar: l.pillar || "", text: String(l.text || ""),
                   st: "kept", src: l.src || { kind: "sent" } };
        })
      };
      jsave("aog.thisisme.v1", st);
    } catch (e) {}
  }

  /* ═══════════════════════════════════ REMOVING A CHECK-IN  ·  .30dp
     Jimmy, looking at his own results screen: "I thought we made a delete
     function on these and other pages."

     He was half right, and the half that was missing is the half he was
     looking at. .30dl gave the EXIT SLIP a per-slip Remove with an undo and
     a tombstone. AOGHomeCi can drop a student. Set up ▸ Export can sweep one
     code off the device. The daily CHECK-IN — the panel that had a tester
     name, two adults who are the same person twice and a 67% from a phone on
     a couch sitting in it — had nothing at all. Every number on that screen
     is read off these rows, so a tester does not merely clutter the list; it
     moves the chart, the adult pills and the pattern read with it.

     THE SAME THREE RULES AS THE SLIP, because they are the same three faults:

     1 — IT IS UNDOABLE. removeCheckins hands back the exact records it took,
         with the store, the day and the index each sat at, and
         restoreCheckins puts them back there. [[aog-send-lied]] is blunt
         about the asymmetry: a duplicate is survivable, a deleted row is not.

     2 — IT SURVIVES THE NEXT PULL, via a tombstone on the very key
         mergeRemoteIntoDaily already de-duplicates on. ⚠ NOTHING IN THE
         SHEET IS TOUCHED. This product has no business reaching into
         somebody else's spreadsheet, and the screen says so in words every
         single time.

     3 — IT TAKES THE QUEUED COPY WITH IT, so a row that has not reached the
         Sheet is not uploaded AFTER a teacher removed it — the one direction
         nothing here can undo. The pulled mirror goes too, so the screen is
         honest right now and not only after the next pull.

     ⚠⚠ TWO STORES, ONE CONTROL. An adult's period lives in aog.daily.v1 as
     logs[sid][date].periods[]; a student's own check-in lives in
     aog.checkin.student.v1 as logs[sid][date][]. renderTimeline draws them
     together in one list, so Remove must reach BOTH or the button is a lie
     on half the rows it is standing next to.

     ⚠ BOTH SPELLINGS, ALWAYS — the .30dj case hazard. The bucket carries
     whatever the store had, the row carries whatever the Sheet had, and a
     comparison that picks one of them is how one child became two entries.
     Nothing is rewritten; only the compare is normalized.

     ⚠ aog.checkin.removed.v1 is deliberately NOT matched by PV_KEEP, so the
     full backup carries it and Erase everything takes it out —
     [[aog-backup-symmetry]] exists because a store that quietly escapes both
     is how a delete stops meaning delete. */
  var CGONE = "aog.checkin.removed.v1";
  function ciCode(s) { return String(s == null ? "" : s).trim().toUpperCase(); }
  function goneListCi() { var a = jload(CGONE, []); return (a && a.slice) ? a.slice() : []; }
  function goneSetCi() { var s = {}; goneListCi().forEach(function (k) { s[String(k)] = 1; }); return s; }
  function goneSaveCi(a) { jsave(CGONE, a.length > 4000 ? a.slice(a.length - 4000) : a); }
  function ciKeys(sid, r) {
    var ts = String((r && r.timestamp) || "");
    var a = ciCode(sid) + "|" + ts, b = ciCode(r && r.studentId) + "|" + ts;
    return a === b ? [a] : [a, b];
  }

  function removeCheckins(keys) {
    var want = {};
    (keys || []).forEach(function (k) { if (k) want[String(k)] = 1; });
    var took = [], marks = {};

    var dst = dailyLoad() || {};
    if (dst.logs) {
      Object.keys(dst.logs).forEach(function (sid) {
        var byDate = dst.logs[sid] || {};
        Object.keys(byDate).forEach(function (d) {
          var day = byDate[d] || {}, keep = [];
          (day.periods || []).forEach(function (r, i) {
            var ks = ciKeys(sid, r);
            if (ks.some(function (k) { return want[k]; })) {
              took.push({ st: "daily", sid: sid, date: d, at: i, row: r });
              ks.forEach(function (k) { marks[k] = 1; });
            } else keep.push(r);
          });
          if (keep.length) day.periods = keep; else delete byDate[d];
        });
        if (!Object.keys(byDate).length) delete dst.logs[sid];
      });
    }

    var sst = studentStore() || {};
    if (sst.logs) {
      Object.keys(sst.logs).forEach(function (sid) {
        var byDate = sst.logs[sid] || {};
        Object.keys(byDate).forEach(function (d) {
          var keep = [];
          (byDate[d] || []).forEach(function (r, i) {
            var ks = ciKeys(sid, r);
            if (ks.some(function (k) { return want[k]; })) {
              took.push({ st: "student", sid: sid, date: d, at: i, row: r });
              ks.forEach(function (k) { marks[k] = 1; });
            } else keep.push(r);
          });
          if (keep.length) byDate[d] = keep; else delete byDate[d];
        });
        if (!Object.keys(byDate).length) delete sst.logs[sid];
      });
    }

    if (!took.length) return took;
    dailySave(dst);
    jsave(SKEY, sst);

    var g = goneListCi(), have = goneSetCi();
    Object.keys(marks).forEach(function (k) { if (!have[k]) { have[k] = 1; g.push(k); } });
    goneSaveCi(g);

    /* rule 3 — the copy that has not been uploaded yet, and the pulled mirror */
    try {
      jsave(QKEY, queueGet().filter(function (r) {
        return !ciKeys(r && r.studentId, r).some(function (k) { return marks[k]; });
      }));
    } catch (e) {}
    try {
      var rem = jload(RKEY, null);
      if (Object.prototype.toString.call(rem) === "[object Array]") {
        jsave(RKEY, rem.filter(function (r) {
          return !ciKeys(r && r.studentId, r).some(function (k) { return marks[k]; });
        }));
      }
    } catch (e2) {}
    return took;
  }

  function restoreCheckins(took) {
    var dst = dailyLoad() || {}, sst = studentStore() || {}, back = 0, undo = {};
    if (!dst.logs) dst.logs = {};
    if (!sst.logs) sst.logs = {};
    /* Lowest recorded position first, so an index taken before its neighbors
       were removed still lands where it was. */
    (took || []).slice().sort(function (a, b) { return (a.at || 0) - (b.at || 0); })
      .forEach(function (t) {
        if (!t || !t.row) return;
        var arr;
        if (t.st === "student") {
          if (!sst.logs[t.sid]) sst.logs[t.sid] = {};
          arr = sst.logs[t.sid][t.date] || (sst.logs[t.sid][t.date] = []);
        } else {
          if (!dst.logs[t.sid]) dst.logs[t.sid] = {};
          var day = dst.logs[t.sid][t.date] || (dst.logs[t.sid][t.date] = { periods: [] });
          if (!day.periods) day.periods = [];
          arr = day.periods;
        }
        var ks = ciKeys(t.sid, t.row);
        var dup = arr.some(function (r) {
          return ciKeys(t.sid, r).some(function (k) { return ks.indexOf(k) > -1; });
        });
        if (!dup) {
          arr.splice(Math.min(t.at == null ? arr.length : t.at, arr.length), 0, t.row);
          back++;
        }
        ks.forEach(function (k) { undo[k] = 1; });
      });
    if (back) { dailySave(dst); jsave(SKEY, sst); }
    /* ⚠ A RESTORED ROW MUST STOP BEING TOMBSTONED, or the next pull would take
       it away again and nobody would ever work out why. */
    goneSaveCi(goneListCi().filter(function (k) { return !undo[String(k)]; }));
    return back;
  }

  function keysForCheckinStudent(sid) {
    var want = ciCode(sid), out = [];
    function sweep(logs, pick) {
      Object.keys(logs || {}).forEach(function (s) {
        if (ciCode(s) !== want) return;
        Object.keys(logs[s] || {}).forEach(function (d) {
          (pick(logs[s][d]) || []).forEach(function (r) {
            ciKeys(s, r).forEach(function (k) { out.push(k); });
          });
        });
      });
    }
    sweep((dailyLoad() || {}).logs, function (day) { return (day && day.periods) || []; });
    sweep((studentStore() || {}).logs, function (a) { return a || []; });
    return out;
  }

  function mergeRemoteIntoDaily(rows) {
    var store = dailyLoad();
    if (!store.logs) store.logs = {};
    var sstore = studentStore();
    if (!sstore.logs) sstore.logs = {};

    var seen = {};
    /* .30dp — a row a teacher removed on purpose must not come back down. */
    var gone = goneSetCi();
    Object.keys(store.logs).forEach(function (sid) {
      Object.keys(store.logs[sid] || {}).forEach(function (date) {
        ((store.logs[sid][date] || {}).periods || []).forEach(function (p) {
          seen[sid + "|" + String(p.timestamp || "")] = 1;
        });
      });
    });
    Object.keys(sstore.logs).forEach(function (sid) {
      Object.keys(sstore.logs[sid] || {}).forEach(function (date) {
        (sstore.logs[sid][date] || []).forEach(function (p) {
          seen[sid + "|" + String(p.timestamp || "")] = 1;
        });
      });
    });

    var added = 0;
    /* `extra` is a JSON string on the way up and on the way back. A row from
       an older build has none; a row whose JSON is broken is treated as
       having none. In both cases the row still merges - it is just read as
       carrying the three domains it does carry. Fail open: never drop a
       teacher's entry over a field that is decoration to the columns that
       matter. */
    function extraOf(r) {
      if (!r || !r.extra) return null;
      try {
        var o = (typeof r.extra === "string") ? JSON.parse(r.extra) : r.extra;
        return (o && o.obsSchema === "v2") ? o : null;
      } catch (e) { return null; }
    }
    rows.forEach(function (r) {
      if (String(r.checkinType || "") === "thisisme") { timIngestRemote(r); return; }
      var sid = String(r.studentId || "").trim();
      var ts = String(r.timestamp || "");
      var date = String(r.date || "").slice(0, 10);
      if (!sid || !date) return;
      if (seen[sid + "|" + ts]) return;
      if (gone[ciCode(sid) + "|" + ts]) return;   /* .30dp — removed on purpose */

      if (String(r.respondentRole || "") === "student") {
        if (!sstore.logs[sid]) sstore.logs[sid] = {};
        if (!sstore.logs[sid][date]) sstore.logs[sid][date] = [];
        sstore.logs[sid][date].push({
          timestamp: ts, date: date, year: r.year || "", studentId: sid,
          respondentRole: "student", respondentId: r.respondentId || sid,
          slipType: r.slipType || "checkin",
          checkinType: r.checkinType || "daily", period: r.period || "",
          arrival: r.arrival, feelingWords: r.feelingWords || "",
          need: r.need || "", connection: r.connection,
          readiness: r.readiness == null ? "" : r.readiness,
          challenge: r.challenge || "",
          challengeImpact: r.challengeImpact == null ? "" : r.challengeImpact,
          contextTag: r.contextTag || "",
          tellAdult: r.tellAdult || "",
          agency: r.agency || "", followUp: !!r.followUp,
          source: "sheet", _remote: true
        });
      } else {
        if (!store.logs[sid]) store.logs[sid] = {};
        if (!store.logs[sid][date]) store.logs[sid][date] = { periods: [] };
        if (!store.logs[sid][date].periods) store.logs[sid][date].periods = [];
        /* ⚠ READ `extra` BEFORE THIS ROW IS SCORED. A v2 row that came
           back without its fourth domain would have no `engaged` field, and
           periodStats() would read that as a pre-.29al period and score it
           out of three - a different claim from "engagement did not come
           up". The Sheet has no column for it by design; `extra` is where it
           rode up and it is where it comes back from. */
        var xt = extraOf(r);
        var row = {
          period:         r.period || "",
          regulated:      !!r.regulated,
          usedStrategy:   !!r.usedStrategy,
          connected:      !!r.connected,
          note:           r.note || "",
          timestamp:      ts,
          slipType:       r.slipType || "checkin",
          checkinType:    r.checkinType || "",
          respondentId:   r.respondentId || "",
          respondentRole: r.respondentRole || "",
          assignmentId:   r.assignmentId || "",
          trackingGroup:  r.trackingGroup || "",
          term:           r.term || "",
          year:           r.year || "",
          followUp:       !!r.followUp,
          source:         "sheet",
          _remote:        true
        };
        if (xt) {
          row.engaged   = !!xt.engaged;
          row.obs       = xt.obs || [];
          row.flags     = xt.flags || [];
          row.obsSchema = "v2";
        }
        store.logs[sid][date].periods.push(row);
      }
      seen[sid + "|" + ts] = 1;
      added++;
    });
    dailySave(store);
    jsave(SKEY, sstore);
    return added;
  }

  /* ------------------------------------------------------------------ styles */
  function injectCss() {
    if (el("aog-ci-css")) return;
    var s = document.createElement("style");
    s.id = "aog-ci-css";
    s.textContent = [
      /* ⚠ SIXTEEN PIXELS OR iOS ZOOMS. Safari on iPhone auto-zooms the whole
         page when a focused text field's font is under 16px, and the zoom
         STAYS after the keyboard closes — the page then wobbles side to side
         on every scroll (Jimmy, from his phone, 2026-08-29: "they make me
         dizzy from the shaking of the screen. BARF"). On touch devices every
         text-entry field on these two screens is at least 16px. Do not
         "fix" this with user-scalable=no on the viewport — that breaks pinch
         zoom for people who need it; the field size is the accessible cure. */
      "@media (pointer:coarse), (max-width:740px){" +
        "#screen-staff-checkin input:not([type=checkbox]):not([type=radio]), #screen-staff-checkin select, #screen-staff-checkin textarea," +
        "#screen-daily-checkin input:not([type=checkbox]):not([type=radio]), #screen-daily-checkin select, #screen-daily-checkin textarea" +
        "{font-size:16px !important;}}",
      "#screen-staff-checkin{padding:0 0 64px;}",
      ".ci-wrap{max-width:640px;margin:0 auto;padding:0 20px;}",
      ".ci-hero{background:var(--navy,#0A1E33);color:#fff;padding:26px 20px 24px;margin-bottom:22px;}",
      ".ci-hero .ci-wrap{padding:0 20px;}",
      ".ci-kicker{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--gold,#D9A33B);margin:0 0 8px;}",
      ".ci-h1{font-family:var(--font-serif,Georgia,serif);font-size:26px;line-height:1.2;font-weight:600;margin:0 0 8px;color:#fff;}",
      ".ci-lede{font-size:14.5px;line-height:1.55;color:rgba(255,255,255,.86);margin:0;}",
      ".ci-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px;}",
      ".ci-chip{font-size:11px;font-weight:700;letter-spacing:.04em;border-radius:999px;padding:4px 11px;background:rgba(217,163,59,.18);color:var(--gold,#D9A33B);border:1px solid rgba(217,163,59,.45);white-space:nowrap;}",
      ".ci-card{background:var(--card,#fff);border:1px solid var(--rule,#E4DAC5);border-radius:14px;padding:20px 20px;margin-bottom:16px;}",
      ".ci-lbl{font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-faint,#8A92A6);margin:0 0 8px;}",
      ".ci-lbl.mt{margin-top:18px;}",
      ".ci-row{display:flex;flex-wrap:wrap;gap:12px 32px;}",
      ".ci-f{flex:1 1 170px;min-width:0;}",
      ".ci-in,.ci-sel{font:inherit;font-size:15px;color:var(--ink,#22303F);background:var(--card,#fff);border:1px solid var(--rule,#E4DAC5);border-radius:10px;padding:12px 12px;width:100%;box-sizing:border-box;}",
      ".ci-in:focus,.ci-sel:focus{outline:2px solid var(--gold,#D9A33B);outline-offset:1px;}",
      ".ci-fixed{display:block;font-size:16px;font-weight:700;color:var(--navy,#0A1E33);padding:11px 0 2px;}",
      ".ci-set{display:block;font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);}",
      ".ci-sub{font-size:13.5px;line-height:1.6;color:var(--ink-soft,#5b6675);margin:-2px 0 6px;}",
      ".ci-bandpick{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:2px 0 10px;padding:11px 13px;border:1px dashed var(--rule,#E4DAC5);border-radius:11px;}",
      ".ci-bandpick label{font-size:12.5px;font-weight:700;color:var(--ink,#22303F);}",
      ".ci-bandpick .ci-sel{width:auto;min-width:132px;padding:8px 10px;font-size:14px;}",
      ".ci-bandnote{flex:1 1 100%;font-size:12px;line-height:1.55;color:var(--ink-soft,#5b6675);}",
      ".ci-group{margin:18px 0 4px;}",
      ".ci-group:first-of-type{margin-top:10px;}",
      /* ⚠ --ink, NOT --navy. A heading painted navy is invisible on the dark
         theme's navy ground - caught in the render, not by a suite. */
      ".ci-ghead{font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--ink,#22303F);margin:0 0 4px;padding-bottom:6px;border-bottom:2px solid var(--gold,#D9A33B);}",
      ".ci-gsub{font-size:12.5px;line-height:1.55;color:var(--ink-soft,#5b6675);margin:6px 0 0;}",
      ".ci-count{font-size:13px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);}",
      ".ci-chk.flag{border-style:dashed;}",
      ".ci-chk.flag.on{border-style:solid;border-color:var(--gold-deep,#9a6f24);background:rgba(217,163,59,.10);}",
      ".ci-checks{display:flex;flex-direction:column;gap:8px;margin:4px 0 2px;}",
      /* ⚠ PRE-EXISTING, FIXED HERE BECAUSE IT IS ON THIS SCREEN: .ci-fixed
         painted "Period 3" in --navy, which the dark theme puts on a navy
         card. It reads at a glance in light and vanishes in dark. */
      ".ci-fixed{color:var(--ink,#22303F);}",
      ".ci-chk{display:flex;align-items:flex-start;gap:13px;border:2px solid var(--rule,#E4DAC5);border-radius:12px;padding:14px 15px;cursor:pointer;background:var(--card,#fff);transition:border-color .12s,background .12s;}",
      ".ci-chk:hover{border-color:var(--gold,#D9A33B);}",
      ".ci-chk.on{border-color:var(--navy,#0A1E33);background:rgba(10,30,51,.045);}",
      ".ci-chk input{width:22px;height:22px;accent-color:var(--navy,#0A1E33);cursor:pointer;margin:1px 0 0;flex:0 0 auto;}",
      ".ci-chk .q{font-size:15px;line-height:1.45;color:var(--ink,#22303F);font-weight:600;}",
      ".ci-chk .d{display:block;font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-faint,#8A92A6);margin-top:4px;}",
      ".ci-note{font:inherit;font-size:15px;color:var(--ink,#22303F);background:var(--card,#fff);border:1px solid var(--rule,#E4DAC5);border-radius:10px;padding:12px;width:100%;box-sizing:border-box;resize:vertical;}",
      ".ci-follow{display:flex;align-items:flex-start;gap:11px;margin-top:14px;padding:13px 14px;border:1px solid var(--gold,#D9A33B);border-radius:12px;background:rgba(217,163,59,.09);cursor:pointer;}",
      ".ci-follow input{width:20px;height:20px;accent-color:var(--gold-deep,#9a6f24);cursor:pointer;margin-top:1px;flex:0 0 auto;}",
      ".ci-follow span{font-size:14px;line-height:1.45;color:var(--ink,#22303F);font-weight:600;}",
      ".ci-save{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:6px;}",
      ".ci-btn{font:inherit;font-size:16px;font-weight:800;color:#fff;background:var(--navy,#0A1E33);border:0;border-radius:999px;padding:15px 32px;cursor:pointer;}",
      ".ci-btn:hover{background:#12314f;}",
      ".ci-btn.ghost{color:var(--navy,#0A1E33);background:transparent;border:1.5px solid var(--rule,#E4DAC5);font-size:14.5px;padding:12px 24px;}",
      ".ci-status{font-size:14px;font-weight:800;color:var(--green,#2E6B3A);}",
      ".ci-priv{font-size:12.5px;line-height:1.6;color:var(--ink-soft,#5b6675);margin-top:16px;padding-top:14px;border-top:1px solid var(--rule,#E4DAC5);}",
      ".ci-done{text-align:center;padding:44px 16px;}",
      ".ci-done .tick{font-size:46px;line-height:1;color:var(--green,#2E6B3A);}",
      /* ⚠ --ink, NOT --navy — same rule as .ci-ghead and .ci-fixed above. The
         done screen was the third place a navy heading vanished on the dark
         theme's navy ground (Jimmy, from his phone: "Logged." and "Done" were
         unreadable). */
      ".ci-done h2{font-family:var(--font-serif,Georgia,serif);font-size:24px;color:var(--ink,#22303F);margin:14px 0 8px;font-weight:600;}",
      ".ci-done p{font-size:15px;color:var(--ink-soft,#5b6675);margin:0 auto 22px;max-width:420px;line-height:1.6;}",
      ".ci-err{font-size:13.5px;color:var(--red,#8B2A2A);font-weight:700;}",
      "@media (max-width:520px){.ci-h1{font-size:22px;}.ci-btn{width:100%;text-align:center;}.ci-f{flex:1 1 100%;}}",
      /* Dark theme: the primary pill goes gold-on-navy (the Tim-block pattern)
         so it stands off the ground; the ghost button's navy ink goes gold; a
         ticked card's navy border goes gold. data-theme is stamped at boot
         even when darkness comes from the device's own preference, so these
         cover the student whose phone simply opens dark. */
      ":root[data-theme=\"dark\"] .ci-btn{background:var(--gold,#D9A33B);color:#0A1E33;}",
      ":root[data-theme=\"dark\"] .ci-btn.ghost{background:transparent;color:var(--gold,#D9A33B);border-color:var(--gold,#D9A33B);}",
      ":root[data-theme=\"dark\"] .ci-chk.on{border-color:var(--gold,#D9A33B);background:rgba(217,163,59,.10);}",
      ":root[data-theme=\"dark\"] .ci-chk input{accent-color:var(--gold,#D9A33B);}",
      ":root[data-theme=\"dark\"] .ci-follow input{accent-color:var(--gold,#D9A33B);}",
      /* AOG-SLIP-MAST-V1 (2026-09-28) — Jimmy: the slip's header was "a flat solid dark navy band that doesn't
         match the site". It is now the site's masthead: navy gradient, a rounded bottom edge and shadow, the pencil
         drawing on the right under a navy veil, the words lined up with the form below, cream text. */
      ".ci-hero{position:relative;overflow:hidden;background:linear-gradient(180deg,#12314F,#0A1E33);color:#F4EEE2;padding:28px 0 30px;border-radius:0 0 18px 18px;box-shadow:0 12px 26px -20px rgba(10,30,51,.8);}",
      ".ci-hero::before{content:'';position:absolute;inset:0;background:url(/img/banners/page-selfreflect-pencil-1600.webp) right 42%/auto 170% no-repeat;opacity:.9;}",
      ".ci-hero::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#0B2239 0%,rgba(11,34,57,.94) 55%,rgba(11,34,57,.45) 82%,rgba(11,34,57,.25) 100%),linear-gradient(0deg,rgba(10,30,51,.7),rgba(10,30,51,0) 50%);}",
      ".ci-hero > .ci-wrap{position:relative;z-index:1;}",
      ".ci-hero .ci-h1{color:#F4EEE2;font-size:clamp(26px,5vw,34px);}.ci-hero .ci-lede{color:#E2E8EF;font-size:16px;}.ci-hero .ci-kicker{color:#F2C964;}",
      "@media (max-width:640px){.ci-hero::before{width:100%;opacity:.35;}}",
      "@media print{.ci-hero{background:#fff;color:#000;box-shadow:none;}.ci-hero::before,.ci-hero::after{display:none;}.ci-hero .ci-h1,.ci-hero .ci-lede{color:#000;}.ci-btn,.ci-follow{display:none;}}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------- the screen */
  function ensureScreen() {
    if (el("screen-staff-checkin")) return el("screen-staff-checkin");
    var host = el("screen-welcome");
    if (!host || !host.parentNode) return null;
    var sec = document.createElement("section");
    sec.id = "screen-staff-checkin";
    sec.className = "screen";
    host.parentNode.appendChild(sec);
    return sec;
  }

  /* The roster: the same source the Daily log uses — student codes already seen
     in this school's records — plus anyone who already has a log. A code the
     adult types is accepted too; nothing here invents an identifier. */
  function roster() {
    var ids = {};
    try {
      ((typeof getAllRecords === "function" ? getAllRecords() : []) || []).forEach(function (r) {
        if (r && r.studentId) { var id = String(r.studentId).trim(); if (id) ids[id] = 1; }
      });
    } catch (e) {}
    var store = dailyLoad();
    Object.keys(store.logs || {}).forEach(function (id) { ids[id] = 1; });
    return Object.keys(ids).sort();
  }

  /* The student the link is about. Priority: a resolved ?t= placement (the code
     never appears in the URL), then a remembered pick, then the adult chooses.
     A raw studentId is deliberately NOT read from the query string. */
  function lockedStudent() {
    try {
      if (window.AOG_PLACEMENT && window.AOG_PLACEMENT.studentId) {
        return String(window.AOG_PLACEMENT.studentId);
      }
    } catch (e) {}
    return "";
  }

  var CI = { student: "", date: "", period: "", saving: false, msg: "", err: "" };

  function renderScreen() {
    var sec = ensureScreen();
    if (!sec) return;
    injectCss();

    var type = ciType() || "support";
    var meta = typeMeta(type);
    var locked = lockedStudent();
    var grade = ss("aog.launch.grade");
    var band = activeBand();
    var defs = checkDefs(band);
    var list = roster();

    if (!CI.date) CI.date = todayISO();
    if (!CI.period) CI.period = ss(CI_KEYS.period) || "Advisory";
    if (locked) CI.student = locked;

    var me = jload(MEKEY, { id: "", role: "" });
    var roleFromLink = ss(CI_KEYS.staffRole);
    var myRole = roleFromLink || me.role || "teacher";

    /* An adult who arrived on a pre-token link is told, on the screen, that
       the link has an end date — rather than finding out when it stops working. */
    var graceNote = staffLinkNeedsRegenerating()
      ? '<div class="ci-grace" style="border:1px solid var(--gold,#D9A33B);background:rgba(217,163,59,.12);' +
        'border-radius:11px;padding:12px 14px;margin:0 0 14px;font-size:13px;line-height:1.6;color:var(--ink,#22303F);">' +
        "<b>" + esc(T("This link needs regenerating before " + STAFF_LINK_GRACE_UNTIL + ".",
                      "Este enlace debe regenerarse antes del " + STAFF_LINK_GRACE_UNTIL + ".")) + "</b> " +
        esc(T("It was made before staff links carried a check, so anyone who guessed the address could open this adult form. Ask whoever sent it to rebuild it in Set up ▸ Distribute. It keeps working until then.",
              "Se creó antes de que los enlaces de personal llevaran una verificación, así que cualquiera que adivinara la dirección podía abrir este formulario. Pide que lo vuelvan a generar en Configurar ▸ Repartir. Funciona hasta esa fecha.")) +
        "</div>"
      : "";

    var chips = [];
    if (ss("aog.launch.schoolId"))  chips.push(ss("aog.launch.schoolId"));
    if (grade)                      chips.push(T("Grade ", "Grado ") + grade);
    if (ss("aog.launch.classId"))   chips.push(ss("aog.launch.classId"));
    if (ss(CI_KEYS.term))           chips.push(ss(CI_KEYS.term));
    if (ss(CI_KEYS.trackingGroup))  chips.push(ss(CI_KEYS.trackingGroup));
    if (ss(CI_KEYS.assignmentId))   chips.push(T("Plan ", "Plan ") + ss(CI_KEYS.assignmentId));

    var studentField = locked
      ? '<span class="ci-fixed">' + esc(locked) + '</span><span class="ci-set">' +
        esc(T("Set by the link", "Asignado por el enlace")) + "</span>"
      : (list.length
          ? '<select class="ci-sel" id="ciStudent" aria-label="' + esc(T("Who is this about?", "¿Sobre quién es?")) + '">' +
              '<option value="">' + esc(T("Select a student…", "Selecciona un estudiante…")) + "</option>" +
              list.map(function (id) {
                return '<option value="' + esc(id) + '"' + (id === CI.student ? " selected" : "") + ">" + esc(id) + "</option>";
              }).join("") +
              '<option value="__type__">' + esc(T("Type a code instead…", "Escribir un código…")) + "</option>" +
            "</select>" +
            '<input class="ci-in" id="ciStudentTyped" style="margin-top:8px;display:none;" placeholder="' +
              esc(T("Student code", "Código del estudiante")) + '" value="">'
          : '<input class="ci-in" id="ciStudentTyped" placeholder="' +
              esc(T("Student code", "Código del estudiante")) + '" value="' + esc(CI.student) + '">');

    sec.innerHTML =
      '<div class="ci-hero"><div class="ci-wrap">' +
        '<p class="ci-kicker">' + esc(T("Architecture of Grace", "Architecture of Grace")) + "</p>" +
        '<h1 class="ci-h1">' + esc(T(meta.en, meta.es)) + "</h1>" +
        '<p class="ci-lede">' + esc(T(meta.lede_en, meta.lede_es)) + "</p>" +
        (chips.length ? '<div class="ci-chips">' + chips.map(function (c) {
          return '<span class="ci-chip">' + esc(c) + "</span>";
        }).join("") + "</div>" : "") +
      "</div></div>" +
      (graceNote ? '<div class="ci-wrap" style="padding-top:16px;">' + graceNote + "</div>" : "") +

      '<div class="ci-wrap">' +
        '<div class="ci-card">' +
          '<p class="ci-lbl">' + esc(T("Who is this about?", "¿Sobre quién es?")) + "</p>" +
          studentField +
          '<div class="ci-row" style="margin-top:16px;">' +
            '<div class="ci-f"><p class="ci-lbl">' + esc(T("Date", "Fecha")) + "</p>" +
              '<input type="date" class="ci-in" id="ciDate" aria-label="' + esc(T("Date", "Fecha")) + '" value="' + esc(CI.date) + '"></div>' +
            '<div class="ci-f"><p class="ci-lbl">' + esc(T("Period", "Periodo")) + "</p>" +
              (ss(CI_KEYS.period)
                ? '<span class="ci-fixed">' + esc(periodLabelFor(ss(CI_KEYS.period))) + '</span><span class="ci-set">' +
                  esc(T("Set by the link", "Asignado por el enlace")) + "</span>"
                : '<select class="ci-sel" id="ciPeriod" aria-label="' + esc(T("Period", "Periodo")) + '">' + PERIOD_DEFS.map(function (p) {
                    return '<option value="' + esc(p.store) + '"' + (p.store === CI.period ? " selected" : "") + ">" +
                      esc(T(p.en, p.es)) + "</option>";
                  }).join("") + "</select>") +
            "</div>" +
          "</div>" +
        "</div>" +

        '<div class="ci-card">' +
          '<p class="ci-lbl">' + esc(T("Who are you?", "¿Quién eres?")) +
            ' <span style="text-transform:none;letter-spacing:normal;font-weight:400;color:var(--ink-soft,#5b6675);">· ' +
            esc(T("so the team knows where this observation came from",
                  "para que el equipo sepa de dónde viene esta observación")) + "</span></p>" +
          '<div class="ci-row">' +
            '<div class="ci-f"><input class="ci-in" id="ciMe" placeholder="' +
              esc(T("Your name or initials", "Tu nombre o iniciales")) + '" value="' + esc(me.id || "") + '"></div>' +
            '<div class="ci-f">' +
              (roleFromLink
                ? '<span class="ci-fixed">' + esc(roleLabel(roleFromLink)) + '</span><span class="ci-set">' +
                  esc(T("Set by the link", "Asignado por el enlace")) + "</span>"
                : '<select class="ci-sel" id="ciRole" aria-label="' + esc(T("Your role", "Tu función")) + '">' + ROLES.map(function (r) {
                    return '<option value="' + r.v + '"' + (r.v === myRole ? " selected" : "") + ">" +
                           esc(T(r.en, r.es)) + "</option>";
                  }).join("") + "</select>") +
            "</div>" +
          "</div>" +
        "</div>" +

        '<div class="ci-card">' +
          /* ⚠ NOT "what did you see THIS PERIOD". The old heading asked for one
             behavior in one room; this form is for anything that stood out,
             including a success. The band chip stays because the wording of
             the youngest bands really is different. */
          /* ⚠ A CHIP STATES; A MENU ASKS. When the link carried a grade this
             stays the flat chip it has always been, matching how Period and
             the student code already render as "Set by the link". When it did
             not, it is a menu — because a PE teacher in a K-8 building sees
             first graders and eighth graders in the same day, and neither of
             them should be asked the other's questions. */
          '<p class="ci-lbl">' + esc(T("What did you notice?", "¿Qué notaste?")) +
            (bandFromLink()
              ? ' <span style="text-transform:none;letter-spacing:normal;font-weight:700;color:var(--gold-deep,#9a6f24);">· ' +
                esc(gradeFromLink() ? gradeLabel(gradeFromLink()) : (BAND_LABEL[band] || "")) + "</span>"
              : "") + "</p>" +
          (bandFromLink() ? "" :
            '<div class="ci-bandpick">' +
              '<label for="ciBand">' + esc(T("Which grade is this student in?", "¿En qué grado está este estudiante?")) + "</label>" +
              '<select class="ci-sel" id="ciBand">' +
                (function () { var pick = gradeRemembered() || "6"; return GRADES.map(function (g) {
                  return '<option value="' + g + '"' + (g === pick ? " selected" : "") + ">" + esc(gradeLabel(g)) + "</option>";
                }).join(""); })() +
              "</select>" +
              (bandRemembered()
                ? ""
                : '<span class="ci-bandnote">' + esc(T(
                    "The link did not say a grade, so this starts at grade 6. Change it and this device will remember.",
                    "El enlace no indicó un grado, así que empieza en 6.º. Cámbialo y este dispositivo lo recordará.")) + "</span>") +
            "</div>") +
          '<p class="ci-sub">' + esc(T(
            "Tick anything that stood out today. You do not have to answer every group — two or three is a normal entry, and a blank is not a judgement.",
            "Marca lo que te haya llamado la atención hoy. No tienes que responder cada grupo — dos o tres es una entrada normal, y dejarlo en blanco no es un juicio.")) + "</p>" +
          (window.AOG_OBS ? "" :
            '<p class="ci-err" style="display:block;">' + esc(T(
              "The observation list did not load. Your note and your request to talk will still be saved.",
              "La lista de observaciones no cargó. Tu nota y tu solicitud de hablar sí se guardarán.")) + "</p>") +
          ciObsHtml(band, false) +
          /* Filled by #aog-iep-track when the chosen student has a goal linked
             to one observation. Empty for everybody else, which is almost
             everybody. [[aog-iep-track]] */
          '<div id="aogIepTrackSlot"></div>' +

          '<p class="ci-lbl mt">' + esc(T("Tell us a little more, if you’d like.",
                                          "Cuéntanos un poco más, si quieres.")) + "</p>" +
          '<textarea class="ci-note" id="ciNote" rows="3" placeholder="' +
            esc(T("What happened? What did you notice?", "¿Qué pasó? ¿Qué notaste?")) + '"></textarea>' +

          ciObsHtml(band, true) +

          '<label class="ci-follow"><input type="checkbox" id="ciFollow"><span>' +
            esc(T("I would like to talk with someone about this student.",
                  "Me gustaría hablar con alguien sobre este estudiante.")) + "</span></label>" +
          '<div class="ci-save"><button type="button" class="ci-btn" id="ciSave">' +
            esc(T("Save this check-in", "Guardar este registro")) + "</button>" +
            '<span class="ci-count" id="ciCount"></span>' +
            '<span class="ci-status" id="ciStatus"></span></div>' +
          '<p class="ci-err" id="ciErr" style="display:none;"></p>' +
          '<p class="ci-priv">' + esc(T(
            "This is a staff observation, not a student’s own words. It is saved on this device and sent to the connected Google Sheet, where the adults on this student’s team can see it. Architecture of Grace stores nothing.",
            "Esta es una observación del personal, no las palabras del estudiante. Se guarda en este dispositivo y se envía a la hoja de Google conectada, donde el equipo de este estudiante puede verla. Architecture of Grace no almacena nada.")) + "</p>" +
        "</div>" +
      "</div>";

    wireScreen();
  }

  function wireScreen() {
    var stu = el("ciStudent"), typed = el("ciStudentTyped");
    if (stu) {
      stu.addEventListener("change", function () {
        if (stu.value === "__type__") {
          if (typed) { typed.style.display = ""; typed.value = ""; typed.focus(); }
          CI.student = "";
        } else {
          if (typed) typed.style.display = "none";
          CI.student = stu.value;
        }
      });
    }
    if (typed) typed.addEventListener("input", function () { CI.student = typed.value.trim(); });

    var dt = el("ciDate");
    if (dt) dt.addEventListener("change", function () { CI.date = dt.value || todayISO(); });
    var pd = el("ciPeriod");
    if (pd) pd.addEventListener("change", function () { CI.period = pd.value; });

    /* The whole card is the tap target, not the 22px box — this gets used on a
       phone in a hallway between periods. */
    /* The whole card is the tap target, not the 22px box - this gets used on
       a phone in a hallway between periods. */
    function ciCount() {
      var c = el("ciCount");
      if (!c) return;
      var n = document.querySelectorAll("#screen-staff-checkin [data-ciobs]:checked").length +
              document.querySelectorAll("#screen-staff-checkin [data-ciflag]:checked").length;
      /* ⚠ IT COUNTS, IT DOES NOT SCORE. "3 noticed" is how many things this
         adult ticked. It is never "3 out of 15" and never a percentage: a
         blank means it did not come up, and a denominator would turn that
         into a judgement about the student. */
      c.textContent = n ? (n + " " + T("noticed", "marcado" + (n === 1 ? "" : "s"))) : "";
    }
    Array.prototype.forEach.call(document.querySelectorAll("#screen-staff-checkin .ci-chk"), function (lab) {
      var box = lab.querySelector("input");
      if (!box) return;
      box.addEventListener("change", function () { lab.classList.toggle("on", box.checked); ciCount(); });
    });
    ciCount();

    /* ⚠ .29al BOUND THIS SAVE HANDLER TWICE. Its patch used the two btn
       lines as the END marker of a slice AND re-emitted them in the
       replacement, so both copies survived and one click ran doSave() twice.
       No duplicate row was ever written — doSave's own `if (CI.saving) return`
       caught the second call, which is also why 52 green assertions and a
       captured POST could not see it. Fixed here, and the lesson is in
       [[aog-deploy]]: a replacement must never re-emit its own end marker.

       ⚠ CHANGING THE BAND RE-RENDERS THE WHOLE CARD. Every item key is the
       same in every band — only the sentence moves — so the ticks are carried
       across rather than thrown away. An adult who picks the wrong band, ticks
       four things and then fixes the band should not have to start again. */
    var bandSel = el("ciBand");
    if (bandSel) bandSel.addEventListener("change", function () {
      var keep = {};
      try { Array.prototype.forEach.call(document.querySelectorAll("#screen-staff-checkin [data-ciobs],#screen-staff-checkin [data-ciflag]"), function (cb) {
        keep[(cb.getAttribute("data-ciobs") || "") + "|" + (cb.getAttribute("data-ciflag") || "")] = cb.checked; }); } catch (e) {}
      var note = el("ciNote"); var nv = note ? note.value : null;
      var foll = el("ciFollow"); var fv = foll ? foll.checked : false;
      var gSel = gradeNorm(bandSel.value) || "6";
      lsSet(GRADEKEY, gSel); lsSet(BANDKEY, bandFor(gSel));
      renderScreen();
      try { Array.prototype.forEach.call(document.querySelectorAll("#screen-staff-checkin [data-ciobs],#screen-staff-checkin [data-ciflag]"), function (cb) {
        var k = (cb.getAttribute("data-ciobs") || "") + "|" + (cb.getAttribute("data-ciflag") || "");
        if (keep[k]) { cb.checked = true; var l = cb.closest("label"); if (l) l.classList.add("on"); } }); } catch (e) {}
      var n2 = el("ciNote"); if (n2 && nv != null) n2.value = nv;
      var f2 = el("ciFollow"); if (f2) f2.checked = fv;
      var b2 = el("ciBand"); if (b2) b2.focus();
    });

    var btn = el("ciSave");
    if (btn) btn.addEventListener("click", doSave);
  }

  function showErr(msg) {
    var e = el("ciErr");
    if (!e) return;
    if (!msg) { e.style.display = "none"; e.textContent = ""; return; }
    e.style.display = "";
    e.textContent = msg;
  }

  function doSave() {
    if (CI.saving) return;
    showErr("");

    var locked = lockedStudent();
    var typed = el("ciStudentTyped");
    var stu = el("ciStudent");
    var sid = locked ||
              (typed && typed.style.display !== "none" ? typed.value.trim() : "") ||
              (stu ? stu.value : "") ||
              (typed ? typed.value.trim() : "") ||
              CI.student;
    if (sid === "__type__") sid = typed ? typed.value.trim() : "";

    if (!sid) {
      showErr(T("Choose a student first.", "Elige primero un estudiante."));
      return;
    }

    var meId = (el("ciMe") ? el("ciMe").value.trim() : "");
    if (!meId) {
      showErr(T("Add your name or initials — a support timeline is only readable if it says who saw what.",
                "Agrega tu nombre o iniciales — una línea de tiempo solo se entiende si dice quién vio qué."));
      if (el("ciMe")) el("ciMe").focus();
      return;
    }
    var roleFromLink = ss(CI_KEYS.staffRole);
    var myRole = roleFromLink || (el("ciRole") ? el("ciRole").value : "teacher");
    jsave(MEKEY, { id: meId, role: myRole });

    var periodFromLink = ss(CI_KEYS.period);

    /* The ticked item keys ARE the record; the four domain booleans are
       DERIVED from them. That is what keeps the three Sheet columns, every
       chart and every report reading exactly what they always read, while the
       row finally says WHICH sentence an adult ticked - the thing a support
       person actually needs when the question is what shows up in one room
       and not in another. */
    var obsPicked = [];
    try { Array.prototype.forEach.call(document.querySelectorAll("#screen-staff-checkin [data-ciobs]"), function (cb) {
      if (cb.checked) obsPicked.push(cb.getAttribute("data-ciobs")); }); } catch (e) {}
    var obsFlags = [];
    try { Array.prototype.forEach.call(document.querySelectorAll("#screen-staff-checkin [data-ciflag]"), function (cb) {
      if (cb.checked) obsFlags.push(cb.getAttribute("data-ciflag")); }); } catch (e) {}
    var dm = (window.AOG_OBS ? AOG_OBS.domainsFrom(obsPicked)
                             : { engaged: false, regulated: false, usedStrategy: false, connected: false });

    var ciDate = (el("ciDate") ? el("ciDate").value : "") || todayISO();
    var rec = {
      timestamp:      new Date().toISOString(),
      date:           ciDate,
      year:           (window.AOGYear ? AOGYear(ciDate) : ""),
      slipType:       "checkin",       /* the instrument - see finishStudent() */
      checkinType:    ciType() || "support",   /* the kind of check-in */
      assignmentId:   ss(CI_KEYS.assignmentId),
      trackingGroup:  ss(CI_KEYS.trackingGroup),
      term:           ss(CI_KEYS.term),
      districtId:     ss("aog.launch.districtId"),
      schoolId:       ss("aog.launch.schoolId"),
      classId:        ss("aog.launch.classId"),
      grade:          ss("aog.launch.grade"),
      period:         periodFromLink || (el("ciPeriod") ? el("ciPeriod").value : "Advisory"),
      studentId:      sid,
      respondentId:   meId,
      respondentRole: myRole,
      engaged:        !!dm.engaged,
      regulated:      !!dm.regulated,
      usedStrategy:   !!dm.usedStrategy,
      connected:      !!dm.connected,
      obs:            obsPicked,
      /* ⚠ ADDITIVE, AND SEPARATE FROM `obs` ON PURPOSE. `obs` is a list of
         ticked keys and every existing reader treats a missing key as "not
         ticked", which is exactly the ambiguity this field exists to escape.
         null for every student with no linked goal. [[aog-iep-track]] */
      goalObs: (window.AOGIepTrack && AOGIepTrack.readForm) ? AOGIepTrack.readForm() : null,
      /* ⚠ NEVER SCORED. Nothing that computes a percentage, draws a trend or
         reaches a goal looks at `flags`. */
      flags:          obsFlags,
      obsSchema:      "v2",
      note:           (el("ciNote") ? el("ciNote").value.trim() : ""),
      followUp:       !!(el("ciFollow") && el("ciFollow").checked),
      source:         isStaffLink() ? "link" : "dashboard"
    };

    CI.saving = true;
    var btn = el("ciSave");
    if (btn) { btn.disabled = true; btn.textContent = T("Saving…", "Guardando…"); }

    /* Device first, always. The Sheet is the second copy, never the only one —
       a staff member on a dead network still keeps their observation. */
    saveEntry(rec);
    queuePush(rec);

    syncCheckin(rec).then(function (state) {
      CI.saving = false;
      renderDone(rec, state);
    }).catch(function () {
      CI.saving = false;
      renderDone(rec, "offline");
    });
  }

  /* Three different reasons a row might not be in the Sheet, and a teacher is
     owed the right one. "It will send itself later" is true for a dead network
     and false for a script that cannot accept check-ins yet. */
  function renderDone(rec, state) {
    var sec = el("screen-staff-checkin");
    if (!sec) return;
    var d = destination();
    var line;
    if (!d.url) {
      line = T("Saved on this device. This copy of the site has no Sheet connected, so nothing was sent.",
               "Guardado en este dispositivo. Esta copia del sitio no tiene una hoja conectada, así que no se envió nada.");
    } else if (state === "sent") {
      line = T("Saved on this device and sent to your Sheet.",
               "Guardado en este dispositivo y enviado a tu Hoja.");
    } else if (state === "rejected") {
      line = T("Saved on this device. Your Sheet’s script turned it away — it is probably the version that predates check-ins. Whoever set up the Sheet needs to paste the updated Apps Script and redeploy it as a NEW version; this entry is kept and will go up once they do.",
               "Guardado en este dispositivo. El script de tu Hoja lo rechazó — probablemente es la versión anterior a los registros. Quien configuró la hoja debe pegar el Apps Script actualizado y volver a desplegarlo como NUEVA versión; esta entrada se conserva y subirá cuando lo hagan.");
    } else {
      line = T("Saved on this device. It hasn’t reached the Sheet yet — it will send itself the next time this device is online.",
               "Guardado en este dispositivo. Aún no llegó a la hoja — se enviará solo la próxima vez que este dispositivo esté en línea.");
    }

    sec.innerHTML =
      '<div class="ci-wrap"><div class="ci-done">' +
        '<div class="tick">✓</div>' +
        "<h2>" + esc(T("Logged.", "Registrado.")) + "</h2>" +
        "<p>" + esc(rec.studentId) + " · " + esc(rec.period) + " · " + esc(rec.date) + "<br>" + esc(line) + "</p>" +
        (rec.followUp
          ? '<p style="color:var(--gold-deep,#9a6f24);font-weight:700;">' +
            esc(T("You asked to talk with someone. Tell the student’s support lead directly — this box is a note on the record, not a message that reaches anyone on its own.",
                  "Pediste hablar con alguien. Díselo directamente a la persona a cargo del apoyo — esta casilla es una nota en el registro, no un mensaje que llegue solo.")) + "</p>"
          : "") +
        '<button type="button" class="ci-btn" id="ciAgain">' +
          esc(T("Log another", "Registrar otro")) + "</button> " +
        '<button type="button" class="ci-btn ghost" id="ciHome">' +
          esc(T("Done", "Listo")) + "</button>" +
      "</div></div>";

    /* the letter's promise: after the first completed check-in, the once-ever
       home-screen offer — same banner, same dismissed-forever flag, same
       12-second exit as the reflection's thank-you screen. */
    try { if (window.aogOfferA2HS) setTimeout(window.aogOfferA2HS, 900); } catch (e) {}

    var again = el("ciAgain");
    if (again) again.addEventListener("click", function () {
      CI.student = lockedStudent() || "";
      renderScreen();
      try { window.scrollTo({ top: 0, behavior: "instant" }); } catch (e) { window.scrollTo(0, 0); }
    });
    var home = el("ciHome");
    if (home) home.addEventListener("click", function () {
      if (typeof resetToStart === "function") resetToStart();
      else if (typeof showScreen === "function") showScreen("screen-welcome");
    });
  }

  /* --------------------------------------------------------------- the route
     A staff link carries sync=on and classId, which the original boot code
     reads as "a student is arriving" and answers with startChoose(). This
     listener is registered later in the document than that one, so it runs
     after it and lands the adult on the right screen. The 240 ms re-assert
     covers the flag-hidden and language-switch paths that re-render late. */
  /* The student view's buttons need a way in that is not a link. Mirrors
     aogOpenStaffCheckin; the #daily-checkin hash route already did this, and
     this just gives it a name a caller can use. */
  window.aogOpenDailyCheckin = function () {
    SD = { step: 0, studentId: lockedStudent() || "", a: {} };
    if (SD.studentId && offerTodaysCard(SD.studentId)) {
      if (typeof aogSetHash === "function") aogSetHash("daily-checkin");
      return;
    }
    renderStudent();
    if (typeof showScreen === "function") showScreen("screen-daily-checkin");
    if (typeof aogSetHash === "function") aogSetHash("daily-checkin");
  };

  /* "When did I last check in?" — read from the student check-in store, not
     from getAllRecords(), which holds SELF-REFLECTIONS. They are different
     things on different clocks and the student view was reporting one while
     offering the other. */
  window.aogLastStudentCheckin = function () {
    try {
      var logs = (jload(SKEY, {}) || {}).logs || {};
      var newest = null;
      Object.keys(logs).forEach(function (sid) {
        Object.keys(logs[sid] || {}).forEach(function (day) {
          (logs[sid][day] || []).forEach(function (e) {
            var t = e && (e.ts || e.timestamp || day);
            if (t && (!newest || String(t) > String(newest))) newest = t;
          });
        });
      });
      return newest;
    } catch (e) { return null; }
  };

  window.aogOpenStaffCheckin = function () {
    renderScreen();
    if (typeof showScreen === "function") showScreen("screen-staff-checkin");
    if (typeof aogSetHash === "function") aogSetHash("staff-checkin");
  };

  function routeHash() {
    var h = (location.hash || "").replace(/^#/, "").trim().toLowerCase();
    /* ⚠ A TAB THAT ARRIVED ON A SENT LINK BELONGS TO THAT LINK. The link's
       first history entry carries no hash, so pressing Back far enough lands
       on an empty hash — and the default router would put a colleague on the
       student self-reflection landing (reported 2026-08-29: "I keep going to
       the self-reflection page when I click back on a sent link"). An empty
       hash in a link tab re-asserts the link's own screen instead. This
       listener registers after the global router's, so it speaks last. Same
       family as the .29q ruling: each link boots its own screen, and nothing
       else may claim its tab. */
    /* Both trap entries a link tab's history can hold: the bare URL (no hash)
       and the #student landing the legacy sync=on boot pushes before this
       module claims the tab. Either one, reached with Back, would strand the
       adult on the student self-reflection. CONSUMED WITH replaceState, not
       pushed over: replacing turns the trap entry into the link's own screen,
       so the next Back walks cleanly out of the page instead of ping-ponging
       against a guard forever. */
    /* Every hash the racing boot layers push before this module wins the tab:
       the bare URL, the #student landing, and the check-in/choose family. A
       deliberate destination (quiet space, explore, results) is none of these
       and stays free. */
    var trap = (!h || h === "student" || h === "checkin" || h === "check-in"
                || h === "choose" || h === "start" || h === "daily");
    if (trap && isStaffLink()) {
      renderScreen();
      if (typeof showScreen === "function") showScreen("screen-staff-checkin");
      try { history.replaceState(history.state, "", "#staff-checkin"); } catch (e) {}
      /* AOG-STAFF-LINK-BACK-V1 (2026-09-28) — Jimmy: Back from the adult observation slip "lands on the
         student self-reflection". A trap entry is only ever reached here by Back (the boot layers push
         with pushState, which fires no hashchange), so the adult meant to LEAVE: keep walking back, out
         of the page, to where they came from (the dashboard). With nothing before it, Back does nothing
         and the slip simply stays. Never the student self-reflection. */
      if (window.__aogLinkBoot && Date.now() - window.__aogLinkBoot > 1500) { try { history.back(); } catch (e) {} }
      return true;
    }
    if (trap && isStudentLink()) {
      if (!el("screen-daily-checkin") || !SD.studentId) {
        SD = { step: 0, studentId: lockedStudent() || "", a: {} };
      }
      renderStudent();
      if (typeof showScreen === "function") showScreen("screen-daily-checkin");
      try { history.replaceState(history.state, "", "#daily-checkin"); } catch (e) {}
      return true;
    }
    if (h === "staff-checkin" || h === "support-checkin") {
      renderScreen();
      if (typeof showScreen === "function") showScreen("screen-staff-checkin");
      return true;
    }
    if (h === "daily-checkin" || h === "daily" || h === "check-in") {
      if (!el("screen-daily-checkin") || !SD.studentId) {
        SD = { step: 0, studentId: lockedStudent() || "", a: {} };
      }
      renderStudent();
      if (typeof showScreen === "function") showScreen("screen-daily-checkin");
      return true;
    }
    return false;
  }
  window.addEventListener("hashchange", routeHash);

  function boot() {
    readCheckinParams();
    if (isStudentLink()) {
      SD = { step: 0, studentId: lockedStudent() || "", a: {} };
      renderStudent();
      if (typeof showScreen === "function") showScreen("screen-daily-checkin");
      if (typeof aogSetHash === "function") aogSetHash("daily-checkin");
    } else if (isStaffLink()) {
      renderScreen();
      if (typeof showScreen === "function") showScreen("screen-staff-checkin");
      /* AOG-STAFF-LINK-BACK-V1: the slip REPLACES the link's own entry instead of pushing a second one,
         so one Back leaves the slip for the page before it (the dashboard). */
      if (!window.__aogLinkBoot) window.__aogLinkBoot = Date.now();
      try { history.replaceState(history.state, "", location.pathname + location.search + "#staff-checkin"); }
      catch (e) { if (typeof aogSetHash === "function") aogSetHash("staff-checkin"); }
    } else {
      routeHash();
    }
    flushCheckins();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  /* The original boot code reads sync=on + classId as "a student is arriving"
     and answers with startChoose(). This listener is registered later in the
     document so it runs after that one; the re-assert covers a late re-render. */
  setTimeout(function () {
    if (isStudentLink() && !document.querySelector("#screen-daily-checkin.active")) boot();
    else if (isStaffLink() && !document.querySelector("#screen-staff-checkin.active")) boot();
  }, 240);

  /* ============================================================ THE STUDENT'S
     OWN DAILY CHECK-IN  (Stage 2)

     Seven questions, one at a time, two to four minutes. Written for 6-8 and
     built to survive being asked every day: mostly taps, one optional box, and
     a micro-prompt that rotates so the same wording is not on screen every
     morning of the week.

     It is stored SEPARATELY from aog.daily.v1 on purpose. The Daily log's
     periodStats() scores three adult observations out of three; a student's
     check-in has none of them, and dropping it into that store would score
     every honest morning as 0%. Two stores, one Sheet tab, one timeline. */
  var SKEY = "aog.checkin.student.v1";

  var ARRIVAL = [
    { v: 1, en: "Rough",   es: "Difícil" },
    { v: 2, en: "Heavy",   es: "Pesado" },
    { v: 3, en: "Okay",    es: "Más o menos" },
    { v: 4, en: "Steady",  es: "Estable" },
    { v: 5, en: "Good",    es: "Bien" }
  ];
  var CONNECTION = [
    { v: 1, en: "On my own", es: "Por mi cuenta" },
    { v: 2, en: "Distant",   es: "Distante" },
    { v: 3, en: "Okay",      es: "Más o menos" },
    { v: 4, en: "Connected", es: "Conectado/a" },
    { v: 5, en: "I belong",  es: "Pertenezco" }
  ];
  /* LEARNING READINESS -- deliberately NOT the same question as Arriving, and
     never to be collapsed into one number with it. A student can arrive Heavy
     and still be ready to work; another can arrive Okay and be unable to start.
     Those are two different mornings and two different responses from an adult.
     It measures perceived access to the work, never performance and never worth. */
  var READINESS = [
    { v: 1, en: "I can\u2019t get started",  es: "No puedo empezar" },
    { v: 2, en: "It\u2019s going to be hard", es: "Va a ser dif\u00edcil" },
    { v: 3, en: "I can probably do some",   es: "Quiz\u00e1 pueda hacer algo" },
    { v: 4, en: "I\u2019m ready",            es: "Estoy listo/a" },
    /* v5 was "I\u2019m ready to go" \u2014 indistinguishable from v4 to a thirteen-
       year-old, so the top rung under-fired and the trend flattened where a
       good stretch should show. The NUMBER is what a record stores, so the
       word can move without a migration. */
    { v: 5, en: "Let\u2019s go",             es: "\u00a1Vamos!" }
  ];
  /* Barrier + IMPACT. "Schoolwork" alone is a label; "Schoolwork, a whole lot"
     is a signal. It rides on the barrier question rather than becoming a ninth
     screen -- the check-in has to stay something a student will do tomorrow. */
  var IMPACT = [
    { v: 1, en: "Not really",  es: "Casi nada" },
    { v: 2, en: "A little",    es: "Un poco" },
    { v: 3, en: "Some",        es: "Algo" },
    { v: 4, en: "A lot",       es: "Mucho" },
    { v: 5, en: "A whole lot", es: "Much\u00edsimo" }
  ];
  function impactWord(v) {
    if (v == null || v === "") return "";
    var o = IMPACT.filter(function (x) { return x.v === parseInt(v, 10); })[0];
    return o ? T(o.en, o.es) : "";
  }

  /* =====================================================================
     THE OPTION BANKS  ·  handoff §16, §17, §18

     ⚠ SAME SHAPE AS THE EXIT SLIP'S, DELIBERATELY:

         { groups: [ {h:[en,es], o:[[en,es], …]}, … ], escape: [[en,es], …] }

     A student who has done an exit slip has already learned how this works
     and must not have to learn it again (§03). groups[] are headed sets
     revealed progressively; escape[] is the none / not-sure / rather-not-say
     row.

     ⚠ THE ESCAPE HATCH IS NEVER BEHIND "MORE CHOICES" (§18). It renders on
     the first paint of every screen, outside the fold. It is the option a
     student needs when they do not want to be here, and burying it one tap
     deeper is how a screen starts feeling like a form that wants something
     from them.

     ⚠ THE ENGLISH STRING IS THE STORED VALUE. Spanish is display only.

     ⚠ NOTHING WAS RENAMED AND NOTHING WAS REMOVED. Every option that
     existed before §16 landed still carries the identical English string,
     because those strings are KEYS — in the carry maps, in the NOTICE
     patterns, in Today's Picture, and in every record already sitting in a
     Sheet. §16's words were ADDED and the whole set was grouped. Renaming
     one here is a silent data migration that would quietly orphan every
     answer a student gave last week.
     ===================================================================== */

  var FEELINGS = {
    groups: [
      { h: ["Steady", "En calma"], o: [
        ["Good", "Bien"], ["Calm", "Tranquilo/a"], ["Focused", "Concentrado/a"],
        ["Confident", "Seguro/a"], ["Hopeful", "Con esperanza"], ["Proud", "Orgulloso/a"]
      ] },
      { h: ["Lifted", "Con energía"], o: [
        ["Happy", "Feliz"], ["Excited", "Emocionado/a"], ["Wired", "Acelerado/a"]
      ] },
      { h: ["Heavy", "Pesado"], o: [
        ["Tired", "Cansado/a"], ["Worried", "Preocupado/a"], ["Sad", "Triste"],
        ["Lonely", "Solo/a"], ["Overwhelmed", "Abrumado/a"]
      ] },
      { h: ["Wound up", "Tenso"], o: [
        ["Frustrated", "Frustrado/a"], ["Angry", "Enojado/a"], ["Embarrassed", "Avergonzado/a"]
      ] }
    ],
    escape: [
      ["Numb", "Sin sentir nada"], ["I’m not sure", "No estoy seguro/a"],
      ["I’d rather not say", "Prefiero no decir"]
    ]
  };

  var NEEDS = {
    groups: [
      { h: ["Right now", "Ahora mismo"], o: [
        ["I’m okay", "Estoy bien"], ["A quiet minute", "Un minuto de calma"],
        ["A break", "Un descanso"], ["To move", "Moverme"], ["Some space", "Un poco de espacio"]
      ] },
      { h: ["With the work", "Con el trabajo"], o: [
        ["Help", "Ayuda"], ["Help getting started", "Ayuda para empezar"],
        ["More time", "Más tiempo"], ["Clearer directions", "Instrucciones más claras"]
      ] },
      { h: ["From a person", "De una persona"], o: [
        ["Someone to listen", "Que alguien me escuche"], ["Encouragement", "Ánimo"],
        ["A second chance", "Una segunda oportunidad"]
      ] }
    ],
    escape: [
      ["Nothing right now", "Nada por ahora"], ["I’m not sure", "No estoy seguro/a"]
    ]
  };

  /* ⚠ "Nothing today" IS LOAD-BEARING. barrierNamed() reads that exact
     string to decide whether a barrier was actually named, which is what
     reveals — and un-reveals — the impact strip. It is also what keeps a
     "no" out of the teacher's barrier counts. Do not reword it.

     ⚠ "What's in my head" KEEPS ITS STRAIGHT APOSTROPHE. Every sibling uses
     the curly ’, so this reads as a typo — it is not fixable. The string is
     a stored key AND the carry map in #aog-carry keys on it character for
     character; curling the quote would orphan every record and unmap the
     carry in one edit. Frozen as shipped. */
  var CHALLENGES = {
    groups: [
      { h: ["The work", "El trabajo"], o: [
        ["Schoolwork", "El trabajo escolar"], ["I’m confused", "Estoy confundido/a"],
        ["I’m stuck", "Estoy atascado/a"], ["I’m having trouble", "Me está costando"],
        ["I made a mistake", "Cometí un error"]
      ] },
      { h: ["My head", "Mi cabeza"], o: [
        ["What's in my head", "Lo que tengo en la cabeza"], ["I’m distracted", "Estoy distraído/a"],
        ["I’m overwhelmed", "Me siento abrumado/a"], ["I’m worried", "Estoy preocupado/a"],
        ["Sleep", "El sueño"]
      ] },
      { h: ["Outside this room", "Fuera de este salón"], o: [
        ["Something at home", "Algo en casa"], ["Something with friends", "Algo con mis amistades"],
        ["Something happened", "Pasó algo"]
      ] }
    ],
    escape: [
      ["Nothing today", "Nada hoy"], ["I don’t know", "No sé"]
    ]
  };

  var AGENCY = {
    groups: [
      { h: ["A move you already know", "Un movimiento que ya conoces"], o: [
        ["Use the Pause", "Usar la Pausa"], ["Use my Coach Voice", "Usar mi Voz de Entrenador"],
        ["Ask for help", "Pedir ayuda"], ["Make a repair", "Hacer una reparación"],
        ["Start the hard thing first", "Empezar por lo difícil"], ["Take a real break", "Tomar un descanso de verdad"]
      ] }
    ],
    escape: [
      ["I’m not sure yet", "Todavía no sé"]
    ]
  };

  /* The banks are the source. This flattens one for the places that only
     ever wanted a list — derived, never maintained by hand. A second copy
     of a word list is how the Readiness scale ended up with two homes. */
  function bankOpts(b) {
    var out = [];
    (b.groups || []).forEach(function (g) { g.o.forEach(function (o) { out.push(o); }); });
    (b.escape || []).forEach(function (o) { out.push(o); });
    return out;
  }

  /* The English labels above are what a record stores. Anything that has to
     show a student their own answer in Spanish asks HERE rather than keeping
     a second copy of these lists — the carry card is the first such caller. */
  window.AOGCheckinTr = function (en) {
    var q = String(en == null ? "" : en).trim();
    if (!q) return "";
    var all = [].concat(bankOpts(FEELINGS), bankOpts(NEEDS), bankOpts(CHALLENGES), bankOpts(AGENCY));
    for (var i = 0; i < all.length; i++) if (all[i][0] === q) return T(all[i][0], all[i][1]);
    return q;
  };

  /* A different line each school day, so day 40 does not read like day 1.
     Cosmetic only — it changes no answer, no column and no score. */
  var MICRO = [
    ["No wrong answer here. Just the true one.", "No hay respuesta incorrecta. Solo la verdadera."],
    ["Nobody is graded on this. Ever.", "Nadie recibe una nota por esto. Nunca."],
    ["A hard morning is information, not a problem.", "Una mañana difícil es información, no un problema."],
    ["You can change your mind on the way through.", "Puedes cambiar de idea mientras avanzas."],
    ["Short answers count.", "Las respuestas cortas cuentan."]
  ];
  function micro() {
    var d = new Date();
    var day = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
    var m = MICRO[day % MICRO.length];
    return T(m[0], m[1]);
  }

  /* Who actually sees this, asked of the DESTINATION and nothing else. The
     launch flags are already inside syncDestinationConfigured(); trusting the
     URL instead is the bug that once told a student on their own phone that a
     teacher would read answers nothing had sent. */
  function anAdultWillSeeThis() {
    try {
      if (typeof syncDestinationConfigured === "function") return !!syncDestinationConfigured();
    } catch (e) {}
    return !!destination().url;
  }

  var SD = { step: 0, studentId: "", a: {} };

  /* §10 · ONE NAVIGATION LANGUAGE. Four named beats, exactly as the exit
     slip has four, so a student reads where they are in the SHAPE of the
     thing rather than being told "3 of 8". The count is still printed,
     quietly, in the meta row underneath — the same arrangement, in the same
     two places, on both screens. */
  var PHASES = [
    { k: "arrive", en: "Arriving",   es: "Llegando" },
    { k: "ready",  en: "Ready",      es: "Listo/a" },
    { k: "today",  en: "Today",      es: "Hoy" },
    { k: "close",  en: "Start well", es: "Empezar bien" }
  ];

  var STEPS = [
    { k: "arrival",      phase: "arrive", q: ["How are you arriving today?", "¿Cómo llegas hoy?"],
      sub: ["Not how you should be. How you are.", "No cómo deberías estar. Cómo estás."], kind: "scale", opts: ARRIVAL, required: true },
    { k: "feelingWords", phase: "arrive", q: ["What are you noticing inside?", "¿Qué notas por dentro?"],
      sub: ["Pick up to three. Or one. Or none.", "Elige hasta tres. O una. O ninguna."], kind: "bank", bank: FEELINGS, max: 3 },
    { k: "readiness",    phase: "ready",  q: ["How ready do you feel to learn right now?", "¿Qué tan listo/a te sientes para aprender ahora?"],
      sub: ["About today. Not about you.", "Sobre hoy. No sobre ti."], kind: "scale", opts: READINESS },
    { k: "need",         phase: "ready",  q: ["What do you need today?", "¿Qué necesitas hoy?"],
      sub: ["Pick one.", "Elige una."], kind: "bank", bank: NEEDS, max: 1 },
    { k: "connection",   phase: "today",  q: ["How connected do you feel to people here?", "¿Qué tan conectado/a te sientes con la gente de aquí?"],
      sub: ["Right now, today.", "Ahora mismo, hoy."], kind: "scale", opts: CONNECTION },
    { k: "challenge",    phase: "today",  q: ["Is something making today harder?", "¿Hay algo que hace hoy más difícil?"],
      sub: ["Only if you want to say.", "Solo si quieres decirlo."], kind: "bank", bank: CHALLENGES, max: 1, textToo: true, impact: true },
    { k: "tellAdult",    phase: "close",  q: ["Anything you want an adult to know?", "¿Algo que quieras que un adulto sepa?"],
      sub: ["", ""], kind: "tell" },
    /* The one prompt in either instrument that was not a question — read
       cold it was an assignment, which is the exact voice the arrival
       sub-line promises this screen never uses. An invitation now. */
    { k: "agency",       phase: "close",  q: ["What’s one thing you could do for yourself today?", "¿Qué cosa podrías hacer hoy por ti?"],
      sub: ["Small counts.", "Lo pequeño cuenta."], kind: "bank", bank: AGENCY, max: 1, textToo: true }
  ];

  /* §26's registers reach the morning (build .30cj). The exit slip softens
     for 6th and firms for 8th; the check-in asked its most abstract question
     — "What are you noticing inside?" — of everyone, verbatim, youngest
     readers included. Same rule as the slip's ageAdapt: same keys, same
     options, same storage — the wording is the only thing that moves.

     ⚠ ADAPT AGAIN AFTER DOMContentLoaded, NOT ONLY AT PARSE. On a student's
     FIRST arrival by link, aog.launch.grade is written by parseLaunchParams
     after this block has already parsed, so a parse-time read sees "" and
     the register never applies on the one visit that matters most. Verified
     in the browser: first load unadapted, reload adapted. The re-call is
     idempotent, and the student cannot be past question 1 that early, so
     question 2 always renders from the adapted STEPS. */
  function ageAdapt() {
    var g = "";
    try { g = ss("aog.launch.grade") || ""; } catch (e) {}
    g = String(g).replace(/\D/g, "");
    if (g === "6") {
      STEPS[1].q = ["What feelings are showing up today?", "¿Qué sentimientos aparecen hoy?"];
    }
  }
  ageAdapt();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ageAdapt);
  else ageAdapt();

  function injectStudentCss() {
    if (el("aog-sc-css")) return;
    var s = document.createElement("style");
    s.id = "aog-sc-css";
    s.textContent = [
      /* ⚠ THE LOOK IS NOT HERE ANY MORE — IT IS IN #aog-ds.
         The Daily Check-In and the School-Day Exit Slip are one product
         language (handoff §00). Chips, cards, buttons, the ribbon, the
         escape hatch, the fold control, type, the closing screen and every
         responsive step for them are worn by BOTH screens from the shared
         design-system block. A student who has done one already knows how
         this one works, and that is not a coincidence to be maintained by
         hand — there is literally one chip.

         ⚠ DO NOT re-add an .sc-chip / .sc-next / .sc-q rule here to "tweak
         the check-in". The DS selectors are ID-scoped, so a class-only rule
         added here loses the cascade and reads as a browser bug; and an
         ID-scoped one here would silently un-pair the two screens, which is
         the exact failure §00 exists to prevent. Change it in the DS block
         and look at both screens.

         WHAT STAYS HERE IS THE STAGE plus the handful of controls this
         screen has and the slip does not: the 1-5 scale ladder, the barrier
         impact strip, the who-reads-this panel, the talk checkbox, the code
         box and the carry card. */

      "#screen-daily-checkin{padding:0 0 72px;}",

      /* Steady layout: the sub-line and the micro-line keep their space on
         the questions that do not use them, so the answer block never moves
         between questions. (See aog-steady-layout — a control that has not
         changed must not move.) */
      "#screen-daily-checkin .sc-sub{min-height:1.5em;margin-bottom:10px;}",
      "#screen-daily-checkin .sc-micro{font-size:12.5px;color:var(--ink-faint);margin:0;font-style:italic;min-height:1.5em;line-height:1.45;}",

      /* ---- the 1-5 scales -------------------------------------------------
         The row itself is the shared card (DS §05) — same border, same
         radius, same dusk selected state as an Exit Slip day word. What is
         local is the ladder disc.

         ⚠ THE NUMBER IS STORED, NEVER SHOWN, AND NEITHER IS A SEVERITY
         COLOR. The disc used to run red -> amber -> green across the five
         options, which is a mark out of five painted in the two hues a
         color-blind reader cannot separate, on a screen whose entire
         promise is "I am checking in", not "I am being evaluated" (§07).
         The rising ladder still carries the intensity — shape survives
         color-blindness and grayscale printing both — and the disc now
         belongs to the one palette like everything else. The teacher's
         timeline pill keeps its color: that is the interpretation layer,
         which is where §20 puts the quantitative. */
      "#screen-daily-checkin .sc-scale{display:flex;flex-direction:column;gap:8px;}",
      "#screen-daily-checkin .sc-dot{flex:0 0 auto;width:30px;height:30px;border-radius:50%;display:flex;",
      "  align-items:center;justify-content:center;background:var(--aog-pale);color:var(--aog-dusk);}",
      "#screen-daily-checkin .sc-s.on .sc-dot{background:transparent;color:var(--aog-on);box-shadow:inset 0 0 0 1.5px currentColor;}",

      /* ---- barrier impact, revealed with visibility and never display ----
         Collapsing it would move every control below it the instant a chip
         is touched, which is the one thing this screen promises not to do. */
      "#screen-daily-checkin .sc-imp{margin-top:12px;}",
      "#screen-daily-checkin .sc-imp.off{visibility:hidden;}",
      "#screen-daily-checkin .sc-imp-cap{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;",
      "  color:var(--ink-faint);margin:0 0 6px;min-height:1.45em;line-height:1.45;}",
      "#screen-daily-checkin .sc-imp-row{display:flex;gap:7px;}",
      "#screen-daily-checkin .sc-imp-b{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;",
      "  height:42px;padding:0;border:1.5px solid var(--rule);border-radius:var(--aog-r-chip);background:var(--paper);",
      "  color:var(--ink);cursor:pointer;font-family:inherit;transition:background .12s,border-color .12s;}",
      "#screen-daily-checkin .sc-imp-b:hover{border-color:var(--aog-dusk);}",
      "#screen-daily-checkin .sc-imp-b.on{border-color:var(--aog-dusk);background:var(--aog-dusk);color:var(--aog-on);}",
      "#screen-daily-checkin .sc-imp-b:focus-visible{outline:3px solid var(--aog-dusk);outline-offset:2px;}",

      /* ---- who reads this ------------------------------------------------
         ⚠ This is .sc-seen, and it is NOT the slip's .xs-seen. That one is
         the faint one-line "your teacher will see it" on the closing screen;
         the check-in's twin of THAT is .sc-sent. This is a panel of real
         copy on the tell-an-adult question and it needs the weight.
         It used to be pinned to literal light-palette values because --cream
         is not remapped for dark. --aog-pale IS declared for both themes, so
         the special case is gone with it. */
      "#screen-daily-checkin .sc-seen{font-size:13.5px;line-height:1.55;color:var(--ink);background:var(--aog-pale);",
      "  border:1px solid var(--rule);border-radius:var(--aog-r-chip);padding:13px 15px;margin:0 0 14px;text-align:left;}",
      "#screen-daily-checkin .sc-talk{display:flex;align-items:flex-start;gap:11px;margin-top:14px;padding:13px 15px;",
      "  border:1.5px solid var(--rule);border-radius:var(--aog-r-card);background:var(--paper);cursor:pointer;}",
      "#screen-daily-checkin .sc-talk:hover{border-color:var(--aog-dusk);}",
      "#screen-daily-checkin .sc-talk input{width:21px;height:21px;accent-color:var(--aog-dusk);margin-top:1px;flex:0 0 auto;cursor:pointer;}",
      "#screen-daily-checkin .sc-talk span{font-size:15px;font-weight:600;line-height:1.42;color:var(--ink);}",

      /* ---- the code box --------------------------------------------------- */
      "#screen-daily-checkin .sc-id{margin-bottom:6px;}",
      "#screen-daily-checkin .sc-in{font-family:inherit;font-size:17px;color:var(--ink);background:var(--paper);",
      "  border:1.5px solid var(--rule);border-radius:var(--aog-r-chip);padding:14px;width:100%;box-sizing:border-box;}",
      "#screen-daily-checkin .sc-in:focus-visible{outline:3px solid var(--aog-dusk);outline-offset:1px;}",
      "#screen-daily-checkin .sc-text{resize:vertical;min-height:76px;}",
      "#screen-daily-checkin .sc-tellrow{margin-top:14px;}",

      /* ===== ONE SCREEN ====================================================
         Measured before this machinery existed, walking all seven questions:
           1440x820  61px of page scroll   1366x768  113px   1280x720  161px
           phone 390x844 146px — every question, every device.
         And the empty band above the Next row ran to 250px on the feelings
         question: the "something is off" Jimmy saw.

         --sc-head pins the question block to the tallest of the eight so
         nothing moves between screens. The nav is anchored to the bottom of
         the STAGE rather than to the content: same pixel on every question,
         and the stage is exactly one viewport, so there is nothing to
         scroll. The answers sit directly under the question — floating them
         in the middle of the leftover space is what read as "off".

         ⚠ MEASURE `.sc-body`, NOT `.sc-wrap`. The wrap never overflows — its
         children are sized to it — so a test that asks the wrap whether it
         scrolls always hears "no" and reports content as clipped when it is
         merely scrolled. That mistake cost an hour and a wrong claim. ==== */
      "#screen-daily-checkin{display:flex;flex-direction:column;min-height:var(--sc-vh,100svh);padding:0;}",
      "#screen-daily-checkin .sc-top{flex:0 0 auto;}",
      "#screen-daily-checkin .sc-wrap{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;padding-bottom:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;}",
      "#screen-daily-checkin .sc-head{min-height:var(--sc-head,auto);flex:0 0 auto;padding-top:18px;display:flex;flex-direction:column;}",
      "#screen-daily-checkin .sc-body{min-height:0;flex:1 1 auto;overflow-y:auto;overflow-x:hidden;margin-top:16px;}",
      "#screen-daily-checkin .sc-body > *:last-child{margin-bottom:auto;}",
      "#screen-daily-checkin .sc-chips{justify-content:flex-start;}",

      /* Stage-only responsive, on the SAME three breakpoints the Exit Slip
         uses (§04). The look side of each breakpoint lives in the DS block;
         what is left here is head padding and body offset.

         ⚠ The fourth block is this screen's own and has no slip twin: eight
         questions, two of them five-row scales, need a nudge at 820px of
         height that a ten-question slip of grids and chips does not. It sets
         STAGE properties only — never .sc-s padding — because DS's
         max-height:740 block owns the card and a rule here would outrank it
         on the phone where it matters most. */
      "@media (max-width:768px){",
      "  #screen-daily-checkin .sc-head{padding-top:14px;}",
      "  #screen-daily-checkin .sc-body{margin-top:13px;}",
      "}",
      "@media (max-width:430px){",
      "  #screen-daily-checkin .sc-head{padding-top:12px;}",
      "  #screen-daily-checkin .sc-body{margin-top:11px;}",
      "  #screen-daily-checkin .sc-scale{gap:6px;}",
      "}",
      /* ⚠ THE BARRIER QUESTION IS THE TIGHT ONE, and it is tight because of
         two things the fold cannot touch: the impact strip and the note door
         both sit OUTSIDE #scGroups, so fitFold can shed every chip it is
         allowed to and still be 12px over. Measured at 375×635. What is
         trimmed here is exactly that 12px, and it is trimmed from furniture
         — a caption's gap and four pixels of button — never from a choice. */
      "@media (max-height:740px){",
      "  #screen-daily-checkin .sc-head{padding-top:10px;}",
      "  #screen-daily-checkin .sc-body{margin-top:9px;}",
      "  #screen-daily-checkin .sc-scale{gap:6px;}",
      "  #screen-daily-checkin .sc-imp{margin-top:6px;}",
      "  #screen-daily-checkin .sc-imp-cap{margin-bottom:4px;font-size:11px;min-height:1.3em;}",
      "  #screen-daily-checkin .sc-imp-b{height:36px;}",
      "  #screen-daily-checkin .sc-tellrow{margin-top:10px;}",
      "  #screen-daily-checkin .sc-dot{width:26px;height:26px;}",
      "}",
      "@media (max-height:820px){",
      "  #screen-daily-checkin .sc-scale{gap:7px;}",
      "  #screen-daily-checkin .sc-body{margin-top:13px;}",
      "}",

      /* Safety net: the stage never grows past the viewport. If the answers
         still do not fit, they scroll inside their own block. */
      "#screen-daily-checkin{max-height:var(--sc-vh,none);overflow:hidden;}",

      /* ===== THE STAGE CAP BELONGS TO THE QUESTIONS ONLY (2026-08-27) ======
         ⚠ The cap above is `max-height` + `overflow:hidden` on the whole
         screen. That is right for the eight questions — they are measured to
         fit and must not move. It was catastrophic for the three screens that
         are NOT questions:

           · "You already checked in today" + the carry card
           · the closing screen + the carry card
           · "Your last few weeks" — the student's own chart

         Those are variable height by nature, and every one of them ends in
         buttons. Measured at 1366x768 with a real carry card: the content ran
         587px inside a 360px stage, so 284px was clipped — *Print a slip to
         keep*, *Check in again* and *Done* were all below the cut, and
         because the clip is on the screen and not the document, the page
         reported ZERO scrollable height. A student who finished the check-in
         could see neither what they took with them nor a way out.

         A terminal screen sizes to its content and lets the page scroll like
         any other page. `sc-free` is added by the three renderers and removed
         by renderStudent(), so the questions keep their guarantee. */
      "#screen-daily-checkin.sc-free{display:block;min-height:0;max-height:none;overflow:visible;padding:0 0 34px;}",
      /* ⚠ THE FREE STAGE MUST FREE THE SCROLLER TOO, NOT JUST THE SECTION.
         `.sc-wrap` carries overflow-y:auto and overscroll-behavior:contain,
         which are exactly right on a question screen — that pair is what
         keeps a one-viewport stage from rubber-banding the page underneath
         it. On a terminal screen the section becomes display:block with
         overflow:visible, the DOCUMENT is what scrolls, and `.sc-wrap` is
         left as a scroll container with nothing to scroll.

         `overscroll-behavior:contain` on a scroll container that CANNOT
         scroll still refuses to chain, so a wheel or trackpad gesture over
         the content did nothing at all — while the arrow keys, which scroll
         the document rather than the element under the pointer, worked fine.
         Jimmy, on his own closing screen: "I am unable to scroll down. I have
         to use the arrow keys." Reproduced exactly.

         So the free stage resets both. Same fix on the exit slip, because
         §20 says these two screens behave identically. */
      "#screen-daily-checkin.sc-free .sc-wrap{display:block;min-height:0;padding-bottom:12px;overflow:visible;overscroll-behavior:auto;}",
      "#screen-daily-checkin.sc-free .sc-done{overflow:visible;}",
      "#screen-daily-checkin.sc-free .sc-body{min-height:0;overflow:visible;overscroll-behavior:auto;}",
      "#screen-daily-checkin.sc-free .sc-nav{margin-top:22px;border-top:0;}",
      /* ⚠ A TERMINAL SCREEN MUST SCROLL FROM ANYWHERE ON IT.
         `overscroll-behavior:contain` is right on a question screen — it is
         what stops a one-viewport stage rubber-banding the page underneath.
         On a closing screen the document is what scrolls, and ANY contained
         scroll container under the pointer refuses to chain to it, even one
         with nothing of its own to scroll. The result is a page that moves
         with the arrow keys (which scroll the document) and not with a wheel
         or a trackpad (which scroll whatever is under the pointer).

         Jimmy reported exactly that on his own closing screen. It could not
         be reproduced headless, so this is written as a BLANKET release over
         the whole free stage rather than a fix aimed at one element: nothing
         on a terminal screen wants containment, so nothing on one gets it. */
      "#screen-daily-checkin.sc-free, #screen-daily-checkin.sc-free *{overscroll-behavior:auto;}"
    ].join("\n");
    document.head.appendChild(s);
  }

  function scaleColor(v) {
    return ["#8B2A2A", "#A9542C", "#8A6D1F", "#4A7A46", "#2E6B3A"][v - 1] || "#46566B";
  }

  /* THE NUMBER IS STORED, NEVER SHOWN. A 1-5 printed on a button a thirteen-
     year-old is about to press reads as a mark out of five, and "I got a 1
     today" is the exact sentence this instrument exists to not produce. The
     value still goes to the sheet as 1-5 for the teacher's trend; the student
     sees a rising ladder and the word. Shape carries the intensity, so the
     meaning survives color-blindness and grayscale printing both. */
  function scaleGlyph(v, col, off) {
    /* `off` is the ghost-bar opacity. On a colored disc the ghosts are white
       at .3 and read fine; on a white cell they are ink, and .3 ink is dark
       enough that all five cells look alike at arm's length -- which defeats
       the point of using shape. The impact strip passes a fainter one. */
    var c = col || "#fff", o0 = off || ".3", bars = "";
    for (var i = 1; i <= 5; i++) {
      var h = 3 + i * 2.4;
      bars += '<rect x="' + (i * 3.4 - 2.1).toFixed(1) + '" y="' + (16 - h).toFixed(1) +
        '" width="2.2" height="' + h.toFixed(1) + '" rx="1" fill="' + c +
        '" opacity="' + (i <= v ? "1" : o0) + '"/>';
    }
    return '<svg viewBox="0 0 18 18" width="18" height="17" aria-hidden="true" focusable="false" style="display:block;">' + bars + "</svg>";
  }

  function ensureStudentScreen() {
    if (el("screen-daily-checkin")) return el("screen-daily-checkin");
    var host = el("screen-welcome");
    if (!host || !host.parentNode) return null;
    var sec = document.createElement("section");
    sec.id = "screen-daily-checkin";
    sec.className = "screen";
    host.parentNode.appendChild(sec);
    return sec;
  }

  /* ------------------------------------------------- a page that holds still
     Jimmy, 2026-08-25: "make this page so it doesn't move after each question."

     Three separate things were moving, and all three are fixed here rather
     than smoothed over:

       1 · EVERY TAP REBUILT THE SCREEN. Choosing an option called
           renderStudent(), which replaced the whole innerHTML just to paint one
           border. The DOM was destroyed and rebuilt under the user's finger.
           Selection is now toggled IN PLACE; nothing re-renders on a tap.

       2 · EACH QUESTION WAS A DIFFERENT HEIGHT. Five scale rows, then fourteen
           chips, then a textarea — so the buttons landed somewhere new every
           time and the page grew and shrank underneath you. The question block
           and the answer block are now measured across ALL SEVEN steps once,
           and both are pinned to the tallest. Question 1 and question 7 put
           their controls at the same pixel.

       3 · CONTROLS APPEARED AND DISAPPEARED. Back only existed from step 2,
           Skip only on optional steps, and the italic line only on step 1.
           All three are always in the layout now — hidden with `visibility`,
           which keeps the space, never `display`, which collapses it.

     If you add an eighth question, you change nothing here: the measuring pass
     reads STEPS. */

  /* --------------------------------------------------------- the ribbon
     §10 · the same navigation language as the exit slip: four named beats
     above, the plain count below. */
  function ribbonHtml(st) {
    var here = PHASES.map(function (p) { return p.k; }).indexOf(st.phase);
    return '<div class="sc-ribbon" role="presentation">' +
      PHASES.map(function (p, i) {
        var cls = i < here ? "done" : i === here ? "now" : "";
        return '<div class="sc-beat ' + cls + '"><b>' + esc(T(p.en, p.es)) + "</b><i></i></div>";
      }).join("") + "</div>";
  }

  function stepHeadHtml(st) {
    return '<h1 class="sc-q">' + esc(T(st.q[0], st.q[1])) + "</h1>" +
      '<p class="sc-sub">' + esc(T(st.sub[0], st.sub[1]) || " ") + "</p>" +
      /* One line, the same on every screen this session. Rotating it per step
         would move the block whenever a longer line wrapped to two. */
      '<p class="sc-micro">' + esc(micro()) + "</p>";
  }

  /* ------------------------------------------------------- the bank body
     §08 · ONE SELECTION COMPONENT. This is the exit slip's bankHtml with
     the class prefix changed, and that is on purpose: same ids in spirit,
     same classes, same behavior, same escape row, same More control. The
     CODE is duplicated rather than shared for the same reason the stage is
     — each screen's copy lives inside its own IIFE and exports none of it
     — but the CONTRACT is single, and it is written down here and there.
     If you change how a fold behaves, change both. */
  function pickedList(k) { return (SD.a[k] || "").split(",").filter(Boolean); }

  function chipHtml(k, o) {
    var on = pickedList(k).indexOf(o[0]) !== -1;
    return '<button type="button" class="sc-chip' + (on ? " on" : "") + '" data-c="' + esc(o[0]) +
      '" aria-pressed="' + (on ? "true" : "false") + '">' + esc(T(o[0], o[1])) + "</button>";
  }

  function bankHtml(st) {
    var b = st.bank;
    SD.foldKey = st.k;
    var open = !!(SD.open && SD.open[st.k]);
    return '<div id="scGroups">' +
        (b.groups || []).map(function (g) {
          return '<div class="sc-g"><div class="sc-gh">' + esc(T(g.h[0], g.h[1])) + "</div>" +
            '<div class="sc-chips">' + g.o.map(function (o) { return chipHtml(st.k, o); }).join("") +
            "</div></div>";
        }).join("") +
      "</div>" +
      '<div id="scMoreBox"' + (open ? "" : " hidden") + "></div>" +
      '<button type="button" class="sc-more" id="scMore" hidden aria-expanded="false" aria-controls="scMoreBox">' +
        '<span class="mt">' + esc(T("More choices", "Más opciones")) + "</span>" +
        '<span class="cv" aria-hidden="true">▾</span></button>' +
      ((b.escape && b.escape.length)
        ? '<div class="sc-esc"><div class="sc-chips">' +
          b.escape.map(function (o) { return chipHtml(st.k, o); }).join("") + "</div></div>"
        : "");
  }

  /* ⚠ THE FOLD IS MEASURED AGAINST THE BOX, NOT GUESSED. Counting options
     fails because the thing that runs out is PIXELS: no option count is
     right across an iPhone X's 292px answer box and a Chromebook's 800px
     one. bankHtml renders EVERY group and this moves trailing content into
     the More fold until the box stops overflowing. What that buys:

         A STUDENT NEVER SCROLLS TO SEE THE CHOICES THEY WERE HANDED.
         Scrolling happens only after they ask for more.

     §17's "about 6-8 initially" is honored in spirit and beaten in fact.
     Same function, same guarantee, same wording as the exit slip's. */
  function fitFold(sec) {
    var body = sec.querySelector(".sc-body");
    var groups = el("scGroups"), box = el("scMoreBox"), btn = el("scMore");
    if (!body || !groups || !box) return;

    /* Fit against the CLOSED state, whatever the student left open — an
       expanded fold is allowed to scroll, a fresh screen is not. */
    var wasOpen = !box.hidden;
    box.hidden = true;
    if (btn) btn.hidden = true;

    var over = function () { return body.scrollHeight - body.clientHeight; };
    var moved = false, guard = 0;
    function reserve() {
      /* The More button costs height too, so it goes on the moment anything
         moves — otherwise the last group is trimmed to fit a box that then
         grows by 40px and overflows again. */
      if (moved && btn && btn.hidden) btn.hidden = false;
    }

    /* whole groups first, last one back — a heading is never orphaned */
    while (over() > 1 && groups.children.length > 1 && guard++ < 40) {
      box.insertBefore(groups.lastElementChild, box.firstChild);
      moved = true; reserve();
    }

    /* then, inside whatever single group is left, trailing chips — under a
       copy of that group's own heading so the fold still reads as itself */
    if (over() > 1 && groups.children.length === 1) {
      var g = groups.firstElementChild;
      var chips = g.querySelector(".sc-chips");
      var head = g.querySelector(".sc-gh");
      var spill = null;
      while (over() > 1 && chips && chips.children.length > 2 && guard++ < 120) {
        if (!spill) {
          spill = document.createElement("div");
          spill.className = "sc-g";
          if (head) {
            var h = document.createElement("div");
            h.className = "sc-gh";
            h.textContent = head.textContent;
            spill.appendChild(h);
          }
          var wrap = document.createElement("div");
          wrap.className = "sc-chips";
          spill.appendChild(wrap);
          box.insertBefore(spill, box.firstChild);
        }
        spill.querySelector(".sc-chips").insertBefore(chips.lastElementChild, spill.querySelector(".sc-chips").firstChild);
        moved = true; reserve();
      }
    }

    var hasMore = box.children.length > 0;
    if (btn) {
      btn.hidden = !hasMore;
      btn.setAttribute("aria-expanded", (hasMore && wasOpen) ? "true" : "false");
      var lab = btn.querySelector(".mt");
      if (lab) lab.textContent = (hasMore && wasOpen) ? T("Fewer choices", "Menos opciones") : T("More choices", "Más opciones");
    }
    box.hidden = !(hasMore && wasOpen);
    if (SD.open && SD.foldKey) SD.open[SD.foldKey] = !!(hasMore && wasOpen);
  }

  /* Removing content does not change .sc-body's height — it is flex:1 1 auto
     inside a stage of known height — so this cannot feed itself. The guard is
     belt and braces for a browser that disagrees. */
  var SC_BOXOBS = null, SC_FOLDING = false;
  function watchBox(sec) {
    try {
      if (!window.ResizeObserver) return;
      var body = sec.querySelector(".sc-body");
      if (!body) return;
      if (SC_BOXOBS) SC_BOXOBS.disconnect();
      SC_BOXOBS = new ResizeObserver(function () {
        if (SC_FOLDING) return;
        SC_FOLDING = true;
        try { fitFold(sec); } catch (e) {}
        SC_FOLDING = false;
      });
      SC_BOXOBS.observe(body);
    } catch (e) {}
  }

  /* §15 · §19 · WRITING IS A DOOR, NEVER A FIELD.
     "Optional: Add a note." — never "Explain yourself." An always-open
     textarea makes the second claim whatever the placeholder says, and it
     also cost more height than the answer box has: measured at 375×635, the
     barrier question overflowed by 52px and the tell-an-adult question by
     49px, both entirely because of a box nobody had asked for yet. The exit
     slip had already solved this with one control (§15's "I’ll write
     something"), so the check-in wears the same one.

     ⚠ THE TEXTAREA KEEPS id="scText" WHEN IT OPENS. wireStudent binds the
     input handler to that id and the record reads from it; renaming it here
     would silently stop saving what a student wrote.

     ⚠ IT OPENS ITSELF IF THERE IS ALREADY TEXT. Coming Back to a question
     you wrote on must not hide what you wrote behind a button. */
  function writeDoorHtml(st, label, placeholder, rows) {
    var k = st.k;
    var val = (k === "tellAdult") ? (SD.a.tellAdult || "") : (SD.a[k + "_text"] || "");
    var open = !!(SD.write && SD.write[k]) || !!String(val).trim();
    if (open) {
      return '<textarea class="sc-text" id="scText" rows="' + (rows || 2) + '" placeholder="' +
        esc(placeholder) + '">' + esc(val) + "</textarea>";
    }
    return '<div class="sc-tellrow"><button type="button" class="sc-ghost" id="scWrite">' +
      esc(label) + "</button></div>";
  }

  function stepBodyHtml(st) {
    if (st.kind === "scale") {
      return '<div class="sc-scale">' + st.opts.map(function (o) {
        var on = SD.a[st.k] === o.v;
        var lab = T(o.en, o.es);
        return '<button type="button" class="sc-s' + (on ? " on" : "") + '" data-v="' + o.v +
          '" aria-label="' + esc(lab) + '" aria-pressed="' + (on ? "true" : "false") + '">' +
          /* ⚠ NO NUMBER AND NO SEVERITY COLOR. See the .sc-dot note in the
             stylesheet: the ladder carries the intensity, the aria-label
             carries the word, and the disc belongs to the one palette. */
          '<span class="sc-dot">' + scaleGlyph(o.v, "currentColor", ".26") + "</span>" +
          '<span class="lab">' + esc(lab) + "</span></button>";
      }).join("") + "</div>";
    }
    if (st.kind === "bank") {
      return bankHtml(st) +
      (st.textToo
        ? writeDoorHtml(st, T("Add a note", "Agregar una nota"),
            T("Or write your own (optional)", "O escribe la tuya (opcional)"), 2)
        : "") +
      (st.impact ? impactHtml() : "");
    }
    /* the tell-an-adult step */
    var seen = anAdultWillSeeThis()
      ? T("A teacher will read this. That is the point of the question — it is how you get help without having to start the conversation yourself.",
          "Un maestro leerá esto. Ese es el punto de la pregunta — así puedes pedir ayuda sin tener que empezar tú la conversación.")
      : T("This device isn’t connected to your school, so nothing here is sent anywhere. It stays on this device. If you want an adult to know something, tell them or show them this screen.",
          "Este dispositivo no está conectado a tu escuela, así que nada de esto se envía. Se queda aquí. Si quieres que un adulto sepa algo, díselo o muéstrale esta pantalla.");
    return '<div class="sc-seen"><strong>' + esc(T("Who reads this", "Quién lee esto")) + ":</strong> " + esc(seen) + "</div>" +
      writeDoorHtml({ k: "tellAdult" }, T("I’ll write something", "Quiero escribir algo"),
        T("You can leave this blank.", "Puedes dejarlo en blanco."), 4) +
      '<label class="sc-talk"><input type="checkbox" id="scTalk"' + (SD.a.talk ? " checked" : "") + "><span>" +
        esc(T("I would like to talk with someone.", "Me gustaría hablar con alguien.")) + "</span></label>";
  }

  /* --------------------------------------------------------- BARRIER IMPACT
     Always in the DOM, so the barrier screen is exactly as tall before a chip
     is tapped as after one. It is revealed with `visibility`, never `display`
     -- collapsing it would move every control below it the instant a student
     touched a chip, which is the one thing this screen promises not to do.
     Asking "how much is it getting in the way" before they have named anything
     is nonsense, so it stays hidden until they do, and un-answers itself if
     they take the barrier back. */
  function barrierNamed() {
    var picked = (SD.a.challenge || "").split(",").filter(function (x) {
      return x && x !== "Nothing today";
    });
    return picked.length > 0 || !!String(SD.a.challenge_text || "").trim();
  }
  function impactCaption(v) {
    var q = T("How much is it getting in the way?", "\u00bfCu\u00e1nto te est\u00e1 estorbando?");
    var w = impactWord(v);
    return w ? q + "   " + w : q;
  }
  function impactHtml() {
    var v = SD.a.challengeImpact, on = barrierNamed();
    return '<div class="sc-imp' + (on ? "" : " off") + '" id="scImp"' + (on ? "" : ' aria-hidden="true"') + '>' +
      '<p class="sc-imp-cap" id="scImpCap">' + esc(impactCaption(v)) + "</p>" +
      '<div class="sc-imp-row">' + IMPACT.map(function (o) {
        var sel = v === o.v;
        return '<button type="button" class="sc-imp-b' + (sel ? " on" : "") + '" data-iv="' + o.v +
          '" aria-label="' + esc(T(o.en, o.es)) + '" aria-pressed="' + (sel ? "true" : "false") + '"' +
          (on ? "" : ' tabindex="-1"') + ">" + scaleGlyph(o.v, "currentColor", ".16") + "</button>";
      }).join("") + "</div></div>";
  }
  function syncImpact() {
    var box = el("scImp");
    if (!box) return;
    var on = barrierNamed();
    box.classList.toggle("off", !on);
    if (on) box.removeAttribute("aria-hidden"); else box.setAttribute("aria-hidden", "true");
    var btns = box.querySelectorAll(".sc-imp-b");
    Array.prototype.forEach.call(btns, function (b) {
      if (on) b.removeAttribute("tabindex"); else b.setAttribute("tabindex", "-1");
      if (!on) { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); }
    });
    if (!on) SD.a.challengeImpact = null;
    var cap = el("scImpCap");
    if (cap) cap.textContent = impactCaption(on ? SD.a.challengeImpact : null);
  }

  /* Measure every step off-screen, at the real content width, and pin both
     blocks to the tallest. Runs once per width; re-runs on resize or a
     language switch, both of which change how the text wraps. */
  var SC_MEASURED = { w: 0, lang: "" };
  function measureSteps(sec) {
    var wrap = sec.querySelector(".sc-wrap");
    if (!wrap) return;
    var w = Math.round(wrap.clientWidth);
    var lang = isEs() ? "es" : "en";
    if (!w) return;
    if (SC_MEASURED.w === w && SC_MEASURED.lang === lang) return;

    /* Measure at the real CONTENT width, with the padding stripped off the
       ghost. Setting the ghost to clientWidth and leaving .sc-wrap's own
       20px padding on it made the ghost's text column WIDER than the real
       one wherever the host page does not set box-sizing:border-box — so the
       longest question wrapped to fewer lines in the ghost than on screen,
       the measured maximum came in short, and that one question still pushed
       everything below it down. This is what that bug looked like: six
       questions pinned, the seventh 22px lower. */
    var cs = window.getComputedStyle(wrap);
    var inner = Math.max(120, w - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0));

    var ghost = document.createElement("div");
    ghost.setAttribute("aria-hidden", "true");
    ghost.className = "sc-wrap";
    ghost.style.cssText = "position:absolute;left:-99999px;top:0;visibility:hidden;pointer-events:none;" +
      "width:" + inner + "px;max-width:none;padding:0;margin:0;";
    sec.appendChild(ghost);

    /* ⚠ ONLY THE QUESTION BLOCK IS MEASURED NOW. --sc-body used to be
       pinned to the tallest of the eight bodies, from back when the answers
       sized to their content. Inside the one-viewport stage .sc-body is
       flex:1 1 auto with min-height:0, so that variable had no effect and was
       dead weight. Rendering the bodies into the ghost also briefly duplicated
       the fold's element ids (#scGroups, #scMoreBox, #scMore) in the live
       document, and fitFold looks those up BY ID — a trap waiting for the
       first render that let anything run between the two. Heads only. */
    var maxHead = 0;
    STEPS.forEach(function (st) {
      ghost.innerHTML = '<div class="sc-head">' + stepHeadHtml(st) + "</div>";
      maxHead = Math.max(maxHead, ghost.firstChild.offsetHeight);
    });
    sec.removeChild(ghost);
    sec.style.setProperty("--sc-head", maxHead + "px");
    SC_MEASURED.w = w;
    SC_MEASURED.lang = lang;
  }

  /* The stage is one viewport minus whatever sits above it. The top bar wraps
     to two rows on a phone, so this is measured rather than assumed, and
     re-measured on resize and orientation change. Without it the page scrolled
     on every question at every size — 61px at 1440x820, 161px at 1280x720. */
  /* Which kind of screen is on the stage. Called by every renderer so the
     state can never be left behind by the previous one. */
  function stageFree(sec, free) {
    if (!sec || !sec.classList) return;
    if (free) sec.classList.add("sc-free");
    else { sec.classList.remove("sc-free"); fitStage(sec); }
  }
  function fitStage(sec) {
    if (!sec) return;
    /* A freed screen has no cap to fit, and measuring one would set --sc-vh
       from a document that is legitimately taller than the window. */
    if (sec.classList && sec.classList.contains("sc-free")) return;
    try {
      /* ⚠ window.innerHeight IS NOT WHAT AN iPHONE SHOWS YOU. iOS Safari
         reports the LARGE viewport — the height with the toolbars collapsed —
         while the student is looking at the small one with the address bar and
         the tab bar in the way. On an iPhone X that is a 89 px lie, and a
         stage measured 89 px too tall makes every single question scroll a
         little, which is exactly what "there is a lot of scrolling" feels
         like. visualViewport.height is what is genuinely visible. It is also
         what shrinks when the keyboard opens on question 7. */
      var vh = window.innerHeight;
      try {
        if (window.visualViewport && window.visualViewport.height) {
          vh = Math.min(vh, Math.round(window.visualViewport.height));
        }
      } catch (e) {}
      var top = sec.getBoundingClientRect().top + (window.scrollY || 0);
      var h = Math.max(360, Math.round(vh - top));
      sec.style.setProperty("--sc-vh", h + "px");
      /* Whatever else the page puts below this screen — a footer outside
         <main>, a floating helper — is not knowable from here, so the stage
         is corrected by what the document ACTUALLY overflows by. Shrink
         only, once, so this can settle but never oscillate. */
      var pass = function () {
        var over = document.documentElement.scrollHeight - window.innerHeight;
        if (over > 0) {
          sec.style.setProperty("--sc-vh", Math.max(360, h - over) + "px");
        }
      };
      if (window.requestAnimationFrame) window.requestAnimationFrame(pass); else setTimeout(pass, 0);
    } catch (e) {}
  }
  (function () {
    var t = null;
    function again() {
      clearTimeout(t);
      t = setTimeout(function () { fitStage(document.getElementById("screen-daily-checkin")); }, 120);
    }
    window.addEventListener("resize", again);
    window.addEventListener("orientationchange", again);
    /* iOS collapses its toolbars on the first scroll and restores them on a
       tap, and neither fires a window resize. visualViewport does. */
    try {
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", again);
        window.visualViewport.addEventListener("scroll", again);
      }
    } catch (e) {}
  })();

  /* Belt for the measuring pass: if a rendered block still comes out taller
     than the pinned floor — a font that loaded late, a wrap the ghost did not
     reproduce — raise the floor to it and keep it raised. It can only ever
     grow, so it settles after one question and never oscillates. */
  function holdFloor(sec) {
    ["head"].forEach(function (which) {
      var elx = sec.querySelector(".sc-" + which);
      if (!elx) return;
      var have = parseFloat(sec.style.getPropertyValue("--sc-" + which)) || 0;
      var real = elx.offsetHeight;
      if (real > have + 0.5) sec.style.setProperty("--sc-" + which, real + "px");
    });
  }

  function renderStudent() {
    var sec = ensureStudentScreen();
    if (!sec) return;
    injectStudentCss();
    /* ⚠ SHOW BEFORE MEASURING. This is the exit slip's hardest-won lesson and
       this screen had never learned it. fitStage reads getBoundingClientRect
       and then corrects itself, shrink-only, by whatever the DOCUMENT
       overflows by — so if it runs while the rest of the site is still laid
       out, that overflow is the entire page and the correction slams --sc-vh
       straight onto its 360px floor.

       Measured on a per-student link at 1366×768 before this line existed:
       a 360px stage holding a 111px question and a 308px scale block inside a
       77px answer box. 231px of question one behind an internal scroll — on
       the exact path every student uses. It hid for weeks because every test
       and every teacher demo TYPED A CODE, and that path renders a second
       time after showScreen has already run. The links did not.

       Showing first also means body.aog-survey-focus has already taken the
       site header out of the measurement, which is the other half of it. */
    if (!sec.classList.contains("active") && typeof showScreen === "function") showScreen("screen-daily-checkin");
    /* Back to a measured question — the cap applies again. */
    stageFree(sec, false);
    /* Which banks the student has opened, so a Back does not slam the fold
       shut on them. Lives on SD so it is cleared with the rest of a session. */
    SD.open = SD.open || {};
    SD.write = SD.write || {};

    var locked = lockedStudent();
    if (locked) SD.studentId = locked;
    if (!SD.studentId) { renderStudentId(sec); return; }

    var st = STEPS[SD.step];
    var total = STEPS.length;
    var answered = st.kind === "scale" ? SD.a[st.k] != null : true;
    var lastStep = SD.step === total - 1;

    sec.innerHTML =
      '<div class="sc-top">' + ribbonHtml(st) +
        '<div class="sc-meta"><span>' + esc(T("Daily check-in", "Registro diario")) + "</span>" +
        '<span class="sc-count" aria-live="polite">' +
          esc(T("Question ", "Pregunta ") + (SD.step + 1) + T(" of ", " de ") + total) +
        "</span></div></div>" +
      '<div class="sc-wrap">' +
        '<div class="sc-head">' + stepHeadHtml(st) + "</div>" +
        '<div class="sc-body">' + stepBodyHtml(st) + "</div>" +
        /* §10 · the exit slip's nav, control for control: Back on the left,
           the forward button on the right, a rule above them. Every control
           exists on every screen — a hidden one keeps its space with
           `visibility`, never `display`, so Next lands on the same pixel on
           all eight questions. */
        '<div class="sc-nav">' +
          '<button type="button" class="sc-back" id="scBack"' +
            (SD.step > 0 ? "" : ' style="visibility:hidden;" tabindex="-1" aria-hidden="true"') + ">← " +
            esc(T("Back", "Atrás")) + "</button>" +
          '<button type="button" class="sc-skip" id="scSkip"' +
            (st.required ? ' style="visibility:hidden;" tabindex="-1" aria-hidden="true"' : "") + ">" +
            esc(T("Skip this one", "Saltar esta")) + "</button>" +
          '<button type="button" class="sc-next" id="scNext"' + (st.required && !answered ? " disabled" : "") + ">" +
            esc(lastStep ? T("Finish", "Terminar") : T("Next", "Siguiente")) + "</button>" +
        "</div>" +
      "</div>";

    measureSteps(sec);
    holdFloor(sec);
    fitStage(sec);
    /* .30fg — after a step renders, put focus on the question so a keyboard
       user is not sent back through the header; group the answers under it. */
    try {
      var _q = sec.querySelector(".sc-q");
      if (_q) { if (!_q.id) _q.id = "scQ"; _q.setAttribute("tabindex", "-1"); if (SD.step > 0 || window.__aogScFocusOnce) _q.focus({ preventScroll: true }); window.__aogScFocusOnce = true; }
      var _b = sec.querySelector(".sc-body");
      if (_b && _q) { _b.setAttribute("role", "group"); _b.setAttribute("aria-labelledby", _q.id); }
    } catch (_e) {}
    wireStudent(st);
    /* ⚠ THE FOLD CANNOT BE A ONE-SHOT. fitStage sets --sc-vh and then corrects
       it once more inside a requestAnimationFrame, so a fitFold called on the
       same tick measures a box that is about to get shorter — it folds to a
       height that does not exist and the screen overflows by exactly the
       correction. On the exit slip that was 74px on question 2 at 375x635,
       with fitFold having run and believing it was done. So the fold is
       driven by the BOX: once after layout settles, and after that whenever
       .sc-body actually changes height — a rotation, iOS collapsing its
       toolbars, the keyboard opening on question 7. */
    if (window.requestAnimationFrame) window.requestAnimationFrame(function () { fitFold(sec); });
    else setTimeout(function () { fitFold(sec); }, 0);
    watchBox(sec);
  }

  function renderStudentId(sec) {
    sec.innerHTML =
      '<div class="sc-top"><div class="sc-meta"><span>' + esc(T("Daily check-in", "Registro diario")) + "</span></div></div>" +
      '<div class="sc-wrap">' +
        '<h1 class="sc-q">' + esc(T("What’s your student code?", "¿Cuál es tu código de estudiante?")) + "</h1>" +
        /* ⚠ DO NOT ASSUME A REFLECTION CAME FIRST. This line used to say only
           "the same one you use for the self-reflection", which is a dead end
           for a class that has never taken one — and a dead end in front of a
           text box is how a thirteen-year-old ends up typing their name into
           a field that says not to. The fallback is the one the reflection
           itself already sanctions ("initials, a seat number, or a roster ID
           you keep on your own paper"), so there is one convention in this
           product and not two. "The same one every time" is the part that
           makes a check-in join up tomorrow. 2026-08-28. */
        '<p class="sc-sub">' + esc(T("Use the same code as your self-reflection. No code yet? Use your initials and seat number, like JR12, every time. Not your full name.",
                                     "Usa el mismo código de tu autorreflexión. ¿Aún no tienes? Usa tus iniciales y tu número de asiento, como JR12, siempre. No tu nombre completo.")) + "</p>" +
        '<div class="sc-id"><input class="sc-in" id="scId" autocomplete="off" aria-label="' + esc(T("Your student code", "Tu código de estudiante")) + '" placeholder="' +
          esc(T("Your code", "Tu código")) + '" value="' + esc(SD.studentId || "") + '"></div>' +
        '<p id="scIdErr" class="sc-err" role="alert" hidden></p>' +
        '<div class="sc-nav"><button type="button" class="sc-next" id="scIdGo">' +
          esc(T("Start", "Comenzar")) + "</button></div>" +
      "</div>";
    fitStage(sec);
    var go = el("scIdGo"), inp = el("scId");
    function start() {
      var v = (inp ? inp.value : "").trim();
      if (!v) {
        if (inp) { inp.focus(); inp.setAttribute("aria-invalid", "true"); }
        var er = el("scIdErr");
        if (er) { er.textContent = T("Type your code to begin — your initials and seat number work.", "Escribe tu código para comenzar — tus iniciales y número de asiento sirven."); er.hidden = false; }
        return;
      }
      if (inp) inp.removeAttribute("aria-invalid");
      SD.studentId = v;
      SD.step = 0;
      if (offerTodaysCard(v)) return;
      renderStudent();
    }
    if (go) go.addEventListener("click", start);
    if (inp) inp.addEventListener("keydown", function (e) { if (e.key === "Enter") start(); });
  }

  function wireStudent(st) {
    var next = el("scNext");

    /* --- scale: paint the choice in place. No re-render, so nothing moves. */
    var scaleBtns = document.querySelectorAll("#screen-daily-checkin .sc-s");
    Array.prototype.forEach.call(scaleBtns, function (b) {
      b.addEventListener("click", function () {
        SD.a[st.k] = parseInt(b.getAttribute("data-v"), 10);
        Array.prototype.forEach.call(scaleBtns, function (o) {
          var on = o === b;
          o.classList.toggle("on", on);
          o.setAttribute("aria-pressed", on ? "true" : "false");
        });
        if (next) next.disabled = false;
      });
    });

    /* --- chips: same. Hitting the max un-paints the oldest choice rather than
           refusing the tap, so the control never looks broken or frozen. */
    var chipBtns = document.querySelectorAll("#screen-daily-checkin .sc-chip");
    Array.prototype.forEach.call(chipBtns, function (b) {
      b.addEventListener("click", function () {
        var c = b.getAttribute("data-c");
        var picked = (SD.a[st.k] || "").split(",").filter(Boolean);
        var at = picked.indexOf(c);
        if (at !== -1) picked.splice(at, 1);
        else {
          picked.push(c);
          while (picked.length > (st.max || 3)) picked.shift();
        }
        SD.a[st.k] = picked.join(",");
        Array.prototype.forEach.call(chipBtns, function (o) {
          var on = picked.indexOf(o.getAttribute("data-c")) !== -1;
          o.classList.toggle("on", on);
          o.setAttribute("aria-pressed", on ? "true" : "false");
        });
        if (st.impact) syncImpact();
      });
    });

    /* --- barrier impact: same in-place painting, and it only accepts a tap
           once a barrier has actually been named. */
    var impBtns = document.querySelectorAll("#screen-daily-checkin .sc-imp-b");
    Array.prototype.forEach.call(impBtns, function (b) {
      b.addEventListener("click", function () {
        var box = el("scImp");
        if (box && box.classList.contains("off")) return;
        SD.a.challengeImpact = parseInt(b.getAttribute("data-iv"), 10);
        Array.prototype.forEach.call(impBtns, function (o) {
          var on = o === b;
          o.classList.toggle("on", on);
          o.setAttribute("aria-pressed", on ? "true" : "false");
        });
        var cap = el("scImpCap");
        if (cap) cap.textContent = impactCaption(SD.a.challengeImpact);
      });
    });

    var txt = el("scText");
    if (txt) txt.addEventListener("input", function () {
      if (st.kind === "tell") SD.a.tellAdult = txt.value;
      else SD.a[st.k + "_text"] = txt.value;
      if (st.impact) syncImpact();
    });
    var talk = el("scTalk");
    if (talk) talk.addEventListener("change", function () { SD.a.talk = talk.checked; });

    /* §15 · the writing door. One tap opens the box; nothing is required. */
    var wr = el("scWrite");
    if (wr) wr.addEventListener("click", function () {
      SD.write = SD.write || {};
      SD.write[st.k] = true;
      renderStudent();
      var t = el("scText"); if (t) { try { t.focus(); } catch (e) {} }
    });

    /* §17 · the fold. Same control, same labels, same aria as the slip's. */
    var more = el("scMore");
    if (more) more.addEventListener("click", function () {
      var box = el("scMoreBox");
      if (!box) return;
      var open = box.hidden;
      box.hidden = !open;
      more.setAttribute("aria-expanded", open ? "true" : "false");
      var lab = more.querySelector(".mt");
      if (lab) lab.textContent = open ? T("Fewer choices", "Menos opciones") : T("More choices", "Más opciones");
      if (SD.open && SD.foldKey) SD.open[SD.foldKey] = open;
    });

    var back = el("scBack");
    if (back) back.addEventListener("click", function () {
      if (SD.step > 0) SD.step--;
      renderStudent();
      keepInView();
    });

    /* Jumping to the top when nothing needed to move is itself movement. Only
       rescue the case where the window is short and the user had to scroll
       down to reach the button. */
    function keepInView() {
      try {
        var h = document.querySelector("#screen-daily-checkin .sc-head");
        if (!h) return;
        var box = h.getBoundingClientRect();
        if (box.top < 0 || box.top > (window.innerHeight || 800) * 0.5) {
          window.scrollTo({ top: Math.max(0, window.scrollY + box.top - 90), behavior: "instant" });
        }
      } catch (e) {}
    }

    function advance() {
      if (SD.step >= STEPS.length - 1) { finishStudent(); return; }
      SD.step++;
      renderStudent();
      keepInView();
    }
    if (next) next.addEventListener("click", advance);
    var skip = el("scSkip");
    if (skip) skip.addEventListener("click", advance);
  }

  /* A width change re-wraps the text, so the pinned heights are re-measured. */
  (function watchWidth() {
    var t = null;
    window.addEventListener("resize", function () {
      if (t) clearTimeout(t);
      t = setTimeout(function () {
        var sec = el("screen-daily-checkin");
        if (!sec || !sec.querySelector(".sc-body")) return;
        SC_MEASURED.w = 0;
        measureSteps(sec);
      }, 180);
    });
  })();

  function studentStore() { return jload(SKEY, { logs: {} }); }

  /* ------------------------------------------------------------ TODAY'S CARRY
     One move and one line out of what they just said. The engine is in
     #aog-carry; this is only the wiring. If that block is ever removed the
     check-in still finishes normally — every call here is guarded. */
  function carryFor(rec) {
    try { return window.AOGCarry["for"](rec); } catch (e) { return null; }
  }
  function carryCardHtml(rec) {
    try { return window.AOGCarry.cardHtml(carryFor(rec)) || ""; } catch (e) { return ""; }
  }
  function todaysEntries(sid) {
    var days = (studentStore().logs || {})[sid] || {};
    return (days[todayISO()] || []).slice();
  }
  /* Coming back to the same link later in the day shows this morning's card
     instead of restarting the seven questions. Checking in AGAIN is still one
     tap — several a day has always been supported and stays supported. */
  function offerTodaysCard(sid) {
    var arr = todaysEntries(sid);
    if (!arr.length) return false;
    var rec = arr[arr.length - 1];
    var card = carryCardHtml(rec);
    if (!card) return false;
    var sec = ensureStudentScreen();
    if (!sec) return false;
    injectStudentCss();
    stageFree(sec, true);
    sec.innerHTML =
      '<div class="sc-top"><div class="sc-meta"><span>' + esc(T("Today", "Hoy")) + "</span></div></div>" +
      '<div class="sc-wrap"><div class="sc-done" style="padding:28px 4px 8px;">' +
        "<h2>" + esc(T("You already checked in today.", "Ya hiciste tu registro hoy.")) + "</h2>" +
        "<p>" + esc(T("Here is what you took with you.", "Esto es lo que te llevaste.")) + "</p>" +
        card +
        '<div style="margin:2px 0 4px;"><button type="button" class="cy-slip" id="cySlip2">' +
          esc(T("Print a slip to keep", "Imprimir una tarjeta para llevar")) + "</button></div>" +
        '<div class="sc-nav cy-row" style="justify-content:center;border-top:0;gap:10px;flex-wrap:wrap;">' +
          '<button type="button" class="sc-next" id="cyAgain">' + esc(T("Check in again", "Registrarme otra vez")) + "</button>" +
          '<button type="button" class="sc-ghost" id="cyDone">' + esc(T("Done", "Listo")) + "</button>" +
        "</div>" +
      "</div></div>";
    if (typeof showScreen === "function") showScreen("screen-daily-checkin");
    var sl = el("cySlip2");
    if (sl) sl.addEventListener("click", function () {
      try { window.AOGCarry.printSlip(carryFor(rec)); } catch (e) {}
    });
    var ag = el("cyAgain");
    if (ag) ag.addEventListener("click", function () {
      SD = { step: 0, studentId: sid, a: {} };
      renderStudent();
    });
    var dn = el("cyDone");
    if (dn) dn.addEventListener("click", function () {
      if (typeof resetToStart === "function") resetToStart();
      else if (typeof showScreen === "function") showScreen("screen-welcome");
    });
    return true;
  }

  /* Several check-ins in one day has always been supported, and the whole
     point of it is that a 7:55 and an 11:20 are DIFFERENT mornings -- averaging
     them into one number is how a post-incident 1 disappears into a fine day.
     Nothing is asked for this: the clock already knows, and a question a
     student has to answer twice is a question they stop answering. */
  function contextTagNow(sid) {
    var h = new Date().getHours();
    var slot = h < 11 ? "Morning" : h < 13 ? "Midday" : "Afternoon";
    var n = 0;
    try { n = todaysEntries(sid).length; } catch (e) {}
    return n ? slot + " \u00b7 #" + (n + 1) : slot;
  }
  function ctxLabel(tag) {
    var map = { Morning: ["Morning", "Ma\u00f1ana"], Midday: ["Midday", "Mediod\u00eda"], Afternoon: ["Afternoon", "Tarde"] };
    var parts = String(tag || "").split("\u00b7").map(function (x) { return x.trim(); }).filter(Boolean);
    if (!parts.length) return "";
    var head = map[parts[0]] ? T(map[parts[0]][0], map[parts[0]][1]) : parts[0];
    return parts.length > 1 ? head + " \u00b7 " + parts.slice(1).join(" \u00b7 ") : head;
  }

  function finishStudent() {
    var joined = function (k) {
      var a = SD.a[k] || "", t = SD.a[k + "_text"] || "";
      return [a, t].filter(Boolean).join(" · ");
    };
    var tell = (SD.a.tellAdult || "").trim();
    var rec = {
      timestamp:      new Date().toISOString(),
      date:           todayISO(),
      year:           (window.AOGYear ? AOGYear(todayISO()) : ""),
      /* ⚠ TWO FIELDS, TWO QUESTIONS — §12's shared name, added WITHOUT a
         rename. `slipType` says WHICH INSTRUMENT wrote the row and is the
         one field both screens answer: "checkin" here, "exit" on the slip.
         `checkinType` keeps the meaning it has always had — WHICH KIND OF
         CHECK-IN (daily · targeted · support) — which the exit slip has no
         equivalent for and never will.
         Renaming checkinType to slipType would have been a column rename in
         a Sheet a school is already filling. This is additive: a new column
         appended on the right by getCheckinSheet(), every existing reader
         untouched, and nothing to undo if a district has already built a
         QUERY against the old header. */
      slipType:       "checkin",
      checkinType:    "daily",
      assignmentId:   ss(CI_KEYS.assignmentId),
      trackingGroup:  ss(CI_KEYS.trackingGroup),
      term:           ss(CI_KEYS.term),
      districtId:     ss("aog.launch.districtId"),
      schoolId:       ss("aog.launch.schoolId"),
      classId:        ss("aog.launch.classId"),
      grade:          ss("aog.launch.grade"),
      period:         ss(CI_KEYS.period) || "",
      studentId:      SD.studentId,
      respondentId:   SD.studentId,
      respondentRole: "student",
      arrival:        SD.a.arrival == null ? "" : SD.a.arrival,
      feelingWords:   SD.a.feelingWords || "",
      need:           SD.a.need || "",
      connection:     SD.a.connection == null ? "" : SD.a.connection,
      challenge:      joined("challenge"),
      challengeImpact: SD.a.challengeImpact == null ? "" : SD.a.challengeImpact,
      readiness:      SD.a.readiness == null ? "" : SD.a.readiness,
      contextTag:     contextTagNow(SD.studentId),
      tellAdult:      tell,
      agency:         joined("agency"),
      note:           "",
      followUp:       !!SD.a.talk || tell.length > 0,
      source:         "link"
    };

    /* Device first. A student who finishes on a dead network has still done it. */
    var store = studentStore();
    if (!store.logs) store.logs = {};
    if (!store.logs[rec.studentId]) store.logs[rec.studentId] = {};
    if (!store.logs[rec.studentId][rec.date]) store.logs[rec.studentId][rec.date] = [];
    store.logs[rec.studentId][rec.date].push(rec);
    jsave(SKEY, store);
    queuePush(rec);

    window.__ciLastRec = rec;
    renderStudentDone(rec, "sending");
    syncCheckin(rec).then(function (state) { renderStudentDone(rec, state); })
                    .catch(function () { renderStudentDone(rec, "offline"); });
  }

  /* ⚠ THE SHAPE IS THE ARGUMENT — and it is a different argument from the
     exit slip's. That one draws good-HIGH, hard-LOW, good-HIGH: a day that
     has already happened. This is a morning. ONE dot is filled, because one
     thing has happened; the two ahead are outlined on a line that is drawn
     but not claimed. Filling all three would be a promise about a day that
     has not been lived yet, and this instrument does not make those. Same
     stroke, same box, same palette, same place on the screen as the slip's
     — §09: the completion experience is shared, the words are not. */
  function checkinArcSvg() {
    return '<svg class="arc" width="188" height="62" viewBox="0 0 188 62" fill="none" aria-hidden="true">' +
      '<path d="M14 42 C 54 42, 64 26, 94 26 C 124 26, 136 21, 174 21" stroke="var(--rule)" stroke-width="2" ' +
      'stroke-linecap="round" fill="none"/>' +
      '<circle cx="14" cy="42" r="6" fill="var(--aog-dusk)"/>' +
      '<circle cx="94" cy="26" r="5" fill="none" stroke="var(--rule)" stroke-width="2"/>' +
      '<circle cx="174" cy="21" r="5" fill="none" stroke="var(--rule)" stroke-width="2"/>' +
      "</svg>";
  }

  /* §09's recap, the exit slip's row for row. A student sees what they just
     said, in their own words, before they leave — which is also the quiet
     proof that nothing was scored. */
  function scRecapRow(label, val) {
    if (val == null || val === "") return "";
    var parts = String(val).split(",").map(function (x) {
      return window.AOGCheckinTr ? window.AOGCheckinTr(x.trim()) : x.trim();
    }).filter(Boolean).join(" · ");
    if (!parts) return "";
    return '<div class="rr"><div class="rk">' + esc(label) + '</div><div class="rv">' + esc(parts) + "</div></div>";
  }
  function scScaleWord(list, v) {
    if (v == null || v === "") return "";
    var o = list.filter(function (x) { return x.v === parseInt(v, 10); })[0];
    return o ? T(o.en, o.es) : "";
  }

  function renderStudentDone(rec, state) {
    var sec = el("screen-daily-checkin");
    if (!sec) return;
    stageFree(sec, true);
    var seen;
    if (!anAdultWillSeeThis()) {
      seen = T("This stayed on this device. Nothing was sent.",
               "Esto se quedó en este dispositivo. No se envió nada.");
    } else if (state === "sending") {
      seen = T("Sending…", "Enviando…");
    } else if (state === "sent") {
      seen = T("Your teacher will see it.", "Tu maestro/a lo verá.");
    } else if (state === "rejected") {
      seen = T("It’s saved here. Your school’s sheet isn’t ready for daily check-ins yet — tell your teacher.",
               "Está guardado aquí. La hoja de tu escuela aún no está lista para los registros diarios — dile a tu maestro/a.");
    } else {
      seen = T("It’s saved here and will send itself when this device is back online.",
               "Está guardado aquí y se enviará solo cuando este dispositivo vuelva a estar en línea.");
    }

    var recap =
      scRecapRow(T("Arriving", "Llegando"), scScaleWord(ARRIVAL, rec.arrival)) +
      scRecapRow(T("Noticing", "Notas"), rec.feelingWords) +
      scRecapRow(T("Ready", "Listo/a"), scScaleWord(READINESS, rec.readiness)) +
      scRecapRow(T("You need", "Necesitas"), rec.need) +
      scRecapRow(T("Harder", "Más difícil"), rec.challenge) +
      scRecapRow(T("You’ll do", "Vas a"), rec.agency);

    var card = carryCardHtml(rec);
    var canMirror = myEntries(rec.studentId).length >= MIRROR_MIN;

    /* the letter's promise, every audience: after a completed submission,
       the once-ever home-screen offer */
    try { if (window.aogOfferA2HS) setTimeout(window.aogOfferA2HS, 900); } catch (e) {}
    sec.innerHTML =
      '<div class="sc-wrap"><div class="sc-done">' +
        checkinArcSvg() +
        "<h2>" + esc(T("Thanks for checking in.", "Gracias por registrarte.")) + "</h2>" +
        '<div class="sc-lines">' +
          "<p>" + esc(T("Hard mornings count.", "Las mañanas difíciles cuentan.")) + "</p>" +
          "<p>" + esc(T("Good mornings count.", "Las mañanas buenas cuentan.")) + "</p>" +
          '<p class="neither">' + esc(T("And neither one is the whole day.", "Y ninguna de las dos es el día entero.")) + "</p>" +
        "</div>" +
        '<p class="sc-see">' + esc(T("The day is still open.", "El día sigue abierto.")) + "</p>" +
        (recap ? '<div class="sc-recap">' + recap + "</div>" : "") +
        '<p class="sc-sent">' + esc(seen) + "</p>" +
        /* THE HANDOFF, SAID HONESTLY. A check-in that invites "I would like to
           talk with someone" and then implies somebody is watching the screen
           is worse than not asking — it teaches a student to wait. So this says
           what actually happens, branches on whether anything was really sent,
           and puts the right-now route underneath in its own weight. */
        (rec.followUp
          ? '<div class="sc-hand"><p>' +
            esc(anAdultWillSeeThis()
              ? T("You asked to talk with someone. That goes to your teacher with this check-in, and they will see it the next time they open them — not the second you tap Done.",
                  "Pediste hablar con alguien. Eso va a tu maestro/a junto con este registro, y lo verá la próxima vez que los abra — no en el segundo en que toques Listo.")
              : T("You asked to talk with someone. This device isn’t connected to your school, so nothing was sent and nobody has been told yet. Show them this screen, or just say it out loud.",
                  "Pediste hablar con alguien. Este dispositivo no está conectado a tu escuela, así que no se envió nada y nadie lo sabe todavía. Muéstrales esta pantalla, o díselo en voz alta.")) + "</p>" +
            '<p class="now">' + esc(T("If you need help right now: tell an adult near you, or go to the office. Don’t wait for this to be read.",
                                       "Si necesitas ayuda ahora mismo: dile a un adulto cerca de ti, o ve a la oficina. No esperes a que lean esto.")) + "</p></div>"
          : "") +
        card +
        (card ? '<div style="margin:2px 0 4px;"><button type="button" class="cy-slip" id="cySlip">' +
          esc(T("Print a slip to keep", "Imprimir una tarjeta para llevar")) + "</button></div>" : "") +
        '<div class="sc-nav cy-row" style="justify-content:center;border-top:0;gap:10px;flex-wrap:wrap;">' +
          (canMirror
            ? '<button type="button" class="sc-next" id="scMine">' +
              esc(T("See your last few weeks", "Ver tus últimas semanas")) + "</button>"
            : "") +
          '<button type="button" class="' + (canMirror ? "sc-ghost" : "sc-next") + '" id="scDone">' +
            esc(T("Done", "Listo")) + "</button>" +
        "</div>" +
      "</div></div>";
    var slip = el("cySlip");
    if (slip) slip.addEventListener("click", function () {
      try { window.AOGCarry.printSlip(window.AOGCarry["for"](rec)); } catch (e) {}
    });
    var mine = el("scMine");
    if (mine) mine.addEventListener("click", function () { renderMirror(rec.studentId); });
    var d = el("scDone");
    if (d) d.addEventListener("click", function () {
      if (typeof resetToStart === "function") resetToStart();
      else if (typeof showScreen === "function") showScreen("screen-welcome");
    });
  }

  window.aogOpenDailyCheckin = function () {
    SD = { step: 0, studentId: lockedStudent() || "", a: {} };
    if (SD.studentId && offerTodaysCard(SD.studentId)) {
      if (typeof aogSetHash === "function") aogSetHash("daily-checkin");
      return;
    }
    renderStudent();
    if (typeof showScreen === "function") showScreen("screen-daily-checkin");
    if (typeof aogSetHash === "function") aogSetHash("daily-checkin");
  };

  /* ================================================ THE STUDENT'S OWN MIRROR
     Jimmy's call (2026-08-25): a student should be able to see their own lines.
     It is their data.

     This is NOT the teacher's chart with different wording. Three things are
     deliberately different, and none of them should be "tidied" back:

       · No red/amber/green bands. The adult trend shades the plot by score
         because an adult is reading a support signal. A thirteen-year-old
         reading "you are in the red" about their own week is a scorecard, and
         the curriculum promises the opposite.
       · Nothing appears until the THIRD check-in. Two dots is not a pattern;
         it is a mood with a line drawn through it.
       · Their own words come back with it. The point is agency — what they
         said they needed, and what they said they could do — not the number.

     The house line for a student looking at their own data is already settled
     on the results screen: "a mirror, not a verdict — a way to be understood,
     not measured." Same register here. */
  var MIRROR_MIN = 3;

  function myEntries(sid) {
    var days = (studentStore().logs || {})[sid] || {};
    var out = [];
    Object.keys(days).sort().forEach(function (d) {
      (days[d] || []).forEach(function (e) { out.push(e); });
    });
    return out.sort(function (a, b) {
      return String(a.timestamp || "").localeCompare(String(b.timestamp || ""));
    });
  }

  /* The most-picked answer to one question, and how often. Ties go to the most
     recent, which is the one they will recognize. */
  function commonest(entries, field) {
    var counts = {}, lastSeen = {};
    entries.forEach(function (e, i) {
      String(e[field] || "").split(",").forEach(function (raw) {
        var v = raw.split("·")[0].trim();
        if (!v) return;
        counts[v] = (counts[v] || 0) + 1;
        lastSeen[v] = i;
      });
    });
    var best = null;
    Object.keys(counts).forEach(function (v) {
      if (!best || counts[v] > counts[best] || (counts[v] === counts[best] && lastSeen[v] > lastSeen[best])) best = v;
    });
    return best ? { v: best, n: counts[best] } : null;
  }

  function mirrorChart(entries) {
    /* A 760-wide viewBox squeezed into a 350px phone renders an 11px label at
       about 5px. So the viewBox itself narrows on a phone and shows fewer
       points, rather than shrinking the type until nobody can read it. */
    var narrow = false;
    try { narrow = window.innerWidth < 620; } catch (e) {}
    var pts = entries.slice(narrow ? -6 : -10);
    var W = narrow ? 400 : 760, H = narrow ? 210 : 230;
    var ml = narrow ? 26 : 34, mt = 18, mb = narrow ? 40 : 44, n = pts.length;
    var fA = narrow ? 12 : 11, fB = narrow ? 11 : 10, fC = narrow ? 13 : 12;
    var rr = narrow ? 5.5 : 5;
    var longest = 0;
    SERIES.forEach(function (s) {
      var vis = pts.filter(function (p) { return p[s.k] != null && p[s.k] !== ""; });
      if (!vis.length) return;
      var lv2 = vis[vis.length - 1][s.k];
      var t = T(s.en, s.es);
      if (t.length > longest) longest = t.length;
      var w2 = scaleWord(s, parseFloat(lv2));
      if (w2.length > longest) longest = w2.length;
    });
    var mr = Math.max(narrow ? 56 : 70, Math.min(narrow ? 110 : 160, 16 + longest * (narrow ? 6.6 : 7.2)));
    var X = function (i) { return ml + (W - ml - mr) * (n <= 1 ? 0.5 : i / (n - 1)); };
    var Y = function (v) { return mt + (H - mt - mb) * (1 - (Math.max(1, Math.min(5, v)) - 1) / 4); };
    var g = "";

    /* A plain grid. No shaded score bands — see the note at the top. */
    [1, 2, 3, 4, 5].forEach(function (t) {
      g += '<line x1="' + ml + '" y1="' + Y(t) + '" x2="' + (W - mr) + '" y2="' + Y(t) +
        '" stroke="var(--rule,#E4DAC5)" stroke-width="1"/>' +
        '<text x="' + (ml - 6) + '" y="' + (Y(t) + 3.5) + '" text-anchor="end" font-size="' + fA + '" fill="var(--ink-faint,#8A92A6)">' + t + "</text>";
    });
    pts.forEach(function (p, i) {
      var lab = shortD(String(p.date || "").slice(0, 10));
      g += '<text x="' + X(i) + '" y="' + (H - mb + 18) + '" text-anchor="middle" font-size="' + fB + '" font-weight="700" fill="var(--ink-soft,#5b6675)">' + esc(lab) + "</text>";
    });
    var endLabels = [];
    SERIES.forEach(function (s) {
      var col = seriesColor(s);
      var vis = pts.map(function (p, i) {
        var v = (p[s.k] === "" || p[s.k] == null) ? null : parseInt(p[s.k], 10);
        return { i: i, v: (v == null || isNaN(v)) ? null : v };
      }).filter(function (o) { return o.v != null; });
      if (!vis.length) return;
      var dash = s.dash ? ' stroke-dasharray="' + s.dash + '"' : "";
      if (vis.length > 1) {
        var d = "";
        vis.forEach(function (o, j) { d += (j ? "L" : "M") + X(o.i).toFixed(1) + " " + Y(o.v).toFixed(1) + " "; });
        g += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"' + dash + "/>";
      }
      vis.forEach(function (o) {
        g += '<circle cx="' + X(o.i).toFixed(1) + '" cy="' + Y(o.v).toFixed(1) + '" r="' + rr + '" fill="' + col +
          '" stroke="var(--card,#fff)" stroke-width="2"/>';
      });
      var last = vis[vis.length - 1];
      /* NO NUMBER HERE. This is the student's own view of their own weeks, and
         "Arriving 2" printed at the end of their line is the score sentence
         this whole instrument refuses to produce. The word is the answer they
         gave; it says everything the number does and none of what it implies.
         The teacher's copy of this chart keeps the number on purpose — that is
         the interpretation layer, and this is not. */
      endLabels.push({ y: Y(last.v), anchor: Y(last.v), x: X(last.i), col: col,
                       text: esc(T(s.en, s.es)),
                       sub: esc(scaleWord(s, last.v)) });
    });
    /* END-LABEL COLLISION (fixed 2026-08-26). The series share one 1-5 axis,
       and a student very often ends a week on the same number for two of them —
       those series then finish on the same gridline and the direct labels
       printed exactly on top of each other ("ConnAerctievdi n5g 5"). Spread
       them to a minimum vertical separation, keep the block inside the plot,
       and draw a hairline leader back to the point for any label that had to
       move, so the label still says which line it belongs to. */
    if (endLabels.length > 1) {
      var LGAP = (fC + 17);
      endLabels.sort(function (a, b) { return a.y - b.y; });
      for (var li = 1; li < endLabels.length; li++) {
        if (endLabels[li].y - endLabels[li - 1].y < LGAP) endLabels[li].y = endLabels[li - 1].y + LGAP;
      }
      var lOver = endLabels[endLabels.length - 1].y - (H - mb);
      if (lOver > 0) endLabels.forEach(function (L) { L.y -= lOver; });
      var lUnder = (mt + 6) - endLabels[0].y;
      if (lUnder > 0) endLabels.forEach(function (L) { L.y += lUnder; });
    }
    endLabels.forEach(function (L) {
      if (Math.abs(L.y - L.anchor) > 4) {
        g += '<path d="M' + (L.x + (rr + 2)).toFixed(1) + ' ' + L.anchor.toFixed(1) +
             ' L' + (W - mr + 3) + ' ' + L.y.toFixed(1) + '" fill="none" stroke="' + L.col +
             '" stroke-width="1" opacity=".45"/>';
      }
      g += '<text x="' + (W - mr + 8) + '" y="' + (L.y + 1).toFixed(1) + '" font-size="' + fC + '" font-weight="800" fill="' + L.col + '">' +
        L.text + "</text>";
      if (L.sub) {
        g += '<text x="' + (W - mr + 8) + '" y="' + (L.y + 1 + fC + 1).toFixed(1) + '" font-size="' + (fC - 1.5) + '" font-weight="600" opacity=".78" fill="' + L.col + '">' +
          L.sub + "</text>";
      }
    });
    return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' +
      esc(T("Your last check-ins: how you arrived, how ready you felt, and how connected you felt",
            "Tus últimos registros: cómo llegaste, qué tan listo/a te sentiste y qué tan conectado/a te sentiste")) +
      '" style="width:100%;display:block;">' + g + "</svg>";
  }

  function renderMirror(sid) {
    var sec = el("screen-daily-checkin");
    if (!sec) return;
    injectStudentCss();
    stageFree(sec, true);
    var entries = myEntries(sid);

    var head =
      '<div class="sc-top"><div class="sc-count">' + esc(T("Your check-ins", "Tus registros")) + "</div></div>" +
      '<div class="sc-wrap">' +
        '<h1 class="sc-q">' + esc(T("Your last few weeks", "Tus últimas semanas")) + "</h1>";

    if (entries.length < MIRROR_MIN) {
      sec.innerHTML = head +
        '<p class="sc-sub">' + esc(T(
          "You’ve done " + entries.length + " so far. After a few more this turns into a picture of your weeks — right now it would just be today, drawn bigger.",
          "Has hecho " + entries.length + " hasta ahora. Con algunos más esto se convierte en una imagen de tus semanas — ahora mismo sería solo hoy, dibujado en grande.")) + "</p>" +
        '<div class="sc-nav"><button type="button" class="sc-next" id="scMirrorBack">' +
          esc(T("Okay", "Está bien")) + "</button></div></div>";
      var b0 = el("scMirrorBack");
      if (b0) b0.addEventListener("click", function () { renderStudentDone(window.__ciLastRec || {}, "sent"); });
      return;
    }

    /* Their own words, counted. This is the part that is actually useful to a
       student — not the line, the pattern in what they keep asking for. */
    var feel = commonest(entries, "feelingWords");
    var need = commonest(entries, "need");
    var move = commonest(entries, "agency");
    var says = [];
    if (feel) says.push(esc(T("The word you pick most is ", "La palabra que más eliges es ")) +
      '<strong>' + esc(feel.v.toLowerCase()) + "</strong>" +
      esc(T(" — " + feel.n + " of " + entries.length + " times.", " — " + feel.n + " de " + entries.length + " veces.")));
    if (need) says.push(esc(T("What you ask for most is ", "Lo que más pides es ")) +
      '<strong>' + esc(need.v.toLowerCase()) + "</strong>.");
    if (move) says.push(esc(T("Your most common move is ", "Tu paso más común es ")) +
      '<strong>' + esc(move.v.toLowerCase()) + "</strong>" +
      esc(T(" — that’s a real skill, and it’s yours.", " — eso es una habilidad real, y es tuya.")));

    /* One honest sentence about the shape, and never a diagnosis. If the last
       stretch has been low, it points at a person rather than at the number. */
    var recent = entries.slice(-3), earlier = entries.slice(0, -3);
    function avg(list, k) {
      var vals = list.map(function (e) { return parseInt(e[k], 10); }).filter(function (v) { return !isNaN(v); });
      return vals.length ? vals.reduce(function (a, b) { return a + b; }, 0) / vals.length : null;
    }
    var rA = avg(recent, "arrival"), eA = earlier.length ? avg(earlier, "arrival") : null;
    var shape;
    if (rA != null && rA <= 2.34) {
      shape = T("The last few have been heavy ones. That is worth saying out loud to someone — a teacher, a counselor, someone at home. You do not have to carry a run like this on your own.",
                "Los últimos han sido pesados. Vale la pena decírselo a alguien — un maestro, un consejero, alguien en casa. No tienes que cargar con una racha así tú solo/a.");
    } else if (rA != null && eA != null && rA - eA >= 0.6) {
      shape = T("Lately you have been arriving in better shape than you were. Whatever you have been doing, it is showing up here.",
                "Últimamente estás llegando mejor que antes. Sea lo que sea que estés haciendo, se nota aquí.");
    } else if (rA != null && eA != null && eA - rA >= 0.6) {
      shape = T("The last few have been harder than the ones before. That happens, and it is not a verdict on you — but if it keeps going, tell someone.",
                "Los últimos han sido más difíciles que los anteriores. Eso pasa, y no es un veredicto sobre ti — pero si sigue así, díselo a alguien.");
    } else {
      shape = T("Fairly steady across these. Steady is not boring — it is what makes a hard day easier to notice.",
                "Bastante estable en estos. Estable no es aburrido — es lo que hace que un día difícil se note.");
    }

    sec.innerHTML = head +
      '<p class="sc-sub">' + esc(T("A mirror, not a verdict — a way to understand yourself, not a grade.",
                                   "Un espejo, no un veredicto — una forma de entenderte, no una nota.")) + "</p>" +
      '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;margin:0 0 12px;">' +
        SERIES.map(function (s) {
          return '<span style="display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:700;color:var(--ink-soft,#5b6675);">' +
            '<span style="width:11px;height:11px;border-radius:50%;background:' + seriesColor(s) + ';"></span>' +
            esc(T(s.en, s.es)) + "</span>";
        }).join("") +
      "</div>" +
      '<div style="border:1px solid var(--rule,#E4DAC5);border-radius:14px;background:var(--card,#fff);padding:12px 10px;overflow-x:auto;">' +
        mirrorChart(entries) + "</div>" +
      '<p style="font-size:15px;line-height:1.6;color:var(--ink,#22303F);margin:18px 0 0;">' + esc(shape) + "</p>" +
      (says.length
        ? '<ul style="font-size:15px;line-height:1.7;color:var(--ink-soft,#5b6675);margin:14px 0 0;padding-left:20px;">' +
          says.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"
        : "") +
      '<p style="font-size:12.5px;line-height:1.6;color:var(--ink-faint,#8A92A6);margin:18px 0 0;">' +
        esc(T("These are the check-ins saved on this device — " + entries.length + " of them. Nobody is graded on any of this.",
              "Estos son los registros guardados en este dispositivo — " + entries.length + ". Nadie recibe una nota por nada de esto.")) + "</p>" +
      '<div class="sc-nav"><button type="button" class="sc-next" id="scMirrorBack">' +
        esc(T("Done", "Listo")) + "</button></div>" +
    "</div>";

    var b = el("scMirrorBack");
    if (b) b.addEventListener("click", function () {
      if (typeof resetToStart === "function") resetToStart();
      else if (typeof showScreen === "function") showScreen("screen-welcome");
    });
  }
  window.aogShowMyCheckins = function (sid) {
    var id = sid || SD.studentId || lockedStudent();
    if (!id) return false;
    renderMirror(id);
    if (typeof showScreen === "function") showScreen("screen-daily-checkin");
    return true;
  };


  /* ================================================================== DISTRIBUTE
     TWO CARDS IN TWO TABS, NOT ONE CARD WITH A MODE DROPDOWN  ·  2026-08-28

     Jimmy, with the three link builders open side by side:

         "I really like how the exit ticket is set up. Can the daily check in
          and self reflection have a similar set up (it looks like less
          choices)."

     He is describing a defect, not a preference. Count what a teacher met on
     each card before today:

         Exit slip link ........... 5 controls
         Self-Reflection link ..... 6 controls
         Check-In Link ........... 10 controls

     and TWO of the check-in card's ten were mode dropdowns -- "Who fills this
     in?" and "Check-in type" -- which is exactly the pattern he killed on the
     Classroom Link Generator in aog-slip-links:

         "It is not elite in the sense that there are MULTIPLE doors that lead
          to all of these reflections / check-ins."

     This card was the last builder still breaking that rule, and it broke it
     in the worst possible direction: the DEFAULT was the Tier-2 job -- an
     adult team logging around one student, a handful of children a year --
     and the everyday whole-class check-in was the option you had to go find.
     A sixth-grade teacher opening Distribute met Plan ID, Tracking group and
     Fix the role before they met the thing they came for.

     WHO A LINK IS FOR IS NOW DECIDED BY WHICH CARD ASKED, never by a control
     inside a card:

       - Daily check-in link   #aogCiLgCard  ciLg*   the class link.
                               Always who=student, always checkin=daily.
       - Student support link  #aogSuLgCard  suLg*   the adult team link.
                               Every specialist field lives here and nowhere
                               else, most of it behind a disclosure.

     Both wear the exit slip's shape, which is the shape Jimmy pointed at:
     FOUR identity fields, ONE real decision with a live line underneath
     saying what the link now carries, then the link. See hintSched() in
     aog-slip-links -- that green sentence is the thing being copied, more
     than the grid is.

     ONE ASSEMBLER, NOT TWO LINK SYSTEMS. Both cards call linkFrom().
     Duplicating the assembly is how two links meant to agree stop agreeing.
     ========================================================================= */

  function planId() {
    var s = "";
    var abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (var i = 0; i < 5; i++) s += abc.charAt(Math.floor(Math.random() * abc.length));
    return "AOG-" + s;
  }

  /* First non-empty of a chain of field ids. A support card left blank falls
     back to the class card, which falls back to the Classroom Link Generator,
     so three builders on one panel can never quietly disagree about which
     school this is. */
  function fv() {
    for (var i = 0; i < arguments.length; i++) {
      var e = el(arguments[i]);
      var v = e ? String(e.value || "").trim() : "";
      if (v) return v;
    }
    return "";
  }

  function linkBase() {
    return (location.protocol === "http:" || location.protocol === "https:")
      ? (location.origin + location.pathname) : "";
  }

  /* THE ONE ASSEMBLER. `who` comes from the CALLER -- that is, from which card
     asked -- and never from a field on screen. */
  function linkFrom(o) {
    /* ⚠ ONE ASSEMBLER, TWO DOORS. `who` already decides what this link IS —
       a class check-in or an adult team link — so it decides the door too.
       Deriving it from anything on screen would put the wrong card on it. */
    var base = (typeof aogShareBase_ === "function"
                 && aogShareBase_(o.who === "student" ? "checkin" : "support")) || linkBase();
    if (!base) return "";
    var p = new URLSearchParams();
    /* NEVER `checkin=` AND `exit=` ON ONE LINK. Each boots its own screen on
       load; a link carrying both would race two screens into one tab. */
    p.set("checkin", o.type);
    p.set("who", o.who);
    p.set("sync", "on");
    /* A Spanish dashboard hands out a Spanish link. */
    if (isEs()) p.set("lang", "es");
    if (o.school) p.set("schoolId", o.school);
    if (o.grade)  p.set("grade", o.grade);
    if (o.cls)    p.set("classId", o.cls);
    if (o.term)   p.set("term", o.term);
    if (o.group)  p.set("trackingGroup", o.group);
    if (o.plan)   p.set("assignmentId", o.plan);
    /* Period rides on BOTH links. It is class context, not an adult's own
       observation field -- and while it was adult-only, every student
       check-in landed with no period at all, which is why Today's Picture
       could never count one against Advisory. */
    if (o.period) p.set("period", o.period);
    var org = (typeof aogOrgId_ === "function") ? aogOrgId_() : "";
    if (org) p.set("org", org);
    var _destP = (typeof aogDestParam_ === "function") ? aogDestParam_() : "";
    if (_destP) p.set(AOG_DEST_PARAM, _destP);
    /* staffRole describes who is WRITING. A student is not a staff role. */
    if (o.who !== "student" && o.role) p.set("staffRole", o.role);
    /* Only an adult link carries the token; a student link must never look
       like one, or copying a student link into the address bar becomes the
       bypass this was built to close.

       COMPUTED FROM THE VALUES THAT ACTUALLY GO INTO THE URL. staffTokenOk()
       recomputes it from the url's own schoolId and classId, so a token built
       from an unresolved field would never verify. */
    if (o.who !== "student") p.set("sk", staffTokenFor(staffTokenParts(o.school, o.cls, o.type)));
    return base + "?" + p.toString();
  }

  /* --------------------------------------------- the class link (ciLg*) */
  function buildClassLink() {
    return linkFrom({
      type:   "daily",
      who:    "student",
      school: fv("ciLgSchool", "lgSchoolId"),
      grade:  fv("ciLgGrade",  "lgGrade"),
      cls:    fv("ciLgClass",  "lgClassId"),
      term:   fv("ciLgTerm"),
      period: fv("ciLgPeriod")
    });
  }

  /* --------------------------------------------- the team link (suLg*) */
  function buildSupportLink() {
    return linkFrom({
      type:   fv("suLgType") || "support",
      who:    "staff",
      school: fv("suLgSchool", "ciLgSchool", "lgSchoolId"),
      grade:  fv("suLgGrade",  "ciLgGrade",  "lgGrade"),
      cls:    fv("suLgClass",  "ciLgClass",  "lgClassId"),
      term:   fv("suLgTerm",   "ciLgTerm"),
      group:  fv("suLgGroup"),
      plan:   fv("suLgPlan"),
      period: fv("suLgPeriod"),
      role:   fv("suLgRole")
    });
  }

  /* One builder, two callers. Today's Picture asks for the same class link
     the Distribute card hands out, for one period, without making a teacher
     walk to Distribute at 8:00 AM. Deliberately NOT a second link system:
     it is buildClassLink() with the period overridden. */
  window.aogCheckinLinkFor = function (periodStore) {
    var u = buildClassLink();
    if (!u || !periodStore) return u;
    try { var x = new URL(u); x.searchParams.set("period", periodStore); return x.toString(); }
    catch (e) { return u; }
  };

  /* THE GREEN SENTENCE. Copied from hintSched() in aog-slip-links, which is
     the part of the exit-slip card that makes it feel answered rather than
     filled in. It states what the link NOW CARRIES, in the same three
     colors everywhere: green when the link is complete, amber when a real
     choice is still missing, faint when blank is a fine answer. */
  function paintClassHint() {
    var h = el("ciLgPeriodHint");
    if (!h) return;
    var per = fv("ciLgPeriod");
    if (!per) {
      h.style.color = "var(--amber,#8A6D1F)";
      h.textContent = T("⚠ Pick a period for this link. Without one, check-ins have no period and Today’s Picture can’t count them for a class.",
                        "⚠ Elige un periodo para este enlace. Sin él, los registros no tienen periodo y El panorama de hoy no puede contarlos para una clase.");
    } else {
      h.style.color = "var(--green,#2E6B3A)";
      h.textContent = T("✓ Every check-in from this link is stamped " + periodLabelFor(per) + ". About four minutes, seven questions.",
                        "✓ Cada registro de este enlace queda marcado como " + periodLabelFor(per) + ". Unos cuatro minutos, siete preguntas.");
    }
  }

  var SU_TYPES = [
    { v: "support",  en: "A team around one student", es: "Un equipo alrededor de un estudiante",
      hintEn: "Several adults, one child. Each logs what they saw from their own device and the entries meet on one timeline, signed with each adult’s own name. This is the one a support plan or an IEP team wants.",
      hintEs: "Varios adultos, un niño. Cada uno anota lo que vio desde su dispositivo y las entradas se reúnen en una línea de tiempo, firmadas con su propio nombre. Es la que quiere un equipo de apoyo o de IEP." },
    { v: "targeted", en: "One student being watched", es: "Un estudiante en seguimiento",
      hintEn: "The same form, named for what it is: a student on a targeted watch, usually one adult checking the same three things on a schedule.",
      hintEs: "El mismo formulario, con el nombre de lo que es: un estudiante en seguimiento focalizado, normalmente un adulto revisando las mismas tres cosas de forma programada." },
    { v: "daily",    en: "Routine logging", es: "Registro de rutina",
      hintEn: "No plan behind it — an adult keeping an ordinary daily record. If what you actually want is the whole class answering for themselves, that is the Daily check-in link tab, not this one.",
      hintEs: "Sin un plan detrás — un adulto llevando un registro diario ordinario. Si lo que quieres es que la clase entera responda por sí misma, eso es la pestaña Enlace de registro diario, no esta." }
  ];

  function paintSupportHint() {
    var h = el("suLgHint");
    var cur = fv("suLgType") || "support";
    var box = el("suLgTypeBtns");
    if (box) {
      Array.prototype.forEach.call(box.querySelectorAll("button[data-v]"), function (b) {
        var on = b.getAttribute("data-v") === cur;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.background = on ? "var(--navy,#0A1E33)" : "";
        b.style.color = on ? "#fff" : "";
        b.style.borderColor = on ? "var(--navy,#0A1E33)" : "";
      });
    }
    if (!h) return;
    for (var i = 0; i < SU_TYPES.length; i++) {
      if (SU_TYPES[i].v === cur) {
        h.style.color = "var(--green,#2E6B3A)";
        h.textContent = "✓ " + T(SU_TYPES[i].hintEn, SU_TYPES[i].hintEs);
        return;
      }
    }
  }

  /* One-time rule so a generated canvas fits the box, kept next to the box it
     styles rather than in another module's stylesheet. */
  function ciQrCss() {
    if (el("aogCiQrCss")) return;
    var st = document.createElement("style");
    st.id = "aogCiQrCss";
    st.textContent = "#ciLgQr img,#ciLgQr canvas{width:160px;height:160px;display:block;}";
    document.head.appendChild(st);
  }
  function drawClassQr() {
    var box = el("ciLgQr"), u = el("ciLgUrl");
    if (!box) return;
    ciQrCss();
    box.innerHTML = "";
    box.removeAttribute("data-done");
    box.setAttribute("data-url", u ? u.value : "");
    /* THE ONE IMPLEMENTATION, exported by aog-slip-links. If it is not there,
       the card simply shows no QR and the link above it still works -- the
       QR is a convenience, never the only way in. */
    try { if (typeof window.aogDrawQr === "function") window.aogDrawQr(box.parentNode || box); } catch (e) {}
  }
  function refreshClassLink()   { var o = el("ciLgUrl"); if (o) o.value = buildClassLink();   paintClassHint(); drawClassQr(); }
  function refreshSupportLink() { var o = el("suLgUrl"); if (o) o.value = buildSupportLink(); paintSupportHint(); }

  /* Copy-to-clipboard, one implementation, both cards. */
  function wireCopy(btnId, fieldId, msgId) {
    var b = el(btnId);
    if (!b) return;
    b.addEventListener("click", function () {
      var f = el(fieldId), m = el(msgId);
      if (!f || !f.value) { if (m) m.textContent = T("Only on the live site", "Solo en el sitio publicado"); return; }
      function said(t) { if (m) { m.textContent = t; setTimeout(function () { if (m) m.textContent = ""; }, 2000); } }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(f.value).then(function () { said(T("Copied.", "Copiado.")); },
            function () { f.select(); said(T("Press ⌘C", "Presiona ⌘C")); });
          return;
        }
      } catch (e) {}
      f.select(); said(T("Press ⌘C", "Presiona ⌘C"));
    });
  }

  /* TWO PLACES, BECAUSE A CARD CAN ARRIVE ON EITHER SIDE OF THE TABS.
     aog-distribute-tabs MOVES every .section-head block into a pane, so once
     it has run, "Connect your school's Sheet" is no longer a child of
     #panel-distribute and insertBefore() throws NotFoundError -- and the card
     then never appears at all, silently, because the caller catches. */
  function placeCard(panel, pane, head, card) {
    var target = el(pane);
    if (target) { target.appendChild(head); target.appendChild(card); return; }
    var anchor = null;
    Array.prototype.forEach.call(panel.querySelectorAll(".section-head"), function (h) {
      if (anchor) return;
      var t = h.querySelector("h2");
      if (t && t.getAttribute("data-dl") === "dl_cfg_h1" && h.parentNode === panel) anchor = h;
    });
    if (anchor) { panel.insertBefore(head, anchor); panel.insertBefore(card, anchor); }
    else { panel.appendChild(head); panel.appendChild(card); }
  }

  function sectionHead(h2, sub) {
    var d = document.createElement("div");
    d.className = "section-head";
    d.innerHTML = "<h2>" + esc(h2) + '</h2><div class="small">' + esc(sub) + "</div>";
    return d;
  }

  /* ⚠ IN GRADE ORDER, K FIRST. The K-5 and 9-12 options were bolted around
     the original 6-7-8 list when the K-8 work landed, so the menu read
     Any-6-7-8-K-1-2-3-4-5-9-10-11-12 — a teacher hunting for their own
     grade in a list that starts in the middle. Jimmy caught it 8/29. */
  var GRADE_OPTS = '<option value="">' + "{{ANY}}" + "</option>" +
    "<option>K</option><option>1</option><option>2</option><option>3</option><option>4</option>" +
    "<option>5</option><option>6</option><option>7</option><option>8</option><option>9</option>" +
    "<option>10</option><option>11</option><option>12</option>";

  /* ============================================ CARD ONE - THE CLASS LINK */
  function injectClassCard(panel) {
    if (el("aogCiLgCard")) return;

    var head = sectionHead(
      T("Daily Check-In Link", "Enlace de registro diario"),
      T("The four-minute morning check-in. One link for the whole class: post it in Google Classroom or show it on the board. No schedules or names to type. A student can do it again later; each answer keeps its period, so a hard morning and a good afternoon stay separate.",
        "El registro matutino de cuatro minutos. Un enlace para toda la clase: publícalo en Google Classroom o muéstralo en la pizarra. Sin horarios ni nombres que escribir. Un estudiante puede hacerlo otra vez más tarde; cada respuesta guarda su periodo, así una mañana difícil y una buena tarde quedan separadas."));

    var card = document.createElement("div");
    card.className = "table-card";
    card.id = "aogCiLgCard";
    card.style.padding = "24px 28px";
    card.innerHTML =
      '<div class="welcome-fields" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;align-items:end;">' +
        '<div class="field"><label for="ciLgSchool">' + esc(T("School ID", "ID de escuela")) + "</label>" +
          '<input type="text" id="ciLgSchool" autocomplete="off" placeholder="e.g. NORTH-JH"></div>' +
        '<div class="field"><label for="ciLgGrade">' + esc(T("Grade", "Grado")) + "</label>" +
          '<select id="ciLgGrade">' + GRADE_OPTS.replace("{{ANY}}", esc(T("Any", "Cualquiera"))) + "</select></div>" +
        '<div class="field"><label for="ciLgClass">' + esc(T("Class / Room", "Clase / Aula")) + "</label>" +
          '<input type="text" id="ciLgClass" autocomplete="off" placeholder="e.g. Advisory-B"></div>' +
        '<div class="field"><label for="ciLgTerm">' + esc(T("Term", "Periodo escolar")) + "</label>" +
          '<input type="text" id="ciLgTerm" autocomplete="off" placeholder="e.g. Fall 2026"></div>' +
      "</div>" +
      '<div style="margin-top:16px;max-width:420px;">' +
        '<label for="ciLgPeriod">' + esc(T("Which period does this link live in?", "¿En qué periodo vive este enlace?")) +
          ' <span style="color:var(--ink-faint);text-transform:none;letter-spacing:normal;font-weight:400;font-size:11px;">' +
          esc(T("(students never see this question)", "(los estudiantes nunca ven esta pregunta)")) + "</span></label>" +
        '<select id="ciLgPeriod" aria-describedby="ciLgPeriodHint" style="width:100%;">' +
          '<option value="">' + esc(T("Not set", "Sin fijar")) + "</option>" +
          PERIOD_DEFS.map(function (p) {
            return '<option value="' + esc(p.store) + '">' + esc(T(p.en, p.es)) + "</option>";
          }).join("") + "</select>" +
      "</div>" +
      '<div class="small" id="ciLgPeriodHint" role="status" style="margin-top:8px;line-height:1.5;"></div>' +
      '<div style="margin-top:20px;">' +
        '<label class="small" style="display:block;margin-bottom:6px;font-weight:600;" for="ciLgUrl">' +
          esc(T("Link to post for the class", "Enlace para publicar a la clase")) + "</label>" +
        '<div style="display:flex;gap:10px;align-items:stretch;flex-wrap:wrap;">' +
          '<input type="text" id="ciLgUrl" readonly style="flex:1;min-width:260px;font-family:monospace;font-size:13px;padding:10px 12px;border:1px solid var(--rule,#ddd);border-radius:8px;background:var(--cream,#faf8f4);">' +
          '<button class="btn btn-sm" type="button" id="ciLgCopy">' + esc(T("Copy link", "Copiar enlace")) + "</button>" +
        "</div>" +
        '<div class="small" id="ciLgMsg" style="margin-top:6px;height:16px;color:var(--ink-faint);"></div>' +
      "</div>" +
      '<div style="margin-top:18px;display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;">' +
        '<div><label class="small" style="display:block;margin-bottom:8px;font-weight:600;">' +
          esc(T("QR code", "Código QR")) + "</label>" +
          '<div class="qr" id="ciLgQr" style="width:180px;height:180px;display:flex;align-items:center;justify-content:center;padding:8px;background:#fff;border:1px solid var(--rule,#E4DAC5);border-radius:8px;"></div></div>' +
        '<div class="small" style="max-width:340px;line-height:1.65;color:var(--ink-soft,#5b6675);">' +
          esc(T("Show this on the board as students come in. They scan it, answer, and are done in about four minutes. No account, no code, nothing to install. The same link works in Google Classroom.",
                "Muéstralo en la pizarra cuando entren. Lo escanean, responden y terminan en unos cuatro minutos. Sin cuenta, sin código, nada que instalar. El mismo enlace funciona en Google Classroom.")) + "</div>" +
      "</div>" +
      '<div class="small" style="margin-top:16px;line-height:1.65;color:var(--ink-soft,#5b6675);">' +
        esc(T("The link carries only the class. It never carries a student’s code, the Sheet address or a passcode. Answers go to a DailyCheckins tab in your Sheet, apart from reflections and exit slips. There’s a box for anything a student wants an adult to know, and the screen tells them a teacher will read it. For a card per student with their code already on it, use Set up ▸ My classes ▸ Hand out links.",
              "El enlace lleva solo la clase. Nunca lleva el código de un estudiante, la dirección de la Hoja ni una contraseña. Las respuestas van a una pestaña DailyCheckins de tu Hoja, aparte de las reflexiones y las boletas. Hay un espacio para lo que un estudiante quiera que un adulto sepa, y la pantalla le dice que un maestro lo leerá. Para una tarjeta por estudiante con su código ya puesto, usa Configurar ▸ Mis clases ▸ Repartir enlaces.")) +
      "</div>";

    placeCard(panel, "aogDistPane-checkin", head, card);

    ["ciLgSchool", "ciLgGrade", "ciLgClass", "ciLgTerm", "ciLgPeriod"].forEach(function (id) {
      var e = el(id);
      if (!e) return;
      e.addEventListener("input", refreshClassLink);
      e.addEventListener("change", refreshClassLink);
    });

    /* Borrow whatever the Classroom Link Generator already knows. */
    try {
      if (el("lgSchoolId") && el("lgSchoolId").value) el("ciLgSchool").value = el("lgSchoolId").value;
      if (el("lgGrade")    && el("lgGrade").value)    el("ciLgGrade").value  = el("lgGrade").value;
      if (el("lgClassId")  && el("lgClassId").value)  el("ciLgClass").value  = el("lgClassId").value;
    } catch (e) {}

    wireCopy("ciLgCopy", "ciLgUrl", "ciLgMsg");
    refreshClassLink();
  }

  /* ========================================= CARD TWO - THE TEAM LINK */
  function injectSupportCard(panel) {
    if (el("aogSuLgCard")) return;

    var head = sectionHead(
      T("Student Support Link", "Enlace de apoyo al estudiante"),
      T("For a team around ONE student. Send it to every adult who sees that child — the classroom teacher, the special educator, the social worker, whoever is on the plan. Each logs from their own device, each entry is signed with their own name, and they meet on one timeline in the Daily log. Most teachers never need this; the everyday whole-class link is the previous tab.",
        "Para un equipo alrededor de UN estudiante. Envíalo a cada adulto que ve a ese niño — el maestro de aula, el educador especial, el trabajador social, quien esté en el plan. Cada uno registra desde su dispositivo, cada entrada lleva su firma, y se reúnen en una línea de tiempo en el Registro diario. La mayoría de los maestros no lo necesitan; el enlace de clase está en la pestaña anterior."));

    var card = document.createElement("div");
    card.className = "table-card";
    card.id = "aogSuLgCard";
    card.style.padding = "24px 28px";
    card.innerHTML =
      '<div class="welcome-fields" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;align-items:end;">' +
        '<div class="field"><label for="suLgSchool">' + esc(T("School ID", "ID de escuela")) + "</label>" +
          '<input type="text" id="suLgSchool" autocomplete="off" placeholder="e.g. NORTH-JH"></div>' +
        '<div class="field"><label for="suLgGrade">' + esc(T("Grade", "Grado")) + "</label>" +
          '<select id="suLgGrade">' + GRADE_OPTS.replace("{{ANY}}", esc(T("Any", "Cualquiera"))) + "</select></div>" +
        '<div class="field"><label for="suLgClass">' + esc(T("Class / Room", "Clase / Aula")) + "</label>" +
          '<input type="text" id="suLgClass" autocomplete="off" placeholder="e.g. Advisory-B"></div>' +
        '<div class="field"><label for="suLgTerm">' + esc(T("Term", "Periodo escolar")) + "</label>" +
          '<input type="text" id="suLgTerm" autocomplete="off" placeholder="e.g. Fall 2026"></div>' +
      "</div>" +
      '<div style="margin-top:18px;">' +
        '<label id="suLgTypeLbl">' + esc(T("What kind of watch is this?", "¿Qué tipo de seguimiento es?")) + "</label>" +
        '<div id="suLgTypeBtns" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">' +
          SU_TYPES.map(function (t) {
            return '<button class="btn btn-sm" type="button" data-v="' + esc(t.v) + '" aria-pressed="false">' +
              esc(T(t.en, t.es)) + "</button>";
          }).join("") +
        "</div>" +
        /* The buttons are the control a person uses; this select is the value
           the link reads, kept so fv() and every existing reader see a field
           exactly where they expect one. Out of the a11y tree on purpose --
           the buttons carry the semantics. */
        '<select id="suLgType" aria-hidden="true" tabindex="-1" style="display:none;">' +
          SU_TYPES.map(function (t) { return '<option value="' + esc(t.v) + '">' + esc(t.en) + "</option>"; }).join("") +
        "</select>" +
        '<div class="small" id="suLgHint" role="status" style="margin-top:8px;line-height:1.5;"></div>' +
      "</div>" +
      '<div style="margin-top:20px;">' +
        '<label class="small" style="display:block;margin-bottom:6px;font-weight:600;" for="suLgUrl">' +
          esc(T("Link to send the team", "Enlace para el equipo")) + "</label>" +
        '<div style="display:flex;gap:10px;align-items:stretch;flex-wrap:wrap;">' +
          '<input type="text" id="suLgUrl" readonly style="flex:1;min-width:260px;font-family:monospace;font-size:13px;padding:10px 12px;border:1px solid var(--rule,#ddd);border-radius:8px;background:var(--cream,#faf8f4);">' +
          '<button class="btn btn-sm" type="button" id="suLgCopy">' + esc(T("Copy link", "Copiar enlace")) + "</button>" +
        "</div>" +
        '<div class="small" id="suLgMsg" style="margin-top:6px;height:16px;color:var(--ink-faint);"></div>' +
      "</div>" +
      '<details id="suLgMore" style="margin-top:18px;border:1px solid var(--rule,#E4DAC5);border-radius:10px;background:var(--cream,#FBF8F1);padding:0 14px;">' +
        '<summary style="cursor:pointer;font-size:12.5px;font-weight:700;color:var(--gold-deep,#9a6f24);padding:12px 0;">' +
          esc(T("Four more, for a formal plan", "Cuatro más, para un plan formal")) + "</summary>" +
        '<div class="welcome-fields" style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;padding:0 0 16px;align-items:end;">' +
          '<div class="field"><label for="suLgPlan">' + esc(T("Plan ID", "ID del plan")) + "</label>" +
            '<input type="text" id="suLgPlan" autocomplete="off" value="' + esc(planId()) + '"></div>' +
          '<div class="field"><label for="suLgGroup">' + esc(T("Tracking group", "Grupo de seguimiento")) + "</label>" +
            '<input type="text" id="suLgGroup" autocomplete="off" placeholder="e.g. Tier2"></div>' +
          '<div class="field"><label for="suLgPeriod">' + esc(T("Fix the period?", "¿Fijar el periodo?")) + "</label>" +
            '<select id="suLgPeriod"><option value="">' + esc(T("Adult chooses", "El adulto elige")) + "</option>" +
              PERIOD_DEFS.map(function (p) {
                return '<option value="' + esc(p.store) + '">' + esc(T(p.en, p.es)) + "</option>";
              }).join("") + "</select></div>" +
          '<div class="field"><label for="suLgRole">' + esc(T("Fix the role?", "¿Fijar el rol?")) + "</label>" +
            '<select id="suLgRole"><option value="">' + esc(T("Adult chooses", "El adulto elige")) + "</option>" +
              ROLES.map(function (r) { return '<option value="' + r.v + '">' + esc(T(r.en, r.es)) + "</option>"; }).join("") +
            "</select></div>" +
        "</div>" +
        '<p class="small" style="margin:0 0 14px;line-height:1.6;color:var(--ink-soft,#5b6675);">' +
          esc(T("The Plan ID is generated for you and is not a secret — it is how a year of entries stays attached to one plan when the team changes. Leave the last two on “Adult chooses” unless every entry on this link really does come from the same period or the same role.",
                "El ID del plan se genera solo y no es un secreto — es lo que mantiene un año de entradas unido a un plan cuando el equipo cambia. Deja los dos últimos en “El adulto elige” a menos que cada entrada de este enlace venga realmente del mismo periodo o del mismo rol.")) + "</p>" +
      "</details>" +
      '<div class="small" style="margin-top:16px;line-height:1.65;color:var(--ink-soft,#5b6675);">' +
        esc(T("Each adult signs their entry with their own name. The link carries the context, never a student’s identifier, never the Sheet address and never a passcode. Entries land in the same DailyCheckins tab as the class check-ins and read side by side on one student’s timeline.",
              "Cada adulto firma su entrada con su propio nombre. El enlace lleva el contexto, nunca un identificador del estudiante, nunca la dirección de la hoja y nunca una contraseña. Las entradas llegan a la misma pestaña DailyCheckins que los registros de clase y se leen juntas en la línea de tiempo de un estudiante.")) +
      "</div>";

    placeCard(panel, "aogDistPane-support", head, card);

    ["suLgSchool", "suLgGrade", "suLgClass", "suLgTerm", "suLgType",
     "suLgGroup", "suLgPlan", "suLgPeriod", "suLgRole"].forEach(function (id) {
      var e = el(id);
      if (!e) return;
      e.addEventListener("input", refreshSupportLink);
      e.addEventListener("change", refreshSupportLink);
    });

    var btns = el("suLgTypeBtns");
    if (btns) btns.addEventListener("click", function (ev) {
      var b = ev.target && ev.target.closest && ev.target.closest("button[data-v]");
      if (!b) return;
      var sel = el("suLgType");
      if (sel) sel.value = b.getAttribute("data-v");
      refreshSupportLink();
    });

    wireCopy("suLgCopy", "suLgUrl", "suLgMsg");
    refreshSupportLink();
  }

  function injectDistribute() {
    var panel = el("panel-distribute");
    if (!panel) return;
    injectClassCard(panel);
    injectSupportCard(panel);
  }

  /* =================================================================== THE PANEL
     The Daily log panel is EXTENDED, not replaced. aogRenderDaily is wrapped:
     the original runs untouched and draws exactly what it always drew, and this
     appends two things underneath it —

       · a Pull check-ins button, so a laptop can collect what other adults
         logged on their own devices
       · a cross-adult timeline, which is the whole point of a support link:
         who saw this student, when, and what they saw

     Nothing inside the original closure is reached into. */
  function periodPct(p) {
    var got = 0;
    CHECK_ORDER.forEach(function (k) { if (p && p[k]) got++; });
    return Math.round((got / CHECK_ORDER.length) * 100);
  }
  function pctColor(p) { return p >= 61 ? "var(--green,#2E6B3A)" : p >= 41 ? "var(--amber,#8A6D1F)" : "var(--red,#8B2A2A)"; }
  function shortD(iso) {
    /* .30cy — slice first: a Sheet-pulled record can carry a full ISO
       timestamp in .date, and "28T07:00:00.000Z" coerces to NaN (the 8/NaN
       Jimmy saw on a goal card). Same family as the 1899 trap. */
    var p = String(iso || "").slice(0, 10).split("-");
    return p.length === 3 ? (parseInt(p[1], 10) + "/" + parseInt(p[2], 10)) : iso;
  }
  function selectedStudent() {
    try { return (window.__aogDaily && window.__aogDaily.s) || ""; } catch (e) { return ""; }
  }
  /* The grade this student was last recorded at, so the timeline speaks their
     band's language rather than a default one. */
  function gradeOf(sid) {
    try {
      var recs = (typeof getAllRecords === "function" ? getAllRecords() : []) || [];
      for (var i = 0; i < recs.length; i++) {
        if (recs[i] && String(recs[i].studentId).trim() === sid && recs[i].grade != null) {
          return String(recs[i].grade);
        }
      }
    } catch (e) {}
    return ss("aog.launch.grade") || "8";
  }

  /* Every entry for one student, newest day first — the adults' observations
     and the student's own check-ins on the same days, each marked with who
     wrote it. Two stores in, one timeline out. */
  /* WHICH check-in this was. Several a day has always been supported, and a
     row that does not say whether it is the 7:55 or the 11:20 turns two
     different mornings into one indistinguishable pair. Nothing extra is
     asked of the student for this — it is read off the timestamp. */
  function ctxChip(p) {
    var bits = [];
    var tag = ctxLabel(p.contextTag);
    if (tag) bits.push(tag);
    var raw = String(p.timestamp || "");
    if (raw) {
      var d = new Date(raw);
      if (!isNaN(d.getTime())) {
        try { bits.push(d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })); } catch (e) {}
      }
    }
    if (!bits.length) return "";
    return ' <span style="font-size:10.5px;font-weight:700;color:var(--ink-faint,#8A92A6);white-space:nowrap;">· ' +
      esc(bits.join(" · ")) + "</span>";
  }

  function timelineFor(sid) {
    var byDate = {};
    function bucket(date) { return (byDate[date] = byDate[date] || []); }

    var days = (dailyLoad().logs || {})[sid] || {};
    Object.keys(days).forEach(function (date) {
      ((days[date] || {}).periods || []).forEach(function (p) { bucket(date).push(p); });
    });

    var sdays = (studentStore().logs || {})[sid] || {};
    Object.keys(sdays).forEach(function (date) {
      (sdays[date] || []).forEach(function (p) {
        var e = {}; for (var k in p) if (Object.prototype.hasOwnProperty.call(p, k)) e[k] = p[k];
        e.respondentRole = "student";
        bucket(date).push(e);
      });
    });

    return Object.keys(byDate).sort().reverse().map(function (date) {
      return {
        date: date,
        periods: byDate[date].sort(function (a, b) {
          return String(a.timestamp || "").localeCompare(String(b.timestamp || ""));
        })
      };
    }).filter(function (d) { return d.periods.length; });
  }
  function isStudentEntry(p) { return String(p && p.respondentRole) === "student"; }

  function adultsFor(sid) {
    var seen = {};
    timelineFor(sid).forEach(function (d) {
      d.periods.forEach(function (p) {
        if (isStudentEntry(p)) return;   /* the student is not one of the adults */
        var who = (p.respondentId || "").trim();
        if (who) seen[who] = (seen[who] || 0) + 1;
      });
    });
    return seen;
  }
  function studentEntryCount(sid) {
    var n = 0;
    timelineFor(sid).forEach(function (d) { d.periods.forEach(function (p) { if (isStudentEntry(p)) n++; }); });
    return n;
  }

  /* ── the Remove control  ·  .30dp ──────────────────────────────────────
     ⚠ TWO PRESSES, NEVER A BROWSER DIALOG. confirm() blocks the page, is
     painted by the browser rather than by this product, and reads as an
     error rather than as a question. The button arms itself instead, says in
     words what it is about to do, and disarms after six seconds if nobody
     meant it.
     ⚠ AND AN UNDO, because on this device the row can be the only copy.
     ⚠ NO RED AND NO NEW COLOR. A red control here would be the one thing
     this whole panel is written not to do — rank a record. */
  var CIDEL = { said: "", last: null, t: 0 };
  function ciDelBtn(sid, p) {
    return ' <button type="button" class="ci-del" data-cidel="' + esc(ciKeys(sid, p)[0]) + '"' +
      ' style="font:inherit;font-size:11px;font-weight:700;cursor:pointer;border:1px solid var(--rule,#E4DAC5);' +
      'background:var(--card,#fff);color:var(--ink-soft,#5b6675);border-radius:999px;padding:2px 10px;margin-left:7px;">' +
      esc(T("Remove", "Quitar")) + "</button>";
  }
  /* ⚠ SAY THAT THE SHEET IS UNTOUCHED, on the screen, every time. A teacher
     who thinks this deleted the Google Sheet row will go looking for a row
     that is still there; a teacher who thinks it did not will leave one they
     meant to remove. Neither guess is acceptable. */
  function ciRemovedLine(n) {
    return n === 1
      ? T("Removed 1 entry. It will not come back the next time you pull. The row in your Google Sheet is untouched — delete it there if you want it gone from the Sheet too.",
          "Se quitó 1 entrada. No volverá la próxima vez que traigas datos. La fila de tu Hoja de Google queda intacta — bórrala allí si también quieres que desaparezca de la Hoja.")
      : T("Removed " + n + " entries. They will not come back the next time you pull. The rows in your Google Sheet are untouched — delete them there if you want them gone from the Sheet too.",
          "Se quitaron " + n + " entradas. No volverán la próxima vez que traigas datos. Las filas de tu Hoja de Google quedan intactas — bórralas allí si también quieres que desaparezcan de la Hoja.");
  }
  function ciDelNote() {
    if (!CIDEL.said) return "";
    /* ⚠ --cream HAS NO DARK VALUE — it is defined on :root only, so a cream
       ground under var(--ink) text inverts to light-on-light the moment the
       theme flips. Same silent shape as the var(--field,#lit) fallback in
       .30dk. This notice sits on --card and is marked out by the gold edge
       instead; --card, --ink, --gold and --rule all carry dark values. */
    return '<div class="dl-mini" id="ciDelSaid" style="margin:12px 0 0;padding:9px 12px;border:1px solid var(--gold,#D9A33B);' +
      'border-radius:9px;background:var(--card,#fff);color:var(--ink,#22303F);font-size:12.5px;line-height:1.6;">' +
      esc(CIDEL.said) +
      (CIDEL.last
        ? ' <button type="button" id="ciDelUndo" style="font:inherit;font-size:12px;font-weight:800;cursor:pointer;' +
          'border:1px solid var(--gold,#D9A33B);background:var(--card,#fff);color:var(--ink,#22303F);' +
          'border-radius:999px;padding:2px 12px;margin-left:8px;">' + esc(T("Undo", "Deshacer")) + "</button>"
        : "") +
      "</div>";
  }
  function ciDisarm() {
    try { clearTimeout(CIDEL.t); } catch (e) {}
    Array.prototype.forEach.call(document.querySelectorAll(".ci-del[data-armed]"), function (o) {
      var was = o.getAttribute("data-was");
      o.removeAttribute("data-armed");
      if (was != null) { o.textContent = was; o.removeAttribute("data-was"); }
    });
  }
  function ciDoRemove(keys) {
    var took = [];
    try { took = removeCheckins(keys) || []; } catch (e) {}
    CIDEL.last = took.length ? took : null;
    CIDEL.said = took.length ? ciRemovedLine(took.length) : T("Nothing to remove.", "No hay nada que quitar.");
    try { augmentPanel(); } catch (e2) {}
  }
  /* Delegated, because #aogCiPanelExtra is thrown away and rebuilt on every
     render — a listener bound to a button would not survive its own click. */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("#ciDelUndo")) {
      var n = 0;
      try { n = restoreCheckins(CIDEL.last || []); } catch (x) {}
      CIDEL.last = null;
      CIDEL.said = n
        ? (n === 1 ? T("Put 1 entry back.", "Se devolvió 1 entrada.")
                   : T("Put " + n + " entries back.", "Se devolvieron " + n + " entradas."))
        : T("Nothing to put back.", "No hay nada que devolver.");
      try { augmentPanel(); } catch (x2) {}
      return;
    }
    var b = t.closest(".ci-del");
    if (!b) { ciDisarm(); return; }
    var key = b.getAttribute("data-cidel");
    if (!key) return;
    if (b.getAttribute("data-armed")) { ciDisarm(); ciDoRemove([key]); return; }
    ciDisarm();
    b.setAttribute("data-was", b.textContent);
    b.setAttribute("data-armed", "1");
    b.textContent = T("Press again to remove", "Presiona otra vez para quitar");
    try { clearTimeout(CIDEL.t); } catch (x3) {}
    CIDEL.t = setTimeout(ciDisarm, 6000);
  });

  function renderTimeline(sid) {
    var days = timelineFor(sid);
    var adults = adultsFor(sid);
    var names = Object.keys(adults).sort();
    var scount = studentEntryCount(sid);
    var flagged = 0;
    days.forEach(function (d) { d.periods.forEach(function (p) { if (p.followUp) flagged++; }); });

    if (!days.length) {
      return '<div class="dl-card"><div class="dl-h">' +
        esc(T("Across every adult", "Entre todos los adultos")) + "</div>" +
        '<div class="dl-mini" style="color:var(--ink-soft);">' +
        esc(T("Nothing logged for this student yet. Build a Student Support Check-In Link in Set up ▸ Distribute and send it to the adults who see them.",
              "Aún no hay registros para este estudiante. Crea un Enlace de registro de apoyo en Configurar ▸ Repartir y envíaselo a los adultos que lo ven.")) +
        "</div></div>";
    }

    var head =
      '<div class="dl-h">' + esc(T("Across every adult", "Entre todos los adultos")) +
        ' <span class="small" style="font-weight:400;color:var(--ink-faint);">· ' +
        esc(names.length + " " + (names.length === 1 ? T("adult", "adulto") : T("adults", "adultos"))) +
        " · " + esc(days.length + " " + (days.length === 1 ? T("day", "día") : T("days", "días"))) +
        (scount ? " · " + esc(scount + " " + T("from the student", "del estudiante")) : "") +
      "</span></div>" +
      (names.length
        ? '<div style="display:flex;flex-wrap:wrap;gap:7px;margin:0 0 12px;">' + names.map(function (n) {
            return '<span style="font-size:11.5px;font-weight:700;border-radius:999px;padding:3px 11px;' +
              'background:var(--cream,#FBF8F1);border:1px solid var(--rule,#E4DAC5);color:var(--navy,#0A1E33);">' +
              esc(n) + ' <span style="opacity:.6;font-weight:600;">' + adults[n] + "</span></span>";
          }).join("") + "</div>"
        : "") +
      (flagged
        ? '<div style="font-size:12.5px;font-weight:700;color:var(--gold-deep,#9a6f24);background:rgba(217,163,59,.12);' +
          'border:1px solid var(--gold,#D9A33B);border-radius:9px;padding:8px 12px;margin:0 0 12px;">' +
          esc(flagged + " " + T("entr" + (flagged === 1 ? "y" : "ies") + " asked to talk with someone.",
                                "entrada(s) pidieron hablar con alguien.")) + "</div>"
        : "");

    /* Short tags follow the student's own grade band, not a hardcoded one. */
    var tlDefs = {};
    checkDefs(bandFor(gradeOf(sid))).forEach(function (d) { tlDefs[d.key] = d.short; });

    var body = days.slice(0, 30).map(function (d, di) {
      var rows = d.periods.map(function (p) {
        var badges =
          (p._remote ? ' <span style="font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);">· ' + esc(T("from sheet", "de la hoja")) + "</span>" : "") +
          (p.followUp ? ' <span style="font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);">· ' + esc(T("wants to talk", "quiere hablar")) + "</span>" : "");

        /* A student's own check-in is not an adult's observation and must not
           be drawn as one. No percentage — three empty checkboxes are not a
           0% day; they are a row where nobody was ticking checkboxes. */
        if (isStudentEntry(p)) {
          var num = function (v) { return (v === "" || v == null) ? null : parseInt(v, 10); };
          var arr = num(p.arrival), con = num(p.connection), rdy = num(p.readiness);
          /* "Connected 2/5" alone is unreadable -- 2 on that scale is Distant,
             while 4 is called Connected. The word goes on the pill. */
          var pill = function (label, v, sk) {
            if (v == null) return "";
            var sdef = null;
            try { sdef = SERIES.filter(function (x) { return x.k === sk; })[0] || null; } catch (e) {}
            var w = sdef ? scaleWord(sdef, v) : "";
            return '<span style="display:inline-block;font-size:11px;font-weight:800;border-radius:999px;padding:2px 9px;margin-right:6px;' +
              "color:#fff;background:" + scaleColor(v) + ';">' + esc(label) + " " + v + "/5" +
              (w ? ' <span style="font-weight:600;opacity:.85;">\u00b7 ' + esc(w) + "</span>" : "") + "</span>";
          };
          var lines = [];
          if (p.feelingWords) lines.push(esc(T("Noticing", "Nota")) + ": " + esc(p.feelingWords.split(",").join(" · ")));
          if (p.need)         lines.push(esc(T("Needs", "Necesita")) + ": " + esc(p.need));
          /* Barrier AND impact, in one line. "Schoolwork" is a label;
             "Schoolwork — a whole lot" is a signal. The student reported it;
             it is NOT a statement that schoolwork caused anything. */
          if (p.challenge) {
            var iw = impactWord(p.challengeImpact);
            lines.push(esc(T("Harder today", "Más difícil hoy")) + ": " + esc(p.challenge) +
              (iw ? ' <span style="font-weight:700;">— ' + esc(T("in the way: ", "estorba: ")) + esc(iw) + "</span>" : ""));
          }
          if (p.agency)       lines.push(esc(T("Their move", "Su paso")) + ": " + esc(p.agency));
          return '<div style="display:flex;gap:11px;align-items:flex-start;padding:9px 0;border-top:1px solid var(--rule,#E4DAC5);">' +
            '<div style="flex:0 0 74px;font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--gold-deep,#9a6f24);padding-top:2px;">' +
              esc(T("Student", "Estudiante")) + "</div>" +
            '<div style="flex:1;min-width:0;">' +
              '<div style="font-size:13px;font-weight:700;color:var(--ink,#0A1E33);margin-bottom:4px;">' +
                esc(T("Their own daily check-in", "Su propio registro diario")) + ctxChip(p) + badges + ciDelBtn(sid, p) + "</div>" +
              '<div style="margin-bottom:4px;">' + pill(T("Arriving", "Llega"), arr, "arrival") +
                pill(T("Ready to learn", "Listo para aprender"), rdy, "readiness") +
                pill(T("Connected", "Conectado"), con, "connection") + "</div>" +
              (lines.length ? '<div style="font-size:12px;color:var(--ink-soft,#5b6675);line-height:1.6;">' + lines.join("<br>") + "</div>" : "") +
              (p.tellAdult ? '<div style="font-size:13px;color:var(--ink,#22303F);background:var(--rule-soft,#EFEADB);border-left:3px solid var(--gold,#D9A33B);padding:8px 11px;margin-top:6px;border-radius:0 6px 6px 0;">“' + esc(p.tellAdult) + "”</div>" : "") +
            "</div></div>";
        }

        var pct = periodPct(p);
        var tags = CHECK_ORDER.filter(function (k) { return p[k]; }).map(function (k) {
          return esc(tlDefs[k] || k);
        });
        var who = (p.respondentId || "").trim();
        return '<div style="display:flex;gap:11px;align-items:flex-start;padding:9px 0;border-top:1px solid var(--rule,#E4DAC5);">' +
          '<div style="flex:0 0 74px;font-size:12px;font-weight:800;color:' + pctColor(pct) + ';">' + pct + "%</div>" +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:13px;font-weight:700;color:var(--ink,#0A1E33);">' + esc(periodLabelFor(p.period) || "—") +
              (who ? ' <span style="font-weight:600;color:var(--ink-soft,#5b6675);">· ' + esc(who) +
                     (p.respondentRole ? ' <span style="color:var(--ink-faint,#8A92A6);font-weight:500;">(' +
                       esc(roleLabel(p.respondentRole)) + ")</span>" : "") + "</span>" : "") +
              badges + ciDelBtn(sid, p) +
            "</div>" +
            '<div style="font-size:12px;color:var(--ink-soft,#5b6675);margin-top:2px;">' +
              (tags.length ? tags.join(" · ") : esc(T("No checks marked", "Sin marcas"))) + "</div>" +
            (p.note ? '<div style="font-size:12.5px;color:var(--ink-faint,#8A92A6);font-style:italic;margin-top:3px;">“' + esc(p.note) + "”</div>" : "") +
          "</div></div>";
      }).join("");
      /* EACH DAY FOLDS. Jimmy, first night in production: "will these
         eventually fold up in an accordion?" — yes. The newest day is open;
         every earlier day is one line - the date, how many entries, how many
         adults - until tapped. ⚠ A TALK REQUEST IS NEVER FOLDED AWAY: a day
         holding one wears the flag on its closed summary, because a student
         who asked to talk must not be discoverable only by archaeology. */
      var nA = {}, talk = false;
      d.periods.forEach(function (p) {
        if (p && p.followUp) talk = true;
        if (!isStudentEntry(p)) { var w = (p.respondentId || "").trim(); if (w) nA[w] = 1; }
      });
      var na = Object.keys(nA).length;
      var meta = d.periods.length + " " + (d.periods.length === 1 ? T("entry", "entrada") : T("entries", "entradas"))
        + (na ? " · " + na + " " + (na === 1 ? T("adult", "adulto") : T("adults", "adultos")) : "");
      return '<details' + (di === 0 ? " open" : "") + ' style="margin-bottom:10px;">' +
        '<summary style="cursor:pointer;font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-soft,#5b6675);padding:4px 0;">' +
        esc(shortD(d.date)) + ' <span style="font-weight:600;letter-spacing:0;text-transform:none;color:var(--ink-faint,#8A92A6);">· ' + esc(meta) + "</span>" +
        (talk ? ' <span style="font-size:10px;font-weight:800;letter-spacing:.05em;color:var(--gold-deep,#9a6f24);border:1px solid var(--gold,#D9A33B);border-radius:999px;padding:1px 8px;text-transform:uppercase;">' + esc(T("wants to talk", "quiere hablar")) + "</span>" : "") +
        "</summary>" + rows + "</details>";
    }).join("");
    if (days.length > 30) {
      body += '<div style="font-size:11.5px;color:var(--ink-soft,#5b6675);font-style:italic;margin-top:6px;">' +
        esc(T("Showing the most recent 30 days with entries. Everything earlier is kept — on this device and in your Sheet.",
              "Se muestran los 30 días más recientes con entradas. Todo lo anterior se conserva — en este dispositivo y en tu Hoja.")) + "</div>";
    }

    return '<div class="dl-card">' + head + body + ciDelNote() +
      '<div class="dl-note">' + esc(T(
        "A pattern across adults is information. A single entry is not — read them together.",
        "Un patrón entre adultos es información. Una sola entrada no lo es — léelas en conjunto.")) + "</div></div>";
  }

  /* ================================================== THE STUDENT'S OWN TREND
     The adult trend plots one number out of 100 — the share of three
     observations ticked. A student's check-in has no such number, so it gets
     its own chart rather than being forced onto that axis: two 1-5 series,
     Arriving and Connected, on one shared scale.

     ONE AXIS, always. Both series are 1-5, so they belong on the same scale
     and can be read against each other. Nothing here ever gets a second y-axis.

     It follows whatever granularity the adult chart is already set to, so the
     two line up on the same time base and a teacher learns ONE control, not
     two. The bucket math below deliberately mirrors the Daily log's own
     bucketFor(); if you change the grain there, change it here. */

  /* Validated with the dataviz palette checker against both surfaces:
     lightness band, chroma floor, protan/deutan/tritan separation, the
     normal-vision floor and contrast all pass. Do not nudge these by eye. */
  /* The 1-5 WORDS matter more than the number. A teacher reading "Connected 2"
     has no way to know 2 means Distant -- worse, 4 on that same scale is itself
     called "Connected", so the series name and a scale value collide. Every
     place a number is shown now shows the student's own word beside it. These
     must stay identical to ARRIVAL / CONNECTION in the check-in itself. */
  var SERIES = [
    { k: "arrival",    en: "Arriving",  es: "Llega",     light: "#9E6A0A", dark: "#BE8A1C",   /* .30ed light was #C4820C, 3.2:1 on white */
      q: { en: "How are you arriving today?", es: "\u00bfC\u00f3mo llegas hoy?" },
      words: { en: ["Rough", "Heavy", "Okay", "Steady", "Good"],
               es: ["Dif\u00edcil", "Pesado", "M\u00e1s o menos", "Estable", "Bien"] } },
    { k: "readiness",  en: "Ready to learn", es: "Listo para aprender", light: "#AE3B70", dark: "#E08FB8",
      /* The ONLY dashed line on this chart. Three series on one 1-5 axis is at
         the edge of what color alone can carry -- protanopia pulls this
         magenta toward the blue -- so readiness is separated by dash pattern
         as well as hue, and every line still ends in its own named label. */
      dash: "6 4",
      q: { en: "How ready do you feel to learn right now?", es: "\u00bfQu\u00e9 tan listo/a te sientes para aprender ahora?" },
      words: { en: ["Can\u2019t start", "Will be hard", "Some of it", "Ready", "Ready to go"],
               es: ["No puedo empezar", "Ser\u00e1 dif\u00edcil", "Una parte", "Listo/a", "Listo/a para empezar"] } },
    { k: "connection", en: "Connected", es: "Conectado", light: "#1A72B5", dark: "#3690CC",
      q: { en: "How connected do you feel to people here?", es: "\u00bfQu\u00e9 tan conectado/a te sientes con la gente de aqu\u00ed?" },
      words: { en: ["On my own", "Distant", "Okay", "Connected", "I belong"],
               es: ["Por mi cuenta", "Distante", "M\u00e1s o menos", "Conectado/a", "Pertenezco"] } }
  ];
  /* Weekly points are averages, so the value is often fractional. Name the
     nearest word and mark it approximate rather than rounding silently. */
  function scaleWord(s, v) {
    if (v == null || isNaN(v)) return "";
    var w = (s.words && (T("en", "es") === "es" ? s.words.es : s.words.en)) || null;
    if (!w) return "";
    var i = Math.max(1, Math.min(5, Math.round(v)));
    var exact = Math.abs(v - i) < 0.05;
    return (exact ? "" : "\u2248 ") + w[i - 1];
  }
  function scaleKeyLine(s) {
    var w = (T("en", "es") === "es" ? s.words.es : s.words.en);
    return T(s.en, s.es) + " \u2014 \u201c" + T(s.q.en, s.q.es) + "\u201d  " +
      w.map(function (x, i) { return (i + 1) + " " + x; }).join(" \u00b7 ");
  }
  function isDarkNow() {
    try {
      var r = document.documentElement.getAttribute("data-theme");
      if (r === "dark") return true;
      if (r === "light") return false;
      return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    } catch (e) { return false; }
  }
  function seriesColor(s) { return isDarkNow() ? s.dark : s.light; }

  /* --- bucketing, mirroring the Daily log's own so the two charts align --- */
  function utcIso(ms) {
    var d = new Date(ms), m = d.getUTCMonth() + 1, da = d.getUTCDate();
    return d.getUTCFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (da < 10 ? "0" + da : da);
  }
  function weekStartISO(iso) {
    var t = Date.parse(iso + "T00:00:00Z");
    if (isNaN(t)) return iso;
    var dow = (new Date(t).getUTCDay() + 6) % 7;
    return utcIso(t - dow * 86400000);
  }
  var EPOCH_MON = Date.parse("1970-01-05T00:00:00Z");
  function ciBucket(iso, gran) {
    if (gran === "month") { var p = iso.split("-"); return { k: p[0] + "-" + p[1], lab: p[1] + "/'" + p[0].slice(2) }; }
    var dayCfg = { day: 1, days3: 3 };
    if (dayCfg[gran]) {
      var span = dayCfg[gran];
      if (span === 1) return { k: iso, lab: shortD(iso) };
      var idx = Math.floor(Date.parse(iso + "T00:00:00Z") / 86400000);
      var start = idx - (((idx % span) + span) % span);
      var k = utcIso(start * 86400000);
      return { k: k, lab: span + "d " + shortD(k) };
    }
    var wkCfg = { week: 1, week2: 2, week3: 3 }, M = wkCfg[gran] || 1;
    var ws = weekStartISO(iso);
    var wi = Math.round((Date.parse(ws + "T00:00:00Z") - EPOCH_MON) / (7 * 86400000));
    var base = wi - (((wi % M) + M) % M);
    var k2 = utcIso(EPOCH_MON + base * 7 * 86400000);
    return { k: k2, lab: (M === 1 ? ("wk " + shortD(k2)) : (M + "wk " + shortD(k2))) };
  }
  var CI_GRAN_MAX = { day: 14, days3: 14, week: 12, week2: 12, week3: 12, month: 12 };
  function ciUnitName(g) {
    return ({ day: T("day", "día"), days3: T("3-day period", "periodo de 3 días"),
              week: T("week", "semana"), week2: T("2-week period", "periodo de 2 semanas"),
              week3: T("3-week period", "periodo de 3 semanas"), month: T("month", "mes") })[g] || T("week", "semana");
  }
  function currentGran() {
    try { return (window.__aogDaily && window.__aogDaily.gran) || "week"; } catch (e) { return "week"; }
  }

  /* Grains at which a plotted point must stay a REAL answer somebody gave,
     rather than a mean of several. See the note inside studentSeries. */
  var DAY_GRAIN = { day: 1, days3: 1 };

  /* One point per bucket per series, plus whether anyone asked to talk in it. */
  function studentSeries(sid, gran) {
    var days = (studentStore().logs || {})[sid] || {};
    var dates = Object.keys(days).filter(function (d) { return (days[d] || []).length; }).sort();
    if (!dates.length) return null;

    var buckets = {}, order = [];
    dates.forEach(function (d) {
      var b = ciBucket(d, gran);
      if (!buckets[b.k]) { buckets[b.k] = { lab: b.lab, sums: {}, ns: {}, vals: {}, talk: 0, entries: 0 }; order.push(b.k); }
      var B = buckets[b.k];
      (days[d] || []).forEach(function (e) {
        B.entries++;
        if (e.followUp) B.talk++;
        SERIES.forEach(function (s) {
          var v = (e[s.k] === "" || e[s.k] == null) ? null : parseInt(e[s.k], 10);
          if (v == null || isNaN(v)) return;
          B.sums[s.k] = (B.sums[s.k] || 0) + v;
          B.ns[s.k] = (B.ns[s.k] || 0) + 1;
          (B.vals[s.k] = B.vals[s.k] || []).push(v);
        });
      });
    });
    order.sort();
    var keys = order.slice(-(CI_GRAN_MAX[gran] || 12));
    return keys.map(function (k) {
      var B = buckets[k];
      var pt = { k: k, lab: B.lab, talk: B.talk, entries: B.entries };
      /* ⚠ SAME-DAY ANSWERS ARE NEVER AVERAGED TOGETHER. A student who arrives
         Good at 8:05 and Rough at 11:20 has not had an Okay day, and a 3 on
         that chart is a lie that hides the eleven o'clock. At a day grain the
         plotted point is therefore the FIRST check-in of that day -- the
         morning baseline -- and the spread is drawn as a range, never folded
         in. A week or a month is a different claim ("readiness this week ran
         2.7") and may legitimately average, which is why the grain decides. */
      SERIES.forEach(function (s) {
        var arr = B.vals[s.k] || [];
        pt[s.k + "_n"] = arr.length;
        if (!arr.length) { pt[s.k] = null; pt[s.k + "_lo"] = null; pt[s.k + "_hi"] = null; return; }
        pt[s.k + "_lo"] = Math.min.apply(null, arr);
        pt[s.k + "_hi"] = Math.max.apply(null, arr);
        pt[s.k] = DAY_GRAIN[gran] ? arr[0] : Math.round((B.sums[s.k] / B.ns[s.k]) * 10) / 10;
      });
      return pt;
    });
  }

  function studentChartSvg(pts) {
    /* The right margin is measured from the direct end-labels rather than
       guessed, so "Connected 5" and the Spanish "Conectado 5" both fit instead
       of running off the edge of the plot. */
    var longest = 0;
    SERIES.forEach(function (s) {
      var vis = pts.filter(function (p) { return p[s.k] != null; });
      if (!vis.length) return;
      var lv = vis[vis.length - 1][s.k];
      var txt = T(s.en, s.es) + " " + lv;
      if (txt.length > longest) longest = txt.length;
      var wtxt = scaleWord(s, lv);
      if (wtxt.length > longest) longest = wtxt.length;
    });
    var W = 900, H = 250, ml = 40, mt = 16, mb = 52, n = pts.length;
    var mr = Math.max(74, Math.min(170, 20 + longest * 7.2));
    var X = function (i) { return ml + (W - ml - mr) * (n <= 1 ? 0.5 : i / (n - 1)); };
    var Y = function (v) { return mt + (H - mt - mb) * (1 - (Math.max(1, Math.min(5, v)) - 1) / 4); };
    var faint = "var(--ink-faint,#8A92A6)", rule = "var(--rule,#E4DAC5)";
    var surface = "var(--card,#fff)";
    var g = "";

    /* Recessive grid: five gridlines, one per point on the scale. */
    [1, 2, 3, 4, 5].forEach(function (t) {
      g += '<line x1="' + ml + '" y1="' + Y(t) + '" x2="' + (W - mr) + '" y2="' + Y(t) +
           '" stroke="' + rule + '" stroke-width="1"/>' +
           '<text x="' + (ml - 7) + '" y="' + (Y(t) + 3.5) + '" text-anchor="end" font-size="10.5" fill="' + faint + '">' + t + "</text>";
    });
    pts.forEach(function (p, i) {
      g += '<text x="' + X(i) + '" y="' + (H - mb + 17) + '" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--ink-soft,#5b6675)">' + esc(p.lab) + "</text>";
    });

    /* Two 2px lines, markers ringed in the surface color so an overlap stays
       readable, and a direct end-label per series instead of a number on
       every point. */
    var endLabels = [];
    /* Three ranges on the same x drew three whiskers exactly on top of each
       other -- the stack read as one muddy line belonging to nothing. Each
       series is nudged sideways by a fixed amount so a reader can tell whose
       spread they are looking at. */
    var DODGE = 3.6;
    SERIES.forEach(function (s, si) {
      var col = seriesColor(s);
      var off = (si - (SERIES.length - 1) / 2) * DODGE;
      var vis = pts.map(function (p, i) { return { i: i, v: p[s.k] }; }).filter(function (o) { return o.v != null; });
      if (!vis.length) return;
      /* The RANGE, drawn before the line so the line stays on top. Wherever a
         bucket holds more than one answer, the whisker spans the lowest and the
         highest the student actually gave. Without it a rough third period is
         invisible behind a calm morning. */
      vis.forEach(function (o) {
        var lo = pts[o.i][s.k + "_lo"], hi = pts[o.i][s.k + "_hi"];
        if (lo == null || hi == null || hi - lo < 0.05) return;
        var wx = X(o.i) + off;
        g += '<line class="ci-range" x1="' + wx.toFixed(1) + '" y1="' + Y(lo).toFixed(1) + '" x2="' + wx.toFixed(1) + '" y2="' + Y(hi).toFixed(1) +
             '" stroke="' + col + '" stroke-width="2.5" opacity=".55" stroke-linecap="round"/>' +
             '<line x1="' + (wx - 3.4).toFixed(1) + '" y1="' + Y(lo).toFixed(1) + '" x2="' + (wx + 3.4).toFixed(1) + '" y2="' + Y(lo).toFixed(1) +
             '" stroke="' + col + '" stroke-width="1.8" opacity=".55"/>' +
             '<line x1="' + (wx - 3.4).toFixed(1) + '" y1="' + Y(hi).toFixed(1) + '" x2="' + (wx + 3.4).toFixed(1) + '" y2="' + Y(hi).toFixed(1) +
             '" stroke="' + col + '" stroke-width="1.8" opacity=".55"/>';
      });
      var dash = s.dash ? ' stroke-dasharray="' + s.dash + '"' : "";
      if (vis.length > 1) {
        var d = "";
        vis.forEach(function (o, j) { d += (j ? "L" : "M") + X(o.i).toFixed(1) + " " + Y(o.v).toFixed(1) + " "; });
        g += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' + dash + "/>";
      }
      vis.forEach(function (o) {
        g += '<circle cx="' + X(o.i).toFixed(1) + '" cy="' + Y(o.v).toFixed(1) + '" r="4.5" fill="' + col +
             '" stroke="' + surface + '" stroke-width="2"/>';
      });
      var last = vis[vis.length - 1];
      endLabels.push({ y: Y(last.v), anchor: Y(last.v), x: X(last.i), col: col,
                       text: esc(T(s.en, s.es)) + " " + last.v,
                       sub: esc(scaleWord(s, last.v)) });
    });
    /* END-LABEL COLLISION (fixed 2026-08-26). Arriving and Connected share one
       1-5 axis, and a student very often ends a week on the same number for
       both — the two series then finish on the same gridline and the two direct
       labels printed exactly on top of each other ("ConnAerctievdi n5g 5").
       Spread them to a minimum vertical separation, keep the block inside the
       plot, and draw a hairline leader back to the point for any label that had
       to move, so the label still says which line it belongs to. */
    if (endLabels.length > 1) {
      var LGAP = 27;
      endLabels.sort(function (a, b) { return a.y - b.y; });
      for (var li = 1; li < endLabels.length; li++) {
        if (endLabels[li].y - endLabels[li - 1].y < LGAP) endLabels[li].y = endLabels[li - 1].y + LGAP;
      }
      var lOver = endLabels[endLabels.length - 1].y - (H - mb);
      if (lOver > 0) endLabels.forEach(function (L) { L.y -= lOver; });
      var lUnder = (mt + 6) - endLabels[0].y;
      if (lUnder > 0) endLabels.forEach(function (L) { L.y += lUnder; });
    }
    endLabels.forEach(function (L) {
      if (Math.abs(L.y - L.anchor) > 4) {
        g += '<path d="M' + (L.x + 6.5).toFixed(1) + ' ' + L.anchor.toFixed(1) +
             ' L' + (W - mr + 3) + ' ' + L.y.toFixed(1) + '" fill="none" stroke="' + L.col +
             '" stroke-width="1" opacity=".45"/>';
      }
      g += '<text x="' + (W - mr + 8) + '" y="' + (L.y + 1).toFixed(1) + '" font-size="11.5" font-weight="800" fill="' + L.col + '">' +
        L.text + "</text>";
      if (L.sub) {
        g += '<text x="' + (W - mr + 8) + '" y="' + (L.y + 14).toFixed(1) + '" font-size="10.5" font-weight="600" opacity=".78" fill="' + L.col + '">' +
          L.sub + "</text>";
      }
    });

    /* "Asked to talk" is a state, not a series — it gets a glyph and a label,
       never a color on its own. */
    var anyTalk = pts.some(function (p) { return p.talk; });
    if (anyTalk) {
      pts.forEach(function (p, i) {
        if (!p.talk) return;
        g += '<text x="' + X(i) + '" y="' + (H - mb + 33) + '" text-anchor="middle" font-size="12" fill="var(--gold-deep,#9a6f24)">⚑</text>';
      });
    }

    /* Hover: one full-height hit column per bucket, wider than the marks. */
    var colW = n <= 1 ? (W - ml - mr) : (W - ml - mr) / (n - 1);
    pts.forEach(function (p, i) {
      var cx = X(i);
      g += '<rect class="ci-hit" data-i="' + i + '" x="' + (cx - colW / 2).toFixed(1) + '" y="' + mt +
           '" width="' + colW.toFixed(1) + '" height="' + (H - mt - mb) + '" fill="transparent"/>';
    });
    g += '<line id="ciCross" x1="0" y1="' + mt + '" x2="0" y2="' + (H - mb) + '" stroke="' + faint +
         '" stroke-width="1" stroke-dasharray="3 3" style="display:none;pointer-events:none;"/>';

    return { svg: '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' +
      esc(T("Student daily check-in trend: arriving, ready to learn and connected, one to five",
            "Tendencia del registro diario del estudiante: cómo llega, qué tan listo para aprender y qué tan conectado, de uno a cinco")) +
      '" style="width:100%;min-width:520px;display:block;">' + g + "</svg>", anyTalk: anyTalk };
  }

  /* ===================================================== BY PERIOD
     2026-08-28. The chart above is ONE line per measure for the whole
     student, whatever period each check-in came from. That is right — it is
     how they are doing, and splitting three measures across six periods
     would be spaghetti nobody can read.

     But it means the period is invisible. A student seen in Period 1 and
     Period 7 shows a whisker where the two disagreed, and a whisker says
     "there was a spread" without ever saying WHICH ONE was the low end.
     Mornings fine, afternoons falling apart is exactly the pattern worth
     seeing, and it was the one thing the chart could not say.

     So: a small reading underneath, and only when it has something to say.

     ⚠ WHAT THIS IS NOT. It is not a ranking of periods, not a claim about a
     teacher, and not a claim about a subject. A period is a time of day with
     a different set of demands; that a student answers lower in one is a
     thing to be curious about, not a finding. Every number carries the count
     behind it, and a period with fewer than two check-ins is listed but never
     used to draw a comparison — one answer is not a pattern. */
  /* ⚠ ONE ARITHMETIC, TWO OUTPUTS. periodData counts; periodReading draws;
     the shared record tabulates. All three read the same object, so a
     printed page and the screen cannot disagree about a period average. */
  function periodData(sid) {
    var days = (studentStore().logs || {})[sid] || {};
    var byP = {}, total = 0;
    Object.keys(days).forEach(function (d) {
      (days[d] || []).forEach(function (e) {
        var p = String(e.period || "").trim();
        if (!p) return;                       /* no period = cannot be placed */
        total++;
        var B = byP[p] || (byP[p] = { n: 0, sums: {}, ns: {} });
        B.n++;
        SERIES.forEach(function (s) {
          var v = (e[s.k] === "" || e[s.k] == null) ? null : parseInt(e[s.k], 10);
          if (v == null || isNaN(v)) return;
          B.sums[s.k] = (B.sums[s.k] || 0) + v;
          B.ns[s.k] = (B.ns[s.k] || 0) + 1;
        });
      });
    });
    var keys = Object.keys(byP);
    /* Two periods is the minimum for a comparison to mean anything, and six
       check-ins is the minimum for the comparison not to be noise. Below
       either, this whole block stays off the screen rather than saying
       something thin. */
    if (keys.length < 2 || total < 6) return null;

    keys.sort(function (a, b) { return (periodNumFor(a) === "" ? 99 : periodNumFor(a)) - (periodNumFor(b) === "" ? 99 : periodNumFor(b)); });

    /* The one sentence. Deterministic: the widest gap on any single measure
       between two periods that each have at least two check-ins. Below 0.75
       it says they look alike rather than inventing a difference. */
    var best = null;
    SERIES.forEach(function (s) {
      var vals = keys.filter(function (p) { return (byP[p].ns[s.k] || 0) >= 2; })
        .map(function (p) { return { p: p, m: byP[p].sums[s.k] / byP[p].ns[s.k] }; });
      if (vals.length < 2) return;
      vals.sort(function (a, b) { return a.m - b.m; });
      var gap = vals[vals.length - 1].m - vals[0].m;
      if (!best || gap > best.gap) best = { gap: gap, s: s, lo: vals[0], hi: vals[vals.length - 1] };
    });
    var line;
    if (best && best.gap >= 0.75) {
      line = T(
        "Across these, " + T(best.s.en, best.s.es) + " runs lowest in " + (periodLabelFor(best.lo.p) || best.lo.p) +
          " and highest in " + (periodLabelFor(best.hi.p) || best.hi.p) + ". Worth being curious about, not a finding — a period is a different time of day with different demands.",
        "En estos, " + T(best.s.en, best.s.es) + " es más bajo en " + (periodLabelFor(best.lo.p) || best.lo.p) +
          " y más alto en " + (periodLabelFor(best.hi.p) || best.hi.p) + ". Vale la curiosidad, no es un hallazgo — un periodo es otro momento del día con otras exigencias.");
    } else {
      line = T("Nothing here separates one period from another by much.",
               "Nada aquí separa mucho un periodo de otro.");
    }
    function mean(p, k) {
      var n = byP[p].ns[k] || 0;
      return n ? Math.round((byP[p].sums[k] / n) * 10) / 10 : null;
    }
    return { keys: keys, byP: byP, total: total, line: line, mean: mean,
             label: function (p) { return periodLabelFor(p) || p; } };
  }
  function periodReading(sid) {
    var D = periodData(sid);
    if (!D) return "";
    var keys = D.keys, byP = D.byP;

    var rows = keys.map(function (p) {
      var B = byP[p];
      var cells = SERIES.map(function (s) {
        var n = B.ns[s.k] || 0;
        var m = n ? Math.round((B.sums[s.k] / n) * 10) / 10 : null;
        return '<td style="padding:5px 10px;text-align:center;font-variant-numeric:tabular-nums;color:' +
          (m == null ? "var(--ink-faint,#8A92A6)" : seriesColor(s)) + ';font-weight:' + (m == null ? "400" : "700") + ';">' +
          (m == null ? "—" : m) + "</td>";
      }).join("");
      return '<tr><th scope="row" style="padding:5px 10px;text-align:left;font-weight:600;white-space:nowrap;">' +
        esc(periodLabelFor(p) || p) + "</th>" + cells +
        '<td style="padding:5px 10px;text-align:right;color:var(--ink-faint,#8A92A6);white-space:nowrap;">' +
        esc(B.n + " " + (B.n === 1 ? T("check-in", "registro") : T("check-ins", "registros"))) + "</td></tr>";
    }).join("");

    var line = D.line;

    return '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--rule,#E4DAC5);">' +
      '<div class="dl-note" style="font-weight:700;margin:0 0 6px;">' +
        esc(T("The same check-ins, by period", "Los mismos registros, por periodo")) + "</div>" +
      '<div style="overflow-x:auto;"><table style="border-collapse:collapse;font-size:13px;min-width:340px;">' +
        "<thead><tr><th></th>" + SERIES.map(function (s) {
          return '<th scope="col" style="padding:0 10px 6px;text-align:center;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:' + seriesColor(s) + ';">' + esc(T(s.en, s.es)) + "</th>";
        }).join("") + "<th></th></tr></thead><tbody>" + rows + "</tbody></table></div>" +
      '<div class="dl-note" style="margin-top:8px;">' + esc(line) + "</div>" +
      '<div class="dl-note" style="margin-top:4px;">' + esc(T(
        "Averages of what the student said in each period, with the count behind each one. Nothing here ranks periods, teachers or subjects.",
        "Promedios de lo que el estudiante dijo en cada periodo, con el conteo detrás de cada uno. Nada aquí clasifica periodos, docentes ni materias.")) + "</div>" +
    "</div>";
  }

  function renderStudentChart(sid) {
    var gran = currentGran();
    var pts = studentSeries(sid, gran);
    if (!pts || !pts.length) {
      /* Quiet, and it names the next action rather than just saying "none". */
      return '<div class="dl-card"><div class="dl-h">' + esc(T("Their own check-ins", "Sus propios registros")) + "</div>" +
        '<div class="dl-mini" style="color:var(--ink-soft);">' +
        esc(T("No daily check-ins from this student yet. Build a student link in Set up ▸ Distribute — switch “Who fills this in?” to the student — and post it in Google Classroom.",
              "Aún no hay registros diarios de este estudiante. Crea un enlace de estudiante en Configurar ▸ Repartir — cambia “¿Quién lo completa?” al estudiante — y publícalo en Google Classroom.")) +
        "</div></div>";
    }

    var out = studentChartSvg(pts);
    /* The swatch draws the line as it is actually drawn -- solid or dashed --
       rather than a dot, so the key matches the chart for a reader who cannot
       separate the hues. */
    var legend = SERIES.map(function (s) {
      var c = seriesColor(s);
      return '<span style="display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;color:var(--ink-soft,#5b6675);">' +
        '<svg width="22" height="11" viewBox="0 0 22 11" aria-hidden="true" style="flex:0 0 auto;display:block;">' +
          '<line x1="0" y1="5.5" x2="22" y2="5.5" stroke="' + c + '" stroke-width="2.5" stroke-linecap="round"' +
            (s.dash ? ' stroke-dasharray="' + s.dash + '"' : "") + "/>" +
          '<circle cx="11" cy="5.5" r="3.4" fill="' + c + '" stroke="var(--card,#fff)" stroke-width="1.6"/>' +
        "</svg>" +
        esc(T(s.en, s.es)) + "</span>";
    }).join('<span style="width:18px;"></span>') +
    (out.anyTalk
      ? '<span style="width:18px;"></span><span style="display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:var(--gold-deep,#9a6f24);">⚑ ' +
        esc(T("asked to talk", "pidió hablar")) + "</span>"
      : "");

    /* Plain language, because the number is not the point. */
    var first = pts[0], last = pts[pts.length - 1];
    var reads = [];
    SERIES.forEach(function (s) {
      if (first[s.k] == null || last[s.k] == null || pts.length < 2) return;
      var d = Math.round((last[s.k] - first[s.k]) * 10) / 10;
      var word = d > 0.3 ? T("up", "sube") : d < -0.3 ? T("down", "baja") : T("about level", "estable");
      reads.push(esc(T(s.en, s.es)) + " " + esc(word) + (Math.abs(d) > 0.05 ? " (" + (d > 0 ? "+" : "") + d + ")" : ""));
    });
    var cap = pts.length > 1
      ? T("Across ", "En ") + pts.length + " " + ciUnitName(gran) + T("s: ", "s: ") + reads.join(" · ")
      : T("One ", "Un ") + ciUnitName(gran) + T(" so far — more will draw the line.", " hasta ahora — con más se traza la línea.");

    var multi = pts.some(function (p) {
      return SERIES.some(function (s) { return (p[s.k + "_n"] || 0) > 1; });
    });
    var grainNote = DAY_GRAIN[gran]
      ? T("The point is the FIRST check-in of that day. Several check-ins in one day are never averaged together — a rough third period would disappear into a calm morning.",
          "El punto es el PRIMER registro de ese día. Varios registros en un mismo día nunca se promedian juntos — un mal tercer periodo desaparecería dentro de una mañana tranquila.")
      : T("Averaged by ", "Promediado por ") + ciUnitName(gran) + T(", matching the grain of the trend above.", ", igual que el grano de la tendencia de arriba.");
    if (multi) {
      grainNote += " " + T("A vertical line marks a period with more than one check-in: its ends are the lowest and the highest the student actually gave.",
                           "Una línea vertical marca un periodo con más de un registro: sus extremos son el más bajo y el más alto que el estudiante realmente dio.");
    }

    return '<div class="dl-card" id="ciChartCard">' +
      '<div class="dl-h" style="display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 12px;">' +
        "<span>" + esc(T("Their own check-ins", "Sus propios registros")) +
        ' <span class="small" style="font-weight:400;color:var(--ink-faint);">· ' +
        esc(T("how the student described the day, 1–5", "cómo describió el día el estudiante, 1–5")) + "</span></span>" +
        /* plain markup + a data attribute: this card is re-rendered wholesale,
           and the handoff layer loads after this one. */
        '<button type="button" class="hd-b ghost" style="margin-left:auto;align-self:center;font-size:12.5px;padding:6px 13px;" ' +
          'data-hdshare="checkin:student" data-hdarg="' + esc(sid) + '">' +
          esc(T("Print / Share", "Imprimir / Compartir")) + "</button>" +
      "</div>" +
      '<div class="dl-note" style="margin:0 0 8px;line-height:1.6;">' +
        esc(T("Arriving and Ready to learn are deliberately two questions. A student can arrive Heavy and still be able to work; another can arrive Okay and be unable to start. Read them together, never added up.",
              "Cómo llega y Listo para aprender son dos preguntas a propósito. Un estudiante puede llegar Pesado y aun así poder trabajar; otro puede llegar Más o menos y no poder empezar. Léelas juntas, nunca sumadas.")) +
      "</div>" +
      '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px 4px;margin:0 0 8px;">' + legend + "</div>" +
      '<div class="dl-note" style="margin:0 0 12px;line-height:1.65;">' +
        SERIES.map(function (s) {
          return '<span style="font-weight:700;color:' + seriesColor(s) + ';">' + esc(T(s.en, s.es)) + "</span> " +
            esc(scaleKeyLine(s).replace(T(s.en, s.es) + " ", ""));
        }).join("<br>") +
      "</div>" +
      '<div class="dl-gridwrap" style="padding:10px 8px;position:relative;" id="ciChartWrap">' + out.svg +
        '<div id="ciTip" style="position:absolute;pointer-events:none;display:none;z-index:5;background:var(--navy,#0A1E33);color:#fff;' +
        'font-size:12px;line-height:1.5;padding:8px 11px;border-radius:8px;white-space:nowrap;box-shadow:0 6px 18px -8px rgba(0,0,0,.55);"></div>' +
      "</div>" +
      '<div class="dl-note" style="margin-top:8px;">' + esc(cap) + "</div>" +
      '<div class="dl-note">' + esc(grainNote) + " " +
        esc(T("Never averaged into the adult trend above — these are the student's words about their day, not an observation of it. Every entry behind this line is listed below.",
              "Nunca se promedia con la tendencia de adultos de arriba — estas son las palabras del estudiante sobre su día, no una observación de él. Cada entrada detrás de esta línea aparece abajo.")) +
      "</div>" +
      /* Only appears for a student seen in more than one period, with enough
         check-ins for the comparison to mean anything. Returns "" otherwise,
         which is most students. */
      periodReading(sid) +
      "</div>";
  }

  function wireStudentChart(sid) {
    var wrap = el("ciChartWrap"), tip = el("ciTip");
    if (!wrap || !tip) return;
    var pts = studentSeries(sid, currentGran());
    if (!pts) return;
    var svg = wrap.querySelector("svg");
    var cross = el("ciCross");

    function hide() { tip.style.display = "none"; if (cross) cross.style.display = "none"; }

    Array.prototype.forEach.call(wrap.querySelectorAll(".ci-hit"), function (r) {
      r.style.cursor = "crosshair";
      r.addEventListener("mouseenter", function () {
        var i = parseInt(r.getAttribute("data-i"), 10);
        var p = pts[i];
        if (!p) return;
        var lines = SERIES.filter(function (s) { return p[s.k] != null; }).map(function (s) {
          var lo = p[s.k + "_lo"], hi = p[s.k + "_hi"];
          var rng = (lo != null && hi != null && hi - lo > 0.05)
            ? ' <span style="opacity:.75;">' + esc(T("low ", "mín ")) + lo + esc(T(", high ", ", máx ")) + hi + "</span>"
            : "";
          return '<span style="color:' + seriesColor(s) + ';font-weight:800;">●</span> ' +
                 esc(T(s.en, s.es)) + " " + p[s.k] + "/5" + rng;
        });
        if (p.talk) lines.push("⚑ " + esc(p.talk + " " + T("asked to talk", "pidió hablar")));
        tip.innerHTML = '<strong>' + esc(p.lab) + "</strong> · " +
          esc(p.entries + " " + (p.entries === 1 ? T("check-in", "registro") : T("check-ins", "registros"))) +
          "<br>" + lines.join("<br>");
        var box = svg.getBoundingClientRect(), wbox = wrap.getBoundingClientRect();
        var rb = r.getBoundingClientRect();
        var cx = rb.left + rb.width / 2 - wbox.left;
        tip.style.display = "block";
        tip.style.left = Math.max(6, Math.min(wbox.width - tip.offsetWidth - 6, cx - tip.offsetWidth / 2)) + "px";
        tip.style.top = "14px";
        if (cross) {
          var vx = parseFloat(r.getAttribute("x")) + parseFloat(r.getAttribute("width")) / 2;
          cross.setAttribute("x1", vx); cross.setAttribute("x2", vx);
          cross.style.display = "";
        }
      });
      r.addEventListener("mouseleave", hide);
    });
    wrap.addEventListener("mouseleave", hide);
  }

  function pullBar() {
    var q = queueGet().length;
    return '<div class="dl-card" id="ciPullCard" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">' +
      '<button type="button" class="dl-btn" id="ciPullBtn">' +
        esc(T("Pull check-ins from the sheet", "Traer registros de la hoja")) + "</button>" +
      '<span class="dl-status" id="ciPullMsg" style="color:var(--ink-soft,#5b6675);font-weight:600;"></span>' +
      (q ? '<span class="dl-mini" style="color:var(--gold-deep,#9a6f24);font-weight:700;">' +
           esc(q + " " + T("waiting to send from this device", "esperando enviarse desde este dispositivo")) + "</span>" : "") +
      "</div>";
  }

  /* --------------------------------------------------------- the roster gap
     The Daily log's own student list is built from screener records plus
     anyone with an adult log. A student who has ONLY ever done the daily
     check-in is in neither, so the panel cannot list them — and it clears any
     selection it does not recognize, so simply adding an <option> is undone on
     the next render.

     Rather than reach into that closure or widen getAllRecords() — which feeds
     eighteen other things including every report list — this adds a picker of
     its own, and ONLY when it is actually needed. In the normal flow, where a
     class does the Fall reflection first, every student is already in the
     panel's list, nothing is missing, and no second control appears. */
  /* ⚠ `pinned` EXISTS BECAUSE THE PANEL USED TO WIN AN ARGUMENT IT COULD NOT
     LOSE. Reported 2026-08-28: "I am trying to click on Violet and it doesn't
     allow me to." The picker snapped straight back to whoever was already
     chosen, and the student with check-ins ONLY — the exact case this control
     was built for — could never be opened at all.

     augmentPanel() opened with `if (panelSid) CI2.sid = panelSid;` and then
     read `sid = panelSid || CI2.sid`. Both lines are right on their own: the
     Daily Log's own student picker SHOULD lead. But choosing an orphan runs
     augmentPanel() again, and the panel still had the previous student
     selected — so the choice just made was overwritten one line later and the
     re-render put the old name back in the box. Nothing was broken enough to
     throw; it simply refused.

     The rule now: the panel leads UNTIL the teacher picks someone the panel
     does not know, and that choice holds until the panel's own control
     actually moves. `lastPanel` is how we tell a real move from a re-render. */
  var CI2 = { sid: "", pinned: false, lastPanel: null };

  function panelRosterIds() {
    var out = [];
    var sel = el("dlStudent");
    if (!sel) return out;
    Array.prototype.forEach.call(sel.options, function (o) {
      var v = String(o.value || "").trim();
      if (v && v !== "__type__") out.push(v);
    });
    return out;
  }
  function everyCheckinStudent() {
    var ids = {};
    Object.keys(dailyLoad().logs || {}).forEach(function (id) { ids[id] = 1; });
    Object.keys(studentStore().logs || {}).forEach(function (id) { ids[id] = 1; });
    return Object.keys(ids).sort();
  }

  function orphanPicker(all, missing, sid) {
    return '<div class="dl-card" id="ciWhoCard">' +
      '<div class="dl-h">' + esc(T("Whose check-ins?", "¿Registros de quién?")) + "</div>" +
      '<div class="dl-mini" style="color:var(--ink-soft);margin:-4px 0 10px;">' +
        esc(missing.length === 1
          ? T("One student has check-ins but hasn’t completed a self-reflection, so the form above can’t list them yet. They’re here.",
              "Un estudiante tiene registros pero aún no ha completado una autorreflexión, así que el formulario de arriba todavía no puede listarlo. Está aquí.")
          : missing.length + T(" students have check-ins but haven’t completed a self-reflection, so the form above can’t list them yet. They’re here.",
                               " estudiantes tienen registros pero aún no han completado una autorreflexión, así que el formulario de arriba todavía no puede listarlos. Están aquí.")) +
      "</div>" +
      '<select id="ciWhoSel" class="dl-periodsel">' +
        '<option value="">' + esc(T("Select a student…", "Selecciona un estudiante…")) + "</option>" +
        all.map(function (id) {
          return '<option value="' + esc(id) + '"' + (id === sid ? " selected" : "") + ">" +
            esc(id) + (missing.indexOf(id) !== -1 ? " · " + esc(T("check-ins only", "solo registros")) : "") + "</option>";
        }).join("") +
      "</select></div>";
  }

  function augmentPanel() {
    var host = el("aogDailyBody");
    if (!host) return;

    var panelSid = selectedStudent();
    /* A CHANGE in the panel's own selection releases the pin; a re-render
       with the same value does not. */
    if (panelSid !== CI2.lastPanel) { CI2.lastPanel = panelSid; CI2.pinned = false; }
    if (panelSid && !CI2.pinned) CI2.sid = panelSid;   /* the panel leads when it can */
    var all = everyCheckinStudent();
    var inPanel = panelRosterIds();
    var missing = all.filter(function (id) { return inPanel.indexOf(id) === -1; });
    if (CI2.sid && all.indexOf(CI2.sid) === -1) { CI2.sid = ""; CI2.pinned = false; }
    var sid = CI2.pinned ? CI2.sid : (panelSid || CI2.sid);

    var mine = el("aogCiPanelExtra");
    if (!mine) {
      mine = document.createElement("div");
      mine.id = "aogCiPanelExtra";
      host.appendChild(mine);
    }
    mine.innerHTML = pullBar() +
      (missing.length ? orphanPicker(all, missing, sid) : "") +
      (sid ? (renderStudentChart(sid) + renderTimeline(sid)) : "");
    if (sid) { try { wireStudentChart(sid); } catch (e) {} }

    var who = el("ciWhoSel");
    if (who) who.addEventListener("change", function () {
      var v = who.value;
      CI2.sid = v;
      var sel = el("dlStudent");
      /* If the panel knows this student, hand the whole panel over so there is
         one selection, not two. If it does not, draw ours alone. */
      var known = sel && Array.prototype.some.call(sel.options, function (o) { return o.value === v; });
      if (!v) {                       /* back to "Select a student…" */
        CI2.pinned = false;
        augmentPanel();
      } else if (known && sel) {
        CI2.pinned = false;           /* the panel is taking it from here */
        sel.value = v;
        if (typeof window.dlLoadStudent === "function") window.dlLoadStudent();
        else sel.dispatchEvent(new Event("change"));
      } else {
        /* ⚠ THE LINE THE BUG TURNED ON. Without the pin this choice is
           overwritten by the panel's stale selection before it can render. */
        CI2.pinned = true;
        augmentPanel();
      }
    });

    var btn = el("ciPullBtn");
    if (btn) btn.addEventListener("click", function () {
      var msg = el("ciPullMsg");
      btn.disabled = true;
      if (msg) { msg.textContent = T("Pulling…", "Trayendo…"); msg.style.color = "var(--ink-soft,#5b6675)"; }
      window.aogPullCheckins().then(function (res) {
        btn.disabled = false;
        if (!msg) return;
        if (res.ok) {
          var said = res.count
            ? T("Pulled ", "Se trajeron ") + res.count + T(" check-in row(s).", " registro(s).")
            : T("No check-ins in the sheet yet.", "Aún no hay registros en la hoja.");
          /* the same tap now brings math practice back too — say so, or a
             teacher has no way to know the rows arrived */
          if (res.practice) {
            said += T(" And ", " Y ") + res.practice + T(" practice row(s).", " fila(s) de práctica.");
          }
          /* The re-render replaces this element, so say it AFTER, on the new
             one — otherwise the teacher clicks Pull and is told nothing. */
          if (typeof window.aogRenderDaily === "function") window.aogRenderDaily();
          var m2 = el("ciPullMsg");
          if (m2) { m2.style.color = "var(--navy,#0A1E33)"; m2.textContent = said; }
        } else {
          msg.style.color = "var(--red,#8B2A2A)";
          msg.textContent = res.error || T("Couldn’t reach the sheet.", "No se pudo conectar con la hoja.");
        }
      });
    });
  }

  (function wrapDaily() {
    function attach() {
      /* aogDailyGran() calls aogRenderDaily(), which is wrapped below, so the
         student chart follows the grain button with no control of its own. */
      if (typeof window.aogRenderDaily !== "function" || window.aogRenderDaily.__aogCheckin) return;
      var orig = window.aogRenderDaily;
      var wrapped = function () {
        var r = orig.apply(this, arguments);
        try { augmentPanel(); } catch (e) {}
        return r;
      };
      wrapped.__aogCheckin = true;
      window.aogRenderDaily = wrapped;
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", attach);
    else attach();
    setTimeout(attach, 600);
    setTimeout(attach, 2000);
  })();

  /* The Distribute card is built when the tab first exists. */
  (function distBoot() {
    function go() { try { injectDistribute(); } catch (e) {} }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
    setTimeout(go, 800);
    setTimeout(go, 2400);
  })();

  /* ==================================================== THE SHARED RECORD
     One student's own daily check-ins, as DATA, for #aog-handoff
     to print and to seal into a link.

     ⚠ THE THREE MEASURES ARE NEVER ADDED UP, HERE EITHER. Arriving, Ready
     to learn and Connected are three questions on one axis and the record
     says so in words before it draws a single line. A student can arrive
     Heavy and still be able to work.

     ⚠ SAME-DAY ANSWERS ARE NEVER AVERAGED at a day grain — the point is the
     first check-in of that day and the whisker is the real low and high the
     student gave. The grain note travels with the chart, because a reader
     who does not know which claim is being made will pick the wrong one.

     ⚠ WHAT THEY TYPED DOES NOT TRAVEL. "Anything you want an adult to know?"
     is the one place a child says something nobody offered them, sometimes
     about home. It stays on the educator's own screen. The record says so
     with a count rather than silently dropping it. Same rule as the exit
     slip's typed box. */
  function packet(sid) {
    /* ⚠ NEVER UPPERCASE A STUDENT CODE HERE. This line used to read
       .trim().toUpperCase(), and it was the only place in this whole module
       that touched a sid's case. Every writer -- the student form at
       saveEntry(), the Sheet pull, the dropdown that names the button's
       data-hdarg -- stores and passes the code EXACTLY as it was typed. So a
       student whose code is "haagen" drew a chart on screen and then handed
       "HAAGEN" to studentStore(), which has no such key: studentSeries()
       returned null, packet() returned null, and the share layer told the
       teacher "There is nothing to share here yet." while the data sat
       plotted above the button. Print / Share was dead for every lowercase
       code on the site. The screen and the record MUST look the student up
       the same way, so this resolves against the keys that actually exist --
       exact first, then a case-insensitive match so a code entered with
       different case on a second device still finds its own history. */
    sid = String(sid || "").trim();
    var logs = studentStore().logs || {};
    if (sid && !logs[sid]) {
      var lc = sid.toLowerCase();
      var hit = Object.keys(logs).filter(function (k) { return String(k).toLowerCase() === lc; })[0];
      if (hit) sid = hit;
    }
    var gran = currentGran();
    var pts = studentSeries(sid, gran);
    var days = logs[sid] || {};
    var dates = Object.keys(days).filter(function (d) { return (days[d] || []).length; }).sort();
    if (!pts || !pts.length) return null;

    var b = [{ y: "note", h: T("What this is", "Qué es esto"),
      p: T("These are the student's own answers about their own day, on a 1–5 scale they never see as a number — they choose a word. Arriving and Ready to learn are deliberately two questions: a student can arrive Heavy and still be able to work, and another can arrive Okay and be unable to start. Read them together, never added up. Nothing here is a score of the student.",
           "Son las respuestas del propio estudiante sobre su propio día, en una escala de 1 a 5 que él nunca ve como número — elige una palabra. Cómo llega y Listo para aprender son dos preguntas a propósito: puede llegar Pesado y aun así poder trabajar, y otro puede llegar Más o menos y no poder empezar. Léelas juntas, nunca sumadas. Nada aquí es una calificación del estudiante.") }];

    var entries = 0, talk = 0, typed = 0;
    dates.forEach(function (d) {
      (days[d] || []).forEach(function (e) {
        entries++;
        if (e.followUp) talk++;
        if (String(e.tellAdult || "").trim()) typed++;
      });
    });
    b.push({ y: "kv", h: T("At a glance", "De un vistazo"), i: [
      [T("Check-ins", "Registros"), String(entries)],
      [T("Days", "Días"), String(dates.length)],
      [T("First", "Primero"), dates.length ? shortD(dates[0]) : ""],
      [T("Asked to talk", "Pidió hablar"), String(talk)]
    ] });

    /* the chart, as numbers — one x per bucket, in order */
    var ser = SERIES.map(function (s) {
      var p = [], r = [];
      pts.forEach(function (pt, i) {
        if (pt[s.k] == null) return;
        p.push([i, pt[s.k]]);
        var lo = pt[s.k + "_lo"], hi = pt[s.k + "_hi"];
        if (lo != null && hi != null && hi - lo > 0.05) r.push([i, lo, hi]);
      });
      return { n: T(s.en, s.es), c: s.light, cd: s.dark, dash: s.dash || "", dot: 1, p: p, r: r };
    }).filter(function (x) { return x.p.length; });

    var xl = [];
    if (pts.length) {
      xl.push([0, pts[0].lab, "start"]);
      if (pts.length > 2) xl.push([Math.floor((pts.length - 1) / 2), pts[Math.floor((pts.length - 1) / 2)].lab, "middle"]);
      if (pts.length > 1) xl.push([pts.length - 1, pts[pts.length - 1].lab, "end"]);
    }
    var multi = pts.some(function (p) { return SERIES.some(function (s) { return (p[s.k + "_n"] || 0) > 1; }); });
    var grainNote = DAY_GRAIN[gran]
      ? T("Each point is the FIRST check-in of that day. Several check-ins in one day are never averaged together — a rough third period would disappear into a calm morning.",
          "Cada punto es el PRIMER registro de ese día. Varios registros en un mismo día nunca se promedian juntos — un mal tercer periodo desaparecería dentro de una mañana tranquila.")
      : T("Averaged by " + ciUnitName(gran) + ".", "Promediado por " + ciUnitName(gran) + ".");
    if (multi) {
      grainNote += " " + T("A vertical line marks a period with more than one check-in: its ends are the lowest and the highest the student actually gave.",
                           "Una línea vertical marca un periodo con más de un registro: sus extremos son el más bajo y el más alto que el estudiante realmente dio.");
    }
    b.push({ y: "chart", h: T("How they described the day", "Cómo describió el día"),
             ymin: 0.6, ymax: 5.4, yt: [1, 2, 3, 4, 5], yu: "",
             xmin: -0.35, xmax: (pts.length - 1) + 0.35, xl: xl, ser: ser,
             key: SERIES.map(function (s) { return scaleKeyLine(s); }).join("  |  "),
             p: grainNote });

    var D = periodData(sid);
    if (D) {
      b.push({ y: "table", h: T("The same check-ins, by period", "Los mismos registros, por periodo"),
        cols: [T("Period", "Periodo")].concat(SERIES.map(function (s) { return T(s.en, s.es); })).concat([T("Check-ins", "Registros")]),
        rows: D.keys.map(function (p) {
          return [D.label(p)].concat(SERIES.map(function (s) { var m = D.mean(p, s.k); return m == null ? "—" : String(m); }))
                             .concat([String(D.byP[p].n)]);
        }),
        p: D.line + " " + T("Averages of what the student said in each period, with the count behind each one. Nothing here ranks periods, teachers or subjects.",
                            "Promedios de lo que el estudiante dijo en cada periodo, con el conteo detrás de cada uno. Nada aquí clasifica periodos, docentes ni materias.") });
    }

    /* every entry behind the line, in the student's own chosen words */
    var rows = [];
    dates.slice().reverse().forEach(function (d) {
      (days[d] || []).slice().reverse().forEach(function (e) {
        var when = shortD(d) + (e.period ? ("  ·  " + (periodLabelFor(String(e.period)) || String(e.period))) : "");
        var gist = SERIES.map(function (s) {
          var v = parseInt(e[s.k], 10);
          return isNaN(v) ? "" : (T(s.en, s.es) + " " + scaleWord(s, v));
        }).filter(Boolean).join("  ·  ");
        var det = [];
        [["feelingWords", T("Noticing", "Nota")], ["need", T("Asked for", "Pidió")],
         ["challenge", T("In the way", "Lo que estorbaba")], ["agency", T("Their move", "Su paso")]].forEach(function (f) {
          var v = String(e[f[0]] || "").trim();
          if (v) det.push(f[1] + ": " + v.split(" · ").map(function (x) {
            try { return window.AOGCheckinTr ? window.AOGCheckinTr(x.trim()) : x.trim(); } catch (er) { return x.trim(); }
          }).join(" · "));
        });
        if (e.followUp) det.push(T("Asked to talk to someone.", "Pidió hablar con alguien."));
        rows.push([when, gist || T("started and left it", "empezó y lo dejó"), det.join("  ·  ")]);
      });
    });
    if (rows.length) b.push({ y: "rows", h: T("Every check-in behind the line", "Cada registro detrás de la línea"), i: rows.slice(0, 200) });

    if (typed) {
      b.push({ y: "note", h: T("What is not on this page", "Lo que no está en esta página"),
        p: T(typed + (typed === 1 ? " check-in has something the student typed" : " check-ins have something the student typed") +
             " in answer to “Anything you want an adult to know?”. It is not printed here and is not carried in a shared link — it is on the teacher’s own screen. It is the one place a student says something nobody offered them, and it is theirs to tell, not a record’s to forward.",
             typed + (typed === 1 ? " registro tiene algo que el estudiante escribió" : " registros tienen algo que el estudiante escribió") +
             " en «¿Algo que quieras que un adulto sepa?». No se imprime aquí ni viaja en un enlace compartido — está en la pantalla del docente. Es el único lugar donde un estudiante dice algo que nadie le ofreció, y le corresponde a él contarlo.") });
    }

    return {
      v: 1, k: "checkin",
      t: T("Daily check-ins · one student", "Registros diarios · un estudiante"),
      s: sid,
      c: pts.length + " " + ciUnitName(gran) + (pts.length === 1 ? "" : "s"),
      r: dates.length ? (shortD(dates[0]) + T(" to ", " a ") + shortD(dates[dates.length - 1])) : "",
      g: new Date().toISOString(), b: b
    };
  }

  /* A small, honest surface for anyone poking at this from the console. */
  window.AOGCheckins = {
    /* .30dp — removal. The panel calls these; nothing else reaches into the
       two stores. remove() hands back what it took so the panel can offer
       Undo, and restore() is the only way a tombstone is ever lifted. */
    remove: removeCheckins,
    restore: restoreCheckins,
    /* test seam — the harness proves the tombstone survives a pull without
       going near the network, exactly as AOGExitSlip.__merge does. */
    __merge: mergeRemoteIntoDaily,
    keysFor: keysForCheckinStudent,
    removed: goneListCi,
    KEYS: { daily: DKEY, student: SKEY, queue: QKEY, remote: RKEY, removed: CGONE },
    packet: packet,
    periodData: periodData,
    type: ciType,
    save: saveEntry,
    queue: queueGet,
    flush: flushCheckins,
    pull: function () { return window.aogPullCheckins(); },
    timeline: timelineFor,
    /* timelineFor returns the DAYS; renderTimeline returns what a teacher
       actually reads. Both, because a harness needs the data and the render. */
    timelineHtml: renderTimeline,
    /* The trend and the points behind it, so a chart claim can be checked from
       the console (and by the harness) instead of eyeballed. */
    chart: function (sid) { return renderStudentChart(sid); },
    series: function (sid, gran) { return studentSeries(sid, gran || currentGran()); },
    link: buildSupportLink,
    open: function () { return window.aogOpenStaffCheckin(); },
    openStudent: function () { return window.aogOpenDailyCheckin(); },
    mine: function (sid) { return window.aogShowMyCheckins(sid); },
    studentLogs: function () { return studentStore(); },
    /* ⚠ EXPORTED SO NOBODY MAKES A THIRD COPY. SERIES already carries the
       second, with a comment saying it must stay identical to ARRIVAL /
       CONNECTION above it. The IEP evidence layer reads the words from
       here, so a rename in this module reaches that screen by itself. */
    scales: SERIES
  };
})();
