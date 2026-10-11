
/* ============================================================
   PRIVACY SCREEN + "YOUR DATA" CONTROLS
   Self-contained. Reuses existing storage keys + downloadCSV
   when available, with safe fallbacks. No network calls.
   ============================================================ */
(function(){
  var PV_RESULTS = (typeof STORAGE_KEY !== "undefined") ? STORAGE_KEY : "aogScreener.v2.results";
  var PV_FAMILY  = (typeof FAMILY_KEY  !== "undefined") ? FAMILY_KEY  : "aog.family.v1";
  var PV_DRAFT   = (typeof DRAFT_KEY   !== "undefined") ? DRAFT_KEY   : "aog.draft.v1";
  var PV_SNAP    = "aogMyResultsSnapshot";

  function isES(){ try{ return typeof lang !== "undefined" && lang === "es"; }catch(e){ return false; } }
  function readArr(k){ try{ var v = JSON.parse(localStorage.getItem(k) || "[]"); return Array.isArray(v) ? v : []; }catch(e){ return []; } }
  function readObj(k){ try{ return JSON.parse(localStorage.getItem(k) || "null"); }catch(e){ return null; } }

  function pvRecords(){
    if (typeof getLocalRecords === "function"){ try{ return getLocalRecords() || []; }catch(e){} }
    return readArr(PV_RESULTS);
  }
  function pvFamilyCount(){
    var f = readObj(PV_FAMILY);
    if (!f) return 0;
    if (Array.isArray(f)) return f.length;
    if (f.children && Array.isArray(f.children)) return f.children.length;
    if (f.roster && Array.isArray(f.roster)) return f.roster.length;
    if (typeof f === "object") return Object.keys(f).length;
    return 0;
  }
  function pvHasDraft(){ try{ var d = localStorage.getItem(PV_DRAFT); return d && d !== "null" && d !== "{}" ? 1 : 0; }catch(e){ return 0; } }

  window.privacyRefresh = function(){
    var a = document.getElementById("pvCountCheckins");
    var b = document.getElementById("pvCountFamily");
    var c = document.getElementById("pvCountDraft");
    if (a) a.textContent = pvRecords().length;
    if (b) b.textContent = pvFamilyCount();
    if (c) c.textContent = pvHasDraft();
    var done = document.getElementById("pvDone");
    if (done) done.style.display = "none";
  };

  var PV_CHECKIN_SCREENS = { "screen-checkin":1, "screen-adult":1, "screen-workplace":1 };

  window.openPrivacy = function(){
    /* .30fg — Privacy is an address now (#privacy), like every other screen. */
    try { if (typeof aogSetHash === "function") aogSetHash("privacy"); } catch (e) {}
    // remember where we came from, before we switch screens
    var active = document.querySelector(".screen.active");
    var from = active && active.id && active.id !== "screen-privacy" ? active.id : "screen-welcome";
    window._pvReturnScreen = from;
    // set the back-button label to match the destination
    var lbl = document.getElementById("pvBackLabel");
    if (lbl) lbl.setAttribute("data-i18n", PV_CHECKIN_SCREENS[from] ? "pv_back_checkin" : "ch_back");

    if (typeof showScreen === "function"){ try{ showScreen("screen-privacy"); }catch(e){} }
    else {
      document.querySelectorAll(".screen").forEach(function(x){ x.classList.remove("active"); });
      var p = document.getElementById("screen-privacy"); if (p) p.classList.add("active");
      try{ window.scrollTo({top:0, behavior:"smooth"}); }catch(e){}
    }
    try{ if (typeof applyLang === "function") applyLang(); }catch(e){}
    window.privacyRefresh();
  };

  window.privacyBack = function(){
    var dest = window._pvReturnScreen;
    if (dest && dest !== "screen-welcome" && document.getElementById(dest)){
      if (typeof showScreen === "function"){ try{ showScreen(dest); return; }catch(e){} }
      document.querySelectorAll(".screen").forEach(function(x){ x.classList.remove("active"); });
      var d = document.getElementById(dest); if (d) d.classList.add("active");
      try{ window.scrollTo({top:0, behavior:"smooth"}); }catch(e){}
      return;
    }
    if (typeof resetToStart === "function"){ try{ resetToStart(); return; }catch(e){} }
    if (typeof showScreen === "function"){ try{ showScreen("screen-welcome"); }catch(e){} }
  };

  function pvDownload(filename, text, mime){
    /* The byte-order mark is there so Excel opens the CSV in UTF-8. A BOM in
       front of JSON makes the file invalid to a strict parser — and the JSON
       export is now the only backup of the IEP data, so it has to be readable
       by anything that opens it. CSV keeps the BOM; JSON does not. 2026-08-27 */
    var isJson = /json/i.test(mime || "") || /\.json$/i.test(filename || "");
    var blob = new Blob([(isJson ? "" : "\ufeff") + text], { type: (mime || "text/plain") + ";charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* Settings, not data. The ONE list — the backup writes everything this
     pattern does not match, and the delete removes exactly the same set, so
     the two can never drift again. 2026-08-27. */
  var PV_KEEP = /^(aog\.a11y|aog\.theme|aog\.dash\.(role|mode)|aog\.ov\.|aog\.qs\.|aog\.esbanner|aog\.seenNudge|aog\.fv\.|aog\.internal|aog\.lang)/;

  window.privacyExportJSON = function(){
    /* ⚠ SYMMETRY RULE. This file must contain everything privacyDeleteAll()
       removes. It used to carry three stores — reflections, family, draft —
       while delete cleared every aog/grace key. So "consider downloading a
       backup first" pointed at a file with NO IEP goals, no IEP paperwork, no
       daily log and no student check-ins in it, and a case manager who forgot
       a four-digit code lost a caseload's progress monitoring having been told
       a copy survived. Both sides now read PV_KEEP: a store added tomorrow is
       backed up by default instead of silently missed.
       Values are copied verbatim; parsed where they are JSON so the file can
       be read by a person, kept as strings otherwise. */
    var device = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k) continue;
        if (!/^(aog|grace)/i.test(k) && k !== "aog_preferred_support") continue;
        if (PV_KEEP.test(k)) continue;
        var raw = localStorage.getItem(k);
        try { device[k] = JSON.parse(raw); } catch (e) { device[k] = raw; }
      }
    } catch (e) {}
    var payload = {
      exportedAt: new Date().toISOString(),
      note: "Architecture of Grace — everything this device holds, exported locally. This file was created on your computer and was not sent anywhere. `device` is a complete copy of every store, keyed exactly as the app stores it — including IEP goals (aog.iep.v1), IEP paperwork (aog.iepdocs.v1), the daily log (aog.daily.v1) and student check-ins (aog.checkin.student.v1). Keep it somewhere safe; deleting this device's data does not delete this file.",
      checkIns: pvRecords(),
      family: readObj(PV_FAMILY),
      unfinishedDraft: readObj(PV_DRAFT),
      device: device
    };
    pvDownload("ArchitectureOfGrace_my-data.json", JSON.stringify(payload, null, 2), "application/json");
  };

  window.privacyExportCSV = function(){
    var recs = pvRecords();
    if (!recs.length){ alert(isES() ? "No hay autorreflexiones guardados en este dispositivo." : "There are no saved self-reflections on this device."); return; }
    /* `tier` keeps the internal key so the CSV still lines up with the Sheet's
       own tier column. `band` is added beside it in the words a person should
       read — otherwise anyone opening this file sees "High Risk" next to a
       child's code, which is the one phrase this system does not use. */
    var headers = ["timestamp","context","population","grade","window","mode","language","composite","normComposite","domainA","domainB","domainC","tier","band","trustedAdultFlag","unsafeFlag","closingWord","reflections"];
    var rows = recs.map(function(r){
      r = r || {};
      var refl = Array.isArray(r.reflections) ? r.reflections.filter(function(x){ return x; }).join(" | ") : "";
      return headers.map(function(h){
        if (h === "reflections") return refl;
        if (h === "band") return (typeof tierLabel === "function" && r.tier) ? tierLabel(r.tier) : "";
        var v = r[h];
        return (v == null) ? "" : v;
      });
    });
    if (typeof downloadCSV === "function"){ try{ downloadCSV("ArchitectureOfGrace_my-data.csv", headers, rows); return; }catch(e){} }
    // fallback CSV writer
    var esc = function(v){ v = String(v==null?"":v); if(/^[=+\-@\t\r]/.test(v)) v="'"+v; return /[",\n]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v; };
    var csv = [headers.join(",")].concat(rows.map(function(row){ return row.map(esc).join(","); })).join("\n");
    pvDownload("ArchitectureOfGrace_my-data.csv", csv, "text/csv");
  };

  window.privacyDeleteAll = function(){
    var msg = isES()
      ? "¿Borrar de forma permanente TODOS los datos de Architecture of Grace de este dispositivo? Cada autorreflexión, registro, entrada familiar, nota y borrador — y cada meta del IEP, dato de progreso y documento de reunión, que se guardan solo aquí y no se sincronizan a ningún lado. Además desconecta esta computadora de tu Hoja, así que habrá que volver a escribir la contraseña de lectura. Los ajustes de pantalla y accesibilidad se conservan. Esto no se puede deshacer; descarga un respaldo primero — el archivo de respaldo ahora contiene todo. (Si las autorreflexiones se sincronizaron con una Hoja de la escuela, esa copia no se borra desde aquí — pídelo a tu escuela.)"
      : "Permanently delete ALL Architecture of Grace data on this device? Every self-reflection, check-in, daily log, family entry, note and draft — and every IEP goal, data point and piece of meeting paperwork, which are stored only here and are not synced anywhere. It also disconnects this computer from your Sheet, so the read passcode will need entering again. Display and accessibility settings stay. This cannot be undone; download a backup first — the backup file now contains all of it. (If self-reflections were synced to a school Sheet, that copy is not deleted from here — ask your school.)";
    if (!confirm(msg)) return;
    /* THIS USED TO BE A LIST OF FIVE KEYS, AND THAT IS WHY IT ROTTED.
       A button saying "delete everything" removed PV_RESULTS, PV_FAMILY, PV_DRAFT,
       PV_SNAP and aog_preferred_support -- the stores that existed in June 2026 --
       while every store added afterwards survived it: the daily log, the student's
       own check-ins INCLUDING their free-text note to an adult, the queue of unsent
       rows, rows pulled back from the school Sheet, IEP drafts, the clinical
       workspace, Talk-It-Out class lists holding real first names, follow-up marks,
       and the school's read passcode.

       A delete-LIST rots every time a feature is added. A keep-LIST does not:
       anything new is deleted by default, and a future store has to be named here
       explicitly to survive. KEEP IT THIS WAY. */
    /* aog.dash.role and aog.dash.mode are settings and survive. aog.dash.lock
       deliberately does NOT — clearing this device is the documented way back in
       for a teacher who has forgotten their code. */
    var KEEP = PV_KEEP;
    try {
      var doomed = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && /^(aog|grace)/i.test(k) && !KEEP.test(k)) doomed.push(k);
      }
      doomed.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
    } catch (e) {}
    /* Named explicitly: it does not carry the aog/grace prefix. */
    try { localStorage.removeItem("aog_preferred_support"); } catch (e) {}
    /* The sheet address and the read passcode go too -- the button says THIS
       DEVICE, and a disconnected computer is the honest end state. Clear the live
       globals as well, or this session keeps pulling until the page is reloaded. */
    try { if (typeof SCHOOL_SYNC_URL !== "undefined") { SCHOOL_SYNC_URL = ""; SCHOOL_SYNC_KEY = ""; } } catch (e) {}
    try { if (typeof REMOTE_RECORDS !== "undefined") REMOTE_RECORDS = []; } catch (e) {}
    // clear any in-memory snapshot/result the app may be holding
    try{ if (typeof liveResult !== "undefined") liveResult = false; }catch(e){}
    try{ window._lastResult = null; }catch(e){}
    try{ if (typeof refreshAdmin === "function") refreshAdmin(); }catch(e){}
    try{ if (typeof renderSyncStatus === "function") renderSyncStatus(); }catch(e){}
    window.privacyRefresh();
    var done = document.getElementById("pvDone");
    if (done){ done.textContent = isES() ? "Listo: se han borrado de este dispositivo todos los datos de autorreflexiones." : "Done — all self-reflection data on this device has been deleted."; done.style.display = "block"; }
  };

  /* Spanish strings for the new screen (English lives inline as the fallback). */
  try{
    if (typeof I18N_UI !== "undefined"){
      I18N_UI.pv_eyebrow    = {en:"Privacy & your data", es:"Privacidad y tus datos"};
      I18N_UI.pv_title      = {en:"Your privacy, in plain language", es:"Tu privacidad, en términos claros"};
      I18N_UI.pv_lede       = {en:"No account. No advertising or analytics trackers. Private by default: what you and your students make here stays on the device it was made on, and travels only to a Sheet the school itself connected — a finished assignment or page sends its one row there on its own, and everything else moves only when someone taps Send. Tap any section below to read more.", es:"Sin cuenta. Sin rastreadores publicitarios ni de an\u00e1lisis. Privado por defecto: lo que t\u00fa y tus estudiantes crean aqu\u00ed se queda en el dispositivo donde se hizo, y solo viaja a una Hoja que la propia escuela conect\u00f3 — una actividad o p\u00e1gina terminada env\u00eda ah\u00ed su \u00fanica fila por s\u00ed sola, y todo lo dem\u00e1s se mueve solo cuando alguien toca Enviar. Toca cualquier secci\u00f3n para leer m\u00e1s."};
      I18N_UI.pv_lede_old   = {en:"No account. No tracking. Private by default: your self-reflections stay on the device you took them on, and travel only when your school sets up a connected link — here is exactly what that means, with the controls to prove it.", es:"Sin cuenta. Sin rastreo. Tus autorreflexiones se quedan en el dispositivo donde los hiciste; aquí explicamos exactamente qué significa eso, con los controles para comprobarlo."};
      I18N_UI.pv_h1         = {en:"What we keep, and where", es:"Qué guardamos, y dónde"};
      I18N_UI.pv_p1         = {en:"Everything you make here is saved in this browser, on this one device: self-reflections (answers, follow-up intensities, written reflections), daily check-ins and exit slips, a teacher’s own daily-log notes, family entries and repair journals, saved calming strategies, practice-page results, Talk It Out class lists, IEP goals, data points and meeting paperwork, and a student’s This Is Me page. There is no account, no login, and no email needed to begin. We do not run a server that holds these records, and we do not receive a copy unless one of the exceptions below applies.", es:"Todo lo que creas aquí se guarda en este navegador, en este único dispositivo: autorreflexiones (respuestas, intensidades de seguimiento, reflexiones escritas), registros diarios y boletas de salida, las notas del registro diario de un docente, entradas familiares y diarios de reparación, estrategias de calma guardadas, resultados de páginas de práctica, listas de clase de Hablemos, metas del IEP, datos y documentos de reunión, y la página Así soy yo de un estudiante. No hay cuenta, ni inicio de sesión, ni correo para empezar. No tenemos un servidor que guarde estos registros, y no recibimos una copia salvo en las excepciones de abajo."};
      I18N_UI.pv_h2         = {en:"The only times anything leaves this device", es:"Las únicas veces que algo sale de este dispositivo"};
      I18N_UI.pv_p2         = {en:"We would rather tell you the exceptions than pretend there are none. Your responses leave this device only in these cases:", es:"Preferimos decirte las excepciones que fingir que no existen. Tus respuestas salen de este dispositivo solo en estos casos:"};
      I18N_UI.pv_x1_t       = {en:"A school turns on sync, or a teacher hands out a classroom link.", es:"Una escuela activa la sincronización, o un docente comparte un enlace de clase."};
      I18N_UI.pv_x1         = {en:"A completed self-reflection, check-in, exit slip or practice row is then also sent to the Google Sheet the link names. A school that has connected its own Sheet sends there, under its own control. A classroom link made on a device that has not connected a Sheet uses the site’s built-in destination — a Sheet run by Architecture of Grace, LLC for its own classes — and the Distribute panel says so on the link. That is the one way a response can reach us, and it is written on the link that carries it.", es:"Una autorreflexión, un registro, una boleta de salida o una fila de práctica completada se envía también a la Hoja de Google que nombra el enlace. Una escuela que conectó su propia Hoja envía allí, bajo su propio control. Un enlace de clase creado en un dispositivo que no conectó una Hoja usa el destino integrado del sitio — una Hoja que administra Architecture of Grace, LLC para sus propias clases del Distrito 61 — y el panel Distribuir lo dice en el enlace. Es la única forma en que una respuesta puede llegarnos, y está escrita en el enlace que la lleva."};
      I18N_UI.pv_x4_t       = {en:"You send us a pilot request or feedback.", es:"Nos envías una solicitud de piloto o comentarios."};
      I18N_UI.pv_x4         = {en:"Your name, e-mail and school go to our form handler (Netlify) so we can reply. Nothing else on this device rides along.", es:"Tu nombre, correo y escuela van a nuestro gestor de formularios (Netlify) para poder responderte. Nada más de este dispositivo viaja con ellos."};
      I18N_UI.pv_x5_t       = {en:"Typefaces.", es:"Tipograf\u00edas."};
      I18N_UI.pv_x5         = {en:"This app loads its fonts from Google Fonts, which sees that request the way any web page’s host does — no content, no answers. The practice pages load nothing from outside at all.", es:"Esta aplicación carga sus fuentes desde Google Fonts, que ve esa solicitud como cualquier servidor de una página web — sin contenido, sin respuestas. Las páginas de práctica no cargan nada externo."};
      I18N_UI.pv_x2_t       = {en:"Someone shared a self-reflection with you.", es:"Alguien te compartió una autorreflexión."};
      I18N_UI.pv_x2         = {en:"If a team or organization sent you an adult self-reflection and asked to follow up, your responses go to that team. You are told this on the screen, before you begin.", es:"Si un equipo u organización te envió una autorreflexión para adultos y pidió dar seguimiento, tus respuestas van a ese equipo. Se te informa en la pantalla, antes de comenzar."};
      I18N_UI.pv_x3_t       = {en:"You post to the community wall.", es:"Publicas en el muro de la comunidad."};
      I18N_UI.pv_x3         = {en:"If you choose to leave a comment on our public wall of experiences, that message is published; your name appears only if you type one. Your self-reflection answers are never part of this.", es:"Si decides dejar un comentario en nuestro muro público de experiencias, ese mensaje se publica; tu nombre aparece solo si lo escribes. Tus respuestas de la autorreflexión nunca forman parte de esto."};
      I18N_UI.pv_p2b        = {en:"Outside of those, no response is transmitted anywhere.", es:"Fuera de eso, ninguna respuesta se transmite a ningún lugar."};
      I18N_UI.pv_h3         = {en:"What we never do", es:"Lo que nunca hacemos"};
      I18N_UI.pv_n1         = {en:"No advertising trackers, and no third-party analytics following you.", es:"Sin rastreadores publicitarios ni análisis de terceros que te sigan."};
      I18N_UI.pv_n2         = {en:"No selling or sharing of your data — ever.", es:"Nunca vendemos ni compartimos tus datos."};
      I18N_UI.pv_n3         = {en:"No quiet profile built about you across visits.", es:"No se construye un perfil silencioso sobre ti entre visitas."};
      I18N_UI.pv_n4         = {en:"No manager, HR, or leadership dashboard ever sees an individual’s answers.", es:"Ningún panel de gerencia, recursos humanos o dirección ve las respuestas de una persona."};
      I18N_UI.pv_h4         = {en:"A straight answer about “secure”", es:"Una respuesta honesta sobre “seguro”"};
      I18N_UI.pv_p4a        = {en:"By default your answers stay on your device and are never transmitted — so there is nothing in transit for anyone to intercept. If your school has turned on sync, that one send goes encrypted (HTTPS) to the school's own Sheet, and nowhere else. The protection that matters most, then, is the device itself: anyone who can unlock this device and open this browser could open your saved self-reflections. The key that lets a device append a row to a connected Sheet is public by design and cannot read anything back: someone holding it could add a forged row, but never see, change or delete one. A school can rotate that key from its own Apps Script at any time.", es:"De forma predeterminada tus respuestas se quedan en tu dispositivo y nunca se transmiten — así que no hay nada en tránsito que alguien pueda interceptar. Si tu escuela activó la sincronización, ese único envío va cifrado (HTTPS) a la propia Hoja de la escuela, y a ningún otro lugar. La protección que más importa, entonces, es el dispositivo mismo: cualquiera que pueda desbloquear este dispositivo y abrir este navegador podría abrir tus autorreflexiones guardados. La clave que permite a un dispositivo agregar una fila a una Hoja conectada es pública por diseño y no puede leer nada: alguien que la tenga podría agregar una fila falsa, pero nunca ver, cambiar ni borrar una. Una escuela puede rotar esa clave desde su propio Apps Script cuando quiera."};
      I18N_UI.pv_p4b        = {en:"So use this on a device you trust — and on a shared or public computer, use the Delete button below when you are done. We say this plainly on purpose: a self-reflection only works when you can trust exactly what it does with what you tell it.", es:"Por eso, úsalo en un dispositivo de confianza — y en una computadora compartida o pública, usa el botón Borrar de abajo cuando termines. Lo decimos con claridad a propósito: una autorreflexión solo funciona cuando puedes confiar en exactamente lo que hace con lo que le cuentas."};
      I18N_UI.pv_h6         = {en:"Who can see what", es:"Quién puede ver qué"};
      I18N_UI.pv_w1_t       = {en:"A student", es:"Un estudiante"};
      I18N_UI.pv_w1         = {en:"sees only what is on their own device. Nothing on this site shows one student another student’s answers.", es:"solo ve lo que está en su propio dispositivo. Nada en este sitio muestra a un estudiante las respuestas de otro."};
      I18N_UI.pv_w2_t       = {en:"A teacher", es:"Un docente"};
      I18N_UI.pv_w2         = {en:"sees what arrived on their own device or in the Sheet they connected — and never a roster of who is missing, because the site keeps none.", es:"ve lo que llegó a su propio dispositivo o a la Hoja que conectó — y nunca una lista de quién falta, porque el sitio no guarda ninguna."};
      I18N_UI.pv_w3_t       = {en:"A colleague or specialist", es:"Un colega o especialista"};
      I18N_UI.pv_w3         = {en:"sees only what a student or teacher sent to a link they were given.", es:"solo ve lo que un estudiante o docente envió a un enlace que se le dio."};
      I18N_UI.pv_w4_t       = {en:"A family", es:"Una familia"};
      I18N_UI.pv_w4         = {en:"sees what the family made at home. School records do not travel home through this app; a Bring This Home note is written for the family on purpose and carries no scores.", es:"ve lo que la familia hizo en casa. Los registros escolares no viajan a casa por esta aplicación; una nota de Llévalo a casa se escribe para la familia a propósito y no lleva puntajes."};
      I18N_UI.pv_w5_t       = {en:"An administrator", es:"Un administrador"};
      I18N_UI.pv_w5         = {en:"sees class- and school-level trends, never an individual’s answers.", es:"ve tendencias por clase y escuela, nunca las respuestas de una persona."};
      I18N_UI.pv_w6_t       = {en:"Architecture of Grace, LLC", es:"Architecture of Grace, LLC"};
      I18N_UI.pv_w6         = {en:"sees nothing, except rows that arrive at the built-in destination described above and messages you post to the public wall.", es:"no ve nada, salvo las filas que llegan al destino integrado descrito arriba y los mensajes que publicas en el muro público."};
      I18N_UI.pv_h5         = {en:"In a school setting", es:"En un entorno escolar"};
      I18N_UI.pv_p5         = {en:"When this is used with students, treat each response as part of the student record under FERPA, and limit access accordingly. And remember: if anything in a response or a follow-up conversation suggests abuse, neglect, or imminent self-harm, the self-reflection is not the final word — follow your mandatory reporting protocol.", es:"Cuando se usa con estudiantes, trata cada respuesta como parte del expediente del estudiante bajo FERPA y limita el acceso en consecuencia. Y recuerda: si algo en una respuesta o en una conversación de seguimiento sugiere abuso, negligencia o riesgo inminente de autolesión, la autorreflexión no es la última palabra — sigue tu protocolo de reporte obligatorio."};
      I18N_UI.pv_panel_h    = {en:"Your data on this device", es:"Tus datos en este dispositivo"};
      I18N_UI.pv_panel_sub  = {en:"Read live from this browser, right now. Nothing here is sent anywhere when you use these controls.", es:"Leído en vivo desde este navegador, ahora mismo. Nada de esto se envía a ningún lugar cuando usas estos controles."};
      I18N_UI.pv_stat_checkins = {en:"Saved self-reflections", es:"Autorreflexiones guardadas"};
      I18N_UI.pv_stat_family   = {en:"Family profiles", es:"Perfiles familiares"};
      I18N_UI.pv_stat_draft    = {en:"Unfinished draft", es:"Borrador sin terminar"};
      I18N_UI.pv_btn_json   = {en:"Download a full backup (.json)", es:"Descargar un respaldo completo (.json)"};
      I18N_UI.pv_btn_csv    = {en:"Export as a spreadsheet (.csv)", es:"Exportar como hoja de cálculo (.csv)"};
      I18N_UI.pv_btn_delete = {en:"Delete everything on this device", es:"Borrar todo en este dispositivo"};
      I18N_UI.pv_done       = {en:"Done — every Architecture of Grace record on this device has been deleted, and this computer is no longer connected to a school Sheet.", es:"Listo: se han borrado de este dispositivo todos los datos de autorreflexiones."};
      I18N_UI.pv_note       = {en:"A backup is a plain file saved to this device’s downloads — it is your copy to keep, not sent to us. Deleting is permanent and cannot be undone.", es:"Un respaldo es un archivo sencillo que se guarda en las descargas de este dispositivo — es tu copia para conservar, no se nos envía. Borrar es permanente y no se puede deshacer."};
      I18N_UI.pv_close      = {en:"A result is a flag for a conversation, not a diagnosis.", es:"Un resultado es una señal para una conversación, no un diagnóstico."};
      I18N_UI.pv_foot_link  = {en:"Privacy & your data", es:"Privacidad y tus datos"};
      I18N_UI.pv_back_checkin = {en:"Back to the self-reflection", es:"Volver a la autorreflexión"};
    }
  }catch(e){}
})();
